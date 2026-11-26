// SPDX-License-Identifier: Apache-2.0
// Run from the repository root using app/node_modules/.bin/tsx.
// --before-reader=<external pre-fix QA module> --output=<external JSON report>
// The snapshot rewrites relative imports and import.meta.url to the original
// file location; it changes no reader logic. Navigation uses the takeover Git source.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { runInNewContext } from 'node:vm'

async function main() {
  const repo = process.cwd()
  const beforeFile = process.argv.find(arg => arg.startsWith('--before-reader='))?.slice(16)
  assert(beforeFile, 'Supply the retained external pre-fix QA module.')
  const load = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
  const hash = (value: string) => createHash('sha256').update(value).digest('hex')
  const digest = (ids: Iterable<string>) => hash(JSON.stringify([...ids].sort()))
  const before = await import(pathToFileURL(beforeFile).href)
  const qa = await import(pathToFileURL(join(repo, 'app/scripts/generateCurriculumQualityStatus.ts')).href)
  const compiler = await import(pathToFileURL(join(repo, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
  const canon = await import(pathToFileURL(join(repo, 'app/src/utils/authoring/canonicalAuthoring.ts')).href)
  const navigation = await import(pathToFileURL(join(repo, 'app/scripts/prepareGoalBookCanonicalNavigationCandidates.ts')).href)
  const ts = await import(pathToFileURL(join(repo, 'app/node_modules/typescript/lib/typescript.js')).href)
  const baseline = execFileSync('git', ['show', '7fea24d7c5:app/scripts/prepareGoalBookCanonicalNavigationCandidates.ts'], { cwd: repo, encoding: 'utf8' })
  const parsed = ts.createSourceFile('baseline.ts', baseline, ts.ScriptTarget.Latest, true)
  const declarations = parsed.statements.filter(ts.isVariableStatement)
    .filter((statement: any) => statement.declarationList.declarations.some((declaration: any) => ['safeStructureId', 'toExplicitTree'].includes(declaration.name.getText(parsed))))
    .map((statement: any) => statement.getText(parsed)).join('\n')
  const visitStart = baseline.indexOf('    const visit = ', baseline.indexOf('const profileTargetIds = '))
  const visitEnd = baseline.indexOf('    compilation.compiledRootNodes.forEach(visit)', visitStart)
  assert(visitStart > 0 && visitEnd > visitStart)
  const oldCode = `${declarations}\nconst profileTargets = (nodes, goalById, atlasGoalIds) => {
    const profileTargetIds = new Set(); ${baseline.slice(visitStart, visitEnd)}
    nodes.forEach(visit); return profileTargetIds;
  }; ({toExplicitTree, profileTargets})`
  const oldNavigation = runInNewContext(ts.transpileModule(oldCode, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText,
    { resolveCanonicalNodeType: canon.resolveCanonicalNodeType })
  const directory = join(repo, 'curricula/DE/Gymnasium')
  const rawCatalog = readdirSync(join(directory, 'canonical')).filter(name => name.endsWith('.de.json'))
    .map(name => load(join(directory, 'canonical', name)))
  const catalog = rawCatalog.map(canon.normalizeCanonicalLandscape)
  const rawById = new Map(rawCatalog.map(landscape => [landscape.landscapeId, landscape]))
  const byId = new Map(catalog.map(landscape => [landscape.landscapeId, landscape]))
  const universe = { landscapeId: 'reader-parity-universe', title: 'Reader parity', goals: catalog.flatMap(landscape => landscape.goals) }
  const goals = new Map(universe.goals.map(goal => [goal.id, goal]))
  const atlasBySubject = new Map([
    ['mathematik', new Set(load(join(repo, 'app/public/lernzielbuch/de-gym-mathematik-bundesweit.book-model.json')).pages.map((page: any) => page.goalId))],
    ['physik', new Set(load(join(repo, 'app/public/lernzielbuch/de-gym-physik-bundesweit.book-model.json')).pages.map((page: any) => page.goalId))],
  ])
  const allAtoms = new Set(universe.goals.filter(goal => canon.resolveCanonicalNodeType(goal) === 'atomic').map(goal => goal.id))
  const walk = (path: string): string[] => readdirSync(path, { withFileTypes: true }).flatMap(item => item.isDirectory()
    ? walk(join(path, item.name)) : item.name.endsWith('.view.json') ? [join(path, item.name)] : [])
  const rows: any[] = []
  let readerComparisons = 0, navigationComparisons = 0, targetMemberships = 0, supportMemberships = 0
  for (const file of walk(join(directory, 'composition-views')).sort()) {
    const view = load(file), landscape = rawById.get(view.landscapeId)
    assert(landscape)
    assert.notEqual(view.viewFormatVersion, '1.3', 'Legacy proof inventory must not contain new-format authored views.')
    const rendered: any[] = []
    for (const stage of [undefined, 'SekI', 'SekII', 'CrossStage']) for (const support of [false, true]) {
      const oldIds = before.collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, [], support, stage, [], rawCatalog)
      const ids = qa.collectRenderedAtomicGoalIdsFromCompositionView(landscape, file, [], support, stage, [], rawCatalog)
      assert.deepEqual([...ids].sort(), [...oldIds].sort(), `${file}: stage ${stage}, support ${support}`)
      rendered.push({ stage: stage ?? 'default', support, count: ids.size, digest: digest(ids) })
      readerComparisons++
      if (!stage) { if (support) supportMemberships += ids.size; else targetMemberships += ids.size }
    }
    const compiled = compiler.compileCompositionView(view, byId.get(view.landscapeId), universe, byId)
    const subject = relative(directory, file).split('/')[1]
    const memberships = atlasBySubject.has(subject) ? [allAtoms, atlasBySubject.get(subject)!] : [allAtoms]
    const trees: any[] = []
    for (const atlas of memberships) {
      const oldTree = JSON.stringify(compiled.compiledRootNodes.map(node => oldNavigation.toExplicitTree(node, goals, atlas)))
      const tree = JSON.stringify(compiled.compiledRootNodes.map(node => navigation.toExplicitTree(node, goals, atlas)))
      assert.equal(tree, oldTree, `${file}: serialized navigation bytes`)
      const oldTargets = oldNavigation.profileTargets(compiled.compiledRootNodes, goals, atlas)
      const targets = navigation.collectProfileTargetGoalIds(compiled.compiledRootNodes, goals, atlas)
      assert.deepEqual([...targets].sort(), [...oldTargets].sort(), `${file}: profile targets`)
      trees.push({ atlas: atlas === allAtoms ? 'all canonical atoms' : 'current published subject model', bytes: Buffer.byteLength(tree), digest: hash(tree), targetCount: targets.size, targetDigest: digest(targets) })
      navigationComparisons++
    }
    rows.push({ view: relative(directory, file), rendered, navigation: trees })
    if (rows.length % 50 === 0) console.log(`Compared readers ${rows.length}/387.`)
  }
  const summary = { views: rows.length, canonicalSubjects: catalog.length, readerComparisons, navigationComparisons,
    targetMemberships, targetAndPreparationMemberships: supportMemberships, renderedIdDifferences: 0, navigationByteDifferences: 0, profileTargetDifferences: 0,
    beforeReaderSnapshotSha256: hash(readFileSync(beforeFile, 'utf8')),
    qualityReaderSha256: hash(readFileSync(join(repo, 'app/scripts/generateCurriculumQualityStatus.ts'), 'utf8')),
    navigationReaderSha256: hash(readFileSync(join(repo, 'app/scripts/prepareGoalBookCanonicalNavigationCandidates.ts'), 'utf8')) }
  const output = process.argv.find(arg => arg.startsWith('--output='))?.slice(9)
  if (output) writeFileSync(output, JSON.stringify({ summary, views: rows }, null, 2) + '\n')
  console.log(JSON.stringify(summary, null, 2))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
