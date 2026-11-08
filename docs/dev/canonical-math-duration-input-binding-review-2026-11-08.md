# Mathematik-Dauerlayout: Pflege der Inputbindung am 8. November 2026

Der [fehlgeschlagene CI-Schritt von PR #96](https://github.com/enpasos/skillpilot/actions/runs/42506065816/job/128815173044)
brach vor dem Generatorvergleich ab: Der aktive Layoutplan erwartete den
kanonischen Raw-Hash `07749dae…`, während das geprüfte V3-Datenpaket
`e28dea9e…` liefert. Die bestehende
[Pflegeanweisung](../qa-ci/math-m7-concept-and-handoff-2026-09-28.md#51-bestand-sichern-und-aktive-quellen-konsolidieren)
erlaubt die Fortschreibung nach Prüfung des Inhaltsdeltas.

Der vollständige Vergleich von Parent `0adcd834d5` mit PR-Stand `d4b2eba948`
bestätigt ausschließlich 27 Materialisierungen atomarer `requires`-Arrays und
zwei Entfernungen der bisherigen Clusteranforderung. Alle übrigen Ziel- und
Dokumentfelder einschließlich `contains` sind strukturell unverändert; die
anderen 20 kanonischen Dokumente sind bytegleich. Die V3-Bescheinigung
`deb3d78f…` mit 204 historischen Entfernungen, 200 ursprünglichen Arrays und
21 historischen Basisdigests bleibt unverändert.

Im Layoutplan ändert sich nur `inputs.canonical.sha256` von `07749dae…` auf
`e28dea9e…`. Reviewstatus, `parentDerivativeReceipt`, 83 Platzierungen, sieben
Adjudikationsbindungen und fünf Quellen-Scope-Bindungen bleiben exakt erhalten.
Der [vorherige vollständige Plan](https://github.com/enpasos/skillpilot/blob/d4b2eba948bd3c7cbcec9a39e65999d90f4f80aa/app/scripts/config/math-duration-split-spanning-tree-policy.json)
bleibt als Git-Blob `b9739235c6…`, Raw-SHA256 `5715daa4…`, erreichbar. Der echte
`check:math-duration-composition-views` besteht mit allen 18 vorhandenen Views
bytegleich; Ziele, Rollen, Mitgliedschaften und Geltung ändern sich nicht.

Der danach tatsächlich veraltete Rationale-Coverage-Bericht wurde durch seinen
unveränderten regulären Generator erneuert. Ausschließlich Zeitstempel und die
beiden Zähler für rohe beziehungsweise noch unbegründete `requires`-Relationen
steigen von 2.459 auf 2.484. Der Coverage-Check besteht anschließend; auch
`check:goal-source-rationale-gap-issues` besteht mit unveränderten Dateien.
Begründungstexte, Quellenentscheidungen, Generatoren und Vergleichsfamilien
bleiben unverändert.

Der [kompakte technische Receipt](https://github.com/enpasos/skillpilot/blob/main/qa-artifacts/ci-contract-audit/2026-11-08/g17-math-duration-input-binding/receipt.json)
bindet Git-Referenzen, vollständige alte und neue Hashes, alle 18 Output-Hashes,
exakte Deltapfade und ausgeführte Befehle. Die gebundenen Eingaben der bereits
bestandenen Native- und Projection-Läufe sind weiterhin identisch; diese Tests
wurden nicht wiederholt. Der CQR-Status wurde nicht neu generiert; der separate
`quality:curriculum-status:check` bestand mit unveränderten Eingaben und
Statusdateien. Dies ist technische Wartung und fügt keine
Quellen- oder Layoutbegutachtung, menschliche Freigabe oder Lernzielerfüllung
hinzu. Frische Remote-CI bleibt eine separate Prüfung.
