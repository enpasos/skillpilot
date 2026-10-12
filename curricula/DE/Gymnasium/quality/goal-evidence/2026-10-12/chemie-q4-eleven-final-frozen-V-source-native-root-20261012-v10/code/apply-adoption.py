from pathlib import Path
import json,hashlib,shutil,subprocess,copy,datetime,sys
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12';N=E/'chemie-q4-eleven-final-frozen-V-source-native-root-20261012-v10'
LIVE=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');SEM=Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json');QA=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json');REG=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');LED=Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json');HIST=Path('scripts/config/historical-goal-visualization-assets.json');SRC=Path('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
rd=lambda p:json.loads(p.read_text());rp=lambda p:str(p.relative_to(R));sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,x,new=False):
 p.parent.mkdir(parents=True,exist_ok=True)
 if new:assert not p.exists(),p
 p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def verifyseal(p):
 x=rd(p);rows=x.get('ownedFiles',x.get('ownFiles',x.get('files')));assert isinstance(rows,list)
 for row in rows:
  rel=Path(row['path']);f=R/rel if rel.parts[0]=='curricula' else p.parent/rel
  assert f.resolve().is_relative_to(p.parent.resolve()),f
  assert sha(f)=='sha256:'+row['sha256'].removeprefix('sha256:'),f
  assert f.stat().st_size==row['bytes'],f
plan=rd(N/'ROOT.future-active-adoption.plan.json');receipt=N/'APPLIED.genuine-Q4-eleven.actual.json';assert not receipt.exists()
verifyseal(N/'FINAL.root-technical-adoption.freeze.json');assert sha(R/LIVE)==plan['currentCanonicalDependency']['sha256'];assert sha(R/plan['candidateCanonical']['path'])==plan['candidateCanonical']['sha256']
old=rd(R/LIVE);new=rd(R/plan['candidateCanonical']['path']);a={g['id']:g for g in old['goals']};b={g['id']:g for g in new['goals']};ids=plan['selectedGoalIds'];chosen=set(ids);assert len(a)==523 and set(a)==set(b)
assert all(a[g]==b[g] for g in a if g not in chosen);assert all(a[g].get('requires',[])==b[g].get('requires',[]) and a[g].get('contains',[])==b[g].get('contains',[]) for g in a)
regs=rd(R/REG);protected=copy.deepcopy([s for s in regs['subjects'] if s['subject']!='chemie']);chem=next(s for s in regs['subjects'] if s['subject']=='chemie')
claims=[]
for p in plan['descriptionIndexPaths']:
 ix=rd(R/p);assert all(r['strictDescriptionComplete'] for r in ix['resolutions']);claims += [x['goalId'] for x in ix['resolutions']]
assert len(claims)==11 and set(claims)==chosen
for p in [LIVE,SEM,QA,REG,LED,HIST,SRC]:
 q=N/'before-active'/p;assert not q.exists();q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(R/p,q)
hist=rd(R/HIST);oldhist=copy.deepcopy(hist['assets']);image_receipts=[]
for row in plan['correctedImages']:
 gid=row['goalId'];oldimg=R/row['oldImage']['path'];png=R/row['correctedPNG']['path'];prompt=R/row['prompt']['path'];assert sha(oldimg)==row['oldImage']['sha256'] and sha(png)==row['correctedPNG']['sha256'] and sha(prompt)==row['prompt']['sha256']
 rel=Path('chemie')/gid/oldimg.name;assert not any(x['path']==str(rel) for x in hist['assets'])
 hist['assets'].append({'path':str(rel),'sha256':sha(oldimg).removeprefix('sha256:'),'supersededBy':str(rel.with_suffix('.png')),'reason':'Exact historical JPEG retained after actual thermodynamics/RGT scientific defects and sealed independent reviews of the corrected PNG; retention is not approval.','reviewEvidencePath':rp(N/'checks/final-independent-review-and-scope-summary.actual.json')})
 for pp in oldimg.parent.glob('*prompt*.md'):
  q=N/'historical-prompts'/gid/pp.name;q.parent.mkdir(parents=True,exist_ok=True);assert not q.exists();shutil.copyfile(pp,q)
 link=next(x for x in b[gid]['resourceLinks'] if x['type']=='goal-visualization' and x['role']=='primary')
 commands=[('prepare',['node','scripts/prepare_goal_visualization.mjs',gid,'--landscape',str(LIVE),'--subject','chemie','--provider',link['provider'],'--review-status',link['reviewStatus']]),('import',['node','scripts/import_goal_visualization.mjs',gid,str(png),'--landscape',str(LIVE),'--subject','chemie','--provider',link['provider'],'--review-status',link['reviewStatus'],'--license',link['license'],'--description',link['description'],'--alt-text',link['altText'],'--prompt',str(prompt)])]
 for label,cmd in commands:
  r=subprocess.run(cmd,cwd=R,text=True,capture_output=True);wr(N/'active-checks'/f'{gid}.{label}.actual.json',{'argv':cmd,'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr,'normalProductionCodeUnmodified':True},True);assert r.returncode==0,r.stderr
 image_receipts.append(row)
current=rd(R/LIVE)
for i,g in enumerate(current['goals']):
 if g['id'] in chosen:current['goals'][i]=copy.deepcopy(b[g['id']])
assert current==new;wr(R/LIVE,current)
sem=rd(R/SEM);sc=rd(N/'candidate/semantic523.exact-decisions-final-path.inactive.json');sd={x['goalId']:x for x in sc['decisions']};changed=[]
for i,x in enumerate(sem['decisions']):
 if x!=sd[x['goalId']]:
  assert x['goalId'] in chosen and x['semanticKind']==sd[x['goalId']]['semanticKind']=='curricularAtomic';changed.append(x['goalId']);sem['decisions'][i]=copy.deepcopy(sd[x['goalId']])
assert set(changed)=={'4a08f31f-204c-5339-9d9f-5d2af28d5d5c','dc5173e8-6e63-58d3-a79b-bd74ef3cb98b'};wr(R/SEM,sem)
qa=rd(R/QA);future=rd(N/'candidate/QA.actual-sealed-asset-votes-future-active-paths.inactive.json');qf={x['goalId']:x for x in future['records']};oldqa=copy.deepcopy(qa['records']);qa_changes=[]
for i,x in enumerate(qa['records']):
 y=qf[x['goalId']]
 if x==y:continue
 assert x['goalId'] in chosen;assert {k:v for k,v in x.items() if 'human' in k.lower()}=={k:v for k,v in y.items() if 'human' in k.lower()}
 assert y['aiApproved']=='yes' and y['assetSha256']==y['aiApprovedAssetSha256'];qa_changes.append(x['goalId']);qa['records'][i]=copy.deepcopy(y)
assert len(qa_changes)==6;wr(R/QA,qa);wr(R/HIST,hist);assert hist['assets'][:len(oldhist)]==oldhist
source=rd(R/SRC)
for row in plan['boundedSourceMappingAdoptions']:
 target=R/row['target'];assert not target.exists() and sha(R/row['prepared'])==row['sha256'];target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(R/row['prepared'],target)
 assert source['mappingPaths'].count(row['before'])==1;source['mappingPaths']=[row['target'] if x==row['before'] else x for x in source['mappingPaths']]
assert any('DE-SH' in x and 'micelle' in x for x in source['mappingPaths']);wr(R/SRC,source)
for p in plan['futureActiveConfigPaths']['positive']:chem['positiveEvidenceConfigPaths'].append(p)
chem['semanticAtomicityConfigPaths'].append(plan['futureActiveConfigPaths']['atomicity']);chem['memoryReviewConfigPath']=plan['futureActiveConfigPaths']['memory'];chem['resolutionIndexPaths'].extend(plan['descriptionIndexPaths']);assert [s for s in regs['subjects'] if s['subject']!='chemie']==protected;wr(R/REG,regs)
ledger=rd(R/LED);remain=[];removed=[]
for p in ledger['activeBatchConfigPaths']:
 c=rd(R/p);overlap=chosen&set(c['goalIds'])
 if not overlap:remain.append(p);continue
 assert set(c['goalIds'])==chosen;removed.append(p)
assert len(removed)==1;ledger['activeBatchConfigPaths']=remain;wr(R/LED,ledger)
for row in image_receipts:
 for pref in ['curricula/DE/Gymnasium/visualizations','app/public/assets/goal-visualizations','backend/src/main/resources/static/assets/goal-visualizations']:
  assert sha(R/pref/'chemie'/row['goalId']/(row['goalId']+'.png'))==row['correctedPNG']['sha256']
wr(receipt,{'role':'Actual root integration of 11 genuinely paired current Chemie goals; strict delta pending normal central report','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'selectedGoalIds':ids,'priorStrictCount':220,'expectedCurrentDenominator':402,'expectedNewScientificClosures':11,'bindingOnlyRestorations':0,'all523IdsAndEdgesPreserved':True,'other517WholeGoalsExact':True,'protectedAllNonChemistryRegistryEntriesExact':True,'source4AdoptedFifthExperimentalRowDeferred':True,'originalAuthorProfilesAndIndependentRecordsExact':True,'M402Other391RawExactAndCards75Exact':True,'retiredClaim':removed,'remainingChemistryOpenClaims':15,'images':image_receipts,'modernMachineVOnlyNoHumanOrLegacyPublicationFlagFlipped':True,'humanApproval':False,'humanTrial':False,'canonicalSHAAfter':sha(R/LIVE),'registrySHAAfter':sha(R/REG),'qaChangedGoalIds':qa_changes},True)
print(json.dumps({'appliedChemistryGoals':11,'denominator':402,'strictCountPendingActualCentralCheck':True,'protectedSubjectsPreserved':True}))
