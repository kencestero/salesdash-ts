const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_ligVGFAqh10N@ep-snowy-leaf-ad9rqm9s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require",
  });

  await client.connect();

  const email = 'kencestero@gmail.com';

  // Check if user already exists
  const existing = await client.query('SELECT * FROM "User" WHERE email = $1', [email]);

  if (existing.rows.length > 0) {
    console.log('✅ User already exists:', existing.rows[0].id);
    await client.end();
    return;
  }

  // Create user with random password (OAuth user)
  const randomPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  const userResult = await client.query(
    `INSERT INTO "User" (email, name, password, "emailVerified", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, NULL, NOW(), NOW())
     RETURNING id, email`,
    [email, 'Kence Stero', hashedPassword]
  );

  const userId = userResult.rows[0].id;
  console.log('✅ Created user:', userId);

  // Generate unique salesperson code for owner
  const salespersonCode = 'VIP' + Math.floor(10000 + Math.random() * 90000);

  // Create user profile with owner role
  await client.query(
    `INSERT INTO "UserProfile" ("userId", "firstName", "lastName", "salespersonCode", role, member, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, false, NOW(), NOW())`,
    [userId, 'Kence', 'Stero', salespersonCode, 'owner']
  );

  console.log('✅ Created profile with role: owner, code:', salespersonCode);
  console.log('\n�� User is ready! Now click the verification link to complete signup.');

  await client.end();
}

main().catch(console.error);
