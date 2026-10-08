# SPDX-License-Identifier: Apache-2.0
"""Technical guards only. Final B and Ord19 approval are explicitly pending."""
from pathlib import Path
import copy, hashlib, json, datetime

ROOT=Path.cwd(); OWN=Path(__file__).resolve().parent; BASE=OWN.parent
AUTHOR=BASE/'biologie-he9-eighteen-final-raster-native-author-root-20261008-v1'
A=BASE/'biologie-he9-eighteen-final-raster-native-independent-a-20261008-v1'
PENDING19='1b7f08a1-33df-5779-af66-430c91d699b7'
EXCLUDED12='3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8'
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def read(p):return json.loads(p.read_text())
def write(p,o):
 p=OWN/p;p.parent.mkdir(parents=True,exist_ok=True);b=o if isinstance(o,bytes) else (json.dumps(o,ensure_ascii=False,indent=2)+'\n').encode()
 with p.open('xb') as f:f.write(b)
 return bind(p)
def verify(p,expected):
 assert bind(p)['sha256']==expected;value=read(p);rows=value.get('files',value.get('frozenFiles'))
 for b in rows:assert bind(ROOT/b['path'])==b
 return {'seal':bind(p),'actualEntriesVerified':len(rows)}
seals={'author230':verify(AUTHOR/'eighteen-whole-current-raster-native-author-input.first.freeze.json','e25e9ce6317ed23bcad124f530d5e8851a8c642cd947671c10df231f425a061f'),
 'ACompleted18':verify(A/'completed-native-D18-P18-V18.independent-a.final.freeze.json','fa090a8715fffff1cbd5057e01a7824be0ff308a4a87ea07e6088dca9eb4d598')}
paths={'canonical':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',
 'kinds':'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',
 'qa':'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json',
 'registry':'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
 'ledger':'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',
 'floors':'app/scripts/config/curriculum-maturity-floor-policy.json'}
bindings={k:bind(ROOT/p) for k,p in paths.items()}
for k,p in paths.items():write('before/'+k+'.json',(ROOT/p).read_bytes())
source_plan=read(AUTHOR/'candidate/eighteen-image-only-field-patches.guarded-plan.json')
assert bindings['canonical']['sha256']==source_plan['actualSourceLandscapeSha256']
before=read(ROOT/paths['canonical']);assert before==read(AUTHOR/'candidate/canonical.before-eighteen-links.exact.json')
author=read(AUTHOR/'candidate/canonical.current474-eighteen-new-raster-author.json')
ids18=[r['goalId'] for r in source_plan['rows']];ids17=[g for g in ids18 if g!=PENDING19];selected=set(ids17)
assert len(ids18)==18 and len(selected)==17 and EXCLUDED12 not in ids18
future=copy.deepcopy(before);author_by={g['id']:g for g in author['goals']}
for i,g in enumerate(future['goals']):
 if g['id'] in selected:future['goals'][i]=copy.deepcopy(author_by[g['id']])
old={g['id']:g for g in before['goals']};new={g['id']:g for g in future['goals']};assert len(new)==474
assert {g for g in new if new[g]!=old[g]}==selected
for gid in ids17:
 normalized=copy.deepcopy(new[gid]);normalized.pop('resourceLinks',None);original=copy.deepcopy(old[gid]);original.pop('resourceLinks',None);assert normalized==original
assert new[PENDING19]==old[PENDING19] and new[EXCLUDED12]==old[EXCLUDED12]
write('candidate/canonical.seventeen-pending-review.future-active.json',future)
baseline_path=BASE/'biologie-flora-fauna20-reviewed-active-integration-root-v1/active-after-flora20-central.actual.json';baseline=read(baseline_path)
exit_path=baseline_path.parent/'active-after-flora20-central.exit.actual.json';assert read(exit_path)['exitCode']==0
by={s['subject']:s for s in baseline['subjects']};assert by['biologie']['strictComplete']==174 and by['biologie']['denominator']==391
assert by['mathematik']['strictComplete']==by['mathematik']['denominator']==807
assert by['physik']['strictComplete']==by['physik']['denominator']==478
assert by['chemie']['strictComplete']==173
assert not selected&set(by['biologie']['strictCompleteGoalIds'])
write('before/actual-terminal-central174.exact.json',baseline_path.read_bytes())
ledger=read(ROOT/paths['ledger']);assert len(ledger['activeBatchConfigPaths'])==7
registry=read(ROOT/paths['registry']);bio=next(s for s in registry['subjects'] if s['subject']=='biologie')
for p in bio['resolutionIndexPaths']:
 index=read(ROOT/p);assert not selected&(set(index.get('batchGoalIds',[]))|{r['goalId'] for r in index.get('resolutions',[])})
guards={'role':'neutral current174 biology baseline guards; potential17 subpackage only after actual B seal',
 'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'seals':seals,'beforeBindings':bindings,
 'selected17PotentialGoalIds':ids17,'original18NativePairGoalIds':ids18,'pending19':{'goalId':PENDING19,'state':'approval_pending','actualCurrentEnglishTitle':old[PENDING19]['titleEn'],'actualCurrentEnglishDescription':old[PENDING19]['descriptionEn'],'actualCurrentGermanTitle':old[PENDING19]['title'],'actualCurrentGermanDescription':old[PENDING19]['description'],'scopeObservation':'Biotechnology encompasses more than DE Gentechnik/genetic engineering; parent-reported pending B concern independently confirmed against own unchanged current goal body, no B file read.'},
 'excluded12':{'goalId':EXCLUDED12,'state':'genuine semantic SPLIT_REVIEW remains open'},
 'protectedStrictGoalIds':{s['subject']:s['strictCompleteGoalIds'] for s in baseline['subjects']},
 'strictBaselineReport':bind(baseline_path),'strictBaselineTerminal':bind(exit_path),'sevenChemistryLedgerClaims':ledger['activeBatchConfigPaths'],
 'wholeOtherGoalsExact':457,'expectedOtherCurrentPagesExact':374,'authorOriginal18WholeBodiesAndSealsUnchanged':True,
 'nativeDPairPlan':'Use genuine original18 pair; only17 both KEEP resolutions,19 unresolved real dissent. Do not fabricate19 approval or deferral.',
 'finalBSeal':'pending; no B verdict file read','machineVisualApproval':'pending actual paired judgments','PStatus':'needs_human_review/ai_candidate/E1/G1',
 'allSourceOperatorApprovalClaim':False,'humanApproval':False,'humanTrial':False,'activeWrites':0,'strictGainClaimed':0}
write('pending/neutral-current174-seventeen-potential-guard.plan.json',guards)
print(json.dumps({'protectedBio':174,'protectedMath':807,'protectedPhysics':478,'protectedChem':173,'potentialSelected':17,'BSeal':'pending','19':'approval_pending','12':'SPLIT_REVIEW','activeWrites':0}))
