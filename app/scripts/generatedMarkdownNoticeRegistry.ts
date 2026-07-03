import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { discoverMemoryCardReviewConfigs } from './memoryCardReviewConfigDiscovery'

export interface GeneratedMarkdownNoticeConfig {
  path: string
  generatedBy: string
  regenerateWith: string
  sourceOfTruth: string[]
}

export interface GeneratedStatusRegistryRow {
  artifactPaths: string[]
  generatedBy: string
  role: string
  sourceOfTruth: string[]
  regenerateWith: string
}

interface MemoryCardReviewConfigForNotice {
  reviewPath?: unknown
  cardReviewPath?: unknown
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
export const repoRoot = resolve(scriptDir, '../..')

export const generatedStatusRegistryReadmeNoticeConfig: GeneratedMarkdownNoticeConfig = {
  path: 'docs/qa-ci/status/README.md',
  generatedBy: 'app/scripts/generateGeneratedStatusRegistry.ts',
  regenerateWith: 'cd app && npm run docs:generated-status-registry',
  sourceOfTruth: [
    'app/scripts/generatedMarkdownNoticeRegistry.ts',
    'app/scripts/generateGeneratedStatusRegistry.ts',
  ],
}

const staticGeneratedStatusRows: GeneratedStatusRegistryRow[] = [
  {
    artifactPaths: [
      'docs/qa-ci/status/curriculum-quality-status.md',
      'docs/qa-ci/status/curriculum-quality-status.json',
    ],
    generatedBy: 'app/scripts/generateCurriculumQualityStatus.ts',
    role: 'Curriculum maturity dashboard snapshot consumed by the Workbench and follow-up reports.',
    sourceOfTruth: [
      'app/scripts/generateCurriculumQualityStatus.ts',
      'curricula/',
    ],
    regenerateWith: 'cd app && npm run quality:curriculum-status',
  },
  {
    artifactPaths: [
      'docs/qa-ci/status/curriculum-source-coverage-audit.md',
      'docs/qa-ci/status/curriculum-source-coverage-audit.json',
    ],
    generatedBy: 'app/scripts/generateCurriculumSourceCoverageAudit.ts',
    role: 'Source-coverage evidence audit for configured curriculum inputs.',
    sourceOfTruth: [
      'app/scripts/generateCurriculumSourceCoverageAudit.ts',
      'curricula/DE/Gymnasium/canonical/',
      'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json',
    ],
    regenerateWith: 'cd app && npm run quality:source-coverage-audit',
  },
  {
    artifactPaths: [
      'docs/qa-ci/status/mem-sparql-consistency-audit.md',
      'docs/qa-ci/status/mem-sparql-consistency-audit.json',
    ],
    generatedBy: 'app/scripts/generateMemSparqlConsistencyAudit.ts',
    role: 'Non-blocking live MEM/FWU SPARQL comparison for the Mathematik PoC scope.',
    sourceOfTruth: [
      'curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json',
    ],
    regenerateWith: 'cd app && npm run quality:mem-sparql-consistency',
  },
  {
    artifactPaths: [
      'docs/qa-ci/status/mem-sparql-consistency-review-issues.md',
      'docs/qa-ci/status/mem-sparql-consistency-review-issues.json',
    ],
    generatedBy: 'app/scripts/generateMemSparqlConsistencyAudit.ts',
    role: 'Human review queue derived from MEM consistency findings and ledger state.',
    sourceOfTruth: [
      'curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json',
      'curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.review.jsonl',
    ],
    regenerateWith: 'cd app && npm run quality:mem-sparql-consistency',
  },
  {
    artifactPaths: [
      'docs/qa-ci/status/goal-source-rationales-poc.md',
      'docs/qa-ci/status/goal-source-rationales-poc.json',
    ],
    generatedBy: 'app/scripts/generateGoalSourceRationales.ts',
    role: 'PoC source-rationale report for selected canonical Mathematik goals.',
    sourceOfTruth: [
      'app/scripts/generateGoalSourceRationales.ts',
      'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
      'curricula/DE/Gymnasium/mapping/',
      'curricula/DE/Gymnasium/input/',
    ],
    regenerateWith: 'cd app && npm run quality:goal-source-rationales:poc',
  },
  {
    artifactPaths: [
      'docs/qa-ci/status/goal-source-rationales-mem-examples.md',
      'docs/qa-ci/status/goal-source-rationales-mem-examples.json',
    ],
    generatedBy: 'app/scripts/generateGoalSourceRationales.ts',
    role: 'MEM/FWU SPARQL showcase for selected canonical Mathematik source rationales.',
    sourceOfTruth: [
      'app/scripts/generateGoalSourceRationales.ts',
      'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
      'curricula/DE/Gymnasium/mapping/',
      'curricula/DE/Gymnasium/input/',
      'curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json',
    ],
    regenerateWith: 'cd app && npm run quality:goal-source-rationales:mem-examples',
  },
  {
    artifactPaths: [
      'docs/qa-ci/status/goal-source-rationales-mem-examples-plain.md',
      'docs/qa-ci/status/goal-source-rationales-mem-examples-plain.json',
    ],
    generatedBy: 'app/scripts/generateGoalSourceRationales.ts',
    role: 'Plain-language MEM/FWU SPARQL source-rationale view for selected canonical Mathematik goals.',
    sourceOfTruth: [
      'app/scripts/generateGoalSourceRationales.ts',
      'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
      'curricula/DE/Gymnasium/mapping/',
      'curricula/DE/Gymnasium/input/',
      'curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json',
    ],
    regenerateWith: 'cd app && npm run quality:goal-source-rationales:mem-examples:plain',
  },
  {
    artifactPaths: [
      'app/src/data/goal-source-rationales-math-public.json',
      'app/public/data/goal-source-rationales-math-public.json',
      'app/src/data/goal-source-rationales-physics-public.json',
      'app/public/data/goal-source-rationales-physics-public.json',
    ],
    generatedBy: 'app/scripts/generateGoalSourceRationales.ts',
    role: 'Public runtime source-rationale indexes that let the cockpit trace canonical Mathematik and Physik goals back to reviewed source bullets.',
    sourceOfTruth: [
      'app/scripts/generateGoalSourceRationales.ts',
      'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
      'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
      'curricula/DE/Gymnasium/mapping/',
      'curricula/DE/Gymnasium/input/',
      'curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json',
    ],
    regenerateWith: 'cd app && npm run quality:goal-source-rationales:public',
  },
  {
    artifactPaths: [
      'docs/qa-ci/status/goal-source-rationale-coverage.md',
      'docs/qa-ci/status/goal-source-rationale-coverage.json',
    ],
    generatedBy: 'app/scripts/reportGoalSourceRationaleCoverage.ts',
    role: 'Coverage report and work queue for scaling Mathematik source rationales from the public runtime index to all relevant goals and relation texts.',
    sourceOfTruth: [
      'app/scripts/reportGoalSourceRationaleCoverage.ts',
      'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
      'app/src/data/goal-source-rationales-math-public.json',
    ],
    regenerateWith: 'cd app && npm run quality:goal-source-rationale-coverage',
  },
  {
    artifactPaths: [
      'docs/qa-ci/status/goal-source-rationales-math-all-relevant.json',
    ],
    generatedBy: 'app/scripts/generateGoalSourceRationales.ts',
    role: 'Machine-readable all-relevant Mathematik source-rationale report with explicit classic-source gaps for uncovered leaf goals.',
    sourceOfTruth: [
      'app/scripts/generateGoalSourceRationales.ts',
      'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
      'curricula/DE/Gymnasium/mapping/',
      'curricula/DE/Gymnasium/input/',
      'curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json',
    ],
    regenerateWith: 'cd app && npm run quality:goal-source-rationales:math-all-relevant',
  },
  {
    artifactPaths: [
      'docs/qa-ci/status/goal-source-rationale-gap-issues.md',
      'docs/qa-ci/status/goal-source-rationale-gap-issues.json',
    ],
    generatedBy: 'app/scripts/reportGoalSourceRationaleGapIssues.ts',
    role: 'Human-review issue queue for classic-source gaps in the all-relevant Mathematik source-rationale report.',
    sourceOfTruth: [
      'app/scripts/reportGoalSourceRationaleGapIssues.ts',
      'docs/qa-ci/status/goal-source-rationales-math-all-relevant.json',
      'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
    ],
    regenerateWith: 'cd app && npm run quality:goal-source-rationale-gap-issues',
  },
  {
    artifactPaths: [
      'docs/qa-ci/status/goal-source-rationale-mapping-batch-01.md',
      'docs/qa-ci/status/goal-source-rationale-mapping-batch-01.json',
    ],
    generatedBy: 'app/scripts/reportGoalSourceRationaleMappingBatch.ts',
    role: 'First review batch of sibling-supported Mathematik source-rationale mapping candidates.',
    sourceOfTruth: [
      'app/scripts/reportGoalSourceRationaleMappingBatch.ts',
      'docs/qa-ci/status/goal-source-rationale-gap-issues.json',
    ],
    regenerateWith: 'cd app && npm run quality:goal-source-rationale-mapping-batch-01',
  },
  {
    artifactPaths: [
      'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-rollout-status.md',
      'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-rollout-status.json',
    ],
    generatedBy: 'app/scripts/reportGoalVisualizationRolloutStatus.ts',
    role: 'Rollout status, quality queues, and current provider-blocker state for canonical Mathematik atomic goal visualizations.',
    sourceOfTruth: [
      'app/scripts/reportGoalVisualizationRolloutStatus.ts',
      'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
      'curricula/DE/Gymnasium/quality/goal-visualization-review',
    ],
    regenerateWith: 'cd app && npm run quality:goal-visualization-rollout-status',
  },
  {
    artifactPaths: [
      'curricula/DE/Gymnasium/quality/goal-visualization-review/physik-rollout-status.md',
      'curricula/DE/Gymnasium/quality/goal-visualization-review/physik-rollout-status.json',
    ],
    generatedBy: 'app/scripts/reportGoalVisualizationRolloutStatus.ts',
    role: 'Rollout status, quality queues, and current provider-blocker state for canonical Physik atomic goal visualizations.',
    sourceOfTruth: [
      'app/scripts/reportGoalVisualizationRolloutStatus.ts',
      'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
      'curricula/DE/Gymnasium/quality/goal-visualization-review',
    ],
    regenerateWith: 'cd app && npm run quality:goal-visualization-rollout-status:physik',
  },
  {
    artifactPaths: [
      'docs/qa-ci/status/memory-card-review-rollout.md',
    ],
    generatedBy: 'app/scripts/reportMemoryCardReviewRollout.ts',
    role: 'Rollout triage for subjects still moving toward `CQR-302`.',
    sourceOfTruth: [
      'app/scripts/reportMemoryCardReviewRollout.ts',
      'docs/qa-ci/status/curriculum-quality-status.json',
      'curricula/DE/Gymnasium/canonical/',
    ],
    regenerateWith: 'cd app && npm run quality:memory-card-review:rollout',
  },
  {
    artifactPaths: [
      'docs/qa-ci/status/m0-remediation-plan.md',
    ],
    generatedBy: 'app/scripts/reportM0RemediationPlan.ts',
    role: 'Work queue for curricula that still need source coverage, QA scopes, or reviews before leaving `M0`.',
    sourceOfTruth: [
      'app/scripts/reportM0RemediationPlan.ts',
      'docs/qa-ci/status/curriculum-quality-status.json',
    ],
    regenerateWith: 'cd app && npm run quality:m0-remediation',
  },
  {
    artifactPaths: [
      'docs/qa-ci/status/english-remediation-pilot.md',
    ],
    generatedBy: 'app/scripts/reportEnglishRemediationPilot.ts',
    role: 'Reproducible source-expansion slice for the Englisch remediation pilot.',
    sourceOfTruth: [
      'app/scripts/reportEnglishRemediationPilot.ts',
      'docs/qa-ci/status/curriculum-quality-status.json',
    ],
    regenerateWith: 'cd app && npm run quality:english-remediation-pilot',
  },
  {
    artifactPaths: [
      'docs/qa-ci/status/gymnasium-duration-model-readiness.md',
    ],
    generatedBy: 'app/scripts/reportGymnasiumDurationModelReadiness.ts',
    role: 'Readiness audit for duration-model policy and composition-view coverage.',
    sourceOfTruth: [
      'app/scripts/reportGymnasiumDurationModelReadiness.ts',
      'docs/qa-ci/status/curriculum-quality-status.json',
      'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json',
      'curricula/DE/Gymnasium/input/',
      'curricula/DE/Gymnasium/composition-views/',
    ],
    regenerateWith: 'cd app && npm run report:gymnasium-duration-readiness -- --write',
  },
  {
    artifactPaths: [
      'docs/qa-ci/status/memory-card-pilot-biologie.md',
    ],
    generatedBy: 'app/scripts/reportMemoryCardPilotDossier.ts',
    role: 'Semantic preparation dossier for the Biologie memory-card pilot.',
    sourceOfTruth: [
      'app/scripts/reportMemoryCardPilotDossier.ts',
      'docs/qa-ci/status/curriculum-quality-status.json',
    ],
    regenerateWith: 'cd app && npm run quality:memory-card-review:pilot-dossier',
  },
]

function markdownNoticeFromRegistryRow(row: GeneratedStatusRegistryRow): GeneratedMarkdownNoticeConfig[] {
  return row.artifactPaths
    .filter((path) => path.endsWith('.md'))
    .map((path) => ({
      path,
      generatedBy: row.generatedBy,
      regenerateWith: row.regenerateWith,
      sourceOfTruth: row.sourceOfTruth,
    }))
}

function loadMemoryCardReviewRows(): GeneratedStatusRegistryRow[] {
  const configs = discoverMemoryCardReviewConfigs(undefined, { allowEmpty: true })
  if (configs.length === 0) return []

  return [
    {
      artifactPaths: configs.map((configRef) => configRef.reportPath),
      generatedBy: 'app/scripts/memoryCardReview.ts',
      role: 'Subject-level `CQR-302` memory-card review reports.',
      sourceOfTruth: [
        'curricula/DE/Gymnasium/quality/memory-card-review/*.config.json',
        'curricula/DE/Gymnasium/quality/memory-card-review/*.review.jsonl',
        'curricula/DE/Gymnasium/quality/memory-card-review/*.cards.review.jsonl',
      ],
      regenerateWith: 'cd app && npm run quality:memory-card-review:report:all',
    },
  ]
}

function loadMemoryCardReviewNoticeConfigs(): GeneratedMarkdownNoticeConfig[] {
  return discoverMemoryCardReviewConfigs(undefined, { allowEmpty: true }).map((configRef) => {
    const parsed = JSON.parse(readFileSync(resolve(repoRoot, configRef.configPath), 'utf8')) as MemoryCardReviewConfigForNotice
    if (typeof parsed.reviewPath !== 'string' || parsed.reviewPath.trim().length === 0) {
      throw new Error(`Memory-card review config has no reviewPath: ${configRef.configPath}`)
    }
    const cardReviewPath = typeof parsed.cardReviewPath === 'string' && parsed.cardReviewPath.trim().length > 0
      ? parsed.cardReviewPath
      : parsed.reviewPath.replace(/\.review\.jsonl$/i, '.cards.review.jsonl')
    return {
      path: configRef.reportPath,
      generatedBy: 'app/scripts/memoryCardReview.ts',
      regenerateWith: 'cd app && npm run quality:memory-card-review:report:all',
      sourceOfTruth: [
        configRef.configPath,
        parsed.reviewPath,
        cardReviewPath,
      ],
    }
  })
}

export function loadGeneratedStatusRegistryRows(): GeneratedStatusRegistryRow[] {
  return [
    ...staticGeneratedStatusRows.slice(0, 4),
    ...loadMemoryCardReviewRows(),
    ...staticGeneratedStatusRows.slice(4),
  ]
}

export function loadGeneratedMarkdownNoticeConfigs(): GeneratedMarkdownNoticeConfig[] {
  return [
    generatedStatusRegistryReadmeNoticeConfig,
    ...staticGeneratedStatusRows.flatMap(markdownNoticeFromRegistryRow),
    ...loadMemoryCardReviewNoticeConfigs(),
  ]
}
