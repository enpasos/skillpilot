// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from '/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js'
const R='/home/enpasos/projects/skillpilot',rel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-native9-current437-fresh-independent-a-20261016-v1'
const O=resolve(R,rel),K=resolve(R,'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const first=read(resolve(O,'FIRST.independent-current-nine-science-and-separate699.frozen.json')),seal=read(resolve(O,'SEAL.first-science-before-native-serialization.json'))
const module=readFileSync(resolve(K,'app/scripts/memoryCardReview.ts'),'utf8')
const start=module.indexOf('function normalizeText('),end=module.indexOf('function memoryCardKey(',start)
assert.ok(start>=0&&end>start)
const js=ts.transpileModule(module.slice(start,end),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
const fingerprint=new Function('createHash',js+';return fingerprintMemoryCard;')(createHash)
const rows=[]
for(const [file,cardId,origin] of [
 ['de_gymnasium_chemistry_flashcards_bonding_structure.de.json','chem_bond_009','37b4081a-244a-58d8-b448-88ed83344210'],
 ['de_gymnasium_chemistry_flashcards_equilibria_q3.de.json','chem_eq_q3_008','b8c8f70f-64cb-50b1-970c-e0c4295da3fb'],
 ['de_gymnasium_chemistry_flashcards_equilibria_q3.de.json','chem_eq_q3_012','0e3f849b-133d-57da-882c-0d67c3eb05b8'],
 ['de_gymnasium_chemistry_flashcards_equilibria_q3.de.json','chem_eq_q3_013','0e3f849b-133d-57da-882c-0d67c3eb05b8'],
]){
 const deck=read(resolve(K,'curricula/DE/Gymnasium/memory-decks',file)),card=deck.cards.find((c:any)=>c.id===cardId),s=first.rows.find((r:any)=>r.goalId===origin)
 assert.ok(card);assert.ok(s.M.startsWith('memory_required:'))
 const payload={deckId:deck.deckId,cardId:card.id,front:card.front,back:card.back,category:card.category,tags:card.tags}
 rows.push({schemaVersion:1,reviewId:'chemie-native9-current437-fresh-independent-a-20261016-v1',ruleVersion:'memory-card-review-v1',landscapeId:'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',deckId:deck.deckId,cardId:card.id,fingerprint:fingerprint(payload,'memory-card-review-v1'),status:'kept',necessary:true,originGoalIds:[origin],reviewedAt:new Date().toISOString(),reviewer:'/root/chemie_native9_fresh_independent_a_20261016',reason:s.M+' Exact card content was read independently. This compact recall does not replace ordinary explanation/application/transfer. First science '+seal.sha256})
}
writeFileSync(resolve(O,'M4.actual-inspected-cards.current-independent.cards.review.jsonl'),rows.map(r=>JSON.stringify(r)).join('\n')+'\n')
console.log(JSON.stringify({independentlyInspectedKeptCards:rows.length,newQualitativeCards:rows.filter(r=>r.cardId==='chem_eq_q3_012'||r.cardId==='chem_eq_q3_013').length}))
