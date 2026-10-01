# Biologie Q1: targeted revision after the two independent D candidate rounds

Date: 2026-09-30. Scope: `8f6933b1-6e02-5512-acf2-a90a7fb9cb75`,
`ceb54223-197c-5289-a9c6-19358912e144`, and
`440854be-7f06-5678-91cb-ba8dcab56959` only. This is an AI-authored
revision audit and current candidate binding, not D synthesis, human approval,
or strict M7 closure.

## Source and review context

- The local official `kerncurriculum_gymnasiale_oberstufe-biologie.pdf`
  (`sha256:52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558`)
  places Q1.2 histone modification (methylation and acetylation) and RNA
  interference at elevated LK level, and Q1.3 analysis of monohybrid,
  autosomal/gonosomal, dominant/recessive family pedigrees at GK/LK level,
  on **printed page 39**. Genetic testing/counselling is a separate Q1.3
  item. The local source extraction contains more specific goal wording; it
  is not a verbatim quotation from the official PDF.
- The first-pass A and B record files are
  `round-a/results/biologie-m7-q1-three-revised-current-20260930-v1-first-pass-a.batch-001.records.jsonl`
  and
  `round-b/results/biologie-m7-q1-three-revised-current-20260930-v1-first-pass-b.batch-001.records.jsonl`.
  They independently reviewed the previous text. Their page-37 references,
  and the earlier image review's `printedPage: 37`, are historical candidate
  metadata. The official 2024-11 PDF places the same Q1.2/Q1.3 bullets on
  printed page 37; the locally bound 2025 update moves them to printed page
  39. Thus this is a source-version page shift, not evidence of an incorrect
  old citation. Historical records were not silently edited.
- The three exact active PNGs were inspected with their canonical links and
  German alt texts. Their source prompts and prior independent image reviews
  remain context; a drawing alone is not performance evidence. No PNG or alt
  text was changed.

## Decisions and current text

| Goal | A/B finding and decision | Current DE / EN description |
| --- | --- | --- |
| Histones `8f6933b1` | A kept the biological scope; B found `deren` / `their` could refer to the findings instead of the modifications. Accept B's narrow clarification. The image shows histone-tail marks and dense/open chromatin without assigning a universal effect to either mark. | **DE:** Die lernende Person kann vorgegebene Befunde zu Histonacetylierung und Histonmethylierung analysieren und mögliche Auswirkungen dieser Modifikationen auf Chromatinzugänglichkeit und Genaktivität im jeweiligen Kontext erläutern. **EN:** The learner can analyse supplied findings on histone acetylation and histone methylation and explain possible effects of these modifications on chromatin accessibility and gene activity in the given context. |
| RNAi `ceb54223` | Both rounds found `Expression einer Ziel-mRNA` / `expression of a target mRNA` ambiguous about the measured outcome. Accept A's minimal protein-production wording. B's additional explicit binding clause was not needed because matching is already stated and the example can show the mechanism. The image illustrates one siRNA/Ago2 cleavage path; that path is not required for every RNAi case. | **DE:** Die lernende Person kann an einem vorgegebenen Beispiel erklären, wie eine zur Ziel-mRNA passende kleine RNA durch RNA-Interferenz die Bildung des zugehörigen Proteins vermindern kann. **EN:** The learner can use a supplied example to explain how a small RNA matching a target mRNA can reduce production of the corresponding protein through RNA interference. |
| Pedigree `440854be` | A kept the German target. B found that English `monogenic trait` asserts a one-gene cause where the German and official source specify a monohybrid model. Accept B's English correction; German stays unchanged. The three-child image is a small illustrative family, not a unique real-world diagnosis. | **DE:** Die lernende Person kann einen Familienstammbaum zu einem monohybrid vererbten Merkmal analysieren, plausible autosomale oder gonosomale sowie dominante oder rezessive Erbgänge anhand der sichtbaren Verteilung begründen und Grenzen der Deutung benennen. **EN:** The learner can analyse a family pedigree for one inherited trait under a monohybrid model, justify plausible autosomal or sex-linked and dominant or recessive inheritance patterns from the visible distribution, and state the limits of that interpretation. |

## Exact current candidate bindings

| Goal prefix | New goal fingerprint | Active PNG SHA-256 | Binding disposition |
| --- | --- | --- | --- |
| `8f6933b1` | `sha256:93a8eeffc98043268e26f1db6636742824253d2bc970e50bcb07f89c9411cc91` | `sha256:669fbeccb84f2c1c472d9de886d84a363889bbacae0f46a7c9df4df3872e836e` | A/M fingerprints and V QA description rechecked; P profile rebound as AI candidate. |
| `ceb54223` | `sha256:3024d83019e02f97cebb38e450a9f54e72534e9cc5aaa300dc9078df7dbb9040` | `sha256:6408a703ecfc38d8cda9a2fb8c6f1aedf6b10ccd5e7cb0d025e9370035a54b5c` | A/M fingerprints and V QA description rechecked; P profile rebound as AI candidate. |
| `440854be` | `sha256:41217fdbfc25d4206e128bf5f19b25a4eedcce614abb8cbd4d45cef4f77088ff` | `sha256:cfd21c79f4c692ed54fc33499bff94ecc22cc9eb29a603559db361a1d8da0e52` | German V QA description stays current; A/M fingerprints changed because English changed; P profile rebound as AI candidate. |

The P profile bodies themselves did not need a substantive change: they
already distinguish histone marks from fixed activation, RNAi action on
mRNA from reduced protein production, and a single-trait pedigree model
from diagnosis. Their candidate metadata now cite printed page 39. P status
remains `needs_human_review` for all three. A/M records remain targeted AI
decisions; V image QA remains AI approved with `humanApproved: no`, and the
canonical resource links retain `reviewStatus: pilot`.

The three semantic-kind source fingerprints were also rebound to the exact
current goal text so that the current v2 D book can be built. All three
authoritative decisions remain `curricularAtomic`; no category or denominator
decision changed.

## Targeted verification and remaining gate

- The P candidate materializer verified all three current records, and
  `quality:positive-goal-evidence:check` reported 3 configured goals,
  0 approved, 3 needing human review, and 0 blocking issues.
- A targeted current-state assertion matched all three canonical texts to
  their A/M fingerprints and V QA descriptions. The SHA-256 of each public
  PNG matched its canonical PNG and V QA digest. No wider M7 status claim
  follows from these checks.
- The A/B D records have the **old** goal fingerprints and cannot be counted
  as independent reviews of the new text. A new current v2 book/review
  bundle and blind A/B inputs were prepared at
  `m7-q1-three-revised-current-20260930-v2/`, with the source-page correction
  in its `source-context.md`. Obtain two fresh independent D reviews of this
  bound context, adjudicate any findings, then update the D resolution/index
  and rerun the required central M7 report. Human P/V acceptance and any
  other strict M7 gates stay separate.
