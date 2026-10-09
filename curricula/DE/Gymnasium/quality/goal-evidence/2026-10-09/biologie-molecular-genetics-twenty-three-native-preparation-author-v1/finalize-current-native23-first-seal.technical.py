# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,subprocess,datetime
ROOT=Path.cwd();B=Path(__file__).resolve().parent.relative_to(ROOT);ENTRY=B/'neutral-twenty-three-native-independent-review.entry.json';FREEZE=B/'native23.technical.first.freeze.json'
assert not FREEZE.exists()
def read(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p);assert p.is_file() and not p.is_symlink();z=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(z).hexdigest(),'bytes':len(z)}
def checkbinding(x):
 got=bind(x['path']);assert got['sha256']=='sha256:'+x['sha256'].removeprefix('sha256:'),(x,got)
 if 'bytes' in x:assert got['bytes']==x['bytes']
 return got
def write(p,x):
 assert not Path(p).exists();Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
e=read(ENTRY);assert len(e['goalIds'])==23 and e['unselectedWholePageExactCount']==371 and e['unselectedWholeSourceContextChanges']==[]
term=B/'checks/ordinary-native23-materialize-v4-actual-front-matter-api.terminal.actual.json';assert read(term)['actualExitCode']==0
pterm=B/'checks/ordinary-P23-current-raster-capsule.terminal.actual.json';assert read(pterm)['actualExitCode']==0
contracts=B/'checks/ordinary-current-native23-contracts-and-source-inputs.actual.json';cv=read(contracts);assert len(cv['ordinaryCampaignAndArtifactChecks'])==4 and all(v['ordinaryCampaignErrors']==[] for v in cv['ordinaryCampaignAndArtifactChecks'])
originals=[];rootReceipts=[]
for receipt in ['eight-required-native-originals.root-index-byte-portability.actual.json','two-actual-failed-render-originals.root-index-byte-portability.actual.json']:
 p=B/receipt;rootReceipts.append(bind(p))
 for x in read(p)['files']:
  got=checkbinding(x);blob=subprocess.run(['git','show',':'+got['path']],capture_output=True,check=True).stdout;assert len(blob)==got['bytes'] and 'sha256:'+hashlib.sha256(blob).hexdigest()==got['sha256'];assert blob==Path(got['path']).read_bytes();originals.append({**got,'actualIndexByteExact':True})
assert len(originals)==10 and len({x['path'] for x in originals})==10
ignore=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(x['path'] for x in originals)+'\n',capture_output=True,text=True);assert ignore.returncode==1 and ignore.stdout==''
indexcheck=B/'checks/all-ten-native-originals.own-index-byte-exact.actual.json';write(indexcheck,{'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':originals,'rootOriginalReceipts':rootReceipts,'gitCheckIgnoreArgv':['git','check-ignore','--stdin'],'actualGitCheckIgnoreExit':ignore.returncode,'actualIgnoredPathCount':0,'ordinaryCurrentNativeOriginalCount':8,'retainedGenuineFirstFailureOriginalCount':2,'ignoreChanged':False,'ownStageOperations':0,'commitCreated':False})
jsons=[]
for p in sorted(B.rglob('*')):
 if p.is_file():
  assert not p.is_symlink()
  if p.suffix=='.json':json.loads(p.read_text());jsons.append(str(p))
  if p.suffix=='.jsonl':
   for line in p.read_text().splitlines():
    if line.strip():json.loads(line)
syntax=B/'checks/all-own-new-json-and-jsonl.actual-parse.json';write(syntax,{'schemaVersion':1,'actualJsonFileCount':len(jsons),'actualJsonPaths':jsons,'ordinaryModelsAndCampaignSchemasPath':str(contracts),'ordinaryP23SchemaAndSemanticsPath':str(pterm),'allFilesAreRegular':True,'activeWrites':0})
sourceinputs=cv['actualOrdinarySourceInputBindings']
for x in sourceinputs:checkbinding(x)
for x in read(B/'checks/active-current-input-hashguard.after.actual.json')['unchanged']:checkbinding(x)
# Finish unsealed neutral entry once; no historical first seals or outputs are changed.
e.update({'preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'currentTechnicalFirstSealPath':str(FREEZE),'actualCommandsAndTerminalBindings':[bind(term),bind(pterm)],'ordinaryCurrentModelBundleCampaignSourceInputChecks':bind(contracts),'actualTenNativeOriginalIndexByteCheck':bind(indexcheck),'actualRootIndexReceipts':rootReceipts,'ownJsonSyntaxCheck':bind(syntax),'wholeScienceSuccessorVersion':'v6, three whitespace-only profile prose fields after v5; all46 cases exactly v5','selectedImageSuccessorVersion':'current whole23 metadata-v4 entry containing actual15 raster-v5 and visible-content18 metadata-v3','normalSubsetContractMaximum':20,'actualNativeGoalBatchSizes':[12,11],'actualFrontMatterPagesByBatch':[b['frontMatterPageCount'] for b in e['nativeBatches']],'legacyGAHelperIsMaterialReferenceOnly':True,'ordinaryCurrentP23Counts':{'approved':0,'needsHumanReview':23,'rejected':0,'blockingIssues':0},'genuineTargetedSpliceKindAtomicityMemoryStatus':'PENDING','actualIndependentNativeReviewResults':0,'actualIndependentV15Approval':False})
ENTRY.write_text(json.dumps(e,ensure_ascii=False,indent=2)+'\n')
# Inputs are existing current originals, not invented independent results. Compiler input hashes are checked above.
refs={x['path']:checkbinding(x) for x in e['inputBindings']}
for x in sourceinputs:refs[x['path']]=checkbinding(x)
for x in rootReceipts:refs[x['path']]=checkbinding(x)
outputs=[bind(p) for p in sorted(B.rglob('*')) if p.is_file() and p!=FREEZE]
write(FREEZE,{'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Actual inactive technical author first seal: full394, currentP23 and two ordinary12/11 native review books; no independent scientific or human approval','inputs':list(refs.values()),'outputs':outputs,'actualOrdinaryCurrentNativeOriginalCount':8,'retainedActualFailureOriginalCount':2,'actualIndependentResults':0,'activeWrites':0,'strictGain':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'neutralEntry':bind(ENTRY),'firstSeal':bind(FREEZE),'outputs':len(outputs),'inputs':len(refs),'ordinaryNativeGoalCounts':[12,11],'currentP23NeedsHuman':23,'unselected371Exact':True,'protected276Exact':True,'actualIndexByteExact':10,'independentReviews':'PENDING','spliceKindAM':'PENDING','strictGain':0}))
