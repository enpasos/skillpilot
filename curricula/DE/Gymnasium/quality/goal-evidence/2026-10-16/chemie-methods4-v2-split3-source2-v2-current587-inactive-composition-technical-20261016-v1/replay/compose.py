import pathlib,json,hashlib,copy,collections,datetime
from jsonschema import Draft202012Validator
R=pathlib.Path('/home/enpasos/projects/skillpilot');E=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16');P=E/'chemie-methods4-v2-split3-current578-inactive-composition-technical-20261016-v1';D=E/'chemie-methods4-v2-split3-derived-source-summary-technical-successor-20261016-v1';A=E/'chemie-halftitration-electrophoresis-two-source-course-targeted-author-successor-20261016-v2';F=E/'chemie-source2-HB-FACT-01-author-v2-original-independent-informed-followup-20261016-v1';O=E/'chemie-methods4-v2-split3-source2-v2-current587-inactive-composition-technical-20261016-v1';H=R/'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1';(R/O).mkdir(exist_ok=True)
def rd(p):return json.loads((R/p).read_text())
def pin(p):
 p=pathlib.Path(p);b=(R/p).read_bytes();return{'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def save(n,x):
 p=O/n;(R/p).parent.mkdir(exist_ok=True,parents=True);(R/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return pin(p)
def shaobj(x):return 'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def exact(p):assert pin(p['path'])==p,p['path']
inputs=[]
for p,sha in[(P/'OUTPUTS.finite-inactive-methods4-v2-split3-technical-composition.selector.json','0c6550d1e10f0140c2afe4d6525361bb09945b00c35ba8f5c4990fb5c84d9599'),(D/'SOURCE12.whole-current-composed-file-selection.with-derived-summary-refresh.neutral.json','67202348c63d42845b572794f44ea9fad30b3059d2f9b4f217996a8db95844ed'),(A/'OUTPUTS.source2-HB-FACT-01.author-v2.finite.selector.json','fba81c619e93b7f4f7893aa9eb0fe510c37e054842cb0a55d11f72a6f7e37e84'),(F/'OUTPUTS.finite-source2-HB-FACT-01-v2-informed-selector.json','43c09f1bbc54a3b72dba40a0bb1f0278e848b3368d4b4fea0728cfbecc53d461')]:
 pp=pin(p);assert pp['sha256']=='sha256:'+sha;inputs.append(pp)
# Verify finite upstream seals before constructing any successor.
for rel in[P/'SEAL.finite-inactive-methods4-v2-split3-technical-composition.json',D/'SEAL.finite-derived-source-summary-successor.json']:
 seal=rd(rel)
 for v in seal.get('files',[]):exact(v)
basep=P/'candidate/CANONICAL.current586.composed-current578-whole-inactive.json';base=rd(basep);can=copy.deepcopy(base);goals={g['id']:g for g in can['goals']};oldgoals=copy.deepcopy(goals);cas=rd(A/'CAS.current-H1e515c.whole-object-only.author-v2.json');newgoalops=[]
for o in cas['operations'][9:]:
 gid=o['objectSelector']['id'];before=copy.deepcopy(goals.get(gid));assert before==o['before'],gid
 if before is None:can['goals'].append(copy.deepcopy(o['after']))
 else:can['goals'][next(i for i,x in enumerate(can['goals'])if x['id']==gid)]=copy.deepcopy(o['after'])
 goals[gid]=can['goals'][-1]if before is None else next(x for x in can['goals']if x['id']==gid)
 newgoalops.append({'goalId':gid,'wholeBeforeObject':before,'beforeWholeObjectSHA256':shaobj(before)if before else None,'wholeAfterObject':copy.deepcopy(o['after']),'afterWholeObjectSHA256':shaobj(o['after']),'mode':o['mode'],'sourceAuthority':pin(A/'CAS.current-H1e515c.whole-object-only.author-v2.json'),'newScientificDecision':False})
assert len(can['goals'])==587 and len(goals)==587
canpin=save(pathlib.Path('candidate/CANONICAL.current587.methods-split-source2.inactive.json'),can)
# Use the latest derived-header Source12 selection as the whole-file base.
manifest=rd(D/'SOURCE12.whole-current-composed-file-selection.with-derived-summary-refresh.neutral.json');files=copy.deepcopy(manifest['files']);data={};beforedata={};byNormal={}
for f in files:
 exact(f['wholeAfterCandidate']);d=rd(f['wholeAfterCandidate']['path']);data[f['normalPath']]=copy.deepcopy(d);beforedata[f['normalPath']]=d;byNormal[f['normalPath']]=f
sourceOps=[]
def apply_group_or_property(target,sel,before,after,origin,allow_page_merge=False):
 d=data[target]
 if'list'in sel:
  key=sel['list'];pred=lambda x:all(x.get(k)==v for k,v in sel.items()if k!='list');ix=[i for i,x in enumerate(d[key])if pred(x)];matches=[d[key][i]for i in ix];actual=copy.deepcopy(matches if isinstance(before,list)else(matches[0]if matches else None));out=copy.deepcopy(after);policy='exact whole-object CAS'
  if actual!=before:
   assert allow_page_merge and sel['list']=='passages';assert actual['rawText']==out['rawText'];assert set(out['sourceGoalIds'])<=set(actual['sourceGoalIds']);assert all(actual.get(k)==out.get(k)for k in set(actual)|set(out)if k not in['text','sourceGoalIds','metadata']);out['sourceGoalIds']=list(dict.fromkeys(actual['sourceGoalIds']+out['sourceGoalIds']));policy='same actual whole raw primary page; preserve all current Methods sourceGoalIds (including moved source050), adopt already supported normalized Source2 text/metadata; no science content authored'
  if isinstance(before,list):
   assert ix;first=ix[0];d[key]=[x for i,x in enumerate(d[key])if i not in ix];d[key][first:first]=out
  else:
   assert len(ix)==1;d[key][ix[0]]=out
 else:
  key=sel['property'];actual=copy.deepcopy(d.get(key));assert actual==before,(target,key);out=copy.deepcopy(after);d[key]=out;policy='exact whole-property CAS'
 sourceOps.append({'normalPath':target,'objectSelector':sel,'wholeComposedBefore':actual,'beforeWholeObjectSHA256':shaobj(actual)if actual is not None else None,'wholeComposedAfter':copy.deepcopy(out),'afterWholeObjectSHA256':shaobj(out),'upstreamOriginalBefore':before,'compositionPolicy':policy,'origin':origin,'newScientificDecision':False})
for o in cas['operations'][:9]:apply_group_or_property(o['logicalTarget'],o['objectSelector'],o['before'],o['after'],'Source2-v2 informed HB factual successor',o['objectSelector'].get('list')=='passages')
# Derive the Source2 BY changes as whole keyed groups; never copy its old entire mapping file.
bycas=cas['unchangedV1WholeFileProposalsAndNoOps'][0];b=rd(bycas['before']['path']);a=rd(bycas['after']['path']);target=bycas['logicalTarget'];exact(bycas['before']);exact(bycas['after'])
for key,idkey in[('mappings','legacyGoalId'),('decisions','sourceGoalId')]:
 allids=list(dict.fromkeys([x[idkey]for x in b[key]]+[x[idkey]for x in a[key]]))
 for sid in allids:
  x=[x for x in b[key]if x[idkey]==sid];y=[x for x in a[key]if x[idkey]==sid]
  if x!=y:apply_group_or_property(target,{'list':key,idkey:sid},x,y,'Source2-v1 BY EA planning/evaluation partner and retained GA evaluation rationale')
for key in set(a)|set(b):
 if key not in['mappings','decisions']and a.get(key)!=b.get(key):apply_group_or_property(target,{'property':key},b.get(key),a.get(key),'Source2-v1 existing author lineage metadata only')
# Recalculate only already existing summary headers under the actual existing normal ID-aggregation rule.
rule=pathlib.Path('app/scripts/generateCurriculumQualityStatus.ts');ruletext=(R/rule).read_text();fragment='\n'.join(ruletext.splitlines()[4875:4931])+'\n';assert "return !matchTypes?.has('exact') && matchTypes?.has('partial')"in fragment;headers=[];allCounters=[]
for f in files:
 d=data[f['normalPath']]
 if'mappings'not in d:continue
 xp=d['sourceExtractionPath'];ex=data.get(xp)
 if ex is None:
  hp=H/xp;ex=json.loads(hp.read_text());inputs.append(pin(hp.relative_to(R)))
 src={x['id']for x in ex['sourceGoals']if isinstance(x.get('id'),str)and x['id'].strip()};assert len(src)==len(ex['sourceGoals']);groups=collections.defaultdict(set)
 for m in d['mappings']:
  assert m['legacyGoalId']in src;mtype=m.get('matchType');
  if isinstance(mtype,str)and mtype.strip():groups[m['legacyGoalId']].add(mtype)
 decisions=[x for x in d['decisions']if isinstance(x.get('sourceGoalId'),str)and x['sourceGoalId'].strip()and isinstance(x.get('decision'),str)and x['decision'].strip()];assert all(x['sourceGoalId']in src for x in decisions);reviewed={x['sourceGoalId']for x in decisions};exactCount=sum('exact'in x for x in groups.values());partialCount=sum('exact'not in x and'partial'in x for x in groups.values());counts={'sourceGoals':len(src),'mappedSourceGoals':len(groups),'reviewedSourceGoals':len(reviewed),'needsCanonicalGoal':sum(x['decision']=='needsCanonicalGoal'and x['sourceGoalId']not in groups for x in decisions),'exactMappings':exactCount,'partialMappings':partialCount};semanticOpen=[x['sourceGoalId']for x in decisions if x['decision']=='unreviewed'];allCounters.append({'normalPath':f['normalPath'],'normalDerivedUniqueIdCounters':counts,'semanticExplicitUnreviewedDecisionIds':semanticOpen,'normalPresenceCountIsNotScientificAcceptance':True,'existingSummaryPresent':'summary'in d,'authorStatusUnmodifiedByDerivedCounterRefresh':True})
 if'summary'not in d:continue
 before=copy.deepcopy(d['summary']);after=copy.deepcopy(before)
 for k,v in counts.items():
  if k in after:after[k]=v
 assert set(after)==set(before);d['summary']=after;headers.append({'normalPath':f['normalPath'],'wholeBeforeSummary':before,'wholeAfterSummary':after,'changed':before!=after,'actualNormalRuleFile':pin(rule),'noNonSummaryFieldChangedByRefresh':True})
# Emit only changed whole source files, reuse exact immutable pins for the others.
for i,f in enumerate(files):
 n=f['normalPath'];prior=f['wholeAfterCandidate'];changed=data[n]!=beforedata[n]
 if changed:f['wholeAfterCandidate']=save(pathlib.Path('candidate/source')/(str(i).zfill(2)+'-'+pathlib.Path(n).name),data[n])
 f['beforeSource2WholeComposedFile']=prior;f['source2WholeFileChanged']=changed;f['source2CurrentWholeObjectCAS']=[x for x in sourceOps if x['normalPath']==n]
sourceSelection=save(pathlib.Path('SOURCE12.latest-whole-file-selection.with-Source2-object-merge.neutral.json'),{'role':'Latest exact Source12 plus bounded Source2 whole-object merge and existing-header refresh; no old whole source file over current Methods/Split corrections','files':files,'priorLatestSource12':pin(D/'SOURCE12.whole-current-composed-file-selection.with-derived-summary-refresh.neutral.json'),'newWholeSource2CASOperations':len(sourceOps),'source2ChangedWholeFiles':sum(f['source2WholeFileChanged']for f in files),'newIndependentSourceApprovals':0,'sourceAtlasRegenerated':False})
save(pathlib.Path('CAS.source2-whole-current-object-before-after.neutral.json'),{'operations':sourceOps,'matchingMappingAndDecisionGroupsAreWholeArrays':True,'HB050MethodsPassageMembershipRetained':True,'olderWholeSourceFilesCopiedOverCurrent':False})
save(pathlib.Path('HEADERS.actual-normal-unique-ID-rule-and-explicit-open-source-status.json'),{'role':'Existing normal source-extraction ID aggregation only, not scientific acceptance. Preserve source2 whole HB unreviewed decision/status separately. No summary field invented for HB/RP/SN.','normalRuleFile':pin(rule),'exactRelevantCode':fragment,'existingSummaryHeaders':headers,'allMappingFileCounters':allCounters,'wholeSourceApproval':False})
# Preserve47 whole view bodies and add planning reference only to explicit BY-LK prospective/full and sourcebook purposes.
purposes=copy.deepcopy(rd(P/'VIEWS47.actual-H-prioritized-purpose-inventory.neutral.json')['purposes']);viewOps=[];plan='37374918-78c9-577f-9827-695d111ab22d';d124='d1244f5d-9a12-5b74-97fe-ae974f40af26'
def insert_after_d124(nodes):
 count=0
 for i,x in enumerate(list(nodes)):
  if x.get('kind')in['goalEntry','canonicalSubtree']and x.get('goalId')==d124:
   nodes.insert(i+1,{'kind':'goalEntry','goalId':plan});count+=1
  if isinstance(x.get('children'),list):count+=insert_after_d124(x['children'])
 return count
for p in purposes:
 exact(p['wholeCurrentCandidate']);before=rd(p['wholeCurrentCandidate']['path']);after=copy.deepcopy(before);oldpin=p['wholeCurrentCandidate'];changed=p['purposeIndex']in[40,44]
 if changed:
  assert p['scope'].get('jurisdiction')=='DE-BY'and p['scope'].get('courseProfile')=='LK';count=insert_after_d124(after['rootNodes']);assert count==1,(p['purposeIndex'],count);p['wholeCurrentCandidate']=save(pathlib.Path('candidate/views')/(str(p['purposeIndex'])+'-'+p['viewId']+'.planning-reference.neutral.json'),after)
 p['beforeSource2WholeComposedView']=oldpin;p['source2PlanningReferenceAdded']=changed
 viewOps.append({'purposeIndex':p['purposeIndex'],'viewId':p['viewId'],'scope':p['scope'],'wholeBefore':oldpin,'wholeAfter':p['wholeCurrentCandidate'],'wholeBodyChanged':changed,'wholeBeforeBody':before if changed else None,'wholeAfterBody':after if changed else None,'existingScientificCourseApprovalUnchanged':True})
viewSel=save(pathlib.Path('VIEWS47.latest-whole-composed-purposes.with-two-explicit-BY-LK-plan-references.neutral.json'),{'purposes':purposes,'changedPurposeIndices':[40,44],'wholeOther45ViewBodiesExact':True,'GK_NIWholeViewBytesExact':True,'prior26WholeCompositionsRetained':pin(P/'VIEWS26.whole-composed-current-CAS-and-delta.neutral.json'),'QS39AutomaticNewChildTargetIsNotAcquisitionEvidence':True,'newScientificCourseApproval':False})
save(pathlib.Path('CAS.views-two-BY-LK-whole-before-after-and-other45-exact.neutral.json'),{'records':viewOps,'newIndependentScopeApprovals':0})
# Preserve Source2 no-op sourcebook GK/NI and source extraction files as actual unchanged references outside the47-purpose inventory.
noops=[]
for x in cas['unchangedV1WholeFileProposalsAndNoOps'][1:]:
 if x['mode']=='assert-byte-identical-no-op':assert(R/x['before']['path']).read_bytes()==(R/x['after']['path']).read_bytes();noops.append(x)
save(pathlib.Path('RETAINED.Source2-unchanged-GK-NI-and-primary-extraction-noops.json'),{'noops':noops,'wholeFilesNotCopiedOverCurrentViewsOrSources':True})
# Actual counts, schema, DAG, partner-union retention; zero semantic writes.
Draft202012Validator(rd('docs/landscape-runtime.schema.json')).validate(can);vv=Draft202012Validator(rd('contracts/curriculum-package/v1/composition-view.schema.json'))
for p in purposes:vv.validate(rd(p['wholeCurrentCandidate']['path']))
for edge in['requires','contains']:
 seen=set();visiting=set()
 def visit(gid):
  assert gid in goals,('dangling',edge,gid)
  if gid in seen:return
  assert gid not in visiting,('cycle',edge,gid);visiting.add(gid)
  for x in goals[gid].get(edge,[]):visit(x)
  visiting.remove(gid);seen.add(gid)
 for gid in goals:visit(gid)
changedPrior=[gid for gid in oldgoals if goals[gid]!=oldgoals[gid]];assert set(changedPrior)=={d124,'6b6bceca-e1d9-56f7-ae6c-d7f7c2fa9338'};assert all(x in goals for x in oldgoals);assert set(goals)-set(oldgoals)=={plan}
# All573+ prior retained bodies, five text fixes, both image corrections and original IDs preserved.
hcan=rd(cas['currentMaster']['path']);hg={x['id']:x for x in hcan['goals']};currentChanged=[gid for gid in hg if goals[gid]!=hg[gid]];assert len(currentChanged)==7
textids=rd(E/'chemie-five-native11-supported-texts-current578-informed-bindings-technical-20261016-v1/OPERATIONS.actual-five-current-text-bindings.no-new-scientific-vote.json')['changedGoalIds'];assert all(goals[g]==hg[g]for g in textids);images=['fec1563e-a34a-5fc1-93bb-03981f35ab13','f0ba30a8-84b3-5915-bf85-6c3a176064d2'];assert all(goals[g]==hg[g]for g in images)
changedMappingGroups=[]
for f in files:
 d=data[f['normalPath']]
 if'mappings'not in d:continue
 b=beforedata[f['normalPath']];ids=set(x['legacyGoalId']for x in b['mappings'])|set(x['legacyGoalId']for x in d['mappings'])
 for sid in ids:
  be=[x for x in b['mappings']if x['legacyGoalId']==sid];af=[x for x in d['mappings']if x['legacyGoalId']==sid]
  if be!=af:
   decision=[x for x in d['decisions']if x['sourceGoalId']==sid];assert len(decision)==1;assert set(decision[0]['canonicalGoalIds'])=={x['canonicalGoalId']for x in af};assert all(x['canonicalGoalId']in goals for x in af);assert{x['canonicalGoalId']for x in be}<={x['canonicalGoalId']for x in af};changedMappingGroups.append({'normalPath':f['normalPath'],'sourceGoalId':sid,'wholeOldPartnersRetained':True,'wholeDecisionPartnerUnionMatches':True})
sem=rd(H.relative_to(R)/'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json');sr=sem.get('goals',sem.get('decisions',[]));sr=list(sr.values())if isinstance(sr,dict)else sr;kinds={x['goalId']:x.get('semanticKind',x.get('kind'))for x in sr};assert len(kinds)==578;pros=copy.deepcopy(kinds)
for gid in['c21d430b-424d-5b13-adf6-999f2490d2dc','e64a79df-7f21-5651-9b5d-e7d17580569e','9d942907-a59b-5898-9ce0-347fbea7d883']:pros[gid]='curricularArea'
for gid in set(goals)-set(hg):pros[gid]='curricularAtomic'
assert set(pros)==set(goals);kc=collections.Counter(pros.values());assert kc['curricularAtomic']==435
save(pathlib.Path('CANONICAL.whole-file-and-four-whole-object-CAS.neutral.json'),{'priorWholeCanonical':pin(basep),'afterWholeCanonical':canpin,'operations':newgoalops,'other584Prior586WholeBodiesExactlyPreserved':True,'all578OriginalIdsRetained':True,'all571UnchangedOriginal578BodiesPreserved':True,'priorFiveMethodsSplitChangesAlsoPreserved':True,'currentOriginalChangedGoalIds':currentChanged,'newNineWholeGoalIdsVersus578':sorted(set(goals)-set(hg)),'fiveSupportedWholeTextFixesExactlyRetained':textids,'bothSupportedWholeImageGoalBodiesExactlyRetained':images})
save(pathlib.Path('COUNTS.actual-node-and-prospective-kind-counts.no-semantic-writes.json'),{'actualWholeBeforeNodes':586,'actualWholeAfterNodes':len(goals),'existingBodiesChangedInThisStep':len(changedPrior),'allOtherBeforeBodiesExactlyPreserved':len(oldgoals)-len(changedPrior),'newWholeNodesThisStep':1,'currentOriginalHostKindCounts':dict(collections.Counter(kinds.values())),'prospectiveKindsIfExistingSupportedProposalsAreActuallyIntegrated':dict(kc),'actualCurrentHostCurricularAtomic':429,'prospectiveCurricularAtomic':435,'arithmetic':'429+6Split+2Methods+1Source2-3formerAtomParents=435; no413retirement, noMemorynodes added here','normalSemanticVotesWritten':0,'newStrictCompletedGoals':0})
save(pathlib.Path('CHECKS.bounded-schema-DAG-source-partner-and-retention.actual.json'),{'status':'PASS bounded technical composition only','wholeRuntimeSchema':pin(pathlib.Path('docs/landscape-runtime.schema.json')),'wholeCompositionViewSchema':pin(pathlib.Path('contracts/curriculum-package/v1/composition-view.schema.json')),'wholeViewsSchemaValidated':47,'wholeCanonicalNodesSchemaValidated':587,'bothDAGsPass':True,'source2ChangedMappingGroups':changedMappingGroups,'allPriorWholeFileOperationsRetained':True,'HB050MovedMethodsSourceMemberRetained':True,'actualRawHB27PrimaryBytesRetained':True,'original578IdsAllPreserved':True,'old586Other584WholeBodiesRetained':True,'old578Unchanged571WholeBodiesRetained':True,'fiveTextFixesAndTwoImageBodiesRetained':True,'old413AndProtected94Unchanged':True,'noMemory77DeckOrNodeChanges':True,'sourceAtlasNotRegenerated':True,'fullBuildOrCIExecuted':False,'newScientificDecisions':0,'newD_P_A_M_VVotes':0,'HumanApproval':False,'HumanTrial':False})
save(pathlib.Path('INPUTS.pinned-upstream-selectors-current-rule-and-normal-read-inputs.json'),{'rootAuthoritativeSelectors':inputs,'wholeSource2CAS':pin(A/'CAS.current-H1e515c.whole-object-only.author-v2.json'),'priorWholeCanonical':pin(basep),'wholeSource2CasesUnchanged':rd(A/'OUTPUTS.source2-HB-FACT-01.author-v2.finite.selector.json')['unchangedFourWholeCases'],'wholeSource2P2Unchanged':rd(A/'OUTPUTS.source2-HB-FACT-01.author-v2.finite.selector.json')['unchangedTwoWholePProfiles'],'prior29CasesWhole':pin(P/'MATERIALS29.exact-whole-bilingual-author-cases.neutral.json'),'priorP12Whole':pin(P/'PROFILES12.exact-whole-positive-v2-author-designs.neutral.json'),'newCaseOrProfileSciencePerformed':False,'allHAndUpstreamInputsRemainReadOnly':True})
save(pathlib.Path('HOLDS.inherited-migration-source-course-assessment-and-gates.json'),{'priorAllHolds':rd(P/'HOLDS.migration-source-course-and-integration.boundaries.json'),'source2Holds':rd(A/'OUTPUTS.source2-HB-FACT-01.author-v2.finite.selector.json')['openHolds'],'ownInformedSource2Verdict':'HB-FACT-01 factual correction supported only; wholeHB methods/DC/generalpractice allocation and actual course/view placement remain held','mandatoryRetentions':['413migration/consolidation notapplied; protected94unchanged','BYactualdye-modelconduct/extractionmissing','MV/RP/SH/SNscope/operator/optionalholds','global145andBUSwholeassessmentclosuresnotinferred','SeparateMemory77independentreview/integrationpending','CurrentnormalD/P/A/M/V/semantic/sourceAtlaschecksrequired'],'noM7Claim':True,'noActualExperimentPerformed':True,'HumanApproval':False,'HumanTrial':False})
print(json.dumps({'wholeNodes':len(goals),'priorBodiesChanged':len(changedPrior),'priorBodiesRetained':len(oldgoals)-len(changedPrior),'source2ObjectOperations':len(sourceOps),'sourceWholeFilesChanged':sum(f['source2WholeFileChanged']for f in files),'existingSummaryChanges':sum(x['changed']for x in headers),'prospectiveCurricularAtomic':kc['curricularAtomic'],'wholeViewPurposes':47,'changedViewPurposes':[40,44],'newScientificVotes':0,'canonical':canpin}))
