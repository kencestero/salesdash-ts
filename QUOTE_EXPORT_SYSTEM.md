# Quote Export System Documentation

## Overview

The Quote Export System provides pixel-perfect PDF/PNG generation and HTML downloads for customer quotes using Puppeteer and Chromium.

## Features Implemented

### 1. Export Routes

#### `/api/quotes/render` - HTML Preview
- Opens filled quote template in new browser tab
- Same template used for all export formats
- Parameters: `name`, `zip`, `price`, `phone`, `email`, `rep`, `unitInfo`, `paymentTablesHtml`

#### `/api/quotes/download` - HTML File Download
- Downloads filled HTML as `Quote-{ID}.html`
- Editable file format
- Same parameters as render route

#### `/api/quotes/export` - PDF/PNG Export
- Pixel-perfect PDF or PNG generation via Puppeteer
- Parameters:
  - `format` (required): `pdf` or `png`
  - `paper` (optional): `letter` or `a4` (default: `letter`)
  - Same customer params as other routes
- Filenames: `Quote-{ID}.pdf` or `Quote-{ID}.png`

### 2. UI Integration

**Finance Compare Page** - 4 Export Buttons:
1. **Preview Quote (Browser)** - Opens `/api/quotes/render` in new tab
2. **Download HTML** - Downloads editable HTML file
3. **Download PDF** - Pixel-perfect PDF (recommended for printing)
4. **Download PNG** - High-quality image for sharing

### 3. Technical Implementation

**Webpack Configuration** ([next.config.js](next.config.js)):
- `serverComponentsExternalPackages`: `['@sparticuz/chromium', 'puppeteer-core']`
- Custom externals handler for function-based webpack configs
- Prevents bundling of binary packages

**Serverless Function Configuration** ([vercel.json](vercel.json)):
```json
{
  "functions": {
    "app/api/quotes/export/route.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

**Export Route Configuration**:
- `runtime = 'nodejs'` - Forces Node.js runtime (not Edge)
- `dynamic = 'force-dynamic'` - Disables static optimization
- `maxDuration = 60` - Allows up to 60 seconds for generation

**Dynamic Imports**:
```typescript
const chromium = (await import('@sparticuz/chromium')).default;
const puppeteer = await import('puppeteer-core');
```

**Security Features**:
- HTML escaping function for XSS protection
- `X-Robots-Tag: noindex, nofollow` headers
- `Cache-Control: no-store, no-cache, must-revalidate`

## Smoke Tests

### Preview (Browser):
```
https://mjsalesdash.com/api/quotes/render?name=John%20Doe&zip=78701&price=18995
```

### HTML Download:
```
https://mjsalesdash.com/api/quotes/download?name=John%20Doe&zip=78701&price=18995
```
**Expected**: Downloads `Quote-XXXXXXXX.html`

### PDF Export:
```
https://mjsalesdash.com/api/quotes/export?format=pdf&name=John%20Doe&zip=78701&price=18995
```
**Expected**: Downloads `Quote-XXXXXXXX.pdf` with exact styling, print CSS applied

### PNG Export:
```
https://mjsalesdash.com/api/quotes/export?format=png&name=John%20Doe&zip=78701&price=18995
```
**Expected**: Downloads `Quote-XXXXXXXX.png` with full-page screenshot

### Optional Parameters:
```
&phone=512-555-1234
&email=john@example.com
&rep=Kenneth%20Cestero
&paper=a4  (for PDF exports)
```

## Template Details

**Template File**: [templates/quote-luxury.html](templates/quote-luxury.html)

**Tokens**:
- `{{CUSTOMER_NAME}}` - Customer name (escaped)
- `{{CUSTOMER_PHONE}}` - Phone number (escaped)
- `{{CUSTOMER_EMAIL}}` - Email address (escaped)
- `{{ZIP}}` - ZIP code (escaped)
- `{{SELLING_PRICE}}` - Price with commas (escaped)
- `{{QUOTE_DATE}}` - Current date (MM/DD/YYYY)
- `{{REP_NAME}}` - Sales rep name (escaped)
- `{{QUOTE_NUMBER}}` - Random 8-char UUID
- `{{UNIT_INFO}}` - Optional trailer details HTML
- `{{PAYMENT_TABLES_HTML}}` - Optional payment tables (dashboard-generated)

**Styling**:
- MJ Cargo color palette: `#E6840D`, `#203F55`, `#33251B`
- Print-optimized CSS (`@media print`)
- Shimmer animations, gradient headers, premium badge
- Professional typography and spacing

## Gotchas

1. **Fonts/Assets**: Use absolute URLs or inline; otherwise PDF may miss them
2. **Locale Commas**: Price uses `toLocaleString('en-US')` for consistency
3. **ZIP Validation**: Ensure 5 or 9-digit ZIP before exporting
4. **No Client Imports**: Export route should never be imported from client code
5. **Memory Limits**: Vercel Hobby plan has 1024MB memory limit (configured)
6. **Timeout**: 30-second max duration (configurable up to 60s in vercel.json)

## Nice-to-Haves (Future)

- [ ] Paper size selector in UI (Letter/A4)
- [ ] Quote templates library (multiple designs)
- [ ] Email delivery of quotes
- [ ] Quote history/tracking
- [ ] Multi-page quote support
- [ ] Custom branding per rep

## File References

**Core Files**:
- [app/api/quotes/render/route.ts](app/api/quotes/render/route.ts) - HTML preview
- [app/api/quotes/download/route.ts](app/api/quotes/download/route.ts) - HTML download
- [app/api/quotes/export/route.ts](app/api/quotes/export/route.ts) - PDF/PNG export
- [app/[lang]/(dashboard)/(apps)/finance/compare/page.tsx](app/[lang]/(dashboard)/(apps)/finance/compare/page.tsx) - UI integration
- [templates/quote-luxury.html](templates/quote-luxury.html) - Quote template
- [next.config.js](next.config.js) - Webpack configuration
- [vercel.json](vercel.json) - Serverless function configuration

**Dependencies**:
- `puppeteer-core@24.27.0` - Headless Chrome automation
- `@sparticuz/chromium@141.0.0` - Optimized Chromium binary for serverless

---

**Last Updated**: 2025-11-03
**Status**: Deployed to production (pending build completion)
