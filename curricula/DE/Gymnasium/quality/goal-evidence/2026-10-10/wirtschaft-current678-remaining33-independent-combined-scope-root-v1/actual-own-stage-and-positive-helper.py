from pathlib import Path
import json,hashlib,copy,shutil,subprocess,time
from jsonschema import Draft202012Validator,FormatChecker
R=Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
C=Path(Path('/tmp/economics-independent678-root-cap-path.txt').read_text().strip())
O=Q/'wirtschaft-current678-remaining33-independent-combined-scope-root-v1';O.mkdir(exist_ok=True);assert not any(O.iterdir())
I=Q/'wirtschaft-current678-international-operations-policy33-current645-fieldwise-status-nav-scope-author-a-v1/actual-fieldwise678-foreign33-fiveNav359-references-author-index.json'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
def rd(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def get(b):
 p=R/b['path'];assert bind(p)==b,b['path'];return rd(p)
def save(n,x):
 p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
i=rd(I);before=get(i['wholeBeforeCAN']);after=get(i['wholeAfterCAN']);assert before==rd(C/CAN)==rd(R/CAN)
bg={g['id']:g for g in before['goals']};ag={g['id']:g for g in after['goals']};new=set(ag)-set(bg)
assert len(bg)==645 and len(ag)==678 and len(new)==33 and new==set(i['newMaterialIds'])
scientific=[]
for key,bodykey,count in [('internationalScienceReceipt','actualReviewedWhole12Body',12),('operationsScienceReceipt','actualReviewedWhole14FinalBody',14),('policyScienceReceipt','wholeFinalReviewedSevenDRAFT',7)]:
 h=get(i[key]);body=get(h[bodykey]);body=body['materials'] if isinstance(body,dict) else body;assert len(body)==count
 for g in body:
  a=copy.deepcopy(ag[g['id']]);assert g['id'] in new and a['examData']['reviewStatus']=='released'
  note=a['examData'].pop('reviewNote');assert i[key]['sha256'][:12] in note
  assert ('Keine menschliche Freigabe oder Erprobung' in note or 'Menschliche Prüfung, Freigabe und Erprobung bleiben getrennt' in note)
  a['examData']['reviewStatus']='draft';assert a==g,g['id']
 scientific.append({'qualifiedWholeScience':i[key],'qualifiedWholeDEENBody':h[bodykey],'wholeBodyCount':count,'actualOnlyReleasedStatusAndScienceBoundReviewNoteChanged':True})
nav=[]
for gid,b in bg.items():
 a=ag[gid]
 if a==b:continue
 fields=sorted(k for k in set(a)|set(b) if a.get(k)!=b.get(k))
 phase=b.get('phase',b.get('dimensionTags',{}).get('phase'))
 expected=['contains','description','descriptionEn'] if phase!='Q4' else ['applicability','contains','description','descriptionEn']
 assert fields==expected,(gid,fields)
 assert a['contains'][:len(b['contains'])]==b['contains'];added=a['contains'][len(b['contains']):]
 assert added and set(added)<=new and len(set(added))==len(added)
 if phase=='Q4':assert set(a['applicability']['jurisdiction'])-set(b['applicability']['jurisdiction'])=={'DE-HB'} and set(b['applicability']['jurisdiction'])<=set(a['applicability']['jurisdiction'])
 nav.append({'goalId':gid,'wholeBefore645':b,'wholeAfter678':a,'actualFields':fields,'wholeNewChildIds':added,'actualRootWholeDEENPurposeRead':'all five whole before/after descriptions read; independent reviewer also assigned; no ordinary competence approval'})
assert len(nav)==5 and sum(len(x['wholeNewChildIds']) for x in nav)==33
validator=Draft202012Validator(rd(R/'contracts/curriculum-package/v1/composition-view.schema.json'),format_checker=FormatChecker())
views=[];schemas=[]
def entries(x):
 out=[]
 if isinstance(x,dict):
  if x.get('kind')=='goalEntry':out.append(x)
  for a in x.values():out.extend(entries(a))
 elif isinstance(x,list):
  for a in x:out.extend(entries(a))
 return out
for row in i['viewRows']:
 b=get(row['before']);a=get(row['candidate']);assert b==rd(C/row['activePath'])==rd(R/row['activePath'])
 added=a['rootNodes'][0]['children'][len(b['rootNodes'][0]['children']):]
 assert a['rootNodes'][0]['children'][:len(b['rootNodes'][0]['children'])]==b['rootNodes'][0]['children']
 x=copy.deepcopy(a);x['viewId']=b['viewId'];x['rootNodes'][0]['children']=copy.deepcopy(b['rootNodes'][0]['children']);assert x==b,row['activePath']
 refs=entries(added);assert len(refs)==row['newReferenceCount']
 assert all(e['goalId'] in new and e['projectionRole']=='target' for e in refs)
 assert sorted(e['goalId'] for e in refs)==sorted(row['newMaterialIds'])
 if a['scope']['stage']=='CrossStage':
  errors=list(validator.iter_errors(a));assert not errors,[(e.json_path,e.message) for e in errors]
  schemas.append({'activePath':row['activePath'],'actualWhole678SchemaErrors':0})
 views.append({'activePath':row['activePath'],'before':row['before'],'candidate':row['candidate'],'actualNewPracticeTargetIDs':row['newMaterialIds'],'actualWholeExistingTreePrefixRolesSourceScopeExact':True})
assert len(views)==35 and len(schemas)==34 and sum(len(v['actualNewPracticeTargetIDs']) for v in views)==359
assert sum(len(v['actualNewPracticeTargetIDs']) for v in views if '/de-de-' in v['activePath'])==0
runtimeValidator=Draft202012Validator(rd(R/'docs/landscape-runtime.schema.json'));errors=list(runtimeValidator.iter_errors(after));assert not errors,[(e.json_path,e.message) for e in errors]
save('whole-new33-material-ids.for-independent-native.json',sorted(new))
helper=(C/'native-root645.mts').read_text().replace('whole-new48-material-ids.for-independent-native.json','whole-new33-material-ids.for-independent-native.json')
(C/'native-root678.mts').write_text(helper);(O/'actual-own-native-observer-helper-678.mts').write_text(helper)
guards=rd(C.parent/'actual-current645-physical-input-frame.root.json');assert all(bind(R/g['path'])==g for g in guards['baseline645WholeInputs']);assert bind(R/guards['activeSEM']['path'])==guards['activeSEM']
save('actual-independent-current645-physical-guards-and678-fieldwise-science-nav-views-stage.root.json',{'role':'ROOT independent whole fieldwise review and private scope staging; no active writes','authorIndex':bind(I),'physical645Inputs':guards['baseline645WholeInputs'],'activeSEM':guards['activeSEM'],'scientificQualifiedWholeBodyReuse':scientific,'fiveActualWholeNavPurposeReads':nav,'all640OtherWhole645GoalsExact':True,'actual35WholeViewPrefixDecisions':views,'actual34ClosedCompositionSchemas':schemas,'actualWhole678RuntimeSchemaErrors':0,'ownPresealGuardHistory':'First setup stopped before artifacts and private writes: guard incorrectly demanded identical reviewNote phrasing and full-path binding. Actual notes use qualified science SHA prefixes or full SHA/path and explicitly retain separate human gates. Guard corrected to inspect those existing truthful bindings; bodies unchanged.','newScienceApprovals':0,'strictNet':0,'activeWrites':0})
shutil.copyfile(__file__,O/'actual-own-stage-and-positive-helper.py')
node=Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip();commands=[]
for label in ['actual-before645-independent-root','actual-after678-independent-root']:
 if 'after678' in label:
  shutil.copyfile(R/i['wholeAfterCAN']['path'],C/CAN)
  for v in views:shutil.copyfile(R/v['candidate']['path'],C/v['activePath'])
 start=time.monotonic()
 with (O/(label+'.stdout.txt')).open('w') as out,(O/(label+'.stderr.txt')).open('w') as err:
  r=subprocess.run([node,'app/node_modules/tsx/dist/cli.mjs','native-root678.mts',str(C),str(O),str(R),label],cwd=C,stdout=out,stderr=err)
 assert r.returncode==0,(label,(O/(label+'.stderr.txt')).read_text())
 commands.append({'label':label,'actualExit':r.returncode,'seconds':time.monotonic()-start,'stdout':bind(O/(label+'.stdout.txt')),'stderr':bind(O/(label+'.stderr.txt')),'raw':bind(O/(label+'.raw.json.gz')),'summary':bind(O/(label+'.summary.json'))})
 print(label,'actualExit',r.returncode,(O/(label+'.summary.json')).read_text(),flush=True)
save('actual-two-fresh-645-baseline-and678-positive-native-commands.root.json',{'commands':commands,'activeWrites':0})
Path('/tmp/economics-independent678-root-out-path.txt').write_text(str(O)+'\n')
