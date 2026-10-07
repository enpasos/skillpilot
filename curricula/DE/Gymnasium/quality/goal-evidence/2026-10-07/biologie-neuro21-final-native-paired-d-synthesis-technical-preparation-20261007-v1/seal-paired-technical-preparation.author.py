# SPDX-License-Identifier: Apache-2.0
import datetime,hashlib,json,pathlib,subprocess
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot')
OWN=pathlib.Path(__file__).resolve().parent
def binding(p):
    b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,data):
    with (OWN/name).open('x') as f:json.dump(data,f,ensure_ascii=False,indent=2);f.write('\n')
receipt=json.loads((OWN/'actual-native-paired-synthesis-validations-and-source-body-bindings.author.json').read_text())
inputs={r['path']:r for r in receipt['declaredInputs'] if not (ROOT/r['path']).is_relative_to(OWN)}
helpers=['app/scripts/materializeGoalDescriptionRolloutBatch.ts','app/scripts/validateGoalDescriptionReviewDualRound.ts','app/scripts/validateGoalDescriptionReviewCampaignResults.ts','app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/validateGoalDescriptionDualRoundResolution.ts','app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts','app/scripts/goalDescriptionRolloutResolutionSynthesis.ts','app/scripts/goalBookModel.ts','contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','contracts/goal-description-review/v1/goal-description-rollout-batch-manifest.schema.json','contracts/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json','contracts/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json','contracts/goal-description-review/v1/goal-description-dual-round-resolution.schema.json']
for name in helpers:inputs[name]=binding(ROOT/name)
for name in ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json']:
    inputs[name]=binding(ROOT/name)
for r in inputs.values():assert binding(ROOT/r['path'])==r,r['path']
canon=inputs['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json']
assert canon['sha256']=='sha256:244d2889ddeeb69cbf97d0a320f3e38cf5444674f3bb17f3e46c0112ac6fbff1'
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
main=subprocess.check_output(['git','rev-parse','refs/heads/main'],cwd=ROOT,text=True).strip()
assert head==main=='4600693fd163e9519d5eb21c3c4e7008d39d12d6'
write('actual-completion-and-unchanged-active-routing.author.json',{'role':'technical paired synthesis actual completion','nativePreparedBatches':2,'nativeDualSummaries':2,'nativeSynthesisManifests':2,'nativeLowerValidatedResolutions':21,'allNativeValidationErrors':0,'nativeIndexSchemasPassed':2,'actualReviewerRunBytesCopiedUnchanged':True,'upperIndexMaterializerDeferredUntilRootActiveCanonicalIntegration':True,'current390AMRecordsAndMemoryEightViewsCardsExact':True,'currentSemanticLedgerExact':True,'protected74SourceWholeGoalPageContextImageExactPlanRetained':True,'all189WholeCountrySourcePairsRemainHOLD':True,'head':head,'main':main,'activeCanonical':canon,'actualEarlierOwnTechnicalFailureRetained':True,'schemaCheckerOrHelperExceptions':False,'activeWrites':False,'newScientificReviewers':0,'humanApproval':False,'humanTrial':False,'strictGain':0})
freeze={'role':'technical integrator factual Root-delegated paired D21 synthesis freeze; no new scientific reviewer','sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'declaredInputs':sorted(inputs.values(),key=lambda r:r['path']),'ownPayloads':[binding(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p.name!='technical-paired-preparation.final.freeze.json'],'actualIndependentSeals':json.loads((OWN/'paired-native-D21-and-operative-current-integration-routing.author.json').read_text())['actualIndependentSeals'],'nativeDescriptionBindingsValidated':21,'upperIndexMaterializerDeferredUntilActualIntegration':True,'activeWrites':False,'humanApproval':False,'humanTrial':False,'strictGain':0,'freezeSelfExcluded':True}
write('technical-paired-preparation.final.freeze.json',freeze)
for r in freeze['declaredInputs']+freeze['ownPayloads']:assert binding(ROOT/r['path'])==r,r['path']
print(json.dumps({'freeze':binding(OWN/'technical-paired-preparation.final.freeze.json'),'payloads':len(freeze['ownPayloads']),'declaredInputs':len(freeze['declaredInputs']),'actualNativeValidatedDescriptionBindings':21,'centralStrictGain':0}))
