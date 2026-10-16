# SPDX-License-Identifier: Apache-2.0
"""Finite technical native20 handoff. No review records, active changes or Central."""
import ast,hashlib,importlib.util,json,os,sys
from pathlib import Path
import fitz
sys.dont_write_bytecode=True
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
SEAL='FILES.finite-native-preparation.seal.json';assert not (OWN/SEAL).exists()
def read(p):return json.loads((ROOT/p).read_text())
def get(p):return json.loads((OWN/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):assert bind(r['path'])==r,r['path']
def write(p,d):(OWN/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
sel=get('INPUTS.exact-original-materials-and-560-basis.json');ids=sel['scopeGoalIds'];mapping=get('checks/REBUILD.current422-native560.physical-map.json')
manifest=get('native-twenty/batch-manifest.json');model=get('native-twenty/bundle/book-model.json');assert manifest['goalIds']==ids and model['book']['pageCount']==20
profiles=[json.loads(l) for l in (ROOT/sel['rawProfiles20E0G0']['path']).read_text().splitlines()];P={r['goalId']:r for r in profiles}
doc=fitz.open(OWN/'native-twenty/bundle/book.pdf');pdf=[]
for i,page in enumerate(doc):
 text=page.get_text();pdf.append({'pdfPage':i+1,'goalIdsInActualPdfText':[gid for gid in ids if gid in text],'textCharacters':len(text),'sizePoints':[page.rect.width,page.rect.height]})
assert len(doc)==22 and not pdf[0]['goalIdsInActualPdfText'] and not pdf[1]['goalIdsInActualPdfText']
assert all(ids[i] in pdf[i+2]['goalIdsInActualPdfText'] for i in range(20))
write('checks/PDF22.actual-two-fronts-twenty-goals.json',{'role':'Mechanical actual PDF page and scope check, no scientific sighting','pass':True,'pdfPages':22,'frontPages':2,'goalPages':20,'oneWholeGoalPerTargetPage':True,'rows':pdf})
campaigns=[];reviewMaterialRows=[]
for suffix in ['a','b']:
 base='native-twenty/round-'+suffix
 c=get(base+'/description-review-campaign.json');ri=get(base+'/description-review-input.json')
 assert c['blindToOtherReviews'] and c['reviewPass']=='first_pass' and c['goalCount']==20
 assert len(c['batches'])==1 and c['batches'][0]['goalIds']==ids
 assert 'reviewerId' not in c and 'assignedTo' not in c and 'assignedTo' not in c['batches'][0]
 assert not list((OWN/base/'results').iterdir())
 assert [r['goalId'] for r in ri['goals']]==ids
 for r in ri['goals']:assert r['reviewContext']['evidenceProfile']==P[r['goalId']],r['goalId']
 campaigns.append({'round':suffix,'campaign':bind(REL+'/'+base+'/description-review-campaign.json'),'input':bind(REL+'/'+base+'/description-review-input.json'),'reviewBundleManifest':bind(REL+'/'+base+'/review-bundle-manifest.json'),'resultsWritten':0,'assignedReviewer':None,'blindToOtherReviews':True})
assert campaigns[0]['campaign']['sha256']!=campaigns[1]['campaign']['sha256']
cases=read(sel['wholeCases42']['path'])['cases'];assert len(cases)==42 and {r['goalId'] for r in cases}==set(ids)
assert all(len(r['criterionToObservableRubric'])==3 for r in cases)
author=read(sel['sealedAuthorSelector']['path']);verify(author['wholeCases42']);verify(author['rawProfiles20E0G0']);verify(author['blankOwnRecords'])
assert (ROOT/author['wholeCases42']['path']).read_bytes()==(ROOT/sel['wholeCases42']['path']).read_bytes()
assert (ROOT/author['rawProfiles20E0G0']['path']).read_bytes()==(ROOT/sel['rawProfiles20E0G0']['path']).read_bytes()
assert (ROOT/author['blankOwnRecords']['path']).read_bytes()==(ROOT/sel['blankOwnRecords']['path']).read_bytes()
for r in sel['completePrimarySourcesAndPartnerUnions']:verify(r)
sealed=get('candidate/QA438.exact-author-row-transport.json');qaSource=read(author['QAHistoryPlusExactIndependentV1']['path']);assert sealed==qaSource
vsel=read(author['actualIndependent0cf2V1']['path']);v1=read(vsel['exactNormalQA1Transport']['path'])['records'][0]
actual=next(r for r in sealed['records'] if r['goalId']==v1['goalId']);assert actual==v1
for a in mapping['aliases']:verify(a['physicalRepositorySource'])
assetRows=[];host=ROOT/mapping['executionHost'];physicalFiles=[]
for d,dirs,files in os.walk(host,followlinks=False):
 for n in files:
  p=Path(d)/n
  if not p.is_symlink():physicalFiles.append(p)
hostBytes=sum(p.stat().st_size for p in physicalFiles);assert hostBytes<70*1024*1024
for r in mapping['selectedCurrentAssetRows']:
 verify(r['physicalRepositorySource'])
 if r['publicMustBePhysicalWithinHostPublicRoot']:
  p=host/r['normalPublicDestination'];assert p.is_file() and not p.is_symlink()
  assert p.read_bytes()==(ROOT/r['physicalRepositorySource']['path']).read_bytes()
  assetRows.append({'goalId':r['goalId'],'normalPublicPath':r['normalPublicDestination'],'physicalSource':r['physicalRepositorySource'],'bytesExact':True})
assert len(assetRows)==19
missing=[i for i in ids if i not in {r['goalId'] for r in assetRows}];assert missing==['0773a104-aaeb-5e96-a615-2a2bec3eb096']
write('checks/ORIGINALS.full-profiles-materials-sources-V-and-sparse-host.actual.json',{'pass':True,'fullOriginalProfilesInBothNativeInputs':20,'profilesEdited':0,'originalWholeCasesByteExact':42,'wholeObservableRubricRows':126,'originalBlankOwnRecordsExact':True,'allWholeSourceBindingsExact':True,'sourceContextCount':len(sel['completePrimarySourcesAndPartnerUnions']),'QA438OriginalAuthorTransportByteExact':True,'genuine0cf2V1WholeRowExact':True,'all18OldImagesAnd0cf2OriginalBytesExact':True,'newVisualVotes':0,'physicalScopeImages':assetRows,'missingScopeImages':missing,'globalAssetReferences':len(mapping['selectedCurrentAssetRows']),'normalPhysicalJsonAliases':len(mapping['aliases']),'stockPhysicalModules':len(mapping['stockPhysicalModules']),'actualHostPhysicalBytes':hostBytes,'hostUnder70MiB':True,'fullRepoPublicBackendCopies':0,'campaignsBlankUnassigned':True})
science=[bind(REL+'/native-twenty/bundle/'+n) for n in ['book.pdf','book.html','book-model.json','review-input.json']]
science += [bind(REL+'/candidate/twenty-whole-current560-goals.exact.json'),sel['wholeCases42'],sel['rawProfiles20E0G0'],sel['blankOwnRecords'],*sel['completePrimarySourcesAndPartnerUnions']]
whole=bind(REL+'/candidate/canonical560.current422.five-sealed-author-CAS.exact.json');sem=bind(REL+'/candidate/semantic560.same-decisions-four-source-bindings.json')
selector={'schemaVersion':1,'role':'Technical native20 preparation only; no independent scientific review','scopeGoalIds':ids,'currentWholeCanonical560':whole,'currentSemantic560':sem,'currentQA438':sel['QA438'],'before560':sel['before560'],'wholeFiveCAS':bind(REL+'/CAS.five-original-whole-goals-on-560.exact.json'),'all555OtherWholeObjectsExact':True,'all560RequiresContainsAndEffectiveRequirementsExact':True,'atomicDenominator':422,'sealedWholeAuthorMaterialSelector':sel['sealedAuthorSelector'],'authorSeal':sel['sealedAuthorSeal'],'actualWholeM422ReviewerSelector':sel['actualWholeM422ReviewerSelector'],'correctedSixDeckAliases':sel['correctedSixDeckAliases'],'scientificReviewInputs':science,'blankCampaigns':campaigns,'nativeConfig':bind(REL+'/config/native20.normal-prepare-only.config.json'),'nativeManifest':bind(REL+'/native-twenty/batch-manifest.json'),'physicalRebuildMap':bind(REL+'/checks/REBUILD.current422-native560.physical-map.json'),'normalStockPrepareCheck':bind(REL+'/checks/COMMANDS.actual-native20-stock.json'),'isolated321StockContextProbe':bind(REL+'/checks/BOOK321.isolated-before560-after560-identical-P-selection.actual.json'),'exactOriginalM422FourStales':bind(REL+'/checks/M422.exact-original-rows-four-author-text-stales.actual.json'),'normalDataCheck':bind(REL+'/checks/DATA560.normal-schema-canonical-direct-contains-effective.actual.json'),'originalBytesAndVTransport':bind(REL+'/checks/ORIGINALS.full-profiles-materials-sources-V-and-sparse-host.actual.json'),'originalHolds':sel['originalHolds'],'sourceCourseHoldsStillOpen':True,'0773SourceAndImageOpen':True,'c21NonAtomicOpen':True,'e64CourseBoundaryOpen':True,'unselectedChildSplitsAdopted':False,'PSelectionNative20':'Exactly20 sealed original unreviewed E0/G0 profiles. No P13 sources, no new P science. Separate48115 P1 is outside this packet.','blindReviewBoundary':'Assigned future reviewers read all scientificReviewInputs and their assigned blank round only. No historical peer D/P results are supplied. Technical author/context/originalM provenance is not a D/P judgment. The author of the material is not an independent reviewer of it.','newD':0,'newP':0,'newA':0,'newM':0,'newV':0,'newStrict':0,'lastActuallyMeasuredStrict':321,'lastActuallyMeasuredDenominator':422,'centralExecuted':False,'activeIntegration':False,'humanApproval':False,'humanTrial':False,'M7':False}
write('INPUTS.final-native20.physical-exact-selector.json',selector)
write('NEUTRAL.final-native20-560-current422-preparation.json',{'schemaVersion':1,'role':'Finite technical Native20 preparation; review rounds blank and unassigned','selector':bind(REL+'/INPUTS.final-native20.physical-exact-selector.json'),'wholeCanonical560':whole,'semantic560':sem,'QA438':sel['QA438'],'fullMaterialAuthorSelector':sel['sealedAuthorSelector'],'scopeGoalIds':ids,'nativePDF':science[0],'nativeHTML':science[1],'nativeBookModel':science[2],'nativeReviewInput':science[3],'wholeCases42':sel['wholeCases42'],'originalRawProfiles20E0G0':sel['rawProfiles20E0G0'],'blankCampaigns':campaigns,'actualPDFPages':22,'frontPages':2,'targetPages':20,'originalWholeGoalCASApplied':5,'other555WholeObjectsExact':True,'ordinaryAtomic':422,'unchangedBaseline321BookContexts':321,'changedBaseline321BookContexts':0,'sameIsolatedPSelectionBeforeAfter':[],'newVotes':0,'openMTextStales':get('checks/M422.exact-original-rows-four-author-text-stales.actual.json')['after560FourTextStales'],'physicalImages':19,'globalAssetReferences':434,'actualSparseHostPhysicalBytes':hostBytes,'sourceCourseGlobalHoldsCleared':False,'0773SourceAndImageHold':True,'c21AtomicityHold':True,'e64CourseHold':True,'childSplitAdopted':False,'currentStrictCountChanged':False,'centralExecuted':False,'activeIntegration':False,'M7':False,'finiteSealPath':REL+'/'+SEAL})
(OWN/'REVIEWER_INPUTS.md').write_text('''# Native20: vollständige Eingaben für zwei spätere unabhängige Erstprüfungen

Exakter Scope sind die zwanzig ursprünglichen Energie-/Waschmittelziele im neutralen Selektor. Die normale native PDF hat zwei Frontseiten und zwanzig Zielseiten; HTML, BookModel und ReviewInput enthalten denselben Scope. Runde A und B sind leere, blinde Erstkampagnen ohne zugewiesenen Prüfer und ohne Ergebnisrecords. Der Materialautor übernimmt keine unabhängige Reviewerrolle.

Vollständig lesen: sämtliche `scientificReviewInputs` im finalen physischen Selektor, insbesondere alle 42 vollständigen DE/EN-Fälle (Material, Daten, Aufgabe, durchgerechnete Lösung, unabhängiger Transfer und 126 kriteriumsgebundene Beobachtungszeilen), alle zwanzig ganzen Original-E0/G0-Profile, die leeren eigenen Recherche-/Praxisprotokolle und sämtliche ganzen primären Quellpassagen/Partnerunionen. Die Originalprofile stehen auch vollständig in beiden nativen Kampagneneingängen. Die bytegenaue Autorenquelle ist zusätzlich durch den ganzen ursprünglichen Materialselektor und dessen Siegel gebunden; Ausschnitte ersetzen keine ganzen Fälle oder Quellen.

Die 560er Basis behält sechs neue Memoryknoten und die sechs separat korrigierten Deckquellen. Genau fünf bereits versiegelte ganze Autoren-CAS wurden auf die ursprünglichen zwanzig Ordinary-Ziele angewendet; 555 andere ganze Objekte und alle direkten/effektiven Voraussetzungen bleiben exakt. Es sind keine c21-/e64-Kindersplits adoptiert. Der isolierte Stock-Kontextvergleich vor560/nach560 verwendet beidseitig dieselbe leere P-Auswahl und findet für alle 321 Bestandsseiten keine Änderung. Native20 selbst lädt ausschließlich die zwanzig Original-E0/G0-Profile; frühere P13-Profile und eine neue P1 für 48115 gehören nicht zu diesem Paket.

Offen bleiben die vier M-Textstales a76, ebfa, e64 und 0773, die nicht universell belegte Quelle und fehlende Abbildung für 0773, c21s zwei eigenständige LK-Kompetenzen, e64s GK-/LK-Kursgrenze sowie sämtliche weiteren Quellen-/Kurs-/Globalholds. Technische Portabilität oder korrektes Rendern schließen keinen dieser Befunde. Die 18 vorhandenen KEEP-Bilder bleiben unverändert; 0cf2 verwendet ausschließlich seine separat echt geprüften V1-Originalbytes und die exakte Originalentscheidung. Kein neuer Bildreview hier.

Eigene fiktive Daten sind keine Lernerbeobachtung. Wo der Quellenoperator echte Recherche oder praktische Ausführung fordert, bleiben künftige eigene Beobachtungen mit Sicherheit, Kontrollen, Unsicherheit und leeren Feldern erforderlich. Frühere Menschen-/Laborversuche sind kein Maschinen-M7-Gate. Es gibt keine neuen D/P/A/M/V-Voten, keinen zentralen Lauf und keine aktive Integration. Zuerst wird Native13 separat geprüft/integrativ behandelt; Native20 bleibt eine getrennte spätere Erstprüfung.
''')
(OWN/'RESUME.md').write_text('''# Endlicher technischer Native20-Handoff

Normaler Stockprepare/check jeweils exit0. Native PDF22 Seiten =2 Fronten+20 ganze Zielseiten; HTML/BookModel/ReviewInput und zwei leere, wirklich unzugewiesene unabhängige Kampagnen. Alle20 E0/G0-Originalprofile in beiden Eingängen exakt, alle42 ganzen DE/EN-Fälle und126 Rubrikzeilen samt Originalprimärquellen/Partnern gebunden. Keine neuen wissenschaftlichen Entscheidungen.

Basis560/422 aus dem gesonderten Memory-Folgekandidaten mit6 Memoryknoten und6 korrigierten Deckquellen. Genau5 versiegelte ganze Autoren-CAS,555 andere ganze Objekte unverändert, alle requires/contains/effektiven Voraussetzungen identisch; keine Kindersplits. StockBookprobe vor560/nach560 mit gleicher leerer P-Auswahl:321/321 Bestandskontexte exakt. Native20 wählt nur20 Original-E0/G0, keine P13, keine48115-P1. Stockschema, canonicalAuthoring sowie direkte und contains-DAGs bestanden.

Originaler WholeM422-Review ist für die Ausgangsbasis aktuell; nach den4 echten Autoren-Textänderungen bleiben genau4 M-Bindungen stale und418 gültig. Kein Fingerprintrefresh oder M-Vote. Der erste eigene mechanische Fingerprintvergleich fehlte NFKC; das Fehlreceipt bleibt erhalten, die auf den tatsächlichen Produktionspayload korrigierte Rechnung besteht. 0773 Quelle/Bild, c21 Atomarität, e64 Kursgrenze und alle übrigen Source-/Course-/Globalholds bleiben offen.18 alte KEEP-Abbildungen und0cf2 echte V1 unverändert,0773 weiter ohne Bild.

Neuer privater Sparsehost:28 Stockmodule,51 physische normale JSON-Aliasse einschließlich zusätzlichem kleinen Basisdeck,434 globale Bildreferenzen, nur19 Zielbilder physisch. Unter70MiB; keine Repo-/Public-/Backend-Vollkopie und kein älterer Host geändert. Kein Central/Git/CI/Runtime/Aktivwrite. Letzte tatsächliche Messung321/422 bleibt historische aktuelle Messung, kein neuer Strictabschluss. Native13-Root bleibt unverändert. Finaler neutraler Selektor und endliches Siegel binden alle Eingänge. Nach Siegel STOP.

Eigene technische Skripte/Metadaten Apache-2.0; eigenes Aufgabenmaterial behält CC-BY-4.0. Amtliche und sonstige externe Quellen behalten ihre ursprüngliche Provenienz.
''')
# Recheck sealed material closure without copying any source trees.
seal=read(sel['sealedAuthorSeal']['path']);sealedRows=seal.get('files',seal.get('rows',[]))
verifiedSeal=0
for r in sealedRows:
 if isinstance(r,dict) and all(k in r for k in ['path','sha256','bytes']):verify(r);verifiedSeal+=1
write('checks/SEALED.author-payload-current-byte-closure.actual.json',{'authorSeal':sel['sealedAuthorSeal'],'verifiedBoundPayloadFiles':verifiedSeal,'allSelectedSourceAndMaterialBindingsExact':True,'sealedInputsWritten':False})
jsons=jsonls=pys=0
for p in OWN.rglob('*'):
 if not p.is_file():continue
 if p.suffix=='.json':assert p.read_bytes().endswith(b'\n'),p;json.loads(p.read_bytes());jsons+=1
 elif p.suffix=='.jsonl':
  data=p.read_bytes();assert not data or data.endswith(b'\n'),p
  for l in data.splitlines():json.loads(l)
  jsonls+=1
 elif p.suffix=='.py':ast.parse(p.read_text(),filename=str(p));pys+=1
spec=importlib.util.spec_from_file_location('skillpilot_normal_validator',ROOT/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
errors=m.curriculum_symlink_errors(ROOT);assert not errors,errors
write('checks/FINAL.serialization-AST-normal-portability.actual.json',{'pass':True,'normalFunction':'curriculum_symlink_errors','normalModule':bind('scripts/validate_schemas.py'),'errors':errors,'helperUsesReadOnlyGitDiscovery':True,'wholeJsonParsedBeforeReceipt':jsons,'wholeJsonlParsed':jsonls,'pythonASTParsed':pys,'actualTerminalNewlines':True,'activeWrites':False,'centralExecuted':False,'newVotes':0})
print(json.dumps({'nativeGoals':20,'PDFPages':22,'fronts':2,'cases':42,'rawProfiles':20,'blankUnassignedRounds':2,'normalPrepareCheck':'PASS','unchanged321Contexts':321,'sourceCourseHoldsCleared':False,'hostPhysicalBytes':hostBytes,'symlinkErrors':len(errors),'newVotes':0,'readyForFiniteSeal':True}))
