// SPDX-License-Identifier: Apache-2.0
// Only technical comparison after this reviewer's immutable scientific FIRST.
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fingerprintGoalDescriptionReviewContext, fingerprintGoalDescriptionReviewPage } from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/'
const n = base + 'biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1/'
const o = base + 'biologie-evolution-current17-and-protected-contexts-native-independent-b-v1/'
const read = (path: string): any => JSON.parse(readFileSync(path, 'utf8'))
const before = read(n + 'native/full394.current-before.actual-loader.book-model.json')
const after = read(n + 'native/full394.eighteen-raster-source7-candidate.book-model.json')
const bLandscape = read(before.source.landscapePath)
const aLandscape = read(n + 'candidate/canonical.current479.eighteen-reviewed-raster.inactive.json')
const digest = (path: string) => 'sha256:' + createHash('sha256').update(stableGoalBookJson(read(path))).digest('hex')
if (digest(before.source.landscapePath) !== before.source.landscapeDigest) throw new Error('Before canonical snapshot changed; comparison would not be current.')
const protectedInput = read(n + 'native-subsets/protected-source-contexts/round-b/description-review-input.json')
const bp = new Map(before.pages.map((x: any) => [x.goalId, x]))
const ap = new Map(after.pages.map((x: any) => [x.goalId, x]))
const bg = new Map(bLandscape.goals.map((x: any) => [x.id, x]))
const ag = new Map(aLandscape.goals.map((x: any) => [x.id, x]))
const rows = protectedInput.goals.map((template: any) => {
  const make = (page: any, goal: any) => {
    // Use the complete native review page shape, retaining global ordering.
    const p = Object.fromEntries(Object.keys(template.reviewContext.page).filter(k => k !== 'pageFingerprint').map(k => [k, page[k]]))
    const pageFingerprint = fingerprintGoalDescriptionReviewPage(p as any)
    p.pageFingerprint = pageFingerprint
    const input = { ...template, goalFingerprint: page.goalFingerprint, pageFingerprint,
      currentTitleDe: goal.title, currentTitleEn: goal.titleEn,
      currentDescriptionDe: goal.description, currentDescriptionEn: goal.descriptionEn,
      canonicalContext: buildGoalDescriptionCanonicalContext(goal),
      reviewContext: {page: p, evidenceProfile: template.reviewContext.evidenceProfile} }
    return { input, pageFingerprint, goalReviewContextFingerprint: fingerprintGoalDescriptionReviewContext(input as any) }
  }
  const b = make(bp.get(template.goalId), bg.get(template.goalId))
  const a = make(ap.get(template.goalId), ag.get(template.goalId))
  const unchanged = b.pageFingerprint === a.pageFingerprint && b.goalReviewContextFingerprint === a.goalReviewContextFingerprint
  return { goalId: template.goalId, before: b, after: a, pageUnchanged: b.pageFingerprint === a.pageFingerprint,
    goalReviewContextUnchanged: b.goalReviewContextFingerprint === a.goalReviewContextFingerprint,
    disposition: unchanged ? 'PRESERVE_EXISTING_VALID_D_P_NO_HISTORICAL_REVIEW_RESTART' : 'TARGETED_NATIVE_PAGE_CONTEXT_REBIND_CANDIDATE_ONLY',
    newScientificStrictClosure: false, restoredStrictBinding: false }
})
const changed = rows.filter((r: any) => !r.pageUnchanged || !r.goalReviewContextUnchanged)
if (changed.length !== 1 || changed[0].goalId !== '2ae2da43-73d5-578f-84f4-be0585a7d8f9') throw new Error('Unexpected protected native context changes: ' + JSON.stringify(changed.map((r: any)=>r.goalId)))
writeFileSync(o + 'protected15.normal-page-and-whole-native-context-fingerprints.exact.json', JSON.stringify({schemaVersion:1, license:'CC-BY-4.0', technicalComparisonAfterScientificFIRST:true, ordinaryFunctions:['fingerprintGoalDescriptionReviewPage','fingerprintGoalDescriptionReviewContext','buildGoalDescriptionCanonicalContext'], beforeCanonicalDigestVerified:true, pageUniverse:394, unchangedProtectedContexts:14, changedProtectedContexts:1, rows, strictGain:0, humanApproval:false}, null, 2) + '\n')
console.log('PASS ordinary complete native fingerprint comparison: 14 unchanged / 1 actual page-context change; strict gain 0')
