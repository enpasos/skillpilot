# Einheitlicher, backendgesteuerter Lernplanstatus
## Gesamtkonzept für SkillPilot: Cockpit, Chat und Planung

## 1. Ziel und Leitprinzipien

SkillPilot verwendet einen gemeinsamen Lernplanstatus, der drei Fragen beantwortet:

**Welches Pensum ist für die laufende Periode vorgesehen? Wie steht der Lernfortschritt gegenüber dem Plan? Woran wird als Nächstes weitergelernt?**

Die Berechnung und die sprachliche Formulierung liegen vollständig im Backend. Cockpit, Chat und lernendenbezogene Planung übernehmen die bereitgestellten Aussagen. Sie rechnen den Status nicht selbst nach und erzeugen keine abweichenden Bewertungen.

> **Eine fachliche Berechnung, eine verbindliche Formulierung, mehrere Ausgabekanäle.**

Eine typische Statusausgabe lautet:

> Mathematik: Tagesziel erreicht · 3 Lernziele im Rückstand  
> Physik: Heute kein Tagesziel · 2 Lernziele im Rückstand

Beim anschließenden Einstieg in die Lernaufgabe folgt separat:

> **Dein aktives Lernziel: Potenzfunktionen mit ganzzahligen Exponenten beschreiben**

### Einfachheit als Entwurfsziel

Die Umsetzung bevorzugt eine einfache, verlässliche Lösung für die üblichen Anwendungssituationen gegenüber einer umfassenden Behandlung sämtlicher denkbaren Sonderfälle.

**Die bewusste Begrenzung betrifft den Funktionsumfang, nicht die Richtigkeit der unterstützten Fälle.** Nicht zuverlässig auswertbare Situationen werden verständlich benannt, statt durch geschätzte Ergebnisse oder aufwendige Sonderfallmechanismen verdeckt zu werden.

Vorhandene Planstrukturen, Lernzustände und Aktualisierungsmechanismen werden weiterverwendet. Zusätzliche Einstellungen, Darstellungsvarianten und technische Abstraktionen benötigen einen konkreten Nutzen.

Das Vorhaben schafft kein neues allgemeines Planungssystem. Es vereinheitlicht die Auswertung vorhandener Lernpläne und ersetzt verteilte Berechnungen durch einen gemeinsamen Backend-Baustein.

**Verbindliche Produktentscheidung vom 31. Oktober 2026:** Das Plan-IST zählt
standardmäßig auch im vollständigen Persönlichen Lehrplan **implizit erledigte
Ziele**, soweit sie zur festen Planmenge gehören.
Jedes gemeisterte Ziel beendet seinen eigenen Vorbereitungsbedarf. Jedes nicht
mehr benötigte Nicht-Abschlussprüfungsziel ist implizit erledigt; dessen Bedarf
entfällt ebenfalls, bis ein stabiler Zustand erreicht ist. Dafür sind weder eine
bestandene Prüfung noch manuelle Zuordnungen zwischen Prüfung und Vorbereitung
notwendig. Offene Abschlussprüfungen werden nicht implizit erledigt.

Die optionale Einstellung „Nur explizit erreichte Lernziele zählen“ schränkt
allein die Plananrechnung ein. Die Erweiterung in Abschnitt 3.4 ist im lokalen
Backend und Cockpit implementiert. Die abschließende Gesamtprüfung läuft;
dieser Stand behauptet keinen entfernten CI-Erfolg, kein Deployment und keine
Coach-Host-Abnahme. Der frühere manuelle Skalarprodukt-Pilot bleibt ein
reproduzierbares Beispiel, ist aber keine Voraussetzung des allgemeinen Modells.
Siehe [Abschlusskonzept](../skill-graph/assessment-gated-completion.md) und
[Implementierungs- und Prüfhinweise](../../dev/assessment-gated-completion-pilot.md).

## 2. Fachliche Bedeutung des Status

### 2.1 Periodenpensum, Planstand und aktives Lernziel

Der Status unterscheidet drei voneinander unabhängige Aussagen: das Pensum der laufenden Periode, den mengenmäßigen Planstand und das aktive Lernziel.

| Aussage | Daraus darf nicht abgeleitet werden |
|---|---|
| Tages- oder Wochenziel erreicht | Es ist nichts mehr offen. |
| Kein Pensum für die laufende Periode | Es besteht kein Rückstand. |
| Mengenmäßig im Plan | Alle früher eingeplanten Inhalte werden beherrscht. |
| Aktives Lernziel vorhanden | Das Periodenziel ist noch nicht erreicht. |
| Weiterlernen möglich | Zusätzliches Lernen wurde bereits vereinbart. |

Ein erfülltes Tagesziel kann mit einem verbleibenden Rückstand zusammenfallen. Ein aktives Lernziel kann dem Aufholen, dem Vorarbeiten oder der Fortsetzung einer begonnenen Lerneinheit dienen.

Die Statuskommunikation stellt diese Situationen nicht als Widerspruch dar.

### 2.2 Mengenbilanz je Fach

Jedes fortschrittswirksame Planziel zählt als eine Einheit. Die Anzeige misst weder tatsächliche Lernzeit noch nach Schwierigkeit gewichteten Aufwand.

Bereits beherrschte, später eingeplante Ziele werden als Vorarbeit berücksichtigt. Diese Vorarbeit kann einen mengenmäßigen Rückstand innerhalb desselben Fachs ausgleichen.

Beispiel: Drei früher eingeplante Ziele sind noch offen, fünf später eingeplante Ziele bereits beherrscht. Mengenmäßig besteht ein Vorsprung von zwei Zielen. Die drei früher eingeplanten Ziele bleiben dennoch inhaltlich offen und werden bei der weiteren Zielauswahl berücksichtigt.

> **„Im Plan“ beschreibt den Umfang des Lernfortschritts. Es bestätigt nicht die Beherrschung sämtlicher bis dahin vorgesehener Inhalte.**

Der angezeigte Rückstand ist entsprechend eine Größe dieser Mengenbilanz. Er ist nicht mit der Anzahl aller konkreten, früher vorgesehenen und noch offenen Ziel-IDs gleichzusetzen.

Eine detaillierte Zielübersicht darf diese inhaltlichen Lücken zusätzlich sichtbar machen. Sie beantwortet eine andere Frage als die kompakte Mengenbilanz.

### 2.3 Keine Verrechnung zwischen Fächern

Jedes Fach wird unabhängig ausgewertet. Vorarbeit in Mathematik gleicht keinen Rückstand in Physik aus.

Es gibt keinen fachübergreifenden Gesamtsaldo, keine Gesamtquote und keine daraus abgeleitete Gesamtampel.

Diese Trennung der Zählung entfernt keine fachübergreifenden Abhängigkeiten:
Ein offenes Ziel eines anderen Fachs im Persönlichen Lehrplan kann eine
Vorbereitung weiterhin benötigen. Der Bedarf wird fachübergreifend geprüft,
der anschließende IST-Beitrag nur im jeweiligen Fach gezählt.

## 3. Verbindliche Datengrundlage

### Gemeinsame Ergebnisquelle in der gesamten Anwendung

Gespeicherte Lernzielergebnisse bleiben die einzige individuelle Ergebnisquelle.
Die Planerfüllung wird daraus und aus dem vollständigen Bedarfsgraphen des
Persönlichen Lehrplans abgeleitet; sie berücksichtigt standardmäßig auch implizit erledigte Ziele.
Ein Erlass schreibt weder Mastery noch einen zweiten Zielergebniszustand.
Cockpit, Lernzielbaum und Lehrkraftplanung dürfen dafür keinen abweichenden
manuellen Unterrichtsstand führen. Die frühere
Unterrichtsabdeckung samt Bestätigungs- und Attestierungsablauf ist als
Fortschrittsmodell abgelöst. Altdaten bleiben erhalten, sind aber keine Quelle
für Zielerreichung. Planung legt Umfang und Termine fest; sie bestätigt keine
Ergebnisse und verändert sie nicht.

Die vollständige persönliche Zielmenge und die nachfolgend definierte Planmenge
**G** sind nicht zwangsläufig identisch. Ein vor Planbeginn abgeschlossenes Ziel
kann zur persönlichen Zielerreichung zählen, ohne in G enthalten zu sein.
G ist eine zeitliche Auswahl, kein eigener Abschlussumfang. Für die implizite
Plananrechnung gilt stets der vollständige Persönliche Lehrplan. Eine bewusst
gewählte Abschnittsansicht kann einen eigenen Arbeitsentfall anzeigen, ohne
den Planwert zu ändern; die Anzeige benennt ihren jeweiligen Bezug.
Abgeschlossene Orientierungsziele werden innerhalb ihres jeweiligen Umfangs
konsistent mitgezählt, ohne sie als fachlichen Beherrschungsnachweis auszugeben.
Nicht verfügbare oder veraltete Ergebnisdaten werden als solche gezeigt, nicht
als null erreichte Ziele. Ein Abruf dieser Werte bleibt rein lesend.

### 3.1 Bereinigte Planmenge

Die bei Planerstellung erfasste Ausgangsbasis hält fest, welche vorgesehenen
Ziele noch keine explizite Mastery hatten. Diese Ziele bilden die
fortschrittswirksame Planmenge **G**. Diese bestehende Bereinigung bleibt
unabhängig vom neuen Anrechnungsmodus: Ein aktuell erlassenes Ziel wird nicht
zusätzlich aus G gestrichen. Andernfalls könnte die Einstellung „nur explizit“
seinen noch fehlenden expliziten Abschluss später nicht mehr berücksichtigen.

**Alle Größen der Statusrechnung beziehen sich ausschließlich auf dieselbe bereinigte Planmenge G.**

Bereits vor Planerstellung beherrschte Ziele tragen weder zum Soll noch zum IST noch zu den angerechneten Periodenabschlüssen dieses Plans bei.

Beispiel: Ein Cluster enthält 50 Ziele, davon sind bei Planerstellung bereits 20 beherrscht. Die verbleibenden 30 bilden die Planmenge. Werden fünf davon für die erste Woche vorgesehen, beträgt das Wochenpensum fünf.

Wird später eines dieser 30 Ziele beherrscht, bleibt es Bestandteil der Planmenge und zählt zum IST. Die Ausgangsbasis wird nicht bei jeder Anzeige auf die aktuell noch offenen Ziele reduziert.

Ein zusätzlicher Abschluss-Stichtag zur Abgrenzung des Vorwissens ist nicht erforderlich. Entscheidend ist die festgehaltene Planmenge.

### 3.2 Eindeutige Zuordnung und Zählung

Die Auswertung verwendet vorhandene stabile Fach- und Zielkennungen. Anzeigenamen und Übersetzungen dienen nicht als fachliche Identität.

Mehrere aktive Pläne desselben Fachs werden vor der Berechnung zu einer Zielmenge zusammengeführt. Dieselbe Ziel-ID zählt innerhalb des Fachs nur einmal; maßgeblich ist ihr frühester gültiger, fortschrittswirksamer Solltermin.

Wiederholungs- und Prüfungsblöcke erzeugen keinen zweiten Sollbeitrag für dasselbe Lernziel. Ein Cluster zählt nicht zusätzlich zu seinen bereits gezählten atomaren Zielen.

Die Auswertung verwendet die gültige Planfassung und deren festgehaltene Zuordnungen. Dafür wird keine neue allgemeine Planversions- oder Konfliktverwaltungsinfrastruktur eingeführt.

### 3.3 Planänderungen und Bestandsdaten

Änderungen von Umfang, Terminen oder Ausgangsbasis erfolgen als ausdrückliche Planänderung. Eine Statusabfrage verändert keine Planvorgaben.

Ein überschrittenes Planende entfernt offene Ziele nicht automatisch aus der Bilanz eines weiterhin aktiven Plans.

Bestandspläne werden unterstützt, soweit ihre Grundlage zuverlässig interpretierbar ist. Eine unklare Ausgangsbasis wird nicht heuristisch aus dem heutigen Lernstand rekonstruiert. Ist eine verlässliche Auswertung nicht möglich, wird dies kenntlich gemacht.

### 3.4 Implizite Erledigung und optionale Explizit-Zählung

Für den Plan ist ein Ziel standardmäßig erfüllt, wenn es explizit erreicht
wurde oder seine separate Bearbeitung nach den
[Abschlussregeln](../skill-graph/assessment-gated-completion.md) im vollständigen
Persönlichen Lehrplan nicht mehr benötigt wird. Beide Wege zählen gleich viel.
Es entsteht keine zusätzliche Mastery und kein gespeicherter Erlass pro Lernziel.

Für die feste, fachweise zusammengeführte Planmenge G seien M die aktuell
explizit gemeisterten Ziele und W_PC die im vollständigen Persönlichen Lehrplan
implizit erledigten Ziele. Dann gilt:

```text
Standard:                  I = |G ∩ (M ∪ W_PC)|
Nur explizite Ziele zählen: I = |G ∩ M|
```

Die Mengenvereinigung zählt jede Ziel-ID genau einmal. Wird ein bereits
angerechnetes erlassenes Ziel später selbst gemeistert, wächst I dadurch nicht
erneut. Cluster zählen nicht zusätzlich. Beispielsweise ergeben eine
bestandene Prüfung und zwei dadurch im ganzen Persönlichen Lehrplan nicht
mehr benötigte Vorbereitungsziele
**IST = 3**; mit der optionalen Einstellung **IST = 1**, sofern alle drei in G
liegen. Die Einzelmastery ist in beiden Fällen identisch.

**W_PC gehört zum vollständigen Persönlichen Lehrplan, nicht zur Planmenge G.**
Die Berechnung umfasst seine vollständige Voraussetzungshülle einschließlich
indirekter, versteckter und fachübergreifender Verbraucher. Sie verfolgt direkte
Bedarfsbeziehungen und stoppt an jedem gemeisterten Ziel; eine transitive Kante
darf diesen Stopp nicht umgehen. Erst das berechnete Ergebnis wird für die
Fachbilanz mit G geschnitten. Plantermine und die Auswahl geplanter Ziele
bestimmen keinen neuen Abschlussumfang.

Beispiel: Im Persönlichen Lehrplan benötigt eine offene Prüfung Q die noch
unmastered Vorbereitung A. Der aktuelle Plan enthält nur A; Q ist später oder
noch gar nicht eingeplant. A bleibt trotzdem erforderlich und trägt **I=0**
bei. Q aus G herauszulassen darf A nicht implizit erledigen. Das gilt ebenso
für einen echten Verbraucher in einem anderen Fach. Eine Vereinigung kleiner
Abschnittserlasse oder getrennte Auswertung nur der Fachpläne wäre falsch.

Ein Nicht-Abschlussprüfungsziel ohne verbleibenden Verbraucher ist auch ohne
bestandene Prüfung implizit erledigt. Enthält der vollständige Persönliche
Lehrplan samt Voraussetzungshülle keine Abschlussprüfung, entfällt dort jede
noch nicht explizit erledigte Arbeit. Ein bloß prüfungsfreier Plan genügt dafür
nicht. Nicht geplante Ziele erhöhen I nicht; sie können den Bedarf aber weiterhin
bestimmen. Eine bewusst gewählte Abschnittsansicht zeigt W_section, ersetzt
für die Planrechnung jedoch niemals W_PC.

Die Berechnung hängt nicht davon ab, welcher Baumzweig sichtbar ist, welcher
Fokus gewählt wurde oder welche Abschlussroute gerade aktiv ist. Auch das
Verlassen einer Route entfernt keine weiter gültige Plananrechnung. Geänderte
Mastery, Graph oder Persönlicher Lehrplan führen dagegen zu einer frischen
Bedarfsberechnung. Planänderungen passen den anschließenden Schnitt mit G an.
Ein fachlich nicht mehr tragender Erlass zählt nicht weiter.
Fehlende Berechnungsdaten werden als Einschränkung angezeigt, nicht still als
null implizit erreichte Ziele behandelt.

Unter **Konfiguration → Lerneinstellungen** steht die dauerhaft pro
SkillPilot-ID gespeicherte Option **„Nur explizit erreichte Lernziele zählen“**.
Sie steht neben der Wahl des Planzeitraums und ist standardmäßig **aus**, auch
bei bestehenden IDs ohne ausdrückliche Auswahl. Erst Speichern wirkt; Abbrechen
verwirft die Änderung. Hilfetext: „Für deinen Lernplan zählen normalerweise auch
implizit erledigte Ziele, die dort nicht mehr eigens bearbeitet werden müssen.
Mit dieser Einstellung zählen nur die direkt abgeschlossenen Ziele.“ Diese
Zählpräferenz gilt gemeinsam für
Cockpit, Coach und lernendenbezogene Planung. Sie ist getrennt von der
Einstellung „Prüfungsabkürzungen anbieten“: Sie startet oder beendet keine
Prüfung und ändert keine Zugangsberechtigung. Das Abschalten von neuen
Abkürzungsstarts allein nimmt bereits fachlich gültige Plananrechnung nicht
zurück. Bei einer fachlichen Rücknahme einer Regel wird hingegen neu bewertet.

Ein Wechsel der Zählpräferenz berechnet den aktuellen Status neu, verändert
aber weder G, Solltermine, S oder P noch Abschlussereignisse oder H. Auch eine
bereits vor Planerstellung wirksame implizite Erledigung zählt, sofern das Ziel
in G liegt, als vorhandene Planerfüllung und erzeugt keinen neuen Periodenabschluss.
Die vorhandenen **Plandetails** zeigen den vom Backend gelieferten Text einmal
je zusammengeführtem Fach, beispielsweise „Im Plan angerechnet: 3 Ziele, davon
2 implizit erledigt.“ Er erscheint nur bei auswertbarer inklusiver
Anrechnung mit mindestens einem noch nicht explizit gemeisterten,
implizit angerechneten Planziel. Ohne solchen Beitrag oder bei der
Einstellung „nur explizit“ entfällt er. Die kompakte Statuszeile bleibt
unverändert; globale Mastery-Zähler zählen weiterhin ausschließlich explizite
Ergebnisse.

Der vorhandene Pilot umfasst eine Prüfung und ein Vorbereitungsziel. Werden
beide vor dem Bestehen in G aufgenommen und benötigt kein weiterer offener
Verbraucher im vollständigen Persönlichen Lehrplan die Vorbereitung, ergibt
der erfolgreiche Versuch **I = 2**,
mit „nur explizit“ **I = 1**. In beiden Fällen bleibt über diese beiden Ziele
genau eine Mastery gespeichert. Der
[manuelle Prüfpfad](../../dev/assessment-gated-completion-pilot.md#plananrechnung-und-zahloption-am-pilot-prufen)
beschreibt Einrichtung, Umschalten und Reload.

## 4. Tages- und Wochenbasis

In der Lernkonfiguration im Cockpit wird pro SkillPilot-ID dauerhaft zwischen **1 Tag** und **1 Woche** gewählt. Ohne ausdrückliche Auswahl gilt **1 Woche**. Eine zuvor ausdrücklich gewählte Tagesbasis bleibt erhalten.

| Einstellung | Laufende Periode |
|---|---|
| **1 Tag** | Aktueller Kalendertag |
| **1 Woche** | Aktuelle Kalenderwoche von Montag bis Sonntag |

Die maßgebliche Zeitzone ist zunächst **Europe/Berlin**. Es gibt keine zusätzliche Einstellung für Wochenbeginn oder Zeitzone. Kalendergrenzen werden anhand lokaler Datumsgrenzen bestimmt.

Die Periodenbasis gilt einheitlich für Statusberechnung, Cockpit, Chat, lernendenbezogene Planung und planbezogene Zielauswahl. Sie ist keine lokale Anzeigeoption eines Clients.

### Die laufende Woche bildet eine Einheit

Im Wochenmodus wird das gesamte Wochenpensum betrachtet. Es kann zu Wochenbeginn, am Wochenende oder verteilt erfüllt werden.

**Vergangene Tage innerhalb der laufenden Woche erzeugen keinen zusätzlichen Vergangenheitsrückstand.** Erst beim Periodenwechsel wird ein verbleibendes Defizit entsprechend der Rechenregel in die neue Bewertung übernommen.

Angefangene Wochen bei Planbeginn oder Planende berücksichtigen nur die tatsächlich eingeplanten Ziele. Das Wochenpensum ist nicht pauschal das Siebenfache eines Tagespensums.

Ein Wechsel zwischen Tages- und Wochenbasis verändert weder Lernfortschritt noch Plantermine. Er verändert den zeitlichen Bezug der Auswertung und damit gegebenenfalls die Aufteilung zwischen laufendem Pensum und Rückstand.

## 5. Verbindliche Rechenregel pro Fach

### 5.1 Eingangsgrößen

Alle Mengen beziehen sich auf die gültige, bereinigte und zusammengeführte Planmenge **G** des Fachs.

| Größe | Bedeutung |
|---|---|
| **S** | Anzahl der Ziele aus G, die bis einschließlich zum **Ende der laufenden Periode** vorgesehen sind. |
| **P** | Anzahl der Ziele aus G, die innerhalb der laufenden Periode neu fällig werden. Dies ist das geplante Tages- oder Wochenpensum. |
| **I** | Anzahl der aktuell für den Plan erfüllten Ziele aus G gemäß Abschnitt 3.4: standardmäßig explizit erreicht oder wirksam erlassen, unabhängig vom vorgesehenen Termin. |
| **H** | Anzahl unterschiedlicher Ziele aus G mit einem verlässlich belegten expliziten Abschluss innerhalb der laufenden Periode, die aktuell weiterhin als gemeistert gelten. |

Im Wochenmodus reicht **S bis zum Ende der Woche**, nicht nur bis zum aktuellen Tag.

Für einen gültigen Datenstand gelten:

```text
0 ≤ P ≤ S ≤ |G|
0 ≤ H ≤ I ≤ |G|
```

Alle Größen sind ganzzahlig. Ungültige Eingaben werden nicht durch die nachfolgenden Rechenoperationen stillschweigend korrigiert.

### 5.2 Abschlussereignisse

Für **H** zählen tatsächliche, gültige Abschlussereignisse. Ein Importzeitpunkt, allgemeiner Änderungszeitpunkt oder die erneute Übermittlung eines bestehenden Beherrschungszustands ist kein neuer Abschluss.

Dasselbe Ziel zählt innerhalb einer Periode höchstens einmal. Bei Rücknahme der
Beherrschung entfällt sein expliziter Beitrag zu I und gegebenenfalls H. In I
kann es im Standardmodus weiterhin zählen, wenn es unabhängig davon im Plan
wirksam erlassen ist; auch abhängige Erlasse werden neu geprüft.

H bleibt eine zeitlich belegte Größe für explizite Abschlüsse. Ein Erlass
erzeugt keinen solchen Eintrag. Der Zeitpunkt einer Profilwahl, eines
Einstellungswechsels oder einer aktuellen Erlassberechnung ist kein
Abschlusszeitpunkt. Aus heutigen Mastery-Werten oder einer aktuell angezeigten
Erlassbegründung lässt sich der damalige Eintritt des Erlasses nicht verlässlich
rekonstruieren. Deshalb wird hierfür keine neue Ereignis- oder Ergebnishistorie
angelegt. Implizite Erledigung wirkt über I und die nachfolgende Mengenbilanz
auf das Pensum. Die zeitliche Aufteilung zwischen Rückstand und laufendem
Pensum bleibt von den belegten expliziten Abschlüssen abhängig.

Wird ein gestern bereits angerechnetes erlassenes Ziel heute regulär
gemeistert, bleibt sein Beitrag zu I eins; sein echter heutiger Abschluss darf
zu H beitragen. Es handelt sich dabei nicht um eine zweite Zielzählung in I.

Ein verlässlich bekannter Beherrschungszustand ohne verlässlichen Abschlusszeitpunkt darf zu **I**, aber nicht zu **H** beitragen.

Ein technischer Fehler beim Laden der Abschlussereignisse ist dagegen nicht gleichbedeutend mit **H = 0**. Sind erforderliche Daten nicht zuverlässig verfügbar, wird die Auswertung als eingeschränkt beziehungsweise nicht auswertbar behandelt.

### 5.3 Berechnung

```text
Rohsaldo                  = I − S

Noch zu deckendes Soll    = max(0, −Rohsaldo)

Offenes Periodenpensum    = min(
                               Noch zu deckendes Soll,
                               max(0, P − H)
                            )

Rückstand                 = Noch zu deckendes Soll
                            − Offenes Periodenpensum

Vorsprung                 = max(0, Rohsaldo)

Erfülltes Periodenziel    = P − Offenes Periodenpensum
```

Die Zurechnungsregel lautet:

> **Abschlüsse der laufenden Periode erfüllen zunächst deren Pensum. Darüber hinausgehende Leistung reduziert den Rückstand oder erzeugt Vorarbeit.**

Bereits vorhandene Vorarbeit kann das Periodenziel ebenfalls ganz oder teilweise abdecken.

**Das geplante Pensum P wird nicht aufgrund bereits beherrschter Ziele gekappt.** Ein vorgesehenes, durch Vorarbeit abgedecktes Pensum wird als erreicht dargestellt und nicht nachträglich als „kein Pensum“.

### 5.4 Statusrichtung

```text
behind     bei Rückstand > 0
ahead      bei Vorsprung > 0
on_track   ansonsten
```

Die Richtung wird nicht allein aus dem Vorzeichen des Rohsaldos bestimmt. Ein negatives Ergebnis kann vollständig zum noch laufenden Periodenpensum gehören.

### 5.5 Referenzfälle

| Situation | S / P / I / H | Ausgabe |
|---|---|---|
| Tagesbeginn ohne Rückstand | 13 / 3 / 10 / 0 | Tagesziel 0 von 3 · im Plan |
| Rückstand, ein Ziel heute erledigt | 13 / 3 / 9 / 1 | Tagesziel 1 von 3 · 2 Lernziele im Rückstand |
| Tagesziel erfüllt, Rückstand verbleibt | 13 / 3 / 12 / 4 | Tagesziel erreicht · 1 Lernziel im Rückstand |
| Über das Soll hinaus gelernt | 13 / 3 / 15 / 6 | Tagesziel erreicht · 2 Lernziele vorgearbeitet |
| Tagespensum durch Vorarbeit abgedeckt | 13 / 3 / 13 / 0 | Tagesziel erreicht · im Plan |
| Kein Tagespensum, Rückstand vorhanden | 10 / 0 / 8 / 0 | Heute kein Tagesziel · 2 Lernziele im Rückstand |
| Heute Prüfung bestanden, ein Vorbereitungsziel wirksam erlassen | 3 / 3 / 2 / 1 | Tagesziel 2 von 3 · im Plan |
| Dieselben zwei Planbeiträge bei größerem bisherigen Rückstand | 8 / 3 / 2 / 1 | Tagesziel 1 von 3 · 4 Lernziele im Rückstand |

Die letzten beiden Fälle zeigen die Unterscheidung: Beide Ziele zählen zu I,
aber nur der tatsächliche Prüfungsabschluss zählt zu H. Bei bestehendem
Rückstand kann die zusätzliche Plananrechnung daher zunächst diesen reduzieren.

Dieselbe Rechnung gilt im Wochenmodus mit entsprechend abgegrenzten Eingangsgrößen und Wochenformulierungen.

## 6. Verbindlicher Ausgabestandard

### 6.1 Eine Zeile pro Fach

Das gemeinsame Format lautet:

```text
<Fach>: <Periodenteil> · <Planstand>
```

Das Backend erzeugt die Textbestandteile und die vollständige Fachzeile. Aus den Fachzeilen und gegebenenfalls erforderlichen Auswertungshinweisen entsteht **`status.text`**.

Alle Fächer mit einem aktiven Lernplan werden in einer stabilen, kanalübergreifend gleichen Reihenfolge berücksichtigt. Es gibt keine gesonderte Chat-Kurzfassung und keine automatische Auswahl vermeintlich wichtiger Fächer durch das Sprachmodell.

Die Ausgabe bleibt durch kurze Fachzeilen und begrenzte Wiederholung kompakt.

### 6.2 Periodentext

Bei **P = 0** wird ein fehlendes Periodenpensum benannt. Bei **P > 0** wird entweder der erfüllte Anteil oder das erreichte Periodenziel angezeigt.

| Bedeutung | Deutsch | Englisch |
|---|---|---|
| Tagesfortschritt | Tagesziel N von P | Daily target N of P |
| Tagesziel erfüllt | Tagesziel erreicht | Daily target reached |
| Kein Tagespensum | Heute kein Tagesziel | No daily target today |
| Wochenfortschritt | Wochenziel N von P | Weekly target N of P |
| Wochenziel erfüllt | Wochenziel erreicht | Weekly target reached |
| Kein Wochenpensum | Diese Woche kein Wochenziel | No weekly target this week |

Der Zielstand kann durch Vorarbeit erfüllt sein. Deshalb darf aus „Tagesziel erreicht“ nicht automatisch „Heute P Lernziele abgeschlossen“ werden.

Eine Statistik tatsächlicher Abschlüsse ist eine eigenständige Aktivitätsauswertung und nicht Bestandteil dieser Statuszeile.

### 6.3 Planstandtext

| Bedeutung | Deutsch | Englisch |
|---|---|---|
| Rückstand | N Lernziele im Rückstand | N learning goals behind |
| Vorsprung | N Lernziele vorgearbeitet | N learning goals ahead |
| Weder Rückstand noch Vorsprung | im Plan | on track |

Einzahl und Mehrzahl werden im Backend korrekt behandelt.

Der Rohsaldo wird nicht zusätzlich ausgegeben. „Zusätzlich +N“ entfällt, da Mehrleistung bereits in der Mengenbilanz enthalten ist.

### 6.4 Sprache und Tonalität

Die Texte entstehen aus festen deutschen und englischen Vorlagen. Die Ausgabesprache wird explizit übergeben; ohne Angabe gilt die hinterlegte Lernsprache, ersatzweise Deutsch.

Ein Sprachwechsel verändert ausschließlich die Formulierung, nicht die Berechnung. Der KI-Coach übersetzt oder formuliert den verbindlichen Status nicht selbst.

Es gibt keine zusätzliche Alters- oder Tonalitätskonfiguration. Der Status bleibt sachlich; individuelle Ermutigung gehört in die anschließende Lernbegleitung.

### 6.5 Aktives Lernziel separat

**`status.text` enthält keine Ankündigung des aktiven Lernziels.**

Das Backend stellt die lokalisierte Ankündigung separat mit dem exakten lokalisierten Zieltitel bereit:

> **Dein aktives Lernziel: …**

Englisch:

> **Your active learning goal: …**

Diese Ankündigung erscheint einmal zu Beginn des entsprechenden Unterrichtsabschnitts. Eine zweite gleichlautende Überschrift entfällt.

Bei einer reinen Statusfrage werden weder eine neue Aufgabe begonnen noch eine Lernzielankündigung erzwungen. Formulierungen wie „trotzdem noch nicht abgeschlossen“ werden nicht verwendet.

## 7. Backend-Architektur und Datenvertrag

### 7.1 Ein gemeinsamer Baustein

Ein klar abgegrenzter Baustein im vorhandenen Backend berechnet den Status und erzeugt die Texte.

Berechnung und Textgenerierung werden intern nachvollziehbar getrennt, beispielsweise durch separate Funktionen. Dafür sind weder ein eigener Dienst noch eine allgemeine Regel-Engine erforderlich.

Die Statusberechnung ist eine Leseoperation. Sie verändert keine Pläne, Lernziele, Beherrschungswerte oder Fokuseinstellungen.

### 7.2 Gemeinsames Ergebnis

Das Backend stellt die für Darstellung und Lernsteuerung erforderlichen Informationen bereit:

| Bereich | Inhalt |
|---|---|
| Zeitbezug | Periodenbasis, Beginn, Ende, Zeitzone und Bezugszeitpunkt |
| Gesamtstatus | Auswertbarkeit und vollständiger `status.text`, ohne Gesamtbilanz |
| Je Fach | Fachkennung, Fachname, Textbestandteile, Fachzeile, Auswertbarkeit, gegebenenfalls Statusrichtung und die Cockpit-Projektion für die beiden Scheibenanzeigen |
| Lernsteuerung | Aktuelles Fach, Fortsetzungsmöglichkeiten und autorisierte nächste Handlungen |
| Unterrichtseinstieg | Aktives Lernziel und separate lokalisierte Ankündigung |

Für die bestehenden Plandetails kann je Fach zusätzlich `planCreditText`
geliefert werden. Das optionale Feld enthält ausschließlich die fertige
lokalisierte Erklärung der Plananrechnung aus Abschnitt 3.4; `null` oder ein
fehlendes Feld erzeugt keinen Zusatz. Es erweitert weder die Tacho-Texte noch
die reduzierte Chat-Projektion.

Die Eingangsgrößen und internen Rechenschritte bleiben für Berechnung, Tests,
Diagnose und Zielauswahl im Backend. Für die Scheibenanzeigen erhält das Cockpit
gezielt die abgeleiteten Zahlen und Nadelpositionen. Es berechnet weder Pensum
noch Planstand oder Skalierung selbst. Andere normale Statusausgaben können
weiterhin allein den gelieferten Text und die Statusrichtung verwenden.

#### Cockpit-Projektion je Fach

Die erste Scheibe erhält `periodGauge` mit `completed` (erfülltes
Periodenziel), `target` (**P**) und `needlePosition` im Bereich 0 bis 1. Ihr
Titel richtet sich nach der gespeicherten Periodenbasis: „Heute“ oder „Diese
Woche“. Die Zähleinheit sind **fortschrittswirksame Lernziele der bereinigten
Planmenge G**, nicht einzelne Übungsaufgaben im Chat. `completed` kann auch
durch früher erbrachte Vorarbeit größer als die Zahl der in der laufenden
Periode neu abgeschlossenen Ziele sein. Bei **P > 0** berechnet das Backend
`needlePosition = completed / target`. Bei **P = 0** liefert das Backend
`completed = 0`, `target = 0` und `needlePosition = null`; die Anzeige benennt
den fehlenden Tages- oder Wochenzielwert, statt einen Fortschrittsanteil zu
erfinden. Bei einem nicht auswertbaren Fach ist `periodGauge = null`.

Die zweite Scheibe trägt im Cockpit den Titel „Gesamt“ und erhält
`balanceGauge` mit `net`, `typicalAmount`,
`scaleLimit`, `needlePosition`, `severeBehind` und `strongAhead`. Hier gilt
`net = Vorsprung − Rückstand`, **nicht** `I − S`. Ein allein noch offenes Pensum
der laufenden Periode erzeugt dadurch keinen angezeigten Rückstand. Die
Neutralstellung `needlePosition = 0` bedeutet „im Plan“. Auf der positiven
Seite gilt `needlePosition = min(1, net / scaleLimit)`, auf der negativen
`needlePosition = max(−1, net / (scaleLimit + 1))`. Dadurch bleibt ein Rückstand
von genau 2 × M noch knapp vor dem linken Skalenende und erreicht es erst bei
mehr als 2 × M; Vorsprung erreicht das rechte Skalenende bereits bei genau
2 × M. Der gelieferte Planstatustext hält die tatsächliche Bilanz auch jenseits
der Skala sichtbar.
Bei einem nicht auswertbaren Fach ist `balanceGauge = null`.

Die typische Menge **M = `typicalAmount`** wird für das ausgewertete Fach aus
der **vollständigen**, gültigen, zusammengeführten und nach Ziel-ID
deduplizierten Planung bestimmt. Jedes fortschrittswirksame Ziel zählt mit
seinem frühesten gültigen Solltermin genau einmal. Das Backend gruppiert diese
Termine je nach gespeicherter Basis nach Berliner Kalendertag oder
Montag-bis-Sonntag-Kalenderwoche und bildet aus den **positiven**
Periodenpensen den Median. Bei gerader Anzahl wird das arithmetische Mittel der
beiden mittleren Werte auf die nächste ganze Zahl aufgerundet. Perioden ohne
Soll zählen nicht zur Stichprobe: Ein freier Tag macht die Skala daher nicht
null. **`scaleLimit = 2 × M`**. Fehlt in der gesamten Planung ein positives
Periodenpensum, ist M nicht belastbar bestimmbar und `balanceGauge = null`;
die fachliche Auswertbarkeit und der vorhandene Planstatustext bleiben davon
getrennt.

`severeBehind` gilt genau bei `net < −2 × M`, `strongAhead` genau bei
`net ≥ 2 × M`. Die erste Grenze ist also strikt, die zweite einschließlich.
Zwischen den Grenzen bewegt sich die Nadel proportional zum Saldo. Das
Backend liefert diese Schwellenentscheidung und beide Nadelpositionen zusammen
mit den zugrunde liegenden Fachwerten aus demselben Datenstand.

### 7.3 Reduzierte Chat-Projektion

Der Chat erhält den fertigen Status und die erforderlichen Steuerungsinformationen. Separate Plan-Zählfelder wie `dueToday`, `completedToday`, `openToday`, `openOverdue` oder `extraCompletedToday` werden nicht zusätzlich übertragen.
Auch `periodGauge` und `balanceGauge` sind ausschließlich Cockpit-Darstellungswerte und gehören nicht in die Chat-Projektion.

Die Reduktion gilt für die tatsächlich gesendeten Daten, nicht nur für deren Schema. Strukturierte Tool-Ergebnisse und gegebenenfalls zusätzlich übertragene Textdarstellungen derselben Daten verwenden die gleiche reduzierte Projektion.

Die Guidance enthält Handlungsanweisungen, aber keine eigene Statuszusammenfassung und keine Rechenregeln.

### 7.4 Konsistenz und Aktualität

Eine Auswertung verwendet einen konsistenten Stand von Plan, Beherrschung,
Abschlussereignissen, Konfiguration sowie dem vollständig aufgelösten
Persönlichen Lehrplan und seiner Voraussetzungshülle. Die Anrechnung wird gemeinsam im Backend berechnet,
nicht gesondert pro Oberfläche oder aus begrenzten UI-Erlasslisten.

Vorhandene Zustands- und Aktualisierungsmechanismen werden weiterverwendet. Eine zusätzliche Statushistorie oder eigenständige Statusversionierungsinfrastruktur wird nicht eingeführt.

Ein Periodenwechsel kann den Status auch ohne neuen Lernabschluss verändern. Deshalb müssen Bezugsdatum und Periodengrenzen bei der Auswertung und einer etwaigen Zwischenspeicherung berücksichtigt werden.

Neue Periodenwerte dürfen nicht mit einem alten Rückstand kombiniert werden.

## 8. Verhalten von Chat, Cockpit und Planung

### 8.1 Chat

Der Chat gibt den Backendstatus wörtlich aus: beim Lernstart oder Fortsetzen, auf eine Statusfrage und nach einer statusrelevanten Änderung.

Der Status erscheint höchstens einmal pro Antwort. Werden mehrere Änderungen verarbeitet, ist der abschließend gültige Stand maßgeblich. Unveränderte Statusangaben werden nicht vor jeder Aufgabe wiederholt.

Der Coach ergänzt keine eigene Mengenbilanz und keine widersprechende Zusammenfassung wie „Du hast nichts mehr offen“.

Nach der Statusausgabe folgt bei einer Lernfortsetzung der eigentliche Unterricht. Nach einem erfolgreichen Zielabschluss bleibt die didaktische Reihenfolge erhalten: Rückmeldung zum abgeschlossenen Ziel, gegebenenfalls aktualisierter Planstatus, anschließend Ankündigung und Einstieg in das nächste Lernziel.

Bei externen KI-Hosts ist die wortgetreue Wiedergabe eine zu prüfende Integrationsanforderung. Der deterministische Backendtext allein garantiert sie nicht. In einer direkt kontrollierten Oberfläche wird der Text unmittelbar gerendert.

### 8.2 Cockpit

Das Cockpit zeigt im Plan-Modus **je Fach zwei Scheiben mit sichtbaren Nadeln**:
das laufende Tages- oder Wochenpensum und den kumulierten Planstand. Die
Backendwerte `periodGauge` und `balanceGauge` steuern die Nadeln. Die erste
Scheibe zeigt „x von y Zielen“: Erreichtes ist blau, der noch offene Teil der
Skala grau. Die zweite Scheibe hat links einen klar roten Bereich für starken
Rückstand, eine neutrale graue Mitte und rechts einen klar grünen Bereich für
Vorarbeit. Ihre Nadel ist bei starkem Rückstand rot, bei Vorarbeit grün und
sonst neutral. Sie zeigt den gelieferten Planstatustext direkt unter
der Nadel, zum Beispiel „1 Lernziel im Rückstand“ oder „im Plan“; Rückstand
liegt links und Vorarbeit rechts. Die tatsächliche Bilanz bleibt bei einem
Skalenanschlag durch diesen Text sichtbar. Die Skalierungswerte und die
typische Menge dienen der Berechnung, erscheinen aber nicht als zusätzliche
Beschriftung der Scheibe. Die Fachzeile wiederholt weder das Periodenpensum
noch den Planstand.
Die beiden Scheiben eines Fachs sind gleich hoch. Fach, Bezugszeit, Zahlen und
Status müssen auch auf kleinen Bildschirmen eindeutig erkennbar sein. Die
Nadelposition und der Text tragen die Bedeutung zusätzlich zur Farbe.
Das „Heute“-Panel enthält weder einen zweiten Einstellungen-Knopf noch eine
Schaltfläche „Weiterlernen“: Einstellungen sind über die vorhandene
Seitenleiste erreichbar, und das aktive Lernziel steht im Lernbereich.

Ein fehlendes Periodenpensum und fehlende Auswertungsdaten sind unterschiedlich
darzustellen. Falls ausschließlich die typische Menge für die zweite Skala
fehlt, zeigt das Cockpit diese Grenze verständlich an, ohne die erste Scheibe
oder den verfügbaren Statustext als nicht auswertbar zu behandeln.

Lokale Rückstandsberechnungen, eigene Pensumskappungen und konkurrierende
Statusdarstellungen entfallen.

### 8.3 Planung und Details

Unter „Plandetails“ steht der Planzeitraum. Aktueller Abschnitt, nächster
Termin, Puffer und konkrete Zielzuordnungen erscheinen nur, wenn die jeweilige
Information tatsächlich vorhanden ist. Ein nicht geplanter Termin oder Puffer
wird nicht durch eine leere oder Null-Angabe ersetzt. Ein geplanter Puffer mit
null verbleibenden Werktagen bleibt sichtbar.

Die Erläuterung impliziter Plananrechnung aus Abschnitt 3.4 steht
ausschließlich in diesem vorhandenen Aufklapper. Das Backend liefert Wortlaut
und Zahlen; der Client leitet sie nicht aus Mastery oder Baumhinweisen ab.

Aus der normalen Statusdarstellung entfallen die parallele Bilanz „Bis heute insgesamt …“, der zusätzliche Mehrarbeitswert, der Erklärungstext zur Anrechnung nachgeholter Ziele und die frühere Anzeige „Tempo der letzten 7 Tage“. Die beiden Cockpit-Scheiben zeigen stattdessen die aktuelle backendseitige Fachbilanz.

Eine vorhandene lernendenbezogene Vorschau verwendet dieselbe Berechnung. Neue historische Rekonstruktionen, Simulationsmodelle oder umfassende Berichtsfunktionen gehören nicht zum Umfang dieses Vorhabens.

Eigenständige Informationen wie Unterrichtsabdeckung oder konkrete Prüfungsvoraussetzungen bleiben fachlich getrennt. Sie werden nicht aus der Mengenbilanz abgeleitet.

## 9. Zielauswahl und Fokussteuerung

Die gewählte Periodenbasis gilt auch für die planbezogene Zielauswahl.

Im Wochenmodus müssen geeignete Ziele der gesamten laufenden Woche bereits zu Wochenbeginn angeboten werden können. Eine Wochenanzeige mit ausschließlich tagesbezogener Auswahl ist nicht zulässig.

Das Backend bevorzugt fachlich zugängliche, früher eingeplante offene Ziele, danach geeignete Ziele der laufenden Periode. Weiteres Vorarbeiten bleibt möglich.

Fachliche Voraussetzungen und das gültige Personal Curriculum bleiben maßgeblich. Die Mengenbilanz ersetzt keine Prüfung konkreter Voraussetzungen. Ein bereits begonnenes, weiterhin zulässiges Lernziel wird nicht allein wegen eines Periodenwechsels verdrängt.

### Fokuswechsel im Rahmen der Planfortsetzung

Die vorhandenen Regeln für Fokusnavigation und Lernzustandsänderungen bleiben bestehen.

Eine autorisierte Fortsetzung eines bereits akzeptierten Lernplans darf den temporären Fokus auf den erforderlichen Planabschnitt setzen. Sie verändert weder das Personal Curriculum noch die konfigurierte Fächerauswahl.

Eine reine Statusabfrage löst keinen Fokuswechsel aus. Auch Pause, Stopp, ein aktiver Prüfungsmodus oder ein ungeklärter Fachwechsel werden nicht durch automatische Planfortsetzung übergangen.

Ein erreichtes Periodenziel sperrt weiteres Lernen nicht. Zusätzliche Arbeit wird jedoch nicht allein wegen eines vorhandenen Rückstands ungefragt begonnen. Eine bereits laufende zulässige Lerneinheit kann fortgesetzt werden; weitere Arbeit ist auf ausdrücklichen Wunsch möglich.

Dafür werden die vorhandenen Steuerungs- und Konfliktmechanismen genutzt, kein neues paralleles Navigationssystem.

## 10. Nicht auswertbare Situationen

Auswertbarkeit ist unabhängig von den Richtungen `behind`, `on_track` und `ahead`.

| Situation | Verhalten |
|---|---|
| Kein Lernplan eingerichtet | Eindeutige Meldung ohne erfundene Nullbilanz |
| Fach vollständig auswertbar | Normale Statuszeile |
| Fach durch einen ungültigen Teilplan nicht vollständig auswertbar | Keine scheinbar vollständige Fachbilanz |
| Andere Fächer weiterhin auswertbar | Deren gültige Statuszeilen bleiben sichtbar |
| Nur ein älterer Status verfügbar | Datenstand ausdrücklich kennzeichnen |

Ein Hinweis kann beispielsweise lauten:

> 1 Fachplan nicht auswertbar (Physik).

Fehlende oder fehlerhafte Daten werden nicht als `0 von 0`, erreichtes Periodenziel oder „im Plan“ interpretiert.

Unklare Altbestände oder widersprüchliche Pläne dürfen zunächst eine solche Einschränkung auslösen. Eine automatische Reparatur oder umfassende Sonderfallbehandlung ist nicht Bestandteil der Statusfunktion.

Weiterlernen kann trotzdem möglich sein. Die Verfügbarkeit einer Lernhandlung und die Verlässlichkeit der Planbilanz bleiben getrennt.

## 11. Umsetzungsumfang und Einführung

Die Umsetzung umfasst den gemeinsamen Rechenkern, feste Textvorlagen, die Tages-/Wochenkonfiguration, die erforderliche Anpassung der Zielauswahl sowie die Umstellung von Cockpit und Coach-Verträgen.

Vorhandene Datenstrukturen werden soweit möglich weiterverwendet. Nicht vorgesehen sind eine allgemeine Regel-Engine, zusätzliche Tonalitätsoptionen, individuelle Wochenstarts, Chat-spezifische Filter, neue historische Berichtssysteme oder eine dauerhafte Parallelpflege mehrerer Statusmodelle.

### Abgestimmte Vertragsumstellung

Die Entfernung bestehender Zählfelder ist eine ausdrückliche Vertragsänderung. Schema, tatsächliche Antworten, Server-Instructions, Coach-Richtlinien und Tests werden gemeinsam angepasst und entsprechend versioniert beziehungsweise freigegeben.

Dabei werden auch vollständige Folgezustände nach Fortschrittsänderungen, Planfortsetzung und Fachwechsel berücksichtigt.

Ein erforderlicher Übergangsadapter bleibt klein und befristet. Alte Felder erhalten nicht stillschweigend eine neue Bedeutung.

Die Einführung erfolgt abgestimmt, sodass Cockpit und Chat innerhalb derselben Nutzungskette nicht dauerhaft unterschiedliche Statusmodelle verwenden.

### Ablösung statt zusätzlicher Schicht

Die neue Berechnung ersetzt die bisherigen verteilten Statusregeln. Alte Berechnungen, überflüssige Felder und widersprüchliche Coach-Anweisungen werden entfernt.

**Die Umstellung soll die Zahl der fachlich entscheidenden Stellen reduzieren, nicht lediglich eine weitere Berechnung hinzufügen.**

## 12. Tests und Abnahme

Die Qualitätssicherung konzentriert sich auf den deterministischen Kern, die bekannten Fehlerfälle und die relevanten Übergänge.

| Prüfbereich | Wesentliche Anforderungen |
|---|---|
| **Ausgangsbasis** | Vorab beherrschte Ziele bleiben aus S, P, I und H ausgeschlossen; später beherrschte Planziele bleiben enthalten. |
| **Rechnung** | Alle Referenzfälle stimmen; Zielstand liegt zwischen null und P; Rückstand und Vorsprung sind nicht negativ und niemals gleichzeitig positiv. |
| **Fortschritt** | Bei unverändertem Plan und Zeitraum verschlechtert ein zusätzlicher gültiger Abschluss weder Zielstand noch Rückstand. |
| **Zählung und Ereignisse** | Keine Doppelzählung; korrekte Behandlung von Importen, fehlenden Zeitstempeln, Beherrschungsrücknahmen und Lesefehlern. |
| **Zeitbezug** | Tages- und Wochenwechsel, angebrochene Perioden, Zeitumstellungen und Wechsel der Basis funktionieren korrekt. |
| **Fächer und Pläne** | Eindeutige Zielzählung innerhalb eines Fachs; keine Verrechnung zwischen Fächern. |
| **Texte und Verträge** | Feste deutsche und englische Ausgaben; keine doppelte Lernzielankündigung; keine alten Zählfelder in der neuen Chat-Projektion. |
| **Lernsteuerung** | Wochenziele sind frühzeitig zugänglich; Fokuswechsel bleiben autorisiert; Status- und Pausenanfragen lösen keine Lernzustandsänderung aus. |
| **Integration** | Derselbe Datenstand, Zeitraum und dieselbe Sprache ergeben in Cockpit, Chat und Planung dieselbe Statusaussage. |

Dafür genügen gezielte Unit-, Vertrags- und Integrationstests sowie überprüfbare Chat-Testfälle. Eine neue umfassende Testplattform oder ein pauschales Ziel vollständiger Codeabdeckung ist nicht erforderlich.

### Abnahmekriterium

Die Umsetzung ist abgenommen, wenn der Planstatus für die unterstützten Fälle korrekt im Backend berechnet und formuliert wird, die Tages-/Wochenbasis bis in die Zielauswahl gilt und alle Ausgabekanäle dieselbe Aussage ohne eigene Nachberechnung übernehmen.

Zusätzlich muss das Gesamtsystem einfacher geworden sein:

> **Das Backend rechnet und formuliert. Das Cockpit zeigt an. Der Coach übernimmt den Status und unterrichtet.**
