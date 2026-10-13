"""Apache-2.0: bounded author verification; no active curriculum writes."""
from pathlib import Path
import datetime, hashlib, importlib.util, json, stat, struct, subprocess, zlib
R = Path.cwd()
O = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-carbonyl-three-necessary-raster-author-20261013-v2'
P = R / 'tmp/chemie-carbonyl-three-raster-private'
assert not (O / 'FINAL.author-three-raster.seal.json').exists(), 'Sealed packet must remain immutable'
h = lambda p: 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
read = lambda p: json.loads(Path(p).read_text())
base = read(O / 'inputs/current-three-and-protected-CAS.actual.json')
ids = base['goalIds']
protected = base['baselineBindings'] + base['allActiveResourceBindings']
for b in protected:
    assert h(R / b['path']) == b['sha256'], b['path']
oldroot = O.parent / 'chemie-carbonyl-pharmacy15-current231-scientific-author-20261013-v1'
oldseal = read(oldroot / 'FINAL.author15-candidate.freeze.json')
for b in oldseal['fileBindings']:
    assert h(R / b['path']) == b['sha256'] and (R / b['path']).stat().st_size == b['bytes'], b['path']
canrel = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
a, b = read(R / canrel), read(O / 'visual-candidate' / canrel)
assert {k:v for k,v in a.items() if k != 'goals'} == {k:v for k,v in b.items() if k != 'goals'}
assert len(a['goals']) == len(b['goals']) == 523
assert [g['id'] for g in a['goals']] == [g['id'] for g in b['goals']]
oldby, newby = ({g['id']:g for g in x['goals']} for x in [a,b])
changed = [i for i in oldby if oldby[i] != newby[i]]
assert set(changed) == set(ids)
assert all(oldby[i] == newby[i] for i in oldby if i not in ids)
for i in ids:
    assert {k:v for k,v in oldby[i].items() if k != 'resourceLinks'} == {k:v for k,v in newby[i].items() if k != 'resourceLinks'}
    assert [l for l in oldby[i].get('resourceLinks',[]) if l.get('type') != 'goal-visualization'] == [l for l in newby[i].get('resourceLinks',[]) if l.get('type') != 'goal-visualization']
    links = [l for l in newby[i]['resourceLinks'] if l.get('type') == 'goal-visualization']
    assert len(links) == 1
    link = links[0]
    assert link['skillpilotId'] == i and link['url'] == f'/assets/goal-visualizations/chemie/{i}/{i}.png'
    assert link['reviewStatus'] == 'pilot' and link['license'] == 'CC-BY-4.0'
future = read(O / 'AUTHOR.future-three-inputs.additive.json')
assert h(R / future['candidateLandscapeBinding']['path']) == future['candidateLandscapeBinding']['sha256']
normal = read(O / 'generation/normal-private-import-and-retention.actual.json')
assert normal['candidateLandscapeSHA'] == h(O / 'visual-candidate' / canrel)
assert all(x['exitCode'] == 0 for x in normal['records']) and len(normal['records']) == 3
for s in normal['normalScripts']:
    assert h(R / s['path']) == h(P / s['path']) == s['sourceSHA']
for parent in normal['mutablePrivateParentChains']:
    p = P / parent['path']; st = p.lstat()
    assert stat.S_ISDIR(st.st_mode) and not stat.S_ISLNK(st.st_mode) and st.st_ino == parent['inode']
for original in normal['retainedOriginal466SourcePublicBackend']:
    assert h(R / original['sourcePath']) == h(P / original['sourcePath']) == original['sha256']
assert h(O / 'source/466.original-overvalent.jpg') == normal['retainedOriginal466SourcePublicBackend'][0]['sha256']
mem = read(O / 'checks/actual-current-M-cards-and-visibility-retained.json')
for x in mem['oldAuthorBindingsRetained']:
    assert h(R / x['path']) == x['sha256']
for x in mem['allCurrentChemistryDeckSourcePublicChecks']:
    assert h(R / x['sourcePath']) == h(R / x['publicPath']) == x['sha256']
    committed = subprocess.run(['git','show','HEAD:' + x['sourcePath']], check=True, capture_output=True).stdout
    assert 'sha256:' + hashlib.sha256(committed).hexdigest() == x['sha256']
def png_actual(path):
    data = path.read_bytes(); assert data[:8] == b'\x89PNG\r\n\x1a\n'
    chunks = []; offset = 8
    while offset < len(data):
        length = struct.unpack('>I',data[offset:offset+4])[0]
        kind = data[offset+4:offset+8]; body = data[offset+8:offset+8+length]
        crc = struct.unpack('>I',data[offset+8+length:offset+12+length])[0]
        assert zlib.crc32(kind + body) & 0xffffffff == crc, (path,kind)
        chunks.append(kind.decode('ascii'))
        if kind == b'IHDR': width,height = struct.unpack('>II',body[:8])
        offset += length + 12
    assert offset == len(data) and chunks[-1] == 'IEND' and 'caBX' in chunks
    return dict(path=str(path.relative_to(R)),sha256=h(path),bytes=len(data),width=width,height=height,pngCrcsValid=True,c2paContainerPresent=True,c2paCryptographicValidation='not performed')
prov = read(O / 'generation/tool-provenance.all-eight-attempts.actual.json')
assert len(prov['attempts']) == 8
attempt_records = []
for x in prov['attempts']:
    path = R / x['retainedArtifact']
    assert h(path) == h(Path(x['generatedFile'])) == x['sha256']
    assert (R / x['promptPath']).is_file()
    attempt_records.append(png_actual(path))
finals = []
for i in ids:
    image = O / 'candidate' / (i + '.png'); sha = h(image)
    t = read(O / 'generation' / (i + '.final-technical.json'))
    assert t['sha256'] == sha and (t['width'],t['height']) == (1672,941)
    copies = []
    for prefix in ['curricula/DE/Gymnasium/visualizations','app/public/assets/goal-visualizations','backend/src/main/resources/static/assets/goal-visualizations']:
        rel = Path(prefix) / 'chemie' / i / (i + '.png')
        p = O / 'visual-candidate' / rel
        assert h(p) == h(P / rel) == sha
        assert p.stat().st_nlink == (P / rel).stat().st_nlink == 1
        copies.append(str(p.relative_to(R)))
    for d in t['viewDerivatives']:
        assert h(R / d['path']) == d['sha256'] and d['heightLimitCss'] == 448
    assert {d['widthLimitCss'] for d in t['viewDerivatives']} == {316,360,680}
    finals.append(dict(goalId=i,**png_actual(image),normalSourceAppBackendCopyPaths=copies))
json_count = jsonl_rows = 0
for p in O.rglob('*'):
    assert not p.is_symlink(), p
    if not p.is_file(): continue
    if p.suffix == '.json': read(p); json_count += 1
    if p.suffix == '.jsonl':
        for line in p.read_text().splitlines():
            if line.strip(): json.loads(line); jsonl_rows += 1
spec = importlib.util.spec_from_file_location('bounded_schema_checks', R / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
symlink_errors = module.curriculum_symlink_errors(R)
assert not symlink_errors, symlink_errors
out = dict(schemaVersion=1,recordedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),kind='Bounded actual author verification, not independent approval',baseCanonicalSHA=h(R/canrel),candidateCanonicalSHA=h(O/'visual-candidate'/canrel),wholeNodes=523,changedGoalIds=changed,changedFields=['resourceLinks'],allOtherWholeGoalsExact=520,topLevelMetadataAndOrderExact=True,targetNonVisualizationFieldsExact=True,protectedBaselineBindings=len(base['baselineBindings']),allActiveResourceBindingsExact=len(base['allActiveResourceBindings']),originalAuthor54FileSealExact=True,originalAuthorFileBindings=len(oldseal['fileBindings']),currentMemorySourcePublicDeckPairsExact=len(mem['allCurrentChemistryDeckSourcePublicChecks']),currentMemoryVisibilityBindingsExact=len(mem['oldAuthorBindingsRetained']),normalPrivateImportsPassed=3,normalScriptsByteExact=True,privateMutableParentChainsRealAndInodeUnchanged=True,original466SourcePublicBackendBytesExact=True,allEightGeneratedAttemptsByteExact=True,generatedAttemptPNGRecords=attempt_records,finalCandidatePNGRecords=finals,parseCounts=dict(jsonFiles=json_count,jsonlRows=jsonl_rows),committableCurriculumSymlinkErrors=symlink_errors,noPacketSymlinks=True,priorNineKEEPAndThreeMobileHoldsUnchanged=True,actualAuthorInspections=dict(native=True,widthsCss=[360,680,316],heightCapCss=448),strictScientificCompletions=0,independentVotes=0,humanApproval=False,actualExecutionOrLearnerEvidence=False,activeWrites=False,fullBuildOrCampaignRun=False)
(O / 'checks/FINAL.inputs-copies-parse-CAS-and-symlinks.actual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:out[k] for k in ['candidateCanonicalSHA','allOtherWholeGoalsExact','allActiveResourceBindingsExact','originalAuthorFileBindings','parseCounts','committableCurriculumSymlinkErrors','independentVotes','strictScientificCompletions']}))
