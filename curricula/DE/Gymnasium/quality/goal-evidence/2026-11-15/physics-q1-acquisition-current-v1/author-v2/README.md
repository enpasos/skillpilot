# Q1-Aufgabenkandidat v2 – explizite Schrittschranken

**Entwurf nach gemeinsamem unabhängigen HOLD-Befund von Root und
physics_release_finish. Noch keine Freigabe.**

Der versiegelte v1-Bestand bleibt vollständig unverändert. v2 liest ihn nur;
`prepare_v2.py` prüft vor jeder Ausgabe sämtliche v1-Artefaktpins.
Es wurden keine aktiven Canonical-, View-, Registry- oder Ergebnisdateien
geschrieben. Die neuen, noch nie integrierten Entwurfs-UUIDs bleiben stabil;
kein historischer oder aktiver Aufgabenvertrag wird umgebunden.

Die Rubrik verwendet nun ausschließlich die bestehende direkte Summe der
Schrittpunkte. **Jeder** der84 Vierpunkte-Schritte sagt ausdrücklich DE/EN:
Fehlt eine der in diesem Schritt genannten wesentlichen Kernaussagen oder ihre
verlangte unabhängige Übertragung vollständig, oder wird sie durch eine
explizite Fehlvorstellung ersetzt, erhält **dieser Schritt höchstens1/4**.
Ohne prüfbare Evidenz sind0 Punkte angemessen. Ein isolierter kleiner Fehler
bei vorhandenen Kernen kostet weiterhin nur1 Punkt. Die frühere separat
gedachte TOTALcap ist aus allen Schritten und DE/EN-Lösungsregeln entfernt.

Bei Maximum M und Bestehen M−2 erreicht ein fehlender wesentlicher Teil selbst
mit voller restlicher Leistung höchstens M−3. `omission-integer-checks.json`
enumeriert für jeden der84 möglichen betroffenen Schritte die zulässigen
lokalen Ganzzahlen0/1 und sämtliche erreichbaren übrigen Punktsummen. Keine
Auslassung besteht. Ein kleiner Fehler bei allen Kernen erreicht M−1 und
besteht. **Diese Rechnungen sind Autorenchecks, kein Ersatz für Review.**

`rubric-delta.json` enthält alle138 exakt lokalisierten Rubrikfeldänderungen
(84 Schrittbeschreibungen sowie27×2 DE/EN-Lösungsregeln). Die ursprünglichen
fachlichen Lösungskörper sind identisch; Gesamt-/Bestehenspunkte und
Schritt-IDs/-Maxima sind unverändert. `content-clarification-delta.json`
enthält genau die zwei zusätzlich von Root gefundenen Geometriepräzisierungen
mit jeweils deutscher und englischer Fassung:

- `908a7f3d…`: zwei **getrennte** Kugelaufbauten, jedes Zentrum im Ursprung,
  jeweils derselbe Beobachtungspunkt(3a,0); dadurch sind Richtung und Betrag
  tatsächlich vergleichbar.
- `26a6cfcb…`: auch im unabhängigen negativen Eintrittsfall zeigt die
  anfängliche Querkomponente ausdrücklich+x, die parallele Komponente bei30°
  ausdrücklich+z; keine unausgesprochene Azimutwahl in der Lösung.

Alle übrigen Aufgaben-/Materialtexte sind bytegleich. Der Builder prüft
ausdrücklich, dass außerhalb dieser vier DE/EN-Klauseln nur die Rubrikfelder
geändert wurden. `review-pack.json` aktualisiert die Gegenantwort-Punktsummen
auf die direkte Schrittsumme. Die35 vollständigen Whole-P-Profile,
Erwartungszuordnungen, Quellen,63 Zahlenchecks und nativen Wissenskontexte
sind über die gepinnten unveränderten v1-Dateien verfügbar; ihre fachliche
Prüfung läuft unabhängig weiter. Diese kleine Nachfolge behauptet deren
Erfolg nicht.
