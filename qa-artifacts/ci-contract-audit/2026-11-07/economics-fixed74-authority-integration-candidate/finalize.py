#!/usr/bin/env python3
import collections,datetime,hashlib,json
from pathlib import Path
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[3]
sha=lambda raw:hashlib.sha256(raw).hexdigest()
read=lambda p:json.loads((OUT/p).read_bytes())
pins=read('fixed74-pins.json');integrity=read('static-integrity.json');deep=read('full-deep-summary.json')
assert deep['denominator']==2483 and deep['strictComplete']==74 and deep['openVisualizationContexts']==2409
assert read('typecheck.json')['exitCode']==0
transports=read('transport-regression-summary.json');mutations=read('authority-mutation-summary.json')
assert len(transports['cases'])==12 and len(mutations['cases'])==17
runs=[]
for path in sorted((OUT/'results').glob('*.execution.json')):
 row=json.loads(path.read_bytes());assert row['exitCode']==row['expectedExitCode'];runs.append({'path':str(path.relative_to(OUT)),**row})
index=read('private-code/'+pins['indexPath'])
owners=collections.Counter(row['landscapeId']for row in index['rows'])
assert owners=={'68a8ac50-f5f5-4e24-8aa9-5e408ca01ced':5,'605bdaf6-32d5-56fd-8d92-5a80c2fd2901':69}
receipt={'schemaVersion':1,'kind':'preserved57-plus-exact-reviewed-economics17-private-integration-candidate',
 'completedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'fully-executed-private74-root-application-review-pending',
 'fixed74Pins':pins,'acceptedRepositoryCommit':'25a6f2164a81a7e6ae50db3557d20521fecf5124',
 'independentOriginalProfileReviewSeal':{'path':'qa-artifacts/ci-contract-audit/2026-11-07/economics-additional-existing-reviewed-context-independent-peer/review-seal.json','sha256':'37bbc0d8ae2468dc4826300646b8d94e28d452d38e0c0ddb621daef3c2d4e6d4'},
 'originalContexts':74,'preserved57':57,'newDistinctEconomics':17,'originalReferences':359,'requiredCurrentOriginalCopies':354,
 'actualCallbackClosureEqualsExactRequiredUnion':True,'readerProfileCount':6,'oldFiveProfilesUnchanged':True,
 'collectorCandidate':'private-code/app/scripts/collectVisualizationContextEconomics17Originals.ts',
 'privateCodeCandidates':integrity['privateCodeCandidates'],'protectedActiveInputs':integrity['protectedActiveInputs'],
 'normalMaturityModulePassed':True,'economicsNormalMaturityProbePassed':True,'authenticUnrelatedDepth1Host':True,
 'normalDeepReport':deep,'transportCases':12,'fileSourceReceiptCacheMutationCases':17,
 'durableReplay':read('durable-replay-result.json') if (OUT/'durable-replay-result.json').exists() else None,
 'patchAppliesReadOnly':read('application-check.json')['exitCode']==0 if (OUT/'application-check.json').exists() else None,
 'typecheckExitCode':0,'realExecutions':[{key:row[key]for key in ['path','name','exitCode','expectedExitCode','stdoutSha256','stderrSha256']}for row in runs],
 'rootIndexPolicy':{'permanentHostSymlinkRetained':True,'hostIndexModified':False,'privateReadOnlyByteEqualSnapshotPerGitIndexFile':True,
  'parentAuditCheckpointWasConcurrent':True},
 'scopeBoundaries':{'corrected676684da':'DE title/description/image only; no EN or demand inherited from REJECT',
  'thirteenNonvisualAuthorToCurrentDeltas':'8applicability+3requires+2GK/LK tag changes are not visually approved; separate D/P/A/M/scope gates remain authoritative',
  'activeAuthorityChanged':False,'sourceOrQaOrAssetsOrWorkflowsOrFloorChanged':False,'newAiSubjectReviews':0,'newHumanApprovals':0,
  'overallM7Acceptance':False,'new74ResourceAndIntegrationPeerReviewStillRequiredBeforeRootApplication':True}}
(OUT/'receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
text='''# Privater, vollständig ausgeführter Fixed74-Nachfolger

Der echte Collector bewahrt die vorhandenen **57** Zeilen samt Receiptbytes und authentifiziert **genau 17 zusätzliche Economics-Q2-Kontexte**. Seine tatsächlichen Originalread-Callbacks ergeben exakt die erforderliche Union aus **359 Originalreferenzen**, davon 354 mit physisch verpflichtender Originalkopie. Kein Ready-ID-Set, Ersatzreview, Fallback oder beliebiger Indexselector wird verwendet.

Der vollständige normale Deep-Report über alle **2483 curricularAtomic-Ziele** ist tatsächlich unter einem unabhängigen Depth-one-Host gelaufen: **74 strikt vollständige Ziele**, Mathematik 5/807 und Wirtschaft 69/346; Physik 0/478, Chemie 0/455, Biologie 0/397. D/P/A/M bleiben jeweils vollständig. Es bleiben genau **2409 offene V-Kontexte**, alle Fach-Completionflags bleiben false. Das ist keine M7-Gesamtabnahme.

Der dauerhafte Reproducer wurde danach separat nochmals erfolgreich mit echter Kapselmaterialisierung und normalem Maturitypfad ausgeführt; sein geprüfter ursprünglicher Paketmanifest bleibt verlustfrei archiviert. `git apply --check` bestätigt den Nachfolgerdiff unter readonly Host und Indexsnapshot.

Neue feste Pins:

| Komponente | SHA256 |
|---|---|
| Index74 | `INDEX_SHA` |
| Capsule74 | `CAP_SHA` |
| unabhängig geprüfter Originalprofil-Seal | `37bbc0d8ae2468dc4826300646b8d94e28d452d38e0c0ddb621daef3c2d4e6d4` |

Der Originalanker bleibt `25a6f2164a81a7e6ae50db3557d20521fecf5124`. Historische54 und57, deren Indizes/Kapseln/Receiptbytes sowie alle fünf bestehenden Profilzweige und der rohe Git-Kern bleiben erhalten. Der neue Reader entspricht dem unabhängig geprüften17erReader; nur der type-onlyImport und der neue feste Speicherort desselben SHA256-gepinnten Originalsatzes sind mechanisch verlegt.

Der separate192-MiB-Workingrahmen gilt ausschließlich für das konkrete neue74erIndex-Tupel. Tatsächlich gemessen:168024327Workingbytes,182146189Objektbytes,14527052Embeddedbytes; Capsule gespeichert3578139Bytes. Alte54/57-Authorities bleiben bei128MiB, Objekt-/Embeddedgrenzen bleiben256/16MiB. Der neue Selector weist Überschreitungen seiner festen Obergrenzen ab. Ein Byte unter dem tatsächlich nötigen Working- und Objektsatz scheitert; Index-/Anchor-/Capsule-/Budgetkreuzungen und beliebiger Callerindex scheitern ebenfalls. Diese konkrete Ressourcenänderung gehört zur nächsten unabhängigen Integrationsprüfung.

Ausgeführt und roh gehasht:

- Collector74 und komplette Callback-Union;1098 echte rohe Gitobjekte,476Commitobjekte.
- Authentisches Depth-one-Hostgit ohne Originalanker; separate echte flache Originalrepo-Kapsel mit eigenen Inodes für alle354 Pflichtkopien.
- Normaler `testVisualizationContextMaturity.ts` am normalen Modulpfad mit74 tatsächlichen Qualifikationen, eigener Economics-Probe und den bestehenden V→CQR303→M7→direktenFloor-Gegenfällen.
- Historische54/57-Transporte und unveränderter57erMaturitytest mit dem neuen Reader.
- 17 echte Datei-/Source-/Receipt-/Cachemutationsläufe durch V→CQR303→M6→direktenFloor: Originalreview, Native-Metadaten, gesamter Authorinput, Sichtderivat, beide physischen Assetrollen, Index/Capsule/Receipt, heutigeDE-/EN-/Demandänderungen mit erhaltener AI-Assetfreigabe, Primaryrolle, erfundeneDE-onlyScopefelder, Cache nach Index-/Receiptänderung samt Wiederherstellung.
- Fokussierter Typecheck für integriertenKern, beide Economics-Reader, Collector und Authority:Exit0.
- Voller normaler5Fächer-Deep-Report:Exit0, RawSHA`7307192d64af5b5e7fb17dcf5bbd551ceebf7cfb63c26444652ccf9d05adefb7`.

Verbindliche Grenzen:676684da bestätigt nur DE-Titel/Beschreibung/Bild; EN/Demand werden nicht aus dem erhaltenenREJECT übernommen. Die13 dokumentierten Änderungen an Applicability/Requires/GK-LK-Tags werden durch dieses Bildprofil nicht curricular oder fachlich freigegeben. Es gibt keine neue fachliche AI-Bildbewertung und keine menschliche Freigabe.

Alle aktiven Hostdateien sind unverändert; nur dieses private Paket und RAM-Arbeitsdaten wurden geschrieben. Das permanente E-Laufwerk-Indexsymlink blieb erhalten. Native Läufe nutzten einen bytegleichen, privat kopierten und tatsächlich readonly eingebundenen Indexsnapshot per `GIT_INDEX_FILE`. Der parallel vonRoot erzeugte Auditcheckpoint änderte nur den dokumentierten Elternstand und Audit-Gitattributes; die260 geprüften aktiven Eingaben passen zum jeweiligen belegten Ausgangsstand.

Root kann die zehn expliziten Kandidaten aus `private-code/` und den vollständigen Kapselordner prüfen; `private-application.patch` ist der reine anwendbare Nachfolgerdiff. Die vorgeschlagene `.gitattributes`-Ergänzung erhält rohe Capsuleobjekte und den exakten Prüfdiff. Source/QA/Assets/Workflows/Floor werden nicht ersetzt. Vor Root-Anwendung bleibt die unabhängige Prüfung dieses konkreten74erIntegrations-/Ressourcenpakets offen.

Der dauerhafte Reproducer arbeitet in einer neuen RAM-Ausgabe gegen die unveränderte57erHostbasis und führt echte Kapselmaterialisierung und normalen Maturitypfad aus; mit `--full-deep-report` zusätzlich den vollständigen Bericht:

```bash
python3 -B qa-artifacts/ci-contract-audit/2026-11-07/economics-fixed74-authority-integration-candidate/replay.py --output /dev/shm/skillpilot-fixed74-replay
```

[Quittung](receipt.json), [unverfälschter vollständiger Bericht](results/normal-full-five-subject-deep-report.stdout.gz), [kompakte Fachzahlen](full-deep-summary.json), [Ressourcen-/Transportkontrollen](transport-regression-summary.json), [Authoritymutationen](authority-mutation-summary.json), [statische Original-/Inputintegrität](static-integrity.json), [Dateimanifest](manifest.json). Alle Rohlogs sind verlustfrei gzip-gepackt und mit tatsächlichen Ausführungszeiten/Kommandos gebunden.
'''.replace('INDEX_SHA',pins['indexSha256']).replace('CAP_SHA',pins['capsuleSha256'])
(OUT/'README.md').write_text(text)
files=[]
for path in sorted(OUT.rglob('*')):
 if path.is_file()and path.name!='manifest.json':files.append({'path':str(path.relative_to(OUT)),'sha256':sha(path.read_bytes()),'bytes':path.stat().st_size})
total=sum(row['bytes']for row in files)
(OUT/'manifest.json').write_text(json.dumps({'schemaVersion':1,'kind':'private-fixed74-integration-artifact-manifest','files':files,'selfExcluded':True,'bytesBeforeManifest':total},indent=2)+'\n')
actual=sum(path.stat().st_size for path in OUT.rglob('*')if path.is_file());assert actual<8000000,actual
print(json.dumps({'privateOriginalContexts':74,'globalDenominator':2483,'openV':2409,'packageBytes':actual,'manifestSha256':sha((OUT/'manifest.json').read_bytes()),'receiptSha256':sha((OUT/'receipt.json').read_bytes())}))
