# Supabase Email Configuration to Prevent Spam

## 🚨 IMMEDIATE ACTIONS NEEDED:

### 1. Configure Custom Email Templates in Supabase Dashboard

Go to your Supabase Dashboard → Authentication → Email Templates:

**Reset Password Template:**
```html
<h2>Reset Your QuitHero Password</h2>
<p>Hi there,</p>
<p>You requested to reset your password for your QuitHero account.</p>
<p>Click the button below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #7C3AED; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Reset Password</a></p>
<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 24 hours.</p>
<p>If you didn't request this password reset, you can safely ignore this email.</p>
<br>
<p>Best regards,<br>The QuitHero Team</p>
<hr>
<p style="font-size: 12px; color: #666;">This email was sent from QuitHero, your personalized quit plan app.</p>
```

### 2. Update Email Settings in Supabase

**Sender Details:**
- From Name: `QuitHero`
- From Email: `noreply@quithero.app` (or your domain)
- Reply To: `support@quithero.app`

### 3. Domain Configuration (CRITICAL for avoiding spam)

**You need to:**
1. **Buy a domain** (quithero.app) if you don't have one
2. **Set up SPF record** in DNS:
   ```
   v=spf1 include:_spf.supabase.co ~all
   ```
3. **Set up DKIM** (Supabase will provide the keys)
4. **Configure custom SMTP** (optional but recommended)

### 4. Alternative: Use Custom SMTP Provider

**Recommended providers that don't go to spam:**
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 1000 emails/month) 
- **AWS SES** (very cheap, reliable)

**Configure in Supabase Dashboard → Settings → Auth:**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [YOUR_SENDGRID_API_KEY]
```

## 🔧 TEMPORARY FIX (Until Domain Setup):

Update the password reset to use a more reliable redirect URL and better messaging.
