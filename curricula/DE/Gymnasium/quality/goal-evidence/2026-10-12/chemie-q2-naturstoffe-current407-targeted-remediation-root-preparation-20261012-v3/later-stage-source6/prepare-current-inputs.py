# SPDX-License-Identifier: Apache-2.0
"""Informed technical combination only. No scientific decisions or active writes."""
import copy,datetime,hashlib,json,pathlib,shutil,unicodedata
R=pathlib.Path.cwd();D=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
ROOT=D/'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3';B=ROOT/'later-stage-source6'
N=D/'chemie-q2-naturstoffe-current402-author-20261012-v2';S=D/'chemie-q2-naturstoffe-source4-MM-targeted-remediation-author-20261012-v3';P9=D/'chemie-q2-naturstoffe-P9-targeted-remediation-author-20261012-v3'
CAP=R/'tmp/chemie-current407-root-v3-normal-capsule'
def read(p):return json.loads(p.read_text())
def rel(p):return str(p.relative_to(R))
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def ref(p):return {'path':rel(p),'bytes':p.stat().st_size,'sha256':sha(p)}
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def lines(p):return [s for s in p.read_text().splitlines() if s.strip()]
def records(p):return [json.loads(s) for s in lines(p)]
def normal(x):return ' '.join(unicodedata.normalize('NFKC',str(x or '')).split())
def stable(x):
 if isinstance(x,dict):return '{'+','.join(json.dumps(k,ensure_ascii=False)+':'+stable(v) for k,v in sorted(x.items()))+'}'
 if isinstance(x,list):return '['+','.join(stable(v) for v in x)+']'
 return json.dumps(x,ensure_ascii=False,separators=(',',':'))
def fp(g,rv):
 x={'ruleVersion':rv,'goalId':g['id'],'shortKey':g.get('shortKey','')}
 for k in ['title','titleEn','description','descriptionEn','nodeKind']:x[k]=normal(g.get(k))
 for k in ['phase','area','topicCode']:x[k]=normal(g.get('dimensionTags',{}).get(k))
 return 'sha256:'+hashlib.sha256(stable(x).encode()).hexdigest()
assert not (B/'FINAL.technical-preparation.freeze.json').exists()
seals=[]
for p in [N/'FINAL.author-package.freeze.json',S/'FINAL.author-package.freeze.json',P9/'FINAL.author-package.freeze.json']:
 j=read(p)
 for x in j['ownFiles']:assert sha(R/x['path'])==x['sha256'] and (R/x['path']).stat().st_size==x['bytes']
 seals.append({**ref(p),'ownedFilesVerified':len(j['ownFiles'])})
pre=ROOT/'candidate/canonical532.current-active-five-plus-N2-plus-ee4.inactive.json'
land=read(pre);old=read(N/'candidate/canonical532.complete-inactive.json');g={x['id']:x for x in land['goals']};base={x['id']:x for x in old['goals']}
deltas=read(S/'author/exact5.goal-deltas.json')['deltas'];applied=[]
for x in deltas:
 for key in x['changedFields']:
  assert g[x['goalId']].get(key)==x['before'].get(key),(x['goalId'],key,'three-way conflict')
  if key in x['after']:g[x['goalId']][key]=copy.deepcopy(x['after'][key])
  else:g[x['goalId']].pop(key,None)
  applied.append({'goalId':x['goalId'],'field':key})
cp=B/'candidate/canonical532.current-active-plus-N2-P9-source6-ee4.inactive.json';write(cp,land)
live=read(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');liveg={x['id']:x for x in live['goals']}
deep=read(R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');sub=next(x for x in deep['subjects'] if x['subject']=='chemie')
activeP={};activeConfigs=[]
for cpath in sub['positiveEvidenceConfigPaths']:
 c=read(R/cpath);activeConfigs.append((cpath,c))
 for s in lines(R/c['reviewPath']):
  row=json.loads(s)
  if row['goalId'] not in c['scope']['goalIds']:continue
  if row['goalId'] in activeP:assert activeP[row['goalId']]['line']==s,'conflicting activeP'
  activeP[row['goalId']]={'line':s,'record':row,'configPath':cpath,'config':c,'recordPath':c['reviewPath']}
m1id='2fdd759f-8349-5f7e-b29a-6ac7fb0299f9';mechanism='3fb7dea4-f832-5e23-b518-68b13a655b92';e81='e81a4aed-9695-533e-8eb7-7a0c714346ea'
assert g[m1id]==liveg[m1id],'M1 current canonical lost'
assert g[e81]==liveg[e81], 'practical owner canonical must be unchanged'
for i in [m1id,mechanism,e81]:assert i in activeP,('missing currentP',i)
oldP=N/'positive/P36.actual-bound.ai-candidate.review.jsonl';chosen={json.loads(s)['goalId']:s for s in lines(oldP)};origins={i:ref(oldP) for i in chosen}
overlay=[P9/'positive/P9.author-run-bound.pending.review.jsonl',S/'positive/P6.actual-bound.ai-candidate.review.jsonl',ROOT/'positive/P3.normal-materialized-current.pending.review.jsonl']
for p in overlay:
 for s in lines(p):chosen[json.loads(s)['goalId']]=s;origins[json.loads(s)['goalId']]=ref(p)
for gid in ['014e6d85-eecf-5228-9031-52a39981cd0d','127e2fc9-23f3-5ce8-a1c9-8c9e014c8a8a']:
 chosen[gid]=activeP[gid]['line'];origins[gid]={'path':activeP[gid]['recordPath'],'currentActiveExactLine':True,'configPath':activeP[gid]['configPath']}
assert len(chosen)==37
pp=B/'positive/P37.current-whole-retained-and-targeted.pending.review.jsonl';pp.parent.mkdir(parents=True,exist_ok=True);pp.write_text(''.join(chosen[i]+'\n' for i in sorted(chosen)))
extra=B/'positive/P2.current-M1-and-3fb7-retained.exact.jsonl';extra.write_text(activeP[m1id]['line']+'\n'+activeP[mechanism]['line']+'\n')
write(B/'inputs/P37-and-current-M1-3fb7-exact-origins.json',{'origins':origins,'currentAdditional':{i:activeP[i] for i in [m1id,mechanism]},'oldE81PreservedOriginal':ref(S/'inputs/e81a4aed.retained-current-whole-P.original-exact.jsonl'),'P37Count':37,'scientificVotesCreated':0})
write(B/'checks/exact-current-five-and-e81-canonical-retention.json',{'rootInput':ref(pre),'onlyS6FieldsApplied':applied,'M1WholeCanonicalExactCurrent':g[m1id]==liveg[m1id],'M1CurrentPLineExact':extra.read_text().splitlines()[0]==activeP[m1id]['line'],'e81WholeCanonicalExactCurrent':g[e81]==liveg[e81],'active014e127ePLineExact':all(chosen[i]==activeP[i]['line'] for i in ['014e6d85-eecf-5228-9031-52a39981cd0d','127e2fc9-23f3-5ce8-a1c9-8c9e014c8a8a']),'seals':seals,'activeWrites':False})

# Existing operative complete case material remains immutable. The binding index
# selects one whole source per goal/case and records typography differences.
case_sources={};history=[]
v1=N.parent/'chemie-q2-naturstoffe-current402-author-20261012-v1/cases/whole31.DEEN.cases-and-current-context.author.json'
for row in read(v1)['goals']:
 for case in row['cases']:
  case_sources[row['goalId'],case['id']]={'goalId':row['goalId'],'case':case,'rubric':row['rubric'],'retainedWholeOriginalGoalCaseContext':row,'originalSource':ref(v1)}
for p in [P9/'cases/P9-updated-and-retained-whole-DEEN.cases-material-rubrics.json',S/'cases/whole5.DEEN.tasks-material-modelanswers-rubrics.json',S/'cases/e81a4aed-BW-halogen-operator.DEEN.full-cases.json']:
 for row in read(p)['cases']:
  k=row['goalId'],row['case']['id']
  if k in case_sources:history.append({'goalId':k[0],'caseId':k[1],'retainedHistoricalBefore':case_sources[k],'afterSource':ref(p)})
  case_sources[k]={**row,'originalSource':ref(p)}
lower=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1/input/whole26-raw-profiles-and52-whole-cases.exact-neutral-input.json'
wholelower=read(lower)
lowerrows=wholelower.get('routineBodies',[])
lowerE81=next(x for x in lowerrows if x.get('wholeGoal',{}).get('id')==e81)
write(B/'cases/e81.retained-lower-full-original-material.exact.json',{'originalInput':ref(lower),'routineBody':lowerE81,'currentWholeProfile':json.loads(chosen[e81])['profile'],'currentActiveLineOriginal':activeP[e81]['record'],'noScienceRewritten':True})
for case in json.loads(chosen[e81])['profile']['applicationCaseBriefs']:
 k=e81,case['id']
 if k not in case_sources:case_sources[k]={'goalId':e81,'case':case,'retainedWholeOriginalMaterial':lowerE81,'retainedOriginalActiveProfile':activeP[e81]['record'],'originalSource':ref(lower),'technicalBindingOnly':True}
effective=[];bind=[];missing=[]
for gid,s in sorted(chosen.items()):
 for c in json.loads(s)['profile']['applicationCaseBriefs']:
  k=gid,c['id'];x=case_sources.get(k)
  if x is None:missing.append({'goalId':gid,'caseId':c['id']});continue
  fields=[a for a,v in c.items() if x['case'].get(a)!=v]
  effective.append({'goalId':gid,'caseId':c['id'],'wholeOriginalCase':x,'exactCurrentCaseBrief':c,'technicalTextFieldDifferences':fields,'noAuthorScienceRewritten':True})
  bind.append({'goalId':gid,'caseId':c['id'],'source':x['originalSource'],'exactWholeCaseBrief':not fields,'currentVsDeclaredWholeFieldsDiffer':fields})
assert not missing,missing
write(B/'cases/P37.unique-whole-case-and-current-brief-bindings.json',{'scopeGoalCount':37,'cases':effective,'duplicates':0,'missingCases':missing,'newScientificVotes':0,'formatDifferencesRequireReview':True})
write(B/'cases/P37.exact-original-case-conservation-and-binding-index.json',{'bindings':bind,'replacedHistoricalWholeCasesRetained':history,'originalP9WholeFile':ref(P9/'cases/P9-updated-and-retained-whole-DEEN.cases-material-rubrics.json'),'originalS6WholeFiles':[ref(S/'cases/whole5.DEEN.tasks-material-modelanswers-rubrics.json'),ref(S/'cases/e81a4aed-BW-halogen-operator.DEEN.full-cases.json')]})

# No default whole-curricula scans: the outside-curricula capsule contains copied
# unchanged command code and exact selected paths. Images are immutable symlinks.
CAP.mkdir(parents=True,exist_ok=True);(CAP/'app/scripts').mkdir(parents=True,exist_ok=True)
for p in (R/'app/scripts').glob('*'):
 if p.is_file() and p.suffix in ['.ts','.mts','.mjs','.js']:shutil.copy2(p,CAP/'app/scripts'/p.name)
for name in ['lib']:
 shutil.copytree(R/'app/scripts'/name,CAP/'app/scripts'/name,dirs_exist_ok=True)
for src,dest in [(R/'app/src',CAP/'app/src'),(R/'app/node_modules',CAP/'app/node_modules'),(R/'contracts',CAP/'contracts'),(R/'curricula',CAP/'curricula')]:
 if not dest.exists():dest.symlink_to(src,target_is_directory=True)
(CAP/'app/public').mkdir(parents=True,exist_ok=True)
write(B/'inputs/capsule.absolute-location.json',{'capsulePath':str(CAP),'containsModifiedProductionCode':False,'curriculaSymlinkReadOnlyByTask':'all generated artifacts use fresh later-stage paths; no input or active output overwrite','newScientificVotes':0})
for name in ['BW126.whole-original-clauses-plus-bounded-two-components.inactive.review.json','HE.whole-clauses-AA-TLC-owner-and-MM-context.inactive.review.json']:
 p=S/'sources'/name;dest=B/'sources'/name;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest);assert sha(p)==sha(dest)
write(B/'inputs/current-source-atlas.input-config.exact.json',read(R/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'))
write(B/'inputs/INITIAL.technical-role-and-original-CAS.json',{'role':'informed author/technical preparer, not independent reviewer','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sealsVerified':seals,'rootOriginalFirst':ref(ROOT/'FIRST.three-way-current402-science-retention-and-targeted-candidate-inputs.json'),'rootPreS6Canonical':ref(pre),'S6CanonicalDeltasOnlyApplied':applied,'sourceMMMeans':'Michaelis–Menten, not molecular masses','activeOrGitWrites':False,'newScientificVotes':0,'candidateNodeCount':len(g),'candidateAtomicCount':407})
print(json.dumps({'stage':rel(B),'canonical':rel(cp),'P37':len(chosen),'resolvedWholeCases':len(effective),'caseBriefDifferenceRows':sum(bool(x['technicalTextFieldDifferences']) for x in effective),'activeAdditionalM1and3fb':2,'capsule':str(CAP),'newScientificVotes':0}))
