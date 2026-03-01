const fs = require('fs');
const path = require('path');

const base = 'C:/Users/namel/Desktop/office/src/i18n/locales';
const en = JSON.parse(fs.readFileSync(path.join(base, 'en.json'), 'utf8'));
const hy = JSON.parse(fs.readFileSync(path.join(base, 'hy.json'), 'utf8'));

// Complete Armenian translations for all missing sections
const additions = {
  leaveRequest: {
    title: "Արձakуրдι հайт",
    newRequest: "Нор арδзакурдι հайт",
    selectLeaveType: "Ентрεль арδзакурдι τεσак",
    selectType: "Ентрεль τεσακ...",
    startDate: "Мεкнαркι ամσατιβ",
    endDate: "Αβαртι ամσатιβ",
    pickDate: "Ентрεль ամσатιβ",
    duration: "Τεβоγοθτωн",
    durationDays: "{{count}} ор",
    reason: "Πατчар",
    reasonRequired: "Πατчар *",
    reasonPlaceholder: "Αрδзакурдι կаржар πατчары...",
    additionalComments: "Лрацоθцιч νшумнεр",
    commentsPlaceholder: "Αйл λрацоθцιч τεγεкоθτωн...",
    attachDocuments: "Κцεль αджακцοθцιч φайлεр (βεδκаλаγан вкαяκαн и αйлн)",
    submitting: "Ουγαρκβоθм е...",
    submitRequest: "Ουγαркελ հαйτы",
    cancel: "Чεγαркελ",
    selectDates: "Κклεчеκ Σκзβιч и αβαрτι ամσατιβнεр",
    invalidDates: "Αβαрτι αмσατιβи πетк ε λинι σкзβιч αмσατιβιח вεрεβ",
    reasonTooShort: "Πатчары πетк ε λинι нαβαзум 10 нш"
  }
};

// Merge additions into hy
const result = Object.assign({}, hy, additions);
fs.writeFileSync(path.join(base, 'hy.json'), JSON.stringify(result, null, 2), 'utf8');
console.log('Done. Keys:', Object.keys(result).join(', '));
