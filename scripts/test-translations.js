#!/usr/bin/env node

/**
 * Translation System Tests
 * Standalone test script that doesn't require Jest
 * Run with: node scripts/test-translations.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

let passedTests = 0;
let failedTests = 0;
const failures = [];

// Helper functions
function test(name, fn) {
  try {
    fn();
    passedTests++;
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } catch (error) {
    failedTests++;
    failures.push({ name, error: error.message });
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  ${colors.gray}${error.message}${colors.reset}`);
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value, but got ${actual}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toEqual(expected) {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(`Expected ${expectedStr}, but got ${actualStr}`);
      }
    },
    toHaveLength(length) {
      if (actual.length !== length) {
        throw new Error(`Expected length ${length}, but got ${actual.length}`);
      }
    },
  };
}

// Load translation files
const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');

let enTranslations, ruTranslations, hyTranslations;

try {
  enTranslations = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'en.json'), 'utf-8'));
  ruTranslations = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'ru.json'), 'utf-8'));
  hyTranslations = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'hy.json'), 'utf-8'));
} catch (error) {
  console.error(`${colors.red}Error loading translation files:${colors.reset}`, error.message);
  process.exit(1);
}

// Helper to get all keys from nested object
function getAllKeys(obj, prefix = '') {
  let keys = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys.sort();
}

// Helper to check for empty values
function checkNoEmptyValues(obj, prefix = '') {
  const emptyKeys = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      emptyKeys.push(...checkNoEmptyValues(obj[key], fullKey));
    } else if (obj[key] === '' || obj[key] === null || obj[key] === undefined) {
      emptyKeys.push(fullKey);
    }
  }
  
  return emptyKeys;
}

// Run tests
console.log(`\n${colors.cyan}Running Translation System Tests${colors.reset}\n`);

// Test Suite: File Structure
console.log(`${colors.yellow}File Structure${colors.reset}`);

test('should have en.json file', () => {
  expect(fs.existsSync(path.join(LOCALES_DIR, 'en.json'))).toBeTruthy();
});

test('should have ru.json file', () => {
  expect(fs.existsSync(path.join(LOCALES_DIR, 'ru.json'))).toBeTruthy();
});

test('should have hy.json file', () => {
  expect(fs.existsSync(path.join(LOCALES_DIR, 'hy.json'))).toBeTruthy();
});

test('should have valid JSON in all files', () => {
  expect(enTranslations).toBeTruthy();
  expect(ruTranslations).toBeTruthy();
  expect(hyTranslations).toBeTruthy();
});

// Test Suite: Key Parity
console.log(`\n${colors.yellow}Key Parity${colors.reset}`);

const enKeys = getAllKeys(enTranslations);
const ruKeys = getAllKeys(ruTranslations);
const hyKeys = getAllKeys(hyTranslations);

test('should have the same number of keys in all languages', () => {
  expect(ruKeys.length).toBe(enKeys.length);
  expect(hyKeys.length).toBe(enKeys.length);
});

test('should have identical key structure in Russian', () => {
  const missingInRu = enKeys.filter(key => !ruKeys.includes(key));
  const extraInRu = ruKeys.filter(key => !enKeys.includes(key));
  
  if (missingInRu.length > 0) {
    throw new Error(`Missing keys in Russian: ${missingInRu.join(', ')}`);
  }
  if (extraInRu.length > 0) {
    throw new Error(`Extra keys in Russian: ${extraInRu.join(', ')}`);
  }
});

test('should have identical key structure in Armenian', () => {
  const missingInHy = enKeys.filter(key => !hyKeys.includes(key));
  const extraInHy = hyKeys.filter(key => !enKeys.includes(key));
  
  if (missingInHy.length > 0) {
    throw new Error(`Missing keys in Armenian: ${missingInHy.join(', ')}`);
  }
  if (extraInHy.length > 0) {
    throw new Error(`Extra keys in Armenian: ${extraInHy.join(', ')}`);
  }
});

// Test Suite: Translation Completeness
console.log(`\n${colors.yellow}Translation Completeness${colors.reset}`);

test('should have no empty translation values in English', () => {
  const emptyKeys = checkNoEmptyValues(enTranslations);
  if (emptyKeys.length > 0) {
    throw new Error(`Empty keys in English: ${emptyKeys.join(', ')}`);
  }
});

test('should have no empty translation values in Russian', () => {
  const emptyKeys = checkNoEmptyValues(ruTranslations);
  if (emptyKeys.length > 0) {
    throw new Error(`Empty keys in Russian: ${emptyKeys.join(', ')}`);
  }
});

test('should have no empty translation values in Armenian', () => {
  const emptyKeys = checkNoEmptyValues(hyTranslations);
  if (emptyKeys.length > 0) {
    throw new Error(`Empty keys in Armenian: ${emptyKeys.join(', ')}`);
  }
});

// Test Suite: Required Sections
console.log(`\n${colors.yellow}Required Sections${colors.reset}`);

const requiredSections = [
  'common',
  'nav',
  'auth',
  'dashboard',
  'employees',
  'attendance',
  'leave', // Note: singular 'leave', not 'leaves'
  'settings',
  'errors',
  'success',
  'placeholders',
  'ui'
];

requiredSections.forEach(section => {
  test(`should have '${section}' section in all languages`, () => {
    expect(enTranslations[section]).toBeDefined();
    expect(ruTranslations[section]).toBeDefined();
    expect(hyTranslations[section]).toBeDefined();
  });
});

// Test Suite: Analytics Section
console.log(`\n${colors.yellow}Analytics Section${colors.reset}`);

const requiredAnalyticsKeys = [
  'analyticsDashboard',
  'hrMetricsOverview',
  'pendingLeaves',
  'approvedLeaves',
  'approvalRate'
];

requiredAnalyticsKeys.forEach(key => {
  test(`should have analytics.${key} in all languages`, () => {
    expect(enTranslations.analytics?.[key]).toBeDefined();
    expect(ruTranslations.analytics?.[key]).toBeDefined();
    expect(hyTranslations.analytics?.[key]).toBeDefined();
  });
});

// Print summary
console.log(`\n${colors.cyan}Test Summary${colors.reset}`);
console.log(`${colors.green}Passed:${colors.reset} ${passedTests}`);
console.log(`${colors.red}Failed:${colors.reset} ${failedTests}`);
console.log(`${colors.cyan}Total:${colors.reset} ${passedTests + failedTests}`);

console.log(`\n${colors.cyan}Translation Statistics${colors.reset}`);
console.log(`English keys: ${enKeys.length}`);
console.log(`Russian keys: ${ruKeys.length}`);
console.log(`Armenian keys: ${hyKeys.length}`);

if (failedTests > 0) {
  console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
  failures.forEach(({ name, error }) => {
    console.log(`  ${colors.red}✗${colors.reset} ${name}`);
    console.log(`    ${colors.gray}${error}${colors.reset}`);
  });
  process.exit(1);
} else {
  console.log(`\n${colors.green}✓ All tests passed!${colors.reset}`);
  process.exit(0);
}
