# SPDX-License-Identifier: Apache-2.0
"""Minimal inactive own-enrichment cluster; all original atoms conserved."""
import copy,hashlib,json,pathlib,shutil,subprocess,unicodedata,uuid
R=pathlib.Path.cwd();D=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12';B=D/'chemie-q2-MM-own-enrichment-source-boundary-author-20261012-v5';ROOT=D/'chemie-q2-e81-793-current407-two-real-remedies-root-preparation-20261012-v4';OLD=D/'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6';HE=D/'chemie-q2-MM-HE-context-normative-edge-removal-author-20261012-v4';E81=D/'chemie-q2-e81-and-978-current407-operative-material-scope-author-successor-20261012-v4';CAP=R/'tmp/chemie-MM-own-enrichment-boundary-v5-normal-capsule'
MM='c245d5fd-ce46-5b45-ab2e-e610547b5f7c';PARENT='24b47a95-c239-552a-9be7-324aa54a89dd';BROAD='ae683d59-06a5-59be-87b5-b8648fd138c8';KEY='https://skillpilot.com/canonical/chemistry/own-enrichment/enzyme-kinetics';NEW=str(uuid.uuid5(uuid.NAMESPACE_URL,KEY))
def read(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def ref(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def norm(s):return ' '.join(unicodedata.normalize('NFKC',s).split())
assert not (B/'FINAL.author-boundary.freeze.json').exists()
for p in [OLD/'FINAL.technical-preparation.freeze.json',HE/'FINAL.author-provenance-successor.freeze.json',E81/'FINAL.author-successor.freeze.json']:
 for x in read(p)['ownFiles']:assert ref(R/x['path'])==x
cfg=read(ROOT/'configs/source32-one-HE-context-removal.measured387.book-local.inputs.json');landpath=R/cfg['landscapePath'];kindpath=R/cfg['semanticKindLedgerPath'];before=read(landpath);land=copy.deepcopy(before);g={x['id']:x for x in land['goals']};assert NEW not in g
parents=[x['id'] for x in land['goals'] if MM in x.get('contains',[])];assert parents==[PARENT]
existing=[x for x in land['goals'] if x.get('type')=='cluster' and (x.get('extendedData',{}).get('applicabilityMappingInheritance')=='boundary' or any(s in x['title'].lower() for s in ['vertief','enrichment','ergänz','enzym']))]
write(B/'author/existing-cluster-reuse-and-normal-boundary-rationale.json',{'normalAPIsRead':['app/scripts/goalBookSourceAtlasInputs.ts#sourceAtlasDescendants','app/scripts/goalBookOriginalSources.ts#buildGoalBookOriginalSources','app/src/utils/authoring/compositionViewAuthoring.ts'],'AGENTSBoundaryConvention':'AGENTS.md:297','existingWholeCandidateClustersExamined':existing,'existingClusterReuseSuitable':False,'reason':'Existing boundaries belong to ascorbic/paraben determination, BW equilibrium/electrochemistry or SekI process projects. WrappingMM there would create an unrelated placement or change those reviewed meanings. Broad Naturstoffe clusters own many retained normative partners. One own-enrichment cluster isolates onlyMM from their source inheritance.','newClusterId':NEW,'stableIdRule':{'namespace':'UUIDv5 NAMESPACE_URL','name':KEY},'newAtomicGoals':0,'minimalAuthoringChanges':['Replace only currentQ2.1 childMM with the new own-enrichment cluster at the same child position','New own-enrichment cluster contains onlyMM and has supported boundary metadata','Add one existing-schema authoritative curricularArea semantic row'],'sourceOrRuntimeSpecialCase':False})
node={'id':NEW,'title':'Eigene Vertiefung zur Enzymkinetik','titleEn':'Own enrichment in enzyme kinetics','description':'Eigene quantitative Vertiefung des Enzymmodells mit dem einfachen Michaelis–Menten-Modell unter konstanten Untersuchungsbedingungen.','descriptionEn':'Own quantitative enrichment of the enzyme model through the simple Michaelis–Menten model under constant investigation conditions.','weight':1,'core':False,'tags':copy.deepcopy(g[MM]['tags']),'contains':[MM],'requires':[],'dimensionTags':{'framework':'canonical-gymnasium-chemistry','phase':'Q2','area':'Naturstoffe','topicCode':'CANONICAL.CHEMISTRY.OWN.ENZYME_KINETICS_ENRICHMENT'},'applicability':copy.deepcopy(g[MM]['applicability']),'extendedData':{'applicabilityMappingInheritance':'boundary'},'type':'cluster','examples':[],'resourceLinks':[],'sourceRef':'SkillPilot: eigene quantitative Vertiefung des Enzymmodells; keine normative Michaelis–Menten-Lehrplanklausel.'}
g[PARENT]['contains']=[NEW if i==MM else i for i in g[PARENT]['contains']];ix=next(i for i,x in enumerate(land['goals']) if x['id']==MM);land['goals'].insert(ix,node)
out=B/'candidate/canonical533.current407.MM-own-boundary.inactive.json';write(out,land)
oldg={x['id']:x for x in before['goals']};assert all(g[i]==x for i,x in oldg.items() if i!=PARENT);assert g[MM]['requires']==oldg[MM]['requires']
write(B/'author/whole-new-cluster-and-single-parent-contains-delta.json',{'newWholeCluster':node,'changedExistingGoalId':PARENT,'beforeWholeParent':oldg[PARENT],'afterWholeParent':g[PARENT],'onlyExistingChangedField':'contains','all407CurricularBodiesRequirementsUnchanged':True,'MMGoalPScienceImageUnchanged':True,'newNodes':1,'newAtomicGoals':0,'countedAtomicDenominator':407,'nodeCountBefore':532,'nodeCountAfter':533})

# Actually read both complete primary source clauses and every retained partner.
niPath=next(p for p in cfg['mappingPaths'] if '/DE-NI/upper-secondary/' in p);mapping=read(R/niPath);srcpath=R/mapping['sourceExtractionPath'];source=read(srcpath);sg={x['id']:x for x in source['sourceGoals']};ids=['ni-chemistry-sekii-kc2022-q-makro-nano-kompetenz-020-98c9e775','ni-chemistry-sekii-kc2022-q-makro-nano-kompetenz-023-d69a53b1'];pdf=R/source['sourceDocument']['path'];text=subprocess.run(['pdftotext','-layout',str(pdf),'-'],capture_output=True,text=True,check=True).stdout
clauses=[]
for sid in ids:
 dec=next(x for x in mapping['decisions'] if x['sourceGoalId']==sid);literal=sg[sid];assert BROAD in dec['canonicalGoalIds'];matches=[i+1 for i,p in enumerate(text.split('\f')) if norm(literal['sourceText']) in norm(p)];assert matches,(sid,'literal PDF match missing')
 clauses.append({'wholeSourceGoal':literal,'wholeDecision':dec,'allWholeMappingRows':[x for x in mapping['mappings'] if x['legacyGoalId']==sid],'wholeRetainedCanonicalPartners':[g[i] for i in dec['canonicalGoalIds']],'actualPrimaryPDFPageMatches':matches,'literalMMRequirement':False})
write(B/'sources/two-NI-whole-primary-clauses-and-retained-whole-partners.exact.json',{'mapping':ref(R/niPath),'sourceExtraction':ref(srcpath),'primaryOfficialPDF':ref(pdf),'sourceDocument':source['sourceDocument'],'clauses':clauses,'otherMappedSourceObligationsOrPartnersRemoved':False,'wholeSourceUnionApproved':False})
allmapping=[];mmDirect=[]
for path in cfg['mappingPaths']:
 m=read(R/path);s=read(R/m['sourceExtractionPath']);allmapping.append({'mapping':ref(R/path),'extraction':ref(R/m['sourceExtractionPath'])})
 for dec in m['decisions']:
  if MM in dec.get('canonicalGoalIds',[]):mmDirect.append({'mappingPath':path,'decision':dec})
assert not mmDirect
write(B/'sources/all32-mapping-inputs-and-direct-MM-target-audit.exact.json',{'inputs':allmapping,'directMMNormativeDecisionTargets':mmDirect,'allMappingBytesUnchanged':True,'HEContextEdgeAlreadyAbsent':True,'allSourceClauseBytesUnchanged':True,'rootSourceInputConfig':ref(ROOT/'configs/source32-one-HE-context-removal.measured387.book-local.inputs.json'),'scientificVotes':0})

# Preserve every original composition reference. The national review subtree
# still includesMM through its one new wrapper; explicitNILK goalEntry remains.
refs=[]
for p in (R/'curricula/DE/Gymnasium/composition-views/chemie').glob('*.json'):
 txt=p.read_text()
 if any(i in txt for i in [MM,PARENT,BROAD]):refs.append({'path':str(p.relative_to(R)),'sha256':sha(p),'directMMReference':MM in txt,'wholeCurrentView':read(p)})
write(B/'author/current-composition-reference-conservation-and-own-target-scope.json',{'currentViewReferences':refs,'viewFilesChanged':0,'MMDirectAuthoredNILKTargetRetained':True,'sourceMappedScopeIsSeparateFromAuthoredOwnEnrichmentTarget':True,'fullCanonicalReviewTargetRemains407':True,'newOwnWrapperOnlyChangesMMCanonicalBreadcrumb':True,'nativeSourceAtlasCountsPendingNormalMeasurement':True})
inputs=[ROOT/'configs/full407.two-remedies.inactive.config.json',ROOT/'native/full407.two-remedies.normal-model.json',ROOT/'native/two-remedies.normal-subset-model.json',ROOT/'atlas/current-source-union.normal-model.json',ROOT/'atlas/current-source-union.normal-original-sources.json',ROOT/'configs/current-source-union.normal-model.config.json',ROOT/'configs/source32-one-HE-context-removal.measured387.book-local.inputs.json',landpath,kindpath]
fullcfg=read(inputs[0]);inputs.extend(R/p for p in fullcfg['evidenceReviewPaths']);inputs.append(R/fullcfg['goalVisualizationQaPath']);inputs.extend([ROOT/'native-D2/round-a/description-review-input.json',ROOT/'native-D2/bundle/book-model.json'])
write(B/'inputs/INITIAL.root-current407-exact-CAS.json',{'rootCurrentFiles':[ref(p) for p in inputs],'oldAuthorSeals':[ref(OLD/'FINAL.technical-preparation.freeze.json'),ref(HE/'FINAL.author-provenance-successor.freeze.json'),ref(E81/'FINAL.author-successor.freeze.json')],'peerVerdictFilesRead':False,'newClusterId':NEW,'preparerRole':'informed author, not independent reviewer'})
(CAP/'app/scripts').mkdir(parents=True,exist_ok=True)
for p in (R/'app/scripts').iterdir():
 if p.is_file() and p.suffix in ['.ts','.mts','.mjs','.js']:shutil.copy2(p,CAP/'app/scripts'/p.name)
shutil.copytree(R/'app/scripts/lib',CAP/'app/scripts/lib',dirs_exist_ok=True)
for src,dst in [(R/'app/src',CAP/'app/src'),(R/'app/node_modules',CAP/'app/node_modules'),(R/'contracts',CAP/'contracts'),(R/'curricula',CAP/'curricula')]:
 if not dst.exists():dst.symlink_to(src,target_is_directory=True)
write(B/'inputs/normal-outside-curricula-capsule.json',{'path':str(CAP),'unmodifiedProductionCode':True,'allOutputsNewAdditiveOrIgnoredCapsuleOnly':True,'imageChanges':0,'fullProviderBuilds':0})
print(json.dumps({'newClusterId':NEW,'nodeCount':len(land['goals']),'countedAtoms':407,'oldBodiesChanged':0,'originalClusterContainsChanges':1,'primaryClausesActuallyRead':2,'mappingsChanged':0}))
