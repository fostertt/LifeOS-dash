# Fix Google OAuth "invalid_client" Error

## Current Error

```
[next-auth][error][OAUTH_CALLBACK_ERROR]
invalid_client (Unauthorized)
```

This means Google is rejecting your OAuth request. The most common cause is incorrect redirect URI configuration.

## Solution: Fix Google Cloud Console Settings

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID (the one with ID: `190986435595-h4qnpqq4n9vk0dtu0l71s9ojbup6enot`)
3. Click on it to edit

### Step 2: Add Authorized Redirect URIs

In the "Authorized redirect URIs" section, make sure you have **EXACTLY** these URIs:

```
http://localhost:3000/api/auth/callback/google
http://127.0.0.1:3000/api/auth/callback/google
```

⚠️ **IMPORTANT**:
- Must be EXACT match (including `/api/auth/callback/google`)
- Must use `http://` (not `https://`) for localhost
- Must include port `:3000`
- No trailing slashes

### Step 3: Set Authorized JavaScript Origins

Add these origins:

```
http://localhost:3000
http://127.0.0.1:3000
```

### Step 4: Save Changes

Click **SAVE** at the bottom of the page.

⚠️ **Wait 5 minutes** - Google OAuth changes can take a few minutes to propagate.

### Step 5: Test Again

After waiting 5 minutes:

```bash
# Restart your dev server
npm run dev
```

Then try signing in with Google again.

## Still Getting Errors?

### Check Your .env File

Make sure your `.env` file has the correct credentials:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-secret-here>
```

### Verify OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Make sure the OAuth consent screen is configured
3. Your email should be listed as a test user (for "Testing" publish status)
4. If status is "Testing", add your Google account email to the test users list

### Check Enabled APIs

Make sure these APIs are enabled:
1. Go to: https://console.cloud.google.com/apis/library
2. Search for "Google+ API" or "People API"
3. Make sure it's enabled

## Expected Success Flow

When it works, you should see:

```
[next-auth][debug][GET_AUTHORIZATION_URL] { url: 'https://accounts.google.com/...' }
[next-auth][debug][CALLBACK_OAUTH] ...
[next-auth][debug][CREATE_USER] { ... }
[next-auth][debug][CREATE_SESSION] { ... }
GET /api/auth/callback/google 302
GET / 200
```

## Network Issues (ETIMEDOUT)

If you see `ETIMEDOUT` errors, this could be:
1. Firewall blocking requests to Google
2. VPN interfering with OAuth
3. Network connectivity issues

Try:
- Disable VPN temporarily
- Check firewall settings
- Try from a different network

## Quick Checklist

- [ ] Redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- [ ] JavaScript origin is: `http://localhost:3000`
- [ ] OAuth consent screen is configured
- [ ] Your email is added as a test user
- [ ] Waited 5+ minutes after saving changes
- [ ] Restarted dev server
- [ ] .env file has correct credentials
- [ ] No VPN or firewall blocking Google APIs
