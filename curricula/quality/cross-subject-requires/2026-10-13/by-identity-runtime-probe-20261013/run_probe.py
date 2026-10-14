import pathlib,json,shutil,hashlib,subprocess,datetime
repo=pathlib.Path.cwd(); out=repo/'tmp/cross-subject-requires/by-identity-runtime-probe-20261013'; fixtures=out/'fixtures'; fixtures.mkdir(exist_ok=True)
schools=['Berufsoberschule','Fachoberschule','Grundschule','Mittelschule','Realschule','Wirtschaftsschule']
receipts=[]
def copy(src,base,dest=None):
 target=base/(dest or src.relative_to(repo/'curricula'));target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,target)
 receipts.append({'source':str(src.relative_to(repo)),'destination':str(target.relative_to(repo)),'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'bytes':src.stat().st_size})
by=fixtures/'all-six-by-schools'
for school in schools:
 for src in sorted((repo/'curricula/DE/BY'/school).glob('*.json')):copy(src,by)
 copy(repo/'curricula/DE/BY'/f'DE_BY_{school}_Overview.json',by)
copy(repo/'curricula/curriculum_manifest.json',by)
evidence=fixtures/'actual-global-quality-only'
for src in sorted((repo/'curricula/quality').rglob('*.json')):copy(src,evidence)
fossolo=fixtures/'fos-only'
for subject in ['Mathematik','Physik']:copy(repo/'curricula/DE/BY/Fachoberschule'/f'{subject}.json',fossolo)
copy(repo/'curricula/DE/BY/DE_BY_Fachoberschule_Overview.json',fossolo)
synthetic=fixtures/'synthetic-exact-fos-under-global-quality'
copy(repo/'curricula/DE/BY/Fachoberschule/Mathematik.json',synthetic,pathlib.Path('quality/identity-probe/exact-fos-math.json'))
synthetic_collision=fixtures/'synthetic-exact-fos-quality-with-active-bos'
copy(repo/'curricula/DE/BY/Berufsoberschule/Mathematik.json',synthetic_collision)
copy(repo/'curricula/DE/BY/Fachoberschule/Mathematik.json',synthetic_collision,pathlib.Path('quality/identity-probe/exact-fos-math.json'))
code=r'''
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.*;
import java.util.*;
import java.nio.file.*;
public class ByIdentityProbe {
 public static void main(String[] args) throws Exception {
  ObjectMapper mapper = new ObjectMapper(); List<Object> results = new ArrayList<>();
  for (String path: args) {
   LandscapeProperties props=new LandscapeProperties(); props.setDirectory(path);
   LandscapeService service=new LandscapeService(props,mapper); Map<String,Object> result=new LinkedHashMap<>();
   result.put("fixture",path);result.put("landscapeCount",service.getAll().size());
   Map<String,Object> landscapes=new LinkedHashMap<>();
   for(String id:List.of("c1600692-e543-5cf2-a399-6bd96e6b817f","42c2f7e3-91b4-5de8-bef0-d563440e9d52")) {
    SkillLandscape l=service.getById(id);Map<String,Object> info=new LinkedHashMap<>();
    info.put("present",l!=null);if(l!=null){info.put("title",l.getTitle());info.put("schoolType",l.getSchoolType());info.put("goalCount",l.getGoals().size());}landscapes.put(id,info);
   }result.put("byId",landscapes);
   Map<String,Object> goals=new LinkedHashMap<>();
   for(String id:List.of("43e2025f-f393-5a41-aa42-ecb3b6ca35b8","227e6105-30d6-5eca-9266-ab330fa661e3","b3bc3211-893c-50d4-ac60-7bff9dce5d3c","9e1bc5d5-d2e8-56f7-97fe-655539656de7")){
    LearningGoal g=service.getGoalDefinition(id);Map<String,Object> info=new LinkedHashMap<>();info.put("present",g!=null);info.put("landscapeId",service.getLandscapeIdForGoal(id));if(g!=null)info.put("title",g.getTitle());goals.put(id,info);
   }result.put("getGoalDefinition",goals);
   for(String root:List.of("b0f776f2-7288-51cb-9416-3383e2ccf268","4a1e367e-3c03-5ad3-a2ff-be60bb5e499b"))result.put("closure:"+root,service.getClosure(root).stream().map(l->Map.of("landscapeId",l.getLandscapeId(),"title",l.getTitle())).toList());
   results.add(result);
  }
  System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(results));
 }
}
'''
(out/'ByIdentityProbe.java').write_text(code)
base=repo/'tmp/backend-ci-build-2424356/classes/java/main';cache=pathlib.Path('/home/enpasos/.gradle/caches/modules-2/files-2.1')
patterns=['com.fasterxml.jackson.core/jackson-databind/2.21.5/*/*.jar','com.fasterxml.jackson.core/jackson-core/2.21.5/*/*.jar','com.fasterxml.jackson.core/jackson-annotations/2.21/*/*.jar','org.springframework/spring-core/7.0.9/*/*.jar','org.slf4j/slf4j-api/2.0.18/*/*.jar']
jars=[p for pattern in patterns for p in cache.glob(pattern)]
cp=':'.join(map(str,[out,base,*jars]));jdk=repo/'tmp/ci-tools/amazon-corretto-25.0.2.10.1/bin'
compile=subprocess.run([str(jdk/'javac'),'-cp',cp,'-d',str(out),str(out/'ByIdentityProbe.java')],capture_output=True,text=True)
(out/'javac.log').write_text(compile.stdout+compile.stderr);compile.check_returncode()
run=subprocess.run([str(jdk/'java'),'-cp',cp,'ByIdentityProbe',str(by),str(fossolo),str(evidence),str(synthetic),str(synthetic_collision)],capture_output=True,text=True)
(out/'probe.stdout.json').write_text(run.stdout);(out/'probe.stderr.log').write_text(run.stderr)
meta={'scope':'LOCAL ACTUAL LANDSCAPESERVICE CLASS PROBE, NOT PACKAGE OR HOST ACCEPTANCE','timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'classFile':str(base/'com/skillpilot/backend/landscape/LandscapeService.class'),'classSha256':hashlib.sha256((base/'com/skillpilot/backend/landscape/LandscapeService.class').read_bytes()).hexdigest(),'classSourceSha256':hashlib.sha256((repo/'backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java').read_bytes()).hexdigest(),'exitCode':run.returncode,'files':receipts,'dependencies':[{ 'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in jars]}
(out/'probe-inputs.json').write_text(json.dumps(meta,indent=2)+'\n')
run.check_returncode();print(json.dumps([{'fixture':r['fixture'].split('/')[-1],'landscapeCount':r['landscapeCount'],'math':r['byId']['c1600692-e543-5cf2-a399-6bd96e6b817f'],'fosMathPresent':r['getGoalDefinition']['43e2025f-f393-5a41-aa42-ecb3b6ca35b8']['present']} for r in json.loads(run.stdout)],indent=2))
