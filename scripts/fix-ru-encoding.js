#!/usr/bin/env node
/**
 * Fix Russian JSON encoding issue
 */

const fs = require('fs');
const path = require('path');

const ruPath = path.join(__dirname, '../src/i18n/locales/ru.json');

// Read the corrupt file
const content = fs.readFileSync(ruPath, 'utf8');
const json = JSON.parse(content);

// Fix socialProof section (the corrupted part)
json.socialProof = {
  activeUsers: "Активные пользователи",
  customerRating: "Рейтинг клиентов",
  uptime: "Время работы",
  countries: "Страны",
  trustedBy: "Нам доверяют",
  companies: "компании по всему миру",
  rating: "Рейтинг 4.9/5",
  reviews: "на основе 1000+ отзывов",
  customers: "Довольных клиентов",
  growth: "Рост из года в год"
};

// Write back with proper UTF-8 encoding
fs.writeFileSync(ruPath, JSON.stringify(json, null, 2), 'utf8');

console.log('✅ Fixed Russian file encoding');
