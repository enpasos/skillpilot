// Read-only emitter/verifier. No filesystem writes. Emit only once; install stdout with apply_patch.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {existsSync,readFileSync} from 'node:fs'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../../../app/scripts/goalBookModel'
const base='curricula/DE/Gymnasium/'
const output=base+'quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-039-two-description-adoption-v1/'
const helperPath=output+'emit-and-verify-two-description-adoption-v1.ts'
const receiptPath=output+'two-description-adoption-receipt-v1.json'
const sourcePath=base+'quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-039-function-combinations-equations-and-sequences-20-v1/round-a/results/mathematik-rollout-v1-batch-039-function-combinations-equations-and-sequences-20-v1-20260907-first-pass-a.batch-001.records.jsonl'
const paths=[base+'canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',base+'quality/semantic-atomicity/canonical-math-full.review.jsonl',base+'quality/memory-card-review/canonical-math-full.review.jsonl',base+'quality/release-model/mathematik.semantic-kinds.json']
const sha=(value:string|Buffer)=>'sha256:'+createHash('sha256').update(value).digest('hex')
const read=(path:string)=>readFileSync(path,'utf8')
const parseLines=(text:string)=>text.trimEnd().split('\n').map(line=>JSON.parse(line))
const norm=(v:unknown)=>String(v??'').normalize('NFKC').replace(/\s+/g,' ').trim()
const stable=(v:any):string=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>JSON.stringify(k)+':'+stable(x)).join(',')+'}':JSON.stringify(v)
// Native non-exported A/M semantic payload; independently checked by both production CLIs.
const fp=(g:any,ruleVersion:string)=>sha(stable({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:norm(g.title),titleEn:norm(g.titleEn),description:norm(g.description),descriptionEn:norm(g.descriptionEn),phase:norm(g.dimensionTags?.phase),area:norm(g.dimensionTags?.area),topicCode:norm(g.dimensionTags?.topicCode),nodeKind:norm(g.nodeKind)}))
const unique=(rows:any[],key:string,id:string)=>{const found=rows.filter(r=>r[key]===id);assert.equal(found.length,1,id);return found[0]}
const ids=['51e80e7b-df31-5d97-97f9-4c6e26eb7416','1b888f4c-df57-52a9-9551-b2b692e929fa']
const originals=paths.map(read)
const state={canonical:JSON.parse(originals[0]),atomic:parseLines(originals[1]),memory:parseLines(originals[2]),kinds:JSON.parse(originals[3])}
const serialize=(s:any)=>[JSON.stringify(s.canonical,null,2)+'\n',s.atomic.map((r:any)=>JSON.stringify(r)).join('\n')+'\n',s.memory.map((r:any)=>JSON.stringify(r)).join('\n')+'\n',JSON.stringify(s.kinds,null,2)+'\n']
assert.deepEqual(serialize(state),originals,'No unrelated formatting change')
const sourceText=read(sourcePath),sourceLines=sourceText.trimEnd().split('\n'),sourceRecords=sourceLines.map(line=>JSON.parse(line))
const compareScope=(after:any,before:any)=>{
 const reverted=structuredClone(after)
 reverted.description=before.description;reverted.descriptionEn=before.descriptionEn
 for(let i=0;i<reverted.resourceLinks.length;i++)reverted.resourceLinks[i].altText=before.resourceLinks[i].altText
 assert.deepEqual(reverted,before,'Only DE/EN description and primary-image altText may change')
}
const mathChecks=()=>{
 const multiply=(a:number[],b:number[])=>{const result=Array(a.length+b.length-1).fill(0);a.forEach((x,i)=>b.forEach((y,j)=>result[i+j]+=x*y));return result}
 assert.deepEqual(multiply(multiply([2,1],[-1,1]),[-3,1]),[6,-5,-2,1])
 for(const x of [-2,1,3])assert.equal(x**3-2*x*x-5*x+6,0)
 assert.equal((-1)**1,-1);assert.equal((-1)**2,1)
 assert.ok(Math.abs(2-10**-1-1.9)<1e-12);assert.ok(Math.abs(2-10**-2-1.99)<1e-12)
 assert.ok(Math.abs(2-10**-3-1.999)<1e-12);assert.equal(1/1,1);assert.equal(1/2,.5)
 assert.ok(Math.abs(1/3-.333)<.0005)
 // An exact shared finite prefix is compatible with different tails: a mathematical counterexample, not a numerical proof of limits.
 const u=(n:number)=>1/n,v=(n:number)=>n<=4?1/n:1
 for(let n=1;n<=4;n++)assert.equal(u(n),v(n))
 assert.notEqual(u(5),v(5))
 return {polynomialIdentityAndRoots:'PASS',displayedSequenceValues:'PASS',finitePrefixCounterexample:'PASS',conceptualReason:'For real x, x²+1 >= 1 prevents a real zero; 1/n tends to zero while an eventually constant-one continuation tends to one. These algebraic and tail arguments, not finite samples alone, support the corrections.'}
}
if(process.argv.includes('--verify')) {
 assert.ok(existsSync(receiptPath),'Receipt required')
 const receipt=JSON.parse(read(receiptPath))
 assert.equal(sha(read(sourcePath)),receipt.sourceArtifact.sha256)
 assert.deepEqual(receipt.changes.map((c:any)=>c.goalId),ids)
 const restored=structuredClone(state)
 for(const change of receipt.changes) {
  const g=unique(state.canonical.goals,'id',change.goalId),a=unique(state.atomic,'goalId',change.goalId),m=unique(state.memory,'goalId',change.goalId),k=unique(state.kinds.decisions,'goalId',change.goalId)
  assert.deepEqual(g,change.after);assert.deepEqual(a,change.bindingsAfter.atomicity);assert.deepEqual(m,change.bindingsAfter.memory);assert.deepEqual(k,change.bindingsAfter.semanticKind)
  compareScope(g,change.before)
  const r=unique(sourceRecords,'goalId',g.id)
  assert.equal(g.description,r.proposedDescriptionDe);assert.equal(g.descriptionEn,r.proposedDescriptionEn)
  assert.equal(a.fingerprint,fp(g,a.ruleVersion));assert.equal(m.fingerprint,fp(g,m.ruleVersion));assert.equal(k.sourceFingerprint,fingerprintSemanticKindSourceGoal(g))
  assert.equal(a.status,'atomic');assert.equal(m.status,'no_memory_needed');assert.equal(m.memoryUseful,false)
  for(const img of change.images) assert.equal(sha(readFileSync(img.path)),img.sha256,'unchanged image bytes')
  restored.canonical.goals[restored.canonical.goals.findIndex((x:any)=>x.id===g.id)]=change.before
  restored.atomic[restored.atomic.findIndex((x:any)=>x.goalId===g.id)]=change.bindingsBefore.atomicity
  restored.memory[restored.memory.findIndex((x:any)=>x.goalId===g.id)]=change.bindingsBefore.memory
  restored.kinds.decisions[restored.kinds.decisions.findIndex((x:any)=>x.goalId===g.id)]=change.bindingsBefore.semanticKind
 }
 const recovered=serialize(restored)
 for(let i=0;i<paths.length;i++){assert.equal(sha(originals[i]),receipt.fileDigests[i].afterSha256,'current output hash');assert.equal(sha(recovered[i]),receipt.fileDigests[i].beforeSha256,'exact original hash recovery')}
 console.log(JSON.stringify({checkedAt:new Date().toISOString(),status:'PASS',goals:ids,exactProposedDeEnMatches:2,unchangedTitlesIdsEdgesScopesMastery:true,exactOriginalFileHashesRecovered:4,unchangedImages:2,individualAtomicity:'2 atomic',individualMemory:'2 no_memory_needed',nativeKindFingerprints:'2 current',mathChecks:mathChecks(),canonicalSha256:sha(originals[0])},null,2))
} else {
 assert.equal(process.argv.length,2,'Only --verify is supported')
 assert.ok(!existsSync(receiptPath),'Completed adoption must not be replayed')
 const time=new Date().toISOString(),beforeState=structuredClone(state),changes:any[]=[]
 const judgments=[
 {altText:'Beispiel einer vollständig reell zerlegbaren Funktion: p(x) = x³ − 2x² − 5x + 6 = (x + 2)(x − 1)(x − 3), mit den reellen Nullstellen −2, 1 und 3 und einem qualitativen Graphen. Allgemein wird nur soweit möglich in reelle Linearfaktoren zerlegt.',
  atomicityReason:'Reelle Nullstellensuche, passende Faktorisierung und Ablesen der Nullstellen bearbeiten dieselbe zusammenhängende Bestimmungskompetenz. Die Existenzgrenze einer reellen Linearfaktorzerlegung wird ausdrücklich korrekt begrenzt; komplexe Nullstellen, ein neues Verfahren oder die benachbarte Vielfachheitsdeutung werden nicht hinzugefügt.',
  memoryReason:'Das Ziel verlangt Auswahl und Prüfung einer Faktorisierung am konkreten Polynom, einschließlich des möglichen Restfaktors ohne reelle Nullstelle. Dieser verstehensorientierte Zusammenhang rechtfertigt kein separates Fakten- oder Formeldeck; das Ablesen von Nullstellen wird in Aufgaben angewandt und begründet statt isoliert auswendig abgefragt.',
  kindReason:'Weiterhin genau ein fachlich prüfbares Inhaltsziel zur reellen Polynomnullstellenbestimmung; unverändertes Blatt ohne Orientierung, SRS oder Assessmentfunktion.',
  imageReason:'Selbst gesichtet: korrektes kubisches Polynom, äquivalente vollständige Faktorisierung und Nullstellen −2, 1, 3; der unskalierte Graph ist qualitativ passend. Das korrekte Einzelbeispiel behauptet keine Zerlegbarkeit aller reellen Polynome. Pixel unverändert behalten.',
  imageSha:'sha256:10b617f4fe662337b907cf4d5f118262cf8204a0ad1d480e897d3c4c08042efd'},
 {altText:'Drei Beispiele mit angegebenen Bildungsgesetzen, Tabellen und Punktdarstellungen: 2 − 10^(−n) nähert sich 2, (−1)^n oszilliert ohne Grenzwert, und 1/n ist eine Nullfolge. Endliche Tabellen oder Graphenausschnitte liefern zunächst Vermutungen; die Nullfolgenbegründung stützt sich auf das Bildungsgesetz.',
  atomicityReason:'Trendbeschreibung, Grenzwertvermutung und regelgestützte Deutung des Spezialfalls Nullfolge bilden eine zusammenhängende begriffliche Kompetenz zum Folgenverhalten. Die Präzisierung trennt endliche Darstellungsbefunde von Aussagen über die unendliche Fortsetzung; sie zieht keine formalen Grenzwertsätze oder vertieften Konvergenzbeweise aus den Nachfolgezielen vor.',
  memoryReason:'Eine kleine gelernte Liste konvergenter Folgen würde die geforderte Unterscheidung zwischen endlichen Daten und begründeter Fortsetzung nicht zeigen. Die Person soll Tabellen und Punktfolgen interpretieren sowie das konkrete Bildungsgesetz einer Nullfolge erklären; dafür entsteht kein eigenständiger kompakter Abrufbestand und kein Memorydeck.',
  kindReason:'Weiterhin fachliche Inhaltskompetenz zur Deutung von Folgen, weder Darstellungssammlung noch formales Beweisziel oder Prüfungsendpunkt; bestehende curricularAtomic-Klassifikation bleibt unverändert.',
  imageReason:'Selbst gesichtet: explizite Regeln 2−10^(−n), (−1)^n und 1/n begründen die gezeigten passenden Konvergenz-/Divergenzfälle. Tabellenwerte sind korrekt, 1/3 ist üblich auf 0,333 gerundet. Die Grafik wird nicht als Beweis allein aus endlich vielen Punkten interpretiert. Pixel unverändert behalten.',
  imageSha:'sha256:bd38636821efe2c1c37818f1b5f20dbb6ab4925aee09c754b0d2f497bc15ea8b'}
 ]
 for(const [i,id] of ids.entries()) {
  const g=unique(state.canonical.goals,'id',id),a=unique(state.atomic,'goalId',id),m=unique(state.memory,'goalId',id),k=unique(state.kinds.decisions,'goalId',id),r=unique(sourceRecords,'goalId',id),j=judgments[i]
  assert.equal(r.decision,'revise');assert.equal(g.title,r.currentTitleDe);assert.equal(g.titleEn,r.currentTitleEn)
  assert.equal(g.description,r.currentDescriptionDe);assert.equal(g.descriptionEn,r.currentDescriptionEn)
  assert.equal(a.status,'atomic');assert.equal(a.semanticAtomic,true);assert.equal(m.status,'no_memory_needed');assert.equal(m.memoryUseful,false)
  assert.equal(a.fingerprint,fp(g,a.ruleVersion));assert.equal(m.fingerprint,fp(g,m.ruleVersion));assert.equal(k.sourceFingerprint,fingerprintSemanticKindSourceGoal(g));assert.equal(k.semanticKind,'curricularAtomic')
  assert.equal(g.resourceLinks.length,1);assert.equal(g.resourceLinks[0].type,'goal-visualization');assert.equal(g.resourceLinks[0].role,'primary')
  const imagePath='app/public'+g.resourceLinks[0].url
  assert.equal(sha(readFileSync(imagePath)),j.imageSha)
  const before=structuredClone(g),bindingsBefore=structuredClone({atomicity:a,memory:m,semanticKind:k})
  g.description=r.proposedDescriptionDe;g.descriptionEn=r.proposedDescriptionEn;g.resourceLinks[0].altText=j.altText
  compareScope(g,before)
  for(const [row,previous,reason] of [[a,bindingsBefore.atomicity,j.atomicityReason],[m,bindingsBefore.memory,j.memoryReason]]) {
   row.fingerprint=fp(g,row.ruleVersion);row.reviewedAt=time.slice(0,10);row.reviewer='codex-math-b039-two-description-individual-review'
   row.reason='Erneute individuelle fachliche AI-Prüfung: '+reason+' Keine menschliche Einzelabnahme oder Lerner-Mastery behauptet.'
   const reverted={...row};for(const field of ['fingerprint','reviewedAt','reviewer','reason'])reverted[field]=previous[field]
   assert.deepEqual(reverted,previous,'Do not change A/M outcomes or unrelated fields')
  }
  k.sourceFingerprint=fingerprintSemanticKindSourceGoal(g)
  assert.deepEqual({...k,sourceFingerprint:bindingsBefore.semanticKind.sourceFingerprint},bindingsBefore.semanticKind)
  const sourceLine=sourceLines.find(line=>JSON.parse(line).goalId===id)!
  changes.push({goalId:id,changedCanonicalFields:['description','descriptionEn','resourceLinks[0].altText'],before,after:structuredClone(g),bindingsBefore,bindingsAfter:structuredClone({atomicity:a,memory:m,semanticKind:k}),sourceRoundARecordSha256:sha(sourceLine+'\n'),images:[{path:imagePath,sha256:j.imageSha,unchanged:true,inspection:j.imageReason}],individualReassessment:{atomicity:j.atomicityReason,memory:j.memoryReason,semanticKind:j.kindReason,reviewAuthority:'ai_candidate'}})
 }
 const reverted=structuredClone(state)
 for(const c of changes){reverted.canonical.goals[reverted.canonical.goals.findIndex((g:any)=>g.id===c.goalId)]=c.before;reverted.atomic[reverted.atomic.findIndex((g:any)=>g.goalId===c.goalId)]=c.bindingsBefore.atomicity;reverted.memory[reverted.memory.findIndex((g:any)=>g.goalId===c.goalId)]=c.bindingsBefore.memory;reverted.kinds.decisions[reverted.kinds.decisions.findIndex((g:any)=>g.goalId===c.goalId)]=c.bindingsBefore.semanticKind}
 assert.deepEqual(reverted,beforeState,'No other object may change')
 const outputs=serialize(state)
 const receipt={schemaVersion:1,artifactType:'math-b039-two-description-adoption-v1',recordedAt:time,author:{provider:'OpenAI',identity:'Codex',exactUnderlyingModel:'not exposed'},authority:{scopeDirection:'Root explicitly authorized exact Round-A proposed DE/EN descriptions, current image altText only and individual A/M/K rebinding for these two IDs.',reviewAuthority:'ai_candidate',humanApprovalClaimed:false,masteryClaimed:false},sourceArtifact:{path:sourcePath,sha256:sha(sourceText)},helperArtifact:{path:helperPath,sha256:sha(read(helperPath))},changes,fileDigests:paths.map((path,i)=>({path,beforeSha256:sha(originals[i]),afterSha256:sha(outputs[i])})),mathChecks:mathChecks(),preserved:'All titles, IDs, contains/requires, scopes, sourceRef, image pixels/URLs/provider metadata, A/M outcomes, semantic-kind classifications/authority and all other records unchanged. No Physics, QA, registry, claims, D/P, global M6, runtime or learner-state writes.',recovery:'Use --verify for read-only reconstruction of all four complete original byte hashes from the current files and stored before snapshots. Do not overwrite subsequent legitimate changes with a whole historical file.',nativeChecksRequired:['semanticAtomicityReview.ts --mode=check --config=...canonical-math-full.config.json','memoryCardReview.ts --mode=check --config=...canonical-math-full.config.json'],rootFollowup:'Native description/page/profile and QA bindings are intentionally stale; root owns fresh D/P, planned image imports, global quality and protected floors.'}
 let patch='*** Begin Patch\n'
 for(const [i,path] of paths.entries()){
  assert.equal(read(path),originals[i],'Concurrent drift')
  const before=originals[i].split('\n'),after=outputs[i].split('\n');assert.equal(before.length,after.length)
  const changed=before.flatMap((line,n)=>line===after[n]?[]:[n])
  assert.equal(changed.length,i===0?6:2,'Only authorized text/binding lines change')
  const ranges:Array<[number,number]>=[]
  for(const n of changed){const a=Math.max(0,n-2),b=Math.min(before.length-1,n+2);if(ranges.length&&a<=ranges.at(-1)![1]+1)ranges.at(-1)![1]=b;else ranges.push([a,b])}
  patch+='*** Update File: '+path+'\n'
  for(const [a,b] of ranges){patch+='@@\n';for(let n=a;n<=b;n++)patch+=before[n]===after[n]?' '+before[n]+'\n':'-'+before[n]+'\n+'+after[n]+'\n'}
 }
 patch+='*** Add File: '+receiptPath+'\n'+JSON.stringify(receipt,null,2).split('\n').map(line=>'+'+line).join('\n')+'\n*** End Patch\n'
 process.stdout.write(patch)
}
