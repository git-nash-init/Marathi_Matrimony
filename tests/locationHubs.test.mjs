import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Regional Location Hubs Registry Integrity', () => {
  const hubsFilePath = path.resolve('src/data/locationHubs.ts');
  assert.ok(fs.existsSync(hubsFilePath), 'locationHubs.ts must exist');

  const content = fs.readFileSync(hubsFilePath, 'utf-8');

  // Verify all 10 crawled canonical SEO hubs are registered
  const expectedHubs = [
    'maratha-marriage-bureau-borivali',
    'maratha-marriage-bureau-lower-parel',
    'maratha-vadhu-var-suchak-dadar',
    'maratha-vivah-mandal-mulund',
    'maratha-marriage-bureau-vashi',
    'maratha-matrimony-kharghar',
    'maratha-vadhu-var-suchak-jogeshwari',
    'maratha-vadhu-var-suchak-ghodbunder-thane',
    'maratha-vadhu-var-suchak-dhankawadi-pune',
    'maratha-vadhu-var-suchak-pimpri-chinchwad',
  ];

  for (const hub of expectedHubs) {
    assert.ok(content.includes(hub), `Hub ${hub} must be defined in locationHubs.ts`);
  }

  // Verify regions coverage
  assert.ok(content.includes('mumbai'), 'Mumbai region hubs must exist');
  assert.ok(content.includes('pune'), 'Pune region hubs must exist');
  assert.ok(content.includes('thane'), 'Thane region hubs must exist');
  assert.ok(content.includes('navi-mumbai'), 'Navi Mumbai region hubs must exist');
});
