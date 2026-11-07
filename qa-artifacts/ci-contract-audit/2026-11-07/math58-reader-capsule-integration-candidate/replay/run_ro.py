from pathlib import Path
import os,subprocess,sys,json,time
W=Path(__file__).parent;C=W/'candidate';R=Path('/home/enpasos/projects/skillpilot');B='qa-artifacts/ci-contract-audit/2026-11-07/math58-reader-capsule-proof-inputs-v1'
args=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--bind',str(W),str(W),'--ro-bind',str(C/'app/scripts'),str(R/'app/scripts'),'--ro-bind',str(C/'contracts'),str(R/'contracts'),'--ro-bind',str(W/'working'/B),str(R/B),'--ro-bind',str(C/'scripts/visualization_qualified_context_capsule.py'),str(R/'scripts/visualization_qualified_context_capsule.py')]
if '--v2' in sys.argv:
 sys.argv.remove('--v2');pins=json.loads((C/'contracts/goal-visualization-context/v1/math58-current-supplement-pins-2026-11-07.candidate.json').read_text());b=next(x for x in pins['goalBindings']if x['boxplotV2'])
 for key in ['publicAssetPath','canonicalAssetPath']:args+=['--ro-bind',str(W/'working'/b[key]),str(R/b[key])]
 os.environ['MATH58_BOX_V2']='1'
if os.environ.get('MATH58_FAULT_PLAN'):
 for mount in json.loads(Path(os.environ['MATH58_FAULT_PLAN']).read_text()):args+=['--ro-bind',mount['source'],str(R/mount['path'])]
args+=['--chdir',str(R),*sys.argv[1:]];(W/'tmp').mkdir(exist_ok=True);env={**os.environ,'MATH58_WORKSPACE':str(W),'TMPDIR':str(W/'tmp')};start=time.time();p=subprocess.Popen(args,env=env);print(json.dumps({'pid':p.pid,'started':start}),flush=True);rc=p.wait();print(json.dumps({'exitCode':rc,'finished':time.time()}),flush=True);sys.exit(rc)
