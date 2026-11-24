// SPDX-License-Identifier: Apache-2.0
// Refresh only MP's unchanged practice-assessment classification after the exact dual-reviewed correction.
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel'
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-11-24/e1-current-nine-v1/'
const receiptPath=base+'mp-semantic-kind-refresh.actual.json'
if(existsSync(receiptPath))throw new Error('Immutable receipt already exists')
const assessment='curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/'
const activation=JSON.parse(readFileSync(assessment+'mp-current/activation.actual.json','utf8'))
const canonicalPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const canonical=readFileSync(canonicalPath)
const goal=JSON.parse(canonical.toString()).goals.find((g:any)=>g.id===activation.goalId)
const approved=JSON.parse(readFileSync(activation.currentGoalPath,'utf8'))
if(JSON.stringify(goal)!==JSON.stringify(approved))throw new Error('Current MP differs from exact approved checkpoint')
const hash=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
for(const r of activation.independentReviews){if(hash(readFileSync(r.path))!=='sha256:'+r.sha256)throw new Error('Review hash mismatch')}
const path='curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const before=readFileSync(path), ledger=JSON.parse(before.toString())
const row=ledger.decisions.find((r:any)=>r.goalId===goal.id)
if(row.semanticKind!=='practiceAssessment')throw new Error('Unexpected semantic-kind change')
const prior=JSON.parse(JSON.stringify(row));row.sourceFingerprint=fingerprintSemanticKindSourceGoal(goal)
const after=JSON.stringify(ledger,null,2)+'\n'
if(!process.argv.includes('--write'))throw new Error('Use --write')
writeFileSync(path,after)
if(!canonical.equals(readFileSync(canonicalPath)))throw new Error('Canonical changed')
writeFileSync(receiptPath,JSON.stringify({schemaVersion:1,contract:'exact-dual-reviewed-assessment-kind-refresh-v1',goalId:goal.id,semanticKind:'practiceAssessment',priorDecision:prior,currentDecision:row,beforeLedgerSha256:hash(before),afterLedgerSha256:hash(after),canonicalSha256Unchanged:hash(canonical),activationPath:assessment+'mp-current/activation.actual.json',activationSha256:hash(readFileSync(assessment+'mp-current/activation.actual.json')),independentReviews:activation.independentReviews,canonicalEdits:0,placementEdits:0,coverageGate:'CQR203 remains open; unchanged practiceAssessment classification grants no curricular credit.'},null,2)+'\n')
console.log('Refreshed MP semantic-kind binding only; no canonical or placement edits.')
