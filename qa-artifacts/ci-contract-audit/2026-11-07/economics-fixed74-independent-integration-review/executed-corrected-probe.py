from pathlib import Path
import sys,argparse,runpy,json
root=Path('/home/enpasos/projects/skillpilot');sys.path.insert(0,str(root/'scripts'));import visualization_review_git_capsule as kernel
class ObservedAction(BaseException):pass
spec=json.loads(sys.argv[1]);seen=[];calls=[];saved=argparse.ArgumentParser.parse_args

def parse(self,*a,**kw):
 ns=saved(self,*a,**kw);seen.append(ns);return ns

def stop(args):
 calls.append(args);raise ObservedAction()
argparse.ArgumentParser.parse_args=parse;kernel.build=stop;kernel.materialize=stop
candidate=root/'qa-artifacts/ci-contract-audit/2026-11-07/economics-fixed74-argument-limit-successor/private-code/scripts/visualization_qualified_context_capsule.py';sys.argv=[str(candidate)]+spec['argv']
try:runpy.run_path(str(candidate),run_name='__main__')
except ObservedAction:result={'id':spec['id'],'effectiveActionReached':True,'sameNamespaceIdentity':len(seen)==1 and calls[0] is seen[0],'parseCalls':len(seen),'effectiveIndex':seen[0].accepted_census_sha256,'effectiveWorking':seen[0].maximum_working_bytes}
except BaseException as ex:result={'id':spec['id'],'effectiveActionReached':bool(calls),'parseCalls':len(seen),'exceptionType':type(ex).__name__,'message':str(ex),'effectiveIndex':getattr(seen[0],'accepted_census_sha256',None) if seen else None}
else:raise AssertionError('Expected observation')
print(json.dumps(result))
