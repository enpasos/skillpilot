# Mathematik M7 · fünf Volumenbilder als gezieltes V-Paket

Datum: 24.09.2026. Diese fünf Q2-Ziele waren bildseitig `deferred_quality_review`: Prisma `1e77bb2f`, Pyramide `288633c1`, Zylinder `c71ae268`, Kegel `e8237315`, Kugel `2f2c9f1a`. Beim Start dieses Pakets hatten alle fünf aktuellen kanonischen Ziele `resourceLinks: []` und die V-QA `visualizationState: missing`. Dies ist **neue fachliche V-Freigabe** für neue PNGs, nicht die Wiederherstellung einer noch gültigen alten Bildbindung.

## Historische Bilder und Entscheidung

Die früheren JPGs bleiben unverändert im [bestehenden Qualitäts-Hold-Archiv](../math-m7-quality-holds-20260923-v1/assets/). Sie waren vor diesem Import nicht aktiv verlinkt und sind weiterhin **keine** V-Freigaben. Insbesondere soll die alte Formelsammlungs-Symbolik der Grundfläche-mal-Höhe-Erklärung nicht wieder in die neuen Bilder wandern. Die fünf zuvor noch vorhandenen kanonischen `prompt.de.md`-Dateien wurden vor dem Import bytegleich in [`archived-pre-import-prompts/`](archived-pre-import-prompts/) kopiert; der Import hat nur die *aktuellen* kanonischen Prompt-Metadaten und Bilder ergänzt.

| Ziel | Archiviertes altes JPG · SHA-256 | Vorheriger Prompt · SHA-256 |
| --- | --- | --- |
| Prisma `1e77bb2f` | [`3fbd252d…`](../math-m7-quality-holds-20260923-v1/assets/1e77bb2f-0cd6-5961-b0fb-230317c73fce/1e77bb2f-0cd6-5961-b0fb-230317c73fce.jpg) · `3fbd252d588b6055083fb15e33a5a26316af7cc877532940da28ee3ec516f873` | [`38650b2d…`](archived-pre-import-prompts/1e77bb2f-0cd6-5961-b0fb-230317c73fce-prompt.de.md) · `38650b2ddfd0497544b643241ff72c735ed5a72f0cc84579a60d258b6c05250f` |
| Pyramide `288633c1` | [`a21925c7…`](../math-m7-quality-holds-20260923-v1/assets/288633c1-f61c-5b48-af7e-a80357f96cad/288633c1-f61c-5b48-af7e-a80357f96cad.jpg) · `a21925c7ad48de3728a8551838bc3a295a807ae48d223409233f16f59d7dcfa1` | [`5e29adaf…`](archived-pre-import-prompts/288633c1-f61c-5b48-af7e-a80357f96cad-prompt.de.md) · `5e29adafce2733b4b945507c6def36d11eb26ab70d0a87a9b4c8daf09d5e3b7d` |
| Zylinder `c71ae268` | [`03978353…`](../math-m7-quality-holds-20260923-v1/assets/c71ae268-f28e-59f0-982d-91db8f963378/c71ae268-f28e-59f0-982d-91db8f963378.jpg) · `039783533618b67355c2dc81e2f8ae91d690f32f2f5a6ec81ebcad32881dc71b` | [`2d114e65…`](archived-pre-import-prompts/c71ae268-f28e-59f0-982d-91db8f963378-prompt.de.md) · `2d114e650f39fb61cf6eb12a482db3246a62672bfd4fc7627eafff7652a1e095` |
| Kegel `e8237315` | [`2d396915…`](../math-m7-quality-holds-20260923-v1/assets/e8237315-654e-5150-97de-49c4cb49b3d1/e8237315-654e-5150-97de-49c4cb49b3d1.jpg) · `2d3969155dc3e4f96ebcaa0f00025c0cc3d60291219d128055ac821bc21e0797` | [`082cbed5…`](archived-pre-import-prompts/e8237315-654e-5150-97de-49c4cb49b3d1-prompt.de.md) · `082cbed5eb5d5ded60cc837ae7609442eb8fc7399ca0443f9b439dc5612d1712` |
| Kugel `2f2c9f1a` | [`498e5968…`](../math-m7-quality-holds-20260923-v1/assets/2f2c9f1a-07f0-59e4-b84a-60648c3b0bda/2f2c9f1a-07f0-59e4-b84a-60648c3b0bda.jpg) · `498e596882ed206ad3dd764c9fe08019f269f7e168bb195b97caa566a47fb961` | [`d90695f1…`](archived-pre-import-prompts/2f2c9f1a-07f0-59e4-b84a-60648c3b0bda-prompt.de.md) · `d90695f16ea25b89351dcb4e6e10a8e31646a9f68cbc4078ae954ab169ad516c` |

## Erzeugung, Iteration und Herkunft

Die aktuellen Bilder wurden mit der integrierten OpenAI/ChatGPT-Codex-Bildgenerierung erstellt beziehungsweise gezielt editiert. Eine bestimmte Modellversionsnummer oder Nano Banana Pro als Erzeuger der neuen Bilder wird nicht behauptet. Alle zehn tatsächlich verwendeten neuen Prompt-Runden stehen wortgetreu in [`prompts.md`](prompts.md), SHA-256 `69e20e78baa2fafd4989bea43a6d44808bdf17e240a7e386ab81aa93b3e06876`. Die fünf für den Import verwendeten Endprompt-Auszüge sind bytegetreu zum jeweiligen Codeblock dort und separat nachprüfbar. Die zehn versionierten PNG-Kandidaten in [`candidates/`](candidates/) sichern die Pixel unabhängig vom lokalen Generierungsverzeichnis.

| Ziel | Tatsächliche Runde und Entscheidung | Kandidat · SHA-256 |
| --- | --- | --- |
| Prisma | Erste Landschaftsfassung zurückgestellt: für die kleine Zielkarte ungeeignet; zweite quadratische Fassung zurückgestellt: Text/Elemente bei 360 px zu gedrängt. Dritte, reduzierte quadratische Fassung angenommen. | [`V1`](candidates/prism-v1-rejected-landscape.png) `6d0419f903ebb0a5b2d452d8051a0b39869bd0fb6dace5cc0052470bc7776892`; [`V2`](candidates/prism-v2-rejected-crowded.png) `1eb8085f0a32d52a6bf7d4f1730fc7400258eaac32cf86b1fa12cf956a1b0b17`; [`final`](candidates/prism-final.png) `a1b47a5101c3cbdc74ac97cfb165c445525984740bccc7fa3d580c0258f6d67d` |
| Pyramide | Erste Fassung fachlich brauchbar, aber teiltransparent und damit für helle/dunkle UI nicht zuverlässig. Gezielt opak editiert und angenommen. | [`V1`](candidates/pyramid-v1-rejected-alpha.png) `db0fe3c0f884fdda172260b6957b2bd6349805498861a05f94a3b12656e43a09`; [`final`](candidates/pyramid-final.png) `10fc4e45edd3c4708b0466b2a7a3cb806ab72973eb265500fa6154342def165a` |
| Zylinder | Erste Fassung hatte transparente/schwarze Außenränder und einen für Mobilansicht zu kleinen Höhenhinweis. Opaker Hintergrund und größere Höhenbeschriftung angenommen. | [`V1`](candidates/cylinder-v1-rejected-alpha.png) `dc3b139d1a67f5b603d87ca740b0d38f40188eccb20dd6e2b3af37121dc56648`; [`final`](candidates/cylinder-final.png) `cd58c981faa6708374b0d25bfa30b953d975e16db4e8c9cac406432fd057eb2f` |
| Kegel | Erstentwurf nach Pixelprüfung angenommen; kein vorgeschalteter Fehlversuch erforderlich. | [`final`](candidates/cone-final.png) `cc856d368af2a51ed0376c680f514606fcd68cf03bdeb7086b298e4e4f81b9d6` |
| Kugel | Erster Entwurf mathematisch beschriftet, aber gezeichnete Kugeldurchmesser nicht im verlangten Verhältnis 1:2. Größenkorrektur angenommen. | [`V1`](candidates/sphere-v1-rejected-scale.png) `d86be1ec06d67e6511110d0bff1fc62da6bfe3ee96af89a0c9f9b0179d3bcd1a`; [`final`](candidates/sphere-final.png) `25ba62f5e8e573f6a22b28b1aec1ffa11776a3ed4a6034387a7da32ead1ed891` |

Die ursprünglichen lokalen Generierungsdateien lagen unter `/home/enpasos/.codex/generated_images/01a03a32-5c3d-7122-a394-13d4f26b0054/`. In obiger Reihenfolge heißen sie: Prisma `exec-4228fc33-c1f3-4d97-9efd-425a5ec1106c.png`, `exec-776b0ca3-598d-4b92-9545-95bb2ca7438e.png`, `exec-1431e44a-a2b3-48ef-9265-688ff176ca2b.png`; Pyramide `exec-75a64c29-e00d-4a73-b6f0-5c3ae7125f59.png`, `exec-f5c8b2a9-9056-4460-92c0-47e1ec2d22f4.png`; Zylinder `exec-241f9e25-a3e4-4452-a06f-127eaa1e0b1d.png`, `exec-e241f9c4-1498-4311-84bc-ae2ab6e69f37.png`; Kegel `exec-d4909b3c-4343-4cf0-9867-c94b6ec2c865.png`; Kugel `exec-c1117236-9cc7-452f-b909-d22b4b85f141.png`, `exec-354d1118-43f8-464b-b89f-9ca1ca493538.png`.

| Aktueller Import-Prompt | SHA-256 |
| --- | --- |
| [`prism-final-prompt.md`](prism-final-prompt.md) | `4c4b599a3c7c7dc259b83235cd55d7d5ea5b9ddbd7aebb5ecc29f2569e4327ad` |
| [`pyramid-final-prompt.md`](pyramid-final-prompt.md) | `32bce57bea8abe004a7182e8d129413e99f9198e595f309d52c34ec524b5b961` |
| [`cylinder-final-prompt.md`](cylinder-final-prompt.md) | `7f2ce6acfe84a00265fef912e5b1b6a50e45e9c081b95b9347c196e095bbdfb5` |
| [`cone-final-prompt.md`](cone-final-prompt.md) | `9e12470584a7c82aea1b8bd6f5e53d6a63d76972477494da4e8388fc24970e00` |
| [`sphere-final-prompt.md`](sphere-final-prompt.md) | `6c3909213bf1762e9cc5655e187a8367a7dbf98e576af04572435c883c4f7f58` |

## Fachliche Prüfung der aktiven Pixel und Grenze dieser Entscheidung

Alle fünf Endkandidaten sind tatsächlich geprüfte `1254×1254`-RGB-PNGs ohne Alphakanal, im Original und bei 360-Pixel-Kartenbreite. Die Gestaltung ist freundlich, abstrakt und comicartig; Formeln und Einheiten bleiben auf Mobilbreite lesbar. Die fünf Ziel-/Bildprüfungen mit exakten Hashes stehen in der [V-Reviewtabelle](../mathematik-m7-five-volume-png-20260924-v1.md) und in `mathematik.qa.json`: Prisma `5·4=20`, `20·7=140`; Pyramide `6·6=36`, `36·9=324`, `324/3=108`; Zylinder `π·3²=9π`, `9π·10=90π`; Kegel `9π·12=108π`, `108π/3=36π`; Kugel `r:3→6` bedeutet `V:36π→288π`, Faktor 8. Die sichtbaren Radiuspfeile messen keine Durchmesser, und Pyramiden-/Kegelhöhen werden nicht mit schrägen Kanten verwechselt.

Der Importhelper kopierte jeweils identische Bytes in die kanonische Visualisierungsablage, das Web-Asset und das Backend-Static-Asset und setzte genau einen primären `resourceLink` pro Ziel. Die neuen V-QA-Einträge binden `aiApproved: yes` ausschließlich an diese fünf aktuellen Hashes; `humanApproved: no`. Neue eigene Bildassets sind mit `CC-BY-4.0` gemäß `LICENSING.md` bezeichnet; das lizenziert keine historischen oder fremden Bildrechte neu.

Dieses Paket ist **nur V**. Durch die neue Ressource ändern sich Inhaltsbindungen; aktuelle D-Seiten-, Quellen- und P-Transferbezüge müssen gezielt fachlich geprüft und gegebenenfalls ersetzt werden. Weder dieser README noch ein grüner Asset-Check behaupten einen Fünf-Gate-Abschluss.
