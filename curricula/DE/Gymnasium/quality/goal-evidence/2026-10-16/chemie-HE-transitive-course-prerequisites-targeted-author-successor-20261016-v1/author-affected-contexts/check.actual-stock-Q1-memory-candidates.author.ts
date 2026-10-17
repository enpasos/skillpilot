// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

async function main() {
  const repo = process.cwd()
  const host = path.join(repo, 'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1')
  const base = path.join(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-HE-transitive-course-prerequisites-targeted-author-successor-20261016-v1/author-affected-contexts')
  const load = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
  const sha = (p: string) => createHash('sha256').update(fs.readFileSync(p)).digest('hex')
  const { getSrsFilterTags } = await import(pathToFileURL(path.join(host, 'app/src/utils/srsTags.ts')).href)
  const { collectCompositionProjectionRoleGoalIds } = await import(pathToFileURL(path.join(host, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
  const drillPath = path.join(host, 'app/src/components/srs/FlashcardDrill.tsx')
  const fragment = fs.readFileSync(drillPath, 'utf8').match(/data\.cards = data\.cards\.filter\(card =>\s*(card\.tags && card\.tags\.some\(tag => filterTags\.includes\(tag\)\))\s*\)/)
  assert.ok(fragment)
  const predicate = new Function('card', 'filterTags', 'return ' + fragment[1])
  const canonicalPath = path.join(host, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
  assert.equal(sha(canonicalPath), 'd17b3219212d5157a3731cc54b8424cc07816835781984bcbeb3a98f4064268f')
  const goals = load(canonicalPath).goals
  const map = new Map(goals.map((g: any) => [g.id, g]))
  const prefixes = ['e3e8582a', 'f6d7386c', '98781dda', '46ce8cc4', '567b5b63', '8b28172c', '64d71d34', '1e519951']
  const candidates = prefixes.map(prefix => {
    const matches = goals.filter((g: any) => g.id.startsWith(prefix))
    assert.equal(matches.length, 1)
    const goal = matches[0]
    const actualDeckPath = path.join(host, 'app/public', goal.extendedData.vocabularySource)
    const deck = load(actualDeckPath)
    const filterTags = getSrsFilterTags(goal.tags)
    const cards = deck.cards.filter((card: any) => predicate(card, filterTags))
    return { wholeGoal: goal, actualDeckPath: path.relative(repo, actualDeckPath), actualDeckSha256: sha(actualDeckPath), actualFilterTags: filterTags, actualOrderedSelectedCardIds: cards.map((c: any) => c.id), completeSelectedCards: cards }
  })
  const configPath = path.join(host, 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json')
  const scopes = load(configPath).visibilityScopes
  const viewRoles = scopes.map((scope: any) => {
    const viewPath = path.join(host, scope.viewPath)
    const view = load(viewPath)
    const { targetGoalIds, prerequisiteOnlyGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, map)
    return { viewId: view.viewId, viewPath: scope.viewPath, actualViewSha256: sha(viewPath), roles: Object.fromEntries(candidates.map(c => [c.wholeGoal.id, targetGoalIds.has(c.wholeGoal.id) ? 'target' : prerequisiteOnlyGoalIds.has(c.wholeGoal.id) ? 'prerequisiteOnly' : 'absent'])) }
  })
  const report = { role: 'AUTHOR actual stock Q1 memory selection and view-role check; no review vote', status: 'draft', evidenceLevel: 'E0', maximumClaimScope: 'G0', canonicalSha256: sha(canonicalPath), actualSrsTagsSha256: sha(path.join(host, 'app/src/utils/srsTags.ts')), actualDrillSha256: sha(drillPath), executedPredicate: fragment[1], candidates, viewRoles, normalOrHMutation: false, HumanApproval: false, HumanTrial: false }
  const out = path.join(base, 'CHECK.actual-stock-Q1-memory-candidates.author.json')
  fs.writeFileSync(out + '.tmp', JSON.stringify(report, null, 2) + '\n')
  fs.renameSync(out + '.tmp', out)
  process.stdout.write(JSON.stringify({ candidates: candidates.map(c => ({ id: c.wholeGoal.id, title: c.wholeGoal.title, requires: c.wholeGoal.requires, selectors: c.actualFilterTags, cards: c.actualOrderedSelectedCardIds })), heViews: viewRoles.filter((v: any) => v.viewPath.includes('/de-he')) }, null, 2) + '\n')
}
main().catch(e => { process.stderr.write(String(e) + '\n'); process.exitCode = 1 })
