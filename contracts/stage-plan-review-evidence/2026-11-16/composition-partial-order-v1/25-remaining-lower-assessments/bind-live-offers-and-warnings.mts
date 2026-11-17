import assert from 'node:assert/strict'
import {readFileSync,readdirSync,writeFileSync,existsSync,copyFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {buildApplicabilityCompilation} from '/home/enpasos/projects/skillpilot/app/scripts/applicabilityCompiler.ts'
const root='/home/enpasos/projects/skillpilot',relative=(p:string)=>p.slice(root.length+1)
const base=resolve(root,'tmp/pipeline/laender-stufen/gesamt/physics/all-nine-assessments')
const quality=resolve(root,'curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1')
const out=resolve(root,'tmp/pipeline/laender-stufen/gesamt/review/remaining-lower-assessments')
const hash=(v:any)=>createHash('sha256').update(v).digest('hex')
const load=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const releasePath=resolve(base,'release-manifest.actual.json'),release=load(releasePath)
const metadataPath=resolve(quality,'independent-review/offer-bindings.actual.json'),metadata=load(metadataPath)
assert.equal(hash(readFileSync(metadataPath)),release.metadataReviewSha256)
assert.equal(metadata.status,'PASS');assert.equal(metadata.rows.length,9)
const dir=resolve(root,'curricula/DE/Gymnasium/canonical'),files=readdirSync(dir).filter(n=>n.endsWith('.json')).map(n=>resolve(dir,n))
const catalog=files.map(load),physics=catalog.find(l=>l.landscapeId==='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a')
const canonicalPath=files.find((p,i)=>catalog[i]===physics)!
assert.equal(hash(readFileSync(canonicalPath)),release.catalogAfterSha256)
const previousPath=resolve(base,'canonical.before.json'),previous=load(previousPath)
assert.equal(hash(readFileSync(previousPath)),release.catalogBeforeSha256)
const oldGoals=new Map(previous.goals.map((g:any)=>[g.id,g])),currentGoals=new Map(physics.goals.map((g:any)=>[g.id,g]))
const lens='3b7b2b62-e39c-5936-b0d8-5406206e57b6',program='bf980fff-b62b-4ea4-a20d-31681a7ad785'
let untouched=0
for(const [id,g]of oldGoals){if(id===lens||id===program)continue;assert.deepEqual(currentGoals.get(id),g);untouched++}
assert.equal(untouched,840)
const newIds=release.tasks.map((t:any)=>t.id).filter((id:string)=>!oldGoals.has(id))
assert.equal(newIds.length,8)
assert.equal(currentGoals.size,oldGoals.size+8)
const oldProgram:any=oldGoals.get(program),newProgram:any=currentGoals.get(program)
assert.deepEqual({...newProgram,contains:oldProgram.contains},oldProgram)
assert.deepEqual(newProgram.contains,[...oldProgram.contains,...newIds])
const paths=[...files,releasePath,metadataPath,previousPath,resolve(root,'app/scripts/applicabilityCompiler.ts'),
 ...release.tasks.flatMap((t:any)=>[t.releasedPath,t.offeredCandidatePath,t.contentReview,t.sourceArtifactPath].map((p:string)=>resolve(root,p)))]
const pins=()=>Object.fromEntries(paths.map(p=>[relative(p),hash(readFileSync(p))]))
const before=pins(),compilation=buildApplicabilityCompilation(catalog.map((landscape,i)=>({landscape,file:files[i]})))
const ownReport=compilation.reports.find(r=>r.landscapeId===physics.landscapeId)!,rows=[]
const dropRelease=(g:any)=>{const c=structuredClone(g);delete c.examData.reviewStatus;delete c.examData.reviewNote;return c}
for(const task of release.tasks){
 const goal:any=currentGoals.get(task.id),releasedPath=resolve(root,task.releasedPath),offeredPath=resolve(root,task.offeredCandidatePath)
 assert.equal(hash(readFileSync(releasedPath)),task.releasedSha256)
 assert.equal(hash(readFileSync(offeredPath)),task.offeredCandidateSha256)
 assert.deepEqual(goal,load(releasedPath))
 assert.equal(goal.examData.reviewStatus,'released')
 assert.deepEqual(dropRelease(goal),dropRelease(load(offeredPath)),'Release cannot change reviewed content or offer metadata')
 const meta=metadata.rows.find((r:any)=>r.taskId===task.id)
 assert.equal(task.offeredCandidateSha256,meta.candidate.sha256)
 assert.deepEqual(goal.requires,meta.requires);assert.deepEqual(goal.examData.coveredGoalIds,meta.coveredGoalIds)
 assert.deepEqual(goal.extendedData,{applicabilityMappingInheritance:'boundary',applicabilityOverrides:{jurisdiction:meta.offeredJurisdictions}})
 assert.deepEqual(goal.applicability,{jurisdiction:meta.offeredJurisdictions})
 const report=ownReport.goals.find(g=>g.goalId===task.id)!
 assert.deepEqual(report.compiledApplicability.jurisdiction,meta.offeredJurisdictions)
 const warning=ownReport.findings.filter(f=>f.code==='APV-201'&&f.goalId===task.id)
 assert.equal(warning.length,1)
 assert.equal(hash(readFileSync(resolve(root,task.contentReview))),task.contentReviewSha256)
 assert.equal(hash(readFileSync(resolve(root,task.sourceArtifactPath))),task.sourceArtifactSha256)
 rows.push({taskId:goal.id,title:goal.title,courseProfiles:meta.courseProfiles,offeredJurisdictions:meta.offeredJurisdictions,
   releasedGoalPath:task.releasedPath,releasedGoalSha256:task.releasedSha256,currentGoalJsonStringifySha256:hash(JSON.stringify(goal)),
   requires:goal.requires,coveredGoalIds:goal.examData.coveredGoalIds,compiledJurisdictions:report.compiledApplicability.jurisdiction,
   compiledGoalReport:report,exactWarning:warning[0],reviewedContentUnchanged:true,actualOrdinaryRequiresUnchanged:true})
}
const after=pins(),drift=Object.keys(before).filter(p=>before[p]!==after[p]);assert.deepEqual(drift,[])
const ledgerPath=resolve(root,'docs/qa-ci/applicability-accepted-warnings.json'),oldBytes=readFileSync(ledgerPath),oldText=oldBytes.toString('utf8'),ledger=JSON.parse(oldText)
assert.equal(ledger.acceptedWarnings.length,111)
const key=(r:any)=>[r.code,r.landscapeId,r.goalId??'',r.dimension??'',r.value??''].join('|')
const oldKeys=new Set(ledger.acceptedWarnings.map(key))
for(const r of rows)assert(!oldKeys.has(key(r.exactWarning)),'Do not replace an existing accepted warning')
const livePath=resolve(quality,'independent-review/offer-live-binding.actual.json')
const result={schema:'independent-released-own-assessment-offer-binding-v1',reviewer:'/root/he_ephase_source_review',authors:['/root/he_ephase_implementation','/root/he_ephase_validation'],
 reviewedAt:new Date().toISOString(),status:'PASS',humanApproval:false,inputPins:before,inputDrift:drift,
 ordinaryGoalCountComparedExactly:untouched,existingOrdinaryGoalChanges:0,newTaskCount:8,previousLensOfferNarrowed:true,
 sourceMeaning:'These are9 own curricular task offerings with exact countries, not official source tasks or universal official requirements.',
 metadataReview:{path:relative(metadataPath),sha256:hash(readFileSync(metadataPath))},rows,
 acceptedWarningLedgerBefore:{path:relative(ledgerPath),sha256:hash(oldBytes),entryCount:ledger.acceptedWarnings.length},
 limits:['Independent AI metadata/content binding, not human approval or learner effectiveness.','Final views, CQR/M7 and main CI remain separate acceptance steps.']}
const tmpResult=resolve(out,'nine-offer-live-binding.independent.actual.json')
assert(!existsSync(tmpResult)&&!existsSync(livePath),'Preserve original evidence')
writeFileSync(tmpResult,JSON.stringify(result,null,2)+'\n');copyFileSync(tmpResult,livePath)
const evidenceHash=hash(readFileSync(livePath))
const additions=rows.map((r,index)=>({code:'APV-201',landscapeId:physics.landscapeId,goalId:r.taskId,dimension:'jurisdiction',
 rationale:`Bewusstes eigenes Aufgabenangebot ausschließlich für ${r.offeredJurisdictions.join(', ')} (${r.courseProfiles.join('/')}). Die unabhängig geprüfte Aufgabe repariert dort belegte Lernkontexte; sie behauptet keine amtliche Aufgabenpflicht oder neue Quellenabdeckung. Echte Voraussetzungen und bestehende Kompetenzziele bleiben unverändert.`,
 evidence:{reviewPath:relative(livePath),reviewFileSha256:evidenceHash,reviewedAt:result.reviewedAt.slice(0,10),reviewAuthority:'ai_review',humanApproval:false,
   metadataReviewPath:relative(metadataPath),metadataReviewSha256:result.metadataReview.sha256,rowPointer:`/rows/${index}`,
   exactWarningKey:key(r.exactWarning),exactOverrideJurisdictions:r.offeredJurisdictions,compiledJurisdictions:r.compiledJurisdictions,
   courseProfiles:r.courseProfiles,releasedGoalPath:r.releasedGoalPath,releasedGoalSha256:r.releasedGoalSha256,
   currentGoalJsonStringifySha256:r.currentGoalJsonStringifySha256,officialWholeSourceCredit:false,officialMandatoryRequirement:false}}))
const closing='\n  ]\n}\n';assert(oldText.endsWith(closing))
const appended=oldText.slice(0,-closing.length)+',\n'+additions.map(r=>JSON.stringify(r,null,2).split('\n').map(line=>'    '+line).join('\n')).join(',\n')+closing
const next=JSON.parse(appended);assert.deepEqual(next.acceptedWarnings.slice(0,111),ledger.acceptedWarnings);assert.equal(next.acceptedWarnings.length,120)
writeFileSync(resolve(out,'accepted-warnings.before.original.json'),oldBytes)
writeFileSync(ledgerPath,appended)
writeFileSync(resolve(out,'accepted-warnings-nine-offer-delta.actual.json'),JSON.stringify({status:'PASS',beforeSha256:hash(oldBytes),afterSha256:hash(readFileSync(ledgerPath)),beforeCount:111,afterCount:120,existingEntriesChanged:0,addedKeys:additions.map(key),evidence:{path:relative(livePath),sha256:evidenceHash}},null,2)+'\n')
console.log(JSON.stringify({status:result.status,ordinaryGoalsUnchanged:untouched,reviewedOffers:rows.length,ledgerBefore:111,ledgerAfter:120,existingWarningsChanged:0,inputDrift:drift,liveEvidence:relative(livePath)},null,2))
