#!/usr/bin/env node
// ============================================================
// MARP Slide JSON → Editable PowerPoint Builder
//
// Usage: node build_pptx.js <input.json> [output.pptx]
//
// Reads the JSON extracted by extract.js and produces a fully
// editable PowerPoint file with native text boxes, lists,
// tables, and images — not screenshots.
// ============================================================
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// --- Configuration ---
const SLIDE_WIDTH = 10;   // inches (16:9 standard)
const SLIDE_HEIGHT = 5.625; // inches (16:9 standard)

// Google Identity Colors
const COLORS = {
  blue: '4285F4',
  red: 'EA4335',
  yellow: 'FBBC05',
  green: '34A853',
  grey900: '202124',
  grey700: '5F6368',
  grey200: 'E8EAED',
  grey100: 'F1F3F4',
  white: 'FFFFFF',
  lightBlue: '5C92F6'
};

// --- Helpers ---

/**
 * Convert CSS color string to hex (without #)
 */
function cssColorToHex(cssColor) {
  if (!cssColor || cssColor === 'transparent' || cssColor === 'rgba(0, 0, 0, 0)') {
    return null;
  }

  // Already hex
  if (cssColor.startsWith('#')) {
    return cssColor.replace('#', '').substring(0, 6).toUpperCase();
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const match = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return (r + g + b).toUpperCase();
  }

  // Named colors fallback
  const named = {
    'white': 'FFFFFF', 'black': '000000', 'red': 'FF0000',
    'blue': '0000FF', 'green': '008000', 'yellow': 'FFFF00'
  };
  return named[cssColor.toLowerCase()] || COLORS.grey900;
}

/**
 * Check if a background color is dark
 */
function isDarkBackground(bgColor) {
  const hex = cssColorToHex(bgColor);
  if (!hex) return false;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

/**
 * Convert pixel position/size to inches relative to slide
 */
function pxToInches(px, totalPx, totalInches) {
  return (px / totalPx) * totalInches;
}

/**
 * Convert CSS font size (px) to PowerPoint points
 */
function pxToPt(px) {
  // CSS px to pt: 1px ≈ 0.75pt, but MARP renders at higher DPI
  // Typical MARP slide is 1280x720 rendering at ~96dpi
  return Math.round(px * 0.75);
}

/**
 * Map CSS font-weight to bold boolean
 */
function isBold(fontWeight) {
  if (!fontWeight) return false;
  const w = parseInt(fontWeight);
  return w >= 600 || fontWeight === 'bold';
}

/**
 * Pick a clean font family from CSS font stack
 */
function cleanFont(fontFamily) {
  if (!fontFamily) return 'Arial';
  // Extract first font, strip quotes
  const first = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
  // Map to PowerPoint-safe fonts
  const fontMap = {
    'Inter': 'Arial',
    'Google Sans': 'Arial',
    'Roboto': 'Arial',
    'Helvetica': 'Arial',
    'sans-serif': 'Arial',
    'monospace': 'Courier New',
    'Courier': 'Courier New'
  };
  return fontMap[first] || first;
}

/**
 * Download an image URL to a local buffer (for embedding in PPTX)
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    // Handle data URIs
    if (url.startsWith('data:')) {
      const matches = url.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        resolve(Buffer.from(matches[2], 'base64'));
      } else {
        reject(new Error('Invalid data URI'));
      }
      return;
    }

    // Handle file:// URIs
    if (url.startsWith('file://')) {
      const filePath = url.replace('file://', '');
      fs.readFile(filePath, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
      return;
    }

    const client = url.startsWith('https') ? https : http;
    client.get(url, { timeout: 10000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Build rich text array from element data (handles accent/bold spans)
 */
function buildTextRuns(element, defaultColor) {
  const color = cssColorToHex(element.color) || defaultColor;
  const runs = [];

  if (element.hasAccent && element.accentText && element.text) {
    // Split text around the accent portion
    const parts = element.text.split(element.accentText);
    if (parts[0]) {
      runs.push({
        text: parts[0],
        options: {
          fontSize: pxToPt(element.fontSize),
          fontFace: cleanFont(element.fontFamily),
          color: color,
          bold: isBold(element.fontWeight),
          italic: element.isItalic || element.fontStyle === 'italic'
        }
      });
    }
    runs.push({
      text: element.accentText,
      options: {
        fontSize: pxToPt(element.fontSize),
        fontFace: cleanFont(element.fontFamily),
        color: cssColorToHex(element.accentColor) || COLORS.blue,
        bold: true,
        italic: element.isItalic || element.fontStyle === 'italic'
      }
    });
    if (parts[1]) {
      runs.push({
        text: parts[1],
        options: {
          fontSize: pxToPt(element.fontSize),
          fontFace: cleanFont(element.fontFamily),
          color: color,
          bold: isBold(element.fontWeight),
          italic: element.isItalic || element.fontStyle === 'italic'
        }
      });
    }
  } else {
    runs.push({
      text: element.text || '',
      options: {
        fontSize: pxToPt(element.fontSize),
        fontFace: cleanFont(element.fontFamily),
        color: color,
        bold: isBold(element.fontWeight),
        italic: element.isItalic || element.fontStyle === 'italic'
      }
    });
  }

  return runs;
}

// --- Main Builder ---

async function buildPresentation(inputPath, outputPath) {
  const raw = fs.readFileSync(inputPath, 'utf-8');
  const data = JSON.parse(raw);

  if (data.error) {
    console.error('Error in extracted data:', data.error);
    process.exit(1);
  }

  const { meta, slides } = data;
  const srcWidth = meta.slideWidth;
  const srcHeight = meta.slideHeight;

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.title = meta.title;
  pres.author = 'Generated by html-to-pptx skill';

  // Define slide master for Google identity
  pres.defineSlideMaster({
    title: 'GOOGLE_IDENTITY',
    background: { color: COLORS.white }
  });

  for (const slideData of slides) {
    const slide = pres.addSlide();

    // --- Set slide background ---
    const bgHex = cssColorToHex(slideData.background.color);
    if (bgHex && bgHex !== 'FFFFFF' && bgHex !== '000000' ||
        (bgHex === '000000' && slideData.class.includes('invert'))) {
      slide.background = { color: bgHex };
    }

    // Handle background images (from CSS background-image)
    if (slideData.background.image) {
      const urlMatch = slideData.background.image.match(/url\(["']?([^"')]+)["']?\)/);
      if (urlMatch) {
        try {
          const imgBuffer = await downloadImage(urlMatch[1]);
          const base64 = imgBuffer.toString('base64');
          const ext = urlMatch[1].match(/\.(png|jpg|jpeg|gif|webp)/i);
          const mime = ext ? ext[1].toLowerCase().replace('jpg', 'jpeg') : 'png';
          slide.background = { data: `image/${mime};base64,${base64}` };
        } catch (err) {
          console.warn(`Warning: Could not download background image for slide ${slideData.index + 1}: ${err.message}`);
        }
      }
    }

    const darkBg = isDarkBackground(slideData.background.color);
    const defaultTextColor = darkBg ? COLORS.white : COLORS.grey900;

    // --- Add Google gradient bar for title/closing slides ---
    if (slideData.class.includes('title') || slideData.class.includes('closing')) {
      // 4-color gradient bar at the bottom
      const barHeight = 0.06;
      const barY = SLIDE_HEIGHT - barHeight;
      const segWidth = SLIDE_WIDTH / 4;
      const barColors = [COLORS.blue, COLORS.red, COLORS.yellow, COLORS.green];
      barColors.forEach((color, i) => {
        slide.addShape(pres.ShapeType.rect, {
          x: i * segWidth,
          y: barY,
          w: segWidth + 0.01, // slight overlap to avoid gaps
          h: barHeight,
          fill: { color: color }
        });
      });
    }

    // --- Process each element ---
    for (const el of slideData.elements) {
      const x = pxToInches(el.x, srcWidth, SLIDE_WIDTH);
      const y = pxToInches(el.y, srcHeight, SLIDE_HEIGHT);
      const w = pxToInches(el.width, srcWidth, SLIDE_WIDTH);
      const h = pxToInches(el.height, srcHeight, SLIDE_HEIGHT);

      // Clamp to slide bounds with padding
      const safeX = Math.max(0.2, Math.min(x, SLIDE_WIDTH - 0.5));
      const safeW = Math.min(w, SLIDE_WIDTH - safeX - 0.2);

      const align = el.textAlign === 'center' ? 'center'
                   : el.textAlign === 'right' ? 'right'
                   : 'left';

      switch (el.type) {
        case 'heading': {
          const runs = buildTextRuns(el, defaultTextColor);
          slide.addText(runs, {
            x: safeX,
            y: y,
            w: safeW,
            h: h,
            align: align,
            valign: 'top',
            wrap: true,
            shrinkText: true
          });
          break;
        }

        case 'text': {
          const runs = buildTextRuns(el, defaultTextColor);
          slide.addText(runs, {
            x: safeX,
            y: y,
            w: safeW,
            h: h,
            align: align,
            valign: 'top',
            wrap: true,
            shrinkText: true
          });
          break;
        }

        case 'unordered-list':
        case 'ordered-list': {
          const listRows = el.items.map((item, idx) => {
            const itemColor = cssColorToHex(item.color) || defaultTextColor;
            return {
              text: item.text,
              options: {
                fontSize: pxToPt(item.fontSize || el.fontSize),
                fontFace: cleanFont(el.fontFamily),
                color: itemColor,
                bullet: el.type === 'unordered-list'
                  ? { type: 'bullet', color: cssColorToHex(el.bulletColor) || COLORS.blue }
                  : { type: 'number', color: itemColor },
                indentLevel: 0,
                bold: item.hasAccent || false
              }
            };
          });
          slide.addText(listRows, {
            x: safeX,
            y: y,
            w: safeW,
            h: h,
            valign: 'top',
            wrap: true,
            shrinkText: true
          });
          break;
        }

        case 'blockquote': {
          // Add a left border accent bar
          const borderHex = cssColorToHex(el.borderColor) || COLORS.blue;
          slide.addShape(pres.ShapeType.rect, {
            x: safeX,
            y: y,
            w: 0.05,
            h: h,
            fill: { color: borderHex }
          });
          slide.addText([{
            text: el.text,
            options: {
              fontSize: pxToPt(el.fontSize),
              fontFace: cleanFont(el.fontFamily),
              color: cssColorToHex(el.color) || defaultTextColor,
              italic: true
            }
          }], {
            x: safeX + 0.15,
            y: y,
            w: safeW - 0.15,
            h: h,
            valign: 'middle',
            wrap: true,
            shrinkText: true
          });
          break;
        }

        case 'code': {
          // Dark code block background
          slide.addShape(pres.ShapeType.rect, {
            x: safeX,
            y: y,
            w: safeW,
            h: h,
            fill: { color: COLORS.grey900 },
            rectRadius: 0.08
          });
          slide.addText([{
            text: el.text,
            options: {
              fontSize: Math.min(pxToPt(el.fontSize), 12),
              fontFace: 'Courier New',
              color: COLORS.grey200
            }
          }], {
            x: safeX + 0.15,
            y: y + 0.1,
            w: safeW - 0.3,
            h: h - 0.2,
            valign: 'top',
            wrap: true,
            shrinkText: true
          });
          break;
        }

        case 'image': {
          if (el.src) {
            try {
              const imgBuffer = await downloadImage(el.src);
              const base64 = imgBuffer.toString('base64');
              const ext = el.src.match(/\.(png|jpg|jpeg|gif|webp|svg)/i);
              const mime = ext ? ext[1].toLowerCase().replace('jpg', 'jpeg') : 'png';
              slide.addImage({
                data: `image/${mime};base64,${base64}`,
                x: safeX,
                y: y,
                w: Math.min(safeW, SLIDE_WIDTH - safeX - 0.2),
                h: h
              });
            } catch (err) {
              console.warn(`Warning: Could not embed image on slide ${slideData.index + 1}: ${err.message}`);
              // Add placeholder
              slide.addText([{ text: `[Image: ${el.alt || el.src}]`, options: { fontSize: 10, color: COLORS.grey700, italic: true } }], {
                x: safeX, y: y, w: safeW, h: h, align: 'center', valign: 'middle'
              });
            }
          }
          break;
        }

        case 'table': {
          if (el.rows && el.rows.length > 0) {
            const tableRows = el.rows.map(row =>
              row.map(cell => ({
                text: cell.text,
                options: {
                  fontSize: 10,
                  fontFace: 'Arial',
                  color: cssColorToHex(cell.color) || defaultTextColor,
                  bold: cell.isHeader || isBold(cell.fontWeight),
                  fill: cell.isHeader
                    ? { color: COLORS.grey100 }
                    : (cssColorToHex(cell.backgroundColor) ? { color: cssColorToHex(cell.backgroundColor) } : undefined)
                }
              }))
            );
            slide.addTable(tableRows, {
              x: safeX,
              y: y,
              w: safeW,
              border: { pt: 0.5, color: COLORS.grey200 },
              colW: Array(el.rows[0].length).fill(safeW / el.rows[0].length),
              autoPage: false
            });
          }
          break;
        }

        case 'svg': {
          // SVGs are flagged as complex — placeholder for screenshot fallback
          slide.addText([{
            text: `[Complex SVG element — use screenshot fallback]`,
            options: { fontSize: 10, color: COLORS.grey700, italic: true }
          }], {
            x: safeX, y: y, w: safeW, h: h,
            align: 'center', valign: 'middle',
            border: { pt: 1, color: COLORS.grey200, type: 'dash' }
          });
          break;
        }
      }
    }
  }

  await pres.writeFile({ fileName: outputPath });
  console.log(`PowerPoint created: ${outputPath}`);
  console.log(`  Slides: ${slides.length}`);
  console.log(`  Source dimensions: ${srcWidth}x${srcHeight}px`);
}

// --- CLI Entry Point ---
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node build_pptx.js <input.json> [output.pptx]');
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1] || inputFile.replace(/\.json$/, '.pptx');

if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file not found: ${inputFile}`);
  process.exit(1);
}

buildPresentation(inputFile, outputFile).catch(err => {
  console.error('Error building presentation:', err);
  process.exit(1);
});
