from pathlib import Path
import copy,datetime,hashlib,json,shutil
O=Path(__file__).resolve().parent;K=O.parent/'current439-remediation14-guarded-root-integration-technical-v1/capsule'
def load(p):return json.loads(Path(p).read_text())
def pin(p):return {'path':str(p),'sha256':hashlib.sha256(Path(p).read_bytes()).hexdigest(),'bytes':Path(p).stat().st_size}
s=load(O/'SELECTOR.clean-current-Source9-HB97-with-real-assets-reviewer-inputs.sealed.json');Cpath=K/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';C=load(Cpath);by={g['id']:g for g in C['goals']};parents={}
for g in C['goals']:
 for cid in g.get('contains',[]):parents.setdefault(cid,[]).append(g['id'])
ids=set(s['mappedTargetGoalIds']);todo=list(ids)
while todo:
 g=by[todo.pop()]
 for cid in g.get('contains',[]):
  if cid not in ids:ids.add(cid);todo.append(cid)
Ppath=Path(load(s['view']['path'])['currentP439SourcePin']['path']);profiles={p['goalId']:(i,p['profile'])for i,line in enumerate(Ppath.read_text().splitlines(),1)if line.strip()for p in [json.loads(line)]}
blocked={'reviewedAt','reviewer','reviewAuthority','reviewRunId','reviewRunIds','reviewId','author','authorCreatedAt','authorOnly','decision','status','verdict','wholeSourceUnionApproved','wholeSourceApproval','wholeCourseApproval','HumanApproval','HumanTrial','M7Claim','independentReviewPending','independentSourceReviewPending','reviewedAtUTC','accepted'}
def safe(x):
 if isinstance(x,list):return [safe(v)for v in x]
 if not isinstance(x,dict):return x
 return {k:safe(v)for k,v in x.items()if k not in blocked}
def goal(g):
 x=copy.deepcopy(g)
 for key in ['authorCaseIds','idDerivation','sourceDutySplitAuthor','sourceAuthorProposal','authorProposal']:x.get('extendedData',{}).pop(key,None)
 return safe(x)
whole=[];assets=[]
for gid in sorted(ids):
 g=by[gid];pr=profiles.get(gid);whole.append({'goalId':gid,'isDirectMappedTarget':gid in s['mappedTargetGoalIds'],'wholeCurrentScientificCanonicalGoal':goal(g),'wholeDirectPrerequisiteGoals':[goal(by[r.split(':')[-1]])for r in g.get('requires',[])if r.split(':')[-1]in by],'wholeDirectParentGoals':[goal(by[r])for r in parents.get(gid,[])],'wholeCurrentEvidenceProfile':pr[1]if pr else None,'profileJsonPointer':'line:'+str(pr[0])+'#/profile'if pr else None})
 for link in g.get('resourceLinks',[]):
  url=link.get('url','')
  if not url.startswith('/assets/'):continue
  source=K/'app/public'/url.lstrip('/');p=pin(source);dest=O/'assets'/p['sha256']/source.name;dest.parent.mkdir(parents=True,exist_ok=True)
  if not dest.exists():shutil.copyfile(source,dest)
  assert pin(dest)['sha256']==p['sha256'];assets.append({'goalId':gid,'wholeCurrentResourceLink':link,'originalRepoPath':str(source.relative_to(K)),'originalPin':p,'reviewCopyRelativePath':str(dest.relative_to(O)),'reviewCopyPin':pin(dest)})
p=O/'CONTEXT.complete-41-current-mapped-target-subtrees-P-profiles-and-real-assets.no-old-verdicts.json';p.write_text(json.dumps({'role':'Whole current direct mapped targets and complete mapped-cluster descendant bodies, with current P bodies and actual bound originals; not new judgments','wholeTargetContexts':whole,'directMappedGoalIds':s['mappedTargetGoalIds'],'completeTargetClosureIds':sorted(ids),'actualBoundAssets':assets,'currentC650SourcePin':pin(Cpath),'currentP439SourcePin':pin(Ppath),'MainMutated':False,'KMutated':False},ensure_ascii=False,indent=2)+'\n');p.chmod(0o444)
q4='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-material4-v3-targeted-preparation-technical-v1';mat=K/q4/'MATERIAL.current4-v3-whole-operative-cases.no-review-metadata.json';m=load(mat);relevant=[c for c in m['cases']if c['assignedGoalId']in ids]
mp=O/'MATERIAL.relevant-current-V3-whole-operative-cases.no-old-verdicts.json';mp.write_text(json.dumps({'role':'Exact whole operative current material cases for source9 target-closure goals only','sourceProjectionPin':pin(mat),'casePointers':['/cases/'+str(m['cases'].index(c))for c in relevant],'cases':relevant,'actualLearnerPracticalPerformanceClaim':False,'newScience':False},ensure_ascii=False,indent=2)+'\n');mp.chmod(0o444)
s3=dict(s);s3['previousSelector']=pin(O/'SELECTOR.clean-current-Source9-HB97-with-real-assets-reviewer-inputs.sealed.json');s3['completeMappedTargetSubtreeContextsAndAssets']=pin(p);s3['relevantWholeCurrentOperativeMaterials']=pin(mp);s3['completeMappedTargetClosureCount']=len(ids);s3['completeMappedTargetClosureIds']=sorted(ids);s3['completeBoundAssetCount']=len(assets);s3['sourceGuards']=s['sourceGuards']+[a['originalPin']for a in assets]+[pin(mat)];s3['sourceGuardCount']=len(s3['sourceGuards']);s3['createdAtUTC']=datetime.datetime.now(datetime.timezone.utc).isoformat()
for item in s3['sourceGuards']:assert pin(Path(item['path']))==item
p=O/'SELECTOR.clean-current-Source9-HB97-with-whole-target-subtrees-real-assets-materials.sealed.json';p.write_text(json.dumps(s3,indent=2)+'\n');p.chmod(0o444);print(json.dumps({'selector':pin(p),'targetClosureCount':len(ids),'assets':len(assets),'wholeRelevantCases':len(relevant),'guardCount':s3['sourceGuardCount']}))
