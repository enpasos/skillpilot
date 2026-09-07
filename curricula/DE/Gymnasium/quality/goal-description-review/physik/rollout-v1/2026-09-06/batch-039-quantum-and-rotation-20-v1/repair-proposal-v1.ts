// Read-only proposal builder. Writes are performed only by apply_patch.
import fs from 'node:fs'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import { fingerprintSemanticKindSourceGoal } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'

const base = 'curricula/DE/Gymnasium/'
const batch = `${base}quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-039-quantum-and-rotation-20-v1/`
const ids = {
  energy: '5a951a0b-fd6c-51a1-9ffb-2a34ed6d3931',
  moment: 'c2c3cdc5-3e87-47c4-89fd-4eb2c5c2f2ea',
  inertia: '642aebd7-66cd-5a50-b543-73c4b207525d',
  parent: '9743baad-9371-52b6-98ee-72bc6dc68701',
  local: '6d25344c-35d7-5853-925d-2bccbaf50630',
  lk: '879491c0-7153-570b-91f4-c61d9fe8a143',
  phase: '7f83e25c-38f7-5ac2-8f9c-ec54eeef1026',
  legacy: 'cecebbb6-2ad4-43c5-b9ce-4b80f5cd870c',
  torque: 'cf570e66-2ce2-5923-9033-c97d74119553',
}
const files = {
  canonical: `${base}canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`,
  legacy: `${base}mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_to_canonical_physics.json`,
  he: `${base}mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json`,
  rp: `${base}mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_source_extraction_to_canonical_physics.review.json`,
  kinds: `${base}quality/release-model/physik.semantic-kinds.json`,
  atomicity: `${base}quality/semantic-atomicity/canonical-physics-full.review.jsonl`,
  memory: `${base}quality/memory-card-review/canonical-physics-full.review.jsonl`,
  cards: `${base}quality/memory-card-review/canonical-physics-full.cards.review.jsonl`,
  deckDe: `${base}memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.de.json`,
  deckEn: `${base}memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.en.json`,
  atlas: 'app/scripts/config/goal-books/navigation/de-gym-physics-national-atlas.view.json',
}
const source = new Map(Object.values(files).map(path => [path, fs.readFileSync(path, 'utf8')]))
const json = (path: string) => JSON.parse(source.get(path)!)
const jsonl = (path: string) => source.get(path)!.trim().split('\n').map(line => JSON.parse(line))
const edits: Array<{path: string, before: string, after: string, reason: string}> = []
const sha = (s: string) => `sha256:${crypto.createHash('sha256').update(s).digest('hex')}`
const stable = (v: any): string => Array.isArray(v) ? `[${v.map(stable).join(',')}]` : v && typeof v === 'object' ? `{${Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,val])=>`${JSON.stringify(k)}:${stable(val)}`).join(',')}}` : JSON.stringify(v)
const norm = (s: any) => String(s ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const time = new Date().toISOString()
const reviewer = 'codex-physics-b039-energy-torque-split-2026-09-06'
function change(path: string, before: string, after: string, reason: string) {
  assert.notEqual(before, after, reason)
  assert.equal(source.get(path)!.split(before).length, 2, `${path}: unique precondition for ${reason}`)
  edits.push({path,before,after,reason})
}
function objectChange(path: string, before: any, after: any, reason: string, append?: any) {
  const encode = (v: any, indent: number) => JSON.stringify(v,null,2).split('\n').map(line=>' '.repeat(indent)+line).join('\n')
  const indents = Array.from({length: 24},(_,i)=>i*2).filter(n=>source.get(path)!.includes(encode(before,n)))
  assert.equal(indents.length,1, `${path}: unique indentation for ${reason}`)
  const n=indents[0]
  const fragment=encode(before,n)
  const start=source.get(path)!.indexOf(fragment)
  const suffix=source.get(path)![start+fragment.length]===','?',':''
  change(path, fragment+suffix, encode(after,n)+(append ? ',\n'+encode(append,n) : '')+suffix, reason)
}
const landscape=json(files.canonical)
const originalGoals=new Map(landscape.goals.map((g:any)=>[g.id,structuredClone(g)]))
const goal=(id:string)=>landscape.goals.find((g:any)=>g.id===id)
assert.equal(goal(ids.moment),undefined)
assert.deepEqual(goal(ids.energy).contains,[])
assert.deepEqual(goal(ids.energy).requires,[ids.inertia])
assert.match(goal(ids.energy).description,/sowie bei vorgegebener Winkelbeschleunigung/)
const energy=goal(ids.energy)
energy.title='Rotationsenergie bestimmen'
energy.titleEn='Determine Rotational Energy'
energy.description='Die lernende Person kann aus Trägheitsmoment und Winkelgeschwindigkeit die Rotationsenergie bestimmen.'
energy.descriptionEn='The learner can determine rotational energy from moment of inertia and angular velocity.'
const imageLink=energy.resourceLinks[0]
imageLink.title='Visualisierung: Rotationsenergie mit Momentvergleich'
imageLink.description='Das linke blaue Feld zeigt das Energieziel; das rechte Feld grenzt das eigenständige Beschleunigungsmoment davon ab.'
imageLink.altText='Links: Rotationsenergie E_rot = 1/2 I omega² mit Trägheitsmoment, Winkelgeschwindigkeit, Einheiten und einem Beispiel von 4,0 J. Rechts steht zum Vergleich das getrennte Beschleunigungsmoment-Ziel; es ist kein zusätzlicher Kompetenzanspruch dieses Energieziels.'
const moment=structuredClone(energy)
moment.id=ids.moment
moment.title='Mittleres Beschleunigungsmoment bestimmen'
moment.titleEn='Determine Mean Acceleration Torque'
moment.description='Die lernende Person kann bei konstantem Trägheitsmoment aus einer vorgegebenen mittleren Winkelbeschleunigung das mittlere resultierende Drehmoment bestimmen und seine beschleunigende oder bremsende Wirkung deuten.'
moment.descriptionEn='The learner can determine the mean net torque from a given mean angular acceleration for a constant moment of inertia and interpret its accelerating or braking effect.'
moment.dimensionTags.guidingIdeas=['LI_BEWEGUNG']
delete moment.resourceLinks
landscape.goals.splice(landscape.goals.indexOf(energy)+1,0,moment)
const parent=goal(ids.parent)
parent.contains.splice(parent.contains.indexOf(ids.energy)+1,0,ids.moment)
function addAfter(list:string[],after:string,id:string) { assert.ok(list.includes(after));assert.ok(!list.includes(id));list.splice(list.indexOf(after)+1,0,id) }
for(const field of ['requires','coveredGoalIds']) {
  const list=field==='requires'?goal(ids.lk).requires:goal(ids.lk).examData.coveredGoalIds
  addAfter(list,ids.energy,ids.moment)
}
const local=goal(ids.local)
for(const list of [local.requires,local.examData.coveredGoalIds]) { assert.ok(!list.includes(ids.energy));list.push(ids.energy,ids.moment) }
const material='**Material 3 (Technische Kreiselstabilisierung):**\n\n'
assert.ok(local.examData.taskContent.includes(material))
local.examData.taskContent=local.examData.taskContent.replace(material, material+'Vor der Stabilisierung wird der Rotor bei festgehaltener Achse hochgefahren. Sein Trägheitsmoment ist konstant: $I = 25\\,\\mathrm{kg\\,m^2}$. Die Winkelgeschwindigkeit steigt von $0$ auf $200\\,\\mathrm{rad/s}$ in $20\\,\\mathrm{s}$; die mittlere Winkelbeschleunigung beträgt $\\overline{\\alpha} = 10\\,\\mathrm{rad/s^2}$. Das resultierende Antriebsmoment wirkt entlang der Rotorachse.\n\nFür die anschließende Präzessionsbetrachtung bei erreichter Drehzahl gelten:\n\n')
local.examData.taskContent=local.examData.taskContent.replace('- Störmoment $\\tau = 1000\\,\\mathrm{N\\,m}$','- Störmoment $\\tau = 1000\\,\\mathrm{N\\,m}$, quer zum Drehimpuls')
local.examData.taskContent+='\n5. Bestimmen Sie das mittlere resultierende Antriebsmoment während des Hochlaufs aus Material 3. Begründen Sie, welches resultierende Drehmoment bei anschließend konstanter Winkelgeschwindigkeit und vernachlässigten Verlusten wirkt. Unterscheiden Sie die Wirkung des axialen Antriebsmoments von der des später quer zum Drehimpuls wirkenden Störmoments. (5 BE)'
local.examData.solutionContent+='\n\n5. Bei konstantem Trägheitsmoment gilt $\\overline{M}=I\\overline{\\alpha}=25\\cdot10=250\\,\\mathrm{N\\,m}$. (2 BE)\nBei anschließend konstanter Winkelgeschwindigkeit ist $\\alpha=0$, daher ist das resultierende Drehmoment null, obwohl der Drehimpuls groß ist. (2 BE)\nDas axiale Moment ändert den Betrag des Drehimpulses; das quer wirkende Störmoment ändert im vereinfachten Präzessionsmodell seine Richtung. (1 BE)'
local.examData.scoring.maxPoints=30
local.examData.scoring.passingPoints=18
local.examData.scoring.steps.push({id:'s5',points:5,description:'Mittleres Antriebsmoment, drehmomentfreier gleichförmiger Lauf und Abgrenzung zur Präzession korrekt begründet'})
addAfter(goal(ids.phase).requires,ids.energy,ids.moment)
// The generic phase task has no concrete moment evidence: do not add a coverage claim.
assert.ok(!goal(ids.phase).examData.coveredGoalIds.includes(ids.moment))
objectChange(files.canonical,originalGoals.get(ids.energy),energy,'retain old atom for its existing energy facet; scope the retained comparison image',moment)
for(const id of [ids.parent,ids.local,ids.lk,ids.phase]) objectChange(files.canonical,originalGoals.get(id),goal(id),`scoped structural/assessment delta ${id}`)

const legacy=json(files.legacy)
const oldLegacy=legacy.mappings.find((m:any)=>m.legacyGoalId===ids.legacy)
assert.equal(oldLegacy.canonicalGoalId,ids.energy);assert.equal(oldLegacy.matchType,'exact')
objectChange(files.legacy,oldLegacy,{...oldLegacy,matchType:'partial'},'combined legacy energy facet is partial, not exact',{...oldLegacy,canonicalGoalId:ids.moment,matchType:'partial'})
function sourceSplit(path:string,sourceId:string,rationale:string) {
  const doc=json(path)
  const mapping=doc.mappings.find((m:any)=>m.legacyGoalId===sourceId&&m.canonicalGoalId===ids.torque)
  assert.ok(mapping)
  objectChange(path,mapping,{...mapping,matchType:'partial'},`partial torque facets from ${sourceId}`,{...mapping,canonicalGoalId:ids.moment,matchType:'partial'})
  const decision=doc.decisions.find((d:any)=>d.sourceGoalId===sourceId)
  assert.deepEqual(decision.canonicalGoalIds,[ids.torque])
  objectChange(path,decision,{...decision,canonicalGoalIds:[ids.torque,ids.moment],rationale,reviewedAt:time,reviewer},`bounded source rationale ${sourceId}`)
}
sourceSplit(files.he,'he-phys-sekii-e-7-b01-a01-8ba122e4','B039: Amtlich geprüft: HE KC Physik 2024, E.7, S. 31, Drehmoment; Kontext Trägheitsmoment und mathematische Modellierung/quantitative Vorhersagen der E-Phase auf S. 29. Der Source-Aspekt wird auf Kraft-Hebelarm/Drehwirkung (cf570e66-2ce2-5923-9033-c97d74119553) und mittleres resultierendes Beschleunigungsmoment bei konstantem I (c2c3cdc5-3e87-47c4-89fd-4eb2c5c2f2ea) operationalisiert. M = I alpha steht nicht wörtlich im Spiegelstrich; beide Teilkanten sind partial, kein vollständiges 1:1-Abbild. E.7 ist nicht Teil der verpflichtenden E.1–E.3; GK_LK bewahrt die nicht LK-exklusive Einführungsphasen-Einordnung, keine Pflichtstoffbehauptung. Kein zusätzlicher Energieanspruch aus diesem Drehmomentaspekt.')
sourceSplit(files.rp,'rp-phys-sek2-ef-torque-lk','B039: Amtlich geprüft: RP Lehrplan Physik MSS, S. 54, Rotation starrer Körper, ausdrücklich Einführungsphase Leistungsfach/Wahlpflicht. Der breitere Drehmomentaspekt mit Trägheitsmoment und Translationsanalogien als Kontext trägt die begrenzten Teilansprüche Kraft-Hebelarm/Drehwirkung (cf570e66-2ce2-5923-9033-c97d74119553) und mittleres resultierendes Beschleunigungsmoment bei konstantem I (c2c3cdc5-3e87-47c4-89fd-4eb2c5c2f2ea). Die konkrete Formelanforderung ist eine Operationalisierung, keine wörtliche 1:1-Übernahme; beide Kanten partial. Diese Source-Zuordnung belegt nur LK, ausdrücklich keinen RP-GK-Anspruch.')
const rp=json(files.rp)
const energyDecision=rp.decisions.find((d:any)=>d.sourceGoalId==='rp-phys-sek2-ef-rotational-energy-lk')
objectChange(files.rp,energyDecision,{...energyDecision,rationale:'B039: Amtlich geprüft: RP Lehrplan Physik MSS, S. 54, Rotation starrer Körper, Einführungsphase Leistungsfach/Wahlpflicht. Der Rotationsenergieaspekt wird durch die qualitative I/E-Verbindung bei 642aebd7-66cd-5a50-b543-73c4b207525d und den bisherigen quantitativen Energieanteil bei der stabilen 5a951a0b-fd6c-51a1-9ffb-2a34ed6d3931 abgedeckt. Die breitere Originalstelle nennt keine identische Aufgabenformulierung; die beiden bestehenden Kanten bleiben partial. Kein Beschleunigungsmoment aus diesem Energie-Source und kein RP-GK-Beleg.',reviewedAt:time,reviewer},'keep RP energy source bound only to energy facets')

const atlasOld={kind:'goalEntry',goalId:ids.energy}
objectChange(files.atlas,atlasOld,atlasOld,'explicit new atomic atlas sibling',{kind:'goalEntry',goalId:ids.moment})
function goalFingerprint(g:any,ruleVersion:string) {
  return sha(stable({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:norm(g.title),titleEn:norm(g.titleEn),description:norm(g.description),descriptionEn:norm(g.descriptionEn),phase:norm(g.dimensionTags?.phase),area:norm(g.dimensionTags?.area),topicCode:norm(g.dimensionTags?.topicCode),nodeKind:norm(g.nodeKind)}))
}
const atomicOld=jsonl(files.atomicity).find((r:any)=>r.goalId===ids.energy)
const atom=(g:any,reason:string)=>({...atomicOld,goalId:g.id,fingerprint:goalFingerprint(g,atomicOld.ruleVersion),status:'atomic',semanticAtomic:true,reviewedAt:time,reviewer,reason,suggestedSplit:[]})
const atomicEnergy=atom(energy,'B039-Einzelprüfung: ein quantitativer Energiezustand wird aus I und omega bestimmt. Der eigenständige Beschleunigungsmoment-Anspruch ist vollständig an die neue Schwester-ID ausgelagert; Energie und Moment werden nicht mehr als ein Atom bewertet.')
const atomicMoment=atom(moment,'B039-Einzelprüfung: mittleres resultierendes Drehmoment bei konstantem I aus mittlerer alpha bestimmen und seine beschleunigende/bremsende Wirkung deuten sind Rechnung und physikalische Deutung derselben Rotationsdynamik-Beziehung. Kein zusätzlicher Energie-, Präzessions- oder Hebel-Gleichgewichtsanspruch.')
change(files.atomicity,JSON.stringify(atomicOld),JSON.stringify(atomicEnergy)+'\n'+JSON.stringify(atomicMoment),'two individual atomicity decisions')
const memoryOld=jsonl(files.memory).find((r:any)=>r.goalId===ids.energy)
const memory=(g:any,reason:string)=>({...memoryOld,goalId:g.id,fingerprint:goalFingerprint(g,memoryOld.ruleVersion),status:'memory_required',memoryUseful:true,reviewedAt:time,reviewer,reason})
const memEnergy=memory(energy,'B039-Einzelprüfung: der kompakte Recall-Anteil ist ausschließlich E_rot = 1/2 I omega² mit Bedeutung/Einheiten der Größen. Sichere Unterscheidung der quadratischen omega-Abhängigkeit von der Momentbeziehung rechtfertigt diesen engen Formelanker. Energieverständnis, Variation und Anwendung werden am gewöhnlichen Ziel geprüft, nicht aus Kartenleistung abgeleitet.')
const memMoment=memory(moment,'B039-Einzelprüfung: der enge notwendige Recall-Anteil ist mittleres M = I mal mittlere alpha für festes I sowie mittlere alpha = Delta omega/Delta t. Die Karte unterscheidet ihn ausdrücklich vom Energiezustand und nennt die Modellbedingung. Vorzeichen, resultierendes statt beliebiges Einzelmoment und begründete Anwendung bleiben eigenständige Aufgabenpraxis, keine SRS-Mastery des Inhaltsziels.')
change(files.memory,JSON.stringify(memoryOld),JSON.stringify(memEnergy)+'\n'+JSON.stringify(memMoment),'two individual bounded memory decisions')
let primaryCard:any
for(const [path,lang] of [[files.deckDe,'de'],[files.deckEn,'en']]) {
  const deck=json(path)
  const old=deck.cards.find((c:any)=>c.id==='physics_e_cov_089')
  const next=structuredClone(old)
  next.front=lang==='de'?'Rotationsenergie und Beschleunigungsmoment: Welche Formeln gehören zu welchem Fall?':'Rotational energy and acceleration torque: which formulas apply to each case?'
  next.back=lang==='de'?'Energiezustand: $E_\\text{rot}=\\frac12 I\\omega^2$.\n\nBei festgehaltener Drehachse und konstantem $I$: $\\overline{\\alpha}=\\frac{\\Delta\\omega}{\\Delta t}$ und $\\overline{M}=I\\overline{\\alpha}$ für das mittlere resultierende Drehmoment.\n\n$E_\\text{rot}$ in J; $M$ in N m.':'Energy state: $E_\\text{rot}=\\frac12 I\\omega^2$.\n\nFor a fixed rotation axis and constant $I$: $\\overline{\\alpha}=\\frac{\\Delta\\omega}{\\Delta t}$ and $\\overline{M}=I\\overline{\\alpha}$ for the mean net torque.\n\n$E_\\text{rot}$ in J; $M$ in N m.'
  next.tags.push(`goal:${ids.moment}`)
  objectChange(path,old,next,`scope existing compact formula contrast card in ${lang}`)
  if(lang==='de') primaryCard=next
}
const cardOld=jsonl(files.cards).find((r:any)=>r.cardId==='physics_e_cov_089')
const cardNext={...cardOld,fingerprint:sha(stable({ruleVersion:cardOld.ruleVersion,deckId:cardOld.deckId,cardId:primaryCard.id,front:norm(primaryCard.front),back:norm(primaryCard.back),category:norm(primaryCard.category),tags:primaryCard.tags.map(norm).filter(Boolean)})),originGoalIds:[ids.energy,ids.moment],reviewedAt:time,reviewer,reason:'B039-Einzelprüfung: derselbe schmale Drei-Formeln-Kontrast bleibt ohne neue Karte erhalten. E_rot = 1/2 I omega² gehört nur zum Energieziel; mittlere alpha und mittleres resultierendes M bei konstantem I gehören zum neuen Momentziel. Beide gewöhnlichen Ziele haben eigene memory_required-Entscheidungen. Das gemeinsame Merken ersetzt weder Energieverständnis noch begründete Rotationsdynamik und überträgt keine Inhalts-Mastery.'}
change(files.cards,JSON.stringify(cardOld),JSON.stringify(cardNext),'trace both true card origins and corrected mean-torque conditions')

const kinds=json(files.kinds)
const counts={...kinds.counts,curricularAtomic:kinds.counts.curricularAtomic+1,total:kinds.counts.total+1}
change(files.kinds,`    "curricularAtomic": ${kinds.counts.curricularAtomic},`,`    "curricularAtomic": ${counts.curricularAtomic},`,'one additional curricular atom')
change(files.kinds,`    "total": ${kinds.counts.total}`,`    "total": ${counts.total}`,'one additional goal in kind ledger total')
for(const id of [ids.energy,ids.parent,ids.local,ids.lk,ids.phase]) {
  const old=kinds.decisions.find((d:any)=>d.goalId===id)
  assert.ok(old)
  objectChange(files.kinds,old,{...old,sourceFingerprint:fingerprintSemanticKindSourceGoal(goal(id)),decisionBasis:id===ids.energy?'reviewed-current-post-split-curricular-atomic':id===ids.parent?'reviewed-current-post-split-curricular-area':'reviewed-current-post-split-practice-assessment'},`rebind only affected semantic-kind source ${id}`)
}
const kindPredecessor=kinds.decisions.filter((d:any)=>d.goalId<ids.moment).at(-1)
assert.ok(![ids.energy,ids.parent,ids.local,ids.lk,ids.phase].includes(kindPredecessor.goalId))
objectChange(files.kinds,kindPredecessor,kindPredecessor,'new mean-torque atom kind',{goalId:ids.moment,sourceFingerprint:fingerprintSemanticKindSourceGoal(moment),semanticKind:'curricularAtomic',decisionStatus:'authoritative',decisionBasis:'reviewed-current-post-split-curricular-atomic'})

assert.equal(25*200,5000);assert.equal(200/20,10);assert.equal(25*10,250);assert.equal(250*20,5000);assert.equal(25*0,0);assert.equal(1000/5000,0.2)
assert.equal(local.examData.scoring.steps.reduce((n:number,s:any)=>n+s.points,0),30)
assert.equal(local.examData.scoring.passingPoints/local.examData.scoring.maxPoints,0.6)
assert.equal(JSON.stringify(goal('b49e0f6b-df2a-5643-b3ce-a9dfdf25f3bc')),JSON.stringify(originalGoals.get('b49e0f6b-df2a-5643-b3ce-a9dfdf25f3bc')))
assert.ok(!JSON.stringify(moment).includes('splitFrom'))
const nextFiles=new Map(source)
for(const edit of edits) {const current=nextFiles.get(edit.path)!;assert.ok(current.includes(edit.before));nextFiles.set(edit.path,current.replace(edit.before,()=>edit.after))}
for(const [path,text] of nextFiles) {if(path.endsWith('.jsonl')) text.trim().split('\n').forEach(line=>JSON.parse(line));else JSON.parse(text)}
let patch='*** Begin Patch\n'
for(const path of new Set(edits.map(e=>e.path))) {
  patch+=`*** Update File: ${path}\n`
  for(const e of edits.filter(e=>e.path===path).sort((a,b)=>source.get(path)!.indexOf(a.before)-source.get(path)!.indexOf(b.before))) patch+='@@\n'+e.before.split('\n').map(l=>'-'+l).join('\n')+'\n'+e.after.split('\n').map(l=>'+'+l).join('\n')+'\n'
}
patch+='*** End Patch\n'
const receipt={schemaVersion:1,operation:'physics-b039-energy-torque-sibling-split',status:'prepared-for-apply_patch',preparedAt:time,author:'Codex',newMomentId:ids.moment,scope:'Layer A only; no runtime, learner state, registry, global review, QA, maturity or publication writes',identityPolicy:'old 5a atom retains only its already included energy facet; new moment atom has no inherited mastery; both legacy edges partial',legacyEffect:'Stored values remain; exact-only legacy projection may disappear, including energy uplift over a lower directly stored value.',phaseAssessmentPolicy:'7f requires the new moment facet to preserve its old combined prerequisite scope; coveredGoalIds does not falsely acquire concrete moment assessment evidence.',images:{energy:{decision:'retain existing pixels as energy-left / separate moment-right contrast',reason:'Fresh visual inspection: the clearly separated left blue panel independently supplies the energy formula, I/omega diagram, correct units and 4 J example. Resource text explicitly limits the current energy goal to that panel and identifies the right panel as another goal, not an additional energy competency.',sha256:'7d2995fb02681e48f73947378d5d7a5253180e492ab4da547b81e1c09b00720b'},moment:{decision:'deferred_no_reviewed_scope_specific_asset',resourceLinkAdded:false,reason:'No approved scoped asset exists for this new ID; no image generation and no invented provider-failure claim.'}},baselineAndExpectedHashes:[...new Set(edits.map(e=>e.path))].map(path=>({path,beforeSha256:sha(source.get(path)!),expectedAfterSha256:sha(nextFiles.get(path)!)})),recoverableExactEdits:edits,checks:{proposalJsonParse:'passed',numericAndScoringAssertions:8,b49ByteIdentity:'passed',newMomentSplitMasteryTriggerAbsent:'passed'},rootFollowup:['New precise D/P reviews and bindings','Global provenance/source-membership decisions if required by native scope checks','Global image QA inventory: new missing asset and retained-energy resource context','Full source/scope and M6 gates; do not lower protected floor']}
console.log(JSON.stringify({patch,receipt,receiptPath:batch+'repair-implementation-v1.receipt.json',changedFiles:[...new Set(edits.map(e=>e.path))]}))
