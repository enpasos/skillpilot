#!/usr/bin/env python3
"""Copy actual builtin outputs unchanged; no image processing or active writes."""
from pathlib import Path
from PIL import Image
import hashlib, json, re, shutil
OUT = Path(__file__).resolve().parent
for meta in sorted((OUT / 'first-seven/generated-originals').glob('*/builtin-generator*.metadata.json')):
    record = json.loads(meta.read_text())
    source = Path(re.search(r'as (/[^\n]+\.png) by default', record['actualOutputHint']).group(1))
    suffix = meta.name.replace('builtin-generator', '').replace('.metadata.json', '')
    dest = meta.parent / ('original-generated' + suffix + '.png')
    if dest.exists():
        assert dest.read_bytes() == source.read_bytes()
    else:
        shutil.copyfile(source, dest)
    width, height = Image.open(dest).size
    receipt = {'role': 'author exact original generator-output copy; no editing',
        'generatorOriginalPath': str(source), 'ownExactOriginalCopy': str(dest),
        'sha256': hashlib.sha256(dest.read_bytes()).hexdigest(), 'bytes': dest.stat().st_size,
        'width': width, 'height': height, 'mimeType': 'image/png', 'licenseForOwnCandidate': 'CC-BY-4.0',
        'actualGeneratorOutputBytesPreserved': True, 'independentVisualApproval': False,
        'humanApproval': False, 'newStrictCompletion': 0}
    (meta.parent / ('actual-original-byte-copy' + suffix + '.receipt.json')).write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps({'goalId': record['assetGoalId'], 'sha256': receipt['sha256'], 'width': width, 'height': height}))
