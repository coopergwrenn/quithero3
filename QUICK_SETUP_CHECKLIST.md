# ✅ Quick Setup Checklist for Password Reset

## 🚀 IMMEDIATE ACTIONS (5 minutes)

### 1. Open Supabase Dashboard
Go to: https://app.supabase.com/project/saoheivherzwysrhglbq

### 2. Configure Redirect URLs ⚡ CRITICAL
**Navigation:** Authentication → URL Configuration → Redirect URLs

**Add these URLs (copy-paste exactly):**
```
https://tryquithero.com/reset-password
exp://localhost:19000/--/(auth)/reset-password
http://localhost:3000/reset-password
tryquithero://reset-password
```

### 3. Set Site URL ⚡ CRITICAL
**Navigation:** Authentication → Settings → General → Site URL

**Set to:**
```
https://tryquithero.com
```

### 4. Test Configuration
Run this command in your terminal:
```bash
npm run test:password-reset your-email@example.com
```

---

## 🎯 OPTIONAL IMPROVEMENTS (10 minutes)

### 5. Custom Email Template
**Navigation:** Authentication → Email Templates → Reset Password

**Replace with:** (see `SUPABASE_PASSWORD_RESET_SETUP.md` for full template)

### 6. SMTP Configuration (Prevents Spam)
**Navigation:** Authentication → Settings → SMTP Settings

**Quick Option - SendGrid:**
1. Sign up: https://sendgrid.com (free)
2. Get API key
3. Configure:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - User: `apikey`
   - Pass: `[YOUR_API_KEY]`

---

## 🧪 TESTING

### Test 1: Basic Functionality
```bash
# Replace with your email
npm run test:password-reset your-email@example.com
```

### Test 2: Full Flow
1. Go to your app's sign-in page
2. Click "Forgot Password"
3. Enter email → Submit
4. Check email inbox (and spam)
5. Click reset link
6. Should redirect to reset password page
7. Enter new password → Submit
8. Should redirect to sign-in page

---

## 🔧 TROUBLESHOOTING

### "Email not received"
- ✅ Check spam folder
- ✅ Verify SMTP is configured
- ✅ Check Supabase logs: Dashboard → Logs

### "Invalid reset link"
- ✅ Verify redirect URLs are exactly correct
- ✅ Check Site URL matches your domain
- ✅ Make sure email template uses `{{ .RedirectTo }}`

### "Redirect not working"
- ✅ All redirect URLs added to Supabase?
- ✅ App handles auth callback correctly?
- ✅ Check browser console for errors

---

## ✅ SUCCESS CRITERIA

- [ ] Test email sends successfully
- [ ] Email arrives in inbox (not spam)
- [ ] Reset link redirects to your app
- [ ] Password update works
- [ ] Redirect to sign-in after success

---

## 🆘 NEED HELP?

1. **Check the logs:** Supabase Dashboard → Logs
2. **Run diagnostics:** `npm run test:password-reset your-email@example.com`
3. **Review setup:** See `SUPABASE_PASSWORD_RESET_SETUP.md` for detailed guide

**Estimated setup time:** 5-15 minutes
**Priority:** Complete steps 1-4 first, then optimize with 5-6
