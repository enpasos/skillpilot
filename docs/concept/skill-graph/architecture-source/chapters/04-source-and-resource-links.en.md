## Source and Resource Links {#sec:sga-source-resource-links}

SkillPilot enforces a strict inversion principle for external learning media: **"Content references the curriculum; the curriculum does not select providers."**

### Three-Way Purpose Split and Hard Canonical Prohibition {#sec:sga-srl-split}

| Mechanism | Carrier | Permitted Purpose & Constraints |
| --- | --- | --- |
| **Official curriculum provenance** | `sourceRef` and curriculum-typed `resourceLinks` (`type: "curriculum"`) | Trace canonical goals to official state/institutional syllabi, statutes, and page locators (@ref{sec:sga-source-rationales}). |
| **First-party goal visualizations** | `resourceLinks` with `type: "goal-visualization"` | Optional curated 16:9 concept illustrations owned and reviewed inside SkillPilot (@ref{sec:sga-goal-visualizations}). |
| **External learning materials** | Optional packages under `content/` (@ref{sec:sga-content-integration}) | Provider-specific textbooks, simulations, videos, and exercise collections referencing stable canonical `goalId`s from outside the core graph. |
{cols="24%,30%,46%"}

Normative rules:

- **No new external provider links on canonical goals:** Canonical `SkillLandscape` JSON files must not add third-party textbook, video, or practice-platform links in `resourceLinks`. Earlier practice-link migration work remains historical provenance evidence only and is never a model for re-attaching external providers to canonical nodes.
- **Privacy-safe plain URLs & honest coach boundary:** Any surfaced link must be a plain, tracking-free URL without learner or session identifiers. AI coaches may mention offered links as optional reading, but must **never** claim to have fetched or read external web pages they did not inspect.
