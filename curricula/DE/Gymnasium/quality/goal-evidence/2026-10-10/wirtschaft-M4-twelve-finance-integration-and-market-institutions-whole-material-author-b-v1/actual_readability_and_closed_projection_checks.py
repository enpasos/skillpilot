from pathlib import Path
from jsonschema import Draft202012Validator
import json,re,hashlib
O=Path(__file__).resolve().parent;ROOT=Path('/home/enpasos/projects/skillpilot')
def spacings(t,camel=False):
 parts=re.split(r'(https?://[^\s)]+)',t)
 for i,p in enumerate(parts):
  if p.startswith(('http://','https://')):continue
  p=re.sub(r'(?<=[A-Za-zÄÖÜäöüß])(?=\d)|(?<=\d)(?=[A-Za-zÄÖÜäöüß])',' ',p)
  if camel:p=re.sub(r'(?<=[a-zäöüß])(?=[A-ZÄÖÜ])',' ',p)
  parts[i]=p
 return ''.join(parts)
before=json.loads((O/'whole-twelve-local-finance-integration-market.DEEN-two-real-cases.DRAFT-author-v1.json').read_text())
after=json.loads(json.dumps(before));d=[]
for a,b in zip(before,after):
 for k in ('taskContent','taskContentEn','solutionContent','solutionContentEn'):
  b['examData'][k]=spacings(a['examData'][k])
  if b['examData'][k]!=a['examData'][k]:
   assert re.sub(r'\s','',b['examData'][k])==re.sub(r'\s','',a['examData'][k])
   assert re.findall(r'https?://[^\s)]+',b['examData'][k])==re.findall(r'https?://[^\s)]+',a['examData'][k])
   d.append({'materialId':a['id'],'field':k,'allNonWhitespaceCharactersExact':True,'allURLsExact':True})
target=O/'whole-twelve-local-finance-integration-market.DEEN-readable-two-real-cases.DRAFT-author-v2.json'
target.write_text(json.dumps(after,ensure_ascii=False,indent=2)+'\n')
scpath=ROOT/'contracts/curriculum-package/v1/compiled-landscape.schema.json';sc=json.loads(scpath.read_text())
validator=Draft202012Validator({'$schema':sc['$schema'],'$defs':sc['$defs'],'$ref':'#/$defs/goal'})
projections=[dict(m,semanticKind='practiceAssessment') for m in after]
errors=[{'material':m['id'],'path':list(e.path),'error':e.message} for m in projections for e in validator.iter_errors(m)]
assert not errors,errors
assert all(m['examData']['reviewStatus']=='draft' and m['requires']==m['examData']['coveredGoalIds'] and len(m['requires'])==1 and len(m['examData']['scoring']['steps'])==6 and sum(r['points'] for r in m['examData']['scoring']['steps'])==24 for m in after)
(O/'whole-twelve-conditional-practice-kind-schema-projections.NO-kind-approval.json').write_text(json.dumps(projections,ensure_ascii=False,indent=2)+'\n')
report={'role':'AUTHOR bounded readability and conditional schema checks only','actualTextFieldsChanged':len(d),'readabilityDeltas':d,'allOtherWholeFieldsExact':True,'actualConditionalGoalProjectionCount':12,'closedSchemaErrors':errors,'compiledSchema':str(scpath.relative_to(ROOT)),'compiledSchemaSHA256':hashlib.sha256(scpath.read_bytes()).hexdigest(),'practiceKindFlagIsConditionalNotIndependentReview':True,'noUnprojectedSourceSchemaPASSClaim':True,'wholeV1SHA256':hashlib.sha256((O/'whole-twelve-local-finance-integration-market.DEEN-two-real-cases.DRAFT-author-v1.json').read_bytes()).hexdigest(),'wholeV2SHA256':hashlib.sha256(target.read_bytes()).hexdigest()}
(O/'actual-twelve-readable-text-successor-and-closed-conditional-goal-schema.AUTHOR.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'textsChanged':len(d),'schemaCount':12,'schemaErrors':len(errors),'sha':report['wholeV2SHA256']}))
