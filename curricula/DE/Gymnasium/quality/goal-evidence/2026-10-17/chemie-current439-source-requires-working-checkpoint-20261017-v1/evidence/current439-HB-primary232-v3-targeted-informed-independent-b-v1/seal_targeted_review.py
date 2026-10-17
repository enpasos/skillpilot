"""Serialize frozen six-row science, with finite unchanged-scope proof."""
import datetime
import hashlib
import json
import pathlib

OUT = pathlib.Path(__file__).resolve().parent
BASE = OUT.parent/'current439-HB-whole-primary-source-inventory-author-successor-v3'
SELECTOR = BASE/'SELECTOR.clean-HB232-v3-six-row-fidelity-targeted-source-review.sealed.json'
FIRST = OUT/'FIRST.HB232-v3.six-row-informed-B.scientific.frozen.md'
PRIOR = OUT.parent/'current439-HB-primary232-inventory-informed-independent-b-v1'
PRIOR_FIRST = PRIOR/'FIRST.HB-primary232.informed-B.scientific.frozen.md'
PRIOR_SELECTOR = PRIOR/'SELECTOR.HB-primary232-informed-independent-b.sealed.json'
FIRST_SHA = 'fca38de2d2c8c24bcfb06c11cc2a475e1735030130d361ee1de341fe9228f814'
RUN = 'chemie-current439-HB232-v3-targeted-informed-independent-b-20261017-v1'

def pin(path):
    p=pathlib.Path(path);raw=p.read_bytes()
    return {'path':str(p),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}

def digest(value):
    return 'sha256:'+hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()

def write(name,value):
    p=OUT/name;assert not p.exists(),p
    p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
    return pin(p)

assert pin(SELECTOR)['sha256']=='695e9180e2c233f63dd6cb5b1b6b5cc4a2b45b69018e26ce975c266f367c3d88'
assert pin(FIRST)['sha256']==FIRST_SHA
assert pin(PRIOR_FIRST)['sha256']=='d1e275babfd2a2d0c462e287c523d70add5083d2cb44870a98b9b18e1d6d70e3'
assert pin(PRIOR_SELECTOR)['sha256']=='1bef3e66ea76b0a0ecb1b73a2e74d53aac0435132932c202209a2e73346355cc'
s=json.loads(SELECTOR.read_text())
n=json.loads(pathlib.Path(s['scientificView']['path']).read_text())
o=json.loads(pathlib.Path(s['previousScientificView']['path']).read_text())
raw=FIRST.read_text();indices=[0,20,28,54,209,231]
assert indices==s['targetedSourceGoalIndices']
changed=[i for i in range(232) if n['sourceGoals'][i]!=o['sourceGoals'][i]]
assert changed==indices
remainder=[i for i in range(232) if i not in indices]
assert all(n['sourceGoals'][i]==o['sourceGoals'][i] for i in remainder)
pr={x['sourceGoalId']:x for x in n['sourceGoalProvenance']}
pv={x['id']:x for x in n['passages']}

new_views=write('VIEWED.HB-v3.targeted-five-pages.json',{
    'currentActualPrimaryPin':s['actualPrimary'],
    'primaryPagesTextReadAndVisuallyInspected':[{'physicalPage':p,'renderedPin':pin(OUT/'viewed'/f'HB-v3-physical-{p}.png')} for p in [7,9,12,34,36]],
    'ownPreviousSourceEvidenceReused':pin(PRIOR_SELECTOR),'humanVisualReviewClaim':False,
    'imageGeneration':False,'imageEditing':False})

field_changes=[]
for i in indices:
    a=o['sourceGoals'][i];b=n['sourceGoals'][i]
    fields=sorted(k for k in set(a)|set(b) if a.get(k)!=b.get(k))
    assert set(fields)<= {'title','description','sourceText','parentBulletText'}
    field_changes.append({'index':i,'sourceGoalId':b['id'],'changedFields':fields,
        'previousWholeBodyDigest':digest(a),'currentWholeBodyDigest':digest(b)})
passage_changes=[]
for a,b in zip(o['passages'],n['passages']):
    if a!=b:
        assert a['id']==b['id']
        fields=sorted(k for k in set(a)|set(b) if a.get(k)!=b.get(k))
        assert fields==['text']
        passage_changes.append({'passageId':b['id'],'changedFields':fields,
            'previousWholeBodyDigest':digest(a),'currentWholeBodyDigest':digest(b)})
assert [x['passageId'] for x in passage_changes]==s['changedPassageIds']
top_equal=[]
for key in sorted(n):
    if key not in ['sourceGoals','passages']:
        assert n[key]==o[key]
        top_equal.append({'component':key,'recordCount':len(n[key]) if isinstance(n[key],(list,dict)) else None,
            'previousDigest':digest(o[key]),'currentDigest':digest(n[key]),'valueExact':True})
old_remainder=[o['sourceGoals'][i] for i in remainder]
new_remainder=[n['sourceGoals'][i] for i in remainder]
unchanged_passages=[p for p in n['passages'] if p['id'] not in s['changedPassageIds']]
old_unchanged_passages=[p for p in o['passages'] if p['id'] not in s['changedPassageIds']]
assert unchanged_passages==old_unchanged_passages
proof=write('PROOF.exact-six-row-five-passage-delta-and-unchanged-scope.json',{
    'algorithm':'SHA256 of UTF8 JSON, ensure_ascii=false, sort_keys=true, separators=(comma,colon); exact Python structural equality also asserted',
    'previousSciencePin':s['previousScientificView'],'currentSciencePin':s['scientificView'],
    'sourceGoalChanges':field_changes,'changedRowStringFieldCount':sum(len(x['changedFields']) for x in field_changes),
    'passageChanges':passage_changes,
    'unchanged226':{'count':226,'indices':remainder,'ids':[g['id'] for g in new_remainder],
        'previousWholeOrderedBodiesDigest':digest(old_remainder),'currentWholeOrderedBodiesDigest':digest(new_remainder),'valueExact':True},
    'unchanged23Passages':{'count':23,'previousDigest':digest(old_unchanged_passages),'currentDigest':digest(unchanged_passages),'valueExact':True},
    'allOtherScientificComponents':top_equal,'originalOwnFIRSTUnchanged':pin(PRIOR_FIRST)})

records=[]
resolved={20:'HB232-B-01',28:'HB232-B-02',54:'HB232-B-03'}
for number,index in enumerate(indices,1):
    key=f'V3-B-{number:02d}'
    start=raw.index('### '+key);end=raw.find('\n### ',start+5)
    if end<0:end=raw.index('\n## Five authored passages',start)
    g=n['sourceGoals'][index]
    records.append({'recordFormat':'standalone-informed-source-followup-candidate-v1',
        'recordId':f'{RUN}.row-{index:03d}','runId':RUN,'sourceGoalId':g['id'],'sourceGoalIndex':index,
        'sourceClauseIds':pr[g['id']]['sourceClauseIds'],'verdict':'accepted',
        'scope':'Exact current changed source body and its unchanged operator/course/topic provenance, as inactive inventory science only',
        'priorOwnFindingResolved':resolved.get(index),'frozenReasoning':raw[start:end],
        'currentWholeSourceGoalDigest':digest(g),'previousWholeSourceGoalDigest':digest(o['sourceGoals'][index]),
        'currentWholeProvenanceDigest':digest(pr[g['id']]),'currentSciencePin':s['scientificView'],
        'actualPrimaryPin':s['actualPrimary'],'actualViewedPagesPin':new_views,'rawFIRST':pin(FIRST),
        'evidenceLevel':'E1','gateClaim':'G1-machine-candidate-only','humanApproval':False,
        'canonicalCarrierBinding':None,'sourceM7Status':'OPEN','activation':False})
rp=OUT/'HB232-v3.six-current-row-records.jsonl';assert not rp.exists()
rp.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in records))
passage_records=[]
for change in passage_changes:
    p=pv[change['passageId']]
    passage_records.append({'recordId':RUN+'.passage.'+p['id'],'runId':RUN,'passageId':p['id'],'verdict':'accepted',
        'scope':'Whole changed authored passage text; no verbatim original-text claim',
        'reason':'Read whole passage; only corrected source-goal paraphrases propagated; membership, locators and surrounding clauses unchanged.',
        'currentWholePassageDigest':digest(p),'currentSciencePin':s['scientificView'],'rawFIRST':pin(FIRST)})
passages=write('HB232-v3.five-current-passage-records.json',passage_records)
inventory=write('HB232-v3.bounded-inventory-conclusion.json',{
    'recordId':RUN+'.bounded-inventory','runId':RUN,'verdict':'accepted',
    'verdictScope':'Inactive scientific source-inventory candidate only, combining six new row/five passage decisions with own prior exact unchanged evidence',
    'newChangedRowCount':6,'newChangedPassageCount':5,'retainedUnchangedClauseCount':226,
    'currentClauseCount':232,'priorFindingsResolved':['HB232-B-01','HB232-B-02','HB232-B-03'],
    'remainingScientificRevisionFindingsInScope':[],
    'countingRule':'232 clause records =56 Section2 +14 Section3.1 +42 introductory +120 qualification, including explicit inline LK split and source overlaps',
    'independentUniqueDutyCount':None,'requiredCanonicalAtomCount':None,
    'canonicalCarrierMappingStatus':'OPEN','sourceM7Status':'OPEN',
    'all232CanonicalCarrierBindingsOpen':True,'canonicalBindingsCreated':0,'activeSourceEntriesCreated':0,
    'humanApproval':False,'universalSourceApproval':False,'newPAMVApproval':False,
    'learnerLabSafetyClinicalApproval':False,'rawFIRST':pin(FIRST),'ownPriorFIRST':pin(PRIOR_FIRST),
    'ownPriorSealedReview':pin(PRIOR_SELECTOR),'unchangedScopeProof':proof})

run=write('RUN.HB232-v3.truthful-informed-availability.json',{
    'runFormat':'standalone-informed-source-followup-candidate-run-v1','runId':RUN,
    'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'startedAtUTC':None,'startExplanation':'Exact task start not separately recorded; no fabricated timestamp.',
    'reviewer':'Codex native conversational AI reviewer B','environmentDescribedModelFamily':'GPT-6',
    'exactServedModelBuild':None,'externalModelInvocation':False,'crossFamilyIndependenceClaim':False,
    'informedFollowup':True,'blindToOtherRuns':False,'freshBlindDCampaignClaim':False,
    'otherReviewerFIRSTOrResultsRead':False,'authorErrorListsRead':False,
    'ownPrevious232ScienceAndFIRSTKnown':True,'pairedSynthesis':False,
    'toolsActuallyUsed':['exec_command Python/json/hashlib/PyMuPDF for bounded reading, equality and page rendering','view_image actual primary pages7/9/12/34/36','apply_patch own frozen findings/serializer'],
    'rawFIRST':pin(FIRST),'sixRowRecords':pin(rp),'fivePassageRecords':passages,'inventoryConclusion':inventory,
    'technicalValidationScope':'Only finite output records, exact six-row/five-passage delta, unchanged scope, frozen input and own-FIRST pins. No full232 scientific redo, central check or build.',
    'stockBlindDOrHumanLedgerClaim':False,'humanApproval':False,'MainKSourceWrites':False})

guards=[]
for expected in [s['scientificView'],s['previousScientificView'],s['actualPrimary'],s['authorCandidateSourceBinding'],pin(SELECTOR),pin(FIRST),pin(PRIOR_FIRST),pin(PRIOR_SELECTOR)]:
    actual=pin(expected['path']);good=actual['sha256']==expected['sha256'] and actual['bytes']==expected['bytes']
    assert good;guards.append({'expected':expected,'actual':actual,'unchanged':good})
assert len(records)==6 and len(passage_records)==5
assert all(r['verdict']=='accepted' for r in records)
assert sum(len(x['changedFields']) for x in field_changes)==23
assert pin(FIRST)['sha256']==FIRST_SHA
assert pin(PRIOR_FIRST)['sha256']=='d1e275babfd2a2d0c462e287c523d70add5083d2cb44870a98b9b18e1d6d70e3'
checks=write('CHECKS.HB232-v3.bounded-output-and-immutability.json',{
    'passed':True,'sourceGoalChangedIndices':changed,'newAcceptedRowRecords':6,'newAcceptedPassageRecords':5,
    'other226GoalBodiesExact':True,'all232ProvenanceExact':True,'allTermsOptionalDerivedOverlapScopeExact':True,
    'allInputAndOwnFIRSTPinsUnchanged':guards,'unchangedScopeProof':proof,
    'stockDValidation':'not applicable; informed scientific source followup only','fullCentralOrBuildRun':False})
sealed=write('SELECTOR.HB232-v3-targeted-informed-independent-b.sealed.json',{
    'schemaVersion':1,'role':'Finite targeted informed independent B scientific review of inactive HB232-v3 inventory; no canonical/source gate approval',
    'runId':RUN,'inputSelector':pin(SELECTOR),'rawFIRST':pin(FIRST),'ownPriorFIRST':pin(PRIOR_FIRST),
    'ownPriorSealedReview':pin(PRIOR_SELECTOR),'sixExactRowRecords':pin(rp),'fiveExactPassageRecords':passages,
    'boundedInventoryConclusion':inventory,'unchangedScopeProof':proof,'truthfulRunManifest':run,
    'actualViewedPrimaryMaterials':new_views,'boundedChecks':checks,
    'exactCurrentScience':s['scientificView'],'exactPreviousScience':s['previousScientificView'],
    'exactPrimaryPdf':s['actualPrimary'],'exactAuthorCandidateBinding':s['authorCandidateSourceBinding'],
    'summary':{'sixRows':'accepted','fivePassages':'accepted','inactiveInventoryScience':'accepted',
        'ownPriorThreeFindings':'resolved','unchangedOtherClauseBodies':226,'clauseRecords':232,
        'independentUniqueDutyCount':None,'canonicalMappingStatus':'OPEN','sourceM7Status':'OPEN'},
    'informedFollowup':True,'freshBlindDClaim':False,'humanApproval':False,'universalSourceApproval':False,
    'activeSourceEntriesCreated':0,'canonicalBindingsCreated':0,'MainMutated':False,'KMutated':False,'sourceMutated':False})
print(json.dumps({'selector':sealed,'FIRST':pin(FIRST),'sixRows':pin(rp),'fivePassages':passages,'conclusion':inventory,'proof':proof,'run':run,'checks':checks},indent=2))
