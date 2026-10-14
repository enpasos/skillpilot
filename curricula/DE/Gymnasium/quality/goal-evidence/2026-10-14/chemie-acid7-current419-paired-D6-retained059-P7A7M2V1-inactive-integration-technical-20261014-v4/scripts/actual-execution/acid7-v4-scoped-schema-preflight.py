import json,hashlib,subprocess,importlib.util
from pathlib import Path
from datetime import datetime,timezone
import jsonschema
R=Path.cwd();O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-acid7-current419-paired-D6-retained059-P7A7M2V1-inactive-integration-technical-20261014-v4')
store={}
for p in (R/'contracts').rglob('*.schema.json'):
 d=json.loads(p.read_text())
 if '$id' in d:store[d['$id']]=d
for p in (R/'docs').glob('*.schema.json'):
 d=json.loads(p.read_text())
 if '$id' in d:store[d['$id']]=d
errors=[];count=0;typed=0
for p in (R/O).rglob('*'):
 if p.suffix not in ('.json','.jsonl') or not p.is_file():continue
 docs=[json.loads(p.read_text())] if p.suffix=='.json' else [json.loads(x) for x in p.read_text().splitlines() if x.strip()]
 for line,d in enumerate(docs,1):
  count+=1
  sid=d.get('$schema') if isinstance(d,dict) else None
  if sid in store:
   typed+=1;s=store[sid];v=jsonschema.Draft202012Validator(s,resolver=jsonschema.RefResolver.from_schema(s,store=store),format_checker=jsonschema.FormatChecker())
   errors.extend({'path':str(p.relative_to(R)),'entry':line,'error':e.message,'instancePath':list(e.path)} for e in v.iter_errors(d))
# Production curriculum symlink checker with discovery bounded to this owned path.
spec=importlib.util.spec_from_file_location('validate_schemas',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);real_run=subprocess.run
class Scoped:
 def __getattr__(self,name):return getattr(subprocess,name)
 def run(self,argv,*a,**kw):
  if argv[:2]==['git','ls-files']:argv=argv+[str(O)]
  return real_run(argv,*a,**kw)
mod.subprocess=Scoped();link_errors=mod.curriculum_symlink_errors(R);errors.extend({'symlinkError':x} for x in link_errors)
report={'checkedAtUTC':datetime.now(timezone.utc).isoformat(),'scope':str(O),'parsedJsonAndJsonlObjects':count,'boundSchemaObjectsValidatedWithFormats':typed,'contractResolver':'Existing repository schema IDs only; no external network resolution','productionCurriculumSymlinkChecker':'Existing function; discovery restricted to owned root by pathspec, not global scan','errors':errors,'pass':not errors}
(R/O/'checks/PREFLIGHT.owned-schema-format-parse-and-scoped-production-symlinks.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='errors'}));print(json.dumps(errors[:8]));raise SystemExit(bool(errors))
