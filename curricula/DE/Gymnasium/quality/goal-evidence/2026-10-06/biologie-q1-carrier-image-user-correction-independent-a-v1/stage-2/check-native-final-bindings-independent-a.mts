import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { validateGoalDescriptionReviewCampaignResultDirectories } from '../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults'
import { fingerprintGoalDescriptionReviewContext, fingerprintGoalDescriptionReviewPage } from '../../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
import { parseAndValidateGoalBookModel } from '../../../../../../../../app/scripts/goalBookModel'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../../app/scripts/positiveGoalEvidenceReview'

const root = resolve('.')
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-carrier-image-user-correction-independent-a-v1/'
const stage = own + 'stage-2/'
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-carrier-projection-and-image-targeted-author-v2/'
if (existsSync(resolve(stage, 'independent-carrier-native-d-a.stage-2.freeze.json'))) throw new Error('Frozen review continuation')
const read = (path: string): any => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const bundle = read(author + 'round-a/review-bundle-manifest.json')
const input = read(author + 'round-a/description-review-input.json')
const campaign = read(author + 'round-a/description-review-campaign.json')
const result = await validateGoalDescriptionReviewCampaignResultDirectories({ bundle, input, campaign, batchesDirectory: resolve(author, 'round-a/batches'), resultsDirectory: resolve(own, 'results') })
if (result.errors.length || result.records.length !== 1 || result.records[0].decision !== 'keep') throw new Error(result.errors.join(' | ') || 'Wrong current D record scope')
const model = parseAndValidateGoalBookModel(read(author + 'bundle/book-model.json'))
if (model.pages.length !== 1 || model.pages[0].goalId !== input.goals[0].goalId) throw new Error('Wrong actual one-page native model')
const goal = input.goals[0]
const contextFingerprint = fingerprintGoalDescriptionReviewContext(goal)
const pageFingerprint = fingerprintGoalDescriptionReviewPage(goal.reviewContext.page)
if (pageFingerprint !== goal.pageFingerprint || pageFingerprint !== model.pages[0].pageFingerprint) throw new Error('Current D page or context binding differs')
const pConfig = own + 'positive.one.independent-a.candidate.config.json'
const positive = reviewPositiveGoalEvidenceConfig(pConfig)
if (positive.errors.length) throw new Error(positive.errors.join(' | '))
writeFileSync(resolve(stage, 'native-current-d-a-and-imported-one-p-bindings.validation.actual.json'), JSON.stringify({
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), goalId: goal.goalId,
  nativeCampaignResults: 'PASS1', nativeCampaignErrors: result.errors,
  nativeDOnePageModelParseAndFingerprints: 'PASS1', goalFingerprint: goal.goalFingerprint, pageFingerprint,
  goalReviewContextFingerprint: contextFingerprint, bundleFingerprint: bundle.bundleFingerprint, bookDigest: input.bookDigest,
  nativeOnePFullCheckerAfterActualPNGImport: 'PASS', nativeOnePErrors: positive.errors, nativeOnePCounts: positive.counts,
  ownEarlierV_PStageOneNotRewritten: true, otherSixProfilesAndReviewsNotRewritten: true,
  fullNativeGUISupersetGateNotClaimedByThisDReviewer: true,
  recordStatus: result.records[0].recordStatus, reviewAuthority: result.records[0].reviewAuthority,
  activeWrites: false, specialValidatorRules: false, humanApproval: false, humanTrial: false, learnerEvidence: false,
  strictNetGain: 0, newScientificCompletions: 0, restoredActiveBindingsByThisReviewer: 0,
}, null, 2) + '\n')
console.log(JSON.stringify({ nativeD: 'PASS1_KEEP', actualCurrentContextFingerprint: contextFingerprint, actualPageFingerprint: pageFingerprint, actualImportedOneP: 'PASS', errors: 0, activeWrites: false }))
