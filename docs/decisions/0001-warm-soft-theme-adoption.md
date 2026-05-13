# ADR-001: Adoption of "Warm Soft (Editorial)" Visual Identity

## Status
Accepted

## Date
2026-05-13

## Context
The project initially explored a "Dark Industrial-Luxury" aesthetic. However, through iterative design and user feedback, a shift was made towards a "Warm Soft (Editorial)" theme. This theme emphasizes readability, paper-like textures, and a professional yet approachable editorial feel, utilizing the Comfortaa and Tajawal font families.

## Decision
We will exclusively use the "Warm Soft (Editorial)" theme for the HRM Unified platform. All legacy "Industrial" design tokens, components, and commented-out CSS code have been removed to maintain a clean, maintainable codebase (KISS/DRY).

## Consequences
- **Aesthetics:** The UI will feature soft oklch colors, rounded corners (0.75rem), and paper texture overlays.
- **Maintainability:** No "dead code" or unused theme variables will exist in the primary stylesheets.
- **Consistency:** All new components must adhere to the editorial typography and "SoftCard" patterns.
