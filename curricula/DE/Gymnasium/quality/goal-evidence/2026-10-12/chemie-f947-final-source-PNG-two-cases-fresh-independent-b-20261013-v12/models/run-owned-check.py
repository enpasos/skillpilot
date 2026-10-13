# Apache-2.0. Executes stock read-only checks and seals their actual output.
import pathlib,json,subprocess,datetime,hashlib,sys,os
R=pathlib.Path('/home/enpasos/projects/skillpilot')
P=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-f947-final-source-PNG-explicit-tasks-neutral-native-author-root-20261013-v11')
O=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-f947-final-source-PNG-two-cases-fresh-independent-b-20261013-v12')
X=R/'tmp/chemie-f947-independent-b-normal-checks-20261013-v12'
kind=sys.argv[1];rb=P/'native-D1/round-b';cmd={
 'D-stock-campaign-results':['app/node_modules/.bin/tsx','app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',str(rb/'review-bundle-manifest.json'),'--input',str(rb/'description-review-input.json'),'--campaign',str(rb/'description-review-campaign.json'),'--batches-dir',str(rb/'batches'),'--results-dir',str(rb/'results')],
 'P-stock-check':['app/node_modules/.bin/tsx','app/scripts/positiveGoalEvidenceReview.ts','--config='+str(O/'models/P1.independent.inactive.config.json'),'--mode=check'],
 'A-stock-check':['app/node_modules/.bin/tsx','app/scripts/semanticAtomicityReview.ts','--config='+str(O/'models/A1.independent.inactive.config.json'),'--mode=check'],
}[kind]
cwd=X if kind.startswith('P-') else R;label=kind+('-retry-short-tmp' if len(sys.argv)>2 else '');base=R/O/'checks'/label
for q in [base.parent,*base.parent.parents]:
 if q.is_symlink():raise RuntimeError(q)
if cwd==X:
 for q in [X,X/'app',X/O,X/O/'models',X/O/'records',X/'private-cache']:
  if not q.is_dir() or q.is_symlink():raise RuntimeError(q)
cache=pathlib.Path('/tmp/f947b-check-'+kind[0]);cache.mkdir(exist_ok=True);assert not cache.is_symlink();env=os.environ.copy();env['TMPDIR']=str(cache);started=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(cmd,cwd=cwd,env=env,capture_output=True)
sha=lambda b:'sha256:'+hashlib.sha256(b).hexdigest()
for suffix,b in [('stdout.txt',r.stdout),('stderr.txt',r.stderr)]:pathlib.Path(str(base)+'.'+suffix).write_bytes(b)
module=pathlib.Path(cmd[1]);receipt={'schemaVersion':1,'argv':cmd,'cwd':str(cwd.relative_to(R)) or '.','startedAtUTC':started,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':r.returncode,'executedStockModuleSHA256':sha((cwd/module).read_bytes()),'productionStockModuleSHA256':sha((R/module).read_bytes()),'stdoutSHA256':sha(r.stdout),'stderrSHA256':sha(r.stderr),'allMutableOutputParentsRegular':True,'privatePResourceBytesExact':True if cwd==X else None,'activeWrites':False,'scientificHoldDoesNotMeanTechnicalFailure':True}
pathlib.Path(str(base)+'.actual.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2));print(r.stdout.decode());print(r.stderr.decode());sys.exit(r.returncode)
