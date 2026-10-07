import json, pathlib, hashlib, datetime
root = pathlib.Path('/home/enpasos/projects/skillpilot')
base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
own = base + 'chemie-current-eight-native-positive-independent-b-v3/'
author = base + 'chemie-current-atomic-description-positive-gap-author-v2/'
old = base + 'chemie-current-atomic-description-positive-gap-author-v1/'
actual_inputs = {}
def read(path):
    data = (root / path).read_bytes()
    actual_inputs[path] = dict(path=path,sha256=hashlib.sha256(data).hexdigest(),bytes=len(data))
    return json.loads(data)
freeze = read(author+'description-positive-gap-author-v2.final.freeze.json')
assert actual_inputs[author+'description-positive-gap-author-v2.final.freeze.json']['sha256'] == 'b3e093b91ebd49e6c61013fe90bebedb97473a201a2125825bcfa3463e03edaa'
prep = read(own+'preparation-only.actual.json')
scope = prep['scopeGoalIds']
goals = {r['id']:r for r in read(author+'prospective-current378.canonical.author-candidate.json')['goals']}
specs = read(author+'fifteen-positive-profile-specifications.author-corrections.candidate.json')
materials = read(author+'thirty-complete-materials.de-en.author-corrections.candidate.json')['materials']
original_specs = read(old+'fifteen-positive-profile-specifications.author-candidates.json')
original_materials = read(old+'thirty-complete-materials.de-en.author-candidates.json')['materials']
prior_science = read(base+'chemie-current-fifteen-native-positive-independent-b-v1/actual-thirty-materials-fifteen-profiles.science-independent-b.json')
by_spec = {r['goalId']:r for r in specs['goals']}
old_specs = {r['goalId']:r for r in original_specs['goals']}
def whole_digest(v):
    return 'sha256:'+hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
notes = {
    'dd58c029': 'Die erste required essentialUnderstanding trennt jetzt eindeutig Strukturverknüpfung von bloßen Atomzahlen der Summenformel. Ganze unveränderte C4/C5-Fälle sind valenzrichtig; CH₂-Homologie, Isomerie und selbst gezeichnete Mehrfachbindungen bilden die gesamte begrenzte Kompetenz ab. Alkine gehören im tatsächlichen HE-Kontext Q1.1, nicht allein E3.',
    '3d3231f9': 'Alle drei required Erwartungen gelesen. positive-melting-model-explanation ist zwingend und im vollständigen zweiten Fall positiv bearbeitbar: die vorgegebene symmetrische Packung wird als qualitative Modellannahme mit den richtigen gerundeten NIST-Fusionsdaten verknüpft. Schmelzen ändert Festkörperordnung, nicht kovalente Moleküle; London-Anziehung bleibt in der Flüssigkeit. Wasserstoffbrücken, Sieden und Ethanol/Hexan-1-ol-Mischbarkeit sind richtig begründet. Kein erfundener Kristallstrukturnachweis oder allgemeines branching→melting-Gesetz.',
    '5a30273a': 'Der vollständige Lösemittelfall und der neue Isomer-Fusionsfall decken Auswahl, testbare qualitative Vorhersage und positive Schmelzerklärung ab. structure-model-reasoning verlangt ausdrücklich eine überprüfbare Vorhersage, positive-melting-model-explanation die begründete Schmelzordnung unter den gelieferten Modellannahmen. Die NIST-Zahlen sind gegebene Daten, keine aus London-Kräften berechneten numerischen Vorhersagen. Kein Anspruch einer numerisch eindeutigen Schmelzprognose ohne Packungsdaten; gleiches C5H12 verhindert falsche molare-Masse-Erklärung.',
    '622f09e5': 'Das neue required independent-test-choice-conditions-controls verlangt eine eigene geeignete Methodenangabe für frische Probe C, Dunkel-/Lösemittel-/Mischbedingungen, erwartete Beobachtung sowie Positiv-/Negativ-/Blindkontrolle. Der vollständige Fall verlangt diese aktive Wahl jetzt ausdrücklich. Lichtsubstitution, physische Farbverteilung und weitere bromverbrauchende Stoffe begrenzen den Befund. Beide Bindungsbilanzen bleiben richtig; generisches H₂/Cl₂-Bild ist fachlich gültig und wird hier nicht als Fehler bezeichnet.',
    'b8d3b453': 'Beide ganzen unveränderten Materialien, alle required Erwartungen und das tatsächliche neue PNG persönlich geprüft. C6H6+Br2→C6H5Br+HBr ist bilanziert; vorgegebene Lewis-Säure-Aktivierung und aromatische Stabilisierung begrenzen den Fall. Das PNG zeigt E und H am selben vierbindigen Kohlenstoff, zwei π-Bindungen und eine Zwischenladung, danach ein E-Substituent und H⁺ bei restaurierter Aromatizität. Der frühere konkrete Zwei-E-/Ladungsfehler ist in diesen neuen Bytes nicht vorhanden. Dies ist eine P-Materialpassung; die neue native D-Stufe und unabhängige V bleiben getrennt.',
    '9decc36b': 'Der neue ganze DE/EN-Goal beschreibt ausdrücklich vorgegebene Molekülpaare gleicher Konstitution. Ganze unveränderte E/Z- und Alanin-Spiegel-/Rotationsfälle verlangen genau diese Relation und eigene räumliche Modellhandlungen; keine isolierte Molekülbenennung als Stereoisomerie-Test. E/Z-Betrachtung im HE-Q1.1-LK und Enantiomerie im Q2.1-Kontext bleiben begrenzt; nicht alle nationalen Stereochemietypen/Stufen werden freigegeben.',
    '973c12d9': 'Die erforderliche observablePerformance fordert nun tatsächlich beaufsichtigte Ausführung eines konkret lokal freigegebenen Protokolls, eigenen Umgang mit Vergleich/Kontrollen, eigene tatsächliche Beobachtungen und Redoxdeutung. Ganzer erster Fall und beide Required-Felder gelesen: fiktive Papierdaten erfüllen den praktischen Anteil ausdrücklich nicht, kein heutiges freigegebenes Protokoll oder schon erfolgte Durchführung behauptet. Das tatsächliche PNG beschränkt Tollens/Fehling auf Ethanal/Propanon, passende sichtbare Produkte und Reaktionsgrenzen; unbekannte Gemische bleiben im zweiten Fall begrenzt.',
    '363c5740': 'Der aktuelle vollständige DE/EN-Goal und die neue required Erwartung passen: besetztes nichtbindendes O-Donororbital und explizit vorgegebenes energetisch geeignetes unbesetztes Zentralion-Akzeptororbital werden zugeordnet und ihre Bindungsbildung erläutert. Ganzer geänderter erster Fall und unveränderter frischer Koordination/Redox-Gegenfall sind korrekt. Cu(II)-Tartrat-Komplexierung hält Kupfer in alkalischer Lösung; Koordination ist keine Cu(II)→Cu(I)-Reduktion. Keine sämtlich leeren Cu-d-Orbitale, universale ganze Komplexgeometrie oder GK-Pflicht behauptet.',
}
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
rows=[];case_rows=[];own_specs=[]
for goal_id in scope:
    goal = goals[goal_id];spec=by_spec[goal_id]
    reason = notes[goal_id[:8]]
    linked=[m for m in materials if m['goalId']==goal_id]
    assert len(linked)==2
    for material,brief in zip(linked,spec['profile']['applicationCaseBriefs']):
        assert material['caseId']==brief['id']
        for suffix,lang in [('De','de'),('En','en')]:
            assert brief['taskDemand'+suffix]==material['material'][lang]+' '+material['taskDemand'][lang]
            assert brief['expectedPerformance'+suffix]==material['expectedPerformance'][lang]
            assert brief['understandingFocus'+suffix]==material['specificBoundaryOrCounterexample'][lang]
        old_material=next(m for m in original_materials if m['caseId']==material['caseId'])
        case_rows.append(dict(goalId=goal_id,caseId=material['caseId'],decision='KEEP',completeDEENMaterialActuallyReviewed=True,exactNativeBriefBinding=True,wholeMaterialDigest=whole_digest(material),changedSinceV1=material!=old_material,reuseUnchangedPartsFromOwnActualFinalV1Review=True,sourceRequirementReference=material['sourceRequirementReference'],actualLearnerEvidence=False))
    rows.append(dict(goalId=goal_id,decision='KEEP',allWholeDEENGoalFieldsActuallyRead=True,allWholeProfileFieldsActuallyRead=True,allRequiredExpectationsReviewed=True,wholeGoalDigest=whole_digest(goal),wholeProfileDigest=whole_digest(spec['profile']),wholeProfileChangedSinceV1=spec['profile']!=old_specs[goal_id]['profile'],requiredExpectationIds=spec['profile']['coverageExpectations']['requiredExpectationIds'],caseIds=[m['caseId']for m in linked],ownScientificReason=reason,newNativeCurrentImageBindingStatus='PENDING_V3_NATIVE_FROZEN_INPUTS',sourceOrStageGlobalApproval=False))
    own_specs.append(dict(goalId=goal_id,reason='KEEP: Eigene tatsächliche ganze DE/EN-Ziel-/Profil-/Materialprüfung. '+reason+' AI-Kandidatenprofil E1/G1, keine tatsächliche Lernendenleistung oder Human-Freigabe. Native final-v3-Bindungen müssen separat bestanden sein.',evidenceLevel='E1',maximumClaimScope='G1',dissent=[],profile=spec['profile']))
assert len(case_rows)==16
protected=[]
for id in prep['protectedUnchangedJointDPositiveKeepGoalIds']:
    assert by_spec[id]['profile']==old_specs[id]['profile']
    linked=[m for m in materials if m['goalId']==id]
    assert linked==[m for m in original_materials if m['goalId']==id]
    assert next(r for r in prior_science['goals']if r['goalId']==id)['profileScientificDecision']=='KEEP'
    protected.append(dict(goalId=id,profileAndBothWholeMaterialsExactlyEqual=True,reusedOwnValidActualV1PositiveKEEP=True,newScientificRestart=False))
receipt=dict(schemaVersion=1,reviewedAtUTC=now,role='Independent B actual content-only review of immutable v2 inputs, before final native v3 binding',authorV2FreezeSha256='b3e093b91ebd49e6c61013fe90bebedb97473a201a2125825bcfa3463e03edaa',contentScientificCounts={'KEEP':8,'REVISE':0},wholeMaterialCounts={'KEEP':16,'REVISE':0},exactlySixWholeProfilesChanged=True,exactlyFiveWholeCaseMaterialsChanged=True,allEightWholeGoalsProfilesAndSixteenCompleteCasesActuallyReviewed=True,allTwoNativeCandidatePNGsAndFourBrowserWidthImagesActuallyViewed=True,primaryNISTDataActuallyVerified=True,primaryFactReceipt=own+'actual-primary-nist-two-fusion-data.independent-b.json',wholeOriginalSourceCoverage=False,allNationalCourseAndStageScopesReviewed=False,sourceAtlas48ScopesAnd496UnresolvedDecisionsNotClosed=True,newNativeV3BindingsPassed=False,v2FourNativeMissingAssetAndFingerprintHoldsNotClosed=True,peerANewDPositiveResultFilesRead=False,activeWrites=False,GitOperations=False,humanApproval=False,humanTrial=False,actualLearnerEvidence=False,newStrictClosures=0,strictNetGain=0,goalReviews=rows,caseReviews=case_rows,protectedSevenReuse=protected,actualInputs=list(actual_inputs.values()))
(root/own/'actual-v2-eight-whole-science-content-review.independent-b.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
(root/own/'positive.eight.independent-b.specifications.json').write_text(json.dumps(dict(schemaVersion=1,authoringContract='positive-understanding-evidence-candidates-v1',reviewId='chemie-current-eight-native-positive-independent-b-v3',reviewedAt=now,reviewer='independent-b-actual-current-eight-whole-chemistry-review',goals=own_specs),ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(contentScientificCounts=receipt['contentScientificCounts'],wholeMaterialCounts=receipt['wholeMaterialCounts'],nativeV3Binding='PENDING',protectedSeven=7)))
