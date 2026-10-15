# SPDX-License-Identifier: Apache-2.0
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

R = Path(__file__).resolve().parents[8]
O = Path(__file__).resolve().parents[1]
T = O.parent / 'chemie-source6-current412-final-resources-P5-shared-native5-technical-20261014-v1'


def bind(p):
    b = p.read_bytes()
    return {'path': str(p.relative_to(R)), 'bytes': len(b), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest()}


def write(p, x):
    assert not p.exists(), f'Preserve existing {p}'
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')


campaign = json.loads((T / 'native-five/round-a/description-review-campaign.json').read_text())
input_data = json.loads((T / 'native-five/round-a/description-review-input.json').read_text())
assert campaign['bundleFingerprint'] == 'sha256:07e7233bce92a5310b3d37f4a177ddf5e77df309d267ebc135d0e0eaf6caed7f'
assert input_data['reviewInputFingerprint'] == 'sha256:fcb9b9b221ca4ec879cb3be826ed1ceaf4d2cefeb5b1e04a5e3741a32e753299'
run_id = 'chemie-source6-current412-native5-independent-a-20261014-v1-run-01'
batch = campaign['batches'][0]
rows = [
    {
        'essentialUnderstandingDe': 'Bei ausgewählten Siliconen bestimmen die Funktionalität der Ausgangsstoffe und ihre Verknüpfung zu Siloxanketten oder Netzwerken die Beweglichkeit und den Vernetzungsgrad. Daraus werden Eigenschaften und Anwendungen von Öl, Harz und Kautschuk erklärt; ein einzelner Herstellungsweg ist keine Regel für alle Siliconqualitäten.',
        'essentialUnderstandingEn': 'For selected silicones, starting-material functionality and linking into siloxane chains or networks determine mobility and degree of crosslinking. These explain the properties and uses of oils, resins and rubbers; one manufacturing route is not a rule for every silicone grade.',
        'observablePerformanceDe': 'Die lernende Person beschreibt und bilanziert die bereitgestellten Herstellungsreaktionen und unterscheidet Endbegrenzung, Kettenbildung und Vernetzung. Für alle drei Siliconfamilien begründet sie aus dem jeweiligen Aufbau die gegebenen Eigenschaften und eine passende Anwendung, statt nur Bildbeschriftungen zu wiederholen.',
        'observablePerformanceEn': 'The learner describes and balances the supplied formation reactions and distinguishes end limitation, chain formation and crosslinking. For all three silicone families they use the respective constitution to justify the supplied properties and an appropriate use, rather than repeating image labels.',
        'transferExpectationDe': 'Bei erhöhter Vernetzerdichte oder einem ausdrücklich feuchtehärtenden System in trockener Umgebung leitet die lernende Person eine veränderte Eignung beziehungsweise Aushärtung aus Funktionalität und Reaktionsweg ab. Sie trennt diese begrenzte Prognose von einer universellen Feuchte- oder Temperaturgarantie.',
        'transferExpectationEn': 'With increased crosslinker density or an explicitly moisture-curing system placed in dry conditions, the learner derives changed suitability or curing from functionality and reaction pathway. They distinguish this bounded prediction from a universal moisture or temperature guarantee.',
        'rationale': 'KEEP after actual physical PDF3/book goal1, complete DE/EN text, canonical/parent/prerequisite context, current whole P and both full cases. The current description explicitly retains manufacture, constitution, properties, uses and all three families in one structure-to-function explanation. The chain/network image is readable as a schematic model and agrees with the selected supplied grades; it is not a literal Si/O valence formula or a full manufacturing answer. Balanced chloro-/alkoxysilane hydrolysis and silanol condensation, changed crosslink density and specifically dry moisture-cure conditions still require explanation. The outside-book2652 prerequisite is visible and remains the actual whole polymer-profile foundation. HB34 supports this as a selected silicone deepening for eligible GK/LK; optional placement/acquisition/source-union HOLDs remain separate. Neither the general HB20 formation component nor a prior P/V vote proves whole-course scope or learner understanding.',
    },
    {
        'essentialUnderstandingDe': 'Strukturklasse, Löslichkeit im angegebenen Medium, Herkunft, Färbemethode und Verwendung sind verschiedene Zuordnungskriterien. Azo und mindestens zwei weitere ausgewählte Farbstoffklassen lassen sich strukturell unterscheiden, ohne aus Farbe oder Klassenname automatisch eine Verwendung oder Löslichkeit abzuleiten.',
        'essentialUnderstandingEn': 'Structural class, solubility in the stated medium, origin, dyeing method and use are distinct classification criteria. Azo and at least two further selected dye classes can be distinguished structurally without automatically inferring use or solubility from colour or class name.',
        'observablePerformanceDe': 'Die lernende Person stellt die drei ausgewählten Klassen mit ihren kennzeichnenden Strukturmerkmalen vor und ordnet gegebene Vertreter anhand ausdrücklich benannter Kriterien begründet ein. Sie trennt fehlende Methodenangaben von bekannten Daten und erklärt, weshalb Indikator eine Verwendung und keine zusätzliche Molekülstrukturklasse bezeichnet.',
        'observablePerformanceEn': 'The learner introduces the three selected classes through their characteristic structural features and classifies supplied representatives with reasons using explicitly named criteria. They distinguish missing method information from known data and explain why indicator denotes a use rather than an additional molecular-structure class.',
        'transferExpectationDe': 'Bei synthetisch erzeugtem, strukturgleichem Anthocyanin oder beim Wechsel von einem dispergierten Azo-Pigment zu einem löslichen Vertreter prüft die lernende Person für jedes Kriterium gesondert, welche Zuordnung sich ändert. Eine unveränderte Strukturklasse begründet dabei keine unveränderte Herkunft, Löslichkeit oder Anwendung.',
        'transferExpectationEn': 'For synthetically produced but structurally identical anthocyanin, or a change from a dispersed azo pigment to a soluble representative, the learner separately checks which assignment changes for each criterion. An unchanged structural class does not establish unchanged origin, solubility or use.',
        'rationale': 'KEEP after actual physical PDF4/book goal2 and complete current DE/EN/context/P/case review. The description explicitly includes azo plus two further classes and criterion-based classification, while source RP6.2 keeps azo synthesis and extra-class mechanisms separate. The full materials provide usable azo/triaryl/flavylium features and all five classification axes; no unattached structure drawing or new synthesis mechanism is required here. The image correctly demonstrates two axes and generic sample uses. Its Probe A ink sample is not additional data for case1 card A, whose exact supplied use is textile dyeing; tasks must use their own cards. Synthetic identical C and soluble P-prime changes require independent criterion-by-criterion reasoning beyond copying image routes. The external functional-group prerequisite is shown. RP selected WP Leistungsfach Additum and source/programme acquisition boundaries remain; this D candidate grants neither GK/default scope nor the whole neighbouring dye-source union.',
    },
    {
        'essentialUnderstandingDe': 'Ein Alkohol-Elektronenpaar kann im bereitgestellten Modell den elektrophilen Isocyanat-Kohlenstoff angreifen; passende π-Elektronenverschiebung und Protonenübertragung erhalten Valenz, Ladung und Atome bis zur Urethanbindung. Die Wiederholung derselben Gruppenreaktion bifunktioneller Stoffe erlaubt Kettenbildung ohne kleines Abspaltungsprodukt.',
        'essentialUnderstandingEn': 'In the supplied model an alcohol electron pair can attack the electrophilic isocyanate carbon; the corresponding pi-electron shift and proton transfer preserve valence, charge and atoms up to the urethane linkage. Repetition of the same group reaction between bifunctional substances permits chain formation without a small eliminated product.',
        'observablePerformanceDe': 'Die lernende Person entwickelt die lokalen Elektronenpaarpfeile, einen ladungsrichtigen Zwischenzustand und den bereitgestellten Protonenrelay bis zum neutralen Urethanprodukt. Sie stellt daraus einen fortsetzbaren Kettenabschnitt mit mehreren Verknüpfungen dar und erklärt Atomverbleib und Funktionalität; eine bloße Produktgleichung reicht nicht.',
        'observablePerformanceEn': 'The learner develops the local electron-pair arrows, a charge-correct intermediate and the supplied proton relay to the neutral urethane product. They construct a continuable chain segment with several links and explain atom retention and functionality; an overall product equation alone is insufficient.',
        'transferExpectationDe': 'Für veränderte Reste korrigiert die lernende Person einen falschen Angriff oder eine behauptete Wasserabspaltung mechanistisch. Wird das Diol bei gleichem OH:NCO-Verhältnis durch monofunktionelles Ethanol ersetzt, erklärt sie die Endbegrenzung statt derselben langen Kette und erfindet keine unbelegte Geschwindigkeitsrangfolge.',
        'transferExpectationEn': 'For changed substituents the learner mechanistically corrects an erroneous attack or claimed water elimination. When monofunctional ethanol replaces the diol at the same OH:NCO ratio, they explain end limitation rather than the same long chain and do not invent an unsupported rate ranking.',
        'rationale': 'KEEP after actual physical PDF5/book goal3 and full current bilingual/context/case/profile review. The description already names particle-level electron movement, proton transfer, urethane formation, bifunctional repeated linking and absence of a small eliminated molecule. Alcohol lone-pair attack, C=N pi shift to N and the neutral product are chemically consistent in the supplied explicitly simplified formal model. On the actual page the short blue arrow is unambiguously associated with the pi-bond region despite a small graphic gap above its stroke; the dark B/BH-plus cycle is a proton-helper icon, not a full arrow sequence. The image does not provide the charged intermediate, complete relay, repeated chain or ethanol transfer, which both case rubrics still require. Functional-group and bonding prerequisites are visible outside the five-page subset. RP65 selected optional polyaddition deepening supports the bounded content; no compulsory GK/LK or full-source/actual-acquisition claim follows from this D decision.',
    },
    {
        'essentialUnderstandingDe': 'Beim Fixieren wird schwerlösliches verbliebenes Silberbromid durch Bindung von Ag(I) in einem löslichen Ligandenkomplex aus der Schicht entfernt. Das metallische Ag(0)-Bild bleibt; Komplexbildung ist von Belichtung und der Bildentstehung durch Entwicklung zu unterscheiden.',
        'essentialUnderstandingEn': 'During fixing, residual sparingly soluble silver bromide is removed from the layer by binding Ag(I) in a soluble ligand complex. The metallic Ag(0) image remains; complex formation must be distinguished from exposure and image formation during development.',
        'observablePerformanceDe': 'Die lernende Person verknüpft den Stoffebenenbefund mit Ligandenbindung und weiterer AgBr-Auflösung auf Teilchenebene. Sie formuliert und prüft die bereitgestellte Komplexbildungsbilanz auf Atome, Ladung und Silberoxidationsstufe und erklärt, warum die abgeführte Lösung weiterhin Silber enthält.',
        'observablePerformanceEn': 'The learner connects the substance-level result with ligand binding and further AgBr dissolution at particle level. They formulate and check the supplied complex-formation balance for atoms, charge and silver oxidation state and explain why the removed liquid still contains silver.',
        'transferExpectationDe': 'Bei einem erschöpften Bad mit begrenzter freier Ligandmenge oder bloßem Wasserspülen erklärt die lernende Person mögliches Rest-AgBr und dessen Einfluss auf spätere Lichtstabilität. Sie begründet, wie ein geeignetes frisches Bad helfen kann, ohne stöchiometrische Modellkapazität als gemessene Fixierzeit auszugeben.',
        'transferExpectationEn': 'For an exhausted bath with limited free ligand or water rinsing alone, the learner explains possible residual AgBr and its effect on later light stability. They justify how an appropriate fresh bath can help without presenting stoichiometric model capacity as a measured fixing time.',
        'rationale': 'KEEP after actual physical PDF6/book goal4 and full DE/EN/whole-context/P/case review. The description clearly distinguishes residual AgBr, soluble silver-ligand complexes, retained metallic image, exposure and development. The native schematic image and balanced thiosulfato equation preserve that distinction and remain legible; generic grain counts are not numerical case data. Whole cases correctly retain Ag(I) during complexation, Ag(0) in the image, free-ligand capacity and the silver-containing effluent. The water-only and depleted-versus-fresh-bath variations test changed chemistry and stability rather than a number swap alone. Bonding is an outside-book foundation; the orientation prerequisite is not a certificate of chemical knowledge. SN11 GK photography is a selected Wahlbereich; the separate practical silver-halide/fixing/developer experiment duties and whole-view acquisition remain held. A correct theoretical description and image do not certify those experiments or full course source scope.',
    },
    {
        'essentialUnderstandingDe': 'Reaktionsbedingungen werden aus den jeweiligen Gruppen- und Bindungsänderungen abgeleitet und zwischen radikalischer Kettenpolymerisation, Polykondensation und Polyaddition verglichen. Initiator, Katalysator, Temperatur, Nebenproduktabfuhr und Kontrolle von Feuchte oder Wärme haben beispielspezifische Rollen und sind keine universellen Klassenzahlen.',
        'essentialUnderstandingEn': 'Reaction conditions are derived from the respective group and bond changes and compared across radical chain polymerization, polycondensation and polyaddition. Initiator, catalyst, temperature, byproduct removal and control of moisture or heat have example-specific roles rather than universal class values.',
        'observablePerformanceDe': 'Die lernende Person vergleicht alle drei gegebenen Routen ausdrücklich nach Gruppenreaktion, Initiierung oder Katalyse, Temperatur und Reaktionsführung und begründet die Unterschiede chemisch. Sie unterscheidet einen verbrauchten Starter oder HCl-Abfänger vom regenerierten Katalysator und trennt Gleichgewichtslage von schnellerer Gleichgewichtseinstellung.',
        'observablePerformanceEn': 'The learner explicitly compares all three supplied routes by group reaction, initiation or catalysis, temperature and reaction control, giving chemical reasons for the differences. They distinguish a consumed initiator or HCl scavenger from a regenerated catalyst and separate equilibrium position from faster approach to equilibrium.',
        'transferExpectationDe': 'Bei lichtinitiierter Polymerisation und einer HCl-bildenden Grenzflächen-Polykondensation statt heißer Polyesterbildung überträgt die lernende Person den ganzen Drei-Routen-Vergleich neu. Sie begründet die verschiedenen Folgen von Dunkelheit, fehlendem HCl-Abfänger und Wasser im Urethansystem, statt aus gleicher Temperatur denselben Reaktionstyp abzuleiten.',
        'transferExpectationEn': 'With light-initiated polymerization and HCl-forming interfacial polycondensation replacing hot polyester formation, the learner transfers the complete three-route comparison. They explain the different effects of darkness, an absent HCl scavenger and water in the urethane system rather than inferring the same reaction type from equal temperature.',
        'rationale': 'KEEP after actual physical PDF7/book goal5 and complete bilingual text, current prerequisites/profile and both whole cases. The description already requires all three routes and a chemically justified comparison through group reaction, initiation/catalysis, temperature and process control. The actual image is expressly selected schematic examples: water removal is tied to polyester, while dryness/heat control refer to polyurethane. This does not conflict with case2 cold HCl-forming amide polycondensation or imply that all condensations release water or need high temperature. All visible model building blocks are conserved. Full task demands still include starter versus catalyst/acid scavenger, fixed-temperature equilibrium distinction and independent darkness/base/moisture changes. The three whole mechanism prerequisites appear outside this subset and avoid adding unrelated new mechanisms. TH58/printed53 elevated/LK reaction-condition comparison supports this bounded content; separate monomer/polymer-structure comparisons, actual plastic manufacture, source union and programme acquisition are not approved by this D candidate.',
    },
]
assert len(rows) == len(input_data['goals']) == 5
records = []
for g, finding in zip(input_data['goals'], rows):
    evidence = {k: v for k, v in finding.items() if k != 'rationale'}
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1, 'recordId': run_id + '.' + g['goalId'], 'runId': run_id,
        'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
        **{k: g[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'keep', 'understandingEvidence': evidence, 'rationale': finding['rationale'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2', 'evidenceProfileRecommendation': 'none',
        'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
    }
    records.append(record)

(O / 'results').mkdir()
records_path = O / 'results' / (batch['batchId'] + '.records.jsonl')
records_path.write_text(''.join(json.dumps(x, ensure_ascii=False) + '\n' for x in records))
ended = datetime.now(timezone.utc).isoformat()
write(O / 'PROVENANCE.actual-native5-D-A-prior-gates-disclosed-current-D-blind.json', {
    'schemaVersion': 1, 'startedAtUTC': '2026-10-14T03:23:54.269828+00:00', 'scienceCompletedAtUTC': ended,
    'provider': 'OpenAI', 'model': 'GPT-6 Codex', 'modelRevision': None, 'samplingParameters': None,
    'role': 'Genuine FIRST_PASS native D-A, round-a exact original campaign',
    'currentNative5D_BOrRootDescriptionOutcomesRead': False,
    'priorExposureDisclosed': 'Same reviewer previously performed actual Source6 P/A/M/kind science, final V5-B native/360/680 pixels and additive P5/image-context review for these same whole goals. Parent disclosed historical paired V5 results only after own V5 seals. These are known prior gates and contextual evidence, not new P/A/M/V authority or current D decisions.',
    'actualVisualInspection': 'Original regular book.pdf independently rasterized; whole outline physical2 plus all five complete native goal pages physical3-7 actually viewed, including chemical formulas/arrows, images, descriptions, breadcrumbs, outside-book prerequisite links and footer.',
    'actualWholeInputRead': 'Current DEEN canonical context, whole direct prerequisites, no direct successors, supplement parent; exact current profiles and original full ten bilingual case materials/tasks/answers/rubrics (same unchanged carrier as own prior whole-design and current additive reads); full primary windows/course boundaries and seven carrier unions treated as source data, not approval oracle.',
    'reviewViewNotLearnerProjection': True,
    'externalSourceChoiceAcquisitionHoldsKeptSeparate': True,
    'newIndependentP_A_M_VKindOrHumanVotesClaimed': False,
    'noActiveHHostEngineRegistryGitWrites': True,
})
write(O / 'FIRST-SCIENCE-SEAL.current412-five-whole-native-pages-independent-a.actual.json', {
    'schemaVersion': 1, 'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'scienceCompletedAtUTC': ended,
    'role': 'GENUINE_NATIVE_D5_A_FIRST_PASS_BEFORE_CURRENT_PEER_D_OUTCOMES',
    'originalNeutral': bind(T / 'NEUTRAL.current412-source6-five-final-resource-P5-native-FIRST_PASS.exact-input-selector.json'),
    'originalRoundACampaign': bind(T / 'native-five/round-a/description-review-campaign.json'),
    'originalRoundAInput': bind(T / 'native-five/round-a/description-review-input.json'),
    'originalWholeBookPDF': bind(T / 'native-five/bundle/book.pdf'),
    'actualOwnOutlineAndFivePageRendersViewed': [bind(p) for p in sorted((O / 'renders').iterdir())],
    'originalFiveScientificRecords': bind(records_path),
    'provenance': bind(O / 'PROVENANCE.actual-native5-D-A-prior-gates-disclosed-current-D-blind.json'),
    'newWholeCourseSource_M6_M7OrHumanApproval': False,
})
print(json.dumps({'firstScienceSeal': bind(O / 'FIRST-SCIENCE-SEAL.current412-five-whole-native-pages-independent-a.actual.json'), 'records': bind(records_path), 'scienceCompletedAtUTC': ended}, indent=2))
