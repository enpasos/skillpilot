from pathlib import Path
import json,hashlib,subprocess
ROOT=Path(__file__).resolve().parents[2];BASE=Path(__file__).resolve().parent;OLD='5cb5e567d08bc9f640942529d9099cbce03a4747';h=lambda raw:hashlib.sha256(raw).hexdigest()
def blob(p):return subprocess.check_output(['git','show',OLD+':'+p],cwd=ROOT)
policy_path='app/scripts/config/math-duration-split-spanning-tree-policy.json';p=json.loads((ROOT/policy_path).read_bytes());assert (ROOT/policy_path).read_bytes()==blob(policy_path)
canon='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';a=json.loads(blob(canon));z=json.loads((ROOT/canon).read_bytes());ag={g['id']:g for g in a['goals']};zg={g['id']:g for g in z['goals']};assert list(ag)==list(zg);deltas=[]
for ident,g in ag.items():
 fields=sorted(k for k in set(g)|set(zg[ident]) if g.get(k)!=zg[ident].get(k))
 if fields:assert fields==['requires'];deltas.append({'goalId':ident,'title':g['title'],'oldRequires':g.get('requires'),'newRequires':zg[ident].get('requires')})
assert len(deltas)==4
assert {k:v for k,v in a.items() if k!='goals'}=={k:v for k,v in z.items() if k!='goals'}
kind='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json';ka=json.loads(blob(kind));kz=json.loads((ROOT/kind).read_bytes());proj=lambda j:[(d.get('goalId'),d.get('semanticKind')) for d in j['decisions'] if d.get('goalId') and d.get('decisionStatus')=='authoritative'];assert proj(ka)==proj(kz);assert len(ka['decisions'])==len(kz['decisions']);kd=[]
for x,y in zip(ka['decisions'],kz['decisions']):
 if x!=y:
  fields=sorted(k for k in set(x)|set(y) if x.get(k)!=y.get(k));assert fields==['sourceFingerprint'];kd.append({'goalId':x['goalId'],'changedFields':fields})
assert len(kd)==4 and {x['goalId'] for x in kd}=={x['goalId'] for x in deltas}
assert {k:v for k,v in ka.items() if k!='decisions'}=={k:v for k,v in kz.items() if k!='decisions'}
paths={}
def visit(x,loc=''):
 if isinstance(x,dict):
  for k,v in x.items():
   if isinstance(v,str) and k in ('path','adjudicationPath') and v.startswith(('curricula/','app/','tmp/')):paths[v]=loc+'/'+k
   visit(v,loc+'/'+k)
 elif isinstance(x,list):
  for i,v in enumerate(x):visit(v,loc+'/'+str(i))
visit(p);bound=[]
for path,pointer in paths.items():
 if path==canon:continue
 if path.startswith('tmp/'):
  assert p['inputs']['extractionProvenance']['runtimeDependency'] is False;bound.append({'path':path,'pointer':pointer,'classification':'historical-provenance-explicitly-not-runtime-dependency','notClaimedAsValidatedLiveInput':True});continue
 raw=(ROOT/path).read_bytes();assert raw==blob(path),path;bound.append({'path':path,'pointer':pointer,'sha256':h(raw),'bytes':len(raw),'exactlyEqualsOldGitBytes':True})
for x in p['inputs']['additiveAdjudications']:
 raw=(ROOT/x['path']).read_bytes();assert h(raw)==x['fileSha256'];j=json.loads(raw);digest=j.pop('adjudicationDigest');assert digest==x['adjudicationDigest']=='sha256:'+h(json.dumps(j,ensure_ascii=False,separators=(',',':')).encode()),x['path']
for x in p['inputs']['sourceScopeDecisions']:assert h((ROOT/x['path']).read_bytes())==x['sha256'],x['path']
parent=p['inputs']['parentDerivativeReceipt'];raw=(ROOT/parent['path']).read_bytes();assert h(raw)==parent['fileSha256'];assert json.loads(raw)['receiptDigest']==parent['receiptDigest']
views='curricula/DE/Gymnasium/composition-views/mathematik/';templates=[];files=set()
for x in p['sek1Templates']:templates.append({'kind':'sek1','fileName':x['fileName'],'historicalTemplateDigest':x['fileSha256'],'placementCount':x['placementCount']});files.add(x['fileName'])
for x in p['crossStageTemplates']:templates.append({'kind':'crossstage','fileName':x['outputFileName'],'historicalTemplateDigest':x['outputSha256'],'baseViewFileName':x['baseViewFileName'],'sek1TemplateFileName':x['sek1TemplateFileName']});files.update([x['outputFileName'],x['baseViewFileName'],x['sek1TemplateFileName']])
current_views=[]
for name in sorted(files):
 raw=(ROOT/views/name).read_bytes();assert raw==blob(views+name),name;current_views.append({'path':views+name,'sha256':h(raw),'exactOldGitBytes':True})
for x in templates:x['liveSha256']=h((ROOT/views/x['fileName']).read_bytes());x['historicalDigestEqualsLive']=x['historicalTemplateDigest']==x['liveSha256']
result={'oldCommit':OLD,'sourceGoalCount':len(ag),'sourceChanges':deltas,'allOtherCanonicalFieldsOrderAndPlacementsUnchanged':True,'authoritativeKindProjectionUnchanged':True,'authoritativeKindRows':len(proj(ka)),'kindChangesOnlyFourPreviouslyReviewedSourceFingerprints':kd,'allOtherKindFieldsAndOrderUnchanged':True,'boundAdjudicationAndSourceScopePaths':bound,'all7AdditiveRawAndEmbeddedContentDigestsVerified':True,'all5SourceScopeDigestsVerified':True,'parentReceiptRawAndDeclaredDigestVerified':True,'templates':templates,'liveTemplateAndBaseViewInputs':current_views,'allTemplateDescriptorsAnd83PlacementsUnchanged':True,'historicalTemplateDigestBoundary':'Historical template digest values are retained exactly as before. Their relation to current generated views is reported explicitly; this technical review does not reinterpret or refresh those historical fields.'}
(BASE/'static-input-meaning-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':'PASS','sourceDeltas':len(deltas),'kindDeltas':len(kd),'authoritativeKindProjectionEqual':True,'templates':len(templates),'oldAndCurrentViewInputsEqual':len(files),'policyBoundPaths':len(bound),'historicalTemplateDigestsNotEqualLive':sum(not x['historicalDigestEqualsLive'] for x in templates)},indent=2))
