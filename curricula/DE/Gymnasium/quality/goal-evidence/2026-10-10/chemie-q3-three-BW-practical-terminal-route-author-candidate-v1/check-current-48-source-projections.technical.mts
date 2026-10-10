// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,dirname,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
const R=resolve('.'),D=dirname(fileURLToPath(import.meta.url)),P=relative(R,D),read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'))
const b=read(P+'/inputs/whole484-active-canonical.exact.json'),a=read(P+'/candidate/whole487-381-plus-three-practical-terminals.inactive.json'),k=read(P+'/inputs/whole484-381-active-semantic-kinds.exact.json')
const curIds=new Set(k.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId)),bg=new Map(b.goals.map((g:any)=>[g.id,g])),ag=new Map(a.goals.map((g:any)=>[g.id,g]))
const manifestPath='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json',manifest=read(manifestPath)
const rows=manifest.sourcePaths.map((path:string)=>{
 const v=normalizeCompositionView(read(path)),bc=compileCompositionView(v,normalizeCanonicalLandscape(b)),ac=compileCompositionView(v,normalizeCanonicalLandscape(a))
 assert.equal(bc.findings.filter(f=>f.severity==='error').length,0);assert.equal(ac.findings.filter(f=>f.severity==='error').length,0)
 const before=[...collectCompositionProjectionRoleGoalIds(v.rootNodes,bg as any).targetGoalIds].filter(id=>curIds.has(id)).sort(),after=[...collectCompositionProjectionRoleGoalIds(v.rootNodes,ag as any).targetGoalIds].filter(id=>curIds.has(id)).sort()
 assert.deepEqual(after,before)
 return {sourceViewPath:path,scope:v.scope,actualWholeCurricularTargetGoalIds:after,ordinaryTargetsBeforeAndAfterExact:true,beforeNormalFindings:bc.findings,afterNormalFindings:ac.findings}
})
assert.equal(rows.length,48)
const union=new Set(rows.flatMap((r:any)=>r.actualWholeCurricularTargetGoalIds));assert.equal(union.size,362)
writeFileSync(resolve(D,'checks/normal-all48-source-views362-ordinary-targets-exact.actual.json'),JSON.stringify({schemaVersion:1,normalApis:['compileCompositionView','collectCompositionProjectionRoleGoalIds'],actualSourceManifestPath:manifestPath,sourceViews:48,ordinaryNationalTargetUnion:union.size,all48WholeCurricularTargetGoalSetsExact:true,practiceAssessmentNodesExcludedFromOrdinaryTargetSet:true,actualSourceScopes:rows,nationalRendererOrFullPublicationVerifierPassClaimed:false,wholeSourceCourseOrProgrammeApproval:false,activeWrites:0},null,2)+'\n')
console.log('Normal 48 source-view compilation: all whole ordinary target ID sets exact, national union362, no practice/content expansion.')
