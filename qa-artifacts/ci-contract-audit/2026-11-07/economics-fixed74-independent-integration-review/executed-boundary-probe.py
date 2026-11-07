from pathlib import Path
import sys,argparse,runpy,json
root=Path('/home/enpasos/projects/skillpilot');sys.path.insert(0,str(root/'scripts'))
class Parsed(BaseException):pass
saved=argparse.ArgumentParser.parse_args;seen=[]
def capture(self,*a,**kw):
 ns=saved(self,*a,**kw);seen.append(vars(ns));raise Parsed()
argparse.ArgumentParser.parse_args=capture
spec=json.loads(sys.argv[1]);candidate=root/'qa-artifacts/ci-contract-audit/2026-11-07/economics-fixed74-authority-integration-candidate/private-code/scripts/visualization_qualified_context_capsule.py';sys.argv=[str(candidate)]+spec['argv']
try:runpy.run_path(str(candidate),run_name='__main__')
except Parsed:result={'id':spec['id'],'actualKernelArgparseReached':True,'parsed':{k:str(v) if isinstance(v,Path) else v for k,v in seen[0].items()},'rejectedByExternalLimitBeforeKernel':False}
except BaseException as ex:result={'id':spec['id'],'actualKernelArgparseReached':bool(seen),'exceptionType':type(ex).__name__,'message':str(ex),'rejectedByExternalLimitBeforeKernel':not seen}
else:raise AssertionError('Expected boundary observation')
print(json.dumps(result,indent=2))
