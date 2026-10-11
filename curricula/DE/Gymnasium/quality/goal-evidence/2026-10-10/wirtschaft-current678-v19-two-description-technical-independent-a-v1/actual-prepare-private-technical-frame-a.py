from pathlib import Path
import json,hashlib,copy,shutil,tempfile,subprocess
R=Path('/home/enpasos/projects/skillpilot');A=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current678-two-descriptions-native-binding-author-v19';O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current678-v19-two-description-technical-independent-a-v1';assert not O.exists();O.mkdir()
H=A/'actual-final-v19-two-description-sem-P-AM-tentativeV-native-technical-author.handoff.json';ha=json.loads(H.read_text());inp=json.loads((A/'actual-v19-private-candidate-frame-and-all-current-before-bindings.AUTHOR.json').read_text());IDS=set(inp['goalIds'])
def sha(b):return hashlib.sha256(b).hexdigest()
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':p.relative_to(R).as_posix() if p.is_relative_to(R) else str(p),'sha256':sha(b),'bytes':len(b)}
def wr(name,data):
 p=O/name;p.parent.mkdir(exist_ok=True,parents=True);assert not p.exists();p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');return bind(p)
def rd(path):return json.loads((R/path).read_text())
def lines(path):return [json.loads(x)for x in (R/path).read_text().splitlines()if x.strip()]
def diff(a,b,p=''):
 if type(a)!=type(b):return [{'path':p,'before':a,'after':b}]
 if isinstance(a,dict):
  out=[]
  for k in sorted(set(a)|set(b)):
   if k not in a or k not in b:out.append({'path':p+'/'+k,'before':a.get(k),'after':b.get(k)})
   else:out+=diff(a[k],b[k],p+'/'+k)
  return out
 if isinstance(a,list):
  if len(a)!=len(b):return [{'path':p,'before':a,'after':b}]
  return [d for i,(x,y)in enumerate(zip(a,b))for d in diff(x,y,p+'/'+str(i))]
 return []if a==b else [{'path':p,'before':a,'after':b}]
assert bind(H)['sha256']=='2b36edb6ed2127ba576eb1868a7f7c628ab9ef3f98a8e53cce74a77f27f692b7'
manifest=json.loads((A/'actual-frozen-v19-whole-inputs-native-command-and-field-only-output-artifact-manifest.json').read_text());authBindings=[]
for b in manifest['files']:
 p=R/b['path'];now=bind(p);assert now['sha256']==b['sha256'].removeprefix('sha256:') and now['bytes']==b['bytes'];authBindings.append(now)
activeRegPath=inp['beforeRegistry'];reg=rd(activeRegPath);oldreg=rd(str((A/'before'/activeRegPath).relative_to(R)));candidateReg=rd(str((A/'whole-registry.only-four-Economics-path-fields.INERT-v19.json').relative_to(R)));e=next(x for x in reg['subjects']if x['subject']=='wirtschaftswissenschaften');ne=next(x for x in candidateReg['subjects']if x['subject']=='wirtschaftswissenschaften');assert e==next(x for x in oldreg['subjects']if x['subject']=='wirtschaftswissenschaften')
currentSubjects={s['subject']:s for s in reg['subjects']};authorSubjects={s['subject']:s for s in candidateReg['subjects']};foreignDiff=[k for k in currentSubjects if k!='wirtschaftswissenschaften' and currentSubjects[k]!=authorSubjects[k]];assert set(foreignDiff)=={'chemie','biologie'}
assert set(k for k in e if e[k]!=ne[k])=={'semanticKindLedgerPath','semanticAtomicityConfigPath','memoryReviewConfigPath','positiveEvidenceConfigPaths'}
rebasedReg=copy.deepcopy(reg);next(x for x in rebasedReg['subjects']if x['subject']=='wirtschaftswissenschaften').update({k:ne[k]for k in ['semanticKindLedgerPath','semanticAtomicityConfigPath','memoryReviewConfigPath','positiveEvidenceConfigPaths']});assert all(x==next(y for y in reg['subjects']if y['subject']==x['subject'])for x in rebasedReg['subjects']if x['subject']!='wirtschaftswissenschaften')
# The private rebased registry is diagnostic only. No live Registry write.
activeCan=rd(inp['activeCANPath']);candidateCan=rd(ha['wholeCandidateCAN']['path']);assert bind(R/inp['activeCANPath'])['sha256']=='6bfa382a2b174a1645d883f746ef42c0693813ec2d447561fca3290ca98a0b09';goals={g['id']:g for g in activeCan['goals']};cgoals={g['id']:g for g in candidateCan['goals']};candel=diff(activeCan,candidateCan);assert len(candel)==4 and all(d['path'].endswith(('/description','/descriptionEn'))for d in candel);assert all(g==cgoals[gid]for gid,g in goals.items()if gid not in IDS)
oldSem=rd(inp['oldSEMPath']);newSem=rd(inp['newSEMPath']);sd=diff(oldSem,newSem);assert len(sd)==2 and all(d['path'].endswith('/sourceFingerprint')for d in sd)
oldP=lines(inp['oldAggregatePath']);newP=lines(inp['newAggregatePath']);pd=diff(oldP,newP);assert len(pd)==4 and all(d['path'].endswith(('/goalFingerprint','/reviewInputFingerprint'))for d in pd);assert len(oldP)==len(newP)==336;assert sum(len(x['profile']['applicationCaseBriefs'])for x in newP)==685
for x,y in zip(oldP,newP):assert {k:v for k,v in x.items()if k not in ['goalFingerprint','reviewInputFingerprint']}=={k:v for k,v in y.items()if k not in ['goalFingerprint','reviewInputFingerprint']}
ams=[]
for lane,oldpath,newpath in [('A',inp['oldAtomicityReview'],inp['newAtomicityReview']),('M',inp['oldMemoryReview'],inp['newMemoryReview'])]:
 old=lines(oldpath);new=lines(newpath);delta=diff(old,new);assert len(old)==len(new)==336 and len(delta)==2 and all(d['path'].endswith('/fingerprint')for d in delta);oldRaw=(R/oldpath).read_text().splitlines(keepends=True);newRaw=(R/newpath).read_text().splitlines(keepends=True);assert all(x==y for x,y in zip(oldRaw,newRaw)if json.loads(x)['goalId']not in IDS);ams.append({'lane':lane,'deltas':delta,'other334RawLinesExact':True})
oldRaw=(R/inp['oldAggregatePath']).read_text().splitlines(keepends=True);newRaw=(R/inp['newAggregatePath']).read_text().splitlines(keepends=True);assert all(x==y for x,y in zip(oldRaw,newRaw)if json.loads(x)['goalId']not in IDS)
configDeltas=[];changedReviewFiles=[];scopeIDs=[];currentInputs=set([H,R/activeRegPath,R/inp['activeCANPath'],R/inp['oldSEMPath'],R/inp['beforeBook'],R/inp['oldAtomicityConfig'],R/inp['oldMemoryConfig'],R/inp['oldQAPath'],R/inp['oldAggregatePath'],R/inp['oldAtomicityReview'],R/inp['oldMemoryReview'],R/inp['cardReviewPath']])
for oldpath,newpath in zip(e['positiveEvidenceConfigPaths'],ne['positiveEvidenceConfigPaths']):
 oc=rd(oldpath);nc=rd(newpath);delta=diff(oc,nc);keys={d['path']for d in delta};affected=bool(IDS&set(oc['scope']['goalIds']));assert keys==({'/semanticKindLedgerPath','/reviewPath'}if affected else {'/semanticKindLedgerPath'});assert nc['semanticKindLedgerPath']==inp['newSEMPath'];currentInputs|={R/oldpath,R/oc['reviewPath'],R/oc['reviewCriteriaPath']};configDeltas.append({'configNumber':Path(newpath).name,'oldConfig':bind(R/oldpath),'newConfig':bind(R/newpath),'deltas':delta,'wholeOldReview':bind(R/oc['reviewPath']),'wholeNewReview':bind(R/nc['reviewPath']),'affected':affected})
 if affected:
  dr=diff(lines(oc['reviewPath']),lines(nc['reviewPath']));assert len(dr)==2 and all(d['path'].endswith(('/goalFingerprint','/reviewInputFingerprint'))for d in dr);scopeIDs+=oc['scope']['goalIds'];changedReviewFiles.append(newpath)
 else:assert (R/oc['reviewPath']).read_bytes()==(R/nc['reviewPath']).read_bytes()
assert len(configDeltas)==43 and len(changedReviewFiles)==2 and len(scopeIDs)==28
mc=rd(inp['oldMemoryConfig']);mnc=rd(ne['memoryReviewConfigPath']);ac=rd(inp['oldAtomicityConfig']);anc=rd(ne['semanticAtomicityConfigPath']);assert {d['path']for d in diff(mc,mnc)}=={'/reviewPath','/reportPath'};assert {d['path']for d in diff(ac,anc)}=={'/reviewPath'};assert mc['cardReviewPath']==mnc['cardReviewPath'];cards=lines(mc['cardReviewPath']);assert len(cards)==66
for v in mc['visibilityScopes']:currentInputs.add(R/v['viewPath'])
oldQa=rd(inp['oldQAPath']);newQa=rd(inp['newTentativeQAPath']);qd=diff(oldQa,newQa);assert len(qd)==2 and all(d['path'].endswith('/description')for d in qd)
qaByID={q['goalId']:q for q in oldQa['records']};assets=[]
for gid in scopeIDs:
 g=goals[gid];link=[l for l in g.get('resourceLinks',[])if l.get('type')=='goal-visualization'];assert len(link)==1;q=qaByID[gid];ap=R/q['publicAssetPath'];bp=R/q['canonicalAssetPath'];assert ap.read_bytes()==bp.read_bytes();assert bind(ap)['sha256']==q['assetSha256'].removeprefix('sha256:');assert q['goalId']==gid;currentInputs|={ap,bp};assets.append({'goalId':gid,'appAsset':bind(ap),'backendAsset':bind(bp),'wholeBytesMatch':True,'isDescriptionTarget':gid in IDS,'noSightReviewByTechnicalReviewer':True})
assert len(assets)==28 and sum(x['isDescriptionTarget']for x in assets)==2
memgoals=[g for g in activeCan['goals']if any(t.startswith('srs-deck:')for t in g.get('tags',[]))];assert len(memgoals)==10;decks=[]
for g in memgoals:
 assert g==cgoals[g['id']];url=g['extendedData']['vocabularySource'];p=R/'app/public'/url.lstrip('/');assert p.is_file();currentInputs.add(p);decks.append({'goalId':g['id'],'deck':bind(p),'wholeCanonicalMemoryGoalUnchanged':True})
book=rd(inp['beforeBook']);newBook=rd(str((A/'whole-book-config.only-two-current-Economics-path-fields.INERT-v19.json').relative_to(R)));bd=diff(book,newBook);assert {x['path']for x in bd}=={'/semanticKindLedgerPath','/evidenceReviewPaths/0'}
sourceFiles=['app/scripts/goalBookModel.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/semanticAtomicityReview.ts','app/scripts/memoryCardReview.ts'];currentInputs|={R/p for p in sourceFiles};currentInputs|={R/inp['BEMapPath'],R/inp['BEUnionPath']};start=[bind(p)for p in sorted(currentInputs)]
CAP=Path(tempfile.mkdtemp(prefix='economics-v19-technical-independent-a-'))/'capsule';CAP.mkdir()
def safeCopy(src,path):
 dst=CAP/path;dst.parent.mkdir(parents=True,exist_ok=True);assert dst.resolve().is_relative_to(CAP.resolve());assert not dst.is_symlink();assert not dst.exists()or not dst.samefile(src);shutil.copyfile(src,dst);assert dst.read_bytes()==src.read_bytes()
for folder in ['app/scripts','app/src','contracts']:shutil.copytree(R/folder,CAP/folder,symlinks=False)
(CAP/'app/node_modules').symlink_to(R/'app/node_modules',target_is_directory=True);safeCopy(R/'app/package.json','app/package.json')
for b in start:safeCopy(R/b['path'],b['path'])
for b in authBindings:
 # Author artifact copy only; the frozen older registry is not a current active registry.
 safeCopy(R/b['path'],b['path'])
safeCopy(R/ha['wholeCandidateCAN']['path'],inp['activeCANPath'])
(CAP/activeRegPath).write_text(json.dumps(rebasedReg,ensure_ascii=False,indent=2)+'\n')
exports=[]
for original,generated in [('semanticAtomicityReview.ts','independentV19AtomicityFingerprint.ts'),('memoryCardReview.ts','independentV19MemoryFingerprint.ts')]:
 src=(R/'app/scripts'/original).read_text();prefix=src[:src.index('function main()')];dst=CAP/'app/scripts'/generated;assert dst.resolve().is_relative_to(CAP.resolve());dst.write_text(prefix+'\nexport { fingerprintGoal };\n');exports.append({'productionSource':bind(R/'app/scripts'/original),'actualWholeProductionPrefixSHA256':sha(prefix.encode()),'privateSource':bind(dst),'onlyAddedExport':'fingerprintGoal; no body change'})
nativeInput={'privateRoot':str(CAP),'goalIds':sorted(IDS),'activeCanPath':inp['activeCANPath'],'originalWholeCAN':bind(R/inp['activeCANPath']),'candidateCAN':ha['wholeCandidateCAN'],'oldSEMPath':inp['oldSEMPath'],'newSEMPath':inp['newSEMPath'],'oldAggregatePath':inp['oldAggregatePath'],'newAggregatePath':inp['newAggregatePath'],'oldA':inp['oldAtomicityReview'],'newA':inp['newAtomicityReview'],'oldM':inp['oldMemoryReview'],'newM':inp['newMemoryReview'],'targetedPositiveConfigs':changedReviewFiles}
wr('actual-private-native-target-input.json',nativeInput)
wr('actual-static-v19-whole-payload-deltas-current-merged-registry-bound.json',{'role':'TECHNICAL_ONLY_NO_TEXT_SCIENCE','postMergeHEAD':subprocess.run(['git','rev-parse','HEAD'],cwd=R,check=True,stdout=subprocess.PIPE,text=True).stdout.strip(),'descriptionCandidateFourStringDeltasExistingIndependentScienceRequired':candel,'SEM2FPDeltas':sd,'P4FPDeltasWhole336685Exact':pd,'atomicityMemoryOnlyTwoFPEach':ams,'43ConfigPointerDeltasOther41ReviewFilesExact':configDeltas,'atomicityConfigDeltas':diff(ac,anc),'memoryConfigDeltas':diff(mc,mnc),'cardReview66':bind(R/mc['cardReviewPath']),'tenDeckBindings':decks,'QAOnlyTwoDescriptionsExistingAllApprovalAssetFieldsExact':qd,'28WholeMirroredAssets':assets,'mergedForeignRegistryDifferentFromOlderAuthorCandidate':foreignDiff,'fullOlderRegistryCopyUnsafe':True,'fourEconomicFieldsOnlyQualifiedForFieldwiseIntegration':list(k for k in e if e[k]!=ne[k]),'otherFourCurrentSubjectObjectsPreservedInPrivateFrame':True,'bookOnlyTwoPointers':bd,'authorManifest288FilesIndependentlyHashVerified':len(authBindings),'noActiveChanges':True,'newHumanOrTextScienceOrVisualizationApprovals':0})
wr('actual-private-frame-and-current-input-freeze.json',{'privateCapsule':str(CAP),'resolveAndSamefileGuardsForEveryPhysicalCopy':True,'trustedReadOnlyDependencySymlink':'app/node_modules only','actualCurrentInputBindings':start,'authorArtifacts':authBindings,'actualFPSourceExports':exports,'textAuthorExcludedFromScienceReview':True})
Path('/tmp/economics-v19-independent-a-frame-path.txt').write_text(str(CAP)+'\n');Path('/tmp/economics-v19-independent-a-output-path.txt').write_text(str(O)+'\n')
(O/'actual-prepare-private-technical-frame-a.py').write_bytes(Path(__file__).read_bytes());print(json.dumps({'privateCapsule':str(CAP),'output':str(O),'actualCurrentInputs':len(start),'authorManifestFiles':len(authBindings),'targetPgroups':[Path(x).name for x in changedReviewFiles],'foreignRegistryStale':['chemie','biologie'],'noActiveWrites':True}))
