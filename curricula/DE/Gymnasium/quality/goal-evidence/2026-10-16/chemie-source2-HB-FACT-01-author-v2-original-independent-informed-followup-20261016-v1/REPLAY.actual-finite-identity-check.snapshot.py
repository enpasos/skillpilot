import json,pathlib,hashlib,subprocess,copy,collections
R=pathlib.Path('/home/enpasos/projects/skillpilot');E=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16');A=E/'chemie-halftitration-electrophoresis-two-source-course-targeted-author-successor-20261016-v2';V=E/'chemie-halftitration-electrophoresis-two-source-course-targeted-author-successor-20261016-v1';I=E/'chemie-source2-halftitration-electrophoresis-independent-bounded-science-20261016-v1';O=E/'chemie-source2-HB-FACT-01-author-v2-original-independent-informed-followup-20261016-v1';H=R/'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1';S=R/'tmp/chemie-source2-HB-FACT-01-v2-original-independent-informed-20261016-v1';(R/O).mkdir(exist_ok=True)
def rd(p):return json.loads(p.read_text())
def pin(p):return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def wr(n,x):(R/O/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
s=rd(R/A/'OUTPUTS.source2-HB-FACT-01.author-v2.finite.selector.json');assert pin(R/A/'OUTPUTS.source2-HB-FACT-01.author-v2.finite.selector.json')['sha256']=='sha256:fba81c619e93b7f4f7893aa9eb0fe510c37e054842cb0a55d11f72a6f7e37e84'
pins=[]
def checkpins(j):
 if isinstance(j,dict):
  if all(k in j for k in['path','sha256','bytes']):
   q=R/j['path'];actual=pin(q);assert actual=={k:j[k]for k in['path','sha256','bytes']},j['path'];pins.append(actual)
  for v in j.values():checkpins(v)
 elif isinstance(j,list):
  for v in j:checkpins(v)
checkpins(s)
cas=rd(R/A/'CAS.current-H1e515c.whole-object-only.author-v2.json');rows=[]
for i,o in enumerate(cas['operations']):
 j=rd(H/o['logicalTarget']);sel=o['objectSelector']
 if'list'in sel:
  matches=[x for x in j.get(sel['list'],[])if all(x.get(k)==v for k,v in sel.items()if k!='list')];current=matches if isinstance(o['before'],list)else(matches[0]if matches else None)
 else:current=j.get(sel['property'])
 okay=current==o['before'];assert okay,(i,sel);rows.append({'operationIndex':i,'logicalTarget':o['logicalTarget'],'objectSelector':sel,'beforeWholeMatchesCurrentH':True,'comparisonShape':'matching whole-object group array'if isinstance(o['before'],list)else'whole-object or whole-property','authorOrigin':o['origin'],'currentHostLogicalTargetPin':pin(H/o['logicalTarget']),'sourceApprovalInferredFromCAS':False})
b=rd(R/A/'before/HB.whole-normal-source-extraction.current-H-exact.json');a=rd(R/A/'after/HB.whole-normal-source-extraction.HB056-author-v2.json');bm=rd(R/A/'before/HB.whole-normal-mapping.current-H-exact.review.json');am=rd(R/A/'after/HB.whole-normal-mapping.HB056-author-v2.review.json');sid=s['scope']['correctedWholeSourceGoalId'];sg=next(x for x in a['sourceGoals']if x['id']==sid);passage=next(x for x in a['passages']if x['id']==sg['passageId']);raw=(S/'HB27.own-actual-pdftotext-layout.txt').read_text();assert raw==passage['rawText']==(R/A/'primary/HB.physical27.printed27.actual-layout.txt').read_text()
ret=[]
for key,old,new in [('sourceGoals',b,a),('passages',b,a),('mappings',bm,am),('decisions',bm,am)]:
 changed=[i for i,(x,y)in enumerate(zip(old[key],new[key]))if x!=y];assert len(old[key])==len(new[key]);assert len(changed)==1;ret.append({'kind':key,'wholeBeforeCount':len(old[key]),'wholeAfterCount':len(new[key]),'changedWholeIndices':changed,'allOtherWholeObjectsExactlyUnchanged':True,'otherHistoricalObjectsNotScientificallyRereviewed':True})
assert rd(H/cas['operations'][0]['logicalTarget'])==b and rd(H/cas['operations'][4]['logicalTarget'])==bm
plan='37374918-78c9-577f-9827-695d111ab22d';oldcan=rd(R/V/'after/CANONICAL.whole-author-candidate-579.json');og={x['id']:x for x in oldcan['goals']};inherit=[]
for o in cas['operations'][9:]:
 gid=o['objectSelector']['id'];assert o['after']==og[gid];inherit.append({'goalId':gid,'wholeAfterBodyEqualPriorSupportedV1':True,'newScientificReview':False})
reuse=[]
for n,old in [('contexts/FOUR.whole-operator-specific-material-task-solution-rubric.author.json','cases/FOUR.whole-operator-specific-material-task-solution-rubric.author.json'),('contexts/P.TWO.whole-raw-authored-operator-successors.json','profiles/P.TWO.whole-raw-authored-operator-successors.json'),('contexts/A-M-KIND.individual-author-impact-and-open-gates.json','A-M-KIND.individual-author-impact-and-open-gates.json')]:
 assert(R/A/n).read_bytes()==(R/V/old).read_bytes();reuse.append({'current':pin(R/A/n),'original':pin(R/V/old),'wholeBytesExactlyEqual':True,'newScientificReview':False})
dec=next(x for x in am['decisions']if x['sourceGoalId']==sid);maps=[x for x in am['mappings']if x['legacyGoalId']==sid];assert dec['decision']=='unreviewed'and dec['matchType']=='partial'and all(x['matchType']=='partial'for x in maps);assert sg['courseLevel']=='GK_LK';assert am['status']['unreviewedSourceGoals']==1;assert a['qualityReview']['sourceGoalCountPeerBaseline']['accepted']is False
wr('CHECK.actual-current-H-whole-CAS-retention-and-unchanged-reuse.json',{'role':'Own finite current-object and byte-retention check; no scientific conclusion from hashes','currentHBeforeWholeExtractionMatches':True,'currentHBeforeWholeMappingMatches':True,'wholeCurrentCAS':rows,'wholeListRetention':ret,'wholeAfterDecisionCounts':dict(collections.Counter(x['decision']for x in am['decisions'])),'ownActualPDF27TextMatchesWholeRawPassage':True,'ownActualPDF27TextPin':pin(S/'HB27.own-actual-pdftotext-layout.txt'),'unchangedPriorWholeBodies':inherit,'unchangedCasesProfilesAndIndividualAMReuse':reuse,'historicOriginalFirstSelectorUnchanged':pin(R/I/'OUTPUTS.finite-independent-bounded-source2-science.selector.json'),'noFullSourceOrCourseApproval':True,'noD_P_A_M_Kind_VVotes':True})
wr('INPUTS.finite-author-v2-prior-FIRST-primary-and-current-object-pins.json',{'authorV2Selector':pin(R/A/'OUTPUTS.source2-HB-FACT-01.author-v2.finite.selector.json'),'allSelectorPinsActuallyChecked':pins,'ownOriginalIndependentSelector':pin(R/I/'OUTPUTS.finite-independent-bounded-source2-science.selector.json'),'ownOriginalScienceReport':pin(R/I/'README.bounded-source2-science.de.md'),'actualPrimaryPDF':pin(R/'curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf'),'actualPrimaryVisualViewedInThisFollowup':pin(R/A/'primary/HB.physical27.printed27.actual.png'),'actualOwnPageExtraction':pin(S/'HB27.own-actual-pdftotext-layout.txt'),'currentHHostCanonical':pin(H/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),'boundedChangedWholeSourceGoal':sg,'boundedChangedWholeSourcePassage':passage,'boundedChangedWholeMappingGroup':maps,'boundedChangedWholeDecision':dec,'historyNotOverwritten':True})
print(json.dumps({'root':str(O),'selectorPinsChecked':len(pins),'currentWholeObjectCAS':len(rows),'retention':ret,'sameCases4Profiles2AndPlanWhole':True,'noNewVotes':True}))
