# Icons Design Spec — C25K Timer

**Date:** 2026-05-03  
**Status:** Approved

## Goal

Add a favicon for the webpage and a home screen icon for iPhone (via "Add to Home Screen"). Both use a retro pixel-art scene depicting a man running past a sofa with a clock in the background — matching the app's visual identity.

## Pixel Art Design

**Master size:** 32×32 pixels  
**Style:** Retro bitmap / pixel art — hard edges, no anti-aliasing, nearest-neighbor scaling only

**Color palette (~8 colors):**

| Name       | Hex       | Used for                        |
|------------|-----------|---------------------------------|
| Background | `#111111` | Background (matches app)        |
| Orange     | `#e85d04` | Runner's tee & shorts (app accent) |
| Light grey | `#cccccc` | Clock face                      |
| Mid grey   | `#888888` | Clock details, sofa outline     |
| Brown      | `#7c5c3a` | Sofa body                       |
| Skin       | `#f4c68c` | Runner's skin (head, arms, legs)|
| White      | `#f0f0f0` | Sneakers                        |
| Dark hair  | `#2a2a2a` | Runner's hair                   |

**Scene layout (32×32 grid):**

- **Clock** — top-right corner (~8×8 area): round face in light grey, tick marks in mid grey
- **Sofa** — lower-left (~12×8 area): blocky retro sofa in brown/mid-grey
- **Runner** — centre-right, striding pose: orange tee + shorts, skin-tone limbs, white sneakers, dark hair

## Output Files

| File                  | Size      | Purpose                                  |
|-----------------------|-----------|------------------------------------------|
| `favicon.png`         | 32×32 px  | Browser tab favicon                      |
| `apple-touch-icon.png`| 180×180 px| iPhone home screen icon                  |
| `manifest.json`       | —         | PWA manifest (name, colors, icon, standalone mode) |

`apple-touch-icon.png` is `favicon.png` scaled to 180×180 using nearest-neighbor interpolation to preserve pixel-art crispness.

## manifest.json Content

```json
{
  "name": "C25K Timer",
  "short_name": "C25K",
  "background_color": "#111111",
  "theme_color": "#e85d04",
  "display": "standalone",
  "start_url": ".",
  "icons": [
    {
      "src": "apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ]
}
```

## Changes to index.html

Four lines added to `<head>`, before `</head>`:

```html
<link rel="icon" type="image/png" href="favicon.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
```

## Icon Generation

A Node.js script `generate-icons.js` at the repo root draws the pixel art and exports both PNGs. It uses the `canvas` npm package (dev dependency).

The pixel art is defined as a coordinate map: an array of `[x, y, colorIndex]` tuples, with a separate color lookup table. The script:

1. Creates a 32×32 canvas and paints each pixel from the coordinate map
2. Writes `favicon.png`
3. Creates a 180×180 canvas, draws the 32×32 source scaled up using nearest-neighbor (`imageSmoothingEnabled = false`), writes `apple-touch-icon.png`

The generated PNGs are committed to the repo as static assets. `generate-icons.js` only needs to be re-run if the art changes.

## Success Criteria

- Browser tab shows the pixel-art icon
- On iPhone, "Add to Home Screen" produces a home screen icon showing the running-man scene
- App launches in standalone mode (no browser chrome) when opened from home screen
- Icon looks crisp (pixel-art edges preserved, no blur)
