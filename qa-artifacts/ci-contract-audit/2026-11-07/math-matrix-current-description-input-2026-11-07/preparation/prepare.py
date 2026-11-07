import json,hashlib,shutil,pathlib,subprocess,time,datetime,os
R=pathlib.Path('/home/enpasos/projects/skillpilot'); W=pathlib.Path('/dev/shm/math-matrix-d-input-20261107'); G='ce198bc9-b014-52ba-814f-25cc3e020668'; D='qa-artifacts/ci-contract-audit/2026-11-07'; N='math-matrix-current-description-input-2026-11-07'; O=W/'output'/N
sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
S='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'; K='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'; Q='curricula/DE/Gymnasium/quality/goal-visualization-qa'; A='app/public/assets/goal-visualizations/mathematik/'+G; C='curricula/DE/Gymnasium/visualizations/mathematik/'+G
loc=json.loads((R/'tmp/root-matrix-native-preparation-location-2026-11-07.json').read_text()); source=pathlib.Path(loc['candidateSource']); image=R/loc['packet']/(G+'.png')
assert sha(source)=='e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06'; assert sha(image)=='3d2e99d21ccdc30695657c5778173d6420cce22514cba2f061bddd745d60f091'
assert not (R/A/(G+'.png')).exists() and not (R/C/(G+'.png')).exists()
O.mkdir(parents=True,exist_ok=False); (W/'qa').mkdir(); (W/'public-goal').mkdir(); (W/'canonical-goal').mkdir()
shutil.copyfile(source,W/'candidate.json'); shutil.copyfile('/dev/shm/skillpilot-math-diagram-revision-20261106/kind-ledger.json',W/'kind-ledger.json')
shutil.copyfile(R/Q/'mathematik.qa.json',W/'qa/mathematik.qa.json'); shutil.copyfile(image,W/'public-goal'/(G+'.png')); shutil.copyfile(image,W/'canonical-goal'/(G+'.png'))
old=json.loads((R/K).read_bytes()); new=json.loads((W/'kind-ledger.json').read_bytes()); drafts=json.loads((R/'qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-post-review/fresh-kind-atomicity-memory-drafts.json').read_bytes()); print('draftkeys',list(drafts),flush=True)
oldby={x['goalId']:x for x in old['decisions']}; changes=[x for x in new['decisions'] if x!=oldby[x['goalId']]]; assert len(changes)==3
conf=json.loads((R/'docs/dev/ci-graph-repairs/math-single-description-input-batch-2026-11-06.config.json').read_bytes()); conf.update(batchId='mathematik-matrix-current-page-20261107-v1',bookId='de-gym-math-matrix-current-page-20261107-v1',title='Mathematik – ein Lernziel',goalIds=[G],outputDirectory=D+'/'+N+'/packet');(O/'batch.config.json').write_text(json.dumps(conf,ensure_ascii=False,indent=2)+'\n')
paths=[S,K,Q+'/mathematik.qa.json','app/scripts/materializeGoalDescriptionRolloutBatch.ts','app/scripts/goalBookModel.ts','app/scripts/goalBookRenderer.ts','app/scripts/exportGoalBookReviewBundle.ts','app/scripts/createGoalDescriptionReviewCampaign.ts','app/scripts/generateGoalVisualizationQaLedgers.ts',conf['baseGoalBookConfigPath'],conf['promptPath'],conf['criteriaPath'],'app/package-lock.json']
pins=[{'path':p,'sha256':sha(R/p),'bytes':(R/p).stat().st_size} for p in paths]
base=['bwrap','--die-with-parent','--unshare-net','--ro-bind','/','/','--proc','/proc','--dev','/dev','--tmpfs','/tmp','--ro-bind',str(W),str(W),'--bind',str(W/'output'),str(R/D),'--ro-bind',str(W/'candidate.json'),str(R/S),'--ro-bind',str(W/'kind-ledger.json'),str(R/K),'--ro-bind',str(W/'public-goal'),str(R/A),'--ro-bind',str(W/'canonical-goal'),str(R/C)]
commands=[]
for label,args in [('private-native-v-material-metadata',['app/scripts/generateGoalVisualizationQaLedgers.ts','--subject=mathematik']),('prepare',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',D+'/'+N+'/batch.config.json']),('check',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',D+'/'+N+'/batch.config.json'])]:
 for pin in pins: assert sha(R/pin['path'])==pin['sha256'],pin['path']
 cmd=base+(['--bind'] if label.startswith('private') else ['--ro-bind'])+[str(W/'qa'),str(R/Q)]+['--chdir',str(R),'--',str(R/'app/node_modules/.bin/tsx')]+args
 start=datetime.datetime.now(datetime.timezone.utc).isoformat(); t=time.monotonic()
 with (W/(label+'.stdout.txt')).open('wb') as out,(W/(label+'.stderr.txt')).open('wb') as err: result=subprocess.run(cmd,stdout=out,stderr=err)
 entry={'label':label,'startedAt':start,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'seconds':time.monotonic()-t,'argv':cmd,'exitCode':result.returncode};commands.append(entry);(W/'execution.json').write_text(json.dumps(commands,indent=2)+'\n');print(json.dumps({'label':label,'exitCode':result.returncode,'seconds':entry['seconds']}),flush=True)
 if result.returncode:raise SystemExit(result.returncode)
 if label.startswith('private'):
  rows=json.loads((W/'qa/mathematik.qa.json').read_bytes())['records']; row=next(x for x in rows if x['goalId']==G); assert row['assetSha256']=='sha256:3d2e99d21ccdc30695657c5778173d6420cce22514cba2f061bddd745d60f091'; assert row['humanApproved']=='no' and row.get('aiApproved','no')=='no'; assert row['imageUrl'].endswith(G+'.png');(W/'private-matrix-material-row.json').write_text(json.dumps(row,ensure_ascii=False,indent=2)+'\n')
 for pin in pins: assert sha(R/pin['path'])==pin['sha256'],pin['path']
 assert not (R/A/(G+'.png')).exists() and not (R/C/(G+'.png')).exists()
receipt={'status':'native-single-matrix-description-input-built-and-checked-no-content-review','sourceSha256':sha(W/'candidate.json'),'imageSha256':sha(image),'kindSeedSha256':sha(W/'kind-ledger.json'),'privateQaSha256':sha(W/'qa/mathematik.qa.json'),'originalPinsBeforeAndAfter':pins,'privateKindChanges':changes,'nativeCodeBodiesUnmodified':True,'hostCanonicalAndPublicPngPathsStillAbsent':True,'activeSourceQaAssetWrites':False,'descriptionReviewRecordsAuthored':0,'commands':commands}
(W/'preparation-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print('PREPARE_AND_CHECK_COMPLETE',flush=True)
