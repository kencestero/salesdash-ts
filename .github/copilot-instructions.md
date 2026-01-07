# Remotive SalesHub - AI Development Guide

## 🎯 Project Overview
**Remotive SalesHub** is a professional admin portal for remote trailer sales reps at Remotive Logistics, built on the DashTail template with Next.js 14, TypeScript, and TailwindCSS. Uses dark mode branding with #E96114 (orange) + #09213C (dark blue).

## 🏗️ Architecture Patterns

### Directory Structure & Routing
- **Internationalized Routing**: `app/[lang]/` structure with default "en" locale
- **Route Groups**: `(dashboard)`, `(apps)`, `(components)` for organization without URL impact  
- **Protected Routes**: Dashboard layouts require authentication via `middleware.ts`
- **Page Components**: Pattern of `page.tsx` → `page-view.tsx` for server/client separation

### Key Architecture Components
```
app/[lang]/
├── (dashboard)/          # Protected admin routes
│   ├── (home)/          # Dashboard variants (analytics, ecommerce, project)
│   ├── (apps)/          # Full applications (calendar, email, kanban, projects)
│   ├── (components)/    # UI component demos
│   └── layout.tsx       # Auth check + DashBoardLayoutProvider
├── auth/                # Login/register pages
└── layout.tsx           # Root providers (Auth, Theme, i18n)
```

### State Management
- **Zustand Stores**: `store/index.ts` with persistence for theme/layout config
- **Theme Store**: Controls layout variants (vertical, horizontal, semibox), sidebar behavior
- **Sidebar Store**: Manages collapse state, sidebar types (classic, module, popover)

## 🔐 Authentication & Access Control

### NextAuth Setup
- **Providers**: Google OAuth (primary), GitHub, and custom credentials
- **Environment Variables**: Use `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- **Session Handling**: Server-side session checks in dashboard layout
- **Middleware**: Route protection with redirect logic in `middleware.ts`

### Access Control Features
- Email allowlist system via `ACCESS_ALLOWLIST_ENABLED` env var
- Domain-based access (`@remotivelogistics.com`, `@obscurerides.com`)
- Individual email whitelisting support

## 🎨 UI System & Theming

### Component Architecture
- **Radix UI Base**: Extensive use of headless UI components
- **Custom Components**: Built on top in `components/ui/` (card, button, etc.)
- **Theme System**: CSS variables + Zustand store for runtime theme switching
- **Layout Variants**: Vertical sidebar, horizontal nav, semi-box layouts

### Styling Patterns
- **TailwindCSS**: Primary styling with custom theme extensions
- **CSS Variables**: Theme-based color system with dark/light mode
- **Component Variants**: Class Variance Authority (CVA) for component variations
- **SCSS Support**: Global styles in `app/assets/scss/`

## 🌐 Internationalization (i18n)

### Implementation
- **Dictionary System**: JSON files in `app/dictionaries/` (en, bn, ar)
- **Server-Side**: `getDictionary()` function for server components
- **Route Structure**: `[lang]` dynamic segment with default "en"
- **Middleware Integration**: Language detection and routing

## 📊 Dashboard Features

### Dashboard Variants
- **Analytics**: Main dashboard with charts, stats, country maps
- **Ecommerce**: Sales-focused with revenue charts, top customers
- **Project**: Project management with tasks, timelines

### Chart Libraries
- **ApexCharts**: Primary charting via react-apexcharts
- **Chart.js**: Secondary option via react-chartjs-2
- **Recharts**: Simple charts and data visualization
- **Unovis**: Advanced visualization components

## 🛠️ Development Workflow

### Commands & Scripts
```bash
pnpm dev          # Development server
pnpm build        # Production build  
pnpm typecheck    # TypeScript validation
```

### Environment Setup
- **Windows Compatible**: Uses Git Bash, path compatibility important
- **Environment Files**: `.env.example` template, use `.env.local` for local config
- **Prisma**: Database schema in `prisma/schema.prisma` with PostgreSQL

### Code Patterns
- **Server/Client Separation**: `page.tsx` (server) → `page-view.tsx` (client)
- **Type Safety**: Comprehensive TypeScript with strict configuration
- **Error Boundaries**: Built-in error handling in layouts
- **Loading States**: Layout loader and skeleton components

## 🚫 Development Constraints

### Do NOT:
- Make large architectural changes without explicit approval
- Modify auth flows unless specifically requested
- Replace core folders (`.next/`, `public/`, `app/`) without instruction
- Add dependencies without discussing first

### DO:
- Follow existing file/folder patterns
- Use established component patterns from `components/ui/`
- Maintain TypeScript strict typing
- Test changes in dashboard environment
- Keep commits small and focused

## 📚 Key Files to Reference
- `middleware.ts` - Route protection and i18n routing
- `config/menus.ts` - Navigation structure (3000+ lines)
- `lib/auth.ts` - NextAuth configuration  
- `provider/dashboard.layout.provider.tsx` - Main layout logic
- `store/index.ts` - Global state management
- `components/ui/` - Reusable UI component library