# Navi-App: Complete Installation & Setup Guide

**Date:** February 5, 2026  
**Status:** Production Ready  
**Estimated Setup Time:** 45-60 minutes

---

## 🎯 Prerequisites & System Requirements

### Minimum Requirements
- **OS:** Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **RAM:** 4GB minimum, 8GB recommended
- **Disk Space:** 2GB free
- **Internet:** Required for package installation and API services

### Software Requirements
- **Node.js:** 16.0.0 or higher
- **npm:** 7.0.0 or higher (comes with Node.js)
- **MongoDB:** 5.0 or higher
- **Git:** (optional, for cloning repository)
- **Code Editor:** VS Code (recommended) or any text editor

---

## 📋 Step-by-Step Installation

## STEP 1: Install Node.js and npm

### On Windows
1. Go to https://nodejs.org
2. Download LTS version (v18+ recommended)
3. Run the installer
4. Follow installation wizard (use default settings)
5. Restart your computer

### On macOS
```bash
# Using Homebrew (recommended)
brew install node

# Or download from https://nodejs.org
```

### On Linux (Ubuntu)
```bash
sudo apt update
sudo apt install nodejs npm
```

### Verify Installation
```bash
node --version    # Should show v16.0.0 or higher
npm --version     # Should show 7.0.0 or higher
```

---

## STEP 2: Install MongoDB

### Option A: MongoDB Community Edition (Recommended for Development)

#### On Windows
1. Go to https://www.mongodb.com/try/download/community
2. Select:
   - **Version:** Latest (5.0+)
   - **Platform:** Windows
   - **Package:** MSI
3. Download and run installer
4. Choose "Complete" installation
5. Configure MongoDB as Windows Service (checked by default)
6. Click "Finish"

#### On macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

#### On Linux (Ubuntu)
```bash
# Install MongoDB
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Option B: MongoDB Atlas (Cloud - Recommended for Production)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Use in .env file (see Step 5)

### Verify MongoDB Installation
```bash
# Check if MongoDB is running
mongosh    # Opens MongoDB shell

# Type 'exit' to quit
```

---

## STEP 3: Clone or Download Project

### Option A: Using Git (If you have Git installed)
```bash
git clone https://github.com/yourusername/navi-app.git
cd navi-app
```

### Option B: Manual Download
1. Download project folder
2. Extract to your desired location
3. Open terminal/PowerShell in project folder

---

## STEP 4: Setup Backend

### Step 4.1: Navigate to Backend Directory
```bash
cd backend
```

### Step 4.2: Install Backend Dependencies
```bash
npm install
```

**This will install:**
- express (web framework)
- mongoose (MongoDB ORM)
- cors (cross-origin requests)
- jsonwebtoken (authentication)
- bcryptjs (password hashing)
- socket.io (real-time communication)
- twilio (SMS notifications)
- firebase-admin (push notifications)
- helmet (security)
- express-validator (input validation)
- dotenv (environment variables)

### Step 4.3: Create Environment Configuration File

Create a `.env` file in the `backend` folder:

```bash
# Copy example to actual file (Windows PowerShell)
copy .env.example .env

# Or on macOS/Linux
cp .env.example .env
```

### Step 4.4: Configure Environment Variables

Edit `backend/.env` with your actual values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/navi-app
# OR if using MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/navi-app?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_very_secure_secret_key_here_min_32_characters
JWT_REFRESH_SECRET=your_very_secure_refresh_secret_key_here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Twilio (for SMS notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### Where to Get These Values

#### JWT_SECRET & JWT_REFRESH_SECRET
```bash
# Generate secure random strings (in PowerShell or terminal)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### TWILIO Credentials
1. Go to https://www.twilio.com/console
2. Get your Account SID and Auth Token
3. Create a phone number if you don't have one
4. Add to .env

#### FIREBASE Credentials
1. Go to https://console.firebase.google.com
2. Create a new project or use existing
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Copy credentials to .env

#### MONGODB_URI
**Local MongoDB:**
```
mongodb://localhost:27017/navi-app
```

**MongoDB Atlas (Cloud):**
1. Go to https://cloud.mongodb.com
2. Create cluster
3. Click "Connect"
4. Copy connection string
5. Replace `<username>`, `<password>`, `<cluster>` with your values

### Step 4.5: Verify Backend Setup

```bash
# Test if backend starts
npm run dev

# You should see:
# "Server running on port 5000"
# "MongoDB connected"
```

Press `Ctrl+C` to stop the server.

---

## STEP 5: Setup Frontend

### Step 5.1: Navigate to Frontend Directory

```bash
# From project root
cd frontend
```

### Step 5.2: Install Frontend Dependencies

```bash
npm install
```

**This will install:**
- react (UI framework)
- react-dom (DOM rendering)
- react-router-dom (navigation)
- axios (HTTP client)
- socket.io-client (real-time)
- mapbox-gl (mapping)
- tailwindcss (styling)
- zustand (state management)
- recharts (charts)
- react-icons (icons)
- react-query (data fetching)

### Step 5.3: Create Frontend Environment Configuration

Create a `.env` file in the `frontend` folder:

```bash
# Windows PowerShell
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

### Step 5.4: Configure Frontend Environment Variables

Edit `frontend/.env`:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Mapbox (for mapping)
REACT_APP_MAPBOX_TOKEN=your_mapbox_public_token

# Google OAuth (optional, for login)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# Socket.io Configuration
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Where to Get These Values

#### REACT_APP_MAPBOX_TOKEN
1. Go to https://www.mapbox.com
2. Create account (free tier available)
3. Go to Account → Tokens
4. Copy public token
5. Add to .env

#### REACT_APP_GOOGLE_CLIENT_ID (Optional)
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Copy Client ID

### Step 5.5: Verify Frontend Setup

```bash
# Test if frontend starts
npm start

# You should see:
# "Compiled successfully!"
# Browser opens at http://localhost:3000
```

Press `Ctrl+C` to stop the development server.

---

## STEP 6: Prepare Database

### Step 6.1: Seed Initial Data (Optional)

Run the database seeding script:

```bash
# From backend directory
cd backend
node utils/seedDatabase.js
```

This creates:
- Test buildings
- Test users
- Initial floors and rooms
- Sample data for testing

### Step 6.2: Verify Database Data

```bash
# Open MongoDB shell
mongosh

# Or MongoDB Compass (GUI):
# Go to https://www.mongodb.com/try/download/compass
# Install and connect to your database

# In shell, run:
use navi-app
db.users.find()        # Should show users
db.buildings.find()    # Should show buildings
```

---

## STEP 7: Configure Third-Party Services

### API Keys Checklist

| Service | Purpose | Status | Notes |
|---------|---------|--------|-------|
| Mapbox | Map display | ⚠️ Required | Free tier: 50k API calls/month |
| Twilio | SMS alerts | ⚠️ Required | Free tier: $15 trial credit |
| Firebase | Push notifications | ⚠️ Required | Free tier available |
| Google OAuth | Social login | ❌ Optional | For future enhancement |

### Setting Up Each Service

#### Mapbox Setup
1. Go to https://www.mapbox.com
2. Create account
3. Dashboard → Tokens → Copy Default Public Token
4. Add to `frontend/.env` as `REACT_APP_MAPBOX_TOKEN`

#### Twilio Setup
1. Go to https://www.twilio.com
2. Create account
3. Get trial phone number
4. Copy Account SID and Auth Token
5. Add to `backend/.env`

#### Firebase Setup
1. Go to https://firebase.google.com
2. Create new project
3. Add web app
4. Go to Project Settings → Service Accounts
5. Generate private key
6. Add credentials to `backend/.env`

---

## STEP 8: Run the Application

### Method 1: Separate Terminal Windows (Easiest)

#### Terminal 1 - Backend
```bash
cd backend
npm run dev

# Expected output:
# Server running on port 5000
# MongoDB connected
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm start

# Expected output:
# Compiled successfully!
# Opens http://localhost:3000
```

### Method 2: Using npm-run-all (Simultaneous)

```bash
# From project root
npm install -g npm-run-all

# Create package.json in root (if not exists)
# Then run:
npm-run-all --parallel backend:dev frontend:start
```

### Method 3: Using Concurrently

```bash
# From project root
npm install --save-dev concurrently

# In root package.json, add:
"scripts": {
  "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm start\""
}

# Then run:
npm run dev
```

---

## STEP 9: Verify Installation

### Checklist

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] MongoDB connected (check backend logs)
- [ ] Browser opens frontend without errors

### Test API Endpoints

```bash
# Using PowerShell or curl

# Health check
curl http://localhost:5000/api/health

# Should return: {"status":"ok","timestamp":"..."}

# Try signup (replace with your values)
curl -X POST http://localhost:5000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{
    "email":"test@example.com",
    "password":"TestPassword123!",
    "firstName":"Test",
    "lastName":"User",
    "phone":"+1234567890"
  }'
```

### Test Frontend

1. Open http://localhost:3000 in browser
2. Try signup with test account
3. Should see home page after login
4. Check browser console for errors (F12)

---

## STEP 10: Troubleshooting

### Common Issues & Solutions

#### "Port 5000 already in use"
```bash
# Kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000
kill -9 <PID>

# Or use different port in .env:
PORT=5001
```

#### "MongoDB connection refused"
```bash
# Make sure MongoDB is running
# Windows: Check Services
# macOS: brew services list
# Linux: sudo systemctl status mongodb

# Or check connection string:
# Local: mongodb://localhost:27017/navi-app
# Atlas: mongodb+srv://user:pass@cluster.mongodb.net/navi-app
```

#### "Module not found" errors
```bash
# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

#### "CORS error" in browser console
```
# Ensure FRONTEND_URL in backend/.env matches your frontend URL
FRONTEND_URL=http://localhost:3000
```

#### "Mapbox token invalid"
```bash
# Verify token in frontend/.env
# Check it's a PUBLIC token (not secret)
# Test at: https://account.mapbox.com/tokens/
```

---

## STEP 11: Initial Testing

### Create Test User

```bash
# Using the signup endpoint or frontend signup form
Email: test@example.com
Password: TestPassword123!
First Name: Test
Last Name: User
```

### Test Features

1. **Authentication**
   - [ ] Signup works
   - [ ] Login works
   - [ ] Logout works
   - [ ] JWT tokens generated

2. **Location**
   - [ ] Allow location permission
   - [ ] GPS location shows on map
   - [ ] Coordinates update in real-time

3. **Navigation**
   - [ ] Can select destination
   - [ ] Route calculates
   - [ ] Directions appear

4. **Emergency**
   - [ ] SOS button visible
   - [ ] Can trigger emergency (with confirmation)
   - [ ] Should see alert status

5. **Admin Dashboard**
   - [ ] Login with admin account
   - [ ] Can see building stats
   - [ ] Analytics display correctly

---

## STEP 12: Production Deployment Preparation

### Before Going Live

- [ ] Change JWT_SECRET and JWT_REFRESH_SECRET to random values
- [ ] Setup HTTPS/SSL certificates
- [ ] Configure production MongoDB (MongoDB Atlas)
- [ ] Disable NODE_ENV=development
- [ ] Enable rate limiting
- [ ] Setup APM monitoring (Sentry/Datadog)
- [ ] Configure automated backups
- [ ] Test all third-party integrations
- [ ] Security audit complete

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/navi-app
JWT_SECRET=<strong-random-key>
JWT_REFRESH_SECRET=<strong-random-key>
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
FIREBASE_PROJECT_ID=<your-project>
FRONTEND_URL=https://yourdomain.com
```

---

## STEP 13: Useful NPM Commands

### Backend Commands
```bash
cd backend

npm start              # Run in production
npm run dev           # Run in development
npm test              # Run tests
npm run lint          # Check code style
npm audit             # Check vulnerabilities
```

### Frontend Commands
```bash
cd frontend

npm start             # Run development server
npm run build        # Create production build
npm test             # Run tests
npm run eject        # Eject from Create React App
```

---

## 📊 Final Checklist

### Installation Complete When:
- [x] Node.js & npm installed
- [x] MongoDB running
- [x] Backend dependencies installed
- [x] Backend .env configured
- [x] Frontend dependencies installed
- [x] Frontend .env configured
- [x] Third-party API keys added
- [x] Database seeded (optional)
- [x] Backend starts without errors
- [x] Frontend starts without errors
- [x] Both running simultaneously
- [x] Test user can signup/login
- [x] Location permission works
- [x] API endpoints responding

### If All Checkboxes Complete:
✅ **APP IS READY TO USE**

---

## 🚀 Quick Reference Commands

### Complete Setup in One Go (Step-by-Step)

```bash
# 1. Navigate to project
cd navi-app

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev

# 3. In new terminal, setup Frontend
cd frontend
npm install
cp .env.example .env
# Edit .env with your values
npm start

# 4. Open browser
# http://localhost:3000
```

---

## 📞 Need Help?

### Check Logs
- **Backend:** Terminal output shows detailed logs
- **Frontend:** Browser console (F12)
- **MongoDB:** mongosh shows connection status

### Common Resources
- [Node.js Docs](https://nodejs.org/en/docs/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Mapbox Docs](https://docs.mapbox.com/)

### Verification Commands
```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check MongoDB
mongosh --version

# Test backend
curl http://localhost:5000/api/health

# Test frontend
# Visit http://localhost:3000 in browser
```

---

**Setup Time:** 45-60 minutes  
**Difficulty:** Easy to Moderate  
**Support:** See documents in project folder

*Follow these steps and your Navi-App will be fully functional!*
