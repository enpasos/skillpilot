import fs from 'node:fs'
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
const p='curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json'
const before=fs.readFileSync(p,'utf8'),q=JSON.parse(before)
const audit=JSON.parse(fs.readFileSync(new URL('./individual-image-review.json',import.meta.url),'utf8'))
for(const x of audit.records.filter(x=>x.decision==='keep')){const r=q.records.find(r=>r.goalId===x.goalId);if(!r)throw Error('Missing native QA row '+x.goalId);const hash='sha256:'+createHash('sha256').update(fs.readFileSync(x.path)).digest('hex');if(hash!==r.assetSha256)throw Error('Image digest mismatch '+x.goalId);Object.assign(r,{aiApproved:'yes',aiApprovedAssetSha256:hash,aiReviewedAt:'2026-09-08T04:51:41Z',aiReviewer:'codex-physics-b034-informed-implementation-a-20260908',aiNotes:x.reason+' Tatsächliche Originalsichtung vor Import; informierte AI-Fachprüfung, keine Human- oder D/P-Freigabe.'})}
const amp=q.records.find(r=>r.goalId==='af50bb9a-fd7b-50f5-9698-48c4efe99032')
amp.aiNotes+=' Erneute eigene Originalsichtung im B034-Audit 2026-09-08: aktive Emitterschaltung, Vorzeichen/Phasenumkehr und Versorgung als Energiequelle tragen auch die engere Beschreibung; vorhandenes Bild unverändert behalten.'
const next=JSON.stringify(q,null,2)+'\n',d=spawnSync('diff',['-u',p,'-'],{input:next,encoding:'utf8',maxBuffer:4000000})
if(d.status!==1)throw Error('Expected seven individual AI decisions')
console.log('*** Begin Patch\n*** Update File: '+p+'\n'+d.stdout.trimEnd().split('\n').slice(2).map(x=>/^@@ .* @@/u.test(x)?'@@':x).join('\n')+'\n*** End Patch')
