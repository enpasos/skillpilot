import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const stem = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-040-elementary-antiderivatives-1-v1';
const landscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';
const landscapeBytes = readFileSync(landscapePath), landscape = JSON.parse(landscapeBytes);
const goalId = 'a9ed219d-d497-55e5-a4e0-4d45d2554f6b';
const matches = landscape.goals.filter(g => g.id === goalId); assert.equal(matches.length, 1);
const goal = matches[0];
assert.equal(goal.description, 'Die lernende Person kann die Stammfunktionen von $x^n$ für $n\\in\\mathbb{Z}\\setminus\\{-1\\}$ sowie von $e^x$, $\\sin(x)$ und $\\cos(x)$ aus den Ableitungsregeln erschließen und damit mithilfe der Faktor- und Summenregel auf geeigneten Intervallen Stammfunktionen entsprechender Linearkombinationen bestimmen.');
assert.equal(goal.descriptionEn, 'The learner can infer antiderivatives of $x^n$ for $n\\in\\mathbb{Z}\\setminus\\{-1\\}$ and of $e^x$, $\\sin(x)$, and $\\cos(x)$ from differentiation rules and use the factor and sum rules to determine antiderivatives of their linear combinations on suitable intervals.');
assert.deepEqual(goal.contains, []);
assert.deepEqual(goal.requires, ['b9bbd2a8-1379-5ffb-817f-41467d48abef']);
const E = (id, essentialUnderstandingDe, essentialUnderstandingEn, observablePerformanceDe, observablePerformanceEn) => ({ id, essentialUnderstandingDe, essentialUnderstandingEn, observablePerformanceDe, observablePerformanceEn });
const C = (id, taskDemandDe, taskDemandEn, expectedPerformanceDe, expectedPerformanceEn, understandingFocusDe, understandingFocusEn) => ({ id, taskDemandDe, taskDemandEn, expectedPerformanceDe, expectedPerformanceEn, understandingFocusDe, understandingFocusEn });
const expectations = [
  E('infer-basic-pairs',
    'Stammfunktionen werden durch Umkehren bekannter Ableitungsbeziehungen erschlossen: (x^(n+1)/(n+1))′=x^n für ganze n≠−1, (e^x)′=e^x, (−cos x)′=sin x und (sin x)′=cos x. Das Vorzeichen und der Faktor folgen aus dieser Rückprüfung.',
    'Antiderivatives are inferred by reversing known differentiation relations: (x^(n+1)/(n+1))′=x^n for integers n≠−1, (e^x)′=e^x, (−cos x)′=sin x and (sin x)′=cos x. The sign and coefficient follow from this reverse check.',
    'Die lernende Person erschließt benötigte Basisstammfunktionen aus den Ableitungsregeln, begründet den Faktor 1/(n+1) und die trigonometrischen Vorzeichen und erläutert, warum die Potenzformel n=−1 nicht erfasst.',
    'The learner infers the required basic antiderivatives from differentiation rules, justifies the factor 1/(n+1) and the trigonometric signs, and explains why the power formula does not cover n=−1.'),
  E('inverse-linearity-and-interval',
    'Aus F′=f und G′=g folgt (αF+βG)′=αf+βg. Deshalb verbinden Faktor- und Summenregel die erschlossenen Basispaare zu einer Stammfunktion der Linearkombination. Additive Konstanten verschwinden beim Ableiten; negative Potenzen erfordern Intervalle ohne 0.',
    'F′=f and G′=g imply (αF+βG)′=αf+βg. Therefore the factor and sum rules combine the inferred basic pairs into an antiderivative of the linear combination. Additive constants disappear upon differentiation; negative powers require intervals avoiding 0.',
    'Die lernende Person bestimmt eine Stammfunktion eines gemischten Terms, begründet das termweise Zusammensetzen durch Linearität, bestätigt die Ableitung und benennt ein zulässiges Intervall einschließlich der Konstantenwahl dort.',
    'The learner determines an antiderivative of a mixed expression, justifies its termwise assembly by linearity, confirms its derivative and names an admissible interval including the choice of constant there.'),
];
const profile = {
  archetype: 'procedure', expectations,
  coverageExpectations: { requiredExpectationIds: expectations.map(e => e.id), alternativeExpectationGroups: [], minimumIndependentDemonstrations: 2, freshVariationRequired: true, independentTransferRequired: true },
  variationAxes: [
    { id: 'construction-versus-checking', textDe: 'Von der begründeten Prüfung und Vervollständigung einer vorgeschlagenen Stammfunktion zur eigenständigen Konstruktion wechseln; in beiden Richtungen die Ableitungsregeln als Begründung nutzen.', textEn: 'Switch from justified checking and completion of a proposed antiderivative to independent construction, using differentiation rules as the justification in both directions.' },
    { id: 'negative-powers-and-domain', textDe: 'Nichtnegative Potenzen auf ganz R durch negative ganzzahlige Potenzen ersetzen und damit die Rolle der Polstelle sowie getrennter zulässiger Intervalle und Konstanten sichtbar machen.', textEn: 'Replace nonnegative powers on all of R with negative integer powers, exposing the role of the pole and of separate admissible intervals and constants.' },
  ],
  applicationCaseBriefs: [
    C('mixed-rule-verification',
      'Für h(x)=3x²−2e^x+5cos x−4sin x wird H₀(x)=x³−2e^x+5sin x−4cos x vorgeschlagen. Prüfe den Vorschlag durch Ableiten und bestimme eine passende Stammfunktion. Erkläre die benötigten Basispaare und warum das Zusammensetzen der Summanden zulässig ist. Leite auch die Potenzformel für ganzzahliges n≠−1 aus der Ableitungsregel her und benenne hier ein mögliches Intervall.',
      'For h(x)=3x²−2e^x+5cos x−4sin x, the proposed antiderivative is H₀(x)=x³−2e^x+5sin x−4cos x. Check it by differentiation and determine a suitable antiderivative. Explain the basic pairs used and why assembling the terms is valid. Also derive the power formula for integer n≠−1 from the differentiation rule and name a possible interval here.',
      'H₀′=3x²−2e^x+5cos x+4sin x. Eine passende Stammfunktion ist H=x³−2e^x+5sin x+4cos x+C auf R. Denn (x^(n+1)/(n+1))′=((n+1)/(n+1))x^n=x^n, und exp bleibt beim Ableiten erhalten, sin wird cos, cos wird −sin. (αF+βG)′=αF′+βG′ rechtfertigt das Zusammensetzen. Für n=−1 ist der Nenner 0, sodass diese Potenzformel nicht anwendbar ist; eine logarithmische Ersatzregel muss hier nicht angegeben werden.',
      'H₀′=3x²−2e^x+5cos x+4sin x. A suitable antiderivative is H=x³−2e^x+5sin x+4cos x+C on R. Indeed, (x^(n+1)/(n+1))′=((n+1)/(n+1))x^n=x^n; exp retains itself under differentiation, sin becomes cos and cos becomes −sin. (αF+βG)′=αF′+βG′ justifies assembly. At n=−1 the denominator is 0, so this power formula is inapplicable; no logarithmic replacement rule needs to be supplied here.',
      'Ein gemischtes Ergebnis anhand der gemeinsamen inversen Ableitungsoperation begründen und die Koeffizienten sowie Vorzeichen nachvollziehbar sichern.',
      'Justifying a mixed result through the common inverse differentiation operation and establishing coefficients and signs explicitly.'),
    C('negative-power-domain-transfer',
      'Bestimme für f(x)=4x^−3+2x^−2−3+e^x+2sin x eine Stammfunktion auf (0,∞). Erschließe die Potenz- und trigonometrischen Bausteine durch Ableiten und begründe ihre Linearkombination. Erkläre, ob derselbe Term auf (−∞,0) verwendbar ist, ob beide Konstanten gleich sein müssen und warum kein gemeinsames Intervall durch 0 zulässig ist.',
      'For f(x)=4x^−3+2x^−2−3+e^x+2sin x, find an antiderivative on (0,∞). Infer the power and trigonometric components by differentiation and justify their linear combination. Explain whether the same expression is usable on (−∞,0), whether the two constants must agree, and why no common interval through 0 is admissible.',
      'F(x)=−2/x²−2/x−3x+e^x−2cos x+C₊ auf (0,∞). Die Potenzregel rückwärts liefert 4x^−2/(−2)=−2x^−2 und 2x^−1/(−1)=−2x^−1; der Nenner n+1 ist in beiden Fällen ungleich 0. Ableiten ergibt 4x^−3+2x^−2−3+e^x+2sin x. Die Summe ist durch Linearität zulässig. Auf (−∞,0) gilt derselbe nichtkonstante Term mit einem unabhängig wählbaren C₋; keine Forderung verbindet C₊ und C₋. Bei 0 sind die negativen Potenzen nicht definiert, daher gibt es hier keine Stammfunktion auf einem Intervall, das 0 enthält.',
      'F(x)=−2/x²−2/x−3x+e^x−2cos x+C₊ on (0,∞). Reversing the power rule gives 4x^−2/(−2)=−2x^−2 and 2x^−1/(−1)=−2x^−1; in each case n+1 is nonzero. Differentiating gives 4x^−3+2x^−2−3+e^x+2sin x. Linearity justifies the sum. On (−∞,0) the same nonconstant expression works with an independently chosen C₋; no requirement connects C₊ and C₋. The negative powers are undefined at 0, so there is no antiderivative here on an interval containing 0.',
      'Dieselbe inverse Linearität unter veränderten Exponenten anwenden und die mathematische Bedeutung geeigneter Intervalle statt einer bloßen Symbolregel zeigen.',
      'Applying the same inverse linearity with changed exponents and demonstrating the mathematical role of suitable intervals rather than only a symbolic rule.'),
  ],
};
const reviewId = 'canonical-math-positive-evidence-b040-elementary-antiderivatives-1-v1';
const checking = process.argv.includes('--check');
const reviewedAt = checking ? JSON.parse(readFileSync(stem + '.candidates.json')).reviewedAt : new Date().toISOString();
const config = { $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json', schemaVersion: 2, reviewId, goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2', landscapeId: landscape.landscapeId, landscapePath, semanticKindLedgerPath: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json', reviewCriteriaPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-positive-understanding-evidence-profile-criteria-v2.md', reviewPath: stem + '.review.jsonl', reviewedResourceTypes: [], requireApproved: false, scope: { label: 'Mathematik B040: ein frisches, quellengebundenes Verständnisprofil für inverse Linearität elementarer Stammfunktionen nach DE/EN-Präzisierung; AI-Kandidat E1/G1, keine menschliche Freigabe.', goalIds: [goalId] } };
const candidates = { schemaVersion: 1, authoringContract: 'positive-understanding-evidence-candidates-v1', reviewId, reviewedAt, reviewer: 'codex-math-b040-elementary-antiderivatives-positive-author', goals: [{ goalId, reason: 'Neues bilinguales Profil zur explizit quellengebundenen inversen Linearität. Zwei neu verfasste Fälle prüfen Grundpaare, Regelbegründung, gemischte Linearkombinationen und den strukturellen Transfer zu negativen Potenzen auf geeigneten Intervallen. Keine Substitution, innere Transformation, logarithmische Integration oder bestimmte Integralauswertung wird zusätzlich verlangt. D-Adjudikation und frische duale D-Prüfung bleiben getrennt; dieses Profil behauptet weder D-Freigabe noch menschliche Abnahme.', evidenceLevel: 'E1', maximumClaimScope: 'G1', dissent: [], profile }] };
const sha = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const appRequire = createRequire(resolve('app/package.json'));
const Ajv2020 = appRequire('ajv/dist/2020.js').default, addFormats = appRequire('ajv-formats').default;
const ajv = new Ajv2020({ allErrors: true, strict: true }); addFormats(ajv);
const schema = JSON.parse(readFileSync('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));
const validateProfile = ajv.compile({ $schema: schema.$schema, $defs: schema.$defs, $ref: '#/$defs/profile' });
assert.ok(validateProfile(profile), ajv.errorsText(validateProfile.errors));
const p = (coefficient, exponent) => ({ kind: 'power', coefficient, exponent });
const t = (kind, coefficient) => ({ kind, coefficient });
const derivative = term => term.kind === 'power' ? p(term.coefficient * term.exponent, term.exponent - 1) : term.kind === 'exp' ? t('exp', term.coefficient) : term.kind === 'sin' ? t('cos', term.coefficient) : t('sin', -term.coefficient);
const integral = term => { if (term.kind === 'power') { assert.notEqual(term.exponent, -1); return p(term.coefficient / (term.exponent + 1), term.exponent + 1); } return term.kind === 'exp' ? t('exp', term.coefficient) : term.kind === 'cos' ? t('sin', term.coefficient) : t('cos', -term.coefficient); };
const close = (a, b, tolerance = 1e-9) => assert.ok(Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b)), a + ' != ' + b);
const value = (terms, x) => terms.reduce((sum, term) => sum + term.coefficient * (term.kind === 'power' ? x ** term.exponent : term.kind === 'exp' ? Math.exp(x) : term.kind === 'sin' ? Math.sin(x) : Math.cos(x)), 0);
const h = [p(3, 2), t('exp', -2), t('cos', 5), t('sin', -4)];
const H = [p(1, 3), t('exp', -2), t('sin', 5), t('cos', 4)];
const H0 = [p(1, 3), t('exp', -2), t('sin', 5), t('cos', -4)];
assert.deepEqual(H.map(derivative), h); assert.deepEqual(h.map(integral), H);
assert.deepEqual(H0.map(derivative), [p(3, 2), t('exp', -2), t('cos', 5), t('sin', 4)]);
const f = [p(4, -3), p(2, -2), p(-3, 0), t('exp', 1), t('sin', 2)];
const F = [p(-2, -2), p(-2, -1), p(-3, 1), t('exp', 1), t('cos', -2)];
assert.deepEqual(F.map(derivative), f); assert.deepEqual(f.map(integral), F);
for (let n = -8; n <= 8; n++) if (n !== -1) { const term = p(1, n), recovered = derivative(integral(term)); close(recovered.coefficient, 1); assert.equal(recovered.exponent, n); }
assert.throws(() => integral(p(1, -1)));
for (const x of [-3, -1, -.25, .25, 1, 3]) {
  close(value(H.map(derivative), x), value(h, x)); close(value(F.map(derivative), x), value(f, x));
  close((value(H, x + 1e-5) - value(H, x - 1e-5)) / 2e-5, value(h, x), 1e-7);
  close((value(F, x + 1e-5) - value(F, x - 1e-5)) / 2e-5, value(f, x), 1e-7);
  for (const constant of [-9, 0, 17]) close(((value(F, x + 1e-5) + constant) - (value(F, x - 1e-5) + constant)) / 2e-5, value(f, x), 1e-7);
}
const candidateBytes = JSON.stringify(candidates, null, 2) + '\n';
const report = { schemaVersion: 1, artifactType: 'math-b040-p1-author-case-checks-v1', observedAt: reviewedAt, candidateSha256: sha(candidateBytes), profileBodySchemas: 1, caseSpecificChecks: [
  { goalId, caseId: 'mixed-rule-verification', status: 'pass', checked: 'Exact structured term differentiation and reverse-rule construction recover h and distinguish the proposed sine-sign error. The expected general power-rule calculation and derivative linearity are the mathematical justification; finite examples are not presented as a proof.' },
  { goalId, caseId: 'negative-power-domain-transfer', status: 'pass', checked: 'Exact structured differentiation and construction recover all five terms, including powers −3 and −2 and constant −3. The interval statement follows from the actual pole at 0 and the disappearance of constants. Numerical derivative checks on both sides of 0 support the term audit, not a general proof.' },
], additionalChecks: { integerPowerSample: 'n=−8 through 8 excluding −1, coefficient/exponent identity; n=−1 rejected', numericalCrossCheckPoints: [-3, -1, -.25, .25, 1, 3], authority: 'Author-side mathematical and schema checks only; no learner execution or human approval.' } };
const adjudicationPath = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-040-taylor-digital-tools-and-integrals-20-v1/a9ed-source-adjudication-adoption-receipt-v1.json';
const context = { schemaVersion: 1, artifactType: 'math-b040-p1-authoring-context-v1', phase: 'body-authored-awaiting-root-ai-counterreview-and-native-binding', observedAt: reviewedAt, provider: 'OpenAI', model: 'unknown', modelVersion: 'unknown', criteria: { path: config.reviewCriteriaPath, sha256: sha(readFileSync(config.reviewCriteriaPath)), readInFull: true }, source: { landscapePath, observedLandscapeSha256: sha(landscapeBytes), goal, prerequisites: goal.requires.map(id => landscape.goals.find(g => g.id === id)), adjudicationReceipt: { path: adjudicationPath, sha256: sha(readFileSync(adjudicationPath)) } }, caseCoverage: profile.applicationCaseBriefs.map(c => ({ caseId: c.id, expectationIds: expectations.map(e => e.id) })), notes: ['Current DE/EN descriptions, full direct prerequisite, demand level AB2, applicability and supplied HE Q1.1 p36 source context read. The original source page was actually viewed during the preceding adjudication.', 'Two newly authored P cases; no historical P body or D application case was copied. This profile is not the D adjudication receipt and does not declare D KEEP.', 'The prerequisite FTC need not be reassessed: neither definite integrals nor geometric area interpretation are added to this goal.', 'Visualization resources are separate V evidence; reviewedResourceTypes=[] and no fresh image-QA approval is asserted.', 'Root AI body counterreview is pending at this observed authoring time. Native binding must preserve these exact checked bodies.'] };
if (checking) {
  assert.deepEqual(JSON.parse(readFileSync(stem + '.candidates.json')), candidates);
  assert.deepEqual(JSON.parse(readFileSync(stem + '.config.json')), config);
  assert.equal(JSON.parse(readFileSync(stem + '.author-check-report.json')).candidateSha256, sha(candidateBytes));
  console.log('P1 author checks PASS: exact authored bilingual body, two case-specific symbolic audits, six numerical cross-check points, native profile-body schema.');
  process.exit(0);
}
let patch = '*** Begin Patch\n';
for (const [suffix, data] of [['.config.json', config], ['.candidates.json', candidates], ['.author-check-report.json', report], ['.authoring-context.json', context]]) {
  const path = stem + suffix; assert.equal(existsSync(path), false, 'Refuse overwrite: ' + path);
  patch += '*** Add File: ' + path + '\n' + JSON.stringify(data, null, 2).split('\n').map(line => '+' + line).join('\n') + '\n';
}
patch += '*** End Patch\n';
assert.deepEqual(readFileSync(landscapePath), landscapeBytes, 'Concurrent canonical drift');
process.stdout.write(JSON.stringify({ patch, summary: { profiles: 1, checkedCases: 2, reviewedAt, candidateSha256: sha(candidateBytes) } }));
