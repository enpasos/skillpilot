from pathlib import Path
from copy import deepcopy
from hashlib import sha256
from datetime import datetime, timezone
import json,sys,subprocess
from jsonschema import Draft202012Validator

OUT=Path(__file__).resolve().parent
ROOT=next(p for p in OUT.parents if (p/'AGENTS.md').is_file())
def read(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':sha256(p.read_bytes()).hexdigest()}
def write(name,x):
    p=OUT/name
    with p.open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
    read(p);return bind(p)
before=read(OUT/'actual-before-frozen-four-materials-whole13-and-retained-P28-source.guards.json')
for b in before:assert bind(ROOT/b['path'])==b
materials=read(OUT/'whole-four-assigned-DEEN-materials.exact-review-input.json')
rows=read(OUT/'whole-thirteen-current-ordinary-contracts-and-retained-P28.exact-review-input.json')
counter=read(OUT/'actual-eight-whole-own-synthetic-submissions-and-individual-current-rubric-marks.json')
assert len(materials)==4 and len(rows)==13 and len(counter['wholeSubmissions'])==8
source=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1/whole-CAN470-additive-source30-both-reviewed-fab912-fields-only.author-successor-v2.json'
assert bind(source)['sha256']=='748add7af0d9096a81a7ab2cd8618c0ba08fbbade041a754c66fea423559f9bd'
nativepath=OUT/'four-independent-material-practiceAssessment.actual-native-bindings.json'
releasepath=OUT/'whole-four-Source25-income-methods-GK-LK-insolvency.independently-reviewed-machine-released.inert.json'
decisionpath=OUT/'actual-four-whole-DEEN-material-and-thirteen-performance-KEEP.individual-decisions.json'
if sys.argv[1]=='prepare':
    reasons={
    'c6f05990-4c2d-56ce-9412-3a4a4bcfc488':('income','s1','Im Material ausdrücklich Netto-Primäreinkommen derInländer mit vorausgesetztemKapitalverzehr; vierEinkommensposten undTransfer/Kredit getrennt, keineBIP-Gleichsetzung.'),
    '81ea1a00-5248-5e36-8ca0-3f3f48ac2385':('income','s2','Zwei verschiedeneGüter, Anfangswertbasen undKonstanthaltung; +1Substitute und−1Komplemente werden berechnet/bedingtinterpretiert.'),
    '25393414-3b59-56f9-ae1b-e785d9f8b21b':('income','s3','Einkommen stattEigenpreis imNenner; −2inferiorerHaushaltsfall mit Mengen-/Qualitäts-/Übertragungsgrenze.'),
    'df8db4bd-4e79-5ce1-bd4a-3ed04b17c6fb':('methods','s1','Tatsächlich eigeneKostenannahme/Größenbeziehung undMaterialprüfung allerDreiTage, keine bloßeWahl eines fertigenModells.'),
    'b1d7f1ab-371b-5e02-acb3-49f3938b2ba6':('methods','s2','Informationsbedarf und selbst ausgeführte öffentlicheSuche mit Methodik/gewähltemgeschlossenemMonat/Quellenjournal; eigeneractualDestatisWeg geprüft, Plan allein kann nichtbestehen.'),
    'd76af11e-7fb3-5e81-a622-9f3642efedaf':('methods','s3','Eigene beantwortbareFrage, Gegenstand/Tage/Beziehung/Antwort; eigene20Euro-Budgetfrage als tatsächlich ausgeführteAlternative zeigt keinVorlagenkopierzwang.'),
    'a04fc1a7-e037-580e-9324-9282f4acebc1':('methods','s4','Eigene Hypothese mit konsistentem stützendem/widersprechendemBefund und tatsächlich getrenntemFalltest.'),
    '943fd59c-661a-5163-b5a4-c6bb5a983855':('methods','s5','EigenesoffengelegtesErgebnis und nachfolgende tatsächlich substanzielle40erEinwandbearbeitung; keine reineErgebnisbehauptung.'),
    'b9a46f8e-9732-5bbc-8989-a8f1bf1c7ba0':('methods','s6','Erst eigenePosition, dann konkreterfiktiverBudget-/Mengeneinwand und tatsächlich eigeneAnschlussantwort; kein realerPrivatkontakt erforderlich.'),
    '431ed662-a906-5d96-b81f-35a66c3683cd':('gk','s1','WirtschaftlicheKrisenerkennung und zweiAkteurrollen; Buchwert/Hoffnung sind keine aktuelleLiquidität undTeilrechnungkeinegesetzlicheSubsumtion.'),
    'a6a8bf1a-a131-5f17-9113-02a1321899e4':('gk','s2','VorgegebeneaggregierteF1/F2werdenpreis-/nachfrage-/beschäftigungsbezogen eingeordnet undvomEinzelfirmenschlussbegrenzt.'),
    'f0b1bd59-a2ce-562b-bb63-6927f590dce2':('gk-and-lk','gk:s3/lk:s1','Aktuelle17/18/19Normen undnormgerechtbegrenzteGmbHFälle; heutige/künftigeLiquidität undDeckung/Fortführungunterschieden, C+Ausnahmeanwendungsfall. GK/LKMaterialscoren dieselbe Leistungohne fremdeLKVerfahrenspflichtimGK.'),
    '2790f704-116b-577d-aca7-b502d57a21f6':('lk','s2','GrundimVgerichtlichgegeben; Antrag/Kostenprüfung/Eröffnung/Verwalter/kollektiverZweckmitV/V+undAusnahmen. Kein neuerf0Goalrequire für denProceduresatom aus dieserMaterialprüfung abgeleitet.'),
    }
    assert set(reasons)=={r['goalId'] for r in rows}
    decisions=[]
    for r in rows:
        package,task,reason=reasons[r['goalId']]
        decisions.append({'goalId':r['goalId'],'wholeCurrentGoalRead':True,'wholeDEENPerformanceAndNativePContentRetained':True,
            'assignedPackage':package,'actualTaskSlot':task,'decision':'KEEP','independentReasonDe':reason,
            'nativePositiveGoalResourceContextRebindingApprovedHere':False,'sourceOrCourseRoleApprovedHere':False})
    write(decisionpath.name,{'reviewer':'/root','originalMaterialAuthor':'/root/economics_independent_continuation_a',
        'independentOfWholeMaterialAuthor':True,'wholeMaterials':4,'wholeUniqueGoalContracts':13,'scoredSlots':14,'individualPerformanceDecisions':decisions,
        'wholeDEENMaterialDecisions':[{'materialId':g['id'],'decision':'KEEP','wholeTaskSolutionRubricDEENActuallyRead':True,
            'minimalRequires':g['requires'],'minimalRequiresDecision':'KEEP','coveredGoalIdsExactlyDirectAssessedRequires':g['examData']['coveredGoalIds']==g['requires'],
            'requiresReasonDe':'Alle und nur direkt bewerteten ordinaryLeistungen diesesganzen Endpunkts. Grundvergleich ist inbeidenMaterialeigeneeigeneAufgabe; Verfahrensziel behandelt dagegen gegebenenGrund. Methodenkonstruktionen/recherchieren/Frage/Hypothese/Kritik/Dialog sind sechs tatsächlich ausgeführte, getrennt bewertbareLeistungen.',
            'currentMaxAndPassingPoints':g['examData']['scoring'],'unresolvedFindings':[]} for g in materials],
        'DEENEquivalentDemandsDataExceptionsPointsThresholdsAndExecutionBoundary':True,
        'current13PRecords28CaseBriefsReusedWholeWithoutScienceRestart':True,
        'needsHumanReviewAiCandidateE1G1TruthfulUnchanged':True,
        'methodSixExecutionConditionDoesNotRequirePerfectWork':True,
        'sourceCountryCoverageMemoryCardVisibilityImageVisualOrDualDescriptionApproval':False,
        'humanReleaseTrialsApproval':False})
    released=deepcopy(materials)
    for b,a in zip(materials,released):
        assert b['examData']['reviewStatus']=='draft'
        a['examData']['reviewStatus']='released'
        expected=deepcopy(b);expected['examData']['reviewStatus']='released'
        assert a==expected
    write(releasepath.name,released)
    print(json.dumps({'preparedWholeRelease':bind(releasepath),'individualWholeScience':bind(decisionpath),'liveWrites':False,'nativeAndFinalSealPending':True}))
elif sys.argv[1]=='seal':
    native=read(nativepath);release=read(releasepath);decisions=read(decisionpath)
    assert len(native['decisions'])==4 and native['nativeNormalizeGraphErrors']==[]
    assert {x['goalId'] for x in native['decisions']}=={g['id'] for g in materials}
    frame=read(source);assert len(frame['goals'])==470
    assert not {g['id'] for g in frame['goals']}&{g['id'] for g in release}
    frame['goals'].extend(release)
    errors=[{'path':list(e.path),'message':e.message} for e in Draft202012Validator(read(ROOT/'docs/landscape-runtime.schema.json')).iter_errors(frame)]
    assert not errors,errors
    sys.path.insert(0,str(ROOT/'scripts'))
    from validate_schemas import curriculum_symlink_errors
    symlinks=curriculum_symlink_errors(ROOT);assert not symlinks,symlinks
    for b in before:assert bind(ROOT/b['path'])==b
    owned=sorted(p for p in OUT.iterdir() if p.is_file())
    for p in owned:
        if p.suffix in ['.json','.jsonl']:
            assert p.read_bytes().endswith(b'\n') and b'\r\n' not in p.read_bytes(),p
            read(p)
    req=[ROOT/b['path'] for b in before]+owned+[source,ROOT/'docs/landscape-runtime.schema.json']
    ignore=subprocess.run(['git','check-ignore','--no-index','--']+[str(p.relative_to(ROOT)) for p in req],cwd=ROOT,capture_output=True,text=True)
    assert not ignore.stdout.strip(),ignore.stdout
    final=write('actual-final-independent-four-Source25-whole-materials-thirteen-performances-P28-KEEP.receipt.json',{
        'at':datetime.now(timezone.utc).isoformat(),'reviewer':'/root','originalWholeMaterialAuthor':'/root/economics_independent_continuation_a',
        'independentOfOriginalMaterialAuthor':True,'decision':'KEEP','wholeMaterialBodies':4,'wholeOrdinaryContracts':13,'scoredSlots':14,
        'retainedWholePRecords':13,'retainedWholeDEENApplicationCaseBriefs':28,'positiveStatusAuthority':'needs_human_review / ai_candidate / E1 / G1',
        'individualWholeScientificDecisions':bind(decisionpath),'wholeMachineReviewedReleasedMaterials':bind(releasepath),
        'onlyReleasedMaterialDelta':['examData.reviewStatus'],
        'ownWholeEightCounterSubmissionsAndEveryRubricFacet':bind(OUT/'actual-eight-whole-own-synthetic-submissions-and-individual-current-rubric-marks.json'),
        'actualCounterScores':[x['actualAwarded'] for x in counter['wholeSubmissions']],
        'actualCounterPasses':[x['passesThisMaterialThreshold'] for x in counter['wholeSubmissions']],
        'actualMethodMissingResearch31Capped21Below22':True,'actualImperfectOwnExecution25CanPass22':True,
        'actualMeaningfulIndependentNumericChecks':35,'numericCountQualification':bind(OUT/'actual-four-independent-hard-expected-differences-and-truthful-thirty-five-check-count.successor.json'),
        'actualWholeEightCurrentInsOProvisionsAndOwnBoundedDestatisResearch':bind(OUT/'actual-eight-whole-current-InsO-provisions-and-own-executed-closed-month-index-research.receipt.json'),
        'actualNativeKindAndNormalizedFourBindings':bind(nativepath),'inMemory474WholeRuntimeSchemaErrors':errors,
        'allOriginalFrozenWholeSourceAndPInputsBeforeAfterExact':before,
        'curriculumSymlinkErrors':symlinks,'ignoredRequiredReplayInputs':0,
        'ownRequiredPortableInputManifest':write('actual-own-whole-four-review-required-portable-inputs.manifest.json',[bind(p) for p in sorted(set(req))]),
        'historicalValidPReviewRestarted':False,'wholeSourceCountryCourseTargetApplicabilityApproved':False,
        'memoryCardsVisibilityCurrentOwnerPageDualDescriptionOrVisualApproved':False,
        'humanQualityRightsReleaseOrTrialsApproved':False,'liveCanonicalRegistryOrQAChanged':False,
        'runtimePrivacyPluginPublishChanged':False,'newStrictAcademicClosures':0,'restoredStrictBindings':0,'strictNetGain':0,
        'strictFrame':'300/311 current, M2; no fresh central report and no whole-current integration claimed',
        'nextStep':'Combine only these four accepted whole materials with the other four foreign accepted whole materials and independently reviewed pure navigation; freeze source/course/applicability and current owner/book once stable.'})
    print(json.dumps({'final':final,'wholeMaterialsKEEP':4,'ordinaryContracts':13,'retainedCases':28,'actualCounterScores':[x['actualAwarded'] for x in counter['wholeSubmissions']],'nativeKinds':4,'schemaErrors':0,'symlinkErrors':0,'ignoredRequiredInputs':0,'strictNetGain':0}))
else:raise ValueError(sys.argv[1])
