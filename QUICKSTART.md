# Quick Start Guide

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Getting TextNow Credentials

Before you can use the app, you need to get your TextNow API credentials:

1. Go to [https://www.textnow.com](https://www.textnow.com) and log in
2. Open your browser's Developer Tools (F12 or Right-click → Inspect)
3. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Expand **Cookies** → `https://www.textnow.com`
5. Find and copy these values:
   - `connect.sid` - Your session ID cookie
   - `_csrf` - Your CSRF token cookie
6. Also note your TextNow username (the one you use to log in)

## First Time Setup

1. Click **Create Account** on the home page
2. Fill in:
   - Username (for this app)
   - Password (for this app)
   - TextNow Username
   - Connect.sid Cookie
   - CSRF Cookie
3. Click **Create Account**

## Features

- ✅ Send SMS messages
- ✅ Send MMS (images/videos)
- ✅ Send voice messages
- ✅ View conversation history
- ✅ Real-time message updates
- ✅ Mobile-responsive design
- ✅ Dark theme with electric blue accents

## Troubleshooting

### API Errors
If you get API errors:
- Make sure your cookies are still valid (they expire after some time)
- Re-login to TextNow and get fresh cookies
- Check that your TextNow username is correct

### Build Errors
If you encounter build errors:
- Make sure all dependencies are installed: `npm install`
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## Notes

- Credentials are stored in browser localStorage (for demo purposes)
- In production, use proper authentication and encryption
- Cookies expire - you may need to refresh them periodically


