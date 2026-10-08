# SPDX-License-Identifier: Apache-2.0
# Own independent final-A preparation; no final raster/native D/V judgment yet.
from pathlib import Path
import json,hashlib,datetime
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;BASE=OWN.parent
OLD=BASE/'biologie-he9-nineteen-current391-science-author-root-v1'
AUTHOR=BASE/'biologie-he9-nineteen-targeted-alternatives-and-materials-author-root-v2'
FIRST=BASE/'biologie-he9-nineteen-science-first-independent-a-20261008-v1'
TARGET=BASE/'biologie-he9-targeted-four-profile-science-independent-a-20261008-v2'
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def digest(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rel(p):return str(Path(p).relative_to(ROOT))
def bind(p):return {'path':rel(p),'sha256':digest(p),'bytes':Path(p).stat().st_size}
def read(p):return json.loads(Path(p).read_text())
def write(p,o):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),f'Immutable own preparation exists: {p}';p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
def verify(p,expected):
 assert digest(p)==expected;d=read(p);entries=d.get('frozenFiles',d.get('files',[]));assert entries
 for e in entries:
  q=ROOT/e['path'];assert digest(q)==e['sha256'].removeprefix('sha256:');assert e.get('bytes',q.stat().st_size)==q.stat().st_size
 return {'seal':bind(p),'actualFilesVerified':len(entries)}
seals={'originalOwnWhole19ScienceA':verify(FIRST/'first-science-verdicts.independent-a.freeze.json','d9e7a5a65b32ec564021a7dcad152c3cb75b1a9879ee43ddef859dc147714422'),'currentWhole42AuthorV2':verify(AUTHOR/'targeted-OR-materials-and-whole42-author-input.first.freeze.json','acde2680025a779d3b1800f978c1430893ac92538d35233a8916d07d9d372d6d'),'genuinePriorTargetedFourScienceA':verify(TARGET/'first-four-science-and-native-P4.independent-a.exact.freeze.json','a9a3c998ae33569316d734b263d8cd5367f39038ed6054d250f0da258c254474')}
entry=read(AUTHOR/'neutral-targeted-four-profile-and-materials-science-review.entry.json')
for k in ['current19GoalBodies','operativeCandidates','operativeConfig','operativeNativeP19','whole19cases42']:
 e=entry[k];assert digest(ROOT/e['path'])==e['sha256'].removeprefix('sha256:');assert (ROOT/e['path']).stat().st_size==e['bytes']
goals=read(OLD/'current19-whole-DEEN-goals.actual.json')['goals'];assert len(goals)==19;excluded='3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8';assert goals[11]['id']==excluded
selected=[g for g in goals if g['id']!=excluded];ids={g['id'] for g in selected};assert len(ids)==18
canonical=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json';current={g['id']:g for g in read(canonical)['goals']}
for g in selected:assert current[g['id']]==g,'Whole selected text/source/scope/structure moved; actual neutral final input required'
cases0=read(OLD/'nineteen-whole-goals-thirty-eight-complete-DEEN-cases.author.json')['goals'];cases=read(AUTHOR/'nineteen-whole-goals-forty-two-complete-DEEN-cases.author.json')['goals']
oldcases={c['id']:c for g in cases0 for c in g['cases']};newcases={c['id']:c for g in cases for c in g['cases']};changed=[i for i in oldcases if oldcases[i]!=newcases[i]];added=[i for i in newcases if i not in oldcases]
assert set(changed)=={'he9-19-04-case-2','he9-19-07-case-2'};assert len(added)==4;assert all('-ear-' in i for i in added)
rows0={r['goalId']:r for r in map(json.loads,(OLD/'P19.current-text-preimage.author.review.jsonl').read_text().splitlines())};rows={r['goalId']:r for r in map(json.loads,(AUTHOR/'P19.targeted-or-and-materials-closed-contract.author.review.jsonl').read_text().splitlines())}
changed_ids={goals[i-1]['id'] for i in [1,2,4,7]}
for gid in rows:
 if gid not in changed_ids:assert rows[gid]['profile']==rows0[gid]['profile'];assert rows[gid]['profileFingerprint']==rows0[gid]['profileFingerprint']
 assert rows[gid]['status']=='needs_human_review';assert rows[gid]['reviewAuthority']=='ai_candidate';assert rows[gid]['evidenceLevel']=='E1';assert rows[gid]['maximumClaimScope']=='G1'
whole=[{'ordinal':i,'goal':g,'wholeCurrentV2Profile':rows[g['id']]['profile'],'nativePSourceBinding':{'path':entry['operativeNativeP19']['path'],'sha256':entry['operativeNativeP19']['sha256'],'profileFingerprint':rows[g['id']]['profileFingerprint']},'wholeCases':next(c for c in cases if c['goalId']==g['id']),'scientificBasis':'genuine prior targeted four actual science plus own original whole19 science' if g['id'] in changed_ids else 'own original whole19 scientific judgment retained exactly'} for i,g in enumerate(goals,1) if g['id'] in ids]
assert sum(len(r['wholeCases']['cases']) for r in whole)==40
write(OWN/'pending/exact-eighteen-whole-goals-profiles-and-forty-conditional-DEEN-cases.input.json',{'artifactKind':'own final-A pending exact source/scientific scope, not native final raster approval','records':whole,'excludedWholeGoal':{'ordinal':12,'goalId':excluded,'reason':'Existing genuine SPLIT_REVIEW remains open; not included in the final18 approval scope'},'activeWrites':0})
write(OWN/'pending/actual-retained-science-and-targeted-four-input-bindings.independent-a.json',{'artifactKind':'actual independent final-A preliminary scientific input verification','recordedAt':NOW,'seals':seals,'neutralOperativeEntry':bind(AUTHOR/'neutral-targeted-four-profile-and-materials-science-review.entry.json'),'wholeCurrentEighteenGoalBodiesExact':True,'currentCanonicalObservation':bind(canonical),'canonicalObservationIsStrict174Report':False,'original15ProfilesExactIncludingExcluded12':True,'original14IncludedProfilesNotRestarted':True,'changedFourProfileOrdinals':[1,2,4,7],'original36CaseBodiesRetainedExact':True,'actualChangedOriginalCaseIds':changed,'actualAddedConditionalEarCases':added,'selectedWholeCaseCount40':40,'allSelectedStatusesNeedsHumanReview':18,'approvedProfiles0':0,'profileEvidenceLevelE1MaximumScopeG1':True,'sourceAlternativeEyeOREar':True,'hormonalFeedbackSourceFacultative':True,'realLearnerEvidence':False,'noWholeCountrySourceApprovalClaim':True,'excluded12SplitReviewRetained':True,'peerFinalBOutputsRead':False,'actualFinalD18NativeInput':'pending Root exact final174 frame','actualFinalV18PNGsAnd360680AndNativePages':'pending Root exact final inputs','finalApprovalClaimed':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False})
print(json.dumps({'actualScienceSealsVerified':seals,'wholeCurrentScope18Exact':True,'wholeCurrentCases40':40,'excluded12StillSplitReview':True,'finalNativeD18V18':'pending actual author input','activeWrites':0,'strictGain':0}))
