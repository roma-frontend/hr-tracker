# 🚀 Implementation Plan: TOP 3 Killer Features

## 📋 Overview

**Timeline:** 6-8 weeks  
**Features:**
1. 🇦🇲 Armenian Localization (Week 1-2)
2. 📱 Telegram Bot Integration (Week 3-4)
3. 💰 Salary Calculator + Armenian Taxes (Week 5-8)

---

## 🇦🇲 PHASE 1: Armenian Localization (1-2 weeks)

### **Week 1: Setup i18n Framework**

**Step 1: Install next-intl**
```bash
npm install next-intl
```

**Step 2: Setup folder structure**
```
src/
  i18n/
    locales/
      en.json
      hy.json (Armenian)
    config.ts
  middleware.ts (language detection)
```

**Step 3: Configure next.config.js**
- Add i18n support
- Default locale: en
- Available locales: en, hy

### **Week 2: Translations**

**Files to translate (priority order):**
1. ✅ Landing page
2. ✅ Dashboard
3. ✅ Leave management
4. ✅ Time tracking
5. ✅ Settings
6. ✅ Auth pages (login, register)
7. ✅ Admin pages
8. ✅ Reports

**Armenian Holidays Integration:**
```typescript
const armenianHolidays = [
  { date: '2026-01-01', name: 'Նոր Տարի' },
  { date: '2026-01-06', name: 'Սուրբ Ծնունդ' },
  { date: '2026-03-08', name: 'Կանանց տոն' },
  { date: '2026-04-07', name: 'Մայրության և գեղեցկության տոն' },
  { date: '2026-04-24', name: 'Հայոց ցեղասպանության զոհերի հիշատակի օր' },
  { date: '2026-05-01', name: 'Աշխատանքի օր' },
  { date: '2026-05-09', name: 'Հաղթանակի տոն' },
  { date: '2026-05-28', name: 'Հանրապետության օր' },
  { date: '2026-07-05', name: 'Սահմանադրության օր' },
  { date: '2026-09-21', name: 'Անկախության օր' },
  { date: '2026-12-31', name: 'Նոր տարվա գիշեր' },
]
```

**Language Switcher Component:**
- Add flag icons (🇬🇧 🇦🇲)
- Store preference in cookies
- Auto-detect browser language

---

## 📱 PHASE 2: Telegram Bot Integration (2 weeks)

### **Week 3: Setup Telegram Bot**

**Step 1: Create Telegram Bot**
1. Talk to [@BotFather](https://t.me/botfather)
2. `/newbot` → Name: "HR Office Bot"
3. Get API Token
4. Add to `.env.local`:
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
```

**Step 2: Install Dependencies**
```bash
npm install node-telegram-bot-api
npm install @types/node-telegram-bot-api --save-dev
```

**Step 3: Create Bot Handler**
```
src/
  lib/
    telegram/
      bot.ts
      commands.ts
      handlers.ts
  app/
    api/
      telegram/
        webhook/
          route.ts
```

### **Week 4: Implement Features**

**A. Notifications Integration**

Replace email notifications with Telegram:
```typescript
// Before
await sendEmail({
  to: user.email,
  subject: 'Leave Request Approved',
  body: '...'
})

// After
await sendTelegramMessage({
  chatId: user.telegramChatId,
  message: '✅ Your leave request has been approved!'
})
```

**B. Bot Commands**

Implement commands:
```typescript
// /start - Link account
// /status - Check leave balance
// /leave [days] [reason] - Request leave
// /today - Who's in office today
// /report - Monthly summary
// /help - Show all commands
```

**C. Setup Flow**
1. User gets link from web app
2. Click link → Opens Telegram bot
3. Bot sends verification code
4. User confirms → Account linked
5. Start receiving notifications

**D. Admin Features**
```typescript
// Admin-only commands
// /approve [request_id] - Approve leave
// /reject [request_id] [reason] - Reject leave
// /broadcast [message] - Send to all employees
```

---

## 💰 PHASE 3: Salary Calculator + Armenian Taxes (3-4 weeks)

### **Week 5-6: Backend Setup**

**Step 1: Create Salary Schema (Convex)**

```typescript
// convex/schema.ts
salaries: defineTable({
  userId: v.id("users"),
  organizationId: v.id("organizations"),
  
  // Base salary
  grossSalary: v.number(),
  
  // Deductions
  incomeTax: v.number(),          // 21-23%
  socialContributions: v.number(), // 3.5%
  otherDeductions: v.number(),
  
  // Net salary
  netSalary: v.number(),
  
  // Metadata
  month: v.string(),              // "2026-03"
  year: v.number(),
  status: v.string(),             // "draft", "approved", "paid"
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

**Step 2: Tax Calculation Logic**

```typescript
// lib/salary/armenianTaxes.ts

// Armenian Tax Rates (2026)
const TAX_BRACKETS = [
  { min: 0, max: 2_000_000, rate: 0.21 },     // Up to 2M AMD: 21%
  { min: 2_000_001, max: Infinity, rate: 0.23 } // Above 2M AMD: 23%
]

const SOCIAL_CONTRIBUTION_RATE = 0.035 // 3.5%

export function calculateArmenianTaxes(grossSalary: number) {
  // Income Tax (progressive)
  let incomeTax = 0
  let remaining = grossSalary
  
  for (const bracket of TAX_BRACKETS) {
    if (remaining <= 0) break
    
    const taxableInBracket = Math.min(
      remaining,
      bracket.max - bracket.min + 1
    )
    incomeTax += taxableInBracket * bracket.rate
    remaining -= taxableInBracket
  }
  
  // Social Contributions (flat rate)
  const socialContributions = grossSalary * SOCIAL_CONTRIBUTION_RATE
  
  // Net Salary
  const netSalary = grossSalary - incomeTax - socialContributions
  
  return {
    grossSalary,
    incomeTax: Math.round(incomeTax),
    socialContributions: Math.round(socialContributions),
    netSalary: Math.round(netSalary),
    effectiveTaxRate: ((incomeTax + socialContributions) / grossSalary) * 100
  }
}
```

**Step 3: Convex Functions**

```typescript
// convex/salaries.ts

export const calculateSalary = mutation({
  args: {
    userId: v.id("users"),
    grossSalary: v.number(),
    month: v.string(),
    bonuses: v.optional(v.number()),
    deductions: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Calculate taxes
    const taxes = calculateArmenianTaxes(args.grossSalary)
    
    // Save to database
    const salaryId = await ctx.db.insert("salaries", {
      userId: args.userId,
      organizationId: userOrg,
      grossSalary: args.grossSalary,
      incomeTax: taxes.incomeTax,
      socialContributions: taxes.socialContributions,
      netSalary: taxes.netSalary,
      month: args.month,
      status: "draft",
      createdAt: Date.now(),
    })
    
    return salaryId
  }
})

export const generatePayslip = query({
  args: { salaryId: v.id("salaries") },
  handler: async (ctx, args) => {
    const salary = await ctx.db.get(args.salaryId)
    // Return payslip data
    return salary
  }
})
```

### **Week 7-8: Frontend UI**

**Step 1: Salary Calculator Page**

```tsx
// src/app/(dashboard)/salaries/calculator/page.tsx

export default function SalaryCalculator() {
  const [grossSalary, setGrossSalary] = useState(0)
  const [result, setResult] = useState(null)
  
  const calculate = () => {
    const taxes = calculateArmenianTaxes(grossSalary)
    setResult(taxes)
  }
  
  return (
    <div>
      <h1>Salary Calculator (AMD)</h1>
      
      <Input
        type="number"
        value={grossSalary}
        onChange={(e) => setGrossSalary(Number(e.target.value))}
        placeholder="Gross Salary (AMD)"
      />
      
      <Button onClick={calculate}>Calculate</Button>
      
      {result && (
        <div className="results">
          <div>Gross Salary: {result.grossSalary.toLocaleString()} AMD</div>
          <div>Income Tax (21-23%): -{result.incomeTax.toLocaleString()} AMD</div>
          <div>Social Contributions (3.5%): -{result.socialContributions.toLocaleString()} AMD</div>
          <hr />
          <div className="net">Net Salary: {result.netSalary.toLocaleString()} AMD</div>
          <div>Effective Tax Rate: {result.effectiveTaxRate.toFixed(2)}%</div>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Payslip Generation (PDF)**

```bash
npm install jspdf jspdf-autotable
```

```typescript
// lib/salary/payslipGenerator.ts

export function generatePayslipPDF(salary: SalaryData) {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text('Payslip / Վճարման թերթիկ', 105, 20, { align: 'center' })
  
  // Employee Info
  doc.setFontSize(12)
  doc.text(`Employee: ${salary.userName}`, 20, 40)
  doc.text(`Month: ${salary.month}`, 20, 50)
  
  // Salary Breakdown Table
  doc.autoTable({
    startY: 70,
    head: [['Item', 'Amount (AMD)']],
    body: [
      ['Gross Salary', salary.grossSalary.toLocaleString()],
      ['Income Tax (-)', salary.incomeTax.toLocaleString()],
      ['Social Contributions (-)', salary.socialContributions.toLocaleString()],
      ['Net Salary', salary.netSalary.toLocaleString()],
    ],
  })
  
  // Save
  doc.save(`payslip-${salary.month}.pdf`)
}
```

**Step 3: Bulk Salary Processing**

```tsx
// src/app/(dashboard)/admin/salaries/bulk/page.tsx

// Upload CSV with employee salaries
// Process all at once
// Export for bank (Ameriabank format)
```

---

## 🎯 Success Metrics

After completion, you should have:

### **Armenian Localization:**
- ✅ Full Armenian translation (500+ strings)
- ✅ Armenian holidays integrated
- ✅ Language switcher working
- ✅ All documents support Armenian

### **Telegram Bot:**
- ✅ Bot running 24/7
- ✅ Leave requests via Telegram
- ✅ Real-time notifications
- ✅ 5+ commands working
- ✅ 90% users prefer Telegram over email

### **Salary Calculator:**
- ✅ Accurate Armenian tax calculation
- ✅ PDF payslip generation
- ✅ Bulk processing for admins
- ✅ Export for banks
- ✅ Monthly salary history

---

## 📦 Deliverables

1. **Code:** All features implemented and tested
2. **Documentation:** User guides in Armenian and English
3. **Demo Video:** Show all 3 features
4. **Marketing Assets:** Screenshots, GIFs
5. **Blog Post:** "First HR system with Armenian taxes"

---

## 💰 Expected ROI

**Investment:**
- 6-8 weeks development
- $0 additional costs (uses existing stack)

**Return:**
- 80% of Armenian market accessible
- Professional plan becomes attractive ($29/mo)
- Unique selling point vs competitors
- Ready for enterprise sales

---

## 🚀 Let's Start!

Ready to begin? I'll start with Phase 1: Armenian Localization!
