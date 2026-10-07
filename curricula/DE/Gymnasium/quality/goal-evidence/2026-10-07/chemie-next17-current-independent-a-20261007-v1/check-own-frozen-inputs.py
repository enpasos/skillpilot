#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bounded consistency checks only; scientific judgments are manual results."""
import hashlib,json,re
from pathlib import Path
B=Path(__file__).resolve().parent
R=Path.cwd()
def load(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def whitespace(text):return re.sub(r'\s+',' ',text).strip()
scope=load(B/'inputs/native-d-seventeen/round-a/description-review-input.json')
ids=[g['goalId'] for g in scope['goals']]
cases=load(B/'inputs/thirty-four-complete-bilingual-material-cases.author-review17.json')['cases']
profiles=load(B/'inputs/positive-evidence.seventeen.author-candidate-set.json')['goals']
records=[json.loads(x) for x in (B/'inputs/positive-evidence.seventeen.author-candidates.review.jsonl').read_text().splitlines()]
ci={c['caseId']:c for c in cases}
errors=[]
for p in profiles:
 for brief in p['profile']['applicationCaseBriefs']:
  c=ci[brief['id']]
  for lang,suffix in [('de','De'),('en','En')]:
   if brief['taskDemand'+suffix]!=c['material'][lang]+' '+c['taskDemand'][lang]:errors.append([p['goalId'],brief['id'],lang,'task material mismatch'])
   if brief['expectedPerformance'+suffix]!=c['expectedPerformance'][lang]:errors.append([p['goalId'],brief['id'],lang,'reference answer mismatch'])
  if c['goalId']!=p['goalId']:errors.append([p['goalId'],'foreign case'])
 if p['evidenceLevel']!='E1' or p['maximumClaimScope']!='G1':errors.append([p['goalId'],'author candidate overclaim'])
for r in records:
 if r['reviewAuthority']!='ai_candidate' or r['status']!='needs_human_review':errors.append([r['goalId'],'authority mismatch'])
 if r['reviewRunIds']:errors.append([r['goalId'],'author review run ids unexpectedly nonempty'])
own=load(B/'results/positive-evidence-bounded-independent-review.json')
if [p['goalId'] for p in profiles]!=ids or [r['goalId'] for r in records]!=ids:errors.append('profile scope mismatch')
if [j['goalId'] for j in own['judgments']]!=ids:errors.append('own positive review scope mismatch')
if len(cases)!=34 or len(ci)!=34:errors.append('case multiplicity mismatch')
for gid in ids:
 if sum(c['goalId']==gid for c in cases)!=2:errors.append([gid,'not exactly two cases'])
current=load(B/'results/current-versus-historical-page-binding.json')
changed=[x['goalId'] for x in current['goals'] if x['wholeGoalDifferences']]
expected={'0bf26276-2780-506c-ac34-35dd44a29409','a44af1fa-5988-5b7d-b206-691c6bbf7dd4','9751b6d8-cde3-527b-b37c-babb6cee79d2'}
if set(changed)!=expected:errors.append('current resource withdrawal set differs')
for row in current['goals']:
 if set(row['wholeGoalDifferences'])-{'resourceLinks'}:errors.append([row['goalId'],'other current semantic drift'])
guide=load(B/'inputs/seventeen-bounded-primary-source-components-and-two-split-source-routing.author.json')
mapping_cache={}
checks=[]
external=[]
for row in guide['rows']:
 if row['goalId'] not in ids:continue
 for w in row['boundedLiteralBYWitnesses']:
  tp=R/w['primaryText']['path'];mp=R/w['activeMappingPath']
  if mp not in mapping_cache:mapping_cache[mp]=load(mp)['mappings']
  literal=w['wholeSourceGoal']['sourceText'] in tp.read_text()
  normalized=whitespace(w['wholeSourceGoal']['sourceText']) in whitespace(tp.read_text())
  mapping_match=w['wholeMappingRow'] in mapping_cache[mp]
  checks.append({'goalId':row['goalId'],'sourceGoalId':w['sourceGoalId'],
    'primaryTextPath':str(tp.relative_to(R)), 'literalComponentFound':literal,
    'whitespaceNormalizedComponentFound':normalized,
    'currentMappingRowFound':mapping_match, 'scientificApprovalInferredFromLiteralMatch':False})
  if not normalized or not mapping_match:errors.append([row['goalId'],'source component/mapping drift'])
  external.extend([tp,mp])
for split in guide['splitCurrentSourceInputs']:
 tp=R/split['actualOriginalText']['path'];sp=R/split['sourceExtraction']['path']
 found=split['wholeExistingSourceGoal']['sourceText'] in tp.read_text()
 allmaps=load(R/'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json')['mappings']
 direct=sum(m['canonicalGoalId']==split['goalId'] for m in allmaps)
 checks.append({'goalId':split['goalId'],'sourceGoalId':split['wholeExistingSourceGoal']['id'],
    'primaryTextPath':str(tp.relative_to(R)),'literalComponentFound':found,
    'currentDirectSelectedGoalMappingCount':direct,'scientificApprovalInferredFromLiteralMatch':False})
 if not found or direct!=0:errors.append([split['goalId'],'split route no longer matches reviewed inputs'])
 external.extend([tp,sp])
external.extend([R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next-twenty-current-methods-acid-base-organic-author-v1/sources/HE-G9-physical-017.txt',R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next-twenty-current-methods-acid-base-organic-author-v1/sources/HE-G9-physical-017.png'])
external=sorted(set(external))
save(B/'inputs/external-primary-source-and-mapping-bindings.json',{'purpose':'Hash references to exact already retained public primary input bytes; no complete PDF source text copied into this dossier',
 'files':[{'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size} for p in external]})
save(B/'qa-artifacts/bounded-current17-consistency-check.actual.json',{
 'status':'pass' if not errors else 'fail','errors':errors,
 'goalCount':len(ids),'caseCount':len(cases),'languageBodies':len(cases)*2,
 'nativeProfileCaseBriefEquality':'all material + task and reference responses checked in both languages',
 'aiCandidateAuthorityRecords':len(records),'humanApprovedRecords':0,
 'currentChangedWholeGoals':changed,'sourceComponentChecks':checks,
 'technicalCheckDoesNotJudgeScience':True,'nativeFrozenCurrentPCheckStillFailsOnThreeStaleBindings':True})
if errors:raise SystemExit(json.dumps(errors,ensure_ascii=False))
print('Bounded consistency valid: 17 goals, 34 complete bilingual cases, 17 honest AI records; 3 exact current resource withdrawals; source components and two unresolved routes verified.')
