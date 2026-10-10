// SPDX-License-Identifier: Apache-2.0
// Calls normal unchanged APIs; technical preparation never grants science approval.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fingerprintSemanticKindSourceGoal,loadGoalBookBuildInputs,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
const C=process.argv[process.argv.indexOf('--capsule')+1]
const P='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-q1-eight-title-methyl-current-native-technical-author-successor-v2'
const D=resolve(C,P)
const read=(p:string)=>JSON.parse(readFileSync(resolve(D,p),'utf8'))
const put=(p:string,j:any)=>{mkdirSync(dirname(resolve(D,p)),{recursive:true});writeFileSync(resolve(D,p),JSON.stringify(j,null,2)+'\n')}
const stage=process.argv[process.argv.indexOf('--stage')+1]
const original=read('inputs/whole479-current-canonical.exact.json'),candidate=read('candidate/whole479-title-methyl-eight-links.inactive.json')
const oldGoals=new Map<string,any>(original.goals.map((g:any)=>[g.id,g])),newGoals=new Map<string,any>(candidate.goals.map((g:any)=>[g.id,g]))
const ID='3312b2bb-bc90-5c0f-a859-4b4f9b8ff117'
const sourceChanged=[...oldGoals.keys()].filter(id=>fingerprintSemanticKindSourceGoal(oldGoals.get(id))!==fingerprintSemanticKindSourceGoal(newGoals.get(id)))
assert.deepEqual(sourceChanged,[ID])
if(stage==='fingerprint'){
 const ledger=read('candidate/whole479-semantic-kinds.only3312-title.pending-targeted-AM.json')
 const oldLedger=read('inputs/whole394-current-semantic-kinds.exact.json')
 const decision=ledger.decisions.find((r:any)=>r.goalId===ID)
 decision.sourceFingerprint=fingerprintSemanticKindSourceGoal(newGoals.get(ID))
 const changed=ledger.decisions.filter((r:any)=>stableGoalBookJson(r)!==stableGoalBookJson(oldLedger.decisions.find((o:any)=>o.goalId===r.goalId))).map((r:any)=>r.goalId)
 assert.deepEqual(changed,[ID]);assert.equal(ledger.counts.curricularAtomic,394)
 put('candidate/whole479-semantic-kinds.only3312-title.pending-targeted-AM.json',ledger)
 put('checks/normal-semantic-fingerprint-only3312-title.actual.json',{schemaVersion:1,normalApi:'fingerprintSemanticKindSourceGoal',wholeSourceFingerprintChanges:sourceChanged,wholeDecisionChanges:changed,whole479Count:479,whole394CurricularAtomicCount:394,old3312Fingerprint:fingerprintSemanticKindSourceGoal(oldGoals.get(ID)),new3312Fingerprint:decision.sourceFingerprint,other478DecisionsExact:true,actualIndependentTargetedAMApproval:false,humanApproval:false,activeWrites:false})
 console.log('Normal semantic fingerprint updated only3312; other478 decisions exact; independent targeted AM remains pending.')
}else if(stage==='models'){
 const before=await loadGoalBookBuildInputs(`${P}/native/before394-current-V3.normal.config.json`,C)
 const after=await loadGoalBookBuildInputs(`${P}/native/after394-current-P.normal.config.json`,C)
 assert.equal(before.model.pages.length,394);assert.equal(after.model.pages.length,394)
 put('native/before394-current-V3.actual-model.json',before.model);put('native/after394-current-P.actual-model.json',after.model)
 const oldPages=new Map<string,any>(before.model.pages.map(p=>[p.goalId,p])),newPages=new Map<string,any>(after.model.pages.map(p=>[p.goalId,p]))
 assert.deepEqual(new Set(oldPages.keys()),new Set(newPages.keys()))
 const protectedIds=read('inputs/protected-all-five-baseline-current-and-strict-ID-sets.exact.json').subjects.find((s:any)=>s.subject==='biologie').strictCompleteGoalIds
 assert.equal(protectedIds.length,315)
 const changedPages=[...oldPages.keys()].filter(id=>stableGoalBookJson(oldPages.get(id))!==stableGoalBookJson(newPages.get(id)))
 const protectedChanged=protectedIds.filter((id:string)=>changedPages.includes(id))
 const protectedGoalChanged=protectedIds.filter((id:string)=>stableGoalBookJson(oldGoals.get(id))!==stableGoalBookJson(newGoals.get(id)))
 assert.equal(protectedGoalChanged.length,0)
 const eight=read('inputs/final-eight-author-raster-bindings.exact.json').assets.map((r:any)=>r.goalId)
 const union=[...new Set([...eight,...changedPages])]
 const safeOrder=after.model.pages.map(p=>p.goalId).filter(id=>union.includes(id))
 const diffKeys=(a:any,b:any)=>[...new Set([...Object.keys(a),...Object.keys(b)])].filter(k=>stableGoalBookJson(a[k]??null)!==stableGoalBookJson(b[k]??null))
 const pages=changedPages.map(id=>({goalId:id,title:newPages.get(id).title,previouslyStrict:protectedIds.includes(id),changedWholePageFields:diffKeys(oldPages.get(id),newPages.get(id)),beforePageFingerprint:oldPages.get(id).pageFingerprint,afterPageFingerprint:newPages.get(id).pageFingerprint,beforeGoalFingerprint:oldPages.get(id).goalFingerprint,afterGoalFingerprint:newPages.get(id).goalFingerprint,beforeReverseRequires:oldPages.get(id).reverseRequires,afterReverseRequires:newPages.get(id).reverseRequires,beforeExternalReverseRequires:oldPages.get(id).externalReverseRequires,afterExternalReverseRequires:newPages.get(id).externalReverseRequires}))
 const source=read('sources/whole16-duties113-partners41-bodies.exact.json');assert.equal(source.length,16);assert.equal(source.reduce((n:number,r:any)=>n+r.allOriginalPartnerRows.length,0),113);assert.equal(new Set(source.flatMap((r:any)=>r.wholeCurrentCanonicalPartners.map((g:any)=>g.id))).size,41)
 put('checks/current-whole394-actual-delta-union-and-protected315.json',{schemaVersion:1,normalApi:'loadGoalBookBuildInputs + fingerprintSemanticKindSourceGoal + stableGoalBookJson',beforeModelDigest:before.model.digest,afterModelDigest:after.model.digest,whole394IDsExact:true,whole479NodeIdsExact:true,sourceGoalFingerprintChanges:sourceChanged,changedWholePageIds:changedPages,protected315WholeGoalChanges:protectedGoalChanged,protected315ActualPageChanges:protectedChanged,allUnaffectedProtectedPageBodiesExact:protectedIds.filter((id:string)=>!protectedChanged.includes(id)).every((id:string)=>stableGoalBookJson(oldPages.get(id))===stableGoalBookJson(newPages.get(id))),actualNativeGoalUnion:union,normalPrerequisiteSafeNativeOrder:safeOrder,actualWholePageDeltas:pages,orientation2d451SemanticKind:read('candidate/whole479-semantic-kinds.only3312-title.pending-targeted-AM.json').decisions.find((r:any)=>r.goalId==='2d451684-6e53-565e-a987-f362da919d2c').semanticKind,orientation2d451HasPublicationPage:newPages.has('2d451684-6e53-565e-a987-f362da919d2c'),whole16Duties113PartnerEdges41PartnerBodiesRetained:true,humanApproval:false,activeWrites:false,strictGain:0})
 console.log(JSON.stringify({whole394IDsExact:true,changedPages,protected315ActualPageChanges:protectedChanged,actualNativeUnionCount:union.length,normalPrerequisiteSafeNativeOrder:safeOrder},null,2))
}else throw new Error('Use --stage fingerprint or models')
