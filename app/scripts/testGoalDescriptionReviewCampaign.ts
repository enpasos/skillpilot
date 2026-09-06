import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { GoalBookReviewBundleManifest } from './exportGoalBookReviewBundle'
import {
  createGoalDescriptionReviewCampaignArtifacts,
  verifyGoalBookReviewBundleArtifactBytes,
  writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts,
} from './createGoalDescriptionReviewCampaign'
import {
  buildGoalDescriptionReviewCampaign,
  buildGoalDescriptionReviewInput,
  fingerprintGoalBookReviewBundleManifest,
  fingerprintGoalDescriptionReviewRecordSchema,
  fingerprintGoalDescriptionReviewInput,
  loadGoalDescriptionReviewRecordSchemaBytes,
  serializeGoalDescriptionReviewBatchInput,
  validateGoalDescriptionReviewBatch,
  validateGoalDescriptionReviewCampaign,
  type GoalDescriptionReviewInput,
  type GoalDescriptionReviewRecord,
} from './validateGoalDescriptionReviewCampaign'
import {
  validateGoalDescriptionReviewCampaignResultDirectories,
  validateGoalDescriptionReviewCampaignResults,
  type GoalDescriptionReviewCampaignResultPair,
} from './validateGoalDescriptionReviewCampaignResults'
import { validateGoalDescriptionReviewDualRound } from './validateGoalDescriptionReviewDualRound'

const digest = (character: string) => `sha256:${character.repeat(64)}`
const sha256 = (value: Buffer) => `sha256:${createHash('sha256').update(value).digest('hex')}`

const fixtureEvidenceProfile = {
  schemaVersion: 1 as const,
  reviewId: 'fixture-review-01',
  ruleVersion: 'fixture-rule-v1',
  landscapeId: 'fixture-landscape',
  goalId: 'goal-01',
  goalFingerprint: digest('1'),
  reviewInputFingerprint: digest('8'),
  profileFingerprint: digest('7'),
  status: 'needs_human_review' as const,
  reviewAuthority: 'ai_candidate' as const,
  reviewedAt: '2026-08-11T05:00:00.000Z',
  reviewer: 'Fixture reviewer',
  reason: 'The existing profile supplies bounded understanding and transfer evidence.',
  evidenceLevel: 'E2' as const,
  maximumClaimScope: 'G2' as const,
  reviewRunIds: ['fixture-run-01'],
  dissent: [],
  profile: {
    archetype: 'concept' as const,
    facets: [
      { id: 'meaning', criterionDe: 'Die Bedeutung erklären.', criterionEn: 'Explain the meaning.' },
      { id: 'relation', criterionDe: 'Den Zusammenhang begründen.', criterionEn: 'Justify the relationship.' },
    ],
    coverageRequirements: {
      allOf: ['meaning', 'relation'],
      anyOf: [],
      minimumIndependentChecks: 2,
      requireChangedCase: true,
      requireCueFreeTransfer: true,
    },
    variationAxes: [
      { id: 'representation', textDe: 'Darstellung wechseln.', textEn: 'Change representation.' },
    ],
    misconceptions: [{
      id: 'surface-rule',
      signalDe: 'Nur eine Oberflächenregel nennen.',
      signalEn: 'Only name a surface rule.',
      correctionEvidenceDe: 'Den tragenden Zusammenhang erklären.',
      correctionEvidenceEn: 'Explain the underlying relationship.',
    }],
    nonEvidence: [
      { id: 'copying', textDe: 'Eine Vorlage kopieren.', textEn: 'Copy a template.' },
    ],
    outOfScope: [],
    contrastCaseBriefs: [
      {
        id: 'changed-case',
        purposeDe: 'Transfer in einen veränderten Fall.',
        purposeEn: 'Transfer to a changed case.',
        strengthDe: 'Zeigt flexibles Verständnis.',
        strengthEn: 'Shows flexible understanding.',
        whyAlternativesUnderperformDe: 'Bloße Wiederholung prüft keinen Transfer.',
        whyAlternativesUnderperformEn: 'Mere repetition does not assess transfer.',
      },
      {
        id: 'explanation-case',
        purposeDe: 'Begründung des Zusammenhangs.',
        purposeEn: 'Justification of the relationship.',
        strengthDe: 'Macht die Denkstruktur sichtbar.',
        strengthEn: 'Makes the reasoning structure visible.',
        whyAlternativesUnderperformDe: 'Ein Endergebnis allein bleibt mehrdeutig.',
        whyAlternativesUnderperformEn: 'A final answer alone remains ambiguous.',
      },
    ],
  },
}

const bundleGoals = Array.from({ length: 25 }, (_, index) => ({
  goalId: `goal-${String(index + 1).padStart(2, '0')}`,
  pageNumber: index + 1,
  goalFingerprint: digest(((index + 1) % 10).toString()),
  pageFingerprint: digest(((index + 2) % 10).toString()),
  evidenceReview: index === 0 ? {
    reviewId: fixtureEvidenceProfile.reviewId,
    status: fixtureEvidenceProfile.status,
    reviewInputFingerprint: fixtureEvidenceProfile.reviewInputFingerprint,
    profileFingerprint: fixtureEvidenceProfile.profileFingerprint,
    evidenceLevel: fixtureEvidenceProfile.evidenceLevel,
    maximumClaimScope: fixtureEvidenceProfile.maximumClaimScope,
  } : null,
}))

const promptFingerprint = digest('a')
const criteriaFingerprint = digest('b')
const bookDigest = digest('c')
const recordSchemaDigest = await fingerprintGoalDescriptionReviewRecordSchema()
assert.equal(recordSchemaDigest, sha256(await loadGoalDescriptionReviewRecordSchemaBytes()))
const bundleWithPlaceholderFingerprint: GoalBookReviewBundleManifest = {
  $schema: 'https://skillpilot.com/schemas/goal-book/v1/goal-book-review-bundle.schema.json',
  schemaVersion: 1,
  bundleFingerprint: digest('d'),
  bookModelDigest: bookDigest,
  bookModelSchemaVersion: '1.0.0',
  bookId: 'fixture-description-review-book',
  bookEdition: 'curricular-atomic-v1',
  publicationMode: 'review',
  feedbackBaseUrl: 'https://skillpilot.example/goal-feedback',
  locale: 'de-DE',
  selectedGoalCount: bundleGoals.length,
  goals: bundleGoals,
  promptFingerprint,
  criteriaFingerprint,
  artifacts: [
    ['book_pdf', digest('e')],
    ['book_pdf_render_manifest', digest('f')],
    ['book_model', bookDigest],
    ['review_input_json', digest('1')],
    ['review_input_jsonl', digest('2')],
    ['review_markdown', digest('3')],
    ['review_prompt', promptFingerprint],
    ['review_criteria', criteriaFingerprint],
    ['finding_schema', digest('4')],
    ['run_manifest_schema', digest('5')],
  ].map(([role, artifactDigest], index) => ({
    role: role as GoalBookReviewBundleManifest['artifacts'][number]['role'],
    path: `artifact-${index}.json`,
    digest: artifactDigest,
    bytes: 1,
  })),
  reviewPolicy: {
    blindIndependentFirstPass: true,
    modelVotesGrantReleaseAuthority: false,
    humanApprovalRequired: true,
    learnerDataAllowed: false,
  },
}
const bundleFingerprint = fingerprintGoalBookReviewBundleManifest(bundleWithPlaceholderFingerprint)
const bundle: GoalBookReviewBundleManifest = {
  ...bundleWithPlaceholderFingerprint,
  bundleFingerprint,
}
assert.equal(fingerprintGoalBookReviewBundleManifest(bundle), bundleFingerprint)

const artifactDirectory = await mkdtemp(join(tmpdir(), 'goal-description-review-bundle-'))
try {
  const artifactsWithRealBytes = bundle.artifacts.map((artifact, index) => {
    const bytes = Buffer.from(`fixture artifact ${artifact.role} ${index}\n`)
    return {
      artifact: {
        ...artifact,
        digest: sha256(bytes),
        bytes: bytes.length,
      },
      bytes,
    }
  })
  const artifactByRole = new Map(artifactsWithRealBytes.map(({ artifact }) => [artifact.role, artifact]))
  const byteBoundBundleWithPlaceholder = {
    ...bundle,
    bundleFingerprint: digest('d'),
    bookModelDigest: artifactByRole.get('book_model')!.digest,
    promptFingerprint: artifactByRole.get('review_prompt')!.digest,
    criteriaFingerprint: artifactByRole.get('review_criteria')!.digest,
    artifacts: artifactsWithRealBytes.map(({ artifact }) => artifact),
  }
  const byteBoundBundle = {
    ...byteBoundBundleWithPlaceholder,
    bundleFingerprint: fingerprintGoalBookReviewBundleManifest(byteBoundBundleWithPlaceholder),
  }
  await Promise.all(artifactsWithRealBytes.map(({ artifact, bytes }) => (
    writeFile(join(artifactDirectory, artifact.path), bytes)
  )))
  const verifiedArtifactBytes = await verifyGoalBookReviewBundleArtifactBytes(
    byteBoundBundle,
    artifactDirectory,
  )
  const campaignGuidanceDirectory = await mkdtemp(join(tmpdir(), 'goal-description-review-guidance-'))
  try {
    await writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts({
      bundle: byteBoundBundle,
      campaignDirectory: campaignGuidanceDirectory,
      verifiedArtifactBytes,
    })
    const prompt = artifactsWithRealBytes.find(({ artifact }) => artifact.role === 'review_prompt')!
    const criteria = artifactsWithRealBytes.find(({ artifact }) => artifact.role === 'review_criteria')!
    assert.deepEqual(
      await readFile(join(campaignGuidanceDirectory, prompt.artifact.path)),
      prompt.bytes,
    )
    assert.deepEqual(
      await readFile(join(campaignGuidanceDirectory, criteria.artifact.path)),
      criteria.bytes,
    )
    const staleVerifiedArtifactBytes = new Map(verifiedArtifactBytes)
    staleVerifiedArtifactBytes.set('review_prompt', Buffer.from('stale verified prompt\n'))
    await assert.rejects(
      () => writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts({
        bundle: byteBoundBundle,
        campaignDirectory: campaignGuidanceDirectory,
        verifiedArtifactBytes: staleVerifiedArtifactBytes,
      }),
      /no longer match the review_prompt artifact/u,
    )

    const bundleWithArtifactPaths = (promptPath: string, criteriaPath: string) => {
      const reboundWithPlaceholder = {
        ...byteBoundBundle,
        bundleFingerprint: digest('d'),
        artifacts: byteBoundBundle.artifacts.map((artifact) => {
          if (artifact.role === 'review_prompt') return { ...artifact, path: promptPath }
          if (artifact.role === 'review_criteria') return { ...artifact, path: criteriaPath }
          return artifact
        }),
      }
      return {
        ...reboundWithPlaceholder,
        bundleFingerprint: fingerprintGoalBookReviewBundleManifest(reboundWithPlaceholder),
      }
    }
    await assert.rejects(
      () => writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts({
        bundle: bundleWithArtifactPaths('../escaped-prompt.md', 'criteria.md'),
        campaignDirectory: campaignGuidanceDirectory,
        verifiedArtifactBytes,
      }),
      /escapes its campaign directory/u,
    )
    await assert.rejects(
      () => writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts({
        bundle: bundleWithArtifactPaths('batches/prompt.md', 'criteria.md'),
        campaignDirectory: campaignGuidanceDirectory,
        verifiedArtifactBytes,
      }),
      /reserved campaign path/u,
    )
    await assert.rejects(
      () => writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts({
        bundle: bundleWithArtifactPaths('description-review-input.json', 'criteria.md'),
        campaignDirectory: campaignGuidanceDirectory,
        verifiedArtifactBytes,
      }),
      /reserved campaign path/u,
    )
    await assert.rejects(
      () => writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts({
        bundle: bundleWithArtifactPaths('guidance/../criteria.md', 'criteria.md'),
        campaignDirectory: campaignGuidanceDirectory,
        verifiedArtifactBytes,
      }),
      /output paths collide/u,
    )
  } finally {
    await rm(campaignGuidanceDirectory, { force: true, recursive: true })
  }
  const promptArtifact = artifactsWithRealBytes.find(({ artifact }) => artifact.role === 'review_prompt')!
  await writeFile(join(artifactDirectory, promptArtifact.artifact.path), Buffer.from('tampered prompt\n'))
  await assert.rejects(
    () => verifyGoalBookReviewBundleArtifactBytes(byteBoundBundle, artifactDirectory),
    /review_prompt (?:byte count does|bytes do) not match/u,
  )
} finally {
  await rm(artifactDirectory, { force: true, recursive: true })
}

const inputWithoutFingerprint = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v2/goal-description-review-input.schema.json' as const,
  schemaVersion: 2 as const,
  bundleFingerprint,
  bookDigest,
  goalCount: bundleGoals.length,
  goals: bundleGoals.map((goal, index) => {
    const currentTitleDe = `Titel ${goal.goalId}`
    const currentTitleEn = `Title ${goal.goalId}`
    const currentDescriptionDe = `Die lernende Person kann ${goal.goalId} erklären und auf einen veränderten Fall übertragen.`
    const currentDescriptionEn = `The learner can explain ${goal.goalId} and transfer it to a changed case.`
    return {
      goalId: goal.goalId,
      goalFingerprint: goal.goalFingerprint,
      pageFingerprint: goal.pageFingerprint,
      currentTitleDe,
      currentTitleEn,
      currentDescriptionDe,
      currentDescriptionEn,
      reviewContext: {
        page: {
          pageNumber: goal.pageNumber,
          goalId: goal.goalId,
          anchor: `goal-${goal.goalId}`,
          title: currentTitleDe,
          description: currentDescriptionDe,
          breadcrumbs: ['Fixture', `Kapitel ${index + 1}`],
          chapterIds: ['fixture-description-review'],
          requires: index === 0 ? [] : [{
            goalId: bundleGoals[index - 1].goalId,
            title: `Titel ${bundleGoals[index - 1].goalId}`,
            anchor: `goal-${bundleGoals[index - 1].goalId}`,
            pageNumber: index,
          }],
          reverseRequires: index === bundleGoals.length - 1 ? [] : [{
            goalId: bundleGoals[index + 1].goalId,
            title: `Titel ${bundleGoals[index + 1].goalId}`,
            anchor: `goal-${bundleGoals[index + 1].goalId}`,
            pageNumber: index + 2,
          }],
          externalPrerequisites: index === 0 ? [{
            goalId: 'external-foundation',
            title: 'Externe Grundlage',
            canonicalUrl: null,
          }] : [],
          externalReverseRequires: [],
          visualization: {
            resourceType: 'image' as const,
            title: `Visualisierung ${goal.goalId}`,
            url: `assets/${goal.goalId}.svg`,
            altText: `Fachliche Darstellung zu ${goal.goalId}`,
            originalDigest: digest(((index + 3) % 10).toString()),
            qaStatus: 'approved' as const,
            approvedForPublication: true,
          },
          evidenceReview: goal.evidenceReview,
          goalFingerprint: goal.goalFingerprint,
          pageFingerprint: goal.pageFingerprint,
        },
        evidenceProfile: index === 0 ? fixtureEvidenceProfile : null,
      },
    }
  }),
}
const input: GoalDescriptionReviewInput = {
  ...inputWithoutFingerprint,
  reviewInputFingerprint: fingerprintGoalDescriptionReviewInput(inputWithoutFingerprint),
}
const builtInput = buildGoalDescriptionReviewInput({
  bundle,
  reviewInput: {
    schemaVersion: 1,
    book: {
      id: 'fixture-description-review-book',
      title: 'Fixture description review book',
      locale: 'de-DE',
      landscapeId: 'fixture-landscape',
      viewId: 'fixture-view',
      scope: {},
      pageCount: input.goalCount,
      projectedAtomicGoalCount: input.goalCount,
      excludedTargetAtomicGoalCount: 0,
      edition: 'curricular-atomic-v1',
      publicationMode: 'review',
      atlasBaseUrl: null,
      oneGoalPerPage: true,
    },
    modelDigest: bookDigest,
    pages: input.goals.map(({ reviewContext }) => reviewContext),
  },
  landscape: {
    goals: input.goals.map((goal, index) => ({
      id: goal.goalId,
      shortKey: `FIXTURE_${String(index + 1).padStart(2, '0')}`,
      phase: 'E',
      title: goal.currentTitleDe,
      titleEn: goal.currentTitleEn,
      description: goal.currentDescriptionDe,
      descriptionEn: goal.currentDescriptionEn,
      core: true,
      weight: 1,
      tags: ['fixture', `fixture:${index + 1}`],
      competencyRefs: ['PROCESS.EXPLAIN'],
      sourceRef: 'Fixture curriculum source, p. 1',
      dimensionTags: {
        framework: 'fixture-framework',
        demandLevel: 'AB2',
        processCompetencies: ['explain'],
        guidingIdeas: ['relationship'],
        phase: 'fixture-phase',
        area: 'Fixture area',
        topicCode: `F${index + 1}`,
      },
      applicability: { jurisdiction: ['DE-HE'] },
      type: 'atomic',
      semanticAtomic: true,
      extendedData: {
        applicabilityFromRequires: index === 0,
        applicabilityMappingInheritance: 'boundary',
      },
      requires: index === 0 ? [] : [input.goals[index - 1].goalId],
      contains: [],
      examples: [`fixture-example-${index + 1}`],
    })),
  },
})
assert.equal(builtInput.schemaVersion, 3)
assert.equal(
  builtInput.$schema,
  'https://skillpilot.com/schemas/goal-description-review/v3/goal-description-review-input.schema.json',
)
assert.deepEqual(builtInput.goals[0].canonicalContext, {
  shortKey: 'FIXTURE_01',
  phase: 'E',
  core: true,
  weight: 1,
  tags: ['fixture', 'fixture:1'],
  competencyRefs: ['PROCESS.EXPLAIN'],
  sourceRef: 'Fixture curriculum source, p. 1',
  dimensionTags: {
    framework: 'fixture-framework',
    demandLevel: 'AB2',
    processCompetencies: ['explain'],
    guidingIdeas: ['relationship'],
    phase: 'fixture-phase',
    area: 'Fixture area',
    topicCode: 'F1',
  },
  applicability: { jurisdiction: ['DE-HE'] },
  type: 'atomic',
  nodeKind: null,
  semanticAtomic: true,
  semanticKind: null,
  applicabilitySemantics: {
    fromRequires: true,
    mappingInheritance: 'boundary',
    projection: null,
  },
  requires: [],
  contains: [],
  examples: ['fixture-example-1'],
})

const campaign = buildGoalDescriptionReviewCampaign({
  bundle,
  input,
  campaignId: 'math-description-round-one',
  roundId: 'math-description-round-one-codex',
  reviewerRole: 'external_ai_reviewer',
  reviewPass: 'first_pass',
  independenceGroupId: 'math-description-blind-a',
  blindToOtherReviews: true,
  recordSchemaDigest,
  batchSize: 20,
})
assert.equal(campaign.batches.length, 2)
assert.equal(campaign.batches[0].goalIds.length, 20)
assert.equal(campaign.batches[1].goalIds.length, 5)
assert.equal(campaign.batches[0].batchId, 'math-description-round-one-codex.batch-001')
assert.equal(campaign.recordSchemaDigest, recordSchemaDigest)
assert.equal(campaign.batches[0].recordSchemaDigest, recordSchemaDigest)
assert.deepEqual(
  (await validateGoalDescriptionReviewCampaign({ bundle, input, campaign })).errors,
  [],
)
const currentBundleWithoutFingerprint = {
  ...bundle,
  bundleFingerprint: digest('0'),
  bookModelSchemaVersion: '1.1.0' as const,
}
const currentBundle: GoalBookReviewBundleManifest = {
  ...currentBundleWithoutFingerprint,
  bundleFingerprint: fingerprintGoalBookReviewBundleManifest(currentBundleWithoutFingerprint),
}
const currentInputWithoutFingerprint = {
  ...inputWithoutFingerprint,
  bundleFingerprint: currentBundle.bundleFingerprint,
  goals: inputWithoutFingerprint.goals.map((goal, index) => ({
    ...goal,
    reviewContext: {
      ...goal.reviewContext,
      page: {
        ...goal.reviewContext.page,
        navigationOrder: index,
        treeOrder: index,
      },
    },
  })),
}
const currentInput: GoalDescriptionReviewInput = {
  ...currentInputWithoutFingerprint,
  reviewInputFingerprint: fingerprintGoalDescriptionReviewInput(currentInputWithoutFingerprint),
}
const currentCampaign = buildGoalDescriptionReviewCampaign({
  bundle: currentBundle,
  input: currentInput,
  campaignId: 'math-description-round-current',
  roundId: 'math-description-round-current-codex',
  reviewerRole: 'external_ai_reviewer',
  reviewPass: 'first_pass',
  independenceGroupId: 'math-description-blind-current',
  blindToOtherReviews: true,
  recordSchemaDigest,
  batchSize: 20,
})
assert.deepEqual(
  (await validateGoalDescriptionReviewCampaign({
    bundle: currentBundle,
    input: currentInput,
    campaign: currentCampaign,
  })).errors,
  [],
)
const hybridInputWithoutFingerprint = structuredClone(currentInputWithoutFingerprint)
delete (hybridInputWithoutFingerprint.goals[0].reviewContext.page as {
  treeOrder?: number
}).treeOrder
const hybridInput = {
  ...hybridInputWithoutFingerprint,
  reviewInputFingerprint: fingerprintGoalDescriptionReviewInput(hybridInputWithoutFingerprint),
} as GoalDescriptionReviewInput
const hybridCampaign = buildGoalDescriptionReviewCampaign({
  bundle: currentBundle,
  input: hybridInput,
  campaignId: 'math-description-round-hybrid',
  roundId: 'math-description-round-hybrid-codex',
  reviewerRole: 'external_ai_reviewer',
  reviewPass: 'first_pass',
  independenceGroupId: 'math-description-blind-hybrid',
  blindToOtherReviews: true,
  recordSchemaDigest,
  batchSize: 20,
})
assert.match(
  (await validateGoalDescriptionReviewCampaign({
    bundle: currentBundle,
    input: hybridInput,
    campaign: hybridCampaign,
  })).errors.join('\n'),
  /oneOf|treeOrder|additional properties/u,
)
assert.equal(input.schemaVersion, 2)
const v3Campaign = buildGoalDescriptionReviewCampaign({
  bundle,
  input: builtInput,
  campaignId: 'math-description-round-v3',
  roundId: 'math-description-round-v3-codex',
  reviewerRole: 'external_ai_reviewer',
  reviewPass: 'first_pass',
  independenceGroupId: 'math-description-blind-v3',
  blindToOtherReviews: true,
  recordSchemaDigest,
  batchSize: 20,
})
assert.deepEqual(
  (await validateGoalDescriptionReviewCampaign({ bundle, input: builtInput, campaign: v3Campaign })).errors,
  [],
)

const staleCanonicalContextInput = structuredClone(builtInput)
staleCanonicalContextInput.goals[0].canonicalContext!.weight = 2
assert.match(
  (await validateGoalDescriptionReviewCampaign({
    bundle,
    input: staleCanonicalContextInput,
    campaign: v3Campaign,
  })).errors.join('\n'),
  /reviewInputFingerprint|batchInputFingerprint/u,
)

const unsupportedHumanCampaign = {
  ...campaign,
  reviewerRole: 'human_reviewer',
} as unknown as typeof campaign
assert.match(
  (await validateGoalDescriptionReviewCampaign({
    bundle,
    input,
    campaign: unsupportedHumanCampaign,
  })).errors.join('\n'),
  /reviewerRole|allowed values/u,
)

const staleBundleFingerprintBundle = {
  ...bundle,
  promptFingerprint: digest('9'),
}
assert.match(
  (await validateGoalDescriptionReviewCampaign({
    bundle: staleBundleFingerprintBundle,
    input,
    campaign,
  })).errors.join('\n'),
  /bundleFingerprint is stale|review_prompt matching promptFingerprint/u,
)
const duplicateArtifactPathBundleWithPlaceholder = {
  ...bundle,
  bundleFingerprint: digest('d'),
  artifacts: bundle.artifacts.map((artifact, index) => index === 1
    ? { ...artifact, path: bundle.artifacts[0].path }
    : artifact),
}
const duplicateArtifactPathBundle = {
  ...duplicateArtifactPathBundleWithPlaceholder,
  bundleFingerprint: fingerprintGoalBookReviewBundleManifest(duplicateArtifactPathBundleWithPlaceholder),
}
assert.match(
  (await validateGoalDescriptionReviewCampaign({
    bundle: duplicateArtifactPathBundle,
    input,
    campaign,
  })).errors.join('\n'),
  /artifact paths must be unique/u,
)

const nonBlindCampaign = {
  ...campaign,
  blindToOtherReviews: false,
}
assert.match(
  (await validateGoalDescriptionReviewCampaign({ bundle, input, campaign: nonBlindCampaign })).errors.join('\n'),
  /blindToOtherReviews|blind to other reviews/u,
)

const staleBatchCampaign = {
  ...campaign,
  batches: campaign.batches.map((batch, index) => index === 0
    ? { ...batch, batchInputFingerprint: digest('9') }
    : batch),
}
assert.match(
  (await validateGoalDescriptionReviewCampaign({ bundle, input, campaign: staleBatchCampaign })).errors.join('\n'),
  /batchInputFingerprint/u,
)

const staleRecordSchemaCampaign = {
  ...campaign,
  recordSchemaDigest: digest('9'),
}
assert.match(
  (await validateGoalDescriptionReviewCampaign({
    bundle,
    input,
    campaign: staleRecordSchemaCampaign,
  })).errors.join('\n'),
  /recordSchemaDigest/u,
)

const staleBatchRecordSchemaCampaign = {
  ...campaign,
  batches: campaign.batches.map((candidate, index) => index === 0
    ? { ...candidate, recordSchemaDigest: digest('9') }
    : candidate),
}
assert.match(
  (await validateGoalDescriptionReviewCampaign({
    bundle,
    input,
    campaign: staleBatchRecordSchemaCampaign,
  })).errors.join('\n'),
  /recordSchemaDigest/u,
)

const contextTamperedInputPayload = {
  $schema: input.$schema,
  schemaVersion: input.schemaVersion,
  bundleFingerprint: input.bundleFingerprint,
  bookDigest: input.bookDigest,
  goalCount: input.goalCount,
  goals: input.goals.map((goal, index) => index === 0
    ? {
        ...goal,
        reviewContext: {
          ...goal.reviewContext,
          page: { ...goal.reviewContext.page, title: 'Fremder Seitentitel' },
        },
      }
    : goal),
}
const contextTamperedInput: GoalDescriptionReviewInput = {
  ...contextTamperedInputPayload,
  reviewInputFingerprint: fingerprintGoalDescriptionReviewInput(contextTamperedInputPayload),
}
const contextTamperedCampaign = buildGoalDescriptionReviewCampaign({
  bundle,
  input: contextTamperedInput,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  reviewerRole: campaign.reviewerRole,
  reviewPass: campaign.reviewPass,
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherReviews: campaign.blindToOtherReviews,
  recordSchemaDigest,
  batchSize: campaign.batchSize,
})
assert.match(
  (await validateGoalDescriptionReviewCampaign({
    bundle,
    input: contextTamperedInput,
    campaign: contextTamperedCampaign,
  })).errors.join('\n'),
  /page context disagrees with its current German text/u,
)

const batch = campaign.batches[0]
const batchInputBytes = serializeGoalDescriptionReviewBatchInput({
  bundleFingerprint,
  bookDigest,
  reviewInputFingerprint: input.reviewInputFingerprint,
  inputSchemaVersion: input.schemaVersion,
  recordSchemaDigest,
  batchId: batch.batchId,
  goalIds: batch.goalIds,
  goals: input.goals.slice(0, batch.goalIds.length),
})
const firstBatchLine = JSON.parse(batchInputBytes.toString('utf8').trim().split('\n')[0])
assert.equal(firstBatchLine.schemaVersion, 2)
assert.equal(Object.hasOwn(firstBatchLine, 'inputSchemaVersion'), false)
assert.deepEqual(Object.keys(firstBatchLine).sort(), [
  'batchGoalIds',
  'batchId',
  'bookDigest',
  'bundleFingerprint',
  'goal',
  'ordinal',
  'recordSchemaDigest',
  'reviewInputFingerprint',
  'schemaVersion',
])
assert.equal(firstBatchLine.recordSchemaDigest, recordSchemaDigest)
assert.deepEqual(firstBatchLine.batchGoalIds, batch.goalIds)
assert.deepEqual(firstBatchLine.goal.reviewContext, input.goals[0].reviewContext)
assert.equal(firstBatchLine.goal.reviewContext.page.requires.length, 0)
assert.equal(firstBatchLine.goal.reviewContext.page.externalPrerequisites.length, 1)
assert.equal(firstBatchLine.goal.reviewContext.page.visualization.resourceType, 'image')
assert.equal(firstBatchLine.goal.reviewContext.evidenceProfile.reviewId, 'fixture-review-01')
assert.equal(firstBatchLine.goal.reviewContext.evidenceProfile.profile.facets.length, 2)

const v3Batch = v3Campaign.batches[0]
const v3BatchInputBytes = serializeGoalDescriptionReviewBatchInput({
  bundleFingerprint,
  bookDigest,
  reviewInputFingerprint: builtInput.reviewInputFingerprint,
  inputSchemaVersion: builtInput.schemaVersion,
  recordSchemaDigest,
  batchId: v3Batch.batchId,
  goalIds: v3Batch.goalIds,
  goals: builtInput.goals.slice(0, v3Batch.goalIds.length),
})
const firstV3BatchLine = JSON.parse(v3BatchInputBytes.toString('utf8').trim().split('\n')[0])
assert.equal(firstV3BatchLine.schemaVersion, 3)
assert.equal(Object.hasOwn(firstV3BatchLine, 'inputSchemaVersion'), false)
assert.equal(firstV3BatchLine.goal.canonicalContext.weight, 1)

const makeRecord = (
  goalId: string,
  index: number,
  runId = 'description-run-001',
): GoalDescriptionReviewRecord => {
  const source = input.goals.find((goal) => goal.goalId === goalId)!
  const revise = index === 0
  return {
    recordId: `record-${String(index + 1).padStart(2, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint,
    bookDigest,
    goalId,
    goalFingerprint: source.goalFingerprint,
    pageFingerprint: source.pageFingerprint,
    currentTitleDe: source.currentTitleDe,
    currentTitleEn: source.currentTitleEn,
    currentDescriptionDe: source.currentDescriptionDe,
    currentDescriptionEn: source.currentDescriptionEn,
    decision: revise ? 'revise' : 'keep',
    ...(revise ? {
      proposedDescriptionDe: `${source.currentDescriptionDe} Die Begründung bezieht sich auf die wesentlichen fachlichen Zusammenhänge.`,
      proposedDescriptionEn: `${source.currentDescriptionEn} The justification addresses the essential subject-specific relationships.`,
    } : {}),
    understandingEvidence: {
      essentialUnderstandingDe: `Die lernende Person erklärt den fachlichen Zusammenhang von ${goalId} in eigenen Worten.`,
      essentialUnderstandingEn: `The learner explains the subject-specific relationship of ${goalId} in their own words.`,
      observablePerformanceDe: `Die lernende Person begründet eine passende Lösung zu ${goalId} nachvollziehbar.`,
      observablePerformanceEn: `The learner gives a traceable justification for a suitable solution to ${goalId}.`,
      transferExpectationDe: `Die lernende Person wendet das Verständnis von ${goalId} auf eine veränderte Situation an.`,
      transferExpectationEn: `The learner applies their understanding of ${goalId} to a changed situation.`,
    },
    rationale: revise
      ? 'The proposed wording makes the subject-specific justification and transfer expectation explicit.'
      : 'The current wording already states observable explanation and transfer expectations.',
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: revise ? 'create' : 'none',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
}
const records = batch.goalIds.map((goalId, index) => makeRecord(goalId, index))
const recordsBytes = Buffer.from(`${records.map((record) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
})).join('\n')}\n`)
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1,
  runId: 'description-run-001',
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint,
  bookDigest,
  provider: 'Example external provider',
  model: 'Example reviewer model',
  role: 'didactic_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-v2',
  promptFingerprint,
  criteriaFingerprint,
  generationParametersFingerprint: digest('6'),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'review_input_jsonl', digest: digest('2') },
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
    { role: 'review_prompt', digest: promptFingerprint },
    { role: 'review_criteria', digest: criteriaFingerprint },
  ],
  startedAt: '2026-08-11T06:00:00.000Z',
  completedAt: '2026-08-11T06:02:00.000Z',
  status: 'completed',
  outputDigest: sha256(recordsBytes),
  toolchainVersion: 'goal-description-review-v1',
}

const validBatch = await validateGoalDescriptionReviewBatch({
  bundle,
  input,
  campaign,
  run,
  batchInputBytes,
  recordsBytes,
})
assert.deepEqual(validBatch.errors, [])
assert.equal(validBatch.records.length, 20)
assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, status: 'failed' },
    batchInputBytes,
    recordsBytes,
  })).errors.join('\n'),
  /status must be completed/u,
)

const secondBatch = campaign.batches[1]
const secondBatchOffset = campaign.batchSize
const secondBatchInputBytes = serializeGoalDescriptionReviewBatchInput({
  bundleFingerprint,
  bookDigest,
  reviewInputFingerprint: input.reviewInputFingerprint,
  inputSchemaVersion: input.schemaVersion,
  recordSchemaDigest,
  batchId: secondBatch.batchId,
  goalIds: secondBatch.goalIds,
  goals: input.goals.slice(secondBatchOffset),
})
const secondRecords = secondBatch.goalIds.map((goalId, index) => (
  makeRecord(goalId, secondBatchOffset + index, 'description-run-002')
))
const secondRecordsBytes = Buffer.from(`${secondRecords.map((record) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
})).join('\n')}\n`)
const secondRun = {
  ...run,
  runId: 'description-run-002',
  batchId: secondBatch.batchId,
  batchInputFingerprint: secondBatch.batchInputFingerprint,
  goalIds: secondBatch.goalIds,
  inputArtifacts: run.inputArtifacts.map((artifact) => (
    artifact.role === 'description_review_batch_input_jsonl'
      ? { ...artifact, digest: secondBatch.batchInputFingerprint }
      : artifact
  )),
  outputDigest: sha256(secondRecordsBytes),
}
const resultPairs: GoalDescriptionReviewCampaignResultPair[] = [
  { batchId: batch.batchId, run, batchInputBytes, recordsBytes },
  {
    batchId: secondBatch.batchId,
    run: secondRun,
    batchInputBytes: secondBatchInputBytes,
    recordsBytes: secondRecordsBytes,
  },
]
const validCampaignResults = await validateGoalDescriptionReviewCampaignResults({
  bundle,
  input,
  campaign,
  resultPairs,
})
assert.deepEqual(validCampaignResults.errors, [])
assert.equal(validCampaignResults.records.length, input.goalCount)

const secondCampaign = buildGoalDescriptionReviewCampaign({
  bundle,
  input,
  campaignId: 'math-description-round-two',
  roundId: 'math-description-round-two-codex',
  reviewerRole: 'external_ai_reviewer',
  reviewPass: 'first_pass',
  independenceGroupId: 'math-description-blind-b',
  blindToOtherReviews: true,
  recordSchemaDigest,
  batchSize: 20,
})
const firstRoundRecordsByBatch = [records, secondRecords]
const secondRoundResultPairs: GoalDescriptionReviewCampaignResultPair[] = secondCampaign.batches.map(
  (secondCampaignBatch, batchIndex) => {
    const sourceRecords = firstRoundRecordsByBatch[batchIndex]
    const runId = `description-round-two-run-${String(batchIndex + 1).padStart(3, '0')}`
    const secondRoundRecords = sourceRecords.map((record) => ({
      ...record,
      recordId: `round-two-${record.recordId}`,
      runId,
      campaignId: secondCampaign.campaignId,
      roundId: secondCampaign.roundId,
    }))
    const secondRoundRecordsBytes = Buffer.from(`${secondRoundRecords.map((record) => JSON.stringify({
      $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
      schemaVersion: 1,
      ...record,
    })).join('\n')}\n`)
    const offset = batchIndex * secondCampaign.batchSize
    const secondRoundBatchInputBytes = serializeGoalDescriptionReviewBatchInput({
      bundleFingerprint,
      bookDigest,
      reviewInputFingerprint: input.reviewInputFingerprint,
      inputSchemaVersion: input.schemaVersion,
      recordSchemaDigest,
      batchId: secondCampaignBatch.batchId,
      goalIds: secondCampaignBatch.goalIds,
      goals: input.goals.slice(offset, offset + secondCampaignBatch.goalIds.length),
    })
    const sourceRun = resultPairs[batchIndex].run
    const secondRoundRun = {
      ...sourceRun,
      runId,
      campaignId: secondCampaign.campaignId,
      roundId: secondCampaign.roundId,
      batchId: secondCampaignBatch.batchId,
      batchInputFingerprint: secondCampaignBatch.batchInputFingerprint,
      independenceGroupId: secondCampaign.independenceGroupId,
      inputArtifacts: sourceRun.inputArtifacts.map((artifact) => (
        artifact.role === 'description_review_batch_input_jsonl'
          ? { ...artifact, digest: secondCampaignBatch.batchInputFingerprint }
          : artifact
      )),
      outputDigest: sha256(secondRoundRecordsBytes),
    }
    return {
      batchId: secondCampaignBatch.batchId,
      run: secondRoundRun,
      batchInputBytes: secondRoundBatchInputBytes,
      recordsBytes: secondRoundRecordsBytes,
    }
  },
)
const dualRound = await validateGoalDescriptionReviewDualRound({
  first: { bundle, input, campaign, resultPairs },
  second: { bundle, input, campaign: secondCampaign, resultPairs: secondRoundResultPairs },
})
assert.deepEqual(dualRound.errors, [])
assert.equal(dualRound.summary.automaticAcceptance, false)
assert.equal(dualRound.summary.counts.exactAgreement, input.goalCount)
assert.equal(dualRound.summary.counts.disagreement, 0)
assert.equal(dualRound.summary.counts.requiresSynthesis, 0)
assert.equal(dualRound.summary.diversity.distinctProviderOrModel, false)
assert.equal(dualRound.summary.diversity.policySatisfied, true)

assert.match(
  (await validateGoalDescriptionReviewDualRound({
    first: { bundle, input, campaign, resultPairs },
    second: { bundle, input, campaign: secondCampaign, resultPairs: secondRoundResultPairs },
    diversityPolicy: 'require_distinct_provider_or_model',
  })).errors.join('\n'),
  /provider\/model diversity policy/u,
)

const diverseSecondRoundPairs = secondRoundResultPairs.map((pair) => ({
  ...pair,
  run: {
    ...pair.run,
    provider: 'Second independent provider',
    model: 'Second independent reviewer model',
  },
}))
assert.deepEqual(
  (await validateGoalDescriptionReviewDualRound({
    first: { bundle, input, campaign, resultPairs },
    second: { bundle, input, campaign: secondCampaign, resultPairs: diverseSecondRoundPairs },
    diversityPolicy: 'require_distinct_provider_or_model',
  })).errors,
  [],
)

const disagreementDocuments = secondRoundResultPairs[0].recordsBytes.toString('utf8')
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line))
disagreementDocuments[0].rationale = `${disagreementDocuments[0].rationale} Independent dissent.`
const disagreementBytes = Buffer.from(`${disagreementDocuments.map((record) => JSON.stringify(record)).join('\n')}\n`)
const disagreementSecondRoundPairs = secondRoundResultPairs.map((pair, index) => index === 0
  ? {
      ...pair,
      run: { ...pair.run, outputDigest: sha256(disagreementBytes) },
      recordsBytes: disagreementBytes,
    }
  : pair)
const disagreementDualRound = await validateGoalDescriptionReviewDualRound({
  first: { bundle, input, campaign, resultPairs },
  second: {
    bundle,
    input,
    campaign: secondCampaign,
    resultPairs: disagreementSecondRoundPairs,
  },
})
assert.deepEqual(disagreementDualRound.errors, [])
assert.equal(disagreementDualRound.summary.counts.disagreement, 1)
assert.equal(disagreementDualRound.summary.counts.requiresSynthesis, 1)
assert.deepEqual(disagreementDualRound.summary.goals[0].disagreementFields, ['rationale'])
assert.equal(disagreementDualRound.summary.goals[0].automaticAcceptance, false)

const reusedRunDocuments = secondRoundResultPairs[0].recordsBytes.toString('utf8')
  .trim()
  .split('\n')
  .map((line) => ({ ...JSON.parse(line), runId: run.runId }))
const reusedRunBytes = Buffer.from(`${reusedRunDocuments.map((record) => JSON.stringify(record)).join('\n')}\n`)
const reusedRunSecondRoundPairs = secondRoundResultPairs.map((pair, index) => index === 0
  ? {
      ...pair,
      run: { ...pair.run, runId: run.runId, outputDigest: sha256(reusedRunBytes) },
      recordsBytes: reusedRunBytes,
    }
  : pair)
assert.match(
  (await validateGoalDescriptionReviewDualRound({
    first: { bundle, input, campaign, resultPairs },
    second: { bundle, input, campaign: secondCampaign, resultPairs: reusedRunSecondRoundPairs },
  })).errors.join('\n'),
  /globally unique runIds/u,
)

assert.match(
  (await validateGoalDescriptionReviewDualRound({
    first: { bundle, input, campaign, resultPairs },
    second: {
      bundle,
      input,
      campaign: { ...secondCampaign, independenceGroupId: campaign.independenceGroupId },
      resultPairs: secondRoundResultPairs,
    },
  })).errors.join('\n'),
  /different independenceGroupId/u,
)

assert.match(
  (await validateGoalDescriptionReviewCampaignResults({
    bundle,
    input,
    campaign,
    resultPairs: resultPairs.slice(0, 1),
  })).errors.join('\n'),
  /Missing result pair/u,
)

assert.match(
  (await validateGoalDescriptionReviewCampaignResults({
    bundle,
    input,
    campaign,
    resultPairs: [
      ...resultPairs,
      { ...resultPairs[1], batchId: 'unknown.batch-999' },
    ],
  })).errors.join('\n'),
  /Extra result pair/u,
)

assert.match(
  (await validateGoalDescriptionReviewCampaignResults({
    bundle,
    input,
    campaign,
    resultPairs: [resultPairs[0], resultPairs[0], resultPairs[1]],
  })).errors.join('\n'),
  /Duplicate result pair/u,
)

const duplicateRunIdRecords = secondRecords.map((record) => ({
  ...record,
  runId: run.runId,
}))
const duplicateRunIdRecordsBytes = Buffer.from(`${duplicateRunIdRecords.map((record) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewCampaignResults({
    bundle,
    input,
    campaign,
    resultPairs: [
      resultPairs[0],
      {
        ...resultPairs[1],
        run: {
          ...secondRun,
          runId: run.runId,
          outputDigest: sha256(duplicateRunIdRecordsBytes),
        },
        recordsBytes: duplicateRunIdRecordsBytes,
      },
    ],
  })).errors.join('\n'),
  /Duplicate runId across campaign/u,
)

const duplicateRecordIdRecords = secondRecords.map((record, index) => index === 0
  ? { ...record, recordId: records[0].recordId }
  : record)
const duplicateRecordIdRecordsBytes = Buffer.from(`${duplicateRecordIdRecords.map((record) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewCampaignResults({
    bundle,
    input,
    campaign,
    resultPairs: [
      resultPairs[0],
      {
        ...resultPairs[1],
        run: { ...secondRun, outputDigest: sha256(duplicateRecordIdRecordsBytes) },
        recordsBytes: duplicateRecordIdRecordsBytes,
      },
    ],
  })).errors.join('\n'),
  /Duplicate recordId across campaign/u,
)

const reversedSecondRecordsBytes = Buffer.from(`${[...secondRecords].reverse().map((record) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewCampaignResults({
    bundle,
    input,
    campaign,
    resultPairs: [
      resultPairs[0],
      {
        ...resultPairs[1],
        run: { ...secondRun, outputDigest: sha256(reversedSecondRecordsBytes) },
        recordsBytes: reversedSecondRecordsBytes,
      },
    ],
  })).errors.join('\n'),
  /preserve batch order|deterministic campaign order/u,
)

assert.match(
  (await validateGoalDescriptionReviewCampaignResults({
    bundle,
    input,
    campaign,
    resultPairs: [
      resultPairs[0],
      {
        ...resultPairs[1],
        run: { ...secondRun, outputDigest: digest('9') },
      },
    ],
  })).errors.join('\n'),
  /outputDigest/u,
)

assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, independenceGroupId: 'foreign-independent-group' },
    batchInputBytes,
    recordsBytes,
  })).errors.join('\n'),
  /independenceGroupId does not match the campaign/u,
)

assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run,
    batchInputBytes: Buffer.concat([batchInputBytes, Buffer.from('tampered')]),
    recordsBytes,
  })).errors.join('\n'),
  /Batch-input bytes do not match the campaign batchInputFingerprint/u,
)

assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: {
      ...run,
      inputArtifacts: run.inputArtifacts.filter(({ role }) => role !== 'description_review_batch_input_jsonl'),
    },
    batchInputBytes,
    recordsBytes,
  })).errors.join('\n'),
  /must include the bound description_review_batch_input_jsonl/u,
)

assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: {
      ...run,
      inputArtifacts: run.inputArtifacts.map((artifact) => (
        artifact.role === 'description_review_batch_input_jsonl'
          ? { ...artifact, digest: digest('9') }
          : artifact
      )),
    },
    batchInputBytes,
    recordsBytes,
  })).errors.join('\n'),
  /description_review_batch_input_jsonl digest does not match the campaign batch/u,
)

const staleEvidenceContractBytes = Buffer.from(`${records.map((record, index) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
  ...(index === 0 ? { evidenceProfileContract: 'positive-understanding-evidence-v1' } : {}),
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, outputDigest: sha256(staleEvidenceContractBytes) },
    batchInputBytes,
    recordsBytes: staleEvidenceContractBytes,
  })).errors.join('\n'),
  /evidenceProfileContract|positive-understanding-evidence-v2/u,
)

const unexpectedRecordFieldBytes = Buffer.from(`${records.map((record, index) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
  ...(index === 0 ? { unexpectedField: 'not allowed' } : {}),
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, outputDigest: sha256(unexpectedRecordFieldBytes) },
    batchInputBytes,
    recordsBytes: unexpectedRecordFieldBytes,
  })).errors.join('\n'),
  /unexpectedField|additional properties/u,
)

const incompleteUnderstandingEvidenceBytes = Buffer.from(`${records.map((record, index) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
  ...(index === 0 ? {
    understandingEvidence: {
      essentialUnderstandingDe: record.understandingEvidence.essentialUnderstandingDe,
      essentialUnderstandingEn: record.understandingEvidence.essentialUnderstandingEn,
      observablePerformanceDe: record.understandingEvidence.observablePerformanceDe,
      observablePerformanceEn: record.understandingEvidence.observablePerformanceEn,
      transferExpectationDe: record.understandingEvidence.transferExpectationDe,
    },
  } : {}),
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, outputDigest: sha256(incompleteUnderstandingEvidenceBytes) },
    batchInputBytes,
    recordsBytes: incompleteUnderstandingEvidenceBytes,
  })).errors.join('\n'),
  /transferExpectationEn|required property/u,
)

const missingRecordBytes = Buffer.from(`${records.slice(0, -1).map((record) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, outputDigest: sha256(missingRecordBytes) },
    batchInputBytes,
    recordsBytes: missingRecordBytes,
  })).errors.join('\n'),
  /exactly one record per run goal/u,
)

const foreignCurrentTextBytes = Buffer.from(`${records.map((record, index) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
  ...(index === 0 ? { currentTitleEn: 'Foreign title' } : {}),
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, outputDigest: sha256(foreignCurrentTextBytes) },
    batchInputBytes,
    recordsBytes: foreignCurrentTextBytes,
  })).errors.join('\n'),
  /bound current bilingual text/u,
)

assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, promptFingerprint: digest('7') },
    batchInputBytes,
    recordsBytes,
  })).errors.join('\n'),
  /promptFingerprint/u,
)

const keepWithProposalBytes = Buffer.from(`${records.map((record, index) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
  ...(index === 1 ? { proposedDescriptionDe: 'Unzulässiger Vorschlag.' } : {}),
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, outputDigest: sha256(keepWithProposalBytes) },
    batchInputBytes,
    recordsBytes: keepWithProposalBytes,
  })).errors.join('\n'),
  /Record 2/u,
)

// Repair one language without forcing cosmetic edits to the sound counterpart.
for (const unchangedLanguage of ['De', 'En'] as const) {
  const singleLanguageRevisionBytes = Buffer.from(`${records.map((record, index) => JSON.stringify({
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    ...record,
    ...(index === 0 ? { [`proposedDescription${unchangedLanguage}`]: record[`currentDescription${unchangedLanguage}`] } : {}),
  })).join('\n')}\n`)
  assert.deepEqual(
    (await validateGoalDescriptionReviewBatch({
      bundle,
      input,
      campaign,
      run: { ...run, outputDigest: sha256(singleLanguageRevisionBytes) },
      batchInputBytes,
      recordsBytes: singleLanguageRevisionBytes,
    })).errors,
    [],
  )
}

const noOpBilingualRevisionBytes = Buffer.from(`${records.map((record, index) => JSON.stringify({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  ...record,
  ...(index === 0 ? {
    proposedDescriptionDe: record.currentDescriptionDe,
    proposedDescriptionEn: record.currentDescriptionEn,
  } : {}),
})).join('\n')}\n`)
assert.match(
  (await validateGoalDescriptionReviewBatch({
    bundle,
    input,
    campaign,
    run: { ...run, outputDigest: sha256(noOpBilingualRevisionBytes) },
    batchInputBytes,
    recordsBytes: noOpBilingualRevisionBytes,
  })).errors.join('\n'),
  /no-op bilingual revision/u,
)

const resultDirectoryRoot = await mkdtemp(join(tmpdir(), 'goal-description-review-results-'))
try {
  const batchesDirectory = join(resultDirectoryRoot, 'batches')
  const resultsDirectory = join(resultDirectoryRoot, 'results')
  await Promise.all([
    mkdir(batchesDirectory),
    mkdir(resultsDirectory),
  ])
  await Promise.all([
    writeFile(join(batchesDirectory, `${batch.batchId}.input.jsonl`), batchInputBytes),
    writeFile(join(batchesDirectory, `${secondBatch.batchId}.input.jsonl`), secondBatchInputBytes),
    writeFile(join(resultsDirectory, `${batch.batchId}.run.json`), `${JSON.stringify(run)}\n`),
    writeFile(join(resultsDirectory, `${batch.batchId}.records.jsonl`), recordsBytes),
    writeFile(join(resultsDirectory, `${secondBatch.batchId}.run.json`), `${JSON.stringify(secondRun)}\n`),
    writeFile(join(resultsDirectory, `${secondBatch.batchId}.records.jsonl`), secondRecordsBytes),
  ])
  assert.deepEqual(
    (await validateGoalDescriptionReviewCampaignResultDirectories({
      bundle,
      input,
      campaign,
      batchesDirectory,
      resultsDirectory,
    })).errors,
    [],
  )
  await writeFile(join(resultsDirectory, 'unbound-output.jsonl'), '{}\n')
  assert.match(
    (await validateGoalDescriptionReviewCampaignResultDirectories({
      bundle,
      input,
      campaign,
      batchesDirectory,
      resultsDirectory,
    })).errors.join('\n'),
    /Extra campaign-result artifact/u,
  )
} finally {
  await rm(resultDirectoryRoot, { force: true, recursive: true })
}

const existingOutputParent = await mkdtemp(join(tmpdir(), 'goal-description-review-existing-'))
try {
  await assert.rejects(
    () => createGoalDescriptionReviewCampaignArtifacts({
      bundleBytes: Buffer.from('{}'),
      bookModelBytes: Buffer.from('{}'),
      reviewInputBytes: Buffer.from('{}'),
      bundleDirectory: existingOutputParent,
      outputDirectory: existingOutputParent,
      campaignOptions: {
        campaignId: campaign.campaignId,
        roundId: campaign.roundId,
        reviewerRole: campaign.reviewerRole,
        reviewPass: campaign.reviewPass,
        independenceGroupId: campaign.independenceGroupId,
        blindToOtherReviews: campaign.blindToOtherReviews,
        batchSize: campaign.batchSize,
      },
    }),
    /Campaign output directory already exists/u,
  )
} finally {
  await rm(existingOutputParent, { force: true, recursive: true })
}

console.log('Goal-description review campaign tests passed.')
