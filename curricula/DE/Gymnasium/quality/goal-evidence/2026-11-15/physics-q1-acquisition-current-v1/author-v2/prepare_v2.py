"""Precise draft successor. v1 is read-only and fully retained."""
from pathlib import Path
import json,hashlib,copy,itertools,datetime
V1=Path('tmp/physics-q1-current-acquisition-20261115-v1')
OUT=Path(__file__).parent
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
seal=json.loads((V1/'candidate-artifact-pins.json').read_text())
for p in seal['pins']:assert sha(p['path'])==p['sha256'],p
original=json.loads((V1/'content-candidate.json').read_text());candidate=copy.deepcopy(original)
candidate['status']='draft-author-candidate-v2-step-sum-rubric-pending-independent-recheck'
review=json.loads((V1/'review-pack.json').read_text());review['status']=candidate['status']
rubric_deltas=[];content_deltas=[];integer_checks=[]

local_de=('DE-Schrittregel: Dieser Schritt wird mit höchstens 1 von 4 Punkten bewertet, sobald eine der IN DIESEM SCHRITT ausdrücklich genannten wesentlichen Kernaussagen oder verlangten unabhängigen Übertragungen vollständig fehlt oder durch eine explizite Fehlvorstellung ersetzt wird. Ohne prüfbare eigene Evidenz 0 Punkte. 4 Punkte bei vollständiger tragfähiger Evidenz, 3 bei einem isolierten kleinen Rechen-/Rundungs-/Zeichenfehler trotz aller vorhandenen Kerne; 2 können mehrere kleinere Fehler bei dennoch vollständig vorhandenen Kernen erhalten. Konsistente Folgefehler nicht mehrfach abziehen und gleichwertige fachlich richtige Wege anerkennen. Es gibt keine gesonderte Gesamtkappung: maßgeblich ist ausschließlich die Summe der Schrittpunkte.')
local_en=('EN step rule: Award AT MOST 1 of 4 points in THIS STEP if any essential core statement or required independent transfer explicitly named IN THIS STEP is wholly missing or replaced by an explicit misconception. Award 0 without checkable own evidence. Award 4 for complete sound evidence, 3 for one isolated minor arithmetic/rounding/drawing error with all cores present; 2 may be awarded for several minor errors while all cores remain present. Do not penalise consistent follow-through twice; accept equivalent valid methods. There is no separate total cap: use only the sum of step points.')

def changed(task,key,old,new,label):
 text=task['examData'][key];assert text.count(old)==1,(task['id'],key,old)
 task['examData'][key]=text.replace(old,new)
 content_deltas.append({'taskId':task['id'],'field':'examData.'+key,'reason':label,'before':old,'after':new})

for index,(old,task,r) in enumerate(zip(original['tasks'],candidate['tasks'],review['reviews'])):
 ed=task['examData'];sc=ed['scoring'];maximum=sc['maxPoints'];passing=sc['passingPoints']
 assert maximum==4*len(sc['steps']) and passing==maximum-2
 for number,step in enumerate(sc['steps']):
  before=step['description']
  # The first v1 description alone contains the complete global policy in line1.
  body=before.split('\n',1)[1] if number==0 else before
  assert not body.startswith('Bewertung:')
  step['description']=body+'\n'+local_de+'\n'+local_en
  rubric_deltas.append({'taskId':task['id'],'field':f'examData.scoring.steps[{number}].description','before':before,'after':step['description']})
 for key,marker,policy in [('solutionContent','\n\nBewertung: ',local_de),('solutionContentEn','\n\nScoring: ',local_en)]:
  before=ed[key];assert before.count(marker)==1
  body=before.rsplit(marker,1)[0]
  ed[key]=body+'\n\n'+policy+f'\nMaximum {maximum}; Bestehen / pass {passing}. A missing essential statement/transfer limits its step to at most1, so the greatest possible sum is {maximum-3}<{passing}. One isolated minor error with all cores present yields {maximum-1}>={passing}.'
  rubric_deltas.append({'taskId':task['id'],'field':'examData.'+key,'solutionBodyUnchanged':True,'oldPolicy':marker.strip()+before.rsplit(marker,1)[1],'newPolicy':ed[key][len(body)+2:]})
 for c in r['essentialClaims']:
  c['missingCoreScoreMaximum']=maximum-3
  c['missingEssentialStatementOrTransferStepMaximum']=1
 r['scoreMechanism']='Direct sum of explicit local step scores only; no separately implemented total cap is assumed.'
 # Enumerate every possible value in the affected block and every possible sum
 # of other integer steps. Every integer sum0..4*(n-1) is attainable by4-point steps.
 for number,step in enumerate(sc['steps']):
  sums=[a+b for a in range(2) for b in range(4*(len(sc['steps'])-1)+1)]
  best=max(sums);assert best==maximum-3 and best<passing
  integer_checks.append({'taskId':task['id'],'affectedStep':step['id'],'missingCoreLocalAllowedIntegers':[0,1],
   'otherStepsSumIntegers':[0,4*(len(sc['steps'])-1)],'enumeratedCombinations':len(sums),'maximumAchievableSum':best,'passingPoints':passing,'noOmissionCanPass':all(s<passing for s in sums),
   'minorErrorWithAllCores':{'affectedStep':3,'allOthers':4,'sum':maximum-1,'passes':maximum-1>=passing}})

# Only the two separately reported geometry ambiguities are changed in task content.
changed(candidate['tasks'][1],'taskContent',
 'Zwei neue kugelsymmetrische Körper mit Radien a und 2a tragen je +Q: Vergleiche ihre Felder am gemeinsamen äußeren Punkt mit Zentrumabstand 3a.',
 'Vergleiche zwei getrennte neue Versuchsaufbauten: jeweils ein kugelsymmetrischer Körper mit Gesamtladung +Q und Zentrum im Ursprung, im ersten Aufbau Radius a, im zweiten Radius 2a. Bestimme in beiden Aufbauten das Feld am selben Koordinatenpunkt (3a,0) und vergleiche Richtung und Betrag.',
 'Root independent content review: fix separate configurations, common centre coordinates and observation direction.')
changed(candidate['tasks'][1],'taskContentEn',
 'Two new spherical charge distributions of radii a and 2a each carry +Q: compare their fields at a common exterior point 3a from their centres.',
 'Compare two separate new experimental configurations, each containing one spherical charge distribution of total charge +Q centred at the origin, with radius a in the first and 2a in the second. Determine the field at the same coordinate point (3a,0) in both configurations and compare its direction and magnitude.',
 'Same geometry clarification in English.')
changed(candidate['tasks'][5],'taskContent',
 'Ein negatives Teilchen tritt bei gleichem Geschwindigkeitsbetrag unter 30° statt 90° zu B ein.',
 'Ein negatives Teilchen tritt bei gleichem Geschwindigkeitsbetrag unter 30° statt 90° zu B ein. In beiden Eintrittsfällen zeigt die anfängliche senkrechte Geschwindigkeitskomponente nach +x; im 30°-Fall zeigt die parallele Komponente nach +z.',
 'Root independent content review: fix initial azimuth and advance direction for the cross-product construction.')
changed(candidate['tasks'][5],'taskContentEn',
 'A negative particle of fixed speed enters at 30° instead of 90° to B.',
 'A negative particle of fixed speed enters at 30° instead of 90° to B. In both entry cases the initial perpendicular velocity component points +x; in the 30° case the parallel component points +z.',
 'Same entry-direction clarification in English.')

# Verify exact content identity except the4 authorised language-specific replacements.
allowed_content={('908a7f3d-0e2e-56e3-b04e-bff50c899309','taskContent'),('908a7f3d-0e2e-56e3-b04e-bff50c899309','taskContentEn'),('26a6cfcb-bc18-5a9b-b423-278123364f7c','taskContent'),('26a6cfcb-bc18-5a9b-b423-278123364f7c','taskContentEn')}
for old,new in zip(original['tasks'],candidate['tasks']):
 for key in old:
  if key!='examData':assert old[key]==new[key],(old['id'],key)
 for key in old['examData']:
  if key not in ['scoring','solutionContent','solutionContentEn'] and (old['id'],key) not in allowed_content:
   assert old['examData'][key]==new['examData'][key],(old['id'],key)
 for a,z in zip(old['examData']['scoring']['steps'],new['examData']['scoring']['steps']):
  assert a['id']==z['id'] and a['points']==z['points']==4
 assert old['examData']['scoring']['maxPoints']==new['examData']['scoring']['maxPoints']
 assert old['examData']['scoring']['passingPoints']==new['examData']['scoring']['passingPoints']

for filename,value in [('content-candidate.json',candidate),('review-pack.json',review),('rubric-delta.json',{'status':'proposed-local-step-score-successor','v1CandidateSha256':sha(V1/'content-candidate.json'),'deltas':rubric_deltas}),('content-clarification-delta.json',{'status':'only-two-root-reported-geometry-ambiguities','deltas':content_deltas}),('omission-integer-checks.json',{'status':'author-integer-checks-not-independent-content-acceptance','taskCount':27,'stepChecks':integer_checks,'v1OriginalFilesVerifiedUnchanged':True}),('input-pins.json',{'v1ArtifactSeal':{'path':str(V1/'candidate-artifact-pins.json'),'sha256':sha(V1/'candidate-artifact-pins.json')},'inputs':json.loads((V1/'input-pins.json').read_text()),'note':'v1 retained exactly. This successor changes no canonical/view/registry/learner-result input. Existing unpublished draft UUIDs identify the same not-yet-integrated candidate; no active or historical task contract is rebound.'})]:
 (OUT/filename).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')

print(f'PASS: v1 seal unchanged; {len(rubric_deltas)} rubric-field deltas; {len(content_deltas)} authorised DE/EN geometry clauses; {len(integer_checks)} exhaustive local-omission integer checks.')
