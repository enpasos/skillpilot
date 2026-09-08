import fs from 'node:fs'
import assert from 'node:assert/strict'
// Nonblind coordinator draft after D-round comparison. Native binding and a
// separate substantive counterreview are required before central registration.
const base='curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-043-thermodynamics-and-entropy-foundations-20-v1/'
const rounds=Object.fromEntries(['a','b'].map(r=>{const p=base+'round-'+r+'/results/';return[r,fs.readFileSync(p+fs.readdirSync(p).find(f=>f.endsWith('.records.jsonl')),'utf8').trim().split('\n').map(JSON.parse)]}))
// Each row: archetype, meaningful changed condition DE/EN, fresh first case DE/EN.
const cases=[
['concept','Teilchenmasse versus gemeinsame Temperatur; Einzelteilchen versus Mittelwert.','Particle mass versus common temperature; individual particles versus the mean.',
'Zwei klassische ideale Gase unterschiedlicher Teilchenmasse haben dieselbe Kelvin-Temperatur. Erkläre ohne Bildvorlage, welche Aussage über die mittlere kinetische Translationsenergie möglich ist und warum daraus weder gleiche Teilchengeschwindigkeiten noch identische Einzelenergien folgen.',
'Two classical ideal gases with different particle masses have the same temperature in kelvin. Without a supplied diagram, explain what can be said about their mean translational kinetic energy and why neither equal particle speeds nor identical individual energies follow.'],
['concept','Bloße mechanische Rückbewegung versus vollständige Rückführung von System und Umgebung.','Mere mechanical backward motion versus complete restoration of system and surroundings.',
'Ein Körper wird über eine raue Unterlage geschoben und an den Ausgangsort zurückgebracht. Erkläre selbstständig, ob damit auch der thermodynamische Ausgangszustand wiederhergestellt ist; vergleiche mit einem ideal reibungsfreien Grenzfall.',
'A body is pushed over a rough surface and returned to its starting position. Independently explain whether this also restores the initial thermodynamic state; compare with an ideal frictionless limiting case.'],
['concept','Wärmeübertragung versus Arbeit als Ursache derselben Änderung innerer Energie.','Heat transfer versus work as causes of the same change in internal energy.',
'Ein ruhender geschlossener Gasbehälter wird einmal geheizt und in einem zweiten Fall durch einen Kolben komprimiert. Zeichne eigene Energiepfeile, erläutere ΔU=Q+W und ordne positive und negative Übertragungen der Konvention Arbeit am Gas zu.',
'A stationary closed gas container is heated in one case and compressed by a piston in a second case. Draw your own energy arrows, explain ΔU=Q+W, and assign positive and negative transfers using work on the gas as the convention.'],
['concept','Isoliertes Ganzes versus entropieabgebendes Teilsystem; reversibel versus irreversibel.','Isolated whole versus an entropy-releasing subsystem; reversible versus irreversible.',
'Für ein nach außen isoliertes System werden zwei Prozessbilanzen vorgelegt: ΔS_ges=0 und ΔS_ges>0. Ordne beide dem reversiblen Grenzfall oder einem irreversiblen Vorgang zu und erkläre, warum eine negative Entropieänderung eines einzelnen Teils nicht genügt, den zweiten Hauptsatz zu widerlegen.',
'Two process balances are supplied for a system isolated from the outside: ΔS_tot=0 and ΔS_tot>0. Assign them to the reversible limit or an irreversible process and explain why a negative entropy change in one part alone does not refute the second law.'],
['concept','Geschwindigkeit des Ablaufs versus Reibung oder endliche treibende Temperaturdifferenz.','Process speed versus friction or a finite driving temperature difference.',
'Ein Kolben wird sehr langsam bewegt, besitzt aber Reibung. Beurteile getrennt Gleichgewichtsnähe und vollständige Umkehrbarkeit. Vergleiche mit einem ideal reibungsfreien Kolben unter infinitesimalen Druckunterschieden.',
'A piston moves very slowly but has friction. Assess near-equilibrium behavior and complete reversibility separately. Compare it with an ideal frictionless piston subject to infinitesimal pressure differences.'],
['concept','Gültige Energiebilanz versus spontan beobachtete Prozessrichtung.','Valid energy balance versus spontaneously observed process direction.',
'Zwei thermisch verbundene Körper sind zusammen nach außen isoliert. Entwirf für jede gedachte Wärmeübertragungsrichtung eigene Energiepfeile und erkläre, weshalb die Energieerhaltung allein die spontan beobachtete Richtung nicht auswählt.',
'Two thermally connected bodies are jointly isolated from the outside. Construct energy arrows for each imagined heat-transfer direction and explain why energy conservation alone does not select the spontaneously observed direction.'],
['concept','Gleiche Gleichgewichts-Endpunkte bei verschiedenen tatsächlichen Prozesswegen.','Identical equilibrium endpoints with different actual process paths.',
'Ein ideales Gas erreicht denselben Endzustand einmal durch freie Expansion und einmal über einen geeigneten reversiblen Vergleichsweg. Erläutere, welche Wärme in dS=δQ_rev/T eingesetzt wird und warum gleiche ΔS nicht gleiche tatsächliche Wärmeübertragung bedeuten.',
'An ideal gas reaches the same final state once by free expansion and once along a suitable reversible comparison path. Explain which heat enters dS=δQ_rev/T and why equal ΔS does not mean equal actual heat transfer.'],
['concept','Gleiche reversible Wärme bei verschiedenen konstanten absoluten Temperaturen.','Equal reversible heat at different constant absolute temperatures.',
'Je 60 J werden reversibel bei konstant 300 K beziehungsweise 600 K zugeführt. Deute die Einheit der Entropieänderung und begründe die unterschiedliche Zunahme aus der Clausius-Beziehung; erkläre, weshalb beliebige Arbeitszufuhr nicht einfach als Q eingesetzt werden darf.',
'60 J is supplied reversibly at constant temperatures of 300 K and 600 K. Interpret the unit of entropy change and justify the different increases using the Clausius relation; explain why arbitrary work input cannot simply be substituted for Q.'],
['procedure','Aufnahme versus Abgabe; Reservoirwärme versus reversible Phasenänderung.','Absorption versus release; reservoir heat versus reversible phase change.',
'Ein ideales Reservoir bei 300 K gibt 900 J Wärme ab. Eine getrennte Probe nimmt bei einem reversiblen Phasenübergang bei 250 K insgesamt L=1000 J auf. Lege beide Systemgrenzen fest, berechne ihre Entropieänderungen und erkläre Vorzeichen, Kelvin sowie den Unterschied zwischen L und einer massenspezifischen Wärmeangabe.',
'An ideal reservoir at 300 K releases 900 J of heat. A separate sample absorbs a total L=1000 J during a reversible phase transition at 250 K. Define both system boundaries, calculate their entropy changes, and explain signs, kelvin, and the distinction between L and a mass-specific heat quantity.'],
['procedure','Isotherme Expansion versus Kompression; feste versus veränderte Gasmenge.','Isothermal expansion versus compression; fixed versus changed amount of gas.',
'Eine feste Menge idealen Gases wird isotherm auf das doppelte Volumen gebracht und anschließend isotherm zurückkomprimiert. Wähle die passende Entropiebeziehung, bestimme die beiden Änderungen symbolisch und erläutere deren Vorzeichen und Summe.',
'A fixed amount of ideal gas is taken isothermally to twice its volume and then compressed isothermally back. Select the appropriate entropy relation, determine both changes symbolically, and explain their signs and sum.'],
['procedure','Vertauschte Systembezeichnung versus tatsächlich umgekehrte Wärmeflussrichtung.','Swapped system labels versus physically reversed heat-flow direction.',
'100 J fließen zwischen zwei sonst isolierten idealen Reservoiren von 400 K zu 300 K. Definiere die beiden Teilbilanzen, berechne ΔS_ges ohne vorzeitiges Runden und erkläre, weshalb die Energieänderungen sich aufheben, die Entropieänderungen aber nicht.',
'100 J flows between two otherwise isolated ideal reservoirs from 400 K to 300 K. Define the two component balances, calculate ΔS_tot without premature rounding, and explain why the energy changes cancel while the entropy changes do not.'],
['proof','Zyklische Rückkehr versus einzelner nichtzyklischer isothermer Schritt.','Cyclic return versus a single non-cyclic isothermal step.',
'Eine vorgeschlagene Maschine soll zyklisch aus nur einem Reservoir bei T=400 K je 100 J aufnehmen und vollständig als Arbeit abgeben, ohne weitere Wirkung. Zeichne ihre Energieflüsse, berechne den zugehörigen Clausius-Ausdruck und begründe den Widerspruch trotz ausgeglichener Energiebilanz.',
'A proposed machine is to cyclically absorb 100 J from only one reservoir at T=400 K and deliver it entirely as work without any other effect. Draw its energy flows, calculate the corresponding Clausius expression, and justify the contradiction despite a balanced energy account.'],
['concept','Wiederhergestellter Teilsystemzustand versus bleibende Umgebungsänderung.','Restored subsystem state versus a lasting change in the surroundings.',
'Gas expandiert frei in die zweite Hälfte eines isolierten geschlossenen Gefäßes. Anschließend wird sein ursprüngliches Volumen durch äußeren Aufwand wiederhergestellt. Erkläre die Entropieproduktion im ersten Schritt und weshalb die Rückkompression allein keine vollständige thermodynamische Umkehr beweist.',
'Gas expands freely into the second half of an isolated closed vessel. Its original volume is then restored using external effort. Explain entropy production in the first step and why recompression alone does not prove complete thermodynamic reversal.'],
['concept','Grobe makroskopische Vorgaben versus einzelne modellhafte Teilchenzuordnungen.','Coarse macroscopic constraints versus individual model particle assignments.',
'Vier markierte Teilchen werden modellhaft links oder rechts zugeordnet. Konstruiere zwei verschiedene Zuordnungen mit je zwei Teilchen pro Seite und erkläre, welche Information die gleiche makroskopische Teilchenzählung nicht festlegt.',
'Four labeled particles are assigned to the left or right in a model. Construct two different assignments with two particles on each side and explain which information the identical macroscopic particle count does not specify.'],
['modeling','Kleine versus große Teilchenzahl; exakte Mitte versus annähernd ausgeglichener Bereich.','Small versus large particle number; exact midpoint versus an approximately balanced range.',
'Zähle für vier markierte, unabhängig und gleich wahrscheinlich links/rechts zugeordnete Teilchen die Fälle für n_links=0,1,2. Vergleiche Ω und die Entropien und erläutere, weshalb 6 von 16 Fällen für n_links=2 keine überwältigende Wahrscheinlichkeit sind.',
'For four labeled particles independently and equally likely to be assigned left or right, count the cases for n_left=0,1,2. Compare Ω and the entropies and explain why 6 out of 16 cases for n_left=2 is not an overwhelming probability.'],
['proof','Ein Volumenschritt versus Zerlegung in zwei Schritte bei festem N und T.','A single volume step versus two successive steps at fixed N and T.',
'Leite für N klassische ideale Gasteilchen bei unveränderter Temperatur das Verhältnis der Zustandszahlen beim Übergang V→2V her. Begründe den Exponenten N, führe den Logarithmusschritt aus und erkläre, wie Nk_B=nR zur makroskopischen Beschreibung führt.',
'For N classical ideal-gas particles at unchanged temperature, derive the ratio of state multiplicities for V→2V. Justify the exponent N, perform the logarithm step, and explain how Nk_B=nR connects this to the macroscopic description.'],
['procedure','Starres beheiztes System versus thermisch isolierter beweglicher Kolben; Arbeitskonvention.','Rigid heated system versus thermally insulated movable piston; work convention.',
'Ein geschlossenes Gas nimmt 120 J Wärme auf und verrichtet 50 J Arbeit an der Umgebung. Stelle mit ausdrücklich gewählter Arbeitskonvention die Energiebilanz auf, berechne ΔU und zeige, dass die alternative Vorzeichenkonvention dieselbe physikalische Änderung ergibt.',
'A closed gas absorbs 120 J of heat and does 50 J of work on its surroundings. Set up the energy balance with an explicitly chosen work convention, calculate ΔU, and show that the alternative sign convention gives the same physical change.'],
['concept','Wärmeausgleich versus Reibung; lokaler Entropierückgang versus Gesamtbilanz.','Thermal equalization versus friction; local entropy decrease versus total balance.',
'Eine ungeordnete Bildfolge zeigt den Temperaturausgleich zweier nach außen isolierter Körper. Ordne die Zustände physikalisch begründet und erkläre, warum die Entropieabnahme des heißen Körpers allein den thermodynamischen Zeitpfeil nicht festlegt.',
'An unordered image sequence shows temperature equalization between two bodies isolated from the outside. Order the states with physical justification and explain why the entropy decrease of the hot body alone does not determine the thermodynamic arrow of time.'],
['concept','Andere Reservoirtemperaturen versus geringere innere Reibung bei gleichen Reservoiren.','Different reservoir temperatures versus reduced internal friction with unchanged reservoirs.',
'Skizziere ohne Vorlage die Energieflüsse einer zyklischen Wärmekraftmaschine zwischen heißem und kaltem Reservoir. Begründe notwendige Wärmeabgabe und begrenzten Arbeitsanteil und erläutere, was die reversible Carnot-Grenze für dieselben Temperaturen aussagt.',
'Without a template, sketch the energy flows of a cyclic heat engine between hot and cold reservoirs. Justify necessary heat rejection and limited work output, and explain what the reversible Carnot limit means for those same temperatures.'],
['data','Physikalische Verluste versus scheinbare Grenzüberschreitung durch Unsicherheit oder falsche Bilanz.','Physical losses versus apparent exceedance caused by uncertainty or incorrect accounting.',
'Eine zyklische Maschine zwischen 600±2 K und 300±2 K liefert bei 1000±20 J aufgenommener Wärme 300±10 J Nutzarbeit. Bestimme den Wirkungsgrad und die passende Carnot-Grenze, schätze mit Randwerten die Unsicherheitsbereiche ab und unterscheide belastbaren Abstand von möglichen Verlustmechanismen.',
'A cyclic engine between 600±2 K and 300±2 K delivers 300±10 J of useful work for 1000±20 J of absorbed heat. Determine its efficiency and the appropriate Carnot limit, estimate uncertainty ranges using endpoint values, and distinguish a robust gap from possible loss mechanisms.'],
]
assert.equal(cases.length,20)
const id='canonical-physics-positive-evidence-v1-b043-thermodynamics-current-v1'
const stem='curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-043-thermodynamics-current-v1'
const goals=cases.map(([archetype,axisDe,axisEn,taskDe,taskEn],i)=>{
const row=rounds[i===10||i===15?'a':'b'][i],e=row.understandingEvidence
return {goalId:row.goalId,reason:'Nichtblinder Koordinatorentwurf nach vollständiger A/B-Inhaltslektüre und lokaler Beschreibungsadjudikation. Konkrete Erstfälle wurden hier neu verfasst; die Verständnis- und Transferkerne stammen aus der angegebenen versiegelten D-Runde. Separater inhaltlicher Gegencheck und aktuelle native Bindung sind vor Registrierung erforderlich. Keine menschliche Zustimmung oder reale Lernleistung behauptet. Quelle: '+row.recordId,evidenceLevel:'E1',maximumClaimScope:'G1',dissent:[],profile:{
archetype,expectations:[{id:'physical-understanding',essentialUnderstandingDe:e.essentialUnderstandingDe,essentialUnderstandingEn:e.essentialUnderstandingEn,observablePerformanceDe:e.observablePerformanceDe,observablePerformanceEn:e.observablePerformanceEn}],
coverageExpectations:{requiredExpectationIds:['physical-understanding'],alternativeExpectationGroups:[],minimumIndependentDemonstrations:2,freshVariationRequired:true,independentTransferRequired:true},
variationAxes:[{id:'changed-physical-condition',textDe:axisDe,textEn:axisEn}],
applicationCaseBriefs:[
{id:'fresh-independent-case',taskDemandDe:taskDe,taskDemandEn:taskEn,expectedPerformanceDe:e.observablePerformanceDe,expectedPerformanceEn:e.observablePerformanceEn,understandingFocusDe:e.essentialUnderstandingDe,understandingFocusEn:e.essentialUnderstandingEn},
{id:'independent-changed-case',taskDemandDe:e.transferExpectationDe,taskDemandEn:e.transferExpectationEn,expectedPerformanceDe:e.transferExpectationDe,expectedPerformanceEn:e.transferExpectationEn,understandingFocusDe:axisDe,understandingFocusEn:axisEn}
]}}})
// Explicit informed corrections supersede copied case expectations. The sealed
// D sources above remain unchanged; this helper still refuses file overwrite.
const informed=JSON.parse(fs.readFileSync(base+'positive-candidate-counterreview-overrides-v1.json','utf8'))
assert.deepEqual(informed.goals.map(g=>g.goalId),goals.map(g=>g.goalId))
goals.splice(0,goals.length,...informed.goals)
const candidates={schemaVersion:1,authoringContract:'positive-understanding-evidence-candidates-v1',reviewId:id,reviewedAt:informed.reviewedAt,reviewer:informed.reviewer,goals}
const config=JSON.parse(fs.readFileSync('curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-029-e-thermodynamics-energy-modeling-current-v1.config.json','utf8'))
config.reviewId=id;config.reviewPath=stem+'.review.jsonl';config.scope={label:'Physics B043 thermodynamics: current locally adjudicated candidate profiles',goalIds:goals.map(g=>g.goalId)}
const files=[[stem+'.config.json',config],[stem+'.candidates.json',candidates]]
for(const [p] of files)assert.ok(!fs.existsSync(p),'No replay or overwrite')
console.log(JSON.stringify({patch:'*** Begin Patch\n'+files.map(([p,v])=>'*** Add File: '+p+'\n'+JSON.stringify(v,null,2).split('\n').map(l=>'+'+l).join('\n')+'\n').join('')+'*** End Patch',summary:{profiles:goals.length,status:'unregistered_nonblind_draft'}}))
