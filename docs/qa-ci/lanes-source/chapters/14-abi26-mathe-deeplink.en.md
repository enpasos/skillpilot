## Abi 2026 Mathematics DeepLink MVP (BlueSky) {#sec:qal-abi26-deeplink}

This chapter specifies the URL contract, automatic Cockpit provisioning flow, campaign telemetry events, and QA test links for the Hessen 2026 Mathematics Abitur deep-link MVP.

### URL Contract and Cockpit Pre-Provisioning {#sec:qal-abi26-flow}

The landing route `/start/abi26-he-mathe-k1` accepts `source` / `utm_source`, `campaign` / `utm_campaign`, `medium` / `utm_medium`, and `track` / `courseLevel` / `f` (`GK` or `LK`, defaulting to `GK`):

```text
/start/abi26-he-mathe-k1?source=bluesky&campaign=abi26-mathe-k1&medium=social&track=GK
```

Clicking `Kostenlose SkillPilot-ID erstellen` executes four steps:

1. Creates a fresh pseudonymous SkillPilot ID (`POST /api/ui/learners`).
2. Configures the learner's curriculum for Hessen upper-secondary Mathematics (`PUT /api/ui/learners/{id}/curriculum`).
3. Sets the initial scope to `Abiturprüfung Mathematik` (`9ad83149-3cb7-5b87-a617-3eae3715a50c`) for `GK` or `Abiturprüfung Mathematik (LK)` (`464a6024-a2f8-53b4-84e0-d7b9df22a0b1`) for `LK`.
4. Opens the Cockpit carrying campaign parameters (`l` targeting `Gymnasium (DE)`, state filter `f = DE-HE`, and course level `GK` or `LK`).

### Campaign Events and QA Verification (3 Test Links) {#sec:qal-abi26-qa}

Campaign events are buffered client-side in `localStorage` (`skillpilot_campaign_events`) and posted to `POST /api/ui/events`: `page_view`, `id_created`, `cockpit_opened`, `gpt_prompt_copied`, and `gpt_start_clicked`.

Verify all three QA test links:

```text
1. GK:       /start/abi26-he-mathe-k1
               ?utm_source=bluesky&utm_campaign=abi26-he-mathe-k1
               &utm_medium=social&track=GK
2. LK:       /start/abi26-he-mathe-k1
               ?utm_source=bluesky&utm_campaign=abi26-he-mathe-k1
               &utm_medium=social&track=LK
3. Fallback: /start/abi26-he-mathe-k1
               ?source=bluesky&campaign=abi26-he-mathe-k1
               &medium=social&track=foo
```

Expected behavior: invalid `track=foo` visibly falls back to `GK`, pseudonymous ID creation succeeds without registration, the Cockpit opens with pre-selected scope and visible coach/GPT launch card, and the feedback notice is visible on both landing page and Cockpit.
