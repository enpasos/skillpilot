#!/usr/bin/env python3
"""Independent technical audit; writes only receipts in this new namespace."""
import argparse
import hashlib
import json
import re
import subprocess
import tarfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]
if ROOT.name != 'skillpilot':
    ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05'
OWN = Path(__file__).resolve().parent
CAND = BASE / 'chemie-q1-quantitative-reviewed-integration-candidate-v1'
AUTHOR = BASE / 'chemie-q1-quantitative-atomic-split-current-author-candidate-v1'
SAFE = BASE / 'chemie-q1-seven-reviewed-integration-candidate-v3'
TREE = CAND / 'prospective-input-tree'
CANON = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
QA = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
KIDS = ['3d6699ae-ebbd-5a55-8798-b809a9d74f0a', '18819a59-2442-530f-a7c3-26755398ec66']
AGG = 'd3cd250f-5221-589d-aa1c-44a4692d1acb'

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def read(p):
    return json.loads(Path(p).read_text())

def rows(p):
    return [json.loads(x) for x in Path(p).read_text().splitlines() if x.strip()]

def relative(p):
    return str(Path(p).relative_to(ROOT))

def resolve(p):
    p = Path(p)
    return p if p.is_absolute() else ROOT / p

def diff(a, b):
    return sorted(k for k in set(a) | set(b) if a.get(k) != b.get(k))

def leaf_diffs(a,b,path=()):
    if isinstance(a,dict) and isinstance(b,dict):
        return sum([leaf_diffs(a.get(k),b.get(k),path+(k,)) for k in sorted(set(a)|set(b))],[])
    if isinstance(a,list) and isinstance(b,list) and len(a)==len(b):
        return sum([leaf_diffs(x,y,path+(i,)) for i,(x,y) in enumerate(zip(a,b))],[])
    return [] if a==b else [{'jsonPath':list(path),'before':a,'proposedAfter':b}]

def raw_subject_entries(raw):
    decoder=json.JSONDecoder();hit=re.search(r'"subjects"\s*:\s*\[',raw)
    if hit is None:raise ValueError('subjects array absent')
    pos=hit.end();found={}
    while True:
        while raw[pos].isspace() or raw[pos]==',':pos+=1
        if raw[pos]==']':return found
        obj,end=decoder.raw_decode(raw,pos)
        if obj['subject'] in found:raise ValueError('duplicate subject')
        found[obj['subject']]=raw[pos:end];pos=end

def indexed(rs):
    return {x.get('goalId', x.get('id')): x for x in rs}

def freeze_verify(p, expected=None, historical_relocation=None):
    p = resolve(p)
    d = read(p)
    actual = sha(p)
    problems = []
    if expected is not None and actual != expected:
        problems.append('manifest sha mismatch')
    archived_verified = None
    relocated = None
    if historical_relocation:
        rr=read(resolve(historical_relocation))
        arc=resolve(rr['historicalArchivePath'])
        if sha(arc)!=rr['historicalArchiveSHA256']:
            problems.append('historical archive sha mismatch')
        with tarfile.open(arc) as tf:
            for x in d['files']:
                data=tf.extractfile(x['path']).read()
                if hashlib.sha256(data).hexdigest()!=x['sha256'].removeprefix('sha256:') or len(data)!=x['bytes']:
                    problems.append({'archiveMemberChanged':x['path']})
            manifest_data=tf.extractfile(relative(p)).read()
            if manifest_data!=p.read_bytes():
                problems.append('archived original manifest bytes changed')
            archived_verified={'path':relative(arc),'sha256':sha(arc),'originalFileMembersVerified':len(d['files']),'originalManifestMemberExact':manifest_data==p.read_bytes()}
        failed_stream=resolve(rr['newPath'])
        if sha(failed_stream)!=rr['actualSHA256'] or failed_stream.stat().st_size!=rr['actualBytes'] or rr['originalFailedRunExitCode']!=1:
            problems.append('relocated failed stream differs')
        relocated={'oldPath':rr['oldPath'],'newPath':rr['newPath'],'bytes':failed_stream.stat().st_size,'sha256':sha(failed_stream),'failedExitCode':rr['originalFailedRunExitCode'],'scienceClaimed':False,'receiptPath':str(historical_relocation),'receiptSHA256':sha(resolve(historical_relocation))}
    for x in d['files']:
        f = resolve(x['path'])
        if not f.is_file():
            if not (relocated and x['path']==relocated['oldPath'] and archived_verified):
                problems.append({'missing': x['path']})
        elif sha(f) != x['sha256'].removeprefix('sha256:') or ('bytes' in x and f.stat().st_size != x['bytes']):
            problems.append({'changed': x['path']})
    return {'path': relative(p), 'sha256': actual, 'filesVerified': len(d['files']), 'historicalArchiveVerified':archived_verified,'historicalFailedStreamRelocation':relocated,'problems': problems}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--final-freeze')
    ap.add_argument('--final-freeze-sha')
    ap.add_argument('--output', default='preliminary-readonly-comparisons.actual.json')
    args = ap.parse_args()
    findings = []
    checks = {}
    def check(name, ok, detail):
        checks[name] = {'pass': bool(ok), 'detail': detail}
        if not ok:
            findings.append(name)

    manifests = [
        (AUTHOR/'author-native-candidate.final.freeze.json', 'ff2c5e7ff6ef10d484cf3af8442b37d40b9ea1592b9063cc5ca8e233c1d34858'),
        (BASE/'chemie-q1-fifteen-reviewed-integration-candidate-v5/reviewed-integration.final.freeze.json','19b7a8f38848504e1aeefe09ccde0a09f7ccb41aecc6bc6623d9a66a40385c81'),
        (SAFE/'reviewed-safe-subplan.final.freeze.json','b426be76079a667c43d0c73d6cea83d23e73813ddd19a8cb9a9141b71c919aba'),
        (BASE/'chemie-q1-two-new-four-current-independent-d-a-v1/independent-four-current-description-d-a.final.freeze.json','a01ccac7bcdbaea3dea3f676ac149f3bf3fc00fc795aad9755a08efce9d613de'),
        (BASE/'chemie-q1-six-safe-original-d-a-current-binding-reuse-v1/six-safe-binding-reuse.final.freeze.json','b02dcbaed13fdf6aa52b82a517a8b35d1585fbe40debfd1768df428dee456680'),
        (BASE/'chemie-q1-quantitative-two-current-independent-p-am-v1/independent-p-am.final.freeze.json','a23222a00936c197a9eb5d5dc49dad58f003af01fe5545dbc3099c194715c30a'),
        (BASE/'chemie-q1-ten-current-independent-d-b-v1/independent-current-description-d-b.final.freeze.json','b955d9895ae7ca904d0505e6fcb5595973dedd64e4a0a2ab027378b443a14a10'),
        (ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-q1-two-new-and-aggregate-current-independent-v-root-v1/independent-three-current-visual-review.final.freeze.json','470cefe6fd81327a90cdb36667b105b0235d8b24bed1804d4f5dece4767f238f'),
    ]
    if args.final_freeze:
        manifests.append((resolve(args.final_freeze), args.final_freeze_sha))
    relocation='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-q1-bacteria-e7-integration-v1/historical-empty-stream-format-repair.actual.json'
    verified = [freeze_verify(p, s, relocation if p.parent.name=='chemie-q1-fifteen-reviewed-integration-candidate-v5' else None) for p,s in manifests]
    check('all_independent_frozen_inputs_unchanged', all(not x['problems'] for x in verified), verified)

    old = indexed(read(CAND/'canonical.before.snapshot.json')['goals'])
    future = indexed(read(TREE/CANON)['goals'])
    ids104 = read(CAND/'technical-integration-current-inputs.preflight.actual.json')['protectedStrict104WholeGoalIds']
    changed104 = [x for x in ids104 if old[x] != future[x]]
    check('protected104_whole_goals_exact', len(ids104)==104 and not changed104, {'count':len(ids104),'changed':changed104})
    all_changed = [x for x in old if old[x] != future.get(x)]
    check('no_deleted_canonical_goals', set(old) <= set(future), {'oldCount':len(old),'futureCount':len(future),'removed':sorted(set(old)-set(future)),'added':sorted(set(future)-set(old)),'changedIds':all_changed})
    check('aggregate_contains_two_children', future[AGG]['contains']==KIDS, {'contains':future[AGG]['contains']})

    oldqa = indexed(read(ROOT/QA)['records'])
    newqa = indexed(read(TREE/QA)['records'])
    changedqa104 = [x for x in ids104 if oldqa.get(x) != newqa.get(x)]
    humanfields = sorted({k for x in oldqa.values() for k in x if k.lower().startswith('human') or 'practice' in k.lower() or 'trial' in k.lower()})
    humandelta = [x for x in oldqa if x in newqa and {k:oldqa[x].get(k) for k in humanfields}!={k:newqa[x].get(k) for k in humanfields}]
    check('protected104_whole_visualization_QA_exact', not changedqa104, {'changed':changedqa104})
    check('all_existing_human_practice_trial_fields_exact', not humandelta, {'checkedExistingRecords':len(oldqa),'fieldNames':humanfields,'changed':humandelta})
    check('new_images_do_not_claim_human_approval', all(newqa[x].get('humanApproved')=='no' and not newqa[x].get('humanReviewedAt') for x in KIDS), {'newIds':KIDS})

    m_old = rows(SAFE/'m-current-full.review.jsonl')
    m_new = rows(CAND/'m-current-full.review.jsonl')
    oldmap, newmap = indexed(m_old), indexed(m_new)
    retained = set(oldmap)-{AGG}
    mchanged = sorted(x for x in retained if oldmap[x]!=newmap.get(x))
    check('memory376_retained_whole_rows_exact', len(retained)==376 and not mchanged, {'retainedCount':len(retained),'changed':mchanged,'removedAggregate':AGG not in newmap,'newTotal':len(m_new)})
    check('cards55_raw_bytes_exact', (SAFE/'m-current-full.cards.review.jsonl').read_bytes()==(CAND/'m-current-full.cards.review.jsonl').read_bytes(), {'cards':len(rows(CAND/'m-current-full.cards.review.jsonl')),'sha256':sha(CAND/'m-current-full.cards.review.jsonl')})
    mc = read(CAND/'m-current-full.config.json')
    check('memory_three_visibility_views_preserved', mc['visibilityScopes']==read(SAFE/'m-current-full.config.json')['visibilityScopes'], {'visibilityScopes':mc['visibilityScopes']})
    check('native_memory378_check_corrected_attempt_pass', read(CAND/'native-memory378-current.attempt-2.actual.receipt.json')['exitCode']==0, {'summary':(CAND/'native-memory378-current.attempt-2.stdout.txt').read_text().split('\nMemory-required decisions')[0]})

    check('positive_safe_six_raw_records_exact', (SAFE/'positive-evidence.safe-six.review.jsonl').read_bytes()==(CAND/'positive-evidence.safe-six.review.jsonl').read_bytes(), {'count':len(rows(CAND/'positive-evidence.safe-six.review.jsonl')),'sha256':sha(CAND/'positive-evidence.safe-six.review.jsonl')})
    p2 = BASE/'chemie-q1-quantitative-two-current-independent-p-am-v1/positive-evidence.review.jsonl'
    check('positive_two_new_independent_raw_records_exact', p2.read_bytes()==(CAND/'positive-evidence.two-new.review.jsonl').read_bytes(), {'count':len(rows(p2)),'sourceSHA256':sha(p2)})
    before_registry=read(CAND/'central-registry.before.snapshot.json')
    chem_before=next(x for x in before_registry['subjects'] if x['subject']=='chemie')
    p14_config=resolve(chem_before['positiveEvidenceConfigPaths'][-1])
    p14=read(p14_config)
    p14path=resolve(p14['reviewPath'])
    check('existing_q1_P14_stays_in_active_input_without_relabel', len(rows(p14path))==14, {'config':relative(p14_config),'configSHA256':sha(p14_config),'reviewPath':relative(p14path),'recordsSHA256':sha(p14path),'rowCount':len(rows(p14path)),'reviewers':sorted({str(x.get('reviewer')) for x in rows(p14path)}),'dates':sorted({str(x.get('reviewedAt')) for x in rows(p14path)})})
    amc=read(resolve(chem_before['memoryReviewConfigPath']))
    active_m=indexed(rows(resolve(amc['reviewPath'])))
    changed_active_m=sorted(x for x in active_m if x!=AGG and active_m[x]!=newmap.get(x))
    approved_safe5={'057a6826-f599-53b1-bdd1-5a83037a1494','39c85aa0-b01f-56ec-a148-b8009bf650f5','d742ecb0-0795-5446-a95d-9503d4618475','d76b80a2-5156-54f4-b3a1-546beddf0e14','10f657bc-6044-5fbb-ba8e-6e5ba55d2bc5'}
    check('active370_unaffected_memory_exact_five_reviewed_safe_updates_explicit', len(active_m)==376 and set(changed_active_m)==approved_safe5 and all(newmap[x]==oldmap[x] for x in approved_safe5), {'activeRecordCount':len(active_m),'unchangedExceptAggregateAndFiveReviewed':len(active_m)-1-len(changed_active_m),'changedToEarlierIndependentlyReviewedSafeRecords':changed_active_m,'allFiveWholeRecordsExactToFrozenSafeM':all(newmap[x]==oldmap[x] for x in approved_safe5),'preliminaryV2CorrectedOverbroadUntouchedRequirement':True})
    check('protected104_memory_whole_records_exact', all(active_m[x]==newmap[x] for x in ids104), {'count':len(ids104),'changed':[x for x in ids104 if active_m[x]!=newmap[x]]})

    comp=read(CAND/'composite-first-round-envelope-parameters.actual.json')
    envelope=indexed(rows(CAND/'native-finalbook/round-a/results/chemie-q1-atomic-split-20261005-v1-first-pass-a.batch-001.records.jsonl'))
    edeltas=[]
    for x in comp['recordRoutingOnlyDeltas']:
        origin=next(z for z in rows(resolve(x['sourceRecordPath'])) if z['goalId']==x['goalId'])
        e=envelope[x['goalId']]
        ds=diff(origin,e)
        if set(ds)-{'recordId','runId','campaignId','roundId'}:edeltas.append({'goalId':x['goalId'],'unexpected':ds})
    check('D_A_composite_preserves_all_nonrouting_fields', len(envelope)==10 and len(comp['recordRoutingOnlyDeltas'])==10 and not edeltas, {'count':len(envelope),'unexpected':edeltas,'originalReviewers':[{'goalId':x['goalId'],'reviewer':x['originalReviewer'],'sourceRunCompletedAt':x['sourceRunCompletedAt']} for x in comp['recordRoutingOnlyDeltas']]})
    all_copy_issues=[x['sourcePath'] for x in comp['sourceFiles'] if sha(resolve(x['sourcePath']))!=x['sha256'] or sha(resolve(x['copiedPath']))!=x['sha256']]
    check('D_A_originals_all_raw_bytes_preserved', not all_copy_issues, {'copies':len(comp['sourceFiles']),'changed':all_copy_issues})
    source_b=BASE/'chemie-q1-ten-current-independent-d-b-v1/results'
    target_b=CAND/'native-finalbook/round-b/results'
    b_files=list(source_b.glob('*.json*'))
    changed_b=[f.name for f in b_files if not (target_b/f.name).is_file() or sha(f)!=sha(target_b/f.name)]
    check('D_B_all_original_records_and_run_raw_bytes_preserved', len(b_files)==2 and not changed_b, {'files':[f.name for f in b_files],'changed':changed_b})
    resolution=read(CAND/'native-finalbook/resolution-index.json')
    check('native_current_D10_resolution_index_all_strict', len(resolution['resolutions'])==10 and all(x['strictDescriptionComplete'] for x in resolution['resolutions']), {'count':len(resolution['resolutions']),'goalIds':resolution['batchGoalIds']})

    independent_am=BASE/'chemie-q1-quantitative-two-current-independent-p-am-v1'
    for label,native,src in [('A','a-preservatives.review.jsonl','semantic-atomicity.review.jsonl'),('M','m-current-full.review.jsonl','memory-card-review.review.jsonl')]:
        originals=indexed(rows(independent_am/src))
        imported=indexed(rows(CAND/native))
        delta=[{'goalId':x,'fields':diff(originals[x],imported[x])} for x in KIDS]
        check('independent_'+label+'2_only_reviewId_routing_changes', all(set(x['fields'])<={'reviewId'} for x in delta), delta)

    source_delta=read(CAND/'source-metadata-correction.explicit-field-delta.actual.json')
    eo=read(resolve(source_delta['oldExtractionPath']))
    en=read(TREE/source_delta['newExtractionPath'])
    typ=read(CAND/'source-current2026-one-typographic-clause.completed.actual.receipt.json')
    typs=typ['onlyEightActualFields']
    metadata_en=read(resolve(typs[0]['beforeExactArchivedPath']))
    check('archived_metadata_stage_only_sourceDocument_changed', diff(eo,metadata_en)==['sourceDocument'] and diff(eo['sourceDocument'],metadata_en['sourceDocument'])==['path','title','url'], {'changedOuterFields':diff(eo,metadata_en),'changedDocumentFields':diff(eo['sourceDocument'],metadata_en['sourceDocument']),'oldSHA256':sha(resolve(source_delta['oldExtractionPath'])),'archivedMetadataSHA256':sha(resolve(typs[0]['beforeExactArchivedPath'])),'currentAfterTypographySHA256':sha(TREE/source_delta['newExtractionPath'])})
    mp=source_delta['HEMappingPath']
    ma=read(AUTHOR/'prospective-input-tree'/mp)
    mb=read(TREE/mp)
    metadata_mb=read(resolve(typs[1]['beforeExactArchivedPath']))
    check('archived_HE_metadata_stage_all_decisions_exact_only_extraction_path_changed', diff(ma,metadata_mb)==['sourceExtractionPath'], {'changedFields':diff(ma,metadata_mb),'sourceExtractionPath':metadata_mb['sourceExtractionPath']})
    typissues=[]
    for x in typs:
        before=read(resolve(x['beforeExactArchivedPath']));after=read(TREE/x['path'])
        changes=leaf_diffs(before,after)
        sort_paths=lambda rs: sorted(rs,key=lambda z:json.dumps(z['jsonPath']))
        if sort_paths(changes)!=sort_paths(x['onlyActualFieldDeltas']):typissues.append({'path':x['path'],'unexpected':changes})
        for z in changes:
            if not isinstance(z['before'],str) or z['before'].replace('–Poten Einfluss',', Einfluss')!=z['proposedAfter']:typissues.append({'unexpectedLiteral':z})
        if sha(resolve(x['beforeExactArchivedPath']))!=x['beforeSHA256'] or sha(TREE/x['path'])!=x['afterSHA256']:typissues.append({'shaMismatch':x['path']})
    check('only_authorized_eight_actual_typographic_source_fields', not typissues and sum(len(x['onlyActualFieldDeltas']) for x in typs)==8, {'fieldCount':sum(len(x['onlyActualFieldDeltas']) for x in typs),'issues':typissues,'authority':'Root authorized targeted source transcription correction; no scientific closure','affectedBindingReceipt':relative(CAND/'source-current2026-one-typographic-clause.completed.actual.receipt.json'),'actualReceiptSHA256':sha(CAND/'source-current2026-one-typographic-clause.completed.actual.receipt.json')})
    pdf=TREE/en['sourceDocument']['path']
    check('actual_2026_primary_PDF_exact_independent_science_input', sha(pdf)=='628c84dbaadebccf93c6854c58e00a337fd855985aaadc8b998de3dcb1243c3e', {'path':relative(pdf),'sha256':sha(pdf),'url':en['sourceDocument']['url']})
    beforefull=read(AUTHOR/'prospective-full-base.book-model.json')
    afterfull=read(CAND/'actual-current-full378.after-current-typography.book-model.json')
    beforeatlas=read(AUTHOR/'prospective-source-atlas.book-model.json')
    afteratlas=read(CAND/'actual-current-source-atlas.after-current-typography.book-model.json')
    check('all378_current_full_pages_exact_after_source_metadata', beforefull['pages']==afterfull['pages'] and len(afterfull['pages'])==378, {'pages':len(afterfull['pages'])})
    check('all359_current_source_atlas_pages_exact_after_source_metadata', beforeatlas['pages']==afteratlas['pages'] and len(afteratlas['pages'])==359, {'pages':len(afteratlas['pages']),'missingSources':378-len(afteratlas['pages'])})
    covered={x['goalId'] for x in afteratlas['pages']}
    all_atoms={x['goalId'] for x in afterfull['pages']}
    before_covered={x['goalId'] for x in beforeatlas['pages']}
    check('nineteen_source_gaps_remain_exact_and_open', len(all_atoms-covered)==19 and all_atoms-covered==all_atoms-before_covered, {'uncoveredCurrentGoalIds':sorted(all_atoms-covered)})
    si0=read(AUTHOR/'source-atlas-full.current-original-sources.json')
    si1=read(CAND/'actual-current-source-index.after-current-typography.original-sources.json')
    d0=indexed(si0['documents']);d1=indexed(si1['documents'])
    dc=diff(d0,d1)
    check('only_d30_document_metadata_changed_all_source_evidence_goal_facets_exact', dc==['d30'] and si0['evidence']==si1['evidence'] and si0['goals']==si1['goals'], {'changedDocuments':dc,'evidenceCount':len(si1['evidence']),'documents':len(si1['documents'])})
    prior_index=read(BASE/'chemie-q1-six-source-operator-remediation-current-candidate-v1/source-atlas-full.current-original-sources.json')
    ei_old=indexed(prior_index['evidence']);ei_new=indexed(si1['evidence'])
    pd_old=indexed(prior_index['documents']);pd_new=indexed(si1['documents'])
    protected_source=[]
    for gid in ids104:
        f_old=prior_index['goals'].get(gid);f_new=si1['goals'].get(gid)
        ev_ids={z for f in f_old or [] for z in f['evidenceIds']}
        doc_ids={ei_old[z]['documentId'] for z in ev_ids}
        protected_source.append({'goalId':gid,'wholeFacetsExact':f_old==f_new,'wholeEvidenceExact':all(ei_old[z]==ei_new[z] for z in ev_ids),'boundDocumentMetadataDeltas':[z for z in sorted(doc_ids) if pd_old[z]!=pd_new[z]]})
    check('protected104_source_facets_evidence_exact_only_d30_metadata', all(x['wholeFacetsExact'] and x['wholeEvidenceExact'] and set(x['boundDocumentMetadataDeltas'])<={'d30'} for x in protected_source), {'count':len(protected_source),'rows':protected_source})
    old_inputs=read(AUTHOR/'native-finalbook/round-b/description-review-input.json')['goals']
    new_inputs=read(CAND/'actual-current-d10.after-current-typography.rebuilt-goal-inputs.json')['goals']
    check('D10_whole_inputs_exact_after_source_metadata', old_inputs==new_inputs, {'beforeCount':len(old_inputs),'afterCount':len(new_inputs)})
    for x in KIDS+[AGG]:
        expected=newqa[x]['assetSha256'].removeprefix('sha256:')
        paths=[f'curricula/DE/Gymnasium/visualizations/chemie/{x}/{x}.png',f'app/public/assets/goal-visualizations/chemie/{x}/{x}.png',f'backend/src/main/resources/static/assets/goal-visualizations/chemie/{x}/{x}.png']
        hashes=[sha(TREE/p) for p in paths]
        check('image_three_copies_'+x, all(h==expected for h in hashes), {'expected':expected,'paths':paths,'actualSHA256':hashes})

    native=Path(read(CAND/'technical-integration-current-inputs.preflight.actual.json')['physicalNativeRoot'])
    codefiles=['app/scripts/reportDeepUnderstandingRollout.ts','app/scripts/testDeepUnderstandingRollout.ts','app/scripts/testDeepUnderstandingSupersessionChains.ts']
    coderecords=[{'path':p,'activeSHA256':sha(ROOT/p),'prospectiveSHA256':sha(native/p)} for p in codefiles]
    check('three_current_generic_checker_sources_byte_exact', all(x['activeSHA256']==x['prospectiveSHA256'] for x in coderecords), coderecords)
    run=read(CAND/'future-central-chemistry-current378.attempt-4.actual.receipt.json')
    report=read(resolve(run['stdoutPath']))
    s=report['subjects'][0]
    expected_new={'057a6826-f599-53b1-bdd1-5a83037a1494','39c85aa0-b01f-56ec-a148-b8009bf650f5','d742ecb0-0795-5446-a95d-9503d4618475','d76b80a2-5156-54f4-b3a1-546beddf0e14','10f657bc-6044-5fbb-ba8e-6e5ba55d2bc5','0d59b62e-d3f9-5969-b961-0c5e26316c04',*KIDS}
    check('actual_future112_current378_exact_intersection_preserves104_adds_only8', set(s['currentGoalIds'])==all_atoms and set(s['strictCompleteGoalIds'])==set(ids104)|expected_new and s['strictComplete']==112 and s['denominator']==378, {'strict':s['strictComplete'],'denominator':s['denominator'],'actualNewStrictIds':sorted(set(s['strictCompleteGoalIds'])-set(ids104)),'protectedStrictIdsMissing':sorted(set(ids104)-set(s['strictCompleteGoalIds'])),'humanApprovalClaimed':False,'completionReady':s['strictCompletionReady']})
    check('actual_future112_report_A201_M378_V359_six_requirements_and_zero_issues', s['gates']=={'currentDescriptionResolutions':112,'currentPositiveEvidenceProfiles':112,'currentSemanticAtomicityDecisions':201,'currentMemoryReviewDecisions':378,'currentVisualizationQaRecords':359} and len(s['requiredChecks'])==6 and all(x['status']=='pass' for x in s['requiredChecks']) and not s['issues'] and report['blockingIssueCount']==0, {'gates':s['gates'],'requiredChecks':s['requiredChecks'],'issues':s['issues'],'blockingIssueCount':report['blockingIssueCount']})
    check('future_report_actual_completed_exit0_current_checker_and_stream_SHA', run['exitCode']==0 and run['scriptSHA256']==sha(ROOT/'app/scripts/reportDeepUnderstandingRollout.ts') and run['stdoutSHA256']==sha(resolve(run['stdoutPath'])) and run['stderrSHA256']==sha(resolve(run['stderrPath'])), {'receiptPath':relative(CAND/'future-central-chemistry-current378.attempt-4.actual.receipt.json'),'receiptSHA256':sha(CAND/'future-central-chemistry-current378.attempt-4.actual.receipt.json'),'scriptSHA256':run['scriptSHA256'],'startedAtUTC':run['startedAtUTC'],'finishedAtUTC':run['finishedAtUTC'],'exitCode':run['exitCode'],'stdoutSHA256':run['stdoutSHA256']})

    plan_path=CAND/'guarded-apply-plan.json'
    plan=read(plan_path)
    write_issues=[]
    destinations=[x['targetPath'] for x in plan['writes']]
    for x in plan['writes']:
        src=resolve(x['sourcePath']);dst=resolve(x['targetPath'])
        actual_before=sha(dst) if dst.is_file() else None
        if actual_before!=x['beforeSHA256'] or sha(src)!=x['afterSHA256'] or src.stat().st_size!=x['afterBytes']:
            write_issues.append({'targetPath':x['targetPath'],'actualBefore':actual_before,'expectedBefore':x['beforeSHA256']})
    frozen_paths={x['path'] for p,_ in manifests for x in read(p)['files']}
    overwritten_frozen=sorted(set(destinations)&frozen_paths)
    check('all40_explicit_write_sources_and_current_preconditions_match_no_frozen_overwrites', len(destinations)==40 and len(set(destinations))==40 and not write_issues and not overwritten_frozen, {'writes':len(destinations),'preconditionIssues':write_issues,'wouldOverwriteFrozenPaths':overwritten_frozen,'planPath':relative(plan_path),'planSHA256':sha(plan_path)})
    deletes=[]
    expected_removed={'d742ecb0-0795-5446-a95d-9503d4618475','d76b80a2-5156-54f4-b3a1-546beddf0e14',AGG}
    for x in plan['deletes']:
        current=resolve(x['targetPath']);archive=resolve(x['preservedHistoricalPath'])
        deletes.append({'targetPath':x['targetPath'],'historicPath':x['preservedHistoricalPath'],'currentSHA256':sha(current),'archiveSHA256':sha(archive),'expectedSHA256':x['beforeSHA256'],'historicBytes':archive.stat().st_size,'expectedBytes':x['preservedBytes'],'goalId':current.stem})
    check('nine_authorized_faulty_operative_jpg_copies_preserved_exact_historical_bytes', len(deletes)==9 and {x['goalId'] for x in deletes}==expected_removed and all(x['currentSHA256']==x['archiveSHA256']==x['expectedSHA256'] and x['historicBytes']==x['expectedBytes'] for x in deletes), {'rows':deletes,'authorization':'Root confirmed only three documented scientific corrections; every original source/frontend/backend JPG remains byte-exact in immutable prior historical namespace','rootBeforeBackupAndRollbackRequiredBeforeApply':True})
    hg=[{'path':x['preservedPath'],'expectedSHA256':x['sha256'],'actualSHA256':sha(resolve(x['preservedPath']))} for x in plan['historicalPreservationGuards']]
    check('all12_historical_picture_and_prompt_preservation_guards_exact', len(hg)==12 and all(x['actualSHA256']==x['expectedSHA256'] for x in hg), hg)
    protected_other=[{**x,'actualSHA256':sha(resolve(x['path']))} for x in plan['protectedOtherCanonicalFiles']]
    check('math_physics_and_integrated_biology_whole_canon_preconditions_exact', len(protected_other)==3 and all(x['sha256']==x['actualSHA256'] for x in protected_other), protected_other)
    registry=plan['registry'];raw=resolve(registry['path']).read_text();rd=read(resolve(registry['path']))
    old_entry=next(x for x in rd['subjects'] if x['subject']=='chemie');future_entry=registry['futureWholeChemistryEntry']
    check('current_post_biology_registry_whole_SHA_and_whole_chem_entry_preconditions_match', sha(resolve(registry['path']))==registry['beforeWholeFileSHA256'] and old_entry==registry['expectedBeforeWholeChemistryEntry'], {'registryPath':registry['path'],'actualSHA256':sha(resolve(registry['path'])),'expectedSHA256':registry['beforeWholeFileSHA256'],'changedChemistryFields':diff(old_entry,future_entry),'replaceWholeRegistryForbidden':registry['replaceWholeRegistryForbidden']})
    check('all_old_positive_review_config_paths_retained_in_original_order', future_entry['positiveEvidenceConfigPaths'][:len(old_entry['positiveEvidenceConfigPaths'])]==old_entry['positiveEvidenceConfigPaths'], {'originalConfigs':len(old_entry['positiveEvidenceConfigPaths']),'futureConfigs':len(future_entry['positiveEvidenceConfigPaths'])})
    pre=read(CAND/'guarded-active-readonly-preflight.actual.receipt.json');sim=read(CAND/'guarded-exact-small-simulation.actual.receipt.json')
    check('actual_readonly_preflight_and40write9remove_simulation_use_this_exact_plan', pre['planSHA256']==sha(plan_path)==sim['planSHA256'] and pre['preflightPass'] and pre['actualDeltaFileWrites']==0 and not pre['actualRegistrySplicePerformed'] and sim['preflightPass'] and sim['actualDeltaFileWrites']==40 and sim['actualOldRasterRemovals']==9 and sim['wholeForeignSubjectRawEntriesExact'], {'preflightReceiptSHA256':sha(CAND/'guarded-active-readonly-preflight.actual.receipt.json'),'simulationReceiptSHA256':sha(CAND/'guarded-exact-small-simulation.actual.receipt.json'),'simulationRoot':sim['root'],'operativeWrites':0})
    active_raw=raw_subject_entries(raw)
    sim_root=Path(sim['root'])
    sim_registry_raw=(sim_root/registry['path']).read_text()
    simulated_raw=raw_subject_entries(sim_registry_raw)
    foreign_delta=[x for x in active_raw if x!='chemie' and active_raw[x]!=simulated_raw.get(x)]
    foreign_sha_issues=[x['subject'] for x in registry['foreignRawEntryGuards'] if hashlib.sha256(active_raw[x['subject']].encode()).hexdigest()!=x['sha256']]
    check('three_foreign_registry_subject_raw_strings_actually_exact_in_simulation', not foreign_delta and not foreign_sha_issues and set(active_raw)==set(simulated_raw), {'subjects':sorted(x for x in active_raw if x!='chemie'),'changedForeignSubjects':foreign_delta,'guardHashMismatches':foreign_sha_issues,'simulatedChemEntryExact':json.loads(simulated_raw['chemie'])==future_entry,'simRegistrySHA256':sha(sim_root/registry['path'])})
    policy='app/scripts/config/curriculum-maturity-floor-policy.json'
    head_bytes=subprocess.run(['git','show','HEAD:'+policy],cwd=ROOT,capture_output=True,check=True).stdout
    current_policy=read(ROOT/policy)
    check('all_nine_maturity_floor_policy_entries_exact_to_HEAD_no_plan_mutation', head_bytes==(ROOT/policy).read_bytes() and len(current_policy['floors'])==9 and not current_policy['exceptions'] and policy not in destinations and policy not in {x['targetPath'] for x in plan['deletes']}, {'policyPath':policy,'actualSHA256':sha(ROOT/policy),'headSHA256':hashlib.sha256(head_bytes).hexdigest(),'floorCount':len(current_policy['floors']),'exceptions':current_policy['exceptions'],'protectedMathAndPhysicsEvidenceUnchangedByChemPlan':True})

    report={'schemaVersion':1,'kind':'independent_readonly_technical_integration_guard','createdAtUTC':datetime.now(timezone.utc).isoformat(),'scope':'technical preservation and integration evidence; no new scientific judgments','finalFrozenCandidateReceived':bool(args.final_freeze),'checks':checks,'findings':findings,'preliminaryOnly':not bool(args.final_freeze),'humanApproval':False,'humanTrial':False,'operativeWrites':0,'newScientificApprovals':0,'newStrictClosures':0}
    (OWN/args.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'checks':len(checks),'findings':findings,'output':relative(OWN/args.output),'final':bool(args.final_freeze)}))

if __name__=='__main__':
    main()
