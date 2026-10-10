from pathlib import Path
import json,re,copy,hashlib,jsonschema
O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-macro-contracts-coherent-local-material-author-v1');p=O/'whole-nine-macro-twelve-current-contracts-two-case-materials.DRAFT-author-v2.json';b=json.loads(p.read_text());a=copy.deepcopy(b)
for g in a:
 for k in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:
  text=g['examData'][k];parts=re.split(r'(https?://[^\s)]+)',text)
  for i in range(0,len(parts),2):
   parts[i]=re.sub(r'(?<=[A-Za-zÄÖÜäöüß])(?=[0-9])',' ',parts[i]);parts[i]=re.sub(r'(?<=[0-9])(?=[A-Za-zÄÖÜäöüß])',' ',parts[i])
  g['examData'][k]=''.join(parts)
g=a[7];assert '80 Stück mit einer vorgegebenen Technik fest' in g['examData']['taskContent'];g['examData']['taskContent']=g['examData']['taskContent'].replace('80 Stück mit einer vorgegebenen Technik fest','80 Stück mit der angegebenen sauberen Technik (0,5 Tonnen je Stück) fest')
# Specific unambiguous NAIRU value shorthand in the new German solution.
g=a[3];g['examData']['solutionContent']=g['examData']['solutionContent'].replace('u*5:','u* = 5:').replace('u*7:','u* = 7:').replace('Punktwertu 6','Punktwert u = 6')
p=O/'whole-nine-macro-twelve-current-contracts-two-case-materials.DRAFT-readable-author-v3.json';assert not p.exists();p.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n')
C=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');c=json.loads(C.read_text());c['goals']+=a
schema=json.loads(Path('docs/landscape-runtime.schema.json').read_text());errs=list(jsonschema.Draft202012Validator(schema).iter_errors(c));print('whole527 schemaErrors',len(errs));
for e in errs[:20]:print(list(e.path),e.message)
print('new9',hashlib.sha256(p.read_bytes()).hexdigest())
