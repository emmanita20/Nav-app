# 📊 INSTALLATION VISUAL FLOWCHART & QUICK REFERENCE

---

## 🎯 Installation Flow Diagram

```
START
  │
  ├─→ Install Node.js (v16+)
  │     └─→ Verify: node --version
  │
  ├─→ Install MongoDB (v5+)
  │     └─→ Verify: mongosh connection
  │
  ├─→ BACKEND SETUP
  │     ├─→ cd backend
  │     ├─→ npm install
  │     ├─→ Create .env file
  │     ├─→ Add credentials:
  │     │     • MONGODB_URI
  │     │     • JWT_SECRET
  │     │     • TWILIO keys
  │     │     • FIREBASE keys
  │     └─→ npm run dev
  │           └─→ "Server running on port 5000"
  │           └─→ "MongoDB connected"
  │
  ├─→ FRONTEND SETUP
  │     ├─→ cd frontend
  │     ├─→ npm install
  │     ├─→ Create .env file
  │     ├─→ Add credentials:
  │     │     • REACT_APP_MAPBOX_TOKEN
  │     │     • REACT_APP_API_URL
  │     └─→ npm start
  │           └─→ "Compiled successfully!"
  │           └─→ Browser opens http://localhost:3000
  │
  ├─→ VERIFICATION
  │     ├─→ Frontend loads
  │     ├─→ No console errors
  │     ├─→ Signup works
  │     └─→ Location shows on map
  │
  └─→ ✅ SUCCESS - APP IS RUNNING!
```

---

## 📦 Installation Dependencies Summary

### What Gets Installed - Backend

```
express (4.18.2)              Framework for API
mongoose (7.0.0)              MongoDB driver
socket.io (4.5.4)             Real-time communication
jsonwebtoken (9.0.0)          Authentication tokens
bcryptjs (2.4.3)              Password hashing
cors (2.8.5)                  Cross-origin requests
twilio (3.75.0)               SMS notifications
firebase-admin (11.5.0)       Push notifications
helmet (6.0.1)                Security headers
express-validator (7.0.0)     Input validation
dotenv (16.0.3)               Environment variables
axios (1.3.0)                 HTTP requests
nodemon (2.0.20)              Auto-reload (dev only)
```

### What Gets Installed - Frontend

```
react (18.2.0)                UI framework
react-dom (18.2.0)            DOM rendering
react-router-dom (6.8.0)      Navigation/routing
axios (1.3.0)                 HTTP client
socket.io-client (4.5.4)      Real-time client
mapbox-gl (2.15.0)            Maps library
react-map-gl (7.0.19)         React mapbox wrapper
tailwindcss (3.2.4)           CSS framework
zustand (4.3.2)               State management
recharts (2.5.0)              Charts/graphs
react-icons (4.7.1)           Icon library
react-query (3.39.3)          Data fetching
```

---

## 🔑 API Keys Acquisition Flowchart

```
GETTING API KEYS
│
├─→ MAPBOX (for maps)
│   └─→ https://www.mapbox.com
│       ├─→ Sign up (free)
│       ├─→ Dashboard → Tokens
│       ├─→ Copy public token
│       └─→ Paste in frontend/.env
│
├─→ TWILIO (for SMS)
│   └─→ https://www.twilio.com
│       ├─→ Sign up (free $15)
│       ├─→ Console → Account
│       ├─→ Copy Account SID & Auth Token
│       ├─→ Create/get phone number
│       └─→ Paste in backend/.env
│
├─→ FIREBASE (for push)
│   └─→ https://firebase.google.com
│       ├─→ Create project
│       ├─→ Settings → Service Accounts
│       ├─→ Generate key
│       ├─→ Copy credentials
│       └─→ Paste in backend/.env
│
└─→ MONGODB (for database)
    ├─→ Option A: Local
    │   └─→ Download from mongodb.com
    │       └─→ mongodb://localhost:27017/navi-app
    │
    └─→ Option B: Cloud (Atlas)
        └─→ https://www.mongodb.com/cloud/atlas
            ├─→ Sign up
            ├─→ Create cluster
            ├─→ Click Connect
            ├─→ Copy connection string
            └─→ Paste in backend/.env
```

---

## ⚡ Environment Variables Quick Reference

### Backend .env Template

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/navi-app

# JWT (Authentication)
JWT_SECRET=generate_with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_REFRESH_SECRET=generate_with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Firebase (Notifications)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# CORS
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### Frontend .env Template

```env
# API
REACT_APP_API_URL=http://localhost:5000/api

# Mapbox
REACT_APP_MAPBOX_TOKEN=your_mapbox_public_token

# Socket.io
REACT_APP_SOCKET_URL=http://localhost:5000

# Google OAuth (optional)
REACT_APP_GOOGLE_CLIENT_ID=optional_google_client_id
```

---

## 🔧 Installation Commands Reference

### Node.js Verification
```bash
node --version      # Should be v16+
npm --version       # Should be v7+
npm list -g         # List global packages
```

### MongoDB Verification
```bash
mongosh             # Open MongoDB shell
show dbs            # List all databases
use navi-app        # Switch to navi-app
show collections    # List collections
exit                # Exit shell
```

### Backend Commands
```bash
cd backend
npm install         # Install dependencies
npm run dev         # Run development server
npm start           # Run production
npm test            # Run tests
npm audit           # Check vulnerabilities
```

### Frontend Commands
```bash
cd frontend
npm install         # Install dependencies
npm start           # Start development server
npm run build       # Create production build
npm test            # Run tests
npm run eject       # Eject from CRA (irreversible)
```

---

## 📊 Installation Timeline

```
Time    Activity                    Duration
────────────────────────────────────────────
0:00    Start
│
0:05    Install Node.js             5 min
│
0:10    Install MongoDB             5 min
│
0:25    Backend setup               15 min
│       - npm install
│       - Create .env
│       - Add credentials
│
0:40    Frontend setup              15 min
│       - npm install
│       - Create .env
│       - Add API keys
│
0:50    Start servers               10 min
│       - Backend: npm run dev
│       - Frontend: npm start
│
1:00    Verification                10 min
│       - Test signup
│       - Test location
│       - Check console
│
────────────────────────────────────────────
1:00    ✅ COMPLETE
```

---

## ✅ Pre-Installation Checklist

```
System Requirements:
☐ Windows 10+ / macOS 10.14+ / Linux
☐ 4GB RAM minimum (8GB recommended)
☐ 2GB free disk space
☐ Internet connection
☐ Administrator access

Software Needed:
☐ Text editor (VS Code recommended)
☐ Terminal/PowerShell
☐ Web browser (Chrome/Firefox/Safari)

Accounts Needed:
☐ Mapbox account (free)
☐ Twilio account (free)
☐ Firebase account (free)
☐ MongoDB Atlas account (free)
```

---

## 🎯 Post-Installation Checklist

```
Backend:
☑ Dependencies installed (npm install completed)
☑ .env file created with all credentials
☑ Server starts (npm run dev)
☑ MongoDB connects ("MongoDB connected" in logs)
☑ API responds (curl http://localhost:5000/api/health)

Frontend:
☑ Dependencies installed (npm install completed)
☑ .env file created with API keys
☑ Development server starts (npm start)
☑ Browser opens automatically
☑ No console errors (F12 to check)

Database:
☑ MongoDB running
☑ Connection string correct
☑ Can open MongoDB shell

Feature Testing:
☑ Signup works
☑ Login works
☑ Location permission works
☑ Map displays
☑ Emergency button visible
```

---

## 🌐 Port Reference

```
Frontend:  http://localhost:3000
Backend:   http://localhost:5000
MongoDB:   mongodb://localhost:27017
```

---

## 🚀 Quick Start Commands (One Sheet)

```bash
# FIRST TIME SETUP

# Install Node.js (from https://nodejs.org)
# Install MongoDB (from https://www.mongodb.com or use Atlas)

# Backend
cd navi-app/backend
npm install
copy .env.example .env
# Edit .env with your credentials
npm run dev

# Frontend (new terminal)
cd navi-app/frontend
npm install
copy .env.example .env
# Edit .env with your credentials
npm start

# VERIFY
# Open http://localhost:3000 in browser
# Try signup/login
# Check browser console for errors
```

---

## 📱 Troubleshooting Command Reference

```bash
# Port already in use
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# MongoDB not connecting
mongosh              # Test connection
brew services start mongodb-community  # macOS

# Module not found
rm -r node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
npm install

# Check Node version
node -v

# Check npm version
npm -v

# List global packages
npm list -g

# Kill process on port
lsof -i :5000
kill -9 <PID>
```

---

## 🎓 Learning Resources

```
Node.js:      https://nodejs.org/en/docs/
MongoDB:      https://docs.mongodb.com/
Express:      https://expressjs.com/
React:        https://react.dev/
Mapbox:       https://docs.mapbox.com/
Socket.io:    https://socket.io/docs/
```

---

## ✨ SUCCESS INDICATORS

You'll know installation is complete when:

```
Backend:
✅ "Server running on port 5000"
✅ "MongoDB connected"

Frontend:
✅ "Compiled successfully!"
✅ Browser opens http://localhost:3000

Features:
✅ Can signup/login
✅ Can see map
✅ Can see location marker
✅ Can click emergency button
✅ No red errors in console
```

---

## 🎊 INSTALLATION STATUS TRACKER

```
Phase 1: Prerequisites
[████████████░░░░░░░░] 60%
  ☐ Node.js
  ☑ MongoDB
  ☐ Editor

Phase 2: Backend
[████████████████░░░░] 80%
  ☑ npm install
  ☑ .env created
  ☐ npm run dev

Phase 3: Frontend
[██████░░░░░░░░░░░░░░] 30%
  ☐ npm install
  ☐ .env created
  ☐ npm start

Phase 4: Verification
[░░░░░░░░░░░░░░░░░░░░] 0%
  ☐ Testing
  ☐ Features
  ☐ Console check
```

---

**Status:** Installation guides complete ✅  
**Format:** Quick reference with diagrams  
**Time:** 45-60 minutes to complete

*Choose QUICK_INSTALLATION_CHECKLIST.md or COMPLETE_INSTALLATION_GUIDE.md to get started!*
