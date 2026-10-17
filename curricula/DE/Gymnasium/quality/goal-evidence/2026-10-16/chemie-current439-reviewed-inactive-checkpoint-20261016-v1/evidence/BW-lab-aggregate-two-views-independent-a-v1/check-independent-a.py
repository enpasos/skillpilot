from pathlib import Path
import json,hashlib,copy,datetime
from jsonschema import Draft202012Validator
R=Path.cwd();O=R/'tmp/chemie-m7-resumed-20261016/BW-lab-aggregate-two-views-independent-a-v1';A=R/'tmp/chemie-m7-resumed-20261016/BW-lab-aggregate-existing-child-acquisition-author-v1';K=R/'tmp/chemie-m7-resumed-20261016/chemie-shared640-recycling-native-author-capsule-L6-v1'
rd=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();pin=lambda p:{'path':str(p.relative_to(R)),'sha256':sha(p)}
s=A/'OUTPUTS.finite-two-BW-views.AUTHOR.inactive.selector.json';assert sha(s)=='f56548f16d1e3d497285991fde36959205bdc7b1a5e8d5567e2c9dc82aa8e60d'
selector=rd(s);verified=[]
def refs(x):
 if isinstance(x,dict):
  if 'path'in x and 'sha256'in x:
   p=R/x['path'];assert sha(p)==x['sha256'],str(p);assert 'bytes'not in x or p.stat().st_size==x['bytes'];verified.append(pin(p))
  for v in x.values():refs(v)
 elif isinstance(x,list):
  for v in x:refs(v)
refs(selector)
cas=rd(A/'CAS.two-whole-BW-views.existing-lab-aggregate-only.AUTHOR.inactive.json');refs(cas)
assert len(cas['wholeFileReplacements'])==2
assert {x['targetPath']for x in cas['wholeFileReplacements']}=={'curricula/DE/Gymnasium/composition-views/chemie/de-bw-gk.view.json','curricula/DE/Gymnasium/composition-views/chemie/de-bw-lk.view.json'}
can=K/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';sem=K/'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
assert sha(can)==cas['baseCanonicalSHA256']==selector['baseCanonicalSHA256'];assert sha(sem)==cas['baseSemanticKindsSHA256']==selector['baseSemanticKindsSHA256']
schemaPath=K/'contracts/curriculum-package/v1/composition-view.schema.json';schema=rd(schemaPath);Draft202012Validator.check_schema(schema);validator=Draft202012Validator(schema)
rows=[]
for row in cas['wholeFileReplacements']:
 b=R/row['beforeWhole']['path'];a=R/row['afterWhole']['path'];live=K/row['targetPath']
 assert b.read_bytes()==live.read_bytes();assert sha(live)==row['expectedCurrentSHA256']
 before=rd(b);after=rd(a);expect=copy.deepcopy(before);expect['rootNodes'][0]['children'].append({'kind':'canonicalSubtree','goalId':'266a2b2a-9ee2-52f6-ae09-59343da9a60b','projectionRole':'prerequisiteOnly'})
 assert expect==after
 assert len(after['rootNodes'][0]['children'])==len(before['rootNodes'][0]['children'])+1
 errors=[]
 for side,p in [('before',b),('after',a)]:
  e=[{'path':list(x.path),'message':x.message}for x in validator.iter_errors(rd(p))];assert not e;e2=rd(p);assert e2['scope']['jurisdiction']=='DE-BW';errors.append({'side':side,**pin(p),'errors':e})
 rows.append({'targetPath':row['targetPath'],'capsuleBeforeByteExact':True,'onlyDelta':'append existing 266a canonicalSubtree prerequisiteOnly at rootNodes[0].children; complete other JSON deep equality verified','schemas':errors})
x=rd(A/'INPUT.six-whole-goals-two-current-whole-profiles-and-two-DE-EN-material-cases.exact.json');canon=rd(can);by={g['id']:g for g in canon['goals']};assert all(by[g['id']]==g for g in x['wholeGoals'])
ps=R/x['currentWholeProfilesSource']['path'];assert sha(ps)==x['currentWholeProfilesSource']['sha256'];profiles=[json.loads(s)for s in ps.read_text().splitlines()if s.strip()];assert all(p in profiles for p in x['currentWholeProfiles'])
ms=R/x['wholeLinkedMaterialSource']['path'];assert sha(ms)==x['wholeLinkedMaterialSource']['sha256'];materials=rd(ms)
def find(v,key,value):
 if isinstance(v,dict):
  if v.get(key)==value:return[v]
  return sum((find(y,key,value)for y in v.values()),[])
 if isinstance(v,list):return sum((find(y,key,value)for y in v),[])
 return[]
assert all(c in find(materials,'caseId',c['caseId'])for c in x['wholeLinkedMaterialCases'])
r={'documentType':'independent-A-executed-finite-whole-CAS-schema-body-check','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authorSelector':pin(s),'schema':pin(schemaPath),'sourceAndWholeBodyMatches':{'sixGoalsCurrent':True,'twoCompleteProfilesCurrent':True,'twoCompleteLinkedDEENMaterials':True},'allAuthorSelectorDeclaredFileHashesAndSizesVerified':verified,'rows':rows,'canonical':pin(can),'semanticKinds':pin(sem),'readOnlyCapsule':True,'PASS':True}
p=O/'CHECK.independent-a.whole-CAS-schema-and-body-retention.json';p.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'PASS':True,'wholeFileReplacements':len(rows),'schemas':4,'currentWholeGoals':6,'currentProfiles':2,'materialCases':2,'file':pin(p)}))
