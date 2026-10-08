# SPDX-License-Identifier: Apache-2.0
"""Seal true original18 A results, keeping targeted revised image separately pending."""
from datetime import datetime,timezone
from pathlib import Path
import hashlib,json,subprocess

ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
AUTHOR=OWN.parent/'biologie-he-evolution-eighteen-raster-native-author-technical-20261008-v1'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,v):
    with p.open('x') as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
first=OWN/'eighteen-genuine-current-D-P-V.independent-a.first.freeze.json'
assert sha(first)=='a9e42e81610873f28387231def05e2424be310d2a20788b930d1dfde813a7e1b'
for b in read(first)['ownFiles']:
    p=ROOT/b['path'];assert sha(p)==b['sha256'] and p.stat().st_size==b['bytes']
assert read(OWN/'D18.native.terminal.actual.json')['actualTerminalExitCode']==0
assert read(OWN/'P18.native.v2.terminal.actual.json')['actualTerminalExitCode']==0
af=read(AUTHOR/'eighteen-current204-raster-native-author.first-input.freeze.json')
inputs=af['ownFiles']+af['authorizedInactiveAtlasFiles']
required={b['path']:b for b in inputs}
for p in sorted(OWN.rglob('*')):
    if p.is_file():required[str(p.relative_to(ROOT))]=bind(p)
broken=[];bad=[]
for b in required.values():
    p=ROOT/b['path']
    if p.is_symlink() and not p.exists():broken.append(b['path'])
    if not p.exists() or sha(p)!=b['sha256'].removeprefix('sha256:') or p.stat().st_size!=b['bytes']:bad.append(b['path'])
assert not broken and not bad,(broken,bad)
argv=['git','check-ignore','--no-index','--stdin']
ignored=subprocess.run(argv,input='\n'.join(required)+'\n',capture_output=True,text=True)
assert ignored.returncode==1 and not ignored.stdout and not ignored.stderr,(ignored.returncode,ignored.stdout,ignored.stderr)
bundle=AUTHOR/'native-eighteen-author/eighteen/bundle'
manifest=read(AUTHOR/'native-eighteen-author/eighteen/round-a/review-bundle-manifest.json')
for a in manifest['artifacts']:
    p=bundle/a['path'];assert sha(p)==a['digest'].removeprefix('sha256:') and p.stat().st_size==a['bytes']
write(OWN/'actual-original18-operative-portability.independent-a.json',{
 'schemaVersion':1,'checkedAt':datetime.now(timezone.utc).isoformat(),'actualPortableRequiredFiles':list(required.values()),
 'actualGitCheckIgnoreArgv':argv,'actualGitCheckIgnoreExit':ignored.returncode,'ignoredOperativeFiles':[],
 'brokenSymlinks':[],'author307InputsExact':True,'ownFirstSealAllFilesExact':True,
 'standardBundleArtifactsExact':len(manifest['artifacts']),'operativePDFHTMLBinding':'committable native-eighteen-author/eighteen/bundle/book.pdf and book.html',
 'noForceAddOrIgnoreException':True,'activeWrites':0})
write(OWN/'completed-original18-independent-a.neutral-handoff.entry.json',{
 'schemaVersion':1,'recordedAt':datetime.now(timezone.utc).isoformat(),'role':'Genuine original18 independent A current native D/P/V results, immutable before minimal one-goal followup',
 'firstWholeJudgment':bind(first),'verdict':bind(OWN/'actual-eighteen-current-D-P-V.independent-a.first.verdict.json'),
 'ownNativeDResults':'round-a/results','actualD18CLI':bind(OWN/'D18.native.terminal.actual.json'),
 'actualP18API':bind(OWN/'P18.current-raster-native-closed-semantic.independent-a.v2.actual.json'),
 'actualP18Terminal':bind(OWN/'P18.native.v2.terminal.actual.json'),
 'ownFirstDKEEP':18,'ownFirstPScopedSciencePASS':18,'ownFirstVActualKEEP':18,
 'subsequentRootReportedIndependentBFinding':'Goal7008979d original inset cat paw has insufficient digit rays; own original first judgment remains history. Author supplied actual five-digit revisedPNG; fullPNG personally viewed, targeted current nativepage/360/680/P1/D1 pending.',
 'targetedOneGoalId':'7008979d-7890-5f7b-ad07-27b8bb597cbe','targetedRevisedPNGSHA256':'cae551e813945967b2dc9d889ab04517da989fcfa131d5b1911e431d27033758',
 'unchanged17ScienceAndImagesRemainKEEP':True,'whole18IntegrationFinalApprovalClaimed':False,
 'peerCurrentFinalBFilesRead':0,'humanApproval':False,'humanTrial':False,'activeWrites':0,'strictGainClaimed':0})
files=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()]
write(OWN/'completed-original-eighteen-native-D-P-V.independent-a.final.freeze.json',{
 'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),'role':'Completed genuine original18 A native results; revised1 followup separate',
 'ownFirstSeal':bind(first),'ownFiles':files,'author307InputFiles':inputs,
 'actualD18TerminalExit':0,'actualP18ClosedSchemaPNGSemanticExit':0,'originalOwnD18KEEP':18,'originalOwnP18ScopedPASS':18,'originalOwnV18KEEP':18,
 'ordinaryRasterPCLI':'pending_installation','targetedOneGoalFollowupPending':True,'unchanged17GenuineKEEP':True,
 'whole18IntegrationApproval':False,'peerCurrentFinalBFilesRead':0,'humanApproval':False,'activeWrites':0,'strictGainClaimed':0})
print(json.dumps({'finalSeal':bind(OWN/'completed-original-eighteen-native-D-P-V.independent-a.final.freeze.json'),'D18Exit':0,'P18Exit':0,'targeted1Pending':True}))
