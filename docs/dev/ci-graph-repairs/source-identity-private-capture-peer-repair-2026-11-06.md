# Private Capture: vier konkrete Peerbefunde geschlossen

Der begrenzte Capture-Baustein besteht jetzt **19 Tests ohne Skip**. Der
[unabhängige Schlussreview](source-identity-private-capture-alias-closure-review-2026-11-06.md)
bestätigt dieselben vier Korrekturen. Die vollständige
[Prüfquittung](source-identity-private-capture-peer-repair-2026-11-06.json)
bindet Code, ursprüngliche Gegenbeispiele, historische Vorher-Versionen und
tatsächlich ausgeführte Vorher-/Nachherläufe.

- Ausgewählte originale Textdateien und projizierte Kandidattexte werden vor
  und nach dem Befehl anhand ihrer vollständigen Bytes geprüft.
- Tatsächlich eingeblendete Asset-Dateien werden zusätzlich zum privaten
  Blobstore geprüft; ein ausgetauschter Foresteintrag wird zurückgewiesen.
- Ausgabepfade werden vor jeder Ausgabeoperation begrenzt. Das echte
  Gegenbeispiel lässt seinen Sentinel außerhalb des Capture unverändert.
- Alle deklarierten Verzeichnisaliase behalten in beiden privaten Wurzeln
  ihren Git-Linktext, den Symlinktyp und ihre konkrete interne Endauflösung.
  Änderungen vor oder während eines Befehls werden erkannt.

Die drei ursprünglichen Fehler sind mit den abrufbaren 14er-Codebytes
reproduziert. Der zusätzliche Aliasfehler ist mit dem gesicherten
17er-Zwischenstand reproduziert. Die beiden neuen Aliasregressionen schlagen
gegen diese alte Implementierung tatsächlich fehl; die vollständige korrigierte
Suite besteht. Historische Quittungen bleiben bytegleich. Ihre Zahl von vier
mit `bwrap` markierten Methoden bedeutet drei tatsächlich ausführende Methoden
mit vier Aufrufen; dieser Nachfolger setzt Markierung und Ausführung nicht gleich.

Ein kleiner [Replay](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-06/private-capture-peer-repair/replay_capture_peer_repairs.py)
prüft die eingefrorenen Dateien und führt dieselben echten Mini-Git-/Materializer-/
`bwrap`-Gegenproben aus. Sein `--output`-Verzeichnis muss neu sein. Der Replay
benötigt lokale `git`-, Python- und `bwrap`-Werkzeuge; seine Fixtures schreiben
ausschließlich in kleine private temporäre Verzeichnisse.

Es wurde kein vollständiges Original-/Kandidatenpaar materialisiert. Vollständige
Leseabhängigkeiten, Werkzeugbindungen, Ressourcenplanung und Kind-/A-/M-/V-Joins
bleiben gesonderte Arbeit. Die Prä-/Postprüfung verspricht keinen Schutz gegen
beliebige gleichberechtigte Hoständerungen, die zwischen beiden Prüfungen wieder
zurückgenommen werden. Source-A-Vertrag, bestehende QA-Records, kanonische Daten
und die geschlossene B-/Runtimegrenze bleiben unverändert.
