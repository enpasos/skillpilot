# SPDX-License-Identifier: Apache-2.0
"""Independent B whole split science and scope review; no active/native DPV write."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-he9-contraception-parenthood-scope-preserving-split-author-20261008-v1'
OLD = '3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8'
CHILDREN = ['9d3f71d7-5273-5e50-b1ba-4e291edbf114', 'dd923eeb-eef0-5796-b372-a5d4f5be21f7']
def read(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(p, v):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f: f.write(json.dumps(v, ensure_ascii=False, indent=2) + '\n')

seal = AUTHOR / 'scope-preserving-split-whole-author-input-output.first.freeze.json'
assert sha(seal) == '621f1db51b738001410aa653e3303642a1e5a4162e9c4929bfd49e8ff8af01c0'
for b in read(seal)['files']:
    actual = bind(ROOT / b['path']); assert all(actual[k] == b[k] for k in ['path', 'sha256', 'bytes'])
entry = read(AUTHOR / 'neutral-scope-preserving-two-child-whole-science-author-review.entry.json')
whole = read(ROOT / entry['wholeCurrentAndProposedGoals'])
goals = whole['proposedTwoWholeAtomicChildren']; assert [g['id'] for g in goals] == CHILDREN
cases = {g['goalId']: g for g in read(ROOT / entry['wholeCases'])['goals']}
positive = {g['goalId']: g for g in read(ROOT / entry['wholeP'])['goals']}
native_p = {r['goalId']: r for r in [json.loads(s) for s in (ROOT / entry['closedNativeP']).read_text().splitlines()]}
assert set(cases) == set(positive) == set(native_p) == set(CHILDREN)
for g in goals:
    gid = g['id']; assert cases[gid]['wholeDEENGoal'] == g and len(cases[gid]['cases']) == 2
    assert positive[gid]['profile'] == native_p[gid]['profile']
    for k, v in {'status': 'needs_human_review', 'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1'}.items(): assert native_p[gid][k] == v
    for case, brief in zip(cases[gid]['cases'], positive[gid]['profile']['applicationCaseBriefs'], strict=True):
        assert case['id'] == brief['id']
        for lang, suffix in [('de', 'De'), ('en', 'En')]:
            assert brief['taskDemand' + suffix] == case['material'][lang] + ' ' + case['task'][lang]
            assert brief['expectedPerformance' + suffix] == case['modelAnswer'][lang]
assignment = read(ROOT / entry['exactOriginalTaskModelAssignment'])
assert len(assignment['records']) == 2
for r in assignment['records']:
    for lang, spans in r['exactTaskAndModelSpanAssignments'].items():
        for field in ['task', 'modelAnswer']:
            text = r['completeOriginalCase'][field][lang]; field_spans = sorted([s for s in spans if s['field'] == field], key=lambda s: s['start'])
            assert field_spans[0]['start'] == 0 and field_spans[-1]['end'] == len(text)
            assert ''.join(s['text'] for s in field_spans) == text
            for n, s in enumerate(field_spans):
                assert s['childId'] in CHILDREN and s['text'] == text[s['start']:s['end']]
                if n: assert s['start'] == field_spans[n - 1]['end']
old = whole['originalWholeGoal']; cluster = whole['proposedStableCluster']
permitted = copy.deepcopy(old); permitted.update(type='cluster', weight=2, contains=CHILDREN); assert cluster == permitted
assert goals[0]['description'] + ' und ' + goals[1]['description'].removeprefix('Die lernende Person kann ') == old['description'].replace('beurteilen und', 'beurteilen. und')
assert old['descriptionEn'] == 'The learner can assess methods of contraception and reflect on responsible parenthood.'
primary = Path('/tmp/he9-independent-a-primary-angh7cme/g9-biologie.pdf')
assert sha(primary) == '93257f9be96e9bd288d187eb63e3e33ca28debdb2511dcd068e9abf82bc5b5f1'
technical = read(OWN / 'split31-scopes-and-DAG.actual-native-authoring.independent-b.receipt.json')
assert read(OWN / 'scope31-DAG.terminal.actual.json')['exitCode'] == 0
assert technical['viewCount'] == 31 and technical['rewrittenViews'] == 21
consumer_input = read(ROOT / entry['allConsumers']); assert consumer_input['consumerFileCount'] == 54
source = read(ROOT / entry['sourceAndScopeReading'])
write(OWN / 'exact-two-whole-child-input-source-case-and-old-clause-bindings.independent-b.actual.json', {
    'artifactKind': 'actual-independent-B-two-whole-children-original-clause-and-frozen-input-binding-verification',
    'recordedAt': datetime.now(timezone.utc).isoformat(), 'authorExactFirstSeal': bind(seal), 'actualFrozenAuthorFilesVerified': 146,
    'exactTwoWholeGoals': bind(ROOT / entry['wholeCurrentAndProposedGoals']), 'exactFourWholeDEENCases': bind(ROOT / entry['wholeCases']),
    'wholeNativePBodyMatchesWholeAuthorNormativeProfile': 2, 'exactWholeMaterialTaskModelAnswerBriefBindings': 4,
    'allOriginalTaskModelCharacterSpansAssignedWithoutGapsOrDuplication': True,
    'originalWholeGoalTwoClauseUnionPreserved': True, 'stableOldClusterChangedFieldsOnly': ['type', 'weight', 'contains'],
    'actual31NativeAuthoringScopeCheck': bind(OWN / 'split31-scopes-and-DAG.actual-native-authoring.independent-b.receipt.json'),
    'actual31NativeAuthoringTerminal': bind(OWN / 'scope31-DAG.terminal.actual.json'),
    '54PublicConsumerFrozenInput': bind(ROOT / entry['allConsumers']), 'actualOther473FrozenWholeGoalBodiesExact': True,
    'publication392CompilerNotRunByReviewer': True, 'newD_P_VBindingsNotApproved': True,
    'peerAVariantReviewRead': False, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False})

child_verdicts = [
    {'goalId': CHILDREN[0], 'wholeCurrentTitleDe': goals[0]['title'], 'wholeCurrentTitleEn': goals[0]['titleEn'],
        'wholeCurrentDescriptionDe': goals[0]['description'], 'wholeCurrentDescriptionEn': goals[0]['descriptionEn'],
        'wholeScientificDescriptionVerdict': 'KEEP', 'sourceScopeVerdict': 'PASS for exact original selected HE9.3 contraceptive-assessment clause',
        'wholePositiveScienceVerdict': 'PASS_SCOPED_E1_G1', 'wholeActualDEENCaseCount': 2,
        'wholeCaseScientificObservations': [
            {'caseId': 'he9-split-contraception-case-1', 'verdict': 'PASS', 'reasonDe': 'Vollständige DE/EN-Karten benennen ausdrücklich korrekt angewandte Barriere und kombinierte hormonelle Pille. Die Barriere kann Schwangerschaft und das Risiko vieler STI vermindern; die kombinierte Pille unterdrückt hauptsächlich Ovulation, schützt aber nicht vor STI. Die ganze Aufgabe verlangt Wirkweise, Anwendung, getrennte Schutzziele und eine Beurteilungsgrenze. Kein hundertprozentiger Schutz, keine persönliche Eignung oder tatsächliche Anwendung wird behauptet. WHO-Primärfact-sheets tragen die genau begrenzten biologischen Unterschiede.'},
            {'caseId': 'he9-split-contraception-case-2', 'verdict': 'PASS', 'reasonDe': 'Der ganze Gegenfall verändert tatsächlich die Anwendung: vollständige vorgesehene Kondomanwendung versus mehrfach abweichender Einnahmeplan. Biologisches Wirkprinzip ist von tatsächlicher Nutzung und fehlenden vergleichbaren Quoten zu unterscheiden. Die ganze Antwort verwirft eine pauschale Überlegenheit in jeder Hinsicht und liefert keine erfundene numerische Wirksamkeitsrangfolge oder individuelle Empfehlung. Der wiederholte Schutzzielvergleich stützt Transfer innerhalb derselben Beurteilungsleistung, keine zusätzliche autonome klinische Beratungskompetenz.'}
        ],
        'wholePositiveContractReasonDe': 'Core und Transfer verlangen begründetes Beurteilen, nicht bloß zwei Methodennamen: Wirkprinzip mit materialbezogenen Kriterien verbinden, Anwendung ändern, Schlussgrenzen aus Daten erklären. Beide ganzen Fälle und alle sechs bilingualen Understanding/Performance-Felder sind gleichwertig. Mindestdemonstration/Variation/Transfer bleibt als Kandidatenprofil erhalten; die angebotenen Fälle sind keine behauptete Lernendenleistung oder starre Zusatzaufgabenquote nach bereits ausreichend gezeigter Leistung.',
        'semanticKindDecision': {'semanticKind': 'curricularAtomic', 'scientificDecision': 'PASS for exact child body',
            'reasonDe': 'Konkrete schulcurriculare Beurteilungsleistung an Verhütungsmethoden ist individuell an begründeten Antworten überprüfbar. Keine Orientierung, Programm-/Strukturunit, SRS-Deck oder allgemeine Kompetenztaxonomie.'},
        'atomicityDecision': {'status': 'atomic', 'semanticAtomic': True, 'scientificDecision': 'PASS',
            'reasonDe': 'Eine zusammenhängende Methodenbeurteilung verbindet Wirkweise, sachlich relevante Kriterien und Informationsgrenzen. Mehrere Methoden/Kriterien sind Vergleichsdimensionen derselben Leistung. Die eigenständig erwerbbare Elternschaftsreflexion ist tatsächlich ausgelagert; keine persönliche Beratung oder praktische Anwendung ist zusätzlich im Kindziel gebündelt.'},
        'memoryDecision': {'status': 'no_memory_needed', 'memoryUseful': False, 'scientificDecision': 'PASS',
            'reasonDe': 'Das assess-Verb erfordert kriterielles Begründen an gegebenen Methodenkarten und veränderter Nutzung. Eine auswendig gelernte Wirkungs-/Quotenliste könnte diese begrenzte Informationsbewertung nicht ersetzen; hier werden keine exakten Wirkungsquoten, Einnahmeanweisungen oder unabhängige Listenabfrage verlangt. Fachbegriffe und Mechanismen werden im Material begründet angewendet. Keine verpflichtende neue Karte für diese konkrete Beurteilungsleistung.', 'newRequiredCards': 0, 'newCardVisibilityObligations': 0}},
    {'goalId': CHILDREN[1], 'wholeCurrentTitleDe': goals[1]['title'], 'wholeCurrentTitleEn': goals[1]['titleEn'],
        'wholeCurrentDescriptionDe': goals[1]['description'], 'wholeCurrentDescriptionEn': goals[1]['descriptionEn'],
        'wholeScientificDescriptionVerdict': 'KEEP', 'sourceScopeVerdict': 'PASS for exact original selected HE9.3 responsible-parenthood reflection clause',
        'wholePositiveScienceVerdict': 'PASS_SCOPED_E1_G1', 'wholeActualDEENCaseCount': 2,
        'wholeCaseScientificObservations': [
            {'caseId': 'he9-split-parenthood-case-1', 'verdict': 'PASS', 'reasonDe': 'Die ganze nicht persönliche Erwachsenenvignette trennt Vermögen von tatsächlich geplanter Fürsorge und verbleibenden Fragen. Geld kann helfen, belegt allein keine verantwortliche Elternschaft; Zeit, verlässliche Betreuung, Gesundheit, Zuwendung, Hilfe und Kindeswohl liefern mehrere begründete Perspektiven. Weder Armut noch Wohlstand wird als Familienwert oder alleinige Eignung beurteilt. Der Lernende begründet und wägt ab, nicht bewertet reale Menschen anhand privater Daten.'},
            {'caseId': 'he9-split-parenthood-case-2', 'verdict': 'PASS', 'reasonDe': 'Der ganze zweite Fall verändert die Verantwortungsverteilung bei ungeplant erwarteter Elternschaft und kontrastiert fremd auferlegte Zuständigkeit mit freiwilliger konkreter Planung. Bedürfnisse des Kindes, Gesundheit, Zeit, Belastungen, Unterstützung und Selbstbestimmung bleiben zusammen zu reflektieren. Ungeplante Schwangerschaft schließt verantwortliche Fürsorge nicht aus, biologische Rollen erzwingen keine alleinige Betreuungspflicht, unterschiedliche Familienformen bleiben möglich. Keine Offenlegung eigener Familiengeschichte oder normative Wahl einer einzigen Familienform verlangt.'}
        ],
        'wholePositiveContractReasonDe': 'Das ganze Profil operationalisiert die kurze reflect-Beschreibung zielgenau: mehrere begründete Fürsorgekriterien mit Kindeswohl verbinden, Ressourcen von Umsetzung unterscheiden und veränderte Perspektiven/Verantwortungspläne abwägen. Reflexion ist kein bloßes Jasagen zu einer vorgegebenen Moralregel. Die DE/EN-Tasks, Musterantworten und Rubrikbedingungen stimmen ohne Anspruchserweiterung überein.',
        'semanticKindDecision': {'semanticKind': 'curricularAtomic', 'scientificDecision': 'PASS for exact child body',
            'reasonDe': 'Eine konkrete curricular begründete soziale/ethische Reflexionsleistung an Elternschaftsfällen ist durch begründete Perspektivenabwägung überprüfbar. Nicht bloße Motivation/Orientierung, strukturelles Programm oder Memoryziel.'},
        'atomicityDecision': {'status': 'atomic', 'semanticAtomic': True, 'scientificDecision': 'PASS',
            'reasonDe': 'Mehrere Fürsorge-/Unterstützungs-/Selbstbestimmungsperspektiven bilden Kriterien derselben Reflexionsleistung, keine zusätzlich auszuführenden Einzelberufe oder Familienplanungsentscheidungen. Das selbstständig erwerbbare Fachurteil über Verhütungsmethoden ist sauber im anderen Kindziel. Die alte UND-Verknüpfung ist daher sinnvoll in zwei eigenständige Leistungsnachweise aufgeteilt.'},
        'memoryDecision': {'status': 'no_memory_needed', 'memoryUseful': False, 'scientificDecision': 'PASS',
            'reasonDe': 'Eine persönliche oder vermeintlich universelle Kriterienliste auswendig zu lernen ersetzt keine begründete Reflexion unterschiedlicher vorgegebener Fürsorgesituationen. Keine festen Gesetzesparagraphen, Zahlen oder definitorische Liste wird verlangt. Begründung, Perspektivwechsel und verantwortlicher Umgang mit Ungewissheit tragen diese Leistung; keine verpflichtende neue Memorycard.', 'newRequiredCards': 0, 'newCardVisibilityObligations': 0}}
]
verdict = {
    'schemaVersion': 1, 'artifactKind': 'independent-B-genuine-two-whole-child-DEEN-source-P-semantic-class-AM-first-verdicts',
    'recordedAt': datetime.now(timezone.utc).isoformat(), 'actualReviewer': '/root/flora_fauna_independent_a', 'assignedIndependentRole': 'B',
    'authorWasDifferentAgent': True, 'authorExactFirstSeal': bind(seal), 'childVerdicts': child_verdicts,
    'actualWholeDescriptionsDEENRead': 2, 'actualWholeMaterialTaskModelAnswerDEENCasesRead': 4,
    'actualWholeNormativeExpectationsCoverageVariationTransferBriefsRead': 2, 'wholeChildSciencePASS': 2, 'wholeBoundedCaseSciencePASS': 4,
    'originalWholePrimaryReading': {'url': source['actualOfficialPDF']['url'], 'sha256': sha(primary), 'physicalPage': 26, 'printedPage': 25,
        'readBasis': 'Whole actual original HE9.3 page independently reread using fitz, including justification, mandatory/facultative table and cognitive/social/emotional method context. No third-party full text reproduced here.'},
    'actuallyReadSupportingPrimaryScience': [
        {'url': 'https://www.who.int/news-room/fact-sheets/detail/condoms', 'factSheetDate': '2025-02-14', 'basis': 'Actual primary overview/effectiveness read: consistent correct use matters, protection against many STI and pregnancy is conditional; no absolute guarantee or personal comparison inferred.'},
        {'url': 'https://www.who.int/news-room/fact-sheets/detail/oral-contraceptives', 'factSheetDate': '2025-12-23', 'basis': 'Actual primary key facts/overview/effectiveness read: combined pill suppresses ovulation, protection depends on appropriate use, no STI protection, personal eligibility requires separate healthcare assessment.'}],
    'scopePreservingSplitScientificReasonDe': 'Die beiden aktuellen ganzen DE/EN-Kindbeschreibungen sind exakt die zwei bisherigen unabhängig erwerbbaren Leistungsklauseln. Keine der alten Beurteilungs-/Reflexionspflichten entfällt und keine neue praktische Durchführung, persönliche Methodenwahl, numerische Wirksamkeitsabfrage oder verpflichtende persönliche Elternschaftsentscheidung kommt hinzu. Die vollständigen ursprünglichen zwei Materialfälle bleiben Geschichte; alle ursprünglichen DE/EN-Aufgaben- und Antwortzeichenabschnitte sind lückenlos dem sachlich passenden Kind zugeordnet. Vier neue ganze Fälle liefern jeweils echte didaktische Variation statt alte Teilantworten als neue Lernendenbeweise zu zählen.',
    'sourceExtentBoundary': 'Bounded approval of the existing contraception-assessment and responsible-parenthood-reflection source clauses. Whole HE9.3 also names pregnancy/birth/abortion and other compulsory/optional topics; these are not certified as exhaustively covered by these two children. Existing pregnancy/birth and other sibling goals remain byte-exact, and no original mapping or source obligation is erased. Existing16-jurisdiction applicability is retained target metadata, not a new whole-country primary-source approval.',
    'conditionalSTICriterionBoundary': 'The supplied method information and already present original whole P/cases plus HE9.2 infection context support the pregnancy-versus-infection criterion in these bounded cases. It is not introduced as a new universal source duty for every country route.',
    'oldStableAggregateDecision': {'goalId': OLD, 'semanticKind': 'curricularArea', 'scientificDecision': 'PASS as exact aggregate of the two independently assessable children',
        'originalWholeTitleDescriptionScopeSourcePrerequisitesRetained': True, 'changedFieldsOnly': ['type', 'contains', 'weight'], 'oldHistoricalAchievementNotRewritten': True},
    'actualConsumerScopeVerification': {'frozenPublicConsumerFiles': 54, 'exactRewrittenViews': 21, 'actualNativeAuthoringViewScopes': 31,
        'targetScopeDeltaPlusOne': 23, 'targetScopeUnchanged': 8, 'noOtherAtomicTargetsLostOrAdded': True, 'prerequisiteOnlySetsUnchanged': True,
        'bothChildPrerequisites': whole['existingPrerequisiteRetainedForBothChildren'], 'newBetweenChildPrerequisite': False,
        'existingContainsParentAndSexualBehaviorRequiresConsumerWholeBodiesUnchanged': True,
        'oldStableSourceMappingsRetained': True, 'wholeOther473FrozenGoalsRetained': True,
        'actualNativeAuthoringCheck': bind(OWN / 'split31-scopes-and-DAG.actual-native-authoring.independent-b.receipt.json'),
        'technicalScopePreservationIsFreshAllRoutePrimaryApproval': False},
    'baselineBoundary': 'Author174/391 and full476 snapshot are stale inactive inputs. Mandatory guarded rebase onto the current stabilized root191/192-plus-native state, retaining newer goal assets/context, precedes integration. This reviewer does not recompute or claim the current strict total.',
    'denominatorIfLaterIntegrated': {'currentCurricularAtomic': 391, 'proposedCurricularAtomic': 392, 'reason': 'One old curricularAtomic becomes aggregate, two new curricularAtomic children; not an unchanged historical denominator.'},
    'pendingTruthfulNativeWork': ['Genuine second independent whole split review and finding resolution', 'Root reviewed closed-schema classification/A/M materialization on exact rebased current bodies',
        'Actual new child image/width/native page D/P/V review and fingerprints', 'Affected hormonal-control and sexual-behavior context bindings',
        'Actual current central strict sets/maturity floors and dependent Layer-A checks', 'Legacy old-ID achievement/mastery routing must preserve history and never invent child mastery; no private data read here'],
    'newRequiredCards': 0, 'newCardVisibilityObligationsForTheseNoMemoryChildren': 0, 'otherSharedDeckVisibilityClosureRetained': True,
    'newAuthoritativeActiveSemanticKindOrAMRecordsWritten': False, 'newNativeD_P_VBindingApproval': False, 'native392BookCompilerSimulated': False,
    'peerAVariantOutputReadBeforeOwnFirstSeal': False, 'noImagesGeneratedOrApproved': True, 'activeWrites': 0, 'strictGainClaimed': 0,
    'actualLearnerEvidence': False, 'PStatus': 'needs_human_review', 'PAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'humanApproval': False, 'humanTrial': False,
    'openScientificChildTextOrCaseFindings': []}
write(OWN / 'two-child-whole-source-P-class-AM-scientific-first.independent-b.verdict.json', verdict)
write(OWN / 'consumer-inspection-heterogeneous-json-diagnostic.independent-b.actual.json', {
    'artifactKind': 'preserved-read-only-inspection-diagnostic', 'actualError': "KeyError: 'completeDirectReferenceObject' while formatting a Java test line-match after17 structured view references",
    'cause': 'Public consumer dossier mixes structured JSON references and line-based test references; first inspection assumed all entries shared one key.',
    'resolution': 'Read heterogeneous structure, use its actual keys, inspect relevant view/canonical/source mapping references and validate every31 native authoring scope. No underlying input, source or review modified.',
    'scientificDefect': False, 'nativeScopeCheckerFailure': False, 'activeWrites': 0})
files = [p for p in sorted(OWN.rglob('*')) if p.is_file()]
write(OWN / 'two-child-whole-science-source-class-AM.independent-b.first.freeze.json', {
    'schemaVersion': 1, 'artifactKind': 'independent-B-two-whole-child-split-genuine-science-source-class-AM-first-freeze',
    'recordedAt': datetime.now(timezone.utc).isoformat(), 'authorExactInputSeal': bind(seal), 'actualFrozenAuthorFilesVerified': 146,
    'frozenFiles': [bind(p) for p in files], 'wholeChildScientificPASS': 2, 'wholeBoundedDEENCaseScientificPASS': 4,
    'bothChildSemanticKindScientificDecision': 'curricularAtomic', 'bothChildSemanticAtomicScientificDecision': True,
    'bothChildMemoryScientificDecision': 'no_memory_needed', 'stableAggregateSemanticKindScientificDecision': 'curricularArea',
    'actualNativeAuthoring31ScopeDAGTerminalExit': 0, 'freshWiderNationalPrimaryRouteApprovalClaimed': False,
    'newD_P_VBindingApproval': False, 'native392PageCompilerApproval': False, 'peerAVariantReadBeforeOwnFirstSeal': False,
    'openScientificChildFindings': [], 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False, 'humanTrial': False})
print('Genuine independent B:2 whole children/four DEEN cases/source/class/A/M science PASS; both curricularAtomic/atomic/no_memory_needed, stable parent curricularArea. Actual31 authoring scopes/DAG PASS. New native classification,A/M,D/P/V/images and guarded current rebase pending; no active closure or human approval.')
