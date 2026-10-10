from pathlib import Path
import json,hashlib,copy,shutil,tempfile
from jsonschema import Draft202012Validator,FormatChecker
R=Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';OLD=Path(Path('/tmp/economics-independent633-root-out-path.txt').read_text().strip());OLDC=Path(Path('/tmp/economics-independent633-root-cap-path.txt').read_text().strip());O=Q/'wirtschaft-current645-company-finance-consumer-labour-independent-combined-scope-root-v1';O.mkdir(exist_ok=True);assert not any(O.iterdir());C=Path(tempfile.mkdtemp(prefix='economics-independent645-root-'))/'capsule';shutil.copytree(OLDC,C,symlinks=True)
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
def rd(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def get(b):
 p=R/b['path'];assert bind(p)==b;return rd(p)
def save(n,x):
 p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
hp=Q/'wirtschaft-current645-company-finance-consumer-labour48-current597-fieldwise-status-nav-scope-author-a-v1/actual-final-current645-company-finance-consumer-labour48-sixNav506-foreign-whole-science-bound.author-handoff.json';h=rd(hp);oh=rd(Q/'wirtschaft-current633-company-finance-consumer36-current597-fieldwise-status-nav-scope-author-a-v1/actual-final-current633-company-finance-consumer36-sixNav338-foreign-whole-science-bound.author-handoff.json');before=get(oh['wholeAfterCAN']);after=get(h['wholeAfterCAN']);assert before==rd(C/CAN);bg={g['id']:g for g in before['goals']};ag={g['id']:g for g in after['goals']};new=set(ag)-set(bg);assert len(bg)==633 and len(ag)==645 and len(new)==12
assert get(h['wholeBeforeCAN'])==rd(R/CAN)
science=get(h['labourForeignScienceReceipt']);draft=get(science['wholeFinalTwelveDRAFT']);draft=draft['materials'] if isinstance(draft,dict) else draft;assert len(draft)==12
for d in draft:
 a=copy.deepcopy(ag[d['id']]);assert d['id'] in new and a['examData']['reviewStatus']=='released';note=a['examData'].pop('reviewNote');assert h['labourForeignScienceReceipt']['path'] in note and 'keine menschliche Freigabe behauptet' in note;a['examData']['reviewStatus']='draft';assert a==d
nav=[]
for id,b in bg.items():
 a=ag[id]
 if a==b:continue
 fields=sorted(k for k in set(a)|set(b) if a.get(k)!=b.get(k));assert fields==['contains','description','descriptionEn'];assert a['contains'][:len(b['contains'])]==b['contains'];add=a['contains'][len(b['contains']):];assert add and set(add)<=new and len(add)==len(set(add));nav.append({'goalId':id,'fields':fields,'wholeBefore633':b,'wholeAfter645':a,'addedChildIds':add,'actualRootWholeDEENPurposeReview':'done; labour material purposes/source/course scope and existing whole prerequisites remain truthful'})
assert len(nav)==3 and sum(len(n['addedChildIds']) for n in nav)==12
vold={v['activePath']:v for v in oh['all35WholeBeforeAfterViewRows']};views=[];validator=Draft202012Validator(rd(R/'contracts/curriculum-package/v1/composition-view.schema.json'),format_checker=FormatChecker());schemas=[]
def entries(x):
 out=[]
 if isinstance(x,dict):
  if x.get('kind')=='goalEntry':out.append(x)
  for a in x.values():out.extend(entries(a))
 elif isinstance(x,list):
  for a in x:out.extend(entries(a))
 return out
for r in h['all35WholeBeforeAfterViewRows']:
 b=get(vold[r['activePath']]['candidate']);a=get(r['candidate']);assert b==rd(C/r['activePath']);assert get(r['before'])==rd(R/r['activePath']);oldids=set(vold[r['activePath']]['newMaterialIds']);addids=set(r['newMaterialIds'])-oldids;assert addids<=new
 if addids:
  x=copy.deepcopy(a);x['viewId']=b['viewId'];x['rootNodes'][0]['children']=x['rootNodes'][0]['children'][:len(b['rootNodes'][0]['children'])];assert x==b
  add=entries(a['rootNodes'][0]['children'][len(b['rootNodes'][0]['children']):]);assert set(e['goalId'] for e in add)==addids and len(add)==len(addids) and all(e['projectionRole']=='target' for e in add)
 else:
  x=copy.deepcopy(a);x['viewId']=b['viewId'];assert x==b
 if a['scope']['stage']=='CrossStage':
  errors=list(validator.iter_errors(a));assert not errors,[(e.json_path,e.message) for e in errors];schemas.append({'activePath':r['activePath'],'645ClosedSchemaErrors':0})
 views.append({'activePath':r['activePath'],'whole633Before':vold[r['activePath']]['candidate'],'whole645After':r['candidate'],'additionalLabourPracticeTargets':sorted(addids),'actualExistingWholeOrderedTreePrefixExact':True})
assert len(schemas)==34 and sum(len(v['additionalLabourPracticeTargets']) for v in views)==168
ids=sorted(set(ag)-set(g['id'] for g in get(h['wholeBeforeCAN'])['goals']));assert len(ids)==48;save('whole-new48-material-ids.for-independent-native.json',ids)
helper=Path('/tmp/economics-independent633-native-root.mts').read_text().replace("const reviewedIds:string[]=read(join(out,'whole-new36-material-ids.for-independent-native.json'));","const reviewedIds:string[]=read(join(out,'whole-new48-material-ids.for-independent-native.json'));")
helper=helper.replace("import assert from 'node:assert/strict';","import assert from 'node:assert/strict';\nimport { goalMatchesFilters } from './app/src/utils/goalFilters.ts';")
helper=helper.replace('const course=m.wholeGoal.tags.includes(s.courseProfile);','const course=goalMatchesFilters(m.wholeGoal,[s.courseProfile,s.durationModel].filter(Boolean));')
(C/'native-root645.mts').write_text(helper);(O/'actual-own-native-observer-helper-645.mts').write_text(helper)
shutil.copyfile(R/h['wholeAfterCAN']['path'],C/CAN)
for r in h['all35WholeBeforeAfterViewRows']:shutil.copyfile(R/r['candidate']['path'],C/r['activePath'])
shutil.copyfile(__file__,O/'actual-own-fieldwise633-to645-private-stage.py')
freeze=rd(OLD/'actual-physical-private597-baseline-current-whole-input-endguards.root.json');assert all(bind(R/g['path'])==g for g in freeze['activeGuards'])
save('actual-whole645-twelve-status-only-three-sharedNav35view-followup-and-current-guards.root.json',{'role':'ROOT independent645 scope followup; foreign labour whole science reused','whole645AuthorHandoff':bind(hp),'wholeRoot633ForeignScopeKEEP':bind(OLD/'actual-final-current633-company-finance-consumer36-combined-scope-nav-independent-KEEP.handoff.receipt.json'),'labourWholeScienceSeal':h['labourForeignScienceReceipt'],'labourActualQualifiedDraftBody':science['wholeFinalTwelveDRAFT'],'actualThreeWholeSharedNavFollowupDecisions':nav,'actual35WholeViewFollowupRows':views,'actual34Whole645ClosedSchemas':schemas,'all630ExistingNonNavWhole633GoalsExact':True,'allOriginal1410InputGuardsExact':True,'actualNewLabourRefs':168,'nativeCourseFilter':'actual production goalMatchesFilters including empty course tags; no course inferred from phase','privateCAP':str(C),'activeWrites':0,'strictNet':0})
Path('/tmp/economics-independent645-root-cap-path.txt').write_text(str(C)+'\n');Path('/tmp/economics-independent645-root-out-path.txt').write_text(str(O)+'\n');print(json.dumps({'cap':str(C),'out':str(O),'goalCount':645,'refsAdded':168,'schema':34}))
