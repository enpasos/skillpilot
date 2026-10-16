# SPDX-License-Identifier: Apache-2.0
"""Seal only the allowed final scientific source/page inputs, without any peer outputs."""
import datetime,hashlib,json
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1]
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=REPO/r['path'];a=ref(p);assert a['sha256']==r['sha256'] and ('bytes' not in r or a['bytes']==r['bytes']);return p
def put(p,v):
 assert not p.exists(),p;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
source=OWN/'NEUTRAL.preliminary-source-only-four-final-a142-c443-complete-union-partners.v2.selector.json';s=load(source)
sourceSeal=OWN/'FILES.finite-preliminary-source-only-four.complete-union-partners-v2.seal.json'
for r in load(sourceSeal)['files']+s['externalWholePrimaryPageTexts']:verify(r)
for mode in ['prepare','check']:assert load(OWN/f'checks/NATIVE4.{mode}.command.actual.json')['exitCode']==0
manifest=load(OWN/'native-four/batch-manifest.json');model=load(OWN/'native-four/bundle/book-model.json');review=load(OWN/'native-four/bundle/review-input.json');pages=load(OWN/'checks/PAGES.actual-final-native4-pdf-to-png-and-text.json')
assert manifest['goalIds']==s['targetGoalIds']==[p['goalId'] for p in model['pages']]
assert len(model['pages'])==4 and pages['actualPhysicalPdfPages']==6 and len(pages['rows'])==4
assert all(r['evidenceProfile']['evidenceLevel']=='E0' and r['evidenceProfile']['maximumClaimScope']=='G0' and not r['evidenceProfile']['reviewRunIds'] for r in review['pages'])
instructions=OWN/'READING.final-four-whole-source-material-and-native-pages.neutral.md'
instructions.write_text('''# Unabhängige D4-Lektüre: finale Quellen und tatsächliche Native-Seiten

Dies ist die endgültige gemeinsame Eingabe für die vier Kompetenzbeschreibungen. Lies alle vier tatsächlichen gerenderten Zielseiten und das zugehörige BookModel/HTML/PDF/DE-EN-ReviewInput, die ganzen aktuellen Ziele mit tatsächlichen Requires und Eltern, alle acht ganzen DE/EN-Fälle mit Aufgabe, Daten, Modelllösung, Rubrik und Transfer sowie alle vier wissenschaftlichen Profilkörper. Die vier normalen Stockprofile sind rohe E0/G0-Eingaben ohne positive Reviewfreigabe.

Lies zusätzlich die im Source-only-v2-Selector ausgewählten ganzen rohen Quellenzellen, ganzen Primärpassagen und tatsächlichen ganzen Partnerkompetenzen, einschließlich der acht zusätzlichen BY13-Partner und der gesamten sieben Chemie-Seiten des amtlichen HE-Abiturerlasses2027. Quellen können `rawText` oder `text` verwenden; leeres `rawText` ist keine Abwesenheit eines Textkörpers. Prüfe konkrete Operatoren, Kurs-/Spaltenfacetten und modellbezogene Einschränkungen im Zusammenhang mit ihren wirklichen Partnerkompetenzen.

Die Autorenkomponenten, Modellannahmen und LK-Deklaration sind ausdrücklich ungeprüfte zusätzliche Leseinputs. Sie sind nicht als amtliche M3-Entscheidungen, registrierte SourceAtlas-Komponenten oder bereits geprüfte Kurszuordnung im normalen Stock-D-Input wirksam. Der tatsächliche nationale und HE-LK-Zielumfang enthält alle vier Ziele; der bestehende BY-/HE-LK-SourceAtlas enthält diese vier nicht. Die normale Stock-D-Struktur enthält diese externen Deklarationen nicht automatisch: deshalb sind beide Teile des Selectors gemeinsam zu lesen und unabhängig zu beurteilen. Quellen- und Prüfungskontexte dürfen nicht über ihre tatsächliche Geltung hinaus gleichgesetzt werden.

Die aktuelle Kp-Darstellung definiert dimensionslose Größen und Standardzustände. Ganze Aufgaben-/Lösungs-/Bildkonventionen gehören zur fachlichen Prüfung; eine andere zulässige Definition unnormierter Produkte wird dadurch nicht zu einem Formelfehler.

Verfasse deine eigene vollständige FIRST für alle vier Ziele erst nach der gesamten Quellen-/Material-/Seitenlektüre und versiegle sie vor der normalen Schema-/Fingerprintbindung. Arbeite anhand der unveränderten Chemiekriterien und der normalen, deiner Runde zugeordneten Stockdateien. Es gibt keine vorgegebene Entscheidungszahl. Diese technische Vorbereitung enthält keine wissenschaftlichen Reviewerurteile oder Freigaben. Ausschließlich die ausgewählten wissenschaftlichen Dateien sind Reviewinputs; technische Arbeitsdateien und andere Rollenoutputs sind kein Teil dieses Leseauftrags.
''')
allowed=[verify(r) for r in s['allowedWholeScientificFiles']]+[source,sourceSeal,instructions,OWN/'profiles/four-current-raw-E0G0.stock-bound.neutral.jsonl']
for directory in [OWN/'native-four/bundle',OWN/'native-four/round-a',OWN/'native-four/round-b',OWN/'pages']:
 for p in sorted(directory.rglob('*')):
  if p.is_file() and not p.is_symlink():allowed.append(p)
allowed=list(dict.fromkeys(allowed))
selector=OWN/'INPUTS.blind-native4-final-whole-scientific-sources-and-pages.selector.json'
put(selector,{'schemaVersion':1,'role':'Finite neutral scientific input: actual final Native4 plus complete whole source/material sidecars, no peer or author-FIRST judgments','selectedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'canonical':s['canonicalFinalTextAndImage'],'semanticSourceIdentities':s['semanticSourceIdentityOnly'],'goalIds':s['targetGoalIds'],'wholeSourceAndCaseSelector':ref(source),'wholeSourceAndCaseSeal':ref(sourceSeal),'sourceSidecarFieldsAreUnreviewedExternalInputsOnly':True,'sourceAtlasOrOfficialRegistrationApplied':False,'wholeCases':8,'wholeScientificProfileBodies':4,'rawProfileEvidenceLevel':'E0','rawProfileMaximumClaimScope':'G0','rawProfiles':ref(OWN/'profiles/four-current-raw-E0G0.stock-bound.neutral.jsonl'),'actualBookModel':ref(OWN/'native-four/bundle/book-model.json'),'actualBookModelDigest':model['digest'],'actualHtml':ref(OWN/'native-four/bundle/book.html'),'actualPdf':ref(OWN/'native-four/bundle/book.pdf'),'actualBundleManifest':ref(OWN/'native-four/bundle/manifest.json'),'actualBundleFingerprint':manifest['artifacts']['bundleFingerprint'],'wholeGoalBookReviewInput':ref(OWN/'native-four/bundle/review-input.json'),'wholeDEENDescriptionReviewInput':ref(OWN/'native-four/round-a/description-review-input.json'),'actualGoalPages':[{'goalId':r['goalId'],'goalPageNumber':r['goalPageNumber'],'physicalPdfPage':r['physicalPdfPage'],'actualFullPagePng':r['actualFullPagePng'],'actualExtractedText':r['actualExtractedText']} for r in pages['rows']],'physicalPdfPages':6,'actualGoalPageCount':4,'rounds':{side:{'campaign':ref(OWN/f'native-four/round-{side}/description-review-campaign.json'),'wholeDEENInput':ref(OWN/f'native-four/round-{side}/description-review-input.json'),'batchInputFiles':[ref(p) for p in sorted((OWN/f'native-four/round-{side}/batches').glob('*.input.jsonl'))]} for side in ['a','b']},'readingInstructions':ref(instructions),'allowedWholeScientificFiles':[ref(p) for p in allowed],'externalWholePrimaryPageTexts':s['externalWholePrimaryPageTexts'],'actualStockPrepareRuns':1,'actualStockCheckRuns':1,'actualStockExitCodes':[0,0],'secondBookRenderRuns':0,'newScientificVotes':0,'D4ReviewClaims':0,'sourceCourseOrHumanApproval':False,'activeWrites':0})
seal=OWN/'FILES.finite-final-native4-scientific-inputs.allowed.seal.json';rows=[ref(p) for p in allowed]+[ref(selector)]
put(seal,{'schemaVersion':1,'role':'Finite immutable scientific input allowlist only; no judgments/claims','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'selector':ref(selector),'files':rows,'externalWholePrimaryPageTexts':s['externalWholePrimaryPageTexts'],'fileCount':len(rows),'totalBytes':sum(r['bytes'] for r in rows),'actualGoalPages':4,'physicalPdfPages':6,'D4ReviewClaims':0})
for r in rows+s['externalWholePrimaryPageTexts']:verify(r)
print(json.dumps({'selector':ref(selector),'seal':ref(seal),'scientificAllowedFiles':len(rows),'scientificBytes':sum(r['bytes'] for r in rows),'goalPages':4,'pdfPages':6,'newScienceVotes':0}))
