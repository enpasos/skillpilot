from pathlib import Path
import copy,datetime,hashlib,json,shutil
O=Path(__file__).resolve().parent;K=O.parent/'current439-remediation14-guarded-root-integration-technical-v1/capsule';M=Path('/home/enpasos/projects/skillpilot');D=O.parent/'current439-main-portable-integration-plan-technical-v1/lower-layer-diagnosis-readonly-v1'
def load(p):return json.loads(Path(p).read_text())
def digest(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def pin(p):return {'path':str(p),'sha256':digest(p),'bytes':Path(p).stat().st_size}
guards={};removed=[];primary={}
def guard(p):
 p=Path(p);v=pin(p);guards[str(p)]=v;return v
def logical(p):
 try:return str(Path(p).relative_to(K))
 except ValueError:return str(p)
def safe_metadata(obj,pointer=''):
 # Current scientific wording, qualifiers and data remain exact. Original authority/verdict
 # wrappers are not review inputs; all excluded paths are logged without their values.
 if isinstance(obj,list):return [safe_metadata(v,pointer+'/'+str(i))for i,v in enumerate(obj)]
 if not isinstance(obj,dict):return obj
 out={}
 blocked={'reviewedAt','reviewer','reviewAuthority','reviewRunId','reviewRunIds','reviewId','author','authorCreatedAt','authorOnly','decision','status','verdict','wholeSourceUnionApproved','wholeSourceApproval','wholeCourseApproval','HumanApproval','HumanTrial','M7Claim','independentReviewPending','independentSourceReviewPending','reviewedAtUTC','accepted'}
 for k,v in obj.items():
  if k in blocked:removed.append(pointer+'/'+k);continue
  out[k]=safe_metadata(v,pointer+'/'+k)
 return out

def goal_view(g,pointer):
 result=copy.deepcopy(g);ex=result.get('extendedData',{})
 for key in ['authorCaseIds','idDerivation','sourceDutySplitAuthor','sourceAuthorProposal','authorProposal']:
  if key in ex:removed.append(pointer+'/extendedData/'+key);del ex[key]
 return safe_metadata(result,pointer)
def source_view(g,pointer):return safe_metadata(copy.deepcopy(g),pointer)
def add_pdf(doc,j):
 rel=doc.get('path')
 if not isinstance(rel,str)or not rel.lower().endswith('.pdf'):return None
 path=K/rel
 if not path.is_file():path=M/rel
 assert path.is_file(),(j,rel)
 v=guard(path);assert path.read_bytes().startswith(b'%PDF'),path
 dest=O/'primary'/v['sha256']/Path(rel).name;dest.parent.mkdir(parents=True,exist_ok=True)
 if not dest.exists():shutil.copyfile(path,dest)
 assert digest(dest)==v['sha256'];primary[v['sha256']]={'originalRepoPath':rel,'originalSourcePin':v,'reviewCopyRelativePath':str(dest.relative_to(O)),'reviewCopyPin':pin(dest),'title':doc.get('title'),'officialUrl':doc.get('url'),'official':doc.get('official')}
 return str(dest.relative_to(O))
Crel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';Cpin=guard(K/Crel);assert Cpin['sha256']=='38c437d5fa0e24f8587b26cbdb2e3f168f3ffaf915aaaef885f918ac22c668e0';C=load(K/Crel);Cby={g['id']:g for g in C['goals']};parents={}
for g in C['goals']:
 for child in g.get('contains',[]):parents.setdefault(child,[]).append(g['id'])
Ppath=K/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-material4-v3-targeted-preparation-technical-v1/P439.material4-v3-only28c-author-profile-current.aggregate.jsonl';Ppin=guard(Ppath);assert Ppin['sha256']=='eb2019c4bb61b375d2959a4c03c32c479da7a31f0ef1b4d39d44e477ec2a26f6';Pby={x['goalId']:(i,x)for i,line in enumerate(Ppath.read_text().splitlines(),1)if line.strip()for x in [json.loads(line)]}
raw=load(D/'DIAGNOSIS.actual-427-unsupported-82-source-gaps-148-warnings.exact-IDs.json');pending=[r for r in raw['reverseUnmappedSourceGoals']if any(m['targetIntersectsCurrentView']for m in r['currentMappings'])];assert len(pending)==9
pages={'DE-BB':[26,30,31,32,33],'DE-BE':[26,30,31,32,33],'DE-BW':[42],'DE-HB':[20,23,36,37],'DE-HH':[31],'DE-MV':[5,32],'DE-NW':[24],'DE-SN':[4,24]}
cases=[];source_extracts={};alltargets=set()
for i,r in enumerate(pending):
 paths=sorted({x['mappingPath']for x in r['currentDecisions']});mapping_inputs=[];source=None;expath=None
 for rel in paths:
  mp=K/rel;m=load(mp);mv=guard(mp);expath=K/m['sourceExtractionPath'];ex=load(expath);ev=guard(expath);sg=next(g for g in ex['sourceGoals']if g['id']==r['sourceGoalId']);source=sg
  mappings=[v for v in m.get('mappings',[])if v.get('legacyGoalId')==sg['id']]
  mapping_inputs.append({'mappingFilePin':mv,'mappingRepoPath':rel,'sourceExtractionRepoPath':logical(expath),'currentMappingEdges':safe_metadata(mappings,'/cases/'+str(i)+'/currentMappingEdges'),'sourceExtractionPin':ev,'sourceGoalJsonPointer':'/sourceGoals/'+str(ex['sourceGoals'].index(sg))})
  source_extracts[str(expath)]=ex
 target_ids=sorted({v['canonicalGoalId']for m in mapping_inputs for v in m['currentMappingEdges']});alltargets.update(target_ids)
 passage=[p for p in ex.get('passages',[])if p.get('id')==source.get('passageId')]
 docs=ex.get('sourceDocuments')or([ex['sourceDocument']]if isinstance(ex.get('sourceDocument'),dict)else[])
 copies=sorted({v for doc in docs for v in [add_pdf(doc,r['jurisdiction'])]if v})
 assert copies,(r['jurisdiction'],docs)
 inventory=K/r['sourceExtractionPath'];guard(inventory);inventorygoal=next(g for g in load(inventory)['sourceGoals']if g['id']==source['id'])
 cases.append({'caseId':'CURRENT-SOURCE-'+str(i+1).zfill(2),'jurisdiction':r['jurisdiction'],'sourceGoalId':source['id'],'wholeCurrentOperativeScientificSourceGoal':source_view(source,'/cases/'+str(i)+'/sourceGoal'),'wholeCurrentPassageBodies':safe_metadata(passage,'/cases/'+str(i)+'/passages'),'wholeSourceDocumentDescriptors':safe_metadata(docs), 'mappingInputs':mapping_inputs,'currentMappedTargetIds':target_ids,'actualPrimaryPdfCopies':copies,'primaryPhysicalPageLocators':pages[r['jurisdiction']],'normalInventoryWholeGoalEqualsOperativeGoal':source==inventorygoal,'normalInventoryWholeScientificSourceGoalIfDifferent':source_view(inventorygoal,'/cases/'+str(i)+'/inventoryGoal')if source!=inventorygoal else None,'normalInventorySourcePin':pin(inventory)})
contexts=[]
for gid in sorted(alltargets):
 g=Cby[gid];idx=C['goals'].index(g);direct=g.get('requires',[]);parent_ids=parents.get(gid,[]);prow=Pby.get(gid)
 contexts.append({'goalId':gid,'canonicalGoalJsonPointer':'/goals/'+str(idx),'wholeCurrentScientificCanonicalGoal':goal_view(g,'/targets/'+gid),'wholeDirectPrerequisiteGoals':[goal_view(Cby[r.split(':')[-1]],'/prerequisites/'+r)for r in direct if r.split(':')[-1]in Cby],'wholeDirectCanonicalParentGoals':[goal_view(Cby[r],'/parents/'+r)for r in parent_ids],'wholeCurrentEvidenceProfile':copy.deepcopy(prow[1]['profile'])if prow else None,'profileSourcePointer':'line:'+str(prow[0])+'#/profile'if prow else None,'profileInputIsNotSourceAcceptance':True})
hbpath=K/'curricula/DE/Gymnasium/input/HB/upper-secondary/source-extraction/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.json';hb=load(hbpath);guard(hbpath);assert len(hb['sourceGoals'])==97
hbcontexts={'sourceExtractionPin':pin(hbpath),'wholeCurrentScientific97SourceGoalBodies':[source_view(g,'/HB97/sourceGoals/'+str(i))for i,g in enumerate(hb['sourceGoals'])],'wholeCurrent20PassageBodies':safe_metadata(hb['passages'],'/HB97/passages'),'wholeSourceDocumentDescriptors':safe_metadata(hb.get('sourceDocuments',[])),'originalPrimaryPdfCopies':sorted({add_pdf(doc,'DE-HB')for doc in hb.get('sourceDocuments',[])}),'scope':'Current source-goal count/plausibility and granularity. These97 bodies are input data; no previous count judgment supplied.'}
views=[]
for p in sorted((K/'curricula/DE/Gymnasium/composition-views/chemie').glob('*.view.json')):
 v=guard(p);views.append({'repoPath':logical(p),'sourcePin':v,'wholeDefinition':load(p)})
assert len(views)==39
out={'schemaVersion':1,'role':'Neutral frozen current Source9 whole-union plusHB97 count/granularity inputs; no outcomes','preparedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'cases':cases,'wholeCurrentMappedTargetContexts':contexts,'currentC650SourcePin':Cpin,'currentP439SourcePin':Ppin,'wholeCurrent39CompositionDefinitions':views,'HB97CountGranularityInputs':hbcontexts,'primarySourcePartners':list(primary.values()),'scientificFieldProjectionRule':'Exact original current text/data/qualifier values; only authority/verdict/history wrappers and author proposal containers are excluded. Complete original file hashes and exact field pointers remain technical comparison bindings, not authority.','reviewBoundary':{'newOutcomePredetermined':False,'oldScienceVerdictsIncluded':False,'historicalSourceApprovalsTransferred':False,'actualLearnerPracticalPerformanceInferred':False,'currentProfileInputDataIsSourceAcceptance':False,'HumanApproval':False,'MainMutated':False,'KMutated':False}}
p=O/'REVIEW.current-source9-whole-union-HB97.whole-scientific-inputs.no-old-verdicts.json';assert not p.exists();p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');p.chmod(0o444)
for v in guards.values():assert pin(v['path'])==v
selector={'schemaVersion':1,'role':'Clean Source9+HB97 current neutral reviewer input selector, no judgments','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceCaseCount':9,'sourceCaseIds':[c['caseId']for c in cases],'sourceGoalIds':[c['sourceGoalId']for c in cases],'mappedTargetGoalCount':len(contexts),'mappedTargetGoalIds':sorted(alltargets),'HBSourceGoalCount':97,'wholeViewCount':39,'view':pin(p),'primaryPartners':list(primary.values()),'sourceGuards':list(guards.values()),'sourceGuardsUnchanged':True,'sourceGuardCount':len(guards),'authorityVerdictFieldsExcludedFromScientificProjectionPaths':sorted(set(removed)),'noReviewRecordsOrRunIdentityFabricated':True,'noFullCentralOrBuildRun':True,'noSourceOrGoalOrProfileOrViewWrites':True,'MainMutated':False,'KMutated':False,'oldVerdictsNotScientificInput':True}
s=O/'SELECTOR.clean-current-Source9-HB97-reviewer-inputs.sealed.json';s.write_text(json.dumps(selector,indent=2)+'\n');s.chmod(0o444);print(json.dumps({'selector':pin(s),'view':pin(p),'cases':9,'targets':len(contexts),'HBrows':97,'primaryFiles':len(primary),'guards':len(guards)}))
