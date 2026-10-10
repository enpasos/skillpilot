from pathlib import Path
exec(compile(Path(__file__).with_name('prepare_and_run.py').read_text().split('origSeal=')[0],str(Path(__file__).with_name('prepare_and_run.py')),'exec'))
shutil.copytree(R/P,C/P,dirs_exist_ok=True)
run('normal-whole394-fcc-current-model-and-protection',[tsx,str(P/'normal-current-fcc-whole394-and-seven-exact.technical.mts'),'--capsule',str(C)],R)
shutil.copytree(R/P,C/P,dirs_exist_ok=True)
for mode in ['prepare','check']:
 run('normal-current-fcc-native1-'+mode,[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts',f'--config={P}/native/one-fcc-current-P.prerequisite-safe.batch.config.json',f'--mode={mode}'])
shutil.copytree(C/P/'native/one-fcc-current-P',R/P/'native/one-fcc-current-P')
print(json.dumps({'native1CurrentActualReady':True}),flush=True)
