# 🔧 Supabase Password Reset Configuration Guide

## 🚨 CRITICAL SETUP REQUIRED

Your password reset functionality is coded correctly, but requires specific Supabase Dashboard configuration to work properly.

## Step 1: Configure Redirect URLs

### 🌐 **Go to Supabase Dashboard → Authentication → URL Configuration**

**Add these URLs to "Redirect URLs":**
```
https://tryquithero.com/reset-password
tryquithero://reset-password
http://localhost:3000/reset-password
exp://localhost:19000/--/(auth)/reset-password
```

### Why each URL is needed:
- `https://tryquithero.com/reset-password` - Production web app
- `tryquithero://reset-password` - Mobile app deep link  
- `http://localhost:3000/reset-password` - Local web development
- `exp://localhost:19000/--/(auth)/reset-password` - Expo development

## Step 2: Set Site URL

### 🏠 **Go to Authentication → Settings**

**Set Site URL to:**
```
https://tryquithero.com
```

For development, you can temporarily use:
```
http://localhost:3000
```

## Step 3: Configure Email Templates

### 📧 **Go to Authentication → Email Templates → Reset Password**

**Replace the default template with:**

```html
<h2>Reset Your QuitHero Password</h2>
<p>Hi there,</p>
<p>You requested to reset your password for your QuitHero account.</p>
<p>Click the button below to reset your password:</p>
<p><a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery" style="display: inline-block; padding: 12px 24px; background-color: #7C3AED; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Reset Password</a></p>
<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p>{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery</p>
<p>This link will expire in 24 hours.</p>
<p>If you didn't request this password reset, you can safely ignore this email.</p>
<br>
<p>Best regards,<br>The QuitHero Team</p>
<hr>
<p style="font-size: 12px; color: #666;">This email was sent from QuitHero, your personalized quit plan app.</p>
```

## Step 4: SMTP Configuration (Recommended)

### 📨 **Go to Authentication → Settings → SMTP Settings**

**Option A: Use SendGrid (Recommended)**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [YOUR_SENDGRID_API_KEY]
Sender Name: QuitHero
Sender Email: noreply@quithero.app
```

**Option B: Use Mailgun**
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: [YOUR_MAILGUN_USERNAME]
SMTP Pass: [YOUR_MAILGUN_PASSWORD]
Sender Name: QuitHero
Sender Email: noreply@quithero.app
```

### Get SendGrid API Key:
1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Go to Settings → API Keys
3. Create API Key with "Mail Send" permissions
4. Copy the API key to SMTP Pass field

## Step 5: Domain Setup (Optional but Recommended)

### 🌍 **For Production Email Delivery**

1. **Buy domain**: `quithero.app` (if you don't have it)
2. **Add SPF record** to DNS:
   ```
   v=spf1 include:sendgrid.net ~all
   ```
3. **Add DKIM records** (SendGrid will provide these)

## Step 6: Test the Configuration

### ✅ **Testing Checklist**

1. **Request Password Reset**
   - Go to your sign-in page
   - Click "Forgot Password"
   - Enter email and submit

2. **Check Email**
   - Look in inbox (and spam folder)
   - Click the reset link

3. **Verify Redirect**
   - Should redirect to your reset password page
   - Should show the password reset form

4. **Update Password**
   - Enter new password
   - Submit form
   - Should redirect to sign-in page

## 🔍 Troubleshooting

### Email not received?
- Check spam folder
- Verify SMTP configuration
- Check Supabase logs in Dashboard → Logs

### Invalid reset link?
- Verify redirect URLs are exactly correct
- Check that Site URL is set properly
- Ensure email template uses correct placeholders

### Redirect not working?
- Verify all redirect URLs are added to Supabase
- Check that your app handles the auth flow correctly

## 📱 Mobile App Considerations

If you're building a mobile app, you'll also need to:

1. **Configure deep linking** in your app
2. **Handle the auth callback** in your mobile app
3. **Add mobile-specific redirect URLs** to Supabase

---

## 🚀 Quick Setup Commands

After configuring Supabase Dashboard, test with:

```bash
# Test email sending (replace with your email)
curl -X POST 'https://saoheivherzwysrhglbq.supabase.co/auth/v1/recover' \
-H 'Content-Type: application/json' \
-H 'apikey: YOUR_ANON_KEY' \
-d '{"email": "your-email@example.com"}'
```

---

**⚡ PRIORITY ORDER:**
1. ✅ Configure Redirect URLs (CRITICAL)
2. ✅ Set Site URL (CRITICAL) 
3. ✅ Update Email Template (IMPORTANT)
4. ⏳ Configure SMTP (RECOMMENDED)
5. ⏳ Domain Setup (OPTIONAL)
