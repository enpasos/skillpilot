"""Verify the finite H dossier. All review gates remain native and unchanged."""
from pathlib import Path
import argparse,subprocess,json,hashlib,re,collections,sys
ap=argparse.ArgumentParser();ap.add_argument('--repo',type=Path,required=True);ap.add_argument('--dossier',type=Path);ap.add_argument('--anchor');ap.add_argument('--external-root',action='append',default=[]);ap.add_argument('--native',action='store_true');ap.add_argument('--legacy-a492',action='store_true');a=ap.parse_args();R=a.repo.resolve();D=a.dossier or R/'curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/quality/record-lifecycle-v1';M=json.loads((D/'record-lifecycle.actual.json').read_text());originDoc=json.loads((D/'binding-origins.actual.json').read_text());bindings=[json.loads(l)for l in(D/'raw-bindings.actual.jsonl').read_text().splitlines()if l];fields=[json.loads(l)for l in(D/'value-digest-contracts.actual.jsonl').read_text().splitlines()if l]
# Finite compact table schemas are declared by the manifest; all record paths remain explicit there.
if bindings and isinstance(bindings[0],list):bindings=[{'record':M['records'][x[0]]['path'],'pointer':x[1],'recordedPath':x[2],'sha256':x[3],'format':x[4],'status':x[5],'origin':x[6]}for x in bindings]
if fields and isinstance(fields[0],list):fields=[{'record':M['records'][x[0]]['path'],'pointer':x[1],'sha256':x[2],'contract':M['compactTableSchema']['digestContracts'][x[3]]}for x in fields]
def fail(s):raise RuntimeError(s)
def check(v,s):
 if not v:fail(s)
def sha(b):return hashlib.sha256(b).hexdigest()
def git(*args):return subprocess.check_output(['git',*args],cwd=R)
roots={'repo':R}
for entry in a.external_root:
 name,path=entry.split('=',1);check(name not in roots,'duplicate root alias');roots[name]=Path(path).resolve()
def locate(v):
 check(v['root']in roots,'External root required: '+v['root']);p=roots[v['root']]/v['path'];check(p.resolve().is_relative_to(roots[v['root']]),'Root escape');return p
if a.legacy_a492:
 ref='a4923a80928e4211c02fb53feaadad2054a3fb94';base=M['baselineCommit'];cache={};treePaths={x.split('\t',1)[1]for x in git('ls-tree','-r',ref).decode().splitlines()}
 def oldread(p):
  if p not in cache:cache[p]=git('show',ref+':'+p)
  return cache[p]
 paths=[p for p in git('diff','--name-only','--diff-filter=AM',base,ref).decode().splitlines()if p.endswith('.json')];pairs=[]
 def oldwalk(v):
  if isinstance(v,dict):
   if isinstance(v.get('path'),str):
    for k in ['sha256','digest']:
     if isinstance(v.get(k),str)and re.fullmatch(r'(?:sha256:)?[0-9a-fA-F]{64}',v[k]):pairs.append((v['path'],v[k].removeprefix('sha256:').lower()))
   for x in v.values():oldwalk(x)
  elif isinstance(v,list):
   for x in v:oldwalk(x)
 counts=collections.Counter();external=0
 import posixpath
 for p in paths:
  pairs=[];oldwalk(json.loads(oldread(p)))
  for target,h in pairs:
   candidates=[];parent=Path(p).parent
   while True:
    candidate=posixpath.normpath(str(parent/target))
    if candidate in treePaths:candidates.append(candidate)
    if str(parent)=='.':break
    parent=parent.parent
   if any(sha(oldread(q))==h for q in candidates):counts['match']+=1
   elif candidates:counts['mismatch']+=1
   elif target.startswith('/tmp/e2-h-views/')and 'viewsScratch'in roots:
    actual=roots['viewsScratch']/target.removeprefix('/tmp/e2-h-views/');check(actual.is_file()and sha(actual.read_bytes())==h,'Legacy external diagnostic drift');counts['match']+=1;external+=1
   else:counts['missing']+=1
 check(len(paths)==652 and dict(counts)=={'match':1463,'mismatch':97,'missing':77}and external==13,'Legacy a492 reproduction drift '+str(counts));print(json.dumps({'legacyJSONLiteralAM':len(paths),'claimJSON':651,'match':1463,'mismatch':97,'missing':77,'absoluteExternalMatches':external,'jsonCountDifferenceDisclosed':1}))
records={r['path']:r for r in M['records']};check(len(records)==len(M['records']),'Duplicate record path');bootstrap=M.get('bootstrapPaths',[]);scope=set()
head=a.anchor or git('rev-parse','HEAD').decode().strip()
for c in git('rev-list','--first-parent',M['baselineCommit']+'..'+head).decode().split():
 if len(git('rev-list','--parents','-n','1',c).decode().split())==2:scope.update(git('diff-tree','--no-commit-id','--name-only','-r',c).decode().splitlines())
if not a.anchor:scope.update(git('diff','--name-only','HEAD').decode().splitlines());scope.update(git('ls-files','--others','--exclude-standard').decode().splitlines())
check(scope-set(records)-set(bootstrap)==set(),'Unclassified H paths: '+str(sorted(scope-set(records)-set(bootstrap))))
for p,r in records.items():
 check(r['lifecycle']in{'current','earlier_state'},'Unclassified lifecycle '+p)
 if not r['present']:check(not(R/p).exists(),'Removed file reappeared '+p);continue
 b=(R/p).read_bytes();check(len(b)==r['bytes']and sha(b)==r['sha256'],'Record bytes changed '+p)
 if r['lifecycle']=='earlier_state':check(bool(r.get('successorPath'))and bool(r.get('preservationEpoch')),'Earlier record missing epoch/successor '+p);check(r['successorPath']in records or r['successorPath']in bootstrap or(R/r['successorPath']).is_file(),'Missing successor '+p)
for p in bootstrap:
 physical=(D/Path(p).name)if a.dossier else(R/p)
 check(physical.is_file(),'Missing finite bootstrap '+p)
 if a.anchor:check(git('show',a.anchor+':'+p)==(R/p).read_bytes(),'Dossier differs from Git anchor '+p)
documents={}
def record_pointer(record,ptr):
 if record not in documents:
  raw=(R/record).read_bytes();documents[record]=[json.loads(l)if l.strip()else None for l in raw.splitlines()]if record.endswith('.jsonl')else json.loads(raw)
 v=documents[record];parts=ptr.split('/')[1:]
 if parts and parts[0].startswith('@line'):v=v[int(parts.pop(0)[5:])-1]
 for part in parts:
  key=part.replace('~1','/').replace('~0','~');v=v[int(key)]if isinstance(v,list)else v[key]
 return v
origins={v['id']:v for v in originDoc['origins']};checked=set();outside=collections.Counter();unavailable=0;nativeValues=[]
for b in bindings:
 check(b['record']in records,'Binding outside classified inventory');r=records[b['record']];o=origins[b['origin']];kind=o['kind']
 check(b['sha256']==o['sha256'],'Binding digest differs from origin')
 literal=record_pointer(b['record'],b['pointer']);check(isinstance(literal,str)and literal.removeprefix('sha256:').lower()==b['sha256'],'Binding pointer does not name its digest')
 if kind in{'historical_git_raw_file','historical_recovered_raw_file','historical_unavailable'}:check(r['lifecycle']=='earlier_state','Falsely current historical binding '+b['record']+b['pointer'])
 if kind=='historical_unavailable':check(o.get('currentApprovalClaim')is False and o.get('rawShaWasReproduced')is False and o.get('epochStep')and o.get('successorPath'),'Unavailable historical binding not explicit');unavailable+=1;continue
 if b['origin']in checked:continue
 checked.add(b['origin'])
 if kind=='historical_git_raw_file':raw=git('show',o['commit']+':'+o['path']);expected=o['sha256']
 else:
  p=locate(o['location']);raw=p.read_bytes();expected=o.get('rawSha256',o['sha256']);outside[o['location']['root']]+=o['location']['root']!='repo'
 check(sha(raw)==expected,'Origin byte hash mismatch '+str(o));check(len(raw)==o['bytes'],'Origin length mismatch '+str(o))
 if kind=='native_parsed_value':nativeValues.append(o)
# Every 64hex leaf in every structured record is explicit; no path is inferred from a digest literal.
hex64=re.compile(r'^(?:sha256:)?([0-9a-fA-F]{64})$');actual=[]
def walk(record,v,ptr=''):
 if isinstance(v,dict):
  for k,x in v.items():
   p=ptr+'/'+str(k).replace('~','~0').replace('/','~1')
   if isinstance(x,str)and hex64.fullmatch(x):actual.append((record,p,hex64.fullmatch(x).group(1).lower()))
   walk(record,x,p)
 elif isinstance(v,list):
  for i,x in enumerate(v):walk(record,x,ptr+'/'+str(i))
for p,r in records.items():
 if not r['present']or not p.endswith(('.json','.jsonl')):continue
 raw=(R/p).read_bytes()
 if p.endswith('.json'):walk(p,json.loads(raw))
 else:
  for i,l in enumerate(raw.splitlines()):
   if l.strip():walk(p,json.loads(l),'/@line'+str(i+1))
expected=[(x['record'],x['pointer'],x['sha256'])for x in fields];check(sorted(actual)==sorted(expected),'Unclassified or changed digest leaf')
allowed={'typed_raw_or_native_path_binding','native_embedded_profile_body','native_scoped_semantic_or_campaign_digest','recorded_value_digest'};check(all(x['contract']in allowed for x in fields),'Unclassified digest contract')
for audit in M.get('supplementalValueAudits',[]):
 raw=locate(audit['location']).read_bytes();check(sha(raw)==audit['sha256']and len(raw)==audit['bytes'],'Supplemental native audit drift '+audit['name'])
check(unavailable==len(M['historicalUnavailableRawBindings'])==4,'Unexpected unavailable historical set');check(M['counts']['typedRawNativeBindings']==len(bindings),'Binding count drift')
if a.native:
 # Exact native values/profiles and the integrated current gates; no local exception is passed.
 helper=D/'verify-native-value-origins.mts';subprocess.run([str(R/'app/node_modules/.bin/tsx'),str(helper),str(R),str(D),*a.external_root],check=True)
 subprocess.run([str(R/'app/node_modules/.bin/tsx'),str(R/'app/scripts/reportDeepUnderstandingRollout.ts'),'--mode=check','--format=json'],cwd=R,check=True,stdout=sys.stderr)
print(json.dumps({'contract':'task-h-record-lifecycle-integrity-v1','classifiedHFiles':len(records),'rawNativeBindings':len(bindings),'verifiedDistinctOrigins':len(checked),'classifiedDigestLeaves':len(fields),'historicalUnavailableExplicit':unavailable,'unknownRecords':0,'falseCurrentRecords':0,'nativeCurrentGatesRequested':a.native,'scopeLimit':'Four historical working-state hashes have no recovered original bytes; no successful byte verification is claimed for those rows.'}))
