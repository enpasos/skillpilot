from pathlib import Path
import json,hashlib,datetime
O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-carriers-prospective422-fresh-independent-a-20261015-v1')
def rd(n):return json.loads((O/n).read_text())
def data(x):return (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
def put(n,x):(O/n).write_bytes(data(x))
def bound(p,d=None):
 p=Path(p);d=p.read_bytes() if d is None else d
 return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(d).hexdigest(),'bytes':len(d)}
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
f=rd('FIRST.science.before-peer.json');fs=rd('FIRST.science-and-read-inventory.seal.json')
assert all(bound(x['path'])==x for x in fs['files'])
rows=[]
for g in f['goals']:
 rows.append({'goalId':g['goalId'],'authority':'ai_candidate','reviewEvidenceLevel':'E1','reviewClaimScope':'G1','reviewKind':'prospective_whole_goal_science_not_native_D3','wholeDescriptionScience':g['wholeDescriptionScience'],'sourceDutyScience':g['sourceFidelity'],'semanticAtomicity':{'decision':g['atomicity'],'semanticAtomic':True,'formalCurrentGateRecordCreated':False,'minimality':g['minimality']},'positiveUnderstandingDesign':{'decision':g['P']['decision'],'scientificDesignAccepted':g['P']['decision']=='reviewed_ai_candidate_design_scientifically_supported','rawProfileSchemaValid':g['P']['rawProfileSchemaValid'],'originalCaseEvidenceLevel':'E0','originalCaseClaimScope':'G0','executed':False,'learnerWorkPresent':False,'caseIds':g['P']['caseIds'],'reasonDe':g['P']['reasonDe'],'formalCurrentPApproval':False,'findingIds':g['P'].get('findingIds',[])},'memory':g['memory'],'visualization':{**g['visual'],'decision':'approved_ai_candidate_asset_science_keep','formalCurrentVRecordCreated':False,'humanApproved':False},'prerequisiteReview':g['prerequisites'],'nativeD3Vote':None,'strictClosureGranted':False})
typed={'schemaVersion':1,'artifactKind':'typed-prospective-three-goal-independent-science','createdAtUTC':now,'reviewer':f['reviewer'],'currentPeerOutcomesRead':False,'firstScienceSeal':bound(O/'FIRST.science-and-read-inventory.seal.json'),'firstScience':bound(O/'FIRST.science.before-peer.json'),'records':rows,'findings':f['findings'],'sourceCourseAcquisitionHolds':'all remain OPEN; author-reported missing-transitive target counts2/22/9 are preserved as mechanical observations, not independent whole-course proof','contextImpact':f['contextImpact'],'normalNativeD3RecordsCreated':0,'formalActivePAMVRecordsCreated':0,'strictClosureDelta':0,'humanApproval':False,'humanTrial':False,'activeIntegration':False,'allOriginalAuthorQuestionsRemainHypotheses':True,'historicalExposure':'unchanged from sealed inventory; original historical FIRST and current peer files remain unopened','newAuthorRemediationStarted':False}
put('SCIENCE.typed-three-goal-review.json',typed)
resume='''# Chemie: unabhängige Prüfung A der drei Quellenpflicht-Träger

Die unabhängige FIRST-Fachprüfung und ihr Leseinventar wurden vor jedem Zugriff auf aktuelle Peer-Ergebnisse versiegelt. Aktuelle Peer-FIRSTs, typisierte Ergebnisse, READMEs und Root-Chat-/Sessionprotokolle wurden während des gesamten Reviews nicht gelesen. Die offengelegten historischen V2-Dissenszusammenfassungen und der frühere Bildzählbefund stammen ausschließlich aus gebundenen Autoreneingaben. Die Originale dieser historischen FIRST-Dateien wurden nicht geöffnet.

Die drei ganzen Zielrelationen sind semantisch atomar und als explizite eng begrenzte Träger der HB-LK-Pflichten bzw. der gewählten Farbstoffroute im BW-Leistungsfach fachlich vertretbar. Keine Entscheidung schließt das gesamte Quellen-/Kurs-/Erschließungsproblem.

- **40f2db27:** P bleibt offen. In I1/I3 sowie betroffenen DE/EN Lösungen, Rubriken und Profilangaben muss die Bezugsgröße von 90 % bzw. 90,9 % ausdrücklich auf die bilanzierten gelösten Stoffe oder einen getrockneten Rückstand begrenzt werden. Ohne Lösungsmittelmasse ist das keine Reinheit der gesamten Flüssigphase. I2 ist nur Identitäts-/Herkunftstransfer und kein weiterer Trennmechanismus. Die kausalen Verteilungs-/Haftungsmodelle und Rückgewinnungen sind tragfähig.
- **93a7ce4d:** P als ungetesteter KI-Aufgabenentwurf fachlich getragen. Offen bleibt die minimale Voraussetzung: Das ganze 7a05 erzwingt Mechanismen und lange Nebenketten, die für die gelieferten W1/W2-Erklärungen nicht erforderlich sind. Eine engere reale Vorwissensanforderung muss an ganzen bestehenden Zielen begründet und anschließend unabhängig gebunden werden. Dieser Review ändert keine Kante.
- **d815960a:** Ziel und P-Entwurf fachlich getragen, nur für die gewählte Stoffgruppe Farbstoffe im BW-Leistungsfach. Historischer Beleg, gegebene heutige Modelldaten und ungeprüfte Zukunftsfragen bleiben getrennt. Andere amtliche Stoffgruppen sind Alternativen.

Für jedes Ziel lautet die begründete Memory-Entscheidung `no_memory_needed`. Alle drei exakten PNG-Kandidaten sind nach tatsächlicher Sichtung in nativer Größe und bei 360/680 Pixeln als KI-Bildkandidaten KEEP: kein Bildfehler erfordert eine neue Erzeugung. Es entstehen keine aktiven V-Records oder menschlichen Freigaben.

Alle elf vollständigen DE/EN Fälle und 44 Rubriken sowie drei Rohprofile mit zwölf Erwartungen wurden gelesen. Ihre Ausführungsstufe bleibt E0/G0; das Review selbst ist eine gebundene E1/G1-KI-Beobachtung. Die drei Rohprofilformen bestehen den begrenzten Schema-Test. Alle 90 geprüften Referenzbindungen stimmen, und die sechs amtlichen Seiten wurden direkt aus den exakten PDFs reproduziert.

Der korrigierte Alt/Neu-Union-Kontextaudit wurde unabhängig reproduziert: Die eigenen Körper der bisherigen 305 Abschlüsse bleiben gleich; sechs Kontexte ändern sich, 299 nicht. Bei späterer Integration brauchen genau die gebundenen betroffenen Kontexte tatsächliche gezielte native D-Prüfung. Die früheren Abschlüsse werden hier weder gelöscht noch als neu geprüft ausgegeben.

Es gibt noch kein natives aktuelles D3-Bundle für diese drei neuen Ziele. Dieser Ordner erzeugt deshalb keine normalen D-Voten, keine formale aktive P/A/M/V-Integration und **0 strenge neue Abschlüsse**. Die Kurs-/Erschließungs-HOLDs bleiben offen. Menschliche Prüfung und Erprobung bleiben getrennt.

Der Benutzer hat einen stabilen Commit-/Push-/CI-Zwischenstand vor weiterer Arbeit angefordert. Dieser Review ist mit offenen Befunden abgeschlossen; nach dem finalen Receipt wurden keine weiteren Dateien geschrieben. Es wurde keine Autorenkorrektur, kein Delta und kein neues Paket begonnen. Zur Fortsetzung zuerst den vom Root geforderten stabilen Zwischenstand herstellen; erst danach die zwei exakt bezeichneten offenen Befunde bearbeiten.

Maßgeblich: `FIRST.science.before-peer.json`, `FIRST.science-and-read-inventory.seal.json`, `SCIENCE.typed-three-goal-review.json`, `FILES.finite-own-artifacts.seal.json`.
'''
(O/'RESUME.md').write_text(resume)
checks={'schemaVersion':1,'checkedAtUTC':now,'role':'finite own artifact integrity only','firstSealStillExact':all(bound(x['path'])==x for x in fs['files']),'typedGoalIdsExact':[g['goalId'] for g in rows]==[g['goalId'] for g in f['goals']],'typedOpenFindingIdsExact':[g['findingId'] for g in typed['findings']]==[g['findingId'] for g in f['findings']],'currentPeerOutcomesRead':False,'normalNativeD3Records':0,'strictClosureDelta':0,'noNewRemediation':True,'allExistingJSONParse':True}
for p in O.glob('*.json'):json.loads(p.read_text())
put('CHECK.finite-own-review.actual.json',checks)
receipt={'schemaVersion':1,'createdAtUTC':now,'reviewer':f['reviewer'],'status':'independent_review_complete_with_two_open_findings','currentPeerOutcomesRead':False,'firstSeal':bound(O/'FIRST.science-and-read-inventory.seal.json'),'typedScience':bound(O/'SCIENCE.typed-three-goal-review.json'),'openFindingIds':[x['findingId'] for x in f['findings']],'allThreeImages':'KEEP approved AI candidate asset science; no generation or active gate record','wholeSourceCourseAcquisitionStatus':'OPEN','nativeD3VotesCreated':0,'strictClosureDelta':0,'humanApproval':False,'humanTrial':False,'activeCanonicalRegistryLedgerRuntimeProtectedSubjectsOrOldArtifactsModified':False,'gitBuildsCIOrPublicationPerformed':False,'newAuthorRemediationOrDeltaPackageStarted':False,'finalFiniteSeal':'FILES.finite-own-artifacts.seal.json','stopWritesAfterThisReceipt':True}
receipt_bytes=data(receipt)
entries=[bound(p) for p in sorted(O.iterdir()) if p.is_file() and p.name not in ('FILES.finite-own-artifacts.seal.json','FINAL.independent-review.receipt.json')]
entries.append(bound(O/'FINAL.independent-review.receipt.json',receipt_bytes))
seal={'schemaVersion':1,'sealedAtUTC':now,'role':'finite immutable independent A output inventory; self excluded','currentPeerOutcomesRead':False,'files':entries,'normalNativeD3RecordsCreated':0,'strictClosureDelta':0,'humanApproval':False}
put('FILES.finite-own-artifacts.seal.json',seal)
# The final receipt is deliberately the last mutation in this task.
(O/'FINAL.independent-review.receipt.json').write_bytes(receipt_bytes)
print(json.dumps({'finalReceipt':bound(O/'FINAL.independent-review.receipt.json'),'finiteSeal':bound(O/'FILES.finite-own-artifacts.seal.json'),'files':len(entries),'status':receipt['status']},ensure_ascii=False))
