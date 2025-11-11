-- CreateEnum
CREATE TYPE "public"."PricingMode" AS ENUM ('CASH', 'FINANCE', 'RTO');

-- CreateEnum
CREATE TYPE "public"."QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'CONVERTED', 'EXPIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."QuoteAction" AS ENUM ('CREATED', 'VIEWED_BY_REP', 'VIEWED_BY_CUSTOMER', 'EDITED', 'LINK_GENERATED', 'LINK_CLICKED', 'PDF_GENERATED', 'PDF_DOWNLOADED', 'EMAIL_SENT', 'SMS_SENT', 'FORMULA_COPIED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED_TO_SALE');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."CreditFinancingType" AS ENUM ('cash', 'finance', 'rto');

-- CreateEnum
CREATE TYPE "public"."CreditStatus" AS ENUM ('draft', 'submitted', 'sent_to_lender', 'decision_approved', 'decision_declined', 'canceled');

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "image" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."pending_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "zipcode" TEXT,
    "role" TEXT NOT NULL DEFAULT 'salesperson',
    "managerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'employee',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "preferredName" TEXT,
    "phone" TEXT,
    "zipcode" TEXT,
    "city" TEXT,
    "about" TEXT,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "zip" TEXT,
    "salespersonCode" TEXT,
    "role" TEXT NOT NULL DEFAULT 'salesperson',
    "member" BOOLEAN NOT NULL DEFAULT false,
    "needsJoinCode" BOOLEAN NOT NULL DEFAULT false,
    "repCode" TEXT,
    "managerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'employee',
    "accountStatus" TEXT NOT NULL DEFAULT 'active',
    "banReason" TEXT,
    "timeoutUntil" TIMESTAMP(3),
    "mutedUntil" TIMESTAMP(3),
    "canAccessCRM" BOOLEAN NOT NULL DEFAULT true,
    "canAccessInventory" BOOLEAN NOT NULL DEFAULT true,
    "canAccessConfigurator" BOOLEAN NOT NULL DEFAULT true,
    "canAccessCalendar" BOOLEAN NOT NULL DEFAULT true,
    "canAccessReports" BOOLEAN NOT NULL DEFAULT false,
    "canManageUsers" BOOLEAN NOT NULL DEFAULT false,
    "isAvailableAsManager" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Trailer" (
    "id" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "stockNumber" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION,
    "gvwr" INTEGER,
    "capacity" INTEGER,
    "axles" INTEGER,
    "msrp" DOUBLE PRECISION NOT NULL,
    "salePrice" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "makeOffer" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'available',
    "location" TEXT,
    "images" TEXT[],
    "description" TEXT,
    "features" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "soldAt" TIMESTAMP(3),
    "soldBy" TEXT,

    CONSTRAINT "Trailer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipcode" TEXT,
    "companyName" TEXT,
    "businessType" TEXT,
    "assignedTo" TEXT,
    "assignedToId" TEXT,
    "assignedToName" TEXT,
    "salesRepName" TEXT,
    "backupRepId" TEXT,
    "lastContactDate" TIMESTAMP(3),
    "nextFollowUpDate" TIMESTAMP(3),
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "trailerSize" TEXT,
    "trailerType" TEXT,
    "stockNumber" TEXT,
    "financingType" TEXT,
    "isFactoryOrder" BOOLEAN NOT NULL DEFAULT false,
    "hasAppliedCredit" BOOLEAN NOT NULL DEFAULT false,
    "creditAppStatus" TEXT,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "dateApplied" TIMESTAMP(3),
    "tags" TEXT[],
    "notes" TEXT,
    "managerNotes" TEXT,
    "repNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastContactedAt" TIMESTAMP(3),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Deal" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "trailerId" TEXT,
    "dealNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dealType" TEXT NOT NULL,
    "offeredPrice" DOUBLE PRECISION NOT NULL,
    "finalPrice" DOUBLE PRECISION,
    "tradeInValue" DOUBLE PRECISION,
    "tradeInDesc" TEXT,
    "deposit" DOUBLE PRECISION,
    "financeAmount" DOUBLE PRECISION,
    "downPayment" DOUBLE PRECISION,
    "apr" DOUBLE PRECISION,
    "term" INTEGER,
    "monthlyPayment" DOUBLE PRECISION,
    "salespersonId" TEXT NOT NULL,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "expectedCloseDate" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CreditApplication" (
    "id" TEXT NOT NULL,
    "appNumber" TEXT NOT NULL,
    "shareToken" TEXT,
    "shareEnabled" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "customerId" TEXT,
    "trailerId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipcode" TEXT,
    "ssn" TEXT,
    "dob" TIMESTAMP(3),
    "driverLicense" TEXT,
    "dlState" TEXT,
    "employer" TEXT,
    "jobTitle" TEXT,
    "employmentYears" INTEGER,
    "monthlyIncome" DOUBLE PRECISION,
    "housingStatus" TEXT,
    "monthlyPayment" DOUBLE PRECISION,
    "yearsAtAddress" INTEGER,
    "requestedAmount" DOUBLE PRECISION,
    "requestedTerm" INTEGER,
    "equipmentType" TEXT,
    "equipmentDesc" TEXT,
    "references" JSONB,
    "signatureData" TEXT,
    "signedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "legalConsent" BOOLEAN NOT NULL DEFAULT false,
    "legalText" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "approvedAmount" DOUBLE PRECISION,
    "approvedTerm" INTEGER,
    "approvedApr" DOUBLE PRECISION,
    "lender" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "CreditApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Email" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT[],
    "cc" TEXT[],
    "bcc" TEXT[],
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "htmlBody" TEXT,
    "attachments" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sentAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" TIMESTAMP(3),
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "clickedAt" TIMESTAMP(3),
    "customerId" TEXT,
    "userId" TEXT NOT NULL,
    "templateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "htmlBody" TEXT,
    "variables" TEXT[],
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Quote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "salespersonCode" TEXT NOT NULL,
    "trailerId" TEXT,
    "customerId" TEXT,
    "mode" "public"."PricingMode" NOT NULL DEFAULT 'FINANCE',
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "downPayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "termMonths" INTEGER NOT NULL,
    "apr" DOUBLE PRECISION,
    "monthlyPayment" DOUBLE PRECISION,
    "totalInterest" DOUBLE PRECISION,
    "principal" DOUBLE PRECISION,
    "monthlyRent" DOUBLE PRECISION,
    "monthlyTax" DOUBLE PRECISION,
    "docFee" DOUBLE PRECISION,
    "buyoutFee" DOUBLE PRECISION,
    "rtoPrice" DOUBLE PRECISION,
    "totalCash" DOUBLE PRECISION,
    "status" "public"."QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "shareToken" TEXT,
    "shareEnabled" BOOLEAN NOT NULL DEFAULT false,
    "visibilitySettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuoteActivity" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "userId" TEXT,
    "salespersonCode" TEXT,
    "actorType" TEXT NOT NULL,
    "actorName" TEXT,
    "action" "public"."QuoteAction" NOT NULL,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "durationMs" INTEGER,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PricingPolicy" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "rtoBaseMarkupUsd" DOUBLE PRECISION NOT NULL DEFAULT 1400,
    "rtoMonthlyFactor" DOUBLE PRECISION NOT NULL DEFAULT 0.035,
    "rtoMinDownUsd" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "rtoDocFeeUsd" DOUBLE PRECISION NOT NULL DEFAULT 99,
    "rtoBuyoutFeeUsd" DOUBLE PRECISION NOT NULL DEFAULT 250,
    "rtoDefaultTermMonths" INTEGER NOT NULL DEFAULT 36,
    "defaultApr" DOUBLE PRECISION NOT NULL DEFAULT 8.99,
    "defaultTermMonths" INTEGER NOT NULL DEFAULT 60,
    "defaultFees" DOUBLE PRECISION NOT NULL DEFAULT 125,
    "quoteExpirationDays" INTEGER NOT NULL DEFAULT 90,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UploadReport" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "totalInUpload" INTEGER NOT NULL,
    "newTrailers" INTEGER NOT NULL,
    "updatedTrailers" INTEGER NOT NULL,
    "removedTrailers" INTEGER NOT NULL,
    "newVins" TEXT[],
    "updatedVins" TEXT[],
    "removedVins" TEXT[],
    "processingTime" INTEGER,
    "errors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CalendarEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "eventType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "userId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdByRole" TEXT,
    "isAnnouncement" BOOLEAN NOT NULL DEFAULT false,
    "visibleToRoles" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadNote" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "noteType" TEXT NOT NULL DEFAULT 'general',
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrailerRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "vin" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignedTo" TEXT,
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrailerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RequestLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "zip" TEXT,
    "manufacturer" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'en',
    "ip" TEXT,
    "userAgent" TEXT,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "submittedByUserId" TEXT,
    "submittedByName" TEXT,
    "submittedByEmail" TEXT,
    "repCode" TEXT,
    "managerId" TEXT,
    "managerNotified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HelpArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "category" TEXT NOT NULL,
    "keywords" TEXT[],
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "HelpArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatThread" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subject" TEXT,

    CONSTRAINT "ChatThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatParticipant" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "body" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatAttachment" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "ChatAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CreditApp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repCode" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "zip" TEXT,
    "city" TEXT,
    "state" TEXT,
    "price" DOUBLE PRECISION,
    "down" DOUBLE PRECISION,
    "apr" DOUBLE PRECISION,
    "termMonths" INTEGER,
    "financingType" "public"."CreditFinancingType" NOT NULL,
    "status" "public"."CreditStatus" NOT NULL DEFAULT 'submitted',
    "notes" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CreditAppEvent" (
    "id" TEXT NOT NULL,
    "creditAppId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditAppEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "public"."Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "public"."User"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "pending_users_email_key" ON "public"."pending_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pending_users_token_key" ON "public"."pending_users"("token");

-- CreateIndex
CREATE INDEX "pending_users_token_idx" ON "public"."pending_users"("token");

-- CreateIndex
CREATE INDEX "pending_users_email_idx" ON "public"."pending_users"("email");

-- CreateIndex
CREATE INDEX "pending_users_expiresAt_idx" ON "public"."pending_users"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "public"."UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_salespersonCode_key" ON "public"."UserProfile"("salespersonCode");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_repCode_key" ON "public"."UserProfile"("repCode");

-- CreateIndex
CREATE INDEX "UserProfile_userId_idx" ON "public"."UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_role_idx" ON "public"."UserProfile"("role");

-- CreateIndex
CREATE INDEX "UserProfile_member_idx" ON "public"."UserProfile"("member");

-- CreateIndex
CREATE INDEX "UserProfile_salespersonCode_idx" ON "public"."UserProfile"("salespersonCode");

-- CreateIndex
CREATE INDEX "UserProfile_repCode_idx" ON "public"."UserProfile"("repCode");

-- CreateIndex
CREATE INDEX "UserProfile_managerId_idx" ON "public"."UserProfile"("managerId");

-- CreateIndex
CREATE INDEX "UserProfile_accountStatus_idx" ON "public"."UserProfile"("accountStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Trailer_vin_key" ON "public"."Trailer"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "Trailer_stockNumber_key" ON "public"."Trailer"("stockNumber");

-- CreateIndex
CREATE INDEX "Trailer_status_idx" ON "public"."Trailer"("status");

-- CreateIndex
CREATE INDEX "Trailer_category_idx" ON "public"."Trailer"("category");

-- CreateIndex
CREATE INDEX "Trailer_manufacturer_idx" ON "public"."Trailer"("manufacturer");

-- CreateIndex
CREATE INDEX "Trailer_soldBy_idx" ON "public"."Trailer"("soldBy");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "public"."Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "public"."Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "public"."Customer"("status");

-- CreateIndex
CREATE INDEX "Customer_assignedTo_idx" ON "public"."Customer"("assignedTo");

-- CreateIndex
CREATE INDEX "Customer_assignedToId_idx" ON "public"."Customer"("assignedToId");

-- CreateIndex
CREATE INDEX "Customer_nextFollowUpDate_idx" ON "public"."Customer"("nextFollowUpDate");

-- CreateIndex
CREATE INDEX "Customer_hasAppliedCredit_idx" ON "public"."Customer"("hasAppliedCredit");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_dealNumber_key" ON "public"."Deal"("dealNumber");

-- CreateIndex
CREATE INDEX "Deal_customerId_idx" ON "public"."Deal"("customerId");

-- CreateIndex
CREATE INDEX "Deal_trailerId_idx" ON "public"."Deal"("trailerId");

-- CreateIndex
CREATE INDEX "Deal_salespersonId_idx" ON "public"."Deal"("salespersonId");

-- CreateIndex
CREATE INDEX "Deal_status_idx" ON "public"."Deal"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CreditApplication_appNumber_key" ON "public"."CreditApplication"("appNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CreditApplication_shareToken_key" ON "public"."CreditApplication"("shareToken");

-- CreateIndex
CREATE INDEX "CreditApplication_customerId_idx" ON "public"."CreditApplication"("customerId");

-- CreateIndex
CREATE INDEX "CreditApplication_status_idx" ON "public"."CreditApplication"("status");

-- CreateIndex
CREATE INDEX "CreditApplication_createdBy_idx" ON "public"."CreditApplication"("createdBy");

-- CreateIndex
CREATE INDEX "CreditApplication_shareToken_idx" ON "public"."CreditApplication"("shareToken");

-- CreateIndex
CREATE INDEX "CreditApplication_email_idx" ON "public"."CreditApplication"("email");

-- CreateIndex
CREATE INDEX "Activity_customerId_idx" ON "public"."Activity"("customerId");

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "public"."Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "public"."Activity"("type");

-- CreateIndex
CREATE INDEX "Activity_dueDate_idx" ON "public"."Activity"("dueDate");

-- CreateIndex
CREATE INDEX "Email_customerId_idx" ON "public"."Email"("customerId");

-- CreateIndex
CREATE INDEX "Email_userId_idx" ON "public"."Email"("userId");

-- CreateIndex
CREATE INDEX "Email_status_idx" ON "public"."Email"("status");

-- CreateIndex
CREATE INDEX "Email_sentAt_idx" ON "public"."Email"("sentAt");

-- CreateIndex
CREATE INDEX "EmailTemplate_category_idx" ON "public"."EmailTemplate"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_shareToken_key" ON "public"."Quote"("shareToken");

-- CreateIndex
CREATE INDEX "Quote_salespersonCode_idx" ON "public"."Quote"("salespersonCode");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "public"."Quote"("status");

-- CreateIndex
CREATE INDEX "Quote_trailerId_idx" ON "public"."Quote"("trailerId");

-- CreateIndex
CREATE INDEX "Quote_customerId_idx" ON "public"."Quote"("customerId");

-- CreateIndex
CREATE INDEX "Quote_userId_idx" ON "public"."Quote"("userId");

-- CreateIndex
CREATE INDEX "Quote_expiresAt_idx" ON "public"."Quote"("expiresAt");

-- CreateIndex
CREATE INDEX "QuoteActivity_quoteId_idx" ON "public"."QuoteActivity"("quoteId");

-- CreateIndex
CREATE INDEX "QuoteActivity_salespersonCode_idx" ON "public"."QuoteActivity"("salespersonCode");

-- CreateIndex
CREATE INDEX "QuoteActivity_action_idx" ON "public"."QuoteActivity"("action");

-- CreateIndex
CREATE INDEX "QuoteActivity_occurredAt_idx" ON "public"."QuoteActivity"("occurredAt");

-- CreateIndex
CREATE INDEX "UploadReport_manufacturer_idx" ON "public"."UploadReport"("manufacturer");

-- CreateIndex
CREATE INDEX "UploadReport_uploadedBy_idx" ON "public"."UploadReport"("uploadedBy");

-- CreateIndex
CREATE INDEX "UploadReport_createdAt_idx" ON "public"."UploadReport"("createdAt");

-- CreateIndex
CREATE INDEX "CalendarEvent_userId_idx" ON "public"."CalendarEvent"("userId");

-- CreateIndex
CREATE INDEX "CalendarEvent_eventType_idx" ON "public"."CalendarEvent"("eventType");

-- CreateIndex
CREATE INDEX "CalendarEvent_category_idx" ON "public"."CalendarEvent"("category");

-- CreateIndex
CREATE INDEX "CalendarEvent_start_idx" ON "public"."CalendarEvent"("start");

-- CreateIndex
CREATE INDEX "CalendarEvent_end_idx" ON "public"."CalendarEvent"("end");

-- CreateIndex
CREATE INDEX "CalendarEvent_isAnnouncement_idx" ON "public"."CalendarEvent"("isAnnouncement");

-- CreateIndex
CREATE INDEX "LeadNote_customerId_idx" ON "public"."LeadNote"("customerId");

-- CreateIndex
CREATE INDEX "LeadNote_authorId_idx" ON "public"."LeadNote"("authorId");

-- CreateIndex
CREATE INDEX "LeadNote_createdAt_idx" ON "public"."LeadNote"("createdAt");

-- CreateIndex
CREATE INDEX "TrailerRequest_status_idx" ON "public"."TrailerRequest"("status");

-- CreateIndex
CREATE INDEX "RequestLog_createdAt_idx" ON "public"."RequestLog"("createdAt");

-- CreateIndex
CREATE INDEX "RequestLog_email_idx" ON "public"."RequestLog"("email");

-- CreateIndex
CREATE INDEX "RequestLog_manufacturer_idx" ON "public"."RequestLog"("manufacturer");

-- CreateIndex
CREATE INDEX "RequestLog_purpose_idx" ON "public"."RequestLog"("purpose");

-- CreateIndex
CREATE INDEX "RequestLog_submittedByUserId_idx" ON "public"."RequestLog"("submittedByUserId");

-- CreateIndex
CREATE INDEX "RequestLog_repCode_idx" ON "public"."RequestLog"("repCode");

-- CreateIndex
CREATE INDEX "RequestLog_managerId_idx" ON "public"."RequestLog"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "HelpArticle_slug_key" ON "public"."HelpArticle"("slug");

-- CreateIndex
CREATE INDEX "HelpArticle_category_idx" ON "public"."HelpArticle"("category");

-- CreateIndex
CREATE INDEX "HelpArticle_isPublished_idx" ON "public"."HelpArticle"("isPublished");

-- CreateIndex
CREATE INDEX "HelpArticle_isPinned_idx" ON "public"."HelpArticle"("isPinned");

-- CreateIndex
CREATE INDEX "HelpArticle_slug_idx" ON "public"."HelpArticle"("slug");

-- CreateIndex
CREATE INDEX "ChatParticipant_threadId_idx" ON "public"."ChatParticipant"("threadId");

-- CreateIndex
CREATE INDEX "ChatParticipant_userId_idx" ON "public"."ChatParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipant_threadId_userId_key" ON "public"."ChatParticipant"("threadId", "userId");

-- CreateIndex
CREATE INDEX "ChatMessage_threadId_idx" ON "public"."ChatMessage"("threadId");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_idx" ON "public"."ChatMessage"("senderId");

-- CreateIndex
CREATE INDEX "ChatAttachment_messageId_idx" ON "public"."ChatAttachment"("messageId");

-- CreateIndex
CREATE INDEX "CreditApp_phone_createdAt_idx" ON "public"."CreditApp"("phone", "createdAt");

-- CreateIndex
CREATE INDEX "CreditApp_userId_createdAt_idx" ON "public"."CreditApp"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CreditAppEvent_creditAppId_createdAt_idx" ON "public"."CreditAppEvent"("creditAppId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deal" ADD CONSTRAINT "Deal_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deal" ADD CONSTRAINT "Deal_trailerId_fkey" FOREIGN KEY ("trailerId") REFERENCES "public"."Trailer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CreditApplication" ADD CONSTRAINT "CreditApplication_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CreditApplication" ADD CONSTRAINT "CreditApplication_trailerId_fkey" FOREIGN KEY ("trailerId") REFERENCES "public"."Trailer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Email" ADD CONSTRAINT "Email_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quote" ADD CONSTRAINT "Quote_trailerId_fkey" FOREIGN KEY ("trailerId") REFERENCES "public"."Trailer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quote" ADD CONSTRAINT "Quote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuoteActivity" ADD CONSTRAINT "QuoteActivity_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadNote" ADD CONSTRAINT "LeadNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrailerRequest" ADD CONSTRAINT "TrailerRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatParticipant" ADD CONSTRAINT "ChatParticipant_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."ChatThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatParticipant" ADD CONSTRAINT "ChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."ChatThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatAttachment" ADD CONSTRAINT "ChatAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."ChatMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CreditAppEvent" ADD CONSTRAINT "CreditAppEvent_creditAppId_fkey" FOREIGN KEY ("creditAppId") REFERENCES "public"."CreditApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
