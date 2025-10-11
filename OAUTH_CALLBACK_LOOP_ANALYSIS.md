# OAuth Callback Loop Issue - Root Cause Analysis & Solutions

## Executive Summary

**Problem**: Users attempting OAuth signup with Google are redirected back to the signin page with a "Try signing in with a different account" error, creating an infinite callback loop.

**Root Cause**: NextAuth v4 with JWT sessions (no adapter) does NOT automatically create users in the database during OAuth flow. The signIn callback manually creates users, but when it returns a redirect URL string (for join code errors), NextAuth treats this as an authentication failure and loops back to signin.

**Critical Issue**: The signIn callback at `lib/auth.ts:110` returns a redirect URL for users without a join_ok cookie, but NextAuth interprets ANY redirect return from signIn callback as blocking authentication - even for error pages - causing the loop.

---

## Current System Architecture

### Authentication Setup
- **NextAuth Version**: v4.24.5
- **Session Strategy**: JWT (no database adapter)
- **Providers**: Google OAuth + Credentials
- **Database**: PostgreSQL via Prisma
- **Manual User Creation**: In signIn callback (lines 62-205 of `lib/auth.ts`)

### Join Code Flow
1. User validates join code at `/en/auth/join`
2. Validation sets cookies: `join_ok` and `join_role` (sameSite: "none", secure: true)
3. User clicks "Continue with Google"
4. OAuth redirects to Google, then back to `/api/auth/callback/google`
5. NextAuth invokes signIn callback with user data
6. Callback checks for `join_ok` cookie
7. **ISSUE**: If missing, returns redirect string → causes loop

---

## Root Cause Analysis

### Why The Loop Happens

#### 1. **JWT Sessions + No Adapter = No Automatic User Creation**

From the code analysis and NextAuth documentation:

```typescript
// lib/auth.ts line 7-10
export const authOptions = {
  // Note: No adapter needed - we're using JWT sessions and handling user creation in signIn callback
  session: {
    strategy: "jwt" as const, // JWT for credentials support
  },
```

**Key Finding**: When using JWT sessions WITHOUT an adapter, NextAuth does NOT automatically create users in the database. The user object is just a "prototype" extracted from the OAuth profile.

**Source**: NextAuth documentation states: "When using NextAuth.js without a database, the user object will always be a prototype user object, with information extracted from the profile."

#### 2. **SignIn Callback Return Values Have Special Meaning**

From NextAuth v4 documentation:

- **Return `true`**: Allow authentication to proceed
- **Return `false`**: Block authentication, show default error
- **Return URL string**: Block authentication, redirect to error page

**Critical Quote**: "Redirects returned by this callback cancel the authentication flow. Only redirect to error pages that, for example, tell the user why they're not allowed to sign in."

**Your Code Problem**:
```typescript
// lib/auth.ts lines 107-111
if (!joinCodeValid) {
  console.log("❌ New user without join code - blocking signup");
  // Redirect to join page by returning a URL string
  return `/en/auth/join?error=join_code_required`; // ⚠️ BLOCKS AUTH
}
```

This return BLOCKS authentication entirely, so:
1. OAuth callback completes
2. signIn callback returns error redirect
3. NextAuth cancels authentication
4. User not signed in → redirected to signin
5. Loop repeats

#### 3. **Cookie Persistence Issues**

The join_ok cookie is set with:
```typescript
// app/api/join/validate/route.ts lines 30-36
cookies().set("join_ok", "1", {
  httpOnly: true,
  sameSite: "none", // Changed from "lax" for OAuth
  path: "/",
  maxAge: 60 * 15, // 15 min
  secure: true,
});
```

**Potential Issues**:
- **Cross-domain cookies**: sameSite: "none" + secure: true requires HTTPS
- **Development environment**: If using `http://localhost`, secure cookies may not work
- **OAuth redirect chain**: Google OAuth redirect may not preserve cookies
- **Middleware interference**: Cookies might be blocked by middleware

#### 4. **Middleware Redirects for Unauthenticated Users**

```typescript
// middleware.ts lines 42-52
const sessionToken = req.cookies.get("next-auth.session-token") ||
                     req.cookies.get("__Secure-next-auth.session-token");
const isAuthRoute = pathname === LOGIN || pathname.startsWith(AUTH_PREFIX);

if (!sessionToken) {
  if (!isAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = LOGIN;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
```

Since OAuth callback fails → no session created → middleware redirects → loop.

#### 5. **User Creation Happens AFTER Join Code Check**

```typescript
// lib/auth.ts flow:
// Line 69: Check if user exists
const existingUser = await prisma.user.findUnique({ where: { email: user.email } });

// Line 75-101: If existing user, verify email and allow
if (existingUser) { return true; }

// Line 103-111: If NEW user, check join_ok cookie
// ⚠️ THIS IS WHERE IT FAILS FOR NEW USERS
if (!joinCodeValid) {
  return `/en/auth/join?error=join_code_required`;
}

// Line 116-204: Create user in database (never reached if cookie missing)
```

**The Problem**: OAuth users are NOT automatically created in the database (no adapter), so they're always "new users" and always hit the join code check.

---

## Specific Strategies to Fix (Ranked by Likelihood)

### Strategy 1: Use Database Adapter for OAuth (HIGHEST PRIORITY)

**Likelihood of Success**: 95%

**Problem It Solves**:
- Automatically creates User and Account records during OAuth
- Existing users bypass join code check
- Only truly new users need join codes

**Implementation**:

```typescript
// lib/auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma), // ✅ ADD THIS
  session: {
    strategy: "jwt" as const, // Keep JWT for credentials support
  },
  // ... rest of config
}
```

**Why This Works**:
1. OAuth users get automatically created in database on first signin
2. Second OAuth attempt finds existing user → bypasses join check
3. Credentials provider still works with JWT
4. No redirect loop because user creation happens outside signIn callback

**Testing Steps**:
1. Add adapter to authOptions
2. Clear database test user
3. Validate join code
4. Try OAuth signup → should create User + Account records
5. Try OAuth signin again → should find existing user → success

---

### Strategy 2: Don't Return Redirect for Missing Join Code (RECOMMENDED)

**Likelihood of Success**: 85%

**Problem It Solves**: Prevents signIn callback from blocking authentication

**Implementation**:

```typescript
// lib/auth.ts - MODIFIED signIn callback
async signIn({ user, account, profile }: any) {
  console.log("=== SignIn Callback ===");
  console.log("User:", user.email);
  console.log("Account:", account?.provider);

  // Check if user already exists in database
  const existingUser = await prisma.user.findUnique({
    where: { email: user.email },
    include: { profile: true },
  });

  // If existing user, verify and allow
  if (existingUser) {
    // ... existing verification logic ...
    console.log("✅ Existing user - login allowed");
    return true;
  }

  // ⚠️ NEW APPROACH: For new OAuth users, create minimal user WITHOUT join code
  // Store flag to redirect them to join page AFTER successful auth
  if (account?.provider) {
    console.log("🔄 Creating placeholder OAuth user (will verify join code after auth)");

    // Create user with unverified status
    const newUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: null, // Not verified yet
      },
    });

    // Create basic profile WITHOUT join code validation
    await prisma.userProfile.create({
      data: {
        userId: newUser.id,
        role: "salesperson", // Default role
        member: false, // Not a member yet
        salespersonCode: `TEMP_${Date.now()}`, // Temporary code
      },
    });

    console.log("✅ Placeholder user created - will redirect to join verification");

    // ✅ RETURN TRUE to allow authentication
    // Then use redirect callback or middleware to check join code
    return true;
  }

  return true;
}
```

**Add Post-Auth Join Code Verification**:

```typescript
// lib/auth.ts - Add redirect callback
callbacks: {
  async signIn({ user, account, profile }: any) {
    // ... existing logic ...
  },

  // ✅ ADD THIS: Redirect callback handles post-auth routing
  async redirect({ url, baseUrl }: any) {
    console.log("=== Redirect Callback ===");
    console.log("URL:", url);
    console.log("BaseURL:", baseUrl);

    // After successful OAuth signin, check if user has verified join code
    const { cookies } = await import("next/headers");
    const joinOk = cookies().get("join_ok")?.value;

    if (!joinOk) {
      // User authenticated but needs to verify join code
      console.log("⚠️ User needs to verify join code");
      return `${baseUrl}/en/auth/join?error=join_code_required`;
    }

    // Allow normal redirect
    return url.startsWith(baseUrl) ? url : baseUrl;
  },

  async jwt({ token, user }: any) {
    // ... existing logic ...
  },

  async session({ session, token }: any) {
    // ... existing logic ...
  },
}
```

**Why This Works**:
- signIn callback always returns `true` → no auth blocking
- User gets created in database (becomes "existing user" on retry)
- redirect callback handles join code verification AFTER auth succeeds
- No infinite loop because auth completes successfully

**Cons**:
- Creates "placeholder" users without valid join codes
- Requires cleanup of abandoned placeholder accounts
- More complex state management

---

### Strategy 3: Store Join Code Data in Session/OAuth State (MEDIUM PRIORITY)

**Likelihood of Success**: 70%

**Problem It Solves**: Persists join code through OAuth redirect chain

**Implementation**:

```typescript
// app/[lang]/auth/join/page.tsx - Modified OAuth signup
async function handleSocialSignup(provider: "google" | "github") {
  if (!codeValidated) {
    handleFormClick();
    return;
  }

  // ... existing validation ...

  // ✅ ENCODE join code in OAuth state parameter
  const stateData = {
    joinOk: "1",
    joinRole: joinRole,
    firstName: firstName,
    lastName: lastName,
    phone: phone,
    zipcode: zipcode,
  };

  // Base64 encode state
  const encodedState = btoa(JSON.stringify(stateData));

  // Proceed with OAuth - pass state
  signIn(provider, {
    callbackUrl: `/${DEFAULT_LANG}/auth/verify-email`,
    // ⚠️ NOTE: NextAuth doesn't directly support custom state
    // This approach requires custom OAuth configuration
  });
}
```

**Alternative: Use Database-Backed Session Store**:

```typescript
// Create temporary session before OAuth
await fetch("/api/auth/temp-session", {
  method: "POST",
  body: JSON.stringify({
    joinOk: "1",
    joinRole: joinRole,
    // ... other data
  })
});

// In signIn callback, retrieve from database
const tempSession = await prisma.tempSession.findUnique({
  where: { userId: user.email }
});

if (tempSession?.joinOk) {
  // Process signup
}
```

**Why This Works**:
- Data persists through OAuth redirect
- Doesn't rely on cookies
- More reliable for cross-domain scenarios

**Cons**:
- More complex implementation
- Requires database schema changes for temp sessions
- State parameter has size limits

---

### Strategy 4: Fix Cookie Configuration for Production (ESSENTIAL)

**Likelihood of Success**: 60% (as standalone fix)

**Problem It Solves**: Ensures cookies persist through OAuth flow

**Verification Steps**:

1. **Check NEXTAUTH_URL in Production**:
```bash
# Should be full production URL, NOT localhost
NEXTAUTH_URL=https://yourdomain.com  # ✅ CORRECT
NEXTAUTH_URL=http://localhost:3000   # ❌ WRONG (in production)
```

2. **Verify Cookie Settings**:
```typescript
// app/api/join/validate/route.ts
cookies().set("join_ok", "1", {
  httpOnly: true,
  sameSite: "none", // ✅ REQUIRED for cross-site OAuth
  path: "/",
  maxAge: 60 * 15, // 15 min
  secure: true, // ✅ REQUIRED with sameSite: "none"
  domain: undefined, // Let browser determine (same domain)
});
```

3. **Test Cookie Persistence**:
```typescript
// Add debugging to signIn callback
async signIn({ user, account, profile }: any) {
  console.log("=== SignIn Callback ===");

  const { cookies } = await import("next/headers");
  const allCookies = cookies().getAll();
  console.log("📋 All cookies:", allCookies.map(c => c.name));

  const joinOk = cookies().get("join_ok");
  console.log("🍪 join_ok cookie:", joinOk);

  if (!joinOk) {
    console.log("❌ join_ok cookie MISSING");
    console.log("Possible causes:");
    console.log("- Cookie expired (15min limit)");
    console.log("- sameSite/secure configuration issue");
    console.log("- OAuth redirect stripped cookies");
  }

  // ... rest of logic
}
```

4. **Production Environment Checklist**:
- [ ] NEXTAUTH_URL set to production URL (https://...)
- [ ] NEXTAUTH_SECRET is set and consistent
- [ ] AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET are correct
- [ ] Google OAuth redirect URI matches production URL
- [ ] Site uses HTTPS (required for secure cookies)
- [ ] No CORS issues blocking cookies

**Why This Works**:
- Proper cookie configuration ensures persistence
- Fixes common production deployment issues

**Cons**:
- May not solve fundamental architecture issue
- Still vulnerable if user takes >15min to complete OAuth

---

### Strategy 5: Allow Public OAuth Signup + Require Join Code Later (ALTERNATIVE)

**Likelihood of Success**: 80%

**Problem It Solves**: Decouples OAuth from join code validation

**Implementation Flow**:

1. **Remove join code requirement from signIn callback**:
```typescript
async signIn({ user, account, profile }: any) {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (existingUser) {
    return true; // Existing users always allowed
  }

  // ✅ NEW: Allow all OAuth signups
  if (account?.provider) {
    console.log("✅ OAuth signup - creating user");

    // Create user without join code requirement
    const newUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: new Date(), // OAuth emails are pre-verified
      },
    });

    // Create profile with default role
    await prisma.userProfile.create({
      data: {
        userId: newUser.id,
        role: "salesperson",
        member: false, // ⚠️ NOT A MEMBER until join code verified
        salespersonCode: `PENDING_${Date.now()}`,
      },
    });

    return true;
  }

  return true;
}
```

2. **Use middleware to enforce join code verification**:
```typescript
// middleware.ts - Add join code check
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ... existing static file handling ...

  const sessionToken = req.cookies.get("next-auth.session-token") ||
                       req.cookies.get("__Secure-next-auth.session-token");

  if (sessionToken) {
    // User is authenticated - check if they have verified join code
    const session = await getToken({ req, secret: process.env.AUTH_SECRET });

    if (session?.email) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId: session.id },
      });

      // If not a member, redirect to join code verification
      if (userProfile && !userProfile.member && pathname !== "/en/auth/join") {
        const url = req.nextUrl.clone();
        url.pathname = "/en/auth/join";
        url.searchParams.set("error", "join_code_required");
        return NextResponse.redirect(url);
      }
    }
  }

  // ... existing logic ...
}
```

3. **Update join page to handle authenticated users**:
```typescript
// app/[lang]/auth/join/page.tsx
export default function JoinPage() {
  const { data: session } = useSession();

  async function validateAndActivate() {
    // Validate join code
    const res = await fetch("/api/join/validate", {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      // Update user profile to activate membership
      await fetch("/api/user/activate-membership", {
        method: "POST",
        body: JSON.stringify({ code }),
      });

      // Redirect to dashboard
      window.location.href = "/en/dashboard";
    }
  }

  // ... rest of component
}
```

**Why This Works**:
- OAuth flow completes successfully without blocking
- Users can authenticate without join code
- Access to dashboard is gated by middleware until join code verified
- No infinite loops

**Pros**:
- Clean separation of concerns
- No cookie persistence issues
- OAuth flow stays simple
- Join code verification happens post-auth

**Cons**:
- Users can create accounts without valid join codes
- Requires additional cleanup for unverified accounts
- More complex authorization logic

---

## Debugging Steps to Identify Root Cause

### Step 1: Enable Detailed Logging

```typescript
// lib/auth.ts - Add comprehensive logging
export const authOptions = {
  debug: true, // ✅ Enable in development
  session: { strategy: "jwt" as const },

  callbacks: {
    async signIn({ user, account, profile }: any) {
      console.log("\n=== SIGNIN CALLBACK START ===");
      console.log("Timestamp:", new Date().toISOString());
      console.log("User:", JSON.stringify(user, null, 2));
      console.log("Account:", JSON.stringify(account, null, 2));
      console.log("Profile:", JSON.stringify(profile, null, 2));

      // Check cookies
      const { cookies } = await import("next/headers");
      const allCookies = cookies().getAll();
      console.log("\n📋 All Available Cookies:");
      allCookies.forEach(cookie => {
        console.log(`  - ${cookie.name}: ${cookie.value}`);
      });

      const joinOk = cookies().get("join_ok");
      const joinRole = cookies().get("join_role");
      console.log("\n🍪 Join Cookies:");
      console.log("  join_ok:", joinOk);
      console.log("  join_role:", joinRole);

      // Check database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { profile: true, accounts: true },
      });

      console.log("\n💾 Database Check:");
      if (existingUser) {
        console.log("  User EXISTS in database");
        console.log("  User ID:", existingUser.id);
        console.log("  Email Verified:", existingUser.emailVerified);
        console.log("  Profile:", existingUser.profile ? "EXISTS" : "MISSING");
        console.log("  Accounts:", existingUser.accounts.length);
      } else {
        console.log("  User DOES NOT EXIST in database");
        console.log("  This is a NEW USER signup attempt");
      }

      // Decision point
      if (existingUser) {
        console.log("\n✅ DECISION: Allow existing user");
        console.log("=== SIGNIN CALLBACK END ===\n");
        return true;
      }

      if (!joinOk) {
        console.log("\n❌ DECISION: Block - no join_ok cookie");
        console.log("Returning redirect to:", `/en/auth/join?error=join_code_required`);
        console.log("⚠️  THIS WILL CANCEL AUTHENTICATION");
        console.log("=== SIGNIN CALLBACK END ===\n");
        return `/en/auth/join?error=join_code_required`;
      }

      console.log("\n✅ DECISION: Create new user with join code");
      console.log("=== SIGNIN CALLBACK END ===\n");

      // ... continue with user creation ...
      return true;
    },

    async redirect({ url, baseUrl }: any) {
      console.log("\n=== REDIRECT CALLBACK ===");
      console.log("URL:", url);
      console.log("BaseURL:", baseUrl);
      console.log("========================\n");

      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async jwt({ token, user, account }: any) {
      console.log("\n=== JWT CALLBACK ===");
      console.log("Token ID:", token.id);
      console.log("User:", user ? "present" : "null");
      console.log("Account:", account ? account.provider : "null");
      console.log("====================\n");

      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }: any) {
      console.log("\n=== SESSION CALLBACK ===");
      console.log("Session user:", session?.user?.email);
      console.log("Token ID:", token?.id);

      if (session?.user && token?.id) {
        session.user.id = token.id;

        const userProfile = await prisma.userProfile.findUnique({
          where: { userId: token.id },
        });

        console.log("User profile:", userProfile ? "found" : "missing");

        if (userProfile) {
          session.user.role = userProfile.role;
          console.log("User role:", userProfile.role);
        }
      }

      console.log("=======================\n");
      return session;
    },
  },

  // ... rest of config
};
```

### Step 2: Monitor Browser Network Tab

**What to Check**:
1. OAuth initiation: `/api/auth/signin/google`
2. Google redirect with code
3. Callback: `/api/auth/callback/google?code=...&state=...`
4. Final redirect location

**Look For**:
- Cookie headers in requests
- Response redirects (302, 307)
- Error messages in response bodies

### Step 3: Test Cookie Persistence

**Browser Console Test**:
```javascript
// After validating join code, check cookies
console.log("Cookies:", document.cookie);

// Should see join_ok and join_role
// If missing, cookies weren't set correctly
```

**Server Test**:
```typescript
// app/api/test-cookies/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const allCookies = cookies().getAll();
  return NextResponse.json({
    cookies: allCookies.map(c => ({
      name: c.name,
      value: c.value,
    })),
  });
}
```

Visit `/api/test-cookies` after validating join code to verify.

### Step 4: Check Google OAuth Configuration

**Google Cloud Console**:
1. Navigate to Credentials
2. Find your OAuth 2.0 Client ID
3. Check "Authorized redirect URIs"
4. Must include: `https://yourdomain.com/api/auth/callback/google`
5. For local testing: `http://localhost:3000/api/auth/callback/google`

**Environment Variables**:
```bash
AUTH_GOOGLE_ID=your-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-client-secret
NEXTAUTH_URL=https://yourdomain.com  # MUST match redirect URI domain
```

### Step 5: Test End-to-End Flow

**Test Script**:
1. Clear all cookies and localStorage
2. Navigate to `/en/auth/join`
3. Enter valid join code → click Validate
4. Fill in name, phone, zipcode
5. Click "Continue with Google"
6. **BEFORE Google redirect**: Open DevTools → Application → Cookies
7. Verify `join_ok` and `join_role` cookies exist
8. Complete Google OAuth
9. **AFTER redirect back**: Check server logs for signIn callback output
10. Note which decision was made and why

**Expected Flow**:
```
1. User validates join code
   → join_ok cookie set (expires in 15min)

2. User clicks "Continue with Google"
   → Redirects to Google

3. Google authenticates user
   → Redirects back to /api/auth/callback/google

4. NextAuth invokes signIn callback
   → Checks for existing user (new users: not found)
   → Checks for join_ok cookie

   IF COOKIE FOUND:
   ✅ Creates user in database
   ✅ Creates profile with join role
   ✅ Returns true
   ✅ Auth succeeds → redirect to verification page

   IF COOKIE MISSING:
   ❌ Returns redirect URL
   ❌ Auth BLOCKED
   ❌ No session created
   ❌ Redirected to signin → LOOP

5. Middleware checks for session
   → If no session → redirects to login
   → LOOP CONTINUES
```

---

## Recommended Implementation Plan

### Phase 1: Quick Fix (Strategy 2 + Strategy 4)

**Goal**: Stop the loop immediately

**Steps**:
1. Modify signIn callback to NOT return redirect for missing join code
2. Create placeholder users during OAuth
3. Add redirect callback to check join code post-auth
4. Verify cookie configuration

**Time**: 2-3 hours
**Risk**: Low
**Complexity**: Medium

### Phase 2: Proper Fix (Strategy 1)

**Goal**: Use database adapter for OAuth

**Steps**:
1. Add PrismaAdapter to authOptions
2. Test OAuth flow creates User + Account records
3. Verify join code check works for new vs existing users
4. Remove manual user creation from signIn callback (no longer needed)

**Time**: 1-2 hours
**Risk**: Low
**Complexity**: Low

### Phase 3: Hardening (Strategy 4 + Strategy 5)

**Goal**: Robust production deployment

**Steps**:
1. Add comprehensive logging
2. Implement middleware-based join code enforcement
3. Add cleanup for incomplete signups
4. Monitor cookie persistence in production
5. Add user-facing error messages

**Time**: 4-6 hours
**Risk**: Low
**Complexity**: Medium

---

## Testing Recommendations

### Test Case 1: New User with Valid Join Code
**Steps**:
1. Clear database test user
2. Validate join code
3. OAuth signup
4. **Expected**: User created, redirected to verification

### Test Case 2: New User without Join Code
**Steps**:
1. Clear database test user
2. Skip join code validation
3. OAuth signup
4. **Expected**: Redirect to join page (no loop)

### Test Case 3: Existing User with OAuth
**Steps**:
1. User already exists in database
2. OAuth signin (no join code needed)
3. **Expected**: Successful signin, no join code check

### Test Case 4: Existing User with Credentials
**Steps**:
1. User created via email/password
2. Login with credentials
3. **Expected**: Successful login

### Test Case 5: Cookie Expiration
**Steps**:
1. Validate join code
2. Wait 16 minutes (cookie expires)
3. Try OAuth signup
4. **Expected**: Proper error handling (no loop)

### Test Case 6: Production Environment
**Steps**:
1. Deploy to production
2. Test OAuth flow on HTTPS
3. Verify cookies persist through OAuth redirect
4. **Expected**: Successful signup

---

## Key Takeaways

1. **NextAuth JWT sessions DO NOT automatically create database users** - you must handle this manually or use an adapter

2. **signIn callback return values have special meanings** - returning a URL string BLOCKS authentication entirely

3. **Cookie configuration is critical** - sameSite: "none" + secure: true required for OAuth, but requires HTTPS

4. **The simplest fix is using PrismaAdapter** - let NextAuth handle OAuth user creation automatically

5. **Redirect callback is for successful auth routing** - signIn callback is for blocking/allowing auth

6. **Test thoroughly in production environment** - local development may behave differently with cookies

---

## Code Examples for Each Fix

### Example 1: Add Database Adapter

```typescript
// lib/auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma), // ✅ Add this line
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    // ... existing providers
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // With adapter, OAuth users are auto-created
      // Just check join code for NEW users

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { profile: true },
      });

      if (existingUser?.profile) {
        // User already has profile → existing user
        return true;
      }

      // New user - check join code
      const { cookies } = await import("next/headers");
      const joinOk = cookies().get("join_ok")?.value;

      if (!joinOk && account?.provider) {
        // ⚠️ User auto-created by adapter, but needs profile
        // Create minimal profile, require join code verification later
        if (user.id) {
          await prisma.userProfile.create({
            data: {
              userId: user.id,
              role: "salesperson",
              member: false,
              salespersonCode: `PENDING_${Date.now()}`,
            },
          });
        }
        // ✅ Return true to allow auth, redirect in redirect callback
        return true;
      }

      // Has join code - create full profile
      if (user.id && joinOk) {
        const joinRole = cookies().get("join_role")?.value || "salesperson";
        const salespersonCode = await generateUniqueSalespersonCode(joinRole, prisma);

        await prisma.userProfile.create({
          data: {
            userId: user.id,
            role: joinRole as "owner" | "manager" | "salesperson",
            member: true,
            salespersonCode,
          },
        });

        cookies().delete("join_ok");
        cookies().delete("join_role");
      }

      return true;
    },

    async redirect({ url, baseUrl }: any) {
      // Check if user needs join code verification
      const { cookies } = await import("next/headers");
      const joinOk = cookies().get("join_ok")?.value;

      if (!joinOk) {
        // Check if user profile is incomplete
        // (This requires getting user from session, which isn't available yet)
        // Better to handle in middleware
        return url.startsWith(baseUrl) ? url : baseUrl;
      }

      return url.startsWith(baseUrl) ? url : baseUrl;
    },

    // ... rest of callbacks
  },
};
```

### Example 2: Don't Block Auth in signIn Callback

```typescript
// lib/auth.ts - Modified approach
callbacks: {
  async signIn({ user, account, profile }: any) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { profile: true },
    });

    if (existingUser) {
      return true; // Existing users always allowed
    }

    // New OAuth user - create minimal user record
    if (account?.provider) {
      const newUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: new Date(), // OAuth emails pre-verified
        },
      });

      // Create incomplete profile
      await prisma.userProfile.create({
        data: {
          userId: newUser.id,
          role: "salesperson",
          member: false, // NOT a member until join code verified
          salespersonCode: `TEMP_${Date.now()}`,
        },
      });

      // ✅ ALWAYS return true - handle join code in middleware
      return true;
    }

    return true;
  },

  async redirect({ url, baseUrl }: any) {
    // After successful auth, check for join code requirement
    // This runs AFTER signIn callback succeeds

    const { cookies } = await import("next/headers");
    const joinOk = cookies().get("join_ok")?.value;

    // If no join code cookie, redirect to join page
    if (!joinOk) {
      return `${baseUrl}/en/auth/join?error=join_code_required`;
    }

    // Normal redirect
    return url.startsWith(baseUrl) ? url : baseUrl;
  },
}
```

### Example 3: Middleware Join Code Enforcement

```typescript
// middleware.ts - Enhanced version
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const DEFAULT_LANG = "en";
const LOGIN = `/${DEFAULT_LANG}/login`;
const AUTH_PREFIX = `/${DEFAULT_LANG}/auth`;
const DASHBOARD = `/${DEFAULT_LANG}/dashboard`;
const JOIN = `/${DEFAULT_LANG}/auth/join`;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow static files
  const ALLOW_STATIC = ["/_next", "/favicon.ico", "/api"];
  if (ALLOW_STATIC.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. Add /en prefix if missing
  if (!pathname.startsWith(`/${DEFAULT_LANG}`)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LANG}${pathname}`;
    return NextResponse.redirect(url);
  }

  // 3. Check authentication
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET
  });

  const isAuthRoute = pathname === LOGIN || pathname.startsWith(AUTH_PREFIX);

  // Not authenticated - redirect to login
  if (!token) {
    if (!isAuthRoute) {
      const url = req.nextUrl.clone();
      url.pathname = LOGIN;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 4. ✅ NEW: Check if authenticated user needs join code verification
  if (token.id && !isAuthRoute && pathname !== JOIN) {
    // Check if user profile is verified
    const { prisma } = await import("./lib/prisma");
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: token.id as string },
    });

    if (userProfile && !userProfile.member) {
      // User authenticated but not verified - redirect to join
      const url = req.nextUrl.clone();
      url.pathname = JOIN;
      url.searchParams.set("error", "join_code_required");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### Example 4: API Endpoint to Activate Membership

```typescript
// app/api/user/activate-membership/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateCodeAndGetRole } from "@/lib/joinCode";
import { generateUniqueSalespersonCode } from "@/lib/salespersonCode";

export async function POST(req: Request) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get join code from request
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    // Validate join code
    const role = validateCodeAndGetRole(code);
    if (!role) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate proper salesperson code
    const salespersonCode = await generateUniqueSalespersonCode(role, prisma);

    // Update profile to activate membership
    await prisma.userProfile.update({
      where: { userId: user.id },
      data: {
        member: true,
        role: role as "owner" | "manager" | "salesperson",
        salespersonCode,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Membership activated",
      role,
      salespersonCode,
    });

  } catch (error) {
    console.error("Membership activation error:", error);
    return NextResponse.json(
      { error: "Failed to activate membership" },
      { status: 500 }
    );
  }
}
```

### Example 5: Enhanced Join Page for Authenticated Users

```typescript
// app/[lang]/auth/join/page.tsx - Enhanced version
"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function JoinPage() {
  const { data: session, status } = useSession();
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);

  useEffect(() => {
    setIsAuthenticatedUser(!!session?.user);
  }, [session]);

  async function activateMembership() {
    if (!code.trim()) {
      setErr("Please enter a secret code");
      return;
    }

    setValidatingCode(true);

    // Authenticated users call different endpoint
    const res = await fetch("/api/user/activate-membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    setValidatingCode(false);

    if (res.ok) {
      // Membership activated - redirect to dashboard
      window.location.href = `/${DEFAULT_LANG}/dashboard`;
    } else {
      const data = await res.json();
      setErr(data?.error || "Invalid or expired code");
    }
  }

  return (
    <main>
      {isAuthenticatedUser ? (
        <div>
          <h1>Activate Your Membership</h1>
          <p>You're signed in as {session?.user?.email}</p>
          <p>Enter your secret code to activate full access:</p>

          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
          />

          <button onClick={activateMembership}>
            Activate Membership
          </button>
        </div>
      ) : (
        // ... existing signup flow for non-authenticated users ...
        <div>
          {/* Original join page content */}
        </div>
      )}
    </main>
  );
}
```

---

## Final Recommendations

### Immediate Action (Today)
1. **Enable debug logging** in authOptions
2. **Test OAuth flow** and capture logs
3. **Verify cookie persistence** in browser DevTools
4. **Check NEXTAUTH_URL** in production environment

### Short-term Fix (This Week)
1. **Implement Strategy 1**: Add PrismaAdapter
2. **Test thoroughly**: All 6 test cases above
3. **Deploy to production**: Monitor logs

### Long-term Enhancement (Next Sprint)
1. **Implement middleware enforcement** (Strategy 5)
2. **Add cleanup job** for incomplete signups
3. **Improve error messages** for users
4. **Add monitoring/alerts** for auth failures

---

## Additional Resources

- **NextAuth v4 Callbacks**: https://next-auth.js.org/configuration/callbacks
- **NextAuth JWT Sessions**: https://next-auth.js.org/configuration/options#session
- **Prisma Adapter**: https://next-auth.js.org/adapters/prisma
- **OAuth Debugging**: https://next-auth.js.org/errors
- **Cookie Configuration**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies

---

## Summary

The OAuth callback loop is caused by:
1. JWT sessions without adapter = no automatic user creation
2. signIn callback returns redirect URL for missing join_ok cookie
3. Returning a redirect from signIn callback BLOCKS authentication
4. No session created → middleware redirects to login → infinite loop

**Best fix**: Use PrismaAdapter to auto-create OAuth users, then only check join code for truly new users (those without UserProfile records).

**Quick fix**: Don't return redirects from signIn callback - always return true and handle join code validation in redirect callback or middleware.

Both approaches prevent the loop while maintaining join code security.
