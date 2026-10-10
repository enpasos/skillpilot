# SPDX-License-Identifier: Apache-2.0
import datetime,hashlib,json,pathlib,subprocess
R=pathlib.Path(__file__).resolve().parents[7]
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
O=B/'biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3'
P=B/'biologie-bio8-targeted-text-and-source-author-successor-20261010-v4'
V=pathlib.Path('curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-bio8-expression-mobile-legibility-targeted-author-20261010-v1')
def read(p):return json.loads((R/p).read_text())
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):
 f=R/P/p;content=json.dumps(x,ensure_ascii=False,indent=2)+'\n'
 if f.exists():
  assert f.read_text()==content,p
  return ref(P/p)
 f.parent.mkdir(parents=True,exist_ok=True);f.write_text(content);return ref(P/p)
assert read(P/'checks/scoped-schema-JSON-normal-symlink-and-portability.actual.json')['actualCheck']=='PASS'
for label in ['normal-model-atlas-final','P10-normal-check','native3-prepare','native3-check','native3-capture','preservation-source-final2','scoped-schema-portability','practical-primary-final','root-image-import','current-raster-bindings','scoped-schema-portability-final2']:
 assert read(P/'terminal'/f'{label}.terminal.actual.json')['exitCode']==0,label
html=read(P/'checks/affected3-HTML-whole-page-captures.actual.json');pdf=read(P/'checks/affected3-PDF-whole-page-captures.actual.json')
put('checks/actual-three-HTML-three-PDF-author-view.receipt.json',{'role':'author_only','actualWholeHTMLCapturesViewed':[r['capture']for r in html['wholePages']],
 'actualWholePDFCapturesViewed':[r['capture']for r in pdf['wholePages']],'inspectionMethod':'tools.view_image for all three complete HTML captures and all three complete PDF captures',
 'wholeGoalIDsDescriptionsBreadcrumbsImagesAndLinksPresent':True,'observedClippingOrContinuation':False,
 'EnglishDescriptionSource':'The normal D review input carries the corrected English; publication pages render the retained German.',
 'newScientificIndependentDOrVJudgment':False,'humanApproval':0})
terminal_paths=sorted((R/P/'terminal').glob('*.terminal.actual.json'))
raw=[]
for f in terminal_paths:
 t=json.loads(f.read_text());raw.append('\nCOMMAND '+json.dumps(t['argv'],ensure_ascii=False)+'\nEXIT '+str(t['exitCode'])+'\nSTDOUT\n'+(R/t['stdoutPath']).read_text()+'\nSTDERR\n'+(R/t['stderrPath']).read_text())
(R/P/'terminal/rawlogs.txt').write_text(''.join(raw));terminals=[ref(f.relative_to(R))for f in terminal_paths]
failed=[ref(f.relative_to(R))for f in terminal_paths if json.loads(f.read_text())['exitCode']!=0]
select={
 'whole483Candidate':P/'candidate/whole483-final-text-source-image.inactive.json',
 'kinds396ClassificationOnly':P/'candidate/kinds396.author-classification-only.json',
 'QA396Candidate':P/'candidate/QA396.author-pending.json',
 'whole396NormalConfig':P/'native/whole396.normal.config.json',
 'whole396NormalModel':P/'native/whole396.normal-model.actual.json',
 'whole396CurrentPageContextDeltas':P/'checks/whole396-page-context-deltas.author.json',
 'P10NormalConfig':P/'positive/ten-current-author.pending.config.json',
 'P10AuthorRecords':P/'positive/ten-current-author.pending.review.jsonl',
 'P10CompleteCandidateBodies':P/'positive/ten-whole-author-candidates.current.json',
 'P10CompleteProfileMaterialBindings':P/'final/ten-current-whole-profile-material-bindings.json',
 'P10BindingDeltas':P/'checks/P10-current-exact-binding-deltas.author.json',
 'source31Pairs35WholeOperators':P/'sources/whole31-pairs-and35-direct-operators.current-author.json',
 'normalAtlasConfig':P/'sources/final-normal-atlas.config.json',
 'normalAtlasWholeReceipt':P/'sources/normal-atlas.receipt.whole.json',
 'normalAtlasCompactReceipt':P/'sources/normal-atlas.receipt.compact.json',
 'normalAtlasOutputPortableAliases':P/'sources/normal-output.portable-aliases.json',
 'retainedAllActualPortablePrimaryBindings':O/'sources/all-actual-portable-primary-bindings.json',
 'affected3NativeBatchConfig':P/'native/affected-current-native.batch.config.json',
 'affected3NativeBatchManifest':P/'native/affected-current-native/batch-manifest.json',
 'affected3NormalHTML':P/'native/affected-current-native/bundle/book.html',
 'affected3PortableHTML':P/'native/portable-affected3/bundle/book.html',
 'affected3NormalPDF':P/'native/affected-current-native/bundle/book.pdf',
 'affected3NativeRoundAInput':P/'native/affected-current-native/round-a/description-review-input.json',
 'affected3NativeRoundBInput':P/'native/affected-current-native/round-b/description-review-input.json',
 'actualNativeAuthorViewReceipt':P/'checks/actual-three-HTML-three-PDF-author-view.receipt.json',
 'actualHTMLCaptureReceipt':P/'checks/affected3-HTML-whole-page-captures.actual.json',
 'actualPDFCaptureReceipt':P/'checks/affected3-PDF-whole-page-captures.actual.json',
 'rootImageAuthorEntry':V/'neutral-expression-mobile-legibility-author.entry.json',
 'rootImageAuthorFreeze':V/'FINAL.expression-mobile-legibility-author.freeze.json',
 'rootImageExactImport':P/'checks/root-V374-import.exact-binding.json',
 'protected353Proof':P/'checks/protected353-whole-goals-QA-pages-source-witnesses-and-DAG.actual.json',
 'allCurrent363OperativeRasterBindings':P/'checks/all363-current-operative-raster-bindings.actual.json',
 'historical2ae2ReferenceAndCurrentBindingFinding':P/'checks/2ae2-historical-reference-and-current-operative-raster.actual.json',
 'sourceMethodMachineContractQualifications':P/'checks/source-practical-machine-contract-deficits.author.json',
 'individualAuthorCorrectionsAndQualifications':P/'checks/targeted-author-text-source.decisions.json',
 'schemaAndPortability':P/'checks/scoped-schema-JSON-normal-symlink-and-portability.actual.json',
 'actualRawLogs':P/'terminal/rawlogs.txt','README':P/'README.md'}
e={
 'schemaVersion':1,'entryKind':'inactive Bio8 targeted text/source/image AUTHOR successor v4','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'role':'author_not_independent_reviewer','authorIdentity':{'provider':'OpenAI','runtime':'Codex GPT-6','exactRuntimeRevisionNotExposed':True},
 'previousOperativeAuthorEntry':ref(O/'author-substantive-four.portable-final.entry.json'),'previousOperativeAuthorFreeze':ref(O/'author-substantive-four.portable-final.freeze.json'),
 'genuineCurrentA':ref(B/'biologie-bio8-v3-current353-genuine-independent-a-fresh-20261010-v1/scientific-FIRST.json'),
 'genuineCurrentBEntry':ref(B/'biologie-bio8-v3-current353-genuine-independent-b-fresh-20261010-v1/FIRST.entry.json'),
 'genuineCurrentBFindings':ref(B/'biologie-bio8-v3-current353-genuine-independent-b-fresh-20261010-v1/FIRST.findings.json'),
 'activeBaseline':{'wholeGoals':479,'curricularAtomicDenominator':394,'strictMachineGoals':353,'untouched':True},
 'candidateCounts':{'wholeGoals':483,'curricularAtomicGoals':396,'wholeProfiles':10,'wholeCases':20,'oldNativeDInputsRetained':19,'affectedNewNativeInputs':3,'wholeSourcePairs':31,'wholeDirectOperators':35,'sourceScopes':24},
 'selectedArtifacts':{k:ref(p)for k,p in select.items()},
 'preservation':read(P/'checks/protected353-whole-goals-QA-pages-source-witnesses-and-DAG.actual.json'),
 'targetedIndependentReviewScope':{
  'D':['374e6de5-0747-57cb-99e3-e50ccb371124','9b40dae5-6d89-5714-ac96-373e72a7045e','430b2b73-641a-5122-bb6d-162b0d1eaf2d'],
  'PScientificProfileChanged':['430b2b73-641a-5122-bb6d-162b0d1eaf2d'],
  'PBindingOnlyChangedBodiesExact':['374e6de5-0747-57cb-99e3-e50ccb371124','9b40dae5-6d89-5714-ac96-373e72a7045e'],
  'VNewRaster':['374e6de5-0747-57cb-99e3-e50ccb371124'],
  'SOURCE':['RP TF11 printed44/physical46 locator','MV cultural802 partial contribution and retained whole duties','RP f53 theory contribution without argument performance credit','HE optional-inclusive local book qualification','individual actual method operator contracts'],
  'unrelatedScienceRestartRequired':False,'medicine27bOldValidReviewsRetained':True},
 'remainingIndividualFindings':[
  {'findingId':'A/B-P430-EN-CULTURE-LEFTOVER','authorAction':'Removed only obsolete English culture sentence from complete case/profile; retained German, solutions, rubric and fossil raster','remaining':'TARGETED_INDEPENDENT_P_AND_D_BINDING_REVIEW'},
  {'findingId':'A-D9B-EN-CLASSIFY','authorAction':'Relate developmental genetics to evolutionary processes; German/ID and complete P body retained','remaining':'TARGETED_INDEPENDENT_D_TRANSLATION_REVIEW_AND_TECHNICAL_P_BINDING'},
  {'findingId':'A-V374-360-LEGIBILITY','authorAction':'Exact separately imported root raster and native page/context bound','remaining':'GENUINE_INDEPENDENT_V_AND_D_RESOURCE_BINDING_REVIEW'},
  {'findingId':'A-SOURCE-RP-TF11-PAGE','authorAction':'Additive extraction sourceRef printed44/physical46; same literal source operator','remaining':'TARGETED_INDEPENDENT_SOURCE_LOCATOR_REVIEW'},
  {'findingId':'A-SOURCE-RP-F53-THEORY-WITNESS','authorAction':'Actual direct mapping semantics documented; protected mapping retained; no argument credit or runtime prerequisiteOnly claim','remaining':'OPEN_SOURCE_ARGUMENT_OPERATOR_PARTNER_COVERAGE; no invented qualification'},
  {'findingId':'A-SOURCE-HE-OPTIONAL-BOUNDARY','authorAction':'Exact primary mandatoryQ1.1-1.3 versus optionalQ1.4/1.5 status documented; optional-inclusive local book remains explicit','remaining':'SOURCE_OPTIONAL_LOCAL_SCOPE_QUALIFICATION_REVIEW; no universal LK target claim'},
  {'findingId':'A-SOURCE-MV-CULTURE-DUTY','authorAction':'Legitimate partial MV→802 cultural-transmission/present-effects binding; existing partner frame retained','remaining':'TARGETED_SOURCE_PARTIAL_REVIEW; future chances/limits evaluation and other whole duties remain open'},
  {'findingId':'A-METHOD-PERFORMANCE','authorAction':'Seven jurisdiction qualifications distinguish legitimate machine contracts from separate practical operator duties','remaining':'INDIVIDUAL_METHOD_CONTRACT_PARTNER_REVIEW; no actual-human-execution condition on machineM7'}],
 'actualTerminals':terminals,'retainedFailedAttempts':failed,'finalRequiredTechnicalChecksPassed':True,
 'normalSourceMetadata':{'coverageDirect':'direct mapping, not whole source coverage or projectionRole','snapshotCacheLocators':'metadata only; exact regular primary bytes are bound through retained portable manifest','normalAtlasOutputPaths':'diagnostic book-local paths; exact returned bytes available through portable aliases','historicalAuditEntriesAndFreezes':'Their exact bytes are retained; their prior internal transitive locators are historical audit metadata, not current execution dependencies. Operative whole goal/profile/page/source/primary/raster inputs are explicitly bound separately.','historical2ae2RasterReferenceCheck':'The initial comparison saw bare hexadecimal versus sha256-prefixed hexadecimal as a conflict. Actual historical and current raster bytes match. Current QA approved digest and complete BookModel page bind the identical raster; no operative image is excluded and no new V approval is created.'},
 'approvalState':{'reviewAuthority':'ai_candidate','profileStatus':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','profilesApproved':0,'humanApproval':False,'humanTrial':False,'actualLearners':0,'actualExperiments':0,'strictMachineGainClaimed':0},
 'newIndependentScienceJudgments':0,'activeWrites':[],'GitOrGitHubWrites':[],'historicalArtifactsModified':[],
 'supersededUnsealedArtifacts':[ref(P/'neutral-Bio8-targeted-text-source-image-author.entry.json')]}
# Exact regular copies/repository-relative references only. Historical normal
# manifests may describe bundle-local paths; those are not repository bindings.
bindings={};queue=[]
def refs(x):
 if isinstance(x,dict):
  if isinstance(x.get('path'),str)and x['path'].startswith('curricula/')and isinstance(x.get('sha256'),str)and isinstance(x.get('bytes'),int):
   normalized={'path':x['path'],'sha256':'sha256:'+x['sha256'].removeprefix('sha256:'),'bytes':x['bytes']}
   old=bindings.get(x['path']);assert old is None or old==normalized,x['path']
   if old is None:bindings[x['path']]=normalized;queue.append(x['path'])
  for v in x.values():refs(v)
 elif isinstance(x,list):
  for v in x:refs(v)
refs(e)
for f in sorted((R/P).rglob('*')):
 if f.is_file():refs(ref(f.relative_to(R)))
processed=set()
while queue:
 p=queue.pop();f=R/p;assert f.is_file()and not f.is_symlink(),p
 assert ref(pathlib.Path(p))==bindings[p],p
 if p in processed:continue
 processed.add(p)
 # Current own inputs and the operative portable-primary manifest define the
 # execution closure. Historical entries/freezes are bound as audit bytes;
 # their old internal dependency chains are never rebound or rewritten.
 recurse=(p.startswith(str(P)+'/')and p!=str(P/'neutral-Bio8-targeted-text-source-image-author.entry.json'))or p==str(O/'sources/all-actual-portable-primary-bindings.json')
 if f.suffix=='.json' and recurse:refs(json.loads(f.read_text()))
 elif f.suffix=='.jsonl' and recurse:
  for line in f.read_text().splitlines():refs(json.loads(line))
entry=put('neutral-Bio8-targeted-text-source-image-author.portable-final.entry.json',e)
bindings[entry['path']]=entry
files=subprocess.run(['git','ls-files','--cached','--others','--exclude-standard','-z','--'],cwd=R,check=True,capture_output=True).stdout
committable={b.decode()for b in files.split(b'\0')if b};assert set(bindings)<=committable,set(bindings)-committable
freeze=put('FINAL.Bio8-targeted-text-source-image-author.freeze.json',{'schemaVersion':1,'entry':entry,'role':'author_candidate_exact_closure_only','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'allBindingsVerifiedExactRegularCommittable':True,'bindings':[bindings[p]for p in sorted(bindings)],'ownBindings':sum(p.startswith(str(P)+'/')for p in bindings),
 'externalBindings':sum(not p.startswith(str(P)+'/')for p in bindings),'newIndependentScienceJudgments':0,'strictActiveGain':0,'humanApproval':0,'humanTrial':False,'activeWrites':[]})
print(json.dumps({'entry':entry,'freeze':freeze,'exactRegularCommittableBindings':len(bindings),'newIndependentScienceJudgments':0,'strictGain':0,'humanApproval':0}))
