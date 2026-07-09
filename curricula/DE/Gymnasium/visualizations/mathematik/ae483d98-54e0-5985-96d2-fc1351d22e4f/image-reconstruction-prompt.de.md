# Bildrekonstruktionsprompt: Hypothesentests bei verändertem Stichprobenumfang variieren

## SkillPilot-Ziel

- SkillPilot-ID: `ae483d98-54e0-5985-96d2-fc1351d22e4f`
- Titel: Hypothesentests bei verändertem Stichprobenumfang variieren
- Beschreibung: Die lernende Person kann bei einem binomialen Hypothesentest einfache Variationen der Aufgabenstellung, insbesondere geänderte Stichprobenumfänge, rechnerisch nachvollziehen und Auswirkungen auf Entscheidungsregel, Fehlerwahrscheinlichkeiten oder Testentscheidung beschreiben.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `ae483d98-54e0-5985-96d2-fc1351d22e4f.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, lehrreiches Infografik-Design mit einem hellblauen Kopfzeilenbereich oben und einem weißen Hauptinhaltsbereich darunter, umrandet von einer dünnen schwarzen Linie. Der Stil ist sauber, mit dicken schwarzen Umrissen für alle Elemente und Text in einer gut lesbaren, serifenlosen Schrift.

Der Kopfzeilenbereich ist hellblau und enthält den zentrierten, fettgedruckten, dunkelblauen Text: "Hypothesentests bei verändertem Stichprobenumfang variieren".

Der weiße Inhaltsbereich ist vertikal durch eine gestrichelte schwarze Linie in der Mitte geteilt.

Auf der linken Seite, oben, befindet sich eine weiße Sprechblase mit einem kleinen blauen Kopf-Symbol links, die den schwarzen Text "Szenario: Kleine Stichprobe (z.B. n=20)" enthält. Darunter sind zwei übereinander angeordnete Diagramme. Beide Diagramme haben eine schwarze Achsenbeschriftung: die vertikale Achse ist mit "Wahrscheinlichkeit P(X)" beschriftet und die horizontale Achse mit "Anzahl defekter Teile X".

Das obere linke Diagramm zeigt eine breite, glockenförmige schwarze Kurve, die eine Normalverteilung darstellt, beschriftet mit "Unter H₀: p=0.10". Darunter befinden sich hellblaue Histogrammbalken. Eine vertikale rote Linie ist bei 'k' auf der x-Achse eingezeichnet. Der Bereich unter der Kurve rechts von 'k' ist rot schattiert und mit "Verwerfungsbereich (X ≥ k)" beschriftet. Ein schwarzer Pfeil zeigt von diesem roten Bereich auf den Text "α (Fehler 1. Art, z.B. 5%)".

Das untere linke Diagramm zeigt eine zweite, ebenfalls breite, glockenförmige schwarze Kurve, die nach rechts verschoben ist und eine Normalverteilung darstellt, beschriftet mit "Unter H₁: p=0.30". Darunter befinden sich hellgrüne Histogrammbalken. Eine vertikale blaue Linie ist bei 'k' auf der x-Achse eingezeichnet, exakt an der gleichen Position wie die rote Linie im oberen Diagramm. Der Bereich unter der H₁-Kurve links von 'k' ist hellblau schattiert und mit "β (Fehler 2. Art)" beschriftet. Ein schwarzer Pfeil zeigt von diesem hellblauen Bereich auf den Text. Der Bereich unter der H₁-Kurve rechts von 'k' ist hellgrün schattiert und mit "1-β (Teststärke)" beschriftet. Ein schwarzer Pfeil zeigt von diesem hellgrünen Bereich auf den Text.

Unter diesen beiden Diagrammen befindet sich ein abgerundetes, rechteckiges weißes Textfeld mit schwarzem Rand, das den schwarzen Text "Verteilungen sind breit. Hohe β, geringe Teststärke." enthält.

In der Mitte des Bildes, über der gestrichelten vertikalen Linie, befindet sich ein horizontaler schwarzer Pfeil, der von links nach rechts zeigt. Darüber steht der schwarze Text "Erhöhung des Stichprobenumfangs n". Unter dem Pfeil ist eine Reihe kleiner, gestrichelter schwarzer Linien, die visuell "n" darstellen.

Auf der rechten Seite, oben, befindet sich eine weiße Sprechblase mit einem kleinen blauen Kopf-Symbol links, die den schwarzen Text "Szenario: Große Stichprobe (z.B. n=100)" enthält. Darunter sind zwei übereinander angeordnete Diagramme. Beide Diagramme haben eine schwarze Achsenbeschriftung: die vertikale Achse ist mit "Wahrscheinlichkeit P(X)" beschriftet und die horizontale Achse mit "Anzahl defekter Teile X". Die horizontale Achse ist mit den Zahlen 10, 20, 30 beschriftet.

Das obere rechte Diagramm zeigt eine schmalere, höhere glockenförmige schwarze Kurve, die eine Normalverteilung darstellt, beschriftet mit "Unter H₀: p=0.10". Darunter befinden sich hellblaue Histogrammbalken. Eine vertikale rote Linie ist bei 'k'' (k-Strich) auf der x-Achse eingezeichnet, positioniert zwischen 10 und 20, näher an 10. Der Bereich unter der Kurve rechts von 'k'' ist rot schattiert und mit "Verwerfungsbereich (X ≥ k')" beschriftet. Ein schwarzer Pfeil zeigt von diesem roten Bereich auf den Text "α (festgelegt auf z.B. 5%)".

Das untere rechte Diagramm zeigt eine zweite, ebenfalls schmalere, höhere glockenförmige schwarze Kurve, die nach rechts verschoben ist und eine Normalverteilung darstellt, beschriftet mit "Unter H₁: p=0.30". Darunter befinden sich hellgrüne Histogrammbalken. Eine vertikale blaue Linie ist bei 'k'' auf der x-Achse eingezeichnet, exakt an der gleichen Position wie die rote Linie im oberen Diagramm. Der Bereich unter der H₁-Kurve links von 'k'' ist hellblau schattiert und mit "β (Fehler 2. Art, kleiner)" beschriftet. Ein schwarzer Pfeil zeigt von diesem hellblauen Bereich auf den Text. Der Bereich unter der H₁-Kurve rechts von 'k'' ist hellgrün schattiert und mit "1-β (Teststärke, größer)" beschriftet. Ein schwarzer Pfeil zeigt von diesem hellgrünen Bereich auf den Text.

Unter diesen beiden Diagrammen befindet sich ein abgerundetes, rechteckiges weißes Textfeld mit schwarzem Rand, das den schwarzen Text "Verteilungen sind schmal. Geringere β, höhere Teststärke (bei gleichem α)." enthält.

Ganz unten, über die gesamte Breite des Inhaltsbereichs, befindet sich ein großes, abgerundetes, rechteckiges weißes Textfeld mit schwarzem Rand. Links in diesem Feld ist ein leuchtendes gelbes Glühbirnen-Symbol mit Lichtstrahlen dargestellt. Rechts daneben steht der schwarze Text: "Erkenntnis: Größeres n ⇒ Schmalere Verteilungen ⇒ Bessere Unterscheidung von H₀ und H₁ ⇒ Höhere Teststärke."
```
