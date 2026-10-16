# SPDX-License-Identifier: Apache-2.0
"""Finish the exact blank D2 handoff, technical paging and normal portability checks."""
import ast,hashlib,importlib.util,json,sys
from pathlib import Path
import fitz
sys.dont_write_bytecode=True
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
assert not (OWN/'FILES.finite-native-preparation.seal.json').exists()
def get(p):return json.loads((OWN/p).read_text())
def read(p):return json.loads((ROOT/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,d):(OWN/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
sel=get('INPUTS.preparation.physical-exact.json');ids=sel['scopeGoalIds']
manifest=get('native-two/batch-manifest.json');model=get('native-two/bundle/book-model.json')
assert manifest['goalIds']==ids and model['book']['pageCount']==2
doc=fitz.open(OWN/'native-two/bundle/book.pdf');rows=[]
for i,page in enumerate(doc):
 text=page.get_text();rows.append({'pdfPage':i+1,'goalIdsInActualPdfText':[gid for gid in ids if gid in text],
 'sizePoints':[page.rect.width,page.rect.height],'textCharacters':len(text)})
assert len(doc)==4 and rows[0]['goalIdsInActualPdfText']==rows[1]['goalIdsInActualPdfText']==[]
assert rows[2]['goalIdsInActualPdfText']==[ids[0]] and rows[3]['goalIdsInActualPdfText']==[ids[1]]
write('checks/PDF.actual-four-pages-two-front-two-goals.json',{'role':'Mechanical native PDF page/ID check, no D judgment','pages':rows,
 'pdfPages':4,'frontPages':2,'goalPages':2,'oneWholeGoalPerTargetPage':True,'actualStockPrepareAndCheckPassed':True})
for round in ['a','b']:
 assert not list((OWN/'native-two'/('round-'+round)/'results').iterdir())
 campaign=get('native-two/round-'+round+'/description-review-campaign.json')
 assert campaign['blindToOtherReviews'] is True and campaign['reviewPass']=='first_pass'
assert get('checks/M2.original-reuse-eligibility.scoped.actual.json')['exitCode']==0
assert get('checks/CHECK.whole-profile-native-context-and-existing-V-byte-reuse.actual.json')['pass']
commands=get('checks/COMMANDS.actual-native-and-reuse.json')['commands']
assert all(r['exitCode']==0 for r in commands[:3])

sciencePaths=['native-two/bundle/book.pdf','native-two/bundle/book.html','native-two/bundle/book-model.json','native-two/bundle/review-input.json',
 'candidate/two-whole-current422-goals.exact.json','materials/four-whole-DE-EN-cases.exact-source-objects.json',
 'candidate/two-raw-profiles.E0-G0.exact-original-lines.jsonl','materials/future-own-preparation-purity-record.blank.exact.json',
 'sources/BY.BcP12-13.whole-duty-context.exact.json','sources/BY.Biologisch-chemisches_Praktikum.complete.exact.json',
 'sources/BY.BcP.complete-source-extraction.exact.json','sources/all-original-selected-source-cells-and-parent-passages.exact.json',
 'sources/PRIMARY.RSC.methods-and-adaptations.exact.json','materials/e7-two-complete-cases.original-container.exact.json']
selector={'schemaVersion':1,'role':'Finite exact blank native D2 preparation; technical role, no new scientific review',
 'scopeGoalIds':ids,'currentCanonical':sel['wholeCanonical'],'currentSemantic':sel['semanticCompanion'],'currentQA':sel['QA'],
 'exactAuthorInputs':sel,'nativeConfig':bind(REL+'/config/native2.normal-prepare-only.config.json'),
 'nativeManifest':bind(REL+'/native-two/batch-manifest.json'),'scientificReviewInputs':[bind(REL+'/'+p) for p in sciencePaths],
 'blankCampaigns':[{'round':r,'campaign':bind(REL+'/native-two/round-'+r+'/description-review-campaign.json'),
  'input':bind(REL+'/native-two/round-'+r+'/description-review-input.json'),'bundle':bind(REL+'/native-two/round-'+r+'/review-bundle-manifest.json'),
  'resultRecordsWritten':0} for r in ['a','b']],
 'physicalRebuildMap':bind(REL+'/checks/REBUILD.current422-lab2-native.physical-map.json'),
 'technicalNativeCommandReceipts':bind(REL+'/checks/COMMANDS.actual-native-and-reuse.json'),
 'AReuseEligibility':'Exact two existing A lines checked by unchanged normal validator; no new A vote.',
 'MReuseEligibility':'Exact two existing no_memory_needed M lines checked by unchanged normal validator with zero applicable card rows; original75-card source remains bound in the technical CAS. No new M vote.',
 'VReuseEligibility':bind(REL+'/checks/CHECK.whole-profile-native-context-and-existing-V-byte-reuse.actual.json'),
 'blindReviewBoundary':'Review the complete scientificReviewInputs and assigned blank round only. Existing A/M/V technical reuse records and historical author routing are separate from fresh D/P judgments; no previous D/P peer results are supplied.',
 'canonicalDeltas':[],'newGateVotes':0,'newStrictClosures':0,'centralExecuted':False,'activeIntegration':False,'humanApproval':False,'humanTrial':False}
write('INPUTS.final-native-D2.physical-exact-selector.json',selector)
write('NEUTRAL.final-lab2-current422-native-preparation.json',{
 'schemaVersion':1,'role':'Finite native preparation for two actual future independent reviewers, no new scientific votes',
 'selector':bind(REL+'/INPUTS.final-native-D2.physical-exact-selector.json'),'scopeGoalIds':ids,
 'nativeConfig':selector['nativeConfig'],'nativeManifest':selector['nativeManifest'],'nativePDF':bind(REL+'/native-two/bundle/book.pdf'),
 'nativeHTML':bind(REL+'/native-two/bundle/book.html'),'nativeBookModel':bind(REL+'/native-two/bundle/book-model.json'),
 'nativeReviewInput':bind(REL+'/native-two/bundle/review-input.json'),'fullFourCases':bind(REL+'/materials/four-whole-DE-EN-cases.exact-source-objects.json'),
 'fullTwoRawProfiles':bind(REL+'/candidate/two-raw-profiles.E0-G0.exact-original-lines.jsonl'),
 'completeBcPSource':bind(REL+'/sources/BY.Biologisch-chemisches_Praktikum.complete.exact.json'),
 'completeBcPSourceExtraction':bind(REL+'/sources/BY.BcP.complete-source-extraction.exact.json'),
 'blankOwnPurityRecord':bind(REL+'/materials/future-own-preparation-purity-record.blank.exact.json'),
 'PDFPages':4,'frontPages':2,'targetPages':2,'currentWholeGoals':554,'currentAtomicDenominator':422,
 'caseIds':get('materials/four-whole-DE-EN-cases.exact-source-objects.json')['caseIds'],
 'AAndMReuseEligibilityOnly':True,'existingTwoImagesKeptByteExact':True,'blankAandBResults':True,
 'technicalMCheckHistory':'Initial two-goal config incorrectly referenced unrelated75 card rows. Preserved failed receipt; scoped zero-card successor passed with identical two no_memory_needed records. No science/visibility obligation was changed.',
 'allPriorAuthorAndScientificHoldsUnchanged':True,'sourceCourseGlobalHoldsCleared':False,'canonicalDeltas':0,
 'newD':0,'newP':0,'newA':0,'newM':0,'newV':0,'newStrictClosures':0,'lastMeasuredStrict':319,'lastMeasuredDenominator':422,
 'centralExecuted':False,'activeIntegration':False,'humanApproval':False,'humanTrial':False,
 'finiteSealPath':REL+'/FILES.finite-native-preparation.seal.json'})
(OWN/'REVIEWER_INPUTS.md').write_text('''# Vollständige Eingaben für zwei unabhängige Erstprüfungen

Scope ausschließlich62bdb5b1-4f67-59d4-bf5c-da80ee03eeb2 unde7c3d20e-4b13-560b-b8ee-c5abca8cc624. Die Zielkörper und der ganze aktuelle554/422-Kontext bleiben unverändert. Die native PDF hat zwei Frontseiten und genau zwei Zielseiten. PDF/HTML/BookModel/ReviewInput und zugewiesene leere Runde sind im neutralen Selektor gebunden.

Für die wissenschaftliche Erstprüfung vollständig lesen: `materials/four-whole-DE-EN-cases.exact-source-objects.json`, beide ganzen Rohprofilzeilen in `candidate/two-raw-profiles.E0-G0.exact-original-lines.jsonl`, den vollständigen e7-Originalcontainer, das leere eigene Präparations-/Reinheitsprotokoll, sämtliche wörtlichen amtlichen Quellkontexte einschließlich kompletter BcP-Quelle und kompletter Source-Extraction sowie die unveränderten Primärmethoden-/Adaptationshinweise. Die vier Fälle enthalten Material/Daten, Protokoll, tatsächliche Aufgabe, erwartete Überlegung/Lösung, vollständige zweisprachige Kriterien und unabhängigen Transfer. Kein Rubrik-Auszug ersetzt den ganzen Fall.

Die beiden vollständigen E0/G0-Rohprofile sind zusätzlich unverändert im normalen nativen ReviewInput enthalten. Es sind Autorenkandidaten, keine positive P-Freigabe. Praktische Operatoren bleiben tatsächliche künftige Ausführung mit leeren Beobachtungsfeldern, Sicherheit/Kontrollen/Unsicherheit; keine früheren Lernerversuche oder Human-Trials werden behauptet oder als Maschinen-M7-Voraussetzung erfunden.

RundeA undB bleiben unabhängig und ohne Ergebnisrecords. Die technische Wiederverwendbarkeitsprüfung vorhandener A/M/V-Zeilen ist keine neue wissenschaftliche Prüfung und kein vorauszunehmendes D/P-Urteil. Für den blinden Erstpass keine andere Runde oder historische Gateurteile lesen. Root teilt die zugewiesene Runde und dieselben vollständigen wissenschaftlichen Inputs zu. Alle Quellen-/Kurs-/Globalholds bleiben getrennt offen.
''')
(OWN/'RESUME.md').write_text('''# Native D2-Vorbereitung mit vollständigen korrigierten Materialien

Bereit zur Übergabe an zwei tatsächliche unabhängige Reviewer: vier native PDF-Seiten (zwei Frontseiten, zwei Zielseiten), HTML, BookModel, vollständiger ReviewInput und leere A/B-Kampagnen. Scope62b/e7; aktuelle ganze554 und Denominator422 unverändert. Stockprepare/check bestehen. Die vier vollständigen DE/EN-Fälle05a/b und06a/b sowie beide ganzen E0/G0-Rohprofile, das leere eigene Reinheitsprotokoll und die komplette amtliche BcP-Quelle/Source-Extraction sind gebunden; keine gekürzten Rubrikslices. Beide Rohprofile stehen auch vollständig im normalen nativen Reviewkontext.

Vorhandene A/M-Datensätze sind wort-/zeilengenau technisch auf Wiederverwendbarkeit geprüft; die beiden bestehenden Bilder bleiben bytegleich mit ihren alten tatsächlichen Hash-Bindungen. Keine neue A/M/V- oder D/P-Entscheidung. Die technisch zu breite75-Kartenreferenz im ersten M-Zweierscope wurde mit erhaltenem Fehlreceipt durch den korrekten leeren scoped Kartencontainer ersetzt; die beiden no_memory_needed-Originalzeilen bleiben exakt. Quellen-/Kurs-/Global- und Autorenholds bleiben offen. Keine zentrale Messung; letzter tatsächlicher Stand319/422 unverändert. Keine aktive Integration, kein Git/CI-/Fullbuild, Human Approval oder Human Trial.

Neuer Sparsehost:27 unveränderte physische Stockmodule,50 normale physische JSON/JSONL-Aliasse und431 Bildreferenzen für den ganzen aktuellen In-Memory-Kontext; nur zwei gerenderte Public-Bilder physisch kopiert, keine Vollbäume. Eigene technische Metadaten/Skripte Apache-2.0; eigenes Aufgabenmaterial behält CC-BY-4.0, amtliche/sonstige Quellen ihre ursprüngliche Provenienz. Nach endlichem Siegel STOP.
''')

jsons=0;jsonl=0;py=0
for p in OWN.rglob('*'):
 if not p.is_file():continue
 if p.suffix=='.json':
  b=p.read_bytes();assert b.endswith(b'\n'),p;json.loads(b);jsons+=1
 elif p.suffix=='.jsonl':
  b=p.read_bytes();assert not b or b.endswith(b'\n'),p
  for l in b.splitlines():json.loads(l)
  jsonl+=1
 elif p.suffix=='.py':ast.parse(p.read_text(),filename=str(p));py+=1
spec=importlib.util.spec_from_file_location('skillpilot_normal_validator',ROOT/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
errors=module.curriculum_symlink_errors(ROOT);assert not errors,errors
write('checks/FINAL.normal-serialization-AST-and-portability.actual.json',{'pass':True,'normalHelper':bind('scripts/validate_schemas.py'),
 'function':'curriculum_symlink_errors','errors':errors,'helperUsesReadOnlyGitDiscovery':True,'wholeJsonFilesParsedBeforeReceipt':jsons,
 'wholeJsonlFilesParsed':jsonl,'pythonASTFilesParsed':py,'actualTerminalNewlines':True,'canonicalDeltas':0,'newScientificVotes':0,'centralExecuted':False})
json.loads((OWN/'checks/FINAL.normal-serialization-AST-and-portability.actual.json').read_text())
print(json.dumps({'nativeGoals':2,'nativePDFPages':4,'wholeCases':4,'fullRawProfiles':2,'blankRounds':2,'normalPrepareCheck':'pass','existingAMVReuseEligibilityOnly':'pass','normalSymlinkErrors':len(errors),'newVotes':0,'centralExecuted':False}))
