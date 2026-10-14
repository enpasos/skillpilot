# SPDX-License-Identifier: Apache-2.0
"""Freeze actual measurements and release the private lease, with no new run."""
import hashlib
import json
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path
import jsonschema

R=Path('/home/enpasos/projects/skillpilot')
H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
O=Path(__file__).resolve().parent
OLD=R/B/'chemie-rest6-native2-plus-f7-475-existing292-inactive-integration-technical-20261014-v1'
I292=R/B/'chemie-source6-current412-five-paired-native-whole-gates-existing287-integration-technical-20261014-v1'
T1=R/B/'chemie-rest6-current414-final-resources-P2-shared-native2-technical-20261014-v1'
RET=R/B/'chemie-f7-475-original-D11-D15-whole-container-current-selection-retention-technical-20261014-v1'
NEW=['c3077d95-f3fe-5579-8493-cb92992809c4','e5d6de7e-28c5-5dd8-a700-ecc1a3a7b8cd']
NORMAL=['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json']
def now(): return datetime.now(timezone.utc).isoformat()
def read(p): return json.loads(p.read_text())
def sha(p): return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def dump(p,x):
    p.parent.mkdir(parents=True,exist_ok=True)
    tmp=p.with_name(p.name+'.tmp');tmp.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');os.replace(tmp,p)
def link(source,target):
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists(): assert sha(source)==sha(target)
    else: os.link(source,target)
def parse_finite(root,excluded=()):
    parsed=[];files=[]
    for p in sorted(root.rglob('*')):
        assert not p.is_symlink(),p
        if not p.is_file() or p.name in excluded: continue
        if p.suffix=='.json': read(p);parsed.append(str(p.relative_to(R)))
        elif p.suffix=='.jsonl':
            for line in p.read_text().splitlines():
                if line.strip(): json.loads(line)
            parsed.append(str(p.relative_to(R)))
        files.append(bind(p))
    return parsed,files
def seal(root,name,status,details):
    # Inventory binds every own physical file except the seal itself, including
    # the prior unchanged scientific originals and actual stock stdout/run.
    parsed,files=parse_finite(root,(name,))
    x={'schemaVersion':1,'sealedAtUTC':now(),'status':status,'role':'finite technical integration evidence; no new scientific or human vote','allOwnJSONAndJSONLFilesFullyParsed':True,'parsedJSONJSONLFiles':parsed,'physicalFiles':files,**details}
    dump(root/name,x)
    assert read(root/name)==x
    return bind(root/name)

def main():
    finalrun=O/'receipts/ACTUAL.current414-QA-sort-final.central.completed-run.json'
    run=read(finalrun)
    reportpath=O/'receipts/ACTUAL.current414-QA-sort-final.central.stock-report.json'
    report=read(reportpath);subject=next(s for s in report['subjects'] if s['subject']=='chemie')
    assert run['exitCode']==0 and report['blockingIssueCount']==0,report
    assert all(c['status']=='pass' for c in subject['requiredChecks'])
    assert run['readOnlyStockRunAliasBytesUnchanged']
    previous=read(I292/'MEASURE.actual292-of412-source6-five-new-core-closures-preserved287.actual.json')
    oldids=previous['strictCompleteGoalIds'];closed=subject['strictCompleteGoalIds']
    activepath=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie262-current402-closed34-active-adoption-root-20261013-v1/receipts/ACTUAL.full-registry-current402-five-gate-report.json'
    active=next(s for s in read(activepath)['subjects'] if s['subject']=='chemie')['strictCompleteGoalIds']
    restored=read(RET/'CAS.exact-D11-D15-full-originals-only-f7-475-current-selection.ADDITIVE-NOT-APPLIED.json')['onlyTwoNewCurrentSelections']
    missing_old=sorted(set(oldids)-set(closed));missing_active=sorted(set(active)-set(closed));added=sorted(set(closed)-set(oldids))
    assert len(oldids)==292 and len(active)==262
    assert not missing_old and not missing_active
    assert added==sorted(NEW+restored),(added,NEW,restored)
    assert subject['strictComplete']==len(closed)==296 and subject['denominator']==414
    candidate_sources=[T1/'candidate/canonical542.current414.final-two-paired-V-resources.inactive.json',T1/'candidate/semantic542.current414.same-existing-genuine-kind.normal-alias.json']
    for source,name,alias in zip(candidate_sources,['canonical542.current414.actual296.inactive.exact-final-native-two.json','semantic542.current414.normal-alias.exact-existing-kind.json'],NORMAL[:2]):
        assert sha(source)==sha(H/alias)
        link(source,O/'candidate'/name)
    assert sha(O/'candidate/QA426.unmodified-stock-sorted-same-whole-records.inactive.json')==sha(H/NORMAL[2])
    oldwhole={g['id']:g for g in read(T1/'before/H-I292.canonical.byte-exact.json')['goals']}
    current={g['id']:g for g in read(H/NORMAL[0])['goals']}
    assert len(current)==542 and all(oldwhole[i]==current[i] for i in oldids)
    assert current['442c31c5-c561-5c7a-90bb-2335d779175c']['weight']==1.2
    configpath=O/'config/chemie-current414-rest2-native2-f7-475-existing292.QA-sort-final.inactive.config.json'
    config=read(configpath)
    schema=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/deep-understanding-rollout.schema.json'
    jsonschema.Draft202012Validator(read(schema)).validate(config)
    guard=O/'checks/ACTUAL.stock-curriculum-symlink-guard.before-finite-seals.json';assert read(guard)['status']=='PASS'
    measure={'schemaVersion':1,'measuredAtUTC':now(),'measurementRole':'actual unmodified central Stock result, explicitly authorized final QA-sort successor','report':bind(reportpath),'completedGenuineRun':bind(finalrun),'strictComplete':296,'denominator':414,'remaining':subject['remaining'],'percentage':subject['percentage'],'allSixRequiredChecks':subject['requiredChecks'],'blockingIssueCount':0,'gates':subject['gates'],'strictCompleteGoalIds':closed,'previous292GoalIds':oldids,'previous292AllStillComplete':True,'previous292MissingGoalIds':missing_old,'active262SourceReport':bind(activepath),'active262AllStillComplete':True,'active262MissingGoalIds':missing_active,'exactAddedFourGoalIds':added,'genuinelyNewWholeAtomCompletions':NEW,'existingGoalsHistoricalDPASelectionRestorations':restored,'existingHistoricalRestorationsAreNotNewScientificVotes':True,'allPrior292WholeCanonicalObjectsPreserved':True,'rawRootWeightPreserved':1.2,'canonicalWholeNodeCount':542,'sourceCourseWholeCoverageM6M7OrHumanGrant':False,'strictCompletionReady':subject['strictCompletionReady'],'activeSourceViewRegistryOrGitAdoption':False,'firstCentralFailPreserved':bind(OLD/'receipts/ACTUAL.current414-rest2-plus-f7-475.central.completed-run.json'),'exactQASortChangedNoWholeRecordScience':True,'centralRunsAcrossOriginalAndAuthorizedSuccessor':2}
    dump(O/'MEASURE.actual296-of414-new-rest2-plus-two-existing-selection-restorations-preserved292.actual.json',measure)
    # Preserve the first failure as a genuine historical result, never replace
    # its zero aggregate with a counterfactual 296 after fixing the order.
    firstreport=read(OLD/'receipts/ACTUAL.current414-rest2-plus-f7-475.central.stock-report.json')
    dump(OLD/'MEASURE.first-central-run-QA-freshness-HOLD.actual.json',{'schemaVersion':1,'actualReport':bind(OLD/'receipts/ACTUAL.current414-rest2-plus-f7-475.central.stock-report.json'),'actualRun':bind(OLD/'receipts/ACTUAL.current414-rest2-plus-f7-475.central.completed-run.json'),'status':'HOLD','actualStrictComplete':0,'actualDenominator':414,'blockingIssueCount':1,'issues':firstreport['subjects'][0]['issues'],'all292WholeGoalObjectsPreservedDespiteAggregateFailure':True,'notA296Measurement':True,'exactCause':'New complete QA rows appended at424/425; unchanged stock title sort requires16/354. All426 whole records identical.','authorizedSuccessor':str(O.relative_to(R)),'newScienceToRepairFailure':0})
    active_status=subprocess.run(['git','status','--porcelain=v1','--untracked-files=no','--',*NORMAL],cwd=R,capture_output=True,text=True,check=True)
    wip={'schemaVersion':1,'observedAtUTC':now(),'role':'read-only checkpoint handoff; no restore or Git write','activeMainAliasBindings':[bind(R/x) for x in NORMAL],'trackedMainAliasStatus':active_status.stdout.splitlines(),'activeCanonicalMatchesFrozen402SHA':sha(R/NORMAL[0])=='sha256:b913c70321ba68aadd6e7dda2779085a81fe8b64991839422072f3cbdc96bd9e','activeWIPIntroducedByThisIntegration':[],'privateHChangesOnly':[{'path':x,'sha256':sha(H/x)} for x in NORMAL],'checkpointBoundary':'Do not copy private542/414 aliases to active. Preserve current active262/402 evidence. Root owns any separate safe inactive archive/restore CAS for pre-existing tracked modifications.','noBroaderWorktreeReviewClaim':True,'activeRestorePerformed':False,'gitWrites':False}
    dump(O/'HANDOFF.active-main-WIP-versus-private-H.exact-readonly-checkpoint-boundary.json',wip)
    oldseal=seal(OLD,'SEAL.finite-first-central-run-genuine-QA-freshness-HOLD.actual.json','HOLD',{'actualFirstCentralExitCode':1,'notA296Measurement':True,'sharedFreshStockSymlinkGuard':bind(guard),'originalScienceAndNativeInputsRemainImmutable':True})
    manifest={'schemaVersion':1,'createdAtUTC':now(),'status':'PASS bounded inactive integration; whole414 incomplete','actualMeasurement':bind(O/'MEASURE.actual296-of414-new-rest2-plus-two-existing-selection-restorations-preserved292.actual.json'),'actualReport':bind(reportpath),'actualCompletedRun':bind(finalrun),'stockCentralConfig':bind(configpath),'actualFinalCandidates':[bind(p) for p in sorted((O/'candidate').iterdir())],'originalFailFiniteSeal':oldseal,'pairedNativeTwoResolutionIndex':bind(OLD/'native-two/resolution-index.json'),'exactWhole426QASortCAS':bind(O/'CAS.exact-unmodified-stock-QA-order-only.after-first-genuine-fail.json'),'actualCurrentAliasBindings':[{'path':x,'sha256':sha(H/x)} for x in NORMAL],'prior292AndActive262Preserved':True,'genuinelyNewWholeAtoms':NEW,'existingHistoricalSelectionRestorations':restored,'newScientificVotesByIntegration':0,'noNewReviewOrHumanApprovalByHashTransport':True,'noActiveSourceViewRegistryGitAdoption':True,'source52ScopeAndM6HoldsUnresolved':True,'noNewWorkAfterHandoff':True}
    dump(O/'FINAL.actual296-of414-normal-paired-native2-plus-historical-f7-475-inactive-integration.manifest.json',manifest)
    handoff={'schemaVersion':1,'releasedAtUTC':now(),'leaseStatus':'RELEASED_TO_ROOT','privateHost':str(H),'previousExclusiveOwner':'/root/chemie_native8_fresh_independent_a','nextExclusiveOwner':'/root','allOwnedStockProcessesCompleted':True,'pendingOwnHostWrites':False,'actualFinalStrictComplete':296,'actualFinalDenominator':414,'normalAliasBindings':[{'path':x,'sha256':sha(H/x)} for x in NORMAL],'centralConfig':bind(configpath),'centralRunsAcrossOriginalAndAuthorizedSuccessor':2,'firstGenuineFailRetained':True,'newScientificWorkStopped':True,'noActiveOrGitWrites':True}
    dump(O/'HANDOFF.private-H-exclusive-lease.explicit-release-to-root.actual.json',handoff)
    finalseal=seal(O,'SEAL.finite-actual296-of414-QA-sort-successor-paired-D2-plus-two-existing-selections.H-released.actual.json','PASS bounded inactive integration',{'actualStrictComplete':296,'actualDenominator':414,'previous292AllPreserved':True,'active262AllPreserved':True,'actualCentralExitCode':0,'actualStockSymlinkGuard':bind(guard),'privateHLeaseReleased':True,'activeSourceViewRegistryGitAdoption':False,'M6M7WholeSourceOrHumanGrant':False})
    print(json.dumps({'firstFailureSeal':oldseal,'finalSeal':finalseal,'measure':bind(O/'MEASURE.actual296-of414-new-rest2-plus-two-existing-selection-restorations-preserved292.actual.json'),'finalManifest':bind(O/'FINAL.actual296-of414-normal-paired-native2-plus-historical-f7-475-inactive-integration.manifest.json'),'handoff':bind(O/'HANDOFF.private-H-exclusive-lease.explicit-release-to-root.actual.json'),'actualStrictComplete':296,'denominator':414,'prior292Preserved':True,'active262Preserved':True}))

if __name__=='__main__':main()
