import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

async function main() {
  const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/biologie-0beb-stomata-underside-fresh-independent-a-20261012-v1';
  const record = JSON.parse(readFileSync(`${base}/V-image-only/V.image-only.machine-candidate-approval.json`, 'utf8'));
  const bytes = readFileSync(`${base}/inputs/0beb4ca2-2437-557a-9db2-ccda1cbcfa0a.png`);
  const actualSHA = 'sha256:' + createHash('sha256').update(bytes).digest('hex');
  const { isAiApprovedForCurrentAsset, aiApprovalStatus } = await import(pathToFileURL(resolve('app/src/utils/goalVisualizationQaStatus.ts')).href);
  const errors = [];
  if (record.assetSha256 !== actualSHA || record.aiApprovedAssetSha256 !== actualSHA) errors.push('Record does not bind actual inspected original.');
  if (!isAiApprovedForCurrentAsset(record)) errors.push('Normal production AI approval predicate rejects record.');
  if (record.humanApproval !== false || record.nativeFullpageReviewed !== false || record.D_vote !== null || record.P_vote !== null) errors.push('Bounded V-only authority not retained.');
  const receipt = { actualSHA, status: aiApprovalStatus(record), normalPredicate: isAiApprovedForCurrentAsset(record), productionPredicatePath: 'app/src/utils/goalVisualizationQaStatus.ts', errors, predicateOnlyNoActiveGateAssertion: true, humanApproval: false };
  writeFileSync(`${base}/V-image-only/V.normal-production-predicate.receipt.json`, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
  process.stdout.write(JSON.stringify(receipt) + '\n');
  if (errors.length) process.exitCode = 1;
}
main().catch(e => { process.stderr.write(String(e) + '\n'); process.exitCode = 1; });
