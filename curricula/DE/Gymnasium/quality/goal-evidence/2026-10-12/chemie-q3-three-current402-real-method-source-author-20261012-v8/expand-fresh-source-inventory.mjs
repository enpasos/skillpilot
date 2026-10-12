import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import {fileURLToPath} from 'node:url'
const base=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(base,'../../../../../../..')
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),rel=p=>path.relative(root,p),ref=p=>({path:rel(p),bytes:fs.statSync(p).size,sha256:'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}),write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n')
const first=read(path.join(base,'FIRST.actual-author-v8-inputs-CAS.json')),ids=first.goalIds,build=read(path.join(base,'sources/fresh-index-build-inputs.json')),land=read(path.join(base,'candidate/canonical523.exact-v7-live-preserving.inactive.json')),canonical=new Map(land.goals.map(g=>[g.id,g]))
const cache=new Map(),get=p=>{if(!cache.has(p))cache.set(p,read(path.join(root,p)));return cache.get(p)}
const snapshots=read(path.join(path.dirname(base),'chemie-q3-three-current402-live-context-author-20261012-v7/baseline/source-atlas.inputs.current-active.exact.json')).sourceDocumentSnapshots
for(const when of ['before','after']){
 const indexPath=path.join(base,'sources/fresh-'+when+'.normal-original-source-index.json'),index=read(indexPath),maps=build[when+'MappingPaths'],rows=[],sourceGoals={},passages={},documents={},partners={},normalized=[]
 for(const id of ids){
  const scopes=index.goals[id],idsOfEvidence=new Set(scopes.flatMap(s=>s.evidenceIds)),evidence=index.evidence.filter(e=>idsOfEvidence.has(e.id));normalized.push(...evidence.map(e=>({goalId:id,...e,scopes:scopes.filter(s=>s.evidenceIds.includes(e.id)),document:index.documents.find(d=>d.id===e.documentId)})))
  const relevantTargets=new Set([id,...evidence.map(e=>e.mappedTargetGoalId)])
  for(const mappingPath of maps){
   const mapping=get(mappingPath),exPath=mapping.sourceExtractionPath,ex=get(exPath),bySource=new Map(ex.sourceGoals.map(g=>[g.id,g])),byPassage=new Map(ex.passages.map(p=>[p.id,p]))
   for(const decision of mapping.decisions){
    if(decision.decision!=='mapped')continue
    for(const target of decision.canonicalGoalIds){
     if(!relevantTargets.has(target))continue
     const g=bySource.get(decision.sourceGoalId);assert.ok(g)
     const p=byPassage.get(g.passageId),sourceRef=g.sourceRef||p?.sourceRef||[g.topicCode||p?.topicCode,typeof(g.sourcePage??p?.page)==='number'?'S. '+(g.sourcePage??p?.page):''].filter(Boolean).join(', ')
     const key=exPath+'#'+g.id,passageKey=exPath+'#'+g.passageId
     const representative=evidence.filter(e=>e.mappedTargetGoalId===target&&e.sourceScope.jurisdiction===ex.jurisdiction&&e.sourceRef===sourceRef)
     // Direct raw decisions are always included, even when no normalized tuple
     // currently represents them. Inherited decisions are included only for
     // a mapped ancestor actually used by the fresh normal index, with every
     // literal sibling sourceGoal on that same document locator exposed.
     if(target!==id&&!representative.length)continue
     sourceGoals[key]={sourceExtractionPath:exPath,wholeSourceGoal:g};passages[passageKey]={sourceExtractionPath:exPath,wholePassage:p??null}
     const document=ex.sourceDocuments?.find(d=>d.id===g.sourceDocumentKey||d.key===g.sourceDocumentKey)||ex.sourceDocument
     if(document)documents[exPath]={sourceExtractionPath:exPath,wholeDocument:document,extractionScope:{jurisdiction:ex.jurisdiction,stage:ex.stage},snapshot:snapshots.find(s=>s.url===document.url)||null}
     for(const partner of decision.canonicalGoalIds){assert.ok(canonical.has(partner));partners[partner]=canonical.get(partner)}
     const compat=mapping.mappings.filter(m=>m.legacyGoalId===g.id&&m.canonicalGoalId===target)
     rows.push({goalId:id,rawSourceGoalId:g.id,mappedTargetGoalId:target,relation:target===id?'direct':'inherited-relevant-normal-ancestor',mappingPath,sourceExtractionPath:exPath,sourceGoalKey:key,passageKey,actualLiteralClause:g.sourceText??g.description,wholeMappingDecision:decision,wholeCompatibilityMappings:compat,normalizedEvidenceIds:representative.map(e=>e.id),representedByItsOwnSourceGoalId:representative.some(e=>e.sourceGoalId===g.id),normalizedAliasOrOmission:representative.length&&!representative.some(e=>e.sourceGoalId===g.id)?'citation-dedup-hidden-literal-sourceGoal':representative.length?'direct-current-representative':'raw-direct-operator-without-current-normal-citation',wholeClauseCompleted:false,ownComponentJudgment:'HOLD_PENDING_AUTHOR_COMPONENT_READING',fullSourceUnionClaim:false})
    }
   }
  }
 }
 const keys=rows.map(r=>[r.goalId,r.mappingPath,r.rawSourceGoalId,r.mappedTargetGoalId].join('|'));assert.equal(new Set(keys).size,keys.length)
 const output={schemaVersion:1,role:'AUTHOR exhaustive current raw mapping/source operator inventory, expanded from FRESH unchanged normal index; no independent vote',when,freshNormalSourceIndex:ref(indexPath),mappingPaths:maps,counts:{normalizedGoalEvidenceRows:normalized.length,rawMappedGoalRows:rows.length,uniqueRawSourceGoals:Object.keys(sourceGoals).length,hiddenLiteralAliasRows:rows.filter(r=>r.normalizedAliasOrOmission==='citation-dedup-hidden-literal-sourceGoal').length},normalizedEvidenceTuples:normalized,rawRows:rows,sourceGoals,wholePassages:passages,wholeDocuments:documents,wholeCanonicalPartnerGoals:partners,evidenceIdIsNotStableSemanticIdentity:true,sourceGoalIdsAndRawDecisionIdsPreserved:true,fullSourceCompletionClaims:0,activeWrites:false,HumanApproval:false,HumanTrial:false}
 write(path.join(base,'sources/'+when+'.all-raw-sourceGoal-operators-and-fresh-normal-citations.inventory.json'),output)
 const compact=rows.map(r=>r.goalId+' | '+r.rawSourceGoalId+' | '+r.actualLiteralClause+' | partners:'+r.wholeMappingDecision.canonicalGoalIds.map(id=>canonical.get(id).title).join('; ')).join('\n')+'\n'
 fs.writeFileSync(path.join(base,'sources/'+when+'.all-raw-literal-clauses.for-author-reading.txt'),compact)
 console.log(JSON.stringify({when,...output.counts,fullSourceClaims:0}))
}
