# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,subprocess,importlib.util,jsonschema,shutil
from referencing import Registry,Resource
R=pathlib.Path('/home/enpasos/projects/skillpilot');P=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-stoffwechsel-eight-current335-inactive-integration-technical-20261010-v1');V=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-stoffwechsel-eight-two-findings-current-raster-native-technical-successor-20261010-v3')
def ref(p):b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def read(p):return json.loads((R/p).read_text())
def put(p,x):(R/P/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
ep=P/'neutral-inactive-integration.pre-B.entry.json';e=read(ep);rows=[json.loads(l) for l in (R/P/'positive/eight-current-raster.P.exact.jsonl').read_text().splitlines() if l.strip()];assert len(rows)==8
for r in rows:assert r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' and r['reviewId']=='biologie-stoffwechsel-eight-whole-material-author-candidate-v1',r['goalId']
e['historicalStandaloneSupportStatusMetadataCorrection']={'source':'Explicit root instruction; standalone support records are historical, not operative P or the fresh ordinary B campaign','historicalNamespaceDiagnosticOnly':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-stoffwechsel-eight-independent-b-current-native-review-20261010-v1','actualHistoricalMetadataIssue':'Standalone FIRST/FOLLOWUP swap the two metadata labels: status=ai_candidate and reviewAuthority=needs_human_review. These support metadata labels are incorrect; their immutable science/review records and seals are retained.','actualOperativePStatus':'needs_human_review','actualOperativePReviewAuthority':'ai_candidate','actualOperativePLevel':'E1','actualOperativePMaximumClaimScope':'G1','actualOperativePReviewId':'biologie-stoffwechsel-eight-whole-material-author-candidate-v1','humanApproval':False,'approved':0,'operativeExactP8':ref(P/'positive/eight-current-raster.P.exact.jsonl'),'historicalSealsEdited':False,'freshOrdinaryB':'PENDING; no historical B judgment is substituted or generated'};e['actualNormalPreBTerminals']=[ref(f.relative_to(R)) for f in sorted((R/P/'terminal').glob('*.terminal.actual.json'))];e['failedMCheckTruthfulCorrection']={'first':ref(P/'terminal/M394-exact-inactive-normal-check.terminal.actual.json'),'successfulCorrection':ref(P/'terminal/M394-exact-inactive-normal-check-capsule-inputs-completed.terminal.actual.json'),'exactInputCopies':ref(P/'checks/actual-M394-selective-capsule-input-completion.json'),'scientificEdits':[]};put('neutral-inactive-integration.pre-B.entry.json',e)
shutil.copyfile(pathlib.Path(__file__),R/P/'technical-check-inactive-pre-B.py')
spec=importlib.util.spec_from_file_location('normal_validate',R/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);runtime=read(pathlib.Path('docs/landscape-runtime.schema.json'));reg=Registry();schemas={}
for base in ['contracts','docs']:
 for f in (R/base).rglob('*.schema.json'):
  x=json.loads(f.read_text());sid=x.get('$id')
  if sid:reg=reg.with_resource(sid,Resource.from_contents(x));schemas[sid]=x
count=closed=jsonl=0
for f in sorted((R/P).rglob('*')):
 if not f.is_file():continue
 assert not f.is_symlink(),f
 if f.suffix=='.json':
  assert m.validate_file(str(f),runtime),f;count+=1;x=json.loads(f.read_text())
  if x.get('$schema') in schemas:s=schemas[x['$schema']];jsonschema.validators.validator_for(s)(s,registry=reg).validate(x);closed+=1
 if f.suffix=='.jsonl':
  for l in f.read_text().splitlines():
   if l.strip():json.loads(l);jsonl+=1
external=read(V/'inputs/all-current-portable-external-bindings.exact.json')['bindings'];paths=[f.relative_to(R) for f in (R/P).rglob('*') if f.is_file()]+[pathlib.Path(x['path']) for x in external];ignored=subprocess.run(['git','check-ignore','--stdin'],cwd=R,input='\n'.join(map(str,paths))+'\n',capture_output=True,text=True);assert ignored.returncode==1,ignored.stdout;err=m.curriculum_symlink_errors(R);assert not err,err
for x in read(P/'inputs/current-active-write-guards.exact.json')['files']:assert ref(pathlib.Path(x['path']))==x,x['path']
put('checks/normal-pre-B-targeted-schema-and-portability.actual.json',{'schemaVersion':1,'normalJSONParsed':count,'closedSchemasValidated':closed,'normalJSONLParsed':jsonl,'normalCurriculumSymlinkErrors':err,'requiredIgnoredPaths':[],'activeWriteGuardsUnchanged':True,'independentBRead':False,'dualRoundResolutionGenerated':False,'humanApproval':False,'strictGain':0})
print(json.dumps({'entry':ref(ep),'normalJSON':count,'closedSchemas':closed,'JSONLrecords':jsonl,'operativePStatus':'needs_human_review','operativePReviewAuthority':'ai_candidate','M394After4ExactCapsuleDeckCopies':'PASS','A394':'PASS','P8':'PASS','B':'PENDING','dualResolution':'NOT_GENERATED','activeWrites':[]}))
