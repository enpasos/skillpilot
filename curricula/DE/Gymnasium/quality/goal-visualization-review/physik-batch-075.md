# Goal Visualization Review - Physik Batch 075

Review date: 2026-08-27

Scope: rückwirkende Provider- und Fachprüfung aller 23 noch aktiven Physik-Visualisierungen, die während des laufenden Deep-Understanding-Rollouts zuvor als eigene beziehungsweise OpenAI-PNG-Fassungen erstellt worden waren, sowie Wiederherstellung geeigneter vorhandener Nano-Banana-Pro-Übersichten nach strukturellen Ziel-Splits.

Status: `completed`

## Decision

| Goal ID | Goal | Decision | Accepted SHA-256 / review result |
| --- | --- | --- | --- |
| `01bebdfc-5819-4610-a03e-ea5e794fc954` | Reihen- und Parallelschaltungen für eine Funktion planen | `accepted_retroactive_nano_banana` | `ce19e39aef33e3a71ef5d332416858f24ba3b1ec598a28b0dc649168e8eb9e0e`; Reihen- und Parallelschaltung sowie ihre unterschiedlichen Strompfade sind korrekt unterscheidbar. |
| `267170bd-f880-56a7-9719-ffb9751872c5` | Spannungsbilanzen in Maschen mit Energieerhaltung begründen | `accepted_retroactive_nano_banana` | `f2583a28e72bc1b7d201ae788c37c8b55822a63f2f0b6a029418b636cf405986`; Spannungsanstieg und Spannungsabfälle bilden eine geschlossene, ausgeglichene Masche. |
| `33e3417c-e062-5f4a-8df9-3195dca50089` | Mondphasen mit Beleuchtung und Blickrichtung erklären | `accepted_retroactive_nano_banana` | `2c1670663dc53b70c7b15bdf93ab614547905ec5df1cdea2c9f39f4319d15da7`; Beleuchtungsrichtung, Mondpositionen und sichtbare Phasen sind konsistent. |
| `3c82510a-1f12-4eaa-81c2-8599437a5b85` | Schallausbreitung im Teilchenmodell erklären | `accepted_retroactive_nano_banana` | `5b804a516a7f7d40b4909decfc733b24a74574af40f94d5804e9f7f3accfc82f`; lokale Teilchenschwingung und fortschreitende Verdichtungen/Verdünnungen sind als Longitudinalwelle korrekt getrennt. |
| `3c8e5510-a12d-5770-8a01-e5fe741b259c` | Reflexionsgesetz experimentell prüfen | `accepted_retroactive_nano_banana` | `e3e51d533dfff5e63571664b51e0d5f0feddc2c5dac5cbdcb0b8ae64c4fdb21a`; Einfallswinkel und Reflexionswinkel sind am Lot gleich groß eingezeichnet. |
| `41d35667-0296-5f84-bc12-202ffc440be0` | Kräfte vektoriell zusammensetzen und Resultierende bestimmen | `accepted_documented_repo_native_fallback` | `f631200a4f5f4ae96f42202013fe2f27735707ad5262c1b1eaca4ec9d780de23`; exakt drei waagerechte und vier senkrechte Rastereinheiten, gemeinsame Pfeilanfänge und Resultierende zum gegenüberliegenden Rechteckpunkt, daher `F_R = 5 N`. |
| `45bbdf6b-6372-5b6a-b7e4-be15a0eb4b83` | Kraft und Verformung experimentell untersuchen | `accepted_retroactive_nano_banana` | `146636869dbe72b8dd53f2976b859c9807b550be726f72325f457193ea998e06`; Messaufbau sowie proportionaler und nichtproportionaler Bereich der Kraft-Verformungs-Beziehung sind nachvollziehbar. |
| `51de4fd9-6827-5b3d-b2ca-5e27ba961a7f` | Temperatur mit einem geeigneten Thermometer messen | `accepted_retroactive_nano_banana` | `20b29c13f48b75bc76db6d43bad508e9c325344607702e37faa43fd63e7c970b`; Messkörper, Skala und korrektes Ablesen auf Augenhöhe sind klar dargestellt. |
| `67ffd0f0-a5ab-518f-8c45-4c0e7eb18390` | Angriffspunkt, Wirkungslinie und Schwerpunkt deuten | `accepted_retroactive_nano_banana` | `63460b45e7ee495b7ce2422c3e27eece5ab3502e84ff821d53e64bfa01351a4f`; Angriffspunkt, geradlinige Wirkungslinie und Schwerpunkt sind fachlich korrekt zugeordnet. |
| `79cb1695-f985-443a-b93e-27b57ab474b7` | Lichtwege mit dem Strahlenmodell darstellen und vorhersagen | `accepted_retroactive_nano_banana` | `19d7e178c6ed2ad74862726f03f4a944815394333ad341f26c8e15bda7be0a25`; der Lichtstrahl verläuft geradlinig durch die Blendenöffnung. |
| `79da5c34-86b2-5c10-9726-9de886ccef7d` | Geschwindigkeitsabhängige „relativistische Masse“ herleiten und einordnen | `accepted_retroactive_nano_banana` | `d53ad6ee8dc52cfc04566f97b3ad4be90e5ad400002bb07bb22ebb53b36fe9ad`; die ausdrücklich historisch-konventionelle Größe startet bei der Ruhemasse und wächst für `v` gegen `c` stark an. |
| `8a84de16-2fde-58ec-827a-f803e2ce8564` | Strombilanzen an Knoten mit Ladungserhaltung begründen | `accepted_retroactive_nano_banana` | `2c30ff0aea4f1fb19689575756df8b2b243c96960b2e7f2f3ba4643102b79c80`; zufließende und abfließende Stromstärken erfüllen die Knotenregel. |
| `8f833b36-4126-52db-b210-79fb0023c7d9` | Widerstandswirkungen in Reihen- und Parallelschaltungen deuten | `accepted_retroactive_nano_banana` | `2ee338935d6ff22ae21928cb2c6bc88415ff3716c4d3e23742af6b4f11721fbc`; Schaltungsformen, Gesamtwiderstandsbeziehungen und Grenzfall sind konsistent. |
| `a24c41ce-68c5-56a7-8235-ef9a7dba7042` | Schallgeschwindigkeiten in verschiedenen Medien vergleichen und begründen | `accepted_retroactive_nano_banana` | `a26494acb70d474f814f3e4a9a3016cb8da1234877f44a416613160b1f9257b5`; typische Reihenfolge und Teilchenkopplung in Gas, Flüssigkeit und Festkörper stimmen. |
| `a4681378-ade4-4f20-bf77-fb020469510f` | Entstehung und Zerlegung von Farben erklären | `accepted_retroactive_nano_banana` | `80c0ce6fb636b865c813aa7384cd8ab5b5de9aaaf5fde24203ae2a12e81ef147`; additive Farbmischung und spektrale Zerlegung sind klar voneinander unterschieden. |
| `af0e2efb-f634-5f2d-abea-b2e1a67a2894` | Masse von Körpern messen und vergleichen | `accepted_retroactive_nano_banana` | `5ce78460618d30d3c17856f89d5cfd3f561be2c9ae2041e164178d0ff2e728b0`; Waage, Referenz und Vergleich der Massen sind eindeutig. |
| `b57427c9-1af5-5daa-8c65-b84a4cc20785` | Spiegelbilder am ebenen Spiegel mit dem Strahlenmodell erklären | `accepted_retroactive_nano_banana` | `517ad891badebf527fdb42d590b0f2becbd56e26e6fcc58f3f4053ffae0af25a`; reflektierte Strahlen und rückwärtige Verlängerungen lokalisieren das virtuelle Bild hinter dem Spiegel. |
| `b60f63b6-e70b-5557-9f54-86d42fa80325` | Thermische Ausdehnung fester, flüssiger und gasförmiger Stoffe deuten | `accepted_retroactive_nano_banana` | `b68f356f14a5f9a8dcbccd51c41226106ec1ed920145ca4ba7102fa0e762abb2`; Erwärmung und Ausdehnung werden für alle drei Aggregatzustände qualitativ richtig verknüpft. |
| `b92827a7-5d62-5fdb-a6f5-ac44461f4a7b` | Leistung als Energie pro Zeit bestimmen und deuten | `accepted_retroactive_nano_banana` | `bf9b07bd5f15b09eed2a6ec0e73b431636767d4382e3e0575406c388703b5ac0`; gleiche Energie in kürzerer Zeit wird korrekt als größere Leistung gedeutet. |
| `c2d6bdf1-8077-50fb-a8b5-2f0b7e3493f0` | Dichte aus Masse und Volumen bestimmen und deuten | `accepted_retroactive_nano_banana` | `79a020c5b6c626e48ad96bcd0d27aaf40f3345e2477145887c258ca1a8dda901`; Masse, Volumen und Quotient `rho = m/V` sind konsistent verbunden. |
| `f7f2c254-1663-5861-bed7-a32c00495b19` | Wirkungsgrad als Verhältnis nutzbarer und zugeführter Energie deuten | `accepted_retroactive_nano_banana` | `2980a12e8a5a9cfddb5e5caf31864836f26fc7da9face8710e970e34b905b11e`; Energiefluss und Verhältnis von Nutz- zu zugeführter Energie sind korrekt, der Wirkungsgrad bleibt höchstens 100 Prozent. |
| `f827b00f-af7f-52de-84aa-2a2bbaa035bd` | Volumen regelmäßiger Körper geometrisch bestimmen | `accepted_retroactive_nano_banana` | `d2973dc053ac5798b0a75e225ee841e24f90817b863a962a68f3d0e3f36187a5`; Abmessungen und Volumenformel des regelmäßigen Körpers passen zusammen. |
| `f92b5b8a-327f-50d2-8313-6a142399ebf0` | Volumen unregelmäßiger Körper durch Flüssigkeitsverdrängung bestimmen | `accepted_retroactive_nano_banana` | `f55352ed6e602c36d10cf2c50ed164d8aca52d808375485194a78cc66ea5a090`; Anfangs- und Endvolumen sowie ihre Differenz bestimmen das verdrängte Körpervolumen. |

## Provider policy and fallback evidence

- Für 22 der 23 Ziele ist die aktive Fassung jetzt ein gezielt erzeugtes und in Originalauflösung geprüftes Nano-Banana-Pro-JPG. Kanonische, öffentliche und Backend-Kopie sind jeweils hashgleich.
- Für `41d35667-...` wurden vier gezielte Nano-Banana-Pro-Versuche mit den Promptdateien `prompt.nbp-retroactive-001.de.md` bis `prompt.nbp-retroactive-retry-004.de.md` verworfen. Die Ergebnisse hielten das geforderte 3×4-Kräfteparallelogramm nicht exakt ein: vertauschte Rasterdimensionen, ein zusätzlicher Pfeil oder ein Resultierenden-Endpunkt außerhalb des durch 3 N und 4 N bestimmten Rechteckpunkts. Die aktive repo-native Fassung ist daher die dokumentierte enge Ausnahme, nicht die Voreinstellung.
- Die 22 ersetzten PNG-Fassungen wurden erst nach erfolgreichem Import und Hashvergleich als inaktive Duplikate aus kanonischer, öffentlicher und Backend-Ablage entfernt.

## Erhalt vorhandener Nano-Banana-Übersichten nach Ziel-Splits

Die folgenden fünf bereits vorhandenen und erneut in Originalauflösung geprüften Nano-Banana-Pro-Bilder passen weiterhin zum kombinierten Inhalt ihrer nun nichtatomaren Elternziele. Sie bleiben dort als Cluster-Übersicht aktiv; die spezifischeren Kinderbilder werden dadurch nicht ersetzt.

| Cluster ID | Kombinierter Inhalt | Decision | SHA-256 |
| --- | --- | --- | --- |
| `d27c8860-12a4-4d7d-9849-ccd8b7caca48` | Temperaturmessung und thermische Ausdehnung | `restored_existing_nano_banana_cluster_overview` | `6190c4ed91d84564b21d7db43c5ea3fc6a93fb2d33ce54a14f53f0bb28957ee9` |
| `cca06d84-28fe-4b80-9bcd-968dda026e0e` | Reflexionsgesetz und Spiegelbildkonstruktion | `restored_existing_nano_banana_cluster_overview` | `99fd4a2e9f12672707395c2fcb95633964ac7aa012e1cd61083c281f08218111` |
| `e41356c1-968b-435a-af25-b663f080ae5a` | Masse, Volumen und Dichte | `restored_existing_nano_banana_cluster_overview` | `6bf975ff08744466dc6d27d4a94a95c8ad5b244167c469906e18f781fba7b370` |
| `10bb8262-fb0f-40cf-94ef-408420ec7cf2` | Kraftpfeile, Wirkungslinien und Kräfteaddition | `restored_existing_nano_banana_cluster_overview` | `deb84db80adfccc26fce665409f46dc50c3a0d86baec5c37eb7afa7ae65ca15d` |
| `201d353a-dfe7-521b-b0f6-eccb4d42945b` | Energie, Leistung und Wirkungsgrad | `restored_existing_nano_banana_cluster_overview` | `cda4dd061699db6eb61d5adfe737d638e1b492fc320c432aca8011279c3a0eb2` |

Das vorhandene Nano-Banana-Pro-Übersichtsbild `3e33813d-db75-4571-8345-3845b02b956d` (Hören, Ohr und Lärmbelastung einordnen; SHA-256 `6be3baff4c049165737556840f633a9727a6227ffd213e9e4df8417425889302`) blieb durchgehend aktiv und unverändert.

## Deliberately not restored

Das frühere kombinierte Finsternisbild des Clusters `1fede37b-...` wurde nicht wieder aktiviert. Seine Schattenrand-Geometrie war in Originalauflösung nicht fachlich exakt und reproduzierte damit die vom Product Owner bereits beanstandete Fehlerklasse. Der Stilvorrang von Nano Banana Pro hebt die fachliche Korrektheitsschranke nicht auf.
