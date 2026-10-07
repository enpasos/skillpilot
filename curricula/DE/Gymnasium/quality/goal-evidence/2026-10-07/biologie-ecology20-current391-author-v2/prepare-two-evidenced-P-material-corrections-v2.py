"""Resolve two actual independent scientific findings in new author files."""
from pathlib import Path
import copy
import json
import hashlib
from datetime import datetime, timezone

D=Path(__file__).resolve().parent
R=D.parents[6]
O=D/'materials-revision-v2'
O.mkdir(exist_ok=True)
read=lambda p:json.loads(p.read_text())
def write(p,x):
    with p.open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')

original=read(D/'materials/twenty-whole-goals-forty-complete-DEEN-cases.author.json')
material=copy.deepcopy(original)
arthropod=material['goals'][1]['cases'][0]
arthropod['material']['de']=arthropod['material']['de'].replace('acht Beine ohne Fühler → Spinne','acht Beine ohne Fühler → Spinnentier')
arthropod['material']['en']=arthropod['material']['en'].replace('eight legs without antennae → spider','eight legs without antennae → arachnid')
arthropod['modelAnswer']['de']='A ist eine Eiche wegen Blatt/Eichel; B wird mit dem vereinfachten Schlüssel als Spinnentier eingeordnet; C als Insekt wegen sechs Beinen/Fühlern. Acht Beine allein unterscheiden eine Spinne nicht sicher von anderen Spinnentieren, etwa Milben oder Weberknechten. Der Schlüssel erlaubt bei den Tieren nur die angegebene Gruppenbestimmung, keine konkrete Art. Weitere tatsächlich sichtbare Merkmale und eine passende Bestimmungshilfe wären erforderlich.'
arthropod['modelAnswer']['en']='A is an oak because of the leaf/acorn; the simplified key assigns B to arachnids and C to insects because of six legs/antennae. Eight legs alone do not reliably distinguish spiders from other arachnids, such as mites or harvestmen. For animals the key supports only the stated group identification, not a particular species. Further actually visible traits and a suitable key would be required.'
soil=material['goals'][5]['cases'][0]
soil['modelAnswer']['de']='Der Nachweis enthält eine tatsächlich untersuchte Probe und ein nachvollziehbares digitales Ergebnisprotokoll. Temperatur, Feuchte und Bodenstruktur beschreiben das unbelebte Biotop. Tatsächlich beobachtete lebende Bodentiere sowie als lebend erkennbare Pilze oder Wurzeln erlauben eine begrenzte Beschreibung der Lebensgemeinschaft. Totes Laub und andere abgestorbene Pflanzenreste gehören zum organischen Substrat, nicht zu den lebenden Organismen der Biozönose. Nicht gesehene Mikroorganismen dürfen nicht als gezählt gelten. Eine kleine Stichprobe repräsentiert weder alle Arten noch den gesamten Wald.'
soil['modelAnswer']['en']='Evidence includes an actually investigated sample and a traceable digital results protocol. Temperature, moisture and structure describe the non-living biotope. Actually observed living soil animals and fungi or roots identifiable as living support a bounded community description. Dead leaves and other dead plant remains belong to the organic substrate, not to the living organisms of the biocenosis. Unseen microorganisms must not be reported as counted. A small sample represents neither all species nor the entire woodland.'
material['revisionRole']='Two evidenced author corrections; independent current review still pending'
material['previousMaterialsSha256']=hashlib.sha256((D/'materials/twenty-whole-goals-forty-complete-DEEN-cases.author.json').read_bytes()).hexdigest()
write(O/'twenty-whole-goals-forty-complete-DEEN-cases.author-v2.json',material)
md=['# Ökologie: zwei belegte fachliche Korrekturen, vollständige 40 DE/EN-Fälle', '',
    'Neuer KI-Autorkandidat. Der erste eingefrorene Materialstand bleibt erhalten. Fachliche Änderungen betreffen nur die Spinnentier-Gruppenbestimmung in Fall 02-1 und die Trennung lebender Bodenbiozönose von abgestorbenem Substrat in Fall 06-1. Keine Lernendenleistung, menschliche Prüfung oder Freigabe wird behauptet.', '']
for n,item in enumerate(material['goals'],1):
    g=item['wholeGoal']
    md += [f'## {n}. {g["title"]} — {g["id"]}', '', f'**Ganzes Lernziel DE:** {g["description"]}', f'**Whole goal EN:** {g["descriptionEn"]}', '']
    for c in item['cases']:
        md += [f'### {c["id"]}', '']
        for key,label in [('material','Material'),('task','Aufgabe / Task'),('modelAnswer','Erwartung / Model answer'),('performanceBoundary','Nachweisgrenze / Evidence boundary')]:
            md += [f'**{label} DE:** {c[key]["de"]}', '',f'**{label} EN:** {c[key]["en"]}', '']
with (O/'twenty-whole-goals-forty-complete-DEEN-cases.author-v2.md').open('x') as f:f.write('\n'.join(md)+'\n')

originalCandidates=read(D/'P20.current-text-preimage.author.candidates.json')
candidates=copy.deepcopy(originalCandidates)
candidates['reviewId']='biologie-ecology20-current391-positive-author-material-v2'
candidates['reviewedAt']=datetime.now(timezone.utc).isoformat().replace('+00:00','Z')
for index in [1,5]:
    revisedCase=material['goals'][index]['cases'][0]
    brief=candidates['goals'][index]['profile']['applicationCaseBriefs'][0]
    for lang,suffix in [('de','De'),('en','En')]:
        brief['taskDemand'+suffix]=revisedCase['material'][lang]+' '+revisedCase['task'][lang]
        brief['expectedPerformance'+suffix]=revisedCase['modelAnswer'][lang]
    candidates['goals'][index]['reason']+=' Gezielte fachliche Materialkorrektur nach unabhängigem Befund: '+('Spinnentier statt nicht belegter Spinne bei nur acht Beinen.' if index==1 else 'Lebende Bodenbiozönose getrennt von abgestorbenem organischem Substrat.')
write(O/'P20.current-text-preimage.author-v2.candidates.json',candidates)
config=read(D/'P20.current-text-preimage.author.config.json')
config['reviewId']=candidates['reviewId']
config['reviewPath']=str((O/'P20.current-text-preimage.author-v2.review.jsonl').relative_to(R))
config['scope']['label']='20 unchanged ecology goals, two evidenced author material corrections; final image bindings pending'
write(O/'P20.current-text-preimage.author-v2.config.json',config)
changes=[]
for old,new in zip(original['goals'],material['goals']):
    assert old['wholeGoal']==new['wholeGoal']
    for oc,nc in zip(old['cases'],new['cases']):
        if oc!=nc:changes.append({'goalId':old['goalId'],'caseId':oc['id'],'changedFields':[k for k in oc if oc[k]!=nc[k]]})
assert len(changes)==2
for i in range(20):
    if i not in [1,5]:assert originalCandidates['goals'][i]['profile']==candidates['goals'][i]['profile']
write(O/'two-actual-scientific-corrections-and-exact-other38-cases.receipt.json',{
    'role':'author-correction-not-independent-approval','scientificFindings':changes,'wholeGoalChanges':0,
    'exactOtherWholeCasePairs':38,'exactOtherWholeProfiles':18,'finalIndependentRecheckPending':True,
    'finalRastersPending':True,'firstFrozenArtifactsUnchanged':True,'activeWrites':False,'strictGainClaimed':0})
print(json.dumps({'newDossier':str(O),'actualScientificChanges':changes,'wholeGoalChanges':0,'exactOtherCasePairs':38,'exactOtherProfiles':18},indent=2))
