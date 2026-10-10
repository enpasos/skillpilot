import pathlib,tempfile,shutil,subprocess,json,hashlib
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');OUT=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-BB-selected-personal-three-real-atoms-six-cases-local-practice-AUTHOR-INERT-v1';BASE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-common343-M6-fieldwise-composition-AUTHOR-INERT-v1';tmp=pathlib.Path(tempfile.mkdtemp(prefix='skillpilot-personal346-native-AM-',dir='/tmp'));(tmp/'app/scripts').mkdir(parents=True);(tmp/'app/public/data').mkdir(parents=True)
for child in ROOT.iterdir():
 if child.name!='app':(tmp/child.name).symlink_to(child,target_is_directory=child.is_dir())
for child in (ROOT/'app').iterdir():
 if child.name not in ['scripts','public']:(tmp/'app'/child.name).symlink_to(child,target_is_directory=child.is_dir())
for child in (ROOT/'app/scripts').iterdir():
 p=tmp/'app/scripts'/child.name
 if child.name in ['semanticAtomicityReview.ts','memoryCardReview.ts']:shutil.copyfile(child,p)
 else:p.symlink_to(child,target_is_directory=child.is_dir())
for child in (ROOT/'app/public').iterdir():
 if child.name!='data':(tmp/'app/public'/child.name).symlink_to(child,target_is_directory=child.is_dir())
for child in (ROOT/'app/public/data').iterdir():
 candidate=BASE/'candidate-memory/runtime'/child.name;p=tmp/'app/public/data'/child.name
 if candidate.exists():shutil.copyfile(candidate,p)
 else:p.symlink_to(child,target_is_directory=child.is_dir())
node=pathlib.Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip();calls=[]
for lane,name in [('atomicity','semanticAtomicityReview.ts'),('memory','memoryCardReview.ts')]:
 config=str((OUT/lane/f'{lane}346.candidate-core-SEM-and35views.config.json').relative_to(ROOT));cmd=[node,str(tmp/'app/node_modules/tsx/dist/cli.mjs'),str(tmp/'app/scripts'/name),'--config='+config,'--mode=check']
 if lane=='memory':cmd.append('--write-report')
 r=subprocess.run(cmd,cwd=tmp,capture_output=True,text=True);calls.append({'lane':lane,'command':cmd,'cwd':str(tmp),'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr});print(lane,r.returncode,r.stdout[:1700],r.stderr[:1500])
p=OUT/'actual-native-A346-M346-67cards-35visibility-candidate-check.READONLY.json';p.write_text(json.dumps({'role':'UNCHANGED_NATIVE_CHECKERS_CANDIDATE_CHECK_ONLY','executionCapsuleOutsideCurricula':str(tmp),'calls':calls,'allPassed':all(c['exitCode']==0 for c in calls),'scientificSelfReview':False,'humanApproval':False,'M6FinalClaim':False},indent=2)+'\n')
if not all(c['exitCode']==0 for c in calls):raise SystemExit(1)
