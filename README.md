# AccessLearn - Multi-Tenant Gamified Learning Platform

A fully accessible, WCAG 2.1 Level AA compliant gamified corporate training platform that makes learning feel like playing a video game. Built for **multi-tenant SaaS deployment** on Azure.

## 🎯 Project Status & Roadmap

**Current State:** 90% Ready for Demo | 85% Ready for Production  
**Goal:** Multi-tenant SaaS platform ready for Azure deployment  
**Timeline:** Demo ready now | Production ready in 2-3 weeks

### ✅ Latest Updates (November 2025)
- ✅ **Azure Infrastructure Deployed** - Container Apps, Cosmos DB, ACR all configured
- ✅ **CI/CD Pipeline Active** - Automatic deployment from GitHub to Azure
- ✅ **Production Environment** - Application running in Azure production
- ✅ **GitHub Actions** - Automated builds and deployments on push to `main`

📚 **Key Documents:**
- 📊 [**PROYECTO_ESTADO_ACTUAL.md**](./docs/PROYECTO_ESTADO_ACTUAL.md) - ⭐ **START HERE** - Complete project audit & status
- 👋 [**ONBOARDING_DEVELOPER.md**](./docs/ONBOARDING_DEVELOPER.md) - Developer onboarding guide
- ✅ [**DEMO_READINESS_CHECKLIST.md**](./docs/DEMO_READINESS_CHECKLIST.md) - Checklist for client demo
- 🗺️ [**ESTADO_ACTUAL_Y_ROADMAP.md**](./ESTADO_ACTUAL_Y_ROADMAP.md) - Detailed roadmap (16-20 weeks)
- 🌐 [**AZURE_COSMOS_DB_STRATEGY.md**](./AZURE_COSMOS_DB_STRATEGY.md) - Database & multi-tenancy strategy

---

## 🎮 Features (Current Implementation)

### ✅ Fully Implemented
- **Gamification**: XP system, achievements, levels, leaderboards, weekly challenges
- **Course Builder**: Professional authoring tool with rich content types
- **Certificates**: PDF generation with company branding
- **Analytics**: Complete dashboard with engagement metrics
- **Community**: Q&A forums, mentorship, team challenges
- **Internationalization**: Full ES/EN support (2,204 translation lines)
- **Accessibility**: WCAG 2.1 Level AA compliant
- **Dual Persona**: Separate UX for learners (gamified) and admins (professional)
- **Employee Management**: Bulk upload, groups, course assignments

### ✅ Infrastructure & Deployment
- **Backend**: ✅ Express.js API deployed on Azure Container Apps
- **Database**: ✅ Azure Cosmos DB Production configured
- **Multi-Tenancy**: ✅ Multi-tenant architecture with Cosmos DB partition keys
- **Authentication**: ✅ JWT-based authentication (Azure AD B2C optional for future)
- **Storage**: ⚠️ Base64 in Cosmos DB (Azure Blob Storage optional for future)
- **Deployment**: ✅ **CI/CD with GitHub Actions** - Automatic deployment on push to `main`
- **Monitoring**: ✅ Application Insights configured

## ♿ Accessibility Features

GameLearn is built with accessibility as a core principle, not an afterthought.

### User Features
- **Text Size Adjustment**: Normal, Large, X-Large options
- **High Contrast Mode**: Enhanced color contrast for better visibility
- **Reduce Motion**: Disable decorative animations
- **Keyboard Navigation**: 100% keyboard accessible
- **Screen Reader Support**: Optimized for NVDA, JAWS, VoiceOver, TalkBack
- **Captions & Transcripts**: All video and audio content

### Quick Access
Look for the ⚙️ icon in the bottom-right corner to access accessibility settings.

## 📚 Documentation

### Accessibility
- **[Accessibility Overview](./ACCESSIBILITY.md)** - Implementation guide and usage patterns
- **[Accessibility Style Guide](./ACCESSIBILITY_STYLE_GUIDE.md)** - WCAG 2.1 Level AA compliance standards
- **[Accessibility Testing](./ACCESSIBILITY_TESTING.md)** - Complete testing checklist and procedures

### Platform Guides
- **[Product Requirements](./PRD.md)** - Complete feature specifications
- **[Admin Guide](./ADMIN_GUIDE.md)** - Administrator documentation
- **[Security Policy](./SECURITY.md)** - Security guidelines

---

## 🏗️ Architecture

### **Current (Development):**
```
Frontend: React 19 + TypeScript + Vite
Storage: GitHub Spark KV (localStorage enhanced)
Auth: Basic (in-memory)
Deployment: Local development
```

### **Target (Production):**
```
Frontend:   Azure Static Web Apps (React)
Backend:    Azure Functions (Node.js Serverless)
Database:   Azure Cosmos DB (NoSQL Serverless)
Storage:    Azure Blob Storage
Auth:       Azure AD B2C
CI/CD:      GitHub Actions
Multi-tenancy: Database-per-Tenant
Cost:       ~$10-50/month for 10 tenants
```

**Why Cosmos DB?**
- ✅ Serverless = $0.20/month per tenant (100 users)
- ✅ Auto-scales from 0 to infinity
- ✅ JSON native = current data model compatible
- ✅ 99.99% SLA
- ✅ Global distribution ready

---

## 🚀 Getting Started

### **Current Development Setup:**

**Prerequisites:**
- Node.js 18+
- npm or yarn

**Installation:**
```bash
npm install
```

**Development:**
```bash
npm run dev
```

**Build:**
```bash
npm run build
```

### **Quick Test Login:**

**Admin Account:**
- Email: `admin@gamelearn.test`
- Password: `Admin2024!`

**User Account:**
- Email: `sarah.johnson@gamelearn.test`
- Password: `Welcome123!`

See [TEST_CREDENTIALS.md](./docs/TEST_CREDENTIALS.md) for complete test account details.

---

## 📋 Next Steps (MVP - 8-10 weeks)

### **Week 1-2: Azure + Backend Foundation**
- [ ] Create Azure subscription
- [ ] Setup Cosmos DB (Serverless)
- [ ] Create Azure Functions project
- [ ] Implement 2-3 basic APIs (users, courses)
- [ ] Tenant resolution middleware

### **Week 3-4: Frontend Migration**
- [ ] Create API client
- [ ] Implement Tenant Context
- [ ] Migrate hooks from Spark KV to APIs
- [ ] Connect frontend to backend

### **Week 5-6: Multi-Tenancy**
- [ ] Create 2 demo tenants
- [ ] Subdomain routing
- [ ] Data isolation validation
- [ ] Per-tenant branding

### **Week 7-8: Auth + Storage**
- [ ] Azure AD B2C setup
- [ ] Blob Storage for media
- [ ] JWT authentication
- [ ] E2E testing

### **Week 9-10: Polish + Demo**
- [ ] Bug fixes
- [ ] Documentation
- [ ] Video demo
- [ ] Client presentation

**See [PLAN_ACCION_2_SEMANAS.md](./PLAN_ACCION_2_SEMANAS.md) for detailed day-by-day plan.**

### For Users
1. Navigate to the Dashboard
2. Click the ⚙️ icon (bottom-right) to adjust accessibility settings
3. Start with the Main Mission or browse Side Missions
4. Complete modules to earn XP and unlock achievements

### For Developers

**Prerequisites:**
- Node.js 18+
- npm or yarn

**Installation:**
```bash
npm install
```

**Development:**
```bash
npm run dev
```

**Build:**
```bash
npm run build
```

## 🎨 Design Philosophy

GameLearn combines the excitement of video games with enterprise learning needs:

- **Playful & Engaging**: Colorful visuals, satisfying animations, instant rewards
- **Empowering & Clear**: Simple mechanics with high-contrast visuals
- **Rewarding & Motivating**: Constant positive feedback through XP, achievements, progress

All while maintaining **WCAG 2.1 Level AA compliance** for universal accessibility.

---

## 📊 Project Statistics

```
Code:
├─ Total Lines:        ~23,000+
├─ Components:         100+
├─ Hooks:              20+
├─ Services:           8
├─ Translation Lines:  2,204 (ES + EN)
└─ Documentation:      15+ MD files

Features:
├─ Gamification:       ✅ Complete
├─ Courses:            ✅ Complete
├─ Certificates:       ✅ Complete
├─ Analytics:          ✅ Complete
├─ Community:          ✅ Complete
├─ Accessibility:      ✅ WCAG 2.1 AA
├─ Backend:            ❌ Needs implementation
├─ Multi-tenancy:      ❌ Needs implementation
└─ Azure Deployment:   ❌ Needs setup

Completion: 40% (MVP features) + 60% (Infrastructure)
```

---

## 🎯 Target Use Cases

AccessLearn is perfect for:

✅ **Corporate Training:** Employee onboarding, compliance, skills development  
✅ **Sales Enablement:** Product training, sales techniques, customer service  
✅ **IT Training:** Software training, security awareness, tech skills  
✅ **Manufacturing:** Safety training, equipment operation, quality control  
✅ **Healthcare:** Compliance training, protocol updates, patient care  
✅ **Education:** K-12 supplemental learning, continuing education  

**Multi-Tenant Model:**
- Each company gets their own isolated instance
- Custom branding (logo, colors)
- Own courses and users
- Independent analytics
- Pay-per-user pricing

---

## 🚦 Current Limitations (To Be Fixed)

### **Critical:**
- ❌ No real backend (data in browser localStorage)
- ❌ No multi-tenancy (single organization only)
- ❌ No cloud deployment
- ❌ No persistent storage between devices

### **Important:**
- ⚠️ Basic authentication (no SSO/OAuth)
- ⚠️ No real-time sync between users
- ⚠️ Limited file upload (base64 only)
- ⚠️ No video streaming (local files only)

### **Nice to Have:**
- ⚠️ No automated tests
- ⚠️ No CI/CD pipeline
- ⚠️ No subscription/billing system
- ⚠️ No advanced analytics (ML/AI)

**All limitations will be addressed in the Azure migration roadmap.**

---

## 🧪 Testing

---

## 💰 Cost Estimation (Azure)

### **Monthly Costs (Serverless):**
```
10 Tenants (100 users each):
├─ Cosmos DB:           $2-10    (Serverless, pay-per-request)
├─ Azure Functions:     $5-20    (Consumption plan)
├─ Blob Storage:        $1-5     (Pay-per-GB)
├─ Azure AD B2C:        $0.50    ($0.0055 per auth, 50k free)
├─ Static Web Apps:     FREE     (Built-in)
├─ App Insights:        $1-5     (Monitoring)
└─ TOTAL:              ~$10-50/month
```

**Note:** First $25 of Cosmos DB is free (25GB + 1000 RU/s monthly)

### **Cost per Tenant:**
- 100 active users: ~$0.20-1.00/month
- 500 active users: ~$1-5/month
- 1,000 active users: ~$5-10/month

**Scalability:**
- 10 tenants: $10-50/month
- 50 tenants: $100-200/month
- 100 tenants: $300-500/month

---

## 🔐 Multi-Tenancy Strategy

### **Database-per-Tenant (Recommended):**
```
Cosmos DB Account
├── Database: tenant-acme-corp
│   ├── Container: users
│   ├── Container: courses
│   ├── Container: progress
│   └── Container: analytics
│
├── Database: tenant-techstart-inc
│   └── (same containers)
│
└── Database: shared-metadata
    └── Container: tenants
```

**Benefits:**
- ✅ Complete data isolation (security)
- ✅ Easy GDPR compliance (delete entire database)
- ✅ Independent backups per tenant
- ✅ Scales per customer
- ✅ Billing per customer

**Tenant Resolution:**
- Subdomain: `acme.accesslearn.com` → tenantId: "acme"
- HTTP Header: `x-tenant-id: acme`
- JWT claim: `tenantId: "acme"`

---

## 🧪 Testing

### Accessibility Testing
```bash
# Manual testing with keyboard (no mouse)
# Tab through interface, verify focus indicators

# Automated testing
# Run Lighthouse in Chrome DevTools
# Install axe DevTools extension
# Target: 95+ accessibility score
```

See [ACCESSIBILITY_TESTING.md](./ACCESSIBILITY_TESTING.md) for complete checklist.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Animation**: Framer Motion
- **Icons**: Phosphor Icons
- **Build**: Vite
- **Persistence**: Spark KV (useKV hook)

## 📦 Project Structure

```
src/
├── components/
│   ├── accessibility/      # Accessibility features
│   ├── achievements/       # Achievement system
│   ├── admin/             # Admin panel
│   ├── courses/           # Course viewer
│   ├── dashboard/         # User dashboard
│   ├── gamification/      # XP, levels, quests
│   └── ui/                # shadcn components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and types
└── styles/                # Global styles
```

## 🌟 Key Features

### Gamification
- **XP System**: Earn points for every action
- **Levels & Ranks**: Progress through 50+ levels
- **Achievements**: Unlock trophies (bronze → platinum)
- **Quests**: Daily, weekly, and story missions
- **Streaks**: Maintain learning momentum

### Accessibility
- **WCAG 2.1 Level AA**: Full compliance
- **Keyboard Navigation**: 100% keyboard accessible
- **Screen Readers**: Optimized support
- **High Contrast**: Enhanced visibility mode
- **Reduce Motion**: Respectful animations
- **44x44px Touch Targets**: Mobile-friendly

### Content Types
- **Interactive Lessons**: Gamified learning blocks
- **Video & Audio**: With captions and transcripts
- **Quizzes**: Accessible assessments
- **Code Examples**: Syntax-highlighted
- **Rich Media**: Images with alt text

## 🤝 Contributing

When contributing, please ensure:
1. All new features maintain WCAG 2.1 Level AA compliance
2. Run accessibility tests before submitting
3. Follow established patterns in [ACCESSIBILITY.md](./ACCESSIBILITY.md)
4. Update documentation as needed

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

## 🔗 Resources

### **Project Documentation:**
- 📊 [RESUMEN_EJECUTIVO.md](./RESUMEN_EJECUTIVO.md) - Executive summary & quick overview
- 🗺️ [ESTADO_ACTUAL_Y_ROADMAP.md](./ESTADO_ACTUAL_Y_ROADMAP.md) - Complete roadmap (16-20 weeks)
- 🌐 [AZURE_COSMOS_DB_STRATEGY.md](./AZURE_COSMOS_DB_STRATEGY.md) - Database strategy & costs
- 📅 [PLAN_ACCION_2_SEMANAS.md](./PLAN_ACCION_2_SEMANAS.md) - Day-by-day action plan
- 🏗️ [ARQUITECTURA_VISUAL.md](./ARQUITECTURA_VISUAL.md) - Architecture diagrams
- 📚 [CURRENT_FEATURES.md](./CURRENT_FEATURES.md) - Implemented features list
- ♿ [ACCESSIBILITY.md](./docs/ACCESSIBILITY.md) - Accessibility implementation guide
- 👨‍💼 [ADMIN_GUIDE.md](./docs/ADMIN_GUIDE.md) - Administrator documentation

### **Accessibility:**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [NVDA Screen Reader](https://www.nvaccess.org/) (Windows - Free)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (Chrome DevTools)

### **Azure Resources:**
- [Azure Cosmos DB Documentation](https://learn.microsoft.com/azure/cosmos-db/)
- [Azure Functions Documentation](https://learn.microsoft.com/azure/azure-functions/)
- [Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/)
- [Azure AD B2C Documentation](https://learn.microsoft.com/azure/active-directory-b2c/)
- [Azure Free Account](https://azure.microsoft.com/free) - $200 credit

---

## 📞 Support & Contact

**For Project Questions:**
- Review documentation in `/docs` folder
- Check [RESUMEN_EJECUTIVO.md](./RESUMEN_EJECUTIVO.md) for quick answers
- See [PLAN_ACCION_2_SEMANAS.md](./PLAN_ACCION_2_SEMANAS.md) for immediate next steps

**Technical Stack:**
- Frontend: React 19 + TypeScript + Vite
- UI: Radix UI + Tailwind CSS
- Target Backend: Azure Functions (Node.js)
- Target Database: Azure Cosmos DB
- Target Auth: Azure AD B2C

---

## 🎯 Quick Decision Matrix

### **"Should I use AccessLearn for my use case?"**

✅ **YES, if you need:**
- Corporate employee training platform
- Multi-company/multi-tenant SaaS
- Gamified learning experience
- Full accessibility compliance (WCAG 2.1 AA)
- Cloud-native Azure deployment
- Scalable from 10 to 10,000+ users

⚠️ **MAYBE, if you need:**
- K-12 education (needs curriculum features)
- University LMS (needs grading, transcripts)
- Consumer mobile app (needs native apps)
- Video-first platform (needs streaming infrastructure)

❌ **NO, if you need:**
- Simple quiz maker (too complex)
- Single-user learning app (overkill)
- WordPress plugin (wrong stack)
- Non-cloud solution (requires Azure)

---

## 🚀 Quick Start Checklist

### **For Evaluating the Project (10 minutes):**
- [ ] Clone the repo
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] Login with `admin@gamelearn.test` / `Admin2024!`
- [ ] Explore dashboard, courses, gamification
- [ ] Test accessibility (keyboard navigation)
- [ ] Read [RESUMEN_EJECUTIVO.md](./RESUMEN_EJECUTIVO.md)

### **For Starting Development (Day 1):**
- [ ] Read [RESUMEN_EJECUTIVO.md](./RESUMEN_EJECUTIVO.md) completely
- [ ] Read [AZURE_COSMOS_DB_STRATEGY.md](./AZURE_COSMOS_DB_STRATEGY.md)
- [ ] Read [PLAN_ACCION_2_SEMANAS.md](./PLAN_ACCION_2_SEMANAS.md)
- [ ] Create Azure free account ($200 credit)
- [ ] Answer decision questions in RESUMEN_EJECUTIVO
- [ ] Start Day 1 tasks from PLAN_ACCION_2_SEMANAS

### **For Production Deployment (Week 8-10):**
- [ ] Complete all phases in [ESTADO_ACTUAL_Y_ROADMAP.md](./ESTADO_ACTUAL_Y_ROADMAP.md)
- [ ] 2+ demo tenants working
- [ ] E2E tests passing
- [ ] Azure infrastructure configured
- [ ] CI/CD pipeline running
- [ ] Documentation complete
- [ ] Security audit done

---

## 💡 Key Insights

### **What Makes AccessLearn Unique:**
1. **Dual Persona Design** - Gamified for learners, professional for admins
2. **Accessibility First** - WCAG 2.1 AA compliance from day one
3. **Serverless Azure** - Cost-effective scaling ($0.20/month per tenant)
4. **Database-per-Tenant** - Complete data isolation for security
5. **Rich Gamification** - XP, achievements, leaderboards, challenges

### **Why Azure Cosmos DB:**
- Serverless = pay only what you use
- JSON native = current data model compatible
- Multi-tenant ready with partition keys
- 99.99% SLA
- Global distribution when you need it

### **Timeline Reality:**
- MVP (basic multi-tenant): **8-10 weeks**
- Production-ready: **16-20 weeks**
- With 2-3 dedicated developers
- Cost: ~$10-50/month for first 10 tenants

---

**Built with ♿ accessibility, 🎮 gamification, and ☁️ Azure cloud in mind**

**Ready to transform corporate training? Start with [RESUMEN_EJECUTIVO.md](./RESUMEN_EJECUTIVO.md)! 🚀**

