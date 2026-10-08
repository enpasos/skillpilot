"""Persist reviewer A's independently authored scientific verdict, not a classifier."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
D = Path(__file__).resolve().parent
AUTHOR = D.parent / 'biologie-flora-fauna20-current391-author-v1'
CANON = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
PRIMARY = D.parent / 'biologie-ecology20-current391-author-v2/primary-inputs'

def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def binding(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': digest(p), 'bytes': p.stat().st_size}

def write(name, obj):
    p = D / name
    with p.open('x', encoding='utf-8') as f:
        f.write(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

# These substantive observations were individually written after actually reading
# the full descriptions, forty bilingual cases, native expectations and sources.
NOTES = [
    ('Artenvielfalt, Arten-/Individuenzahl und Entdeckung/Aussterben bilden einen zusammenhängenden Vergleich; beide Sprachen bewahren den Anspruch.', 'Drei benannte Arten/zehn Individuen und drei ausdrücklich artgebundene Gruppen/dreizehn Individuen stimmen. Persönliche Erstbeobachtung, taxonomische Neubeschreibung, lokales Verschwinden und globales Aussterben bleiben getrennt.', '5.1, gedruckt 7–8'),
    ('Ein kohärentes Organbau-Funktionsmodell eines Säugetiers; keine isolierten unabhängigen Erwerbsroutinen.', 'Hund und grabender Maulwurf prüfen Knochen/Gelenke/Muskelzug, Lungenflächen, Herzpumpe, Haut/Fell/Wahrnehmung. Die Fehlerzuordnung Knochen als Motor/Herz als Verdauungsorgan wird sachlich korrigiert.', '5.2, gedruckt 9–10'),
    ('Deutung der Passung von Säugetiermerkmal und Lebensraum ist ein prüfbarer Funktionsvergleich.', 'Otterfell/Schwimmhäute und Robbenfett/Stromlinienform bieten substantielle Variation. Isolation und Fortbewegung werden weder als Absicht noch als sofortige individuelle Neubildung ausgegeben. Veraltete Eisbärhaar-Lichtleiterbehauptung wird nicht übernommen.', '5.2, gedruckt 9–10'),
    ('Beobachten, protokollieren und vorsichtig deuten gehören zu derselben Ethogrammleistung; synthetische Reihen ersetzen sie nicht.', 'Hund- und Katzensequenz trennen sichtbare Kategorien von Absicht/Gefühlsdeutung, verlangen Zeit/Start-Endkriterien und ausdrücklich eine echte schonende spätere Beobachtung beziehungsweise reales Video. Keine reale Performanz behauptet.', '5.2, gedruckt 9–10'),
    ('Domestikationsgeschichte und weitere Zucht bilden einen populationsbezogenen Entwicklungszusammenhang.', 'Wolfslinie/Haushund und zwei Hundelinien unterscheiden vererbbare Variation/mehrere Generationen von individueller Erziehung. Die Größer-gleich-evolutionär-höher-Behauptung wird zutreffend verworfen.', '5.2, gedruckt 9–10'),
    ('Keimungsbedingungen und dokumentierter Verlauf sind Teile einer kohärenten angeleiteten Wachstumsbeobachtung.', 'Feucht/trocken und Temperaturvariation unterscheiden Keimung, Reserveversorgung und späteres grünes Wachstum; keine universelle Lichtkeimregel. Synthetische 2/4/7-cm-Daten bleiben Modellwerte, echte spätere Beobachtungsprotokolle ausdrücklich erforderlich.', '5.4, gedruckt 12'),
    ('Wurzel, Spross und Blatt bilden ein zusammenhängendes Versorgungs-/Transportmodell einer Blütenpflanze.', 'Bohne und Speicherwurzel prüfen Aufnahme, Stütze/Leitung, Blattfläche/Stomata, Fotosynthese, Transpiration und Quellen/Senken. Bodenzucker als einzige Nahrung und ausschließlich aufwärts gerichteter Assimilatfluss werden zutreffend korrigiert.', '5.4, gedruckt 12'),
    ('Blütenbestandteile und ihre Fortpflanzungsfunktionen sind ein kohärenter Grundbauplan.', 'Kirschblüte und Windbestäubung trennen Pollenablage und Gametenverschmelzung; Samenanlage/Samen und Fruchtknoten/Frucht stimmen im ausdrücklich schematischen Grundmodell. Drei gültige vorhandene Grundbegriffskarten sind ergänzender Abruf, kein Verständnisbeweis.', '5.4, gedruckt 12'),
    ('Aktuelles Ziel verlangt Merkmale tatsächlich zur Bestimmung zu nutzen; Wildvorkommen und Nutzung sind verschiedene Kriterien und DE/EN sind gleichwertig.', 'Die botanischen Merkmale und Nutzungsgrenzen sind richtig. Beide Materialien geben aber die Identitäten der zu bestimmenden Objekte bereits vor: A=Gänseblümchen/B=Klee/C=Gartenbohne und X=Eiche/Y=Linde/Z=Esche. Damit ist Merkmalsanwendung als eigene Leistung nicht unabhängig prüfbar.', '5.4, gedruckt 12'),
    ('Bau-Funktions-Merkmale als Lebensraumpassung deuten ist eine kohärente biologische Kompetenz, kein Lernen der Lehrplan-Wahlregel.', 'Fliegender Vogel versus Ente/Laufvogel variiert Funktionspassungen sachlich und vermeidet universelle Flug-/Schwimmhautbehauptungen. HE6.2-Vogel-ODER-Fisch ist eine Quellen-/Auswahlbedingung; sie darf nicht als verpflichtender Lernnachweis im biologischen Transferziel erscheinen.', '6.2, gedruckt 14'),
    ('Vergleich von Fortpflanzungsstrategien ist ein zusammenhängender Vergleich; das ODER im aktuellen Ziel lässt die gewählte Vogelvertiefung zu.', 'Beide gemeinsamen Fälle behandeln Revier, Balz/Paarung, Pflege und Nachkommenzahl bei Vögeln; Kolonie bedeutet weder keinerlei räumliche Verteidigung noch fehlende Pflege. Bedingter Fischfall bleibt separat und fordert keine duale Vertiefung.', '6.2, gedruckt 14'),
    ('Leichtbau und Federbau sind zusammenhängende strukturelle Voraussetzungen und Funktionen des Vogelmodells.', 'Verstrebung/verknüpfte Skelettteile verbinden geringe Masse und Tragfähigkeit. Fahne/Äste/Schaft und Lücken sind funktional erklärt; Gefieder hat auch Isolation/Schutz. Weder alle Knochen hohl noch Federn gleich universelle Flugfähigkeit.', '6.2, gedruckt 14'),
    ('Die drei Merkmale bilden ein integriertes Fisch-Bau-Funktionsmodell; Quellenwahl bleibt bedingt, keine Verpflichtung aller HE-Vogelschwerpunkte zur Fischvertiefung.', 'Typischer Knochenfisch und bedingter Gasvolumen/Formvergleich trennen Widerstand, Kiemengasaustausch und Schwimmblasenauftrieb. Modell gleicher Masse/geringerem verdrängtem Volumen ist konsistent; keine Schwimmblase bei sämtlichen Fischarten behauptet.', '6.2, gedruckt 14'),
    ('Reptilienentwicklung mit Vogelentwicklung vergleichen ist eine kohärente Entwicklungsvergleichsleistung.', 'Eidechsen-/Hühnerei und falsche Larven-/Erwachsenenschemata prüfen innere Befruchtung, Dotter/Schutzhüllen, Embryo und weiteres Jungtierwachstum. Amniotischer Grundbauplan und lebendgebärende Reptilienausnahmen sind korrekt; keine Kaulquappenphase für Reptilien.', '6.3, gedruckt 15'),
    ('Bedingte Verhaltensstrategien zur Temperaturregulation sind eine kohärente Kompetenz.', 'Sonnenstein/Schatten im Tagesverlauf und überall kühle Plätze variieren die Grenzen äußerer Wärmeaufnahme. Wechselwarm wird nicht ständig kalt genannt; nicht jedes Reptil wird ins Wasser geschickt und Wille ersetzt keine Wärmebilanz.', '6.3, gedruckt 15'),
    ('Ein bestimmtes Wärmesinnesorgan funktionell erläutern ist ein abgegrenztes Struktur-Funktionsziel.', 'Grubenorgan zwischen Nase/Auge, empfindliche Membran und Infrarotkontrast sind korrekt; Auge und thermische Hinweise ergänzen sich. Licht-/Hintergrundwechsel variiert Beiträge; keine Blut-/Gedankensicht, perfekte 3D-Kamera oder universelles Organ aller Schlangen.', '6.3, gedruckt 15'),
    ('Haut und Lunge sind gemeinsam erklärbare Sauerstoffversorgungswege, nicht unabhängig nebeneinandergestellte Routinen.', 'Feuchte dünne durchblutete Haut, Diffusionsgefälle, Mundbodenpumpe und Ventilation sind konsistent. Ufer/Untertauchen/Austrocknung variieren Wege und Bedarf; keine unbegrenzte Tauchzeit und keine behaupteten echten belastenden Tierversuche.', '6.4, gedruckt 16'),
    ('Hormonelle Steuerung und Deutung geeigneter Resultate gehören zu einer gemeinsamen Metamorphose-Erklärung.', 'Verminderte/wiederhergestellte Schilddrüsenwirkung und zeitlich früheres Signal liefern verschiedene Modellvergleiche; Kontrollen und Individualunterschiede begrenzen Kausalität. Hormone sind Signale, keine Beinbaustoffe; keine Lebendtier-Hormonbehandlung behauptet.', '6.4, gedruckt 16'),
    ('Brutpflegeform und Eizahl bilden einen zusammenhängenden Strategie-/Investitionsvergleich.', 'Freie Wasser-Eier versus Tragen/Schutz und 20×0,5=10 versus 400×0,05=20 sind korrekt. Anteil/absolute Überlebendenzahl, bedingte Erwartung und reale Artmessung werden getrennt; keine universell beste Pflege-/Zahlregel.', '6.4, gedruckt 16'),
    ('Anforderungen kennen und auf einen Haltungsfall anwenden ist trotz kurzem generischem Titel durch artspezifische Physiologie und Verhalten fachlich prüfbar.', 'Kaninchenplan und unzulässige unveränderte Übertragung auf Hamster prüfen Nahrung/Wasser, Raum, Sozial-/Ruhebedürfnisse, Rückzug, Hygiene und Betreuung. Keine universellen Artenregeln, zertifizierten Größen oder tiermedizinischen Einzelfallurteile behauptet.', '6.5, gedruckt 17'),
]

FINDINGS = {
    '350c8fab-5f95-5cf0-b8a9-dbc5f425b6fd': [{
        'findingId': 'flora-fauna20-independent-a-P09-answer-leak',
        'gate': 'P', 'severity': 'blocking_for_candidate_P_acceptance',
        'location': 'Common v2 whole cases flora-fauna20-09-case-1 and -case-2; matching native applicationCaseBriefs',
        'defect': 'Unknown object IDs are assigned their correct plant names in the task material. A learner can repeat the A/B/C or X/Y/Z identity map without actually using the morphological identification features; this fails the current goal aspect einfache Bestimmungsmerkmale nutzen as independent observable performance.',
        'requiredCorrection': 'Keep the bounded examples and current goal. Supply named reference features/key entries separately from unnamed object observations; remove the object-to-answer map from the task, require the identifying trait/decision path, and keep the exact assignments and ambiguity limits in the model answer. Apply the same change in DE/EN and native brief fields, then independently recheck both whole cases.',
    }],
    '7eeb9de9-9a8e-5932-8f60-183367c87d09': [{
        'findingId': 'flora-fauna20-independent-a-P10-source-policy-as-learning-facet',
        'gate': 'P', 'severity': 'blocking_for_candidate_P_acceptance',
        'location': 'flora-fauna20-10-core/transfer observablePerformance and transfer essentialUnderstanding; common case-1 task/model answer and case-2 task/model answer',
        'defect': 'The profile serializes the HE6.2 bird-OR-fish curricular selection rule as a required transfer understanding/learner performance, including ohne beide Themen als verpflichtende Vertiefung auszugeben. The current biology goal assesses structure/function as habitat adaptation, not knowledge or assertion of a curriculum scope rule.',
        'requiredCorrection': 'Retain both biological bird cases, the separate conditional fish alternative and the source selection boundary. Move the HE bird/fish selection statement to source/reviewer metadata or dissent. Required expectations/tasks/model-performance rubrics must assess the biological adaptation/limits only, with equivalent DE/EN; no new canonical text or source obligation is needed.',
    }],
}

frozen = json.loads((AUTHOR / 'author.current-whole-text-P20-source-AM.first.freeze.json').read_text())
for f in frozen['frozenFiles']:
    p = ROOT / f['path']
    assert digest(p) == f['sha256'] and p.stat().st_size == f['bytes'], p
goals = json.loads((AUTHOR / 'current20-whole-DEEN-goals.actual.json').read_text())['goals']
by = {g['id']: g for g in json.loads(CANON.read_text())['goals']}
assert len(NOTES) == len(goals) == 20
assert all(g == by[g['id']] for g in goals)
profiles = {r['goalId']: r for r in map(json.loads, (AUTHOR / 'P20.current-text-preimage.author.review.jsonl').read_text().splitlines())}
materials = json.loads((AUTHOR / 'materials-scope-precision-v2/twenty-whole-goals-forty-common-DEEN-cases.author-v2.json').read_text())['goals']
for g in materials:
    for c, b in zip(g['cases'], profiles[g['goalId']]['profile']['applicationCaseBriefs']):
        for l in ['de', 'en']:
            assert b['taskDemand' + l.capitalize()] == c['material'][l] + ' ' + c['task'][l]
            assert b['expectedPerformance' + l.capitalize()] == c['modelAnswer'][l]
rows = []
for ordinal, (g, note) in enumerate(zip(goals, NOTES), 1):
    findings = FINDINGS.get(g['id'], [])
    rows.append({'ordinal': ordinal, 'goalId': g['id'], 'title': g['title'],
                 'currentWholeGoalExact': True, 'descriptionRecommendation': 'keep',
                 'DScience': 'PASS', 'descriptionAndAtomicityObservationDe': note[0],
                 'PScience': 'revision_required' if findings else 'PASS',
                 'wholeFortyCaseScientificObservationDe': note[1], 'primarySectionActuallyRead': note[2],
                 'profileFingerprint': profiles[g['id']]['profileFingerprint'],
                 'sourceClaim': 'Bounded current goal and cited HE source section only; no approval of whole adjacent duties or all sixteen state mappings',
                 'A': 'Retained exact current existing atomic decision; no historical review restart',
                 'M': 'Retained existing flower memory_required/3cards' if ordinal == 8 else 'Retained current no_memory_needed; understanding/application remains primary',
                 'findings': findings})
write('twenty-whole-goal-science.first.actual.json', {
    'schemaVersion': 1, 'artifactKind': 'independent-a-whole-current-flora-fauna20-scientific-review',
    'recordedAt': datetime.now(timezone.utc).isoformat(),
    'reviewer': 'Codex independent reviewer A; not the material author',
    'peerReviewerFindingsReadBeforeOwnSeal': False,
    'inputAuthorFreeze': binding(AUTHOR / 'author.current-whole-text-P20-source-AM.first.freeze.json'),
    'all45AuthorFreezeBindingsActuallyVerified': True, 'currentCanonical': binding(CANON),
    'fullCommonCasesActuallyRead': {'cases': 40, 'locales': ['de', 'en']},
    'fullConditionalFishCasesActuallyRead': 2,
    'descriptionScience': {'keep': 20, 'revise': 0, 'split_review': 0, 'block': 0},
    'positiveWholeCaseScience': {'pass': 18, 'revision_required': 2},
    'goals': rows, 'nativePageReviewClaimed': False, 'actualRasterReviewClaimed': False,
    'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review',
    'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'humanApproval': False,
    'activeWrites': 0, 'strictClosuresClaimed': 0,
})
source_files = [PRIMARY / 'HE-G9-official.pdf', PRIMARY / 'HE-G9-official.actual-full-reading.txt']
write('actual-primary-whole-section-reading.independent-a.receipt.json', {
    'artifactKind': 'independent-a-actual-bounded-official-source-reading',
    'officialUrl': 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-biologie.pdf',
    'localActualReadBindings': [binding(p) for p in source_files],
    'wholeSectionsActuallyRead': ['5.1 printed7–8', '5.2 printed9–10', '5.4 printed12', '6.2 printed14', '6.3 printed15', '6.4 printed16', '6.5 printed17'],
    'ownBoundedSummary': 'Direct source reading supports the selected diversity, mammal, flowering-plant, bird/fish-choice, reptile, amphibian and husbandry competencies. HE6.2 permits one in-depth class with brief comparison; it is not a required learner biology fact. The historical polar-bear-hair light/heat-conductor claim is not adopted. Genuine observation is required by ethogram/growth performance and is not supplied by synthetic cases.',
    'fullSourceTextRedistributed': False, 'localCacheOnly': True,
    'rehydration': 'Fetch official URL locally and compare actual PDF digest; pdftotext -layout and read whole stated printed sections. No external license or human approval inferred.',
    'humanApproval': False,
})
write('first-twenty-whole-science.freeze.json', {
    'schemaVersion': 1, 'artifactKind': 'independent-a-first-science-verdict-seal',
    'recordedAt': datetime.now(timezone.utc).isoformat(),
    'frozenFiles': [binding(D / n) for n in ['twenty-whole-goal-science.first.actual.json', 'actual-primary-whole-section-reading.independent-a.receipt.json', 'review-twenty-frozen-whole-inputs.independent-a.py']],
    'peerReviewerFindingsReadBeforeOwnSeal': False,
    'nativePageReviewClaimed': False, 'actualRasterReviewClaimed': False,
    'activeWrites': 0, 'strictClosuresClaimed': 0, 'humanApproval': False,
})
print('Independent A: D science20 KEEP; P science18 PASS,2 targeted corrections; first blind verdict sealed.')
