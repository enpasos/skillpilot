# Neustartplan: curriculare Anerkennung und Fachabschluss

> **Als Arbeitsplan abgelöst am 4. November 2026:** Der aktuelle
> [Umsetzungsplan für Lerneinheiten und integrierte Lernkarte](learning-units-implementation-plan.md)
> bündelt die akzeptierte rekursive Struktur, die schrittweise Cockpit-Integration
> und die neue Fachfolge Mathematik → Physik → Chemie → Biologie.
> Dieses Dokument bleibt mit seinen damaligen Befunden und ID-Listen erhalten;
> es ist keine konkurrierende Freigabe zur Umsetzung. Seit 6. November ist auch
> der verlinkte Nachfolgeplan abgebrochen; aktuell gilt der
> [neue Mathematik-/Physikplan](mathematics-physics-learning-units-plan.md).
> Seine globale qualifizierte Prüfungsanerkennung ersetzt die hier beschriebene
> lokale Restbedarfsregel.

**Stand: 4. November 2026. Historischer Neuplanungsstand.**
Dieses Dokument plant die Korrektur; es behauptet weder eine bereits korrigierte
Runtime noch geprüfte Anerkennungsverträge, Deployment oder erfolgreiche Host-Abnahme.
Der alte PR wird bausteinweise geprüft und ersetzt diesen Auftrag nicht.
Die spätere Entscheidung für rekursive **Lerneinheiten** ist begrifflich und in
folgenden Strukturgrenzen berücksichtigt. Vor Umsetzung sind konkrete direkte
Erwerbszuordnung, Untereinheiten und eigene Syntheseprüfungen am Kandidaten zu
prüfen. Die Verbindlichkeit von Einheitszugängen ist noch nicht entschieden;
dieser Plan aktiviert keine technischen Sperren.

## 1. Ziel und fachlicher Rahmen

Die Reihenfolge lautet **Mathematik → Physik → Biologie → Chemie**.
Ein Fach wird nach seinen tatsächlich angebotenen Umfängen abgeschlossen, bevor
das nächste fachlich ausgebaut wird. Wirtschaft ist keine Erweiterung dieses Auftrags.
Die gemeinsame technische Grundlage entsteht einmal; unabhängige Fächer bleiben nutzbar.

Verbindlich sind die [Produktentscheidung vom 4. November](../concept/skill-graph/completion-semantics-clarification-2026-11-04.md),
das [Anerkennungskonzept](../concept/skill-graph/assessment-gated-completion.md),
die [Graph Definition](../concept/skill-graph/graph-definition.md) und die
[Lerneinheiten](../concept/skill-graph/learning-units.md).
Direktes Verständnis und durch unabhängige Anwendung anerkannte Kompetenz sind
global gleichwertig. Pro atomarem Ziel bleibt ausschließlich das binäre Ergebnis
gespeichert: explizite Ergebnisse bilden M, gültige Ableitungen ergänzen M_eff.
Prüfungs- und Lernkartenziele benötigen weiterhin ihre expliziten Ergebnisse.

Vollständige transitive Anforderungen gelten auch durch gemeisterte Zwischenziele.
Transitive Minimalität bleibt erforderlich. Eine offene spätere Prüfung außerhalb
der anerkennenden Lerneinheit nimmt gültige Beherrschung nicht zurück. Fokus, aktuelle
Baumansicht und Persönlicher Lehrplan definieren keinen beliebigen neuen Vertrag.
Harte Zugangssperren zwischen Lerneinheiten und ein Zeitbudgetplaner sind eigene optionale Vorhaben;
sie sind keine Voraussetzung für diese Anerkennungskorrektur.

## 2. Belastbarer Ausgangspunkt

Ausgangsbasis ist main `616324e857aeac915b1335de7b2f10d087e3c5ba`.
Der am 4. November geprüfte Remotehead des offenen Draft-[PR #79](https://github.com/enpasos/skillpilot/pull/79)
ist `802f333f80c58d3409ab5d9fb3e9913fecafbf54`. Der zusätzliche lokale alte
Checkpoint `4f1241b634c7e399c7651b90425b556acd4610f6` enthält weitere begrenzte
Test-/Serialisierungsarbeit. Er ist nicht der Remotehead. Die Bestandszahlen unten
vergleichen diesen lokalen Checkpoint mit der genannten main-Basis.

| Begrenzter Mathematikbestand | main | Alter lokaler Checkpoint |
| --- | ---: | ---: |
| Curriculare atomare IDs im semantischen Ledger | 807 | dieselben 807 |
| Zusätzliche practiceAssessment-IDs gegenüber main | – | 39 |
| Bestehende IDs mit neuer exam-Ausführungsrolle | – | 35 |
| Registrierte Ansichtsdateien | 88 | 147 |
| Deklarierte Länder-/Scopekombinationen | 154 | 154 |

Die 807 curricularen Identitäten bleiben erhalten; eine ausführbare Prüfungsform
darf Ziele nicht aus der fachlichen QA-Population entfernen. Die 39 neuen IDs und
35 Rollenänderungen sind getrennte Mengen. Ansichtsdateien und 154 deklarierte
Auswahlkombinationen belegen keine erfolgreiche native Angebotsauflösung.
Die frühere 161-Angebotsmessung und ihre N6-Quote sind historische Ergebnisse des
damaligen Modells. Der neue Erfolgsnenner entsteht erst aus frischer tatsächlicher
Backend-/Plannerauflösung einschließlich Target-, Prüfungs- und Kartenmengen.

Compiler, Completion-Dienste, Cockpit, Planintegration und Provideradapter sind
bereits auf main vorhanden. Dessen automatische Semantik stoppt jedoch an Mastery
und verwendet den aktuellen Persönlichen Lehrplan als Verbraucherumfang.
Auch der alte PR behebt diese beiden Unterschiede zum neuen Konzept nicht vollständig.
Alte Source-/M7-Nachweise bleiben für unveränderte Inhalte prüfbare Quellenbelege;
sie beweisen keine unabhängige Anwendung unter dem neuen Anerkennungsvertrag.

## 3. Erste Etappe: einen echten Lerneinheitsvertrag entscheidungsreif machen

Vor breiter Änderung wird ein begrenzter tatsächlich angebotener Mathematikumfang
mit Quellen-, Memory-, ID- und Einheitsprüfung bearbeitet. Das Ergebnis benennt
Placement, vollständige Zielmenge, alle lokalen Prüfungen/Karten, externe
Voraussetzungen, historische Ergebnisbedeutungen und offene Entscheidungen.
Die tatsächlichen Mathematikangebote werden einmal nativ inventarisiert und mit
IDs fixiert; vertieft wird zunächst nur das Material des ersten Datenschnitts geprüft.
Noch offene Daten werden nicht durch angenommene Anerkennung überbrückt.
Vor Stufe 2 sind nur drei Vertragsfragen vorgezogen festzulegen: vollständige
Erwerbszuordnung samt Q/K-Pflichten, feste Prüfungsidentität samt Altergebnissen
und ein veröffentlichbarer Versionsvertrag für Anerkennung außerhalb der aktuellen
Lehrplanauswahl. Die bereits entschiedene Produktsemantik wird dabei nicht neu geöffnet.

Erster Kandidat ist **Hessen, Sekundarstufe II, GK, Q2.4 „Matrizen und
Übergangsprozesse“**: `de-he-sekii-gk.view.json`, Strukturpfad
`q2 / q24-gk-transition-processes`. Der vorhandene Zweig enthält 15 fachliche Atome.
Die bestehende Prüfung `57aff94e-91b8-5cc6-9f85-3f317ecf36ca` steht unter
`q2-gk-local-assessments`; ihre reale Aufgabe ist das Stadtwechselmodell unter
`assessments/mathematik/sekii/q2/markov-backward-v2/gk_task_v2.md`.
Sie existiert bereits auf main und wird nicht als neue Arbeit des alten PR gezählt.

**15 fachliche Ziele plus eine Prüfung, K=0, ist noch keine fertige Lerneinheit.**
Das vorhandene Memoryreview bindet „Matrizen multiplizieren“
(`304111dd-426b-520b-a275-3fa37da1b0e0`) und „Stochastische Übergangsmatrizen prüfen“
(`9bf67cce-4c8f-5497-8e64-825b83c6aa40`) als `memory_required` an das breitere
Memoryziel `bd55594a-3e06-5097-8324-4f2f1349fd2a`, Deck `de_gymnasium_math_linalg_core`.
Die Grenze der Lerneinheit muss dessen tatsächliche Kartenpflicht und Erwerbszuordnung lösen.
Zulässig sind eine fachlich passende größere Grenze oder eine geprüfte bestehende
Kartenselektion. Eine neue Aufteilung von Memoryziel/Card-Identitäten braucht eine
ausdrückliche Evidenzmigration. Leere Decks, verkürzter Recall und erfundene
Kartenabschlüsse ersetzen diese Entscheidung nicht.

Zusätzlich sind alle lokalen Verbraucher, vollständige transitive/verborgene
Voraussetzungen, Quellenrollen und die normale Bestehensrubrik zu prüfen.
`coveredGoalIds` nennt zwölf der 15 fachlichen Atome; diese Angabe allein beweist
weder fehlende noch vorhandene unabhängige Anwendung der übrigen Kompetenzen.
Der kleinere Lineargleichungscluster `058bf6de-6c0e-4298-b054-9e8dff6e6a66` bleibt
eine Alternative mit konkreter Prüfungslücke: Die alte PR-Aufgabe verlangt keine
vollständige Unterscheidung von keiner, einer und unendlich vielen Lösungen.
Er ist deshalb ebenfalls kein bereits fertiger Pilot.

## 4. Minimale gemeinsame Architektur

Eine anerkennende Lerneinheit erhält ihre Rolle an einem autoritativen Program-/Placement-
oder Composition-Abschnitt. Stabile View-/Placement-IDs referenzieren bestehende
kanonische Ziele. Direkt zugeordnete Ziele Own(U), aggregierte Ziele T_U, eigene geschützte
Prüfungs-/Kartenziele P_U und normalisierte atomare Anforderungen R werden daraus
erzeugt, einschließlich direkter Einträge, Varianten und `target`-/`prerequisiteOnly`-Rollen.
Es entstehen keine manuell gepflegten `waivableGoalIds`-Listen, zweite Curriculumbäume
oder lernerspezifischen Zulassungs- und Qualifikationsdatensätze.

Der veröffentlichte Vertragskatalog bindet Quellenrevision, aufgelöste Mitgliedschaft,
Graph-/Typbedeutung, Kartenvertrag, Aufgaben und Rubrik unveränderlich zusammen.
Gültige ältere Vertragsbedeutungen bleiben quellenweit verfügbar, auch nach Fach-,
Fokus- oder Lehrplanwechsel. Eine technische Aktivierung bindet konkrete geprüfte
Artefaktrevisionen; sie ist keine zusätzliche fachliche Whitelist.
Ein bloßer Scopebesuch erzeugt weder Vertragsgeltung noch Anerkennung.

Stabile Prüfungsidentitäten tragen stabile Nachweisbedeutung. Ein später größerer
Anspruch darf alte positive Ergebnisse nicht rückwirkend aufwerten.
Für jeden gültigen lokalen Vertrag wird von allen offenen P_U aus vollständig
traversiert, durch gemeisterte Zwischenziele hindurch. Nur gewöhnliche direkt zugeordnete
Own(U)-Ziele außerhalb dieses Bedarfs werden anerkannt. Eltern aggregieren
Kindabschlüsse und eigene Pflichten; die ganze Nachkommenmenge wird nicht erneut
zum Anerkennungsumfang. Eine offene Syntheseprüfung öffnet fertige Kinder nicht,
und ihr Bestehen ersetzt keine Kinderprüfung oder Kartenpflicht. I wird nicht
erneut als Eingabe dieser Ableitung verwendet; Prüfungen und Karten werden niemals implizit bestanden.

Die Runtime trennt den expliziten Ergebnissnapshot M vom abgeleiteten Lesesnapshot
M_eff. Derselbe kohärente Snapshot versorgt Voraussetzungen, erforderliche Arbeit,
Fokusabschluss/-weitung und Gesamtfortschritt. Aktuelle Targets bestimmen den
Nenner, nicht die Existenz früherer globaler Anerkennung.
Export, Zeitstempel und Historie bleiben den tatsächlichen Ergebnissen zugeordnet;
abgeleitete Anerkennung wird nicht als explizite positive Mastery exportiert/importiert.

Statischer Compile-Cache, indizierte atomare Kanten und ein Rückwärtsindex von
Prüfungs-/Karten-IDs auf Verträge vermeiden neue Vollkompilierung je Lernendenaufruf.
Verträge werden nach Artefaktdigest und Semantikrevision vorbereitet; dynamische
Ergebnisse gehören zu genau einer Lernendenrevision samt verlässlichem SRS-Snapshot.
Die Bedarfsrechnung bleibt pro relevantem Vertrag linear in Knoten und Kanten;
eine quadratische Transitivitätsmatrix ist keine Voraussetzung.

Gemeinsame Coach-Skills, Tooltexte und Projektionen verwenden denselben Backendstand.
Alte Aussagen wie „entfallene Vorbereitung ist keine Mastery“ werden ersetzt:
gültige implizite Beherrschung erfüllt die spätere Kompetenzvoraussetzung.
Skillregeln bleiben in den gemeinsamen Coach-Instruktionen; Startnachrichten sind
kein Ersatz für diese Regeln. Provideradapter und Taskautorisierung werden erhalten.

## 5. Drei prüfbare Lieferstufen

| Stufe | Verbindliches Ergebnis | Grenze der Aussage |
| --- | --- | --- |
| 1: Scope- und Vertragsentscheidung | Aktuelles Angebotsinventar und erster echter Umfang mit stabiler Einheitsgrenze, vollständigen T/Q/K, Quellen-/Memorybindung, ID-/Altergebnisentscheidung und unabhängig geprüfter Freigabebedeutung. | Noch keine korrigierte Runtime oder Freigabe des gesamten Mathematikangebots. |
| 2: Erster vollständiger Lernablauf | Gemeinsame Architektur und eine ganze reale Lerneinheit durch Cockpit, Coach, Prüfung, Frontier, globalen Fortschritt und Plan-IST; lokale Vorschau und frühe Owner-Demo, danach normale Deployment- und Host-Abnahme. | Eine tatsächlich verwendbare erste Scheibe; Mathematik ist damit noch nicht abgeschlossen. |
| 3: Fachabschluss Mathematik | Alle aktuell angebotenen Länder-, Stufen-, Dauer-, Kurs- und Kurskombinationsauflösungen mit vollständigen Einheits-/Target-/Q-/K-Mengen, gültigen Quellen und neuen Anerkennungsreviews; bestehende strenge Mathematik-M7-/Releasegates erfüllt. | Keine automatische Anerkennungsfreigabe anderer Fächer oder Aussage über Lernwirksamkeit. |

Die Owner-Demo in Stufe 2 zeigt einen direkten Prüfungsversuch trotz offener
Vorbereitung, normale ausführliche Bewertung, globale Anerkennung, spätere
Voraussetzungserfüllung sowie Fokus-/Lehrplanwechsel ohne Wiederöffnung.
Kartenpflichten bleiben sichtbar. Plan-IST wird mit beiden Zählpräferenzen gezeigt;
die abgeleitete Anerkennung erzeugt keine zusätzliche Tagesleistung.
Erforderliche Backend-/Pluginartefakte werden als konkrete Rolloutkandidaten geplant.
Die reale Hostabnahme folgt der bestehenden Claude-first-Reihenfolge und bleibt
von lokalen SDK-/Browserprüfungen getrennt; dieser Plan rollt nichts aus.
Nach Mathematik folgen Physik, Biologie und Chemie jeweils mit eigener Angebots-,
Quellen-, Karten-, Anwendungs- und Fachabnahme. Gemeinsame Engineänderungen werden
auf Regression geprüft; ein ungeklärter fremder Vertrag blockiert keinen davon
unabhängigen gültigen Mathematikvertrag. Ungelöste Verträge erhalten keine falsche Anerkennung.

## 6. Wiederverwendung und zwingende ID-Migration

Der alte PR wird in kleine nachvollziehbare Änderungen zerlegt. Ein pauschales
Übernehmen seiner mehreren Tausend Dateien oder Evidencearchive ist kein Arbeitsschritt.

| Baustein | Entscheidung und neuer Nachweis |
| --- | --- |
| Indizierter Graph, CanonicalGraphResolver, Cachebudgets, Telemetry | Vorhandene main-Basis verwenden; statische Vertragsauflösung und dauerhaften Katalog ergänzen. |
| Alter Automatic-Evaluator, Full-PC-Konsumenten, alte No-Demand-Erledigung | Semantik ersetzen; keine Mastery-Stopp-, prüfungsfreien Nullarbeits- oder globalen Verbraucherblockaden übernehmen. |
| MemoryGoalClassification, ExamTaskReadiness | Eng übernehmen/anpassen; technische Taskbereitschaft ersetzt kein Anwendungsreview. |
| AssessmentTaskContract, Start-/Owner-/Fingerprint-Prüfungen | Selektiv wiederverwenden; normaler Prüfungsablauf, Sitzungsbesitz und Revisionsschutz müssen erhalten bleiben. |
| Fokus-/Composition-/Kursunionkorrekturen, Backend-Auswahl im Frontend | Isoliert übernehmen; tatsächliche Target-/Supportrollen und Quellenkursberechtigung nativ prüfen. |
| Planstatus, Gesamt-/Periodentrennung, Browser-/Restart-/Providerfixtures | Wiederverwenden, Sollwerte neu ableiten; widersprechende alte Assertions ersetzen. |
| 39 neue Prüfungsziele, Aufgaben/Rubriken, Quellen-/Placementgeneratoren | Material paketweise prüfen; neue lokale Anerkennungsbedeutung unabhängig abnehmen. |
| Semantisches Ledger und QA-Populationsresolver | Erhalten; alle 807 curricularen IDs trotz Ausführungsformänderungen weiter prüfen. |
| Alte PDFs, Inputarchive, Full-PC-/N6-/CI-/M7-Ausgaben | Historisch referenzieren; keine Kopie als neuer Erfolgsbeleg. Bildtransportkorrekturen separat beurteilen. |

**Alle 35 bestehenden IDs mit neuer exam-Rolle benötigen vor Übernahme eine
Einzelentscheidung.** Standard ist: ursprüngliche Kompetenz-ID und vorhandenes M
behalten; die stärkere Anwendungsprüfung erhält eine eigene ID. Ein gewöhnlicher
alter Verständnisnachweis ist kein nachträglicher Prüfungspass. Eine Ausnahme
braucht den vollständigen Nachweis historisch gleicher Prüfungsbedeutung.
`updatedAt`, aktueller Scope und neue per-user Qualifikationsauswahl sind kein Ersatz.
Diese Pflichtliste ist noch keine positive Migrationsentscheidung:

```text
0190e463-51a7-4860-9b35-d875530a85ba  03357e70-2280-532f-b629-5dfa31dc44eb
1c1754b7-2cd3-5635-824d-ce93f7b99514  1cefd1ad-a250-5a03-8de7-04bdaf465ad8
2041f4ec-620d-4a20-9922-6ebf16f8f8fa  27b63e2e-6a34-483e-8e5a-fe0f49670d1d
315093d4-515a-542c-b776-d72a12763d1a  3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4
455ef29a-7194-5c5a-b832-1c27fcbf2516  5743b8f9-86cb-4e24-8859-351708d070ab
58f613da-03be-5c6a-90a9-ff0958aa7849  58fda9b4-4336-5594-99ce-722c4a453372
5b54f272-f588-5009-8b42-eb15f846d3e2  5ba7b5aa-7ad5-5605-bcb5-f4aa4b4c6b2d
5dbf149c-d335-552c-a918-768a12e09201  5f90df42-8a71-534d-b995-b8f7dcaf1661
613871f6-ccb2-51fe-aba2-0dd17b86a89e  619f29f5-7f44-5654-9692-01b250997d52
6a4716bd-8038-46bb-b647-0db4a254fee7  6c122f0e-8017-4ec1-91d6-0d7a1c75f8c9
7bb3c312-f714-55e6-a31f-f31605a93760  7d9c565c-8df1-40ca-b3c6-2d4ec51e9140
803d910d-96d1-5118-b9ca-29e93d0da76d  8e18154d-41d6-592e-ba98-537edad338e8
97b03cce-6641-5ec9-a6d2-f31838e2dbb9  ae3483e3-4712-56a1-a881-2e1f8a1a8df9
bd3576b8-f4e5-542a-a8a2-74524d9cee21  bfc2bf06-9b37-4912-a8eb-25fb5d489d72
d3c42193-f1b7-5c6d-a991-bf034d99359f  eb112b6f-4cc4-58af-975a-f1ea61b727f0
edaf0bb4-e12e-5a6c-b484-91124ba209f3  f1eee698-04c6-5d60-bcc6-a3c67129eea2
fa0b6b69-ce54-4711-90e6-26f27249cd71  fc34449a-fbf4-574c-884f-ecdf48b42d2e
fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc
```

## 7. Struktur- und Inhaltsprüfung ohne kombinatorische Blindarbeit

Zuerst prüfen Maschinen Referenzen, Identitäten, alle Zyklusformen, vererbte und
expandierte Anforderungen, transitive Minimalität und eindeutige Erwerbszuordnung.
Jede direkt erworbene gewöhnliche Fachkompetenz braucht einen passenden eigenen
Prüfungsverbraucher. Reine Aggregate brauchen keine zusätzliche Prüfung;
Eltern dürfen eine Syntheseprüfung über bereits in Kindern erworbene Kompetenzen
haben. Prüfe außerdem die Blockreihenfolge, wenn Einheiten geschlossen nacheinander
durchlaufen werden sollen.
Karten allein sind kein Anwendungsbeweis; externe Unterstützung wird geprüft,
aber weder lokal anerkannt noch zum Fortschrittsnenner hinzugefügt.

Für ein gewöhnliches Ziel a wird die Freigabemenge erzeugt:
`D_U(a) = {p ∈ P_U | p R⁺ a}`. Ziele mit gleicher Menge werden gemeinsam geprüft.
Jede verschiedene Freigabemenge braucht ein begründetes Aufgaben-/Rubrikreview;
ein blindes Durchprobieren aller 2^Prüfungsanzahl-Teilmengen ist nicht erforderlich.
Maßgeblich sind die tatsächlichen freigebenden normalen Bestehenskombinationen
einschließlich zulässiger Aufgabenvarianten. Für jede wesentliche anerkannte
Kompetenz lautet der Gegenversuch: Kann die Person ohne diese Kompetenz bestehen
und sie dennoch anerkannt bekommen? Wenn ja, scheitert der Vertrag; Aufgabe,
normale Rubrik, Anerkennungsanspruch oder Einheitsgrenze muss korrigiert werden.
Punkte anderer Teile dürfen einen vollständig fehlenden wesentlichen Nachweis
nicht verdecken. Reviewentscheidungen binden konkrete Inhaltsrevisionen.
Gleiche aufgelöste Vertragsbedeutungen dürfen ein Inhaltsreview teilen; jede
angebotene Projektion bleibt ein eigener maschineller Validierungsfall.
Geänderte Ziele, Kanten oder Aufgaben werden nicht durch bloß erneuerte Fingerprints
als geprüft behandelt. Alle anwendbaren strengen D/P/A/M/V- und übrigen QA-Gates
bleiben bestehen; Orientierung belegt weder eine erfundene Kompetenz noch Interaktion.

## 8. Test-, Migrations- und Rolloutabnahme

| Prüfbereich | Erforderliche Fälle |
| --- | --- |
| Reine Semantik | Q→B→A bei leerem M, nur B und nur Q; gemeinsame lokale Q/S-Verbraucher; spätere externe Prüfung; keine Wiederöffnung gültig anerkannter A/B. |
| Rekursive Einheiten | Eindeutige direkte Erwerbszuordnung; vollständige Pflichtkinder und eigene Q/K; reines Aggregat ohne Zusatzprüfung; offene Elternprüfung erhält Kindanerkennung, bestandene Elternprüfung ersetzt keine Kindpflicht. |
| Struktur/Fehler | Clusterexpansion, Vererbung, mehrere Eltern, minimale Kanten; ungedeckte gewöhnliche Endpunkte, M=0, fehlende Referenzen und Zyklen vergeben keine Anerkennung. |
| Fokus/Lehrplan | Transitive Hülle vor Fokusbeschränkung; gemeisterte/außerhalb liegende Zwischenziele verbergen keine in-focus Pflicht; normal ignoriert vollständig außerhalb liegende gültige Anforderungen, strict prüft global; ungültige Level-2-Referenzen bleiben Fehler. |
| Prüfung/Karten | Direkter Prüfungszugriff mit normaler Auth-/Owner-/Revisionsprüfung; normale Bewertung; Prüfungen/Karten ausschließlich explizit; Verified Recall, Fälligkeit und fehlgeschlagener Retest korrekt unterscheiden. |
| Dauerhafte Ergebnisse | Gültiger alter Pass zählt ohne zweiten Pass; erweiterte/mehrdeutige alte Bedeutung liefert keine neue Anerkennung; Fokus-/Fach-/Lehrplanwechsel und Neustart erhalten gültige Verträge; keine neue Masteryzeile für alte Waiver. |
| Fortschritt/Plan | Gesamtfortschritt und Voraussetzungen verwenden M_eff; „Nur explizit erreichte Lernziele zählen“ bleibt reine Plan-IST-Präferenz zwischen M und M_eff; Tages-/Wochenkontingent immer explizite Ereignisse. |
| Native Angebote/UX | Tatsächliche angebotene Länder-/Stufen-/Dauer-/Kursauflösungen, Kursunionen und Zielrollen; vollständige Prüfungsentdeckung trotz Paging; deduplizierte Zähler, unveränderte Exportattribution und freiwillige Wiederholung. |
| Betrieb/Performance | Ein kohärenter Snapshot, SRS-/Lernendenisolation, statische Cachebudgets, Kaltstart/Restart und passende Lastmessung; kein kalter Gesamtcompile je Request und keine fachfremde Fehlersperre. |

Alte falsche Waiver werden nicht in M materialisiert. Im Fehlerfall bleiben
verlässliche explizite Ergebnisse erhalten, neue Anerkennung unterbleibt und
normale sichere Lern-/Prüfungswege bleiben erreichbar. Migrationen werden mit
echten Bestandsfällen und verständlicher Erklärung geprüft. Bereits veröffentlichte
gültige Verträge bleiben auch bei einem Rollback rekonstruierbar; ihre Entfernung
ist kein technischer Rücksetzschritt. Ungültige Quellergebnisse oder Verträge
zu korrigieren ist ein gesonderter ausdrücklicher Integritätsvorgang.

## 9. Arbeitsweise und überprüfbarer Fortschritt

Die spätere Umsetzung startet in einem neuen Branch ab dem dann aktuellen main.
PR #79 und der lokale 4f-Checkpoint bleiben Referenzen; ein Gesamtmerge ist ausgeschlossen.
Implementierung und laufende Fachkorrekturen erfolgen mit **Sol Ultra**;
grundlegende Analyse und unabhängige fachliche/semantische Abnahme mit **Astra**.
Jeder Schritt hat einen kleinen reviewbaren Commit/PR, konkrete Ziel- und Vertrags-IDs,
offene Befunde und seinen nächsten Abnahmeschritt. Arbeit wird regelmäßig gesichert;
mehrtägige ungesicherte Gesamtdeltas und eine zweite fachübergreifende Großaufgabe
werden vermieden. Die erste normale Owner-Demo erfolgt in Stufe 2.

Fortschritt wird an fixierten Einheits-, Target-, Freigabemengen- und Angebots-IDs
berichtet: entscheidungsreif, umgesetzt, maschinell geprüft, inhaltlich unabhängig
abgenommen, lokal demonstriert und gegebenenfalls tatsächlich ausgerollt.
Nenneränderungen werden erklärt; gefühlte Prozentstände und unbelegte Personentage
werden nicht angegeben. Historische Nachweise nennen ihren damaligen SHA.
Ein frischer CI-Erfolg wird erst nach terminalem Lauf am konkreten neuen Commit
behauptet. Lokale Tests, Remote-CI, Deployment und echte Coach-Host-Abnahme bleiben
getrennte Nachweise. Dieser Plan führt selbst keine dieser Operationen aus.
