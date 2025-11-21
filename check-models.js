const { PrismaClient } = require('./lib/generated/prisma');
const prisma = new PrismaClient();

async function checkModels() {
  console.log('Checking which models exist...\n');

  const models = [
    'user', 'customer', 'lead', 'leadEvent', 'leadNote',
    'activity', 'email', 'quote', 'quoteActivity',
    'creditApplication', 'deal', 'deliveryRecord',
    'internalMessage', 'chatMessage', 'chatThread', 'chatAttachment',
    'calendarEvent', 'session', 'account', 'dashboardVisit',
    'pushSubscription', 'webAuthnCredential', 'trailerRequest',
    'trailer', 'emailTemplate', 'helpArticle', 'pricingPolicy', 'uploadReport'
  ];

  for (const model of models) {
    try {
      if (prisma[model]) {
        const count = await prisma[model].count();
        console.log(`✓ ${model}: ${count}`);
      } else {
        console.log(`✗ ${model}: NOT FOUND IN PRISMA CLIENT`);
      }
    } catch (error) {
      console.log(`✗ ${model}: ERROR - ${error.message}`);
    }
  }

  await prisma.$disconnect();
}

checkModels();
