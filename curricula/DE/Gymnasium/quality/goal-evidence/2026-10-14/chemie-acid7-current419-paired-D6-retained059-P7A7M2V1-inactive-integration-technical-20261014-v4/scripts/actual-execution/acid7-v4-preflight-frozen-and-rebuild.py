import json,hashlib
from pathlib import Path
from datetime import datetime,timezone
R=Path.cwd();E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14');O=E/'chemie-acid7-current419-paired-D6-retained059-P7A7M2V1-inactive-integration-technical-20261014-v4';N=E/'chemie-acid7-two-description-one-image-current419-native-successor-technical-20261014-v3';H=R/'tmp/chemie-resume-20261014/acid7-integration-v4-host';sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();write=lambda p,x:(R/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
mpath=O/'checks/REBUILD.current419-final.alias50-assets428-plus-currentM.physical-map.actual.json';mp=json.loads((R/mpath).read_text());assets=[]
for row in mp['selectedCurrentAssetRows']:
 src=R/row['physicalRepositorySource']['path'];assert src.is_file() and not src.is_symlink();assert sha(src)==row['physicalRepositorySource']['sha256']
 for k in ['normalCanonicalDestination','normalPublicDestination']:
  assert sha(H/row[k])==sha(src)
 if row['publicMustBePhysicalWithinHostPublicRoot']:
  p=H/row['normalPublicDestination'];assert not p.is_symlink() and p.resolve().is_relative_to((H/'app/public').resolve())
 assets.append({'goalId':row['goalId'],'sha256':sha(src),'canonicalAndPublicByteExact':True,'publicPhysicalWithinHost':row['publicMustBePhysicalWithinHostPublicRoot']})
mp['memoryBindingForTwoChangedDescriptions']='Two actual independent B production rows, paired with unrelated fresh A judgments, are integrated in integrationMemoryReview; normal canonical legacy alias remains preserved.';mp['actualIntegrationHost']=str(H.relative_to(R));mp['rebuildScript']=str(O/'scripts/rebuild_inactive_host.py');write(mpath,mp)
# Whole source seals are rechecked; none are rewritten.
initial=json.loads((R/O/'inputs/INITIAL.actual-frozen-parent-seals.json').read_text())['seals'];sources=initial+[{'path':str(E/'chemie-acid7-current419-targeted-six-independent-b-20261014-v3/FILES.finite-independent-current-six.seal.json'),'sha256':'sha256:fd3dcdeb2ad294b4a8c275b13dd10573e94efa9729837c965e209043c29211ee'}];seals=[]
for ref in sources:
 sp=R/ref['path'];assert sha(sp)==ref['sha256'];data=json.loads(sp.read_text())
 for f in data['files']:
  p=Path(f['path']);p=p if p.is_absolute() else R/p;assert sha(p)==f['sha256'],str(p)
 seals.append({'path':ref['path'],'sha256':sha(sp),'fileCount':len(data['files']),'allExact':True})
# Native page/bundle/input/campaign scientific bytes are unchanged in both full containers.
copies=[]
for dst,src in [('historical-seven-original-science-normal',E/'chemie-acid-base-seven-current419-native-preparation-technical-20261014-v2/native-seven-current'),('native-six-current',N/'native-six-current')]:
 for p in (R/src).rglob('*'):
  if not p.is_file() or p.name=='batch-manifest.json':continue
  rel=p.relative_to(R/src);target=R/O/dst/rel;assert target.read_bytes()==p.read_bytes(),str(rel);copies.append({'source':str(p.relative_to(R)),'copy':str(target.relative_to(R)),'sha256':sha(p)})
# Stock tool source bytes match the existing repository; no helper/threshold edits.
tools=[]
for p in (H/'app/scripts').rglob('*'):
 if p.is_file():
  source=R/'app/scripts'/p.relative_to(H/'app/scripts');assert p.read_bytes()==source.read_bytes(),str(source);tools.append({'path':str(source.relative_to(R)),'sha256':sha(source)})
write(O/'checks/PREFLIGHT.frozen-science-native-copies-tools-physical-rebuild.actual.json',{'checkedAtUTC':datetime.now(timezone.utc).isoformat(),'allChecksPass':True,'sourceSeals':seals,'nativeScientificArtifactCopies':copies,'sourceToolHashes':tools,'currentAssets':assets,'physicalPublicCount':sum(r['publicPhysicalWithinHost'] for r in assets),'wholeCurrentSourceAssets':len(assets),'allOriginal305BodiesAndDirectContextUnchangedProof':'checks/PRESERVED.actual305-whole-bodies-adjacency-and-neighbor-bodies.json','allOriginalHumanFieldsUnchangedProof':'V/V3.actual-source-judgments-and-QA-fielddiffs.json','noActiveOrProtectedWrites':True,'noNewCentralMeasurementYet':True})
print(json.dumps({'sourceSealsVerified':len(seals),'nativeWholeScientificCopies':len(copies),'stockToolsByteExact':len(tools),'physicalAssetsMappedAndVerified':len(assets),'selectedPhysicalPublicCount':sum(r['publicPhysicalWithinHost'] for r in assets)}))
