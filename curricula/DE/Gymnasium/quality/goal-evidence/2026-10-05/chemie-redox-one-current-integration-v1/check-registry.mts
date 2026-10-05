// Apache-2.0. Closed registry schema and native exact P/D binding checks.
import {loadDeepUnderstandingRolloutConfig,validateStandaloneResolutionIndexSchema} from '../../../../../../../app/scripts/reportDeepUnderstandingRollout'
import {reviewPositiveGoalEvidenceConfig} from '../../../../../../../app/scripts/positiveGoalEvidenceReview'
import {readFileSync} from 'node:fs'
const c = loadDeepUnderstandingRolloutConfig(process.argv[2])
const s = c.subjects.find(s => s.subject === 'chemie')!
const dp = s.resolutionIndexPaths.at(-1)!
const pe = reviewPositiveGoalEvidenceConfig(s.positiveEvidenceConfigPaths.at(-1)!)
const errs = validateStandaloneResolutionIndexSchema(JSON.parse(readFileSync('../' + dp, 'utf8')))
if (pe.errors.length || errs.length || pe.records.length !== 1 || pe.counts.needsHumanReview !== 1) {
  throw new Error(JSON.stringify({positive: pe.errors, counts: pe.counts, descriptionSchema: errs}))
}
console.log(JSON.stringify({subjects: c.subjects.length, positiveProfiles: pe.records.length,
  descriptionSchema: 'pass', positiveErrors: 0, counts: pe.counts}))
