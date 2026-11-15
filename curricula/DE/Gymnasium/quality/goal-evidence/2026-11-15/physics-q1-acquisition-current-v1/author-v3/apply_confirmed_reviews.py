"""Open v3 author changes requested by the independent informed reviewers."""
import json
from pathlib import Path
P=Path(__file__).parent
D=json.loads((P/'content-candidate.json').read_text());changes=[]
def replace(i,key,before,after,reason):
 t=D['tasks'][i];text=t['examData'][key]
 if before not in text:
  assert after in text,(i,key,before)
 else:
  assert text.count(before)==1,(i,key,before)
  t['examData'][key]=text.replace(before,after)
 changes.append({'taskIndex':i,'taskId':t['id'],'field':'examData.'+key,'before':before,'after':after,'reason':reason})

replace(14,'taskContent',
 'Zusätzlich beschreibt eine andere physikalische Zustandsgröße N eine Abnahme mit',
 'Zusätzlich ist N die erwartete Anzahl noch instabiler Kerne in einer Probe. Für diesen unabhängigen physikalischen Prozess wird das Abnahmemodell ausdrücklich vorgegeben; kein weiteres Kernphysikwissen wird benötigt. Es gilt',
 'Independent review: name a concrete physical state for the fresh exponential-transfer case; all process-specific physics is supplied.')
replace(14,'taskContentEn',
 'A separate physical state N obeys',
 'In a separate physical process N is the expected number of unstable nuclei remaining in a sample. Its decay model is explicitly supplied and no further nuclear-physics knowledge is required: N obeys',
 'Same physical-state clarification in English.')

replace(16,'taskContent',
 'Gegeben sind σ=Q/A und als physikalischer Ausgangspunkt der gaußsche Flusssatz ∮E·dA=Q_eingeschlossen/ε für ein homogenes lineares isotropes Medium.',
 'Gegeben sind σ=Q/A und diese elementare Flusshilfe für ein homogenes lineares isotropes Medium: Durch eine ebene Teilfläche S beträgt der vorzeichenbehaftete Fluss E_normal·S; die Normale zeigt bei einem geschlossenen Kasten jeweils nach außen. Die Summe aller Teilflächenflüsse ist Q_eingeschlossen/ε. Bei der symmetrischen Dose um eine ideal ausgedehnte geladene Fläche ist der Mantelfluss null; beide Deckel tragen gleich großen Fluss bei. Für die Beträge folgt deshalb 2|E|S=|σ|S/ε. Ein Oberflächenintegral muss nicht beherrscht werden; begründe die einzelnen Deckel-/Mantelbeiträge und die anschließende Zwei-Platten-Überlagerung.',
 'Independent review: provide elementary Gaussian-pillbox flux scaffold rather than requiring an unprepared surface integral.')
replace(16,'taskContentEn',
 "Use σ=Q/A and Gauss's flux law ∮E·dA=Q_enclosed/ε in a homogeneous linear isotropic medium.",
 'Use σ=Q/A and this elementary flux scaffold for a homogeneous linear isotropic medium: the signed flux through a flat patch S is E_normal·S, with each closed-box normal pointing outward. The sum of all patch fluxes equals Q_enclosed/ε. For a symmetric pillbox around an ideal infinite charged sheet the lateral flux is zero and both caps contribute equal flux. Thus magnitudes satisfy 2|E|S=|σ|S/ε. Surface integration is not required; justify cap/lateral contributions and the subsequent two-plate superposition.',
 'Same elementary supplied flux scaffold in English.')

replace(18,'taskContent',
 'Beim anschließenden Entladen an einen Motor gehen 60% der verfügbaren Feldenergie in mechanische Nutzarbeit:',
 'Nach der Geometrieänderung werden vor der Motorentladung BEIDE Kondensatoren von sämtlichen Spannungsquellen getrennt; dabei ändern sich C und die jeweilige freie Ladung nicht. Beim anschließenden Entladen an einen Motor gehen 60% der nun verfügbaren Feldenergie in mechanische Nutzarbeit:',
 'Independent review: explicitly disconnect both capacitors before the motor energy budget, as the solution already assumes.')
replace(18,'taskContentEn',
 'On later discharge a motor converts 60% of available field energy into useful mechanical work:',
 'After the geometry change, disconnect BOTH capacitors from every voltage source before the motor discharge, without changing C or their respective free charges. A motor then converts 60% of the now available field energy into useful mechanical work:',
 'Same source-disconnection clarification in English.')

replace(21,'taskContent',
 'Rücklauf wird ausgeblendet.',
 'Rücklauf wird ausgeblendet. Gegebene qualitative magnetische Richtungsregel: Bei anfänglicher Bewegung nach +x und B nach +z würde die Kraft auf eine positive Probeladung nach −y zeigen; bei negativer Ladung ist sie umgekehrt. Eine rein magnetische Kraft steht senkrecht zur momentanen Bewegung und zum Magnetfeld; bei unverändertem Feld wächst ihr Betrag mit dem Geschwindigkeitsbetrag. Ein formales mathematisches Kreuzprodukt wird nicht vorausgesetzt.',
 'Independent review: supply the qualitative magnetic rule, not an unprepared mathematical cross product.')
replace(21,'taskContentEn',
 'retrace is blanked.',
 'retrace is blanked. Supplied qualitative magnetic direction rule: for initial motion +x and B along +z, a positive test charge would feel force −y; reverse it for a negative charge. A purely magnetic force is perpendicular to the instantaneous motion and magnetic field; at fixed field its magnitude increases with speed. A formal mathematical cross product is not required.',
 'Same qualitative magnetic scaffold in English.')
replace(21,'taskContent',
 '**A:** Für t=0,1,2,3 ms gilt U=−2,0,+2,0 V.',
 '**A:** Die vier Zuordnungen sind ausdrücklich t=(0; 1; 2; 3) ms und dazu U=(−2; 0; +2; 0) V.',
 'Author ambiguity reported and independently confirmed: semicolons distinguish four samples from German decimal commas.')
replace(21,'taskContentEn',
 '**A:** At t=0,1,2,3 ms the input U is−2,0,+2,0 V.',
 '**A:** The four explicit pairs are t=(0; 1; 2; 3) ms with U=(−2; 0; +2; 0) V respectively.',
 'Same unambiguous four-sample mapping in English.')
replace(21,'taskContent',
 '**B:** Ein neuer Verlauf hat U=0,+1,−1,0 V bei denselben Zeiten.',
 '**B:** Ein neuer Verlauf hat U=(0; +1; −1; 0) V bei den vier Zeiten t=(0; 1; 2; 3) ms.',
 'Same explicit four-sample mapping for the fresh transfer.')
replace(21,'taskContentEn',
 '**B:** A fresh input has U=0,+1,−1,0 V at the same times.',
 '**B:** A fresh input has U=(0; +1; −1; 0) V at t=(0; 1; 2; 3) ms respectively.',
 'Same transfer mapping in English.')
replace(21,'solutionContent',
 'Magnetisch: +x×+z=−y, q<0→F nach+y.',
 'Magnetisch: Die gegebene qualitative Richtungsregel liefert für die positive Probeladung −y und für die Elektronen mit q<0 folglich +y. Ein formales Kreuzprodukt ist hierfür nicht erforderlich.',
 'Keep solution coherent with qualitative whole-P demand; no formal cross-product requirement.')
replace(21,'solutionContentEn',
 'For magnetic deflection +x×+z=−y, reversed by electron charge to+y.',
 'For magnetic deflection the supplied qualitative rule gives −y for a positive test charge, reversed to +y for electrons. No formal cross product is required.',
 'Same qualitative solution in English.')

step=D['tasks'][21]['examData']['scoring']['steps'][2]
before=step['description']
old_de='Unabhängigen magnetischen Vergleich mit korrektem Kreuzprodukt, Ladungsvorzeichen und Geschwindigkeits-/Arbeitsunterschied begründen.'
new_de='Unabhängigen magnetischen Vergleich mithilfe der gegebenen qualitativen Richtungsregel, des Ladungsvorzeichens und des Geschwindigkeits-/Arbeitsunterschieds begründen; ein formales Kreuzprodukt wird nicht verlangt.'
old_en='Justify the independent magnetic comparison with cross product, charge sign and speed/work distinction.'
new_en='Justify the independent magnetic comparison using the supplied qualitative direction rule, charge sign and speed/work distinction; a formal cross product is not required.'
after=before.replace(old_de,new_de).replace(old_en,new_en)
assert old_de in before and old_en in before or after==before
step['description']=after
changes.append({'taskIndex':21,'taskId':D['tasks'][21]['id'],'field':'examData.scoring.steps[2].description','before':before,'after':after,'reason':'Independent informed review: assess qualitative magnetic comparison, not formal cross-product competence; v2 local1/4 missing-core rule remains byte-identical.'})

D['status']='draft-author-candidate-v3-open-pending-complete-independent-review'
(P/'content-candidate.json').write_text(json.dumps(D,ensure_ascii=False,indent=2)+'\n')
(P/'additional-informed-review-deltas.json').write_text(json.dumps({'status':D['status'],'reviewer':'physics_release_finish independent informed content review; Root scope authorisation','deltas':changes},ensure_ascii=False,indent=2)+'\n')
print('Applied',len(changes),'confirmed field changes; v3 remains OPEN, v1/v2 unchanged.')
