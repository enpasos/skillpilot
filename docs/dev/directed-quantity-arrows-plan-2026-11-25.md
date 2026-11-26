# Pfeile gerichteter Größen: Entscheidung und Umsetzungsplan, 25. November 2026

**Stand: 25. November 2026, 22:45 MEZ. Arbeitsgrundlage.** Am Katalog ist noch
nichts geändert. Als geliefert gilt nur, was die Tabelle in Abschnitt 6 so
benennt; den Integrationsstand führt das
[Management Summary](stage-plan-management-summary.md).

## 1. Entscheidung

Der Product Owner hat am 25. November 2026 festgelegt, dass ein Gedanke in der
Physik ausdrücklich gelehrt und in jeder Phase der Anwendung wieder vermittelt
wird:

> Ein Pfeil für Kraft, Geschwindigkeit oder eine andere gerichtete Größe, den
> man in eine Skizze des Ortsraums zeichnet, ist eine Eigenschaft des Punktes,
> an dem er sitzt. So wie ein Punkt eine Temperatur haben kann, gehört zu ihm
> auch ein Vektor. Der Raum, in dem dieser Vektor liegt, ist nicht der Ortsraum
> der Skizze. Ihn trotzdem dort einzuzeichnen, ist praktisch.

Wer das nicht verstanden hat, zeichnet Pfeile an beliebige Stellen, ohne zu
wissen, was er tut. Für die Arbeit an Zielen, Bildern, Karten und Aufgaben
heißt das:

- Der Pfeil setzt an dem Körper oder Punkt an, zu dem die Größe gehört.
- Seine Richtung ist die Richtung in der Skizze. Seine Länge folgt einem
  eigenen Maßstab in der Einheit der Größe und ist keine Strecke im Bild.
- Die Pfeilspitze bezeichnet keinen Ort.
- Addiert werden nur Pfeile derselben Größe mit demselben Bezug: Kräfte auf
  denselben Körper oder dasselbe benannte System, Feldstärken am selben Punkt,
  Impulse der Körper eines benannten Systems. Die Summe gehört zu diesem
  Bezug. Eine getrennte Rechenkonstruktion neben der Skizze (Spitze an Fuß)
  ist zulässig und als solche gekennzeichnet.
- Felder sind der allgemeine Fall: an jedem Punkt eine Größe, bei der
  Temperatur eine Zahl, bei der Feldstärke ein Pfeil.

Er folgt dabei der Empfehlung aus vier Bausteinen (Abschnitt 3) und hat
verlangt, das Vorhaben gut einzuplanen.

## 2. Ausgangslage

Gemessen auf `main` am Commit `5c8e3ed065`:

| Befund | Wert |
|---|---:|
| Atomare Physikziele | 732 |
| davon mit Pfeil oder Vektor in Titel oder Beschreibung | 23 |
| davon mit einer Aussage, was ein Pfeil in einer Ortsskizze bedeutet | 0 |
| Zielbilder in Physik | 525 |
| Physiksichten | 90 |
| davon mit mindestens einem Ziel, das Pfeile verwendet | 90 |

Die 90 Sichten teilen sich in 18 Sichten der Sekundarstufe I, 34 der
Sekundarstufe II und 38 stufenübergreifende. In 32 der 34 Oberstufensichten
kommt keines der drei Unterstufenziele mit Pfeilen vor (`41d35667` Kräfte
maßstäblich zusammensetzen, `d61ea362` Geschwindigkeitspfeile aus einer
Bildfolge, `67ffd0f0` Angriffspunkt und Wirkungslinie). Ein neues frühes Ziel
erreicht deshalb jede Sicht, in diesen 32 als Vorbereitung mit eigenem Lernort.

Zwei Umstände verschärfen die Lücke:

- Die Verständnisprofile der Ziele sind Prüfnachweise und erreichen den Coach
  nicht. Lernende begegnen dem Gedanken nur über Zieltext, Bild, Karten,
  Aufgaben und das Material der Einheiten.
- Der Vorschlag zur Vektorleiter in der Mathematik führt Vektoren als
  Verschiebungen ein, also als Pfeile, die tatsächlich im Ortsraum liegen. Die
  Physik zeichnet dann Pfeile anderer Größen in dasselbe Bild.

## 3. Die vier Bausteine

1. **Ein eigenes frühes Physikziel.** Es lehrt und prüft das Lesen und Setzen
   solcher Pfeile, vor dem ersten Ziel, das Pfeile maßstäblich zeichnet.
   Entwurf für die Knotenprüfung: „Die lernende Person kann in einer Skizze
   trennen, was die Lage der Körper zeigt und was ein Pfeil über eine
   gerichtete Größe aussagt: Sie setzt den Pfeil an den Körper oder Punkt, zu
   dem die Größe gehört, bestimmt seinen Betrag mit dem Pfeilmaßstab in der
   Einheit der Größe und begründet, dass Pfeillänge und Pfeilspitze keine
   Strecke und keinen Ort in der Skizze angeben.“
2. **Derselbe Gedanke bei jeder neuen Pfeilart.** Der Text jedes Ziels, das
   eine neue gerichtete Größe als Pfeil einführt, nennt, wessen Eigenschaft
   sie ist und dass ihr Maßstab ein eigener ist: Geschwindigkeit, Kräfte an
   einem Körper, Impuls, Geschwindigkeit und Beschleunigung auf der Kreisbahn,
   Feldstärke. Jedes dieser Ziele erreicht das Ziel aus Baustein 1 über
   `requires`.
3. **Ein Kriterium für Bilder, Karten und Aufgaben.** Der Pfeil setzt an
   seinem Körper oder Punkt an, eine Legende nennt Größe und Pfeilmaßstab,
   Ortsmaßstab und Pfeilmaßstab sind sichtbar getrennt, und keine Pfeilspitze
   endet auf einem anderen Gegenstand, wo das wie eine Berührung wirkt.
   Aufgaben, die Pfeile verlangen, bewerten „am richtigen Körper angesetzt,
   Maßstab angegeben“.
4. **Die Brücke in der Mathematik.** Der Verschiebungspfeil ist der Sonderfall,
   in dem die Größe selbst eine Ortsänderung ist und Pfeilmaßstab und
   Bildmaßstab zusammenfallen.

## 4. Arbeitspakete

| Paket | Inhalt | Ausführung | Abnahme |
|---|---|---|---|
| **A0 Kriterium sofort** | Baustein 3 gilt für jedes neue oder überarbeitete Bild, jede Karte und jede Aufgabe. Regel in `AGENTS.md`. | Claude; Codex bei den Bildern | Übernahmeprüfung jedes Pakets |
| **A1 Knotenprüfung** | Zieltext in beiden Sprachen, Atomarität und Prüfbarkeit; Verhältnis zu `67ffd0f0`; Quellenstellen aller 16 Länder aus den amtlichen PDFs; vollständiges Inventar der Ziele, Bilder, Karten und Aufgaben mit Pfeilen; Kanten mit Minimalitätsprüfung auf einer Arbeitskopie; Lernort in jeder der 90 Sichten; Abschlussweg in jeder Unterstufensicht; Kosten. Nur lesend. | Codex mit zwei unabhängigen Prüfmodellen | Claude entscheidet den Zuschnitt, der Product Owner beurteilt das Ergebnis |
| **A2 Katalogpaket Pfeilziel** | Neues Ziel, Kanten, Qualitätsnachweise, Bild, Karten, Abschlussaufgabe wo nötig, Sichten aller Länder, Zählbindungen. | Katalogentwurf Claude, Bindungen Codex | Unabhängige Gegenprüfung, Physik bleibt M7, CI |
| **A3 Wiederaufnahme je Phase** | Baustein 2 und 3 für die Ziele einer Phase: Zieltext, Bild, eine Karte, Aufgabenkriterium. Drei Teile, jeweils mit der ohnehin geplanten Durchsicht der Einheiten (Abschnitt 5). | Codex und Claude wie bei A2 | je Teil wie A2 |
| **A4 Mathematik-Brücke** | Baustein 4 im Text der ersten Stufe der Vektorleiter; das Physikziel setzt sie voraus, wo die Reihenfolge eines Landes das erlaubt. | mit dem Paket Vektorleiter | mit diesem Paket |
| **A5 Dauerhafte Sicherung** | Eine Prüfregel im bestehenden Prüfwerk: Jedes Physikziel, das Pfeile verwendet, hat einen Weg zum Pfeilziel und ein gegen das Kriterium geprüftes Bild. Die Kennzeichnung der Ziele kommt in einen vorhandenen Nachweis, nicht in eine Nebendatei. | Entwurf in A1, Einführung mit A2 | Negativtest der Regel |

Die drei Teile von A3:

| Teil | Phase | Ziele mit neuer Pfeilart |
|---|---|---|
| A3a | Mechanik der Unterstufe und der Einführungsphase | `d61ea362` Geschwindigkeitspfeile, `41d35667` Kräfte an einem Körper, `68c90ba6` Bezugssysteme, `0fee53f2` Geschwindigkeit beim Wurf, `a94cfe1c` Newtons zweites Axiom, `839ecc8f` Impulserhaltung und das neue Ziel zum Gesamtimpuls |
| A3b | Kreisbewegung und Gravitation | `e918b31f` Zentripetalkraft, `60211ac1` Planetenbewegungen, `156edddc` Gravitationsfeld als Feldgröße |
| A3c | Elektrische und magnetische Felder | `4ca83b3f` und `455c65ca` Superposition elektrischer Felder, `0f6b798b` Feldlinienbilder, `c6355a22` Kraft auf Leiter, `8c9394cb` Lorentzkraft |

Die Listen stammen aus einer Stichwortsuche und der Durchsicht der Titel. Das
vollständige Inventar ist Teil von A1.

## 5. Einordnung in die laufende Arbeit

1. **E.2, Schritt 2, Teil 1 abschließen** (Impuls und Newtons zweites Axiom).
   Die neuen Impulsbilder sind bereits nach dem Kriterium überarbeitet.
2. **A1**, sobald Teil 1 übergeben ist. Parallel entwirft Claude Teil 2 von
   E.2 (Herleitung der kinetischen Energie), der keine Pfeile betrifft.
3. **A2.**
4. **E.2, Schritt 2, Teil 3** (Kräftezerlegung, schiefe Ebene, Reibung) baut
   auf A2 auf: Das Ziel zur Kräftezerlegung setzt das Pfeilziel voraus, und
   seine Bilder folgen dem Kriterium. Dieser Teil ist zugleich der erste
   Schnitt von A3a.
5. **A3a vervollständigen**, dann **A3b** mit der Durchsicht von E.3 und E.5
   und **A3c** mit der Durchsicht der Felder in der Qualifikationsphase.
6. **A4** mit der Vektorleiter. Ihr Zuschnitt liegt dem Product Owner noch zur
   Beurteilung vor; A1 bis A3 warten nicht darauf.

Daneben laufen unabhängig die Neuextraktion der Physikquellen und
[Issue #205](https://github.com/enpasos/skillpilot/issues/205).

## 6. Stand

| Paket | Stand am 25. November 2026 |
|---|---|
| A0 | In Kraft. Angewandt auf die fünf Bilder und zwei Aufgaben von E.2, Schritt 2, Teil 1; alle fünf Bilder sind angenommen, die beiden Aufgaben rechnen mit Vorzeichen und zeigen keine Pfeile. |
| A1 | Beauftragt am 25. November; Teil 1 ist übergeben, die Knotenprüfung läuft. |
| A2 bis A5 | Nicht begonnen. |

## 7. Regeln und Risiken

- **Alle Länder.** Ein kanonisches Ziel gilt für 16 Länder. Vor jeder Kante und
  jedem geänderten Zieltext stehen die Zahl der Quellrouten und die Lernorte
  in allen Sichten.
- **Quellen.** Amtlicher Wortlaut wird nur aus den PDFs zitiert, mit Seite.
  Wo kein amtlicher Text die strengere Lesart trägt, ist das Ziel als eigenes
  didaktisches Angebot von SkillPilot gekennzeichnet.
- **Reifegrad.** Physik bleibt M7. Ein neues Unterstufenziel braucht in jeder
  Unterstufensicht einen Abschlussweg zu einer Prüfung; Teil 1 von E.2 hat
  gezeigt, dass das von Anfang an geplant werden muss.
- **Eingefrorene Reviews.** Die Textänderung an einem Ziel des eingefrorenen
  Reduktionsnachweises braucht ein neues Review dieses Ziels.
- **Umfang.** A2 hat die Größe von Teil 1 von E.2. A3 ändert acht bis zehn
  bestehende Zieltexte mit Quellrouten in vielen Ländern; deshalb die Teilung
  nach Phasen.

## 8. Ergebnis der Knotenprüfung (A1) und Zuschnitt für A2

Stand: 25. November 2026, 23:15 MEZ. Zwei unabhängige Prüfmodelle haben den
Entwurf des frühen Lernziels geprüft; Codex hat mit eigenen Messungen
ergänzt. Geprüft wurde auf dem Stand von E.2, Schritt 2, Teil 1
(`4c24fcf9f2`). Der Prüfbericht mit Quellentabelle, Inventar, Kanten,
Lernorten und Abschlusswegen kommt als Nachweis mit dem Paket A2 ins
Repository.

### Was die Prüfung ergab

- **Das eigene Ziel ist gerechtfertigt.** Eine lernende Person kann eine
  geometrisch richtige Pfeilsumme konstruieren und den Kraftpfeil trotzdem an
  den falschen Körper setzen.
- **Amtliche Grundlage.** 14 Länder nennen die Darstellung gerichteter Größen
  mit Pfeilen als Ziel der Sekundarstufe I. Für Hessen und Baden-Württemberg
  fehlt ein geprüfter Beleg; dort ist das Ziel eine eigene Vorbereitung. Die
  Trennung von Ortsmaßstab und Pfeilmaßstab und die Bedeutung der Pfeilspitze
  sind in allen Ländern eine didaktische Ausgestaltung von SkillPilot und
  werden so gekennzeichnet.
- **Bilder.** Von 524 Zielbildern zeigen 93 Ortsskizzen mit Größenpfeilen.
  Vier erfüllen das Kriterium, 89 brauchen eine Überarbeitung. Im Bild zu
  Newtons drittem Axiom (`ad984bb6`) sitzen die Pfeile am falschen Körper.
- **Ziele, Aufgaben, Karten.** Acht der 737 atomaren Zieltexte verlangen die
  grafische Leistung ausdrücklich, 20 der 235 Prüfungen fordern eine
  Pfeildarstellung, keine der Lernkarten.
- **Lernorte.** In allen 90 Sichten liegt der Erwerb spätestens in der Einheit
  der ersten Verwendung; kein Fall liegt zu spät. Die früheste Verwendung in
  einem Bild liegt in Niedersachsen und Nordrhein-Westfalen in Klasse 5/6.
- **Abschluss.** Keine vorhandene Prüfung schützt die Leistung beim Bestehen:
  Wo eine Zeichnung verlangt ist, kann sie fehlen, und die Arbeit besteht
  trotzdem.
- **Mathematik.** Eine allgemeine Voraussetzung zur Vektorrechnung trägt der
  Befund nicht. Wo der Unterricht sie schon behandelt hat, eignet sich der
  Verschiebungspfeil als Vergleich.

### Zuschnitt für A2 (Entscheidung Claude, zur Beurteilung durch den Product Owner)

1. **Zieltext.** „Pfeile für gerichtete Größen lesen und zeichnen. Die
   lernende Person kann in einer ebenen Skizze einen Größenpfeil dem
   zugehörigen Körper oder markierten Punkt zuordnen, ihn dort in der Richtung
   der Größe ansetzen und seinen Betrag mit einem vorgegebenen Pfeilmaßstab
   ablesen oder zeichnen. Sie erklärt an zwei Darstellungen derselben
   Situation, warum sich beim Wechsel des Pfeilmaßstabs die gezeichnete Spitze
   verschiebt, während Ort und physikalischer Betrag gleich bleiben.“ Das ist
   der Wortlaut der Prüfer; er ersetzt den Entwurf in Abschnitt 3.
2. **Kanten.** 18 direkte Voraussetzungen für die 24 Ziele und Prüfungen, die
   Pfeile nachweislich verlangen. Ein Bild allein begründet keine Kante; es
   bekommt eine richtige Legende. Eine Prüfung, die eine Kraftzeichnung
   fordert, setzt das Pfeilziel voraus, auch wenn ihr Fachziel ohne Zeichnung
   erreichbar ist.
3. **Geltung.** Reguläres Lernziel in den 14 Ländern mit amtlicher Grundlage,
   eigene Vorbereitung in Hessen und Baden-Württemberg, Vorbereitung mit
   eigenem Lernort in den reinen Oberstufensichten.
4. **Abschlussaufgabe.** Eine kurze eigene Aufgabe mit vier geschützten
   Teilen: Träger oder Bezugspunkt, Richtung, Betrag mit Einheit und eigenem
   Pfeilmaßstab, Bedeutung der Spitze beim Wechsel eines Maßstabs.
   Bestehensgrenze höchstens 85 Prozent, Blindbewertung durch zwei
   Prüfmodelle.
5. **Dauerhafte Sicherung (A5).** Die Kennzeichnung „verwendet Pfeile“ kommt
   als eigene Eigenschaft in das vorhandene Register der fachlichen Arten,
   mit einer neuen Schemafassung; die Entscheidung über das einzelne Bild in
   das vorhandene Register der Bildprüfung.
6. **Sofort.** Das Bild zu Newtons drittem Axiom wird mit A2 korrigiert.

### Folge für A3

A3 ist größer als in Abschnitt 7 geschätzt: Neben den Zieltexten sind 89
Bilder zu überarbeiten. Die Teilung nach Phasen bleibt; jede Phase nennt ihre
Bilder einzeln.

