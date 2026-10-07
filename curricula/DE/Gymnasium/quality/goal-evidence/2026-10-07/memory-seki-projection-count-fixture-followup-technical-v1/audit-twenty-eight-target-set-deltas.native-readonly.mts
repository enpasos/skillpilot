import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import { compileCompositionView, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import { convertLearningGoal } from '../../../../../../../app/src/goalTypes.ts'
import { goalMatchesFilters } from '../../../../../../../app/src/utils/goalFilters.ts'

const dossierPath = dirname(fileURLToPath(import.meta.url))
process.chdir(resolve(dossierPath, '../../../../../../..'))
const beforeSnapshotPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/memory-final-origin-protected-binding-restoration-technical-root-v1/original-canonical.before-binding.snapshot.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'
const oldBytes = readFileSync(beforeSnapshotPath,'utf8')
const currentBytes = readFileSync(canonicalPath, 'utf8')
const oldRaw = JSON.parse(oldBytes)
const currentRaw = JSON.parse(currentBytes)
const sha = (bytes: string) => createHash('sha256').update(bytes).digest('hex')
const fixtures: Record<string, number> = {BB:25, BE:25, BW:4, BY:34, HH:21, MV:24, NI:21, NW:19, RP:17, SH:26, SL:28, SN:28, ST:21, TH:23}
const audits: any[] = []
for (const [state, expected] of Object.entries(fixtures)) {
  const viewPath = 'curricula/DE/Gymnasium/composition-views/informatik/de-de-gym-seki-informatics.view.json'
  const viewBytes = readFileSync(viewPath,'utf8')
  const view = normalizeCompositionView(JSON.parse(viewBytes))
  for (const durationModel of ['G8', 'G9']) {
    const personal = {
      'a0e13c56-c25f-4742-9272-3a1a603ee52e': {selected:true, filterId:`DE-${state}`},
      '__skillpilot_stage_scope_sek1__': {selected:true},
      '__skillpilot_stage_scope_sek2__': {selected:false},
      [currentRaw.landscapeId]: {selected:true,filterId:'GK',durationModel},
    }
    const compile = (raw: any) => {
      const normalized = normalizeCanonicalLandscape(raw)
      const compiled = compileCompositionView(view, normalized)
      const goalById = new Map(raw.goals.map((g: any) => [g.id,convertLearningGoal(g,{landscapeId:raw.landscapeId})]))
      const ids = new Set<string>()
      const visit = (node: any) => {
        if (node.sourceGoalId) {
          const goal: any = goalById.get(node.sourceGoalId)
          if (!goalMatchesFilters(goal,[`DE-${state}`,'GK',durationModel])) return
          if (node.children.length===0) ids.add(goal.id)
        }
        for (const child of node.children) visit(child)
      }
      for(const node of compiled.compiledRootNodes) visit(node)
      return {count:ids.size, ids:[...ids].sort(), compilerFindings:compiled.findings}
    }
    const before = compile(oldRaw), after = compile(currentRaw)
    const added = after.ids.filter(id => !before.ids.includes(id))
    const removed = before.ids.filter(id => !after.ids.includes(id))
    audits.push({personalConfig:personal,jurisdiction:`DE-${state}`,durationModel,course:'GK',stage:'SekI',viewPath,viewSha256:sha(viewBytes),expectedFixture:expected,before,after,added,removed,addedWholeGoals:currentRaw.goals.filter((g:any)=>added.includes(g.id))})
  }
}
const changes = audits.filter(x=>x.before.count!==x.after.count)
const previousNativeRunPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/memory-final-origin-protected-binding-restoration-technical-root-v1/technical-bindings-terminal-checks.actual.json'
const diagnosisPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/memory-final-origin-protected-binding-restoration-technical-root-v1/whole-original-final-origin-diagnosis.actual.json'
const diagnosis = JSON.parse(readFileSync(diagnosisPath,'utf8'))
const reviewPath = 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-informatics-full.review.jsonl'
const cardReviewPath = 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-informatics-full.cards.review.jsonl'
const cardRows = readFileSync(cardReviewPath,'utf8').trim().split('\n').map(line=>JSON.parse(line))
const originRows = readFileSync(reviewPath,'utf8').trim().split('\n').map(line=>JSON.parse(line))
const affectedMemoryIds = new Set(changes.flatMap(x=>x.added))
const previousNativeRun = JSON.parse(readFileSync(previousNativeRunPath,'utf8'))
const continuityPaths = [reviewPath,cardReviewPath,'curricula/DE/Gymnasium/memory-decks/de_gymnasium_informatics_flashcards_databases.de.json','curricula/DE/Gymnasium/memory-decks/de_gymnasium_informatics_flashcards_formal_languages.de.json']
const continuity = continuityPaths.map(path=>{const actual=readFileSync(path,'utf8'); const historical=execFileSync('git',['show',`HEAD:${path}`],{encoding:'utf8'}); return{path,sha256:sha(actual),exactAtAuditHead:actual===historical}})
const stripApp = (goal:any)=>{const copy=structuredClone(goal);delete copy.applicability;return copy}
const oldGoalById = new Map(oldRaw.goals.map((goal:any)=>[goal.id,goal]))
const fieldsUnchanged = currentRaw.goals.every((goal:any)=>JSON.stringify(stripApp(goal))===JSON.stringify(stripApp(oldGoalById.get(goal.id))))
const result = {
  execution:'Actual read-only native TypeScript composition compiler plus existing runtime convertLearningGoal / goalMatchesFilters. The native backend selects the committed exact-stage DE-wide SekI composition view for these duration-neutral scopes, per CompositionViewService.findLearnerScopeView; CrossStage jurisdiction views cannot match a SekI request. Backend computeGoalProjection applies course/jurisdiction eligibility then composition placement, without an additional phase-name stage heuristic.; no reimplementation of filter semantics.',
  auditGitRevision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  before:{canonicalPath,beforeSnapshotPath,sha256:sha(oldBytes)},
  after:{canonicalPath,sha256:sha(currentBytes)},
  counting:'Compiled target atomic leaves, including memorization and orientation, for the exact existing personal curriculum test scope. Same committed views before and after.',
  audits, changes,
  allBeforeCountsMatchExistingFixtures:audits.every(x=>x.before.count===x.expectedFixture),
  noRemovedTargets:audits.every(x=>x.removed.length===0),
  allNativeCompositionFindingsZero:audits.every(x=>x.before.compilerFindings.length===0&&x.after.compilerFindings.length===0),
  wholeGoalFieldsExceptApplicabilityUnchanged:fieldsUnchanged,
  memoryOriginAndCardContinuity:continuity,
  previousActualNativeMemoryCheck:{path:previousNativeRunPath,sha256:sha(readFileSync(previousNativeRunPath,'utf8')),result:previousNativeRun},
  actualPreviouslyCompiledOriginSourceEvidence:{path:diagnosisPath,sha256:sha(readFileSync(diagnosisPath,'utf8')),affected:diagnosis.affected.filter((item:any)=>affectedMemoryIds.has(item.goalId))},
  unchangedMemoryRequiredOriginRows:originRows.filter((row:any)=>row.memoryGoalIds?.some((id:string)=>affectedMemoryIds.has(id))),
  unchangedKeptCardRows:cardRows.filter((row:any)=>['de_gymnasium_informatics_databases','de_gymnasium_informatics_formal_languages'].includes(row.deckId)),
  scopeSelectionEvidence:{nativeBackend:'CompositionViewService.findLearnerScopeView selects exact-stage schoolForm Gymnasium/SekI committed view and rejects jurisdiction CrossStage views; current compiler per-target filtering matches all 28 original backend fixtures before the binding fix and the actual observed HH22 result afterward.',viewPath:'curricula/DE/Gymnasium/composition-views/informatik/de-de-gym-seki-informatics.view.json'},
  activeProductionEdits:false, scientificApprovalClaim:false,
}
writeFileSync(resolve(dossierPath,'all-twenty-eight-native-target-set-deltas.actual.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({allBeforeCountsMatchExistingFixtures:result.allBeforeCountsMatchExistingFixtures,allNativeCompositionFindingsZero:result.allNativeCompositionFindingsZero,scopes:audits.map(x=>({scope:x.jurisdiction+'/'+x.durationModel,before:x.before.count,after:x.after.count,added:x.added,removed:x.removed}))},null,2))
