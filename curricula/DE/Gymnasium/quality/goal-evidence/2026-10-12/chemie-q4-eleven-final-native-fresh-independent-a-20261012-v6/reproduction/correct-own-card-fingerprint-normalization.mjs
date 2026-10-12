import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import {createHash} from 'node:crypto';
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q4-eleven-final-native-fresh-independent-a-20261012-v6';
const stable=x=>Array.isArray(x)?'['+x.map(stable).join(',')+']':x&&typeof x==='object'?'{'+Object.entries(x).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+stable(v)).join(',')+'}':JSON.stringify(x);
const normalize=x=>String(x??'').normalize('NFKC').replace(/\s+/g,' ').trim();
const deck=JSON.parse(readFileSync('app/public/data/de_gymnasium_chemistry_flashcards_energy_q4.de.json','utf8'));
const own=readFileSync(O+'/memory/five-cards.actual.jsonl','utf8').trimEnd().split('\n').map(l=>JSON.parse(l));
const before=structuredClone(own);
for(const row of own){const card=deck.cards.find(c=>c.id===row.cardId);row.fingerprint='sha256:'+createHash('sha256').update(stable({ruleVersion:row.ruleVersion,deckId:row.deckId,cardId:row.cardId,front:normalize(card.front),back:normalize(card.back),category:normalize(card.category),tags:card.tags.map(normalize).filter(Boolean)})).digest('hex');}
const by=new Map(own.map(x=>[x.deckId+'|'+x.cardId,x]));
const carrier=readFileSync(O+'/memory/cards75.technical-carrier-current70-exact-plus-own5.jsonl','utf8').trimEnd().split('\n');
writeFileSync(O+'/memory/five-cards.actual.jsonl',own.map(x=>JSON.stringify(x)).join('\n')+'\n');
writeFileSync(O+'/memory/cards75.technical-carrier-current70-exact-plus-own5.jsonl',carrier.map(l=>{const x=JSON.parse(l);return by.has(x.deckId+'|'+x.cardId)?JSON.stringify(by.get(x.deckId+'|'+x.cardId)):l}).join('\n')+'\n');
renameSync(O+'/checks/M402.technical-carrier.normal-validator.actual.txt',O+'/checks/M402.first-own-fingerprint-normalization-failed.actual.txt');
writeFileSync(O+'/checks/five-card-fingerprint-normalization-correction.actual.json',JSON.stringify({role:'Own pre-seal technical correction; no card content or scientific decisions changed',reason:'Normal memory-card validator normalizes NFKC and whitespace before fingerprinting front/back/category/tags; initial helper had hashed raw newline-bearing text.',before:before.map(x=>({cardId:x.cardId,fingerprint:x.fingerprint})),after:own.map(x=>({cardId:x.cardId,fingerprint:x.fingerprint})),outside70RowsExact:true,failedReceiptRetained:true},null,2)+'\n');
