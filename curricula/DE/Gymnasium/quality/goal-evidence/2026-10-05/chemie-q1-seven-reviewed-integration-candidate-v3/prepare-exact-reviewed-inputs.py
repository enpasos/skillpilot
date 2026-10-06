#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Verify exact independent evidence and prepare a small inactive native root."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,shutil,copy
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT);BASE=OWN.parent
AUTH=BASE/'chemie-q1-six-source-operator-remediation-current-candidate-v1';AREL=AUTH.relative_to(ROOT)
ISO=ROOT/'tmp/chemie-q1-seven-reviewed-integration-candidate-v3-native-root'
REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';HOLD='d3cd250f-5221-589d-aa1c-44a4692d1acb'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def write(p,v):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
F=[(AUTH/'author-native-candidate.final.freeze.json','70899d0c1f5512fbf5cdd9b5a2cba7f081ff6efca30c17f680036063c07b051b'),(BASE/'chemie-q1-seven-current-independent-p-v1/independent-review.final.freeze.json','404c7e7390835ca2d84e5e9e466cd0dc4c160075ddfaa0ea5c37a3516be77291'),(BASE/'chemie-q1-seven-source-operator-current-independent-d-a-v1/independent-d-a-a-m.final.freeze.json','bba3ecd269adcbad5ffb3a70616ae9347dcc24011fe08b48b4118af4df6474b4'),(BASE/'chemie-q1-eight-current-independent-d-b-v1/independent-current-d-b.final.freeze.json','0eb44005c7cfaf03eb55b09f535d62768fee36a458a18584f63e811bf2c1de44'),(ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-q1-seven-source-operator-current-independent-v-qa-20261005-v1/independent-visual-review.final.freeze.json','22607542c9dfa078ec1d43f1b83b4d97e6d87fa1253a828926b6845557fd9611')]
verified=[]
for p,h in F:
 assert sha(p)==h,p
 rows=read(p)['files']
 for r in rows:
  src=ROOT/r['path'] if r['path'].startswith(('curricula/','app/','tmp/','backend/')) else p.parent/r['path']
  assert sha(src)==r['sha256'].removeprefix('sha256:'),src
  if src.suffix=='.json':read(src)
  if src.suffix=='.jsonl':
   for line in src.read_text().splitlines():json.loads(line)
 verified.append({'path':str(p.relative_to(ROOT)),'sha256':h,'actualFilesVerified':len(rows)})
baseline=BASE/'chemie-biologie-q1-bacteria-e7-integration-v1/integrated-central-after-e7-current.stdout.txt';assert sha(baseline)=='3df0a7c379585ba86aef20f0443ec909543777873aef87ed6dbc144aac389222';report=read(baseline);subjects={s['subject']:s for s in report['subjects']}
assert all(subjects[s]['strictComplete']==n for s,n in {'chemie':104,'biologie':49,'mathematik':807,'physik':478}.items());assert all(not s['issues'] for s in report['subjects'])
assert sha(ROOT/CAN)=='0fd3c538b5b554606ea8b073fa8c4cd3e27c376599cc416f0e8d2452b70be3be'
for p,n in [(REG,'central-registry.before.snapshot.json'),(CAN,'canonical.before.snapshot.json')]:shutil.copy2(ROOT/p,OWN/n)
reg=read(ROOT/REG);chem=next(s for s in reg['subjects'] if s['subject']=='chemie');curr=read(ROOT/CAN);goalold={g['id']:g for g in curr['goals']};candidate=read(AUTH/'prospective-input-tree'/CAN);goalnew={g['id']:g for g in candidate['goals']};ids=read(AUTH/'positive-evidence.config.json')['scope']['goalIds'];safe=[g for g in ids if g!=HOLD]
assert len(safe)==6
whole=[{'goalId':g,'wholeCurrentObjectEqualsAuthorProspective':goalold[g]==goalnew[g]} for g in subjects['chemie']['strictCompleteGoalIds']];assert all(x['wholeCurrentObjectEqualsAuthorProspective'] for x in whole)
changes=[{'goalId':g,'actualChangedFields':[k for k in sorted(goalold[g].keys()|goalnew[g].keys()) if goalold[g].get(k)!=goalnew[g].get(k)]} for g in goalold if goalold[g]!=goalnew[g]]
write(OWN/'exact-input-and-current-scope.preflight.actual.json',{'atUTC':datetime.now(timezone.utc).isoformat(),'exactFreezeGuards':verified,'baselineCentralReportPath':str(baseline.relative_to(ROOT)),'baselineCentralReportSHA256':sha(baseline),'currentChemieCanonicalSHA256':sha(ROOT/CAN),'currentRegistrySHA256':sha(ROOT/REG),'baselineSubjectCounts':{s:{'strict':subjects[s]['strictComplete'],'denominator':subjects[s]['denominator'],'issues':subjects[s]['issues']} for s in subjects},'protectedChemie104WholeObjects':whole,'protectedBiologie49GoalIds':subjects['biologie']['strictCompleteGoalIds'],'safeSixScientificGoalIds':safe,'existingContextBindingOnlyGoalIds':['70b34ae7-4481-590c-9a02-516464750832'],'openSemanticDissent':{'goalId':HOLD,'status':'deferred_pending_real_semantic_split','oldAtomicDecisionNotAdopted':True,'quantitativeContentsCannotBeDroppedOrChangedToOR':True},'actualAuthorWholeGoalFieldChanges':changes,'newAuthorGoalIds':[g for g in goalnew if g not in goalold],'futureDenominatorNotAnActiveCount':True,'activeWrites':0,'humanApproval':False,'humanTrial':False})
assert not ISO.exists();ISO.mkdir(parents=True)
copied=[];linked=[]
def cp(src,rel):
 dest=ISO/rel;dest.parent.mkdir(parents=True,exist_ok=True);assert not dest.exists();shutil.copy2(src,dest);copied.append({'path':str(rel),'sourcePath':str(src.relative_to(ROOT)),'sha256':sha(src),'bytes':src.stat().st_size})
def link(src,rel):
 dest=ISO/rel;dest.parent.mkdir(parents=True,exist_ok=True)
 if not dest.exists():dest.symlink_to(src.resolve());linked.append(str(rel))
# Executable copies live solely in ignored tmp. Original scripts and sources are read only.
for src in (ROOT/'app/scripts').iterdir():
 if src.is_file():cp(src,src.relative_to(ROOT))
for src in (ROOT/'app/src').rglob('*'):
 if src.is_file() and src.suffix in {'.ts','.tsx','.mjs','.json'}:cp(src,src.relative_to(ROOT))
for rel in ['app/node_modules','contracts','docs','scripts']:
 link(ROOT/rel,Path(rel))
# Reuse author physically isolated inputs by individual read-only links, not another clone.
receipt=read(AUTH/'current104-physical-author-shadow.actual.receipt.json');sourceISO=ROOT/'tmp/chemie-q1-six-source-operator-native-isolated-20261005-v1'
for r in receipt['copiedPhysicalInputs']:
 rel=Path(r['path']);src=sourceISO/rel
 if rel.parts[:2] in [('app','scripts'),('app','src')]:
  if not (ISO/rel).exists() and src.is_file():link(src,rel)
 elif src.is_file():link(src,rel)
# Physically independent mutable author batch/bundle and candidate paths.
for src in AUTH.rglob('*'):
 if src.is_file() and ('native-finalbook-v2' in src.relative_to(AUTH).parts or src.name in {'batch.config.json','book.config.json'}):
  rel=src.relative_to(ROOT);dest=ISO/rel
  if dest.is_symlink():dest.unlink()
  if dest.exists():continue
  cp(src,rel)
for rel in [CAN,chem['semanticKindLedgerPath'],chem['visualizationQaPath']]:
 dest=ISO/rel
 if dest.is_symlink():dest.unlink()
 if not dest.exists():cp(AUTH/'prospective-input-tree'/rel,Path(rel))
# Own namespace is writable physical; no output path can reach frozen repository inputs.
(ISO/REL).mkdir(parents=True,exist_ok=True)
write(OWN/'small-native-root.actual.receipt.json',{'atUTC':datetime.now(timezone.utc).isoformat(),'nativeRoot':str(ISO),'physicallyCopiedFiles':copied,'readOnlyIndividualInputLinks':linked,'noFullRepositoryCopy':True,'frozenAuthorRootReadOnly':str(sourceISO),'activeWrites':0,'humanApproval':False})
print(json.dumps({'freezeInputSets':len(verified),'actualFrozenFilesVerified':sum(x['actualFilesVerified'] for x in verified),'protectedWholeStrictChemieObjects':len(whole),'safeScienceGoals':len(safe),'contextOnlyGoals':1,'explicitDeferredGoal':HOLD,'physicalNativeCopiedFiles':len(copied),'copiedBytes':sum(r['bytes'] for r in copied),'readOnlyLinks':len(linked),'root':str(ISO),'activeWrites':0}))
