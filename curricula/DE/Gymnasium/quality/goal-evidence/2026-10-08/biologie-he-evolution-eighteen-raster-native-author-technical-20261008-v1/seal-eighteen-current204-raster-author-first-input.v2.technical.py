# SPDX-License-Identifier: Apache-2.0
"""Freeze genuine technical AUTHOR inputs, never fabricate reviews or active gates."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,os,subprocess,jsonschema,struct
R=Path.cwd();D=Path(__file__).resolve().parent;B=R/'app/scripts/config/goal-books/inactive/biologie-he-evolution-eighteen-raster-native-20261008-v1';REQ={}
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
rel=lambda p:str(Path(p).relative_to(R))
def bind(p):
 p=Path(p);v={'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size};REQ[v['path']]=v;return v
def read(p):bind(p);return json.loads(Path(p).read_text())
def put(name,v):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True);s=(v if isinstance(v,str)else json.dumps(v,ensure_ascii=False,indent=2))+'\n'
 if p.exists():assert p.read_text()==s,p
 else:
  t=p.with_suffix(p.suffix+'.tmp');t.write_text(s);os.replace(t,p)
 return bind(p)
def verify(v):
 p=R/v['path'];assert sha(p)==v['sha256'].removeprefix('sha256:'),(str(p),'digest drift');assert 'bytes'not in v or p.stat().st_size==v['bytes'];return bind(p)
g=read(D/'current204-whole-eighteen-author-guards.technical.json');ids=g['selectedGoalIds'];assert len(ids)==18 and len(g['baselineStrictGoalIds204'])==204
for v in list(g['beforeBindings'].values())+g['protectedOtherFiles']:verify(v)
for vg in g['views']:verify(vg['binding'])
for am in g['currentAM']:
 for key in ['actualCurrentConfig','actualCurrentReview','futureImmutableReview']:verify(am[key])
 assert am['other390LinesExact']and am['other374OutsideScopeExact']and am['selected16UnchangedReviewedRowsExact']
for s in g['actualScienceAndSourceSeals'].values():verify(s['seal'])
# Preserve observed initial unsealed invalid metadata and exact repair chains.
correctionHistory={};repairRows=[]
for name,field in [('preseal-unsupported-mime-field-correction.actual.json','records'),('preseal-native-resource-type-correction.actual.json','changes')]:
 receipt=read(D/'checks'/name)
 for row in receipt[field]:
  snap=R/row['beforeSnapshot'];assert sha(snap)==row['beforeSha256'];bind(snap)
  correctionHistory[(row['path'],row['beforeSha256'])]=row['beforeSnapshot'];repairRows.append(row)
for row in repairRows:
 actual=sha(R/row['path'])
 assert actual==row['afterSha256']or any(r['path']==row['path']and r['beforeSha256']==row['afterSha256']for r in repairRows)
for name in ['initial-declared-inputs.technical.json','native-configs-declared-inputs.author.technical.json','native-eighteen-full392-raster-author-declared-inputs.technical.json']:
 for v in read(D/'checks'/name)['files']:
  actual=sha(R/v['path']);declared=v['sha256'].removeprefix('sha256:')
  if actual!=declared:
   assert (v['path'],declared)in correctionHistory,(v['path'],'unexplained preseal drift');bind(R/correctionHistory[(v['path'],declared)]);bind(R/v['path'])
  else:verify(v)
current=read(D/'candidate/canonical.current476.actual-raster.inactive.json');assert len(current['goals'])==476
validator=jsonschema.Draft202012Validator(read(R/'docs/landscape-runtime.schema.json'));validator.validate(current);validator.validate(read(D/'candidate/canonical.current476.source-only.inactive.json'))
term=read(D/'checks/native-eighteen-current392-raster-author-completed-v4.terminal.actual.json');assert term['actualExitCode']==0
terms=read(D/'checks/source-only-P18-AM392-atlas-v3.actual-terminals.json');assert terms['allActualExit0']and len(terms['terminals'])==6 and all(t['exitCode']==0 for t in terms['terminals'])
impact=read(D/'checks/native-current476-full392-31-scopes-and-actual18-page-impact.author.json');assert impact['other374WholeNativePagesExact']and impact['current204StrictWholePageBindingsExact']and len(impact['scopeRows'])==31 and len(impact['actual18WholePageDeltas'])==18
P=read(D/'checks/P18-whole-current-actual-raster-closed-schema-native-semantics.author.actual.json');assert P['recordCount']==18 and all(r['schemaErrors']==r['semanticErrors']==0 for r in P['records'])and P['reviewedResourceTypes']==['goal-visualization']and P['normalRasterCLI']=='pending_installation_after_independent_current_reviews'
pageMap=read(D/'checks/actual-eighteen-physical-page-map.author.json');pdfRender=read(D/'checks/actual-eighteen-physical-pages-scale1400.terminal.actual.json');assert pdfRender['actualExitCode']==0 and len(pdfRender['actualPhysicalPages18'])==18 and pageMap['actualGoalPageCount']==18 and pageMap['actualPhysicalPageCount']==20 and pageMap['actualFrontMatterPageCount']==2
physical={int(Path(v['path']).stem.rsplit('-',1)[1]):verify(v)for v in pdfRender['actualPhysicalPages18']}
for row in pageMap['pages']:row['actualPhysicalPNG']=physical[row['physicalPage']]
put('checks/eighteen-native-whole-page-and-36-width-image-map.actual.json',{'role':'Actual technical render inputs for independent review, not a visual verdict','actualPDF':bind(R/pageMap['actualNativePDF']),'actualPhysicalPages':pageMap['pages'],'captures':[read(D/f'width-captures/{gid}/chromium-captures.actual.json')for gid in ids],'renderingIsNotApproval':True,'activeWrites':0})
for gid in ids:
 receipt=read(D/f'width-captures/{gid}/chromium-captures.actual.json');assert receipt['goalId']==gid and sha(R/receipt['sourcePath'])==receipt['sourceSha256'];assert len(receipt['captures'])==2;actualPNGWidth,actualPNGHeight=struct.unpack('>II',(R/receipt['sourcePath']).read_bytes()[16:24])
 for c in receipt['captures']:
  verify({'path':c['path'],'sha256':c['sha256']});assert c['width']in [360,680]and c['measured']['naturalWidth']==actualPNGWidth and c['measured']['naturalHeight']==actualPNGHeight and c['measured']['renderedWidth']==c['width']
for side in ['a','b']:
 folder=D/'native-eighteen-author/eighteen'/('round-'+side);campaign=read(folder/'description-review-campaign.json');assert campaign['batchSize']==18 and len(campaign['batches'])==1 and campaign['blindToOtherReviews']and not(folder/'results').exists()
 for batch in campaign['batches']:
  f=folder/'batches'/(batch['batchId']+'.input.jsonl');assert sha(f)==batch['batchInputFingerprint'].removeprefix('sha256:')and len(f.read_text().splitlines())==18;bind(f)
manifest=read(D/'native-eighteen-author/eighteen/bundle/review-bundle-manifest.json')
for artifact in manifest['artifacts']:
 f=D/'native-eighteen-author/eighteen/bundle'/artifact['path'];assert sha(f)==artifact['digest'].removeprefix('sha256:')and f.stat().st_size==artifact['bytes'];bind(f)
entry=put('neutral-eighteen-current-raster-native-author-review.entry.json',{'schemaVersion':1,'role':'Neutral technical AUTHOR entry for two genuine blind final whole D/P/V18 reviews','currentActualBaseline':{'biologie':'204/392','chemie':'173/378','mathematik':'807/807','physik':'478/478'},'wholeCurrentCanonicalCount':476,'wholeCurrentAtomicCount':392,'goalIds':ids,'authorRoleNotIndependentReviewer':True,'wholeGoals':rel(D/'current-eighteen-whole-DEEN-goals.actual.json'),'whole36CompleteBilingualCases':rel(D/'whole-science/eighteen-whole-goals-thirty-six-complete-DEEN-cases.current-binding.md'),'whole36OriginalExactCaseJSON':rel(D/'whole-science/eighteen-whole-goals-thirty-six-complete-DEEN-cases.author.json'),'wholeP18CurrentRasterAIProfiles':rel(D/'positive/P18.current-whole.actual-raster-author.review.jsonl'),'nativeBundle':rel(D/'native-eighteen-author/eighteen/bundle'),'nativeWholePDF':pageMap['actualNativePDF'],'actualPhysicalPagesAnd36Widths':rel(D/'checks/eighteen-native-whole-page-and-36-width-image-map.actual.json'),'publicRootForContainedPortablePNG':rel(D),'roundA':rel(D/'native-eighteen-author/eighteen/round-a'),'roundB':rel(D/'native-eighteen-author/eighteen/round-b'),'trueNativeBatchSize18':True,'sourceV3NeutralEntry':g['sourceV3NeutralEntry'],'genuinePriorScienceAndSourceSeals':g['actualScienceAndSourceSeals'],'sourceV3MappingCandidate':g['sourceV3MappingCandidate'],'sourceV2ExtractionCandidate':g['sourceV2ExtractionCandidate'],'source18DutyBoundary':'15 bounded curricular and3 nonmandatory. Genuine existing whole DE/EN science/cases kept; two real targeted word corrections. Full144 source release not claimed; existing NeuroGK2 HOLD remains.','nativeRasterPAPI':'actual closed-v2 schema/fingerprints/native semantics0 with18 exact selected PNGs','ordinaryRasterPCLI':'pending_installation_after_independent_current_reviews','ordinarySourceOnlyPCLI':'actual0 separately, reviewedResourceTypes source-only intentionally explicit','current204StrictBindings':'actual whole native pages exact; zero integration/strict gain before paired final review and Root central terminal','reviewerInstructions':'Perform your own blind current whole D/P/V review on the actual18 source/case/native-page/raster inputs. Write your own scientific/visual reasons and first immutable judgments BEFORE seeing another final reviewer. Technical author artifacts are neither conclusions nor approval. Preserve genuine prior unchanged whole science cases; target actual current page/context/source/image bindings. Record reviewer runs only after real review, no placeholders.','independentFinalD_P_VReviewsPending':2,'independentCurrentReviewRecordsOrRunPlaceholders':0,'resolutionsOrD_VApprovals':0,'humanApproval':False,'humanTrial':False,'activeWrites':0,'strictGainClaimed':0})
put('TECHNICAL-AUTHOR-READINESS.md','# Biologie: 18 Evolutionsziele als native Rasterkandidaten\n\nDie tatsächliche Basis bleibt204/392. Kein aktiver Inhalt, keine Registry, kein historischer Nachweis und keine Qualitätsuntergrenze wurde geändert. Alle476Ganzziele sind gebunden; nur18neue Bildlinks und drei bereits unabhängig fachlich geprüfte Wortfelder in zwei Zielen unterscheiden sich. Alle458anderen WholeGoals,374anderen Ganzseiten,204strengen aktuellen Seitenbindungen und31Scope-/PrerequisiteOnly-Sets bleiben exakt erhalten.\n\nDer echte Standardloader liest392Vorher- und392Source-only-Nachherziele; die unveränderte native API bindet alle392Nachherziele mit tatsächlichen Kandidaten-PNGs. Das echte18Seitenbuch hat2Vorspannseiten und18vollständig gerenderte Lernzielseiten. Portables Standardbundle,18tatsächliche Rasterseiten3–20 bei scale-to1400 und36Chromium-Captures360/680 stehen bereit. Zwei separate blinde native Kampagnen haben tatsächlich batchSize18; keine Reviewerresultate, Runplatzhalter, Resolutionen oder D-/V-Freigaben existieren.\n\nSechs Standardchecks sind tatsächlich0: SourceAtlas392Generate/Check, expliziter Source-onlyP18Materializer/CLI, A392 und M392. Aktuelle RasterP18 bestehen geschlossene v2Schema- und native Fingerprint-/Semantik-APIs mit18echten PNGs, unveränderten WholeProfiles und36ganzen bilingualen Fällen. Die normale operative RasterP18CLI liest feste aktive Appassets und bleibt deshalb bis zur Installation unabhängig geprüfter Bilder offen. Source-onlyCLI ist keine Rasterfreigabe. E1/G1, ai_candidate und needs_human_review bleiben wahrheitsgemäß.\n\nDie echte Source-v3A/B-Paarung ist gebunden, nur18Entscheidungen in144 wurden fachlich gezielt geprüft und27Locatorfelder korrigiert;15Ziele sind curricular begrenzt und3nonmandatory. Eine Vollfreigabe144 wird nicht behauptet; der bestehende NeuroGK2HOLD bleibt getrennt. A/M392 behalten390andere Zeilen exakt und übernehmen nur die zwei echten bereits geprüften Wortkorrekturentscheidungen.\n\nVor der ersten Versiegelung wurden echte technische Fehler ausschließlich in eigenen unversiegelten Kandidaten korrigiert: unsupported mimeType entfernt, erforderliches resourceType=image ergänzt, Standardloader-Returnfeld richtig gelesen und Buffer-JSONL korrekt gezählt. Echte ursprüngliche Snapshotbytes und gescheiterte Terminals bleiben erhalten. Bereits erfolgreich erzeugte native PDF-/Bundle-/Kampagnenbytes wurden exakt wiederverwendet, nicht als neues Review ausgegeben.\n\nNächster Schritt sind zwei echte unabhängige finale Ganzziel-D/P/V-Prüfungen. Danach sind Rootintegration, operative RasterCLI und terminaler zentraler Fünf-Gate-Bericht erforderlich. Strenger Nettozuwachs vor diesen Schritten0; menschliche Freigabe und Erprobung bleiben offen.\n')
# Every own artifact and own authorized inert SourceAtlas output parses and is portable.
nonoperative=[]
for base in [D,B]:
 for f in sorted(base.rglob('*')):
  if not f.is_file():continue
  if f.suffix=='.json':json.loads(f.read_text())
  elif f.suffix=='.jsonl':
   for line in f.read_text().splitlines():json.loads(line)
  ignored=subprocess.run(['git','check-ignore','--no-index',rel(f)],capture_output=True,text=True)
  assert ignored.returncode in [0,1]
  if ignored.returncode==0:
   assert f in [D/'native-eighteen-author/eighteen/book.pdf',D/'native-eighteen-author/eighteen/book.html'],str(f)
   nonoperative.append({'path':rel(f),'role':'Historical raw native-render sourcePath only; byte-exact portable bundle copies are operative'})
  else:bind(f)
for path in list(REQ):
 f=R/path;r=subprocess.run(['git','check-ignore','--no-index',path],capture_output=True,text=True)
 if r.returncode==0:
  assert f in [D/'native-eighteen-author/eighteen/book.pdf',D/'native-eighteen-author/eighteen/book.html'];del REQ[path]
ignore=subprocess.run(['git','check-ignore','--no-index','--stdin'],input='\n'.join(REQ)+'\n',capture_output=True,text=True);assert ignore.returncode in [0,1]and not ignore.stdout.strip(),ignore.stdout
links=[]
for path in list(REQ):
 f=R/path
 if f.is_symlink():
  target=os.readlink(f);assert not os.path.isabs(target);resolved=f.resolve(strict=True);assert resolved.is_relative_to(D)and rel(resolved)in REQ;links.append({'path':path,'containedRelativeTarget':target,'target':bind(resolved),'broken':False})
assert len([x for x in links if x['path'].startswith(rel(D))])==18
portable=put('checks/first-author-required-portability-and-preserved-history.actual.json',{'checkedAt':datetime.now(timezone.utc).isoformat(),'requiredFiles':list(REQ.values()),'actualContainedRelativeAliases':links,'brokenRequiredSymlinks':0,'ignoredRequiredFiles':[],'actualGitCheckIgnoreExit':ignore.returncode,'allOwnAndAuthorizedInactiveJSONJSONLParse':True,'historicalUnsealedMetadataCorrectionChains':repairRows,'historicIgnoredRawNativeRenderObservations':nonoperative,'rawOfficialDownloadPDFs':'Snapshot digest provenance only; portable committed mappings/extractions/wholeofficialTXT are actual required inputs, no ignored cache dependence','operativeWholeNativePDFHTML':'Actual byte-exact native standard bundle','activeWrites':0,'strictGainClaimed':0,'humanApproval':False})
ownfiles=[bind(f)for f in sorted(D.rglob('*'))if f.is_file()and rel(f)not in {x['path']for x in nonoperative}]
seal=put('eighteen-current204-raster-native-author.first-input.freeze.json',{'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),'kind':'First immutable neutral technical AUTHOR input for two genuine blind final whole D/P/V18 reviewers','ownFiles':ownfiles,'authorizedInactiveAtlasFiles':[bind(f)for f in sorted(B.rglob('*'))if f.is_file()],'requiredPortableInputs':portable,'neutralEntry':entry,'genuinePriorScienceAndSourceSeals':g['actualScienceAndSourceSeals'],'current204StrictWholeBindingsKeptExact':True,'whole476Full392CurrentLoadersAndNativeRasterBound':True,'trueBlindNativeCampaigns2BatchSize18':True,'actualNativePDFGoalPages18':True,'actualChromiumWidthCaptures36':True,'actualNativeRasterP18ClosedSchemaAndSemantics0':True,'normalRasterPCLIPendingInstallation':True,'independentCurrentD_P_VDecisions':0,'fakeReviewerRunsOrPlaceholders':0,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'entry':entry,'firstAuthorSeal':seal,'portableInputCount':len(REQ),'ignoredRequired':0,'brokenRequiredAliases':0,'trueNative18PDFAnd36Widths':True,'currentStrict204Exact':True,'nativeRasterPAPI0':True,'ordinaryRasterPCLIPendingInstallation':True,'activeWrites':0,'strictGainClaimed':0}))
