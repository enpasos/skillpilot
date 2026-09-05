import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import type { PositiveGoalEvidenceProfile } from './positiveGoalEvidenceProfileModel'
import {
  reviewPositiveGoalEvidenceConfig,
  type PositiveGoalEvidenceReviewConfig,
} from './positiveGoalEvidenceReview'

type JsonRecord = Record<string, unknown>
type UnderstandingEvidence = {
  essentialUnderstandingDe: string
  essentialUnderstandingEn: string
  observablePerformanceDe: string
  observablePerformanceEn: string
  transferExpectationDe: string
  transferExpectationEn: string
}
type ProfileSpec = {
  archetype: PositiveGoalEvidenceProfile['archetype']
  axes: PositiveGoalEvidenceProfile['variationAxes']
  cases: PositiveGoalEvidenceProfile['applicationCaseBriefs']
}

const repositoryRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unknownArguments.length > 0) throw new Error(`Unknown arguments: ${unknownArguments.join(', ')}`)

const batchDirectory = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-032-atlas-next-20-v1'
const resolutionIndexPath = `${batchDirectory}/resolution-index.stable-current-carryover-16-v1.json`
const roundARecordsPath = `${batchDirectory}/round-a/results/mathematik-rollout-v1-batch-032-atlas-next-20-v1-20260905-first-pass-a.batch-001.records.jsonl`
const roundBRecordsPath = `${batchDirectory}/round-b/results/mathematik-rollout-v1-batch-032-atlas-next-20-v1-20260905-first-pass-b.batch-001.records.jsonl`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const criteriaPath = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-positive-understanding-evidence-profile-criteria-v2.md'
const artifactRoot = 'curricula/DE/Gymnasium/quality/goal-evidence'
const artifactStem = 'canonical-math-positive-understanding-evidence-rollout-v1-batch-032-stable-current-carryover-16-v1'
const configPath = `${artifactRoot}/${artifactStem}.config.json`
const candidatesPath = `${artifactRoot}/${artifactStem}.candidates.json`
const reviewPath = `${artifactRoot}/${artifactStem}.review.jsonl`
const reviewId = 'canonical-math-positive-evidence-v1-b032-stable-current-carryover-16-v1'
const landscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const reviewedAt = '2026-09-05T23:10:00.000Z'
const reviewer = 'codex-math-b032-stable16-positive-understanding-candidate-2026-09-05'

const goalIds = [
  '6596405a-9728-41df-9163-53670ec2a937',
  'f8704a7b-e93d-4e32-b0f9-1b171545fe28',
  '28b3a12f-aa7a-5c2a-92c7-6d64fa543ee5',
  'c9eb293a-9be7-4a3d-8cd0-a1d885a3fdc1',
  '4f889e45-3c1d-4a8e-8fcb-3582d40d9e8a',
  '7fad6a57-cda1-5dee-a55e-877be64ba992',
  '68505a32-3b1d-57b2-a495-00b4097eb50d',
  '62e0a4e3-d1d3-46a2-982d-6b99dca6d3fb',
  'e131c594-c45e-5718-9f33-7ae39ddc82ad',
  '47d8d47c-7c59-5394-9098-11d9ad3723f1',
  '4d78bbcc-89b8-47f0-aa45-516199e4da5d',
  '71a483ba-9680-4654-bb5e-5ab5427f0919',
  '786ae588-a4fb-40e6-a7f5-113cfc2bfd0f',
  'e663cc67-5249-55db-b103-357b58a1ca91',
  'e322310f-f33a-485d-bc23-2412a6b8fa12',
  'e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e',
] as const

const axis = (id: string, textDe: string, textEn: string) => ({ id, textDe, textEn })
const applicationCase = (
  id: string,
  taskDemandDe: string,
  taskDemandEn: string,
  expectedPerformanceDe: string,
  expectedPerformanceEn: string,
  understandingFocusDe: string,
  understandingFocusEn: string,
) => ({ id, taskDemandDe, taskDemandEn, expectedPerformanceDe, expectedPerformanceEn, understandingFocusDe, understandingFocusEn })

const profileSpecs = new Map<string, ProfileSpec>([
  [goalIds[0], {
    archetype: 'concept',
    axes: [axis('exponent-regime', 'Positive, Null- und negative ganzzahlige Exponenten wechseln.', 'Positive, zero, and negative integer exponents vary.'), axis('term-structure', 'Gleiche Basis, gleicher Exponent und verschachtelte Produkte oder Quotienten wechseln.', 'Common bases, common exponents, and nested products or quotients vary.')],
    cases: [
      applicationCase('negative-exponent-simplification', 'Vereinfache für a,b≠0 den Term (2a⁻³b²)²·a⁴/(4b), nenne jedes Potenzgesetz und prüfe mit a=2,b=3.', 'For a,b≠0 simplify (2a⁻³b²)²·a⁴/(4b), name each exponent rule, and check with a=2,b=3.', 'Aus Potenz-von-Produkt, Potenz-von-Potenz und Quotient entsteht b³/a²; die Nichtnullbedingungen werden wegen der negativen Exponenten erhalten und die Zahlprobe stimmt.', 'Power of a product, power of a power, and quotient rules give b³/a²; the nonzero conditions are retained because of the negative exponents, and the numerical check agrees.', 'Regelauswahl, Definitionsbedingungen und unabhängige Kontrolle.', 'Rule selection, domain conditions, and an independent check.'),
      applicationCase('invalid-law-diagnosis', 'Beurteile x⁰=0, (xy)³=x³y³ und (x+y)²=x²+y²; korrigiere jede unzulässige Aussage und gib die nötigen Bedingungen an.', 'Assess x⁰=0, (xy)³=x³y³, and (x+y)²=x²+y²; correct every invalid statement and state the required conditions.', 'x⁰=1 gilt für x≠0; die Produktpotenz ist gültig; die Summenbehauptung fehlt um 2xy. Die Begründung wird jeweils aus der Potenzdefinition beziehungsweise dem Distributivgesetz entwickelt.', 'x⁰=1 for x≠0; the product power is valid; the sum claim is missing 2xy. Each conclusion is justified from the power definition or distributive law.', 'Grenzen der Potenzgesetze statt bloßer Mustererkennung.', 'Limits of exponent rules rather than superficial pattern matching.'),
    ],
  }],
  [goalIds[1], {
    archetype: 'concept',
    axes: [axis('radicand-form', 'Quadratzahl, Bruch und Dezimalzahl wechseln.', 'Perfect square, fraction, and decimal radicands vary.'), axis('precision', 'Exakter Wert, Intervallschranke und Dezimalnäherung wechseln.', 'Exact value, interval bound, and decimal approximation vary.')],
    cases: [
      applicationCase('bound-square-root-70', 'Ordne √70 zwischen zwei ganzen Zahlen ein, runde auf eine Dezimalstelle und kontrolliere die Näherung durch Quadrieren.', 'Bound √70 between two integers, round to one decimal place, and check the approximation by squaring.', 'Aus 8²<70<9² folgt 8<√70<9; 8,4 ist die passende Zehntelnäherung, deren Quadrat 70,56 die Größenordnung und Rundung bestätigt.', 'Since 8²<70<9², 8<√70<9; 8.4 is the appropriate tenth approximation, and its square 70.56 confirms the scale and rounding.', 'Begründete Näherung aus benachbarten Quadraten.', 'Justified approximation from neighbouring squares.'),
      applicationCase('fraction-and-decimal-roots', 'Bestimme √(49/64) exakt und entscheide für √0,18, ob ein einfacher exakter Dezimalwert vorliegt; gib andernfalls eine begründete Näherung an.', 'Determine √(49/64) exactly and decide whether √0.18 has a simple exact decimal value; otherwise give a justified approximation.', '√(49/64)=7/8 als nichtnegative Lösung. Wegen 0,42²<0,18<0,43² liegt √0,18 zwischen 0,42 und 0,43 und beträgt näherungsweise 0,424.', '√(49/64)=7/8 as the nonnegative solution. Since 0.42²<0.18<0.43², √0.18 lies between 0.42 and 0.43 and is approximately 0.424.', 'Definition und Schätzung über Darstellungswechsel hinweg.', 'Definition and estimation across representations.'),
    ],
  }],
  [goalIds[2], {
    archetype: 'procedure',
    axes: [axis('sign-information', 'Keine, positive oder negative Vorzeichenbedingung wird gegeben.', 'No, positive, or negative sign condition is given.'), axis('square-factor', 'Numerische und variable vollständige Quadratfaktoren wechseln.', 'Numerical and variable complete-square factors vary.')],
    cases: [
      applicationCase('absolute-value-required', 'Vereinfache √(36x²) für reelles x und widerlege das Ergebnis 6x mit einem geeigneten negativen x.', 'Simplify √(36x²) for real x and refute the result 6x using a suitable negative x.', 'Das Ergebnis ist 6|x|; für x=-2 liefert die Wurzel 12, während 6x=-12 wäre.', 'The result is 6|x|; for x=-2 the radical equals 12, whereas 6x would be -12.', 'Nichtnegativität der Hauptwurzel erzwingt den Betrag.', 'Nonnegativity of the principal square root forces the absolute value.'),
      applicationCase('use-sign-condition', 'Vereinfache √(25(x-3)²) einmal ohne Zusatzannahme und einmal unter x≤3; prüfe beide Formen.', 'Simplify √(25(x-3)²) first without an extra assumption and then under x≤3; check both forms.', 'Allgemein entsteht 5|x-3|; unter x≤3 gilt |x-3|=3-x, also 5(3-x). Quadrieren führt jeweils zum Radikanden zurück.', 'In general the result is 5|x-3|; under x≤3, |x-3|=3-x, so 5(3-x). Squaring returns the radicand in each case.', 'Vorzeicheninformation wird korrekt in eine betragsfreie Form übersetzt.', 'Sign information is correctly translated into a form without absolute value.'),
    ],
  }],
  [goalIds[3], {
    archetype: 'procedure',
    axes: [axis('radicand-start', 'Radikand und positiver Startwert wechseln.', 'The radicand and positive starting value vary.'), axis('stopping-rule', 'Feste Schrittzahl und Fehlergrenze wechseln.', 'A fixed iteration count and an error threshold vary.')],
    cases: [
      applicationCase('heron-square-root-10', 'Führe für √10 mit x₀=3 zwei Heron-Schritte aus und kontrolliere x₂ durch Quadrieren.', 'For √10 with x₀=3 perform two Heron iterations and check x₂ by squaring.', 'x₁=(3+10/3)/2=19/6 und x₂=(19/6+60/19)/2=721/228≈3,16228; x₂² liegt sehr nahe bei 10.', 'x₁=(3+10/3)/2=19/6 and x₂=(19/6+60/19)/2=721/228≈3.16228; x₂² is very close to 10.', 'Iterationsregel und Ergebnisprüfung ohne vorgegebenes Tabellenbild.', 'Iteration rule and result checking without a supplied spreadsheet image.'),
      applicationCase('spreadsheet-stop-rule', 'Richte für √2, x₀=2, eine Tabellenkalkulation ein und stoppe erstmals bei |xₙ²-2|<10⁻⁴; begründe den Stopp.', 'Set up a spreadsheet for √2 with x₀=2 and stop at the first |xₙ²-2|<10⁻⁴; justify the stop.', 'Die Formel =(Vorgänger+2/Vorgänger)/2 ergibt 1,5; 1,416666…; 1,414215… . Erst der dritte Näherungswert erfüllt die verlangte Quadratfehlergrenze.', 'The formula =(previous+2/previous)/2 gives 1.5, 1.416666…, and 1.414215… . The third approximation is the first to meet the required squared-error threshold.', 'Softwareumsetzung und sachgerechte, variable Abbruchbedingung.', 'Software implementation and an appropriate variable stopping condition.'),
    ],
  }],
  [goalIds[4], {
    archetype: 'procedure',
    axes: [axis('hidden-like-terms', 'Wurzelteile sind sofort gleichartig oder werden es erst nach Vereinfachung.', 'Radical parts are immediately like or become like only after simplification.'), axis('coefficient-sign', 'Positive und negative Koeffizienten sowie Differenzen wechseln.', 'Positive and negative coefficients and subtraction vary.')],
    cases: [
      applicationCase('simplify-before-combining', 'Vereinfache 3√8-√18+2√2 und begründe, welche Terme zusammengefasst werden.', 'Simplify 3√8-√18+2√2 and justify which terms are combined.', '√8=2√2 und √18=3√2; daher ergibt das Distributivgesetz (6-3+2)√2=5√2.', '√8=2√2 and √18=3√2; therefore the distributive law gives (6-3+2)√2=5√2.', 'Gleichartigkeit wird erst nach Radizierung erkannt.', 'Like terms are recognized only after radical simplification.'),
      applicationCase('retain-unlike-radical', 'Fasse 2√12+√27-√75+√5 so weit wie möglich zusammen und erkläre den Rest.', 'Combine 2√12+√27-√75+√5 as far as possible and explain the remainder.', '4√3+3√3-5√3+√5=2√3+√5; √3 und √5 sind nicht gleichartig und bleiben getrennt.', '4√3+3√3-5√3+√5=2√3+√5; √3 and √5 are unlike and remain separate.', 'Begründetes Stoppen statt unzulässigem Zusammenziehen.', 'Justified stopping rather than invalid combination.'),
    ],
  }],
  [goalIds[5], {
    archetype: 'procedure',
    axes: [axis('operation', 'Produkt und Quotient wechseln.', 'Products and quotients vary.'), axis('domain-condition', 'Numerische und variable Radikanden mit Nichtnegativitäts- beziehungsweise Nichtnullbedingung wechseln.', 'Numerical and variable radicands vary with nonnegativity or nonzero conditions.')],
    cases: [
      applicationCase('radical-product', 'Berechne (2√3)(-√12), vereinfache zuerst sinnvoll und begründe das Produktgesetz.', 'Compute (2√3)(-√12), simplify strategically first, and justify the product rule.', 'Mit √12=2√3 folgt (2√3)(-2√3)=-4·3=-12; alle numerischen Radikanden sind nichtnegativ.', 'Since √12=2√3, (2√3)(-2√3)=-4·3=-12; all numerical radicands are nonnegative.', 'Koeffizienten und Wurzelteile werden getrennt und korrekt verknüpft.', 'Coefficients and radical parts are separated and combined correctly.'),
      applicationCase('variable-radical-quotient', 'Vereinfache für reelles x den Quotienten √(18x²)/√2 und erkläre Betrag und Nennerbedingung.', 'For real x simplify √(18x²)/√2 and explain the absolute value and denominator condition.', 'Das Quotientengesetz liefert √(9x²)=3|x|; √2 ist von null verschieden und der Betrag folgt aus √(x²)=|x|.', 'The quotient rule gives √(9x²)=3|x|; √2 is nonzero and the absolute value follows from √(x²)=|x|.', 'Transfer auf Variablen samt Geltungsbedingungen.', 'Transfer to variables including validity conditions.'),
    ],
  }],
  [goalIds[6], {
    archetype: 'procedure',
    axes: [axis('nesting', 'Äußere Potenz und innere Wurzelstruktur wechseln.', 'The outer power and inner radical structure vary.'), axis('variable-sign', 'Numerische Terme und Variablen ohne feste Vorzeichen wechseln.', 'Numerical expressions and variables without fixed signs vary.')],
    cases: [
      applicationCase('power-of-radical-product', 'Vereinfache (2√3)⁴ auf zwei nachvollziehbaren Wegen und vergleiche.', 'Simplify (2√3)⁴ in two transparent ways and compare.', 'Sowohl ((2√3)²)²=12² als auch 2⁴(√3)⁴=16·9 ergeben 144.', 'Both ((2√3)²)²=12² and 2⁴(√3)⁴=16·9 give 144.', 'Strategiewahl bei äquivalenten Potenz-Wurzel-Folgen.', 'Strategy choice among equivalent exponent-radical sequences.'),
      applicationCase('absolute-value-under-odd-outer-power', 'Vereinfache (√(x²))³ für reelles x und zeige, warum x³ nicht allgemein gleichwertig ist.', 'Simplify (√(x²))³ for real x and show why x³ is not generally equivalent.', 'Es entsteht |x|³; bei x=-2 ist dies 8, während x³=-8 wäre. Erst unter x≥0 darf |x| durch x ersetzt werden.', 'The result is |x|³; at x=-2 this is 8 whereas x³=-8. Only under x≥0 may |x| be replaced by x.', 'Vorzeichen bleibt trotz scheinbarer Potenzkürzung entscheidend.', 'Sign remains decisive despite apparent exponent cancellation.'),
    ],
  }],
  [goalIds[7], {
    archetype: 'procedure',
    axes: [axis('factorization', 'Primfaktor- und erkennbare Quadratzerlegung wechseln.', 'Prime-factor and visible-square decompositions vary.'), axis('variable-condition', 'Numerische und variable Faktoren mit wechselnden Vorzeichenbedingungen werden genutzt.', 'Numerical and variable factors with varying sign conditions are used.')],
    cases: [
      applicationCase('partial-root-72', 'Radiziere √72 teilweise und belege die Äquivalenz durch Zurückführen unter eine Wurzel.', 'Partially extract √72 and establish equivalence by moving the factor back under one radical.', '72=36·2 liefert √72=6√2; umgekehrt ist 6√2=√36·√2=√72.', '72=36·2 gives √72=6√2; conversely 6√2=√36·√2=√72.', 'Geeigneter größter Quadratfaktor und Rückprüfung.', 'A suitable largest square factor and reverse check.'),
      applicationCase('variable-partial-extraction', 'Vereinfache √(48x²y) für reelle x und y≥0 und nenne die Bedingungen.', 'Simplify √(48x²y) for real x and y≥0 and state the conditions.', '48x²y=16·x²·3y, daher √(48x²y)=4|x|√(3y); y≥0 sichert einen reellen Radikanden.', '48x²y=16·x²·3y, so √(48x²y)=4|x|√(3y); y≥0 ensures a real radicand.', 'Numerische und variable Quadratfaktoren werden gemeinsam behandelt.', 'Numerical and variable square factors are handled together.'),
    ],
  }],
  [goalIds[8], {
    archetype: 'procedure',
    axes: [axis('denominator-form', 'Ein einzelner Wurzelfaktor und ein rationaler Koeffizient davor wechseln.', 'A single radical factor and an additional rational coefficient vary.'), axis('simplification-path', 'Direktes Erweitern und vorheriges Vereinfachen des Nenners wechseln.', 'Direct multiplication and prior denominator simplification vary.')],
    cases: [
      applicationCase('simple-rationalization', 'Rationalisiere 5/√3 und erkläre, warum der Bruchwert unverändert bleibt.', 'Rationalize 5/√3 and explain why the value of the fraction is unchanged.', 'Multiplikation mit √3/√3=1 ergibt 5√3/3; √3≠0 und der neue Nenner ist rational.', 'Multiplication by √3/√3=1 gives 5√3/3; √3≠0 and the new denominator is rational.', 'Äquivalenzerhaltung und Ziel eines rationalen Nenners.', 'Preservation of equivalence and the goal of a rational denominator.'),
      applicationCase('coefficient-and-reducible-root', 'Rationalisiere und vereinfache 2/(3√8); vergleiche direktes Erweitern mit vorherigem Vereinfachen von √8.', 'Rationalize and simplify 2/(3√8); compare direct multiplication with simplifying √8 first.', 'Beide Wege führen zu √2/6: √8=2√2 ergibt 1/(3√2), anschließend Multiplikation mit √2/√2.', 'Both routes give √2/6: √8=2√2 gives 1/(3√2), followed by multiplication by √2/√2.', 'Strategievergleich bei zusätzlichem Koeffizienten.', 'Comparison of strategies with an additional coefficient.'),
    ],
  }],
  [goalIds[9], {
    archetype: 'concept',
    axes: [axis('radicand-sign', 'Positive und negative Radikanden wechseln.', 'Positive and negative radicands vary.'), axis('number-form', 'Ganze Zahlen, Brüche und Dezimalzahlen wechseln.', 'Integers, fractions, and decimals vary.')],
    cases: [
      applicationCase('negative-and-inexact-cube-root', 'Bestimme ∛(-125) exakt und grenze ∛20 zwischen zwei Zehntelwerten ein; kontrolliere durch Kubieren.', 'Determine ∛(-125) exactly and bound ∛20 between two decimal tenths; check by cubing.', '∛(-125)=-5. Wegen 2,7³=19,683 und 2,8³=21,952 liegt ∛20 zwischen 2,7 und 2,8 und ist etwa 2,714.', '∛(-125)=-5. Since 2.7³=19.683 and 2.8³=21.952, ∛20 lies between 2.7 and 2.8 and is about 2.714.', 'Eindeutigkeit und Vorzeichen unterscheiden Kubik- von Quadratwurzeln.', 'Uniqueness and sign distinguish cube roots from square roots.'),
      applicationCase('fraction-decimal-cube-root', 'Bestimme ∛(27/64) und ∛(-0,064) exakt und begründe beide Werte mit der Definitionsgleichung.', 'Determine ∛(27/64) and ∛(-0.064) exactly and justify both values using the defining equation.', '(3/4)³=27/64 und (-0,4)³=-0,064; deshalb sind die gesuchten Kubikwurzeln 3/4 und -0,4.', '(3/4)³=27/64 and (-0.4)³=-0.064; therefore the cube roots are 3/4 and -0.4.', 'Definitionsgleichung bleibt bei Darstellungs- und Vorzeichenwechsel tragfähig.', 'The defining equation remains valid across representation and sign changes.'),
    ],
  }],
  [goalIds[10], {
    archetype: 'procedure',
    axes: [axis('unknown-side-role', 'Hypotenuse und Kathete wechseln als gesuchte Größe.', 'The hypotenuse and a leg vary as the unknown.'), axis('context', 'Reine Figur und eingebettete Sachsituation wechseln.', 'A pure diagram and an embedded context vary.')],
    cases: [
      applicationCase('rectangle-diagonal', 'Ein Rechteck ist 7 cm mal 24 cm. Berechne die Diagonale und begründe die Seitenrollen im entstehenden Dreieck.', 'A rectangle measures 7 cm by 24 cm. Calculate its diagonal and justify the side roles in the resulting triangle.', 'Die Rechteckseiten sind Katheten und die Diagonale die Hypotenuse; d²=7²+24²=625, also d=25 cm.', 'The rectangle sides are legs and the diagonal is the hypotenuse; d²=7²+24²=625, so d=25 cm.', 'Rechtwinkliges Teildreieck in einer zusammengesetzten Figur erkennen.', 'Recognizing a right-triangle subfigure in a composite shape.'),
      applicationCase('ladder-missing-leg', 'Eine 13-m-Leiter steht mit dem Fuß 5 m von einer Wand entfernt. Bestimme die Höhe und prüfe die Größenordnung.', 'A 13 m ladder has its foot 5 m from a wall. Determine the height and check its magnitude.', 'Die Leiter ist die Hypotenuse; h²=13²-5²=144, also h=12 m, kleiner als die 13-m-Leiter und damit plausibel.', 'The ladder is the hypotenuse; h²=13²-5²=144, so h=12 m, less than the 13 m ladder and therefore plausible.', 'Subtraktionsfall und geometrische Plausibilitätskontrolle.', 'The subtraction case and a geometric plausibility check.'),
    ],
  }],
  [goalIds[11], {
    archetype: 'modeling',
    axes: [axis('target-quantity', 'Seite und Winkel wechseln als gesuchte Größe.', 'A side and an angle vary as the unknown.'), axis('orientation', 'Skizzen- und Kontextorientierung sowie Bezugswinkel wechseln.', 'Diagram and context orientation and reference angle vary.')],
    cases: [
      applicationCase('tree-height', 'Aus 20 m horizontaler Entfernung wird die Baumspitze unter 35° gesehen. Erstelle die Skizze, wähle das Verhältnis und bestimme die Höhe ohne Augenhöhenkorrektur.', 'From a horizontal distance of 20 m, the top of a tree is seen at 35°. Draw the diagram, choose the ratio, and determine the height without an eye-height correction.', 'Gegenkathete/Ankathete führt zu tan35°=h/20, also h≈14,0 m; Einheit und Modellannahme werden genannt.', 'Opposite/adjacent gives tan35°=h/20, hence h≈14.0 m; the unit and modelling assumption are stated.', 'Eigenständige Modellierung statt bloßer Formeleinsetzung.', 'Independent modelling rather than formula substitution.'),
      applicationCase('ramp-angle', 'Eine 6,0-m-Rampe überwindet 1,2 m Höhe. Bestimme ihren Neigungswinkel und prüfe ihn an der Skizze.', 'A 6.0 m ramp gains 1.2 m in height. Determine its angle of inclination and check it against the diagram.', 'Die Rampe ist die Hypotenuse; sinα=1,2/6=0,2, also α≈11,5°. Ein kleiner Winkel passt zum Verhältnis.', 'The ramp is the hypotenuse; sinα=1.2/6=0.2, so α≈11.5°. A small angle matches the ratio.', 'Neue Größenkombination erzwingt eine neue Verhältniswahl.', 'A new combination of quantities requires a fresh ratio choice.'),
    ],
  }],
  [goalIds[12], {
    archetype: 'proof',
    axes: [axis('angle-type', 'Spitzer, rechter und stumpfer eingeschlossener Winkel wechseln.', 'Acute, right, and obtuse included angles vary.'), axis('derivation-route', 'Koordinaten- und Zerlegungsargument wechseln.', 'Coordinate and decomposition arguments vary.')],
    cases: [
      applicationCase('coordinate-derivation', 'Setze A=(0,0), B=(c,0), C=(b cosα,b sinα) und leite mit der Abstandsformel den Kosinussatz für a her.', 'Set A=(0,0), B=(c,0), C=(b cosα,b sinα) and derive the cosine law for a using the distance formula.', 'a²=(b cosα-c)²+(b sinα)²=b²+c²-2bc cosα; sin²α+cos²α=1 wird ausdrücklich verwendet.', 'a²=(b cosα-c)²+(b sinα)²=b²+c²-2bc cosα; sin²α+cos²α=1 is used explicitly.', 'Vollständige Herleitung mit eindeutiger Seiten-Winkel-Zuordnung.', 'A complete derivation with unambiguous side-angle correspondence.'),
      applicationCase('obtuse-and-right-special-case', 'Übertrage die Formel auf b=5,c=7,α=120° und erkläre anschließend den Spezialfall α=90°.', 'Apply the formula to b=5,c=7,α=120° and then explain the special case α=90°.', 'a²=25+49-70·(-1/2)=109; beim stumpfen Winkel vergrößert der negative Kosinus die Gegenseite. Für 90° verschwindet der Projektionsterm und es bleibt Pythagoras.', 'a²=25+49-70·(-1/2)=109; for an obtuse angle the negative cosine increases the opposite side. At 90° the projection term vanishes and Pythagoras remains.', 'Vorzeichenbedeutung und Spezialfall werden aus der Herleitung erklärt.', 'Sign meaning and the special case are explained from the derivation.'),
    ],
  }],
  [goalIds[13], {
    archetype: 'procedure',
    axes: [axis('data-configuration', 'SAS/SSS und bekannte Gegenüberpaare wechseln.', 'SAS/SSS and known opposite pairs vary.'), axis('solution-count', 'Eindeutige und mehrdeutige Fälle wechseln.', 'Unique and ambiguous cases vary.')],
    cases: [
      applicationCase('sas-cosine-choice', 'In einem Dreieck sind zwei Seiten 7 cm und 10 cm sowie ihr eingeschlossener Winkel 60° gegeben. Wähle den Satz, berechne die Gegenseite und prüfe die Skizze.', 'A triangle has sides 7 cm and 10 cm with included angle 60°. Choose the law, calculate the opposite side, and check the diagram.', 'Ohne bekanntes Gegenüberpaar ist der Kosinussatz passend: c²=49+100-140·0,5=79, also c≈8,89 cm, zwischen den plausiblen Grenzwerten 3 und 17.', 'Without a known opposite pair the cosine law is appropriate: c²=49+100-140·0.5=79, so c≈8.89 cm, between the plausible bounds 3 and 17.', 'Satzwahl aus der Datenlage und Dreiecksungleichung als Kontrolle.', 'Law selection from the data and triangle inequality as a check.'),
      applicationCase('ssa-ambiguity', 'Gegeben sind A=40°, a=8 cm und b=10 cm. Nutze den Sinussatz und prüfe ausdrücklich, ob eine zweite Lösung möglich ist.', 'Given A=40°, a=8 cm, and b=10 cm, use the sine law and explicitly check whether a second solution is possible.', 'sinB=10sin40°/8≈0,8035 liefert B≈53,5° oder 126,5°; beide lassen mit A eine positive Winkelsumme unter 180° und erzeugen daher zwei Dreiecke.', 'sinB=10sin40°/8≈0.8035 gives B≈53.5° or 126.5°; with A, both leave a positive angle sum below 180°, so two triangles result.', 'Mehrdeutigkeitsprüfung statt unkritischer Taschenrechnerausgabe.', 'Ambiguity checking rather than uncritical calculator output.'),
    ],
  }],
  [goalIds[14], {
    archetype: 'representation',
    axes: [axis('direction', 'Ausmultiplizieren, Faktorisieren und quadratische Ergänzung wechseln.', 'Expansion, factorization, and completing the square vary.'), axis('pattern', 'Plus-, Minus- und unvollständige binomische Muster wechseln.', 'Plus, minus, and incomplete binomial patterns vary.')],
    cases: [
      applicationCase('expand-and-refactor', 'Multipliziere (2x-3)² aus, erkläre den Mittelterm und faktorisiere das Ergebnis zurück.', 'Expand (2x-3)², explain the middle term, and factor the result back.', '(2x)²-2·2x·3+3²=4x²-12x+9; Vorzeichen und doppeltes Produkt sichern die Rückerkennung.', '(2x)²-2·2x·3+3²=4x²-12x+9; the sign and double product support recognition in reverse.', 'Binomische Formel als distributiv begründete Identität in beide Richtungen.', 'The binomial formula as a distributively justified identity in both directions.'),
      applicationCase('incomplete-square-pattern', 'Untersuche x²+6x+8: Entscheide, warum es kein vollständiges Binom ist, und forme es dennoch strukturbetont um.', 'Examine x²+6x+8: decide why it is not a complete binomial square and still rewrite it to reveal structure.', 'Zu (x+3)² fehlt gegenüber 9 genau 1: x²+6x+8=(x+3)²-1=(x+2)(x+4). Jede Form wird durch Ausmultiplizieren geprüft.', 'Compared with (x+3)², exactly 1 is missing: x²+6x+8=(x+3)²-1=(x+2)(x+4). Each form is checked by expansion.', 'Mustergrenze und zweckgerichteter Darstellungswechsel.', 'Pattern limitation and purposeful change of representation.'),
    ],
  }],
  [goalIds[15], {
    archetype: 'representation',
    axes: [axis('opening', 'Nach oben und nach unten geöffnete Parabeln wechseln.', 'Upward- and downward-opening parabolas vary.'), axis('window', 'Vollständiger und abgeschnittener Graphenausschnitt wechseln.', 'Complete and clipped graph windows vary.')],
    cases: [
      applicationCase('complete-parabola-reading', 'Ein Graph zeigt die Parabel mit Scheitel S(1|-4), Nullstellen -1 und 3 sowie y-Achsenabschnitt -3. Gib Wertemenge, Vorzeichen- und Monotoniebereiche an.', 'A graph shows a parabola with vertex S(1,-4), roots -1 and 3, and y-intercept -3. State its range, sign intervals, and monotonicity intervals.', 'Die Parabel ist nach oben geöffnet: W=[-4,∞), negativ auf (-1,3), null an -1 und 3, positiv außerhalb; fallend bis x=1 und steigend ab x=1.', 'The parabola opens upward: range [-4,∞), negative on (-1,3), zero at -1 and 3, positive outside; decreasing to x=1 and increasing from x=1.', 'Alle Eigenschaften werden konsistent aus denselben Graphmerkmalen verknüpft.', 'All properties are consistently linked to the same graph features.'),
      applicationCase('clipped-graph-limit', 'Ein nach unten geöffneter Graphausschnitt zeigt S(0|2) nur für -1≤x≤1 und liegt dort oberhalb der x-Achse. Nenne sichere Aussagen und eine unzulässige globale Schlussfolgerung.', 'A clipped downward-opening graph shows S(0,2) only for -1≤x≤1 and lies above the x-axis there. State warranted claims and one invalid global conclusion.', 'Sicher sind Maximum 2 im sichtbaren Scheitel und lokale Zunahme links beziehungsweise Abnahme rechts. Aus dem Ausschnitt folgt nicht, dass die Funktion keine Nullstellen oder überall positive Werte hat.', 'The visible vertex supports a maximum of 2 and local increase on the left and decrease on the right. The window does not show that the function has no roots or is positive everywhere.', 'Sichtbare Evidenz wird von Vermutung außerhalb des Fensters getrennt.', 'Visible evidence is separated from conjecture outside the window.'),
    ],
  }],
])

const absolute = (path: string): string => resolve(repositoryRoot, path)
const sha256 = (value: Buffer | string): `sha256:${string}` => `sha256:${createHash('sha256').update(value).digest('hex')}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const jsonlBytes = (values: unknown[]): Buffer => Buffer.from(`${values.map((value) => JSON.stringify(value)).join('\n')}\n`)
const parseJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8').trim().split(/\r?\n/u).map((line) => JSON.parse(line) as JsonRecord)
const writeOrCheck = (path: string, bytes: Buffer): void => {
  let current: Buffer | null = null
  try { current = readFileSync(absolute(path)) } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }
  if (current?.equals(bytes)) return
  if (!writeMode) throw new Error(`${path}: missing or stale; run with --write`)
  if (current) throw new Error(`${path}: refusing to overwrite a foreign or stale evidence artifact`)
  mkdirSync(dirname(absolute(path)), { recursive: true })
  writeFileSync(absolute(path), bytes, { flag: 'wx' })
}

const main = async (): Promise<void> => {
  execFileSync('npm', ['exec', '--', 'tsx', 'scripts/materializeMathB032Stable16CarryoverResolutions.ts'], {
    cwd: resolve(repositoryRoot, 'app'),
    stdio: 'inherit',
  })

  const indexBytes = readFileSync(absolute(resolutionIndexPath))
  const index = JSON.parse(indexBytes.toString('utf8')) as JsonRecord
  const resolutions = index.resolutions as JsonRecord[]
  if (
    index.subject !== 'Mathematik'
    || index.semanticKind !== 'curricularAtomic'
    || index.strictDescriptionReviewCompleteCount !== 16
    || index.curriculumAtomicDenominator !== 794
    || !Array.isArray(resolutions)
    || resolutions.length !== goalIds.length
    || resolutions.some((entry, position) => entry.goalId !== goalIds[position] || entry.decision !== 'keep_current')
  ) throw new Error('B032 stable16 resolution index is not exact-current')

  const roundABytes = readFileSync(absolute(roundARecordsPath))
  const roundBBytes = readFileSync(absolute(roundBRecordsPath))
  const roundAByGoal = new Map(parseJsonl(roundARecordsPath).map((record) => [String(record.goalId), record]))
  const roundBByGoal = new Map(parseJsonl(roundBRecordsPath).map((record) => [String(record.goalId), record]))
  const sourceGoalBindings: JsonRecord[] = []
  const candidates: Array<{
    goalId: string
    reason: string
    evidenceLevel: 'E1'
    maximumClaimScope: 'G1'
    dissent: string[]
    profile: PositiveGoalEvidenceProfile
  }> = []

  for (const [position, goalId] of goalIds.entries()) {
    const entry = resolutions[position]
    const resolutionPath = `${batchDirectory}/${String(entry.resolutionPath)}`
    const resolutionBytes = readFileSync(absolute(resolutionPath))
    if (sha256(resolutionBytes) !== entry.resolutionDigest) throw new Error(`${goalId}: resolution digest drifted`)
    const resolution = JSON.parse(resolutionBytes.toString('utf8')) as JsonRecord
    const rounds = resolution.rounds as { first: JsonRecord; second: JsonRecord }
    const synthesis = resolution.synthesis as JsonRecord
    const evidence = synthesis.understandingEvidence as UnderstandingEvidence
    const firstRecord = roundAByGoal.get(goalId)
    const secondRecord = roundBByGoal.get(goalId)
    const spec = profileSpecs.get(goalId)
    if (!firstRecord || !secondRecord || !spec || !evidence) throw new Error(`${goalId}: missing source record, profile spec, or selected evidence`)
    for (const [round, record, binding] of [
      ['first', firstRecord, rounds.first],
      ['second', secondRecord, rounds.second],
    ] as const) {
      if (
        record.recordId !== binding.recordId
        || sha256(JSON.stringify(record)) !== binding.recordDigest
        || record.evidenceProfileContract !== 'positive-understanding-evidence-v2'
        || record.evidenceProfileRecommendation !== 'create'
      ) throw new Error(`${goalId}: ${round} review record is not exactly bound to a create recommendation`)
    }
    const firstEvidence = firstRecord.understandingEvidence as UnderstandingEvidence
    if (JSON.stringify(firstEvidence) !== JSON.stringify(evidence)) {
      throw new Error(`${goalId}: stable resolution no longer selects the exact Round A understanding evidence`)
    }
    const profile: PositiveGoalEvidenceProfile = {
      archetype: spec.archetype,
      expectations: [{
        id: 'selected-review-understanding',
        essentialUnderstandingDe: evidence.essentialUnderstandingDe,
        essentialUnderstandingEn: evidence.essentialUnderstandingEn,
        observablePerformanceDe: evidence.observablePerformanceDe,
        observablePerformanceEn: evidence.observablePerformanceEn,
      }],
      coverageExpectations: {
        requiredExpectationIds: ['selected-review-understanding'],
        alternativeExpectationGroups: [],
        minimumIndependentDemonstrations: 2,
        freshVariationRequired: true,
        independentTransferRequired: true,
      },
      variationAxes: spec.axes,
      applicationCaseBriefs: spec.cases,
    }
    candidates.push({
      goalId,
      reason: `DE: Das Profil operationalisiert die in der ausgewählten ersten B032-Blindrunde formulierte Verständnisleistung in zwei unabhängigen, neu variierten Anwendungsfällen; auch die zweite Blindrunde ist als eigenständige Empfehlung für positive-understanding-evidence-v2/create vollständig gebunden. EN: The profile operationalizes the understanding evidence selected from the first B032 blind round in two independent, freshly varied application cases; the second blind round is also fully bound as an independent positive-understanding-evidence-v2/create recommendation.`,
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent: [],
      profile,
    })
    sourceGoalBindings.push({
      goalId,
      resolution: { path: resolutionPath, sha256: entry.resolutionDigest },
      first: { recordId: firstRecord.recordId, recordDigest: rounds.first.recordDigest },
      second: { recordId: secondRecord.recordId, recordDigest: rounds.second.recordDigest },
    })
  }

  const config: PositiveGoalEvidenceReviewConfig = {
    $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
    schemaVersion: 2,
    reviewId,
    goalFingerprintRuleVersion: 'goal-evidence-v1',
    profileRuleVersion: 'positive-understanding-evidence-v2',
    landscapeId,
    landscapePath: canonicalPath,
    semanticKindLedgerPath,
    reviewCriteriaPath: criteriaPath,
    reviewPath,
    reviewRunManifestPaths: [],
    reviewedResourceTypes: [],
    requireApproved: false,
    scope: {
      label: 'Canonical Mathematics B032 stable-current carryover: 15 KEEP/KEEP goals plus 6596405a adjudicated KEEP, with both blind-round create recommendations bound',
      goalIds: [...goalIds],
    },
  }
  const candidateSet = {
    schemaVersion: 1 as const,
    authoringContract: 'positive-understanding-evidence-candidates-v1' as const,
    reviewId,
    reviewedAt,
    reviewer,
    sourceBindings: {
      bindingContract: 'math-b032-stable16-dual-round-positive-evidence-sources-v1',
      curriculumAtomicDenominator: 794,
      resolutionIndex: { path: resolutionIndexPath, sha256: sha256(indexBytes) },
      rounds: {
        first: { recordsPath: roundARecordsPath, recordsSha256: sha256(roundABytes) },
        second: { recordsPath: roundBRecordsPath, recordsSha256: sha256(roundBBytes) },
      },
      goals: sourceGoalBindings,
    },
    goals: candidates,
  }
  const reviewRecords = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet })
  writeOrCheck(configPath, jsonBytes(config))
  writeOrCheck(candidatesPath, jsonBytes(candidateSet))
  writeOrCheck(reviewPath, jsonlBytes(reviewRecords))
  const reviewed = reviewPositiveGoalEvidenceConfig(absolute(configPath))
  if (reviewed.errors.length > 0 || reviewed.counts.needsHumanReview !== 16) {
    throw new Error(reviewed.errors.join('\n') || 'B032 stable16 evidence count is not 16')
  }
  console.log(`CHECK math_b032_stable16_positive_evidence ${writeMode ? 'WRITE' : 'PASS'} profiles=16 dualRoundBindings=32 denominator=794`)
  console.log(`CONFIG ${configPath}`)
  console.log(`CANDIDATES ${candidatesPath}`)
  console.log(`REVIEW ${reviewPath}`)
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
