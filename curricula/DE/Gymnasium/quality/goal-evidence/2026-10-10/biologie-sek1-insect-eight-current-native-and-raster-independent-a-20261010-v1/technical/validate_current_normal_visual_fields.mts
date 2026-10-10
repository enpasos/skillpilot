import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const module = await import(pathToFileURL(resolve('app/scripts/goalVisualizationQaModel.ts')).href);
const input = JSON.parse(readFileSync(process.argv[2], 'utf8'));
for (const record of input.records) {
  const normalized = module.normalizeGoalVisualizationAiReview(record, record.assetSha256);
  if (normalized.aiApproved !== 'yes' || normalized.aiApprovedAssetSha256 !== record.assetSha256 || !module.isGoalVisualizationAiApproved({ ...record, ...normalized })) throw new Error(`Current machine V binding failed: ${record.goalId}`);
}
process.stdout.write(`Normal exact current visualization fields valid: ${input.records.length} machine candidates, 0 Human approvals\n`);
