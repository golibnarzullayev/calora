# PWA (Progressive Web App) Setup Guide

## Overview

The Calories Calculator is fully configured as a Progressive Web App (PWA) with offline support, installability, and service worker caching.

## Features Implemented

### 1. Service Worker (`public/sw.js`)
- **Offline Support**: Network-first strategy for API calls, cache-first for static assets
- **Automatic Updates**: Checks for updates every 60 seconds
- **Cache Management**: Separate caches for runtime and static assets
- **Smart Fallbacks**: Returns cached data when offline

### 2. Web App Manifest (`public/manifest.json`)
- **App Metadata**: Name, description, icons, theme colors
- **Installation**: Standalone display mode (full-screen app experience)
- **Shortcuts**: Quick access to Meals and Stats sections
- **Share Target**: Support for sharing images directly to the app
- **Screenshots**: App preview images for app stores

### 3. HTML Meta Tags (`index.html`)
- **Apple iOS Support**: Web app capable, status bar styling, home screen icon
- **Android Support**: Theme color, mobile web app capable
- **Preconnect/DNS Prefetch**: Performance optimization for API calls
- **Preload**: Critical resources for faster loading

### 4. PWA Utilities (`src/utils/pwa.ts`)
- Service worker registration and management
- Install prompt handling
- Network status detection
- Standalone mode detection
- App installation tracking

### 5. PWA Hook (`src/hooks/usePWA.ts`)
- React hook for PWA state management
- Installation status tracking
- Network status monitoring
- Service worker registration status

## Installation

### For Users

#### Android
1. Open the app in Chrome
2. Tap the menu (⋮) → "Install app"
3. Confirm installation
4. App appears on home screen

#### iOS
1. Open the app in Safari
2. Tap Share → "Add to Home Screen"
3. Name the app and add
4. App appears on home screen

### For Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Service Worker Caching Strategy

### Network-First (API Requests)
```
1. Try to fetch from network
2. Cache successful responses
3. If offline, return cached response
4. If no cache, return error message
```

### Cache-First (Static Assets)
```
1. Check cache first
2. If not cached, fetch from network
3. Cache successful responses
4. If offline and not cached, return fallback
```

## Required Icons

Create these icon files in the `public` folder:

```
public/
├── icon-192.png          (192x192 PNG)
├── icon-192-maskable.png (192x192 PNG with safe zone)
├── icon-512.png          (512x512 PNG)
├── icon-512-maskable.png (512x512 PNG with safe zone)
├── icon-96.png           (96x96 PNG for shortcuts)
├── screenshot-1.png      (540x720 PNG)
└── screenshot-2.png      (540x720 PNG)
```

### Icon Requirements
- **Format**: PNG with transparency
- **Safe Zone**: For maskable icons, keep important content in center 40% of image
- **Colors**: Match theme color (#3b82f6)
- **Style**: Consistent with app branding

## Testing PWA Features

### Test Service Worker
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Registered service workers:', registrations);
});
```

### Test Offline Mode
1. Open DevTools (F12)
2. Go to Application → Service Workers
3. Check "Offline" checkbox
4. Refresh page
5. App should work with cached data

### Test Installation
1. Open DevTools
2. Go to Application → Manifest
3. Check manifest is valid
4. Look for "Install" button in address bar

### Test Network Status
```javascript
// In browser console
navigator.onLine // true if online, false if offline
```

## Deployment Considerations

### HTTPS Required
- PWA requires HTTPS in production
- Service workers only work over HTTPS (except localhost)

### Cache Busting
- Update `CACHE_NAME` in `sw.js` to invalidate cache
- Example: `'calories-tracker-v2'`

### Update Strategy
1. Service worker checks for updates every 60 seconds
2. New version is installed in background
3. User is notified of update availability
4. User can skip waiting or reload to use new version

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Web App Manifest | ✅ | ✅ | ❌ | ✅ |
| Install Prompt | ✅ | ❌ | ❌ | ✅ |
| Offline Support | ✅ | ✅ | ✅ | ✅ |

## Performance Metrics

### Lighthouse PWA Score
Target: 90+

**Checklist:**
- ✅ Installable
- ✅ Works offline
- ✅ HTTPS
- ✅ Responsive design
- ✅ Splash screen
- ✅ Theme color
- ✅ Icons

## Troubleshooting

### Service Worker Not Registering
```bash
# Check browser console for errors
# Ensure sw.js is in public folder
# Check HTTPS in production
# Clear cache and hard refresh (Ctrl+Shift+R)
```

### App Not Installable
```bash
# Check manifest.json is valid
# Ensure icons exist and are accessible
# Check theme-color meta tag
# Verify HTTPS in production
```

### Offline Not Working
```bash
# Check service worker is registered
# Verify cache names in sw.js
# Check DevTools → Application → Cache Storage
# Clear cache and re-register
```

## Future Enhancements

- [ ] Background sync for offline meal uploads
- [ ] Push notifications for daily reminders
- [ ] Periodic background sync for stats updates
- [ ] File handling for direct image sharing
- [ ] Badging API for notification count
- [ ] Share API integration

## Resources

- [MDN Web Docs - PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
