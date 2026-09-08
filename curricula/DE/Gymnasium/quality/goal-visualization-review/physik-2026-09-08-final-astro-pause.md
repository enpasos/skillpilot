# Physik: begrenzter Astro-Visual-Zwischenstand

Review date: 2026-09-08

Informierte AI-Autorenprüfung mit tatsächlicher Vollsichtung der Originalraster;
H2/H3 zusätzlich durch Root vollständig gegengelesen/gesichtet. Keine menschliche
Freigabe und keine unabhängige D-Runde. Es wurde nach der Pausenanordnung kein
neuer Generierungslauf begonnen. Zwei bereits vorhandene geeignete Raster wurden
importiert; drei tatsächlich fehlgeschlagene Providerstrecken bleiben vorläufig
offen. `deferred_provider_limitation` bedeutet hier keinen V-/D-Erfolg und keine
Behauptung, dass ein Bild fachlich unnötig wäre.

| Goal ID | Goal title | Decision | Notes |
|---|---|---|---|
| `6a73cacc-e86d-5248-a180-fd3da8454b0f` | Sternradien aus HRD-Daten abschätzen | `deferred_provider_limitation` | Erster Lauf HTTP 500 wegen hoher Providerauslastung. Einziger abgeschlossener Retry fachlich verworfen: L-Achse unten und oben „hoch“, heißer Stern links rot und kühler Stern rechts blau. Keine aktive Verknüpfung; Fehlerbild mit SHA-256 `976933874c737280cca52a7a4e9a3ca21b20463d2e3e5c9eba3e4f95dfed5a47` archiviert. |
| `3a4b2f86-5c59-5429-8fb4-75d9b2589cb5` | Sternentfernungen mit dem HRD abschätzen | `accepted_ai_pilot` | Vollsichtung durch Autor und Root: schematisches HRD mit korrekt gerichteten Achsen; unabhängige G2-V-Klassifikation liefert L, beobachteter F zusammen mit L eine Entfernung. Klassenfehler und Absorption sind ausdrücklich begrenzt. Aktive Beschreibung präzisiert F als Leistung pro Fläche und die inverse-Quadrat-Beziehung für unabsorbierten oder korrigierten Fluss. SHA-256 `dc5911639d466426c5c6f0683bba19dd419d2346338a83987bd7476ca7fd2fee`. Keine Humanfreigabe. |
| `946ecf7b-0fcf-5776-9fb6-d397423c2f12` | Hauptreihenzeiten mit der Masse-Leuchtkraft-Beziehung abschätzen | `accepted_ai_pilot` | Vollsichtung durch Autor und Root: nutzbare Fusionsenergie durch mittlere Leistung; L proportional M hoch alpha, alpha größer als eins; daraus t proportional M hoch eins minus alpha. Hauptreihe, begrenzter Massenbereich und vergleichbarer Brennstoffanteil sind ausdrücklich genannt. Caption begrenzt größere/kleinere Sternsymbole auf schematischen Massevergleich, nicht gemessene Radien. SHA-256 `439c9f4d5e20f3137f4133bd6e0b5a5d035179ef4fbc6f3fcc2a17c85b35649c`. Keine Humanfreigabe. |
| `49bb609a-bfb7-5391-9120-f5fc737efb9a` | Exoplanetenkandidaten mit der Transitmethode erklären | `deferred_provider_limitation` | Erstes Raster nach Vollsichtung verworfen: die als Nichttransit bezeichnete Bahn kreuzt die scheinbare Sternscheibe. Gezielter korrigierter Retry scheitert mit Provider HTTP 500. Kein Import. Fehlerbild SHA-256 `e00c41aad014396194bb38e02e7c98694db9c626466f7d74c22d51e8d50988cb` archiviert. |
| `6dca3b0a-c872-543b-808f-97e855f5fafd` | Exoplanetenkandidaten mit Stern-Radialbewegungen erklären | `deferred_provider_limitation` | Beide gezielten Läufe scheitern mit Provider HTTP 500 wegen hoher Auslastung. Es liegt kein abgeschlossenes Raster vor; daher kein Import und keine Bildfreigabe. |

## Bindungen und erhaltene Texte

Die vollständige maschinenlesbare Spur liegt unter
`curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-final-astro-consolidation-v1/visual-consolidation-receipt.json`.
Dort sind öffentliche, kanonische und Backend-Assetkopien sowie Providerfehler und
archivierte verworfene Bilder getrennt gebunden. Die vollständigen DE/EN-Texte,
individuellen Kompatibilitätsurteile und unveränderten Originalasset-Hashes für
die vier lokalen Textkorrekturen stehen in `pause-receipt.json` desselben Pakets.
Die bereits fehlende Visualisierung zur Sonnenmasse (`5e9cd796`) bleibt in ihrer
bestehenden B082-Disposition offen; sie wird hier nicht als neues Bild gezählt.

Zehn P-Bodies bleiben informierte AI-Kandidaten (E1/G1); genau die zwei vom Import
betroffenen Inputbindungen wurden nach tatsächlicher Bild-/Body-Kompatibilitäts-
prüfung aktualisiert. Kein P-Body, kein A/M-Urteil und keine alte D-Runde wurde
durch bloßes Rebinding zu einer menschlichen oder unabhängigen Freigabe erklärt.
