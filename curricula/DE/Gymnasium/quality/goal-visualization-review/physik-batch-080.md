# Physik goal visualization review – Batch 080

Review date: 2026-08-28

Scope: fachliche Korrektur der vier in Batch 019 fail-closed abgelehnten Magnetfeld-/Induktionsvisualisierungen. Alle Kandidaten wurden mit Google Gemini / Nano Banana Pro erzeugt, zunächst mit `--no-import` in Originalauflösung geprüft und erst nach einer zweiten unabhängigen fachlichen Sichtprüfung importiert. Human-Review-Felder blieben unverändert offen; es wurde kein SVG oder manuell neu gezeichnetes Ersatzbild verwendet.

| Goal ID | Goal title | Decision | Notes |
|---|---|---|---|
| `7fe6f8a1-5580-4e37-bf8e-9772964a6b0a` | Ladungsträger in Magnetfeldern bei beliebigem Eintrittswinkel beschreiben | `accepted_pilot_after_regeneration` | Kreis-, Gerad- und offene Schraubenbahn sind getrennt. Die Geschwindigkeitszerlegung steht in einem eigenen Inset und in einer echten Vektorgleichung; kein nichttangentialer lokaler Geschwindigkeits- oder Kraftpfeil verfälscht die Helix. Reviewed asset hash: `sha256:0d642d4cec5c2c37dbfbcec4545716359263a4da3eeac96f07096636c13b462b`. |
| `eb1ea150-ec6c-5000-bce3-f46c820dccf8` | Induktionsgesetz und Lenz’sche Regel | `accepted_pilot_after_regeneration` | Die Gleichung enthält den Faktor N. Die ausdrücklich vom Magneten aus gesehene Stirnansicht zeigt einen gegen den Uhrzeigersinn fließenden Induktionsstrom; dadurch wird die zugewandte Seite zum Nordpol und stößt den sich nähernden Nordpol konsistent ab. Reviewed asset hash: `sha256:dc74c6f10abfa4bff8f83f1e5e6bf401c26798cbb9b5067616bbb196e515f406`. |
| `a1389d4e-dc97-5557-babe-a31a2bd57217` | Energie gespeicherter Magnetfelder | `accepted_pilot_after_regeneration` | Beide Stromkreise sind geschlossen. Der Strom tritt bei identischer Spulenorientierung jeweils am oberen Anschluss ein; das Magnetfeld behält beim Entladen seine Richtung und wird nur schwächer. Formel und leuchtende Last sind korrekt. Reviewed asset hash: `sha256:afba99c847d0ba7af902e019a712256ac908a84a36bb5da675e446ebf9723054`. |
| `d18d4190-ddc1-5181-b1b6-e79947b737c2` | Induktionsgesetz in Ableitungsform anwenden | `accepted_pilot_after_regeneration` | `U_ind(t) = −N · dΦ(t)/dt` ist vollständig; Cosinus-Fluss und induzierte Sinusspannung sind an gemeinsamen Viertelperiodenmarken korrekt vorzeichenbehaftet und phasenverschoben. Reviewed asset hash: `sha256:42ae30f63a9d1f48b08dc77f1cd052fe542225cd3b2a3c0e8527aadc183531a6`. |

## Rejected generated candidates

- `7fe6f8a1…`: `sha256:5eda19e4…` falsche Umlaufrichtung; `sha256:d066f0b3…` falscher Lorentzkraftvektor; `sha256:0db98588…` widersprüchliche Kreisbahngeometrie; `sha256:b15601c3…` Resultierende nicht tangential zur Helix; `sha256:1245e1e6…` nichttangentiale lokale Vektoren trotz separatem Inset.
- `eb1ea150…`: `sha256:f9f29e3d…` Stromrichtung ließ sich durch die gezeichneten Mehrfachwindungen nicht bis zum behaupteten Spulenpol verfolgen.
- `a1389d4e…`: `sha256:f64c0cdb…` Entladestrom gegenüber dem Ladestrom umgekehrt; `sha256:83f00eef…` gleichgerichtete Pfeile auf Hin- und Rückleitung; `sha256:a65fb4fb…` grammatisch fehlerhafte Beschriftung; `sha256:03bcdcfa…` gleichgerichtete Pfeile auf innerem und äußerem Feldlinienweg; `sha256:b4207526…` sichtbare Lücken an den Spulenanschlüssen.
- `d18d4190…`: `sha256:1d0d9cf9…` Spannungskurve zeigte im Wesentlichen `−Φ(t)` statt der negativen zeitlichen Ableitung.

Die zuvor aktiven und fail-closed abgelehnten Assets mit den Hashes `sha256:2c269107…`, `sha256:2df8dba6…`, `sha256:1414df8a…` und `sha256:399b46ea…` wurden durch die oben hashgebunden freigegebenen Nano-Banana-Pro-Bilder ersetzt.
