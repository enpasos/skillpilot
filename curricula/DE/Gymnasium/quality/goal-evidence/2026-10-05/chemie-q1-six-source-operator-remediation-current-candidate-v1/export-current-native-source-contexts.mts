// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { buildGoalBookOriginalSources, serializeGoalBookOriginalSources } from '../../../../../../../app/scripts/goalBookOriginalSources'
import { parseGoalBookOriginalSources } from '../../../../../../../app/src/utils/goalBookOriginalSources'
import { parseAndValidateGoalBookModel } from '../../../../../../../app/scripts/goalBookModel'
const root=process.cwd(),own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-six-source-operator-remediation-current-candidate-v1'
if(!root.endsWith('/tmp/chemie-q1-six-source-operator-native-isolated-20261005-v1'))throw Error('Own isolated tree required')
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const write=(p:string,v:any)=>writeFileSync(resolve(root,p),JSON.stringify(v,null,2)+'\n')
const sha=(p:string)=>createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const atlas=parseAndValidateGoalBookModel(readFileSync(resolve(root,own+'/prospective-source-atlas.book-model.json'),'utf8'))
const input=read('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
const sources=buildGoalBookOriginalSources(atlas,root,input.mappingPaths)
parseGoalBookOriginalSources(sources,atlas)
writeFileSync(resolve(root,own+'/source-atlas-full.current-original-sources.json'),serializeGoalBookOriginalSources(sources))
const finaldir=read(own+'/batch.config.json').outputDirectory; const book=parseAndValidateGoalBookModel(readFileSync(resolve(root,finaldir+'/bundle/book-model.json'),'utf8'))
const sourceAuthor=read(own+'/source-operator-scope-and-originals.author-candidate.json')
const authorById=new Map(sourceAuthor.sourceBindingRows.map((r:any)=>[r.goalId,r]))
const current=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const goals=new Map(current.goals.map((g:any)=>[g.id,g]))
const context=book.pages.map(p=>{
 const facets=sources.goals[p.goalId]??[]
 const evIds=new Set(facets.flatMap(f=>f.evidenceIds))
 const evidence=sources.evidence.filter(v=>evIds.has(v.id))
 const docIds=new Set(evidence.map(v=>v.documentId))
 return {goalId:p.goalId,currentGoal:goals.get(p.goalId),nativeDGoalFingerprint:p.goalFingerprint,nativeDPageFingerprint:p.pageFingerprint,currentSourceAtlasFacets:facets,actualBoundSourceEvidence:evidence,actualBoundSourceDocuments:sources.documents.filter(v=>docIds.has(v.id)),authorSourceBoundary:authorById.get(p.goalId)??null,missingFromOfficialSourceAtlas:!sources.goals[p.goalId],directFullNormativeWidthApprovalClaimed:false}
})
write(own+'/eight-current-originals-and-authored-scope.context.json',{authority:'native current source metadata plus explicitly separate informed author proposal; independent source review pending',bookDigest:book.digest,bookModelSHA256:sha(finaldir+'/bundle/book-model.json'),sourceAtlasModelDigest:atlas.digest,sourceIndexSHA256:sha(own+'/source-atlas-full.current-original-sources.json'),explicitSelectedMappingPaths:input.mappingPaths,goalContexts:context,newFullSourceUmbrellaClosures:0,humanApproval:false,humanTrial:false,activeWrites:0})
console.log(JSON.stringify({nativeSourceIndexValidated:true,sourceAtlasGoals:atlas.pages.length,actualDGoalContexts:context.length,notInOfficialAtlas:context.filter(v=>v.missingFromOfficialSourceAtlas).map(v=>v.goalId),independentSourceApproval:false,activeWrites:0}))
