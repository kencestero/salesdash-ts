// Quick script to check your user role in the database
// Usage: node scripts/check-my-role.js <your-email@example.com>

const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

async function checkUserRole(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      return;
    }

    console.log('\n=== USER INFORMATION ===\n');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name || 'Not set'}`);
    console.log(`✅ Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
    console.log(`📅 Created: ${user.createdAt}`);

    if (user.profile) {
      console.log('\n=== PROFILE INFORMATION ===\n');
      console.log(`🏷️  Role: ${user.profile.role?.toUpperCase() || 'NOT SET'}`);
      console.log(`🎫 Salesperson Code: ${user.profile.salespersonCode || 'Not assigned'}`);
      console.log(`✅ Member Status: ${user.profile.member ? 'Active Member' : 'Not verified'}`);
      console.log(`📱 Phone: ${user.profile.phone || 'Not set'}`);
      console.log(`📍 ZIP: ${user.profile.zipcode || 'Not set'}`);
      console.log(`🏙️  City: ${user.profile.city || 'Not set'}`);

      console.log('\n=== ROLE BREAKDOWN ===\n');
      const roleMap = {
        'owner': '👑 OWNER - Full system access (can upload inventory, edit all)',
        'manager': '🎯 MANAGER - Can view reports, manage reps',
        'salesperson': '💼 SALESPERSON - Standard sales rep access',
        'director': '🔥 DIRECTOR - High-level access (between Manager and Owner)',
      };
      console.log(roleMap[user.profile.role] || '❓ Unknown role');

    } else {
      console.log('\n❌ No profile found for this user!');
      console.log('This user needs to complete profile setup.');
    }

    console.log('\n========================\n');
  } catch (error) {
    console.error('Error checking role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('\n❌ Please provide an email address');
  console.log('Usage: node scripts/check-my-role.js your-email@example.com\n');
  process.exit(1);
}

checkUserRole(email);
