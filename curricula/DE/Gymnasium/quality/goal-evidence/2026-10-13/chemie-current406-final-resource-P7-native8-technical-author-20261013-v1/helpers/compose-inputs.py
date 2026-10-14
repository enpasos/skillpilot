import copy, hashlib, json, pathlib, shutil
from datetime import datetime, timezone

R = pathlib.Path.cwd()
E = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13')
T = E/'chemie-current406-final-resource-P7-native8-technical-author-20261013-v1'
B = E/'chemie-three-recycling-current403-graph-source-integration-author-20261013-v4'
F = E/'chemie-current403-four-P-normal-input-materialization-author-20261013-v1'
I = E/'chemie-three-recycling-goal-images-author-20261013-v1'
G = E/'chemie-three-recycling-current406-graph-scope-independent-20261013-v1'
P = E/'chemie-three-recycling-duty-positive-profile-author-20261013-v1'
C = E/'chemie-three-recycling-judgment-update-case-author-20261013-v2'
Q = E/'chemie-accepted-successors-current403-normal-composition-author-root-20261013-v1'
for d in ['candidate','positive','configs','checks','models','public-root/assets/goal-visualizations/chemie']:
    (T/d).mkdir(parents=True,exist_ok=True)
def read(p): return json.loads(pathlib.Path(p).read_text())
def sha(p): return 'sha256:'+hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def cellsha(x): return 'sha256:'+hashlib.sha256((json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode()).hexdigest()
def write(p,x): pathlib.Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def binding(p): return {'path':str(p),'sha256':sha(p),'bytes':pathlib.Path(p).stat().st_size}
selector=read(B/'NEUTRAL.three-recycling-graph-source.exact-input-selector.json')
for k in ['candidateLandscape','candidateSemanticLedger','completeNormalReviewBook']:
    v=selector[k];assert sha(v['path'])==v['sha256']
landscape=read(selector['candidateLandscape']['path'])
sem=read(selector['candidateSemanticLedger']['path'])
sem['sourceLandscapePath']=str(T/'candidate/canonical531.current406.final-resources.inactive.json')
base=copy.deepcopy(landscape)
qa=read(Q/'candidate/QA.current-plus-three-reviewed-successors.inactive.json')
links=read(I/'CANDIDATE.resource-link-proposals.json')['proposals']
ptmeta=read(E/'chemie-recycling-Pt-membrane-catalyst-targeted-image-author-20261013-v2/metadata.actual-targeted-author.json')
vrows=read(E/'chemie-three-recycling-current406-image-independent-v-20261013-v1/CANDIDATE.two-KEEP-exact-native-QA-records.inactive.json')['records']
vrows.append(read(E/'chemie-recycling-Pt-catalyst-correction-independent-v-20261013-v2/CANDIDATE.f54b2c33-allowed-native-QA-fields.inactive.json'))
newids=[p['goalId'] for p in links]
assetbindings=[]
for proposal in links:
    id=proposal['goalId'];link=proposal['proposedLink'];source=proposal['candidatePath']
    if id==ptmeta['goalId']:
        link=ptmeta['proposedResourceLink'];source=ptmeta['asset']['path']
    goal=next(g for g in landscape['goals'] if g['id']==id)
    assert goal['resourceLinks']==[]
    assert link['skillpilotId']==id
    row=next(r for r in vrows if r['goalId']==id)
    assert row['title']==goal['title'] and row['description']==goal['description']
    digest=sha(source)
    assert digest.removeprefix('sha256:')==row['assetSha256'].removeprefix('sha256:')
    assert row['aiApproved']=='yes' and row['aiApprovedAssetSha256'].removeprefix('sha256:')==digest.removeprefix('sha256:')
    goal['resourceLinks']=[copy.deepcopy(link)]
    native={
        'goalId':id,'title':goal['title'],'description':goal['description'],'subject':'chemie',
        'landscapeId':landscape['landscapeId'],'landscapePath':str(T/'candidate/canonical531.current406.final-resources.inactive.json'),
        'visualizationState':'available','missingReason':'','imageUrl':link['url'],
        'publicAssetPath':'app/public'+link['url'],'canonicalAssetPath':str(source),'assetSha256':digest,
        'umlautsCorrectChatGpt':'no','contentApprovedChatGpt':'no','humanApproved':'no',
        'humanIssueIdentified':'no','humanIssueDescription':'','chatGptReviewedAt':None,
        'chatGptReviewer':'','chatGptNotes':'','humanReviewedAt':None,'humanReviewer':'',
        'aiApproved':'yes','aiApprovedAssetSha256':digest,'aiReviewedAt':row['aiReviewedAt'],
        'aiReviewer':row['aiReviewer'],'aiNotes':row['aiNotes']
    }
    assert not any(r['goalId']==id for r in qa['records'])
    qa['records'].append(native)
    target=T/'public-root'/link['url'].lstrip('/')
    target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
    assetbindings.append({'goalId':id,'source':binding(source),'publicRootCopy':binding(target),'url':link['url'],'actualVInput':row})
e560root=E/'chemie-e560-current406-descriptor-image-compatibility-independent-v-20261013-v1'
e560cas=read(e560root/'CAS.e560-QA-description-only.whole-row.inactive.json')
assert sha(e560cas['sourceQALedgerBinding']['path'])==e560cas['sourceQALedgerBinding']['sha256']
ix=next(i for i,r in enumerate(qa['records']) if r['goalId']=='e56040b5-1da8-5080-b358-086d04922339')
assert qa['records'][ix]==e560cas['beforeWholeRow']
assert [k for k in qa['records'][ix] if qa['records'][ix][k]!=e560cas['proposedAfterWholeRow'][k]]==['description']
qa['records'][ix]=copy.deepcopy(e560cas['proposedAfterWholeRow'])
assert qa['records'][ix]['description']==next(g for g in landscape['goals'] if g['id']==qa['records'][ix]['goalId'])['description']
write(T/'checks/e560-exact-QA-description-only-CAS.actual.json',{'sourceCAS':binding(e560root/'CAS.e560-QA-description-only.whole-row.inactive.json'),'supportingCurrentIndependentReview':e560cas['supportingCurrentIndependentReview'],'actualChangedFields':['description'],'allExistingAIAndHumanMetadataPreserved':True,'imageUnchanged':e560cas['imageSHA256Unchanged'],'newScientificApprovalInvented':False})
assert len(landscape['goals'])==531
changed=[]
for old,new in zip(base['goals'],landscape['goals']):
    assert old['id']==new['id']
    if old!=new:
        changed.append(old['id'])
        assert old['id'] in newids
        a=copy.deepcopy(old);b=copy.deepcopy(new);a.pop('resourceLinks');b.pop('resourceLinks');assert a==b
assert set(changed)==set(newids)
write(T/'candidate/canonical531.current406.final-resources.inactive.json',landscape)
write(T/'candidate/semantic531.current406.final-resources.inactive.json',sem)
write(T/'candidate/QA.current403-plus-three-exact-reviewed-images.inactive.json',qa)
write(T/'checks/three-exact-resource-only-CAS-and-V-materialization.actual.json',{'changedGoalIds':changed,'allOther528NodeBodiesExactlyPreserved':True,'newSemanticApproval':False,'newImageApprovalsInvented':False,'assets':assetbindings})
cas=read(C/'CAS.one-whole-case-two-whole-profile-carriers.author.json')
composed={}
checks=[]
for o in cas['operations']:
    p=o['baseBinding']['path'];assert sha(p)==o['baseBinding']['sha256']
    carrier=read(p);s=o['selector']
    matches=[i for i,x in enumerate(carrier[s['array']]) if x[s['field']]==s['value']]
    assert len(matches)==1;ix=matches[0]
    assert carrier[s['array']][ix]==o['beforeWholeCell']
    assert cellsha(o['beforeWholeCell'])==o['CAS']['wholeBeforeCellSHA256']
    assert cellsha(o['afterWholeCell'])==o['CAS']['wholeAfterCellSHA256']
    carrier[s['array']][ix]=copy.deepcopy(o['afterWholeCell'])
    composed[o['operationId']]=carrier
    checks.append({'operationId':o['operationId'],'baseBinding':o['baseBinding'],'before':o['CAS']['wholeBeforeCellSHA256'],'after':o['CAS']['wholeAfterCellSHA256'],'wholeCellCASPassed':True})
candidate=composed['unmaterialized-candidate-goal-spec']
original=read(P/'CANDIDATESET.three-positive-profile-designs.unmaterialized.author.json')
assert candidate['reviewId']==original['reviewId']
def differences(a,b,p=''):
    if type(a)!=type(b): return [p]
    if isinstance(a,dict):
        out=[]
        for k in a.keys()|b.keys():
            if k not in a or k not in b:out.append(p+'/'+k)
            else:out+=differences(a[k],b[k],p+'/'+k)
        return out
    if isinstance(a,list):
        if len(a)!=len(b):return [p]
        out=[]
        for i,(x,y) in enumerate(zip(a,b)):out+=differences(x,y,p+'/'+str(i))
        return out
    return [] if a==b else [p]
diffs=differences(original,candidate)
assert len(diffs)==2 and all('/applicationCaseBriefs/' in p and (p.endswith('/taskDemandDe') or p.endswith('/taskDemandEn')) for p in diffs)
write(T/'positive/three-current406.exact-CAS-candidate-set.author.json',candidate)
write(T/'positive/three-current406.exact-CAS-profiles.DEEN.author.json',composed['whole-battery-profile'])
write(T/'positive/six-current406.exact-CAS-cases.DEEN.author.json',composed['case-2-task'])
write(T/'checks/P3-exact-whole-CAS-and-only-two-task-leaf-changes.actual.json',{'operations':checks,'candidateSetChangedPaths':diffs,'allOtherProfileLeavesExactlyPreserved':True,'scientificApprovalCreated':False})
shutil.copy2(F/'positive/four-current403.ai-candidate.needs-human-review.jsonl',T/'positive/four-current406.exact-retained.ai-candidate.needs-human-review.jsonl')
fourcfg=read(F/'configs/four-current403.inactive.config.json')
fourcfg['landscapePath']=str(T/'candidate/canonical531.current406.final-resources.inactive.json')
fourcfg['semanticKindLedgerPath']=str(T/'candidate/semantic531.current406.final-resources.inactive.json')
fourcfg['reviewPath']=str(T/'positive/four-current406.exact-retained.ai-candidate.needs-human-review.jsonl')
write(T/'configs/P4.current406.exact-retained.inactive.config.json',fourcfg)
threecfg=copy.deepcopy(fourcfg)
threecfg['reviewId']=candidate['reviewId']
threecfg['reviewPath']=str(T/'positive/three-current406.ai-candidate.needs-human-review.jsonl')
threecfg['scope']={'label':'Three reviewed exact profile designs with accepted task-leaf correction; inactive final406 technical materialization only','goalIds':[g['goalId'] for g in candidate['goals']]}
write(T/'configs/P3.current406.final-resources.inactive.config.json',threecfg)
book=read(B/'configs/whole406.inactive-review.config.json')
book.update({'bookId':'chemie-current406-final-resource-P7-native8-inactive','title':'Chemie – endgültiger 406er Stand zur gezielten unabhängigen Prüfung','landscapePath':fourcfg['landscapePath'],'semanticKindLedgerPath':fourcfg['semanticKindLedgerPath'],'goalVisualizationQaPath':str(T/'candidate/QA.current403-plus-three-exact-reviewed-images.inactive.json'),'outputPath':str(T/'models/whole406.final-resource-P7.stock-book-model.inactive.json')})
book['evidenceReviewPaths'] += [fourcfg['reviewPath'],threecfg['reviewPath']]
write(T/'configs/whole406.final-resource-P7.inactive.config.json',book)
native=read(E/'chemie-poly18-aro19-final-current231-source-native-author-root-20261013-v1/configs/native-aromatics19.batch.config.json')
order=['e56040b5-1da8-5080-b358-086d04922339','b208b1a5-c609-53a1-8add-979417a93b7d','17ab1148-7383-5cab-8b91-73aff795f1e4','981242bb-a729-5701-b02d-c2f7f489e5af','53db04a0-ea76-5810-9526-c8639100e497','f9e6d689-6e59-59a4-9f21-8c2d44413244','f54b2c33-11f1-571f-aa1c-cf969cc141c4','b7ae47da-6afa-5651-977a-3139af7d6eab']
native.update({'batchId':'chemie-current406-final-resource-P7-native8-20261013-v1','bookId':'chemie-current406-final-native8-v1','title':'Chemie – acht aktuelle Ziele und ihr vollständiger Kontext','baseGoalBookConfigPath':str(T/'configs/whole406.final-resource-P7.inactive.config.json'),'goalIds':order,'outputDirectory':str(T/'native-eight'),'publicRoot':str(T/'public-root')})
write(T/'configs/native-eight.final406.batch.config.json',native)
allassets={x['url']:x['source']['path'] for x in assetbindings}
allassets.update({x['path'].split('/')[-1]:x['path'] for x in []})
for x in read(F/'INPUTS.exact-production-and-reviewed-content.bindings.json')['inputs']:
    if x['path'].endswith('.png'):
        if 'e56040b5' in x['path']:id='e56040b5-1da8-5080-b358-086d04922339'
        elif 'b208b1a5' in x['path']:id='b208b1a5-c609-53a1-8add-979417a93b7d'
        elif '981242bb' in x['path']:id='981242bb-a729-5701-b02d-c2f7f489e5af'
        elif '53db04a0' in x['path']:id='53db04a0-ea76-5810-9526-c8639100e497'
        else:continue
        assert sha(x['path'])==x['sha256']
        link=next(g for g in landscape['goals'] if g['id']==id)['resourceLinks'][0]
        allassets[link['url']]=x['path']
id='17ab1148-7383-5cab-8b91-73aff795f1e4';link=next(g for g in landscape['goals'] if g['id']==id)['resourceLinks'][0]
allassets[link['url']]='app/public'+link['url']
for url,source in allassets.items():
    target=T/'public-root'/url.lstrip('/');target.parent.mkdir(parents=True,exist_ok=True)
    if not target.exists():shutil.copy2(source,target)
    assert sha(source)==sha(target)
write(T/'checks/eight-exact-publicRoot-source-assets.actual.json',{'assets':[{'url':u,'source':binding(p),'copy':binding(T/'public-root'/u.lstrip('/'))} for u,p in allassets.items()],'actualBoundAssets':8,'activeAssetWrites':False})
for label in ['a','m']:
    config=read(G/('configs/'+label+'-three-current406.config.json'))
    config['landscapePath']=fourcfg['landscapePath']
    write(T/('configs/'+label+'-three-final406.resource-only-retention.config.json'),config)
paths=[B/'NEUTRAL.three-recycling-graph-source.exact-input-selector.json',F/'SEAL.finite-four-P-technical-materialization.actual.json',G/'SEAL.final-independent-graph-scope.actual.json',E/'chemie-three-recycling-current406-image-independent-v-20261013-v1/SEAL.final.independent-v.actual.json',E/'chemie-recycling-Pt-catalyst-correction-independent-v-20261013-v2/SEAL.final.targeted-Pt-independent-v.actual.json',P/'SEAL.finite-inactive-author.actual.json',C/'SEAL.finite-inactive-author.actual.json',E/'chemie-three-recycling-duty-positive-profile-independent-a-20261013-v1/SEAL.final.independent-a.actual.json',E/'chemie-three-recycling-duty-positive-profile-independent-b-20261013-v1/FINAL.finite-profile-design-case-review.independent-b.freeze.json',E/'chemie-three-recycling-judgment-update-case-independent-a-20261013-v2/SEAL.final.independent-a.actual.json',E/'chemie-three-recycling-judgment-update-case-independent-b-20261013-v2/FINAL.finite-task-wording-successor.independent-b.freeze.json']
paths += [e560root/'CAS.e560-QA-description-only.whole-row.inactive.json',e560cas['supportingCurrentIndependentReview']['path']]
write(T/'INPUTS.exact-existing-author-and-independent-provenance.bindings.json',{'bindings':[binding(p) for p in paths],'newScientificApproval':False})
print('Composed only 3 resourceLinks/3 QA rows; 531 nodes preserved; exact P3 CAS and publicRoot8 ready. Current e560 QA descriptor CAS supported by fresh actual compatibility review.')
