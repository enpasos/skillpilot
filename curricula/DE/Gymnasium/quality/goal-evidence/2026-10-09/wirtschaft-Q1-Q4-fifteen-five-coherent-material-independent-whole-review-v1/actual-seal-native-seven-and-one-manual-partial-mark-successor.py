from pathlib import Path
from datetime import datetime, timezone
from copy import deepcopy
import hashlib
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent


def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def ref(p):
    return {'path':str(p.relative_to(ROOT)),'sha256':digest(p),'wholeBytes':p.stat().st_size}


def read(p):
    return json.loads(p.read_text(encoding='utf-8'))


def write(name,value):
    p=OUT/name
    assert not p.exists(), 'Never overwrite immutable original or sealed successor'
    p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    read(p)
    return p


previous_path=OUT/'actual-final-five-coherent-Q1-Q4-materials-fifteen-whole-performances-independent-KEEP-and-inert-machine-release.receipt.json'
assert digest(previous_path)=='def70a49f3a356dc0dc75bf5664eaa0fe817e6ca97ded598694e9d35277dc182'
previous=read(previous_path)
guard_path=OUT/'actual-independent-whole-frozen-input-P30-schema-DAG-and-portability-guards.json'
guards=read(guard_path)
for item in guards['wholeInputsAfter'].values():
    assert digest(ROOT/item['path'])==item['sha256'],item['path']
old_counter_path=OUT/'actual-independent-ten-whole-counteranswers-with-individual-rubric-judgments.json'
old=read(old_counter_path)
new=deepcopy(old)
rows=new['counteranswers']
target=next(c for c in rows if c['id']=='arithmetic-with-unproven-fairness-impact-and-liability')
assert target['taskPoints']==[0,2,2,2] and target['effectivePoints']==6
target['taskPoints']=[0,2,2,1]
target['rawPoints']=5
target['effectivePoints']=5
target['componentReasonsDe'][3]='K2-Gruppen-/Stichprobendeutung ist richtig und erhält1von2Teilpunkten dieser Einheit. Die ausdrücklich falsche Gleichsetzung der Unterschrift mit wirksamer Kontrolle verhindert die volle2BE-Einheit. K1-Abwägung/Alternative und bedingte Lösung fehlen; Aufgabe4 insgesamt1/6BE.'
new['boundedOwnManualRubricCorrection']={'originalInput':ref(old_counter_path),'counteranswerId':target['id'],'wholeAnswerUnchanged':True,'oldTask4Points':2,'correctedTask4Points':1,'oldWholeScore':6,'correctedWholeScore':5,'passingPoints':15,'whyDe':'Eigene Nachprüfung der ganzen2BE-Einheit K2 zeigt korrekte Gruppen-/Stichprobendeutung, aber ausdrücklich falsche tatsächliche Kontrollbewertung. Das verdient nur einen Teilpunkt. Diese konkrete manuelle Fachbewertung ist keine Schlüsselwortregel. Beide Fassungen liegen unter15; fünf Materialien/15WholePerformance-Urteile ändern sich nicht.'}
for left,right in zip(old['counteranswers'],rows):
    assert left['wholeAnswerDe']==right['wholeAnswerDe']
    if left['id']!=target['id']:assert left==right
    assert right['effectivePoints']<right['passingPoints']
counter_path=write('actual-independent-ten-whole-counteranswers.one-K2-partial-mark-bounded-successor-v2.json',new)
native_path=OUT/'actual-native-seven-independent-whole-decision-source-fingerprints.result.json'
assert digest(native_path)=='772101920969a76cde91367a809a62a11ec561a4d693f7e31c235b3217eaebb2'
native=read(native_path)
assert len(native['decisions'])==7
assert all(r['semanticKind']=='practiceAssessment' and r['decisionStatus']=='authoritative' and r['sourceFingerprint'].startswith('sha256:') for r in native['decisions'])
assert digest(ROOT/'app/scripts/goalBookModel.ts')==native['helperWholeSha256']
for field in ['actualIndependentMaterialSource','actualPureNavSource','actualWholeIndependentKindDecisions']:
    assert digest(ROOT/native[field]['path'])==native[field]['sha256']
own_paths=sorted(p for p in OUT.iterdir() if p.is_file())
own_before=[ref(p) for p in own_paths]
sys.path.insert(0,str(ROOT/'scripts'))
from validate_schemas import curriculum_symlink_errors
errors=curriculum_symlink_errors(ROOT)
assert not errors,errors
ignore=subprocess.run(['git','check-ignore','--no-index','--stdin'],cwd=ROOT,input='\n'.join(str(p.relative_to(ROOT)) for p in own_paths)+'\n',text=True,capture_output=True)
assert ignore.returncode==1 and not ignore.stdout.strip(),ignore.stdout+ignore.stderr
assert all(read(p) for p in OUT.glob('*.json'))
for item in guards['wholeInputsAfter'].values():
    assert digest(ROOT/item['path'])==item['sha256']
assert own_before==[ref(p) for p in own_paths]
receipt=write('actual-final-five-KEEP-fifteen-performance-P30-seven-native-kind-bindings-and-one-partial-mark-successor-v2.receipt.json',{
    'schemaVersion':1,'reviewedAt':datetime.now(timezone.utc).isoformat(),
    'reviewer':'/root/economics_source3_independent_final_performance_need',
    'author':'/root/economics_independent_continuation_a',
    'independentOfMaterialAuthor':True,
    'previousImmutableWholeScientificKEEPReceipt':ref(previous_path),
    'actualAcceptedFiveWholeMaterials':previous['machineReleasedInertKEEPBodies'],
    'actualFiveWholeScientificKEEPDecisions':previous['fiveWholeMaterialDecisions'],
    'actualFifteenIndividualWholePerformanceMinimalRequiresKEEPDecisions':previous['fifteenIndividualWholePerformanceMinimalRequiresDecisions'],
    'actualCurrentTenWholeManuallyJudgedCounteranswers':ref(counter_path),
    'ownCounteranswerChangeScope':'Only one explicit manual partial-mark correction6→5 for missing effective K2 control; all ten actual whole answers and nine complete judgments are unchanged, both old/new remain below pass. No material/source/goal change.',
    'actualSevenNativeIndependentWholeKindSourceBindings':ref(native_path),
    'actualNativeCommandStdout':ref(OUT/'actual-native-seven-independent-source-bindings.stdout.txt'),
    'actualNativeCommandStderr':ref(OUT/'actual-native-seven-independent-source-bindings.stderr.txt'),
    'actualNativeHelperSourceGuard':{'path':'app/scripts/goalBookModel.ts','sha256':native['helperWholeSha256']},
    'ownNumericGameAndPlanOnlyCapChecks':previous['ownNumericAndRubricBoundaries'],
    'actualIndependentPrimaryReads':previous['actualIndependentPrimaryReads'],
    'retainedWholeExternalInputGuards':previous['wholeFrozenInputsAndPortability'],
    'wholeOwnInputsExactBeforeAfter':own_before,
    'wholeExternalInputCount':guards['wholeInputCount'],
    'allWholeExternalAndOwnInputsExact':True,
    'allOwnJSONFullParse':True,
    'normalCurriculumSymlinkErrors':errors,
    'allOwnPathsGitIgnorePassed':True,
    'counts':previous['counts'],
    'nativeTechnicalBindingCount':7,
    'allFiveMaterialDecisions':'KEEP',
    'allFifteenIndividualAssessedPerformanceMaterialRequiresDecisions':'KEEP',
    'oldWholePProfilesRetained':15,'oldWholePCasesRetained':30,
    'mandatoryActualParticipationBoundary':previous['mandatoryActualParticipationBoundary'],
    'protectedScopeBoundaries':previous['protectedScopeBoundaries'],
    'strictBaselineFromParentOnly':previous['strictBaselineFromParentOnly'],
    'wholeOfficialPdfOrFullExtractNewlyCommitted':False,
    'humanApproval':False,'actualLearnerOrClassTrial':False,
    'liveWrites':[],'newStrictGoalClosures':0,'restoredStrictBindings':0,'strictNetGain':0,
    'nextStep':'Root may assemble the five actual inert machine-released KEEP bodies and seven actual native practiceAssessment decisions. Explicit9-cluster registration, four future-target roles, source/course closure and changed owner-page/context dual-D integration checks remain separate.'
})
print(json.dumps({'receipt':ref(receipt),'KEEP':5,'wholePerformanceKEEP':15,'nativeBindings':7,'wholeCounteranswers':10,'numericChecks':81,'P30ExactRetained':True,'symlinkErrors':0,'strictNetGain':0},ensure_ascii=False))
