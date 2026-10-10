from pathlib import Path
import json,hashlib,copy,shutil
from jsonschema import Draft202012Validator,FormatChecker
R=Path('/home/enpasos/projects/skillpilot');C=Path('/tmp/economics-independent633-root-cap-path.txt').read_text().strip();C=Path(C);O=Path(Path('/tmp/economics-independent633-root-out-path.txt').read_text().strip())
Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';H=Q/'wirtschaft-current633-company-finance-consumer36-current597-fieldwise-status-nav-scope-author-a-v1/actual-final-current633-company-finance-consumer36-sixNav338-foreign-whole-science-bound.author-handoff.json'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
def rd(p):return json.loads(p.read_text())
def get(b):
 p=R/b['path'];assert not p.is_symlink();assert hashlib.sha256(p.read_bytes()).hexdigest()==b['sha256'];assert p.stat().st_size==b['bytes'];return rd(p)
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def save(n,x):
 p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
h=rd(H);before=get(h['wholeBeforeCAN']);after=get(h['wholeAfterCAN']);released=get(h['whole36StatusOnlyReleasedBodies']);assert before==rd(R/CAN)==rd(C/CAN)
bg={g['id']:g for g in before['goals']};ag={g['id']:g for g in after['goals']};rg={g['id']:g for g in released};assert len(bg)==597 and len(ag)==633 and len(rg)==36 and set(ag)-set(bg)==set(rg)
assert {k:v for k,v in before.items() if k!='goals'}=={k:v for k,v in after.items() if k!='goals'}
science=[]
for key,field in [('companyForeignScienceReceipt','qualifiedFinalWhole12'),('financeForeignScienceReceipt','wholeFinalAuthorInput'),('consumerForeignScienceReceipt','wholeFinalReviewedDraftBody')]:
 sj=get(h[key]);draft=get(sj[field]);draft=draft['materials'] if isinstance(draft,dict) else draft;assert len(draft)==12
 for g in draft:
  r=copy.deepcopy(rg[g['id']]);assert r==ag[r['id']];assert r['examData']['reviewStatus']=='released' and g['examData']['reviewStatus']=='draft'
  note=r['examData'].pop('reviewNote');assert h[key]['path'] in note and 'Menschliche Prüfung, Freigabe und Erprobung bleiben getrennt' in note and 'keine menschliche Freigabe behauptet' in note
  r['examData']['reviewStatus']='draft';assert r==g
 science.append({'seal':h[key],'wholeDraftInput':sj[field],'actualBodiesReused':12,'onlyStatusAndAIOnlyReviewNoteChanged':True})
nav=[]
for id,g in bg.items():
 if ag[id]==g:continue
 a=ag[id];fields=sorted(k for k in set(g)|set(a) if g.get(k)!=a.get(k));assert fields==['contains','description','descriptionEn']
 assert a['contains'][:len(g['contains'])]==g['contains'];new=a['contains'][len(g['contains']):];assert new and len(set(new))==len(new) and set(new)<=set(rg)
 nav.append({'goalId':id,'fields':fields,'wholeBefore':g,'wholeAfter':a,'addedChildIds':new,'rootWholeDEENNavActualReading':'done; material purposes match company/finance/consumer and existing course/source applicability remains exact'})
assert len(nav)==6;assert sum(len(n['addedChildIds']) for n in nav)==36
views=[];schema=rd(R/'contracts/curriculum-package/v1/composition-view.schema.json');validator=Draft202012Validator(schema,format_checker=FormatChecker());schemaRows=[]
for r in h['all35WholeBeforeAfterViewRows']:
 a=get(r['before']);b=get(r['candidate']);assert a==rd(R/r['activePath'])==rd(C/r['activePath'])
 ids=r['newMaterialIds'];assert len(ids)==r['newReferenceCount'] and set(ids)<=set(rg)
 if ids:
  assert len(a['rootNodes'])==len(b['rootNodes'])==1
  x=copy.deepcopy(b);x['viewId']=a['viewId'];x['rootNodes'][0]['children']=x['rootNodes'][0]['children'][:len(a['rootNodes'][0]['children'])];assert x==a
  def entries(v):
   out=[]
   if isinstance(v,dict):
    if v.get('kind')=='goalEntry':out.append(v)
    for z in v.values():out.extend(entries(z))
   elif isinstance(v,list):
    for z in v:out.extend(entries(z))
   return out
  add=entries(b['rootNodes'][0]['children'][len(a['rootNodes'][0]['children']):]);assert set(e['goalId'] for e in add)==set(ids) and len(add)==len(ids)==len(set(ids));assert all(e['projectionRole']=='target' for e in add)
 else:assert a==b
 if a['scope']['stage']=='CrossStage':
  for label,v in [('before',a),('after',b)]:
   errors=list(validator.iter_errors(v));assert not errors,[(e.json_path,e.message) for e in errors];schemaRows.append({'activePath':r['activePath'],'version':label,'schemaClosedWithFormatChecker':True})
 views.append({'activePath':r['activePath'],'before':r['before'],'candidate':r['candidate'],'newIds':ids,'actualOldWholeOrderedTreePrefixExact':True,'newOnlyDistinctPracticeTargets':True})
assert len(views)==35 and len(schemaRows)==68 and sum(len(v['newIds']) for v in views)==338
shutil.copyfile(R/h['wholeAfterCAN']['path'],C/CAN)
for r in h['all35WholeBeforeAfterViewRows']:shutil.copyfile(R/r['candidate']['path'],C/r['activePath'])
shutil.copyfile(__file__,O/'actual-own-fieldwise633-private-stage.py')
p=save('actual-whole633-foreign-science-status-only-sixNav-and35view-fieldwise-root.json',{'role':'ROOT fieldwise status-nav-scope review; whole body science reuse not new science','authorHandoff':bind(H),'threeQualifiedWholeBodyPackets':science,'wholeBeforeCAN':h['wholeBeforeCAN'],'wholeAfterCAN':h['wholeAfterCAN'],'actualSixWholeNavDecisions':nav,'actual35WholeViewPrefixDecisions':views,'closedSchema68ActualDecisions':schemaRows,'unchanged591OldWholeGoalBodies':591,'all336OriginalOrdinaryBodiesExact':True,'activeWrites':0,'strictNet':0,'humanReleaseTrials':'separate pending'})
print(json.dumps({'fieldwise':p,'privateCAN':str(C/CAN),'goalCount':633,'schemaActual68':len(schemaRows),'navCount':len(nav),'references':338}))
