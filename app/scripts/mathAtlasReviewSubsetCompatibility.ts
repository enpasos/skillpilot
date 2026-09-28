import { createHash } from 'node:crypto'
import { stableGoalBookJson, type GoalBookPage } from './goalBookModel'
import { fingerprintGoalDescriptionReviewPage } from './validateGoalDescriptionDualRoundResolution'

/** Diagnostic only. A successful comparison does not transfer a D decision. */
export interface MathAtlasSubsetNarrowingProof {
  exactScopeNarrowing: boolean
  oldPageFingerprintValid: boolean
  proposedPageFingerprintValid: boolean
  nonScopeChangedFields: string[]
  removedScopes: string[]
  addedScopes: string[]
  duplicateScopeKeys: string[]
  applicabilityOrderPreserved: boolean
  oldPageDigest: string
  proposedPageDigest: string
}

const digest = (value: unknown): string => `sha256:${createHash('sha256')
  .update(stableGoalBookJson(value)).digest('hex')}`

const scopeKeys = (page: GoalBookPage): string[] => (page.applicability ?? [])
  .flatMap(({ jurisdiction, scopes }) => scopes.map((scope) => (
    [jurisdiction, scope.stage, scope.durationModel ?? '', scope.courseProfile ?? ''].join('|')
  )))

const isSecondaryGeneralCourse = (key: string): boolean => (
  /\|SekII\|(G8|G9|)\|GK$/u.test(key)
)

export const proveMathAtlasReviewSubsetNarrowing = (
  oldPage: GoalBookPage,
  proposedPage: GoalBookPage,
): MathAtlasSubsetNarrowingProof => {
  const oldOther = Object.fromEntries(Object.entries(oldPage).filter(([field]) => (
    field !== 'applicability' && field !== 'pageFingerprint'
  )))
  const proposedOther = Object.fromEntries(Object.entries(proposedPage).filter(([field]) => (
    field !== 'applicability' && field !== 'pageFingerprint'
  )))
  const nonScopeChangedFields = [...new Set([
    ...Object.keys(oldOther), ...Object.keys(proposedOther),
  ])].filter((field) => (
    stableGoalBookJson(oldOther[field]) !== stableGoalBookJson(proposedOther[field])
  )).sort()
  const oldKeys = scopeKeys(oldPage)
  const proposedKeys = scopeKeys(proposedPage)
  const oldSet = new Set(oldKeys)
  const proposedSet = new Set(proposedKeys)
  const duplicateScopeKeys = [...new Set([
    ...oldKeys.filter((key, index) => oldKeys.indexOf(key) !== index),
    ...proposedKeys.filter((key, index) => proposedKeys.indexOf(key) !== index),
  ])].sort()
  const removedScopes = oldKeys.filter((key) => !proposedSet.has(key)).sort()
  const addedScopes = proposedKeys.filter((key) => !oldSet.has(key)).sort()
  const expectedApplicability = (oldPage.applicability ?? [])
    .map(({ jurisdiction, scopes }) => ({
      jurisdiction,
      scopes: scopes.filter((scope) => !removedScopes.includes([
        jurisdiction, scope.stage, scope.durationModel ?? '', scope.courseProfile ?? '',
      ].join('|'))),
    }))
    .filter(({ scopes }) => scopes.length > 0)
  const applicabilityOrderPreserved = stableGoalBookJson(expectedApplicability)
    === stableGoalBookJson(proposedPage.applicability ?? [])
  const oldPageFingerprintValid = fingerprintGoalDescriptionReviewPage(oldPage)
    === oldPage.pageFingerprint
  const proposedPageFingerprintValid = fingerprintGoalDescriptionReviewPage(proposedPage)
    === proposedPage.pageFingerprint
  return {
    exactScopeNarrowing: oldPageFingerprintValid
      && proposedPageFingerprintValid
      && oldPage.pageFingerprint !== proposedPage.pageFingerprint
      && nonScopeChangedFields.length === 0
      && duplicateScopeKeys.length === 0
      && removedScopes.length > 0
      && addedScopes.length === 0
      && removedScopes.every(isSecondaryGeneralCourse)
      && applicabilityOrderPreserved,
    oldPageFingerprintValid,
    proposedPageFingerprintValid,
    nonScopeChangedFields,
    removedScopes,
    addedScopes,
    duplicateScopeKeys,
    applicabilityOrderPreserved,
    oldPageDigest: digest(oldPage),
    proposedPageDigest: digest(proposedPage),
  }
}
