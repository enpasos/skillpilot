# Zehn aktuelle Mathematik-Bildseiten – Integrationsbeleg (2026-09-27)

## Befund am exakten Asset

Alle zehn Kandidaten aus `tmp/math-m7-image-prompts-2026-09-27/images/` wurden **eigenständig** im Original und bei 360 px Kartenbreite gegen das aktuelle Lernziel und die Mathematik geprüft. Es wurden nur geeignete Bitmaps importiert. Die Bild-QA ist eine KI-Sichtung, keine menschliche Freigabe und kein Nachweis von Lernerfolg.

| Ziel-ID | PNG-SHA-256 | Herkunft des finalen Kandidaten | Fachlicher Kerncheck |
| --- | --- | --- | --- |
| `70efdec0-110c-5564-849b-bc05cfff0f6a` | `2d19a513c73095f3d3e849352cfb8a155354865b6d611ba3552b9d63d0ab659c` | OpenAI-Imagegen nach exakter Zählreferenz | Vier verschiedene Plättchen; sechs ungeordnete Paare; `4!/(2!·2!)=6`. |
| `2041f4ec-620d-4a20-9922-6ebf16f8f8fa` | `2fe00147e59186ab14d70352351cc12f225b5eae48cbd518a9f196580fc096eb` | OpenAI-Imagegen nach Geometriereferenz | `3:4:5` kongruent an der Winkelhalbierenden gespiegelt (Katheten vertauscht), `6:8:10` verdoppelt, `1,5:2:2,5` halbiert. Softwareeinsatz wird durch dieses Bild nicht behauptet. |
| `0408ac7f-0530-5de5-b248-cf581c9b5a17` | `a522c90588fefc0b8a112963a693a0531bf4cb9116d2128a69c79e34807b4c53` | Gemini `gemini-3-pro-image` | Mit Zurücklegen aus 2R+1B: `RRB`, `RBR`, `BRR`; Wahrscheinlichkeit `4/9`. |
| `27bdc580-ba17-5399-bf02-48f354846d1d` | `4d134eb230ac996f76b52ace1b44fa83879b39c788689ac7b2a836e42e3e8f51` | OpenAI-Imagegen mit Hintergrund-Edit | Ein durchgehender Graph zeigt `f(a)<0`, `f(c)=0`, `f(b)>0`; nur heuristische Zwischenwertidee. |
| `e02b994f-376d-5a8e-a14c-c4acacae57cf` | `f6710170409455556df3a2687b2f1682ee413d51d45a56d162bb2abf3b7471bb` | Gemini `gemini-3-pro-image` | `30b≥73`, ganzzahliges `b`: mindestens drei Busse. |
| `909d8b16-5156-528b-a300-d9aee5405ba0` | `04c731660994cdacadff6b69d4347113cd11dfadf9444ea09a57efea512cbe0f` | OpenAI-Imagegen mit gezieltem End-Edit | `20·2+10·1,80=58 €`; altes Modell `30·2=60 €` ist ausdrücklich Vergleich, nicht durchgestrichen. |
| `18be713b-7d90-4f01-b60a-5582ac4df0e8` | `984456f9834149a31314167bc77a31b4ebdb1f9b4b896810ffb104427067bde2` | Gemini `gemini-3.1-flash-image`, `thinking_level=high` | `u=(1,0)`, `v=(1,1)`: Winkel `45°`, `cos α=1/√2`. |
| `f2a12269-6bcb-564a-9fdb-45cfdbd704fc` | `e5fc79e6c424399d9e479fa42b5b157d490e27ae962c1e50c0919fc8508bc8f3` | OpenAI-Imagegen nach korrigierter Volumenreferenz | Gleiches `G=12 cm²`, Höhen `3:9`, Volumina `36:108=1:3`; Zeichnung nun etwa `1:3`. |
| `3d8f5e4c-8f7b-49cf-bd83-1d9876db5bf6` | `249fe3f8c0555dd276d65d5563e105d942ed26983488d71fd84f70410fb14470` | Gemini `gemini-3.1-flash-image`, `thinking_level=high` | Ohne Zurücklegen aus 3R+2B: `C(3,2)+C(2,2)=4` von `C(5,2)=10`, also `2/5`. Kleinere Rechenzeilen sind bei 360 px nur ergänzend. |
| `7156558c-57f1-4372-9ba7-0640c3f7cb3a` | `c8be0423886df14cef2c227e581118e9240f1ce9175eccad263c1076a6574a41` | OpenAI-Imagegen nach maßstäblicher Referenz | `f(x)=x²`, `A=(2,4)`, `B=(3,9)`, Sekante `5`, Tangente in A `4`. Ersetzt ein fachlich falsches Altbild. |

Die genauen tatsächlich verwendeten finalen Prompts stehen in den jeweiligen kanonischen `visualizations/mathematik/<Ziel-ID>/prompt.de.md`; Requests und Iterationen liegen zusätzlich im `tmp`-Kandidatenverzeichnis. Für die OpenAI-Bildgenerierung ist das exakte Modell nicht exponiert und wird nicht erfunden. Die SVG-Geometrievorlagen waren Eingaben für die Bildkorrektur, **nicht** die ausgelieferten Bilder. Die beiden Gemini-Flash-Kandidaten wurden vom erzeugten JPEG nur mechanisch nach PNG transkodiert. Alle kanonischen, öffentlichen und Backend-Kopien sind byte-identisch. Die neuen Links tragen `CC-BY-4.0` für die eigenen kuratierten Bilddateien; dies ist keine Freigabe fremder Vorlagen.

Frühere Prompt- und Rekonstruktionsmetadaten liegen unter `previous/`. Für `7156558c…` sind zusätzlich das frühere PNG (`sha256:5b3824…`) und dessen damaliger QA-Eintrag archiviert. Die alte `humanApproved=yes`-Angabe galt **nur** für dieses ältere Asset und wird ausdrücklich nicht auf die neue Datei übertragen. Die spätere konkrete Beanstandung der falschen Tangentensteigung bleibt nachvollziehbar.

## P und D: keine Abkürzung zur Vollständigkeit

Die P-v2-Profile und ihre beiden Transferfälle je Ziel wurden inhaltlich am aktuellen Bild nachgeprüft; mathematische Beispiele und alte/neue Fingerprints stehen in `positive-binding-review.json`, die unabhängigen Begründungen in `positive-current-ten.candidates.json`. Die Profilinhalte selbst blieben unverändert, sind jetzt aber über `reviewedResourceTypes: ["goal-visualization"]` an den **aktuellen Bildhash** gebunden. Status bleibt `needs_human_review`, E1/G1, `ai_candidate`. Aus den vier alten aktiven P-Konfigurationen wurden zwei unveränderte Restgruppen abgetrennt; historische Dateien blieben erhalten.

**D bleibt für alle zehn HOLD.** Im aktiven zentralen D-Index gab es für diese Ziele zuvor **keine** gültige strenge Resolution; deshalb wurde kein historischer Index gelöscht oder künstlich negativ gemacht. Die acht alten in-flight-Konfigurationen mit zehn überlappenden Ansprüchen wurden im Ledger durch einen aktuellen Zehner-Batch und sechs Rest-Konfigurationen ersetzt; zwei vollständig ausgelagerte alte Claims sind nur historisch. `d-hold-and-claims-receipt.json` dokumentiert jeden Anspruch, alle zehn aktuellen Seitenfingerprints und Bilddigests. Der 12-seitige D-Bundle ist vorbereitet, aber **zwei unabhängige Reviews der aktuellen Seiten und Synthese stehen noch aus**. Die Rest-Konfigurationen sind nur Claims; ihre neuen Rest-Bundles wurden hier nicht vorbereitet.

Ein erneuter, rein lesender GoalBook-Bau aus allen aktuellen Quellen ergab exakt denselben vollständigen Basis-Digest wie bei der Bundle-Vorbereitung (`sha256:73fcd313d303c926ea0f9d6e61fac671e581d7ca942d898dae93e8984e465ea6`). Für alle zehn Ziele stimmen aktuelle Bilddigests und QA-/Publikationsmetadaten mit den eingefrorenen Seiten überein; der Batch-Checker bestätigt die Seitenfingerprints und die identische Bindung beider Runden. `review_candidate` und `approvedForPublication=false` sind bei `humanApproved=no` erwartbar und werden nicht als menschliche Freigabe ausgegeben. Es war daher kein Neu-Bundle nötig.

## Reproduzierbare Kontrollen

Im Verzeichnis `app/`:

```bash
./node_modules/.bin/tsx scripts/materializeMathM7TenPDelta.ts --check
./node_modules/.bin/tsx scripts/materializeMathM7TenDClaims.ts --check
npm run check:goal-visualization-qa -- --subject=mathematik
npm run check:goal-visualization-approval-coverage -- --subject=mathematik
npm run quality:goal-description-rollout-batch -- check --config curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-ten-current-png-20260927-v1.config.json
```

Nach V-/P-Neubindung und D-HOLD: Mathematik **733/797 strikt**, Gates **D 738, P 797, A 797, M 797, V 773**, 6/6 technische Abschlusschecks, 0 technische Blocker. Im Vergleich zum unmittelbar davor geprüften Zwei-Bild-Stand sind **zehn** Ziele zusätzlich V-bereit; ein bereits vorhandener, aber wegen Bildfehler nicht zählender V-Fall (`7156558c…`) wurde ersetzt. Die QA-Deckung für aktive Dateien stieg netto von 778 auf 787, weil die alte Datei dort bereits als vorhanden geführt war. Der strenge Schnitt gewann bewusst **noch keinen** Punkt, solange die neuen D-Runden fehlen. Physik bleibt unverändert 478/478.
