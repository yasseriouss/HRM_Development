# EBDAA SKILL MATRIX WEB SYSTEM
## Comprehensive Planning & Implementation Document

**Version:** 1.0  
**Date:** May 2026  
**Client:** Ebdaa (Wood Manufacturing Factory)  
**System Name:** Ebdaa Factory OS - Skill Matrix Management System

---

## 📋 EXECUTIVE SUMMARY

**Objective:** Build a modern web-based Skill Matrix Management System for Ebdaa's 146+ employees across 13 departments, replacing the Excel-based system with an intelligent, real-time tracking platform.

**Key Benefits:**
- 🎯 Real-time skill tracking across all departments
- 📊 Automated performance scoring & classification (A/B/C)
- 🎓 Intelligent training recommendations
- 📈 Department-level analytics & insights
- 🔐 Role-based access control (HR, Managers, Employees)
- 📱 Responsive design (Desktop/Tablet/Mobile)

**Budget Estimate:** $8,000 - $12,000 (MVP)  
**Timeline:** 6-8 weeks (2 months)  
**Team Size:** 2-3 developers + 1 QA

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

### 1.1 Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                        │
│  React 18 + TypeScript | Vite | Tailwind CSS            │
│  Recharts | Framer Motion | Radix UI / Shadcn UI        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    API LAYER (REST)                      │
│  Built on Supabase Edge Functions (Node.js)             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  DATABASE LAYER                          │
│  Supabase (PostgreSQL) | Row Level Security (RLS)       │
│  Real-time Subscriptions | Auth0 Integration            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 DEPLOYMENT & HOSTING                     │
│  Frontend: Vercel / Netlify (CDN + Auto-scaling)        │
│  Backend: Supabase Cloud + Edge Functions               │
│  Storage: AWS S3 / Supabase Storage (File Uploads)      │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Design Theme: "Minimalist Dark Industrial-Luxury"

**Color Palette:**
- **Primary Background:** `bg-slate-950` (Dark Charcoal)
- **Text:** Off-white/Light gray
- **Accent:** Amber/Safety Orange + Deep Steel Blue
- **Data Visualization:** Green (Strong) → Yellow (Medium) → Red (Weak)

**Typography:**
- Headings: Bold, Uppercase for sections
- Body: Clean, readable sans-serif (Inter/Poppins)

**Components:**
- Cards with subtle shadow/border
- Smooth transitions (Framer Motion)
- Icon-driven UI (Heroicons)

---

## 2. DATABASE SCHEMA (Supabase PostgreSQL)

### 2.1 Core Tables

#### `users` - Authentication & Access Control
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role ENUM('super_admin', 'dept_head', 'hr_coordinator', 'employee') DEFAULT 'employee',
  department_id UUID REFERENCES departments(id) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `departments` - Organizational Structure
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  code VARCHAR(10) UNIQUE,
  manager_id UUID REFERENCES users(id),
  manager_email VARCHAR(255),
  created_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `employees` - Employee Master Data
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code VARCHAR(20) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  department_id UUID REFERENCES departments(id) NOT NULL,
  job_title VARCHAR(255),
  joined_date DATE,
  current_class ENUM('A', 'B', 'C') DEFAULT 'C',
  email VARCHAR(255),
  user_id UUID REFERENCES users(id) UNIQUE NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_department (department_id),
  INDEX idx_current_class (current_class)
);
```

#### `skills` - Skill Library (Department-specific)
```sql
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE,
  name VARCHAR(255) NOT NULL,
  department_id UUID REFERENCES departments(id) NOT NULL,
  category VARCHAR(100),
  weight INTEGER CHECK (weight BETWEEN 1 AND 5),
  criticality ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_department (department_id)
);
```

#### `evaluation_campaigns` - Evaluation Management
```sql
CREATE TABLE evaluation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  type ENUM('Monthly', 'Quarterly', 'Bi-Annually', 'Custom') DEFAULT 'Monthly',
  department_id UUID REFERENCES departments(id),
  status ENUM('Draft', 'Active', 'Completed', 'Archived') DEFAULT 'Draft',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  triggered_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_status (status),
  INDEX idx_department (department_id)
);
```

#### `evaluations` - Individual Skill Scores
```sql
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES evaluation_campaigns(id) NOT NULL,
  employee_id UUID REFERENCES employees(id) NOT NULL,
  skill_id UUID REFERENCES skills(id) NOT NULL,
  score INTEGER CHECK (score BETWEEN 0 AND 4),
  notes TEXT,
  evaluated_by UUID REFERENCES users(id),
  evaluation_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id, employee_id, skill_id),
  INDEX idx_campaign (campaign_id),
  INDEX idx_employee (employee_id),
  INDEX idx_skill (skill_id)
);
```

#### `evaluation_summaries` - Calculated Performance (View/Cache)
```sql
CREATE TABLE evaluation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES evaluation_campaigns(id) NOT NULL,
  employee_id UUID REFERENCES employees(id) NOT NULL,
  total_score DECIMAL(10, 2),
  max_possible_score DECIMAL(10, 2),
  percentage DECIMAL(5, 2),
  class ENUM('A', 'B', 'C'),
  evaluated_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id, employee_id),
  INDEX idx_campaign (campaign_id),
  INDEX idx_employee (employee_id)
);
```

#### `training_recommendations` - Auto-Generated Training Plans
```sql
CREATE TABLE training_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) NOT NULL,
  skill_id UUID REFERENCES skills(id),
  campaign_id UUID REFERENCES evaluation_campaigns(id),
  score INTEGER,
  recommendation_type ENUM('Immediate', 'Short-term', 'Long-term', 'Promotion'),
  status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
  assigned_trainer_id UUID REFERENCES users(id) NULL,
  target_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_employee (employee_id)
);
```

### 2.2 Row Level Security (RLS) Policies

```sql
-- POLICY 1: Super Admin - Full Access
CREATE POLICY super_admin_policy ON evaluations
  FOR ALL USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
  );

-- POLICY 2: Department Head - Own Department Only
CREATE POLICY dept_head_policy ON evaluations
  FOR INSERT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'dept_head'
    AND department_id = (SELECT department_id FROM users WHERE id = auth.uid())
    AND (SELECT status FROM evaluation_campaigns WHERE id = campaign_id) = 'Active'
  );

-- POLICY 3: HR Coordinator - Read-Only
CREATE POLICY hr_readonly_policy ON evaluations
  FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'hr_coordinator'
  );

-- POLICY 4: Employee - Own Profile Only
CREATE POLICY employee_readonly_policy ON employees
  FOR SELECT USING (
    user_id = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('super_admin', 'hr_coordinator', 'dept_head')
  );
```

### 2.3 Database Relationships Diagram

```
┌──────────────────┐
│     users        │
│ (Auth + Roles)   │
└────────┬─────────┘
         │ manages
    ┌────▼─────────┐
    │ departments  │
    └────┬─────────┘
         │ contains
    ┌────▼──────────┐        ┌──────────────┐
    │  employees    │◄───────┤ evaluation_  │
    └────┬──────────┘        │ campaigns    │
         │                   └──────┬───────┘
         │ has skills               │ contains
    ┌────▼──────────┐        ┌──────▼───────────┐
    │    skills     │        │  evaluations     │
    └───────────────┘        │ (skill scores)   │
                             └──────┬───────────┘
                                    │ aggregates
                             ┌──────▼──────────────┐
                             │ evaluation_         │
                             │ summaries (A/B/C)   │
                             └─────────────────────┘
```

---

## 3. ROLE-BASED ACCESS CONTROL (RBAC)

### 3.1 User Roles & Permissions

| Role | View Own Data | View Dept Data | View All Data | Edit Own Dept | Trigger Campaigns | System Admin |
|------|---|---|---|---|---|---|
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Dept Head** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **HR Coordinator** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Employee** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 3.2 Access Matrix by Feature

**Dashboard View:**
- Super Admin: Company + All Departments + KPIs
- Dept Head: Own Department + Team Performance
- HR: Analytics Dashboard (Read-only)
- Employee: Personal Dashboard (Skills + Progress)

**Skill Matrix Grid:**
- Super Admin: Full Edit Access
- Dept Head: Edit only own department, during active campaign
- HR: Read-only with filters
- Employee: Cannot access

**Reports:**
- Super Admin: All reports
- Dept Head: Department-specific reports
- HR: All reports (read-only)
- Employee: Personal report only

---

## 4. CORE BUSINESS LOGIC (Math Engine)

### 4.1 Evaluation Scale

```
0 = Cannot perform / Not trained (Red: #DC2626)
1 = Can perform with constant supervision (Orange: #EA580C)
2 = Can perform with occasional supervision (Yellow: #FBBF24)
3 = Can perform independently (Lime: #84CC16)
4 = Expert / Can train others (Green: #10B981)
```

### 4.2 Weighted Score Calculation

**Formula:**
```
Total Score = Σ(Employee_Skill_Score × Skill_Weight)
Max Score = Σ(4 × Skill_Weight)
Percentage = (Total Score / Max Score) × 100
```

**Example (Upholstery Department):**

Employee: Ahmed (Score: 4, 4, 3, 4, 4, 4)
Skills: Assembly(W:4), Seam(W:4), Sewing(W:3), Spring(W:3), Finish(W:4), Shimmer(W:2)

```
Total = (4×4) + (4×4) + (3×3) + (4×3) + (4×4) + (4×2)
      = 16 + 16 + 9 + 12 + 16 + 8
      = 77 points

Max = (4×4) + (4×4) + (4×3) + (4×3) + (4×4) + (4×2)
    = 16 + 16 + 12 + 12 + 16 + 8
    = 80 points

Percentage = (77 / 80) × 100 = 96.25% → CLASS A
```

### 4.3 Performance Classification

```
┌─────────────────────────────────────────────────┐
│ CLASS A (85-100%) → PROMOTION READY             │
│ ✅ Ready for advancement                        │
│ ✅ Can mentor junior staff                      │
│ ✅ Core competency mastered                     │
│ Action: Succession Planning, Advanced Training │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ CLASS B (60-79%) → CORE PERFORMER              │
│ ⚠️ Competent but needs targeted training       │
│ ⚠️ Some skills gaps identified                 │
│ ⚠️ Ready for more responsibility               │
│ Action: Mid-term Training Plan                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ CLASS C (<60%) → UNDERPERFORMER                │
│ ❌ Significant skill gaps                       │
│ ❌ Requires intensive support                   │
│ ❌ New employee or needs reassessment           │
│ Action: Immediate Training, Mentoring, or T/T  │
└─────────────────────────────────────────────────┘
```

### 4.4 Training Recommendations Engine

**Auto-Generated Based on:**

1. **Class C Score (<60%):**
   - Immediate training plan needed
   - One-on-one mentoring from dept head
   - Re-evaluation in 30 days
   - Possible transfer/lay-off if no improvement

2. **Class B Score (60-79%):**
   - Mid-term training for weak areas
   - Group training sessions
   - Quarterly progress tracking

3. **Class A Score (85-100%):**
   - Advanced certification programs
   - Trainer development
   - Leadership training if applicable

---

## 5. IMPLEMENTATION PHASES & ROADMAP

### PHASE 1: FOUNDATION & SETUP (Week 1)
**Deliverables:**
- ✅ React + Vite project initialized
- ✅ Tailwind CSS configured (Dark Industrial-Luxury theme)
- ✅ Persistent layout (Sidebar + Top Nav)
- ✅ Supabase project created & PostgreSQL schema deployed
- ✅ Auth system setup (Email + Social login option)
- ✅ RLS policies implemented

**Tasks:**
1. Setup React project structure
2. Configure Tailwind with custom theme
3. Create layout components (Sidebar, Header, Footer)
4. Initialize Supabase client
5. Deploy database schema
6. Setup environment variables (.env.local)

**Deliverable:** Skeleton app with login screen + authenticated navigation

---

### PHASE 2: CORE DATA MANAGEMENT (Week 2-3)
**Deliverables:**
- ✅ Master data CRUD (Departments, Employees, Skills)
- ✅ Bulk Excel Importer (Map & seed from existing file)
- ✅ Campaign Manager (Create, Activate, Complete campaigns)
- ✅ Interactive Skill Matrix Grid (Data entry form)

**Tasks:**
1. Build Master Data forms:
   - Department Management
   - Employee Management
   - Skills Library Management

2. Build Excel Importer:
   - File upload handler
   - Column mapping UI
   - Data validation
   - Batch insert logic

3. Build Campaign Manager:
   - Campaign creation wizard
   - Status management
   - Notification system (when campaign goes live)

4. Build Skill Matrix Grid:
   - Dynamic Excel-like grid
   - Cell editing with validation
   - Auto-save functionality
   - Color-coded scores (0-4)

**Deliverable:** Functional data entry system with Excel import capability

---

### PHASE 3: CALCULATIONS & SCORING (Week 3-4)
**Deliverables:**
- ✅ Math Engine (Weighted scoring calculation)
- ✅ Automatic A/B/C classification
- ✅ Evaluation summary generation
- ✅ Training recommendations engine

**Tasks:**
1. Implement scoring calculations:
   - Total score = Σ(Score × Weight)
   - Percentage = (Total / Max) × 100
   - Class assignment logic

2. Build evaluation_summaries table:
   - Trigger function on evaluation insert/update
   - Auto-calculate totals & percentages
   - Update employee.current_class

3. Implement training recommendations:
   - Auto-generate based on score
   - Assign trainers
   - Set target dates

4. Create calculation dashboard:
   - Show calculation methodology
   - Display sample calculations
   - Documentation

**Deliverable:** Automated scoring system with real-time calculations

---

### PHASE 4: ANALYTICS & VISUALIZATION (Week 4-5)
**Deliverables:**
- ✅ Executive Dashboard (KPIs, comparisons)
- ✅ Department Performance Dashboard
- ✅ Individual Skill Cards (Radar charts, progression)
- ✅ Heatmaps (Skills matrix by department)
- ✅ Training Needs Analysis

**Tasks:**
1. Build Executive Dashboard:
   - Total employees: 146
   - Average skill level by department
   - Class distribution (A/B/C breakdown)
   - Department performance comparison (Bar chart)
   - Active campaigns status
   - Recent evaluations

2. Build Department Dashboard:
   - Team composition
   - Skill strength profile (Radar/Spider chart)
   - Training needs (Top 5 critical gaps)
   - Performance trend (Line chart)

3. Build Individual Skill Card:
   - Personal radar chart (all skills)
   - Historical progression (Line chart)
   - Comparison vs department average
   - Personal recommendations

4. Build Heatmaps:
   - Skills vs Employees grid
   - Color intensity = proficiency level
   - Dept-level heatmaps
   - Company-wide heatmap

**Deliverable:** Rich analytical dashboards with real-time charts

---

### PHASE 5: REPORTING & EXPORT (Week 5-6)
**Deliverables:**
- ✅ PDF Report Generator (Individual, Department, Company)
- ✅ Excel Export (Skill matrices, evaluations)
- ✅ Training Plans (Printable/Email)
- ✅ Audit Trail (Who evaluated whom, when)

**Tasks:**
1. Build Report Generator:
   - Individual performance report (PDF)
   - Department summary report (PDF)
   - Company-wide analytics report (PDF)
   - Training needs report (PDF)

2. Build Export System:
   - Excel export of skill matrices
   - CSV export of evaluations
   - Raw data export

3. Build Audit Trail:
   - Track all evaluations (Who, What, When)
   - Track system changes
   - Compliance logging

**Deliverable:** Comprehensive reporting suite

---

### PHASE 6: OPTIMIZATION & POLISH (Week 6-7)
**Deliverables:**
- ✅ Performance optimization
- ✅ UI/UX refinement
- ✅ Mobile responsiveness
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Error handling & validation

**Tasks:**
1. Performance:
   - Code splitting with lazy loading
   - Optimize database queries (Indexes)
   - Image optimization
   - Caching strategy

2. UI/UX:
   - Polish animations
   - Improve form validation messages
   - Better error handling
   - Keyboard navigation

3. Mobile:
   - Responsive layout adjustments
   - Touch-friendly inputs
   - Mobile-optimized navigation

4. Testing:
   - User acceptance testing (UAT)
   - Bug fixes from testing
   - Load testing

**Deliverable:** Production-ready application

---

### PHASE 7: DEPLOYMENT & TRAINING (Week 7-8)
**Deliverables:**
- ✅ Production deployment (Vercel + Supabase)
- ✅ User training materials
- ✅ Admin documentation
- ✅ Support plan

**Tasks:**
1. Deployment:
   - Setup production environment
   - Configure CI/CD pipeline
   - Database backup strategy
   - SSL certificates

2. Training:
   - User training videos
   - Admin quick-start guide
   - Department head training
   - IT support documentation

3. Rollout:
   - Soft launch (Test with small group)
   - Full company rollout
   - On-site support during launch
   - Feedback collection

**Deliverable:** Live production system + trained users

---

## 6. DETAILED FEATURE BREAKDOWN

### 6.1 Feature List (MVP)

**Authentication & Access Control:**
- [ ] Email/password login
- [ ] Role-based route protection
- [ ] Password reset flow
- [ ] Session management

**Master Data Management:**
- [ ] Department CRUD (Create, Read, Update, Delete)
- [ ] Employee CRUD + bulk import
- [ ] Skills library management
- [ ] User management (Create staff accounts)

**Evaluation Management:**
- [ ] Campaign creation wizard
- [ ] Campaign status management (Draft → Active → Completed)
- [ ] Bulk employee assignment to campaigns
- [ ] Evaluation form (Interactive Skill Matrix Grid)
- [ ] Score validation (0-4 only)
- [ ] Notes/comments per evaluation

**Calculations & Classification:**
- [ ] Automatic weighted scoring
- [ ] Percentage calculation
- [ ] A/B/C classification logic
- [ ] Training recommendations engine

**Dashboards & Reports:**
- [ ] Executive dashboard (KPIs)
- [ ] Department performance dashboard
- [ ] Individual skill card (with radar chart)
- [ ] Heatmap visualization
- [ ] PDF export
- [ ] Excel export

**Data Import/Export:**
- [ ] Excel file upload & parsing
- [ ] Column mapping UI
- [ ] Batch data import
- [ ] Data validation & error reporting

**Notifications:**
- [ ] Email notification when campaign starts
- [ ] Email notification when evaluation complete
- [ ] In-app notifications

**Audit & Compliance:**
- [ ] Audit trail (All changes logged)
- [ ] Data export for compliance
- [ ] Backup scheduling

---

### 6.2 Advanced Features (Phase 2 - Optional)

- [ ] Mobile app (React Native)
- [ ] Offline capability (PWA)
- [ ] Training program integration
- [ ] Skill certification tracking
- [ ] Succession planning module
- [ ] Career path recommendations
- [ ] Performance bonus calculations
- [ ] Multi-language support (Arabic/English)
- [ ] Two-factor authentication (2FA)
- [ ] Advanced analytics (Machine Learning predictions)

---

## 7. TECHNICAL SPECIFICATIONS

### 7.1 Frontend Architecture

```
src/
├── components/
│   ├── Layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopNav.tsx
│   │   └── LayoutWrapper.tsx
│   ├── Dashboard/
│   │   ├── ExecutiveDashboard.tsx
│   │   ├── DepartmentDashboard.tsx
│   │   └── EmployeeDashboard.tsx
│   ├── Evaluations/
│   │   ├── SkillMatrixGrid.tsx
│   │   ├── CampaignManager.tsx
│   │   └── EvaluationForm.tsx
│   ├── Reports/
│   │   ├── ReportGenerator.tsx
│   │   ├── IndividualCard.tsx
│   │   └── Heatmap.tsx
│   └── Common/
│       ├── DataTable.tsx
│       ├── FormField.tsx
│       └── LoadingSpinner.tsx
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Evaluations.tsx
│   ├── Reports.tsx
│   ├── Settings.tsx
│   └── 404.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useEvaluations.ts
│   └── useCalculations.ts
├── services/
│   ├── supabaseClient.ts
│   ├── authService.ts
│   ├── evaluationService.ts
│   └── reportService.ts
├── types/
│   ├── database.ts
│   ├── user.ts
│   └── evaluation.ts
├── utils/
│   ├── calculateScore.ts
│   ├── formatters.ts
│   └── validators.ts
└── App.tsx
```

### 7.2 Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^4.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "tailwindcss": "^3.3.0",
    "@heroicons/react": "^2.0.0",
    "recharts": "^2.10.0",
    "framer-motion": "^10.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "zod": "^3.20.0",
    "react-hook-form": "^7.45.0",
    "axios": "^1.4.0",
    "date-fns": "^2.30.0",
    "xlsx": "^0.18.0",
    "jspdf": "^2.5.0",
    "html2canvas": "^1.4.0"
  }
}
```

### 7.3 Deployment Infrastructure

**Frontend Hosting:**
- Platform: Vercel or Netlify
- Auto-deploy from GitHub (main branch)
- Environment variables: API_URL, SUPABASE_KEY, etc.

**Backend:**
- Supabase Cloud (Managed PostgreSQL)
- Edge Functions (Serverless)
- Authentication (Supabase Auth)
- Real-time subscriptions enabled

**Database:**
- PostgreSQL 14+
- Automated backups (daily)
- Point-in-time recovery (30 days)

**Monitoring:**
- Sentry (Error tracking)
- LogRocket (Session replay)
- Analytics (Google Analytics 4)

---

## 8. DATA MIGRATION STRATEGY

### 8.1 Migration Steps

1. **Extract from Current Excel:**
   - Export all sheets
   - Clean & validate data
   - Map columns to new schema

2. **Prepare Master Data:**
   - Departments: 9 departments
   - Skills: ~65 skills across departments
   - Employees: 146 employees
   - Evaluation Campaigns: Historical campaigns

3. **Import Process:**
   - Use Excel importer tool in Phase 2
   - Validate all data before import
   - Test with sample data first
   - Full data import in production

4. **Historical Data:**
   - Store past evaluations in `evaluations` table
   - Generate historical `evaluation_summaries`
   - Preserve audit trail

---

## 9. TESTING STRATEGY

### 9.1 Test Coverage

**Unit Tests (React Components):**
- Component rendering
- Props validation
- State management

**Integration Tests:**
- Database interactions
- API responses
- RLS policy enforcement

**E2E Tests (Cypress):**
- User login flow
- Evaluation entry workflow
- Report generation
- Dashboard rendering

**Performance Tests:**
- Load testing (1000+ concurrent users)
- Database query optimization
- API response times (<200ms)

---

## 10. SUPPORT & MAINTENANCE

### 10.1 Post-Launch Support

**Phase 1 (Month 1-2):** Active Support
- Daily monitoring
- Bug fixes (SLA: 24 hours for critical)
- User support (Email + Slack channel)

**Phase 2 (Month 3-6):** Transition to Maintenance
- Weekly monitoring
- Feature requests logging
- Performance optimization

**Phase 3 (Month 6+):** Steady State
- Monthly health checks
- Quarterly updates
- User support as needed

### 10.2 SLA Commitments

- **System Uptime:** 99.5%
- **Critical Bug Fix:** 24 hours
- **Feature Request Response:** 5 business days
- **Data Backup:** Daily automatic + weekly manual

---

## 11. COST BREAKDOWN

### 11.1 Development Costs

| Item | Cost |
|------|------|
| Backend Development (Supabase setup, RLS, Edge Functions) | $2,000 |
| Frontend Development (React, UI/UX, Integration) | $4,000 |
| Dashboard & Analytics (Charts, Reports) | $1,500 |
| Testing & QA | $1,000 |
| Deployment & DevOps | $800 |
| Documentation & Training | $500 |
| **TOTAL DEVELOPMENT** | **$10,000** |

### 11.2 Infrastructure Costs (Annual)

| Item | Cost/Month |
|------|-----------|
| Supabase (Pro tier) | $25 |
| Vercel (Hobby + occasional Pro build) | $20 |
| Email service (SendGrid) | $10 |
| Monitoring (Sentry) | $29 |
| **TOTAL MONTHLY** | **$84** |
| **ANNUAL** | **$1,000** |

---

## 12. RISK MANAGEMENT

### 12.1 Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|-----------|--------|-----------|
| Data migration issues | Medium | High | Thorough testing with sample data |
| User adoption resistance | Medium | Medium | Comprehensive training + documentation |
| Performance at scale (146+ users) | Low | High | Load testing + database optimization |
| Data loss/corruption | Low | Critical | Automated backups + point-in-time recovery |
| RLS policy misconfiguration | Low | High | Thorough testing + code review |

### 12.2 Contingency Plans

1. **If data migration fails:** Rollback to Excel system, retry after data cleaning
2. **If performance is poor:** Implement caching, optimize queries, add indexes
3. **If adoption is low:** Increase training, create video tutorials, assign power users as champions

---

## 13. SUCCESS METRICS

### 13.1 KPIs to Track

- **Adoption:** % of users with login activity (Target: 80% in month 1)
- **Data Quality:** % of complete evaluations per campaign (Target: 90%)
- **System Performance:** API response time <200ms (Target: 95th percentile)
- **User Satisfaction:** NPS score >40 (Target: In-app survey)
- **Uptime:** 99.5% (Target: Monitored via Sentry)

### 13.2 Business Outcomes

- ✅ Real-time visibility into skill levels across factory
- ✅ Faster identification of training needs (vs monthly Excel review)
- ✅ Data-driven promotions & succession planning
- ✅ Reduced time spent on manual Excel data entry (>10 hours/month saved)
- ✅ Better decision-making with automated analytics

---

## 14. NEXT STEPS

### Immediate Actions (This Week)

1. **Review** this planning document with stakeholders
2. **Confirm** answers to 7 clarification questions (see below)
3. **Set up** development environment:
   - Supabase project creation
   - GitHub repository setup
   - Vercel/Netlify account
4. **Schedule** kick-off meeting with development team

### Clarification Questions (Recap)

Please confirm these details:

1. **Campaign Automation:** Should campaigns auto-trigger (e.g., first Monday of month) or manual trigger by HR?
2. **Multi-Department Skills:** Can employees have skills from multiple departments?
3. **Historical Data:** How far back should we track (6 mo/1 yr/all-time)?
4. **Training Assignments:** Auto-generated or manually assigned by department heads?
5. **Real-time Notifications:** Email updates during campaigns or batch notifications at end?
6. **Export Compliance:** Need data export for audits? How frequently?
7. **Mobile Priority:** Tablet support for shop floor evaluations?

---

## APPENDIX A: Glossary

- **Campaign:** A time-bound evaluation period (Monthly, Quarterly, etc.)
- **Skill:** A specific competency (e.g., "CNC Drilling")
- **Weight:** Importance multiplier (1-5) for skill calculations
- **Score:** Employee's proficiency level in a skill (0-4)
- **Class:** Performance category (A/B/C) based on percentage score
- **RLS:** Row-Level Security - Supabase feature for fine-grained access control
- **Edge Function:** Serverless function running at edge for fast API responses

---

**Document Owner:** Development Team  
**Last Updated:** May 3, 2026  
**Status:** Ready for Development ✅
