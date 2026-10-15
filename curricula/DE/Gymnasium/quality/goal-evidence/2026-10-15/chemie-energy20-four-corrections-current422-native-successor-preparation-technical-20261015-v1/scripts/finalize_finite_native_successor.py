# SPDX-License-Identifier: Apache-2.0
"""Fourteen concrete technical conditions, finite selector and last-write seal."""
import ast,hashlib,importlib.util,json,os,sys
from datetime import datetime,timezone
from pathlib import Path
import fitz
sys.dont_write_bytecode=True
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix();SEAL='FILES.finite-native-successor.seal.json'
assert not (OWN/SEAL).exists()
def read(p):return json.loads((ROOT/p).read_text())
def get(p):return json.loads((OWN/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):assert bind(r['path'])==r,r['path']
def write(p,d):(OWN/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
sel=get('INPUTS.exact-sealed-four-corrections-native20.json');ids=sel['scopeGoalIds'];mapping=get('checks/REBUILD.current422-native560-four-corrections.physical-map.json');host=ROOT/mapping['executionHost']
model=get('native-twenty/bundle/book-model.json');manifest=get('native-twenty/batch-manifest.json');assert manifest['goalIds']==ids and model['book']['pageCount']==20
assert [p['goalId'] for p in model['pages']]==ids
for original,copied in [('sourceWholeCanonical560','wholeCanonical560'),('sourceSemantic560','semantic560')]:verify(sel[original]);verify(sel[copied]);assert (ROOT/sel[original]['path']).read_bytes()==(ROOT/sel[copied]['path']).read_bytes()
author=read(sel['sealedAuthorSelector']['path']);caseBefore=author['wholeAfter42Cases'];profileBefore=author['whole20RawE0G0Profiles'];verify(caseBefore);verify(profileBefore)
assert (ROOT/caseBefore['path']).read_bytes()==(ROOT/sel['wholeCases42']['path']).read_bytes()
assert (ROOT/profileBefore['path']).read_bytes()==(ROOT/sel['rawProfiles20E0G0']['path']).read_bytes()
cases=read(sel['wholeCases42']['path'])['cases'];assert len(cases)==42 and sum(len(c['criterionToObservableRubric']) for c in cases)==126
profiles=[json.loads(l) for l in (ROOT/sel['rawProfiles20E0G0']['path']).read_text().splitlines()];P={r['goalId']:r for r in profiles};assert list(P)==ids
assert all(r['evidenceLevel']=='E0' and r['maximumClaimScope']=='G0' and r['reviewRunIds']==[] for r in profiles)
campaigns=[]
for suffix in ['a','b']:
 prefix='native-twenty/round-'+suffix;c=get(prefix+'/description-review-campaign.json');ri=get(prefix+'/description-review-input.json')
 assert c['blindToOtherReviews'] and c['reviewPass']=='first_pass' and c['goalCount']==20 and len(c['batches'])==1
 assert c['batches'][0]['goalIds']==ids and not list((OWN/prefix/'results').iterdir())
 assert all('assignedTo' not in row and 'reviewerId' not in row for row in [c,*c['batches']])
 assert [g['goalId'] for g in ri['goals']]==ids
 for g in ri['goals']:assert g['reviewContext']['evidenceProfile']==P[g['goalId']]
 campaigns.append({'round':suffix,'campaign':bind(REL+'/'+prefix+'/description-review-campaign.json'),'input':bind(REL+'/'+prefix+'/description-review-input.json'),'bundle':bind(REL+'/'+prefix+'/review-bundle-manifest.json'),'assignedReviewer':None,'resultRecords':0,'blindToOtherReviews':True})
assert get('native-twenty/round-a/description-review-campaign.json')['independenceGroupId']!=get('native-twenty/round-b/description-review-campaign.json')['independenceGroupId']
pdf=fitz.open(OWN/'native-twenty/bundle/book.pdf');pages=[]
for i,page in enumerate(pdf):
 text=page.get_text();pages.append({'physicalPdfPage':i+1,'goalIdsInActualPdfText':[x for x in ids if x in text],'textCharacters':len(text),'sizePoints':[page.rect.width,page.rect.height]})
assert len(pdf)==22 and not pages[0]['goalIdsInActualPdfText'] and not pages[1]['goalIdsInActualPdfText']
assert all(ids[i] in pages[i+2]['goalIdsInActualPdfText'] for i in range(20))
write('checks/PDF22.actual-two-fronts-twenty-target-pages.json',{'pass':True,'role':'Mechanical paging check, not scientific D/V sighting','physicalPdfPages':22,'frontPages':2,'targetPages':20,'rows':pages})
globalBefore=read(sel['original20PhysicalMap']['path']);assert mapping['selectedCurrentAssetRows']==globalBefore['selectedCurrentAssetRows'] and len(mapping['selectedCurrentAssetRows'])==434
assets=[];allPhysical=[]
for d,dirs,files in os.walk(host,followlinks=False):
 for n in files:
  p=Path(d)/n
  if not p.is_symlink():allPhysical.append(p)
hostBytes=sum(p.stat().st_size for p in allPhysical);assert hostBytes<70*1024*1024
for r in mapping['selectedCurrentAssetRows']:
 verify(r['physicalRepositorySource'])
 if r['publicMustBePhysicalWithinHostPublicRoot']:
  p=host/r['normalPublicDestination'];assert not p.is_symlink() and p.read_bytes()==(ROOT/r['physicalRepositorySource']['path']).read_bytes();assets.append(r['goalId'])
assert len(assets)==19 and set(assets)==set(ids)-{'0773a104-aaeb-5e96-a615-2a2bec3eb096'}
for r in mapping['aliases']:
 verify(r['physicalRepositorySource']);p=host/r['normalHostAlias'];assert not p.is_symlink() and p.read_bytes()==(ROOT/r['physicalRepositorySource']['path']).read_bytes()
assert get('checks/PREFLIGHT31.actual-physical-modules-including-dynamic-QA.json')['pass']
for r in mapping['stockPhysicalModules']:
 verify(r);p=host/r['path'];assert not p.is_symlink() and p.read_bytes()==(ROOT/r['path']).read_bytes()
assert len(mapping['stockPhysicalModules'])==31
qaAlias=next(r for r in mapping['aliases'] if r['normalHostAlias']=='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json');assert qaAlias['physicalRepositorySource']==sel['QA438']
assert (host/qaAlias['normalHostAlias']).read_bytes()==(ROOT/sel['QA438']['path']).read_bytes()
assert len(read(sel['QA438']['path'])['records'])==438
fresh=get('V2.two-description-image-context-freshness.OPEN.json');assert all(r['freshTargetContextV2Review']=='OPEN' and not r['newAIApprovalClaim'] for r in fresh['records'])
commands=get('checks/COMMANDS.actual-native20-stock.json')['commands'];assert len(commands)==2 and all(r['exitCode']==0 for r in commands)
immutable=[]
for label in ['sealedAuthorSeal','original20NativeSeal']:
 verify(sel[label]);seal=read(sel[label]['path'])
 for r in seal['files']:verify(r)
 immutable.append({'seal':sel[label],'listedFilesVerifiedByteExact':len(seal['files']),'originalWrites':False})
sourceClosure=[]
for r in sel['completeSourceAndPartnerClosure']:verify(r);sourceClosure.append(r)
verify(sel['blankOwnRecords']);verify(sel['originalHoldsPlusM6'])
write('checks/ORIGINALS.actual-immutable-source-material-QA-and-host-byte-closure.json',{'pass':True,'role':'Technical whole-byte closure; no claim to a fresh primary-source science read','originalClosures':immutable,'sourceAndPartnerClosure':sourceClosure,'independentPrimaryScienceReadClaimed':False,'wholeCaseCopiesExact':42,'rawProfileCopiesExact':20,'bothNativeInputsContainWholeProfilesExact':True,'QA438Exact':True,'QAStockGeneratorExecuted':False,'metadataOrHumanFieldsChanged':False,'newVisualVotes':0,'twoVContextFreshnessHoldsOpen':True,'global434ImageMapExact':True,'physicalImages':19,'physicalImageGoalIds':assets,'physicalHostBytes':hostBytes,'under70MiB':True,'normalPhysicalJsonAliases':len(mapping['aliases']),'stockPhysicalModules':31,'freeBytesAfterNative':os.statvfs(ROOT).f_bavail*os.statvfs(ROOT).f_frsize,'fullTreeCopies':0,'earlierHostWrites':0})
science=[bind(REL+'/native-twenty/bundle/'+p) for p in ['book.pdf','book.html','book-model.json','review-input.json']]
science += [bind(REL+'/candidate/twenty-whole-current560-goals.exact.json'),sel['wholeCases42'],sel['rawProfiles20E0G0'],sel['blankOwnRecords'],*sourceClosure]
selector={'schemaVersion':1,'role':'Finite technical corrected Native20 successor; no D/P/A/M/V review','scopeGoalIds':ids,'wholeCanonical560':sel['wholeCanonical560'],'semantic560':sel['semantic560'],'QA438HistoricalExact':sel['QA438'],'originalSealedAuthorSelector':sel['sealedAuthorSelector'],'originalSealedAuthorSeal':sel['sealedAuthorSeal'],'originalNative20Neutral':sel['original20NativeNeutral'],'originalNative20Seal':sel['original20NativeSeal'],'originalWholeMaterialSelector':sel['originalWholeAuthorMaterialSelector'],'wholeTwoGoalCAS':sel['twoGoalCAS'],'wholeTwoCaseCAS':sel['twoCaseCAS'],'scientificReviewInputs':science,'blankUnassignedCampaigns':campaigns,'nativeConfig':bind(REL+'/config/native20.normal-prepare-only.config.json'),'nativeManifest':bind(REL+'/native-twenty/batch-manifest.json'),'normalAliasTransportCAS':bind(REL+'/CAS.normal-alias-and-profile-material-input-transport.json'),'physicalRebuildMap':bind(REL+'/checks/REBUILD.current422-native560-four-corrections.physical-map.json'),'actualNormalCommands':bind(REL+'/checks/COMMANDS.actual-native20-stock.json'),'actual31ModulePreflight':bind(REL+'/checks/PREFLIGHT31.actual-physical-modules-including-dynamic-QA.json'),'actualByteClosure':bind(REL+'/checks/ORIGINALS.actual-immutable-source-material-QA-and-host-byte-closure.json'),'twoImageVContextFreshnessOPEN':bind(REL+'/V2.two-description-image-context-freshness.OPEN.json'),'originalHoldsPlusSixMTextStales':sel['originalHoldsPlusM6'],'rawEvidenceLevel':'E0','rawClaimScope':'G0','caseCount':42,'wholeGoals':560,'ordinaryAtomic':422,'PDFPages':22,'frontPages':2,'targetPages':20,'caseMaterialPointers':'All original author paths and hashes in profile bodies remain exact; selected current whole42-case copy is byte-identical to that exact sealed source.','blindReviewerRouting':'Read every current scientificReviewInput and assigned blank round. Parent assigns freshB and resumedA separately. Author/oldFIRST provenance is historical outside a fresh blind review; no peer result files are supplied by these blank campaigns.','sourceClosureIsFreshPrimaryReading':False,'newVotes':0,'newStrict':0,'canonicalDeltasRelativeToSealedAuthor560':0,'profileFieldsEdited':0,'PProfilePromotions':0,'MHashRefreshes':0,'oldFourPlusNewTwoMTextStalesStillOpen':True,'sourceCourseAtomicityHoldsCleared':False,'nativeOnly':True,'centralExecuted':False,'activeIntegration':False,'humanApproval':False,'humanTrial':False,'M7':False}
write('INPUTS.final-corrected-native20.physical-selector.json',selector)
write('NEUTRAL.final-four-corrections-native20-successor.json',{'schemaVersion':1,'role':'Technical Native20 successor, genuinely blank/unassignedA/B, no review vote','selector':bind(REL+'/INPUTS.final-corrected-native20.physical-selector.json'),'wholeCanonical560':sel['wholeCanonical560'],'semantic560':sel['semantic560'],'nativePDF':science[0],'nativeHTML':science[1],'nativeBookModel':science[2],'nativeReviewInput':science[3],'whole42Cases':sel['wholeCases42'],'whole20E0G0Profiles':sel['rawProfiles20E0G0'],'scopeGoalIds':ids,'blankUnassignedCampaigns':campaigns,'PDFPages':22,'frontPages':2,'targetPages':20,'stockPrepareCheckExitCodes':[r['exitCode'] for r in commands],'physicalModulesIncludingDynamicQA':31,'globalAssetReferences':434,'physicalImages':19,'actualHostPhysicalBytes':hostBytes,'QA438HistoricalExact':True,'twoImageVTargetContextFreshness':'OPEN16b/a338; no new AIapproval/hash-maintenance claim','old4PlusNew2MStales':'OPEN6; no fingerprint refresh','sourceCourseAtomicityHoldsCleared':False,'newVotes':0,'newStrict':0,'centralExecuted':False,'activeIntegration':False,'M7':False,'finiteSealPath':REL+'/'+SEAL})
(OWN/'REVIEWER_INPUTS.md').write_text('''# Korrigierte Native20-Eingaben

Der finale physische Selektor bindet die zwanzig ganzen ursprünglichen Ordinary-Ziele, eine native PDF mit zwei Frontseiten und zwanzig Zielseiten, HTML, BookModel und vollständigen ReviewInput. Die aktuellen42 ganzen DE/EN-Fälle, alle20 E0/G0-Rohprofile, die leeren eigenen Recherche-/Praxisprotokolle und sämtliche ganzen originalen Quellen-/Partnerkontexte sind vollständig über `scientificReviewInputs` gebunden. Beide Kampagnen sind normale blinde Erstpass-Vorbereitungen, leer und ohne zugewiesenen Reviewer. Root weist FreshB und ResumedA gesondert zu; hier entstehen keine Reviewergebnisse. Keine historische Peer-Ergebnisdatei ist in den blanken Kampagnen enthalten.

Grundlage ist ausschließlich das versiegelte Vier-Korrekturen-Autorenpaket mit zwei Zieltextkorrekturen(16bEN,a338DE/EN) und zwei Fallkorrekturen(05aLFP-Zustand,17bAbbauverhalten gegenüber aquatischer Wirkung/Exposition). Ganze Vorher-/Nachher-CAS bleiben im autoritativen Autorenroot gebunden. Canonical560, Semantic560,42-Fall-Datei und20Profilzeilen werden bytegenau übernommen; keine neue Semantik, kein Profilfeld-/Fingerprintrefresh und keine positive P-Promotion durch diese technische Vorbereitung.

Die originale QA438 bleibt bytegenau. Alle18 bestehenden Bilder und die genuine0cf2-V1-Abbildung werden unverändert gezeigt. Insbesondere die älteren Bildurteile für16b unda338 sind historische Bindungen ihrer damaligen Zielkontexte; eine echte V2-Prüfung der neuen Zielbeschreibungen bleibt OPEN. Darstellung und übereinstimmender Bildhash sind keine neue AI-Freigabe. Der QA-Generator wird hier nicht ausgeführt; alte Humanfelder werden weder geändert noch auf neue Bytes kopiert.0773 bleibt ohne Bild und mit Quellenhold.

Alle sechs M-Textstales(alt4+neu16b/a338),c21s unabhängige LK-Kompetenzen,e64s GK-/LK-Kursgrenze und sämtliche Quellen-/Kurs-/Inventoryholds bleiben offen. Alle eigenen fiktiven Daten und Lösungen bleiben Material, keine tatsächliche Lerner-/Recherche-/Laborausführung. Zukünftige echte Beobachtung bei praktischen Quellenoperatoren bleibt als Profilanforderung erhalten; Human-Trials sind kein Maschinen-M7-Gate.

Die Quellenclosure wurde technisch vollständig über Originaldateien, Hashes und ganze Kontexte gebunden. Das ist keine Behauptung einer neuen primären fachlichen Quellenprüfung durch diesen Vorbereitungsagenten. Frische unabhängige Reviewer müssen die ganzen aktuellen Eingaben selbst lesen. Keine neuen D/P/A/M/V-Voten, keine zentrale Messung, keine aktive Integration.
''')
(OWN/'RESUME.md').write_text('''# Endlicher technischer Native20-V2-Handoff

Normales unverändertes prepare/check jeweils exit0; echte native PDF22 Seiten=2Fronten+20ganzeZiele,HTML/BookModel/ReviewInput. Zwei neue normale blinde Kampagnen sind wirklich leer und unassigned.20ganze Original-E0/G0-Profile stehen in beiden Eingängen exakt;42volleDE/EN-Fälle,126Rubriken,Blankprotokolle und ganze originale Source-/Partnerclosure sind gebunden. Keine neue unabhängige Quellenlese-/Reviewbehauptung.

Canonical560 und Semantic560 werden exakt aus dem versiegelten Vier-Korrekturen-Autorennachfolger übernommen; keine weiteren Deltas, keine Kindersplits. Das ursprüngliche Energie20-Nativepaket und alle Autororiginale bleiben unverändert. Die ganze434er Bildreferenzmap stammt ausschließlich aus der alten Energie20-Vorbereitung, einschließlich genuine0cf2V1; keine frühere433er Memorymap verwendet. Nur19 benötigte Publicbilder physisch kopiert,0773 fehltweiter.

Der neue Sparsehost besitzt31 physische bytegleiche Stockmodule inklusive dynamischem generateGoalVisualizationQaLedgers.ts und goalVisualizationQaModel.ts sowie51physische normale JSON-Aliasse; unter70MiB. Preflight geschah vor prepare. Keine Public-/Backend-/Repo-Vollkopien, keine früheren Hosts geändert. QA438 bleibt exakt, Generator nicht ausgeführt.16b/a338 frische V-Zielkontextprüfung bleibt ausdrücklich OPEN; kein AIapproval als Hashpflege und keine Humanfeldübertragung. Sechs M-Textstales und alle Quellen-/Kurs-/Atomaritäts-/Inventoryholds bleiben offen. Keine neue P-Promotion/M-Refresh/Reviewvotes,keinCentral/Git/CI/Runtime-/Aktivwrite. Root weist FreshB und RetainedA/ResumedA auf die aktuellen ganzen Eingaben zu. Nach endlichem Siegel STOP.

Eigene technische Skripte/Metadaten Apache-2.0; eigenes Aufgabenmaterial behält CC-BY-4.0; externe Quellen behalten ihre ursprüngliche Attribution.
''')
jsons=jsonls=pys=0
for p in OWN.rglob('*'):
 assert not p.is_symlink(),p
 if not p.is_file():continue
 if p.suffix=='.json':assert p.read_bytes().endswith(b'\n'),p;json.loads(p.read_bytes());jsons+=1
 elif p.suffix=='.jsonl':
  b=p.read_bytes();assert not b or b.endswith(b'\n'),p
  for l in b.splitlines():json.loads(l)
  jsonls+=1
 elif p.suffix=='.py':ast.parse(p.read_text(),filename=str(p));pys+=1
spec=importlib.util.spec_from_file_location('skillpilot_normal_validator',ROOT/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);errors=m.curriculum_symlink_errors(ROOT);assert not errors,errors
write('checks/FINAL.normal-JSON-JSONL-AST-portability.actual.json',{'pass':True,'normalFunction':'curriculum_symlink_errors','normalSource':bind('scripts/validate_schemas.py'),'errors':errors,'readOnlyGitDiscoveryUsedByNormalHelper':True,'wholeJsonParsedBeforeReceipt':jsons,'wholeJsonlParsed':jsonls,'pythonASTParsed':pys,'actualTerminalNewlines':True,'newVotes':0})
conditions=[('same-original20-scope',True),('whole560-byte-exact-sealed-author',True),('semantic560-byte-exact-sealed-author',True),('whole20-E0G0-byte-exact-both-native-inputs',True),('whole42-cases126-rubrics-exact',True),('whole-original-source-closure-exact-no-primary-read-claim',True),('global434-image-map-exact-from-energy-prep',True),('only19-physical-images-host-under70MiB',True),('31-physical-stock-modules-including-dynamic-QA-preflight',True),('normal-stock-prepare-exit0',True),('normal-stock-check-exit0',True),('actual22-PDF-pages20-goals2-fronts-and-HTML-model',True),('two-blank-independent-unassigned-campaigns',True),('QA438-exact-V-context-open-M6-allholds-and-normal-portability',True)]
write('checks/FOURTEEN.targeted-technical-conditions.actual.json',{'pass':True,'technicalConditions':len(conditions),'conditions':[{'id':i+1,'condition':n,'pass':v} for i,(n,v) in enumerate(conditions)],'allScientificHoldsUnwaived':True,'not14ScientificApprovals':True,'newVotes':0})
files=[bind(p.relative_to(ROOT).as_posix()) for p in sorted(OWN.rglob('*')) if p.is_file()]
seal={'schemaVersion':1,'role':'Finite technical Native20 four-correction successor preparation seal; self excluded, STOP','sealedAtUTC':datetime.now(timezone.utc).isoformat(),'neutralSelector':bind(REL+'/NEUTRAL.final-four-corrections-native20-successor.json'),'physicalSelector':bind(REL+'/INPUTS.final-corrected-native20.physical-selector.json'),'payloadFiles':len(files),'payloadBytes':sum(r['bytes'] for r in files),'files':files,'normalTechnicalConditions':14,'nativeGoalPages':20,'nativeFrontPages':2,'blankUnassignedRounds':2,'newVotes':0,'newStrict':0,'allHoldsUnwaived':True,'centralExecuted':False,'activeIntegration':False,'M7':False,'STOP':True};write(SEAL,seal)
print(json.dumps({'neutralSelector':bind(REL+'/NEUTRAL.final-four-corrections-native20-successor.json'),'seal':bind(REL+'/'+SEAL),'payloadFiles':len(files),'payloadBytes':seal['payloadBytes'],'physicalHostBytes':hostBytes,'fourteenTechnicalConditions':'PASS','normalPortabilityErrors':len(errors),'STOP':True}))
