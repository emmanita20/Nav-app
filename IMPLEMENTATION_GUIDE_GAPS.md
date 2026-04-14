# Implementation Guide for Identified Gaps

## 1. Google OAuth Integration

### Frontend Implementation

#### Update LoginPage.js
```javascript
import { useAuthStore } from '../services/store';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const { login } = useAuthStore();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      navigate('/home');
    } catch (error) {
      console.error('Google auth failed:', error);
    }
  };

  return (
    <div>
      {/* Existing email/password form */}
      <div className="mt-4 text-center">
        <p className="mb-3">Or continue with</p>
        <GoogleLogin onSuccess={handleGoogleSuccess} />
      </div>
    </div>
  );
};
```

#### Install Dependencies
```bash
npm install @react-oauth/google
```

#### Update index.js
```javascript
import { GoogleOAuthProvider } from '@react-oauth/google';

<GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
  <App />
</GoogleOAuthProvider>
```

### Backend Implementation

#### Add Google OAuth Endpoint
```javascript
// backend/routes/auth.js - Add this route

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const userId = payload.sub;
    
    let user = await User.findOne({ googleId: userId });
    
    if (!user) {
      user = new User({
        googleId: userId,
        email: payload.email,
        firstName: payload.given_name || 'User',
        lastName: payload.family_name || '',
        role: 'user',
        emailVerified: true,
      });
      await user.save();
    }
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    res.json({ accessToken, refreshToken, user });
  } catch (err) {
    res.status(400).json({ error: 'Google authentication failed' });
  }
});
```

#### Install Dependencies
```bash
npm install google-auth-library
```

#### Environment Variables
```env
GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 2. Rate Limiting & DDoS Protection

### Installation & Setup

```bash
npm install express-rate-limit
```

### Implementation

#### Create Rate Limiter Middleware
```javascript
// backend/middleware/rateLimiter.js

const rateLimit = require('express-rate-limit');

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Emergency SOS limiter - allow 1 per minute to prevent abuse
const emergencyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: 'Emergency alerts are rate limited',
});

module.exports = { generalLimiter, authLimiter, emergencyLimiter };
```

#### Apply in server.js
```javascript
// backend/server.js

const { generalLimiter, authLimiter, emergencyLimiter } = require('./middleware/rateLimiter');

app.use(generalLimiter); // Apply to all routes

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/emergency/sos', emergencyLimiter);
```

---

## 3. Service Worker for Offline Support

### Implementation

```javascript
// frontend/public/service-worker.js

const CACHE_NAME = 'navi-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js',
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event with cache-first strategy for static assets
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  // Cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        // Cache successful responses
        if (!fetchResponse || fetchResponse.status !== 200) {
          return fetchResponse;
        }

        const responseToCache = fetchResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return fetchResponse;
      });
    }).catch(() => {
      // Return offline page if needed
      return new Response('Offline - Limited functionality available');
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### Register Service Worker

```javascript
// frontend/src/index.js

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(registration => console.log('SW registered'))
    .catch(error => console.log('SW registration failed:', error));
}
```

---

## 4. Real-Time Heatmap Visualization

### Install Dependencies
```bash
npm install mapbox-gl @mapbox/mapbox-gl-geocoder
```

### Create Heatmap Component

```javascript
// frontend/src/components/HeatmapView.js

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import apiClient from '../services/api';

const HeatmapView = ({ buildingId }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [heatmapData, setHeatmapData] = React.useState(null);

  useEffect(() => {
    // Fetch crowd density data
    apiClient.get(`/analytics/crowd-density/${buildingId}`)
      .then(res => setHeatmapData(res.data.densityData))
      .catch(err => console.error('Heatmap data fetch failed:', err));
  }, [buildingId]);

  useEffect(() => {
    if (!mapContainer.current || !heatmapData) return;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-74.5, 40],
        zoom: 15,
      });
    }

    map.current.on('load', () => {
      // Add heatmap layer
      map.current.addSource('heatmap-data', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: heatmapData.map(point => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [point.lng, point.lat],
            },
            properties: {
              density: point.density || 0,
            },
          })),
        },
      });

      map.current.addLayer({
        id: 'heatmap',
        type: 'heatmap',
        source: 'heatmap-data',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'density'], 0, 0, 100, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 255, 0)',
            0.2, 'rgb(0, 0, 255)',
            0.4, 'rgb(0, 255, 255)',
            0.6, 'rgb(255, 255, 0)',
            0.8, 'rgb(255, 0, 0)',
            1, 'rgba(255, 0, 0, 1)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
          'heatmap-opacity': 0.8,
        },
      });
    });

    return () => {
      if (map.current.getSource('heatmap-data')) {
        map.current.removeLayer('heatmap');
        map.current.removeSource('heatmap-data');
      }
    };
  }, [heatmapData]);

  return <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />;
};

export default HeatmapView;
```

### Backend Endpoint for Crowd Density

```javascript
// backend/routes/analytics.js - Add this endpoint

router.get('/crowd-density/:buildingId', verifyToken, async (req, res) => {
  try {
    const { buildingId } = req.params;
    
    // Aggregate user locations by room/area
    const densityData = await NavigationLog.aggregate([
      {
        $match: {
          'startLocation.buildingId': mongoose.Types.ObjectId(buildingId),
          timestamp: {
            $gte: new Date(Date.now() - 1 * 60 * 1000) // Last minute
          }
        }
      },
      {
        $group: {
          _id: '$endLocation.roomId',
          userCount: { $sum: 1 },
          lastLocation: { $last: '$endLocation' }
        }
      },
      {
        $project: {
          roomId: '$_id',
          lat: '$lastLocation.lat',
          lng: '$lastLocation.lng',
          density: { $divide: ['$userCount', 100] } // Normalize density
        }
      }
    ]);

    res.json({ densityData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

## 5. i18n (Multi-language) Support

### Installation

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### Configuration

```javascript
// frontend/src/i18n/config.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';
import frTranslation from './locales/fr.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      es: { translation: esTranslation },
      fr: { translation: frTranslation },
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
```

### Create Translation Files

```json
// frontend/src/i18n/locales/en.json
{
  "navigation": "Navigation",
  "emergency": "Emergency",
  "sosButton": "Emergency SOS",
  "confirmSOS": "Confirm SOS",
  "loading": "Loading...",
  "error": "An error occurred",
  "login": "Login",
  "signup": "Sign Up",
  "logout": "Logout"
}
```

### Usage in Components

```javascript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('navigation')}</h1>
      <button onClick={() => i18n.changeLanguage('es')}>
        Español
      </button>
      <button onClick={() => i18n.changeLanguage('en')}>
        English
      </button>
    </div>
  );
};
```

---

## 6. MongoDB Backup Strategy

### Automated Backup Script

```javascript
// backend/utils/backupDatabase.js

const mongoose = require('mongoose');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const BACKUP_DIR = path.join(__dirname, '../backups');

async function backupDatabase() {
  try {
    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/navi-app';
    const dbName = new URL(mongoUri).pathname.slice(1);

    // Execute mongodump
    exec(`mongodump --uri="${mongoUri}" --out="${backupPath}"`, (error) => {
      if (error) {
        console.error('Backup failed:', error);
        return;
      }
      
      console.log(`Backup successful: ${backupPath}`);
      
      // Optional: Upload to cloud storage (AWS S3, Google Cloud, etc.)
      uploadBackupToCloud(backupPath);
    });
  } catch (err) {
    console.error('Backup error:', err);
  }
}

async function uploadBackupToCloud(backupPath) {
  // Implement cloud upload (S3, GCS, etc.)
  console.log('Uploading to cloud storage...');
}

// Schedule daily backups
const schedule = require('node-schedule');

function startBackupScheduler() {
  // Run backup every day at 2 AM
  schedule.scheduleJob('0 2 * * *', () => {
    console.log('Running scheduled backup...');
    backupDatabase();
  });
}

module.exports = { backupDatabase, startBackupScheduler };
```

### Enable in server.js

```javascript
const { startBackupScheduler } = require('./utils/backupDatabase');

// Start backup scheduler
startBackupScheduler();
```

### Install Dependencies

```bash
npm install node-schedule
```

---

## 7. Application Performance Monitoring (APM)

### Using Sentry

```bash
npm install @sentry/node @sentry/tracing
```

#### Backend Integration

```javascript
// backend/server.js

const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({
      app: true,
      request: true,
    }),
  ],
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... your routes ...

app.use(Sentry.Handlers.errorHandler());
```

#### Frontend Integration

```bash
npm install @sentry/react @sentry/tracing
```

```javascript
// frontend/src/index.js

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [
    new BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});
```

---

## Implementation Priority Timeline

### Week 1
- [ ] Google OAuth integration (8 hours)
- [ ] Rate limiting middleware (2 hours)

### Week 2
- [ ] Service Worker offline support (6 hours)
- [ ] MongoDB backup automation (3 hours)

### Week 3
- [ ] Heatmap visualization (6 hours)
- [ ] APM setup (Sentry) (4 hours)

### Week 4
- [ ] i18n multi-language support (5 hours)
- [ ] Testing and optimization (remaining hours)

---

*Total Estimated Effort: 34 hours*
