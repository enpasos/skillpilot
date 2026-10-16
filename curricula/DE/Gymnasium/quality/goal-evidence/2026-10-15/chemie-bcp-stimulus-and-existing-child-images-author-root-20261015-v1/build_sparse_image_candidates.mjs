import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { ROOT_DIR, buildVisualizationPaths, createGoalVisualizationLink } from '../../../../../../../scripts/goal_visualization_common.mjs'

const out = path.dirname(fileURLToPath(import.meta.url))
const rel = p => path.relative(ROOT_DIR, p).split(path.sep).join('/')
const pin = p => ({ path: rel(p), sha256: `sha256:${crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}`, bytes: fs.statSync(p).size })
const base = path.join(ROOT_DIR, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-eleven-scope-six-boundaries-whole-author-20261015-v1/candidate/canonical570.current426.bcp-eleven-six-boundaries.author.json')
const rows = JSON.parse(fs.readFileSync(base, 'utf8')).goals
const current = path.join(ROOT_DIR, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-kp-one-mobile-standard-state-image-correction-author-root-20261015-v1/candidate-v1/canonical560.current422.one-Kp-PNG.image-only-author.json')
const currentRows = JSON.parse(fs.readFileSync(current, 'utf8')).goals
const cfa = path.join(ROOT_DIR, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-lab15-analysis-image-readable-bounded-successor-author-root-20261015-v2/candidate/source/visualizations/chemie/cfa5c1e4-6714-5be7-9a57-a24b201b6231/cfa5c1e4-6714-5be7-9a57-a24b201b6231.png')
const enzyme = path.join(ROOT_DIR, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v2/images/b4ca3af2-77f1-59e8-955d-c4959e284242/b4ca3af2-77f1-59e8-955d-c4959e284242.png')
const mimosa = process.argv[2]
if (!mimosa || !fs.existsSync(mimosa)) throw new Error('Pass the preserved generated Mimosa PNG path')
const definitions = [
  ['57d2c98d-30b8-5123-b823-e56a4f22b191', cfa, 'reuse-existing-bytes', 'Drei schematische Arbeitsschritte: Probe vorbereiten, untersuchen und Ergebnisse auswerten; Filtration, Laborprüfung und Dokumentation dienen der Orientierung zur Gemischanalyse. Das Bild enthält keine Messwerte oder bestätigte Stoffidentität.'],
  ['7b80efe6-b77d-5ace-8886-973ba38e6f9e', cfa, 'reuse-existing-bytes', 'Schematische Probenvorbereitung, Untersuchung und Auswertung mit Laborgeräten und dokumentiertem Vergleich; eine einzelne sichtbare Reaktion beweist keine eindeutige Identität eines unbekannten Reinstoffs.'],
  ['dd59351e-3b16-5104-b7c6-ff9e402e4de7', enzyme, 'reuse-existing-bytes', 'Schematische pH-Aktivitätskurven für Pepsin und Amylase mit unterschiedlichen Optima verdeutlichen einen möglichen Außenfaktor. Die Kurven sind keine Messreihe des zu planenden kontrollierten Versuchs und kein allgemeines Temperaturoptimum.'],
  ['c8198159-2109-5ad0-9d37-252ebac0219d', path.resolve(mimosa), 'new-original-raster', 'Zwei schematische Mimosa-Pflanzen auf festen Unterlagen: links eine weiche Pinselberührung am Blatt mit angedeuteter möglicher Faltung, rechts eine berührungsfreie Vergleichsbewegung. Eine Uhr mit Fragezeichen fordert zum zeitbezogenen Beobachten und Vergleichen auf. Keine Messwerte oder zellulären Ursachen sind dargestellt.'],
]
const wholeGoals = []
const assets = []
for (const [id, source, strategy, altText] of definitions) {
  const old = rows.find(g => g.id === id)
  if (!old) throw new Error(`Missing whole goal ${id}`)
  const goal = structuredClone(old)
  const paths = buildVisualizationPaths(goal, { subjectPath: 'chemie', lang: 'de', extension: 'png' })
  const file = path.join(out, 'candidate-v1/visualizations/chemie', id, paths.fileName)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  if (fs.existsSync(file)) throw new Error(`Refusing to overwrite ${file}`)
  if (strategy === 'reuse-existing-bytes') fs.symlinkSync(path.relative(path.dirname(file), source), file)
  else fs.copyFileSync(source, file)
  const sourceGoalId = source === cfa ? 'cfa5c1e4-6714-5be7-9a57-a24b201b6231' : source === enzyme ? 'b4ca3af2-77f1-59e8-955d-c4959e284242' : null
  const sourceLink = sourceGoalId ? currentRows.find(g => g.id === sourceGoalId).resourceLinks.find(l => l.type === 'goal-visualization' && l.role === 'primary' && l.lang === 'de') : null
  const provider = sourceLink?.provider ?? 'OpenAI image_gen.imagegen'
  goal.resourceLinks = [createGoalVisualizationLink(goal, {
    publicUrl: paths.publicUrl, provider, description: `Didaktisches Orientierungsbild: ${goal.title}.`,
    altText, lang: 'de', license: sourceLink?.license ?? 'CC-BY-4.0; AI-generated, SkillPilot-curated', reviewStatus: 'pilot',
  }), ...(goal.resourceLinks ?? []).filter(l => !(l.type === 'goal-visualization' && l.role === 'primary' && (l.lang ?? 'de') === 'de'))]
  const check = structuredClone(goal)
  check.resourceLinks = old.resourceLinks
  if (JSON.stringify(check) !== JSON.stringify(old)) throw new Error(`Non-image goal mutation ${id}`)
  wholeGoals.push(goal)
  assets.push({ goalId: id, strategy, file: pin(file), original: strategy === 'reuse-existing-bytes' ? pin(source) : { archivedOriginalPreserved: true, bytes: fs.statSync(source).size }, originalWholeResourceLink: sourceLink, relativeRepositorySymlink: strategy === 'reuse-existing-bytes' ? fs.readlinkSync(file) : null, provider, approvedByThisAuthor: false })
}
const write = (name, value) => fs.writeFileSync(path.join(out, name), JSON.stringify(value, null, 2) + '\n')
write('candidate-v1/four-whole-goals.primary-images-only.unreviewed.json', {
  schemaVersion: 1, role: 'Four inactive whole child goals with image-only links; three existing-byte reuse proposals and one new raster proposal',
  baseCanonical: pin(base), wholeGoals, changedFieldsExactly: ['resourceLinks'], allOther566GoalsUnchanged: true,
  noWhole570CanonicalWritten: true, noSemanticDecisionChanged: true, noActiveIntegration: true, newStrict: 0,
})
write('PROVENANCE.one-original-three-existing-image-proposals.author.json', {
  schemaVersion: 1, assets, currentCanonicalForExactReusedProvenance: pin(current), generatorTool: 'OpenAI image_gen.imagegen', nativeGeneratedFormat: 'PNG', nativeGeneratedSize: [1672, 941],
  providerPrompt: pin(path.join(out, 'PROMPT.c8198159.exact-imagegen.txt')),
  reuseDecisionBoundary: 'Same existing bytes, new child binding remains unreviewed. A new ID alone is not a reason to regenerate.',
  sourceWeakness: 'Inspected existing335 picture has sealed enzyme vessels and an unqualified30C optimum, and does not show the safe Mimosa contact-versus-sham comparison. The inspected broad ecology image does not depict that comparison either.',
  generationIsNotApproval: true, noD_P_A_M_VGrant: true, noSourceOrCourseAcceptance: true,
  activeRuntimeChanged: false, humanApproval: false, humanTrial: false,
})
console.log(JSON.stringify({ wholeGoalCount: wholeGoals.length, reusedAssets: 3, newOriginalRaster: 1, newScientificApprovals: 0, outputs: assets.map(a => a.file) }, null, 2))
