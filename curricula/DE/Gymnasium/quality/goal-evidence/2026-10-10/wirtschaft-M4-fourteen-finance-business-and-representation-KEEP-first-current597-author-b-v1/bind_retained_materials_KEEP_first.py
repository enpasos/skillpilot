import gzip
"""Reuse exact valid old science; keep uncovered whole-closure boundaries visible."""
import json,hashlib
from pathlib import Path
O=Path(__file__).resolve().parent;ROOT=Path('/home/enpasos/projects/skillpilot');Q='curricula/DE/Gymnasium/quality/goal-evidence/'
I=json.loads(gzip.decompress((O/'actual-current597-fourteen-whole-contracts-original-P28-ten-existing-materials-and64-scope-KEEP-first.AUTHOR-intake.json.gz').read_bytes()))
current={x['wholeCurrentMaterial']['id']:x['wholeCurrentMaterial'] for x in I['wholeTenExistingMaterials']}
def b(p):p=ROOT/p;return dict(path=str(p.relative_to(ROOT)),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size)
sources=[
 ('64276b0c',Q+'2026-10-09/wirtschaft-two-E40-finance-project-independent-bounded-liability-and-mandatory-execution-delta-review-v1/whole-two-current-successors.only-independent-machine-material-status-released.inert.json',Q+'2026-10-09/wirtschaft-two-E40-finance-project-independent-bounded-liability-and-mandatory-execution-delta-review-v1/actual-final-independent-two-E40-liability-and-whole-execution-cap14-successors-KEEP.receipt.json'),
 ('b2003473',Q+'2026-10-09/wirtschaft-two-E40-finance-project-independent-bounded-liability-and-mandatory-execution-delta-review-v1/whole-two-current-successors.only-independent-machine-material-status-released.inert.json',Q+'2026-10-09/wirtschaft-two-E40-finance-project-independent-bounded-liability-and-mandatory-execution-delta-review-v1/actual-final-independent-two-E40-liability-and-whole-execution-cap14-successors-KEEP.receipt.json'),
 ('96182c38',Q+'2026-10-10/wirtschaft-M4-thirteen-business-production-marketing-whole-material-author-a-v1/one-literal-finance-verb-reading-remedy-author-successor-v2/whole-five-DEEN-business-materials.only-one-finance-verb-remedy.DRAFT-author-v2.json',Q+'2026-10-10/wirtschaft-M4-five-business-whole-science-independent-root-v2/actual-final-five-business-whole-materials-independent-root-scientific-KEEP.json'),
 ('a9d984ee',Q+'2026-10-10/wirtschaft-M4-thirteen-business-production-marketing-whole-material-author-a-v1/one-literal-finance-verb-reading-remedy-author-successor-v2/whole-five-DEEN-business-materials.only-one-finance-verb-remedy.DRAFT-author-v2.json',Q+'2026-10-10/wirtschaft-M4-five-business-whole-science-independent-root-v2/actual-final-five-business-whole-materials-independent-root-scientific-KEEP.json'),
 ('19d1ffb5',Q+'2026-10-08/wirtschaft-by-three-autonomy-terminals-author-draft-v1/whole-three-terminal-goals.candidate.json',Q+'2026-10-08/wirtschaft-by-three-autonomy-terminals-independent-root-whole-content-review-v1/independent-whole-three-draft-content-disposition.actual.receipt.json'),
 ('bb1f4944',Q+'2026-10-08/wirtschaft-by-three-autonomy-terminals-author-draft-v1/whole-three-terminal-goals.candidate.json',Q+'2026-10-08/wirtschaft-by-three-autonomy-terminals-independent-root-whole-content-review-v1/independent-whole-three-draft-content-disposition.actual.receipt.json'),
 ('645f2429',Q+'2026-10-09/wirtschaft-four-Q2-materials-independent-root-v1/whole-two-Q2-enterprise-and-legal-materials.only-reviewed-machine-status-released.inert.json',Q+'2026-10-09/wirtschaft-four-Q2-materials-independent-root-v1/actual-final-independent-four-Q2-whole-materials-two-KEEP-two-REVISE-and-three-real-findings.receipt.json'),
 ('73c49b24',Q+'2026-10-09/wirtschaft-M3-seven-nonuniversal-prerequisite-bounded-author-v1/real-four-route-gaps-bookkeeping-and-f80-bounded-material-author-v3/whole-new-bookkeeping-three-goal-material.DRAFT-author-candidate.json',Q+'2026-10-09/wirtschaft-M3-M4-two-whole-terminals-material-independent-a-v1/actual-whole-bilingual-bookkeeping-P6-13-transactions-rubric-and-F80-bounded-material-scientific-KEEP.independent-a.json'),
 ('08fd2e38',Q+'2026-10-09/wirtschaft-five-additional-terminal-materials-independent-root-20261009-v1/whole-five-material-reviewed-machine-released.inert.candidate.json',Q+'2026-10-09/wirtschaft-five-additional-terminal-materials-independent-root-20261009-v1/actual-independent-five-whole-terminal-material-source-rubric-and-machine-release.receipt.json'),
 ('241d7c79',Q+'2026-10-08/wirtschaft-macro-five-bounded-business-route-author-v1/whole-two-new-terminal-DRAFT-goals.candidate.json',Q+'2026-10-08/wirtschaft-macro-five-independent-root-whole-materials-and-sequence-review-v1/actual-independent-whole-two-assessments-five-goals-nav-orientation-review.receipt.json')]
def find(x,id):
 if isinstance(x,dict):
  if x.get('id')==id and 'examData'in x:return x
  for v in x.values():
   r=find(v,id)
   if r:return r
 elif isinstance(x,list):
  for v in x:
   r=find(v,id)
   if r:return r
 return None
rows=[]
for prefix,whole,science in sources:
 id=next(x for x in current if x.startswith(prefix));g=current[id];old=find(json.loads((ROOT/whole).read_text()),id);assert old is not None
 fields=['requires','tags'];comparisons={f:g.get(f)==old.get(f) for f in fields}
 for f in ['taskContent','taskContentEn','solutionContent','solutionContentEn','scoring','coveredGoalIds']:
  comparisons['examData.'+f]=g['examData'].get(f)==old['examData'].get(f)
 wholeExact=all(comparisons.values())
 rows.append(dict(id=id,actualWholeHistoricalInput=b(whole),actualForeignReceipt=b(science),actualCurrentWholeMeaningfulFieldsExact=comparisons,wholeCurrentDEENReceiptReuseEligible=wholeExact,scopeReuseEligibleForSelectedMissingContext=False,decision='Retain whole current material unchanged; no valid whole closure in any selected missing context. No fresh historical science run.',notExactHistoricalFields=[k for k,v in comparisons.items() if not v],notExactBoundary='No final whole DEEN receipt inferred from a DE-only or nonmatching historical input.' if not wholeExact else None))
assert len(rows)==10
p=O/'actual-ten-retained-whole-materials-valid-science-search-and-current-field-guards.KEEP-first-AUTHOR.json';assert not p.exists();p.write_text(json.dumps(dict(role='AUTHOR KEEP-first search and exact existing science binding, no new foreign approval',allTenCurrentBodiesRetainedExactly=True,selectedMissingWholeScopeCompatibility=0,actualNoHistoricalReviewRestart=True,individualRows=rows),ensure_ascii=False,indent=2)+'\n');print(json.dumps({'retained':10,'exactHistoricalDEENBindings':sum(x['wholeCurrentDEENReceiptReuseEligible'] for x in rows),'selectedMissingWholeScopeCompatibility':0,'nonexact':[{ 'id':x['id'],'fields':x['notExactHistoricalFields']} for x in rows if not x['wholeCurrentDEENReceiptReuseEligible']]}))
