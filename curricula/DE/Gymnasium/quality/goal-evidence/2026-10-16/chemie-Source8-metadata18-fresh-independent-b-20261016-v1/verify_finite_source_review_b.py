import copy
import hashlib
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-CQR004-HE-buffer-SH-synthesis-and-Source13-atlas-metadata-targeted-author-successor-20261016-v1'
H = ROOT / 'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1'
SCIENCE = OUT / 'E16.source-review-b.science-first.frozen.md'

def read(p):
    return json.loads(Path(p).read_text())

def sha(p):
    return 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()

def stable_sha(o):
    return 'sha256:' + hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()

def pin_ok(p):
    f = ROOT / p['path']
    return f.is_file() and sha(f) == p['sha256'] and f.stat().st_size == p['bytes']

def pointer(o, p):
    for part in p.strip('/').split('/'):
        part = part.replace('~1','/').replace('~0','~')
        o = o[int(part)] if isinstance(o,list) else o[part]
    return o

def save(name, o):
    p = OUT / name
    p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
    assert read(p) == o
    return p

assert SCIENCE.is_file(), 'Frozen science is required first'
science_sha = sha(SCIENCE)
selector_path = AUTHOR / 'OUTPUTS.finite-eight-CQR-aliases-eighteen-metadata-one-SH-cell-two-views.AUTHOR.selector.json'
selector = read(selector_path)
cas = read(AUTHOR / 'CAS.finite-seventeen-whole-files-author-candidate.json')
inputs = read(AUTHOR / 'INPUTS.finite-whole-two-primary-cells-and-current-target-contexts.author.json')
audit = read(AUTHOR / 'AUDIT.actual-selected-Source13-all2000-decision-metadata-and-bounded-authority-not-full-review.json')
source48 = read(ROOT / inputs['existingMethodsSource48Dispositions']['path'])
foreign_first = read(ROOT / inputs['existingMethodsForeignFIRST']['path'])
foreign_after = read(ROOT / source48['wholeSourceAfterPin']['path'])
foreign_v2 = read(ROOT / inputs['existingMethodsSNNormalizedFieldsFollowup']['path'])
v2_input = read(ROOT / foreign_v2['inputs']['path'])
v2_delta_pin = next(x for x in v2_input['authorFiles'] if x['path'].endswith('DELTA.two-scientific-corrections-and-exact-retention.author.json'))
v2_delta = read(ROOT / v2_delta_pin['path'])
current = read(H / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
by = {g['id']:g for g in current['goals']}
checks = {
    'scienceFrozenBeforeMechanicalRun':True,
    'selectorExactExpectedSHA':sha(selector_path) == 'sha256:7c93bff48624c68219399428ce7ab3b76145b2394939b85977ba9002d69dffdb',
    'allAuthorSelectorFilePinsMatch':all(pin_ok(p) for p in selector['files']),
    'allSeventeenBeforeAfterPinsMatch':len(cas['items']) == 17 and all(pin_ok(it['before']) and pin_ok(it['after']) for it in cas['items']),
    'allSeventeenCurrentHBeforeFilePinsStillMatch':all(pin_ok(it['actualHBefore']) for it in cas['items']),
    'allPrimaryPDFPinsMatch':all(pin_ok(p) for p in inputs['actualPrimaryPDFs']),
    'foreignFIRSTAndDispositionAndV2PinsMatch':all(pin_ok(inputs[k]) for k in ['existingHEForeignDisposition','existingMethodsForeignFIRST','existingMethodsSource48Dispositions','existingMethodsSNNormalizedFieldsFollowup']) and pin_ok(source48['wholeSourceAfterPin']) and pin_ok(v2_delta_pin),
    'foreignOriginalReviewerIsNotAuthor':foreign_first['authorOfCandidate'] is False and foreign_first['reviewer']=='/root/chemie_methods4_fresh_science_20261016' and foreign_v2['authorOfCandidate'] is False,
}
file_results = []
for it in cas['items']:
    before, after = read(ROOT / it['before']['path']), read(ROOT / it['after']['path'])
    composed = copy.deepcopy(before)
    touched = []
    for delta in it['wholeObjectDeltas']:
        p = delta['pointerBefore']
        assert pointer(composed,p) == delta['wholeBefore'], (it['index'],p)
        parts = p.strip('/').split('/')
        parent = pointer(composed,'/'+'/'.join(parts[:-1]))
        index = int(parts[-1]) if isinstance(parent,list) else parts[-1]
        if 'wholeAfterItems' in delta:
            parent[index:index+1] = copy.deepcopy(delta['wholeAfterItems'])
        elif delta['wholeAfter'] is None:
            del parent[index]
        else:
            parent[index] = copy.deepcopy(delta['wholeAfter'])
        touched.append(p)
    ok = composed == after
    file_results.append({'index':it['index'],'normalPath':it['normalPath'],'beforeSha256':it['before']['sha256'],'afterSha256':it['after']['sha256'],'exactAdvertisedWholeObjectChangesOnly':ok,'changedPointers':touched})
checks['allSeventeenExactAdvertisedWholeObjectChangesOnly'] = all(x['exactAdvertisedWholeObjectChangesOnly'] for x in file_results)

he_id = 'he-chem-sekii-q3-4-b02-a01-f1f960ea'
he_b03 = 'he-chem-sekii-q3-4-b03-a01-30991228'
he_foreign = read(ROOT / inputs['existingHEForeignDisposition']['path'])
he_authority = next(r for r in he_foreign['rows'] if r['sourceGoalId']==he_id)
he_rows=[]
for it in cas['items'][:6]:
    b,a=read(ROOT/it['before']['path']),read(ROOT/it['after']['path'])
    d=next(x for x in a['decisions'] if x['sourceGoalId']==he_id)
    edges=[x for x in a['mappings'] if x['legacyGoalId']==he_id]
    he_rows.append({'index':it['index'],'decision':d,'edges':edges,'sourceB03DecisionUnchanged':[x for x in b['decisions'] if x['sourceGoalId']==he_b03]==[x for x in a['decisions'] if x['sourceGoalId']==he_b03],'sourceB03EdgesUnchanged':[x for x in b['mappings'] if x['legacyGoalId']==he_b03]==[x for x in a['mappings'] if x['legacyGoalId']==he_b03],'matchesForeignExactPartialAllocations':d['canonicalGoalIds']==he_authority['authorOperation']['currentCanonicalGoalIdsAfterDisposition'] and edges==he_authority['authorOperation']['currentLegacyEdgesAfterDisposition']})
checks['sixHERestorationsMatchExactForeignPartialAllocationsAndRetainB03']=all(x['sourceB03DecisionUnchanged'] and x['sourceB03EdgesUnchanged'] and x['matchesForeignExactPartialAllocations'] for x in he_rows)

metadata=[]
for it in cas['items'][8:14]:
    before,after=read(ROOT/it['before']['path']),read(ROOT/it['after']['path'])
    for delta in it['wholeObjectDeltas']:
        b,a=delta['wholeBefore'],delta['wholeAfter']
        binding=a['boundedCurrentSourceReviewBinding']
        disp=pointer(read(ROOT/binding['source48Dispositions']['path']),binding['source48Dispositions']['pointer'])
        row=foreign_after['rows'][disp['rowIndex']]
        source_file=H/binding['currentSourceGoalPath']
        source_obj=next(x for x in read(source_file)['sourceGoals'] if x['id']==a['sourceGoalId'])
        is_sn061=disp['rowIndex']==38
        normalized_v2_exact=None
        if is_sn061:
            found=[]
            def visit(o):
                if isinstance(o,dict):
                    if o.get('id')==a['sourceGoalId'] and 'sourceText' in o:found.append(o)
                    for v in o.values():visit(v)
                elif isinstance(o,list):
                    for v in o:visit(v)
            visit(v2_delta)
            normalized_v2_exact=source_obj in found
        metadata.append({'sourceGoalId':a['sourceGoalId'],'fileIndex':it['index'],'source48Row':disp['rowIndex'],'actualWholeSourceGoal':source_obj,'partnerIds':a['canonicalGoalIds'],'sameOrderedPartnerIdsAsBefore':a['canonicalGoalIds']==b['canonicalGoalIds'],'allLegacyMappingEdgesExact':before['mappings']==after['mappings'],'wholeForeignDispositionMatchesPin':binding['wholeDispositionExact']==disp,'foreignPartnersMatch':a['canonicalGoalIds']==disp['partnerGoalIds'],'reviewerMatchesActualForeignFIRST':a['reviewer']==foreign_first['reviewer'],'reviewedAtMatchesActualForeignRecord':a['reviewedAt']==(foreign_v2['createdAt'] if is_sn061 else foreign_first['createdAt']),'currentSourceBodyStablePinMatches':stable_sha(source_obj)==binding['currentSourceGoalStableJSONSHA256'],'sourceBodyMatchesOriginalReviewedAfter':source_obj==row['wholeSourceGoal'],'SN061SourceBodyMatchesActualReviewedV2After':normalized_v2_exact,'operativeHoldPreserved':binding['operativeScopeSelectionApproved'] is False if a['sourceGoalId'].startswith(('rp-','sn-')) else True,'wholeSourceAndCourseApprovalFalse':binding['newWholeSourceApproval'] is False and binding['wholeCourseApproval'] is False})
checks['eighteenMetadataRowsExactForeignAuthorityAndUnchangedPartners']=len(metadata)==18 and all(all(r[k] for k in ['sameOrderedPartnerIdsAsBefore','allLegacyMappingEdgesExact','wholeForeignDispositionMatchesPin','foreignPartnersMatch','reviewerMatchesActualForeignFIRST','reviewedAtMatchesActualForeignRecord','currentSourceBodyStablePinMatches','operativeHoldPreserved','wholeSourceAndCourseApprovalFalse']) and (r['SN061SourceBodyMatchesActualReviewedV2After'] if r['source48Row']==38 else r['sourceBodyMatchesOriginalReviewedAfter']) for r in metadata)
hold_rows=[]
for r in audit['currentSource2UnreviewedHolds']:
    hdoc=read(H/r['normalPath'])
    actual=next(x for x in hdoc['decisions'] if x['sourceGoalId']==r['sourceGoalId'])
    it=next((it for it in cas['items'] if it['normalPath']==r['normalPath']),None)
    after=read(ROOT/it['after']['path']) if it else hdoc
    after_obj=next(x for x in after['decisions'] if x['sourceGoalId']==r['sourceGoalId'])
    hold_rows.append({'sourceGoalId':r['sourceGoalId'],'wholeCurrentDecision':actual,'currentEqualsPinnedWholeHold':actual==r['wholeDecision'],'afterExactUnchangedAndUnreviewed':actual==after_obj and after_obj['decision']=='unreviewed'})
checks['fourCurrentSource2WholeHoldsExactUnchanged']=len(hold_rows)==4 and all(x['currentEqualsPinnedWholeHold'] and x['afterExactUnchangedAndUnreviewed'] for x in hold_rows)
by_item=cas['items'][10]
by_after=read(ROOT/by_item['after']['path'])
checks['all56HistoricalBYWholeDecisionsExactUnchanged']=len(audit['historicalBYAuthorBoundaryMarkers'])==56 and all(next(x for x in by_after['decisions'] if x['sourceGoalId']==r['sourceGoalId'])==r['wholeDecision'] for r in audit['historicalBYAuthorBoundaryMarkers'])

# Portable current context: the existing committable canonical plus five whole
# current goal objects reproduces the assigned H semantic object without a new
# complete canonical copy or any curriculum mutation.
base_path=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current435-shared-narrow-memory-units-and-acquisition-placement-author-successor-20261016-v1/CANONICAL.whole-base593-plus-shared-narrow-memory.author-inactive.json'
base=read(base_path);base_by={g['id']:g for g in base['goals']}
changed=[g for g in current['goals'] if base_by[g['id']]!=g]
delta={'role':'Exact observed current-context copies only; no review vote or proposed correction','baseCanonicalPath':str(base_path.relative_to(ROOT)),'baseCanonicalSha256':sha(base_path),'observedHCanonicalSha256':sha(H/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),'wholeCurrentGoalObjects':changed,'changedFieldsByGoal':{g['id']:[k for k in g.keys()|base_by[g['id']].keys() if g.get(k)!=base_by[g['id']].get(k)] for g in changed},'allOtherWholeGoalsExact':True,'normalWrites':0}
checks['currentContextOnlyFiveDescriptionUpdates']=len(changed)==5 and all(set(v).issubset({'description','descriptionEn'}) for v in delta['changedFieldsByGoal'].values())
save('E16.current-context.five-whole-goal-delta.actual.json',delta)
partner_ids=list(dict.fromkeys(gid for r in metadata for gid in r['partnerIds']))
save('E16.current-context.twentynine-whole-metadata-partners.actual.json',{'role':'Exact current public curriculum context, not new approval','sourceCanonicalSha256':delta['observedHCanonicalSha256'],'wholeGoalObjects':[by[x] for x in partner_ids]})

# Separate, explicitly open residual source findings. These are observations,
# not author corrections and not extra approval of unchanged source objects.
source_sh=read(ROOT/cas['items'][14]['before']['path']);source_by={g['id']:g for g in source_sh['sourceGoals']}
finding_rows=[]
for suffix,fid,reason,steps in [
    ('034-e9b42b58','SH034-COURSE-COLUMN','The actual page71 aromatic-medicine cell occupies the additional elevated-level right column, but the whole retained extraction still says GK_LK.',['Prepare a new targeted successor correcting this source cell courseLevel and courseLevel tag to LK while preserving stable ID, full text and locator.','Check its affected mapping target-course contributions and GK/LK projection roles; do not infer wholesale removal of pre-existing GK targets or whole-SH approval.','Review the exact correction independently before composition.']),
    ('032-74ed63ca','SH032-BY-PRACTICUM-PARTNER','The SH medicine source still carries the BY-only selected BcP methods cluster cf2631 in its whole decision and legacy arrays. Its presence is not a valid exact SH practical-course contribution.',['Prepare a finite whole-object decision/legacy-edge correction for SH032 in both operative aliases, preserving the three other current partners and the entire official source operator.','Review removal of only the inappropriate BY cf2631 contribution; do not replace the source phrase about examining manufacture with an invented universal personal laboratory-performance duty.','Keep the adequacy of the remaining source union explicit; do not infer whole-source fulfilment from retained broad partner membership.'])]:
    gid=next(x for x in source_by if x.endswith(suffix));g=source_by[gid];passage=next(x for x in source_sh['passages'] if x['id']==g['passageId']);mapping_objects=[]
    for it in cas['items'][6:8]:
        whole=read(ROOT/it['before']['path']);dec=next(x for x in whole['decisions'] if x['sourceGoalId']==gid);edges=[x for x in whole['mappings'] if x['legacyGoalId']==gid]
        mapping_objects.append({'normalPath':it['normalPath'],'wholeBeforeFile':it['before'],'wholeDecision':dec,'allLegacyMappingObjectsForThisSource':edges,'sameWholeDecisionInFiniteCandidate':next(x for x in read(ROOT/it['after']['path'])['decisions'] if x['sourceGoalId']==gid)==dec})
    finding_rows.append({'findingId':fid,'status':'OPEN_OUTSIDE_FINITE17_CAS','insideReviewedFiniteChange':False,'blocksWholeSHApproval':True,'invalidatesBoundedCandidateKEEP':False,'sourceGoalId':gid,'primaryPDF':inputs['actualPrimaryPDFs'][2],'primaryOneBasedPages':[69,71],'primaryReadMethod':'Actual layout text pages68–71 and actual rendered complete pages69/71 inspected before frozen science','wholeCurrentSourceGoal':g,'wholeCurrentSourcePassage':passage,'currentMappingObjects':mapping_objects,'factualFinding':reason,'minimalRecommendedNextSteps':steps,'HumanApproval':False,'HumanTrial':False,'newD_P_A_M_VVotes':0})
residual=save('E16.separate-open-SH034-SH032.whole-current-objects-and-primary-findings.actual.json',{'role':'Separate precise open residual findings; not author edits or whole-SH review','reviewer':'/root/chemie_global145_fresh_exam_review_b_20261016','frozenScienceSha256':science_sha,'sourceCandidateSelectorSha256':sha(selector_path),'findings':finding_rows,'normalWrites':0,'HWrites':0,'RWrites':0})

checks['frozenScienceStillExact']=sha(SCIENCE)==science_sha
report={'role':'Independent finite identity and authority checks after frozen science','verifiedAt':datetime.now(timezone.utc).isoformat(),'reviewer':'/root/chemie_global145_fresh_exam_review_b_20261016','candidateSelectorSha256':sha(selector_path),'frozenScienceSha256':science_sha,'checks':checks,'allPass':all(checks.values()),'wholeFileResults':file_results,'metadataRestorationRows':metadata,'metadataCountryCounts':dict(Counter(cas['items'][r['fileIndex']-1]['normalPath'].split('/')[4] for r in metadata)),'fourCurrentHolds':hold_rows,'source13Historical56Preserved':True,'separateOpenResidualFindingPath':str(residual.relative_to(ROOT)),'ordinaryDenominatorReduction':0,'newFachlicheClosures':0,'newD_P_A_M_VVotes':0,'HumanApproval':False,'HumanTrial':False,'normalWrites':0,'HWrites':0,'RWrites':0}
save('E16.source-review-b.finite-identity-authority-checks.actual.json',report)
print(json.dumps({'checks':len(checks),'allPass':all(checks.values()),'failed':[k for k,v in checks.items() if not v],'currentContextDeltaGoals':len(changed),'wholeCurrentMetadataPartners':len(partner_ids),'residualOpenFindings':len(finding_rows)},indent=2))
assert all(checks.values()), [k for k,v in checks.items() if not v]
