const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
          results = results.concat(walkDir(filePath));
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(filePath);
      }
    }
  } catch(e) {}
  return results;
}

const files = walkDir('src');
let totalChanges = 0;

const argsToRemove = [
  'superadminUserId',
  'adminId',
  'requesterId',
  'senderId',
  'currentUserId',
  'assignedBy',
  'authorId',
  'uploadedBy',
  'reviewerId',
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  for (const arg of argsToRemove) {
    // Pattern: whole line with just this arg (indented)
    content = content.replace(new RegExp(`^[ \\t]*${arg}:[ \\t]*[^\\n]*,?[ \\t]*\\n`, 'gm'), '');
    
    // Pattern: inline with trailing comma: argName: expr,<space>
    content = content.replace(new RegExp(`${arg}:\\s*[\\w.!?]+(?:\\s+as\\s+[^,}]+)?,\\s*`, 'g'), '');
    
    // Pattern: inline last arg with leading comma: , argName: expr
    content = content.replace(new RegExp(`,\\s*${arg}:\\s*[\\w.!?]+(?:\\s+as\\s+[^,}]+)?(?=\\s*[})])`, 'g'), '');
    
    // Pattern: sole arg: { argName: expr }  -> { }
    content = content.replace(new RegExp(`\\{\\s*${arg}:\\s*[\\w.!?]+(?:\\s+as\\s+[^,}]+)?\\s*\\}`, 'g'), '{}');
  }
  
  // Clean up empty lines that might have been left
  content = content.replace(/\n\n\n+/g, '\n\n');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    totalChanges++;
  }
}

console.log(`Modified ${totalChanges} files`);
