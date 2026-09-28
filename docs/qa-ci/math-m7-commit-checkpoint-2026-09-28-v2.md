# Mathematik M7: lokaler Integrationscheckpoint vom 28. September 2026

Dieser Stand setzt die Arbeit auf `a435cdfe87bf` fort und erhält den bereits
uncommitteten Arbeitsbaum. Er ist ein maschinell geprüfter Zwischenstand, kein
Mathematik-M7-Abschluss, keine menschliche Freigabe und keine Veröffentlichung.
Der frühere [Checkpoint](math-m7-commit-checkpoint-2026-09-28.md) bleibt als
historischer Stand unverändert.

## Aktueller strenger Stand

Der zentrale Fünf-Gate-Bericht zählt **753 von 803** aktuellen
`curricularAtomic`-Mathematikzielen (**93,8 %**) als streng abgeschlossen:
D 753, P 765, A 803, M 803, V 803. Alle sechs technischen Abschlusschecks
bestehen, ohne zentrales Blocking-Issue. **50 Ziele bleiben offen**; CQR-303
steht deshalb auf Warnung und Mathematik auf der geschützten Stufe **M6**.
Physik bleibt bei **478/478, CQR-303 bestanden und M7**. Die 54 offenen
klassischen BY-Quellenrouten im separaten Rationale-Bericht sind ein anderer
Zähler und werden nicht mit den 50 M7-Lücken verrechnet.

In diesem Stabilisierungspaket entstanden **keine neuen strengen fachlichen
M7-Abschlüsse** und **keine bloß wiederhergestellten D/P-Abschlüsse**; der
Nettozuwachs im zentralen Bericht ist **0** gegenüber dem unmittelbar davor
gemessenen Stand 753/803. Neu belegt sind die korrigierten Bildbindungen und
die reparierten unteren Curriculum-Gates. Gültige Nachweise unveränderter
Ziele wurden nicht neu geprüft.

## Gezielte Reparaturen

- Die angezeigte Bestandsfunktion `B(t)=10+t²` beginnt mit Steigung null.
  Weitere betroffene Mittelwert- und Vektorbilder wurden als tatsächliche PNGs
  geprüft und hashgleich in Kanon, Quelle, Public und Backend gebunden.
- Für `5619ca5b` bleibt die fachlich geprüfte Würfel-zu-drei-Pyramiden-Grafik
  aktiv. Sie plausibilisiert die Volumenformel ohne Integralrechnung als
  Voraussetzung. Das frühere Schichtenbild und die verworfenen Varianten
  bleiben in der Bildhistorie erhalten.
- Drei Pythagoras-Bilder sind als PNG aktiv. Bei der Kehrsatz-Beweisgrafik
  wurde ein erster KI-Kandidat wegen falscher SSS-Geometrie verworfen; der
  anschließend unabhängig geprüfte Kandidat hält die entsprechenden Seiten
  innerhalb von 0,08 % und zeigt den Hilfswinkel korrekt. Die alten SVGs und
  Prompts liegen nur noch in der datierten Review-Historie. Die drei neuen
  Pythagoras-Bildlinks sind PNG; gute ältere JPG-Bilder bleiben wie vorgesehen
  aktiv. Die Bild-QA ist ausdrücklich **nur KI-QA**;
  `humanApproved` bleibt `no`.
- Die bayerische M13.1-Flächenbilanzquelle ist gezielt mit dem vorhandenen
  curricularen Integralziel verknüpft. Dessen aktive D/P-Nachweise wurden
  auf genau diese Quellenfacette geprüft und blieben gültig. Vierzehn veraltete
  explizite Länderzuordnungen wurden an die aktuelle Compiler-Semantik
  angepasst, ohne Ziele, Texte oder andere Geltungsdimensionen umzuschreiben.
  CQR-003 besteht in 16/16 Ländern und CQR-501 hat keine aktive Warnung mehr.
- Die generierten Quellenbegründungsberichte und der Runtime-Index verwenden
  die aktuelle Zielmenge. Drei Zielbuch-/Q2.5-Tests prüfen nun aktuelle IDs
  und Zähler statt des historischen Festwerts 799; der Modell-Digest ist als
  technischer Snapshot des geänderten Buchinhalts erneuert, nicht als
  fachliche Freigabe.
- Zwei Backend-Projektionstests verwenden die aktuellen Zielmengen. Ihre 34
  geänderten Umfangserwartungen wurden mit den betroffenen Ziel-IDs aus der
  finalen Ansichtsregenerierung und den korrigierten Länderzuordnungen
  abgeglichen. Mitgliedschafts- und Filterprüfungen blieben erhalten.

Die vorbereiteten Doppelrunden und das In-flight-Ledger bleiben die Grundlage
für die weiteren 50 Ziele. Offene D/P-Befunde und fachliche Grenzfälle werden
nicht durch Bild-QA oder einen neuen Hash geschlossen.

## Lokale Prüfung

Die zentrale D/P/A/M/V-Prüfung, Curriculum-Status im Check-Modus mit neun
geschützten Reifegraduntergrenzen, 297 Composition Views, 18 Daueransichten,
593 Graph-Landschaften, Quellenabdeckungs- und Quellenbegründungsprüfungen,
Bilddatei-/V-QA-/Abdeckungsprüfungen für 1.696 Links, sieben
Mathematik-Prüfungsverträge, HE-LK-Q2.5-Scope in 88 Ansichten und Lint
bestehen auf diesem Arbeitsstand. Die vollständige Zielbuch-Pipeline
einschließlich Publikationsintegrität und Laufzeittests besteht mit 803
bundesweiten Mathematikseiten. Der Frontend-Produktionsbuild und die
Quellenbegründungs-Build-Artefaktprüfung bestehen ebenfalls. Der
eigenständige Curriculum-Paketbauer erzeugt zwei bytegleiche Test-ZIPs.

Der Backend-Vollcheck bestand auf diesem eingefrorenen Stand: 224 Testsuiten,
2.130 Tests, 0 Fehlschläge, 0 Fehler und 9 übersprungene Tests. Die beiden
betroffenen Projektionstests bestanden auch gezielt. Der Vorher-/Nachher-
Hashvergleich aller 11.736 erfassten Eingabedateien ist identisch
(`b908d901a2489777df2daf22a1550f99ebba76ba0efacc3b4d6b01820f6e26c8`).
GitHub-CI für diesen uncommitteten Stand kann erst nach Commit und Push
laufen. Menschliche Prüfung, Erprobung und Release-Gates bleiben getrennt.
