# SalesDash User Guide
## Remotive Logistics Trailers - Team Access Manual

---

## 📋 Table of Contents

1. [For Owners & Managers: Inviting New Team Members](#for-owners--managers-inviting-new-team-members)
2. [For New Users: Joining SalesDash](#for-new-users-joining-salesdash)
3. [Understanding Roles](#understanding-roles)
4. [Daily Join Codes Explained](#daily-join-codes-explained)
5. [Troubleshooting](#troubleshooting)
6. [Contact Information](#contact-information)

---

## For Owners & Managers: Inviting New Team Members

### Step 1: Access the Join Codes Page

**Local Development:**
- URL: http://localhost:3000/en/auth/join-code

**Production:**
- URL: https://salesdash-ts.vercel.app/en/auth/join-code

**Who Can Access:**
- ✅ Owners (listed in OWNERS environment variable)
- ✅ Managers (listed in MANAGERS environment variable)
- ❌ Salespeople (restricted)

---

### Step 2: Choose the Appropriate Code

You will see up to 3 different codes depending on your role:

#### 🔵 **Sales Representative Code**
- **Purpose:** For hiring new sales team members
- **Role Assigned:** Salesperson
- **Permissions:** Basic sales dashboard access
- **Visible To:** Managers and Owners

#### 🟠 **Manager Code**
- **Purpose:** For hiring team managers
- **Role Assigned:** Manager
- **Permissions:** Sales dashboard + team management
- **Visible To:** Managers and Owners

#### 🔴 **Owner/Admin Code** ⚠️
- **Purpose:** For adding new owners/administrators
- **Role Assigned:** Owner
- **Permissions:** Full system access
- **Visible To:** Owners ONLY
- **⚠️ WARNING:** Ask current owners before sharing this code!

---

### Step 3: Share the Code

1. **Copy** the appropriate code (6-character alphanumeric)
2. **Share** with the new hire via:
   - Text message
   - Email
   - Phone call
   - Slack/Teams message

**Example Message:**
```
Welcome to Remotive Logistics Trailers!

To access the SalesDash system:
1. Go to: https://salesdash-ts.vercel.app/en/auth/join
2. Enter this code: ABC123
3. Click "Validate" to unlock the form
4. Fill out your information (name, phone, email, password)
5. Either create an account with email/password OR sign up with Google

The code expires at midnight (NY time), so please complete
registration today.

Questions? Contact [Your Name] at [Your Contact]
```

---

### Step 4: Important Notes

- ✅ Codes rotate **daily at midnight** (New York time)
- ✅ Each code assigns a **specific role** automatically
- ✅ Users can sign up with **email/password OR Google/OAuth**
- ✅ Email/password users must **verify their email within 2 minutes**
- ✅ Once registered, users **don't need codes again**
- ⚠️ Keep the **Owner code confidential**

---

## For New Users: Joining SalesDash

### Step 1: Get Your Join Code

Your manager or team lead will provide you with a 6-character code.

**Example:** `ABC123`

---

### Step 2: Navigate to the Sign-Up Page

**Open your browser and go to:**
- https://salesdash-ts.vercel.app/en/auth/join

You should see the **"Join Remotive Logistics Sales Team"** page with a secret code input field.

---

### Step 3: Enter and Validate Your Secret Code

1. **Enter the code** in the "Secret Code" field at the top
2. Click **"Validate"** button
3. Wait for the green checkmark ✓ **"Verified"** confirmation
4. The form below will unlock automatically

**Important:** The form is locked until you validate your secret code. If you click on the grey form fields before validating, you'll see an arrow pointing up reminding you to enter the code first!

---

### Step 4: Fill Out Required Information

Once your code is validated, complete the registration form:

**Required Fields:**
- **First Name** - Your legal first name
- **Last Name** - Your legal last name
- **Phone Number** - Your contact number (format: +1 (555) 000-0000)
- **Email Address** - Your work or personal email
- **Password** - Create a secure password (minimum 4 characters)

**Tips:**
- Use the eye icon to show/hide your password
- All fields marked with * are required

---

### Step 5: Choose Your Sign-Up Method

You have two options:

#### Option A: Email/Password Sign-Up
1. Fill out all required fields (name, phone, email, password)
2. Click **"Create Account & Verify Email"**
3. You'll be redirected to the email verification page
4. Check your email for verification link
5. Click the link in the email within 2 minutes
6. Your email will be verified and you can log in

#### Option B: Sign Up with Google/OAuth
1. Fill out required fields: **First Name, Last Name, Phone Number**
2. Click the **Google** icon (or GitHub/Facebook/Twitter when available)
3. Sign in with your selected provider
4. Your account will be created automatically
5. You'll be redirected to the dashboard

**Note:** Even with Google sign-up, you must fill in your name and phone number first!

---

### Step 6: Email Verification (Email/Password Only)

If you signed up with email/password:

1. **Check your email inbox** for verification message from Remotive SalesHub
2. **Check SPAM folder** if you don't see it
3. Click **"Open email"** button or manually check your email
4. Click the verification link in the email
5. **You have 2 minutes** (countdown timer shown)
6. If expired, click **"Resend email verification"**

The verification page shows:
- Remotive SalesHub branding (blue and yellow design)
- 2-minute countdown timer (00:00 format)
- "Open email" button to launch your email client
- Option to resend verification after countdown ends

---

### Step 7: Access Your Dashboard

After successful verification/sign-in:
- You'll land on the **Dashboard** homepage
- Your role is automatically assigned based on the secret code you used
- Full access to features based on your role
- Welcome to Remotive Logistics Sales Team! 🚀

---

## Understanding Roles

### 🔵 Salesperson

**Access:**
- ✅ Sales dashboard
- ✅ Lead management
- ✅ Customer information
- ✅ Personal activity tracking
- ✅ Chat with team members

**Restrictions:**
- ❌ Cannot view join codes
- ❌ Cannot assign roles to others
- ❌ Limited admin features

---

### 🟠 Manager

**Everything Salespeople can do, PLUS:**
- ✅ View join codes (Salesperson + Manager)
- ✅ Invite new salespeople and managers
- ✅ Team performance dashboards
- ✅ Manager-level reports

**Restrictions:**
- ❌ Cannot see Owner join code
- ❌ Cannot promote users to Owner
- ❌ Limited system configuration

---

### 🔴 Owner/Admin

**Full system access:**
- ✅ All Manager permissions
- ✅ View ALL join codes (including Owner code)
- ✅ Invite new owners
- ✅ System configuration
- ✅ User management
- ✅ Access all features

---

## Daily Join Codes Explained

### How Codes Are Generated

Each day at **midnight (New York timezone)**, three new codes are generated:

```
Date: October 7, 2025
Time: 12:00 AM EST

🔵 Salesperson Code: A1B2C3
🟠 Manager Code:     D4E5F6
🔴 Owner Code:       G7H8I9
```

### Code Security

- **Algorithm:** HMAC-SHA256
- **Secret Key:** Stored in environment variable (AUTH_SECRET)
- **Format:** 6 uppercase alphanumeric characters
- **Expiration:** Midnight (NY time) daily
- **Uniqueness:** Different code for each role

### Why Daily Rotation?

- **Security:** Limits exposure if code is leaked
- **Control:** Managers must actively share current code
- **Audit:** Daily codes help track when users joined
- **Best Practice:** Standard security measure

---

## Troubleshooting

### "Wrong or expired code" Error

**Problem:** Code entered is invalid or expired.

**Solutions:**
1. **Check the date:** Codes expire at midnight (NY time)
2. **Request new code:** Ask your manager for today's code
3. **Verify spelling:** Ensure code is entered correctly
4. **Check role:** Make sure you have the right code type

---

### "Access Denied" When Viewing Join Codes

**Problem:** You don't have permission to view join codes.

**Reason:** Only Managers and Owners can view join codes.

**Solution:**
- Contact an Owner or Manager to get the code
- Request role upgrade if needed

---

### Login Redirect Loop

**Problem:** After signing in with Google, you're redirected back to login.

**Solutions:**
1. **Clear browser cookies** and try again
2. **Try incognito/private mode**
3. **Check database connection** (for admins)
4. Contact system administrator

---

### Can't Access Dashboard After Login

**Problem:** Logged in but can't see the dashboard.

**Possible Causes:**
- Account not properly created
- Role not assigned
- Session expired

**Solutions:**
1. **Log out completely** and sign in again
2. **Clear browser cache**
3. **Check with admin** that your account exists
4. Try different browser

---

### Google Sign-In Issues

**Problem:** Google authentication fails.

**Solutions:**
1. **Check popup blockers:** Disable for this site
2. **Try different Google account**
3. **Clear Google cookies**
4. **Check Google account status:** Must be active

---

## Contact Information

### For Technical Support

**Owners:**
- kencestero@gmail.com
- remotivetrailers@gmail.com
- Mightneedoil@gmail.com

### For Access Questions

**Managers:**
- brianjtrailers@gmail.com
- danmjtrailers@gmail.com

### Emergency Access

If you cannot reach anyone above:
1. Check your email for invite messages
2. Contact Remotive Logistics Trailers main office
3. Check company Slack/Teams channels

---

## Quick Reference Card

### Owners & Managers

```
VIEW CODES:
https://salesdash-ts.vercel.app/en/auth/join-code

INVITE PROCESS:
1. Access join codes page
2. Copy appropriate code
3. Share with new hire
4. New hire visits /en/auth/join
5. They enter code + sign in with Google
6. Done! Role auto-assigned
```

### New Users

```
JOIN PROCESS:
1. Receive secret code from manager
2. Go to: salesdash-ts.vercel.app/en/auth/join
3. Enter code and click "Validate"
4. Fill out required info (name, phone, email, password)
5. Either:
   - Create account with email/password (verify email)
   - OR sign up with Google
6. Access dashboard

NEED HELP?
Email: remotivetrailers@gmail.com
```

---

## System Architecture (For Admins)

### Environment Variables

**Required:**
- `AUTH_SECRET` - Used for code generation
- `AUTH_GOOGLE_ID` - Google OAuth Client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth Secret
- `DATABASE_URL` - Prisma database connection
- `OWNERS` - Comma-separated owner emails
- `MANAGERS` - Comma-separated manager emails

### Database Schema

**User Table:**
- Standard NextAuth user data
- Links to UserProfile via `userId`

**UserProfile Table:**
- `role`: "owner" | "manager" | "salesperson"
- `member`: Boolean (join code verified)
- `phone`, `city`, `zip`: Optional user details

### Code Generation Logic

```typescript
// Location: lib/joinCode.ts

// Get today's date (NY timezone)
const stamp = getTodayStamp(); // "2025-10-07"

// Generate code for specific role
const salt = `${stamp}-${role}`; // "2025-10-07-manager"
const hash = crypto.createHmac("sha256", AUTH_SECRET)
  .update(salt)
  .digest("hex");
const code = hash.slice(0, 6).toUpperCase(); // "A1B2C3"
```

### Authentication Flow

1. User enters code → `/api/join/validate`
2. Code validated → Role stored in cookie
3. User signs in with Google → NextAuth callback
4. UserProfile created with role from cookie
5. Session includes user role
6. Cookies cleared
7. User redirected to dashboard

---

## Changelog

### October 7, 2025
- ✅ **NEW:** Complete sign-up flow with email/password option
- ✅ **NEW:** Email verification page with 2-minute countdown
- ✅ **NEW:** Form locked until secret code validated
- ✅ **NEW:** Arrow indicator when clicking disabled form
- ✅ **NEW:** "Game Time" login page branding
- ✅ Implemented role-based join codes
- ✅ Restricted join-code page to managers/owners
- ✅ Auto role assignment on signup
- ✅ Fixed login redirect loop
- ✅ Switched to Prisma Accelerate for database
- ✅ Updated session strategy to database

### Previous Updates
- Initial NextAuth v4 setup
- Google OAuth integration
- Daily rotating join codes
- User profile system

---

## License & Confidentiality

**This document is confidential and for internal use only.**

© 2025 Remotive Logistics Trailers
All Rights Reserved

Do not distribute outside the organization without authorization.

---

**Last Updated:** October 7, 2025
**Version:** 2.0
**Author:** SalesDash Development Team
