# Korrigierter Fixed74-Nachfolger: Grenzen im echten Kernel-Namespace

Der bestätigte Rootblocker ist im neuen Sibling konkret behoben. Der alte 74er-Paket samt Manifest `d2d550a8…90c29e` und allen 891 Payload-Dateien bleibt bytegleich. Der einzige Codeoverride ist `scripts/visualization_qualified_context_capsule.py`, SHA256 `466ea51b476ba60602616c9c807b8281c8c9c516c408061f5299dab4e4f6aed5`. Die neun anderen Kandidatencodepins, Index74, Capsule74 und alle unverändert begrenzten17Readerpins bleiben erhalten.

Die alte Prüfung las das erste wörtliche Argumenttoken. Der echte Parser akzeptiert spätere Duplikate, Equals und Abkürzungen. Jetzt umschließt ein kleiner Guard die vorhandenen Funktionen `kernel.build` und `kernel.materialize`. Das unveränderte `kernel.main()` parst genau einmal; der Guard prüft dessen tatsächlich wirksamen Namespace vor der ursprünglichen Aktion. Es gibt keinen zweiten Parser und keine rohe argv-Grenzlogik. Erlaubte Aufrufe reichen dasselbe Namespaceobjekt unverändert weiter.

Für exakt den74erIndex gelten Working192MiB, Object256MiB und Embedded16MiB in beiden Aktionen. Alte54/57-Aufrufsemantik bleibt unverändert. Die Raw-Git-Kernelbytes `307bb0b0…31f34` bleiben unangetastet.

Tatsächlich ausgeführt:

- 217 eigene Fälle mit dem echten unveränderten Parser:157 Guardablehnungen vor der Originalaktion,60 erlaubte Weitergaben. Enthalten sind alle sieben exakten Rootgegenbeispiele sowie beide Aktionen und Normal-/Double-/Equals-/Abbrev-/Abbrev+Equals-Formen für alle Ressourcen und den Selector. Umgekehrte Duplikate und effektive54/57-Selectoren bleiben erlaubt. Jeder Fall parst genau einmal.
- 378 unabhängig erneut ausgeführte Parserfälle:210 korrekte Ablehnungen,168 erlaubte identische Namespaceweitergaben. Diese Fallmengen überschneiden sich mit der eigenen Matrix.
- 30 echte uninstrumentierte Build-/Materialize-Übergrenzenläufe plus alle sieben exakten Rootgegenbeispiele ohne Probeinstrumentierung: alle scheitern vor Outputanlage. Die Parserprobes sind ausdrücklich kein Ersatz für diese nativen Aufrufe.
- Echter gültiger Build rekonstruiert exakt die ursprüngliche Capsule74 SHA `60b70c93…19bc77`. Tatsächlicher unabhängiger Depth-one-Host materialisiert denselben168024327Working-/182146189Objektsatz. Reale Ein-Byte-Untergrenzen für Working/Object scheitern am ursprünglichen Kernelbudget.
- Normaler74erMaturitypfad mit Math- und Economicsprobe sowie der erhaltene57erMaturitypfad bestehen erneut. Ihre stdoutHashes sind identisch zu den vorherigen tatsächlichen Normalruns.
- Der kombinierte korrigierte Zehn-Dateien-Diff besteht `git apply --check` unter readonly Host und readonly Indexsnapshot.

Anwendung: `application-map.json` nennt genau zehn vorgeschlagene Zieldateien und ihre verbindlichen Quellen/Hashes. Neun Quellen stammen unverändert aus dem alten versiegelten Paket; nur der Selector kommt aus diesem Sibling. `combined-application.patch.gz` enthält den vollständigen korrigierten Diff gegen die aktuelle aktive57erBasis. Das gzipFormat bewahrt die exakten Diffkontextbytes, ohne eine neue aktive Gitattributesänderung zu erfinden. Das alte fehlerhafte Packet wird nicht überschrieben oder als alleiniger neuer Anwendungspunkt verwendet.

Der volle5Fächer-Deep-Report wird für diesen Guardfix nicht nochmals ausgeführt: für gültige Normalargumente ändern sich keinerlei Daten, Parserfelder oder ursprüngliche Aktionen. Die neun übrigen Codepins und alle Quellen/QA/Assets/Reader-/Index-/Capsulebytes bleiben im geprüften Replayframe gleich; neuer echter Build, echte Materialisierung und normale Maturity bestätigen die identische Wirkung. Der tatsächlich abgeschlossene ursprüngliche Bericht SHA `7307192d…adefb7` bleibt74/2483 mit2409 offenenV-Kontexten. Diese Vererbung gilt unter den expliziten Bedingungen in `application-map.json`; Roots neuer kombinierter Normal-CQR nach PoWi4 bleibt separat offen.

Vorher stimmten alle 44 und 260 aktiven Pins. Nachher stimmen44/44 und 259/260. Die einzige Liveabweichung ist Roots separat autorisierte PoWi4-Anwendung49e68→29d020, gebunden an deren Receipt SHA `3be378db…50564`. Nach dem gemeldeten SourcewriteSafePoint lesen sämtliche nativen Replays ausschließlich den readonly eingefrorenen49e68-Snapshot am normalen PoWi-Pfad. Dieser Frame ist zusätzlich verlustfrei als `politikwirtschaft49.snapshot.json.gz` erhalten. Eine pauschale Behauptung unveränderter260 Liveinputs wird ausdrücklich nicht gemacht.

Keine aktive Host-/Source-/QA-/Authority-/Gitänderung durch diesen Nachfolger, keine neue fachliche AI-Bildfreigabe, keine Humanfreigabe und keine M7-Gesamtabnahme. Die ursprüngliche unabhängige17erProfilprüfung wird nur auf ihre exakten erhaltenen Readerpins bezogen.

[Quittung](receipt.json), [Anwendungsmap](application-map.json), [eigene tatsächliche Parsermatrix](effective-namespace-results.json), [unabhängige Gegenprüfung](independent-guard-peer-review.json), [native Ergebnisse](native-results.json), [Vorher/Nachher-Integrität](ending-integrity.json), [Dateimanifest](manifest.json).
