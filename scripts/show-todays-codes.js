const crypto = require('crypto');

function getTodayStamp() {
  const now = new Date();
  const ny = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now)
    .reduce((a, p) => {
      if (p.type !== 'literal') a[p.type] = p.value;
      return a;
    }, {});

  return `${ny.year}-${ny.month}-${ny.day}`;
}

function todayCodeForRole(role) {
  const stamp = getTodayStamp();
  const secret = process.env.AUTH_SECRET || 'dev';
  const salt = `${stamp}-${role}`;
  const h = crypto.createHmac('sha256', secret).update(salt).digest('hex');
  return h.slice(0, 6).toUpperCase();
}

console.log('📅 Date Stamp:', getTodayStamp());
console.log('');
console.log('🔑 TODAY\'S SECRET CODES:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('👤 SALESPERSON (REP):', todayCodeForRole('salesperson'));
console.log('👨‍💼 MANAGER (SMA):', todayCodeForRole('manager'));
console.log('👑 OWNER (DIR/VIP):', todayCodeForRole('owner'));
console.log('');
console.log('✅ Also valid (test codes):');
console.log('   OWNER1 → owner');
console.log('   MGR001 → manager');
console.log('   REP001 → salesperson');
