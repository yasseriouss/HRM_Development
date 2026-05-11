# HRM Skill Matrix System - Architecture & Flow

This diagram outlines the high-level architecture and data flow of the HRM Skill Matrix System within the Grand Line ERP ecosystem, highlighting the bilingual parity and unified design standards.

```mermaid
graph TD
    subgraph "Core Infrastructure"
        DB[(PostgreSQL)]
        API[API Server]
        DB <--> API
    end

    subgraph "Main Platform Modules"
        Dash[Central Dashboard]
        SM[Skill Matrix]
        JE[Job Evaluation]
        Spread[Spreadsheet Manager]
        Docs[Technical Docs EN/AR]
        Pitch[Executive Pitch Deck EN/AR]
        API <--> Dash
        API <--> SM
        API <--> JE
        API <--> Spread
        API <--> Docs
        API <--> Pitch
    end

    subgraph "Atelier Zero Design Engine"
        I18n[useT Hook / LangProvider]
        Theme[ThemeProvider / Industrial Dark]
        I18n -.-> Dash
        I18n -.-> SM
        I18n -.-> JE
        I18n -.-> Spread
        I18n -.-> Docs
        I18n -.-> Pitch
        Theme -.-> Dash
        Theme -.-> SM
        Theme -.-> JE
        Theme -.-> Spread
        Theme -.-> Docs
        Theme -.-> Pitch
    end

    classDef luxury fill:#0A0A0A,stroke:#D4960A,stroke-width:2px,color:#E4DFD8;
    class DB,API,Dash,SM,JE,Spread,Docs,Pitch,I18n,Theme luxury;
```

> [!IMPORTANT]
> **Atelier Zero Industrial Standard**: The platform strictly adheres to the "Dark Industrial-Luxury" theme. All modules utilize `#0A0A0A` backgrounds with `#D4960A` (Metallic Gold) accents. UI consistency is enforced via a shared `Layout` shell and centralized CSS variables.

## System Breakdown

### 1. Centralized Dashboard
The core hub for organizational telemetry. Provides real-time insights into employee performance classes (A/B/C) across 9 departments.

### 2. Skill Matrix & Job Evaluation
Twin modules for granular competency tracking and job-role alignment. Supports weighted scoring formulas and automated training gap identification.

### 3. Integrated Documentation & Pitch Deck
- **Docs**: A comprehensive technical manual (EN/AR) for both developers and HR administrators.
- **Pitch Deck**: A 16-slide high-fidelity presentation for stakeholder engagement, fully localized and theme-aware.

### 4. Bilingual Core (EN/AR)
The system achieves 100% parity between English and Arabic. RTL/LTR transitions are handled automatically via the `LangProvider`, ensuring a seamless user experience for all personnel.

### 5. Unified Navigation & Theme
The platform uses a conditional `Layout` shell that provides a global Sidebar, Topbar, and Theme Toggle, while allowing full-width flexibility for the presentation and documentation modules.
