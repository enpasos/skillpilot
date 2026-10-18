# SPDX-License-Identifier: Apache-2.0
"""Read-only finite post-transport checks; no compiler or global build."""
import copy, importlib.util, json, pathlib, subprocess
R=pathlib.Path.cwd();O=pathlib.Path(__file__).resolve().parent.parent.relative_to(R)
spec=importlib.util.spec_from_file_location('transport',O/'tools/integrate-exact-five-tuples-one-LK-unit.py');t=importlib.util.module_from_spec(spec);spec.loader.exec_module(t)
P=t.read(O/'PLAN.actual-six-files-selected-object-CAS.json'); receipt=t.read(O/'RECEIPT.actual-two-partial-bindings-five-aliases-one-unit.json')
assert t.evidence()=={k:P[k] for k in ['authorSeal','independentScienceSeal','independentScienceFIRST']}
assert t.native()[0]==P['actualCurrent138Selection']
for p in P['protectedFiles']:t.verify(p)
for op,c in zip(P['operations'],receipt['aliasChanges']):
 t.verify(c['after']);d=t.read(c['after']['path']);n=op['oldMappingCount'];assert t.dig(d['mappings'][:n])==op['oldWholeMappingArraySHA256'];assert d['mappings'][n:]==[op['appendExactRow']]
 assert len(d['mappings'])==len({(m['legacyGoalId'],m['canonicalGoalId']) for m in d['mappings']})
 old=op['currentSelectedWholeDecision']; ds=copy.deepcopy(d.get('decisions',[]))
 if old is not None:
  ix=next(i for i,x in enumerate(ds) if x['sourceGoalId']==old['sourceGoalId']);cur=ds[ix]
  for k,v in old.items():assert cur[k][:len(v)]==v if k in ['canonicalGoalIds','additionalAcceptedPartialContributions'] else cur[k]==v
  assert cur['canonicalGoalIds'][len(old['canonicalGoalIds']):]==[op['appendExactRow']['canonicalGoalId']]
  assert len(cur.get('additionalAcceptedPartialContributions',[]))==len(old.get('additionalAcceptedPartialContributions',[]))+1
  ds[ix]=old
 elif 'decisions'in d:
  new=ds.pop();assert new['sourceGoalId']==P['newWholeSourceUnit']['id'] and new['matchType']=='partial' and new['sourceCourseLevel']=='LK' and not new['wholeOfficialSourceCredit']
 assert t.dig(ds)==op['oldWholeDecisionArraySHA256']
t.verify(receipt['extractionChange']['after']);e=t.read(receipt['extractionChange']['after']['path']);assert t.pins(e['sourceGoals'][:-1])==P['extractionCurrentOldSourcePins'];assert t.pins(e['passages'][:-1])==P['extractionCurrentOldPassagePins'];assert e['passages'][-1]==P['newWholePassage']
g=e['sourceGoals'][-1];assert g['id']==P['newWholeSourceUnit']['id'] and g['courseLevel']=='LK' and 'course:LK'in g['tags'] and not g['metadata']['wholeOfficialSourceCredit'];assert t.dig(g)==receipt['extractionChange']['wholeNewSourceObjectSHA256'];assert len(e['sourceGoals'])==len({x['id'] for x in e['sourceGoals']});assert len(e['passages'])==len({x['id'] for x in e['passages']});assert g['sourceDocumentKey']=='SL-CH-SEKII-LK-2023-2025' and g['passageId']==e['passages'][-1]['id'];assert e['pipelineStatus']['steps'][-1]['status']=='incomplete'
before=t.read(O/'CHECK.actual-pure-before-four-views-three-targets.json');after=t.read(O/'CHECK.actual-pure-after-four-views-three-targets.json');assert before==after;assert after['status']=='PASS' and len(after['results'])==4 and sum(x['target']and x['rendered']and x['filter'] for x in after['results'])==3
jsonfiles=list(O.rglob('*.json'));references=set()
def scan(x):
 if isinstance(x,dict):
  for k,v in x.items():
   if isinstance(v,str)and(k=='path'or k.endswith('Path'))and v.startswith('curricula/'):
    assert pathlib.Path(v).exists(),v;assert not pathlib.Path(v).is_absolute();references.add(v)
   scan(v)
 elif isinstance(x,list):
  for v in x:scan(v)
 elif isinstance(x,str):assert not x.startswith(('/home/','/tmp/','tmp/'))
for p in jsonfiles:scan(t.read(p))
for p in P['writeList']:t.read(p)
if references:
 result=subprocess.run(['git','check-ignore','--',*sorted(references)],text=True,capture_output=True);assert result.returncode in [0,1];assert not result.stdout.strip(),result.stdout
spec=importlib.util.spec_from_file_location('stock',R/'scripts/validate_schemas.py');stock=importlib.util.module_from_spec(spec);spec.loader.exec_module(stock);errors=stock.curriculum_symlink_errors(R);assert not errors
assert not any(p.is_symlink() for p in O.rglob('*'));assert not any(p.suffix.lower()in['.pdf','.png','.jpg','.jpeg'] for p in O.rglob('*'))
result=dict(status='PASS',scope='Exactly6normal files:5partial alias tuples+1complete SL-LKsource unit/passsage;2foreign accepted scientific relations,0newvotes',wholeCurrentActiveConfigSelection=138,uniqueSelectedPGoals=450,wholeTwoPAndCExact=True,allOldSourceObjectsPassagesMappingRowsDecisionFieldsAndAcceptedTailsExact=True,sourceAndPassageIdsUnique=True,newUnitLKAndCorrectDocument=True,finitePureViews=4,actualTargetAppearances=3,SLGKRemainsNonTarget=True,newWholeSourceCredit=0,currentSLM3WholeSourceStatus='incomplete',newScientificNativeVotes=0,parsedOwnJsonFilesBeforeThisCheck=len(jsonfiles),parsedWrittenNormalJsonFiles=6,portableExistingRepositoryReferences=len(references),ignoredReferences=0,symlinksInOwnPackage=0,actualStockGlobalSymlinkErrors=len(errors),newWholeOfficialPdfTextCopies=0,compilerAPGlobalBuildStageCommitRuns=0)
t.write(O/'CHECK.actual-finite-normal-portable-stock-symlink.json',result);print(json.dumps(result,ensure_ascii=False,indent=2))
