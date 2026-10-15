// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import { pathToFileURL, fileURLToPath } from 'node:url'
import ts from '/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js'

const main = '/home/enpasos/projects/skillpilot'
const own = path.dirname(fileURLToPath(import.meta.url))
const privateRoot = `${main}/tmp/cross-subject-requires/broad-fivea-two-owner-portable-quality-author-20261015-v1/isolated-root`
const helperPath = `${privateRoot}/scripts/goal_visualization_paths.mjs`
const { goalVisualizationAssetSegments: parse } = await import(pathToFileURL(helperPath).href)
const builder = await import(pathToFileURL(`${privateRoot}/app/scripts/buildSkillpilotExportPackage.ts`).href)
const validator = await import(pathToFileURL(`${privateRoot}/app/scripts/validateSubjectExportPackages.ts`).href)
const status = await import(pathToFileURL(`${privateRoot}/app/scripts/reportGoalVisualizationRolloutStatus.ts`).href)
const sha = (bytes: Buffer | string) => `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`
const sources = [
  'scripts/goal_visualization_paths.mjs', 'scripts/goal_visualization_paths.d.mts',
  'scripts/check_goal_visualization_assets.mjs', 'scripts/test_goal_visualization_paths.mjs',
  'scripts/generate_goal_visualization_reconstruction_prompts.mjs',
  'app/scripts/generateGoalVisualizationQaLedgers.ts', 'app/scripts/reportGoalVisualizationRolloutStatus.ts',
  'app/scripts/buildSkillpilotExportPackage.ts', 'app/scripts/validateSubjectExportPackages.ts',
].map((file) => ({ path: path.relative(main, `${privateRoot}/${file}`), bytes: fs.statSync(`${privateRoot}/${file}`).size, sha256: sha(fs.readFileSync(`${privateRoot}/${file}`)) }))
const checks: Record<string, unknown>[] = []
function extract(file: string, names: string[], injections: Record<string, unknown>) {
  const source = fs.readFileSync(`${privateRoot}/${file}`, 'utf8')
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const wanted = new Set(names)
  const statements = ast.statements.filter((statement) => {
    if (ts.isFunctionDeclaration(statement)) return statement.name && wanted.has(statement.name.text)
    return ts.isVariableStatement(statement) && statement.declarationList.declarations.some((d) => ts.isIdentifier(d.name) && wanted.has(d.name.text))
  })
  assert.equal(statements.length, names.length)
  const code = ts.transpileModule(statements.map((s) => s.getText(ast)).join('\n'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText
  return new Function(...Object.keys(injections), `${code}; return {${names.join(',')}}`)(...Object.values(injections))
}
const canonicalRoot = `${privateRoot}/curricula/DE/Gymnasium/visualizations`
const mappers = extract('app/scripts/generateGoalVisualizationQaLedgers.ts', ['publicAssetPathFromUrl', 'canonicalAssetPathFromUrl'], { path, repoRoot: privateRoot, canonicalAssetRoot: canonicalRoot, goalVisualizationAssetSegments: parse })
const prefix = '/assets/goal-visualizations/'
const id = '4a2bf015-052b-4af0-aed7-324259fa1a8a'
const safeUrls = [`${prefix}physik/${id}/${id}.jpg`, `${prefix}physik/${id}/model-boundaries-v2/${id}.png`, `${prefix}physik/${id}/v2/reviewed/${id}.png`]
const unsafe: unknown[] = [null, undefined, {}, 3, '', '//assets/goal-visualizations/physik/id/id.png', 'https://example.org/assets/goal-visualizations/physik/id/id.png', '/assets/other/physik/id/id.png', `${prefix}physik/id`, `${prefix}physik/id/`, `${prefix}physik//id.png`, ...['.', '..', '%2e', '%2E%2e', '%252e%252e', '%2f', '%5c', '%00', 'v2?x=1', 'v2#x', 'v2\\x', 'v2:x', 'v2\nx', 'v2\rx', 'v2\tx', 'é', '..／x'].map((s) => `${prefix}physik/id/${s}/id.png`), ...['\n', '\r', '\r\n', '\u0000', '\t', '?v=1', '#frag', '%0a'].map((s) => `${prefix}physik/id/id.png${s}`)]
for (const value of unsafe) {
  assert.equal(parse(value), null, JSON.stringify(value))
  if (typeof value === 'string') {
    assert.equal(mappers.publicAssetPathFromUrl(value), '')
    assert.equal(mappers.canonicalAssetPathFromUrl(value), '')
  }
}
for (const url of safeUrls) {
  const suffix = url.slice(prefix.length)
  assert.deepEqual(parse(url), suffix.split('/'))
  assert.equal(mappers.canonicalAssetPathFromUrl(url), `${canonicalRoot}/${suffix}`)
  assert.equal(mappers.publicAssetPathFromUrl(url), `${privateRoot}/app/public${url}`)
}
checks.push({ group: 'exact private mapper statements and actual shared helper', safeAccepted: safeUrls.length, unsafeRejected: unsafe.length, mapperStatementsExtractedWithoutRunningGeneratorMain: true })

let legacy = 0
const mainCanonicalBindings: Record<string, unknown>[] = []
for (const file of fs.readdirSync(`${main}/curricula/DE/Gymnasium/canonical`).filter((f) => f.endsWith('.json')).sort()) {
  const input = `${main}/curricula/DE/Gymnasium/canonical/${file}`
  const data = fs.readFileSync(input)
  const document = JSON.parse(data.toString())
  mainCanonicalBindings.push({ path: path.relative(main, input), bytes: data.length, sha256: sha(data) })
  for (const goal of document.goals ?? []) for (const link of goal.resourceLinks ?? []) {
    if (link.type !== 'goal-visualization' && link.resourceType !== 'goal-visualization') continue
    const match = link.url.match(/^\/assets\/goal-visualizations\/([^/]+)\/([^/]+)\/([^/]+)$/u)
    assert(match, link.url)
    assert.equal(mappers.canonicalAssetPathFromUrl(link.url), path.join(canonicalRoot, match[1], match[2], match[3]))
    assert.equal(mappers.publicAssetPathFromUrl(link.url), path.join(privateRoot, 'app/public', link.url.replace(/^\/+/, '')))
    legacy++
  }
}
assert.equal(legacy, 2487)
checks.push({ group: 'actual current Main backward compatibility', exactUnchangedLegacyUrls: legacy, canonicalInputs: mainCanonicalBindings, sourceMainNotEdited: true })

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'skillpilot-peer-nested-'))
try {
  const croot = path.join(fixture, 'canonical')
  const reconstruction = extract('scripts/generate_goal_visualization_reconstruction_prompts.mjs', ['visualizationAssetLocation'], { path, fs, goalVisualizationAssetSegments: parse, allowedImageExtensions: new Set(['.png', '.jpg', '.jpeg', '.webp']), CANONICAL_VISUALIZATION_ROOT: croot })
  const nested = safeUrls[1]
  const suffix = nested.slice(prefix.length)
  const image = path.join(croot, suffix)
  fs.mkdirSync(path.dirname(image), { recursive: true }); fs.writeFileSync(image, 'fixture-image')
  assert.equal(reconstruction.visualizationAssetLocation(id, nested).assetRelativePath, suffix)
  assert.throws(() => reconstruction.visualizationAssetLocation('different-owner', nested), /invalid.*schema/)
  assert.throws(() => reconstruction.visualizationAssetLocation(id, nested.replace(`${id}.png`, 'other.png')), /invalid.*schema/)
  for (const value of unsafe.filter((v) => typeof v === 'string')) assert.throws(() => reconstruction.visualizationAssetLocation(id, value))
  fs.rmSync(image); fs.writeFileSync(path.join(fixture, 'outside.png'), 'outside')
  fs.symlinkSync(path.join(fixture, 'outside.png'), image)
  assert.throws(() => reconstruction.visualizationAssetLocation(id, nested), /escapes.*symlink/)
  checks.push({ group: 'exact reconstruction function', nestedSuccess: 1, wrongOwnerRejected: true, wrongLeafRejected: true, unsafeRejected: unsafe.filter((v) => typeof v === 'string').length, actualSymlinkEscapeRejected: true, noGeneratorOrProviderInvocation: true })

  const bytes = Buffer.from('exact peer status bytes')
  const record = { goalId: id, subject: 'physik', visualizationState: 'available', imageUrl: nested, aiApproved: 'yes', humanIssueIdentified: 'no', assetSha256: sha(bytes), aiApprovedAssetSha256: sha(bytes), publicAssetPath: `app/public${nested}`, canonicalAssetPath: `curricula/DE/Gymnasium/visualizations/${suffix}` }
  for (const file of [record.publicAssetPath, record.canonicalAssetPath]) { fs.mkdirSync(path.dirname(path.join(fixture, file)), { recursive: true }); fs.writeFileSync(path.join(fixture, file), bytes) }
  const linked = { goalId: id, url: nested }
  assert.equal(status.hasCurrentExactByteAiQaEvidence(linked, record, 'physik', fixture), true)
  const alterations = [
    { goalId: 'wrong' }, { subject: 'wrong' }, { visualizationState: 'missing' }, { imageUrl: safeUrls[0] },
    { aiApproved: 'no' }, { humanIssueIdentified: 'yes' }, { assetSha256: 'sha256:' + '0'.repeat(64) },
    { aiApprovedAssetSha256: 'sha256:' + '1'.repeat(64) },
    { canonicalAssetPath: `curricula/DE/Gymnasium/visualizations/physik/${id}/${id}.png` },
    { publicAssetPath: `app/public${prefix}physik/${id}/${id}.png` },
  ]
  for (const mutation of alterations) assert.equal(status.hasCurrentExactByteAiQaEvidence(linked, { ...record, ...mutation }, 'physik', fixture), false)
  for (const value of unsafe.filter((v) => typeof v === 'string')) assert.equal(status.hasCurrentExactByteAiQaEvidence({ ...linked, url: value }, { ...record, imageUrl: value }, 'physik', fixture), false)
  fs.writeFileSync(path.join(fixture, record.publicAssetPath), 'changed bytes')
  assert.equal(status.hasCurrentExactByteAiQaEvidence(linked, record, 'physik', fixture), false)
  fs.writeFileSync(path.join(fixture, record.publicAssetPath), bytes)
  fs.rmSync(path.join(fixture, record.canonicalAssetPath))
  assert.equal(status.hasCurrentExactByteAiQaEvidence(linked, record, 'physik', fixture), false)
  checks.push({ group: 'actual imported rollout byte QA consumer', nestedSuccess: 1, recordMutationsRejected: alterations.length, changedBytesRejected: true, missingCanonicalRejected: true, unsafeUrlsRejected: unsafe.filter((v) => typeof v === 'string').length })
} finally { fs.rmSync(fixture, { recursive: true, force: true }) }

const physicsPath = `${privateRoot}/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
const physics = JSON.parse(fs.readFileSync(physicsPath, 'utf8'))
const realGoal = physics.goals.find((g: any) => g.id === id)
assert(realGoal)
const realLink = realGoal.resourceLinks.find((l: any) => l.type === 'goal-visualization')
assert.equal(realLink.url, safeUrls[1])
const doc = { goals: [{ ...realGoal, resourceLinks: [realLink] }] }
let errors: string[] = []
const selected = builder.selectGoalVisualizationAssets(doc, 'physik', errors)
assert.deepEqual(errors, []); assert.equal(selected.length, 1)
const collected = validator.collectCanonicalGoalVisualizations(doc, 'physik')
assert.deepEqual(collected.issues, []); assert.equal(collected.records.length, 1)
assert.equal(selected[0].record.packagePath, safeUrls[1].slice(1))
assert.equal(collected.records[0].packagePath, safeUrls[1].slice(1))
assert.equal(selected[0].record.sha256, crypto.createHash('sha256').update(fs.readFileSync(selected[0].sourcePath)).digest('hex'))
const badLinks = [
  { ...realLink, skillpilotId: 'wrong' }, { ...realLink, role: 'secondary' },
  { ...realLink, url: realLink.url.replace('/physik/', '/chemie/') },
  { ...realLink, url: realLink.url.replace(`${id}.png`, 'wrong.png') },
  { ...realLink, url: realLink.url.replace('.png', '.webp') },
  ...unsafe.filter((v) => typeof v === 'string').map((url) => ({ ...realLink, url })),
]
for (const link of badLinks) {
  const badDoc = { goals: [{ ...realGoal, resourceLinks: [link] }] }; errors = []
  assert.equal(builder.selectGoalVisualizationAssets(badDoc, 'physik', errors).length, 0); assert(errors.length > 0)
  const got = validator.collectCanonicalGoalVisualizations(badDoc, 'physik'); assert.equal(got.records.length, 0); assert(got.issues.length > 0)
}
errors = []; const dup = builder.selectGoalVisualizationAssets({ goals: [{ ...realGoal, resourceLinks: [realLink, realLink] }] }, 'physik', errors)
assert.equal(dup.length, 1); assert(errors.some((e) => e.includes('duplicate')))
const properties = builder.GOAL_VISUALIZATION_INDEX_SCHEMA.properties.assets.items.properties
for (const property of ['publicUrl', 'packagePath']) {
  const regex = new RegExp(properties[property].pattern)
  for (const url of safeUrls) assert(regex.test(property === 'publicUrl' ? url : url.slice(1)))
  for (const url of unsafe.filter((v) => typeof v === 'string')) assert.equal(regex.test(property === 'publicUrl' ? url : url.slice(1)), false, `${property}: ${JSON.stringify(url)}`)
}
checks.push({ group: 'actual imported export builder/validator/schema', currentNestedAssetSelectedAndHashed: true, actualCurrentAssetPath: selected[0].sourcePath, exactPackageSuffixRetained: true, badLinksRejectedByBoth: badLinks.length, duplicateRejectedByBuilder: true, schemaPatternSafePositivePerField: safeUrls.length, schemaPatternUnsafePerField: unsafe.filter((v) => typeof v === 'string').length })

// Exercise the exact later ZIP-binary callback that the initial function-level
// tests did not cover, with controlled in-memory archive metadata and bytes.
const validatorSource = fs.readFileSync(`${privateRoot}/app/scripts/validateSubjectExportPackages.ts`, 'utf8')
const validatorAst = ts.createSourceFile('validator.ts', validatorSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
let binaryExpression: string | undefined
const visit = (node: any) => { if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'visualizationBinaryIssues') binaryExpression = node.initializer.getText(validatorAst); ts.forEachChild(node, visit) }
visit(validatorAst); assert(binaryExpression)
const binaryHelpers = extract('app/scripts/validateSubjectExportPackages.ts', ['safeGoalVisualizationPackagePath', 'goalVisualizationMagicMatches', 'packageEntryPath'], { goalVisualizationAssetSegments: parse })
const selectedRecord = selected[0].record
const content = fs.readFileSync(selected[0].sourcePath)
const binaryCheck = (record: any, mutation: Record<string, any> = {}) => {
  const archiveRoot = 'peer-controlled-archive'
  const entry = `${archiveRoot}/${record.packagePath}`
  const bindings = { ...binaryHelpers, goalVisualizationAssetSegments: parse, indexedVisualizations: [record], archiveRoot, subjectSlug: 'physik', visualizationKey: (r: any) => `${r.goalId}:${r.order}`, manifestByPath: new Map([[entry, { ...record, category: 'goal-visualization', licenseCategory: 'goal-visualization-ai-generated-curated', ...mutation.manifest }]]), entrySet: new Set([entry]), visualizationExtractionSizeSafe: mutation.sizeSafe ?? true, inspectZipEntry: () => ({ bytes: content.length, sha256: crypto.createHash('sha256').update(content).digest('hex'), head: content, ...mutation.binary }), GOAL_VISUALIZATION_LICENSE_CATEGORY: 'goal-visualization-ai-generated-curated' }
  const code = ts.transpileModule(`const result = ${binaryExpression};`, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText
  return new Function(...Object.keys(bindings), `${code};return result`)(...Object.values(bindings))
}
assert.deepEqual(binaryCheck(selectedRecord), [])
for (const update of [{ packagePath: selectedRecord.packagePath.replace('/model-boundaries-v2/', '/../') }, { publicUrl: selectedRecord.publicUrl + '?v=1' }, { publicUrl: selectedRecord.publicUrl.replace('/physik/', '/chemie/') }, { publicUrl: selectedRecord.publicUrl.replace(`${id}.png`, 'wrong.png') }, { skillpilotId: 'wrong' }, { role: 'secondary' }]) assert(binaryCheck({ ...selectedRecord, ...update }).length > 0)
for (const mutation of [{ manifest: { category: 'other' } }, { manifest: { licenseCategory: 'other' } }, { manifest: { bytes: 0 } }, { manifest: { sha256: '0'.repeat(64) } }, { binary: { bytes: 0 } }, { binary: { sha256: '0'.repeat(64) } }, { binary: { head: Buffer.from('not-an-image') } }, { sizeSafe: false }]) assert(binaryCheck(selectedRecord, mutation).length > 0)
checks.push({ group: 'exact later indexed-ZIP-binary validation callback', nestedCurrentPngAccepted: true, recordMutationsRejected: 6, manifestByteHashMimeAndSizeMutationsRejected: 8, callbackExtractedWithoutExecutingZipCLI: true, completeZipPackageOrStandaloneAcceptanceClaimed: false })

for (const source of sources) assert.equal(sha(fs.readFileSync(`${main}/${source.path}`)), source.sha256, `Source changed during test: ${source.path}`)
const out = { actualReviewer: '/root/eight_scope_guard_successor_independent_peer', configuredModel: 'OpenAI/gpt-6.1-sol', servingBuild: 'unobserved', observedAtUTC: new Date().toISOString(), verdict: 'PASS', privateSources: sources, checks, MainEdited: false, privateAuthorInputsEdited: false, hostOrRuntimeAcceptanceClaimed: false }
fs.writeFileSync(`${own}/independent-final-consumer-behavior.actual.json`, JSON.stringify(out, null, 2) + '\n')
console.log(JSON.stringify({ verdict: out.verdict, groups: checks.length, legacyExact: legacy, unsafe: unsafe.length }))
