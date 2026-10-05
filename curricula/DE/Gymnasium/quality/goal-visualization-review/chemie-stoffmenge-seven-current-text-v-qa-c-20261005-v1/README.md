# Stoffmenge: sieben aktuelle V-Bindungen – unabhängige Fortsetzung C

**Ergebnis: 5 PASS / 2 HOLD.** Sechs unveränderte tatsächliche JPGs nativ und als eigene unveränderte Inhaltsderivate bei 360/680 px angesehen. Das bereits von mir eingefrorene u/g-v2-PASS wurde ausschließlich über den exakt unveränderten SHA256 wiederverwendet. Keine unveränderten weiteren Ziele neu geprüft.

Die aktuellen DE/EN-Texte wurden mit `canonical.before-targeted-revision.json` im Neuner-Revisionsvorbereitungsordner verglichen. Genau die sechs genannten QA-`description`-Felder sind veraltet; Titel unverändert, sämtliche sieben Source-/Frontend-/QA-Assethashes stimmen überein. Der u/g-QA-Text ist bereits aktuell. Die vorhandene D/P-Kenntnis ist dokumentiert: diese gezielte V-Fortsetzung behauptet keine neue blinde D-Prüfung.

| Zielanfang | Urteil | Tatsächlicher Befund |
|---|---|---|
| `1dc15fa2` | **HOLD** | Die Grafik präsentiert `1 Mol = 6,022 · 10^23 Teilchen` und die große zugeordnete Teilchenzahl ohne Näherungskennzeichnung. Der dargestellte Wert ist gerundet; [BIPM](https://www.bipm.org/en/si-base-units/mole) definiert die heutige Teilchenzahl exakt als `6,02214076 · 10^23`. Näherung kenntlich machen; gutes Zähl-/Molmotiv erhalten. |
| `8a2ad724` | **PASS / KEEP** | H₂O-Rechnung mit gegebenen gerundeten Atommassen ergibt 18 g/mol; zwei 1-mol-Portionen ergeben 36 g. `m = n·M`, g/mol und g bleiben korrekt getrennt. |
| `dd3fc8fe` | **PASS / exaktes KEEP** | Aktueller Hash `a1edaf2c262fb5c8e59414112c38e77dca87b48336821a554a369a26787bfeb3` entspricht dem zuvor nativ/360/680 geprüften v2. Beide Einheiten auf beiden Ebenen, Näherungszeichen, Exponenten und schematisch-Markierung bestätigt durch eingefrorenen V2-Receipt. |
| `1e5a4b89` | **PASS / KEEP** | O₂ und CO₂ enthalten je fünf Molekülmodelle bei gleich gezeigtem V/T/p. Die aktuelle Beschreibung setzt ausdrücklich das ideale Gasmodell; Grafik behauptet keine gleiche Masse. |
| `199570f4` | **PASS / KEEP** | CO₂-Rechnung 12+2·16=44 g/mol, `M=m/n`, `m=n·M` und Größen-/Einheitentrennung stimmen. Das Bild illustriert den Formelweg; der alternative Gasdatenweg muss nicht zusätzlich gezeichnet werden und zertifiziert keine eigene Messung. |
| `d629220a` | **PASS / KEEP** | H₂/N₂/O₂/F₂/Cl₂ jeweils mit zwei gleichen Atomen; `2 H₂ + O₂ → 2 H₂O` ausgeglichen. Passung zur konkret gezeigten Auswahl wichtiger Elementgase. |
| `ddb76915` | **HOLD** | Im unteren CO₂-Molekülmodell trägt die zentrale schwarze Atomkugel tatsächlich `CO2` statt `C`, neben zwei roten O-Kugeln. Nur zentrale Atomkennzeichnung korrigieren. CuSO₄-/Kalkwasser-Nachweise und C-/H-Schlussfolgerungen passen zum Auswertungsziel. |

Alle Hauptmotive, nötigen Formeln und Schlussfolgerungen sind bei 360 und 680 px erkennbar. Kein zusätzlicher HOLD wegen unterstützendem Kleinsttext. Die beiden HOLDs sind konkrete fachliche Befunde und dürfen durch eine technische Beschreibungsaktualisierung nicht als gelöst gelten.

## Freeze und Übergabe

Eigener Freeze: **2026-10-05T03:14:35.012563Z**, vor Lesen eines Root-Inhaltsurteils. `visual-verdict.frozen.json` SHA256: `9feded472961642dbfaac93d83c001e406a2ec88363ba2400eb5dc72d85aae70`.

`actual-input-and-metadata-deltas.json` enthält genaue DE/EN-before/after, QA-Beschreibungsdeltas, Asset-/Vorschaubindungen, Originalgrößen und die tatsächliche Prüfabgrenzung. `binding-verification.json` prüft die sieben aktuellen Texte/Assets sowie den unveränderten eigenen B013-D-, B008-D- und u/g-V2-Freeze.

Keine aktive QA-, Canonical-, Source-, Frontend- oder Provider-Mutation durch diesen Reviewer. Historische menschliche/ChatGPT-Angaben werden nicht überschrieben. Kein Human Approval. Root kann die genau sechs aktuellen Beschreibungsmetadaten technisch aktualisieren und muss die beiden offenen Bildbefunde weiterhin ausdrücklich erhalten. Nach gezielter Bildkorrektur sind tatsächliche neue Ausgabe und betroffene D/P/V-Bindungen unabhängig zu prüfen.
