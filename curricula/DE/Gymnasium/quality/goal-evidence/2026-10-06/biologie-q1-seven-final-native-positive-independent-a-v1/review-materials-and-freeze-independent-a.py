"""Seal the independent scientific P-A decisions and actual native checks only."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess

REPO = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
AUTHOR = BASE / 'biologie-q1-seven-final-native-positive-author-v1'
NATIVE = BASE / 'biologie-q1-seven-final-native-review-inputs-author-v1'
PRIOR_D = BASE / 'biologie-q1-seven-final-native-d-independent-a-v1'

def read(path):
    return json.loads(path.read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def bind(path):
    return {'path': str(path.relative_to(REPO)), 'sha256': sha(path), 'bytes': path.stat().st_size}

def write(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def check_binding(item, prefix=REPO):
    path = prefix / item['path']
    assert sha(path) == item['sha256'].removeprefix('sha256:'), str(path)
    assert path.stat().st_size == item['bytes'], str(path)
    return bind(path)

def pointer(data, path):
    for token in path.removeprefix('/').split('/'):
        token = token.replace('~1', '/').replace('~0', '~')
        data = data[int(token)] if isinstance(data, list) else data[token]
    return data

freeze_path = OWN / 'independent-p-a.final.freeze.json'
assert not freeze_path.exists(), 'Frozen review; use a new continuation'
author_freeze_path = AUTHOR / 'native-positive-author-v1.final.freeze.json'
assert sha(author_freeze_path) == 'd6853ab50dbd9d49ee200b43c10fb2a5d8e6ac6b614a8fdeb5d0c973ed554212'
author_freeze = read(author_freeze_path)
bindings = {str(author_freeze_path.relative_to(REPO)): bind(author_freeze_path)}
for item in author_freeze['files']:
    actual = check_binding(item, AUTHOR)
    bindings[actual['path']] = actual
for item in author_freeze['inputBindings']:
    # Raw integrity hashing of referenced prior artifacts does not inspect their
    # verdict bodies. No other current independent P result is opened.
    actual = check_binding(item)
    bindings[actual['path']] = actual

prior_d_freeze_path = PRIOR_D / 'independent-d-a.final.freeze.json'
assert sha(prior_d_freeze_path) == '5a145212d6a28432d16f3e5a90e1d1ed954ec81d4a25b51d787c771ff31a805e'
prior_d_freeze = read(prior_d_freeze_path)
for item in prior_d_freeze['files']:
    check_binding(item, PRIOR_D)
for item in prior_d_freeze['inputBindings']:
    actual = check_binding(item)
    bindings[actual['path']] = actual
bindings[str(prior_d_freeze_path.relative_to(REPO))] = bind(prior_d_freeze_path)
for path in [PRIOR_D / 'actual-final-thirteen-source-sixteen-material-bindings-and-reuse.json',
             PRIOR_D / 'seven-final-page-context.actual-independent-a-review.json',
             REPO / 'AGENTS.md', REPO / 'docs/concept/skill-graph/atomic-goal-visualizations.md',
             REPO / 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json',
             REPO / 'app/scripts/positiveGoalEvidenceReview.ts',
             REPO / 'app/scripts/materializePositiveGoalEvidenceCandidates.ts']:
    bindings[str(path.relative_to(REPO))] = bind(path)

command = [str(REPO / 'app/node_modules/.bin/tsx'), str(OWN / 'check-seven-native-profiles-independent-a.mts')]
proc = subprocess.run(command, cwd=REPO, capture_output=True, text=True)
(OWN / 'native-checks.actual.stdout.txt').write_text(proc.stdout)
(OWN / 'native-checks.actual.stderr.txt').write_text(proc.stderr)
assert proc.returncode == 0, proc.stderr
write('native-checks.actual.command-and-exit.json', {'schemaVersion': 1,
    'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'command': command,
    'exitCode': proc.returncode, 'stdout': bind(OWN / 'native-checks.actual.stdout.txt'),
    'stderr': bind(OWN / 'native-checks.actual.stderr.txt'), 'unchangedProductionValidation': True})

inputs_path = NATIVE / 'inputs/positive-review-inputs.native-fingerprints.pending.json'
inputs = read(inputs_path)
material_path = REPO / inputs['sourceMaterial']['path']
material = read(material_path)
records = [json.loads(line) for line in (AUTHOR / 'positive-evidence.seven.author-candidates.review.jsonl').read_text().splitlines()]
assert len(records) == len(inputs['rows']) == 7

# These judgements were independently made from the seven full records, current
# goal bodies and sixteen complete materials; they are not author verdict copies.
notes = [
    {
        'scope': 'Genauer gemeinsamer Strukturkern: DNA-Material, Genabschnitt und organisierte Chromosomenstruktur. Die vorgegebene Homologie-/Variantenkarte dient allein der Stabilität derselben Strukturbeziehung; Alleldefinition, Erbgang und Genproduktwirkung sind ausdrücklich keine zusätzlichen Pflichtkompetenzen.',
        'archetype': 'concept ist passend: Teile und Ganzes werden verknüpft, kein zusätzliches Verfahren geprüft.',
        'expectations': [
            'Die Material-/Abschnitts-/Trägerrelation ist fachlich richtig; selbst erzeugte Zuordnung und begründete Verknüpfung statt bloßes Wiederholen des Bildes.',
            'Mehrere Gene je Chromosom sind zulässig. Vier Chromosomen belegen keine vier Gene; fehlende vollständige Abschnittsliste begrenzt die Aussage exakt.',
            'G bleibt derselbe bezeichnete Abschnitt auf beiden vorgegebenen Homologen. Austausch g1→g3 betrifft eine Anleitung im Abschnitt und fügt kein Chromosom hinzu; keine Allellehre als Pflicht.'
        ],
        'cases': [
            'Vier-Chromosomen-Karte, DNA-Faden und G entsprechen vollständig der Vorlage. Richtige Teil-Ganzes-Zuordnung und Grenze der Genanzahl; keine fehlenden Zahlen erfunden.',
            'A1/A2, G, g1/g2 und Austausch g1→g3 exakt. Die Profile wählen aus der vollständig erhaltenen Karte den zielgebundenen Strukturtransfer; Allel-/Merkmalsanforderungen werden nicht zum Ziel hinzugefügt.'
        ],
        'transfer': 'Übersicht versus DNA-Ausschnitt und einzelne Struktur versus vorgegebene homologe Varianten liefern einen echten Wechsel der Darstellung und eines Strukturmerkmals.'
    },
    {
        'scope': 'Drei Mutationsniveaus mit belegten Ursachen und unmittelbaren Informationsfolgen. Keine zusätzliche Leseraster-, Erbgangs-, Krankheits- oder ungemessene Proteinprognose.',
        'archetype': 'representation ist passend: Modelldifferenzen werden nach Sequenz, Abschnittsstruktur und ganzer Chromosomenzahl begründet.',
        'expectations': [
            'Die drei Maßstäbe sind korrekt abgegrenzt. Der geforderte Vergleich und die Begründung machen die Kategorie aus der konkreten Modelldifferenz sichtbar.',
            'Gegebener Kopierfehler, Verdopplung beziehungsweise Umkehrung nach Brüchen sowie Fehlverteilung werden mit genau ihren Informationsfolgen verknüpft.',
            '50±2→20±2 betrifft dieselbe gereinigte Proteinmenge im kontrollierten Test. Das Profil beschränkt diesen Befund auf levels-a und ersetzt ihn in levels-b nicht durch eine Merkmals- oder Krankheitsbehauptung.'
        ],
        'cases': [
            'ACGT→ATGT, zusätzliche zwölf Genkopien bei unverändert vier Chromosomen und Zugewinn eines ganzen B bei fünf exakt. Proteinaktivität bleibt kontrollierter Einzelfallbefund.',
            'Eine verlorene Base, C1-Umkehrung nach Brüchen mit acht Genen bei sechs Chromosomen und C2-Verlust bei fünf exakt; keine Funktionsmessung ergänzt.'
        ],
        'transfer': 'Von Sequenzsubstitution/Abschnittsverdopplung/Chromosomenzugewinn zu Basenverlust/Orientierungsänderung/Chromosomenverlust; zusätzlich echter Wechsel der vorhandenen Funktionsevidenz.'
    },
    {
        'scope': 'Einzelne Basenpaarposition versus Zahl ganzer Chromosomen. Substitutionskonvention ausdrücklich auf das vorgegebene Modell begrenzt; keine universelle Definition sämtlicher Punktmutationen.',
        'archetype': 'representation ist passend: zwei getrennte Messmaßstäbe werden verlässlich verglichen.',
        'expectations': [
            'ACTA→ATTA verändert Position 2 C→T; GCAA→GCTA verändert Position 3 A→T. Beide Zuordnungen stimmen mit der dargestellten Substitutionskonvention überein.',
            'B3 bedeutet 4→5 und fehlendes C2 6→5; die Änderung ganzer Chromosomen wird von einer lokalen Sequenzänderung getrennt.',
            'Zählung allein misst die lokale Sequenz nicht. Vorgeschlagener Vergleich eines definierten Genabschnitts prüft eine zusätzliche dortige Punktmutation; keine umfassende Genomdiagnostik verlangt.'
        ],
        'cases': [
            'Referenz und Veränderung beider Datenarten exakt. Unveränderte Anzahl schließt eine lokale Sequenzänderung nicht aus.',
            'P und Q samt fehlender Q-Sequenzmessung exakt. Die zusätzliche Untersuchung ist sachlich passend und ausdrücklich auf den gewählten Genabschnitt begrenzt.'
        ],
        'transfer': 'Zugewinn zu Verlust und bekannte Sequenz zu nicht gemessener Sequenz; mehr als neue Buchstaben oder Zahlen.'
    },
    {
        'scope': 'Belegter mutagener Ursachenweg, Datenvergleich, explizites Kriterienurteil und passende Expositionsverringerung. Keine selbst durchgeführte Untersuchung, individuelle Gesundheitsprognose oder universelle Nullrisikoaussage.',
        'archetype': 'data ist passend: Gruppenhäufigkeit und relative Exposition werden begrenzt interpretiert; begründetes Modell- und Bewertungsurteil ist konkret mitgeführt.',
        'expectations': [
            'DNA-Schaden und mögliche Fixierung bei weiterer Kopie sind korrekt verknüpft. R/M und UV/PAK folgen ihren gegebenen mechanistischen Materialien; Exposition garantiert keine Mutation.',
            '3/27/6 beziehungsweise 2/18/17 je1000 exakt. Kontrollhäufigkeit erlaubt Hintergrund; Expositionseinheiten bleiben eine andere Datenart als bestätigte Änderungen.',
            'Alle Optionen und explizite Prioritäten werden verglichen. UV-C bei umstellbarem Zeitplan und PAK-B trotz Zusatzweg sind unter genau den vorgegebenen Bedingungen begründete Urteile.',
            'Wirksamer Schutz muss zum Einfluss passen. Papier, Sichtschutz, Wärme oder Beschwerdefreiheit ersetzen keine passende Expositions-/Wirksamkeitsevidenz. Wettertransfer verlangt passende neue Daten.'
        ],
        'cases': [
            'R-Vergleich 0,3/2,7/0,6 Prozent, neunfache Kontrollhäufigkeit und Reständerungen exakt aus vollständigem Material. Zahlen bleiben Gruppendaten.',
            'M-Vergleich 0,2/1,8/1,7 Prozent exakt. Die kontaktvermeidende Ersatzanlage ist materialgestützt; ungeprüftes Papier hält M laut Karte nicht zurück.',
            'UV-A/B/C100/25/10, gleiche Teilnahme, umstellbarer Zeitplan und Organisation exakt. C folgt vorgegebener Priorität; festem Zeitplan entspricht bedingt B. Wärme und persönliche Risikoraten bleiben unbelegt.',
            'PAK-A/B/C12±1/2±0,5/11±1 je Tag, fünf Tage, sicherer gleicher Bus und sechs Minuten Zusatzweg exakt. Zentralwertsummen60/10/55 richtig; keine unbegründete Fehleraggregation. C hat keinen klaren Wirksamkeitsbeleg, neue Wetterlagen bleiben neu zu prüfen.'
        ],
        'transfer': 'Physikalische zu chemischer Einfluss, echte Sequenzänderungshäufigkeit zu Exposition und bedingter organisatorischer beziehungsweise zeitlicher Zielkonflikt. Vier Fälle decken alle vier erforderlichen Erwartungen.'
    },
    {
        'scope': 'Explizites Tiermodell mit getrennten Zelllinien und tatsächlicher Keimzellbeteiligung; keine allgemeine Pflanzenregel, Krankheitsprognose oder erfundene Vererbungswahrscheinlichkeit.',
        'archetype': 'modeling ist passend: Zellabstammung, Zeitpunkt und Befruchtungsbeteiligung werden zusammen nachvollzogen.',
        'expectations': [
            'Weitergabe an Tochterzellen innerhalb getrennter K/G ohne Zellwechsel korrekt. Somatische Änderung bleibt eine Mutation, auch ohne Nachkommenübertragung.',
            'Frühe E-Zygotenänderung erreicht beide vorgegebenen Linien; späte S bleibt auf ihre somatischen Nachkommen begrenzt. Zeitbedingung ist ausdrücklich erhalten.',
            'Zelllinienweitergabe und Weitergabe an ein Individuum sind getrennt. G überträgt nur über eine tatsächlich beteiligte betroffene Keimzelle; die ausdrücklich unbenutzte fertige Keimzelle wird nicht übertragen.'
        ],
        'cases': [
            'Getrennte K-/G-Linien, kein Zellwechsel und Tochterweitergabe exakt. Mögliche geschlechtliche Weitergabe bleibt an tatsächliche betroffene Keimzellbeteiligung gebunden.',
            'E/S/G und Nichtbenutzung der konkreten fertigen Keimzelle exakt. G führt in dieser Befruchtung nicht zu Übertragung; keine Mutation-gleich-Krankheit-Aussage.'
        ],
        'transfer': 'Getrennte Linien zu früher Zygote und späten Zellen; mögliche Weitergabe zu ausdrücklich ausgeschlossener tatsächlicher Befruchtungsbeteiligung.'
    },
    {
        'scope': 'Kontrollvergleich für genetische Änderung versus Umweltwirkung sowie Grenzen eines Merkmalsbefunds. Stipulierte ganze Informationskonstanz und gemessener Einzelabschnitt bleiben klar auseinander.',
        'archetype': 'data ist passend: Umweltkontrollen, Sequenzbefunde und Erscheinung werden getrennt bewertet.',
        'expectations': [
            'L/H12/20 und Gleichlicht16/16 stimmen. Die vollständige Konstanz der Modellinformation ist ausdrücklich vorgegeben; die einzelne Abschnittsmessung ist allein kein vollständiger Genomgleichheitsbeleg.',
            'M bleibt bei bestätigter bleibender DNA-Änderung eine Mutation trotz Blattwert16. Gleiches oder unterschiedliches Aussehen allein bestimmt die genetische Ursache nicht.',
            'A/B8/10, Temperatur14/16 und Rückkehr8/10 exakt. Variante und zusätzlicher Umweltbeitrag koexistieren; eine Sequenzvariante wird nicht unbegründet als alleinige Ursache jedes Ausgangsunterschieds ausgegeben.'
        ],
        'cases': [
            'Klone, ausdrücklich vorgegebene Informationskonstanz, Lichtbedingungen, neue Stecklinge und M exakt. Modelldefinition und Reichweite der tatsächlich gemessenen Sequenz getrennt.',
            'Fortbestehender DNA-Unterschied und zusätzlicher Sechs-Einheiten-Temperaturbeitrag exakt. Fallbezogene Rückkehr wird nicht zur universellen Reversibilitätsregel aller Modifikationen.'
        ],
        'transfer': 'Lichtabhängigkeit genetisch gleicher Klone und unveränderte Erscheinung trotz Mutation zu zusätzlicher Temperaturwirkung bei vorhandenen genetischen Varianten.'
    },
    {
        'scope': 'Einfaches markiertes Kopiermodell mit intakter Vorlage, Kontrolle, Korrektur und begrenzter Fixierungsverhinderung. Keine Enzymliste, allgemeine Replikationsprüfung oder universelle Reparaturrate.',
        'archetype': 'modeling ist passend: gegebene Paarregel, markierte Vorlage und Kopierverlauf werden begründet verknüpft.',
        'expectations': [
            'Alte Vorlagen3′–TACG–5′ und3′–GTAC–5′ liefern richtige Kopien5′–ATGC–3′ beziehungsweise5′–CATG–3′. Beide Fehlpaarungen sind Position3. Vorlageintaktheit und neuer Strang sind vorgegeben, nicht erfunden.',
            'Kontrolle erkennt; Reparatur entfernt/ersetzt den falschen neuen Baustein anhand der Vorlage. R/N und mögliche veränderte Tochterduplexe folgen dem angegebenen weiteren Kopiermodell.',
            '30−24=6 zunächst unkorrigierte Paarungen. Weder30 noch automatisch6 sind nachgewiesene bleibende Mutationen. Weitere Kopie und verbleibende Fehler begrenzen Schutz; keine reale universelle Erfolgsrate.'
        ],
        'cases': [
            'Position3 C–A→C–G und neue KopieATGC exakt. 10000Positionen/30Gefundene/24Korrigierte/6Unkorrigierte richtig; kein Gleichsetzen Fehlpaarung und fixierte Mutation.',
            'Position3 A–G→A–T und neue KopieCATG exakt. R korrigiert anhand der markierten intakten Vorlage; N erkennt nur. Mögliche Fixierung ist materialgestützt, kein universeller Wirkungsgrad.'
        ],
        'transfer': 'Andere intakte Vorlage mit eigener Lösung und insbesondere Kontrolle mit Reparatur zu bloßer Erkennung ohne Korrektur. Der geänderte weitere Kopierverlauf ist die sachhaltige Variation.'
    }
]
review_rows = []
material_rows = []
for index, (record, input_row, note) in enumerate(zip(records, inputs['rows'], notes), 1):
    assert record['goalId'] == input_row['goalId']
    profile = record['profile']
    assert len(note['expectations']) == len(profile['expectations'])
    assert len(note['cases']) == len(profile['applicationCaseBriefs'])
    expectations = [{**entry, 'decision': 'KEEP', 'independentScientificFindingDe': finding,
        'DE_ENSemanticEquivalence': 'KEEP', 'observableIndependentPerformance': 'KEEP'}
        for entry, finding in zip(profile['expectations'], note['expectations'])]
    cases = []
    for body_row, brief, finding in zip(input_row['currentSourceCaseBodies'], profile['applicationCaseBriefs'], note['cases']):
        original = pointer(material, body_row['JSONPointer'])
        assert original == body_row['caseBody']
        digest = hashlib.sha256(json.dumps(original, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
        assert digest == body_row['caseBodyCanonicalJSONSHA256']
        assert brief['id'] == (original.get('caseId') or original['caseKey'])
        cases.append({**brief, 'decision': 'KEEP', 'independentScientificFindingDe': finding,
            'DE_ENSemanticEquivalence': 'KEEP', 'exactMaterialPointer': body_row['JSONPointer'],
            'completeMaterialCanonicalJSONSHA256': digest})
        material_rows.append({'goalId': record['goalId'], 'caseId': brief['id'], 'JSONPointer': body_row['JSONPointer'],
            'caseBody': original, 'caseBodyCanonicalJSONSHA256': digest,
            'independentScientificFindingDe': finding, 'decision': 'KEEP'})
    coverage = profile['coverageExpectations']
    assert coverage['requiredExpectationIds'] == [entry['id'] for entry in profile['expectations']]
    assert coverage['minimumIndependentDemonstrations'] == 2
    assert coverage['freshVariationRequired'] and coverage['independentTransferRequired']
    assert coverage['alternativeExpectationGroups'] == []
    review_rows.append({'ordinal': index, 'goalId': record['goalId'], 'currentGoal': input_row['wholeCurrentCandidateGoal'],
        'goalFingerprint': record['goalFingerprint'], 'reviewInputFingerprint': record['reviewInputFingerprint'],
        'profileFingerprint': record['profileFingerprint'], 'decision': 'KEEP', 'scopeFindingDe': note['scope'],
        'archetype': profile['archetype'], 'archetypeFindingDe': note['archetype'], 'expectations': expectations,
        'coverageExpectations': coverage, 'coverageFindingDe': 'Alle erforderlichen Erwartungs-IDs sind erklärt und zusammen in den vollständigen Fällen abgedeckt. Mindestens zwei unabhängige Demonstrationen, frische Variation und eigener Transfer bleiben Pflicht; wiederholte Coachhilfe an einem Fall wäre kein zweiter Nachweis.',
        'variationAxes': [{**axis, 'decision': 'KEEP', 'DE_ENSemanticEquivalence': 'KEEP'} for axis in profile['variationAxes']],
        'independentTransferFindingDe': note['transfer'], 'applicationCaseBriefs': cases,
        'truthfulProfileStatus': record['status'], 'truthfulReviewAuthority': record['reviewAuthority'],
        'evidenceLevel': record['evidenceLevel'], 'maximumClaimScope': record['maximumClaimScope'],
        'reviewRunIds': record['reviewRunIds'], 'dissent': [], 'unresolvedScientificFindings': [],
        'imageSupportsUnderstandingNotLearnerEvidence': True, 'humanApproval': False, 'learnerEvidence': False})
assert len(material_rows) == 16

write('sixteen-complete-material-comparisons.independent-a.actual.json', {'schemaVersion': 1,
    'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'role': 'sixteen actual complete source materials versus newly authored profile briefs; independent A',
    'materialSource': bind(material_path), 'nativeInput': bind(inputs_path), 'rows': material_rows,
    'allOriginalJSONPointersBodiesAndDigestsExact': True, 'materialCases': len(material_rows),
    'materialRewrittenOrInvented': False, 'learnerEvidence': False})

write('seven-positive-profiles.independent-a.scientific-review.json', {'schemaVersion': 1,
    'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'role': 'independent scientific P-A review of seven exact frozen native candidate profiles',
    'reviewer': '/root/biology_q1_v7_sources_independent_a_followup', 'authorFreeze': bind(author_freeze_path),
    'reviewedProfileJSONL': bind(AUTHOR / 'positive-evidence.seven.author-candidates.review.jsonl'),
    'reviewedNativeConfig': bind(AUTHOR / 'positive-evidence.seven.author-candidates.config.json'),
    'finalNativeSourceInputFreeze': bind(NATIVE / 'final-native-review-inputs.author-v1.freeze.json'),
    'priorOwnFinalNativeDReview': bind(prior_d_freeze_path), 'rows': review_rows,
    'KEEP': 7, 'REVISE': 0, 'BLOCK': 0, 'scientificFindingsResolved': True,
    'nativeSchemaAndSemanticsWithActualIsolatedPNGDigests': 'PASS7',
    'fullNativePChecker': 'HOLD_ACTIVE_IMAGE_BINDINGS', 'activeIntegrationGrantedByThisReview': False,
    'otherIndependentPResultsRead': False, 'independentOfProfileAuthorship': True,
    'priorValidOwnGoalSourceAndImageFindingsReused': 'Final D-A inspected actual PDF pages3–9, actual immutable HTML/PNGs, thirteen current source components and sixteen materials. Their exact bytes are preserved; this fresh P-A independently evaluates every new profile expectation, performance pair, case brief, DE/EN equivalence and transfer.',
    'noGlobalSourceClearance': 'Direct reviewed partial source components only. Whole originals and broader3417/ST/SH/BY obligations remain separate; raw ST course unspecified versus derived common technical GK/LK remains qualified.',
    'remainingGates': ['separate independent P-B decision and resolution', 'active seven PNG/canonical/P bindings and full native P pass', 'native D-B/adjudication, A/M and complete GUI supersets', 'central strict/current CQR303 and dependent Layer-A checks', 'separate human approval/release/trial'],
    'activeWrites': False, 'strictNetGain': 0, 'newScientificCompletions': 0, 'restoredActiveBindings': 0,
    'humanApproval': False, 'humanTrial': False, 'learnerEvidence': False})

(OWN / 'README.md').write_text('''# Biologie Q1: sieben native P-Profile, unabhängig A

**Sieben KEEP, keine offenen fachlichen A-Befunde.** Dieser unabhängige Review
prüft die sieben tatsächlich formulierten, eingefrorenen V2-Profile; er ändert
keinen Autorenrecord. Alle Profile bleiben `ai_candidate` / `needs_human_review`
mit E1/G1 und leeren Run-IDs. Das ist maschinelle Curriculum-QS; es wird weder
Lernendenleistung noch menschliche Freigabe oder Erprobung behauptet.

- [Individuelle fachliche Entscheidungen](seven-positive-profiles.independent-a.scientific-review.json)
  dokumentieren alle Erwartungs-/Leistungspaare, Fälle, Archetypen, gemeinsame
  Zielgrenzen, DE/EN-Gleichheit, Coverage und sachhaltigen Transfer.
- [Alle 16 vollständigen Materialien](sixteen-complete-material-comparisons.independent-a.actual.json)
  wurden gegen ihre originalen JSON-Pointer, unveränderten Körper und die neuen
  Fallbriefs geprüft. Keine Daten, Messungen oder Lösungen wurden hinzugefügt.
- [Eigenständig reproduzierte native Prüfungen](native-schema-semantics-and-image-binding-checks.independent-a.actual.json)
  bestehen das geschlossene Schema, Configschema und die unveränderte native
  Semantik-/Ziel-/Kriterien-/Profil-/Bildfingerprintprüfung für alle sieben.
- Der unveränderte vollständige P-Checker und Materializer wurden tatsächlich
  erneut mit den Autorenkonfigurationen aufgerufen. Der Checker bleibt
  **HOLD_ACTIVE_IMAGE_BINDINGS**: sieben fehlende aktive PNGs und sieben daraus
  abgeleitete Revieweingangsfingerprints, keine anderen Fehler. Alle sieben
  tatsächlichen isolierten PNGs und die damit berechneten Profile sind exakt.
  `reviewedResourceTypes: goal-visualization` wurde nicht abgesenkt; es gibt
  keinen Sonderpfad und keine Produktionsänderung.

Die eigene zuvor abgeschlossene D-A-Prüfung der tatsächlichen PDF-Seiten3–9,
HTML und Bilder sowie der aktuellen 13 Quellenkomponenten wird nur auf ihren
unveränderten Bindungen weiterverwendet. Die sieben P-Profile wurden unabhängig
neu gelesen und beurteilt. Andere aktuelle unabhängige P-Ergebnisse wurden
nicht gelesen. Das Hashprüfen früherer referenzierter Reviewdateien behauptet
keine erneute fachliche Prüfung ihrer Körper.

Offen bleiben die getrennte P-B-Entscheidung und Auflösung, aktive Bindungen,
die übrigen nativen Gates und vollständige GUI-Supersets sowie der zentrale
strikte Integrationsbericht. Ganze Quellenpflichten und frühere ST/SH/BY-
Grenzen werden nicht geschlossen. Aktuelle AGENTS-Pixel-/Bildregeln sind
gebunden; der frühere ausschließlich Gemini-bezogene Policy-Diff bleibt
transparent im eigenen v8-Follow-up erhalten und wird nicht umgeschrieben.

Die 19 aktiven geschützten Eingänge bleiben exakt. Letzter gebundener aktiver
Stand **Biologie67/383**, **Chemie112/378**; der Kandidatennenner390 ist inaktiv.
**0 neue fachliche Abschlüsse, 0 wiederhergestellte aktive Bindungen,
0 strikter Nettozuwachs.** Mathematik-M7 und Physik-M7 bleiben geschützt.
Keine aktiven Canon-/Registry-/Ledger-/Bildänderungen, kein Git, kein Build,
keine Veröffentlichung und keine menschliche Freigabe durch diesen Review.
''')

for item in bindings.values():
    check_binding(item)
own_files = [{'path': str(path.relative_to(OWN)), 'sha256': sha(path), 'bytes': path.stat().st_size}
             for path in sorted(OWN.rglob('*')) if path.is_file()]
write(freeze_path.name, {'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
    'role': 'frozen independent scientific P-A seven current native profiles; candidates and active binding holds retained',
    'files': own_files, 'ownFileCount': len(own_files), 'ownBytes': sum(item['bytes'] for item in own_files),
    'inputBindings': sorted(bindings.values(), key=lambda item: item['path']),
    'reviewedProfiles': 7, 'exactCompleteMaterials': 16, 'exactActualPNGs': 7,
    'KEEP': 7, 'REVISE': 0, 'BLOCK': 0, 'unresolvedScientificFindings': 0,
    'nativeSchemaAndSemanticsWithActualIsolatedPNGs': 'PASS7', 'fullNativePChecker': 'HOLD_ACTIVE_IMAGE_BINDINGS',
    'fullCheckerMissingImages': 7, 'fullCheckerDerivedMissingResourceFingerprints': 7,
    'unexpectedFullCheckerErrors': 0, 'otherIndependentPReviewRead': False,
    'current19ProtectedInputsUnchanged': True, 'allCandidateStatuses': 'needs_human_review',
    'allCandidateAuthorities': 'ai_candidate', 'allEvidenceLevels': 'E1', 'allMaximumClaimScopes': 'G1',
    'wholeOriginalSourceClearance': False, 'newNativeD_B_A_MOrGUIApproval': False,
    'activeWrites': False, 'strictNetGain': 0, 'newScientificCompletions': 0, 'restoredActiveBindings': 0,
    'humanApproval': False, 'humanTrial': False, 'learnerEvidence': False, 'publicationOrDeployment': False,
    'integrableNow': False})
print(json.dumps({'freeze': str(freeze_path.relative_to(REPO)), 'sha256': sha(freeze_path),
    'ownFiles': len(own_files), 'exactInputs': len(bindings), 'P_A': 'KEEP7',
    'nativeSchemaSemantics': 'PASS7', 'fullP': 'HOLD_ACTIVE_IMAGE_BINDINGS', 'strictNetGain': 0}))
