import datetime, hashlib, json, sys
from pathlib import Path

O = Path(__file__).resolve().parent
B = O.parent
N = O / 'capsule'
Q = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-AV-native-registry-root-v1')

def pin(p):
    p = Path(p); raw = p.read_bytes()
    return {'path': str(p), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def own_dir(p):
    assert p == N or N in p.parents
    if p == N: return
    own_dir(p.parent)
    if p.is_symlink():
        source = p.resolve(strict=True); p.unlink(); p.mkdir()
        for child in source.iterdir():
            (p / child.name).symlink_to(child, target_is_directory=child.is_dir())
    elif not p.exists(): p.mkdir()
    assert p.is_dir() and not p.is_symlink()

def put_exact(p, raw):
    own_dir(p.parent)
    if p.exists():
        assert p.read_bytes() == raw, f'Existing different artifact: {p}'
        return pin(p)
    if p.is_symlink(): p.unlink()
    with p.open('xb') as f: f.write(raw)
    return pin(p)

def verify_pins(obj, seen):
    if isinstance(obj, dict):
        if 'path' in obj and 'sha256' in obj:
            p = Path(obj['path'])
            if p.is_file():
                actual = pin(p)
                assert actual['sha256'] == obj['sha256'].removeprefix('sha256:'), p
                if 'bytes' in obj: assert actual['bytes'] == obj['bytes'], p
                seen[str(p)] = actual
        for v in obj.values(): verify_pins(v, seen)
    elif isinstance(obj, list):
        for v in obj: verify_pins(v, seen)

specs = [
    {'key':'native20',
     'selector': B/'current439-jurisdiction-only-native20-preparation-technical-c-v1/SELECTOR.clean-current-native20-reviewer-inputs.sealed.json',
     'selector_sha':'7c7a29bd62f9e49a97ffe3af5767548381c30ce11f4738cf6d98b7af80c76d87',
     'a':B/'chemie-current439-jurisdiction20-native-independent-a-v1/SELECTOR.independent-a-description-output.sealed.json',
     'a_sha':'a40a892fd8831c6f2daddbaf840e09f56561a27ae3e18ad261eee12632d07311',
     'b':B/'chemie-current439-jurisdiction20-native-independent-b-v1/SELECTOR.independent-b20.sealed.json',
     'b_sha':'87c70d063ee6d70e7c33c25dd73920f79929403677f678d5a4c203c5889ff0fa'},
    {'key':'native6',
     'selector':B/'current439-native6-actual-context-remediation-preparation-technical-a-v1/SELECTOR.clean-current-native6-reviewer-inputs.sealed.json',
     'selector_sha':'a3fd2860e8c2c71323d80b0dddebe70f1452f2115fa4287f2718e6d0e608de75',
     'a':B/'chemie-current439-native6-independent-a-v1/SELECTOR.independent-a-description-output.sealed.json',
     'a_sha':'f2422e5e82289f011defdaa76da02b0f19d9de5e8daece2f115fabdbb45f7158',
     'b':B/'chemie-current439-native6-independent-b-v1/SELECTOR.independent-b6.sealed.json',
     'b_sha':'207bbd027a4157e13e9c4c835a51be1f0f7aa872bd564a938f33b122a74a948d'},
]
native14 = '--native14' in sys.argv
if native14:
    specs = [{'key':'native14',
     'selector':B/'current439-jurisdiction-only-native14-preparation-technical-c-v1/SELECTOR.clean-current-native14-reviewer-inputs.sealed.json',
     'selector_sha':'5fd0d8268bae0dd59a97c664cdc16a639013ad2121f5323b6c6028076b62fed2',
     'a':B/'chemie-current439-native14-independent-a-v1/SELECTOR.independent-a-description-output.sealed.json',
     'a_sha':'62bcd4f0c359415540601b438ab25ecff4bba35e1b1d82e43e73cd6086713863',
     'b':B/'chemie-current439-native14-independent-b-v1/SELECTOR.independent-b14.sealed.json',
     'b_sha':'3caa345fe228d40ca13821a51186c146daafd5f42bd00cb78d302245117ee333'}]
guards = {}
staged = []
for s in specs:
    for k in ['selector','a','b']:
        assert pin(s[k])['sha256'] == s[k+'_sha']
        guards[str(s[k])] = pin(s[k])
        verify_pins(json.loads(s[k].read_text()), guards)
    clean = json.loads(s['selector'].read_text())
    original_capsule = Path(clean['capsule'])
    root_path = Path(clean['nativeRoot']) if 'nativeRoot' in clean else Path(clean['stockPreparedManifest']['path']).parent
    root_rel = root_path.relative_to(original_capsule)
    original_manifest = json.loads((root_path/'batch-manifest.json').read_text())
    config_rel = Path(original_manifest['configPath'])
    assert 'sha256:'+pin(N/config_rel)['sha256'] == original_manifest['configDigest']
    own_dir(N/root_rel)
    manifest = json.loads((N/root_rel/'batch-manifest.json').read_text())
    copies = []
    for label, round_key in [('a','first'),('b','second')]:
        reviewer = json.loads(s[label].read_text())
        input_pins = reviewer.get('pins', reviewer.get('files', reviewer.get('outputPins')))
        records_pin = next(x for x in input_pins if x['path'].endswith('.records.jsonl') or x['path'].endswith('/description-records.jsonl'))
        run_pin = next(x for x in input_pins if x['path'].endswith('.run.json') or x['path'].endswith('/run-manifest.json'))
        run = json.loads(Path(run_pin['path']).read_text())
        binding = manifest['artifacts']['rounds'][round_key]
        batch_id = binding['batchId']
        dest = N/root_rel/f'round-{label}'/'results'
        own_dir(dest)
        copies.append(put_exact(dest/f'{batch_id}.records.jsonl', Path(records_pin['path']).read_bytes()))
        copies.append(put_exact(dest/f'{batch_id}.run.json', Path(run_pin['path']).read_bytes()))
        for x in [pin(s[label])] + [x for x in input_pins if Path(x['path']).name.startswith(('FIRST.', 'CHECK.', 'validation.', 'generation-parameters', 'execution-declaration', 'POST-FIRST20.', 'SOURCE-PARTNER.'))]:
            dest_proof=N/Q/'independent-review-original-bytes'/s['key']/f'round-{label}'/Path(x['path']).name
            copies.append(put_exact(dest_proof,Path(x['path']).read_bytes()))
    own_dir(N/root_rel/'resolutions')
    staged.append({'key':s['key'],'configRelativePath':str(config_rel),'rootRelativePath':str(root_rel),'goalIds':manifest['goalIds'],'copies':copies})

for p, expected in guards.items(): assert pin(p) == expected, p
result={'role':'Exact independent native output staging; no changed review inputs or science votes',
        'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'staged':staged,'sourceGuards':list(guards.values()),'foreignSourceWrites':0,'humanApproval':False,
        'centralIndexRegistration':False,'fullCentralCompletionClaim':False}
raw=(json.dumps(result,ensure_ascii=False,indent=2)+'\n').encode()
p=O/('RECEIPT.exact-independent-native14-output-staging.json' if native14 else 'RECEIPT.exact-independent-native20-native6-output-staging.json')
if p.exists(): assert p.read_bytes()==raw
else: p.write_bytes(raw)
print(json.dumps({'receipt':pin(p),'staged':[{k:v for k,v in x.items() if k!='copies'} for x in staged],'verifiedSourcePins':len(guards)}))
