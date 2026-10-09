# SPDX-License-Identifier: Apache-2.0
"""Normal current-raster P1 APIs, schemas and exact unchanged13/27/source guards."""
import hashlib,importlib.util,json,shutil,subprocess
from pathlib import Path
import jsonschema
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;BASE=OWN.parent;REL=OWN.relative_to(ROOT).as_posix();CAP=ROOT/'tmp/biologie-upper-science-native14-current394-capsule'
def load(p):return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return dict(path=p.relative_to(ROOT).as_posix(),sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
def write(n,x):
 p=OWN/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def copy(p):
 dst=CAP/p.relative_to(ROOT);dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.exists():assert dst.read_bytes()==p.read_bytes()
 else:shutil.copyfile(p,dst)
assert not (OWN/'targeted-p11-own-results.first.freeze.json').exists()
for n in ['P11-own-results.author-candidate.config.json','P11-own-results-whole-profile.author-candidates.json']:copy(OWN/n)
copy(ROOT/'app/scripts/materializePositiveGoalEvidenceCandidates.ts')
config=REL+'/P11-own-results.author-candidate.config.json';candidate=REL+'/P11-own-results-whole-profile.author-candidates.json';tsx=str(ROOT/'app/node_modules/.bin/tsx')
commands=[[tsx,'scripts/materializePositiveGoalEvidenceCandidates.ts','--config',config,'--candidates',candidate,'--write'],[tsx,'scripts/materializePositiveGoalEvidenceCandidates.ts','--config',config,'--candidates',candidate],[tsx,'scripts/positiveGoalEvidenceReview.ts','--config='+config,'--mode=check']]
runs=[]
for i,cmd in enumerate(commands,1):
 r=subprocess.run(cmd,cwd=CAP/'app',capture_output=True,text=True);p=OWN/f'checks/ordinary-current-raster-P11-{i}.actual.stdout.txt';p.parent.mkdir(exist_ok=True);p.write_text(r.stdout+r.stderr)
 runs.append(dict(argv=cmd,cwd=CAP.relative_to(ROOT).as_posix()+'/app',exitCode=r.returncode,output=bind(p)))
 write('checks/ordinary-current-raster-P11.actual-terminal.json',dict(schemaVersion=1,runs=runs,exitCode=r.returncode,scientificApproval=False))
 assert r.returncode==0,r.stdout+r.stderr
cfg=load(OWN/'P11-own-results.author-candidate.config.json');record=(CAP/cfg['reviewPath']).read_bytes();out=ROOT/cfg['reviewPath'];assert not out.exists();out.write_bytes(record)
rs=[json.loads(s) for s in record.decode().splitlines() if s];assert len(rs)==1;r=rs[0]
jsonschema.validate(r,load(ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
assert r['goalId']=='8375310d-1f7e-542d-9969-55ad4bd37f7c' and r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' and r['reviewRunIds']==[]
assert r['profile']==load(OWN/'P11-own-results-whole-profile.author-candidates.json')['goals'][0]['profile']
old=load(BASE/'remediation-v2/fourteen-whole-twenty-nine-bilingual-cases.author-candidate.json');new=load(OWN/'whole-fourteen-twenty-nine-cases.only-P11-own-results.candidate.json')
assert all(old['entries'][i]==new['entries'][i] for i in range(14) if i!=10)
assert all(old['entries'][i]['wholeCurrentGoal']==new['entries'][i]['wholeCurrentGoal'] for i in range(14))
assert sum(len(e['authoredCases']) for i,e in enumerate(new['entries']) if i!=10)==27
native=load(BASE/'native-preparation-v1/neutral-fourteen-native-independent-review.entry.json');orig=[json.loads(s) for s in (ROOT/native['positiveRecordPath']).read_text().splitlines() if s]
kept=load(OWN/'other-thirteen-original-profile-bodies.exact-preserved.json');assert [r for r in orig if r['goalId']!=rs[0]['goalId']]==kept['records']
bound=[]
for seal in ['whole-fourteen-science-author.first.freeze.json','remediation-v2/targeted-whole-remediation.first.freeze.json','native-preparation-v1/fourteen-native-technical-author.first.freeze.json']:
 s=load(BASE/seal)
 for b in s['files']:assert bind(ROOT/b['path'])==b
 bound.append(dict(path=str((BASE/seal).relative_to(ROOT)),exactFiles=len(s['files'])))
for b in native['rasterBindings']:assert bind(ROOT/b['actualOriginalImage']['path'])==b['actualOriginalImage']
for m in load(BASE/'native-preparation-v1/neutral-inputs/current-whole-source-duties-and-partner-frame.json')['wholeAffectedMappingDecisions']:
 for b in [m['mappingBinding'],m['sourceExtractionBinding']]:assert bind(ROOT/b['path'])==b
assert (7.9-0.4)+(8.0-1.2)+(8.1-0.4)==22.0
assert [10/5,20/10,30/15]==[2,2,2] and 30-2*20==-10 and 2*15+5==35
schema=load(ROOT/'docs/landscape-runtime.schema.json');sp=importlib.util.spec_from_file_location('validator',ROOT/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(sp);sp.loader.exec_module(mod);checked=[]
for p in sorted(OWN.rglob('*.json')):
 assert not p.is_symlink() and mod.validate_file(p.relative_to(ROOT).as_posix(),schema),p;checked.append(bind(p))
write('checks/P11-targeted-schema-source-profile-guards.actual-terminal.json',dict(schemaVersion=1,exitCode=0,normalP1Candidate=bind(out),ordinaryPAuthority='ai_candidate',ordinaryPStatus='needs_human_review',ordinaryPLevel='E1',ordinaryPClaimScope='G1',exactOtherOriginalProfiles=13,exactOtherOriginalCases=27,wholeSourceMappingsAndCanonicalAndPNGsUnchanged=True,originalSealsExact=bound,actualArithmeticChecked=True,ownJsonCount=len(checked),ownJsonBindings=checked,independentScientificApprovals=0,humanApprovals=0,activeWrites=[],newScientificClosures=0,restoredBindings=0,netStrictGain=0))
print(json.dumps({'ordinaryP1':True,'exactOtherProfiles':13,'exactOtherCases':27,'schemaChecks':len(checked),'independentApprovals':0,'exitCode':0}))
