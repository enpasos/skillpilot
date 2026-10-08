// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const own = dirname(fileURLToPath(import.meta.url));
const root = resolve(own, '../../../../../../..');
const author = join(dirname(own), 'chemie-b008-source-view-placements-author-resumed-v1');
const previous = join(dirname(own), 'chemie-b008-sl-specific-source-continuation-author-root-20261008-v21');
const ownRel = relative(root, own);
const capsule = join(root, 'tmp/chemie-b008-bw-paired-source-atlas-continuation-technical-resumed-v1-capsule');
const read = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));
const bind = (p: string) => { const b = readFileSync(p); return {path: relative(root, p), sha256: createHash('sha256').update(b).digest('hex'), bytes: b.length}; };
const write = (p: string, v: any) => {
  assert.ok(p.startsWith(own + '/') || p.startsWith(capsule + '/'), 'Owned write boundary');
  mkdirSync(dirname(p), {recursive: true}); writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
};
const copy = (p: string) => { const out=join(capsule,p); mkdirSync(dirname(out), {recursive:true}); copyFileSync(join(root,p),out); return out; };
const pinnedBefore = read(join(own, 'paired-nine-normal-fields.integration.actual.json'));
for (const b of pinnedBefore.independentEvidence) assert.deepEqual(bind(join(root,b.path)), b);
const pairedMapping = pinnedBefore.pairedInactiveMapping.path;
const {normalizeCanonicalLandscape,validateCanonicalLandscape} = await import(pathToFileURL(join(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href);
const {compileCompositionView,collectCompositionProjectionRoleGoalIds,normalizeCompositionView} = await import(pathToFileURL(join(root,'app/src/utils/authoring/compositionViewAuthoring.ts')).href);
const {loadGoalBookBuildInputs} = await import(pathToFileURL(join(root,'app/scripts/goalBookModel.ts')).href);
const {buildGoalBookSourceAtlasInputs,sourceAtlasFacet,sourceAtlasDescendants} = await import(pathToFileURL(join(root,'app/scripts/goalBookSourceAtlasInputs.ts')).href);
const config = read(join(author,'checks/bw-pending-before-sl.normal-source-atlas.config.json'));
assert.equal(config.expectedCurricularAtomicGoalCount,395);
assert.equal(config.expectedUnresolvedScopeDecisionCount,496);
const authorMap = relative(root,join(author,'candidate-source-mappings/BW-SekI.source-mapping.author-candidate.json'));
config.mappingPaths=config.mappingPaths.map((p: string)=>p===authorMap?pairedMapping:p);
const raw=read(copy(config.landscapePath));
const kinds=read(copy(config.semanticKindLedgerPath));
const goals=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]));
const atoms=new Set<string>(kinds.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId));
assert.equal(raw.goals.length,504); assert.equal(atoms.size,395);
const typed=normalizeCanonicalLandscape({...raw,goals:raw.goals.map((g:any)=>({...g,semanticKind:kinds.decisions.find((d:any)=>d.goalId===g.id).semanticKind}))});
assert.deepEqual(validateCanonicalLandscape(normalizeCanonicalLandscape(raw)).filter((f:any)=>f.severity==='error'),[]);
for(const p of [config.durationModelPolicyPath,...config.fallbackViewPaths])copy(p);
for(const p of config.mappingPaths){const m=read(copy(p)); const e=read(copy(m.sourceExtractionPath)); for(const d of [...(e.sourceDocuments??[]),...(e.sourceDocument?[e.sourceDocument]:[])])if(d.path&&existsSync(join(root,d.path)))copy(d.path);}
for(const n of ['SekI','SekII']){const p=relative(root,join(previous,`candidate-source-mappings/${n}.source-mapping.author-candidate.json`));const m=read(copy(p));copy(m.sourceExtractionPath);}
const outcomes=[];
for(const which of ['paired-bw-original-sl','paired-bw-pending-sl']){
  const c=structuredClone(config);
  if(which==='paired-bw-pending-sl')c.mappingPaths=c.mappingPaths.map((p:string)=>p.includes('DE-SL/lower-secondary')?relative(root,join(previous,'candidate-source-mappings/SekI.source-mapping.author-candidate.json')):p.includes('DE-SL/upper-secondary')?relative(root,join(previous,'candidate-source-mappings/SekII.source-mapping.author-candidate.json')):p);
  const cp=join(own,`checks/${which}.ordinary-source-atlas.config.json`);write(cp,c);write(join(capsule,relative(root,cp)),c);
  let result:any;
  try {const built=buildGoalBookSourceAtlasInputs(c,capsule);result={status:'PASS',counts:built.receipt.counts};}
  catch(e:any){result={status:'HOLD',exactOrdinaryError:String(e.message)};}
  assert.equal(result.status,'HOLD');
  if(which==='paired-bw-original-sl')assert.equal(result.exactOrdinaryError,'Source-supported atlas goal count changed\n\n357 !== 395\n');
  else assert.equal(result.exactOrdinaryError,'Missing reviewed mapping decision metadata: sl-chem-seki-sl-ch-seki-8-2024-p013-004-e3b97259');
  outcomes.push({case:which,config:bind(cp),...result,guard395Unchanged:true,guard496Unchanged:true,returnedAtlasOutputs:false,generatedAtlasFilesWritten:0});
}

// Diagnostics only: reuse exported ordinary facet/descendant rules and the exact
// authorized fallback memberships. The normal build above keeps its 395 guard.
const fallback=config.fallbackViewPaths.map((p:string)=>{const view=normalizeCompositionView(read(join(capsule,p)));const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(normalizeCanonicalLandscape(raw).goals.map((g:any)=>[g.id,g])));return{path:p,view,targets:roles.targetGoalIds};});
const sourceCatalog=new Map<string,any>();
const witnesses:any[]=[];const scopedUnion=new Set<string>();const mappedUnion=new Set<string>();let unresolvedCount=0;
const naiveDesc=(id:string):Set<string>=>{const seen=new Set<string>();const visit=(rid:string)=>{const x=rid.replace(raw.landscapeId+':','');if(seen.has(x))return;seen.add(x);for(const ch of goals.get(x)?.contains??[])visit(ch);};visit(id);return seen;};
const sourceRoutes:any[]=[];
for(const mp of [...config.mappingPaths].sort()){
  const mapping=read(join(capsule,mp));const ex=read(join(capsule,mapping.sourceExtractionPath));
  const sg=new Map<string,any>(ex.sourceGoals.map((g:any)=>[g.id,g]));const passages=new Map<string,any>(ex.passages.map((p:any)=>[p.id,p]));
  const docs=[...(ex.sourceDocuments??[])];if(!docs.length&&ex.sourceDocument)docs.push(ex.sourceDocument);
  for(const d of mapping.decisions){
    assert.ok(d.reviewer&&d.reviewedAt&&d.rationale,d.sourceGoalId);if(d.decision!=='mapped')continue;
    const g=sg.get(d.sourceGoalId);const p=passages.get(g.passageId)??{};
    const keys=[g.sourceDocumentKey,...(g.tags??[]).filter((x:string)=>x.startsWith('sourceDocument:')).map((x:string)=>x.slice(15)),p.sourceDocumentKey].filter(Boolean);
    const matching=keys.length?docs.filter((x:any)=>x.key===keys[0]):docs;assert.equal(matching.length,1,d.sourceGoalId);const doc=matching[0];
    const stage=sourceAtlasFacet([g,p,doc,ex],'stage');const course=sourceAtlasFacet([g,p,doc,ex],'courseProfile');
    const scoped=course!==null&&stage?.length===1&&(stage[0]==='SekI'||course.length>0);if(!scoped)unresolvedCount++;
    const ref=mp+'::'+d.sourceGoalId;
    sourceCatalog.set(ref,{sourceRef:ref,mappingPath:mp,sourceExtractionPath:mapping.sourceExtractionPath,sourceGoalId:d.sourceGoalId,jurisdiction:ex.jurisdiction,wholeSourceGoal:g,wholePassage:p,sourceDocument:doc,normalDecision:d,sourceStage:stage,sourceCourseProfile:course,explicitSourceScoped:scoped,genuinePairedReviewBoundHere:Boolean(d.independentlyFrozenPairedReview)});
    for(const t of d.canonicalGoalIds){
      const target=t.replace(raw.landscapeId+':','');const normal=sourceAtlasDescendants(target,goals,atoms,raw.landscapeId);const naive=naiveDesc(target);
      sourceRoutes.push({sourceRef:ref,mappedTargetGoalId:target,normalAtoms:normal,naiveDescendants:naive});
      for(const id of normal){mappedUnion.add(id);let scopes:string[]=[];
        if(scoped&&stage)scopes=stage[0]==='SekI'?[ex.jurisdiction+'/SekI']:course.map((c:string)=>ex.jurisdiction+'/SekII/'+c);
        else if(stage?.[0]==='SekII'&&course?.length===0)scopes=fallback.filter((f:any)=>f.view.scope.jurisdiction===ex.jurisdiction&&f.targets.has(id)).map((f:any)=>ex.jurisdiction+'/SekII/'+f.view.scope.courseProfile);
        if(scopes.length)scopedUnion.add(id);witnesses.push({sourceRef:ref,mappedTargetGoalId:target,goalId:id,scopes});
      }
    }
  }
}
assert.equal(unresolvedCount,496);assert.equal(scopedUnion.size,357);
const missing=[...atoms].filter(id=>!scopedUnion.has(id)).sort();assert.equal(missing.length,38);
const dutyPath=pinnedBefore.whole1646OriginalDutyWitness.path;copy(dutyPath);const duties=read(join(capsule,dutyPath)).originalWholeDuties;assert.equal(duties.length,1646);
const missingRows=missing.map(id=>{
  const goal=goals.get(id);const provenance=goal.extendedData?.provenance??{};
  const relevant=sourceRoutes.filter(r=>r.naiveDescendants.has(id));
  const refs=[...new Set(relevant.map(r=>r.sourceRef))].sort();
  const direct=relevant.filter(r=>r.mappedTargetGoalId===id);const normal=relevant.filter(r=>r.normalAtoms.includes(id));
  const original=duties.filter((d:any)=>refs.some(ref=>sourceCatalog.get(ref).sourceGoalId===d.sourceGoalId)&&relevant.some(r=>r.mappedTargetGoalId===d.familyGoalId));
  return{goalId:id,title:goal.title,routineCandidateKey:provenance.routineCandidateKey??null,wholeGoal:goal,
    sourceBindingDiagnostic:direct.length?'direct mapping exists; source explicitly says SekII/courseLevel unspecified; no authorized BY course placement fallback':'no direct child mapping in these 32 current atlas inputs',
    directMappedSourceRefs:direct.map(r=>r.sourceRef),normalExpandedSourceRefs:normal.map(r=>r.sourceRef),
    originalFamilyPartnerSourceRefs:refs,blockedAncestorMappings:relevant.filter(r=>!r.normalAtoms.includes(id)).map(r=>({sourceRef:r.sourceRef,mappedTargetGoalId:r.mappedTargetGoalId,reason:'normal sourceAtlasDescendants excludes separately sourced boundary child; family evidence does not approve new child'})),
    wholeOriginalFamilyDutyIndexes:original.map((d:any)=>d.originArrayIndex),
    actualGapGroup:direct.length?'eight-BY-practical-authored-course-policy-gaps':provenance.routineCandidateKey?'nineteen-B008-boundary-child-source-binding-gaps':'eleven-historical-HE-RP-content-direct-source-binding-gaps',
    missingFields:direct.length?['reviewed explicit BY Biologisch-chemisches-Praktikum program/course placement model accepted by the ordinary compiler','retain source courseLevel unspecified: do not fabricate GK/LK official metadata','existing source reviewer/reviewedAt/rationale are present; new source review names alone cannot resolve this placement/policy hold']:
      ['independently justified source-specific direct partial/whole binding to this actual whole goal','exact whole source operator/content/context correspondence','explicit source or reviewed authored program placement; stage/course/duration must not be inferred from canonical tags','genuine independent first decisions and paired review provenance for the new binding','normal mapped canonicalGoalIds/raw mappings and reviewer/reviewedAt/rationale after that actual review'],
    scientificApprovalAdded:false,wholeSourceApproval:false};
});
const usedRefs=new Set(missingRows.flatMap(r=>r.originalFamilyPartnerSourceRefs));
const relevantCatalog=[...sourceCatalog.values()].filter(r=>usedRefs.has(r.sourceRef));
const gap={schemaVersion:1,role:'Exact diagnostic of 38 omitted whole goal IDs under unchanged normal 395 guard; candidate routes are not science approvals',createdAtUTC:new Date().toISOString(),
  actualOrdinaryOutcomes:outcomes,exactDiagnosticPrimitiveBindings:['app/scripts/goalBookSourceAtlasInputs.ts','app/src/utils/authoring/compositionViewAuthoring.ts'].map(p=>bind(join(root,p))),
  expectedCurricularAtomicGoals:395,actualSourceSupportedScopedGoals:scopedUnion.size,actualMappedAtomicGoals:mappedUnion.size,actualMissingWholeGoals:missing.length,
  unchangedExpectedUnresolvedScopeDecisionCount:496,actualUnresolvedScopeDecisionCount:unresolvedCount,
  actual357ScopedGoalIDs:[...scopedUnion].sort(),actual38MissingWholeGoals:missingRows,
  sharedActualLinkedWholeSourceEvidence:relevantCatalog,whole1646OriginalDutiesUnmodified:bind(join(root,dutyPath)),
  actualOriginalDutySubset: duties.filter((d:any)=>missingRows.some(r=>r.wholeOriginalFamilyDutyIndexes.includes(d.originArrayIndex))),
  genuinePairedReviewAvailableInThisTechnicalPacket:pinnedBefore.independentEvidence,
  alreadyPairedScope:'BW nine source IDs, twelve partial components, four target roles and one prerequisiteOnly role only',
  SLCurrentCandidateHold:{sourceGoalId:'sl-chem-seki-sl-ch-seki-8-2024-p013-004-e3b97259',fields:read(join(previous,'candidate-source-mappings/SekI.source-mapping.author-candidate.json')).decisions.find((d:any)=>d.sourceGoalId==='sl-chem-seki-sl-ch-seki-8-2024-p013-004-e3b97259'),notApprovedByHashOrInventedReviewer:true},
  guardUnchanged:true,newScientificVerdicts:0,strictGain:0,activeWrites:0,humanApproval:false,humanTrial:false};
write(join(own,'exact38-missing-whole-goals-and-linked-source-evidence.diagnostic.json'),gap);

// Ordinary native material loader with unchanged science, profiles/cases and QA.
const models=[];
for(const name of ['full395','bw-seki-bounded']){
  const nc=read(join(author,`native/${name}.book.config.json`));for(const p of [nc.landscapePath,nc.compositionViewPath,nc.semanticKindLedgerPath,nc.goalVisualizationQaPath])copy(p);
  const qa=read(join(capsule,nc.goalVisualizationQaPath));for(const record of qa.records)if(record.visualizationState==='available')copy(record.publicAssetPath);
  const cp=ownRel+`/native/${name}.book.config.json`;nc.outputPath=ownRel+`/native/${name}.pure-model.json`;write(join(own,`native/${name}.book.config.json`),nc);write(join(capsule,cp),nc);
  const loaded=await loadGoalBookBuildInputs(cp,capsule);write(join(capsule,nc.outputPath),loaded.model);write(join(root,nc.outputPath),loaded.model);
  const original=read(join(author,`native/${name}.pure-model.json`));assert.deepEqual(loaded.model.pages,original.pages,'Native page material changed');
  models.push({name,pages:loaded.model.pages.length,ordinaryLoader:true,exactModel:bind(join(root,nc.outputPath)),allNativePageBodiesExactRetained:true,newDOrPApproval:false,modelIncludesEvidenceReviewPaths:nc.evidenceReviewPaths});
}
assert.equal(models[0].pages,395);assert.equal(models[1].pages,97);
const bwView=read(join(capsule,relative(root,join(author,'source-view-candidates/de-gym-chemie-bundesweit-source-de-bw-seki.bounded-author-candidate.json'))));
const findings=compileCompositionView(bwView,typed).findings;assert.deepEqual(findings.filter((f:any)=>f.severity==='error'),[]);
const roles=collectCompositionProjectionRoleGoalIds(bwView.rootNodes,new Map(typed.goals.map((g:any)=>[g.id,g])));assert.equal(roles.targetGoalIds.size,97);assert.equal(roles.prerequisiteOnlyGoalIds.size,1);assert.ok(roles.prerequisiteOnlyGoalIds.has('5b1bb5d9-07b1-5ba9-b320-cc97be917c60'));
copy(pinnedBefore.whole26Profiles52Cases.path);
const py=spawnSync('python3',['-c',`import json,jsonschema,sys\nfrom pathlib import Path\nr=Path(sys.argv[1]); c=Path(sys.argv[2]); p=sys.argv[3]\njsonschema.validate(json.loads((c/p).read_text()),json.loads((r/'docs/landscape-runtime.schema.json').read_text()))\nprint('ordinary runtime schema passed')\n`,root,capsule,config.landscapePath],{encoding:'utf8'});assert.equal(py.status,0,py.stdout+py.stderr);
const verifiedInputs=[...pinnedBefore.independentEvidence,pinnedBefore.sourceAuthorMapping,pinnedBefore.originalMapping,pinnedBefore.whole1646OriginalDutyWitness,pinnedBefore.whole504Canonical,pinnedBefore.whole26Profiles52Cases];for(const b of verifiedInputs)assert.deepEqual(bind(join(root,b.path)),b);
const receipt={schemaVersion:1,role:'Actual ordinary compiler and native material boundary checks, separate from science reviews',createdAtUTC:new Date().toISOString(),capsuleRoot:relative(root,capsule),normalAtlasOutcomes:outcomes,
  diagnosticScopedUnion:357,diagnosticMissingWholeGoals:38,full395ExpectedGuardUnchanged:true,sourceScope496ExpectedGuardUnchanged:true,
  actualNativeModels:models,ordinaryRuntimeSchemaPassed:true,actualBWViewFindings:findings,BWTargetCount:97,BWPrerequisiteOnlyCount:1,
  whole26ScienceProfiles52CasesUnmodified:verifiedInputs,all1646OriginalDutyBasisUnmodified:true,noNormalAtlasFilesProducedBecauseActualGateHeld:true,
  helperBindings:['app/scripts/goalBookModel.ts','app/scripts/goalBookSourceAtlasInputs.ts','app/src/utils/authoring/compositionViewAuthoring.ts'].map(p=>bind(join(root,p))),
  newScientificVerdicts:0,strictGain:0,activeWrites:0,humanApproval:false,humanTrial:false};
write(join(own,'checks/ordinary-capsule-source-atlas-and-native-materials.actual.json'),receipt);
console.log(JSON.stringify({capsule:receipt.capsuleRoot,models:models.map(m=>[m.name,m.pages]),actualMissingWholeGoals:38,missingTitles:missingRows.map(r=>[r.goalId,r.title]),linkedSourceEvidence:relevantCatalog.length,linkedOriginalDuties:gap.actualOriginalDutySubset.length,normalHolds:outcomes.map(o=>o.exactOrdinaryError)}));
