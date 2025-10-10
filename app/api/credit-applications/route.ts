import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shareToken = searchParams.get("shareToken");

    // Public endpoint: Get single application by share token
    if (shareToken) {
      const application = await prisma.creditApplication.findUnique({
        where: { shareToken },
        select: {
          id: true,
          appNumber: true,
          status: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      });

      if (!application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
      }

      return NextResponse.json(application);
    }

    // Protected endpoint: List all applications (requires auth)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = searchParams.get("status");
    const where: any = {};
    if (status) where.status = status;

    const applications = await prisma.creditApplication.findMany({
      where,
      select: {
        id: true,
        appNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        requestedAmount: true,
        requestedTerm: true,
        status: true,
        createdAt: true,
        decidedAt: true,
        approvedAmount: true,
        approvedApr: true,
        lender: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Credit applications fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if this is a public submission (no auth) or rep-created
    const session = await getServerSession(authOptions);
    const isPublicSubmission = !session;

    const {
      // Personal Info
      firstName,
      lastName,
      email,
      phone,
      street,
      city,
      state,
      zipcode,
      dob,
      ssn,
      driverLicense,
      dlState,
      // Employment
      employer,
      jobTitle,
      employmentYears,
      monthlyIncome,
      // Housing
      housingStatus,
      monthlyPayment,
      yearsAtAddress,
      // Equipment
      equipmentType,
      equipmentDesc,
      requestedAmount,
      requestedTerm,
      // References
      references,
      // Signature & Legal
      signatureData,
      legalText,
      legalConsent,
      // Optional
      shareToken,
      customerId,
      trailerId,
      notes,
    } = body;

    // Validate required fields for public submissions
    if (isPublicSubmission) {
      if (!firstName || !lastName || !email || !phone) {
        return NextResponse.json(
          { error: "Missing required personal information" },
          { status: 400 }
        );
      }

      if (!signatureData || !legalConsent) {
        return NextResponse.json(
          { error: "Signature and legal consent required" },
          { status: 400 }
        );
      }
    }

    // Generate unique application number (e.g., CA-2025-A1B2C3)
    const year = new Date().getFullYear();
    const appNumber = `CA-${year}-${nanoid(6).toUpperCase()}`;

    // Get IP and User Agent for public submissions
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const application = await prisma.creditApplication.create({
      data: {
        appNumber,
        // Personal Info
        firstName,
        lastName,
        email,
        phone,
        street,
        city,
        state,
        zipcode,
        dob: dob ? new Date(dob) : undefined,
        ssn, // TODO: Encrypt this in production!
        driverLicense,
        dlState,
        // Employment
        employer,
        jobTitle,
        employmentYears: employmentYears ? parseInt(employmentYears) : undefined,
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
        // Housing
        housingStatus,
        monthlyPayment: monthlyPayment ? parseFloat(monthlyPayment) : undefined,
        yearsAtAddress: yearsAtAddress ? parseInt(yearsAtAddress) : undefined,
        // Equipment
        equipmentType,
        equipmentDesc,
        requestedAmount: requestedAmount ? parseFloat(requestedAmount) : undefined,
        requestedTerm: requestedTerm ? parseInt(requestedTerm) : undefined,
        // References
        references,
        // Signature & Legal (for public submissions)
        signatureData,
        signedAt: signatureData ? new Date() : undefined,
        ipAddress: isPublicSubmission ? ipAddress : undefined,
        userAgent: isPublicSubmission ? userAgent : undefined,
        legalConsent: legalConsent || false,
        legalText,
        // Status
        status: isPublicSubmission ? "submitted" : "pending",
        submittedAt: isPublicSubmission ? new Date() : undefined,
        // Links and relations
        shareToken: shareToken || undefined,
        customerId: customerId || undefined,
        trailerId: trailerId || undefined,
        notes,
        createdBy: session?.user?.id || undefined,
      },
      include: {
        customer: true,
      },
    });

    // TODO: Send email notification to dealer
    // TODO: Send confirmation email to customer

    return NextResponse.json({
      success: true,
      appNumber: application.appNumber,
      id: application.id,
      application,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Credit application creation error:", error);
    return NextResponse.json(
      { error: "Failed to create credit application" },
      { status: 500 }
    );
  }
}
