# SPDX-License-Identifier: Apache-2.0
"""Final inactive portable source-role plan, actual202/173 protected baseline."""
import copy
import datetime
import hashlib
import json
import os
import subprocess
from pathlib import Path
ROOT = Path.cwd(); OWN = Path(__file__).resolve().parent; BASE = OWN.parent; REQUIRED = {}
def rel(p): return str(p.relative_to(ROOT))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):
    x={'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size};REQUIRED[x['path']]=x;return x
def read(p):bind(p);return json.loads(p.read_text())
def put(name,x):
    p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True);data=x if isinstance(x,str)else json.dumps(x,ensure_ascii=False,indent=2)+'\n'
    with p.open('x')as f:f.write(data)
    return p
def verify(b,allow_biology_qa_drift=False):
    p=ROOT/b['path']
    if sha(p)!=b['sha256'].removeprefix('sha256:'):
        assert allow_biology_qa_drift and b['path']=='curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json',p
        return bind(p)
    assert p.stat().st_size==b['bytes'];return bind(p)
guard=read(OWN/'checks/paired-eight-source-roles-and-current-guard.technical.json');impact=read(OWN/'checks/actual-eight-source-atlas-consumer-impact.technical.json');routes=read(OWN/'checks/targeted-current-retained-D-P-V-and-next-bindings.actual.technical.json')
assert read(OWN/'checks/native-source-atlas-consumers-jsoncomplete.terminal.actual.json')['exitCode']==0
assert read(OWN/'checks/native-retained-targeted-D-P-V.terminal.actual.json')['exitCode']==0
assert impact['pageContextChangedGoalIds']==['b4777001-f4ed-5fe9-9d98-02319abdea09'] and impact['exactUnchangedAtlasPages']==358
assert set(impact['sourceChangedGoalIds'])=={'3de28598-672f-5753-8a45-8f559c2f9dc2','a44af1fa-5988-5b7d-b206-691c6bbf7dd4','b4777001-f4ed-5fe9-9d98-02319abdea09','fd309753-4d48-5570-a4ec-09dfeb20ff9c'}
assert not impact['beforeCurrentGeneratedOutputDrift']
currentprotected=[]; parallelDrift=[]
for b in guard['protectedOtherFiles']:
    actual=verify(b,True);currentprotected.append(actual)
    if actual['sha256']!=b['sha256']:parallelDrift.append({'oldObservation':b,'actualCurrent':actual,'rootScope':'Separate HE7 machine-review freshness metadata correction on ten new rows; no chemistry change. Science not re-reviewed here.'})
for b in guard['beforeBindings'].values():verify(b)
for filename in ['initial-declared-inputs.technical.json','additional-standard-JSON-source-document-inputs.technical.json','native-consumer-declared-inputs.technical.json','retained-D-P-V-declared-inputs.technical.json']:
    for b in read(OWN/'checks'/filename)['files']:verify(b,True)
put('checks/parallel-Biology-only-guard-refresh.observed.actual.json',{'currentChanges':parallelDrift,'historicalGuardPreserved':True,'chemistryBindingsChanged':0,'activeWrites':0,'newScienceReview':False})
centraldir=BASE/'biologie-he7-ten-reviewed-active-integration-root-v1';centralp=centraldir/'active-after-ten-config-and-qa-v3-central.actual.json';terminalp=centraldir/'active-after-ten-config-and-qa-v3-central.exit.actual.json'
central=read(centralp);terminal=read(terminalp);assert terminal['exitCode']==0 and central['blockingIssueCount']==0
subjects={s['subject']:s for s in central['subjects']}
for subject,strict,denom in [('chemie',173,378),('biologie',202,391),('mathematik',807,807),('physik',478,478)]:assert subjects[subject]['strictComplete']==strict and subjects[subject]['denominator']==denom
registry_path=ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';registry=read(registry_path);assert next(s for s in registry['subjects']if s['subject']=='chemie')==guard['chemistryRegistrySubject']
ledgerpath=ROOT/'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json';ledger=read(ledgerpath);assert ledger['activeBatchConfigPaths']==guard['allSevenChemistryClaims']
wholeNine=read(BASE/'chemie-b014-b477-nine-source-role-continuation-author-v2/nine-current-whole-original-source-duties-and-partners.json')
hbq=next(x for x in wholeNine['entries']if x['sourceGoalId']=='hb-chemistry-sekii-gyo2022-3-3-1-2-protolyse-037-a5df318f')
hm=read(ROOT/hbq['mappingPath']);assert next(r for r in hm['decisions']if r['sourceGoalId']==hbq['sourceGoalId'])==hbq['wholeOriginalDecision']
put('checks/exact-HB-Q-hold-identifier-and-unchanged-row.technical.json',{'sourceGoalId':hbq['sourceGoalId'],'actualWholeOriginalDecision':hbq['wholeOriginalDecision'],'actualWholeOriginalEdges':hbq['wholeOriginalMappingEdges'],'remainsOpen':True,'initialDraftWrongIdentifier':guard['HBQSourceGoalRemainsOpen'],'correctionScope':'Correct draft hold identifier only; no source row or historical judgment mutation.','activeWrites':0})
mappingreplacements=[]
for r in guard['mappingReplacements']:
    verify(r['expectedBefore']);verify(r['source']);verify(r['historicalBeforeSnapshot']);mappingreplacements.append(r)
derived=[]
for delta in impact['generatedOutputDeltas']:
    target=ROOT/delta['path'];before=OWN/'native-isolated-inputs/before'/delta['path'];after=OWN/'native-isolated-inputs/after'/delta['path'];assert sha(target)==sha(before)
    derived.append({'target':delta['path'],'expectedBefore':bind(target),'actualStandardGeneratedSource':bind(after),'kind':'standard-source-atlas-receipt'if delta['receiptOnly']else 'standard-source-atlas-view'})
plan={
 'role':'Inactive eight genuinely paired bounded source-role adoption, no goal/profile closure', 'subject':'chemie',
 'actualCurrentBaseline':{'chemistry':'173/378','biology':'202/391','mathematics':'807/807','physics':'478/478','actualTerminalExit':0},
 'baselineCentral':bind(centralp),'baselineTerminal':bind(terminalp),'protectedStrictGoalIds':{k:s['strictCompleteGoalIds']for k,s in subjects.items()},'protectedCurrentGoalIds':{k:s['currentGoalIds']for k,s in subjects.items()},
 'protectedCurrentFiles':currentprotected,'chemistryBeforeBindings':guard['beforeBindings'],'currentRegistryPreserveOnly':bind(registry_path),'ledgerPreserveOnly':bind(ledgerpath),'allSevenChemistryClaims':guard['allSevenChemistryClaims'],
 'reviewedActiveMappingReplacementFiles':mappingreplacements,'selectedSourceGoalIds':guard['selectedSourceGoalIds'],'exactChangedSourceRows':8,'exactMappingFiles':5,'actualIndependentSourceSeals':guard['seals'],
 'changedMappingDecisionFields':['canonicalGoalIds','rationale','reviewedAt','reviewer'],'otherMappingRowsAndEdgesAndHeaderExact':True,'originalSourceTextIdentityCourseStageFieldsExact':True,
 'canonicalClassifierAMVProfileRegistryLedgerWritesPlanned':0,'goalOrProfileOrImageChanges':0,'canonicalWholeGoalsPreserved':480,'currentCurricularAtomicGoalsPreserved':378,
 'standardGenerator':{'argv':['node','app/node_modules/tsx/dist/cli.mjs','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',guard['sourceAtlasConfigPath']],'instruction':'After exact mapping copies, run the ordinary generator; match the eight derived outputs below. Other41 of48 source views and both manifest/navigation stay byte-exact; no invented hand-crafted source views.'},
 'derivedAtlasOutputsExpected':derived,'nativeBeforeAfterAtlasChecks':'PASS_actual0','generatedSourceViews':48,'publishedSourceAtlasGoalPages':359,'currentNativeReviewGoalPages':378,'publishedSourceAtlasGoalCountChange':0,'unresolvedSourceScopeDecisionsBeforeAfter':496,
 'pageContextChangedGoalIds':impact['pageContextChangedGoalIds'],'exactOtherWholeAtlasPages':358,'wholePageChangeFields':['applicability','pageFingerprint'],
 'changedOriginalSourceBindingGoalIds':impact['sourceChangedGoalIds'],'currentNative378PureReviewInputsUnchanged':True,'actualAffectedOldDPVBindingRoutes':bind(OWN/'checks/targeted-current-retained-D-P-V-and-next-bindings.actual.technical.json'),
 'retainedNativeCurrentD2':'PASS','retainedNativeCurrentP2':'PASS_E1_G1_needs_human_review','retainedExactExistingV3':'PASS_bytes_no_new_visual_review','missingV3deRemainsOpen':True,
 'genuineThreeSupplementalSourceCases':bind(OWN/'supplemental-three-whole-DEEN-cases.retained-exact.json'),'supplementalSourceEvidenceStatus':{'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','boundedPairedMachineScience':'PASS','newPRecords':0,'newWholeA44PApproval':False,'actualExperimentOrLearnerPerformance':False},
 'honestSourceAcceptanceScope':'Six exact broad-B477 role removals plus two BB/BE 1c/fd/a44 six-ion source unions. Bounded E1/G1 scientific source support only. Normative Q experiment intentions stay binding; synthetic models are not performed experiments, full regional-source completion, whole a44 P approval, whole B477 or whole481 closure.',
 'HBQHold':{'sourceGoalId':hbq['sourceGoalId'],'mappingPath':hbq['mappingPath'],'wholeOriginalDecisionExact':True,'remainsOpen':True},'wholeB477CompoundRemainsOpen':True,'whole481RemainsOpen':True,
 'B477NextIndependentReviewInput':'The narrowed native source-atlas page, applicability only DE-HB SekII GK/LK, exact unchanged whole canonical DE/EN goal, valid retained image and genuine original HB-Q/model-compound duties. A whole D/P follow-up is still needed; this source-role plan supplies none.',
 'mustRunAfterApply':[
  {'argv':['node','app/node_modules/tsx/dist/cli.mjs','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',guard['sourceAtlasConfigPath'],'--check'],'purpose':'Ordinary atlas output/current mapping-byte check'},
  {'argv':['node','app/node_modules/tsx/dist/cli.mjs',rel(OWN/'check-retained-targeted-D-P-V-bindings.technical.mts')],'purpose':'Read-only actual current retained D2/P2/V3 binding verification; run outputs in a new root observed-check folder, preserve this sealed technical history'},
  {'argv':['npm','--prefix','app','run','quality:deep-understanding-rollout:check'],'purpose':'At stable integration, confirm all current protected strict IDs/floors and Chemistry173 unchanged; zero new closure claimed'}],
 'dependentPublicationLayer':'Regenerate ordinary Chemie book/original-source payload at stable integration through existing build. Four source-payload consumers and B477 applicability page changed; other whole pages/images/science stay preserved. No full build claimed in this technical dossier.',
 'portableSourceContract':'Actual before/after standard generator ran in isolated roots without raw third-party PDF/HTML files. Existing sourceDocumentSnapshots supply documented offline provenance; original-source JSON extractions and ordinary JSON original-documents are operative. Reviewer cache /tmp PDF readings are retained historical observations, not required live build files. No forced add, ignore/validator exception or copied third-party PDF/HTML.',
 'potentialNewScientificGoalClosures':0,'potentialRestoredBindingGain':0,'strictGainClaimed':0,'activeWrites':0,'humanApproval':False,'humanTrial':False
}
planp=put('ready-root-reviewed-eight-source-role-integration-plan.technical.json',plan)
for p in OWN.rglob('*'):
    if p.is_file():
        if p.suffix=='.json':json.loads(p.read_text())
        if p.suffix=='.jsonl':
            for line in p.read_text().splitlines():json.loads(line)
        bind(p)
for path in ['app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/buildGoalBookSourceAtlasInputs.ts','app/scripts/goalBookOriginalSources.ts','app/scripts/goalBookModel.ts','app/scripts/materializeGoalDescriptionRolloutBatch.ts','app/scripts/validateGoalDescriptionDualRoundResolution.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/src/utils/authoring/canonicalAuthoring.ts','app/src/utils/authoring/compositionViewAuthoring.ts']:bind(ROOT/path)
ignore=subprocess.run(['git','check-ignore','--no-index','--stdin'],input='\n'.join(REQUIRED)+'\n',text=True,capture_output=True);assert ignore.returncode in [0,1]and not ignore.stdout.strip(),ignore.stdout
links=[]
for path in REQUIRED:
    p=ROOT/path;assert p.exists(),p
    if p.is_symlink():
        text=os.readlink(p);assert not os.path.isabs(text);target=p.resolve(strict=True);assert target.is_relative_to(ROOT)and rel(target)in REQUIRED
        links.append({'path':path,'relativeTarget':text,'resolvedTarget':rel(target),'broken':False})
portable=put('checks/final-operative-input-portability.actual.technical.json',{'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'requiredFiles':list(REQUIRED.values()),'actualGitCheckIgnoreExit':ignore.returncode,'ignoredRequiredFiles':[],'containedRelativeSymlinks':links,'brokenSymlinks':0,'allOwnJSONAndJSONLParse':True,'rawThirdPartyPDFHTMLCopiesAdded':0,'rawThirdPartyPDFHTMLRequiredLive':False,'nativeRetainedDUsesStandardPortableBundle':True,'activeWrites':0,'strictGainClaimed':0})
put('TECHNICAL-READINESS.md','# Chemie B014: eight reviewed source roles\n\nActual protected baseline: Chemistry **173/378**, Biology202/391, Mathematics807/807, Physics478/478, terminal central exit0. This plan claims **zero new goals or strict gain**. Genuine independently first-sealed source A/B decisions support six bounded role drops and two BB/BE 1c/fd/a44 unions. Three complete DE/EN supplemental ion cases retain synthetic E1/G1 ai_candidate / needs_human_review status; no whole a44 P approval or actual practical performance is supplied.\n\nFive inactive mappings change exactly eight decisions and their corresponding edges; all other rows, edges, source text, course/stage fields, canonical480, class/A/M records, profiles and pictures are preserved. The ordinary isolated source-atlas generator and48 native view compiles passed with359 pages,378 canonical atoms and496 unresolved source-scope decisions unchanged. Seven generated view memberships narrow B477; its whole page changes only applicability and derived pageFingerprint. Other358 whole atlas pages are exact. Normalized original-source bindings change for3de, a44, B477 andfd.\n\nExisting current registered a44/fd D2 and P2 pass native verification; their whole pages and profiles are unchanged. Three existing image bindings remain exact; missing3de image remains open. B477 and HB-Q require a later genuine whole-source/compound D/P follow-up using the actual narrowed page. Whole481 also remains open. No accepted old science or picture was re-reviewed.\n\nOperative dependencies and standard native bundles pass actual git check-ignore and broken-symlink checks. Both isolated atlas builds exercised the established pinned offline source-document contract without raw PDF/HTML copies or exceptions. An initial inert-input ENOENT for two ordinary JSON original-documents is preserved; those actual unchanged JSON inputs were supplied and the standard check then passed. A draft wrong HB-Q hold identifier is explicitly corrected in a separate receipt, preserving the draft and original whole row.\n\nRoot must apply under the plan guards, use the ordinary generator, verify exact eight derived outputs and affected current bindings, and bundle final publication/full checks at a stable integration. Separate human approval/trial remain open.\n')
files=sorted(p for p in OWN.rglob('*')if p.is_file());seal=put('technical-preparation.final.freeze.json',{'schemaVersion':1,'sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'kind':'Inactive eight genuine bounded Chemistry source-role pairs and actual native consumer impact','ownFiles':[bind(p)for p in files],'readyPlan':bind(planp),'requiredPortableGuard':bind(portable),'actualIndependentSourceSeals':guard['seals'],'nativeSourceAtlas':'PASS_actual0','nativeRetainedD2P2':'PASS_actual0','existingExactV3':'PASS_retained_binding','changedWholePagePendingB477':True,'HBQRemainsOpen':hbq['sourceGoalId'],'newGoalOrWholePApprovals':0,'strictGainClaimed':0,'activeWrites':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'readyPlan':rel(planp),'finalSeal':rel(seal),'sha256':sha(seal),'exactMappingFiles':5,'sourceRoles':8,'nativeAtlasAndAffectedBindings':'PASS','changedWholePageIds':impact['pageContextChangedGoalIds'],'protectedChemistry':'173/378','protectedBiology':'202/391','requiredPortableFiles':len(REQUIRED),'ignoredRequired':0,'brokenSymlinks':0,'activeWrites':0,'strictGainClaimed':0}))
