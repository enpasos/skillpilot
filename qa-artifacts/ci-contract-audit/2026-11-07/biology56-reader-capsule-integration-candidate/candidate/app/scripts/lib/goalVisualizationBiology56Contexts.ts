// SPDX-License-Identifier: Apache-2.0
import type { VisualizationContextQualification, VisualizationCurrentContext, VisualizationReviewArtifact, VisualizationReviewedContext } from '../goalVisualizationReviewedContext'

const OWNER = '08a43a1b-d97e-522c-9dfa-c950a493364e'
const SOURCE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const SOURCE_SHA256 = '9b3ef170c367b0cd9936804c9b0bb696d0b4f2465d8688f9f707abf962de7b79'
const COMMIT = '6fe35a6b0fa807e5a97475b34f3715dc16a89c00'
export const BIOLOGY56_PROFILE = 'biology-sealed-native-three-families-v1'
const FAMILIES = [
  {
    "name": "human20",
    "goalIds": [
      "1abf08d7-6fc1-5705-b2d4-21cb44ceeba0",
      "41467314-3611-5ee3-98c5-f1e8eca2efc2",
      "1f65f78e-b528-5d88-ad00-8e8714a2303e",
      "c7e2d7e5-ce6b-53e0-806d-66ae4d7846dd",
      "bd5e675f-61cc-593d-913e-383e1d3f8783",
      "bb6fb806-ee15-5881-8529-2425cadfb5a1",
      "73624d0c-bc6f-5b5d-baf5-099ca62fab79",
      "ed84c759-62e5-537f-90b8-4e8c2dbfd9bb",
      "30a1d736-77ca-5087-b640-b756c249bc40",
      "bf2abe42-07bb-5c35-9118-d6141076c299",
      "7e26c129-91f7-52de-8114-2361411c80f8",
      "848fcbe0-dc25-53eb-a1a8-38313b65cf6d",
      "498f082d-742c-5f21-9d09-16feeb4276a6",
      "668c01c7-0887-5a54-84ff-648facd8e962",
      "8f9dc189-e875-56dd-bd97-996c8bf0cdc4",
      "f9597bb0-1b33-53df-8359-cdd43180307b",
      "4b3b0cd7-47d2-5213-b1ce-4e829ccbb6a2",
      "dc1c2eff-5e42-50f1-ab75-b180b4f58907",
      "c25a1bc9-c664-53d7-b2d8-500741da773c",
      "d773ac89-37ef-51cd-a6ee-a75a6b10c43b"
    ],
    "count": 20,
    "review": {
      "path": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-human20-final-raster-native-independent-a-20261007-v1/actual-twenty-V-first-independent-a.verdicts.json",
      "gitCommit": "6fe35a6b0fa807e5a97475b34f3715dc16a89c00",
      "sha256": "8cbc9bde0a298158e687575e00d27c7e577659f95a39a3a5b503f581d447f160"
    },
    "firstSeal": {
      "path": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-human20-final-raster-native-independent-a-20261007-v1/first-final-D-P-V20.independent-a.freeze.json",
      "sha256": "c2f43201c67b01d03c30425b028011d5679b2476512f4cc7e0806a76d402fcc4",
      "bytes": 4901
    },
    "authorSeal": {
      "path": "curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-human20-image-author-continuation-root-20261007-v2/final-human20-raster-native-author-input.freeze.json",
      "sha256": "3116f324fa096c8f8061553bb7bedb2a16187a8a96f5b98586a2a3aad12b894d",
      "bytes": 54218
    },
    "candidatePath": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-human20-current391-author-v1/candidate/canonical.current474-twenty-new-raster-author.json",
    "bookPath": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-human20-current391-author-v1/native-raster-candidate/twenty/book-model.json",
    "pdfPath": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-human20-current391-author-v1/native-raster-candidate/twenty/bundle/book.pdf",
    "wordingPath": null,
    "reviewKind": "actual20-frozen-raster-native-page-independent-A-first-verdicts",
    "reviewer": "/root/flora_fauna_independent_a",
    "reviewedAt": "2026-10-07T21:26:35.424845+00:00",
    "firstSealKind": "independent-A-human20-first-final-actual-DPV-freeze",
    "authorSealKind": "actual-final-human20-author-input-freeze",
    "actualReadCounts": {
      "fullSelectedRaster": 20,
      "chromium360": 20,
      "chromium680": 20,
      "completePhysicalNativeGoalPages": 20
    }
  },
  {
    "name": "flora19",
    "goalIds": [
      "5f39afac-897c-5ed3-95b5-89ccf66b2532",
      "bdbb1a13-f448-5536-86ab-894805e2f6be",
      "ac69483b-6a77-573d-a7c0-add32bb867e2",
      "9263ee6c-bf62-531c-bb09-78a4a51b8ed7",
      "bac3e333-d044-559e-8d8e-b8eff4af2b56",
      "19f806d2-d4e3-5ad4-98a8-1d61bdd81e3d",
      "892a1d3a-9923-5ac2-affa-f2d5c38e3c54",
      "be06115e-96e8-537e-b18a-313056e6cbe8",
      "350c8fab-5f95-5cf0-b8a9-dbc5f425b6fd",
      "7eeb9de9-9a8e-5932-8f60-183367c87d09",
      "4e12ba43-a58c-5611-8c43-3cc0c8465e33",
      "8e1300bb-14a1-5155-884a-144c88f1c04b",
      "8a56672b-b662-5bcd-9f43-8ffc4abc4f01",
      "2f462b79-4ebc-5ab5-9e72-91135c5252c7",
      "6faa6c23-00c9-5758-bd98-01825692abb2",
      "6e2dae03-9ea9-5466-b93e-13adcfb01245",
      "66967754-3934-58b3-b79e-d0f867dae070",
      "ac7f0a5a-dff6-570b-b0fd-10cb0f33be29",
      "06e91b97-e7cc-5698-a854-8a946a4bb7d0"
    ],
    "count": 20,
    "review": {
      "path": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-flora-fauna20-final-raster-native-independent-a-20261008-v1/actual-twenty-V-first-independent-a.verdicts.json",
      "gitCommit": "6fe35a6b0fa807e5a97475b34f3715dc16a89c00",
      "sha256": "593678734a15191b427a72d580e827ec93856af0492853573beaa5842e8bd32b"
    },
    "firstSeal": {
      "path": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-flora-fauna20-final-raster-native-independent-a-20261008-v1/first-final-D-P-V20.independent-a.freeze.json",
      "sha256": "ba1dd350325a2be5b6887b573b9d7f16f206e89ec421e46117763622e536607e",
      "bytes": 5084
    },
    "authorSeal": {
      "path": "curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-flora-fauna20-image-author-root-20261007-v1/final-flora-fauna20-raster-native-author-input.freeze.json",
      "sha256": "a0e466c3ecb503ee73188c39a1545fd4a91e3adc7a321081f040b7a233b1f180",
      "bytes": 62134
    },
    "candidatePath": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-flora-fauna20-final-raster-native-author-root-20261007-v1/candidate/canonical.current474-twenty-new-raster-author.json",
    "bookPath": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-flora-fauna20-final-raster-native-author-root-20261007-v1/native-raster-candidate/twenty/book-model.json",
    "pdfPath": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-flora-fauna20-final-raster-native-author-root-20261007-v1/native-raster-candidate/twenty/bundle/book.pdf",
    "wordingPath": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-flora-fauna20-final-raster-native-author-root-20261007-v1/twenty-whole-goals-forty-common-DEEN-cases.exact-v4.json",
    "reviewKind": "actual20-final-frozen-raster-native-page-independent-A-first-verdicts",
    "reviewer": "/root/flora_fauna_independent_a",
    "reviewedAt": "2026-10-07T22:22:46.889600+00:00",
    "firstSealKind": "independent-A-flora20-first-final-actual-DPV-freeze",
    "authorSealKind": "final-whole20-native-raster-author-input-first-freeze",
    "actualReadCounts": {
      "currentFullSelectedRasterReviewed": 20,
      "retainedExactlyUnchangedOwnFirstOriginalPasses": 9,
      "newActualFullOriginalViews": 11,
      "chromium360": 20,
      "chromium680": 20,
      "completePhysicalNativeGoalPages": 20
    }
  },
  {
    "name": "he17",
    "goalIds": [
      "1d8d64b6-b2d8-526a-8e24-23e8b6e9eb30",
      "9ac89f04-4483-5aac-8636-65c9d967048a",
      "33262175-0139-5d8a-a3f2-641191459f71",
      "eee09949-587f-51d2-8f51-aa6c40c71bbf",
      "967b666d-aed4-50d8-be73-70269cb306db",
      "480146f6-4749-52e3-a5e5-d08629e0c38f",
      "3e913f00-c3d7-5bbe-a73e-36bdc0d4a6e8",
      "ba9b6ed1-553c-5096-abf7-1e2cba8cfcfd",
      "dcc9d2e5-16f4-5813-ab66-7095c8a165a6",
      "ba96880f-d31e-54c2-8139-4a748fc9541a",
      "249f4c5d-fd23-57c7-ac62-773d62c33b49",
      "4b7fdc2c-9dbe-5439-8d84-295abc240eec",
      "f7fd8d03-aea2-530a-a384-0f63d270f5f6",
      "1d2b1038-dcd5-529a-b085-9e14f1d58c76",
      "b8fc739d-f5de-5f83-92fe-28dc6597add5",
      "8be0001b-4fe0-5ea1-9d61-b3c4bbb16660",
      "74740709-fc77-5a54-88a6-bb14c3777941"
    ],
    "count": 18,
    "review": {
      "path": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-eighteen-final-raster-native-independent-a-20261008-v1/actual-eighteen-V-first-independent-a.verdicts.json",
      "gitCommit": "6fe35a6b0fa807e5a97475b34f3715dc16a89c00",
      "sha256": "6e578a56bbd386c7bdcc09438923683a14d04c7df0e49ef5cf00a9cbb79eaab4"
    },
    "firstSeal": {
      "path": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-eighteen-final-raster-native-independent-a-20261008-v1/first-final-D-P-V18.independent-a.exact.freeze.json",
      "sha256": "31e52c7384001c710a5b8e9df05a07f1c209b66164378cdea2b0f0937f9da1dc",
      "bytes": 6393
    },
    "authorSeal": {
      "path": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-eighteen-final-raster-native-author-root-20261008-v1/eighteen-whole-current-raster-native-author-input.first.freeze.json",
      "sha256": "e25e9ce6317ed23bcad124f530d5e8851a8c642cd947671c10df231f425a061f",
      "bytes": 74934
    },
    "candidatePath": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-eighteen-final-raster-native-author-root-20261008-v1/candidate/canonical.current474-eighteen-new-raster-author.json",
    "bookPath": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-eighteen-final-raster-native-author-root-20261008-v1/native-raster-candidate/eighteen/book-model.json",
    "pdfPath": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-eighteen-final-raster-native-author-root-20261008-v1/native-raster-candidate/eighteen/bundle/book.pdf",
    "wordingPath": "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-eighteen-final-raster-native-independent-a-20261008-v1/pending/exact-eighteen-whole-goals-profiles-and-forty-conditional-DEEN-cases.input.json",
    "reviewKind": "actual eighteen whole-raster native-page independent-A first verdicts",
    "reviewer": "/root/chemistry_open_packets",
    "reviewedAt": "2026-10-07T23:41:40.153993+00:00",
    "firstSealKind": "independent A HE18 first actual final science raster-native freeze",
    "authorSealKind": "eighteen-whole-current-raster-native-author-input-first-freeze",
    "actualReadCounts": {
      "completeOriginalPNGs": 18,
      "chromium360": 18,
      "chromium680": 18,
      "completeNativeGoalPages": 18
    }
  }
] as const

const insist: (value: unknown, message: string) => asserts value = (value, message) => { if (!value) throw new Error('Bio56 ' + message) }
const object = (value: unknown): Record<string, unknown> => { insist(!!value && typeof value === 'object' && !Array.isArray(value), 'original object missing'); return value as Record<string, unknown> }
const rows = (value: unknown): Record<string, unknown>[] => { insist(Array.isArray(value), 'original array missing'); return value.map(object) }
const supplied = (value: unknown): string => { insist(typeof value === 'string' && value.trim(), 'original supplied text missing'); return value }
const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']'
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical((value as Record<string, unknown>)[key])).join(',') + '}'
  return JSON.stringify(value)
}
const same = (a: unknown, b: unknown) => canonical(a) === canonical(b)
const one = (values: unknown, goalId: string) => {
  const found = rows(values).filter(row => row.goalId === goalId || row.id === goalId)
  insist(found.length === 1, 'missing/duplicate original goal record'); return found[0]
}
const pngSize = (raw: Buffer): [number, number] => {
  insist(raw.length >= 24 && raw.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    && raw.subarray(12, 16).toString() === 'IHDR', 'bound inspection is not PNG')
  const width = raw.readUInt32BE(16), height = raw.readUInt32BE(20)
  insist(width > 0 && height > 0, 'invalid PNG dimensions'); return [width, height]
}
const floraFirst = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-flora-fauna20-first-ten-raster-independent-a-20261007-v1/'
const floraFinal = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-flora-fauna20-final-raster-native-independent-a-20261008-v1/'
const floraRetained = ['bdbb1a13-f448-5536-86ab-894805e2f6be', 'ac69483b-6a77-573d-a7c0-add32bb867e2', '9263ee6c-bf62-531c-bb09-78a4a51b8ed7',
  'bac3e333-d044-559e-8d8e-b8eff4af2b56', '19f806d2-d4e3-5ad4-98a8-1d61bdd81e3d', '892a1d3a-9923-5ac2-affa-f2d5c38e3c54',
  'be06115e-96e8-537e-b18a-313056e6cbe8', '350c8fab-5f95-5cf0-b8a9-dbc5f425b6fd', '7eeb9de9-9a8e-5932-8f60-183367c87d09']

/** Exactly three authenticated historical batch envelopes. No caller-selected format or field paths. */
export function readBiology56Context(receipt: VisualizationContextQualification, review: Record<string, unknown>, firstSeal: Record<string, unknown>,
  current: VisualizationCurrentContext, assetRaw: Buffer,
  artifact: (binding: VisualizationReviewArtifact, currentCopyRequired?: boolean) => Buffer,
  readCurrentSource: () => Buffer, parse: (raw: Buffer) => unknown) {
  const goalId = receipt.context.goalId
  const family = FAMILIES.find(f => (f.goalIds as readonly string[]).includes(goalId))
  insist(family && receipt.reviewProfile === BIOLOGY56_PROFILE, 'goal is outside the fixed Human20/Flora19/HE17 set')
  const fixed = (value: { path: string; sha256: string }): VisualizationReviewArtifact => ({ path: value.path, sha256: value.sha256, gitCommit: COMMIT })
  insist(same(receipt.originalReview, fixed(family.review)) && same(receipt.originalInput, fixed(family.firstSeal))
    && same(receipt.ownerSource, { path: SOURCE, sha256: SOURCE_SHA256, gitCommit: COMMIT })
    && receipt.reviewedAsset.gitCommit === COMMIT && receipt.context.landscapeId === OWNER && receipt.context.subject === 'biologie',
  'fixed family/input/owner binding differs')
  const bytes = (value: unknown): Buffer => {
    const binding = object(value), raw = artifact(fixed({ path: supplied(binding.path), sha256: supplied(binding.sha256) }))
    insist(binding.bytes === undefined || binding.bytes === raw.length, 'original byte length differs'); return raw
  }
  const read = (value: unknown) => object(parse(bytes(value)))
  const inFiles = (files: unknown, path: string) => {
    const found = rows(files).filter(row => row.path === path)
    insist(found.length === 1, 'missing/duplicate sealed input: ' + path); return found[0]
  }
  insist(firstSeal.schemaVersion === 1 && firstSeal.artifactKind === family.firstSealKind
    && firstSeal.humanApproval === false && firstSeal.humanTrial === false
    && firstSeal[family.name === 'he17' ? 'peerFinalBReadBeforeSeal' : 'peerReviewReadBeforeSeal'] === false,
  'first seal is not the exact independent nonhuman envelope')
  insist(inFiles(firstSeal.frozenFiles, family.review.path).sha256 === receipt.originalReview.sha256,
    'first seal does not bind this original V batch')
  const authorRef = object(family.name === 'he17' ? firstSeal.authorInput : firstSeal.exactAuthorInputSeal)
  insist(same(authorRef, family.authorSeal), 'first-to-author seal link differs')
  const author = read(authorRef), authorFiles = family.name === 'flora19' ? author.files : author.frozenFiles
  insist(author.artifactKind === family.authorSealKind && author.humanApproval === false, 'wrong author envelope')
  const candidate = read(inFiles(authorFiles, family.candidatePath)), goal = one(candidate.goals, goalId)
  const actualSource = object(parse(readCurrentSource())), actualGoal = one(actualSource.goals, goalId)
  insist(candidate.landscapeId === OWNER && actualSource.landscapeId === OWNER && same(goal, actualGoal), 'whole current goal differs from the final sealed candidate')
  insist(review.schemaVersion === 1 && review.artifactKind === family.reviewKind && review.actualAgent === family.reviewer
    && review.recordedAt === family.reviewedAt && review.keep === family.count && review.hold === 0 && review.reject === 0
    && rows(review.findings).length === 0 && rows(review.records).length === family.count
    && new Set(rows(review.records).map(row => row.goalId)).size === family.count
    && same(review.actualReadCounts, family.actualReadCounts) && review.humanApproval === false && review.humanTrial === false
    && review[family.name === 'he17' ? 'peerFinalBReadBeforeSeal' : 'peerReviewReadBeforeThisFirstSeal'] === false,
  'original V decision/attribution/actual sight counts differ')
  const record = one(review.records, goalId)
  insist(record.machineCandidateDecision === 'KEEP' && record.scientificAndVisualVerdict === 'PASS'
    && record.imageAndAltCorrespond === true && record.humanApproval === false && record.deviceAcceptanceClaim === false
    && supplied(record.nativePageObservation) && supplied(record.substantiveActualObservationsDe), 'original selected V record is not positive actual evidence')
  const originalAsset = object(record.actualObservedFullRaster)
  insist(same(fixed({ path: supplied(originalAsset.path), sha256: supplied(originalAsset.sha256) }), receipt.reviewedAsset)
    && assetRaw.length === originalAsset.bytes, 'actually viewed original asset differs')
  pngSize(assetRaw)
  const sealAsset = inFiles(authorFiles, receipt.reviewedAsset.path)
  insist(sealAsset.sha256 === receipt.reviewedAsset.sha256 && sealAsset.bytes === assetRaw.length, 'author seal asset binding differs')
  for (const width of [360, 680]) {
    const captures = rows(record.actualObservedChromiumCaptures)
    insist(captures.length === 2, 'two actual Chromium captures required')
    const matching = captures.filter(capture => String(capture.path).endsWith('/actual-selected-' + width + 'px.png'))
    insist(matching.length === 1 && same(inFiles(authorFiles, supplied(matching[0].path)), matching[0]), 'original viewport is not sealed')
    insist(pngSize(bytes(matching[0]))[0] === width, 'actual historical Chromium width differs')
  }
  const model = read(inFiles(authorFiles, family.bookPath)), page = one(model.pages, goalId)
  const nativePage = object(record.actualObservedNativePdfPage)
  const pageCapture = family.name === 'he17' ? { path: nativePage.path, sha256: nativePage.sha256 } : object(nativePage.capture)
  const sealedPage = inFiles(authorFiles, supplied(pageCapture.path))
  insist(sealedPage.sha256 === pageCapture.sha256 && (pageCapture.bytes === undefined || sealedPage.bytes === pageCapture.bytes), 'native page capture is not author-sealed')
  pngSize(bytes(sealedPage))
  const pdfRef = inFiles(authorFiles, family.pdfPath)
  if (family.name !== 'he17') insist(same(nativePage.actualPdf, pdfRef) && nativePage.goalId === goalId, 'original PDF/goal binding differs')
  insist(bytes(pdfRef).subarray(0, 5).toString() === '%PDF-', 'bound original PDF is missing')
  const links = rows(goal.resourceLinks).filter(link => link.type === 'goal-visualization' && link.role === 'primary')
  insist(links.length === 1 && links[0].skillpilotId === goalId, 'original primary resource is ambiguous')
  const visualization = object(page.visualization)
  insist(object(model.book).landscapeId === OWNER && page.title === goal.title && page.description === goal.description
    && visualization.originalDigest === 'sha256:' + receipt.reviewedAsset.sha256 && visualization.altText === links[0].altText
    && nativePage.physicalPage === Number(page.pageNumber) + 2, 'BookModel/text/image/physical page binding differs')
  if (family.name !== 'human20') {
    const wordingRef = inFiles(family.name === 'he17' ? firstSeal.frozenFiles : authorFiles, family.wordingPath)
    const wording = read(wordingRef)
    const originalGoal = family.name === 'flora19' ? object(one(wording.goals, goalId).wholeGoal)
      : object(rows(wording.records).filter(row => object(row.goal).id === goalId).map(row => row.goal)[0])
    const bodyWithoutResource = (value: Record<string, unknown>) => Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'resourceLinks'))
    insist(same(bodyWithoutResource(originalGoal), bodyWithoutResource(goal)), 'original whole DE/EN/scope wording differs')
  }
  if (family.name === 'flora19') {
    const resolution = read(inFiles(firstSeal.frozenFiles, floraFinal + 'ordinal1-first-image-HOLD-targeted-resolution.independent-a.actual.json'))
    const oldFirst = read(resolution.originalFirstSeal), portable = read(resolution.originalPortableFollowupSeal)
    const priorRef = inFiles(portable.frozenOutputs, floraFirst + 'first-ten-original-raster.independent-a.verdicts.json')
    insist(same(inFiles(oldFirst.frozenOutputs, supplied(priorRef.path)), priorRef)
      && oldFirst.mobileNativeFinalApproval === false && portable.finalMobileNativeApproval === false
      && same(portable.firstScienceVerdictsUnchanged, { KEEP: 9, HOLD: 1 }), 'earlier open mobile/native boundary was relabeled')
    const prior = read(priorRef)
    insist(prior.recordedAt === '2026-10-07T21:47:05.935778+00:00' && prior.reviewer === family.reviewer
      && object(prior.summary).finalMobileNativeApprovals === 0 && rows(prior.reviews).length === 10, 'earlier actual raster review attribution/time differs')
    const held = one(prior.reviews, '5f39afac-897c-5ed3-95b5-89ccf66b2532')
    insist(held.decisionForOriginalRasterOnly === 'HOLD' && resolution.historicalHoldUnchanged === true
      && resolution.humanApproval === false, 'original V1 HOLD was not preserved')
    pngSize(bytes(held.actualOriginalImage))
    if (floraRetained.includes(goalId)) {
      const old = one(prior.reviews, goalId)
      insist(old.decisionForOriginalRasterOnly === 'KEEP' && same(old.actualOriginalImage, originalAsset)
        && old.actual360Review === 'pending final neutral input' && old.actual680Review === 'pending final neutral input'
        && old.actualNativePageReview === 'pending final neutral input' && old.finalMachineVisualizationApproval === false
        && record.fullRasterReviewBasis === 'retained exact own previous first original PASS', 'retained raster and later native decision were conflated')
    } else insist(record.fullRasterReviewBasis === 'actual full selected original viewed in this final review', 'later actual raster inspection missing')
    if (goalId === '5f39afac-897c-5ed3-95b5-89ccf66b2532') insist(same(resolution.actualInspectedInputs, record)
      && supplied(object(held.actualOriginalImage).sha256) !== receipt.reviewedAsset.sha256, 'actual V2 resolution does not preserve distinct V1 bytes')
  }
  const tags = object(goal.dimensionTags)
  insist(!('level' in current) || (current as unknown as Record<string, unknown>).level === goal.level, 'current source level differs')
  const native: VisualizationReviewedContext = { landscapeId: OWNER, goalId, subject: 'biologie', title: supplied(goal.title), description: supplied(goal.description),
    titleEn: supplied(goal.titleEn), descriptionEn: supplied(goal.descriptionEn), demandLevel: supplied(tags.demandLevel), assetSha256: 'sha256:' + receipt.reviewedAsset.sha256 }
  return { native, decision: record.machineCandidateDecision, reviewedAt: review.recordedAt, reviewer: review.actualAgent,
    reason: record.substantiveActualObservationsDe, assetPath: originalAsset.path }
}

export const biology56CurrentSourceBinding = Object.freeze({ path: SOURCE, sha256: SOURCE_SHA256 })

