# SPDX-License-Identifier: Apache-2.0
"""Record this role's actual newly read science, before any normal binding."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import math
import os

REPO = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
OWN = Path(__file__).resolve().parents[1]
E15 = OWN.parent
E0 = 'e0d4f08a-3e67-5e2b-9c4a-06468ec5c3dd'
IA = '1a51362e-fd84-5964-89b5-b435772c2149'
F71 = 'f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528'


def read(p):
    return json.loads(p.read_text())


def ref(p):
    b = p.read_bytes()
    return {'path': p.relative_to(REPO).as_posix(),
            'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def write(p, value):
    assert not p.exists(), p
    temp = p.with_name(p.name + '.partial')
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    os.replace(temp, p)


for folder in ['science', 'inputs', 'normal', 'checks', 'qa', 'records', 'config']:
    (OWN / folder).mkdir(exist_ok=True)
neutral_path = E15 / 'chemie-one-analgesic-rezeptfrei-terminology-author-20261015-v1/INPUTS.one-rezeptfrei-term.neutral-author.selector.json'
native_path = E15 / 'chemie-six-inputs-three-scope-native9-final-rezeptfrei-preparation-technical-20261015-v2/INPUTS.blind-native9-final-rezeptfrei.scientific.selector.json'
neutral, native = read(neutral_path), read(native_path)
assert ref(REPO / neutral['canonical']['path']) == neutral['canonical']
assert ref(REPO / neutral['semanticSourceIdentityOnly']['path']) == neutral['semanticSourceIdentityOnly']
canonical = read(REPO / neutral['canonical']['path'])
goals = {g['id']: g for g in canonical['goals']}
old_canonical_path = E15 / 'chemie-equilibrium-two-mobile-image-corrections-author-20261015-v1/candidate/canonical560.current422.six-wording-four-PNG.image-only-author.json'
old_goals = {g['id']: g for g in read(old_canonical_path)['goals']}
assert goals[E0] == old_goals[E0] and goals[IA] == old_goals[IA]
old_f71 = old_goals[F71]
assert {k: v for k, v in goals[F71].items() if k != 'description'} == {k: v for k, v in old_f71.items() if k != 'description'}
assert goals[F71]['description'] == old_f71['description'].replace('frei verkäuflicher', 'rezeptfreier')
case_path = E15 / 'chemie-equilibrium-four-material-gap-remediation-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.four-gap-successor.author.json'
profile_path = E15 / 'chemie-equilibrium-four-material-gap-remediation-author-20261015-v1/sixteen-profile-bodies.scientific-successor.jsonl'
cases4 = [c for c in read(case_path)['cases'] if c['goalId'] in [E0, IA]]
profiles2 = [json.loads(l) for l in profile_path.read_text().splitlines() if json.loads(l)['goalId'] in [E0, IA]]
assert len(cases4) == 4 and len(profiles2) == 2
carbonyl_cases_path = E15 / 'chemie-carbonyl-pharmacy15-current422-whole-material-author-20261015-v1/materials/whole30.current422.bilingual-cases.author.json'
cases_f71 = [c for c in read(carbonyl_cases_path)['cases'] if c['goalId'] == F71]
assert len(cases_f71) == 2
image_sources = {
    E0: E15 / f'chemie-equilibrium-two-mobile-image-corrections-author-20261015-v1/candidate/visualizations/chemie/{E0}/{E0}.png',
    IA: REPO / f'curricula/DE/Gymnasium/visualizations/chemie/{IA}/{IA}.jpg',
    F71: E15 / f'chemie-carbonyl-two-final-wording-and-visual-remediation-author-root-20261015-v1/candidate/visualizations/chemie/{F71}/{F71}.png',
}
browser = E15 / 'chemie-carbonyl-two-final-context-independent-V-20261015-v1/browser'
prior_browser_receipt = read(browser / 'RECEIPT.actual-Chromium-responsive-rendering.json')
selected_prior_views = [r for r in prior_browser_receipt['records'] if r.get('goalId') == F71 and 'final' in r.get('screenshot', {}).get('path', '')]
page = next(p for p in native['actualWholePageRasters'] if p['goalId'] == F71)
Mbaseline = E15 / 'chemie-equilibrium-four-final-wording-memory-informed-20261015-v1/records/M422.original418-plus-four-final-wording.review.jsonl'
Mprior = next(json.loads(l) for l in Mbaseline.read_text().splitlines() if json.loads(l)['goalId'] == F71)
Vbaseline = E15 / 'chemie-equilibrium-two-mobile-final-context-independent-V2-20261015-v1/qa/QA438.original436-plus-two-independent-new-PNG-reviews.candidate.json'
Vprior = next(r for r in read(Vbaseline)['records'] if r['goalId'] == F71)
assert Vprior['assetSha256'] == ref(image_sources[F71])['sha256']
assert Vprior['description'] == old_f71['description']
context_path = OWN / 'inputs/whole-three-contexts-two-profiles-six-cases.actual.json'
write(context_path, {
    'schemaVersion': 1, 'role': 'Actual informed science input; no peer verdict or expected outcome',
    'neutralTermSelector': ref(neutral_path), 'neutralNative9Selector': ref(native_path),
    'finalCanonical': neutral['canonical'], 'finalSemantic': neutral['semanticSourceIdentityOnly'],
    'wholeContexts': [{'goal': goals[gid], 'wholeDirectPrerequisites': [goals[p] for p in goals[gid]['requires']],
                       'wholeDirectParents': [g for g in goals.values() if gid in g.get('contains', [])],
                       'actualImage': ref(image_sources[gid])} for gid in [E0, IA, F71]],
    'wholeProfiles2': profiles2, 'wholeEquilibriumCases4': cases4, 'wholeAnalgesicCases2': cases_f71,
    'wholeCaseSource': ref(case_path), 'wholeProfileSource': ref(profile_path),
    'wholeAnalgesicCaseSource': ref(carbonyl_cases_path),
    'actualCurrentF71Page': page, 'priorF71BrowserReceipt': ref(browser / 'RECEIPT.actual-Chromium-responsive-rendering.json'),
    'priorIdenticalImageBrowserRecords': selected_prior_views,
    'priorBrowserWordingIsHistorical': True,
    'wholePriorF71MDecision': Mprior, 'wholePriorF71VRecord': Vprior,
    'M422Baseline': ref(Mbaseline), 'V438Baseline': ref(Vbaseline),
    'oldCanonical': ref(old_canonical_path),
    'f71OnlyChangedField': 'description', 'f71BeforeDE': old_f71['description'], 'f71AfterDE': goals[F71]['description'],
    'e0And1aWholeObjectsExactToPreviouslyInspected8152': True,
    'newRenders': 0, 'sourceImagesCopied': 0,
    'roleDisclosure': 'Author of original equilibrium16 materials; not author of later B material correction, four new descriptions or rezeptfrei term. Informed review, not blind independent material authorship.',
})
now = datetime.now(timezone.utc).isoformat()
scope = 'No D/source/course/Human/M7 approval; e0/1a source and D holds remain open. No observed learner or laboratory result.'
Pdecisions = [
    {
        'goalId': E0, 'decision': 'supported_E1_G1_ai_candidate',
        'reason': 'Der aktuelle begrenzte Zieltext verlangt die K(T)-Berechnung mit Erläuterung der Enthalpieannahme. Das ganze Profil verbindet diesen Kern mit drei überprüfbaren Erwartungen: absolute Temperatur/Einheiten/Vorzeichen; annähernd konstantes ΔrH° statt Aktivierungsenergie; Gleichgewicht gegenüber Einstellgeschwindigkeit und Extrapolation. In 08-a sind K2=0,3558177 und die endotherme Richtung richtig. 08-b fordert umgekehrt ΔrH°=−27,66156 kJ/mol und begrenzt den Zwei-Punkt-Sekantenwert durch Unsicherheit und Krümmung. Die invers definierte Reaktion und ein fast enthalpieneutraler, dennoch beschleunigter Prozess sind echte Strukturvariationen. Das Bild wurde nativ im aktuellen Kontext angesehen, ist aber weder Lösungsnachweis noch notwendiges Fallmaterial. E1/G1 betrifft ein kohärentes zukünftiges Assessmentdesign, keine bereits beobachtete Leistung. Ich war Autor der ursprünglichen Materialien; dies ist eine erneute informierte Prüfung der ganzen endgültigen Körper, kein unabhängiger Blindvote.',
        'understandingPerformanceTransferChain': [
            'K(T), Kelvin/Joule/ln und Vorzeichen -> unabhängige Rechnung 08-a -> inverse Reaktionsdefinition mit reziproken K und umgekehrtem ΔrH°.',
            'Annähernd konstantes ΔrH° im Temperaturintervall -> Sekante/Unsicherheit/Krümmung in 08-b erläutern -> Extrapolation und nahezu null ΔrH° gegenüber schnellerer Kinetik begrenzen.',
        ], 'profileBodyChanged': False,
    },
    {
        'goalId': IA, 'decision': 'supported_E1_G1_ai_candidate',
        'reason': 'Das ganze aktualisierte Profil und die beiden Fälle prüfen die gemeinsame-Spezies-Kopplung, passende Konstantenoperationen und zum Randzustand passende Bilanzen. 09-a gibt ausdrücklich ein pH/HCO3-Reservoir, verbleibenden Feststoff und verdünnt-ideale Bedingungen an; KL/Ka2=70,2128, Carbonat=4,7e−5 M und freies Calcium=7,0213e−5 M sind konsistent. Der geschlossene Ansatz verlangt zusätzliche Stoff-/Ladungs- und gegebenenfalls Gasbilanz. In der tatsächlichen B-Nachfolge 09-b ist a_i=c_i/c° für sämtliche gelösten Spezies ausdrücklich gegeben; damit folgen Knet=0,00288, s=0,00536658 M und freies Ag+=3,35409e−8 M. Der Faktor160001 und die unmögliche Ligandenmenge im geschlossenen0,001-M-Ansatz prüfen die Näherung statt bloß Zahlen einzusetzen. Transfer zu CO2-Gasaustausch und einem1:1-Liganden verändert Kopplung/Randbedingung. Alle Erwartungen sind positiv sichtbar abgedeckt; kein neuer fachlicher Profilkörper ist nötig. Das Carbonatbild ist aktueller Kontext, nicht eine zweite unabhängige Demonstration. Ursprüngliche Materialautorenschaft ist offengelegt; die neue ideale B-Korrektur wurde tatsächlich ganz gelesen. Quellen-/Kurs-/D-Holds werden nicht als gelöst bewertet.',
        'understandingPerformanceTransferChain': [
            'Gemeinsame Spezies und Addition/Umkehr -> Ksp/Ka2 beziehungsweise Ksp*beta herleiten -> neue1:1-Komplexstöchiometrie selbst konstruieren.',
            'Freie Aktivitäten, Idealannahme und Bilanzen -> Reservoirrechnung plus freie Ag+-Gegenprobe -> endlicher Ligandenvorrat und offener CO2-Rand statt festgehaltenem pH.',
        ], 'profileBodyChanged': False,
    },
]
Adecisions = [
    {'goalId': E0, 'status': 'atomic', 'semanticAtomic': True,
     'competenceCore': 'Die thermodynamische Temperaturabhängigkeit einer definierten Gleichgewichtskonstante unter der verwendeten Enthalpieannahme quantitativ deuten.',
     'prerequisiteApplication': 'Le Chatelier liefert die qualitative Temperatureinordnung; Massenwirkungsgesetz und Gleichgewichtskonstante liegen in seiner Prärequisitenkette. Einheiten und ln sind benötigte mathematische Werkzeuge, keine zusätzlichen Kompetenzäste.',
     'transferBoundary': 'Inverse Reaktionsdefinition und begrenzte Interpolation/Extrapolation bleiben Anwendungen desselben K(T)-Modells. Eigenständige Bestimmung von Aktivierungsenergien, kinetischen Raten oder vollständigen Gleichgewichtszusammensetzungen ist nicht enthalten.',
     'reason': 'Die neue Formulierung verbindet Rechnung und ihre notwendige Gültigkeitsbedingung zu einem prüfbaren Kompetenzkern. Die beiden Richtungen K(T) beziehungsweise Enthalpie aus K-Daten sind Anwendung desselben Zusammenhangs. Die Trennung zur Kinetik begrenzt ihn, statt einen zweiten Lernbereich zu verlangen. Daher atomic/true nach tatsächlicher Ganzlektüre; diese A-Entscheidung klärt ausdrücklich keine BY/HE-Quellenpflicht und keinen D-/Kurshold.'},
    {'goalId': IA, 'status': 'atomic', 'semanticAtomic': True,
     'competenceCore': 'Ein gekoppeltes Gleichgewichtssystem über gemeinsame Spezies, zusammengehörige Konstanten und passende Stoffbilanzen schließen und deuten.',
     'prerequisiteApplication': 'Massenwirkungsgesetz für Einzelgleichgewichte wird als vorhandenes Werkzeug auf die Kopplung angewandt. Gelieferte Löslichkeits-/Säure-/Komplexkonstanten und ausdrücklich ideale Aktivitäten erlauben den gemeinsamen Ansatz.',
     'transferBoundary': 'Protonierung und Komplexierung sind unterschiedliche Beispiele derselben Kopplung. Reservoir gegenüber geschlossenem Vorrat und ein1:1-Ligand testen die Systemgrenze. Ein vollständiger allgemeiner Speziationssolver, selbständige experimentelle Konstantenbestimmung oder Behandlung aller realen Nichtidealitäten wird nicht verlangt.',
     'reason': 'Die drei genannten Elemente sind gemeinsam nötige Teile der Analyse desselben Systems: Konstantenaddition ohne Bilanz oder unabhängige Einzelrechnungen wären unvollständig. Die beiden ganzen Fälle zeigen chemisch veränderte Anwendungen statt unabhängig hinzugenommener Zielzweige. Daher atomic/true für den tatsächlichen begrenzten Text. Dies löst weder den Quellen-/Kurs-/D-Dissent noch spendet es Geschwisterkompetenzen.'},
]
Mreason = 'Die tatsächliche einzige deutsche Wortänderung präzisiert die betrachtete Gruppe rezeptfreier Schmerzmittel. Sie verlangt keinen neuen abrufbaren Katalog von Abgabestatus, Dosierungen, Marken oder Risikoaussagen. Der ganze Zieltext bleibt Recherche zu Zusammensetzung, Konsum und Anwendung, strukturelle Einordnung sowie informationsgestützte Bewertung. Die zwei ganzen Fälle verlangen Quellenorte, ASS-Säure/Ester gegenüber Ibuprofen-Säure und Paracetamol-Phenol/Amid, verschiedene Nenner/Zeiträume und die Zurückweisung unbelegter Ring-/Kombinationsschlüsse. Historische RKI-Zahlen und erfundene Verkaufsdaten sind bereitgestellte oder zu recherchierende Daten, keine aktuelle Faktenliste zum Auswendiglernen. Funktionelle Gruppen, Carbonsäure-/Esterwissen und Quellenarbeit werden von den tatsächlich gelesenen Prärequisiten getragen. Rezeptfrei bedeutet im aktuellen Gegenstand keine voraussetzungslose Eignung oder risikofreie Anwendung; die Recherche-/Bewertungsgrenze bleibt bestehen. Neue Karten würden diesen Transfer nicht ersetzen und könnten die erforderliche Quellenaktualität verschleiern. Deshalb erneut genuine no_memory_needed/memoryUseful:false für dieses Ziel, aufgrund seines aktuellen Kompetenzbedarfs und nicht bloß wegen unverändertem alten Status.'
Vreason = 'Nach eigener aktueller Sichtung des unveränderten nativen PNG2c565c1 und der tatsächlichen finalen f71-Seite03 mit rezeptfreier bleibt das Bild fachlich kompatibel: ein korrektes ortho-ASS-Beispiel mit Carbonsäure und Ring–O–C(=O)–CH3-Ester; ein Quellenbuch und eine Nutzen/Risiken-Waage unterstützen Recherche und begründete Abwägung. Informationen sind kein Waagengegenpol, das Bild legt weder klinische Empfehlung noch die Abgabeform aller Präparate fest. Die eine Wortgruppenänderung betrifft den Recherchegegenstand und widerspricht keinem Bildsignal. Aktuelle EN-Beschreibung, ALT, direkte Prärequisiten/Parent und zwei ganze Fälle bleiben gleich. Die früher selbst aufgenommenen und jetzt erneut angesehenen316/636-GoalCard-Belege binden exakt dieselben Bildbytes und zeigen deren erkennbare Struktur/Labels; ihr damaliger deutscher Wortlaut wird ausdrücklich als historisch behandelt. Es wurden keine neuen360/680-Raster erzeugt oder als aktuell ausgegeben. Dieser V1 ist ein tatsächlicher begrenzter Kontextnachtrag nach erneuter Ganzlektüre, keine zweite neue Pixelprüfung eines veränderten Bildes. KEEP/accepted; keine Therapie-, Source-/Kurs-, Human- oder M7-Freigabe.'
role_data = {
    'P2': {'decisions': Pdecisions, 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
           'status': 'needs_human_review', 'reviewAuthority': 'ai_candidate',
           'profileInterpretation': 'Two distinct independent demonstrations concern the evidence chain, not an extra quota of task labels; meaningful multi-step transfer may suffice within one task.'},
    'A2': {'decisions': Adecisions},
    'M1': {'decisions': [{'goalId': F71, 'status': 'no_memory_needed', 'memoryUseful': False,
                          'reason': Mreason, 'wholePriorMDecision': Mprior}]},
    'V1': {'decisions': [{'goalId': F71, 'decision': 'accepted', 'reason': Vreason,
                          'wholePriorVRecord': Vprior, 'actualPNG': ref(image_sources[F71]),
                          'currentFinalPageActuallySeen': page['wholePageRaster'],
                          'prior316And636ImagesActuallyReopened': [ref(browser / f'{F71}.final.{w}.GoalCard-p5-viewport.png') for w in [360, 680]],
                          'newBrowserRenders': 0, 'reviewScope': 'one-word-group context addendum, exact unchanged pixels'}]},
}
for role, science in role_data.items():
    path = OWN / f'science/FIRST.actual-informed-{role}.original.json'
    write(path, {'schemaVersion': 1, 'role': f'Own newly reasoned informed {role}; actual final fccb/3e8 context',
                 'completedAtUTC': now, 'wholeActuallyReadInput': ref(context_path),
                 'blindToOtherRuns': False, 'originalEquilibriumMaterialAuthor': True,
                 'notAuthorOfLaterFourDescriptionsOrBMaterialCorrectionOrTerm': True,
                 'normalNewRecordsAtFIRST': 0, 'normalNewFingerprintsAtFIRST': 0,
                 'scopeBoundary': scope, **science})
    write(OWN / f'science/FIRST.actual-informed-{role}.seal.json',
          {'schemaVersion': 1, 'role': f'Seal own original informed {role} before normal binding',
           'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'files': [ref(path)],
           'normalNewRecordsAtSeal': 0, 'normalNewFingerprintsAtSeal': 0,
           'activeWrites': 0, 'humanApproval': False})
print(json.dumps({'FIRSTsSealed': ['P2', 'A2', 'M1', 'V1'], 'normalBindings': 0,
                  'sourceOrImageCopies': 0, 'newRenders': 0,
                  'roleDisclosure': 'informed; original16 material author; not author of final text/B correction'}, indent=2))
