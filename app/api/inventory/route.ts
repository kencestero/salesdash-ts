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
    const category = searchParams.get("category");

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const trailers = await prisma.trailer.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ trailers });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
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

    // Validate required fields
    const required = [
      "vin",
      "stockNumber",
      "manufacturer",
      "model",
      "year",
      "category",
      "length",
      "width",
      "msrp",
      "salePrice",
      "cost",
    ];

    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create trailer
    const trailer = await prisma.trailer.create({
      data: {
        vin: body.vin,
        stockNumber: body.stockNumber,
        manufacturer: body.manufacturer,
        model: body.model,
        year: parseInt(body.year),
        category: body.category,
        length: parseFloat(body.length),
        width: parseFloat(body.width),
        height: body.height ? parseFloat(body.height) : null,
        gvwr: body.gvwr ? parseInt(body.gvwr) : null,
        capacity: body.capacity ? parseInt(body.capacity) : null,
        axles: body.axles ? parseInt(body.axles) : null,
        msrp: parseFloat(body.msrp),
        salePrice: parseFloat(body.salePrice),
        cost: parseFloat(body.cost),
        status: body.status || "available",
        location: body.location,
        images: body.images || [],
        description: body.description,
        features: body.features || [],
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ trailer }, { status: 201 });
  } catch (error: any) {
    console.error("Trailer creation error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "VIN or Stock Number already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create trailer" },
      { status: 500 }
    );
  }
}
