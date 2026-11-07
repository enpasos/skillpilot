from pathlib import Path
import ast,gzip,hashlib,json,re
root=Path('/home/enpasos/projects/skillpilot');out=root/'qa-artifacts/ci-contract-audit/2026-11-07/prepared-dependency-namespace'
def sha(raw):return hashlib.sha256(raw).hexdigest()
def binding(p):
 p=Path(p);p=p if p.is_absolute() else root/p
 raw=p.read_bytes();return {'path':str(p.relative_to(root)),'bytes':len(raw),'sha256':sha(raw)}
protected={
'scripts/identity_qa_private_capture.py':'be4d2285c85656de4905a35e64d12e7fe0ef03ccb8711793acd805b715e41d46',
'scripts/test_identity_qa_private_capture.py':'d8841d2009b5d63f039b65a2375aceacc221b9981323ce344b1aa718e3a199d1',
'scripts/prepare_identity_qa_candidate.py':'3dad896644722c118331070f376f0053b7eec52efa3394d587201504b2ae7e8f',
'scripts/test_prepare_identity_qa_candidate.py':'0b01cc7969af9bcf0ae656d4f53b4780f06a69ba31d4ea71c36dcb9ba5d36b4f',
'scripts/verify_identity_qa_producer_reads.py':'280d4666f7a7653ba9e056f5b4a77098f3e63da8dca1593c0acc92683e784729'}
for p,h in protected.items():assert binding(p)['sha256']==h,(p,binding(p)['sha256'])
prior=[
('first-boundary','07bc8b8455c085d4e3b5538ceb032a03cb5ac49555ddc1309741f57e4e05b5fd','8527508d8ece774aaa0b2ddade2f204a1505798cd1da76483ea94617910303f4'),
('launcher-runtime-boundary','6af07939e67c62dbd203755f5dae961d966ee46812ef096dab0fa14133d9aa14','3a1a96ab33ed77386ebd443036308847fa2c7933868efb3f5aa10dc1df5109c1')]
# Historical docket prefixes are explicit because their names are not uniform.
old=[('source-identity-read-authentication-first-boundary','07bc8b8455c085d4e3b5538ceb032a03cb5ac49555ddc1309741f57e4e05b5fd','8527508d8ece774aaa0b2ddade2f204a1505798cd1da76483ea94617910303f4'),
('source-identity-read-launcher-runtime-boundary','6af07939e67c62dbd203755f5dae961d966ee46812ef096dab0fa14133d9aa14','3a1a96ab33ed77386ebd443036308847fa2c7933868efb3f5aa10dc1df5109c1'),
('source-identity-recorder-namespace-boundary','7fc3ff95988694cbc2626b2571ef2333bcb849bfd41da6cc9da9bf89f9cccfcf','763a56ede7ada7f87841954a3e4b6852918fa326a29e95616d111156e678157c'),
('source-identity-dependency-tree-absence-boundary','c090478aa9642c897ac6960c654ade6e93a394384744cc1a5c911e06acf08c9c','87cfa9906adb3c67179858082071a5cdd9cbdeba204e9848ee7aeede9f605de8'),
('source-identity-node-vm-lifecycle-boundary','f7493f527ee12cd547b0701c975a04416bf6a67d49409849741d75bfa8afe2ae','de46d129c66068ed9d3ba88619f9373debec20700789d3c11ba84a46cc57a226')]
oldpins=[]
for prefix,j,m in old:
 for ext,h in [('json',j),('md',m)]:
  b=binding('docs/dev/ci-graph-repairs/'+prefix+'-2026-11-07.'+ext);assert b['sha256']==h;b['unchanged']=True;oldpins.append(b)
code=json.loads((out/'code-pins.json').read_text())
for b in code:
 assert binding(b['path'])['sha256']==b['sha256'];assert binding(b['frozenCopy'])['sha256']==b['sha256'];ast.parse((root/b['path']).read_text())
suites=[]
for d in sorted((out/'final-tests').iterdir()):
 if not d.is_dir():continue
 ex=json.loads((d/'execution.json').read_text());p=next((d/'native-cases').glob('*runs.json'),None) or (d/'native-cases/results.json');r=json.loads(p.read_text())
 assert ex['exitCode']==r['errors']==r['failures']==r['skips']==0
 suites.append({'name':d.name,**ex,'tests':r['testsRun'],'actualNativeRuns':len(r.get('actualNativeRuns',[])),
 'failures':r['failures'],'errors':r['errors'],'skips':r['skips'],'result':binding(p),'stdout':binding(d/'stdout.txt'),'stderr':binding(d/'stderr.txt')})
ts=json.loads((out/'final-layout-ts/results.json').read_text());tsrows=[]
for r in ts['runs']:
 assert r['producerExitCode']==0 and r['authentication']['status']=='blocked'
 raw=gzip.decompress((out/'final-layout-ts'/r['role']/'producer.strace.gz').read_bytes()).decode()
 lookup=[l for l in raw.splitlines() if ('/original80/node_modules' in l or '/projectedA80/node_modules' in l) and '/app/node_modules' not in l]
 assert len(lookup)==1
 tsrows.append({'role':r['role'],'producerExitCode':r['producerExitCode'],'output':r['output'],'authentication':r['authentication'],
 'actualCwd':r['launch']['cwd'],'actualReadonlyDependencyMounts':r['launch']['readonlyDependencyMounts'],
 'actualPreparedNamespace':r['launch']['toolKernelContext']['preparedNamespace'],'blockedRawEvent':lookup[0],
 'rawRecorderSha256':r['launch']['recorderTraceSha256'],'producerTraceSha256':r['launch']['traceSha256']})
inv=json.loads((out/'storage-inventory.json').read_text())
for b in inv['entries']:
 stored=(root/b['path']).read_bytes();assert sha(stored)==b['storedSha256'];raw=gzip.decompress(stored) if b['encoding']=='gzip' else stored
 assert len(raw)==b['rawBytes'] and sha(raw)==b['rawSha256']
glob=sorted(p.name for p in (root/'scripts').glob('test_*identity_qa*py'))
assert glob==['test_identity_qa_private_capture.py','test_prepare_identity_qa_candidate.py']
report={
 'purpose':'finite-prepared-dependency-namespace-mechanics-not-SourceA-QA-acceptance',
 'checkpointBeforeImplementation':'8bf6d5e221a78ab666af1a12b0d638527c29493d',
 'status':'bounded-mechanics-green-real-ts-producers-exit0-read-authentication-blocked',
 'codePins':code,
 'implementation':{
  'factory':'Actual existing materialize/capture receipt, external raw preparation pin, external tree pin, bound Git source lock, copied verifier bytes; no caller verified boolean',
  'namespace':'One verified private capture is actually mounted read-only at both declared roleRoot/app/node_modules targets; empty host mountstubs never supply successful input bytes',
  'execution':'Selected actual cwd is roleRoot/app. Namespace executable/FD/type/alias/directory identities bind to captured physical bytes; exact kernel namespace FD path must match',
  'lifetime':'Actual existing preparation lock held during launch; receipt, all prepared sources and full capture membership/types/bytes rechecked',
  'recorder':'Existing controller-owned recorder remains outside producer PID namespace, hidden by empty RO tmpfs; stdio remains controller pipes and /dev/null',
  'fchdirCoverageCorrection':'First genuine C run exposed omitted transport coverage: trace=%file omits fchdir. Add fchdir explicitly; retain existing strict cwd equality check',
  'lifecycleOverlapCorrection':'Preserved genuine concurrent getpid(?) and exit_group(0) intervals overlap but their resumes are not nested. Replace enclosure with nonempty overlap only, retaining same proven group, successful exit and no-derived-PID rule. Actual raw positive plus adjacent disjoint/no-group/wrong-group/read controls remain',
 },
 'tests':{'tests':sum(x['tests'] for x in suites),'actualNativeRuns':sum(x['actualNativeRuns'] for x in suites),'failures':0,'errors':0,'skips':0,'suites':suites,
 'namespaceControls':['both actual roles source/projection bytes','namespace execution','openat(dirfd) plus fchdir cwd','internal alias and actual readlink','actual stat types','closed directory EOF membership','component ENOENT inside mounted capture','wrong preparation pin','fake capability/lock lease','busy actual preparation lock','nonempty host mountstub','mutated captured bytes/types/aliases','overlapping source binding','wrong kernel FD namespace identity','actual launch missing exact dependency mount']},
 'nativeTs':{'source':binding(out/'probe-layout-typescript.py'),'results':binding(out/'final-layout-ts/results.json'),
 'fixture':'Actual unchanged protected materializer and private capture path; one identity-field toy Git/projection fixture, not a valid full production Source-A proof',
 'toolTreeSha256':'c8aea9359fb3f7aad86cf62f78930426d38cc318dbff30c84387d5f672ad3359','toolEntries':90,'toolBytes':22928845,
 'sourceProof':binding(out/'final-layout-ts/fixture-proof.raw.json'),'sourceGitBundle':binding(out/'final-layout-ts/fixture.git.bundle'),
 'captureReceipt':binding(out/'final-layout-ts/capture-receipt.json'),'preparation':binding(out/'final-layout-ts/preparation.json'),'runs':tsrows,
 'fullReadAuthenticationPassed':False},
 'preservedHistory':[
 {'directory':str((out/'historical-cwd-red').relative_to(root)),'observed':'Real producer Exit0; authentication failed actual cwd equality because fchdir was absent from recorder transport'},
 {'directory':str((out/'historical-layout-ts-parent-block').relative_to(root)),'observed':'Both original/candidate producers Exit0; authentication blocked at each outer roleRoot/node_modules'},
 {'directory':str((out/'historical-lifecycle-overlap-red').relative_to(root)),'observed':'Protected recorder retained; first original TS launcher rejected real overlapping getpid/exit resumes under overstrict enclosure predicate'},
 {'path':binding(out/'lifecycle-overlapping-resume-recorder.strace.gz'),'rawSha256':'dd760b136c629cd6165c2b0b82c27825ebb382222a0e00818571e7efd01146a3'}],
 'unimplementedNextContract':binding('docs/dev/ci-graph-repairs/source-identity-prepared-namespace-parent-absence-contract-2026-11-07.md'),
 'protectedUnchanged':{'files':[binding(p) for p in protected],'capture19TestGlob':glob,'capture19Extended':False,'historicalDockets':oldpins},
 'storage':{'inventory':binding(out/'storage-inventory.json'),'selectedFiles':len(inv['entries']),'rawBytes':inv['rawBytes'],'storedBytes':inv['storedBytes'],'rawRamCarriersRetained':True,'largeToolTreeCopiedToRoot':False},
 'limits':[
 'No complete production 164/593/8584 source/QA verification or 9.8GB pair capture executed',
 'No complete Source-A producer, original-QA validity, AQA02/03, CQR, maturity, learner or runtime activation claim',
 'Real TS output Exit0 is not successful read authentication; outer roleRoot/node_modules remains blocked',
 'Actual prepared filesystem layout is reused, but full legacy runtime output/run-HOME/RW behavior and npm/shell profile are not yet reproduced; this adapter keeps sources/dependencies RO and cleared launcher environment',
 'No general parent-directory absence capability implemented; no node_modules basename rule or /dev/shm prefix rule',
 'No Canonical, active-QA, Policy, View, State, primary Git index or commit mutation',
 'No independent reader-peer approval is claimed; these are actual author tests and finite provenance evidence'
 ]}
name=root/'docs/dev/ci-graph-repairs/source-identity-prepared-dependency-namespace-boundary-2026-11-07.json'
name.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'report':binding(name),'tests':report['tests']['tests'],'native':report['tests']['actualNativeRuns'],'storage':report['storage']},ensure_ascii=False,indent=2))
