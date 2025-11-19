# 🧪 Dashboard Backend Integration - Testing Guide

## ✅ What Was Implemented

### Dashboard Migration Completed!
- ✅ App.tsx now uses `useBackendCourses()` hook
- ✅ Auto-fallback to KV if backend not available
- ✅ Visual indicator showing data source (Backend API vs KV)
- ✅ Tenant selector for switching between tenants
- ✅ All dashboard components receive backend data

## 🚀 How to Test

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
✅ Backend should start on `http://localhost:7071`

### Step 2: Start Frontend (Terminal 2)
```bash
npm run dev
```
✅ Frontend should start on `http://localhost:5173`

### Step 3: Open Browser
Navigate to: `http://localhost:5173`

### Step 4: Look for Visual Indicators

**Bottom-right corner** shows:
- 🟢 **Green badge "Backend API"** = Using real Cosmos DB data
- 🟠 **Orange badge "KV Storage"** = Using localStorage (fallback)

**Top-right corner** shows:
- **Tenant Selector** dropdown to switch between:
  - Empresa Demo (demo plan)
  - Kainet (profesional plan)
  - Socia Partner (enterprise plan)

## 🔍 What to Verify

### Test 1: Backend Data Loading
1. Ensure backend is running
2. Refresh page
3. ✅ Badge should show "Backend API" (green)
4. ✅ Dashboard should show course: "Introducción a AccessLearn"

### Test 2: Tenant Switching
1. Click tenant selector (top-right)
2. Switch to "Kainet"
3. ✅ Dashboard should reload with Kainet's courses
4. ✅ Badge should update to show "Kainet (X courses)"

### Test 3: Fallback to KV
1. Stop backend (Ctrl+C in Terminal 1)
2. Refresh page
3. ✅ Badge should show "KV Storage" (orange)
4. ✅ Dashboard should show courses from localStorage

### Test 4: Real Multi-Tenant Data
1. Restart backend
2. Switch between tenants:
   - tenant-demo: Should show 1 course
   - tenant-kainet: Should show 1 course (different)
3. ✅ Each tenant shows isolated data

## 📊 Visual Feedback

### Data Source Indicator (Bottom-Right)
```
┌─────────────────────────────┐
│ 🌐 Backend API              │
│ Empresa Demo (1 courses)    │
└─────────────────────────────┘
```

or

```
┌─────────────────────────────┐
│ 💾 KV Storage               │
│ Local data (0 courses)      │
└─────────────────────────────┘
```

### Tenant Selector (Top-Right)
```
┌─────────────────────────┐
│ Empresa Demo      ▼     │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Switch Tenant           │
├─────────────────────────┤
│ ● Empresa Demo  ✓       │
│   demo plan             │
│ ● Kainet                │
│   profesional plan      │
│ ● Socia Partner         │
│   enterprise plan       │
└─────────────────────────┘
```

## 🐛 Troubleshooting

### "No courses found"
- ✅ Check backend is running (`npm run dev` in backend/)
- ✅ Verify Cosmos DB has courses (check Azure Portal)
- ✅ Run backend tests: `cd backend && npm run build && node dist/index.js`

### "KV Storage" when backend is running
- ✅ Check backend URL in `.env`: `VITE_API_BASE_URL=http://localhost:7071/api`
- ✅ Open DevTools → Network tab → Check for API calls to localhost:7071
- ✅ Look for CORS errors in console

### Tenant selector not showing
- ✅ You're in development mode (indicators only show in dev)
- ✅ Check browser console for errors

## 📝 API Endpoints Being Called

When dashboard loads, it calls:
```
GET http://localhost:7071/api/courses?tenantId=tenant-demo
```

Response example:
```json
[
  {
    "id": "course-001",
    "tenantId": "tenant-demo",
    "title": "Introducción a AccessLearn",
    "description": "Curso de prueba...",
    "instructor": "Marco Dominguez",
    "status": "active"
  }
]
```

## 🎯 Next Steps After Testing

Once you verify everything works:

1. ✅ **Migrate more components** - Update CourseViewer, MissionLibrary
2. ✅ **Add user enrollment** - Connect user progress to backend
3. ✅ **Implement authentication** - Real login with backend users
4. ✅ **Deploy backend to Azure** - Move from localhost to production

## 💡 Development Tips

### Quick Backend Test (Terminal)
```bash
curl http://localhost:7071/api/courses?tenantId=tenant-demo
```

### Add Test Course
```bash
cd backend
npm run create-user tenant-demo test@demo.com Test User student
```

### Switch Tenants via Console
```javascript
// In browser DevTools console
localStorage.setItem('current-tenant-id', 'tenant-kainet')
location.reload()
```

---

**Status**: ✅ Dashboard migration complete  
**Backend**: ✅ Working with real Cosmos DB  
**Frontend**: ✅ Auto-fallback to KV if backend down  
**Multi-tenant**: ✅ Tenant isolation working  

🎉 **Ready for testing!**
