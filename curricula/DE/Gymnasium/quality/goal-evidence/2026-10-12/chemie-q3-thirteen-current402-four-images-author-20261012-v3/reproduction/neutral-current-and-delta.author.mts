import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign';
import { goalEvidenceReviewInputPayload } from '../../../../../../../../app/scripts/goalEvidenceProfileModel';
import { parseAndValidateGoalBookModel } from '../../../../../../../../app/scripts/goalBookModel';

const own = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repo = path.resolve(own, ...Array(7).fill('..'));
const rel = path.relative(repo, own);
const parentRel = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-live-context-author-20261012-v2';
const parent = path.join(repo, parentRel);
const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));
const save = (p: string, d: unknown) => fs.writeFileSync(p, JSON.stringify(d, null, 2)+'\n');
const hash = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const binding = (p: string) => ({path:p,sha256:hash(fs.readFileSync(path.join(repo,p))),bytes:fs.statSync(path.join(repo,p)).size});
const landscape = read(path.join(own, 'inputs/current523.author-successor.de.json'));
const parentLandscape = read(path.join(parent, 'inputs/current523.author-successor.de.json'));
const parentJoin = read(path.join(parent, 'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json'));
const model = parseAndValidateGoalBookModel(fs.readFileSync(path.join(own,'native/whole402.neutral.normal-model.author.actual.json'),'utf8'));
const native = parseAndValidateGoalBookModel(fs.readFileSync(path.join(own,'native/whole13.normal-model.author.actual.json'),'utf8'));
const cases = read(path.join(own,'positive/whole28.material-task-model-scoring-transfer.de-en.author.json'));
const parentCases = read(path.join(parent,'positive/whole28.material-task-model-scoring-transfer.de-en.author.json'));
const records = new Map(fs.readFileSync(path.join(own,'positive/P13.author.review.jsonl'),'utf8').trim().split('\n').map(line=>{const r=JSON.parse(line);return [r.goalId,r];}));
const goals = new Map(landscape.goals.map((g:any)=>[g.id,g]));
const oldGoals = new Map(parentLandscape.goals.map((g:any)=>[g.id,g]));
const pages = new Map(model.pages.map(p=>[p.goalId,p]));
const nativePages = new Map(native.pages.map(p=>[p.goalId,p]));
const changedImages = read(path.join(own,'visualization/five.generated-image-provenance.author.json')).rows;
const changedImageIds = new Set(changedImages.map((r:any)=>r.goalId));
const same = (a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
const stripResources = (g:any)=>Object.fromEntries(Object.entries(g).filter(([k])=>k!=='resourceLinks'));
const canonicalDiffs = landscape.goals.filter((g:any)=>!same(g,oldGoals.get(g.id))).map((g:any)=>({goalId:g.id,fields:Object.keys(g).filter(k=>!same(g[k],(oldGoals.get(g.id) as any)[k]))}));
if(canonicalDiffs.length!==5||canonicalDiffs.some((d:any)=>d.fields.length!==1||d.fields[0]!=='resourceLinks'||!changedImageIds.has(d.goalId)))throw new Error('Expected exactly five visualization resource bindings, no other canonical delta');
for(const g of landscape.goals)if(!same(stripResources(g),stripResources(oldGoals.get(g.id))))throw new Error('Canonical scientific/context fields drifted');
const scienceBody = (c:any)=>Object.fromEntries(Object.entries(c).filter(([k])=>k!=='wholeCurrentGoal'));
const oldCases = new Map(parentCases.cases.map((c:any)=>[c.caseId,c]));
const changedCases = cases.cases.filter((c:any)=>!same(scienceBody(c),scienceBody(oldCases.get(c.caseId)))).map((c:any)=>c.caseId);
if(!same([...changedCases].sort(),['q3-09-c-qualitative-contribution','q3-18-a','q3-18-b']))throw new Error('Whole case science drift outside three targeted cases');
const refresh = (tuple:any)=>{
 const g:any=goals.get(tuple.goalId),p=pages.get(tuple.goalId),v=p?.visualization;
 const record=records.get(tuple.goalId)??tuple.positiveRecord;
 const isNew=changedImageIds.has(tuple.goalId);
 const actualPath=isNew?changedImages.find((r:any)=>r.goalId===tuple.goalId).currentPortableImagePath:tuple.imageKeepBinding.currentActualAssetPath;
 return {...tuple,wholeGoal:g,wholeCurrentNormalPage:p,wholeCurrentScope13NativePage:nativePages.get(tuple.goalId)??null,
   wholeCanonicalDContext:buildGoalDescriptionCanonicalContext(g),
   normalPInput:goalEvidenceReviewInputPayload(g,'goal-evidence-v1',v?{[v.url]:v.originalDigest}:{},'curricularAtomic'),
   positiveRecord:record,wholeMaterialCases:cases.cases.filter((c:any)=>c.goalId===tuple.goalId),
   normalOriginalSourcePayload:tuple.normalOriginalSourcePayload,
   sourcePayloadUnchangedFromSealedV2:true,
   imageKeepBinding:{originalRetained:true,currentUrl:v?.url,currentDigest:v?.originalDigest,currentActualAssetPath:actualPath,
     newAdditiveRepairCandidate:isNew,previousSealedBinding:tuple.imageKeepBinding,newWholeTupleIndependentVisualizationReview:false},
   actualPrerequisiteWholeGoals:(g.requires??[]).map((id:string)=>goals.get(id)),
   actualParentWholeGoals:landscape.goals.filter((x:any)=>(x.contains??[]).includes(g.id)),
   actualReverseRequiresWholeGoals:landscape.goals.filter((x:any)=>(x.requires??[]).includes(g.id))};
};
const join={...parentJoin,role:'current_author_remediation_neutral_input_not_independent_QA',
 parentSealedJoinBinding:binding(path.join(parentRel,'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json')),
 whole523Path:path.join(rel,'inputs/current523.author-successor.de.json'),whole402NormalModelPath:path.join(rel,'native/whole402.neutral.normal-model.author.actual.json'),whole402NormalModelDigest:model.digest,
 scope13NativeModelPath:path.join(rel,'native/whole13.normal-model.author.actual.json'),nativeHtmlPath:path.join(rel,'native/whole13.html'),nativePdfPath:path.join(rel,'native/whole13.pdf'),
 selected13WholeTuples:parentJoin.selected13WholeTuples.map(refresh),directChangedContextNeighbours:parentJoin.directChangedContextNeighbours.map(refresh),
 boundedHoldsPath:path.join(rel,'inputs/source-components-and-explicit-sibling-ownership.author.json'),
 current13WholeCasesPath:path.join(rel,'positive/whole28.material-task-model-scoring-transfer.de-en.author.json'),
 changedBindingsDeltaPath:path.join(rel,'inputs/targeted-v3-delta.neutral.json'),
 sourceMappingsAndLiteralNormativeClausesUnchangedFromV2:true,wholeSourceUnionApproval:false,actualOperatorExecutionApproval:false,
 preservedCentralReportIsBaselineEvidenceOnly:true,sourceAtlasCountIsNotCurricularDenominator:true,
 newIndependentReview:false,newHumanApproval:false,newHumanTrial:false,strictGain:0,activeIntegration:false};
save(path.join(own,'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json'),join);
const imageDeltas=changedImages.map((r:any)=>{
 const oldTuple=parentJoin.selected13WholeTuples.find((t:any)=>t.goalId===r.goalId);
 const freshTuple=join.selected13WholeTuples.find((t:any)=>t.goalId===r.goalId);
 return {goalId:r.goalId,title:(goals.get(r.goalId) as any).title,oldWholeGoal:oldGoals.get(r.goalId),currentWholeGoal:goals.get(r.goalId),
  oldBinding:oldTuple.imageKeepBinding,currentBinding:freshTuple.imageKeepBinding,
  providerProvenance:r,priorReviewInputFingerprint:oldTuple.positiveRecord.reviewInputFingerprint,currentReviewInputFingerprint:freshTuple.positiveRecord.reviewInputFingerprint,
  priorProfileFingerprint:oldTuple.positiveRecord.profileFingerprint,currentProfileFingerprint:freshTuple.positiveRecord.profileFingerprint,
  PScientificProfileChanged:r.goalId.startsWith('b8c8'),DCanonicalContextUnchanged:same(oldTuple.wholeCanonicalDContext,freshTuple.wholeCanonicalDContext),
  targetedIndependentReviewPending:true};
});
const sourceBounds=read(path.join(own,'inputs/source-components-and-explicit-sibling-ownership.author.json'));
const delta={schemaVersion:1,role:'precise_current_author_remediation_delta_not_independent_approval',
  parentAuthorSealBinding:binding(path.join(parentRel,'author-package.freeze.json')),
  oldIndependentAOriginalSealBinding:binding('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-independent-a-20261012-v2/independent-a.original.freeze.json'),
  oldIndependentBOriginalSealBinding:binding('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-independent-b-20261012-v2/ORIGINAL.judgment-seal.json'),
  canonicalDiffs,imageDeltas,
  caseDeltas:changedCases.map((id:string)=>({caseId:id,oldWholeCase:oldCases.get(id),currentWholeCase:cases.cases.find((c:any)=>c.caseId===id),
    reason:id==='q3-09-c-qualitative-contribution'?'Clarify Cu-versus-Ag amount comparison in English only':'Assess actual graphical rate determination with correctly scaled curves, learner-read slopes, tolerances and fresh graph variation'})),
  canonicalGoalCount:landscape.goals.length,curricularAtomicDenominator:model.pages.length,wholeCaseCount:cases.cases.length,
  unchangedScientificCaseCount:cases.cases.length-changedCases.length,canonicalScientificAndPrerequisiteFieldsPreserved:true,
  unchangedGoodImageCount:8,retained96fdCurrentBinding:join.selected13WholeTuples.find((t:any)=>t.goalId.startsWith('96fd')).imageKeepBinding,
  allRequiresAndContainsPreserved:true,fiveLiveB007ApplicabilityCorrectionsPreserved:true,
  sourceBoundsSummary:sourceBounds.rows.map((r:any)=>({goalId:r.goalId,title:r.wholeCurrentGoal.title,status:r.knownIntegrationSourceBound,reason:r.holdReason})),
  wholeLiteralSourceContextPath:parentJoin.wholeSourceDutyContextPath,sourceAtlasPublished:381,sourceAtlasIsNot402Denominator:true,
  wholeSourceScopeAndOperatorUnionApproved:false,newIndependentApproval:false,humanApproval:false,humanTrial:false,
  performedExperiment:false,strictGain:0,activeIntegration:false};
save(path.join(own,'inputs/targeted-v3-delta.neutral.json'),delta);
save(path.join(own,'checks/precise-delta.actual.json'),{canonicalChangedGoals:canonicalDiffs.length,canonicalChangedFields:['resourceLinks'],
 wholeCurrentCanonicalGoals:landscape.goals.length,currentDenominator:model.pages.length,wholeCases:cases.cases.length,
 scienceCaseChanges:changedCases,scienceCasesPreserved:25,currentNativeGoalPages:native.pages.length,
 sourcePayloadChangesFromV2:0,wholeSourceUnionApproval:false,strictGain:0,activeWrites:false});
console.log('Neutral current whole523/402, P13/28 and precise five-image/three-case delta exported; all scientific/context fields retained.');
