# Mathematik: Quellenprüfung der frühen Ableitungsbilder

Stand: 13. November 2026. Technischer und fachlicher Quellenabgleich; keine neue unabhängige Qualitätsfreigabe.

## Entscheidung und Umfang

Die Bilder zu `858113c5-e53b-57bb-b01f-ba95c3ddcb6f` (Ableitungen elementarer Funktionen berechnen) und `dde9ae98-d97d-598b-92f4-f1616f4d75c8` (Faktor- und Summenregel beweisen und anwenden) verwenden für den frühen Ableitungseinstieg ganzrationale Beispiele. Sie setzen damit weder Exponentialableitungen noch die Ableitungen von Sinus und Kosinus voraus.

Der globale Zieltext bleibt unverändert. Ein Bild mit einem einfachen ganzrationalen Beispiel illustriert einen zulässigen Teil des Zielumfangs; es bildet nicht notwendig sämtliche späteren Anwendungen dieses kanonischen Ziels ab. Diese Korrektur normalisiert weder den gesamten Zielumfang noch seine Länderzuordnungen.

## Frühe Platzierung und Voraussetzungen

Maßgeblich ist `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`:

- Beide Ziele liegen im Cluster `bc68c585-3b1d-4c94-8a2b-c10a4dcdb4e8`, „Einstieg Ableitungsbegriff und Änderungsraten“.
- `858113c5-e53b-57bb-b01f-ba95c3ddcb6f` setzt unmittelbar `b42bdfcc-3db7-5697-8b3e-69e50962ca86`, „Grenzwerte des Differenzenquotienten bestimmen“, voraus. Exponentialableitungen gehören nicht zu seiner Voraussetzungskette.
- `dde9ae98-d97d-598b-92f4-f1616f4d75c8` setzt unmittelbar `e9445479-c188-5c09-842d-faa5e8678099`, „Potenzregel für ganzzahlige Exponenten exemplarisch begründen“, voraus. Trigonometrische Ableitungen gehören nicht zu seiner Voraussetzungskette.
- Das spätere Ziel `628928a6-4f48-54dc-952d-dec0e69dc856`, „Eigenschaften der natürlichen Exponentialfunktion begründen“, setzt seinerseits `858113c5-e53b-57bb-b01f-ba95c3ddcb6f` voraus. Eine umgekehrte Voraussetzung würde einen Zyklus erzeugen.

Der unmittelbar geprüfte amtliche Text unter `curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf` unterscheidet auf S. 32 in E.2 Potenzregel, Faktor-/Summenregel und ganzrationale Funktionen von den Exponentialableitungen in E.4 sowie den trigonometrischen Ableitungen in E.5 auf S. 33. Die zugehörige strukturierte Extraktion liegt unter `curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json`.

## Weitere Bindungen des globalen Ziels `858113c5-e53b-57bb-b01f-ba95c3ddcb6f`

Die Prüfung aller vorhandenen Mappingdateien unter `curricula/DE/Gymnasium/mapping/` ergab folgende Unterscheidung:

| Quellenpfad | Konkreter Bezug |
| --- | --- |
| `mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_to_canonical_math.json` | Legacyziel `e2b6b4d1-02db-4a27-948e-ecfbdb44dab3` ist als `exact` zugeordnet. Sein eingefrorener Text nennt einfache Exponential- und Potenzfunktionen ausdrücklich. |
| `input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_MATHEMATIK.de.json.snapshot` | Enthält diesen Legacytext. Er ist historische Autorenoperationalisierung und nicht mit dem amtlichen E.2-Wortlaut gleichzusetzen. |
| `mapping/DE-BB/upper-secondary/bb_math_upper_secondary_to_canonical_math.json` | Legacyziel `55041b6e-7a4a-4dd1-bcc8-1bc5759f4702` ist als `exact` zugeordnet. |
| `input/BB/upper-secondary/source-json/DE_BRA_S_GYM_2_MATHEMATIK.de.json.snapshot` | Dieses Legacyziel nennt neben Ableitungsregeln ausdrücklich das Einordnen der natürlichen Exponentialfunktion als sich selbst ableitende Funktion. |
| `mapping/DE-SH/upper-secondary/sh_math_upper_secondary_source_extraction_to_canonical_math.review.json` | Amtlicher Quellenaspekt `de-sh-mathematik-sekii-fachanforderungen-2024-sh-sekii-l4-funktionaler-zusammenhang-T034-b0c1135623` ist ausschließlich auf dieses kanonische Ziel als `exact` abgebildet: Potenzfunktionen mit rationalem Exponenten im Ableitungskontext. Eine Beschränkung auf ausschließlich ganzrationale Funktionen würde diese Abdeckung verlieren. Die Aspekte K018 und T065 zur Ableitung der genannten Funktionsklassen beziehungsweise zu ihren Regeln sind als `partial` über mehrere Ziele verteilt. |
| `mapping/DE-BW/upper-secondary/bw_math_upper_secondary_source_extraction_to_canonical_math.review.json` | Die amtlichen Aspekte `bw-math-sekii-bp2016-3-5-1-02` und `-03` zu Produktregel und Kettenregel mit linearer innerer Funktion sind als `partial` über dieses und ein weiteres Ziel verteilt. |
| `mapping/DE-BE/upper-secondary/be_math_upper_secondary_source_extraction_to_canonical_math.review.json` und `mapping/DE-BB/upper-secondary/bb_math_upper_secondary_source_extraction_to_canonical_math.review.json` | Die amtlichen Aspekte `be-math-sekii-rlp-gost-q1-09-cf9fd397` beziehungsweise `bb-math-sekii-rlp-gost-q1-09-cf9fd397` zu Konstanten-, Potenz-, Faktor-, Summen-, Produkt- und Kettenregel sind als `partial` über mehrere Ziele verteilt. |
| `mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json` | Der amtliche Aspekt `857d65dd-a64c-5479-8db9-e308ef2566f3` betrifft das Ableiten ganzrationaler Funktionen einschließlich Faktor- und Summenregel; Zuordnung `partial`. |
| `mapping/DE-NI/upper-secondary/ni_math_upper_secondary_to_canonical_math.json` und `mapping/DE-NW/upper-secondary/nrw_math_upper_secondary_to_canonical_math.json` | Zusätzliche Legacyzuordnungen sind als `partial` bezeichnet. |

Alle Tabellenpfade sind relativ zu `curricula/DE/Gymnasium/`.

In den amtlichen Quellenentscheidungen der geprüften `*.review.json`-Dateien wurde keine exakte, ausschließlich auf dieses Ziel gerichtete Forderung nach Exponentialableitungen gefunden. Das ist keine Freigabe zum ersatzlosen Kürzen des globalen Zieltexts: Die bestehenden exakten Legacyzuordnungen und die weiteren Quellenbindungen bleiben bestehen. Ein Entfernen der Exponentialpassage würde eine gesonderte inhaltliche Prüfung dieser Bindungen und der dadurch geänderten Revieweingaben verlangen.

Die vorliegende Entscheidung beschränkt sich deshalb auf geeignete frühe Bildbeispiele. Sie ändert keine Lernzielidentitäten, Voraussetzungen, Quellenzuordnungen, historischen Nachweise oder Lernendenergebnisse und behauptet keine bereits umgesetzte Scope-Normalisierung.
