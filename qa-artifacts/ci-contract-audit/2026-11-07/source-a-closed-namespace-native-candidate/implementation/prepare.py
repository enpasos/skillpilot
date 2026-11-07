import pathlib,json,hashlib,os,shutil,fcntl,sys,re,importlib.util,time,stat
R=pathlib.Path('/home/enpasos/projects/skillpilot');W=pathlib.Path('/dev/shm/source-a-closed-namespace-native-candidate-20261107');sys.path.insert(0,str(R/'scripts'));from identity_qa_private_capture import dependency_inventory,inventory_digest,private_write,verify_private_hardlinks
h=lambda b:hashlib.sha256(b).hexdigest();J=lambda d:(json.dumps(d,ensure_ascii=False,indent=2)+'\n').encode();proof=json.loads(pathlib.Path('/dev/shm/skillpilot-identity-qa-80d70f08e0/source-a.json').read_text());asset=R/'curricula/DE/Gymnasium/visualizations/biologie/8e2244e1-8616-5f24-859f-8e10df1c887b';catalog={x['path']:json.loads((R/x['path']).read_text())for x in proof['catalog']['sourceFiles']};code=W/'code';code.mkdir(exist_ok=True)
for p in (R/'scripts').glob('identity_qa_*.py'):shutil.copyfile(p,code/p.name)
for p in ['canonical_goal_identity_migration.py','canonical_goal_source_identity_proof.py']:shutil.copyfile(R/'scripts'/p,code/p)
for p in ['reference-fields.json','reference-fields.schema.json','source-bijection-proof.schema.json','canonical-json-profile.json']:
 raw=(R/'contracts/canonical-goal-identity/v1'/p).read_bytes();(code/p).write_bytes(raw)
spec=importlib.util.spec_from_file_location('identity_kernel',code/'canonical_goal_identity_migration.py');k=importlib.util.module_from_spec(spec);spec.loader.exec_module(k);rules=k.build_bijection(catalog);keys=['landscapeId','sourceGoalId','targetGoalId'];assert [{key:r[key]for key in keys}for r in rules]==[{key:r[key]for key in keys}for r in proof['rules']];assert len(rules)==164
owners,known=k.identity_index(catalog);renamed={(r['landscapeId'],r['sourceGoalId']):r['targetGoalId']for r in rules};matcher=re.compile('|'.join(map(re.escape,sorted({r['sourceGoalId']for r in rules}))));registry=json.loads((code/'reference-fields.json').read_text());original={p:(R/p).read_bytes()for p in catalog};projected={};projection=[]
for path,obj in catalog.items():
 new,fields,preserved,blockers,inverse=k.transform_document(k.parse_json(original[path]),'runtime-graph',registry,renamed,owners,known,matcher);assert not blockers,(path,blockers);raw=k.stable(new)+b'\n'if fields else original[path];projected[path]=raw;projection.append({'path':path,'originalSha256':h(original[path]),'projectedSha256':h(raw),'fields':fields,'inverseSha256':inverse})
sourcebytes=sum(len(x)for x in original.values())+sum(len(x)for x in projected.values());depRows=dependency_inventory(R/'app/node_modules');depBytes=sum(x.get('bytes',0)for x in depRows);assetFiles=[p for p in asset.rglob('*')if p.is_file()];assetBytes=sum(p.stat().st_size for p in assetFiles);estimate=sourcebytes+depBytes+assetBytes*2+160_000_000+200_000_000;free=shutil.disk_usage(W).free;assert free-estimate>1_000_000_000,(free,estimate)
(W/'space-plan.json').write_bytes(J({'measuredAt':time.time(),'catalogFiles':len(catalog),'sourcePairBytes':sourcebytes,'dependencyFiles':len(depRows),'dependencyBytes':depBytes,'completeAssetForest':str(asset.relative_to(R)),'assetFiles':len(assetFiles),'assetPairBytes':assetBytes*2,'toolAndEvidenceReserve':360_000_000,'estimatedAdditionalBytes':estimate,'freeBytesBefore':free,'remainingEstimated':free-estimate,'large14GBHistoricalPairNotCopied':True}))
base=W/'pair';base.mkdir(exist_ok=True);(base/'.preparation.lock').touch(mode=0o600,exist_ok=True);data=[]
for role,folder,documents in [('original','original80',original),('candidate','projectedA80',projected)]:
 root=base/folder;root.mkdir(exist_ok=True)
 for path,raw in documents.items():
  p=root/path;p.parent.mkdir(exist_ok=True,parents=True)
  if not p.exists():private_write(p,raw)
  assert h(p.read_bytes())==h(raw);data.append({'role':role,'path':path,'kind':'file','sha256':h(raw),'bytes':len(raw),'category':'source','origin':'current-live-catalog-byte-freeze'if role=='original'else'current-byte-field-projection-rehearsal-not-source-a-proof'})
 for src in assetFiles:
  path=str(src.relative_to(R));raw=src.read_bytes();p=root/path;p.parent.mkdir(exist_ok=True,parents=True)
  if not p.exists():private_write(p,raw)
  data.append({'role':role,'path':path,'kind':'file','sha256':h(raw),'bytes':len(raw),'category':'source','origin':'complete-actual-nonempty-asset-subtree-census'})
 csvpath='curricula/native-namespace-fixture/values.csv';raw='wert;erklaerung\n1;vollständig\n2;Prüfung\n'.encode('utf-16');p=root/csvpath;p.parent.mkdir(exist_ok=True,parents=True)
 if not p.exists():private_write(p,raw)
 data.append({'role':role,'path':csvpath,'kind':'file','sha256':h(raw),'bytes':len(raw),'category':'source','origin':'explicit-nonempty-UTF16-native-mechanics-fixture-not-curricular-content'})
 alias=root/'curricula/native-asset-alias';alias.symlink_to('DE/Gymnasium/visualizations/biologie/8e2244e1-8616-5f24-859f-8e10df1c887b',target_is_directory=True)if not alias.exists()else None
 specdata={'kind':'bounded namespace mechanics source census; not full repository/source-a acceptance','role':role,'catalog':[{ 'path':p,'sha256':h(b),'bytes':len(b)}for p,b in documents.items()],'assetRoot':str(asset.relative_to(R)),'assets':[{ 'path':str(p.relative_to(R)),'sha256':h(p.read_bytes()),'bytes':p.stat().st_size}for p in assetFiles],'csv':{'path':csvpath,'sha256':h(raw),'bytes':len(raw)},'output':'docs/qa-ci/status/namespace-report.json','rules':164};p=root/'namespace-fixture.json';private_write(p,J(specdata))if not p.exists()else None;data.append({'role':role,'path':'namespace-fixture.json','kind':'file','sha256':h(p.read_bytes()),'bytes':p.stat().st_size,'category':'source','origin':'independent-complete-bounded-census'})
 for path in ['app/node_modules','docs/qa-ci/status']:(root/path).mkdir(exist_ok=True,parents=True)
 slot=root/specdata['output'];slot.touch(mode=0o444,exist_ok=True)
# Full real installed tree privately copied once; preserve every internal alias and executable bit.
dep=W/'dependencies';dep.mkdir(exist_ok=True)
for row in depRows:
 p=dep/row['path']
 if row['kind']=='directory':p.mkdir(exist_ok=True,parents=True)
 elif row['kind']=='symlink':
  p.parent.mkdir(exist_ok=True,parents=True)
  if not p.is_symlink():p.symlink_to(row['target'])
 else:
  p.parent.mkdir(exist_ok=True,parents=True)
  if not p.exists():
   raw=(R/'app/node_modules'/row['path']).read_bytes();assert h(raw)==row['sha256'];private_write(p,raw,0o555 if row['executable'] else 0o444)
assert inventory_digest(dependency_inventory(dep))==inventory_digest(depRows)
(W/'capture-inputs.json').write_bytes(J({'kind':'actual bounded capture; not a SourceA/Git snapshot attestation','files':data,'dependencies':depRows,'dependencyTreeSha256':inventory_digest(depRows),'projection':projection,'rules':rules,'sourceProofHistoricalRawSha256':h(pathlib.Path('/dev/shm/skillpilot-identity-qa-80d70f08e0/source-a.json').read_bytes()),'currentMath':h(original['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json']),'currentPowi':h(original['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_POLITIKWIRTSCHAFT.de.json']),'noGitExecuted':True,'fullRepoDiscoveryVerified':False,'currentSourceAVerifierPassed':False}))
print(json.dumps({'privateSourceFiles':len(data),'catalog':len(catalog),'rules':len(rules),'privateDependencyBytes':depBytes,'assetFiles':len(assetFiles),'remainingBytes':shutil.disk_usage(W).free}),flush=True)
