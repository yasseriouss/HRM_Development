# DESIGN: Warm-Soft Suite

## Register
product

## Color Strategy: Restrained (Warm-Soft)
We use a cream-based palette with a single rust/terracotta accent.

### Palette (OKLCH)
- `--bg`: `oklch(97% 0.018 70)` (Cream White)
- `--surface`: `oklch(99% 0.008 70)` (Soft White)
- `--fg`: `oklch(22% 0.02 50)` (Deep Ink)
- `--muted`: `oklch(50% 0.018 50)` (Muted Taupe)
- `--border`: `oklch(92% 0.014 70)` (Hairline Warm Grey)
- `--accent`: `oklch(64% 0.13 28)` (Rust Accent)

## Typography
- **Display (English)**: `Comfortaa`, cursive (Geometric, soft)
- **Body (English)**: `Comfortaa`
- **Arabic**: `Tajawal` (Professional, clean)
- **Numeric**: Tabular-nums for metrics.

## Elevation & Posture
- **Radii**: `16px` (rounded-2xl) to `24px` for main cards.
- **Borders**: Hairline `1px` with subtle tints.
- **Shadows**: Soft, multi-layered ambient occlusion shadows. No hard drop shadows.
- **Texture**: Subtle paper grain overlay.

## Components
### Dashboard Cards
- Minimalist posture.
- No "corner marks".
- Hierarchy: Label (muted uppercase) -> Value (large fg) -> Subtext (accent/muted).

### Sidebar
- Floating glassmorphism or solid cream surface.
- High-contrast active states using the rust accent.
