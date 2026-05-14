# Visual Implementation Plan — Techno-Oasis

**Last updated:** 2026-05-14
**Status:** Plan only. No code changes in this document.

---

## 1. Art Direction Summary

The visual direction is **Techno-Oasis**: a soft, dreamy sci-fi world where ancient-scale organic structures and lush natural forms coexist with clean, rounded futuristic architecture. It is an oasis in a digital desert — calm, luminous, slightly surreal.

The mood is closer to a fever dream than a city. Think: lavender sand dunes with chrome orbs, cherry-blossom streets in a pastel future city, a luminous waterfall inside ancient ruins. Not gritty. Not threatening. Strange and beautiful.

This is **not generic cyberpunk**. There are no rain-slicked streets, no dark neon grids, no edgy fonts. The palette is light, the shapes are rounded, the atmosphere is hopeful and slightly alien.

The terrain reference is **OlliOlli World**: flat solid-fill platform surfaces, strong color contrast between the playable ground and background, small but clearly readable character, busy-but-organized background that never competes with the ground plane.

**Tone words:** dreamy / surreal / luminous / soft / alien-pastoral / biopunk-lite

---

## 2. Color Palette Proposal

All values are approximate starting points for implementation. Tune freely during development.

### Background sky
| Role | Color | Hex approx |
|---|---|---|
| Sky top | Dusty lavender | `#c2b8d8` |
| Sky bottom / horizon | Pale blue-grey | `#d8e4ee` |
| Atmospheric haze blend | Soft rose-white | `#e8d8d4` |

### Background structure tints (silhouettes)
| Role | Color | Hex approx |
|---|---|---|
| Far structures | Muted lilac | `#b0a8c8` |
| Mid structures | Faded teal-grey | `#8aacb0` |
| Near structures / foliage | Dusty sage | `#94aa90` |

### Terrain and ground
| Role | Color | Hex approx |
|---|---|---|
| Ground surface (top edge) | Warm terracotta / bright teal | See note below |
| Ground fill body | Muted ochre or deep slate | `#b89060` or `#2a3850` |
| Gap void | Same as sky, no fill |  |

> **Terrain surface note:** Two candidate palettes — choose one and commit for visual consistency.
> - **Warm palette:** terracotta surface `#e07850`, sand body `#c89a60`. Feels grounded, earthy.
> - **Cool palette:** bright teal surface `#40c8b0`, deep slate body `#2a3850`. Feels more sci-fi.
> The OlliOlli World references use both (different zones). For Techno-Oasis, the **cool palette** fits better — it matches the dreamy/alien mood.

### Player (skater)
| Role | Color | Hex approx |
|---|---|---|
| Deck | Near-black | `#1a1a2e` |
| Deck accent stripe | Iridescent (cyan → magenta gradient) | animated or baked |
| Wheels | Off-white or pale yellow | `#e8e0c0` |
| Trucks | Mid-grey | `#808090` |
| Body silhouette | Dark charcoal | `#1e2030` |

### Obstacles
| Role | Color | Hex approx |
|---|---|---|
| Block face | Warm amber-coral | `#d87840` |
| Block top edge highlight | Bright amber | `#f09840` |
| Block base shadow | Deep burnt sienna | `#804030` |

### Functional token colors (keep existing)
| Token | Color | Reason |
|---|---|---|
| Overclock | Cyan `#00e5ff` | Already established, reads well |
| Patch Pulse | Lime green `#80ff40` | Already established, reads well |

### HUD
| Role | Color | Hex approx |
|---|---|---|
| Panel background | Deep navy, ~85% opacity | `rgba(8, 12, 28, 0.85)` |
| Primary text | Cool white | `#e8eeff` |
| Accent / label | Soft periwinkle | `#8898cc` |
| Multiplier badge | Speed-tier color (existing system) |  |

---

## 3. Shape Language Rules

- **No sharp 90° cuts on decorative elements.** Terrain caps, structure silhouettes, and UI panels all get at least a 2–4px corner radius or a deliberate chamfer.
- **Terrain is flat fills.** No gradients on the terrain body itself — just flat fill + a 2–3px highlight line along the top edge.
- **Obstacles are clean rectangular blocks** with a bold top-edge highlight stripe (2px). Their silhouette must read instantly at speed.
- **Background structures use organic silhouette edges.** Towers have rounded tops, organic protrusions, or are partially obscured by soft silhouetted foliage.
- **Floating / suspended shapes** are welcome in the background (floating platforms, orbital rings, spheres). These reinforce the surreal/alien quality without impacting gameplay.
- **The player is a flat 2D shape** — skateboard deck + simplified rider. No complex perspective. Squash/stretch already in code should be preserved.
- **Tokens are geometric** (diamond, cross-ring) with a gentle pulsing glow. No complex sprite shapes.

---

## 4. Background Layer Plan

The renderer already does a 3-layer parallax grid. This plan replaces the grid with painted background bands.

### Layer order (back to front)

| Layer | Content | Parallax speed | Draw method |
|---|---|---|---|
| 0 — Sky | Vertical gradient fill, full canvas | Static (no scroll) | `createLinearGradient` top→bottom |
| 1 — Distant silhouettes | Far alien structures, obelisks, floating spheres, faint planetary ring | ~0.05× world speed | Simple filled polygon shapes, single muted-lilac fill |
| 2 — Mid silhouettes | Rounded towers, organic building clusters, faint foliage canopy | ~0.18× world speed | Slightly more saturated teal-grey, layered fills |
| 3 — Near silhouettes | Foreground structure stumps, large vegetation arches | ~0.38× world speed | Sage/green-grey, partially overlaps terrain |
| 4 — Terrain | Actual playable terrain (existing system) | 1.0× world speed | Existing terrain renderer, restyled fills |

**No bitmap images.** All layers are procedurally drawn with canvas path fills, matching the current zero-asset approach.

**Speed lines** (current implementation): keep but retint. Replace the white/grey lines with very faint lavender-white at low opacity (0.06–0.12). They suggest motion without clashing with the new palette.

---

## 5. Terrain Rendering Plan

Currently: terrain draws a simple filled polygon per segment.

### Proposed changes (rendering only, no system changes)

- **Surface top edge:** draw a 2–3px line in the bright teal accent color (`#40c8b0`) along the top of every non-gap segment. This is the primary readability cue.
- **Terrain body fill:** deep slate `#2a3850` with a very subtle (barely visible) inner top-edge gradient fading to `#1e2840` at bottom. Essentially flat.
- **Ramp segments:** same fill, same top-edge stripe. The angle itself communicates the ramp.
- **Gap segments:** no fill. The sky shows through. Add short vertical edge markers at gap sides (2px wide, teal) so the gap boundaries are explicit.
- **Flat-platform segments:** same as flat but the platform body is slightly lighter (`#344060`) to hint at elevation separation.
- **Underground "wall"** below canvas bottom: a single wide solid fill in near-black, so the ground doesn't float.

---

## 6. Player / Skater Rendering Plan

The player is currently a colored rectangle. The plan is a readable but stylized flat skater shape.

### Skateboard
- Elongated rounded rectangle for the deck (width ~38px, height ~7px as rendered on screen)
- Deck color: near-black `#1a1a2e`
- A single diagonal iridescent stripe across the deck center: short `createLinearGradient` from cyan to magenta. Width ~4px, spans deck width.
- Two small circles for wheels (radius ~4px), off-white fill, grey stroke
- Trucks: thin dark rectangle connecting deck underside to wheels

### Rider silhouette
- Simple flat shape: crouching humanoid, ~10px wide, ~14px tall (at base scale)
- Single fill: dark charcoal `#1e2030`
- No face detail, no limb separation — just a readable crouched blob shape
- Squash/stretch (already implemented) deforms the whole shape

### Speed-reactive color
Currently: player color shifts with speed. Keep this, but retarget:
- Slow: charcoal grey `#3a3a50`
- Fast: the deck stripe shifts to brighter cyan → the whole rider gets a very faint cyan rim-light (shadow blur, 4px, opacity 0.4)
- Overclock: existing cyan vignette is fine; player gains stronger cyan aura

### Trail
Currently: speed lines trailing behind player. Keep. Retint to soft cyan-white at low opacity (0.08–0.15 max).

---

## 7. Obstacle Visual Plan

Currently: plain colored rectangles (46×46px).

### Block design
- **Body fill:** warm amber-coral `#d87840`
- **Top highlight stripe:** 3px line in bright amber `#f09840` — this is the primary hit-zone visual cue
- **Left face shadow:** 3px line in deep sienna `#804030` on left edge
- **No texture.** Flat fills only.
- **Small glyph / marking (optional, low-priority):** a faint "!" or single-pixel pattern on the face to hint at "hazard". Only if it doesn't add visual noise.

### Readability test
The block must be immediately readable against both the teal terrain surface and the dark slate terrain body. Warm amber against cool teal has maximum contrast — this combination is intentional.

### Slope-mounted blocks
Same visual treatment. Their position on the slope is already handled by the collision system. No renderer changes needed to the positioning logic.

---

## 8. HUD Visual Plan

The HUD is currently canvas-drawn text and bars directly on screen.

### Design principles
- **Dark panel backgrounds** only where necessary (score area, meter bars). Not full-width overlays.
- **No thick borders.** Use 1px lines at low opacity (0.35–0.5) or no border at all.
- **Monospace font** (already in use). Keep it. Fits the software-pipeline theme without screaming generic cyberpunk.
- **Text color hierarchy:** hero value (score) in cool white `#e8eeff`, labels in soft periwinkle `#8898cc`, secondary stats in dimmer grey `#5a6480`.

### Element-by-element

| Element | Current state | Proposed style |
|---|---|---|
| Score (top-left) | White number | Keep. Increase font weight. Add very small "SCORE" label above in periwinkle. |
| Distance | White number | Keep. Same treatment as score. |
| Multiplier badge | Color-coded box | Keep color coding. Round corners to 4px. Subtle drop shadow. |
| Focus meter bar | Amber bar, left side | Keep. Round end caps. Add a faint amber glow (`shadowBlur: 6`) when full. |
| Overclock bar | Cyan bar under badge | Keep. Same glow treatment as focus. |
| Combo counter | Text float | Keep. Add a very brief scale-up pulse (already partially done). |
| Near-miss popup | Float/fade text | Keep. Retint to warm gold `#f0c060`. |
| HUD overlays (start/gameover) | Plain text | Dark semi-transparent panel, centered, rounded corners (8px). Single CTA in bright teal. |

---

## 9. Visual Effects Plan

Effects must be canvas-drawn, no external libraries.

| Effect | Current | Proposed |
|---|---|---|
| Speed lines | White lines radiating from player | Keep. Retint to faint lavender-white. Reduce opacity cap slightly. |
| Overclock vignette | Cyan edge glow | Keep. Already good. |
| Focus vignette | Amber edge pulse | Keep. Already good. |
| Landing ring | White ring on touchdown | Retint to soft teal, 2px stroke, fade out over 0.3s. |
| Patch Pulse shockwave | Lime green ring | Keep lime. It reads as "safe / cleansing" against the cool terrain. Add a very faint lime bloom (blur 8px, 0.15 opacity) inside the ring. |
| Token collect flash | Brief screen flash | Retint Overclock flash to cyan-white. Keep brief (0.14s). |
| Player glow at speed | Currently: colour change | Add canvas `shadowBlur: 8, shadowColor: #40c8b0` on the player rect when speed > 70% max. |
| World markers (death/best) | Simple vertical lines | Add a small icon above the line — a dot or arrow. Retint: last-death in soft red `#e06050`, best-run in gold `#f0c060`. |
| Background floating elements | None (grid only) | Add 2–3 slowly drifting faint shapes (circles, rings) in the layer 1 silhouette pass. Very slow horizontal drift, near-zero opacity. Optional. |

---

## 10. What to Avoid

- **Dark neon-on-black cyberpunk.** No pure-black backgrounds with glowing neon grids. The sky is never pure black.
- **Photorealistic textures.** No image imports, no texture fills, no normal maps. Everything is flat vector/canvas path.
- **Too many competing highlight colors.** Each visual layer (background, terrain, obstacle, player, token) owns a distinct color family. Do not mix warm amber into both obstacles and the terrain body.
- **Busy HUD during gameplay.** The HUD must recede except when actively communicating state. No persistent decorative frames or animated idle states on the score box.
- **Generic pixel art.** The UI reference that shows pixel-art wooden panels (Sprout Lands) and the bubbly cartoon buttons are not the target. The style is flat vector / canvas, not pixel art.
- **Complex particle systems.** Canvas 2D has no GPU particle system. Keep all effects to simple circle/arc/line primitives with opacity fades.
- **Anime speed-lines at rest.** Speed lines should only be visible above ~30% max speed. They should not appear while the player is stationary or very slow.
- **Copying OlliOlli World directly.** The terrain readability principle is borrowed from OlliOlli World (flat surface + contrasting fill), but the palette, background layers, and character design should be distinct.
