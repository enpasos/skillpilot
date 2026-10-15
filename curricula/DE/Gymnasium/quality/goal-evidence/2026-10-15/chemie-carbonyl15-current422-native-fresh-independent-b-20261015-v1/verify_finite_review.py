import json, hashlib
from pathlib import Path

root = Path(__file__).parent
seal_path = root/'FILES.finite-review.seal.json'
seal = json.loads(seal_path.read_text())
actual = {str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() and p != seal_path}
expected = {x['path'] for x in seal['files']}
assert actual == expected, (actual-expected, expected-actual)
for item in seal['files']:
    p=root/item['path'];assert p.is_file() and not p.is_symlink()
    assert p.stat().st_size == item['bytes']
    assert 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest() == item['sha256']
    if p.suffix=='.json': json.loads(p.read_text())
    if p.suffix=='.jsonl':
        for line in p.read_text().splitlines(): json.loads(line)
first=json.loads((root/'D.FIRST.seal.json').read_text())
assert first['sha256']=='sha256:'+hashlib.sha256((root/first['file']).read_bytes()).hexdigest()
for item in seal['externalInputs']:
    p=Path(item['path']);assert p.is_file()
    assert 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()==item['sha256']
receipt=json.loads((root/'CHECK.stock-description-native-round-b.receipt.json').read_text())
assert receipt['exitCode']==0
print(json.dumps({'status':'PASS','scope':'finite byte/JSON integrity only; scientific judgments remain candidates','payloadFiles':len(expected),'DRecords':15,'stockNativeDExit':receipt['exitCode']}))
