# 🚨 Security Incident Response Plan

**For:** MJ Cargo Sales Dashboard
**Last Updated:** 2025-10-10
**Review:** Quarterly

---

## ⏰ Golden Rule: Work During Low-Traffic Hours!

**BEST TIMES for maintenance/rotations:**
- 🌙 **11pm - 2am** (Ideal - almost zero traffic)
- 🌅 **6am - 8am** (Good - before reps start)
- 📅 **Sundays 8am - 12pm** (Weekend hours)

**AVOID:**
- 🔴 **9am - 6pm weekdays** (Peak sales hours)
- 🔴 **Monday mornings** (Busiest day)
- 🔴 **End of month** (Deal closing rush)

---

## 📋 Secret Leak Response Checklist

### Phase 1: ASSESS (2 minutes)

- [ ] **Check the time**
  - Business hours (9am-6pm)? → Schedule for tonight
  - Off-hours? → Rotate immediately
  - Weekend? → Rotate now

- [ ] **Check active users**
  - Vercel Analytics → Real-time visitors
  - Less than 3 users? → Safe to rotate now
  - More than 5 users? → Wait for off-hours

- [ ] **Check what leaked**
  - DATABASE_URL? → CRITICAL (rotate ASAP)
  - AUTH_SECRET? → HIGH (rotate tonight)
  - API keys? → MEDIUM (schedule rotation)
  - Firebase public keys? → LOW (monitor only)

- [ ] **Check database logs** (if available)
  - Any suspicious connections?
  - Unusual query patterns?
  - Unknown IP addresses?

**Decision Matrix:**

```
┌─────────────────────┬──────────────────┬─────────────────────┐
│ Situation           │ Risk Level       │ Action              │
├─────────────────────┼──────────────────┼─────────────────────┤
│ Off-hours           │ Any              │ Rotate NOW          │
│ <3 active users     │ Any              │ Rotate NOW          │
│ Business hours      │ Critical + Sus   │ Rotate NOW          │
│ Business hours      │ Critical + Clean │ Schedule 11pm       │
│ Business hours      │ Medium/Low       │ Schedule this week  │
└─────────────────────┴──────────────────┴─────────────────────┘
```

---

### Phase 2: IMMEDIATE ACTIONS (If off-hours rotation)

**⏱️ Estimated Time: 15 minutes**

#### Step 1: Communicate (1 min)
```
Post in team Slack/Discord:
"🔧 Brief system maintenance - back in 10 minutes.
Any active work will be saved automatically."
```

#### Step 2: Rotate DATABASE_URL (5 min)

1. **Open Neon Dashboard**
   - Visit: https://console.neon.tech
   - Select your project

2. **Reset Password**
   - Settings → Database → Reset Password
   - Click "Generate new password"
   - **COPY the new DATABASE_URL immediately**

3. **Test new connection (IMPORTANT!)**
   ```bash
   # In terminal, test before deploying:
   DATABASE_URL="postgresql://..." npx prisma db push --preview-feature

   # Should say "Database is up to date" or similar
   # If error, DO NOT PROCEED - fix first!
   ```

#### Step 3: Update Vercel (3 min)

```bash
# Remove old
vercel env rm DATABASE_URL production

# Add new
vercel env add DATABASE_URL production
# Paste the NEW connection string

# Verify it was added
vercel env ls
```

#### Step 4: Deploy (3 min)

```bash
# Deploy to production
vercel --prod

# Monitor the build
# Wait for "Ready" status
```

#### Step 5: Test (2 min)

```bash
# Visit your production site
# Try to log in
# Check dashboard loads
# Try to create/edit a record

# If anything fails:
#   1. Check Vercel logs: vercel logs
#   2. Revert if needed: vercel rollback
#   3. Fix issue, redeploy
```

#### Step 6: Verify & Document (1 min)

- [ ] Login works?
- [ ] Dashboard loads?
- [ ] Database reads work?
- [ ] Database writes work?
- [ ] Log rotation in incident log (see template below)

---

### Phase 3: SCHEDULED ROTATION (Business hours detection)

**If you can't rotate immediately:**

#### Immediate (2 min)
1. **Enable database monitoring**
   - Check Neon Dashboard → Monitoring
   - Set up alerts for unusual activity
   - Watch for spikes in connections

2. **Alert team**
   ```
   "⚠️ Security rotation scheduled for 11pm tonight.
   Save your work by 10:45pm.
   5-10 min downtime expected."
   ```

3. **Set reminders**
   - 10:45pm: "Save work, rotation in 15 min"
   - 11:00pm: Execute rotation (follow Phase 2)

#### That Evening (15 min)
- Follow Phase 2 steps at 11pm
- Lower risk, fewer users to impact

---

### Phase 4: ROTATE OTHER SECRETS

#### AUTH_SECRET (Session encryption)

```bash
# Generate new secret
openssl rand -base64 32

# Update Vercel
vercel env rm AUTH_SECRET production
vercel env add AUTH_SECRET production
# Paste new value

# Deploy
vercel --prod

# Note: All users will be logged out (expected)
```

#### GOOGLE_PRIVATE_KEY (Service account)

1. **Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - IAM & Admin → Service Accounts
   - Find your service account

2. **Delete old key**
   - Keys tab → Find the exposed key
   - Click "Delete" (⚠️ Critical - prevents access)

3. **Create new key**
   - Click "Add Key" → "Create new key"
   - Select JSON → Download

4. **Update Vercel**
   ```bash
   vercel env rm GOOGLE_PRIVATE_KEY production
   vercel env add GOOGLE_PRIVATE_KEY production
   # Paste the "private_key" value from JSON

   vercel env rm GOOGLE_CLIENT_EMAIL production
   vercel env add GOOGLE_CLIENT_EMAIL production
   # Paste the "client_email" value
   ```

5. **Deploy and test**
   ```bash
   vercel --prod
   # Test Google Sheets integration
   ```

#### OUTSETA API Credentials

1. **Outseta Dashboard**
   - Visit your Outseta account
   - Settings → API → Regenerate

2. **Update Vercel**
   ```bash
   vercel env rm OUTSETA_API_KEY production
   vercel env add OUTSETA_API_KEY production

   vercel env rm OUTSETA_API_SECRET production
   vercel env add OUTSETA_API_SECRET production
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

---

## 🔥 Emergency Procedures

### If Database is Under Attack

**Signs:**
- Neon dashboard shows spike in connections
- Unusual queries in logs
- Slow performance
- Unexpected data changes

**Immediate Actions:**

1. **Pause database access (if possible)**
   - Some providers let you temporarily restrict IPs
   - Whitelist only Vercel IPs

2. **Rotate credentials IMMEDIATELY**
   - Even if business hours
   - 5-10 min downtime is better than breach

3. **Check for data integrity**
   ```bash
   # After rotation, verify data
   npx prisma studio

   # Check:
   # - User count looks normal?
   # - Recent records make sense?
   # - Any suspicious entries?
   ```

4. **Restore from backup (if needed)**
   - Neon has automatic backups
   - Point-in-time restore available

---

## 📞 Emergency Contacts

```
Database Issues:
├─ Provider: Neon (neon.tech)
├─ Dashboard: https://console.neon.tech
└─ Support: support@neon.tech

Hosting Issues:
├─ Provider: Vercel
├─ Dashboard: https://vercel.com/dashboard
└─ Support: https://vercel.com/support

Team Contacts:
├─ Technical Lead: [Your phone]
├─ Business Owner: [Owner phone]
└─ Emergency Slack: #incidents
```

---

## 📊 Incident Log Template

Keep a log of all rotations in a private document (NOT in git):

```
Date: 2025-10-10 11:15pm
Reason: Scheduled quarterly rotation
Affected: DATABASE_URL, AUTH_SECRET
Duration: 8 minutes
Users Impacted: 0 (off-hours)
Issues: None
Notes: Smooth rotation, all tests passed

---

Date: 2025-11-15 2:30pm
Reason: Accidental commit to GitHub
Affected: DATABASE_URL
Duration: 12 minutes (scheduled for 11pm same day)
Users Impacted: 0 (scheduled during off-hours)
Issues: None
Notes: GitGuardian caught it, rotated that evening
```

---

## 🛡️ Prevention Checklist

**Daily:**
- [ ] Gitleaks pre-commit hook active?
- [ ] No secrets in code (use env vars)?

**Weekly:**
- [ ] Check GitGuardian dashboard (no new alerts?)
- [ ] Review Vercel environment variables (up to date?)

**Monthly:**
- [ ] Review access logs (any suspicious activity?)
- [ ] Update this response plan (any lessons learned?)

**Quarterly:**
- [ ] Rotate all secrets (scheduled maintenance)
- [ ] Test incident response (dry run)
- [ ] Review and update team contacts

---

## 🎯 Communication Templates

### For Team (Planned Maintenance)

```
Subject: Scheduled System Maintenance - [Date] 11pm

Team,

We'll be performing routine security maintenance on [Date] at 11pm.

What to expect:
• 5-10 minutes downtime
• All active work will be saved
• Please save and close by 10:45pm to be safe

Why we're doing this:
• Regular security credential rotation
• Keeps our system secure
• Industry best practice

Questions? Let me know!
```

### For Team (Emergency)

```
Subject: URGENT - Brief System Maintenance

Team,

We need to perform emergency security maintenance NOW.

• Expected downtime: 10 minutes
• Please SAVE YOUR WORK immediately
• System will be back at [time]

This is a security precaution. All data is safe.

Updates in Slack #general
```

### For Customers (If public-facing)

```
⚠️ Scheduled Maintenance

We'll be offline briefly on [Date] from 11:00pm-11:15pm
for routine security updates.

Thank you for your patience!
```

---

## 🔄 Post-Incident Review

After any rotation, take 15 minutes to review:

**What went well?**
- Rotation completed in X minutes
- No data loss
- Users barely noticed

**What could be better?**
- Found out at 2pm, could have waited for off-hours
- Deployment took longer than expected
- Should have tested staging first

**Action items:**
- Set up staging environment
- Create deployment checklist
- Add more monitoring

---

## 🎓 Key Lessons

1. **Time is your friend** - Almost all rotations can wait for off-hours
2. **Test first** - Always test new credentials before deploying
3. **Communicate** - Even if 2am, post in Slack for documentation
4. **Document** - Keep an incident log for future reference
5. **Stay calm** - This is fixable, you have a plan

---

## 📚 Related Documents

- [SECURITY_INCIDENT_RESPONSE.md](./SECURITY_INCIDENT_RESPONSE.md) - Credential rotation details
- [SECRET_SCANNING_GUIDE.md](./SECRET_SCANNING_GUIDE.md) - Prevention tools
- [README.md](./README.md) - General setup and deployment

---

**Remember:** With Gitleaks installed, you'll catch 99% of leaks BEFORE they happen. This plan is your backup for the 1%.

**Last updated:** 2025-10-10
**Next review:** 2026-01-10
