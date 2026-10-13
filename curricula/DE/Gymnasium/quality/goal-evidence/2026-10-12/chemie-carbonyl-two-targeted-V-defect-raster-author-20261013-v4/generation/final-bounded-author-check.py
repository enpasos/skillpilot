"""Apache-2.0: scoped author checks; no active writes or independent approvals."""
from pathlib import Path
import datetime,hashlib,importlib.util,json,stat,struct,subprocess,zlib
from jsonschema import Draft202012Validator
R=Path.cwd();E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12');O=E/'chemie-carbonyl-two-targeted-V-defect-raster-author-20261013-v4';P=R/'tmp/chemie-carbonyl-two-v-defects-private';assert not (O/'FINAL.two-targeted-author.seal.json').exists()
h=lambda p:'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest();read=lambda p:json.loads(Path(p).read_text());base=read(O/'inputs/before-edit-protected-CAS.actual.json');ids=base['goalIds']
for b in base['protectedActiveFiles']+base['existingAssetCopies']:
 assert h(b['path'])==b['sha256'],b['path'];assert Path(b['path']).stat().st_size==b['bytes'],b['path']
oldsealcounts=[]
for x in base['previousSealedPacketsExact']:
 sf=x['sealBinding'];assert h(sf['path'])==sf['sha256'];j=read(sf['path'])
 for b in j['fileBindings']:assert h(b['path'])==b['sha256'] and Path(b['path']).stat().st_size==b['bytes'],b['path']
 oldsealcounts.append(dict(path=sf['path'],sha256=sf['sha256'],fileBindings=len(j['fileBindings'])))
keep=base['keptIndependentPass'];assert h(keep['assetBinding']['path'])==keep['assetBinding']['sha256'];assert h(keep['freshVSealBinding']['path'])==keep['freshVSealBinding']['sha256'];assert h(keep['firstFrozenBinding']['path'])==keep['firstFrozenBinding']['sha256']
canrel=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');old=E/'chemie-carbonyl-three-necessary-raster-author-20261013-v2';current=read(canrel);candidate=read(O/'visual-candidate'/canrel);previous=read(old/'visual-candidate'/canrel);assert candidate==previous;assert h(O/'visual-candidate'/canrel)==h(old/'visual-candidate'/canrel)==h(P/canrel)
curby={g['id']:g for g in current['goals']};cb={g['id']:g for g in candidate['goals']};assert len(curby)==len(cb)==523;changed=[i for i in curby if curby[i]!=cb[i]];assert set(changed)==set(ids+[keep['goalId']]);assert all(curby[i]==cb[i]for i in curby if i not in changed)
assert {k:v for k,v in current.items()if k!='goals'}=={k:v for k,v in candidate.items()if k!='goals'}
for i in changed:assert {k:v for k,v in curby[i].items()if k!='resourceLinks'}=={k:v for k,v in cb[i].items()if k!='resourceLinks'}
schema=read('docs/landscape-runtime.schema.json');validator=Draft202012Validator({'$schema':schema['$schema'],'$ref':'#/$defs/goal','$defs':schema['$defs']})
for i in ids:assert not list(validator.iter_errors(cb[i])),i
normal=read(O/'checks/normal-two-imports-and-P-input-probe.actual.json');assert normal['candidateLandscapeSHA']==h(O/'visual-candidate'/canrel);assert all(c['exitCode']==0 for c in normal['commands']);assert len(normal['P2InputOnlyChangedRecords'])==2
rows=lambda p:[json.loads(s)for s in Path(p).read_text().splitlines()if s.strip()];before=rows(O/'P-probe/P2.before.normal.jsonl');after=rows(O/'P-probe/P2.after.normal.jsonl');assert len(before)==len(after)==2
for b,a in zip(before,after):
 assert b['goalId']==a['goalId'];assert b['goalFingerprint']==a['goalFingerprint'];assert b['profileFingerprint']==a['profileFingerprint'];assert b['profile']==a['profile'];assert b['reviewInputFingerprint']!=a['reviewInputFingerprint'];assert a['status']=='needs_human_review'and a['reviewAuthority']=='ai_candidate'and a['evidenceLevel']=='E1'and a['maximumClaimScope']=='G1'
profiles=read(O/'inputs/whole15.profile-payloads.author.json');selprofiles=read(O/'inputs/selected-two-retained-profile-payloads.author.json');assert selprofiles['profiles']==[x for x in profiles['profiles']if x['goalId']in ids]
cases=read(O/'inputs/whole30.expanded-cases.author.json');selcases=read(O/'inputs/selected-four-retained-whole-cases.author.json');assert selcases['cases']==[x for x in cases['cases']if x['goalId']in ids];assert len(selcases['cases'])==4
originalauthor=E/'chemie-carbonyl-pharmacy15-current231-scientific-author-20261013-v1';assert profiles==read(originalauthor/'author/whole15.profile-payloads.author.json');assert cases==read(originalauthor/'author/whole30.expanded-cases.author.json')
capsule=read(O/'checks/private-normal-small-capsule.actual.json')
for b in capsule['normalScriptsAndInputs']:assert h(b['path'])==h(P/b['path'])==b['sourceSHA'],b['path']
for x in normal['privateMutableParentChains']:
 p=P/x['path'];s=p.lstat();assert stat.S_ISDIR(s.st_mode)and not stat.S_ISLNK(s.st_mode)and s.st_ino==x['inode']
assert (P/'app/node_modules').is_symlink()and (P/'app/node_modules').resolve()==(R/'app/node_modules').resolve()
mem=read(old/'checks/actual-current-M-cards-and-visibility-retained.json')
for b in mem['oldAuthorBindingsRetained']:assert h(b['path'])==b['sha256']
for b in mem['allCurrentChemistryDeckSourcePublicChecks']:
 assert h(b['sourcePath'])==h(b['publicPath'])==b['sha256'];committed=subprocess.run(['git','show','HEAD:'+b['sourcePath']],check=True,capture_output=True).stdout;assert 'sha256:'+hashlib.sha256(committed).hexdigest()==b['sha256']
def pngcheck(p):
 data=Path(p).read_bytes();assert data[:8]==b'\x89PNG\r\n\x1a\n';off=8;types=[]
 while off<len(data):
  n=struct.unpack('>I',data[off:off+4])[0];kind=data[off+4:off+8];body=data[off+8:off+8+n];assert zlib.crc32(kind+body)&0xffffffff==struct.unpack('>I',data[off+8+n:off+12+n])[0];types.append(kind.decode());off+=n+12
 assert off==len(data)and types[-1]=='IEND'and 'caBX'in types
 return dict(path=str(p),sha256=h(p),bytes=len(data),pngCrcsValid=True,C2PAContainerPresent=True)
attempts=[]
for f in sorted((O/'generation').glob('*.tool-lineage.actual.json')):
 for x in read(f)['records']:
  assert h(x['generatedFile'])==h(x['retainedArtifact'])==x['sha256'];attempts.append(dict(goalId=x['goalId'],attempt=x['attempt'],**pngcheck(x['retainedArtifact'])))
assert len(attempts)==9;assert len({(x['goalId'],x['attempt'])for x in attempts})==9
assets=[]
for i in ids:
 src=O/'candidate'/(i+'.png');t=read(O/'generation'/(i+'.final-technical.json'));assert h(src)==t['sha256'];assert t['width']==1672 and t['height']==941
 for prefix in ['curricula/DE/Gymnasium/visualizations','app/public/assets/goal-visualizations','backend/src/main/resources/static/assets/goal-visualizations']:
  rel=Path(prefix)/'chemie'/i/(i+'.png');assert h(O/'visual-candidate'/rel)==h(P/rel)==h(src);assert (P/rel).stat().st_nlink==1
 for d in t['viewDerivatives']:assert h(d['path'])==d['sha256']and d['heightLimitCss']==448
 assert {d['widthLimitCss']for d in t['viewDerivatives']}=={316,360,680};assets.append(dict(goalId=i,**pngcheck(src)))
for x in base['editTargetPNGs']:assert h(x['sourceBinding']['path'])==h(x['retainedBinding']['path'])==x['sourceBinding']['sha256']
jsoncount=jsonlcount=jsonlrows=0
for p in O.rglob('*'):
 assert not p.is_symlink(),p
 if not p.is_file():continue
 if p.suffix=='.json':read(p);jsoncount+=1
 if p.suffix=='.jsonl':jsonlcount+=1;jsonlrows+=len(rows(p))
spec=importlib.util.spec_from_file_location('normal_committable_guard',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);links=mod.curriculum_symlink_errors(R);assert not links,links
out=dict(schemaVersion=1,recordedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),kind='Final bounded two-raster author checks; no independent vote',goalIds=ids,baseCurrentCanonicalSHA=h(canrel),candidateCanonicalSHA=h(O/'visual-candidate'/canrel),wholeNodes=523,currentParentStrictBaselineProtected=231,candidateWhole523ExactPreviousV2=True,allOther520CurrentWholeGoalsExact=True,targetNonVisualizationFieldsExact=True,unchanged3dePassAssetExact=True,all397ActiveImagesAnd1191SourcePublicBackendCopiesExact=True,activeContextBindingsExact=8,oldSealedPacketFileCounts=oldsealcounts,currentMemoryVisibilityBindingsExact=18,currentDeckSourcePublicPairsAndCommittedSourceExact=6,normalPrivateImportsPassed=2,normalPrivatePreparationPassed=2,normalPBeforeAfterWriteAndNoWriteVerificationPassed=4,only2PReviewInputsChanged=True,all2PGoalsAndProfileFingerprintsExact=True,retainedFourCasesAndAllDemandRubricsExact=True,normalCapsuleSourceFilesByteExact=len(capsule['normalScriptsAndInputs']),privateMutableParentsRealAndLeavesSingleLink=True,readonlyNodeModulesDependencyOutsideCurricula=True,all9GeneratedAttemptPNGsByteExact=attempts,finalAssetPNGBindings=assets,scopedRuntimeGoalSchemaPassed=2,parseCounts=dict(jsonFiles=jsoncount,jsonlFiles=jsonlcount,jsonlRows=jsonlrows),committableCurriculumSymlinkErrors=links,noOwnPacketSymlinks=True,actualAuthorNativeMobileFullInspectionBinding=dict(path=str(O/'checks/actual-full-author-inspection-and-disclosed-geometry.json'),sha256=h(O/'checks/actual-full-author-inspection-and-disclosed-geometry.json')),originalAdvertisedAndFailedSourceBytesRetained=True,independentVotes=0,strictScientificCompletions=0,humanApproval=False,learnerLabOrClinicalExecutionEvidence=False,activeWrites=False,gitWrites=False,fullBuildOrNativeCampaignRun=False)
(O/'checks/FINAL.bounded-two-assets-P-parse-CAS-schema-links.actual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(dict(assets=assets,normalPInputChanges=2,previousSealsExact=True,protectedCopies=1191,scopedGoalSchema=2,parseCounts=out['parseCounts'],symlinkErrors=links,newScience=0),indent=2))
