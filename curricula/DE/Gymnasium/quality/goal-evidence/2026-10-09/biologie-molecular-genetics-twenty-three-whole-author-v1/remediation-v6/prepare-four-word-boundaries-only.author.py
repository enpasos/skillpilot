from pathlib import Path
import json,copy,re,hashlib,datetime,subprocess
B=Path(__file__).resolve().parent.relative_to(Path.cwd());S=B.parent;O=S/'remediation-v5'
def read(p):return json.loads(p.read_text())
def bind(p):
 z=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(z).hexdigest(),'bytes':len(z)}
def write(p,x):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
old=read(O/'twenty-three-whole46-bilingual-cases-and-P.v5.author-candidate.json');x=copy.deepcopy(old);deltas=[]
fixes={'andall':'and all','GArepair':'GA repair','Genomvs':'Genom vs','X/Ytypes':'X/Y types'}
def fix(v,p=''):
 if isinstance(v,str):
  out=v
  for a,b in fixes.items():out=out.replace(a,b)
  if out!=v:
   assert re.sub(r'\s','',out)==re.sub(r'\s','',v);deltas.append({'pointer':p,'before':v,'after':out})
  return out
 if isinstance(v,list):return [fix(z,p+'/'+str(i)) for i,z in enumerate(v)]
 if isinstance(v,dict):return {k:fix(z,p+'/'+k) for k,z in v.items()}
 return v
for i in (21,22):x['entries'][i]['wholeProfile']=fix(x['entries'][i]['wholeProfile'],'/entries/'+str(i)+'/wholeProfile')
assert len(deltas)==3,(len(deltas),deltas)
for i in range(23):
 assert x['entries'][i]['wholeCurrentGoal']==old['entries'][i]['wholeCurrentGoal']
 for k in old['entries'][i]:
  if k!='wholeProfile':assert x['entries'][i][k]==old['entries'][i][k]
 if i not in (21,22):assert x['entries'][i]==old['entries'][i]
write(B/'twenty-three-whole46-bilingual-cases-and-P.v6.author-candidate.json',x)
cs=read(O/'twenty-three-whole-positive-profile-candidate-set.v5.author.json');cs['reviewId']='biologie-molecular-genetics-twenty-three-whole-author-remediation-v6'
for e in cs['goals']:e['profile']=next(z['wholeProfile'] for z in x['entries'] if z['goalId']==e['goalId'])
write(B/'twenty-three-whole-positive-profile-candidate-set.v6.author.json',cs)
cfg=read(O/'twenty-three-whole-positive.v5.author-candidate.config.json');cfg['reviewId']=cs['reviewId'];cfg['reviewPath']=str(B/'twenty-three-whole-positive.v6.author-candidate.review.jsonl');cfg['scope']['label']='Whole23 current author successor: three whitespace-only profile text fields for two goals; all46 cases exact v5; independent native/current reviews pending'
config=B/'twenty-three-whole-positive.v6.author-candidate.config.json';write(config,cfg)
write(B/'exact-three-profile-text-fields-whitespace-only.actual.json',{'schemaVersion':1,'deltas':deltas,'all46WholeCasesExactV5':True,'all23GoalsExactV5':True,'other21WholeEntriesExactV5':True,'allScientificCharactersIgnoringWhitespaceExact':True,'activeWrites':0,'strictGain':0})
for name,argv in [('ordinary-materialize-P23-v6',['app/node_modules/.bin/tsx','app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',str(config),'--candidates',str(B/'twenty-three-whole-positive-profile-candidate-set.v6.author.json'),'--write']),('ordinary-check-P23-v6',['app/node_modules/.bin/tsx','app/scripts/positiveGoalEvidenceReview.ts','--config='+str(config),'--mode=check'])]:
 r=subprocess.run(argv,capture_output=True,text=True);(B/'checks').mkdir(exist_ok=True);(B/'checks'/f'{name}.stdout.actual.txt').write_text(r.stdout);(B/'checks'/f'{name}.stderr.actual.txt').write_text(r.stderr);write(B/'checks'/f'{name}.terminal.actual.json',{'argv':argv,'actualExitCode':r.returncode,'scientificApproval':False,'humanApproval':False,'activeWrites':0});assert r.returncode==0,r.stderr
entry=read(O/'neutral-whole23-three-readability-only-successors-v5.author-review.entry.json');entry.update({'role':'Neutral whole23 author v6: only three profile prose fields gain normal whitespace; all46 cases and23 goals exact v5','preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'all23CurrentWholeGoalsCasesAndProfiles':bind(B/'twenty-three-whole46-bilingual-cases-and-P.v6.author-candidate.json'),'ordinaryProfileCandidateSet':bind(B/'twenty-three-whole-positive-profile-candidate-set.v6.author.json'),'ordinaryProfileConfig':bind(config),'ordinaryAuthorProfileRecords':bind(B/'twenty-three-whole-positive.v6.author-candidate.review.jsonl'),'exactWhitespaceOnlyDeltas':bind(B/'exact-three-profile-text-fields-whitespace-only.actual.json'),'predecessorScienceV5':bind(O/'neutral-whole23-three-readability-only-successors-v5.author-review.entry.json'),'predecessorScienceV5FirstSeal':bind(O/'three-readability-only-successors-v5.author.first.freeze.json'),'targetedReadabilityGoalIds':[x['entries'][i]['goalId'] for i in (21,22)],'targetedWholeInputPointers':['/entries/21/wholeProfile','/entries/22/wholeProfile'],'retention':{'other21WholeEntriesExactV5':True,'all46WholeCasesExactV5':True,'all23WholeDEENGoalsExactV5':True,'everyChangedTextIdenticalAfterRemovingWhitespace':True,'originalFirstReviewsAndSealsPreserved':True}})
p=B/'neutral-whole23-three-profile-word-boundaries-v6.author-review.entry.json';write(p,entry)
f=B/'three-profile-word-boundaries-v6.author.first.freeze.json';write(f,{'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Author first seal; independent review pending','inputs':[bind(O/'neutral-whole23-three-readability-only-successors-v5.author-review.entry.json'),bind(O/'three-readability-only-successors-v5.author.first.freeze.json')],'outputs':[bind(z) for z in sorted(B.rglob('*')) if z.is_file()],'humanApproval':False,'activeWrites':0,'strictGain':0})
print(json.dumps({'entry':bind(p),'firstSeal':bind(f),'changedProfileFields':len(deltas)}))
