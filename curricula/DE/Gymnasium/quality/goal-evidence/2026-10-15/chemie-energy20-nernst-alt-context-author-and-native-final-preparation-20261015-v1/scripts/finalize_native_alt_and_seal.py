# SPDX-License-Identifier: Apache-2.0
"""Finite final native20-v3 inputs, actual paging and raw metadata-only proof."""
import ast,hashlib,importlib.util,json,os,sys
from datetime import datetime,timezone
from pathlib import Path
import fitz
sys.dont_write_bytecode=True
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix();SEAL='FILES.finite-alt-author-native-preparation.seal.json'
assert not (OWN/SEAL).exists()
def read(p):return json.loads((ROOT/p).read_text())
def get(p):return json.loads((OWN/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):assert bind(r['path'])==r,r['path']
def write(p,d):(OWN/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
sel=get('INPUTS.exact-final-native20-alt-only.json');ids=sel['scopeGoalIds'];gid='a3386a86-f1ee-55b8-bcd5-03bfb1f9d987';mapping=get('checks/REBUILD.final-native560-alt-only.physical-map.json');host=ROOT/mapping['executionHost']
assert get('checks/PROFILE20.normal-schema-helper-one-input-only.actual.json')['pass'] and get('checks/DATA560.normal-schema-DAG-effective-semantic-M-identity.actual.json')['pass']
originalV=read(sel['originalVFirstSeal']['path']);verify(sel['originalVFirstSeal']);verify(sel['originalVFinding'])
for r in originalV['files']:verify(r)
before=read(sel['beforeCanonical560']['path']);after=read(sel['wholeCanonical560']['path']);B={g['id']:g for g in before['goals']};A={g['id']:g for g in after['goals']}
assert [g['id'] for g in after['goals'] if g!=B[g['id']]]==[gid]
assert (ROOT/sel['semantic560']['path']).read_bytes()==(ROOT/sel['beforeSemantic560']['path']).read_bytes()
assert (ROOT/sel['whole42Cases']['path']).read_bytes()==(ROOT/sel['sourceWhole42Cases']['path']).read_bytes()
verify(sel['historicalOriginalPrompt']);verify(sel['historicalPromptCopy']);assert (ROOT/sel['historicalOriginalPrompt']['path']).read_bytes()==(ROOT/sel['historicalPromptCopy']['path']).read_bytes()
profilePath=REL+'/candidate/twenty-author-E0G0.only-Nernst-input-binding.jsonl';oldLines=(ROOT/sel['beforeProfiles20']['path']).read_bytes().splitlines();newLines=(ROOT/profilePath).read_bytes().splitlines();assert len(oldLines)==len(newLines)==20
profiles=[json.loads(l) for l in newLines];P={r['goalId']:r for r in profiles};profileChanges=[]
for b,a in zip(oldLines,newLines):
 ob=json.loads(b);na=json.loads(a)
 if ob['goalId']==gid:
  assert [k for k in na if na[k]!=ob[k]]==['reviewInputFingerprint'];profileChanges.append(gid)
 else:assert a==b
 assert na['profile']==ob['profile'] and na['evidenceLevel']=='E0' and na['maximumClaimScope']=='G0' and na['reviewRunIds']==[]
assert profileChanges==[gid]
manifest=get('native-twenty/batch-manifest.json');model=get('native-twenty/bundle/book-model.json');assert manifest['goalIds']==ids and [p['goalId'] for p in model['pages']]==ids
oldNeutral=read(sel['originalNativeV2Neutral']['path']);oldModel=read(oldNeutral['nativeBookModel']['path']);oldPages={p['goalId']:p for p in oldModel['pages']};newPages={p['goalId']:p for p in model['pages']}
pageRadius=[{'goalId':i,'beforePageFingerprint':oldPages[i]['pageFingerprint'],'afterPageFingerprint':newPages[i]['pageFingerprint'],'pageFingerprintChanged':oldPages[i]['pageFingerprint']!=newPages[i]['pageFingerprint'],'goalFingerprintExact':oldPages[i]['goalFingerprint']==newPages[i]['goalFingerprint']} for i in ids]
assert all(r['goalFingerprintExact'] for r in pageRadius);assert [r['goalId'] for r in pageRadius if r['pageFingerprintChanged']]==[gid]
assert newPages[gid]['visualization']['altText']==read(sel['originalVFinding']['path'])['recommendedWholeAfterResourceLink']['altText']
write('checks/NATIVE20.actual-one-alt-page-context-radius.json',{'pass':True,'role':'Actual previous/final native model fingerprints, no D decision','unchanged19NativePageFingerprints':19,'changedOnlyNernstPageFingerprint':gid,'all20GoalFingerprintsExact':True,'actualFinalAltText':newPages[gid]['visualization']['altText'],'rows':pageRadius,'newVotes':0})
pdf=fitz.open(OWN/'native-twenty/bundle/book.pdf');pages=[]
for i,p in enumerate(pdf):
 text=p.get_text();pages.append({'physicalPdfPage':i+1,'goalIdsInActualPdfText':[x for x in ids if x in text],'textCharacters':len(text)})
assert len(pdf)==22 and not pages[0]['goalIdsInActualPdfText'] and not pages[1]['goalIdsInActualPdfText'];assert all(ids[i] in pages[i+2]['goalIdsInActualPdfText'] for i in range(20))
write('checks/PDF22.actual-two-fronts-twenty-final-goals.json',{'pass':True,'role':'Mechanical PDF paging only, no scientific D/V sighting','PDFPages':22,'frontPages':2,'targetPages':20,'rows':pages})
campaigns=[]
for suffix in ['a','b']:
 prefix='native-twenty/round-'+suffix;c=get(prefix+'/description-review-campaign.json');ri=get(prefix+'/description-review-input.json')
 assert c['blindToOtherReviews'] and c['reviewPass']=='first_pass' and c['goalCount']==20 and len(c['batches'])==1 and c['batches'][0]['goalIds']==ids
 assert not list((OWN/prefix/'results').iterdir());assert all('assignedTo' not in r and 'reviewerId' not in r for r in [c,*c['batches']])
 assert [r['goalId'] for r in ri['goals']]==ids
 for r in ri['goals']:assert r['reviewContext']['evidenceProfile']==P[r['goalId']]
 rg=next(r for r in ri['goals'] if r['goalId']==gid);assert rg['reviewContext']['page']['visualization']['altText']==newPages[gid]['visualization']['altText']
 campaigns.append({'round':suffix,'campaign':bind(REL+'/'+prefix+'/description-review-campaign.json'),'input':bind(REL+'/'+prefix+'/description-review-input.json'),'bundle':bind(REL+'/'+prefix+'/review-bundle-manifest.json'),'assignedReviewer':None,'resultRecords':0})
assert get('native-twenty/round-a/description-review-campaign.json')['independenceGroupId']!=get('native-twenty/round-b/description-review-campaign.json')['independenceGroupId']
commands=get('checks/COMMANDS.actual-native20-stock.json')['commands'];assert len(commands)==2 and all(r['exitCode']==0 for r in commands)
assert get('checks/PREFLIGHT31.actual-physical-closure-including-QA-child.json')['pass']
assert len(mapping['selectedCurrentAssetRows'])==434 and mapping['selectedCurrentAssetRows']==read(sel['oldPhysicalMap']['path'])['selectedCurrentAssetRows']
physical=[];hostBytes=0
for d,dirs,files in os.walk(host,followlinks=False):
 for n in files:
  p=Path(d)/n
  if not p.is_symlink():hostBytes+=p.stat().st_size
assert hostBytes<70*1024*1024
for r in mapping['selectedCurrentAssetRows']:
 verify(r['physicalRepositorySource'])
 if r['publicMustBePhysicalWithinHostPublicRoot']:
  p=host/r['normalPublicDestination'];assert not p.is_symlink() and p.read_bytes()==(ROOT/r['physicalRepositorySource']['path']).read_bytes();physical.append(r['goalId'])
assert len(physical)==19 and set(physical)==set(ids)-{'0773a104-aaeb-5e96-a615-2a2bec3eb096'}
for r in mapping['aliases']:
 verify(r['physicalRepositorySource']);p=host/r['normalHostAlias'];assert not p.is_symlink() and p.read_bytes()==(ROOT/r['physicalRepositorySource']['path']).read_bytes()
for r in mapping['stockPhysicalModules']:
 verify(r);p=host/r['path'];assert not p.is_symlink() and p.read_bytes()==(ROOT/r['path']).read_bytes()
assert len(mapping['stockPhysicalModules'])==31
qa=next(r['physicalRepositorySource'] for r in mapping['aliases'] if r['normalHostAlias']=='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json');assert qa==sel['QA438']
sourceRows=sel['sourceClosure']
for r in sourceRows:verify(r)
verify(sel['originalHoldsPlusM6']);verify(sel['blankOwnRecords'])
closure=[]
for label in ['originalNativeV2Seal','originalAuthorSeal']:
 verify(sel[label]);s=read(sel[label]['path'])
 for r in s['files']:verify(r)
 closure.append({'seal':sel[label],'listedFilesByteExact':len(s['files']),'originalWrites':False})
write('checks/ORIGINALS.all-byte-closure-and-no-new-science.actual.json',{'pass':True,'role':'Exact technical closure, no fresh primary reading/D-peer review or author visual approval','immutableClosures':closure,'originalVFirstSeal':sel['originalVFirstSeal'],'originalVPayloadFilesByteExact':len(originalV['files']),'historicalPromptExact':sel['historicalOriginalPrompt'],'datedContextAddendum':sel['currentContextAddendum'],'imagesChanged':0,'QA438Exact':True,'QAGeneratorExecuted':False,'HumanOrAIFieldsChanged':False,'newVotes':0,'whole42CasesExact':True,'all20ProfileBodiesExact':True,'other19RawLinesExact':True,'onlyOneRawInputFingerprintChanged':True,'sourceClosure':sourceRows,'sourceClosureIsNewPrimaryReading':False,'physicalImages':19,'globalAssetReferences':434,'physicalStockModules':31,'normalJsonAliases':51,'physicalHostBytes':hostBytes,'under70MiB':True,'freeBytesAfterNative':os.statvfs(ROOT).f_bavail*os.statvfs(ROOT).f_frsize,'fullTreeCopies':0,'olderHostWrites':0})
science=[bind(REL+'/native-twenty/bundle/'+n) for n in ['book.pdf','book.html','book-model.json','review-input.json']]
science += [bind(REL+'/candidate/twenty-whole-current560-goals.exact.json'),sel['whole42Cases'],bind(profilePath),sel['blankOwnRecords'],*sourceRows,sel['historicalPromptCopy'],sel['currentContextAddendum']]
selector={'schemaVersion':1,'role':'One authorized a338 altText author correction plus final Native20-v3 technical preparation; zero new scientific votes','scopeGoalIds':ids,'wholeBefore560':sel['beforeCanonical560'],'wholeCanonical560':sel['wholeCanonical560'],'semantic560Exact':sel['semantic560'],'QA438HistoricalExact':sel['QA438'],'oneWholeGoalAltCAS':bind(REL+'/CAS.one-whole-a338-goal-only-altText.json'),'oneRawProfileInputOnlyCAS':bind(REL+'/CAS.one-Nernst-raw-profile-input-only.json'),'whole20RawE0G0Profiles':bind(profilePath),'whole42Cases':sel['whole42Cases'],'originalVFirstSeal':sel['originalVFirstSeal'],'originalVFinding':sel['originalVFinding'],'originalVWholeTwo':sel['originalVFirstWholeTwo'],'historicalPromptExact':sel['historicalOriginalPrompt'],'currentDatedContextAddendum':sel['currentContextAddendum'],'scientificReviewInputs':science,'blankUnassignedCampaigns':campaigns,'nativeConfig':bind(REL+'/config/native20.normal-prepare-only.config.json'),'nativeManifest':bind(REL+'/native-twenty/batch-manifest.json'),'physicalRebuildMap':bind(REL+'/checks/REBUILD.final-native560-alt-only.physical-map.json'),'normalPrepareCheck':bind(REL+'/checks/COMMANDS.actual-native20-stock.json'),'actualNativePageContextRadius':bind(REL+'/checks/NATIVE20.actual-one-alt-page-context-radius.json'),'actualOriginalClosure':bind(REL+'/checks/ORIGINALS.all-byte-closure-and-no-new-science.actual.json'),'originalHoldsPlusSixMStales':sel['originalHoldsPlusM6'],'wholeGoalCount':560,'ordinaryAtomic':422,'other559WholeGoalsExact':True,'allDescriptionsAndRequiresContainsExact':True,'all20InnerProfileBodiesExact':True,'other19RawProfileLinesExact':True,'onlyOneRawPReviewInputFingerprintChanged':True,'profilePromotions':0,'MHashRefreshes':0,'freshVBoundary':'Original V-FIRST actually kept both image pixels and required this a338 alternative-text fix. This root authors only that exact fix and never creates an author V vote or fresh positive QA. Exact final-context V binding remains with the independent V reviewer.','blindDBoundary':'No D peer judgments read or copied by this task. Parent assigns matched final blank campaigns to the actual reviewers. All current scientificReviewInputs must be read; historicalV author rationale is not D approval.','noFurtherCandidateEditsBeforeFreshReviews':True,'imagesChanged':0,'newD':0,'newP':0,'newA':0,'newM':0,'newV':0,'newStrict':0,'oldM6AndSourceCourseAtomicityHoldsCleared':False,'centralExecuted':False,'activeIntegration':False,'humanApproval':False,'humanTrial':False,'M7':False}
write('INPUTS.final-native20-v3.physical-selector.json',selector)
write('NEUTRAL.final-nernst-alt-native20-v3.json',{'schemaVersion':1,'role':'Finite final Native20-v3 technical/metadata-author candidate; blankA/B,no votes','selector':bind(REL+'/INPUTS.final-native20-v3.physical-selector.json'),'wholeCanonical560':sel['wholeCanonical560'],'semantic560Exact':sel['semantic560'],'nativePDF':science[0],'nativeHTML':science[1],'nativeBookModel':science[2],'nativeReviewInput':science[3],'whole42Cases':sel['whole42Cases'],'whole20E0G0Profiles':bind(profilePath),'scopeGoalIds':ids,'blankUnassignedCampaigns':campaigns,'PDFPages':22,'frontPages':2,'targetPages':20,'onlyCanonicalDelta':'a338resourceLinks.primary.altText','other559WholeGoalsExact':True,'semanticAndMInputPayloadsExact':True,'all20ProfileBodiesExact':True,'other19RawLinesExact':True,'NernstOnlyRawInputBindingChanged':True,'allImageBytesAndHistoricalPromptExact':True,'currentContextAddendum':sel['currentContextAddendum'],'physicalModuleCount':31,'physicalImageCount':19,'globalAssetReferences':434,'physicalHostBytes':hostBytes,'stockPrepareCheckExitCodes':[r['exitCode'] for r in commands],'freshIndependentVBindingByAuthor':False,'noFurtherCandidateChangesBeforeDAndV':True,'sixMStalesAndSourceCourseAtomicityHoldsOpen':True,'newVotes':0,'newStrict':0,'centralExecuted':False,'activeIntegration':False,'M7':False,'finiteSealPath':REL+'/'+SEAL})
(OWN/'REVIEWER_INPUTS.md').write_text('''# Finale Native20-v3-Eingaben

Die zwei neuen normalen blinden Kampagnen sind leer, unassigned und an genau dieselben aktuellen20 Ziele/Profilkörper und denselben finalen PDF-/HTML-/BookModel-/ReviewInput-Bundle gebunden. Die native PDF hat22 Seiten:2 Fronten+20 Zielseiten. Root weist die echten unabhängigen Erst-/Fortsetzungsrollen zu. Dieses Paket liest oder kopiert keine D-Peerurteile und enthält keine Ergebnisrecords.

Vollständig lesen: sämtliche scientificReviewInputs im finalen physischen Selektor, alle42 ganzen DE/EN-Fälle, die20 ganzen E0/G0-Rohprofile, die leeren eigenen Recherche-/Praxisprotokolle und die ganzen gebundenen ursprünglichen Source-/Partnerkontexte. Der Originalprompt und die datierte heutige Kontextnotiz sind separat gebunden. Technische Quellenclosure ist keine neue fachliche Primärquellenlesung durch diesen Agenten.

Einziger kanonischer Nachfolger gegenüber Native20-v2: a338s alternative Bildbeschreibung entspricht exakt dem versiegelten unabhängigen V-FIRST-Befund. Sie benennt reversible Temperatur-/Aktivitätsbedingungen und trennt die Lampe als Energienutzung von nicht berechneten Lastverlusten.559 andere ganze Ziele,Semantic560,M-Eingangspayloads,alle42 Fälle und sämtliche Beschreibungen/Voraussetzungen bleiben exakt. Alle20 Profilkörper bleiben exakt; nur a338s tatsächlicher ReviewInputFingerprint ist technisch neu gebunden.19 andere ganze Rohzeilen bleiben bytegleich. Keine P-Promotion/M-Refresh oder neue wissenschaftliche Entscheidung.

Die historischen Bilder16b/a338 und alle übrigen ausgewählten Bildbytes bleiben unverändert. Originaler Generation-Prompt unverändert, keine Neugenerierung behauptet. Die tatsächliche V-FIRST-Pixelsichtung ist als externe Provenienz gebunden; dieser Autor erteilt keinen V-Vote und ersetzt keine echte finale Kontextbindung. QA438 bleibt historische Originaldatei; Human-/AI-Felder werden nicht verändert.0773 bleibt ohne Bild. Alle sechs M-Stales,c21-Atomarität,e64-Kursgrenze und sämtliche Source-/Course-/Inventoryholds bleiben offen. Eigene fiktive Daten/Lösungen sind keine Lerner-/Laborausführung und Human-Trials kein Maschinen-M7-Gate.

Dies ist die letzte belegte Metadatakorrektur vor den frischen D-/V-Prüfungen; keine weiteren Kandidatenänderungen. KeinCentral/Git/Runtime-/Aktivwrite. Eigene technische Skripte/Metadaten Apache-2.0; fachliche eigene Inhalte bleiben CC-BY-4.0, externe Provenienz bleibt separat.
''')
(OWN/'RESUME.md').write_text('''# Finaler Native20-v3-Handoff mit einem Nernst-Alttext-CAS

Ein autorisierter ganzer a338-Ziel-CAS ändert ausschließlich resourceLinks.primary.altText exakt nach dem echten V-FIRST-Befund.559 andere Ziele,Semantic560,alle42 Fälle,M-Payloads und sämtliche Beschreibungen/Voraussetzungen bleiben exakt. Alle20 E0/G0-Profilkörper unverändert; nur der tatsächliche a338-ReviewInputFingerprint neu,19 andere Zeilen bytegleich. Historischer prompt.de.md und alle Bildbytes bleiben exakt; datierte Kontextnotiz bindet alte Provenienz und heutige reversible-/Lastgrenze, ohne Neugenerierung oder V-Freigabe zu behaupten.

Normales prepare/check jeweils0. Echte22-seitige PDF(2Fronten+20Ziele),HTML/model/input; zwei neue leere unassigned A/B-Kampagnen. Aktueller Alttext steht tatsächlich im nativen a338-Modell und beiden aktuellen Revieweingängen.19 andere native Seitenfingerprints und alle20 GoalFPs exakt, nur Nernst-PageFP geändert. Stockdaten-/Profilhelper/DAG/effektive Voraussetzungen und14 gezielte technische Conditions bestanden. QA438/Human-/AI-Felder bleiben unverändert; eine echte finale unabhängige Kontextbindung bleibt beim V-Reviewer, kein Autor-Vote.

Neuer privater Sparsehost unter70MiB:31 physische Stockmodule inkl dynamischem QA-Kind und Modell,51 normale physische JSON-Aliasse,434 globale originale Energie-Bildreferenzen,nur19 Zielbilder physisch. Keine Vollbäume/Alt-Hoständerungen. Alle ursprünglichen Autoren-/Nativepakete unverändert, keine D-Peerurteile gelesen/kopiert. SechsM-Stales/0773/c21/e64 und alle Source-/Course-/Inventoryholds offen. KeinCentral/Git/CI/Runtime-/Aktivwrite und keine neuen Votes/Strictabschlüsse. Keine weiteren Kandidatenänderungen bis frische D/V-Prüfungen fertig. Nach endlichem Siegel STOP.
''')
jsons=jsonls=pys=0
for p in OWN.rglob('*'):
 assert not p.is_symlink(),p
 if not p.is_file():continue
 if p.suffix=='.json':assert p.read_bytes().endswith(b'\n'),p;json.loads(p.read_bytes());jsons+=1
 elif p.suffix=='.jsonl':
  data=p.read_bytes();assert not data or data.endswith(b'\n'),p
  for l in data.splitlines():json.loads(l)
  jsonls+=1
 elif p.suffix=='.py':ast.parse(p.read_text(),filename=str(p));pys+=1
spec=importlib.util.spec_from_file_location('skillpilot_normal_validator',ROOT/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);errors=m.curriculum_symlink_errors(ROOT);assert not errors,errors
write('checks/FINAL.normal-JSON-JSONL-AST-portability.actual.json',{'pass':True,'normalFunction':'curriculum_symlink_errors','normalSource':bind('scripts/validate_schemas.py'),'errors':errors,'readOnlyGitDiscoveryUsedByHelper':True,'wholeJsonParsedBeforeReceipt':jsons,'wholeJsonlParsed':jsonls,'pythonASTParsed':pys,'actualTerminalNewlines':True,'newVotes':0})
conditions=['only-one-whole-a338-altText-CAS-559-other-goals-exact','semantic560-and-all-M-input-payloads-exact','whole42-cases-exact','20-profile-bodies-and19-raw-lines-exact-only-one-InputFP','historical-prompt-exact-dated-context-addendum-no-generation','V-first-bound-QA438-Human-AI-originals-exact-no-author-vote','global434-energy-asset-map-only19-physical','physical31module-preflight-including-dynamicQA','private-host-under70MiB','unmodified-stock-prepare-exit0','unmodified-stock-check-exit0','actual-PDF22-HTML-model-one-Nernst-native-page-radius','two-blank-unassigned-matched20-review-inputs','normal-JSON-JSONL-PythonAST-symlink-and-all-M6-sourceholds-open']
write('checks/FOURTEEN.targeted-normal-technical-conditions.actual.json',{'pass':True,'technicalConditions':14,'conditions':[{'id':i+1,'condition':n,'pass':True} for i,n in enumerate(conditions)],'notScientificApprovals':True,'newVotes':0})
files=[bind(p.relative_to(ROOT).as_posix()) for p in sorted(OWN.rglob('*')) if p.is_file()]
seal={'schemaVersion':1,'role':'Finite final one-alt author/native20-v3 preparation seal,self excluded;STOP','sealedAtUTC':datetime.now(timezone.utc).isoformat(),'neutralSelector':bind(REL+'/NEUTRAL.final-nernst-alt-native20-v3.json'),'physicalSelector':bind(REL+'/INPUTS.final-native20-v3.physical-selector.json'),'payloadFiles':len(files),'payloadBytes':sum(r['bytes'] for r in files),'files':files,'wholeGoals':560,'ordinaryAtomic':422,'nativeTargetPages':20,'frontPages':2,'blankUnassignedRounds':2,'newVotes':0,'newStrict':0,'allHoldsUnwaived':True,'furtherCandidateEditsBeforeFreshReviews':False,'centralExecuted':False,'activeIntegration':False,'M7':False,'STOP':True};write(SEAL,seal)
print(json.dumps({'neutralSelector':bind(REL+'/NEUTRAL.final-nernst-alt-native20-v3.json'),'seal':bind(REL+'/'+SEAL),'payloadFiles':len(files),'payloadBytes':seal['payloadBytes'],'hostPhysicalBytes':hostBytes,'fourteenTechnicalConditions':'PASS','normalSymlinkErrors':len(errors),'STOP':True}))
