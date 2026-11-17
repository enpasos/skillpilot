import assert from 'node:assert/strict'
import {readFileSync,readdirSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {buildApplicabilityCompilation} from '/home/enpasos/projects/skillpilot/app/scripts/applicabilityCompiler.ts'
const root='/home/enpasos/projects/skillpilot',out=resolve(root,'tmp/pipeline/laender-stufen/gesamt/review/remaining-lower-assessments')
const base=resolve(root,'tmp/pipeline/laender-stufen/gesamt/physics/all-nine-assessments/sealed-offers-v1')
const manifestPath=resolve(base,'manifest.json'),hash=(b:any)=>createHash('sha256').update(b).digest('hex')
assert.equal(hash(readFileSync(manifestPath)),'3fffc96ff882aad6a0860069337035928f2906bb23dcced646c1e74df0d6712c')
const manifest=JSON.parse(readFileSync(manifestPath,'utf8'))
const expected:Record<string,string[]>={
 'lens-eye-two-model-simulations':['DE-MV','DE-SL'], 'decay-chains-two-consistency-audits':['DE-HH'],
 'rest-energy-two-system-comparisons':['DE-HH'], 'em-spectrum-two-application-maps':['DE-SL','DE-SN'],
 'ideal-transformer-two-load-cases':['DE-SL','DE-SN'], 'personal-free-fall-two-series':['DE-SN'],
 'document-two-provided-investigations':['DE-SN','DE-ST','DE-TH'],'personal-motor-two-builds':['DE-MV'],
 'astronomical-observation-two-evidence-cases':['DE-SN'],
}
const prior:Record<string,[string,string]>={
 'lens-eye-two-model-simulations':['tmp/pipeline/laender-stufen/gesamt/review/lens-eye-reviewed-candidate/lens-eye-two-model-simulations.goal.json','tmp/pipeline/laender-stufen/gesamt/review/lens-eye-assessment-independent.actual.json'],
 'decay-chains-two-consistency-audits':[out.slice(root.length+1)+'/decay-chains-two-consistency-audits-v2.reviewed-candidate.goal.json',out.slice(root.length+1)+'/decay-chains-two-consistency-audits-v2.independent.actual.json'],
 'rest-energy-two-system-comparisons':[out.slice(root.length+1)+'/rest-energy-two-system-comparisons.reviewed-candidate.goal.json',out.slice(root.length+1)+'/rest-energy-two-system-comparisons.independent.actual.json'],
 'em-spectrum-two-application-maps':[out.slice(root.length+1)+'/em-spectrum-two-application-maps.reviewed-candidate.goal.json',out.slice(root.length+1)+'/em-spectrum-two-application-maps.independent.actual.json'],
 'ideal-transformer-two-load-cases':[out.slice(root.length+1)+'/ideal-transformer-two-load-cases.reviewed-candidate.goal.json',out.slice(root.length+1)+'/ideal-transformer-two-load-cases.independent.actual.json'],
 'personal-free-fall-two-series':['tmp/pipeline/laender-stufen/gesamt/physics/remaining-assessments/sealed-v2/personal-free-fall-two-series.goal.json','tmp/pipeline/laender-stufen/gesamt/review/experimental-assessments/personal-free-fall-two-series.independent.actual.json'],
 'document-two-provided-investigations':['tmp/pipeline/laender-stufen/gesamt/physics/remaining-assessments/sealed-v2/document-two-provided-investigations.goal.json','tmp/pipeline/laender-stufen/gesamt/review/experimental-assessments/document-two-provided-investigations.independent.actual.json'],
 'personal-motor-two-builds':['tmp/pipeline/laender-stufen/gesamt/physics/remaining-assessments/sealed-v2/personal-motor-two-builds.goal.json','tmp/pipeline/laender-stufen/gesamt/review/experimental-assessments/personal-motor-two-builds.independent.actual.json'],
 'astronomical-observation-two-evidence-cases':['tmp/pipeline/laender-stufen/gesamt/physics/remaining-lower-assessments/author-validation/history/before-offer-binding/astronomical-observation-two-evidence-cases.goal.json','tmp/pipeline/laender-stufen/gesamt/review/astronomy-assessment-independent/review.actual.json'],
}
const dir=resolve(root,'curricula/DE/Gymnasium/canonical'),files=readdirSync(dir).filter(n=>n.endsWith('.json')).map(n=>resolve(dir,n))
const original=files.map(p=>JSON.parse(readFileSync(p,'utf8'))),allGoals=new Map(original.flatMap(l=>l.goals).map(g=>[g.id,g]))
const strip=(g:any)=>{const c=structuredClone(g);delete c.applicability;delete c.extendedData;return c}
const candidates=manifest.candidates.map((row:any)=>JSON.parse(readFileSync(resolve(base,row.file),'utf8')))
assert.equal(candidates.length,9)
const paths=[manifestPath,...manifest.candidates.map((r:any)=>resolve(base,r.file)),...files,resolve(root,'app/scripts/applicabilityCompiler.ts'),...Object.values(prior).flat().map(p=>resolve(root,p))]
const pins=()=>Object.fromEntries(paths.map(p=>[p.slice(root.length+1),hash(readFileSync(p))]))
const before=pins(),rows=[]
for(const row of manifest.candidates){
 const stem=row.file.replace('.goal.json',''),g=candidates.find((g:any)=>g.id===row.id),[oldPath,proofPath]=prior[stem]
 assert.equal(hash(readFileSync(resolve(base,row.file))),row.sha256)
 const old=JSON.parse(readFileSync(resolve(root,oldPath),'utf8')),proof=JSON.parse(readFileSync(resolve(root,proofPath),'utf8'))
 assert.equal(String(proof.status).toUpperCase(),'PASS')
 assert.equal(proof.taskId??proof.candidateId,g.id)
 const proofPin=proof.candidateSha256??proof.candidatePins?.[oldPath.replace('.reviewed-candidate.goal.json','.goal.json')]??proof.retainedOriginalPins?.[oldPath]??proof.pins?.[row.file]
 assert.equal(hash(readFileSync(resolve(root,oldPath))),proofPin,'Independent content proof must bind the exact prior bytes')
 assert.deepEqual(strip(g),strip(old),'Only offering applicability and extendedData may change')
 assert.deepEqual(g.applicability,{jurisdiction:expected[stem]})
 assert.deepEqual(g.extendedData,{applicabilityMappingInheritance:'boundary',applicabilityOverrides:{jurisdiction:expected[stem]}})
 assert.equal(g.type,'atomic');assert.deepEqual(g.contains,[]);assert.deepEqual(g.requires,g.examData.coveredGoalIds)
 assert.equal(g.requires.length,1)
 const target:any=allGoals.get(g.requires[0]);assert(target&&target.type==='atomic'&&!(target.contains?.length))
 const course=(v:any)=>v.tags.filter((t:string)=>t==='GK'||t==='LK').sort()
 assert.deepEqual(course(g),course(target),'No task may expand its target course profile')
 const seen=new Set<string>(),pending=[...g.requires]
 while(pending.length){const id=pending.pop()!.split(':').at(-1)!;if(seen.has(id))continue;seen.add(id);const required:any=allGoals.get(id);assert(required&&required.type==='atomic'&&!(required.contains?.length));pending.push(...(required.requires??[]))}
 rows.push({taskId:g.id,title:g.title,offeredJurisdictions:expected[stem],courseProfiles:course(g),requires:g.requires,coveredGoalIds:g.examData.coveredGoalIds,
   fullRealPrerequisiteClosureCount:seen.size,contentAndRubricUnchanged:true,originalContentReview:{path:proofPath,sha256:hash(readFileSync(resolve(root,proofPath)))},
   candidate:{path:resolve(base,row.file).slice(root.length+1),sha256:row.sha256},prior:{path:oldPath,sha256:hash(readFileSync(resolve(root,oldPath)))}})
}
function compile(goals:any[]){const catalog=structuredClone(original),physics=catalog.find(l=>l.landscapeId==='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a');for(const g of goals){physics.goals=physics.goals.filter((old:any)=>old.id!==g.id);physics.goals.push(g)}return buildApplicabilityCompilation(catalog.map((landscape,i)=>({file:files[i],landscape})))}
const baseline=compile(candidates),reports=baseline.reports.flatMap(r=>r.goals)
for(const row of rows){const report=reports.find(r=>r.goalId===row.taskId)!;assert(report);assert.deepEqual(report.compiledApplicability.jurisdiction,row.offeredJurisdictions);Object.assign(row,{compiledJurisdictions:report.compiledApplicability.jurisdiction,compiledGoalReport:report})}
const warnings=baseline.reports.filter(r=>r.landscapeId==='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a').flatMap(r=>r.findings)
 .filter(f=>f.code==='APV-201'&&candidates.some((g:any)=>g.id===f.goalId))
assert.equal(warnings.length,9)
const negatives=[]
for(const kind of ['from-requires-reenabled','override-missing','extra-BY']){
 const changed=structuredClone(candidates)
 for(const g of changed){if(kind==='from-requires-reenabled')g.extendedData.applicabilityFromRequires=true;else if(kind==='override-missing')delete g.extendedData.applicabilityOverrides;else g.extendedData.applicabilityOverrides.jurisdiction=[...g.extendedData.applicabilityOverrides.jurisdiction,'DE-BY'].sort()}
 const result=compile(changed),flat=result.reports.flatMap(r=>r.goals)
 const differences=rows.map(row=>({taskId:row.taskId,expected:row.offeredJurisdictions,actual:flat.find(r=>r.goalId===row.taskId)!.compiledApplicability.jurisdiction??[]}))
 assert(differences.some(row=>JSON.stringify(row.expected)!==JSON.stringify(row.actual)),'A bad offering model must not silently equal every expected offer')
 negatives.push({kind,actualResults:differences,exactOfferingVerifierRejects:true})
}
const after=pins(),drift=Object.keys(before).filter(p=>before[p]!==after[p]);assert.deepEqual(drift,[])
const report={schema:'independent-nine-own-assessment-offering-review-v1',reviewer:'/root/he_ephase_source_review',authors:['/root/he_ephase_implementation','/root/he_ephase_validation'],
 reviewedAt:new Date().toISOString(),status:'PASS',releaseRecommendation:'APPROVE_REVIEWED_OFFER_METADATA',humanApproval:false,
 sourceMeaning:'Own bounded curricular assessment offerings. No official task duty, official source coverage or learner performance is asserted.',
 inputPins:before,inputDrift:drift,rows,negativeCompilerCases:negatives,exactNewOverrideWarnings:warnings,
 constraints:['Existing competency targets and requires stay unchanged.','Override+mapping boundary replaces FromRequires only for these9 offers; their actual learning demand still follows unchanged real requires.',
 'Final release may change reviewStatus/reviewNote only; source task references, actual CQR104 and M7 are separate integration checks.']}
writeFileSync(resolve(out,'nine-offer-metadata.independent.actual.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({status:report.status,tasks:rows.length,newOverrideWarnings:warnings.length,negativeCompilerCases:negatives.length,inputDrift:drift},null,2))
