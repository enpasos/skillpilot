import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,dirname} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import vm from 'node:vm'
import ts from '../../../app/node_modules/typescript/lib/typescript.js'
const F=dirname(fileURLToPath(import.meta.url)),R=resolve(F,'../../..'),G=resolve(F,'../geometry-four-projection-reuse-integration-20261104-v1'),C=resolve(G,'check-host'),O=resolve(F,'reviewer-files')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',after=read(resolve(C,canonical)),before=read(resolve(R,canonical)),goals=new Map<string,any>(after.goals.map((x:any)=>[x.id,x])),oldGoals=new Map<string,any>(before.goals.map((x:any)=>[x.id,x]))
const judgments:Record<string,{A:string,M:string}>={
 '803d910d-96d1-5118-b9ca-29e93d0da76d':{
  A:'Eigenständiges Urteil zum ganzen endgültigen curricularischen Vertrag: Eine vorgegebene Parallelprojektion wird aus Richtung und Zielebene als Matrix konstruiert und als dieselbe Abbildung untersucht. Konkrete und allgemeine Herleitung, Projektionsidentität, Bild und Kern sind zusammenhängende Eigenschaften dieses Kompetenzkerns. Die neue exam-Ausführung ändert weder die fachliche Identität noch die curricularAtomic-Population; keine Aufspaltung erforderlich.',
  M:'Eigenständiges Urteil nach Lesen der ganzen finalen DE/EN-Form: Geprüft wird begründete Konstruktion und Untersuchung. Die allgemeine Matrixformel wird aus dem Schnitt hergeleitet; isolierter Formelabruf genügt ausdrücklich nicht. Vorhandene Matrix-/Geometriegrundlagen sind Vorbereitung. Für diesen Anwendungskern entsteht kein zusätzlicher eigenständiger Gedächtniskartenbedarf.'},
 'd3c42193-f1b7-5c6d-a991-bf034d99359f':{
  A:'Eigenständiges Urteil zum ganzen endgültigen Vertrag: Fixpunkte werden stets durch denselben Arbeitsgang Ax=x, homogenes LGS und vollständige Lösungsmenge bestimmt. Gerade, Ebene, Ursprung und ganzer Raum sind Ergebnisvarianten derselben räumlichen Kompetenz, keine vier unabhängigen Ziele. Die exam-Ausführung bleibt dieselbe curricularAtomic-Kompetenz.',
  M:'Die vollständige finale Form verlangt Aufstellen, Lösen und Deuten konkreter Systeme; die Fixpunktdefinition steht in der Aufgabe und wird angewandt. Einzelne Probepunkte ersetzen keine vollständige Menge. Ein zusätzlicher isolierter Abrufgegenstand neben den vorhandenen Grundlagen ist für diese Kompetenz nicht notwendig.'},
 '5748633c-113f-5ea8-9041-24da55919de7':{
  A:'Eigenständiges Urteil zum unveränderten ganzen ODER-Ziel mit korrigierter Vorbereitung: Koordinatenprojektion und geometrische/contextuelle Deutung bilden einen einheitlichen Abbildungskern. Punkte, Geraden, Flächen oder Objekte sind zulässige Gegenstandsvarianten; nicht alle müssen in jeder Prüfung gleichzeitig nachgewiesen werden. Das Ziel bleibt ordinary und curricularAtomic, seine universelle Raumkoordinatenbasis wird nicht mit der speziell breiten BY-Prüfungsform verwechselt.',
  M:'Koordinatenprojektion verlangt Darstellung, Anwendung und Deutung einer geometrischen Zuordnung. Die Regel zum Nullsetzen der senkrechten Koordinate kann aus der räumlichen Ansicht rekonstruiert werden; kein separater Gedächtnisgegenstand ist fachlich erforderlich. Die neue separate BY-Prüfung macht dieses gewöhnliche Ziel nicht zu einer Erinnerungspflicht.'},
 '7bb3c312-f714-55e6-a31f-f31605a93760':{
  A:'Eigenständiges Urteil nach vollständiger finaler Form: Normalenrichtung und Flächenbetrag sind die beiden ausdrücklich verbundenen Anwendungen desselben Vektorprodukts. Berechnung, geometrische Kontrolle, Betrag, Skalierung und Entartung prüfen diesen kohärenten Anwendungskern. Die gleiche curriculare Identität bleibt trotz exam-Ausführungsrolle atomar.',
  M:'Die finale Aufgabe verlangt nachvollziehbare Anwendung des Vektorprodukts, Orthogonalitätskontrolle und Interpretation seines Betrags als Fläche. Definition und Grundlagen sind bereits eigene Vorbereitung; ein neuer isolierter Abrufgegenstand dieses Anwendungsziels wäre keine zusätzliche sinnvolle Gedächtnispflicht.'}
}
const files:any[]=[],lanes:any[]=[]
for(const lane of ['semantic-atomicity','memory-card-review']){
 const configPath=`curricula/DE/Gymnasium/quality/${lane}/canonical-math-full.config.json`,config=read(resolve(C,configPath)),script='app/scripts/'+(lane==='semantic-atomicity'?'semanticAtomicityReview.ts':'memoryCardReview.ts'),end=lane==='semantic-atomicity'?'function isLeaf(':'function fingerprintMemoryCard(',source=readFileSync(resolve(C,script),'utf8')
 assert.equal(source,readFileSync(resolve(R,script),'utf8'))
 const selected=source.slice(source.indexOf('function normalizeText('),source.indexOf(end)),js=ts.transpileModule(selected+'\nthis.fn=fingerprintGoal;',{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText,ctx:any={createHash};vm.createContext(ctx);vm.runInContext(js,ctx)
 const oldLines=readFileSync(resolve(C,config.reviewPath),'utf8').trimEnd().split('\n'),seen=new Set<string>(),rows:any[]=[]
 assert.equal(oldLines.length,807)
 const next=oldLines.map(line=>{
  const row=JSON.parse(line);assert(!seen.has(row.goalId));seen.add(row.goalId)
  assert.equal(ctx.fn(goals.get(row.goalId),config.ruleVersion),row.fingerprint)
  if(!judgments[row.goalId]) return line
  const own:any={schemaVersion:1,reviewId:config.reviewId,landscapeId:config.landscapeId,goalId:row.goalId,ruleVersion:config.ruleVersion,fingerprint:ctx.fn(goals.get(row.goalId),config.ruleVersion),status:lane==='semantic-atomicity'?'atomic':'no_memory_needed',reviewedAt:'2026-11-04',reviewer:'independent-astra-ultra-final-contract-review /root/astra_statistics_pyramid_review',reason:lane==='semantic-atomicity'?judgments[row.goalId].A:judgments[row.goalId].M}
  if(lane==='semantic-atomicity'){own.semanticAtomic=true;own.suggestedSplit=[]}else own.memoryUseful=false
  rows.push({originalRegisteredCandidateRow:row,ownFinalRow:own,oldFingerprint:ctx.fn(oldGoals.get(row.goalId),config.ruleVersion),finalFingerprint:own.fingerprint})
  return JSON.stringify(own)
 })
 assert.equal(rows.length,4);assert(!seen.has('e3c70a12-7886-51f7-8bcd-ed54865415d6'));assert(!seen.has('dd1954f6-0941-55a9-88d2-e2980ed902fd'))
 const newPath=`curricula/DE/Gymnasium/quality/${lane}/canonical-math-full-geometry-four-projection-reuse-final-20261104.review.jsonl`,newConfig={...config,reviewPath:newPath}
 for(const[rel,body]of [[newPath,next.join('\n')+'\n'],[configPath,JSON.stringify(newConfig,null,2)+'\n']]){const p=resolve(O,rel);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,body);files.push({path:rel,beforeSha256:rel===configPath?sha(resolve(C,rel)):null,candidatePath:p,sha256:sha(p),layer:'genuine-independent-final-AM-quality-only'})}
 writeFileSync(resolve(F,`${lane}.genuine-final-four-rows.jsonl`),rows.map(x=>JSON.stringify(x.ownFinalRow)).join('\n')+'\n')
 lanes.push({lane,configPath,beforeReviewPath:config.reviewPath,afterReviewPath:newPath,rows:807,ownNewGenuineDecisions:4,other803RawLinesByteEqual:true,all807ActualFingerprintFunctionsVerified:true,fingerprintImplementation:{path:script,sha256:sha(resolve(C,script))},decisions:rows})
}
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(resolve(C,'app/scripts/goalBookModel.ts')).href)
const ledgerPath='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',oldLedger=read(resolve(R,ledgerPath)),ledger=read(resolve(C,ledgerPath)),oldKinds=new Map(oldLedger.decisions.map((x:any)=>[x.goalId,x.semanticKind]))
assert.equal(ledger.decisions.length,1278);assert.equal(ledger.decisions.filter((x:any)=>x.semanticKind==='curricularAtomic').length,807)
for(const row of ledger.decisions){assert.equal(fingerprintSemanticKindSourceGoal(goals.get(row.goalId)),row.sourceFingerprint);if(oldKinds.has(row.goalId))assert.equal(row.semanticKind,oldKinds.get(row.goalId))}
const report={status:'GENUINE_FINAL_CONTRACT_AM_DECISIONS_ONLY_NOT_STAGE_ACTIVATION',reviewer:'/root/astra_statistics_pyramid_review',canonicalSha256:sha(resolve(C,canonical)),ledgerSha256:sha(resolve(C,ledgerPath)),all1278SemanticFingerprintsVerified:true,all807CurricularIdentitiesAndKindsRetained:true,lanes,e3AndNewAssessment:{registered807Rows:0,replacement807RowsNeeded:0,e3WholeJudgment:'Eine kohärente Projektion mit konkreter Zerlegung und anschließendem Linearitäts-/Bild-/Kernargument. Kein separater Gedächtnisgegenstand. Eigene sachliche A/M-Beurteilung, aber als practiceAssessment außerhalb der807 Populationen keine erfundene registrierte Ersatzzeile.',newAssessmentWholeJudgment:'Die BY-Form prüft konkrete Koordinatenansichten und deren Interpretation; sie bleibt ein eigener practiceAssessment-Endpunkt und dupliziert nicht die curriculare Identität574. Kein zusätzlicher isolierter Gedächtnisgegenstand.'},files,rootWrites:false,original298FreezeUntouched:true,stageApproval:false}
writeFileSync(resolve(F,'genuine-final-am-review.json'),JSON.stringify(report,null,2)+'\n')
writeFileSync(resolve(F,'genuine-final-am-quality-manifest.json'),JSON.stringify({status:'ADDITIVE_REVIEWER_QUALITY_SUCCESSOR_NOT_PRODUCT_ACTIVATION',originalManifest:{path:resolve(G,'manifest.json'),sha256:sha(resolve(G,'manifest.json'))},files},null,2)+'\n')
console.log(JSON.stringify({status:report.status,ownDecisions:8,retainedPopulation:807,qualityFiles:files.length}))
