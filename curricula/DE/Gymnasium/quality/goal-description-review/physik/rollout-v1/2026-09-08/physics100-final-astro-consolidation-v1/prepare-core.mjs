import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

// Read-only preparation: output exact, bounded apply_patch hunks. No file writes.
export const base = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-final-astro-consolidation-v1'
export const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
export const landscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
export const parentH = 'f67550ac-df22-5a3e-8172-f04642efca64'
export const parentE = '5b8eaf71-96fe-50eb-b9ea-a8fa392df086'
export const successor = 'e2014db8-c97f-5ce1-82c5-2a42741f4a61'
export const existingExam = 'f61c424e-f091-5f9d-9d58-c1bd29733fc8'
export const newId = (shortKey) => {
  const h = createHash('sha1').update(`DE-GYM-CANONICAL-PHYSICS:${shortKey}`).digest('hex')
  return `${h.slice(0,8)}-${h.slice(8,12)}-5${h.slice(13,16)}-${((parseInt(h[16],16)&3)|8).toString(16)}${h.slice(17,20)}-${h.slice(20,32)}`
}
const proposal = readFileSync(`${base}/proposal.md`, 'utf8')
const sections = ['H1','H2','H3','E1','E2'].map((code) => {
  const section = proposal.split(`### ${code} – `)[1]?.split('\n\n')
  if (!section) throw Error(`Missing approved ${code}`)
  const [title,titleEn] = section[0].split(' / ')
  return { code, title, titleEn, description: section[1].replace(/^DE: /,''), descriptionEn: section[2].replace(/^EN: /,'') }
})
const suffixes = ['hrd_stellar_radius','hrd_spectroscopic_distance','main_sequence_lifetime_model','exoplanet_transit_evidence','exoplanet_stellar_radial_motion_evidence']
const prerequisites = [
  ['206fe51d-cc78-5422-b139-32cc97eb1c37','89124b92-5769-5e13-8a5d-78497936260f'],
  ['206fe51d-cc78-5422-b139-32cc97eb1c37','db6b8de4-21e0-58e8-a347-2ae39f538f92'],
  ['6f896466-e0ec-5f8d-82ad-2890433c82ba'],
  ['af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93'],
  ['af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93'],
]
export const children = sections.map(({code,...wording},i) => {
  const shortKey = `canonical_physics_astro_${suffixes[i]}`
  return {id:newId(shortKey),shortKey,...wording,type:'atomic',semanticAtomic:true,weight:1,
    tags:i===2?['GK','LK','canonical']:['GK','canonical'],contains:[],requires:prerequisites[i],
    dimensionTags:{framework:'canonical-gymnasium-physics',phase:'Q4',area:'Astrophysik',topicCode:shortKey.toUpperCase(),demandLevel:i<3?'AB3':'AB2',processCompetencies:i<3?['PK3_MATHEMATISIEREN','PK2_MODELLIEREN']:['PK2_MODELLIEREN','PK4_KOMMUNIZIEREN'],guidingIdeas:i===2?['LI_KOSMOS','LI_ENERGIE']:['LI_KOSMOS']},
    applicability:{jurisdiction:i===2?['DE-BY','DE-RP']:i<3?['DE-BY']:['DE-BW','DE-BY']},
    extendedData:{applicabilityMappingInheritance:'boundary'},resourceLinks:[]}
})
export const localIds = ['4c5c7cb1-f238-52c8-b82c-159c6c299c0e','db6b8de4-21e0-58e8-a347-2ae39f538f92','5e9cd796-3887-5457-8a1f-26863ca7eb28','6f896466-e0ec-5f8d-82ad-2890433c82ba']
export const localTexts = localIds.map(id => {
  const section = proposal.split(`\n\`${id}\`\n\n`)[1]?.split('\n\n')
  if (!section) throw Error(`Missing approved local ${id}`)
  return {id,description:section[0].replace(/^DE: /,''),descriptionEn:section[1].replace(/^EN: /,'')}
})
const taskSpecs = [
  {
    code:'H1',title:'Sternradien bei gleicher Leuchtkraft vergleichen',titleEn:'Compare stellar radii at equal luminosity',points:[2,2,2],
    taskContent:'## Material: Zwei didaktisch konstruierte HRD-Punkte\n\nEin HR-Diagramm liefert für Stern A die Werte L=16 L☉ und T=2 T☉, für Stern B L=16 L☉ und T=T☉. Die Größen L☉, T☉ und R☉ beziehen sich auf die Sonne. Verwenden Sie das thermische Strahlungsmodell L=4πR²σT⁴; σ ist für beide Sterne gleich. Die Daten dienen dem Modellvergleich und behaupten keine realen Sternmessungen.\n\n1. Begründen Sie aus dem Modell eine Beziehung zwischen R/R☉, L/L☉ und T/T☉. (2 BE)\n2. Schätzen Sie beide Radien in Sonnenradien ab. (2 BE)\n3. Prüfen Sie die Aussage „Bei gleicher Leuchtkraft müssen Sterne gleich groß sein“ und erklären Sie den Unterschied über Fläche und Strahlungsleistung pro Fläche. (2 BE)',
    taskContentEn:'## Material: Two HR-diagram points constructed for teaching\n\nAn HR diagram supplies L=16 L☉ and T=2 T☉ for star A, and L=16 L☉ and T=T☉ for star B. L☉, T☉ and R☉ refer to the Sun. Use the thermal-radiation model L=4πR²σT⁴; σ is identical for both stars. These data compare models and are not claimed to be real stellar measurements.\n\n1. Justify a relation between R/R☉, L/L☉ and T/T☉ from the model. (2 marks)\n2. Estimate both radii in solar radii. (2 marks)\n3. Assess “Stars of equal luminosity must be the same size” and explain the difference using area and emitted power per unit area. (2 marks)',
    solutionContent:'1. Durch Division durch die Sonnenbeziehung folgt L/L☉=(R/R☉)²(T/T☉)⁴, also R/R☉=√(L/L☉)/(T/T☉)². (2 BE)\n2. A: √16/2²=1 R☉; B: √16/1²=4 R☉. (je 1 BE)\n3. Die Behauptung ist falsch. Bei B kompensiert die größere strahlende Fläche die geringere Strahlungsleistung pro Fläche; Leuchtkraft allein legt den Radius nicht fest. (2 BE)',
    solutionContentEn:'1. Dividing by the solar relation gives L/L☉=(R/R☉)²(T/T☉)⁴, hence R/R☉=√(L/L☉)/(T/T☉)². (2)\n2. A: √16/2²=1 R☉; B: √16/1²=4 R☉. (1 each)\n3. The claim is false. B’s greater emitting area compensates for lower emitted power per unit area; luminosity alone does not fix radius. (2)',
    steps:['Dimensionslose Strahlungsbeziehung begründet. / Justifies the dimensionless radiation relation.','Beide Radien richtig. / Both radii correct.','Fläche und Leistung pro Fläche kausal verknüpft. / Causally links area and power per area.']
  },
  {
    code:'H2',title:'Eine HRD-Entfernung und ihre Annahmen prüfen',titleEn:'Check an HR-diagram distance and its assumptions',points:[2,2,2,2],
    taskContent:'## Material: Kalibrierte HRD-Klassen\n\nBei derselben Oberflächentemperatur enthält ein vereinfachtes kalibriertes HRD zwei mögliche Klassen: Hauptreihensterne mit L=1 L☉ und Riesen mit L=100 L☉. Eine unabhängige Spektralklassifikation ordnet Stern X der Hauptreihe zu. Sein beobachteter bolometrischer Fluss beträgt 1/100 des Flusses eines Referenzsterns mit L=1 L☉ in 10 pc Entfernung. Verwenden Sie F=L/(4πd²). Zunächst wird Absorption vernachlässigt. Alle Werte sind didaktisch konstruiert.\n\n1. Erklären Sie, welche Information die Leuchtkraft von X im HRD festlegt und warum Temperatur allein nicht genügt. (2 BE)\n2. Schätzen Sie die Entfernung von X ab. (2 BE)\n3. Wie änderte sich das Ergebnis bei einer irrtümlichen Zuordnung zur Riesenklasse? Begründen Sie quantitativ. (2 BE)\n4. In einer neuen Situation wird Sternlicht unterwegs zusätzlich absorbiert. Erläutern Sie die Richtung des Entfernungsfehlers, wenn diese Abschwächung unberücksichtigt bleibt. (2 BE)',
    taskContentEn:'## Material: Calibrated HR-diagram classes\n\nAt the same surface temperature, a simplified calibrated HR diagram contains two possible classes: main-sequence stars with L=1 L☉ and giants with L=100 L☉. Independent spectral classification identifies star X as a main-sequence star. Its observed bolometric flux is 1/100 that of a reference star with L=1 L☉ at 10 pc. Use F=L/(4πd²). Initially neglect absorption. All values are constructed for teaching.\n\n1. Explain which information fixes X’s luminosity in the HR diagram and why temperature alone is insufficient. (2 marks)\n2. Estimate X’s distance. (2 marks)\n3. How would an erroneous giant classification change the result? Justify quantitatively. (2 marks)\n4. In a fresh situation, starlight is additionally absorbed along the path. Explain the direction of the distance error if this attenuation is ignored. (2 marks)',
    solutionContent:'1. Die unabhängige Klassifikation wählt bei gegebener Temperatur den Hauptreihenbereich und damit die kalibrierte Leuchtkraft 1 L☉. Gleiche Temperatur lässt beide Klassen zu. (2 BE)\n2. Bei gleicher Leuchtkraft gilt d_X/10 pc=√100, also d_X=100 pc. (2 BE)\n3. Die angenommene hundertfache Leuchtkraft erfordert bei unverändertem Fluss die zehnfache Entfernung: 1000 pc. (2 BE)\n4. Absorption verringert F bei unveränderter tatsächlicher Entfernung. Wird sie allein geometrischer Verdünnung zugeschrieben, fällt die geschätzte Entfernung zu groß aus. (2 BE)',
    solutionContentEn:'1. Independent classification selects the main-sequence region at the supplied temperature, giving the calibrated luminosity 1 L☉; temperature alone permits either class. (2)\n2. Equal luminosity gives d_X/10 pc=√100, so d_X=100 pc. (2)\n3. Assuming a hundredfold luminosity at unchanged flux requires ten times the distance: 1000 pc. (2)\n4. Absorption reduces F without changing true distance. Attributing all attenuation to geometric dilution overestimates distance. (2)',
    steps:['Klassifikationsinformation von Temperatur getrennt. / Distinguishes classification information from temperature.','Entfernung 100 pc begründet. / Justifies the 100 pc distance.','Falsche Klasse ergibt 1000 pc. / Wrong class gives 1000 pc.','Absorption führt bei Ignorieren zur Überschätzung. / Ignoring absorption causes overestimation.']
  },
  {
    code:'H3',title:'Eine Hauptreihenzeit mit begrenztem Modell abschätzen',titleEn:'Estimate a main-sequence lifetime with a limited model',points:[2,2,2],
    taskContent:'## Material: Ein ausdrücklich begrenztes Sternmodell\n\nFür Hauptreihensterne von 0,8 bis 2 Sonnenmassen sei näherungsweise L/L☉=(M/M☉)⁴. Das während der Hauptreihenphase nutzbare Fusionsenergiebudget sei proportional zur Sternmasse; Zusammensetzung und nutzbarer Brennstoffanteil werden als vergleichbar angenommen. Die mittlere Leuchtkraft werde durch L angenähert. Als Referenz gilt t☉=10 Milliarden Jahre. Dies ist ein didaktisches Modell, kein universelles Sterngesetz.\n\n1. Erklären Sie, wie Energiebudget und Leuchtkraft die Hauptreihenzeit bestimmen, und vergleichen Sie für M=2 M☉ beide Größen mit der Sonne. (2 BE)\n2. Schätzen Sie die Hauptreihenzeit dieses Sterns ab. (2 BE)\n3. Prüfen Sie, ob das Modell ohne weitere Belege einen Roten Riesen oder einen Stern mit 20 M☉ beschreiben darf. Nennen Sie jeweils die verletzte Voraussetzung. (2 BE)',
    taskContentEn:'## Material: An explicitly limited stellar model\n\nFor main-sequence stars from 0.8 to 2 solar masses, assume approximately L/L☉=(M/M☉)⁴. Usable fusion energy during the main-sequence phase is proportional to stellar mass, assuming comparable composition and usable fuel fraction. Approximate average luminosity by L. Use t☉=10 billion years as reference. This is a teaching model, not a universal stellar law.\n\n1. Explain how energy budget and luminosity determine main-sequence lifetime and compare both quantities for M=2 M☉ with the Sun. (2 marks)\n2. Estimate this star’s main-sequence lifetime. (2 marks)\n3. Assess whether the model may describe a red giant or a 20-solar-mass star without further evidence. Identify the violated condition in each case. (2 marks)',
    solutionContent:'1. Zeit ist näherungsweise nutzbares Energiebudget geteilt durch mittlere Leistung. Der Stern hat im Modell das zweifache Energiebudget und die 2⁴=16-fache Leuchtkraft. (2 BE)\n2. t/t☉=2/16=1/8, also t=1,25 Milliarden Jahre. Mehr Brennstoff wird durch den erheblich schnelleren Verbrauch überkompensiert. (2 BE)\n3. Ein Roter Riese liegt außerhalb der Hauptreihenphase; 20 M☉ liegt außerhalb des angegebenen Massenbereichs. Weder das Potenzgesetz noch gleicher nutzbarer Brennstoffanteil dürfen dort unbelegt fortgeschrieben werden. (je 1 BE)',
    solutionContentEn:'1. Lifetime is approximately usable energy divided by average power. The model gives twice the energy budget and 2⁴=16 times the luminosity. (2)\n2. t/t☉=2/16=1/8, hence t=1.25 billion years. Faster consumption more than offsets the larger fuel supply. (2)\n3. A red giant is outside the main-sequence phase; 20 M☉ is outside the stated mass range. Neither the power law nor comparable usable fuel fraction may be extrapolated there without evidence. (1 each)',
    steps:['Energie/Leistung und Faktoren 2/16 erklärt. / Explains energy/power and factors 2/16.','1,25 Milliarden Jahre mit Deutung. / 1.25 billion years with interpretation.','Entwicklungsphase und Massenbereich getrennt begrenzt. / Separately limits evolutionary phase and mass range.']
  }
]
export const exams = taskSpecs.map((s,i)=>{
  const shortKey=`canonical_physics_astro_assessment_${s.code.toLowerCase()}_final_consolidation`
  return {id:newId(shortKey),shortKey,title:s.title,titleEn:s.titleEn,description:`Die lernende Person kann die bereitgestellte Aufgabe „${s.title}“ selbstständig bearbeiten und ihre Modellentscheidung anhand des Materials begründen.`,descriptionEn:`The learner can independently complete the supplied task “${s.titleEn}” and justify the model decision using the material.`,type:'atomic',weight:1,tags:i===2?['GK','LK','Practice','Assessment','canonical']:['GK','Practice','Assessment','canonical'],contains:[],requires:[children[i].id],dimensionTags:{framework:'canonical-gymnasium-physics',phase:'Q4',area:'Astrophysik',demandLevel:'AB3',guidingIdeas:['LI_KOSMOS'],processCompetencies:['PK2_MODELLIEREN','PK3_MATHEMATISIEREN']},extendedData:{applicabilityMappingInheritance:'boundary',applicabilityFromRequires:true},examData:{reviewStatus:'released',coveredGoalIds:[children[i].id],coveredStrands:['LI_KOSMOS'],demandLevels:['AB2','AB3'],sourceArtifactPath:`${base}/assessments/${s.code}.md`,taskContent:s.taskContent,taskContentEn:s.taskContentEn,solutionContent:s.solutionContent,solutionContentEn:s.solutionContentEn,scoring:{maxPoints:s.points.reduce((a,b)=>a+b),passingPoints:i===1?5:4,steps:s.steps.map((description,j)=>({id:`s${j+1}`,points:s.points[j],description}))}}}
})
export class Patches {
  patches=[]; working=new Map(); snapshots=[];
  text(path){if(!this.working.has(path))this.working.set(path,readFileSync(path,'utf8'));return this.working.get(path)}
  replace(path,before,after){if(before===after)return;const text=this.text(path);if(text.split(before).length!==2)throw Error(`Nonunique CAS fragment ${path}: ${before.slice(0,90)}`);const at=text.indexOf(before),start=text.lastIndexOf('\n',at-1)+1,end=text.indexOf('\n',at+before.length);const prefix=text.slice(start,at),suffix=text.slice(at+before.length,end<0?text.length:end);const b=prefix+before+suffix,a=prefix+after+suffix;this.patches.push(`*** Begin Patch\n*** Update File: ${path}\n@@\n${b.split('\n').map(l=>'-'+l).join('\n')}\n${a.split('\n').map(l=>'+'+l).join('\n')}\n*** End Patch`);this.working.set(path,text.replace(before,after))}
  object(path,before,afters){for(let n=0;n<=24;n+=2){const indent=' '.repeat(n),fmt=o=>JSON.stringify(o,null,2).split('\n').map(l=>indent+l).join('\n');const old=fmt(before);if(this.text(path).split(old).length===2){this.replace(path,old,afters.map(fmt).join(',\n'));return}}throw Error(`Object not found ${path} ${before.id||before.goalId||before.legacyGoalId||before.sourceGoalId}`)}
  add(path,text){if(existsSync(path)){if(readFileSync(path,'utf8')===text)return;throw Error(`Refusing overwrite ${path}`)}this.patches.push(`*** Begin Patch\n*** Add File: ${path}\n${text.trimEnd().split('\n').map(l=>'+'+l).join('\n')}\n*** End Patch`)}
  json(path){return JSON.parse(this.text(path))}
}
export function prepareCore(){
  const p=new Patches(),c=p.json(canonicalPath),byId=new Map(c.goals.map(g=>[g.id,g]));
  if(c.landscapeId!==landscapeId)throw Error('Wrong landscape')
  if(children.some(g=>byId.has(g.id)))throw Error('Core already present; use bindings/check, not repeat split')
  const beforeGoals=[];
  for(const id of [parentH,parentE,...localIds,successor,existingExam,'85bbad98-2f48-5d64-85c4-ab6cf67f24c2'])beforeGoals.push(structuredClone(byId.get(id)))
  for(const [parentId,kids,title,titleEn] of [[parentH,children.slice(0,3),'Sternradien, Entfernungen und Hauptreihenzeiten erschließen','Infer stellar radii, distances and main-sequence lifetimes'],[parentE,children.slice(3),'Exoplaneten-Nachweise erläutern','Explain exoplanet detection']]){
    const old=byId.get(parentId);if(old.type!=='atomic'||old.contains.length)throw Error('Parent state drifted')
    const next={...old,title,titleEn,type:'cluster',contains:kids.map(g=>g.id),requires:[],weight:kids.length,description:parentId===parentH?'Cluster für quantitative Sternradius-, Entfernungs- und Hauptreihenzeitmodelle.':'Cluster für die qualitative Deutung von Transit- und Sternradialbewegungssignalen bei Exoplanetenkandidaten.',descriptionEn:parentId===parentH?'Cluster for quantitative models of stellar radius, distance and main-sequence lifetime.':'Cluster for qualitatively interpreting transit and stellar radial-motion signals from exoplanet candidates.',applicability:{jurisdiction:parentId===parentH?['DE-BY','DE-RP']:['DE-BW','DE-BY']},extendedData:{...old.extendedData,applicabilityMappingInheritance:'boundary'}};delete next.semanticAtomic
    if(parentId===parentE)next.resourceLinks=old.resourceLinks.map(l=>({...l,title:`Visualisierung: ${title}`,description:'Übersicht über Transit- und Radialgeschwindigkeitsmethode.',altText:'Zweiverfahren-Übersicht: Ein Transit verringert das beobachtete Sternlicht; die periodische Bewegung des Sterns um den gemeinsamen Schwerpunkt verändert seine Spektrallinien.'}))
    p.object(canonicalPath,old,[next,...kids]);byId.set(parentId,next);kids.forEach(k=>byId.set(k.id,k))
  }
  for(const t of localTexts){const old=byId.get(t.id);const next={...old,description:t.description,descriptionEn:t.descriptionEn};p.object(canonicalPath,old,[next]);byId.set(t.id,next)}
  for(const id of [successor,existingExam]){const old=byId.get(id);if(old.requires.filter(v=>v===parentE).length!==1)throw Error('Successor boundary drift');const replace=list=>list.flatMap(v=>v===parentE?children.slice(3).map(g=>g.id):[v]);const next={...old,requires:replace(old.requires)};if(id===existingExam)next.examData={...old.examData,coveredGoalIds:replace(old.examData.coveredGoalIds)};p.object(canonicalPath,old,[next]);byId.set(id,next)}
  const qid='85bbad98-2f48-5d64-85c4-ab6cf67f24c2',old=byId.get(qid),next={...old,contains:[...old.contains,...exams.map(g=>g.id)]};p.object(canonicalPath,old,[next,...exams]);byId.set(qid,next);exams.forEach(g=>byId.set(g.id,g));
  for(const s of exams)p.add(s.examData.sourceArtifactPath,`# ${s.title}\n\n${s.examData.taskContent}\n\n## Lösung\n\n${s.examData.solutionContent}\n\n## English\n\n${s.examData.taskContentEn}\n\n## Solution\n\n${s.examData.solutionContentEn}\n\n## Scoring\n\n\`\`\`json\n${JSON.stringify(s.examData.scoring,null,2)}\n\`\`\`\n`)
  p.add(`${base}/core-before.json`,JSON.stringify({capturedAt:new Date().toISOString(),goals:beforeGoals},null,2)+'\n')
  p.add(`${base}/core-authoring.json`,JSON.stringify({authorship:'informed-ai-author-E1-G1-not-blind-not-human',authoredAt:new Date().toISOString(),children,assessments:exams,localTexts},null,2)+'\n')
  return p.patches
}
if(process.argv[1]?.endsWith('prepare-core.mjs'))console.log(JSON.stringify(prepareCore()))
