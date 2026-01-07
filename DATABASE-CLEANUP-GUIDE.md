# Remotive SalesHub Database Cleanup Guide

## Overview

This guide will help you safely clean up the Remotive SalesHub database by removing all personal data, leads, and user information while preserving the system tools and infrastructure.

## ⚠️ CRITICAL: Before You Start

### 1. Create a Full Database Backup

**Using Neon Console (Recommended):**
1. Go to https://console.neon.tech
2. Select your project
3. Navigate to "Branches" tab
4. Click "Create Branch" from main
5. Name it `backup-before-cleanup-YYYY-MM-DD`

**Using pg_dump (Alternative):**
```bash
# Get your database URL from .env
# Format: postgresql://user:password@host:5432/database

pg_dump "YOUR_DATABASE_URL" > backup-$(date +%Y%m%d-%H%M%S).sql
```

### 2. Test in Development First

If you have a staging/development database:
```bash
# Set dev database URL
export DATABASE_URL="your-dev-database-url"

# Run dry run
node cleanup-database.js --dry-run
```

### 3. Verify Your Environment

```bash
# Make sure you're using the correct database
echo $DATABASE_URL

# Or check .env file
cat .env | grep DATABASE_URL
```

## What Will Be Deleted

The cleanup will permanently remove:

### Personal & Business Data
- ✗ **Users** - All user accounts and profiles
- ✗ **Customers** - All CRM contacts and leads
- ✗ **Leads** - All lead tracking data
- ✗ **Activities** - All customer interactions (calls, emails, meetings, notes, tasks)
- ✗ **Emails** - All email logs
- ✗ **Quotes** - All finance quotes and quote activities
- ✗ **Credit Applications** - All credit app submissions
- ✗ **Deals** - All sales opportunities
- ✗ **Messages** - All internal team messages
- ✗ **Calendar Events** - All personal and company events
- ✗ **Sessions** - All active user sessions
- ✗ **OAuth Accounts** - All Google/GitHub linked accounts
- ✗ **Dashboard Visits** - All analytics tracking data

### What Will Be Preserved

The cleanup will keep:

- ✓ **Trailers** - All inventory data (VINs, specs, pricing, images)
- ✓ **Email Templates** - System email templates
- ✓ **Pricing Policies** - System-wide pricing configurations
- ✓ **Help Articles** - Documentation and help content
- ✓ **Upload Reports** - Inventory import logs

## Cleanup Methods

### Method 1: Node.js Script (Recommended)

The Node.js script provides better error handling, logging, and confirmation prompts.

#### Dry Run (Safe - No Changes)
```bash
node cleanup-database.js --dry-run
```

This will show you:
- Current database counts
- What would be deleted
- What would be preserved
- No actual changes will be made

#### Interactive Cleanup
```bash
node cleanup-database.js
```

This will:
- Show current counts
- Ask for double confirmation
- Execute cleanup in a transaction
- Show final counts and verification

#### Automatic Cleanup (Skip Confirmations)
```bash
# ⚠️ Use with extreme caution!
node cleanup-database.js --confirm
```

### Method 2: Direct SQL (Advanced)

If you prefer to use SQL directly:

```bash
# Using psql
psql "$DATABASE_URL" -f cleanup-database.sql

# Or using Prisma Studio
npx prisma studio
# Then execute queries manually
```

**IMPORTANT:** The SQL file ends with commented COMMIT/ROLLBACK. You must:
1. Review the verification counts
2. Uncomment `COMMIT;` if everything looks correct
3. Or uncomment `ROLLBACK;` to undo changes

## Step-by-Step Cleanup Process

### Step 1: Backup (CRITICAL)

```bash
# Create Neon branch backup
# - Go to Neon Console
# - Create branch from main
# - Name: backup-before-cleanup-2025-01-XX
```

### Step 2: Dry Run

```bash
node cleanup-database.js --dry-run
```

**Review the output carefully:**
- Check "Data to be DELETED" section
- Verify "Data to be PRESERVED" section
- Make sure counts match expectations

### Step 3: Execute Cleanup

```bash
node cleanup-database.js
```

**During execution:**
- Review the counts displayed
- Read the warnings
- Type "yes" when prompted (twice for safety)
- Watch the progress logs

### Step 4: Verification

The script will automatically show:
- Final database counts
- Verification status
- Any warnings or errors

**Manual verification queries:**
```sql
-- Should all return 0
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Customer";
SELECT COUNT(*) FROM "Lead";
SELECT COUNT(*) FROM "Activity";

-- Should still have data
SELECT COUNT(*) FROM "Trailer";
SELECT COUNT(*) FROM "EmailTemplate";
SELECT COUNT(*) FROM "HelpArticle";
```

### Step 5: Test Application

After cleanup:
1. Try to access the dashboard (should redirect to login)
2. Verify no user can log in (no users exist)
3. Check inventory pages (trailers should still be visible)
4. Verify email templates still exist

## Rollback (If Needed)

### If You Used Neon Branch Backup:

1. Go to Neon Console
2. Select your backup branch
3. Click "Set as Primary"
4. Your data is restored

### If You Have pg_dump Backup:

```bash
# Drop and recreate database (or create new)
psql "$DATABASE_URL" < backup-YYYYMMDD-HHMMSS.sql
```

## Expected Results

After successful cleanup:

```
✓ Users: 0
✓ Customers: 0
✓ Leads: 0
✓ Activities: 0
✓ Emails: 0
✓ Quotes: 0
✓ Credit Applications: 0
✓ Deals: 0
✓ Messages: 0
✓ Calendar Events: 0

✓ Trailers: [your inventory count]
✓ Email Templates: [your template count]
✓ Help Articles: [your help content count]
✓ Pricing Policies: [your policy count]
```

## Post-Cleanup Steps

### 1. Update Environment Variables

You may want to disable certain features:

```env
# .env
# Optionally disable OAuth if no users will log in
# AUTH_GOOGLE_ID=
# AUTH_GOOGLE_SECRET=
# AUTH_GITHUB_ID=
# AUTH_GITHUB_SECRET=
```

### 2. Deploy Changes (If Needed)

```bash
# If you made any code changes
vercel --prod
```

### 3. Update Documentation

Update any documentation to reflect that the site is now:
- Tools/inventory showcase only
- No user accounts or CRM functionality
- Clean demo state

## Troubleshooting

### Error: "Foreign key constraint violation"

**Cause:** The deletion order wasn't followed correctly.

**Solution:** The script uses transactions, so this would automatically rollback. If using SQL, check the deletion order in `cleanup-database.sql`.

### Error: "Cannot connect to database"

**Cause:** DATABASE_URL is incorrect or database is unavailable.

**Solution:**
```bash
# Check your connection
npx prisma studio

# Verify DATABASE_URL
echo $DATABASE_URL
```

### Script Hangs or Times Out

**Cause:** Large dataset taking a long time.

**Solution:**
- This is normal for large databases
- The transaction ensures atomicity
- Wait for completion (may take several minutes)

### Want to Keep Some Users

**Solution:** Modify the script before running:

```javascript
// In cleanup-database.js, change Phase 4:

// Instead of deleting all users:
const userCount = await tx.user.deleteMany({});

// Delete all except specific users:
const userCount = await tx.user.deleteMany({
  where: {
    email: {
      notIn: ['admin@example.com', 'keeper@example.com']
    }
  }
});
```

## Safety Checklist

Before running cleanup, verify:

- [ ] Full database backup created (Neon branch or pg_dump)
- [ ] Ran dry run and reviewed counts
- [ ] Verified DATABASE_URL points to correct database
- [ ] Tested in dev/staging environment first (if available)
- [ ] Reviewed what will be deleted vs preserved
- [ ] Have rollback plan ready
- [ ] Understand this is permanent and irreversible

## Support

If you encounter issues:

1. Check the error message carefully
2. Review this guide's troubleshooting section
3. Check your database backup is intact
4. If needed, rollback using backup
5. Review Prisma schema for relationship changes

## Additional Notes

### Why Use Transactions?

The cleanup script wraps all deletions in a transaction:
- **Atomicity:** All deletions succeed or all fail
- **Safety:** If any error occurs, everything is rolled back
- **Consistency:** Database remains in valid state

### Cascade Deletions

Some models have `onDelete: Cascade` in the schema:
- Deleting a User automatically deletes their UserProfile
- Deleting a Customer automatically deletes their Activities
- This is handled automatically by Prisma

### Orphaned References

The script includes cleanup for non-FK fields:
- Trailer `assignedToUserId` is set to NULL
- This prevents orphaned user references

---

**Last Updated:** 2025-01-21
**Script Version:** 1.0
**Database:** PostgreSQL (Neon)
