# MJ Sales Dashboard Email Setup Guide
## Using mjsalesdash.com Domain

---

## 🎯 Goal

Set up professional emails from **mjsalesdash.com** using Resend.

**Your emails will look like:**
```
From: MJ Cargo <noreply@mjsalesdash.com>
From: MJ Cargo Sales <quotes@mjsalesdash.com>
From: MJ Cargo Support <support@mjsalesdash.com>
```

**When customers reply, they'll email:**
- Your actual Gmail: kencestero@gmail.com
- Or company Gmail: mjcargotrailers@gmail.com

---

## 📋 Complete Setup Checklist

### Step 1: Sign Up for Resend (5 minutes)

1. **Go to Resend**: https://resend.com/signup
2. **Sign up with your email**: kencestero@gmail.com (or mjcargotrailers@gmail.com)
3. **Verify your email**: Check inbox for verification link
4. **Complete onboarding**: Skip any optional steps

**Cost**: FREE (3,000 emails/month)

---

### Step 2: Add mjsalesdash.com Domain (2 minutes)

1. **In Resend Dashboard**: Click "Domains" in left sidebar
2. **Click "Add Domain"**
3. **Enter**: `mjsalesdash.com`
4. **Click "Add"**

Resend will now show you DNS records to add.

---

### Step 3: Add DNS Records to Your Domain (10 minutes)

**You'll see 3 types of records in Resend:**

#### Record 1: SPF (TXT Record)
```
Type: TXT
Name: @
Value: v=spf1 include:resend.net ~all
```

#### Record 2: DKIM (TXT Record)
```
Type: TXT
Name: resend._domainkey
Value: [Long string provided by Resend - copy exactly]
```

#### Record 3: DMARC (TXT Record) - Optional but Recommended
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:kencestero@gmail.com
```

---

### Step 4: Where to Add These Records

**Question: Where is mjsalesdash.com registered?**

Common registrars:
- **Vercel**: Dashboard → Domains → DNS Records
- **GoDaddy**: DNS Management → Add Record
- **Namecheap**: Advanced DNS → Add New Record
- **Cloudflare**: DNS → Add Record

#### If Domain is on Vercel:

1. Go to: https://vercel.com/dashboard
2. Click: "Domains" (left sidebar)
3. Find: mjsalesdash.com
4. Click: "Manage" or "DNS"
5. Add each record (SPF, DKIM, DMARC)

#### If Domain is on Another Registrar:

1. Login to your domain registrar
2. Find DNS settings (usually called "DNS Management" or "Advanced DNS")
3. Add each record one by one
4. **Important**: Don't delete existing records, just add new ones

---

### Step 5: Verify Domain in Resend (1 minute)

1. **Back in Resend**: After adding DNS records
2. **Wait 5-10 minutes** (DNS propagation)
3. **Click "Verify DNS Records"** button
4. **Status should show**:
   - ✅ SPF: Verified
   - ✅ DKIM: Verified
   - ✅ DMARC: Verified (optional)

**If not verified**:
- Wait 30 more minutes
- Try "Verify" button again
- DNS can take up to 24 hours (usually much faster)

---

### Step 6: Get Your API Key (1 minute)

1. **In Resend Dashboard**: Click "API Keys" in left sidebar
2. **Click "Create API Key"**
3. **Name**: `MJ Sales Dashboard Production`
4. **Permission**: Full Access
5. **Click "Create"**
6. **Copy the key**: It starts with `re_` (looks like: `re_123abc456def...`)

⚠️ **IMPORTANT**: Save this key somewhere safe! You can only see it once.

---

### Step 7: Install Resend Package (1 minute)

Open terminal in your project folder:

```bash
pnpm add resend
```

This adds Resend to your project.

---

### Step 8: Add Environment Variables to Vercel (3 minutes)

Open terminal:

```bash
# Add Resend API Key
vercel env add RESEND_API_KEY
# When prompted, paste: re_your_actual_key_here
# Select: Production, Preview, Development (press space to select all)

# Add From Email
vercel env add RESEND_FROM_EMAIL
# When prompted, type: MJ Cargo <noreply@mjsalesdash.com>
# Select: Production, Preview, Development
```

---

### Step 9: Deploy to Production (2 minutes)

```bash
# Commit package.json changes
git add package.json pnpm-lock.yaml
git commit -m "feat: add Resend package for email sending"
git push

# Deploy to Vercel (will auto-deploy via GitHub)
# Or manually:
vercel deploy --prod
```

Wait 2-3 minutes for deployment to complete.

---

### Step 10: Test Email System (5 minutes)

1. **Go to**: https://salesdash-ts.vercel.app/en/email-center
2. **Login** with your account
3. **Click**: "Send Test Email" button
4. **Check your inbox**: Should receive test email from noreply@mjsalesdash.com

**If email arrives**: ✅ SUCCESS! Everything is working!

**If no email**:
- Check spam folder
- Wait 5 minutes
- Try again
- Check Resend dashboard logs

---

### Step 11: Test Owner Code Request (FINAL TEST)

1. **Go to**: https://salesdash-ts.vercel.app/en/secret-code-instructions
2. **Scroll down** to Owner/Admin Code section (red box)
3. **Click**: "Request Owner Code via Email" button
4. **Confirm** security dialog
5. **Check emails**:
   - kencestero@gmail.com
   - mjcargotrailers@gmail.com
6. **Both should receive**: Owner code email with today's code

**If both emails arrive**: 🎉 COMPLETE SUCCESS!

---

## 📧 Recommended Email Addresses

### System Emails (Generic, Professional)

```
noreply@mjsalesdash.com     → System notifications, no replies expected
quotes@mjsalesdash.com      → Quote emails (replies go to rep's Gmail)
support@mjsalesdash.com     → Support emails
team@mjsalesdash.com        → General team emails
admin@mjsalesdash.com       → Admin notifications
```

### Individual Rep Emails (Optional, Advanced)

If you want each rep to have their own @mjsalesdash.com email:

```
kencestero@mjsalesdash.com
john.smith@mjsalesdash.com
sarah.jones@mjsalesdash.com
```

**Note**: This requires Google Workspace or Microsoft 365 to create actual mailboxes. For now, using generic emails with reply-to is easier and cheaper!

---

## 🎨 How Our Email System Works

### Quote Email Example:

**Customer Receives:**
```
From: MJ Cargo <quotes@mjsalesdash.com>
Reply-To: kencestero@gmail.com
Subject: Your MJ Cargo Quote: 7x16 TA Enclosed

Hi Jane Smith!

Thank you for your interest in MJ Cargo Trailers!

[Beautiful orange-branded email with quote details]

[View My Quote] button
```

**When Customer Clicks Reply:**
- Email goes to: kencestero@gmail.com (your actual Gmail!)
- Customer never sees Gmail address in original email
- Professional appearance with mjsalesdash.com domain

---

## 💰 Cost Breakdown

### Resend Pricing for Your Use:

**Scenario 1: Low Activity (10 emails/day per rep)**
- 100 reps × 10 emails × 30 days = 30,000 emails/month
- **Cost**: $20/month (Pro Plan)

**Scenario 2: Medium Activity (20 emails/day per rep)**
- 100 reps × 20 emails × 30 days = 60,000 emails/month
- **Cost**: $90/month (Scale Plan)

**Free Tier**: 3,000 emails/month (good for testing)

---

## ⚙️ Configuration Summary

After setup, your `.env` will have:

```bash
RESEND_API_KEY=re_your_actual_key_here
RESEND_FROM_EMAIL="MJ Cargo <noreply@mjsalesdash.com>"
```

Or you can use different addresses for different email types:

```bash
RESEND_FROM_EMAIL="MJ Cargo <noreply@mjsalesdash.com>"
RESEND_QUOTE_EMAIL="MJ Cargo Sales <quotes@mjsalesdash.com>"
RESEND_SUPPORT_EMAIL="MJ Cargo Support <support@mjsalesdash.com>"
```

---

## 🔍 Troubleshooting

### DNS Records Not Verifying

**Issue**: Resend shows "Pending" or "Failed" after 30 minutes

**Solutions**:
1. Double-check you added records exactly as shown (copy/paste)
2. Make sure Type is "TXT" (not CNAME or A)
3. For SPF, Name should be `@` (not blank, not domain name)
4. For DKIM, Name should be `resend._domainkey` exactly
5. Wait 24 hours (DNS can be slow)
6. Contact your domain registrar support

### Emails Going to Spam

**Solutions**:
1. Make sure domain is verified (all 3 records green)
2. Add DMARC record if you haven't
3. Send test to yourself first, mark as "Not Spam"
4. Avoid spam trigger words in subject lines
5. Ask customers to add noreply@mjsalesdash.com to contacts

### No Email Received

**Solutions**:
1. Check spam/junk folder
2. Check Resend dashboard → Emails → See delivery status
3. Make sure API key is added to Vercel correctly
4. Redeploy: `vercel deploy --prod`
5. Check browser console for errors at `/email-center`

### Wrong "From" Name or Email

**Update in Vercel**:
```bash
vercel env rm RESEND_FROM_EMAIL
vercel env add RESEND_FROM_EMAIL
# Enter new value: "Your Name <email@mjsalesdash.com>"
vercel deploy --prod
```

---

## 📞 Support Resources

- **Resend Docs**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **DNS Help**: Contact your domain registrar (Vercel, GoDaddy, etc.)
- **Dashboard Issues**: Check browser console (F12)

---

## ✅ Final Checklist

Before considering setup complete, verify:

- [ ] Resend account created
- [ ] mjsalesdash.com domain added to Resend
- [ ] DNS records added (SPF, DKIM, DMARC)
- [ ] Domain verified in Resend (all green checkmarks)
- [ ] API key created and copied
- [ ] `resend` package installed (`pnpm add resend`)
- [ ] Environment variables added to Vercel
- [ ] Deployed to production
- [ ] Test email received successfully
- [ ] Owner code request email received at both addresses
- [ ] Emails not in spam folder
- [ ] Reply-to works correctly

---

## 🎉 Success!

Once all steps are complete:

✅ **Emails will send from**: noreply@mjsalesdash.com
✅ **Replies will go to**: Your Gmail (kencestero@gmail.com)
✅ **Professional appearance**: MJ Cargo branding
✅ **100+ salespeople can send**: All from same account
✅ **Cost**: $0-90/month depending on usage
✅ **Owner code security**: Sent via email only

**Your sales team is now ready to send professional branded emails! 🚀**

---

**Setup Time**: ~30 minutes total
**Monthly Cost**: $0 (free) to $90 (high volume)
**Professional Look**: ✅ Verified domain
**Security**: ✅ Owner codes via email
**Ready to Scale**: ✅ 100+ users supported

Need help? Contact Resend support or check the troubleshooting section above.
