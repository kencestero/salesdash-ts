/**
 * Seed script for gamification system
 * Creates: House account, default badges, and help content
 *
 * Run with: npx ts-node prisma/seed-gamification.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting gamification seed...\n");

  // ================================
  // 1. Create House Account
  // ================================
  console.log("📦 Creating House account...");

  const houseEmail = "house@remotivelogistics.com";
  const existingHouse = await prisma.user.findUnique({
    where: { email: houseEmail }
  });

  // Also check if repCode already exists
  const existingRepCode = await prisma.userProfile.findUnique({
    where: { repCode: "REP000001" }
  });

  if (!existingHouse && !existingRepCode) {
    const hashedPassword = await bcrypt.hash("House@RemotiveLogistics2025!", 10);

    const houseUser = await prisma.user.create({
      data: {
        email: houseEmail,
        name: "House Account",
        password: hashedPassword,
        emailVerified: new Date(),
        profile: {
          create: {
            firstName: "House",
            lastName: "Account",
            role: "salesperson",
            repCode: "REP000001", // Special house rep code
            status: "employee",
            accountStatus: "active",
            canAccessCRM: true,
            canAccessInventory: true,
            canAccessConfigurator: true,
            canAccessCalendar: false,
            canAccessReports: false,
            canManageUsers: false,
            canAdminCRM: false,
            isAvailableAsManager: false,
            isActive: true,
            about: "System account for store sales, direct sales, and owner/director sales. Sales attributed to House do not count toward individual rep rankings but are included in total company numbers."
          }
        }
      }
    });
    console.log(`✅ House account created: ${houseUser.id}`);
  } else if (existingHouse) {
    console.log("ℹ️  House account already exists");
  } else if (existingRepCode) {
    console.log("ℹ️  House rep code (REP000001) already assigned to another user - updating that profile");
    // Update the existing profile to be the house account
    await prisma.userProfile.update({
      where: { repCode: "REP000001" },
      data: {
        firstName: "House",
        lastName: "Account",
        about: "System account for store sales, direct sales, and owner/director sales. Sales attributed to House do not count toward individual rep rankings but are included in total company numbers."
      }
    });
  }

  // ================================
  // 2. Create Default Badges
  // ================================
  console.log("\n🏆 Creating default badges...");

  const badges = [
    // Sales Milestone Badges
    {
      name: "First Sale",
      description: "Closed your first deal! Welcome to the sales floor.",
      icon: "🎯",
      color: "#22C55E",
      category: "sales_milestone",
      requirement: 1,
      sortOrder: 1
    },
    {
      name: "10 Units Sold",
      description: "Reached 10 total units sold. You're building momentum!",
      icon: "🔟",
      color: "#3B82F6",
      category: "sales_milestone",
      requirement: 10,
      sortOrder: 2
    },
    {
      name: "30 Units Sold",
      description: "30 trailers moved! You're a consistent performer.",
      icon: "📈",
      color: "#8B5CF6",
      category: "sales_milestone",
      requirement: 30,
      sortOrder: 3
    },
    {
      name: "50 Units Sold",
      description: "Half a century of sales! You're a force to be reckoned with.",
      icon: "🏅",
      color: "#F59E0B",
      category: "sales_milestone",
      requirement: 50,
      sortOrder: 4
    },
    {
      name: "75 Units Sold",
      description: "75 happy customers! You're in the big leagues now.",
      icon: "⭐",
      color: "#EC4899",
      category: "sales_milestone",
      requirement: 75,
      sortOrder: 5
    },
    {
      name: "Century Club",
      description: "100 units sold! Welcome to the Century Club - elite status.",
      icon: "💯",
      color: "#E96114",
      category: "sales_milestone",
      requirement: 100,
      sortOrder: 6
    },
    {
      name: "Sales Legend",
      description: "500 units sold! You are a true Remotive legend.",
      icon: "👑",
      color: "#FFD700",
      category: "sales_milestone",
      requirement: 500,
      sortOrder: 7
    },

    // Trailer Type Badges - Enclosed
    {
      name: "Enclosed Expert",
      description: "Sold 10 enclosed trailers. You know cargo protection!",
      icon: "📦",
      color: "#E96114",
      category: "trailer_type",
      requirement: 10,
      trailerType: "Enclosed",
      sortOrder: 10
    },

    // Trailer Type Badges - Utility
    {
      name: "Utility Specialist",
      description: "Sold 10 utility trailers. Versatility is your game!",
      icon: "🔧",
      color: "#09213C",
      category: "trailer_type",
      requirement: 10,
      trailerType: "Utility",
      sortOrder: 11
    },

    // Trailer Type Badges - Dump
    {
      name: "Dump Pro",
      description: "Sold 10 dump trailers. Heavy duty is your specialty!",
      icon: "🚛",
      color: "#78716C",
      category: "trailer_type",
      requirement: 10,
      trailerType: "Dump",
      sortOrder: 12
    },

    // Size Badges
    {
      name: "6x10 Specialist",
      description: "Sold 10 units of 6x10 trailers. Compact and mighty!",
      icon: "📐",
      color: "#22D3EE",
      category: "trailer_size",
      requirement: 10,
      trailerType: "6x10",
      sortOrder: 20
    },
    {
      name: "6x12 Specialist",
      description: "Sold 10 units of 6x12 trailers. The popular choice!",
      icon: "📐",
      color: "#2DD4BF",
      category: "trailer_size",
      requirement: 10,
      trailerType: "6x12",
      sortOrder: 21
    },
    {
      name: "7x14 Specialist",
      description: "Sold 10 units of 7x14 trailers. Room to grow!",
      icon: "📐",
      color: "#34D399",
      category: "trailer_size",
      requirement: 10,
      trailerType: "7x14",
      sortOrder: 22
    },
    {
      name: "7x16 Specialist",
      description: "Sold 10 units of 7x16 trailers. Space masters!",
      icon: "📐",
      color: "#4ADE80",
      category: "trailer_size",
      requirement: 10,
      trailerType: "7x16",
      sortOrder: 23
    },
    {
      name: "8x16 Specialist",
      description: "Sold 10 units of 8x16 trailers. Business class!",
      icon: "📐",
      color: "#A3E635",
      category: "trailer_size",
      requirement: 10,
      trailerType: "8x16",
      sortOrder: 24
    },
    {
      name: "8x20 Specialist",
      description: "Sold 10 units of 8x20 trailers. Big haulers unite!",
      icon: "📐",
      color: "#FACC15",
      category: "trailer_size",
      requirement: 10,
      trailerType: "8x20",
      sortOrder: 25
    },
    {
      name: "8x24 Specialist",
      description: "Sold 10 units of 8x24 trailers. Maximum capacity expert!",
      icon: "📐",
      color: "#FB923C",
      category: "trailer_size",
      requirement: 10,
      trailerType: "8x24",
      sortOrder: 26
    },

    // Certification Badges
    {
      name: "Academy Certified Rep",
      description: "Completed all Remotive SalesHub Academy training modules. You're officially certified!",
      icon: "🎓",
      color: "#7C3AED",
      category: "certification",
      requirement: null,
      sortOrder: 50
    },

    // Experience Badges
    {
      name: "30 Day Streak",
      description: "Made at least one sale for 30 consecutive days. Consistency is key!",
      icon: "🔥",
      color: "#EF4444",
      category: "experience",
      requirement: 30,
      sortOrder: 60
    },
    {
      name: "Monthly Champion",
      description: "Achieved #1 in sales for a full month. Champion status!",
      icon: "🏆",
      color: "#F59E0B",
      category: "experience",
      requirement: null,
      sortOrder: 61
    },
    {
      name: "Goal Crusher",
      description: "Exceeded monthly goal by 50% or more. Over-achiever!",
      icon: "💪",
      color: "#10B981",
      category: "experience",
      requirement: null,
      sortOrder: 62
    }
  ];

  for (const badge of badges) {
    const existing = await prisma.badge.findUnique({
      where: { name: badge.name }
    });

    if (!existing) {
      await prisma.badge.create({ data: badge });
      console.log(`  ✅ Created badge: ${badge.name}`);
    } else {
      console.log(`  ℹ️  Badge exists: ${badge.name}`);
    }
  }

  // ================================
  // 3. Create Help Content
  // ================================
  console.log("\n📚 Creating help content...");

  const helpContents = [
    {
      section: "profile_friends",
      title: "Friends System",
      content: `## How Friends Work

Friends can see more details about your profile and sales performance:

- **Public info**: Your name, role, badges earned, and unit count
- **Friend-only info**: Detailed sales stats, monthly progress, recent activity

### Adding Friends
1. Search for a colleague by name or email
2. Send a friend request
3. Once accepted, you'll appear on each other's friends lists

### Privacy Note
Friends can see your sales stats but **never** gross revenue amounts. Only managers can see financial details.`,
      rules: `### Friend Rules
- Maximum 100 friends per user
- Friend requests expire after 30 days
- You can unfriend someone at any time
- Blocked users cannot send you friend requests`,
    },
    {
      section: "profile_blocked",
      title: "Blocking Users",
      content: `## Blocking & Privacy

When you block someone:
- They cannot see your profile
- They cannot send you messages
- They cannot find you in search
- They cannot send friend requests
- They are removed from your friends list if connected

### How to Block
1. Visit the user's profile
2. Click the three-dot menu
3. Select "Block User"

Blocking is completely private - the blocked user will not be notified.`,
      rules: `### Block Rules
- Blocking is instant and permanent until unblocked
- You can unblock someone anytime from Settings
- Managers can still see basic info for team members even if blocked
- Blocked users see no indication they've been blocked`
    },
    {
      section: "profile_teams",
      title: "Teams",
      content: `## Team System

Teams are automatically created when someone becomes a manager. Each team can have up to 10 members.

### Team Features
- Team leaderboards and goals
- Team chat (coming soon)
- Combined team stats
- Team celebrations for achievements

### Joining a Team
Teams are assigned by your manager or director. If you need to change teams, speak with your manager.`,
      rules: `### Team Rules
- One team per rep (you can only be on one team)
- Maximum 10 members per team
- Team leads have additional visibility
- Leaving a team requires manager approval`
    },
    {
      section: "profile_badges",
      title: "Badges & Achievements",
      content: `## Earning Badges

Badges are automatically awarded based on your sales performance:

### Sales Milestones
- First Sale, 10 Units, 30 Units, 50 Units, 75 Units, 100 Units (Century Club), 500 Units (Legend)

### Trailer Specializations
- Sell 10 of a specific trailer type (Enclosed, Utility, Dump) or size (6x10, 7x14, 8x20, etc.)

### Certifications
- Complete all Academy training modules for the "Academy Certified Rep" badge

### Experience Badges
- 30-Day Streak, Monthly Champion, Goal Crusher

Badges are displayed on your profile and visible to all users.`,
      rules: `### Badge Rules
- Badges are permanent once earned
- Some badges are rarer than others
- Badge progress is tracked automatically
- You'll be notified when you earn a new badge`
    },
    {
      section: "monthly_goals",
      title: "Monthly Goals",
      content: `## Setting Monthly Goals

On the 1st of each month, you'll be prompted to set your sales goal (1-99 units).

### How It Works
1. Set your goal on the 1st (or within the first few days)
2. Track your progress throughout the month
3. Receive reminders every other day
4. Managers can adjust goals until the 20th
5. After the 20th, goals are locked

### Goal Tips
- Start realistic and increase over time
- Beating your goal earns the "Goal Crusher" badge
- Goals are visible to your manager and friends`,
      rules: `### Goal Rules
- Goals must be between 1-99 units
- You can only edit your own goal before the 20th
- Managers can edit their team's goals until the 20th
- If no goal is set, your previous month's actual becomes the default
- Missing goals 3 months in a row triggers a manager notification`
    },
    {
      section: "progression_page",
      title: "Progression Dashboard",
      content: `## Manager's Progression View

The Progression page gives managers full visibility into their team's performance:

### Available Data
- **Sales**: Units sold, revenue, profit margins
- **Activity**: Calls, emails, meetings, follow-ups
- **Goals vs Actual**: Monthly goal progress
- **Trends**: Week-over-week and month-over-month changes
- **Pipeline**: Active deals and estimated closings

### Privacy Note
Financial data (revenue, profit) is only visible to managers and above. Reps see unit counts only.`,
      rules: `### Access Rules
- Managers see their direct reports only
- Directors see all teams
- Owners see company-wide data
- Reps cannot access the Progression page`
    }
  ];

  for (const help of helpContents) {
    const existing = await prisma.helpContent.findUnique({
      where: { section: help.section }
    });

    if (!existing) {
      await prisma.helpContent.create({ data: help });
      console.log(`  ✅ Created help: ${help.title}`);
    } else {
      console.log(`  ℹ️  Help exists: ${help.title}`);
    }
  }

  console.log("\n✨ Gamification seed complete!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
