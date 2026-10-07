import datetime,hashlib,json,pathlib
root=pathlib.Path('/home/enpasos/projects/skillpilot');base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
own=base+'chemie-current-fifteen-native-d-independent-b-v1/';author=base+'chemie-current-atomic-description-positive-gap-author-v1/'
folder=root/own;inputs={}
def add(item,role):
 p=item['path'];b=(root/p).read_bytes();current=hashlib.sha256(b).hexdigest();expected=item['sha256'].replace('sha256:','')
 assert current==expected and len(b)==item['bytes'],f'Actual reviewed input drift: {p}'
 if p not in inputs:inputs[p]=dict(path=p,sha256=current,bytes=len(b),roles=[])
 if role not in inputs[p]['roles']:inputs[p]['roles'].append(role)
for file,key,role in [('native-current378-national359-subset15.actual.json','allActualInputs','unchanged-native-model/source-atlas-input'),('actual-author-freeze-and-material-bindings.independent-b.json','actualInputs','allowed-author-input-byte-verification/material-binding'),('actual-html-dom-and-image-bindings.independent-b.json','actualInputs','actual-local-browser-render-input')]:
 for item in json.loads((folder/file).read_text())[key]:add(item,role)
extra=[('AGENTS.md','actual-current-repository-instructions'),('/home/enpasos/.codex/attachments/b77af694-ca1d-42ad-a722-1a0b77a18fe8/goal-objective.md','actual-task-objective')]
extra += [(p,'unchanged-native-review/helper-contract')for p in ['app/scripts/validateGoalDescriptionReviewCampaignResults.ts','app/scripts/goalBookModel.ts','app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/goalBookRenderer.ts','app/scripts/createGoalDescriptionReviewCampaign.ts']]
extra += [(base+'biologie-q1-carrier-hidden-continuity-native-d-independent-b-v3/'+p,'own-historical-native-format-reference-only')for p in ['results/independent-b.batch-001.run.json','materialize-current-v5-d.independent-b.py','inspect-current-html.independent-b.mjs']]
for p,role in extra:
 b=(root/p).read_bytes();add(dict(path=p,sha256=hashlib.sha256(b).hexdigest(),bytes=len(b)),role)
resultDir=folder/'results';records=[json.loads(line)for line in next(resultDir.glob('*.records.jsonl')).read_text().splitlines()]
assert len(records)==15 and all(r['recordStatus']=='candidate'and r['reviewAuthority']=='ai_candidate'for r in records)
counts={d:sum(r['decision']==d for r in records)for d in ['keep','revise','split_review','block']};assert counts==dict(keep=11,revise=3,split_review=0,block=1)
validator=json.loads((folder/'native-d-validator.actual.json').read_text());assert validator['actualExitCode']==0
inputBindings={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualFinalRereadAllInputsMatch':True,'inputCount':len(inputs),'files':list(inputs.values()),'physicallyReadPrimaryOriginalPDFs':[dict(path='curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf',physicalPages=[36,38,39,42],printedPages=[36,38,39,42])],'otherOriginalPDFHashesDoNotMeanScientificWholeDocumentReview':True,'onlyRoundBRead':True,'PAuthorStageIncluded':False,'noPeerReviewPayloadRead':True}
(folder/'actual-final-read-inputs.independent-b.json').write_text(json.dumps(inputBindings,indent=2)+'\n')
output=[]
freezeName='native-d-fifteen.independent-b.final.freeze.json'
for p in sorted(folder.rglob('*')):
 if p.is_file()and p.name!=freezeName:
  assert not p.is_symlink(),f'Own final output is not a real file: {p}'
  b=p.read_bytes();output.append(dict(path=str(p.relative_to(root)),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b)))
freeze={'stageId':'chemie-current-fifteen-native-d-independent-b-v1','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Independent blind B actual native D final-stage evidence; AI candidate only','authorStageFreeze':dict(path=author+'native-d-stage-v1.final.freeze.json',sha256='67643647266f6dbb6661e7b4e6636e509694bd6215d8976c9730ecc1af16adbf'),'bundleFingerprint':'sha256:514d7a65c530e3b65f46bab5c063de3197a42188235d269453d335c5815ab8f8','reviewInputFingerprint':'sha256:2c0ab860698a441cef6893f1ca28aa12c6fc322e9b9c8200380e120f59745180','actualCurrentNativeCounts':dict(canonical378=378,national359=359,reviewedSubset15=15,physicalSubsetPDFPages=17),'sourceAtlas48ScopesAnd496UnresolvedDecisionsNotClosed':True,'scopeGoalIds':[r['goalId']for r in records],'nativeDecisions':counts,'reusableUnchangedNativeDKeepGoalIds':[r['goalId']for r in records if r['decision']=='keep'],'threeLocalBilingualTextCorrections':[r['goalId']for r in records if r['decision']=='revise'],'blockedActualAromaticPageGoalId':'b8d3b453-d638-5518-aab0-d84ec2e8567c','genericHalogenTextKeepAndBoundedOrganicSourcePageHoldPreserved':True,'originalUnsealedOwnHalogenBlockWorkStatePreservedSeparately':True,'actualWholeBilingualTextsPersonallyReviewed':True,'actualHTMLAll15PagesViewed':True,'actualPDFAll17PhysicalPagesViewed':True,'actualAll15OriginalAndEmbeddedImageBindingsVerified':True,'nativeCampaignValidatorExitCode':0,'validatorPassIsNotScientificApprovalOfOpenFindings':True,'wholeOriginalSourceCoverage':False,'allNationalCourseAndStageScopesReviewed':False,'PAuthorStageIncluded':False,'peerAResultsRead':False,'oldD112Repeated':False,'activeWrites':False,'GitOperations':False,'newStrictScientificClosures':0,'restoredActiveBindings':0,'strictNetGain':0,'humanApproval':False,'humanTrial':False,'actualFinalInputsReverified':True,'inputs':list(inputs.values()),'outputs':output}
fp=folder/freezeName;fp.write_text(json.dumps(freeze,indent=2)+'\n')
for i in freeze['inputs']+freeze['outputs']:
 b=(root/i['path']).read_bytes();assert hashlib.sha256(b).hexdigest()==i['sha256']and len(b)==i['bytes']
print(json.dumps(dict(path=str(fp.relative_to(root)),sha256=hashlib.sha256(fp.read_bytes()).hexdigest(),inputCount=len(inputs),outputCount=len(output),nativeDecisions=counts,finalAllInputOutputReread='PASS')))
