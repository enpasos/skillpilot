"""Independent finite byte/CAS/retention check; no production fingerprints/writes."""
from pathlib import Path
from fractions import Fraction
import json, hashlib, copy

E = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16')
R = E/'chemie-methods4-source-rubric-duplicate-targeted-author-successor-20261016-v1'
O = E/'chemie-seven-source-atomicity-whole-author-successor-20261016-v1/methods-four'
S = Path(__file__).parent
def read(p): return json.loads(Path(p).read_text())
def digest(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def stable(o): return digest(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def pin(p):
    p=Path(p); b=p.read_bytes()
    return dict(path=str(p),sha256=digest(b),bytes=len(b))
def checkpin(p):
    q=pin(p['path'])
    assert q['sha256']==p['sha256'] and q['bytes']==p['bytes'], p['path']
    return q
def diff(a,b,p=''):
    if a==b:return []
    if isinstance(a,dict) and isinstance(b,dict):
        return [x for k in sorted(a.keys()|b.keys()) for x in (diff(a[k],b[k],p+'/'+k) if k in a and k in b else [p+'/'+k])]
    if isinstance(a,list) and isinstance(b,list) and len(a)==len(b):
        return [x for i,(v,w) in enumerate(zip(a,b)) for x in diff(v,w,p+'/'+str(i))]
    return [p]
def walk(o):
    yield o
    if isinstance(o,dict):
        for v in o.values():yield from walk(v)
    elif isinstance(o,list):
        for v in o:yield from walk(v)
def at(o,p):
    for k in p.strip('/').split('/'):o=o[int(k)] if isinstance(o,list) else o[k]
    return o

entry=R/'OUTPUTS.targeted-methods4-source-rubric-duplicate-author-handoff.seal.json'
assert pin(entry)['sha256']=='sha256:76a4b3537992fcad9f13f3136f450333c0d592dc07efed055b36f2b4ceadcfad'
manifest=read(entry)
checked=[checkpin(p) for p in manifest['files']]
assert len(checked)==20 and sum(x['bytes'] for x in checked)==3128342
original_first=E/'chemie-methods4-fresh-independent-science-20261016-v1/FIRSTScience.independent-whole-methods4.json'
assert pin(original_first)['sha256']=='sha256:b0eb2d04500277691a93e6ecd1a0137932b78323e6048525fcc433b8a757431c'
g=read(R/'candidate/GOALS.one-whole-planar-CAS-two-source-grounded-new-atoms.author.json')
checkpin(g['baseCanonical']); canon=read(g['baseCanonical']['path']); current={x['id']:x for x in canon['goals']}
assert len(current)==578
candidate=copy.deepcopy(current)
for p in g['patches']:
    assert p['beforeWholeObject']==current[p['goalId']]
    assert stable(p['beforeWholeObject'])==p['beforeStableJSONSha256']
    candidate[p['goalId']]=p['afterWholeObject']
for a in g['newWholeGoals']:
    assert a['id'] not in current
    candidate[a['id']]=a
assert len(candidate)==580
for a in g['protectedWholeGoals']:assert a==current[a['id']]==candidate[a['id']]

oldcases=read(O/'materials/NINE.whole-bilingual-method-source-cases.author.json')['cases']
cases=read(R/'materials/SEVENTEEN.whole-bilingual-retained-and-targeted-method-cases.author.json')['cases']
assert cases[:7]==oldcases[:7]
case_diffs={cases[i]['id']:diff(oldcases[i],cases[i]) for i in [7,8]}
assert len(cases)==17 and len({x['id'] for x in cases})==17
for a in cases:
    assert a['maximumPoints']==sum(x['maximumPoints'] for x in a['rubric'])
    assert all(x['actualAwardedPoints'] is None for x in a['rubric'])
    for k in ['materialsDe','materialsEn','taskDe','taskEn','modelAnswerDe','modelAnswerEn']:assert a[k].strip()
oldp=read(O/'profiles/FOUR.whole-current-method-positive-v2.author-designs.json')['rows']
profiles=read(R/'profiles/SIX.whole-positive-v2-author-designs-no-independent-votes.json')['rows']
oldp={x['goalId']:x for x in oldp}; profiles={x['goalId']:x for x in profiles}
p_diffs={i:diff(v,profiles[i]) for i,v in oldp.items()}
assert not p_diffs['413c5ee5-7826-549f-ad76-63743c59b188']
assert not p_diffs['b7b5df21-d2cd-5dd0-bf46-a18a1796c567'] if 'b7b5df21-d2cd-5dd0-bf46-a18a1796c567' in p_diffs else True
for i in oldp:
    if i.startswith('b7b5df21'):assert oldp[i]==profiles[i]
    if i.startswith('882630ba'):assert oldp[i]['profile']['expectations']==profiles[i]['profile']['expectations']

oldsrc=read(O/'source/ALL.current-978-and-882-whole-source-partner-contexts.exact.json')['rows']
src=read(R/'source/SOURCE48.whole-targeted-after-contexts.author.json')['rows']
cas=read(R/'source/SOURCE48.whole-before-after-CAS.author.json')['patches']
assert len(src)==len(cas)==len(oldsrc)==48
source_rows=[]
for i,(a,b,c) in enumerate(zip(oldsrc,src,cas)):
    assert a==c['beforeWholeObject'] and b==c['afterWholeObject']
    assert stable(a)==c['beforeStableJSONSha256']
    original={x['canonicalGoalId'] for x in a['allOriginalPartnerMappings']}
    successor={x['canonicalGoalId'] for x in b['allOriginalPartnerMappings']}
    assert original-{'978a6f25-0601-5457-9211-aab206c95603'}<=successor
    removed=sorted(original-successor)
    if removed:assert removed==['978a6f25-0601-5457-9211-aab206c95603'] and '5cd8b2a2-2c90-5e29-8061-dd5e3a682f9d' in successor
    assert not b['newWholeSourceApproval']
    source_rows.append(dict(rowIndex=i,sourceGoalId=b['wholeSourceGoal']['id'],changedPointers=diff(a,b),removedPartners=removed,addedPartners=sorted(successor-original)))

extraction_results=[]
actual_cas_snapshot=[]
for f in read(R/'source/EXTRACTION.finite-whole-object-CAS.author.json')['files']:
    checkpin(f['baseFile']); base=read(f['baseFile']['path']); changed=copy.deepcopy(base)
    actual=read(f['normalPath']); actualpin=pin(f['normalPath']); currentchecks=[]
    patches=[]
    for p in f['patches']:
        assert base[p['listKey']][p['index']]==p['beforeWholeObject']
        assert stable(p['beforeWholeObject'])==p['beforeStableJSONSha256']
        changed[p['listKey']][p['index']]=p['afterWholeObject']
        patches.append(dict(listKey=p['listKey'],index=p['index'],changedPointers=diff(p['beforeWholeObject'],p['afterWholeObject'])))
        matches=[x for x in actual[p['listKey']] if x.get('id')==p['beforeWholeObject'].get('id')]
        currentchecks.append(dict(listKey=p['listKey'],expectedIndex=p['index'],id=p['beforeWholeObject'].get('id'),currentIdMatchCount=len(matches),wholeBeforeMatchesCurrentById=len(matches)==1 and matches[0]==p['beforeWholeObject'],wholeBeforeMatchesCurrentAtIndex=actual[p['listKey']][p['index']]==p['beforeWholeObject'],currentDifferencePointers=diff(p['beforeWholeObject'],matches[0]) if len(matches)==1 else ['missing_or_nonunique_current_id']))
    if 'sourceGoals'in base:assert {x['id'] for x in base['sourceGoals']}=={x['id'] for x in changed['sourceGoals']}
    extraction_results.append(dict(normalPath=f['normalPath'],patches=patches))
    actual_cas_snapshot.append(dict(kind='extraction',normalPath=f['normalPath'],resolvedNormalPath=str(Path(f['normalPath']).resolve()),pinnedAuthorBase=f['baseFile'],actualCurrentNormalPin=actualpin,wholeFileEqual=actualpin['sha256']==f['baseFile']['sha256'],currentWholeBeforeChecks=currentchecks))

mapping_results=[]
for f in read(R/'source/MAPPING.finite-whole-object-CAS.author.json')['files']:
    checkpin(f['baseFile']); base=read(f['baseFile']['path']); patches=[]
    actual=read(f['normalPath']);actualpin=pin(f['normalPath']);currentchecks=[]
    for p in f['patches']:
        selected=[x for x in base[p['listKey']] if all(x.get(k)==v for k,v in p['selector'].items())]
        assert selected==p['beforeWholeObjects'] and stable(selected)==p['beforeStableJSONSha256']
        decisions=p['decisionWholeCAS']; assert decisions['beforeWholeObjects']==p['oldDecisionWholeObjects']
        assert stable(decisions['beforeWholeObjects'])==decisions['beforeStableJSONSha256']
        newids={x['canonicalGoalId'] for x in p['afterWholeObjects']}
        assert set(decisions['afterWholeObjects'][0]['canonicalGoalIds'])==newids
        assert all(x in candidate for x in newids)
        patches.append(dict(selector=p['selector'],mappingChangedPointers=diff(p['beforeWholeObjects'],p['afterWholeObjects']),decisionChangedPointers=diff(decisions['beforeWholeObjects'],decisions['afterWholeObjects'])))
        currentedges=[x for x in actual[p['listKey']] if all(x.get(k)==v for k,v in p['selector'].items())]
        sourceid=p['selector']['legacyGoalId']
        possibledecisions=[(key,x)for key,val in actual.items()if isinstance(val,list)for x in val if isinstance(x,dict) and x.get('sourceGoalId')==sourceid]
        # Mapping edges and source review decisions are separately compared as whole objects.
        currentdecisions=[x for key,x in possibledecisions]
        currentchecks.append(dict(selector=p['selector'],wholeBeforeMappingEdgesMatchCurrent=currentedges==p['beforeWholeObjects'],currentMappingDifferencePointers=diff(p['beforeWholeObjects'],currentedges),wholeBeforeDecisionsMatchCurrent=currentdecisions==decisions['beforeWholeObjects'],currentDecisionListKeys=[key for key,x in possibledecisions],currentDecisionDifferencePointers=diff(decisions['beforeWholeObjects'],currentdecisions)))
    mapping_results.append(dict(normalPath=f['normalPath'],patches=patches))
    actual_cas_snapshot.append(dict(kind='mapping',normalPath=f['normalPath'],resolvedNormalPath=str(Path(f['normalPath']).resolve()),pinnedAuthorBase=f['baseFile'],actualCurrentNormalPin=actualpin,wholeFileEqual=actualpin['sha256']==f['baseFile']['sha256'],currentWholeBeforeChecks=currentchecks))

impact=read(R/'impact/ACTUAL.whole-current-partners-and-transitive-contexts.author.json')
for a in impact['wholeCurrentContexts']:assert a==current[a['id']]
dup=read(R/'consolidation/413.whole-duplicate-to-protected94-science-proposal.author.json')
retired=dup['historicalWholeRetiredCandidate']['id']; survivor=dup['protectedWholeSurvivorUnchanged']['id']
assert dup['historicalWholeRetiredCandidate']==current[retired]
assert dup['protectedWholeSurvivorUnchanged']==current[survivor]
duplicate_related=[]
for p in dup['relatedWholeGoalCAS']:
    assert p['beforeWholeObject']==current[p['goalId']]
    a,b=p['beforeWholeObject'],p['afterWholeObject']; candidate[p['goalId']]=b
    if 'examData'in a:
        q=copy.deepcopy(a['examData']); q['coveredGoalIds'].remove(retired)
        assert q==b['examData'] and survivor in b['requires'] and survivor in b['examData']['coveredGoalIds']
    duplicate_related.append(dict(goalId=p['goalId'],changedPointers=diff(a,b)))
del candidate[retired]
assert len(candidate)==579 and candidate[survivor]==current[survivor]
for edge in ['contains','requires']:
    done=set();stack=set()
    def visit(i):
        assert i not in stack,(edge,i)
        if i in done:return
        stack.add(i)
        for t in candidate[i].get(edge,[]):assert t in candidate,(i,t);visit(t)
        stack.remove(i);done.add(i)
    for i in candidate:visit(i)
procedure=dup['existingProcedure']
assert procedure['relation']=='replacedBy' and procedure['masteryPolicy']=='reassess' and len(procedure['sources'])==1 and procedure['historyPolicy']=='preserve-with-successor-links'

views=read(R/'views/FOUR.whole-common-course-CAS-and-THREE.conditional-elective-proposals.author.json')
view_results=[]
for v in views['safeSourceGroundedCommonCourseCAS']:
    assert stable(v['beforeWholeView'])==v['beforeStableJSONSha256']
    expected=copy.deepcopy(v['beforeWholeView'])
    for op in v['finiteViewOperations']:
        arr=at(expected,op['pointer']); assert len(arr)==op['beforeArrayLength'] and op['op']=='append'
        arr.append(op['afterWholeNode'])
    assert expected==v['afterWholeView']
    view_results.append(dict(path=v['normalViewPath'],scope='common-course source-specific only',changedPointers=diff(v['beforeWholeView'],v['afterWholeView'])))
for v in views['conditionalElectiveOnlyProposals']:
    assert v['safeForUnconditionalReplay'] is False
    view_results.append(dict(path=v['normalViewPath'],scope='HOLD operative selected elective',changedPointers=diff(v['beforeWholeView'],v['afterWholeView'])))
v=dup['viewCAS']; view_results.append(dict(path=v['normalPath'],scope='conditional duplicate removal',changedPointers=diff(v['beforeWholeObject'],v['afterWholeObject'])))
v=views['combinedNILKWhenBothIndependentApprovalsExist'];view_results.append(dict(path=v['normalViewPath'],scope='conditional combined operation',changedPointers=diff(v['beforeWholeView'],v['afterWholeView'])))
assert len(view_results)==9

scan=read(R/'consolidation/CHECK.actual-current32-direct-source-reference-scan.json')
observed_scans=[]
for row in scan['normalInputsObserved']:
    p=Path(row['normalPath']); actual=pin(p); o=read(p)
    hits=[x for x in walk(o) if isinstance(x,str) and x==retired]
    observed_scans.append(dict(path=str(p),currentPin=actual,matchesAuthorObservedBytes=actual['sha256']==row['actualHostByteSha256'],directRetiredIdOccurrences=len(hits)))
assert len(observed_scans)==32 and not any(r['directRetiredIdOccurrences'] for r in observed_scans)

calculations={
    'indicatorRf': [str(Fraction(2,8)),str(Fraction('5.6')/8)],
    'aminoRf':[str(Fraction('1.8')/10),str(Fraction('6.4')/10)],
    'esterInitialQ':str(Fraction(1,4)),
    'esterShiftX':str(Fraction(3,13)),
    'esterFinalAandB':str(1-Fraction(3,13)),
    'esterFinalE':str(Fraction(1,4)+Fraction(3,13)),
    'esterFinalW':str(1+Fraction(3,13)),
    'esterFinalQ':str(((Fraction(1,4)+Fraction(3,13))*(1+Fraction(3,13)))/(1-Fraction(3,13))**2),
}
assert calculations['esterFinalQ']=='1'
result=dict(schemaVersion=1,role='Independent finite identity and retention verification; not scientific approval',status='PASS_pinned_author_identity_and_retention_only',entryPin=pin(entry),verifiedAuthorFiles=checked,originalFirstUnchangedPin=pin(original_first),canonicalPin=g['baseCanonical'],retainedSevenWholeCases=True,changedCasePointers=case_diffs,changedOriginalProfilePointers=p_diffs,sourceRows=source_rows,extractionFiles=extraction_results,mappingFiles=mapping_results,actualCurrentTouchedWholeBeforeCAS=actual_cas_snapshot,wholeCurrentImpactObjectsVerified=len(impact['wholeCurrentContexts']),duplicateRelatedWholeChanges=duplicate_related,protected94Unchanged=True,oneSidedReplacedByReassess=True,candidateDAGAndReferencesAt579Verified=True,viewChanges=view_results,currentNormal32DirectRetiredReferenceScan=observed_scans,independentlyRecomputedFractions=calculations,normalFingerprintsComputed=False,normalWrites=False,scienceApprovalFromIdentity=False)
(S/'CHECK.independent-finite-identity-retention.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(status='PASS',authorFiles=20,sourceContexts=48,wholeCurrentImpactObjects=len(impact['wholeCurrentContexts']),retainedCases=7,views=9,mappingFiles=len(mapping_results),sourceChanges=len(source_rows),normal32PinsMatchAuthor=sum(x['matchesAuthorObservedBytes'] for x in observed_scans),normalWrites=False)))
