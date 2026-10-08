#!/usr/bin/env python3
"""Apache-2.0: freeze an inactive package after genuine native checks."""
import hashlib,json,subprocess
from collections import Counter
from datetime import datetime,timezone
from pathlib import Path

B=Path(__file__).resolve().parent;R=B.parents[6];REL=str(B.relative_to(R))
def read(p):return json.loads(Path(p).read_text())
def dump(name,value):(B/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def checked_run(label,args):
 completed=subprocess.run(args,cwd=R,text=True,capture_output=True)
 (B/f'native/{label}.stdout.actual.txt').write_text(completed.stdout)
 (B/f'native/{label}.stderr.actual.txt').write_text(completed.stderr)
 dump(f'native/{label}.terminal.actual.json',{'command':args,'exitCode':completed.returncode,'completedAt':datetime.now(timezone.utc).isoformat(),'activeWrites':False})
 assert completed.returncode==0,(label,completed.stderr)

ids=read(B/'scope20.json');wanted=set(ids)
entry={
 'schemaVersion':1,'status':'inactive-author-candidate-independent-reviews-pending',
 'authorPackagePath':REL,'bindingSeal':'author-candidate.final.seal.json',
 'scopeGoalIds':ids,'wholeGoals':20,'completeBilingualSyntheticCases':40,
 'authorEvidenceLevel':'E1','authorGrade':'G1','humanApproval':False,
 'entryFiles':{
  'wholeCurrentGoalsRequiresParents':'whole20.current-native-goals.requires.parents.snapshot.json',
  'wholeNativePages':'native/whole20.current-native-pure-book-contexts.actual.json',
  'actual378Universe':'native/full378.current-native.book-model.json',
  'completeMaterialTaskAnswerScoringTransferCases':'whole40.material-task-model-scoring-fresh-transfer.de-en.author-candidate.json',
  'originalReadBoundaries':'source/actual-original-primary-locators-and-read-boundaries.json',
  'wholeSourceAssessment':'source/whole20-original-source-scope-operator-assessment.author-candidate.json',
  'allWholeSourceDutiesAndPartners':'source/whole-all-current-source-goals-and-1n-partners.lossless.json',
  'existingSchemaSourceBindingCandidate':'source/hb-arrhenius-original-duty-hold.inactive.review.json',
  'wholeAtomicityCandidates':'native/a20.author-candidate.review.jsonl',
  'closedNativePositiveProfiles':'native/p20.author-candidate.review.jsonl',
  'wholeHoldTriage':'whole20-author-clear-candidates-and-HOLD-list.json',
  'existingMemory':'memory/whole20.existing-decisions-cards.reuse.json',
  'actualFullMemoryVisibility':'memory/current378.existing-visibility.native.report.md',
  'existingVisualHashBinding':'existing-whole20-V-exact-hash-reuse.actual.json',
  'existingSubjectCriteria':'frozen-inputs/chemistry-existing-review-criteria.md'},
 'independentReviewProtocol':[
  'Root assigns two separate reviewers and two separately owned review dossiers. The author does not appoint or simulate reviewers.',
  'Each reviewer verifies the final seal and first records an independent first verdict before reading the other reviewer report or discussing their findings.',
  'Read all twenty complete current DE/EN goal bodies and genuine current requires/parent/native-page context. Leaf syntax or curricularAtomic bookkeeping alone does not establish semantic atomicity.',
  'Read and verify primary official original locators and original course/stage/operator boundaries. Retained normalized extraction strings are not automatically official quotations. The all-partner pool preserves unreviewed duties; do not approve nationwide obligations from this author read.',
  'Review all forty full materials/tasks/responses/scorings/fresh transfers for scientific correctness, whole goal coverage, units, stoichiometry, actual versus standard state, rate versus K/Q, electron versus ion paths, conditional judgment and independent performance.',
  'Evaluate D/P/A and existing M/V reuse separately. Actual written model answers establish no executed experiment, learner performance, Human Trial or human approval.',
  'Make per-whole-goal decisions with concrete reasons and required remedy. Keep actual compound/source HOLDs and all original IDs/duties until a reviewed resolution. Reviewer judgments can disagree with author candidate statuses.',
  'Check existing V assets directly when needed; the author hash report only binds existing reviewed bytes. Existing cards retain their recorded limited role and never replace fresh explanation or transfer.',
  'Write immutable first and final reviewer seals in the separate review dossier, including the author final-seal hash and concrete blocking or clearance findings.',
  'No reviewer report in this round integrates this author package or grants learner/human approval. Root handles any subsequently reviewed integration separately.'
 ],
 'noActiveWrites':True,'noGainClaim':True,'independentReviewCompleted':False}
dump('independent-review-entry.json',entry)

canonical=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
expected='f86209b8f750c0b576b63f34d19fb91458f2a35d6e183a8429a023e1dec53a84'
assert sha(canonical)==expected==sha(B/'frozen-inputs/01.DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
active_registry=read(R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
frozen_registry=read(B/'frozen-inputs/04.de-gymnasium-math-physics.config.json')
chem=lambda r:next(s for s in r['subjects'] if s['subject']=='chemie')
assert chem(active_registry)==chem(frozen_registry)
ledger=read(R/'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
claims=[{'path':p,'sha256':sha(R/p),'goalIds':read(R/p)['goalIds']} for p in ledger['activeBatchConfigPaths']]
reserved=set(gid for claim in claims for gid in claim['goalIds'])
assert len(claims)==7 and len(reserved)==19 and not reserved.intersection(wanted)
frozen=read(B/'first-inputs.freeze.json')
stable=[]
for record in frozen:
 assert sha(R/record['frozenPath'])==record['sha256']
 current=sha(R/record['sourcePath'])
 stable.append({'sourcePath':record['sourcePath'],'authorStartSha256':record['sha256'],'currentSha256':current,'sameBytes':current==record['sha256']})
 if record['sourcePath']!= 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json':
  assert current==record['sha256'],record['sourcePath']

pool=read(B/'source/whole-all-current-source-goals-and-1n-partners.lossless.json')
maps={};extracts={}
for duty in pool['sourceGoals']:
 mp=duty['mappingPath'];ep=duty['sourceExtractionPath'];gid=duty['wholeRetainedExtractionGoal']['id']
 if mp not in maps:maps[mp]=read(R/mp)
 if ep not in extracts:extracts[ep]=read(R/ep)
 currentgoal=next(g for g in extracts[ep]['sourceGoals'] if g['id']==gid)
 assert currentgoal==duty['wholeRetainedExtractionGoal'],(ep,gid)
 partners=[m for m in maps[mp]['mappings'] if m['legacyGoalId']==gid]
 assert partners==duty['allPartnerRows'],(mp,gid,'partners')
 decision=next((d for d in maps[mp]['decisions'] if d['sourceGoalId']==gid),None)
 assert decision==duty['wholeCurrentDecision'],(mp,gid,'decision')
full=read(B/'frozen-inputs/01.DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');goals={g['id']:g for g in full['goals']}
cases=read(B/'whole40.material-task-model-scoring-fresh-transfer.de-en.author-candidate.json')['cases']
assert len(cases)==40 and Counter(c['goalId'] for c in cases)==Counter({gid:2 for gid in ids})
for c in cases:
 assert c['wholeCurrentGoal']==goals[c['goalId']]
 for key in ['title','material','task','modelResponse']:
  assert all(isinstance(c[key][lang],str) and c[key][lang].strip() for lang in ['de','en']),(c['caseId'],key)
 assert c['scoring']['maximumPoints']==10 and sum(v['points'] for v in c['scoring']['criteria'])==10
 assert len(c['scoring']['criteria'])==5
 assert c['freshTransfer']
 assert goals[c['goalId']]['descriptionEn'] and goals[c['goalId']]['titleEn']
active_paths=json.dumps(chem(active_registry))
assert REL not in active_paths
memory_config=read(R/chem(active_registry)['memoryReviewConfigPath'])
assert sha(R/memory_config['reviewPath'])==sha(B/'memory/current378.existing.records.jsonl')
assert sha(R/memory_config['cardReviewPath'])==sha(B/'memory/current-existing.cards.jsonl')
dump('whole20.final-active-inputs-collision-source-partners-cases.guard.actual.json',{
 'exitCode':0,'checkedAt':datetime.now(timezone.utc).isoformat(),'currentCanonicalSha256':expected,
 'allTwentyCompleteCurrentBodiesIdentical':True,'fullBilingualCases':40,'allScoringsTenPoints':True,
 'activeChemistryRegistryEntryUnchanged':True,'packageRegisteredActive':False,
 'inFlightClaims':claims,'reservedClaimCount':7,'reservedGoalCount':19,'reservationCollisions':[],
 'originalFrozenInputs':stable,'sourceMappingFilesChecked':len(maps),'sourceExtractionFilesChecked':len(extracts),
 'wholeSourceDutiesAndAllPartnersUnchanged':pool['uniqueSourceDuties'],'matchedSourceEdges':pool['matchedEdges'],
 'existingMemoryAndCardReviewBytesUnchanged':True,'newCards':0,'newImages':0,
 'sourceOriginalCertificationIsBounded':True,'independentReviewCompleted':False,'humanApproval':False})

# Capture the real existing build and native API terminals. No alternative
# validator or simulated batch/input manifest is introduced here.
checked_run('full378-current-native-build',['app/node_modules/.bin/tsx','app/scripts/buildGoalBookModel.ts',f'{REL}/native/full378.book.config.json'])
checked_run('whole20-native-context-api-check',['app/node_modules/.bin/tsx',f'{REL}/whole20_native_context_and_api_check.mts'])

excluded={'author-candidate.first.seal.json','author-candidate.first.verify.actual.json','author-candidate.final.seal.json','author-candidate.final.verify.actual.json'}
def seal(name,include_first=False):
 files=[]
 for p in sorted(B.rglob('*')):
  if not p.is_file():continue
  rel=str(p.relative_to(B))
  if rel in excluded and not(include_first and rel in {'author-candidate.first.seal.json','author-candidate.first.verify.actual.json'}):continue
  files.append({'relativePath':rel,'sha256':sha(p),'bytes':p.stat().st_size})
 dump(name,{'schemaVersion':1,'kind':'inactive-whole-author-candidate-seal','sealedAt':datetime.now(timezone.utc).isoformat(),
  'scopeGoalIds':ids,'fullCurrentCanonicalSha256':expected,'files':files,'excludedSelfAndReceipts':sorted(excluded-({'author-candidate.first.seal.json','author-candidate.first.verify.actual.json'} if include_first else set())),
  'activeWrite':False,'independentReviewCompleted':False,'humanApproval':False,
  'firstSealSha256':sha(B/'author-candidate.first.seal.json') if include_first else None})
 result=subprocess.run(['python',str(B/'verify_author_seal.py'),name],cwd=R,text=True,capture_output=True)
 assert result.returncode==0,result.stdout+result.stderr
 receipt=json.loads(result.stdout);receipt['verifiedAt']=datetime.now(timezone.utc).isoformat();receipt['sealSha256']=sha(B/name)
 dump(name.replace('.seal.json','.verify.actual.json'),receipt)
 return sha(B/name),len(files)
first,count=seal('author-candidate.first.seal.json')
final,count_final=seal('author-candidate.final.seal.json',True)
print(json.dumps({'exitCode':0,'firstSealSha256':first,'firstBoundFiles':count,'finalSealSha256':final,'finalBoundFiles':count_final,'independentReviewEntry':f'{REL}/independent-review-entry.json','independentReviewCompleted':False,'activeWrites':False},ensure_ascii=False))
