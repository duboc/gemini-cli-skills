# Zen Presenter

A Gemini CLI skill for generating MARP presentation decks that follow the **Presentation Zen** philosophy — minimal text, high visual impact, and storytelling-driven design.

## What It Does

This skill transforms any topic into a visually striking slide deck by applying Garr Reynolds' Presentation Zen principles. It guides Gemini through:

1. **Topic discovery** — Captures the subject, audience, and core takeaway.
2. **Design consultation** — Asks about mood, typography, imagery, and color preferences before generating anything.
3. **Story arc planning** — Structures the deck as a narrative: hook, tension, exploration, climax, resolution.
4. **Zen slide generation** — Produces MARP Markdown with full-bleed Unsplash backgrounds, maximum 10 words per slide, and zero bullet points.
5. **Export guidance** — Provides instructions for viewing in VS Code, HTML, or PDF.

## When Does It Activate?

The skill activates when you ask Gemini to create presentations, slides, or decks. Keywords include:

| Trigger | Example |
|---------|---------|
| Create a presentation | "Create a presentation about cloud architecture" |
| Generate slides | "Generate slides for my team meeting on observability" |
| Build a deck | "Build a MARP deck about Kubernetes best practices" |
| Zen presentation | "Make a Zen-style presentation about leadership" |
| MARP slides | "Create MARP slides about AI safety" |

## Topics Covered

| Area | Details |
|------|---------|
| **Presentation Zen** | Restraint (Kanso), Naturalness (Shizen), Emptiness (Ma), signal-to-noise ratio |
| **MARP Markdown** | Frontmatter directives, background images, filters, themes, export commands |
| **Visual Design** | Mood presets, typography styles, color schemes, image metaphor selection |
| **Story Structure** | Narrative arcs, audience adaptation, hook-tension-climax-resolution |
| **Theme Presets** | Keynote Zen, Corporate Bold, Warm Storyteller, Clean Minimalist, Tech Neon, Earth & Organic, Playful Creative |

## Installation

### Option A: Gemini CLI native

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/zen-presenter
```

### Option B: One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- zen-presenter
```

For user-scope installation (available across all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- zen-presenter --scope user
```

### Option C: Manual

```bash
cp -r skills/zen-presenter ~/.gemini/skills/zen-presenter
```

## Usage Examples

Once installed, the skill activates when you ask Gemini to create presentations.

### Basic deck generation

```
Create a presentation about microservices architecture for a developer conference.
```

### With audience context

```
I need a Zen-style presentation about data privacy for an executive audience.
The one takeaway should be: "Privacy is a competitive advantage, not a cost."
```

### Specifying visual preferences

```
Generate MARP slides about sustainable engineering. I want a calm mood,
nature imagery, and white text on dark backgrounds. Around 8 slides.
```

### Quick deck with defaults

```
Make a quick Zen presentation about why Kubernetes matters. You decide the look and feel.
```

### Standalone deck for sharing

```
Create a presentation about our Q3 roadmap that will be shared as a PDF,
not presented live. It needs to be self-explanatory.
```

## Included References

| File | Description |
|------|-------------|
| **marp-syntax-guide.md** | Complete MARP Markdown syntax reference — frontmatter, background images, filters, themes, export commands |
| **zen-design-principles.md** | Presentation Zen philosophy — restraint, naturalness, emptiness, visual metaphor guide, story arc structure |
| **visual-themes.md** | Seven pre-defined visual theme presets with frontmatter, image keywords, and styling attributes |

## Included Assets

| File | Description |
|------|-------------|
| **deck-template.md** | A starter MARP template following Zen principles — 7 slides with story arc structure |
