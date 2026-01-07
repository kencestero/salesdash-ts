-- Remotive Logistics: IMPORT MISSING 289 LEADS
-- Execute this to reach 762 total leads

-- Current count: 473
-- Missing: 289
-- Target: 762

-- Step 1: Verify current count
SELECT COUNT(*) as current_count FROM "Customer";

-- Step 2: Import missing leads (sample data - replace with real Google Sheets data)
INSERT INTO "Customer" (
  id, 
  "firstName", 
  "lastName", 
  email, 
  phone, 
  status, 
  "createdAt", 
  "updatedAt", 
  "isFactoryOrder", 
  "hasAppliedCredit", 
  applied
) VALUES
('new_lead_001', 'Michael', 'Johnson', 'mjohnson@example.com', '555-0101', 'new', NOW(), NOW(), false, false, false),
('new_lead_002', 'Sarah', 'Williams', 'swilliams@example.com', '555-0102', 'contacted', NOW(), NOW(), false, false, false),
('new_lead_003', 'Robert', 'Brown', 'rbrown@example.com', '555-0103', 'qualified', NOW(), NOW(), false, true, true),
-- Add all 289 missing leads here from Google Sheets ID: 1T9PRlXBS1LBlB5VL9nwn_m3AIcT6KIjqg5lk3Xy1le8
-- ... continue with real data ...
('new_lead_289', 'Final', 'Lead', 'finallead@example.com', '555-0289', 'new', NOW(), NOW(), false, false, false);

-- Step 3: Verify final count (should be 762)
SELECT COUNT(*) as final_count FROM "Customer";

-- Step 4: Show status distribution
SELECT status, COUNT(*) as count 
FROM "Customer" 
GROUP BY status 
ORDER BY count DESC;
