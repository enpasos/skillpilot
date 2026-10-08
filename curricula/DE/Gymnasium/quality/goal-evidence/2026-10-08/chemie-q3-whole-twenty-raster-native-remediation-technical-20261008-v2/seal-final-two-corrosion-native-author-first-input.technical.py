# SPDX-License-Identifier: Apache-2.0
"""First immutable technical AUTHOR packet for two real independent final reviews."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,subprocess,os,jsonschema
R=Path.cwd();D=Path(__file__).resolve().parent;REQ={}
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
rel=lambda p:str(Path(p).relative_to(R))
def bind(p):
 p=Path(p);v={'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size};REQ[v['path']]=v;return v
def read(p):bind(p);return json.loads(Path(p).read_text())
def verify(v,base=R):
 p=(base/v['relativePath'])if 'relativePath'in v else R/v['path'];assert sha(p)==v['sha256'].removeprefix('sha256:'),(p,'digest drift');assert 'bytes'not in v or p.stat().st_size==v['bytes'];return bind(p)
def put(name,v):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True);b=((v if isinstance(v,str)else json.dumps(v,ensure_ascii=False,indent=2))+'\n').encode()
 if p.exists():assert p.read_bytes()==b,p
 else:t=p.with_suffix(p.suffix+'.tmp');t.write_bytes(b);os.replace(t,p)
 return bind(p)
g=read(D/'initial-current480-378-full-context-source-M-guards.technical.json');spec=read(D/'root-final-two-remediation.inputs.json');ids=spec['finalEligibleGoalIds'];assert ids==['9f0d6d4c-f918-5a44-a9a2-7732c4e338f3','c95f6059-d7c2-5bcd-b61e-95e3577efdb2']
for v in g['beforeBindings'].values():verify(v)
for am in g['currentMemoryExactGuards']:verify(am['active']);verify(am['exactCopy'])
for name in ['initial-declared-inputs.technical.json','initial-native-context-declared-inputs.technical.json','final-two-native-declared-inputs.technical.json']:
 for v in read(D/'checks'/name)['files']:verify(v)
verify(spec['actualRootRemedyEntry']);rootEntry=read(R/spec['actualRootRemedyEntry']['path'])
for s in rootEntry['verifiedExistingIndependentFirstSeals']:
 verify(s['seal']);p=R/s['seal']['path'];j=read(p);files=j.get('ownFiles',j.get('files'));assert len(files)==s['actuallyVerifiedFrozenFiles']
 for v in files:verify(v,p.parent)
for key in ['retainedWholeCases','whole40TargetedRemediation','explicitScientificDelta','twoWholeCurrent15and16NativeMaterializerCandidates']:verify(rootEntry[key])
image=read(R/spec['correctedImage16Manifest']);verify(image['png']);verify(image['prompt']);verify(image['provenance']);prov=read(R/image['provenance']['path']);verify(prov['exactRequest']);verify(prov['originalUnchanged'])
# Root's second true case remedy remains held outside native selected15/16.
assert rootEntry['candidate12SourceAndVStillHOLD']and rootEntry['nativeP15OriginalContentExact']and rootEntry['finalIndependentReviewPending']
checks=['full378-current-native-context','M378-current-unchanged-native-visibility','P2-root-remedy-original-JPEG-standard-materializer','P2-root-remedy-original-JPEG-standard-check','final-two-four-browser-widths','final-two-current480-378-native-raster-author','final-two-physical-pages']
for name in checks:assert read(D/'checks'/f'{name}.terminal.actual.json')['actualExitCode']==0
impact=read(D/'checks/full480-378-two-current-page-impact-and-no-source-mutations.author.actual.json');assert impact['other479WholeCanonicalGoalsExact']and impact['other377WholeNativePagesExact']and impact['all378HumanRowsExact']and impact['nationalAtlas359Unchanged']and impact['nativeFinalScopeOnly2']
P=read(D/'checks/P2-current-actual-rasters-closed-v2-schema-native-semantics.author.actual.json');assert P['actualErrors']==0 and len(P['records'])==2 and P['nativeAPINotOperativeCandidatePNGCLI']and P['reviewedResourceTypes']==['goal-visualization']
validator=jsonschema.Draft202012Validator(read(R/'docs/landscape-runtime.schema.json'));validator.validate(read(D/'before/canonical.json'));validator.validate(read(D/'candidate/canonical.current480.only-one-reviewed-correction-link.inactive.json'))
for side in ['a','b']:
 folder=D/'native/final-two'/('round-'+side);campaign=read(folder/'description-review-campaign.json');assert campaign['batchSize']==2 and campaign['goalCount']==2 and campaign['blindToOtherReviews']and len(campaign['batches'])==1 and not(folder/'results').exists()
 for b in campaign['batches']:
  p=folder/'batches'/(b['batchId']+'.input.jsonl');assert sha(p)==b['batchInputFingerprint'].removeprefix('sha256:')and len(p.read_text().splitlines())==2;bind(p)
manifest=read(D/'native/final-two/bundle/review-bundle-manifest.json')
for a in manifest['artifacts']:
 p=D/'native/final-two/bundle'/a['path'];assert sha(p)==a['digest'].removeprefix('sha256:')and p.stat().st_size==a['bytes'];bind(p)
pageMap=read(D/'checks/final-two-real-whole-physical-page-map.author.actual.json');render=read(D/'checks/final-two-physical-pages.terminal.actual.json');assert pageMap['actualGoalPageCount']==2 and pageMap['actualPhysicalPageCount']==4 and len(render['actualWholeGoalPhysicalPages'])==2
captures=[]
for gid in ids:
 c=read(D/f'width-captures/{gid}/chromium-captures.actual.json');assert sha(R/c['sourcePath'])==c['sourceSha256']and len(c['captures'])==2
 for v in c['captures']:verify(v);assert v['width']in [360,680]and v['measured']['renderedWidth']==v['width']
 captures.append(c)
put('checks/two-full-native-PDF-pages-and-four-actual-widths.review-input-map.json',{'nativePDF':bind(R/pageMap['actualPDF']),'actualPages':pageMap['pages'],'physicalRenders':render['actualWholeGoalPhysicalPages'],'captures':captures,'renderingIsNotApproval':True,'activeWrites':0})
source2=read(D/'source/final-two-whole-five-three-duty-and-all-partner-inputs.exact.json');assert [r['wholeDutyCount']for r in source2['entries']]==[5,3]
entry=put('neutral-final-two-corrosion-current480-378-raster-native-author.entry.json',{'schemaVersion':1,'role':'Neutral technical AUTHOR entry, only Root-selected two whole corrosion goals, final genuine independent D/P/V pending','finalNativeGoalIds':ids,'rootRemedyEntry':spec['actualRootRemedyEntry'],'rootScientificDelta':rootEntry['explicitScientificDelta'],'whole40RetainedAndTwoRootCaseRemedies':rel(D/'whole-science/whole40.actual-root-remediation.exact.json'),'wholeFourSelectedCompleteDEENCases':rel(D/'whole-science/selected-four-current-complete-DEEN-cases.actual.json'),'wholeCurrentTwoGoalContext':'native/whole-current20-pure-contexts-no-subset-render.actual.json','fullCurrent378Model':rel(D/'native/full378.final-current-raster-api.book-model.json'),'nativeBundle':rel(D/'native/final-two/bundle'),'wholeActualPDF':pageMap['actualPDF'],'actualTwoNativePagesAndFourWidths':rel(D/'checks/two-full-native-PDF-pages-and-four-actual-widths.review-input-map.json'),'wholeFiveAndThreeSourceDutiesAndEveryPartner':rel(D/'source/final-two-whole-five-three-duty-and-all-partner-inputs.exact.json'),'wholeCurrentSourcePoolLossless':rel(D/'source/whole-current-all20-1602-929-5459.lossless-exact.json'),'sourcePoolCounts':{'matchedEdges':1602,'sourceDuties':929,'allPartnerRows':5459},'actualP2CurrentWholeProfilesAndRasters':rel(D/'positive/P2.actual-current-JPEG-KEEP-and-corrected-PNG.native-author.jsonl'),'P15ActualOriginalJPEGKEEP':True,'P16ActualMinimalPNGCorrection':'Feuchte Luft instead of Humid Luft, actual Root source corrected PNG, not final approval','publicRoot':rel(D),'roundA':rel(D/'native/final-two/round-a'),'roundB':rel(D/'native/final-two/round-b'),'actualNativeBatchSize2':True,'actualWholeCurrentCanonicalCount':480,'actualCurricularAtomicCount':378,'full378ReviewView':'Explicit genuine separate current canonical review view410raw-32practice, unchanged current national Atlas359 remains separate','nationalActiveAtlas359Unchanged':True,'fullMemory378ExactExistingCheck0':True,'ordinaryP2OriginalJPEGCLI':'actual materializer0/check0 against original current two JPEGs with full reviewedResourceTypes goal-visualization, separate from corrected PNG candidate binding','currentRasterP2NativeAPI':'actual closed-v2 schema/fingerprint/semantics0 against exact original JPEG15 and actual corrected PNG16','ordinaryCorrectedPNG_P2CLI':'pending installation after independent current final review','other18CurrentCandidatesOutsideNativeFinalScope':True,'candidate12RootScienceRemedyNotSourceOrVRelease':True,'other479WholeGoalsAnd377NativePagesExact':True,'newScienceReviewFromEngineering':False,'reviewerInstructions':'Review only these two actual current whole native D/P/V inputs independently. Record your own blind first judgments before seeing the other current final review. Read complete retained five/three source duties and all partner/operator boundaries and actual Root P16 correction. Inspect exact original JPEG15/corrected PNG16 and four real width captures plus whole native pages. Existing source/science first reviews are genuine retained bounded evidence, never universal929-source approval. No engineering materialization creates a science/visual verdict, reviewer run or human acceptance.','trueIndependentFinalReviewsPending':2,'reviewerResultOrRunPlaceholders':0,'resolutionOrD_VApprovals':0,'humanApproval':False,'humanTrial':False,'activeWrites':0,'strictGainClaimed':0})
put('TECHNICAL-AUTHOR-READINESS.md','# Chemie: zwei aktuelle Korrosionsziele als native Reviewkandidaten\n\nNur Kontaktkorrosion und Korrosionsverhalten sind für diese finale native Runde gewählt. Aktuelle Basis:480kanonische Ziele,378curricularAtomic. Die separate vorhandene aktuelle Prüfsicht projiziert410rohe Atome und schließt32practiceAssessment aus. Der aktive nationale Atlas mit359Zielen wird nicht geändert oder als378ausgegeben. Alle378Vorherseiten wurden tatsächlich per Standardloader gelesen;479andere Ganzziele,377andere Ganzseiten,alle480Kindentscheidungen und sämtliche378Humanfelder bleiben exakt erhalten.\n\nDie vollständigen Quelleninputs1602MatchedEdges/929Pflichten/5459Partnerrows wurden gegen aktuelle Mappingpartner und Entscheidungen exakt verifiziert; die tatsächlichen5/3Pflichten der gewählten Ziele sind vollständig gebunden. Keine Quellenpflicht oder1:nPartnerzuordnung wurde gelöscht, verändert oder als landesübergreifend vollfreigegeben behauptet. Andere18Ziele bleiben außerhalb dieser Runde. Roots echte Materialkorrektur des weiterhin quellen-/visuell gehaltenen Ziels12 wird als unveränderte Rootgeschichte erhalten und zählt nicht als Freigabe.\n\nRoots tatsächliche zweite Materialkorrektur betrifft zwei DE-Felder vonFall16a. Das aktuelle vollständige P16-Profil ändert nur den zugehörigen expectedPerformanceDe-Brief, P15 bleibt ganz exakt. Das gute originale JPEG15 bleibt bytegenau, die echte minimale PNG16-Korrektur verbessert ausschließlich die befundete Beschriftung Feuchte Luft. Zwei native Lernzielseiten, zwei Vorspannseiten, vier tatsächliche360/680Chromiumcaptures und zwei separate echte batchSize2-Kampagnen stehen bereit. Keine Reviewresultate, Runplatzhalter, Resolutionen oder D/VFreigaben sind erzeugt.\n\nNativeMaterialisierung und alle betroffenen Engineeringchecks sind tatsächlich0. Die normale P2CLI mit den originalen JPEGs besteht unverändertem Rasterfilter tatsächlich0; sie beweist nicht die neue PNG16-Bindung. Diese ist gesondert per geschlossener v2Schema-/Fingerprint-/Semantik-API mit echten aktuellen Rasterbytes geprüft. Normale operative aktuelle PNG-P2CLI bleibt bis zur Installation nach unabhängiger Prüfung offen. Memory378 samt Karten und sieben Sichtprüfungen besteht0; Zeilen und Karten bleiben exakt. E1/G1, ai_candidate und needs_human_review bleiben erhalten.\n\nErzeugung und technische Materialisierung sind keine Freigabe. Nächste Schritte: zwei echte unabhängige finale D/P/VReviews, Rootintegration und terminaler zentraler Fünf-Gate-Bericht. Aktive Writes, strenger Nettozuwachs, menschliche Freigaben und Erprobungsbehauptungen0.\n')
nonoperative=[]
for p in sorted(D.rglob('*')):
 if not p.is_file():continue
 if p.suffix=='.json':json.loads(p.read_text())
 elif p.suffix=='.jsonl':
  for line in p.read_text().splitlines():json.loads(line)
 ignored=subprocess.run(['git','check-ignore','--no-index',rel(p)],capture_output=True,text=True);assert ignored.returncode in [0,1]
 if ignored.returncode==0:
  assert p in [D/'native/final-two/book.pdf',D/'native/final-two/book.html'];nonoperative.append({'path':rel(p),'role':'Historical raw native renderer sourcePath only, portable exact standard bundle governs'})
 else:bind(p)
for path in list(REQ):
 r=subprocess.run(['git','check-ignore','--no-index',path],capture_output=True,text=True)
 if r.returncode==0:
  assert path in {x['path']for x in nonoperative};del REQ[path]
ignored=subprocess.run(['git','check-ignore','--no-index','--stdin'],input='\n'.join(REQ)+'\n',capture_output=True,text=True);assert ignored.returncode in [0,1]and not ignored.stdout.strip(),ignored.stdout
links=[]
for path in list(REQ):
 p=R/path
 if p.is_symlink():
  target=os.readlink(p);assert not os.path.isabs(target);resolved=p.resolve(strict=True);assert resolved.is_relative_to(R)and rel(resolved)in REQ;links.append({'path':path,'containedRelativeTarget':target,'target':bind(resolved),'broken':False})
assert len([v for v in links if v['path'].startswith(rel(D))])==5
portable=put('checks/first-author-required-portability-current-inputs-and-immutable-history.actual.json',{'checkedAt':datetime.now(timezone.utc).isoformat(),'requiredFiles':list(REQ.values()),'actualContainedRelativeAliases':links,'brokenRequiredSymlinks':0,'ignoredRequiredFiles':[],'actualGitCheckIgnoreExit':ignored.returncode,'allOwnJSONJSONLParse':True,'historicalIgnoredRawNativeRender':nonoperative,'originalScientificAuthor76AndBlindA11B13FilesVerifiedExact':True,'noIgnoredRawPrimaryCacheDependency':'Whole source/mapping/extraction/official portable text are actual inputs; raw official download locators only metadata','otherSourceHOLDImage1_6_10Copies':'Initial three correction candidates retained as inert history, never final2 eligible images or approvals','activeWrites':0,'strictGainClaimed':0,'humanApproval':False})
seal=put('final-two-current480-378-raster-native-author.first-input.freeze.json',{'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),'kind':'First immutable neutral technical AUTHOR input for two true blind final whole D/P/V2 corrosion reviews','ownFiles':[bind(p)for p in sorted(D.rglob('*'))if p.is_file()and rel(p)not in {v['path']for v in nonoperative}],'requiredPortableInputs':portable,'neutralEntry':entry,'genuinePriorAuthorAndABFirstSeals':rootEntry['verifiedExistingIndependentFirstSeals'],'actualRootScientificRemediationEntry':spec['actualRootRemedyEntry'],'actualCorrectedPNGManifest':bind(R/spec['correctedImage16Manifest']),'actualFull480_378NativeAndSourceMemoryGuard':True,'actualNativePDFGoalPages2':True,'actualWidthCaptures4':True,'twoTrueNativeCampaignsBatchSize2':True,'actualRasterP2NativeClosedSchemaAndSemantics0':True,'ordinaryActualCorrectedPNG_P2CLIPendingInstallation':True,'ordinaryOriginalJPEG_P2CLIActual0Separate':True,'other479WholeGoalsAnd377WholePagesExact':True,'nationalActiveAtlas359Unchanged':True,'reviewerRunsOrResultsOrResolutionPlaceholders':0,'newScienceReviewClaim':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'neutralEntry':entry,'firstAuthorSeal':seal,'requiredPortableFiles':len(REQ),'ignoredRequired':0,'brokenAliases':0,'actualNativeTwoPDFPagesFourWidths':True,'nativeP2APIs0':True,'currentMemory378Exact0':True,'activeWrites':0,'strictGainClaimed':0}))
