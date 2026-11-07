# Informatik: Zwischenkanten für den Grundlagenreview

Lesendes Reviewinput zu **62 aktuellen** und **72 historischen** G17-Fällen. 144 eindeutige Zeugenhops, davon 71 mit gewöhnlichem Ausgangsknoten. Keine fachliche Löschentscheidung und keine Datenänderung.

Die [JSON-Datei](informatics-ordinary-prerequisite-review-input-2026-11-06.json) bindet die aktuelle Quelle, alle ursprünglichen Fälle, tatsächliche Autorenursprünge sowie vollständige vorhandene DE-/EN-Zieltexte und Elternkontexte. Fehlende EN-Texte bleiben ausdrücklich null. Alle 62 aktuellen Zeugen wurden nach Entfernung jeweils ihres eigenen verfassten Ursprungs erneut validiert; keine globale Closure-Neuberechnung oder automatische Reduktion.

## Besonders angefragte bestehende Verbindungen

- SQL-Berechtigungen→Aggregation: SQL-Berechtigungen verwalten → Gruppierung und Aggregatfunktionen. Direkte Kante.
- Zustandsautomaten→ER-Modell/Kardinalitäten über ganze Q2-Prüfung: Zustandsautomaten modellieren → Q2 vernetzt anwenden → ER-Modell anwenden. Mehrstufiger tatsächlicher Pfad; keine direkte Kante behauptet.
- Zustandsautomaten→komplexe ER-Kardinalitäten über ganze Q2-Prüfung: Zustandsautomaten modellieren → Q2 vernetzt anwenden → Kardinalitäten und Optionalitäten sichern. Mehrstufiger tatsächlicher Pfad; keine direkte Kante behauptet.
- Sequenzdiagramme→Normalisierung: Sequenzdiagramme optimieren → Normalisierung durchführen. Direkte Kante.
- Netz-/Systemsicherheit→Binär-/Zweierkomplement: Netz- und Systemsicherheit → Binärsysteme anwenden. Direkte Kante.

## Brücken über ganze Prüfungen anderer Phasen

| Brücke | tatsächlicher Pfad | aktuelle / historische Fälle |
| --- | --- | --- |
| INFO-EXAM-BRIDGE-01 | Pruefprotokolle zwischen Sprache, Automat und Aufwand → Berechenbarkeitsgrenzen diskutieren → Zustandsautomaten modellieren → Q2 vernetzt anwenden | 1 / 1 |
| INFO-EXAM-BRIDGE-02 | Q2 vernetzt anwenden → ER-Modell anwenden → Q1 vernetzt anwenden | 5 / 5 |
| INFO-EXAM-BRIDGE-03 | LK Vorschlag C1 (Theoretische Informatik): Protokollsprache zwischen Automat, Grammatik und Registermaschine → Berechenbarkeitsgrenzen diskutieren → Zustandsautomaten modellieren → Q2 vernetzt anwenden | 1 / 1 |
| INFO-EXAM-BRIDGE-04 | LK Pflichtaufgabe B (Theoretische Informatik): Parser und Registermaschine für Logdateien → Berechenbarkeitsgrenzen diskutieren → Zustandsautomaten modellieren → Q2 vernetzt anwenden | 1 / 1 |
| INFO-EXAM-BRIDGE-05 | GK Vorschlag B2: Zugangssystem zwischen Automat und Berechenbarkeit → Berechenbarkeitsgrenzen diskutieren → Zustandsautomaten modellieren → Q2 vernetzt anwenden | 1 / 1 |
| INFO-EXAM-BRIDGE-06 | LK Vorschlag C2 (Theoretische Informatik): Zugriffskontrolle mit Sprache, Komplexität und Berechenbarkeit → Berechenbarkeitsgrenzen diskutieren → Zustandsautomaten modellieren → Q2 vernetzt anwenden | 1 / 1 |

## Gewöhnliche Zwischenkanten

| Hop | aktuelle Zieltexte (Titel) | Phasen | aktuelle / historische Fälle |
| --- | --- | --- | --- |
| INFO-HOP-001 | Instruktionssatz-Design → Programme schreiben | Q3 → Q3 | 1 / 1 |
| INFO-HOP-002 | Folgeglieder verstehen → Schaltnetze entwerfen | Q4 → Q4 | 1 / 1 |
| INFO-HOP-003 | Persistente Strukturen → Lineare Listen modellieren | Q1 → Q1 | 1 / 1 |
| INFO-HOP-004 | Ergebnismengen formatieren → SQL aus Programmen ausführen | Q2 → Q2 | 1 / 1 |
| INFO-HOP-005 | Pumping Lemma anwenden → Zustandsautomaten modellieren | Q3 → Q3 | 1 / 1 |
| INFO-HOP-006 | Cache-Hierarchien → Befehlssatz verstehen | Q3 → Q3 | 1 / 1 |
| INFO-HOP-007 | N-Gramm-Sprachmodelle simulieren → Trainingsdaten und Modellverhalten analysieren | GLOBAL → GLOBAL | 1 / 1 |
| INFO-HOP-008 | Memoisierung einsetzen → Rekursion und Iteration abwägen | Q1 → Q1 | 1 / 1 |
| INFO-HOP-010 | SQL aus Programmen ausführen → Formulare mit Backend verknüpfen | Q2 → Q2 | 1 / 1 |
| INFO-HOP-028 | Domänenmodelle verfeinern → Tabellen ableiten | Q2 → Q2 | 1 / 1 |
| INFO-HOP-029 | Gruppierung und Aggregatfunktionen → Grundlegende Selects schreiben | Q2 → Q2 | 1 / 1 |
| INFO-HOP-030 | SQL-Berechtigungen verwalten → Gruppierung und Aggregatfunktionen | Q2 → Q2 | 1 / 1 |
| INFO-HOP-031 | Listenverarbeitung in Prolog → Probleme mit Prolog lösen | Q4 → Q4 | 1 / 1 |
| INFO-HOP-032 | Sprachen klassifizieren → Grammatiken entwickeln | Q3 → Q3 | 1 / 1 |
| INFO-HOP-033 | Komponententests entwerfen → Sammlungen nutzen | Q1 → Q1 | 1 / 1 |
| INFO-HOP-034 | Gestaltung mit CSS planen → HTML-Grundgerüst anwenden | E → E | 1 / 1 |
| INFO-HOP-046 | Komplexität praktisch bestimmen → Laufzeiten vergleichen | Q1 → Q1 | 1 / 1 |
| INFO-HOP-047 | Kardinalitäten und Optionalitäten sichern → ER-Modell anwenden | Q2 → Q2 | 1 / 1 |
| INFO-HOP-048 | Kellerautomaten und Grammatiken verknüpfen → Deterministische Kellerautomaten entwickeln | Q3 → Q3 | 1 / 1 |
| INFO-HOP-049 | Berechenbarkeitsgrenzen diskutieren → Sprachen klassifizieren | Q3 → Q3 | 1 / 1 |
| INFO-HOP-050 | Berechenbarkeitsgrenzen diskutieren → Zustandsautomaten modellieren | Q3 → Q3 | 5 / 5 |
| INFO-HOP-051 | Formulare erstellen und Daten übertragen → Gestaltung mit CSS planen | E → E | 1 / 1 |
| INFO-HOP-052 | Balancierung vergleichen → Balancierte Suchbäume | Q1 → Q1 | 0 / 1 |
| INFO-HOP-053 | ER-Modell anwenden → Q1 vernetzt anwenden | Q2 → Q1 | 5 / 5 |
| INFO-HOP-056 | Wegsuche in Graphen beschreiben → Graphbegriffe kennen | Q1 → Q1 | 0 / 1 |
| INFO-HOP-057 | Komplexitätsklassen skizzieren → Probleme klassifizieren | Q3 → Q3 | 1 / 1 |
| INFO-HOP-058 | Graphalgorithmen in Prolog → Listenverarbeitung in Prolog | Q4 → Q4 | 1 / 1 |
| INFO-HOP-059 | Textgenerierung und Halluzinationen reflektieren → N-Gramm-Sprachmodelle simulieren | GLOBAL → GLOBAL | 1 / 1 |
| INFO-HOP-060 | Datenbanksicherheit berücksichtigen → SQL-Berechtigungen verwalten | Q2 → Q2 | 1 / 1 |
| INFO-HOP-061 | Divide-and-Conquer Sortieren → Rekursion strukturieren | Q1 → Q1 | 0 / 1 |
| INFO-HOP-062 | Hashing und Kollisionen → Suchalgorithmen implementieren | Q1 → Q1 | 0 / 1 |
| INFO-HOP-075 | Sequenzdiagramme optimieren → Normalisierung durchführen | Q2 → Q2 | 1 / 1 |
| INFO-HOP-076 | Parsing-Grundlagen → Grammatiken schreiben | Q3 → Q3 | 1 / 1 |
| INFO-HOP-077 | OO-Prinzipien anwenden → Sichtbarkeit gestalten | Q1 → Q1 | 0 / 1 |
| INFO-HOP-078 | Weitere Operatoren nutzen → Abfrageterme formulieren | Q2 → Q2 | 1 / 1 |
| INFO-HOP-079 | Datensicherheit umsetzen → Recht auf informationelle Selbstbestimmung | Q2 → Q2 | 1 / 1 |
| INFO-HOP-080 | Prozeduren und Funktionen entwerfen → Kontrollstrukturen anwenden | E → E | 1 / 1 |
| INFO-HOP-081 | Flussprobleme → Graphen modellieren | Q1 → Q1 | 1 / 1 |
| INFO-HOP-082 | Transaktionen und Isolation → Erweiterte SQL-Bereiche nutzen | Q2 → Q2 | 1 / 1 |
| INFO-HOP-083 | Kontrollstrukturen anwenden → Grundlegende Datentypen und Variablen nutzen | E → E | 1 / 1 |
| INFO-HOP-084 | Stabilität und In-Place → Einfache Sorten nutzen | Q1 → Q1 | 1 / 1 |
| INFO-HOP-105 | Sicherheitsaspekte in Netzen reflektieren → Client-Server-Dienste analysieren | E → E | 1 / 1 |
| INFO-HOP-106 | Kreis- und Brückenerkennung → Graphenalgorithmen anwenden | Q1 → Q1 | 1 / 1 |
| INFO-HOP-107 | Zustandsautomaten modellieren → Q2 vernetzt anwenden | Q3 → Q2 | 5 / 5 |
| INFO-HOP-108 | Kryptografie einordnen → Angriffe analysieren | E → E | 1 / 1 |
| INFO-HOP-109 | Vererbung und Polymorphie einsetzen → Klassenmodelle dokumentieren | Q1 → Q1 | 0 / 1 |
| INFO-HOP-110 | Probleme mit Prolog lösen → Fakten und Regeln schreiben | Q4 → Q4 | 1 / 1 |
| INFO-HOP-111 | Balancierte Suchbäume → Binäre Bäume bearbeiten | Q1 → Q1 | 0 / 1 |
| INFO-HOP-112 | Zustandsdiagramme vertiefen → Kardinalitäten und Optionalitäten sichern | Q2 → Q2 | 1 / 1 |
| INFO-HOP-114 | Teststrategien dokumentieren → Programme testen und debuggen | E → E | 1 / 1 |
| INFO-HOP-115 | Reduktionen anwenden → Berechenbarkeitsgrenzen diskutieren | Q3 → Q3 | 1 / 1 |
| INFO-HOP-116 | Halteproblem verstehen → Turingmaschine programmieren | Q3 → Q3 | 1 / 1 |
| INFO-HOP-117 | Einfache Sorten nutzen → Suchalgorithmen implementieren | Q1 → Q1 | 1 / 0 |
| INFO-HOP-118 | Vorgegebenen Code anpassen → Prozeduren und Funktionen entwerfen | E → E | 1 / 1 |
| INFO-HOP-126 | Netz- und Systemsicherheit → Binärsysteme anwenden | Q4 → Q4 | 1 / 1 |
| INFO-HOP-128 | Client-Server-Dienste analysieren → TCP/IP-Referenzmodell beschreiben | E → E | 1 / 1 |
| INFO-HOP-129 | Relationale Kalküle → Grundoperatoren anwenden | Q2 → Q2 | 1 / 1 |
| INFO-HOP-130 | Einfache Design-Patterns → OO-Prinzipien anwenden | Q1 → Q1 | 0 / 1 |
| INFO-HOP-131 | Regex zu Automaten → Ableitungen prüfen | Q3 → Q3 | 1 / 1 |
| INFO-HOP-133 | Vererbung und Polymorphie erläutern → Objekte analysieren und zu Klassen abstrahieren | Q1 → Q1 | 0 / 1 |
| INFO-HOP-134 | Abfrageoptimierung → Normalformen anwenden | Q2 → Q2 | 1 / 1 |
| INFO-HOP-135 | Matching-Probleme → Flussprobleme | Q1 → Q1 | 1 / 1 |
| INFO-HOP-136 | Hash-Tabellen implementieren → Hashing und Kollisionen | Q1 → Q1 | 0 / 1 |
| INFO-HOP-137 | Eigenen Umgang mit Daten reflektieren → Datensicherheit umsetzen | Q2 → Q2 | 1 / 1 |
| INFO-HOP-138 | Angriffe analysieren → Klassische Verfahren anwenden | E → E | 1 / 1 |
| INFO-HOP-139 | Cut und Nichtdeterminismus → Logikprogrammierung vertiefen | Q4 → Q4 | 1 / 1 |
| INFO-HOP-140 | Map-Reduce-Prinzip erlaeutern → Nichtrelationale Datenbanken einordnen | Q2 → Q2 | 1 / 1 |
| INFO-HOP-141 | Cloud-Grundprinzipien → Virtualisierung/Container | Q4 → Q4 | 1 / 1 |
| INFO-HOP-142 | Ergebnisse präsentieren → Prototyp entwickeln | E → E | 1 / 1 |
| INFO-HOP-143 | Nicht-vergleichsbasierte Sortierverfahren beschreiben → Effiziente Sortierverfahren verstehen | Q1 → Q1 | 1 / 1 |
| INFO-HOP-144 | Prototyp entwickeln → Projekt strukturieren | E → E | 1 / 1 |

Die Tabellen sind eine endliche Arbeitsliste. Der Grundlagenreview muss die tatsächliche erforderliche Vorbereitung bestimmen, nicht aus der Existenz einer Zeugenroute Coverage oder Mastery ableiten. Erst getrennt geprüfte semantische Korrekturen können spätere Normalisierungen begründen.
