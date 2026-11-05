import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(path.resolve(p), 'utf-8');

test('no invented member profiles reach the site', () => {
  assert.strictEqual(fs.existsSync(path.resolve('src/data/mockProfiles.ts')), false);
  for (const file of ['src/services/discovery.service.ts', 'src/components/home/FeaturedProfilesSection.tsx']) {
    assert.doesNotMatch(read(file), /mockProfiles/, file);
  }
});

test('search runs in the database, with no client-side filtering or local block list', () => {
  const discovery = read('src/services/discovery.service.ts');
  assert.match(discovery, /rpc\('search_profiles'/);
  assert.doesNotMatch(discovery, /\.filter\(\(p\) => p\.gender/);
  const interaction = read('src/services/interaction.service.ts');
  assert.match(interaction, /'block_member'/);
  assert.doesNotMatch(interaction, /setItem/);
});
