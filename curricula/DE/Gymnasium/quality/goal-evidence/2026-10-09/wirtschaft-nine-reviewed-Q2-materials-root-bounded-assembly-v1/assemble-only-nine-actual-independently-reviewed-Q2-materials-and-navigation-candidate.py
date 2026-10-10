from pathlib import Path
from copy import deepcopy
from datetime import datetime, timezone
from hashlib import sha256
import json
import subprocess
import sys
from jsonschema import Draft202012Validator

OUT=Path(__file__).resolve().parent
ROOT=next(p for p in OUT.parents if (p/'AGENTS.md').is_file() and (p/'curricula').is_dir())
BASE=OUT.parent
E9=BASE/'wirtschaft-nine-reviewed-E40-materials-root-integration-candidate-v1/one-existing5317-schema-and-reviewed-description-bounded-successor-v2'
AUTHOR=BASE/'wirtschaft-Q2-forty-native-terminal-gaps-nine-whole-materials-author-v1/nine-whole-Q2-portable-official-reference-and-own-aid-successor-v6'
ROOT_FIRST=BASE/'wirtschaft-four-Q2-materials-independent-root-v1'
ROOT_DELTA=BASE/'wirtschaft-two-Q2-three-findings-independent-delta-root-v1'
FOREIGN_FIRST=BASE/'wirtschaft-five-Q2-LK-money-distribution-skills-competition-and-outside-hearing-independent-whole-material-review-v1'
FOREIGN_DELTA=BASE/'wirtschaft-four-Q2-money-skills-hearing-competition-independent-seven-findings-delta-review-v1'
def read(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':sha256(p.read_bytes()).hexdigest()}
def write(name,data):
    p=OUT/name
    with p.open('x') as f:f.write(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    read(p)
    return bind(p)
releases=[ROOT_FIRST/'whole-two-Q2-enterprise-and-legal-materials.only-reviewed-machine-status-released.inert.json',ROOT_DELTA/'whole-two-Q2-labour-inflation-successors.only-reviewed-machine-material-status-released.inert.json',FOREIGN_FIRST/'whole-five-materials-one-machine-released-four-DRAFT.inert.reviewed-candidate.json',FOREIGN_DELTA/'whole-four-Q2-seven-findings-resolved.machine-released.inert.reviewed-candidate.json']
reviews=[ROOT_FIRST/'actual-final-independent-four-Q2-whole-materials-two-KEEP-two-REVISE-and-three-real-findings.receipt.json',ROOT_DELTA/'actual-final-independent-two-Q2-three-real-findings-resolved-KEEP.receipt.json',FOREIGN_FIRST/'actual-final-independent-five-Q2-whole-materials-one-KEEP-four-REVISE-seven-bounded-findings.receipt.json',FOREIGN_DELTA/'actual-final-independent-four-Q2-v8-seven-findings-resolved-KEEP.receipt.json']
framepath=E9/'whole-CAN416-nine-reviewed-E40-materials.current-root-inert-integration.json'
originalpath=AUTHOR/'whole-nine-Q2-DRAFT-assessment-goals.source-portable-successor-v6.json'
inputs=releases+reviews+[framepath,originalpath,E9/'actual-final-nine-reviewed-E40-inert-integration-native-book-graph-types-and-current-production-routes.receipt.json',E9/'semantic416.only-nine-actual-reviewed-material-input-bindings.inert.json',ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json']
guards=[bind(p) for p in inputs]
assert bind(reviews[0])['sha256']=='663f9902030c54cde583462e99a250919a7c2e8f4712b398ead531b12519c2d8'
assert bind(reviews[1])['sha256']=='250706f7531875047b630e6d242a2d75fbb323dd1f0f27536e88905c0562468b'
assert bind(reviews[2])['sha256']=='9e184b1c16cd0b2773512b16c38447096972d3c4629f32e8f6ac4fd0398e8c71'
assert bind(reviews[3])['sha256']=='18a400ac51a231d36a0efc9b7dd7777103b0c07725efbab09799a4c0ad60c06d'
accepted={}
for p in releases:
    for g in read(p):
        if g['examData']['reviewStatus']=='released':
            assert g['id'] not in accepted
            accepted[g['id']]=g
originals=read(originalpath)
assert len(accepted)==9 and set(accepted)=={g['id'] for g in originals}
ordered=[accepted[g['id']] for g in originals]
contracts=set(t for g in ordered for t in g['examData']['coveredGoalIds'])
assert len(contracts)==44
material_deltas=[]
kind_decisions=[]
for old,g in zip(originals,ordered):
    assert {k:v for k,v in old.items() if k!='examData'}=={k:v for k,v in g.items() if k!='examData'}
    assert g['requires']==g['examData']['coveredGoalIds']
    assert g['examData']['scoring']['maxPoints']==old['examData']['scoring']['maxPoints']
    assert g['examData']['scoring']['passingPoints']==old['examData']['scoring']['passingPoints']
    assert [(s['id'],s['points']) for s in g['examData']['scoring']['steps']]==[(s['id'],s['points']) for s in old['examData']['scoring']['steps']]
    assert sum(s['points'] for s in g['examData']['scoring']['steps'])==g['examData']['scoring']['maxPoints']
    material_deltas.append({'goalId':g['id'],'changedExamFieldsSinceOriginalV6':[k for k in old['examData'] if old['examData'][k]!=g['examData'][k]],'wholeOuterGoalAndMinimalRequiresExact':True,'wholeMaximumPassingAndPartialPointsExact':True})
    kind_decisions.append({'goalId':g['id'],'semanticKind':'practiceAssessment','decisionStatus':'authoritative','decisionBasis':'reviewed-current-pilot-practice-assessment','reviewer':'/root','independentFromOriginalMaterialAuthor':True,'wholeTitleAndDEENDescriptionAndOuterContractActuallyRead':True,'wholeAcceptedMaterialReviewReusedByExactReleaseBodies':True,'reasonDe':'Dies ist ein vollständiges kohärentes Dossier mit mehreren ausdrücklich vorausgesetzten fachlichen Zielkompetenzen, Aufgaben, Lösungen und Rubrik. Es ist ein terminales Übungs-/Assessmentangebot und kein zusätzliches curricularAtomic-Kompetenzatom. Die46 direkt vorausgesetzten Leistungsbindungen mit44 verschiedenen Zielen bleiben unverändert; keine semantische Umklassifizierung eines bestehenden gewöhnlichen Ziels.','ordinarySourceOrCourseRoleApproved':False,'humanApproval':False,'strictGain':0})
materials=write('whole-nine-Q2-materials.actual-independent-reviewed-machine-release.candidate.json',ordered)
sem=write('nine-individual-independent-whole-Q2-semantic-kind-practiceAssessment-decisions.json',kind_decisions)
frame=read(framepath);oldframe=deepcopy(frame)
oldby={g['id']:g for g in frame['goals']}
assert len(frame['goals'])==416 and not set(accepted).intersection(oldby)
assert contracts.issubset(oldby)
nav_id='5982abda-0b0e-51a5-930f-1f58bd757f30'
nav=next(g for g in frame['goals'] if g['id']==nav_id)
oldnav=deepcopy(nav)
assert nav['requires']==[] and len(nav['contains'])==2
# An already registered prerequisite-free navigation cluster can host the nine
# reviewed dossiers without imposing the old Q2 full-quarter prerequisites.
# These authored wording changes require their own independent description
# decision; no such approval is manufactured by this technical assembly.
nav['title']='Übungen Q2: abgegrenzte Wirtschafts- und Rechtsfälle'
nav['titleEn']='Q2 practice: defined economic and legal cases'
nav['description']='Bündelt zwei bisherige betriebswirtschaftliche Fälle und neun ergänzende, jeweils abgegrenzte Dossiers zu Wettbewerb, Verteilung und sozialer Sicherung, Inflation und Konjunktur, Geldpolitik und Währungsunion, Qualifizierung und Arbeitsorganisation, Finanzierung und Tarifpolitik, Unternehmensentscheidungen, Arbeitsmarkt und Kauf-/Schadensersatzrecht. Jedes Material hat seine eigenen ausdrücklich benannten Voraussetzungen; dieser Navigationscluster fügt keine weitere fachliche Voraussetzung hinzu.'
nav['descriptionEn']='Groups two existing business cases and nine additional, individually defined dossiers on competition, distribution and social security, inflation and the cycle, monetary policy and monetary union, skills and work organisation, finance and bargaining, business decisions, the labour market, and sales law and damages. Each material has its own explicit prerequisites; this navigation cluster imposes no additional subject prerequisite.'
nav['contains']=oldnav['contains']+[g['id'] for g in ordered]
frame['goals'].extend(deepcopy(ordered))
after={g['id']:g for g in frame['goals']}
assert len(after)==425 and all(after[g['id']]==g for g in oldframe['goals'] if g['id']!=nav_id)
assert all(after[g['id']]['examData']==g['examData'] for g in oldframe['goals'] if g.get('examData'))
nav_proposal=write('whole-existing5982-navigation-eleven-materials.bounded-root-author-description-successor.candidate.json',{'oldWholeNavigationGoal':oldnav,'newWholeNavigationGoal':nav,'changedFields':[k for k in oldnav if oldnav[k]!=nav[k]],'materialIdsAdded':[g['id'] for g in ordered],'existingTwoMaterialGoalIdsExact':oldnav['contains'],'containsEleven':True,'requiresExactlyEmpty':True,'newRootOrClusterIds':0,'originalCurrentProductionRegistrationContainsThisCluster':True,'independentWholeDEENNavigationDescriptionReview':'pending','fullScopeOrCourseApproval':False,'humanApproval':False,'strictGain':0})
can=write('whole-CAN425-reviewed-E9-plus-reviewed-Q2-nine-and-one-navigation-candidate.inert.json',frame)
runtime_schema=Draft202012Validator(read(ROOT/'docs/landscape-runtime.schema.json'))
errors=[{'path':list(e.path),'message':e.message} for e in runtime_schema.iter_errors(frame)]
assert not errors,errors
sys.path.insert(0,str(ROOT/'scripts'))
from validate_schemas import curriculum_symlink_errors
symlinks=curriculum_symlink_errors(ROOT);assert not symlinks,symlinks
assert guards==[bind(p) for p in inputs]
ignored=subprocess.run(['git','check-ignore','--no-index','--']+[str(p.relative_to(ROOT)) for p in inputs],cwd=ROOT,capture_output=True,text=True);assert not ignored.stdout.strip(),ignored.stdout
final=write('actual-final-nine-reviewed-Q2-materials-and-independent-kind-with-bounded-navigation-author-candidate.receipt.json',{'at':datetime.now(timezone.utc).isoformat(),'integrator':'/root','roleBoundary':'Integrator of independently reviewed material bodies and independent kind reviewer; author only for the five changed navigation fields, whose independent description review remains pending.','frozenInputs':guards,'actualAcceptedWholeNineMaterials':materials,'independentWholeKindDecisions':sem,'navigationAuthorSuccessor':nav_proposal,'actualInertFrame425':can,'currentUniqueWholePerformanceContracts':44,'originalGapIntakeCount':40,'existing415WholeGoalsExact':True,'existing56WholeExamDataExact':True,'originalNineDRAFTBytesRetained':True,'wholeScoringThresholdsAndPartialPointsExact':True,'wholeCAN425SchemaErrors':errors,'actualSymlinkErrors':symlinks,'nativeBookAndCurrentProductionRouteRunPerformed':False,'semanticNativeFingerprintLedger425Prepared':False,'ownerPageAndDualIndependentDescriptionReviewApproved':False,'wholeSource125OrCourseScopeApproved':False,'liveWrites':False,'humanApproval':False,'newStrictAcademicClosures':0,'restoredStrictBindings':0,'strictNetGain':0,'nextStep':'Independently review the two full navigation descriptions and unchanged empty prerequisite contract; then create the actual425 semantic-input successor and run scoped native book/owner/current-production route checks once.'})
print(json.dumps({'receipt':final,'machineReviewedWholeMaterials':9,'independentKinds':'practiceAssessment9','uniquePerformanceContracts':44,'frameGoals':425,'schemaErrors':0,'symlinkErrors':0,'navigationIndependentReview':'pending','strictNetGain':0}))
