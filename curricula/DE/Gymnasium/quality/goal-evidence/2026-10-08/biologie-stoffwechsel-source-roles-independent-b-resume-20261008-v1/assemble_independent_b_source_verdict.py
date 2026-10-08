"""Record the scoped independent B source review. No integration or QA run.

SPDX-License-Identifier: Apache-2.0
"""
import collections
import datetime
import hashlib
import json
import pathlib
import subprocess

OUT = pathlib.Path(__file__).resolve().parent.relative_to(pathlib.Path.cwd())
AUTHOR = OUT.parent / 'biologie-stoffwechsel-resume-author-20261008-v1'
if (OUT / 'independent-b.first-verdict.seal.json').exists():
    raise SystemExit('The independent first verdict is sealed; do not overwrite it.')


def read(path):
    return json.loads(pathlib.Path(path).read_text())


def record(path):
    path = pathlib.Path(path)
    data = path.read_bytes()
    return dict(path=str(path), sha256=hashlib.sha256(data).hexdigest(), bytes=len(data))


def object_hash(value):
    data = json.dumps(value, ensure_ascii=False, sort_keys=True,
                      separators=(',', ':')).encode()
    return 'sha256:' + hashlib.sha256(data).hexdigest()


def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


now = datetime.datetime.now(datetime.timezone.utc).isoformat()
freeze = read(AUTHOR / 'author-first-input-output.freeze.json')
entry = read(AUTHOR / 'neutral-author-continuation.entry.json')
goals = read(entry['wholeCurrentGoalBodies'])
roles = read(entry['sourceRoleCandidates'])
sources = read(entry['operativeFull144SourceCandidate'])
mapping = read(entry['operativeFull144MappingCandidate'])
regional = read(entry['allRegionalDutiesAndPartners'])
canonical = read(freeze['inputs'][0]['path'])
old_mapping = read(freeze['inputs'][1]['path'])
old_sources = read(freeze['inputs'][2]['path'])
old_profiles = read(freeze['inputs'][3]['path'])
old_cases = read(freeze['inputs'][4]['path'])
profiles = read(entry['wholeProfiles'])
cases = read(entry['wholeCases'])
by_goal = {x['id']: x for x in canonical['goals']}
by_source = {x['id']: x for x in sources['sourceGoals']}
old_by_source = {x['id']: x for x in old_sources['sourceGoals']}
by_decision = {x['sourceGoalId']: x for x in mapping['decisions']}
old_by_decision = {x['sourceGoalId']: x for x in old_mapping['decisions']}
by_passage = {x['id']: x for x in sources['passages']}
old_by_passage = {x['id']: x for x in old_sources['passages']}
selected_source_ids = {x['sourceGoalId'] for x in roles['goals']}
selected_goal_ids = set(entry['goalIds'])
errors = []


def check(name, passed):
    if not passed:
        errors.append(name)
    return dict(check=name, passed=bool(passed))


checks = []
checks.append(check('144 source IDs and order retained',
                    [x['id'] for x in sources['sourceGoals']] ==
                    [x['id'] for x in old_sources['sourceGoals']]))
checks.append(check('125 other source rows exactly unchanged', all(
    row == old_by_source[sid] for sid, row in by_source.items()
    if sid not in selected_source_ids)))
checks.append(check('125 other decisions exactly unchanged', all(
    row == old_by_decision[sid] for sid, row in by_decision.items()
    if sid not in selected_source_ids)))
triples = lambda m: [(x['legacyGoalId'], x['canonicalGoalId'],
                       x.get('reviewDecisionId')) for x in m['mappings']]
checks.append(check('158 ordered mapping target triples exactly unchanged',
                    triples(mapping) == triples(old_mapping)))
checks.append(check('19 complete current goal bodies exactly canonical', all(
    g == by_goal[g['id']] for g in goals['wholeGoals'])))
checks.append(check('38 whole v4 DE/EN cases exactly retained', all(
    c == {x['caseId']: x for x in old_cases['cases']}[c['caseId']]
    for c in cases['cases'])))
checks.append(check('19 complete v5 scientific profile bodies exactly retained', all(
    g['profile'] == {x['goalId']: x for x in old_profiles['goals']}[g['goalId']]['profile']
    for g in profiles['goals'])))
checks.append(check('38 scoring totals remain 10 without regrading', all(
    c['scoring']['maximumPoints'] == 10 and
    sum(x['points'] for x in c['scoring']['criteria']) == 10 for c in cases['cases'])))
prior_regional = next(x['path'] for x in freeze['inputs']
                      if x['path'].endswith('whole24-all-current-regional-source-duties-all-1n-partners.lossless.json'))
checks.append(check('45 duties / 293 partner rows retained byte for byte',
                    pathlib.Path(entry['allRegionalDutiesAndPartners']).read_bytes() ==
                    pathlib.Path(prior_regional).read_bytes()))
checks.append(check('19 operative decisions and partner edges are partial', all(
    by_decision[sid]['matchType'] == 'partial' and
    all(x['matchType'] == 'partial' for x in mapping['mappings'] if x['legacyGoalId'] == sid)
    for sid in selected_source_ids)))
checks.append(check('19 new operative source rows bind the proposed original components', all(
    by_source[x['sourceGoalId']]['actualPrimaryComponents'] == x['actualPrimaryComponents']
    for x in roles['goals'])))
checks.append(check('37 old passages retain all text and locator fields', all(
    {k: v for k, v in old.items() if k != 'sourceGoalIds'} ==
    {k: v for k, v in by_passage[pid].items() if k != 'sourceGoalIds'}
    for pid, old in old_by_passage.items())))
checks.append(check('old passage memberships remove exactly the selected source IDs', all(
    by_passage[pid]['sourceGoalIds'] == [sid for sid in old['sourceGoalIds']
                                      if sid not in selected_source_ids]
    for pid, old in old_by_passage.items())))
checks.append(check('19 added passages and 144 consistent memberships',
    len(set(by_passage) - set(old_by_passage)) == 19 and all(
    x['id'] in by_passage[x['passageId']]['sourceGoalIds'] for x in sources['sourceGoals'])))

author_seal_failures = []
for expected in freeze['inputs'] + freeze['outputs']:
    if record(expected['path']) != expected:
        author_seal_failures.append(expected['path'])
checks.append(check('all 27 author first-input/output file seals match', not author_seal_failures))
guard_failures = []
for guard in regional['mappingExtractionGuards']:
    for kind in ['mapping', 'extraction']:
        if record(guard[kind]['path']) != guard[kind]:
            guard_failures.append(guard[kind]['path'])
checks.append(check('all 29 regional mapping/extraction guards match', not guard_failures))
own_input_failures = []
for name in ['independent-b.first-input.freeze.json',
             'independent-b.regional-inputs.freeze.json',
             'independent-b.original-cache-inputs.freeze.json']:
    for expected in read(OUT / name)['inputs']:
        if record(expected['path']) != expected:
            own_input_failures.append(expected['path'])
checks.append(check('all independently sealed input files remain unchanged', not own_input_failures))

primary_component_checks = []
for goal in roles['goals']:
    for c in goal['actualPrimaryComponents']:
        page = pathlib.Path(c['wholeOriginalPagePath']).read_bytes()
        text = '\n'.join(page.decode().splitlines()[c['firstTextLine1Based'] - 1:c['lastTextLine1Based']])
        h = c['originalTextSha256'].removeprefix('sha256:')
        ok = (hashlib.sha256(page).hexdigest() == c['wholeOriginalPageSha256'].removeprefix('sha256:')
              and text == c['originalText']
              and h in [hashlib.sha256(text.encode()).hexdigest(),
                        hashlib.sha256((text + '\n').encode()).hexdigest()]
              and c['zeroBasedPdfPage'] == c['physicalPage'] - 1
              and c['printedPage'] == c['physicalPage'])
        primary_component_checks.append(dict(ordinal=goal['ordinal'], recordId=c['recordId'], passed=ok,
            hashSerialization='Exact declared span; legacy span hash permits its retained terminal newline.'))
checks.append(check('31 original component spans, page seals, line positions and span hashes match',
                    all(x['passed'] for x in primary_component_checks)))
he_pdf = 'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'
he_pdf_record = record(he_pdf)
he_page_checks = []
for n in [42, 44, 45, 46, 47]:
    expected = next(c['wholeOriginalPagePath'] for g in roles['goals'] for c in g['actualPrimaryComponents']
                    if c['physicalPage'] == n)
    actual = subprocess.run(['pdftotext', '-layout', '-f', str(n), '-l', str(n), he_pdf, '-'],
                            capture_output=True, check=True).stdout
    he_page_checks.append(dict(physicalPage=n, printedPage=n, zeroBasedPdfPage=n - 1,
                              wholeText=record(expected), actualDirectPdfExtractionExact=
                              actual == pathlib.Path(expected).read_bytes()))
checks.append(check('five complete HE pages exactly reproduce from the sealed original PDF',
                    all(x['actualDirectPdfExtractionExact'] for x in he_page_checks)))

ni_guard = next(x for x in regional['mappingExtractionGuards']
                if 'NI.current-reviewed' in x['mapping']['path'])
ni_mapping = read(ni_guard['mapping']['path'])
ni_edges = [x for x in ni_mapping['mappings'] if x['canonicalGoalId'] in selected_goal_ids]
ni_decisions = [x for x in ni_mapping['decisions'] if set(x.get('canonicalGoalIds', [])) & selected_goal_ids]
checks.append(check('NI has no selected-19 mapping or decision targets', not ni_edges and not ni_decisions))

partner_rows = [dict(sourceKey=x['sourceKey'], mappingPath=x['mappingPath'],
                     **row) for x in regional['sourceGoals'] for row in x['allPartnerRows']]
partner_ids = list(dict.fromkeys(x['canonicalGoalId'] for x in partner_rows))
write('all293-partner-rows-with125-whole-current-goals.independent-b.context.json', dict(
    schemaVersion=1, role='FULL_RETAINED_REGIONAL_PARTNER_ROLE_CONTEXT_NOT_NEW_APPROVAL',
    canonicalInput=record(freeze['inputs'][0]['path']), sourceDutyCount=45,
    partnerRows=partner_rows, partnerRowCount=len(partner_rows), uniquePartnerGoalCount=len(partner_ids),
    wholeCurrentPartnerGoals=[by_goal[gid] for gid in partner_ids],
    fullDEENTitleDescriptionAndScopeRead=True, fullGoalBodiesBoundByCanonicalInput=True,
    newPartnerApproval=False, activeWrites=0))

write('independent-b.actual-retention-and-primary-checks.json', dict(
    schemaVersion=1, checkedAt=now, role='SCOPED_READ_ONLY_INDEPENDENT_B_MECHANICAL_RECORD',
    checkCount=len(checks), checks=checks, failures=errors,
    counts=dict(selectedWholeGoals=19, retainedPriorRoles=11, substantiveNewRoles=8,
                allHESourceRows=144, unchangedOtherRowsAndDecisions=125,
                orderedHEMappingRows=158, completeScientificCasesRetained=38,
                completeScientificProfilesRetained=19, regionalDuties=45,
                regionalPartnerRows=293, uniqueWholePartnerGoals=125,
                regionalMappingGuards=29, regionalFileGuards=58,
                inspectedRegionalOriginalPages=24),
    authorSealFailures=author_seal_failures, regionalGuardFailures=guard_failures,
    ownInputSealFailures=own_input_failures, primaryComponentChecks=primary_component_checks,
    sealedActualHEPdf=he_pdf_record, wholeHEPageChecks=he_page_checks,
    NI=dict(mapping=record(ni_guard['mapping']['path']), extraction=record(ni_guard['extraction']['path']),
            allMappingRows=len(ni_mapping['mappings']), allDecisions=len(ni_mapping['decisions']),
            selected19PartnerRows=len(ni_edges), selected19DecisionTargets=len(ni_decisions),
            interpretation='No NI source obligation is remapped or approved by this HE-only source continuation.'),
    noFullQARun=True, canonicalWrites=0, registryWrites=0, activeQAWrites=0,
    newStrictClosures=0, humanApproval=False, humanTrial=False))
if errors:
    raise SystemExit('Do not issue a verdict with failed preservation checks: ' + ', '.join(errors))

# Independent source judgments, written after the complete original and partner texts were read.
judgments = {
    4: ('Die LK-Ergänzung nennt ausdrücklich das energetische Z-Schema einschließlich zyklischer Phosphorylierung. Darstellung beider Wege ist ein passender Teilbeitrag; die neue Passage bindet diesen tatsächlichen Originalort statt einer erfundenen Unterkompetenz.',
        'Keine Gleichsetzung des Energiediagramms mit räumlicher Anordnung; keine Freigabe der vollständigen Lichtreaktions- oder BY-NADPH/ATP-Pflicht.'),
    5: ('C4-Pflanzen sind im Hessen-LK-Abschnitt ausdrücklich genannt. Erklärung räumlicher CO2-Konzentrierung und ihres bedingten Nutzens operationalisiert diesen Eintrag; CAM-Abgrenzung ist ergänzende Autorenwahl.',
        'Die bayerische Kompetenz verlangt zusätzlich expliziten Vergleich von Anatomie, biochemischen Prozessen und Standortangepasstheit. Die Hessen-Bindung erfüllt diese regionale Gesamtpflicht nicht automatisch.'),
    6: ('Die LK-Originalzeile nennt Tracer als Methode und den Calvin-Zyklus als Beispiel. Das aktuelle Beschreiben von Tracer-Versuchen passt; der stärkere Kurztitel „anwenden“ wird durch die unveränderte ganze Beschreibung begrenzt.',
        'Kein behaupteter tatsächlich durchgeführter Tracer-Versuch; der inaktive Englischvorschlag erhält hier keine Native-D/P-Freigabe.'),
    7: ('Die LK-Zeile nennt das energetische Atmungskettenmodell; die fortgesetzten gemeinsamen Grundinhalte nennen chemiosmotische ATP-Bildung und ATP/ADP. Die zwei Originalkomponenten begründen die energetische Modellierung als Teilbeitrag.',
        'Keine vollständige Glucoseabbau-, Bilanz- oder Photosynthesevergleichspflicht; das gemeinsame chemiosmotische Grundwissen wird nicht zu einer exklusiven amtlichen LK-Pflicht umgedeutet.'),
    9: ('Planen und Auswerten der unveränderten Zielbeschreibung tragen Teile der originalen fachpraktischen Arbeit. Seite 44 fordert auch tatsächliche hypothesengeleitete Durchführung mit systematischer Variation und Kontrollansatz. Die operative Entscheidung nennt die fehlende Durchführung ausdrücklich.',
        'HOLD für vollständige Original-Durchführung und praktische Beobachtung; bereitgestellte Daten, Planung und ein Modellantworttext beweisen diese Arbeit nicht.'),
    10: ('Hormonartig wirkende Umweltstoffe stehen tatsächlich Q4.1 auf Seite 47 im LK-Abschnitt. Die neue operative Passage und Entscheidung sind dort richtig gebunden; eine Erklärung der Wirkungen ist ein angemessener bounded Beitrag.',
        'Kein pauschaler Schluss von Konzentration, Persistenz oder trophischer Anreicherung auf Rezeptorwirkung; keine Freigabe der ausgeschlossenen zusammengesetzten Umwelttoxikologie.'),
    11: ('Die neue Q4.1-Bindung nimmt die gemeinsame Pflicht zu Ursache-Wirkungszusammenhängen im Ökosystemmanagement. Schadstoffaufnahme und trophische Anreicherung liefern einen sachlich passenden analytischen Teilweg zu Folgen und Handlungsmöglichkeiten. Der Wechsel weg von der hormonellen LK-Zeile ist substanziell richtig.',
         'Bioakkumulation und Biomagnifikation sind hier Autorenmethoden, keine wörtlich amtlich benannten Pflichtbegriffe. Nicht jede Konzentrationsreihe zeigt Wirkung oder rechtfertigt eine Naturschutzentscheidung; keine endokrine Pflichtdeckung.'),
    12: ('Q4 sieht ökologische Modelle ausdrücklich als Entscheidungshilfe zur Abschätzung und Bewertung menschlicher Eingriffe vor. Wiederholte stochastische Populations-/Patchmodelle können hierzu einen begrenzten methodischen Beitrag leisten. Die neue operative Q4.1-Verknüpfung ist wesentlich tragfähiger als der frühere Verweis allein auf ideale Wachstumsverläufe.',
         'Zufallsmodelle sind keine eigenständig benannte Pflicht. Q3.1-LK verlangt weiterhin ideale exponentielle/logistische Entwicklung; sie wird durch diese neue Modellwahl weder ersetzt noch als abgedeckt erklärt. Die aktuelle Q3-Zielphase bleibt Kompatibilitätsmetadatum.'),
    13: ('Q2.1 nennt populationsgenetischen Artbegriff, Isolation und Artbildung im gemeinsamen Grundinhalt. Die Abgrenzung anhand reproduktiver, morphologischer und genealogischer Kriterien kann den populationsgenetischen Begriff durch Kontrast operationalisieren; der echte Q2-Ort wird operativ berichtigt.',
         'Das amtliche Original benennt keine verpflichtende Dreierliste. Morphologische oder phylogenetische Klassifikation darf nicht mit reproduktiver Isolation gleichgesetzt werden. Die aktuelle Q3-Zielphase macht die Quelle nicht zu Q3.3.'),
    14: ('Die Q2.1-Originalkomponenten verbinden Selektion/Fitness und reproduktive Fitness. Gegebene Fortpflanzungserfolgsdaten in ausdrücklich definierten relativen Fitnesskurven unterstützen Analyse und Modellquantifizierung dieser Inhalte.',
         'Kurvenform, Referenzgruppe und Selektionskoeffizient sind Modellkonventionen; keine amtlich vorgeschriebene Kurvenanpassung und kein kontextunabhängiges Eigenschaftsranking. Die Quelle liegt Q2.1, auch bei aktueller Q3-Zielphase.'),
    15: ('Die gemeinsame Q4.1-Pflicht nennt Erhaltungs- und Renaturierungsmaßnahmen sowie deren Bewertung. Ein begründeter Plan einschließlich Wiederansiedlung als gewählter Maßnahme passt als Teilbeitrag.',
         'Wiederansiedlung ist keine separat genannte amtliche Pflicht; Habitat, Herkunft, Risiken und Monitoring dürfen nicht durch einen bloßen Bestandsgewinn ersetzt werden. Ganze Biodiversitäts-/Nachhaltigkeitspflichten bleiben unfreigegeben.'),
    17: ('Die neuen gemeinsamen Q4.1-Originalstellen verlangen modellgestützte Abschätzung von Eingriffen und Ursache-Wirkungsdenken im Management. Lokale Demographie, Austausch und Kolonisation können konkret erklären, weshalb Habitatqualität und Vernetzung unterschiedliche Maßnahmen verlangen.',
         'Quellen-/Senken- und Metapopulationsbegriffe sind ausgewiesene Autorenwahl. Konstante beobachtete Zahl beweist keinen lokalen Überschuss; Austausch darf nicht mit produktivem Nachwuchs gleichgesetzt werden. Q3.1-Wachstum bleibt eine eigenständige Originalpflicht.'),
    18: ('Die tatsächlichen Q4-Modell- und Managementstellen tragen einen Teilweg über Zustandsänderung und begrenzte Umkehrbarkeit von Eingriffen. Ein explizites Schwellen-/Hysteresismodell macht Folgerungen für Prävention und Wiederherstellung prüfbar.',
         'Modellschwellen sind Annahmen und keine empirisch festgestellten Kipppunkte. Das Original verlangt keinen eigenständig benannten Kipppunktkurs; ganze Managementbewertung wird durch Erkennen einer synthetischen Schwelle nicht geschlossen.'),
    19: ('Q4 verbindet Disziplinen und fordert ökologische Modelle zur Einschätzung menschlicher Eingriffe; der ergänzte operative Managementabschnitt macht den konkreten Beitrag sichtbar. Anwendung eines begrenzten Populationsdatenmodells kann diese Rolle tragen.',
         '„Bioinformatik“ ist eine Autorenmethodenbezeichnung, keine genannte Pflicht. Die alternative Populationsdatenaufgabe beweist weder vollständige Klimadatenabdeckung noch eigene ökologische Feldmessung; Extrapolation und Kausalbehauptungen bleiben begrenzt.'),
    20: ('Vergleich klar formulierter Eingriffsszenarien operationalisiert die gemeinsame Q4.1-Bewertung von Naturschutzmaßnahmen und die modellgestützte Abschätzung von Folgen.',
         'Szenarien, Gewichtungen und Wertannahmen sind transparent zu halten; keine amtlich eigenständig benannte Szenariomethode und kein vollständiger Ersatz aller Nachhaltigkeitsdimensionen.'),
    21: ('Die originale Kopplung von Photosynthesefaktoren und Calvin-Reaktionen sowie die LK-C4-Ergänzung bilden einen konkreten Kontext, in dem Photorespiration einen fachlichen Teilzusammenhang erklärt.',
         'Photorespiration ist kein separat benannter Originalpflichtpunkt. Die beiden Kursebenen der Komponenten bleiben getrennt; keine ganze Photosynthese-/C4-Pflichtdeckung.'),
    22: ('Die gemeinsame Q3.2-Pflicht verknüpft Calvin-/Lichtreaktionen, Enzymregulation und Kompartimente. Untersuchung der Calvin-Regulation ist ein begrenzter, zutreffender Mechanismenbeitrag.',
         'Die konkrete Redoxregelung ist Autorenelaboration; weder eine exklusiv amtliche LK-Pflicht noch vollständige Deckung aller Enzymregulation wird behauptet.'),
    23: ('Die gemeinsamen Q3.2-Originalstellen nennen aufbauenden/abbauenden Stoffwechsel, Enzymregulation, Kompartimenttransport und chemiosmotisches ATP/ADP. Eine Netzwerkdarstellung kann diese Zusammenhänge konkret integrieren.',
         'Die graphische Netzwerkaufgabe ist keine gesondert nummerierte amtliche Kompetenz; Darstellung ersetzt keine vollständigen Stoff-, Energie- oder praktisch-operativen Pflichten.'),
    24: ('Q4-Modellvorstellungen zur Folgenabschätzung und die gemeinsame Managementbewertung begründen den begrenzten Beitrag einer störungsspezifischen Betrachtung von Widerstand und Wiedererholung.',
         'Resilienz ist eine Autorenbegriffswahl, keine eigenständig genannte Originalpflicht. Widerstand und Erholung sind keine universelle Rangfolge und schließen die sozialen, wirtschaftlichen und ökologischen Bewertungsdimensionen nicht vollständig.'),
}

verdicts = []
for role in roles['goals']:
    ordinal = role['ordinal']
    sid = role['sourceGoalId']
    g = role['wholeCurrentGoal']
    reason, boundary = judgments[ordinal]
    verdicts.append(dict(ordinal=ordinal, goalId=g['id'], title=g['title'],
        wholeCurrentGoalSha256=object_hash(g), sourceGoalId=sid,
        operativeSourceRowSha256=object_hash(by_source[sid]),
        operativeSourcePassageSha256=object_hash(by_passage[by_source[sid]['passageId']]),
        operativeMappingDecisionSha256=object_hash(by_decision[sid]),
        operativePartnerRows=[x for x in mapping['mappings'] if x['legacyGoalId'] == sid],
        actualOriginalComponents=role['actualPrimaryComponents'],
        actualOriginalTopic=role['proposedActualPrimaryTopic'],
        actualOriginalCourseScopes=role['actualOriginalCourseScopes'],
        authoredTargetCourseLevel=role['authoredTargetCourseLevel'],
        sourceKind=role['proposedSourceKind'], sourceStatus=role['sourceStatus'],
        substantiveNewSourceRole=ordinal in [11,12,13,14,17,18,19,24],
        independentSourceVerdict='ACCEPT_BOUNDED_HE_SOURCE_ROLE_ONLY',
        independentReasonDE=reason, retainedBoundaryAndHoldDE=boundary,
        matchType='partial', mandatoryNamedWholeGoalClaim=False,
        officialBulletNumberingClaim=False, wholeOriginalSourceCoverage=False,
        wholeCanonicalGoalApproval=False, wholeRegionalPartnerApproval=False,
        scientificCasesAndProfileBodies='EXACT_RETAINED_EXISTING_SCIENTIFIC_REVIEW_SCOPE',
        nativeDApproval=False, nativePApproval=False, imageVApproval=False,
        newStrictClosures=0, humanApproval=False, humanTrial=False))

prior24_context_path = next(x['path'] for x in freeze['inputs']
                          if x['path'].endswith('selected24.current-whole-goals.context.exact.json'))
prior24 = read(prior24_context_path)['wholeGoals']
excluded = [dict(ordinal=n, goalId=prior24[n-1]['id'], title=prior24[n-1]['title'],
                 verdict='HOLD_RETAINED_EXCLUDED_NOT_REOPENED',
                 wholeGoalExactToCurrentCanonical=prior24[n-1] == by_goal[prior24[n-1]['id']])
            for n in [1,2,3,8,16]]
neuro = by_decision['ca155d02-5fae-5222-85a4-881c0a69b0de']
retained_science_carriers = [record(x['path']) for x in freeze['inputs']
    if any(s in x['path'] for s in ['P17-two-field-only-genuine-scientific-followup',
         'completed-six-case-five-profile-science-and-source-only-P5',
         'two-focus-fields-targeted-scientific-first'])]

regional_boundaries = {
    'DE-BB/DE-BE': 'Original 3.2/3.3 require ecosystem relations, photosynthesis/cycles and human energy conversion in their complete context. Advanced energetic models contribute partially; they do not prove fieldwork or all organ-system duties.',
    'DE-BY': 'B13 EA/GA 3.1 separates explaining rates and consequences, actual pigment separation, chemiosmotic NADPH/ATP explanation and the EA-only tracer/C3-C4 extension. 3.3 requires aerobic/anaerobic pathways, balances and comparison with photosynthesis. 4.1-4.3 add measurement, data acquisition and multi-perspective management duties. No complete BY duty is newly approved here.',
    'DE-MV': 'Original printed17/18 (physical21/22) joins assimilation/dissimilation with lungs, circulation, blood and health. A cell-level model is not complete coverage of the multi-organ duty.',
    'DE-NW': 'IF1 and IF4 original full pages include plant structure, reproduction, actual variable-controlled experiments, field taxa/factor measurement and ethical/ecological/economic judgment. These are not discharged by one HE model.',
    'DE-SH': 'Original SE1-SE8 spans nutrition, blood, gas exchange, photosynthesis/cell respiration, cycles and sustainable personal behavior; the retained 28 partners are a role frame, not a union-wide approval.',
    'DE-SN': 'Original K9 LB1 requires anatomical work, microscopy/drawing, diffusion/osmosis and photosynthesis/respiration relations; original experiments and measurements remain separate from explanatory models.',
    'DE-ST': 'Original 7/8 duties include cell microscopy, actual controlled fermentation experiment and documentation, organ-system/health duties, water-transport investigation and agricultural evaluation; actual mandatory practical work remains open.',
    'DE-TH': 'Original printed16-18/20-21 (physical22-24/26-27) includes human organs/health, plant physiology, photosynthesis, respiration, fungi, microscopy and performed experiments; no compound-source closure follows from HE acceptance.',
    'DE-NI': 'The sealed current-reviewed 301 mapping rows and 123 decisions have zero selected-19 target references; retain them exactly and infer no NI approval or duty reassignment.'}

write('source19-operative-original-roles.independent-b.first-verdict.json', dict(
    schemaVersion=1, reviewedAt=now, reviewerIdentity='/root/curricula_live_diagnosis/zip64_loader_source',
    role='GENUINE_INDEPENDENT_B_FIRST_SOURCE_VERDICT_FOR_SEALED_19_GOAL_8_ROLE_CONTINUATION',
    blinding=dict(newIndependentAOutputsRead=False, newIndependentAOutputsCompared=False,
                  ownVerdictWrittenBeforeAnyNewPeerComparison=True,
                  retainedHistoricalScientificCarriersPermitted=True),
    candidateEntry=record(AUTHOR / 'neutral-author-continuation.entry.json'),
    authorFirstSeal=record(AUTHOR / 'author-first-input-output.freeze.json'),
    firstInputSeals=[record(OUT / n) for n in ['independent-b.first-input.freeze.json',
                     'independent-b.regional-inputs.freeze.json',
                     'independent-b.original-cache-inputs.freeze.json']],
    operative144Source=record(entry['operativeFull144SourceCandidate']),
    operative144Mapping=record(entry['operativeFull144MappingCandidate']),
    exactPreservationReceipt=record(OUT / 'independent-b.actual-retention-and-primary-checks.json'),
    wholeHEPagesRead=[42,44,45,46,47], completeRegionalOriginalPages=24,
    wholeBYOriginalTextInputs=[record(OUT.parent / 'biologie-he-metabolism-ecology-twenty-four-whole-science-author-20261008-v1' / 'primary' / n)
                             for n in ['BY12-GA-official.actual-text.txt', 'BY13-GA-official.actual-text.txt', 'BY13-EA-official.actual-text.txt']],
    fullRegionalDutyCount=45, fullPartnerRowCount=293, uniqueWholePartnerGoalTextsRead=125,
    partnerContext=record(OUT / 'all293-partner-rows-with125-whole-current-goals.independent-b.context.json'),
    regionalOriginalIndex=record(OUT / 'regional-original-pages.index.independent-b.json'),
    regionalRoleBoundaries=regional_boundaries,
    retainedScientificReviewCarriers=retained_science_carriers,
    scientificReviewPolicy='Retain exact reviewed v4 case/v5 profile bodies and their historical scientific judgments. This source verdict does not restart or replace a science/native review.',
    verdicts=verdicts, summary=dict(boundedHERolesAccepted=19, newSubstantiveRolesAccepted=8,
        operativeRetainedRoleBindingsAccepted=11, newBlockingSourceFindingsWithin19=0,
        wholeSourceApprovals=0, wholeRegionalPartnerApprovals=0, sourceCoverageReclassification='partial throughout selected19'),
    retainedExcludedWholeGoalHolds=excluded,
    retainedNeuroGK2Hold=dict(wholeDecision=neuro, exactToBaseline=neuro == old_by_decision[neuro['sourceGoalId']], reopened=False),
    retainedWholeOriginalPracticalWorkHold=dict(goalId='280bab15-94e8-59fb-9359-c1c0f8384b2a',
        originalComponents=['HE-current-p44-lines19-26','HE-current-p46-lines19-19'],
        roleAccepted='Planning and supplied-data evaluation only', performedExperiments=0,
        actualExecutionApproval=False),
    laterSeparateGates=['Actual native D pages','Actual native P pages/final raster','Actual image V review'],
    protectedM7Floors='No integration or central run; both protected floors remain unchanged, not recertified by this source review.',
    canonicalWrites=0, registryWrites=0, activeQAWrites=0, memoryWrites=0,
    newStrictClosures=0, bindingRestorations=0, performedExperiments=0,
    actualLearnerEvidence=False, humanApproval=False, humanTrial=False))
print(json.dumps(dict(checksPassed=len(checks), failures=errors, boundedHERolesAccepted=19,
                      newSourceRolesAccepted=8, unchangedOtherRowsAndDecisions=125,
                      newBlockingSourceFindingsWithin19=0, strictGain=0)))
