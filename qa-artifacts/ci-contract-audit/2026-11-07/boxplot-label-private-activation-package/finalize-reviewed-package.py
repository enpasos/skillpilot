from pathlib import Path
import copy,gzip,hashlib,json
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent
def read(p):return json.loads((R/p).read_text())
def dump(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def info(p):
 p=Path(p);return {'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'sha256':sha(p),'bytes':p.stat().st_size}
s=json.loads((O/'private-workspace.json').read_text());W=Path(s['workspace']);rel=O.relative_to(R).as_posix()
REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
P1='qa-artifacts/ci-contract-audit/2026-11-07/boxplot-label-independent-positive-evidence-review/P-target.config.json';p1=read(P1);P1R=p1['reviewPath'];assert sha(R/P1R)=='04ad4802599d5350ec0b7844dd75254b2f1b5ad435d6084950489f33dd44abbd'
record=json.loads((R/P1R).read_text());assert record['goalId']==s['goalId'] and record['reviewInputFingerprint']=='sha256:8a939c12677327682549ff175115be2f21b837b17932baa9aa19d60b37a63f56'
assert record['reviewAuthority']=='ai_candidate' and record['status']=='needs_human_review' and record['evidenceLevel']=='E1' and record['maximumClaimScope']=='G1'
assert record['reviewer']!=s['Prow']['reviewer'] and record['reviewedAt']!=s['Prow']['reviewedAt'] and record['profile']==s['Prow']['profile']
base=read(REG);si=next(i for i,x in enumerate(base['subjects'])if x['subject']=='mathematik');candidate=copy.deepcopy(base);paths=candidate['subjects'][si]['positiveEvidenceConfigPaths'];pi=paths.index(s['Pconfig']);paths[pi:pi+1]=[rel+'/P-retained12.config.json',P1]
def ownership(paths):
 result={}
 for p in paths:
  for g in read(p)['scope']['goalIds']:
   assert g not in result,(g,result.get(g),p)
   result[g]=p
 return result
before=ownership(base['subjects'][si]['positiveEvidenceConfigPaths']);after=ownership(paths);assert set(before)==set(after) and len(after)==807
assert all(base['subjects'][j]==candidate['subjects'][j]for j in range(len(base['subjects']))if j!=si)
for k,v in base['subjects'][si].items():
 if k!='positiveEvidenceConfigPaths':assert v==candidate['subjects'][si][k]
dump(W/'final-registry.json',candidate)
with gzip.open(O/'final-registry.json.gz','wb')as f:f.write((W/'final-registry.json').read_bytes())
target=copy.deepcopy(candidate);target['subjects']=[candidate['subjects'][si]];target['reportId']='boxplot-private-source-ro-current-mathematik-targeted-DPAM-20261107';dump(O/'final-native-math.config.json',target)
route={'target':REG,'expectedBeforeSha256':s['protected'][REG]['sha256'],'candidate':info(W/'final-registry.json'),'candidateArchive':info(O/'final-registry.json.gz'),'onlyChangedField':f'/subjects/{si}/positiveEvidenceConfigPaths','operations':[{'op':'test','path':f'/subjects/{si}/positiveEvidenceConfigPaths/{pi}','value':s['Pconfig']},{'op':'remove','path':f'/subjects/{si}/positiveEvidenceConfigPaths/{pi}'},{'op':'add','path':f'/subjects/{si}/positiveEvidenceConfigPaths/{pi}','value':rel+'/P-retained12.config.json'},{'op':'add','path':f'/subjects/{si}/positiveEvidenceConfigPaths/{pi+1}','value':P1}],'scopeOwnershipBefore':len(before),'scopeOwnershipAfter':len(after),'sameExactPGoalSet':True,'duplicates':False,'independentPConfig':info(R/P1),'independentPReview':info(R/P1R),'retained12Config':info(O/'P-retained12.config.json'),'retained12Review':info(O/'P-retained12.review.jsonl'),'historical13ConfigAndReviewUnmodified':True,'pendingDraftsUsed':False,'allOtherSubjectsAndFieldsUnchanged':True}
dump(O/'final-P-routing-application-diff.json',route)
for p,g in s['protected'].items():assert sha(R/p)==g['sha256'],p
print(json.dumps({'fullPGoalOwnership':len(after),'registryCandidateSha256':route['candidate']['sha256'],'actualP1Review':route['independentPReview'],'protectedActiveInputsUnchanged':True},indent=2))
