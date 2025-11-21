# Email Configuration Guide - Resend

This guide explains how to configure email services for AccessLearn Inclusiv using **Resend**, a modern email API service.

## Table of Contents

1. [Overview](#overview)
2. [Why Resend?](#why-resend)
3. [Quick Setup](#quick-setup)
4. [Configuration](#configuration)
5. [Testing Email Sending](#testing-email-sending)
6. [Email Templates](#email-templates)
7. [Troubleshooting](#troubleshooting)
8. [Dashboard & Monitoring](#dashboard--monitoring)

## Overview

AccessLearn Inclusiv uses Resend to send:
- **Invitation emails** when admins invite new users
- **Verification emails** for email confirmation (future)
- **Welcome emails** after account activation

**Resend Advantages:**
- ✅ **3,000 free emails per month** (vs 100 with SendGrid)
- ✅ **Modern, simple API** - easier to integrate
- ✅ **Fast domain verification** - minutes, not hours
- ✅ **Excellent deliverability** - professional email infrastructure
- ✅ **kainet.mx domain already verified** for this project

## Why Resend?

| Feature | Resend | SendGrid |
|---------|--------|----------|
| **Free Tier** | 3,000 emails/month | 100 emails/day |
| **Setup Time** | 5-10 minutes | 1-2 hours |
| **API Complexity** | Simple, modern | More complex |
| **Domain Verification** | Quick DNS records | Multiple DNS records |
| **Dashboard** | Clean, intuitive | Feature-rich but complex |

For this project, **Resend is already configured** with the kainet.mx domain verified and ready to use.

## Quick Setup

### 1. Get Your API Key

Your Resend API key is already configured:
```
RESEND_API_KEY=re_E8vrV4gy_5Qja2b86Q6K3p8kXuaj98V5K
```

To get a new API key or manage existing ones:
1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give it a name (e.g., "AccessLearn Production")
4. Select permissions (usually "Sending access")
5. Copy the key (starts with `re_`)

⚠️ **Important:** Save the API key immediately - you won't be able to see it again!

### 2. Configure Environment Variables

Add to your `backend/.env` file:

```bash
# Resend Email Service
RESEND_API_KEY=re_E8vrV4gy_5Qja2b86Q6K3p8kXuaj98V5K
EMAIL_FROM=newsletter@kainet.mx
FROM_NAME=AccessLearn Inclusiv

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

For **production**, update:
```bash
FRONTEND_URL=https://app.kainet.mx
```

### 3. Verify Domain (Already Done)

The kainet.mx domain is already verified in Resend. If you need to verify a new domain:

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `kainet.mx`)
4. Add the DNS records provided by Resend:
   - **SPF record** (TXT)
   - **DKIM record** (TXT)
   - **DMARC record** (TXT) - optional but recommended

DNS propagation typically takes 5-30 minutes.

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Your Resend API key | `re_E8vrV4gy_5Qja2b86Q6K3p8kXuaj98V5K` |
| `EMAIL_FROM` | Sender email address | `newsletter@kainet.mx` |
| `FROM_NAME` | Sender name | `AccessLearn Inclusiv` |
| `FRONTEND_URL` | Frontend URL for email links | `https://app.kainet.mx` |

### From Email Options

You have multiple verified emails on kainet.mx:
- **newsletter@kainet.mx** - For system emails (invitations, notifications) ✅ Recommended
- **contacto@kainet.mx** - For support/contact emails
- **marcdomi@kainet.mx** - Personal email

**Current configuration uses:** `newsletter@kainet.mx`

## Testing Email Sending

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🔧 Email service configured with Resend
   From: AccessLearn Inclusiv <newsletter@kainet.mx>
```

### 2. Test Invitation Email

1. Open frontend: `http://localhost:5173`
2. Login as admin:
   - Email: `dra.amayrani@hospital-ejemplo.com`
   - Password: `Demo2024!`
3. Navigate to **Admin Panel → Users**
4. Click **"Invitar Usuario"**
5. Fill in the form:
   - First name: Test
   - Last name: User
   - Email: your-real-email@gmail.com
   - Role: student
   - Organization: Hospital de Ejemplo
6. Click **"Enviar Invitación"**

### 3. Check Email Delivery

**In backend logs:**
```
✅ Invitation email sent to your-real-email@gmail.com
```

**In your email inbox:**
- Check inbox (and spam folder)
- Email should arrive within 1-2 minutes
- Subject: "Invitación a Hospital de Ejemplo - AccessLearn Inclusiv"

### 4. Test Invitation Flow

1. Click the invitation link in the email
2. You should be redirected to: `http://localhost:5173/accept-invitation?token=...`
3. Set your password
4. Click "Activar Cuenta"
5. Check for welcome email

**Welcome email:**
- Subject: "¡Bienvenido a Hospital de Ejemplo! 🎉"
- Contains login link and platform features

## Email Templates

### Invitation Email
- **Color:** Purple gradient (`#8b5cf6` → `#6d28d9`)
- **Expiration:** 7 days
- **Content:** Role assignment, organization info, accept button
- **Call to action:** "Aceptar Invitación"

### Welcome Email
- **Color:** Orange gradient (`#f59e0b` → `#d97706`)
- **Content:** Platform features, getting started guide
- **Call to action:** "Iniciar Sesión"

### Verification Email (Future)
- **Color:** Green gradient (`#10b981` → `#059669`)
- **Expiration:** 24 hours
- **Content:** Email verification link
- **Call to action:** "Verificar Email"

All templates include:
- ✅ **Responsive design** - Works on mobile and desktop
- ✅ **Plain text fallback** - For email clients without HTML support
- ✅ **Accessibility** - Proper semantic HTML
- ✅ **Branding** - kainet.mx powered footer

## Troubleshooting

### Email Not Sending

**Check backend logs:**
```bash
# Should see:
✅ Invitation email sent to user@example.com

# If error:
❌ Error sending invitation email: [error details]
```

**Common issues:**

1. **API Key Invalid**
   ```
   Error: Invalid API key
   ```
   **Solution:** Check `RESEND_API_KEY` in `.env` file

2. **Email Address Not Verified**
   ```
   Error: Email address not verified
   ```
   **Solution:** Verify domain in Resend dashboard or use verified email

3. **Rate Limit Exceeded**
   ```
   Error: Rate limit exceeded
   ```
   **Solution:** Resend free tier = 3,000 emails/month. Check usage in dashboard.

4. **Service Not Configured**
   ```
   ⚠️ Email service not configured. Skipping email.
   ```
   **Solution:** Add `RESEND_API_KEY` to `.env` file and restart backend

### Email Goes to Spam

**Solutions:**

1. **Verify Domain Records**
   - Check SPF, DKIM, DMARC records in DNS
   - Use [MXToolbox](https://mxtoolbox.com/) to verify

2. **Avoid Spam Triggers**
   - Don't use ALL CAPS in subject
   - Avoid excessive exclamation marks!!!
   - Include plain text version (already done)
   - Use proper sender name (already done)

3. **Warm Up Domain**
   - Start with low volume (10-50 emails/day)
   - Gradually increase over 2-3 weeks
   - Monitor bounce rates in Resend dashboard

### Email Not Arriving

**Check in order:**

1. **Backend logs** - Was email sent?
2. **Spam folder** - Check recipient's spam
3. **Email address** - Typo in recipient email?
4. **Resend dashboard** - Check delivery status
5. **DNS records** - Verify domain configuration

## Dashboard & Monitoring

### Resend Dashboard

Access at: [resend.com/emails](https://resend.com/emails)

**What you can see:**
- 📊 **Email analytics** - Sent, delivered, opened, clicked
- 📧 **Recent emails** - Last 100 emails sent
- ⚠️ **Errors** - Failed deliveries and reasons
- 📈 **Usage** - Monthly quota (3,000 free emails)
- 🔑 **API keys** - Manage keys
- 🌐 **Domains** - Domain verification status

**Useful metrics:**
- **Delivery rate** - Should be >95%
- **Open rate** - Typical: 20-30% for transactional emails
- **Bounce rate** - Should be <5%

### Email Logs

In your backend logs:
```
✅ Invitation email sent to user@example.com
✅ Welcome email sent to user@example.com
✅ Verification email sent to user@example.com
```

With errors:
```
❌ Error sending invitation email: Invalid recipient
```

### Monitoring Best Practices

1. **Check daily** - Monitor delivery rates
2. **Review bounces** - Remove invalid email addresses
3. **Track quota** - Don't exceed 3,000/month on free tier
4. **Test regularly** - Send test emails before important campaigns

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Node.js SDK](https://github.com/resendlabs/resend-node)
- [Email Best Practices](https://resend.com/docs/knowledge-base/email-best-practices)
- [Domain Verification Guide](https://resend.com/docs/dashboard/domains/introduction)

## Need Help?

1. **Resend Support:** [resend.com/support](https://resend.com/support)
2. **Community:** [resend.com/community](https://resend.com/community)
3. **Status Page:** [status.resend.com](https://status.resend.com)

---

**✅ kainet.mx domain is verified and ready to use!**

Current configuration:
- API Key: Configured ✅
- Domain: kainet.mx (verified) ✅
- From Email: newsletter@kainet.mx ✅
- Monthly Limit: 3,000 emails ✅
