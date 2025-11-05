const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateUniqueRepCode() {
  let isUnique = false;
  let repCode = '';
  
  while (!isUnique) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    repCode = `REP${randomDigits}`;
    
    const existing = await prisma.userProfile.findUnique({
      where: { repCode }
    });
    
    if (!existing) isUnique = true;
  }
  
  return repCode;
}

async function main() {
  const email = 'kencestero@gmail.com';
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true }
  });
  
  if (!user || !user.profile) {
    console.log('User or profile not found!');
    return;
  }
  
  console.log('Current Rep Code:', user.profile.repCode || 'NULL');
  
  const newRepCode = await generateUniqueRepCode();
  console.log('Generated Rep Code:', newRepCode);
  
  await prisma.userProfile.update({
    where: { userId: user.id },
    data: { repCode: newRepCode }
  });
  
  console.log('\n✅ SUCCESS! Rep code added!');
  console.log('\n🎉 Your Credit Application Link:');
  console.log(`https://mjcargotrailers.com/credit-application/${newRepCode}`);
  console.log('\nShare this link with customers to track applications!');
}

main().finally(() => prisma.$disconnect());
