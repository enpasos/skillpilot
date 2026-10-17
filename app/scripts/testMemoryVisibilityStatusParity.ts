import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectMemoryVisibilityReport as standaloneReport } from './memoryCardReview'
import { collectMemoryVisibilityReport as statusReport } from './generateCurriculumQualityStatus'
import type { LearningGoal } from '../src/landscapeTypes'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
mkdirSync(resolve(repoRoot, 'tmp'), { recursive: true })
const fixture = mkdtempSync(resolve(repoRoot, 'tmp/memory-visibility-status-'))
try {
  const goals = new Map<string, LearningGoal>([
    ['root', { id: 'root', title: 'Both courses', contains: ['gk', 'lk', 'gk-memory'] } as LearningGoal],
    ['gk', { id: 'gk', title: 'GK content', tags: ['GK'] } as LearningGoal],
    ['lk', { id: 'lk', title: 'LK content', tags: ['LK'] } as LearningGoal],
    ['gk-memory', { id: 'gk-memory', title: 'GK recall', tags: ['GK'], nodeKind: 'memory' } as LearningGoal],
    ['lk-memory', { id: 'lk-memory', title: 'LK recall', tags: ['LK'], nodeKind: 'memory' } as LearningGoal],
  ])
  const records = [
    { goalId: 'gk', status: 'memory_required', memoryGoalIds: ['gk-memory'] },
    { goalId: 'lk', status: 'memory_required', memoryGoalIds: ['lk-memory'] },
  ]
  const viewFile = resolve(fixture, 'view.json')
  const config = {
    schemaVersion: 1 as const, reviewId: 'visibility-parity', ruleVersion: 'memory-card-review-v1',
    landscapeId: 'fixture', landscapePath: 'fixture.json', reviewPath: 'fixture.jsonl',
    scope: { label: 'Both courses', leafGoalIds: ['gk', 'lk'] },
    visibilityScopes: [{ label: 'Fixture', viewPath: relative(repoRoot, viewFile) }],
  }
  const check = (courseProfile: 'GK' | 'LK', prerequisiteOnlyMemory: boolean, expectedMissing: number) => {
    writeFileSync(viewFile, JSON.stringify({
      scope: { courseProfile },
      rootNodes: [
        { kind: 'canonicalSubtree', goalId: 'root' },
        ...(prerequisiteOnlyMemory
          ? [{ kind: 'goalEntry', goalId: 'gk-memory', projectionRole: 'prerequisiteOnly' }]
          : []),
      ],
    }))
    const standalone = standaloneReport(config, goals, records as Parameters<typeof standaloneReport>[2])
    const status = statusReport(config, goals, records as Parameters<typeof statusReport>[2])
    assert.equal(standalone.missingVisibleMemoryGoals, expectedMissing)
    assert.equal(status.missingVisibleMemoryGoals, expectedMissing)
    assert.equal(status.errors.length, standalone.errors.length)
  }
  check('GK', false, 0) // The hidden LK topic creates no GK recall duty.
  check('LK', false, 1) // A visible LK topic still needs its missing recall node.
  check('GK', true, 1) // A more specific prerequisite-only node is no visible target.
  console.log('Memory visibility agrees between standalone checks and curriculum status.')
} finally {
  rmSync(fixture, { recursive: true, force: true })
}
