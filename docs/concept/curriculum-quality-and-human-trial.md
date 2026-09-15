# Curriculum-Qualität: QS-Reifegrade und menschliche Erprobung
## Gesamtkonzept für SkillPilot

> **Status:** Abgestimmtes Zielkonzept; Umsetzung offen.

## 1. Ziel und Leitprinzipien

SkillPilot macht die Qualität eines Curriculums anhand zweier getrennt ausgewiesener Merkmale nachvollziehbar:

**QS-Reifegrad M0–M7:** Welche verbindlichen Qualitätsprüfungen sind für den aktuellen Inhalt vollständig erfüllt?

**Menschliche Erprobung:** Hat ein Curriculum-Champion die praktische Erprobung begonnen oder den gesamten ausgewiesenen Lernumfang erfolgreich durchlaufen und bestätigt?

> **Der Reifegrad beschreibt den erreichten Prüfstand. Der Champion-Status beschreibt die praktische Erprobung.**

Eine Fachzeile kann beispielsweise lauten:

> **Physik · M7 · Menschlich erprobt**

Damit wird ausgesagt, dass die vertiefte Curriculum-QS vollständig abgeschlossen ist und ein Champion den ausgewiesenen Umfang praktisch durchlaufen hat. Eine Garantie vollständiger Fehlerfreiheit wird daraus nicht abgeleitet.

### Einfachheit als Entwurfsziel

Die Umsetzung verwendet vorhandene Qualitätsberichte, Prüfregister, Champion-Zuordnungen und Abschlussnachweise. Sie schafft weder eine zweite QS-Pipeline noch ein allgemeines Zertifizierungs- oder Freigabesystem.

Zusätzliche Zustände, Einstellungen oder Prüfungen benötigen einen konkreten Nutzen. Seltene, nicht zuverlässig auswertbare Fälle dürfen mit einer verständlichen Einschränkung enden.

**Die bewusste Begrenzung betrifft den Funktionsumfang, nicht die Zuverlässigkeit der ausgewiesenen Ergebnisse.**

## 2. QS-Reifegrade M0–M7

Die Reifegrade bilden eine kumulative Folge. Eine höhere Stufe setzt die Anforderungen der niedrigeren Stufen voraus. Maßgeblich sind die zentral hinterlegten Prüfbedingungen und die dazugehörigen aktuellen Nachweise.

| Stufe | Fachliche Aussage |
|---|---|
| **M0** | Noch kein belastbarer QS-Grundstand. |
| **M1** | Quellen und extrahierte Lehrplanziele sind erfasst und rückverfolgbar. |
| **M2** | Quellenabdeckung, Bundesland-Sichten und relevante Kurszuordnungen sind konsistent. |
| **M3** | Die erforderlichen Lernwege sind geschlossen und auf atomarer Ebene sauber modelliert. |
| **M4** | Die erforderlichen Lernwege einschließlich ihrer terminalen Übungs- und Prüfungsziele sind geprüft. |
| **M5** | Schulgeeigneter Kern-QS-Stand: Die verbindlichen Kernprüfungen sind bestanden. |
| **M6** | M5 einschließlich geprüfter Memory-Entscheidungen, Zuordnungen und Sichtbarkeit. |
| **M7** | M6 einschließlich vollständig abgeschlossener vertiefter Curriculum-QS für sämtliche aktuellen `curricularAtomic`-Lernziele des betrachteten Fachs. |

M7 ist die höchste Stufe dieser QS-Leiter. Die menschliche Erprobung wird separat ausgewiesen und erzeugt keinen zusätzlichen Meilenstein M8.

Der Reifegrad ist eine Aussage über einen bestimmten Prüf- und Inhaltsstand. Er darf nicht allein aus einem früher erreichten Meilenstein oder einer manuell gesetzten Kennzeichnung übernommen werden.

## 3. Verbindliche Definition von M7

### 3.1 Vollständiger Abschluss der fünf Prüfgates

M7 verlangt, dass jedes aktuelle `curricularAtomic`-Lernziel des betrachteten Fachs alle fünf Gates erfüllt.

| Gate | Erforderlicher Nachweis |
|---|---|
| **D – Beschreibungen** | Zwei unabhängige Beschreibungsreviews mit abgeschlossener Bewertung und geklärten Entscheidungen, gebunden an den gültigen Inhalt und Kontext. |
| **P – Verständnisnachweise** | Ein aktuelles, vollständig geprüftes `positive-understanding-evidence-v2`-Profil mit wahrheitsgemäß ausgewiesenem Freigabestatus. |
| **A – Atomizität** | Eine aktuelle fachliche Entscheidung zur Abgrenzung und atomaren Struktur des Lernziels. |
| **M – Memory** | Eine aktuelle, begründete Entscheidung zur Memory-Notwendigkeit und gegebenenfalls zu den zugehörigen Inhalten. |
| **V – Visualisierungen** | Eine aktuelle fachliche Bildprüfung mit gültigen Inhalts- und Asset-Bindungen beziehungsweise eine nach den geltenden Bildregeln ausdrücklich zulässige fachliche Ausnahme. |

Die vollständigen Ziele werden als **Schnittmenge der fünf Gates** bestimmt. Einzelne Gate-Zähler werden weder addiert noch gemittelt.

```text
M7 erreicht =
    M6 weiterhin erfüllt
    UND aktuelle Zielmenge eindeutig bestimmt und nicht leer
    UND jedes aktuelle curricularAtomic-Ziel erfüllt alle fünf Gates
    UND erforderliche Abschlussprüfungen bestanden
    UND keine offenen M7-relevanten Blocker
```

Die Berechnung erfolgt ausschließlich aus dem zentralen Fünf-Gate-Bericht und den zugehörigen Prüfungen. Es gibt keine zweite, unabhängig nachgebildete M7-Rechnung.

### 3.2 Bedeutung von 100 %

**100 % bedeutet vollständige Abdeckung des festgelegten QS-Verfahrens.** Es bedeutet weder garantierte Fehlerfreiheit noch vollständig nachgewiesene Unterrichtswirksamkeit.

Maßgeblich sind die aktuellen Ziel-IDs und ihre gültigen Nachweise. Historische Gesamtzahlen, gerundete Prozentangaben oder ein erfolgreicher Prüflauf allein reichen nicht aus.

Mathematik, Physik und weitere Fächer erreichen M7 unabhängig voneinander. Ein vollständig geprüftes Fach wartet nicht auf den Abschluss anderer Fächer.

Eine teilweise abgeschlossene Prüfung kann als Fortschritt angezeigt werden, beispielsweise:

> **M6 · Vertiefte QS: 472 von 478 Lernzielen abgeschlossen**

Der Meilenstein bleibt bis zur vollständigen Erfüllung M6. Es entstehen keine zusätzlichen Zwischenmeilensteine.

### 3.3 Abgrenzung zu menschlichen Freigaben

M7 bestätigt den Abschluss des zugelassenen vertieften QS-Verfahrens. Es erzeugt keine menschlichen Freigaben.

Ein zulässiger, vollständig geprüfter KI-Kandidat kann ein maschinelles Gate erfüllen, während sein Datensatz weiterhin ausdrücklich `needs_human_review` ausweist. Daraus darf kein menschlich freigegebener Inhalt werden.

Wo eine konkrete menschliche Entscheidung verpflichtend ist, bleibt diese Anforderung bestehen. Eine noch ausstehende zwingende Freigabe darf nicht durch Umbenennung oder mechanische Aktualisierung eines Nachweises erledigt werden.

## 4. Umgang mit Bildern und vorhandenen Nachweisen

Bilder sind Bestandteil der vertieften QS, aber kein eigenständiger höchster Reifegrad.

**Gute vorhandene Inhalte und gültige Nachweise bleiben erhalten.** Unveränderte Ziele werden nicht allein wegen eines neuen Prüflaufs erneut bewertet. Bei Änderungen werden gezielt die betroffenen Ziel-, Quellen-, Kontext-, Seiten- und Bildbindungen geprüft.

Für Bilder gelten folgende Grundsätze:

| Grundsatz | Bedeutung |
|---|---|
| **KEEP als Standard** | Ein gutes vorhandenes Bild wird nicht allein wegen seines Generators oder Alters ersetzt. |
| **Fachliches Urteil vor Herkunft** | Entscheidend sind Korrektheit, geeignete Darstellung und Einordnung in das Curriculum. |
| **Erzeugung ist keine Freigabe** | Ein neues Bild benötigt eine tatsächliche Prüfung und dokumentierte Entscheidung. |
| **Inhaltsbindung statt Hashkosmetik** | Geänderte Inhalte werden fachlich geprüft; das bloße Nachführen eines Hashes genügt nicht. |
| **Menschlicher Fehlerbefund hat Vorrang** | Ein ausdrücklich festgestellter Fehler wird nicht durch ein positives KI-Urteil überstimmt. |

Die geltenden Bildregeln bestimmen Erzeugungswege und zulässige Ausnahmen. Eine technische Providergrenze oder eine aufgeschobene notwendige Korrektur ist keine fachlich abgeschlossene Ausnahme und blockiert den betreffenden M7-Abschluss.

Bereits vorhandene menschliche Bildfreigaben und historische Reviewartefakte bleiben als Nachweise erhalten. Sie werden nicht rückwirkend umgedeutet.

## 5. Menschliche Erprobung durch Curriculum-Champions

Die menschliche Erprobung besitzt drei fachliche Zustände:

| Zustand | Voraussetzung | Sichtbare Bezeichnung |
|---|---|---|
| **Nicht begonnen** | Kein bestätigter Erprobungsbeginn für den betrachteten Umfang. | Basisstatus aus dem QS-Reifegrad |
| **In Erprobung** | Ein zugeordneter Champion hat die praktische Erprobung bestätigt begonnen. | **Menschliche QS läuft** |
| **Abgeschlossen** | Ein Champion hat den gesamten ausgewiesenen Umfang erfolgreich durchlaufen und den Abschluss bestätigt. | **Menschlich erprobt** |

### 5.1 Beginn der Erprobung

Ein zugeordneter Curriculum-Champion bestätigt den Beginn für einen eindeutig bezeichneten Umfang, beispielsweise über **„Erprobung beginnen“**.

Daraus leitet das System den Status automatisch ab. Eine zusätzliche manuelle Änderung des Qualitätsbadges ist nicht erforderlich.

Eine Registrierung, ein Seitenaufruf oder bereits vorhandene Beherrschungswerte allein belegen keinen Erprobungsbeginn.

Die reguläre schulische Champion-Erprobung setzt mindestens den Kern-QS-Stand M5 voraus. Sie muss nicht auf M7 warten. Eine praktische Erprobung und die weitere maschinelle Qualitätssicherung können parallel stattfinden.

### 5.2 Voraussetzungen für „Menschlich erprobt“

Der Abschlussstatus verlangt vier Bedingungen:

| Bedingung | Konkretisierung |
|---|---|
| **Ein vollständiger Durchlauf** | Mindestens ein zugeordneter Champion hat den gesamten ausgewiesenen Prüfumfang erfolgreich durchlaufen. |
| **Tatsächliche Erprobungsnachweise** | Die Abschlüsse stammen aus belegter praktischer Bearbeitung, nicht lediglich aus importierter oder manuell gesetzter Beherrschung. |
| **Keine bekannten blockierenden Befunde** | Erkannte blockierende fachliche, didaktische oder technische Probleme sind behoben und erforderlichenfalls nachgeprüft. |
| **Einmalige Abschlussbestätigung** | Der Champion bestätigt die abgeschlossene Erprobung des ausgewiesenen Umfangs. |

Die Teilabschlüsse verschiedener Champions werden nicht zu einem vermeintlich vollständigen Durchlauf einer Person zusammengezählt. Ein vollständiger Durchlauf eines Champions genügt; mehrere verpflichtende vollständige Durchläufe sind nicht erforderlich.

Bereits dokumentierte tatsächliche Erprobungsabschlüsse können übernommen werden, soweit sie zum gültigen Umfang und Inhaltsstand passen. Der Beginn eines neuen Erprobungsvorgangs erzwingt keinen pauschalen Neustart.

### 5.3 Automatischer Abschluss mit kurzer Bestätigung

Sobald die vorhandenen Nachweise die vollständige Abdeckung belegen, bietet das System den Abschluss an:

> **Alle Ziele durchlaufen. Erprobung abschließen?**  
> Ich bestätige, dass ich den ausgewiesenen Umfang praktisch erprobt habe und keine bekannten blockierenden Befunde offen sind.

Nach der Bestätigung setzt das System den Status auf **„Menschlich erprobt“**.

Eine zusätzliche manuelle Freigabe jedes einzelnen Ziels ist nicht erforderlich. Kleinere Verbesserungsvorschläge dürfen offen bleiben; blockierende Befunde nicht.

Der Abschluss eines Lernziels schließt einen dazu gemeldeten Fehler nicht automatisch. Lernfortschritt und Fehlerbehebung sind unterschiedliche Nachweise.

### 5.4 Aussagekraft und Grenze

„Menschlich erprobt“ bedeutet:

> **Ein Curriculum-Champion hat den gesamten ausgewiesenen Lernumfang im tatsächlichen Lernablauf erfolgreich durchlaufen. Bei jedem Ziel bestand die Gelegenheit, auftretende Probleme zu erkennen und zurückzumelden.**

Der Status bestätigt nicht, dass jede mögliche Aufgabe, jeder alternative Lernweg, jede Gerätevariante oder jede denkbare KI-Antwort geprüft wurde. Er ist ein Nachweis vollständiger Zielabdeckung eines praktischen Durchlaufs, kein Fehlerfreiheitssiegel.

## 6. Prüfumfang und Gültigkeit

### 6.1 Eindeutiger Umfang

Jeder QS- und Erprobungsnachweis besitzt einen eindeutig bezeichneten Umfang.

Eine vollständig erprobte Sicht **„Physik, Hessen, Sekundarstufe II“** ist nicht automatisch ein Nachweis für sämtliche Physikinhalte aller Bundesländer und Schulstufen.

Für M7 ist der Nenner die aktuelle `curricularAtomic`-Zielmenge des betrachteten Fachs beziehungsweise ausdrücklich ausgewiesenen QS-Umfangs. Für die Champion-Erprobung zählt der tatsächlich vorgesehene Lernumfang einschließlich seiner verbindlichen Lern- und Prüfungsstationen.

Diese beiden Mengen werden nicht stillschweigend gleichgesetzt. Technische Hilfsknoten und sämtliche denkbaren Aufgabenausprägungen erzeugen keine zusätzlichen Erprobungspflichten.

Ein Fach erhält die Kennzeichnung **„Menschlich erprobt“** nur dann ohne Einschränkung, wenn sein gesamter ausgewiesener Umfang abgedeckt ist. Teilnachweise werden als solche bezeichnet.

### 6.2 Änderungen am Curriculum

Nachweise gelten für den dokumentierten Inhalt und Kontext. Relevante Änderungen erfordern eine gezielte Neubewertung der betroffenen Teile.

Für M7 gilt: Sind nicht mehr alle aktuellen Ziele streng abgeschlossen, wird der aktuell belegte niedrigere Meilenstein ausgewiesen. Der historische M7-Nachweis bleibt erhalten.

Für die menschliche Erprobung gilt: Neue oder fachlich wesentlich geänderte Ziele benötigen eine ergänzende Erprobung. Die übrigen gültigen Nachweise bleiben bestehen. Rein kosmetische Änderungen lösen keinen vollständigen Neustart aus.

Ein historischer Abschluss darf nicht uneingeschränkt als Erprobung eines inzwischen veränderten aktuellen Curriculums erscheinen.

### 6.3 Pause und Beendigung

Ein bestätigter Abschluss bleibt als Nachweis erhalten, auch wenn der Champion seine Tätigkeit beendet.

Bei einer pausierten oder abgebrochenen, noch nicht abgeschlossenen Erprobung darf das aktive Label **„Menschliche QS läuft“** nicht dauerhaft stehen bleiben. Die begonnenen Nachweise bleiben erhalten; der Hauptstatus fällt auf den zutreffenden Basisstatus zurück. Details können den bisherigen Erprobungsstand nennen.

Dafür ist keine weitere öffentlich sichtbare Qualitätsstufe erforderlich.

## 7. Darstellung und Farbgebung

### 7.1 Meilensteine: eine geordnete Grau-Grün-Skala

Die Meilensteine verwenden eine einheitliche, stufenweise Aufwertung von Grau nach Grün.

| Stufe | Farbcharakter |
|---|---|
| **M0** | Neutrales Hellgrau |
| **M1** | Grau mit sehr schwachem Grünanteil |
| **M2** | Helles Graugrün |
| **M3** | Gedämpftes Grün |
| **M4** | Deutliches, zurückhaltendes Grün |
| **M5** | Mittleres Grün |
| **M6** | Kräftiges Grün |
| **M7** | Sattes, dunkles Grün |

Die Skala beschreibt eine Rangfolge, keine Fehlerampel. Es gibt keinen Wechsel über Gelb und Orange zu Grün und anschließend zu Blau.

Die acht Farbstile werden einmal zentral definiert und in Verzeichnis, Legende und Qualitätsdashboard wiederverwendet. Eine dynamische Farbberechnung ist nicht erforderlich.

Stufennummer und Beschreibung bleiben sichtbar beziehungsweise zugänglich. Farbe ist niemals der einzige Bedeutungsträger. Die Darstellung muss im hellen und dunklen Modus gut lesbar sein.

### 7.2 QS-Status: getrennte Aussage über Erprobung

| Status | Voraussetzung | Darstellung |
|---|---|---|
| **Experimentell** | Kern-QS-Stand M5 nicht erreicht | Zurückhaltender Warnhinweis |
| **Maschinelle QS** | Mindestens M5; kein gültiger laufender oder abgeschlossener menschlicher Erprobungsnachweis | Orange |
| **Menschliche QS läuft** | Zulässige praktische Erprobung ist aktiv | Zurückhaltendes Grün |
| **Menschlich erprobt** | Vollständiger gültiger Erprobungsnachweis und Abschlussbestätigung | Kräftiges Grün mit Abschlusssymbol |

Die Bezeichnung **„Maschinelle QS“** behauptet nicht, dass M7 bereits erreicht ist. Den genauen Prüfstand zeigt der danebenstehende Meilenstein.

Ein grünes M7-Badge kann daher mit dem Status „Maschinelle QS“ kombiniert sein: Das vertiefte QS-Verfahren ist vollständig abgeschlossen, die menschliche Erprobung aber noch nicht begonnen.

### 7.3 Übergeordnete Sammlungen

Eine Sammlung wie „Gymnasium (DE)“ erhält kein pauschales menschliches Qualitätssiegel, nur weil einzelne Fächer erprobt werden.

Maßgeblich sind die Fachzeilen. Eine übergeordnete Anzeige darf sachlich zusammenfassen, beispielsweise:

> **Menschliche QS in 2 Fächern**

Sie überträgt weder den höchsten Meilenstein noch einen einzelnen Champion-Nachweis auf sämtliche enthaltenen Curricula.

## 8. Technische Umsetzung

### Eine gemeinsame Ableitung

Der Reifegrad wird aus dem zentralen Qualitätsbericht abgeleitet. Der Erprobungsstatus wird aus der Champion-Zuordnung, dem bestätigten Beginn, den vorhandenen Abschlussnachweisen und der Abschlussbestätigung abgeleitet.

Fest hinterlegte grüne Fachlisten oder manuell gepflegte Qualitätsabzeichen sind keine fachliche Statusquelle.

Alle Oberflächen verwenden dieselben abgeleiteten Zustände, Bezeichnungen und Farbstile. Sie führen keine eigenen Qualitätsentscheidungen durch.

### Vorhandene Strukturen verwenden

Die Umsetzung ergänzt nur die für Beginn, Umfang und Abschluss tatsächlich fehlenden Informationen. Vorhandene Register, Lernabschlussdaten und Befundnachweise werden genutzt.

Es entstehen keine zusätzliche Review-Plattform, kein zweites Lernfortschrittssystem und keine allgemeine Freigabe-Engine.

Wo vorhandene Daten keinen vollständigen praktischen Durchlauf belegen, wird kein Abschluss behauptet. Unklare Daten werden nicht durch private Chat-Auswertung oder nachträglich erfundene Nachweise ergänzt.

### Datenschutz und Änderungsgrenzen

Öffentliche Qualitätsanzeigen enthalten nur die erforderlichen Angaben zu Umfang, Prüfstand und Erprobungsstatus. Private Lernenden-, Session- und Chatdaten bleiben außerhalb öffentlicher QS-Artefakte.

Die QS-Neudefinition erzeugt keine Freigabe zur Abschwächung bestehender Runtime-, Datenschutz-, Sicherheits- oder Plugin-Schutzregeln.

## 9. Einführung und Abnahme

Definitionen, Statusgenerator, Meilensteinprüfungen, Champion-Ableitung, Legenden und Darstellungen werden gemeinsam umgestellt.

Ein vorhandener M7-Eintrag wird anhand der verbindlichen M7-Bedingung neu bewertet. Eine Bildfreigabe allein reicht dafür nicht aus. Historische Artefakte behalten ihre damalige Bedeutung und werden nicht umgeschrieben.

Die Tests konzentrieren sich auf die entscheidenden Fälle:

| Prüfbereich | Erwartung |
|---|---|
| **M7-Vergabe** | Nur bei gültigem M6 und vollständigem strengen Abschluss aller aktuellen Ziele. |
| **Zähler und Gates** | Keine Mittelwerte, Rundungsfreigaben oder Anerkennung lediglich aufgeschobener notwendiger Arbeiten. |
| **Freigabestatus** | KI-Nachweise werden nicht als menschliche Freigaben ausgegeben; ausdrückliche Fehlerbefunde bleiben wirksam. |
| **Erprobungsbeginn** | Bestätigter Beginn löst den Status aus; Registrierung oder importierte Beherrschung allein nicht. |
| **Erprobungsabschluss** | Vollständiger belegter Durchlauf eines Champions, keine bekannten Blocker und einmalige Bestätigung erforderlich. |
| **Umfang und Änderungen** | Teilnachweise werden nicht ausgeweitet; relevante Änderungen entwerten nur betroffene Nachweise. |
| **Darstellung** | Gleiche Zustände, Texte und Grau-Grün-Reifeskala in allen Oberflächen. |
| **Sammelansichten** | Keine pauschale Qualitätsaufwertung durch einzelne reife oder erprobte Fächer. |

**Die Umsetzung ist abgenommen, wenn der aktuelle QS-Prüfstand und die menschliche Erprobung getrennt, automatisch und nachvollziehbar ausgewiesen werden – mit M7 als Abschluss der vertieften Curriculum-QS und „Menschlich erprobt“ als Nachweis eines vollständigen bestätigten praktischen Durchlaufs.**
