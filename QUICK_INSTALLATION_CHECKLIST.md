# ⚡ QUICK INSTALLATION CHECKLIST

**Time Required:** 45-60 minutes  
**Difficulty:** Easy to Moderate

---

## 📋 Pre-Installation Checklist

- [ ] Windows 10+, macOS 10.14+, or Linux
- [ ] 4GB RAM, 2GB disk space
- [ ] Internet connection
- [ ] Administrator access (for installations)

---

## 🚀 FAST INSTALLATION (Copy & Paste)

### STEP 1: Install Node.js
**Website:** https://nodejs.org (LTS version)  
**Verify:** `node --version` & `npm --version`

### STEP 2: Install MongoDB

#### Local (Windows/Mac/Linux)
**Website:** https://www.mongodb.com/try/download/community  
**Verify:** `mongosh` (opens MongoDB shell)

#### Cloud (Recommended)
**Website:** https://www.mongodb.com/cloud/atlas  
**Action:** Create free cluster, get connection string

### STEP 3: Backend Setup

```bash
cd backend
npm install
copy .env.example .env
# Edit .env with values below ↓
npm run dev
```

### STEP 4: Frontend Setup (New Terminal)

```bash
cd frontend
npm install
copy .env.example .env
# Edit .env with values below ↓
npm start
```

### STEP 5: Configure .env Files

#### Backend `.env` (backend/.env)
```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/navi-app
# OR (MongoDB Atlas):
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/navi-app

JWT_SECRET=generate_random_string_here_at_least_32_chars
JWT_REFRESH_SECRET=another_random_string_here_32_chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

TWILIO_ACCOUNT_SID=get_from_twilio.com
TWILIO_AUTH_TOKEN=get_from_twilio.com
TWILIO_PHONE_NUMBER=+1234567890

FIREBASE_PROJECT_ID=get_from_firebase.com
FIREBASE_PRIVATE_KEY=get_from_firebase.com
FIREBASE_CLIENT_EMAIL=get_from_firebase.com

FRONTEND_URL=http://localhost:3000
LOG_LEVEL=debug
```

#### Frontend `.env` (frontend/.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MAPBOX_TOKEN=get_from_mapbox.com
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🔑 Getting Required API Keys

### Mapbox Token (For Maps)
1. Go to https://www.mapbox.com
2. Sign up (free tier: 50k requests/month)
3. Dashboard → Tokens → Copy public token
4. Paste in `frontend/.env` as `REACT_APP_MAPBOX_TOKEN`

### Twilio (For SMS)
1. Go to https://www.twilio.com
2. Sign up (free: $15 trial credit)
3. Console → Copy Account SID & Auth Token
4. Get trial phone number
5. Paste in `backend/.env`

### Firebase (For Push Notifications)
1. Go to https://firebase.google.com
2. Create new project
3. Project Settings → Service Accounts
4. Generate private key (JSON)
5. Copy values to `backend/.env`

### MongoDB Atlas (Cloud Database)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Click "Connect" → Copy connection string
5. Replace `<username>`, `<password>` with your credentials
6. Paste in `backend/.env` as `MONGODB_URI`

---

## ✅ Verification Steps

### Backend Running?
```bash
# Terminal should show:
# "Server running on port 5000"
# "MongoDB connected"

# Test API:
curl http://localhost:5000/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Frontend Running?
```bash
# Browser at http://localhost:3000 should load
# No errors in browser console (F12)
```

### Database Connected?
```bash
# Open MongoDB shell:
mongosh

# Inside shell:
use navi-app
show collections
# Should show: users, buildings, floors, rooms, etc.
```

---

## 🎯 Test the App

1. **Open** http://localhost:3000 in browser
2. **Signup** with test account
3. **Login** with your credentials
4. **Allow** location permission
5. **Check** map shows your location
6. **Try** emergency button
7. **Verify** no errors in console

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| Port 5000 in use | Change PORT in .env or kill process: `lsof -i :5000 \| kill -9` |
| MongoDB won't connect | Start MongoDB: `brew services start mongodb-community` or check Windows Services |
| CORS error | Verify FRONTEND_URL in backend/.env = http://localhost:3000 |
| npm ERR! | Delete `node_modules` & `package-lock.json`, run `npm install` again |
| Module not found | Run `npm install` in that directory |
| Mapbox not showing | Verify token in frontend/.env is PUBLIC (not secret) |

---

## 🗂️ File Structure

```
navi-app/
├── backend/
│   ├── .env                 ← Add credentials here
│   ├── package.json
│   ├── server.js           ← Main server file
│   ├── routes/             ← API endpoints
│   ├── models/             ← Database schemas
│   ├── services/           ← Business logic
│   └── utils/              ← Helpers
│
├── frontend/
│   ├── .env                ← Add API key here
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── pages/          ← Page components
│       ├── components/     ← Reusable components
│       └── services/       ← API & state
│
└── [documentation files]
```

---

## 📊 Default Test Account

**After seeding database:**

```
Email: test@example.com
Password: password123
```

**Or create new account via signup form**

---

## 🎓 Environment Setup Summary

### What Gets Installed
```
Backend:
✅ Express.js (web framework)
✅ MongoDB driver (database)
✅ Socket.io (real-time)
✅ Twilio (SMS)
✅ Firebase (notifications)
✅ Security & validation tools

Frontend:
✅ React (UI framework)
✅ Mapbox GL (mapping)
✅ Tailwind CSS (styling)
✅ Zustand (state)
✅ Socket.io client (real-time)
```

### What You Need to Configure
```
✅ .env files (credentials)
✅ API keys (Mapbox, Twilio, Firebase)
✅ Database connection (MongoDB)
✅ JWT secrets (generated)
```

---

## 🚀 Running the App

### Option 1: Two Terminals (Easiest)
```bash
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm start

# Open: http://localhost:3000
```

### Option 2: Single Terminal
```bash
npm install -g npm-run-all
npm-run-all --parallel backend:dev frontend:start
```

---

## ✨ Quick Win Checklist

- [ ] Node.js installed (v16+)
- [ ] MongoDB running
- [ ] Backend dependencies installed
- [ ] Backend .env configured with real keys
- [ ] Frontend dependencies installed
- [ ] Frontend .env configured with API keys
- [ ] Both apps start without errors
- [ ] Can visit http://localhost:3000
- [ ] Can signup/login
- [ ] No errors in browser console

**If all checked → App is ready! ✅**

---

## 📞 Need More Help?

**Detailed guide:** See COMPLETE_INSTALLATION_GUIDE.md  
**Feature overview:** See EXECUTIVE_SUMMARY.md  
**Quick reference:** See QUICK_REFERENCE_GUIDE.md

---

**Status:** Ready to Install ✅  
**Time:** 45-60 minutes  
**Difficulty:** Easy  

*Follow the steps above and your Navi-App will be running locally!*
