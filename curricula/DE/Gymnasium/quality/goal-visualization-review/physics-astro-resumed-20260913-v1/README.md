# Sternradius: gezielte Wiederaufnahme am 13. September 2026

Lernziel: `6a73cacc-e86d-5248-a180-fd3da8454b0f` – Sternradien aus HRD-Daten abschätzen.

Die frühere Astro-Rückstellung und ihre Nano-Banana-Prüfnachweise bleiben
unverändert. Unter der Produktentscheidung vom 13. September wurde das fehlende
Bild gezielt mit dem integrierten OpenAI-Bildwerkzeug `image_gen` erzeugt. Eine
exakte Modellversion wurde vom Werkzeug nicht offengelegt. Keine CLI- oder
Gemini-Erzeugung wird für diese neuen Dateien behauptet.

## Tatsächlicher Ablauf

1. Aktuelles kanonisches Ziel, frühere dokumentierte Bildfehler und die vorhandenen
   Physik-Stilreferenzen `3a4b2f86-5c59-5429-8fb4-75d9b2589cb5` und
   `946ecf7b-0fcf-5776-9fb6-d397423c2f12` visuell geprüft. Die Referenzen dienten
   der textuellen Stilbeschreibung; sie wurden nicht als Bildreferenz an den
   ersten Generierungsaufruf angehängt.
2. `stellar-radius.prompt.de.md` war der tatsächliche Prompt für Kandidat 01.
   Originalauflösung: 1672 × 941 Pixel. SHA-256:
   `3eb4d10a3e1ee77fa56c36f18b0e2d281bcf17a81ea09b62acad2829709d3300`.
   Root-Prüfung: Formeln, Achsen und Beschriftung passen; die Scheibenradien
   stehen jedoch ungefähr im Verhältnis 1,70:1 statt 2:1. **Abgelehnt**, nicht
   importiert. Richtige Beschriftung heilt eine irreführende Zeichnung nicht.
3. `stellar-radius-correction-02.prompt.de.md` war der tatsächliche Korrekturprompt.
   Kandidat 01 war dabei die einzige angehängte Bildreferenz. Kandidat 02 bleibt
   1672 × 941 Pixel groß; SHA-256:
   `19b3c4abeca32042eba2d32309d8669a4a07464acbfa7e05da17d37c8dbe40b9`.
4. Root hat den korrigierten Raster vollständig betrachtet: HRD-Achsen und
   gleiche Temperatur sind korrekt, die Wurzel umfasst den gesamten Bruch,
   vierfache Leuchtkraft bei gleicher Temperatur ergibt doppelten Radius.
   Die Scheibendurchmesser sind ungefähr 154 und 320 Pixel; die geringe
   zeichnerische Abweichung ist für die ausdrücklich schematische Darstellung
   vertretbar. Der Vergleich bei gleicher Leuchtkraft zeigt die entgegengesetzte
   Temperatur-Radius-Abhängigkeit korrekt. Heller Hintergrund, gelbe Sterne und
   lesbare Handschrift passen zu den vorhandenen Bildern.
5. Eine separate Agentinstanz prüfte Kandidat 02 ohne die Erzeugungsprompts und
   ohne die vorangegangenen Kandidatenbefunde. Ihr hashgebundenes Ergebnis steht
   in `stellar-radius-candidate-02.independent-ai-review.json`: **accept für
   AI-Pilot**, keine fachlich oder visuell blockierenden Befunde.

## Lokale Adoption am 13. September 2026

Kandidat 02 ist mit ausdrücklichem Provider `image_gen` und Status `pilot`
über `scripts/import_goal_visualization.mjs` nach erfolgreichem Dry-run
übernommen. Der detaillierte Beleg steht in
[`stellar-radius-adoption.receipt.json`](stellar-radius-adoption.receipt.json).
Alle drei PNG-Kopien behalten den oben genannten Hash und 1672 × 941 Pixel:

- `curricula/DE/Gymnasium/visualizations/physik/6a73cacc-e86d-5248-a180-fd3da8454b0f/6a73cacc-e86d-5248-a180-fd3da8454b0f.png`
- `app/public/assets/goal-visualizations/physik/6a73cacc-e86d-5248-a180-fd3da8454b0f/6a73cacc-e86d-5248-a180-fd3da8454b0f.png`
- `backend/src/main/resources/static/assets/goal-visualizations/physik/6a73cacc-e86d-5248-a180-fd3da8454b0f/6a73cacc-e86d-5248-a180-fd3da8454b0f.png`

Der neue primäre Link steht ausschließlich am Radiusziel in
`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`.
Alle anderen Ziele und alle anderen Physics-V-QA-Datensätze blieben unverändert.
Der Radiusdatensatz in `curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json`
enthält jetzt die aktuelle Assetbindung und `aiApproved: yes` mit eigenem
passendem Bildhash; `humanApproved: no` bleibt erhalten. Die neue datierte
Disposition steht in `../physik-2026-09-13-stellar-radius-ai-pilot.md`.

[`stellar-radius-candidate-02.prompt-history.de.md`](stellar-radius-candidate-02.prompt-history.de.md)
bewahrt beide tatsächlichen Prompts und ihre Referenzstrategie. Derselbe Verlauf
steht in der kanonischen `prompt.de.md`. Dieses kombinierte Metadatadokument
wurde nicht als neuer Generierungsaufruf ausgegeben. Bei der Adoption wurde
kein Bild erzeugt oder verändert.

## Fachlicher Profilabgleich und Registry-Übergabe

Der ursprüngliche individuelle Radius-Profilkörper wurde gegen das aktuelle
Lernziel und das vollständig betrachtete Bild geprüft. Sein Fall mit neunfacher
Leuchtkraft verlangt einen dreifachen Radius mit Flächenbegründung; er kopiert
nicht den Bildfall mit vierfacher Leuchtkraft. Bei gleicher Leuchtkraft und
doppelter Temperatur ist der zweite Transferfall mit einem Viertel des Radius
korrekt. Fehlende Temperaturinformation und die Richtung einer
Temperaturschätzunsicherheit bleiben eigenständige Anforderungen im Profil.
Das Bild ist dafür keine Lernleistungsevidenz. Der konkrete Abgleich steht in
[`stellar-radius-profile-context-review.json`](stellar-radius-profile-context-review.json).

Die ursprünglichen `profiles.config.json`, `profiles.candidates.json` und
`profiles.review.jsonl` unter
`curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-final-astro-consolidation-v1/`
bleiben byteidentisch erhalten. Neun unveränderte Originalzeilen stehen in
[`profiles.retained-nine.review.jsonl`](profiles.retained-nine.review.jsonl).
Das neue, nativ materialisierte Radiusprofil bleibt `ai_candidate` /
`needs_human_review` mit E1/G1 und unverändertem fachlichem Profilkörper;
seine neue Inputbindung berücksichtigt nun den aktuellen Bildhash.

Root erhält genau diese disjunkten neuen Konfigurationen als Ersatz für den
bisherigen Astro-Zehnerverweis in der zentralen Registry:

- [`profiles.retained-nine.config.json`](profiles.retained-nine.config.json)
- [`stellar-radius.profiles.config.json`](stellar-radius.profiles.config.json)

Diese Agentinstanz hat die zentrale Registry nicht bearbeitet. Root übernimmt
den gemeinsamen Buchbuild, die neuen Seiten-/Paketbindungen und die zentralen
Qualitäts-, Maturity-Floor- und D/P/A/M/V-Checks. Das bisherige Radiusziel besitzt
dadurch noch keinen neuen D-Abschluss; alte D-Runden werden nicht umgeschrieben.

## Ausgeführte lokale Prüfungen

- `check:goal-visualization-qa -- --subject=physik`: aktuell.
- `check:goal-visualization-approval-coverage -- --subject=physik`: bestanden,
  460 aktive Physikbilder mit vorhandener Human- oder aktueller AI-Freigabe.
- `node scripts/check_goal_visualization_assets.mjs`: bestanden,
  1557 Links in 21 Landschaften; der native Checker besitzt keinen Ziel-Filter.
- `quality:positive-goal-evidence-candidates` für das neue Radiusprofil:
  nativ geschrieben und anschließend ohne `--write` erfolgreich verifiziert.
- `quality:positive-goal-evidence:check` für die Retentionskonfiguration:
  neun `needs_human_review`, keine blockierenden Befunde.
- `check:goal-visualization-rollout-coverage:physik`: bestanden; der
  Physik-Rolloutstatus wurde aus den neuen Eingaben regeneriert.
- Zusätzlicher Integritätsabgleich: drei bytegleiche Bildkopien, unveränderte
  historische Dateien, neun byteidentische Profilzeilen, unveränderter
  Radius-Profilkörper und unveränderte übrige Kanonik-/V-QA-Datensätze.

## Grenze dieses Nachweises

Dies ist eine lokale AI-Pilot-Adoption, keine menschliche Freigabe, keine
Lernleistungsprüfung und kein Abschluss aller fünf Curriculum-Gates. Sie
behauptet weder ein M6-/M7-Upgrade noch Deployment oder reale Host-Akzeptanz.
Die ursprünglichen zurückgestellten Artefakte werden nicht nachträglich geändert.
