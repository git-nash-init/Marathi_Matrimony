import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Authentic Maratha Profiles Data Integrity', () => {
  const mockProfilesPath = path.resolve('src/data/mockProfiles.ts');
  assert.ok(fs.existsSync(mockProfilesPath), 'mockProfiles.ts must exist');

  const content = fs.readFileSync(mockProfilesPath, 'utf-8');

  // Verify authentic 96 Kuli Maratha communities are referenced
  assert.ok(content.includes('मराठा') || content.includes('Maratha'), 'Profiles must represent Maratha community');
  assert.ok(content.includes('पुणे') || content.includes('Pune'), 'Must contain profiles from Pune');
  assert.ok(content.includes('मुंबई') || content.includes('Mumbai'), 'Must contain profiles from Mumbai');

  // Verify no forbidden placeholder or mock terms
  assert.strictEqual(content.includes('John Doe'), false, 'Must not contain generic Western placeholder names');
  assert.strictEqual(content.includes('Lorem ipsum'), false, 'Must not contain lorem ipsum text');
});
