# Unabhängiger D-Kandidat: `31be24f0…` (27.09.2026)

**Urteil zur Zielidentität: KEEP, kein weiterer Split des verengten Ziels.**
Dies ist eine unabhängige fachliche KI-Prüfung der aktuellen Fassung, **keine**
gebundene A/B-Runde, D-Registrierung, menschliche Freigabe oder M7-Freigabe.
Insbesondere die unten benannten P- und Routenbefunde dürfen nicht durch eine
bloße Hash-Aktualisierung übersprungen werden.

## Gebundener Gegenstand

- ID: `31be24f0-3ab1-54d2-856d-fa9b7f36552f`; aktueller kanonischer Titel:
  „Stammfunktionen ganzrationaler Funktionen ohne Hilfsmittel bestimmen“.
  DE/EN beschreiben dieselbe Leistung: eine Polynom-Stammfunktion selbst ohne
  Hilfsmittel bestimmen und das Ergebnis durch Ableiten prüfen.
- Zum Prüfzeitpunkt hatte der zielbezogene P-v2-Record den
  `goalFingerprint` `sha256:081c71cf5ae79b3cda63fc7631f9eea6cb3c5ac22c2838d2c2b64eb1dfb4b88c`;
  die aktuelle Bilddatei hatte SHA-256
  `3e1a2c03a680c44de63a43d149598085f6f0185ee77bc1ea465c230946576ec1`.
  Maßgeblich sind die **jeweils aktuellen** kanonischen Daten und der neue
  gebundene Lernzielbuch-Kontext, nicht frühere Runden mit dem kombinierten
  Zieltext oder dem alten JPG.
- Die früheren unabhängigen `split_review`/`split_review`-Runden betrafen
  ausdrücklich die **alte** Kopplung von eigener Polynom-Stammfunktion und
  Nutzung einer vorgegebenen Stammfunktion für Integral/Rekonstruktion. Sie
  belegen den Grund für die Texttrennung, nicht die Qualität der neuen Fassung.

## Quellen- und Fachprüfung

- Das [Hessische Kerncurriculum 2024, Q1.1, S. 36](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf)
  nennt Integrationsregeln aus Ableitungsregeln und das Integrieren
  ganzrationaler Funktionen im grundlegenden Niveau. Das unterstützt die
  fachliche Operation und die Ableitungsprobe. Die konkrete Zusatzbedingung
  „ohne Hilfsmittel“ steht dort im zitierten Aspekt nicht ausdrücklich;
  die bestehende HE-Zuordnung `exact` sollte auf diese Reichweite überprüft
  werden, nicht als wortgleicher Quellennachweis gelten.
- [Bayern LehrplanPLUS M12 1.1](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/regulaer)
  verlangt neben einem grafischen Zugang, bei ganzrationalen Funktionen
  Stammfunktionsterme aus dem Funktionsterm zu ermitteln. Diese breitere
  Quellerwartung ist zu `31be…` zutreffend nur `partial` zugeordnet.
- Der [NRW-Kernlehrplan GOSt 2023, Analysis GK/LK](https://www.schulentwicklung.nrw.de/lehrplaene/lehrplan/331/gost_klp_m_2023_06_07.pdf)
  nennt das Bestimmen von Polynom-Stammfunktionen **ohne Hilfsmittel**.
  Derselbe Quellensatz verlangt außerdem die Nutzung vorgegebener
  Stammfunktionen, im LK zusätzlich `ln` als Stammfunktion von `1/x`.
  Die NRW-Zuordnung als `partial` zu mehreren getrennten kanonischen Zielen
  ist deshalb fachlich plausibel; diese zusätzlichen Leistungen gehören
  nicht in `31be…` zurück.
- Für `f(x)=3x²+2x` zeigt das neue Bild korrekt `F(x)=x³+x²` und
  `F′(x)=3x²+2x=f(x)`. Es enthält weder bestimmte Integralrechnung noch
  Bestandsrekonstruktion und ist damit passend zum verengten Ziel. Das Bild
  ist Lernhilfe, keine Leistungs-Evidenz.

## Atomarität und Verstehensleistung

Das eigene Bilden einer Polynom-Stammfunktion und die Ableitungsprobe sind
hier **ein** überprüfbarer Arbeitsgang: Die Probe entscheidet, ob das eigene
Ergebnis die definierende Beziehung `F′=f` erfüllt. Die Probe ist nicht der
alte, unabhängige Anwendungszweig mit **vorgegebenem** `F`. Ein weiterer
Split von `31be…` wäre deshalb nicht begründet. Die Neufassung entfernt die
alte fachliche Klammer mit Integral-/Rekonstruktionsaufgaben sauber.

Der P-v2-Kandidat bietet zwei voneinander verschiedene Polynome und rechnet
beide richtig vor: `f(x)=8x³−6x` ergibt z. B. `F(x)=2x⁴−3x²`, und aus
`g(x)=2x(x²−3)+4` folgt nach Ausmultiplizieren z. B.
`G(x)=½x⁴−3x²+4x`; beide Ableitungen stimmen. Der Wechsel zur
faktorisierten Form mit konstantem Summanden ist eine echte, wenn auch enge
Variation. Die Aufgaben verlangen die Ableitungsprobe ausdrücklich, nicht
bloß Einsetzen in eine auswendig gelernte Formel.

## Noch offene Qualitätsbefunde

1. **P-Evidenz zur Integrationskonstante:** In der aktuellen
   `positive-evidence.candidates.json` steht im ersten
   `essentialUnderstandingDe`, dass eine additive Konstante die Ableitung
   nicht ändert. Die `taskDemandDe` beider `applicationCaseBriefs` verlangen
   jedoch jeweils nur **eine** Stammfunktion samt Ableitungsprobe. Ein
   Lernender kann beide Aufgaben vollständig erfüllen, ohne die Familie
   `F+C` zu benennen oder zu erklären. `F+C` steht nur in den erwarteten
   Antworten. Entweder muss ein Aufgabenauftrag diese Einsicht aktiv
   sichtbar machen (etwa eine zweite Stammfunktion samt Begründung) oder der
   Profilanspruch enger gefasst werden. Eine Erwähnung im Lösungsschlüssel
   ist keine beobachtete Leistung.
2. **Didaktische Route/Überlappung:** `31be…` hat derzeit
   `requires: [b9bbd2a8…]`. Das Vorgängerziel „Hauptsatz der Differential-
   und Integralrechnung nutzen“ verlangt in seiner eigenen Beschreibung
   bereits „Stammfunktionen bestimmen“ plus `F(b)-F(a)`. Das macht die
   isolierte Polynom-Stammfunktion in der sichtbaren Lernroute erst nach einem
   Ziel zugänglich, das die gleiche Teilkompetenz schon vorauszusetzen
   scheint. Zusätzlich beansprucht `a9ed219d…` mit „Einfache Integrale
   berechnen“ ausdrücklich das Bestimmen von Stammfunktionen von `x^n` und
   Linearkombinationen. Vor strengem D-Abschluss den fachlichen Unterschied,
   die richtige Voraussetzung und die eigenständigen Prüfleistungen dieser
   drei Ziele nachvollziehbar klären; keinen `requires`-Pfeil blind entfernen.
3. **Aktuelle D-Bindung:** Die alte A/B-Synthese ist wegen geändertem
   DE/EN-Text und PNG nicht wiederverwendbar. Nach stabiler P- und
   Routenfassung ein neues begrenztes Lernzielbuch mit Quellen- und
   Nachbarzielkontext bauen, zwei wirklich unabhängige aktuelle D-Runden
   durchführen und deren Einwände fachlich synthetisieren. Bis dahin bleibt
   der zentrale D-Gate offen.

**Kurzurteil:** Die neue Einzelkompetenz selbst ist KEEP-fähig und das Bild
passt fachlich. Die profilierte Evidenz und die Zielroute sind noch nicht
vollständig widerspruchsfrei; aus diesem Review folgt bewusst **kein**
M7-Abschluss.
