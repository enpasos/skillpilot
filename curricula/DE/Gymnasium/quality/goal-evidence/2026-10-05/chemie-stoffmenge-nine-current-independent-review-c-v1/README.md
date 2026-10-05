# Independent current chemistry review C, description round B

This receipt records an actual blind AI review of exactly the nine current
goals in `batch-013-stoffmenge-revised-nine-current-v1`, round B. All nine
logical goal pages were rendered from the supplied current PDF and visually
inspected as complete pages; they are physical PDF pages 3–11 after two front
matter pages. The supplied bilingual input, current canonical goal semantics,
current book context and live primary sources were used. No other description
round, earlier candidate, adjudication, peer synthesis or evidence profile was
read before the D records were frozen. No P review was performed.

The first recorded review time is `2026-10-05T02:04:50Z`. The D records were
frozen at `2026-10-05T02:13:14Z`; `D-frozen.json` binds the output and run bytes.
The model family is disclosed as GPT-6/Codex; the exact deployed version and API
sampling parameters are not exposed. `generation-context.json` records those
limitations without inventing a version, temperature, seed or API call.

The actual current bindings are:

- BookModel semantic digest:
  `sha256:d4db3e89d3b1bb4f59d3a9588bd02dea00547dc4116a6c4b6d0a53c3071ccd22`.
- Bundle fingerprint:
  `sha256:a4e79b98d9b49310751f80ef24fe684e8d2bbf8b7a8aa31a2135aae8473012b1`.
- PDF byte digest:
  `sha256:606fe821352c19116c9c66219dc9a5aba217ec20a3ae271f08f6809efbbe1593`.
- D record byte digest:
  `sha256:3373ed99edc62b14d0bdc4163580c50bc1a01daa51e75072c80edb546e2b3eee`.
- Run manifest byte digest:
  `sha256:3bd772558011cdc25e7da863cc3fb52bfe915ab849500eb4510633db34d55893`.

The nine decisions are independently authored `keep` candidates, each with its
own bilingual essential-understanding, independent-performance and meaningful
transfer chain. All supplied current profiles are null, so all nine profile
recommendations are `create` under `positive-understanding-evidence-v2`.

| Logical page | Goal ID | Current title | D verdict |
| --- | --- | --- | --- |
| 1 | 1dc15fa2-fca4-56b0-b5c1-4d215613dde0 | Stoffmenge und Einheit Mol nutzen | keep |
| 2 | 8a2ad724-df5e-5986-8de9-560ba43caac2 | Molare Masse bestimmen und verwenden | keep |
| 3 | dd3fc8fe-2316-5fbc-b569-00651c83bc81 | Atomare Masseneinheit und Grammbezug einordnen | keep |
| 4 | e45c0022-ac0d-5c83-b433-5f68655e382f | Avogadro-Konstante als Teilchenzahlbezug nutzen | keep |
| 5 | 1e5a4b89-69f1-5379-811e-c8ec76faad2a | Avogadro-These fuer Gasvolumina erlaeutern | keep |
| 6 | 2924f784-5261-54e8-93ee-49ac3b3cd300 | Molares Volumen von Gasen nutzen | keep |
| 7 | 199570f4-b3c3-5e12-877d-ced97e9f6968 | Molare Masse von Gasen bestimmen | keep |
| 8 | d629220a-8c1e-58ee-a6e1-b5f4f10e2e7a | Zweiatomigkeit gasfoermiger Elementmolekuele begruenden | keep |
| 9 | ddb76915-4d63-5375-901d-4e659f5e9b09 | Qualitative Elementaranalyse von Kohlenwasserstoffen auswerten | keep |

The review checked semantic atomicity rather than inferring it from leaf shape.
Each current text describes one relationship or explanatory inference. Using
and interpreting that same relationship, or obtaining the same molar mass by
two data routes, does not itself create independent competencies. Provided
formulas, unit factors, particle information and experimental data are suitable
for Sek I; no bond-stability derivation, general equation of state, gas-mixture
analysis or quantitative elemental formula determination was added. Recall of
terms or copying the illustration does not supply independent understanding
evidence. No memory-card or atomicity ledger was changed or newly approved.

Live primary sources checked during this review:

- [Hessen G9 chemistry curriculum](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf),
  printed pages 16/17 for amount, mass units, gas relationships and molecular
  formulas; printed page 26 for qualitative elemental analysis. The old rounded
  Avogadro entry is historical source notation, not today's exact SI value.
- [BIPM mole definition](https://www.bipm.org/en/si-base-units/mole): specifies
  the counted elementary entities and the exact current Avogadro constant.
- [BY Gymnasium chemistry 8 NTG](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium%20/8/chemie),
  learning area 3, for gas weighing, molecular representations and linked
  quantity/conversion relationships.
- [BY Stoffumsatz explanation](https://www.lehrplanplus.bayern.de/serviceinformation/l74335),
  for the distinction between quantities and factors linking quantities.

These checks establish subject-content plausibility and the age baseline used
for the candidate review. They do not certify all jurisdictions' source
mappings, effective learner projections or human source approval. Whole
official-source texts were not copied into this receipt.

## Separate actual page finding

Logical page 3 / physical PDF page 5 visibly labels u as the mass of an
individual particle and g as the mass of a sample. This categorical mapping is
misleading: either unit can express either mass. The current DE/EN description
correctly identifies two different scales of the same quantity. The D `keep`
therefore concerns the accurate description; it does not approve that image.
The actual current bound image digest is
`sha256:edb8dd08597deb4e9b30ebfa0fe8459caef47ea1701ce04937178b84a9cb44b8`, verified against both canonical source and frontend bytes
in `binding-check.json`.

The formula/gas-image routes on other pages were treated as teaching support,
not as proof of learner performance. Printed shortened Avogadro values are
approximations; the V2 expectation states the current exact BIPM value. The
qualitative-analysis chain requires attribution of products to the sample;
provided blank-test data expose moisture/CO2 contamination without requiring an
unsupervised combustion experiment.

## Technical proof and authority

`validator-proof.json` captures the exact command, timestamp, validator/schema
hashes and exit code. `validator-proof.txt` contains the actual successful
output: `Goal-description review batch valid: 9`. The bound round-B record
schema equals the current global schema used by the checker; the actual run
schema under `contracts/goal-evidence/v1/` was used.

`binding-check.json` recomputes book and bundle digests, the nine page
fingerprints, current canonical goal fingerprints and exact DE/EN text. It
also checks prerequisites, contains, dimensions, applicability and source/
frontend image bytes against the book's actual original-image binding. All
nine checks passed, and the full canonical semantic digest also matched the
book at the recorded check time. `pdf-visual-inspection.json` binds the nine
actually viewed page rasters and records content-specific visual observations.

All records remain `candidate` / `ai_candidate`. This is machine quality
assurance, with no human approval, publication, runtime mastery or host/client
acceptance claim. Only this receipt directory and the assigned round-B results
were written.
