# Mathematik M7: fachliches Abschlusskonzept und Übergabe

Stand: 28. September 2026. **Konzeptphase; Umsetzung und Goal-Verfolgung pausiert.**

Dieses Dokument hält die Entscheidungen und den Arbeitsplan für die Fortsetzung
fest. Es ist weder eine neue QS-Freigabe noch ein Nachweis eines commitfähigen
Arbeitsstands. Bestehende Kandidaten werden dadurch nicht übernommen.

## 1. Auftrag und Grenzen

Die mit dem Product Owner vereinbarte Reihenfolge ist:

1. **Astra Ultra:** dieses Konzept ausarbeiten und speichern; Rückmeldung `fertig`.
2. **Nach dem Modellwechsel zu Sol Ultra:** den vorhandenen Arbeitsstand technisch
   und dokumentarisch konsolidieren; erst nach den erforderlichen Prüfungen
   `commitbar` melden. Keine automatische Wiederaufnahme der M7-Produktion.
3. **Product Owner:** committen, pushen und die Goal-Verfolgung wieder starten.
   Erst danach die fachlichen Restpakete dieses Konzepts bis M7 bearbeiten.

Der verbindliche Maßstab bleibt das
[Qualitäts- und Erprobungskonzept](../concept/curriculum-quality-and-human-trial.md):
M6 bleibt erfüllt, jedes aktuelle `curricularAtomic`-Ziel besteht die strenge
D/P/A/M/V-Schnittmenge, die erforderlichen Prüfungen bestehen und es gibt keine
relevanten offenen Abschlussblocker. Menschliche Freigaben und menschliche
Erprobung sind davon getrennt. Weder eine Bilderquote noch eine grüne CI noch
ein `released`-Feld allein bedeutet M7.

Die vereinbarte fachliche Zwischenregel betrifft **Bayerns Kurszuordnung**, nicht
Lernziele, Quellen, Atomarität, Bilder, Aufgaben oder Prüfungsqualität:

- BY-GK = sämtliche Lernziele des regulären Pflichtfachs Mathematik.
- BY-LK = dieselben Pflichtziele **plus alle Ziele aller fünf Vertiefungsmodule**.
- Ein Fokus auf die drei tatsächlich unterrichteten Module verengt vorläufig
  den Lernweg, **nicht** den persönlichen Zielumfang, Gesamtfortschritt oder
  Abschlussnenner. Die echte Modulauswahl und die passenden Kursbezeichnungen
  gehören zu [Issue #59](https://github.com/enpasos/skillpilot/issues/59).
- Issue #59 muss für den fachlichen M7-Abschluss nicht geschlossen sein. Seine
  UX-Schwäche legitimiert aber keine fehlenden Vertiefungsziele.

Das bayerische Fachprofil unterscheidet reguläre Mathematik und einen optionalen
Vertiefungskurs mit drei aus fünf Themen. Die technische Fünfermenge ist unsere
bewusste Zwischenregel, keine Behauptung über den tatsächlich besuchten Kurs.
Quelle: [LehrplanPLUS, Mathematik-Fachprofil](https://www.lehrplanplus.bayern.de/fachprofil/gymnasium/mathematik).

**Zusätzliche Product-Owner-Klarstellung während der Konzeptphase:** Es gibt
aktuell keine von den geplanten Prüfungskorrekturen betroffenen Benutzer.
Deshalb sind weder neue Prüfungs-IDs zum Schutz alter Erfolge noch
Lernstandsmigrationen Voraussetzung dieses Abschlusses. Bestehende Aufgaben
dürfen unter derselben ID fachlich korrigiert und neu geprüft werden. Diese
Vereinfachung beseitigt eine aktuell unnötige technische Hürde, keinen
inhaltlichen Qualitätsanspruch.

## 2. Die fachlichen Probleme und ihre gemeinsame Ursache

Wir müssen **Zielbedeutung, amtlichen Beleg, Sichtbarkeit, Voraussetzung und
tatsächliche Prüfungsleistung** auseinanderhalten. Bisher konnten breite
Cluster-Mappings oder Prüfungslisten Unterschiede zwischen diesen Ebenen
verdecken. Weitere Bilder oder das bloße Nachführen von Fingerprints lösen das
nicht.

| Ebene | Verbindliche Aussage | Was sie nicht beweist |
| --- | --- | --- |
| Kanonisches Ziel | Eine bestimmte, überprüfbare Kompetenz mit stabiler Identität | Dass diese Kompetenz in jedem Bundesland Pflichtstoff ist |
| Quellenzuordnung | Welcher Teil welcher amtlichen Fassung die Kompetenz trägt | Dass eine partielle Clusterkante jedes Kind vollständig belegt |
| Composition View | Welche Ziele im konkreten Land, Kurs und Bildungsabschnitt `target` sind | Dass diese Platzierung schon fachlich richtig ist |
| `requires` | Welche Kenntnisse zur Bearbeitung notwendig sind | Dass die Aufgabe diese Kenntnisse selbst prüft |
| `coveredGoalIds` | Welche Kompetenzen durch bewertete Aufgabenleistung tatsächlich erfasst werden | Dass alle Voraussetzungen oder Nachfahren mitgeprüft wurden |
| P-Profil | Welche unabhängigen Leistungen Verständnis des Lernziels zeigen | Dass die feste Abschlussprüfung diese Leistungen bereits verlangt |
| Terminaler Pfad | Dass eine Lernroute zu einer passenden Anwendung/Prüfung führt | Dass jeder Knoten auf dem Pfad dort unmittelbar bewertet wird |

### 2.1 Prüfungsabdeckung in Q2: der größte zusammenhängende Rest

Die vierteilige Pyramidenaufgabe `1878f680-095c-511d-aaed-e98393f7fde9`
führt aktuell jeweils **42** `requires` und `coveredGoalIds`. Die
[v2-Triage](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/assessment-review/mathematik/q2-geometry-terminal-repair-candidate-20260928-v2/README.md)
belegt davon zwei Zielzuordnungen sicher, eine dritte nur bedingt. Eine vierte
setzt einen **neuen, bepunkteten Prisma-Vergleich** voraus. Daher ist
„42 auf 4 reduzieren“ noch kein freigegebenes Ergebnis.

Für diese hypothetische Viererfassung gilt laut Kandidatenaudit:

- 38 direkte Zuordnungen würden entfallen; keine dieser 38 hat dort eine andere
  direkte Sek-II-Prüfungszuordnung.
- 16 verlieren im noch nicht nach Kurssicht projizierten Graphen sämtliche Wege
  zu einem bestehenden Sek-II-Prüfungsende.
- Die anderen 22 besitzen nur einen verbleibenden indirekten Weg. Dieser ist
  weder ein direkter Prüfungsbeleg noch automatisch ein gültiger lokaler Weg
  in jeder Land-/Kurs-Sicht.
- Die drei v2-Aufgabenentwürfe adressieren erst acht verschiedene der 16 Ziele.
  Die Diagnosewerte 31/32 und 32/32 Kurssichten sind alte Snapshots, keine
  Integrationsfreigaben.

Ein zweiter bekannter Fall ist `2f8a3a90…`: Die Aufgabe beansprucht drei
Spiegelungsziele und das Ebene–Ebene-Ziel `0f4f9957…`, obwohl die Aufgabenleistung
diese Kompetenzen nicht enthält. Sie gehört deshalb ausdrücklich in dasselbe
begrenzte Reparaturpaket; nur die Pyramidenaufgabe zu korrigieren wäre unvollständig.
Belege: [Vier-Ziele-Audit](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-28/m7-four-d-holds-0b-0f-6b-fde-current-audit-20260928.md)
und [Spiegelungsanalyse](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-28/m7-q2-reflection-identity-migration-candidate-20260928.md).

**Entscheidung:** Aufgaben und Bewertungsraster bestimmen die Coverage, nicht
umgekehrt. Keine Kanten ergänzen, nur um eine Routenprüfung grün zu machen.

### 2.2 Quellen und Kursumfang: keine globale Filterreparatur

Die bestehenden [Buchregeln](../concept/skill-graph/learning-goal-book-and-evidence-review-pipeline.md)
bleiben gültig: Der nationale Atlas gewinnt seinen konkreten Geltungsumfang aus
den effektiv aufgelösten `target`-Mitgliedschaften der registrierten Ansichten
und der geprüften Dauer-Modell-Policy. Das breite kanonische
`goal.applicability` ersetzt diese exakte Matrix nicht. Die Ansichten wiederum
müssen durch Quellen gedeckt sein; eine View ist kein Quellenbeweis.

**Entscheidung:** Fehler gezielt in Quellenzuordnung und expliziten Placements
beheben. Den verworfenen generischen Jurisdiktionsfilter nicht wieder einbauen
und nicht den Backend-Fallback pauschal abschalten. Das würde auch berechtigte
Ziele entfernen. `prerequisiteOnly` wird ausdrücklich authored, nicht aus
`phase`, LK-Tags oder einer Voraussetzungskante geraten.

Für BY-M13.4 sind insbesondere die drei Kinder des Clusters `ead1f5ce…`
betroffen: `dc12f281…` (Differential-Anwendung), `0b162cb0…`
(Integral-Anwendung), `71fe4a39…` (Validierung). Der amtliche reguläre M13.4
umfasst reflektierte Anwendungen und Ergebnisprüfung. Die Aufteilung dieses
Quellensatzes auf drei Ziele verlangt anteilige Blattbelege; eine exakte
Clusterkante beweist nicht dreimal eine exakte Eins-zu-eins-Entsprechung.
Quelle: [LehrplanPLUS M13.4](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/mathematik).

Die aktuelle BY-only-Modellierung dieses Ergänzungszweigs muss zwei Richtungen
erfüllen: Die drei Leistungen sind in BY-GK **und** BY-LK erreichbar; andere
Länder verlieren durch den gezielten Ausschluss kein amtlich gefordertes
Äquivalent. Wo ein anderes kanonisches Ziel dieselbe Leistung trägt, wird es
konkret benannt. Fehlt ein solches Ziel, ist ein Quellen-/Modellierungsloch zu
schließen statt bloß die BY-Referenz zu verstecken.

Dasselbe gilt für `fde351a8…`: Der verengte Funktionsmodellierungs-Text besitzt
gezielte HE-/BW-Belege; seine bisher breitere Länderzuordnung wird dadurch nicht
automatisch bestätigt. Für jede betroffene Sicht ist „belegt“, „durch anderes
Ziel abgedeckt“ oder „noch offen“ nachzuweisen. Siehe
[aktueller fde-Befund](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-28/m7-fde-function-relation-scope-correction-20260928.md).

### 2.3 Zielidentität: echte Kompetenz statt künstlicher LK-Unterschiede

Für die Spiegelungsgruppe ist vor weiterem D-/Bildreview die fachliche Identität
zu entscheiden:

- `8cb5c712…` enthält bereits Punktspiegelung an einer beliebigen Ebene.
  Ein weiteres LK-Punktziel `fcd1d180…` benötigt eine tatsächlich zusätzliche,
  quellenbelegte Leistung. Das Wort „allgemein“ allein reicht nicht.
- Gerade-an-Ebene und Ebene-an-Ebene können eigenständige Ziele sein; ihre
  Spiegeltransformation muss explizit sein. Eine Gerade-an-Punkt-Leistung aus
  BW ist damit nicht gleichzusetzen.
- Ein Bild nur zur Ebene `x = 2` kann einen Einstieg illustrieren, beweist aber
  weder den allgemeinen Zielumfang noch dessen Prüfungsabdeckung.
- Die fachliche Quelle entscheidet, ob präzisiert, geteilt oder eine echte
  Dublette als Kompatibilitäts-ID zurückgenommen wird. Der gewünschte
  M7-Prozentwert ist dabei kein Kriterium.

**Neuer kritischer Befund zu `7d37513b…`:** Die aktuelle Arbeitsfassung verengt
das Ziel auf Flächen-/Volumenfaktoren einer positiven zentrischen Streckung und
platziert es HE-LK-only. Die zitierte HE-Stelle Q2.5 führt zentrische Streckungen
jedoch bereits im grundlegenden GK/LK-Teil; auch die herangezogenen
Körperberechnungen stehen im grundlegenden Q2.2-Teil. Die Kombination kann eine
sinnvolle Operationalisierung sein, belegt aber **noch keine LK-only-Geltung**.
Das ist eine offene fachliche Entscheidung, kein durch einen Regressionstest
gelöster Sachverhalt. Quelle: [HE KCGO Mathematik 2024, Q2.2 und Q2.5](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf).

Für 7d gilt daher folgende Reihenfolge, abweichend vom vorläufigen
[HE-LK-Arbeitsstand](math-m7-7d-he-lk-scope-2026-09-28.md):

1. Die genaue Leistung mit vorhandenen Streckungs-, Ähnlichkeits-, Flächen-
   und Volumenzielen abgrenzen. `35558905…` behandelt Matrix und Bildpunkte,
   `d6b74b15…` ebene Ähnlichkeit; `87c55be5…` und `5f548596…` behandeln
   Flächen- bzw. Körperberechnungen. Keines verlangt derzeit ausdrücklich die
   zusammenhängende Erklärung von quadratischer **und kubischer** Skalierung.
   Bevorzugter Pfad ist deshalb, 7d als didaktisch abgeleitete Anwendung zu
   erhalten, statt diese Leistung durch eine unbelegte Dublettenannahme zu verlieren.
2. Quellenargument für das Anforderungsniveau ausdrücklich prüfen. Ohne
   zusätzlichen LK-Beleg nicht am alten LK-Tag festhalten. Wenn die Leistung
   aus dem Grundstoff operationalisiert wird, ist GK/LK fachlich zu prüfen;
   bei einer Dublette wird ihre Leistung ohne künstliches neues Atom erhalten.
   Die gemeinsame Niveaustufe bedeutet dabei nicht automatisch Pflichtbelegung
   des Themenfelds: Im HE-Q2-Rahmen sind die Themenfelder 1–3 verbindlich;
   Q2.5 darf nicht allein wegen seiner GK/LK-Unterteilung als für jede Belegung
   verpflichtend ausgegeben werden.
3. Erst danach Scope, Identität, notwendige Voraussetzungen und tatsächliche
   Abschlussaufgabe gemeinsam festlegen. Keine anisotrope Transformation
   nachträglich als Beleg für das verengte Streckungsziel verwenden.
4. Erst auf dem entschiedenen Stand D/P/A/M/V nachprüfen. Der jetzige
   Scope-Test schützt die Arbeitsfassung, ersetzt aber diesen Entscheid nicht.

Die HE-Spiegelungsquelle benennt auf erhöhtem Niveau die abzubildenden Objekte,
aber nicht ausdrücklich das Spiegelobjekt. Eine Operationalisierung muss
deshalb als solche begründet werden und darf kein erfundenes wörtliches
Lehrplanzitat erzeugen. Quelle: [HE KCGO, Q2.3](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf).

## 3. Zielbild für Aufgaben, Routen und Nachweise

### 3.1 Kleine, kohärente Prüfungen statt Sammel-Coverage

Die vorhandenen Entwürfe werden wiederverwendet, aber nach fachlicher
Zusammengehörigkeit und tatsächlichem gemeinsamen Scope geschnitten:

- Vektorkombination, Abhängigkeit und Kollinearität: den bestehenden kohärenten
  Dreizielentwurf unabhängig prüfen.
- Volumen: Spat/Tetraeder nicht allein wegen einer Coverage-Liste mit allen
  elementaren Körpern verkoppeln. Kleinere zusammenhängende Aufgaben sind der
  Standard; ein Fünfkörperpaket braucht eine positive Begründung der gemeinsamen
  Voraussetzung und des Lernwegs.
- Ebenen, Abstände und Projektionen: Fälle mit unterschiedlicher Landesgeltung
  trennen; notwendige allgemeine Fälle statt ausschließlich achsenparalleler
  Rechenabkürzungen prüfen.
- Spiegelungen: erst nach Zielidentitätsentscheidung passende Aufgaben erstellen.
- Zeichnen, Ablesen räumlicher Darstellungen und Softwareeinsatz: echte passende
  Stimuli und bewertbare Zeichnungen bzw. Softwareausgaben verlangen. Eine
  Textbeschreibung ersetzt keine geforderte Zeichenleistung.

Es entsteht **keine Pflicht zu einer separaten Prüfung je Lernziel**. Eine
schlüssige Aufgabe darf mehrere Ziele tragen. Ebenso muss nicht jede feste
Abschlussaufgabe das ganze P-Profil eines Ziels allein abdecken. Wesentlich ist,
dass ihr dokumentierter Prüfungsanspruch nicht größer ist als die bewertete
Leistung und dass die erforderliche Vielfalt insgesamt belegt bleibt.

### 3.2 Eine schlanke, überprüfbare Coverage-Matrix

Die bestehenden Q2-Reviewpakete werden um ein maschinenlesbares Register ergänzt;
keine neue Benutzeroberfläche und keine allgemeine Prüfungsplattform. Ein
Eintrag bindet mindestens:

- Aufgaben-ID, Aufgaben-/Lösungs-/Bewertungsfingerprint und Quellenstand;
- Ziel-ID und den konkret geprüften Kompetenzaspekt;
- Teilaufgabe, erwartete beobachtbare Leistung, zugehörige Bewertungseinheiten;
- erforderliche Darstellung/Hilfsmittel, einschließlich Zeichnung oder Software;
- geprüfte Land-/Stufen-/Kurs-Sichten und die notwendigen Voraussetzungen;
- unabhängigen Reviewbefund, offene Einwände und deren begründete Auflösung.

`coveredGoalIds` darf keine zusätzliche ungestützte ID enthalten. Eine nur
partielle Übung wird nicht als vollständiger Kompetenznachweis verkauft. Für
jede der betroffenen Altzuordnungen wird dokumentiert, ob eine passende feste
Aufgabe direkt prüft, eine neue nötig ist oder der geprüfte P-Nachweis mit einer
ehrlichen indirekten lokalen Anwendungsroute genügt. Letzteres ist **kein**
direkter Exam-Coverage-Claim. Damit werden die übrigen 22 Ziele nicht vergessen,
aber auch nicht künstlich 38 neue Prüfungen erzwungen.

Die technische Validierung prüft IDs, Fingerprints, Punkte, Zuordnungen und
Projektionen. Die fachliche Wahrheit von Aufgaben und Rubriken wird unabhängig
begutachtet; ein Schema- oder Rechentest allein kann sie nicht bestätigen.

### 3.3 Prüfungen in der tatsächlich besuchten Sicht

Pro betroffener effektiver Composition View prüfen:

1. Das zu prüfende Ziel und die zugehörige Abschlussaufgabe sind dort tatsächlich
   vorgesehen; Jahrgang/Phase und Anspruch passen zusammen.
2. Voraussetzungen sind fachlich notwendig, azyklisch und erfüllbar. Bereits
   außerhalb des aktuellen Zielumfangs erworbene Voraussetzungen dürfen
   `prerequisiteOnly` bleiben; sie müssen nicht künstlich neue Targets werden.
3. Eine noch offene Voraussetzung darf nicht wegen ihrer Unsichtbarkeit als
   erfüllt gelten. Für fehlende Vorkenntnisse muss der vorhandene Umgang mit
   Voraussetzungen funktionieren; kein unerreichbarer Endpunkt.
4. Jede betroffene Route endet lokal passend. Ein entfernter Abiturknoten oder
   eine Aufgabe in einem anderen Bundesland ersetzt diesen Endpunkt nicht.
5. Atlas, Backend-Projektion und Cockpit stimmen bezüglich derselben Ziel-IDs
   überein. Die bundesweite Ansicht ist eine Vereinigung, nicht ein zusätzlicher
   Landeslehrplan.

### 3.4 Prüfungen direkt korrigieren, keine vorgezogene Migrationsarbeit

Der technische Befund bleibt richtig: Der Backend-Vertrag speichert Mastery
nach Lernenden-ID und Goal-ID, nicht nach Prüfungsrevision. Nach der ausdrücklichen
Klarstellung des Product Owners gibt es jedoch **keine betroffenen Benutzer**.
Wir lösen deshalb jetzt kein hypothetisches Bestandsmigrationsproblem.

**Entscheidung für die Reparatur:**

- Die bestehende Pyramidenaufgabe darf unter ihrer bisherigen ID eine fachlich
  bessere Aufgabenstellung, etwa den Prisma-Vergleich, und eine ehrliche
  Coverage erhalten. Ebenso die andere betroffene Q2-Prüfung direkt korrigieren.
- Zusätzliche, eigenständige Aufgaben bekommen IDs, weil sie neue Aufgaben
  sind, **nicht** um theoretische Altmastery zu umgehen. Keine Doppelstruktur
  aus alter und neuer Prüfung allein aus diesem Grund anlegen.
- Aufgabenänderungen erfordern aktuelle Lösungen, Bewertung, Quellen-/Scope-
  Prüfung und eine neue fachliche Reviewentscheidung. Eine alte Freigabe gilt
  nicht automatisch für neuen Inhalt; unveränderliche historische
  Reviewartefakte bleiben als alte Belege erhalten.
- Inhaltsziele weiterhin sauber unterscheiden: Präzisierung einer Kompetenz,
  Aufspaltung verschiedener Kompetenzen oder Zusammenführung einer echten
  Dublette. Daraus folgen nur die fachlich notwendigen IDs und Referenzänderungen.
- Keine neue Prüfungsversionsplattform, keine Migration produktiver Lernstände
  und keine dafür neu eingeführte Freigabehürde in diesem M7-Paket. Vorhandene
  Backend-Regressionen nicht abschwächen; normale Referenz-, Fokus- und
  Frontier-Konsistenz gehört weiterhin zum funktionierenden Graphen.

Der zuvor in der [6b-Arbeitsnotiz](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-28/m7-6b-compatibility-retirement-20260928.md)
formulierte zusätzliche Bestandsmigrations-/Deploy-Nachweis wird durch diese
Product-Owner-Klarstellung für den aktuellen Abschluss **nicht als eigener
Blocker verlangt**. Das macht einen fehlerhaften aktiven Graphen nicht zulässig.

### 3.5 Abschlussblocker in den bestehenden Qualitätsweg einbinden

`CQR-203` prüft gegenwärtig insbesondere das Vorhandensein von Freigabe- und
Coverage-Metadaten, nicht deren fachliche Richtigkeit. Ein altes `released`
macht deshalb die bekannten Q2-Befunde nicht erledigt.

**Entscheidung:** Das begrenzte Assessment-Register und seine offenen relevanten
Befunde müssen vor Abschluss in den vorhandenen Qualitäts-/Abschlusscheck
einfließen. Kein zweiter M7-Zähler und kein sechstes Prozent-Gate. D/P/A/M/V
bleibt die eine strenge Schnittmenge; bekannte fachliche Abschlussblocker
verhindern daneben wahrheitsgemäß `strictCompletionReady`/M7. Ein entsprechender
Negativtest muss zeigen, dass ein offener bekannter Coverage-Fehler nicht trotz
vollständiger Fünf-Gate-Zahlen zu M7 führt.

Diese Ergänzung gehört zur M7-Abschlussentscheidung. Sie darf nicht durch eine
stille Umdefinition von `CQR-203` den geschützten M6-Checkpoint absenken.
Tatsächliche Verstöße gegen bestehende M6-Anforderungen bleiben dennoch Fehler;
sie dürfen weder ausgeblendet noch durch eine unveränderte Statuszahl geheilt werden.

Keine neuen pauschalen menschlichen Freigabeschwellen einführen. Bestehende
verpflichtende Freigaben bleiben bestehen; KI-Entscheidungen werden nie als
menschliche Freigaben ausgegeben.

## 4. Arbeitspakete nach ausdrücklicher Wiederaufnahme

Die Reihenfolge reduziert wiederholte Reviewläufe: **zuerst Semantik und
Scope stabilisieren, dann Nachweise binden**. Unabhängige Fachpakete dürfen
parallel laufen; Canonical, Views und zentrale Registry haben jeweils einen
Integrationsverantwortlichen.

| Paket | Ergebnis | Fertig, wenn … |
| --- | --- | --- |
| A: Ziel-/Quellenentscheid | Spiegelungen, 7d, offene Atomaritäts-/Split-Fälle und Modellierungsreste klar zugeschnitten | Jede Änderung quellenbegründet ist, ersetzte Leistungen weiter abgedeckt sind und Zielidentitäten fachlich stimmen |
| B: Scope und Projektion | BY-Pflichtfach plus fünf Module; gezielte andere Länder; Generator/Views/Atlas synchron | Sicht→Quelle und Quelle→Sicht passen, notwendige Voraussetzungen erreichbar sind und keine unbegründete Zielmenge verschwindet |
| C: Q2-Aufgaben | Ehrliche Coverage und geprüfte korrigierte/zusätzliche Aufgaben | Jede beanspruchte Leistung bepunktet nachgewiesen ist und alle betroffenen Routen stimmen |
| D: Aktuelle D/P/A/M/V-Nachweise | Fachlich geprüfte neue bzw. gezielt erhaltene Nachweise | Exakt der aktuelle Inhalt gebunden ist, unabhängige D-Runden samt Synthese vorliegen und Einwände entschieden sind |
| E: Abschlussintegration | Ein konsistenter Gesamtstand | Zentrale strenge Schnittmenge vollständig, CQR/Mindeststände/Abschlusschecks grün, keine relevanten offenen Befunde |

### Bereits vorhandene Arbeit nutzen

- Die aktuelle [zentrale Konfiguration](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json)
  und das [In-flight-Register](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json)
  bestimmen die aktiven Nachweise und Claims; alte Chat-Gesamtzahlen nicht als
  neuen Stand übernehmen.
- Das D-Dreierpaket
  `m7-prism-volume-surface-quadratic-current-20260928-v2` ist bereits registriert.
  Unveränderte, exakt prüfbare Teilnachweise erhalten, nicht wegen eines anderen
  Gesamtdigests pauschal erneut begutachten.
- Für die graphischen Stammfunktionsrichtungen `21676dae…` und `85eda551…`
  existiert eine v2-Konfiguration; sie ist keine durchgeführte D-Runde. Auf den
  stabilen Buchseiten prüfen. Quellenfassungen von BW nicht stillschweigend
  durch Umnummerierung vermischen.
- Das geplante Fünferpaket `b431148b…`, `49f9059a…`, `dc12f281…`,
  `0b162cb0…`, `71fe4a39…` erst nach stabiler BY-/Ländergeltung vorbereiten.
  7d bekommt erst nach Abschnitt 2.3 seinen endgültigen Reviewinput.
- Die übrigen offenen D-Fälle sind nicht durch diese Kurzliste ersetzt.
  Nach dem frischen Bericht vollständig nach Ziel-ID zuordnen; bei neuen
  Splits die neue Menge fachlich begründen statt die alte Zahl zu konservieren.
- Gute Bilder behalten. Neue Bilder nur für tatsächlich geänderte Kompetenzen
  oder noch fehlende Prüfungsstimuli erstellen. Lernzielbild und Prüfungsstimulus
  erfüllen unterschiedliche Aufgaben; keines ersetzt das andere.

### Effizienzregeln

Pro fachlichem Batch: Zieltext/Quellen/Scope entscheiden, zusammen integrieren,
gezielte Struktur- und Inhaltschecks, anschließend nur betroffene Reviews.
Mathematische Gegenprüfung und unabhängiger didaktischer Review dürfen parallel
erfolgen. Vor einer zentralen Registry-Änderung die Paketergebnisse einsammeln.

Geänderte Bedeutung, Aufgabe, Scope oder Bild erfordert die jeweils relevante
Neubewertung. Reine unveränderte Teilmengen dürfen mit geprüftem
Übernahmenachweis weitergelten. Niemals alte Reviewerurteile überschreiben oder
nur ihre Hashes auf neue Inhalte setzen.

Eine billige Strukturprüfung der übrigen Mathematikprüfungen auf dasselbe
Coverage-Muster ist sinnvoll. Sie ist eine Triage, keine fachliche Freigabe;
vertieft nachprüfen nur bei konkretem Befund. Kein Neustart aller 799 Seiten
und keine Ausweitung auf andere Fächer ohne Anlass.

## 5. Nächster Schritt: nur den Zwischenstand commitfähig machen

Dieser Abschnitt ist der konkrete Auftrag **nach dem Modellwechsel**, nicht
eine Behauptung bereits erledigter Arbeit.

### 5.1 Bestand sichern und aktive Quellen konsolidieren

1. Dirty Worktree und noch laufende Prozesse erneut prüfen. Keine fremden oder
   älteren Änderungen zurücksetzen. Generierte Caches wie `__pycache__` nicht
   versehentlich mit committen; keine pauschalen Löschaktionen.
2. Für jedes angefangene Paket festhalten: aktiv integriert, nur Kandidat,
   ersetzt/historisch oder noch offen. Kandidaten und verworfene globale
   Projektionsversuche dürfen nicht über eine Registry oder einen Generator
   unbeabsichtigt aktiv werden.
3. Die jüngsten BY-M13.4- und 7d-Änderungen mit Generator und Source-Views
   synchronisieren. Die kanonische Bindung in
   `app/scripts/config/math-duration-split-spanning-tree-policy.json` nur nach
   Prüfung des Inhaltsdeltas aktualisieren. Generierung darf gezielte Rollen
   nicht wieder überschreiben. Die fachlich offene 7d-Kursfrage bleibt offen;
   ihr jetziges Testergebnis ist keine Quellenfreigabe.
4. Aktuellen Nenner und tatsächliche Ziel-ID-Menge vergleichen. Der geänderte
   `testGoalBookModel.ts` erwartet bereits 799 Seiten; diese Zahl ist weder
   ein unveränderliches Ziel noch ein Abschlussbeleg. Insbesondere die dort
   noch vorhandenen HE-/NI-Erwartungen für `0b162cb0…` gegen die BY-only-
   Arbeitsfassung fachlich berichtigen, nicht nur den Test grün umschreiben.
5. Den älteren Q2.4/Q2.5-Test für `803d910d…`, `9b339361…`, `d3c42193…`
   anhand seiner Quellenannahmen abgleichen. Keine unbegründete Vergrößerung
   erwarteter Zielmengen als Testfix.

### 5.2 Nachweise und Mindestqualität ehrlich halten

6. Die durch jüngste Text-/Tag-/Scope-Änderungen betroffenen D/P/A/M/V-Bindungen
   prüfen. Unveränderte gültige Evidenz erhalten; aktuelle fachliche Prüfung
   dokumentieren, wo sie erforderlich ist. Noch nicht erledigte D-Fälle
   ausdrücklich offen lassen. Keine neuen D-Kampagnen allein für den Checkpoint.
7. Aktive Referenzen, Fokus-/Frontier-Verhalten und die vorhandenen Backend-
   Regressionen der bereits integrierten Zielkorrekturen prüfen. Keine zusätzliche
   Bestandsmigrationsarbeit einführen. Weitere fachliche Zielumbauten und neue
   Q2-Aufgaben gehören noch nicht in diesen Stabilisierungsschritt.

   **Nachträgliche, eng begrenzte Product-Owner-Entscheidung für den Checkpoint:**
   Eine kleine, eigenständig geprüfte HE-LK-Q2.5-Abschlussaufgabe für `7d37513b…`
   ist bereits jetzt erlaubt, weil sonst eine echte terminale Routenlücke den
   geschützten M6-Stand verletzt. Ebenso dürfen sieben schon aktive, aber als
   `needs_review` markierte Mathe-Prüfungen jetzt fachlich geprüft und nur in
   tragfähiger Fassung freigegeben werden. Das öffnet **nicht** die übrige
   Q2-Coverage-Welle oder die M7-Produktion. Menschliche Erprobung und
   tatsächliche Coach-Host-Akzeptanz bleiben getrennt.
8. Statusdateien aus ihren Quellen regenerieren. Mathematik-M6 und alle
   geschützten Mindeststände dürfen nicht unbemerkt fallen; die bereits
   erreichte Physik-M7-Qualität darf durch gemeinsame Änderungen nicht sinken.
   Maßgeblich ist auch die
   [Mindeststands-Policy](https://github.com/enpasos/skillpilot/blob/main/app/scripts/config/curriculum-maturity-floor-policy.json).
9. Bekannte fachliche Restpunkte, besonders beide Q2-Coverage-Fälle und die
   offene 7d-Niveaubegründung, im Handoff behalten. Ein Checkpoint darf diese
   offenen Arbeiten sichern, aber nicht als M7 oder fachlich mängelfrei gelten.

Ein realer Verstoß gegen eine geschützte Mindeststufe lässt sich nicht durch
Dokumentation oder eine abgesenkte Schwelle heilen. Wenn er sich nicht innerhalb
des klar abgegrenzten Stabilisierungsschritts beheben lässt: konkreten Befund
melden und Richtung klären, **nicht** trotzdem `commitbar` behaupten oder
ungefragt die gesamte Goal-Verfolgung starten.

### 5.3 Prüfungen bündeln und Übergabe schreiben

Zunächst gezielte Checks, danach einmal der zur Änderung passende gebündelte
Abschlusslauf. Kein kompletter Lernzielbuch-/QS-Neubau nach jeder Kleinigkeit.
Die CI-Workflows bestimmen den erforderlichen Umfang; folgende vorhandene
Einstiegspunkte sind kein Ersatz für deren gesamte Testauswahl:

```bash
npm --prefix app run test:math-q25-central-dilation-scope
npm --prefix app run test:hessen-math-q24-q25-scope
(cd app && npx tsx scripts/generateMathDurationCompositionViews.ts --check)
npm --prefix app run test:goal-book-model
npm --prefix app run quality:deep-understanding-rollout:check
npm --prefix app run quality:curriculum-status:check
python scripts/validate_schemas.py
git diff --check
```

Bei Skripten mit relativen Eingaben das Arbeitsverzeichnis `app/` gemäß dem
jeweiligen Skript verwenden. Aktuelle Buchartefakte vor deren abhängigen Tests
einmal über den bestehenden Buildpfad erzeugen; generierte Veröffentlichungen
unter `app/public/lernzielbuch/` bleiben Buildprodukte. Betroffene Backend-,
UI-/Vertragsprüfungen und Dokumentationschecks gehören ebenfalls
in den Checkpoint-Nachweis.

Zum Schluss eine kurze Checkpoint-Notiz mit Commit-Basis, zentralem aktuellem
Zähler, getrennten offenen Gates, ausgeführten Checks und ihren Ergebnissen,
aktiven Kandidaten und erstem Fortsetzungspaket schreiben. Den aktuellen
M7-Zähler nicht aus historischen Teilergebnissen addieren. Lokale Prüfergebnisse
und spätere GitHub-CI getrennt ausweisen. Dann `commitbar`; weder committen noch
pushen noch veröffentlichen. Die Goal-Verfolgung bleibt pausiert.

## 6. Eindeutige Abschlusskriterien nach Wiederaufnahme

Mathematik kann als M7 abgeschlossen gemeldet werden, wenn gleichzeitig gilt:

- Die aktuelle quellenbegründete Zielmenge ist vollständig modelliert; keine
  Dublette wird künstlich gezählt und keine Pflichtkompetenz zur Quotensteigerung
  entfernt. Jede Änderung des Nenners ist durch konkrete alte/neue IDs erklärbar.
- BY-GK und BY-LK erfüllen exakt die vereinbarte Zwischenregel einschließlich
  aller fünf Vertiefungsmodule; Focus wird nicht als dauerhafte Auswahl verkauft.
- Die strenge zentrale D/P/A/M/V-Schnittmenge umfasst **jedes** aktuelle
  `curricularAtomic`-Ziel. Gültige KI-Nachweise bleiben korrekt als KI-Nachweise
  gekennzeichnet; menschliche Erprobung wird nicht daraus abgeleitet.
- Beide bekannten Q2-Überdeckungen, offene Spiegelungsidentitäten, die
  7d-Niveaubegründung und alle weiteren konkreten Abschlussblocker sind
  fachlich entschieden und umgesetzt. Aufgaben, Rubriken und Routen passen
  zu ihren tatsächlichen Länder-/Kurs-Sichten.
- Zielreferenzen, Fokus und aktive Ziele funktionieren nach den Korrekturen;
  zusätzliche Altnutzer-Migrationen sind nach der Product-Owner-Klarstellung
  keine Abschlussvoraussetzung.
- Generator, Views, Atlas, Runtime und Statusberichte sind konsistent; erforderliche
  Validierungen und Schutzprüfungen bestehen auf demselben Stand. Physik bleibt
  unverändert vollständig. CI und eine eventuell spätere Auslieferung werden
  separat nachgewiesen, nicht aus lokalen Tests behauptet.

**Ergebnis des Konzepts:** Der Weg zu 100 % ist fachlich klar abgegrenzt. Er
braucht keine vorgezogene Bayern-UX-Neuentwicklung und keinen kompletten
Neustart der QS, wohl aber ehrliche Zielidentitäten, quellentreue Sichten und
tatsächlich passende Prüfungsleistungen. Erst danach sind die letzten
Reviewbindungen ein sinnvoller Abschluss statt bloßer Statistikpflege.
