# SPDX-License-Identifier: Apache-2.0
"""Validate actual scoped schema inputs and all own portable hash bindings."""
from pathlib import Path
import datetime, hashlib, json, subprocess
import jsonschema
ROOT=Path.cwd()
DIR=Path(__file__).resolve().parent
A=DIR.parent/'chemie-q3-three-BW-context-bound-practical-companions-author-v1'
S=DIR.parent/'chemie-q3-three-BW-SOURCE002-partial-concentration-author-successor-v2'
def bind(path):
    return {'path':path.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size}
def load(path):return json.loads(path.read_text())
checks=[]
def validate(path,schema_path,rows=False):
    schema=load(ROOT/schema_path)
    jsonschema.Draft202012Validator.check_schema(schema)
    validator=jsonschema.Draft202012Validator(schema)
    data=[json.loads(line) for line in path.read_text().splitlines() if line] if rows else [load(path)]
    for row in data:validator.validate(row)
    checks.append({'input':bind(path),'schema':bind(ROOT/schema_path),'validatedWholeRecords':len(data)})
validate(A/'candidate/full484-381.inactive-canonical.json','docs/landscape-runtime.schema.json')
validate(A/'candidate/full484-381.semantic-kinds.inactive-input.json','contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json')
# Actual minimal runtime views use normalizeCompositionView/compileCompositionView,
# already exercised for all five views. The closed curriculum-package interchange
# schema is a separate export contract and must not be imposed on runtime inputs.
validate(DIR/'positive/three-whole-practical.independent-b.config.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')
validate(DIR/'positive/three-whole-practical.independent-b.review.jsonl','contracts/goal-evidence/v2/goal-evidence-profile.schema.json',rows=True)
for path in (DIR/'source-atlas/exact-output-archive').rglob('source-manifest.json'):
    validate(path,'contracts/goal-book/v1/goal-book-source-manifest-v2.schema.json')
parsed=[];bound=[]
def walk(value,origin,pointer):
    if isinstance(value,dict):
        if isinstance(value.get('path'),str) and isinstance(value.get('sha256'),str) and isinstance(value.get('bytes'),int):
            relative=Path(value['path'])
            assert not relative.is_absolute() and '..' not in relative.parts,(origin,pointer,'nonportable')
            path=ROOT/relative
            assert path.is_file() and not path.is_symlink(),(origin,pointer,'missing/symlink')
            assert path.stat().st_size==value['bytes'],(origin,pointer,'bytes')
            assert hashlib.sha256(path.read_bytes()).hexdigest()==value['sha256'].removeprefix('sha256:'),(origin,pointer,'hash')
            bound.append({'origin':origin,'pointer':pointer,'binding':bind(path)})
        for key,item in value.items():walk(item,origin,pointer+'/'+key)
    elif isinstance(value,list):
        for index,item in enumerate(value):walk(item,origin,pointer+'/'+str(index))
for path in sorted(DIR.rglob('*')):
    assert not path.is_symlink(),path
    if not path.is_file():continue
    if path.suffix=='.json':
        data=[load(path)]
    elif path.suffix=='.jsonl':
        data=[json.loads(line) for line in path.read_text().splitlines() if line]
    else:continue
    parsed.append({'input':bind(path),'fullParsedRecords':len(data)})
    for index,row in enumerate(data):walk(row,str(path.relative_to(ROOT)),f'/{index}')
inputs=sorted({record['binding']['path'] for record in bound} | {p.relative_to(ROOT).as_posix() for p in DIR.rglob('*') if p.is_file()})
ignored=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(inputs)+'\n',text=True,capture_output=True,cwd=ROOT)
assert ignored.returncode==1 and not ignored.stdout,ignored.stdout
record={'schemaVersion':1,'license':'CC-BY-4.0','role':'Actual whole scoped closed-schema validation, full JSON parsing and portable hash binding checks',
        'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'schemaChecks':checks,'fullOwnJSONAndJSONLParse':parsed,
        'portableHashBindingsActuallyChecked':bound,'allOwnFilesAndActualBoundInputsNonIgnored':True,'noOwnSymlinks':True,
        'parseCount':len(parsed),'bindingOccurrenceCount':len(bound),'schemaCheckCount':len(checks),'schemasAreActualExistingContracts':True,
        'runtimeCompositionViewsValidatedByActualNormalCompiler':bind(DIR/'checks/own-scoped-source-roles-and-exact-preservation.actual.json'),
        'runtimeVersusPackageExportContractDistinction':'Minimal runtime composition inputs are validated by the existing normalizer/compiler; closed curriculum-package composition export is a distinct contract. Prior mistaken-contract EXIT1 remains recorded.',
        'wholeProgrammeApproval':False,'nativeOrVisualApproval':False,'humanApproval':False,'activeWrites':0,'strictGain':0}
target=DIR/'checks/actual-closed-schemas-whole-parsing-and-portability.independent-b.json'
target.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'schemaChecks':len(checks),'wholeJSONJSONLParsed':len(parsed),'actualPortableHashBindings':len(bound),'ignoredBoundFiles':0,'symlinks':0,'strictGain':0}))
