import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,join,dirname,relative} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../../../../../..'),qa=join(here,'qa-artifacts')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const bind=(p:string)=>({path:relative(root,p),sha256:createHash('sha256').update(readFileSync(p)).digest('hex'),bytes:readFileSync(p).length})
const {normalizeCanonicalLandscape}=await import(pathToFileURL(join(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const {compileCompositionView}=await import(pathToFileURL(join(root,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const baseline=read(join(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'))
const candidate=read(join(qa,'DE_DEU_S_GYM_CANONICAL_CHEMIE.native-author-candidate.json'))
const oldKinds=read(join(root,'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'))
const newKinds=read(join(qa,'chemie.semantic-kinds.native-author-candidate.json'))
const attachKinds=(landscape:any,ledger:any)=>{const map=new Map(ledger.decisions.map((row:any)=>[row.goalId,row.semanticKind]));return normalizeCanonicalLandscape({...landscape,goals:landscape.goals.map((goal:any)=>({...goal,semanticKind:map.get(goal.id)}))})}
const before=attachKinds(baseline,oldKinds),after=attachKinds(candidate,newKinds)
const parentIds=['7be6f951-a614-52dc-94d3-2ce0d33765ff','53fd1bfd-facb-54ae-b2dc-f667ed1414fc']
const manifestPath=join(root,'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json'),manifest=read(manifestPath)
const affected=[]
for(const path of manifest.sourcePaths){
 const view=read(join(root,path)),refs:any[]=[]
 const visit=(nodes:any[])=>{for(const node of nodes){if(parentIds.includes(node.goalId))refs.push({kind:node.kind,goalId:node.goalId,projectionRole:node.projectionRole??'target'});if(node.children)visit(node.children)}}
 visit(view.rootNodes)
 if(!refs.length)continue
 const oldResult=compileCompositionView(view,before),newResult=compileCompositionView(view,after)
 const oldKeys=new Set(oldResult.findings.map((finding:any)=>JSON.stringify(finding)))
 affected.push({sourceViewBinding:bind(join(root,path)),viewId:view.viewId,scope:view.scope,actualAffectedReferences:refs,
 actualNewFindings:newResult.findings.filter((finding:any)=>!oldKeys.has(JSON.stringify(finding))),
 convertedClusterGoalEntryFindings:newResult.findings.filter((finding:any)=>finding.code==='CPV-009'&&parentIds.includes(finding.goalId)),
 currentViewChangedByReviewer:false,futureFacetAndChildSelectionStatus:'HOLD pending actual narrow source/operator/stage decisions; do not blindly expand old broad references into all new routines'})
}
writeFileSync(join(here,'actual-affected-existing-source-view-reference-and-placement-holds.json'),JSON.stringify({schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'actual unchanged production composition compiler, narrowly affected existing references only; author prep not national approval',
 sourceManifestBinding:bind(manifestPath),productionHelperBinding:bind(join(root,'app/src/utils/authoring/compositionViewAuthoring.ts')),semanticKindsAttachedOnlyInTemporaryCompileData:true,
 configuredSourceViewCount:manifest.sourcePaths.length,actuallyAffectedSourceViewCount:affected.length,affectedViews:affected,
 wholeNationalSourceCoverageClaim:false,newActiveViewWrites:0,humanApproval:false,nativeApproval:false,strictCompletionsAdded:0},null,2)+'\n')
console.log(JSON.stringify({affectedSourceViews:affected.length,convertedClusterGoalEntryFindings:affected.reduce((n,row)=>n+row.convertedClusterGoalEntryFindings.length,0),activeWrites:0}))
