import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Sample trailers for demo
const SAMPLE_TRAILERS = [
  {
    id: "1",
    vin: "1M9T5X1A2PL123456",
    stockNumber: "MJ-2025-001",
    manufacturer: "MJ Cargo",
    model: "SA714TA Single Axle",
    year: 2025,
    category: "Utility",
    length: 14,
    width: 7,
    msrp: 3599,
    salePrice: 3199,
    status: "available",
    location: "Main Lot",
    images: ["/images/trailer-placeholder.jpg"],
    createdAt: new Date().toISOString(),
    daysOld: 0,
  },
  {
    id: "2",
    vin: "1M9T5X1A2PL123457",
    stockNumber: "MJ-2025-002",
    manufacturer: "MJ Cargo",
    model: "TA716TA Tandem Axle",
    year: 2025,
    category: "Utility",
    length: 16,
    width: 7,
    msrp: 4299,
    salePrice: 3899,
    status: "available",
    location: "Main Lot",
    images: ["/images/trailer-placeholder.jpg"],
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day old
    daysOld: 1,
  },
  {
    id: "3",
    vin: "1M9T5X1A2PL123458",
    stockNumber: "MJ-2025-003",
    manufacturer: "MJ Cargo",
    model: "DT712 Dump Trailer",
    year: 2025,
    category: "Dump",
    length: 12,
    width: 7,
    msrp: 6999,
    salePrice: 6499,
    status: "available",
    location: "Back Lot",
    images: ["/images/trailer-placeholder.jpg"],
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days old
    daysOld: 2,
  },
  {
    id: "4",
    vin: "1M9T5X1A2PL123459",
    stockNumber: "MJ-2025-004",
    manufacturer: "MJ Cargo",
    model: "EC718TA Enclosed Cargo",
    year: 2025,
    category: "Enclosed",
    length: 18,
    width: 7,
    msrp: 8999,
    salePrice: 8299,
    status: "reserved",
    location: "Main Lot",
    images: ["/images/trailer-placeholder.jpg"],
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days old
    daysOld: 3,
  },
  {
    id: "5",
    vin: "1M9T5X1A2PL123460",
    stockNumber: "MJ-2025-005",
    manufacturer: "MJ Cargo",
    model: "GN824TA Gooseneck",
    year: 2025,
    category: "Gooseneck",
    length: 24,
    width: 8.5,
    msrp: 12999,
    salePrice: 11999,
    status: "available",
    location: "Main Lot",
    images: ["/images/trailer-placeholder.jpg"],
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days old
    daysOld: 5,
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const categoryFilter = searchParams.get("category");

    // Filter sample trailers
    let trailers = [...SAMPLE_TRAILERS];

    if (statusFilter && statusFilter !== "all") {
      trailers = trailers.filter(t => t.status === statusFilter);
    }

    if (categoryFilter && categoryFilter !== "all") {
      trailers = trailers.filter(t => t.category === categoryFilter);
    }

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
