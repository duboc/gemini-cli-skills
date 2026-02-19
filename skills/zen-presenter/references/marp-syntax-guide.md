# MARP Syntax Guide

Quick reference for MARP Markdown syntax used in Zen Presenter decks.

## Frontmatter Directive

Every MARP deck starts with a YAML frontmatter block:

```markdown
---
marp: true
theme: uncover
class: lead
color: white
backgroundColor: black
---
```

### Available Themes

| Theme | Description | Best For |
|-------|-------------|----------|
| `default` | Clean, neutral styling | General purpose |
| `uncover` | Bold, full-bleed image support | Zen presentations (recommended) |
| `gaia` | Modern, colorful | Playful or vibrant decks |

### Global Directives

| Directive | Purpose | Example |
|-----------|---------|---------|
| `marp: true` | Enable MARP processing | Required in every deck |
| `theme` | Set the slide theme | `theme: uncover` |
| `class` | Set default slide class | `class: lead` |
| `color` | Set default text color | `color: white` |
| `backgroundColor` | Set default background | `backgroundColor: #000` |
| `paginate` | Show slide numbers | `paginate: false` (default for Zen) |
| `header` | Set header text | Avoid for Zen decks |
| `footer` | Set footer text | Avoid for Zen decks |

## Slide Separation

Slides are separated by `---` on its own line:

```markdown
---

# First Slide

---

# Second Slide

---
```

## Background Images

### Full-bleed Background

```markdown
![bg](https://source.unsplash.com/featured/?mountain)
```

### With Brightness Filter

```markdown
![bg brightness:0.3](https://source.unsplash.com/featured/?ocean)
```

### With Blur

```markdown
![bg blur:3px](https://source.unsplash.com/featured/?forest)
```

### Combined Filters

```markdown
![bg brightness:0.3 blur:2px](https://source.unsplash.com/featured/?city)
```

### Background Sizing

| Syntax | Effect |
|--------|--------|
| `![bg](url)` | Cover (fills slide, may crop) |
| `![bg contain](url)` | Fit within slide |
| `![bg fit](url)` | Scale to fit |
| `![bg auto](url)` | Original size |

### Background Position

```markdown
![bg right](url)    <!-- Image on right half -->
![bg left](url)     <!-- Image on left half -->
![bg right:40%](url) <!-- Image takes 40% on right -->
```

### Multiple Backgrounds

```markdown
![bg](url1)
![bg](url2)
```

This creates a split layout with images side by side.

## Image Filters Reference

| Filter | Values | Effect |
|--------|--------|--------|
| `brightness` | `0.0`–`1.0` | Darken image (lower = darker) |
| `blur` | `1px`–`20px` | Blur the image |
| `contrast` | `0.0`–`2.0` | Adjust contrast |
| `grayscale` | `0.0`–`1.0` | Convert to grayscale |
| `opacity` | `0.0`–`1.0` | Adjust transparency |
| `sepia` | `0.0`–`1.0` | Apply sepia tone |

## Text Formatting

### Heading Levels for Slides

```markdown
# Large Impact Text        <!-- Use for main statements -->
## Secondary Text           <!-- Use for supporting phrases -->
### Smaller Accent Text     <!-- Use sparingly -->
```

### Emphasis

```markdown
**Bold** for key words
*Italic* for subtle emphasis
```

### Text Alignment

Per-slide class directives:

```markdown
<!-- _class: lead -->     <!-- Centered text (recommended for Zen) -->
<!-- _class: invert -->   <!-- Inverted colors -->
```

### Custom Positioning with HTML

For precise control (use sparingly):

```markdown
<div style="text-align: center; margin-top: 40%;">

# Your Text Here

</div>
```

## Per-Slide Directives

Override global settings for individual slides using HTML comments:

```markdown
<!-- _backgroundColor: #1a1a2e -->
<!-- _color: #e94560 -->
<!-- _class: lead -->

# This slide has custom colors
```

## Unsplash Source URL Patterns

### Featured Photos by Keyword

```
https://source.unsplash.com/featured/?KEYWORD
https://source.unsplash.com/featured/?KEYWORD1,KEYWORD2
```

### Specific Dimensions

```
https://source.unsplash.com/1920x1080/?KEYWORD
```

### Random Photo by Keyword

```
https://source.unsplash.com/random/?KEYWORD
```

## Export Commands

| Command | Output |
|---------|--------|
| `marp deck.md` | HTML file |
| `marp deck.md --pdf` | PDF file |
| `marp deck.md --pptx` | PowerPoint file |
| `marp deck.md --html` | HTML with inline assets |
| `marp deck.md --preview` | Open in browser |

## MARP CLI Installation

```bash
npm install -g @marp-team/marp-cli
```

Or use npx without installing:

```bash
npx @marp-team/marp-cli deck.md --html
```
