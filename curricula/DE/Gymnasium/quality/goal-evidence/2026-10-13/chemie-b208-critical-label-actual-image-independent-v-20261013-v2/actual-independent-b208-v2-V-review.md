# Unabhängige tatsächliche b208-v2-Bildprüfung

Entscheidung: **`accepted_pilot_after_regeneration`**, ausschließlich maschinelle V-Prüfung des exakten inaktiven v2-PNG. Die eigene v1-Ablehnung und sämtliche sechs v1-Nachweisdateien bleiben bytegenau unverändert.

Der neutrale FIRST-Inputseal wurde vor der neuen Bildsichtung gespeichert. Danach wurden das wirkliche PNG sowie die tatsächlichen Browseransichten bei 360 und 680 Pixeln mit `view_image` geöffnet. Das ganze nachher-Ziel, beide ganzen DE/EN-Fälle und das ganze b208-Profil wurden erneut aus den neutral gebundenen Dateien gelesen. Das eigene neue Urteil wurde anschließend separat gespeichert und gehasht, bevor Autor-Selbstprüfungsnotizen oder andere v2-Bildurteile gelesen wurden. Solche Meinungen wurden für die Prüfung nicht benötigt. Der tatsächliche Providerprompt wurde erst nach diesem Urteil gelesen.

| Bindung | Exakter Stand |
|---|---|
| Ziel | `b208b1a5-c609-53a1-8add-979417a93b7d` |
| DE-Titel | Textilfarbstoffe über Farbstoff-Faser-Wechselwirkungen beurteilen |
| DE-Zieltext | Die lernende Person kann ausgewählte Bindungs- und Wechselwirkungstypen zwischen Farbstoff-Molekülen und Faser-Molekülen beschreiben und die Eignung von Farbstoffen als Textilfarbstoff beurteilen. |
| PNG-SHA-256 | `2b0140d86abd555d96950e4e1b77debd39f50427ee1dc794bb74f0176ab55645` |
| Vorgeschlagene öffentliche URL | `/assets/goal-visualizations/chemie/b208b1a5-c609-53a1-8add-979417a93b7d/b208b1a5-c609-53a1-8add-979417a93b7d.png` |
| Tatsächlich gesehene Größen | 1672 × 941; Browser 360 × 203 und 680 × 383 |

## Tatsächliche Lesbarkeit

Bei 360 Pixeln sind das eine große `–NH₃⁺`/`–SO₃⁻`-Paar und die Gegenladungen jetzt lesbar. Die zweizeiligen Beschriftungen „Reaktiv- / farbstoff“ und „Dispersions- / farbstoff“ sind deutlich größer als im abgelehnten ersten Kandidaten. Die konkrete Farbstoffklasse muss nicht mehr aus sehr kleiner einzeiliger Schrift entziffert werden. Ebenso bleiben der O–C-Kontakt, der feste rote Bindungsstrich, die blauen gestrichelten Kontakte und die Farbstoffpositionen unterscheidbar. Die großen Faser-, Kontakt- und Bedingungsbeschriftungen sind lesbar. Damit ist der konkrete v1-Blocker für die exakten neuen Bildbytes behoben.

Bei 680 Pixeln sind auch Gruppen- und Ladungsnotation klar lesbar. Die Bildhöhe von 383 Pixeln liegt unter der etwa 448-Pixel-Kappe der aktuellen GoalCard; `h-auto max-h-[28rem] w-full object-contain` in `app/src/components/GoalCard.tsx:672` schneidet das 16:9-Bild nicht ab. Die Beurteilung wurde aus den tatsächlichen Ansichten getroffen, nicht aus einem behaupteten Mindestschriftmaß im Providerprompt.

## Fachliche und visuelle Beobachtung

Wolle: Das protonierte Aminogruppenmodell auf dem Faserband und das negative Sulfonat beim Farbstoffmodell bilden eine gestrichelte elektrostatische Verbindung. „sauer“ begrenzt die gezeigte Protonierung. Es wird keine neue kovalente Farbstoff-Faser-Bindung gezeichnet und keine Vollstruktur behauptet. Geeignete weitere Wechselwirkungen sind durch das ausgewählte Beispiel nicht ausgeschlossen.

Baumwolle: „Reaktivfarbstoff“ begrenzt die Aussage. Das Faser–O–C–Farbstoff-Motiv enthält einen festen O–C-Kontakt, der zu „kovalent“ passt. Es ist ein zulässiges schematisches Produkt-/Kontaktmodell; weder ein vollständiger Triazinring noch eine Valenzinventur oder bilanzierte Reaktion ist behauptet. Das Entfernen weiterer isolierter O-Markierungen reduziert Nebendetails ohne eine zusätzliche falsche chemische Aussage.

Polyester: Neutrale Farbstoffmodelle befinden sich innen beziehungsweise zwischen den Faserketten. Gestrichelte Kontakte behaupten keine neue ionische oder kovalente Befestigung. „Dispersionsfarbstoff“ und „eingelagert“ sind mit dem ausgewählten Fall vereinbar. Die Aufnahme ist kein bloßes Außenanlagern oder Auswaschen.

Alle drei Panels sind gleichrangig. „Ausgewählte Beispiele“ sowie „Farbstoff + Faser + Bedingungen“ begrenzen den Vergleich auf konkrete Systeme; eine allgemeine Stärke-, Eignungs- oder Waschbeständigkeitsrangfolge fehlt. Das Bild fügt keine Lösung, Bewertung oder praktische Durchführung hinzu. Die freundliche abstrakte Zeichnung mit warmen Panels, klaren Konturen und kohärenten roten Farbstoffmodellen passt zum bisherigen Bildstil. Keine sichtbaren technischen IDs, Logos, Wasserzeichen oder kopierten Arbeitsblattteile sind erkennbar. Die genaue Altbeschreibung benennt die drei Systeme und die Grenzen passend.

Diese fachliche Interpretation entspricht weiterhin den zuvor geprüften Primärbelegen für [Wollgruppen und anionische Farbstoffe](https://pubs.acs.org/doi/10.1021/acsomega.4c00560), [kovalente Triazin-Reaktivfarbstoffbindung an Cellulose](https://pubs.acs.org/doi/10.1021/acsami.0c18613) und [Diffusion einzelner Dispersionsfarbstoffmoleküle in Polyester](https://www.jstage.jst.go.jp/article/fiber1944/22/1/22_1_33/_article). Kein neuer Volltextzugriff wird für diese erneute Bildprüfung behauptet.

## Grenzen

Die separaten inaktiven QA-Felder verwenden vorhandene Ledger-Felder und binden `aiApproved: "yes"` an genau dieses PNG. Menschenfelder werden nicht geschrieben. Die whole-CAS bleibt unverändert und der darin vorgeschlagene Link bleibt inaktiv. Die Prüfung gewährt keine D/P/A/M-Neubindung, e560-Freigabe, menschliche Zustimmung, praktische Durchführung, Host-Abnahme, aktive Integration, Deployment oder vollständige M7-Aussage. Generierung und passende Hashes allein ergaben die Entscheidung nicht; der tatsächliche neue Inhalt wurde in allen drei Größen angesehen.
