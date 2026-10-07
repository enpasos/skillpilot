# SPDX-License-Identifier: Apache-2.0
"""Serialize the performed blind whole-goal, primary, raster and native-page review."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

root = Path.cwd()
own = Path(__file__).resolve().parent
author = own.parent / 'biologie-ecology20b-current391-author-v1'
image_author = root / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-ecology20b-current391-image-author-root-20261007-v1'
native = author / 'native-raster-candidate/twelve'
campaign_dir = native / 'round-a'
read = lambda p: json.loads(p.read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def write(p, value):
    content = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    if p.exists():
        assert p.read_text() == content, f'Already serialized immutable payload differs: {p}'
        return
    with p.open('x') as handle:
        handle.write(content)
def binding(p):
    return {'path': str(p.relative_to(root)), 'sha256': sha(p), 'bytes': p.stat().st_size}

now = datetime.now(timezone.utc).isoformat()
science = read(own / 'first-twelve-whole-science.actual.json')
visual_first = read(own / 'first-twelve-full-360-680-visual-findings.actual.json')
neutral = read(own / 'inputs/exact-twelve-neutral-whole-goals-and-twentyfour-cases.json')
campaign = read(campaign_dir / 'description-review-campaign.json')
bundle = read(campaign_dir / 'review-bundle-manifest.json')
inp = read(campaign_dir / 'description-review-input.json')
batch = campaign['batches'][0]
existing_run = own / 'native-results' / (batch['batchId'] + '.run.json')
if existing_run.exists():
    now = read(existing_run)['completedAt']
selected = read(image_author / 'selected-twelve-raster-inputs.author-handoff.frozen.json')
assert sha(author / 'author.final-twelve-current391-native-inputs.freeze.json') == 'sha256:d9f4ed46c31d2551d891267c7702640131e5a73c008df238507808f96880f71f'
author_freeze = read(author / 'author.final-twelve-current391-native-inputs.freeze.json')
for item in author_freeze['frozenFiles']:
    p = root / item['path']
    assert sha(p).removeprefix('sha256:') == item['sha256'].removeprefix('sha256:')
    assert p.stat().st_size == item['bytes']
assert len(author_freeze['frozenFiles']) == 105
assert sha(image_author / 'selected-twelve-raster-inputs.author-handoff.frozen.json') == 'sha256:e7bbca6881b7340def7141ed3e2d0ae3e6673a264a179d3f08ccf720cab6537f'

# Six fields per goal are the independent reviewer's scientific chain, not copied author judgments.
chains = {
    1: (
        'Nahrungsnetze verbinden Produzenten, Konsumenten und Destruenten; gerichteter Energiefluss mit Verlusten und rückgekoppelte Bestandsänderungen sind von Stoffkreisläufen und bloßer zeitlicher Korrelation zu unterscheiden.',
        'Food webs connect producers, consumers and decomposers; directional energy flow with losses and feedback in abundance differ from matter cycles and mere temporal correlation.',
        'Die lernende Person beschreibt das vollständige Netz mit definierter Pfeilrichtung, erklärt die zwei gegebenen Energieübergänge und eine direkte oder indirekte Populationsrückkopplung mit passender Aussagegrenze.',
        'The learner describes the complete web with a defined arrow convention, explains both supplied energy transfers and a direct or indirect population feedback with an appropriate limit to the claim.',
        'Bei geändertem Netz, anderen Energieanteilen und einer veränderten Art beschreibt sie die resultierende Beziehung neu, ohne eine feste Zehnprozentregel oder aus einer Verzögerung allein bewiesene Kausalität anzunehmen.',
        'For a changed web, different energy fractions and a changed species, the learner redescribes the relationship without assuming a fixed ten-percent rule or causation proven solely by a lag.'),
    2: (
        'Pflanzenbau vermittelt Funktionen unter Wasser-, Licht- und Sauerstoffbedingungen; dieselbe Struktur kann Vorteile und Kosten haben, ohne absichtliche individuelle Umgestaltung zu bedeuten.',
        'Plant structures mediate functions under water, light and oxygen conditions; a structure can have benefits and costs without intentional individual redesign.',
        'Die lernende Person erklärt an den gegebenen Blatt-, Wurzel- und Gewebemerkmalen den jeweiligen Struktur-Funktions-Zusammenhang und nennt eine passende Abwägung oder Beobachtungsgrenze.',
        'The learner explains the relevant structure-function relationship for supplied leaf, root and tissue features and identifies an appropriate tradeoff or observational limit.',
        'In einem anderen Wasser- oder Lichtmilieu leitet sie aus tatsächlich gegebenen Baumerkmalen die plausible Funktion ab und unterscheidet belegte Merkmale von ungemessenen physiologischen Vermutungen.',
        'In a different water or light environment, the learner infers a plausible function from supplied structures and separates observed features from unmeasured physiological conjectures.'),
    3: (
        'Tierische morphologische und physiologische Merkmale verändern Wärme- und Wasserhaushalt; funktionelle Zusammenhänge müssen an konkreten Strukturen oder Messangaben erklärt werden.',
        'Animal morphological and physiological features change heat and water balance; functional relationships must be explained using concrete structures or measurements.',
        'Die lernende Person beschreibt die vorgegebenen Bau- und Funktionsmerkmale, verknüpft Oberfläche, Isolation oder Austausch mit Wärme beziehungsweise Wasser und hält die Daten- und Modellgrenzen fest.',
        'The learner describes supplied structural and functional features, links surface, insulation or exchange to heat or water and states data and model limits.',
        'Bei einem neuen Tiervergleich begründet sie den Zusammenhang mit geänderten Umweltbedingungen, ohne aus einem Bild allein eine Wasserbilanz oder zielgerichtete Anpassung zu behaupten.',
        'In a fresh animal comparison, the learner explains the relationship under changed environmental conditions without inferring a water budget or goal-directed adaptation from an image alone.'),
    4: (
        'Dynamische ökologische Modelle verknüpfen Zustandsgrößen, Änderungen und bedingte Parameter; diskrete Folgebestände unterscheiden sich von momentanen kontinuierlichen Änderungsraten.',
        'Dynamic ecological models link state variables, change and conditional parameters; discrete next abundances differ from instantaneous continuous rates of change.',
        'Die lernende Person nutzt und erläutert beide gemeinsamen Wachstumsmodelle, berechnet die jeweils verlangten Größen und erklärt Selbstbegrenzung, Kapazität und Prognosegrenzen; die zusätzliche Lotka-Volterra-Leistung bleibt quellen- und kursbedingt.',
        'The learner uses and explains both shared growth models, calculates requested quantities and explains self-limitation, capacity and prediction limits; additional Lotka-Volterra performance remains source- and course-conditional.',
        'Bei geänderten Startwerten oder Kapazität erläutert sie die neue Änderung korrekt. Wo die gebundene EA-Quelle Lotka-Volterra verlangt, erklärt sie zusätzlich vier Terme, positives Gleichgewicht und Phasenverschiebung ohne reale konstante Bestände zu garantieren.',
        'With changed starting values or capacity, the learner correctly explains the new change. Where the bound advanced-course source requires Lotka-Volterra, the learner additionally explains four terms, positive equilibrium and phase lag without guaranteeing real constant abundances.'),
    5: (
        'Ökosystemmanagement verbindet Schutzmaßnahmen mit Habitatbeziehungen, Störungsfolgen und überprüfbaren Zielkriterien; eine Maßnahme garantiert weder Stabilität noch vollständige Konfliktfreiheit.',
        'Ecosystem management links protection measures to habitat relationships, disturbance effects and checkable objectives; a measure guarantees neither stability nor absence of conflicts.',
        'Die lernende Person beurteilt die vorgegebenen Ufer- oder Waldmaßnahmen anhand ökologischer Wirkungen, Nutzungs- und Sicherheitskonflikte sowie eines passenden Vorher-Nachher-Vergleichs mit Kontrolle.',
        'The learner assesses supplied bank or woodland measures using ecological effects, use and safety conflicts and an appropriate before-after comparison with control.',
        'Für ein anderes Habitat begründet sie eine angepasste Maßnahme und überprüfbare Erfolgskriterien, statt eine fremde Maßnahme unverändert zu übernehmen oder Erfolg aus ihrer Durchführung abzuleiten.',
        'For another habitat, the learner explains an adapted measure and checkable success criteria instead of copying a measure unchanged or inferring success from implementation.'),
    6: (
        'Torpor und Winterschlaf sind regulierte Zustände gesenkter Stoffwechsel- und Körpertemperatur; kurzfristige und saisonale Energiestrategien unterscheiden sich einschließlich kostspieliger Aufwärmphasen von gewöhnlichem Schlaf.',
        'Torpor and hibernation are regulated states of reduced metabolism and body temperature; short-term and seasonal energy strategies, including costly warming phases, differ from ordinary sleep.',
        'Die lernende Person erklärt die gegebenen Temperatur-, Zeit- und Energieverläufe, unterscheidet die beiden Strategien und verknüpft die eingesparte Energie mit ihren Bedingungen und Kosten.',
        'The learner explains supplied temperature, time and energy patterns, distinguishes both strategies and links saved energy to its conditions and costs.',
        'Bei anderen Nahrungslagen und Aufwärmhäufigkeiten erklärt sie die veränderte Energiebilanz und begrenzt den Vergleich auf vorgegebene Messungen, ohne jedes ruhende Tier als winterschlafend einzuordnen.',
        'Under changed food availability and warming frequency, the learner explains the changed energy balance and limits the comparison to supplied measurements rather than classifying every resting animal as hibernating.'),
    7: (
        'Der ökologische Fußabdruck vergleicht standardisierte Flächennachfrage mit Biokapazität; er ist ein bedingter Nachhaltigkeitsindikator und weder ausschließlich CO2-Ausstoß noch vollständige Umwelt- oder Schuldzuweisung.',
        'The ecological footprint compares standardized area demand with biocapacity; it is a conditional sustainability indicator, neither solely carbon emissions nor a complete environmental or blame assessment.',
        'Die lernende Person berechnet die gegebenen individuellen oder aggregierten Flächen und Verhältnisse, analysiert eine Maßnahme und benennt Aussagegrenzen und unberücksichtigte Umweltaspekte.',
        'The learner calculates supplied individual or aggregate areas and ratios, analyses a measure and identifies limits and omitted environmental dimensions.',
        'Bei veränderter Bevölkerungszahl, Flächennachfrage oder Biokapazität passt sie die Rechnung und Bewertung an, ohne einen geringeren Einzelwert automatisch als nachhaltigen Gesamtzustand auszugeben.',
        'With changed population, demand or biocapacity, the learner updates calculation and assessment without treating a reduced individual value as an automatically sustainable aggregate state.'),
    8: (
        'Eine Freilanduntersuchung verbindet prüfbare Frage, kontrollierten Vergleich, beobachtbare Merkmale, naturverträgliche Durchführung und nachvollziehbare Dokumentation; synthetische Materialfälle ersetzen keine tatsächlich erbrachte Untersuchung.',
        'A field investigation links a testable question, controlled comparison, observable features, low-impact execution and traceable documentation; synthetic cases do not replace an actually performed investigation.',
        'Die lernende Person plant die Wiesen- beziehungsweise Uferuntersuchung mit vergleichbaren Proben und dokumentiert bei tatsächlicher Durchführung eigene Beobachtungen, Verfahren, Unsicherheit und begrenzte Schlussfolgerungen.',
        'The learner plans the meadow or bank investigation with comparable samples and, when actually performing it, records observations, methods, uncertainty and bounded conclusions.',
        'In einer anderen Feldsituation passt sie Vergleich und Protokoll an und führt sie im zulässigen Rahmen durch; erfundene Messwerte oder eine bloße Planantwort gelten nicht als Nachweis der Durchführung.',
        'In a different field setting, the learner adapts the comparison and protocol and executes them within permitted bounds; invented measurements or a planning answer alone do not prove execution.'),
    11: (
        'Lebensgeschichtliche und r/K-Heuristiken beschreiben Abwägungen zwischen Nachkommenzahl, Überleben, Fürsorge und Umweltbedingungen; sie sind Idealtypen und keine starren Artklassen.',
        'Life-history and r/K heuristics describe tradeoffs among offspring number, survival, care and environmental conditions; they are ideal types rather than rigid species classes.',
        'Die lernende Person analysiert die vorgegebenen Lebenszyklen und Nachkommensdaten, begründet den jeweiligen Umweltbezug und trennt einzelne Überlebensanteile von vollständiger reproduktiver Fitness.',
        'The learner analyses supplied life cycles and offspring data, explains their environmental relationship and separates a survival fraction from complete reproductive fitness.',
        'Bei geändertem Störungsregime oder unterschiedlicher späterer Fortpflanzung bewertet sie die Strategie neu, ohne stets mehr Nachkommen oder eine bestimmte Idealtypklasse als überlegen anzusehen.',
        'With a changed disturbance regime or later reproduction, the learner reassesses the strategy without treating more offspring or one ideal-type category as universally superior.'),
    13: (
        'Balz, Territorialität und Kooperation können unterschiedliche Kosten und Fortpflanzungsbeiträge haben; eine evolutionäre Erklärung unterscheidet Funktionshypothese, Beobachtung und hinreichenden Fitnessbeleg.',
        'Courtship, territoriality and cooperation can entail different costs and reproductive contributions; an evolutionary explanation separates a functional hypothesis, observation and sufficient fitness evidence.',
        'Die lernende Person interpretiert die vorgegebenen Verhaltensvergleiche anhand konkreter Kosten, Nutzen und Nachkommensangaben und benennt konkurrierende Erklärungen beziehungsweise fehlende Daten.',
        'The learner interprets supplied behavioural comparisons using concrete costs, benefits and offspring information and identifies competing explanations or missing data.',
        'Bei geändertem Partnererfolg oder Verwandtschafts- und Hilfekontext erklärt sie die neue plausible Fitnesswirkung, ohne Absicht, automatische Verwandtenselektion oder unbelegten Anpassungsnutzen zu behaupten.',
        'With changed mating success or kinship and helping context, the learner explains the new plausible fitness effect without claiming intention, automatic kin selection or unsupported adaptive benefit.'),
    14: (
        'Klimaveränderungen können Verbreitungsräume und zeitliche Beziehungen zwischen Arten verändern; ökologische Folgen hängen von Ausweichraum, Wechselwirkungen und Datenunsicherheit ab.',
        'Climate change can alter ranges and timing relationships among species; ecological consequences depend on available space, interactions and data uncertainty.',
        'Die lernende Person bewertet den vorgegebenen Höhen- oder Phänologiefall mit rechnerisch korrekter Überlappung und begründet mögliche Folgen, Handlungsoptionen und Grenzen der Schlussfolgerung.',
        'The learner assesses the supplied altitude or phenology case with correctly calculated overlap and explains possible effects, options and limits to the inference.',
        'Bei anderem Gebirgsraum oder anders verschobenen Artenzeiten bewertet sie die Folgen neu, ohne zwangsläufige Migration oder Aussterben zu behaupten; EA-Zusatzinhalte werden nicht auf gemeinsame GA-Leistung übertragen.',
        'With another mountain setting or different timing shifts, the learner reassesses consequences without claiming inevitable migration or extinction; advanced-course additions are not transferred into common basic-course performance.'),
    16: (
        'Ökosystemleistungen verbinden ökologische Funktionen mit menschlichem Nutzen und wirtschaftlichen Abwägungen; monetäre Angaben decken weder alle Werte noch ersetzbare Biodiversität vollständig ab.',
        'Ecosystem services connect ecological functions to human benefits and economic tradeoffs; monetary figures cover neither all values nor fully replaceable biodiversity.',
        'Die lernende Person beurteilt Feuchtgebiets- oder Bestäubungsoptionen mit korrekter Kosten-Nutzen-Rechnung, ökologischen Wirkungen und expliziten nicht monetarisierten beziehungsweise unsicheren Werten.',
        'The learner assesses wetland or pollination options using correct cost-benefit calculation, ecological effects and explicit unmonetized or uncertain values.',
        'Bei veränderten Preisen, Kosten oder Leistungen passt sie das Urteil an, vermeidet Doppelzählung und behandelt unbekannte Werte nicht als null oder einen Geldvorteil als vollständige ökologische Rechtfertigung.',
        'With changed prices, costs or services, the learner updates the assessment, avoids double counting and treats neither unknown values as zero nor monetary benefit as complete ecological justification.'),
}
fields = ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn']
science_by_id = {r['goalId']: r for r in science['records']}
run_id = 'biologie-ecology20b-twelve-independent-a-final-20261007-v1'
results = own / 'native-results'
results.mkdir(exist_ok=True)
records = []
for goal in inp['goals']:
    s = science_by_id[goal['goalId']]
    assert goal['currentDescriptionDe'] == s['wholeDescriptionDe'] and goal['currentDescriptionEn'] == s['wholeDescriptionEn']
    records.append({'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json', 'schemaVersion': 1, 'recordId': run_id + ':' + goal['goalId'], 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'], **{k: goal[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']}, 'decision': 'keep', 'understandingEvidence': dict(zip(fields, chains[s['ordinal']])), 'rationale': s['rationaleDe'] + ' Der ganze aktuelle DE/EN-Zieltext, vollständige Vorbedingungs-/Nachfolgerkontext, die tatsächlich gesehene native Buchseite und das unabhängig geprüfte Bild bleiben fachlich kohärent. Die beigefügten eigenen Modellmaterialien sind E1/G1 und behaupten keine reale Lernendenleistung.', 'evidenceProfileContract': 'positive-understanding-evidence-v2', 'evidenceProfileRecommendation': 'create' if goal['reviewContext'].get('evidenceProfile') is None else 'none', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'})
assert [r['goalId'] for r in records] == batch['goalIds'] and len(records) == 12
record_path = results / (batch['batchId'] + '.records.jsonl')
write(record_path, ''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in records))
parameters = {'actualAgent': '/root/b008_placements_author_resume', 'provider': 'OpenAI', 'model': 'Codex; exact serving revision and sampling parameters are not exposed', 'authoredThisPackage': False, 'peerOutputsRead': False, 'rootImageAuthorVerdictsReadBeforeOwnScienceAndVisualSeals': False, 'authorNativePageNotesReadOnlyAfterOwnAllTwelvePageInspection': True, 'wholeSelectedGoals': 12, 'actualNativePages': 12}
write(own / 'actual-review-agent-parameters.json', parameters)
artifacts = [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_pdf', 'book_pdf_render_manifest', 'book_model', 'review_input_json', 'review_prompt', 'review_criteria']]
artifacts.append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
write(results / (batch['batchId'] + '.run.json'), {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion': 1, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'], 'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'], 'provider': 'OpenAI', 'model': 'Codex independent A reviewer; exact serving revision not exposed', 'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2', 'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'], 'generationParametersFingerprint': sha(own / 'actual-review-agent-parameters.json'), 'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True, 'goalIds': batch['goalIds'], 'inputArtifacts': artifacts, 'startedAt': science['recordedAt'], 'completedAt': now, 'status': 'completed', 'outputDigest': sha(record_path), 'toolchainVersion': 'native-goal-description-review-v3'})

positive = [json.loads(line) for line in (author / 'source-locator-precision-v3/P12.actual-raster-source-roles-author-v3.review.jsonl').read_text().splitlines()]
for r in positive:
    r.update(reviewId='biologie-ecology20b-twelve-independent-a-positive-final-20261007-v1', reviewedAt=now, reviewer='OpenAI Codex independent A; complete DEEN12 goals/24 whole common cases, conditional BY-EA extension and actual bounded primary sections before peer outputs', reviewRunIds=[run_id], reason=science_by_id[r['goalId']]['rationaleDe'] + ' Zwölf vollständige aktuelle bilinguale Ziele und 24 vollständige DE/EN-Modellfälle plus kursbedingte BY-EA-Erweiterung, tatsächliche Bildbytes bei voller und 360/680-Pixel-Breite sowie zwölf tatsächliche aktuelle Buchseiten unabhängig geprüft. E1/G1 bleibt maschinelle Profil-QS; keine tatsächlich erbrachte Lernendenleistung, menschliche Freigabe oder Erprobung.')
    r['dissent'][0] = 'Unabhängige maschinelle A-Prüfung des E1/G1-Profils und seiner tatsächlichen aktuellen Raster- und Seitenbindungen abgeschlossen. Keine reale Lernendenleistung, kein E2, keine menschliche Freigabe oder Erprobung; zweiter unabhängiger Review und zentrale Integration bleiben separate Schritte.'
    assert r['status'] == 'needs_human_review' and r['reviewAuthority'] == 'ai_candidate' and r['evidenceLevel'] == 'E1' and r['maximumClaimScope'] == 'G1'
write(own / 'P12.actual-raster-independent-a.review.jsonl', ''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in positive))

manifest_by_id = {r['goalId']: r for r in selected['images']}
pages_by_id = {g['goalId']: (n + 3, g) for n, g in enumerate(inp['goals'])}
v_records = []
for first in visual_first['records']:
    selected_row = manifest_by_id[first['goalId']]
    assert first['actualRaster']['path'] == selected_row['path'] and first['actualRaster']['sha256'] == selected_row['sha256']
    physical, goal = pages_by_id[first['goalId']]
    page_capture = own / 'actual-pages' / f'physical-{physical:02}.png'
    assert page_capture.is_file()
    v_records.append({**first, 'sourcePath': selected_row['path'], 'assetSha256': 'sha256:' + selected_row['sha256'], 'aiApproved': 'yes', 'aiApprovedAssetSha256': 'sha256:' + selected_row['sha256'], 'aiReviewedAt': now, 'aiReviewer': run_id, 'aiNotes': first['rationaleDe'] + ' Auch die tatsächliche vollständige aktuelle native Buchseite wurde unabhängig gesehen; Motiv, Alt-Texte und Zielumfang stimmen überein.', 'altDe': selected_row['altDe'], 'altEn': selected_row['altEn'], 'provider': selected_row['provider'], 'selectedCandidateVersion': selected_row['selectedCandidateVersion'], 'actualSeen': ['full', '360', '680', 'native-book-page'], 'finalAuthorSelectionManifestNotYetBound': False, 'nativeBookPageNotYetSeen': False, 'nativePhysicalPage': physical, 'nativeGoalFingerprint': goal['goalFingerprint'], 'nativePageFingerprint': goal['pageFingerprint'], 'actualNativePageCapture': binding(page_capture), 'humanApproved': False, 'approvedForPublication': False})
write(own / 'V12.actual-raster-widths-pages-independent-a.final.json', {'schemaVersion': 1, 'artifactKind': 'independent-a-final-actual-twelve-raster-and-native-page-review', 'recordedAt': now, 'reviewRole': 'Independent A, not material or image author', 'selectedManifest': binding(image_author / 'selected-twelve-raster-inputs.author-handoff.frozen.json'), 'actualBookPDF': binding(native / 'book.pdf'), 'actualPNGs': 12, 'actualWidthCaptures': 24, 'actualNativePages': 12, 'records': v_records, 'blockingVisualFindings': 0, 'humanApproval': False, 'activeWrites': 0, 'strictGainClaimed': 0})

before = {p['goalId']: p for p in read(author / 'native-raster-candidate/full391.before-twelve-links.pure.book-model.json')['pages']}
full = {p['goalId']: p for p in read(author / 'native-raster-candidate/full391.book-model.json')['pages']}
rows = []
for g in inp['goals']:
    old, current, subset = before[g['goalId']], full[g['goalId']], g['reviewContext']['page']
    stable = [k for k in old if k not in ['visualization', 'goalFingerprint', 'pageFingerprint']]
    assert all(old[k] == current[k] for k in stable)
    assert current['goalFingerprint'] == g['goalFingerprint']
    def combined_rel(page, kind):
        external = 'externalPrerequisites' if kind == 'requires' else 'externalReverseRequires'
        return sorted((r['goalId'], r['title']) for r in page[kind] + page[external])
    assert combined_rel(current, 'requires') == combined_rel(subset, 'requires')
    assert combined_rel(current, 'reverseRequires') == combined_rel(subset, 'reverseRequires')
    for key in ['title', 'description', 'breadcrumbs', 'chapterIds', 'applicability', 'visualization', 'evidenceReview']:
        assert current.get(key) == subset.get(key)
    rows.append({'goalId': g['goalId'], 'full391PageNumber': current['pageNumber'], 'nativeSubsetPhysicalPage': pages_by_id[g['goalId']][0], 'unchangedFullContextFieldsActuallyRead': stable, 'sameCombinedPrerequisiteAndSuccessorIdsTitles': True, 'sameWholeDescriptionAndChapterAndScope': True, 'fullGoalFingerprint': current['goalFingerprint'], 'subsetGoalFingerprint': g['goalFingerprint'], 'fullPageFingerprint': current['pageFingerprint'], 'subsetPageFingerprint': g['pageFingerprint'], 'exactPageFieldDeltas': [{'field': k, 'subset12': subset.get(k), 'full391': current.get(k)} for k in sorted(set(subset) | set(current)) if subset.get(k) != current.get(k)]})
unchanged = [gid for gid in full if gid not in pages_by_id and before[gid] == full[gid]]
assert len(unchanged) == 379
write(own / 'actual-subset12-full391-page-context-binding-comparison.json', {'role': 'Actual targeted full391 context reading and equality of combined internal/external prerequisites/successors; subset12 physical pages seen, no full391 PDF claim', 'rows': rows, 'wholeCurrentFull391Pages': 391, 'unchangedOther379FullPagePayloads': True, 'automaticHashSubstitutionAllowed': False, 'requiredIntegration': 'Use native scope/context compatibility or actual targeted current full391 binding review; retain the distinct subset12 page hashes, not silent hash substitution.', 'humanApproval': False})
write(own / 'actual-final-twelve-native-page-inspection.receipt.json', {'role': 'Independent actual native PDF physical pages3–14, whole DEEN goals and exact image/page/context inspection', 'reviewedAt': now, 'bookPdf': binding(native / 'book.pdf'), 'actualPages': [{'goalId': g['goalId'], 'physicalPage': n + 3, 'capture': binding(own / 'actual-pages' / f'physical-{n + 3:02}.png'), 'actuallySeen': True, 'descriptionVerdict': 'keep', 'pageClippingOrOverflowFindings': 0, 'contextActuallyRead': ['title', 'whole description', 'chapter breadcrumbs', 'scope', 'all prerequisites and reverse requirements including external links', 'actual final image']} for n, g in enumerate(inp['goals'])], 'humanApproval': False, 'strictGainClaimed': 0})

by_primary = own.parent / 'biologie-ecology20-current391-author-v2/primary-inputs'
write(own / 'source-role-v3-ordinal14-independent-a-targeted-resolution.json', {'role': 'Independent targeted re-read of actual BY13 GA and EA whole4.2/4.3; profile bodies unchanged, locator role precision checked after first science seal', 'recordedAt': now, 'actualPrimaryInputs': [binding(by_primary / f'BY13-{level}-official.actual-text.txt') for level in ['GA', 'EA']], 'operativeP12v3': binding(author / 'source-locator-precision-v3/P12.actual-raster-source-roles-author-v3.review.jsonl'), 'wholeCommon24CaseBodiesChanged': 0, 'wholeProfileBodiesChanged': 0, 'independentConclusion': 'BY13 GA and EA4.2 both bind climate-impact costs, ecosystem services and management. EA4.3 additionally requires biome/climate/biodiversity relationships. GA4.3 binds interdisciplinary global-change perspectives and value-based options. The EA addition is not transferred into common GA requirements. HE Q4.1 and original goal wording remain unchanged.', 'scopeCountryWideClosureClaim': False, 'humanApproval': False})

ids = set(science_by_id)
for gate, source in [('A', 'semantic-atomicity'), ('M', 'memory-card-review')]:
    source_path = root / f'curricula/DE/Gymnasium/quality/{source}/canonical-biology-full.review.jsonl'
    kept = [json.loads(line) for line in source_path.read_text().splitlines() if line.strip() and json.loads(line)['goalId'] in ids]
    assert len(kept) == 12
    dest = own / f'{gate}12.retained-exact-current.rows.jsonl'
    write(dest, ''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in kept))
    cfg = read(own.parent / 'biologie-ecology20-current391-author-v2' / f'{gate}20.current.native.config.json')
    cfg.update(landscapePath=str((author / 'candidate/canonical.current474-twelve-new-raster-author.json').relative_to(root)), reviewPath=str(dest.relative_to(root)), scope={'label': 'Twelve unchanged goals; exact retained A/M decisions and final raster binding check', 'leafGoalIds': batch['goalIds']})
    if gate == 'M':
        cards = own / 'M12.retained-exact-in-scope.cards.jsonl'
        write(cards, '')
        cfg['cardReviewPath'] = str(cards.relative_to(root))
    write(own / f'{gate}12.final-raster-binding.config.json', cfg)
print(json.dumps({'Drecords': 12, 'Pprofiles': 12, 'wholeCasePairs': 24, 'conditionalExtension': 1, 'VexactImages': 12, 'actualNativePages': 12, 'frozenAuthorPayloadsVerified': 105, 'humanApproval': False, 'activeWrites': 0, 'strictGainClaimed': 0}))
