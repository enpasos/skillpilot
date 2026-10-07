from pathlib import Path
import json,hashlib,datetime
b=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-carrier-hidden-continuity-native-d-independent-b-v3')
old=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-carrier-image-and-projection-independent-b-v1/targeted-carrier-and-six-country-views.independent-b.final.freeze.json')
x=json.loads(old.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();rows=[];roles=[]
for i in x['actualReadInputBindings']:
 name=i['path'];iscountry='/composition-views/biologie/' in name and '/de-de-' not in name
 if iscountry or '/input/BE/' in name or '/input/BB/' in name or '/mapping/DE-BE/' in name or '/mapping/DE-BB/' in name:
  p=Path(name);assert sha(p)==i['sha256'] and p.stat().st_size==i['bytes'],name;rows.append(i)
assert len([i for i in rows if '/composition-views/biologie/' in i['path']])==6
assert len(rows)==10
def entries(t):
 if isinstance(t,dict):
  if t.get('kind')=='goalEntry' and t.get('goalId')=='ac9e824f-003c-50ac-8751-2b8456004c63':yield t
  for z in t.values():yield from entries(z)
 elif isinstance(t,list):
  for z in t:yield from entries(z)
for i in rows:
 if '/composition-views/biologie/' in i['path']:
  p=Path(i['path']);es=list(entries(json.loads(p.read_text())));assert not any(e.get('projectionRole','target')=='target' for e in es)
  if p.name=='de-st-gym-seki-biology.view.json':assert not es
  else:assert len(es)==1 and es[0]['projectionRole']=='prerequisiteOnly'
  roles.append({'path':str(p),'actualCarrierEntries':es})
report={'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'KEEP_REUSED_EXACT_BINDINGS','oldIndependentFreeze':{'path':str(old),'sha256':sha(old)},'actualSelectedUnchangedInputs':rows,'actualCarrierRoles':roles,'sixFullViewReviewsNotRestarted':True,'carrierNotTargetInAnyOfSixViews':True,'carrierPrerequisiteOnlyWherePresent':True,'directScope':'BE/BB SekI G8/G9 as actual rendered page; broader original genetics table remains held','wholeOriginalSourceCoverage':False,'peerAResultsRead':False}
(b/'current-six-views-and-bounded-source-continuity.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('KEEP exact source/view bindings:',len(rows))
