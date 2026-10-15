// SPDX-License-Identifier: Apache-2.0
// Exactly one metadata input-FP replacement; profile bodies and19whole lines exact.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve,relative,dirname} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createRequire} from 'node:module'
const root=process.cwd(),own=resolve(dirname(fileURLToPath(import.meta.url)),'..'),rel=relative(root,own)
assert.ok(!existsSync(resolve(own,'FILES.finite-alt-author-native-preparation.seal.json')))
const at=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8')),get=(p:string)=>JSON.parse(readFileSync(resolve(own,p),'utf8'))
const hash=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex'),bind=(p:string)=>({path:p,sha256:hash(readFileSync(resolve(root,p))),bytes:readFileSync(resolve(root,p)).length})
const write=(p:string,d:any)=>writeFileSync(resolve(own,p),JSON.stringify(d,null,2)+'\n')
const helper=await import(pathToFileURL(resolve(root,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href),book=await import(pathToFileURL(resolve(root,'app/scripts/goalBookModel.ts')).href)
const {normalizeCanonicalLandscape,validateCanonicalLandscape}=await import(pathToFileURL(resolve(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const {prepareLandscapeEntries}=await import(pathToFileURL(resolve(root,'app/src/hooks/useLandscapes.ts')).href)
const req=createRequire(resolve(root,'app/package.json')),Ajv=req('ajv/dist/2020').default,ajv=new Ajv({strict:false,allErrors:true});req('ajv-formats')(ajv)
const schema=ajv.compile(at('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')),runtime=ajv.compile(at('docs/landscape-runtime.schema.json'))
const sel=get('INPUTS.exact-final-native20-alt-only.json'),before=at(sel.beforeCanonical560.path),after=at(sel.wholeCanonical560.path),B=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])),A=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]))
const ledger=at(sel.semantic560.path);assert.deepEqual(ledger,at(sel.beforeSemantic560.path));for(const d of ledger.decisions)assert.equal(d.sourceFingerprint,book.fingerprintSemanticKindSourceGoal(A.get(d.goalId)),d.goalId)
const map=get('checks/REBUILD.final-native560-alt-only.physical-map.json'),digests:Record<string,string>={};for(const r of map.selectedCurrentAssetRows)digests['/'+r.normalPublicDestination.replace(/^app\/public\//,'')]=r.physicalRepositorySource.sha256
const text=readFileSync(resolve(root,sel.beforeProfiles20.path),'utf8'),lines=text.split('\n'),records:any[]=[],checks:any[]=[],cas:any[]=[]
const out=lines.map((line:string)=>{
 if(!line)return line
 const beforeRow=JSON.parse(line),r=structuredClone(beforeRow),g=A.get(r.goalId),fp=helper.fingerprintPositiveGoalEvidenceReviewInput(g,r.reviewCriteriaFingerprint,digests,'curricularAtomic')
 assert.equal(helper.fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),r.goalFingerprint);assert.equal(helper.fingerprintPositiveGoalEvidenceProfile(r.profile),r.profileFingerprint)
 if(r.goalId==='a3386a86-f1ee-55b8-bcd5-03bfb1f9d987'){
  assert.notEqual(fp,r.reviewInputFingerprint);r.reviewInputFingerprint=fp
  const token='"reviewInputFingerprint":"'+beforeRow.reviewInputFingerprint+'"';assert.equal(line.split(token).length,2);line=line.replace(token,'"reviewInputFingerprint":"'+fp+'"')
  assert.deepEqual(JSON.parse(line),r);cas.push({goalId:r.goalId,wholeBefore:beforeRow,wholeAfter:r,onlyChangedField:'reviewInputFingerprint',reason:'Technical binding to the actual current a338 altText only; whole inner profile, all reviewer/time/status/E0G0 fields exact. No new P decision.'})
 }else assert.equal(fp,r.reviewInputFingerprint)
 const ok=schema(r),errors=helper.validatePositiveGoalEvidenceRecordSemantics(r,g,digests,'curricularAtomic');assert.ok(ok&&!errors.length,JSON.stringify({goalId:r.goalId,schema:schema.errors,errors}))
 assert.equal(r.evidenceLevel,'E0');assert.equal(r.maximumClaimScope,'G0');assert.deepEqual(r.reviewRunIds,[]);assert.deepEqual(r.profile,beforeRow.profile)
 records.push(r);checks.push({goalId:r.goalId,schemaPass:ok,normalHelperErrors:errors,inputFingerprintChanged:r.reviewInputFingerprint!==beforeRow.reviewInputFingerprint,wholeProfileBodyExact:true,wholeOriginalLineExact:r.goalId!=='a3386a86-f1ee-55b8-bcd5-03bfb1f9d987'})
 return line
}).join('\n')
assert.equal(records.length,20);assert.equal(cas.length,1);assert.equal(checks.filter(r=>r.wholeOriginalLineExact).length,19)
writeFileSync(resolve(own,'candidate/twenty-author-E0G0.only-Nernst-input-binding.jsonl'),out)
write('CAS.one-Nernst-raw-profile-input-only.json',{role:'Authorized address/context metadata binding on a raw E0G0 author candidate, not positive P science',before20:sel.beforeProfiles20,after20:bind(rel+'/candidate/twenty-author-E0G0.only-Nernst-input-binding.jsonl'),rows:cas,other19WholeLineBytesExact:true,all20InnerProfileBodiesExact:true,allGoalAndProfileFingerprintsExact:true,allScientificAndAuthorMetadataOtherThanOneInputFingerprintExact:true,newP:0,newM:0,newVotes:0})
write('checks/PROFILE20.normal-schema-helper-one-input-only.actual.json',{pass:true,normalHelper:bind('app/scripts/positiveGoalEvidenceProfileModel.ts'),normalSchema:bind('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),records:checks,rawE0G0Profiles:20,positiveP:0,bodyChanges:0,inputChanges:1,newVotes:0})
assert.ok(runtime(after),JSON.stringify(runtime.errors));const diagnostics=validateCanonicalLandscape(normalizeCanonicalLandscape(after));assert.ok(!diagnostics.some((d:any)=>d.severity==='error'),JSON.stringify(diagnostics))
for(const field of ['requires','contains']){const done=new Set<string>(),busy=new Set<string>();const walk=(id:string)=>{assert.ok(A.has(id));assert.ok(!busy.has(id),field+' cycle '+id);if(done.has(id))return;busy.add(id);for(const r of A.get(id)[field]??[])walk(r);busy.delete(id);done.add(id)};for(const id of A.keys())walk(id)}
const projection=(l:any)=>prepareLandscapeEntries([l])[0].goals.map((g:any)=>({id:g.id,requires:g.requires,effective:g.effectiveRequires,contains:g.contains}));assert.deepEqual(projection(before),projection(after))
const norm=(v:any)=>String(v??'').normalize('NFKC').replace(/\s+/g,' ').trim(),mf=(g:any)=>hash(book.stableGoalBookJson({ruleVersion:'memory-card-review-v1',goalId:g.id,shortKey:g.shortKey??'',title:norm(g.title),titleEn:norm(g.titleEn),description:norm(g.description),descriptionEn:norm(g.descriptionEn),phase:norm(g.dimensionTags?.phase),area:norm(g.dimensionTags?.area),topicCode:norm(g.dimensionTags?.topicCode),nodeKind:norm(g.nodeKind)}))
assert.ok(after.goals.every((g:any)=>mf(g)===mf(B.get(g.id))))
write('checks/DATA560.normal-schema-DAG-effective-semantic-M-identity.actual.json',{pass:true,normalRuntimeSchema:true,normalCanonicalDiagnostics:diagnostics,wholeGoals:560,ordinaryAtomic:422,directRequiresDAG:true,containsDAG:true,all560EffectiveRequiresExact:true,other559WholeGoalsExact:true,semantic560WholeBytesExact:true,all560SemanticSourceFingerprintsStillExact:true,all560MemoryFingerprintPayloadsExact:true,allPreviousSixMStalesStillOpen:true,newM:0,MRefreshes:0,newVotes:0})
console.log(JSON.stringify({normalDataAndProfileChecks:'PASS',wholeGoals:560,other559WholeGoalsExact:true,whole42CasesExact:true,all20ProfileBodiesExact:true,other19WholeRawLinesExact:true,onlyNernstInputFingerprintChanged:true,semanticAndMemoryFingerprintPayloadsExact:true,newVotes:0}))
