# API Connection Master Guide
## Complete Step-by-Step Instructions for Connecting All SalesDash APIs

**Project:** Remotive Logistics SalesDash
**Last Updated:** 2025-01-31
**Author:** Claude Code
**Purpose:** Comprehensive guide for connecting frontend components to backend APIs and database

---

## Table of Contents

1. [Introduction & Architecture Overview](#1-introduction--architecture-overview)
2. [Prerequisites & Setup](#2-prerequisites--setup)
3. [Database Connection Guide](#3-database-connection-guide)
4. [API Route Patterns](#4-api-route-patterns)
5. [Frontend Integration Patterns](#5-frontend-integration-patterns)
6. [Complete Migration Guides](#6-complete-migration-guides)
7. [Testing & Verification](#7-testing--verification)
8. [Troubleshooting](#8-troubleshooting)
9. [Best Practices](#9-best-practices)

---

## 1. Introduction & Architecture Overview

### 1.1 Technology Stack

```
Frontend:
├── Next.js 14 (App Router)
├── React 18
├── TypeScript
├── TailwindCSS
└── shadcn/ui components

Backend:
├── Next.js API Routes (app/api/*)
├── NextAuth.js (Authentication)
├── Prisma ORM
├── PostgreSQL (Neon)
├── Firebase Firestore (Chat only)
└── Resend (Email service)
```

### 1.2 Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (React Server/Client)                  │
│  app/[lang]/(dashboard)/(apps)/*/page.tsx                   │
│  - Server Components (data fetching)                         │
│  - Client Components ("use client", hooks, state)            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓ fetch('/api/...')
┌─────────────────────────────────────────────────────────────┐
│                 API ROUTES (Backend)                         │
│  app/api/*/route.ts                                         │
│  - Authentication check (NextAuth)                           │
│  - Role-based authorization                                  │
│  - Business logic                                            │
│  - Database operations (Prisma)                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              DATABASE LAYER (Prisma ORM)                     │
│  lib/prisma.ts → Prisma Client                              │
│  lib/generated/prisma/ (auto-generated)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│        PostgreSQL DATABASE (Neon Cloud)                      │
│  - User, UserProfile, Customer, Activity, etc.               │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Request Flow Example

```typescript
// 1. User clicks button in browser
// 2. Frontend (Client Component) makes API call
const response = await fetch('/api/crm/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ firstName: 'John', lastName: 'Doe', ... })
});

// 3. API Route receives request
export async function POST(req: NextRequest) {
  // 4. Validate session
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 5. Query database via Prisma
  const customer = await prisma.customer.create({
    data: { firstName, lastName, ... }
  });

  // 6. Return response
  return NextResponse.json({ customer }, { status: 201 });
}

// 7. Frontend receives response and updates UI
const data = await response.json();
toast({ title: 'Success', description: 'Customer created!' });
```

---

## 2. Prerequisites & Setup

### 2.1 Environment Variables

Ensure `.env` file has all required variables:

```bash
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host.neon.tech:5432/database?sslmode=require"

# NextAuth (REQUIRED)
NEXTAUTH_URL="https://mjsalesdash.com"
NEXTAUTH_SECRET="your-secret-key-here"
AUTH_SECRET="your-auth-secret-here"

# OAuth (Optional)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-secret"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-secret"

# Firebase (For Chat - Optional)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Email Service (For Resend - Optional)
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="Remotive Logistics Sales <noreply@mjsalesdash.com>"

# Inventory (Optional)
INVENTORY_API_KEY="your-secret-api-key"

# Google Sheets Integration (Optional)
GOOGLE_SHEETS_ID="your-sheet-id"
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### 2.2 Install Dependencies

```bash
# Install all packages
pnpm install

# Generate Prisma client
npx prisma generate

# Sync database schema (development)
npx prisma db push

# Open database browser (optional)
npx prisma studio
```

### 2.3 Verify Prisma Connection

Test database connection:

```typescript
// Test file: test-db.ts
import { prisma } from "@/lib/prisma";

async function testConnection() {
  try {
    const count = await prisma.user.count();
    console.log(`✅ Database connected! Found ${count} users.`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

Run: `npx tsx test-db.ts`

---

## 3. Database Connection Guide

### 3.1 Prisma Schema Structure

All database models are defined in `prisma/schema.prisma`:

```prisma
// Example: Customer model
model Customer {
  id              String   @id @default(cuid())
  firstName       String
  lastName        String
  email           String   @unique
  phone           String
  status          String   @default("lead")

  // Relations
  deals           Deal[]
  activities      Activity[]
  quotes          Quote[]

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Indexes for performance
  @@index([status])
  @@index([email])
}
```

### 3.2 Adding a New Model

**Step 1:** Add model to `prisma/schema.prisma`

```prisma
model Task {
  id            String    @id @default(cuid())
  title         String
  description   String?   @db.Text
  status        String    @default("todo")
  priority      String    @default("medium")
  dueDate       DateTime?
  assignedTo    String?
  createdBy     String

  subtasks      Subtask[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([status])
  @@index([assignedTo])
}

model Subtask {
  id          String   @id @default(cuid())
  taskId      String
  title       String
  completed   Boolean  @default(false)

  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([taskId])
}
```

**Step 2:** Push schema to database

```bash
# Development (no migrations)
npx prisma db push

# Production (with migrations)
npx prisma migrate dev --name add_task_model
```

**Step 3:** Generate Prisma client

```bash
npx prisma generate
```

**Step 4:** Verify in Prisma Studio

```bash
npx prisma studio
# Opens browser at localhost:5555
```

### 3.3 Prisma Import Pattern

**❌ WRONG:**
```typescript
import prisma from "@/lib/generated/prisma";
```

**✅ CORRECT:**
```typescript
import { prisma } from "@/lib/prisma";
```

The Prisma client is exported as a singleton from `lib/prisma.ts`:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@/lib/generated/prisma';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 4. API Route Patterns

### 4.1 Standard API Route Template

Create: `app/api/your-feature/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering (no static generation)
export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET - List all items
export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Check permissions (if needed)
    if (!currentUser.profile.canAccessFeature) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // 4. Get query parameters (optional)
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // 5. Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // 6. Query database
    const items = await prisma.yourModel.findMany({
      where,
      include: {
        relatedModel: true,
        _count: {
          select: {
            children: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 7. Return response
    return NextResponse.json({ items });

  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

// POST - Create new item
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { name, description, status } = body;

    // 3. Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // 4. Create item in database
    const item = await prisma.yourModel.create({
      data: {
        name,
        description,
        status: status || "active",
        createdBy: session.user.email,
      },
    });

    // 5. Return created item
    return NextResponse.json({ item }, { status: 201 });

  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
```

### 4.2 Dynamic API Route (Single Item)

Create: `app/api/your-feature/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get single item
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const item = await prisma.yourModel.findUnique({
      where: { id },
      include: {
        relatedModel: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item });

  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

// PATCH - Update item
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    // Check if item exists
    const existing = await prisma.yourModel.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Update item
    const updated = await prisma.yourModel.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ item: updated });

  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if item exists
    const existing = await prisma.yourModel.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete item
    await prisma.yourModel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
```

### 4.3 Public API Route (No Authentication)

For public endpoints like credit applications:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// No authentication required for public endpoints
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    if (!body.email || !body.phone) {
      return NextResponse.json(
        { error: "Email and phone are required" },
        { status: 400 }
      );
    }

    // Create record
    const item = await prisma.yourModel.create({
      data: body,
    });

    return NextResponse.json({ item }, { status: 201 });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
```

### 4.4 Admin-Only API Route

For owner/director-only endpoints:

```typescript
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    // Check if user is owner or director
    if (!["owner", "director"].includes(currentUser.profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions. Owner or Director role required." },
        { status: 403 }
      );
    }

    // Admin operation...
    const data = await prisma.yourModel.findMany();

    return NextResponse.json({ data });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
```

---

## 5. Frontend Integration Patterns

### 5.1 Server Component Pattern (Recommended)

**File:** `app/[lang]/(dashboard)/your-feature/page.tsx`

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import YourFeatureView from "./page-view";

export default async function YourFeaturePage() {
  // Server-side authentication check
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Server-side data fetching (optional)
  const response = await fetch('https://mjsalesdash.com/api/your-feature', {
    cache: 'no-store',
    headers: {
      Cookie: `next-auth.session-token=${session.user.id}`, // Pass session
    },
  });

  const initialData = await response.json();

  // Pass data to client component
  return <YourFeatureView session={session} initialData={initialData} />;
}
```

### 5.2 Client Component Pattern

**File:** `app/[lang]/(dashboard)/your-feature/page-view.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface Item {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

export default function YourFeatureView({ initialData }: { initialData?: any }) {
  const { data: session } = useSession();
  const [items, setItems] = useState<Item[]>(initialData?.items || []);
  const [loading, setLoading] = useState(false);

  // Fetch items
  const fetchItems = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/your-feature');

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data.items);

    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Error",
        description: "Failed to load items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create item
  const createItem = async (name: string) => {
    try {
      const response = await fetch('/api/your-feature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to create item');
      }

      const data = await response.json();

      // Update local state
      setItems([data.item, ...items]);

      toast({
        title: "Success",
        description: "Item created successfully",
      });

    } catch (error) {
      console.error('Error creating item:', error);
      toast({
        title: "Error",
        description: "Failed to create item",
        variant: "destructive",
      });
    }
  };

  // Update item
  const updateItem = async (id: string, updates: Partial<Item>) => {
    try {
      const response = await fetch(`/api/your-feature/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const data = await response.json();

      // Update local state
      setItems(items.map(item =>
        item.id === id ? data.item : item
      ));

      toast({
        title: "Success",
        description: "Item updated successfully",
      });

    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  // Delete item
  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/your-feature/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Update local state
      setItems(items.filter(item => item.id !== id));

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });

    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  // Fetch on mount
  useEffect(() => {
    if (!initialData) {
      fetchItems();
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Feature</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.status}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => updateItem(item.id, { status: 'completed' })}>
                  Update
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button onClick={() => createItem('New Item')}>
        Add Item
      </Button>
    </div>
  );
}
```

### 5.3 Using SWR for Data Fetching (Advanced)

```typescript
"use client";

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function YourFeatureView() {
  const { data, error, mutate } = useSWR('/api/your-feature', fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  const createItem = async (name: string) => {
    // Optimistic update
    mutate({ ...data, items: [{ id: 'temp', name }, ...data.items] }, false);

    // API call
    const response = await fetch('/api/your-feature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    // Revalidate
    mutate();
  };

  return (
    <div>
      {data.items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      <button onClick={() => createItem('New Item')}>Add</button>
    </div>
  );
}
```

---

## 6. Complete Migration Guides

### 6.1 Migrating Tasks from Memory to Database

#### Step 1: Define Prisma Schema

Add to `prisma/schema.prisma`:

```prisma
model Task {
  id            String    @id @default(cuid())
  title         String
  description   String?   @db.Text
  status        String    @default("todo")
  priority      String    @default("medium")
  dueDate       DateTime?
  assignedTo    String?
  createdBy     String
  tags          String[]

  subtasks      Subtask[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([status])
  @@index([assignedTo])
}

model Subtask {
  id          String   @id @default(cuid())
  taskId      String
  title       String
  completed   Boolean  @default(false)

  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([taskId])
}
```

#### Step 2: Push Schema to Database

```bash
npx prisma db push
npx prisma generate
```

#### Step 3: Migrate GET /api/tasks

**Before (Memory-based):**
```typescript
// app/api/tasks/route.ts
import { tasks } from "./data";

export async function GET(req: NextRequest) {
  return NextResponse.json({ tasks });
}
```

**After (Database-connected):**
```typescript
// app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedTo");

    const where: any = {};
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tasks });

  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
```

#### Step 4: Migrate POST /api/tasks

**Before:**
```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();
  tasks.push({ id: Date.now().toString(), ...body });
  return NextResponse.json({ task: tasks[tasks.length - 1] });
}
```

**After:**
```typescript
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, status, priority, dueDate, assignedTo, tags } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "todo",
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo,
        createdBy: session.user.email,
        tags: tags || [],
      },
      include: {
        subtasks: true,
      },
    });

    return NextResponse.json({ task }, { status: 201 });

  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
```

#### Step 5: Migrate PUT /api/tasks/[id]

Create: `app/api/tasks/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET single task
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });

  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PUT/PATCH update task
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { dueDate, ...rest } = body;

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        subtasks: true,
      },
    });

    return NextResponse.json({ task });

  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE task
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete task (subtasks deleted automatically due to CASCADE)
    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
```

#### Step 6: Migrate Subtasks API

Create: `app/api/tasks/subtasks/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET subtasks for a task
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ subtasks });

  } catch (error) {
    console.error("Error fetching subtasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch subtasks" },
      { status: 500 }
    );
  }
}

// POST create subtask
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, title } = body;

    if (!taskId || !title) {
      return NextResponse.json(
        { error: "taskId and title are required" },
        { status: 400 }
      );
    }

    const subtask = await prisma.subtask.create({
      data: {
        taskId,
        title,
        completed: false,
      },
    });

    return NextResponse.json({ subtask }, { status: 201 });

  } catch (error) {
    console.error("Error creating subtask:", error);
    return NextResponse.json(
      { error: "Failed to create subtask" },
      { status: 500 }
    );
  }
}
```

Create: `app/api/tasks/subtasks/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT/PATCH update subtask
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const subtask = await prisma.subtask.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ subtask });

  } catch (error) {
    console.error("Error updating subtask:", error);
    return NextResponse.json(
      { error: "Failed to update subtask" },
      { status: 500 }
    );
  }
}

// DELETE subtask
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.subtask.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting subtask:", error);
    return NextResponse.json(
      { error: "Failed to delete subtask" },
      { status: 500 }
    );
  }
}
```

#### Step 7: Update Frontend

No major changes needed! The frontend should continue to work with the same API endpoints.

#### Step 8: Remove Old Memory Data File

```bash
# Delete the old data file
rm app/api/tasks/data.ts
```

#### Step 9: Test

```bash
# Start dev server
pnpm dev

# Test:
# 1. Create a task
# 2. Refresh the page (task should still be there!)
# 3. Update the task
# 4. Delete the task
# 5. Create subtasks
# 6. Toggle subtask completion
```

---

### 6.2 Migrating Projects from Memory to Database

#### Step 1: Add Project Model

```prisma
model Project {
  id            String    @id @default(cuid())
  name          String
  description   String?   @db.Text
  status        String    @default("active")
  startDate     DateTime?
  endDate       DateTime?
  ownerId       String
  members       String[]
  color         String?

  tasks         Task[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([ownerId])
  @@index([status])
}
```

Update Task model to link to Project:

```prisma
model Task {
  // ... existing fields
  projectId     String?

  project       Project? @relation(fields: [projectId], references: [id])
  // ... rest of model
}
```

#### Step 2: Push Schema

```bash
npx prisma db push
npx prisma generate
```

#### Step 3: Update API Routes

**app/api/projects/route.ts:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ projects });

  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, startDate, endDate, members, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ownerId: session.user.email,
        members: members || [],
        color,
      },
    });

    return NextResponse.json({ project }, { status: 201 });

  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
```

**app/api/projects/[id]/route.ts:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          include: {
            subtasks: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });

  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { startDate, endDate, ...rest } = body;

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ project });

  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
```

#### Step 4: Remove Old Data File

```bash
rm app/api/projects/data.ts
```

---

### 6.3 Complete Migration Checklist

**Tasks Migration:**
- [ ] Add Task and Subtask models to schema
- [ ] Run `npx prisma db push`
- [ ] Run `npx prisma generate`
- [ ] Update GET `/api/tasks`
- [ ] Update POST `/api/tasks`
- [ ] Update PUT `/api/tasks/[id]`
- [ ] Update DELETE `/api/tasks/[id]`
- [ ] Update GET `/api/tasks/subtasks`
- [ ] Update POST `/api/tasks/subtasks`
- [ ] Update PUT `/api/tasks/subtasks/[id]`
- [ ] Update DELETE `/api/tasks/subtasks/[id]`
- [ ] Remove `app/api/tasks/data.ts`
- [ ] Test create, read, update, delete
- [ ] Test subtask operations
- [ ] Verify data persists after refresh
- [ ] Deploy to production

**Projects Migration:**
- [ ] Add Project model to schema
- [ ] Link Task model to Project (projectId field)
- [ ] Run `npx prisma db push`
- [ ] Run `npx prisma generate`
- [ ] Update GET `/api/projects`
- [ ] Update POST `/api/projects`
- [ ] Update GET `/api/projects/[id]`
- [ ] Update PUT `/api/projects/[id]`
- [ ] Update DELETE `/api/projects/[id]`
- [ ] Remove `app/api/projects/data.ts`
- [ ] Test CRUD operations
- [ ] Test project-task relationships
- [ ] Verify data persists
- [ ] Deploy to production

**Comments Migration:**
- [ ] Add Comment model to schema
- [ ] Link to Task and Project models
- [ ] Implement self-referencing for replies
- [ ] Run schema migration
- [ ] Update GET `/api/comments`
- [ ] Update POST `/api/comments`
- [ ] Test comment creation
- [ ] Test nested replies
- [ ] Deploy

**Boards Migration:**
- [ ] Add Board model to schema
- [ ] Use JSON column for column config
- [ ] Run schema migration
- [ ] Update all board API routes
- [ ] Test CRUD operations
- [ ] Test drag-and-drop functionality
- [ ] Deploy

---

## 7. Testing & Verification

### 7.1 Manual Testing Checklist

For each feature you migrate:

**Create Operation:**
- [ ] Form submission works
- [ ] Data appears in UI immediately
- [ ] Data persists after page refresh
- [ ] Database record created (check Prisma Studio)
- [ ] Toast notification shows success

**Read Operation:**
- [ ] List page loads all items
- [ ] Individual item page loads correctly
- [ ] Filtering works (if applicable)
- [ ] Search works (if applicable)
- [ ] Pagination works (if applicable)

**Update Operation:**
- [ ] Edit form loads with current values
- [ ] Changes save successfully
- [ ] UI updates immediately
- [ ] Changes persist after refresh
- [ ] Database record updated

**Delete Operation:**
- [ ] Delete confirmation shows
- [ ] Item removed from UI
- [ ] Database record deleted
- [ ] Related records handled correctly (CASCADE or prevent)

### 7.2 Using Prisma Studio for Verification

```bash
npx prisma studio
```

Opens at `http://localhost:5555`

- View all tables and records
- Manually create/edit/delete records
- Verify relationships (foreign keys)
- Check indexes

### 7.3 API Testing with curl

```bash
# GET request
curl -X GET https://mjsalesdash.com/api/your-feature \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# POST request
curl -X POST https://mjsalesdash.com/api/your-feature \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"name":"Test Item","status":"active"}'

# PATCH request
curl -X PATCH https://mjsalesdash.com/api/your-feature/ITEM_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"status":"completed"}'

# DELETE request
curl -X DELETE https://mjsalesdash.com/api/your-feature/ITEM_ID \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### 7.4 Browser DevTools Testing

1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Perform action (create, update, delete)
4. Inspect request:
   - Method (GET, POST, PATCH, DELETE)
   - Request headers (Content-Type, Cookie)
   - Request body (for POST/PATCH)
   - Response status (200, 201, 400, 401, 500)
   - Response body

---

## 8. Troubleshooting

### 8.1 Common Errors

#### Error: "PrismaClient is unable to run in this browser environment"

**Cause:** Trying to use Prisma in a client component

**Fix:** Only use Prisma in:
- API routes (`app/api/**/route.ts`)
- Server components (`page.tsx` without "use client")
- Server actions

```typescript
// ❌ WRONG - Client component
"use client";
import { prisma } from "@/lib/prisma";

// ✅ CORRECT - API route
import { prisma } from "@/lib/prisma";
export async function GET(req: NextRequest) { ... }

// ✅ CORRECT - Server component
import { prisma } from "@/lib/prisma";
export default async function Page() {
  const data = await prisma.yourModel.findMany();
  return <div>...</div>;
}
```

---

#### Error: "Cannot reach database server at..."

**Cause:** Database connection string is incorrect or database is down

**Fix:**
1. Check `.env` file has `DATABASE_URL`
2. Verify connection string format:
   ```
   postgresql://user:password@host.neon.tech:5432/database?sslmode=require
   ```
3. Test connection:
   ```bash
   npx prisma db pull
   ```
4. Check Neon dashboard for database status

---

#### Error: "Unknown argument 'fieldName'"

**Cause:** Prisma schema changed but client not regenerated

**Fix:**
```bash
npx prisma generate
```

---

#### Error: 401 Unauthorized

**Cause:** Session is missing or invalid

**Fix:**
1. Check session in API route:
   ```typescript
   const session = await getServerSession(authOptions);
   console.log('Session:', session);
   ```
2. Ensure user is logged in
3. Check cookie is being sent with request
4. Verify `NEXTAUTH_SECRET` is set correctly

---

#### Error: 403 Forbidden

**Cause:** User doesn't have required role/permission

**Fix:**
1. Check user role:
   ```typescript
   console.log('User role:', currentUser.profile.role);
   ```
2. Verify role-based check:
   ```typescript
   if (!["owner", "director"].includes(currentUser.profile.role)) {
     return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
   }
   ```
3. Update user role in database if needed (via Prisma Studio)

---

#### Error: 500 Internal Server Error

**Cause:** Unhandled exception in API route

**Fix:**
1. Check server logs:
   ```bash
   pnpm dev
   # Look at terminal output
   ```
2. Add try-catch logging:
   ```typescript
   try {
     // ... code
   } catch (error) {
     console.error("Detailed error:", error);
     throw error;
   }
   ```
3. Common causes:
   - Missing required fields
   - Foreign key constraint violation
   - Unique constraint violation

---

### 8.2 Debugging Tips

#### Enable Prisma Query Logging

```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Add 'query' to see all SQL
});
```

#### Log All API Requests

```typescript
// middleware.ts or API route
console.log('Request:', {
  method: req.method,
  url: req.url,
  headers: Object.fromEntries(req.headers),
  body: await req.clone().json(),
});
```

#### Inspect Session

```typescript
const session = await getServerSession(authOptions);
console.log('Full session:', JSON.stringify(session, null, 2));
```

---

## 9. Best Practices

### 9.1 Security Best Practices

**Always Authenticate:**
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.email) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Validate Input:**
```typescript
if (!body.name || !body.email) {
  return NextResponse.json(
    { error: "Name and email are required" },
    { status: 400 }
  );
}

// Sanitize email
const email = body.email.trim().toLowerCase();
```

**Use Role-Based Access:**
```typescript
if (!["owner", "director"].includes(currentUser.profile.role)) {
  return NextResponse.json(
    { error: "Insufficient permissions" },
    { status: 403 }
  );
}
```

**Never Trust Client Input:**
```typescript
// ❌ WRONG
const data = body; // Trusts all client data
await prisma.user.create({ data });

// ✅ CORRECT
const { name, email, phone } = body; // Explicit whitelist
await prisma.user.create({
  data: { name, email, phone } // Only allowed fields
});
```

---

### 9.2 Performance Best Practices

**Use Database Indexes:**
```prisma
model Customer {
  // ... fields
  @@index([email])
  @@index([status])
  @@index([assignedTo])
}
```

**Optimize Queries:**
```typescript
// ❌ SLOW - N+1 query problem
const customers = await prisma.customer.findMany();
for (const customer of customers) {
  customer.deals = await prisma.deal.findMany({ where: { customerId: customer.id } });
}

// ✅ FAST - Single query with include
const customers = await prisma.customer.findMany({
  include: { deals: true }
});
```

**Paginate Large Lists:**
```typescript
const page = parseInt(req.query.page) || 1;
const limit = 50;
const skip = (page - 1) * limit;

const customers = await prisma.customer.findMany({
  take: limit,
  skip,
  orderBy: { createdAt: 'desc' }
});
```

**Use Select to Limit Fields:**
```typescript
// ❌ Returns all fields (including large text fields)
const customers = await prisma.customer.findMany();

// ✅ Returns only needed fields
const customers = await prisma.customer.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    // Exclude large description, notes, etc.
  }
});
```

---

### 9.3 Code Organization Best Practices

**Separate Concerns:**
```
app/api/your-feature/
├── route.ts              # List (GET) and Create (POST)
├── [id]/route.ts         # Single item (GET, PATCH, DELETE)
├── [id]/sub-resource/
│   └── route.ts          # Nested resource
└── utils.ts              # Shared logic
```

**Extract Reusable Logic:**
```typescript
// lib/api-utils.ts
export async function getCurrentUser(session: Session) {
  return await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });
}

export function requireAuth(session: Session | null) {
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }
}

export function requireRole(user: User, roles: string[]) {
  if (!roles.includes(user.profile.role)) {
    throw new Error('Forbidden');
  }
}
```

**Use TypeScript Types:**
```typescript
// types/api.ts
export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CustomerResponse {
  customer: Customer;
}

// In API route
import type { CreateCustomerRequest, CustomerResponse } from "@/types/api";

export async function POST(req: NextRequest): Promise<NextResponse<CustomerResponse>> {
  const body: CreateCustomerRequest = await req.json();
  // TypeScript will enforce types
}
```

---

### 9.4 Error Handling Best Practices

**Consistent Error Format:**
```typescript
interface ErrorResponse {
  error: string;
  details?: any;
  code?: string;
}

function errorResponse(message: string, status: number, details?: any): NextResponse {
  return NextResponse.json(
    { error: message, details },
    { status }
  );
}

// Usage
return errorResponse("Customer not found", 404);
return errorResponse("Validation failed", 400, { fields: ['email', 'phone'] });
```

**Try-Catch All Routes:**
```typescript
export async function POST(req: NextRequest) {
  try {
    // ... business logic
  } catch (error) {
    console.error("Error creating item:", error);

    // Prisma unique constraint error
    if (error.code === 'P2002') {
      return errorResponse("Item with this email already exists", 400);
    }

    // Generic error
    return errorResponse("Failed to create item", 500);
  }
}
```

---

### 9.5 Testing Best Practices

**Write Integration Tests:**
```typescript
// __tests__/api/customers.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/crm/customers/route';

describe('/api/crm/customers', () => {
  it('should return customers', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.customers).toBeInstanceOf(Array);
  });

  it('should create customer', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      json: async () => ({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.customer.firstName).toBe('John');
  });
});
```

---

## 10. Quick Reference

### 10.1 Commands Cheat Sheet

```bash
# Development
pnpm dev                        # Start dev server
pnpm build                      # Build for production
pnpm start                      # Start production server

# Database
npx prisma db push              # Sync schema to DB (dev)
npx prisma db push --force-reset # Reset DB and sync
npx prisma generate             # Generate Prisma client
npx prisma studio               # Open DB browser
npx prisma migrate dev          # Create migration (prod)
npx prisma migrate deploy       # Apply migrations (prod)

# Deployment
vercel                          # Deploy preview
vercel --prod                   # Deploy production
vercel env add VAR_NAME         # Add environment variable
```

### 10.2 File Locations Cheat Sheet

```
Database Schema:       prisma/schema.prisma
Prisma Config:         lib/prisma.ts
Auth Config:           lib/auth.ts

API Routes:            app/api/**/route.ts
Frontend Pages:        app/[lang]/(dashboard)/*/page.tsx
Client Components:     app/[lang]/(dashboard)/*/page-view.tsx

UI Components:         components/ui/*
Custom Components:     components/*

Environment Variables: .env (local), Vercel dashboard (production)
```

### 10.3 Common Prisma Queries

```typescript
// Find all
await prisma.model.findMany();

// Find with filter
await prisma.model.findMany({
  where: { status: "active" },
});

// Find unique
await prisma.model.findUnique({
  where: { id: "123" },
});

// Find with relations
await prisma.model.findMany({
  include: { relatedModel: true },
});

// Create
await prisma.model.create({
  data: { name: "Test", status: "active" },
});

// Update
await prisma.model.update({
  where: { id: "123" },
  data: { status: "completed" },
});

// Delete
await prisma.model.delete({
  where: { id: "123" },
});

// Count
await prisma.model.count();

// Count with filter
await prisma.model.count({
  where: { status: "active" },
});

// Aggregation
await prisma.model.aggregate({
  _sum: { price: true },
  _avg: { price: true },
  _count: true,
});

// Group by
await prisma.model.groupBy({
  by: ['status'],
  _count: true,
});
```

---

## Conclusion

This guide provides comprehensive instructions for connecting all APIs in the SalesDash application. Follow these patterns consistently for:

- ✅ Secure authentication and authorization
- ✅ Proper database integration via Prisma
- ✅ Consistent error handling
- ✅ Optimized performance
- ✅ Clean, maintainable code

**Key Takeaways:**

1. **Always use Prisma** - Never use memory-based storage in production
2. **Always authenticate** - Check session in all protected routes
3. **Always validate input** - Never trust client data
4. **Always handle errors** - Use try-catch blocks
5. **Always test** - Verify data persists after refresh

**Next Steps:**

1. Migrate Tasks to database (CRITICAL)
2. Migrate Projects to database (CRITICAL)
3. Migrate Comments and Boards
4. Implement Quote persistence
5. Add Twilio integration for calls
6. Add API documentation
7. Improve error handling and monitoring

For questions or issues, refer to:
- [API Connectivity Audit Report](API_CONNECTIVITY_AUDIT_REPORT.md)
- [CLAUDE.md](../CLAUDE.md)
- [README.md](../README.md)

---

**Last Updated:** 2025-01-31
**Document Version:** 1.0
**Author:** Claude Code
