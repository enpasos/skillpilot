# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import hashlib
import importlib.util
import json
import subprocess

OWN = Path(__file__).parent
AUTHOR = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-source-findings-targeted-author-successor-20261010-v1')
def bind(p):
    p = Path(p); data = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def write(p, obj):
    assert not p.exists(), p
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    json.loads(p.read_text())

spec = importlib.util.spec_from_file_location('normal_schema_validator', 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec); spec.loader.exec_module(validator)
schema = json.loads(Path('docs/landscape-runtime.schema.json').read_text())
checked = sorted(OWN.rglob('*.json'))
for p in checked: assert validator.validate_file(str(p), schema), p
errors = validator.curriculum_symlink_errors('.'); assert not errors, errors
own_paths = sorted(p for p in OWN.rglob('*') if p.is_file())
for p in own_paths: assert not p.is_symlink(), p
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(str(p) for p in own_paths)+'\n', text=True, capture_output=True)
assert ignored.returncode in [0, 1] and not ignored.stdout, ignored.stdout
for name in ['FINAL.targeted-source-neutral-author.freeze.json','FINAL.source-context-precision-addendum.freeze.json']:
    frozen=json.loads((AUTHOR/name).read_text())
    refs = frozen.get('ownBindings',[]) + frozen.get('externalBindings',[]) + [v for v in frozen.values() if isinstance(v,dict) and 'sha256' in v]
    for ref in refs: assert bind(ref['path']) == ref, ref
proof=OWN/'checks/FIRST.normal-json-and-own-portability-before-seal.actual.json'
write(proof, {'schemaVersion':1,'normalValidator':'scripts/validate_schemas.py:validate_file/curriculum_symlink_errors','actualOwnCompleteJsonFilesParsed':len(checked),'normalValidateFilePassed':True,'curriculumSymlinkErrors':errors,'allOwnFilesRegularAndCommittable':True,'authorOwnExternalAndAddendumFrozenBytesExact':True,'noPeerReviewReadBeforeSeal':True,'humanApproved':0,'strictGain':0,'activeWrites':[]})
external_paths = [Path('AGENTS.md'),Path('LICENSING.md'),Path('docs/concept/skill-graph/atomic-goal-visualizations.md')]
external_paths += [AUTHOR/n for n in ['neutral-source-findings-targeted-author-successor.entry.json','FINAL.targeted-source-neutral-author.freeze.json','FINAL.source-context-precision-addendum.freeze.json']]
own_bindings = [bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()]
freeze=OWN/'FIRST.independent-b-targeted-source.freeze.json'
write(freeze, {'schemaVersion':1,'role':'Immutable genuine independent biological SOURCE B FIRST, sealed before relevant peer feedback','entry':bind(OWN/'FIRST.independent-b-targeted-source.entry.json'),'actualReadReceipt':bind(OWN/'FIRST.independent-b-actual-read.receipt.json'),'scientificReport':bind(OWN/'FIRST.independent-b-targeted-source.scientific-report.md'),'ownBindings':own_bindings,'neutralSourceAndPolicyBindings':[bind(p) for p in external_paths],'allActualBoundFilesRegularCommittable':True,'normalChecksCompleted':True,'peerReviewOrVerdictReadBeforeFirst':False,'rootAReadBeforeFirst':False,'priorBReadBeforeFirst':False,'packageState':'inactive','sourceApproval':False,'wholeCourseSourceApproval':False,'humanApproved':0,'strictGain':0,'activeWrites':[]})
assert validator.validate_file(str(freeze),schema)
for ref in own_bindings: assert bind(ref['path'])==ref
print(json.dumps({'entry':bind(OWN/'FIRST.independent-b-targeted-source.entry.json'),'firstFreeze':bind(freeze),'actualReadReceipt':bind(OWN/'FIRST.independent-b-actual-read.receipt.json'),'ownBindings':len(own_bindings),'humanApproved':0,'strictGain':0}))
