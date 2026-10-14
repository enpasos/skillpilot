// Apache-2.0. Read-only reproduction of the already completed two-carrier receipt state.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync,writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL,fileURLToPath } from 'node:url'
const repo='/home/enpasos/projects/skillpilot'
const own=resolve(fileURLToPath(new URL('..',import.meta.url)))
const host=resolve(repo,'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const digest=(x:any)=>'sha256:'+createHash('sha256').update(JSON.stringify(x)).digest('hex')
const before=read(resolve(own,'receipts/BEFORE.actual-stock-whole-compiled-NI2652-source.json'))
const after=read(resolve(own,'receipts/AFTER.actual-stock-whole-compiled-NI2652-source.json'))
const compiler=await import(pathToFileURL(resolve(host,'app/scripts/applicabilityCompiler.ts')).href)
const all=compiler.buildApplicabilityCompilation()
const chem='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',hubid='a0e13c56-c25f-4742-9272-3a1a603ee52e',goalid='2652caef-b557-58b9-9b28-70db62625ce5'
const b=new Map(before.allCompiledReportDigests.map((r:any)=>[r.landscapeId,r]))
const a=new Map(after.allCompiledReportDigests.map((r:any)=>[r.landscapeId,r]))
for(const r of all.reports){
 const expected:any=a.get(r.landscapeId)
 assert.equal(digest(r.goals),expected.goalsDigest)
 assert.equal(digest(r.findings),expected.findingsDigest)
 assert.equal(digest(r.projections),expected.projectionsDigest)
}
const hub=all.reports.find((r:any)=>r.landscapeId===hubid)
const extra=hub.findings.filter((f:any)=>f.landscapeId===chem&&f.goalId===goalid&&f.value==='DE-NI'&&f.code==='APV-202')
assert.equal(extra.length,1)
assert.equal(extra[0].severity,'diagnostic')
assert.equal(extra[0].message,'Applicability for DE-NI is backed only by partial mappings.')
const preceding=hub.findings.filter((f:any)=>f!==extra[0])
const precedingProjections=hub.projections.map((p:any)=>p.value==='DE-NI'?{...p,diagnostics:p.diagnostics-1}:p)
const hb:any=b.get(hubid),ha:any=a.get(hubid)
assert.equal(digest(preceding),hb.findingsDigest)
assert.equal(digest(precedingProjections),hb.projectionsDigest)
assert.equal(hb.goalsDigest,ha.goalsDigest)
const separate=all.reports.filter((r:any)=>![hubid,chem].includes(r.landscapeId))
assert.equal(separate.length,19)
for(const r of separate)assert.deepEqual(b.get(r.landscapeId),a.get(r.landscapeId))
const overview=read(resolve(host,hub.file))
const chemistryRaw=read(resolve(host,all.reports.find((r:any)=>r.landscapeId===chem).file))
const chemistryRootIds=new Set(chemistryRaw.goals.filter((g:any)=>(g.tags??[]).includes('root')).map((g:any)=>g.id))
assert.ok(overview.goals.some((g:any)=>(g.contains??[]).some((x:any)=>chemistryRootIds.has(String(x).replace(chem+':','')))))
const protectedReports=['68a8ac50-f5f5-4e24-8aa9-5e408ca01ced','7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a','08a43a1b-d97e-522c-9dfa-c950a493364e'].map(id=>{
 const report=all.reports.find((r:any)=>r.landscapeId===id)
 assert.deepEqual(b.get(id),a.get(id))
 return {landscapeId:id,title:report.title,wholeReportDigests:b.get(id),beforeAfterExact:true}
})
const output={schemaVersion:1,checkedAt:new Date().toISOString(),role:'Technical diagnosis of exact original successful BEFORE/AFTER receipts; no new science',
 stockCompilerUnchanged:true,actualCurrentAfterTwoCarrierReproductionMatchesEveryOriginalAfterReportDigest:true,
 originalOverbroadAssertion:'All non-Chemistry report digests exact was false: the cross-subject Gymnasium hub recursively records chemistry provenance diagnostics.',
 failedOverbroadAssertionPreserved:true,hub:{landscapeId:hubid,title:hub.title,file:hub.file,containsChemistry:true,wholeOwnGoalDigestBeforeAfterExact:true,
   exactSoleAddedFinding:extra[0],onlyProjectionDelta:{jurisdiction:'DE-NI',field:'diagnostics',delta:1},
   removingThisExactObservedFindingAndItsCountReproducesOriginalBeforeFindingsAndProjectionsDigests:true,
   beforeDigests:hb,afterDigests:ha},
 allOther19NonChemistryWholeReportDigestsExact:true,protectedMathematicsPhysicsBiologyReports:protectedReports,
 source2652CompiledApplicabilityExact:before.wholeSelectedCompiledGoal.compiledApplicability,
 explanation:'NI applicability already existed through requires closure; three accepted PARTIAL direct edges add one APV-202 partial-only provenance diagnostic for2652. The hub traverses its Chemistry child, so this Chemistry diagnostic appears in the hub findings and NI diagnostic count without changing the hub goal body, visible target count, or any separate subject report.',
 activeWrites:false,wholeSourceOrMaturityApproval:false}
writeFileSync(resolve(own,'receipts/CHECK.actual-hub-chemistry-only-one-partial-provenance-diagnostic-delta.json'),JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify({hub:hub.title,exactSoleAddedFinding:extra[0],otherNonChemistryReportsExact:19,protectedReportsExact:3,currentReproductionMatchesAllAfterDigests:true}))
