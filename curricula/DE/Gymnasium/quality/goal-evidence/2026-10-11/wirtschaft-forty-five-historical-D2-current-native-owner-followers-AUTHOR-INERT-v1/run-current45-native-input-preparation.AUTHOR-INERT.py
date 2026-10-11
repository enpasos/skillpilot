from pathlib import Path
import datetime, json, os, subprocess
ROOT=Path.cwd();OUT=Path(__file__).resolve().parent
NODE=Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip()
ENV=os.environ.copy();ENV['PATH']=str(Path(NODE).parent)+':/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/bin:'+ENV['PATH'];ENV['LD_LIBRARY_PATH']='/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/lib/x86_64-linux-gnu:'+ENV.get('LD_LIBRARY_PATH','');ENV['FONTCONFIG_FILE']='/tmp/skillpilot-native-liberation-fonts-4dyn_jva/fonts.conf';ENV['GOAL_BOOK_CHROMIUM_EXECUTABLE_PATH']='/home/enpasos/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome'
label='01-original-native-prepare-check-fifteen-groups45';command=[NODE,'app/node_modules/tsx/dist/cli.mjs',str((OUT/'prepare-and-check-current45-native-groups.AUTHOR-INERT.mts').relative_to(ROOT))]
start=datetime.datetime.now(datetime.timezone.utc).isoformat()
with (OUT/(label+'.raw.txt')).open('x') as raw:
 result=subprocess.run(command,cwd=ROOT,env=ENV,text=True,stdout=raw,stderr=subprocess.STDOUT)
receipt={'label':label,'commandArgv':command,'startedAtUtc':start,'finishedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':result.returncode,'rawLog':str((OUT/(label+'.raw.txt')).relative_to(ROOT)),'originalFunctionsOnly':True,'activeWrites':0,'newScientificReviews':0}
with (OUT/(label+'.command-receipt.json')).open('x') as target:target.write(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(receipt));raise SystemExit(result.returncode)
