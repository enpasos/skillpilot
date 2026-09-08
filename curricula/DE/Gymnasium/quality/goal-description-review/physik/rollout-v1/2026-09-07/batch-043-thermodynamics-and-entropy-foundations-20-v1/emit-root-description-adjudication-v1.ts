import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {readFileSync,readdirSync,existsSync} from 'node:fs'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../../../app/scripts/goalBookModel'

// Explicit coordinator adjudication of the two sealed independent rounds.
// Only emits a leased patch; no D/P completion or human approval is created.
const base='curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-043-thermodynamics-and-entropy-foundations-20-v1/'
const read=(p:string)=>readFileSync(p,'utf8')
const sha=(s:string)=>'sha256:'+createHash('sha256').update(s).digest('hex')
const fmt=(v:any)=>JSON.stringify(v,null,2)+'\n'
const lines=(p:string)=>read(p).trimEnd().split('\n').map(JSON.parse)
const norm=(v:any)=>String(v??'').normalize('NFKC').replace(/\s+/g,' ').trim()
const stable=(v:any):string=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v)
const rounds=Object.fromEntries(['a','b'].map(r=>{const p=base+'round-'+r+'/results/';return [r,lines(p+readdirSync(p).find(f=>f.endsWith('.records.jsonl')))]}))
const specifications:[number,string,string,string][]=[
[0,'b','Eine erklärbare Temperaturbeziehung im klassischen idealen Gas: ungeordnete Translation, nicht beliebige innere Bewegungsformen.','Modellbeziehung erklären statt isolierten zusätzlichen Formelabruf verlangen.'],
[2,'b','Energieerhaltung als geschlossene Systembilanz und W als Arbeit am System; quantitative Prozessauswertung bleibt beim Nachfolger.','Die gelesene DE/EN-Karte physics_e_cov_060 bewahrt Kurzform und Arbeitskonvention; die Systembedingung wird ergänzt.'],
[3,'b','Isoliertes Ganzes und reversible Gleichheit versus irreversible Zunahme präzisieren dieselbe Entropieform des Hauptsatzes; geschlossen allein genügt nicht.','Die gelesene DE/EN-Karte physics_e_cov_090 behält den kompakten Hauptsatz mit expliziter isolierter Gesamtgrenze und Gleichheitsfall.'],
[4,'a','Quasistatisch ist nicht gleich reversibel: Abgrenzung anhand derselben Dissipationsbeispiele, ohne neue Entropieproduktionsrechnung.','Begriffsbeziehung und langsame Reibung als Gegenbeispiel sind zu erklären; keine zusätzliche Abrufkarte nötig.'],
[7,'b','J/K an reversibler Wärmeübertragung bei konstanter absoluter Temperatur deuten; beliebige Energie nicht mit Wärme verwechseln.','Einheit und Vergleich aus der Clausius-Beziehung erklären, keine zusätzliche harte Abrufmenge.'],
[8,'b','Reservoir und reversibler Phasenübergang wenden dieselbe konstanttemperierte Entropiebilanz an; Kelvin, Vorzeichen und L als Gesamtwärme in Joule machen sie eindeutig.','System- und Prozessbegründung der Bilanz statt neuer isolierter Kartenabruf.'],
[9,'b','Eine Zustandsänderung einer festen idealen Gasmenge berechnen und deuten; isotherme Formel und Modellbedingungen gehören zu derselben Auswertung.','Modellwahl, Größen- und Vorzeichendeutung erfordern keine weitere Karte neben den Grundlagen.'],
[10,'a','A fordert explizite Reservoirbedingungen, B hält den Kern für ausreichend. A präzisiert den bestehenden Q/T-Beleg mit konstanten Kelvin-Temperaturen und Th>Tc, ohne neue Kompetenz.','Vorzeichenbehaftete Teilbilanzen und ihre Summe müssen verstanden werden, kein neuer harter Abrufgegenstand.'],
[11,'a','Die Unmöglichkeitsfolgerung gilt zyklisch für ein Reservoir als einzige Wirkung. Nichtzyklische isotherme Expansion ist kein Gegenbeispiel; Temperatur und Wärmezeichen präzisieren das Umlaufintegral.','Einreservoir-Behauptung argumentativ widerlegen statt bloß die Ungleichung aufsagen; keine neue Karte.'],
[12,'b','Ein Teilsystem lässt sich zurückführen; ausgeschlossen ist vollständige Umkehr ohne bleibende Änderungen im Ganzen. Produktion und Umkehrgrenze bilden einen Erklärungsauftrag.','Produktionsmechanismus und Systemgrenze an Prozessen erklären, kein zusätzlicher Abrufkanon.'],
[14,'b','Annähernde Gleichverteilung bei großem N ersetzt die pauschale Aussage über exakt hälftige Belegung kleiner Modelle. Zählen und Entropievergleich bilden einen statistischen Begründungsgang.','Eigenes Zählen, Modellannahmen und Logarithmus tragen das Verständnis; keine weitere Karte.'],
[15,'a','Dimensionsloses Zustandszahlverhältnis bei festem N und T im klassischen idealen Gas präzisiert dieselbe Mikro-Makro-Herleitung.','Räumliche Möglichkeiten multiplizieren und logarithmieren ist herzuleiten, nicht als zweite Karte zu isolieren.'],
[17,'b','Isoliertes Gesamtsystem und thermodynamischer Zeitpfeil begrenzen dieselbe Prozessrichtungs-Erklärung, ohne Aussage zu beliebiger lokaler Entropie.','Die gelesene DE/EN-Karte physics_e_cov_061 behält den kompakten Zusammenhang, ergänzt um Gesamtgrenze und thermodynamischen Zeitpfeil.'],
[19,'b','Messdaten-Auswertung zyklischer Wärmekraftmaschinen zwischen passenden Reservoiren, nicht beliebiger Prozesse. Unsicherheit gehört zur Beurteilung des Grenzvergleichs.','Die gelesenen DE/EN-Karten physics_e_cov_082/083/084 bleiben als kompakter Wirkungsgrad-/Grenzformelabruf; Kelvin, Zyklus und gleiche Reservoirbedingungen werden ergänzt.'],
]
const paths={
c:'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
k:'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
a:'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
m:'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
cards:'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.cards.review.jsonl'}
const planned=new Map<string,{before:string,after:string}>()
const landscape=JSON.parse(read(paths.c)),kinds=JSON.parse(read(paths.k)),atomic=lines(paths.a),memory=lines(paths.m),cardLedger=lines(paths.cards)
const fp=(g:any,ruleVersion:string)=>sha(stable({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:norm(g.title),titleEn:norm(g.titleEn),description:norm(g.description),descriptionEn:norm(g.descriptionEn),phase:norm(g.dimensionTags?.phase),area:norm(g.dimensionTags?.area),topicCode:norm(g.dimensionTags?.topicCode),nodeKind:norm(g.nodeKind)}))
const changes:any[]=[]
for(const [i,r,atomicReason,memoryReason] of specifications){
const source=rounds[r][i],other=rounds[r==='a'?'b':'a'][i],g=landscape.goals.find((g:any)=>g.id===source.goalId)
assert.equal(source.goalId,other.goalId);assert.equal(source.decision,'revise')
for(const [f,rf] of [['title','currentTitleDe'],['titleEn','currentTitleEn'],['description','currentDescriptionDe'],['descriptionEn','currentDescriptionEn']])assert.equal(g[f],source[rf])
const before=structuredClone(g)
g.description=source.proposedDescriptionDe;g.descriptionEn=source.proposedDescriptionEn
for(const link of g.resourceLinks??[])if(link.type==='goal-visualization'&&link.lang==='de')link.altText='Didaktische Visualisierung zum Lernziel "'+g.title+'". '+g.description
const bindings:any[]=[]
for(const [records,path,reason] of [[atomic,paths.a,atomicReason],[memory,paths.m,memoryReason]] as any[]){
const row=records.find((r:any)=>r.goalId===g.id),old=structuredClone(row)
assert.equal(row.fingerprint,fp(before,row.ruleVersion))
if(path===paths.a){assert.equal(row.status,'atomic');assert.equal(row.semanticAtomic,true)}
row.fingerprint=fp(g,row.ruleVersion);row.reviewedAt='2026-09-07';row.reviewer='codex-root-b043-individual-adjudication-v1';row.reason=reason+' Individuelle AI-Prüfung; keine menschliche Abnahme oder D/P-Fertigmeldung.'
bindings.push({path,before:old,after:structuredClone(row)})}
const k=kinds.decisions.find((r:any)=>r.goalId===g.id),old=structuredClone(k)
assert.equal(k.semanticKind,'curricularAtomic');assert.equal(k.sourceFingerprint,fingerprintSemanticKindSourceGoal(before));k.sourceFingerprint=fingerprintSemanticKindSourceGoal(g)
bindings.push({path:paths.k,before:old,after:structuredClone(k)})
changes.push({goalId:g.id,before,after:structuredClone(g),selectedRound:r,sourceRecordId:source.recordId,otherRecordId:other.recordId,atomicReason,memoryReason,bindings})}
for(const [p,v] of [[paths.c,landscape],[paths.k,kinds]] as any[])planned.set(p,{before:read(p),after:fmt(v)})
for(const [p,v] of [[paths.a,atomic],[paths.m,memory]] as any[])planned.set(p,{before:read(p),after:v.map((r:any)=>JSON.stringify(r)).join('\n')+'\n'})
const cards:any={
physics_e_cov_060:{de:{back:'$\\Delta U=Q+W$\n\nFür ein geschlossenes System: $Q$ ist die zugeführte Wärme, $W$ die am System verrichtete Arbeit; beide mit Vorzeichen.'},en:{back:'$\\Delta U=Q+W$\n\nFor a closed system: $Q$ is heat supplied and $W$ is work done on the system; both are signed.'}},
physics_e_cov_090:{de:{back:'Für ein isoliertes Gesamtsystem:\n$\\Delta S_{\\mathrm{ges}} \\ge 0$\n\nreversibel: $\\Delta S_{\\mathrm{ges}}=0$\nirreversibel: $\\Delta S_{\\mathrm{ges}}>0$'},en:{back:'For an isolated total system:\n$\\Delta S_{\\mathrm{tot}} \\ge 0$\n\nreversible: $\\Delta S_{\\mathrm{tot}}=0$\nirreversible: $\\Delta S_{\\mathrm{tot}}>0$'}},
physics_e_cov_061:{de:{back:'Bei irreversiblen Vorgängen eines isolierten Gesamtsystems steigt die Gesamtentropie.\n\nDas kennzeichnet die bevorzugte makroskopische Ablaufrichtung: den thermodynamischen Zeitpfeil.'},en:{back:'In irreversible processes of an isolated total system, total entropy increases.\n\nThis identifies the preferred macroscopic direction: the thermodynamic arrow of time.'}},
physics_e_cov_082:{de:{front:'Wirkungsgrad einer zyklischen Wärmekraftmaschine',back:'$\\eta=\\frac{W_\\text{nutz}}{Q_\\text{zu}}$\n\nNutzarbeit und aufgenommene Wärme über denselben vollständigen Kreisprozess bilanzieren.'},en:{front:'Efficiency of a cyclic heat engine',back:'$\\eta=\\frac{W_\\text{useful}}{Q_\\text{in}}$\n\nAccount for useful work and absorbed heat over the same complete cycle.'}},
physics_e_cov_083:{de:{back:'$\\eta_C=1-\\frac{T_\\text{kalt}}{T_\\text{warm}}$\n\nReversible zyklische Wärmekraftmaschine zwischen zwei konstanten Reservoirtemperaturen; beide Temperaturen in Kelvin.'},en:{back:'$\\eta_C=1-\\frac{T_\\text{cold}}{T_\\text{hot}}$\n\nReversible cyclic heat engine between two constant reservoir temperatures; both temperatures in kelvin.'}},
physics_e_cov_084:{de:{back:'$\\eta \\le \\eta_C$\n\nVergleich zyklischer Wärmekraftmaschinen zwischen denselben heißen und kalten Reservoirtemperaturen. Irreversibilitäten senken den Wirkungsgrad; Messunsicherheiten getrennt prüfen.'},en:{back:'$\\eta \\le \\eta_C$\n\nCompare cyclic heat engines between the same hot and cold reservoir temperatures. Irreversibilities lower efficiency; check measurement uncertainties separately.'}},
}
const cardChanges:any[]=[]
for(const lang of ['de','en']){
const p='curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.'+lang+'.json',deck=JSON.parse(read(p))
for(const [id,spec] of Object.entries(cards) as any[]){
const card=deck.cards.find((c:any)=>c.id===id);assert.ok(card)
const before=structuredClone(card);Object.assign(card,spec[lang]);cardChanges.push({path:p,before,after:structuredClone(card)})
if(lang==='de'){
const row=cardLedger.find((r:any)=>r.cardId===id&&r.deckId===deck.deckId),old=structuredClone(row)
assert.equal(row.status,'kept');assert.equal(row.necessary,true)
row.fingerprint=sha(stable({ruleVersion:row.ruleVersion,deckId:deck.deckId,cardId:id,front:card.front,back:card.back,category:card.category,tags:card.tags}))
row.reviewedAt='2026-09-07';row.reviewer='codex-root-b043-memory-card-boundary-review-v1'
row.reason=changes.find(c=>row.originGoalIds.includes(c.goalId)).memoryReason+' Die konkrete DE/EN-Karte wurde vollständig gelesen und mit präzisierten Bedingungen erneut geprüft; IDs, Deck und Herkunft bleiben erhalten.'
cardChanges.push({path:paths.cards,before:old,after:structuredClone(row)})}}
planned.set(p,{before:read(p),after:fmt(deck)})}
planned.set(paths.cards,{before:read(paths.cards),after:cardLedger.map((r:any)=>JSON.stringify(r)).join('\n')+'\n'})
assert.equal(changes.length,14);assert.equal(cardChanges.length,18)
const receiptPath=base+'root-description-adjudication-v1.receipt.json';assert.ok(!existsSync(receiptPath))
const receipt={schemaVersion:1,status:'layer_a_adopted_current_followup_required',reviewedAt:new Date().toISOString(),reviewer:'/root',humanApprovalClaimed:false,changes,cardChanges,unchangedGoalIds:rounds.a.filter((_:any,i:number)=>!specifications.some(s=>s[0]===i)).map((r:any)=>r.goalId),files:[...planned].map(([path,pair])=>({path,beforeSha256:sha(pair.before),afterSha256:sha(pair.after)})),invariants:{oldReviewSealsUnchanged:true,noDOrPApproval:true,noImageBytesChanged:true,noGoalIdOrEdgeChanged:true,noMathChanged:true}}
const patch='*** Begin Patch\n'+[...planned].map(([p,pair])=>{
const d=execFileSync('python3',['-c','import json,sys,difflib\na,b=json.load(sys.stdin)\ns=list(difflib.unified_diff(a.splitlines(True),b.splitlines(True),n=3))[2:]\nsys.stdout.write("".join("@@\\n" if l.startswith("@@ ") else l for l in s))'],{input:JSON.stringify([pair.before,pair.after]),encoding:'utf8',maxBuffer:10*1024*1024})
return '*** Update File: '+p+'\n'+d}).join('')+'*** Add File: '+receiptPath+'\n'+fmt(receipt).trimEnd().split('\n').map(l=>'+'+l).join('\n')+'\n*** End Patch\n'
console.log(JSON.stringify({patch,summary:{goals:14,cards:6,files:planned.size}}))

