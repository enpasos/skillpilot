import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const stem = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-040-series-split-2-v1';
const landscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';
const landscapeBytes = readFileSync(landscapePath);
const landscape = JSON.parse(landscapeBytes);
const goalIds = ['630bb145-9a3f-5c88-ab5a-fb69a9bb76e4', '74b5a01b-c086-51d0-bc66-046029c92ef7'];
const sourceGoals = goalIds.map(id => {
  const matches = landscape.goals.filter(g => g.id === id); assert.equal(matches.length, 1); return matches[0];
});
assert.equal(sourceGoals[0].description, 'Die lernende Person kann Partialsummen arithmetischer Reihen bestimmen und mithilfe der Summenformel ihr Grenzverhalten begründen.');
assert.equal(sourceGoals[0].descriptionEn, 'The learner can determine partial sums of arithmetic series and use the summation formula to justify their limiting behavior.');
assert.equal(sourceGoals[1].description, 'Die lernende Person kann Partialsummen geometrischer Reihen bestimmen und mithilfe der Summenformel Konvergenz oder Divergenz sowie gegebenenfalls den Grenzwert begründen.');
assert.equal(sourceGoals[1].descriptionEn, 'The learner can determine partial sums of geometric series and use the summation formula to justify convergence or divergence and, where applicable, the limit.');
for (const g of sourceGoals) { assert.deepEqual(g.contains, []); assert.deepEqual(g.requires, ['67c4d6f8-45fc-53d5-8c95-a4c423e421a6']); }
const E = (id, essentialUnderstandingDe, essentialUnderstandingEn, observablePerformanceDe, observablePerformanceEn) => ({ id, essentialUnderstandingDe, essentialUnderstandingEn, observablePerformanceDe, observablePerformanceEn });
const C = (id, taskDemandDe, taskDemandEn, expectedPerformanceDe, expectedPerformanceEn, understandingFocusDe, understandingFocusEn) => ({ id, taskDemandDe, taskDemandEn, expectedPerformanceDe, expectedPerformanceEn, understandingFocusDe, understandingFocusEn });
const V = (id, textDe, textEn) => ({ id, textDe, textEn });
const expectationsArithmetic = [
  E('partial-sums', 'Bei einer arithmetischen Folge mit erstem Glied a und Differenz d ist Sₙ=n(2a+(n−1)d)/2 die Summe der ersten n Glieder, nicht das n-te Glied.', 'For an arithmetic sequence with first term a and difference d, Sₙ=n(2a+(n−1)d)/2 is the sum of its first n terms, not its nth term.', 'Die lernende Person setzt Indexierung, erstes Glied und Differenz in Beziehung, bestimmt konkrete und allgemeine Partialsummen und prüft einen Wert durch direktes Summieren.', 'The learner relates indexing, first term and difference, determines concrete and general partial sums and checks a value by direct summation.'),
  E('limiting-behavior', 'Die Summenformel ergibt Sₙ=(d/2)n²+(a−d/2)n. Für d≠0 bestimmt der quadratische Term das Grenzverhalten; für d=0 entscheidet a über das lineare Wachstum. Nur a=d=0 liefert einen endlichen Grenzwert.', 'The summation formula gives Sₙ=(d/2)n²+(a−d/2)n. For d≠0 the quadratic term determines limiting behavior; for d=0, a determines linear growth. Only a=d=0 gives a finite limit.', 'Die lernende Person begründet mit der Summenformel das Grenzverhalten und unterscheidet endliche kompensierte Partialsummen von Konvergenz der ganzen Partialsummenfolge.', 'The learner uses the summation formula to justify limiting behavior and distinguishes finite cancelling partial sums from convergence of the whole partial-sum sequence.'),
];
const expectationsGeometric = [
  E('partial-sums', 'Eine geometrische Reihe mit erstem Glied a und Quotienten q besitzt für q≠1 die Partialsummen Sₙ=a(1−qⁿ)/(1−q); für q=1 gilt Sₙ=na. Der Spezialfall q=1 muss als konstante Gliederfolge behandelt werden.', 'A geometric series with first term a and ratio q has partial sums Sₙ=a(1−qⁿ)/(1−q) for q≠1; for q=1, Sₙ=na. The special case q=1 must be treated as a constant term sequence.', 'Die lernende Person bestimmt Partialsummen mit zutreffender Indexierung und Fallunterscheidung und prüft kleine n durch direktes Summieren.', 'The learner determines partial sums with correct indexing and case distinctions and checks small n by direct summation.'),
  E('convergence-from-powers', 'Bei a≠0 entscheidet qⁿ in der Summenformel: Für |q|<1 konvergiert Sₙ gegen a/(1−q); bei q=−1 oszilliert Sₙ ohne Grenzwert, bei |q|>1 wachsen die Beträge unbeschränkt, und q=1 führt zu linearem Wachstum. Für a=0 sind sämtliche Partialsummen 0.', 'For a≠0, qⁿ in the summation formula is decisive: for |q|<1, Sₙ converges to a/(1−q); at q=−1 it oscillates without a limit, for |q|>1 its magnitudes are unbounded, and q=1 gives linear growth. For a=0 every partial sum is 0.', 'Die lernende Person begründet Konvergenz oder Divergenz aus der Summenformel, benennt gegebenenfalls den Grenzwert und unterscheidet alternierende Konvergenz, beschränkte Oszillation und unbeschränktes Verhalten.', 'The learner justifies convergence or divergence from the summation formula, states the limit when it exists and distinguishes alternating convergence, bounded oscillation and unbounded behavior.'),
];
const coverage = expectations => ({ requiredExpectationIds: expectations.map(e => e.id), alternativeExpectationGroups: [], minimumIndependentDemonstrations: 2, freshVariationRequired: true, independentTransferRequired: true });
const goals = [
  {
    goalId: goalIds[0], reason: 'Neu und eigenständig verfasster Kandidat für das arithmetische Splitkind. Beide Fälle verbinden Partialsummenberechnung mit einer Begründung des Grenzverhaltens aus der Summenformel; kein altes Profil des breiten Elternziels wurde gelesen oder kopiert. AI E1/G1, keine menschliche Abnahme oder Lernendenleistung behauptet.', evidenceLevel: 'E1', maximumClaimScope: 'G1', dissent: [],
    profile: { archetype: 'concept', expectations: expectationsArithmetic, coverageExpectations: coverage(expectationsArithmetic),
      variationAxes: [V('concrete-to-parameters', 'Von einer konkret fallenden Folge mit sich aufhebender endlicher Partialsumme zu einer parametrischen Familie einschließlich konstanter und identisch verschwindender Folgen wechseln.', 'Switch from a concrete decreasing sequence with a cancelling finite partial sum to a parameter family including constant and identically zero sequences.')],
      applicationCaseBriefs: [
        C('finite-cancellation', 'Die arithmetische Folge lautet aₙ=9−2n für n≥1. Bestimme S₃, S₈ und eine Formel für Sₙ. Begründe damit das Grenzverhalten und erläutere, was S₈=0 aussagt.', 'The arithmetic sequence is aₙ=9−2n for n≥1. Find S₃, S₈ and a formula for Sₙ. Use it to justify limiting behavior and explain what S₈=0 says.', 'a₁=7 und d=−2 liefern Sₙ=n(14−2(n−1))/2=n(8−n). S₃=15 stimmt mit 7+5+3 überein; S₈=0 bedeutet die Aufhebung der ersten acht Glieder. Wegen des führenden Terms −n² geht Sₙ gegen −∞; die einzelne Nullsumme bedeutet keine Konvergenz.', 'a₁=7 and d=−2 give Sₙ=n(14−2(n−1))/2=n(8−n). S₃=15 agrees with 7+5+3; S₈=0 means cancellation of the first eight terms. Because the leading term is −n², Sₙ tends to −∞; one zero partial sum does not imply convergence.', 'Endliche Summenauswertung und globale Aussage über die Partialsummenfolge unterscheiden.', 'Distinguishing finite sum evaluation from the global statement about the partial-sum sequence.'),
        C('parameter-boundaries', 'Eine arithmetische Folge hat erstes Glied a und Differenz d, beide reell. Nutze Sₙ=n(2a+(n−1)d)/2, bestimme S₄ und begründe, für welche Parameter die Partialsummen gegen +∞ oder −∞ gehen oder einen endlichen Grenzwert haben. Behandle d=0 ausdrücklich.', 'An arithmetic sequence has real first term a and difference d. Use Sₙ=n(2a+(n−1)d)/2, find S₄ and justify for which parameters its partial sums tend to +∞ or −∞ or have a finite limit. Address d=0 explicitly.', 'S₄=4a+6d stimmt mit a+(a+d)+(a+2d)+(a+3d) überein. Für d>0 geht Sₙ wegen (d/2)n² gegen +∞, für d<0 gegen −∞. Bei d=0 gilt Sₙ=na: a>0 ergibt +∞, a<0 ergibt −∞, a=0 ergibt konstant 0. Genau a=d=0 liefert einen endlichen Grenzwert.', 'S₄=4a+6d agrees with a+(a+d)+(a+2d)+(a+3d). For d>0, the term (d/2)n² makes Sₙ tend to +∞, and for d<0 to −∞. At d=0, Sₙ=na: a>0 gives +∞, a<0 gives −∞ and a=0 gives constant 0. Exactly a=d=0 yields a finite limit.', 'Struktureller Transfer beim Wegfall des quadratischen Terms und im Nullfall.', 'Structural transfer when the quadratic term disappears and in the zero case.')
      ] },
  },
  {
    goalId: goalIds[1], reason: 'Neu und eigenständig verfasster Kandidat für das geometrische Splitkind. Die Fälle koppeln endliche Summen an das Potenzverhalten einschließlich alternierender Konvergenz und relevanter Randfälle. Kein altes Profil des breiten Elternziels wurde gelesen oder kopiert. AI E1/G1, keine menschliche Abnahme oder Lernendenleistung behauptet.', evidenceLevel: 'E1', maximumClaimScope: 'G1', dissent: [],
    profile: { archetype: 'concept', expectations: expectationsGeometric, coverageExpectations: coverage(expectationsGeometric),
      variationAxes: [V('ratio-regimes', 'Von einem festen negativen Quotienten mit |q|<1 zur begründeten Einteilung reeller Quotienten einschließlich ±1 sowie zum verschwindenden ersten Glied wechseln.', 'Switch from a fixed negative ratio with |q|<1 to a justified classification of real ratios including ±1 and a zero first term.')],
      applicationCaseBriefs: [
        C('alternating-convergence', 'Eine geometrische Reihe beginnt mit 6−3+1,5−0,75+… . Bestimme die ersten vier Partialsummen und Sₙ. Begründe mithilfe der Summenformel den Grenzwert und die wechselnde Lage der Partialsummen zu ihm.', 'A geometric series starts 6−3+1.5−0.75+… . Find its first four partial sums and Sₙ. Use the summation formula to justify its limit and the alternating position of its partial sums relative to that limit.', 'a=6 und q=−1/2 ergeben Sₙ=4(1−(−1/2)ⁿ). Die ersten vier Summen sind 6;3;4,5;3,75. Weil (−1/2)ⁿ gegen 0 geht, ist der Grenzwert 4. Für ungerade n liegt Sₙ darüber, für gerade n darunter; die Abstände 4·(1/2)ⁿ schrumpfen.', 'a=6 and q=−1/2 give Sₙ=4(1−(−1/2)ⁿ). The first four sums are 6,3,4.5,3.75. Since (−1/2)ⁿ tends to 0, the limit is 4. Odd n gives values above it and even n below; the distances 4·(1/2)ⁿ shrink.', 'Alternierende Vorzeichen der Glieder mit konvergierenden Partialsummen vereinbaren.', 'Reconciling alternating term signs with convergent partial sums.'),
        C('ratio-classification', 'Eine geometrische Reihe hat erstes Glied 4 und reellen Quotienten q. Bestimme S₃ und begründe mit der Summenformel das Grenzverhalten für |q|<1, q=1, q=−1, q>1 und q<−1. Erläutere anschließend, was sich bei erstem Glied 0 ändert.', 'A geometric series has first term 4 and real ratio q. Find S₃ and use the summation formula to justify limiting behavior for |q|<1, q=1, q=−1, q>1 and q<−1. Then explain what changes if the first term is 0.', 'S₃=4(1+q+q²). Für q≠1 gilt Sₙ=4(1−qⁿ)/(1−q). Bei |q|<1 ist der Grenzwert 4/(1−q). Für q=1 ist Sₙ=4n und geht gegen +∞. Für q=−1 wechseln die Summen zwischen 4 und 0; es gibt keinen Grenzwert. Für q>1 geht Sₙ gegen +∞, für q<−1 sind die positiven und negativen Teilfolgen unbeschränkt. Mit erstem Glied 0 gilt unabhängig von q stets Sₙ=0.', 'S₃=4(1+q+q²). For q≠1, Sₙ=4(1−qⁿ)/(1−q). At |q|<1 the limit is 4/(1−q). For q=1, Sₙ=4n tends to +∞. For q=−1 the sums alternate between 4 and 0 without a limit. For q>1, Sₙ tends to +∞; for q<−1 the positive and negative subsequences are unbounded. With first term 0, Sₙ=0 for every q.', 'Transfer durch Wechsel des Quotientenregimes und korrekte Ausnahmen der Summenformel.', 'Transfer by changing the ratio regime and correctly handling exceptions to the summation formula.')
      ] },
  },
];
const reviewId = 'canonical-math-positive-evidence-b040-series-split-2-v1';
const reviewedAt = process.argv.includes('--check') ? JSON.parse(readFileSync(stem + '.candidates.json')).reviewedAt : new Date().toISOString();
const config = { $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json', schemaVersion: 2, reviewId, goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2', landscapeId: landscape.landscapeId, landscapePath, semanticKindLedgerPath: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json', reviewCriteriaPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-positive-understanding-evidence-profile-criteria-v2.md', reviewPath: stem + '.review.jsonl', reviewedResourceTypes: [], requireApproved: false, scope: { label: 'Mathematik B040: zwei neue Splitkinder arithmetische/geometrische Reihen, jeweils eigenständig verfasste AI-Verständnisprofile E1/G1; keine menschliche Freigabe.', goalIds } };
const candidates = { schemaVersion: 1, authoringContract: 'positive-understanding-evidence-candidates-v1', reviewId, reviewedAt, reviewer: 'codex-math-b040-series-split-positive-author', goals };
const sha = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const appRequire = createRequire(resolve('app/package.json'));
const Ajv2020 = appRequire('ajv/dist/2020.js').default, addFormats = appRequire('ajv-formats').default;
const ajv = new Ajv2020({ allErrors: true, strict: true }); addFormats(ajv);
const schema = JSON.parse(readFileSync('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));
const validateProfile = ajv.compile({ $schema: schema.$schema, $defs: schema.$defs, $ref: '#/$defs/profile' });
for (const goal of goals) assert.ok(validateProfile(goal.profile), ajv.errorsText(validateProfile.errors));
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, a + ' != ' + b);
const sum = xs => xs.reduce((a, b) => a + b, 0);
const arithmetic = (n, a, d) => n * (2 * a + (n - 1) * d) / 2;
const geometric = (n, a, q) => q === 1 ? n * a : a * (1 - q ** n) / (1 - q);
for (const n of [1, 3, 8, 20]) { close(arithmetic(n, 7, -2), n * (8 - n)); close(arithmetic(n, 7, -2), sum(Array.from({ length: n }, (_, k) => 7 - 2 * k))); }
close(arithmetic(3, 7, -2), 15); close(arithmetic(8, 7, -2), 0);
for (const a of [-3, 0, 4]) for (const d of [-2, 0, 3]) {
  close(arithmetic(4, a, d), 4 * a + 6 * d);
  close(arithmetic(25, a, d), d / 2 * 25 ** 2 + (a - d / 2) * 25);
  if (d !== 0) assert.equal(Math.sign(arithmetic(10000, a, d)), Math.sign(d));
  else { close(arithmetic(25, a, d), 25 * a); if (a === 0) close(arithmetic(10000, a, d), 0); }
}
assert.deepEqual([1, 2, 3, 4].map(n => geometric(n, 6, -.5)), [6, 3, 4.5, 3.75]);
for (const n of [1, 2, 3, 4, 10]) { close(geometric(n, 6, -.5), 4 * (1 - (-.5) ** n)); close(Math.abs(geometric(n, 6, -.5) - 4), 4 * .5 ** n); }
for (const q of [-2, -1, -.5, 0, .5, 1, 1.5]) {
  close(geometric(3, 4, q), 4 * (1 + q + q * q));
  close(geometric(3, 0, q), 0);
  for (const n of [1, 2, 5]) close(geometric(n, 4, q), sum(Array.from({ length: n }, (_, k) => 4 * q ** k)));
}
assert.deepEqual([1, 2, 3, 4].map(n => geometric(n, 4, -1)), [4, 0, 4, 0]);
assert.ok(geometric(20, 4, -2) < 0 && geometric(21, 4, -2) > 0);
assert.ok(geometric(20, 4, 1.5) > geometric(10, 4, 1.5));
const candidateBytes = JSON.stringify(candidates, null, 2) + '\n';
const report = { schemaVersion: 1, artifactType: 'math-b040-p2-author-case-checks-v1', observedAt: reviewedAt, candidateSha256: sha(candidateBytes), profileBodySchemas: 2, caseSpecificChecks: [
  { goalId: goalIds[0], caseId: 'finite-cancellation', status: 'pass', checked: 'Direct sums and closed formula at n=1,3,8,20; S3=15, S8=0; leading coefficient −1 justifies negative divergence.' },
  { goalId: goalIds[0], caseId: 'parameter-boundaries', status: 'pass', checked: 'S4=4a+6d and quadratic/linear decomposition verified for nine parameter combinations; algebraic classification includes d=0 and a=d=0.' },
  { goalId: goalIds[1], caseId: 'alternating-convergence', status: 'pass', checked: 'First four partial sums, signed remainder and shrinking distance to limit4 checked; q-power reasoning stated explicitly.' },
  { goalId: goalIds[1], caseId: 'ratio-classification', status: 'pass', checked: 'Direct sums match closed forms in seven ratio regimes; q=1, q=−1, q<−1 and a=0 handled; analytic q^n classification supplies the limit justification.' },
], authority: 'author-side checks only; AI candidate E1/G1, no human approval or observed learner demonstration' };
const context = { schemaVersion: 1, artifactType: 'math-b040-p2-authoring-context-v1', phase: 'bodies-authored-awaiting-final-image-import-and-stable-binding', observedAt: reviewedAt, provider: 'OpenAI', model: 'unknown', modelVersion: 'unknown', criteria: { path: config.reviewCriteriaPath, sha256: sha(readFileSync(config.reviewCriteriaPath)), readInFull: true }, source: { landscapePath, observedLandscapeSha256: sha(landscapeBytes), goals: sourceGoals, prerequisites: sourceGoals.map(g => ({ goalId: g.id, goals: g.requires.map(id => landscape.goals.find(p => p.id === id)) })) }, notes: ['Fresh independent content for each new child; no old broad-parent P body read or copied.', 'Both bilingual current descriptions, demand level, relations, applicability and supplied source references were read before authoring.', 'No image was bound to either child at authoring time. Root owns image generation/import; V stays in its separate QA lane. Final native materialization waits for Stable.', 'No review/run/mastery/human-approval claim is made by this authoring receipt.'] };
if (process.argv.includes('--check')) {
  assert.deepEqual(JSON.parse(readFileSync(stem + '.candidates.json')), candidates);
  assert.deepEqual(JSON.parse(readFileSync(stem + '.config.json')), config);
  console.log('P2 author checks PASS: 2 exact authored bodies, 4 case-specific checks, native profile-body schemas.');
  process.exit(0);
}
let patch = '*** Begin Patch\n';
for (const [suffix, value] of [['.config.json', config], ['.candidates.json', candidates], ['.author-check-report.json', report], ['.authoring-context.json', context]]) {
  const path = stem + suffix; assert.equal(existsSync(path), false, 'Refuse overwrite: ' + path);
  patch += '*** Add File: ' + path + '\n' + JSON.stringify(value, null, 2).split('\n').map(line => '+' + line).join('\n') + '\n';
}
patch += '*** End Patch\n';
process.stdout.write(JSON.stringify({ patch, summary: { profiles: 2, checkedCases: 4, reviewedAt, candidateSha256: sha(candidateBytes) } }));
