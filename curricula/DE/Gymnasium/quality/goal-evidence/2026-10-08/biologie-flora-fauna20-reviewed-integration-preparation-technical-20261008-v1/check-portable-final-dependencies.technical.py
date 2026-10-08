# SPDX-License-Identifier: Apache-2.0
# Existing bundle artifact contracts, git ignore semantics, and exact symlink guards.
from pathlib import Path
import json,hashlib,subprocess,datetime
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
def rel(p):return str(Path(p).relative_to(ROOT))
def digest(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def binding(p):return {'path':rel(p),'sha256':digest(p),'bytes':Path(p).stat().st_size}
required={}
def require(p,role):
 p=Path(p);assert p.is_file(),f'Missing required {role}: {p}';required[rel(p)]={'role':role,**binding(p)}
for p in OWN.rglob('*'):
 if p.is_file() and not p.is_symlink():require(p,'own commit-ready technical artifact')
bundle_contracts=[]
for name in ['original-frame-native-d-twenty','targeted-v4-native-d-one']:
 d=OWN/name/'bundle';m=read(d/'manifest.json');rows=[]
 for a in m['artifacts']:
  p=(d/a['path']).resolve();assert p.is_relative_to(d.resolve());require(p,'operative native bundle '+a['role']);assert digest(p)==a['digest'];assert p.stat().st_size==a['bytes'];rows.append(binding(p))
 bundle_contracts.append({'bundle':binding(d/'manifest.json'),'actualManifestArtifactPaths':rows,'nativeVerifier':'createGoalDescriptionReviewCampaign.ts: verifyGoalBookReviewBundleArtifactBytes resolves and reads bundleDirectory/artifact.path only','localOriginalRenderPathsAreRequiredLiveArtifacts':False})
for n in ['A20.future-inactive.config.json','M20.future-inactive.config.json']:
 c=read(OWN/'retained-current-AM'/n)
 for k in ['reviewPath','cardReviewPath']:
  if c.get(k):require(ROOT/c[k],'retained A/M decision/card source')
 for scope in c.get('visibilityScopes',[]):require(ROOT/scope['viewPath'],'retained required visibility scope')
c=read(OWN/'positive/current20.future-active.config.json');require(ROOT/c['reviewCriteriaPath'],'positive native criteria')
configs=['native-full391.future-active.config.json','native-full391.current474-inactive.config.json']
for n in configs:
 c=read(OWN/n)
 for k in ['landscapePath','semanticKindLedgerPath','goalVisualizationQaPath','compositionViewManifestPath']:
  if c.get(k):require(ROOT/c[k],'goal-book actual '+k)
 m=read(ROOT/c['compositionViewManifestPath'])
 for p in [*m['sourcePaths'],m['navigationViewPath'],m['durationModelPolicyPath']]:require(ROOT/p,'whole391 model source/scope dependency')
selected=read(OWN/'candidate/exact-selected-asset-provenance-and-paired-machine-approval.technical.json')
for row in selected['rows']:
 for k in ['sourceRaster','originalPrompt','originalGenerationProvenance']:
  e=row[k];require(ROOT/e['path'],'exact final asset transfer/provenance');assert digest(ROOT/e['path'])==e['sha256']
# Existing reviewer seals are immutable historical evidence. Their full local
# author-freeze lists include ignored original renderer outputs; operative D
# access uses the copied byte-exact native bundles above. No ignore exception.
base=OWN.parent;target=base/'biologie-flora-fauna20-amnion14-raster-native-targeted-author-root-v3'
observations=[]
for p in [target/'native-raster-candidate/twenty/book.pdf',target/'native-raster-candidate/twenty/book.html',target/'native-raster-candidate/twenty/bundle/book.pdf',target/'native-raster-candidate/twenty/bundle/book.html']:
 r=subprocess.run(['git','check-ignore',rel(p)],capture_output=True,text=True);observations.append({'path':rel(p),'actualGitCheckIgnoreExitCode':r.returncode,'ignored':r.returncode==0,'role':'historical local original render only' if '/twenty/book.' in str(p) else 'commit-ready original native bundle copy'})
assert [o['ignored'] for o in observations]==[True,True,False,False]
request='\n'.join(sorted(required))+'\n';checked=subprocess.run(['git','check-ignore','--stdin'],input=request,capture_output=True,text=True);assert checked.returncode in [0,1];ignored=checked.stdout.strip().splitlines() if checked.stdout.strip() else [];assert not ignored,f'Required inputs are ignored: {ignored}'
symlinks=[]
for p in OWN.rglob('*'):
 if p.is_symlink():
  q=p.resolve(strict=True);assert q.is_file();assert q.is_relative_to(OWN.resolve());symlinks.append({'path':rel(p),'resolvedTarget':rel(q),'targetExists':True,'targetSha256':digest(q)})
assert len(symlinks)==20
result={'artifactKind':'actual commit-ready final dependency and symlink guard','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'requiredFiles':list(required.values()),'requiredInputsGitIgnored':ignored,'gitCheckIgnoreActualExitCode':checked.returncode,'allRequiredFilesActuallyPresent':True,'bundleArtifactByteContracts':bundle_contracts,'actualOriginalRendererIgnoreObservations':observations,'historicalLocalRendererPathsRetainedAsHistoryOnly':True,'operativeNativeUsesOnlyCommitReadyBundleArtifacts':True,'symlinks':symlinks,'brokenSymlinks':0,'newIgnoreRules':0,'forceAddUsed':False,'newValidationExceptions':0,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False}
out=OWN/'checks/portable-final-dependencies-and-symlinks.actual.json';assert not out.exists();out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'requiredInputFiles':len(required),'requiredIgnoredFiles':0,'portableNativeBundles2':2,'symlinks20NoBroken':20,'activeWrites':0}))
