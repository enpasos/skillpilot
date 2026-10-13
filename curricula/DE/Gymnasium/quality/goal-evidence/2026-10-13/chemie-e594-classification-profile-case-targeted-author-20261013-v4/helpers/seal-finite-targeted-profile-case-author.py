#!/usr/bin/env python3
# Apache-2.0. Finite targeted AUTHOR seal, no active writes.
import hashlib, json
from datetime import datetime, timezone
from pathlib import Path
E13=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13')
BASE=E13/'chemie-e594-residual-source-duty-author-20261013-v3'
OWN=E13/'chemie-e594-classification-profile-case-targeted-author-20261013-v4'
FINAL=OWN/'FINAL.finite-targeted-profile-case-author.freeze.json'
assert not FINAL.exists()
def read(p):return json.loads(Path(p).read_text())
def bind(p):
    b=Path(p).read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,obj):
    with (OWN/name).open('x') as f:f.write(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
before=read(BASE/'FINAL.finite-residual-source-duty-author.freeze.json')
for b in before['outputFiles']:assert bind(b['path'])==b
inputs={}
def check(v):
    if isinstance(v,dict):
        if all(k in v for k in ['path','sha256','bytes']):
            b={k:v[k] for k in ['path','sha256','bytes']}
            assert bind(b['path'])==b
            if not str(v['path']).startswith(str(OWN)+'/'):inputs[b['path']]=b
        for x in v.values():check(x)
    elif isinstance(v,list):
        for x in v:check(x)
for p in OWN.rglob('*.json'):check(read(p))
write('checks/exact-V3-output-and-finite-input-guards.actual.json',{
    'checkedAtUTC':datetime.now(timezone.utc).isoformat(),'immutableV3FinalSeal':bind(BASE/'FINAL.finite-residual-source-duty-author.freeze.json'),
    'allV3SealedOutputsByteExact':True,'checkedV3OutputCount':len(before['outputFiles']),
    'finiteExternalInputBindings':[inputs[k] for k in sorted(inputs)],'allExistingBindingsExact':True,'activeWrites':False
})
write('NEUTRAL.targeted-classification-profile-case.inactive-author.input-selector.json',{
    'schemaVersion':1,'role':'Neutral targeted V4 AUTHOR successor for exactly two V3 findings; independent scientific recheck pending',
    'immutableV3FinalSeal':bind(BASE/'FINAL.finite-residual-source-duty-author.freeze.json'),
    'twoWholeProfileCAS':bind(OWN/'candidate/two-whole-DEEN-profile-CAS.targeted-author.json'),
    'fourWholeBilingualCaseCAS':bind(OWN/'candidate/four-whole-bilingual-case-CAS.targeted-author.json'),
    'twoDistinctEvidencePiecesAndFullExpectationCoherence':bind(OWN/'two-distinct-evidence-pieces-and-whole-case-expectation-coherence.author.json'),
    'originalStockProfileFragmentAndWholeCASChecks':bind(OWN/'checks/stock-profile-fragments-whole-CAS-and-DEEN-joins.actual.json'),
    'exactV3AndFiniteInputGuards':bind(OWN/'checks/exact-V3-output-and-finite-input-guards.actual.json'),
    'unchangedWholeGoalSourceViewHoldAndImageContext':bind(BASE/'NEUTRAL.residual-source-duty.inactive-author.input-selector.json'),
    'successorRowsToReview':{'profiles':'wholeProfileCAS[*].proposedAfterWholeProfileRow','cases':'wholeCaseCAS[*].proposedAfterWholeCase'},
    'onlyTwoFindingCorrections':True,'independentReviewRecordsOrVotesCreated':False,
    'fullSourceOptionalSelectionAndCompiledPageFingerprintHoldsUnchanged':True,
    'noAdditionalTaskQuota':True,'goalsSourcesViewsAndImagesUnchanged':True,
    'activeWrites':False,'gitOperations':False,'humanApproval':False,'humanTrial':False
})
files=sorted(p for p in OWN.rglob('*') if p.is_file())
assert all(not p.is_symlink() and p.stat().st_size>0 for p in files)
for p in files:
    if p.suffix=='.json':read(p)
out=[bind(p) for p in files]
write(FINAL.name,{
    'schemaVersion':1,'role':'Finite immutable inactive AUTHOR V4 targeted profile/case correction; not independent acceptance',
    'sealedAtUTC':datetime.now(timezone.utc).isoformat(),
    'neutralInputSelector':bind(OWN/'NEUTRAL.targeted-classification-profile-case.inactive-author.input-selector.json'),
    'outputFiles':out,'sealedOutputFileCountExcludingThisSeal':len(out),'sealedOutputBytesExcludingThisSeal':sum(b['bytes'] for b in out),
    'targetedCorrections':{'wholeProfileMinimumIndependentDemonstrations1To2':2,'distinctEvidencePiecesCanShareOneRichTask':True,'RPSecondCaseDEExplicitVatDyeCorrection':True,'coupledDEModelRubricAndPositiveBriefExact':True},
    'wholeProfileCASRows':2,'wholeBilingualCaseCASRows':4,'originalStockProfileFragmentChecksValid':True,
    'allV3SealedOutputsUnchanged':True,'noGoalSourceViewImageOrDenominatorChanges':True,
    'independentScientificRecheckPending':True,'compiledPageGoalEvidenceFingerprintRebindPending':True,
    'noDPAorMVVotesOrGateApproval':True,'activeWrites':False,'gitOperations':False,'humanApproval':False,'humanTrial':False
})
for b in read(FINAL)['outputFiles']:assert bind(b['path'])==b
assert set(str(p) for p in OWN.rglob('*') if p.is_file())==set(b['path'] for b in out)|{str(FINAL)}
print(json.dumps({'seal':bind(FINAL),'outputs':len(out),'totalFiles':len(out)+1,'bytesWithoutSeal':sum(b['bytes'] for b in out),'allGuardsMatch':True}))
