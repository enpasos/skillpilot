// Exact-retention split for four current-image changes. Historical reviews stay intact.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const mode = process.argv[2];
if (!['--write', '--check'].includes(mode) || process.argv.length !== 3) {
  throw new Error('Usage: node materialize-math-four-comic-retained-20260923.mjs --write|--check (repository root)');
}
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const readPinned = (path, expected) => {
  const bytes = readFileSync(resolve(path));
  if (sha(bytes) !== expected) throw new Error(`${path}: source bytes changed`);
  return bytes;
};
const exactOutput = (path, bytes) => {
  const absolute = resolve(path);
  if (!existsSync(absolute)) {
    if (mode !== '--write') throw new Error(`${path}: retained output missing`);
    writeFileSync(absolute, bytes, { flag: 'wx' });
  } else if (!readFileSync(absolute).equals(bytes)) {
    throw new Error(`${path}: retained output differs`);
  }
};

const descriptionSplits = [
  {
    source: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23/m7-q3-stochastics-next12-seven-keep-partial-20260923-v1/resolution-index.json',
    sourceSha: 'ec585f155733e878299be0b7b691a19859c5e08074f1849c2a40667fb4701843',
    excluded: 'e495fa38-b198-5280-a405-9e41cafd6d17',
  },
  {
    source: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-046-matrix-mappings-and-probability-foundations-20-v1/resolution-index.current-png-retained-four-20260923-v1.json',
    sourceSha: '5041c725574b4b8def8d99499c06e373bd31733e4bf2112c56dcc07f26d6dbf5',
    excluded: '5a2371fd-74ce-5013-932e-35d3713aeaf7',
  },
  {
    source: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/calibration-v2/2026-08-25/resolution-index.retained-before-two-local-png-20260923-v1.json',
    sourceSha: 'f1c719e86fab6c80732cf427f78aacef04a14cdf7605e45b180a9dbf42ae0e78',
    excluded: '740ab443-776a-5c7a-8f1d-2b0b59a5ed32',
  },
];
for (const item of descriptionSplits) {
  const source = JSON.parse(readPinned(item.source, item.sourceSha));
  if (source.resolutions.filter((record) => record.goalId === item.excluded).length !== 1) {
    throw new Error(`${item.source}: expected exactly one excluded goal`);
  }
  const resolutions = source.resolutions.filter((record) => record.goalId !== item.excluded);
  const groups = source.groups.map((group) => ({
    ...group,
    resolvedGoalCount: resolutions.filter((record) => record.groupId === group.groupId).length,
  }));
  const retained = {
    ...source,
    artifactSetId: `${source.artifactSetId}-retained-before-four-comic-png-20260923-v1`,
    strictDescriptionReviewCompleteCount: resolutions.length,
    descriptionReviewPercentage: Number((resolutions.length * 100 / source.curriculumAtomicDenominator).toFixed(1)),
    groups,
    resolutions,
  };
  const output = item.source.replace(/\.json$/, '.retained-before-four-comic-png-20260923-v1.json');
  exactOutput(output, Buffer.from(`${JSON.stringify(retained, null, 2)}\n`));
  console.log(`D retained ${resolutions.length}/${source.resolutions.length}: ${output}`);
}

const evidenceSplits = [
  {
    sourceConfig: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-stochastics-next12-p-20260923-v1/text-only-ten.config.json',
    configSha: '8576fb0cfd6ed79e55ebaf43391fe93721e71435381f5320cc900786403cc8fe',
    reviewSha: 'dda73a5a8dccdc3c76896871311acb7b1f48b5696ecc8cfc4397ee46b39254bd',
    excluded: 'e495fa38-b198-5280-a405-9e41cafd6d17',
  },
  {
    sourceConfig: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-four-new-png-bound-p-20260923-v1/b046-retained-four.config.json',
    configSha: '8c6903aaf16e18b3b6af789b44c2aef3fddfb804596d3d07cd7c16f0f60a6c4b',
    reviewSha: 'b1ae77b2b00ae48002fe51dc0bc72e41ae5746dabbc250812bdc8c26fbdedc98',
    excluded: '5a2371fd-74ce-5013-932e-35d3713aeaf7',
  },
  {
    sourceConfig: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-two-local-png-bound-p-20260923-v1/tangent-source-retained16.config.json',
    configSha: '43166a2cbb255321309a2a13eff807ee6b9bac74a0c1769172b4142d21e49d34',
    reviewSha: '06b485daf6e6bdf0c20e12654e9c6827ce7954313e1b85f1531855a3dd69e72b',
    excluded: '740ab443-776a-5c7a-8f1d-2b0b59a5ed32',
  },
];
for (const item of evidenceSplits) {
  const sourceConfig = JSON.parse(readPinned(item.sourceConfig, item.configSha));
  const sourceReview = item.sourceConfig.replace(/\.config\.json$/, '.review.jsonl');
  const lines = readPinned(sourceReview, item.reviewSha).toString('utf8').trimEnd().split('\n');
  const ids = sourceConfig.scope.goalIds;
  if (ids.length !== lines.length || ids.some((id, index) => JSON.parse(lines[index]).goalId !== id) ||
      ids.filter((id) => id === item.excluded).length !== 1) {
    throw new Error(`${item.sourceConfig}: review records/scope are inconsistent`);
  }
  const retainedIds = ids.filter((id) => id !== item.excluded);
  const retainedLines = lines.filter((_, index) => ids[index] !== item.excluded);
  const outputConfig = item.sourceConfig.replace(/\.config\.json$/, '.retained-before-four-comic-png-20260923-v1.config.json');
  const outputReview = item.sourceConfig.replace(/\.config\.json$/, '.retained-before-four-comic-png-20260923-v1.review.jsonl');
  const retainedConfig = {
    ...sourceConfig,
    reviewPath: outputReview,
    scope: {
      ...sourceConfig.scope,
      label: `${sourceConfig.scope.label}; ${item.excluded} moved to exact-current comic PNG delta`,
      goalIds: retainedIds,
    },
  };
  exactOutput(outputConfig, Buffer.from(`${JSON.stringify(retainedConfig, null, 2)}\n`));
  exactOutput(outputReview, Buffer.from(`${retainedLines.join('\n')}\n`));
  console.log(`P retained ${retainedIds.length}/${ids.length}: ${outputConfig}`);
}
