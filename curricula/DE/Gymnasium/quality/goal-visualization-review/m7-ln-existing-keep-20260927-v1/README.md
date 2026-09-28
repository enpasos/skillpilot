# 06ce2b1b: KEEP des vorhandenen ln/e-Bildes

Stand 27.09.2026. Die folgenden Abschnitte dokumentieren die unabhängige
Bildsichtung und den vorab erstellten Importplan. Die Umsetzung ist unten
gesondert protokolliert. Weder Bildsichtung noch Import beanspruchen
menschliche QS.

## Umsetzungsstand 27.09.2026

- Das vorhandene 1254 × 1254-PNG wurde unverzerrt importiert. Archivquelle,
  kanonisches Bild, Public- und Backend-Kopie sind byteidentisch, alle mit
  SHA-256 `88c744b741a89636cfad6c1e3f95f8c7e6f00a5f94642bbf379f686b06481a02`.
  Prompt, Nutzer-/Astra-Herkunftsangabe, `CC-BY-4.0`, Pilotstatus und der
  unten formulierte deutsche Alttext sind am aktiven Ziel hinterlegt.
- Die maschinelle V-QA ist für exakt diesen Asset-Hash `aiApproved: yes`;
  `humanApproved` bleibt `no`. Der aktuelle ACCEPT-Entscheid steht in
  `mathematik-zzzzz-ln-existing-keep-20260927-v1.md`. Der frühere Prompt-HOLD
  bleibt als historischer Beleg unverändert.
- Das neu materialisierte Einziel-P-v2-Profil liegt in
  `positive-current.review.jsonl`, SHA-256
  `19e6df739f09e9ae15773cbe898a4f7d1cabbe6817d43ac8c3a734154651adb0`.
  `goalFingerprint` `sha256:a23e3293dcf9cd787b1d702666e17dcdbec1ecc57f253726c099377855e7eedb`
  und `profileFingerprint` `sha256:4db7f1cfb0f74d2bc486e10d9cfc302f29fc743b0ef0630cbb0934299e25fc6f`
  sind unverändert; der aktuelle `reviewInputFingerprint` ist
  `sha256:32f37c1265f4a8f21344f31f7c7100c168f3376880493ba5b757d166e10e8f93`.
  Der Record ist weiter `needs_human_review` / `ai_candidate`, E1/G1, nicht
  menschlich genehmigt. Nur der einzelne P-Owner wurde umgebunden.
- Der alte D-Fünferindex und seine 06ce-Resolution wurden nicht geändert.
  Aktiv ist ein neuer Vierer-Snapshot
  `resolution-index.retained-before-ln-existing-png-20260927-v1.json`
  (SHA-256 `7a648f3c9d458bfafbe80f2dc3a21b06b9850b0446096720332966860ed7d507`).
  Eine neue Einziel-D-Kampagne liegt unter
  `2026-09-27/m7-ln-existing-png-20260927-v1/`: Modell-Digest
  `sha256:d09ecd5da484f40a7af094b575633c4d6d103a25c675e6399a87e6408be9a61c`,
  Bundle-Fingerprint
  `sha256:2834af6e354ed6ecc61542a686b07de8319720f993befafce39da08c0531d0a7`,
  Review-Input-Fingerprint
  `sha256:d99fd7a0eeeb2068ff5983973b8f15753dcc6900c608a02d6be4846bef9e9fe6`.
  Runden A/B und eine neue D-Resolution fehlen bewusst noch. Daher kein
  strenger D- oder M7-Abschluss für dieses Ziel.
- Der fremde Zehner-D-Batch blieb vor und nach diesem Import gültig. Seine
  geprüften Buchmodell-, Manifest- und Review-Input-SHA-256 sind unverändert
  `6a3f74a7c96b176247fa43fd701126ad81d845f3e599aa745cb9c568efe6f6bd`,
  `d565caae234f687af7073054fb50cfe28ca137dc36547d0856fecd2a1e27a00b`
  und `afc87761819fd02b8bd17fc6a00203b07b68fd71dd684c543cb73db47cb8a0d4`.
- Nach Ergänzung der belegten aktuellen V-Entscheidungen für die parallelen
  zehn plus zwei Bilder sind Mathematik-Rollout-Status und QA-Parität aktuell:
  774 aktive Bilder, 797 atomare Ziele, 6 Provider- und 17 Qualitäts-Deferrals.
  `check:goal-visualization-qa`, `check:goal-visualization-approval-coverage`,
  `check:goal-visualization-rollout-status`,
  `check:goal-visualization-qa-coverage-parity`, der neue P-Check, der neue
  Einziel-D-Batch-Check und der zentrale Deep-Understanding-Check bestehen.
  Zentrale Mathematik-Zahlen: **734/797 strikt**, D 738, P 797, A 797,
  M 797, V 774; 6/6 technische Abschlusschecks und 0 technische Blocker,
  aber kein M7-Abschluss. Gegenüber dem unmittelbaren Vorstand steigt V um
  eins und sinkt D um eins; der strenge Schnitt bleibt 734.
- `check:goal-visualization-assets` bleibt wegen der bereits zuvor
  vorhandenen, nicht mit einem Link versehenen `ae3483e3-4712-56a1-a881-2e1f8a1a8df9`-
  JPG-Kopien rot. Diese fremden Assets wurden hier nicht verändert; die vier
  06ce-PNG-Kopien haben nachweislich denselben exakten Hash. Im parallelen
  Zehner-Batch ist beim Ziel `2041f4ec-620d-4a20-9922-6ebf16f8f8fa` eine
  Alttext-/P-/D-Bindungskorrektur offen: Das PNG zeigt eine kongruent
  gespiegelte, nicht gedrehte Figur. Der Bitmap-KEEP-Befund bleibt davon
  getrennt; vor einer D-Resolution ist die Seite neu zu binden.

## Bildentscheidung und Herkunft

**ACCEPT als fachlicher KEEP-Kandidat** für das unveränderte Nutzer-PNG
`math-astra-user-image-sight-20260924-v1/assets/06ce2b1b-e888-5322-9ed9-dfc6d322956a/06ce2b1b-e888-5322-9ed9-dfc6d322956a.png`.
SHA-256: `88c744b741a89636cfad6c1e3f95f8c7e6f00a5f94642bbf379f686b06481a02`;
764429 Byte, RGB, 1254 × 1254 px. Die ursprüngliche Nutzerdatei
`m7-astra-user-prompts-20260924-v1/incoming/prompt_1.png` und deren
ID-genaue Kopie haben denselben Hash. Der frühere Zuordnungsbeleg nennt als
Eingangsname `ChatGPT Image 24. Sept. 2026, 08_00_17.png`, Nutzerlieferung
und einen vom Nutzer angegebenen Astra-Generierungsweg. Eine konkrete
Bildmodellversion ist nicht belegt. Der Importbeleg vom 24.09. vermerkte
ausdrücklich nur Pilotimport, keine fachliche oder menschliche Freigabe.
Nach dem späteren HOLD wurden kanonische, Public- und Backend-Kopie entfernt;
alle drei Zielpfade sind hier noch nicht vorhanden.

Der Einzelprompt steht wortgleich zu Abschnitt 1 von
`m7-astra-user-prompts-20260924-v1/prompts.md` in
[`prompt-1-source-text.txt`](prompt-1-source-text.txt). Der gemeinsame
Stilvorspann des Promptpakets ist dort zusätzlich dokumentiert; ob er beim
tatsächlichen Generatoraufruf mitgesendet wurde, ist nicht belegt. Der Prompt
hat als lokale Einzeltextkopie SHA-256
`7d9183f4d59f52327f355e565a1502642efbbec53976621d34460022af623714`.
Ein wortgleicher Vergleich mit Promptabschnitt 1 war positiv. Der Prompt
forderte außerdem `(ln 4,4) ↔ (4,ln 4)` und Hilfslinien. Dieses dritte Paar
fehlt im PNG, steht aber weder in der heutigen kanonischen Zielbeschreibung
noch im aktuellen P-Profil als Bildpflicht. Der ältere Prompt-HOLD war damit
ein Befund zur Prompttreue, kein nachgewiesener mathematischer Bildfehler.

Das Bild zeigt x und y jeweils von −2 bis 4 mit gleichem Rastermaß von rund
183 px je Einheit; `y=x` ist eine echte 45°-Diagonale. `e^x` und `ln(x)`
verlaufen als gespiegelte Kurven. Die markierten Punkte `(0,1)`, `(1,0)`,
`(1,e)` und `(e,1)` sitzen an den passenden Stellen; `ln(x)` ist nur für
`x>0` rechts der y-Achse gezeichnet. Die verlustfrei im Speicher auf
360 × 360 px verkleinerte Ansicht erhält lesbare Achsen, Kurven und
Punktlabels; letztere sind klein, aber erkennbar. Der sachliche Diagrammstil
ist für die exakte Graphspiegelung fachlich passend. Das **Quadrat bleibt
unverzerrt**: Ein Strecken auf 16:9 würde die gleiche Skalierung, die
45°-Diagonale und damit die Kernaussage beschädigen. Eine breite Einbettung
kann das Quadrat mit Randfläche zeigen.

Aktuelle Zielbeschreibung: Die lernende Person kann `ln(x)` als Umkehrfunktion
von `e^x` erklären und die gegenseitige Zuordnung der Graphen durch
Spiegelung an `y=x` darstellen. Das registrierte P-v2-Profil verlangt genau
die Zuordnung `(0,1) ↔ (1,0)` und `(1,e) ↔ (e,1)` und prüft einen negativen
Exponenten als eigenständigen Transfer. Das Bild illustriert die Zuordnung;
der unmarkierte Transferfall bleibt Sache der Lernaufgabe.

Vorgeschlagener deutscher Alttext (nur sichtbar Vorhandenes):

> Koordinatendiagramm mit gleich großen Einheiten auf beiden Achsen. Die
> Graphen y=e^x und y=ln(x) sind an der gestrichelten Geraden y=x gespiegelt.
> Markiert sind die vertauschten Punktpaare (0,1) und (1,0) sowie (1,e) und
> (e,1). Der ln-Graph verläuft nur rechts der y-Achse für x>0.

CC-BY-4.0 ist die Projektzuordnung für eigenes didaktisches Bildmaterial;
die Nutzerlieferung und der berichtete Generierungsweg bleiben als Provenienz
getrennt von einer menschlichen Release- oder Rechtefreigabe.

## Aktuelle Bindungen vor dem Import

| Bereich | Registrierter Stand | Folge des neuen Bildlinks |
| --- | --- | --- |
| Canonical/V | `resourceLinks: []`; QA `missing` / `deferred_quality_review`, kein aktiver Hash und keine AI-V-Freigabe | Neuer primärer DE-Link und neuer QA-Asset-Hash `sha256:88c744…81a02`; danach explizite hashgebundene KI-Bildentscheidung für V erforderlich. |
| P | Ein-Ziel-Konfiguration `m7-astra-user-prompts-20260924-v1/positive-restored-after-sight-v2/06ce2b1b.config.json`; Review-JSONL SHA-256 `a6e78d668d222308f956bb5d597cf390fa68f1d6d2d0b84252a599ea104fc653` | Bild-URL, Alttext, Link-Status und Asset-Digest ändern den P-`reviewInputFingerprint`. Das unveränderte fachliche Profil ist gegen die neue Bildseite erneut zu prüfen und als neuer AI-Kandidat zu materialisieren. |
| P-Felder | `goalFingerprint` `sha256:a23e3293dcf9cd787b1d702666e17dcdbec1ecc57f253726c099377855e7eedb`; `reviewInputFingerprint` `sha256:40eb3148cddfcff94fa76e9500c8cd1bbf589568618bf55318b715f081d7e553`; `profileFingerprint` `sha256:4db7f1cfb0f74d2bc486e10d9cfc302f29fc743b0ef0630cbb0934299e25fc6f` | Nur der Inputfingerprint muss wegen des Bildlinks neu werden, sofern Zielsemantik und Profilkörper gleich bleiben. Status bleibt `needs_human_review` / `ai_candidate`, E1/G1. |
| D | Registrierter Fünfer-Index `m7-he-context-refresh-9-v1/resolution-index.retained-before-five-mobile-png-20260923-v1.json`, SHA-256 `de7943b1bfc83cd96193bd284ff737df73fb3ac295ed2fb60b62e8301a88ae14`; Einzelresolution SHA-256 `49f903041e16ea43f0d5e5d3a7ed2a2a15662e03ed58a2e73d284edb8c28509b` | Neue GoalBook-Bildseite macht die alte D-Seiten- und Kontextbindung für genau dieses Ziel veraltet. Vier andere Indexeinträge historisch unverändert übernehmen; für 06ce eine zielgenaue neue D-Kampagne mit zwei unabhängigen Runden und neuer Resolution erstellen. |
| D-Felder | Altes `goalFingerprint` `sha256:a23e3293dcf9cd787b1d702666e17dcdbec1ecc57f253726c099377855e7eedb`; `pageFingerprint` `sha256:391b8993085ec5ae5b90e0cc1c79b2380659c5498407cd7267fe336e2c332dfe`; `goalReviewContextFingerprint` `sha256:d9e7a2ae0730cd397351a484db42a1b2a8e1d810ff502b405faee295d5b099b5` | Zieltextfingerprint kann gleich bleiben; Seiten-, Kontext-, Review- und Resolutionshashes müssen aus dem tatsächlichen neuen Stand entstehen. Keine alten Reviews oder Hashes überschreiben. |

Die aktuellen P- und D-Owner wurden aus der tatsächlichen
`de-gymnasium-math-physics.config.json` bestimmt. Ältere Kopien des
P-Profils unter `goal-evidence/.../rest-04fe` sind nicht der registrierte
Owner; daraus sollte kein unnötiger Siebener-Split entstehen.

## Minimaler Ablauf nach Abschluss des parallelen Bildpakets

1. Canonical-Ziel, QA-Zeile, registrierten P-/D-Owner und die drei fehlenden
   Zielpfade erneut prüfen. Die Archivquelle muss weiterhin exakt den oben
   genannten SHA-256 haben. `visualization:prepare` ist hier entbehrlich,
   denn Bild und ursprünglicher Einzelprompt existieren bereits.
2. Den Import zuerst mit `--dry-run` ausführen und dann denselben Aufruf ohne
   `--dry-run`. Provider und Prompt ausdrücklich angeben, da der CLI-Default
   sonst fälschlich Nano Banana Pro einträgt. Beispiel vom Repo-Root:

   ```bash
   npm --prefix app run visualization:import -- \
     06ce2b1b-e888-5322-9ed9-dfc6d322956a \
     curricula/DE/Gymnasium/quality/goal-visualization-review/math-astra-user-image-sight-20260924-v1/assets/06ce2b1b-e888-5322-9ed9-dfc6d322956a/06ce2b1b-e888-5322-9ed9-dfc6d322956a.png \
     --provider 'ChatGPT image generation (user-provided via Astra)' \
     --review-status pilot --license CC-BY-4.0 \
     --prompt curricula/DE/Gymnasium/quality/goal-visualization-review/m7-ln-existing-keep-20260927-v1/prompt-1-source-text.txt \
     --description 'Graphen von e^x und ln(x) als Spiegelbilder an y=x.' \
     --alt-text 'Koordinatendiagramm mit gleich großen Einheiten auf beiden Achsen. Die Graphen y=e^x und y=ln(x) sind an der gestrichelten Geraden y=x gespiegelt. Markiert sind die vertauschten Punktpaare (0,1) und (1,0) sowie (1,e) und (e,1). Der ln-Graph verläuft nur rechts der y-Achse für x>0.' \
     --dry-run
   ```

   Dieser genaue Aufruf wurde am 27.09. im Dry-Run erfolgreich geprüft;
   der Helfer meldete ausdrücklich, keine Dateien geschrieben zu haben.

   Danach die drei importierten PNG-Kopien byteweise gegen die Archivquelle
   prüfen; `prompt.de.md`, primären Link, Alttext, Lizenz und Provider lesen.
3. `npm --prefix app run quality:goal-visualization-qa -- --subject=mathematik`
   erzeugt zunächst die neue aktive QA-Zeile ohne AI-Freigabe. Die gezielte
   V-Entscheidung ist mit `aiApproved: "yes"`,
   `aiApprovedAssetSha256: "sha256:88c744b741a89636cfad6c1e3f95f8c7e6f00a5f94642bbf379f686b06481a02"`,
   tatsächlichem Review-Zeitpunkt, Reviewer und den oben beschriebenen
   Original-/360-px-Befunden zu belegen. `humanApproved` und
   `humanIssueIdentified` bleiben ohne menschliche Entscheidung `no`.
   Anschließend `npm --prefix app run check:goal-visualization-qa -- --subject=mathematik`
   prüfen.
4. Den heutigen einzelnen P-Owner durch eine neue einzelne Konfiguration
   und Kandidatendatei ersetzen. Fachliches Profil und beide Transferfälle
   übernehmen, aber Bild/Alttext gegen die aktuelle Seite prüfen und die
   Begründung aktualisieren. Mit
   `npm --prefix app run quality:positive-goal-evidence-candidates -- --config <neu>.config.json --candidates <neu>.candidates.json --write`
   den neuen hashgebundenen Record erzeugen, ohne den historischen Record zu
   ändern. Danach den einen P-Registrypfad ersetzen und
   `npm --prefix app run quality:positive-goal-evidence:check -- --config=<neu>.config.json`
   ausführen.
5. Eine neue D-Einzelzielkampagne gegen die nun aktuelle GoalBook-Seite und
   das neue P-Profil vorbereiten. Zwei unabhängige Runden prüfen den
   unveränderten Zieltext im neuen Bildkontext; Synthesis/Resolution werden
   neu hashgebunden. Im bisher registrierten D-Fünferindex nur 06ce
   herausnehmen und einen unveränderten Vierer-Snapshot registrieren; die
   neue Einzelresolution zusätzlich registrieren. Die bestehende Fünferdatei
   und alte Einzelresolution bleiben als Historie erhalten. Dafür die
   vorhandenen `quality:goal-description-rollout-batch`-Schritte
   `prepare`, `check`, `summarize`, `finalize` sowie
   `create:goal-description-review-campaign` für jede Runde und
   `quality:goal-description-rollout-resolutions` mit einer neuen
   Ein-Ziel-Konfiguration verwenden. Syntax für den ersten Schritt:
   `npm --prefix app run quality:goal-description-rollout-batch -- prepare --config <neu>.config.json`.
   Keine bloße Fingerprint-Ersetzung.
6. Nach vollständiger P-/D-/V-Bindung mit
   `npm --prefix app run quality:goal-visualization-rollout-status -- --subject=mathematik`
   die Mathematik-Rollout-Statusdateien erneuern. Gezielte Prüfungen:
   `check:goal-visualization-assets`,
   `check:goal-visualization-qa`,
   `check:goal-visualization-approval-coverage`,
   `check:goal-visualization-rollout-status`,
   `check:goal-visualization-qa-coverage-parity`,
   `quality:positive-goal-evidence:check` für den neuen Owner und
   `quality:deep-understanding-rollout:check`. Der letzte Check darf erst nach
   dem D-/P-Registrierungswechsel als Aussage über den strengen
   Fünf-Gate-Stand verwendet werden; eine menschliche Bildfreigabe folgt
   daraus nicht.
