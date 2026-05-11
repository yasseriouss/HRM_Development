# HRM Unified Platform - Technical Architecture & Strategy (EN)

## 1. Entity Relationship Diagram (ERD)
This diagram illustrates the core data structure and relationships between personnel, evaluations, and operational workflows.

```mermaid
erDiagram
    USERS ||--o| EMPLOYEES : "links_to"
    DEPARTMENTS ||--o{ EMPLOYEES : "contains"
    DEPARTMENTS ||--o{ WORKFLOWS : "governs"
    CAMPAIGNS ||--o{ EVALUATIONS : "aggregates"
    CAMPAIGNS ||--o{ EVALUATION_SUMMARIES : "finalizes"
    EMPLOYEES ||--o{ EVALUATIONS : "receives"
    EMPLOYEES ||--o{ EVALUATION_SUMMARIES : "assessed_in"
    EMPLOYEES ||--o{ TRAINING : "assigned_to"
    SKILLS ||--o{ EVALUATIONS : "measured_by"
    SKILLS ||--o{ TRAINING : "targets"
    WORKFLOWS ||--o{ EVALUATIONS : "validates"

    USERS {
        uuid id PK
        string email UK
        string role "Admin, Manager, Employee"
        uuid employee_id FK
    }

    EMPLOYEES {
        uuid id PK
        string full_name
        uuid dept_id FK
        string current_class "A, B, C"
    }

    DEPARTMENTS {
        uuid id PK
        string name
        uuid manager_id FK
    }

    SKILLS {
        uuid id PK
        string name
        string category
        int weight
    }

    CAMPAIGNS {
        uuid id PK
        string title
        string status "Active, Completed"
        date start_date
    }

    EVALUATIONS {
        uuid id PK
        uuid campaign_id FK
        uuid employee_id FK
        uuid skill_id FK
        int score "0-4"
    }

    TRAINING {
        uuid id PK
        uuid employee_id FK
        uuid skill_id FK
        string type "Immediate, Long-Term"
        string status "Pending, Completed"
    }
```

## 2. System Operational Flow
The "Industrial Intelligence" cycle from initialization to automated training recommendations.

```mermaid
graph TD
    A[Campaign Initialization] -->|Admin Defines| B(Active Evaluation Window)
    B -->|Managers/Heads| C{Score Entry Grid}
    C -->|Weighted Avg| D[Performance Classification]
    D -->|Class A/B/C| E{AI Insights Engine}
    E -->|Urgent Gaps| F[Training Recommendations]
    E -->|Approvals| G[Workflow Protocol Chain]
    F -->|Skill Growth| H[Employee Profile Update]
    G -->|Finalized| I[Operational Archive]
    H -->|Next Cycle| A
```

## 3. Implementation Roadmap
Strategic delivery timeline for the HRM Unified Platform.

```mermaid
timeline
    title HRM Unified Roadmap 2026
    Phase 1 : Foundation : DB Schema Optimization : Auth System : Core Registry
    Phase 2 : Modules : Dashboard Analytics : Spreadsheet Integration : Interactive Manual
    Phase 3 : Intelligence : AI Insights Engine : Automated Training Plans : Workflow Chain
    Phase 4 : Excellence : Bilingual Parity (EN/AR) : Industrial UX Polish : Final Security Audit
```
