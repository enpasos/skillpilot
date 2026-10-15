import copy, hashlib, json, pathlib, shutil, subprocess
from datetime import datetime, timezone

R = pathlib.Path.cwd()
E13 = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13')
E14 = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
T = E14/'chemie-current407-corrected-P8-targeted-native4-technical-20261014-v1'
H = R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
OLD = E13/'chemie-current406-final-resource-P7-native8-technical-author-20261013-v1'
SPLIT = E13/'chemie-e560-full-duty-two-atomic-children-source-preserving-author-20261013-v1'
CHILD = E14/'chemie-e560-child1-property-comparison-targeted-P-author-successor-20261014-v1'
TRANSFER = E13/'chemie-53db-meaningful-transfer-case-targeted-author-20261013-v2'
V = E13/'chemie-e560-two-child-actual-image-independent-v-20261013-v1'
def read(p): return json.loads(pathlib.Path(p).read_text())
def write(p,x):
    p=pathlib.Path(p);p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def sha(p): return 'sha256:'+hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def bind(p): p=pathlib.Path(p);return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def bound(v):
    assert sha(v['path'])==v['sha256'] and pathlib.Path(v['path']).stat().st_size==v['bytes'],v
    return read(v['path'])
assert not T.exists() and not H.exists()
T.mkdir(parents=True)
s=read(SPLIT/'NEUTRAL.e560-two-child-whole-duty-author.exact-input-selector.json')['entries']
land=bound(s['candidateLandscape']);sem=bound(s['semanticProposals'])
oldsel=read(OLD/'NEUTRAL.current406-P7-native8.exact-input-selector.json')
oldland=bound(oldsel['candidateLandscape']);qa=bound(oldsel['candidateQA'])
oldby={g['id']:g for g in oldland['goals']}
changed_existing=[g['id'] for g in land['goals'] if g['id'] in oldby and g!=oldby[g['id']]]
assert set(changed_existing)=={'e56040b5-1da8-5080-b358-086d04922339','14577339-9e0c-5b44-8e47-91e1a4947367'}
assert len(land['goals'])==533
vr=read(V/'RESOURCE.two-current-child-exact-image-bindings.inactive-proposals.json')
vq=read(V/'QA.two-child.native-five-field-updates.inactive-proposal.json')
assets=read(OLD/'checks/eight-exact-publicRoot-source-assets.actual.json')['assets']
for a in assets: assert sha(a['source']['path'])==a['source']['sha256']
landpath=T/'candidate/canonical533.current407.corrected-P8-resources.inactive.json'
sempath=T/'candidate/semantic533.current407.corrected-P8.inactive.json'
qapath=T/'candidate/QA.current407.exact-reviewed-child-images.inactive.json'
for v in vr['childImageBindings']:
    g=next(g for g in land['goals'] if g['id']==v['goalId'])
    assert g==v['exactCurrentFullGoalBeforeResourceBinding']
    assert sha(v['sourceNativePath'])==v['nativeAssetSha256']
    g['resourceLinks']=[copy.deepcopy(v['proposedResourceLink'])]
    update=next(x for x in vq['records'] if x['goalId']==g['id'])
    assert update['expectedAssetSha256']==v['nativeAssetSha256']
    template=copy.deepcopy(next(r for r in qa['records'] if r['goalId']=='f9e6d689-6e59-59a4-9f21-8c2d44413244'))
    link=g['resourceLinks'][0]
    template.update({'goalId':g['id'],'title':g['title'],'description':g['description'],
      'landscapePath':str(landpath),'imageUrl':link['url'],'publicAssetPath':'app/public'+link['url'],
      'canonicalAssetPath':v['sourceNativePath'],'assetSha256':v['nativeAssetSha256'],
      'chatGptReviewedAt':None,'chatGptReviewer':'','chatGptNotes':'','humanReviewedAt':None,
      'humanReviewer':'','humanApproved':'no','humanIssueIdentified':'no','humanIssueDescription':''})
    template.update(update['updates'])
    assert template['aiApproved']=='yes' and template['aiApprovedAssetSha256']==v['nativeAssetSha256']
    assert not any(r['goalId']==g['id'] for r in qa['records'])
    qa['records'].append(template)
    target=T/'public-root'/link['url'].lstrip('/');target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(v['sourceNativePath'],target)
    assets.append({'url':link['url'],'source':bind(v['sourceNativePath']),'copy':bind(target)})
sem['sourceLandscapePath']=str(landpath)
write(landpath,land);write(sempath,sem);write(qapath,qa)
for a in assets:
    target=T/'public-root'/a['url'].lstrip('/');target.parent.mkdir(parents=True,exist_ok=True)
    if not target.exists():shutil.copy2(a['source']['path'],target)
    a['copy']=bind(target);assert sha(target)==a['source']['sha256']
write(T/'checks/ten-exact-reviewed-source-asset-bindings.actual.json',{'assets':assets,'newImageVotes':False})
cs=read(CHILD/'NEUTRAL.targeted-child1-P-property-comparison.author-inputs.json')
ts=read(TRANSFER/'NEUTRAL.targeted53db-case2.exact-input-selector.json')
childspec=bound(cs['fullCorrectedProfileCarrier'])
transferall=bound(ts['unmaterializedCandidateSet'])
transfer=copy.deepcopy(transferall);transfer['goals']=[g for g in transfer['goals'] if g['goalId']=='53db04a0-ea76-5810-9526-c8639100e497']
assert len(childspec['goals'])==2 and len(transfer['goals'])==1
write(T/'positive/two-current407.full-child-profile-spec.exact-science.json',childspec)
write(T/'positive/one-current407.full53-transfer-profile-spec.exact-science.json',transfer)
for label,cell in [('two-child-cases',cs['fullCorrectedCaseCarrier']),('eight-synthesis-case-carrier',ts['fullP4CaseCarrier'])]:
    bound(cell);shutil.copy2(cell['path'],T/'positive'/f'{label}.exact-science.json')
oldrecords=[]
for key in ['P3','P4ExactRetained']:
    v=oldsel[key];assert sha(v['path'])==v['sha256']
    oldrecords.extend(json.loads(line) for line in pathlib.Path(v['path']).read_text().splitlines() if line.strip())
keep=[r for r in oldrecords if r['goalId'] not in {'e56040b5-1da8-5080-b358-086d04922339','53db04a0-ea76-5810-9526-c8639100e497'}]
assert len(keep)==5
keepfile=T/'positive/five-current407.exact-retained.ai-candidate.needs-human-review.jsonl'
keepfile.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in keep))
basecfg=read(OLD/'configs/P4.current406.exact-retained.inactive.config.json')
configs=[]
for label,spec in [('child2',childspec),('synthesis1',transfer)]:
    c=copy.deepcopy(basecfg);c.update({'landscapePath':str(landpath),'semanticKindLedgerPath':str(sempath),
      'reviewId':spec['reviewId'],'reviewPath':str(T/'positive'/f'{label}.current407.ai-candidate.needs-human-review.jsonl'),
      'scope':{'label':'Exact independently reviewed profile/case content; current resource input materialization only',
      'goalIds':[g['goalId'] for g in spec['goals']]}})
    cfg=T/'configs'/f'P-{label}.current407.inactive.config.json';write(cfg,c);configs.append(str(cfg))
book=read(OLD/'configs/whole406.final-resource-P7.inactive.config.json')
book.update({'bookId':'chemie-current407-corrected-P8-review-inactive','title':'Chemie – aktueller Kandidat mit gezielten Korrekturen',
  'landscapePath':str(landpath),'semanticKindLedgerPath':str(sempath),'goalVisualizationQaPath':str(qapath),
  'outputPath':str(T/'models/whole407.corrected-P8.stock-book-model.inactive.json')})
book['evidenceReviewPaths']=book['evidenceReviewPaths'][:2]+[str(keepfile)]+[read(c)['reviewPath'] for c in configs]
bookcfg=T/'configs/whole407.corrected-P8.inactive.config.json';write(bookcfg,book)
native=read(OLD/'configs/native-eight.final406.batch.config.json')
native.update({'batchId':'chemie-current407-corrected-P8-targeted-native4-20261014-v1',
  'bookId':'chemie-current407-targeted-native4-v1','title':'Chemie – vier gezielt betroffene Ziele im vollständigen aktuellen Kontext',
  'baseGoalBookConfigPath':str(bookcfg),'goalIds':['2652caef-b557-58b9-9b28-70db62625ce5',
  'a96e9b3d-a02d-54f8-a3d3-318e0ea5180c','6413429b-53d8-5ad1-9af6-d0e562cbf0f5','53db04a0-ea76-5810-9526-c8639100e497'],
  'outputDirectory':str(T/'native-four'),'publicRoot':str(T/'public-root')})
write(T/'configs/native-four.current407.batch.config.json',native)
references=[s['candidateLandscape']['path'],s['semanticProposals']['path'],s['graphCAS']['path'],s['sourceCellCAS']['path'],
 cs['fullCorrectedProfileCarrier']['path'],cs['fullCorrectedCaseCarrier']['path'],ts['unmaterializedCandidateSet']['path'],
 ts['fullP4CaseCarrier']['path'],V/'RESOURCE.two-current-child-exact-image-bindings.inactive-proposals.json',V/'QA.two-child.native-five-field-updates.inactive-proposal.json']
for root in [E13/'chemie-e560-two-child-source-A-M-P-independent-a-20261013-v1',
 E13/'chemie-e560-two-child-source-A-M-P-independent-b-20261013-v1',
 E14/'chemie-e560-child1-property-comparison-targeted-independent-a-20261014-v1',
 E14/'chemie-e560-child1-property-comparison-targeted-independent-b-20261014-v1',
 E13/'chemie-53db-transfer-correction-targeted-independent-a-20261013-v2',
 E13/'chemie-53db-transfer-correction-targeted-independent-b-20261013-v2',V]:
    seals=list(root.glob('SEAL*.json'));assert len(seals)==1;references.extend(seals)
write(T/'INPUTS.exact-existing-scientific-content-and-finite-seals.bindings.json',{'bindings':[bind(p) for p in references],
 'newScientificVotes':False,'originalNative8Unchanged':True,'sourceScopeIntegrationStillPending':True})
H.mkdir(parents=True)
for p in ['app/scripts','app/src','app/node_modules','contracts']:
    target=H/p;target.parent.mkdir(parents=True,exist_ok=True)
    subprocess.run(['cp','-al',str(R/p),str(target)],check=True)
target=H/'app/public/assets/goal-visualizations/chemie';target.parent.mkdir(parents=True,exist_ok=True)
subprocess.run(['cp','-al',str(R/'app/public/assets/goal-visualizations/chemie'),str(target)],check=True)
shutil.copytree(R/T,H/T)
def hostcopy(p):
    source=R/p;target=H/p;target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists():target.unlink()
    shutil.copy2(source,target)
for p in [book['compositionViewPath']]+book['evidenceReviewPaths'][:2]+[basecfg['reviewCriteriaPath'],native['promptPath'],native['criteriaPath']]:hostcopy(p)
for row in qa['records']:
    if row['visualizationState']!='available':continue
    target=H/row['publicAssetPath'];expected=row['assetSha256'].removeprefix('sha256:')
    if target.is_file() and hashlib.sha256(target.read_bytes()).hexdigest()==expected:continue
    matching=[a for a in assets if a['url']==row['imageUrl']]
    source=R/(matching[0]['source']['path'] if matching else row['canonicalAssetPath'])
    assert hashlib.sha256(source.read_bytes()).hexdigest()==expected,(row['goalId'],source)
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists():target.unlink()
    shutil.copy2(source,target)
assert not any(p.is_symlink() and p.is_dir() for p in (H/'curricula').rglob('*'))
write(T/'checks/technical-candidate-composition-and-safe-physical-host.actual.json',{
 'wholeGoalCount':533,'unchangedExisting529Bodies':True,'changedExistingGoalIds':changed_existing,
 'twoChildResourceBindingsOnly':True,'oldP5RetainedPendingStockFingerprintCheck':True,
 'newP3ContentExactAcceptedAuthors':True,'stockSemanticFingerprintsAlreadyBoundBeforeResources':True,
 'sourceScopeIntegrationStillPending':True,'nativeD4Pending':True,'newStrictCompletions':0,
 'humanApproval':False,'activeWrites':False,'unmodifiedStockPhysicalModules':True,
 'allPrivateAssetHardlinksDetachedBeforeReplacement':True,'privateHost':str(H.relative_to(R)),
 'currentActive402NotReplaced':True})
print(json.dumps({'root':str(T),'host':str(H.relative_to(R)),'PConfigs':configs,'bookConfig':str(bookcfg),'nativeConfig':str(T/'configs/native-four.current407.batch.config.json')}))
