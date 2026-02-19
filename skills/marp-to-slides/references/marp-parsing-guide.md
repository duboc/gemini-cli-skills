# MARP Parsing Guide

How to parse MARP Markdown files into structured slide data for conversion to Google Slides.

## MARP File Structure

A MARP file has two parts: **frontmatter** (YAML metadata) and **slides** (markdown content separated by `---`).

```
┌─────────────────────────┐
│ ---                     │  ← Frontmatter start
│ marp: true              │
│ theme: uncover          │
│ class: lead             │
│ color: white            │
│ ---                     │  ← Frontmatter end
│                         │
│ ![bg brightness:0.3]()  │  ← Slide 1
│ # Title                 │
│                         │
│ ---                     │  ← Slide separator
│                         │
│ ![bg brightness:0.4]()  │  ← Slide 2
│ # Another Title         │
│ Body text here          │
│                         │
│ ---                     │  ← Slide separator
│ ...                     │
└─────────────────────────┘
```

## Parsing Steps

### Step 1: Extract Frontmatter

Match the YAML block between the first pair of `---` markers:

```
Pattern: ^---\s*\n(.*?)\n---\s*\n
Flags:   DOTALL (. matches newlines)
```

Parse each line as `key: value`. Common fields:

| Key | Type | Description |
|-----|------|-------------|
| `marp` | string | Must be `"true"` for valid MARP |
| `theme` | string | Theme name: `default`, `uncover`, `gaia` |
| `class` | string | CSS class: `lead`, `invert` |
| `color` | string | Default text color (name or hex) |
| `backgroundColor` | string | Default background color |
| `paginate` | string | `"true"` or `"false"` |
| `header` | string | Header text for all slides |
| `footer` | string | Footer text for all slides |

### Step 2: Split Into Slides

After removing frontmatter, split the remaining content on `---` surrounded by newlines:

```
Pattern: \n---\s*\n
```

Each resulting chunk is one slide. Trim whitespace from each chunk.

### Step 3: Parse Each Slide

For each slide chunk, extract these elements in order:

#### Background Image

```
Pattern: !\[bg[^\]]*?\]\((https?://[^\)]+)\)
```

This captures:
- `![bg](url)` — basic background
- `![bg brightness:0.3](url)` — with brightness filter
- `![bg blur:2px brightness:0.4](url)` — with multiple filters
- `![bg right:40%](url)` — with positioning

#### Background Filters

```
Brightness: brightness:([\d.]+)
Blur:       blur:(\d+)px
Contrast:   contrast:([\d.]+)
Grayscale:  grayscale:([\d.]+)
Sepia:      sepia:([\d.]+)
```

#### Per-slide Directives (HTML comments)

```
Pattern: <!--\s*(_\w+):\s*(.+?)\s*-->
```

Common directives:
- `<!-- _class: lead -->` — slide-specific class
- `<!-- _color: #ff0000 -->` — slide-specific text color
- `<!-- _backgroundColor: #000 -->` — slide-specific background

#### Title (First Heading)

```
Pattern: ^#{1,3}\s+(.+)$
Flags:   MULTILINE
```

The first heading found becomes the slide title. Remove it from the remaining text.

#### Subtitle / Body

After removing the title, check for a second heading:

```
Pattern: ^#{2,4}\s+(.+)$
Flags:   MULTILINE
```

If found, this is the subtitle. Any remaining text after the subtitle is body content.

If no second heading exists, all remaining text (after removing the title and image directives) is body content.

#### Speaker Notes

MARP supports speaker notes via HTML comments:

```
Pattern: <!--\s*notes?\s*-->\s*([\s\S]*?)(?=<!--|$)
```

Or in some MARP versions:

```
Pattern: <!--\s*([\s\S]*?)\s*-->
```

Note: Distinguish between directive comments (`_class`, `_color`) and free-form notes.

### Step 4: Clean Extracted Text

After extraction, clean the text:

1. Remove markdown bold markers: `**text**` → `text`
2. Remove markdown italic markers: `*text*` → `text`
3. Remove inline code markers: `` `text` `` → `text`
4. Remove link syntax: `[text](url)` → `text`
5. Trim whitespace
6. Collapse multiple newlines into one

### Step 5: Determine Layout Type

Based on slide content, assign a layout:

| Condition | Layout Type |
|-----------|-------------|
| First slide in deck | `TITLE` |
| Has title but no body, no image | `SECTION_HEADER` |
| Has title and body, no image | `TITLE_ONLY` |
| Has title and background image | `TITLE_ONLY` (image is background) |
| Has only an image, no text | `BLANK` (image-only slide) |
| Last slide, short text like "Thank You" | `SECTION_HEADER` |

## Output JSON Schema

```json
{
  "metadata": {
    "title": "string — presentation title from first slide or frontmatter",
    "theme": "string — MARP theme name",
    "color": "string — default text color",
    "total_slides": "number — count of slides"
  },
  "slides": [
    {
      "slide_number": "number — 1-indexed position",
      "title": "string — slide heading text (cleaned)",
      "body": "string — body/subtitle text (cleaned)",
      "background_image": "string — full URL or empty",
      "background_brightness": "number — 0.0 to 1.0, default 0.4",
      "speaker_notes": "string — notes content or empty",
      "layout": "string — TITLE | SECTION_HEADER | TITLE_ONLY | BLANK"
    }
  ]
}
```

## Edge Cases

| Case | Handling |
|------|----------|
| Empty slide (just `---`) | Skip — do not include in output |
| Slide with only an image | Set layout to `BLANK`, leave title/body empty |
| Multiple headings on one slide | First `#` is title, remaining are body text |
| Nested bold in title `# **Bold** Title` | Strip `**` markers, preserve text |
| HTML tags in content `<div>...</div>` | Strip HTML tags, keep inner text |
| Frontmatter without `marp: true` | Warn but continue parsing |
| No frontmatter at all | Treat entire file as slide content |
| Unsplash URLs with multiple keywords | Preserve full URL including commas |

## Example

### Input MARP

```markdown
---
marp: true
theme: uncover
class: lead
color: white
---

![bg brightness:0.3](https://source.unsplash.com/featured/?zen,garden)

# Presentation Zen
### Simple Ideas on Design

---

![bg brightness:0.4](https://source.unsplash.com/featured/?storm)

# Stop the Noise.
Clutter creates cognitive load.

---

![bg brightness:0.3](https://source.unsplash.com/featured/?stars)

# Thank You.
```

### Output JSON

```json
{
  "metadata": {
    "title": "Presentation Zen",
    "theme": "uncover",
    "color": "white",
    "total_slides": 3
  },
  "slides": [
    {
      "slide_number": 1,
      "title": "Presentation Zen",
      "body": "Simple Ideas on Design",
      "background_image": "https://source.unsplash.com/featured/?zen,garden",
      "background_brightness": 0.3,
      "speaker_notes": "",
      "layout": "TITLE"
    },
    {
      "slide_number": 2,
      "title": "Stop the Noise.",
      "body": "Clutter creates cognitive load.",
      "background_image": "https://source.unsplash.com/featured/?storm",
      "background_brightness": 0.4,
      "speaker_notes": "",
      "layout": "TITLE_ONLY"
    },
    {
      "slide_number": 3,
      "title": "Thank You.",
      "body": "",
      "background_image": "https://source.unsplash.com/featured/?stars",
      "background_brightness": 0.3,
      "speaker_notes": "",
      "layout": "SECTION_HEADER"
    }
  ]
}
```
