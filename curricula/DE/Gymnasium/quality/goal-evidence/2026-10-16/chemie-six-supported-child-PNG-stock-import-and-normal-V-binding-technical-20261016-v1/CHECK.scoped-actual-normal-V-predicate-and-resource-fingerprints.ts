import { readFileSync, writeFileSync, realpathSync, lstatSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import {hasCompletedDeepUnderstandingVisualizationReview} from "/home/enpasos/projects/skillpilot/app/scripts/reportDeepUnderstandingRollout.ts";
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile} from "/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts";
import {fingerprintGoalEvidenceReviewInput} from "/home/enpasos/projects/skillpilot/app/scripts/goalEvidenceProfileModel.ts";
import {fingerprintSemanticKindSourceGoal} from "/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts";
import {isAiApprovedForCurrentAsset} from "/home/enpasos/projects/skillpilot/app/src/utils/goalVisualizationQaStatus.ts";
const R="/home/enpasos/projects/skillpilot";const O="/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-six-supported-child-PNG-stock-import-and-normal-V-binding-technical-20261016-v1";const H="/home/enpasos/projects/skillpilot/tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1";
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex');
const cas=read(resolve(O,'CAS6.whole-child-goals.before-and-stock-resource-link-after.json'));
const current=read(resolve(O,'CANONICAL.current584.six-supported-child-image-resource-links.stock-imported.json'));
const qa=read(resolve(O,'QA455.six-new-child-images.original449-records-exact.json'));
const profileSet=read(resolve(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-split3-six-children-source-transfer-targeted-author-successor-20261016-v1/P6.complete-child-positive-understanding-v2.corrected.author.json'));
const ids=cas.rows.map((r:any)=>r.goalId);const rows:any[]=[];
for(const id of ids){
 const b=cas.rows.find((r:any)=>r.goalId===id).wholeBefore;
 const g=current.goals.find((r:any)=>r.id===id);
 const q=qa.records.filter((r:any)=>r.goalId===id);assert.equal(q.length,1);const v=q[0];
 const links=g.resourceLinks.filter((r:any)=>r.type==='goal-visualization'&&r.role==='primary');assert.equal(links.length,1);const link=links[0];
 assert.equal(v.imageUrl,link.url);assert.equal(v.goalId,g.id);assert.equal(v.title,g.title.replace(/\s+/g,' ').trim());assert.equal(v.description,g.description.replace(/\s+/g,' ').trim());
 assert.equal(v.subject,'chemie');assert.equal(v.landscapeId,current.landscapeId);assert.equal(v.landscapePath,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');assert.equal(v.publicAssetPath,'app/public'+link.url);assert.equal(v.canonicalAssetPath,'curricula/DE/Gymnasium/visualizations/chemie/'+id+'/'+id+'.png');
 assert.equal(v.humanApproved,'no');assert.equal(v.humanIssueIdentified,'no');assert.equal(v.humanReviewedAt,null);assert.equal(v.humanReviewer,'');
 assert.equal(isAiApprovedForCurrentAsset(v),true);assert.equal(hasCompletedDeepUnderstandingVisualizationReview(v),true);
 const paths=[v.canonicalAssetPath,v.publicAssetPath,'backend/src/main/resources/static'+link.url];
 for(const p of paths){const hp=resolve(H,p);assert.equal(lstatSync(hp).isSymbolicLink(),false);assert(realpathSync(hp).startsWith(H+'/'));assert.equal(hash(hp),v.assetSha256);const portable=resolve(O,'staged',p);assert.equal(lstatSync(portable).isSymbolicLink(),false);assert.equal(hash(portable),v.assetSha256);}
 const resourceDigests={[link.url]:v.assetSha256};const profile=profileSet.rows.find((r:any)=>r.goalId===id).profile;
 const goalFP=fingerprintGoalForPositiveEvidence(g,'curricularAtomic');const beforeGoalFP=fingerprintGoalForPositiveEvidence(b,'curricularAtomic');assert.equal(goalFP,beforeGoalFP);
 const semFP=fingerprintSemanticKindSourceGoal(g);assert.equal(semFP,fingerprintSemanticKindSourceGoal(b));
 rows.push({goalId:id,wholeCurrentGoal:g,resourceLinks:g.resourceLinks,resourceDigests,goalFingerprintRuleVersion:'goal-evidence-v1',effectiveSemanticKind:'curricularAtomic',effectiveKindBasis:'Unadopted supported child authoring context; no new active semantic ledger adoption',goalFingerprint:goalFP,semanticKindSourceFingerprint:semFP,goalEvidenceReviewInputFingerprintV1:fingerprintGoalEvidenceReviewInput(g,'goal-evidence-v1',resourceDigests,'curricularAtomic'),unmodifiedWholePositiveProfileFingerprint:fingerprintPositiveGoalEvidenceProfile(profile),normalVPredicate:true,sourcePublicBackendHashMatches:true,portableSourcePublicBackendRegularFilesMatch:true,semanticAndPositiveGoalFingerprintsUnchangedByResourceLinkImport:true});
}
const result={schemaVersion:1,role:'Actual scoped calls to unchanged normal V predicate and normal evidence/resource fingerprint functions; no full central or CLI freshness claim',checked:rows.length,normalVPredicatePassed:rows.length,fullGlobalQaFreshnessCliExecuted:false,reason:'Existing standalone QA CLIs use fixed normal paths and do not support an alternate candidate QA path or six-goal scope. Normal aliases remain untouched. Only exported unchanged predicates and exact bounded source/public/backend bindings were evaluated.',profilePayloadsNotModified:true,newFullPScienceVotes:0,newDescriptionVotes:0,HumanApproval:false,HumanTrial:false,rows};
writeFileSync(resolve(O,'CHECK.actual-scoped-normal-V-and-resource-fingerprints.result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({checked:rows.length,normalVPredicatePassed:rows.length,sourcePublicBackendAllMatches:true,positiveAndSemanticGoalFingerprintsRetained:true}));
