# SPDX-License-Identifier: Apache-2.0
"""Actual finite post-write verification, including the preceding complete C7 tail."""
import copy
import hashlib
import importlib.util
import json
import subprocess
from pathlib import Path

N=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18')
T=N/'chemie-current450-MV-last-reverse-acid-practical-source-integration-technical-20261018-v1'
A=N/'chemie-current450-MV-last-reverse-acid-practical-author-successor-20261018-v1'
def read(p):return json.loads(Path(p).read_text())
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
    b=Path(p).read_bytes();return dict(path=str(p),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
def all_pins(x):
    if isinstance(x,dict):
        if {'path','sha256','bytes'}<=x.keys():yield x
        for v in x.values():yield from all_pins(v)
    elif isinstance(x,list):
        for v in x:yield from all_pins(v)
r=read(T/'RECEIPT.actual-three-MV-selected-source-normal-integration.json')
assert r['normalWrites']==3
history=read(T/'HISTORY.whole-original-source-cell-passage-review-and-author-metadata.json')
checks=[];refs=[]
for c,afterpin in zip(r['changes'],r['actualNormalAfterPins']):
    assert pin(c['path'])==afterpin
    current=read(c['path']);restored=copy.deepcopy(current);restore=c['selectedRestore']
    metadata=restored.pop('mvAcidPracticalSelectedSourceIntegration')
    assert metadata['actualLearnerExecution'] is False
    assert metadata['humanApproval'] is False and metadata['classroomSafetyRelease'] is False
    assert metadata['wholeOfficialSourceCredit'] is False
    for p in all_pins(metadata):
        assert pin(p['path'])=={k:p[k] for k in ('path','sha256','bytes')}
        refs.append(p['path'])
    if 'sourceGoalIndex' in restore:
        restored['sourceGoals'][restore['sourceGoalIndex']]=restore['wholeSourceBefore']
        restored['passages'][restore['passageIndex']]=restore['wholePassageBefore']
        source=current['sourceGoals'][59]
        expected=read(A/'CANDIDATE.one-existing-source-cell-primary-context-repair.inactive.json')['wholeAfter']
        assert {k:v for k,v in source.items() if k!='metadata'}=={k:v for k,v in expected.items() if k!='metadata'}
        assert 'authorCandidate' not in source['metadata']
        assert source['metadata']['technicalIntegrationStatus']=='normal_integrated'
        old=history['wholeOldSharedPassage'];new=current['passages'][restore['passageIndex']]
        old_line='- Sicheren Umgang mit Säuren in Haushalt und Labor begründen'
        block='- '+expected['sourceText']
        assert old['text'].splitlines().count(old_line)==1
        assert new['text']==old['text'].replace(old_line,block)
        assert {k:v for k,v in old.items() if k!='text'}=={k:v for k,v in new.items() if k!='text'}
    else:
        for a in restore['arrays']:restored[a['array']][a['index']]=a['wholeBefore']
        selected=current['mappings'][161]
        assert selected['canonicalGoalId']=='e81a4aed-9695-533e-8eb7-7a0c714346ea' and selected['matchType']=='partial'
        if len(restore['arrays'])==2:
            decision=current['decisions'][59]
            assert decision['reviewedAt']!='2026-05-11' and decision['reviewer']!='codex'
            assert decision['historicalReviewedAt']=='2026-05-11' and decision['historicalReviewer']=='codex'
            assert history['wholeOldReviewDecision']==restore['arrays'][1]['wholeBefore']
            assert decision['wholeSourceCredit'] is False and decision['matchType']=='partial'
            assert len(decision['machineProvenance']['underlyingIndependentScience'])==2
        else:
            assert len(current['decisions'])==1,'Plain alias gets no fabricated source002 decision'
    assert digest(restored)==c['beforeWholeObjectSHA256']
    assert current['c7QuantitativeDataPartialIntegration']==restored['c7QuantitativeDataPartialIntegration']
    checks.append(dict(path=c['path'],actualAfter=afterpin,exactWholeBeforeObjectRecovered=True,beforeWholeObjectSHA256=digest(restored),allUnselectedObjectsAndC7AppendTailsRetained=True))
for p in r['protectedBeforePins']:assert pin(p['path'])==p
for f in T.rglob('*.json'):read(f)
assert all(not Path(p).is_absolute() and '..' not in Path(p).parts for p in refs)
# Existing tracked primary PDFs remain portable even when a general ignore rule
# would reject newly untracked PDFs. Respect Git's actual tracked-file boundary.
ignored=subprocess.run(['git','check-ignore',*sorted(set(refs)),str(T)],capture_output=True,text=True)
assert ignored.returncode==1 and ignored.stdout==''
primary='curricula/DE/Gymnasium/input/MV/Chemie_Sekundarstufe_I_2021.pdf'
tracked=subprocess.run(['git','ls-files','--error-unmatch','--',primary],capture_output=True,text=True)
assert tracked.returncode==0
spec=importlib.util.spec_from_file_location('stock','scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
errors=mod.curriculum_symlink_errors('.');assert not errors
print(json.dumps(dict(status='PASS',scope='Only three selected MV lower-secondary normal files; exact full-old-object reconstruction and current foreign provenance pins',checks=checks,wholeSourceAndMappingCountsUnchanged=True,allC7AppendTailsAndMetadataExact=True,onlyOneSharedPassageLineReplaced=True,old20260511CodexWholeDecisionArchived=True,plainAliasHasNoFabricatedDecision=True,currentWholeNativePAndMVViewsByteUnchanged=True,sourceSemanticAfterExactlyAcceptedCandidate=True,sourceMetadataNowCurrentMachineAcceptedAndIntegrated=True,normalPinReferencesChecked=len(refs),portableReferencesNotIgnored=True,primaryPDFActuallyTrackedInGit=True,allOwnJSONParsed=True,stockCurriculumSymlinkErrors=errors,newScientificVotes=0,humanApproval=False,learnerExecution=False,classroomSafetyRelease=False,normalWrites=0),ensure_ascii=False,indent=2))
