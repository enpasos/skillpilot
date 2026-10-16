// SPDX-License-Identifier: Apache-2.0
// Inactive author bookkeeping plus unchanged stock pure validators. No scientific QA vote.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

async function main() {
 const repo=process.cwd(), own=resolve(dirname(fileURLToPath(import.meta.url)),'..')
 const load=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
 const ownLoad=(p:string)=>load(resolve(own,p))
 const sha=(b:string|Buffer)=>`sha256:${createHash('sha256').update(b).digest('hex')}`
 const write=(p:string,x:unknown)=>{mkdirSync(dirname(resolve(own,p)),{recursive:true});writeFileSync(resolve(own,p),JSON.stringify(x,null,2)+'\n')}
 const importRepo=(p:string)=>import(pathToFileURL(resolve(repo,p)).href)
 const helpers=await importRepo('app/scripts/positiveGoalEvidenceProfileModel.ts')
 const book=await importRepo('app/scripts/goalBookModel.ts')
 const authoring=await importRepo('app/src/utils/authoring/canonicalAuthoring.ts')
 const composition=await importRepo('app/src/utils/authoring/compositionViewAuthoring.ts')
 const runtime=await importRepo('app/src/hooks/useLandscapes.ts')
 const req=createRequire(resolve(repo,'app/package.json'))
 const Ajv2020=req('ajv/dist/2020').default, formats=req('ajv-formats')
 const ajv=new Ajv2020({allErrors:true,strict:false});formats(ajv)
 const ctx=ownLoad('candidate/author-context.for-material-serialization.json')
 const canonical=load(ctx.canonical), goalById=new Map(canonical.goals.map((g:any)=>[g.id,g]))
 const sel=ownLoad('inputs/EXACT.physical-inputs.selector.json'), base=load(sel.canonical.path)
 if(sha(readFileSync(sel.canonical.path))!==sel.canonical.sha256)throw Error('Base changed')
 if(sha(readFileSync(sel.semantic.path))!==sel.semantic.sha256)throw Error('Semantic input changed')
 const ledger=load(sel.semantic.path), decisions=new Map(ledger.decisions.map((d:any)=>[d.goalId,d]))
 const sourceIdentity=[]
 for(const goal of canonical.goals){
  const oldDecision:any=decisions.get(goal.id), kind=ctx.converted.includes(goal.id)?'curricularArea':oldDecision?.semanticKind??'curricularAtomic'
  const fingerprint=book.fingerprintSemanticKindSourceGoal(goal)
  if(!oldDecision){
   const d={goalId:goal.id,sourceFingerprint:fingerprint,semanticKind:kind,decisionStatus:'authoritative',decisionBasis:'reviewed-current-structural-split-curricular-atomic'}
   ledger.decisions.push(d);decisions.set(goal.id,d)
  }else{
   if(oldDecision.sourceFingerprint!==fingerprint||oldDecision.semanticKind!==kind)sourceIdentity.push({goalId:goal.id,before:structuredClone(oldDecision),afterFingerprint:fingerprint,proposedSemanticKind:kind})
   oldDecision.sourceFingerprint=fingerprint;oldDecision.semanticKind=kind
   if(ctx.converted.includes(goal.id))oldDecision.decisionBasis='reviewed-current-structural-split-curricular-area'
  }
 }
 const countKeys=['programStructure','curricularArea','curricularAtomic','orientation','practiceAssessment','memory','runtimeSupport']
 ledger.counts=Object.fromEntries(countKeys.map(k=>[k,ledger.decisions.filter((d:any)=>d.semanticKind===k).length]));ledger.counts.total=ledger.decisions.length
 ledger.ledgerId='chemistry-bcp-six-boundaries-author-20261015-v1'
 ledger.sourceLandscapePath=ctx.canonical
 write('candidate/semantic570.current426.source-identity.author.json',ledger)
 write('checks/source-identity-technical-only.actual.json',{role:'Technical proposed kind allocation and stock fingerprint bindings; NO independent semantic-atomicity decision',requiredClosedSchemaLabels:'decisionStatus=authoritative and historical reviewed-* basis values are required by the unchanged ledger format. In this inactive author candidate they label proposed structural kind allocation only; no A gate, review run, or independent approval is created.',sourceIdentity,newGoals:Object.values(ctx.newIds),counts:ledger.counts,newA:0,newStrict:0})

 const criteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
 const criteria=sha(readFileSync(criteriaPath)),profileSchema=load('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
 const validateProfile=ajv.compile(profileSchema)
 const bodies=ownLoad('candidate/fifteen-whole-profile-bodies.raw-E0G0.author.json').profiles
 const records=[],profileChecks=[]
 for(const body of bodies){
  const goal:any=goalById.get(body.goalId),kind='curricularAtomic',digests:Record<string,string>={}
  for(const link of goal.resourceLinks??[]){
   if(link.type!=='goal-visualization')continue
   const suffix=String(link.url).replace(/^\/assets\/goal-visualizations\//,'')
   const assetPath=resolve(repo,'curricula/DE/Gymnasium/visualizations',suffix)
   digests[link.url]=sha(readFileSync(assetPath))
  }
  const r={
   $schema:helpers.POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,schemaVersion:2,
   reviewId:`chemie-bcp-six-boundaries-author-20261015-${records.length+1}`,
   goalFingerprintRuleVersion:helpers.POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
   profileRuleVersion:helpers.POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
   reviewCriteriaFingerprint:criteria,landscapeId:canonical.landscapeId,goalId:goal.id,
   goalFingerprint:helpers.fingerprintGoalForPositiveEvidence(goal,kind),
   reviewInputFingerprint:helpers.fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,digests,kind),
   profileFingerprint:helpers.fingerprintPositiveGoalEvidenceProfile(body.profile),
   status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:new Date().toISOString(),reviewer:'codex-bcp-six-boundaries-material-author',
   reason:'Unreviewed informed author candidate only. E0/G0 with zero review runs or D/P/A/M/V votes. Whole scientific materials and practical operators retained; ten new child profiles plus five exact original integrated-method profile bodies. No historical positive or negative review is relabelled as a current vote. Timestamp records serialization, not independent assessment.',
   evidenceLevel:'E0',maximumClaimScope:'G0',reviewRunIds:[],
   dissent:['Whole independent D/P/A/M/V and source/course/mapping review remains outstanding.','A proposed closed-format semantic-kind binding is not an A approval.','No actual learner/laboratory execution, human approval, human trial or runtime integration is claimed.','New child images are genuinely missing; parent overview bytes are retained without new V decisions.'],profile:body.profile,
  }
  const schemaOK=validateProfile(r),errors=helpers.validatePositiveGoalEvidenceRecordSemantics(r,goal,digests,kind)
  profileChecks.push({goalId:goal.id,schemaOK,schemaErrors:structuredClone(validateProfile.errors??[]),productionSemanticErrors:errors})
  records.push(r)
 }
 writeFileSync(resolve(own,'candidate/fifteen-profiles.raw-E0G0.stock-bindings.author.jsonl'),records.map(r=>JSON.stringify(r)).join('\n')+'\n')
 write('checks/stock-positive-profile-contract.actual.json',{role:'Stock schema and fingerprint checks only, not scientific review',records:profileChecks,newP:0,newStrict:0})

 const runtimeSchema=ajv.compile(load('docs/landscape-runtime.schema.json'))
 const runtimeSchemaOK=runtimeSchema(canonical),runtimeSchemaErrors=structuredClone(runtimeSchema.errors??[])
 const semanticSchema=ajv.compile(load('contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'))
 const semanticSchemaOK=semanticSchema(ledger),semanticSchemaErrors=structuredClone(semanticSchema.errors??[])
 const canonicalFindings=authoring.validateCanonicalLandscape(authoring.normalizeCanonicalLandscape(canonical))
 const entries=runtime.prepareLandscapeEntries([canonical]),runtimeGoals=entries[0].goals
 function cycles(edges:Map<string,string[]>){
  const seen=new Set<string>(),visiting=new Set<string>(),path:string[]=[],findings:string[][]=[]
  function visit(id:string){if(visiting.has(id)){findings.push([...path.slice(path.indexOf(id)),id]);return}if(seen.has(id))return;visiting.add(id);path.push(id);for(const n of edges.get(id)??[])if(edges.has(n))visit(n);path.pop();visiting.delete(id);seen.add(id)}
  for(const id of edges.keys())visit(id);return findings
 }
 const directCycles=cycles(new Map(canonical.goals.map((g:any)=>[g.id,g.requires??[]])))
 const containsCycles=cycles(new Map(canonical.goals.map((g:any)=>[g.id,g.contains??[]])))
 const effectiveCycles=cycles(new Map(runtimeGoals.map((g:any)=>[g.id,g.effectiveRequires??[]])))
 const missing=canonical.goals.flatMap((g:any)=>[...(g.contains??[]),...(g.requires??[])].filter((r:string)=>!goalById.has(r)).map((ref:string)=>({goalId:g.id,ref})))
 const compositionChecks=[]
 for(const name of ['whole-authoring-universe','example-selected-3-5-6']){
  const v=ownLoad(`composition/${name}.unpublished.author.view.json`)
  const typed={...canonical,goals:canonical.goals.map((g:any)=>({...g,semanticKind:(decisions.get(g.id) as any).semanticKind}))}
  const compiled=composition.compileCompositionView(v,typed)
  const occurrences:Record<string,number>={}
  function count(nodes:any[]){for(const n of nodes){if(n.sourceGoalId)occurrences[n.sourceGoalId]=(occurrences[n.sourceGoalId]??0)+1;count(n.children??[])}}
  count(compiled.compiledRootNodes)
  const targets=composition.collectCompositionProjectionRoleGoalIds(v.rootNodes,new Map(canonical.goals.map((g:any)=>[g.id,g])))
  compositionChecks.push({name,findings:compiled.findings,targetCurricularAtomic:[...targets.targetGoalIds].filter(id=>(decisions.get(id) as any).semanticKind==='curricularAtomic').length,occurrences,duplicateVisibleGoals:Object.entries(occurrences).filter(([,n])=>n>1)})
 }
 const changedOld=base.goals.filter((b:any)=>JSON.stringify(b)!==JSON.stringify(goalById.get(b.id))).map((b:any)=>({goalId:b.id,changedFields:[...new Set([...Object.keys(b),...Object.keys(goalById.get(b.id) as any)])].filter(k=>JSON.stringify(b[k])!==JSON.stringify((goalById.get(b.id) as any)[k]))}))
 const unchangedScience=ctx.stable.concat(['e7c3d20e-4b13-560b-b8ee-c5abca8cc624','31781d00-8f20-5041-bd7f-e261b27af162']).map((id:string)=>{
  const b=base.goals.find((a:any)=>a.id===id),n:any=goalById.get(id)
  return {goalId:id,scientificTextExact:['title','titleEn','description','descriptionEn'].every(k=>JSON.stringify(b[k])===JSON.stringify(n[k])),imageLinksExact:JSON.stringify(b.resourceLinks)===JSON.stringify(n.resourceLinks),requiresBefore:b.requires,requiresAfter:n.requires}
 })
 const imageLinksExact=ctx.old11.every((id:string)=>JSON.stringify(base.goals.find((b:any)=>b.id===id).resourceLinks)===JSON.stringify((goalById.get(id) as any).resourceLinks))
 const output={role:'Targeted whole-canonical pure stock normalization/schema/identity checks; finite additional DFS checks mirror stock validateGraph cycle rules, no full CLI/build/central report',runtimeSchemaOK,runtimeSchemaErrors,semanticSchemaOK,semanticSchemaErrors,canonicalFindings,directCycles,containsCycles,effectiveCycles,missingReferences:missing,sourceFingerprintsCurrent:canonical.goals.every((g:any)=>(decisions.get(g.id) as any).sourceFingerprint===book.fingerprintSemanticKindSourceGoal(g)),compositionChecks,oldIdsRetained:base.goals.every((g:any)=>goalById.has(g.id)),changedOld,newIds:Object.values(ctx.newIds),unchangedScience,imageLinksExact,counts:ledger.counts,newStrict:0,newIndependentVotes:0,actualRuntimeHelper:'prepareLandscapeEntries in app/src/hooks/useLandscapes.ts',coreExamples:runtimeGoals.filter((g:any)=>ctx.old11.includes(g.id)||Object.values(ctx.newIds).includes(g.id)).map((g:any)=>({goalId:g.id,core:g.core,tags:g.tags})),fullRequiredValidationClaimed:false}
 write('checks/whole-canonical-stock-schema-runtime-composition-identity.actual.json',output)
 write('checks/BOUNDARY-and-context-impact.actual.json',{role:'Relation/context impact only; no unchanged-science re-review',changedOld,unchangedScience,needsCurrentContextReview:changedOld.map((g:any)=>g.goalId),strictNeighbor31781:{scientificTextExact:true,ownRequiresExact:true,newCanonicalContextParent:'fb41c82c-12c3-5f9a-9e8d-40f10c9fade9',singleVisiblePlacementDemonstratedOnlyInOwnInactiveViews:true,newD:0,newP:0,newA:0,newM:0,newV:0},strictNeighbore7:{scientificTextExact:true,requiresChangedFromAggregateToSafetyAtoms:true,newParentCf:true,needNewPageOrContextBindingReview:true,newScienceApproval:0},aggregateTerminal:'14577339 retains its existing requires byte-exact. The old cluster IDs still reach all new child duties; no new global exam requirement is inferred or changed here.',allOriginalImagesLinksExact:imageLinksExact,newStrict:0})
 const fail=!runtimeSchemaOK||!semanticSchemaOK||canonicalFindings.some((f:any)=>f.severity==='error')||directCycles.length||containsCycles.length||effectiveCycles.length||missing.length||profileChecks.some(c=>!c.schemaOK||c.productionSemanticErrors.length)||compositionChecks.some(c=>c.findings.some((f:any)=>f.severity==='error')||c.duplicateVisibleGoals.length)||!output.sourceFingerprintsCurrent||!imageLinksExact||unchangedScience.some((s:any)=>!s.scientificTextExact||!s.imageLinksExact)
 console.log(JSON.stringify({passed:!fail,canonicalGoals:canonical.goals.length,proposedCurricularAtomic:ledger.counts.curricularAtomic,rawProfiles:records.length,directCycles:directCycles.length,containsCycles:containsCycles.length,effectiveCycles:effectiveCycles.length,composition:compositionChecks.map(c=>({name:c.name,targets:c.targetCurricularAtomic,errors:c.findings.filter((f:any)=>f.severity==='error').length})),newVotes:0,newStrict:0}))
 if(fail)process.exitCode=1
}
main().catch(e=>{console.error(e);process.exitCode=1})
