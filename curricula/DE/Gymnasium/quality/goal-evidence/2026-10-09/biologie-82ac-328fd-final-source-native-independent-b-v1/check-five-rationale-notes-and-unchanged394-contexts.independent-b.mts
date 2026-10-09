// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts';
import {buildGoalBookModel,parseAndValidateGoalBookModel,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts';
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts';
import {buildGoalDescriptionCanonicalContext} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts';
import {fingerprintGoalDescriptionReviewContext,fingerprintGoalDescriptionReviewPage} from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution.ts';
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/',own=base+'biologie-82ac-328fd-final-source-native-independent-b-v1/',previous=base+'biologie-82ac-nine-lower-jurisdictions-and-SN-ST-digital-prerequisite-source-author-v1/',a=base+'biologie-82ac-SN-ST-primary-operator-rationale-additive-author-v2/';
const read=(p:string):any=>JSON.parse(readFileSync(p,'utf8'));
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex');
const entry=read(a+'neutral-two-whole-SN-ST-primary-operator-rationales.final-author-successor.independent-review.entry.json'),diffs:any[]=[];
const exactDiff=(old:any,current:any,p=''):any[]=>{
 if(stableGoalBookJson(old)===stableGoalBookJson(current))return[];
 if(Array.isArray(old)&&Array.isArray(current)&&old.length===current.length)return old.flatMap((x,i)=>exactDiff(x,current[i],p+'/'+i));
 if(old&&current&&typeof old==='object'&&typeof current==='object'&&!Array.isArray(old)&&!Array.isArray(current))return [...new Set([...Object.keys(old),...Object.keys(current)])].sort().flatMap(k=>exactDiff(old[k],current[k],p+'/'+k));
 return[{pointer:p,before:old,after:current}];
};
for(const pair of entry.wholeActualBeforeAfterMapPairs){
 const old=read(pair.wholeBefore.path),current=read(pair.wholeAfter.path),changes=exactDiff(old,current);
 assert.deepEqual(current.mappings,old.mappings);
 assert.ok(changes.every((d:any)=>d.pointer==='/note'||/^\/decisions\/\d+\/rationale$/u.test(d.pointer)));
 assert.equal(changes.length,pair.state==='SN'?2:3);
 diffs.push({jurisdiction:pair.state,wholeBefore:pair.wholeBefore,wholeAfter:pair.wholeAfter,onlyActualRationaleAndNoteChanges:changes,wholeEdgesAndNonRationaleDecisionsExact:true});
}
const cfg=read(entry.correctedNormalBookSourceAtlasConfig.path),oldCfg=read(previous+'candidate/whole394-final-normal-source-atlas.inactive.config.json');
const atlas=buildGoalBookSourceAtlasInputs(cfg,'.'),oldAtlas=buildGoalBookSourceAtlasInputs(oldCfg,'.');
assert.deepEqual(atlas.receipt.counts,oldAtlas.receipt.counts);
assert.deepEqual(atlas.receipt.scopes.map(s=>({key:s.key,goalIds:s.goalIds})),oldAtlas.receipt.scopes.map(s=>({key:s.key,goalIds:s.goalIds})));
const bookCfg=read(previous+'candidate/whole394-final-normal-book.inactive.config.json'),raw=read(cfg.landscapePath),kinds=read(bookCfg.semanticKindLedgerPath),qa=read(bookCfg.goalVisualizationQaPath),digests:Record<string,string>={};
for(const row of qa.records)if(row.visualizationState==='available'){const hash=sha(readFileSync(row.publicAssetPath));assert.equal(hash,row.assetSha256);digests[row.imageUrl]=hash;}
const manifest=JSON.parse(atlas.outputs[cfg.manifestPath]);
const model=buildGoalBookModel({landscape:raw,semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:digests,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((p:string)=>({path:p,view:JSON.parse(atlas.outputs[p])})),navigationView:JSON.parse(atlas.outputs[manifest.navigationViewPath]),durationModelPolicy:read(manifest.durationModelPolicyPath),evidenceReviewSources:[],config:bookCfg});
parseAndValidateGoalBookModel(model);assert.deepEqual(model,read(entry.whole394FinalNormalModel.path));
const oldModel=read(previous+'native/full394-after-source-locator-and-requires.normal-model.actual.json');
assert.equal(model.pages.length,394);assert.deepEqual(model.pages,oldModel.pages);
const input=read(previous+'native/actual-two/round-b/description-review-input.json'),originalTwo=read(previous+'native/actual-two/book-model.json');
const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:input.goals.map((g:any)=>g.goalId),bookId:originalTwo.book.id,title:originalTwo.book.title});
const bindings=input.goals.map((old:any)=>{const g=raw.goals.find((g:any)=>g.id===old.goalId),page=subset.pages.find(p=>p.goalId===old.goalId)!;
 assert.deepEqual(page,old.reviewContext.page);
 const current={...old,goalFingerprint:page.goalFingerprint,pageFingerprint:fingerprintGoalDescriptionReviewPage(page),canonicalContext:buildGoalDescriptionCanonicalContext(g),reviewContext:{page,evidenceProfile:old.reviewContext.evidenceProfile}};
 assert.deepEqual(current,old);
 return{goalId:old.goalId,goalFingerprint:current.goalFingerprint,pageFingerprint:current.pageFingerprint,contextFingerprint:fingerprintGoalDescriptionReviewContext(current),wholeContextExactlyGenuinelyReviewedPreviousInput:true};
});
const operative=read(entry.correctedOrdinaryIntegrationBindings.path),oldOperative=read(previous+'candidate/ordinary-QS-additive-reviewed-Source7-and-current-views.inactive-binding-manifest.json');
assert.equal(operative.replaceOldMappingFiles,false);assert.equal(operative.oldValidGenMutationMappingsPreserved,true);
const aliases=operative.ordinaryOperativePathSuccessors.map((row:any)=>{const old=oldOperative.ordinaryOperativePathSuccessors.find((x:any)=>x.state===row.state);assert.ok(old);assert.equal(row.addNewOrdinaryMappingPath,old.addNewOrdinaryMappingPath);assert.deepEqual(row.wholeCurrentLearnerView,old.wholeCurrentLearnerView);assert.deepEqual(row.wholeProposedCurrentLearnerView,old.wholeProposedCurrentLearnerView);assert.deepEqual(row.actualSourceExtractionCandidate,old.actualSourceExtractionCandidate);assert.deepEqual(row.existingBaseMappingExact,old.existingBaseMappingExact);return{jurisdiction:row.state,exactSameAdditiveNormalDestination:row.addNewOrdinaryMappingPath,previousSourceMapping:old.wholeExactReviewedSource7Candidate,currentSourceMapping:row.wholeExactReviewedSource7Candidate,onlyScientificRationaleNotesChanged:true,ordinaryCoverageClassificationInputsExact:true};});
writeFileSync(own+'five-rationale-note-fields-and-unchanged394-D2-native-P2-contexts.actual.json',JSON.stringify({schemaVersion:1,license:'CC-BY-4.0',role:'Own normal targeted rationale/source path comparison after own targeted science-FIRST',wholeMapDiffs:diffs,actualFiveFieldCount:5,normalSourceAtlasCounts:atlas.receipt.counts,all24ScopeGoalSetsExact:true,whole394PagesAndAllFingerprintsExact:true,actualOldNativeAndP2Unmodified:true,normalD2WholeGoalContextsExact:bindings,correctedOrdinaryIntegrationBindings:entry.correctedOrdinaryIntegrationBindings,correctedNormalBookSourceAtlasConfig:entry.correctedNormalBookSourceAtlasConfig,additiveNormalPathAliases:aliases,previousOwnOrdinaryCompilerCoveragePredicateReusedFromExactClassificationInputs:true,previousOwnNormalSNSTSourceCoverageCounts:{SN:'181/181',ST:'182/182'},globalCQR003Claim:false,wholeSourceStageOrCourseApproval:false,humanApproval:false,strictGain:0,activeWrites:0},null,2)+'\n');
console.log(JSON.stringify({actualRationaleNoteFields:5,sourceAtlas:atlas.receipt.counts,whole394PagesAndFingerprintsExact:true,currentD2Bindings:bindings,normalOperativeAliasDestinationsExact:true,priorOwnSNSTCoverageProofReusedFromExactClassificationInputs:true,newSubjectCompletions:0}));
