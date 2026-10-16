import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { ROOT_DIR, buildVisualizationPaths, createGoalVisualizationLink } from '../../../../../../../scripts/goal_visualization_common.mjs'
const out = path.dirname(fileURLToPath(import.meta.url))
const pin = p => ({ path: path.relative(ROOT_DIR, p).split(path.sep).join('/'), sha256: `sha256:${crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}`, bytes: fs.statSync(p).size })
const base = path.join(ROOT_DIR, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-eleven-scope-six-boundaries-whole-author-20261015-v1/candidate/canonical570.current426.bcp-eleven-six-boundaries.author.json')
const rows = JSON.parse(fs.readFileSync(base, 'utf8')).goals
const habitatPath = path.join(ROOT_DIR, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-identification-field-habitat-transfer-corrections-author-20261015-v1/candidate/one-whole-habitat-goal.unreviewed-author.json')
const habitatContainer = JSON.parse(fs.readFileSync(habitatPath, 'utf8'))
const habitat = habitatContainer.wholeGoal ?? habitatContainer.goal ?? habitatContainer
const bioPath = path.join(ROOT_DIR, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const bio = JSON.parse(fs.readFileSync(bioPath, 'utf8'))
const source = process.argv[2]
if (!source || !fs.existsSync(source)) throw new Error('Pass the preserved generated field PNG')
const ids = ['0f632595-5875-5a95-83d8-7de3180bdaa6', '9d6e1966-b10c-5a70-b215-df7007c95b07']
const wholeGoals = []
const assets = []
let original
for (const id of ids) {
  const before = rows.find(g => g.id === id)
  const goal = structuredClone(before)
  const p = buildVisualizationPaths(goal, { subjectPath: 'chemie', lang: 'de', extension: 'png' })
  const file = path.join(out, 'candidate-v1/visualizations/chemie', id, p.fileName)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  if (fs.existsSync(file)) {
    if (pin(file).sha256 !== `sha256:${crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex')}`) throw new Error(`Refusing changed bytes ${file}`)
  } else if (!original) fs.copyFileSync(source, file)
  else fs.symlinkSync(path.relative(path.dirname(file), original), file)
  if (!original) original = file
  const altText = id === ids[0]
    ? 'Schematische Freilandaufnahme einer Wiese: Ein abgegrenzter Stichprobenrahmen, verschiedene Pflanzenformen, Bestimmungsliteratur sowie Geräte und ein Beobachtungsblatt zeigen Erfassung und Dokumentation. Es sind keine echten Messwerte, Kausalnachweise oder Habitateignungsurteile dargestellt.'
    : 'Schematische Bestimmungssituation in einer Wiese: Eine lernende Person nutzt eine Lupe und ein Bestimmungsbuch mit unterschiedlichen Blattmerkmalen. Der Pflanzenvergleich und das Beobachtungsblatt regen zur begründeten Zuordnung an; eine bestimmte Art ist nicht als bestätigt ausgegeben.'
  goal.resourceLinks = [createGoalVisualizationLink(goal, {
    publicUrl: p.publicUrl, provider: 'OpenAI image_gen.imagegen', lang: 'de', license: 'CC-BY-4.0; AI-generated, SkillPilot-curated',
    reviewStatus: 'pilot', description: `Didaktisches Orientierungsbild: ${goal.title}.`, altText,
  }), ...(goal.resourceLinks ?? []).filter(l => !(l.type === 'goal-visualization' && l.role === 'primary' && (l.lang ?? 'de') === 'de'))]
  const check = structuredClone(goal); check.resourceLinks = before.resourceLinks
  if (JSON.stringify(check) !== JSON.stringify(before)) throw new Error('Non-image change')
  wholeGoals.push(goal); assets.push({ goalId: id, file: pin(file), sameOriginalRaster: true, relativeSymlink: fs.lstatSync(file).isSymbolicLink() ? fs.readlinkSync(file) : null })
}
for (const [id, sourceId, altText] of [
  ['07bf5fab-9379-5b3c-a6fc-b892fcfa9a49', '19f806d2-d4e3-5ad4-98a8-1d61bdd81e3d', 'Eine schematische Bohnenkeimung mit Wurzel, Spross und Blättern sowie Wasser, Luft und Wärme zeigt mögliche Lebensanforderungen. Licht ist ausdrücklich dem späteren Wachstum zugeordnet. Dies ist keine Messreihe oder kontrolliert durchgeführte Untersuchung.'],
  ['843484b9-1acf-54e0-a030-bc214b3b0656', 'e4791f8d-ea87-504b-979e-2f976e72e66d', 'Eine ausdrücklich schematische Landschaftskarte mit Eidechsenbeobachtungen steht neben Sonnen- und Schattenplatz mit unterschiedlichen Temperaturen. Das Bild regt zu Standortfragen an, beweist aber weder alleinige Ursachen noch bereits eine Habitateignung oder eine ausgeführte Wirkungsprüfung.'],
]) {
  const before = id.startsWith('8434') ? habitat : rows.find(g => g.id === id)
  if (before.id !== id) throw new Error('Whole habitat goal container does not resolve')
  const goal = structuredClone(before)
  const sourceGoal = bio.goals.find(g => g.id === sourceId)
  const oldLink = sourceGoal.resourceLinks.find(l => l.type === 'goal-visualization' && l.role === 'primary' && l.lang === 'de')
  const physical = path.join(ROOT_DIR, 'curricula/DE/Gymnasium/visualizations/biologie', sourceId, `${sourceId}.png`)
  const p = buildVisualizationPaths(goal, { subjectPath: 'chemie', lang: 'de', extension: 'png' })
  const file = path.join(out, 'candidate-v1/visualizations/chemie', id, p.fileName)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  if (fs.existsSync(file)) throw new Error(`Refusing to overwrite ${file}`)
  fs.symlinkSync(path.relative(path.dirname(file), physical), file)
  goal.resourceLinks = [createGoalVisualizationLink(goal, { publicUrl: p.publicUrl, provider: oldLink.provider, lang: 'de', license: oldLink.license, reviewStatus: 'pilot', description: `Didaktisches Orientierungsbild: ${goal.title}.`, altText }), ...(goal.resourceLinks ?? []).filter(l => !(l.type === 'goal-visualization' && l.role === 'primary' && (l.lang ?? 'de') === 'de'))]
  const check = structuredClone(goal); check.resourceLinks = before.resourceLinks
  if (JSON.stringify(check) !== JSON.stringify(before)) throw new Error('Non-image change')
  wholeGoals.push(goal)
  assets.push({ goalId: id, file: pin(file), strategy: 'KEEP existing Biology bytes as a new unreviewed Chemistry image binding', original: pin(physical), originalWholeResourceLink: oldLink, relativeSymlink: fs.readlinkSync(file), originalBiologyFilesChanged: false })
}
fs.writeFileSync(path.join(out, 'candidate-v1/four-whole-goals.image-only.unreviewed.json'), JSON.stringify({ schemaVersion: 1, role: 'Four inactive whole child image bindings; one new shared field raster and two existing-byte reuses', baseCanonical: pin(base), preImageWholeHabitatGoal: pin(habitatPath), wholeGoals, changedFieldsExactly: ['resourceLinks'], other566GoalsUnchanged: true, noComplete570Written: true, newStrict: 0 }, null, 2) + '\n')
fs.writeFileSync(path.join(out, 'PROVENANCE.one-shared-field-PNG-and-two-reuses.author.json'), JSON.stringify({ schemaVersion: 1, actualToolForNewRaster: 'OpenAI image_gen.imagegen', modelVersion: 'not exposed', nativeFormat: 'PNG', nativeSize: [1672, 941], assets, existingBiologyCanonicalForProvenance: pin(bioPath), prompt: pin(path.join(out, 'PROMPT.exact-field-imagegen.txt')), originalGeneratedBytesPreserved: true, newImageReason: 'Actual existing ebe overview is crowded in the small GoalCard and combines identification, field survey, manipulation and an ambiguous generic biodiversity/habitat suitability shortcut. A shared observational motif keeps identification and field recording visible without claiming suitability or a causal experiment.', reuseReason: 'Two personally inspected existing Biology images clearly orient to organism requirements and observed distribution/abiotic variation. Their actual new Chemistry bindings require independent V; no Biology goal, approval, resource or protected M7 input is modified.', generationIsNotApproval: true, authorVisibleLimitsPendingIndependentV: ['Book and clipboard perspective must be checked against the actual learner position.', 'The magnifier/book relationship and plant traits must remain recognisable at316px.', 'The tally illustration is schematic, not observed count data.', 'The reused orientation motifs are not performed experiments or proof of habitat suitability.'], normalVGrants: 0, humanApproval: false, humanTrial: false, activeRuntimeChanges: false }, null, 2) + '\n')
console.log(JSON.stringify({ wholeGoals: wholeGoals.length, originalRasters: 1, relativeAliases: 1, assets }))
