# Dashboard Analytics Feature

## 🎯 What Was Implemented

Live dashboard analytics tracking showing **real-time user activity** on your MJ Cargo SalesDash.

## 📊 Features

### 1. **Live User Tracking**
- Tracks unique users who visit the dashboard
- Shows users in last 24 hours
- Displays visits in last 30 minutes (live indicator)
- Auto-refreshes every 30 seconds

### 2. **Hourly Activity Chart**
- Bar chart showing visits per hour (last 24 hours)
- Orange-themed bars matching MJ Cargo branding (#E96114)
- Hover tooltips showing exact visit count per hour
- Responsive design

### 3. **Active User Stats**
- Unique visitors (last 24h)
- Total visits (last 24h)
- Last 30 minutes activity (highlighted in orange)

## 📁 Files Created

### 1. Database Schema
**File:** `prisma/schema.prisma`
```prisma
model DashboardVisit {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(...)
  createdAt DateTime @default(now())

  @@index([createdAt])
  @@index([userId, createdAt])
}
```

### 2. API Route
**File:** `app/api/analytics/dashboard/route.ts`
- **POST** `/api/analytics/dashboard` - Log a dashboard visit
- **GET** `/api/analytics/dashboard` - Fetch analytics data

**Response Format:**
```json
{
  "usersLast24h": 15,
  "totalVisits": 47,
  "visitsLast30Min": 3,
  "visitsPerHour": [
    { "hour": "00:00", "count": 2 },
    { "hour": "01:00", "count": 5 },
    ...
  ]
}
```

### 3. Visit Logger Component
**File:** `components/dashboard/log-dashboard-visit.tsx`
- Invisible component that logs visits
- Runs once per day per browser session
- Uses sessionStorage to prevent duplicate logs

### 4. Analytics Card Component
**File:** `components/dashboard/dashboard-users-card.tsx`
- Displays live analytics data
- Auto-refreshes every 30 seconds
- Orange-themed to match MJ Cargo branding
- Responsive design with loading states

### 5. Dashboard Integration
**File:** `app/[lang]/(dashboard)/(home)/dashboard/page-view.tsx`
- Added `<LogDashboardVisitOnMount />` at the top
- Added `<DashboardUsersCard />` in the right column

## 🎨 Design

### Color Scheme (MJ Cargo Theme)
- Primary: `#E96114` (Orange)
- Charts: Orange bars with hover effects
- Cards: Dark mode compatible

### Layout
- Positioned in the right sidebar
- Below the UsersStat component
- Full-width chart
- Compact stats table

## 🚀 How It Works

### 1. Visit Logging Flow
```
User opens dashboard
       ↓
LogDashboardVisitOnMount runs
       ↓
Checks sessionStorage (logged today?)
       ↓
If NO → POST /api/analytics/dashboard
       ↓
Creates DashboardVisit record
       ↓
Marks as logged in sessionStorage
```

### 2. Data Display Flow
```
DashboardUsersCard mounts
       ↓
Fetches GET /api/analytics/dashboard
       ↓
Shows loading spinner
       ↓
Displays analytics data
       ↓
Auto-refreshes every 30 seconds
```

## 📊 Database Queries

### Unique Users (Last 24h)
```sql
SELECT COUNT(DISTINCT userId)
FROM DashboardVisit
WHERE createdAt >= (NOW() - INTERVAL '24 hours')
```

### Visits Per Hour
```sql
SELECT
  to_char(date_trunc('hour', createdAt), 'HH24:00') as hour,
  COUNT(*) as count
FROM DashboardVisit
WHERE createdAt >= (NOW() - INTERVAL '24 hours')
GROUP BY date_trunc('hour', createdAt)
ORDER BY date_trunc('hour', createdAt)
```

## 🔒 Security

- ✅ **Authentication Required**: All endpoints check for valid session
- ✅ **User ID Validation**: Verifies user exists before logging
- ✅ **Session-Based Deduplication**: Uses sessionStorage to prevent spam
- ✅ **Indexed Queries**: Database indexes on createdAt and userId for performance

## 🎯 Testing

### Test the Visit Logger
1. Open https://mjsalesdash.com/en/dashboard
2. Check browser DevTools → Network tab
3. Look for POST to `/api/analytics/dashboard`
4. Should see `{ ok: true }` response
5. Reload page → Should NOT log again (sessionStorage prevents it)
6. Clear sessionStorage → Reload → Should log again

### Test the Analytics Card
1. Open dashboard
2. Analytics card should show in right sidebar
3. Check for:
   - User count (number in orange)
   - Bar chart (orange bars)
   - Stats table at bottom
4. Wait 30 seconds → Should auto-refresh
5. Open dashboard in incognito → User count should increase

### Test the Live Updates
1. Open dashboard in browser 1
2. Note the user count (e.g., "15")
3. Open dashboard in browser 2 (different session)
4. Wait 30 seconds for auto-refresh in browser 1
5. User count should increase (e.g., "16")
6. "Last 30 minutes" badge should update

## 🐛 Troubleshooting

### Analytics Not Showing
**Check:**
- Browser console for errors
- Network tab: Is API call succeeding?
- Database: `SELECT * FROM "DashboardVisit" ORDER BY "createdAt" DESC LIMIT 10;`

### Visit Not Logging
**Check:**
- SessionStorage: `sessionStorage.getItem('dashboard_visit_logged_2025-01-18')`
- Clear it and reload
- Check API response in Network tab

### Chart Not Displaying
**Check:**
- `visitsPerHour` array in API response
- Browser console for JavaScript errors
- Database has records in last 24h

## 📈 Future Enhancements

Potential improvements you could add:

1. **Top Countries** (using IP geolocation)
2. **Browser/Device Breakdown** (from User-Agent)
3. **Most Active Times** (peak hours analysis)
4. **User Retention** (returning vs new users)
5. **Page Views Per User** (track specific pages)
6. **Export Analytics** (CSV/PDF download)
7. **Email Reports** (daily/weekly digest)

## 🔧 Configuration

### Change Refresh Interval
Edit `components/dashboard/dashboard-users-card.tsx`:
```typescript
// Default: 30 seconds (30000ms)
const interval = setInterval(fetchData, 30000);

// For faster updates: 10 seconds
const interval = setInterval(fetchData, 10000);
```

### Change Time Range
Edit `app/api/analytics/dashboard/route.ts`:
```typescript
// Default: Last 24 hours
const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

// For last 7 days:
const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
```

### Disable Session Deduplication
Edit `components/dashboard/log-dashboard-visit.tsx`:
```typescript
// Remove these lines to log every visit:
if (typeof window !== "undefined" && sessionStorage.getItem(sessionKey)) {
  return;
}
// ... and remove sessionStorage.setItem
```

## ✅ Summary

You now have:
- ✅ Live dashboard analytics
- ✅ Real-time user tracking
- ✅ Hourly activity charts
- ✅ 30-second auto-refresh
- ✅ MJ Cargo branded design
- ✅ Mobile responsive

**Test it now:** Open https://mjsalesdash.com/en/dashboard

---

**Last Updated:** 2025-01-18
**Status:** ✅ Production Ready
