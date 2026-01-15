# ReEntry Connect MN - Product Requirements Document

## Original Problem Statement
Build a website called ReEntry Connect MN to assist individuals being released from incarceration in Minnesota with resources they may need (housing, legal aid, etc). The website needs mapping, search feature, AI chatbot, and consistently updated resource listings.

## User Choices
- **AI Chatbot**: OpenAI GPT-5.2 (via Emergent LLM Key)
- **Mapping**: Leaflet (free, open-source)
- **Resource Categories**: Housing, Legal Aid, Employment, Healthcare, Education, Food
- **Admin Features**: Pre-populated database (no admin panel yet)
- **Design**: Professional/government style, blue color scheme (#7cafde, #0e3d69, #fafdff)
- **Languages**: English & Spanish

## User Personas
1. **Returning Individuals**: People being released from incarceration seeking housing, employment, legal aid, and other services
2. **Family Members**: Supporting loved ones in their reentry journey
3. **Case Workers**: Social workers and parole officers helping clients find resources
4. **Community Partners**: Organizations looking to connect with the platform

## Core Requirements
- Resource directory with 6 categories
- Search and filter functionality (by category, county, keyword)
- Interactive map with Leaflet
- AI chatbot for 24/7 assistance (conversational flow)
- Mobile-responsive design
- Bilingual support (EN/ES)
- Save/favorite resources (localStorage)
- Submit new resource form
- Emergency hotlines section
- How-To guide page

## Architecture
- **Frontend**: React + TailwindCSS + Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI Integration**: OpenAI GPT-5.2 via emergentintegrations library
- **Mapping**: React-Leaflet with OpenStreetMap tiles
- **i18n**: react-i18next

## What's Been Implemented (January 2026)

### Backend (server.py)
- [x] Resource CRUD endpoints (`/api/resources`)
- [x] Category listing endpoint (`/api/categories`) - 6 categories
- [x] AI Chat endpoint (`/api/chat`) - conversational flow
- [x] Submissions endpoint (`/api/submissions`) for user contributions
- [x] Database seeding with 113 Minnesota reentry resources
- [x] Search and filter by category/county/keyword

### Frontend
- [x] Home page with hero section, category cards, emergency hotlines
- [x] Resources page with list/map toggle view
- [x] Search bar with real-time filtering
- [x] Category filter buttons (6 categories)
- [x] County dropdown filter (Minnesota counties)
- [x] Resource detail view
- [x] Interactive Leaflet map with 113 markers
- [x] Floating AI chatbot (conversational - asks questions first)
- [x] How-To page with FAQ topics and external government links
- [x] Favorites page with saved resources
- [x] Submit Resource form modal
- [x] Responsive navigation with mobile hamburger menu
- [x] Spanish language support (i18next)
- [x] Language switcher (EN/ES) in navbar

### Design System
- Typography: System fonts
- Colors: Primary (#0e3d69), Accent (#7cafde), Background (#fafdff, #e8f2fa)
- Clean, professional government-style UI
- Accessibility: Focus states, semantic HTML, data-testid attributes

## Testing Status (January 15, 2026)
- **Backend**: 100% (17/17 tests passed)
- **Frontend**: 100% (19/19 features tested successfully)
- Test report: `/app/test_reports/iteration_2.json`

## Prioritized Backlog

### P0 (Critical) - COMPLETED
- [x] Resource listing and display
- [x] Search functionality
- [x] Map view with markers
- [x] AI chatbot integration
- [x] Spanish language support
- [x] Save/favorite resources
- [x] Submit resource form
- [x] Emergency hotlines
- [x] How-To guide page
- [x] Comprehensive regression testing

### P1 (High Priority) - NEXT
- [ ] Add more language support (Hmong, Somali)
- [ ] Admin panel for resource management
- [ ] User authentication for cross-session favorites
- [ ] Email notifications to admins for new submissions

### P2 (Medium Priority)
- [ ] Resource rating/feedback system
- [ ] Print-friendly resource pages
- [ ] Email/SMS resource sharing
- [ ] Resource verification status indicators

### P3 (Nice to Have)
- [ ] Dark mode toggle
- [ ] Mobile app (React Native)
- [ ] Resource analytics dashboard
- [ ] Community forum/discussions
