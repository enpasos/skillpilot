# Lokaler Lernkartenprototyp

Der erweiterte **[Cockpit-Prototyp](cockpit-README.md)** verwendet echte
Mathematikinhalte und fiktive lokale Testprofile. Er läuft unter
<http://localhost:5173/prototypes/cockpit.html> mit demselben Startbefehl.

Der Prototyp zeigt synthetische Hierarchien von Lerneinheiten. Pfeile führen
von der Vorbereitung zur Anwendung, also entgegen der gespeicherten
`requires`-Richtung. Beim Öffnen einer Einheit sind nur ihre direkten Inhalte
sichtbar. Externe Voraussetzungen erscheinen als Hinweis in der Detailspalte.
Die Darstellung orientiert sich an der ruhigen, kompakten Graphansicht von
[Netron](https://github.com/lutzroeder/netron).

Starten, aus dem Verzeichnis `app`:

```bash
./node_modules/.bin/vite --config prototypes/vite.config.ts
```

Dann <http://localhost:5173/prototypes/learning-map.html> öffnen.
Über die Auswahl oben sind eine kleine Karte mit vier Bereichen und eine
vernetzte Karte mit 56 Bereichen und 98 Verbindungen verfügbar. Letztere enthält
auch Verzweigungen, Zusammenführungen, lange Verbindungen und unabhängige Bereiche.

- Einheit doppelklicken, „Öffnen“ wählen oder über ihr hineinzoomen.
- Über Shift + Doppelklick, „Auftauchen“, Escape, die Pfadleiste oder weites
  Herauszoomen zurückkehren.
- Auf einer fokussierten Karte öffnen Enter und Leertaste die Einheit bzw. Details.
- Die freie Kartenfläche ziehen, um den Ausschnitt zu verschieben.
- Knoten auswählen: Direkte Vorbereitungen und Folgeschritte werden hervorgehoben.
  Die Detailspalte zeigt ihre Beschreibungen und verweist auf die verbundenen Knoten.
- Die Suche findet Ziele in der aktuellen Ebene und zentriert den gewählten Treffer.
  Auswahl und Suche ändern weder die Knotenpositionen noch die Beziehungen.
- Die Übersichtskarte unten rechts dient zum Verschieben und zur Orientierung.
  Der Pfeil oben rechts dreht die Lernrichtung zwischen horizontal und vertikal.
- „Diese Ebene einpassen“ zeigt den gesamten aktuellen Ausschnitt. Auf kleinen
  Bildschirmen startet die Karte zugunsten lesbarer Texte bei der ersten Einheit.

Ein Beispiel über drei verschachtelte Einheiten:
**Mechanik → Kinematik → Gleichförmige Bewegung** (kleine Karte).

Der Ausschnitt wird je Ebene für die laufende Sitzung gemerkt. Neu laden setzt
die Ansicht zurück. Es gibt keine Verbindung zu Lernendenkonten, APIs,
Produktionscurricula oder Zugangssperren. Einheiten sind hier noch keine fachlich
freigegebenen Curricula. Die vorhandene Explorer-Ansicht bleibt unverändert.

Der Browsercheck startet einen eigenen lokalen Server und prüft Navigation,
Kameragedächtnis, Tastatur, Mausrad, Touch und Netzwerkisolation:

```bash
./node_modules/.bin/tsx scripts/testLearningUnitMapPrototype.ts
```

Bildschirmaufnahmen werden unter `tmp/learning-map-prototype-review/` im
Repository abgelegt. Touch-Tests verwenden Chromium-Emulation; sie ersetzen
keine Erprobung auf echten Mobilgeräten.

Für die Anordnung wird ELK in einem Web Worker ausgeführt. Die berechneten
orthogonalen Kanten werden mit separaten Anschlüssen gezeichnet. Ergebnisse sind
je Beispiel, Ebene, Richtung und Knotengröße begrenzt zwischengespeichert.
React Flow rendert nur den sichtbaren Ausschnitt. Große Ebenen starten mit
lesbarer Schrift; das bewusste Einpassen zeigt den vollständigen Zusammenhang.

Weitere lokale Prüfungen:

```bash
./node_modules/.bin/tsc --project prototypes/tsconfig.json
./node_modules/.bin/tsx --test src/components/learningUnitMap/learningScopeLayoutCore.test.mjs
```

Die Geometrieprüfung deckt beide Lernrichtungen ab: deterministische Positionen,
getrennte Anschlüsse, keine überlappenden Knoten und keine Kanten durch fremde
Knoten. Sie garantiert nicht, dass jeder beliebig dichte Graph ohne
Kantenkreuzungen darstellbar ist.
