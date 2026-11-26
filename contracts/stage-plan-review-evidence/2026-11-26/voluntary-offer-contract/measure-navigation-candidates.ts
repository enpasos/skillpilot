// SPDX-License-Identifier: Apache-2.0
// Run from the repository root with app/node_modules/.bin/tsx --output=<external JSON>.
// Both actual CLI paths write only into a fresh external temporary directory.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'

const repo = process.cwd(), script = 'app/scripts/prepareGoalBookCanonicalNavigationCandidates.ts'
const output = process.argv.find(arg => arg.startsWith('--output='))?.slice(9)
const scratch = mkdtempSync(join(tmpdir(), 'vr1-navigation-candidates-'))
const oldSource = execFileSync('git', ['show', `7fea24d7c5:${script}`], { cwd: repo, encoding: 'utf8' })
const source = readFileSync(join(repo, script), 'utf8')
const subjects = ['math', 'physics']
const hash = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex')
const executableFile = (name: string, text: string) => {
  const executable = text.replace(/(from\s+['"])(\.[^'"]+)(['"])/g, (_all, prefix, path, suffix) =>
    prefix + resolve(repo, 'app/scripts', path) + suffix)
    .replace("const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')", `const REPOSITORY_ROOT = ${JSON.stringify(repo)}`)
    .replaceAll('app/scripts/config/goal-books/navigation/de-gym-math-national-atlas.view.json', join(scratch, `${name}-math.view.json`))
    .replaceAll('app/scripts/config/goal-books/navigation/de-gym-physics-national-atlas.view.json', join(scratch, `${name}-physics.view.json`))
  const path = join(scratch, `${name}.mts`)
  writeFileSync(path, executable)
  return path
}
const run = (path: string) => execFileSync(process.execPath, [join(repo, 'app/node_modules/tsx/dist/cli.mjs'), path],
  { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'] })
run(executableFile('before', oldSource))
run(executableFile('after', source))
const viewPaths = [...new Set([...source.matchAll(/'(curricula\/DE\/Gymnasium\/composition-views\/[^']+\.view\.json)'/g)].map(match => match[1]))]
assert.equal(viewPaths.length, 4)
let source13 = source
const Ajv2020 = createRequire(join(repo, 'app/package.json'))('ajv/dist/2020.js').default
const validate13 = new Ajv2020({ allErrors: true, strict: false }).compile(JSON.parse(readFileSync(
  join(repo, 'contracts/composition-view/v1.3/composition-view.schema.json'), 'utf8')))
for (const [index, file] of viewPaths.entries()) {
  const view = JSON.parse(readFileSync(join(repo, file), 'utf8'))
  const physics = file.includes('/physik/')
  const subject = physics ? 'PHYSIK' : 'MATHEMATIK'
  const canonical = JSON.parse(readFileSync(join(repo, `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${subject}.de.json`), 'utf8'))
  const atom = canonical.goals.find((goal: any) => goal.type !== 'cluster' && !(goal.contains?.length) && !goal.examData)
  assert(atom)
  view.$schema = 'https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json'
  view.viewFormatVersion = '1.3'
  // Existing legacy inputs may contain role overrides forbidden by the new
  // source contract. Exercise a genuinely valid 1.3 input, not a header relabel.
  view.rootNodes = [{ kind: 'structure', id: 'root', label: 'Root', children: [
    { kind: 'structure', id: physics ? 'physics-sekii-gk' : 'sek2-gk', label: 'Sekundarstufe II', children: [
      { kind: 'goalEntry', goalId: atom.id },
    ] },
  ] }]
  assert(validate13(view), JSON.stringify(validate13.errors))
  const path = join(scratch, `source13-${index}.view.json`)
  writeFileSync(path, JSON.stringify(view))
  source13 = source13.replaceAll(file, path)
}
run(executableFile('source13', source13))
const candidates = subjects.map(subject => {
  const before = readFileSync(join(scratch, `before-${subject}.view.json`))
  const after = readFileSync(join(scratch, `after-${subject}.view.json`))
  assert.deepEqual(after, before, `${subject}: complete actual CLI candidate bytes`)
  assert(existsSync(join(scratch, `source13-${subject}.view.json`)),
    `${subject}: actual CLI accepts valid source 1.3 without offers`)
  return { subject, bytes: after.length, sha256: hash(after) }
})
const physicsPath = 'curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-gk.view.json'
const physics = JSON.parse(readFileSync(join(repo, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'), 'utf8'))
const atom = physics.goals.find((goal: any) => goal.type !== 'cluster' && !(goal.contains?.length) && !goal.examData)
assert(atom)
const offered = JSON.parse(readFileSync(join(repo, physicsPath), 'utf8'))
offered.$schema = 'https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json'
offered.viewFormatVersion = '1.3'
offered.rootNodes = [{ kind: 'structure', id: 'offers', label: 'Offers', children: [
  { kind: 'goalEntry', goalId: atom.id, projectionRole: 'voluntary' },
] }]
const offeredPath = join(scratch, 'offered.view.json')
writeFileSync(offeredPath, JSON.stringify(offered))
assert(validate13(offered), JSON.stringify(validate13.errors))
assert.throws(() => run(executableFile('offered', source.replaceAll(physicsPath, offeredPath))),
  (error: any) => error.stderr?.toString().includes('cannot erase voluntary role'))
for (const subject of subjects) assert(!existsSync(join(scratch, `offered-${subject}.view.json`)),
  'An unsupported Physics offer must reject before either candidate is written.')
const report = { baselineCommit: '7fea24d7c5', currentSourceSha256: hash(source), outputDirectory: scratch,
  completeCandidateByteDifferences: 0, source13WithoutOffersAccepted: true, voluntaryRejectedBeforeBothWrites: true, candidates }
if (output) writeFileSync(output, JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
