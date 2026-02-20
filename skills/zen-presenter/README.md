# Zen Presenter

A Gemini CLI skill for generating MARP presentation decks that follow the **Presentation Zen** philosophy — minimal text, high visual impact, and storytelling-driven design. Outputs MARP Markdown, HTML slides, and PowerPoint.

## What It Does

This skill transforms any topic into a visually striking slide deck by applying Garr Reynolds' Presentation Zen principles. It guides Gemini through:

1. **Topic discovery** — Captures the subject, audience, and core takeaway.
2. **Design consultation** — Asks about theme, background images (optional), mood, and typography preferences before generating anything.
3. **Story arc planning** — Structures the deck as a narrative: hook, tension, exploration, climax, resolution.
4. **Zen slide generation** — Produces MARP Markdown with maximum 10 words per slide, zero bullet points, and either full-bleed Unsplash backgrounds or clean theme-based design.
5. **HTML slide conversion** — Converts each MARP slide into a standalone HTML file with proper dimensions and styling for PowerPoint conversion.
6. **PowerPoint generation** — Uses `html2pptx` to convert HTML slides into a `.pptx` file with accurate positioning, shapes, and formatting.
7. **Export guidance** — Provides instructions for all output formats: MARP Markdown, HTML, PowerPoint, and PDF.

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
| **MARP Markdown** | Frontmatter directives, background images, filters, themes, custom themes, export commands |
| **Visual Design** | Mood presets, typography styles, color schemes, image metaphor selection, slide type classes |
| **Story Structure** | Narrative arcs, audience adaptation, hook-tension-climax-resolution |
| **Theme Presets** | Google Cloud (default), Keynote Zen, Corporate Bold, Warm Storyteller, Clean Minimalist, Tech Neon, Earth & Organic, Playful Creative |
| **Background Images** | Optional — user chooses whether to use full-bleed Unsplash images or clean theme-based design |

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

### Clean design (no background images)

```
Generate slides about cloud-native architecture using the Google Cloud theme,
no background images. Professional mood, around 8 slides.
```

### With background images

```
Create a presentation about sustainable engineering with full-bleed nature
images, calm mood, and white text on dark backgrounds. Around 8 slides.
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

## Custom Theme: Google Cloud

The skill includes a custom Marp CSS theme (`gcloud-theme.css`) styled after the Google Cloud visual identity. Features:

- **Inter / Google Sans** font family
- **Google color palette** (blue, red, yellow, green)
- **Slide type classes** for visual variety without images: `title`, `section`, `lead`, `stats`, `speaker`, `quote`, `invert`, `closing`
- **Google gradient bar** on title and closing slides
- Clean, professional look suitable for most audiences

### Setting up the custom theme in VS Code

1. Copy `gcloud-theme.css` to your workspace
2. Open workspace settings (F1 → "Preferences: Open Workspace Settings")
3. Search "Marp: Themes" and add the path `./gcloud-theme.css`
4. Use `theme: gcloud` in your Markdown frontmatter

### Using with Marp CLI

```bash
marp slides.md --html --theme ./gcloud-theme.css
marp slides.md --pdf --theme ./gcloud-theme.css
```

## PowerPoint Output

The skill automatically generates a `.pptx` file alongside the MARP Markdown. The pipeline:

1. Each MARP slide is converted to a standalone HTML file (`slides/slide-NN.html`)
2. The `html2pptx` library renders each HTML file and converts it to a PowerPoint slide
3. A `generate-pptx.js` script is saved so you can regenerate the PowerPoint after editing

**Requirements for PowerPoint generation** (must be globally installed):
- `pptxgenjs`
- `playwright`
- `sharp`

```bash
npm install -g pptxgenjs playwright sharp
```

## Included References

| File | Description |
|------|-------------|
| **marp-syntax-guide.md** | Complete MARP Markdown syntax reference — frontmatter, background images, filters, themes, custom themes, export commands |
| **zen-design-principles.md** | Presentation Zen philosophy — restraint, naturalness, emptiness, visual metaphor guide, story arc structure |
| **visual-themes.md** | Eight pre-defined visual theme presets including Google Cloud default |
| **html2pptx-guide.md** | HTML-to-PowerPoint conversion rules — layout dimensions, supported elements, critical text rules, shape styling, and PptxGenJS API reference |

## Included Assets

| File | Description |
|------|-------------|
| **gcloud-theme.css** | Custom Marp CSS theme with Google Cloud styling and slide type classes |
| **deck-template.md** | Starter template using the gcloud theme (clean design, no images) |
| **deck-template-images.md** | Starter template with full-bleed Unsplash background images |
