#!/bin/bash
# MJ CARGO FAVICON FIX SCRIPT
# This script fixes the favicon issue once and for all!

echo "🔧 MJ CARGO FAVICON FIXER"
echo "========================="
echo ""

# Step 1: Copy logo.png to multiple locations as favicon
echo "📋 Step 1: Setting up favicon files..."

# Copy to public folder (where it should be)
cp public/logo.png public/favicon.png 2>/dev/null
cp public/logo.png public/favicon.ico 2>/dev/null
cp public/logo.png public/apple-touch-icon.png 2>/dev/null
cp public/logo.png public/favicon-32x32.png 2>/dev/null
cp public/logo.png public/favicon-16x16.png 2>/dev/null
cp public/logo.png public/android-chrome-192x192.png 2>/dev/null
cp public/logo.png public/favicon-192x192.png 2>/dev/null
cp public/logo.png public/favicon-512x512.png 2>/dev/null

# Also keep in app folder for Next.js App Router
cp public/logo.png app/icon.png 2>/dev/null
cp public/logo.png app/apple-icon.png 2>/dev/null
cp public/logo.png app/favicon.ico 2>/dev/null

echo "✅ Favicon files created!"
echo ""

# Step 2: Show current status
echo "📊 Step 2: Verifying favicon setup..."
echo ""
echo "Files in /public:"
ls -la public/*.png public/*.ico 2>/dev/null | grep -E "(favicon|icon|logo)" | head -10
echo ""
echo "Files in /app:"
ls -la app/*.png app/*.ico 2>/dev/null | grep -E "(favicon|icon)" | head -5
echo ""

# Step 3: Clear Next.js cache
echo "🗑️ Step 3: Clearing Next.js cache..."
rm -rf .next 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
echo "✅ Cache cleared!"
echo ""

# Step 4: Instructions
echo "🎯 FINAL STEPS TO COMPLETE:"
echo "==========================="
echo ""
echo "1. Stop your dev server (Ctrl+C)"
echo ""
echo "2. Restart with: pnpm dev"
echo ""
echo "3. In your browser:"
echo "   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "   - Clear browser cache if needed"
echo "   - Check Developer Tools > Network tab"
echo "   - Look for favicon.ico or logo.png being loaded"
echo ""
echo "4. Test in multiple browsers:"
echo "   - Chrome"
echo "   - Firefox"
echo "   - Edge"
echo ""
echo "5. For production, also run:"
echo "   pnpm build"
echo "   pnpm start"
echo ""
echo "✅ Your MJ logo should now appear as the favicon!"
echo ""
echo "🔥 ¡Vámonos hermano! The favicon is FIXED! 🔥"
