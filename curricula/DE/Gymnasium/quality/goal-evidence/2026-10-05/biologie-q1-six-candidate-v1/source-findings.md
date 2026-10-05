# Source and scope findings — six-goal candidate

These are author findings, not active source decisions. `source-bindings.snapshot.json` retains the inspected mapping rows, extraction goals, decisions and actual source-view entries. Neither a local `exact` label nor canonical jurisdiction tags prove full source coverage of a proposed text.

## Hessen: actual official text versus authored extraction

The actual [HMKB PDF](https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf) was opened live and downloaded into this candidate. It is Ausgabe 2024, **Stand 01.08.2025**, SHA-256 `52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558`; bytes agree with the repository's retained official PDF. Q1.1 is printed p.38/PDF index37, Q1.2 is printed p.39/index38. The `Q1.1.1`, `.2`, `.4`, `Q1.2.5`, `.9`, `.11` labels are local extraction spans, not six numbered PDF competency sentences.

The six local HE source goals have `sourceText` and `rawSourceText` equal to authored “Die lernende Person kann …” sentences. The actual PDF uses subject bullets. Thus no source-extraction sentence is to be quoted as official wording. Preserve the extraction as provenance, but review exact clause coverage against the downloaded PDF.

| ID | Official scope | Candidate source preservation |
| --- | --- | --- |
| `0daa79f6` | Q1.1, p.38, GK/LK: DNA structure **and** semiconservative replication | Structure atom plus existing `e70d8a85` replication atom; explicit source/view routing and semiconservative coverage check required. |
| `475eebb4` | Q1.1, p.38, GK/LK: biosynthesis at pro/eukaryotes; mRNA, ribosome, tRNA, code | Keep-model candidate uses a connected chain and both cell contexts; prior keep/split dissent is unresolved. |
| `ffef97e3` | Q1.1, p.38, GK/LK: four gene-mutation types | Conditional protein consequences are a didactic operationalization from adjacent biosynthesis/gene-product context, not a verbatim bullet. |
| `946ce2e7` | Q1.2, p.39, GK/LK: transcription factors **and** DNA methylation | Two companion atoms retain both mechanisms; LK histone modification must not replace GK/LK DNA methylation. |
| `5b2571d9` | Q1.2, p.39, **LK**: bacterial structure **and** reproduction as a schema | Separate structural and binary-fission atoms; no compulsory exponential model beyond a simple supplied time series. |
| `8eb86a82` | Q1.2, p.39, GK/LK: PCR and electrophoresis | Supplied-gel explanation/analysis candidate; official method bullet does not itself assert practical learner performance. |

## Bavaria: direct evidence and missing bindings

Live official [B9 Biologie](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/biologie), [B12 grundlegendes Niveau](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/grundlegend) and [B12 erhöhtes Niveau](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/erhoeht) were inspected. Navigation numbers differ from the extraction's flattened topic/bullet numbers.

- `0daa79f6` has a direct `exact` B9 source binding (`e4f857b8…`, local B9.3.2). The actual structure/information-store clause does not require replication. Narrowing to structure matches this boundary; it does not approve the complete binding automatically.
- `475eebb4` has a direct `exact` B9 binding (`a6ad1554…`, local B9.3.3). This source also requires proteins' role in trait expression. A transcription/translation model alone is not a full-clause proof. Preserve or separately map the trait-role component after reviewing an appropriate target.
- `ffef97e3` has a direct `exact` merged B12-GA/EA binding (`ef3a58c6…`). The actual B12 2.4 clause covers mutagens, consequences for **protein function**, and significance of protection. The shared mutation/protein-sequence candidate covers part of this, and one controlled function example does not cover the mutagen/protection clauses. An `exact` label must not silently follow the revised sentence. Keep the distinct GA/EA occurrences and source fidelity; evaluate a partial shared binding plus reviewed companion coverage.
- `946ce2e7`, `5b2571d9`, and `8eb86a82` have BY in canonical applicability, but this inspection found **no direct BY source-to-ID mapping or BY source-view target entry** for them. Actual BY subjects exist in B12 2.2 (regulation/epigenetics), B9 2 (microorganisms) and B12 2.6 (DNA analysis). Those are possible new reviewed bindings, not existing full source approval. Do not clone the HE status or LK scope.

## ffef: seven distinct lower-stage placements

All seven active source views really contain `ffef97e3`. Canonical Q1 metadata does not remove it from those scopes. The actual retained official PDF pages were read; local excerpt paths and hashes are in `sources/seki-retained-source.receipts.json`. This is a bounded comparison of the mapped source clauses, not a new full source review of all seven curricula.

| State | Existing mapping | Actual selected source boundary | Consequence for the molecular four-type candidate |
| --- | --- | --- | --- |
| MV | partial, broad J10 genetics extraction | PDF p.30 discusses mutation definition, mutagens, body/germ-line effects and mutation/modification; no four-type DNA-case requirement is specified there. | No full four-type/coding-protein coverage proven; review selected clause and stage separately. |
| NI | three partial FW7 rows | Printed p.89 explicitly restricts mutation to **“ohne molekulargenetische Betrachtung”**; p.87/89 postpone molecular treatment to Sek II. Extraction omits the restriction. | Proven extraction/source-view fault for this candidate. Remove only the unsupported ffef relationships **after** preserving actual age-fit required variation coverage and its usable frontier. |
| RP | partial TF10 “Individualität …” clause | Actual TF10 is printed p.42/PDF44, not the extraction's claimed p.41. It requires individuality at different organisation levels and simple gene-to-trait models. | That single clause is not exact evidence for four molecular mutation types; page and local clause binding require review. |
| SH | `reviewed_source_to_canonical`, broad VA extraction | Printed p.27/PDF29 VA5 gives mutation/recombination as genetic variability; no four-type sequence analysis. | Do not call this `partial` indiscriminately or infer the new molecular demand. Review the specific VA target scope. |
| SN | partial, broad class10 genetics extraction | Printed p.30–31/PDF42–43 includes protein synthesis and mutation **Gen/Chromosomen/Genom** categories. | Molecular context exists, but these categories do not establish the four HE subtypes as a full required goal. |
| ST | partial, broad “SekI” extraction | PDF/printed p.42–43 is headed class10 **Einführungsphase**; mutation categories are genome/point mutation and a simple gene-to-trait schema. | Scope metadata itself needs review, as does four-type coverage. Do not treat the existing Sek-I label as definitive stage evidence. |
| TH | partial, broad 9/10 extraction | Printed p.22–23/PDF28–29 includes protein synthesis and Gen/Chromosomen/Genom mutation with causes/consequences. | Context is relevant but four subtypes/full coding-case expectations are not all established by the mapped clause. |

## NI exact proposed repair and retained curricular intent

`source-remediation.plan.json` captures exact current values and proposed changes. The **active** NI mapping input is the dated `m7-e3-recombination-20261001-v2.review.json`, not merely its older base file. The active source-view generator input must be rebound to a freshly reviewed repair; historical mapping versions stay intact.

The three unsupported ffef rows concern `FW7-002`, `FW7-003`, `FW7-012`. Their source clauses are not interchangeable: `002` is the table's earlier-grade undirected variation clause, `003` is the by-end-of-class10 mutation/recombination clause, and `012` is class10 evolutionary interplay with selection. The extraction's shared `grades:5/6-9/10` must not hide this difference.

Existing `9f73b963` is visible in NI Sek I and is the nearest general concept, but is **not a clean replacement as-is**: it currently treats selection as a cause of genetic variation and requires the molecular ffef atom. The candidate corrects the causal roles (mutation/recombination generate genetic variants/combinations; selection acts on existing variation), and proposes a reviewed nonmolecular prerequisite route. This is an **additional open finding**, not a seventh completed D/P review.

The current `1d2b1038` simple meiosis/gamete goal genuinely supports only the **recombination basis** component (NI FW6.2 source `…fw6-008-d14910ea`, actual p.87). Its complete mitosis/meiosis scope is not fully required by every FW7 clause. Retain/use it as a **partial component** where the source really discusses meiotic recombination. `b8fc739d` supports simple dominant/recessive inheritance, not molecular mutation analysis. `4e12ba43` concerns birds/fish reproductive strategies and must not be relabelled as a general genetic-reproduction competency.

An independent review must choose a corrected/re-scoped `9f` or the proposed dedicated phenomenological variation atom (full bilingual inner profile supplied), prove each NI clause's coverage, and test its normal prerequisite frontier. Merely removing ffef from three mapping arrays or hiding it in a view does **not** finish that preservation work. No current mapping, extraction, canonical goal, source view or registry was changed here.
