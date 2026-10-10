import pathlib, json, hashlib, subprocess, os, xml.etree.ElementTree as ET

b = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-methods-twenty-current311-resumed-native-preparation-20261008-v1')
o = pathlib.Path(__file__).parent
iso = pathlib.Path('/tmp/skillpilot-wirtschaft-methods20-current311-resumed-q7lajzo9')
h = lambda p: 'sha256:' + hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
env = os.environ.copy()
env['PATH'] = '/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/bin:' + env['PATH']
env['LD_LIBRARY_PATH'] = '/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/lib/x86_64-linux-gnu'
receipt = {'schemaVersion': 1, 'role': 'independent-round-B-technical-input-guard-no-new-visual-review', 'packages': []}
imagebinds = {r['goalId']: r for r in json.loads((b/'actual-final20-native-inputs-and-whole311-impact.receipt.json').read_text())['actualImageBindings']}
for n in ['native-d-methods20-ordered-final', 'native-d-context16-ordered-final']:
    p = b/n/'bundle'
    m = json.loads((p/'book-model.json').read_text())
    rows = [json.loads(l) for l in next((b/n/'round-b/batches').glob('*.input.jsonl')).read_text().splitlines()]
    manifest = json.loads((p/'book.pdf.render-manifest.json').read_text())
    assets = {a['publicPath']: a for a in manifest['assets']}
    out = o/(n+'.bbox.html')
    subprocess.run(['pdftotext', '-bbox-layout', str(p/'book.pdf'), str(out)], env=env, check=True, capture_output=True)
    x = ET.parse(out)
    ns = {'x': 'http://www.w3.org/1999/xhtml'}
    pages = x.findall('.//x:page', ns)
    assert len(pages) == manifest['physicalPageCount']
    bad, count, checks = [], 0, []
    for i, page in enumerate(pages):
        width, height = float(page.attrib['width']), float(page.attrib['height'])
        words = page.findall('.//x:word', ns)
        count += len(words)
        for w in words:
            bounds = {k: float(w.attrib[k]) for k in ['xMin', 'xMax', 'yMin', 'yMax']}
            if bounds['xMin'] < -0.1 or bounds['yMin'] < -0.1 or bounds['xMax'] > width+0.1 or bounds['yMax'] > height+0.1:
                bad.append({'page': i+1, 'word': w.text, 'bounds': bounds})
        if i >= manifest['frontMatterPageCount']:
            g = m['pages'][i-manifest['frontMatterPageCount']]
            text = ' '.join(''.join(w.itertext()) for w in words)
            assert g['goalId'] in text
            v = g['visualization']
            a = assets[v['url']]
            assert a['sourceSha256'] == v['originalDigest']
            active = iso/'app/public'/v['url'].lstrip('/')
            assert h(active) == v['originalDigest']
            q = {'goalId': g['goalId'], 'physicalPageNumber': i+1,
                 'wholePageEqualBatch': rows[i-manifest['frontMatterPageCount']]['goal']['reviewContext']['page'] == g,
                 'actualOwnerIdPresentInPdf': True, 'visualizationOriginalDigest': v['originalDigest'],
                 'isolateActiveAssetWholeSha256': h(active), 'renderManifestSourceSha256': a['sourceSha256'],
                 'qaStatus': v['qaStatus'], 'approvedForPublication': v['approvedForPublication']}
            assert q['wholePageEqualBatch']
            if g['goalId'] in imagebinds:
                rb = imagebinds[g['goalId']]
                rp = pathlib.Path(rb['reviewReceiptPath'])
                assert h(rp) == rb['reviewReceiptSha256']
                assert v['originalDigest'] == rb['assetSha256']
                q['retainedActualIndependentVisualReceiptPath'] = str(rp)
                q['retainedActualIndependentVisualReceiptWholeSha256'] = h(rp)
            checks.append(q)
    assert not bad
    receipt['packages'].append({'package': n, 'bookModelWholeSha256': h(p/'book-model.json'),
                               'pdfWholeSha256': h(p/'book.pdf'), 'actualPhysicalPages': len(pages),
                               'actualOwnerPages': len(checks), 'textBoxes': count, 'outOfPageTextBoxes': bad,
                               'goalChecks': checks, 'bboxPath': str(out), 'bboxWholeSha256': h(out)})
(o/'actual-complete36-book-batch-pdf-source-asset-bindings.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2)+'\n')
print([(r['package'], r['actualOwnerPages'], r['actualPhysicalPages'], r['textBoxes'], len(r['outOfPageTextBoxes'])) for r in receipt['packages']])
print('receipt', h(o/'actual-complete36-book-batch-pdf-source-asset-bindings.json'))
