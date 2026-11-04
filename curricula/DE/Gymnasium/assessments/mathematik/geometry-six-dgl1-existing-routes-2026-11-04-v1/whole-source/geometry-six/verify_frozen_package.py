from pathlib import Path
import json,hashlib
H=Path(__file__).resolve().parent;R=H.parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((H/'review-input-manifest.json').read_text());actualfiles={str(p.relative_to(H))for p in H.rglob('*')if p.is_file()and'__pycache__'not in p.parts and p.name not in ['review-input-manifest.json','frozen-verification.actual.json']};assert actualfiles=={r['path']for r in m['files']}
for r in m['files']:
 p=H/r['path'];assert p.stat().st_size==r['bytes']and sha(p)==r['sha256'],str(p)
for b in m['externalInputBindings']:
 p=R/b.get('inputRoot','.')/b['path'];assert sha(p)==b['sha256'],str(p)
contract=json.loads((H/'original/canonical.current.json').read_text());by={g['id']:g for g in contract['goals']};frozen=json.loads((H/'frozen-input.json').read_text());assert len(frozen['wholeGoals'])==6
for g in frozen['wholeGoals']:assert by[g['id']]==g
assert json.loads((H/'current-semantic-kind-context.json').read_text())['counts']['curricularAtomic']==807
reuse=json.loads((H/'existing-8d3-whole-form.current.json').read_text());assert reuse==by[reuse['id']]
forms=json.loads((H/'author-package.json').read_text())['forms'];assert len(forms)==5
for f in forms:
 d=json.loads((H/f['contentPath']).read_text());assert d['originalCompetencyId']==f['goalId']and d['newAssessmentIdAssigned']is False and d['canonicalRoleActivated']is False
 assert d['examDataContent']['coveredGoalIds']==[f['goalId']]
 s=d['examDataContent']['scoring'];assert s['maxPoints']==20 and s['passingPoints']==15 and sum(r['points']for r in s['steps'])==20
report={'status':'PASS_FROZEN_PRIVATE_PACKAGE_BYTES_AND_ORIGINAL_CONTRACTS','manifestSha256':sha(H/'review-input-manifest.json'),'frozenFiles':len(m['files']),'externalBindings':len(m['externalInputBindings']),'allSixOriginalGoalObjectsRetained':True,'existing8d3WholeObjectUnchanged':True,'fiveNewFormsSingle20of15Result':True,'curricularAtomicCount':807,'independentReview':'PENDING','noRoleScopeOrRActivation':True}
(H/'frozen-verification.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report))
