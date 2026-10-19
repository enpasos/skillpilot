// Apache-2.0. Runs exact function bodies extracted from unchanged production files.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
const root=fileURLToPath(new URL('../../../../../../../',import.meta.url))
const require=createRequire(root+'app/package.json'),ts=require('typescript')
const read=p=>JSON.parse(readFileSync(root+p,'utf8'))
function productionFunctions(path,names){
 const source=readFileSync(root+path,'utf8')
 const bodies=names.map(name=>{
  const start=source.indexOf('\nfunction '+name+'(')
  if(start<0)throw Error('Missing production function '+name)
  const finish=source.indexOf('\nfunction ',start+1)
  if(finish<0)throw Error('No function boundary after '+name)
  return {name,source:source.substring(start+1,finish),sourcePath:path}
 })
 const compiled=ts.transpileModule(bodies.map(x=>x.source).join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText
 const functions=new Function('createHash',compiled+'\nreturn {'+names.join(',')+'};')(createHash)
 return {bodies,functions}
}
const ap='app/scripts/semanticAtomicityReview.ts',mp='app/scripts/memoryCardReview.ts'
const A=productionFunctions(ap,['normalizeText','stableJson','getSemanticPayload','fingerprintGoal','isLeaf','isSemanticAtomicityRelevantGoal','collectScopeGoalIds','collectConfiguredScopeGoalIds'])
const M=productionFunctions(mp,['normalizeText','stableJson','fingerprintGoal','isLeaf','isMemoryGoal','isReviewRelevantGoal','collectScopeGoalIds','collectConfiguredScopeGoalIds'])
const b='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/',j=b+'chemie-current454-joint-integration-candidate-technical-20261018-v2/'
const selected=read(j+'LATEST.selected-candidate-state.pending.json'),normalPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const normal=read(normalPath),candidate=read(selected.landscapePath),oldById=new Map(normal.goals.map(g=>[g.id,g])),newById=new Map(candidate.goals.map(g=>[g.id,g]))
const registryPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',registry=read(registryPath),subject=registry.subjects.find(x=>x.subject==='chemie')
const aConfigs=subject.semanticAtomicityConfigPaths.map(path=>{
 const config=read(path),scope=A.functions.collectConfiguredScopeGoalIds(config,oldById),goalIds=[...scope].filter(id=>oldById.has(id)&&A.functions.isLeaf(oldById.get(id))&&A.functions.isSemanticAtomicityRelevantGoal(oldById.get(id)))
 return {path,config,selectedOrdinaryGoalIds:goalIds,candidateFingerprintsAtOriginalRuleVersion:goalIds.map(goalId=>({goalId,fingerprint:A.functions.fingerprintGoal(newById.get(goalId),config.ruleVersion)}))}
})
const fingerprints=candidate.goals.filter(g=>A.functions.isLeaf(g)&&A.functions.isSemanticAtomicityRelevantGoal(g)).map(g=>{
 const a=A.functions.fingerprintGoal(g,'semantic-atomicity-v1'),m=M.functions.fingerprintGoal(g,'memory-card-review-v1')
 if(m!==A.functions.fingerprintGoal(g,'memory-card-review-v1'))throw Error('Production A/M payload disagreement '+g.id)
 return {goalId:g.id,A:a,M:m,AMProductionPayloadEqual:true}
})
const mConfig=read(subject.memoryReviewConfigPath),mIds=[...M.functions.collectConfiguredScopeGoalIds(mConfig,newById)].filter(id=>newById.has(id)&&M.functions.isLeaf(newById.get(id))&&M.functions.isReviewRelevantGoal(newById.get(id)))
if(fingerprints.length!==454||mIds.length!==454)throw Error('Unexpected454 scope')
console.log(JSON.stringify({role:'Technical execution of actual unchanged production function bodies, no new scientific judgment',selectedCandidateState:selected,registryPath,currentMemoryConfigPath:subject.memoryReviewConfigPath,productionFunctions:[...A.bodies,...M.bodies],aConfigs,candidateOrdinaryFingerprints:fingerprints,candidateMOrdinaryIds:mIds},null,2))
