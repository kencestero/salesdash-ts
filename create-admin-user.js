/**
 * Create Admin User for Kenneth Cestero
 *
 * Creates a single owner account with full access
 */

const { PrismaClient } = require('./lib/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('\n' + '='.repeat(80));
  console.log('CREATING ADMIN USER FOR KENNETH CESTERO');
  console.log('='.repeat(80));

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'kencestero@gmail.com' }
    });

    if (existingUser) {
      console.log('\n✅ User already exists!');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.name}`);
      return;
    }

    // Hash password: Kenosky772006@
    const hashedPassword = await bcrypt.hash('Kenosky772006@', 12);

    // Create user and profile in transaction
    const user = await prisma.user.create({
      data: {
        email: 'kencestero@gmail.com',
        name: 'Kenneth Cestero',
        password: hashedPassword,
        emailVerified: new Date(), // Mark as verified
        image: null,
        profile: {
          create: {
            role: 'owner',
            status: 'employee',
            accountStatus: 'active',
            isActive: true,
            repCode: 'REP000001', // Special rep code for owner
            isAvailableAsManager: true,

            // Grant all permissions
            canAccessCRM: true,
            canAccessInventory: true,
            canAccessConfigurator: true,
            canAccessCalendar: true,
            canAccessReports: true,
            canManageUsers: true,
          }
        }
      },
      include: {
        profile: true
      }
    });

    console.log('\n✅ USER CREATED SUCCESSFULLY!\n');
    console.log('Login Credentials:');
    console.log('==================');
    console.log(`Email:    kencestero@gmail.com`);
    console.log(`Password: Kenosky772006@`);
    console.log(`Role:     Owner`);
    console.log(`Rep Code: ${user.profile.repCode}`);
    console.log('\n' + '='.repeat(80));
    console.log('You can now log in to the SalesDash at:');
    console.log('https://mjsalesdash.com/en/auth/login');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR CREATING USER:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
