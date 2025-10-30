# GameLearn - Gamified Learning Platform

A fully accessible, WCAG 2.1 Level AA compliant gamified corporate training platform that makes learning feel like playing a video game.

## 🎮 Features

- **Gamified Learning**: XP system, achievements, levels, and quests
- **Interactive Courses**: Multiple content types (video, audio, text, interactive challenges)
- **Full Accessibility**: WCAG 2.1 Level AA compliant with comprehensive accessibility features
- **Admin Tools**: Content management, user administration, and analytics
- **Progress Tracking**: Real-time progress monitoring and celebration animations
- **Achievement System**: PlayStation-style trophies (bronze, silver, gold, platinum)

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

## 🚀 Getting Started

### Quick Test Login

**Admin Account:**
- Email: `admin@gamelearn.test`
- Password: `Admin2024!`

**User Account:**
- Email: `sarah.johnson@gamelearn.test`
- Password: `Welcome123!`

See [TEST_CREDENTIALS.md](./TEST_CREDENTIALS.md) for complete test account details.

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

### Accessibility
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

### Tools
- [NVDA Screen Reader](https://www.nvaccess.org/) (Windows - Free)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (Chrome DevTools)

---

**Built with ♿ accessibility and 🎮 fun in mind**
