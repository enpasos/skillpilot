# SPDX-License-Identifier: Apache-2.0
"""Bind existing ordinary whole source/partner context and check authored raw cards."""
import csv,hashlib,json
from collections import Counter
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix()
def load(p):return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return dict(path=p.relative_to(ROOT).as_posix(),sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
def write(name,x):(OWN/name).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'whole-fourteen-science-author.first.freeze.json').exists()
whole=load(OWN/'whole-fourteen-current-goals-source-and-context.input.snapshot.json');ids=whole['scopeGoalIds'];canon=load(OWN/'input/current-canonical479.original.snapshot.json');goals={g['id']:g for g in canon['goals']}
atlasPath=ROOT/'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json';atlas=load(atlasPath)
bookPath=ROOT/'app/public/lernzielbuch/de-gym-biologie-bundesweit.book-model.json';book=load(bookPath)
sourcesPath=ROOT/'app/public/lernzielbuch/de-gym-biologie-bundesweit.original-sources.json';sources=load(sourcesPath)
assert len(book['pages'])==394 and sources['bookDigest']==book['digest']
byEvidence={e['id']:e for e in sources['evidence']};byDocument={e['id']:e for e in sources['documents']}
bookRows=[];selectedEvidenceIds=set();selectedDocumentIds=set()
for gid in ids:
 page=next(p for p in book['pages'] if p['goalId']==gid)
 assert page['description']==goals[gid]['description']
 selectedSourceScopes=sources['goals'][gid]
 evidIds={i for s in selectedSourceScopes for i in s['evidenceIds']};selectedEvidenceIds.update(evidIds)
 selectedDocumentIds.update(byEvidence[i]['documentId'] for i in evidIds)
 bookRows.append(dict(goalId=gid,wholeCurrentBookPage=page,wholeCurrentSourceScopes=selectedSourceScopes,wholeSourceEvidence=[byEvidence[i] for i in sorted(evidIds)],actualScientificSourceApproval=False))
mappingRows=[];sourcePaths=set();partnerIds=set()
for path in atlas['mappingPaths']:
 p=ROOT/path;mapping=load(p)
 selected=[d for d in mapping.get('decisions',[]) if set(d.get('canonicalGoalIds',[])).intersection(ids)]
 if not selected:continue
 extractionPath=mapping['sourceExtractionPath'];sourcePaths.add(extractionPath);extraction=load(ROOT/extractionPath)
 srcgoals={g['id']:g for g in extraction.get('sourceGoals',extraction.get('goals',[]))}
 passages={g.get('id',g.get('passageId')):g for g in extraction.get('passages',[])}
 bound=[]
 for d in selected:
  sid=d['sourceGoalId'];assert sid in srcgoals,(path,sid)
  sg=srcgoals[sid];pids=d.get('canonicalGoalIds',[]);partnerIds.update(pids)
  assert all(i in goals for i in pids)
  bound.append(dict(wholeCurrentDecision=d,wholeCurrentSourceGoal=sg,wholeCurrentSourcePassage=passages.get(sg.get('passageId')),wholeCanonicalPartnerGoals=[goals[i] for i in pids],selectedFourteenPartnerIds=[i for i in pids if i in ids],independentSourceReviewPending=True))
 mappingRows.append(dict(mappingBinding=bind(p),sourceExtractionBinding=bind(ROOT/extractionPath),wholeSelectedDecisions=bound,authorSourceMappingChanges=[]))
write('fourteen-current-ordinary-source-partner-frame.neutral-input.json',dict(schemaVersion=1,artifactRole='actual current ordinary source/applicability and complete partner input; no source approval',capturedAt=datetime.now(timezone.utc).isoformat(),scopeGoalIds=ids,bookModelBinding=bind(bookPath),originalSourcesBinding=bind(sourcesPath),sourceAtlasInputsBinding=bind(atlasPath),wholeCurrentBookPages=bookRows,wholeAffectedMappingDecisions=mappingRows,wholeSelectedEvidence=[byEvidence[i] for i in sorted(selectedEvidenceIds)],wholeSelectedSourceDocuments=[byDocument[i] for i in sorted(selectedDocumentIds)],affectedMappingFileCount=len(mappingRows),affectedDecisionCount=sum(len(e['wholeSelectedDecisions']) for e in mappingRows),wholePartnerGoalIds=sorted(partnerIds),wholeCurrentPartnerBodies=[goals[i] for i in sorted(partnerIds)],currentCanonicalNodes=479,currentCurricularAtoms=394,activeSourceMappingChanges=[],independentApproval=False,humanApproval=False))

def readcsv(name):
 with (OWN/'media'/name).open(newline='') as f:return list(csv.DictReader(f))
t=readcsv('temperature-observation.raw-cards.csv');s=readcsv('seed-observation.raw-cards.csv')
assert len(t)==6 and len({r['card_id'] for r in t})==6
assert [int(r['minute']) for r in t]==[0,1,2,3,4,5]
valid=[float(r['temperature_C']) for r in t if r['measurement_status']=='valid']
assert len(valid)==5 and sum(valid)==110 and sum(valid)/len(valid)==22
assert t[3]['temperature_C']=='' and t[3]['measurement_status']=='missing'
cat=Counter(r['leaf_state'] for r in t);assert dict(cat)=={'flach':2,'leicht_eingerollt':2,'eingerollt':2}
assert len(s)==12 and len({r['card_id'] for r in s})==12
seedrows=[]
for dish,expected in [('A',(3,2,1)),('B',(2,3,1))]:
 rows=[r for r in s if r['dish_id']==dish];c=Counter(r['germination_state'] for r in rows)
 assert len(rows)==6 and (c['gekeimt'],c['ungekeimt'],c['unbeurteilbar'])==expected
 k,n,u=expected;seedrows.append(dict(dishId=dish,counts=dict(c),assessableDenominator=k+n,assessableGerminatedFraction=k/(k+n),wholeDishLowerBound=k/6,wholeDishUpperBound=(k+u)/6))
model=load(OWN/'media/inquiry-finite-model.inputs.json')['scenarios']
day4=model['germination']['stages'][2]
germ={key:sum(day4[key])/2/20 for key in ['dry','moderately_moist','submerged']}
assert germ=={'dry':0.05,'moderately_moist':0.775,'submerged':0.275}
light=model['aquatic_light']['stages'][1];means={key:sum(light[key])/3 for key in ['low_light_delta_oxygen_mg_per_L','medium_light_delta_oxygen_mg_per_L','high_light_delta_oxygen_mg_per_L']}
assert all(abs(means[k]-v)<1e-12 for k,v in zip(means,[0.2,0.7,0.8]))
write('checks/raw-task-data-and-arithmetic.actual-terminal.json',dict(schemaVersion=1,role='actual technical consistency check of own constructed task inputs; no empirical/learner approval',checkedAt=datetime.now(timezone.utc).isoformat(),temperatureRows=6,validTemperatureCount=5,temperatureSum_C=110,temperatureMean_C=22,qualitativeLeafCounts=dict(cat),seedRows=12,wholeDishRows=seedrows,day4GerminationFractions=germ,oxygenDeltaMeans_mg_per_L=means,allNumbersConstructed=True,actualLearnerResults=False,actualExperimentPerformed=False,independentApproval=False,humanApproval=False,exitCode=0))
print(json.dumps({'wholeSourceMappings':len(mappingRows),'wholeSourceDecisions':sum(len(e['wholeSelectedDecisions']) for e in mappingRows),'wholePartners':len(partnerIds),'taskInputsConsistent':True,'independentSourceApprovals':0}))
