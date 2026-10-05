import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildGoalBookSourceAtlasInputs, readGoalBookSourceAtlasInputConfig } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'

const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-seven-current-source-description-candidate-v1'
const input = JSON.parse(readFileSync(resolve(root, own, 'input-receipt.json'), 'utf8'))
const ids = new Set<string>(input.goalIds)
const configPath = 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
const config = readGoalBookSourceAtlasInputConfig(configPath, root)
const result = buildGoalBookSourceAtlasInputs(config, root)
const receipt = result.receipt as any
const scopes = receipt.scopes.map((scope: any) => ({ ...scope, goalIds: scope.goalIds.filter((id: string) => ids.has(id)), witnesses: scope.witnesses.filter((w: any) => ids.has(w.goalId)) })).filter((scope: any) => scope.witnesses.length)
const contexts = new Map<string, any>()
for (const scope of scopes) for (const witness of scope.witnesses) {
  if (!witness.sourceExtractionPath.includes('/HE/lower-secondary/') && !witness.sourceExtractionPath.includes('/BY/gymnasium/')) continue
  const key = `${witness.sourceExtractionPath}|${witness.sourceGoalId}`
  if (contexts.has(key)) continue
  const extraction = JSON.parse(readFileSync(resolve(root, witness.sourceExtractionPath), 'utf8'))
  const sourceGoal = extraction.sourceGoals.find((goal: any) => goal.id === witness.sourceGoalId)
  const mapping = JSON.parse(readFileSync(resolve(root, witness.mappingPath), 'utf8'))
  contexts.set(key, { sourceExtractionPath: witness.sourceExtractionPath, sourceLandscapeId: extraction.sourceLandscapeId, sourceGoalId: witness.sourceGoalId, sourceGoal, passages: extraction.passages?.filter((p: any) => sourceGoal.sourcePassageIds?.includes(p.id) || sourceGoal.passageIds?.includes(p.id) || sourceGoal.sourcePassageId === p.id || sourceGoal.passageId === p.id), sourceDocument: extraction.sourceDocument, sourceDocuments: extraction.sourceDocuments, mappings: mapping.mappings?.filter((m: any) => m.legacyGoalId === witness.sourceGoalId), matchingReviewedRecords: mapping.decisions?.filter((m: any) => m.sourceGoalId === witness.sourceGoalId) })
}
const output = { schemaVersion: 1, status: 'candidate', authority: 'ai_candidate', configPath, counts: { targetedGoalCount: ids.size, routingScopes: scopes.length, targetedPrimaryContextGroupsHEBY: contexts.size }, inputBindings: receipt.inputBindings, scopes, contexts: [...contexts.values()], note: 'Native atlas routing witnesses, not a new normative source approval. Primary context excerpts are restricted to the begun HE/BY B010 source lane. Other routing witnesses are metadata only and are not re-reviewed or granted fresh coverage. No generated atlas outputs were written.' }
writeFileSync(resolve(root, own, 'current-source-witnesses.json'), `${JSON.stringify(output, null, 2)}\n`)
console.log(JSON.stringify(output.counts))
