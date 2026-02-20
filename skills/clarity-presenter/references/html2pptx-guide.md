# HTML to PowerPoint Guide

Convert HTML slides to PowerPoint presentations with accurate positioning using the `html2pptx.js` library.

## Table of Contents

1. [Creating HTML Slides](#creating-html-slides)
2. [Using the html2pptx Library](#using-the-html2pptx-library)
3. [Using PptxGenJS](#using-pptxgenjs)

---

## Creating HTML Slides

Every HTML slide must include proper body dimensions:

### Layout Dimensions

- **16:9** (default): `width: 720pt; height: 405pt`
- **4:3**: `width: 720pt; height: 540pt`
- **16:10**: `width: 720pt; height: 450pt`

### Supported Elements

- `<p>`, `<h1>`-`<h6>` - Text with styling
- `<ul>`, `<ol>` - Lists (never use manual bullets)
- `<b>`, `<strong>` - Bold text (inline formatting)
- `<i>`, `<em>` - Italic text (inline formatting)
- `<u>` - Underlined text (inline formatting)
- `<span>` - Inline formatting with CSS styles (bold, italic, underline, color)
- `<br>` - Line breaks
- `<div>` with bg/border - Becomes shape
- `<img>` - Images
- `class="placeholder"` - Reserved space for charts (returns `{ id, x, y, w, h }`)

### Critical Text Rules

**ALL text MUST be inside `<p>`, `<h1>`-`<h6>`, `<ul>`, or `<ol>` tags:**
- Correct: `<div><p>Text here</p></div>`
- Wrong: `<div>Text here</div>` — Text will NOT appear in PowerPoint
- Wrong: `<span>Text</span>` — Text will NOT appear in PowerPoint
- Text in `<div>` or `<span>` without a text tag will be silently ignored

**NEVER use manual bullet symbols** — Use `<ul>` or `<ol>` lists instead

**ONLY use web-safe fonts that are universally available:**
- Web-safe fonts: `Arial`, `Helvetica`, `Times New Roman`, `Georgia`, `Courier New`, `Verdana`, `Tahoma`, `Trebuchet MS`, `Impact`
- Wrong: `'Segoe UI'`, `'SF Pro'`, `'Roboto'`, custom fonts — Might cause rendering issues

### Styling

- Use `display: flex` on body to prevent margin collapse from breaking overflow validation
- Use `margin` for spacing (padding included in size)
- Inline formatting: Use `<b>`, `<i>`, `<u>` tags OR `<span>` with CSS styles
  - `<span>` supports: `font-weight: bold`, `font-style: italic`, `text-decoration: underline`, `color: #rrggbb`
  - `<span>` does NOT support: `margin`, `padding` (not supported in PowerPoint text runs)
- Flexbox works — positions calculated from rendered layout
- Use hex colors with `#` prefix in CSS
- **Text alignment**: Use CSS `text-align` when needed as a hint to PptxGenJS

### Shape Styling (DIV elements only)

**Backgrounds, borders, and shadows only work on `<div>` elements, NOT on text elements (`<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>`)**

- **Backgrounds**: CSS `background` or `background-color` on `<div>` elements only
- **Borders**: CSS `border` on `<div>` elements converts to PowerPoint shape borders
  - Supports uniform borders: `border: 2px solid #333333`
  - Supports partial borders: `border-left`, `border-right`, `border-top`, `border-bottom` (rendered as line shapes)
- **Border radius**: CSS `border-radius` on `<div>` elements for rounded corners
  - `border-radius: 50%` or higher creates circular shape
  - Supports px and pt units
- **Box shadows**: CSS `box-shadow` on `<div>` elements converts to PowerPoint shadows
  - Supports outer shadows only (inset shadows are ignored)

### Icons & Gradients

- **CRITICAL: Never use CSS gradients (`linear-gradient`, `radial-gradient`)** — They don't convert to PowerPoint
- **ALWAYS create gradient/icon PNGs FIRST using Sharp, then reference in HTML**
- For gradients: Rasterize SVG to PNG background images
- For icons: Rasterize react-icons SVG to PNG images

**Rasterizing Gradients with Sharp:**

```javascript
const sharp = require('sharp');

async function createGradientBackground(filename, color1, color2) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="562.5">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1}"/>
        <stop offset="100%" style="stop-color:${color2}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(filename);
  return filename;
}
```

### Example HTML Slide

```html
<!DOCTYPE html>
<html>
<head>
<style>
html { background: #ffffff; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  background: #f5f5f5; font-family: Arial, sans-serif;
  display: flex;
}
.content { margin: 30pt; padding: 40pt; background: #ffffff; border-radius: 8pt; }
h1 { color: #2d3748; font-size: 32pt; }
.box {
  background: #4285f4; padding: 20pt;
  border-radius: 12pt; box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.25);
}
</style>
</head>
<body>
<div class="content">
  <h1>Slide Title</h1>
  <ul>
    <li><b>Point:</b> Description</li>
  </ul>
  <p>Text with <b>bold</b> and <i>italic</i>.</p>
</div>
</body>
</html>
```

## Using the html2pptx Library

### Dependencies

These libraries must be globally installed:
- `pptxgenjs`
- `playwright`
- `sharp`

### Basic Usage

```javascript
const pptxgen = require('pptxgenjs');
const html2pptx = require('./html2pptx');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';  // Must match HTML body dimensions

const { slide, placeholders } = await html2pptx('slide1.html', pptx);
await pptx.writeFile('output.pptx');
```

### API Reference

#### Function Signature
```javascript
await html2pptx(htmlFile, pres, options)
```

#### Parameters
- `htmlFile` (string): Path to HTML file (absolute or relative)
- `pres` (pptxgen): PptxGenJS presentation instance with layout already set
- `options` (object, optional):
  - `tmpDir` (string): Temporary directory for generated files (default: `process.env.TMPDIR || '/tmp'`)
  - `slide` (object): Existing slide to reuse (default: creates new slide)

#### Returns
```javascript
{
    slide: pptxgenSlide,           // The created/updated slide
    placeholders: [                 // Array of placeholder positions
        { id: string, x: number, y: number, w: number, h: number },
        ...
    ]
}
```

### Validation

The library automatically validates and collects all errors before throwing:

1. **HTML dimensions must match presentation layout** — Reports dimension mismatches
2. **Content must not overflow body** — Reports overflow with exact measurements
3. **CSS gradients** — Reports unsupported gradient usage
4. **Text element styling** — Reports backgrounds/borders/shadows on text elements (only allowed on divs)

All validation errors are collected and reported together in a single error message.

### Complete Multi-Slide Example

```javascript
const pptxgen = require('pptxgenjs');
const html2pptx = require('./html2pptx');

async function createPresentation() {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'Your Name';
    pptx.title = 'My Presentation';

    // Convert each HTML slide
    await html2pptx('slides/slide-01.html', pptx);
    await html2pptx('slides/slide-02.html', pptx);
    await html2pptx('slides/slide-03.html', pptx);

    await pptx.writeFile({ fileName: 'presentation.pptx' });
    console.log('Presentation created!');
}

createPresentation().catch(console.error);
```

## Using PptxGenJS

### Critical Rules

#### Colors
- **NEVER use `#` prefix** with hex colors in PptxGenJS — causes file corruption
- Correct: `color: "FF0000"`, `fill: { color: "0066CC" }`
- Wrong: `color: "#FF0000"` (breaks document)

### Adding Charts to Placeholders

```javascript
const { slide, placeholders } = await html2pptx('slide.html', pptx);

slide.addChart(pptx.charts.BAR, [{
    name: "Sales",
    labels: ["Q1", "Q2", "Q3", "Q4"],
    values: [4500, 5500, 6200, 7100]
}], {
    ...placeholders[0],
    showTitle: true,
    title: 'Quarterly Sales',
    chartColors: ["4472C4"]
});
```

### Adding Tables

```javascript
slide.addTable([
    [
        { text: "Header 1", options: { fill: { color: "4285F4" }, color: "FFFFFF", bold: true } },
        { text: "Header 2", options: { fill: { color: "4285F4" }, color: "FFFFFF", bold: true } }
    ],
    ["Row 1, Col 1", "Row 1, Col 2"],
    ["Row 2, Col 1", "Row 2, Col 2"]
], {
    x: 1, y: 1.5, w: 8, h: 3,
    border: { pt: 1, color: "CCCCCC" },
    align: "center",
    fontSize: 14
});
```
