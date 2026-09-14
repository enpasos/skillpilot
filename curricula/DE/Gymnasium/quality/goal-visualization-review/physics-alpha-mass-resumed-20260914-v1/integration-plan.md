# Vorbereiteter gezielter Alpha-Bildimport

Stand: 14. September 2026. Noch kein Import, keine P-Materialisierung und keine Änderung an Canonical, QA, Registrierung oder globalen Artefakten. Root schließt zuerst B057 am bisherigen Bildstand ab. Erst danach wird der aktuelle Zustand erneut geprüft und die Integration ausgeführt.

Die vollständige unabhängige Endbildprüfung steht in `alpha-mass.independent-ai-review.json`; sie wurde vor dem Lesen der P-Historie abgeschlossen. Die Entscheidung lautet `accepted_pilot`, `humanApproved=false`, `deviceApproved=false`. 360-Pixel-Ansichten benötigen Vergrößerung für Formeln und Modellgrenze. `generation-history.json` dokumentiert beide tatsächlichen Builtin-Edits. Der alte Prompt und der verworfene erste Entwurf sind byteidentisch erhalten.

## 1. Unmittelbare Vorprüfung nach B057

Die Zielbeschreibung und der unveränderte Profilkörper müssen weiterhin mit den in `alpha-mass.profile-context-preparation.json` erfassten Inhalten übereinstimmen. Bei Drift wird diese Vorbereitung neu eingeordnet, statt aktuelle Änderungen zurückzusetzen. Vor jedem Schreiben die einzelnen betroffenen Dateien, die übrigen Canonical-Ziele, übrigen QA-Einträge und historische P-Dateien als Schutzbaseline sichern. Der Gesamtdateihash des Canonical-JSON allein eignet sich wegen paralleler B057-Arbeit nicht als semantischer Schutzvergleich.

Der geprüfte finale PNG-Hash muss `f412bfcd05c15149981d33a08fbd2298b68c323618b2a7a9f62e1e670997b580` sein. Die drei noch aktiven ursprünglichen JPGs müssen zunächst weiter `8cc3e30f2f87c1a18ce8e5a6badb2ae6b2725a5808df911272fec49d32d283ec` ergeben. Die bereits archivierten Promptbytes bleiben erhalten. Der neue Rekonstruktionsprompt wurde aus dem finalen Bild formuliert und nicht an einen Generator gesendet.

Die native Vorbereitung vor der ursprünglichen Generierung ist nicht Gegenstand dieses Belegs. `visualization:prepare` jetzt erneut auszuführen würde einen neuen Standardprompt unter `tmp/` schreiben und keine historische Toolausführung beweisen. Hier wird deshalb der tatsächlich ausgeführte zweite Prompt explizit importiert.

## 2. Nativer Import-Dry-run und späterer Import

Vorbereiteter Befehl, bisher nicht ausgeführt; aus dem Repository-Root:

```bash
node scripts/import_goal_visualization.mjs \
  --goal 7d78da7f-6af5-440a-9d6b-6cab4bee8dd2 \
  --image curricula/DE/Gymnasium/quality/goal-visualization-review/physics-alpha-mass-resumed-20260914-v1/attempts/edit-02-symbolic-nucleon-balance.png \
  --landscape curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json \
  --subject physik \
  --provider image_gen \
  --review-status pilot \
  --prompt curricula/DE/Gymnasium/quality/goal-visualization-review/physics-alpha-mass-resumed-20260914-v1/edit-02.actual-prompt.md \
  --reconstruction-prompt curricula/DE/Gymnasium/quality/goal-visualization-review/physics-alpha-mass-resumed-20260914-v1/image-reconstruction-prompt.de.md \
  --alt-text 'Schematischer Alpha-Zerfall ohne zusätzliche Strahlung: Ein Mutterkern mit A Nukleonen ergibt einen Tochterkern mit A minus 4 Nukleonen und ein Alpha-Teilchen aus vier Nukleonen. Die Nukleonen bleiben erhalten. Verglichen werden die Ruhemasse des Mutterkerns und die vollständige Summe der Ruhemassen von Tochterkern und Alpha-Teilchen. Die kleinere Produktsumme entspricht frei werdender Bewegungsenergie der Produkte gemäß ΔE = (m_vor − m_nach) · c². Die Gesamtenergie bleibt erhalten; die Größen sind nicht maßstäblich.' \
  --dry-run
```

Der echte Import verwendet anschließend dieselben Argumente ohne `--dry-run`. Er muss den finalen PNG unverändert als `<goalId>.png` in Canonical-, Public- und Backend-Assetverzeichnis kopieren, `prompt.de.md` über den nativen Metadaten-Wrapper aktualisieren, den neuen Rekonstruktionsprompt übernehmen und genau den deutschen primären Bildlink dieses Ziels ersetzen. Kein anderer Zielfeldinhalt wird geändert.

Nach dem Import alle drei PNGs hashprüfen und das tatsächlich aktivierte Asset ansehen. Der unabhängige Bildentscheid bleibt an die unveränderten PNG-Bytes gebunden. Keine Dateikonvertierung erforderlich.

## 3. Alte JPGs kontrolliert archivieren

Der native Import lässt alte JPGs bestehen. Sie wären nach der PNG-Umstellung verwaiste aktive Assets. Nach erfolgreichen Einzelprüfungen genau die drei alten JPGs an freie Ziele verschieben:

| Quelle | Ziel im Alpha-Reviewverzeichnis |
| --- | --- |
| `curricula/DE/Gymnasium/visualizations/physik/<goalId>/<goalId>.jpg` | `archived-original/canonical.jpg` |
| `app/public/assets/goal-visualizations/physik/<goalId>/<goalId>.jpg` | `archived-original/public.jpg` |
| `backend/src/main/resources/static/assets/goal-visualizations/physik/<goalId>/<goalId>.jpg` | `archived-original/backend.jpg` |

`<goalId>` bezeichnet ausschließlich `7d78da7f-6af5-440a-9d6b-6cab4bee8dd2`. Vor dem Verschieben echte Dateien, freien Zielpfad und exakten Originalhash prüfen; kein rekursives Löschen und kein Überschreiben. Datum, Quell-Ziel-Paare und Nachher-Hashes in einem neuen tatsächlichen Archivierungsbeleg festhalten. Noch wurde keine dieser Verschiebungen vorgenommen.

## 4. Hashgebundene AI-VQA und vollständiger P-Körper-KEEP

VQA nur für das Alpha-Ziel an die aktive PNG-URL und den tatsächlichen Hash binden. Ausschließlich die expliziten aktuellen AI-Bildprüffelder erneuern; menschliche Felder und Legacy-ChatGPT-Triage nicht als automatische Freigabe behandeln. `humanApproved` bleibt ohne Freigabe. Der aktuelle `accepted_pilot`-Befund und die Lesbarkeitsgrenze werden in den AI-Notizen genannt. Keine pauschale Human-, M7-, Geräte- oder Providerannahme ableiten.

Der vollständige P-Körper wurde gelesen und an der neuen Darstellung geprüft; die Begründung steht in `alpha-mass.profile-context-preparation.json`. Alle drei Erwartungen, die Coverage-Regeln, drei Variationsachsen und beide bilingualen Fälle bleiben erhalten. Das Profil erlaubt zusätzlich Strahlung, während das Bild ausdrücklich das Beispiel ohne zusätzliche Strahlung zeigt. Der zweite, endotherme Fall bleibt eigenständig und wird im Bild nicht vorweggenommen.

Der gegenwärtig registrierte P-Scope ist die historische Datei `canonical-physics-positive-understanding-evidence-calibration-final20-v3.retained-after-final-context-v1.config.json` mit **19** Zielen. Die spätere Abtrennung erzeugt folgende neuen Dateien im Alpha-Reviewverzeichnis; während dieser Vorbereitung wurden sie noch nicht erzeugt:

- `alpha-mass.current-image-positive-evidence.config.json`: ausschließlich Alpha, neues reviewId, `reviewedResourceTypes: ["goal-visualization"]`, vorhandene Physik-Landschaft, Semantic-kind-Ledger und Reviewkriterien.
- `alpha-mass.current-image-positive-evidence.candidates.json`: vollständiger unveränderter bisheriger `profile`-Körper und unverändertes `dissent: []`, neue inhaltlich begründete Bildkontextnotiz, `E1/G1`, tatsächliche neue Reviewzeit. Keine neue D-Runde behaupten.
- `alpha-mass.current-image-positive-evidence.review.jsonl`: erst nach dem Import nativ materialisieren, damit die tatsächliche neue PNG-URL und die Bildbytes in den Reviewinput eingehen. Erwarteter identischer `profileFingerprint`: `sha256:5d3f9f9cde44ab00fc89cddf9e995c805ff1bfc4919570016435e7be5e6c6df9`; Status bleibt `needs_human_review`, Authority `ai_candidate`, Claims `E1/G1`.
- `retained-eighteen.positive-evidence.config.json` und `retained-eighteen.positive-evidence.review.jsonl`: exakt die übrigen 18 IDs beziehungsweise ihre alten JSONL-Zeilen einschließlich Zeilenumbrüchen übernehmen. Historisches reviewId und `reviewedResourceTypes: []` erhalten. Keine neue Bewertung dieser 18 Ziele.

Die alte 19-Ziele-Config und ihr Review bleiben byteidentisch erhalten. Ihre Vorbereitungshashes stehen im separaten P-Kontextbeleg.

Nativer Materialisierungsschritt für die später erstellten Einzeldateien:

```bash
npm --prefix app run quality:positive-goal-evidence-candidates -- \
  --config curricula/DE/Gymnasium/quality/goal-visualization-review/physics-alpha-mass-resumed-20260914-v1/alpha-mass.current-image-positive-evidence.config.json \
  --candidates curricula/DE/Gymnasium/quality/goal-visualization-review/physics-alpha-mass-resumed-20260914-v1/alpha-mass.current-image-positive-evidence.candidates.json \
  --write
```

Anschließend derselbe Befehl ohne `--write` als Reproduzierbarkeitsprüfung. Der Materializer ist ohne `--write` kein Vorschau-Generator: Er erwartet bereits vorhandene Reviewbytes und vergleicht sie. Danach `quality:positive-goal-evidence:check` jeweils mit `--config=<neue-solo-config>` und `--config=<neue-retained-eighteen-config>` ausführen.

## 5. Registrierung und Abschlussprüfungen durch Root

In `curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json` ersetzt Root genau den alten 19-Ziele-Configeintrag durch die neue Solo- und die neue 18-Ziele-Config. Die Datei und globale Folgeartefakte bleiben während dieser Vorbereitung unverändert.

Nach tatsächlicher Integration: native P-Prüfungen, `npm --prefix app run check:goal-visualization-qa -- --subject=physik`, `npm --prefix app run check:goal-visualization-assets`, `npm --prefix app run validate:graph` und `git diff --check`; die von Root betreuten globalen Status-/Kontextartefakte regenerieren und die geschützten Maturity Floors prüfen. Betroffenen Buch-/Seitenkontext nach neuer Bildbindung prüfen. Reale Host-/Geräteabnahme getrennt halten.

Der Schutzvergleich muss unveränderte übrige Canonical-Ziele und QA-Einträge, den unveränderten P-Körper samt Dissent, die 18 byteidentischen Retention-Zeilen und unveränderte historische P-Dateien bestätigen. Abschließend ein eigenes Import-/Bindungs-Receipt mit wirklich ausgeführten Befehlen, Ergebnissen, Zeiten und Hashes schreiben. Dieser vorbereitete Plan ersetzt keinen solchen Beleg.
