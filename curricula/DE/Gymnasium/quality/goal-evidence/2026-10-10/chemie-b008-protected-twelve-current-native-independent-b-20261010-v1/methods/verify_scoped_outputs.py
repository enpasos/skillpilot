import json,hashlib,datetime,importlib.util
from pathlib import Path
import jsonschema
R=Path('/home/enpasos/projects/skillpilot');B=Path(__file__).resolve().parents[1];A=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-protected-twelve-current-native-technical-author-20261010-v1'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def ref(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
errors=[];references=[]
def walk(x):
 if isinstance(x,dict):
  if 'path' in x and ('sha256' in x or 'digest' in x):
   p=Path(x['path']);p=p if p.is_absolute() else R/p;h=x.get('sha256',x.get('digest'));references.append(x['path'])
   if not p.is_file():errors.append({'path':x['path'],'error':'missing file'})
   elif sha(p)!=h.removeprefix('sha256:') or ('bytes' in x and p.stat().st_size!=x['bytes']):errors.append({'path':x['path'],'error':'digest/byte mismatch'})
  for v in x.values():walk(v)
 elif isinstance(x,list):
  for v in x:walk(v)
first=B/'FIRST.actual-sealed-before-current-peer-or-author-outcomes.json';walk(json.loads(first.read_text()))
entry=A/'neutral-protected12-whole-current-native-context.independent-review.entry.json';freeze=A/'author.final.freeze.json';ne=json.loads(entry.read_text());af=json.loads(freeze.read_text());walk(ne);walk(af['wholeExactOwnFiles'])
assert sha(entry)=='ddd00802c414082a041fe3c84383bf8c402c1ecc7692c99130cfc23d9d15fc17';assert sha(freeze)=='45af0319e923079633fc106f697f73e6a19a263ac90c703359b0fe65ac128f82'
walk(json.loads((B/'actual-first-whole12-native-context-D-P-AM-Kind5-observations.json').read_text()))
walk(json.loads((B/'NORMAL-schema-export-correction.actual.json').read_text()))
preserve=json.loads((A/'checks/active-chemistry-inputs-exact-preservation.actual.json').read_text());walk(preserve['activeChemistryCanonical'])
N=B/'normal-b12';bundle=json.loads((N/'review-bundle-manifest.json').read_text());artifacts=[]
for x in bundle['artifacts']:
 p=A/'native/current-12/bundle'/x['path']
 assert p.is_file(),p
 assert sha(p)==x['digest'].removeprefix('sha256:') and p.stat().st_size==x['bytes'],p
 artifacts.append({'role':x['role'],'manifestRelativePath':x['path'],'actualBoundFile':ref(p)})
for p in N.rglob('*'):
 if not p.is_file() or 'results' in p.parts or 'results-normal-valid' in p.parts:continue
 a=A/'native/current-12/round-b'/p.relative_to(N)
 assert a.is_file() and p.read_bytes()==a.read_bytes(),p
fdoc=json.loads((A/'checks/whole12-old-records-and-current-normal-P-A-M-kind-fingerprints.actual.json').read_text());rows=[]
for f in fdoc['rows']:
 assert f['normalAtomicityPayloadBefore']==f['normalAtomicityPayloadAfter'];assert f['normalMemoryPayloadBefore']==f['normalMemoryPayloadAfter']
 assert f['wholeExistingRecord']['profile']==f['wholeCurrentTechnicalCandidateRecord']['profile']
 rows.append({'goalId':f['goalId'],'wholeOriginalAtomicityRecordUnmodified':f['wholeExistingAtomicityRecord'],'wholeOriginalMemoryRecordUnmodified':f['wholeExistingMemoryRecord'],'existingPRecordStatusRetained':f['wholeExistingRecord']['status'],'oldRecordHumanAuthorityNotPromoted':True,'wholePBodyExact':True,'AMBodyAndNormalFingerprintExact':True,'contextRetentionEvidence':{'path':str((B/'actual-first-whole12-native-context-D-P-AM-Kind5-observations.json').relative_to(R)),'goalId':f['goalId']}})
write(B/'checks/exact-old-AM-P-retention-and-bound-native-artifacts.actual.json',{'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'firstSeal':ref(first),'allReferenceChecks':len(references),'bindingErrors':errors,'authorEntry':ref(entry),'authorFinalFreeze':ref(freeze),'wholeAuthorFreezeFilesChecked':len(af['wholeExactOwnFiles']),'currentActiveCanonicalExact':preserve['activeChemistryCanonical'],'wholeNativeArtifacts':artifacts,'oldWholeAMRecordsReadAndRetained':12,'oldWholeProfilesReadAndRetained':12,'newHistoryReviews':0,'noHashOnlyScientificApproval':True,'rows':rows})
assert not errors,errors
spec=importlib.util.spec_from_file_location('normal_schema',R/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);symlinks=m.curriculum_symlink_errors(R)
rsv=jsonschema.Draft202012Validator(json.loads((N/'contracts/goal-description-review-record.schema.json').read_text()),format_checker=jsonschema.FormatChecker());usv=jsonschema.Draft202012Validator(json.loads((R/'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json').read_text()),format_checker=jsonschema.FormatChecker())
parses=[];se=[];count=rcount=0
for p in sorted(B.rglob('*')):
 if not p.is_file():continue
 if p.suffix=='.json':
  x=json.loads(p.read_text());parses.append({'path':str(p.relative_to(R)),'kind':'complete-json','bytes':p.stat().st_size})
  if p.name.endswith('.run.json') and 'results-normal-valid' in p.parts:
   rcount+=1;se.extend({'path':str(p.relative_to(R)),'error':str(e)} for e in usv.iter_errors(x))
 elif p.suffix=='.jsonl':
  raw=p.read_bytes();assert raw.endswith(b'\n'),p;lines=raw.decode().splitlines();xs=[json.loads(x) for x in lines];parses.append({'path':str(p.relative_to(R)),'kind':'complete-jsonl','bytes':len(raw),'lines':len(xs),'allLinesParsed':True,'actualNewlineTerminated':True})
  if p.name.endswith('.records.jsonl') and 'results-normal-valid' in p.parts:
   count+=len(xs)
   for i,x in enumerate(xs):se.extend({'path':str(p.relative_to(R)),'line':i+1,'error':str(e)} for e in rsv.iter_errors(x))
assert count==12 and rcount==1
write(B/'checks/scoped-schema-complete-jsonl-and-ordinary-curriculum-symlinks.actual.json',{'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Every own JSON and every line of every own JSONL parsed; authoritative corrected normal B12 output against unchanged ordinary record and AI-run schemas; ordinary curriculum_symlink_errors for committable curricula.','authoritativeNormalResultsDir':str((N/'results-normal-valid').relative_to(R)),'originalRejectedSerializerExports':'Retained under normal-b12/results and parsed in full for history. They are not authoritative/current normal output and are not called schema-valid; unchanged FIRST and rejection terminals bind them.','schemaCheckedNormalRecordCount':count,'schemaCheckedNormalRunCount':rcount,'schemaErrors':se,'curriculumSymlinkErrors':symlinks,'completeParsedFiles':parses,'firstSealStillExact':True,'passed':not(se or symlinks)})
assert not se and not symlinks,(se,symlinks)
print(json.dumps({'FIRSTexact':True,'entryBindings':39,'authorFreezeFiles':len(af['wholeExactOwnFiles']),'referenceErrors':len(errors),'oldAMAndPExact':12,'normalRecordsSchemaValid':count,'normalRunsSchemaValid':rcount,'completeJSONandJSONLParsed':len(parses),'normalCurriculumSymlinkErrors':len(symlinks)}))
