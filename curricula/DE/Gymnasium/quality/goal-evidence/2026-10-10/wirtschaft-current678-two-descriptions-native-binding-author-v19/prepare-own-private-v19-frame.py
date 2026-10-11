import json,pathlib,hashlib,shutil,tempfile,copy,datetime
R=pathlib.Path('/home/enpasos/projects/skillpilot')
Orel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current678-two-descriptions-native-binding-author-v19'
O=R/Orel;O.mkdir(exist_ok=False)
Arel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-two-current678-bounded-development-consumer-descriptions-inert-author-a-v1'
A=R/Arel
ids=['04809186-3f65-579d-b300-af9ed3e100c1','5b5ed3cb-7c2c-5b0f-a515-c967d8d23644']
sha=lambda b:hashlib.sha256(b).hexdigest()
def rd(p):return json.loads((R/p).read_text())
def wr(p,d):q=O/p;q.parent.mkdir(parents=True,exist_ok=True);q.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return Orel+'/'+p
inputs=[]
def freeze(p,name=None):
 q=R/p; b=q.read_bytes();dest=O/'before'/ (name or p);dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(b); x={'path':p,'sha256':sha(b),'bytes':len(b),'frozenPath':str(dest.relative_to(R))};inputs.append(x);return x
active='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
regp='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
bookp='app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
assert sha((R/active).read_bytes())=='6bfa382a2b174a1645d883f746ef42c0693813ec2d447561fca3290ca98a0b09'
before=rd(active);ah=rd(Arel+'/actual-final-current678-two-goals-four-bounded-description-fields.INERT-author-handoff.json');candidate=rd(ah['candidateWholeCAN']['path']);assert sha((R/ah['candidateWholeCAN']['path']).read_bytes())==ah['candidateWholeCAN']['sha256']
bmap={g['id']:g for g in before['goals']}; amap={g['id']:g for g in candidate['goals']}
changed=[]
for gid in bmap:
 if bmap[gid]!=amap[gid]:
  assert gid in ids
  assert {k:v for k,v in bmap[gid].items() if k not in ['description','descriptionEn']}=={k:v for k,v in amap[gid].items() if k not in ['description','descriptionEn']}
  changed.append(gid)
assert set(changed)==set(ids)
reg=rd(regp);econ=next(x for x in reg['subjects'] if x['subject']=='wirtschaftswissenschaften');book=rd(bookp)
sem=rd(econ['semanticKindLedgerPath']);ac=rd(econ['semanticAtomicityConfigPath']);mc=rd(econ['memoryReviewConfigPath']);qa=rd(econ['visualizationQaPath'])
paths=[active,regp,bookp,econ['semanticKindLedgerPath'],econ['semanticAtomicityConfigPath'],econ['memoryReviewConfigPath'],econ['visualizationQaPath'],book['evidenceReviewPaths'][0],ac['reviewPath'],mc['reviewPath'],mc['cardReviewPath'],ah['candidateWholeCAN']['path'],Arel+'/actual-final-current678-two-goals-four-bounded-description-fields.INERT-author-handoff.json']
configs=[]
for cp in econ['positiveEvidenceConfigPaths']:
 c=rd(cp);configs.append({'path':cp,'config':c,'affected':bool(set(ids)&set(c['scope']['goalIds']))});paths.extend([cp,c['reviewPath'],c['reviewCriteriaPath']])
for v in mc['visibilityScopes']:paths.append(v['viewPath'])
for gid in ids:
 for link in bmap[gid].get('resourceLinks',[]):
  if link.get('type')=='goal-visualization':
   paths.append('app/public'+link['url'])
 for rec in qa['records']:
  if rec['goalId']==gid:paths.extend([rec['canonicalAssetPath'],rec['publicAssetPath']])
src=rd(Arel+'/actual-two-goal-selected-whole-source-rows-decisions-unchanged-strengths-and-primary-readings.author-bindings.json')
for row in src['sourceRowsAndDecisions']:paths.extend([row['mappingPath'],row['sourceExtractionPath']])
bep='curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_wirtschaft_current125_source_extraction_to_canonical_wirtschaft.review.json';be=rd(bep);up=be['currentWholeUnionIndex']['path'];paths.append(up)
for p in dict.fromkeys(paths):freeze(p)
cap=pathlib.Path(tempfile.mkdtemp(prefix='economics-v19-two-descriptions-native-'))/'capsule';cap.mkdir()
for folder in ['app/scripts','app/src','contracts']:shutil.copytree(R/folder,cap/folder,symlinks=False)
(cap/'app/node_modules').symlink_to(R/'app/node_modules',target_is_directory=True);shutil.copyfile(R/'app/package.json',cap/'app/package.json')
for p in dict.fromkeys(paths):
 q=cap/p;q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(R/p,q)
q=cap/active;q.write_bytes((R/ah['candidateWholeCAN']['path']).read_bytes())
for srcfile,end,name in [('semanticAtomicityReview.ts','function main()','atomicityV19NativeExports.ts'),('memoryCardReview.ts','function main()','memoryV19NativeExports.ts')]:
 raw=(R/'app/scripts'/srcfile).read_text(); prefix=raw[:raw.index(end)];(cap/'app/scripts'/name).write_text(prefix+'\nexport { fingerprintGoal };\n')
newsem=Orel+'/v19/wirtschaftswissenschaften.semantic-kinds.json';newagg=Orel+'/v19/whole336-original-profiles685-only-two-description-input-bindings.jsonl'
newacp=Orel+'/v19/atomicity/atomicity336-only-two-description.config.json';newmcp=Orel+'/v19/memory/memory336-only-two-description.config.json'
newap=Orel+'/v19/atomicity/atomicity336-only-two-description-FPs.review.jsonl';newmp=Orel+'/v19/memory/memory336-only-two-description-FPs.review.jsonl'
newqap=Orel+'/tentative-V/whole336-only-two-description-bindings-existing-image-approvals-preserved.TENTATIVE.qa.json'
newconfigs=[]
for item in configs:
 c=copy.deepcopy(item['config']);idx=pathlib.Path(item['path']).name;c['semanticKindLedgerPath']=newsem
 if item['affected']:c['reviewPath']=Orel+'/v19/positive/'+idx.split('.')[0]+'.whole-original-profile-only-current-description-bindings.review.jsonl'
 np=wr('v19/configs/'+idx,c);item['newConfigPath']=np;item['newReviewPath']=c['reviewPath'];newconfigs.append(np)
newac=copy.deepcopy(ac);newac['reviewPath']=newap;wr('v19/atomicity/atomicity336-only-two-description.config.json',newac)
newmc=copy.deepcopy(mc);newmc['reviewPath']=newmp;newmc['reportPath']=Orel+'/v19/memory/native-memory-tentative-report.md';wr('v19/memory/memory336-only-two-description.config.json',newmc)
newreg=copy.deepcopy(reg);ne=next(x for x in newreg['subjects'] if x['subject']=='wirtschaftswissenschaften');ne.update(semanticKindLedgerPath=newsem,semanticAtomicityConfigPath=newacp,memoryReviewConfigPath=newmcp,positiveEvidenceConfigPaths=newconfigs);wr('whole-registry.only-four-Economics-path-fields.INERT-v19.json',newreg)
newbook=copy.deepcopy(book);newbook['semanticKindLedgerPath']=newsem;newbook['evidenceReviewPaths']=[newagg];wr('whole-book-config.only-two-current-Economics-path-fields.INERT-v19.json',newbook)
inputdata={'role':'INERT_TARGETED_TECHNICAL_BINDING_AUTHOR_ONLY','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'author':'/root/economics_merge_audit','repoRoot':str(R),'capsuleRoot':str(cap),'outputRoot':str(O),'outputRelative':Orel,'goalIds':ids,'activeCANPath':active,'candidateCAN':ah['candidateWholeCAN'],'descriptionAuthorHandoff':Arel+'/actual-final-current678-two-goals-four-bounded-description-fields.INERT-author-handoff.json','beforeRegistry':regp,'beforeBook':bookp,'oldSEMPath':econ['semanticKindLedgerPath'],'oldAggregatePath':book['evidenceReviewPaths'][0],'oldAtomicityConfig':econ['semanticAtomicityConfigPath'],'oldMemoryConfig':econ['memoryReviewConfigPath'],'oldQAPath':econ['visualizationQaPath'],'oldAtomicityReview':ac['reviewPath'],'oldMemoryReview':mc['reviewPath'],'cardReviewPath':mc['cardReviewPath'],'newSEMPath':newsem,'newAggregatePath':newagg,'newAtomicityReview':newap,'newMemoryReview':newmp,'newTentativeQAPath':newqap,'configs':configs,'allBeforeInputGuards':inputs,'nativeSources':{p:sha((R/p).read_bytes()) for p in ['app/scripts/goalBookModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/semanticAtomicityReview.ts','app/scripts/memoryCardReview.ts']},'sourceBindings':src,'BEMapPath':bep,'BEUnionPath':up,'approvalFromTechnicalPreparation':False,'visualizationCurrentSemanticQualification':'PENDING_ROOT_ACTUAL_SIGHT_KEEP_AFTER_M6','activeWrites':0,'newBookOrImageBuilds':0,'strictGainClaimed':0}
wr('actual-v19-private-candidate-frame-and-all-current-before-bindings.AUTHOR.json',inputdata)
shutil.copytree(O,cap/Orel,dirs_exist_ok=True)
pathlib.Path('/tmp/economics-v19-two-descriptions-output-path.txt').write_text(str(O)+'\n')
print(json.dumps({'output':str(O),'capsule':str(cap),'inputCount':len(inputs),'Pgroups':[pathlib.Path(x['path']).name for x in configs if x['affected']],'activeWrites':0}))
