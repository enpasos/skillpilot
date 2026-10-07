from pathlib import Path
import json,hashlib,os,shutil,tempfile,datetime
root=Path.cwd().resolve()
base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
own=base+'chemie-current-eight-native-positive-independent-b-v3'
author=base+'chemie-current-fifteen-final-native-review-inputs-author-v3'
v2=base+'chemie-current-atomic-description-positive-gap-author-v2'
v1=base+'chemie-current-fifteen-native-positive-independent-b-v1'
read=lambda p:json.loads((root/p).read_text())
sha=lambda p:hashlib.sha256((root/p).read_bytes()).hexdigest()
bind=lambda p:{'path':p,'sha256':'sha256:'+sha(p),'bytes':(root/p).stat().st_size}
write=lambda p,x:(root/own/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
content=read(own+'/content-v2-source-stage.independent-b.final.freeze.json')
for row in content['outputs']:assert sha(row['path'])==row['sha256'],row['path']
assert sha(own+'/content-v2-source-stage.independent-b.final.freeze.json')=='4982308f6ce41b354d448fe22c56eac64ba5b534617572ce63fe915e3a577fcd'
allowed={};excluded=[]
for name,digest in [('native-p-stage-author-v3.final.freeze.json','2cb684d706c8ee2d8c3e3cb7008c03d04d832dd184d184f848751d669d8ea129'),('final-native-review-inputs-author-v3.final.freeze.json','0934478e45d8ebd9851227e952d912f8ab1d92221708d984b8e0b0de3a6236b0')]:
 p=author+'/'+name;assert sha(p)==digest
 for row in read(p)['files']:
  if '/round-a/' in row['path']:excluded.append(row['path']);continue
  assert bind(row['path'])==row,row['path'];allowed[row['path']]=row
scope=read(own+'/positive.eight.independent-b.specifications.json')['goals'];ids=[s['goalId'] for s in scope]
can=read(author+'/prospective-current378.canonical.author-candidate.json');can2=read(v2+'/prospective-current378.canonical.author-candidate.json');assert can==can2
spec=read(author+'/fifteen-positive-profile-specifications.exact-v2.json');assert spec==read(v2+'/fifteen-positive-profile-specifications.author-corrections.candidate.json')
material=read(author+'/thirty-complete-materials.de-en.exact-v2.json');assert material==read(v2+'/thirty-complete-materials.de-en.author-corrections.candidate.json')
subset=read(author+'/sixteen-complete-targeted-materials.de-en.exact-v2.json')['materials'];assert len(subset)==16;assert subset==[m for m in material['materials'] if m['goalId'] in ids]
for s in scope:assert s['profile']==next(a['profile'] for a in spec['goals'] if a['goalId']==s['goalId'])
oldcfg=read(v1+'/positive.fifteen.independent-b.config.json');oldfreeze=read(v1+'/native-positive-fifteen.independent-b.final.freeze.json')
for p in [oldcfg['landscapePath'],oldcfg['semanticKindLedgerPath'],oldcfg['reviewPath']]:
 old=next(x for x in oldfreeze['inputs']+oldfreeze['outputs'] if x['path']==p);assert sha(p)==old['sha256']
oldcan=read(oldcfg['landscapePath']);oldgoals={g['id']:g for g in oldcan['goals']};newgoals={g['id']:g for g in can['goals']}
oldrecords=[json.loads(x) for x in (root/oldcfg['reviewPath']).read_text().splitlines() if x.strip()];oldmap={r['goalId']:r for r in oldrecords}
common=[s['goalId'] for s in spec['goals'] if s['goalId'] not in ids];assert len(common)==7
oldmaterials=read(base+'chemie-current-atomic-description-positive-gap-author-v1/thirty-complete-materials.de-en.author-candidates.json')['materials']
commonrows=[]
for gid in common:
 assert newgoals[gid]==oldgoals[gid];assert oldmap[gid]['reason'].startswith('KEEP:')
 assert next(s['profile'] for s in spec['goals'] if s['goalId']==gid)==oldmap[gid]['profile']
 cases=[m for m in material['materials'] if m['goalId']==gid];assert len(cases)==2
 for c in cases:assert c==next(m for m in oldmaterials if m['caseId']==c['caseId'])
 commonrows.append({'goalId':gid,'wholeGoalExact':True,'wholeProfileExact':True,'twoWholeMaterialsExact':True,'existingOwnRecordUntouched':True})
iso=Path(tempfile.mkdtemp(prefix='skillpilot-chem-eight-p-b-v3-'));(iso/'app/scripts').mkdir(parents=True)
for p in ['curricula','contracts','docs','app/src','app/node_modules']:
 dst=iso/p;dst.parent.mkdir(parents=True,exist_ok=True);dst.symlink_to(os.path.relpath(root/p,dst.parent),target_is_directory=True)
shutil.copyfile(root/'app/package.json',iso/'app/package.json')
helpers=['materializePositiveGoalEvidenceCandidates.ts','positiveGoalEvidenceReview.ts','positiveGoalEvidenceProfileModel.ts','goalEvidenceProfileModel.ts','goalBookModel.ts'];helperrows=[]
freeze=read(author+'/final-native-review-inputs-author-v3.final.freeze.json');external={r['path']:r for r in freeze['externalBindings']}
for name in helpers:
 p='app/scripts/'+name;dst=iso/p;shutil.copyfile(root/p,dst);assert hashlib.sha256(dst.read_bytes()).hexdigest()==sha(p)
 if p in external:assert bind(p)==external[p],p
 helperrows.append(bind(p))
rasters=[];sources={r['goalId']:r for r in read(author+'/temporary-native-isolation.actual-receipt.json')['physicalSelectedReviewRasterCopies']}
# Physical review assets only; no linked author native filesystem and no writes to app/public.
for gid in [s['goalId'] for s in spec['goals']]:
 for link in newgoals[gid].get('resourceLinks',[]):
  if link['type']!='goal-visualization':continue
  rel='app/public'+link['url'];source=sources[gid]['source']['path'] if gid in sources else rel
  if gid in sources:assert bind(source)==sources[gid]['source']
  dst=iso/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/source,dst);assert hashlib.sha256(dst.read_bytes()).hexdigest()==sha(source)
  rasters.append({'goalId':gid,'resourceURL':link['url'],'nativeRelativePath':rel,'source':bind(source),'nativeCopySha256':'sha256:'+hashlib.sha256(dst.read_bytes()).hexdigest(),'nativeCopyBytes':dst.stat().st_size})
config=read(author+'/positive-evidence.eight.targeted.native-author-candidates.config.json');config.update(reviewId=own.split('/')[-1],reviewPath=own+'/results/independent-b.batch-001.records.jsonl',reviewRunManifestPaths=[own+'/results/independent-b.batch-001.run.json']);config['scope']['label']='Independent B actual eight whole-profile/16 whole-material KEEP; current isolated native operative bindings; separate 363 visual/D hold retained'
(root/own/'results').mkdir(exist_ok=True)
write('positive.eight.independent-b.current-native-v3.config.json',config)
write('actual-v3-input-payload-reuse-and-native-isolation.independent-b.json',{'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Independent actual native input transport/binding; science content already immutable independently read v2','scopeGoalIds':ids,'v3WholeCanonicalExactReviewedV2':True,'v3Whole15SpecificationsExactReviewedV2':True,'v3Whole30MaterialsExactReviewedV2':True,'freshEightWholeProfilesExactOwnReviewedV2':True,'actual16NativeMaterialsExactOwnReviewedV2':True,'sevenPriorWholeGoalProfileAnd14MaterialKEEPReuse':commonrows,'allowedAuthorArtifactsActualByteVerified':list(allowed.values()),'excludedUnreadRoundAInputPaths':sorted(set(excluded)),'peerANewDOrPResultsRead':False,'temporaryNativeRoot':str(iso),'temporaryRootOutsideRepository':True,'nativePureHelpersByteIdenticalCurrent':helperrows,'physicalNativeAssets':rasters,'readOnlyRelativeLinks':['curricula','contracts','docs','app/src','app/node_modules'],'oldImmutableContentFreeze':bind(own+'/content-v2-source-stage.independent-b.final.freeze.json'),'current363VisualScienceHoldRetained':True,'current363VisualHoldNotJudgedOrOverruledByPaperPKeep':True,'activeWrites':False,'GitOperations':False,'humanApproval':False,'humanTrial':False,'strictNetGain':0})
print(json.dumps({'temporaryNativeRoot':str(iso),'authorAllowedBindings':len(allowed),'roundAUnread':len(set(excluded)),'exactReviewedV2Profiles':8,'exactReviewedV2Materials':16,'commonExactReuse':7,'physicalAssetCopies':len(rasters)}))
