#!/usr/bin/env python3
from pathlib import Path
import json,shutil,subprocess
import runner,execute
OUT,ROOT,W=runner.OUT,runner.ROOT,runner.W
pins=json.loads((OUT/'fixed74-pins.json').read_bytes());measure=json.loads((W/'results/capsule74-unrelated-depth1-materialize.stdout').read_bytes())
cases=[]
for count,index,sha,anchor,capsule,capsha in [
 (54,'contracts/goal-visualization-context/v1/qualified-context-index.json','3421fa1a64b0c9ccac607bd283fabc3aeeb2391aec6cad0118f317d81c87742e','6fe35a6b0fa807e5a97475b34f3715dc16a89c00','qa-artifacts/ci-contract-audit/2026-11-07/visualization-qualified-context-index/capsule','e78eb4c6338340eead74d3de696da955b50cdca3f4f377160c3d9d87e3454c6b'),
 (57,'contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json','46416dd5939db442dd82c9905008cb89c79dbe9db08e9b19b03f10cde7fd3fd0','25a6f2164a81a7e6ae50db3557d20521fecf5124','qa-artifacts/ci-contract-audit/2026-11-07/visualization-qualified-context-index-math3-2026-11-07/capsule','4f46e57864b5a1277764992f6301f4cb4da9b15ea7cf789e7e96d9d5175d5852')]:
 output=W/f'old{count}-materialized'
 result=runner.run(f'preserved{count}-transport',execute.materialize_args(index,sha,anchor,capsule,capsha,output,134217728))
 assert subprocess.check_output(['git','-C',str(output),'rev-parse','--is-shallow-repository']).strip()==b'true'
 cases.append({'name':f'preserved{count}-transport','actualShallow':True,'result':json.loads(result.stdout),'workingLimit':134217728})
 shutil.rmtree(output)
negative_cases=[
 ('actual-working-one-byte-too-small',{'working':measure['uniqueWorkingBytes']-1},'Private component budget exceeded'),
 ('actual-object-one-byte-too-small',{'objects':measure['objectPayloadBytes']-1},'Private component budget exceeded'),
 ('new74-crossed-old128MiB-budget',{'working':134217728},'Private component budget exceeded'),
 ('new74-working-policy-one-byte-too-large',{'working':201326593},'Fixed74 working allowance exceeds'),
 ('new74-object-policy-one-byte-too-large',{'objects':268435457},'Fixed74 object allowance exceeds'),
 ('new74-crossed-old54-anchor',{'anchor':'6fe35a6b0fa807e5a97475b34f3715dc16a89c00'},'External capsule authority differs'),
 ('new74-crossed-old57-capsule',{'capsule':'qa-artifacts/ci-contract-audit/2026-11-07/visualization-qualified-context-index-math3-2026-11-07/capsule','capsha':'4f46e57864b5a1277764992f6301f4cb4da9b15ea7cf789e7e96d9d5175d5852'},'External capsule authority differs'),
 ('old57-crossed-new74-capsule-and-budget',{'index':'contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json','digest':'46416dd5939db442dd82c9905008cb89c79dbe9db08e9b19b03f10cde7fd3fd0'},'External capsule authority differs'),
]
for name,kwargs,pattern in negative_cases:
 output=W/name;runner.run(name,execute.materialize_args(output=output,**kwargs),expected=1,pattern=pattern)
 assert not output.exists();cases.append({'name':name,'expectedFailure':pattern,'noPartialMaterializationCreated':True})
runner.run('unknown-caller-index-selector',['python3','-B','-c',
 "import sys;sys.path.insert(0,"+repr(str(ROOT/'scripts'))+");import visualization_qualified_context_capsule as s;from pathlib import Path;s.index_originals(Path("+repr(str(ROOT))+"),"+repr(pins['indexPath'])+","+repr('0'*64)+")"],expected=1,pattern='Unknown fixed reviewed-context transport')
cases.append({'name':'unknown-caller-index-selector','expectedFailure':'Unknown fixed reviewed-context transport'})
old=W/'old57-runtime';old.mkdir()
for path,name in [('app/scripts/lib/qualifiedVisualizationContextAuthority.ts','authority.ts'),('app/scripts/testVisualizationContextMaturity.ts','maturity.ts')]:shutil.copyfile(ROOT/path,old/name)
runner.run('preserved57-normal-maturity-with-new-reader',[ROOT/'app/node_modules/.bin/tsx',ROOT/'app/scripts/testVisualizationContextMaturity.ts'],
 extras=[(old/'authority.ts',ROOT/'app/scripts/lib/qualifiedVisualizationContextAuthority.ts'),(old/'maturity.ts',ROOT/'app/scripts/testVisualizationContextMaturity.ts')])
cases.append({'name':'preserved57-normal-maturity-with-new-reader','existing57Qualified':True,'historicalMathContextFixturesRetained':True})
(OUT/'transport-regression-summary.json').write_text(json.dumps({'cases':cases,'rawGitKernelChanged':False,'newBudgetOnlyFixed74':201326592,
 'old54And57AuthorityWorkingLimits':134217728,'unchangedObjectBudget':268435456,'unchangedEmbeddedBudget':16777216},indent=2)+'\n')
