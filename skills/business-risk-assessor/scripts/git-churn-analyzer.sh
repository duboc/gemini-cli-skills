#!/bin/sh
# git-churn-analyzer.sh — Analyze Git history to extract per-file churn metrics
#
# Usage: git-churn-analyzer.sh [OPTIONS]
#
# Options:
#   -r, --repo PATH       Path to git repository (default: current directory)
#   -m, --months MONTHS   Lookback window in months (default: 12)
#   -n, --top N           Show top N files by churn score (default: 50)
#   -h, --help            Show this help message
#
# Output: Tab-separated table sorted by churn score (descending)
# Columns: file, total_commits, bug_fix_commits, bug_fix_pct, authors, churn_score
#
# Churn Score = (total_commits * 0.4) + (bug_fix_commits * 0.3) + ((1/authors) * 10 * 0.3)
# Higher score = higher risk
#
# POSIX-compatible: works on macOS and Linux

set -eu

# Defaults
REPO_PATH="."
MONTHS=12
TOP_N=50

# Bug-fix pattern: matches common bug-fix indicators in commit messages
# Case-insensitive matching handled by grep -i
BUG_PATTERN="fix|bug|hotfix|patch|revert"

usage() {
    printf "Usage: %s [OPTIONS]\n\n" "$(basename "$0")"
    printf "Analyze Git history to extract per-file churn metrics.\n\n"
    printf "Options:\n"
    printf "  -r, --repo PATH       Path to git repository (default: current directory)\n"
    printf "  -m, --months MONTHS   Lookback window in months (default: 12)\n"
    printf "  -n, --top N           Show top N files by churn score (default: 50)\n"
    printf "  -h, --help            Show this help message\n\n"
    printf "Output: Tab-separated table sorted by churn score (descending)\n"
    printf "Columns: file, total_commits, bug_fix_commits, bug_fix_pct, authors, churn_score\n"
}

# Parse arguments
while [ $# -gt 0 ]; do
    case "$1" in
        -r|--repo)
            REPO_PATH="$2"
            shift 2
            ;;
        -m|--months)
            MONTHS="$2"
            shift 2
            ;;
        -n|--top)
            TOP_N="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            printf "Error: Unknown option: %s\n" "$1" >&2
            usage >&2
            exit 1
            ;;
    esac
done

# Validate repo path
if [ ! -d "$REPO_PATH/.git" ] && ! git -C "$REPO_PATH" rev-parse --git-dir >/dev/null 2>&1; then
    printf "Error: %s is not a git repository\n" "$REPO_PATH" >&2
    exit 1
fi

# Calculate the since date
# Use portable date calculation
if date --version >/dev/null 2>&1; then
    # GNU date (Linux)
    SINCE_DATE=$(date -d "${MONTHS} months ago" +%Y-%m-%d)
else
    # BSD date (macOS)
    DAYS=$((MONTHS * 30))
    SINCE_DATE=$(date -v-"${DAYS}"d +%Y-%m-%d)
fi

# Create temporary files for processing
TMP_DIR=$(mktemp -d)
ALL_COMMITS_FILE="${TMP_DIR}/all_commits.txt"
BUG_COMMITS_FILE="${TMP_DIR}/bug_commits.txt"
AUTHORS_FILE="${TMP_DIR}/authors.txt"
RESULTS_FILE="${TMP_DIR}/results.txt"

# Cleanup on exit
cleanup() {
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT

printf "Analyzing git history in: %s\n" "$REPO_PATH" >&2
printf "Time window: %s to present (%d months)\n" "$SINCE_DATE" "$MONTHS" >&2
printf "Processing...\n" >&2

# Step 1: Get all commits with their changed files since the date
git -C "$REPO_PATH" log --since="$SINCE_DATE" --pretty=format:"%H %s" --name-only \
    | awk '
        /^[a-f0-9]{40} / {
            commit = $1
            sub(/^[a-f0-9]+ /, "")
            message = $0
            next
        }
        /^$/ { next }
        {
            if (commit != "") {
                print commit "\t" message "\t" $0
            }
        }
    ' > "$ALL_COMMITS_FILE"

if [ ! -s "$ALL_COMMITS_FILE" ]; then
    printf "No commits found in the specified time window.\n" >&2
    exit 0
fi

# Step 2: Extract unique files and calculate metrics
# Get all unique files from the commit data
awk -F'\t' '{ print $3 }' "$ALL_COMMITS_FILE" | sort -u | while read -r filepath; do
    # Skip empty lines and binary files
    [ -z "$filepath" ] && continue

    # Total commits touching this file
    total_commits=$(grep -cF "	${filepath}" "$ALL_COMMITS_FILE" 2>/dev/null || echo "0")

    # Skip files with 0 commits (shouldn't happen, but safety check)
    [ "$total_commits" -eq 0 ] && continue

    # Bug-fix commits touching this file
    bug_commits=$(grep -F "	${filepath}" "$ALL_COMMITS_FILE" \
        | awk -F'\t' '{ print $2 }' \
        | grep -icE "$BUG_PATTERN" 2>/dev/null || echo "0")

    # Bug-fix percentage
    if [ "$total_commits" -gt 0 ]; then
        bug_pct=$((bug_commits * 100 / total_commits))
    else
        bug_pct=0
    fi

    # Distinct authors for this file
    authors=$(git -C "$REPO_PATH" log --since="$SINCE_DATE" --pretty=format:"%ae" -- "$filepath" \
        | sort -u | wc -l | tr -d ' ')

    [ "$authors" -eq 0 ] && authors=1

    # Churn score calculation
    # score = (total_commits * 0.4) + (bug_commits * 0.3) + ((1/authors) * 10 * 0.3)
    # Using integer arithmetic scaled by 100 for precision
    commit_component=$((total_commits * 40))
    bug_component=$((bug_commits * 30))
    author_component=$((1000 / authors * 3))
    score_x100=$((commit_component + bug_component + author_component))

    # Format score with 2 decimal places
    score_int=$((score_x100 / 100))
    score_dec=$((score_x100 % 100))

    printf "%s\t%d\t%d\t%d%%\t%d\t%d.%02d\n" \
        "$filepath" "$total_commits" "$bug_commits" "$bug_pct" "$authors" "$score_int" "$score_dec"

done > "$RESULTS_FILE"

if [ ! -s "$RESULTS_FILE" ]; then
    printf "No file-level data could be extracted.\n" >&2
    exit 0
fi

# Step 3: Sort by churn score (column 6) descending and output
total_files=$(wc -l < "$RESULTS_FILE" | tr -d ' ')
printf "\nResults: %d files analyzed\n\n" "$total_files" >&2

# Print header
printf "FILE\tCOMMITS\tBUG_FIXES\tBUG_FIX_PCT\tAUTHORS\tCHURN_SCORE\n"

# Sort by churn score (6th field) descending, take top N
sort -t'	' -k6 -rn "$RESULTS_FILE" | head -n "$TOP_N"

printf "\nDone. Showing top %d of %d files by churn score.\n" "$TOP_N" "$total_files" >&2
