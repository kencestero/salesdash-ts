# MJ Cargo Sales Dashboard

A comprehensive sales management system built with Next.js 14, TypeScript, Prisma, and Firebase for trailer dealerships.

## 🚀 Features

### Sales Management
- **Live Inventory System** - Real-time inventory tracking with images, specs, pricing, and status management
- **Finance Calculator** - Interactive payment calculator with down payment, trade-in, APR, and term calculations
- **Credit Applications** - Complete credit application workflow with approval tracking
- **CRM System** - Customer relationship management with contact tracking, tags, and activity logs
- **Deal Pipeline** - Sales pipeline visualization and deal tracking

### Communication
- **Real-time Chat** - Firebase-powered chat system for team communication
- **Email System** - Transactional email support (ready for Resend/SendGrid/AWS SES)
- **Email Templates** - Beautiful React Email templates for customer communications

### Security & Access Control
- **NextAuth.js** - Secure authentication with Google & GitHub OAuth
- **Email Verification** - Automated verification tokens for new users
- **Role-Based Access** - Manager and standard user permissions
- **Access Allowlist** - Domain and email-based access control

### Technology Stack
- **Framework:** Next.js 14 (App Router) with TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Real-time:** Firebase Firestore (Chat)
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS + shadcn/ui components
- **Email:** React Email (ready for provider integration)
- **Deployment:** Vercel

## 📋 Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Firebase project (for chat)
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)

## 🛠️ Setup

### 1. Clone Repository

```bash
git clone https://github.com/kencestero/salesdash-ts.git
cd salesdash-ts
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Variables

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Required environment variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
AUTH_SECRET=your-auth-secret-here

# OAuth Providers (Optional)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Access Control (Optional)
ACCESS_ALLOWLIST_ENABLED=false
ACCESS_ALLOWLIST=@mjcargo.com,@obscurerides.com,user@gmail.com

# Firebase (for Chat)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Email Service (Optional - choose one)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com
```

### 4. Database Setup

```bash
# Push schema to database
pnpm prisma db push

# (Optional) Generate Prisma Client
pnpm prisma generate

# (Optional) View database in Prisma Studio
pnpm prisma studio
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[Firebase Setup Guide](./FIREBASE_SETUP.md)** - Complete guide for setting up chat system
- **[Email System Setup](./EMAIL_SYSTEM_SETUP.md)** - Email service provider integration guide
- **[Project Overview](./PROJECT_OVERVIEW.md)** - Detailed project architecture and features

## 🗂️ Project Structure

```
salesdash-ts/
├── app/
│   ├── [lang]/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/       # Main pages
│   │   │   │   ├── inventory/   # Inventory management
│   │   │   │   ├── finance/     # Finance calculator
│   │   │   │   ├── credit/      # Credit applications
│   │   │   │   └── customers/   # CRM system
│   │   │   └── (apps)/
│   │   │       ├── chat/        # Real-time chat
│   │   │       ├── email/       # Email management
│   │   │       └── ...
│   │   └── (auth)/
│   │       ├── login/
│   │       └── signup/
│   └── api/
│       ├── auth/                # NextAuth endpoints
│       ├── inventory/           # Inventory API
│       ├── credit-applications/ # Credit app API
│       ├── customers/           # Customer API
│       └── chat/                # Chat API
├── components/
│   ├── ui/                      # shadcn/ui components
│   └── partials/                # Custom components
├── lib/
│   ├── auth.ts                  # Auth configuration
│   ├── prisma.ts                # Prisma client
│   └── firebase.ts              # Firebase config
├── prisma/
│   └── schema.prisma            # Database schema
├── config/
│   └── menus.ts                 # Navigation configuration
└── public/                      # Static assets
```

## 🎯 Key Features Explained

### Inventory Management
- Search by stock number, VIN, manufacturer, model
- Filter by status (Available, Reserved, Sold, On Order)
- Filter by category (Utility, Enclosed, Flatbed, etc.)
- Track pricing, cost, location, and specifications
- Upload images for each trailer

### Finance Calculator
- Calculate monthly payments
- Support for down payment and trade-in
- Adjustable APR and loan term (12-84 months)
- Visual breakdown of total cost and interest
- Real-time calculation updates

### Credit Applications
- Complete application workflow
- Track requested and approved amounts
- Approval status management (Pending, Approved, Declined)
- Link to customer records
- Application history and notes

### CRM System
- Customer contact management
- Lead tracking and qualification
- Tagging system for customer segmentation
- Activity tracking and history
- Pipeline value calculation

### Real-time Chat
- Firebase-powered instant messaging
- Contact list with last message preview
- Message pinning and forwarding
- Reply and delete functionality
- Unread message tracking

## 🔐 Security Features

- **Secure Authentication:** NextAuth.js with OAuth providers
- **Email Verification:** Automated token-based verification
- **Access Control:** Domain and email allowlisting
- **Role-Based Permissions:** Manager vs. standard user roles
- **API Protection:** Server-side session validation
- **Database Security:** Prisma ORM with parameterized queries
- **Environment Variables:** Sensitive data in .env files (not committed)

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository:**
   ```bash
   vercel
   ```

2. **Add Environment Variables:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env`

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Environment Variables in Vercel

```bash
# Add via CLI
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# ... add all other variables
```

Or use the Vercel dashboard for easier management.

## 🧪 Testing

### Test Firebase Chat
1. Set up Firebase project (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))
2. Add environment variables
3. Create two user accounts
4. Navigate to `/chat`
5. Send messages between users

### Test Email System
1. Configure email provider (see [EMAIL_SYSTEM_SETUP.md](./EMAIL_SYSTEM_SETUP.md))
2. Add API credentials to `.env`
3. Create test endpoint or use email templates

## 📝 Database Models

### Core Models
- **User** - Authentication and user management
- **Account** - OAuth provider accounts
- **Session** - User sessions
- **VerificationToken** - Email verification

### Sales Models
- **Trailer** - Inventory items
- **Customer** - CRM customer records
- **Deal** - Sales deals and pipeline
- **CreditApplication** - Credit applications

### Communication Models
- **Email** - Email logs and history
- **EmailTemplate** - Reusable email templates
- **Activity** - Customer activity tracking

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is private and proprietary to MJ Cargo.

## 🆘 Support

For issues and questions:
- Check documentation files in the root directory
- Review Firebase and Email setup guides
- Contact project maintainer

## 🔄 Recent Updates

- ✅ Added Live Inventory System
- ✅ Implemented Finance Calculator
- ✅ Built Credit Applications workflow
- ✅ Created CRM Customer Management
- ✅ Fixed Chat system with Firebase integration
- ✅ Added navigation links to sidebar
- ✅ Created comprehensive setup documentation
- ⏳ Email system ready for provider integration

---

**Built with ❤️ for MJ Cargo**
