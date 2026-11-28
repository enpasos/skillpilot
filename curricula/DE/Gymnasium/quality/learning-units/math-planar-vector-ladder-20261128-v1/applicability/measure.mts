// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const output = process.argv[2]
if (!output) throw new Error('Supply a new measurement output file.')
const base = '24e5b544806bc8cbe29dca6799f6a94933f6eaf3'
const directory = 'curricula/DE/Gymnasium/canonical'
const files = readdirSync(directory).filter(name => name.endsWith('.json')).sort().map(name => directory + '/' + name)
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const documents = files.map(read)
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex')
const { buildApplicabilityCompilation } = await import(pathToFileURL(resolve(root, 'app/scripts/applicabilityCompiler.ts')).href)
const { collectRenderedAtomicGoalIdsFromCompositionView } = await import(pathToFileURL(resolve(root, 'app/scripts/generateCurriculumQualityStatus.ts')).href)
const subjects = [
  { key: 'mathematik', label: 'Mathematik', task: 'f9e8fbc1-7a1a-5492-a74e-8147ebfa1cf8' },
  { key: 'physik', label: 'Physik', task: '5307fc57-f913-5e44-893d-b9130f656cf5' },
]
const views = new Map<string, Array<{viewId: string, scope: Record<string,string>, renderedTarget: boolean, file: string, sha256: string}>>()
for (const subject of subjects) {
  const folder = 'curricula/DE/Gymnasium/composition-views/' + subject.key
  const owner = documents.find(d => d.subject === subject.label)
  const states = []
  for (const name of readdirSync(folder).filter(name => name.endsWith('.view.json')).sort()) {
    const file = folder + '/' + name
    const view = read(file)
    const filters = [view.scope.courseProfile, view.scope.durationModel].filter(Boolean)
    const targets = collectRenderedAtomicGoalIdsFromCompositionView(owner, file, filters, false, 'CrossStage', [], documents)
    states.push({ viewId: view.viewId, scope: view.scope, renderedTarget: targets.has(subject.task), file, sha256: sha(readFileSync(file)) })
  }
  views.set(subject.key, states)
}
function describe(mode: string) {
  const data = structuredClone(documents)
  if (mode === 'preV1') {
    for (let index = 0; index < data.length; index++) {
      if (subjects.some(subject => subject.label === data[index].subject)) {
        data[index] = JSON.parse(execFileSync('git', ['show', base + ':' + files[index]], { encoding: 'utf8', maxBuffer: 32 << 20 }))
      }
    }
  } else if (mode !== 'current') {
    const math = data.find(d => d.subject === 'Mathematik').goals.find((g: any) => g.id === subjects[0].task)
    const physics = data.find(d => d.subject === 'Physik').goals.find((g: any) => g.id === subjects[1].task)
    if (mode === 'removeExplicitScope') {
      delete math.extendedData.applicabilityOverrides
      delete physics.applicability
    } else if (mode === 'deriveFromAcademicGoal') {
      delete math.extendedData.applicabilityOverrides
      math.extendedData.applicabilityFromRequires = true
      physics.extendedData.assessmentApplicabilityBasis = { kind: 'allOfGoalApplicability', goalRefs: [physics.requires[0]] }
    } else throw new Error(mode)
  }
  const compilation = buildApplicabilityCompilation(data.map((landscape, index) => ({ file: resolve(root, files[index]), landscape })))
  return Object.fromEntries(subjects.map(subject => {
    const owner = data.find(d => d.subject === subject.label)
    const goal = owner.goals.find((g: any) => g.id === subject.task)
    if (!goal) return [subject.key, null]
    const report = compilation.reports.find((r: any) => r.landscapeId === owner.landscapeId)
    const compiled = report.goals.find((g: any) => g.goalId === goal.id)
    const jurisdictions = compiled.compiledApplicability.jurisdiction ?? []
    const offeredOnCurrentViews = views.get(subject.key)!.filter(v => v.renderedTarget && (!v.scope.jurisdiction || jurisdictions.includes(v.scope.jurisdiction))).map(v => v.viewId).sort()
    return [subject.key, { goalId: goal.id, goalJsonSha256: sha(JSON.stringify(goal)), requires: goal.requires,
      authored: goal.applicability ?? {}, applicabilityBasis: goal.extendedData?.assessmentApplicabilityBasis ?? null,
      jurisdictions, evidence: compiled.evidence,
      findings: report.findings.filter((f: any) => f.goalId === goal.id), offeredOnCurrentViews }]
  }))
}
const measurements = Object.fromEntries(['preV1', 'current', 'removeExplicitScope', 'deriveFromAcademicGoal'].map(mode => [mode, describe(mode)]))
writeFileSync(output, JSON.stringify({ schemaVersion: 1, base, method: 'Each actual view is projected using the native renderer with course and duration filters. Independently compile applicability on each supplied catalog. Then apply jurisdiction on the rendered targets; national views use their own scope.', views: Object.fromEntries(views), measurements }, null, 2) + '\n', { flag: 'wx' })
