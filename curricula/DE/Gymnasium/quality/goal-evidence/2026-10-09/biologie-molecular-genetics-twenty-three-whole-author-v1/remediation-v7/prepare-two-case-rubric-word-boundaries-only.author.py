from pathlib import Path
import json,copy,re,hashlib,datetime,subprocess
B=Path(__file__).resolve().parent.relative_to(Path.cwd());O=B.parent/'remediation-v6'
def read(p):return json.loads(p.read_text())
def bind(p):
 z=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(z).hexdigest(),'bytes':len(z)}
def write(p,x):
 assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
oldp=O/'twenty-three-whole46-bilingual-cases-and-P.v6.author-candidate.json';old=read(oldp);x=copy.deepcopy(old);deltas=[]
for i in (0,1):
 rubric=x['entries'][22]['newAuthoredWholeCases'][i]['rubric'][0]
 before=rubric['criterionEn'];assert '1–22/X/Ytypes' in before
 after=before.replace('1–22/X/Ytypes','1–22/X/Y types');assert re.sub(r'\s','',before)==re.sub(r'\s','',after)
 rubric['criterionEn']=after;deltas.append({'pointer':f'/entries/22/newAuthoredWholeCases/{i}/rubric/0/criterionEn','before':before,'after':after})
assert len(deltas)==2
for i in range(23):
 assert x['entries'][i]['wholeCurrentGoal']==old['entries'][i]['wholeCurrentGoal']
 assert x['entries'][i]['wholeProfile']==old['entries'][i]['wholeProfile']
 if i!=22:assert x['entries'][i]==old['entries'][i]
# Prove the complete new input becomes valueexact after undoing exactly the two disclosed fields.
y=copy.deepcopy(x)
for i in (0,1):y['entries'][22]['newAuthoredWholeCases'][i]['rubric'][0]['criterionEn']=old['entries'][22]['newAuthoredWholeCases'][i]['rubric'][0]['criterionEn']
assert y==old
whole=B/'twenty-three-whole46-bilingual-cases-and-P.v7.author-candidate.json';write(whole,x)
proof=B/'exact-two-karyogram-case-rubric-fields-whitespace-only.actual.json';write(proof,{'schemaVersion':1,'deltas':deltas,'all23WholeProfilesExactV6':True,'all23WholeGoalsExactV6':True,'other22WholeEntriesExactV6':True,'entireBodyValueExactAfterUndoingTwoFields':True,'completeChromosomeMatricesAndScientificCharactersExact':True,'activeWrites':0,'strictGain':0})
entry=B/'neutral-whole23-two-karyogram-case-rubric-word-boundaries-v7.author-review.entry.json'
write(entry,{'schemaVersion':1,'role':'Neutral author successor: exactly two English case rubric whitespace repairs; current native23 predecessor remains immutable','preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'all23CurrentWholeGoalsCasesAndProfiles':bind(whole),'exactWhitespaceOnlyDeltas':bind(proof),'predecessorScienceV6':bind(O/'neutral-whole23-three-profile-word-boundaries-v6.author-review.entry.json'),'predecessorScienceV6FirstSeal':bind(O/'three-profile-word-boundaries-v6.author.first.freeze.json'),'ordinaryProfileCandidateSetExactReuse':bind(O/'twenty-three-whole-positive-profile-candidate-set.v6.author.json'),'ordinaryProfileConfigExactReuse':bind(O/'twenty-three-whole-positive.v6.author-candidate.config.json'),'ordinaryAuthorProfileRecordsExactReuse':bind(O/'twenty-three-whole-positive.v6.author-candidate.review.jsonl'),'targetedGoalIds':[x['entries'][22]['goalId']],'changedPointers':[z['pointer'] for z in deltas],'targetedNativeCaseBindingReviewPending':True,'all23ProfileBodiesExact':True,'all23GoalBodiesExact':True,'other22WholeEntriesExact':True,'originalScienceAndNativeFirstSealsRetained':True,'status':'ai_candidate','humanApproval':False,'independentReviews':[],'activeWrites':0,'strictGain':0})
seal=B/'two-karyogram-case-rubric-word-boundaries-v7.author.first.freeze.json';write(seal,{'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Actual author first seal; no independent approval','inputs':[bind(oldp),bind(O/'neutral-whole23-three-profile-word-boundaries-v6.author-review.entry.json'),bind(O/'three-profile-word-boundaries-v6.author.first.freeze.json')],'outputs':[bind(z) for z in sorted(B.rglob('*')) if z.is_file()],'humanApproval':False,'activeWrites':0,'strictGain':0})
print(json.dumps({'entry':bind(entry),'firstSeal':bind(seal),'changedCaseRubricFields':2}))
