# HRM Unified: Project Instructions

## Visual Identity: Warm Soft (Editorial)
**MANDATORY:** This project uses the "Warm Soft (Editorial)" theme. The "Dark Industrial-Luxury" global preference is EXPLICITLY OVERRIDDEN.

*   **Colors:** Cream-based oklch palette.
    *   `--bg`: `oklch(97% 0.018 70)`
    *   `--surface`: `oklch(99% 0.008 70)`
    *   `--accent`: `oklch(64% 0.13 28)` (Rust)
*   **Typography:** English: `Comfortaa`, Arabic: `Tajawal`.
*   **Aesthetic:** Editorial, paper-like, professional, approachable.
*   **Geometry:** Rounded corners (16px to 24px), soft shadows, hairline borders.

## Architecture
*   **Frontend:** React (Vite), TypeScript.
*   **Backend:** Node.js (Express) in `server/`.
*   **Database:** Drizzle ORM + Postgres (as seen in `lib/db/`).
*   **Structure:** Modular features in `src/modules/`.

## Quality Standards
*   **KISS/DRY:** Remove legacy industrial code.
*   **Responsive:** Use mobile-first patterns (leveraging `responsive-craft` skill).
*   **I18n:** Support English and Arabic (Tajawal font).
