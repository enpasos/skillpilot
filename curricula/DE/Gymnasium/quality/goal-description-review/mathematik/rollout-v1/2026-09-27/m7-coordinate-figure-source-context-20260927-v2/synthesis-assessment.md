# D-Synthese: Koordinatenfigur auf der aktuellen Atlas-Seite

Stand: 27.09.2026. Geltungsbereich ist allein die gebundene nationale
Lernzielbuch-Seite für `121e3fdf-54d2-4d46-bc2d-f6e725f10f41` unter
`Mathematik > Sekundarstufe I > Jahrgangsstufe 8 > Weitere Kompetenzen`.

Beide unabhängigen aktuellen Runden sind `keep`-AI-Kandidaten. Sie binden
dasselbe Bundle `sha256:117e14245560081a515c2a811c61f624c3538e8a07d15abab78f7e508e6d95bc`,
BookModel `sha256:551a2fe8c32e048026a390a97672abdc8930cd026a116c65882f6520b9686ccf`,
Review-Input `sha256:8604851d69e0ec7f41eeff3b812145a78ce17c828eb31fe9230ab967b3789982`,
Zielfingerprint `sha256:683505f41544c574e7242f09a4703bd2de8d1b2473b1902cd5a4351096335e7a`
und Seitenfingerprint `sha256:fe75b8ef6ef4415f2b167429bb0655f252e5e34cf4d49df22fe30b987a1356cf`.
Das Bild ist mit `sha256:4f909534405c0b08a491c1bc83131721b59b2538626228d6d21aa45033efae15`
gebunden. Die getrennten Kampagnen, Independence-Gruppen, Run- und Record-IDs
sind in `dual-summary.json`, `synthesis-decisions.json` und der Resolution
bytegenau nachvollziehbar. Die Dual-Summary meldet eine inhaltliche
Abweichung bei `understandingEvidence` und `rationale`, keine Abweichung im
`keep`-Votum. Die Synthese wählt Runde A für das beobachtbare Evidenzprofil,
weil sie den sinnvollen digitalen Werkzeugeinsatz ausdrücklich prüft; die
abweichende Formulierung von B bleibt in ihren Record-Bytes und als Dissent
gebunden. Der Grundriss in A ist ein möglicher Transferfall, keine zusätzliche
Pflichtformulierung für das kanonische Ziel.

Der Jahrgang-8-Pfad des bundesweiten Atlas ist mit dem amtlichen hessischen
KC-Band 7/8 für Vierquadranten-Koordinaten und dynamische Geometriesoftware
vereinbar. Er ist keine bundesweite Jahrgangsvorgabe. Berlin-Brandenburg stützt
das Figurenzeichnen mit vier Quadranten und digitalem Geometriewerkzeug direkt.
Die Verbindung von Koordinatenfigur und Grundriss ist eine didaktische
Synthese benachbarter Hamburger 5/6-Punkte, kein wörtlicher Einzelbeleg;
Hamburg gehört nicht zu den fünf effektiven Länderkontexten der Seite und
belegt insbesondere keine HE-Platzierung. Der ältere BB-Quellensnapshot
formuliert die Zuordnungsfacette breiter, als sein enger `sourceRef` allein
trägt. Die Quellenbezüge und Grenzen stehen im gebundenen `bundle/criteria.md`.

**Separat offen:** Die generierten HE-spezifischen G8- und G9-Kompositionsansichten
stellen dieselbe ID unter Jahrgangsstufe 5. Die direkten HE-Mappings nennen
dagegen G8 `7G.1`, G9 `7.1`/`7.2` und KC 7/8. Der vorliegende D-Beschluss
repariert und bestätigt diese fehlerhafte Projektion nicht. Die Ursache und
erforderliche Generator-/Policy-Korrektur sind im älteren
`goal-visualization-review/m7-coordinate-figures-replacement-20260927-v1/source-and-placement-audit.md`
dokumentiert; dessen `block`/`keep`-Befund und D-HOLD beschreiben den Stand
**vor** den beiden neuen, quellengebundenen Runden.

Die lokale Standalone-Validierung ergibt `strictDescriptionComplete=true` und
einen Index mit genau diesem einen Ziel. Eine D-Registrierung des neuen
`resolution-index.json` ist für die exakt gebundene nationale J8-Seite
verantwortbar, solange der HE-J5-Projektionsfehler separat offen und sichtbar
bleibt. Der bislang zentrale `resolution-index.coordinate-image-hold-20260927-v1.json`
enthält diese ID nicht; eine zusätzliche Registrierung erzeugt dort deshalb
keinen Doppelanspruch. Registry und zentrale Statusdateien wurden hier nicht
geändert. Bild-QA bleibt `review_candidate`, die Grafik ist Unterrichtshilfe
und kein Lernnachweis. Diese AI-Synthese ist keine menschliche Freigabe und
behauptet weder vollständige Quellenabdeckung noch M7-Abschluss.

Paketprüfung: `app/node_modules/.bin/tsx
curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-coordinate-figure-source-context-20260927-v2/materialize-resolution.ts
--check` meldet `strict=1/1` und prüft erneut aktuelle Ziel-, Seiten- und
Bildbindung, die beiden Reviews, Synthese, Resolution und Standalone-Index.
