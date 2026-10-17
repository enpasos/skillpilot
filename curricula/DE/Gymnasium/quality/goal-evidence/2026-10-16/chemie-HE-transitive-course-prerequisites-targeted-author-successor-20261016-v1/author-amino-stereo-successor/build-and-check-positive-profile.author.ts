// SPDX-License-Identifier: Apache-2.0
// Author profile serialization, not a scientific review or KEEP vote.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

async function main() {
  const repo = process.cwd()
  const host = path.join(repo, 'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1')
  const base = path.join(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-HE-transitive-course-prerequisites-targeted-author-successor-20261016-v1/author-amino-stereo-successor')
  const load = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
  const sha = (p: string) => createHash('sha256').update(fs.readFileSync(p)).digest('hex')
  const save = (rel: string, value: unknown, jsonl = false) => {
    const p = path.join(base, rel)
    fs.writeFileSync(p + '.tmp', JSON.stringify(value, null, jsonl ? undefined : 2) + '\n')
    fs.renameSync(p + '.tmp', p)
  }
  const modelPath = path.join(host, 'app/scripts/positiveGoalEvidenceProfileModel.ts')
  const { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } = await import(pathToFileURL(modelPath).href)
  const goal = load(path.join(base, 'ordinary-goal.author-draft.json'))
  const old = load(path.join(base, 'history/whole-goal.before.current-H634.json'))
  const material = load(path.join(base, 'two-complete-DE-EN-material-cases.author-draft.json'))
  assert.equal(goal.id, old.id)
  assert.deepEqual(Object.keys(old).filter(k => JSON.stringify(old[k]) !== JSON.stringify(goal[k])), ['description','descriptionEn','requires'])
  assert.deepEqual(goal.resourceLinks, old.resourceLinks)
  assert.deepEqual(goal.requires, ['92c99237-1c74-54fc-bf08-9191656afaa6', 'a9c22adc-b543-5b0c-a2d8-3189facdff08'])
  const image = goal.resourceLinks.find((r: any) => r.type === 'goal-visualization')
  const imagePath = path.join(host, 'app/public', image.url)
  const resourceDigests = { [image.url]: 'sha256:' + sha(imagePath) }
  const criteriaRel = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
  const criteria = 'sha256:' + sha(path.join(host, criteriaRel))
  const profile = {
    archetype: 'representation',
    expectations: [
      { id: 'chiral-achiral-enantiomer', essentialUnderstandingDe: 'Vier verschiedene Gruppen am tetraedrischen C ermöglichen Chiralität und ein nicht deckungsgleiches Spiegelbild; Glycin besitzt zwei gleiche H.', essentialUnderstandingEn: 'Four distinct groups at tetrahedral C allow chirality and a nonsuperimposable mirror image; glycine has two identical H groups.', observablePerformanceDe: 'Begründet Chiralität/Enantiomerie an Alanin oder Cystein, zeichnet das Spiegelbild und grenzt achirales Glycin ab.', observablePerformanceEn: 'Justifies chirality/enantiomerism in alanine or cysteine, draws the mirror and distinguishes achiral glycine.' },
      { id: 'spatial-to-fischer', essentialUnderstandingDe: 'Fischerprojektionen codieren räumliche Bindungsrichtungen: horizontal nach vorn, vertikal nach hinten.', essentialUnderstandingEn: 'Fischer projections encode spatial bond directions: horizontal forwards and vertical backwards.', observablePerformanceDe: 'Überführt das eindeutig räumlich gegebene Modell mit allen vier Gruppen und richtiger Tiefenbedeutung in die Fischerprojektion.', observablePerformanceEn: 'Converts an unambiguously specified spatial model into a complete Fischer projection with all four groups and correct bond depth.' },
      { id: 'standard-orientation-dl', essentialUnderstandingDe: 'D/L wird bei den betrachteten einfachen 2-Aminosäuren in der COOH-oben-/Seitenkette-unten-Orientierung an der Position der Aminogruppe abgelesen.', essentialUnderstandingEn: 'For the simple 2-amino acids considered, D/L is read from amino-group position with COOH at the top and the side chain at the bottom.', observablePerformanceDe: 'Normalisiert eine gedreht gegebene Darstellung ohne Konfigurationswechsel und ordnet D/L sowie das jeweilige Enantiomer begründet zu.', observablePerformanceEn: 'Normalizes a rotated input without changing configuration and justifies D/L and its enantiomer.' },
      { id: 'representation-transfer-and-limits', essentialUnderstandingDe: 'Erneute Fischerlesart nach 90° und ein einzelner Gruppentausch ändern Konfiguration; 180° erhält sie. Konnektivität allein und D/L allein tragen keine weitergehenden Raumaussagen bzw. Drehvorzeichen.', essentialUnderstandingEn: 'Renewed Fischer interpretation after 90° and one group exchange change configuration; 180° preserves it. Connectivity alone and D/L alone do not determine additional spatial information or rotation sign respectively.', observablePerformanceDe: 'Erklärt Darstellungsfehler selbstständig am Tiefenmodell, überträgt auf einen neuen Seitenkettenrest und erkennt unzureichende Angaben ohne CIP-/R/S- oder Polarimetriebehauptung.', observablePerformanceEn: 'Independently explains representation errors using bond depth, transfers to a new side chain and identifies insufficient information without a CIP/R/S or polarimetry claim.' },
    ],
    coverageExpectations: { requiredExpectationIds: ['chiral-achiral-enantiomer','spatial-to-fischer','standard-orientation-dl','representation-transfer-and-limits'], alternativeExpectationGroups: [], minimumIndependentDemonstrations: 2, freshVariationRequired: true, independentTransferRequired: true },
    variationAxes: [
      { id: 'alanine-cysteine-serine-glycine', textDe: 'CH3-, CH2SH- und CH2OH-Seitenkette, dazu achirales Glycin mit zwei H.', textEn: 'CH3, CH2SH and CH2OH side chains plus achiral glycine with two H groups.' },
      { id: 'input-orientation-and-depth', textDe: 'Standardorientiert oder um180° gedreht vorgegebenes Raummodell; zulässige und unzulässige neue Fischerlesarten.', textEn: 'Standard or180°-rotated supplied spatial models; permitted and invalid renewed Fischer interpretations.' },
    ],
    applicationCaseBriefs: material.cases.map((c: any) => ({
      id: c.id,
      taskDemandDe: c.materialsDe + '\n\nAufgaben:\n' + c.tasksDe.map((t: string, i: number) => `${i+1}. ${t}`).join('\n'),
      taskDemandEn: c.materialsEn + '\n\nTasks:\n' + c.tasksEn.map((t: string, i: number) => `${i+1}. ${t}`).join('\n'),
      expectedPerformanceDe: c.solutionDe + `\n\nKriteriale Rubrik /${c.maxPoints}:\n` + c.rubric.map((r: any) => `${r.id} (${r.maxPoints} P): ${r.criterionDe}`).join('\n'),
      expectedPerformanceEn: c.solutionEn + `\n\nCriterion rubric /${c.maxPoints}:\n` + c.rubric.map((r: any) => `${r.id} (${r.maxPoints} points): ${r.criterionEn}`).join('\n'),
      understandingFocusDe: c.transferDe + ' Zwei unabhängige Nachweisschritte können innerhalb einer integrierten Leistung auftreten. Die zwei Fälle sind keine Pflichtaufgabenquote. Sobald alle Aspekte und eigenständiger Transfer hinreichend gezeigt sind, endet die Prüfung. Kein beobachteter Versuch oder Lernerfolg ist behauptet.',
      understandingFocusEn: c.transferEn + ' Two independent demonstration steps may occur within one integrated performance. The two cases are not a mandatory task quota. Stop assessment when all aspects and independent transfer are sufficiently shown. No observed experiment or learner success is asserted.',
    })),
  }
  // The schema bounds each brief to2000 characters. Full bilingual originals
  // remain in the separately pinned material file; these briefs retain all
  // supplied spatial directions, tasks, results and twelve-point criteria.
  const concise = [
    {
      taskDemandDe: 'Eigenes synthetisches Raummodell, keine Messung. Neutrale Formeln sind Darstellungshilfen. Alanin HOOC–CH(NH2)–CH3: COOH oben/hinten, CH3 unten/hinten, NH2 links/vorn, H rechts/vorn am tetraedrischen C. Glycin: zentrale Gruppen NH2, COOH, H, H. Fischerkonvention: horizontal vorn, vertikal hinten; bei COOH oben/Seitenkette unten bedeutet NH2 links L, rechts D. D/L legt kein Drehvorzeichen fest; kein CIP/R/S. 1) Überführe das vollständige Raummodell in Fischer und ordne D/L begründet zu. 2) Begründe Chiralität, zeichne das vollständige Spiegelbild und erkläre Nichtdeckungsgleichheit. 3) Prüfe Glycin auf Stereozentrum/DL-Paar. 4) Frischer Transfer: Beurteile90°-Drehung mit erneuter Fischerlesart gegenüber180°; begründe, warum bloße Konnektivität ohne Tiefenangaben keine eindeutige Konfiguration festlegt. Ganze Ausführung/Einzelrubrik: two-complete-DE-EN-material-cases.author-draft.json, Fall amino-spatial-fischer-alanine-glycine.',
      taskDemandEn: 'Own synthetic spatial model, not a measurement. Neutral formulas are representation aids. Alanine HOOC–CH(NH2)–CH3 has COOH top/back, CH3 bottom/back, NH2 left/front, H right/front at tetrahedral C. Glycine: central groups NH2, COOH, H, H. Fischer convention: horizontal front, vertical back; with COOH top/side chain bottom, amino left means L and right D. D/L determines no rotation sign; no CIP/R/S. 1) Convert the complete spatial input to Fischer and justify D/L. 2) Explain chirality, draw the complete mirror and explain nonsuperimposability. 3) Examine glycine for a stereocentre/DL pair. 4) Fresh transfer: assess90° rotation with renewed Fischer reading against180°; explain why connectivity without depth does not fix unique configuration. Complete original/individual rubric: two-complete-DE-EN-material-cases.author-draft.json, amino-spatial-fischer-alanine-glycine.',
      expectedPerformanceDe: 'A: COOH oben, CH3 unten, NH2 links, H rechts; horizontal vorn/vertikal hinten, daher L. Vier verschiedene Substituenten am tetraedrischen C begründen Chiralität. Spiegel: COOH oben, CH3 unten, H links, NH2 rechts, D; gleiche Konstitution, nicht deckungsgleich. Glycin hat zwei H, ist achiral und hat kein D/L-Enantiomerenpaar. 90° plus neue Fischerinterpretation tauscht Tiefenkategorien und kehrt Konfiguration um;180° erhält sie. Zum D/L-Ablesen wieder Standardorientierung prüfen. Konnektivität ohne Raumangaben legt weder ein bestimmtes Enantiomer noch automatisch ein Racemat fest. Rubrik/12:3P Projektion (alle Gruppen1, Tiefe1, begründetesL1);3P Enantiomerie (vierGruppen1, D-Spiegel1, Nichtdeckung1);2P Glycin (zweiH/keinStereozentrum1, achiral/keinDL1);4P Transfer (90°nichtidentisch1, Tiefe1,180°/Standard1, Unterbestimmtheit/keinRacemat1).',
      expectedPerformanceEn: 'A: COOH top, CH3 bottom, NH2 left, H right; horizontal front/vertical back, therefore L. Four distinct substituents at tetrahedral C justify chirality. Mirror: COOH top, CH3 bottom, H left, NH2 right, D; identical connectivity, nonsuperimposable. Glycine has two H groups, is achiral and has no D/L enantiomer pair. 90° plus renewed Fischer interpretation changes depth categories and reverses configuration;180° preserves it. Restore standard orientation before reading D/L. Connectivity without spatial information specifies neither one enantiomer nor an assumed racemate. Rubric/12:3 points projection (all groups1, depth1, justifiedL1);3 enantiomerism (four groups1, D mirror1, nonsuperimposability1);2 glycine (twoH/no centre1, achiral/noDL1);4 transfer (reject90°identity1, depth1,180°/standard1, underdetermination/no assumed racemate1).',
    },
    {
      taskDemandDe: 'Eigenes synthetisches Raummodell mit neutralen Darstellungsformeln, keine Messung. Cystein HOOC–CH(NH2)–CH2SH: CH2SH oben/hinten, COOH unten/hinten, H links/vorn, NH2 rechts/vorn. Fischer: horizontal vorn, vertikal hinten. D/L erst bei COOH oben/Seitenkette unten: NH2 links L, rechts D.180° in der Papierebene erhält Konfiguration; ein Gruppentausch kehrt sie um. Glycinvergleich: NH2,COOH,H,H. Frisches SerinC: COOH oben/hinten,CH2OH unten/hinten,H links/vorn,NH2 rechts/vorn. 1) Zeichne gegebenesB und normalisiere durch erlaubte Umformung; bestimme D/L und korrigiere „rechts alsoD“. 2) Begründe Chiralität, zeichne Spiegelbild, vergleicheGlycin und Seitenkettenwechsel. 3) Beurteile180°,90° mit erneuter Fischerinterpretation und einmalNH2↔H mit Tiefenbegründung. 4) Zeichne frischesSerin und Spiegel, ordneD/L; beurteile „L heißt linksdrehend; Schwefel verlangtCIP zumDL-Lesen“. KeinR/S/CIP und keinePolarimetrie bestimmen. Ganze Ausführung: two-complete-DE-EN-material-cases.author-draft.json, amino-spatial-fischer-cysteine-serine-transfer.',
      taskDemandEn: 'Own synthetic spatial model using neutral representation formulas, not measured data. Cysteine HOOC–CH(NH2)–CH2SH: CH2SH top/back, COOH bottom/back, H left/front,NH2 right/front. Fischer horizontal means front,vertical back. Read D/L only with COOH top/side chain bottom: amino left L,right D.180° on paper preserves configuration; one group exchange reverses it. Glycine comparison: NH2,COOH,H,H. Fresh serineC: COOH top/back,CH2OH bottom/back,H left/front,NH2 right/front. 1) Draw suppliedB and normalize using a permitted transformation; assign D/L and correct “right thereforeD”. 2) Justify chirality,draw mirror,compare glycine and side-chain change. 3) Assess180°,90° plus renewed Fischer interpretation and oneNH2/H exchange using bond depth. 4) Draw fresh serine/mirror and assignD/L; assess “L means left-rotating; sulfur requiresCIP to readDL”. Determine noR/S/CIP or polarimetry. Complete original: two-complete-DE-EN-material-cases.author-draft.json, amino-spatial-fischer-cysteine-serine-transfer.',
      expectedPerformanceDe: 'B anfangs obenCH2SH,untenCOOH,linksH,rechtsNH2. Nach180°: obenCOOH,untenCH2SH,linksNH2,rechtsH, somitL-Cystein; die Eingabe war nicht standardorientiert. Vier verschiedene Gruppen begründen Chiralität; Spiegel in Standardorientierung hatNH2 rechts,H links und istD-Cystein/nichtdeckungsgleich. Glycin mit zweiH istachiral. Seitenkette ändert nicht die D/L-Konvention.180° erhält horizontale/vertikale Tiefenkategorien;90° mit erneuter Fischerlesart oder ein einzelner Tausch kehrt Konfiguration um. Rotation des realen Moleküls ist keine Enantiomerenumwandlung. FrischesSerin: COOH oben,CH2OH unten,H links,NH2 rechts=D; Spiegel=L. D/L sagtkein Drehvorzeichen voraus, zum Ablesen standardisiertenCysteins istkeinCIP nötig. Rubrik/12:3P B-Kreuz1/180°mitvierEndpositionen1/LundKorrektur1;3P vierGruppen1/D-Spiegel1/GlycinundSeitenkettenregel1;3P180°Tiefenbezug1/90°Umkehr1/einTauschundMolekülrotation1;3P frischesD-Serin+L-Spiegel1/DLnichtDrehvorzeichen1/keinCIPundkeineMessbehauptung1.',
      expectedPerformanceEn: 'InitialB hasCH2SH top,COOH bottom,H left,NH2 right. After180°: COOH top,CH2SH bottom,NH2 left,H right, henceL-cysteine; input was not standardized. Four distinct groups justify chirality; the standard mirror hasNH2 right,H left and is nonsuperimposableD-cysteine. Glycine with twoH groups isachiral. Side-chain change does not change the D/L convention.180° preserves horizontal/vertical depth categories;90° plus renewed Fischer reading or one exchange reverses configuration. Real molecular rotation does not interconvert enantiomers. Fresh serine: COOH top,CH2OH bottom,H left,NH2 right=D; mirror=L. D/L predicts no optical rotation sign; reading standardized cysteine requires noCIP. Rubric/12:3 points initialcross1/180°withfourfinalpositions1/Landcorrection1;3 fourgroups1/Dmirror1/glycineandside-chainrule1;3 depthat180°1/reversalat90°1/oneexchangeversusrealrotation1;3 freshD-serineandLmirror1/DLnotrotationsign1/noCIPorunsupportedmeasurement1.',
    },
  ]
  const readable = (value: string) => value
    .replace(/([a-zäöüß])([A-ZÄÖÜ])/gu, '$1 $2')
    .replace(/([a-zäöüß])((?:90|180)°)/gu, '$1 $2')
    .replace(/([,;:])(?=[A-Za-zÄÖÜäöüß])/gu, '$1 ')
    .replaceAll('istachiral', 'ist achiral').replaceAll('isachiral', 'is achiral')
    .replaceAll('hatNH2', 'hat NH2').replaceAll('hatCH2SH', 'hat CH2SH')
    .replaceAll('nach180°', 'nach 180°').replaceAll('nur180°', 'nur 180°')
    .replaceAll('alleGruppen', 'alle Gruppen')
  concise[0].expectedPerformanceDe = 'A: COOH oben, CH3 unten, NH2 links, H rechts; horizontal vorn und vertikal hinten, daher L. Vier verschiedene Gruppen am tetraedrischen C begründen Chiralität. Das Spiegelbild hat COOH oben, CH3 unten, H links und NH2 rechts: D, gleiche Konstitution und nicht deckungsgleich. Glycin trägt zwei H, ist achiral und hat kein D/L-Enantiomerenpaar. 90° plus erneute Fischerlesart tauscht die Tiefenkategorien und kehrt die Konfiguration um; 180° erhält sie. Zum D/L-Ablesen Standardorientierung wiederherstellen. Konnektivität ohne Raumangaben legt weder ein bestimmtes Enantiomer noch automatisch ein Racemat fest. Rubrik /12: Projektion 3 P (vier Gruppen 1, Tiefe 1, L begründen 1); Enantiomerie 3 P (vier verschiedene Gruppen 1, D-Spiegel 1, Nichtdeckungsgleichheit 1); Glycin 2 P (zwei H/kein Stereozentrum 1, achiral/kein D/L-Paar 1); Transfer 4 P (90° nicht identisch 1, Tiefenbezug 1, 180°/Standardorientierung 1, Unterbestimmtheit/kein unterstelltes Racemat 1).'
  concise[0].expectedPerformanceEn = 'A: COOH top, CH3 bottom, NH2 left, H right; horizontal forwards and vertical backwards, therefore L. Four distinct groups at tetrahedral C justify chirality. Its mirror has COOH top, CH3 bottom, H left and NH2 right: D, identical connectivity and nonsuperimposable. Glycine has two H groups, is achiral and has no D/L enantiomer pair. 90° plus renewed Fischer reading changes depth categories and reverses configuration; 180° preserves it. Restore standard orientation before reading D/L. Connectivity without spatial information specifies neither one enantiomer nor an assumed racemate. Rubric /12: projection 3 points (all groups 1, depth 1, justified L 1); enantiomerism 3 (four distinct groups 1, D mirror 1, nonsuperimposability 1); glycine 2 (two H/no stereocentre 1, achiral/no D/L pair 1); transfer 4 (reject 90° identity 1, depth 1, 180°/standard orientation 1, underdetermination/no assumed racemate 1).'
  concise[1].expectedPerformanceDe = 'B anfangs: CH2SH oben, COOH unten, H links, NH2 rechts. Nach 180°: COOH oben, CH2SH unten, NH2 links, H rechts, daher L-Cystein; die Eingabe war nicht standardorientiert. Vier verschiedene Gruppen begründen Chiralität. Der standardisierte Spiegel hat NH2 rechts und H links: nicht deckungsgleiches D-Cystein. Glycin mit zwei H ist achiral. Die Seitenkette ändert die D/L-Konvention nicht. 180° erhält die Tiefenkategorien; 90° mit erneuter Fischerlesart oder ein einzelner Gruppentausch kehrt die Konfiguration um. Reale Moleküldrehung wandelt Enantiomere nicht ineinander um. Serin C: COOH oben, CH2OH unten, H links, NH2 rechts = D; Spiegel = L. D/L legt kein Drehvorzeichen fest; zum Ablesen standardisierten Cysteins wird kein CIP benötigt. Rubrik /12: B-Normalisierung 3 P (gegebenes Kreuz 1, 180° mit allen Endpositionen 1, L und Fehlerkorrektur 1); Chiralität/Spiegel 3 P (vier Gruppen 1, D-Spiegel 1, Glycin und Seitenkettenregel 1); Umformungen 3 P (180° mit Tiefe 1, 90°-Umkehr 1, Tausch versus Moleküldrehung 1); frischer Transfer 3 P (D-Serin/L-Spiegel 1, D/L versus Drehvorzeichen 1, ohne CIP oder Messbehauptung 1).'
  concise[1].expectedPerformanceEn = 'Initial B: CH2SH top, COOH bottom, H left, NH2 right. After 180°: COOH top, CH2SH bottom, NH2 left, H right, hence L-cysteine; the input was nonstandard. Four distinct groups justify chirality. The standard mirror has NH2 right and H left: nonsuperimposable D-cysteine. Glycine with two H groups is achiral. A new side chain does not change the D/L convention. 180° preserves depth categories; 90° plus renewed Fischer reading or one exchange reverses configuration. Real molecular rotation does not interconvert enantiomers. Serine C: COOH top, CH2OH bottom, H left, NH2 right = D; mirror = L. D/L determines no rotation sign; reading standardized cysteine needs no CIP. Rubric /12: B normalization 3 points (input cross 1, 180° with all final positions 1, L and correction 1); chirality/mirror 3 (four groups 1, D mirror 1, glycine/side-chain rule 1); transformations 3 (180° with depth 1, reversal at 90° 1, exchange versus molecular rotation 1); fresh transfer 3 (D-serine/L mirror 1, D/L versus rotation sign 1, no CIP or measurement claim 1).'
  profile.applicationCaseBriefs.forEach((brief: any, i: number) => Object.assign(brief, Object.fromEntries(Object.entries(concise[i]).map(([key, value]) => [key, readable(value)]))))
  const record = {
    $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json', schemaVersion: 2,
    reviewId: 'chemie-amino-stereo-bounded-spatial-author-successor-20261016-v1', goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2',
    reviewCriteriaFingerprint: criteria, landscapeId: 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0', goalId: goal.id,
    goalFingerprint: fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'),
    reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goal, criteria, resourceDigests, 'curricularAtomic'),
    profileFingerprint: fingerprintPositiveGoalEvidenceProfile(profile), status: 'needs_human_review', reviewAuthority: 'ai_candidate', reviewedAt: '2026-10-16T14:10:35Z',
    reviewer: 'AUTHOR /root/chemie_native17_independent_b_20261016/local_practical_route_author_design; no independent review',
    reason: 'Eigenes vollständiges E0/G0-Nachfolgedesign nach freigegebenem Fehlerbefund: räumlich bestimmte Strukturmodelle statt alleiniger R/S-Namen. Zwei ganze DE/EN-Fälle mit vollständigen Materialien, Lösungen, Rubriken und Transfer. Zwei neue unabhängige Inhaltsreviews offen; keine KEEP-Stimme, Lernendenbeobachtung, Human Approval oder Human Trial.',
    evidenceLevel: 'E0', maximumClaimScope: 'G0', reviewRunIds: [],
    dissent: ['Altes vollständiges CIP/R/S-Profil bleibt im history-Verzeichnis exact und wird durch dieses author-draft nicht freigegeben.', 'HE-/Länder-Scope, aktuelle Source-Mappings, native D-Seiten sowie A/M/V-Bindungen sind getrennt von dieser Aufgabenserialisierung zu prüfen.'],
    profile,
  }
  const errors = validatePositiveGoalEvidenceRecordSemantics(record, goal, resourceDigests, 'curricularAtomic')
  assert.deepEqual(errors, [])
  const requireFromApp = createRequire(path.join(repo, 'app/package.json'))
  const Ajv = requireFromApp('ajv/dist/2020').default
  const ajv = new Ajv({ allErrors: true, strict: false })
  requireFromApp('ajv-formats').default(ajv)
  const schemaPath = path.join(host, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
  const validate = ajv.compile(load(schemaPath))
  assert.ok(validate(record), JSON.stringify(validate.errors))
  for (const c of material.cases) {
    assert.equal(c.rubric.reduce((sum: number, r: any) => sum+r.maxPoints, 0), c.maxPoints)
    assert.equal(c.tasksDe.length, 4)
    assert.equal(c.tasksEn.length, 4)
    assert.ok(c.materialsDe && c.materialsEn && c.solutionDe && c.solutionEn && c.transferDe && c.transferEn)
  }
  save('positive-profile.complete.author-draft.json', record)
  save('positive-profile.complete.author-draft.jsonl', record, true)
  const config = { $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json', schemaVersion: 2, reviewId: record.reviewId, goalFingerprintRuleVersion: record.goalFingerprintRuleVersion, profileRuleVersion: record.profileRuleVersion, landscapeId: record.landscapeId, landscapePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json', semanticKindLedgerPath: 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json', reviewCriteriaPath: criteriaRel, reviewPath: path.relative(repo, path.join(base, 'positive-profile.complete.author-draft.jsonl')), reviewedResourceTypes: ['goal-visualization'], requireApproved: false, scope: { label: 'Single bounded amino-acid spatial/Fischer/DL author successor; independent reviews pending', goalIds: [goal.id] } }
  save('P.author-draft.config.json', config)
  save('CHECK.author-structure-profile-bindings-and-arithmetic.json', {
    role: 'AUTHOR technical check; not a scientific content review', status: 'draft', evidenceLevel: 'E0', maximumClaimScope: 'G0',
    wholeGoalSha256: sha(path.join(base, 'ordinary-goal.author-draft.json')), exactChangedGoalFields: ['description','descriptionEn','requires'], imageSha256: sha(imagePath), resourceLinksUnchanged: true,
    wholeProfileSchemaValid: true, stockPositiveSemanticErrors: errors, wholeCaseCount: material.cases.length, casePointTotals: material.cases.map((c: any) => ({ id: c.id, rubricTotal: c.rubric.reduce((n: number, r: any) => n+r.maxPoints,0), declaredTotal: c.maxPoints })),
    actualCodePins: [{ path: path.relative(repo, modelPath), sha256: sha(modelPath) }, { path: path.relative(repo,schemaPath), sha256: sha(schemaPath) }, { path: path.relative(repo,path.join(host,criteriaRel)), sha256: sha(path.join(host,criteriaRel)) }],
    goalFingerprint: record.goalFingerprint, reviewInputFingerprint: record.reviewInputFingerprint, profileFingerprint: record.profileFingerprint,
    requiredIndependentReviews: 2, completedIndependentReviews: 0, noNormalOrHMutation: true, noReviewLedgerMutation: true, noHumanApproval: true, noHumanTrial: true,
  })
  process.stdout.write(JSON.stringify({ goalId: goal.id, wholeGoalSha256: sha(path.join(base,'ordinary-goal.author-draft.json')), profileFileSha256: sha(path.join(base,'positive-profile.complete.author-draft.json')), casesFileSha256: sha(path.join(base,'two-complete-DE-EN-material-cases.author-draft.json')), goalFingerprint:record.goalFingerprint, profileFingerprint:record.profileFingerprint, reviewInputFingerprint:record.reviewInputFingerprint, errors, cases:material.cases.length, pointsEach:12 },null,2)+'\n')
}
main().catch(e => { process.stderr.write(String(e)+'\n'); process.exitCode=1 })
