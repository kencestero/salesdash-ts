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

      // Use email as unique identifier for Customer
      try {
        if (lead.email) {
          // Import to Customer table for CRM display
          await prisma.customer.upsert({
            where: { email: lead.email },
            update: {
              firstName: lead.name?.split(' ')[0] || 'Unknown',
              lastName: lead.name?.split(' ').slice(1).join(' ') || '',
              phone: lead.phone || null,
              city: lead.city || null,
              state: lead.state || null,
              zipcode: lead.zip || null,
              notes: lead.note || null,
              source: "google-sheet",
              status: "lead",
            },
            create: {
              firstName: lead.name?.split(' ')[0] || 'Unknown',
              lastName: lead.name?.split(' ').slice(1).join(' ') || '',
              email: lead.email,
              phone: lead.phone || null,
              city: lead.city || null,
              state: lead.state || null,
              zipcode: lead.zip || null,
              notes: lead.note || null,
              source: "google-sheet",
              status: "lead",
            },
          });
          imported++;
        } else if (lead.phone) {
          // Try to find by phone if no email
          const existing = await prisma.customer.findFirst({
            where: { phone: lead.phone },
          });

          if (!existing) {
            await prisma.customer.create({
              data: {
                firstName: lead.name?.split(' ')[0] || 'Unknown',
                lastName: lead.name?.split(' ').slice(1).join(' ') || '',
                email: lead.email || `noemail_${Date.now()}@placeholder.com`,
                phone: lead.phone,
                city: lead.city || null,
                state: lead.state || null,
                zipcode: lead.zip || null,
                notes: lead.note || null,
                source: "google-sheet",
                status: "lead",
              },
            });
            imported++;
          } else {
            skipped++;
          }
        }
      } catch (e) {
        console.error('Import error:', e);
        skipped++;
      }
    }

    return NextResponse.json({ imported, skipped, total: rows.length });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "error", { status: 500 });
  }
}
