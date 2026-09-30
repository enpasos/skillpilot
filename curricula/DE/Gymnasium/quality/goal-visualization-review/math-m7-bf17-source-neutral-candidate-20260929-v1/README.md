# BF17: quellneutrale Bildbindung, KI-Pilot

Stand: 29. September 2026. Diese Akte dokumentiert eine maschinelle Fach- und Bildprüfung. Weder Erzeugung noch KI-QA sind eine menschliche Freigabe oder Erprobung.

## Anlass und bisheriges Bild

Das frühere aktive JPEG zeigte ein in sich rechnerisch stimmiges logistisches Modell. Es blieb bei genau einem GK/LK-Primärbild für das breiter projizierte Ziel jedoch ein zu spezielles Beispiel; die konkrete Klasse ist nicht für jede betroffene GK-Quellenprojektion als Pflichtstoff belegt. Die sachliche Prüfung steht in [der ursprünglichen BF17-Bildakte](../math-m7-bf17cada-scope-audit-20260929-v1/README.md) und der gesonderten Quellensichtungsakte. Das alte Bild ist bytegleich als `previous-primary-logistic.jpg` erhalten (SHA-256 `27a36363a0414cdde9a95c00ec57f0258f213509ec8cae7d685651d328253f37`); auch sein bisheriger Prompt liegt hier als `previous-primary-prompt.de.md`. Das frühere Bild ist nicht als mathematisch falsch bewertet.

## Herkunft und Varianten

Provider: eingebautes OpenAI/ChatGPT-Codex-`image_gen`-Werkzeug. Eine konkrete Modellversion wurde vom Werkzeug nicht ausgewiesen. Der Provider erhielt nur den didaktischen Inhalt und Stilvorgaben, keine technischen Ziel-IDs, privaten Lern- oder Sitzungsdaten. Es wurden keine fremden Bildvorlagen eingespeist. Die tatsächlichen Provider-Prompts liegen in `attempt-1-prompt.md` und `attempt-2-prompt.md`; der gebundene Quellbild-Prompt wurde über `visualization:import --provider='OpenAI / ChatGPT-Codex image generation' --prompt=...` geschrieben.

1. `rejected-candidate-1.png`, SHA-256 `669d8a35677fbe36bb23ae76fa715f80e1bdca46f83919ef5d3a16f3e5f04a23`, 1774×887 RGBA: Die zwei Diagramme zeigten widersprüchliche Startwerte; große transparente Bereiche und Halos verletzten die Lesbarkeit auf wechselndem Hintergrund. Sichtprüfung: **REJECT**, nie gebunden.
2. `candidate.png`, SHA-256 `971e05a64fd0982071ff3e7d574a5c1e385e2b2e560e66c909da6663d13c1f6c`, 1536×1024 RGB und vollständig opak: Ein einziges Diagramm mit fünf Datenpunkten, gekrümmter Modellkurve A und sichtbar abweichender gerader Alternative B. Die Variante wurde nach tatsächlicher Sichtprüfung als KI-Pilot **KEEP** gewählt.

## Fachliche und visuelle Sichtprüfung des gebundenen PNG

Die fünf orangefarbenen späteren Messpunkte liegen auf oder sehr nah an der steigenden, abflachenden blauen Kurve A. Die graue Gerade B beginnt am selben Punkt und verfehlt die späteren Daten. Beide Kurven setzen bei `t=0` an einem eindeutig **positiven** Wert auf der Mengenachse an; die Pfeilbeschriftung `f(0) = a` und `a = Anfangsmenge` ist damit im gezeichneten Wassermengen-Kontext konsistent. Die Darstellung nennt bewusst keine Funktionsfamilie und behauptet keine landesweite Pflicht für Logistik, Wurzel-, rationale oder andere konkrete Modelle. Sie veranschaulicht exemplarisch Modellwahl und Parameterdeutung, ersetzt aber weder Quellenbindung noch Leistungsnachweis.

Das tatsächliche Bild wurde in Originalgröße und gerenderter Ansicht auf fachliche Geometrie, Punkt-Kurven-Passung, Achsen und Startwert, Schreibweise, Lesbarkeit, Altersnähe, Artefakte und Stil geprüft. Sichtbare Wörter sind korrektes Deutsch; die Beschriftungen sind klar und stehen nicht über den Kurven. Ein zweiter, unabhängig betrachtender KI-Agent bestätigte genau diese Bildbefunde, bevor die Bindung erfolgte. Es gab keine menschliche Sichtung oder Freigabe.

## Bindung und Grenzen

Der zweite Kandidat ist als `pilot` mit CC-BY-4.0 und spezifischem Alttext das einzige aktive deutsche Primärbild in Canon; die drei PNG-Kopien in Curriculum, Public und Backend sind bytegleich. Die früheren JPEG-Kopien wurden nach Archivierung aus den aktiven Asset-Verzeichnissen entfernt, weil der Asset-Checker sie sonst zu Recht als verwaist meldet. Die QA bindet `aiApproved=yes` ausschließlich an den oben genannten PNG-Hash und behält `humanApproved=no`. `quality:goal-visualization-qa`, `check:goal-visualization-qa`, `check:goal-visualization-assets`, Rollout-Status und `git diff --check` wurden für diesen Integrationsstand ausgeführt. D-/P-/Seiten-/Kontext-Bindungen sind nach dem Bildwechsel gesondert aktuell zu prüfen; diese Akte behauptet ihren Abschluss nicht.
