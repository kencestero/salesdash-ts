# Hydration Error Fix Guide

## What is a Hydration Error?

A hydration error occurs when the HTML rendered on the server doesn't match what React renders on the client. This commonly happens in Next.js when:

1. **Session-dependent rendering** - Using `useSession()` to conditionally render components
2. **Client-only state** - Using browser APIs like `window`, `localStorage`, etc.
3. **Date/Time rendering** - Server and client may have different timestamps
4. **Random values** - `Math.random()` or similar non-deterministic values

## Common Error Message

```
Error: Hydration failed because the initial UI does not match what was rendered on the server.

Warning: Expected server HTML to contain a matching <h1> in <div>.
```

## The Fix: Use a "Mounted" State

### Problem Example

```tsx
export default function MyPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const canUploadPDF = userRole === 'owner' || userRole === 'director';

  return (
    <div>
      {/* ❌ This causes hydration error! */}
      {canUploadPDF && (
        <Button>Upload File</Button>
      )}
    </div>
  );
}
```

**Why it fails:**
- Server: `session = null` → `canUploadPDF = false` → Button doesn't render
- Client: `session` loads → `canUploadPDF = true` → Button renders
- Result: DOM mismatch!

### Solution

```tsx
export default function MyPage() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role;
  const canUploadPDF = userRole === 'owner' || userRole === 'director';

  // ✅ Add mounted state
  const [mounted, setMounted] = useState(false);

  // ✅ Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      {/* ✅ Wrap session-dependent content with mounted check */}
      {mounted && canUploadPDF && (
        <Button>Upload File</Button>
      )}
    </div>
  );
}
```

**Why it works:**
- Server: `mounted = false` → Button doesn't render
- Client (initial): `mounted = false` → Button doesn't render (matches server!)
- Client (after mount): `mounted = true` → Button renders smoothly

## Step-by-Step Fix

1. **Add mounted state:**
   ```tsx
   const [mounted, setMounted] = useState(false);
   ```

2. **Set mounted in useEffect:**
   ```tsx
   useEffect(() => {
     setMounted(true);
   }, []);
   ```

3. **Wrap conditional content:**
   ```tsx
   {mounted && conditionalContent}
   ```

## Common Scenarios

### 1. Session-dependent buttons
```tsx
{mounted && canUploadPDF && <UploadButton />}
```

### 2. User-specific content
```tsx
{mounted && session?.user && <WelcomeMessage user={session.user} />}
```

### 3. Browser API usage
```tsx
{mounted && <ThemeToggle />}  // If it uses localStorage
```

### 4. Client-only components
```tsx
{mounted && <ClientOnlyWidget />}
```

## Alternative: Suppress Hydration Warning (Use Sparingly)

If you're okay with a slight flash of content, you can suppress the warning:

```tsx
<div suppressHydrationWarning>
  {/* Content that may mismatch */}
</div>
```

⚠️ **Warning:** This doesn't fix the issue, just hides the warning. Use the mounted approach instead when possible.

## Testing Your Fix

1. **Clear your browser cache** and refresh
2. **Check browser console** - no hydration errors should appear
3. **Look for layout shift** - content shouldn't jump after load
4. **Test in incognito/private mode** to ensure no cached data affects it

## Real Example from Our Codebase

File: `app/[lang]/dashboard/inventory/page.tsx`

```tsx
export default function InventoryPage() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role;
  const canUploadPDF = userRole === 'owner' || userRole === 'director';

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex gap-3">
      {mounted && canUploadPDF && (
        <Link href="/dashboard/inventory/history">
          <Button variant="outline">
            <History className="mr-2 h-5 w-5" />
            Upload History
          </Button>
        </Link>
      )}

      {mounted && canUploadPDF && (
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="mr-2 h-5 w-5" />
          Upload File
        </Button>
      )}
    </div>
  );
}
```

## Summary

**When you see hydration errors:**
1. Identify which component depends on client-only state (session, browser APIs, etc.)
2. Add `mounted` state that starts as `false`
3. Set it to `true` in `useEffect`
4. Wrap conditional content with `{mounted && ...}`
5. Test thoroughly!

This ensures server and client render the same HTML initially, preventing hydration mismatches.
