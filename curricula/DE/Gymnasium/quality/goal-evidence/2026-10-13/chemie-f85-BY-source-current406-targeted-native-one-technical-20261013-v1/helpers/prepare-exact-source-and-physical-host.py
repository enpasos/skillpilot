import copy, hashlib, json, pathlib, shutil, subprocess

R = pathlib.Path.cwd()
E = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13')
T = E/'chemie-f85-BY-source-current406-targeted-native-one-technical-20261013-v1'
F = E/'chemie-current406-final-resource-P7-native8-technical-author-20261013-v1'
G = E/'chemie-three-recycling-current403-graph-source-integration-author-20261013-v4'
H = R/'tmp/checkpoint-chemie-20261013/f85-BY-current406-targeted-native-one-module-host'
SID = '3221e78d-2d6b-524f-a22e-07f4f559f7c4'
GID = 'f85b4651-50ea-5b42-b193-3465c05257a7'

def load(p): return json.loads((R/p).read_text())
def put(p, value):
    (R/p).parent.mkdir(parents=True, exist_ok=True)
    (R/p).write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')
def binding(p):
    b=(R/p).read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def digest(v): return 'sha256:'+hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def hostcopy(p, source=None):
    target=H/p
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists():target.unlink()
    shutil.copy2(R/(source or p),target)

casPath=E/'chemie-three-current-source-absences-primary-author-20261013-v1/CANDIDATE.whole-cell-CAS-and-scoped-locator-repairs.json'
cas=load(casPath)['positiveWholeCellCandidate']
normal=pathlib.Path(cas['logicalReviewInput'])
live=load(normal)
liveExtraction=load(pathlib.Path(live['sourceExtractionPath']))
def cell(mapping, extraction):
    return {'sourceGoal':next(x for x in extraction['sourceGoals'] if x['id']==SID),'decision':next(x for x in mapping['decisions'] if x['sourceGoalId']==SID),'mappings':[x for x in mapping['mappings'] if x['legacyGoalId']==SID]}
liveCell=cell(live,liveExtraction)
assert liveCell==cas['before'], 'Original accepted MO whole-cell CAS no longer matches current normal carrier'
assert digest(liveCell)==cas['beforeCellSha256']

sourceConfig=load(G/'configs/source-atlas.portable-pure-api.config.json')
refs=load(G/'source-inputs/path-only-transport-CAS-and-exact-extraction-bindings.json')['references']
byRef=next(x for x in refs if x['prospectiveCompilerAddress']==str(normal))
portablePath=pathlib.Path(byRef['portablePathTransportedCarrierBinding']['path'])
portable=load(portablePath)
portableExtraction=load(pathlib.Path(portable['sourceExtractionPath']))
assert cell(portable,portableExtraction)==cas['before']

def apply(mapping):
    out=copy.deepcopy(mapping)
    out['decisions']=[copy.deepcopy(cas['after']['decision']) if x['sourceGoalId']==SID else x for x in out['decisions']]
    out['mappings']=[x for x in out['mappings'] if x['legacyGoalId']!=SID]+copy.deepcopy(cas['after']['mappings'])
    assert cell(out,portableExtraction)==cas['after']
    assert digest(cell(out,portableExtraction))==cas['afterCellSha256']
    assert [x for x in out['decisions'] if x['sourceGoalId']!=SID]==[x for x in mapping['decisions'] if x['sourceGoalId']!=SID]
    assert [x for x in out['mappings'] if x['legacyGoalId']!=SID]==[x for x in mapping['mappings'] if x['legacyGoalId']!=SID]
    return out

normalAfter=apply(live)
portableAfter=apply(portable)
normalAfterPath=T/'source-overlay/BY-MO.exact-whole-cell.normal-address-carrier.after.json'
normalBeforePath=T/'source-overlay/BY-MO.exact-whole-cell.normal-address-carrier.before.json'
portableAfterPath=T/'source-overlay/BY-MO.exact-whole-cell.portable-carrier.after.json'
normalBeforePath.parent.mkdir(parents=True,exist_ok=True)
shutil.copy2(R/normal,R/normalBeforePath)
put(normalAfterPath,normalAfter)
put(portableAfterPath,portableAfter)
put(T/'source-overlay/only-f85-MO.whole-cell-operation.exact.json',cas)

Apath=E/'chemie-three-source-candidate-MO-and-RP-locators-independent-a-20261013-v1/SCIENTIFIC.source-component-and-locator-decisions.actual.json'
Bpath=E/'chemie-f85-current-full-goal-BY-primary-scope-independent-b-20261013-v1/FIRST.f85-full-target-source-fitness-and-native-scope.independent-b.actual.json'
A=load(Apath)['MO'];B=load(Bpath)
put(T/'SOURCE.exact-A-B-clauses-and-distinct-coverage-questions.actual.json',{
 'schemaVersion':1,'kind':'Exact original independent clauses; technical quotation transport, no new vote',
 'originalA':binding(Apath),'originalB':binding(Bpath),
 'Aclauses':{k:A[k] for k in ['decision','decisionScope','literalSourceCompetence','literalLB4ModelContents','wordBondOrderLiteralInReviewedLB4','inferredOperationalization','independentChemicalCheck','wholeSourceOperatorAndCoupledContextAssessment','standaloneF85WholeSourceCoverage','retainedClusterLiteralOperatorCoverageSupportedByCurrentWholeTexts','currentTechnicalLKTagOrOtherGoalSemanticsChanged','automaticGKEntitlementOrOtherJurisdictionGrant','laterAdoptionLimits']},
 'Bclauses':{k:B[k] for k in ['completeF85DemandFitInBoundedBYContext','F85CoversEntireSourceCell','verdict','allCurrentTargetDemands','courseAndProgramScope','exactWholeCellCASJudgment','requiredBeforeSourceHoldRelease']},
 'interpretationBoundary':'A standaloneF85WholeSourceCoverage=false and B F85CoversEntireSourceCell=false concern the whole SOURCE competency row. B completeF85DemandFitInBoundedBYContext=true concerns the whole unchanged f85 TARGET. Preserve both questions, complete c0 operators, literal versus derived distinction and technical LK tags. No GK/other-jurisdiction grant.',
 'newScientificVote':False,'wholeNativeDApproval':False,'sourceHoldReleased':False})

for p in [F/'candidate/canonical531.current406.final-resources.inactive.json',F/'candidate/semantic531.current406.final-resources.inactive.json']:
    dest=T/'candidate'/p.name
    dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(R/p,R/dest)
canonical=T/'candidate/canonical531.current406.final-resources.inactive.json'
sem=T/'candidate/semantic531.current406.final-resources.inactive.json'
s=load(sem);s['sourceLandscapePath']=str(canonical);put(sem,s)

book=load(F/'configs/whole406.final-resource-P7.inactive.config.json')
book.update({'bookId':'chemie-current406-f85-BY-source-targeted-review','title':'Chemie – vollständiger406er Stand mit begrenztem BY-MO-Quellennachtrag','landscapePath':str(canonical),'semanticKindLedgerPath':str(sem),'outputPath':str(T/'models/whole406.f85-source-overlay.stock-book-model.inactive.json')})
put(T/'configs/whole406.f85-source-overlay.inactive.config.json',book)
native=load(F/'configs/native-eight.final406.batch.config.json')
native.update({'batchId':'chemie-current406-f85-BY-source-native-one-20261013-v1','bookId':'chemie-current406-f85-BY-source-native-one-v1','title':'Chemie – Molekülorbital-Modelle im vollständigen aktuellen Kontext','baseGoalBookConfigPath':str(T/'configs/whole406.f85-source-overlay.inactive.config.json'),'goalIds':[GID],'outputDirectory':str(T/'native-one'),'publicRoot':str(T/'public-root')})
put(T/'configs/native-one.f85-final406.batch.config.json',native)

beforeConfig=copy.deepcopy(sourceConfig)
beforeConfig.update({'landscapePath':str(canonical),'semanticKindLedgerPath':str(sem),'outputDirectory':'app/scripts/config/goal-books/f85-BY-current406-before-source-views','manifestPath':'app/scripts/config/goal-books/f85-BY-current406-before-source-views/source.manifest.json','navigationViewPath':'app/scripts/config/goal-books/f85-BY-current406-before-source-views/navigation.view.json'})
afterConfig=copy.deepcopy(beforeConfig)
afterConfig['mappingPaths']=[str(portableAfterPath) if x==str(portablePath) else x for x in afterConfig['mappingPaths']]
afterConfig.update({'outputDirectory':'app/scripts/config/goal-books/f85-BY-current406-after-source-views','manifestPath':'app/scripts/config/goal-books/f85-BY-current406-after-source-views/source.manifest.json','navigationViewPath':'app/scripts/config/goal-books/f85-BY-current406-after-source-views/navigation.view.json'})
put(T/'configs/source-atlas.before.exact-pinned-final406.config.json',beforeConfig)
put(T/'configs/source-atlas.after.only-f85-MO.config.json',afterConfig)

H.mkdir(parents=True,exist_ok=True)
for p in ['app/scripts','app/src','app/node_modules','contracts']:
    (H/p).parent.mkdir(parents=True,exist_ok=True)
    if not (H/p).exists():subprocess.run(['cp','-al',str(R/p),str(H/p)],check=True)
# Runtime assets are physical read-only links; private overrides detach links first.
(H/'app/public/assets/goal-visualizations').mkdir(parents=True,exist_ok=True)
if not (H/'app/public/assets/goal-visualizations/chemie').exists():subprocess.run(['cp','-al',str(R/'app/public/assets/goal-visualizations/chemie'),str(H/'app/public/assets/goal-visualizations/chemie')],check=True)

# A finite Chem-only compiler cohort; no old campaigns or other-subject models copied.
fast=load(E/'chemie-current402-native47-finite-slice-technical-20261013-v1/ACTIVATION.minimal-current402-native47-slice.actual.json')
addresses={}
for item in fast['normalCompilerSourceImports']['allExpectedAddressInputs']:
    if item['kind']=='mapping':
        dest=pathlib.Path(item['installAtNormalCompilerAddress']['path'])
        hostcopy(dest,pathlib.Path(item['sourcePayload']['path']))
        addresses[str(dest)]=item['sourcePayload']['sha256']
for ref in refs:
    normalPath=pathlib.Path(ref['prospectiveCompilerAddress'])
    value=load(pathlib.Path(ref['portablePathTransportedCarrierBinding']['path']))
    value['sourceExtractionPath']=ref['beforeSourceExtractionPath']
    target=H/normalPath;target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists():target.unlink()
    target.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
    addresses[str(normalPath)]='sha256:'+hashlib.sha256(target.read_bytes()).hexdigest()
for p in ['source-landscape-registry.json','canonical-goal-provenance-registry.json','canonical-goal-applicability-override-registry.json']:
    hostcopy(pathlib.Path('curricula/DE/Gymnasium/provenance')/p)
hostcopy(pathlib.Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),canonical)
hostcopy(pathlib.Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json'))
registryPath=pathlib.Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
registry=load(registryPath)
chem=next(x for x in registry['subjects'] if x['subject']=='chemie')
targetRegistry=H/registryPath;targetRegistry.parent.mkdir(parents=True,exist_ok=True)
targetRegistry.write_text(json.dumps({**registry,'subjects':[chem]},ensure_ascii=False,indent=2)+'\n')
memoryConfig=load(pathlib.Path(chem['memoryReviewConfigPath']))
for p in ['curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json',chem['memoryReviewConfigPath'],memoryConfig['reviewPath']]:hostcopy(pathlib.Path(p))
hostcopy(F/'models/whole406.final-resource-P7.stock-book-model.inactive.json')

# Explicit stock-loader dependencies with pinned public source carriers, not discovery symlinks.
for cfg in [beforeConfig,afterConfig]:
    for mapping in cfg['mappingPaths']:
        p=pathlib.Path(mapping);hostcopy(p)
        exPath=pathlib.Path(load(p)['sourceExtractionPath']);hostcopy(exPath)
        extraction=load(exPath)
        for doc in extraction.get('sourceDocuments',[extraction.get('sourceDocument',{})]):
            docPath=pathlib.Path(doc.get('path',''))
            if str(docPath)!='.' and (R/docPath).is_file():hostcopy(docPath)
    hostcopy(pathlib.Path(cfg['durationModelPolicyPath']))
    for p in cfg.get('fallbackViewPaths',[]):hostcopy(pathlib.Path(p))

for p in [book['compositionViewPath'],book['goalVisualizationQaPath']]+book['evidenceReviewPaths']+[native['promptPath'],native['criteriaPath']]:hostcopy(pathlib.Path(p))
qa=load(pathlib.Path(book['goalVisualizationQaPath']))
selectedAssets={x['url']:pathlib.Path(x['source']['path']) for x in load(F/'checks/eight-exact-publicRoot-source-assets.actual.json')['assets']}
for row in qa['records']:
    if row.get('visualizationState')!='available':continue
    target=H/row['publicAssetPath'];expected=row.get('assetSha256','')
    if target.is_file() and 'sha256:'+hashlib.sha256(target.read_bytes()).hexdigest()==expected:continue
    source=selectedAssets.get(row['imageUrl'],pathlib.Path(row['canonicalAssetPath']))
    assert binding(source)['sha256']==expected,(row['goalId'],source)
    hostcopy(pathlib.Path(row['publicAssetPath']),source)
f85=next(x for x in load(canonical)['goals'] if x['id']==GID)
url=next(x['url'] for x in f85['resourceLinks'] if x.get('role')=='primary')
asset=pathlib.Path('app/public')/url.lstrip('/')
pub=T/'public-root'/url.lstrip('/');pub.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(R/asset,R/pub)

put(T/'CHECK.physical-source-fixture-and-original-CAS.actual.json',{
 'schemaVersion':1,'hostPath':str(H.relative_to(R)),'compilerLandscapeCount':1,'compilerSubject':'Chemie','compilerMappingAddresses':addresses,
 'originalCAS':binding(casPath),'currentNormalCarrierBefore':binding(normal),'originalBoundWholeFileSHA256':cas['wholeReviewFileBeforeSha256'],'actualNormalWholeFileMatchesOriginal':binding(normal)['sha256']==cas['wholeReviewFileBeforeSha256'],
 'originalWholeCellMatchesCurrentNormalMergedCarrier':True,'originalWholeCellMatchesPinnedFinal406PortableCarrier':True,'beforeCellSHA256':digest(cas['before']),'afterCellSHA256':digest(cas['after']),
 'sourceGoalAndOccurrencesUnchanged':True,'onlyMOOperationApplied':True,'RPSourceCellsChanged':0,'retainedC0Partner':True,'wholeF85TextResourceAndLKTagsChanged':False,
 'compilerBeforeMOAddress':str(normal),'compilerBeforeMOPayload':binding(normalBeforePath),'compilerAfterMOPayload':binding(normalAfterPath),'portableAfterMOPayload':binding(portableAfterPath),
 'noScannedDirectorySymlinks':True,'modulesUnmodified':True,'oldCampaignsCopied':0,'activeWrites':False,'newScientificVotes':0})
# Copy own finite inputs last; stock commands write only inside this owned package.
shutil.copytree(R/T,H/T,dirs_exist_ok=True)
print(json.dumps({'root':str(T),'host':str(H.relative_to(R)),'mappingAddresses':len(addresses),'MOwholeCellMatch':True}))
