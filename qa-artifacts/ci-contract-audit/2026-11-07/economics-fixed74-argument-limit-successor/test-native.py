#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,shutil,subprocess
import runner
OUT,ROOT,OLD,W=runner.OUT,runner.ROOT,runner.OLD,runner.W
pins=json.loads((OLD/'fixed74-pins.json').read_bytes());NEW=pins['indexSha256'];bounds={'working':201326592,'object':268435456,'embedded':16777216}
def args(action,output,kind=None,form='normal'):
 result=['python3','-B',ROOT/'scripts/visualization_qualified_context_capsule.py',action,'--repository-root',ROOT,
  '--accepted-commit','25a6f2164a81a7e6ae50db3557d20521fecf5124','--accepted-census-s='+NEW,
  '--census-path',pins['indexPath'],'--output',output]
 if action=='materialize':result+=['--capsule',ROOT/pins['capsulePath'],'--accepted-capsule-sha256',pins['capsuleSha256']]
 for field,value in bounds.items():
  flag='--maximum-'+field+'-bytes'
  if field!=kind:result += [flag,str(value)];continue
  over=str(value+1)
  if form=='normal':result += [flag,over]
  elif form=='double':result += [flag,str(value),flag,over]
  elif form=='equals':result += [flag+'='+over]
  elif form=='abbrev':result += ['--maximum-'+field[0],over]
  elif form=='abbrev-equals':result += ['--maximum-'+field[0]+'='+over]
  else:raise AssertionError(form)
 return result
results=[]
for action in ['build','materialize']:
 for kind in bounds:
  for form in ['normal','double','equals','abbrev','abbrev-equals']:
   name=f'native-{action}-{kind}-over-{form}';output=W/name
   runner.run(name,args(action,output,kind,form),expected=1,shallow=action!='build',pattern='Fixed74 '+kind+' allowance exceeds')
   assert not output.exists();results.append({'name':name,'originalOperationNotEntered':True,'noOutputCreated':True})
# A valid real build reaches the original action with exactly the inherited args.
run=runner.run('valid-effective-namespace-real-build',args('build',W/'rebuilt-capsule'),shallow=False)
actual=hashlib.sha256((W/'rebuilt-capsule/capsule.json').read_bytes()).hexdigest();assert actual==pins['capsuleSha256'],actual
results.append({'name':'valid-effective-namespace-real-build','original74CapsuleManifestByteIdentical':True,'capsuleSha256':actual})
run=runner.run('valid-effective-namespace-depth1-materialize',args('materialize',W/'originals74'))
measure=json.loads(run.stdout);assert measure['uniqueWorkingBytes']==168024327 and measure['objectPayloadBytes']==182146189
assert subprocess.check_output(['git','-C',str(W/'originals74'),'rev-parse','--is-shallow-repository']).strip()==b'true'
assert subprocess.run(['git','-C',str(W/'host'),'cat-file','-e','25a6f2164a81a7e6ae50db3557d20521fecf5124'],capture_output=True).returncode!=0
results.append({'name':'valid-effective-namespace-depth1-materialize','actualIndependentDepth1':True,'measurement':measure})
for kind,value in [('working',168024326),('object',182146188)]:
 command=args('materialize',W/('actual-'+kind+'-one-byte-small'))
 flag='--maximum-'+kind+'-bytes';command[command.index(flag)+1]=str(value)
 runner.run('actual-'+kind+'-one-byte-small',command,expected=1,pattern='Private component budget exceeded')
 results.append({'name':'actual-'+kind+'-one-byte-small','guardAllowsSmallerButActualKernelBudgetFails':True})
for suffix,extra in [('normal',[]),('economics',['--economics-probe'])]:
 runner.run('normal74-'+suffix+'-maturity',[ROOT/'app/node_modules/.bin/tsx',ROOT/'app/scripts/testVisualizationContextMaturity.ts',*extra])
 results.append({'name':'normal74-'+suffix+'-maturity','actual74CurrentQualificationsAndNativeCountercases':True})
oldruntime=W/'old57-runtime';oldruntime.mkdir()
for path,name in [('app/scripts/lib/qualifiedVisualizationContextAuthority.ts','authority.ts'),('app/scripts/testVisualizationContextMaturity.ts','maturity.ts')]:shutil.copyfile(ROOT/path,oldruntime/name)
runner.run('preserved57-normal-maturity',[ROOT/'app/node_modules/.bin/tsx',ROOT/'app/scripts/testVisualizationContextMaturity.ts'],
 extras=[(oldruntime/'authority.ts',ROOT/'app/scripts/lib/qualifiedVisualizationContextAuthority.ts'),(oldruntime/'maturity.ts',ROOT/'app/scripts/testVisualizationContextMaturity.ts')])
results.append({'name':'preserved57-normal-maturity','old57BehaviorUnchanged':True})
(OUT/'native-results.json').write_text(json.dumps({'cases':len(results),'allExpectationsMet':True,'noProbeInstrumentation':True,
 'poWiSourceFrame':'readonly49e68 snapshot despite separately authorized RootPoWi4 application','results':results},indent=2)+'\n')
