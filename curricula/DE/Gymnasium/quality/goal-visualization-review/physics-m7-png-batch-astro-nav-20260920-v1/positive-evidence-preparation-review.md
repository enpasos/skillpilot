# Vorbereitende P-Evidenzprüfung – Astro/Navigation

- Datum: 20. September 2026
- Prüfer: Codex, vorbereitende KI-Prüfung
- Umfang: 16 `curricularAtomic`-Ziele aus diesem Bildpaket
- Kandidaten: `canonical-physics-positive-understanding-evidence-m7-astro-nav-current-20260920-v1.candidates.json`
- Konfiguration: `canonical-physics-positive-understanding-evidence-m7-astro-nav-current-20260920-v1.config.json`
- Status: **nur vorbereitet, noch nicht materialisiert**

Die vollständigen bestehenden `positive-understanding-evidence-v2`-Profile
wurden aus den im Preintegration-Audit ausgewiesenen P-Ownern gelesen. Alle
bleiben für eine spätere Materialisierung bei `needs_human_review`,
`ai_candidate`, `E1` und `G1`. Die Konfiguration bindet
`reviewedResourceTypes: ["goal-visualization"]`; deshalb darf das Review-JSONL
erst nach dem nativen Root-Import der endgültigen PNGs erzeugt werden.

Die aktuelle Bildprüfung umfasst 13 akzeptierte Kandidaten. Für
`9851bd02-ca48-5ce4-8e9f-9ec4af1c43b8`,
`89124b92-5769-5e13-8a5d-78497936260f` und
`9f85de48-1b3f-5afb-8a34-ce94cf7a1b49` stehen noch kleine Bildkorrekturen an;
sie ändern die Lernziele und die unten geprüften Leistungsanforderungen nicht.
Endgültige Bildhashes werden ausdrücklich erst durch die spätere native
Materialisierung gebunden.

## Gezielte Profiländerungen

### Transitmethode (`49bb609a-bfb7-5391-9120-f5fc737efb9a`)

Der Primärfall `fresh-repeating-dips` mit neuen Einbrüchen an den Tagen 0, 4
und 8 bleibt unverändert und unabhängig vom Bild. Der bisherige Sekundärfall
`change-viewpoint` entsprach dagegen nahezu vollständig dem neuen Bildvergleich
aus Transit- und Nicht-Transit-Geometrie. Er wurde durch
`grazing-transit-with-data-gap` ersetzt: zwei nur teilweise erfasste flache
Einbrüche, ein fehlendes Messfenster, eine selbst zu konstruierende streifende
Geometrie und eine begrenzte Kandidatenaussage. Das bleibt qualitativ und
erweitert das Anspruchsniveau nicht.

### Stern-Radialbewegung (`6dca3b0a-c872-543b-808f-97e855f5fafd`)

Der bildnahe Primärfall `alternating-stellar-lines` wurde durch
`phase-series-model-comparison` ersetzt. Eine neue qualitative Tabelle mit
Ruhelage, Rotverschiebung, Ruhelage und Blauverschiebung verlangt den Vergleich
mit konstanter Systembewegung sowie eine eigene Konstruktion des
Stern-Planet-Schwerpunktmodells. Der unabhängige Sekundärfall
`constant-offset-and-face-on` bleibt unverändert.

## KEEP-Prüfung der übrigen Fälle

| Ziel | Bildorientierung | Bestehende unabhängige Leistungsnachweise | Entscheidung |
|---|---|---|---|
| `d024aa45-5dbb-51f7-87a6-9ba939858696` | allgemeine Sternkarten-/Softwareorientierung | konkrete Suchroute für Ort und Abend; Transfer auf neue Breite und Uhrzeit | Profil KEEP |
| `5cf160e5-e0c2-5552-b2cf-0f04871c5e7e` | AE und archivierte Venusdurchgänge | daten- und unsicherheitsgestützte Transitparallaxe; unabhängiger Radartransfer | Profil KEEP |
| `e06dd9c7-8c36-5ca4-880b-57b02d837085` | typische Objektmerkmale | anonymisierte Beobachtungsprotokolle; entscheidende Folgebeobachtung bei Mehrdeutigkeit | Profil KEEP |
| `0b8a4215-e6ed-56c8-88c3-b3a2a99723c7` | Richtung, Zeit, Jahreszeit und Ort | konkretes Beobachtungsfenster; Breiten-/Jahreszeittransfer und Zirkumpolarität | Profil KEEP |
| `6e1cd027-040b-51d9-8764-3cf3daddb5ec` | Konstellationsschemata | eigene Konstruktion eines inneren Planeten; Transfer zu Opposition und Konjunktion eines äußeren Planeten | Profil KEEP |
| `44766569-6379-5fbc-8976-cd3fc2fd6ec4` | Überholen und scheinbare Schleife | selbst konstruiertes Relativbewegungsdiagramm plus historischer Modellvergleich; geänderte Relativgeschwindigkeit | Profil KEEP |
| `23335a89-f8e6-5c22-8705-d71193aeac96` | Beispielreihe Tag 0/9 und 120 Grad | frische datierte Bildreihe mit Randprojektion; unabhängige Breiten-/Kadenzreihe | Profil KEEP |
| `9851bd02-ca48-5ce4-8e9f-9ec4af1c43b8` | Kugelfläche, Solarkonstante und Leuchtkraft | Rechnung mit neuen Daten und Unsicherheit; Transfer auf anisotrope oder abgeschwächte Quelle | Profil KEEP, Bildkorrektur abwarten |
| `bebc3738-0be6-52cf-83db-f8b948f7cf7b` | Kleinwinkelgeometrie zum Sonnenradius | sicher bereitgestellte Messdaten mit Unsicherheit; veränderte Entfernung und Auflösung | Profil KEEP |
| `89124b92-5769-5e13-8a5d-78497936260f` | zwei thermische Spektralkurven | neue Wien-Schätzung mit Unsicherheit; unabhängige Leuchtkraft-/Radius-Gegenprüfung | Profil KEEP, Bildkorrektur abwarten |
| `f9c025ce-4327-5de7-8288-a3358e14a576` | Fraunhoferlinien und Elementvergleich | Übergänge aus Energieniveaus; Vorhersage für neues Ion und Temperatur-/Ionisationsvariation | Profil KEEP |
| `5c5d6698-c056-5850-8ecd-6dd87fb44549` | schematische OBAFGKM-Übersicht | unbekanntes Referenzspektrum; verrauschtes Grenzspektrum mit begrenzter Klassifikation | Profil KEEP |
| `ce037050-f94c-5828-883a-76385c84d1f7` | Blau-/Rotverschiebung zur Ruhelinie | quantitative neue Einzellinie mit Bezugssystem und Unsicherheit; unabhängige Mehrlinienauswertung | Profil KEEP |
| `9f85de48-1b3f-5afb-8a34-ce94cf7a1b49` | Parallaxe und Eigenbewegung | neue astrometrische Daten mit Unsicherheiten und Komponententrennung; Reichweitentransfer bei kleiner Parallaxe | Profil KEEP, Bildkorrektur abwarten |

## Ergebnis

Vierzehn Profile werden vollständig fortgeführt. Zwei Profile erhalten nur die
oben belegten Änderungen an jeweils einem bildnah gewordenen Anwendungsfall.
Kein Fall fragt bloß die Bildantwort ab; die Nachweise verlangen neue Daten,
eine eigene Konstruktion, einen Perspektivwechsel, eine Unsicherheitsbewertung
oder einen unabhängigen Transfer. Es wird weder eine menschliche Freigabe noch
beobachtete Lernendenleistung behauptet.
