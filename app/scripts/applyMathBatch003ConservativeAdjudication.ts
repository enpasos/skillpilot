import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  rationaleAll: 'docs/qa-ci/status/goal-source-rationales-math-all-relevant.json',
  rationalePublic: 'app/public/data/goal-source-rationales-math-public.json',
  roundARecords: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-26/batch-003-j6-landscape-order-20/round-a/results/mathematik-rollout-v1-batch-003-j6-landscape-order-20-20260826-first-pass-a.batch-001.records.jsonl',
  evidenceConfig: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-003-current-main-17-v1.config.json',
  evidenceCandidates: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-003-current-main-17-v1.candidates.json',
  evidenceReview: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-003-current-main-17-v1.review.jsonl',
} as const

const evidenceIds = [
  'ee48e811-4c9c-5080-9836-8403fc9f0810',
  '26f668a0-6425-5466-9cf7-6295dd189005',
  '0a6dab2e-1bbb-5587-adb0-456d3991c327',
  '05012547-7263-5bfa-9e7c-df970745a011',
  'b41cb496-dad5-596e-9c23-cdcbdab3ec2e',
  '491e0858-e977-516e-a339-1cc2f9e9690f',
  '87c55be5-06a9-41e2-a0d4-c60f7c8b8078',
  'b44f038c-fb1f-527e-b9ad-382214d0328a',
  '57fbbf31-9b8c-5408-9af5-fbc73acd12bb',
  '71d43fcc-d787-4874-ae4a-2336364e9c0a',
  '72b6bfa5-8e34-4029-8f85-0277207c485e',
  '91571d3f-3651-4477-ba21-320fc4077453',
  'acbb7e26-f85f-405b-a3e5-affa6add6711',
  '15505229-efec-4d01-8e71-acf15f9c2424',
  '8a691345-3216-522c-a898-d65e8e94db28',
  'c823b5a2-82e3-5e22-9c27-c0f41cc5eac6',
  '11c88ea2-8502-5008-bec2-3e491c75ace4',
] as const

const protectedSemanticFingerprints: Record<string, string> = {
  'ee48e811-4c9c-5080-9836-8403fc9f0810': 'sha256:d9252acf81dce4baa84e213a3b263262f06ec9116770952e02a706b184cf4e49',
  '05012547-7263-5bfa-9e7c-df970745a011': 'sha256:f8ebecfe8ae4964f6ecd0d278c0588bda89d3ffdaecbc60cc0659caec8ac978a',
  'b41cb496-dad5-596e-9c23-cdcbdab3ec2e': 'sha256:8ac469ebd57a799de9c9149314a51f1b1097f325665bb266bd70d58033db8f09',
  '491e0858-e977-516e-a339-1cc2f9e9690f': 'sha256:384bfab4640c6300d156874dc17881d35224fcc53422e3b5d9144386409bb403',
  '87c55be5-06a9-41e2-a0d4-c60f7c8b8078': 'sha256:fdd916721253aa567fa0567bb116ee5e8bbd17da1b2e6f2c83973e211d96bc36',
  '57fbbf31-9b8c-5408-9af5-fbc73acd12bb': 'sha256:1b215ed6544b91e5e5bc3cf15c4e2001333d8e6e6f923684bae6bf1fc254b0d3',
  '71d43fcc-d787-4874-ae4a-2336364e9c0a': 'sha256:0c4ad8431b5eb0446c5579cc012a1772d850fade4ca70756cd323c181e7f957f',
  '72b6bfa5-8e34-4029-8f85-0277207c485e': 'sha256:5de57a2aa8887f55736d3b1e5cdad583a3222fab669cfe0ab300c18643b063bc',
  '91571d3f-3651-4477-ba21-320fc4077453': 'sha256:1cd58109f267caf949fae2b8c7268d6afa72db4c4ca4a874f8e130bc1532e3f5',
  'acbb7e26-f85f-405b-a3e5-affa6add6711': 'sha256:4134de127320aa1012914e9f50c93747c0b211f26c8e0a389b63e9dd9ab1e73c',
  '15505229-efec-4d01-8e71-acf15f9c2424': 'sha256:66352c5cbce1d1bb1b6c55ea71a73aa5b86a1a779d2683a54e7a906c2fe2e70e',
  '8a691345-3216-522c-a898-d65e8e94db28': 'sha256:898faa7df5639f61e8f5961dfa71720a0ba42e334ebb47800f8c0235ce2d154b',
  'c823b5a2-82e3-5e22-9c27-c0f41cc5eac6': 'sha256:152b8ffe37aee41f0154b042cdd94498fee66e6108c2e82b47cc71a881552eca',
  '11c88ea2-8502-5008-bec2-3e491c75ace4': 'sha256:6749d532bfe9286d62b75e1ae3c16e93647669be79dee198435fcbe15917d649',
  '1f89d69e-ead1-424b-8221-fae37fdea2bc': 'sha256:6c55ef7b64df27f8d6fb2473748c501037aebc68fb9e0b04271d12305a885e74',
  '1335dff9-db1e-5dd6-aa55-3938b6d3b0ec': 'sha256:dd93ad276481df95ea0d2034a475fc15350e3ff48a489ce32dffc84a9a5da2ba',
  '59098969-0a35-5a58-94f2-1cfcdf191cf5': 'sha256:7633e17c7d645812536109fa8091283f919c06ccdc399c71e23eef19b073870e',
}

const revisions: Record<string, JsonRecord> = {
  '26f668a0-6425-5466-9cf7-6295dd189005': {
    description: 'Die lernende Person kann Potenzen mit rationalen Basen berechnen, negative ganzzahlige Exponenten als Kehrwertschreibweisen deuten und Darstellungen sehr kleiner Größen mit negativen Zehnerpotenzen in Sachzusammenhängen interpretieren.',
    descriptionEn: 'The learner can compute powers with rational bases, interpret negative integer exponents as reciprocal forms, and interpret representations of very small quantities using negative powers of ten in contextual situations.',
    atomicityReason: 'Berechnen, Kehrwertdeutung und Kontextinterpretation sind Ausprägungen derselben zusammenhängenden Potenzkompetenz zu rationalen Basen und negativen ganzzahligen Exponenten.',
    memoryReason: 'Kehrwertbedeutung und negative Zehnerpotenzen werden durch Herleiten, Berechnen und Kontextdeutung verstanden; ein separates Memory-Deck ist nicht erforderlich.',
  },
  '0a6dab2e-1bbb-5587-adb0-456d3991c327': {
    description: 'Die lernende Person kann die durch Grundrechenarten und Klammern bestimmte Struktur von Termen mit nicht ganzen rationalen Zahlen, insbesondere Brüchen und Dezimalzahlen, erkennen und fachsprachlich beschreiben, diese Terme strukturiert auswerten und die Rechenschritte nachvollziehbar notieren.',
    descriptionEn: 'The learner can recognise and describe in appropriate mathematical language the structure of expressions with non-integer rational numbers, especially fractions and decimals, as determined by basic operations and brackets, evaluate these expressions systematically, and record the calculation steps clearly.',
    atomicityReason: 'Struktur erkennen und beschreiben, die daraus folgende Auswertungsreihenfolge anwenden und die Schritte notieren sind Phasen derselben strukturgerechten Termauswertung.',
    memoryReason: 'Termstruktur und Auswertungsreihenfolge müssen an wechselnden Termen erkannt, erklärt und angewendet werden; ein separates Memory-Deck ist nicht erforderlich.',
  },
  'b44f038c-fb1f-527e-b9ad-382214d0328a': {
    titleEn: 'Explain why the cuboid volume formula is plausible using unit cubes',
    description: 'Die lernende Person kann die Volumenformel des Quaders mithilfe von Einheitswürfeln oder Messvorstellungen plausibilisieren.',
    descriptionEn: 'The learner can explain why the cuboid volume formula is plausible using unit cubes or measurement concepts.',
    atomicityReason: 'Das Schichten- oder Messmodell dient genau einer Kompetenz: die Volumenformel des Quaders plausibel zu erklären.',
    memoryReason: 'Die Quaderformel wird über Einheitswürfel, Schichten und Messvorstellungen plausibilisiert; ein separates Memory-Deck ist nicht erforderlich.',
  },
}

type Seed = {
  archetype: 'concept' | 'procedure' | 'representation' | 'modeling' | 'proof' | 'data'
  axes: [[string, string], [string, string]]
  direct: [string, string]
  transfer: [string, string]
}

const seeds: Record<string, Seed> = {
  'ee48e811-4c9c-5080-9836-8403fc9f0810': { archetype: 'procedure', axes: [['Bruch-, Dezimal- und gemischte Darstellung', 'Fraction, decimal, and mixed representations'], ['Multiplikations- oder Divisionskontext mit wechselnden Vorzeichen', 'Multiplication or division contexts with varying signs']], direct: ['Berechne ein Produkt und einen Quotienten mit gemischten Bruch- und Dezimaldarstellungen; begründe Darstellung, Operationsvorstellung und Rechenvorteil.', 'Calculate a product and a quotient using mixed fraction and decimal representations; justify the representation, operation concept, and calculation advantage.'], transfer: ['Modelliere eine neue Skalierungs- oder Aufteilsituation mit negativen rationalen Werten und deute das Ergebnis im Kontext.', 'Model a new scaling or sharing situation with negative rational values and interpret the result in context.'] },
  '26f668a0-6425-5466-9cf7-6295dd189005': { archetype: 'concept', axes: [['Positive und negative rationale Basis mit expliziten Klammern', 'Positive and negative rational bases with explicit brackets'], ['Reine Potenzrechnung oder sehr kleine kontextgebundene Größe', 'Pure power calculation or a very small contextual quantity']], direct: ['Berechne (-3/4)^(-2), schreibe die Potenz als Kehrwert um und begründe jeden Schritt einschließlich der Klammerwirkung.', 'Calculate (-3/4)^(-2), rewrite the power as a reciprocal, and justify each step including the role of brackets.'], transfer: ['Ordne 2.5·10^(-7) m einer Dezimaldarstellung und einer plausiblen Größenordnung zu und erkläre die Bedeutung des negativen Exponenten.', 'Match 2.5·10^(-7) m to a decimal representation and plausible order of magnitude, and explain the meaning of the negative exponent.'] },
  '0a6dab2e-1bbb-5587-adb0-456d3991c327': { archetype: 'procedure', axes: [['Einfach oder mehrfach verschachtelte Klammerstruktur', 'Simple or multiply nested bracket structure'], ['Bruch-, Dezimal- oder gemischte Darstellung', 'Fraction, decimal, or mixed representation']], direct: ['Gliedere einen neuen Term mit Brüchen, Dezimalzahlen und verschachtelten Klammern in Teilterme, beschreibe die Struktur und werte ihn schrittweise aus.', 'Parse a new expression with fractions, decimals, and nested brackets into subexpressions, describe its structure, and evaluate it step by step.'], transfer: ['Vergleiche zwei fast gleiche Terme mit unterschiedlich gesetzten Klammern, sage den Einfluss auf die Auswertungsfolge voraus und prüfe beide Werte.', 'Compare two nearly identical expressions with differently placed brackets, predict the effect on evaluation order, and check both values.'] },
  '05012547-7263-5bfa-9e7c-df970745a011': { archetype: 'procedure', axes: [['Kommutativ-, Assoziativ- oder Distributivgesetz', 'Commutative, associative, or distributive law'], ['Vereinfachen, vorteilhaft rechnen oder Gleichwertigkeit prüfen', 'Simplifying, calculating efficiently, or checking equivalence']], direct: ['Vereinfache 3/4·(8/3-4/3) auf zwei Wegen und benenne das jeweils verwendete Rechengesetz.', 'Simplify 3/4·(8/3-4/3) in two ways and name the arithmetic law used in each.'], transfer: ['Konstruiere zu einem neuen rationalen Term eine gleichwertige, leichter berechenbare Form und begründe die Werterhaltung jeder Umformung.', 'Construct an equivalent, easier-to-calculate form of a new rational expression and justify value preservation at every transformation.'] },
  'b41cb496-dad5-596e-9c23-cdcbdab3ec2e': { archetype: 'modeling', axes: [['Anteil einer Ausgangsmenge oder Anteil eines Anteils', 'Fraction of an initial quantity or fraction of a fraction'], ['Direkte Bezugsgröße oder wechselnde Bezugsgröße nach einem Rest', 'Direct reference quantity or changing reference quantity after a remainder']], direct: ['Modelliere, welcher Anteil einer Klasse gleichzeitig zwei nacheinander beschriebenen Teilgruppen angehört, und deute Zähler, Nenner und Ergebnis.', 'Model what fraction of a class belongs to two successively described subgroups and interpret numerator, denominator, and result.'], transfer: ['Löse eine neue Aufgabe, in der zuerst ein Anteil entnommen und anschließend ein Anteil des Restes verwendet wird; kennzeichne jede Bezugsgröße.', 'Solve a new problem in which a fraction is removed and then a fraction of the remainder is used; identify every reference quantity.'] },
  '491e0858-e977-516e-a339-1cc2f9e9690f': { archetype: 'proof', axes: [['Zerlegen, Verschieben oder Ergänzen', 'Decomposing, moving, or completing'], ['Parallelogramm, Dreieck oder Trapez in wechselnder Lage', 'Parallelogram, triangle, or trapezoid in varying orientation']], direct: ['Leite die Parallelogramm- und Dreiecksformel aus einem Rechteck her und begründe die Flächenerhaltung ohne Überlappung oder Lücke.', 'Derive the parallelogram and triangle formulas from a rectangle and justify area preservation without overlap or gaps.'], transfer: ['Entwickle für ein gedrehtes Trapez eine eigene Ergänzung oder Zerlegung und leite daraus die Formel mit der zugehörigen senkrechten Höhe her.', 'Develop a completion or decomposition for a rotated trapezoid and derive its formula using the corresponding perpendicular height.'] },
  '87c55be5-06a9-41e2-a0d4-c60f7c8b8078': { archetype: 'procedure', axes: [['Einzelfigur oder zusammengesetzte Figur', 'Single figure or composite figure'], ['Direkte Formel, Zerlegung oder Ergänzung', 'Direct formula, decomposition, or completion']], direct: ['Berechne die Fläche eines Trapezes aus parallelen Seiten und senkrechter Höhe und begründe Formel sowie Quadrateinheit.', 'Calculate the area of a trapezoid from its parallel sides and perpendicular height and justify the formula and square unit.'], transfer: ['Bestimme die Fläche einer neuen gedrehten zusammengesetzten Figur durch eine selbst gewählte Zerlegung oder Ergänzung und prüfe die Größenordnung.', 'Determine the area of a new rotated composite figure using a self-chosen decomposition or completion and check the order of magnitude.'] },
  'b44f038c-fb1f-527e-b9ad-382214d0328a': { archetype: 'concept', axes: [['Einheitswürfel zählen oder Schichten messen', 'Counting unit cubes or measuring layers'], ['Ganzzahlige oder veränderte Kantenlängen und Einheiten', 'Integer or changed edge lengths and units']], direct: ['Erkläre an einem 4-mal-3-mal-5-Quader, wie Würfel pro Schicht und Schichtzahl zur Formel V=l·b·h führen.', 'For a 4-by-3-by-5 cuboid, explain how cubes per layer and number of layers lead to V=l·w·h.'], transfer: ['Übertrage das Schichtenmodell auf einen anders orientierten Quader in einer anderen Längeneinheit und erkläre, warum dieselbe Produktstruktur gilt.', 'Transfer the layer model to a differently oriented cuboid in another length unit and explain why the same product structure applies.'] },
  '57fbbf31-9b8c-5408-9af5-fbc73acd12bb': { archetype: 'representation', axes: [['Kubische Längeneinheiten oder Liter und Milliliter', 'Cubic length units or litres and millilitres'], ['Räumliche Herleitung oder Größenbezug', 'Spatial derivation or quantity reference']], direct: ['Leite mit einem in Millimeterwürfel unterteilten Zentimeterwürfel her, warum 1 cm³=1000 mm³, und rechne ein Beispiel um.', 'Use a centimetre cube subdivided into millimetre cubes to derive why 1 cm³=1000 mm³, then convert an example.'], transfer: ['Entscheide für ein neues Gefäßproblem zwischen cm³, dm³, ml und l, leite den Umrechnungsfaktor ab und prüfe die Größenordnung.', 'For a new container problem, choose among cm³, dm³, ml, and l, derive the conversion factor, and check the order of magnitude.'] },
  '71d43fcc-d787-4874-ae4a-2336364e9c0a': { archetype: 'modeling', axes: [['Prozentwert, Grundwert oder Prozentsatz gesucht', 'Percentage amount, base value, or percentage rate unknown'], ['Grundgleichung oder Schlussrechnung', 'Basic percentage equation or rule-of-three reasoning']], direct: ['Bestimme bei einem Rabattproblem Grundwert, Prozentsatz und Prozentwert, löse es mit einem begründeten Verfahren und deute den Zahlbetrag.', 'In a discount problem, identify base value, rate, and percentage amount, solve with a justified method, and interpret the monetary result.'], transfer: ['Rekonstruiere aus einem neuen Zins- oder Preisproblem mit anderer gesuchter Größe die Prozentbeziehung und prüfe das Ergebnis am Kontext.', 'For a new interest or price problem with a different unknown, reconstruct the percentage relationship and check the result against the context.'] },
  '72b6bfa5-8e34-4029-8f85-0277207c485e': { archetype: 'data', axes: [['Prozent, Prozentpunkte oder alternative Anteilssprache', 'Percent, percentage points, or alternative fraction language'], ['Konstante oder veränderte Bezugsgruppe', 'Fixed or changed reference group']], direct: ['Prüfe einen Text, der einen Anstieg von 40 % auf 50 % als „10 Prozent mehr“ bezeichnet, und unterscheide Prozent von Prozentpunkten.', 'Check a text that describes an increase from 40% to 50% as “10 percent more,” distinguishing percent from percentage points.'], transfer: ['Übersetze eine neue Aussage wie „drei von fünf“ in Bruch und Prozent und beurteile sie bei veränderter Bezugsgruppe.', 'Translate a new claim such as “three out of five” into a fraction and percentage and assess it with a changed reference group.'] },
  '91571d3f-3651-4477-ba21-320fc4077453': { archetype: 'data', axes: [['Absolute oder relative Häufigkeit in drei Zahlendarstellungen', 'Absolute or relative frequency in three number representations'], ['Tabelle oder geeignete grafische Darstellung', 'Table or suitable graphical representation']], direct: ['Bestimme aus einer neuen Umfrage absolute und relative Häufigkeiten, wechsle zwischen Bruch, Dezimalzahl und Prozent und erstelle eine Tabelle.', 'From a new survey, determine absolute and relative frequencies, convert among fraction, decimal, and percent, and create a table.'], transfer: ['Wähle für eine Erhebung mit anderer Stichprobengröße und Kategorienstruktur eine passende Grafik, stelle die Daten dar und begründe die Wahl.', 'For a survey with a different sample size and category structure, choose a suitable graph, represent the data, and justify the choice.'] },
  'acbb7e26-f85f-405b-a3e5-affa6add6711': { archetype: 'data', axes: [['Achsenbeginn, Skalierung oder Diagrammtyp', 'Axis baseline, scale, or chart type'], ['Daten entnehmen, Aussage prüfen oder Manipulation erklären', 'Extracting data, checking a claim, or explaining manipulation']], direct: ['Analysiere ein Balkendiagramm mit abgeschnittener Achse, formuliere prüfbare Fragen und erkläre die visuelle Übertreibung anhand der Daten.', 'Analyze a bar chart with a truncated axis, formulate testable questions, and explain the visual exaggeration using the data.'], transfer: ['Vergleiche dieselben neuen Daten in zwei Diagrammtypen oder Skalierungen und beurteile, welche Schlussfolgerungen jeweils gerechtfertigt sind.', 'Compare the same new data in two chart types or scales and judge which conclusions are justified in each.'] },
  '15505229-efec-4d01-8e71-acf15f9c2424': { archetype: 'data', axes: [['Handrechnung oder Tabellenkalkulation', 'Manual calculation or spreadsheet'], ['Ausgeglichener Datensatz oder Datensatz mit verändertem Extremwert', 'Balanced data set or one with a changed extreme value']], direct: ['Berechne den Mittelwert eines Datensatzes, deute ihn als gleichmäßige Verteilung der Gesamtsumme und prüfe seine Größenordnung.', 'Calculate the mean of a data set, interpret it as equal redistribution of the total, and check its order of magnitude.'], transfer: ['Sage voraus, wie ein neuer Extremwert oder zusätzlicher Datenwert den Mittelwert verändert, prüfe rechnerisch und deute den neuen Wert.', 'Predict how a new extreme or additional data value changes the mean, verify by calculation, and interpret the new value.'] },
  '8a691345-3216-522c-a898-d65e8e94db28': { archetype: 'concept', axes: [['Mehrere gemessene Kreise oder idealisierte Maße', 'Several measured circles or idealized measurements'], ['Direktes Verhältnis oder skalierter Transfer', 'Direct ratio or scaled transfer']], direct: ['Miss Umfang und Durchmesser mehrerer verschieden großer Kreise, vergleiche die Quotienten und erkläre die annähernde Konstanz.', 'Measure circumference and diameter of several differently sized circles, compare the quotients, and explain their approximate constancy.'], transfer: ['Bestimme bei einem Kreis in neuem Maßstab aus einem gegebenen Maß das andere und erkläre Messabweichungen vom Verhältnis Pi.', 'For a circle at a new scale, determine one measure from the other and explain measurement deviations from the ratio pi.'] },
  'c823b5a2-82e3-5e22-9c27-c0f41cc5eac6': { archetype: 'concept', axes: [['Modell, Zeichnung oder Alltagsgegenstand', 'Model, drawing, or everyday object'], ['Offene, gekrümmte oder polygonale Begrenzungsmerkmale', 'Open, curved, or polygonal boundary features']], direct: ['Ordne gemischte Modelle den sieben Körperarten zu und begründe jede Zuordnung mit unterscheidenden Flächen-, Kanten- oder Spitzenmerkmalen.', 'Classify mixed models as the seven types of solids and justify each classification using distinguishing face, edge, or vertex features.'], transfer: ['Erkenne gedrehte oder teilweise verdeckte Alltagsmodelle, grenze ähnliche Körper ab und benenne die invarianten Merkmale.', 'Identify rotated or partly obscured everyday models, distinguish similar solids, and name the invariant features.'] },
  '11c88ea2-8502-5008-bec2-3e491c75ace4': { archetype: 'representation', axes: [['Netz, Schrägbild oder räumliches Modell', 'Net, oblique drawing, or spatial model'], ['Vollständige, gedrehte oder unvollständige Darstellung', 'Complete, rotated, or incomplete representation']], direct: ['Ordne einem geraden Körper ein passendes Netz, Schrägbild und Modell zu und erläutere Flächen-, Kanten- und Maßentsprechungen.', 'Match a right solid to a corresponding net, oblique drawing, and model and explain face, edge, and dimension correspondences.'], transfer: ['Erschließe aus einer gedrehten oder unvollständigen Darstellung fehlende Nachbarschaften und identifiziere begründet die passende andere Darstellungsform.', 'Infer missing adjacencies from a rotated or incomplete representation and identify the matching alternative representation with justification.'] },
}

const evidenceOverrides: Record<string, JsonRecord> = {
  'b44f038c-fb1f-527e-b9ad-382214d0328a': {
    essentialUnderstandingDe: 'Ein Quader lässt sich in Schichten gleich großer Einheitswürfel aufbauen; die Anzahl der Würfel pro Schicht und die Zahl der Schichten führen zum Produkt aus Länge, Breite und Höhe.',
    essentialUnderstandingEn: 'A cuboid can be built from layers of equal unit cubes; the number of cubes in each layer and the number of layers lead to the product of length, width, and height.',
    observablePerformanceDe: 'Die lernende Person stellt einen Quader durch Einheitswürfel, Schichten oder eine Messvorstellung dar, erklärt den Übergang von der Würfelanzahl zu Länge mal Breite mal Höhe und begründet daran die Plausibilität der Formel.',
    observablePerformanceEn: 'The learner represents a cuboid using unit cubes, layers, or a measurement model, explains the transition from counting cubes to length times width times height, and uses this to explain why the formula is plausible.',
    transferExpectationDe: 'Für einen anders dimensionierten oder anders orientierten Quader überträgt die lernende Person das Schichtenmodell und erklärt, warum dieselbe Produktstruktur gilt.',
    transferExpectationEn: 'For a cuboid with different dimensions or orientation, the learner transfers the layer model and explains why the same product structure applies.',
  },
}

const abs = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(abs(path), 'utf8'))
const readJsonl = (path: string): JsonRecord[] => readFileSync(abs(path), 'utf8').split(/\r?\n/u).filter((line) => line.trim()).map((line) => JSON.parse(line))
const writeJson = (path: string, value: unknown): void => writeFileSync(abs(path), `${JSON.stringify(value, null, 2)}\n`)
const writeJsonl = (path: string, values: JsonRecord[]): void => writeFileSync(abs(path), `${values.map((value) => JSON.stringify(value)).join('\n')}\n`)
const sha256 = (value: string): string => `sha256:${createHash('sha256').update(value).digest('hex')}`
const semanticFingerprint = (goal: JsonRecord): string => sha256(JSON.stringify([goal.title, goal.titleEn, goal.description, goal.descriptionEn]))
const normalizeText = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord).sort(([a], [b]) => a.localeCompare(b)).map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value)
}
const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => sha256(stableJson({
  ruleVersion,
  goalId: goal.id,
  shortKey: goal.shortKey ?? '',
  title: normalizeText(goal.title),
  titleEn: normalizeText(goal.titleEn),
  description: normalizeText(goal.description),
  descriptionEn: normalizeText(goal.descriptionEn),
  phase: normalizeText(goal.dimensionTags?.phase),
  area: normalizeText(goal.dimensionTags?.area),
  topicCode: normalizeText(goal.dimensionTags?.topicCode),
  nodeKind: normalizeText(goal.nodeKind),
}))

function assertProtectedGoals(landscape: JsonRecord): void {
  const byId = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  for (const [id, expected] of Object.entries(protectedSemanticFingerprints)) {
    const goal = byId.get(id)
    if (!goal || semanticFingerprint(goal) !== expected) throw new Error(`Protected KEEP/SPLIT goal text drifted: ${id}`)
  }
}

function buildCanonical(): JsonRecord {
  const landscape = readJson(paths.canonical)
  assertProtectedGoals(landscape)
  const byId = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  for (const [id, revision] of Object.entries(revisions)) {
    const goal = byId.get(id)
    if (!goal) throw new Error(`Missing revised goal ${id}`)
    if (revision.titleEn) goal.titleEn = revision.titleEn
    goal.description = revision.description
    goal.descriptionEn = revision.descriptionEn
    for (const link of goal.resourceLinks ?? []) {
      if (link.type !== 'goal-visualization') continue
      link.altText = `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description}`
    }
  }
  assertProtectedGoals(landscape)
  return landscape
}

function buildSemanticKinds(landscape: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goals = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  for (const id of Object.keys(revisions)) {
    const goal = goals.get(id)
    const decision = (ledger.decisions as JsonRecord[]).find((entry) => entry.goalId === id)
    if (!goal || !decision || decision.semanticKind !== 'curricularAtomic') throw new Error(`Missing curricularAtomic semantic-kind binding: ${id}`)
    decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  }
  return ledger
}

function buildReviewLedger(landscape: JsonRecord, path: string, ruleVersion: string): JsonRecord[] {
  const records = readJsonl(path)
  const goals = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  for (const [id, revision] of Object.entries(revisions)) {
    const goal = goals.get(id)
    const record = records.find((entry) => entry.goalId === id)
    if (!goal || !record) throw new Error(`Missing ${ruleVersion} record: ${id}`)
    record.fingerprint = reviewFingerprint(goal, ruleVersion)
    record.reviewedAt = '2026-08-26'
    record.reviewer = 'codex-math-batch-003-conservative-adjudication-2026-08-26'
    record.reason = ruleVersion === 'semantic-atomicity-v1' ? revision.atomicityReason : revision.memoryReason
    if (ruleVersion === 'semantic-atomicity-v1') Object.assign(record, { status: 'atomic', semanticAtomic: true, suggestedSplit: [] })
    else Object.assign(record, { status: 'no_memory_needed', memoryUseful: false })
  }
  return records
}

function buildVisualizationQa(landscape: JsonRecord): JsonRecord {
  const qa = readJson(paths.visualizationQa)
  const goals = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  for (const id of Object.keys(revisions)) {
    const goal = goals.get(id)
    const record = (qa.records as JsonRecord[]).find((entry) => entry.goalId === id)
    if (!goal || !record) throw new Error(`Missing visualization QA record: ${id}`)
    record.description = goal.description
  }
  return qa
}

function buildRationaleIndex(path: string, landscape: JsonRecord): JsonRecord {
  const index = readJson(path)
  const goals = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  for (const id of Object.keys(revisions)) {
    const goal = goals.get(id)
    const items = (index.items as JsonRecord[]).filter((item) => item.goal?.id === id)
    if (!goal || items.length !== 1) throw new Error(`${path}: expected one text-bound item for ${id}`)
    items[0].goal.title = goal.title
    items[0].goal.description = goal.description
    const titles = items[0].goal.pathTitles as string[]
    if (Array.isArray(titles) && titles.length > 0) titles[titles.length - 1] = goal.title
  }
  return index
}

const promptFiles: Record<string, string[]> = {
  '26f668a0-6425-5466-9cf7-6295dd189005': ['prompt.de.md', 'image-reconstruction-prompt.de.md'],
  '0a6dab2e-1bbb-5587-adb0-456d3991c327': ['prompt.de.md'],
  'b44f038c-fb1f-527e-b9ad-382214d0328a': ['prompt.de.md'],
}

function buildPrompts(landscape: JsonRecord): Map<string, string> {
  const result = new Map<string, string>()
  const goals = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  for (const [id, files] of Object.entries(promptFiles)) {
    const goal = goals.get(id)!
    for (const file of files) {
      const path = `curricula/DE/Gymnasium/visualizations/mathematik/${id}/${file}`
      let bytes = readFileSync(abs(path), 'utf8')
      const descriptionLines = bytes.split(/\r?\n/u).filter((line) => line.startsWith('- Beschreibung: ') || line.startsWith('Beschreibung: '))
      if (descriptionLines.length === 0) throw new Error(`No text-bound description lines in ${path}`)
      for (const line of descriptionLines) bytes = bytes.replace(line, `${line.startsWith('- ') ? '- ' : ''}Beschreibung: ${goal.description}`)
      result.set(path, bytes)
    }
  }
  return result
}

function buildEvidencePackage(): { config: JsonRecord, candidates: JsonRecord } {
  const reviews = new Map(readJsonl(paths.roundARecords).map((record) => [record.goalId, record]))
  const goals = evidenceIds.map((goalId) => {
    const review = reviews.get(goalId)
    const evidence = evidenceOverrides[goalId] ?? review?.understandingEvidence
    const seed = seeds[goalId]
    if (!evidence || !seed) throw new Error(`Missing evidence seed for ${goalId}`)
    const expectations = [
      {
        id: 'essential-understanding',
        essentialUnderstandingDe: evidence.essentialUnderstandingDe,
        essentialUnderstandingEn: evidence.essentialUnderstandingEn,
        observablePerformanceDe: evidence.observablePerformanceDe,
        observablePerformanceEn: evidence.observablePerformanceEn,
      },
      {
        id: 'independent-transfer',
        essentialUnderstandingDe: `Das Verständnis bleibt bei veränderten Daten, Darstellungen oder Kontexten tragfähig: ${evidence.transferExpectationDe}`,
        essentialUnderstandingEn: `The understanding remains valid with changed data, representations, or contexts: ${evidence.transferExpectationEn}`,
        observablePerformanceDe: evidence.transferExpectationDe,
        observablePerformanceEn: evidence.transferExpectationEn,
      },
    ]
    return {
      goalId,
      reason: 'DE: Inhaltsspezifischer aktueller KI-Kandidat mit zwei unabhängigen Demonstrationen und explizitem Transfer; keine menschliche Freigabe und kein Review-Lauf werden behauptet. EN: Content-specific current AI candidate with two independent demonstrations and explicit transfer; no human approval or review run is claimed.',
      profile: {
        archetype: seed.archetype,
        expectations,
        coverageExpectations: {
          requiredExpectationIds: expectations.map(({ id }) => id),
          alternativeExpectationGroups: [],
          minimumIndependentDemonstrations: 2,
          freshVariationRequired: true,
          independentTransferRequired: true,
        },
        variationAxes: seed.axes.map(([textDe, textEn], index) => ({ id: `variation-${index + 1}`, textDe, textEn })),
        applicationCaseBriefs: [
          {
            id: 'independent-demonstration',
            taskDemandDe: seed.direct[0],
            taskDemandEn: seed.direct[1],
            expectedPerformanceDe: evidence.observablePerformanceDe,
            expectedPerformanceEn: evidence.observablePerformanceEn,
            understandingFocusDe: evidence.essentialUnderstandingDe,
            understandingFocusEn: evidence.essentialUnderstandingEn,
          },
          {
            id: 'fresh-transfer',
            taskDemandDe: seed.transfer[0],
            taskDemandEn: seed.transfer[1],
            expectedPerformanceDe: evidence.transferExpectationDe,
            expectedPerformanceEn: evidence.transferExpectationEn,
            understandingFocusDe: `Transfer der fachlichen Struktur auf die ausdrücklich veränderte Aufgabe: ${evidence.essentialUnderstandingDe}`,
            understandingFocusEn: `Transfer of the subject-specific structure to the explicitly varied task: ${evidence.essentialUnderstandingEn}`,
          },
        ],
      },
    }
  })
  const reviewId = 'canonical-math-positive-understanding-evidence-rollout-v1-batch-003-current-main-17-v1'
  return {
    config: {
      $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
      schemaVersion: 2,
      reviewId,
      goalFingerprintRuleVersion: 'goal-evidence-v1',
      profileRuleVersion: 'positive-understanding-evidence-v2',
      landscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',
      landscapePath: paths.canonical,
      semanticKindLedgerPath: paths.semanticKinds,
      reviewCriteriaPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-positive-understanding-evidence-profile-criteria-v2.md',
      reviewPath: paths.evidenceReview,
      reviewRunManifestPaths: [],
      reviewedResourceTypes: [],
      requireApproved: false,
      scope: { label: 'Current AI candidate profiles for the 17 non-structurally affected Mathematik Batch-003 goals', goalIds: [...evidenceIds] },
    },
    candidates: {
      schemaVersion: 1,
      authoringContract: 'positive-understanding-evidence-candidates-v1',
      reviewId,
      reviewedAt: '2026-08-26T12:00:00.000Z',
      reviewer: 'codex-math-batch-003-current-main-17-ai-candidate-2026-08-26',
      goals,
    },
  }
}

function verifyOrWriteJson(path: string, value: JsonRecord): void {
  const expected = `${JSON.stringify(value, null, 2)}\n`
  if (writeMode) writeFileSync(abs(path), expected)
  else if (existsSync(abs(path)) && readFileSync(abs(path), 'utf8') !== expected) throw new Error(`Generated package drift: ${path}`)
}

const canonical = buildCanonical()
const semanticKinds = buildSemanticKinds(canonical)
const atomicity = buildReviewLedger(canonical, paths.atomicity, 'semantic-atomicity-v1')
const memory = buildReviewLedger(canonical, paths.memory, 'memory-card-review-v1')
const visualizationQa = buildVisualizationQa(canonical)
const rationaleAll = buildRationaleIndex(paths.rationaleAll, canonical)
const rationalePublic = buildRationaleIndex(paths.rationalePublic, canonical)
const prompts = buildPrompts(canonical)
const evidence = buildEvidencePackage()

if (writeMode) {
  writeJson(paths.canonical, canonical)
  writeJson(paths.semanticKinds, semanticKinds)
  writeJsonl(paths.atomicity, atomicity)
  writeJsonl(paths.memory, memory)
  writeJson(paths.visualizationQa, visualizationQa)
  writeJson(paths.rationaleAll, rationaleAll)
  writeJson(paths.rationalePublic, rationalePublic)
  for (const [path, bytes] of prompts) writeFileSync(abs(path), bytes)
}
verifyOrWriteJson(paths.evidenceConfig, evidence.config)
verifyOrWriteJson(paths.evidenceCandidates, evidence.candidates)

console.log(`CHECK apply_math_batch_003_conservative_adjudication ${writeMode ? 'WRITE' : 'PASS'} revisions=3 unchanged=14 splitUntouched=3 evidenceCandidates=17 prompts=4 rationaleIndexes=2 curricularAtomic=786`)
