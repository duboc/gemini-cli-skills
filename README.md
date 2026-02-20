# Gemini CLI Skills

A collection of reusable skills for [Gemini CLI](https://github.com/google-gemini/gemini-cli). Each skill is self-contained and can be installed independently.

## Available Skills

| Skill | Description | Install |
|-------|-------------|---------|
| [software-troubleshooter](skills/software-troubleshooter/) | Structured code inspection and troubleshooting with diagnostic reports | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- software-troubleshooter` |
| [adk-developer](skills/adk-developer/) | Build single-agent and multi-agent systems with Google's ADK (Python, Java, Go, TypeScript) | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- adk-developer` |
| [agent-engine-deploy](skills/agent-engine-deploy/) | Deploy, manage, and query ADK agents on Vertex AI Agent Engine | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- agent-engine-deploy` |
| [agent-engine-sessions-memory](skills/agent-engine-sessions-memory/) | Manage sessions and long-term memory for agents on Vertex AI Agent Engine | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- agent-engine-sessions-memory` |
| [agent-engine-ops](skills/agent-engine-ops/) | Monitor, trace, secure, and evaluate agents on Vertex AI Agent Engine | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- agent-engine-ops` |
| [zen-presenter](skills/zen-presenter/) | Generate MARP presentation decks following Presentation Zen principles with interactive design consultation and PowerPoint export via HTML | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- zen-presenter` |
| [marp-to-slides](skills/marp-to-slides/) | Convert MARP Markdown presentations to Google Slides with Google brand colors and Material Design conventions | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- marp-to-slides` |
| [ai-studio-architect](skills/ai-studio-architect/) | Convert AI Studio Build mode prototypes to production on GCP with auto-generated infrastructure scripts | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- ai-studio-architect` |
| [clarity-presenter](skills/clarity-presenter/) | Generate MARP decks using SCQA narrative + assertion-evidence design with dual-perspective slides and PowerPoint export via HTML | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- clarity-presenter` |
| [developer-growth-analysis](skills/developer-growth-analysis/) | Analyze Gemini CLI session history to surface development patterns, friction points, and growth opportunities with curated resources | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- developer-growth-analysis` |
| [google-ads-funnel](skills/google-ads-funnel/) | Funnel-as-Code workflows for Google Ads account audits, spend analysis, creative testing, and conversion diagnostics via the Ads API | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- google-ads-funnel` |
| [using-git-worktrees](skills/using-git-worktrees/) | Create isolated git worktrees with smart directory selection, gitignore safety checks, dependency setup, and baseline test verification | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- using-git-worktrees` |
| [webapp-testing](skills/webapp-testing/) | Toolkit for testing local web applications using Playwright with server lifecycle management, screenshots, and console log capture | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- webapp-testing` |
| [writing-plans](skills/writing-plans/) | Generate detailed TDD implementation plans with atomic tasks, exact file paths, and complete code before writing any code | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- writing-plans` |

## Installation

### Method 1: Gemini CLI native install

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/<skill-name>
```

Example:

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/software-troubleshooter
```

### Method 2: One-liner with curl

The install script downloads only the requested skill from GitHub (no git clone needed).

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- <skill-name>
```

By default, skills install to the **workspace** scope (`.gemini/skills/<name>/` in your current directory). To install for your user profile instead:

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- <skill-name> --scope user
```

### Method 3: Manual download

1. Download or clone this repository.
2. Copy the desired skill folder into your Gemini skills directory:
   ```bash
   cp -r skills/software-troubleshooter ~/.gemini/skills/software-troubleshooter
   ```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on creating and submitting new skills.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
