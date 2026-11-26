// SPDX-License-Identifier: Apache-2.0
// Join two recorded subject judgements and verified native fingerprints. This code cannot provide a review vote.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'

const base = dirname(fileURLToPath(import.meta.url))
const root = resolve(base, '../../../../../../../..')
const local = (p: string) => relative(root, p).split('\\').join('/')
const broot = local(base)
const raw = (p: string) => readFileSync(resolve(root,p),'utf8')
const object = (p: string) => JSON.parse(raw(p))
const hash = (x: string | Buffer) => 'sha256:' + createHash('sha256').update(x).digest('hex')
const json = (x: unknown) => JSON.stringify(x,null,2)+'\n'
const save = (p: string, body: string) => {
  const target=resolve(root,p)
  mkdirSync(dirname(target),{recursive:true})
  if (existsSync(target)) assert.equal(readFileSync(target,'utf8'),body,'Previously written evidence differs: '+p)
  else writeFileSync(target,body)
}
const pin=(p:string)=>({path:p,sha256:hash(raw(p))})
const proof=await import(pathToFileURL(resolve(root,'app/scripts/prerequisiteReductionProof.ts')).href)
const {fingerprintSemanticKindSourceGoal} = await import(pathToFileURL(resolve(root,'app/scripts/goalBookModel.ts')).href)
const stable=(x:any):string=>Array.isArray(x)?'['+x.map(stable).join(',')+']':
  x&&typeof x==='object'?'{'+Object.entries(x).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+stable(v)).join(',')+'}':JSON.stringify(x)
const norm = (x:any)=>String(x??'').normalize('NFKC').replace(/\s+/g,' ').trim()
const semanticFields=(g:any,ruleVersion:string)=>({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:norm(g.title),titleEn:norm(g.titleEn),description:norm(g.description),descriptionEn:norm(g.descriptionEn),phase:norm(g.dimensionTags?.phase),area:norm(g.dimensionTags?.area),topicCode:norm(g.dimensionTags?.topicCode),nodeKind:norm(g.nodeKind)})
const packet=object(broot+'/reviewed-goals-and-cards.json')
const boundObjectIds=new Set<string>(packet.goals.map((g:any)=>g.id))
const confirmations = ['a','b'].map(role=>object(broot+'/confirmation-'+role+'.actual.json'))
assert.ok(confirmations.every(r=>r.independenceDisclosure && r.completedAt))
const reviewedAt=new Date(Math.max(...confirmations.map(r=>Date.parse(r.completedAt)))).toISOString()
const reviewer='OpenAI Codex, informed synthesis of two independent current subject reviews'
const getReviews=(field:string,id:string,key='goalId')=>confirmations.map(r=>{
  const row=r[field]?.find((x:any)=>x[key]===id);assert.ok(row,'Missing '+field+' for '+id);return row
})
const catalogPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const catalog=object(catalogPath), goals=new Map<string,any>(catalog.goals.map((g:any)=>[g.id,g]))
for(const g of packet.goals) {
  assert.deepEqual(goals.get(g.id),g)
  assert.ok(getReviews('atomicityReviews',g.id).every(r=>r.semanticAtomic===true))
  assert.ok(getReviews('profileReviews',g.id).every(r=>r.decision==='keep'||r.decision==='accept_current'))
}
const nativeIndex=broot+'/description-batch/resolution-index.json'
const readyD=new Set<string>(object(nativeIndex).resolutions.map((r:any)=>r.goalId))
assert.deepEqual(readyD,boundObjectIds,'Unresolved D needs individual disposition before global activation')
const stageCommits='eb77c4fb68ef701f9c188e0a66411dbfb76dfd26'
const historical=(p:string)=>execFileSync('git',['show',stageCommits+':'+p],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024})
const outputs = new Map<string,{before:string;after:string}>()
function update(live:string,before:string,after:string) {
  assert.ok(raw(live)===before||raw(live)===after,'Unexpected independent change: '+live)
  outputs.set(live,{before,after})
}
const q='curricula/DE/Gymnasium/quality'
function reviewedLines(live:string,key:(row:any)=>string,rows:Map<string,any>) {
  const before=historical(live), lines=before.trimEnd().split('\n'), seen=new Set<string>()
  const changes=Object.fromEntries([...rows].map(([id,current])=>[id,{before:null,current}])) as Record<string,any>
  const after=lines.map(line=>{
    const entry=JSON.parse(line),id=key(entry)
    if(!rows.has(id))return line
    seen.add(id);changes[id].before=entry;return JSON.stringify(rows.get(id))
  })
  for(const [id,row] of rows)if(!seen.has(id))after.push(JSON.stringify(row))
  const body=after.join('\n')+'\n';update(live,before,body)
  return {path:live,previous:hash(before),current:hash(body),changes}
}
const byGoal=(x:any)=>x.goalId
const aq=q+'/semantic-atomicity/canonical-physics-full.review.jsonl'
const am=q+'/memory-card-review/canonical-physics-full.review.jsonl'
const cm=q+'/memory-card-review/canonical-physics-full.cards.review.jsonl'
const oldM=new Map(historical(am).trimEnd().split('\n').map(l=>{const x=JSON.parse(l);return[x.goalId,x]}))
const newAtomic=new Map<string,any>(), newMemory=new Map<string,any>()
for(const g of packet.goals) {
  const id=g.id, ar=getReviews('atomicityReviews',id), mr=getReviews('memoryGoalReviews',id)
  assert.ok(mr.every(r=>r.decision==='accept_current'||r.decision==='keep'))
  const common={schemaVersion:1,reviewId:'canonical-physics-full',landscapeId:catalog.landscapeId,goalId:id,reviewedAt,reviewer}
  const aVersion='semantic-atomicity-v1',mVersion='memory-card-review-v1'
  newAtomic.set(id,{...common,ruleVersion:aVersion,fingerprint:hash(stable(semanticFields(g,aVersion))),status:'atomic',semanticAtomic:true,reason:ar.map((r,i)=>(i?'B: ':'A: ')+r.reason).join(' '),suggestedSplit:[]})
  const old:any=oldM.get(id);const useful=old?old.memoryUseful:id.startsWith('b77a7e93')
  assert.ok(mr.every(r=>typeof r.memoryUseful==='boolean'),'Missing independently stated memory verdict '+id)
  if (mr[0].memoryUseful===mr[1].memoryUseful) assert.equal(useful,mr[0].memoryUseful,'A new unanimous memory judgement needs a scoped decision: '+id)
  else assert.ok(id.startsWith('41d35667')||id.startsWith('4ca83b3f'),'Unexpected memory dissent needs an individual synthesis: '+id)
  const noSeparateCard='Current editorial decision: the independent graphical task is the assessable performance. A recall prompt is optional and supplies no separate essential memory kernel here.'
  newMemory.set(id,{...(old??{}),...common,ruleVersion:mVersion,fingerprint:hash(stable(semanticFields(g,mVersion))),status:useful?'memory_required':'no_memory_needed',memoryUseful:useful,...(useful?{memoryGoalIds:['9f2f5ab8-0ae4-5792-b831-82a05af5895c'],deckIds:['de_gymnasium_physics_mechanics_ephase']}:{}),reason:mr.map((r,i)=>(i?'B: ':'A: ')+r.reason).join(' ')+(useful?'':' '+noSeparateCard)})
}
const newCardRows=new Map<string,any>()
const cardPath=(lang:string)=>'curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.'+lang+'.json'
for(const b of packet.cards) {
 const d=object(cardPath(b.language));const c=d.cards.find((c:any)=>c.id===b.card.id)
 assert.deepEqual(b.card,c);assert.deepEqual(d,object('app/public/data/'+cardPath(b.language).split('/').at(-1)))
 if(b.language!=='de')continue
 const reviews=getReviews('cardReviews',c.id,'cardId');assert.ok(reviews.every(r=>r.decision==='keep'||r.decision==='accept_current'))
 const ver='memory-card-review-v1'
 const payload={ruleVersion:ver,deckId:d.deckId,cardId:c.id,front:norm(c.front),back:norm(c.back),category:norm(c.category),tags:c.tags.map(norm).filter(Boolean)}
 newCardRows.set(d.deckId+'::'+c.id,{schemaVersion:1,reviewId:'canonical-physics-full',ruleVersion:ver,landscapeId:catalog.landscapeId,deckId:d.deckId,cardId:c.id,fingerprint:hash(stable(payload)),status:'kept',necessary:true,originGoalIds:c.originGoalIds,reviewedAt,reviewer,reason:reviews.map((r,i)=>(i?'B: ':'A: ')+[r.scientificCorrectness,r.languageEquivalence,r.originFit,r.recallBoundary].filter(Boolean).join(' ')).join(' ')})
}
const atomic=reviewedLines(aq,byGoal,newAtomic)
const memory=reviewedLines(am,byGoal,newMemory)
const cards=reviewedLines(cm,x=>x.deckId+'::'+x.cardId,newCardRows)
const cc=q+'/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const original=historical(cc);const config=JSON.parse(original)
const subject=config.subjects.find((s:any)=>s.subject==='physik')
const replacements:any[]=[]
subject.positiveEvidenceConfigPaths=subject.positiveEvidenceConfigPaths.flatMap((p:string,index:number)=>{
  const old=object(p), lines=raw(old.reviewPath).trimEnd().split('\n')
  const removed=lines.filter(l=>boundObjectIds.has(JSON.parse(l).goalId)), keep=lines.filter(l=>!boundObjectIds.has(JSON.parse(l).goalId))
  if(!removed.length)return[p]
  const changes:any={priorConfig:pin(p),priorReview:pin(old.reviewPath),removed:removed.map(l=>JSON.parse(l).goalId)}
  replacements.push(changes)
  if(!keep.length)return[]
  const stem=broot+'/retained-profiles/'+String(index+1).padStart(3,'0')
  const newPath=stem+'.config.json',reviewPath=stem+'.review.jsonl'
  const replacement={...old,reviewPath,scope:{...old.scope,goalIds:old.scope.goalIds.filter((id:string)=>!boundObjectIds.has(id))}}
  save(newPath,json(replacement));save(reviewPath,keep.join('\n')+'\n');changes.successorConfig=pin(newPath);changes.retainedOtherRows=keep.length;return[newPath]
})
subject.positiveEvidenceConfigPaths.push(broot+'/positive.config.json')
const supersessions=subject.resolutionSupersessions??[], additions:any[]=[]
for(const p of subject.resolutionIndexPaths)for(const item of object(p).resolutions) {
  if(!readyD.has(item.goalId))continue
  if(supersessions.some((r:any)=>r.goalId===item.goalId&&r.supersededIndexPath===p))continue
  if((subject.resolutionWithdrawals??[]).some((r:any)=>r.goalId===item.goalId&&r.indexPath===p))continue
  additions.push({goalId:item.goalId,supersededIndexPath:p,replacementIndexPath:nativeIndex})
}
subject.resolutionSupersessions=[...supersessions,...additions]
subject.resolutionIndexPaths.push(nativeIndex)
update(cc,original,json(config))
const regPath='curricula/DE/Gymnasium/provenance/prerequisite-reduction-proof-registry.json'
assert.equal(raw(regPath),historical(regPath))
const registry=object(regPath), beforeGoals=new Map<string,any>(JSON.parse(historical(catalogPath)).goals.map((g:any)=>[g.id,g]))
const ledgerPath=q+'/release-model/physik.semantic-kinds.json', ledger=object(ledgerPath)
const rows=packet.goals.map((g:any)=>{
 const transfer=registry.transfers.find((t:any)=>t.source===catalog.landscapeId+':'+g.id)
 const prior=beforeGoals.get(g.id);const prev=prior?proof.fingerprintPrerequisiteReductionRecord(prior):null,now=proof.fingerprintPrerequisiteReductionRecord(g)
 const kind=ledger.decisions.find((r:any)=>r.goalId===g.id);assert.equal(kind.sourceFingerprint,fingerprintSemanticKindSourceGoal(g))
 return {goalId:g.id,before:prev,current:now,registryContainsTransfer:!!transfer,frozenDigest:transfer?.frozenGoalDigest??null,priorTransferAvailable:!!transfer&&prev===transfer.frozenGoalDigest,currentTransferAvailable:!!transfer&&now===transfer.frozenGoalDigest,currentSemanticFingerprint:kind.sourceFingerprint,currentDIndex:pin(nativeIndex),currentP:pin(broot+'/positive.review.jsonl'),currentA:newAtomic.get(g.id).fingerprint,currentM:newMemory.get(g.id).fingerprint,actualCurrentInputReviews:true}
})
const receipt={schemaVersion:1,contract:'physics-directed-quantity-arrows-current-quality-activation-v1',reviewedAt,reviewer,firstRoundEvidence:['a','b'].map(r=>pin(local(resolve(base,'../independent-'+r+'.v1.actual.json')))),completeCurrentConfirmations:['a','b'].map(r=>pin(broot+'/confirmation-'+r+'.actual.json')),scope:'Individual D, P, A and M decisions; initial dissent and previous reviews remain separately recoverable. AI subject review with no human attestation.',earlierDescriptionIndex:pin(local(resolve(base,'../description-batch/resolution-index.json'))),descriptionIndex:pin(nativeIndex),supersessions:additions,retainedP:replacements,atomic,memory,cards,configBefore:hash(original),configAfter:hash(json(config)),frozenRegistry:pin(regPath),baseline:stageCommits,perGoal:rows,consentToHumanApproval:false,learnerResultsWritten:false}
save(broot+'/activation.actual.json',json(receipt))
for(const [p,{after}] of outputs) {
  // These checkouts may share unchanged files by hardlink; replace directory entries locally.
  const target=resolve(root,p)
  if (raw(p)!==after) {
    const temporary=target+'.a2-'+process.pid
    writeFileSync(temporary,after,{flag:'wx'})
    renameSync(temporary,target)
  }
}
console.log(JSON.stringify({activatedD:readyD.size,confirmedP:rows.length,atomic:newAtomic.size,memory:newMemory.size,cards:newCardRows.size,descriptionSupersessions:additions.length}))
