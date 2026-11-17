from pathlib import Path
import json,hashlib,datetime
p=Path('/home/enpasos/projects/skillpilot/tmp/pipeline/laender-stufen/gesamt');old=p/'final-v4/native';new=p/'final-metadata-v1/native';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
a=json.loads((old/'native-views.json').read_text());b=json.loads((new/'native-views.json').read_text());by={c['id']:c for c in b['contexts']};rows=[]
assert len(a['contexts'])==len(b['contexts'])==216
for c in a['contexts']:
 n=by[c['id']];assert {k:v for k,v in c.items() if k not in ('mathViewKey','physicsViewKey')}=={k:v for k,v in n.items() if k not in ('mathViewKey','physicsViewKey')}
 for subject in ['math','physics']:
  x=a['views'][c[subject+'ViewKey']];y=b['views'][n[subject+'ViewKey']];assert x==y,(c['id'],subject)
  rows.append({'context':c['id'],'subject':subject,'entirePayloadEqual':True,'canonicalJsonSha256':hashlib.sha256(json.dumps(y,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()})
assert json.loads((old/'backend-scopes.json').read_text())==json.loads((new/'backend-scopes.json').read_text())
result={'at':datetime.datetime.now().astimezone().isoformat(),'status':'PASS','nativePayloads':432,'backendScopeObjects':216,'everyNativePayloadAndBackendScopeEqual':True,'basis':'Fresh native export after exact three-field coveredStrands repair. Compare payloads via each context reference: raw exporter content-address keys may differ with JSON object key serialization order across JVM processes; complete parsed view payloads are identical. All context metadata and complete backend scopes are also identical. The existing708stage/36051nested and220browser results therefore retain exactly the same projection inputs.','oldNativeSha256':sha(old/'native-views.json'),'newNativeSha256':sha(new/'native-views.json'),'oldBackendSha256':sha(old/'backend-scopes.json'),'newBackendSha256':sha(new/'backend-scopes.json'),'rows':rows}
(p/'final-metadata-v1/projection-equivalence.actual.json').write_text(json.dumps(result,indent=2)+'\n');print({k:v for k,v in result.items() if k!='rows'})
