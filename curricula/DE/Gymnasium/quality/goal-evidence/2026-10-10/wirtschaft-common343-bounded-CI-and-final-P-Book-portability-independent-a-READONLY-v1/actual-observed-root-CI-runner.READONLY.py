from pathlib import Path
import json,os,sys,subprocess,time,hashlib,datetime
root=Path('/home/enpasos/projects/skillpilot');os.chdir(root)
phase=sys.argv[1];out=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-common343-stable-M6-CI-root-v1';out.mkdir(exist_ok=True)
node=Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip();env=os.environ.copy();env['PATH']=str(Path(node).parent)+':/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/bin:'+env['PATH'];env['LD_LIBRARY_PATH']='/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/lib/x86_64-linux-gnu'+(':'+env['LD_LIBRARY_PATH'] if env.get('LD_LIBRARY_PATH') else '');env['FONTCONFIG_FILE']='/tmp/skillpilot-native-liberation-fonts-4dyn_jva/fonts.conf';env['GOAL_BOOK_CHROMIUM_EXECUTABLE_PATH']='/home/enpasos/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome'
receipt=out/(phase+'.actual-command-receipts.json');assert not receipt.exists(),receipt
commands=[]
def npm(name,*args): commands.append([name,['npm','--prefix','app','run',name,*args]])
if phase=='layerA':
 npm('prepare:runtime-assets')
 for f in ['validate_schemas.py','validate_goal_ids_uuid.py','validate_competency_wording.py']:commands.append([f,['python3','-B','scripts/'+f]])
 commands.append(['schema-symlink-regressions',['python3','-B','scripts/test_validate_schemas_symlinks.py','-v']])
 commands.append(['spelling-regressions',['node','--test','scripts/check_curriculum_spelling.test.mjs']])
 commands.append(['curriculum-spelling',['node','scripts/check_curriculum_spelling.mjs']])
 for name in ['validate:graph','test:exam-markdown','test:hard-learning-routes','test:learner-facing-composition-labels','validate:view-filters','check:source-landscape-registry','validate:composition-views','test:composition-projection-roles','test:course-level-mapping-consistency','test:repository-source-availability','test:source-extraction-inventory','check:ai-transparency-inventory']:npm(name)
 npm('quality:source-coverage-audit');npm('quality:source-coverage-audit:check')
 r=json.loads((root/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json').read_text());e=next(s for s in r['subjects'] if s['subject']=='wirtschaftswissenschaften')
 npm('quality:semantic-atomicity:check','--','--config='+e['semanticAtomicityConfigPath']);npm('quality:memory-card-review:check','--','--config='+e['memoryReviewConfigPath'])
 npm('quality:memory-card-review:check:all')
 for i,p in enumerate(e['positiveEvidenceConfigPaths']):commands.append([f'positive-{i+1:02d}',['npm','--prefix','app','run','quality:positive-goal-evidence:check','--','--config='+p]])
 npm('check:goal-visualization-assets');npm('test:deep-understanding-rollout')
elif phase=='status':npm('quality:curriculum-status');npm('quality:curriculum-status:check')
elif phase=='books':
 npm('build:goal-books','--','--force');npm('check:goal-book-publication');npm('test:goal-book-pipeline');npm('lint');npm('build:application')
elif phase=='docs':
 for name in ['check:generated-doc-notices','check:generated-status-registry','check:docs-links','check:docs-indexes','check:terminology']:npm(name)
 commands.append(['git-diff-check',['git','diff','--check']])
else:raise ValueError(phase)
rows=[]
for i,(name,cmd) in enumerate(commands):
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();now=time.monotonic();log=out/f'{phase}.{i+1:02d}.{name.replace(":","-")}.raw.txt'
 print('RUN',phase,i+1,len(commands),name,flush=True)
 with log.open('w') as f:result=subprocess.run(cmd,cwd=root,env=env,stdout=f,stderr=subprocess.STDOUT)
 row={'name':name,'command':cmd,'startedAt':started,'elapsedSeconds':round(time.monotonic()-now,3),'exitCode':result.returncode,'rawOutputPath':str(log.relative_to(root)),'rawOutputSha256':'sha256:'+hashlib.sha256(log.read_bytes()).hexdigest()};rows.append(row);receipt.write_text(json.dumps({'phase':phase,'toolchainNodePath':node,'remoteGitHubCIClaim':False,'results':rows,'phaseComplete':len(rows)==len(commands) and result.returncode==0},ensure_ascii=False,indent=2)+'\n');print('RESULT',name,result.returncode,row['elapsedSeconds'],flush=True)
 if result.returncode:
  print(log.read_text()[-7000:],flush=True);sys.exit(result.returncode)
print('PASS',phase,len(rows),flush=True)
