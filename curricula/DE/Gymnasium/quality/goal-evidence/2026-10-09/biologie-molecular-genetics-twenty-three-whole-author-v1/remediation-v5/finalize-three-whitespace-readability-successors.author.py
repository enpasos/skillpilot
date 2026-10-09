from pathlib import Path
import json,hashlib,datetime,re
B=Path(__file__).resolve().parent.relative_to(Path.cwd().resolve());S=B.parent
def read(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p);z=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(z).hexdigest(),'bytes':len(z)}
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
x=read(B/'twenty-three-whole46-bilingual-cases-and-P.v5.author-candidate.json')
old=read(S/'remediation-v4/twenty-three-whole46-bilingual-cases-and-P.v4.author-candidate.json')
d=read(B/'exact-three-goal-six-case-whitespace-only-delta.actual.json')
assert all(re.sub(r'\s','',r['before'])==re.sub(r'\s','',r['after']) for r in d['changedTextFields'])
for i in range(23):
 assert x['entries'][i]['wholeCurrentGoal']==old['entries'][i]['wholeCurrentGoal']
 if i not in (11,21,22):assert x['entries'][i]==old['entries'][i]
assert x['exactHistoricalWholeCases']==old['exactHistoricalWholeCases']
for i in (11,21,22):
 for j in (0,1):
  a,b=old['entries'][i]['newAuthoredWholeCases'][j],x['entries'][i]['newAuthoredWholeCases'][j]
  for key in ('materialDe','materialEn'):
   def matrixlines(s):return [v for v in s.splitlines() if re.match(r'^(Typ /|(?:[0-9]+|X|Y): )',v)]
   assert matrixlines(a[key])==matrixlines(b[key])
records=[json.loads(l) for l in (B/'twenty-three-whole-positive.v5.author-candidate.review.jsonl').read_text().splitlines() if l]
assert len(records)==23 and all(r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' and r['reviewRunIds']==[] for r in records)
for n in ('ordinary-materialize-P23-v5-correct-current-review-id-v2','ordinary-check-P23-v5-correct-current-review-id-v2'):
 assert read(B/'checks'/f'{n}.terminal.actual.json')['actualExitCode']==0
inputPaths=[S/'remediation-v4/neutral-whole23-four-precise-material-remedies-v4.author-review.entry.json',S/'remediation-v4/four-precise-material-remedies-v4.author.first.freeze.json',S/'remediation-v3/three-complete-material-remedies-v3.author.first.freeze.json',S/'whole23-science-author.first.freeze.json',S/'input/whole-current23-source38-and-whole-partners44.exact-neutral-input.json',S/'input/actual-primary-whole-context-reading.bindings.json',S/'remediation-v2/candidate/current-canonical479-one-DEEN-splicing-fidelity.candidate.json',S/'remediation-v2/candidate/kinds394-source-path-only.candidate.json']
entry={'schemaVersion':1,'role':'Neutral final whole23 science/P author successor: precise science-v4 retained, only whitespace corrected for3 profiles/6 cases in v5; independent current/native review pending','preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'all23CurrentWholeGoalsCasesAndProfiles':bind(B/'twenty-three-whole46-bilingual-cases-and-P.v5.author-candidate.json'),'ordinaryProfileCandidateSet':bind(B/'twenty-three-whole-positive-profile-candidate-set.v5.author.json'),'ordinaryProfileConfig':bind(B/'twenty-three-whole-positive.v5.author-candidate.config.json'),'ordinaryAuthorProfileRecords':bind(B/'twenty-three-whole-positive.v5.author-candidate.review.jsonl'),'targetedReadabilityGoalIds':[x['entries'][i]['goalId'] for i in (11,21,22)],'targetedWholeInputPointers':['/entries/'+str(i) for i in (11,21,22)],'exactWhitespaceOnlyDeltas':bind(B/'exact-three-goal-six-case-whitespace-only-delta.actual.json'),'legacyGAHelperMaterialOnlyRole':bind(B/'GA-helper-material-only-reference-current-profile-authority.actual.json'),'predecessorScienceV4':bind(inputPaths[0]),'predecessorScienceV4FirstSeal':bind(inputPaths[1]),'currentCandidateCanonicalBinding':bind(inputPaths[6]),'currentCandidateSemanticKindBinding':bind(inputPaths[7]),'originalWholeSource38AndPartners44Input':bind(inputPaths[4]),'actualPrimaryReadingBindings':bind(inputPaths[5]),'retention':{'other20WholeEntriesExactV4':True,'all23WholeDEENGoalsExactV4':True,'fourOriginalHistoricalCasesExact':True,'allChromosomeMatrixRowsByteExact':True,'everyChangedTextIdenticalAfterRemovingWhitespace':True,'allSequencesNumbersConditionsEAGAScopeUnchanged':True,'unchangedLegacyGAHelperIsMaterialInputOnlyNotCurrentProfileApproval':True,'originalFirstReviewsAndSealsPreserved':True},'reviewState':{'status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','independentScientificFollowup':'pending','ordinaryCurrentNativeDescription':'pending','currentRasterBoundP':'pending','sourceCourseScopeApproval':False,'humanApproval':False,'humanTrial':False},'strictGain':0,'activeWrites':0,'actualExperimentPerformed':False,'actualLearnerPerformance':False}
p=B/'neutral-whole23-three-readability-only-successors-v5.author-review.entry.json';write(p,entry)
f=B/'three-readability-only-successors-v5.author.first.freeze.json'
outputs=[bind(q) for q in sorted(B.rglob('*')) if q.is_file() and q!=f]
write(f,{'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Immutable author technical first seal, not independent acceptance','inputs':[bind(p) for p in inputPaths],'outputs':outputs,'strictGain':0,'activeWrites':0,'humanApproval':False})
print(json.dumps({'entry':bind(p),'firstSeal':bind(f),'outputs':len(outputs),'normalAIProfiles':len(records),'readabilityDeltaFields':len(d['changedTextFields'])}))
