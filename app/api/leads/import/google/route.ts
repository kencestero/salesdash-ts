import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { rateLimit } from "@/lib/ratelimit";
import { rowToLead, hashLead } from "@/lib/leads/csv";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireRole(["manager", "owner", "director"]);
    if (!rateLimit("leads-import", 4, 60_000)) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }

    const url = process.env.LEADS_CSV_URL;
    if (!url) return new NextResponse("LEADS_CSV_URL missing", { status: 500 });

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return new NextResponse(`Fetch failed: ${res.status}`, { status: 502 });
    const text = await res.text();

    // Parse CSV (no external deps)
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return NextResponse.json({ imported: 0, skipped: 0, reason: "no rows" });

    const headers = lines[0].split(",").map(h => h.replace(/^\uFEFF/, "").trim());
    const rows = lines.slice(1).map(line => {
      const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c => c.replace(/^"|"$/g, "").trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => obj[h] = cols[i] ?? "");
      return obj;
    });

    let imported = 0, skipped = 0;
    for (const r of rows) {
      const lead = rowToLead(r);
      if (!lead.email && !lead.phone) { skipped++; continue; }

      const importHash = hashLead(lead);
      try {
        await prisma.lead.upsert({
          where: { importHash },
          update: {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            zip: lead.zip,
            city: lead.city,
            state: lead.state,
            note: lead.note,
          },
          create: {
            importHash,
            source: "google-sheet",
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            zip: lead.zip,
            city: lead.city,
            state: lead.state,
            note: lead.note,
          },
        });
        imported++;
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({ imported, skipped, total: rows.length });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "error", { status: 500 });
  }
}
