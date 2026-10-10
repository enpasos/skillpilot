# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,importlib.util,subprocess,contextlib,io
from jsonschema import Draft202012Validator
R=pathlib.Path.cwd();O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-sek1-insect-eight-current-native-and-raster-independent-b-20261010-v1'
def ref(p):
 p=pathlib.Path(p);p=p if p.is_absolute() else R/p;b=p.read_bytes();return dict(path=str(p.relative_to(R)),sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
def shape(v):
 if isinstance(v,dict):return dict(type='object',required=list(v),properties={k:shape(x) for k,x in v.items()},additionalProperties=False)
 if isinstance(v,list):return dict(type='array',items={} if not v else shape(v[0]))
 if isinstance(v,bool):return dict(type='boolean')
 if v is None:return dict(type='null')
 if isinstance(v,int):return dict(type='integer')
 if isinstance(v,float):return dict(type='number')
 return dict(type='string')
def put(p,o):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:json.dump(o,f,ensure_ascii=False,indent=2);f.write('\n')
first=json.load(open(O/'FIRST.V.actual.json'));seal=json.load(open(O/'FIRST.V.freeze.json'))
assert ref(O/'FIRST.V.actual.json')['sha256']=='sha256:03d07112fd1f4f364447f3065b24ee58146dc973dc741b51fb94f28b5887ad03'
assert ref(O/'FIRST.V.freeze.json')['sha256']=='sha256:33ce391461bf703a11417c9ac9c9fff1b833a44c8f368d912a3aea06361201a3'
for b in [seal['first'],seal['actualViews']]+seal['exactInputs']:assert ref(b['path'])==b
rows=[json.loads(l) for l in (O/'FIRST.V.views.actual.jsonl').read_text().splitlines()];assert len(rows)==24
schemas=[]
for n,v in [('V-FIRST-review',first),('V-FIRST-view',rows[0]),('V-FIRST-seal',seal)]:
 s={'$schema':'https://json-schema.org/draft/2020-12/schema','title':'Own additive independent B '+n+' closed technical receipt; no gate changes',**shape(v)}
 if n=='V-FIRST-review':
  s['properties']['records']['items']['properties']['decision']={'enum':['KEEP','REVISE','BLOCK']}
  s['properties']['records']['minItems']=8;s['properties']['records']['maxItems']=8;s['properties']['actualViewCount']={'const':24}
 if n=='V-FIRST-view':
  s['properties']['assetRole']={'enum':['actualOriginalPNG','phone360','pc680']};s['properties']['actualView']={'const':True};s['properties']['cropped']={'const':False}
 p=O/'technical/contracts'/(n+'.closed.schema.json');put(p,s);schemas.append(ref(p));checker=Draft202012Validator(s)
 for x in rows if n=='V-FIRST-view' else [v]:checker.validate(x)
spec=importlib.util.spec_from_file_location('normal',R/'scripts/validate_schemas.py');normal=importlib.util.module_from_spec(spec);spec.loader.exec_module(normal);runtime=json.load(open(R/'docs/landscape-runtime.schema.json'))
parsed=[p for p in O.rglob('*.json')];assert all(normal.validate_file(str(p),runtime) for p in parsed);syms=normal.curriculum_symlink_errors(str(R));assert not syms
paths={b['path'] for b in seal['exactInputs']}|{str(p.relative_to(R)) for p in O.rglob('*') if p.is_file()};ig=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(paths)+'\n',capture_output=True,text=True);assert ig.returncode==1 and not ig.stdout
put(O/'normal/V-FIRST-closed-schema-portability.actual.json',dict(schemaVersion=1,role='Actual normal quality JSON parse plus own closed V-FIRST schemas and all24 whole view rows; no native D/P approval',normalValidator=ref('scripts/validate_schemas.py'),closedSchemas=schemas,wholeViewJSONLRowCount=24,exactCurrentBindings=True,ownFIRSTUnchanged=True,normalQualityJSONParsedCount=len(parsed),normalCurriculumSymlinkErrors=syms,currentRequiredIgnoredPaths=[],exitCode=0,activeWrites=False,humanApproval=False,strictNetGain=0))
print(json.dumps(dict(normalClosedVFIRST='PASS',actualViewRows=24,currentBindings='PASS',normalQualityJSONParsed=len(parsed),symlinkErrors=syms,requiredIgnoredPaths=[],exitCode=0),ensure_ascii=False))
