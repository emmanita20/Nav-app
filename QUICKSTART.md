# Quick Start Guide

## Prerequisites
- Node.js 16+
- MongoDB 5+
- npm or yarn

## 5-Minute Setup

### 1. Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure MongoDB
# Edit .env: MONGODB_URI=mongodb://localhost:27017/navi-app

# Start server
npm run dev
```

Server will run on `http://localhost:5000`

### 2. Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

App will open on `http://localhost:3000`

## Testing the Features

### 1. User Registration & Login
```bash
# Navigate to http://localhost:3000/login
# Click "Sign up" to create account
# Use email & password or phone OTP
```

### 2. Live GPS Tracking
- Allow location permission
- Location updates shown in real-time
- Current building detected automatically

### 3. Navigation
1. Go to homepage
2. Select destination (e.g., "ICU", "Lab")
3. Choose route algorithm (Dijkstra/A*)
4. Follow turn-by-turn directions
5. Voice navigation available

### 4. Emergency Alert
1. Click "EMERGENCY SOS" button
2. Confirm by clicking again
3. Alert sent to nearby responders
4. Real-time tracking starts

### 5. Admin Features
1. Login as admin
2. Navigate to admin panel
3. Create buildings, floors, rooms
4. Upload floor maps
5. View analytics dashboard

## API Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Update Location
```bash
curl -X POST http://localhost:5000/api/gps/update-location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat":40.7128,"lng":-74.0060}'
```

### Find Route
```bash
curl -X POST http://localhost:5000/api/navigation/find-route \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"startRoomId":"ROOM_ID_1","endRoomId":"ROOM_ID_2","algorithm":"astar"}'
```

### Trigger SOS
```bash
curl -X POST http://localhost:5000/api/emergency/sos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"alertType":"medical","description":"Emergency assistance needed"}'
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/navi-app
JWT_SECRET=your_secret_key_at_least_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Optional (for full features)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

MAPBOX_ACCESS_TOKEN=your_mapbox_token
GOOGLE_MAPS_API_KEY=your_google_maps_key

NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
```

## Database Initialization

### Create Sample Data
```bash
cd backend/utils
node seedDatabase.js
```

This will create:
- Sample building (Hospital)
- 5 floors
- 20 rooms
- Sample users

## Troubleshooting

### MongoDB Connection Error
- Check MongoDB is running: `mongod`
- Verify MONGODB_URI in .env
- Create database: `mongo` → `use navi-app`

### Port Already in Use
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### CORS Error
- Check API_URL matches backend URL
- Verify backend CORS middleware

### Location Permission Denied
- Check browser location permissions
- Try incognito mode
- Use HTTPS (required for production)

## Next Steps

1. ✅ Review `IMPLEMENTATION.md` for full feature list
2. ✅ Check API endpoints in `backend/routes/`
3. ✅ Explore frontend components in `frontend/src/`
4. ✅ Set up actual Twilio/Firebase for production
5. ✅ Deploy to cloud (Heroku, AWS, Azure, etc.)

## Support

For issues or questions:
1. Check error logs in terminal
2. Review MongoDB connection
3. Verify all environment variables
4. Check browser console (F12)

---

Happy navigating! 🗺️
