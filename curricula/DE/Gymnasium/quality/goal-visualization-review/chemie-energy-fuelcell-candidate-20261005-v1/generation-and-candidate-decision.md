# Energy13: inaktiver Brennstoffzellen-Bildkandidat

Stand: 2026-10-05. Ziel-ID: `b759d50d-0e82-5b10-89a2-fe5271106e50`.

**Inaktiver AI-Kandidat, keine unabhängige V-Freigabe, keine menschliche Freigabe und kein M7-Abschluss.** Dieses Paket verändert keine aktiven kanonischen Texte, Mappings, QA-Einträge, Registry, In-flight-Claims oder Bildkopien.

## Belegter Korrekturbedarf und erhaltene Inhalte

Gegenstand sind der aktuelle Energy13-[Kandidatenstand](../../goal-evidence/2026-10-04/chemie-energy13-candidate-v1/README.md), die dortigen [Bildbefunde](../../goal-evidence/2026-10-04/chemie-energy13-candidate-v1/image-findings.md) und das tatsächlich betrachtete aktive JPG sowie seine gespeicherte 360-Pixel-Sichtkopie.

Aktives Original: `curricula/DE/Gymnasium/visualizations/chemie/b759d50d-0e82-5b10-89a2-fe5271106e50/b759d50d-0e82-5b10-89a2-fe5271106e50.jpg`, 2752 × 1536 Pixel, SHA-256 `c049a2b1db1d5473bf9c134654f434a8c277a1335e68c0bf03d6853ed1f060bc`.

Nur zwei belegte Schwächen motivieren die Korrektur: Die Überschrift „Einsatz als Energiespeicher“ schreibt der Brennstoffzelle die Speicherrolle zu; die tatsächliche 360-Pixel-Ansicht macht Ladungswege und Koeffizienten der drei dichten Teilflächen klein. Der ursprüngliche H₂-Tank/Zellen/Verbraucher-Kontrast wird erhalten und vergrößert. Der Generator und das JPG-Format sind kein Änderungsgrund.

Die ursprünglichen Elektronen stehen korrekt in den grauen Elektrodenbändern neben dem PEM; H⁺ nutzt den Membranweg; Anode (−) und Kathode (+) sind korrekt. Frühere gegenteilige Deutungen wurden ausdrücklich zurückgenommen. Dieser Kandidat gibt diese richtigen Bestandteile nicht als fachliche Fehler aus.

Erhalten: H₂-Zufuhr zur Anode, O₂-Zufuhr zur Kathode, H₂O-Abfuhr, Elektronen außen durch den Verbraucher, Protonen durch die Membran und sämtliche korrekt ausgeglichenen ursprünglichen Teil-/Gesamtreaktionen. Die Anodenreaktion bleibt `H₂ → 2 H⁺ + 2 e⁻`; bei Addition ist sie zu verdoppeln. Darstellungskorrektur: ein großes Modell mit getrenntem H₂-Speicher, danach drei große Reaktionszeilen statt dreier überladener Tafeln und umlaufender Kleinschrift. Titel: „Brennstoffzelle: Energiewandler“.

## Tatsächliche Erzeugung

- Provider: **OpenAI / ChatGPT Codex imagegen**, eingebautes Tool `image_gen.imagegen`; zugrundeliegendes Modell vom Tool nicht offengelegt.
- Ein tatsächlicher Generierungsversuch, Edit-Referenz ausschließlich das unveränderte aktive JPG.
- Tatsächlicher Providerprompt: [prompt-provider.txt](prompt-provider.txt), ohne technische Ziel-IDs.
- Ergebnis: [candidate-v1.png](candidate-v1.png), PNG **1672 × 940 Pixel**, native Größe nahe 16:9.
- SHA-256: `fdb49b85bc5c1329c63024ae1cad443fd2f8b71c48cd3c07f8eb5f01162b9cc4`.
- Erzeugungsquelle: `/home/enpasos/.codex/generated_images/01a108d7-2ac7-77a1-8a32-d38f235133f8/exec-e273dc42-72e3-4133-ac1b-670c3b403f69.png`.
- Unveränderte Bytekopie; keine programmatische Bildzeichnung, Pixelkorrektur oder SVG-Ersetzung.
- Erstellertriage: tatsächliche native Darstellung angesehen; Tank/Umwandler, Ladungswege, Elektrodenzeichen und Formelzeilen entsprechen dem gezielten Erzeugungsauftrag. **Zur unabhängigen Prüfung bereit, weiterhin inaktiv.**

Der dokumentierte [DOE-Funktionsablauf](https://www.energy.gov/cmei/fuels/fuel-cell-animation-text-version) wurde gelesen: Protonen passieren den PEM, Elektronen den Außenkreis; Anode ist negativ, Kathode positiv, dort entsteht Wasser. Diese Quelle ist eine fachliche Kontrollreferenz, keine übernommene Abbildung und kein Ersatz für eine tatsächliche PNG-Prüfung.

## Vorbereitungshelper und offene Prüfung

Der bestehende Helper wurde mit explizitem Provider, Fach und Landschaft verwendet:

```bash
npm --prefix app run visualization:prepare -- b759d50d-0e82-5b10-89a2-fe5271106e50 --landscape=curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json --subject=chemie --provider='OpenAI / ChatGPT Codex imagegen' --review-status=ai_candidate
```

Der Helper schreibt ausschließlich unter ignoriertem `tmp/goal-visualizations/<goal-id>/`. Er besitzt keine Providerprompt-Override-Option; der tatsächliche hier gespeicherte Prompt wurde zusätzlich unverändert als `prompt-provider.txt` dort abgelegt und mit Pfad/Hash im lokalen Helper-Metadata gebunden. Der historisch benannte Helperdateiname `nano-banana-prompt.de.md` bezeichnet nicht den tatsächlich genutzten Provider. **Kein Import wurde ausgeführt.**

Bei 360 Pixel Breite erscheint der Kandidat ungefähr 360 × 202 Pixel groß, bei 680 Pixel Breite ungefähr 680 × 382. Die spätere unabhängige Prüfung muss das tatsächliche PNG nativ und in diesen Ansichten prüfen, einschließlich jedes Formelzeichens, Leiteranschlusses, Pfeils, der Membrangrenze und der verfügbaren Bildhöhe. Die Elektronensymbole im grauen Streifen sind schematische Ladungsträgermarkierungen, keine stöchiometrische Teilchenzählung.

Offen bleiben zwei unabhängige D-Reviews und aktuelle Ziel-, Seiten-, Kontext-, Quellen-, A/M/P- und V-Bindungen nach einer angenommenen Beschreibungsrevision. Die Bildidee übernimmt keine zusätzliche Kompetenz zur Wasserstoffherstellung oder Elektrolyse; Tank und Umwandler sind die relevante Systemgrenze. Formatentscheidung: nahe native 16:9-PNG-Größe gemäß Goaltext, freundliche abstrakte Comic-Sprache. Eigene didaktische Medien folgen der CC-BY-4.0-Inhaltszuordnung aus `LICENSING.md`; Herkunft und Zuordnung sind keine Qualitätsfreigabe.

Strenger Nettozuwachs: **0**, neue fachliche Abschlüsse: **0**, wiederhergestellte aktive Bindungen: **0**.
