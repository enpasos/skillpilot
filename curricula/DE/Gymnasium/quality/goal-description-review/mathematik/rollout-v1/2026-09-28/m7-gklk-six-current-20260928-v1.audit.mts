import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { loadGoalBookBuildInputs } from '../../../../../../../../app/scripts/goalBookModel.ts'
const root = process.cwd()
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-28/m7-gklk-six-current-20260928-v1'
const ids = ['dc12f281-f161-572b-a973-8405ae9b2498','0b162cb0-8507-5ac2-b9d6-57f40f4d3f35','71fe4a39-38e8-5c6a-8eef-ff4783fe70c2','49f9059a-876c-5051-8146-d008b5cc691c','b431148b-526c-4bde-b04b-48d23101d0d3','9b339361-7719-573d-a913-432246c502ee']
const canonicalPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const sourcePath='curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_MATHEMATIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
const mappingPath='curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json'
const {model}=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-math-national-atlas.json',root)
const readJson=async (p:string)=>JSON.parse(await readFile(p,'utf8'))
const [canonical,source,mapping]=await Promise.all([readJson(canonicalPath),readJson(sourcePath),readJson(mappingPath)])
const oldSourceId='9371884f-3c08-5f6f-b963-163f2ccc9cb3'; const validationSourceId='by-math-m13-4-9371884f-s02-bf45d4d2b4';
const validationMappings=mapping.mappings.filter((r:any)=>r.canonicalGoalId===ids[2]);
assert.deepEqual(validationMappings.map((r:any)=>[r.legacyGoalId,r.matchType]),[[validationSourceId,'partial']]);
assert.match(source.sourceGoals.find((g:any)=>g.id===validationSourceId).sourceSpan,/interpretieren und validieren/)
assert.doesNotMatch(source.sourceGoals.find((g:any)=>g.id===oldSourceId).sourceSpan,/validieren/)
const entries=ids.map((id,index)=>{
 const goal=canonical.goals.find((g:any)=>g.id===id); const page=model.pages.find(p=>p.goalId===id);assert.ok(page)
 const byScopes=page.applicability?.find(g=>g.jurisdiction==='DE-BY')?.scopes??[];
 const profiles=[...new Set(byScopes.filter(s=>s.stage==='SekII').map(s=>s.courseProfile))].sort()
 assert.deepEqual(profiles,index===5?['LK']:['GK','LK'],id)
 if(index<3||index===5)assert.deepEqual(page.applicability?.map(g=>g.jurisdiction),['DE-BY'],id)
 const rows=mapping.mappings.filter((r:any)=>r.canonicalGoalId===id)
 const inherited=index<3?mapping.mappings.filter((r:any)=>r.canonicalGoalId==='ead1f5ce-fdf4-5591-8982-395001017848'):[]
 return {goalId:id,title:goal.title,goalFingerprint:page.goalFingerprint,applicability:page.applicability,sourceRef:goal.sourceRef??null,canonicalTags:goal.tags,bySekIICourseProfiles:profiles,visualization:page.visualization,directSourceMappings:rows.map((r:any)=>({...r,source:source.sourceGoals.find((g:any)=>g.id===r.legacyGoalId)})),inheritedClusterSourceMappings:inherited.map((r:any)=>({...r,source:source.sourceGoals.find((g:any)=>g.id===r.legacyGoalId)}))}
})
const paths=[canonicalPath,sourcePath,mappingPath,'app/scripts/goalBookModel.ts','backend/src/main/java/com/skillpilot/backend/service/LearnerService.java',...['de-by-gk','de-by-lk','de-by-sekii-gk','de-by-sekii-lk'].map(n=>`curricula/DE/Gymnasium/composition-views/mathematik/${n}.view.json`)]
const fileBindings=await Promise.all(paths.map(async path=>({path,digest:'sha256:'+createHash('sha256').update(await readFile(path)).digest('hex')})))
const report={schemaVersion:1,status:'current_source_scope_audit_not_a_review_approval',checkedAt:new Date().toISOString(),bookDigest:model.digest,curricularAtomicGoalCount:model.pages.length,rule:'BY GK is compulsory elevated-level mathematics; BY LK additionally contains all five Vertiefungskurs modules. Technical projection labels do not rename official courses.',fileBindings,goals:entries,noHumanApproval:true,noStrictDClaim:true}
await writeFile(base+'.source-scope.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({goalCount:entries.length,bookDigest:model.digest,scopes:entries.map(e=>({id:e.goalId,by:e.bySekIICourseProfiles,jurisdictions:e.applicability?.map(a=>a.jurisdiction)})),sourceAspectCheck:'pass'},null,2))
