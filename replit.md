# AI Kareem Pro - Arabic RTL Sales Operations Platform

## Overview
AI-powered sales operations platform for Arabic educational institutions. Features AI assistant, SOP workflow engine, deal pipeline tracking, and knowledge base management.

## Recent Changes
- **2026-02-10**: Created CSColorPalette page with optional logo upload, client-side canvas-based color extraction, AI-powered palette generation (POST /api/color-palette/generate endpoint), visual color display with copy-to-clipboard functionality.
- **2026-02-10**: Redesigned RoleSelection page with dark gradient theme, daily motivational quotes (31 quotes rotating by day) signed by كريم عصام, animated role cards with gradient icons.
- **2026-02-10**: Enhanced Client Qualification page: added client industry selector (16 industries), free-text client description field, AI-powered pain points analysis via SSE streaming (POST /api/qualifications/analyze). New schema fields: clientIndustry, clientDescription, aiPainPoints.
- **2026-02-10**: Implemented role-based interface system with 3 views: Sales Manager (full access with comprehensive dashboard showing all teams' data, deals pipeline, tasks, and AI conversations), Sales Team (dedicated sales tools and workflows), and Customer Success Team (CS-specific interface). Added role selection landing page, role-aware sidebar navigation, role switcher in header, and persistent role storage.
- **2026-02-10**: Added complete Customer Success Team interface with dedicated sidebar section (emerald theme). Includes CS SOP (7-stage workflow: onboarding→training→content setup→launch→monitoring→growth→retention), CS AI Assistant (separate conversations with CS-specific system prompt), and CS Tools page (ChatGPT prompts for content/analysis/embed codes, Canva design guides, Gamma templates).
- **2026-02-10**: Added Client Needs & Challenges Analysis page (AI-powered client analysis for sales consultants with pain points, opportunities, discovery questions).
- **2026-02-10**: Added Client Qualification analysis page (4-criteria scoring: need, authority, timeline, fit) and Referrals system (strategies, scripts, tracking). 
- **2026-02-10**: Added Tasks management page and Daily Reflection (motivational framework) page with full CRUD. Added company logos (Kareem Essam + Acadimiat) to sidebar.
- **2026-02-10**: Full-stack conversion complete. PostgreSQL database with Drizzle ORM. All API endpoints operational. OpenAI integration via Replit AI Integrations.

## User Preferences
- Arabic RTL interface with Cairo font
- Corporate blue theme for trust/professionalism
- All content and UI in Arabic

## Project Architecture
- **Frontend**: React + Vite + Tailwind v4 + shadcn/ui + React Flow
- **Backend**: Express.js + Drizzle ORM + PostgreSQL (Neon)
- **AI**: OpenAI via Replit AI Integrations (no API key needed)
- **Routing**: wouter (client), Express (server)

### Key Files
- `shared/schema.ts` - Database models (users, deals, conversations, messages, knowledgeFiles, sopSteps, tasks, dailyReflections, clientQualifications, referrals, clientAnalyses, csConversations, csMessages)
- `server/db.ts` - PostgreSQL connection via pg Pool + drizzle-orm/node-postgres
- `server/storage.ts` - DatabaseStorage class implementing IStorage interface
- `server/routes.ts` - All API routes + OpenAI streaming chat
- `server/seed.ts` - Database seeder with Arabic sample data
- `client/src/contexts/RoleContext.tsx` - Role management (manager/sales/cs) with localStorage persistence
- `client/src/pages/` - RoleSelection, ManagerDashboard, Dashboard, Assistant, SOP, Deals, KnowledgeBase, CHAMP, Tasks, DailyReflection, ClientQualification, Referrals, ClientAnalysis, CSSOP, CSAssistant, CSTools

### API Endpoints
- `GET/POST/PATCH/DELETE /api/deals`
- `GET/POST/DELETE /api/conversations`
- `GET/POST /api/conversations/:id/messages` (SSE streaming for AI)
- `GET/POST/DELETE /api/knowledge-files`
- `GET/POST/PATCH /api/sop-steps`
- `GET/POST/PATCH/DELETE /api/tasks`
- `GET/POST/PATCH/DELETE /api/reflections`
- `GET /api/reflections/date/:date`
- `GET/POST/PATCH/DELETE /api/qualifications`
- `POST /api/qualifications/analyze` (SSE streaming AI analysis)
- `GET/POST/PATCH/DELETE /api/referrals`
- `GET/POST/PATCH/DELETE /api/analyses`
- `POST /api/analyses/generate` (SSE streaming AI analysis)
- `GET/POST/DELETE /api/cs/conversations`
- `GET/POST /api/cs/conversations/:id/messages` (SSE streaming for CS AI)
- `GET /api/dashboard/stats`

### Schema Notes
- All tables use varchar UUIDs (gen_random_uuid()) as primary keys
- Integration files in `server/replit_integrations/` and `shared/models/chat.ts` use serial IDs - these are NOT used by the main app
