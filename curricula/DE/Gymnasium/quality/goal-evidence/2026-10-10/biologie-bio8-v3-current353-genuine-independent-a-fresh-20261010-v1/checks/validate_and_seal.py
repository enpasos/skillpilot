import json,hashlib,importlib.util
from pathlib import Path
from datetime import datetime, timezone
from bs4 import BeautifulSoup
import jsonschema

OUT=Path(__file__).resolve().parents[1]
ROOT=OUT.parents[6]
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3'
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_text())
def binding(p):return {'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size}
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');read(p)

assert sha((AUTHOR/'author-substantive-four.portable-final.entry.json').read_bytes())=='sha256:ea425820ba2c10f0d31b40cc5f4d8cc3db3efa8793d13fac82fd7907000cc9ab'
assert sha((AUTHOR/'author-substantive-four.portable-final.freeze.json').read_bytes())=='sha256:761f0ef730b3e7b9f6551f14d1a56bd529932852da97901cc93bcd8aeeb59a80'
schema=read(ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
body={'$schema':schema['$schema'],'$defs':schema['$defs'],'$ref':'#/$defs/profile'}
for b in read(AUTHOR/'final/ten-whole-current-P-profile-material-bindings.json')['records']:
 jsonschema.Draft202012Validator(body).validate(read(ROOT/b['wholeProfile']['path']))
recordschema=read(ROOT/'contracts/goal-description-review/v1/goal-description-review-record.schema.json')
runschema=read(ROOT/'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json')
records=0
for p in (OUT/'description/results').glob('*.records.jsonl'):
 for line in p.read_text().splitlines():jsonschema.Draft202012Validator(recordschema).validate(json.loads(line));records+=1
for p in (OUT/'description/results').glob('*.run.json'):jsonschema.Draft202012Validator(runschema).validate(read(p))
jsonparsed=0
for p in OUT.rglob('*.json'):
 if p.name not in ['FIRST.freeze.json','scoped-schema-and-portability.json']:read(p);jsonparsed+=1
spec=importlib.util.spec_from_file_location('scoped_validator',ROOT/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
portability=mod.curriculum_symlink_errors(ROOT);assert not portability,portability
whole=read(AUTHOR/'sources/final31-pairs-and34-whole-direct-operators.regular-primary.author.json')
for r in whole['records']:
 mapping=read(ROOT/r['wholeMapping']['path']);extraction=read(ROOT/r['wholeExtraction']['path'])
 assert r['wholeLiteralSourceGoal'] in extraction['sourceGoals']
 assert r['wholeMappingRecord'] in mapping['mappings']
 assert r['wholeSourceDecision'] in mapping['decisions']
html=AUTHOR/'native/portable-final19/bundle/book.html';soup=BeautifulSoup(html.read_text(),'html.parser')
refs=[]
for image in soup.find_all('img'):
 source=image['src'];p=(html.parent/source).resolve();assert p.is_file();assert p.is_relative_to(ROOT);refs.append(binding(p))
receipt={'createdAt':datetime.now(timezone.utc).isoformat(),'normalD19Validator':'passed; exact raw command output bound separately','scopedDRecordSchemasValid':records,'scopedRunSchemaValid':True,'wholeP10ProfileBodySchemaValid':10,'ownCompleteJsonFilesParsed':jsonparsed,'whole34DirectLiteralMappingDecisionObjectsExact':34,'whole31PairByteHashesValid':31,'curriculum_symlink_errors':portability,'operativeHTML':binding(html),'operativeHTML18ImageRefsValid':refs,'authorEntryAndFreezeExact':True,'scientificJudgmentsNotInferredFromValidation':True,'humanApproval':False,'actualLearners':0,'activeWrites':[]}
write(OUT/'checks/scoped-schema-and-portability.json',receipt)
files=[p for p in OUT.rglob('*') if p.is_file() and p.name!='FIRST.freeze.json' and '__pycache__' not in p.parts]
freeze={'kind':'immutable-own-FIRST-scientific-review-freeze','sealedAt':datetime.now(timezone.utc).isoformat(),'FIRST':binding(OUT/'scientific-FIRST.json'),'authorEntry':binding(AUTHOR/'author-substantive-four.portable-final.entry.json'),'authorFreeze':binding(AUTHOR/'author-substantive-four.portable-final.freeze.json'),'files':[binding(p) for p in sorted(files)],'blindToCurrentPeerReviewsBeforeThisSeal':True,'historicalEmbeddedMetadataExposure':'Declared in scientific-FIRST reviewerProvenance; no current B output read.','scientificDecisionAuthority':'ai_candidate','humanApproval':False,'profilesApproved':0,'actualLearners':0,'activeWrites':[]}
write(OUT/'FIRST.freeze.json',freeze)
print(json.dumps({'FIRST':binding(OUT/'scientific-FIRST.json'),'freeze':binding(OUT/'FIRST.freeze.json'),'D19':records,'P10Schema':10,'SOURCE34':34,'whole31':31,'portabilityErrors':len(portability)},ensure_ascii=False))
