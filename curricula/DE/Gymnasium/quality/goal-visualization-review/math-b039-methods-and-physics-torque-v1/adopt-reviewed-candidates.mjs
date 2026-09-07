import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { DEFAULT_LICENSE, DEFAULT_REVIEW_STATUS, createGoalVisualizationLink, extractPromptText } from '../../../../../../scripts/goal_visualization_common.mjs'

// Scoped, one-shot four-image adoption. Only the unchanged native importer writes
// image/prompt/canonical bytes. Authored snapshots/QA/receipt are emitted for apply_patch.
// No generation, deferral, registry, claims, semantic-ledger or global-report writes.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../..')
process.chdir(root)
const base='curricula/DE/Gymnasium/'
const archive=base+'quality/goal-visualization-review/math-b039-methods-and-physics-torque-v1/'
const helperPath=archive+'adopt-reviewed-candidates.mjs'
const preparedPath=archive+'pre-import-state-v1.json'
const receiptPath=archive+'image-qa-adoption-receipt-v1.json'
const choices=[
  {
    "subject": "mathematik",
    "goalId": "70a21623-6c87-55ae-b534-ab45a3b9b1d2",
    "candidateNumber": 2,
    "digest": "sha256:1b42b1026aad9df8314b2db1f6a3403794efec5a26a963130fca8ef59f4eb06e",
    "altText": "Vergleichstabelle für Bisektion, Regula falsi und Newton am Beispiel f(x)=x²−2. Sie zeigt korrekte erste Intervalle und Näherungswerte, Voraussetzungen, Auswertungsaufwand und Grenzen von Geschwindigkeitsaussagen.",
    "rationaleDe": "Die Bisektionsintervalle und die Regula-falsi-Schritte 4/3 und 1,4 mit jeweils rechtem Rand 2 sind für x²−2 korrekt. Die Newton-Näherungen ab 1,5 stimmen. Voraussetzungen und Auswertungsaufwand sind differenziert; wenige Beispielschritte werden ausdrücklich nicht als allgemeine Überlegenheit ausgegeben. Die letzten zwei Tabellenzeilen teilen Sätze ungeschickt, bleiben aber zusammenhängend lesbar.",
    "independentReviewFile": "independent-candidate-review-v1.json"
  },
  {
    "subject": "mathematik",
    "goalId": "12a8dffc-dea7-5f2c-b490-2a1a2bb6901b",
    "candidateNumber": 2,
    "digest": "sha256:70140ebae8e0d9f26062c4906083b9f7ff1fb6df6b04d8753999cd3ddbf43999",
    "altText": "Arithmetische und geometrische Reihen nebeneinander: fünf wachsende Stapel a₁ bis a₅ sowie kleiner werdende Summanden, die jeweiligen Partialsummenformeln und der geometrische Grenzwert für |q|<1. Die arithmetische Divergenz ist auf das gezeichnete positive Beispiel bezogen.",
    "rationaleDe": "Die fünf unterschiedlichen Stapelhöhen tragen nun exakt a₁ bis a₅. Die arithmetische Summenformel sowie die geometrische Formel unter q≠1 und der Grenzwert unter |q|<1 sind korrekt. Die Divergenzbehauptung links ist auf das gezeichnete positive arithmetische Beispiel begrenzt; Kugeln und Sammelbehälter sind qualitative Illustrationen.",
    "independentReviewFile": "independent-candidate-review-v1.json"
  },
  {
    "subject": "mathematik",
    "goalId": "c61af0a9-7d56-5505-a70d-ee097c3b747f",
    "candidateNumber": 1,
    "digest": "sha256:f008b1e9fd215ddf561b61aef4004c88aa44c21a2110c4216fccf93b183b185b",
    "altText": "Dreiteilige Übersicht zu Folgen: 2+1/n nähert sich mit 3, 2,5, 2⅓ und 2,25 dem Wert 2; (−1)ⁿ wechselt zwischen −1 und 1. Daneben stehen Summen-, Produkt- und Quotientengrenzwertsätze mit Existenz- und Nennerbedingung sowie verbale und symbolische Argumentationsschritte.",
    "rationaleDe": "Das dritte Glied von 2+1/n lautet im Bild nun korrekt 2⅓. Die oszillierende Folge (−1)ⁿ, das Beispielgrenzwert-Ergebnis 2 und die drei Grenzwertsätze einschließlich bestehender Teilgrenzwerte und B≠0 sind konsistent. Verbale und symbolische Begründung werden getrennt gezeigt.",
    "independentReviewFile": "independent-candidate-review-v2.json"
  },
  {
    "subject": "physik",
    "goalId": "c2c3cdc5-3e87-47c4-89fd-4eb2c5c2f2ea",
    "candidateNumber": 4,
    "digest": "sha256:c9a319582ef2d990e9db2322e2dadff5802a33393660627c40821a38c7047cd1",
    "altText": "Mittleres resultierendes Drehmoment M̄_res=I·ᾱ bei fester Achse und konstantem Trägheitsmoment. Drei ausdrücklich zeitlich konstante Winkelbeschleunigungen +3, 0 und −3 rad/s² ergeben für I=2 kg·m² die Momente +6, 0 und −6 N·m; bei zunächst positiver Drehung bedeuten sie Beschleunigen, gleichförmiges Drehen und Bremsen bis zum Stillstand. Ein Mittelwert null allein bedeutet allgemein keine gleichförmige Drehung.",
    "rationaleDe": "Die drei Beispiele geben jetzt α(t) ausdrücklich als zeitlich konstant vor. Damit tragen +3, 0 und −3 rad/s² bei konstantem I=2 kg·m² korrekt +6, 0 und −6 N·m; der Gleichförmigkeitsschluss ist durch α(t)=0 zu jedem Zeitpunkt gedeckt. Das Bremsen bezieht sich auf die zunächst positive Drehung bis zum Stillstand. Der Fußsatz grenzt den allgemeinen Mittelwert null ausdrücklich von gleichförmiger Bewegung ab.",
    "independentReviewFile": "independent-candidate-review-v2.json"
  }
]
const ids=choices.map(c=>c.goalId)
assert.equal(new Set(ids).size,4)
const read=p=>fs.readFileSync(p)
const json=p=>JSON.parse(read(p))
const encode=o=>JSON.stringify(o,null,2)+'\n'
const sha=b=>'sha256:'+createHash('sha256').update(b).digest('hex')
const normalize=x=>String(x??'').replace(/\s+/g,' ').trim()
const one=(rows,key,id)=>{const found=rows.filter(x=>x[key]===id);assert.equal(found.length,1,id);return found[0]}
const primary=g=>(g.resourceLinks??[]).filter(l=>l.type==='goal-visualization'&&l.role==='primary'&&(l.lang??'de')==='de')
const paths=c=>{
 const url='/assets/goal-visualizations/'+c.subject+'/'+c.goalId+'/'+c.goalId+'.jpg'
 return {url,assets:[base+'visualizations/'+c.subject+'/'+c.goalId+'/'+c.goalId+'.jpg','app/public'+url,'backend/src/main/resources/static'+url],
 promptPath:base+'visualizations/'+c.subject+'/'+c.goalId+'/prompt.de.md',
 reconstructionPromptPath:base+'visualizations/'+c.subject+'/'+c.goalId+'/image-reconstruction-prompt.de.md'}
}
const subjects=['mathematik','physik'].map(subject=>({subject,
 canonicalPath:base+'canonical/DE_DEU_S_GYM_CANONICAL_'+(subject==='mathematik'?'MATHEMATIK':'PHYSIK')+'.de.json',
 qaPath:base+'quality/goal-visualization-qa/'+subject+'.qa.json',
 ids:choices.filter(c=>c.subject===subject).map(c=>c.goalId)}))
const subjectFor=c=>one(subjects,'subject',c.subject)
const protectedCanonical=(obj,subject)=>{
 const copy=structuredClone(obj)
 for(const id of subject.ids)delete one(copy.goals,'id',id).resourceLinks
 return sha(encode(copy))
}
const protectedQa=(q,subject)=>sha(encode({...q,records:q.records.filter(r=>!subject.ids.includes(r.goalId))}))
const humanNotTransferred=row=>{
 assert.equal(row.humanApproved,'no')
 assert.equal(row.humanIssueIdentified,'no')
 assert.equal(row.humanIssueDescription,'')
 assert.equal(row.humanReviewedAt,null)
 assert.equal(row.humanReviewer,'')
}
const candidates=choices.map(c=>{
 const receiptPath=archive+c.goalId+'/candidate-'+c.candidateNumber+'/archive-receipt.json'
 const receipt=json(receiptPath)
 assert.equal(receipt.goalId,c.goalId);assert.equal(receipt.candidateNumber,c.candidateNumber)
 for(const f of [...receipt.originalFiles,...receipt.candidateFiles]){
  const bytes=read(f.path);assert.equal(bytes.length,f.bytes);assert.equal(sha(bytes),f.sha256,f.path)
 }
 const exact=suffix=>{const rows=receipt.candidateFiles.filter(f=>f.path.endsWith(suffix));assert.equal(rows.length,1);return rows[0].path}
 const candidatePath=exact('.jpg')
 assert.equal(sha(read(candidatePath)),c.digest)
 return {...c,provider:receipt.provider,candidatePath,promptPath:exact('/nano-banana-prompt.de.md'),
 reconstructionPromptPath:exact('.image-reconstruction-prompt.de.md'),
 archiveReceipt:{path:receiptPath,sha256:sha(read(receiptPath))},
 originalFiles:receipt.originalFiles}
})
const fileState=p=>fs.existsSync(p)?{path:p,exists:true,bytes:read(p).length,sha256:sha(read(p))}:{path:p,exists:false,bytes:0,sha256:null}
const emit=patch=>process.stdout.write('*** Begin Patch\n'+patch+'*** End Patch\n')
const addPatch=(p,obj)=>'*** Add File: '+p+'\n'+encode(obj).trimEnd().split('\n').map(l=>'+'+l).join('\n')+'\n'
const qaPatch=(p,oldText,before,after)=>{
 let out=''
 for(let i=0;i<before.length;i++){
  if(JSON.stringify(before[i])===JSON.stringify(after[i]))continue
  assert.ok(ids.includes(before[i].goalId),'Out-of-scope QA mutation')
  const render=row=>JSON.stringify(row,null,2).split('\n').map(l=>'    '+l).join('\n')+(i<before.length-1?',':'')
  const a=render(before[i]),b=render(after[i]);assert.equal(oldText.split(a).length,2)
  out+='@@\n'+a.split('\n').map(l=>'-'+l).join('\n')+'\n'+b.split('\n').map(l=>'+'+l).join('\n')+'\n'
 }
 return out?'*** Update File: '+p+'\n'+out:''
}
const checkProtected=(state,includeQa)=>{
 for(const s of subjects){
  const old=one(state.subjects,'subject',s.subject),c=json(s.canonicalPath),q=json(s.qaPath)
  assert.equal(protectedCanonical(c,s),old.protectedCanonicalSha256,'Non-resource canonical field changed: '+s.subject)
  if(includeQa)assert.equal(protectedQa(q,s),old.protectedQaSha256,'Other QA record or QA metadata changed: '+s.subject)
  assert.deepEqual(q.records.map(r=>r.goalId),old.qaOrder)
 }
}
const independent=c=>{
 const p=archive+c.independentReviewFile,r=json(p)
 const hit=r.reviews.filter(x=>x.goalId===c.goalId&&('sha256:'+x.sha256.replace(/^sha256:/,''))===c.digest)
 assert.equal(hit.length,1,'No exact independent review for '+c.goalId)
 assert.equal(hit[0].decision,'accept');assert.ok(hit[0].viewed===true||hit[0].actualVisualInspection?.tool==='view_image');assert.equal(hit[0].humanApproval,false)
 return {path:p,sha256:sha(read(p)),reviewId:r.reviewId,reviewer:r.reviewer,decision:hit[0].decision,imageSha256:c.digest}
}
const mode=process.argv[2]
if(mode==='prepare-patch'){
 assert.equal(fs.existsSync(preparedPath),false);assert.equal(fs.existsSync(receiptPath),false)
 const state={schemaVersion:1,artifactType:'four-image-pre-import-state-v1',preparedAt:new Date().toISOString(),
 authority:'Root explicitly authorized these four exact image digests after actual AI visual inspection.',
 humanApprovalClaimed:false,freezeCheck:'PASS skillpilot-coach-v1 1.0.0 IN_REVIEW before scoped Layer-A import',
 subjects:subjects.map(s=>{
  const c=json(s.canonicalPath),q=json(s.qaPath)
  return {...s,canonicalSha256:sha(read(s.canonicalPath)),qaSha256:sha(read(s.qaPath)),
   protectedCanonicalSha256:protectedCanonical(c,s),protectedQaSha256:protectedQa(q,s),
   qaOrder:q.records.map(r=>r.goalId)}
 }),
 snapshots:candidates.map(choice=>{
  const s=subjectFor(choice),goal=one(json(s.canonicalPath).goals,'id',choice.goalId),
        qa=one(json(s.qaPath).records,'goalId',choice.goalId),links=primary(goal),p=paths(choice)
  assert.equal(links.length,choice.subject==='physik'?0:1)
  const files=p.assets.map(fileState)
  if(links.length){
   assert.equal(links[0].url,p.url);assert.equal(links[0].lang,'de')
   for(const f of files){assert.equal(f.exists,true);assert.equal(f.sha256,qa.assetSha256)}
   const original=choice.originalFiles.filter(f=>f.path.endsWith('/'+choice.goalId+'.jpg'))
   assert.equal(original.length,1);assert.equal(original[0].sha256,qa.assetSha256)
  }else{
   assert.equal(qa.visualizationState,'missing')
   for(const f of files)assert.equal(f.exists,false,'New image would overwrite untracked asset')
  }
  return {goalId:choice.goalId,subject:choice.subject,goal,qa,files,prompts:[fileState(p.promptPath),fileState(p.reconstructionPromptPath)]}
 })}
 emit(addPatch(preparedPath,state))
}else if(mode==='import'){
 const state=json(preparedPath);assert.equal(fs.existsSync(receiptPath),false)
 for(const s of subjects){
  const old=one(state.subjects,'subject',s.subject)
  assert.equal(sha(read(s.canonicalPath)),old.canonicalSha256,'Canonical changed since snapshot')
  assert.equal(sha(read(s.qaPath)),old.qaSha256,'QA changed since snapshot')
 }
 for(const choice of candidates){
  checkProtected(state,true)
  const old=one(state.snapshots,'goalId',choice.goalId),s=subjectFor(choice),oldLink=primary(old.goal)[0]
  for(const f of [...old.files,...old.prompts])assert.deepEqual(fileState(f.path),f)
  const c=json(s.canonicalPath),g=one(c.goals,'id',choice.goalId)
  assert.deepEqual(g,old.goal,'Target changed since snapshot')
  const opts={provider:choice.provider,description:oldLink?.description??'Visualisierung zum Lernziel: '+g.title+'.',
    altText:choice.altText,lang:'de',license:oldLink?.license??DEFAULT_LICENSE,
    reviewStatus:oldLink?.reviewStatus??DEFAULT_REVIEW_STATUS,publicUrl:paths(choice).url}
  const expected=structuredClone(c),eg=one(expected.goals,'id',choice.goalId)
  eg.resourceLinks=[createGoalVisualizationLink(eg,opts),...(eg.resourceLinks??[]).filter(l=>!(l.type==='goal-visualization'&&l.role==='primary'&&(l.lang??'de')==='de'))]
  // Deliberately synchronous: the importer rewrites a complete canonical file.
  execFileSync(process.execPath,['scripts/import_goal_visualization.mjs',choice.goalId,choice.candidatePath,
    '--landscape',s.canonicalPath,'--subject',choice.subject,'--provider',opts.provider,
    '--review-status',opts.reviewStatus,'--license',opts.license,'--description',opts.description,'--alt-text',opts.altText,
    '--prompt',choice.promptPath,'--reconstruction-prompt',choice.reconstructionPromptPath],{stdio:'inherit'})
  assert.deepEqual(json(s.canonicalPath),expected,'Importer changed fields beyond exact resourceLinks')
  for(const p of paths(choice).assets)assert.equal(sha(read(p)),choice.digest)
  checkProtected(state,true)
 }
 for(const s of subjects)assert.equal(sha(read(s.qaPath)),one(state.subjects,'subject',s.subject).qaSha256)
 process.stdout.write('PASS four sequential native imports; twelve image copies; all other canonical fields and QA unchanged.\n')
}else if(mode==='adoption-patch'){
 const state=json(preparedPath);assert.equal(fs.existsSync(receiptPath),false);checkProtected(state,true)
 const now=new Date().toISOString(),updated=[],selectedImages=[]
 for(const s of subjects){
  const q=json(s.qaPath),before=structuredClone(q),old=one(state.subjects,'subject',s.subject)
  assert.equal(sha(read(s.qaPath)),old.qaSha256)
  for(const choice of candidates.filter(c=>c.subject===s.subject)){
   const goal=one(json(s.canonicalPath).goals,'id',choice.goalId),row=one(q.records,'goalId',choice.goalId),
    link=primary(goal)[0],p=paths(choice),evidence=independent(choice)
   for(const f of p.assets)assert.equal(sha(read(f)),choice.digest)
   assert.equal(link.provider,choice.provider);assert.equal(link.altText,choice.altText)
   Object.assign(row,{title:normalize(goal.title),description:normalize(goal.description),
    visualizationState:'available',missingReason:'',imageUrl:p.url,publicAssetPath:p.assets[1],canonicalAssetPath:p.assets[0],
    assetSha256:choice.digest,umlautsCorrectChatGpt:'no',contentApprovedChatGpt:'no',
    chatGptReviewedAt:null,chatGptReviewer:'',chatGptNotes:'',
    humanApproved:'no',humanIssueIdentified:'no',humanIssueDescription:'',humanReviewedAt:null,humanReviewer:'',
    aiApproved:'yes',aiApprovedAssetSha256:choice.digest,aiReviewedAt:now,
    aiReviewer:'OpenAI Codex Root and math_b039_blind_b; exact underlying model unknown',
    aiNotes:choice.rationaleDe+' Root und math_b039_blind_b haben die exakt gebundenen Kandidaten tatsächlich visuell geprüft; math_b039_blind_a hat sie zusätzlich beim Import angezeigt. AI-Annahme der Bildbytes, keine menschliche Einzelabnahme oder Quellenfreigabe. Der Zeitstempel bezeichnet den neuen QA-Eintrag, nicht einen erfundenen Sichtungsbeginn. Alte menschliche und AI-Angaben bleiben nur im historischen Vorzustand.'})
   humanNotTransferred(row)
   const snapshot=one(state.snapshots,'goalId',choice.goalId)
   selectedImages.push({...choice,independentReview:evidence,oldResourceLinks:snapshot.goal.resourceLinks??[],
    newResourceLinks:goal.resourceLinks,oldQa:snapshot.qa,newQa:structuredClone(row),
    beforeAssetFiles:snapshot.files,afterAssetFiles:p.assets.map(fileState),
    canonicalPrompts:[fileState(p.promptPath),fileState(p.reconstructionPromptPath)]})
  }
  assert.equal(protectedQa(q,s),old.protectedQaSha256);assert.deepEqual(q.records.map(r=>r.goalId),old.qaOrder)
  updated.push({s,before,q})
 }
 const receipt={schemaVersion:1,artifactType:'math-b039-and-physics-torque-four-image-qa-adoption-v1',
  recordedAt:now,reviewAuthority:'ai_candidate',humanApprovalClaimed:false,sourceApprovalGranted:false,
  approvalBasis:'Root authorization after actual visual inspections; independent hash-bound v1/v2 accept records. No model-diversity claim.',
  timestampSemantics:'QA entry time is observed by the helper; no exact invocation or historical human inspection time is invented.',
  nativeImporter:{path:'scripts/import_goal_visualization.mjs',sha256:sha(read('scripts/import_goal_visualization.mjs'))},
  helper:{path:helperPath,sha256:sha(read(helperPath))},preImportState:{path:preparedPath,sha256:sha(read(preparedPath))},
  selectedImages,
  fileDigests:updated.flatMap(({s,q})=>[
   {path:s.canonicalPath,beforeSha256:one(state.subjects,'subject',s.subject).canonicalSha256,afterSha256:sha(read(s.canonicalPath))},
   {path:s.qaPath,beforeSha256:one(state.subjects,'subject',s.subject).qaSha256,afterSha256:sha(encode(q))}
  ]),
  boundaries:['Exactly four primary resourceLinks, twelve JPG copies and their eight canonical prompt files.',
   'Exactly four QA records; old human approval for 12a8dffc is retained only in the original archive and this before snapshot, never assigned to new bytes.',
   'All other canonical fields including DE/EN goal texts, requires, contains, metadata and every other QA record/order are unchanged.',
   'Existing licenses and reviewStatus retained; new physics image uses native pilot and default AI-generated, SkillPilot-curated license.',
   'No deferral, generation, D/P/A/M/K, registry, claims, global reports, deployment or runtime writes.'],
  recovery:'Original/candidate archives and pre-import state retain the exact prior resources and QA. This receipt is completed only when the explicit verify mode passes.'}
 emit(updated.map(({s,before,q})=>qaPatch(s.qaPath,read(s.qaPath).toString(),before.records,q.records)).join('')+addPatch(receiptPath,receipt))
}else if(mode==='verify'){
 const state=json(preparedPath),receipt=json(receiptPath);checkProtected(state,true)
 assert.equal(receipt.selectedImages.length,4)
 for(const f of receipt.fileDigests)assert.equal(sha(read(f.path)),f.afterSha256)
 for(const choice of candidates){
  const s=subjectFor(choice),goal=one(json(s.canonicalPath).goals,'id',choice.goalId),
   row=one(json(s.qaPath).records,'goalId',choice.goalId),saved=one(receipt.selectedImages,'goalId',choice.goalId),
   old=one(state.snapshots,'goalId',choice.goalId),oldLink=primary(old.goal)[0],link=primary(goal)[0],p=paths(choice)
  assert.deepEqual(row,saved.newQa);assert.deepEqual(goal.resourceLinks,saved.newResourceLinks)
  assert.deepEqual(independent(choice),saved.independentReview);humanNotTransferred(row)
  assert.equal(row.aiApproved,'yes');assert.equal(row.aiApprovedAssetSha256,choice.digest);assert.equal(row.assetSha256,choice.digest)
  assert.equal(link.license,oldLink?.license??DEFAULT_LICENSE);assert.equal(link.reviewStatus,oldLink?.reviewStatus??DEFAULT_REVIEW_STATUS)
  assert.equal(link.provider,choice.provider);assert.equal(link.altText,choice.altText)
  for(const f of p.assets)assert.equal(sha(read(f)),choice.digest)
  assert.equal(extractPromptText(read(p.promptPath).toString()),extractPromptText(read(choice.promptPath).toString()))
  assert.equal(extractPromptText(read(p.reconstructionPromptPath).toString()),extractPromptText(read(choice.reconstructionPromptPath).toString()))
  for(const f of [...saved.afterAssetFiles,...saved.canonicalPrompts])assert.deepEqual(fileState(f.path),f)
 }
 process.stdout.write(encode({status:'PASS',fourImportedHashTriples:candidates.map(c=>({goalId:c.goalId,sha256:c.digest,paths:paths(c).assets})),
 exactlyFourQaRecordsChanged:true,humanApprovalClaimed:false,oldHumanApprovalNotTransferred:true,
 allOtherCanonicalFieldsIncludingEnPreserved:true,receiptSha256:sha(read(receiptPath))}))
}else throw new Error('Use prepare-patch, import, adoption-patch, or verify')
