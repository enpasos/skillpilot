// Prepare new, independent D inputs only after the exact v2 PNG has been imported.
// This script does not write reviewer results, synthesize decisions, finalize D,
// or claim human approval. Older review rounds remain immutable.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const goalId = 'bda6a659-9640-53a5-8be0-24705ab623ef';
const expectedDigest = 'sha256:01c320fb4ea450c66d4c14104d14093fd288112e4f97cade2554109ddbc64164';
const priorPageFingerprint = 'sha256:98a00e7acf5c87dbad122b3072a3e4ad0129667974802add434ee62c74ba5fd2';
const here = dirname(fileURLToPath(import.meta.url));
let root = here;
while (!existsSync(join(root, 'app/package.json')) && dirname(root) !== root) root = dirname(root);
if (!existsSync(join(root, 'app/package.json'))) throw new Error('SkillPilot repository root not found');

const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const suffix = `assets/goal-visualizations/mathematik/${goalId}/${goalId}.png`;
const assets = [
  join(root, 'curricula/DE/Gymnasium/visualizations/mathematik', goalId, `${goalId}.png`),
  join(root, 'app/public', suffix),
  join(root, 'backend/src/main/resources/static', suffix),
];
for (const asset of assets) {
  if (!existsSync(asset)) throw new Error(`New PNG not imported: ${relative(root, asset)}`);
  const digest = sha(readFileSync(asset));
  if (digest !== expectedDigest) throw new Error(`PNG digest mismatch: ${relative(root, asset)} is ${digest}`);
}

const landscape = JSON.parse(readFileSync(join(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'), 'utf8'));
const goal = landscape.goals.find((entry) => entry.id === goalId);
if (!goal) throw new Error(`Canonical goal not found: ${goalId}`);
const link = goal.resourceLinks?.find((entry) => entry.type === 'goal-visualization' && entry.role === 'primary');
if (link?.url !== `/${suffix}`) throw new Error(`Canonical primary visualization does not point to the v2 PNG: ${link?.url}`);

const configPath = join(here, 'm7-q2-plane-angle-direction-current-20260923-v2.config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const output = resolve(root, config.outputDirectory);
if (existsSync(output)) throw new Error(`New D package already exists; refusing to overwrite reviews: ${config.outputDirectory}`);
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
for (const action of ['prepare', 'check']) {
  const result = spawnSync(npm, ['--prefix', 'app', 'run', 'quality:goal-description-rollout-batch', '--', action, '--config', relative(root, configPath)], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Native ${action} failed with exit code ${result.status}`);
}

const fingerprints = [];
for (const round of ['a', 'b']) {
  const roundDir = join(output, `round-${round}`);
  const campaign = JSON.parse(readFileSync(join(roundDir, 'description-review-campaign.json'), 'utf8'));
  const input = JSON.parse(readFileSync(join(roundDir, 'batches', `${campaign.batches[0].batchId}.input.jsonl`), 'utf8').trim());
  if (input.goal.goalId !== goalId) throw new Error(`Unexpected goal in round ${round}`);
  const digest = input.goal.reviewContext?.page?.visualization?.originalDigest;
  if (digest !== expectedDigest) throw new Error(`Round ${round} did not bind the new PNG: ${digest}`);
  if (input.goal.pageFingerprint === priorPageFingerprint) throw new Error(`Round ${round} still binds the old page`);
  fingerprints.push(input.goal.pageFingerprint);
}
if (fingerprints[0] !== fingerprints[1]) throw new Error('The two rounds bind different page fingerprints');
console.log(JSON.stringify({ prepared: config.batchId, goalId, imageDigest: expectedDigest, pageFingerprint: fingerprints[0], status: 'review_inputs_only' }));
