# Mathematik: Prompt 5 als nutzergewähltes Pilotbild

Review date: 2026-09-26

Die zuvor zurückgestellte Grafik wurde auf ausdrückliche Entscheidung des
Product Owners **unverändert** als Pilotbild eingebunden. Das ist eine
Freigabe zur vorläufigen Anzeige der Bildidee, keine maschinelle fachliche
V-Freigabe und keine menschliche Release-Freigabe.

| Goal ID | Title | Decision | Notes |
| --- | --- | --- | --- |
| `121e3fdf-54d2-4d46-bc2d-f6e725f10f41` | Figuren im Koordinatensystem und Grundriss | `accepted_pilot_display_with_known_defect` | Exakt `tmp/prompt_5.png`, SHA-256 `9a388e26e0e16f2ade9a92f92545fe1e5457f90a35dd8e6eabecb37aa3b2a5c2`. Punkt A steht links der x=−3-Gitterlinie, obwohl das Label `A(−3,−2)` lautet. Die Zuordnungsidee ist sichtbar, aber die Punktlage darf weder als korrekte Musterlösung noch als Prüfungsgrundlage dienen. |

Kanonisches Asset, Web-Asset und Backend-Static-Asset sind bytegleich. Der
kanonische `resourceLinks`-Eintrag trägt `reviewStatus: pilot`; die aktuelle
Bild-QA führt denselben Hash als `available`, aber `contentApprovedChatGpt: no`
und `aiApproved: no`. Damit bleibt Gate V offen. Die frühere
`deferred_quality_review`-Entscheidung und ihr Befund bleiben historisch
erhalten. Ein fachlich exaktes Ersatzbild würde eine neue zielgenaue Prüfung
und aktuelle abhängige Bindungen erfordern.

Der allgemeine CI-Check für aktive Bildfreigaben erlaubt ausschließlich für
diese Kombination aus Fach, Ziel-ID und exaktem PNG-Hash eine ausdrücklich
nutzergewählte **Anzeige-Ausnahme**. Sie ist keine fachliche Freigabe; andere
ungeprüfte oder ersetzte Assets bleiben im Check gesperrt, und der zentrale
M7-Fünf-Gate-Bericht zählt dieses Bild weiterhin nicht als V-Abschluss.

Die bisherige bilinguale D-Textentscheidung bleibt auf demselben
Ziel-Fingerprint; sie ist aber **keine** Prüfung der neu illustrierten
Lernzielbuchseite. Der alte D-Seitenbeleg hatte keine Visualisierung,
während das aktuelle Review-Atlas-Modell die neue Pilotgrafik enthält und
dadurch einen anderen Seiten-Fingerprint erhält. Der aktualisierte P-v2-Fall
liegt separat unter
`curricula/DE/Gymnasium/quality/goal-evidence/m7-coordinate-user-pilot-current-20260926-v1/`;
er nutzt die fehlerhafte Punktlage nicht als Aufgaben- oder Lösungsvorlage.
Das Cockpit kann den kanonischen Pilot-Link anzeigen; das öffentliche
Lernzielbuch unterdrückt Bilder ohne separate Publikationsfreigabe weiterhin.
