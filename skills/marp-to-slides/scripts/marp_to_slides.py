#!/usr/bin/env python3
"""
MARP to Google Slides Converter

Reads a JSON file containing parsed MARP slide data and creates a Google Slides
presentation using the Google Slides API with Google brand colors and Material
Design conventions.

Usage:
    python3 marp_to_slides.py --input slides.json --theme google-classic \
        --layout full-bleed --fonts google-sans-roboto --title "My Deck"

    python3 marp_to_slides.py --marp deck.md --theme google-dark \
        --layout card --fonts google-sans-only --title "My Deck"

Prerequisites:
    pip install google-api-python-client google-auth-oauthlib

Authentication:
    On first run, a browser window opens for OAuth consent.
    Credentials are cached in ~/.marp-to-slides/token.json.
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Google API imports
# ---------------------------------------------------------------------------
try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
except ImportError:
    print("Error: Required packages not installed.")
    print("Run: pip install google-api-python-client google-auth-oauthlib")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
SCOPES = [
    "https://www.googleapis.com/auth/presentations",
    "https://www.googleapis.com/auth/drive.file",
]

CONFIG_DIR = Path.home() / ".marp-to-slides"
TOKEN_PATH = CONFIG_DIR / "token.json"
CREDENTIALS_PATH = CONFIG_DIR / "credentials.json"

# Slide dimensions in EMU (English Metric Units): 1 inch = 914400 EMU
SLIDE_WIDTH = 9144000   # 10 inches
SLIDE_HEIGHT = 5143500  # 5.625 inches (16:9)

# Google Brand Colors
COLORS = {
    "blue":   {"red": 0.259, "green": 0.522, "blue": 0.957},  # #4285F4
    "red":    {"red": 0.918, "green": 0.263, "blue": 0.208},  # #EA4335
    "yellow": {"red": 0.984, "green": 0.737, "blue": 0.016},  # #FBBC04
    "green":  {"red": 0.204, "green": 0.659, "blue": 0.325},  # #34A853
    "white":  {"red": 1.0,   "green": 1.0,   "blue": 1.0},
    "black":  {"red": 0.0,   "green": 0.0,   "blue": 0.0},
    "dark":   {"red": 0.125, "green": 0.129, "blue": 0.141},  # #202124
    "grey":   {"red": 0.373, "green": 0.384, "blue": 0.404},  # #5F6368
    "light_grey": {"red": 0.910, "green": 0.918, "blue": 0.929},  # #E8EAED
    "light_blue": {"red": 0.541, "green": 0.706, "blue": 0.973},  # #8AB4F8
    "subtle_grey": {"red": 0.604, "green": 0.627, "blue": 0.651},  # #9AA0A6
}

BRAND_ROTATION = ["blue", "red", "yellow", "green"]

# Theme definitions
THEMES = {
    "google-classic": {
        "background": "white",
        "title_color": "dark",
        "body_color": "grey",
        "accent_color": "blue",
        "subtitle_color": "grey",
    },
    "google-dark": {
        "background": "dark",
        "title_color": "white",
        "body_color": "light_grey",
        "accent_color": "light_blue",
        "subtitle_color": "subtle_grey",
    },
    "google-multicolor": {
        "background": "white",
        "title_color": "blue",  # rotates per slide
        "body_color": "dark",
        "accent_color": "blue",  # rotates per slide
        "subtitle_color": "grey",
    },
    "google-neutral": {
        "background": "white",
        "title_color": "blue",
        "body_color": "grey",
        "accent_color": "blue",
        "subtitle_color": "grey",
    },
}

# Font definitions
FONT_SETS = {
    "google-sans-roboto": {
        "title_font": "Google Sans",
        "body_font": "Roboto",
        "title_size": 36,
        "subtitle_size": 24,
        "body_size": 18,
        "caption_size": 14,
    },
    "google-sans-only": {
        "title_font": "Google Sans",
        "body_font": "Google Sans",
        "title_size": 36,
        "subtitle_size": 24,
        "body_size": 18,
        "caption_size": 14,
    },
    "roboto-slab": {
        "title_font": "Roboto",
        "body_font": "Roboto Slab",
        "title_size": 36,
        "subtitle_size": 24,
        "body_size": 18,
        "caption_size": 14,
    },
}


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------
def authenticate():
    """Authenticate with Google APIs using OAuth 2.0."""
    creds = None
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CREDENTIALS_PATH.exists():
                print(f"Error: OAuth credentials file not found at {CREDENTIALS_PATH}")
                print()
                print("To set up authentication:")
                print("1. Go to https://console.cloud.google.com/apis/credentials")
                print("2. Create an OAuth 2.0 Client ID (Desktop application)")
                print("3. Download the JSON and save it as:")
                print(f"   {CREDENTIALS_PATH}")
                print()
                print("Or if using the Google Workspace extension, ensure it is")
                print("installed and authenticated:")
                print("  gemini extensions install https://github.com/gemini-cli-extensions/workspace")
                sys.exit(1)

            flow = InstalledAppFlow.from_client_secrets_file(
                str(CREDENTIALS_PATH), SCOPES
            )
            creds = flow.run_local_server(port=0)

        with open(TOKEN_PATH, "w") as token:
            token.write(creds.to_json())

    return creds


# ---------------------------------------------------------------------------
# MARP Parser
# ---------------------------------------------------------------------------
def parse_marp_file(filepath):
    """Parse a MARP markdown file into structured slide data."""
    with open(filepath, "r") as f:
        content = f.read()

    # Extract frontmatter
    frontmatter = {}
    fm_match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if fm_match:
        for line in fm_match.group(1).strip().split("\n"):
            if ":" in line:
                key, value = line.split(":", 1)
                frontmatter[key.strip()] = value.strip()
        content = content[fm_match.end():]

    if frontmatter.get("marp") != "true":
        print("Warning: File does not contain 'marp: true' directive.")

    # Split into slides
    raw_slides = re.split(r"\n---\s*\n", content)

    slides = []
    for i, raw in enumerate(raw_slides):
        raw = raw.strip()
        if not raw:
            continue

        slide = {
            "slide_number": i + 1,
            "title": "",
            "body": "",
            "background_image": "",
            "background_brightness": 0.4,
            "speaker_notes": "",
            "layout": "BLANK",
        }

        # Extract background image
        bg_match = re.search(
            r"!\[bg[^\]]*?\]\((https?://[^\)]+)\)", raw
        )
        if bg_match:
            slide["background_image"] = bg_match.group(1)

        # Extract brightness
        br_match = re.search(r"brightness:([\d.]+)", raw)
        if br_match:
            slide["background_brightness"] = float(br_match.group(1))

        # Remove image directives and HTML comments for text parsing
        text = re.sub(r"!\[bg[^\]]*?\]\([^\)]+\)\s*", "", raw)
        text = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)
        text = text.strip()

        # Extract title (first heading)
        title_match = re.match(r"^#{1,3}\s+(.+)$", text, re.MULTILINE)
        if title_match:
            slide["title"] = title_match.group(1).strip()
            text = text[title_match.end():].strip()

        # Extract subtitle or body (second heading or remaining text)
        sub_match = re.match(r"^#{2,4}\s+(.+)$", text, re.MULTILINE)
        if sub_match:
            slide["body"] = sub_match.group(1).strip()
            remaining = text[sub_match.end():].strip()
            if remaining:
                slide["body"] += "\n" + remaining
        elif text:
            slide["body"] = text

        # Clean markdown formatting from extracted text
        slide["title"] = re.sub(r"\*\*(.+?)\*\*", r"\1", slide["title"])
        slide["body"] = re.sub(r"\*\*(.+?)\*\*", r"\1", slide["body"])

        # Determine layout type
        if i == 0:
            slide["layout"] = "TITLE"
        elif slide["title"] and not slide["body"]:
            slide["layout"] = "SECTION_HEADER"
        else:
            slide["layout"] = "TITLE_ONLY"

        slides.append(slide)

    metadata = {
        "title": slides[0]["title"] if slides else "Untitled Presentation",
        "theme": frontmatter.get("theme", "uncover"),
        "color": frontmatter.get("color", "white"),
        "total_slides": len(slides),
    }

    return {"metadata": metadata, "slides": slides}


# ---------------------------------------------------------------------------
# Google Slides Builder
# ---------------------------------------------------------------------------
class SlidesBuilder:
    """Builds a Google Slides presentation from parsed MARP data."""

    def __init__(self, creds, theme_name, layout_style, font_set_name):
        self.service = build("slides", "v1", credentials=creds)
        self.drive_service = build("drive", "v3", credentials=creds)
        self.theme = THEMES.get(theme_name, THEMES["google-classic"])
        self.layout_style = layout_style
        self.fonts = FONT_SETS.get(font_set_name, FONT_SETS["google-sans-roboto"])
        self.theme_name = theme_name
        self.presentation_id = None

    def create_presentation(self, title):
        """Create a new blank presentation."""
        body = {"title": title}
        presentation = self.service.presentations().create(body=body).execute()
        self.presentation_id = presentation["presentationId"]
        print(f"Created presentation: {self.presentation_id}")
        return self.presentation_id

    def _get_color(self, color_key):
        """Get RGB color dict from key."""
        return COLORS.get(color_key, COLORS["dark"])

    def _get_accent_for_slide(self, slide_number):
        """Get the accent color for a slide (handles multicolor rotation)."""
        if self.theme_name == "google-multicolor":
            idx = (slide_number - 1) % len(BRAND_ROTATION)
            return BRAND_ROTATION[idx]
        return self.theme["accent_color"]

    def _get_title_color_for_slide(self, slide_number):
        """Get the title color for a slide (handles multicolor rotation)."""
        if self.theme_name == "google-multicolor":
            idx = (slide_number - 1) % len(BRAND_ROTATION)
            return BRAND_ROTATION[idx]
        return self.theme["title_color"]

    def _pt_to_emu(self, pt):
        """Convert points to EMU."""
        return int(pt * 12700)

    def build_slides(self, slide_data):
        """Build all slides from parsed MARP data."""
        slides = slide_data["slides"]
        requests = []

        # Delete the default blank slide
        presentation = (
            self.service.presentations()
            .get(presentationId=self.presentation_id)
            .execute()
        )
        default_slides = presentation.get("slides", [])
        if default_slides:
            requests.append(
                {"deleteObject": {"objectId": default_slides[0]["objectId"]}}
            )

        # Create each slide
        for slide in slides:
            slide_id = f"slide_{slide['slide_number']}"
            title_id = f"title_{slide['slide_number']}"
            body_id = f"body_{slide['slide_number']}"

            # Create blank slide
            requests.append(
                {
                    "createSlide": {
                        "objectId": slide_id,
                        "insertionIndex": slide["slide_number"] - 1,
                        "slideLayoutReference": {"predefinedLayout": "BLANK"},
                    }
                }
            )

            # Set background
            if self.layout_style == "full-bleed" and slide.get("background_image"):
                requests.append(
                    {
                        "updatePageProperties": {
                            "objectId": slide_id,
                            "pageProperties": {
                                "pageBackgroundFill": {
                                    "stretchedPictureFill": {
                                        "contentUrl": slide["background_image"]
                                    }
                                }
                            },
                            "fields": "pageBackgroundFill",
                        }
                    }
                )
            else:
                bg_color = self._get_color(self.theme["background"])
                requests.append(
                    {
                        "updatePageProperties": {
                            "objectId": slide_id,
                            "pageProperties": {
                                "pageBackgroundFill": {
                                    "solidFill": {
                                        "color": {"rgbColor": bg_color}
                                    }
                                }
                            },
                            "fields": "pageBackgroundFill",
                        }
                    }
                )

            # Add title text box
            if slide.get("title"):
                title_color_key = self._get_title_color_for_slide(
                    slide["slide_number"]
                )

                # Position title: centered, upper portion of slide
                if self.layout_style == "split" and slide.get("background_image"):
                    # Left half for text
                    tx = 457200    # 0.5 inch
                    ty = 1600000   # ~1.75 inches from top
                    tw = 4000000   # ~4.4 inches
                    th = 1800000   # ~2 inches
                else:
                    # Centered
                    tx = 914400    # 1 inch
                    ty = 1500000   # ~1.6 inches from top
                    tw = 7315200   # 8 inches
                    th = 1800000   # 2 inches

                requests.append(
                    {
                        "createShape": {
                            "objectId": title_id,
                            "shapeType": "TEXT_BOX",
                            "elementProperties": {
                                "pageObjectId": slide_id,
                                "size": {
                                    "width": {"magnitude": tw, "unit": "EMU"},
                                    "height": {"magnitude": th, "unit": "EMU"},
                                },
                                "transform": {
                                    "scaleX": 1,
                                    "scaleY": 1,
                                    "translateX": tx,
                                    "translateY": ty,
                                    "unit": "EMU",
                                },
                            },
                        }
                    }
                )

                requests.append(
                    {
                        "insertText": {
                            "objectId": title_id,
                            "text": slide["title"],
                            "insertionIndex": 0,
                        }
                    }
                )

                # Determine title color for full-bleed with background image
                if (
                    self.layout_style == "full-bleed"
                    and slide.get("background_image")
                ):
                    title_color = COLORS["white"]
                else:
                    title_color = self._get_color(title_color_key)

                requests.append(
                    {
                        "updateTextStyle": {
                            "objectId": title_id,
                            "style": {
                                "fontFamily": self.fonts["title_font"],
                                "fontSize": {
                                    "magnitude": self.fonts["title_size"],
                                    "unit": "PT",
                                },
                                "bold": True,
                                "foregroundColor": {
                                    "opaqueColor": {"rgbColor": title_color}
                                },
                            },
                            "textRange": {"type": "ALL"},
                            "fields": "fontFamily,fontSize,bold,foregroundColor",
                        }
                    }
                )

                # Center-align title text
                requests.append(
                    {
                        "updateParagraphStyle": {
                            "objectId": title_id,
                            "style": {"alignment": "CENTER"},
                            "textRange": {"type": "ALL"},
                            "fields": "alignment",
                        }
                    }
                )

            # Add body text box
            if slide.get("body"):
                if self.layout_style == "split" and slide.get("background_image"):
                    bx = 457200
                    by = 3400000
                    bw = 4000000
                    bh = 1200000
                else:
                    bx = 1371600   # 1.5 inches
                    by = 3400000   # ~3.7 inches from top
                    bw = 6400800   # 7 inches
                    bh = 1200000   # ~1.3 inches

                requests.append(
                    {
                        "createShape": {
                            "objectId": body_id,
                            "shapeType": "TEXT_BOX",
                            "elementProperties": {
                                "pageObjectId": slide_id,
                                "size": {
                                    "width": {"magnitude": bw, "unit": "EMU"},
                                    "height": {"magnitude": bh, "unit": "EMU"},
                                },
                                "transform": {
                                    "scaleX": 1,
                                    "scaleY": 1,
                                    "translateX": bx,
                                    "translateY": by,
                                    "unit": "EMU",
                                },
                            },
                        }
                    }
                )

                requests.append(
                    {
                        "insertText": {
                            "objectId": body_id,
                            "text": slide["body"],
                            "insertionIndex": 0,
                        }
                    }
                )

                # Determine body color
                if (
                    self.layout_style == "full-bleed"
                    and slide.get("background_image")
                ):
                    body_color = COLORS["white"]
                else:
                    body_color = self._get_color(self.theme["body_color"])

                requests.append(
                    {
                        "updateTextStyle": {
                            "objectId": body_id,
                            "style": {
                                "fontFamily": self.fonts["body_font"],
                                "fontSize": {
                                    "magnitude": self.fonts["body_size"],
                                    "unit": "PT",
                                },
                                "foregroundColor": {
                                    "opaqueColor": {"rgbColor": body_color}
                                },
                            },
                            "textRange": {"type": "ALL"},
                            "fields": "fontFamily,fontSize,foregroundColor",
                        }
                    }
                )

                # Center-align body text
                requests.append(
                    {
                        "updateParagraphStyle": {
                            "objectId": body_id,
                            "style": {"alignment": "CENTER"},
                            "textRange": {"type": "ALL"},
                            "fields": "alignment",
                        }
                    }
                )

            # Add split-layout image on right side
            if self.layout_style == "split" and slide.get("background_image"):
                img_id = f"img_{slide['slide_number']}"
                requests.append(
                    {
                        "createImage": {
                            "objectId": img_id,
                            "url": slide["background_image"],
                            "elementProperties": {
                                "pageObjectId": slide_id,
                                "size": {
                                    "width": {
                                        "magnitude": SLIDE_WIDTH // 2,
                                        "unit": "EMU",
                                    },
                                    "height": {
                                        "magnitude": SLIDE_HEIGHT,
                                        "unit": "EMU",
                                    },
                                },
                                "transform": {
                                    "scaleX": 1,
                                    "scaleY": 1,
                                    "translateX": SLIDE_WIDTH // 2,
                                    "translateY": 0,
                                    "unit": "EMU",
                                },
                            },
                        }
                    }
                )

            # Add speaker notes with image attribution
            if slide.get("background_image"):
                notes_text = f"Image source: {slide['background_image']}"
                if slide.get("speaker_notes"):
                    notes_text = f"{slide['speaker_notes']}\n\n{notes_text}"

                notes_id = f"notes_{slide['slide_number']}"
                # Speaker notes are added via the notesPage property
                # but require a separate approach — we skip for now
                # and include attribution in a comment

        # Execute all requests in a single batch
        if requests:
            self.service.presentations().batchUpdate(
                presentationId=self.presentation_id,
                body={"requests": requests},
            ).execute()
            print(f"Built {len(slide_data['slides'])} slides.")

    def get_url(self):
        """Return the presentation URL."""
        return f"https://docs.google.com/presentation/d/{self.presentation_id}/edit"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Convert MARP Markdown to Google Slides with Google brand styling."
    )
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument(
        "--input",
        type=str,
        help="Path to JSON file with parsed MARP slide data.",
    )
    input_group.add_argument(
        "--marp",
        type=str,
        help="Path to MARP Markdown file (will be parsed automatically).",
    )
    parser.add_argument(
        "--theme",
        type=str,
        default="google-classic",
        choices=list(THEMES.keys()),
        help="Google color theme to apply (default: google-classic).",
    )
    parser.add_argument(
        "--layout",
        type=str,
        default="full-bleed",
        choices=["full-bleed", "card", "split", "title-focused"],
        help="Layout style for slides (default: full-bleed).",
    )
    parser.add_argument(
        "--fonts",
        type=str,
        default="google-sans-roboto",
        choices=list(FONT_SETS.keys()),
        help="Font pairing to use (default: google-sans-roboto).",
    )
    parser.add_argument(
        "--title",
        type=str,
        default=None,
        help="Presentation title (overrides MARP title if provided).",
    )
    parser.add_argument(
        "--output-json",
        type=str,
        default=None,
        help="Save parsed slide data to this JSON path (useful for debugging).",
    )

    args = parser.parse_args()

    # Load or parse slide data
    if args.marp:
        print(f"Parsing MARP file: {args.marp}")
        slide_data = parse_marp_file(args.marp)
    else:
        with open(args.input, "r") as f:
            slide_data = json.load(f)

    # Override title if provided
    if args.title:
        slide_data["metadata"]["title"] = args.title

    # Save parsed JSON if requested
    if args.output_json:
        with open(args.output_json, "w") as f:
            json.dump(slide_data, f, indent=2)
        print(f"Saved parsed data to: {args.output_json}")

    title = slide_data["metadata"]["title"]
    print(f"Title: {title}")
    print(f"Slides: {slide_data['metadata']['total_slides']}")
    print(f"Theme: {args.theme}")
    print(f"Layout: {args.layout}")
    print(f"Fonts: {args.fonts}")
    print()

    # Authenticate and build
    creds = authenticate()
    builder = SlidesBuilder(creds, args.theme, args.layout, args.fonts)
    builder.create_presentation(title)
    builder.build_slides(slide_data)

    url = builder.get_url()
    print()
    print(f"Presentation created successfully!")
    print(f"URL: {url}")
    print()
    print("Open the URL above in your browser to view and edit the presentation.")


if __name__ == "__main__":
    main()
