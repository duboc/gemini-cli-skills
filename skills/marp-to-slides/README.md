# MARP to Google Slides

A Gemini CLI skill for converting MARP Markdown presentations into Google Slides with Google's official brand color palette and Material Design conventions.

## What It Does

This skill takes an existing MARP Markdown slide deck and creates a polished Google Slides presentation that follows Google's visual identity. It handles:

1. **MARP parsing** — Reads MARP Markdown files and extracts slides, titles, body text, background images, and directives.
2. **Style consultation** — Asks about color theme (Classic, Dark, Multicolor, Neutral), layout style (Full-bleed, Card, Split, Title-focused), and typography pairing.
3. **Google brand mapping** — Maps MARP styling to Google brand colors (#4285F4, #EA4335, #FBBC04, #34A853) and Google Sans / Roboto typography.
4. **Slides creation** — Creates a Google Slides presentation via the Slides API with proper styling, backgrounds, and text formatting.
5. **Verification** — Uses the Google Workspace extension to confirm the result.

## When Does It Activate?

The skill activates when you ask Gemini to convert MARP presentations to Google Slides.

| Trigger | Example |
|---------|---------|
| Convert MARP to Slides | "Convert my MARP deck to Google Slides" |
| Create Google Slides from markdown | "Create Google Slides from zen-slides.md" |
| Apply Google styling | "Take this MARP file and make it a Google Slides presentation with Google colors" |
| MARP to Google | "Turn my marp presentation into a Google Slide deck" |

## Topics Covered

| Area | Details |
|------|---------|
| **MARP parsing** | Frontmatter extraction, slide splitting, image directive parsing, text cleanup |
| **Google brand** | Brand colors (Blue, Red, Yellow, Green), neutral palette, dark theme variants |
| **Material Design** | Typography scale, layout grid, elevation, shape conventions |
| **Color themes** | Google Classic, Google Dark, Google Multicolor, Google Neutral |
| **Layout styles** | Full-bleed, Card, Split, Title-focused |
| **Typography** | Google Sans + Roboto, Google Sans only, Roboto + Roboto Slab |
| **Google Slides API** | Presentation creation, batch updates, text styling, background images |

## Prerequisites

| Requirement | How to Install |
|-------------|----------------|
| **Google Workspace extension** | `gemini extensions install https://github.com/gemini-cli-extensions/workspace` |
| **Python 3.8+** | [python.org](https://www.python.org/downloads/) |
| **google-api-python-client** | `pip install google-api-python-client google-auth-oauthlib` |
| **OAuth credentials** | See [Authentication Setup](#authentication-setup) below |

### Authentication Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create a project (or select an existing one).
3. Enable the **Google Slides API** and **Google Drive API**.
4. Create an **OAuth 2.0 Client ID** (application type: Desktop).
5. Download the credentials JSON file.
6. Save it as `~/.marp-to-slides/credentials.json`.
7. On first run, a browser window will open for OAuth consent.

## Installation

### Option A: Gemini CLI native

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/marp-to-slides
```

### Option B: One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- marp-to-slides
```

For user-scope installation (available across all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- marp-to-slides --scope user
```

### Option C: Manual

```bash
cp -r skills/marp-to-slides ~/.gemini/skills/marp-to-slides
```

## Usage Examples

Once installed, the skill activates when you ask Gemini to convert MARP files.

### Basic conversion

```
Convert zen-slides.md to Google Slides.
```

### With style preferences

```
Convert my MARP presentation at ./deck.md to Google Slides.
Use the Google Dark theme with split layout and Google Sans typography.
```

### Convert and verify

```
Take the MARP file cloud-architecture-zen.md, convert it to Google Slides
with Google's multicolor theme, and show me a thumbnail of the first slide.
```

### Using with the zen-presenter skill

```
First, create a Zen presentation about Kubernetes best practices.
Then convert it to Google Slides with the Google Classic theme.
```

### Quick conversion with defaults

```
Turn my-talk.md into Google Slides. You decide the styling.
```

## Included References

| File | Description |
|------|-------------|
| **google-brand-guide.md** | Complete Google brand color palette, typography scale, Material Design conventions, and theme specifications |
| **marp-parsing-guide.md** | Step-by-step guide for parsing MARP Markdown into structured JSON, including regex patterns and edge cases |

## Included Scripts

| File | Description |
|------|-------------|
| **marp_to_slides.py** | Python script that creates Google Slides presentations from parsed MARP data via the Google Slides API |

### Script Usage

```bash
# From a MARP markdown file
python3 scripts/marp_to_slides.py --marp deck.md --theme google-classic --layout full-bleed

# From pre-parsed JSON
python3 scripts/marp_to_slides.py --input slides.json --theme google-dark --layout split

# All options
python3 scripts/marp_to_slides.py \
    --marp deck.md \
    --theme google-multicolor \
    --layout card \
    --fonts google-sans-only \
    --title "My Presentation" \
    --output-json debug.json
```

### Script Options

| Flag | Values | Default | Description |
|------|--------|---------|-------------|
| `--marp` | file path | — | Path to MARP Markdown file |
| `--input` | file path | — | Path to pre-parsed JSON file |
| `--theme` | `google-classic`, `google-dark`, `google-multicolor`, `google-neutral` | `google-classic` | Color theme |
| `--layout` | `full-bleed`, `card`, `split`, `title-focused` | `full-bleed` | Layout style |
| `--fonts` | `google-sans-roboto`, `google-sans-only`, `roboto-slab` | `google-sans-roboto` | Font pairing |
| `--title` | string | from MARP | Override presentation title |
| `--output-json` | file path | — | Save parsed data for debugging |
