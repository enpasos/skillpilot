#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Only this author package/CAS, actual retained inputs and bounded schemas."""
import copy,hashlib,importlib.util,json,pathlib,subprocess,jsonschema,datetime
ROOT=pathlib.Path(__file__).resolve().parents[7];BASE=pathlib.Path(__file__).resolve().parent;REL=BASE.relative_to(ROOT).as_posix();checks=[]
def read(p):return json.loads((ROOT/p).read_text())
def objsha(o):return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
 p=ROOT/p;b=p.read_bytes();return {'path':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def ok(name,condition):
 checks.append({'check':name,'passed':bool(condition)});assert condition,name
ls=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');after=read(REL+'/candidates/landscape.after.INACTIVE.json');cas=read(REL+'/candidates/goals.whole-before-after.CAS.pending.json');gid=cas['records'][1]['goalId'];by={g['id']:g for g in ls['goals']};ap=copy.deepcopy(ls)
for row in cas['records']:
 b=by.get(row['goalId']);ok('whole goal before '+row['goalId'],b==row['before']);ok('whole goal after hash '+row['goalId'],objsha(row['after'])==row['afterObjectSHA256'])
 if b is None:ap['goals'].append(row['after'])
 else:ap['goals'][next(i for i,g in enumerate(ap['goals']) if g['id']==row['goalId'])]=row['after']
ok('whole canonical CAS produces inactive candidate',ap==after);ok('one new ordinary atom only',len(after['goals'])==738 and cas['ordinaryAtomCountAfter']==451)
jsonschema.validate(after,read('docs/landscape-runtime.schema.json'));ok('whole inactive runtime schema',True)
profileRows=[json.loads(l) for l in (BASE/'candidates/P.one-whole-profile.pending.jsonl').read_text().splitlines() if l.strip()];ok('exactly one new whole P',len(profileRows)==1 and profileRows[0]['goalId']==gid);p=profileRows[0];jsonschema.validate(p,read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));ok('whole P schema',True);ok('only AI candidate no approval',p['status']=='needs_human_review' and p['reviewAuthority']=='ai_candidate');ok('whole P body equals actual materialized input',p['profile']==read(REL+'/candidates/P.one-candidate-set.pending.json')['goals'][0]['profile'])
for entry in p['profile']['applicationCaseBriefs']:
 for key in ['taskDemandDe','taskDemandEn','expectedPerformanceDe','expectedPerformanceEn']:ok('bounded and nonclipped whole P case '+entry['id']+'/'+key,len(entry[key])<=2000 and entry[key].strip()==entry[key])
(BASE/'operations/P.one-whole-before-after.CAS.pending.json').write_text(json.dumps({'role':'INACTIVE new owner proposal; no active selection/config mutation','goalId':gid,'before':None,'after':p,'afterObjectSHA256':objsha(p),'existing450ProfilesUnchanged':True,'normalActivation':False},ensure_ascii=False,indent=2)+'\n')
inputs=read(REL+'/inputs/build.actual-input-pins.json')['pins'];actualpins={}
for r in inputs:ok('current exact build input '+r['path'],pin(r['path'])==r);actualpins[r['path']]=r
whole=read(REL+'/inputs/whole-current-reuse-candidates-and-P.EXACT.json')
for g in whole['goals']:ok('whole current reuse goal unchanged '+g['id'],by[g['id']]==g)
for r in whole['wholeSelectedPRecords']:
 actual=json.loads((ROOT/r['recordPath']).read_text().splitlines()[r['line']-1]);ok('whole selected reuse P unchanged '+r['record']['goalId'],actual==r['record'])
discovery=read(REL+'/inputs/current450-P-discovery-provenance.EXACT.json');ok('discovery exact450 distinct P',discovery['count']==450 and len({r['goalId'] for r in discovery['selectedRecords']})==450)
for r in discovery['rawFilePins']:ok('discovery current raw pin '+r['path'],pin(r['path'])==r);actualpins[r['path']]=r
for r in discovery['selectedRecords']:
 actual=json.loads((ROOT/r['recordPath']).read_text().splitlines()[r['line']-1]);ok('discovery exact selected P '+r['goalId'],actual['goalId']==r['goalId'] and objsha(actual)==r['wholeRecordObjectSHA256'])
src=read(REL+'/operations/source.two-existing-contributions.whole-CAS.pending.json');m=read(src['input']['path']);ok('source full-file before guard',pin(src['input']['path'])==src['input']);ops=src['operations'];ok('only2 mappings and2 whole decisions',len(ops)==4 and {r['pointer'] for r in ops}=={'/mappings/432','/mappings/1195','/decisions/68','/decisions/207'})
for r in ops:
 _,key,idx=r['pointer'].split('/');b=m[key][int(idx)];ok('source CAS before '+r['pointer'],b==r['before'] and objsha(b)==r['beforeObjectSHA256']);ok('source CAS after '+r['pointer'],objsha(r['after'])==r['afterObjectSHA256'])
 if key=='mappings':ok('new source partial only '+idx,r['after']['matchType']=='partial' and r['after']['canonicalGoalId']==gid)
 else:ok('source remaining9 carriers unchanged '+idx,[x for x in b['canonicalGoalIds'] if x!='8721d943-8368-5304-bd3c-7d7944099662']==[x for x in r['after']['canonicalGoalIds'] if x!=gid] and len(r['after']['canonicalGoalIds'])==10 and 'reviewer' not in r['after'] and 'reviewedAt' not in r['after'])
for r in read(REL+'/operations/views.two-whole-CAS.pending.json')['wholeViewBeforeAfter']:ok('whole exact view CAS '+r['viewId'],read(r['path'])==r['before'] and pin(r['path'])==r['input'] and objsha(r['after'])==r['afterObjectSHA256'])
bind=read(REL+'/candidates/material-bindings.exact.pending.json')
for r in bind['materials']:ok('whole material exact hash '+r['path'],pin(r['path'])==r)
empty=read(REL+'/materials/observation-protocol.EMPTY.DE-EN.json')
def allnull(v):return all(allnull(x) for x in v.values()) if isinstance(v,dict) else all(allnull(x) for x in v) if isinstance(v,list) else v is None
for key in ['localRelease','actualConditions','initialState','endComparison','ownActions','returnAndDisposal','interpretation','freshPaperTransfer']:ok('empty actual evidence '+key,allnull(empty[key]))
for r in empty['observations']:ok('empty actual observations nominal'+str(r['nominalTimeMin']),allnull({k:v for k,v in r.items() if k!='nominalTimeMin'}))
oldseal='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-recycling-atomicity-source-author-20261018-v1/SEAL.author-candidate.pending-independent-review.json';seal=read(oldseal);actualpins[oldseal]=pin(oldseal)
for r in seal['outputs']:ok('original recycling author untouched '+r['path'],pin(r['path'])==r);actualpins[r['path']]=r
native=read(REL+'/checks/CHECK.native41-views-both-DAGs.actual.json');ok('actual native41 two targets all old semantics retained',native['allChemistryViews']==41 and native['allOtherNewRolesAbsent'] and not native['failures'] and len(native['newTargetViewIds'])==2)
for key,r in native['graphs'].items():ok('actual native DAG '+key,not r['cycles'] and not r['missing'])
spec=importlib.util.spec_from_file_location('validate',ROOT/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);symlink=module.curriculum_symlink_errors(ROOT);ok('AGENTS7.4 curriculum symlink portability',not symlink)
parsed=[]
for f in sorted(BASE.rglob('*')):
 if f.suffix=='.json':json.loads(f.read_text());parsed.append(f.relative_to(ROOT).as_posix())
 elif f.suffix=='.jsonl':
  for line in f.read_text().splitlines():
   if line.strip():json.loads(line)
  parsed.append(f.relative_to(ROOT).as_posix())
ok('no complete PDF page or raw source document committed in this package',not list(BASE.rglob('*.pdf')) and not list(BASE.rglob('*.html')) and all(f.parent.name=='checks' for f in BASE.rglob('*.txt')))
normaldiff=subprocess.check_output(['git','diff','--name-only'],cwd=ROOT,text=True);ok('tracked normal files unchanged',not normaldiff.strip());ok('expected actual current HEAD',subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()=='41a37acd0016c7ac9613edb87de283e5a918f543')
report={'role':'AUTHOR bounded actual consistency check only; not independent content approval/full check','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'newGoalId':gid,'checksPassed':len(checks),'failures':[],'checks':checks,'allWrittenJSONandJSONLParsed':parsed,'curriculumSymlinkErrors':symlink,'newTargetViews':native['newTargetViewIds'],'officialDutyDeletion':False,'normalWrites':False,'fullCheckRun':False,'localPretestOrLearnerExecutionClaim':False,'independentOrHumanApproval':False}
(BASE/'checks/CHECK.bounded-CAS-schema-pins-portability.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');(BASE/'inputs/final-current-and-original-input-pins.json').write_text(json.dumps({'role':'Actual current selected discovery/raw normal inputs and unchanged original author artifacts','pins':list(actualpins.values())},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'checksPassed':len(checks),'newGoalId':gid,'newTargetViews':native['newTargetViewIds'],'newOrdinaryAtoms':1,'normalWrites':False,'fullCheck':False}))
