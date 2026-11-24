// SPDX-License-Identifier: Apache-2.0
// The unanimously requested condition does not alter the existing ordinary-goal kind.
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../../app/scripts/goalBookModel'
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-11-24/e1-current-nine-v1/fall-matching-initial-conditions/'
if(existsSync(base+'kind-binding.actual.json'))throw new Error('Immutable receipt exists')
const goal=JSON.parse(readFileSync(base+'current.goal.json','utf8')),canonical=JSON.parse(readFileSync('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json','utf8')).goals.find((g:any)=>g.id===goal.id)
// Asset metadata may be revalidated by its owner; core fields must equal the exact condition insertion.
for(const key of ['id','title','titleEn','description','descriptionEn','requires'])if(JSON.stringify(goal[key])!==JSON.stringify(canonical[key]))throw new Error('Unexpected core delta')
const path='curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',before=readFileSync(path),ledger=JSON.parse(before.toString()),row=ledger.decisions.find((r:any)=>r.goalId===goal.id)
if(row.semanticKind!=='curricularAtomic')throw new Error('Unexpected kind')
const prior=JSON.parse(JSON.stringify(row));row.sourceFingerprint=fingerprintSemanticKindSourceGoal(canonical)
const after=JSON.stringify(ledger,null,2)+'\n',hash=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
writeFileSync(path,after);writeFileSync(base+'kind-binding.actual.json',JSON.stringify({schemaVersion:1,contract:'dual-supported-local-clarification-kind-binding-v1',goalId:goal.id,priorDecision:prior,currentDecision:row,kindTransition:0,beforeLedgerSha256:hash(before),afterLedgerSha256:hash(after),basis:'Both actual current D rounds request matching initial conditions. This only clarifies the existing comparison competence; it does not turn an ordinary goal into an assessment or navigation node. Prior dual atomicity/kind opinions remain historical; fresh exact-current D/P rounds also explicitly recheck FALL atomicity and kind before final activation.',canonicalDeltaReceipt:base+'canonical-delta.actual.json',canonicalEditsByThisBinding:0},null,2)+'\n')
console.log('Bound unchanged FALL curricularAtomic kind to the dual-supported clarification; fresh final exact-current classification review pending.')
