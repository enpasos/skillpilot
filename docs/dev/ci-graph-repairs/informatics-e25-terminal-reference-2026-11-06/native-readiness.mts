import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
const { evaluateExamTaskReadiness } = await import(pathToFileURL(path.resolve('app/scripts/generateCurriculumQualityStatus.ts')).href)
const base = JSON.parse(execFileSync('git',['show','0f86df880a24f366d7d357160271dceeb6ce94c0:curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'],{encoding:'utf8'}))
const examData = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const sourceGoal = base.goals.find((goal:any)=>goal.id==='49ba66cf-accd-5938-a63e-f031bc786767')
const nativeResult = evaluateExamTaskReadiness([{...sourceGoal,examData}])
assert.equal(nativeResult.id,'CQR-202')
assert.equal(nativeResult.status,'fail')
assert.equal(nativeResult.details.length,1)
assert(nativeResult.details[0].endsWith('(reviewStatus=draft)'))
const result = {nativeResult,expectedBlockingReason:'reviewStatus=draft',noPlaceholderOrMissingStructureIssueObserved:true,boundary:'A draft is deliberately not hard-exam ready. This existing structural detector does not certify substantive coverage, independent application, release, CQR maturity or human acceptance.'}
fs.writeFileSync(new URL('./native-readiness-results.json',import.meta.url),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result))
