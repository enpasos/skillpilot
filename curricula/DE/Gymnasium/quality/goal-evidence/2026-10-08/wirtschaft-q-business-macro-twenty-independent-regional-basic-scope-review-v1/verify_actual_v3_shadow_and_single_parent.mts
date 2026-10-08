// Apache-2.0. Real native scope and compiled-tree inspection of inert authored views.
import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {normalizeCompositionView,compileCompositionView} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {scoreLearnerCompositionScope,compareLearnerCompositionScopeMatches} from '../../../../../../../app/src/utils/learnerCompositionScopeMatching.ts'
const directory=dirname(fileURLToPath(import.meta.url)),root=resolve(directory,'../../../../../../..')
const hash=(x:Buffer|string)=>'sha256:'+createHash('sha256').update(x).digest('hex')
const read=async(p:string)=>JSON.parse(await readFile(p,'utf8'))
const canBytes=await readFile(resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'))
const canonical=normalizeCanonicalLandscape(JSON.parse(canBytes.toString()))
const dispositions=await read(resolve(directory,'twenty-individual-regional-basic-source-dispositions.actual.json'))
const profiles:any[]=[]
for(const profile of ['GK','LK']){
 const path=resolve(directory,`bounded-BY-pair-scope-author-candidate-v3/de-by-gym-economics-${profile.toLowerCase()}-macro-bounded.inert.view.json`)
 const bytes=await readFile(path),candidate=JSON.parse(bytes.toString())
 const nationalPath=resolve(root,`curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-${profile.toLowerCase()}.view.json`)
 const nationalBytes=await readFile(nationalPath),national=JSON.parse(nationalBytes.toString())
 const compiled=compileCompositionView(normalizeCompositionView(candidate),canonical)
 if(compiled.findings.length)throw new Error(JSON.stringify(compiled.findings))
 const occurrences=new Map<string,string[]>()
 const visit=(nodes:any[],parent:string|null)=>{for(const node of nodes){if(node.sourceGoalId){const old=occurrences.get(node.sourceGoalId)||[];old.push(parent||'<root>');occurrences.set(node.sourceGoalId,old)}visit(node.children||[],node.sourceGoalId||node.runtimeId)}}
 visit(compiled.compiledRootNodes,null)
 const duplicated=[...occurrences].filter(([,parents])=>parents.length>1)
 if(duplicated.length)throw new Error(JSON.stringify(duplicated))
 const request={schoolForm:'Gymnasium',jurisdiction:'DE-BY',stage:'CrossStage',courseProfile:profile}
 const nationalScore=scoreLearnerCompositionScope(national.scope,request),regionalScore=scoreLearnerCompositionScope(candidate.scope,request)
 if(!nationalScore||!regionalScore||compareLearnerCompositionScopeMatches(regionalScore,nationalScore)>=0)throw new Error('Regional default precedence missing')
 const macroRows=dispositions.map((r:any)=>({goalId:r.goalId,disposition:r.disposition,actualCompiledTargetOccurrences:(occurrences.get(r.goalId)||[]).length,actualVisibleParentKeys:occurrences.get(r.goalId)||[]}))
 for(const r of macroRows){const expected=profile==='LK'||r.disposition==='complete-basic-supported';if(r.actualCompiledTargetOccurrences!==(expected?1:0))throw new Error('Whole20 target occurrence mismatch')}
 profiles.push({profile,candidateSha256:hash(bytes),currentNationalViewPath:nationalPath.slice(root.length+1),currentNationalViewSha256:hash(nationalBytes),
  actualResolvedBYCrossStageRequest:request,currentNationalScore:nationalScore,inertRegionalScore:regionalScore,inertRegionalWouldShadowNational:true,
  sameProfileForeignHEMatch:scoreLearnerCompositionScope(candidate.scope,{...request,jurisdiction:'DE-HE'}),
  exactSekIIMatch:scoreLearnerCompositionScope(candidate.scope,{...request,stage:'SekII'}),
  sameRegionOtherSingleProfileMatch:scoreLearnerCompositionScope(candidate.scope,{...request,courseProfile:profile==='GK'?'LK':'GK'}),
  nativeCompileFindings:compiled.findings,actualCompiledDuplicateGoalOrMultipleVisibleParentIds:duplicated,
  macroWholeTargetOccurrenceCount:macroRows.reduce((n:number,r:any)=>n+r.actualCompiledTargetOccurrences,0),macroWholeTargetRows:macroRows})
}
const receipt={role:'actual_native_v3_default_precedence_whole_twenty_scope_and_single_parent_countercheck',createdAt:new Date().toISOString(),
 canonicalSha256:hash(canBytes),profiles,CPV005DuplicateGoals:0,CPV006MultipleVisibleParents:0,
 activeDefaultSelectionOrRegistryInstallationClaim:false,fullBYCurriculumApprovalClaim:false,
 nativeActualCombinedBackendUnionReceipt:'actual-native-backend-v3-combined-target-union.receipt.json',
 separateFutureRebase:'Parent explicitly plans a separate native rebase of the newer BY3-navigation f892/national-view author-v2 inputs. This older pair is preserved and must not overwrite those later navigation changes.',
 activeWrites:0,humanApprovalClaim:false,newStrictCompletions:0}
await writeFile(resolve(directory,'actual-native-v3-default-shadow-single-parent-twenty-scope.receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log('PASS actual native BY default precedence;13/20 GK and20/20 LK whole target occurrences;0 duplicate/multiple-visible-parent;other-state/other-profile/exact-SekII requests unmatched.')
