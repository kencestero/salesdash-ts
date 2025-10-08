-- Migration script for production Vercel Postgres database
-- Run this in your Vercel Postgres dashboard SQL editor

-- Add password field to User table (for email/password authentication)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- Add firstName field to UserProfile table
ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "firstName" TEXT;

-- Add lastName field to UserProfile table
ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "lastName" TEXT;

-- Add salespersonCode field to UserProfile table (unique constraint)
ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "salespersonCode" TEXT;

-- Add unique constraint on salespersonCode (only if column was just created)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'UserProfile_salespersonCode_key'
  ) THEN
    ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_salespersonCode_key" UNIQUE ("salespersonCode");
  END IF;
END $$;

-- Create index on salespersonCode for better query performance
CREATE INDEX IF NOT EXISTS "UserProfile_salespersonCode_idx" ON "UserProfile"("salespersonCode");

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'User' AND column_name = 'password';

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'UserProfile' AND column_name IN ('firstName', 'lastName', 'salespersonCode');
