// Unchanged native APIs; exact scope/context comparison, no review claim.
import { readFile,writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { loadGoalBookBuildInputs,stableGoalBookJson,fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
const cPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json', sPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1/wirtschaftswissenschaften.semantic-kinds.json'
const landscape=JSON.parse(await readFile(cPath,'utf8')), semkind=JSON.parse(await readFile(sPath,'utf8'))
const goals=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const changed=[]
for(const decision of semkind.decisions){const next=fingerprintSemanticKindSourceGoal(goals.get(decision.goalId) as any);if(next!==decision.sourceFingerprint)changed.push(decision.goalId);decision.sourceFingerprint=next}
if(JSON.stringify(changed)!==JSON.stringify(['eef95305-c811-50a4-9157-bfd4e5780c24']))throw new Error('More than actual single source-semkind binding changed: '+JSON.stringify(changed))
await writeFile(sPath,JSON.stringify(semkind,null,2)+'\n')
const base=await loadGoalBookBuildInputs('curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1/review-book-full.config.json')
const oldConfig=JSON.parse(await readFile('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-twenty-native-preparation-technical-20261008-v2/native-d-e2-twenty.final.batch.config.json','utf8'))
const model=buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:oldConfig.goalIds,bookId:oldConfig.bookId,title:oldConfig.title})
const oldModel=JSON.parse(await readFile('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-twenty-native-preparation-technical-20261008-v2/native-d-e2-twenty-final/bundle/book-model.json','utf8'))
const oldInput=JSON.parse(await readFile('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-twenty-native-preparation-technical-20261008-v2/native-d-e2-twenty-final/round-a/description-review-input.json','utf8'))
const comparison=[]
for(let i=0;i<model.pages.length;i++){
 const page=model.pages[i],before=oldModel.pages[i],previous=oldInput.goals[i],g:any=goals.get(page.goalId)
 const unchangedPage=stableGoalBookJson(page)===stableGoalBookJson(before)
 const unchangedBilingual=['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn'].every((key,j)=>previous[key]===[g.title,g.titleEn,g.description,g.descriptionEn][j])
 const unchangedContext=stableGoalBookJson(buildGoalDescriptionCanonicalContext(g))===stableGoalBookJson(previous.canonicalContext)
 if(page.goalId!=='eef95305-c811-50a4-9157-bfd4e5780c24'&&!(unchangedPage&&unchangedBilingual&&unchangedContext))throw new Error('Affected neighbour requires actual targeted followup: '+page.goalId)
 comparison.push({goalId:page.goalId,unchangedPage,unchangedBilingual,unchangedContext,oldGoalFingerprint:before.goalFingerprint,newGoalFingerprint:page.goalFingerprint,oldPageFingerprint:before.pageFingerprint,newPageFingerprint:page.pageFingerprint})
}
await writeFile('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-bias-concept-clarification-native-preparation-20261008-v1/native-current20-model-comparison.inert.json',JSON.stringify(model,null,2)+'\n')
await writeFile('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-bias-concept-clarification-native-preparation-20261008-v1/native-nineteen-retained-page-context-comparison.actual.json',JSON.stringify({role:'technical_preparer',checkedAt:new Date().toISOString(),nativeApis:['loadGoalBookBuildInputs','buildGoalDescriptionRolloutSubsetModel','buildGoalDescriptionCanonicalContext'],semanticKindSourceBindingChangedGoalIds:changed,comparison,retainedUnchangedGoals:comparison.filter(r=>r.goalId!=='eef95305-c811-50a4-9157-bfd4e5780c24').length,descriptionReviewsRepeated:0,independentReviewClaim:false,activeWrites:0},null,2)+'\n')
console.log('Native source/page/bilingual/context comparison retains19; only EEF source binding changed. No D replay.')
