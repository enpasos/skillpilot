# SPDX-License-Identifier: Apache-2.0
"""Serialize explicit author proposals and exact finite CAS checks, never issue review verdicts."""
from pathlib import Path
import copy,hashlib,json,subprocess
ROOT=Path(__file__).resolve().parents[8]
OUT=Path(__file__).resolve().parents[1]
REL=str(OUT.relative_to(ROOT))
BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18')
BODY=BASE/'chemie-current450-T2-terminal-exams-author-20261018-v5'
FIVE=BASE/'chemie-current450-five-terminal-target-placements-author-20261018-v1'
def read(p):return json.loads((ROOT/p).read_text())
def sha(v):return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
    b=(ROOT/p).read_bytes();return dict(path=str(p),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
def write(p,v):
    f=OUT/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def ref(path,pointer,obj):return dict(**pin(path),jsonPointer=pointer,wholeObjectSHA256=sha(obj))
def changed(path,before,after,operations):
    assert before!=after
    return dict(path=str(path),beforeFilePin=pin(path),beforeWholeObjectSHA256=sha(before),candidateWholeObjectSHA256=sha(after),operations=operations)

graph='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
normal=read(graph);by={g['id']:g for g in normal['goals']}
body=read(BODY/'AUTHOR.new-goals.full.draft.json')['newGoals']
ids=list(dict.fromkeys(i for g in body for i in g['examData']['coveredGoalIds']))
frozen=read(BODY/'INPUT.ordinary-goals.selected-only.json')
if isinstance(frozen,dict):frozen=frozen.get('goals',frozen.get('ordinaryGoals'))
before={g['id']:g for g in frozen}
contexts=[]
for i in ids:
    delta=[k for k in set(by[i])|set(before[i]) if by[i].get(k)!=before[i].get(k)]
    assert set(delta)<= {'requires'},(i,delta)
    contexts.append(dict(goalId=i,currentWholeGoal=by[i],reviewedFrozenWholeGoal=before[i],changedFieldsSinceBodyReview=delta,wholeContentExceptDeclaredRequiresContextExact=True,ordinaryMutationInCandidate=False))
profiles=[]
for r in read(BODY/'INPUT.whole-P-transport-manifest.json'):
    path,line=r['originalLocator'].rsplit(':',1);raw=(ROOT/path).read_text().splitlines()[int(line)-1]
    obj=json.loads(raw);frozenP=read(r['copiedWholeRecord'])
    assert obj==frozenP
    assert hashlib.sha256(raw.encode()).hexdigest()==r['originalWholeLineSha256']
    profiles.append(dict(goalId=r['goalId'],wholeCurrentPositiveRecord=obj,originalExactLocator=r['originalLocator'],originalLineSHA256=r['originalWholeLineSha256'],currentFilePin=pin(path),newProfileVote=False))
write('INPUT.current24-ordinary-and-whole-P-context.json',dict(canonicalBefore=pin(graph),records=contexts,profiles=profiles,newSubstantiveTaskReview=False,bodyScienceReusedFromV5WithDeclaredOrientationRequiresDeltas=True))

a='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-six-current-full-source-duty-remediation-independent-a-20261014-v1/SCIENTIFIC.six-whole-source-duty-content-and-scope.independent-a.actual.json'
b='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-six-current-full-source-duty-remediation-independent-b-20261014-v1/SCIENCE.six-whole-source-duties.independent-b.actual.json'
reviews={};actual=read(a);other=read(b)
for state,index in [('HB',1),('TH',5)]:
    ar=actual['individualRecords'][index];br=other['results'][index]
    assert ar['wholeCandidateGoalId']==br['targetGoalId']
    current=by[br['targetGoalId']]
    assert ar['wholeCandidateDEDescription']==current['description'] and ar['wholeCandidateENDescription']==current['descriptionEn']
    reviews[state]=[ref(a,f'/individualRecords/{index}',ar),ref(b,f'/results/{index}',br)]
write('INPUT.original-TH-HB-complete-component-fit-and-operative-HOLDs.json',dict(role='DECLARED_PRIOR_COMPONENT_FIT_INPUT_NOT_NEW_APPROVAL',originalAAndB=[dict(state=state,refs=refs,wholeA=actual['individualRecords'][index],wholeB=other['results'][index]) for (state,index),refs in zip([('HB',1),('TH',5)], [reviews['HB'],reviews['TH']])],oldOperativeHoldsNotSilentlyOverridden=True))

facts=read(FIVE/'INPUT.four-source-facts-and-existing-review-boundaries.json')['records']
selected={r['jurisdiction'][3:]:r for r in facts if r['jurisdiction'] in ['DE-TH','DE-HB','DE-RP']}
primary=[]
for state,pages in [('TH',[57,59]),('HB',[33,35]),('RP',[37,39])]:
    p=selected[state]['primaryPDF']['path']
    result=subprocess.run(['pdftotext','-f',str(pages[0]),'-l',str(pages[1]),'-layout',str(ROOT/p),'-'],capture_output=True,check=True)
    t=OUT/f'source-contexts/{state}.physical-{pages[0]}-{pages[1]}.actual-pdftotext.txt';t.parent.mkdir(exist_ok=True);t.write_bytes(result.stdout)
    primary.append(dict(state=state,primaryPDF=pin(p),actualWholeContextText=pin(t.relative_to(ROOT)),physicalRange=pages))
write('INPUT.actual-primary-contexts.json',dict(records=primary,sourceContextActuallyReadByAuthor=True,notASeparateIndependentReview=True))

changes=[];sourceOutputs=[]
th=selected['TH'];sid=th['sourceGoalId'];target=th['goalId']
thdir=Path('curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary')
thmapping=thdir/'th_chemistry_upper_secondary_to_canonical_chemistry.json'
reviewPaths=[thdir/'th_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',thdir/'th_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.b007-normal-source-scope-20261011-v1.review.json']
sourceByPath={}
for idx,path in enumerate(reviewPaths):
    old=read(path);sourcePath=Path(old['sourceExtractionPath']);source=read(sourcePath);successor=copy.deepcopy(source)
    rowIndex=next(i for i,r in enumerate(source['sourceGoals']) if r['id']==sid);r=successor['sourceGoals'][rowIndex]
    r['courseLevel']='LK';r['tags']=['course:LK' if t=='course:GK_LK' else t for t in r['tags']]
    r['sourceScopeExact']=dict(physicalPage=58,printedPage=53,column='additional elevated level',courseProfiles=['LK'],officialOptional=False,sourceCondition='Qualifikationsphase, 4.1.8 Kunststoffe, Synthesen, right-column comparison of all three reaction types',adjacentStructureAndPracticalDutiesNotClosed=True)
    successor['selectedT2ConditionsScopeCorrection']=dict(role='AUTHOR_ONLY_BOUNDED_SUCCESSOR_PENDING_INDEPENDENT_INTERFACE_REVIEW',sourceBefore=pin(sourcePath),changedSourceGoalIds=[sid],otherSourceRowsUnchanged=True,newWholeSourceApprovals=0)
    newPath=Path(REL)/f'sources/TH.{"baseline225" if idx==0 else "current235"}.selected-conditions-LK.source-extraction.json'
    write(str(newPath.relative_to(REL)),successor);sourceByPath[sourcePath]=newPath
    sourceOutputs.append(dict(originalSourcePin=pin(sourcePath),candidateSourcePin=pin(newPath),selectedRowIndex=rowIndex,beforeWholeSourceRow=source['sourceGoals'][rowIndex],candidateWholeSourceRow=r,unchangedOtherSourceRows=all(x==y for j,(x,y) in enumerate(zip(source['sourceGoals'],successor['sourceGoals'])) if j!=rowIndex)))
    after=copy.deepcopy(old);after['sourceExtractionPath']=str(newPath)
    for m in after['mappings']:
        if m['legacyGoalId']==sid:m['canonicalGoalId']=target
    di=next(i for i,r in enumerate(old['decisions']) if r['sourceGoalId']==sid)
    dr=after['decisions'][di]
    dr.update(canonicalGoalIds=[target],rationale='Bounded author correction: the exact TH eA right-column comparison of reaction conditions across radical chain polymerization, polycondensation and polyaddition is retained by 0559. It does not map to a generic kinetics goal. Prior A/B component fit is declared input; operative scope/phase/source review of this successor remains pending.',reviewedAt='2026-10-18',reviewer='interface author; no new independent approval',sourceCourseLevel='LK',sourceScopeExact=r['sourceScopeExact'],componentFitEvidence=reviews['TH'],operativeInterfaceStatus='author_candidate_pending_independent_review',newWholeSourceApproval=False)
    changes.append(changed(path,old,after,[dict(op='replace',jsonPointer='/sourceExtractionPath',before=old['sourceExtractionPath'],candidate=str(newPath)),dict(op='replaceSelectedMappingRows',sourceGoalId=sid,before=[m for m in old['mappings'] if m['legacyGoalId']==sid],candidate=[m for m in after['mappings'] if m['legacyGoalId']==sid]),dict(op='replace',jsonPointer=f'/decisions/{di}',before=old['decisions'][di],candidate=dr)]))
old=read(thmapping);after=copy.deepcopy(old)
for r in after['mappings']:
    if r['legacyGoalId']==sid:r['canonicalGoalId']=target
changes.append(changed(thmapping,old,after,[dict(op='replaceSelectedMappingRows',sourceGoalId=sid,before=[m for m in old['mappings'] if m['legacyGoalId']==sid],candidate=[m for m in after['mappings'] if m['legacyGoalId']==sid])]))

# HB's genuine optional source cell is deliberately outside the 232 mandatory sourceGoals.
hb=selected['HB'];hbExtraction=Path(hb['currentSourceExtraction']['path']);hbe=read(hbExtraction)
optionalIndex=96;optional=hbe['optionalSourceSuggestions'][optionalIndex]
assert optional['optionalItemId']=='HB2022-p34-4.1-Vertiefung-02' and not optional['officialMandatoryCompetency']
registry=Path('curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json');old=read(registry);after=copy.deepcopy(old)
li=next(i for i,r in enumerate(old['landscapes']) if r['landscapeId']==normal['landscapeId']);goalProvenance=after['landscapes'][li]['goalProvenance'];assert hb['goalId'] not in goalProvenance
entry=dict(sourceLandscapeId=hb['canonicalWholeGoal']['extendedData']['provenance']['sourceLandscapeId'],sourceOptionalItemId=optional['optionalItemId'],sourceOptionalItem=ref(hbExtraction,f'/optionalSourceSuggestions/{optionalIndex}',optional),sourceStatus='optional thin-frame Vertiefung, not one of mandatory232 clauses',role='own-authored-acquisition-of-optional-source-component',courseProfiles=['GK','LK'],viewIds=['de-hb-gym-chemistry-gk','de-hb-gym-chemistry-lk','de-hb-gym-sekii-chemistry-gk','de-hb-gym-sekii-chemistry-lk'],officialMandatoryRequirement=False,officialWholeSourceCredit=False,actualLearnerTopicSelection=False,skillPilotBroaderInitialTargetPolicy='Owner instruction16October2026 includes authored applicable topics before a preceding choice flow; optional source status remains explicit in placement.',wholeUnchangedAcquisitionScopeDe=by[hb['goalId']]['description'],wholeUnchangedAcquisitionScopeEn=by[hb['goalId']]['descriptionEn'],componentFitEvidence=reviews['HB'],operativeInterfaceStatus='author_candidate_pending_independent_scope_and_source_interface_review',authorPackage=REL,mandatory232SourceGoalsUnchanged=True,oldMixedSiliconeConductiveLegacyClauseReactivated=False)
goalProvenance[hb['goalId']]=entry
changes.append(changed(registry,old,after,[dict(op='add',jsonPointer=f'/landscapes/{li}/goalProvenance/{hb["goalId"]}',before=None,candidate=entry)]))
write('INPUT.HB.actual-optional-cell-and-stale-mixed-legacy-boundary.json',dict(sourceExtractionPin=pin(hbExtraction),wholeOptionalCell=optional,optionalCellIndex=optionalIndex,mandatory232SourceGoalsSHA256=sha(hbe['sourceGoals']),wholeOldDerivedMixedEntry=next(r for r in hbe['derivedTeachingEntries'] if r['id']==hb['sourceGoalId']),currentMappingAlias=pin(hb['currentMappingAlias']['path']),currentReviewAlias=pin(hb['currentSourceReviewAlias']['path']),newHBMappingRows=[],newHBMandatoryDecisions=[],newHBMandatorySourceGoals=[]))

# RP is a NEW proposed interface, expressly not transported acceptance of 4a7.
rp=selected['RP'];sid=rp['sourceGoalId'];target=rp['goalId'];sourcePath=Path(rp['currentSourceExtraction']['path']);source=read(sourcePath);successor=copy.deepcopy(source)
ri=next(i for i,r in enumerate(source['sourceGoals']) if r['id']==sid);r=successor['sourceGoals'][ri]
r.update(courseLevel='GK_LK',sourceRef='RP Chemistry Sekundarstufe II MSS2022, physical/printed p38, elective W5h Baustein2.3 Arzneimittelforschung, Grund- und Leistungsfach')
r['tags']=['courseLevel:GK_LK' if t=='courseLevel:LK' else t for t in r['tags']]
r['sourceScopeExact']=dict(physicalPage=38,printedPage=38,courseProfiles=['GK','LK'],officialOptional=True,unit='Wahlbaustein2.3 Arzneimittelforschung,5h',actualLearnerChoice=False,qualityControlFacet=['good manufacturing practice','general Medicines Act purpose','chemical analytics'],otherUnitDutiesNotClosed=True)
pi=next(i for i,p in enumerate(source['passages']) if p['id']==r['passageId']);successor['passages'][pi]['page']=38
successor['selectedT2QualitySourceCorrection']=dict(role='AUTHOR_NEW_BOUNDED_RP_SOURCE_INTERFACE_PENDING_INDEPENDENT_REVIEW',originalSourcePin=pin(sourcePath),changedSourceGoalIds=[sid],correctedPassageLocationOnly=True,otherSourceRowsUnchanged=True,newWholeSourceApprovals=0)
newPath=Path(REL)/'sources/RP.selected-unit23-quality-GK-LK.source-extraction.json';write(str(newPath.relative_to(REL)),successor)
sourceOutputs.append(dict(originalSourcePin=pin(sourcePath),candidateSourcePin=pin(newPath),selectedRowIndex=ri,beforeWholeSourceRow=source['sourceGoals'][ri],candidateWholeSourceRow=r,passageIndex=pi,beforeWholePassage=source['passages'][pi],candidateWholePassage=successor['passages'][pi],unchangedOtherSourceRows=all(x==y for j,(x,y) in enumerate(zip(source['sourceGoals'],successor['sourceGoals'])) if j!=ri)))
row=dict(legacyGoalId=sid,canonicalGoalId=target,matchType='partial',reviewDecisionId=sid)
for path in [Path(rp['currentMappingAlias']['path']),Path(rp['currentSourceReviewAlias']['path'])]:
    old=read(path);after=copy.deepcopy(old);assert not any(m['legacyGoalId']==sid and m['canonicalGoalId']==target for m in old['mappings']);after['mappings'].append(row)
    ops=[dict(op='append',jsonPointer='/mappings',candidate=row)]
    if 'decisions' in old:
        after['sourceExtractionPath']=str(newPath);ops.append(dict(op='replace',jsonPointer='/sourceExtractionPath',before=old['sourceExtractionPath'],candidate=str(newPath)))
        di=next(i for i,r in enumerate(old['decisions']) if r['sourceGoalId']==sid);d=after['decisions'][di];d['canonicalGoalIds'].append(target)
        d.update(matchType='partial',rationale='New bounded AUTHOR proposal: 4a7 compares chemical analytical evidence, documented GMP and the general purpose of AMG within the actual optional RP unit2.3 quality-control bullet. Existing six contributions remain exact and are not reapproved. This does not certify manufacture, authorization, efficacy or real batch release; independent review of this new partial interface remains required.',reviewedAt='2026-10-18',reviewer='interface author, not an independent source reviewer',sourceCourseLevel='GK_LK',sourceScopeExact=r['sourceScopeExact'],operativeInterfaceStatus='author_candidate_pending_new_bounded_RP_source_interface_review',newWholeSourceApproval=False,previousDecisionNotApprovalOfNewTarget=True)
        ops.append(dict(op='replace',jsonPointer=f'/decisions/{di}',before=old['decisions'][di],candidate=d))
    changes.append(changed(path,old,after,ops))
write('AUTHOR.selected-source-mapping-decision-and-registry-CAS.pending.json',dict(role='AUTHOR_PROPOSAL_ONLY_NO_NEW_INDEPENDENT_SCIENCE_OR_ACCEPTANCE',records=changes,sourceExtractionSuccessors=sourceOutputs,normalWrites=0,ordinaryGoalMutations=[],wholePRecordMutations=[],HBMandatory232RowsUnchanged=True,HBNonexistentLegacySourceMappingNotIntroduced=True,newWholeSourceApprovals=0,RPNewPartialInterfaceNeedsIndependentReview=True))
print(json.dumps(dict(authorOnly=True,aliasOrRegistryFiles=len(changes),newSourceSuccessors=len(sourceOutputs),ordinaryContexts=len(contexts),wholeProfiles=len(profiles),normalWrites=0),indent=2))
