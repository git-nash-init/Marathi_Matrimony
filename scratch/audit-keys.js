const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const content = fs.readFileSync(path.join(__dirname, '../src/i18n/translations.ts'), 'utf8');
const result = ts.transpileModule(content, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const mod = {};
const fn = new Function('exports', result.outputText);
fn(mod);
const { translations } = mod;

function getDeep(obj, pathStr) {
  const parts = pathStr.split('.');
  let curr = obj;
  for (const p of parts) {
    if (curr && typeof curr === 'object' && p in curr) {
      curr = curr[p];
    } else {
      return undefined;
    }
  }
  return curr;
}

function getAllFiles(dir, exts = ['.ts', '.tsx']) {
  let files = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const p = path.join(dir, item);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      files = files.concat(getAllFiles(p, exts));
    } else if (exts.includes(path.extname(p))) {
      files.push(p);
    }
  }
  return files;
}

const allFiles = getAllFiles(path.join(__dirname, '../src'));
const tKeyRegex = /t\((?:'|")([^'"]+)(?:'|")/g;
const missingKeys = [];

for (const file of allFiles) {
  const code = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = tKeyRegex.exec(code)) !== null) {
    const key = match[1];
    const mrVal = getDeep(translations.mr, key);
    const enVal = getDeep(translations.en, key);
    if (mrVal === undefined) {
      missingKeys.push({ file: path.relative(path.join(__dirname, '..'), file), key, lang: 'mr' });
    }
    if (enVal === undefined) {
      missingKeys.push({ file: path.relative(path.join(__dirname, '..'), file), key, lang: 'en' });
    }
  }
}

console.log('Total missing keys found:', missingKeys.length);
for (const m of missingKeys) {
  console.log(`Missing in ${m.lang}: "${m.key}" in ${m.file}`);
}
