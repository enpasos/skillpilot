# Baden-Wuerttemberg Mathematics Structure Note

State: `2026-03-25`

This note records the first source-snapshot scope for the mathematics-first DE expansion track in Baden-Wuerttemberg.

Source files:

- combined Gymnasium mathematics PDF:
  `curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_M.pdf`

Initial source snapshots:

- Sek I:
  `curricula/DE/Gymnasium/input/BW/lower-secondary/source-json/DE_BAW_S_GYM_1_MATHEMATIK.de.json.snapshot`
- Sek II:
  `curricula/DE/Gymnasium/input/BW/upper-secondary/source-json/DE_BAW_S_GYM_2_MATHEMATIK.de.json.snapshot`

Current import boundary:

- the archived Baden-Wuerttemberg source snapshots are intentionally partial pilot subsets, not full subject imports
- the first active source snapshots currently cover the lower-secondary shared functions corridor, the first upper-secondary analysis corridor, the adjacent upper-secondary calculation-rules follow-on, the first upper-secondary stochastics follow-on, the first upper-secondary geometry follow-on, the first upper-secondary Gauß follow-on, and the remaining upper-secondary integral-application follow-on from `Messen`
- the imported Sek-I slice currently covers:
  - the curriculum-wide orientation layer from `1.1 Bildungswert des Faches Mathematik`
  - `3.1.4 Leitidee Funktionaler Zusammenhang` in `Klassen 5/6`
  - `3.2.4 Leitidee Funktionaler Zusammenhang` in `Klassen 7/8`
- the imported Kursstufe / Sek-II slice currently covers:
  - the shared orientation layer from `1.4 Basisfach und Leistungsfach in der Oberstufe`
  - `3.5.1 Leitidee Zahl - Variable - Operation` in `Basisfach`
  - `3.5.2 Leitidee Messen` in `Basisfach`
  - `3.4.1 Leitidee Zahl - Variable - Operation` in `Leistungsfach`
  - `3.5.4 Leitidee Funktionaler Zusammenhang` in `Basisfach`
  - `3.4.4 Leitidee Funktionaler Zusammenhang` in `Leistungsfach`
  - `3.5.5 Leitidee Daten und Zufall` in `Basisfach`
  - `3.4.5 Leitidee Daten und Zufall` in `Leistungsfach`
  - `3.5.3 Leitidee Raum und Form` in `Basisfach`
  - `3.4.2 Leitidee Messen` in `Leistungsfach`
  - `3.4.3 Leitidee Raum und Form` in `Leistungsfach`

Operational interpretation:

- the first Baden-Wuerttemberg canonical mapping work should start from these archived source goal IDs, not directly from the PDF
- the archived Sek-I function corridor has now already been refined once with a retained split on the former broad `JG7/8` representation atom `d45b4ec2-8604-490e-9c11-d3b8fc54251b`
- the first BW Sek-I follow-on cut now also closes four additional lower-secondary rows:
  - the retained `JG7/8` representation-output child `5e889254-5088-4c9f-ac62-e94d95113644 -> 2bb4bb91-7929-483a-b735-44275f6b5cdc`
  - the retained `JG7/8` representation-switch child `56842db6-253b-4fea-b50c-2940db2fd174 -> 09f47964-2cd0-410e-93ee-9632b582fc91`
  - the `Klassen 5/6` Dreisatz situation row `0886ec62-bfa3-4501-9bc9-daee3d84b758 -> ca9093cd-9ccf-5fb4-9dd8-bf4f92af4e70`
  - the `Klassen 5/6` coordinate-system row `0282af40-1f9f-4f74-a3ac-d9fe29796068 -> 25593605-5e13-55cc-9a05-8f3d737e15e9`
- the next BW Sek-I refinement now closes the remaining atomic front debt on the active lower-secondary slice:
  - the simple-relationship entry row `83041ef8-6480-435c-aeb6-a09cb4af5ec2 -> 2bb4bb91-7929-483a-b735-44275f6b5cdc`
  - the retained representation-output child is tightened onto the shared representation-choice leaf `5e889254-5088-4c9f-ac62-e94d95113644 -> 34047d7c-3a92-59fa-91b4-354211ff36e1`
  - the retained representation-switch child is tightened onto the shared representation-switch leaf `56842db6-253b-4fea-b50c-2940db2fd174 -> e41a9eb4-8d3f-5f45-b3f3-5a88072e6f4e`
- the first reviewed Baden-Wuerttemberg upper-secondary analysis mapping pass is now active on twelve rows:
  - the exact course-stage motivation anchor `f84004f9-0987-40f4-88dd-830c039b7bf6 -> 71cec9fb-3751-4d61-8b34-c5adbbf6e5f2`
  - the retained-split Basisfach e-function-properties bridge `e0769810-ba73-4a52-8e9c-660d1fb9d6e6 -> 4047af71-de53-5dc3-80c6-a7c78fb4bfe4`
  - the retained Basisfach antiderivative bridge `7bf62048-84ba-467f-ba23-f053c4e2989f -> a9ed219d-d497-55e5-a4e0-4d45d2554f6b`
  - the retained Basisfach composition bridge `46690ab9-0b1f-4bd9-9409-4976a40c6ec2 -> e9ad45b9-c0d2-5804-b6bf-79e5ce041d2c`
  - the retained Basisfach optimization / application bridge `c5739dd3-a261-4229-aff6-678d8ee618b3 -> 1511b39a-4094-5450-a755-4a3ad3339733`
  - the aligned Leistungsfach composition / asymptote bridge `13e285f3-522c-4eae-9fed-8b13b2af7b7d -> c72a8032-71f6-56ed-a896-06ae435ff2ec`
  - the aligned Leistungsfach optimization / function-family bridge `8ab263f6-a460-4ca2-bbe9-b7e9a22bbaa2 -> e7350739-c89f-5c7b-b4d1-717d6a767298`
  - the remaining broad Leistungsfach e/logarithm front atom `fa4597c7-fabd-4a55-8be3-d06f7c432738 -> 1e26404a-93ef-45f3-a28c-15679fbae96b`
  - the exact introductory-integral child bridge `97ab0ab9-9444-410d-b2d9-1ac9fa935ad8 -> 2afba4a2-287d-5e8f-aeee-a3bcf8652236`
  - the partial Hauptsatz child bridge `e0c333ea-9873-4718-819c-d39b22ccee30 -> b9bbd2a8-1379-5ffb-817f-41467d48abef`
  - the retained-split Leistungsfach introductory-integral bridge `72d7ad67-e2ef-41a0-bb52-b62eb5d071e0 -> 2afba4a2-287d-5e8f-aeee-a3bcf8652236`
  - the retained-split Leistungsfach Hauptsatz / Integralfunktions child bridge `fb742d93-6c9b-487a-bc7c-f54b363c0c01 -> b9bbd2a8-1379-5ffb-817f-41467d48abef`
- the next BW Kursstufe source follow-on now imports the adjacent Zahl-Variable-Operation strip:
  - `3.5.1` in `Basisfach` with Logarithmus, weiteren Ableitungsregeln und Integrationsverfahren
  - `3.4.1` in `Leistungsfach` with iterativen Verfahren, weiteren Ableitungsregeln und uneigentlichen Integralen
- the reviewed bridges on that new follow-on are now active on all ten atomic rows:
  - `8c12f6ea-154d-44ab-af4d-4de8c5c325c7 -> d900e0a4-0c45-50dd-a37b-01f9f91a134c` for logarithm-based solving of exponential equations
  - `a8049427-1331-41ec-9791-e50ffeefa2b7 -> 858113c5-e53b-57bb-b01f-ba95c3ddcb6f` for the Basisfach derivative-rule bridge onto the shared derivative-entry leaf
  - `cb8562b5-05c2-4daf-8471-cdf6231e8a14 -> a9ed219d-d497-55e5-a4e0-4d45d2554f6b` for the Basisfach antiderivative-rule bridge onto the shared simple-integral leaf
  - `2a7402b9-ef3a-4f3c-8769-d824f703470a -> b9bbd2a8-1379-5ffb-817f-41467d48abef` for the explicit Basisfach Hauptsatz child
  - `65117831-b95b-4f8a-b1af-606785b92b5c -> 628928a6-4f48-54dc-952d-dec0e69dc856` for the e-entry adjacency onto the shared natural-exponential leaf
  - `587ea551-b69d-4820-8ff5-e161b49adbd4 -> 0c7bbd3f-0a04-4f0e-888b-40ab7841fb76` for iterative root approximation
  - `988e4e6e-6b8c-41b5-84f0-c34ec4d82b74 -> 899ed286-0cc2-4d6d-ba46-7d4e40a11f41` for product and chain rule use
  - `ff6922a2-2acc-4c59-a896-8e8c4f14a9ab -> 61686d85-0301-550e-bab9-bd9411c3e7ce` for the gebrochenrationale follow-on adjacency
  - `180eb105-e4cd-4741-af2d-d0b1f0ed2ff1 -> 12f4b957-da3d-53d5-a924-45a634ab8d44` for linear substitution / integration procedures
  - `d3df03bc-ded3-4e00-9820-778c094a4043 -> f4935b24-d8a9-5eb7-a5eb-6d34a9e09b2d` for improper integrals
- the next BW Kursstufe source follow-on now imports the first Daten-und-Zufall-Streifen:
  - `3.5.5` in `Basisfach` with diskreten und stetigen Zufallsgroessen sowie erster Normalverteilungsdeutung
  - `3.4.5` in `Leistungsfach` with Hypothesentests und vertiefter Normalverteilung
- the reviewed bridges on that new stochastics follow-on are now active on all thirteen atomic rows:
  - `4c3840b0-c9b7-4199-b977-c23521877c83 -> da95ab35-bac2-54f2-b38f-8b612cde8b54` for the Basisfach entry on diskrete und stetige Zufallsgroessen
  - `d344ae76-c06b-4ad2-93eb-d287a4fdec36 -> fd13605e-21d9-523f-bcf4-6824b6cc09e5` for the Basisfach bell-curve / parameter bridge
  - `87bce2ea-e022-4225-903a-3c91160c35f2 -> 3d9530ef-8355-59fc-b8c1-afe42cf9e888` for the Basisfach normal-distribution probability bridge
  - `df32db8a-406b-4d08-9439-cf920a0bc9f9 -> a5ead83b-4893-5076-be1d-ded8de4ef2a7` for the Leistungsfach hypothesis-test reasoning entry
  - `c49bfd51-4872-4261-98e5-96db79413101 -> f14e1643-ad8d-5235-a832-97987fa18489` for null-hypothesis formulation
  - `7bd4d004-534e-4476-b9f7-56245285d47f -> 677be619-5f0a-59bf-9730-0071c7d3f150` for rejection-region work
  - `97264523-00a6-413d-a1dc-f472f9f596fd -> a5ead83b-4893-5076-be1d-ded8de4ef2a7` for the worked hypothesis-test strip
  - `4b1b0f76-b6e6-406b-9728-5939d94b0f41 -> a5ead83b-4893-5076-be1d-ded8de4ef2a7` for significance-level / error-probability differentiation
  - `632b33b2-c8ef-4c98-a899-4780ca420c94 -> 4b58b855-cd26-538c-8e6f-304f4cfd8ad6` for type-I / type-II error interpretation
  - `34b3c946-a14e-4120-8af4-a1242f7871eb -> 82bce6e8-7dc7-501a-a4f6-df8a3b905e3c` for the sample-size / test-power adjacency
  - `49fcf825-0929-4a25-bceb-5947cf6d9b04 -> da95ab35-bac2-54f2-b38f-8b612cde8b54` for the Leistungsfach continuous-random-variable entry
  - `7289bdba-0913-4a64-b46f-a58c3c431c42 -> fd13605e-21d9-523f-bcf4-6824b6cc09e5` for the Leistungsfach normal-density bridge
  - `33e40b11-1bed-4912-8666-bb43285085ef -> 3d9530ef-8355-59fc-b8c1-afe42cf9e888` for the Leistungsfach normal-probability bridge
- the next BW Kursstufe source follow-on now imports the first Raum-und-Form-Streifen:
  - `3.5.3` in `Basisfach` with Ebenen, Lagebeziehungen und raumbezogenen Problemstellungen
  - `3.4.2` in `Leistungsfach` with Winkeln, Abstaenden und Flaecheninhalten im Raum
  - `3.4.3` in `Leistungsfach` with Ebenenformen, Schnittgebilden, Anwendungen und Beweisen
- the reviewed bridges on that new geometry follow-on are now active on all twelve atomic rows:
  - `c6c5365d-2e1f-4fcf-9641-5c5e794c6b6e -> 265af6af-8eac-5632-b730-800aafcde26a` for the Basisfach entry on scalar-product-based geometry
  - `325ca2a0-1f7b-4dc7-9f1b-0fcbdb1a56a1 -> ed62ab23-4991-52e2-93fc-a1052fd0063a` for the Basisfach plane-description strip
  - `8d7a8269-f56d-483a-b733-a0f50e257b49 -> 24174bba-a654-5f81-8de3-ca5bd09d9b6f` for the Basisfach positional-relationship strip
  - `94f159b3-e033-45a2-901b-40def8b61ec2 -> bd3576b8-f4e5-542a-a8a2-74524d9cee21` for the Basisfach spatial-application strip
  - `1c4a6648-13a3-4590-ab58-7b217d5a6586 -> 265af6af-8eac-5632-b730-800aafcde26a` for the Leistungsfach vector-product / orthogonality entry
  - `4969cc88-f129-49e1-9d19-e87c87cde218 -> 211fa3c8-9e74-5c82-8863-0d51700185cd` for the Leistungsfach area bridge
  - `3c7111fe-86be-4246-af82-319ecd0f48d5 -> ed62ab23-4991-52e2-93fc-a1052fd0063a` for the Leistungsfach plane-form strip
  - `dc305063-b12f-443e-9ce8-19c2d171d20d -> 57b11e9a-4acf-5ebe-b2b6-c9f99d2b5bb5` for the Leistungsfach angle strip
  - `1b46a3cb-f09f-4bc6-8142-8c9b72646f6c -> 36e0de23-1e3b-5c69-888f-e5e19e79cbbe` for Hessesche Normalenform und Abstaende
  - `34ee3898-2b07-4096-adbb-9cc4bd6db065 -> 24174bba-a654-5f81-8de3-ca5bd09d9b6f` for the Leistungsfach line-plane / plane-plane relation strip
  - `2b910726-5f69-4977-a337-5093a4e0786a -> bd3576b8-f4e5-542a-a8a2-74524d9cee21` for the Leistungsfach spatial-application strip
  - `234731e0-e35e-41ba-b976-363d916a1d5c -> 424cca47-adb3-5718-8b62-2af6cef76107` for the Leistungsfach proof / deep-space strip
- the linked BW Basisfach-Messen follow-on is now also active on the remaining geometry-adjacent rows:
  - `3.5.2` in `Basisfach` with Winkelweiten, Punkt-Ebene-Abstaenden und Flaecheninhalten
  - `0cb9b5c8-c179-4ca0-b840-56d97e7f100d -> 57b11e9a-4acf-5ebe-b2b6-c9f99d2b5bb5` for the Basisfach angle strip
  - `ce1e9a42-2853-4970-8b1c-27d2749f0e48 -> fac75b4a-4ec2-5d38-bbce-9b002c8a4904` for the Basisfach point-plane distance strip
  - `032c331e-bcef-441d-8fe5-376bcd198760 -> 211fa3c8-9e74-5c82-8863-0d51700185cd` for the Basisfach area strip
- the next BW Kursstufe source follow-on now imports the first Gauß-Streifen:
  - `3.5.1` in `Basisfach` with Stufenform und Loesungsvielfalt linearer Gleichungssysteme ohne Parameter
  - `3.4.1` in `Leistungsfach` with algorithmischer Deutung des Gaußverfahrens, Matrixschreibweise und geometrischer Deutung von 3x3-Loesungsmengen
- the reviewed bridges on that new Gauß follow-on are now active on all five atomic rows:
  - `178afbcd-9094-4606-a8f4-017aee035fb6 -> 546bf0b3-6921-416b-a2ef-8fd37d429dc7` for the Basisfach Stufenform strip
  - `54a75611-1913-43b5-8203-dfb33820bbe3 -> 546bf0b3-6921-416b-a2ef-8fd37d429dc7` for the Basisfach solution-variety strip
  - `91725a1a-b336-4866-be48-bb5b3831ddce -> 546bf0b3-6921-416b-a2ef-8fd37d429dc7` for the Leistungsfach algorithmic Gauß entry
  - `89ca6408-c991-4aa1-8748-399e8d01be4c -> 2826e0b6-84d3-5abb-85bd-da8db77cc17a` for Matrixschreibweise as representation anchor
  - `f4500069-3499-477a-bc3f-3369ece8f8c1 -> 3def350a-c01c-51c3-be74-b3de20ee53e1` for geometric interpretation through the active Raumgeometrie strip
- the remaining BW Kursstufe-Messen follow-on is now also source-active on the still-open integral application rows:
  - `3.5.2` in `Basisfach` with anschaulichem Integralgrenzwert und Flaecheninhalten zwischen Graphen
  - `3.4.2` in `Leistungsfach` with Integral als Grenzwert einer Summe, Funktionsmittelwerten, Flaechen zwischen Graphen und Rotationskoerpern
- the reviewed bridges on that new Messen follow-on are now active on all six atomic rows:
  - `2d8f4fdc-51cd-4c21-a810-d43a62130970 -> 94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6` for the Basisfach limiting-process bridge
  - `ebd8feb3-49f6-47d1-90ab-e1b149938ce8 -> e9114fc2-1a87-5ef5-8fa3-7ee4c9bbe0dd` for the Basisfach between-graphs strip
  - `f1fb0439-a52b-4367-86e4-9a8b7c7ae2c6 -> 94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6` for the Leistungsfach sum-limit bridge
  - `e396ffe4-2039-440a-bde2-83670c093bfd -> 809ef78a-f282-5593-89be-0f2cb95570ac` for function means on intervals
  - `978db3f1-495f-47c1-9bb7-a7f273771c9c -> e9114fc2-1a87-5ef5-8fa3-7ee4c9bbe0dd` for the Leistungsfach between-graphs strip
  - `4f515334-4c27-41e3-b44f-e6743f7093ac -> 0f180645-37ce-5b6b-8a36-ad7b31168b1a` for rotational-volume work around the x-axis
- the former broad Basisfach Raum-und-Form application atom `94f159b3-e033-45a2-901b-40def8b61ec2` now also survives only as a retained split parent over:
  - `dcfe1605-24fb-4ea7-894f-9626907af5ae` for point reflections at planes
  - `630651d7-2af3-41d5-85d9-ea7c20346a5e` for area and volume applications in space
- the former broad Leistungsfach Raum-und-Form application atom `2b910726-5f69-4977-a337-5093a4e0786a` now also survives only as a retained split parent over:
  - `a388e936-66d2-4d4b-a6b7-7ebd3ecba293` for reflections in space
  - `dea61d00-4b79-487d-bdd4-53473703dfff` for rectilinear motions in space
  - `10207b3a-0b6f-416c-8fbf-ac8c4c6ac8de` for area and volume applications in space
- the reviewed bridges on those new Raum-und-Form application children are now active on all five retained split rows:
  - `dcfe1605-24fb-4ea7-894f-9626907af5ae -> bd3576b8-f4e5-542a-a8a2-74524d9cee21` for Basisfach reflections through the shared line-plane modeling leaf
  - `630651d7-2af3-41d5-85d9-ea7c20346a5e -> 211fa3c8-9e74-5c82-8863-0d51700185cd` for Basisfach area and volume work through the shared body/figure cluster
  - `a388e936-66d2-4d4b-a6b7-7ebd3ecba293 -> bd3576b8-f4e5-542a-a8a2-74524d9cee21` for Leistungsfach reflections
  - `dea61d00-4b79-487d-bdd4-53473703dfff -> 492463cf-6cb2-5a5a-98e0-c1d77c36c256` for rectilinear motions in space
  - `10207b3a-0b6f-416c-8fbf-ac8c4c6ac8de -> 211fa3c8-9e74-5c82-8863-0d51700185cd` for Leistungsfach area and volume work
- all atomic goals in the currently active BW upper-secondary source snapshot now have at least one reviewed bridge onto the canonical math landscape
- the former broad Basisfach e-function atom `d061f00d-6118-46de-a476-ec4c9112e222` now also survives only as a retained split parent over:
  - `e0769810-ba73-4a52-8e9c-660d1fb9d6e6` for the natural-e-function surface with derivative claim
  - `7bf62048-84ba-467f-ba23-f053c4e2989f` for the isolated Stammfunktionsaussage
- the former broad Basisfach integral atom `8f8c4bc8-5b0c-4a62-b6d7-f7fb263c7f1d` now survives only as a retained split parent over:
  - `97ab0ab9-9444-410d-b2d9-1ac9fa935ad8` for introductory integral / bestandsorientierte Deutung
  - `e0c333ea-9873-4718-819c-d39b22ccee30` for Hauptsatz / Stammfunktionsgraphen
- the former broad Leistungsfach integral atom `37d1e9d7-6909-4421-a9f1-11f7b41061ff` now also survives only as a retained split parent over:
  - `72d7ad67-e2ef-41a0-bb52-b62eb5d071e0` for introductory integral / Rekonstruktion aus Aenderungsraten
  - `fb742d93-6c9b-487a-bc7c-f54b363c0c01` for Hauptsatz / Integralfunktion / Stammfunktionsgraphen / Linearitaet
- the retained BW Kursstufe prerequisite bridge now also reaches through the approximate-area canonical leaf `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6`, because that is the smallest didactic prerequisite closure for the active Hauptsatz route
- the active BW learner-facing Kursstufe views now surface the reviewed upper-secondary strip with clearer substructure:
  - Basisfach now splits into `Exponentialfunktion, Logarithmus und Stammfunktion`, `Ableitungsregeln`, `Verknüpfungen und Anwendungen`, and `Integralideen und Anwendungen`
  - Basisfach now also surfaces `Analytische Geometrie und Raum`
  - Basisfach now also surfaces `Lineare Gleichungssysteme und Gauß`
  - Basisfach now also surfaces `Stochastik und Normalverteilung`
  - Leistungsfach now keeps that shared groundwork visible, adds a separate `Leistungsfach-Vertiefung`, and surfaces the new `Regeln und Verfahren`, `Mittelwerte und Rotationskoerper`, `Gebrochenrationale Funktionen`, and `Hypothesentests` strips
  - in the shared groundwork, Leistungsfach now also sees `Analytische Geometrie und Raum`
  - in the shared groundwork, Leistungsfach now also sees `Lineare Gleichungssysteme und Gauß`
  - within that geometry block, the Basisfach view now also reaches angle, distance, and area leaves from `3.5.2`
  - within the shared integral block, both Basisfach and Leistungsfach now also see the reviewed BW strip on limiting processes and areas between graphs from `3.5.2` / `3.4.2`
  - within the Leistungsfach-Vertiefung, BW now also surfaces `Mittelwerte und Rotationskoerper`
  - within the shared geometry block, BW now also reaches the retain-split application semantics for reflections, motions, and area/volume work from `3.5.3` / `3.4.3`
- the active BW learner-facing Sek-I views now expose the reviewed lower-secondary pilot corridor directly instead of surfacing upper-secondary prerequisite anchors as pseudo year buckets
- inside that Sek-I view, `Klassen 5/6: einfache funktionale Zusammenhänge` now carries explicit `Jahrgangsstufe 5` and `Jahrgangsstufe 6` buckets for the reviewed Dreisatz-, Koordinatensystem-, and Zuordnungsanker
- inside `Klassen 7/8: funktionale Darstellungen und lineare Funktionen`, `Jahrgangsstufe 7` now surfaces the retained BW representation split as the learner-facing structure label `Darstellungen und Darstellungswechsel`, while `Jahrgangsstufe 8` carries the reviewed linear-functions strip
