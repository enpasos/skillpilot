import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Archival only: no generation, import, canonical edit or QA decision.
// Usage: node <this-file> <goal-id> <candidate-number> <generated-timestamp>
const archiveRoot = path.dirname(fileURLToPath(import.meta.url));
let repoRoot = archiveRoot;
while (!fs.existsSync(path.join(repoRoot, '.git'))) {
  const parent = path.dirname(repoRoot);
  if (parent === repoRoot) throw new Error('Repository root not found');
  repoRoot = parent;
}
const allowed = new Set(['346efb31-c400-5bd3-a698-dd9a7e1bc3f7', 'f05acdc5-4949-54c7-b8cd-56ddd1fbdbad', '1a1c09f0-96b7-4c33-a623-0e8101537876']);
const [id, candidateNumber, timestamp] = process.argv.slice(2);
if (!allowed.has(id) || !/^[1-9][0-9]*$/.test(candidateNumber ?? '') ||
    !/^2026-09-0[67]T[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{3}Z$/.test(timestamp ?? '')) {
  throw new Error('Expected allowed goal ID, positive candidate number and exact generated timestamp');
}
const subject = id === '1a1c09f0-96b7-4c33-a623-0e8101537876' ? 'physik' : 'mathematik';
const rel = p => path.relative(repoRoot, p).split(path.sep).join('/');
const hash = p => 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const goalDir = path.join(archiveRoot, id);
const originalDir = path.join(goalDir, 'original');
const candidateDir = path.join(goalDir, `candidate-${candidateNumber}`);
const tempDir = path.join(repoRoot, 'tmp/goal-visualizations', id);
const canonicalPath = path.join(repoRoot, `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${subject.toUpperCase()}.de.json`);
const qaPath = path.join(repoRoot, `curricula/DE/Gymnasium/quality/goal-visualization-qa/${subject}.qa.json`);
const sourceDir = path.join(repoRoot, 'curricula/DE/Gymnasium/visualizations', subject, id);
const generatedBase = `${id}.generated.${timestamp}`;
const candidateName = `${generatedBase}.jpg`;
const expected = [
  ['nano-banana-request.json', 'nano-banana-request.json'],
  ['nano-banana-prompt.de.md', 'nano-banana-prompt.de.md'],
  ['nano-banana-response-summary.json', 'nano-banana-response-summary.json'],
  [`generated/${candidateName}`, candidateName],
  ...['request.json', 'response.json', 'prompt.de.md'].map(suffix => [
    `generated/${generatedBase}.image-reconstruction-${suffix}`,
    `${generatedBase}.image-reconstruction-${suffix}`,
  ]),
];
for (const [source, target] of expected) {
  if (!fs.existsSync(path.join(candidateDir, target)) && !fs.existsSync(path.join(tempDir, source))) {
    throw new Error(`Candidate not fully written yet: ${source}`);
  }
}
fs.mkdirSync(originalDir, { recursive: true });
fs.mkdirSync(candidateDir, { recursive: true });
const copyOnce = (source, target) => {
  if (!fs.existsSync(target)) fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
};
const snapshotPath = path.join(originalDir, 'previous-goal-and-qa.json');
if (!fs.existsSync(snapshotPath)) {
  const goal = JSON.parse(fs.readFileSync(canonicalPath, 'utf8')).goals.find(g => g.id === id);
  const qa = JSON.parse(fs.readFileSync(qaPath, 'utf8')).records.find(r => r.goalId === id);
  if (!goal || !qa) throw new Error('Missing canonical goal or current QA record');
  const primary = goal.resourceLinks.find(l => l.type === 'goal-visualization' && l.role === 'primary');
  const publicPath = path.join(repoRoot, 'app/public', primary.url);
  const sourcePath = path.join(sourceDir, path.basename(primary.url));
  if (hash(publicPath) !== hash(sourcePath)) throw new Error('Public/source asset mismatch');
  for (const name of [path.basename(primary.url), 'prompt.de.md', 'image-reconstruction-prompt.de.md']) {
    if (fs.existsSync(path.join(sourceDir, name))) copyOnce(path.join(sourceDir, name), path.join(originalDir, name));
  }
  fs.writeFileSync(snapshotPath, JSON.stringify({
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    purpose: 'Immutable predecessor snapshot only; not a new approval.',
    goalId: id,
    canonicalPath: rel(canonicalPath),
    qaPath: rel(qaPath),
    previousGoalSnapshot: goal,
    previousQaRecord: qa,
    previousPublicAssetPath: rel(publicPath),
    previousPublicAssetSha256: hash(publicPath),
    previousCanonicalAssetPath: rel(sourcePath),
    previousCanonicalAssetSha256: hash(sourcePath),
  }, null, 2) + '\n', { flag: 'wx' });
}
for (const [source, target] of expected) copyOnce(path.join(tempDir, source), path.join(candidateDir, target));
const fileRecords = dir => fs.readdirSync(dir).filter(name => name !== 'archive-receipt.json').sort().map(name => {
  const file = path.join(dir, name);
  return { path: rel(file), bytes: fs.statSync(file).size, sha256: hash(file) };
});
const receiptPath = path.join(candidateDir, 'archive-receipt.json');
const records = { originalFiles: fileRecords(originalDir), candidateFiles: fileRecords(candidateDir) };
const request = JSON.parse(fs.readFileSync(path.join(candidateDir, 'nano-banana-request.json'), 'utf8'));
const hasReferenceImage = Array.isArray(request.input) && request.input.some(item => item.type !== 'text');
if (!fs.existsSync(receiptPath)) {
  fs.writeFileSync(receiptPath, JSON.stringify({
    schemaVersion: 1,
    archivedAt: new Date().toISOString(),
    goalId: id,
    candidateNumber: Number(candidateNumber),
    generatedTimestamp: timestamp,
    provider: hasReferenceImage
      ? 'Google Gemini / Nano Banana Pro (gemini-3-pro-image, reference-image input)'
      : 'Google Gemini / Nano Banana Pro (gemini-3-pro-image)',
    imported: false,
    reviewAuthority: 'archive_only',
    humanApprovalClaimed: false,
    ...records,
  }, null, 2) + '\n', { flag: 'wx' });
} else {
  const old = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  if (old.goalId !== id || old.candidateNumber !== Number(candidateNumber) ||
      old.generatedTimestamp !== timestamp || JSON.stringify(old.originalFiles) !== JSON.stringify(records.originalFiles) ||
      JSON.stringify(old.candidateFiles) !== JSON.stringify(records.candidateFiles)) {
    throw new Error('Archived candidate receipt mismatch');
  }
}
console.log(JSON.stringify({ goalId: id, candidateNumber: Number(candidateNumber),
  candidateSha256: hash(path.join(candidateDir, candidateName)), receipt: rel(receiptPath),
  originalFiles: records.originalFiles.length, candidateFiles: records.candidateFiles.length }));
