# Mathematik: Ableitungsordnung, Krümmung und Sattelpunkte

Stand: 13. November 2026. Gezielte fachliche Präzisierung dreier bestehender
Lernziele; keine neue Landschaft, Quellenfreigabe, menschliche Abnahme oder
beobachtete Lernleistung.

## Fachlicher und curricularer Umfang

Die drei Ziele `350fc8b1…`, `b3604df4…` und `d5feba00…` liegen bereits im
kanonischen E-Phasen-Cluster `38234acf-d0f8-4ff9-a6f8-852d1596a692`,
„Ableitungen zur Funktionsuntersuchung und Optimierung nutzen“. Die bestehenden
Kompositionssichten führen diesen Bereich über seine kanonischen Vorfahren.
Ziel-IDs, Titel, `contains`, Geltung, Platzierungen und View-Bytes bleiben
unverändert. Erste und zweite Ableitung waren im Zielbestand ausdrücklich
benannt. Das bestehende P-Profil prüfte bereits dritte Ableitungen sowie die
Gegenbeispiele x³, x⁴ und x⁵; die Präzisierung macht deren Zusammenhang im
Zieltext und im eigenständigen Leistungsnachweis sichtbar.

Der unmittelbar gelesene amtliche Text ist
`curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`,
E.3 „Anwendungen des Ableitungsbegriffs“, gedruckte S. 32. Er verlangt die
Untersuchung ganzrationaler Funktionen, Monotonie und Krümmung sowie notwendige
und hinreichende Extrem- und Wendestellenkriterien. Die anschauliche Begründung
nennt ausdrücklich Ableitungsgraphen erster und zweiter Ordnung. Die
strukturierte Extraktion steht daneben unter
`source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json`,
Passage `he-math-sekii:E.3`. Eine wörtliche amtliche Pflicht zur dritten
Ableitung oder zum Wort „Sattelpunkt“ wird daraus **nicht** behauptet. Die
explizite dritte Ableitung ist eine passende fachliche Operationalisierung des
bereits vorhandenen Kriterienziels, nicht eine neu erfundene amtliche Forderung.
Andere Länderzuordnungen und Quellenentscheidungen werden nicht umgeschrieben.

„Ganzrational“ bezeichnet Polynome. Potenzfunktionen mit negativen Exponenten,
etwa 1/x, sind keine Polynome; allgemeine gebrochenrationale Funktionen und
Exponentialfunktionen gehören nicht als automatische Einführungspflicht in diesen frühen
Polynomkorridor. Deshalb ersetzt ausschließlich `350fc8b1…` seine unmittelbare
Anforderung `858113c5…` (breites elementares Ableiten einschließlich einfacher
Exponentialfunktionen) durch `623cd47f…` (ganzrationale Funktionen ableiten).
Der breite Zieltext von `858113c5…` und seine Quellenbindungen bleiben erhalten.
Die Kette `350fc8b1… → b3604df4… → d5feba00…` wird in Lernrichtung fachlich
sichtbar: erst erste, dann zweite, dann dritte Ableitung.

Das Vorzeichen von f″ wird bei wachsendem x gelesen: positive Werte bedeuten
zunehmende Steigung beziehungsweise Linkskrümmung, negative Werte abnehmende
Steigung beziehungsweise Rechtskrümmung. Ein Sattel-/Terrassenpunkt ist ein
Wendepunkt mit zusätzlichem f′=0. Die dritte Ableitung ist die Änderungsrate von
f″, nicht allgemein die Ableitung geometrischer Krümmung. Für dreimal stetig
differenzierbare Funktionen an inneren Stellen ist f″=0 zusammen mit f‴≠0 ein
hinreichender Wendepunkttest. x⁵ belegt, dass f‴≠0 dafür nicht notwendig ist.

Die P-Anwendungsfälle zeigen die praktische Bedeutung aller drei Ordnungen,
ohne zusätzliches Physikwissen vorauszusetzen. Beim Volumenmodell
V(t)=10+6t²−t³ Litern mit t in Minuten ist V′ die Zuflussrate, V″ deren lokale
Änderungsrate und V‴=−6 L/min³ die lokale Änderungsrate von V″. Das Profil
unterscheidet diese Werte, ihre Einheiten und die Ausgangsgröße ausdrücklich.

## Tatsächliche Reviews und Bindungen

`reviewed-binding-decisions.json` enthält die drei einzeln gelesenen finalen
Ziele sowie neue fachliche A/M-Begründungen. Die Atomicity-Entscheidung
bleibt jeweils `atomic`, die Semantic-kind-Entscheidung `curricularAtomic`. Für die ersten
beiden Ziele bleibt ein eigenes Memory-Deck unnötig; für das Kriterienziel
bleibt der enge Abrufanteil im vorhandenen Analysis-Deck. Dessen tatsächliche
DE/EN-Karten `math_analysis_c08`, `c09`, `c10` wurden gelesen. Ihre Bytes und
bestehenden Kartenreviews bleiben unverändert. Der Prüfkontext ist eine
hinreichend glatte Funktion an einer inneren Stelle; die Karten ersetzen weder
die Gegenbeispiele noch die unabhängige Anwendung.

`materialize-reviewed-bindings.mts` verbindet ausschließlich diese tatsächlichen
Einzelreviews mit ihren exakt gespeicherten aktuellen Zieleingaben. Die drei
V-QA-Metadaten nennen ausdrücklich die aktuelle, vom koordinierenden Root
berichtete tatsächliche Sichtprüfung der unveränderten Bilder. Der
Qualitätsagent behauptet keine zusätzliche eigene Bildsichtprüfung.
Die Bilder illustrieren jeweils einen zulässigen Teil des Zielumfangs; das
x⁵-Gegenbeispiel und die vollständige praktische Dritt-Ableitungsdeutung werden
nicht als bereits vorhandener Bildinhalt ausgegeben. Native P-Nachfolger
binden die aktuellen Bildbytes und bleiben `needs_human_review` / `ai_candidate`,
E1/G1.

`retained-source-pins.json` und `materialize-retained.mjs` erhalten die neun
unbetroffenen P-Zeilen bytegenau. Das alte vollständige Paket bleibt als
historische Evidenz erhalten. `activation-plan.json` beschreibt die explizite
P-Eigentumsersetzung und die drei zielbezogenen D-Nachfolger; der Plan selbst
aktiviert oder genehmigt nichts. D verwendet den bestehenden nativen
Doppelrundenprozess mit zwei echten blinden Runden und anschließender
informierter Synthese. Aktuelle Ergebnisdateien sind dafür erforderlich.

## Graph, V9 und Dauerlayout

`current-graph-check.receipt.json` dokumentiert die aktuelle Prüfung aller
1.255 Mathematikziele und 1.566 authored `requires`-Kanten: alle Referenzen sind
lokal aufgelöst, beide Endpunkte atomar, keine Zyklen und keine transitiv
redundanten direkten Anforderungen. Die neue Kante erzeugt keinen Zyklus;
die beiden direkten Anforderungen von `350fc8b1…` sind untereinander nicht
erreichbar. Die neue Voraussetzungskette enthält das breite Ziel `858113c5…`
nicht mehr. Einziger unmittelbarer abhängiger Knoten ist `b3604df4…`, das im
aktuellen D-Paket enthalten ist. Dies ist eine begrenzte aktuelle Graphprüfung,
kein vollständiger registrierter G17-/CQR-Meilensteinlauf.

Die unveränderliche V9-Registry und ihr eingefrorener Parent bleiben bytegleich.
Jedes der drei geänderten Ziele verlässt seinen etwaigen historischen Transfer
und muss die strikten aktuellen Reviews bestehen. Andere Ziele behalten ihre
Transfers. Die eigenen Canonical-Contexts der übrigen Ziele ändern sich nicht;
Ziel-IDs und Titel in abhängigen Seitenreferenzen bleiben gleich.

Der Dauerplan war bereits nach `64124c1ec4` veraltet: sein letzter gepinnter
Input ist `64124c1ec4^`, dessen learning-unit-projizierter Hash exakt dem
bisherigen Pin `4030a4a7…` entspricht. Seitdem änderten sich zuerst ausschließlich
zwei bereits geprüfte Bild-Ressourcenverweise und anschließend die drei hier
geprüften Texte/Alttexte sowie eine Voraussetzung. `review-duration-binding.mts`
vergleicht die kompletten projizierten Dokumente und erlaubt nur diese einzeln
aufgeführten Deltas; alle anderen Dokument- und Zielfelder bleiben gleich.
`duration-binding.receipt.json` bindet die vollständigen Änderungen und den
tatsächlichen regulären Generatorlauf mit Exit 0: alle 18 HE/RP/SH-G8/G9-Views
bleiben bytegleich. Nur der kanonische Input-Pin des aktiven Dauerplans wird
fortgeschrieben. Historische Adjudikationen und Quellenpins bleiben unverändert.

Lokale native Prüfungen und diese technische Eingangsbindung sind keine neue
menschliche Quellen- oder Layoutfreigabe. Zentrale D/P/A/M/V- und CQR-Gates sowie
frische Remote-CI sind getrennte Nachweise; ihre Ausführung wird hier nicht
behauptet.

## Tatsächlicher Abschluss der lokalen D/P-Aktivierung

Die beiden echten blinden D-Runden sind abgeschlossen und nativ validiert.
Beide empfehlen für alle drei aktuellen Texte `keep` und für das im D-Paket
nicht mitgelieferte V2-Profil `create`. Ihre unterschiedlichen Evidence- und
Rationale-Fassungen bleiben im nativen Dual-Summary als drei
synthesepflichtige Unterschiede erhalten. Die informierte Synthese liest beide
Fassungen und wählt für `350fc8b1…` die zweite, für `b3604df4…` und `d5feba00…`
die erste Runde mit jeweils konkreter fachlicher Begründung. Jeder native
Nachfolger bewahrt einen entsprechenden Dissent-Eintrag; es gibt keine
menschliche Attestation. Beide Runden nennen dieselbe Modellidentität; die
native `report_only`-Diversitätspolitik meldet das ausdrücklich und behauptet
keine Anbieter- oder Modelldiversität.

Die nativen Schritte `summarize`, `quality:goal-description-rollout-manifest`,
`quality:goal-description-rollout-resolutions` und `finalize` sind tatsächlich
bestanden: drei strikte aktuelle Resolutionen, keine zurückgestellten Ziele.
Die nachfolgende Aktivierung ist in `activation.receipt.json` dokumentiert:
exakt drei zielbezogene D-Supersessions sowie die vorbereitete P-Ersetzung mit
neun unverändert erhaltenen Zeilen und drei aktuellen Kandidaten. Der gesamte
aktive P-Besitz wurde dabei auf doppelte Goal-Claims geprüft. Das ausführbare
`activate-reviewed-successors.mjs` verlangt die tatsächlichen finalen nativen
Resolutionen und überprüft die historischen P-Zeilen vor der Registryänderung.
Der nachfolgende vollständige zentrale Status und seine Gates bleiben ein
eigenständiger Lauf des koordinierenden Roots.

## Späterer Wissenskontext-Nachtrag

Nach Einführung von AGENTS.md §2.5 durch `27a0b68895` wurde ein eigener
[Wissenskontext-Nachtrag](knowledge-context-addendum-27a0/README.md) mit
tatsächlichen CLI-Snapshots und neuer Inhaltsprüfung erstellt. Der Unterschied
betrifft **13 gewöhnliche Ziele und ein Prüfungsziel**, obwohl nur b360 ein
unmittelbarer abhängiger Knoten der frühen Kantenänderung ist. Die drei frühen
Inhalte bleiben für den geänderten Ableitungsanteil passend; beim späten
Q4-Ziel 08b wurde hingegen ein echter verlorener Exponentialableitungsbedarf
gefunden und eine gezielte direkte Voraussetzung unabhängig begründet.
Dessen aktueller Nachfolger und der zweite Duration-Receipt werden im
separaten Paket `../late-function-class-prerequisite-current-v1/` geführt.
Diese Ergänzung erhält die früheren tatsächlichen D-Runden und den ersten
Duration-Receipt als unveränderte Prüfstufen; sie behauptet keine vollständige
Suffizienz des Graphen oder rückwirkende Verwendung des neuen Tools.
