from pathlib import Path
import json,gzip,subprocess,hashlib,time
ROOT=Path('/dev/shm/informatics-coverage-independent-ci-review-20261107')
OUT=Path('/home/enpasos/projects/skillpilot/qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review/coverage-code-independent-review')
F=ROOT/'tmp/retained-assessment-chain-fixture'
SOURCE='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'
OWNER='7d51b38c-a149-5407-bddc-d2ce7878b020'
sha=lambda b:hashlib.sha256(b).hexdigest()
raw=gzip.decompress((F/'contracts/curriculum-assessment-coverage/v1/informatics/historical-informatics-source.json.gz').read_bytes())
assert sha(raw)=='b942a2a0630a668fadfc342c5787ecdc964349da909078a0cb024eeeb87c5e42'
assert sha((F/'contracts/curriculum-assessment-coverage/v1/informatics/history-inventory.json').read_bytes())=='f58ab88a6ba8b20cc00e5b28a57a65fb82eb7d9d381e54bcd4a4e2564ac46ff5'
config=json.loads((F/'overlay-current.json').read_text());config['bindings']=[];config['log']=str(F/'independent-floor.overlay.jsonl');Path(config['log']).write_text('');(F/'overlay-current.json').write_text(json.dumps(config))
code="import{readFileSync}from'node:fs';import{readCurrentCurriculumAssessmentScopes}from"+json.dumps(str(ROOT/'app/scripts/generateCurriculumQualityStatus.ts'))+";const c=readCurrentCurriculumAssessmentScopes(["+json.dumps(OWNER)+"]).get("+json.dumps(OWNER)+");const a=JSON.parse(readFileSync("+json.dumps(str(F/'docs/qa-ci/status/curriculum-quality-status.json'))+",'utf8'));const m=a.curricula[0].rules.find(r=>r.id==='CQR-204').assessmentValidation.retainedCoverageManifest;console.log(JSON.stringify({expectedStatus:c.retainedCoverage.manifest.status,artifactStatus:m.status,expectedFrame:c.retainedCoverage.manifest.frameDigest,artifactFrame:m.frameDigest,framesEqual:c.retainedCoverage.manifest.frameDigest===m.frameDigest,failingIds:c.retainedCoverage.manifest.failingGoalIds}));"
probe=F/'independent-frame-probe.mjs';probe.write_text(code)
base=json.loads(raw);positive=(F/'positive-status.json').read_bytes();forged=(F/'forged-status.json').read_bytes();results=[]
for kind in ['native-positive','same-frame-fabricated-positive','own-new-meaning-stale-positive']:
 s=json.loads(raw)
 if kind=='same-frame-fabricated-positive':
  next(g for g in s['goals']if g['id']=='33333333-3333-4333-8333-333333333333')['contains'].append('22222222-2222-4222-8222-222222222222')
 elif kind=='own-new-meaning-stale-positive':
  next(g for g in s['goals']if g['id']=='11111111-1111-4111-8111-111111111111')['description']+=' Additional competence under unchanged identity.'
 (F/SOURCE).write_bytes(raw if kind=='native-positive' else json.dumps(s,separators=(',',':'),ensure_ascii=False).encode())
 (F/'docs/qa-ci/status/curriculum-quality-status.json').write_bytes(forged if kind=='same-frame-fabricated-positive'else positive)
 prefix=['node','--import',str(F/'register-fixture-loader.mjs')]
 p=subprocess.run(prefix+[str(probe)],cwd=ROOT,capture_output=True,text=True);assert p.returncode==0,p.stderr;frame=json.loads(p.stdout)
 q=subprocess.run(prefix+[str(ROOT/'app/scripts/checkCurriculumMaturityFloors.ts')],cwd=ROOT,capture_output=True,text=True)
 assert (q.returncode==0)==(kind=='native-positive'),q.stdout+q.stderr
 if kind=='same-frame-fabricated-positive':assert frame['framesEqual'] and frame['expectedStatus']=='fail' and frame['artifactStatus']=='pass',frame
 if kind!='native-positive':assert 'assessment reports bound to current source discovery'in q.stderr
 results.append({'case':kind,'sourceSha256':sha((F/SOURCE).read_bytes()),'frameProbe':frame,'actualCliExitCode':q.returncode,'actualCliStdout':q.stdout,'actualCliStderr':q.stderr})
output={'kind':'Independent replay of exact synthetic test fixture only; no real Informatics floor acceptance','fixtureHistorySha256':sha(raw),'fixtureInventorySha256':config['inventorySha'],'productionConcreteBindingsRemainEmpty':True,'testLoaderUnchangedSha256':sha((F/'fixture-loader.mjs').read_bytes()),'results':results,'limit':'Existing isolated test loader replaces only fixed fixture pins/root/paths; no active source, production hook or native tool modification.'}
(OUT/'independent-floor-replay.json').write_text(json.dumps(output,indent=2)+'\n');print(json.dumps({'cases':len(results),'positiveExit':results[0]['actualCliExitCode'],'sameFrameForgeryExit':results[1]['actualCliExitCode'],'ordinaryMeaningMutationExit':results[2]['actualCliExitCode']}))
