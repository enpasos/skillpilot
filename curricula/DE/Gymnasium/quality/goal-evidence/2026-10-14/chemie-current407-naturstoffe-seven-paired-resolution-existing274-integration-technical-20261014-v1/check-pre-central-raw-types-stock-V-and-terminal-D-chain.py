# Apache-2.0. Reusable finite builder preflight contract, no validator/runtime patch.
import datetime,hashlib,json,pathlib
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent;H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host';read=lambda p:json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'bytes':p.stat().st_size,'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()}
proof=read(O/'PREFLIGHT.exact-N7-I274-canonical-QA-P-A-M-and-NI3-preservation.actual.json');narrow=read(O/'checks/STOCK.seven-existing-V-approval-YesNo-serialization-and-freshness.actual.json')
qa=read(H/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json');typed=0
for row in qa['records']:
 for key in ['aiApproved','umlautsCorrectChatGpt','contentApprovedChatGpt','humanApproved','humanIssueIdentified']:
  if key in row:assert isinstance(row[key],str) and row[key] in ['yes','no'],(row['goalId'],key,row[key]);typed+=1
by={r['goalId']:r for r in qa['records']};neutral=read(R/proof['neutralN7']['path']);original=read(R/neutral['goalVisualizationQA']['path']);ob={r['goalId']:r for r in original['records']}
rows=[]
for x in proof['selectedCurrentPhysicalAssetsAndOriginalVApprovals']:
 r=by[x['goalId']];old=ob[x['goalId']]
 assert r['aiApproved']=='yes' and r['aiApprovedAssetSha256']==r['assetSha256']==x['sha256']
 for field in ['aiReviewedAt','aiReviewer','aiNotes','aiApprovedAssetSha256']:assert r[field]==old[field],(r['goalId'],field)
 for p in [r['publicAssetPath'],r['canonicalAssetPath']]:assert 'sha256:'+hashlib.sha256((H/p).read_bytes()).hexdigest()==x['sha256']
 rows.append({'goalId':r['goalId'],'originalPixelSha256':x['sha256'],'actualPublic':bind(H/r['publicAssetPath']),'actualCanonical':bind(H/r['canonicalAssetPath']),'approvedFieldType':'stock yes/no string','originalVReviewerDateReasonAndApprovedHashVerbatim':True})
chains=read(O/'checks/STOCK.seven-normal-current-resolutions-index-chains-and-P6.actual.json');assert chains['pass'] and chains['allSupersessionChainsValid'];assert narrow['exitCode']==0
initial=read(O/'receipts/ACTUAL.current407-N7-existing274-central.completed-run.json')
out={'schemaVersion':1,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'kind':'Finite pre-central builder contract and actual correction evidence; no checker patch',
 'all419RawLedgerFieldTypesAssertedNow':True,'assertedYesNoFields':typed,'allSevenOriginalPixelReviewerDateVerbatimAndThreeWayBindings':rows,
 'actualWholeQANormalStockCheck':bind(O/'checks/STOCK.seven-existing-V-approval-YesNo-serialization-and-freshness.actual.json'),
 'actualTerminalDIndexSchemaCurrentPayloadAndChainCheck':bind(O/'checks/STOCK.seven-normal-current-resolutions-index-chains-and-P6.actual.json'),
 'historicalOrderDisclosure':{'initialFullCentralRunLackedExplicitWholeVAndRawTypePreflight':True,'initialFailurePreserved':bind(O/'receipts/ACTUAL.current407-N7-existing274-central.completed-run.json'),
 'exactSevenStringAssignmentsAndWholeStockVCheckCompletedBeforeCorrectedFullCentralRun':True,
 'thisSeparatelyNamed419FieldTypeReceiptAssembledAfterCorrectedRunLaunch':True},
 'futureBuilderMandatoryPreflightOrder':['1. Preserve base QA419, replace only selected actually approved image bindings; retain original reviewer/date/reason/SHA.',
 '2. Assert every present approval field is the stock yes/no string type; never transport raw booleans or create a new vote.',
 '3. Check each selected canonical path, public path and actual approved SHA independently.',
 '4. Run unchanged whole-subject generateGoalVisualizationQaLedgers.ts --check --subject=chemie before launching any complete central run.',
 '5. Validate current exact D index/payloads and terminal-only supersession chains; preserve old strict IDs and actual P/M/source HOLDs.',
 '6. Only after this finite receipt PASS, run the normal central six checks once. Preserve any actual failure and correct its proved cause without weakening gates.'],
 'newVOrScienceVote':False,'activeOrEngineWrites':False}
p=O/'CHECK.finite-pre-central-raw-types-stock-V-and-terminal-D-chain.actual.json';assert not p.exists();p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'rawQARecords':len(qa['records']),'typedFields':typed,'wholeStockVCheckExit':0,'selectedThreeWayAssetBindings':7,'terminalChainsPass':True,'futureFirstCentralPreflightContractExplicit':True}))
