# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,re,hashlib
from bs4 import BeautifulSoup
# Load unchanged preparation helpers without repeating already completed first outputs.
_original=Path('tmp/m7-resumption-20261010/chemistry-source24-author/analyze_deltas.py').read_text()
exec(_original[:_original.index('old=read(')])
old=read(B/'checks/actual-normal-source-union-before-unchanged-failing-count-assertion.observed.json');new=read(P/'checks/actual-normal-whole-source-union-before-unchanged-failing-count-assertion.observed.json');active=read(P/'source-atlas/original-active381-362-projection.normal-expanded.exact.json');plan=read(P/'candidate/twenty-four-whole-child-source-contributions.author-candidate.json');oldS={s['key']:s for s in active['scopes']};newS={s['key']:s for s in new['actualWholeScopes']};e5='e5a5dcd8-053c-55fd-b5c7-bba93779da53';mappingDelta=read(P/'checks/actual-two-whole-mapping-successor-exact-deltas.json');pathMap={d['wholeSuccessor']['path']:d['wholeOriginal']['original']['path'] for d in mappingDelta['mappingSuccessors']};existingWitnessPathChangedIds={w['goalId'] for s in newS.values() for w in s['witnesses']if w['mappingPath']in pathMap and w['goalId'] not in {r['goalId']for r in plan['rows']}}
ids=next(s for s in read(P/'inputs/current180-protected-and-other-subjects.exact.json')['subjects'] if s['subject']=='chemie')['strictCompleteGoalIds'];assert len(ids)==180
base=read(B/'inputs/current-whole-active-canonical.exact.json');canon=read(P/'inputs/whole-current511-398-candidate.exact.json');bg={g['id']:g for g in base['goals']};ng={g['id']:g for g in canon['goals']};assert len(base['goals'])==487 and len(canon['goals'])==511;assert canon==read(B/'candidate/current-whole511-398-B008.inactive.json')
beforeModel=read(B/'native/before-whole-normal-book-model.actual.json');afterModel=read(P/'native/whole398-fresh-normal-review-model.actual.json');bm={g['goalId']:g for g in beforeModel['pages']};am={g['goalId']:g for g in afterModel['pages']};exclude={'ordinal','navigationOrder','treeOrder','pageNumber','pageFingerprint'}
def content(x):
 if isinstance(x,list):return [content(v) for v in x]
 if isinstance(x,dict):return {k:content(v) for k,v in x.items() if k not in exclude}
 return x
protection=[];bodyDeltas=[]
for i in ids:
 assert i in bm and i in am
 fields=[k for k in set(bm[i])|set(am[i]) if bm[i].get(k)!=am[i].get(k)];bc=content(bm[i]);ac=content(am[i]);sub=[k for k in set(bc)|set(ac) if bc.get(k)!=ac.get(k)];bodyfields=[k for k in set(bg[i])|set(ng[i]) if bg[i].get(k)!=ng[i].get(k)]
 scopesBefore=[k for k,s in oldS.items() if i in s['goalIds']];scopesAfter=[k for k,s in newS.items() if i in s['goalIds']];assert scopesBefore==scopesAfter
 protection.append({'goalId':i,'actualCurrent180CanonicalGoalBodyExactAgainst487':not bodyfields,'wholeGoalBeforeSha256':digest(bg[i]),'wholeGoalAfterSha256':digest(ng[i]),'actualPriorP26WholeGoalChangedFields':sorted(bodyfields),'wholeActive381PageBeforeSha256':digest(bm[i]),'wholeInactive398PageAfterSha256':digest(am[i]),'actualPageRawChangedFieldsFromP26':sorted(fields),'actualPageSubstantiveChangedFieldsFromP26':sorted(sub),'P26TargetedContextReviewRequired':bool(sub),'source24DeltaToPriorNative398PageExact':True,'source24DeltaToPrior511GoalBodyExact':True,'sourceScopeMembershipBeforeAndAfterExact':scopesBefore,'rawSourceWitnessMappingPathChanged':i in existingWitnessPathChangedIds})
 if bodyfields:
  assert bodyfields==['requires']
  bodyDeltas.append({'goalId':i,'fields':['requires'],'wholeActual487BeforeBody':bg[i],'wholeFrozenP26AfterBody':ng[i],'source24DidNotCreateThisChange':True,'noSource24DescriptionReviewClaim':True})
assert len(bodyDeltas)==5 and sum(bool(x['P26TargetedContextReviewRequired']) for x in protection)==12
put(P/'checks/actual-current180-goal-page-context-scope-protection.json',{'schemaVersion':1,'role':'Actual technical comparison; existing P26 context followups remain separate independent-review obligations','current180StrictIDAuthority':ref(P/'inputs/current180-protected-and-other-subjects.exact.json'),'current487CanonicalBefore':ref(B/'inputs/current-whole-active-canonical.exact.json'),'inactiveWhole511After':ref(P/'inputs/whole-current511-398-candidate.exact.json'),'actual175CurrentBodiesExactAgainst487':True,'whole5PreviouslyPreparedP26RequiresDeltas':bodyDeltas,'all180BodiesExactAgainstPriorFrozenP26Candidate':True,'all180ExistingSourceScopeMembershipsExact':True,'all398PriorNativeWholePagesExactUnderSource24Only':True,'source24RawWitnessMappingPathChangesExplicit':True,'wholeProtected180Comparisons':protection,'priorP26SubstantiveProtectedContextDeltaCount':12,'noPageOrDescriptionApprovalFromHashEquality':True,'noCurrentCentralRecount':True,'math807AndPhysics478ProtectedIDAuthoritiesUnchanged':True,'strictGain':0,'humanApproval':False})
r=next(r for r in plan['rows'] if r['goalId']==e5);partner=r['selectedWholeOriginalPartnerBodies'][0];byPath=Path('curricula/DE/Gymnasium/input/BY/gymnasium/Chemie.json');by=read(byPath);byGs={g['id']:g for g in by['goals']};yearId='a8ce02bd-da8e-51a8-b73f-d5e40fa7020f';todo=[yearId];seen=set()
while todo:
 i=todo.pop()
 if i in seen:continue
 seen.add(i);todo.extend(byGs[i].get('contains',[]))
wholeYear=[g for g in by['goals'] if g['id']in seen];policy=read(P/'inputs/current-normal-duration-policy.exact.json');decision=[d for d in policy['decisions'] if d.get('subject')=='Chemie'and d.get('jurisdiction')=='DE-BY'];assert len(decision)==1 and decision[0]['durationModels']==['G9']
assert partner['wholeOriginalSourceBody']['sourceSpan']=='C11.1.11' and partner['wholeOriginalSourceBody']['courseLevel']=='unspecified'
put(P/'source-atlas/C11-e5a5-whole-current-primary-programme-duration-and-course-HOLD.actual.json',{'schemaVersion':1,'goalId':e5,'wholeCurrentChild':r['wholeCurrentChild'],'wholeOriginalC11SourceOperatorPartner':partner,'actualCurrentOfficialWholeLearningArea1':ref(P/'primary/by11.whole-learning-area1.actual.txt'),'actualOfficialURL':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/11/chemie','wholeOriginalBYProgramme':ref(byPath),'wholeActualC11ProgrammeUnit':byGs[yearId],'wholeC11ProgrammeDescendantBodies':wholeYear,'wholeRootProgrammeStructure':byGs['6600db65-5d0e-5d6b-8b51-20ac0d06e3fa'],'normalWholePolicy':ref(P/'inputs/current-normal-duration-policy.exact.json'),'wholeCurrentBYDurationDecision':decision[0],'actualNormalBYStageFromSource':'SekII','actualNormalBYCourseFacetFromOriginalC11':'unspecified','normalDurationDecisionIsNotCourseProfileEvidence':True,'candidateGKAndLKTagsAreNotOfficialC11CourseProof':True,'noC12SubstituteOperatorOrCourseWitness':True,'actualCurrentNormalSourceAtlasOmissionReason':next(x['reason'] for x in new['wholeOmittedGoalBodies'] if x['goalId']==e5),'followupRequired':'Targeted official C11 programme/course placement author candidate and then independent review; no guessing from G9, year11, canonical GK/LK tags or distinct C12 impact operator.','strictGain':0,'humanApproval':False})
# The C12.3.3 merged GA/EA source contribution also requires both entire actual Analytik learning areas.
fetch=read(P/'primary/actual-current-official-BY-whole-learning-area1-fetch.receipt.json');extra=[]
for name in ['by12-ga','by12-ea']:
 doc=next(d for d in fetch['documents']if d['name']==name);raw=(T/(name+'.live-full-html.cache')).read_bytes();assert 'sha256:'+hashlib.sha256(raw).hexdigest()==doc['wholeFetchedHTMLSha256'];s=BeautifulSoup(raw,'html.parser');sections=s.find('main',id='main').find('div',id='content__sections');selected=[];taking=False
 for node in sections.children:
  if not getattr(node,'name',None):continue
  h=node.find('h2');text=h.get_text(' ',strip=True)if h else ''
  if h and 'Lernbereich 3:'in text:taking=True
  elif taking and h and 'Lernbereich'in text:break
  if taking:selected.append(str(node))
 text=BeautifulSoup('\n'.join(selected),'html.parser').get_text('\n',strip=True)+'\n';assert 'Analytik'in text
 path=P/'primary'/f'{name}.whole-learning-area3.actual.txt';put(path,text);extra.append({'sourceSpan':'C12-GA.3.3'if name.endswith('ga')else'C12-EA.3.3','actualWholeAnalytikArea':ref(path),'actualWholeHTMLCurrentFetch':doc,'wholeCurrentAreaReadRequiredForAuthorContribution':True})
put(P/'primary/actual-whole-Analytik-GA-EA-source-occurrences.extra.receipt.json',{'schemaVersion':1,'scope':'The one merged C12-GA.3.3 source contribution retains both complete actual GA/EA occurrence learning areas; no whole Analytik course approval','documents':extra,'originalSourceOccurrencesUnchanged':True,'humanApproval':False,'strictGain':0})
print(json.dumps({'scopedNewChildren':23,'omittedOld':19,'omittedNow':20,'unresolvedOldAndNew':496,'protected175BodiesExactAgainstActive487':True,'priorP26ProtectedRequiresDeltaBodies':5,'priorP26ProtectedSubstantiveContextDeltas':12,'source24All398NativePagesExact':True,'wholeExtraAnalytikAreas':[d['actualWholeAnalytikArea']['path']for d in extra],'strictGain':0},indent=2))
