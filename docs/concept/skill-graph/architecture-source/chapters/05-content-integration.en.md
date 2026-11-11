## Content Integration: Architectural Framework {#sec:sga-content-integration}

This chapter establishes the binding v1.1 architectural framework (Product Owner decision of **21 September 2026**, GitHub Issue `#50`; PoC details in [Physik-Libre PoC](repo:docs/dev/content-integration-physik-libre-pilot.md), [PoC Operations](repo:docs/dev/content-integration-poc.md), and [Issue #54 Content Packages](repo:docs/dev/content-packages-issue-54.md)).

### Three-Layer Separation and Personal Selection {#sec:sga-ci-layers}

```text
Canonical Skill Graph (provider-neutral goalIds)
        ^
        |  referenced from outside via content/ packages
Optional Content-Link Packages (textbooks, simulations, tasks)
        ^
        |  activated per learner via ordinary SkillPilot ID
Personal Material Selection (Cockpit & Coach, default opt-in/off)
```

Core architectural invariants:

- **Provider-neutral canonical core:** Canonical landscapes never hardcode or privilege external textbook, video, or publisher URLs; content packages under `content/` point inward to stable canonical `goalId`s.
- **Ordinary SkillPilot-ID personalization:** Learners select or deselect optional content packages directly in their ordinary Cockpit profile without special activation keys, teacher accounts, or third-party logins.
- **Operational kill-switch & privacy:** Every external content package can be disabled centrally via an operational kill-switch without touching canonical landscapes or learner mastery. Outbound links remain plain, parameter-free URLs without SkillPilot IDs or tracking tokens; SkillPilot relicenses no third-party content.

### Physics Pilot and Four Acceptance Criteria {#sec:sga-ci-acceptance}

The initial reference pilot binds open-licensed physics textbook sections (`https://physikbuch.schule/`) after Physics `M7` stabilization and expands to Mathematics and LEIFIphysik under Issue `#54`. Every content-package integration is judged against four binding acceptance criteria:

| Criterion | Required Proof |
| --- | --- |
| **1. Unchanged core** | Disabling or removing all `content/` packages leaves canonical graphs, views, frontier logic, and mastery 100% intact. |
| **2. Personal selection** | Learners control package visibility through their ordinary SkillPilot profile without special keys or accounts. |
| **3. Concrete utility** | Active links resolve to goal-specific reading or practice sections and appear cleanly in Cockpit and Coach contexts without fabricated page summaries. |
| **4. General viability** | Adding a second provider or subject requires only a declarative `content/` package and validation pass, zero core schema changes. |
{cols="26%,74%"}
