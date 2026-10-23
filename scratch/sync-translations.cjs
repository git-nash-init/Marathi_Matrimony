const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const filePath = path.join(__dirname, '../src/i18n/translations.ts');
const content = fs.readFileSync(filePath, 'utf8');
const result = ts.transpileModule(content, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const mod = {};
const fn = new Function('exports', result.outputText);
fn(mod);
const { translations } = mod;

const mr = translations.mr;
const en = translations.en;

function findMissing(obj1, obj2, prefix = '') {
  let missing = [];
  for (const k of Object.keys(obj1)) {
    const fullPath = prefix ? `${prefix}.${k}` : k;
    if (obj2[k] === undefined) {
      missing.push(fullPath);
    } else if (typeof obj1[k] === 'object' && obj1[k] !== null && typeof obj2[k] === 'object' && obj2[k] !== null) {
      missing = missing.concat(findMissing(obj1[k], obj2[k], fullPath));
    }
  }
  return missing;
}

console.log('Keys in MR but missing in EN:');
const missingInEn = findMissing(mr, en);
console.log(missingInEn.length ? missingInEn : 'None');

console.log('\nKeys in EN but missing in MR:');
const missingInMr = findMissing(en, mr);
console.log(missingInMr.length ? missingInMr : 'None');
