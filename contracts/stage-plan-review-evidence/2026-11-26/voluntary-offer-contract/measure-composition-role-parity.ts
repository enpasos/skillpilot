// SPDX-License-Identifier: Apache-2.0
// Run from the repository root with app/node_modules/.bin/tsx.
// --baseline-report=<retained report> reuses exact, hash-bound baseline previews/findings; it still rechecks the legacy role collector.
// --baseline=<commit> defaults to the immutable VR1 takeover; --output=<path> retains per-view evidence outside the repository.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {mkdtempSync,readFileSync,readdirSync,writeFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join,relative} from 'node:path'
import {pathToFileURL} from 'node:url'
import {performance} from 'node:perf_hooks'

async function main() {
const repo=process.cwd(), base=process.argv.find(arg=>arg.startsWith('--baseline='))?.slice(11)??'7fea24d7c5', scratch=mkdtempSync(join(tmpdir(),'vr1-role-parity-'))
try {
writeFileSync(join(scratch,'package.json'), JSON.stringify({type:'module'}))
for(const name of ['canonicalAuthoring','compositionViewAuthoring']) writeFileSync(join(scratch,`${name}.ts`),execFileSync('git',['show',`${base}:app/src/utils/authoring/${name}.ts`],{cwd:repo}))
const compilerSha256='sha256:'+createHash('sha256').update(readFileSync(join(repo,'app/src/utils/authoring/compositionViewAuthoring.ts'))).digest('hex')
const previous=await import(pathToFileURL(join(scratch,'compositionViewAuthoring.ts')).href)
const current=await import(pathToFileURL(join(repo,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const canon=await import(pathToFileURL(join(repo,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const load=(path:string)=>JSON.parse(readFileSync(path,'utf8'))
const baselineReportPath=process.argv.find(arg=>arg.startsWith('--baseline-report='))?.slice(18)
const baselineReportText=baselineReportPath?readFileSync(baselineReportPath,'utf8'):undefined
const retainedBaseline=baselineReportText?JSON.parse(baselineReportText):undefined
if(retainedBaseline)assert.equal(retainedBaseline.summary.base,base,'Retained baseline commit must match the requested immutable baseline.')
const baselineRows=new Map<string,any>(retainedBaseline?.views.map((row:any)=>[row.view,row])??[])
const directory=join(repo,'curricula/DE/Gymnasium')
const landscapes=readdirSync(join(directory,'canonical')).filter(name=>name.endsWith('.de.json')).map(name=>canon.normalizeCanonicalLandscape(load(join(directory,'canonical',name))))
const byId=new Map(landscapes.map((landscape:any)=>[landscape.landscapeId,landscape]))
const universe={landscapeId:'parity-universe',title:'Parity universe',goals:landscapes.flatMap((landscape:any)=>landscape.goals)}
const goals=new Map(universe.goals.map((goal:any)=>[goal.id,goal]))
const roots=new Map(landscapes.flatMap((landscape:any)=>{const root=landscape.goals.find((goal:any)=>goal.tags?.includes('root'));return root?[[landscape.landscapeId,root.id]]:[]}))
const walk=(path:string):string[]=>readdirSync(path,{withFileTypes:true}).flatMap(item=>item.isDirectory()?walk(join(path,item.name)):item.name.endsWith('.view.json')?[join(path,item.name)]:[])
const files=walk(join(directory,'composition-views')).sort()
if(retainedBaseline)assert.deepEqual([...baselineRows.keys()].sort(),files.map(file=>relative(directory,file)).sort(),'Retained baseline must cover exactly the current view inventory.')
let originalMs=retainedBaseline?.summary.baselineCompileMs??0,currentMs=0,targetMemberships=0
const perSubject:Record<string,number>={}
const rows:unknown[]=[]
const sorted=(values:Iterable<string>)=>[...values].sort()
const digest=(values:Iterable<string>)=>'sha256:'+createHash('sha256').update(JSON.stringify(sorted(values))).digest('hex')
let authoredAtomicTargets=0,inducedAtomicTargets=0,implicitPreparationAtoms=0
for(const file of files){
 const view=load(file), label=relative(directory,file)
 const oldRoles=previous.collectCompositionProjectionRoleGoalIds(view.rootNodes,goals,roots)
 const newRoles=current.collectCompositionProjectionRoleGoalIds(view.rootNodes,goals,roots)
 assert.deepEqual([...newRoles.targetGoalIds].sort(),[...oldRoles.targetGoalIds].sort(),`${label}:target membership`)
 assert.deepEqual([...newRoles.prerequisiteOnlyGoalIds].sort(),[...oldRoles.prerequisiteOnlyGoalIds].sort(),`${label}:preparation membership`)
 assert.equal(newRoles.voluntaryGoalIds.size,0,label)
 targetMemberships+=newRoles.targetGoalIds.size
 const oldTargetAtoms=sorted(oldRoles.targetGoalIds).filter(id=>goals.has(id)&&goals.get(id).type!=='cluster'&&!goals.get(id).contains.length)
 const oldPreparationAtoms=sorted(oldRoles.prerequisiteOnlyGoalIds).filter(id=>goals.has(id)&&goals.get(id).type!=='cluster'&&!goals.get(id).contains.length)
 const inducedTargets=sorted(newRoles.targetAtomicGoalIds).filter(id=>!oldRoles.targetGoalIds.has(id))
 const implicitPreparations=sorted(newRoles.prerequisiteOnlyAtomicGoalIds).filter(id=>!oldRoles.prerequisiteOnlyGoalIds.has(id))
 authoredAtomicTargets+=oldTargetAtoms.length;inducedAtomicTargets+=inducedTargets.length;implicitPreparationAtoms+=implicitPreparations.length
 rows.push({view:label,viewId:view.viewId,formatVersion:view.viewFormatVersion??'1.0',
   authoredTargets:{beforeCount:oldRoles.targetGoalIds.size,afterCount:newRoles.targetGoalIds.size,beforeDigest:digest(oldRoles.targetGoalIds),afterDigest:digest(newRoles.targetGoalIds)},
   authoredPreparations:{beforeCount:oldRoles.prerequisiteOnlyGoalIds.size,afterCount:newRoles.prerequisiteOnlyGoalIds.size,beforeDigest:digest(oldRoles.prerequisiteOnlyGoalIds),afterDigest:digest(newRoles.prerequisiteOnlyGoalIds)},
   atoms:{authoredTargets:oldTargetAtoms.length,targets:newRoles.targetAtomicGoalIds.size,targetDigest:digest(newRoles.targetAtomicGoalIds),inducedTargetGoalIds:inducedTargets,
     authoredPreparations:oldPreparationAtoms.length,preparations:newRoles.prerequisiteOnlyAtomicGoalIds.size,preparationDigest:digest(newRoles.prerequisiteOnlyAtomicGoalIds),implicitPreparationGoalIds:implicitPreparations,
     voluntary:newRoles.voluntaryAtomicGoalIds.size}})
 const cached=baselineRows.get(label)
 let oldResult:any,start=performance.now()
 if(cached){
  assert.equal(cached.authoredTargets.beforeDigest,digest(oldRoles.targetGoalIds),`${label}:retained regular roles`)
  assert.equal(cached.authoredPreparations.beforeDigest,digest(oldRoles.prerequisiteOnlyGoalIds),`${label}:retained preparation roles`)
  assert.match(cached.baselinePreviewDigest,/^sha256:[0-9a-f]{64}$/)
  assert.match(cached.baselineFindingsDigest,/^sha256:[0-9a-f]{64}$/)
 }else{
  oldResult=previous.compileCompositionView(view,byId.get(view.landscapeId),universe,byId);originalMs+=performance.now()-start
 }
 start=performance.now();const newResult=current.compileCompositionView(view,byId.get(view.landscapeId),universe,byId);currentMs+=performance.now()-start
 const currentPreviewDigest='sha256:'+createHash('sha256').update(JSON.stringify(newResult.compiledRootNodes)).digest('hex')
 const currentFindingsDigest='sha256:'+createHash('sha256').update(JSON.stringify(newResult.findings)).digest('hex')
 const baselinePreviewDigest=cached?.baselinePreviewDigest??'sha256:'+createHash('sha256').update(JSON.stringify(oldResult.compiledRootNodes)).digest('hex')
 const baselineFindingsDigest=cached?.baselineFindingsDigest??'sha256:'+createHash('sha256').update(JSON.stringify(oldResult.findings)).digest('hex')
 assert.equal(currentPreviewDigest,baselinePreviewDigest,`${label}:preview`)
 assert.equal(currentFindingsDigest,baselineFindingsDigest,`${label}:findings`)
 Object.assign(rows[rows.length-1] as object,{baselinePreviewDigest,currentPreviewDigest,baselineFindingsDigest,currentFindingsDigest})
 if(rows.length%50===0)console.log(`Compared ${rows.length}/${files.length} source views.`)
 const subject=label.split('/')[1];perSubject[subject]=(perSubject[subject]??0)+1
}
const summary={base,compilerSha256,baselineComparison:retainedBaseline?'retained exact baseline digests':'fresh baseline compilation',baselineEvidenceSha256:baselineReportText?'sha256:'+createHash('sha256').update(baselineReportText).digest('hex'):null,views:files.length,canonicalSubjects:landscapes.length,perSubject,targetMemberships,authoredAtomicTargets,inducedAtomicTargets,implicitPreparationAtoms,roleSetDifferences:0,previewDifferences:0,findingDifferences:0,baselineCompileMs:Math.round(originalMs),newCompileMs:Math.round(currentMs),runtimeRatio:retainedBaseline?null:Number((currentMs/originalMs).toFixed(3))}
const output=process.argv.find(arg=>arg.startsWith('--output='))?.slice(9)
if(output)writeFileSync(output,JSON.stringify({summary,views:rows},null,2)+'\n')
console.log(JSON.stringify(summary,null,2))
} finally {rmSync(scratch,{recursive:true,force:true})}
}
main().catch(error=>{console.error(error);process.exitCode=1})
