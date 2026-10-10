from pathlib import Path
import json,jsonschema,hashlib
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[6]
source='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1/eight-current-national-GK-terminal-rests-material-author-v1/whole-seven-new-GK-materials-and-one-existing-current-account-tag-proposal.DRAFT.readable-and-platform-country-author-successor-v2.json'
body=(ROOT/source).read_bytes()
assert hashlib.sha256(body).hexdigest()=='21c805434845f7b0eaf3477d848b15bada1f9677e5cb0e967eb967106127e64c'
schema_path=ROOT/'docs/landscape-runtime.schema.json'
schema=json.loads(schema_path.read_text())
fragment={'$schema':schema['$schema'],'$defs':schema['$defs'],'$ref':'#/$defs/goal'}
validator=jsonschema.Draft202012Validator(fragment)
rows=[]
for g in json.loads(body)['materials'][4:8]:
 errors=sorted(validator.iter_errors(g),key=lambda e:str(e.path))
 rows.append({'goalId':g['id'],'errors':[str(e.message) for e in errors]})
assert not any(r['errors'] for r in rows),rows
out={'role':'actual narrow validation against current closed runtime goal schema, original immutable V2 only','sourcePath':source,'sourceSHA256':hashlib.sha256(body).hexdigest(),'schemaPath':'docs/landscape-runtime.schema.json','schemaSHA256':hashlib.sha256(schema_path.read_bytes()).hexdigest(),'rows':rows,'errorCount':0,'materialScientificApprovalFromSchema':False}
(HERE/'actual-four-selected-original-V2-closed-goal-schema-check.result.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(out,ensure_ascii=False,indent=2))

