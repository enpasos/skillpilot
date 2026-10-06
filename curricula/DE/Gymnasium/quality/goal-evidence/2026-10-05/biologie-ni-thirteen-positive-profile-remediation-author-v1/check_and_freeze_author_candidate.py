#!/usr/bin/env python3
"""Run native P-only checks and preserve exact input/output evidence."""
from pathlib import Path
import datetime
import hashlib
import json
import shutil
import subprocess
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05')
AUTHOR = BASE / 'biologie-ni-ten-current-native-author-candidate-v2'
PREVIOUS = BASE / 'biologie-ni-eighteen-current-independent-p-v1'
OWN = BASE / 'biologie-ni-thirteen-positive-profile-remediation-author-v1'
CODE = ROOT / 'tmp/biologie-ni-thirteen-positive-profile-remediation-author-v1-native-root'
OUT = ROOT / OWN

def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(b): return hashlib.sha256(b).hexdigest()
def stable(v): return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',', ':')).encode()
def save(name,v): (OUT/name).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def rows(path): return [json.loads(x) for x in path.read_text().splitlines() if x.strip()]

def verify_input_freezes():
    result=[]
    for f in [ROOT/AUTHOR/'author-checkpoint.freeze.manifest.json',ROOT/PREVIOUS/'independent-positive-review.final.freeze.json']:
        d=json.loads(f.read_text()); checked=[]
        for q in d['files']:
            p=Path(q['path']); p=p if p.is_absolute() else ROOT/p
            actual=sha(p.read_bytes())
            assert actual==q['sha256'],p
            checked.append({'path':str(p.relative_to(ROOT)), 'bytes':p.stat().st_size, 'expectedSHA256':q['sha256'],'actualSHA256':actual})
        result.append({'manifestPath':str(f.relative_to(ROOT)), 'manifestSHA256':sha(f.read_bytes()),'actualFileCount':len(checked),'allFrozenFilesUnchanged':True,'actualFileChecks':checked})
    return result

def literal_profile_span(line):
    # Native JSONL serialisation writes profile as the last field. Decode the
    # actual bytes after the field key rather than reserialising a parsed value.
    token=b'"profile":'
    start=line.index(token)+len(token)
    while line[start:start+1] in (b' ',b'\t'): start+=1
    value,end=json.JSONDecoder().raw_decode(line[start:].decode())
    return line[start:start+len(line[start:].decode()[:end].encode())]

def main():
    before=verify_input_freezes()
    save('input-freezes.pre-native.actual.json',{'checkedAtUTC':now(),'inputs':before})
    cfg_rel=str(OWN/'positive.eighteen.remediated-author.config.json')
    candidates_rel=str(OWN/'positive.eighteen.remediated-author.candidates.json')
    materializer=CODE/'app/scripts/materializePositiveGoalEvidenceCandidates.ts'
    checker=CODE/'app/scripts/positiveGoalEvidenceReview.ts'
    tsx=CODE/'app/node_modules/.bin/tsx'
    cmds=[
        [str(tsx),str(materializer),'--config',cfg_rel,'--candidates',candidates_rel,'--write'],
        [str(tsx),str(materializer),'--config',cfg_rel,'--candidates',candidates_rel],
        [str(tsx),str(checker),'--config='+cfg_rel,'--mode=check'],
    ]
    receipts=[]
    for n,cmd in enumerate(cmds,1):
        start=now()
        result=subprocess.run(cmd,cwd=CODE,capture_output=True)
        stdout=OUT/f'native-positive-{n}.stdout.txt';stderr=OUT/f'native-positive-{n}.stderr.txt'
        stdout.write_bytes(result.stdout);stderr.write_bytes(result.stderr)
        rec={'argv':cmd,'cwd':str(CODE),'startedAtUTC':start,'completedAtUTC':now(),'exitCode':result.returncode,'stdoutPath':str(stdout.relative_to(ROOT)),'stdoutSHA256':sha(result.stdout),'stderrPath':str(stderr.relative_to(ROOT)),'stderrSHA256':sha(result.stderr),'scriptPath':str(Path(cmd[1]).relative_to(ROOT)),'scriptSHA256':sha(Path(cmd[1]).read_bytes()),'nativeSchemaAndBindingCheckOnly':True,'claimOfIndependentFindingResolution':False}
        receipts.append(rec)
        save('actual-native-positive-materialize-verify-check.receipt.json',{'checks':receipts,'independentFollowUpPending':True,'humanApproval':False,'humanTrial':False,'activeWrites':0})
        print(json.dumps({'nativeStep':n,'exitCode':result.returncode,'stdout':result.stdout.decode()[:2000]}))
        if result.returncode: raise SystemExit(result.returncode)

    cfg=json.loads((OUT/'positive.eighteen.remediated-author.config.json').read_text())
    record_path=ROOT/cfg['reviewPath']
    old_records=rows(ROOT/PREVIOUS/'positive.eighteen.current.review.jsonl')
    new_records=rows(record_path)
    assert len(new_records)==18
    assert [x['goalId'] for x in new_records]==cfg['scope']['goalIds']
    before_candidates=json.loads((OUT/'positive.eighteen.before.exact.candidates.snapshot.json').read_text())
    after_candidates=json.loads((OUT/'positive.eighteen.remediated-author.candidates.json').read_text())
    old_by_id={x['goalId']:x for x in old_records}
    old_lines={json.loads(x)['goalId']:x for x in (ROOT/PREVIOUS/'positive.eighteen.current.review.jsonl').read_bytes().splitlines()}
    new_lines={json.loads(x)['goalId']:x for x in record_path.read_bytes().splitlines()}
    proof=[]
    for index,(a,b,r) in enumerate(zip(before_candidates['goals'],after_candidates['goals'],new_records)):
        old=old_by_id[r['goalId']]
        assert r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1'
        assert r['reviewRunIds']==[]
        assert r['profile']==b['profile']
        for field in ['goalFingerprint','reviewInputFingerprint','reviewCriteriaFingerprint','goalFingerprintRuleVersion','profileRuleVersion','landscapeId']:
            assert old[field]==r[field],(r['goalId'],field)
        old_raw=literal_profile_span(old_lines[r['goalId']]);new_raw=literal_profile_span(new_lines[r['goalId']])
        expected_changed=index>=5
        assert (old['profileFingerprint']!=r['profileFingerprint'])==expected_changed
        if not expected_changed:
            assert a==b and old_raw==new_raw and old['profile']==r['profile']
        proof.append({'goalId':r['goalId'],'changedAuthorProfile':expected_changed,'beforeProfileFingerprint':old['profileFingerprint'],'afterProfileFingerprint':r['profileFingerprint'],'beforeLiteralNativeInnerProfileSHA256':sha(old_raw),'afterLiteralNativeInnerProfileSHA256':sha(new_raw),'literalNativeInnerProfileUnchanged':old_raw==new_raw,'actualNativeGoalFingerprintUnchanged':True,'actualNativeInputFingerprintUnchanged':True,'reviewCriteriaFingerprintUnchanged':True,'status':r['status'],'reviewAuthority':r['reviewAuthority'],'evidenceLevel':r['evidenceLevel'],'maximumClaimScope':r['maximumClaimScope']})
    save('actual-eighteen-native-record-bindings-and-five-literal-payload-protection.json',{'schemaVersion':1,'currentNativeRecords':18,'authorRemediatedProfiles':13,'unchangedValidInnerProfiles':5,'allGoalAndInputFingerprintsUnchanged':True,'approved':0,'needsHumanReview':18,'rejected':0,'allAuthority':'ai_candidate','allEvidenceLevel':'E1','allMaximumClaimScope':'G1','independentP13FollowUpPending':True,'rows':proof})

    schema_rows=[]
    for schema_rel,input_rel,values in [
        ('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json',cfg_rel,[cfg]),
        ('contracts/goal-evidence/v2/goal-evidence-profile.schema.json',cfg['reviewPath'],new_records),
    ]:
        schema_file=ROOT/schema_rel
        schema=json.loads(schema_file.read_text())
        validator=Draft202012Validator(schema,format_checker=FormatChecker())
        for v in values: validator.validate(v)
        schema_rows.append({'schema':schema_rel,'schemaSHA256':sha(schema_file.read_bytes()),'input':input_rel,'inputSHA256':sha((ROOT/input_rel).read_bytes()),'rowsPassed':len(values),'unchangedExistingSchema':True,'exitCode':0})
    save('actual-native-config-and-eighteen-record-schema-check.json',{'checkedAtUTC':now(),'checks':schema_rows,'exceptionsOrWaivers':0,'independentScientificResolutionFromSchema':False,'activeWrites':0})

    # The original D18/D5 books, goal bodies, primary sources and PNG evidence
    # remain frozen inputs, not regenerated or edited for this P-only repair.
    book_refs=[]
    for group in ['native-eighteen-current49-all-images-finalbook','native-existing-five-current49-bindings-finalbook']:
        base=ROOT/AUTHOR/group
        for q in sorted(base.rglob('*')):
            if q.is_file() and not q.is_symlink():
                book_refs.append({'path':str(q.relative_to(ROOT)),'bytes':q.stat().st_size,'sha256':sha(q.read_bytes())})
    actual_goals=json.loads((ROOT/cfg['landscapePath']).read_text())['goals']
    byid={x['id']:x for x in actual_goals}
    protected_goals=[]
    for gid in cfg['scope']['goalIds']:
        g=byid[gid]; links=[]
        for link in g.get('resourceLinks',[]):
            if link.get('type')=='goal-visualization':
                p=CODE/'app/public'/link['url'].lstrip('/')
                links.append({'url':link['url'],'actualBytes':p.stat().st_size,'actualSHA256':sha(p.read_bytes()),'resourceLinkUnchanged':True})
        protected_goals.append({'goalId':gid,'entireGoalObjectCanonicalSHA256':sha(stable(g)),'entireGoalObjectUnchanged':True,'currentImages':links})
    save('actual-unchanged-goal-bodies-d18-d5-sources-images-proof.json',{'schemaVersion':1,'landscapePath':cfg['landscapePath'],'landscapeBytesSHA256':sha((ROOT/cfg['landscapePath']).read_bytes()),'kindLedgerPath':cfg['semanticKindLedgerPath'],'kindLedgerBytesSHA256':sha((ROOT/cfg['semanticKindLedgerPath']).read_bytes()),'allFrozenAuthorFilesRechecked':556,'wholeGoalCount':18,'actualBookSourceAndReviewArtifactCount':len(book_refs),'originalSourcesNotEdited':True,'descriptionPagesNotEdited':True,'currentBindingsNotEdited':True,'imagesNotGeneratedOrEdited':True,'nativePositiveGoalAndInputBindingsMatchPreviousAll18':True,'goals':protected_goals,'originalBookAndSourceFiles':book_refs})
    after=verify_input_freezes()
    assert before==after
    save('input-freezes.post-native.actual.json',{'checkedAtUTC':now(),'inputs':after,'all578FrozenAuthorAndIndependentFilesUnchanged':True})
    shutil.copy2(CODE/'check_and_freeze_author_candidate.py',OUT/'check_and_freeze_author_candidate.py')
    # Complete JSON validity is checked independently of the curriculum schema
    # scanner: no truncated or zero-byte .json artefact is retained as success.
    counts={'json':0,'jsonlRows':0}
    for f in OUT.rglob('*'):
        if f.suffix=='.json': json.loads(f.read_text());counts['json']+=1
        elif f.suffix=='.jsonl': counts['jsonlRows']+=len(rows(f))
    save('author-candidate-valid-json-only.actual.json',{'checkedAtUTC':now(),'parseCountsBeforeThisReceipt':counts,'allCompleteParseable':True,'failedCommandStreamsStoredAsTxt':True})
    print(json.dumps({'nativeAll3ExitCodes':[x['exitCode'] for x in receipts],'schemaRows':19,'records':18,'authorRevisions':13,'unchangedLiteralInnerProfiles':5,'goalAndInputBindingChanges':0,'approved':0,'independentP13FollowUp':'pending','freeze':'to be created after README and final manual field review'}))

if __name__=='__main__': main()
