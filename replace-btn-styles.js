const fs = require('fs');
const path = require('path');

const TARGET = 'bg-linear-to-r from-(--primary) to-(--primary-dark,var(--primary)) hover:opacity-90 transition-opacity';
const REPLACEMENT = 'btn-gradient';

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === '.next' || file === '.git') continue;
      results = results.concat(walkDir(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

const srcDir = path.join('C:\\Users\\User\\Desktop\\hr-project', 'src');
const files = walkDir(srcDir);
let totalReplacements = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes(TARGET)) {
    const newContent = content.split(TARGET).join(REPLACEMENT);
    const count = (content.split(TARGET).length - 1);
    fs.writeFileSync(file, newContent, 'utf8');
    totalReplacements += count;
    console.log(`${file}: ${count} replacement(s)`);
  }
}

console.log(`\nTotal: ${totalReplacements} replacements across ${files.length} files scanned.`);
