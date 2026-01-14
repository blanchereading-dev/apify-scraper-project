# ReEntry Connect MN - Product Requirements Document

## Original Problem Statement
Build a website called ReEntry Connect MN to assist individuals being released from incarceration in Minnesota with resources they may need (housing, legal aid, etc). The website needs mapping, search feature, AI chatbot, and consistently updated resource listings.

## User Choices
- **AI Chatbot**: OpenAI GPT-5.2 (via Emergent LLM Key)
- **Mapping**: Leaflet (free, open-source)
- **Resource Categories**: All (Housing, Legal Aid, Employment, Healthcare, Education, Food, Transportation)
- **Admin Features**: Pre-populated database (no admin panel)
- **Design**: Professional/government style, blue/modern color scheme

## User Personas
1. **Returning Individuals**: People being released from incarceration seeking housing, employment, legal aid, and other services
2. **Family Members**: Supporting loved ones in their reentry journey
3. **Case Workers**: Social workers and parole officers helping clients find resources
4. **Community Partners**: Organizations looking to connect with the platform

## Core Requirements (Static)
- Resource directory with 7 categories
- Search and filter functionality
- Interactive map with Leaflet
- AI chatbot for 24/7 assistance
- Mobile-responsive design
- Accessibility compliance (WCAG AA)

## Architecture
- **Frontend**: React + TailwindCSS + Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI Integration**: OpenAI GPT-5.2 via emergentintegrations library
- **Mapping**: React-Leaflet with OpenStreetMap tiles

## What's Been Implemented (December 2025)

### Backend (server.py)
- [x] Resource CRUD endpoints (`/api/resources`)
- [x] Category listing endpoint (`/api/categories`)
- [x] AI Chat endpoint (`/api/chat`) using GPT-5.2
- [x] Database seeding with 16 Minnesota reentry resources
- [x] Search and filter by category/keyword

### Frontend
- [x] Home page with hero, stats, and category cards
- [x] Resources page with list/map toggle view
- [x] Search bar with real-time filtering
- [x] Category filter buttons
- [x] Resource detail sheet/modal
- [x] Interactive Leaflet map with custom markers
- [x] Floating AI chatbot with conversation history
- [x] About page with mission and values
- [x] Responsive navigation

### Design System
- Typography: Manrope (headings) + Inter (body)
- Colors: Nordic Deep (#1B3B5A), Sky Hope (#0284C7), Limestone (#F3F4F6)
- Glassmorphism chatbot
- Accessibility: Focus states, semantic HTML

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Resource listing and display
- [x] Search functionality
- [x] Map view with markers
- [x] AI chatbot integration

### P1 (High Priority)
- [ ] Admin panel for resource management
- [ ] User authentication for saved favorites
- [ ] Resource rating/feedback system
- [ ] Multi-language support (Spanish)

### P2 (Medium Priority)
- [ ] Print-friendly resource pages
- [ ] Email/SMS resource sharing
- [ ] Appointment scheduling integration
- [ ] Resource verification status indicators

### P3 (Nice to Have)
- [ ] Dark mode toggle
- [ ] Mobile app (React Native)
- [ ] Resource analytics dashboard
- [ ] Community forum/discussions

## Next Tasks
1. Add admin panel for resource management (CRUD operations)
2. Implement user authentication for saved searches
3. Add Spanish language translation
4. Create resource submission form for community contributions
5. Add email notifications for new resources in selected categories
