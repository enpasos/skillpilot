# Transitive Minimalität und Einlieferung nach main

Stand: 8. November 2026. Grundlage ist die kritische Prüfung mit Astra Ultra
und die anschließende ausdrückliche Scopeentscheidung des Product Owners.
Dieser Plan ersetzt den Arbeitsauftrag des breiten CI-Audits im alten Goal.
Das alte breite Goal ist gelöscht. Auf ausdrücklichen Ownerauftrag ist ein
neues Goal mit der unten präzisierten Main-Abnahme eingerichtet.

Die erste Lieferung ist mit [PR #86](https://github.com/enpasos/skillpilot/pull/86)
nach main übernommen: Commit
[`ab0aa4ea9f`](https://github.com/enpasos/skillpilot/commit/ab0aa4ea9f861c8a6bd6e6600268548a516ef666).
Sie entstand auf `fix/g17-checker` von `0ce5a8d791e` und bestand die frischen
Pflichtworkflows einschließlich G17-Regressionen und unveränderter Fachfloors.
Die notwendige technische Transitivitätskorrektur ist mit
[PR #87](https://github.com/enpasos/skillpilot/pull/87) und Main-Commit
[`d63e1b408d`](https://github.com/enpasos/skillpilot/commit/d63e1b408dd18ce744ad47682f06398bc0f01be0)
geliefert. Alle fünf frischen Pflichtworkflows einschließlich sämtlicher acht
Hauptjobs waren erfolgreich. Der begrenzte Frischeanschluss und die erste
Mathematikreduktion sind mit [PR #88](https://github.com/enpasos/skillpilot/pull/88)
auf main bei
[`2c2fc3bc0d`](https://github.com/enpasos/skillpilot/commit/2c2fc3bc0dd9e964261ebe3c7badab3b247f09d5)
geliefert. Auch dessen geprüfter PR-Head bestand alle fünf Pflichtworkflows
und sämtliche acht Hauptjobs. Die bestätigte einheitliche Rollenpflicht ist mit
[PR #89](https://github.com/enpasos/skillpilot/pull/89) auf main bei
[`3ee1acc373`](https://github.com/enpasos/skillpilot/commit/3ee1acc373f8d56e565783e122c971abbac61122)
geliefert; alle fünf frischen PR-Workflows und acht Hauptjobs bestanden.
Der erste Biologie-Batch ist mit
[PR #90](https://github.com/enpasos/skillpilot/pull/90) auf main bei
[`3b71ee9370`](https://github.com/enpasos/skillpilot/commit/3b71ee9370805f98b37f0e7e9b3352b9ac26f845)
geliefert; sein geprüfter PR-Head bestand fünf Pflichtworkflows und acht
Hauptjobs. Der sichtbare Checkout liegt für die aktuelle Dokumentationslieferung
auf `docs/graph-rules-and-milestones`, ausgehend von diesem Main-Commit.
PR84 bleibt als Herkunft des alten Auditstands getrennt erhalten.
Der alte WIP und lokale Änderungen sind gesichert; unversionierte Altartefakte
bleiben erhalten.

**Lieferregel:** Den jeweils kleinen, abgeschlossenen PR mit erfolgreicher
Pflicht-CI nach main bringen, bevor der nächste Änderungsumfang begonnen wird.
Die Entwicklung bleibt im bereits geöffneten, sichtbaren
IDE-Checkout; kein separater Arbeitsbaum.

## Ownerkorrektur vom 8. November: historische Pause, Fortsetzung aktiv

Der Owner stoppte am 8. November den bisherigen Umsetzungslauf und pausierte
das G17-Goal. Diese Stopentscheidung bleibt als historische Korrektur erhalten.
Anschließend hat der Owner die Fortsetzung ausdrücklich beauftragt; das Goal
ist wieder aktiv. Zuerst wird die eigenständige Dokumentationslieferung
abgeschlossen, danach folgt die Umsetzung unter der korrigierten atomaren Norm.
Verbindlich ist `R ⊆ A × A`: alle Voraussetzungen vollständig zwischen atomaren
Zielen erfassen. Erst die atomare Repräsentation sichern, dann durch sie
abgedeckte nichtatomare `requires` entfernen und erst danach die atomare Relation
transitiv reduzieren. Atomare Autorenkanten zugunsten verbliebener Clusterkanten
zu löschen ist nicht der beauftragte Zielzustand. `CQR-102` und `GVR-012` bleiben
direkt atomar; die vorgeschlagene Lockerung wurde verworfen.

Die [vollständige Regel- und Meilensteinmatrix](../qa-ci/graph-definition-rule-milestone-matrix.md)
erfasst den TeX-Korpus mit 143 Gruppen. Globale atomare Normalform und vollständige
G17-Prüfung sind Sollbasis vor jedem Fach-Meilensteinpass M1–M7. Die Matrix
weist bestehende Teilgates und Lücken aus; sie beauftragt keinen zusätzlichen
143-Regel-Implementierungsauftrag und keine fachliche Inhaltsarbeit.

PR #90 ist auf main bei `3b71ee9370805f98b37f0e7e9b3352b9ac26f845` geliefert;
sein getesteter PR-Head bestand fünf Pflichtworkflows und acht Hauptjobs.
Der anschließende, nicht akzeptierte V2-Versuch mit 173 weiteren Bio-Löschungen
ist unverändert gesichert auf
`archive/g17-biology-v2-before-atomic-target-20261108` bei
`69dcee1ed22db53fc641c220f9246d0b508cbb89`. Alle elf WIP-Dateien wurden bytegleich
geprüft; der alte Audit-WIP `2e73a5c05897aab3fd436eabd8267c2b9a1fd302` und
unversionierte Altartefakte bleiben erhalten. Dieser V2-Versuch ist keine
freigegebene Löschliste. Er bewahrte atomare Wirkung, verletzte jedoch die
vorgeschriebene Autorenrepräsentation und den korrekt ablehnenden M7-Floor.

Die aktuelle Dokumentationsarbeit liegt sichtbar im selben IDE-Checkout auf
`docs/graph-rules-and-milestones`, ausgehend vom genannten Main-Commit. Sie ist
als eigenständige Dokumentationslieferung von der nicht akzeptierten
Datenänderung getrennt und wird zuerst als Dokumentations-PR geliefert.
Der nächste Umsetzungsschritt im wieder aktiven G17-Auftrag ist ein endlicher
Atomarisierungs-/Erhaltungsnachweis auf tatsächlichen Scopes. Brauchbare
Invarianztests und Vergleichsbindungen aus dem gesicherten WIP werden dafür
einzeln geprüft übernommen. Die 173 falsch priorisierten Löschungen werden nicht
blind zurückgespielt. Historische Inventare und Vorschauen im folgenden Plan
ersetzen diese neue Zielpriorität nicht.

## Ein aktives Ziel, ein tatsächlicher Lieferweg

Das wieder aktive Ziel bleibt **G17 in der Standard-Meilensteinprüfung und die tatsächliche
Wiederherstellung aller ursprünglichen M6-/M7-Stände auf main**. Der Owner hat
die Abnahme anhand seines Screenshots ausdrücklich festgelegt:

| Zielstand auf main | Fächer |
| --- | --- |
| M7 | Biologie, Chemie, Mathematik, Physik, Wirtschaftswissenschaften |
| Mindestens M6 | Deutsch, Geschichte, Informatik, Latein, Politik und Wirtschaft |

Die Standardprüfung wertet G17 für ihren vollständigen deklarierten kanonischen
Fachbestand aus. Korrektur und Abnahme umfassen diese zehn Fächer einschließlich
relevanter fachfremder Voraussetzungen und vererbender Vorfahren. Ein bloßer
Mathematik-/Physik-Teilscan genügt nicht. Die übrigen experimentellen M0-Fächer
erhalten kein zusätzliches Aufstiegsziel; ihre offenen Befunde werden dennoch
nicht als bestanden dargestellt. Eingabebestand und Prüferrevision werden vor
der Umsetzung festgehalten.

Die Arbeit bleibt deterministisch: zuerst vollständige atomare Voraussetzungen
sichern, dann redundante nichtatomare Anforderungen entfernen und zuletzt
atomar reduzieren. Nach betroffenen Änderungen Vererbung und Expansion neu
auflösen sowie Zeugen und vereinbarte Atom-/Scope-/Frontierinvarianten prüfen. Geordnete Batches sind sinnvoll; alle anfangs redundanten Ursprünge
gleichzeitig zu löschen wäre unsicher. Keine neue Bewertung von Zielzuschnitt,
Beschreibungen, Aufgaben, Bildern oder Quellen ist Teil dieses Auftrags.

Der vorhandene WIP bleibt bei `2e73a5c05897aab3fd436eabd8267c2b9a1fd302`
in [PR #84](https://github.com/enpasos/skillpilot/pull/84) erhalten. Seine
erhaltenswerten Nettoänderungen werden in kleine lieferbare Pakete aufgeteilt.
Den gesamten WIP zusammen zu mergen ist nicht der Lieferplan.

## G17: kleine Lieferungen innerhalb derselben Aufgabe

| Lieferung | Inhalt und Herkunft | Konkrete Main-Abnahme |
| --- | --- | --- |
| G17-Prüfer, geliefert | Eigenständiger `app/scripts/auditTransitiveMinimality.ts`, Algorithmus- und CLI-Regressionen, eindeutiger vollständiger Bestandsaufruf und dieser Lieferplan. | PR #86 auf main bei `ab0aa4ea9f`; frische Pflicht-CI erfolgreich. 572 unabhängige Literalvergleiche, 3.593 abgewiesene ungültige Graphen und zwölf echte CLI-Testgruppen. Tatsächlicher aktueller Bestandsaufruf: 21 Roots, fünf `pass`, zwölf `fail`, vier `invalid-input`, korrekt Exit 2. |
| Technische Transitivitätsabhängigkeit, geliefert | Nur die nachgewiesen erforderlichen fünf Produktionsdateien und gezielten Regressionen aus `b8eef5b967`: gemeinsame Voraussetzungstopologie, vollständige kanonische Level-2-Zielclosure und Fokusfilter nach transitiver Auswertung. | PR #87 auf main bei `d63e1b408d`; vollständiger regulärer lokaler Backendcheck mit 2.689 bestandenen Fällen, 19 bestehenden optionalen Skips und null Fehlern; alle fünf frischen Remote-Workflows erfolgreich. Regressionen über alle vier Frontier-APIs, normale/strikte Modi, gemeisterte und außerhalb des Fokus liegende Zwischenziele sowie fremde/vererbte Voraussetzungen. Gespeicherte Mastery und Anerkennungsregeln bleiben unverändert. |
| Begrenzter Frischeanschluss und erste Reduktion, geliefert | Genau die Mathematikkante `bf17cada… → 71cec9fb…` mit direkt authored atomarem Ersatzpfad `bf17cada… → 91e2f564… → 71cec9fb…`. Eine harte Reduktionsbescheinigung erlaubt ausschließlich den nachgewiesenen historischen Vergleichswert an den betroffenen Reviewbindungen. | PR #88 auf main bei `2c2fc3bc0d`; alle fünf frischen PR-Workflows und acht Hauptjobs erfolgreich. Vollständiger Katalogabgleich, geordnete Auditorprüfung, unveränderte übrige Felder und tatsächlicher Applicability-Vergleich. Native CI-Regression über 1.240 Konfigurationen für Projektion, vollständige atomare Nachfrage und die bisherige Rollenprüfung. Tatsächliche Python-/Release-Modell-Conformance bestanden. Originale Fingerprintfunktionen und Reviewarchive bleiben unverändert; ungültige deklarierte Beweise scheitern hart. V1 deckt direkte atomare Blattpfade ab und ist keine Freigabe sämtlicher Bestandskandidaten. |
| Einheitliche Rollenpflicht, geliefert | Ausdrücklich bestätigte Ownerentscheidung vom 7. November: direkte, geerbte und transitive Voraussetzungsknoten müssen in der Level-2-Komposition eine Rolle haben. Die bisherige Vererbungsausnahme entfällt. | PR #89 auf main bei `3ee1acc373`; alle fünf frischen PR-Workflows und acht Hauptjobs erfolgreich. Vollständiger regulärer lokaler Backendlauf: 2.693 bestanden, 19 bestehende optionale Skips, keine Fehler. Vorhandene Topologie, unveränderte atomare Fokus-/Masteryprüfung, echte Bio-/Math-Reduktionsgegenfälle und 1.240 native Konfigurationen. Der reale unvollständige HE/G9-Scope ist ausdrücklich negativ geprüft; positive Assessmentfälle verwenden den bestehenden vollständig deklarierten HE/G8-Scope bei unveränderten Workflowassertionen. |
| Biologie: redundante Anforderungen an ein Orientierungsziel, geliefert | 186 frisch belegte direkte Anforderungen an `2d451684…` entfernt; ausschließlich die jeweiligen `requires`-Arrays ändern sich. Von 187 vorbereiteten Kandidaten bleibt einer wegen seines aktuellen geerbten Clusterzeugen außerhalb des unveränderten V1-Vertrags unverändert. | PR #90 auf main bei `3b71ee9370`; sein geprüfter PR-Head bestand fünf Pflichtworkflows und acht Hauptjobs. Bestehende Mathematikoperation und ursprüngliche 21 Quelldigests erhalten; kumulativer Live-Prüfer mit 187 Operationen, vollständigem Replay, überlebenden Zeugen und tatsächlicher Applicability-Gleichheit über 6.524 Ziele bestanden. Biologie-Befunde sinken durch die 186 Entfernungen von 359 auf 173. Das ist die Abnahme dieses gelieferten Batches, nicht die vollständige G17-Abnahme. |
| G17-Bestand und Standard-Meilensteinprüfung | Mechanisch belegte Reduktionsbatches, G17 in der regulären Meilensteinberechnung und verpflichtender CI-Aufruf gegen die tatsächlichen Dateien. Vorhandene geeignete Korrekturen wiederverwenden. | Null G17-Verstöße im Abnahmebestand; Invarianten erhalten; wieder eingefügte Redundanz oder unvollständige Prüfung verhindert den Meilensteinpass. Sämtliche zehn Zielstände werden regulär auf main mindestens erreicht, alle erforderlichen frischen CI-Prüfungen bestehen und die Änderungen sind nach main geliefert. Erst damit ist das Goal erledigt. |

Die erste Lieferung hat den Prüfer auf main gebracht, behauptet aber keinen minimalen
Bestand und erfüllt das Goal noch nicht. Ein separater grüner G17-Check reicht
ebenfalls nicht: Die Standard-Meilensteinprüfung muss die Zielstände tatsächlich
berechnen. Ihr echter Bestandscheck bleibt bei vorhandenen Fehlern rot. Es gibt
keine abgesenkten Untergrenzen, gesetzten Reifegradzahlen oder Warnungs-,
Baseline- und Ignore-Ausnahmen zum Erzeugen eines Passes.

Der eigenständige Bestandsaufruf lautet im Verzeichnis `app`:
`npm run check:transitive-minimality`. Er lädt denselben rekursiven kanonischen
Dateibestand wie der Standardproducer und berechnet jeden Fachroot mit seiner
vollständigen Referenz- und Vererbungsclosure. Exit 0 bedeutet vollständig
bestanden, Exit 1 vorhandene Redundanz und Exit 2 ungültige Eingabe oder Closure.
`npm run audit:transitive-minimality` dient nur der Berichterstellung:
Befunde bleiben als `fail` sichtbar, ungültige Eingaben bleiben Exit 2.
Explizite `--root`-Auswahlen sind im Bericht als Teilscan gekennzeichnet.
Die erste CI-Anbindung führt die Algorithmus- und CLI-Regressionen aus;
die verpflichtende Standard-Meilensteinanbindung folgt mit dem Bestands-PR.

Die native Reduktionsprüfung zeigte außerdem einen konkreten Regelkonflikt:
Die bisherige Rollenpflicht unterschied direkte von geerbten Voraussetzungen.
Das Entfernen eines redundanten direkten Duplikats konnte deshalb einen Start
freigeben, obwohl sich die wirksamen Voraussetzungen nicht änderten.
Der Owner hat am 7. November ausdrücklich entschieden, die Rollenpflicht auf
alle geerbten und transitiven Voraussetzungsknoten zu vereinheitlichen und
die frühere Ausnahme aufzuheben. Bisher erlaubte Konfigurationen dürfen dadurch
blockieren. Geprüft wird die vorhandene wirksame Zielknotenrelation vor ihrer
atomaren Clusterauflösung; reine Contains-Nachkommen erhalten keine weitere
Rollenpflicht. Rollen werden nicht automatisch ergänzt, Fokus- und Masteryregeln
bleiben bestehen. Diese isolierte Lieferung ist mit PR #89 auf main angekommen.
Größere Reduktionsbatches werden jetzt unter derselben neuen Regel verglichen.

Der erste Biologie-Batch nutzt nur direkt authored atomare Blattpfade.
Er ordnet den vollständigen relevanten ursprünglichen `requires`-Graphen mit
Voraussetzungen zuerst und filtert erst danach die Kandidaten. Jeder akzeptierte
Schritt erhält einen frisch berechneten Auditorzeugen; 105 zuvor aufgezeichnete
Wege waren durch spätere Löschungen gefährdet und durften nicht übernommen werden.
Der Live-Prüfer bestätigt für 186 akzeptierte Entfernungen sämtliche endgültigen
Wege und die unveränderte Applicability. Der Kandidat `135447a0…` bleibt bewusst
offen, weil sein aktueller Zeuge einen Cluster und einen geerbten Ursprung nutzt.
Es gibt dafür weder eine abweichende Zeugenwahl noch eine gelockerte V1-Prüfung.
Die 173 übrigen Biologiebefunde und der Rest des Abnahmebestands bleiben offen.

Der tatsächliche Buchbau deckte einen weiteren Aufruf derselben bestehenden
Semantic-kind-Quellprüfung im Atlasgenerator auf. Dieser erhielt den bereits
verifizierten Kontext noch nicht. Atlasbau, Veröffentlichungsprüfung und ihre
CLI-/Testaufrufe reichen ihn nun ausdrücklich weiter; die Fingerprintfunktion
und das historische Ledger bleiben unverändert. Ohne Kontext gilt weiterhin
der aktuelle Rohwert. Mit Kontext wird zuerst der aktuelle Rohwert an den
verifizierten Snapshot gebunden, bevor der aktuelle oder zertifizierte
ursprüngliche Vergleichswert zulässig ist. Es entsteht keine fünfte
Vergleichsfamilie; Projektionen und Receipts werden aus aktuellen Daten erzeugt.

Die vollständige deterministische Atlasregeneration erzeugt 27 Ausgaben.
26 sind bytegleich; im aktiven
[Biologie-Receipt](https://github.com/enpasos/skillpilot/blob/18570a629e20b4f4cdd0f5e1be9478c87b41f16d/app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json)
ändert sich ausschließlich `/inputBindings/0/sha256` von
`sha256:9b3ef170c367b0cd9936804c9b0bb696d0b4f2465d8688f9f707abf962de7b79`
auf `sha256:6c68f48d0c83bf50734d0f42c9efc9efb8c85fc2bb2ad2a23a15845caf974444`.
Alle 24 Ansichten, Manifest, Navigation sowie sämtliche Scope-, Zeugen- und
Entscheidungsfelder bleiben gleich. Dies ist ausdrücklich geprüfte Pflege des
aktuellen Eingabepins, keine Neubindung historischer Reviewentscheidungen.

Ein grüner G17-Einzelcheck erlaubt keinen Merge an anderen erforderlichen
Prüfungen vorbei. Blockieren bestehende technische Frischebindungen die zweite
Lieferung, wird genau diese Abhängigkeit isoliert und offen gelöst. Keine
stillen Fingerprintwechsel und keine dadurch gestarteten Fachreviewkampagnen.

Die erste native Reduktionsregression hat eine konkrete technische Abhängigkeit
aufgedeckt: In Biologie `DE-BY/CrossStage/G9/GK` wurde ein nicht benötigter
Cluster aus der Projektionsmenge als kanonisches Voraussetzungstarget validiert.
Das setzte die echte Frontier-Topologie auf `null` und blockierte selbst
„Warum Biologie?“. Die begrenzte Korrektur validiert denselben vollständigen
atomaren Level-2-Wurzelsatz, mit dem der Voraussetzungskontext aufgebaut wird.
Alle transitiven Anforderungen bleiben unabhängig von Fokus und Mastery geprüft;
Rollenprüfung und Lernzielinhalte ändern sich dadurch nicht. Der echte Bio-Fall
und eine ungültige atomare Anforderung außerhalb des Fokus gehören zur Regression.
Ein Vorher-/Nachher-Fehlergleichstand ersetzt diesen erfolgreichen Nachweis nicht.

Der reguläre Backendlauf deckte im Anschluss einen echten HTTP-500-Fehler
bei Wirtschaftswissenschaften `DE-BB/G8` und `DE-BB/G9` auf: Die Rich-Frontier
fragte einen sichtbaren Navigationscluster ab, der nicht zum validierten
Voraussetzungskontext gehört. Die gemeinsame Prüfung lehnt einen Kandidaten
außerhalb dieses Lookups geschlossen ab. Sie erweitert den Graphen nicht;
unbekannte atomare Anforderungen bleiben Fehler der vollständigen
Wurzelvalidierung. Die bestehende M6-Integration prüft deshalb zusätzlich den
HTTP-Status vor Filtern und unveränderten Zielzahlen.

Die erste Kantenentfernung machte außerdem den aktiven kanonischen Input-Pin
des Mathematik-Dauerlayoutplans veraltet. Der tatsächliche CI-Schritt
`check:math-duration-composition-views` wies diesen Stand hart zurück.
Die [bestehende Pflegeanweisung](../qa-ci/math-m7-concept-and-handoff-2026-09-28.md)
erlaubt dessen Fortschreibung nach Prüfung des Inhaltsdeltas. Dieses Delta
besteht ausschließlich aus der belegten `requires`-Entfernung am gewöhnlichen
Q2-Atom; es betrifft keine Entscheidung des Sek-I-Splitplans.
In `app/scripts/config/math-duration-split-spanning-tree-policy.json` wird deshalb
nur `inputs.canonical.sha256` ausdrücklich von
`e0ff0cafccf0f638c4cb36d5a252480ccc7062750619ef0452a447775bf96fe1` auf
`07749daefff5535416b17d133a84cdcfad40eb5b3137de4958898b8386d79838`
fortgeschrieben. Der reguläre Generatorcheck besteht; alle 18 vorhandenen
Views sind bytegleich. Alle übrigen Planfelder, 83 Platzierungen, sieben
additiven Adjudikationen und fünf Quellen-Scope-Bindungen bleiben unverändert.
Historische Reviews werden nicht neu gebunden; die vier Vergleichsfamilien
der Reduktionsbescheinigung werden dafür nicht erweitert.

Der abgeleitete Mathematik-Rationale-Coverage-Bericht folgt derselben
Kantenentfernung: direkte `requires`-Relationen und noch offene
Relationsbegründungen sinken jeweils von 2.460 auf 2.459. Die reguläre
Regeneration ändert ausschließlich diese Zähler und den Zeitstempel; der
zugehörige Check besteht. Zielmengen, Quellenbegründungen und alle übrigen
offenen Lücken bleiben gleich.

Die tatsächliche Pflicht-CI kompiliert und validiert außerdem das Release-Modell
auch ohne vollständigen Paketexport. Beide Pythonwerkzeuge verglichen die
Semantic-kind-Bindung bisher ausschließlich mit dem aktuellen Rohwert und
wiesen deshalb dasselbe reduzierte Ziel zurück. Sie starten nun jeweils den
bestehenden Node-Verifier unabhängig, prüfen vollständigen Source-Snapshot,
Datei-/Registry-Bytes und sämtliche aktuellen Fingerprints und erlauben erst
danach den zertifizierten ursprünglichen Wert derselben Vergleichsfamilie.
Die Fingerprintfunktionen und historischen Ledger bleiben unverändert;
kompilierte Inhalte entstehen weiterhin aus dem aktuellen reduzierten Dokument.
Der vorhandene Conformance-Bericht weist den Nachweis aus und wird vom
unabhängigen Validator vollständig rekonstruiert. Source-freie Consumer binden
diesen Bericht über das Manifest und benötigen dafür weder Node noch Repository.

Der aktuelle normalisierte Modell-Digest ändert sich durch die Kantenentfernung.
Deshalb wird die aktive Redistribution-Bindung mit dem vorhandenen Generator
ausdrücklich von `e8ad1ec76513cac8248234798ea10e612db11fb58785ad9723b49b77ca80b97a`
auf `fb51e95c0113339cf0252653ee91f0258bd56f80893d85fe6f45fb7dc775e602`
fortgeschrieben. Der geprüfte Ledgerdelta besteht ausschließlich aus
`/contentDigest`; alle Entscheidungen und Fingerprints, 839 offene Prüfungen
und `publicationReady: false` bleiben gleich. Build-Inputs, Ressourcenindex,
Source-Verification-Ledger und historische Paketartefakte bleiben unverändert.
Diese technische Pflege erklärt keine neue fachliche oder menschliche Freigabe.

Der zuvor belegte technische Fehler auf main war der Abbruch von
Voraussetzungspfaden an gemeisterten oder außerhalb liegenden Zwischenknoten.
Die notwendige Transitivitätskorrektur aus `b8eef5b967` wurde mit PR #87 im
nachgewiesenen Umfang geliefert. Ein reproduzierbarer Unterschied stoppt
weiterhin den betroffenen Reduktionsbatch.
Daraus folgt kein Auftrag zur fachlichen Neugestaltung.

## Weitere erhaltenswerte Arbeit: geplante Lieferwarteschlange

Diese Pakete werden nicht parallel zum G17-Ziel begonnen. Nach dessen Abschluss
wird jeweils das nächste einzelne deterministische Ziel gewählt. Die Herkunft
ist geprüft; ein vorhandener lokaler Testbeleg ist noch keine Main-Abnahme.

| Paket und Herkunft | Geplanter Weg nach main | Verbleibende Abnahme |
| --- | --- | --- |
| Kartenabschluss trotz späterer Fälligkeit, `234372d013` | Kleiner Regressionstest-PR mit `AssessmentCompletionSrsIntegrationTest.java` und nötiger Workflowanbindung; passende bereits entschiedene Dokumentationskorrektur zuordnen. | Normaler Backend-/Integrationslauf auf der dann aktuellen Basis. Vorhandener Beleg: 21 Tests; neuer PR braucht frische Pflichtprüfungen. |
| Eindeutige Fremdreferenzen, `4b19462103` | Eigener Prüfer-PR mit `validateGraph.ts`, `testGeneralGraphReferenceCli.ts` und gezielter Verdrahtung. | 23 vorhandene CLI-Gegenfälle sowie echter Bestandslauf und alle Pflichtprüfungen. Bestandsfehler werden nicht verdeckt. |
| Frühere Quellprüfung, Workflowanteil aus `96b770b2ea` | Die DAG-Änderung und passende Workflowtests auf die dann aktuelle Main-CI übertragen. Der Abschluss verlangt erfolgreiche Quellprüfung und Buchbau. | Lokale Workflowkontrollen und frischer realer CI-Lauf. Nicht den gesamten historischen Workflow oder die mitgepackten Backendfixtures übernehmen. |
| UUID-CLI, `69a4a5d5f1` | Getrennter deterministischer Identitätsauftrag: Prüfer und nötige identitätserhaltende Bestandsreparaturen zusammen einliefern. | Die bisher gefundenen 164 ungültigen IDs und 327 Referenzendpunkte sind echte Blocker. Kein Merge der vollständigen Gateaktivierung mit verdeckter Ausnahme. |
| Vollständige Assessment-/Materialprüfung und weitere technische Gates | Jeweils ein eigener, auf Main portierter Prüfer-/Verbraucher-PR mit den bereits vorhandenen konkreten Gegenfällen. Abhängige Gates und Daten nur gemeinsam freigeben, wenn ihre Abnahme erfüllt ist. | Zum Beispiel echte M6-Positivkontrolle plus Ablehnung des veralteten positiven Berichts; aktuelle Quellen-/Scopebindung und frische Pflichtprüfungen. Erforderliche Bestandsreparaturen vorher als endliches eigenes Paket benennen. |
| Bereits vorliegende Curriculum-/Text-/Aufgaben-/Bildkorrekturen | Nach G17 gesondert über Einlieferung entscheiden, dann fach- oder paketweise Folge-PRs mit bestehenden passenden Reviewbelegen. Bereits brauchbare Deutsch-/Geschichte-/Latein-Korrekturen und Informatik-/Bildpakete dabei ausdrücklich zuordnen. | Aktuelle fachliche und technische Abnahme des jeweiligen Pakets. Kein neuer semantischer Arbeitsstrang im G17-Auftrag; keine pauschale Zusage, alle Kandidaten zu übernehmen. |

Die Umsetzung darf die erforderliche Nettoänderung neu auf Main zusammensetzen;
ein vollständiger Cherry-pick großer Mischcommits ist nicht erforderlich.
Benötigte Nachweise begleiten den jeweiligen PR. Experimentelle Doppelstände
und nicht verwendete Zwischenartefakte brauchen keinen Platz auf main.

## PR84 geordnet abschließen

Für jedes Paket wird der Lieferstatus unmittelbar beim jeweiligen Folge-PR
fortgeschrieben:

- **Übernommen:** Folge-PR und tatsächlicher Main-Commit.
- **Konkret offen:** benannter Folge-PR oder Auftrag mit überprüfbarem
  Abnahmekriterium und ausgewiesenen Blockern.
- **Bewusst nicht übernehmen:** begründete Entscheidung, ohne stillen Verlust.

PR84 wird erst geschlossen, wenn diese Zuordnung vollständig ist. Ein
unbefristeter Draft oder ein Archivbranch ersetzt den Lieferweg nicht.
Umgekehrt wird erhaltenswerte Arbeit nicht ungeprüft gemerged, nur um sie
formal auf main zu haben.

Abgeschlossen und nach main geliefert sind G17-Prüfer, technische
Transitivitätskorrektur, der begrenzte Frischeanschluss mit genau einer realen
Kantenentfernung, die bestätigte einheitliche Rollenpflicht und der erste
Biologie-Batch mit 186 Entfernungen aus PR #90. Zuerst folgt die eigenständige
Dokumentationslieferung; der nächste Umsetzungsschritt ist der endliche
Atomarisierungs-/Erhaltungsnachweis unter der verbindlichen atomaren Zielnorm.
Weitere mechanische Reduktionen und die Standardintegration bleiben Teil
desselben aktiven Goals. Die historische vollständige In-Memory-Vorschau
hat 2.435 Ursprungskanten nacheinander mit jeweils frischem Auditor entfernt
und im geschützten Scope null verbleibende G17-Befunde erreicht. Dabei wurden
keine Curriculumdateien geändert. Die zusätzlichen nativen Messungen zeigen,
dass atomare Erreichbarkeitsgleichheit allein die bisherige direkte
Rollenprüfung nicht abdeckt. Diese Vorschau ist keine Freigabe unter der
korrigierten atomaren Zielnorm. Die Rollenentscheidung ist umgesetzt; neue native
Vorher-/Nachher-Vergleiche unter derselben Regel bleiben für jeden übernommenen
Batch erforderlich. Das eröffnet keine
fachliche Überarbeitung und ersetzt keine Bestands- oder Main-Abnahme.
Die M6/M7-Wiederherstellung unter der erweiterten
Standardprüfung ist verbindliche Abnahme dieses Goals. Der breite
518-Regel-Audit und semantische Arbeiten gehören weiterhin nicht dazu.
Ein tatsächlich fachlicher Blocker wird konkret benannt; er ist kein Auftrag,
eigenständig Inhaltsarbeit oder neue Reviewkampagnen zu beginnen.
