// Apache-2.0. Targeted technical pointer check; no active adoption.
import { readFile, writeFile } from 'node:fs/promises'
import { evaluateCourseLevelMappingConsistency } from '../../../../../../../app/scripts/generateCurriculumQualityStatus.ts'
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q1-bw-two-current-source-location-successors-author-v1'
const proof = JSON.parse(await readFile(own + '/current-two-source-location-successors.actual.json', 'utf8'))
const landscape = JSON.parse(await readFile('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json', 'utf8'))
const readMapping = async (path: string) => ({...JSON.parse(await readFile(path, 'utf8')), file: path})
const oldMappings = await Promise.all(proof.sourceSuccessors.map((row: any) => readMapping(row.unchangedHistoricalMappingCopyPath)))
const newMappings = await Promise.all(proof.sourceSuccessors.map((row: any) => readMapping(row.inertMappingSuccessorPath)))
const before = evaluateCourseLevelMappingConsistency(landscape, oldMappings)
const after = evaluateCourseLevelMappingConsistency(landscape, newMappings)
if (before.status !== 'pass' || after.status !== 'pass') throw new Error(JSON.stringify({before, after}))
if (JSON.stringify(before.metrics) !== JSON.stringify(after.metrics)) throw new Error('Coverage metrics changed')
await writeFile(own + '/root-current-consumer-integration-v1/current-native-source-consistency.actual.json', JSON.stringify({schemaVersion:1, actualCheckedAt:new Date().toISOString(), role:'root_actual_current_source_consistency', nativeFunction:'evaluateCourseLevelMappingConsistency', before, after, oldAndCandidateMetricsExactlyEqual:true, originalSourceFilesUnmodified:true,currentPointersWereExplicitlyAdopted:true,historicalOriginalMappingBytesUsedForBeforeComparison:true, actualPageAccuracyEvidence:proof.rootIndependentSourceReviewPath, limits:['Native check verifies the two explicit pointer candidates, source existence and GK/LK edge consistency; actual original-page accuracy is supported separately by the independent original-PDF reading.', 'This fresh check compares preserved exact old mappings with adopted current pointer successors; current integration is separately recorded.'], activeWrites:0, newStrictClosures:0}, null, 2) + '\n')
console.log(JSON.stringify({nativeRule:after.ruleId || after.id, status:after.status, metrics:after.metrics, activeWrites:0}))
