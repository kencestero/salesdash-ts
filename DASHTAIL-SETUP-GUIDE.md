# DashTail Template - Official Setup Guide
## Remotive Logistics SalesDash Project Documentation

---

## 📚 About DashTail

**DashTail** is a Tailwind, React Next.js Admin Dashboard Template that serves as the foundation for the Remotive Logistics SalesDash CRM system.

Thank you for choosing DashTail. This documentation covers starter guides and API documentation tailored to DashTail's unique layouts, apps, pages, components, and more.

### Official Documentation
- **Main Docs**: https://dash-tail.vercel.app/docs/introduction
- **Folder Structure**: https://dash-tail.vercel.app/docs/folder-structure
- **Template Source**: DashTail by Codeshaper

---

## 🎯 About DashTail

DashTail offers a user-centric, plug-and-play admin template ideal for crafting visually appealing, scalable, and efficiently performing web applications, leveraging the modern capabilities of Next.js and Tailwind CSS.

**Suitable for:**
- Web apps
- Dashboards
- Admin panels
- eCommerce platforms
- HR systems
- Social networks
- Email clients
- Analytics dashboards
- Any SaaS-based interface

---

## ✨ Key Features

- ✅ Crafted using **Next.js 14**
- ✅ Developed with **TailwindCSS 4**
- ✅ Variety of Conceptual Dashboards
- ✅ Diverse Layout Options
- ✅ Multiple Theme Colors
- ✅ Extensive Collection of Pages
- ✅ Wide Range of Components
- ✅ Comprehensive Starter Kit
- ✅ Supports Dark and Light Modes
- ✅ Adaptive Responsive Design
- ✅ Optimized, Lightweight Code
- ✅ User-Friendly Customization
- ✅ Guaranteed Lifetime Updates
- ✅ Endless Template Options

---

## 📊 Conceptual Dashboards

- Analytics
- Ecommerce
- Project

---

## 📱 Ready-to-Use Applications

- Chat
- Email
- Application

---

## 📂 Folder Structure

```
|
├─ app
│  ├─ (dashboard)
│  │  ├─ (apps)
│  │  ├─ (chart)
│  │  ├─ (components)
│  │  ├─ (diagrams)
│  │  ├─ (forms)
│  │  ├─ (home)
│  │  ├─ (icons)
│  │  ├─ (invoice)
│  │  ├─ (map)
│  │  ├─ (tables)
│  │  ├─ blank
│  │  ├─ diagram
│  │  ├─ layout.jsx
│  │  └─ main-layout.jsx
│  │
│  ├─ api
│  ├─ assets
│  ├─ auth
│  ├─ error-page
│  ├─ utility
│  ├─ favicon.ico
│  ├─ layout.jsx
│  ├─ not-found.js
│  └─ page.jsx
│
├─ components
│  ├─ auth
│  ├─ landing-page
│  ├─ partials
│  ├─ svg
│  ├─ task-board
│  ├─ ui
│  ├─ blank.jsx
│  ├─ dashboard-select.jsx
│  ├─ dashboard-dropdown.jsx
│  ├─ date-picker-with-range.jsx
│  ├─ delete-confirmation-dialog.jsx
│  ├─ error-block.jsx
│  ├─ header-search.jsx
│  ├─ layout-order.jsx
│  └─ ripple.jsx
│
├─ config
├─ hooks
├─ lib
│  ├─ docs
│  ├─ appex-chat-options.jsx
│  ├─ auth.js
│  └─ utils.js
│
├─ pages
│  ├─ docs
│  ├─ _app.jsx
│  └─ _meta.json
│
├─ provider
├─ public
├─ store
├─ .env.local
├─ .gitignore
├─ jsconfig.json
├─ middleware.js
├─ next.env.d.ts
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ README.md
├─ postcss.config.js
├─ theme.config.js
└─ yarn.lock
```

---

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** or **pnpm**
- **Git** (for version control)

---

## 📦 Installation

### 1. Clone or Download Template

```bash
# If you have access to the repository
git clone [repository-url]
cd dashtail-template

# Or download and extract the ZIP file
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Copy from .env.example if available
cp .env.example .env.local
```

**Required Environment Variables:**

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Prisma)
DATABASE_URL="your_database_connection_string"

# Authentication (NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here

# Add other required variables based on your features
```

### 4. Run Development Server

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Remotive Logistics SalesDash Customizations

### Current Stack

```
- Vercel (Hosting) - Free Tier
- GitHub (Version Control) - Free
- Firebase (Real-time features) - Free Tier
- Prisma (ORM) - Free
- Neon Postgres (Database) - Free Tier
- Resend (Email Service) - Free Tier
- Google Cloud Console - Free Tier
```

### Custom Features Added

1. **CRM System**
   - Customer management
   - Lead tracking
   - Activity logging
   - Notes system

2. **Authentication**
   - NextAuth.js integration
   - Role-based access (Owner, Director, Manager, Rep)
   - Session management

3. **Finance Calculator**
   - Payment calculations
   - PDF quote generation
   - Credit applications

4. **Inventory Management**
   - Live inventory tracking
   - Image management
   - Pricing automation

5. **User Management**
   - Team hierarchy
   - Manager assignments
   - Permission controls

6. **SMS System** (In Development)
   - Vonage integration
   - Customer texting
   - Message history

---

## 📝 Creating New Pages

### 1. Dashboard Page

```javascript
// app/(dashboard)/new-page/page.jsx

export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
      {/* Your content */}
    </div>
  )
}
```

### 2. Add to Navigation

```javascript
// config/menus.js or similar

{
  title: "New Page",
  icon: "heroicons-outline:home",
  href: "/new-page",
}
```

---

## 🎨 Customization

### Theme Colors

Located in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {...},
      secondary: {...},
      // Add custom colors
    }
  }
}
```

### Layout Customization

Main layout file: `app/(dashboard)/layout.jsx`

Components:
- Header: `components/partials/header`
- Sidebar: `components/partials/sidebar`
- Footer: `components/partials/footer`

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables on Vercel

1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add all variables from `.env.local`

---

## 📚 Additional Resources

### Official Links
- **Documentation**: https://dash-tail.vercel.app/docs
- **Support**: Contact template provider
- **Updates**: Check for template updates regularly

### Remotive Logistics Project Links
- **Repository**: [Your GitHub Repo]
- **Production**: [Your Vercel URL]
- **Staging**: [Your Staging URL if applicable]

---

## 🆘 Troubleshooting

### Common Issues

**1. Module Not Found Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

**2. Build Errors**
```bash
# Check Next.js version compatibility
npm list next

# Update if needed
npm update next
```

**3. Environment Variables Not Loading**
```bash
# Restart dev server after .env changes
# Ensure file is named .env.local (not .env)
```

**4. Database Connection Issues**
```bash
# Test Prisma connection
npx prisma db pull

# Regenerate client
npx prisma generate
```

---

## 📞 Support

For template-related issues:
- Check official documentation
- Contact DashTail support

For Remotive Logistics SalesDash issues:
- Contact Kenneth Cestero (Project Lead)
- Check internal documentation

---

## 📄 License

DashTail Template - Licensed to Remotive Logistics
- Lifetime updates included
- Single project license
- Source code access via GitHub

---

## 🎯 Next Steps

1. ✅ Complete SMS integration
2. ✅ Fix authentication issues
3. ✅ Sync all 700+ leads
4. ✅ Add training video system
5. ✅ Implement Messenger bridge
6. ✅ Complete user management permissions
7. ✅ Fix credit application flow

---

## 📝 Notes

This documentation is maintained for the Remotive Logistics SalesDash project. Keep this file updated as new features are added or configurations change.

**Last Updated**: October 20, 2025
**Maintained By**: Kenneth Cestero & Development Team
**Template Version**: DashTail (Next.js 14 + Tailwind CSS 4)

---

## 🔗 Quick Links

- [DashTail Docs](https://dash-tail.vercel.app/docs/introduction)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Vercel Docs](https://vercel.com/docs)
