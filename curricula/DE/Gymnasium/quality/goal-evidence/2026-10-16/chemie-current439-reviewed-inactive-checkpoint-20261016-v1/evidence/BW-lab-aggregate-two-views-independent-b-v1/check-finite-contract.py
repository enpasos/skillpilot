import datetime
import hashlib
import json
from pathlib import Path

import jsonschema

R = Path.cwd()
T = R / 'tmp/chemie-m7-resumed-20261016'
O = T / 'BW-lab-aggregate-two-views-independent-b-v1'
A = T / 'BW-lab-aggregate-existing-child-acquisition-author-v1'
L = T / 'chemie-shared640-recycling-native-author-capsule-L6-v1'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
read = lambda p: json.loads(p.read_text())
pin = lambda p: {'path': str(p.relative_to(R)), 'sha256': sha(p), 'bytes': p.stat().st_size}
first = O / 'FIRST.scientific-source-role-acquisition.independent-b.sealed.json'
assert sha(first) == '42927e8e3c86a97814391229a6aeeed8c78ff639ba9a8d93e409205683abc144'
selector = A / 'OUTPUTS.finite-two-BW-views.AUTHOR.inactive.selector.json'
assert sha(selector) == 'f56548f16d1e3d497285991fde36959205bdc7b1a5e8d5567e2c9dc82aa8e60d'
s = read(selector)
caspath = R / s['guardedCAS']['path']
assert sha(caspath) == s['guardedCAS']['sha256']
cas = read(caspath)
assert len(cas['wholeFileReplacements']) == 2
expected = ['curricula/DE/Gymnasium/composition-views/chemie/de-bw-gk.view.json',
            'curricula/DE/Gymnasium/composition-views/chemie/de-bw-lk.view.json']
assert [x['targetPath'] for x in cas['wholeFileReplacements']] == expected
canonical = L / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
sem = L / 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
assert sha(canonical) == cas['baseCanonicalSHA256'] == s['baseCanonicalSHA256'] == 'ae53884b26285d9483b315f030216566b74fb7067e9fc962610e493aadeb3fb2'
assert sha(sem) == cas['baseSemanticKindsSHA256'] == s['baseSemanticKindsSHA256']
schema = L / 'contracts/curriculum-package/v1/composition-view.schema.json'
v = jsonschema.Draft202012Validator(read(schema))
jsonschema.Draft202012Validator.check_schema(read(schema))
node = {'kind': 'canonicalSubtree', 'goalId': '266a2b2a-9ee2-52f6-ae09-59343da9a60b', 'projectionRole': 'prerequisiteOnly'}
rows = []
for replacement in cas['wholeFileReplacements']:
    bpath = R / replacement['beforeWhole']['path']
    apath = R / replacement['afterWhole']['path']
    current = L / replacement['targetPath']
    assert sha(current) == sha(bpath) == replacement['expectedCurrentSHA256'] == replacement['beforeWhole']['sha256']
    assert sha(apath) == replacement['afterWhole']['sha256']
    before, after = read(bpath), read(apath)
    assert after['rootNodes'][0]['children'][-1] == node
    recovered = json.loads(json.dumps(after))
    recovered['rootNodes'][0]['children'].pop()
    assert recovered == before, 'Unadvertised whole-file semantic delta'
    assert replacement['onlySemanticDelta']['addedNode'] == node
    errors = {side: [{'path': list(e.absolute_path), 'message': e.message}
                     for e in v.iter_errors(doc)]
              for side, doc in [('before', before), ('after', after)]}
    assert not any(errors.values())
    rows.append({'targetPath': replacement['targetPath'], 'guardedCurrent': pin(current),
                 'before': pin(bpath), 'after': pin(apath),
                 'guardedBeforeExact': True, 'soleAppendedNode': node,
                 'recoveredWholeBeforeExact': True, 'schemaErrors': errors})
out = {'documentType': 'independent-b-actually-executed-finite-CAS-schema-check',
       'atUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
       'firstSealed': pin(first), 'authorSelector': pin(selector), 'CAS': pin(caspath),
       'canonical': pin(canonical), 'semanticKinds': pin(sem), 'schema': pin(schema),
       'checker': 'jsonschema.Draft202012Validator actual stock complete schema; exactly four whole documents',
       'views': rows, 'PASS': True, 'writesToBaselineOrNormal': False}
p = O / 'CHECK.actual-whole-CAS-guardedBefore-schema.independent-b.json'
p.write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'PASS': True, 'wholeViewReplacements': len(rows), 'wholeSchemaDocuments': 4,
                  'proof': pin(p)}, ensure_ascii=False))
