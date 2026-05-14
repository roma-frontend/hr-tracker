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

// These are the args we need to remove from mutation calls
// Pattern: argName: value, or argName: value (last arg before })
// We need to remove the entire "argName: someExpression," line/segment

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Remove caller-identity args from mutation call objects
  // These patterns match: argName: expression, (with trailing comma)
  // or ,\s*argName: expression (with leading comma when it's the last arg)
  
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
  
  for (const arg of argsToRemove) {
    // Pattern 1: arg: expression, (with trailing comma and possible newline)
    // Handles: argName: someVar,
    // Handles: argName: some.nested.var,
    // Handles: argName: someVar as Id<'users'>,
    const pattern1 = new RegExp(
      `\\s*${arg}:\\s*[^,}]+,?\\s*\\n?`,
      'g'
    );
    
    // More precise: match the arg as a property in an object literal passed to a mutation
    // argName: value,\n  (with possible whitespace)
    const pattern2 = new RegExp(
      `^(\\s*)${arg}:[^\\n]*\\n`,
      'gm'
    );
    
    // Pattern for inline: { argName: val, otherArg: val2 }
    const pattern3 = new RegExp(
      `${arg}:\\s*[^,}]+,\\s*`,
      'g'
    );
    
    // Pattern for last arg before closing: , argName: val }
    const pattern4 = new RegExp(
      `,\\s*${arg}:\\s*[^}]+(?=\\s*})`,
      'g'
    );
    
    // Use pattern2 for multi-line (most common in this codebase)
    content = content.replace(pattern2, '');
    
    // Also handle inline patterns where arg is followed by comma
    // But be careful not to remove from type definitions, interfaces, etc.
    // Only remove from mutation call sites (inside { } passed to mutate())
  }
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    totalChanges++;
  }
}

console.log(`Modified ${totalChanges} files`);
