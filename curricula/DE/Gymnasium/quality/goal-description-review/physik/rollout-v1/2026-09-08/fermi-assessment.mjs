// A complete narrow replacement for the unsupported Fermi coverage in generic templates.
import {createHash} from 'node:crypto'
export const fermiGoalId='658cf33d-a0c2-5d47-801a-3dbcd5cac074'
const shortKey='canonical_physics_assessment_fermi_occupation_conductivity'
const h=createHash('sha1').update('DE-GYM-CANONICAL-PHYSICS:'+shortKey).digest('hex')
export const fermiAssessmentId=h.slice(0,8)+'-'+h.slice(8,12)+'-5'+h.slice(13,16)+'-'+((parseInt(h[16],16)&3)|8).toString(16)+h.slice(17,20)+'-'+h.slice(20,32)
export const fermiAssessment={
 id:fermiAssessmentId,shortKey,title:'Prüfungsaufgabe: Besetzte Zustände und elektrische Leitfähigkeit',titleEn:'Assessment: Occupied States and Electrical Conductivity',
 description:'Die lernende Person kann vorgegebene Bändermodelle anhand der Fermienergie und temperaturabhängigen Zustandsbesetzung selbstständig auswerten und daraus begrenzte Aussagen zur elektrischen Leitfähigkeit begründen.',
 descriptionEn:'The learner can independently analyse supplied band models using the Fermi energy and temperature-dependent state occupation and justify limited conclusions about electrical conductivity.',
 weight:1,tags:['LK','Practice','Assessment','canonical'],contains:[],requires:[fermiGoalId],type:'atomic',
 dimensionTags:{framework:'canonical-gymnasium-physics',demandLevel:'AB3',processCompetencies:['PK2_MODELLIEREN','PK4_KOMMUNIZIEREN'],guidingIdeas:['LI_MATERIE','LI_TECHNIK'],phase:'Q4',area:'Klausurtraining'},
 extendedData:{applicabilityFromRequires:true,applicabilityMappingInheritance:'boundary'},
 examData:{reviewStatus:'released',reviewNote:'2026-09-08 individual AI-authored complete material, independently counterread in full by /root/physics_b043_blind_a. Source topic corrected from Q4.3 to Q4.5 against printed pp.46-47 before release. No human approval or learner-performance claim.',coveredGoalIds:[fermiGoalId],coveredStrands:['LI_MATERIE','LI_TECHNIK'],demandLevels:['AB1','AB2','AB3'],
 taskContent:`## Material: Zwei idealisierte Elektronensysteme

Die Energieintervalle in der Tabelle sind erlaubte Bänder, keine räumlichen Schichten. Im ersten Teil gilt T=0 K. Erlaubte Zustände unter E_F sind besetzt, über E_F unbesetzt; die Darstellung einzelner Zustände genau an E_F ist nicht Gegenstand der Aufgabe. In einer Bandlücke gibt es keine erlaubten Zustände. Die Diagramme stellen vereinfacht die verfügbaren Zustände dar, nicht deren zahlenmäßige Dichte. Ladungsträgerbeweglichkeit, Streuung und konkrete Stromstärken sind nicht angegeben.

| System | Erlaubte Energieintervalle / eV | E_F / eV |
|---|---|---:|
| M | ein Band von −3 bis +3 | 0 |
| S | unteres Band von −5 bis −1; oberes Band von +1 bis +5 | 0 |

S ist ein intrinsischer Halbleiter ohne Dotierung. Für den zweiten Teil wird S auf eine endliche Temperatur erwärmt, bei der nach Materialangabe einige Elektronen thermisch aus dem unteren in das obere Band angeregt werden. Das Modell beschreibt keine genaue Besetzungsfunktion. Die Bildungsquelle für die qualitative Bindung an das Lernziel ist Hessen KC Physik 2024, Q4.5 Leistungskurs, gedruckte S. 47; alle Tabellenwerte sind konstruierte Unterrichtsdaten.

1. Zeichne für M und S je eine eigene Energie-Bandskizze, markiere erlaubte besetzte/unbesetzte Bereiche bei T=0 K und E_F. Erkläre, warum E_F=0 bei S keinen dort besetzten Zustand bedeutet. (5 BE)
2. Beurteile: „Beide Systeme haben dieselbe Fermienergie und leiten deshalb bei T=0 K gleich gut.“ Erkläre anhand der Besetzung und erreichbarer freier Zustände, welches System im Modell metallische Leitfähigkeit zulässt und weshalb das volle untere Band von S allein keine solche Leitfähigkeit begründet. Eine konkrete Leitfähigkeit ist nicht zu berechnen. (4 BE)
3. Ergänze für das erwärmte S die thermisch angeregten Elektronen und die im unteren Band zurückbleibenden Löcher. Erkläre qualitativ ihren Beitrag zur Leitfähigkeit und widerlege: „Das Erwärmen erzeugt zusätzliche Elektronen aus dem Nichts.“ (4 BE)
4. In einer Variante hat S bei ansonsten für diesen Vergleich gleichen Annahmen einen größeren Bandabstand. Sage die thermische Anregung bei gleicher Temperatur qualitativ voraus und benenne eine Information, die für eine quantitative Stromprognose zusätzlich nötig wäre. (3 BE)`,
 taskContentEn:`## Material: Two idealised electron systems

The tabulated energy intervals are allowed bands, not spatial layers. Initially T=0 K. Allowed states below E_F are occupied and above E_F empty; individual states exactly at E_F are outside this task. A band gap contains no allowed states. The diagrams simplify available states without specifying their numerical density. Carrier mobility, scattering and actual currents are not given.

| System | Allowed energy intervals / eV | E_F / eV |
|---|---|---:|
| M | one band from −3 to +3 | 0 |
| S | lower band −5 to −1; upper band +1 to +5 | 0 |

S is an intrinsic undoped semiconductor. In the second part S is warmed to a finite temperature at which, as specified, some electrons are thermally excited from the lower to the upper band. The model does not specify an exact occupation function. The qualitative curriculum basis is Hessen KC Physics 2024, Q4.5 advanced course, printed p.47; all table values are constructed teaching data.

1. Draw your own energy-band diagrams for M and S, marking allowed occupied/empty regions at T=0 K and E_F. Explain why E_F=0 in S does not mean a state is occupied there. (5 points)
2. Assess: “Both systems have the same Fermi energy and therefore conduct equally well at T=0 K.” Use occupation and accessible empty states to explain which permits metallic conduction in this model and why S's full lower band alone does not establish it. No numerical conductivity calculation is required. (4 points)
3. Add thermally excited electrons and holes left in the lower band for warmed S. Explain their qualitative contribution to conduction and refute: “Warming creates extra electrons from nothing.” (4 points)
4. A variant of S has a larger band gap, with other comparison assumptions held equal. Predict thermal excitation at equal temperature qualitatively and name additional information needed for a quantitative current prediction. (3 points)`,
 solutionContent:`1. M: leeres Band über 0, besetztes Band unter 0 innerhalb [−3,+3]; S: unteres Band [−5,−1] voll, oberes [+1,+5] leer, Bandlücke zwischen −1 und +1. Je konsistente Bandskizze 2 BE, ausdrückliche Abgrenzung E_F in der Lücke von einem erlaubten Elektronenzustand 1 BE.
2. Die Aussage ist falsch: In M liegen besetzte und unbesetzte erlaubte Zustände unmittelbar benachbart im selben Band; eine schwache elektrische Einwirkung kann die Verteilung für einen Strom verändern (2 BE). In S ist das untere Band voll und das obere bei 0 K leer; ein voller Bandzustand allein liefert im Idealmodell keinen metallischen Leitungsbeitrag. Gleicher Zahlenwert von E_F ohne Bandumgebung ist kein Leitfähigkeitsvergleich (2 BE). Keine universelle Aussage über einen Zahlenwert der Leitfähigkeit.
3. Zeichnet einige Elektronen im oberen Band und entsprechende Löcher im unteren (2 BE). Beide erlauben im Modell Ladungstransport; Elektronenzahl wird durch thermische Umverteilung erhalten, Energie wird zugeführt, keine Elektronen werden erzeugt (2 BE).
4. Bei größerem Abstand wird die thermische Anregung unter den genannten Vergleichsbedingungen erschwert; weniger thermisch angeregte Träger sind zu erwarten (2 BE). Für eine quantitative Stromprognose fehlen beispielsweise Mobilitäten/Streuung, konkrete Besetzungsdichten oder die angelegte Feldstärke und Probengeometrie (eine passende Information: 1 BE). Aus der Skizze allein folgt keine genaue Stromstärke.`,
 solutionContentEn:`1. M: empty states above 0 and occupied states below 0 within [−3,+3]. S: full lower band [−5,−1], empty upper band [+1,+5], gap between −1 and +1. Each consistent band sketch earns 2 points; explicitly separating E_F in the gap from an allowed electron state earns 1.
2. False: in M occupied and empty allowed states are immediately adjacent in one band, so a weak electric influence can alter the distribution to carry current (2). In S the lower band is full and upper band empty at 0 K; a full band alone does not provide metallic conduction in the ideal model. Equal numerical E_F without the surrounding bands does not compare conductivity (2). No universal numerical conductivity claim.
3. Shows some electrons in the upper band and corresponding holes below (2). Both allow charge transport in the model; thermal redistribution preserves electron number and requires energy input rather than creating electrons (2).
4. A larger gap makes thermal excitation harder under the stated comparison assumptions, so fewer thermally excited carriers are expected (2). Quantitative current prediction needs, for example, mobility/scattering, actual occupation densities, or applied field and geometry (one suitable item: 1). The sketch alone gives no exact current.`,
 scoring:{maxPoints:16,passingPoints:10,steps:[{id:'fermi-band-representation',points:5,description:'Eigene korrekte besetzte/leere Bänder, Lücke und E_F getrennt.'},{id:'fermi-conductivity-explanation',points:4,description:'Zugängliche Zustände und volle Bänder zur bedingten Leitfähigkeitsdeutung genutzt.'},{id:'fermi-thermal-occupation',points:4,description:'Elektron-Loch-Anregung mit Erhaltung der Elektronenzahl statt Erzeugungsbehauptung.'},{id:'fermi-gap-transfer',points:3,description:'Veränderter Bandabstand qualitativ gedeutet und quantitative Aussagegrenze benannt.'}]}
 }
}
