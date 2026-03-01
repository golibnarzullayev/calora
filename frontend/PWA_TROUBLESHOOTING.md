# PWA Installation Troubleshooting Guide

## Common Installation Issues & Solutions

### Issue 1: Install Button Not Appearing

**Symptoms:**
- No install prompt in browser address bar
- No "Add to Home Screen" option in menu

**Causes & Solutions:**

1. **Manifest.json Not Found**
   ```bash
   # Check if manifest is properly linked in HTML
   # Look for: <link rel="manifest" href="/manifest.json" />
   ```

2. **Invalid Manifest JSON**
   ```bash
   # Validate manifest in DevTools:
   # 1. Open DevTools (F12)
   # 2. Go to Application → Manifest
   # 3. Check for red errors
   ```

3. **Missing Required Fields in Manifest**
   Required fields:
   - `name` (full app name)
   - `short_name` (max 12 characters)
   - `start_url` (must be "/")
   - `display` (must be "standalone", "fullscreen", or "minimal-ui")
   - `theme_color` (hex color)
   - `background_color` (hex color)
   - `icons` (at least one icon with sizes 192x192 and 512x512)

4. **HTTPS Not Enabled**
   - PWA requires HTTPS in production
   - Service workers only work over HTTPS (except localhost)
   - Check: `https://calora.gignite.uz` (not http://)

5. **Service Worker Not Registered**
   ```javascript
   // Check in browser console:
   navigator.serviceWorker.getRegistrations().then(regs => {
     console.log('Service Workers:', regs);
   });
   ```

### Issue 2: Service Worker Not Registering

**Symptoms:**
- Service Worker shows as "unregistered" in DevTools
- Offline functionality not working

**Solutions:**

1. **Check Service Worker File**
   ```bash
   # Ensure /public/sw.js exists and is accessible
   # Try accessing: https://calora.gignite.uz/sw.js
   ```

2. **Check Browser Console for Errors**
   ```javascript
   // In DevTools Console, look for:
   // - "Service Worker registration failed"
   // - "Failed to fetch"
   // - CORS errors
   ```

3. **Clear Cache and Re-register**
   ```javascript
   // In DevTools Console:
   navigator.serviceWorker.getRegistrations().then(regs => {
     regs.forEach(reg => reg.unregister());
   });
   // Then refresh the page
   ```

4. **Check Vite Configuration**
   - Ensure `Service-Worker-Allowed` header is set
   - Check `vite.config.ts` for proper server headers

### Issue 3: Icons Not Displaying

**Symptoms:**
- App icon missing on home screen
- Generic icon shown instead

**Solutions:**

1. **Icon Format Issues**
   - Icons should be PNG, JPEG, or SVG
   - Minimum sizes: 192x192 and 512x512
   - Use data URIs or ensure files are accessible

2. **Manifest Icon Configuration**
   ```json
   {
     "icons": [
       {
         "src": "data:image/svg+xml,...",
         "sizes": "192x192",
         "type": "image/svg+xml",
         "purpose": "any"
       }
     ]
   }
   ```

3. **Apple Touch Icon**
   - Add to HTML: `<link rel="apple-touch-icon" href="/icon-192.png" />`
   - iOS requires this for home screen icon

### Issue 4: App Not Working Offline

**Symptoms:**
- App crashes when offline
- Data not loading when offline

**Solutions:**

1. **Check Service Worker Cache**
   ```javascript
   // In DevTools Console:
   caches.keys().then(names => {
     console.log('Caches:', names);
     names.forEach(name => {
       caches.open(name).then(cache => {
         cache.keys().then(requests => {
           console.log(`${name}:`, requests);
         });
       });
     });
   });
   ```

2. **Verify Cache Strategy**
   - Network-first for API calls
   - Cache-first for static assets
   - Check `public/sw.js` for proper implementation

3. **Test Offline Mode**
   ```
   1. Open DevTools (F12)
   2. Go to Application → Service Workers
   3. Check "Offline" checkbox
   4. Refresh page
   5. App should still work with cached data
   ```

## Browser-Specific Issues

### Chrome/Edge
- Install prompt appears after 30 seconds of use
- Requires 2+ visits within 7 days
- Check: Menu → More Tools → Create Shortcut

### Firefox
- PWA support is limited
- Use "Add to Home Screen" from menu
- Check: about:config → dom.manifest.enabled = true

### Safari (iOS)
- No install prompt
- Use "Add to Home Screen" from Share menu
- Requires `apple-mobile-web-app-capable` meta tag

### Samsung Internet
- Similar to Chrome
- Check: Menu → Add to Home Screen

## Debugging Steps

### Step 1: Validate Manifest
```bash
# Open DevTools → Application → Manifest
# Check for:
✓ Valid JSON
✓ All required fields present
✓ Icons are accessible
✓ start_url is "/"
```

### Step 2: Check Service Worker
```bash
# Open DevTools → Application → Service Workers
# Check for:
✓ Status: "activated and running"
✓ No errors in console
✓ Scope is "/"
```

### Step 3: Verify HTTPS
```bash
# Ensure site uses HTTPS
# Check browser address bar for lock icon
# PWA won't work over HTTP (except localhost)
```

### Step 4: Test Installation
```bash
# Chrome/Edge:
1. Open DevTools (F12)
2. Go to Application → Manifest
3. Look for "Install" button
4. Or check address bar for install icon

# Safari (iOS):
1. Open app in Safari
2. Tap Share button
3. Scroll down and tap "Add to Home Screen"
```

### Step 5: Check Network Tab
```bash
# Open DevTools → Network
# Verify:
✓ manifest.json loads (200 status)
✓ sw.js loads (200 status)
✓ No CORS errors
✓ No 404 errors
```

## Quick Checklist

- [ ] manifest.json is valid JSON
- [ ] manifest.json is linked in HTML: `<link rel="manifest" href="/manifest.json" />`
- [ ] All required manifest fields present
- [ ] Icons are accessible and correct format
- [ ] Service worker file exists at `/public/sw.js`
- [ ] HTTPS is enabled in production
- [ ] `theme-color` meta tag is present
- [ ] `apple-mobile-web-app-capable` meta tag is present
- [ ] No CORS errors in console
- [ ] No JavaScript errors in console
- [ ] Service worker shows as "activated and running"
- [ ] Visited site at least once (Chrome requires 2 visits)

## Testing Commands

```javascript
// Check manifest validity
fetch('/manifest.json').then(r => r.json()).then(m => console.log(m));

// Check service worker registration
navigator.serviceWorker.getRegistrations().then(r => console.log(r));

// Check if online
console.log('Online:', navigator.onLine);

// Check installed apps
navigator.getInstalledRelatedApps?.().then(apps => console.log(apps));

// Check if running as standalone
console.log('Standalone:', window.navigator.standalone);
console.log('Display mode:', window.matchMedia('(display-mode: standalone)').matches);
```

## Production Deployment Checklist

- [ ] Deploy to HTTPS domain
- [ ] Update manifest.json with correct app name
- [ ] Add real app icons (192x192 and 512x512 PNG)
- [ ] Update start_url if needed
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Verify service worker caching strategy
- [ ] Test offline functionality
- [ ] Monitor service worker errors in production
- [ ] Set up error tracking for PWA issues

## Resources

- [MDN PWA Checklist](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Installable_PWAs)
- [Web.dev PWA Checklist](https://web.dev/pwa-checklist/)
- [Manifest Validator](https://manifest-validator.appspot.com/)
- [PWA Builder](https://www.pwabuilder.com/)
