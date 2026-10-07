# SPDX-License-Identifier: Apache-2.0
"""Verify exact targeted inputs and unchanged v3/v2 continuity, never mutate them."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
DATE = OWN.parent
AUTHOR = DATE/'chemie-b007-one-inherited-prerequisite-targeted-author-v4'
A3 = DATE/'chemie-b007-seven-native-source-independent-a-v3'
AUTHOR3 = DATE/'chemie-b007-seven-native-source-preparation-author-v3'
V2 = DATE/'chemie-b007-seven-routines-four-material-corrections-author-v2'

def read(path):
    return json.loads(path.read_text())

def bind(path):
    data=path.read_bytes()
    return {'path':str(path.relative_to(ROOT)), 'sha256':hashlib.sha256(data).hexdigest(), 'bytes':len(data)}

def check(binding):
    actual=bind(ROOT/binding['path'])
    assert actual['sha256']==binding['sha256'].removeprefix('sha256:'), binding['path']
    assert actual['bytes']==binding['bytes'], binding['path']
    return actual

def valhash(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True).encode()).hexdigest()

inputs={}
def remember(binding):
    actual=check(binding)
    inputs[actual['path']]=actual
    return actual

af=AUTHOR/'one-inherited-prerequisite-author-v4.final.freeze.json'
assert bind(af)['sha256']=='81020d220bd57a76f447a126298d4e2e1d67a12d169d8524296c1b4ef5181670'
inputs[bind(af)['path']]=bind(af)
freeze=read(af)
for b in freeze['files']+freeze['inputBindings']:
    remember(b)
opaque_peer_freezes=[b['path'] for b in freeze['inputBindings'] if 'independent-b' in b['path']]
# Peer freeze bytes above were used only for checksum integrity, never parsed as review results.
old_a_freeze=A3/'source-native-independent-a.final.freeze.json'
assert bind(old_a_freeze)['sha256']=='525319243dc51dafd0481df3f4305ffa8a7584c1934d2f2e24f5a7a412ba31b4'
for b in read(old_a_freeze)['files']:
    remember(b)
old_continuity=read(A3/'actual-exact-inputs-and-prior-review-continuity-independent-a.json')
for k in ['originalSourceInputBindings','activeChemistryCanonKindsVisualizationOnly']:
    for b in old_continuity[k]:
        remember(b)
binders=read(AUTHOR3/'seven-routine-uuid-and-fourteen-case-two-card-binders.author-candidate.json')
old=read(AUTHOR3/'qa-artifacts/DE_DEU_S_GYM_CANONICAL_CHEMIE.four-route-proposals.author-candidate.json')
new=read(AUTHOR/'qa-artifacts/DE_DEU_S_GYM_CANONICAL_CHEMIE.one-inherited-prerequisite.author-candidate.json')
oldmap={g['id']:g for g in old['goals']};newmap={g['id']:g for g in new['goals']}
routine_rows=[]
for key,gid in binders['routineGoalIds'].items():
    assert oldmap[gid]==newmap[gid]
    routine_rows.append({'routineLocalKey':key,'goalId':gid,'wholeGoalObjectExactV3':True,'resourceLinksExactV3':True,'scienceReview':'KEEP_VALID_V3_SOURCE_AND_V2_MATERIAL_SCOPE_ONLY','newNativeDPAOrVApproval':False})
cases={c['caseLocalKey']:c for c in read(V2/'cases.de-en.author-candidate.json')['cases']}
cards={c['cardLocalKey']:c for c in read(V2/'primary-cards.de-en.author-candidate.json')['cards']}
case_rows=[]
for b in binders['caseBinders']:
    c=cases[b['caseLocalKey']]
    assert valhash(c)==b['wholeCaseValueSha256']
    remember(b['materialFileBinding'])
    assert c['candidateGoalId']==b['bodyCandidateGoalIdNotRewritten']
    case_rows.append({'caseLocalKey':c['caseLocalKey'],'wholeCaseBodySha256Exact':b['wholeCaseValueSha256'],'UUIDBinderExact':b['nativeCandidateGoalId'],'bodyCandidateGoalIdStillHonest':c['candidateGoalId']})
card_rows=[]
for b in binders['primaryCardBinders']:
    assert valhash(cards[b['cardLocalKey']])==b['wholeCardValueSha256']
    remember(b['materialFileBinding'])
    card_rows.append({'cardLocalKey':b['cardLocalKey'],'wholeCardBodySha256Exact':b['wholeCardValueSha256'],'originBinderExact':b['nativeCandidateOriginGoalId'],'memoryVisibilityOrActivationApproval':False})
assert len(case_rows)==14 and len(card_rows)==2
visual_url=newmap[binders['routineGoalIds']['label']]['resourceLinks'][0]['url']
relative_asset=visual_url.removeprefix('/assets/goal-visualizations/')
image_paths=[ROOT/'curricula/DE/Gymnasium/visualizations'/relative_asset, ROOT/'app/public/assets/goal-visualizations'/relative_asset,ROOT/'backend/src/main/resources/static/assets/goal-visualizations'/relative_asset]
image_bindings=[bind(p) for p in image_paths]
assert len({b['sha256'] for b in image_bindings})==1
assert image_bindings[0]['sha256']=='4155782869f57adc2905499420841e60cf9374317d5a66ea6ccb4c985bea3e85'
for b in image_bindings:remember(b)
for p in [ROOT/'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf',ROOT/'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_CHEMIE_SEKI_BP2016_V2.source-extraction.json',ROOT/'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf',ROOT/'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java']:
    b=bind(p);inputs[b['path']]=b
native=read(OWN/'one-edge-all112-and-full-parent-contexts.actual-independent-a.json')
for b in native['inputBindings']:remember(b)
assert native['oldProtectedInheritedBroadExposure']==4 and native['currentProtectedInheritedBroadExposure']==0
assert native['wholeProtectedGoalsExactV3']==112
assert len(native['actualNineProtectedReviewUnion'])==9
receipt={'schemaVersion':1,'createdAtUTC':datetime.now(timezone.utc).isoformat(),'role':'Targeted exact continuity evidence accompanying real native/source/didactic review; hashes alone are not a subject review','authorV4Freeze':bind(af),'author8FilesVerified':len(freeze['files']),'author23InputBindingsVerified':len(freeze['inputBindings']),'oldIndependentAReviewPackageImmutableAndAllOwnFilesExact':True,'oldSourceInputFilesExact':len(old_continuity['originalSourceInputBindings']),'sevenWholeRoutineObjectsAndLinksExact':routine_rows,'fourteenMaterialsExact':case_rows,'twoCardsExact':card_rows,'labelActualImageThreeCopiesExact':image_bindings,'sixNewRoutineImageAbsenceNotApproved':True,'historicalAGENTSAuthorV3Pin':'b70ecef69785f31e6944f949fdbf5d1a139fdc78d85a2e0c5fc8c34b128e43ec','currentAGENTSActualBinding':bind(ROOT/'AGENTS.md'),'historicalAGENTSEqualityNotClaimed':True,'opaquePeerHistoricalFreezeChecksumsOnly':opaque_peer_freezes,'newPeerBResultsConsulted':False,'inputBindings':list(inputs.values()),'activeWrites':False,'humanApproval':False,'humanTrial':False,'newStrictCompletions':0,'restoredActiveBindings':0,'strictNetGain':0}
(OWN/'exact-v4-inputs-and-v3-material-source-image-continuity.actual-independent-a.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'authorFiles':8,'authorInputs':23,'immutableOwnV3':'PASS','materials14':'EXACT','cards2':'EXACT','routineGoals7':'EXACT','labelImageThreeCopies':'EXACT','sourceInputsPreserved':len(old_continuity['originalSourceInputBindings']),'boundedInputCount':len(inputs),'activeWrites':False}))
