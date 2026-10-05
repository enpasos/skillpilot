// Apache-2.0. Compare actual native models; unchanged evidence is not re-reviewed.
import {loadGoalBookBuildInputs} from '../../../../../../../app/scripts/goalBookModel'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
const own=dirname(fileURLToPath(import.meta.url))
const root=resolve(own,'../../../../../../..')
const config='app/scripts/config/goal-books/de-gym-biology-national-atlas.json'
const [before,after]=await Promise.all([
  loadGoalBookBuildInputs(config,root),
  loadGoalBookBuildInputs(config,resolve(root,'tmp/biologie-q1-gel-native-isolated-20261005-v1')),
])
const baseline=JSON.parse(readFileSync(resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-redox-one-current-integration-v1/central-one-new-complete.report.json'),'utf8')).subjects.find(s=>s.subject==='biologie')
const oldMap=new Map(before.model.pages.map(p=>[p.goalId,p]))
const changed=after.model.pages.filter(p=>JSON.stringify(p)!==JSON.stringify(oldMap.get(p.goalId))).map(p=>({goalId:p.goalId,oldPageNumber:oldMap.get(p.goalId)?.pageNumber,newPageNumber:p.pageNumber,oldGoalFingerprint:oldMap.get(p.goalId)?.goalFingerprint,newGoalFingerprint:p.goalFingerprint,oldPageFingerprint:oldMap.get(p.goalId)?.pageFingerprint,newPageFingerprint:p.pageFingerprint}))
const affectedStrict=changed.filter(p=>baseline.strictCompleteGoalIds.includes(p.goalId))
const receipt={status:affectedStrict.length?'needs_targeted_binding_analysis':'pass_unchanged_strict_page_bindings',currentCurricularAtomic:before.model.pages.length,prospectiveCurricularAtomic:after.model.pages.length,currentStrictCount:baseline.strictComplete,changedPages:changed,affectedStrictPages:affectedStrict,unchangedStrictGoalIds:baseline.strictCompleteGoalIds.filter(id=>!affectedStrict.some(p=>p.goalId===id)),humanApprovalClaimed:false,newScientificClosures:0,restoredBindings:0}
writeFileSync(resolve(own,'current-versus-prospective-book-bindings.actual.receipt.json'),JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({status:receipt.status,denominator:receipt.prospectiveCurricularAtomic,changedPages:changed.length,affectedStrictPages:affectedStrict.length,affectedStrictGoalIds:affectedStrict.map(p=>p.goalId)}))
if(before.model.pages.length!==363||after.model.pages.length!==363)throw new Error('Current denominator unexpectedly changed')
