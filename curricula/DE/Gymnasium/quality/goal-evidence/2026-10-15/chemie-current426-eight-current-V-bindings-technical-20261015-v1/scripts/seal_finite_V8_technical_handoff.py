# SPDX-License-Identifier: Apache-2.0
"""Verify exact finite transport, preserve source seals, and seal this new root."""
from pathlib import Path
import collections, datetime, hashlib, json, os

REPO=Path.cwd(); OWN=Path(__file__).resolve().parents[1]
def load(p):return json.loads(p.read_text())
def digest(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def ref(p):
    b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':digest(b),'bytes':len(b)}
def verify(r):
    p=REPO/r['path'];assert ref(p)==r,p;return p
def put(p,d):
    assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
plan=load(OWN/'INPUTS.frozen-original-eight-V-and-three-link-authors.json')
baseline=load(verify(plan['baselineSelector'])); old=load(verify(baseline['canonical'])); new=load(verify(plan['canonical']))
oldby={g['id']:g for g in old['goals']};newby={g['id']:g for g in new['goals']}
changed={g for g in oldby if oldby[g]!=newby[g]};assert changed==set(plan['changedWholeGoalIds'])
assert len(newby)==570 and len(changed)==3
for gid in changed:assert {k:v for k,v in oldby[gid].items() if k!='resourceLinks'}=={k:v for k,v in newby[gid].items() if k!='resourceLinks'}
semantic=load(verify(plan['semantic']));oldsemantic=load(verify(baseline['semantic']))
assert semantic==oldsemantic and semantic['decisions']==oldsemantic['decisions'] and len(semantic['decisions'])==570
oldqa=load(verify(plan['baselineQA']));qa=load(REPO/plan['finalQAOutputPath'])
oldrows={r['goalId']:r for r in oldqa['records']};rows={r['goalId']:r for r in qa['records']}
assert len(rows)==len(oldrows)==443 and set(rows)==set(oldrows)
eight={d['goalId'] for d in plan['originalDecisions']}
qa_changed={g for g in oldrows if oldrows[g]!=rows[g]};assert qa_changed==eight
def objectbytes(r):return json.dumps(r,ensure_ascii=False,indent=2).encode()
unchanged_serialized=[g for g in oldrows if objectbytes(oldrows[g])==objectbytes(rows[g])]
assert len(unchanged_serialized)==435
history=lambda r:{k:v for k,v in r.items() if k.startswith(('human','chatGpt')) or k in ['umlautsCorrectChatGpt','contentApprovedChatGpt']}
assert all(history(oldrows[g])==history(rows[g]) for g in oldrows)
assert all(r['visualizationState']=='available' and r['missingReason']=='' for r in rows.values())
bindings=[]
for d in plan['originalDecisions']:
    r=rows[d['goalId']];verify(d['image']);verify(d['originalFIRST']);verify(d['originalFIRSTSelector'])
    assert d['wholeReviewedGoal']==newby[d['goalId']]
    assert r['aiApproved']=='yes' and r['aiApprovedAssetSha256']==r['assetSha256']==d['image']['sha256']
    assert r['aiReviewer']==d['reviewer'] and r['aiReviewedAt']==d['reviewedAt']
    notes=json.loads(r['aiNotes']);assert notes['originalFIRST']==d['originalFIRST'] and notes['originalOwnFindingsAndLimits']==d['notesSourceFields']
    bindings.append({'goalId':d['goalId'],'originalFIRST':d['originalFIRST'],'originalReviewer':d['reviewer'],'originalReviewedAt':d['reviewedAt'],
                     'actualSelectedImage':d['image'],'exactOwnNotesAndLimitsPreserved':True,'allExistingHumanAndLegacyFieldsExact':True})
source_after=[]
for s in plan['sourceReviews']:
    for r in [s['selector'],s['first'],s['seal'],s['captureReceipt']]+s['sealPayloads']:verify(r)
    source_after.append({'label':s['label'],'selector':s['selector'],'first':s['first'],'seal':s['seal'],'allSealedPayloadsVerifiedBeforeAndAfter':True})
author_after=[]
for r in plan['authorSelectors']:
    p=verify(r);a=load(p);seal=REPO/a['finalSealPath']
    for payload in load(seal)['files']:verify(payload)
    author_after.append({'selector':r,'seal':ref(seal),'sealedPayloadsVerifiedAfter':True})
for s in plan['sourceSnapshotReferences']:verify(s['reference'])
for r in plan['stockModelAndComponentSnapshot']+plan['modules']:verify(r)
native_selector=OWN.parent/'chemie-bcp-current426-native24-preparation-technical-20261015-v1/NEUTRAL.finite-final-full426-native24-technical-handoff.selector.json'
assert ref(native_selector)['sha256']=='sha256:2aa745b17892fec563df53cab9e026cb94770b18e75a35e608dca6df94b0ae4d'
native=load(native_selector);verify(native['full426Model'])
assert native['full426Model']['sha256']=='sha256:ce59e285e5471e6b92d0cbebd6cc610c6192c760333ebf68c7a93c17fce4eefb'
host=REPO/plan['executionHost'];assert (host/plan['normalQAPath']).read_bytes()==(REPO/plan['finalQAOutputPath']).read_bytes()
assert (host/plan['normalCanonicalPath']).read_bytes()==(REPO/plan['canonical']['path']).read_bytes()
assert (host/plan['normalSemanticPath']).read_bytes()==(REPO/plan['semantic']['path']).read_bytes()
regular=[];rasters=[]
for parent,dirs,files in os.walk(host,followlinks=False):
    dirs[:]=[x for x in dirs if not (Path(parent)/x).is_symlink()]
    for name in files:
        p=Path(parent)/name
        if p.is_symlink():continue
        regular.append(p)
        if p.suffix.lower() in {'.png','.jpg','.jpeg','.webp','.gif','.avif'}:rasters.append(p)
assert not rasters
run=load(OWN/'checks/RUN.once-four-stock-actions.receipt.json');assert len(run['actualActions'])==4
stockchecks=[]
for r in run['actualActions']:
    c=load(verify(r));verify(c['stdout']);verify(c['stderr']);assert c['exitCode']==0
    stockchecks.append({'action':c['action'],'receipt':r,'exitCode':c['exitCode']})
helperpath=OWN/'checks/FULL426.source-fingerprints-strict-V-and-readonly-P077.actual.json';helper=load(helperpath)
assert helper['strictVisualization']['passed']==426 and helper['semanticSourceFingerprints']['current']==570
p077=helper['readOnly077PositiveEvidenceBinding'];assert len(p077)==1 and not p077[0]['staleBeforeThreeLinks'] and p077[0]['staleAfterThreeLinks']
initialmap=OWN/'REBUILD.one-own-minimal-stock-V-host.exact-map.json'
base_map=load(verify(plan['basePhysicalMap']))
finalmap=OWN/'REBUILD.final-current426-three-links-eight-V.physical-map.json'
aliases=[{'normalHostAlias':alias,'physicalRepositorySource':source,'physicalWithinHost':physical,
          'materialization':'Private regular JSON copy' if physical else 'Read-only source symlink'}
         for alias,source,physical in [(plan['normalCanonicalPath'],plan['canonical'],True),(plan['normalSemanticPath'],plan['semantic'],False),(plan['normalQAPath'],ref(REPO/plan['finalQAOutputPath']),True)]]
put(finalmap,{'schemaVersion':1,'role':'Exact finite V8 host replay, isolated single-canonical discovery; no Central or Native',
             'executionHost':plan['executionHost'],'sourceBaselineMap':plan['basePhysicalMap'],'initialHostConstructionMap':ref(initialmap),
             'canonical':plan['canonical'],'semantic':plan['semantic'],'finalQA':ref(REPO/plan['finalQAOutputPath']),
             'aliases':aliases,'stockPhysicalModules':plan['modules'],'selectedCurrentAssetRows':plan['imageRows'],
             'legacyQaDispositionDiscoveryInput':base_map['legacyQaDispositionDiscoveryInput'],
             'canonicalDiscoveryRegularJsonFiles':1,'selectedChemieLegacyReviewMarkdown':0,'physicalRasterCopies':0,
             'privateRegularFileCount':len(regular),'privateRegularFileBytes':sum(p.stat().st_size for p in regular),
             'rootIncludesOrdinaryRepoReadOnlyFallbacks':True,'fallbackRule':'Reference current repository entries; isolate canonical/QA/legacy-review directories before installing these aliases. Never write through source symlinks.',
             'onePrivateHostCreated':True,'oldHostWrites':0,'activeWrites':0,'newScienceVotes':0,'centralRuns':0,'nativeRenders':0})
auditpath=OWN/'checks/FINAL.exact-finite-input-and-object-preservation.audit.json'
put(auditpath,{'schemaVersion':1,'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'wholeGoals':570,'curricularAtomic':426,'wholeGoalResourceLinkOnlyChanges':sorted(changed),'otherWholeGoalsExactlyPreserved':567,
 'all570SemanticDecisionsExactlyPreserved':True,'semanticWholeFileByteExactToBaseline':ref(REPO/plan['semantic']['path'])['sha256']==baseline['semantic']['sha256'],
 'qaRows':443,'qaAvailable':443,'qaMissing':0,'qaScopeIdsExactlyPreserved':True,'originalQAWholeObjectsExactlyPreserved':435,
 'serializedWholeObjectByteExactFor435':True,'changedQAIdsExactlyTheGenuineEight':sorted(eight),
 'all443HumanAndLegacyHistoryObjectsExactlyPreserved':True,'originalIndependentBindings':bindings,
 'originalScientificInputsVerifiedBeforeAndAfter':source_after,'authorInputsVerifiedAfter':author_after,
 'stockAndComponentSnapshotsVerifiedBeforeAndAfter':plan['stockModelAndComponentSnapshot'],
 'actualOriginalGoalCardInputAndScreenshotSnapshotsVerifiedBeforeAndAfter':plan['sourceSnapshotReferences'],
 'existingSealedNativeFull426ModelSnapshotVerifiedReadOnly':native['full426Model'],
 'existingNativeModelIsHistoricalUnchangedInputNotRerenderedForTheseThreeLinks':True,
 'actualFourStockChecks':stockchecks,'readOnly077PositiveFingerprintResult':p077,
 'privateHostRegularFiles':len(regular),'privateHostRegularBytes':sum(p.stat().st_size for p in regular),'physicalRasterCopies':0,
 'newScientificVotes':0,'newPositiveEvidenceOrDescriptionOrAtomicityOrMemoryRecords':0,'activeWrites':0,'centralRuns':0,'nativeRenders':0,
 'humanApprovalGranted':False,'humanTrialClaimed':False,'M7Granted':False})
selector=OWN/'OUTPUTS.finite-current426-three-links-eight-genuine-V.technical-selector.json'
sealpath=OWN/'FILES.finite-current426-three-links-eight-genuine-V.seal.json'
put(selector,{'schemaVersion':1,'role':'Strictly technical inactive three-link composition and eight genuine original independent V bindings',
 'baselineSelector':plan['baselineSelector'],'canonical':plan['canonical'],'semantic':plan['semantic'],'visualizationQA':ref(REPO/plan['finalQAOutputPath']),
 'sourceOriginalVSelectors':[s['selector'] for s in plan['sourceReviews']],'authorSelectors':plan['authorSelectors'],
 'exactRebuildRecipe':ref(finalmap),'frozenInputs':ref(OWN/'INPUTS.frozen-original-eight-V-and-three-link-authors.json'),
 'finiteOwnObjectPreservationAndInputAudit':ref(auditpath),'actualStockChecks':stockchecks,'actualFull426StockVHelper':ref(helperpath),
 'actualQaScope':443,'actualQaAvailable':443,'actualCurrentApprovedActiveImages':443,'actualStrictVisualization':426,'actualVisualizationDenominator':426,
 'wholeGoalResourceLinkOnlyChanges':sorted(changed),'otherWholeGoalsExactlyPreserved':567,'otherWholeQAObjectsExactlyPreserved':435,
 'semantic570DecisionsExactlyPreserved':True,'allHumanAndLegacyHistoryExactlyPreserved':True,'allEightOwnLimitsAndFindingsPreservedInNormalAiNotes':True,
 'fiveFormerAIVisualGapsClosedByGenuineV5':True,'threeFormerMissingImageRowsClosedByExactGenuineV2V1':True,
 'readOnly077PositiveEvidenceBinding':p077,'requiredNextScopedBindingWork':{'goalId':p077[0]['goalId'],'gate':'P','reason':'The selected new exact077 image changes the current resource-bound P review-input fingerprint. No P record was modified here.'},
 'readyForScopedFollowupBindingIntegration':True,'allOtherGoalGatesRecomputed':False,'strictCompletionReady':False,
 'M7Granted':False,'HumanApproval':False,'HumanTrial':False,'newScientificVotes':0,'newDOrPOrAOrMRecords':0,
 'privateHostsCreated':1,'physicalRasterCopies':0,'activeWrites':0,'oldEvidenceOrHostWrites':0,'centralRuns':0,'nativeRenders':0,'builds':0,'gitWrites':0,
 'finalSealPath':sealpath.relative_to(REPO).as_posix()})
ownfiles=sorted(p for p in OWN.rglob('*') if p.is_file())
assert not any(p.is_symlink() for p in OWN.rglob('*'))
for p in ownfiles:
    if p.suffix=='.json':load(p)
put(sealpath,{'schemaVersion':1,'sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Finite own V8 technical outputs only; all original science remains sealed at its own source roots',
              'files':[ref(p) for p in ownfiles],'sourceOriginalScientificSeals':[s['seal'] for s in plan['sourceReviews']],
              'newScienceVotes':0,'HumanApproval':False,'M7Granted':False})
for r in load(sealpath)['files']:verify(r)
print(json.dumps({'selector':ref(selector),'seal':ref(sealpath),'canonical':plan['canonical'],'semantic':plan['semantic'],'QA':ref(REPO/plan['finalQAOutputPath']),
                  'exactMap':ref(finalmap),'strictV':'426/426','QA':'443/443 current approved active','unchangedWholeGoals':567,'unchangedWholeQAObjects':435,
                  'allHumanHistoryExact':True,'readOnly077PStaleAfterNewLink':True,'privateRegularHostBytes':sum(p.stat().st_size for p in regular),'rasterCopies':0}),flush=True)
