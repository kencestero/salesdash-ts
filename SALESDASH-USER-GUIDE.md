# SalesDash User Guide
## MJ Cargo Trailers - Team Access Manual

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
Welcome to MJ Cargo Trailers!

To access the SalesDash system:
1. Go to: https://salesdash-ts.vercel.app/en/auth/join
2. Enter this code: ABC123
3. Sign in with your Google account

The code expires at midnight (NY time), so please complete
registration today.

Questions? Contact [Your Name] at [Your Contact]
```

---

### Step 4: Important Notes

- ✅ Codes rotate **daily at midnight** (New York time)
- ✅ Each code assigns a **specific role** automatically
- ✅ Users must have a **Google account** to sign in
- ✅ Once registered, users **don't need codes again**
- ⚠️ Keep the **Owner code confidential**

---

## For New Users: Joining SalesDash

### Step 1: Get Your Join Code

Your manager or team lead will provide you with a 6-character code.

**Example:** `ABC123`

---

### Step 2: Navigate to the Join Page

**Open your browser and go to:**
- https://salesdash-ts.vercel.app/en/auth/join

You should see a page with a join code input field.

---

### Step 3: Enter Your Code

1. Type or paste the code into the input field
2. Code is **case-insensitive** (ABC123 = abc123)
3. Click **"Continue"**

---

### Step 4: Sign In with Google

1. You'll be redirected to Google sign-in
2. Choose your Google account
3. Approve the authentication request
4. You'll be redirected back to SalesDash

---

### Step 5: Access Your Dashboard

After successful sign-in:
- You'll land on the **Dashboard** homepage
- Your role is automatically assigned based on the code you used
- Full access to features based on your role

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
- mjcargotrailers@gmail.com
- Mightneedoil@gmail.com

### For Access Questions

**Managers:**
- brianjtrailers@gmail.com
- danmjtrailers@gmail.com

### Emergency Access

If you cannot reach anyone above:
1. Check your email for invite messages
2. Contact MJ Cargo Trailers main office
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
1. Receive code from manager
2. Go to: salesdash-ts.vercel.app/en/auth/join
3. Enter code
4. Sign in with Google
5. Access dashboard

NEED HELP?
Email: mjcargotrailers@gmail.com
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

© 2025 MJ Cargo Trailers
All Rights Reserved

Do not distribute outside the organization without authorization.

---

**Last Updated:** October 7, 2025
**Version:** 2.0
**Author:** SalesDash Development Team
