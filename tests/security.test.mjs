import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Security & Secret Leaks Guard', () => {
  // Check gitignore exists and excludes .env
  const gitignorePath = path.resolve('.gitignore');
  assert.ok(fs.existsSync(gitignorePath), '.gitignore must exist');
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  assert.ok(gitignoreContent.includes('.env'), '.gitignore must exclude .env');

  // Verify that service_role secret key is NEVER exposed in source files
  const srcFiles = [];
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        scanDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js'))) {
        srcFiles.push(fullPath);
      }
    }
  }

  scanDir(path.resolve('src'));

  for (const file of srcFiles) {
    const text = fs.readFileSync(file, 'utf-8');
    assert.strictEqual(
      text.includes('service_role'),
      false,
      `File ${file} must not contain service_role secret keys`
    );
    assert.strictEqual(
      text.includes('ghp_'),
      false,
      `File ${file} must not contain GitHub PAT tokens`
    );
    assert.strictEqual(
      text.includes('github_pat_'),
      false,
      `File ${file} must not contain GitHub PAT tokens`
    );
  }
});
