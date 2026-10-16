import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

async function main() {
  const repo = process.cwd()
  const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
  const own = base + 'chemie-bcp-two-preparation-child-images-author-root-20261015-v1/'
  const original = base + 'chemie-bcp-eleven-scope-six-boundaries-whole-author-20261015-v1/'
  const correction = base + 'chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/'
  const read = (name: string) => JSON.parse(fs.readFileSync(path.resolve(repo, name), 'utf8'))
  const model = await import(pathToFileURL(path.resolve(repo, 'app/scripts/goalBookModel.ts')).href)
  const canonical = read(original + 'candidate/canonical570.current426.bcp-eleven-six-boundaries.author.json')
  const preparation = read(correction + 'candidate/one-whole-preparation-goal.prerequisite-only.author.json')
  canonical.goals = canonical.goals.map((goal: any) => goal.id === preparation.id ? preparation : goal)
  const semantic = read(original + 'candidate/semantic570.current426.source-identity.author.json')
  const decision = read(correction + 'candidate/one-semantic-decision.prerequisite-source-identity.author.json')
  semantic.decisions = semantic.decisions.map((entry: any) => entry.goalId === decision.goalId ? decision : entry)
  const originals = new Map(canonical.goals.map((goal: any) => [goal.id, goal]))
  const replacements = read(own + 'candidate-v1/two-whole-goals.primary-images-only.unreviewed.json').wholeGoals
  const changes = replacements.map((goal: any) => {
    const before: any = originals.get(goal.id)
    const keys = [...new Set([...Object.keys(before), ...Object.keys(goal)])]
    const changed = keys.filter(key => JSON.stringify(before[key]) !== JSON.stringify(goal[key]))
    if (JSON.stringify(changed) !== JSON.stringify(['resourceLinks'])) throw new Error('Unexpected whole-goal delta')
    if (model.fingerprintSemanticKindSourceGoal(before) !== model.fingerprintSemanticKindSourceGoal(goal)) throw new Error('Image-only semantic source identity changed')
    return { goalId: goal.id, changedFields: changed, sourceFingerprintUnchanged: true }
  })
  const replacementMap = new Map(replacements.map((goal: any) => [goal.id, goal]))
  canonical.goals = canonical.goals.map((goal: any) => replacementMap.get(goal.id) ?? goal)
  const decisions = new Map(semantic.decisions.map((entry: any) => [entry.goalId, entry]))
  const mismatches = canonical.goals.filter((goal: any) => {
    const entry: any = decisions.get(goal.id)
    return !entry || entry.sourceFingerprint !== model.fingerprintSemanticKindSourceGoal(goal)
  }).map((goal: any) => goal.id)
  if (canonical.goals.length !== 570 || mismatches.length) throw new Error('570 source identities failed: ' + mismatches.join(','))
  const result = { schemaVersion: 1, role: 'Actual stock source-fingerprint check of two image-only whole-goal overlays; no scientific vote', all570StockSourceIdentities: 'PASS', mismatchCount: 0, unchangedOtherWholeGoals: 568, changes, canonicalOrSemanticWritten: false, newScientificVotes: 0, newStrict: 0 }
  fs.writeFileSync(path.resolve(repo, own + 'CHECK.actual-all570-image-only-stock-source-identities.json'), JSON.stringify(result, null, 2) + '\n')
  process.stdout.write('All570 stock source identities valid; only two resourceLinks changed.\n')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
