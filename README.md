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
