import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'

const sha = (s: string) => 'sha256:' + createHash('sha256').update(s).digest('hex')
export function buildSourceInventory(root: string) {
  const sourcePaths = execFileSync('rg', ['--files', 'curricula/DE/Gymnasium/input'], { cwd: root, encoding: 'utf8' })
    .split('\n').filter(p => p.includes('/source-extraction/') && /PHYSIK.*\.json$/.test(p)).sort()
  const terms = /Urknall|Kosmolog|Hintergrundstrahl|dunkle[rnms]? (?:Materie|Energie)|Gezeiten|Sonnensystem|Galax|Universum|Weltalter|Weltall|Galakt|Kosmos/i
  const sourceFiles = sourcePaths.map(path => {
    const text = readFileSync(resolve(root, path), 'utf8'), source = JSON.parse(text)
    return {
      path, fileDigest: sha(text), jurisdiction: source.jurisdiction, stage: source.stage,
      extractionId: source.extractionId, sourceGoalCount: source.sourceGoals.length,
      topicHits: source.sourceGoals.filter((g: any) => terms.test([g.title, g.description, g.sourceSpan, g.sourceText].join(' ')))
        .map((g: any) => ({ sourceGoalId: g.id, topicCode: g.topicCode, courseLevel: g.courseLevel, sourceRef: g.sourceRef,
          sourceText: g.sourceText ?? g.sourceSpan ?? g.description ?? g.title })),
    }
  })
  const oldIds = new Set(['c9405043-bdc0-5995-8b4d-5bb56d97d05d', 'e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9', '5db07785-8cca-50d5-81a9-e0264d344af9'])
  const mappingPaths = execFileSync('rg', ['--files', 'curricula/DE/Gymnasium/mapping'], { cwd: root, encoding: 'utf8' })
    .split('\n').filter(p => /physics.*\.json$/.test(p)).sort()
  const oldDirectMappingFiles = mappingPaths.flatMap(path => {
    const text = readFileSync(resolve(root, path), 'utf8'), value = JSON.parse(text)
    const rows = (value.mappings ?? []).filter((m: any) => oldIds.has(m.canonicalGoalId))
    return rows.length ? [{ path, fileDigest: sha(text), rows }] : []
  })
  const jurisdictions = [...new Set(sourceFiles.map(f => f.jurisdiction))].sort()
  if (sourceFiles.length !== 25 || jurisdictions.length !== 16) throw new Error('Physics source corpus changed; review exact inventory delta')
  return {
    status: 'BOUNDED_CURRENT_SOURCE_INVENTORY_NOT_FULL_SOURCE_COVERAGE',
    method: 'All current Physics extraction files and all current Physics mapping files inspected for the old three IDs and the listed specific subtopics. Exact selected passages are adjudicated in source-decisions.json. A missing keyword hit is NOT proof of absence from an entire normative state curriculum.',
    sourceFileCount: sourceFiles.length, jurisdictionCount: jurisdictions.length, jurisdictions,
    mappingFileCount: mappingPaths.length, sourceFiles, oldDirectMappingFiles,
    narrowerAdditionalEvidence: { SL: 'Selected grade-10 natural-science-track astronomy passages only: S/G, CrossStage SekI placement.',
      SN: 'Selected grade-10 Solar-System passages only: S, CrossStage SekI placement.',
      TH: 'Tides as gravity example in grade10/intro11: T, one introduction-phase placement, no Q4 compulsion.' },
    nonCoverageExamples: ['HH timeline is not a CMB/dark-component teaching mandate.', 'BW SekI optical eclipse examples are not a tides source.', 'Generic modern-world-view or cosmic-background words alone do not prove full new-atom coverage.'],
    exactLegacyMasteryPolicy: 'Existing legacy goal-ID → equal-scope old cluster mappings remain unchanged. Only current extraction source-ID rows are reconciled; every new child edge is partial. No learner mastery is copied.',
  }
}
