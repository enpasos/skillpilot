#!/usr/bin/env python3
import datetime,gzip,hashlib,json,os
from pathlib import Path
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[3]
OLD=ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/economics-fixed74-authority-integration-candidate'
W=Path(json.loads((OUT/'ram-location.json').read_bytes())['path']);sha=lambda raw:hashlib.sha256(raw).hexdigest()
read=lambda p:json.loads((OUT/p).read_bytes())
start=read('starting-pins.json');end=[];allowed=[]
powi='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_POLITIKWIRTSCHAFT.de.json'
authorized_new='29d02016b7e31b5683b1d51196e21c68ab4a310b8a88aa1a09bd5f30d1ee2eef'
application_receipt=ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/powi-four-current-context-application/receipt.json'
assert sha(application_receipt.read_bytes())=='3be378dbbfbe2ea9a182c853437a855a95fac466e50be349bba5eca2e1d50564'
for row in start['checks']:
 actual=sha((ROOT/row['path']).read_bytes());same=actual==row['sha256']
 if not same:
  assert row['path']==powi and actual==authorized_new,row['path'];allowed.append({'path':powi,'before':row['sha256'],'after':actual,'authorizedRootChange':True})
 end.append(dict(row,afterSha256=actual,unchangedSinceStart=same,authorizedRootPoWiChange=not same))
assert sum(row['set']=='original44'and row['unchangedSinceStart']for row in end)==44
assert sum(row['set']=='integration260'and row['unchangedSinceStart']for row in end)==259 and len(allowed)==1
snapshot=sha((W/'politikwirtschaft49.readonly.json').read_bytes());assert snapshot==start['sourcePoWiSha256']
manifest_raw=(OLD/'manifest.json').read_bytes();assert sha(manifest_raw)==start['old74ManifestSha256']
old_manifest=json.loads(manifest_raw)
for row in old_manifest['files']:assert sha((OLD/row['path']).read_bytes())==row['sha256'],row['path']
integrity={'completedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':end,
 'original44Unchanged':44,'integration260Unchanged':259,'onlyAuthorizedRootDelta':allowed,
 'rootPoWiApplicationReceiptSha256':sha(application_receipt.read_bytes()),'frozenReplaySourcePoWiSha256':snapshot,
 'old74ManifestUnchanged':True,'all891Old74PayloadBytesUnchanged':True,'old74ManifestSha256':sha(manifest_raw),
 'hostIndexStillPermanentSymlink':(ROOT/'.git/index').is_symlink(),'hostIndexSymlinkTarget':os.readlink(ROOT/'.git/index'),
 'hostOrGitWritesByThisSuccessor':False}
(OUT/'ending-integrity.json').write_text(json.dumps(integrity,indent=2)+'\n')
own=read('effective-namespace-results.json');peer=read('independent-guard-peer-review.json');native=read('native-results.json');application=read('application-map.json')
assert own['cases']==217 and own['allExpectationsMet']and native['cases']==37 and native['allExpectationsMet']
assert read('application-check.json')['exitCode']==0
override=application['codeFiles'][-1]
override=next(row for row in application['codeFiles']if row['onlyArgumentGuardOverride'])
assert override['sha256']=='466ea51b476ba60602616c9c807b8281c8c9c516c408061f5299dab4e4f6aed5'
receipt={'schemaVersion':1,'kind':'fixed74-effective-kernel-namespace-limit-correction',
 'completedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'fully-executed-corrected-private-root-application-candidate',
 'baseOld74ManifestSha256':sha(manifest_raw),'selectorOverrideSha256':override['sha256'],'oneCodeOverrideNineOtherPinsUnchanged':True,
 'rawKernelUnchangedSha256':'307bb0b0ca99c680261afa176eed7ab05e88b108d79261cafb28903ddf231f34',
 'index74UnchangedSha256':'234b9cee0f87d937edfa8410c36483ebdc55b5032d84947c5188c3f3b74f8785',
 'capsule74UnchangedSha256':'60b70c93df293c5ac06d3923e4ec9328b0277d99f927dfe4179094dde919bc77',
 'ownActualParserCases':217,'ownRejects':157,'ownAllowed':60,'independentActualParserCases':378,'caseSetsMayOverlap':True,
 'nativeCases':37,'additionalExactRootNativeCases':7,'totalNativeCases':44,'nativeUninstrumentedOverLimitBuildMaterializeRejects':30,'actualOneByteTooSmallWorkingObjectRejects':2,
 'actualValidBuildCapsuleBytesIdentical':True,'actualValidDepth1MaterializeBytesIdentical':True,'normal74MathAndEconomicsMaturityPassed':True,
 'preserved57MaturityPassed':True,'actualParserIsOnlyKernelParser':True,'originalActionsReceiveSameNamespaceIdentity':True,
 'applicationMap':'application-map.json','combinedApplicationPatch':'combined-application.patch.gz','gitApplyCheckPassed':True,
 'fullDeepNotRepeatedForGuardOnlyFix':application['fullDeepInheritance'],'inputGuardSummary':{'original44':44,'unchangedIntegration260':259,'authorizedRootPoWiDelta':1,'frozenReplayPoWiSourceSha256':snapshot},
 'sourcewriteSafePointAlreadyReported':True,'newAiSubjectReviews':0,'newHumanApprovals':0,'activeAuthorityChanged':False,'overallM7Acceptance':False}
(OUT/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
text='''# Korrigierter Fixed74-Nachfolger: Grenzen im echten Kernel-Namespace

Der bestätigte Rootblocker ist im neuen Sibling konkret behoben. Der alte74Packet samt Manifest `d2d550a8…90c29e` und allen891 Payload-Dateien bleibt bytegleich. Der einzige Codeoverride ist `scripts/visualization_qualified_context_capsule.py`, SHA256 `466ea51b476ba60602616c9c807b8281c8c9c516c408061f5299dab4e4f6aed5`. Die neun anderen Kandidatencodepins, Index74, Capsule74 und alle unverändert begrenzten17Readerpins bleiben erhalten.

Die alte Prüfung las das erste wörtliche Argumenttoken. Der echte Parser akzeptiert spätere Duplikate, Equals und Abkürzungen. Jetzt umschließt ein kleiner Guard die vorhandenen Funktionen `kernel.build` und `kernel.materialize`. Das unveränderte `kernel.main()` parst genau einmal; der Guard prüft dessen tatsächlich wirksamen Namespace vor der ursprünglichen Aktion. Es gibt keinen zweiten Parser und keine rohe argv-Grenzlogik. Erlaubte Aufrufe reichen dasselbe Namespaceobjekt unverändert weiter.

Für exakt den74erIndex gelten Working192MiB, Object256MiB und Embedded16MiB in beiden Aktionen. Alte54/57-Aufrufsemantik bleibt unverändert. Die Raw-Git-Kernelbytes `307bb0b0…31f34` bleiben unangetastet.

Tatsächlich ausgeführt:

-217 eigene Fälle mit dem echten unveränderten Parser:157 Guardablehnungen vor der Originalaktion,60 erlaubte Weitergaben. Enthalten sind alle sieben exakten Rootgegenbeispiele sowie beide Aktionen und Normal-/Double-/Equals-/Abbrev-/Abbrev+Equals-Formen für alle Ressourcen und den Selector. Umgekehrte Duplikate und effektive54/57-Selectoren bleiben erlaubt. Jeder Fall parst genau einmal.
-378 unabhängig erneut ausgeführte Parserfälle:210 korrekte Ablehnungen,168 erlaubte identische Namespaceweitergaben. Diese Fallmengen überschneiden sich mit der eigenen Matrix.
-30 echte uninstrumentierte Build-/Materialize-Übergrenzenläufe plus alle sieben exakten Rootgegenbeispiele ohne Probeinstrumentierung: alle scheitern vor Outputanlage. Die Parserprobes sind ausdrücklich kein Ersatz für diese nativen Aufrufe.
- Echter gültiger Build rekonstruiert exakt die ursprüngliche Capsule74 SHA `60b70c93…19bc77`. Tatsächlicher unabhängiger Depth-one-Host materialisiert denselben168024327Working-/182146189Objektsatz. Reale Ein-Byte-Untergrenzen für Working/Object scheitern am ursprünglichen Kernelbudget.
- Normaler74erMaturitypfad mit Math- und Economicsprobe sowie der erhaltene57erMaturitypfad bestehen erneut. Ihre stdoutHashes sind identisch zu den vorherigen tatsächlichen Normalruns.
- Der kombinierte korrigierte Zehn-Dateien-Diff besteht `git apply --check` unter readonly Host und readonly Indexsnapshot.

Anwendung: `application-map.json` nennt genau zehn vorgeschlagene Zieldateien und ihre verbindlichen Quellen/Hashes. Neun Quellen stammen unverändert aus dem alten versiegelten Paket; nur der Selector kommt aus diesem Sibling. `combined-application.patch.gz` enthält den vollständigen korrigierten Diff gegen die aktuelle aktive57erBasis. Das gzipFormat bewahrt die exakten Diffkontextbytes, ohne eine neue aktive Gitattributesänderung zu erfinden. Das alte fehlerhafte Packet wird nicht überschrieben oder als alleiniger neuer Anwendungspunkt verwendet.

Der volle5Fächer-Deep-Report wird für diesen Guardfix nicht nochmals ausgeführt: für gültige Normalargumente ändern sich keinerlei Daten, Parserfelder oder ursprüngliche Aktionen. Die neun übrigen Codepins und alle Quellen/QA/Assets/Reader-/Index-/Capsulebytes bleiben im geprüften Replayframe gleich; neuer echter Build, echte Materialisierung und normale Maturity bestätigen die identische Wirkung. Der tatsächlich abgeschlossene ursprüngliche Bericht SHA `7307192d…adefb7` bleibt74/2483 mit2409 offenenV-Kontexten. Diese Vererbung gilt unter den expliziten Bedingungen in `application-map.json`; Roots neuer kombinierter Normal-CQR nach PoWi4 bleibt separat offen.

Vorher stimmten alle44 und260 aktiven Pins. Nachher stimmen44/44 und259/260. Die einzige Liveabweichung ist Roots separat autorisierte PoWi4-Anwendung49e68→29d020, gebunden an deren Receipt SHA `3be378db…50564`. Nach dem gemeldeten SourcewriteSafePoint lesen sämtliche nativen Replays ausschließlich den readonly eingefrorenen49e68-Snapshot am normalen PoWi-Pfad. Dieser Frame ist zusätzlich verlustfrei als `politikwirtschaft49.snapshot.json.gz` erhalten. Eine pauschale Behauptung unveränderter260 Liveinputs wird ausdrücklich nicht gemacht.

Keine aktive Host-/Source-/QA-/Authority-/Gitänderung durch diesen Nachfolger, keine neue fachliche AI-Bildfreigabe, keine Humanfreigabe und keine M7-Gesamtabnahme. Die ursprüngliche unabhängige17erProfilprüfung wird nur auf ihre exakten erhaltenen Readerpins bezogen.

[Quittung](receipt.json), [Anwendungsmap](application-map.json), [eigene tatsächliche Parsermatrix](effective-namespace-results.json), [unabhängige Gegenprüfung](independent-guard-peer-review.json), [native Ergebnisse](native-results.json), [Vorher/Nachher-Integrität](ending-integrity.json), [Dateimanifest](manifest.json).
'''
for before,after in [('alte74Packet','alte 74er-Paket'),('allen891','allen 891'),('-217','- 217'),('-378','- 378'),('-30','- 30'),('alle44','alle 44'),('und260','und 260'),('44/44 und259/260','44/44 und 259/260')]:text=text.replace(before,after)
(OUT/'README.md').write_text(text)
files=[]
for path in sorted(OUT.rglob('*')):
 if path.is_file()and path.name!='manifest.json':files.append({'path':str(path.relative_to(OUT)),'sha256':sha(path.read_bytes()),'bytes':path.stat().st_size})
(OUT/'manifest.json').write_text(json.dumps({'schemaVersion':1,'kind':'argument-limit-corrected-fixed74-successor-manifest','files':files,'selfExcluded':True},indent=2)+'\n')
print(json.dumps({'selectorSha256':override['sha256'],'ownActualParserCases':217,'independentCases':378,'nativeCases':37,
 'manifestSha256':sha((OUT/'manifest.json').read_bytes()),'receiptSha256':sha((OUT/'receipt.json').read_bytes()),'bytes':sum(row['bytes']for row in files)+(OUT/'manifest.json').stat().st_size}))
