import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Brand Config Integrity', () => {
  const brandConfigPath = path.resolve('src/config/brand.config.ts');
  assert.ok(fs.existsSync(brandConfigPath), 'brand.config.ts must exist');

  const content = fs.readFileSync(brandConfigPath, 'utf-8');

  // Verify Sanaibandh brand identity
  assert.ok(content.includes('सनईबंध'), 'Brand marathi name must be सनईबंध');
  assert.ok(content.includes('Sanaibandh'), 'Brand english name must be Sanaibandh');
  assert.ok(content.includes('72086 59356'), 'Primary helpline 72086 59356 must be present');
  assert.ok(content.includes('95949 28780'), 'Secondary helpline 95949 28780 must be present');
  assert.ok(content.includes('98216 75567'), 'Office helpline 98216 75567 must be present');
  assert.ok(content.includes('wa.me/917208659356'), 'WhatsApp official link must be present');
  assert.ok(content.includes('#7B191E'), 'Heritage Oxblood color token must be configured');
});
