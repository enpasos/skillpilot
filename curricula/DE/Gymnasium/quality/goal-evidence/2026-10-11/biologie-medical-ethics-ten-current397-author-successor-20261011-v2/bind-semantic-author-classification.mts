// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import {pathToFileURL} from 'node:url'
const R=process.cwd(),P='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-medical-ethics-ten-current397-author-successor-20261011-v2'
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(path.join(R,'app/scripts/goalBookModel.ts')).href)
const read=(f:string)=>JSON.parse(fs.readFileSync(path.join(R,P,f),'utf8'))
const put=(f:string,x:any)=>{fs.mkdirSync(path.dirname(path.join(R,P,f)),{recursive:true});fs.writeFileSync(path.join(R,P,f),JSON.stringify(x,null,2)+'\n')}
const ledger=read('candidate/kinds484-current397.exact.json'),land=read('candidate/whole484-current397-medical10.author.inactive.json')
const by=new Map(land.goals.map((g:any)=>[g.id,g])),changed=[]
for(const d of ledger.decisions){const fp=fingerprintSemanticKindSourceGoal(by.get(d.goalId));if(fp!==d.sourceFingerprint){changed.push({goalId:d.goalId,oldFingerprint:d.sourceFingerprint,currentFingerprint:fp,previousDecisionBasis:d.decisionBasis});d.sourceFingerprint=fp;d.decisionBasis='reviewed-current-semantic-recheck-curricular-atomic'}}
assert.deepEqual(changed.map(x=>x.goalId),['7f76ff0b-218b-568d-91df-20bbe2b156e2','e36bebef-d7e3-57d0-bf01-236799d41cb7'])
ledger.sourceLandscapePath=P+'/candidate/whole484-current397-medical10.author.inactive.json'
put('candidate/kinds484-current397.author-classification-only.json',ledger)
put('checks/semantic-classification-author-binding-change.actual.json',{role:'Author classification, not independent atomicity approval',changes:changed,reason:'The clarified cancer description retains one causal explanatory competency from altered growth regulation to tissue expansion and additional dissemination steps. The corrected diagnostics title names its unchanged operative method-explanation competency accurately. Neither creates a separate assessment or recall target. Native authority marks classification for the inactive model only; two independent scientific reviews remain pending.',newIndependentAtomicityApproval:false,activeWrites:false})
for(const f of ['native/whole397-medical10.normal.config.json','sources/normal397-medical10.author.inputs.json','positive/P10-medical.author-pending.config.json']){const x=read(f);x.semanticKindLedgerPath=P+'/candidate/kinds484-current397.author-classification-only.json';put(f,x)}
