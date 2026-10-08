# SPDX-License-Identifier: Apache-2.0
"""Supply ordinary JSON source-document dependencies missed by initial inert copy list."""
import hashlib
import json
from pathlib import Path
root = Path.cwd(); own = Path(__file__).resolve().parent
config = json.loads((root / 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json').read_text())
paths = set()
for path in config['mappingPaths']:
    mapping = json.loads((root / path).read_text()); extraction = json.loads((root / mapping['sourceExtractionPath']).read_text())
    documents = extraction.get('sourceDocuments',[extraction.get('sourceDocument',{})])
    for doc in documents:
        if doc.get('path','').endswith('.json'): paths.add(doc['path'])
bindings = []
for path in sorted(paths):
    p = root / path; data = p.read_bytes(); bindings.append({'path':path,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)})
    for version in ['before','after']:
        out = own / 'native-isolated-inputs' / version / path;out.parent.mkdir(parents=True,exist_ok=True)
        if out.exists(): assert out.read_bytes()==data
        else: out.write_bytes(data)
out = own / 'checks/additional-standard-JSON-source-document-inputs.technical.json'
assert not out.exists();out.write_text(json.dumps({'files':bindings,'reason':'Initial inert copy omitted JSON original-document inputs; native standard generator truthfully failed ENOENT. Supply actual unchanged JSON, no PDF/HTML copying, source weakening, or generator exception.','thirdPartyPDFHTMLCopiesAdded':0,'activeWrites':0},indent=2)+'\n')
print(json.dumps({'actualAdditionalJSONSourceDocumentDependencies':len(bindings),'activeWrites':0}))
