import json, os, pathlib, shutil, subprocess
R=pathlib.Path.cwd()
T=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current406-final-resource-P7-native8-technical-author-20261013-v1')
H=R/'tmp/checkpoint-chemie-20261013/current406-final-resource-P7-native8-technical-module-host'
H.mkdir(parents=True,exist_ok=False)
def hardtree(source,target):
    target.parent.mkdir(parents=True,exist_ok=True)
    subprocess.run(['cp','-al',str(source),str(target)],check=True)
for p in ['app/scripts','app/src','app/node_modules','contracts']:
    hardtree(R/p,H/p)
hardtree(R/'app/public/assets/goal-visualizations/chemie',H/'app/public/assets/goal-visualizations/chemie')
shutil.copytree(R/T,H/T)
def copyfile(p):
    source=R/p;target=H/p
    if target.exists():return
    target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
book=json.loads((R/T/'configs/whole406.final-resource-P7.inactive.config.json').read_text())
for p in [book['compositionViewPath']]+book['evidenceReviewPaths'][:-1]:
    copyfile(p)
for p in ['curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md','curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md','curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md']:
    copyfile(p)
assets=json.loads((R/T/'checks/eight-exact-publicRoot-source-assets.actual.json').read_text())['assets']
for x in assets:
    source=R/x['source']['path'];target=H/'app/public'/x['url'].lstrip('/')
    target.parent.mkdir(parents=True,exist_ok=True)
    # Detach copied physical hard link before replacing any prospective asset.
    # No write through a hard link may affect the active image source.
    if target.exists():target.unlink()
    shutil.copy2(source,target)
import hashlib
qa=json.loads((R/T/'candidate/QA.current403-plus-three-exact-reviewed-images.inactive.json').read_text())
transport=[]
for row in qa['records']:
    if row['visualizationState']!='available':continue
    target=H/row['publicAssetPath']
    expected=row.get('assetSha256','').removeprefix('sha256:')
    current=hashlib.sha256(target.read_bytes()).hexdigest() if target.is_file() else None
    if current==expected:continue
    source=R/row['canonicalAssetPath']
    actual=hashlib.sha256(source.read_bytes()).hexdigest()
    assert actual==expected,(row['goalId'],str(source),actual,expected)
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists():target.unlink()
    shutil.copy2(source,target)
    transport.append({'goalId':row['goalId'],'source':row['canonicalAssetPath'],'hostPublicAssetPath':row['publicAssetPath'],'sha256':'sha256:'+actual,'activeSourceChanged':False})
(R/T/'checks/full-QA-exact-candidate-asset-host-transport.actual.json').write_text(json.dumps({'transported':transport,'reason':'Full stock book loader hashes every available QA resource including retained aggregate/external context images. Exact committable candidate sources fill private host transport gaps; no new review or active writes.','newScientificApproval':False},ensure_ascii=False,indent=2)+'\n')
for cfg in [T/'configs/native-eight.final406.batch.config.json',T/'configs/P3.current406.final-resources.inactive.config.json',T/'configs/P4.current406.exact-retained.inactive.config.json']:
    c=json.loads((R/cfg).read_text())
    for k in ['promptPath','criteriaPath','reviewCriteriaPath']:
        if c.get(k):copyfile(c[k])
directorySymlinks=[str(p.relative_to(H)) for p in H.rglob('*') if p.is_symlink() and p.is_dir()]
discoverySymlinks=[p for p in directorySymlinks if not p.startswith('app/node_modules/')]
assert discoverySymlinks==[],discoverySymlinks
receipt={'hostPath':str(H.relative_to(R)),'moduleCopies':'Physical directory/file hardlinks to unmodified production modules and contracts; no edits to these hardlinks. Explicit physical JSON and image copies for candidate inputs.','directoryDiscoveryFixturesSymlinked':False,'activeAssetTargetsUnlinkedBeforePrivateReplacement':True,'boundRuntimeAssets':8,'candidateInputsUseCommittableRepositoryRelativePaths':True,'newScientificApproval':False,'activeWrites':False}
(R/T/'checks/physical-stock-module-host.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(receipt,ensure_ascii=False))
