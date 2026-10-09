// SPDX-License-Identifier: Apache-2.0
// Uses ordinary library checks; transports candidate output bytes only inside this package.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,relative,dirname,basename} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildGoalBookSourceAtlasInputs,GoalBookSourceAtlasInputConfig} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const base=dirname(fileURLToPath(import.meta.url)),repo=resolve(base,'../../../../../../..'),rel=relative(repo,base)
const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const sha=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const put=(p:string,v:unknown)=>{const f=resolve(base,p);mkdirSync(dirname(f),{recursive:true});writeFileSync(f,JSON.stringify(v,null,2)+'\n');return relative(repo,f)}
const bind=(p:string)=>{const b=readFileSync(resolve(repo,p));return {path:p,sha256:sha(b),bytes:b.length}}
const baseCanonical=read(rel+'/input/current-canonical479.exact.json')
const conditionalCanonical=read(rel+'/candidate/current479-plus-one-assessable-behaviour-companion.canonical.json')
const landscape=normalizeCanonicalLandscape(baseCanonical),expanded=normalizeCanonicalLandscape(conditionalCanonical)
const compiled=[]
for(const name of ['de-mv-gym-seki-biology.view.json','de-sn-gym-seki-biology.view.json','de-st-gym-seki-biology.view.json','de-th-gym-seki-biology.view.json','HE-Q1-5-LK-explicitly-selected.view.json','HE-LK-Q2-1-limited-core-source-role-preview.view.json']) {
 const p=rel+'/candidate/composition-views/'+name,view=normalizeCompositionView(read(p)),report=compileCompositionView(view,landscape)
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(landscape.goals.map(g=>[g.id,g])))
 compiled.push({view:bind(p),scope:view.scope,errors:report.findings.filter(f=>f.severity==='error'),warnings:report.findings.filter(f=>f.severity==='warning'),targetGoalIds:[...roles.targetGoalIds].sort(),prerequisiteOnlyGoalIds:[...roles.prerequisiteOnlyGoalIds].sort(),canonicalSnapshotNodes:baseCanonical.goals.length,sourceApproval:false,wholeCourseApproval:false})
}
{
 const p=rel+'/candidate/conditional/RP-SekI-plus-ancestry-behaviour-companion.view.json',view=normalizeCompositionView(read(p)),report=compileCompositionView(view,expanded)
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(expanded.goals.map(g=>[g.id,g])))
 compiled.push({view:bind(p),scope:view.scope,errors:report.findings.filter(f=>f.severity==='error'),warnings:report.findings.filter(f=>f.severity==='warning'),targetGoalIds:[...roles.targetGoalIds].sort(),prerequisiteOnlyGoalIds:[...roles.prerequisiteOnlyGoalIds].sort(),canonicalSnapshotNodes:conditionalCanonical.goals.length,sourceApproval:false,wholeCourseApproval:false,companionSemanticKindApproval:false})
}
put('checks/ordinary-composition-view-compile.actual.json',{schemaVersion:1,ordinaryFunction:'compileCompositionView',viewChecks:compiled,allViewErrorCounts:compiled.map(c=>c.errors.length),scientificApproval:false,humanApproval:false})
const atlasChecks=[]
for (const [name,file,transport] of [
 ['book-catalog-with-optional-Q1.5-witness','candidate/source-atlas.whole479-book-catalog-with-optional-witness.inputs.json','book-catalog'],
 ['mandatory-only-diagnostic-not-complete-book-catalog','candidate/conditional/source-atlas.whole479-mandatory-only-diagnostic.inputs.json','mandatory-only'],
 ['explicit-Q1.5-selection-only','candidate/conditional/source-atlas.whole479-explicit-Q1-5-selection-only.inputs.json','explicit-selected-only']
]) {
 const p=rel+'/'+file,config=read(p) as GoalBookSourceAtlasInputConfig
 try {
  const result=buildGoalBookSourceAtlasInputs(config,repo)
  const transports=[]
  for (const [intended,bytes] of Object.entries(result.outputs)) {
   const suffix=intended.startsWith(config.outputDirectory+'/')?intended.slice(config.outputDirectory.length+1):basename(intended)
   const local=resolve(base,'normal-source-atlas',transport,suffix)
   mkdirSync(dirname(local),{recursive:true});writeFileSync(local,bytes)
   transports.push({intendedOutputPath:intended,candidateTransportPath:relative(repo,local),sha256:sha(bytes),bytes:Buffer.byteLength(bytes),exactNormalFunctionBytes:true,activeWrite:false})
  }
  atlasChecks.push({name,config:bind(p),status:'technical-diagnostic-pass',ordinaryFunction:'buildGoalBookSourceAtlasInputs',counts:result.receipt.counts,sourceApproval:false,defaultIntegrationAllowed:false,bookCatalogOptionalWitness:name.startsWith('book-catalog'),explicitSelectionOnly:name.includes('selection'),ordinaryOutputTransports:transports,sourceClaimsRemainPending:true})
 } catch(e) {
  atlasChecks.push({name,config:bind(p),status:'HOLD',ordinaryFunction:'buildGoalBookSourceAtlasInputs',error:String(e),assertion:(e as any).operator,actual:(e as any).actual,expected:(e as any).expected,sourceApproval:false,defaultIntegrationAllowed:false,expectedDenominatorWasNotLowered:config.expectedCurricularAtomicGoalCount===394})
 }
}
put('checks/ordinary-whole-source-atlas-diagnostics.actual.json',{schemaVersion:1,role:'ordinary-full-input-book-catalog-source-atlas-check-not-scientific-source-or-learner-approval',atlasChecks,canonicalCurrentAtoms:394,allCurrent479GoalObjectsRetained:true,companionExcludedUntilIndependentSemanticKindReview:true,actualLearnerCourseIntegrationPending:true,humanApproval:false,strictGain:0})
console.log(JSON.stringify({ordinaryViewCompiles:compiled.length,viewErrorCounts:compiled.map(c=>c.errors.length),atlasChecks:atlasChecks.map(c=>({name:c.name,status:c.status,error:c.error,actual:c.actual,expected:c.expected,counts:c.counts})),strictGain:0,humanApproval:false}))
if(compiled.some(c=>c.errors.length>0))process.exitCode=1
