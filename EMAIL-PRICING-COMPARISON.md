# Email Service Pricing Comparison for Remotive Logistics Dashboard

## 🎯 Your Scenario: 100 Salespeople Sending Emails

**Question**: How much does it cost to give 100 salespeople access to send emails from the Sales Dashboard?

**Answer**: The cost depends on **total emails sent**, NOT the number of users. All pricing below is for the total organization.

---

## 📊 Top Email Service Options for 2025

### 1. **Resend** ⭐ RECOMMENDED

**Official Page**: https://resend.com/pricing

**Pricing Tiers**:
| Plan | Monthly Cost | Emails Included | Cost Per 1,000 | Best For |
|------|-------------|-----------------|---------------|----------|
| **Free** | $0 | 3,000 | $0 | Testing/Dev |
| **Pro** | $20 | 50,000 | $0.40 | Small teams |
| **Scale** | $90 | 100,000 | $0.90 | Growing business |
| **Enterprise** | Custom | Custom | ~$0.65 | Large organizations |

**For 100 Salespeople**:
- If each rep sends **10 emails/day** = 1,000/day total = **30,000/month**
  - ✅ **Pro plan: $20/month** (fits under 50k limit)

- If each rep sends **20 emails/day** = 2,000/day total = **60,000/month**
  - ✅ **Scale plan: $90/month** (fits under 100k limit)

- If each rep sends **50 emails/day** = 5,000/day total = **150,000/month**
  - ✅ **Enterprise plan: ~$300-500/month** (custom pricing)

**Key Features**:
- ✅ Developer-friendly API (best for our dashboard)
- ✅ React Email template support (we already built this!)
- ✅ Email analytics (opens, clicks)
- ✅ 99.9% uptime SLA
- ✅ Excellent documentation
- ✅ No credit card required for free tier

**Limits**:
- Free: 100 emails/day, 3,000/month
- Pro: No daily limit (50k monthly)
- Scale: No daily limit (100k monthly)

---

### 2. **SendGrid** (Twilio)

**Official Page**: https://sendgrid.com/pricing

**Pricing Tiers**:
| Plan | Monthly Cost | Emails Included | Cost Per 1,000 | Notes |
|------|-------------|-----------------|---------------|-------|
| **Essentials** | $19.95 | 50,000 | $0.40 | Basic features |
| **Pro 100K** | $89.95 | 100,000 | $0.90 | Advanced features |
| **Pro 1M** | $449 | 1,000,000 | $0.45 | Volume discount |

**For 100 Salespeople**:
- 30,000/month: **$19.95** (Essentials)
- 60,000/month: **$89.95** (Pro 100K)
- 150,000/month: **$449** (Pro 1M - overkill but next tier)

**Key Features**:
- ✅ Enterprise-grade infrastructure
- ✅ Advanced email validation
- ✅ Marketing email features
- ⚠️ More complex API (vs Resend)
- ⚠️ **No free tier** (removed in July 2025)

---

### 3. **Mailgun**

**Official Page**: https://www.mailgun.com/pricing

**Pricing Tiers**:
| Plan | Monthly Cost | Emails Included | Cost Per 1,000 | Notes |
|------|-------------|-----------------|---------------|-------|
| **Foundation** | $35 | 50,000 | $0.70 | Basic plan |
| **Growth** | $80 | 100,000 | $0.80 | More features |
| **Scale** | $90 | 100,000 | $0.90 | Premium features |
| **Enterprise** | Custom | Custom | ~$0.70 | High volume |

**For 100 Salespeople**:
- 30,000/month: **$35** (Foundation)
- 60,000/month: **$80** (Growth)
- 150,000/month: **~$300** (Custom)

**Key Features**:
- ✅ Powerful email validation
- ✅ Email routing/forwarding
- ✅ Parse incoming emails
- ⚠️ More expensive than Resend
- ⚠️ Free tier: Only 5,000/month (vs Resend's 3,000)

---

### 4. **Postmark**

**Official Page**: https://postmarkapp.com/pricing

**Pricing Tiers**:
| Plan | Monthly Cost | Emails Included | Cost Per 1,000 | Notes |
|------|-------------|-----------------|---------------|-------|
| **Free** | $0 | 100 | $0 | Testing only |
| **10K** | $15 | 10,000 | $1.50 | Starter |
| **100K** | $75 | 100,000 | $0.75 | Popular |
| **1M** | $360 | 1,000,000 | $0.36 | Volume discount |

**For 100 Salespeople**:
- 30,000/month: **$45** (30k tier)
- 60,000/month: **$75** (100k tier)
- 150,000/month: **$90** (150k tier)

**Key Features**:
- ✅ Best deliverability reputation
- ✅ Excellent customer support
- ✅ Beautiful analytics dashboard
- ⚠️ Slightly more expensive for mid-volume
- ⚠️ Free tier very limited (100 emails)

---

### 5. **AWS SES** (Amazon Simple Email Service)

**Official Page**: https://aws.amazon.com/ses/pricing

**Pricing**:
- **$0.10 per 1,000 emails**
- No monthly fee
- No minimum purchase

**For 100 Salespeople**:
- 30,000/month: **$3/month**
- 60,000/month: **$6/month**
- 150,000/month: **$15/month**

**Key Features**:
- ✅ Cheapest option by far
- ✅ Unlimited scale
- ✅ Part of AWS ecosystem
- ❌ Complex setup (requires AWS knowledge)
- ❌ No built-in template system
- ❌ Poor analytics (need separate tools)
- ❌ Deliverability requires manual warmup
- ⚠️ **NOT recommended** for non-technical teams

---

## 💰 Cost Comparison Summary

### Scenario: 100 Salespeople, 30,000 emails/month

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| **AWS SES** | $3 | Cheapest, but complex |
| **Resend** | $20 | ✅ BEST CHOICE |
| **SendGrid** | $19.95 | Similar to Resend |
| **Mailgun** | $35 | More expensive |
| **Postmark** | $45 | Premium deliverability |

### Scenario: 100 Salespeople, 60,000 emails/month

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| **AWS SES** | $6 | Cheapest, but complex |
| **Postmark** | $75 | Best deliverability |
| **Mailgun** | $80 | Mid-range |
| **SendGrid** | $89.95 | Enterprise features |
| **Resend** | $90 | ✅ BEST FOR DEVELOPERS |

### Scenario: 100 Salespeople, 150,000 emails/month

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| **AWS SES** | $15 | Cheapest, but complex |
| **Postmark** | $90 | Best deliverability |
| **Resend** | ~$300 | Enterprise plan |
| **Mailgun** | ~$300 | Custom pricing |
| **SendGrid** | $449 | 1M tier (overkill) |

---

## 🏆 Recommendation for Remotive Logistics

### **Use Resend - Here's Why:**

1. **We Already Built It** ✅
   - Email templates are done
   - API integration complete
   - Dashboard UI ready
   - Just add API key and go!

2. **Developer-Friendly** ✅
   - Clean, simple API
   - React Email support (we use this)
   - Great documentation
   - Fast setup

3. **Pricing is Fair** ✅
   - $20/month for 50k emails (500/day avg per rep)
   - $90/month for 100k emails (1,000/day avg per rep)
   - Scales with your business

4. **Features You Need** ✅
   - Email analytics (opens, clicks)
   - Delivery tracking
   - Bounce handling
   - 99.9% uptime

5. **Free Tier for Testing** ✅
   - 3,000 emails/month free
   - Test everything before paying
   - No credit card required

---

## 📧 Who Can Send Emails?

**Answer**: EVERYONE with dashboard access!

- All 100 salespeople can send emails
- All managers can send emails
- All directors can send emails
- All owners can send emails

**The cost is based on TOTAL emails sent**, not the number of users.

### Email Limits by Plan:

**Free Plan** ($0):
- 3,000 emails/month total
- 100 emails/day total
- For ALL users combined

**Pro Plan** ($20):
- 50,000 emails/month total
- No daily limit
- For ALL users combined
- = 500 emails per salesperson per month (if 100 reps)

**Scale Plan** ($90):
- 100,000 emails/month total
- No daily limit
- For ALL users combined
- = 1,000 emails per salesperson per month (if 100 reps)

---

## 🔍 Real-World Usage Estimate

### Typical Sales Rep Email Usage:

**Low Activity** (5-10 emails/day per rep):
- 100 reps × 10 emails × 30 days = **30,000/month**
- **Cost: $20/month** (Resend Pro)

**Medium Activity** (10-20 emails/day per rep):
- 100 reps × 20 emails × 30 days = **60,000/month**
- **Cost: $90/month** (Resend Scale)

**High Activity** (30-50 emails/day per rep):
- 100 reps × 50 emails × 30 days = **150,000/month**
- **Cost: ~$300/month** (Resend Enterprise)

**VERY High Activity** (100+ emails/day per rep):
- 100 reps × 100 emails × 30 days = **300,000/month**
- **Cost: $449/month** (SendGrid Pro 1M - better value at this volume)

---

## 🚀 Getting Started with Resend

### Setup Steps:

1. **Sign up**: Visit [resend.com/signup](https://resend.com/signup)
2. **Get API key**: Dashboard → API Keys → Create
3. **Add to Vercel**: `vercel env add RESEND_API_KEY`
4. **Install packages**: `pnpm add resend @react-email/components`
5. **Deploy**: `vercel deploy --prod`
6. **Test**: Navigate to `/en/email-center` and send test email

### Monitoring Usage:

- Visit [resend.com/overview](https://resend.com/overview)
- See emails sent this month
- Check remaining quota
- Upgrade plan as needed

### When to Upgrade:

- **Start**: Free plan (3,000/month) for testing
- **10-20 reps**: Pro plan ($20 - 50k/month)
- **50-100 reps**: Scale plan ($90 - 100k/month)
- **200+ reps**: Enterprise plan (custom)

---

## ❓ FAQ

### Q: Do I need to pay per user?
**A**: No! You pay for total emails sent by your entire organization.

### Q: Can I switch plans anytime?
**A**: Yes, upgrade/downgrade instantly in Resend dashboard.

### Q: What happens if I exceed my limit?
**A**: Emails will be queued until next billing cycle, or you can upgrade immediately.

### Q: Is there a free trial?
**A**: The free tier (3,000 emails/month) never expires. Test forever!

### Q: Can I use multiple services?
**A**: Yes, but our integration only supports one at a time. Resend is recommended.

### Q: What about marketing emails?
**A**: These prices are for **transactional emails** (quotes, welcome, password reset). Marketing emails have different pricing (contact-based).

---

## 🔗 Pricing Page Links

- **Resend**: https://resend.com/pricing
- **SendGrid**: https://sendgrid.com/pricing
- **Mailgun**: https://www.mailgun.com/pricing
- **Postmark**: https://postmarkapp.com/pricing
- **AWS SES**: https://aws.amazon.com/ses/pricing

---

**Last Updated**: 2025-10-12
**Recommended**: Resend ($20-90/month for 100 reps)
**Already Integrated**: Yes ✅
