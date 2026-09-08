import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = process.cwd()
const own = new URL('./implementation-scope-fixture.json', import.meta.url)
const json = path => JSON.parse(readFileSync(path, 'utf8'))
const fixture = json(own)
const canonical = json('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
const rp = json('curricula/DE/Gymnasium/input/RP/upper-secondary/source-extraction/DE_RP_PHYSIK_SEKII_MSS_SOURCE_EXTRACTION_DRAFT.source-extraction.json')
const rpm = json('curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_source_extraction_to_canonical_physics.review.json')
const bym = json('curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json')
const by = json('curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_PHYSIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json')
const stripDescription = ({ description, descriptionEn, ...rest }) => rest
for (const before of fixture.beforeCanonicalGoals) {
  const current = canonical.goals.find(g => g.id === before.id)
  assert(current, before.id)
  if (before.id.startsWith('333')) assert.deepEqual(current, before)
  else {
    assert.deepEqual(stripDescription(current), stripDescription(before), 'Nerve change must be confined to DE/EN description')
    assert(current.description.includes('gegebenenfalls auftretende Induktionsspannungen'))
    assert(current.descriptionEn.includes('any induced voltages that arise'))
  }
}
for (const expected of fixture.rpExpected) {
  const current = [...rp.passages, ...rp.sourceGoals].find(g => g.id === expected.id)
  assert.deepEqual(current, expected, 'Exact repaired RP block: ' + expected.id)
  if (expected.sourceSpan) {
    assert.equal(rpm.decisions.find(d => d.sourceGoalId === expected.id).sourceSpan, expected.sourceSpan)
  }
}
const pdf = 'curricula/DE/Gymnasium/input/RP/Physik_Sekundarstufe_II_MSS.pdf'
assert.equal(createHash('sha256').update(readFileSync(pdf)).digest('hex'), fixture.rpOriginalPdfSha256)
for (const page of ['45', '75']) {
  const text = execFileSync('pdftotext', ['-raw', '-f', page, '-l', page, pdf, '-'], { encoding: 'utf8' })
    .replace(/-\s*\n\s*/g, '').replace(/[\s\u0007]+/g, ' ')
  for (const wording of ['Strömungsphysik', 'Wahlpflichtbaustein', 'Kontinuitätsgleichung',
    'Bernoulli-Gleichung, Gesetz von Stokes, Reynolds-Zahl',
    'Die zu behandelnden Gesetze ergeben sich aus den gewählten Beispielen.',
    'Praktikum: Sinkgeschwindigkeiten']) assert(text.includes(wording), 'Original page ' + page + ': ' + wording)
}
const sourceId = fixture.byExpectedDecision.sourceGoalId
assert.deepEqual(bym.decisions.find(d => d.sourceGoalId === sourceId), fixture.byExpectedDecision)
const edges = bym.mappings.filter(m => m.legacyGoalId === sourceId)
assert.equal(edges.length, 4)
assert(edges.every(m => m.matchType === 'partial' && m.reviewDecisionId === sourceId))
for (const previous of fixture.beforeByMappings) assert(edges.some(edge => JSON.stringify(edge) === JSON.stringify(previous)))
assert(edges.some(m => m.canonicalGoalId === 'eb1ea150-ec6c-5000-bce3-f46c820dccf8'))
assert(by.sourceGoals.find(g => g.id === sourceId).rawSourceText.includes('auch quantitativ, durch die mittlere Änderungsrate des magnetischen Flusses'))
const rpGenerator = readFileSync('app/scripts/generateRpPhysicsSourceExtraction.ts', 'utf8')
const byGenerator = readFileSync('app/scripts/generateByPhysicsSourceExtraction.ts', 'utf8')
const passageLiteral = rpGenerator.match(/const fluidOriginalPassage = ("(?:[^"\\]|\\.)*")/)
assert(passageLiteral)
assert.equal(JSON.parse(passageLiteral[1]), fixture.rpExpected[0].rawText)
assert(rpGenerator.includes("sourceSpan: '4.4 und 5.4 Strömungsphysik, S. 45 und 75'"))
const targetBlock = byGenerator.match(new RegExp("'" + sourceId + "': \\[([\\s\\S]*?)\\]"))?.[1]
assert(targetBlock)
assert.deepEqual([...targetBlock.matchAll(/'([a-f0-9-]{36})'/g)].map(m => m[1]), fixture.byExpectedDecision.canonicalGoalIds)
assert(byGenerator.includes(JSON.stringify({
  rationale: fixture.byExpectedDecision.rationale,
  reviewedAt: fixture.byExpectedDecision.reviewedAt,
  reviewer: fixture.byExpectedDecision.reviewer,
})), 'Generator checkpoint must preserve the individually reviewed source rationale')
const require = createRequire(resolve(root, 'app/package.json'))
const ts = require('typescript')
for (const fileName of ['app/scripts/generateRpPhysicsSourceExtraction.ts', 'app/scripts/generateByPhysicsSourceExtraction.ts']) {
  const result = ts.transpileModule(readFileSync(fileName, 'utf8'), {
    fileName, reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  })
  assert.equal((result.diagnostics ?? []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0, fileName)
}
console.log(JSON.stringify({
  checkedAt: new Date().toISOString(), goalScope: fixture.scopeGoalIds,
  canonicalFieldBoundary: 'pass', rpOriginalPages45And75: 'pass',
  rpFourRowsAndSharedPassage: 'pass', sourceMappingAndGeneratorConsistency: 'pass',
  existingQuantitativeInductionPartialEdge: 'pass', generatorSyntax: 'pass',
  broadGeneratorReplay: false, writes: 0,
}, null, 2))

