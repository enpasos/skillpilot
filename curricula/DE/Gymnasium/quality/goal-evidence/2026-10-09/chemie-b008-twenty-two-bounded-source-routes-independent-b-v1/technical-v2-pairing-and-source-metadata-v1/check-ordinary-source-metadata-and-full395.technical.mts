// SPDX-License-Identifier: Apache-2.0
// Existing ordinary APIs, exact current schema initializers; no validator or gate modification.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import ts from '../../../../../../../../app/node_modules/typescript/lib/typescript.js'
import Ajv2020 from '../../../../../../../../app/node_modules/ajv/dist/2020.js'
import { buildGoalBookSourceAtlasInputs, sourceAtlasFacet, sourceAtlasDescendants } from '../../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { normalizeCanonicalLandscape } from '../../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import { collectCompositionProjectionRoleGoalIds, normalizeCompositionView } from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
const root=resolve('.'), own=dirname(fileURLToPath(import.meta.url))
const bind=(path:string)=>{const raw=readFileSync(resolve(root,path));return {path:relative(root,resolve(root,path)),sha256:createHash('sha256').update(raw).digest('hex'),bytes:raw.length}}
const read=(path:string)=>JSON.parse(readFileSync(resolve(root,path),'utf8'))
const write=(name:string,v:any)=>{const p=resolve(own,name);assert.ok(!existsSync(p));writeFileSync(p,JSON.stringify(v,null,2)+'\n');return bind(p)}
const configPath=relative(root,resolve(own,'whole395-source22-reviewed-metadata.ordinary-inputs.candidate-only.json'))
const config=read(configPath), metadata=read(relative(root,resolve(own,'actual49-reviewed-metadata-59-partial-edge-22-role-binding.receipt.json')))
const mappingPath=metadata.normalMappingSuccessor.path, extractionPath=metadata.unchangedExactSourceExtraction.path
const mapping=read(mappingPath), extraction=read(extractionPath)
const authorMappingPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1/twenty-two-bounded-source-routes-author-v2/BY-twenty-two-partial-source-routes.ordinary-mapping.author-candidate.json'
// Read exact existing schema initializers without importing the export builder (no export build).
const schemaSourcePath='app/scripts/buildSkillpilotExportPackage.ts', schemaSource=readFileSync(schemaSourcePath,'utf8')
const sf=ts.createSourceFile(schemaSourcePath,schemaSource,ts.ScriptTarget.Latest,true)
const initializers=new Map<string,string>()
function visit(n:any){if(ts.isVariableDeclaration(n)&&ts.isIdentifier(n.name)&&n.initializer&&['MAPPING_SCHEMA','SOURCE_EXTRACTION_SCHEMA'].includes(n.name.text))initializers.set(n.name.text,n.initializer.getText(sf));ts.forEachChild(n,visit)}visit(sf)
assert.equal(initializers.size,2)
const ajv=new Ajv2020({allErrors:true,strict:false})
const probe=(which:string,body:any)=>{const literal=initializers.get(which)!;const actualSchema=runInNewContext('('+literal+')');const validate=ajv.compile(actualSchema);return {existingSchemaConstant:which,initializerSHA256:createHash('sha256').update(literal).digest('hex'),valid:!!validate(body),errors:validate.errors?JSON.parse(JSON.stringify(validate.errors)):[]}}
const schemaChecks={schemaSource:bind(schemaSourcePath),authorMappingHistoricalFailure:probe('MAPPING_SCHEMA',read(authorMappingPath)),ordinarySuccessorMapping:probe('MAPPING_SCHEMA',mapping),unchangedSourceExtraction:probe('SOURCE_EXTRACTION_SCHEMA',extraction)}
assert.equal(schemaChecks.authorMappingHistoricalFailure.valid,false)
assert.ok(schemaChecks.authorMappingHistoricalFailure.errors.some((e:any)=>e.instancePath==='/status'&&e.keyword==='type'))
assert.equal(schemaChecks.ordinarySuccessorMapping.valid,true)
assert.equal(schemaChecks.unchangedSourceExtraction.valid,true)
write('exact-normal-schemas-targeted-source-successor.actual.receipt.json',{schemaVersion:1,role:'Targeted actual AJV 2020 validation against exact existing exported schema definitions; not an export-package build or approval',schemaChecks,authorStatusStringFailureRetained:true,successorStatusObjectOnlyMetadataCorrection:true,humanApproval:false,strictGain:0})
const canonical=read(config.landscapePath), ledger=read(config.semanticKindLedgerPath)
const goals=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g])), atoms=new Set<string>(ledger.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
assert.equal(atoms.size,395);assert.equal(config.expectedCurricularAtomicGoalCount,395);assert.equal(config.expectedUnresolvedScopeDecisionCount,496)
assert.equal(mapping.sourceLandscapeId,extraction.sourceLandscapeId);assert.equal(mapping.targetLandscapeId,canonical.landscapeId)
assert.equal(mapping.decisions.length,49);assert.equal(extraction.sourceGoals.length,49);assert.equal(mapping.mappings.length,59)
const sources=new Map<string,any>(extraction.sourceGoals.map((s:any)=>[s.id,s])), passages=new Map<string,any>(extraction.passages.map((p:any)=>[p.id,p]))
const selectedScopes:any[]=[];const selectedResolved=new Set<string>(),selectedUnresolved=new Set<string>()
for(const d of mapping.decisions){
 assert.ok(typeof d.reviewer==='string'&&d.reviewer.length>0);assert.ok(typeof d.reviewedAt==='string'&&d.reviewedAt.length>0);assert.ok(d.rationale.length>0)
 const s=sources.get(d.sourceGoalId),p=passages.get(s.passageId);assert.ok(s&&p)
 const stage=sourceAtlasFacet([s,p,extraction.sourceDocument,extraction],'stage'),course=sourceAtlasFacet([s,p,extraction.sourceDocument,extraction],'courseProfile')
 const scoped=course!==null&&stage?.length===1&&(stage[0]==='SekI'||course.length>0)
 for(const id of d.canonicalGoalIds){assert.deepEqual(sourceAtlasDescendants(id,goals,atoms,canonical.landscapeId),[id]);const e=mapping.mappings.filter((x:any)=>x.legacyGoalId===s.id&&x.canonicalGoalId===id);assert.equal(e.length,1);assert.equal(e[0].matchType,'partial');(scoped?selectedResolved:selectedUnresolved).add(id);selectedScopes.push({sourceGoalId:s.id,sourceSpan:s.sourceSpan,goalId:id,stage,courseProfile:course,actualGrade:s.extendedData.scopedWholeOriginalClauseRole.actualGrade,actualTrack:s.extendedData.scopedWholeOriginalClauseRole.actualTrack,actualScopeResolved:scoped,wholeSourceClearance:false})}
}
assert.equal(new Set(selectedScopes.map(s=>s.goalId)).size,22);assert.equal(selectedResolved.size,21);assert.deepEqual([...selectedUnresolved],['e5a5dcd8-053c-55fd-b5c7-bba93779da53'])
assert.ok(selectedScopes.filter(s=>s.sourceSpan.startsWith('C12-GA.')).every(s=>JSON.stringify(s.courseProfile)==='["GK"]'))
assert.ok(selectedScopes.filter(s=>s.sourceSpan.startsWith('C11.')).every(s=>JSON.stringify(s.courseProfile)==='[]'))
assert.ok(selectedScopes.filter(s=>s.stage?.[0]==='SekI').every(s=>JSON.stringify(s.courseProfile)==='[]'))
const outputPaths=[config.outputDirectory,config.manifestPath,config.navigationViewPath];const outputsBefore=outputPaths.map((p:string)=>({path:p,exists:existsSync(p)}))
assert.ok(outputsBefore.every((x:any)=>!x.exists))
let actualFailure:any=null
try{const built=buildGoalBookSourceAtlasInputs(config,root);actualFailure={unexpectedSuccess:true,computedOutputs:Object.keys(built.outputs??{}),writtenOutputs:[]}}catch(e:any){actualFailure={name:e.name,message:e.message,actual:e.actual??null,expected:e.expected??null,operator:e.operator??null,stack:e.stack}}
const outputsAfter=outputPaths.map((p:string)=>({path:p,exists:existsSync(p)}));assert.deepEqual(outputsBefore,outputsAfter)
assert.equal(actualFailure.message,'Source-scope uncertainty changed; inspect rather than guess')
assert.equal(actualFailure.actual,497);assert.equal(actualFailure.expected,496)
// Diagnostics use existing source helper APIs and the unchanged ordinary authored fallback rules.
// This is an explanation after real rejection, never an alternative atlas validator.
const landscape=normalizeCanonicalLandscape(canonical)
const fallbacks=(config.fallbackViewPaths??[]).map((p:string)=>{const v=normalizeCompositionView(read(p));const r=collectCompositionProjectionRoleGoalIds(v.rootNodes,new Map(landscape.goals.map((g:any)=>[g.id,g])));return {path:p,view:v,targets:r.targetGoalIds}})
const witnesses=new Map<string,any[]>();const unresolvedDecisions:any[]=[];const allMappingBindings:any[]=[];const beforeBindings=new Map<string,any>()
for(const path of config.mappingPaths){const m=read(path),ex=read(m.sourceExtractionPath);allMappingBindings.push({mapping:bind(path),sourceExtraction:bind(m.sourceExtractionPath)});beforeBindings.set(path,bind(path));beforeBindings.set(m.sourceExtractionPath,bind(m.sourceExtractionPath));const ss=new Map<string,any>(ex.sourceGoals.map((s:any)=>[s.id,s])),ps=new Map<string,any>(ex.passages.map((s:any)=>[s.id,s]));
 for(const d of m.decisions){if(d.decision!=='mapped')continue;const s=ss.get(d.sourceGoalId);assert.ok(s);const p=ps.get(s.passageId)??{};const documents=ex.sourceDocuments?.length?ex.sourceDocuments:[ex.sourceDocument];const keys=[...new Set([s.sourceDocumentKey,p.sourceDocumentKey,...(s.tags??[]).filter((t:string)=>t.startsWith('sourceDocument:')).map((t:string)=>t.slice(15))].filter(Boolean))];assert.ok(keys.length<=1);const docs=keys.length?documents.filter((x:any)=>x.key===keys[0]):documents;assert.equal(docs.length,1);const doc=docs[0];const stage=sourceAtlasFacet([s,p,doc,ex],'stage'),course=sourceAtlasFacet([s,p,doc,ex],'courseProfile');const scoped=course!==null&&stage?.length===1&&(stage[0]==='SekI'||course.length>0);if(!scoped)unresolvedDecisions.push({mappingPath:path,sourceGoalId:s.id,jurisdiction:ex.jurisdiction,stage,courseProfile:course});
 for(const id of d.canonicalGoalIds){for(const atom of sourceAtlasDescendants(id,goals,atoms,canonical.landscapeId)){const fb=(!scoped&&stage?.[0]==='SekII'&&course?.length===0)?fallbacks.filter((x:any)=>x.view.scope.jurisdiction===ex.jurisdiction&&x.targets.has(atom)):[];const route={mappingPath:path,sourceGoalId:s.id,mappedTarget:id,sourceSpan:s.sourceSpan,jurisdiction:ex.jurisdiction,stage,courseProfile:course,officialSourceScopeResolved:scoped,sourceScopeRoutePresent:scoped||fb.length>0,...(fb.length?{authoredFallbackViewPaths:fb.map((x:any)=>x.path)}:{})};witnesses.set(atom,[...(witnesses.get(atom)??[]),route])}}
 }
}
assert.equal(unresolvedDecisions.length,497)
const all395=[...atoms].sort().map(id=>({goalId:id,title:goals.get(id)?.title,sourceRouteScopeStatus:(witnesses.get(id)??[]).some(w=>w.sourceScopeRoutePresent)?'SCOPED_ROUTE_PRESENT_NOT_WHOLE_SOURCE_APPROVAL':(witnesses.get(id)??[]).length?'MAPPED_BUT_UNRESOLVED_SCOPE_HOLD':'NO_CURRENT_SOURCE_ROUTE_HOLD',actualScopeWitnesses:witnesses.get(id)??[]}))
const supported=all395.filter(g=>g.sourceRouteScopeStatus==='SCOPED_ROUTE_PRESENT_NOT_WHOLE_SOURCE_APPROVAL'),missing=all395.filter(g=>g.sourceRouteScopeStatus!=='SCOPED_ROUTE_PRESENT_NOT_WHOLE_SOURCE_APPROVAL')
assert.equal(all395.length,395);assert.equal(supported.length,375);assert.equal(missing.length,20)
const exactHoldIds=['057a6826-f599-53b1-bdd1-5a83037a1494','0c9fe376-0fbd-5dc1-b8d4-d56d658a00e3','10f657bc-6044-5fbb-ba8e-6e5ba55d2bc5','18819a59-2442-530f-a7c3-26755398ec66','1a51362e-fd84-5964-89b5-b435772c2149','39c85aa0-b01f-56ec-a148-b8009bf650f5','8edee6b6-9ead-515e-93f5-feada64522b2','a8ddb351-3501-5b6d-a908-c82a5d2f14d4','cdd4ee76-5b37-54ee-b238-63db71205af0','e0d4f08a-3e67-5e2b-9c4a-06468ec5c3dd','f0f2c5f8-06f1-5774-a176-d96505727acf','3351fe47-5b0c-5407-a3bf-05229cfbf0c5','7b443158-8ca9-5b8e-8328-a8fa56f6e26f','dc4a26c7-8304-529d-8705-7333b2f038fc','e6dcd3a0-264d-503b-aaac-a3e86eeb7059','ebe2f6db-95a3-5157-a27d-2624f6c82e4e','fb41c82c-12c3-5f9a-9e8d-40f10c9fade9','fec1563e-a34a-5fc1-93bb-03981f35ab13','ffebca5e-76b5-55d7-80d6-df1e7d2c75ea','e5a5dcd8-053c-55fd-b5c7-bba93779da53'].sort()
assert.deepEqual(missing.map(x=>x.goalId).sort(),exactHoldIds)
for(const [p,b] of beforeBindings)assert.deepEqual(bind(p),b)
const diagnostic=write('actual-full395-source-scope-diagnosis.after-real-normal-HOLD.json',{schemaVersion:1,role:'Read-only explanation of actual existing ordinary atlas rejection, using existing scope/descendant helpers; not another validator or source science review',config:bind(configPath),wholeCurricularUniverse:395,expectedUnresolvedScopeCountUnchanged:496,actualUnresolvedScopeCount:497,actualCandidateScopePresentCount:375,actualStillMissingCount:20,missingWholeGoalBodies:missing.map(g=>({wholeGoal:goals.get(g.goalId),actualRouteDiagnostics:g})),all395GoalRouteDiagnostics:all395,allMappingsAndExtractions:allMappingBindings,unchanged8BcPCourseHolds:true,C11CourseStillUnspecified:true,unchanged11Outside26RouteHolds:true,actualOrdinaryCompilerFailure:actualFailure,sourceAtlasApproval:false,opaque17ViewsProtected8ContextsSeparateAndUntouched:true,activeWrites:[],humanApproval:false,humanTrial:false,strictGain:0,newScientificClosures:0,restoredBindings:0})
const receipt=write('ordinary-source22-targeted-metadata-and-full395-API.actual.receipt.json',{schemaVersion:1,role:'Actual existing pure normal source-atlas API invocation and targeted source helper checks; no outputs written',config:bind(configPath),mapping:bind(mappingPath),sourceExtraction:bind(extractionPath),existingAPI:bind('app/scripts/goalBookSourceAtlasInputs.ts'),script:bind(relative(root,fileURLToPath(import.meta.url))),actual49ClauseMetadataComplete:true,actual59EdgesPartial:true,actual22RoleCount:22,actual21ResolvedAnd1C11CourseHold:true,selectedSourceScopes:selectedScopes,targetedSchemaChecks:schemaChecks,actualOrdinaryCompilerTerminal:{exitCode:1,...actualFailure},ordinaryGlobalAtlasPASS:false,original395And496GuardsKept:true,normalGateNotPatchedOrMocked:true,outputsBefore,outputsAfter,diagnostic,originalMappingsAndSourceInputsUnchanged:true,activeWrites:[],humanApproval:false,strictGain:0})
console.log(JSON.stringify({receipt,diagnostic,actualOrdinaryAtlasExitCode:1,actualCompilerFailure:actualFailure.message,actualUnresolved:497,expectedUnresolved:496,wholeAtoms:395,scopedDiagnosticRoutes:375,remainingScopeHolds:20,newGain:0}))
process.exitCode=1
