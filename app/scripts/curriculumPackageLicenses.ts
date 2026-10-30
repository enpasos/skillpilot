export type PackageLicenseDecision = {
  licenseExpression: string | null
  provenanceClass: string
  redistributionStatus: 'allowed' | 'review-required' | 'prohibited'
}

/** Apply the existing owner grant to the three explicitly own static policy roles.
 * Open human review records remain unchanged; this does not clear third-party content.
 */
export const completionContentLicenseDecision = (
  role: string,
  decision: PackageLicenseDecision,
  grant: { contentLicenseExpression: string; scope: string },
): PackageLicenseDecision => {
  if (!['completion-profile', 'completion-scope', 'completion-rule-review'].includes(role)) return decision
  if (decision.provenanceClass !== 'skillpilot-authored' || decision.redistributionStatus === 'prohibited'
      || grant.contentLicenseExpression !== 'CC-BY-4.0' || grant.scope !== 'skillpilot-owned-contributions') {
    throw new Error('Completion content lacks the existing owner license grant or its own-material classification.')
  }
  return { licenseExpression: grant.contentLicenseExpression, provenanceClass: decision.provenanceClass, redistributionStatus: 'allowed' }
}
