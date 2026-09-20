import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const manifest = read('content/migrations/physik-libre-links-2026-09-20.json');
const physics = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json');
assert.equal(manifest.schemaVersion, 1);
assert.equal(manifest.entries.length, 11);
assert.equal(new Set(manifest.entries.map(e => e.goalId)).size, 11);
for (const entry of manifest.entries) {
  const goal = physics.goals.find(g => g.id === entry.goalId);
  assert.ok(goal, `Missing goal ${entry.goalId}`);
  const retained = entry.beforeResourceLinks.filter(link =>
    !String(link.url).startsWith('https://physikbuch.schule/') || link.type === 'curriculum');
  assert.deepEqual(retained, entry.afterResourceLinks);
  if (process.argv.includes('--verify-relocation')) {
    assert.deepEqual(goal.resourceLinks, entry.afterResourceLinks, `Changed retained links ${goal.id}`);
    const semantics = { ...goal };
    delete semantics.resourceLinks;
    // One-time migration evidence, NOT a permanent curriculum development freeze.
    assert.equal(createHash('sha256').update(JSON.stringify(semantics)).digest('hex'),
      entry.semanticSha256, `Goal semantics changed since relocation: ${goal.id}`);
  }
}
assert.ok(!physics.goals.some(g => (g.resourceLinks ?? []).some(l =>
  String(l.url).startsWith('https://physikbuch.schule/') && l.type !== 'curriculum')));
console.log(`Content relocation verified: ${manifest.entries.length} goals; source evidence and images retained (${fileURLToPath(root)}).`);
