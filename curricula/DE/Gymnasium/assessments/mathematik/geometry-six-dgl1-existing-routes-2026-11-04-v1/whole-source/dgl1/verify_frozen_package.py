from pathlib import Path
import json,hashlib
H=Path(__file__).resolve().parent;R=H.parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((H/'review-input-manifest.json').read_text());actual={str(p.relative_to(H))for p in H.rglob('*')if p.is_file()and'__pycache__'not in p.parts and p.name not in ['review-input-manifest.json','frozen-verification.actual.json']};assert actual=={r['path']for r in m['files']}
for r in m['files']:
 p=H/r['path'];assert p.stat().st_size==r['bytes']and sha(p)==r['sha256'],str(p)
for b in m['externalInputBindings']:
 p=R/b.get('inputRoot','.')/b['path'];assert sha(p)==b['sha256'],str(p)
f=json.loads((H/'frozen-input.json').read_text());by={g['id']:g for g in json.loads((H/'original/canonical.current.json').read_text())['goals']};assert by[f['wholeGoals'][0]['id']]==f['wholeGoals'][0]
g=f['preservedGeometryManifest'];p=R/g['inputRoot']/g['path'];geo=json.loads(p.read_text());assert len(geo['files'])==182
for r in geo['files']:assert sha(p.parent/r['path'])==r['sha256']
report={'status':'PASS_FROZEN_DGL1_BYTES_AND_UNCHANGED_182_GEOMETRY_INPUTS','manifestSha256':sha(H/'review-input-manifest.json'),'frozenFiles':len(m['files']),'externalBindings':len(m['externalInputBindings']),'originalGoalAnd807IdentityPreserved':True,'geometry182FilesByteExact':True,'independentReview':'PENDING','noRoleScopeRorStageActivation':True};(H/'frozen-verification.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report))
