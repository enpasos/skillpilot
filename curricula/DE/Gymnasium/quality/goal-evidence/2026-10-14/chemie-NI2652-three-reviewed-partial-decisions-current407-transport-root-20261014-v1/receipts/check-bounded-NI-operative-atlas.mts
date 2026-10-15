// Apache-2.0. Pure unchanged stock Atlas builder, explicit NI-only config and actual H inputs.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs'
import { resolve,dirname } from 'node:path'
import { pathToFileURL,fileURLToPath } from 'node:url'
const phase=process.argv[2]
assert.ok(['BEFORE','AFTER'].includes(phase))
const repo='/home/enpasos/projects/skillpilot'
const own=resolve(fileURLToPath(new URL('..',import.meta.url)))
const host=resolve(repo,'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const digest=(x:string|Buffer)=>'sha256:'+createHash('sha256').update(x).digest('hex')
const write=(p:string,v:any)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(v,null,2)+'\n')}
const input=read(resolve(own,'INPUT.full-operative-atlas-config-and-exact-NI-bounded-derivation.json'))
const full=input.fullOperativeAtlasConfig
assert.equal(digest(readFileSync(resolve(host,'app/scripts/goalBookSourceAtlasInputs.ts'))),input.stockAtlasBuilderBinding.sha256)
const stock=await import(pathToFileURL(resolve(host,'app/scripts/goalBookSourceAtlasInputs.ts')).href)
const canonical=read(resolve(host,full.landscapePath))
const goals=new Map(canonical.goals.map((g:any)=>[g.id,g]))
const ledger=read(resolve(host,full.semanticKindLedgerPath))
const atoms=new Set<string>(ledger.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
assert.equal(atoms.size,407)
const mappingPaths=input.boundedNIMappingPaths
assert.equal(mappingPaths.length,2)
const union=new Set<string>(),unresolved:any[]=[],usedDocumentPaths=new Set<string>()
for(const mp of mappingPaths){
 const mapping=read(resolve(host,mp)),ext=read(resolve(host,mapping.sourceExtractionPath))
 assert.equal(ext.jurisdiction,'DE-NI')
 const sources=new Map(ext.sourceGoals.map((s:any)=>[s.id,s])),passages=new Map(ext.passages.map((p:any)=>[p.id,p]))
 const docs=ext.sourceDocuments?.length?ext.sourceDocuments:[ext.sourceDocument]
 for(const d of mapping.decisions){
  if(d.decision!=='mapped')continue
  const s:any=sources.get(d.sourceGoalId),p:any=passages.get(s.passageId)??{}
  const key=s.sourceDocumentKey??p.sourceDocumentKey
  const matches=key?docs.filter((x:any)=>x.key===key):docs
  assert.equal(matches.length,1)
  const doc=matches[0];usedDocumentPaths.add(doc.path)
  const stage=stock.sourceAtlasFacet([s,p,doc,ext],'stage'),course=stock.sourceAtlasFacet([s,p,doc,ext],'courseProfile')
  const scoped=course!==null&&stage?.length===1&&(stage[0]==='SekI'||course.length>0)
  if(!scoped)unresolved.push({mappingPath:mp,sourceGoalId:s.id,stage,courseProfile:course})
  for(const target of d.canonicalGoalIds){
   const desc=stock.sourceAtlasDescendants(target,goals,atoms,canonical.landscapeId)
   if(scoped)desc.forEach((g:string)=>union.add(g))
  }
 }
}
const boundedPolicyRelative=input.boundedPolicyHostBinding.path.replace('tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host/','')
const config={...full,bookId:full.bookId+'-bounded-ni3-transport-check',mappingPaths,
 sourceDocumentSnapshots:full.sourceDocumentSnapshots.filter((s:any)=>usedDocumentPaths.has(s.path)),fallbackViewPaths:[],
 durationModelPolicyPath:boundedPolicyRelative,expectedJurisdictions:['DE-NI'],
 expectedUnresolvedScopeDecisionCount:unresolved.length,expectedCurricularAtomicGoalCount:union.size,
 outputDirectory:'app/scripts/config/goal-books/source-views/de-gym-chemistry-NI3-transport-bounded-check',
 manifestPath:'app/scripts/config/goal-books/de-gym-chemistry-NI3-transport-bounded-check.sources.json',
 navigationViewPath:'app/scripts/config/goal-books/navigation/de-gym-chemistry-NI3-transport-bounded-check.view.json',navigationViewId:'de-gym-chemistry-NI3-transport-bounded-check'}
assert.equal(unresolved.length,0,'NI scope was expected explicit, not guessed through fallback')
const configFile=resolve(own,`atlas-check/CONFIG.NI-only.${phase}.actual-stock-builder-input.json`)
write(configFile,config)
const result=stock.buildGoalBookSourceAtlasInputs(config,host)
assert.equal(result.receipt.counts.canonicalCurricularAtomicGoals,407)
assert.equal(result.receipt.counts.publishedCurricularAtomicGoals,union.size)
assert.deepEqual(result.receipt.unresolvedSourceScopes,unresolved)
const goalid='2652caef-b557-58b9-9b28-70db62625ce5'
const witnesses=result.receipt.scopes.map((s:any)=>({key:s.key,goalPresent:s.goalIds.includes(goalid),wholeSelectedGoalWitnesses:s.witnesses.filter((w:any)=>w.goalId===goalid)}))
const sourceids=read(resolve(own,'CAS.actual-paired-three-partial-source-and-scope-witness-decisions.transport.json')).sourceIds
for(const s of witnesses){
 if(s.key.includes('/SekII/')){
  if(phase==='BEFORE'){assert.equal(s.goalPresent,false);assert.deepEqual(s.wholeSelectedGoalWitnesses,[])}
  else{
   assert.equal(s.goalPresent,true)
   assert.deepEqual(s.wholeSelectedGoalWitnesses.map((w:any)=>w.sourceGoalId).sort(),[...sourceids].sort())
   assert.ok(s.wholeSelectedGoalWitnesses.every((w:any)=>w.coverage==='direct'&&w.profileBasis==='source-metadata'&&w.mappedTargetGoalId===goalid))
  }
 }
}
write(resolve(own,`receipts/ATLAS.NI-only.${phase}.actual-stock-full-receipt.json`),result.receipt)
write(resolve(own,`receipts/ATLAS.NI-only.${phase}.actual-config-and-whole2652-witness.json`),{
 schemaVersion:1,phase,checkedAt:new Date().toISOString(),stockBuilder:'unchanged buildGoalBookSourceAtlasInputs(config, actual H repoRoot)',
 fullOperativeConfigBinding:input.fullOperativeAtlasConfigBinding,boundedConfigPath:configFile.replace(repo+'/',''),boundedConfigSha256:digest(readFileSync(configFile)),
 explicitScope:'NI only: exact operative NI lower and special-manganometry upper carriers; canonical407 retained. ExpectedNI count is mechanically counted from this scoped actual decision/source-metadata union, not a reduced national quality floor.',
 stockReceiptCounts:result.receipt.counts,whole2652Witnesses:witnesses,
 stockGeneratedOutputCount:Object.keys(result.outputs).length,
 allComputedOutputDigestsVerified:Object.entries(result.outputs).every(([path,bytes])=>path.endsWith('source-projection.receipt.json')||result.receipt.outputBindings.some((b:any)=>b.path===path&&b.sha256===digest(bytes as string))),
 virtualOutputsNotWrittenToHost:true,fullNationalAtlasClaim:false,newScienceReview:false,wholeOriginalSourceClosure:false,humanApproval:false,activeWrites:false})
console.log(JSON.stringify({phase,counts:result.receipt.counts,witnesses:witnesses.map((s:any)=>({key:s.key,present:s.goalPresent,directWitnesses:s.wholeSelectedGoalWitnesses.length})),hostGeneratedOutputWrites:0}))
