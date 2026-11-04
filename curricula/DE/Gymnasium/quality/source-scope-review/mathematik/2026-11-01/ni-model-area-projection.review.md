# NI-Modellbereich: zwei CPV009-Datenfehler

**PASS für genau drei Referenzänderungen in zwei Views, bei unveränderten effektiven Rollen.** Canon `3a3792d14057854c79a3d8c4d38cd98dd6e28e936865ebd3447107404b58474c` bleibt unverändert. Dies ist eine begrenzte Strukturfreigabe, keine neue Auswahl der Modellkompetenzen und keine Quellenabnahme Niedersachsens.

`ee920de4-1600-582a-a909-02503aa4d1a6` ist im autoritativen Semantic-Ledger ein `curricularArea`, im Canon ein Cluster mit drei vollständigen Atomen. Beide beanstandeten `goalEntry`-Referenzen sind `prerequisiteOnly`. CPV-009 ist trotzdem korrekt: Ein Bereich darf nicht durch eine opake Referenz zum scheinbar atomar prüfbaren Ziel werden. Der Runtimecompiler kann technisch `contains` leeren; dies erteilt keine semantische oder fachliche Freigabe. Die bestehende Regel und ihr Regressionstest bleiben streng.

## Genau genehmigte Änderung

1. **`de-ni-gk.view.json` / `de-ni-gym-math-gk`:** Am bereits vorhandenen `canonicalSubtree` für `ee920…` unter `/rootNodes/25/children/1/children/5/children/1/children/20` ausdrücklich `projectionRole: "prerequisiteOnly"` ergänzen. Danach am illegalen Bereichs-`goalEntry` unter `/rootNodes/44` ausschließlich `kind` auf `canonicalSubtree` ändern; ID und POnly bleiben erhalten. Der andere vorhandene POnly-Subtree unter `/rootNodes/25/children/1/children/5/children/2` und die drei direkten atomaren POnly-Masken bleiben erhalten.
2. **`de-ni-seki.view.json` / `de-ni-gym-seki-math`:** Unter `/rootNodes/44` ausschließlich `kind: "goalEntry"` durch `kind: "canonicalSubtree"` ersetzen. ID und POnly-Rolle sowie alle drei direkten Kindmasken bleiben unverändert.

Die JSON-Datei enthält genaue Hashes, JSON-Patch-Tests und Mutationen. Der GK-Eingang hat SHA `7ba9461f6834327e7b6773a6407e45b95d4b6533ad191c77970ebd45d2fa14b5`, der Sek-I-Eingang `633cc6be68f45dfc2102edf259ba5f83afd19f0fd4fdcf83f238e58a500cb444`.

Ein bloßer Typwechsel an beiden Stellen wäre falsch: In NI-GK existiert zusätzlich ein direkter Target-Subtree derselben Area. Bei gleicher Spezifität gewinnt Target; nach Wegfall der spezifischeren `goalEntry`-Maske würde deshalb die Area selbst POnly→Target wechseln. Die genehmigte Änderung beseitigt diese Kollision ausdrücklich. Die äußere GK-Maske bleibt als echter POnly-Subtree für die normale Sek-I-Ableitung bestehen. Ihre Rolle ist gegenüber dem bereits vorhandenen gleichartigen POnly-Subtree idempotent. Es wird keine Prüfung oder Targetabdeckung der Kinder behauptet.

## Vollständige Kindverträge und Quellenbegrenzung

| Atom | Wesentlicher Vertrag | Entscheidung dieses Reviews |
| --- | --- | --- |
| `74f28ce7-e568-5d6e-b946-17445b344fcc` | Für denselben Sachverhalt mindestens zwei plausible Modelle entwickeln und Annahmen offenlegen. | Vollständig gelesen; POnly bleibt POnly. |
| `163dd583-8308-53f0-b60d-34588787988d` | Modelle nach Einfachheit, Güte und Interpretierbarkeit vergleichen; Vor-/Nachteile begründen. | Vollständig gelesen; keine neue Targetfreigabe aus dem allgemeinen Wort „Modellvergleich“. |
| `519660d0-85e5-57a6-a219-d0a253336649` | Kriteriengestützte Modellwahl und qualitative Empfindlichkeit gegenüber unsicheren Daten oder geänderten Annahmen erläutern. | Vollständig gelesen; dieser Zusatz bleibt Teil des stabilen ganzen Vertrags. |

Die vorhandene NI-Sek-I-Primärquelle wurde gezielt auf **PDF-/Druckseite19** gelesen: Annahmen beschreiben, Einflussfaktoren bewerten, Modelle auswählen und die Wahl begründen, Modelle variieren/verknüpfen sowie unterschiedliche Modelle analysieren und bewerten. Die Oberstufenquelle nennt auf **Seite16** denselben Modellvergleich in der gemeinsamen Einführungsphase; **Seite19** enthält gemeinsame GK-/LK-Modellierung, Modelländerung und Grenzenreflexion. Daher begründet das alte `(LK)` im kanonischen Titel keinen amtlichen GK- oder Sek-I-Ausschluss. Historische Extraktions-Locatoren liegen hier jeweils eine Seite zu niedrig; sie wurden nicht umgeschrieben.

Die vorhandenen Mappingentscheidungen führen diese allgemeinen Prozesszeilen zu `99b3435a…` und in der Oberstufe zusätzlich `723994fb…`, nicht direkt zu den drei betrachteten Atomen. Weder diese allgemeinen Zuordnungen noch `requires` oder bestehende Sichtbarkeit sind ein Ganzvertragsnachweis für alle drei Kinder. Die spezifischen Kriterien und Sensitivitätsanforderung werden nicht still in eine neue Targetauswahl übernommen. Zugleich wird aus fehlenden spezifischen Mappings keine amtliche Unzulässigkeit behauptet.

Der vollständige bisherige Supplemententscheid wurde berücksichtigt: Die ursprünglichen18 bzw. aktuellen21 Fälle prüfen die NI-Verträge17c9/647/74dc/9278/96c5 und den Ersatz fbcb; sie genehmigen diese Modellarea und ihre drei Kinder nicht neu. Ihre ausdrückliche Vorgabe, äußere POnly-Masken zu bewahren, bleibt erfüllt. Die Algebra-HOLDs und positiven Ersatzentscheidungen bleiben unberührt. Eine mögliche gesonderte Verbesserung der Modellierungs-Quellendeckung wird durch diesen CPV009-Fix weder erledigt noch verhindert.

## Rollen und tatsächliche Native-Basis

Die unabhängige In-Memory-Gegenrechnung reproduziert die gelesene native Rollenpriorität für alle fünf NI-Views. In **NI-GK bleiben sämtliche999 autorierten Rollen identisch (942T/57P, einschließlich Cluster)**, in **NI-SekI sämtliche354 (295T/59P, einschließlich Cluster)**. Area und drei Kinder bleiben jeweils POnly. NI-SekII-GK sowie beide LK-Views werden nicht geändert. Die Hashes aller fünf NI-Inputs stimmen mit den tatsächlichen Inputs des neuen3a/84/154-Laufs überein.

Der echte eingefrorene Bericht `final-integration-scope-probe/common-candidate-all154.json` hat SHA `e9d9274566c5d3a573bd6554c057e45b1153963e8f8f92286946bd498b939dde`. Er zeigt für NI sieben Angebote: SekI, SekII-GK/LK/Union sowie CrossStage-GK/LK/Union. In den LK- und GK+LK-Oberstufen-/CrossStage-Angeboten sind alle drei Kinder bereits Target; dies bleibt unverändert. In SekI und GK sind sie nach dem Abschneiden unbenötigten Supports nicht in den atomaren Runtime-Listen. Das ist mit autoriertem POnly vereinbar und darf nicht als Mastery oder als neue Targetrolle gelesen werden. Die strukturelle Area erscheint dort grundsätzlich nicht als atomarer Vertrag.

**Erwartetes Delta aus genau diesem Fix: null atomare Targets hinzugefügt/entfernt, null Kontextänderungen, null Masteryänderungen.** Die gesamte Rollenidentität wurde im Speicher geprüft; ein neuer nativer Lauf der hypothetischen Dateien wurde hier nicht behauptet.

## Umsetzung und Abnahmegrenze

Die zwei Views sind bisher unverändert. Der Autor muss den genauen NI-GK-Quellfix übernehmen, die NI-Sek-I-Ableitung im bestehenden Workflow konsistent erneut erzeugen und die normalen Input-/Materialisierungsbindungen aktualisieren. Die nachfolgende native Validierung muss beide konkreten CPV-009-Findings beseitigen und die sieben NI-Angebote ohne atomaren Target-/Kontextdelta bestätigen. Zulässige opake atomare/Assessment-Entries behalten ihre bestehende Semantik; kein allgemeiner `goalEntry`-Umbau ist genehmigt. Unabhängige BBB- und andere Quellenkorrekturen sind getrennt auszuweisen.

Geändert wurden nur diese zwei Reviewdateien. Kein Canon-, View-, Source-, Mapping- oder Produktionswrite, kein Corpus-, Gradle- oder Backendlauf; keine neuen Kindertargets, keine Cluster-Mastery und keine Waiverprofile. Sämtliche gebundenen Inputs waren beim Abschluss unverändert.
