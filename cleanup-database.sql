-- ============================================================================
-- MJ SalesDash Database Cleanup Script
-- ============================================================================
-- PURPOSE: Remove all personal data, leads, and user information while
--          preserving system tools, templates, and infrastructure
--
-- ⚠️  WARNING: THIS IS A DESTRUCTIVE OPERATION - MAKE A BACKUP FIRST!
--
-- Before running this script:
-- 1. Create a full database backup
-- 2. Verify you have the correct DATABASE_URL
-- 3. Test in a development environment first
-- 4. Review each section carefully
-- ============================================================================

BEGIN;

-- ============================================================================
-- PHASE 1: Delete dependent records first (prevent FK violations)
-- ============================================================================

-- Delete all activities (linked to customers and users)
DELETE FROM "Activity";

-- Delete all calendar events
DELETE FROM "CalendarEvent";

-- Delete all emails
DELETE FROM "Email";

-- Delete all quotes and their activities
DELETE FROM "QuoteActivity";
DELETE FROM "Quote";

-- Delete all deals
DELETE FROM "Deal";

-- Delete all credit applications
DELETE FROM "CreditApplication";

-- ============================================================================
-- PHASE 2: Delete chat system data
-- ============================================================================

-- Firebase chat is external, but clean up any local references
DELETE FROM "Conversation";
DELETE FROM "Message";

-- Delete internal messages
DELETE FROM "internal_messages";

-- ============================================================================
-- PHASE 3: Delete customer/lead data
-- ============================================================================

-- Delete all customers (CRM leads)
DELETE FROM "Customer";

-- Delete all leads
DELETE FROM "Lead";

-- ============================================================================
-- PHASE 4: Delete user-specific data
-- ============================================================================

-- Delete dashboard visits
DELETE FROM "DashboardVisit";

-- Delete user sessions
DELETE FROM "Session";

-- Delete OAuth accounts
DELETE FROM "Account";

-- Delete verification tokens
DELETE FROM "VerificationToken";

-- Delete pending users
DELETE FROM "PendingUser";

-- Delete user profiles (will cascade delete related data)
DELETE FROM "UserProfile";

-- Delete all users
DELETE FROM "User";

-- ============================================================================
-- PHASE 5: Clean up orphaned references
-- ============================================================================

-- Reset any trailer assignments (if they reference deleted users)
UPDATE "Trailer"
SET "assignedToUserId" = NULL
WHERE "assignedToUserId" IS NOT NULL;

-- ============================================================================
-- PHASE 6: Optional - Reset email templates to system defaults
-- ============================================================================

-- Keep email templates but remove any user-created ones
-- (Skip this if you want to keep all templates)
-- DELETE FROM "EmailTemplate" WHERE "isSystem" = false;

-- ============================================================================
-- PHASE 7: Verification and cleanup
-- ============================================================================

-- These models should remain untouched:
-- - Trailer (inventory)
-- - EmailTemplate (system templates)
-- - PricingPolicy (system config)
-- - HelpArticle (documentation)
-- - UploadReport (import logs)

-- ============================================================================
-- COMMIT OR ROLLBACK
-- ============================================================================

-- Review counts before committing:
SELECT 'Users remaining' AS check_name, COUNT(*) AS count FROM "User"
UNION ALL
SELECT 'Customers remaining', COUNT(*) FROM "Customer"
UNION ALL
SELECT 'Leads remaining', COUNT(*) FROM "Lead"
UNION ALL
SELECT 'Activities remaining', COUNT(*) FROM "Activity"
UNION ALL
SELECT 'Emails remaining', COUNT(*) FROM "Email"
UNION ALL
SELECT 'Quotes remaining', COUNT(*) FROM "Quote"
UNION ALL
SELECT 'Credit Apps remaining', COUNT(*) FROM "CreditApplication"
UNION ALL
SELECT 'Trailers remaining', COUNT(*) FROM "Trailer"
UNION ALL
SELECT 'Email Templates remaining', COUNT(*) FROM "EmailTemplate"
UNION ALL
SELECT 'Help Articles remaining', COUNT(*) FROM "HelpArticle";

-- If everything looks correct, uncomment the next line:
-- COMMIT;

-- If you need to undo, uncomment the next line instead:
-- ROLLBACK;
