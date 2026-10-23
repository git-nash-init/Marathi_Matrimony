const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/components/profile-builder');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const keysUsed = new Set();
const tRegex = /t\((?:'|")([^'"]+)(?:'|")/g;

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    keysUsed.add(match[1]);
  }
}

console.log('All translation keys used in profile-builder:', Array.from(keysUsed).sort());
