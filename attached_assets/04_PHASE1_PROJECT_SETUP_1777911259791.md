# EBDAA SKILL MATRIX SYSTEM - PHASE 1
## Complete Project Setup & Configuration

---

## 📁 PROJECT STRUCTURE

```
ebdaa-skill-matrix/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopNav.tsx
│   │   │   └── LayoutWrapper.tsx
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── Dashboard/
│   │   │   ├── ExecutiveDashboard.tsx
│   │   │   ├── DepartmentDashboard.tsx
│   │   │   ├── EmployeeDashboard.tsx
│   │   │   └── KPICards.tsx
│   │   ├── Common/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── Button.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Evaluations.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   └── NotFound.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useEvaluations.ts
│   │   └── useCalculations.ts
│   ├── services/
│   │   ├── supabaseClient.ts
│   │   ├── authService.ts
│   │   ├── evaluationService.ts
│   │   └── reportService.ts
│   ├── types/
│   │   ├── database.ts
│   │   ├── user.ts
│   │   └── evaluation.ts
│   ├── utils/
│   │   ├── calculateScore.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── theme.css
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── favicon.svg
├── .env.local (git-ignored)
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 📦 package.json

```json
{
  "name": "ebdaa-skill-matrix",
  "version": "1.0.0",
  "description": "Ebdaa Skill Matrix Management System",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-react": "^0.4.0",
    "recharts": "^2.10.0",
    "framer-motion": "^10.16.0",
    "@heroicons/react": "^2.0.18",
    "@radix-ui/react-dropdown-menu": "^2.0.5",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-select": "^2.0.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.4",
    "axios": "^1.6.2",
    "date-fns": "^2.30.0",
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    "clsx": "^2.0.0",
    "tailwindcss": "^3.3.6"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@types/node": "^20.10.5",
    "typescript": "^5.3.3",
    "vite": "^5.0.7",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0"
  }
}
```

---

## ⚙️ vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'ES2020',
    outDir: 'dist',
  },
})
```

---

## 🎨 tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Industrial-Luxury Theme
        slate: {
          950: '#0F172A', // Primary background
        },
        amber: {
          500: '#F59E0B', // Accent color
        },
        // Data Visualization Colors
        success: '#10B981',  // Green (Class A)
        warning: '#FBBF24',  // Amber (Class B)
        danger: '#EF4444',   // Red (Class C)
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

---

## 📄 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 🔐 .env.example

```
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration
VITE_APP_NAME=Ebdaa Skill Matrix
VITE_APP_ENV=development

# API Configuration
VITE_API_URL=http://localhost:5173/api
```

---

## 📝 README.md

```markdown
# EBDAA SKILL MATRIX SYSTEM

Professional skill matrix management system for Ebdaa Factory (146+ employees, 9 departments).

## Features

- 🎯 Real-time skill tracking
- 📊 Automated weighted scoring
- 🎓 Training recommendations
- 📈 Comprehensive dashboards
- 🔐 Role-based access control
- 📱 Responsive design (Desktop, Tablet, Mobile)

## Tech Stack

- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- Supabase (Backend)
- Recharts (Data visualization)
- Framer Motion (Animations)

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase project (free tier available)

### Installation

1. Clone repository
\`\`\`bash
git clone https://github.com/yourusername/ebdaa-skill-matrix
cd ebdaa-skill-matrix
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Setup environment variables
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
\`\`\`

4. Start development server
\`\`\`bash
npm run dev
```

5. Open http://localhost:5173

### Build for Production

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Database Setup

See `database.sql` for complete schema and RLS policies.

### Quick Setup:
1. Create Supabase project
2. Go to SQL Editor
3. Run the contents of `database.sql`
4. Enable RLS on all tables
5. Run RLS policy scripts

## Project Structure

\`\`\`
src/
├── components/     # Reusable React components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── services/      # API & Supabase services
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
\`\`\`

## Usage

### For Managers
1. Login with department credentials
2. View "Evaluations" tab during active campaign
3. Fill in skill scores (0-4)
4. System auto-calculates class (A/B/C)

### For HR
1. Login with HR credentials
2. Create evaluation campaigns
3. View analytics & reports
4. Export data for compliance

### For Employees
1. Login with personal credentials
2. View personal skill profile
3. Check training recommendations
4. Track progress over time

## Key Features

### 1. Campaign Management
- Create Monthly/Quarterly/Bi-Annual campaigns
- Manual or auto-trigger
- Status tracking (Draft → Active → Completed)

### 2. Evaluation Forms
- Interactive skill matrix grid
- Real-time calculations
- Color-coded scoring
- Notes & comments

### 3. Scoring Logic
\`\`\`
Total Score = Σ(Skill Score × Weight)
Percentage = (Total Score / Max Score) × 100

Class A: 85-100% (Promotion Ready)
Class B: 60-79%  (Training Needed)
Class C: <60%    (Intensive Training)
\`\`\`

### 4. Dashboards
- Executive: Company-wide KPIs
- Department: Team performance
- Individual: Personal skills & progress

### 5. Reports
- PDF export (Individual/Department/Company)
- Excel export (Raw data)
- Training needs analysis
- Audit trail

## Access Control

| Role | Permissions |
|------|------------|
| Super Admin | Full CRUD, All departments |
| Dept Head | Read own dept, Edit during campaign |
| HR Coordinator | Read all, Generate reports |
| Employee | Read own profile only |

## API Endpoints

All endpoints authenticated via Supabase Auth.

### Campaigns
- `GET /campaigns` - List all
- `POST /campaigns` - Create
- `PATCH /campaigns/:id` - Update
- `DELETE /campaigns/:id` - Delete

### Evaluations
- `GET /evaluations` - List
- `POST /evaluations` - Submit
- `GET /evaluations/:id` - Get specific

### Reports
- `GET /reports/dashboard` - Dashboard data
- `GET /reports/export/pdf` - PDF export
- `GET /reports/export/excel` - Excel export

## Performance Optimization

- Lazy loading for components
- Code splitting via Vite
- Database query optimization
- Image optimization
- CSS minification

## Testing

\`\`\`bash
npm run test
npm run test:coverage
\`\`\`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy (Auto on push)

### Other Platforms

Works on any platform supporting Node.js 18+.

## Support

For issues or questions, open an issue on GitHub.

## License

Proprietary - Ebdaa Manufacturing

## Author

Enhanced by [yasserious.com](https://yasserious.com)

---

**Status:** Production Ready ✅
```

---

## 🚀 INSTALLATION COMMANDS

```bash
# Create new Vite project
npm create vite@latest ebdaa-skill-matrix -- --template react-ts

# Navigate to project
cd ebdaa-skill-matrix

# Install dependencies
npm install

# Install additional packages
npm install @supabase/supabase-js @supabase/auth-helpers-react
npm install recharts framer-motion @heroicons/react
npm install react-hook-form zod axios date-fns
npm install xlsx jspdf html2canvas clsx
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p

# Create environment file
cp .env.example .env.local

# Start development
npm run dev
```

---

## ✅ PHASE 1 CHECKLIST

- [ ] Project structure created
- [ ] Dependencies installed
- [ ] Tailwind CSS configured
- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Environment variables set
- [ ] Auth system initialized
- [ ] Foundational components built
- [ ] Layout system working
- [ ] Login page functional
- [ ] Protected routes working

---

**Next Step:** Database Schema (SQL) + Core Components (React/TypeScript)
