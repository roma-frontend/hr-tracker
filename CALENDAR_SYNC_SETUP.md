# Calendar Sync Setup Guide

This guide will help you set up Google Calendar and Outlook Calendar synchronization.

## Prerequisites

- Admin access to your application
- Google Cloud Platform account (for Google Calendar)
- Microsoft Azure account (for Outlook Calendar)

---

## Google Calendar Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/calendar/google/auth
   https://your-production-domain.com/api/calendar/google/auth
   ```
5. Click "Create" and save your credentials

### 3. Add to Environment Variables

Add these to your `.env.local` file:

```env
# Google Calendar OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Outlook Calendar Setup

### 1. Register Azure AD Application

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Fill in:
   - **Name**: Office Leave Calendar Sync
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: 
     - Type: Web
     - URI: `http://localhost:3000/api/calendar/outlook/auth`

### 2. Configure API Permissions

1. Go to your app > "API permissions"
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Select "Delegated permissions"
5. Add these permissions:
   - `Calendars.ReadWrite`
   - `offline_access`
6. Click "Grant admin consent"

### 3. Create Client Secret

1. Go to "Certificates & secrets"
2. Click "New client secret"
3. Add a description and set expiration
4. Copy the **Value** (not the Secret ID)

### 4. Add to Environment Variables

Add these to your `.env.local` file:

```env
# Microsoft Outlook OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
```

---

## Complete .env.local Example

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google Calendar OAuth
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com

# Microsoft Outlook OAuth
MICROSOFT_CLIENT_ID=12345678-1234-1234-1234-123456789abc
MICROSOFT_CLIENT_SECRET=your~secret.here-123
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=12345678-1234-1234-1234-123456789abc

# Existing variables (Convex, Groq, etc.)
# ... keep your existing variables
```

---

## Testing the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to Dashboard**:
   - Log in as an admin
   - Scroll to "Admin Tools" section
   - Find "Calendar Sync" widget

3. **Connect Google Calendar**:
   - Click "Connect Google Calendar"
   - Sign in with your Google account
   - Grant permissions
   - You'll be redirected back with a success message

4. **Connect Outlook**:
   - Click "Connect Outlook"
   - Sign in with your Microsoft account
   - Grant permissions
   - You'll be redirected back with a success message

5. **Sync Events**:
   - Once connected, click the same buttons to sync
   - All approved leave requests will be added to your calendar

---

## Production Deployment

### Update Redirect URIs

When deploying to production, update the redirect URIs in both:

**Google Cloud Console**:
```
https://your-domain.com/api/calendar/google/auth
```

**Azure Portal**:
```
https://your-domain.com/api/calendar/outlook/auth
```

### Environment Variables

Update `NEXT_PUBLIC_APP_URL` to your production domain:
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Security Notes

1. **Never commit `.env.local`** to version control
2. **Use HTTPS** in production
3. **Rotate secrets** regularly
4. **Limit OAuth scopes** to only what's needed
5. **Store tokens securely** (currently using HTTP-only cookies)

---

## Troubleshooting

### "Google Calendar is not configured" error
- Check that `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` are set
- Verify the client ID is correct

### "Outlook Calendar is not configured" error
- Check that `MICROSOFT_CLIENT_ID` and `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` are set
- Verify the client ID is correct

### OAuth redirect fails
- Verify redirect URIs match exactly in Google/Azure console
- Check that `NEXT_PUBLIC_APP_URL` is correct
- Ensure no trailing slashes in URLs

### Sync fails after connection
- Check access token is still valid (tokens expire after 1 hour)
- Try disconnecting and reconnecting
- Check browser console for detailed errors

---

## Features

✅ **Download iCal** - Export to .ics file for any calendar app  
✅ **Google Calendar Sync** - Two-way OAuth authentication  
✅ **Outlook Calendar Sync** - Two-way OAuth authentication  
✅ **Auto-color coding** - Different colors for leave types  
✅ **Secure tokens** - HTTP-only cookies with expiration  
✅ **Connection status** - Visual indicators for connected calendars  

---

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure APIs are enabled in Google Cloud / Azure
4. Check redirect URIs match exactly
5. Review server logs for detailed error messages
