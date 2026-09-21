/**
 * One-time informed integration of 14 decisions from unchanged 20-goal runs.
 * Run from repository root with app/node_modules/.bin/tsx <this-file> --emit.
 * --emit returns native artifacts for apply_patch; --verify reads exact outputs.
 * This helper never writes files, reviews, curriculum, registry, profiles or QA.
 */
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = process.cwd()
const directory = dirname(fileURLToPath(import.meta.url))
const relativeDirectory = relative(root, directory).split(sep).join('/')
if (!relativeDirectory.startsWith('curricula/DE/Gymnasium/quality/goal-description-review/')) {
  throw new Error('Run this package-local helper from the SkillPilot repository root')
}
const mode = process.argv[2]
if (!['--emit', '--verify'].includes(mode) || process.argv.length !== 3) {
  throw new Error('Expected exactly --emit or --verify')
}
const native = async (name: string) => import(resolve(root, 'app/scripts', name))
const { stableGoalBookJson } = await native('goalBookModel.ts')
const {
  loadGoalDescriptionReviewCampaignResultDirectories,
} = await native('validateGoalDescriptionReviewCampaignResults.ts')
const { validateGoalDescriptionReviewDualRound } = await native('validateGoalDescriptionReviewDualRound.ts')
const {
  extractGoalDescriptionDualRoundResolutionSource,
  buildGoalDescriptionDualRoundResolution,
  validateGoalDescriptionDualRoundResolution,
} = await native('validateGoalDescriptionDualRoundResolution.ts')
const {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifest,
} = await native('validateGoalDescriptionRolloutSynthesisDecisionManifest.ts')
const { buildGoalDescriptionRolloutResolutionSynthesis } = await native('goalDescriptionRolloutResolutionSynthesis.ts')
const hash = (bytes: Buffer | string) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const json = (value: unknown) => Buffer.from(JSON.stringify(value, null, 2) + '\n')
const read = (path: string) => readFile(resolve(directory, path))
const parse = (bytes: Buffer) => JSON.parse(bytes.toString())
const assertClean = (label: string, errors: string[]) => {
  if (errors.length) throw new Error(label + ': ' + errors.join(' | '))
}
const manifestBytes = await read('batch-manifest.json')
const batch = parse(manifestBytes)
const configBytes = await readFile(resolve(root, batch.configPath))
if (hash(configBytes) !== batch.configDigest) throw new Error('Current config digest differs from batch binding')
const landscapeBytes = await readFile(resolve(root, batch.source.landscapePath))
const landscape = parse(landscapeBytes)

const loadRound = async (name: string) => {
  const [bundleBytes, inputBytes, campaignBytes] = await Promise.all([
    read(name + '/review-bundle-manifest.json'),
    read(name + '/description-review-input.json'),
    read(name + '/description-review-campaign.json'),
  ])
  const campaign = parse(campaignBytes)
  const loaded = await loadGoalDescriptionReviewCampaignResultDirectories({
    campaign,
    batchesDirectory: resolve(directory, name, 'batches'),
    resultsDirectory: resolve(directory, name, 'results'),
  })
  assertClean(name, loaded.errors)
  return { bundle: parse(bundleBytes), input: parse(inputBytes), campaign, resultPairs: loaded.resultPairs }
}
const [first, second] = await Promise.all([loadRound('round-a'), loadRound('round-b')])
const dual = await validateGoalDescriptionReviewDualRound({ first, second, diversityPolicy: 'report_only' })
assertClean('Unchanged full dual review', dual.errors)
if (dual.summary.goalCount !== 20 || batch.goalIds.length !== 20) throw new Error('Expected the complete 20-goal source batch')
const dualBytes = json(dual.summary)

const excluded = [
  ['a12bef54-7595-5f48-a7a8-9cfe1d8e9729', 'revise', 'revise'],
  ['3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4', 'revise', 'revise'],
  ['61686d85-0301-550e-bab9-bd9411c3e7ce', 'revise', 'revise'],
  ['6517427b-cf4e-5ebf-9a76-e1035617687c', 'revise', 'revise'],
  ['dbc13bb0-963b-49a8-a441-2183f4b64c8e', 'revise', 'revise'],
  ['972cc7e8-be9c-444c-ba45-98e817b3cf14', 'split_review', 'split_review'],
] as const
const rationales: Record<string, [string, string]> = {
  '71683f37-24de-4e0f-badd-858b56fa4d64': [
    'Beide Reviews begründen KEEP mit derselben begrenzten Umkehrfrage: Kontextbedingungen werden in mathematische Bedingungen übersetzt und die Parameter daran bestimmt und rückgeprüft. Die qualitative Untersuchung der Parameterwirkung bleibt dem Nachfolger vorbehalten. Evidence aus A wird gewählt, weil sie diese Kette sowie den strukturellen Wechsel von Punkt- zu Achsen- oder Scheitelbedingungen ausdrücklich erhält.',
    'Both reviews support KEEP for the same bounded inverse problem: contextual conditions are translated into mathematical constraints, parameters are determined, and the result is checked against those constraints. Qualitative investigation of parameter effects remains with the successor. Evidence from A is selected because it preserves this chain and an explicit structural change from point conditions to axis or vertex conditions.',
  ],
  '772b11c9-1348-5ab9-bc3f-458c46b312b6': [
    'A und B sehen die vorhandene Beschreibung als präzise Verbindung von Termfaktoren und Graphenwirkung; horizontale und vertikale Skalierung sind Varianten derselben Darstellungsübersetzung. A wird als Evidence gewählt, weil die reziproke Wirkung innerer Faktoren und der Transfer auf einen unsymmetrischen, nur grafisch gegebenen Verlauf ausdrücklich vorkommen. Spiegelungen werden nicht zusätzlich eingeführt.',
    'A and B consider the existing description a precise connection between expression factors and graph effects; horizontal and vertical scaling are variants of the same representation translation. A is selected for its explicit reciprocal effect of inner factors and transfer to an asymmetric graph supplied without a formula. Reflections are not added to the scope.',
  ],
  '4c6369b0-4b58-5ac0-915c-82c348ae1c14': [
    'Beide Reviews bestätigen die vollständige DE/EN-Zuordnung von Vorzeichenwechseln zu Achsen- und Ursprungsspiegelung. Die drei Fälle gehören zur gemeinsamen Punktabbildung, ohne die allgemeine Symmetriebegründung des Nachfolgers vorzuziehen. A liefert die ausgewählte Evidence mit eigenständiger Punktzuordnung und der rückwärts gerichteten Identifikation einer Spiegelung an einem neuen unsymmetrischen Graphen.',
    'Both reviews confirm the complete bilingual mapping from sign changes to axis and origin reflections. The three cases belong to one point-mapping competence without anticipating the successor goal on general symmetry justification. A provides the selected evidence through independent point matching and inverse identification of a reflection on a fresh asymmetric graph.',
  ],
  '62a1c6f2-1775-5a19-98e0-ed3dd722039f': [
    'A und B begründen KEEP mit der zusammenhängenden Symmetriebeziehung zwischen verschobener Funktion und Ableitung. Allgemeine Identitäten und Transformationsargumente bleiben zulässig; einzelne Bildpunkte werden nicht als Beweis behandelt. Evidence A wird ausgewählt, weil sie den Übergang von Achsen- zu Punktsymmetrie und einen geänderten geraden beziehungsweise ungeraden Grundgraphen konkret verknüpft.',
    'A and B support KEEP through the coherent symmetry relation between a shifted function and its derivative. General identities and transformation arguments remain valid approaches; isolated illustrated points are not treated as proof. Evidence A is selected because it explicitly connects the change from axis to point symmetry with a changed even or odd base graph.',
  ],
  '0c5e2ed1-4efb-5bdb-a8e5-fe830eb92c85': [
    'Beide Reviews erkennen das punktweise Produkt als klar begrenzten Gegenstand und Skizze plus Begründung als eine Leistung. Eine zusätzliche Kurvendiskussionsliste im Beschreibungstext ist nicht nötig. A wird gewählt, weil gemeinsame Definitionsmenge, Nullstellen, Vorzeichen und die Transferfrage Berühren versus Schneiden eine konkrete Evidence-Kette bilden; Produkt und Verkettung bleiben getrennt.',
    'Both reviews identify the pointwise product as a clearly bounded object and sketching with justification as one performance. No additional curve-analysis checklist is needed in the description. A is selected because common domain, zeros, signs and the transfer from touching to crossing the axis form a concrete evidence chain; product and composition stay separate.',
  ],
  '91311908-9209-58e4-8429-99dad9df546d': [
    'Beide Reviews bestätigen die eigenständige graphische Verkettungskompetenz gegenüber dem Produktziel. Die vorhandene Beschreibung lässt passende Graphen und Begründungswege offen. A wird als Evidence gewählt, weil die Eingabefolge und die Definitionsbedingung g(x) im Bereich von f konkret sind und der Transfer die Reihenfolge oder den äußeren Definitionsbereich verändert.',
    'Both reviews confirm graphical composition as a distinct competence from the product goal. The current description leaves suitable graphs and valid arguments open. A is selected because its evidence specifies the input sequence and the requirement that g(x) lie in the domain of f, with transfer through changed order or outer domain.',
  ],
  'c72a8032-71f6-56ed-a896-06ae435ff2ec': [
    'Root /root entscheidet nach Lektüre beider Reviews KEEP: Das Untersuchen und argumentative Begründen des Verhaltens einer ausdrücklich verketteten Exponential- oder Logarithmusfunktion verlangt bereits eine strukturell tragfähige Begründung. Der von B verlangte Zusatz könnte eine zulässige direkte Ableitungs- oder Monotoniebegründung unnötig auf eine bestimmte Form der Darstellung festlegen. A wird als Evidence ausgewählt; diese benennt Definitionsbereich, innere und äußere Funktion ausdrücklich für das separate P-v2-Profil. Der unveränderte DE/EN-Vorschlag von B bleibt als rejected_keep_current-Dissens gebunden.',
    'Root /root adjudicates KEEP after reading both reviews: investigating and arguing for the behaviour of an explicitly composed exponential or logarithmic function already requires a structurally sound justification. B’s required addition could unnecessarily prescribe how a valid direct derivative or monotonicity argument must be presented. A is selected as evidence and explicitly names domain, inner function and outer function for the separate P-v2 profile. B’s unchanged German and English proposal remains bound as rejected_keep_current dissent.',
  ],
  '5fe4218e-4fb0-5339-8764-c989befa244e': [
    'A und B bestätigen Modellbildung und Parameterdeutung als einen gemeinsamen ersten Modellierungsschritt; Lösen der Gleichung bleibt einem eigenen Nachfolger vorbehalten. Evidence A wird gewählt, weil Größen, Einheiten, Vorzeichen und Änderungsannahme zusammengeführt werden und der Transfer die Proportionalität zum Bestand gegen die zum Grenzabstand austauscht. Der Text benötigt dafür keine zusätzliche Verfahrenspflicht.',
    'A and B confirm model formation and parameter interpretation as one initial modelling step; solving the equation remains a separate successor competence. Evidence A is selected because quantities, units, signs and the rate assumption are connected, while transfer changes proportionality to the quantity into proportionality to the gap from a limit. The description needs no additional mandatory procedure.',
  ],
  '58fda9b4-4336-5594-99ce-722c4a453372': [
    'Beide Reviews halten die qualitative Begrenzung einfacher DGL zweiter Ordnung in DE und EN für ausreichend und lehnen eine Ausweitung auf allgemeine Lösungsverfahren ab. A wird als Evidence gewählt, weil Vorzeichen der zweiten Ableitung und Lösungsverlauf verknüpft werden und ein Vorzeichenwechsel des Koeffizienten die Reichweite der periodischen Deutung prüft. Die Formel im Bild wird nicht zur zusätzlichen Pflichtkompetenz.',
    'Both reviews find the bilingual limitation to qualitative investigation of simple second-order equations sufficient and do not expand the goal into general solution methods. A is selected because it connects the sign of the second derivative with solution behaviour and uses a coefficient sign change to test the limits of a periodic interpretation. The formula shown in the image does not become an additional required competence.',
  ],
  'c15fe32d-1c83-4127-b1a4-9125af3d8f5d': [
    'A und B bestätigen die kohärente Kette aus Existenzprüfung, einfacher Umkehrgleichung und vertauschten Bereichen. Die eigenständige Suche nach einer geeigneten Einschränkung bleibt beim Nachfolger. Evidence A wird gewählt, weil sie Eindeutigkeit, Rückprüfung und veränderte bereits vorgegebene Bereiche zusammenführt; ein bloßes Vertauschen von Buchstaben genügt nicht.',
    'A and B confirm the coherent chain of checking existence, finding a simple inverse equation and exchanging domains and ranges. Independently selecting a suitable restriction remains with the successor. Evidence A is selected because it combines uniqueness, checking and changed already specified domains; merely swapping variable letters is insufficient.',
  ],
  '34604a97-0c64-5b06-81e2-6ac818732d60': [
    'Beide Reviews sehen sprachliche, graphische und kontextbezogene Deutung als Ausdrucksformen derselben orientierten Integralbedeutung. A wird als Evidence ausgewählt, weil Integrand, Grenzen, Einheit und punktweiser Vergleich verbunden werden und ein Vorzeichenwechsel den Unterschied zwischen Bilanz und Gesamtfläche prüft. Das positive Rechenbeispiel im Bild ersetzt diese neue Leistung nicht.',
    'Both reviews see verbal, graphical and contextual interpretation as expressions of the same signed-integral meaning. A is selected because integrand, limits, units and pointwise comparison are connected, and a sign-changing case tests the difference between net balance and total area. The positive worked example in the image does not replace this fresh performance.',
  ],
  '993a14e8-60f0-5764-9340-b2447a5fa84b': [
    'Root /root entscheidet nach Lektüre beider Reviews KEEP: Einen Parameter einer Funktionenschar als veränderliche Größe zu deuten ist korrekt; der aktuelle Text setzt ihn nicht mit der Eingabevariablen gleich. Die Festlegung innerhalb eines Scharmitglieds gehört zur essentiellen P-v2-Erwartung und ist in der gewählten Evidence A bereits ausdrücklich enthalten. Zusätzliche Satzlänge behebt keinen nachgewiesenen Bedeutungsfehler. Die Grenze auf genau eine qualitative Grapheneigenschaft bleibt erhalten; Bs ursprünglicher DE/EN-Vorschlag bleibt als rejected_keep_current-Dissens gebunden.',
    'Root /root adjudicates KEEP after reading both reviews: interpreting a family parameter as a variable quantity is correct, and the current text does not equate it with the input variable. Being fixed within an individual member is essential P-v2 evidence and is already explicit in the selected evidence from A. Additional sentence length does not remedy a demonstrated semantic error. The limit to exactly one qualitative graph property is preserved; B’s original German and English proposal remains bound as rejected_keep_current dissent.',
  ],
  'c0e34fa8-fde5-5a4e-9b84-c5d5db719b58': [
    'A und B stimmen überein, dass Größen, Annahmen und Zielgröße gemeinsam die mathematische Problemformulierung bilden und nicht schon deren Lösung verlangen. A wird als Evidence gewählt, weil sie Annahmen von Angaben trennt und den Transfer über geänderte Verteilungsregeln oder Beschränkungen konkretisiert. Die zusätzliche Rechnung im Bild wird nicht in den Beschreibungsscope übernommen.',
    'A and B agree that quantities, assumptions and the target quantity jointly constitute mathematical problem formulation without already requiring a solution. A is selected because it distinguishes assumptions from given information and specifies transfer through changed allocation rules or constraints. The additional calculation in the image is not imported into the description’s scope.',
  ],
  '91e2f564-3bc8-4924-af85-2a3fa84c1471': [
    'Beide Reviews bestätigen die kontextbezogene Untersuchung der Parameterwirkung als eine kohärente AB3-Kompetenz und grenzen sie von der vorausgesetzten Parameterbestimmung ab. Evidence A wird gewählt, weil veränderliche und invariante Eigenschaften mit zulässigem Bereich und Modellgrenzen verknüpft sind. Ihr Transfer ändert Parameterregion oder Definitionsbereich; Aussagen des positiven Brückenbeispiels werden damit nicht ungeprüft verallgemeinert.',
    'Both reviews confirm contextual investigation of parameter effects as a coherent AB3 competence and distinguish it from prerequisite parameter determination. Evidence A is selected because changing and invariant properties are connected with admissible domains and model limits. Its transfer changes the parameter region or domain, preventing unchecked generalisation of statements from the positive bridge example.',
  ],
}
const selected = batch.goalIds.filter((goalId: string) => Object.hasOwn(rationales, goalId))
if (selected.length !== 14 || excluded.length + selected.length !== 20) throw new Error('The authorized partition must be exactly 14 plus 6')
for (const [goalId, a, b] of excluded) {
  const comparison = dual.summary.goals.find((goal: any) => goal.goalId === goalId)
  if (!comparison || comparison.firstDecision !== a || comparison.secondDecision !== b) throw new Error('Excluded decision changed: ' + goalId)
}
const expectedGoals = selected.map((goalId: string) => {
  const a = extractGoalDescriptionDualRoundResolutionSource({ artifacts: first, goalId, label: 'First' })
  const b = extractGoalDescriptionDualRoundResolutionSource({ artifacts: second, goalId, label: 'Second' })
  assertClean(goalId, [...a.errors, ...b.errors])
  if (!a.source || !b.source) throw new Error('Missing source ' + goalId)
  const dissent = ['c72a8032-71f6-56ed-a896-06ae435ff2ec', '993a14e8-60f0-5764-9340-b2447a5fa84b'].includes(goalId)
  if (a.source.decision !== 'keep' || b.source.decision !== (dissent ? 'revise' : 'keep')) throw new Error('Unauthorized source decision ' + goalId)
  const goal = first.input.goals.find((item: any) => item.goalId === goalId)
  return {
    goalId, effectiveSemanticKind: 'curricularAtomic',
    goalFingerprint: goal.goalFingerprint, pageFingerprint: goal.pageFingerprint,
    goalReviewContextFingerprint: a.source.binding.goalReviewContextFingerprint,
    finalText: { titleDe: goal.currentTitleDe, titleEn: goal.currentTitleEn, descriptionDe: goal.currentDescriptionDe, descriptionEn: goal.currentDescriptionEn },
    firstSource: a.source, secondSource: b.source,
  }
})
const synthesizedAt = new Date(Math.max(...[...first.resultPairs, ...second.resultPairs].map((pair: any) => Date.parse(pair.run.completedAt))) + 1000).toISOString()
const expected = {
  batch: {
    batchId: batch.batchId, batchManifestDigest: hash(manifestBytes),
    configDigest: hash(configBytes), bundleFingerprint: first.input.bundleFingerprint,
    bookDigest: first.input.bookDigest, reviewInputFingerprint: first.input.reviewInputFingerprint,
    dualSummaryDigest: hash(dualBytes), canonicalLandscapeDigest: hash(landscapeBytes),
  },
  rounds: {
    first: buildGoalDescriptionRolloutSynthesisRoundBinding(expectedGoals[0].firstSource.binding, batch.artifacts.rounds.first.batchInputFingerprint),
    second: buildGoalDescriptionRolloutSynthesisRoundBinding(expectedGoals[0].secondSource.binding, batch.artifacts.rounds.second.batchInputFingerprint),
  },
  synthesizedAt, goals: expectedGoals,
}
const payload = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
  schemaVersion: 1, synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
  manifestId: batch.batchId + '-current-14-synthesis',
  authority: 'ai_synthesis',
  synthesizedBy: 'Codex /root (AI adjudicator); /root/math_m7_batch20_review_a (technical integration)',
  synthesizedAt, batch: expected.batch, rounds: expected.rounds,
  decisions: expectedGoals.map((goal: any, index: number) => {
    const [rationaleDe, rationaleEn] = rationales[goal.goalId]
    return {
      decisionId: batch.batchId + '-current-14-decision-' + String(index + 1).padStart(2, '0'),
      goalId: goal.goalId, effectiveSemanticKind: goal.effectiveSemanticKind,
      goalFingerprint: goal.goalFingerprint, pageFingerprint: goal.pageFingerprint,
      goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
      finalText: goal.finalText, resolutionDecision: 'keep_current', evidenceRound: 'first',
      records: {
        first: { recordId: goal.firstSource.binding.recordId, recordDigest: goal.firstSource.binding.recordDigest },
        second: { recordId: goal.secondSource.binding.recordId, recordDigest: goal.secondSource.binding.recordDigest },
      },
      ...(goal.secondSource.decision === 'revise' ? {
        revisionDissent: {
          sourceRound: 'second', disposition: 'rejected_keep_current',
          proposedDescriptionDe: goal.secondSource.record.proposedDescriptionDe,
          proposedDescriptionEn: goal.secondSource.record.proposedDescriptionEn,
          rationaleDe, rationaleEn,
        },
      } : {}),
      rationaleDe, rationaleEn,
    }
  }),
}
const synthesis = { ...payload, manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload) }
assertClean('Subset synthesis manifest', (await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest: synthesis, expected })).errors)
const synthesisPath = 'synthesis-current-14.json'
const synthesisBytes = json(synthesis)
const artifacts: Array<{ path: string; content: string }> = [
  { path: 'dual-summary.json', content: dualBytes.toString() },
  { path: synthesisPath, content: synthesisBytes.toString() },
]
const validated: Array<{ goalId: string; path: string; digest: string; strictDescriptionComplete: boolean }> = []
for (const [index, goal] of expectedGoals.entries()) {
  const decision = synthesis.decisions[index]
  const summaryGoal = dual.summary.goals.find((item: any) => item.goalId === goal.goalId)
  const resolution = buildGoalDescriptionDualRoundResolution({
    resolutionId: batch.batchId + '-current-14-resolution-' + goal.goalId,
    goalId: goal.goalId, effectiveSemanticKind: goal.effectiveSemanticKind, decision: 'keep_current',
    synthesis: buildGoalDescriptionRolloutResolutionSynthesis({
      batchId: batch.batchId, manifest: synthesis, decision, summaryGoal,
      firstSource: goal.firstSource, secondSource: goal.secondSource,
    }),
    dualSummaryBytes: dualBytes, currentInput: first.input,
    firstSource: goal.firstSource, secondSource: goal.secondSource,
    synthesisDecisionManifest: {
      contract: synthesis.synthesisContract, manifestPath: synthesisPath,
      manifestId: synthesis.manifestId, manifestDigest: hash(synthesisBytes),
      manifestFingerprint: synthesis.manifestFingerprint, decisionId: decision.decisionId,
    },
  })
  const validation = await validateGoalDescriptionDualRoundResolution({
    resolution, dualSummary: dual.summary, dualSummaryBytes: dualBytes,
    currentInput: first.input, landscape, first, second,
    synthesisDecisionManifestArtifact: { manifest: synthesis, manifestBytes: synthesisBytes, manifestPath: synthesisPath },
  })
  assertClean(goal.goalId, validation.errors)
  if (!validation.strictDescriptionComplete) throw new Error('Strict description incomplete: ' + goal.goalId)
  if (stableGoalBookJson(resolution.synthesis.understandingEvidence) !== stableGoalBookJson(goal.firstSource.record.understandingEvidence)) throw new Error('Evidence A changed')
  const path = 'resolutions/' + goal.goalId + '.resolution.json'
  const bytes = json(resolution)
  artifacts.push({ path, content: bytes.toString() })
  validated.push({ goalId: goal.goalId, path, digest: hash(bytes), strictDescriptionComplete: true })
}
const receipt = {
  schemaVersion: 1, task: 'informed-current-14-subset-integration',
  batchId: batch.batchId, authority: 'ai_synthesis',
  adjudicator: 'Codex /root', technicalIntegrator: '/root/math_m7_batch20_review_a',
  actualIntegrationRecordedAt: '2026-09-20T18:38:52Z',
  nativeSynthesisTimestamp: synthesizedAt,
  timestampSemantics: 'Native deterministic synthesis binding is latest source-run completion plus one second; actualIntegrationRecordedAt records the informed integration separately.',
  independentReviewCountAdded: 0, originalSourceGoalCountPerRound: 20,
  scope: 'Exactly 12 KEEP/KEEP goals plus two explicitly adjudicated KEEP/REVISE goals; no whole-curriculum or human approval claim.',
  evidenceSelection: 'Unchanged understandingEvidence from round A for all 14 resolutions.',
  nativeValidators: [
    'validateGoalDescriptionReviewDualRound (complete unchanged 20-goal runs)',
    'validateGoalDescriptionRolloutSynthesisDecisionManifest (expected.goals is the authorized 14-goal subset)',
    'validateGoalDescriptionDualRoundResolution (all 14, complete source runs and current canonical landscape)',
  ],
  nativeValidationErrors: [], validatorsModified: false, fullChecksRun: false,
  sourceBindings: expected.rounds, canonicalLandscapeDigestAtIntegration: hash(landscapeBytes),
  synthesisManifestPath: synthesisPath, synthesisManifestDigest: hash(synthesisBytes),
  synthesisManifestFingerprint: synthesis.manifestFingerprint,
  explicitRejectedRevisionDissentGoalIds: payload.decisions.filter((decision: any) => decision.revisionDissent).map((decision: any) => decision.goalId),
  excludedOpenGoals: excluded.map(([goalId, firstDecision, secondDecision]) => ({ goalId, firstDecision, secondDecision, disposition: 'excluded_open_no_resolution' })),
  strictDescriptionCompleteCount: validated.length, resolutions: validated,
  noWritesTo: ['round-a', 'round-b', 'canonical', 'registry', 'positive-evidence-profiles', 'quality-status', 'visualization-QA'],
}
artifacts.push({ path: 'integration-current-14.receipt.json', content: json(receipt).toString() })
for (const artifact of artifacts) {
  let existing: Buffer | null = null
  try { existing = await read(artifact.path) } catch (error: any) { if (error.code !== 'ENOENT') throw error }
  if (existing && !existing.equals(Buffer.from(artifact.content))) throw new Error('Refusing to overwrite different existing artifact: ' + artifact.path)
  if (mode === '--verify' && !existing) throw new Error('Missing emitted artifact: ' + artifact.path)
}
if (mode === '--emit') {
  process.stdout.write(JSON.stringify({ artifacts: artifacts.map((artifact) => ({ ...artifact, path: relativeDirectory + '/' + artifact.path })) }))
} else {
  console.log('Native current-14 subset valid: strict=14/14, sources=20+20 unchanged, excluded=6, rejected revisions=2')
}
