# SPDX-License-Identifier: Apache-2.0
import datetime, hashlib, json, pathlib, subprocess

ROOT=pathlib.Path('/home/enpasos/projects/skillpilot')
OWN=pathlib.Path(__file__).resolve().parent
OLD=OWN.parent/'biologie-neuro21-final-reviewed-images-native-preparation-20261007-v1'
NATIVE=OLD/'isolated-repository'
INPUTS={}
def binding(p):
    p=pathlib.Path(p); b=p.read_bytes()
    return {'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def read(p):
    p=pathlib.Path(p); INPUTS[str(p)]=binding(p); return json.loads(p.read_text())
def use(p):
    p=pathlib.Path(p); INPUTS[str(p)]=binding(p); return INPUTS[str(p)]
def write(name,data):
    p=OWN/name; p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x') as f: json.dump(data,f,ensure_ascii=False,indent=2); f.write('\n')
def stable(v): return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'))

seal=read(OLD/'final-native-preparation.author.freeze.json')
assert binding(OLD/'final-native-preparation.author.freeze.json')['sha256']=='sha256:8046c51f45013d2fcffbb5da26e55ed2f83dcc0eaca9b02411b950d1298342ec'
checked=[]
for group in ['declaredInputs','ownPayloads']:
    for b in seal[group]:
        actual=binding(ROOT/b['path'])
        assert actual['sha256'].removeprefix('sha256:')==b['sha256'].removeprefix('sha256:') and actual['bytes']==b['bytes'],b['path']
        checked.append(actual)
write('sealed-stage03-inputs-and-payloads.actual-verification.author.json',{'role':'technical unchanged-seal verification','stage03Freeze':binding(OLD/'final-native-preparation.author.freeze.json'),'verifiedPayloadCount':len(seal['ownPayloads']),'verifiedInputCount':len(seal['declaredInputs']),'allExact':True,'fullPayloadDirectorySetExact':sorted(str(p.relative_to(ROOT)) for p in OLD.rglob('*') if p.is_file() and p.name!='final-native-preparation.author.freeze.json')==sorted(r['path'] for r in seal['ownPayloads']),'humanApproval':False,'strictGain':0})
assert sorted(str(p.relative_to(ROOT)) for p in OLD.rglob('*') if p.is_file() and p.name!='final-native-preparation.author.freeze.json')==sorted(r['path'] for r in seal['ownPayloads'])

canon_target='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
canon_before=use(ROOT/canon_target)
assert canon_before['sha256']=='sha256:244d2889ddeeb69cbf97d0a320f3e38cf5444674f3bb17f3e46c0112ac6fbff1'
canon=read(NATIVE/canon_target)
whole=read(OLD/'all472-whole-old-prior-final-goal-source-edge-image-diffs.author.json')
pages=read(OLD/'all390-whole-old-prior-final-pages-contexts-images-diffs.author.json')
am=read(OLD/'current390-AM-content-decisions-exact-technical-fingerprint-recalculation.author.json')
assert len(whole['rows'])==472 and len(pages['rows'])==390
assert len([r for r in whole['rows'] if not r['selected21'] and r['currentVsFinalWholeGoalExact']])==451
protected=[]
goalrows={r['goalId']:r for r in whole['rows']}
amrows={(r['kind'],r['goalId']):r for r in am['records']}
for r in pages['rows']:
    if r['goalId'] not in pages['protected74GoalIds']: continue
    g=goalrows[r['goalId']]
    assert r['currentVsFinalWholePageExact'] and r['currentVsFinalDInputExact'] and g['currentVsFinalWholeGoalExact']
    protected.append({'goalId':r['goalId'],'wholeCanonicalGoalSha256':'sha256:'+hashlib.sha256(stable(g['wholeFinalImageCandidateGoal']).encode()).hexdigest(),'wholeNativePageSha256':'sha256:'+hashlib.sha256(stable(r['wholeFinalNativePage']).encode()).hexdigest(),'nativeFingerprints':r['nativeFingerprints']['final'],'image':r['imageBinding']['final'],'atomicityFingerprint':amrows['atomicity',r['goalId']]['storedFingerprint'],'memoryFingerprint':amrows['memory',r['goalId']]['storedFingerprint'],'beforeAfterWholeGoalPageDContextImageExact':True})
assert len(protected)==74
write('protected74-planned-exact-whole-goal-page-context-image-AM-fingerprints.author.json',{'role':'technical integration invariants from actual sealed old/final whole comparisons','recordCount':74,'records':protected,'strictGain':0})

witness=read(OLD/'inputs/selected21-source-witness-effective-bindings.exact.json')
source_routes={}
for r in witness['records']:
    assert r['wholeSourceApproval'] is False
    for e in r['exactEffectiveBindings']:
        source=use(ROOT/e['actualFrozenEffectivePath'])
        assert source['sha256']==e['binding']['sha256'] and source['bytes']==e['binding']['bytes']
        key=e['plannedPath']; current=use(ROOT/key) if (ROOT/key).is_file() else None
        if key not in source_routes: source_routes[key]={'destination':key,'source':source,'currentDestination':current,'action':('reuse_exact_existing' if current and current['sha256']==source['sha256'] else 'planned_candidate_replacement'),'boundGoalIds':[],'wholeSourceApproval':False}
        assert source_routes[key]['source']['sha256']==source['sha256']
        if r['goalId'] not in source_routes[key]['boundGoalIds']:source_routes[key]['boundGoalIds'].append(r['goalId'])

image_packets=read(OLD/'native-isolation-and-imports.actual.author.receipt.json')
asset_routes=[]
for row in image_packets['selectedImages']:
    goalid=row['goalId']; stem=f'assets/goal-visualizations/biologie/{goalid}/{goalid}.png'
    paths=[f'curricula/DE/Gymnasium/visualizations/biologie/{goalid}/{goalid}.png',f'app/public/{stem}',f'backend/src/main/resources/static/{stem}']
    files=[]
    for target in paths:
        source=use(NATIVE/target); assert source['sha256'].removeprefix('sha256:')==row['selectedUnchangedOriginalAsset']['sha256'].removeprefix('sha256:')
        files.append({'destination':target,'source':source,'currentDestination':use(ROOT/target) if (ROOT/target).is_file() else None})
    source_dir=NATIVE/f'curricula/DE/Gymnasium/visualizations/biologie/{goalid}'
    metadata=[{'destination':str(p.relative_to(NATIVE)),'source':use(p),'currentDestination':use(ROOT/p.relative_to(NATIVE)) if (ROOT/p.relative_to(NATIVE)).is_file() else None} for p in sorted(source_dir.iterdir()) if p.is_file() and p.suffix!='.png']
    asset_routes.append({'goalId':goalid,'productionUrl':'/'+stem,'selectedReviewedOriginal':use(ROOT/row['selectedUnchangedOriginalAsset']['path']),'nativeCopyRoutes':files,'nativeMetadataRoutes':metadata,'noGeneration':True,'currentCandidateQaRemainsUnapproved':True})
assert len(asset_routes)==21

registry_path='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
registry=read(ROOT/registry_path)
protected_subjects=[]
for subject in registry['subjects']:
    if subject['subject'] not in ['mathematik','physik']:continue
    files=[]
    for key in ['landscapePath','semanticKindLedgerPath','semanticAtomicityConfigPath','memoryReviewConfigPath','visualizationQaPath']:
        if key not in subject: continue
        files.append({'role':key,'binding':use(ROOT/subject[key])})
        if key.endswith('ConfigPath'):
            cfg=read(ROOT/subject[key])
            for ck in ['reviewPath','cardReviewPath']:
                if ck in cfg:files.append({'role':ck,'binding':use(ROOT/cfg[ck])})
    protected_subjects.append({'subject':subject['subject'],'wholeRegistrySubjectSha256':'sha256:'+hashlib.sha256(stable(subject).encode()).hexdigest(),'files':files,'allExistingResolutionIndicesAndPositiveConfigPathsPreserved':True})
assert len(protected_subjects)==2
bio=next(s for s in registry['subjects'] if s['subject']=='biologie')
bio_binding={'wholeRegistrySubjectSha256':'sha256:'+hashlib.sha256(stable(bio).encode()).hexdigest(),'currentSubject':bio}
write('protected-Math-Physics-and-current-Bio-registry-bindings.author.json',{'role':'planned integration protected active fingerprints; no registry mutation','registry':use(ROOT/registry_path),'MathPhysics':protected_subjects,'currentBio':bio_binding,'activeWrites':False})

kind_target='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
a_cfg_target='curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json'
m_cfg_target='curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json'
a_cfg=read(ROOT/a_cfg_target); m_cfg=read(ROOT/m_cfg_target)
current_a=read(OLD/'inputs/current-independent-atomicity.config.exact.json')
current_m=read(OLD/'inputs/current-independent-memory.config.exact.json')
planned_a={**current_a,'landscapePath':canon_target,'reviewPath':a_cfg['reviewPath'],'reportPath':'docs/qa-ci/status/semantic-atomicity-canonical-biology-full.md'}
# New future active record target avoids overwriting any dated historical dossier.
planned_m={**current_m,'landscapePath':canon_target,'reviewPath':'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.review.jsonl','cardReviewPath':'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.cards.review.jsonl','reportPath':m_cfg.get('reportPath','docs/qa-ci/status/memory-card-review-canonical-biology-full.md')}
write('planned-active-atomicity.config.author.json',planned_a)
write('planned-active-memory.config.author.json',planned_m)
record_routes=[{'kind':'A','destination':planned_a['reviewPath'],'source':use(OLD/'inputs/current-independent-atomicity.full390.exact.jsonl'),'wholeCurrent390DecisionRecordsExact':True},{'kind':'M','destination':planned_m['reviewPath'],'source':use(OLD/'inputs/current-independent-memory.full390.exact.jsonl'),'wholeCurrent390DecisionRecordsExact':True},{'kind':'M_cards','destination':planned_m['cardReviewPath'],'source':use(OLD/'inputs/current-independent-memory.cards.exact.jsonl'),'wholeCardRecordsExact':True}]
for r in record_routes:r['currentDestination']=use(ROOT/r['destination']) if (ROOT/r['destination']).is_file() else None
view_bindings=[use(ROOT/v['viewPath']) for v in current_m['visibilityScopes']]
assert len(view_bindings)==8
for p in ['candidate-scaffolds/positive21.final-image-candidate.config.json','candidate-scaffolds/positive21.final-image-candidate.records.jsonl','isolated-repository/inputs/visualization-qa.final-image-candidate.json']:
    if (OLD/p).is_file():use(OLD/p)
qa_target='curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
plan={'role':'concrete future native integration plan only; no integration action or scientific author verdict','status':'technical_ready_subject_to_actual_fresh_A_B_binding_review_results_and_root_synthesis','canonical':{'destination':canon_target,'source':use(NATIVE/canon_target),'currentDestination':canon_before,'goalCount':472,'IDsRequiresContainsExact':True,'unselected451WholeGoalsExact':True,'selected21ChangesFromPriorMaterialCandidate':['resourceLinks'],'wholeDiff':use(OLD/'all472-whole-old-prior-final-goal-source-edge-image-diffs.author.json')},'semanticKindLedger':{'destination':kind_target,'source':use(NATIVE/'inputs/semantic-kinds.final-image-candidate.json'),'currentDestination':use(ROOT/kind_target),'nativeResourceLinksOutsideSemanticFingerprint':True,'newSemanticDecision':False},'sourceRoutes':list(source_routes.values()),'sourceCoverage':{'actualBoundedComponentsRemainSeparateFromWholeCountryCoverage':True,'wholeCountrySourcePairsRemainHOLD':189,'all51SelectedScopeWitnessesWholeSourceApprovalFalse':True,'remainingObligations':use(OLD/'inputs/source-whole-operator-model-role-obligations.exact.json') if (OLD/'inputs/source-whole-operator-model-role-obligations.exact.json').is_file() else use(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-eight-missing-primary-scope-remediation-author-v2/remaining-whole-source-operator-and-model-role-obligations.author-v2.json'),'noBlanketSourceApproval':True},'currentAM':{'recordRoutes':record_routes,'atomicityConfig':{'destination':a_cfg_target,'currentDestination':use(ROOT/a_cfg_target),'plannedConfig':binding(OWN/'planned-active-atomicity.config.author.json')},'memoryConfig':{'destination':m_cfg_target,'currentDestination':use(ROOT/m_cfg_target),'plannedConfig':binding(OWN/'planned-active-memory.config.author.json')},'nativeFingerprintContinuity780':use(OLD/'current390-AM-content-decisions-exact-technical-fingerprint-recalculation.author.json'),'memoryEightViewBindings':view_bindings},'imageRoutes':asset_routes,'visualizationQa':{'destination':qa_target,'currentDestination':use(ROOT/qa_target),'candidateScaffold':use(NATIVE/'inputs/visualization-qa.final-image-candidate.json'),'candidateNotFinalApprovalRecord':True,'requiredFutureRootSynthesis':'exact paired21 raster decisions plus actual fresh final native D/P page-image-context binding records; preserve74 current rows and all Human fields false'},'D_P_registry':{'destination':registry_path,'currentDestination':use(ROOT/registry_path),'futureNewResolutionAndPositiveConfigPaths':'Root must synthesize concrete fresh native D results and existing paired P20 plus current080v4; author creates no approved records','preserveAllExistingIndicesConfigsBindingsExceptExplicit21NewImageAnd080v4MaterialCandidate':True,'neverOverwriteHistoricalDossiers':True,'unselected949WholeGoalExactWithChangedPrerequisiteLabelContextMustStayBound':True,'currentNativeDReviewRouting':binding(OWN/'native-d20-plus1-campaigns.neutral-routing.author.json')},'pageContext':{'all390WholeDiff':use(OLD/'all390-whole-old-prior-final-pages-contexts-images-diffs.author.json'),'currentToFinalChangedPages':22,'priorMaterialToFinalChangedPages':21,'unselected949Preview':binding(OWN/'native-unselected949/book.pdf'),'unselected949NoVisualizationInActualFull390':True,'protected74Fingerprints':binding(OWN/'protected74-planned-exact-whole-goal-page-context-image-AM-fingerprints.author.json')},'protectedMathPhysics':binding(OWN/'protected-Math-Physics-and-current-Bio-registry-bindings.author.json'),'integrationOrder':['Verify exact main and declared source/destination/preexisting74/M/P fingerprints','Resolve actual fresh A/B21 final native D/P bindings through Root synthesis and preserve exact080v4 scientific body','Stage only planned source replacements, canonical,semantic,currentAM,new21 image copies and native metadata in one bounded author integration','Merge newly synthesized AI QA/evidence routing preserving74 and all historical dossiers; retain whole sourceHOLDs','Run authorized targeted native verification after future integration; global runtime and human approval are separate'],'integrationExecuted':False,'generatorInvoked':False,'globalBuildsOrTestRuntimes':False,'humanApproval':False,'humanTrial':False,'strictGain':0}
write('concrete-native-integration-plan.author.json',plan)

render_files=[binding(p) for p in sorted((OWN/'native-unselected949').iterdir()) if p.is_file()]
write('native949-single-render.actual.author.receipt.json',{'role':'technical native949 single subset from sealed final390; no new D campaign','modelDigest':json.loads((OWN/'native-unselected949/book-model.json').read_text())['digest'],'htmlRenderCount':1,'pdfRenderCount':1,'goalPhysicalPdfPage':3,'localVisualizationCount':0,'actualFull390VisualizationNullPreserved':True,'artifacts':render_files,'nativeApi':'buildGoalDescriptionRolloutSubsetModel','nativeRenderer':'app/scripts/renderGoalBook.ts','nativePublicRoot':str((NATIVE/'app/public').relative_to(ROOT)),'actualExitCode':0,'humanApproval':False,'strictGain':0})
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
main=subprocess.check_output(['git','rev-parse','refs/heads/main'],cwd=ROOT,text=True).strip()
assert head==main=='4600693fd163e9519d5eb21c3c4e7008d39d12d6'
write('technical-readiness-and-unchanged-main.actual.author.json',{'role':'bounded technical author completion','head':head,'main':main,'activeCanonical':canon_before,'stage03FullSealVerified':True,'nativeCampaigns':4,'nativeCampaignValidatorsPassed':4,'nativeReviewRecordsOrRunsCreated':0,'whole21NativeInputRowsExactToStage03':True,'final21ModelsPDFsHTMLManifestsCopiedExact':True,'twentyOneModelBuildsOrRerenders':0,'native949SubsetModelAndHTMLPDFCreatedOnce':True,'activeCanonQaRegistryWrites':False,'noNewScientificAuthorApproval':True,'humanApproval':False,'humanTrial':False,'strictGain':0})
inputs=read(OWN/'native-campaign-preparation.actual.author.receipt.json')['declaredInputs']
for b in inputs:INPUTS[str(ROOT/b['path'])]=b
# All actual native contract helpers/schemas declared; no monkey patch or schema exception.
for rel in ['app/scripts/exportGoalBookReviewBundle.ts','app/scripts/createGoalDescriptionReviewCampaign.ts','app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/materializeGoalDescriptionRolloutBatch.ts','app/scripts/goalBookModel.ts','app/scripts/goalBookRenderer.ts','app/scripts/renderGoalBook.ts','contracts/goal-description-review/v1/goal-description-review-record.schema.json','contracts/goal-description-review/v2/goal-description-review-campaign.schema.json','contracts/goal-description-review/v3/goal-description-review-input.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json']:use(ROOT/rel)
for b in INPUTS.values(): assert binding(ROOT/b['path'])==b,b['path']
write('technical-preparation.final.freeze.json',{'role':'technical preparation payload/input freeze; no independent reviewer verdict','sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'declaredInputs':sorted(INPUTS.values(),key=lambda b:b['path']),'ownPayloads':[binding(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p.name!='technical-preparation.final.freeze.json'],'stage03Seal':binding(OLD/'final-native-preparation.author.freeze.json'),'stage03PayloadsAndInputsUnchanged':True,'humanApproval':False,'humanTrial':False,'strictGain':0,'activeWrites':False,'freezeSelfExcluded':True})
print(json.dumps({'seal':binding(OWN/'technical-preparation.final.freeze.json'),'sourceRoutes':len(source_routes),'sourceReplacementRoutes':len([r for r in source_routes.values() if r['action']=='planned_candidate_replacement']),'images':21,'protected74':74,'nativeCampaigns':4}))
