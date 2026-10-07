"""Record this reviewer's actual bounded source judgments; no peer input."""
import hashlib
import json
import subprocess
from pathlib import Path

BASE = Path(__file__).parent
AUTHOR = BASE.parent / 'chemie-b008-bb-be-model-data-source-placement-author-v14'
read = lambda p: json.loads(Path(p).read_text())
def write(name, value):
    (BASE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')
def ref(path):
    p = Path(path); data = p.read_bytes()
    return {'path': str(p), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

whole = read(AUTHOR/'exact-bb-be-current-original-duties-and-specific-child-source-proposals.json')
guard = read(AUTHOR/'guarded-extraction-and-source-mapping-candidate-field-intents.json')
entry = read(AUTHOR/'bounded-neutral-bb-be-source-placement-review-entry.json')
candidate = read(entry['wholeCurrent503Candidate']['path'])
goals = {g['id']:g for g in candidate['goals']}
source_index = {}
for source in whole['exactSourceInputs']:
    source_index.update({g['id']:g for g in read(source['exactSnapshot']['path'])['sourceGoals']})

context_pages = {}
for row in whole['original28UniqueFamilySourceDuties']:
    for r in row['sourceOperatorContext']:
        assert ref(r['path']) == r
        context_pages[r['path']] = r
for row in whole['currentGKUnsupportedLKOnlyWitnesses']:
    r = row['actualPrimaryProof']; assert ref(r['path']) == r
    context_pages[r['path']] = r
assert len(context_pages) == 15
supplementary_page = AUTHOR/'primary/joint-SekII.physical-page-039.txt'

context_findings = [
    {'stage':'SekI','physicalPages':[20], 'finding':'Die allgemeinen D–H-Standards verbinden selbst formulierte Fragen und Hypothesen mit theoriebezogenen Befunden. Modelle werden für Erklärungen und Vorhersagen benutzt, auf Eignung geprüft, verglichen und bei Abweichungen verändert. Die Abstufung D–H bleibt erhalten; aus SekI wird kein tatsächlicher GK/LK-Kurs.'},
    {'stage':'SekI','physicalPages':[21], 'finding':'Größen, Einheiten, Messwerte, proportionale Zusammenhänge, Messgenauigkeit und unterschiedliche Fehlerarten tragen die begrenzten Dokumentations-, Interpretations- und Gültigkeitskomponenten. Sie ersetzen die konkrete Stoff- und Versuchskompetenz nicht.'},
    {'stage':'SekI','physicalPages':[30,32,33,34,36,37,39,43], 'finding':'Die Themen verlangen weiterhin stoff- und teilchenbezogene Reaktionen, Masseerhaltung, Atombau/PSE, Elektronenpaarbindung, quantitative Wasseranalyse, Ionenbildung, Metallmodell und Sauerstoffaffinität, Säure/Lauge und pH sowie funktionelle Gruppen bei Aminosäuren. Allgemeine Modell- oder Datenkritik allein belegt diese Inhalte nicht vollständig.'},
    {'stage':'SekII','physicalPages':[11,12], 'finding':'E1–E3 tragen die Frage-/Hypothesenroutinen; E5/E6 das transparente quantitative Arbeiten einschließlich digitaler Werkzeuge; E7/E9 die Auswahl und Begrenzung von Modellen; E8/E11/E12 die theoriebezogene Dateninterpretation, fachübergreifende Folgerungen und Falsifizierbarkeit. Das sind gemeinsame operatorbezogene Standards, keine vollständige Abdeckung jeder speziellen Molekül- oder Versuchssituation.'},
    {'stage':'SekII','physicalPages':[38,39], 'finding':'Die tatsächlich sichtbare zusätzliche LK-Spalte ordnet die Oberflächenkatalyse samt Adsorption/Dissoziation/Desorption und Oberflächeninteraktionen dem LK zu. Allgemeine Eigenschaften und Wirkungsweise von Katalysatoren im GK rechtfertigen keinen GK-Import genau dieses zusätzlichen LK-Modellauftrags.'},
    {'stage':'SekII','physicalPages':[41,42], 'finding':'Die zusätzliche LK-Spalte enthält Konduktometrie und quantitative Fällungstitration. Die GK-Spalte enthält Eigenschaften des chemischen Gleichgewichts sowie Berechnung/Deutung der Gleichgewichtskonstante; zugehörige Standards nennen Modellversuch, Modellauswahl/-grenzen und mathematische Anwendung. Diese echte GK-Basis trägt begrenzte Operatoranteile ohne Übernahme der LK-Konduktometrie.'},
]
write('primary-context-and-independence.actual.json', {
    'reviewer':'/root/chem_four_integration_resume',
    'reviewKind':'Independent AI scientific source/component/placement review B',
    'sameProviderIndependenceNotProviderDiversity':True,
    'authorOfReviewedInputs':False,
    'peerAArtifactsReadBeforeThisFirstSeal':False,
    'authorNativeFindingsOrVerdictReadBeforeOwnJudgment':False,
    'neutralEntry':ref(AUTHOR/'bounded-neutral-bb-be-source-placement-review-entry.json'),
    'wholeOriginal28ReadIncludingAllFields':True,
    'additionalFourGKWholeOriginalDutiesRead':True,
    'wholeEightDEENTargetsRead':True,
    'fifteenBoundPrimaryPageTextsReadWhole':list(context_pages.values()),
    'additionalColumnContinuationPage39ReadWhole':ref(supplementary_page),
    'actualPDFPhysicalPagesVisuallyInspected':[38,39,41,42],
    'actualRenderReceipt':ref(Path('tmp/chemie-b008-v14-bb-be-independent-b-primary-pages-local-20261007-v1/actual-render.receipt.json')),
    'visualCapturesLocation':'tmp/chemie-b008-v14-bb-be-independent-b-primary-pages-local-20261007-v1; local cache only, not required as a committed source copy',
    'providedActualSourceFilesUsed':True,
    'freshNetworkFetchClaimed':False,
    'independentContextFindings':context_findings,
    'noActualLearnerOrHumanEvidence':True,
})

# These are this reviewer's own content-specific judgments, not author rationales.
content = {
 '3-1-001-59bd16c0':('SekI',[20,30], 'Teilchenmodelle können die Modellkomponente beim Vergleich von Stoff- und Teilchenebene tragen.', 'Stoff-/Teilchenebene chemischer Reaktionen unterscheiden und inhaltlich richtig erklären bleibt eine eigene Verpflichtung.'),
 '3-1-003-7d26d03a':('SekI',[20,21,30], 'Die Auswertung experimenteller Massenbefunde erlaubt nachvollziehbare Dokumentation, Bezug auf die Ausgangsannahme und Bewertung der Mess-/Versuchsbedingungen.', 'Das Gesetz der Masseerhaltung fachlich anwenden wird durch die allgemeinen Datenroutinen allein nicht gezeigt.'),
 '3-2-008-37d60a6e':('SekI',[20,32], 'Das Kern-Hülle-Modell ist ein realer Gegenstand für Modellgebrauch und Vergleich mit Beobachtungen; die allgemeine Modellkritik begrenzt den Operatoranteil.', 'Protonen, Neutronen, Elektronen und Kern/Hülle korrekt beschreiben bleibt inhaltlicher Auftrag.'),
 '3-2-010-896763a8':('SekI',[20,32], 'Atombau und strukturierte Ordnungsmodelle des PSE erlauben den begrenzten Vergleich und die Beurteilung einer Modelldarstellung.', 'Die stofflichen und teilchenbezogenen Ordnungsprinzipien selbst sind nicht durch beliebige Modellkritik abgedeckt.'),
 '3-3-014-069f8205':('SekI',[20,33], 'Elektronenpaar-/Lewis-Modelle tragen den Modelloperator bei Bindungsverhältnissen; ein geeignetes Modell muss von dem dargestellten Fachinhalt unterschieden werden.', 'Elektronenpaarbindung und Oktettregel korrekt erklären bleibt inhaltlicher Auftrag; ein Vergleich allgemeiner Bilder reicht nicht.'),
 '3-4-018-57170964':('SekI',[20,21,34], 'Quantitative Befunde zur Wasseranalyse lassen sich transparent dokumentieren, quantitativ interpretieren und auf Mess-/Verfahrensgrenzen prüfen.', 'Aus der Wasseranalyse fachlich richtig eine Formel ableiten und den Wasserinhalt beherrschen bleibt eigenständiger Auftrag.'),
 '3-5-023-09516431':('SekI',[20,36], 'Eine atom-/ionenbezogene Modelldarstellung kann Ionenbildung erläutern und ihre Eignung und Grenzen prüfen.', 'Elektronenabgabe/-aufnahme, Ladung und Ionenbildung selbst korrekt erklären bleibt inhaltlicher Auftrag.'),
 '3-6-030-0d6005d2':('SekI',[20,37], 'Das Elektronengas-Modell ist ein authentischer Kontext für begrenzten Modellgebrauch und Modellkritik.', 'Metallbau und Zusammenhang mit Eigenschaften mittels dieses Modells korrekt beschreiben bleibt inhaltlicher Auftrag.'),
 '3-6-033-18366296':('SekI',[20,21,37], 'Versuchsbefunde beim Vergleich der Sauerstoffaffinität erlauben Dokumentation, Dateninterpretation und kritische Prüfung vergleichbarer Untersuchungsbedingungen.', 'Die chemische Vergleichsaussage über Metalle/Redoxvorgänge wird durch allgemeine Datenkritik allein nicht belegt.'),
 '3-8-040-937ec372':('SekI',[20,21,39], 'pH-Messwerte bieten einen echten Kontext für Größen/Einheiten bzw. Skala, strukturierte Daten, Interpretation und Grenzen des Messverfahrens.', 'pH bestimmen, sinnvoll vergleichen und alltagsbezogen fachlich deuten bleibt eine eigene Stoff-/Messkompetenz.'),
 '3-8-042-4320231b':('SekI',[20,39], 'Das Teilchenmodell saurer/alkalischer Lösungen kann mit Beobachtungen verglichen und als begrenzte Erklärung geprüft werden.', 'Bildung saurer und alkalischer Lösungen, Oxonium-/Hydroxid-Ionen und Teilchenbeziehungen fachlich richtig erklären bleibt inhaltlicher Auftrag.'),
 '3-11-062-6a442386':('SekI',[20,43], 'Struktur-/Teilchenmodelle können den begrenzten Darstellungsoperator bei funktionellen Gruppen unterstützen; allgemeine Modellstandards ergänzen diesen Kontext.', 'Amino- und Carboxygruppe identifizieren und Aminosäuren chemisch einordnen ist nicht durch allgemeine Modellkritik allein erfüllt.'),
 '3-2-4-inhalte-013-8b062625':('SekII',[11,12,38,39], 'Die LK-Oberflächenkatalyse ist ein echter begrenzter Modellkontext; E7/E9 tragen Auswahl, Modellgrenzen und kritische Prüfung.', 'Der Auftrag gehört nur zum zusätzlichen LK. Er belegt weder die gesamte Katalyse noch alle Bereiche des breiten oberen Modellziels.'),
 '3-2-5-inhalte-013-aed46f7b':('SekII',[11,12,41,42], 'LK-Konduktometrie/Fällungstitration trägt begrenzte quantitative Dokumentations-, Interpretations- und Verfahrensgültigkeitsanteile zusammen mit E5/E6/E8.', 'Leitfähigkeit, Konduktometrie und Fällungstitration fachlich korrekt ausführen/deuten bleibt Inhalt; keine GK-Bindung aus dieser LK-Quelle.'),
 '3-2-5-inhalte-002-30235589':('SekII',[11,12,41,42], 'Die gemeinsamen GK-Gleichgewichtsmerkmale und der tatsächliche Modellversuch liefern einen Modellkontext, dessen Auswahl/Grenzen E7/E9 betreffen.', 'Chemisches Gleichgewicht als dynamischen Zustand inhaltlich richtig erklären sowie alle anderen oberen Modellkontexte sind damit nicht geschlossen.'),
 '3-2-5-inhalte-004-5e5b9299':('SekII',[11,12,41,42], 'Berechnung und Deutung von K in der echten GK-Spalte liefert einen begrenzten quantitativen Datenkontext; allgemeine E5/E6/E8-Standards tragen die ergänzenden Operatoranteile.', 'Gleichgewichtskonstanten und MWG inhaltlich korrekt nutzen ist ein eigener Auftrag. Vollständige hypothesenbezogene/fachübergreifende Leistung wird nicht aus einer K-Berechnung allein abgeleitet.'),
}
target_operator = {
 '6c7ce93c-7675-51da-bc0c-7d0257f7ff7d':'Modellwahl/-gebrauch/-kritik, nur für den konkret belegten unteren Kontext.',
 '86d34f1f-692d-5522-a9a4-a71c65b24de7':'Theoriebezogener Modellgebrauch/-vergleich/-grenzen, nur für Oberflächenkatalyse LK oder Gleichgewicht GK/LK; keine gesamte Bereichsliste.',
 '9fc800d1-92d1-5ef6-81c1-33960ae034dd':'Transparente Dokumentation konkreter Mess-/Auswertungsdaten einschließlich Bedingungen und Herkunft; keine vollständige Inhaltsdeckung.',
 '7d9fcc7f-1c20-5d5b-9cf6-05f6b624dab6':'Interpretation konkreter unterer Daten und Bezug auf prüfbare Aussagen/Hypothesen in Verbindung mit den allgemeinen Standards.',
 '9e3fae29-84d5-5600-bfb3-82d49ea3f1b5':'Begrenzter quantitativer oberer Auswertungsanteil in Verbindung mit E6/E8/E11; keine gesamte selbständige Hypothesen-/Digital-/Transferleistung aus einem Inhaltsbullet.',
 '4aa3a130-b517-5ac5-87b2-147fe432cadd':'Begrenzte Prüfung von Mess-/Verfahrensbedingungen und Aussagegrenzen in Verbindung mit den allgemeinen Standards.',
}
bindings = []
for row in guard['candidateMappingInputs']:
    maps = [m for r in row['originalFamilyMappingChanges'] for m in r['specificCandidateMappings']] + row['extraAuthenticGKSourcePartialMappings']
    for m in maps:
        source_id = m['legacyGoalId']
        suffix = next(s for s in content if source_id.endswith(s))
        stage,pages,support,remaining = content[suffix]
        course = 'LK' if suffix in ['3-2-4-inhalte-013-8b062625','3-2-5-inhalte-013-aed46f7b'] else ('GK/LK' if stage == 'SekII' else 'SekI D–H, kein tatsächlicher GK/LK-Kurs')
        bindings.append({
            'sourceGoalId':source_id,'canonicalGoalId':m['canonicalGoalId'],
            'matchTypeMustRemain':'partial',
            'boundedOperatorComponentVerdict':'ACCEPT',
            'actualJurisdiction':'DE-'+source_id.split('-')[0].upper(),
            'stage':stage,'actualCourseScope':course,
            'primaryPhysicalPages':pages,
            'ownScientificRationale':support,
            'acceptedComponent':target_operator[m['canonicalGoalId']],
            'remainingOriginalSourceDuty':remaining,
            'wholeOriginalSourceDutyClosedByThisReview':False,
            'wholeCanonicalGoalScientificallyApprovedByThisReview':False,
            'allOtherOriginalContentMappingsMustRemain':True,
        })
assert len(bindings) == 56
duties=[]
for source_id in sorted({r['sourceGoalId'] for r in bindings}):
    rows = [r for r in bindings if r['sourceGoalId'] == source_id]
    duties.append({'sourceGoalId':source_id,
                   'originalWholeSourcePreserved':True,
                   'acceptedOnlyPartialComponentGoalIds':[r['canonicalGoalId'] for r in rows],
                   'remainingOriginalDuty':rows[0]['remainingOriginalSourceDuty'],
                   'wholeSourceDecision':'NOT_CLOSED_BY_THIS_BOUNDED_REVIEW'})
assert len(duties)==32
write('thirty-two-whole-duty-and-fifty-six-component-adjudications.independent-b.json', {
    'wholeOriginalDutyInput':entry['wholeSourceAndPrimaryContext'],
    'verdict':'PASS_BOUNDED_PARTIAL_OPERATOR_COMPONENTS_ONLY',
    'partialComponentCount':56,'wholeSourceDutyCount':32,
    'componentAdjudications':bindings,'wholeDutyBoundaries':duties,
    'wholeSourceStatusesPromoted':0,'wholeCanonicalGoalsApproved':0,
    'strictGain':0,'humanApproval':False,
})

course_judgments=[]
for r in guard['sourceScopeFieldIntents']:
    surface = '3-2-4' in r['sourceGoalId']
    course_judgments.append({'sourceGoalId':r['sourceGoalId'],
        'verdict':'ACCEPT_COURSE_SCOPE_CORRECTION',
        'before':'unspecified','after':'LK','allowedTagAppend':'course:LK',
        'physicalColumnPage':38 if surface else 41,
        'corroboratingActivityPage':39 if surface else 42,
        'ownRationale':'Die tatsächliche zusätzliche LK-Spalte, einschließlich der Fortsetzung bei Kompetenzen/Experimenten, weist genau diesen Auftrag dem LK zu. Die GK-Spalte ist daneben getrennt sichtbar.',
        'wholeOriginalSourceTextAndAllOtherFieldsRetained':True,
        'doesNotCloseWholeSourceDuty':True})

metadata_judgments=[]
for r in whole['newSourceSpecificMetadata']:
    upper_model=r['goalId']=='86d34f1f-692d-5522-a9a4-a71c65b24de7'
    metadata_judgments.append({'goalId':r['goalId'],
        'verdict':'ACCEPT_BOUNDED_OPERATOR_OR_PREREQUISITE_LOCATION_ONLY',
        'before':r['before'],'after':r['after'],
        'ownRationale':('E7/E9 und die echten Gleichgewichts-/LK-Oberflächenkontexte tragen die obere Modellroutine als Operatorort. Diese Bindung prüft nicht alle zwingend genannten oberen Modellbereiche, insbesondere Wirkstoff–Rezeptor, Substrat–Enzym, Molekülgeometrie und analoge UND digitale Modellleistung.' if upper_model else 'Die gelesenen allgemeinen SekI-D–H- bzw. SekII-E-Standards tragen diesen Frage-, Dokumentations-, Daten- oder Gültigkeitsoperator beziehungsweise seine ausdrückliche Voraussetzung. Die Metadatenbindung ist eine Lage-/Voraussetzungsentscheidung, keine vollständige Stoff- oder nationale Quellenfreigabe.'),
        'wholeDEENTitleDescriptionAndRequiresPreserved':True,
        'wholeTargetSourceCoverageApproved':False,
        'mustNotUseAsWholeCurriculumSourceClosure':True,
        'upperWholeDomainCoverageStillOpen':upper_model,
    })
view_judgments=[]
for row in whole['newCurrentTargetViews']:
    upper = row['scope']['stage']=='SekII'
    view_judgments.append({'viewId':row['viewId'],'scope':row['scope'],
       'verdict':'ACCEPT_BOUNDED_OPERATOR_LOCATION_AND_EXPLICIT_PREREQUISITE_ROLES_ONLY',
       'acceptedChangedTargetOperatorIds':[n['goalId'] for x in row['actualTwoChangedNodes'] for n in x['candidateNodes']],
       'extraActualDeltaExplicitlyReviewed':('Ein weiterer rootNodes-Block enthält vier ausdrücklich prerequisiteOnly gesetzte Routinevoraussetzungen.' if upper else 'Kein zusätzlicher Voraussetzungenblock.'),
       'ownPrerequisiteJudgment':('6c ist direkte Voraussetzung von 86d; 7d9 und 503 sind direkte Voraussetzungen von 9e3; 75e ist Voraussetzung von 503. Die vier sind ausdrücklich Voraussetzung, keine zusätzliche zielwirksame Kompetenz.' if upper else 'Dokumentation und untere Datenauswertung liegen bereits unter den expliziten Zielroutinen und tragen deren bestehende requires.'),
       'GKMustNotBorrowLKOnlySourceDuties':True,
       'wholeUpperModelTargetRangeStillRequiresSourceAdjudication':upper,
       'wholeViewOrOriginalSourceDutiesClosedByThisReview':False})
write('four-course-corrections-eight-location-metadata-six-views.independent-b.json', {
    'courseCorrections':course_judgments,'locationMetadata':metadata_judgments,'sourceViews':view_judgments,
    'authorTwoNodeDeltaDescriptionIncomplete':True,
    'additionalDeltaAcceptedOnlyAfterActualIndependentExamination':True,
    'noAutomaticWholeTopicPromotion':True,
    'noIndependentNativeD26OrP52Verdict':True,
    'strictGain':0,'humanApproval':False,
})

write('final-scope-findings-and-open-boundaries.independent-b.json', {
 'verdict':'PASS_BOUNDED_COMPONENTS_WITH_EXPLICIT_OPEN_WHOLE_SOURCE_AND_TARGET_BOUNDARIES',
 'acceptedPartialSourceBindings':56,'acceptedCourseScopeCorrections':4,
 'acceptedBoundedOperatorPrerequisiteMetadata':8,'acceptedBoundedOperatorViewLocations':6,
 'resolvedFinding':{'id':'B-V14-DELTA-01','finding':'Vier SekII-Views enthalten zusätzlich jeweils einen prerequisiteOnly-Block; nur zwei Knotenänderungen war als vollständige Deltabeschreibung unzutreffend.', 'resolution':'Tatsächliche zusätzliche vier IDs/Rollen gegen die requires-Closure geprüft; nur echte Voraussetzungen, keine weitere Zielaufnahme. Eigenes Audit dokumentiert alle zusätzlichen Blöcke ausdrücklich.', 'resolved':True},
 'openBoundaries':[
   {'id':'B-V14-WHOLE-SOURCE-32','status':'OPEN','scope':'Alle 32 ganzen Source-Pflichten','reason':'Diese Prüfung entscheidet nur die 56 Operatoranteile. Bestehende Inhaltszuordnungen bleiben erhalten; ihre Inhaltsleistung wird nicht aus generischen Operatorstandards neu als erfüllt behauptet.'},
   {'id':'B-V14-UPPER-MODEL-WHOLE','status':'OPEN','scope':'86d34f1f-692d-5522-a9a4-a71c65b24de7, BB/BE SekII GK/LK','reason':'Die gelesenen 15 Seiten und vier konkreten Source-Kontexte belegen Gleichgewichts-/LK-Oberflächenmodellierung, nicht die vollständige DE/EN-Bereichsliste einschließlich Wirkstoff–Rezeptor, Substrat–Enzym, Molekülgeometrie sowie analoger UND digitaler Modellleistung. Keine vollständige Ziel-/nationale Quellenfreigabe aus diesen Partialbindungen.'},
   {'id':'B-V14-UPPER-DATA-WHOLE','status':'OPEN','scope':'9e3fae29-84d5-5600-bfb3-82d49ea3f1b5','reason':'Ein Konduktometrie- oder K-Berechnungsbullet trägt einen quantitativen Operatoranteil, nicht allein sämtliche selbständigen Hypothesen-, Digital- und fachübergreifenden Leistungsanteile des ganzen Ziels. Allgemeine E-Standards und vollständige aktuelle D/P-Leistungsnachweise bleiben erforderlich.'},
   {'id':'B-V14-OTHER-STAGES-NATIONAL','status':'OUTSIDE_REVIEW','scope':'Andere Länder/Quellen/Platzierungen und geschützte 169','reason':'Keine nationale Atlasfreigabe, keine neue Prüfung unveränderter Ziele und keine Aussage über unberührte Quellen-/Seiten-/Kontextbindungen.'},
   {'id':'B-V14-D26-P52-A-M-V','status':'OUTSIDE_REVIEW','scope':'D26/P52 und weitere M7-Gates','reason':'Dieser Auftrag ist eine begrenzte unabhängige Source-/Component-/Placement-Prüfung. Native D26/P52, Gesamtatomarität, Memory, Bilder und strenge Schnittmenge sind hier nicht freigegeben.'},
 ],
 'machineSourceComponentReviewOnly':True,
 'newWholeSourceDecisionsAllowedAsCompleteFromThisArtifact':0,
 'newWholeTargetM7CompletionsClaimed':0,
 'strictGain':0,'humanApproval':False,'humanTrial':False,'activeWrites':0,
 'noPeerOrAuthorVerdictReadBeforeOwnFirstSeal':True,
})

execution = subprocess.run(['python3',str(BASE/'check-exact-bounded-inputs.independent-b.py')],capture_output=True,text=True)
write('exact-bounded-input-audit.command.actual.json',{'command':['python3',str(BASE/'check-exact-bounded-inputs.independent-b.py')],'actualExecution':True,'exitCode':execution.returncode,'stdout':execution.stdout,'stderr':execution.stderr})
assert execution.returncode == 0
write('independent-b.bounded-source-component-review.final.seal.json', {
  'role':'First independently sealed scientific B verdict and final bounded source/component/placement handoff',
  'reviewer':'/root/chem_four_integration_resume',
  'firstOwnVerdictSealedBeforePeerAOrAuthorNativeFindingsRead':True,
  'ownReviewedInputs':{k:entry[k] for k in ['wholeSourceAndPrimaryContext','fieldGuardedSourceAndMappingInputs','wholeCurrent503Candidate']},
  'files':[ref(p) for p in sorted(BASE.iterdir()) if p.is_file() and p.name != 'independent-b.bounded-source-component-review.final.seal.json'],
  'sourceComponentVerdict':'PASS_BOUNDED_COMPONENTS_ONLY',
  'wholeOriginalSourceDutiesOrWholeUpperGoalClosureClaimed':False,
  'D26P52ApprovalClaimed':False,
  'strictGain':0,'humanApproval':False,'humanTrial':False,'activeWrites':0,
})
print(json.dumps(ref(BASE/'independent-b.bounded-source-component-review.final.seal.json')))
