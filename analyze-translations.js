const fs = require('fs');

const ru = JSON.parse(fs.readFileSync('src/i18n/locales/ru.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8'));
const hy = JSON.parse(fs.readFileSync('src/i18n/locales/hy.json', 'utf8'));

console.log('=== ՓՆՏՐՈՒՄ ԵՆՔ ՉՈՒՆԻՖԻԿԱՑՎԱԾ ԲԱՆԱԼԻՆԵՐ ===\n');

// Find duplicate keys across sections
const allKeys = {};
const sections = Object.keys(ru);

sections.forEach(section => {
  if (typeof ru[section] === 'object') {
    Object.keys(ru[section]).forEach(key => {
      const fullKey = `${section}.${key}`;
      if (!allKeys[fullKey]) allKeys[fullKey] = [];
      allKeys[fullKey].push(section);
    });
  }
});

// Find similar keys (case insensitive, plurals, etc.)
const keyMap = {};
sections.forEach(section => {
  if (typeof ru[section] === 'object') {
    Object.keys(ru[section]).forEach(key => {
      const lowerKey = key.toLowerCase();
      const normalizedKey = `${section}.${lowerKey}`;
      if (!keyMap[normalizedKey]) keyMap[normalizedKey] = [];
      keyMap[normalizedKey].push(`${section}.${key}`);
    });
  }
});

// Find duplicates
const duplicates = {};
Object.keys(keyMap).forEach(key => {
  if (keyMap[key].length > 1) {
    duplicates[key] = keyMap[key];
  }
});

console.log('🔴 ԳՏՆՎԱԾ ԴՈՒԲԼԻԿԱՏՆԵՐ ԵՆ ՆՄԱՆ ԲԱՆԱԼԻՆԵՐ:\n');
Object.keys(duplicates).slice(0, 30).forEach(key => {
  console.log(`  ${key}:`);
  duplicates[key].forEach(variant => {
    console.log(`    - ${variant}`);
  });
});

// Find common translation keys that should be unified
const commonKeys = {
  'loading': ['loading', 'common.loading', 'superadmin.loading'],
  'cancel': ['cancel', 'common.cancel', 'actions.cancel'],
  'save': ['save', 'common.save', 'actions.save'],
  'delete': ['delete', 'common.delete', 'actions.delete'],
  'edit': ['edit', 'common.edit', 'actions.edit'],
  'create': ['create', 'common.create', 'actions.create'],
  'submit': ['submit', 'common.submit', 'actions.submit'],
  'search': ['search', 'common.search'],
  'filter': ['filter', 'common.filter'],
  'back': ['back', 'common.back'],
  'next': ['next', 'common.next'],
  'previous': ['previous', 'common.previous'],
  'active': ['active', 'common.active', 'status.active', 'attendance.active'],
  'status': ['status', 'common.status', 'superadmin.status'],
  'description': ['description', 'common.description'],
  'reason': ['reason', 'common.reason', 'superadmin.reason'],
  'email': ['email', 'common.email', 'auth.email'],
  'organization': ['organization', 'common.organization', 'superadmin.organization'],
  'user': ['user', 'common.user', 'superadmin.user'],
  'departments': ['departments', 'common.departments'],
  'transparent': ['transparent', 'common.transparent'],
  'destructive': ['destructive', 'common.destructive'],
  'checkedIn': ['checkedIn', 'status.checkedIn', 'attendance.checkedIn'],
  'checkedOut': ['checkedOut', 'status.checkedOut', 'attendance.checkedOut'],
  'professional': ['professional', 'superadmin.professional', 'plan.professional'],
  'enterprise': ['enterprise', 'superadmin.enterprise', 'plan.enterprise'],
  'starter': ['starter', 'superadmin.starter', 'plan.starter'],
};

console.log('\n\n🔵 ՊՈՏԵՆՑԻԱԼ ՈՒՆԻՖԻԿԱՑԻԱՅԻ ԿԱՐԻՔ ՈՒՆԵՑՈՂ ԲԱՆԱԼԻՆԵՐ:\n');
Object.keys(commonKeys).forEach(baseKey => {
  const variants = commonKeys[baseKey];
  const found = [];
  variants.forEach(variant => {
    const [section, key] = variant.split('.');
    if (ru[section] && ru[section][key]) {
      found.push(variant);
    }
  });
  if (found.length > 1) {
    console.log(`  ${baseKey}:`);
    found.forEach(f => console.log(`    ✓ ${f}`));
  }
});

// Save analysis
fs.writeFileSync('translation-analysis.json', JSON.stringify({ duplicates, commonKeys }, null, 2));
console.log('\n\n💾 Վերլուծությունը պահպանված է translation-analysis.json ֆայլում');
