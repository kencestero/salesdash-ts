import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const applications = await prisma.creditApplication.findMany({
      where,
      include: {
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Generate unique application number
    const appNumber = `CA${Date.now().toString().slice(-8)}`;

    const application = await prisma.creditApplication.create({
      data: {
        appNumber,
        customerId: body.customerId,
        trailerId: body.trailerId,
        requestedAmount: parseFloat(body.requestedAmount),
        requestedTerm: parseInt(body.requestedTerm),
        ssn: body.ssn, // TODO: Encrypt this!
        dob: body.dob ? new Date(body.dob) : null,
        driverLicense: body.driverLicense,
        dlState: body.dlState,
        employer: body.employer,
        jobTitle: body.jobTitle,
        employmentYears: body.employmentYears ? parseInt(body.employmentYears) : null,
        monthlyIncome: body.monthlyIncome ? parseFloat(body.monthlyIncome) : null,
        housingStatus: body.housingStatus,
        monthlyPayment: body.monthlyPayment ? parseFloat(body.monthlyPayment) : null,
        yearsAtAddress: body.yearsAtAddress ? parseInt(body.yearsAtAddress) : null,
        references: body.references,
        notes: body.notes,
        createdBy: session.user.id,
      },
      include: {
        customer: true,
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error: any) {
    console.error("Credit application creation error:", error);
    return NextResponse.json(
      { error: "Failed to create credit application" },
      { status: 500 }
    );
  }
}
