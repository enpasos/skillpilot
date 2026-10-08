// Apache-2.0. Exact private helpers copied unchanged from the native memory checker.
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {dirname,join,resolve,relative,sep} from 'node:path'
import {fileURLToPath} from 'node:url'
import type {LearningGoal} from '/home/enpasos/projects/skillpilot/app/src/landscapeTypes'
const repoRoot='/home/enpasos/projects/skillpilot'
const here=dirname(fileURLToPath(import.meta.url))
type MemoryDeckCard={deckId:string;cardId:string;front:string;back:string;category:string;tags:string[]}
function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function resolveRepoPath(path: string): string {
  return resolve(repoRoot, path)
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(',')}]`
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function fingerprintMemoryCard(card: MemoryDeckCard, ruleVersion: string): string {
  const payload = stableJson({
    ruleVersion,
    deckId: card.deckId,
    cardId: card.cardId,
    front: card.front,
    back: card.back,
    category: card.category,
    tags: card.tags,
  })
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`
}

function collectCompositionViewVisibleGoalIds(
  viewPath: string,
  goalById: Map<string, LearningGoal>,
): { visibleGoalIds: Set<string>; errors: string[] } {
  const errors: string[] = []
  const visibleGoalIds = new Set<string>()
  const absoluteViewPath = resolveRepoPath(viewPath)
  if (!existsSync(absoluteViewPath)) {
    return {
      visibleGoalIds,
      errors: [`Composition view missing: ${viewPath}`],
    }
  }

  const addSubtree = (goalId: string, visiting = new Set<string>()) => {
    if (visibleGoalIds.has(goalId) || visiting.has(goalId)) return
    const goal = goalById.get(goalId)
    if (!goal) {
      errors.push(`${viewPath}: references missing goal ${goalId}`)
      return
    }
    visiting.add(goalId)
    visibleGoalIds.add(goalId)
    for (const childId of goal.contains ?? []) addSubtree(childId, visiting)
    visiting.delete(goalId)
  }

  const visitNode = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const row = node as {
      kind?: unknown
      goalId?: unknown
      projectionRole?: unknown
      children?: unknown
    }
    if (row.projectionRole === 'prerequisiteOnly') return
    if (row.kind === 'canonicalSubtree') {
      if (typeof row.goalId === 'string' && row.goalId.trim()) {
        addSubtree(row.goalId)
      } else {
        errors.push(`${viewPath}: canonicalSubtree without goalId`)
      }
      return
    }
    if (row.kind === 'goalEntry') {
      if (typeof row.goalId === 'string' && row.goalId.trim()) {
        if (goalById.has(row.goalId)) {
          visibleGoalIds.add(row.goalId)
        } else {
          errors.push(`${viewPath}: goalEntry references missing goal ${row.goalId}`)
        }
      } else {
        errors.push(`${viewPath}: goalEntry without goalId`)
      }
      return
    }
    if (Array.isArray(row.children)) {
      row.children.forEach(visitNode)
    }
  }

  try {
    const parsed = loadJson<{ rootNodes?: unknown[] }>(absoluteViewPath)
    if (!Array.isArray(parsed.rootNodes)) {
      errors.push(`${viewPath}: rootNodes must be an array`)
      return { visibleGoalIds, errors }
    }
    parsed.rootNodes.forEach(visitNode)
  } catch (error) {
    errors.push(`${viewPath}: cannot parse composition view (${(error as Error).message})`)
  }

  return { visibleGoalIds, errors }
}


const hash=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const source=join(here,'../wirtschaft-e2-fourteen-bilingual-positive-author-v1')
const candidates=loadJson<LearningGoal[]>(join(source,'whole-goals.candidate.json'))
const actualLandscape=loadJson<{goals:LearningGoal[]}>(join(repoRoot,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'))
const candidateMap=new Map(candidates.map(g=>[g.id,g]))
const actualMap=new Map(actualLandscape.goals.map(g=>[g.id,g]))
const futureMap=new Map(actualLandscape.goals.map(g=>[g.id,candidateMap.get(g.id)??g]))
const nativeCheck=loadJson<any>(join(here,'native-independent-candidate-check.actual.json'))
const fullReceipt=loadJson<any>(join(here,'independent-full-positive-translation-AM-review.receipt.json'))
const actualM=readFileSync(join(repoRoot,'curricula/DE/Gymnasium/quality/memory-card-review/canonical-economics-full.review.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse)
const actualA=readFileSync(join(repoRoot,'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-economics-full.review.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse)
const aMap=new Map(actualA.map((r:any)=>[r.goalId,r]));const mMap=new Map(actualM.map((r:any)=>[r.goalId,r]))
const selectedMemory=actualM.filter((r:any)=>candidateMap.has(r.goalId)&&r.status==='memory_required')
const deckPath=join(repoRoot,'curricula/DE/Gymnasium/memory-decks/de_gymnasium_economics_flashcards_macro_money_policy.de.json')
const publicPath=join(repoRoot,'app/public/data/de_gymnasium_economics_flashcards_macro_money_policy.de.json')
const deck=loadJson<any>(deckPath);const raw=deck.cards.find((c:any)=>c.id==='economics-macro-money-functions')
const card:MemoryDeckCard={deckId:deck.deckId,cardId:raw.id,front:raw.front,back:raw.back,category:raw.category,tags:raw.tags}
const cards=readFileSync(join(repoRoot,'curricula/DE/Gymnasium/quality/memory-card-review/canonical-economics-full.cards.review.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse)
const cardReview=cards.find((c:any)=>c.deckId===card.deckId&&c.cardId===card.cardId)
const cardNativeFingerprint=fingerprintMemoryCard(card,'memory-card-review-v1')
const errors:string[]=[]
if(nativeCheck.status!=='pass')errors.push('Independent original A/M and native P technical check failed')
if(selectedMemory.length!==1||selectedMemory[0].goalId!=='40676995-14fc-55a9-89ae-440b2ee3ab33')errors.push('Unexpected changed memory decision scope')
if(cardReview.fingerprint!==cardNativeFingerprint)errors.push('Actual relevant card is not currently bound to its historical review')
if(JSON.stringify(cardReview.originGoalIds)!==JSON.stringify(raw.originGoalIds))errors.push('Card origin IDs do not match exact actual card')
if(!readFileSync(deckPath).equals(readFileSync(publicPath)))errors.push('Actual recall vocabulary and canonical deck bytes differ')
const recall=actualMap.get('mem_de_gym_economics_macro_money_policy')!
if(!recall.tags?.includes('srs-deck:'+deck.deckId))errors.push('Actual recall tag does not bind expected deck')
if((recall.extendedData as any)?.vocabularySource!=='/data/de_gymnasium_economics_flashcards_macro_money_policy.de.json')errors.push('Actual recall vocabulary path does not bind observed public deck')
const scopes=['gk','lk'].map(profile=>{
 const path='curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-'+profile+'.view.json'
 const before=collectCompositionViewVisibleGoalIds(path,actualMap);const after=collectCompositionViewVisibleGoalIds(path,futureMap)
 errors.push(...before.errors,...after.errors)
 const selectedBefore=candidates.filter(g=>before.visibleGoalIds.has(g.id)).map(g=>g.id)
 const selectedAfter=candidates.filter(g=>after.visibleGoalIds.has(g.id)).map(g=>g.id)
 const recalledBefore=before.visibleGoalIds.has(recall.id);const recalledAfter=after.visibleGoalIds.has(recall.id)
 if(selectedBefore.length!==14||selectedAfter.length!==14||!recalledBefore||!recalledAfter)errors.push(profile+': affected content or required recall goal visibility missing')
 if(JSON.stringify(selectedBefore)!==JSON.stringify(selectedAfter))errors.push(profile+': translation changed projected affected IDs')
 return {profile,viewPath:path,viewDigest:hash(readFileSync(join(repoRoot,path))),affectedContentBefore:selectedBefore,affectedContentAfter:selectedAfter,requiredRecallBefore:recalledBefore,requiredRecallAfter:recalledAfter,nativeErrors:[...before.errors,...after.errors]}
})
const semanticRows=fullReceipt.goals as any[]
const make=(layer:string)=>nativeCheck.rows.map((r:any)=>{
 const old=(layer==='atomicity'?aMap:mMap).get(r.goalId) as any
 const reason=semanticRows.find((x:any)=>x.goalId===r.goalId).translationEffectOnExistingAMJudgements
 return {...old,fingerprint:layer==='atomicity'?r.candidateAtomicityFingerprint:r.candidateMemoryFingerprint,reviewedAt:'2026-10-08',reviewer:'codex-economics-layer-a-independent-translation-parity-20261008',reason:old.reason+' Targeted independent DE/EN parity review: '+reason+' This is an exact current translation binding of the preserved historical decision, not a new complete '+layer+' expert review. Evidence: wirtschaft-e2-fourteen-independent-positive-parity-review-v1/independent-full-positive-translation-AM-review.receipt.json.'}
})
for(const layer of ['atomicity','memory']){
 const path=join(here,layer+'.successor-bindings.inert.jsonl');if(existsSync(path))throw new Error('No overwrite of existing candidate '+path)
 writeFileSync(path,make(layer).map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
}
const out={artifactKind:'actual-targeted-native-card-visibility-and-translation-rebind-check-v1',reviewer:'/root/economics_layer_a',status:errors.length?'fail':'pass',nativeMemorySourcePath:'app/scripts/memoryCardReview.ts',nativeMemorySourceDigest:hash(readFileSync(join(repoRoot,'app/scripts/memoryCardReview.ts'))),privateNativeHelpersCopiedUnchanged:['loadJson','resolveRepoPath','stableJson','fingerprintMemoryCard','collectCompositionViewVisibleGoalIds'],selectedGoalCount:14,existingMemoryRequired:1,existingNoMemory:13,relevantCardId:card.cardId,relevantCardFingerprint:cardNativeFingerprint,historicalRelevantCardFingerprint:cardReview.fingerprint,originBindingsUnchanged:raw.originGoalIds,deckDigest:hash(readFileSync(deckPath)),publicVocabularyDigest:hash(readFileSync(publicPath)),sourceRecallGoal:recall,visibilityScopes:scopes,atomicitySuccessorBindings:14,memorySuccessorBindings:14,newFachlicheAMReviewsClaimed:0,newCardsOrRecallGoals:0,newStrictClosures:0,unresolvedPositiveFindings:3,limits:['The one current affected card is verified after actual semantic reading; eleven deck cards were read for context, not re-reviewed as new expert decisions.','Fourteen EN-sensitive successor records are inert and preserve the historical verdicts, justified by actual complete translation parity reading.','Native binding validation does not close the three substantive P findings or provide final image/page/source integration.'],errors}
const target=join(here,'native-card-visibility-and-rebind.actual.json');if(existsSync(target))throw new Error('Do not overwrite receipt');writeFileSync(target,JSON.stringify(out,null,2)+'\n')
console.log(JSON.stringify({status:out.status,nativeCardChecks:1,nativeVisibilityScopes:2,atomicitySuccessorBindings:14,memorySuccessorBindings:14,errors}))
if(errors.length)process.exitCode=1
