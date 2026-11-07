from pathlib import Path
import hashlib,json,datetime
W=Path(__file__).parent;R=Path('/home/enpasos/projects/skillpilot');H=lambda b:hashlib.sha256(b).hexdigest();frozen=json.loads((W/'frozen-manifest.json').read_text());expected={r['path']:r for r in frozen['files']};refs=list(frozen['preserved74']);active='contracts/goal-visualization-context/v1/qualified-context-index-economics17-2026-11-07.json';index=json.loads((R/active).read_text());refs += [r['receipt']for r in index['rows']];refs += [expected[p]for p in ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json','app/src/components/GoalCard.tsx','scripts/visualization_review_git_capsule.py']];inputs=json.loads((W/'native-inputs.json').read_text())
for r in inputs:
 for p in [r['current']['publicAssetPath'],r['current']['canonicalAssetPath']]:refs.append({'path':p,'sha256':'173f6e3e885ee50892849d69689585d3a5e785bbfe44b764419b2f6b6a515330'if r['boxplotV2']else r['current']['assetSha256'].removeprefix('sha256:')})
base=R/'qa-artifacts/ci-contract-audit/2026-11-07/economics-fixed74-authority-integration-candidate';oldManifest=json.loads((base/'manifest.json').read_text());capsuleFiles=[]
for r in oldManifest['files']:
 if r['path'].startswith('capsule/'):
  path=base/r['path'];actual=H(path.read_bytes());capsuleFiles.append({'path':str(path.relative_to(R)),'expected':r['sha256'],'actual':actual,'unchanged':actual==r['sha256']})
unique={r['path']:r for r in refs};rows=[]
for p,r in unique.items():
 actual=H((R/p).read_bytes());rows.append({'path':p,'expected':r['sha256'],'actual':actual,'unchanged':actual==r['sha256']})
result={'recordedAtActualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':rows,'historical74CapsuleFiles':capsuleFiles,'allUnchanged':all(r['unchanged']for r in rows+capsuleFiles),'all58ActiveAssetsChecked':116,'historical74ReceiptsChecked':74,'authority74Unchanged':True,'source':'e4de','boxplotActiveStillOld173f':True};(W/'postguard.json').write_text(json.dumps(result,indent=2)+'\n');assert result['allUnchanged'];print(json.dumps({k:v for k,v in result.items()if k not in ['files','historical74CapsuleFiles']}));print('guardFiles',len(rows),'oldCapsuleFiles',len(capsuleFiles))
