#!/usr/bin/env python3
# Apache-2.0. Technical serialization only; scientific decisions are already sealed.
import copy,hashlib,json
from pathlib import Path
R=Path(__file__).resolve().parents[7];O=Path(__file__).resolve().parent;B=O.parent
if list(O.glob('SEAL.*')):raise RuntimeError('This evidence package is sealed; do not overwrite it. Create an additive successor instead.')
S=B/'chemie-current454-targeted-AM-components-independent-a-20261018-v1'
def read(p):return json.loads(p.read_text())
def pin(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def rel(p):return str(p.relative_to(R))
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');assert read(p)==x
def line(x):return json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n'
def records(p):
 return [(i+1,json.loads(s),s) for i,s in enumerate(p.read_text().splitlines(keepends=True)) if s.strip()]
prod=read(O/'INPUTS.stock-production-functions-fingerprints-and-owner-scopes.json');selected=prod['selectedCandidateState'];candidate=read(R/selected['landscapePath']);cby={g['id']:g for g in candidate['goals']}
sciencepath=S/'FIRST.targeted33-whole-atom-AM-component-judgments.json';science=read(sciencepath);sciencepin=pin(sciencepath);sealpath=S/'SEAL.informed-targeted42-AM-components-independent-A.json';scientificseal=read(sealpath)
assert science['ordinaryAtoms']==33 and science['result']=='ACCEPT_SCOPED_A_AND_M_NECESSITY_COMPONENTS'
oldinputs=read(S/'INPUTS.whole42-goals-current-AM-and-whole-P.json');oldby={r['goalId']:r for r in oldinputs['records']}
target={r['goalId']:r for r in science['records']};fps={r['goalId']:r for r in prod['candidateOrdinaryFingerprints']};assert len(target)==33 and len(fps)==454
registryPath=R/prod['registryPath'];registry=read(registryPath);si=next(i for i,s in enumerate(registry['subjects'])if s['subject']=='chemie');subject=registry['subjects'][si]
oldCanonicalPath=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';normal=read(oldCanonicalPath);nby={g['id']:g for g in normal['goals']};normalPath=rel(oldCanonicalPath)
for gid,t in target.items():
 before=oldby[gid]['wholeCandidateGoal'];after=cby[gid]
 assert {k:v for k,v in before.items()if k!='resourceLinks'}=={k:v for k,v in after.items()if k!='resourceLinks'},gid
 # Actual full P unchanged from own scientific input, including the11P-only changes.
pp={r['goalId']:r['profile']for _,r,_ in records(R/selected['wholePositiveProfileBodiesPath'])}
for gid in target:assert pp[gid]==oldby[gid]['wholeCandidateP']['wholeObject']['profile'],gid
nativeAt=scientificseal['sealedAt'];reviewer='Technical serialization of sealed informed A/M component judgments by agent A; no new scientific vote'
paths={registryPath,oldCanonicalPath,R/selected['landscapePath'],R/selected['wholePositiveProfileBodiesPath'],R/selected['semanticKindLedgerPath'],sciencepath,sealpath,S/'INPUTS.whole42-goals-current-AM-and-whole-P.json',R/'app/scripts/semanticAtomicityReview.ts',R/'app/scripts/memoryCardReview.ts'}
paths.add(B/'chemie-current454-joint-integration-candidate-technical-20261018-v2/LATEST.selected-candidate-state.pending.json')
aOwners={};originalA={};futureA=[];residuals=[];ownership=[]
for i,entry in enumerate(prod['aConfigs'],1):
 path=R/entry['path'];config=entry['config'];rp=R/config['reviewPath'];rs=records(rp);rb={r['goalId']:(ln,r,s)for ln,r,s in rs};ids=entry['selectedOrdinaryGoalIds'];paths|={path,rp}
 for gid in ids:
  assert gid in rb and gid not in aOwners,gid;aOwners[gid]=entry['path'];originalA[gid]={'config':pin(path),'recordFile':pin(rp),'lineOneBased':rb[gid][0],'wholeRecord':rb[gid][1],'wholeOriginalLine':rb[gid][2]}
 kept=[gid for gid in ids if gid not in target];removed=[gid for gid in ids if gid in target]
 if not kept:
  residuals.append({'originalConfig':pin(path),'selectedAfter':None,'retiredTargetIds':removed,'retainedOriginalGoalIds':[]});continue
 if removed or not config['scope'].get('leafGoalIds'):
  recordPath=O/'records'/f'A{i:03}.original-owner.remaining-byte-exact.jsonl';recordPath.parent.mkdir(exist_ok=True);recordPath.write_text(''.join(s for _,r,s in rs if r['goalId']in kept))
  assert [r['goalId']for _,r,_ in records(recordPath)]==[r['goalId']for _,r,_ in rs if r['goalId']in kept]
  after=copy.deepcopy(config);after['reviewPath']=rel(recordPath);after['scope']={'label':config['scope']['label']+'; exact remaining original owners after targeted33 replacement','leafGoalIds':kept};after['landscapePath']=normalPath
  configPath=O/'config/active'/f'A{i:03}.original-owner.residual.config.json';write(configPath,after);futureA.append(rel(configPath))
  probe=copy.deepcopy(after);probe['landscapePath']=selected['landscapePath'];probePath=O/'config/probe'/configPath.name;write(probePath,probe)
  residuals.append({'originalConfig':pin(path),'selectedAfter':rel(configPath),'candidateProbeConfig':rel(probePath),'retiredTargetIds':removed,'retainedOriginalGoalIds':kept,'retainedRecordLinesByteExact':True})
 else:futureA.append(entry['path']);residuals.append({'originalConfig':pin(path),'selectedAfter':entry['path'],'retiredTargetIds':[],'retainedOriginalGoalIds':kept,'wholeConfigAndRecordFileReusedExact':True})
 for gid in kept:ownership.append({'goalId':gid,'selectedConfigPath':futureA[-1],'reviewId':rb[gid][1]['reviewId'],'recordFile':pin(rp),'originalLineOneBased':rb[gid][0],'wholeOriginalRecordPreserved':True})
assert len(aOwners)==450 and len(originalA)==450 and len(ownership)==421
def binding(gid,lane,index):
 old=originalA.get(gid)if lane=='A'else originalM.get(gid)
 return {'role':'Technical native serialization after actual sealed scientific judgment; no blind review, current D or Human claim','scientificJudgment':sciencepin,'scientificJudgmentPointer':f'/records/{index}/{lane}','scientificSeal':pin(sealpath),'historicalOriginalOwner':{k:v for k,v in old.items()if k!='wholeOriginalLine'}if old else None,'earlierAuthorshipDisclosed':target[gid]['reviewerAuthoredUnderlyingSuccessor']}
aid='canonical-chemistry-current454-targeted33-informed-AM-A-20261018-v1';aNew=[]
for i,t in enumerate(science['records']):
 gid=t['goalId'];assert t['A']['decision']=='atomic';aNew.append({'schemaVersion':1,'reviewId':aid,'ruleVersion':'semantic-atomicity-v1','landscapeId':candidate['landscapeId'],'goalId':gid,'fingerprint':fps[gid]['A'],'status':'atomic','semanticAtomic':True,'reviewedAt':nativeAt,'reviewer':reviewer,'reason':'Technical serialization of the actually sealed informed A component; '+t['A']['reasonDe'],'technicalScientificBinding':binding(gid,'A',i)})
aPath=O/'records/A33.actual-sealed-informed-components.native-candidate.review.jsonl';aPath.parent.mkdir(exist_ok=True);aPath.write_text(''.join(line(r)for r in aNew))
ac={'schemaVersion':1,'reviewId':aid,'ruleVersion':'semantic-atomicity-v1','landscapeId':candidate['landscapeId'],'landscapePath':normalPath,'reviewPath':rel(aPath),'scope':{'label':'Exactly33 actually sealed informed A components; four new and29 existing ordinary atoms, no blind D review','leafGoalIds':list(target)}}
ap=O/'config/active/A33.actual-sealed-informed-components.config.json';write(ap,ac);futureA.append(rel(ap));probe=copy.deepcopy(ac);probe['landscapePath']=selected['landscapePath'];write(O/'config/probe/A33.actual-sealed-informed-components.config.json',probe)
ownership.extend({'goalId':gid,'selectedConfigPath':rel(ap),'reviewId':aid,'wholeOriginalRecordPreserved':False,'historicalOwnerRetained':gid in originalA,'scientificDecision':sciencepin,'nativeRecordFile':rel(aPath)}for gid in target)
assert len(ownership)==454 and len({r['goalId']for r in ownership})==454 and {r['goalId']for r in ownership}==set(fps)
mcpath=R/prod['currentMemoryConfigPath'];mc=read(mcpath);mrp=R/mc['reviewPath'];oldm=records(mrp);paths|={mcpath,mrp};originalM={r['goalId']:{'config':pin(mcpath),'recordFile':pin(mrp),'lineOneBased':ln,'wholeRecord':r,'wholeOriginalLine':s}for ln,r,s in oldm};assert len(originalM)==450
cardpath=R/mc['cardReviewPath'];paths.add(cardpath);cardcopy=O/'records/M450.original-cards80.byte-exact.review.jsonl';cardcopy.write_bytes(cardpath.read_bytes());assert cardcopy.read_bytes()==cardpath.read_bytes()
beforecopy=O/'inputs/M450.whole-original-record-lines.EXACT.jsonl';beforecopy.parent.mkdir(exist_ok=True);beforecopy.write_bytes(mrp.read_bytes())
mnew={}
for i,t in enumerate(science['records']):
 gid=t['goalId'];m=t['M'];old=originalM.get(gid)
 if old:
  assert old['wholeRecord']['status']==m['decision'];assert old['wholeRecord'].get('memoryGoalIds',[])==m['memoryGoalIds'];assert old['wholeRecord'].get('deckIds',[])==m['deckIds']
 mnew[gid]={'schemaVersion':1,'reviewId':mc['reviewId'],'ruleVersion':mc['ruleVersion'],'landscapeId':mc['landscapeId'],'goalId':gid,'fingerprint':fps[gid]['M'],'status':m['decision'],'memoryUseful':m['decision']=='memory_required','memoryGoalIds':m['memoryGoalIds'],'deckIds':m['deckIds'],'reviewedAt':nativeAt,'reviewer':reviewer,'reason':'Technical serialization of the actually sealed informed M component; '+m['reasonDe'],'technicalScientificBinding':binding(gid,'M',i)}
mPath=O/'records/M454.whole-original-plus33-current-components.native-candidate.review.jsonl';mPath.write_text(''.join(line(mnew[r['goalId']])if r['goalId']in mnew else s for _,r,s in oldm)+''.join(line(r)for gid,r in mnew.items()if gid not in originalM))
mergedm=records(mPath);assert len(mergedm)==454 and len({r['goalId']for _,r,_ in mergedm})==454
retained=[(r,s)for _,r,s in mergedm if r['goalId']not in target];assert len(retained)==421
assert all(s==originalM[r['goalId']]['wholeOriginalLine']and r==originalM[r['goalId']]['wholeRecord']for r,s in retained)
memoryNodes=[g for g in normal['goals']if g.get('nodeKind')=='memory'or'memorization'in g.get('tags',[])];assert len(memoryNodes)==68 and all(cby[g['id']]==g for g in memoryNodes)
mactive=copy.deepcopy(mc);mactive['landscapePath']=normalPath;mactive['reviewPath']=rel(mPath);mactive['cardReviewPath']=rel(cardcopy);mactive['scope']['label']='Canonical chemistry454; original421 exact records plus33 actually sealed informed M components';mactive['reportPath']=rel(O/'reports/M454.after-activation.report.md')
mp=O/'config/active/M454.current41-views.config.json';write(mp,mactive)
viewpaths=sorted((R/selected['viewsPath']).glob('*.json'));views={read(p)['viewId']:p for p in viewpaths};assert len(views)==41 and len(mc['visibilityScopes'])==41
mprobe=copy.deepcopy(mactive);mprobe['landscapePath']=selected['landscapePath'];vbind=[]
for scope in mprobe['visibilityScopes']:
 oldpath=R/scope['viewPath'];view=read(oldpath);newpath=views[view['viewId']];vbind.append({'viewId':view['viewId'],'activeViewPath':rel(oldpath),'candidateViewPath':rel(newpath)});paths|={oldpath,newpath};scope['viewPath']=rel(newpath)
mprobe['reportPath']=rel(O/'reports/M454.candidate-stock.report.md');write(O/'config/probe/M454.current41-views.config.json',mprobe)
write(O/'ACTIVATION.two-registry-field-CAS.pending.json',{'role':'Inactive field-level activation proposal only; root may compose with other concurrent registry edits after canonical/source/view activation','registryInput':pin(registryPath),'operations':[{'jsonPointer':f'/subjects/{si}/semanticAtomicityConfigPaths','before':subject['semanticAtomicityConfigPaths'],'after':futureA},{'jsonPointer':f'/subjects/{si}/memoryReviewConfigPath','before':subject['memoryReviewConfigPath'],'after':rel(mp)}],'requiredCandidateCanonical':pin(R/selected['landscapePath']),'requiredCandidateSemanticKindLedger':pin(R/selected['semanticKindLedgerPath']),'required41CandidateViews':vbind,'normalEditsPerformed':False,'nativeDOrM7OrHumanClaim':False})
write(O/'SELECTION.A454-exact-one-owner-and-original421-retention.json',{'role':'Technical explicit owner selection; no scope double-counting','beforeOwnerCount':450,'afterOwnerCount':454,'targetedNewOwnerRecords':33,'existingRetainedOriginalRecords':421,'selectedFutureConfigPaths':futureA,'originalOwnerDispositions':residuals,'exactOwnerByGoalId':ownership,'newOwnerRecord':pin(aPath),'nativeRule':'semantic-atomicity-v1'})
write(O/'RETENTION.M454-cards80-memory68-views41-and-science33.json',{'originalMConfig':pin(mcpath),'originalM450':pin(mrp),'retainedM421WholeOriginalLines':True,'newActuallySealedComponents':33,'newOrdinaryGoals':4,'newRecords':pin(mPath),'originalCardReviews':pin(cardpath),'copiedCardReviews':pin(cardcopy),'cardReviewsByteExact':True,'cardReviewRecordCount':len(records(cardcopy)),'all68WholeMemoryGoalBodiesExact':True,'whole41VisibilityScopesPreservedInFutureConfig':mactive['visibilityScopes']==mc['visibilityScopes'],'candidateProbeViewBindings':vbind,'targetedFourMemoryRequiredRetained':[gid for gid,r in mnew.items()if r['status']=='memory_required'],'candidateM454StatusCounts':{s:sum(r['status']==s for _,r,_ in mergedm)for s in ['memory_required','no_memory_needed','needs_developer_review']},'all33OldNecessityDecisionsRetainedForExisting29':True,'currentNecessaryMemoryRole':'Preserve current memory and cards; this serialization supplies no new card review or learner evidence'})
for g in memoryNodes:
 for k in ['vocabularySource','vocabularySourceEn']:
  source=g.get('extendedData',{}).get(k)
  if source:
   actual=(R/'app/public'/source.lstrip('/'))if source.startswith('/data/')else R/source.lstrip('/')
   paths|={actual,actual.resolve()}
write(O/'INPUTS.actual-entry-pins.json',{'role':'Current original owner inputs plus sealed own science, actual bound card data and latest candidate; no new peer scientific input','pins':[pin(p)for p in sorted(paths)]})
write(O/'LICENSE-and-attribution.json',{'technicalWrappersAndScripts':'Apache-2.0','retainedOwnKnowledgeAndScientificJudgments':'CC-BY-4.0','otherInputs':'Original rights and historical provenance retained'})
print(json.dumps({'output':rel(O),'futureAConfigs':len(futureA),'Aowners':len(ownership),'Mrecords':len(mergedm),'originalRetainedA':421,'originalRetainedM':421,'newCurrentAM':33,'pins':len(paths)},ensure_ascii=False))
