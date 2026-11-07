# E-Phase: neun begrenzte Normalisierungen, eine gehaltene Kante

**Neun der zehn aktuellen G17-Kanten am E-Terminal sind als gemeinsamer, geschützter Vorschlag bestätigt. Eine bleibt gehalten.** Keine Quelldatei wurde geändert. Der [Vorschlag](informatics-ephase-terminal-normalization-proposal-2026-11-06.json) bindet Informatik `f95c0a11…`, alle 21 aktuellen kanonischen Dateien, zehn Einzelfallentscheidungen und neun aufeinander aufbauende exakte Array-Guards. Der [native Wirkungsbeleg](informatics-ephase-terminal-normalization-2026-11-06.native-impact.json) enthält die gemessenen Nebenfolgen und bindet beide vollständigen komprimierten Outputs.

Autor aller neun vorgeschlagenen Entfernungen ist `49ba66cf-accd-5938-a63e-f031bc786767` — **E-Phase vernetzt anwenden**. Seine 25 Coverage-IDs, Aufgaben, Lösungen, Rubrik und übrigen Felder bleiben unverändert. Die folgenden Zeugen bleiben auch **nach allen neun Entfernungen zusammen** erhalten. Vollständige IDs, DE/EN-Beschreibungen und die tatsächlichen direkten Ursprünge stehen im JSON.

| Fall | Entfernte direkte Anforderung | Verbleibender Pfad ab E-Terminal | Fachlicher Befund |
| --- | --- | --- | --- |
| E01 | `18317e31…` Datentypen/Variablen | Funktionen → Kontrollstrukturen → Datentypen/Variablen | Die einführende ausführbare Programmzerlegung behält ihre elementare Algorithmus- und Datenbasis. |
| E02 | `1a03f790…` CSS-Grundlagen | Responsive Layouts → CSS-Grundlagen | Grid/Flex für verschiedene Viewports baut auf Selektoren und grundlegender Gestaltung auf. |
| E03 | `5ca1960e…` Kontrollstrukturen | Funktionen → Kontrollstrukturen | Die bestehende elementare algorithmische Basis bleibt vor der eigenen Unterprogrammzerlegung erhalten. |
| E04 | `6539320a…` TCP/IP-Grundlagen | Paketübertragung → TCP/IP-Grundlagen | Die vollständige E25 enthält K23 verbindlich. Der Zeuge braucht die strittige Sicherheits-/Protokollkette nicht. Kein GK24-Übertrag. |
| E05 | `6bba1eda…` Klassische Kryptoverfahren | Angriffe analysieren → klassische Verfahren | Die Analyse der im gleichen Kryptologieabschnitt eingeführten Verfahren nutzt deren konkrete Verfahrensbasis; keine Voraussetzung moderner Kryptografie entsteht. |
| E06 | `757256e2…` HTML-Grundgerüst | HTML-Formulare → HTML-Grundgerüst | Eigene Formelemente benötigen die semantische Dokument-/Verschachtelungsbasis. CSS ist kein Träger dieses Wegs. |
| E07 | `8d21085b…` Projekt strukturieren | Ergebnisse präsentieren → Prototyp → Projektstruktur | Im gemeinsamen Kontext eines eigenen kleinen Projekts bleiben Planung, tatsächliche Umsetzung und darauf bezogene Reflexion erhalten. |
| **E08 HOLD** | `ace0c141…` Protokollanalyse | vorgeschlagen wäre Sicherheitsaspekte → Protokollanalyse | Authentifizierung und Logs können an einem gegebenen Dienstausschnitt erläutert werden, ohne zuvor ein vollständiges POP3-/SMTP-Protokoll zu analysieren. Diesen generischen Träger billige ich nicht. |
| E09 | `d5914986…` Testen/Debugging | Teststrategien → Testen/Debugging | Geplante und dokumentierte zielgerichtete Werkzeugnutzung behält elementare Fehlerlokalisierung und Gegenfälle als Basis. |
| E10 | `fcdf8e5f…` Prototyp | Ergebnisse präsentieren → Prototyp | Präsentiert und reflektiert werden die eigenen tatsächlich umgesetzten Projektergebnisse. |

E08 bleibt ausdrücklich als direkte Terminalanforderung stehen. Der lokale unabhängige Gegenblick von `ci_static` bestätigt den Einwand gegen `6c4fd4a4… → ace0c141…`. Dass der neue E25-Draft für A03 und A18 dasselbe SMTP-Material verwendet, prüft zwei getrennte Kompetenzen; daraus folgt keine universelle Voraussetzung für das gewöhnliche Sicherheitsziel. Eine spätere fachliche Korrektur dieser gewöhnlichen Kante ist ein eigener Vorschlag. Sie ist nicht in den neun Operationen enthalten.

## Tatsächlicher kumulativer Nachweis

Der [lesende Verifikator](verify_informatics_ephase_terminal_normalization.py) lädt die exakt gepinnten 21 Dateien und entfernt ausschließlich die neun einzeln freigegebenen Autorenursprünge. Nach **jeder** Entfernung wird die Contains-Vererbung vollständig neu berechnet. Anschließend vergleicht er alle vollständigen nichtleeren transitiven Hüllen mit dem unmittelbaren Vorgänger **und** dem ursprünglichen Bestand:

- **6.524 Goal-Knoten:** unveränderte globale Closure von `R_effective`.
- **5.495 atomare Knoten:** separat unveränderte globale Closure nach atomarer Expansion der effektiven Voraussetzungen.
- Nach jedem Schritt und im Gesamtergebnis: **null geänderte Nachfragemengen, null fremde Nachfragemengen, null Zykluskomponenten**.
- Alle neun konkret festgelegten Zeugen und ihre Autorenursprünge bestehen im endgültigen gemeinsamen Kandidaten. Es wird kein beliebiger nachträglich gesuchter BFS-Pfad als fachlich geprüft ausgegeben.

G17 wird auf der effektiven Goal-Relation geprüft, nicht durch atomare Expansion ersetzt. Die drei vorhandenen Clusteranforderungen des E-Praxiselternknotens bleiben ebenfalls unverändert; deshalb ändern sechs der neun direkten Entfernungen nicht einmal die atomare Adjazenz. Bei E05/E07/E10 ändert sich diese Adjazenz, aber ihre vollständige transitive Closure bleibt exakt gleich. Die Angaben dienen der transparenten Relationsprüfung und billigen keine beliebigen Clusteranforderungen neu.

Reproduktion ohne Anwendung:

```bash
python -B docs/dev/ci-graph-repairs/verify_informatics_ephase_terminal_normalization.py
```

## Native Nebenfolgen und unveränderte Grenzen

Die [Abfrage der Produktionsfunktionen](inspect_informatics_ephase_normalization.ts) wurde tatsächlich einmal auf dem Bestand und einmal mit genau einer schreibgeschützten Kandidatendatei in einem netzisolierten Mount ausgeführt. Beide Läufe endeten mit Exit 0. Kein CQR-Gesamtproducer und keine Lernerzustände waren beteiligt.

| Prüfung | Bestand | Neunerkandidat |
| --- | ---: | ---: |
| Informatik G17 insgesamt | 47 | 38 |
| G17 am E-Terminal | 10 | 1 — gehaltener Fall E08 |
| Übrige neun harte Graphregeln | pass | pass |
| Geänderte der 35 Kurskontexte | — | 0 |
| Globale kompilierte Applicability-Werte und Findings | Bestand | exakt gleich |
| Explizite CQR202-Prüfung des vorhandenen E-Terminals | fail: generischer Placeholder | unverändert fail |

Alle rohen und kompilierten Target-/Supportmengen, Rollen, sichtbaren Baumhashes und Composition-Findings der 35 Kontexte sind exakt gleich. **Die Applicability-Diagnoseevidenz ist nicht bytegleich:** Bei den neun entfernten Voraussetzungen entfallen genau 18 direkte BY-/HE-`requires-closure`-Zeilen mit dem E-Terminal als unmittelbarem Ursprung. Keine neue Zeile und keine Landesänderung entsteht. Dies sind Diagnosebelege für Vorbereitungssupport, keine amtlichen Quellen- oder Qualitätsnachweise.

Eine wirkliche Anwendung würde den Rohhash der Informatikdatei und den vollständigen Hash dieses einen Terminals ändern. Alle gewöhnlichen Goal-Payloads sowie die `examData`-Bytes bleiben gleich. Der eingefrorene E25-Kandidatenverifikator bindet aber ausdrücklich `f95c0a…` und die bisherige Terminaldefinition: Seine Quellenkontextbindung bräuchte danach einen ehrlich geprüften Nachfolger. Hier wird kein alter Fingerprint neu etikettiert und keine formale D/P-Fortgeltung behauptet.

Der [positive vollständige E25-Inhaltsreview](informatics-e25-terminal-independent-review-2026-11-06.md) bleibt getrennt. Seine neuen Materialien sind weiterhin nicht angewandt; die bestehenden generischen Materialien werden durch die Formalnormalisierung nicht ausreichend. GK24/25, ISA/Cache/875, die übrigen Terminal-/Materialbefunde und die M6-Wiederherstellung bleiben offen. Weder Coverage, Quellenzuordnung, Kursumfang noch bestehende Mastery-Ergebnisse werden geändert oder neu interpretiert.
