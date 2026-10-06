"""Apache-2.0 helper: serialize the reviewer's individual scientific decisions."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
Q1 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-acids-soaps-preservatives-twenty-current-candidate-v1'
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-fourteen-positive-current-author-v2'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def object_digest(value):
    return 'sha256:' + hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def write(name, data):
    (OWN / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

candidate = json.loads((AUTHOR / 'positive-evidence.candidates.json').read_text())
assert sha(AUTHOR / 'positive-evidence.candidates.json') == '4db204ea9d9d15482b1bcf9f14f11bb974a8469f4debb3e5ed546134a58fd52d'
canon = json.loads((Q1 / 'prospective-input-tree/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').read_text())
goals = {g['id']: g for g in canon['goals']}
book = json.loads((Q1 / 'native-finalbook/bundle/book-model.json').read_text())
pages = {p['goalId']: p for p in book['pages']}
native = {r['goalId']: r for r in map(json.loads, (OWN / 'positive-evidence.native-frozen-future.review.jsonl').read_text().splitlines())}

# Each row below was decided after reading both languages, both complete cases,
# current operative goal text, exact primary operator and relevant course scope.
judgments = [
    {
        'understanding': 'Carboxygruppe enthält C=O und OH am selben C; Strukturidentifikation und saurer Charakter werden getrennt gezeigt. Homologe Alkansäuren unterscheiden sich um CH2, vollständige Strukturformeln bleiben prüfbar.',
        'cases': [
            'HCOOH, CH3COOH und CH3CH2COOH enthalten die Carboxygruppe, Ethanol nicht. Indikatordaten zeigen sauren Charakter unter den gegebenen Vergleichsbedingungen; ein Indikator ist kein spezifischer exklusiver Carboxyl-Nachweis.',
            'Butansäure und Ethylethanoat besitzen beide C4H8O2, aber verschiedene funktionelle Gruppen. Die Säure liefert das Carboxyl-OH; der Ester besitzt kein solches OH. Die Isomerie macht die frische Strukturübertragung fachlich echt.'
        ],
        'operator': 'HE Q1.3 GK/LK: Carboxygruppe einschließlich Nachweis über sauren Charakter, homologe Reihe, Struktur- und Skelettformeln. Der Nachweisoperator wurde erhalten, keine exklusive Analytik behauptet.',
        'limit': 'Beobachtungen sind vorgegebene didaktische Daten; kein beobachteter Lernendennachweis und keine neue universelle Identitätsprobe.'
    },
    {
        'understanding': 'Die schwächere Säure Ethanol wird über die Stabilität ihrer konjugierten Base mit der Carbonsäure verglichen. Zwei Acetat-Grenzstrukturen beschreiben eine delokalisierte Spezies, kein Pendeln und keine doppelte negative Gesamtladung.',
        'cases': [
            'pKa etwa 16 für Ethanol gegenüber 4,8 für Ethansäure ist fachlich stimmig. Acetat verteilt eine negative Ladung über zwei O-Atome; Ethoxid besitzt keine entsprechende Carboxylat-Mesomerie.',
            'Die bereitgestellten Werte 4,8/2,9/4,0 ergeben Chloressigsäure > 3-Chlorpropansäure > Ethansäure bezüglich Säurestärke. Der -I-Effekt nimmt mit Bindungsabstand ab; gesättigtes CH2 bildet hier keine neue Mesomeriebrücke.'
        ],
        'operator': 'HE Q1.3 GK/LK: Vergleich Alkohol-/Carbonsäureacidität und polare Bindungen, induktive Effekte, Mesomerie. Reines Aufsagen einer Rangfolge genügt dem Profil nicht.',
        'limit': 'pKa-Werte sind ausdrücklich gegebene Vergleichswerte; kein Anspruch auf milieuunabhängige Konstanten.'
    },
    {
        'understanding': 'Experimentelle Produktbeobachtung wird mit der Kondensationsbilanz und Struktur-Eigenschafts-Begründung verbunden. Ester können H-Brücken annehmen, ohne bei fehlendem OH selbst entsprechende Donoren zu sein.',
        'cases': [
            'Ethansäure + Ethanol ergeben Ethylethanoat + Wasser, mit C/H/O ausgeglichener Bilanz. Begrenzte Wassermischbarkeit, zwischenmolekulare Kräfte und geeignete Einsatzfälle werden aus gegebenen Daten abgeleitet; Geruch allein ist kein Identitätsnachweis.',
            'Butansäure + Methanol ergeben Methylbutanoat + Wasser. Das Methoxy-O bleibt auf der Alkoholseite des Esters. Die andere Alkylkettenlänge verlangt eine frische Eigenschaftsbegründung anhand bereitgestellter Daten.'
        ],
        'operator': 'HE Q1.3 GK/LK: aus Beobachtungen ableiten, Kondensation formulieren, Eigenschaften begründen und Einsatzbereiche nennen. Keine verpflichtende Synthesedurchführung in diese Ableitungsbeschreibung hineingelesen.',
        'limit': 'Alltags- und Techniknutzung bleibt stoff- und datenbezogen, kein allgemeines Versprechen für alle Ester.'
    },
    {
        'understanding': 'Saure Veresterung/Hydrolyse wird als Gleichgewicht gegenüber alkalischer Carboxylatsalzbildung abgegrenzt. Praktische Irreversibilität bezieht sich ausdrücklich auf alkalische Bedingungen.',
        'cases': [
            'Ethylethanoat + OH- ergibt Acetat + Ethanol, mit einer negativen Ladung vor und nach der Reaktion. Saure Hydrolyse liefert Carbonsäure + Alkohol reversibel; eine bloße Katalysatorzugabe hebt die Gleichgewichtslage nicht auf.',
            'Propylbutanoat ergibt Butanoat und Propan-1-ol. Vier C bleiben in der Säurekomponente, drei C in der Alkoholkomponente; ein Austausch dieser Teile wäre falsch. Der Reinigungsfall verlangt eine strukturell neue Produktbilanz.'
        ],
        'operator': 'HE Q1.3 GK/LK: Esterreaktionen und Reversibilität, mit genauer alkalischer Bedingung. Der höhere Mechanismusoperator gehört zum separaten LK-Ziel.',
        'limit': 'Praktisch irreversibel ist keine allgemeine Aussage, Carboxylatsalze könnten unter beliebig veränderten Bedingungen nie weiter reagieren.'
    },
    {
        'understanding': 'Der spezifizierte Acylsubstitutionsweg umfasst nukleophilen Angriff, tetraedrische Zwischenstufe, Kollaps und Protonenübertragung; Pfeile stammen aus Elektronenpaaren und erhalten Valenz/Ladung.',
        'cases': [
            'OH--Angriff am Carbonyl-C führt zu CH3C(OH)(O-)(OEt), anschließend Carbonylrückbildung und Ethoxidabgang. Protonenübertragung liefert Acetat und Ethanol; netto wird ein OH- pro Ester verbraucht.',
            'Beim Methylpropanoat-Vorschlag sind Angriffsort, positive Zwischenstufenladung und angebliche katalytische OH--Rückgewinnung für den ausdrücklich spezifizierten Acylweg zu korrigieren. Die richtige Übertragung verwendet Propanoat und Methanol.'
        ],
        'operator': 'HE Q1.3 erhöhtes Niveau/LK: vertiefende Mechanismen der alkalischen Esterhydrolyse mit Zwischenstufen und Reaktionsschritten. Kein LK-Mechanismus als allgemeine GK-Pflicht.',
        'limit': 'Der Fehlerfall schließt alternative Reaktionswege unter anderen Bedingungen nicht pauschal aus; er nennt den hier zu prüfenden Acylweg ausdrücklich.'
    },
    {
        'understanding': 'Reaktionsplan und Gleichgewichtsbeurteilung gehören zusammen: Alkoxytausch, reversible Produktbilanz, Stoffüberschuss oder Entzug werden getrennt von Katalysatorwirkung begründet.',
        'cases': [
            'Für das ideale vorgegebene K=1 gilt bei 1+1 mol Start x²/(1-x)²=1 und x=0,5 mol; bei 1+4 mol Start x²/[(1-x)(4-x)]=1, also 5x=4 und x=0,8 mol. Beide positiven Lösungen liegen im zulässigen Stoffmengenintervall.',
            'Triglycerid + 3 Methanol stehen im Gleichgewicht mit 3 Fettsäuremethylestern + Glycerin. Glycerinentzug begünstigt die Produktseite; weder Wasser noch Seife sind die behaupteten Umesterungsprodukte. Ein Katalysator ändert nicht K und garantiert keinen 100%-Umsatz.'
        ],
        'operator': 'Aktuelle HE-Primärquelle Q2.1 Naturstoffe, erhöhtes Niveau/LK: Fette/Umesterung; zusätzlich fachliche Q4.2-LK-Biodieselbindung. Q1-Navigation ist keine Behauptung einer Q1-Pflicht oder GK-Pflicht.',
        'limit': 'Geschlossenes ideales K-Modell ist didaktisch vorgegeben; Planung ist keine behauptete reale Durchführung oder industrielle Ausbeute.'
    },
    {
        'understanding': 'Durchführung bleibt ein beobachtbarer praktischer Operator. Esterstruktur erklärt Hydrolyse zu Glycerin und Fettsäuresalzen; Aussalzen trennt bereits entstandene Seife und erzeugt sie nicht erst.',
        'cases': [
            'Triolein C57H104O6 + 3 NaOH ergibt C3H8O3 + 3 C18H33NaO2. Beide Seiten besitzen C57/H107/O9/Na3. Freigegebene beaufsichtigte Handgriffe, eigene Beobachtungen und anschließende Phasentrennung bleiben erforderlich; ein fertiges Protokoll ersetzt die Durchführung nicht.',
            'Tristearin C57H110O6 + 3 NaOH ergibt C3H8O3 + 3 C18H35NaO2; beide Seiten C57/H113/O9/Na3. Die Salzkontrolle trennt Salz-/Löslichkeitswirkung von Hydrolyse. Glycerin bleibt im vereinfachten Verfahren überwiegend in der wässrigen Phase.'
        ],
        'operator': 'HE Q1.4 GK/LK: alkalische Hydrolyse von Fetten/Seifenherstellung und Aussalzen; der Durchführungsoperator der Beschreibung und beider Erwartungssprachen wurde erhalten.',
        'limit': 'Nur ein autorisiertes beaufsichtigtes Versuchsverfahren, keine eigenständige Versuchsanleitung, Sicherheitsfreigabe oder behauptete Ausführung im Review.'
    },
    {
        'understanding': 'Amphiphile Anordnung an Grenzflächen, Micellen und Emulgatorwirkung werden unterschieden. Die Erklärung reduziert Oberflächenspannung über Grenzflächenbelegung und nicht über chemische Fettspaltung.',
        'cases': [
            'An Luft/Wasser weisen die hydrophilen Köpfe ins Wasser, hydrophobe Ketten zur Luft; am Öltröpfchen in Wasser liegen Köpfe außen im Wasser und Ketten zum Öl. Ein großes umhülltes Öltröpfchen ist keine kleine leere Gleichgewichts-Micelle.',
            'Beim ausdrücklich hypothetischen Wassertröpfchen in Öl richtet die frische Grenzflächenübertragung Köpfe zum inneren Wasser und Ketten zur äußeren Ölphase. Aus Orientierung allein folgt keine garantierte stabile inverse Micelle oder Emulsion.'
        ],
        'operator': 'HE Q1.4 GK/LK: amphiphile Struktur, Micellen-/Grenzflächenanordnung, Emulgatorwirkung und Oberflächenspannung. Transfer bleibt dieselbe Ursache-Wirkungs-Kompetenz.',
        'limit': 'Das zweite System ist ein Orientierungsmodell; Stabilität und tatsächliche Phasenstruktur bedürften zusätzlicher Daten.'
    },
    {
        'understanding': 'Seife als Carboxylatsalz und moderne Tensidkopfgruppen werden anhand von Struktur, vorgegebenem Verhalten und begründeter Bewertung verglichen. Die Bedingung der jeweiligen Eigenschaften wird genannt.',
        'cases': [
            'Natriumstearat CH3(CH2)16COO-Na+ besitzt 18 C und ist eine Seife; RSO3-Na+ besitzt eine Sulfonat-Kopfgruppe. Die gegebenen Ca-Ausfällungsdaten begründen eine Entscheidung im konkreten Hartwasserfall, keine universelle Behauptung für jedes Sulfonat.',
            'Ein nichtionischer Polyetherkopf unterscheidet sich von beiden Anionen. Die ausdrücklich gegebenen 20/60-Grad-Daten begründen eine bedingte Auswahl und erklären die Leistungsgrenze; kein universeller Trübungspunkt und kein automatisches Umwelturteil.'
        ],
        'operator': 'Direkte aktuelle BY Sek-I Chemie C10-NTG.4.7: Seifen von modernen Tensiden unterscheiden und Vor-/Nachteile verschiedener Tenside bewerten. HE-/BB-/BE-Gruppen mit weiteren Tensidtypen oder Herstellung bleiben weiter gefasste separate Quellenverbünde.',
        'limit': 'Dieser eigene BY-Operator bestätigt nicht automatisch alle Mitglieder eines BB/BE-Herstellungsverbunds und keine vollständige aktuelle HE-Q1-Pflicht.'
    },
    {
        'understanding': 'Temperatur, Härte und Konzentration werden mit Dispergierung, Micellenbildung und Kalkseife verbunden. Vergleichsgrößen werden kontrolliert, Schaum wird nicht als alleinige Waschleistung ausgegeben.',
        'cases': [
            '2 RCOO- + Ca2+ ergibt Ca(RCOO)2(s), ladungs- und stoffbilanziert. Ca2+ kann verfügbare Seife vermindern. Gegebene Konzentrationsserien verlangen eine Erklärung über Grenzflächen/Micellen und Ausfällung, keine unbegrenzte lineare Verbesserung.',
            'Die neue Tabelle variiert Temperatur und Dosis getrennt bei sonst gleichem System. Eine belastbare Neuplanung kontrolliert Härte, Tensid und Schmutz; höhere Temperatur ist nicht für jedes System automatisch besser und mehr Schaum kein Ersatzmesswert.'
        ],
        'operator': 'HE Q1.4 GK/LK: Einfluss von Temperatur, Wasserhärte, Tensidkonzentration, Dispergierung, Micellen und Kalkseifen; mehrere Bedingungen einer einzelnen Waschkompetenz werden erklärt.',
        'limit': 'Modellwerte beschreiben konkrete Serien, keine Haushaltsanweisung oder allgemeine Leistungszusage.'
    },
    {
        'understanding': 'Temporäre und permanente Anteile betreffen Ca/Mg zusammen mit den jeweiligen Gegenionen; Enthärtung ist von vollständiger Entsalzung zu unterscheiden. MgCO3 wird nicht als universelles Kochprodukt gesetzt.',
        'cases': [
            '1,0 mmol/L Ca(HCO3)2 + 0,5 mmol/L MgSO4 bedeuten insgesamt 1,5 mmol/L Härtebildner, temporär 1,0 und permanent 0,5. Im gegebenen vollständigen Ca-Modell: Ca2+ + 2 HCO3- -> CaCO3 + CO2 + H2O; H/C/O und Gesamtladung stimmen, 0,5 mmol/L bleiben.',
            '0,75 mmol/L CaCl2 + 0,25 mmol/L MgCl2 ergeben 1,0 mmol/L zweiwertige Härtebildner. Austausch jedes zweiwertigen Ions gegen zwei Na+ liefert 2,0 mmol/L Na+; 2,0 mmol/L Cl- bleiben. Härte wird entfernt, Wasser wird nicht entsalzt.'
        ],
        'operator': 'HE Q1.4 erhöhtes Niveau/LK: Härtearten und geeignete Enthärtung; aktuelles HE Q4.3-LK nennt Ionentauscher. Keine GK-Hochstufung über einen Navigationscluster.',
        'limit': 'Werte sind ausdrücklich Modell-Stoffmengenkonzentrationen; keine Umrechnung in ungegebene Härtegrade und kein allgemeiner Mg-Ausfällungsmechanismus.'
    },
    {
        'understanding': 'Ausgangstensidverlust, biologische Umwandlung und weitgehende Mineralisierung werden getrennt. Geeignete Endpunkte und Kontrollen begründen Kriterien, ohne didaktische Zahlen zu gesetzlichen Schwellen zu erklären.',
        'cases': [
            '80% Verlust des Ausgangstensids bei nur 15% des theoretischen CO2 ist kein Beweis weitgehender Mineralisierung. Umwandlung oder Adsorption können zum Verlust beitragen; Inokulumblindprobe, biologischer Kontrollansatz und geeignete Endpunkte bleiben nötig.',
            'Die frische kontrollierte Serie verwendet denselben organischen Kohlenstoff, dasselbe Inokulum und dieselben Bedingungen. Endpunkte werden mit Blindwerten beurteilt; eine schnellere Kurve allein zertifiziert weder regulatorische leichte Abbaubarkeit noch Unbedenklichkeit.'
        ],
        'operator': 'Aktuelles HE Q4.3 GK/LK: Prinzip der biologischen Abbaubarkeit im Nachhaltigkeitskontext. Die erhöhten LK-Abbauwege (Hydrolyse/Oxidation/β-Oxidation) bleiben eine getrennte breitere Quellengruppe; dieses Kriterienziel behauptet sie nicht vollständig.',
        'limit': 'OECD-Endpunkte und Kontrollen stützen das Prinzip; die Kandidaten behaupten ausdrücklich keine gesetzliche Zulassung, OECD-Prüfung oder Umweltfreigabe.'
    },
    {
        'understanding': 'Historische und moderne Konservierung werden über Temperatur, Wasseraktivität, pH, Sauerstoff und Zielorganismen verglichen. Wachstumshemmung, Abtötung und Sterilität bleiben verschieden.',
        'cases': [
            'Trocknen/Salzen, Säuern, Kühlung und das vorgegebene Wärmeverfahren besitzen unterschiedliche Wirkprinzipien und Einschränkungen. Die bereitgestellten Modellwerte begründen Risiken, ohne einen beliebigen Prozess als steril auszugeben.',
            'Weniger Sauerstoff kann das gegebene aerobe Wachstum vermindern; daraus folgt nicht, dass andere Organismen ebenfalls kontrolliert oder das Produkt sicher ist. Der neue Verpackungsfall prüft den Transfer derselben Wirkprinzipien.'
        ],
        'operator': 'HE Q1.5 GK/LK: historische/moderne Lebensmittelkonservierung und Risiken. Eine fachliche Gegenüberstellung wird verlangt; keine Umsetzung beliebiger Verfahren als menschlich freigegebene Anwendung.',
        'limit': 'Aus didaktischen Verpackungs-/Wachstumsdaten folgen ausdrücklich keine Verzehrempfehlung, Haltbarkeit oder Sicherheits-/Rechtsfreigabe.'
    },
    {
        'understanding': 'Praktischer qualitativer Nachweis bleibt Durchführung mit Kontrollen; Ascorbat reduziert das Reagenz und wird selbst oxidiert. Die Antioxidansbegründung ersetzt nicht die Spezifitätsprüfung.',
        'cases': [
            'Die beaufsichtigte freigegebene DCPIP-Vorschrift enthält Reagenzblindprobe, bekannte Positivprobe und unbekannte Probe. Oxidiertes DCPIP ist bei neutralem pH blau, unter sauren Bedingungen rot/pink; Reduktion entfärbt. Andere Reduktionsmittel oder Eigenfarben können stören: alleinige Entfärbung beweist keine exklusive Ascorbatidentität oder Konzentration.',
            'I2 + 2 e- -> 2 I- und C6H8O6 -> C6H6O6 + 2 H+ + 2 e- ergeben C6H8O6 + I2 -> C6H6O6 + 2 H+ + 2 I-. C/H/O/I und Nettoladung 0 sind erhalten; das Iod/Stärke-Signal verschwindet bei Iodreduktion. Vorhandenes I3- in realen Lösungen widerspricht diesem angegebenen I2-Redoxmodell nicht.'
        ],
        'operator': 'HE Q1.5 GK/LK: qualitativer Nachweis von Ascorbinsäure als Antioxidans. DE und EN erhalten tatsächliche Durchführung im autorisierten beaufsichtigten Rahmen und Erklärung der Reagenzreduktion.',
        'limit': 'Keine Durchführung wurde in diesem Maschinenreview beobachtet oder freigegeben; keine quantitative Titration oder Konzentrationsaussage aus einem unkalibrierten qualitativen Signal.'
    },
]
assert len(judgments) == len(candidate['goals']) == 14
rows = []
for spec, judgment in zip(candidate['goals'], judgments, strict=True):
    gid = spec['goalId']
    goal = goals[gid]
    page = pages[gid]
    record = native[gid]
    profile = spec['profile']
    expectations = []
    for expectation in profile['expectations']:
        expectations.append({'expectationId': expectation['id'], 'verdict': 'PASS_scientifically_assessable_candidate', 'exactPayloadSHA256Rule': 'sha256 of sorted compact UTF-8 JSON, ensure_ascii=false', 'exactPayloadDigest': object_digest(expectation), 'allFourDEENFieldsRead': True, 'DEENEquivalent': True, 'scientificReason': judgment['understanding']})
    cases = []
    for case, reason in zip(profile['applicationCaseBriefs'], judgment['cases'], strict=True):
        cases.append({'caseId': case['id'], 'verdict': 'PASS_scientific_candidate', 'exactPayloadDigest': object_digest(case), 'allSixDEENFieldsRead': True, 'DEENEquivalent': True, 'scientificReason': reason, 'freshVariationAndIndependentTransferReview': 'The second complete case varies the substrate/system/data and requires causal reasoning or a structurally new calculation, rather than repeating a memorized label.'})
    assert set(profile['coverageExpectations']['requiredExpectationIds']) == {e['id'] for e in profile['expectations']}
    rows.append({
        'goalId': gid, 'title': goal['title'], 'verdict': 'PASS_independently_scientifically_reviewed_AI_candidate',
        'futureOperativeDescriptionDe': goal['description'], 'futureOperativeDescriptionEn': goal['descriptionEn'],
        'exactNativeGoalFingerprint': record['goalFingerprint'], 'exactNativePositiveInputFingerprint': record['reviewInputFingerprint'], 'exactNativeProfileFingerprint': record['profileFingerprint'],
        'nativeBookGoalFingerprint': page['goalFingerprint'], 'nativeBookPageFingerprint': page['pageFingerprint'],
        'currentSourceProvenance': goal.get('extendedData', {}).get('provenance'),
        'currentSourceComponentBindings': goal.get('extendedData', {}).get('currentSourceComponentBindings', []),
        'expectationReviews': expectations, 'applicationCaseReviews': cases,
        'coverageReview': {'verdict': 'PASS', 'requiredExpectationsAllChecked': True, 'freshVariationRequired': True, 'independentTransferRequired': True, 'demonstrationCountInterpretation': 'Independent demonstrations refer to evidence, not an obligatory two-task quota; one genuine multistep-transfer task can contain sufficient distinct evidence.'},
        'operatorAndCourseScopeReview': judgment['operator'], 'specificLimits': judgment['limit'],
        'unresolvedScientificFindings': [], 'replacementProposal': None,
        'status': 'needs_human_review', 'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
        'actualLearnerPerformanceObserved': False, 'humanApproval': False, 'humanTrial': False,
    })

write('independent-p14-scientific-decisions.json', {
    'schemaVersion': 1, 'reviewId': 'chemie-q1-fourteen-current-independent-p-v3',
    'reviewer': 'Codex independent scientific reviewer B; did not author these profiles',
    'recordedAt': datetime.now(timezone.utc).isoformat(), 'profileRuleVersion': 'positive-understanding-evidence-v2',
    'candidatePath': str((AUTHOR / 'positive-evidence.candidates.json').relative_to(ROOT)), 'candidateSHA256': sha(AUTHOR / 'positive-evidence.candidates.json'),
    'sourceBookModelSHA256': sha(Q1 / 'native-finalbook/bundle/book-model.json'),
    'authorInputPreservedExactly': True, 'authoredProfileCount': 14, 'expectationCount': 28, 'caseCount': 28,
    'rows': rows, 'scientificPassCandidates': 14, 'unresolvedScientificHolds': 0,
    'operativeIntegrationPending': True, 'strictNewClosureCount': 0, 'restoredOperativeBindingsCount': 0,
    'humanApproval': False, 'humanTrial': False, 'activeWrites': 0,
})

holds = json.loads((Q1 / 'six-holds-exact-remediation-and-companion-reuse.candidate.json').read_text())
source_groups = json.loads((Q1 / 'seven-bounded-he-source-group-before-after.candidate.json').read_text())
future_groups = json.loads((Q1 / 'fourteen-current-source-provenance-and-complete-group-deltas.candidate.json').read_text())
scoped_deltas = []
for row in future_groups['rows']:
    gid = row['goalId']
    after = goals[gid]
    before = row['before']
    fields = [key for key in set(before) | set(after) if before.get(key) != after.get(key)]
    scoped_deltas.append({'goalId': gid, 'fields': sorted(fields), 'beforeFieldDigests': {k: object_digest(before.get(k)) for k in sorted(fields)}, 'futureFieldDigests': {k: object_digest(after.get(k)) for k in sorted(fields)}, 'retainAllOtherGoalFields': True})
assert len(scoped_deltas) == 14
write('q1-future-v3-scoped-rebase.plan.json', {
    'status': 'PLAN_only_no_new_future_or_active_inputs_written',
    'baseline': 'Latest operative Chemistry state after independently integrated B010: expected strict 90/376, verify current IDs/report before preparing.',
    'originalFrozenFutureCanonicalPath': str((Q1 / 'prospective-input-tree/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').relative_to(ROOT)),
    'originalFrozenFutureCanonicalSHA256': sha(Q1 / 'prospective-input-tree/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),
    'fullFrozenCanonicalOrRegistryResetForbidden': True,
    'goalDeltas': scoped_deltas,
    'sourceGroupDeltas': {'originalCandidatePath': str((Q1 / 'seven-bounded-he-source-group-before-after.candidate.json').relative_to(ROOT)), 'sourceGoalIds': [x['sourceGoalId'] for x in source_groups['rows']], 'beforeMappingPath': source_groups['beforeMappingPath'], 'futureActiveMappingPath': source_groups['futureActiveMappingPath'], 'applyExactlySevenBeforeAfterMappingsAndDecisions': True, 'retainAllOther31MappingFilesAndAllOtherGroups': True},
    'positiveEvidence': {'14IndependentScienceProfilesPreserveExactly': True, 'independentDecisionPath': str((OWN / 'independent-p14-scientific-decisions.json').relative_to(ROOT)), '14NativeCurrentBindingsMustRematerializeAfterScopedRebase': True, 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'existingUnrelatedPProfilesRemainUnchanged': True},
    'visualization': {'exactReviewedV8Dossier': 'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-q1-eight-current-independent-v-qa-20261005-v3', '4NewPNGs4ExistingJPGs': True, 'applyOwnEightMachineApprovalFieldsOnlyWithExactSHAAltAndGoalInputChecks': True, 'allOther368QARowsPreserved': True},
    'targetedExistingBinding': {'goalId': 'bd36dc58-c93e-5247-9e82-da2f9e4e2bed', 'scienceClosure': 0, 'pageSourceContextChangedByQ1RequiresFocusedD2AndRelatedFingerprintChecks': True, 'retainValidScientificPIfExactInputUnchangedOtherwiseDocumentTargetedRebinding': True},
    'sourceHoldsRemainOpen': [x['goalId'] for x in holds['rows']],
    'orderedNativePreparation': [
        'Verify latest Chemistry canonical objects and strict current IDs after B010, with protected Mathematics/Physics floors.',
        'Create new isolated Q1 future v3 from that latest operative base; apply only the 14 guarded field deltas, seven guarded source groups, reviewed eight image/metadata/QA deltas and explicitly scoped A/M entries.',
        'Reject concurrent conflicting changes to any guarded Q1 field; preserve B010 closures, Bio changes, unreviewed Q1 companions and every unrelated profile/QA row.',
        'Run unchanged native source-atlas generation and targeted check against all actual input bytes; export new current source/page contexts instead of digest replacement.',
        'Rematerialize exact scientifically accepted P14 with native fingerprints against the new exact assets; native candidate/check only, E1/G1 needsHuman.',
        'Prepare fresh native 15-page book/bundle/round inputs: 14 new scientific candidates plus bd36 targeted binding. Keep historical frozen book inputs unchanged.',
        'Run two independent D15 reviews blind to one another. Inspect actual new HTML/PDF pages, image/source context and title on physical page 13; preserve old clip observation as history, use actual new evidence for current decision.',
        'Synthesize only resolved independent results, targeted current A/M/V/P/D checks and visibility/card checks; integrate explicit deltas only after green checks.',
        'Batch full central and dependent Layer-A checks at the stable integration point; count actual strict new closures separately from bd36 restored binding.'
    ],
    'anticipatedMaximumNewScienceClosures': 14, 'anticipatedTargetedRestoredBinding': 1,
    'strictClosureClaimAtPlanTime': 0, 'humanReleaseGatesRemainSeparate': True, 'activeWrites': 0,
})
print('Wrote 14 individual scientific decisions, 28 individual case decisions and explicit future-v3 rebase plan.')
