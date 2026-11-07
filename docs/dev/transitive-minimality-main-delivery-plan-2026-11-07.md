# Transitive Minimalität und Einlieferung nach main

Stand: 7. November 2026. Grundlage ist die kritische Prüfung mit Astra Ultra
und die anschließende ausdrückliche Scopeentscheidung des Product Owners.
Dieser Plan ersetzt den Arbeitsauftrag des breiten CI-Audits im alten Goal.
Das alte breite Goal ist gelöscht. Auf ausdrücklichen Ownerauftrag ist ein
neues Goal mit der unten präzisierten Main-Abnahme eingerichtet.

Die erste Lieferung ist mit [PR #86](https://github.com/enpasos/skillpilot/pull/86)
nach main übernommen: Commit
[`ab0aa4ea9f`](https://github.com/enpasos/skillpilot/commit/ab0aa4ea9f861c8a6bd6e6600268548a516ef666).
Sie entstand auf `fix/g17-checker` von `0ce5a8d791e` und bestand die frischen
Pflichtworkflows einschließlich G17-Regressionen und unveränderter Fachfloors.
Die notwendige technische Transitivitätskorrektur folgt jetzt auf
`fix/g17-transitive-prerequisites` von diesem Main-Commit. PR84 bleibt als
Herkunft des alten Auditstands getrennt erhalten. Der alte WIP und lokale
Änderungen sind gesichert; unversionierte Altartefakte bleiben erhalten.

**Lieferregel:** Den jeweils kleinen, abgeschlossenen PR mit erfolgreicher
Pflicht-CI nach main bringen, bevor der nächste Änderungsumfang begonnen wird.
Die Entwicklung bleibt im bereits geöffneten, sichtbaren
IDE-Checkout; kein separater Arbeitsbaum.

## Ein aktives Ziel, ein tatsächlicher Lieferweg

Das aktive Ziel ist **G17 in der Standard-Meilensteinprüfung und die tatsächliche
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

Die Arbeit bleibt deterministisch: aktuell redundante Ursprungskante entfernen,
Vererbung neu auflösen, Zeugen und vereinbarte Graph-/Scope-/Frontierinvarianten
prüfen. Geordnete Batches sind sinnvoll; alle anfangs redundanten Ursprünge
gleichzeitig zu löschen wäre unsicher. Keine neue Bewertung von Zielzuschnitt,
Beschreibungen, Aufgaben, Bildern oder Quellen ist Teil dieses Auftrags.

Der vorhandene WIP bleibt bei `2e73a5c05897aab3fd436eabd8267c2b9a1fd302`
in [PR #84](https://github.com/enpasos/skillpilot/pull/84) erhalten. Seine
erhaltenswerten Nettoänderungen werden in kleine lieferbare Pakete aufgeteilt.
Den gesamten WIP zusammen zu mergen ist nicht der Lieferplan.

## G17: kleine Lieferungen innerhalb derselben Aufgabe

| Lieferung | Inhalt aus dem WIP | Konkrete Main-Abnahme |
| --- | --- | --- |
| G17-Prüfer, geliefert | Eigenständiger `app/scripts/auditTransitiveMinimality.ts`, Algorithmus- und CLI-Regressionen, eindeutiger vollständiger Bestandsaufruf und dieser Lieferplan. | PR #86 auf main bei `ab0aa4ea9f`; frische Pflicht-CI erfolgreich. 572 unabhängige Literalvergleiche, 3.593 abgewiesene ungültige Graphen und zwölf echte CLI-Testgruppen. Tatsächlicher aktueller Bestandsaufruf: 21 Roots, fünf `pass`, zwölf `fail`, vier `invalid-input`, korrekt Exit 2. |
| Technische Transitivitätsabhängigkeit | Nur die nachgewiesen erforderlichen fünf Produktionsdateien und gezielten Regressionen aus `b8eef5b967`: gemeinsame Voraussetzungstopologie, vollständige kanonische Level-2-Zielclosure und Fokusfilter nach transitiver Auswertung. | Ein redundanter Shortcut darf Frontier und Required Work vor/nach Entfernung nicht verändern, auch bei gemeistertem oder außerhalb des Fokus liegendem Zwischenziel. Alle vier Frontier-APIs, normale/strikte Modi, fremde/vererbte Voraussetzungen und Cachetrennung prüfen. Gespeicherte Mastery und Anerkennungsregeln bleiben unverändert. Frische Pflicht-CI und Lieferung nach main. |
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

Ein grüner G17-Einzelcheck erlaubt keinen Merge an anderen erforderlichen
Prüfungen vorbei. Blockieren bestehende technische Frischebindungen die zweite
Lieferung, wird genau diese Abhängigkeit isoliert und offen gelöst. Keine
stillen Fingerprintwechsel und keine dadurch gestarteten Fachreviewkampagnen.

Ein konkreter technischer Fehler ist belegt: Main kann
Voraussetzungspfade an gemeisterten oder außerhalb liegenden Zwischenknoten
abbrechen. Die vorhandene Transitivitätskorrektur aus `b8eef5b967` darf deshalb
nur im nachweislich erforderlichen Umfang als G17-Abhängigkeit übernommen
werden. Ein reproduzierbarer Unterschied stoppt den betroffenen Batch.
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

Abgeschlossen ist die kleine G17-Prüferlieferung. Nächster Schritt ist die
notwendige technische Transitivitätskorrektur, danach folgen begrenzte
Frischeanschlüsse und mechanische Reduktionen samt Standardintegration.
Die M6/M7-Wiederherstellung unter der erweiterten
Standardprüfung ist verbindliche Abnahme dieses Goals. Der breite
518-Regel-Audit und semantische Arbeiten gehören weiterhin nicht dazu.
Ein tatsächlich fachlicher Blocker wird konkret benannt; er ist kein Auftrag,
eigenständig Inhaltsarbeit oder neue Reviewkampagnen zu beginnen.
