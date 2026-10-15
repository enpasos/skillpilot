# Apache-2.0. Read-only scoped report mode; pending author rows are not accepted gates.
import datetime,json,pathlib,subprocess,sys
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent
lane=sys.argv[1];assert lane in ['A','M']
script='semanticAtomicityReview.ts' if lane=='A' else 'memoryCardReview.ts'
command=[str(R/'app/node_modules/.bin/tsx'),'app/scripts/'+script,'--config='+str((O/f'config/{lane}5.author-pending-review.config.json').relative_to(R)),'--mode=report']
started=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(command,cwd=R,text=True,capture_output=True)
stem=O/f'checks/STOCK.{lane}5.author-pending-report'
stem.with_suffix('.stdout.txt').write_text(p.stdout);stem.with_suffix('.stderr.txt').write_text(p.stderr)
receipt={'schemaVersion':1,'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':command,'cwd':str(R),'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr,
 'purpose':'Actual unchanged stock scoped report validates native pending format/fingerprint; no accepted gate or new independent scientific judgment. All five rows remain needs_developer_review.',
 'mode':'report','checkGateClaim':False,'activeOrHostWrites':False}
(O/f'checks/STOCK.{lane}5.author-pending-report.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'lane':lane,'exitCode':p.returncode,'stdout':p.stdout[-5000:],'stderr':p.stderr[-2000:]}));raise SystemExit(p.returncode)
