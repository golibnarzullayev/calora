# PWA Icons Setup Guide

## Quick Setup

The PWA requires icon files in the `public/` folder. You have two options:

### Option 1: Use the Icon Generator Script (Recommended)

**Prerequisites:**
```bash
npm install --save-dev sharp
```

**Generate Icons:**
```bash
node scripts/generate-pwa-icons.js
```

This will create:
- `logo-192.png` - 192x192 icon
- `logo-192-maskable.png` - 192x192 maskable icon
- `logo-512.png` - 512x512 icon
- `logo-512-maskable.png` - 512x512 maskable icon
- `screenshot-1.png` - App screenshot for store

### Option 2: Manual Icon Creation

Create PNG files with these specifications:

#### logo-192.png
- Size: 192x192 pixels
- Background: Blue gradient (#3b82f6 to #2563eb)
- Content: White "C" letter centered
- Format: PNG with transparency

#### logo-192-maskable.png
- Size: 192x192 pixels
- Background: Blue gradient with rounded corners
- Content: White "C" letter centered
- Safe zone: Keep important content in center 40%
- Format: PNG with transparency

#### logo-512.png
- Size: 512x512 pixels
- Background: Blue gradient (#3b82f6 to #2563eb)
- Content: White "C" letter centered
- Format: PNG with transparency

#### logo-512-maskable.png
- Size: 512x512 pixels
- Background: Blue gradient with rounded corners
- Content: White "C" letter centered
- Safe zone: Keep important content in center 40%
- Format: PNG with transparency

#### screenshot-1.png
- Size: 540x720 pixels
- Content: App interface preview
- Format: PNG

### Option 3: Use Online Tools

1. **Favicon Generator**: https://www.favicon-generator.org/
2. **PWA Icon Generator**: https://www.pwabuilder.com/
3. **App Icon Generator**: https://www.appicon.co/

## Icon Color Scheme

- **Primary Color**: #3b82f6 (Blue)
- **Secondary Color**: #2563eb (Dark Blue)
- **Text Color**: White (#ffffff)
- **Background**: White (#ffffff)

## Maskable Icons

Maskable icons are used on devices that apply masks to app icons (like Android). The safe zone is the center 40% of the icon.

Example safe zone for 192x192:
- Safe area: 76x76 pixels centered
- Margin: 58 pixels on all sides

## File Locations

All icon files should be placed in:
```
frontend/public/
├── logo-192.png
├── logo-192-maskable.png
├── logo-512.png
├── logo-512-maskable.png
└── screenshot-1.png
```

## Verification

After creating icons, verify they're accessible:

```bash
# Check if files exist
ls -la frontend/public/logo-*.png

# Test in browser
# Open: https://calora.gignite.uz/logo-192.png
# Should display the icon image
```

## Testing PWA Installation

1. **Chrome/Edge:**
   - Open DevTools (F12)
   - Go to Application → Manifest
   - Should show all icons
   - Look for "Install" button

2. **Safari (iOS):**
   - Open app in Safari
   - Tap Share → "Add to Home Screen"
   - Icon should appear on home screen

3. **Firefox:**
   - Menu → More Tools → Create Shortcut
   - Icon should appear

## Troubleshooting

### Icons Not Showing

1. **Check manifest.json:**
   ```bash
   curl https://calora.gignite.uz/manifest.json | jq '.icons'
   ```

2. **Check icon files exist:**
   ```bash
   curl -I https://calora.gignite.uz/logo-192.png
   # Should return 200 OK
   ```

3. **Clear browser cache:**
   - Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear all cache
   - Refresh page

4. **Check DevTools:**
   - Open DevTools (F12)
   - Go to Application → Manifest
   - Look for red errors
   - Check Network tab for 404 errors

### Icon Quality Issues

- Ensure PNG files are properly optimized
- Use tools like ImageOptim or TinyPNG
- Check icon dimensions match manifest sizes
- Verify colors are correct (use color picker)

## Next Steps

1. Generate or create the icon files
2. Place them in `frontend/public/`
3. Test PWA installation on multiple browsers
4. Deploy to production
5. Monitor installation metrics

## Resources

- [MDN: Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Web.dev: Maskable Icons](https://web.dev/maskable-icon/)
- [PWA Builder Icon Generator](https://www.pwabuilder.com/imageGenerator)
