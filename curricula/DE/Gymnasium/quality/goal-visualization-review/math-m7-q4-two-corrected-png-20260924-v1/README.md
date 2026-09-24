# Mathematik M7: zwei gezielt korrigierte Q4-Bilder

Review date: 2026-09-24

Die beiden zuvor aktiven JPGs hatten konkrete fachliche Schwächen. Beim Beweisbild fehlte die ganzzahlige Bindung von `k`, obwohl die Checkliste eine erklärte Variable behauptete. Beim Kioskbild waren „2 Euro pro verkauftem Saft“ als Verkaufspreis/Erlös lesbar, während `K(x)` eine Kostenfunktion sein sollte. Dies sind keine allgemeinen Stilgründe für einen Austausch; die freundliche, abstrakte Comic-Komposition der alten Bilder wurde durch einen gezielten OpenAI/Codex-Bildedit erhalten.

| Ziel | Neuer PNG-SHA-256 | Fachlicher Befund am tatsächlichen Bild | Entscheidung |
| --- | --- | --- | --- |
| `fcb4cef1-b17a-5682-924c-41498fc6c9b2` | `2fced6226ce06bde28b37b391daeb0710dd1272ba6e25dd3aff28dbbfc45e67e` | Sichtbar `n = 2k` mit `k ∈ ℤ`; `n² = 4k² = 2(2k²)` und „also gerade“ sind fachlich konsistent. Die drei Prüfpunkte passen zur gezeigten Bedingung und Folgerung. | `accepted` als AI-geprüftes aktuelles PNG; keine menschliche Freigabe. |
| `fde351a8-98b1-5d75-b4df-813beb2bbe3c` | `a831dbbe7a5cc3b92da30376bf22cf63c6cbd02f18be8e51cea20510e2febd44` | Sichtbar 15 Euro Fixkosten, 2 Euro **Materialkosten je Saft** und `x = Anzahl Säfte`; daraus folgt `K(x) = 15 + 2x` als Kostenmodell. Kein Verkaufspreis oder falscher Erlösbezug. | `accepted` als AI-geprüftes aktuelles PNG; keine menschliche Freigabe. |

Die PNGs wurden im Original (`1679 × 937` bzw. `1678 × 937`) und in einer diagnostischen 360-Pixel-Kartenansicht geprüft; Text, Mathematik und wichtige Pfeile bleiben erkennbar. Das `ℤ` wurde zusätzlich am Originalausschnitt geprüft. Es gibt keine fremden Logos, fotorealistischen Elemente oder neuen Aufgabenlösungen. Die Bilder dienen nur der Orientierung, nicht als Leistungsnachweis. Die unveränderten Zieltexte und Quellenzuordnungen wurden gegen die neuen Motive geprüft; D/P-Nachweise sind dadurch nicht automatisch wieder gültig und müssen ihre Bildbindung gesondert bestätigen.

Herkunft: OpenAI/ChatGPT-Codex-Bildgenerierung als gezielter Edit der zuvor aktiven JPGs; keine behauptete Modellversionsnummer. Die tatsächlich verwendeten Edit-Prompts sind [`fcb4.prompt.md`](fcb4.prompt.md) (`b51af416323bc10d885cfaa86a806762825a2c5efb8184a4f5990825acfd77ff`) und [`fde.prompt.md`](fde.prompt.md) (`be01aa50a8d35733be5a91a27f7f5a8d7e68b390c3897e28bdbc9bcc20b2b584`). Die akzeptierten Kandidaten liegen unter [`candidates/`](candidates/); Quelle, Web-Asset und Backend-Asset sind pro Ziel bytegleich. Der Import verwendete den dokumentierten `visualization:import`-Helper mit explizitem Provider, Prompt und sachgerechtem Alt-Text. Die kanonische Lizenzangabe ist `CC-BY-4.0` gemäß `LICENSING.md`, nicht ein Provenienzlabel.

Die ersetzten Original-JPGs und ihre bisherigen Generator-/Rekonstruktionsprompts liegen byteidentisch unter [`archived-active-jpgs/`](archived-active-jpgs/), ohne historische Reviews zu verändern:

| Ziel | Alter JPG-SHA-256 | Alter Prompt-SHA-256 | Alter Rekonstruktionsprompt-SHA-256 |
| --- | --- | --- | --- |
| `fcb4cef1-b17a-5682-924c-41498fc6c9b2` | `2907b47b6bebfe6ac66def169c0699555cadff01bfbba4144de85fcf89cd122f` | `7910fb4f8db568695629ad1c02ba2b69422cb4880f66f55d6a13e29734dd1e3c` | `101cd861214c01cfb5ea449992fbdad84bda121bbf9a17dcf3927811759e28b8` |
| `fde351a8-98b1-5d75-b4df-813beb2bbe3c` | `3ea2d967f8072eaa074c50ee8bfe91649bcd73f266e3ec1343af35b4d99c6979` | `914fc45045de5e2dd6e022c179012de928f6c95060878e1d9a3187e13a90ba74` | `58de45bcbd41708cd732823b0c86519befcca34309167fc2c71638c00eb38299` |

Die sechs alten, nicht mehr verlinkten JPG-Kopien wurden nach Archivierung und Prüfung der neuen URL aus kanonischen, Web- und Backend-Asset-Verzeichnissen entfernt. Sie sind über dieses Review-Archiv und zusätzlich über Git wiederherstellbar. Die früheren menschlichen JPG-Freigaben wurden **nicht** auf die PNGs übertragen; im aktuellen QA-Ledger stehen `humanApproved: no`, `humanReviewedAt: null` und hashgebundene AI-Entscheidungen für genau diese beiden PNGs.
