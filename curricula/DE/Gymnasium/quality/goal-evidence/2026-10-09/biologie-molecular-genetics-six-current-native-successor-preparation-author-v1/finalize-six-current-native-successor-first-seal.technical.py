# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,subprocess,datetime,sys,jsonschema
ROOT=Path.cwd();B=Path(__file__).resolve().parent.relative_to(ROOT);ENTRY=B/'neutral-six-native-successor-and-two-case-rubrics.independent-review.entry.json';FREEZE=B/'native-six-successor.technical.first.freeze.json'
assert not FREEZE.exists()
def read(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p);assert p.is_file() and not p.is_symlink();z=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(z).hexdigest(),'bytes':len(z)}
def verify(x):
 z=bind(x['path']);assert z['sha256']=='sha256:'+x['sha256'].removeprefix('sha256:'),(x,z)
 if 'bytes' in x:assert z['bytes']==x['bytes']
 return z
def write(p,x):
 assert not Path(p).exists();Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
e=read(ENTRY);assert len(e['goalIds'])==6 and e['unchangedOriginalNative23TargetPages']==17 and e['unchangedOtherWholePages']==371
terminals=[B/'checks/ordinary-native6-materialize.terminal.actual.json',B/'checks/ordinary-P23-current-raster-successor-capsule.terminal.actual.json',B/'checks/ordinary-P1-current-raster-successor-capsule.terminal.actual.json']
for p in terminals:assert read(p)['actualExitCode']==0
contracts=B/'checks/ordinary-current-native6-contracts-and-source-inputs.actual.json';cv=read(contracts);assert len(cv['ordinaryCampaignAndArtifactChecks'])==2 and all(v['ordinaryCampaignErrors']==[] for v in cv['ordinaryCampaignAndArtifactChecks'])
req=read(B/'four-required-native-originals.exact-for-root-index-request.json');originals=[]
for x in req['files']:
 got=verify(x);blob=subprocess.run(['git','show',':'+got['path']],capture_output=True,check=True).stdout;assert blob==Path(got['path']).read_bytes() and len(blob)==got['bytes'] and 'sha256:'+hashlib.sha256(blob).hexdigest()==got['sha256'];originals.append({**got,'actualIndexByteExact':True})
assert len(originals)==4
rootReceipt=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-molecular-genetics-current-bounded-pairing-root-v2/native-six-four-originals.own-index-byte-exact.actual.json');rootBinding=bind(rootReceipt)
index=B/'checks/four-native-originals.own-index-byte-exact.actual.json';write(index,{'files':originals,'rootReceipt':rootBinding,'ownStageOperations':0,'ignoreChanged':False,'commitCreated':False})
# Normal canonical schema; no custom exception or validator relaxation.
schema=Path('docs/landscape-runtime.schema.json');jsonschema.validate(read(e['candidateCanonicalPath']),read(schema));canonicalSchema=B/'checks/ordinary-current479-canonical-schema.actual.json';write(canonicalSchema,{'ordinarySchema':bind(schema),'candidateCanonical':bind(e['candidateCanonicalPath']),'errors':[],'actualExitCode':0,'customExceptions':False})
sys.path.insert(0,'scripts');import validate_schemas
errors=validate_schemas.curriculum_symlink_errors(ROOT);assert errors==[];symlinkCheck=B/'checks/ordinary-curriculum-symlink-check.actual.json';write(symlinkCheck,{'api':'scripts.validate_schemas.curriculum_symlink_errors','errors':errors,'actualExitCode':0,'filenameExceptions':False})
paths=[];jsons=[];jsonls=[]
for p in sorted(B.rglob('*')):
 if p.is_file():
  assert not p.is_symlink();paths.append(str(p))
  if p.suffix=='.json':json.loads(p.read_text());jsons.append(str(p))
  if p.suffix=='.jsonl':
   for line in p.read_text().splitlines():
    if line.strip():json.loads(line)
   jsonls.append(str(p))
ignore=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(paths)+'\n',capture_output=True,text=True);assert ignore.returncode==1 and ignore.stdout==''
syntax=B/'checks/all-own-JSON-JSONL-and-normal-portability.actual.json';write(syntax,{'actualJSONPaths':jsons,'actualJSONLPaths':jsonls,'allOwnFilesRegular':True,'gitCheckIgnoreArgv':['git','check-ignore','--stdin'],'actualGitCheckIgnoreExit':1,'actualIgnoredPathCount':0,'ordinarySchemaPath':str(canonicalSchema),'ordinarySymlinkCheckPath':str(symlinkCheck),'capsuleOnlyOutsideCurricula':True,'actualStageOperations':0,'activeWrites':0})
for x in cv['actualOrdinarySourceInputBindings']:verify(x)
for x in read(B/'checks/active-current-input-hashguard.after.actual.json')['unchanged']:verify(x)
e.update({'preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'currentTechnicalFirstSealPath':str(FREEZE),'actualFullCurrentActiveModelPath':cv['actualFullCurrentActiveModelPath'],'actualCommandsAndTerminalBindings':[bind(p) for p in terminals],'ordinaryCurrentModelBundleCampaignSourceInputChecks':bind(contracts),'actualFourNativeOriginalIndexByteCheck':bind(index),'actualRootIndexReceipt':rootBinding,'ownJSONAndPortabilityCheck':bind(syntax),'ordinaryCanonicalSchemaCheck':bind(canonicalSchema),'ordinarySymlinkCheck':bind(symlinkCheck),'wholeScienceSuccessorVersion':'v7: exactly two English Karyogram case rubric whitespace fields; all23 whole profiles and all23 whole goals exact v6','selectedImageSuccessorVersion':'six actual targeted PNG successors; all17 unselected wholeimageentries literal exact predecessor','normalSubsetContractMaximum':20,'actualNativeGoalBatchSizes':[6],'ordinaryCurrentP23Counts':{'approved':0,'needsHumanReview':23,'rejected':0,'blockingIssues':0},'ordinaryKaryogramLiteralP1ReuseCounts':{'approved':0,'needsHumanReview':1,'rejected':0,'blockingIssues':0},'genuineSpliceKindAMStatus':'No new scientific decision by technical author; original genuine targeted confirmations remain separate','actualIndependentNativeReviewResults':0,'actualIndependentCurrentSixVResultsRead':False,'karyogramExternalCasesCurrentExplicitBinding':True,'karyogramOrdinaryGoalProfileResourceFingerprintsAffected':False})
ENTRY.write_text(json.dumps(e,ensure_ascii=False,indent=2)+'\n')
refs={x['path']:verify(x) for x in e['inputBindings']}
for x in cv['actualOrdinarySourceInputBindings']:refs[x['path']]=verify(x)
refs[rootBinding['path']]=rootBinding
for f in ['goalBookSourceAtlasInputs.ts','goalBookModel.ts','materializeGoalDescriptionRolloutBatch.ts','goalBookRenderer.ts','exportGoalBookReviewBundle.ts','createGoalDescriptionReviewCampaign.ts','validateGoalDescriptionReviewCampaign.ts','positiveGoalEvidenceProfileModel.ts']:
 p=Path('app/scripts')/f;refs[str(p)]=bind(p)
outputs=[bind(p) for p in sorted(B.rglob('*')) if p.is_file() and p!=FREEZE]
write(FREEZE,{'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Actual inactive technical first seal: full current394, targeted6 native pages, currentP23 and exact P1 reuse, no scientific or human approval','inputs':list(refs.values()),'outputs':outputs,'actualOrdinaryNativeOriginalCount':4,'actualIndependentResults':0,'currentVResultsRead':False,'activeWrites':0,'strictGain':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'neutralEntry':bind(ENTRY),'firstSeal':bind(FREEZE),'outputs':len(outputs),'inputs':len(refs),'ordinaryNativeGoalPages':6,'ordinaryPhysicalPages':e['physicalPageCount'],'currentP23NeedsHuman':23,'literalP1NeedsHuman':1,'other17Native23Exact':True,'other371WholePagesExact':True,'protected276Exact':True,'actualIndexByteExact':4,'independentReviews':'PENDING','strictGain':0}))
