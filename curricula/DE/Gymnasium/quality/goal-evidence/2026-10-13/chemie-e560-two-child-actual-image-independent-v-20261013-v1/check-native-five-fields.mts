import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const repo = process.cwd();
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e560-two-child-actual-image-independent-v-20261013-v1';
const read = (path: string) => JSON.parse(readFileSync(resolve(repo, path), 'utf8'));
const sha = (path: string) => 'sha256:' + createHash('sha256').update(readFileSync(resolve(repo, path))).digest('hex');
const model = await import(pathToFileURL(resolve(repo, 'app/scripts/goalVisualizationQaModel.ts')).href);
const status = await import(pathToFileURL(resolve(repo, 'app/src/utils/goalVisualizationQaStatus.ts')).href);
const proposal = read(own + '/QA.two-child.native-five-field-updates.inactive-proposal.json');
const bindings = read(own + '/RESOURCE.two-current-child-exact-image-bindings.inactive-proposals.json').childImageBindings;
const allowed = ['aiApproved', 'aiApprovedAssetSha256', 'aiReviewedAt', 'aiReviewer', 'aiNotes'].sort();
assert.equal(proposal.records.length, 2);
const outcomes = proposal.records.map((record: any) => {
  assert.deepEqual(Object.keys(record.updates).sort(), allowed);
  const binding = bindings.find((b: any) => b.goalId === record.goalId);
  assert.equal(binding.exactCurrentFullGoalBeforeResourceBinding.id, record.goalId);
  assert.equal(binding.proposedResourceLink.skillpilotId, record.goalId);
  assert.equal(binding.proposedResourceLink.title, 'Visualisierung: ' + binding.exactCurrentFullGoalBeforeResourceBinding.title);
  assert.equal(binding.proposedResourceLink.url, '/assets/goal-visualizations/chemie/' + record.goalId + '/' + record.goalId + '.png');
  assert.equal(sha(binding.sourceNativePath), record.expectedAssetSha256);
  assert.equal(sha(binding.inactiveExactNativeCopyPath), record.expectedAssetSha256);
  assert.equal(record.updates.aiApprovedAssetSha256, record.expectedAssetSha256);
  assert.deepEqual(model.normalizeGoalVisualizationAiReview(record.updates, record.expectedAssetSha256), record.updates);
  const nativeGuard = { ...record.updates, assetSha256: record.expectedAssetSha256 };
  assert.equal(status.aiApprovalStatus(nativeGuard), 'approved');
  assert.equal(model.isGoalVisualizationAiApproved(nativeGuard), true);
  return { goalId: record.goalId, assetSha256: record.expectedAssetSha256, nativeUpdateKeys: allowed, exactSourceAndCopyBytes: true, modelNormalizationExact: true, nativeAiApprovalStatus: 'approved' };
});
writeFileSync(resolve(repo, own, 'STOCK.native-five-field-hash-status-guard.actual.json'), JSON.stringify({
  schemaVersion: 1, outcomes,
  stockModule: { path: 'app/scripts/goalVisualizationQaModel.ts', sha256: sha('app/scripts/goalVisualizationQaModel.ts') },
  stockStatusModule: { path: 'app/src/utils/goalVisualizationQaStatus.ts', sha256: sha('app/src/utils/goalVisualizationQaStatus.ts') },
  noActiveQaOrResourceWrites: true, noHumanFieldsProposed: true, noPClosureClaimed: true,
}, null, 2) + '\n');
console.log('PASS two exact native five-field AI QA proposals; correct child IDs/titles/URLs; native source/copy hashes and stock normalization/status. No active writes or P closure.');
