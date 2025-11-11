export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for PDF/PNG generation

import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import { requireRole } from '@/lib/authz';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]!));

async function buildFilledHtml(u: URL) {
  const name  = (u.searchParams.get('name')  ?? '').trim();
  const zip   = (u.searchParams.get('zip')   ?? '').trim();
  const price = Number(u.searchParams.get('price') ?? 0);
  const phone = (u.searchParams.get('phone') ?? '').trim();
  const email = (u.searchParams.get('email') ?? '').trim();
  const rep   = (u.searchParams.get('rep')   ?? 'MJ Sales Rep').trim();
  if (!name || !zip || !price || !Number.isFinite(price) || price <= 0) {
    throw new Error('Missing/invalid name|zip|price');
  }

  const qnum = crypto.randomUUID().slice(0, 8).toUpperCase();
  const tpl = await fs.readFile(process.cwd() + '/templates/quote-luxury.html', 'utf8');
  const priceStr = price.toLocaleString('en-US');

  let html = tpl
    .replace(/{{CUSTOMER_NAME}}/g, esc(name))
    .replace(/{{CUSTOMER_PHONE}}/g, esc(phone))
    .replace(/{{CUSTOMER_EMAIL}}/g, esc(email))
    .replace(/{{ZIP}}/g, esc(zip))
    .replace(/{{SELLING_PRICE}}/g, esc(priceStr))
    .replace(/{{QUOTE_DATE}}/g, new Date().toLocaleDateString('en-US'))
    .replace(/{{REP_NAME}}/g, esc(rep))
    .replace(/{{QUOTE_NUMBER}}/g, esc(qnum));

  // Replace optional tokens (payment tables and unit info)
  html = html.replace(/{{UNIT_INFO}}/g, u.searchParams.get('unitInfo') ?? '');
  html = html.replace(/{{PAYMENT_TABLES_HTML}}/g, u.searchParams.get('paymentTablesHtml') ?? '');

  return { html, qnum };
}

/**
 * Quote Export API (PDF/PNG)
 *
 * Renders quote template as pixel-perfect PDF or PNG using Puppeteer
 *
 * Query params:
 * - format (required): "pdf" or "png"
 * - paper (optional): "letter" or "a4" (default: "letter")
 * - name (required)
 * - zip (required)
 * - price (required)
 * - phone (optional)
 * - email (optional)
 * - rep (optional, defaults to "MJ Sales Rep")
 * - unitInfo (optional)
 * - paymentTablesHtml (optional)
 */
export async function GET(req: NextRequest) {
  // Auth guard: requires authenticated user
  try {
    await requireRole(["salesperson", "manager", "owner"]);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    throw error;
  }

  try {
    const u = new URL(req.url);
    const format = (u.searchParams.get('format') ?? 'pdf').toLowerCase(); // pdf|png
    const paper  = (u.searchParams.get('paper')  ?? 'letter').toLowerCase(); // letter|a4

    const { html, qnum } = await buildFilledHtml(u);

    // Dynamic import so Next doesn't bundle these at build time
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteer = await import('puppeteer-core');

    const exePath = await chromium.executablePath();
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: exePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    if (format === 'png') {
      const buf = await page.screenshot({ fullPage: true, type: 'png' });
      await browser.close();
      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="Quote-${qnum}.png"`,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      });
    }

    const buf = await page.pdf({
      printBackground: true,
      format: paper === 'a4' ? 'A4' : 'Letter',
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
    });

    await browser.close();
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Quote-${qnum}.pdf"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch (e: any) {
    console.error('Quote export error:', e);
    return new NextResponse(e?.message || 'Export error', { status: 400 });
  }
}
