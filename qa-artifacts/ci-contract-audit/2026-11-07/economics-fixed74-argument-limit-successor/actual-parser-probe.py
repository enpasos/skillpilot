#!/usr/bin/env python3
"""Observe the real unchanged parser; stop only at the original action boundary."""
from pathlib import Path
import argparse,hashlib,json,runpy,sys
ROOT=Path(__file__).resolve().parents[4]
sys.path.insert(0,str(ROOT/'scripts'))
import visualization_review_git_capsule as kernel
class OriginalActionReached(BaseException):pass
spec=json.loads(sys.argv[1]);parsed=[];actions=[]
parse=argparse.ArgumentParser.parse_args
def observe_parse(self,*args,**kwargs):
 ns=parse(self,*args,**kwargs);parsed.append(ns);return ns
def original_action_spy(ns):
 actions.append(ns);raise OriginalActionReached()
argparse.ArgumentParser.parse_args=observe_parse
# The selector saves these as the original operations before wrapping them.
# Its guard therefore runs after the one real parse, before this stop point.
kernel.build=original_action_spy;kernel.materialize=original_action_spy
selector=Path(__file__).resolve().parent/'private-code/scripts/visualization_qualified_context_capsule.py'
sys.argv=[str(selector),*spec['argv']]
error=None
try:runpy.run_path(str(selector),run_name='__main__')
except OriginalActionReached:pass
except BaseException as exception:error={'type':type(exception).__name__,'message':str(exception)}
result={'id':spec['id'],'actualParseCount':len(parsed),'originalActionReached':bool(actions),
 'actionReceivedExactSameNamespace':bool(actions and parsed and actions[0] is parsed[0]),
 'parsed':{key:str(value)if isinstance(value,Path)else value for key,value in vars(parsed[0]).items()}if parsed else None,
 'error':error,'kernelSourceSha256':hashlib.sha256((ROOT/'scripts/visualization_review_git_capsule.py').read_bytes()).hexdigest()}
print(json.dumps(result))
