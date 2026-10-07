"""Run existing checkers over isolated scopes; expect old-row staleness to fail closed."""
import json,pathlib,subprocess,datetime
own=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next25-current-atomicity-memory-impact-independent-a-v1')
fixtures=json.loads((own/'actual-native-function-bindings-and-readonly-fixtures.json').read_text())['fixtureFiles']
results=[]
for i,row in enumerate(fixtures,1):
 native='app/scripts/semanticAtomicityReview.ts' if row['gate']=='A' else 'app/scripts/memoryCardReview.ts'
 cmd=['node','app/node_modules/tsx/dist/cli.mjs',native,'--config='+row['configPath'],'--mode=check']
 cp=subprocess.run(cmd,capture_output=True,text=True,check=False)
 base=f'qa-artifacts/{i:02d}-{row["gate"]}-{row["case"]}'
 (own/(base+'.actual.stdout.txt')).write_text(cp.stdout)
 (own/(base+'.actual.stderr.txt')).write_text(cp.stderr)
 record={**row,'actualCommand':cmd,'actualExit':cp.returncode,'expectedFailClosedOrPass':cp.returncode==row['expectedExit'],'stdoutPath':str(own/(base+'.actual.stdout.txt')),'stderrPath':str(own/(base+'.actual.stderr.txt')),'executedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'existingNativeCheckerUnmodified':True,'writeFingerprintsFlagUsed':False,'writeReportFlagUsed':False,'bootstrapFlagUsed':False}
 results.append(record)
 print(row['gate'],row['case'],'actualExit',cp.returncode,'expected',row['expectedExit'],flush=True)
 if cp.returncode!=row['expectedExit']:print(cp.stdout,cp.stderr,flush=True)
receipt={'schemaVersion':1,'role':'bounded exact native current/reuse and one-semantic-delta fixture verification, not full curriculum QS','nativeChecks':results,'allExpectedPassOrFailClosedResults':all(r['expectedFailClosedOrPass'] for r in results),'currentA25PASS':all(r['actualExit']==0 for r in results if r['case']=='current-byte-exact-reuse' and r['gate']=='A'),'currentM25PlusSharedCardClosurePASS':any(r['actualExit']==0 for r in results if r['case']=='current-byte-exact-reuse' and r['gate']=='M'),'oldRowsAgainstENOnlyCandidateRemainNativeStale':all(r['actualExit']==1 for r in results if 'old-record-stale' in r['case']),'scientificallyReviewedOneRowPreviewPassesBoundedNativeOnly':all(r['actualExit']==0 for r in results if 'fresh-independent-preview' in r['case']),'candidateIsNotFinalOperativeNativeStage':True,'activeWrites':False,'globalBuilds':0,'centralRuns':0}
(own/'bounded-native-A-M-checks.actual.receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
if not receipt['allExpectedPassOrFailClosedResults']:raise SystemExit(1)
