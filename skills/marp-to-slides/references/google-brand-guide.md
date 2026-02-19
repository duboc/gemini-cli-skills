# Google Brand and Material Design Guide for Presentations

Reference for applying Google's visual identity to slide presentations.

## Google Brand Colors

### Primary Brand Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Google Blue** | `#4285F4` | `66, 133, 244` | Primary accent, links, CTAs |
| **Google Red** | `#EA4335` | `234, 67, 53` | Alerts, emphasis, secondary accent |
| **Google Yellow** | `#FBBC04` | `251, 188, 4` | Highlights, warnings, tertiary accent |
| **Google Green** | `#34A853` | `52, 168, 83` | Success, positive indicators |

### Neutral Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Dark text** | `#202124` | `32, 33, 36` | Primary text on light backgrounds |
| **Secondary text** | `#5F6368` | `95, 99, 104` | Body text, subtitles, captions |
| **Subtle grey** | `#9AA0A6` | `154, 160, 166` | Disabled text, placeholders |
| **Light grey** | `#E8EAED` | `232, 234, 237` | Borders, dividers, secondary backgrounds |
| **Surface** | `#F8F9FA` | `248, 249, 250` | Card backgrounds, subtle containers |
| **White** | `#FFFFFF` | `255, 255, 255` | Primary background |

### Dark Theme Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Dark background** | `#202124` | `32, 33, 36` | Primary dark background |
| **Dark surface** | `#303134` | `48, 49, 52` | Cards on dark background |
| **Light blue** | `#8AB4F8` | `138, 180, 248` | Blue accent on dark backgrounds |
| **Light red** | `#F28B82` | `242, 139, 130` | Red accent on dark backgrounds |
| **Light green** | `#81C995` | `129, 201, 149` | Green accent on dark backgrounds |
| **Light yellow** | `#FDD663` | `253, 214, 99` | Yellow accent on dark backgrounds |
| **White text** | `#E8EAED` | `232, 234, 237` | Primary text on dark backgrounds |
| **Grey text** | `#9AA0A6` | `154, 160, 166` | Secondary text on dark backgrounds |

## Typography

### Font Families

| Font | Usage | Availability |
|------|-------|--------------|
| **Google Sans** | Headlines, titles, display text | Google Slides (built-in) |
| **Roboto** | Body text, paragraphs, UI elements | Google Fonts, built-in |
| **Roboto Slab** | Serif alternative for body text | Google Fonts |
| **Roboto Mono** | Code snippets, technical content | Google Fonts |

### Type Scale for Presentations

| Element | Font | Size | Weight | Tracking |
|---------|------|------|--------|----------|
| **Display title** | Google Sans | 44pt | Bold | -0.5pt |
| **Slide title** | Google Sans | 36pt | Bold | 0 |
| **Subtitle** | Google Sans | 24pt | Regular | 0 |
| **Body large** | Roboto | 20pt | Regular | 0.15pt |
| **Body** | Roboto | 18pt | Regular | 0.15pt |
| **Caption** | Roboto | 14pt | Regular | 0.4pt |
| **Overline** | Roboto | 12pt | Medium | 1.5pt |

### Typography Rules

- Use **Google Sans** for titles and headings only.
- Use **Roboto** for body text and supporting content.
- Maintain a clear hierarchy: one title size, one body size per deck.
- Left-align body text. Center-align titles.
- Use Bold for emphasis, not underline or italic (sparingly).
- Maximum two font families per presentation.

## Layout Grid

### Slide Dimensions

- **Widescreen (16:9)**: 10 x 5.625 inches (default for Google Slides)
- **Standard (4:3)**: 10 x 7.5 inches
- Always use 16:9 for modern presentations.

### Margins and Safe Areas

| Area | Value |
|------|-------|
| **Outer margin** | 0.5 inches (all sides) |
| **Content area** | 9 x 4.625 inches |
| **Title position** | 0.5 inches from top |
| **Body position** | 2.5 inches from top |
| **Footer area** | Bottom 0.5 inches |

### Layout Patterns

#### Full-bleed Image
- Image covers entire slide (10 x 5.625 inches)
- Text overlaid with semi-transparent scrim or text shadow
- Title centered vertically and horizontally

#### Split Layout
- Left half: text content (5 x 5.625 inches)
- Right half: image or graphic (5 x 5.625 inches)
- Text left-aligned within left half with 0.5-inch padding

#### Card Layout
- Background: solid color (white or dark)
- Content in centered container: 7 x 3.5 inches
- Subtle corner radius (0.125 inches)
- Optional subtle shadow

#### Title-focused
- Background: solid color
- Title centered vertically and horizontally
- No images, no decorations
- Maximum visual emphasis on the words

## Material Design Principles for Slides

### Elevation and Shadow

- Cards use subtle shadow: `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)`
- No heavy drop shadows.
- Flat design is preferred over skeuomorphism.

### Shape and Corners

- Rounded corners: 8px radius for containers and cards.
- Avoid sharp 90-degree containers — they feel dated.
- Circles for avatars, icons, and callout numbers.

### Iconography

- Use Material Design icons when icons are needed.
- Icon color matches text color or accent color.
- Icons at 24px or 48px sizes.
- Never use clip art.

### Animation and Transitions

- Prefer no transitions between slides (Zen principle).
- If transitions are needed: simple fade only.
- No fly-in, bounce, spin, or decorative animations.
- Motion should be purposeful, not decorative.

## Theme Application Rules

### Google Classic

```
Background:    #FFFFFF (white)
Title:         #202124 (dark) — Google Sans Bold 36pt
Body:          #5F6368 (grey) — Roboto Regular 18pt
Accent:        #4285F4 (blue) — for emphasis, underlines, highlights
Dividers:      #E8EAED (light grey)
```

Best for: professional settings, external presentations, client-facing decks.

### Google Dark

```
Background:    #202124 (dark)
Title:         #FFFFFF (white) — Google Sans Bold 36pt
Body:          #E8EAED (light grey) — Roboto Regular 18pt
Accent:        #8AB4F8 (light blue) — for emphasis
Surfaces:      #303134 (dark surface) — for cards
```

Best for: tech demos, developer talks, evening events, high-contrast needs.

### Google Multicolor

```
Background:    #FFFFFF (white)
Slide 1 title: #4285F4 (blue)
Slide 2 title: #EA4335 (red)
Slide 3 title: #FBBC04 (yellow)
Slide 4 title: #34A853 (green)
Slide 5+:     Repeat rotation
Body:          #202124 (dark)
```

Best for: keynotes, product launches, creative presentations, internal all-hands.

### Google Neutral

```
Background:    #FFFFFF (white)
Title:         #4285F4 (blue) — Google Sans Bold 36pt
Body:          #5F6368 (grey) — Roboto Regular 18pt
No accent decorations — pure typography
```

Best for: data-heavy presentations, reports, minimal aesthetic.

## Accessibility

- Maintain WCAG 2.1 AA contrast ratios (4.5:1 for body text, 3:1 for large text).
- All Google brand color combinations on white meet AA standards.
- On dark backgrounds, use the lighter color variants (#8AB4F8 instead of #4285F4).
- Never place text over busy image areas without a scrim.
- Include alt text in speaker notes for background images.
