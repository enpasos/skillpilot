# Zustandsvertiefung und 41er-Prüfung: vollständige Reparaturgrenzen

**Die bestehende 41er-Prüfungsidentität lässt sich erhalten und ehrlich phasenübergreifend platzieren. Eine reine Placement-/Titelkorrektur ist aber noch keine vollständige Reparatur und keine M6-Freigabe.** Sie lässt die fehlenden Prüfungsmaterialien, den GK/LK-Konflikt und die unbelegte HE-Quellenzuordnung offen. Ein nichtamtlicher Fachquellenbeleg kann nach dem heutigen Vertrag diese letzte Lücke nicht einfach ersetzen.

Aktuelle geprüfte Quelle: `DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json`, SHA256 `93a653b110949ff410a73bd750b2a605a9ab0329fe1cd157f016869d848e1f7e`. Alle folgenden Änderungen sind ausschließlich eine lesend gerechnete Hypothese. Der [vollständige Beleg](informatics-875-crossphase-repair-analysis-2026-11-06.json) bindet die Originalgoals, alle 41 DE-/vorhandenen EN-Kompetenztexte, elf genaue Feldoperationen, acht Viewhypothesen, sämtliche 35 Targetvergleiche, sichtbare Bäume, 21 Katalogquellen, Nachfrage-/Coveragefolgen und native QA-Prüfungen. Keine Livequelle, kein Ledger und kein Lernzustand wurde geändert. Die parallelen gewöhnlichen Informatik-Holds gehören nicht zu diesem Vorschlag.

## 1. Fachlicher Kern ohne neue Runtime oder Einheit

`875cb53c-b48d-5b2b-8cb0-e20f27534f16` verlangt weiterhin komplexere Zustandsautomaten mit Hierarchie/Parallelität. Die unveränderte einfache Modellierungs-/Simulationskompetenz `7ad8caf0-3a31-56f1-bee1-574c01b0c156` ist die passende Vorbereitung. Komplexe ER-Kardinalitäten `1eb09d02…` sind dafür keine notwendige Grundlage. Die historische amtliche Prüfung ist separat [gebunden](informatics-state-automata-official-placement-review-2026-11-06.md): HE Q2.1 behandelt ER-/Relationenmodelle und Normalisierung; Q3.2 behandelt endliche Automaten. Hierarchie/Parallelität ist dort nicht als eigene verpflichtende LK-Leistung ausgewiesen. Eine didaktische Reihenfolge nach einfacher Automatenmodellierung ist plausibel; sie erzeugt keine amtliche Q3-Exact-Abdeckung.

Die minimale **Placementhypothese** lautet:

1. Bei `875cb53c…` ausschließlich `requires=[7ad8caf0…]` und `dimensionTags.phase="Q3"`; ID, DE-/EN-Kompetenzbeschreibung, LK-Tag und Gewicht erhalten.
2. `875cb53c…` aus `900065ef…` („Q2.1 ER- und Relationenmodell“) herausnehmen und direkt unter dem bestehenden kanonischen Root einordnen. **Nicht** in den vorhandenen Q3.2-Cluster `31026f4a…` aufnehmen: Dessen Verbraucher würden sonst zusätzlich Hierarchie/Parallelität verlangen. Es wird kein neuer Cluster und keine Einheit angelegt.
3. `0df1bedd-5fda-5b3b-a959-c9610237bb3e` aus `010651ba…` („Übungen Q2“) herausnehmen und ebenfalls direkt unter dem vorhandenen Root einordnen. Die beiden übrigen Datenbankübungen bleiben dort. Die Prüfung bekommt den beschreibenden Titel „Datenbank- und Zustandsmodelle vernetzt anwenden“, eine explizite Beschreibung ihres bestehenden 41-Kompetenzen-Umfangs und `phase` sowie `dimensionTags.phase="Q3"`. Q3 ist hier der spätere didaktische Bearbeitungszeitpunkt der phasenübergreifenden Prüfung, kein behaupteter amtlicher Themenblock. Alle 41 bestehenden Coverage-IDs bleiben in derselben Reihenfolge erhalten.
4. In den sechs betroffenen Länder-Views BY/HE/MV/SH/ST/TH wird die bestehende 875-Referenz aus der irreführenden Q2-Gruppe herausgenommen und in einer ausdrücklich didaktischen Vertiefungsanzeige platziert. Die kanonische LK-Sicht erhält dieselbe direkte Referenz. Die Prüfung bleibt in BY/HE und den beiden kanonischen Kurs-Views über eine explizite Referenz sichtbar. Ein View-Strukturknoten „Vertiefung und phasenübergreifende Anwendung“ ist reine Navigation, keine neue LearningUnit und keine amtliche Quellenbehauptung.

Die elf Datenfelder und acht Viewdateien sind im JSON vollständig als Vorher/Nachher-Hypothese enthalten. Die originale `examData` bleibt in dieser isolierten Rechnung absichtlich unverändert und ist damit **weiterhin nicht freigabefähig**. Ebenso bleiben GK/LK-Tags und Quellenbelege hier zunächst unverändert, damit ihr verbleibender Fehler sichtbar bleibt. Diese Operationen sind kein direkt anwendbares Freigabemanifest.

## 2. Was die echte Projektion und globale Nachfrage zeigen

Die unveränderten Produktionsfunktionen für Rollen, Filter, Composition-Compilation und sichtbare Bäume wurden auf allen **19 Views / 35 Kontexten** ausgeführt. Die reine Placementhypothese verändert **keine einzige Personal-Curriculum-Targetmenge**; alle Compilerläufe haben vorher und nachher null Findings. Die aktuelle und hypothetische Applicability-Kompilierung laufen jeweils mit null Fehlern und null Warnungen; alle abgeleiteten Ländermengen bleiben gleich. Sieben Reportzeilen ändern Begründungsevidence oder Titel. Diese grünen Strukturprüfungen bestätigen die alten Quellenurteile nicht neu.

Die vollständige Goal- und atomare Nachfrage wurde über die tatsächlichen 21 kanonischen Katalogdateien gerechnet:

- zwei Goalquellen ändern ihre transitive Goal-Nachfrage: insgesamt fünf Paare entfallen, zwei kommen hinzu;
- acht atomare Quellen ändern ihre atomare Nachfrage: insgesamt acht Paare entfallen, zwei kommen hinzu;
- keine fremden Fächer ändern ihre Nachfrage; die drei bereits vorhandenen fremden Zykluskomponenten bleiben unverändert und sind nicht freigegeben.

`875cb53c…` verliert die ER-Kardinalitäts-/ER-Modellbasis und erhält die einfache Automatenkompetenz. Die 41er-Prüfung erhält dadurch ebenfalls diese sachgerechte Vorbereitung, behält aber weiterhin alle 41 bisherigen direkten Kompetenzanforderungen. Die Entfernung ihrer alten geerbten Clusterreferenzen verändert den 41er-Umfang nicht.

Genau sechs weitere atomare Verbraucher verlieren ausschließlich die bisher über Q2.1 mitgeerbte Hierarchie-/Parallelitätsvorbereitung:

| Bestehende Prüfung | ID | Inhaltliche Grenze des Entzugs |
| --- | --- | --- |
| Bibliotheksdatenbank zwischen ER-Modell und SQL | `269a561b-f12e-57b2-9b05-e20f58c9dcf6` | ER-Modell, Join/Gruppierung und Relationenalgebra erfordern keine hierarchischen/parallelen Zustandsautomaten. |
| Festivaldatenbank zwischen Schema und Anfrage | `ca2ff162-c71f-500f-8ce7-321ab2cf3f1f` | Modell, Schlüssel, Abfragen und Algebra benötigen keine zusätzliche Zustandsmodellvertiefung. |
| GK B1 Fahrradverleih | `b86e8ab3-2c12-5b6b-b515-1e7d457c99c2` | Die vorhandenen fünf Aufgaben verlangen Datenmodell-/Schema-/Abfrageanalyse und Modellqualität. |
| LK B Klinische Studiendaten | `d13e297f-505d-576a-9a86-11ab4d7896c9` | Schwache/starke Entitäten, Schlüssel, Unterabfragen und Algebra sind relationaler Stoff; keine Statechart-Aufgabe. |
| LK C1 Konzertticketing | `d9892508-97b5-529e-9b9e-c4889fba2166` | Normalisierung, Joins/Aggregation und Kosten-/Wartbarkeitsurteil enthalten keinen Hierarchie-/Parallelitätsauftrag. |
| LK C2 Lieferkettenanalyse | `4e0668e3-edca-57f4-b258-df87f23d2b4e` | ER-/Schema-/SQL-/Algebraanalyse trägt die vorhandene Beschreibung ohne Zustandsautomaten. |

Die ganzen Goal-/Aufgaben-/Lösungspayloads sind im globalen Beleg gebunden. Die vorhandenen Aufgaben benennen vielfach Materialien, liefern sie jedoch nicht. Die obigen Urteile billigen nur den begrenzten Vorbereitungsentzug; sie qualifizieren weder diese Aufgaben noch alle übrigen, teilweise breiten Clusteranforderungen.

**Zwei effektive Coverage-Änderungen sind ausdrücklich offen auszuweisen:** `269a561b…` und `ca2ff162…` deklarieren die drei Cluster `900065ef…`, `52aea365…`, `cd954d92…` als Coverage. Deren atomare Vereinigung schrumpft durch die Contains-Korrektur von jeweils **23 auf 22**: genau `875cb53c…` entfällt, nichts kommt hinzu. Es wäre falsch, allein wegen unveränderter `coveredGoalIds`-Arrays unveränderte Coverage zu behaupten. Diese bisher unbelegte zusätzliche Statechart-Abdeckung muss in einem eigenen aktuellen Inhaltsreview ausdrücklich berichtigt werden. Sie darf nicht nachträglich mit einem fingierten Aufgabenbeleg versehen werden. Die ursprüngliche `0df1bedd…`-Prüfung behält dagegen exakt ihre 41 atomaren IDs.

## 3. Stable ID, bestehende Ergebnisse und GK/LK

Eine Titel-/Phasen-/Placementkorrektur bei unverändertem 41er-Kompetenzversprechen benötigt keine neue ID für `0df1bedd…`. Ein tatsächlich gültiger vollständiger 41er-Nachweis bleibt derselbe Nachweis. Bestehende explizite Ergebnisse, Originalzeitstempel und Praxisquittungen werden nicht umgeschrieben oder zurückgenommen. Neue Vorbereitung und geänderte Fokusstruktur ziehen keine Mastery zurück. Alte konkrete Praxis-/Reviewartefakte bleiben an ihre damaligen Aufgabenbytes gebunden.

Es ist aber **nicht belegt**, dass der alte generische 20/12-Auftrag tatsächlich alle 41 Kompetenzen geprüft hat. Weder `reviewStatus="released"` noch die Coverage-Liste macht daraus rückwirkend eine qualifizierte 41/41-Prüfung. Der Vorschlag bewahrt vorhandene Ergebnisse; er zertifiziert unbekannte historische Versuche nicht neu und führt keine Recognition-Logik ein.

Der native Scopebefund ist genau derselbe in HE, BY und der kanonischen Sicht:

| Kurs | Heutige 41er-Prüfung als Target | Von den 41 Kompetenzzielen selbst Target |
| --- | --- | --- |
| GK, jeweils drei Kontexte | ja | **22**, weitere **19** liegen außerhalb des GK-Targets |
| LK, jeweils drei Kontexte | ja | **41** |
| Weitere 29 Kontexte | nein | kein neuer Prüfungstarget vorgesehen |

Ein LK-Tag allein würde genau drei GK-Targets entfernen und wäre daher keine vollständige stille Lösung. Der bestehende globale Ergebnisvertrag erlaubt auch keine GK-22/22- und LK-41/41-Bedeutung unter derselben ID. Die enge vollständige Richtung ist entsprechend der getrennt geprüften Q4-Lösung: alte ID für den vollen LK-Umfang erhalten; ein **eigenständiges GK-Assessment für exakt die 22 heutigen GK-Kompetenzen** mit anderer stabiler UUID und eigenem Ergebnis erstellen; in genau HE-GK, BY-GK und kanonischem GK die alte ungeeignete Prüfung ausdrücklich durch diese neue Prüfung ersetzen. Die 41er-Coverage wird dabei nicht verkleinert, gewöhnliche Ziele werden nicht zerlegt und kein alter Pass auf die neue ID übertragen. Alle 22 IDs und Texte stehen im JSON. Diese Alternative benötigt noch konkrete GK-Aufgaben/Rubrik, UUID-Kollisionsprüfung und einen erneuten gemeinsamen Target-/Nachfragereplay; sie ist hier nicht erfunden freigegeben.

Die unmodifizierte reine Placementhypothese erhält Personal-Curriculum-Targets, ändert jedoch bewusst den Inhalt des Q2.1-Fokus und des „Übungen Q2“-Fokus. Die Gesamtziele sind damit nicht gelöscht: Sie liegen in der zusätzlichen Anzeige und bleiben global identisch. Vor Anwendung sind bestehende Fokus-/Plan-Captures, aktive Ziele, sichtbare Elternpfade und Completiondarstellung gegen diese Änderung zu prüfen. Kein automatischer Statewrite folgt aus der Datenkorrektur.

## 4. Bestehender Source-Vertrag: kein nichtamtlicher Ersatzkanal

Die heutige Norm [CQR-000 und CQR-003](../../qa-ci/curriculum-quality-maturity-and-routes.md) verlangt für eine Bundesland-Sicht einen direkten oder akzeptierten indirekten **Lehrplanbeleg genau dieses Landes** und umgekehrt vollständige Abdeckung registrierter Source-Atome. Sie erlaubt einen ausdrücklich reviewten Requires-Surrogatbeleg für logische Vorbereitungslücken, ausdrücklich nicht für neue Themen. Override, Child-Union und automatische Requires-Closure sind keine Quellenbelege.

Folgende vorhandenen Mechanismen wurden tatsächlich geprüft:

| Mechanismus | Vorhandene Funktion | Grenze für das eigene 875-Supplement |
| --- | --- | --- |
| `sourceDocument(s)` mit `official:false` | HE-Wirtschaft und HE-PoWi führen einen nichtamtlichen **strukturierten KC-Snapshot** neben dem tatsächlichen amtlichen PDF auf. | Das dokumentiert eine technische Arbeits-/Extraktionsquelle; es begründet keinen zusätzlichen Lehrplaninhalt durch ein unabhängiges Fachbuch. |
| Package-Rolle `supplemental-source` | Der geschlossene `official-source-index` unterscheidet amtliches Curriculum und weitere amtliche Dokumentrollen. Das vorhandene Mathematikprofil klassifiziert etwa amtliche Umsetzungshilfen und Einschränkungen gesondert. | Das Schema verlangt auch hier **`official: true`**. Die ausgeführte Draft-2020-12-Kontrolle weist dasselbe synthetische Supplemental-Dokument mit `official:false` exakt bei `/official` zurück. Zudem ist das Mathematikprofil keine allgemeine Informatikautorisierung. |
| GoalBook-Originalquellen | `goalBookOriginalSources.ts:128` akzeptiert eine Dokumentquelle nur mit `official===true`; der vorhandene Negativtest verweigert einen erfundenen amtlichen Beleg. | Eine korrekte nichtamtliche Quelle kann nicht als amtlicher Originalbeleg angezeigt oder exportiert werden. |
| CQR-Provenance/Mapping | Der aktuelle Compiler zählt die gebundenen Mapping-/Provenance-Kanten. | Es gibt keinen getrennten geprüften Nichtamtlich-Supplementkanal, der ein gewöhnliches zusätzliches HE-Target nach eigener Fachquellenprüfung von CQR003s Lehrplanpassung ausnimmt. Technisch durchgehende Metadaten sind keine inhaltliche Autorisierung. |
| CQR-000 URL-Prüfung | `sourceOriginalUrlIssues` kontrolliert tatsächlich die verwendbare URL; sie prüft nicht selbst die Wahrheit der amtlichen Herkunft. | Dass eine frei eingetragene URL diese Prüfung passieren könnte, ist keine normative Erlaubnis, eine Fachquelle zum amtlichen Lehrplanbeleg zu erklären. |

**Ergebnis:** Eine echte Fachquelle kann den sachlichen Inhalt von Hierarchie/Parallelität belegen und als solche ehrlich dokumentiert werden. Unter dem bestehenden Vertrag reicht sie allein nicht für die behauptete curriculare HE-Abdeckung eines zusätzlichen Ordinary-Targets. „Supplemental“ ist kein vorhandener pauschaler Ausnahmeschalter. Ein neuer Override oder Surrogat würde diese semantische Grenze nicht lösen.

Die aktive HE-Seedzuordnung `a4473795… → 875cb53c…` wird derzeit sowohl im alten Seedmapping als auch im späteren Review als exact transportiert; der alte Source-Snapshot ist ebenfalls der aktive Provenance-Ursprung. Nur einen neuen Review daneben zu legen reicht nicht: `applicabilityCompiler.loadMappingFiles` liest weiterhin alle Mappingdateien, und breite Root-/Ancestor-Mappings können die alte Behauptung weiterliefern. Alte Bytes sind deshalb unverändert als Historie zu bewahren, die **aktive** Source-Extraction-/Mapping-/Provenance-/Membership-/Closure-Kette muss in einem gebundenen Nachfolger ausdrücklich bereinigt werden. Ein künstliches Source-Atom darf dabei nicht ohne nachvollziehbare Korrektur aus dem Rückwärtsnenner verschwinden. Die aktuelle hypothetisch grüne Applicability beweist diese Bereinigung ausdrücklich nicht.

Die weiteren partiellen Zuordnungen in MV/SH/ST/TH sind im JSON vollständig inventarisiert. Ihre tatsächlichen Quellpassagen sind nicht durch den HE-Befund widerlegt oder neu bestätigt. Insbesondere begründet eine breite Zuordnung zu „Automaten modellieren“ nicht automatisch die volle Hierarchie-/Parallelitätsleistung oder eine regionale Q3-Pflicht. Die vorgeschlagene Anzeige benennt deshalb nur eine didaktische Reihenfolge.

## 5. Vollständiger Arbeitsweg und tatsächliche Entscheidungsgrenze

Der kleinste sachgerechte Gesamtweg umfasst vier getrennt überprüfbare Teile:

1. **Semantik/Placement:** den oben präzisierten 875-Vorbereitungstausch und die zwei Umplatzierungen nach vollständigem Gegenreview umsetzen. Die sechs Nachfrageentzüge und zwei effektiven Coveragekorrekturen ausdrücklich aufnehmen. Keine automatische transitive Reduktion weiterer Kanten.
2. **Echte Prüfungsinhalte:** die vorhandene 41er-ID mit einem zusammenhängenden Datenbank-/Web-/Datenverantwortungs-/Statechart-Dossier ausarbeiten. Es braucht konkrete Tabellen und Schlüssel/FDs, SQL-/Algebra-/Kalkülaufgaben, Transaktions-/Index-/Kostenfälle, Web-/API-/Session-/Sicherheitsmaterial, Datenschutz-/Ökonomiefälle, NoSQL-/Map-Reduce-Eingaben sowie Zustands- und Sequenzmodelle. Alle 41 Ziele müssen auf jeder zulässigen Bestehensroute beobachtbar geprüft sein. Die neue GK-Prüfung enthält genau die 22 GK-Kompetenzen und einen eigenen vollständigen Bestehensvertrag. Der bisherige generische 20/12-Raster ist kein Beleg dafür.
3. **Quellenauflösung:** zuerst einen tatsächlichen vollständigen curricularen Beleg für die unveränderte 875-Leistung suchen und unabhängig prüfen. Eine zutreffende didaktische Konkretisierung darf begründet werden; ein allgemeiner Satz über Modellieren darf nicht ohne Leistungsabgleich zur Exact-Abdeckung aufgeblasen werden. Fehlt ein tragfähiger vorhandener Lehrplanbeleg, bleibt CQR003 für diesen Inhalt ehrlich offen.
4. **Aktuelle QA:** neue getrennte Inhalts-/Quellen-/Scopebelege erstellen und reale Generatoren/Gates ausführen. Die native Fingerprintrechnung über alle **414 A/M-Records** zeigt bereits in der reinen Placementhypothese genau **zwei neu stale Records**, beide zu875: Atomicity-Zeile115 und Memory-Zeile207, wegen der Phasekorrektur. Diese benötigen echte neue enge Urteile, keinen Hashrefresh. Neuer Prüfungsinhalt erfordert eigene aktuelle Aufgaben-/Rubrikbelege und gegebenenfalls neue Praxis; historische Quittungen bleiben unverändert. Raw-Source-/Buch-/Releasebindungen müssen ihren eigenen Regeln entsprechend neu erzeugt oder als historisch/stale belassen werden.

**Nur falls 875 trotz fehlender curricularer Grundlage als zusätzliches verpflichtendes HE-Target erhalten werden soll, entsteht eine echte Konzeptentscheidung:** Soll SkillPilot neben amtlich curricularen Targets ausdrücklich eigene, separat fachquellengeprüfte Targets führen, und wie werden diese in Quellenpassung, Zielumfang und Meilensteinen ehrlich getrennt ausgewiesen? Dafür existiert im geprüften CQR003-Vertrag noch kein durchgängiger Freigabepfad. Diese Entscheidung darf weder durch eine neue Quellenrolle behauptet noch durch Verstecken, Umklassifizieren, Floorabsenkung oder Override vorweggenommen werden. Das wäre eine explizite Vertragserweiterung, keine bloße Datenreparatur.

Eine rein datenseitige, vollständig nach heutiger Norm grüne Lösung unter gleichzeitiger Erhaltung aller heutigen Targets ist daher **noch nicht belegt**. Die schmale Placementkorrektur ist fachlich konkret und mechanisch geprüft; die genannten Inhalts-, Kurs- und Quellenarbeiten bleiben erforderlich. Keine neue Unit-/Recognition-/State-Runtime wird dadurch benötigt oder autorisiert.
