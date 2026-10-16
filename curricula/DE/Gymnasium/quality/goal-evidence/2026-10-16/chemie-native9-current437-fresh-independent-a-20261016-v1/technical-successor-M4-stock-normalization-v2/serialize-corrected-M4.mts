// SPDX-License-Identifier: Apache-2.0
// Additive technical correction only; original card judgments and dates retained.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import ts from '/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js'
const R='/home/enpasos/projects/skillpilot',E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const O=resolve(R,E,'chemie-native9-current437-fresh-independent-a-20261016-v1')
const N=resolve(O,'technical-successor-M4-stock-normalization-v2')
const K=resolve(R,'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const oldPath=resolve(O,'M4.actual-inspected-cards.current-independent.cards.review.jsonl')
const oldSha=sha(oldPath),firstPath=resolve(O,'FIRST.independent-current-nine-science-and-separate699.frozen.json'),firstSha=sha(firstPath),handoffPath=resolve(O,'HANDOFF.final-independent-a.seal.json'),handoffSha=sha(handoffPath)
assert.equal(firstSha,'sha256:dbdbefe4b37fa1dc2d314b647d1a275d81715783a9c2b6c76ef17ce846d97d4a')
const rows=readFileSync(oldPath,'utf8').trim().split(/\r?\n/).map(JSON.parse)
const sourcePath=resolve(K,'app/scripts/memoryCardReview.ts'),source=readFileSync(sourcePath,'utf8')
const start=source.indexOf('function normalizeText('),end=source.indexOf('function memoryCardKey(',start)
assert.ok(start>=0&&end>start)
const fragment=source.slice(start,end),js=ts.transpileModule(fragment,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
const {normalizeText,fingerprintMemoryCard}=new Function('createHash',js+';return {normalizeText,fingerprintMemoryCard};')(createHash)
const stockPath=resolve(R,E,'chemie-current437-nine-targeted-native-pages-combined639-technical-20261016-v1/cards79.exact-author-current-for-check.jsonl')
const stock=readFileSync(stockPath,'utf8').trim().split(/\r?\n/).map(JSON.parse)
const details=[]
const corrected=rows.map((old:any)=>{
 const filename=old.deckId==='de_gymnasium_chemistry_bonding_structure'?'de_gymnasium_chemistry_flashcards_bonding_structure.de.json':'de_gymnasium_chemistry_flashcards_equilibria_q3.de.json'
 const deckPath=resolve(K,'curricula/DE/Gymnasium/memory-decks',filename),deck=read(deckPath),row=deck.cards.find((c:any)=>c.id===old.cardId)
 assert.ok(row);assert.equal(deck.deckId,old.deckId)
 // Exact preprocessing from current stock collectMemoryDeckEvidence:
 const payload={deckId:deck.deckId,cardId:typeof row.id==='string'?row.id.trim():'',front:normalizeText(row.front),back:normalizeText(row.back),category:normalizeText(row.category),tags:Array.isArray(row.tags)?row.tags.map((tag:any)=>normalizeText(tag)).filter(Boolean):[]}
 const next={...old,fingerprint:fingerprintMemoryCard(payload,'memory-card-review-v1')}
 const operative=stock.find((r:any)=>r.deckId===next.deckId&&r.cardId===next.cardId)
 assert.ok(operative);assert.equal(next.fingerprint,operative.fingerprint)
 const oldWithout={...old},nextWithout={...next};delete oldWithout.fingerprint;delete nextWithout.fingerprint;assert.deepEqual(oldWithout,nextWithout)
 details.push({deckId:old.deckId,cardId:old.cardId,oldFingerprint:old.fingerprint,currentFingerprint:next.fingerprint,fingerprintChanged:old.fingerprint!==next.fingerprint,stockMatch:true,scienceAndReviewedAtExact:true,sourceDeckSha256:sha(deckPath),wholeCurrentCard:row,exactNormalizedStockFingerprintPayload:payload})
 return next
})
const correctedPath=resolve(N,'M4.actual-inspected-cards.stock-normalized.successor.cards.review.jsonl')
writeFileSync(correctedPath,corrected.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
for(const line of readFileSync(correctedPath,'utf8').trim().split(/\r?\n/))JSON.parse(line)
assert.equal(sha(oldPath),oldSha);assert.equal(sha(firstPath),firstSha);assert.equal(sha(handoffPath),handoffSha)
const receipt={role:'Additive technical M4 fingerprint serialization successor, no new science or date reset',createdAt:new Date().toISOString(),reviewer:'/root/chemie_native9_fresh_independent_a_20261016',cause:'Original serializer fingerprinted raw card strings. Stock collectMemoryDeckEvidence first applies normalizeText to front/back/category and each tag, with empty tag-array fallback. Newlines in009/008 therefore produced technical mismatches.',originalM4:{path:oldPath.slice(R.length+1),sha256:oldSha},firstScience:{path:firstPath.slice(R.length+1),sha256:firstSha},originalHandoff:{path:handoffPath.slice(R.length+1),sha256:handoffSha},successor:{path:correctedPath.slice(R.length+1),sha256:sha(correctedPath)},stockModule:{path:'app/scripts/memoryCardReview.ts',sha256:sha(sourcePath),fragmentSha256:'sha256:'+createHash('sha256').update(fragment).digest('hex')},comparisonStockLedger:{path:stockPath.slice(R.length+1),sha256:sha(stockPath)},details,counts:{rows:4,fingerprintsCorrected:details.filter((r:any)=>r.fingerprintChanged).length,stockMatches:4,allNonFingerprintFieldsByteSemanticExact:true},normalWrites:false,HumanApproval:false,HumanTrial:false}
writeFileSync(resolve(N,'ADDENDUM.actual-stock-card-normalization-and-preserved-science.json'),JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({successor:receipt.successor,changed:receipt.counts.fingerprintsCorrected,stockMatches:4,allOriginalBytesRetained:true}))
