from pathlib import Path
exec(compile(Path(__file__).with_name('prepare_and_run.py').read_text().split('origSeal=')[0],str(Path(__file__).with_name('prepare_and_run.py')),'exec'))
for mode in ['prepare','check']:
 run('normal-current-fcc-native1-'+mode+'-positional-cli',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts',mode,'--config',str(P/'native/one-fcc-current-P.prerequisite-safe.batch.config.json')])
shutil.copytree(C/P/'native/one-fcc-current-P',R/P/'native/one-fcc-current-P')
print(json.dumps({'normalNative1Ready':True}),flush=True)
