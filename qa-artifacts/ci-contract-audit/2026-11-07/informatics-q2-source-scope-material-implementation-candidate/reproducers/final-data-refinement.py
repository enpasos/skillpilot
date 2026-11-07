import pathlib,json,copy,os
W=pathlib.Path('/dev/shm/informatics-q2-implementation-20261107');C=W/'candidate';changes=[]
def save(p,d):
 t=p.with_name(p.name+'.private-new');t.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');os.replace(t,p)
for p in (C/'curricula/DE/Gymnasium/composition-views/informatik').glob('*.view.json'):
 v=json.loads(p.read_text());original=copy.deepcopy(v);occ={}
 def walk(ns,labels):
  for n in ns:
   if n.get('goalId') in ['875cb53c-b48d-5b2b-8cb0-e20f27534f16','7ad8caf0-3a31-56f1-bee1-574c01b0c156','010651ba-ddd0-510b-8ed1-e3610031f6e1','70ef7a45-540a-5d8c-b970-19b9f740c40a']:occ[n['goalId']]=(ns,n,labels)
   walk(n.get('children',[]),labels+[n.get('label',n.get('displayLabel',n.get('goalId')))])
 walk(v['rootNodes'],[])
 if '875cb53c-b48d-5b2b-8cb0-e20f27534f16'in occ:
  old,n,labels=occ['875cb53c-b48d-5b2b-8cb0-e20f27534f16'];assert '7ad8caf0-3a31-56f1-bee1-574c01b0c156'in occ;new,base,newlabels=occ['7ad8caf0-3a31-56f1-bee1-574c01b0c156'];old.remove(n);new.insert(new.index(base)+1,n);changes.append({'path':str(p.relative_to(C)),'goalId':n['goalId'],'from':labels,'to':newlabels,'reason':'Actual contains placement follows real automata foundation; full goal meaning preserved. No official state phase equivalence newly asserted.'})
 if '010651ba-ddd0-510b-8ed1-e3610031f6e1'in occ:
  ns,n,labels=occ['010651ba-ddd0-510b-8ed1-e3610031f6e1'];n['displayLabel']='Historische Datenbankprüfungen – voller Altumfang, nach Automaten';q3=next((x for x in ns if x.get('goalId')=='70ef7a45-540a-5d8c-b970-19b9f740c40a'),None)
  if q3:ns.remove(n);ns.insert(ns.index(q3)+1,n)
  changes.append({'path':str(p.relative_to(C)),'goalId':n['goalId'],'from':labels,'to':labels,'reason':'Historic practice bundle retains full41/23 contracts but follows automata preparation. Explicit learner-facing label and order; old canonical title/history unchanged.'})
 if v!=original:save(p,v)
for state,name in [('HE','DE_HE_INFORMATIK_SEKII_KC2024.source-extraction.json'),('SH','DE_SH_INFORMATIK_SEKII_FACHANFORDERUNGEN_2021.source-extraction.json')]:
 p=C/f'curricula/DE/Gymnasium/input/{state}/upper-secondary/source-extraction'/name;d=json.loads(p.read_text());d['repairDraft']['historicalPipelineStatus']=copy.deepcopy(d['pipelineStatus']);steps=d['pipelineStatus'].get('steps',[])
 if steps:
  step=steps[-1];step['status']='incomplete';step.setdefault('checks',[]).append({'id':'20261107-author-repair-independent-source-review','label':'Primary source/level/mapping repair is an author draft pending independent review','passed':False,'details':'No old complete seed or new goal count is accepted as independent approval of changed source evidence.'})
 d['pipelineStatus']['currentStep']='MAPPING-3';d['repairDraft']['historicalQualityReview']=copy.deepcopy(d.get('qualityReview',{}));d['qualityReview']['sourceGoalCountPeerBaseline']={'accepted':False,'details':'Primary-performance extraction changed in a private author draft; old peer baseline remains historical, not approval of the repair.'};save(p,d)
(W/'actual-view-placement-repairs.json').write_text(json.dumps({'status':'private author draft, no new state-course offering acceptance','changes':changes},ensure_ascii=False,indent=2)+'\n');print('viewplacementchanges',len(changes))
