# SPDX-License-Identifier: Apache-2.0
"""Normal validators against actual inactive candidates; no scientific review."""
import hashlib, importlib.util, json, shutil, subprocess
from pathlib import Path
import jsonschema
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix()
CAP=ROOT/'tmp/biologie-upper-communication-evaluation-native16-current392-capsule'
def data(p):return json.loads(p.read_text())
def binding(p):
 b=p.read_bytes();return {'path':p.relative_to(ROOT).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def copy(p):
 dst=CAP/p.relative_to(ROOT);dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.exists():assert dst.read_bytes()==p.read_bytes(),str(p)
 else:shutil.copyfile(p,dst)
entry=data(OWN/'neutral-sixteen-native-independent-review.entry.json')
pcfg=data(ROOT/entry['positiveConfigPath'])
for p in [ROOT/entry['positiveConfigPath'],ROOT/entry['positiveRecordPath'],ROOT/pcfg['reviewCriteriaPath']]:copy(p)
for name in ['positiveGoalEvidenceReview.ts','positiveGoalEvidenceProfileModel.ts','goalEvidenceProfileModel.ts']:copy(ROOT/'app/scripts'/name)
for rel in ['contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json']:copy(ROOT/rel)
# Small regular-file dependency copies; no symlink or repository is introduced.
for name in ['ajv','ajv-formats','fast-deep-equal','json-schema-traverse','fast-uri','require-from-string']:
 dest=CAP/'app/node_modules'/name
 if not dest.exists():shutil.copytree(ROOT/'app/node_modules'/name,dest,symlinks=False)
assert not any(p.is_symlink() for p in CAP.rglob('*'))
cmd=[str(ROOT/'app/node_modules/.bin/tsx'),'scripts/positiveGoalEvidenceReview.ts','--config='+entry['positiveConfigPath'],'--mode=check']
r=subprocess.run(cmd,cwd=CAP/'app',text=True,capture_output=True)
log=OWN/'checks/ordinary-capsule-positive16.actual.stdout.txt';assert not log.exists();log.write_text(r.stdout+r.stderr)
assert r.returncode==0,r.stdout+r.stderr
schema=data(ROOT/'docs/landscape-runtime.schema.json')
spec=importlib.util.spec_from_file_location('schema_validate',ROOT/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
checked=[]
for p in sorted(OWN.rglob('*.json')):
 assert not p.is_symlink();assert mod.validate_file(p.relative_to(ROOT).as_posix(),schema),str(p);checked.append(binding(p))
jsonschema.validate(data(ROOT/entry['candidateCanonicalPath']),schema)
jsonschema.validate(pcfg,data(ROOT/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'))
records=[json.loads(s) for s in (ROOT/entry['positiveRecordPath']).read_text().splitlines() if s.strip()]
assert len(records)==16
for record in records:
 jsonschema.validate(record,data(ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
 assert record['reviewAuthority']=='ai_candidate' and record['status']=='needs_human_review' and record['evidenceLevel']=='E1' and record['maximumClaimScope']=='G1' and record['reviewRunIds']==[]
 assert len(record['profile']['applicationCaseBriefs'])==2
inputs=[]
for b in entry['inputBindings']:
 current=binding(ROOT/b['path']);assert current['sha256']==b['sha256'] and current['bytes']==b['bytes'],b['path'];inputs.append(current)
baseline=data(OWN/'before/canonical.current476.exact.json');current=data(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
assert current==baseline,'Active whole476 canonical changed during prep; record and reconcile a real delta before seal.'
assert data(ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')==data(OWN/'before/visualization-qa.current392.exact.json')
result={'schemaVersion':1,'role':'ordinary technical validation only; independent native D/P/V not performed here','positiveCommand':cmd,'capsulePath':str(CAP.relative_to(ROOT)),'positiveExitCode':r.returncode,'positiveOutput':binding(log),'positiveProfileCount':16,'positiveApproved':0,'positiveNeedsHumanReview':16,'PLevel':'E1','PClaimScope':'G1','JSONFilesChecked':checked,'declaredExternalInputsByteExactCount':len(inputs),'actualCurrentCanonicalGoals':476,'actualCurrentAtomicGoals':392,'activeWhole476BaselineExact':True,'activeWhole392QABaselineExact':True,'symlinksCreated':0,'newRepositoriesCreated':0,'activeWrites':[],'newScientificClosures':0,'restoredActiveBindings':0,'independentApproval':False,'humanApproval':False,'exitCode':0}
out=OWN/'checks/ordinary-capsule-positive-json-schema-portability.actual-terminal.json';assert not out.exists();out.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'technicalTerminal':binding(out),'positive16':'PASS candidates only','JSONCount':len(checked),'independentResultCount':0,'strictGain':0}))
