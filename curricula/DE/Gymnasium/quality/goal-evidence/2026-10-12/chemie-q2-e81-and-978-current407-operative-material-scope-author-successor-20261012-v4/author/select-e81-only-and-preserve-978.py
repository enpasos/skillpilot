# SPDX-License-Identifier: Apache-2.0
"""Reproduce root's scope narrowing: optional978 draft never selected."""
import json,pathlib,shutil
R=pathlib.Path.cwd();D=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12';B=D/'chemie-q2-e81-and-978-current407-operative-material-scope-author-successor-20261012-v4';E='e81a4aed-9695-533e-8eb7-7a0c714346ea';draft=B/'drafts/978-optional-unselected'
assert not (B/'FINAL.author-successor.freeze.json').exists()
draft.mkdir(parents=True,exist_ok=True)
for src,name in [(B/'cases/whole9.current-operative.DEEN.cases-material-protocol-solutions-rubrics.json','whole9.initial-combined-author-draft.json'),(B/'positive/P2.unbound.informed-author.records.json','P2.initial-combined-unbound-author-draft.json'),(B/'checks/bounded-profile-and-case-field-deltas.unbound.json','initial-combined-unbound-deltas.json'),(B/'sources/current2.actual-literal-route-boundaries.unchanged-mappings.json','initial-combined-source-read.json')]:
 if src.exists():
  assert not (draft/name).exists();shutil.move(str(src),draft/name)
def read(p):return json.loads(p.read_text())
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
x=read(draft/'whole9.initial-combined-author-draft.json');x['goalIds']=[E];x['cases']=[r for r in x['cases'] if r['goalId']==E];x['artifactRole']='Selected e81-only operative current material; optional978 draft excluded';write(B/'cases/whole4.e81-only.current-operative.DEEN.material-protocol-solutions-rubrics.json',x)
r=next(x for x in read(draft/'P2.initial-combined-unbound-author-draft.json')['records'] if x['goalId']==E);r['reviewId']='chemie-e81-operative-material-scope-author-20261012-v4';r['reason']='Additive e81-only E1/G1 informed-author correction: full operative conductivity material uses the valid0–5000 standard range, preserves the >=100mS salt range and actual task/protocol/rubric, and scopes ordinary/BW guided-route coverage. Both whole bromine cases and all BW chosen-route duties remain. No independent/human approval or learner execution claim.';write(B/'positive/P1.e81-only.unbound.informed-author.record.json',r)
x=read(draft/'initial-combined-source-read.json');x['bindings']=[r for r in x['bindings'] if r['directCanonicalOwner']==E];x['scopeDecision']='e81-only: complete common safe guided competence applies to ordinary routes; only the chosen BW3.3.3(2) route requires the two preserved complete bromine cases. No mapping changes or source union approval.';write(B/'sources/e81-only.actual-literal-route-boundaries.unchanged-mappings.json',x)
x=read(B/'checks/exact-material-range-deltas-and-case-conservation.json');x['conservation']=[r for r in x['conservation'] if r['goalId']==E];x['operativeCaseCount']=4;write(B/'checks/exact-material-range-deltas-and-case-conservation.json',x)
(draft/'UNSELECTED.md').write_text('Optional informed-author978 clarification drafted before root narrowed integration. Unbound, unselected, no new review required for accepted original978. Nothing in this directory is an operative integration input. Original978 P and cases remain unchanged in the sealed baseline.\n')
