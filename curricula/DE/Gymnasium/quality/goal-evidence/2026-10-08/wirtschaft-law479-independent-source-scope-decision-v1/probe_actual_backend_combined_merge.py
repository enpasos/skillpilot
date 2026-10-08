# Apache-2.0. Invoke the actual dependency-free backend merger on actual inert views.
import pathlib,json,hashlib,subprocess,tempfile,datetime
directory=pathlib.Path(__file__).resolve().parent;root=directory.parents[6]
read=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
gk_path=directory/'de-by-gym-economics-gk-479-bounded.inert.view.json'
lk_path=directory/'de-by-gym-economics-lk-479-bounded.inert.view.json'
canonical_path=root/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
merger=root/'backend/src/main/java/com/skillpilot/backend/composition/CourseProfileCompositionViewMerger.java'
gk,lk,canonical=map(read,[gk_path,lk_path,canonical_path])
before={str(p):sha(p) for p in [gk_path,lk_path,canonical_path,merger]}
def java(v):
 if v is None:return 'null'
 if isinstance(v,str):return json.dumps(v,ensure_ascii=True)
 if isinstance(v,bool):return 'true' if v else 'false'
 if isinstance(v,list):return 'List.of('+','.join(java(x) for x in v)+')'
 if isinstance(v,dict):return 'map('+','.join(java(k)+','+java(x) for k,x in v.items())+')'
 return str(v)
source='''// Apache-2.0. Actual inert input adapter, not a substitute merger.
import java.util.*;
import com.skillpilot.backend.composition.CourseProfileCompositionViewMerger;
public class ActualLaw479CombinedProbe {
  static Map<String,Object> map(Object... pairs) {
    Map<String,Object> m=new LinkedHashMap<>();
    for(int i=0;i<pairs.length;i+=2)m.put((String)pairs[i],pairs[i+1]);
    return m;
  }
  static String json(Object x) {
    if(x==null)return "null";
    if(x instanceof String s)return "\\\""+s.replace("\\\\","\\\\\\\\").replace("\\\"","\\\\\\\"")+"\\\"";
    if(x instanceof Map<?,?> m){List<String> a=new ArrayList<>();m.forEach((k,v)->a.add(json(k)+":"+json(v)));return "{"+String.join(",",a)+"}";}
    if(x instanceof List<?> l){List<String> a=new ArrayList<>();l.forEach(v->a.add(json(v)));return "["+String.join(",",a)+"]";}
    return x.toString();
  }
  public static void main(String[] args) {
    Map<String,List<String>> children=new LinkedHashMap<>();
'''
for goal in canonical['goals']:source+='    children.put('+java(goal['id'])+','+java(goal.get('contains',[]))+');\n'
source+='    List<Map<String,Object>> gk='+java(gk['rootNodes'])+';\n'
source+='    List<Map<String,Object>> lk='+java(lk['rootNodes'])+';\n'
source+='    System.out.println(json(CourseProfileCompositionViewMerger.mergeViews(List.of(gk,lk),children)));\n  }\n}\n'
driver=directory/'ActualLaw479CombinedProbe.java'
with driver.open('x') as f:f.write(source)
scratch=pathlib.Path(tempfile.mkdtemp(prefix='skillpilot-law479-native-combined-'))
compile_args=['javac','-d',str(scratch),str(merger),str(driver)]
compile_result=subprocess.run(compile_args,text=True,capture_output=True)
execution=None
if compile_result.returncode==0:
 execution=subprocess.run(['java','-cp',str(scratch),'ActualLaw479CombinedProbe'],text=True,capture_output=True)
 if execution.returncode==0:
  merged=json.loads(execution.stdout)
  output=directory/'actual-backend-combined-merged-root-nodes.json'
  with output.open('x') as f:json.dump(merged,f,ensure_ascii=False,indent=2);f.write('\n')
assert all(sha(pathlib.Path(p))==digest for p,digest in before.items())
receipt={'role':'actual_native_backend_combined_merger_execution_on_inert_current_inputs',
 'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'actualBackendSource':str(merger.relative_to(root)),'actualBackendSourceSha256':sha(merger),
 'actualGeneratedInputAdapterPath':str(driver.relative_to(root)),'actualGeneratedInputAdapterSha256':sha(driver),
 'actualInputHashes':before,'compileCommand':compile_args,'compileExitCode':compile_result.returncode,
 'compileStdout':compile_result.stdout,'compileStderr':compile_result.stderr,
 'executionCommand':['java','-cp',str(scratch),'ActualLaw479CombinedProbe'],
 'executionExitCode':execution.returncode if execution else None,
 'executionStderr':execution.stderr if execution else None,'activeAndCandidateBytesPreserved':True,
 'nativeMergedOutputPath':str(output.relative_to(root)) if execution and execution.returncode==0 else None,
 'nativeMergedOutputSha256':sha(output) if execution and execution.returncode==0 else None,
 'actualCompiledBackendClassSha256':sha(scratch/'com/skillpilot/backend/composition/CourseProfileCompositionViewMerger.class') if compile_result.returncode==0 else None,
 'scopeApprovalClaimed':False,'privateLearnerOrSessionAccessed':False,'activeWrites':0,'humanApprovalClaimed':False}
with (directory/'actual-backend-combined-merger-execution.receipt.json').open('x') as f:json.dump(receipt,f,ensure_ascii=False,indent=2);f.write('\n')
if compile_result.returncode or not execution or execution.returncode:raise RuntimeError(json.dumps(receipt))
print('Actual current backend Java21 merger compiled/executed PASS; native whole merged roots preserved for separate target-union check. No runtime source writes or host acceptance claimed.')
