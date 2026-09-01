import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const defaultRepositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const reviewFreezeRelativePath =
  "contracts/openai/skillpilot-coach-v1/review-freeze.json";

const expectedAuthorizedRuntimeExceptions = [
  {
    id: "2026-08-15-goal-book-public-promotion-off",
    approvedAt: "2026-08-15",
    approvedBy: "product-owner",
    reason:
      "Keep the incomplete learning-goal book discoverable only from the local Workbench.",
    scope:
      "Disable the public start-page link and remove the public sitemap entry; " +
      "retain the read-only route, assets, and local Workbench links for later reactivation.",
    target: "current-production-web-frontend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-no-submitted-plugin-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/components/SessionSetup.tsx",
      submittedSha256:
        "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      authorizedSha256:
        "3834b8c813719e21dffb767b9e5fe60890845769e188b49a239da57f4577b9a4",
    },
    additionalFile: {
      path: "app/public/sitemap.xml",
      submittedSha256:
        "bbe29194631db31a643773035aef2ee734f76e6f1188f669a5decdeaa2a140f0",
      authorizedSha256:
        "b1f26f19e72a5bf698c88289b502ffab669c0a330356e1549049d38437c60869",
    },
  },
  {
    id: "2026-08-23-claude-web-start-remove-manual-fallback",
    approvedAt: "2026-08-23",
    approvedBy: "product-owner",
    reason:
      "Remove the redundant Claude-only clipboard and manual start-prompt fallback after the q-prefilled Web launch.",
    scope:
      "Within the explicitly query-gated Claude provider controls, require the click-time popup, " +
      "navigate it only to the validated q-prefilled Claude Web URL, fail closed otherwise, and " +
      "remove clipboard, raw-prompt, copy, Web-fallback and Desktop-fallback UI; preserve the " +
      "default ChatGPT and submitted OpenAI launch behaviour.",
    target: "current-production-web-frontend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-query-gated-claude-only-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/components/SessionSetup.tsx",
      submittedSha256:
        "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      priorAuthorizedSha256:
        "3834b8c813719e21dffb767b9e5fe60890845769e188b49a239da57f4577b9a4",
      authorizedSha256:
        "fbab3a4833b534059a8b9ad2c97a293cb670d848d92bd93caac25ed9d96787ad",
    },
    evidenceFile: {
      path:
        "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-23-testClaudeV1StartUi.tsx",
      sha256:
        "f02ab916f7e501cb7b50eee477c5237c054caf36f90bee1c5cf1da075a82e8bf",
    },
  },
  {
    id: "2026-08-24-standard-dual-provider-web-start",
    approvedAt: "2026-08-24",
    approvedBy: "product-owner",
    reason:
      "Offer the independently isolated Claude v1 coach beside the unchanged ChatGPT v1 choice in the standard shared learner start.",
    scope:
      "On the standard root, always present the separately branded Claude v1 setup and start controls " +
      "beside the unchanged ChatGPT v1 start control, remove hidden provider-query gating, and replace " +
      "the ChatGPT-only landing account note with provider-neutral guidance linked to /faq/coach-setup; " +
      "preserve the submitted ChatGPT handler, prepared-message and session semantics, OpenAI package, " +
      "MCP/OAuth/tool/schema/UI contract, review cases, portal values, fixtures and review artifacts.",
    target: "current-production-web-frontend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-additive-provider-choice-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/components/SessionSetup.tsx",
      submittedSha256:
        "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      priorAuthorizedSha256:
        "fbab3a4833b534059a8b9ad2c97a293cb670d848d92bd93caac25ed9d96787ad",
      authorizedSha256:
        "1919c46dfe9e1f70ecdf177f2dd48654400c9eb8debd47ddaf0576d9e4fdd61f",
    },
    evidenceFile: {
      path:
        "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-24-testClaudeV1StartUi.tsx",
      sha256:
        "60ac516f664da7a61c7ce2a53ad2736adc7ae7d67fb10391c549b073b331a5e4",
    },
    additionalFile: {
      path:
        "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-24-claudeCoach.ts",
      priorSha256:
        "817c855aeca7406cd923dc7ce56538c2b8f67ec90b7750b064b873f1976a539d",
      authorizedSha256:
        "fc451b8780889e45fe7a848353e1415d52d4eb1b6a7f8ed35b266a4dd5d512f0",
    },
  },
  {
    id: "2026-08-25-claude-direct-plugin-guided-start",
    approvedAt: "2026-08-25",
    approvedBy: "product-owner",
    reason:
      "Replace the obsolete learner-facing manual Connector setup with the approved guided Claude Pro direct-plugin beta path.",
    scope:
      "Within the separately branded Claude v1 controls, guide learners to the first-party /plugins download " +
      "and Claude Web upload, remove the fake browser-local connection status and reset action, and launch " +
      "the validated q-prefilled Claude Web session directly; preserve the submitted ChatGPT handler, " +
      "prepared-message and session semantics, OpenAI package, MCP/OAuth/tool/schema/UI contract, review " +
      "cases, portal values, fixtures and review artifacts.",
    target: "current-production-web-frontend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-claude-only-guided-direct-plugin-setup-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/components/SessionSetup.tsx",
      submittedSha256:
        "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      priorAuthorizedSha256:
        "1919c46dfe9e1f70ecdf177f2dd48654400c9eb8debd47ddaf0576d9e4fdd61f",
      authorizedSha256:
        "b56c60fbdf44021c92c9477602207409911ef1049d5a313cc99702f9424e9031",
    },
    evidenceFile: {
      path: "app/scripts/testClaudeV1StartUi.tsx",
      sha256:
        "5e833c8525919254db82e3e6d127c00911ec4a8d10408f8216a51d109f66fc8f",
    },
    additionalFile: {
      path: "app/src/utils/claudeCoach.ts",
      priorSha256:
        "fc451b8780889e45fe7a848353e1415d52d4eb1b6a7f8ed35b266a4dd5d512f0",
      authorizedSha256:
        "ac57943f16a0cd7cb1c6ce4fd9665821abfd8c3c586877713221cc6220456030",
    },
  },
  {
    id: "2026-08-26-goal-book-public-start-link-on",
    approvedAt: "2026-08-26",
    approvedBy: "product-owner",
    reason:
      "Make the existing read-only mathematics and physics learning-goal books directly discoverable from the public SkillPilot start page.",
    scope:
      "Enable only the existing localized start-page link to /lernzielbuch outside package-consumer builds and update focused regression evidence; " +
      "retain the existing read-only route and artifacts, keep the public sitemap unchanged, and preserve every coach launch, session, learner-state, " +
      "OpenAI package, MCP/OAuth/tool/schema/UI, review-case, portal, fixture, and review-artifact contract.",
    target: "current-production-web-frontend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-read-only-navigation-link-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/components/SessionSetup.tsx",
      submittedSha256:
        "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      priorAuthorizedSha256:
        "b56c60fbdf44021c92c9477602207409911ef1049d5a313cc99702f9424e9031",
      authorizedSha256:
        "71c1d46f9eb42ab9a1d643df44e65fb35a89ece2b0a901f9ea045b64c56aae84",
    },
    evidenceFile: {
      path: "app/src/views/WorkbenchView.test.ts",
      sha256:
        "97e2c090d00859dd0389dbccdfe226b187293bcbac6d0ada1cddd4ae313a59d6",
    },
    additionalFile: {
      path: "app/scripts/testSessionSetupCompletionUi.ts",
      priorSha256:
        "561a7e7432882a6f0041f791bbd2d4b2d80b6c356ed9bc9b3471524564e98b29",
      authorizedSha256:
        "afb66331e9bf1707195b1389d28bfe09839a9c3a130800bc207d6ed9602426fe",
    },
  },
  {
    id: "2026-08-27-public-overview-entry",
    approvedAt: "2026-08-27",
    approvedBy: "product-owner",
    reason:
      "Unify the public SkillPilot concept navigation by replacing the standalone root audio topic and separate concept link with one localized overview entry.",
    scope:
      "In the current production WebGUI only, replace the standalone root audio topic and separate concept link with one localized overview card containing exactly three actions and no neutral overview link: " +
      "Audio and Video target their existing anchors with a one-time play intent, Whitepaper targets its existing anchor directly, and a neutral /whitepaper/:lang request never autoplays media; " +
      "preserve every coach handler, prepared message, session, learner-state, " +
      "OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, review-case, portal, fixture, and review-artifact contract.",
    target: "current-production-web-frontend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-public-information-navigation-only-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/components/SessionSetup.tsx",
      submittedSha256:
        "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      priorAuthorizedSha256:
        "71c1d46f9eb42ab9a1d643df44e65fb35a89ece2b0a901f9ea045b64c56aae84",
      authorizedSha256:
        "df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140",
    },
    evidenceFile: {
      path:
        "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-27-testPublicOverviewUi.tsx",
      sha256:
        "69b029ea922aea40ddddac6630fe04e89ace84e135d16586d5305ed34cbd1fb3",
    },
  },
  {
    id: "2026-08-28-public-overview-vision-mission-disclosure",
    approvedAt: "2026-08-28",
    approvedBy: "product-owner",
    reason:
      "Make SkillPilot's vision, human responsibility for its knowledge landscapes, and educator-facing learning-progress insight immediately understandable in the existing public overview card.",
    scope:
      "In the current production WebGUI only, supersede the 2026-08-27 overview card's exactly-three-interactive-actions boundary by retaining exactly three direct media actions and adding exactly one initially closed, keyboard-operable inline Vision & Mission disclosure button and same-card panel with the approved German and English copy; " +
      "preserve every media route and play intent, the page order with learner start first, the byte-identical SessionSetup, every coach handler, prepared message, session, learner-state, " +
      "OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, review-case, portal, fixture, and review-artifact contract.",
    target: "current-production-web-frontend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-inline-public-information-disclosure-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/components/SessionSetup.tsx",
      submittedSha256:
        "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      priorAuthorizedSha256:
        "df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140",
      authorizedSha256:
        "df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140",
    },
    evidenceFile: {
      path:
        "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-28-testPublicOverviewUi.tsx",
      sha256:
        "45fbf9051fd2cf143cdb7414f0434ad4dc82471d9728689d620454d218c7f72c",
    },
    additionalFiles: [
      {
        path:
          "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-28-SkillPilotOverviewCard.tsx",
        priorSha256:
          "1a2c27f60320b1296e32f20bae7af3adbf7625762c52ea1dfb5d2cd5a20df420",
        authorizedSha256:
          "0b6c7539cb55d02f78198f3a50fcd8a95ac9b0c6bd0f8d5fa8d486352e2f75b3",
      },
      {
        path:
          "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-28-skillPilotOverviewCopy.ts",
        priorSha256:
          "537e128921b534c8abdd71d4bdc5dc8afda63b865da2598fdcde9957e57d56cb",
        authorizedSha256:
          "f2192dfabe8d2f00ca6f2bad01c0e65b5982dcd68aba426b10e9c4a59c43ec01",
      },
    ],
  },
  {
    id: "2026-08-28-public-overview-factual-closed-state",
    approvedAt: "2026-08-28",
    approvedBy: "product-owner",
    reason:
      "Keep the closed public overview factual and lightweight while retaining the full Vision & Mission on demand and clearly distinguishing the long-term goal from the current product scope.",
    scope:
      "In the current production WebGUI only, refine the 2026-08-28 Vision & Mission disclosure by restoring the factual localized closed subtitle and removing the immediately visible compact Vision/Mission copy; " +
      "place the existing constant-label disclosure control in the same wrapping action row as exactly three unchanged media actions, add the approved localized long-term-goal clarification to the opened panel, and render the complete German and English Vision/Mission text in a responsive two-column layout from approximately 850 pixels; " +
      "preserve every media route and play intent, the page order with learner start first, the byte-identical SessionSetup, every coach handler, prepared message, session, learner-state, " +
      "OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, review-case, portal, fixture, and review-artifact contract.",
    target: "current-production-web-frontend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-public-information-copy-and-layout-only-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/components/SessionSetup.tsx",
      submittedSha256:
        "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      priorAuthorizedSha256:
        "df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140",
      authorizedSha256:
        "df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140",
    },
    evidenceFile: {
      path:
        "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-28-factual-overview-testPublicOverviewUi.tsx",
      sha256:
        "f4911b536c399516bee60b66abbeca9578a8d01ac540d8b534abb4b2858b1b7d",
    },
    additionalFiles: [
      {
        path:
          "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-28-factual-overview-SkillPilotOverviewCard.tsx",
        priorSha256:
          "0b6c7539cb55d02f78198f3a50fcd8a95ac9b0c6bd0f8d5fa8d486352e2f75b3",
        authorizedSha256:
          "8495949581cbd3c9efcfe5b7decb49ca3e32f0e881435be946cd0c7170ee7c54",
      },
      {
        path: "app/src/utils/skillPilotOverviewCopy.ts",
        priorSha256:
          "f2192dfabe8d2f00ca6f2bad01c0e65b5982dcd68aba426b10e9c4a59c43ec01",
        authorizedSha256:
          "8698f3c9bfb995dab191cd2e317e4fc80f566ec4e449e0dc4152bcc5e34eef4d",
      },
    ],
  },
  {
    id: "2026-08-28-public-overview-single-green-frame",
    approvedAt: "2026-08-28",
    approvedBy: "product-owner",
    reason:
      "Remove the redundant purple double frame from the public overview card while preserving a clear, restrained card interaction state and the focus indication of each individual control.",
    scope:
      "In the current production WebGUI only, change the existing overview card interaction styling so hover or focus within uses exactly one 1-pixel green card border with no outer card-level ring, ring offset, or double line, while retaining the focus-visible rings on all three media links and the Vision & Mission disclosure; " +
      "preserve every German and English copy, layout, action, route, media play intent, the page order with learner start first, the byte-identical SessionSetup, every coach handler, prepared message, session, learner-state, " +
      "OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, review-case, portal, fixture, and review-artifact contract.",
    target: "current-production-web-frontend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-public-interaction-focus-styling-only-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/components/SessionSetup.tsx",
      submittedSha256:
        "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      priorAuthorizedSha256:
        "df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140",
      authorizedSha256:
        "df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140",
    },
    evidenceFile: {
      path:
        "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-28-single-green-frame-testPublicOverviewUi.tsx",
      sha256:
        "0097c3418e3a310907f4d82edd380399b15571225b603d73d73269a21191838f",
    },
    additionalFile: {
      path:
        "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-28-single-green-frame-SkillPilotOverviewCard.tsx",
      priorSha256:
        "8495949581cbd3c9efcfe5b7decb49ca3e32f0e881435be946cd0c7170ee7c54",
      authorizedSha256:
        "b55844133b156287db7a763e52fc225505435f975438d5651bccaf6692ca2a90",
    },
  },
  {
    id: "2026-08-28-public-overview-adjacent-vision-mission-pill",
    approvedAt: "2026-08-28",
    approvedBy: "product-owner",
    reason:
      "Present Vision & Mission as the fourth peer overview action instead of a visually separate trailing link.",
    scope:
      "In the current production WebGUI only, place the existing Vision & Mission disclosure fourth immediately after Whitepaper in one semantic action list labelled by the localized card heading; " +
      "render it as an adjacent pill with a leading Compass, constant visible label, and trailing state chevron that rotates upward while open and downward when closed, make its closed appearance match the three media pills and its open appearance green, and remove the freestanding purple link, automatic right alignment, and underline presentation; " +
      "preserve every German and English text, media route and play intent, disclosure state and panel layout, single green card interaction frame, the page order with learner start first, the byte-identical SessionSetup, every coach handler, prepared message, session, learner-state, " +
      "OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, review-case, portal, fixture, and review-artifact contract.",
    target: "current-production-web-frontend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-public-information-action-styling-only-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/components/SessionSetup.tsx",
      submittedSha256:
        "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      priorAuthorizedSha256:
        "df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140",
      authorizedSha256:
        "df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140",
    },
    evidenceFile: {
      path:
        "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-29-adjacent-vision-mission-pill-testPublicOverviewUi.tsx",
      sha256:
        "f85a72c8440d1b315664ce912fbd6ced1bdfdf4156d02d7afff5d47cc26c83b2",
    },
    additionalFile: {
      path:
        "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-29-adjacent-vision-mission-pill-SkillPilotOverviewCard.tsx",
      priorSha256:
        "b55844133b156287db7a763e52fc225505435f975438d5651bccaf6692ca2a90",
      authorizedSha256:
        "d7408c72ba5a98791a54c586a08b6be320a1ab059efb723fd627351312d255eb",
    },
  },
  {
    id: "2026-08-29-public-overview-green-interaction-heading",
    approvedAt: "2026-08-29",
    approvedBy: "product-owner",
    reason:
      "Align the public overview heading with the card's approved green interaction state instead of changing it to purple.",
    scope:
      "In the current production WebGUI only, change the public overview card heading on hover and focus-within to the established accessible green interaction colors emerald-700 in light mode and emerald-300 in dark mode; " +
      "preserve every German and English text, layout, action, route, media play intent, disclosure behavior, action-pill style, single green card interaction frame, the page order with learner start first, the byte-identical SessionSetup, every coach handler, prepared message, session, learner-state, " +
      "OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, review-case, portal, fixture, and review-artifact contract.",
    target: "current-production-web-frontend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-public-interaction-color-styling-only-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/components/SessionSetup.tsx",
      submittedSha256:
        "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      priorAuthorizedSha256:
        "df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140",
      authorizedSha256:
        "df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140",
    },
    evidenceFile: {
      path: "app/scripts/testPublicOverviewUi.tsx",
      sha256:
        "fe66f2148c198663aa671ce1a1eea4ccdf57b23bfdb4f20287c0c42a832ef757",
    },
    additionalFile: {
      path: "app/src/components/SkillPilotOverviewCard.tsx",
      priorSha256:
        "d7408c72ba5a98791a54c586a08b6be320a1ab059efb723fd627351312d255eb",
      authorizedSha256:
        "16329baefd5fbbf5d733253508a57661c67e0ba5d49583f6cec119fe5695a77a",
    },
  },
  {
    id: "2026-08-29-retire-obsolete-gymnasium-runtime-cutover",
    approvedAt: "2026-08-29",
    approvedBy: "product-owner",
    reason:
      "Remove the obsolete Gymnasium legacy learner cutover runtime because no real legacy learners require it.",
    scope:
      "Remove only the UsersView bulk operator, LearnerView single cutover and per-learner archive/retirement UI, " +
      "their frontend helpers and package-consumer aliases, backend endpoints, DTOs and service paths, and exclusively " +
      "related tests and copy; preserve canonical curricula, retained source and archive registries, mapping, provenance, " +
      "compatibility-summary and topic-summary lanes, current personalization migration, ChatGPT/MCP/OAuth/tools/schemas, " +
      "review fixtures, and learner-state semantics for supported current curricula.",
    target: "current-production-web-frontend-and-backend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-obsolete-legacy-runtime-removal-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/views/LearnerView.tsx",
      submittedSha256:
        "ec694882cdc5c9eb7e635723715a719f9588b0f2f06f8c57c579f060f7540ed7",
      authorizedSha256:
        "d579e459e6450cc6891971bab3a65621a3409a0c5d16ae9c22ce67b24956e0e6",
    },
    evidenceFile: {
      path:
        "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-29-pre-runtime-cutover-cleanup-LearnerView.tsx",
      sha256:
        "ec694882cdc5c9eb7e635723715a719f9588b0f2f06f8c57c579f060f7540ed7",
    },
  },
  {
    id: "2026-08-30-goal-feedback-default-off-config",
    approvedAt: "2026-08-30",
    approvedBy: "product-owner",
    reason:
      "Add isolated, default-off production configuration for the learning-goal feedback inbox and its operator-only custody handoff.",
    scope:
      "Add only the skillpilot.goal-feedback subtree under the existing public base URL, with a false-by-default enable flag, a dedicated operator token, bounded public rate settings, and bounded inbox row/byte settings; " +
      "preserve every existing application property and every submitted ChatGPT/MCP/OAuth/tool/schema/UI/session/review contract.",
    target: "current-production-web-backend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-additive-default-off-layer-a-feedback-config-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "backend/src/main/resources/application.yml",
      submittedSha256:
        "15b120a2799148b10f9963fcae6fc998d4f1356b13489be9b6dc89c59161f591",
      authorizedSha256:
        "83df7973dc6bea7457d8398b55a600b5de2a4349dd32dd6faccef37a488b2990",
    },
    evidenceFile: {
      path:
        "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-30-pre-goal-feedback-activation-GoalFeedbackProductionHandoffIntegrationTest.java",
      sha256:
        "ff053be447e56015dd595b67e3a4cfa2cad7eb2875c42b51c224f6f3f0f0a9dc",
    },
  },
  {
    id: "2026-08-30-spring-boot-4-1-1-patch",
    approvedAt: "2026-08-30",
    approvedBy: "product-owner",
    reason:
      "Update the production backend from Spring Boot 4.1.0 to the compatible 4.1.1 maintenance release.",
    scope:
      "Change only the org.springframework.boot Gradle plugin version from 4.1.0 to 4.1.1; preserve Java, Gradle, Spring AI, source code, configuration and every submitted ChatGPT/MCP/OAuth/tool/schema/UI/session/review contract.",
    target: "current-production-web-backend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-backend-maintenance-patch-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "backend/src/main/resources/application.yml",
      submittedSha256:
        "15b120a2799148b10f9963fcae6fc998d4f1356b13489be9b6dc89c59161f591",
      priorAuthorizedSha256:
        "83df7973dc6bea7457d8398b55a600b5de2a4349dd32dd6faccef37a488b2990",
      authorizedSha256:
        "83df7973dc6bea7457d8398b55a600b5de2a4349dd32dd6faccef37a488b2990",
    },
    evidenceFile: {
      path:
        "backend/src/test/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV1PublicContractValidationTest.java",
      sha256:
        "e401636ab978d8a97b168e8e5bc606b4594e7a21ccae284064f2590a66c158bf",
    },
    additionalFile: {
      path: "backend/build.gradle.kts",
      priorSha256:
        "fcde2e8108d36e58a35f015a274efe5ad361465bafc2296789ea374dd246dec1",
      authorizedSha256:
        "b400ce01f36f653b96271e4f430f97f5595c7617c48132bdf76bcd9630d9a7f0",
    },
  },
  {
    id: "2026-08-30-goal-feedback-production-activation-safety",
    approvedAt: "2026-08-30",
    approvedBy: "product-owner",
    reason:
      "Bring the isolated learning-goal feedback channel to life with auditable notice binding, bounded retention, safe production-to-local custody transfer, and content-free terminal receipts.",
    scope:
      "Change only the independently isolated learning-goal feedback WebGUI, public feedback envelope and schema, feedback persistence/export/retention implementation, feedback-specific tests and operator documentation; " +
      "keep application.yml byte-identical and preserve every submitted ChatGPT/MCP/OAuth/tool/schema/UI/session/state/review contract.",
    target: "current-production-learning-goal-feedback-channel",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-independent-layer-a-feedback-activation-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "backend/src/main/resources/application.yml",
      submittedSha256:
        "15b120a2799148b10f9963fcae6fc998d4f1356b13489be9b6dc89c59161f591",
      priorAuthorizedSha256:
        "83df7973dc6bea7457d8398b55a600b5de2a4349dd32dd6faccef37a488b2990",
      authorizedSha256:
        "83df7973dc6bea7457d8398b55a600b5de2a4349dd32dd6faccef37a488b2990",
    },
    evidenceFile: {
      path:
        "backend/src/test/java/com/skillpilot/backend/goalfeedback/GoalFeedbackProductionHandoffIntegrationTest.java",
      sha256:
        "7c6eaba09fe95aa4334b31d9f5a19b65b4d6655926573a0679db75c4fd87159d",
    },
  },
  {
    id: "2026-08-31-learner-cockpit-goal-feedback-entry",
    approvedAt: "2026-08-31",
    approvedBy: "product-owner",
    reason:
      "Let learners report a weakness noticed while learning directly from the visible Cockpit goal through the existing, fully version-bound learning-goal feedback flow.",
    scope:
      "In the current production WebGUI and isolated learning-goal feedback channel only, add one localized learner-only action for the visible published curricular-atomic mathematics or physics goal; " +
      "resolve its current binding only after a deliberate click through a no-store, rate-limited bookId-plus-goalId lookup against the verified current publication, then navigate to the unchanged exact seven-field /lernziel-feedback route; " +
      "share the canonical link builder with the learning-goal book, fail with a retryable inline message, suppress duplicate clicks, and add feedback-specific tests; never transmit a SkillPilot, learner, session, chat, mastery, personalization or role identifier, never mutate learner state, never expose the action in trainer, explorer or package-consumer surfaces, " +
      "and preserve every coach handler, prepared message, session/state/identity/personalization, OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, review-case, portal, fixture, and review-artifact contract.",
    target: "current-production-web-frontend-and-learning-goal-feedback-channel",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-learner-only-entry-into-independent-layer-a-feedback-flow-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/views/LearnerView.tsx",
      submittedSha256:
        "ec694882cdc5c9eb7e635723715a719f9588b0f2f06f8c57c579f060f7540ed7",
      priorAuthorizedSha256:
        "d579e459e6450cc6891971bab3a65621a3409a0c5d16ae9c22ce67b24956e0e6",
      authorizedSha256:
        "f590240f9be5366032e081f39e9ad5617e7b3f9183ecb1291c3ab5af84416258",
    },
    evidenceFile: {
      path: "app/scripts/testLearnerGoalFeedbackUi.ts",
      priorSha256:
        "c0ddf7aaa3c36dd66c8f7993f2431c388fc1cf3fd2f005056e98bb6a8ef35ed5",
      sha256:
        "7f3226c358320b32d3fe4d13f2b23479b70c2473e7dd6a838859604d68a08148",
    },
    additionalFiles: [
      {
        path: "app/src/components/LearnerGoalFeedbackAction.tsx",
        priorSha256:
          "b128ce146a555100f407996d24abbaaaafb76428bcd04377435551dbd75b9e15",
        authorizedSha256:
          "8ee652562c7433c71d545a5205dfd14adaa9bc777fec9e48e6886819012f9832",
      },
      {
        path: "app/src/utils/goalBookFeedback.ts",
        priorSha256:
          "10a461427a5b77aa7e0605d0a7dd803b0c9d301676d1fb70d189370bb65d9890",
        authorizedSha256:
          "94c9ffc088c85a6925391dd8e96f0134a78ec36ef4da30cee88ae34183e1eee7",
      },
      {
        path: "app/src/views/GoalBookView.tsx",
        priorSha256:
          "8682601cb2a443edae698c00f04a9df5b363a706970c580b0ca5c7c362c38c1e",
        authorizedSha256:
          "e3ead51b2eca0e1b6674b60873f0f01536ce9e878bf7a15b82ecd3d701f4fa4e",
      },
      {
        path: "app/vite.config.ts",
        priorSha256:
          "87f095cf696cdb2c468257b837b3af61ec5c3c297c21d4e014f884f7903f84cd",
        authorizedSha256:
          "9c2f36efbd6755554b2ae2aeb5db0ec076e9a28cf3152b96e61ab99fc16735c7",
      },
      {
        path: "app/src/packageConsumer/learnerGoalFeedbackUnavailable.tsx",
        authorizedSha256:
          "baacb7c10a30ad3d5f01d0ac1d4d8d2185ab7c73ca22d6bb0dce2a36b4fc32da",
      },
      {
        path: "app/scripts/fixtures/learnerGoalFeedbackUi.html",
        authorizedSha256:
          "e7a99fcb3f0266a428682abaa2c6ddfa4443a0a20c57672a4055d56a99674f9d",
      },
      {
        path: "app/scripts/fixtures/learnerGoalFeedbackUi.tsx",
        priorSha256:
          "0332fad29d6eddc285943e0c3ed79de74c9c3b1ea69103433023d43bc5f11f3b",
        authorizedSha256:
          "876237cc4c1ce8c4c23ffe13e38a10c434558d0774dd8f0646ca0f7b37ed11f7",
      },
      {
        path: "backend/src/main/java/com/skillpilot/backend/goalfeedback/GoalFeedbackPublicController.java",
        priorSha256:
          "8ffe70fc8688fa7cd42e20053ee6f7ce95a711191d43e0a3026a0947be22e961",
        authorizedSha256:
          "9f8dee900851026f67accb94507b22574b6c147b8f878f65ddc82a7211ebf18e",
      },
      {
        path: "backend/src/main/java/com/skillpilot/backend/goalfeedback/GoalFeedbackPublicProtectionFilter.java",
        priorSha256:
          "b76a1c55cd9790e2e7cdbb0dcc8c1772e9206cee2317ae708e65865293316587",
        authorizedSha256:
          "86f6fe8874904af51b53a389cb5c833ed01f37d079fed20b03e5786c1dd2bcac",
      },
      {
        path: "backend/src/main/java/com/skillpilot/backend/goalfeedback/GoalFeedbackPublicationRegistry.java",
        priorSha256:
          "39270e4997fc06444ed7a716ca3cc82290579d7723c05e6816cd5cb3fab485da",
        authorizedSha256:
          "2f5b6a124a6b4600b8e2876d09b898ed93a65a159f5bc0d881f17f3a94e01b11",
      },
    ],
  },
  {
    id: "2026-08-31-cockpit-goal-feedback-return-navigation",
    approvedAt: "2026-08-31",
    approvedBy: "product-owner",
    reason:
      "Return learning-goal feedback entered from the learner Cockpit to the exact Cockpit goal instead of the learning-goal book.",
    scope:
      "In the current production WebGUI only, pass one exact browser-local Router origin marker when entering the unchanged seven-field /lernziel-feedback route from the learner Cockpit; " +
      "accept only that one-key marker, derive the return target exclusively from the validated feedback binding and static book publication registry, keep the contextual return link across hard reload and successful submission without automatic navigation, and preserve the existing exact learning-goal-book return for book, PDF and direct entries; " +
      "never accept an arbitrary return URL or extra query parameter, never transmit the marker to the backend or with the feedback submission, and preserve every backend, coach handler, prepared message, session/state/identity/personalization, OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, review-case, portal, OpenAI-review-fixture, and review-artifact contract.",
    target:
      "current-production-web-frontend-learning-goal-feedback-return-navigation",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-browser-local-feedback-return-navigation-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/views/LearnerView.tsx",
      submittedSha256:
        "ec694882cdc5c9eb7e635723715a719f9588b0f2f06f8c57c579f060f7540ed7",
      priorAuthorizedSha256:
        "f590240f9be5366032e081f39e9ad5617e7b3f9183ecb1291c3ab5af84416258",
      authorizedSha256:
        "f590240f9be5366032e081f39e9ad5617e7b3f9183ecb1291c3ab5af84416258",
    },
    evidenceFile: {
      path: "app/scripts/testGoalBookFeedbackUi.ts",
      priorSha256:
        "2b0f5b58960a552de1fec27be029703ea36e67c7760e9fd9257b44057021ffce",
      sha256:
        "ab3b57db6469cef0d9f7473b90f55690ee1e048c899e8dd90348ebc40481fffc",
    },
    additionalFiles: [
      {
        path: "app/src/components/LearnerGoalFeedbackAction.tsx",
        priorSha256:
          "b128ce146a555100f407996d24abbaaaafb76428bcd04377435551dbd75b9e15",
        authorizedSha256:
          "8ee652562c7433c71d545a5205dfd14adaa9bc777fec9e48e6886819012f9832",
      },
      {
        path: "app/src/utils/goalFeedbackReturnNavigation.ts",
        authorizedSha256:
          "b4dc8797b1100c0b52f33875ce9f459ab2ac4e1c767dce0879de1e77741f7a7c",
      },
      {
        path: "app/src/views/GoalBookFeedbackPilotView.tsx",
        priorSha256:
          "946ecd1ebce142f766081a484ce5b0baaaa67ff5030208b82d2bba5a1a45cc12",
        authorizedSha256:
          "78444751bb17278f53dad1022a05facd8546d9ca61fa7fe2faafd73e62e05d1c",
      },
      {
        path: "app/src/utils/goalBookFeedback.test.ts",
        priorSha256:
          "bf9d80b60edbb27402b0ca992de94c1cfb177a57f0fc0a4598396b58db5bcc0c",
        authorizedSha256:
          "76a3e589539fe12c87a2847b86145bbc70e2f6788696edc0b9730081526b2985",
      },
      {
        path: "app/scripts/fixtures/learnerGoalFeedbackUi.tsx",
        priorSha256:
          "0332fad29d6eddc285943e0c3ed79de74c9c3b1ea69103433023d43bc5f11f3b",
        authorizedSha256:
          "876237cc4c1ce8c4c23ffe13e38a10c434558d0774dd8f0646ca0f7b37ed11f7",
      },
      {
        path: "app/scripts/testLearnerGoalFeedbackUi.ts",
        priorSha256:
          "c0ddf7aaa3c36dd66c8f7993f2431c388fc1cf3fd2f005056e98bb6a8ef35ed5",
        authorizedSha256:
          "7f3226c358320b32d3fe4d13f2b23479b70c2473e7dd6a838859604d68a08148",
      },
    ],
  },
  {
    id: "2026-08-31-existing-learner-teacher-supervision-activation",
    approvedAt: "2026-08-31",
    approvedBy: "product-owner",
    reason:
      "Let a teacher create one read-only class from one known existing SkillPilot ID while the learner keeps ownership of all approved subject personalizations and learning state.",
    scope:
      "In the current first-party WebGUI and backend only, activate the existing-learner supervision flow with a seven-day one-time invitation, explicit matching-learner approval, one opaque teacher membership spanning the approved subject projections, read-only membership-bound mastery access, local-only learner alias, explicit personalization refresh, revocation and course closure; " +
      "add fail-closed reload recovery, response binding, same-site and size protection, bounded rate limits, terminal-record cleanup, the /betreuung SPA entry, focused CI and package-consumer disablement; never expose the permanent SkillPilot ID or raw personalization document to the teacher, never permit teacher-side learner-state writes, and preserve every submitted OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, coach, session, review-case, portal, fixture and review-artifact contract.",
    target: "current-production-first-party-web-frontend-and-backend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-independent-first-party-teacher-supervision-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "backend/src/main/resources/application.yml",
      submittedSha256:
        "15b120a2799148b10f9963fcae6fc998d4f1356b13489be9b6dc89c59161f591",
      priorAuthorizedSha256:
        "83df7973dc6bea7457d8398b55a600b5de2a4349dd32dd6faccef37a488b2990",
      authorizedSha256:
        "7377e3aa197f1156c3ca425b57ff08bde430a451ba1b5f0b27bc1359743c616f",
    },
    evidenceFile: {
      path: "app/scripts/testTeacherSupervisionTrainerUi.ts",
      sha256:
        "5b78c3ef9e337eecc2050e71a1528581f0c89439e1182576dab18b2d7a7b007c",
    },
    additionalFiles: [
      {
        path: ".github/workflows/ci.yml",
        authorizedSha256:
          "7a3f99c29ae88eaef78e86422be940359aaf46839ea3969418e4455f27b412c2",
      },
      {
        path: "app/.env",
        authorizedSha256:
          "8bee290c0e575c1c43d0309b40eae4a54433227572feea15d5c769c41b3d4dcd",
      },
      {
        path: "app/.env.production",
        authorizedSha256:
          "e12c251a3f7aa563748a4cf077f695a314e6e8a8508446fb4e55e1760fc263b5",
      },
      {
        path: "app/.env.package-consumer",
        authorizedSha256:
          "c51d20d7477657ba1894d762915006c8ad94d42d5a3412a51f1e67364459db8a",
      },
      {
        path: "app/scripts/fixtures/teacherSupervisionClassSetupUi.tsx",
        authorizedSha256:
          "dddb26242831f3206ea614b1f8af1876268f3dd748aea96945af8a43663db9af",
      },
      {
        path: "app/scripts/fixtures/teacherSupervisionTrainerUi.html",
        authorizedSha256:
          "24f5a00f9513a5b92bc2ab3280efac829d16ec243a2eaddc57ec68bbec88a755",
      },
      {
        path: "app/scripts/fixtures/teacherSupervisionTrainerUi.tsx",
        authorizedSha256:
          "a0ee4702182ff6c145c02e1840c78a40304b1b3e3c6e3ed9c49142adaebf3345",
      },
      {
        path: "app/scripts/testTeacherSupervisionClassSetupUi.ts",
        authorizedSha256:
          "e15d8901b948013a8ae3ab40798c81df4062854b42106988324940db11d20b63",
      },
      {
        path: "app/scripts/testTeacherSupervisionUi.ts",
        authorizedSha256:
          "034bc3082a40ab3d5b2ade8ded89d4a00d955aa60f4eaa8613e412f8acb0418d",
      },
      {
        path: "app/src/components/ClassSetup.tsx",
        authorizedSha256:
          "f4fd8c1e65b88f23cb806b36461e5fc735e1fcfae5f524bc76223e85fc18488d",
      },
      {
        path: "app/src/utils/teacherSupervision.test.ts",
        authorizedSha256:
          "afe163aac7404723c72e8f22f425a6366d02264edd5094cdb788ded740d48527",
      },
      {
        path: "app/src/utils/teacherSupervision.ts",
        authorizedSha256:
          "59885c733af39e251b7fe2456b22046cf41df493dc0d2a3e2bbf00c16ece5ae0",
      },
      {
        path: "app/src/utils/teacherSupervisionCopy.ts",
        authorizedSha256:
          "db27d3a6798524bc72a8391747109b4a87de2efb283515f7486e4408aa2f016d",
      },
      {
        path: "app/src/views/TrainerView.tsx",
        authorizedSha256:
          "1d2162e65072870f42a9edf355b1e8082e2c1349dce6b6da2c7578bcab16ec30",
      },
      {
        path: "app/src/vite-env.d.ts",
        authorizedSha256:
          "8e4c11c122e2c5cafd45d33bc2895c6e3e53b21560e71b3589795fb85d2d04ef",
      },
      {
        path: "backend/src/main/java/com/skillpilot/backend/config/RequestLoggingFilter.java",
        authorizedSha256:
          "c2a49b601b864e42b298afab975b19654c07cbb94a94c1dd870b96126c421dd5",
      },
      {
        path: "backend/src/main/java/com/skillpilot/backend/controller/SpaController.java",
        authorizedSha256:
          "b78716065ce0fa10dccaddbd1a18b6dda8aa13feb1b16d158a55ebf6a9bfa0b9",
      },
      {
        path: "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherSupervisionProtectionFilter.java",
        authorizedSha256:
          "96b726602d5a76ff7ab30624959264e9db50d340c6f9b3c70aee5e7567a93b40",
      },
      {
        path: "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherSupervisionRetentionCleanupJob.java",
        authorizedSha256:
          "d361d712ee055282fe88cb3c20df3650bce26d0ba28da045b6caa7dd7fb1df8e",
      },
      {
        path: "backend/src/test/java/com/skillpilot/backend/config/RequestLoggingFilterTest.java",
        authorizedSha256:
          "84423caa8f4ba546c2f6f142663855b4c366f768ea2cd8e9ab8e909a51c6bdce",
      },
      {
        path: "backend/src/test/java/com/skillpilot/backend/controller/SpaControllerTest.java",
        authorizedSha256:
          "c887293de2bfbc5167b4b05f8c05b6d643d122c58751b9e77ffafd383363735b",
      },
      {
        path: "backend/src/test/java/com/skillpilot/backend/teachersupervision/TeacherSupervisionIntegrationTest.java",
        authorizedSha256:
          "5eb81a24339054a1a6c42d23f0287fedd26e8b701c814d03eb7e380990d01ca0",
      },
      {
        path: "backend/src/test/java/com/skillpilot/backend/teachersupervision/TeacherSupervisionProtectionFilterTest.java",
        authorizedSha256:
          "9ac1204a42befa62a401f764183264e65834df41f2ea31f67108e80f23f23c51",
      },
      {
        path: "backend/src/test/java/com/skillpilot/backend/teachersupervision/TeacherSupervisionRetentionCleanupIntegrationTest.java",
        authorizedSha256:
          "3edb4c7a7cc10a82fd90bbdc77ea8ca6e2ed78cdae253e31707c291892fc2a64",
      },
      {
        path: "contracts/curriculum-package/v1/profiles/full-standalone-v1.readiness-policy.json",
        authorizedSha256:
          "ec5dfbff03ddaccd89371abddc592d9e4a9b29c913115da7a9b8f74abcdeb941",
      },
      {
        path: "docs/concept/runtime-workflows/teacher-supervision-linking.md",
        authorizedSha256:
          "0d3ff0f7c4c9eead3b00ac6b5b80866a10f7cd56ec83175130a93253fc2fd166",
      },
      {
        path: "scripts/package_consumer_smoke_http.py",
        authorizedSha256:
          "7a9c5943480e9d223367dc4c54164029d936d557d8072c623c669ad5a471668a",
      },
      {
        path: "scripts/run_package_consumer_smoke.py",
        authorizedSha256:
          "4490199905bd4e87b1ed63cb7946545ffed16e26d06daad789e64b5c5c7bcffe",
      },
    ],
  },
  {
    id: "2026-08-31-teacher-supervision-privacy-disclosure",
    approvedAt: "2026-08-31",
    approvedBy: "product-owner",
    reason:
      "Disclose the newly activated optional read-only teacher-supervision processing accurately in the public privacy policy.",
    scope:
      "Change only the German and English privacy-policy date, section numbering and teacher-supervision disclosure covering explicit approval, read-only subject and mastery access, stored capability digests and membership data, local-only alias, seven-day one-time invitations, revocation, closure and the bounded terminal-record deletion schedule; preserve all existing legal promises and every submitted OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, coach, session, review-case, portal, fixture and review-artifact contract.",
    target: "current-production-first-party-privacy-policy",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-accurate-first-party-teacher-supervision-privacy-disclosure-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/utils/privacyViewCopy.ts",
      submittedSha256:
        "471f7cbdaf8c5a4db6ebddfad3ffebf54a8e2a44a253994f2ff258d02ba77f8b",
      authorizedSha256:
        "7bbdc2dd7f88ae7e68c17552dbe44d17b830d55d45c165b65c9b2436563f468b",
    },
    evidenceFile: {
      path: "app/src/utils/privacyViewCopy.test.ts",
      sha256:
        "1f96b817433fa322c5f48e23f32c4b686e47af2bb63d9ba9e9d6ca245c8af295",
    },
  },
  {
    id: "2026-08-31-password-protected-trainer-class-export",
    approvedAt: "2026-08-31",
    approvedBy: "product-owner",
    reason:
      "Protect exported local teacher class rosters and real-name-to-SkillPilot-ID mappings with client-side password encryption.",
    scope:
      "In the current first-party Trainer only, replace plaintext local-class downloads with a strictly versioned PBKDF2-SHA-256/AES-256-GCM password envelope, generic filename, password confirmation and non-recoverability guidance; retain bounded legacy plaintext import only as a disclosed migration path, reject downgrade, tampering and linked supervision classes, preserve current class state across current-format roundtrips, and preserve every submitted OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, coach, session, identity, review-case, portal, fixture and review-artifact contract.",
    target: "current-production-first-party-trainer-class-file",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-independent-first-party-trainer-file-protection-no-submitted-openai-contract-or-review-flow-effect",
    supplementalOnly: true,
    evidenceFile: {
      path: "app/scripts/testTrainerClassFileUi.ts",
      sha256:
        "5ab65164ffdaa9f42e8de2b4bb7029fce442371fd91105486203dae02eaf488d",
    },
    additionalFiles: [
      {
        path: "app/package.json",
        authorizedSha256:
          "61cb35d26b04e9ff1541713ae7fe8574ce65a660a5ec6d262b662967b65e9f27",
      },
      {
        path: "app/scripts/fixtures/trainerClassFileUi.html",
        authorizedSha256:
          "5ef767cabca49daec39eeb74d6e98301f39ab75d1476c0b7d7d579325912e84f",
      },
      {
        path: "app/scripts/fixtures/trainerClassFileUi.tsx",
        authorizedSha256:
          "70a50069c24713693d374be337f29b0d9b928406e07604d5a189f2c3d964b137",
      },
      {
        path: "app/src/components/TrainerClassFilePasswordDialog.tsx",
        authorizedSha256:
          "3e943665179508e5c55957d4270bc32a8fef0b451e9cedc1ca634d0d571ea253",
      },
      {
        path: "app/src/utils/trainerClassFile.ts",
        authorizedSha256:
          "dff80c57aef7009c1294bb58a78b6bd72bdb05565dfadbd789b3ced53aaf8f65",
      },
      {
        path: "app/src/utils/trainerClassFile.test.ts",
        authorizedSha256:
          "f6b1b830bb858cbb973f28bfb0410d4df179da9cbb9ffbcf6e89874eab224d68",
      },
      {
        path: "app/src/utils/trainerClassFileCopy.ts",
        authorizedSha256:
          "456b7f253362e2d56ceb9061c612e09e387ae05b1cf1bfc47fd8b118b2fe14ea",
      },
      {
        path: "app/src/utils/trainerClassFileCopy.test.ts",
        authorizedSha256:
          "d0c958b20c5a0d6026d855351212774be3c17d6d0b3961e08e1eff69723cf719",
      },
      {
        path: "app/src/utils/trainerLandscapeContext.ts",
        authorizedSha256:
          "014c47094a89a250d172d93ef93aae7128200c51e21677a345b55fedde806e47",
      },
      {
        path: "app/src/views/TrainerView.tsx",
        priorAuthorizedSha256:
          "1d2162e65072870f42a9edf355b1e8082e2c1349dce6b6da2c7578bcab16ec30",
        authorizedSha256:
          "5bbe38b12464e4fa128f7299b2a462f791a8f286bff24b9847743877080721ee",
      },
      {
        path: "docs/concept/runtime-workflows/import-export-workflow.md",
        authorizedSha256:
          "ab8055fe792b8b2066fa7d41e55fed6067ac5b1be60d4da9886da6bc67daefa5",
      },
      {
        path: "docs/security/data-privacy.md",
        authorizedSha256:
          "c8eb88c100e746df3e5b3bee41878088fd7e56f364d7fbc63acf8f67cd96ec2a",
      },
    ],
  },
  {
    "id": "2026-08-31-retire-server-linked-teacher-supervision",
    "approvedAt": "2026-08-31",
    "approvedBy": "product-owner",
    "reason": "Replace the server-linked invitation and membership model with an honest browser-local teacher view based directly on a known full-access SkillPilot ID, and remove every legacy supervision class card instead of retaining or migrating it.",
    "scope": "In the current first-party WebGUI and backend only, let a teacher create one local read-only UI class for one known existing learner ID, copy the learner's complete selected-subject personalization into that local card, refresh profile and mastery through the ordinary learner endpoints, switch between all selected subjects, allow only password-encrypted local export, purge all legacy linked-supervision cards and their browser credentials, reject their import, remove the invitation route and server supervision implementation, and drop the three obsolete relationship tables through an append-only Liquibase migration; create no teacher-student relationship, invitation, membership, consent, revocation or retention record, make no claim that the read-only UI restricts the bearer authority of the ID, keep the package consumer disabled, and preserve every submitted OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, coach, session, review-case, portal, fixture and review-artifact contract.",
    "target": "current-production-first-party-web-frontend-and-backend",
    "frozenPluginVersion": "1.0.0",
    "portalReviewAction": "none-required-independent-first-party-local-known-id-view-no-submitted-openai-contract-or-review-flow-effect",
    "protectedFile": {
      "path": "backend/src/main/resources/application.yml",
      "submittedSha256": "15b120a2799148b10f9963fcae6fc998d4f1356b13489be9b6dc89c59161f591",
      "priorAuthorizedSha256": "7377e3aa197f1156c3ca425b57ff08bde430a451ba1b5f0b27bc1359743c616f",
      "authorizedSha256": "83df7973dc6bea7457d8398b55a600b5de2a4349dd32dd6faccef37a488b2990"
    },
    "evidenceFile": {
      "path": "app/scripts/testExistingLearnerTrainerUi.ts",
      "sha256": "e1de40b61b30bbc415bb57699986506ababef6efafea05b2938d73328b1733a9"
    },
    "additionalFiles": [
      {
        "path": ".github/workflows/ci.yml",
        "priorAuthorizedSha256": "7a3f99c29ae88eaef78e86422be940359aaf46839ea3969418e4455f27b412c2",
        "authorizedSha256": "d75fa8c2d565c0ddf1781457a3096581ad6c9cbc322b1d5dcab2b5c349a9a625"
      },
      {
        "path": "app/.env",
        "priorAuthorizedSha256": "8bee290c0e575c1c43d0309b40eae4a54433227572feea15d5c769c41b3d4dcd",
        "authorizedSha256": "3368d3cb9133c2924a231c16dfd7afe2a66988db15220e464c5a22610fbe6170"
      },
      {
        "path": "app/.env.package-consumer",
        "priorAuthorizedSha256": "c51d20d7477657ba1894d762915006c8ad94d42d5a3412a51f1e67364459db8a",
        "authorizedSha256": "96e4007f883c8ce55729b4359905d6f9f595044ce80ac6ec924ff74968cf073e"
      },
      {
        "path": "app/.env.production",
        "priorAuthorizedSha256": "e12c251a3f7aa563748a4cf077f695a314e6e8a8508446fb4e55e1760fc263b5",
        "authorizedSha256": "14eca491850e233d7658c9b60f6d46fdd307b3b4124642e7b20021ab0f0bfdbf"
      },
      {
        "path": "app/package.json",
        "priorAuthorizedSha256": "61cb35d26b04e9ff1541713ae7fe8574ce65a660a5ec6d262b662967b65e9f27",
        "authorizedSha256": "c2bb74d825ea1d1a16bafd0954ef52e8272551ba7b479cf7f816fec31cc54175"
      },
      {
        "path": "app/scripts/fixtures/existingLearnerClassSetupUi.html",
        "authorizedSha256": "c86ba600cef023f50b579c295b0a8d9d9a2627048ff0ef9d804361769b63362b"
      },
      {
        "path": "app/scripts/fixtures/existingLearnerClassSetupUi.tsx",
        "authorizedSha256": "48161cd1c8b1a3a992095403915c5e0bb2c0cb7432707eabaa0ad6c020c76f82"
      },
      {
        "path": "app/scripts/fixtures/existingLearnerTrainerUi.html",
        "authorizedSha256": "03f1790eaca384dde516f1ff1826773d03fdbc6892a1f2f13079e3b86cf6d4ab"
      },
      {
        "path": "app/scripts/fixtures/existingLearnerTrainerUi.tsx",
        "authorizedSha256": "92332a285ad7377808a96fb44b26ab71a09c582b99892974c94f5d678e1aedf0"
      },
      {
        "path": "app/scripts/testExistingLearnerClassSetupUi.ts",
        "authorizedSha256": "1dfd2c662a97f61f9a30c2d71f3e0d86f41188ff9d1e3653b250e1c991de1e62"
      },
      {
        "path": "app/scripts/testExistingLearnerDisabledUi.ts",
        "authorizedSha256": "3223a96db8c1a60e3be9389cd113330bc61a99946ca4e92ab2e4a8b57fa4ae21"
      },
      {
        "path": "app/scripts/fixtures/teacherSupervisionClassSetupUi.html",
        "deleted": true
      },
      {
        "path": "app/scripts/fixtures/teacherSupervisionClassSetupUi.tsx",
        "priorAuthorizedSha256": "dddb26242831f3206ea614b1f8af1876268f3dd748aea96945af8a43663db9af",
        "deleted": true
      },
      {
        "path": "app/scripts/fixtures/teacherSupervisionConsentUi.html",
        "deleted": true
      },
      {
        "path": "app/scripts/fixtures/teacherSupervisionConsentUi.tsx",
        "deleted": true
      },
      {
        "path": "app/scripts/fixtures/teacherSupervisionTrainerUi.html",
        "priorAuthorizedSha256": "24f5a00f9513a5b92bc2ab3280efac829d16ec243a2eaddc57ec68bbec88a755",
        "deleted": true
      },
      {
        "path": "app/scripts/fixtures/teacherSupervisionTrainerUi.tsx",
        "priorAuthorizedSha256": "a0ee4702182ff6c145c02e1840c78a40304b1b3e3c6e3ed9c49142adaebf3345",
        "deleted": true
      },
      {
        "path": "app/scripts/testTeacherSupervisionClassSetupUi.ts",
        "priorAuthorizedSha256": "e15d8901b948013a8ae3ab40798c81df4062854b42106988324940db11d20b63",
        "deleted": true
      },
      {
        "path": "app/scripts/testTeacherSupervisionConsentUi.ts",
        "deleted": true
      },
      {
        "path": "app/scripts/testTeacherSupervisionTrainerUi.ts",
        "priorAuthorizedSha256": "5b78c3ef9e337eecc2050e71a1528581f0c89439e1182576dab18b2d7a7b007c",
        "deleted": true
      },
      {
        "path": "app/scripts/testTeacherSupervisionUi.ts",
        "priorAuthorizedSha256": "034bc3082a40ab3d5b2ade8ded89d4a00d955aa60f4eaa8613e412f8acb0418d",
        "deleted": true
      },
      {
        "path": "app/src/App.tsx",
        "authorizedSha256": "c11ec44b676026e9cf77345e087a7c0e7ad4119c04634a949684e5ae61b552e7"
      },
      {
        "path": "app/src/components/ClassSetup.tsx",
        "priorAuthorizedSha256": "f4fd8c1e65b88f23cb806b36461e5fc735e1fcfae5f524bc76223e85fc18488d",
        "authorizedSha256": "ba1fd82e8c0da143a7fd973e702067467f2b8cf66f1e3e88a65ea17910616eea"
      },
      {
        "path": "app/src/trainerTypes.ts",
        "authorizedSha256": "289b08c175ce85400b9301e2532080bc5260eb3ca98647ecd1997cb1d8186a5c"
      },
      {
        "path": "app/src/utils/existingLearnerClass.test.ts",
        "authorizedSha256": "60803e7ccdda12a675701ad7620a43116837feae155dcd089873ec4b84cf30a2"
      },
      {
        "path": "app/src/utils/existingLearnerClass.ts",
        "authorizedSha256": "0d3526be7d170a66443310217302c68d6d9543c01857be7490ad6cd68b862439"
      },
      {
        "path": "app/src/utils/existingLearnerClassCopy.ts",
        "authorizedSha256": "be5a0c6a1ddaf413db1313389c7a85a45884a6db93c8c65f3852dcdb61d5a510"
      },
      {
        "path": "app/src/utils/teacherSupervision.test.ts",
        "priorAuthorizedSha256": "afe163aac7404723c72e8f22f425a6366d02264edd5094cdb788ded740d48527",
        "deleted": true
      },
      {
        "path": "app/src/utils/teacherSupervision.ts",
        "priorAuthorizedSha256": "59885c733af39e251b7fe2456b22046cf41df493dc0d2a3e2bbf00c16ece5ae0",
        "deleted": true
      },
      {
        "path": "app/src/utils/teacherSupervisionCopy.ts",
        "priorAuthorizedSha256": "db27d3a6798524bc72a8391747109b4a87de2efb283515f7486e4408aa2f016d",
        "deleted": true
      },
      {
        "path": "app/src/utils/trainerClassFile.test.ts",
        "priorAuthorizedSha256": "f6b1b830bb858cbb973f28bfb0410d4df179da9cbb9ffbcf6e89874eab224d68",
        "authorizedSha256": "a71bf5e8835c9758ca636647eb7844d03f77c0604c72452087505069aebe3b48"
      },
      {
        "path": "app/src/utils/trainerClassFile.ts",
        "priorAuthorizedSha256": "dff80c57aef7009c1294bb58a78b6bd72bdb05565dfadbd789b3ced53aaf8f65",
        "authorizedSha256": "626c6fd9b39891a1ab36964da6a2ca0233237ddc6025b61f552ee9978d849995"
      },
      {
        "path": "app/src/views/TeacherSupervisionConsentView.tsx",
        "deleted": true
      },
      {
        "path": "app/src/views/TrainerView.tsx",
        "priorAuthorizedSha256": "5bbe38b12464e4fa128f7299b2a462f791a8f286bff24b9847743877080721ee",
        "authorizedSha256": "4350de4ced424cb364fb52379900808c46bd55051ebb95e412198277dfd00e11"
      },
      {
        "path": "app/src/vite-env.d.ts",
        "priorAuthorizedSha256": "8e4c11c122e2c5cafd45d33bc2895c6e3e53b21560e71b3589795fb85d2d04ef",
        "authorizedSha256": "00477dcdf891495ba2fde3702856878d7289a6264ae11d509fcc3c71c5eabc95"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/config/RequestLoggingFilter.java",
        "priorAuthorizedSha256": "c2a49b601b864e42b298afab975b19654c07cbb94a94c1dd870b96126c421dd5",
        "authorizedSha256": "456f025a2473262acc1fc4a12c6d3add51bbfe29113e9dfa1e3b4f6597fe45ed"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/controller/SpaController.java",
        "priorAuthorizedSha256": "b78716065ce0fa10dccaddbd1a18b6dda8aa13feb1b16d158a55ebf6a9bfa0b9",
        "authorizedSha256": "f8de93df0f1f7bda412b2a1f084aa32db0571b7c5c20d2d99fcbc28684a843d2"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/teachersupervision/ConditionalOnTeacherSupervisionEnabled.java",
        "deleted": true
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherCourse.java",
        "deleted": true
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherCourseRepository.java",
        "deleted": true
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherMembership.java",
        "deleted": true
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherMembershipRepository.java",
        "deleted": true
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherMembershipStatus.java",
        "deleted": true
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherPersonalizationProjector.java",
        "deleted": true
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherSupervisionApi.java",
        "deleted": true
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherSupervisionController.java",
        "deleted": true
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherSupervisionProtectionFilter.java",
        "priorAuthorizedSha256": "96b726602d5a76ff7ab30624959264e9db50d340c6f9b3c70aee5e7567a93b40",
        "deleted": true
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherSupervisionRetentionCleanupJob.java",
        "priorAuthorizedSha256": "d361d712ee055282fe88cb3c20df3650bce26d0ba28da045b6caa7dd7fb1df8e",
        "deleted": true
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherSupervisionService.java",
        "deleted": true
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherSupervisionTokenCodec.java",
        "deleted": true
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherWorkspace.java",
        "deleted": true
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/teachersupervision/TeacherWorkspaceRepository.java",
        "deleted": true
      },
      {
        "path": "backend/src/main/resources/db/changelog/db.changelog-master.yaml",
        "authorizedSha256": "7a9b411483f4d60833bf211a1334bfca11e78920a57c9581644d635d272c16fc"
      },
      {
        "path": "backend/src/main/resources/db/changelog/changes/027-add-teacher-supervision.yaml",
        "authorizedSha256": "5b63be9390b6fe93f655e2ffa920b6dafdfcb31266e3394232c12fdb8d23519b"
      },
      {
        "path": "backend/src/main/resources/db/changelog/changes/028-drop-teacher-supervision.yaml",
        "authorizedSha256": "5012717fa21639108f039a8a54109703732e139fc783c0e0ffec47021f2be84f"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/config/RequestLoggingFilterTest.java",
        "priorAuthorizedSha256": "84423caa8f4ba546c2f6f142663855b4c366f768ea2cd8e9ab8e909a51c6bdce",
        "authorizedSha256": "813ceda2488ff5e4e510780fbf6e4af6092913fad0508bd057ac0933a5880400"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/controller/SpaControllerTest.java",
        "priorAuthorizedSha256": "c887293de2bfbc5167b4b05f8c05b6d643d122c58751b9e77ffafd383363735b",
        "authorizedSha256": "49cde62b02527f729db84b08d7e7d78be32245ff0ac55a476ab3ccccf4998022"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/migration/TeacherSupervisionRemovalMigrationTest.java",
        "authorizedSha256": "1f11dc621d873a02f2c6f2b7ef15a181281bd3d140e08f77692496cd3fef27b1"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/service/LearnerRetentionLiquibaseIntegrationTest.java",
        "authorizedSha256": "3c2eeb2abae421186383bc979b17ec4d36d8e64e0c4997a4320811170324d358"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/teachersupervision/TeacherSupervisionIntegrationTest.java",
        "priorAuthorizedSha256": "5eb81a24339054a1a6c42d23f0287fedd26e8b701c814d03eb7e380990d01ca0",
        "deleted": true
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/teachersupervision/TeacherSupervisionProtectionFilterTest.java",
        "priorAuthorizedSha256": "9ac1204a42befa62a401f764183264e65834df41f2ea31f67108e80f23f23c51",
        "deleted": true
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/teachersupervision/TeacherSupervisionRetentionCleanupIntegrationTest.java",
        "priorAuthorizedSha256": "3edb4c7a7cc10a82fd90bbdc77ea8ca6e2ed78cdae253e31707c291892fc2a64",
        "deleted": true
      },
      {
        "path": "docs/concept/index.md",
        "authorizedSha256": "17afe5586b013ae2cd4021b52422ce420103ba4e78ba62909d65d7ec319657bf"
      },
      {
        "path": "docs/concept/runtime-workflows/existing-learner-teacher-view.md",
        "authorizedSha256": "4e1f8de385641f244279093c9eba0b52e5f96a240aee5c04db6b1b0a485413cf"
      },
      {
        "path": "docs/concept/runtime-workflows/import-export-workflow.md",
        "priorAuthorizedSha256": "ab8055fe792b8b2066fa7d41e55fed6067ac5b1be60d4da9886da6bc67daefa5",
        "authorizedSha256": "78e222b297d62baeb1544c546bfd846b3d1f5e880cce5ea2680593a5f7046d40"
      },
      {
        "path": "docs/concept/runtime-workflows/teacher-supervision-linking.md",
        "priorAuthorizedSha256": "0d3ff0f7c4c9eead3b00ac6b5b80866a10f7cd56ec83175130a93253fc2fd166",
        "deleted": true
      },
      {
        "path": "docs/security/data-privacy.md",
        "priorAuthorizedSha256": "c8eb88c100e746df3e5b3bee41878088fd7e56f364d7fbc63acf8f67cd96ec2a",
        "authorizedSha256": "ba5ffcad3a2db2507d115e189454ba526a41cc074ee358a0eb59484efaecfad0"
      }
    ]
  },
  {
    "id": "2026-08-31-direct-id-teacher-view-privacy-correction",
    "approvedAt": "2026-08-31",
    "approvedBy": "product-owner",
    "reason": "Replace the obsolete invitation and membership disclosure with an accurate description of the browser-local direct-ID teacher view and its real bearer-secret boundary.",
    "scope": "Change only the German and English privacy-policy teacher-view disclosure and its regression: state that the local browser stores the alias, full SkillPilot ID and copied personalization, that opening the card reads profile and mastery through ordinary learner endpoints without creating a server-side teacher-student relationship, that the UI is read-only but knowledge of the ID still grants the same full learner access, and that a password-encrypted class export contains the ID; remove obsolete invitation, approval, membership, revocation and bounded terminal-retention claims while preserving every other legal promise and every submitted OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, coach, session, review-case, portal, fixture and review-artifact contract.",
    "target": "current-production-first-party-privacy-policy",
    "frozenPluginVersion": "1.0.0",
    "portalReviewAction": "none-required-accurate-local-direct-id-privacy-correction-no-submitted-openai-contract-or-review-flow-effect",
    "protectedFile": {
      "path": "app/src/utils/privacyViewCopy.ts",
      "submittedSha256": "471f7cbdaf8c5a4db6ebddfad3ffebf54a8e2a44a253994f2ff258d02ba77f8b",
      "priorAuthorizedSha256": "7bbdc2dd7f88ae7e68c17552dbe44d17b830d55d45c165b65c9b2436563f468b",
      "authorizedSha256": "4ab1f49f2339b8e2ef3e758e4fb3bedf33e37ae8ca792382c1c79dbc2ae0bab0"
    },
    "evidenceFile": {
      "path": "app/src/utils/privacyViewCopy.test.ts",
      "priorSha256": "1f96b817433fa322c5f48e23f32c4b686e47af2bb63d9ba9e9d6ca245c8af295",
      "sha256": "ce06b90403e5b4501908044e9ca6f0954c2176f0cd9478e8ee976a597971b47f"
    }
  },
  {
    "id": "2026-09-01-direct-id-course-plan-open-atomic-baseline",
    "approvedAt": "2026-09-01",
    "approvedBy": "product-owner",
    "reason": "Correct direct-ID course planning so its immutable local baseline mirrors the learner's current Cockpit focus, counts only projected atomic targets, and schedules only targets open at capture with rounded displays.",
    "scope": "In the current first-party WebGUI and backend only, add one no-store read-only planning-scope endpoint under the ordinary learner-ID boundary; derive the current effective Level-3 focus and the same projected target atoms and mastery threshold as the Cockpit without writing learner state or creating a teacher-student relationship; capture focus IDs, atomic scope IDs, open atomic IDs, aggregate counts and timestamp once in the browser-local teacher plan; keep that baseline immutable across edits and undo, invalidate old coverage attestations through a real plan revision, plan only the open subset, round cumulative due-goal displays consistently and rates to at most one decimal, omit the learner-derived baseline from plan exports while warning that teacher free text remains unchanged, disclose the local processing accurately, add focused frontend/backend/browser/CI regressions, and preserve every submitted OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, coach, session, identity, review-case, portal, fixture and review-artifact contract.",
    "target": "current-production-first-party-direct-id-course-planning",
    "frozenPluginVersion": "1.0.0",
    "portalReviewAction": "none-required-independent-first-party-local-course-planning-no-submitted-openai-contract-or-review-flow-effect",
    "protectedFile": {
      "path": "app/src/utils/privacyViewCopy.ts",
      "submittedSha256": "471f7cbdaf8c5a4db6ebddfad3ffebf54a8e2a44a253994f2ff258d02ba77f8b",
      "priorAuthorizedSha256": "4ab1f49f2339b8e2ef3e758e4fb3bedf33e37ae8ca792382c1c79dbc2ae0bab0",
      "authorizedSha256": "f8f847135a35a483d84a3d191e2b8e24e63a7f3cf47f8e42ba4a361a3a9bf435"
    },
    "evidenceFile": {
      "path": "app/scripts/testExistingLearnerTrainerUi.ts",
      "priorSha256": "e1de40b61b30bbc415bb57699986506ababef6efafea05b2938d73328b1733a9",
      "sha256": "5ffeac2acbe876435cce35c6999a99e4144f238b0d9edf1f9750871ec6d8daac"
    },
    "additionalFiles": [
      {
        "path": ".github/workflows/ci.yml",
        "priorAuthorizedSha256": "d75fa8c2d565c0ddf1781457a3096581ad6c9cbc322b1d5dcab2b5c349a9a625",
        "authorizedSha256": "0c9c45ae1701e1f5ca3a9d98bad15c06040c721da1a689232acd76dbc416b351"
      },
      {
        "path": "app/src/components/CoursePlanPilotView.tsx",
        "authorizedSha256": "ba8adf79394c956305c6565e683107f50104ff238c7c24e477b43e8599bac95a"
      },
      {
        "path": "app/src/coursePlanTypes.ts",
        "authorizedSha256": "00cc04518152d792a14b6e2b25773dd02927d04e03099c50c51d85a518c52215"
      },
      {
        "path": "app/src/utils/coursePlanCopy.ts",
        "authorizedSha256": "76f736720c646e9154eabe6e00e7ed1fbfd19840e96fdbafea688d0188ef8fe9"
      },
      {
        "path": "app/src/utils/learnerPlanningScope.ts",
        "authorizedSha256": "61f567e16d8c8de39153cbf859811fd1311ac5a10689f4160cbe83a3e4f473c7"
      },
      {
        "path": "app/src/utils/localTeacherCoursePlan.test.ts",
        "authorizedSha256": "fca925ef48a210e1801a4af2b1201d158a6d7114ec979392a5bebf242fde0bec"
      },
      {
        "path": "app/src/utils/localTeacherCoursePlan.ts",
        "authorizedSha256": "1730a6c89f07166fbf3c3fa09d581104495d4d03979edb8b8e14703f67023e58"
      },
      {
        "path": "app/src/utils/privacyViewCopy.test.ts",
        "priorAuthorizedSha256": "ce06b90403e5b4501908044e9ca6f0954c2176f0cd9478e8ee976a597971b47f",
        "authorizedSha256": "07119f62c03bd32bb8f19cf8a61b1d6b097ac8a56e60969b4f22bb1baf304877"
      },
      {
        "path": "app/src/views/TrainerView.tsx",
        "priorAuthorizedSha256": "4350de4ced424cb364fb52379900808c46bd55051ebb95e412198277dfd00e11",
        "authorizedSha256": "2508e4353a4f4d0e354e8bba6184f15101b402e24d20d85bb226ebcaecc6259b"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/api/LearnerPlanningScopeResponse.java",
        "authorizedSha256": "8ee39010db23db76c5953c31df2c354fd72d817942e63f721489e6c927a1d1d0"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/service/CompositionViewService.java",
        "authorizedSha256": "f360904f43a04b73cf6106da4e7c2484d5ffd1f9d781f15e1b5188ab8a25a65a"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/service/LearnerService.java",
        "authorizedSha256": "016c19b1ef0ae8398295852214e57d3727fbbf65fb9f3aa2e4a12133ad31c46f"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/ui/LearnerUiController.java",
        "authorizedSha256": "2d1b7200fc380333e5e00a88922019ed99ca8ee93682bb9a5db166b224d8824b"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/service/LearnerPlanningScopeServiceTest.java",
        "authorizedSha256": "e0149aa71c44d4c57d1d70efff8b4f8603a2783a78465896d7232f7b452dfd23"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/ui/LearnerUiControllerPlanningScopeHttpTest.java",
        "authorizedSha256": "58519046dcaef168dec616de53f5a94fcf03874ea43568eb42fdda0f14dc2558"
      },
      {
        "path": "docs/concept/didactic/curriculum-time-axis-and-pacing.md",
        "authorizedSha256": "23ee1b49bc86af6f955de06199e82c56f487a2cf39eefae6eccd1717bbecc688"
      },
      {
        "path": "docs/concept/runtime-workflows/existing-learner-teacher-view.md",
        "priorAuthorizedSha256": "4e1f8de385641f244279093c9eba0b52e5f96a240aee5c04db6b1b0a485413cf",
        "authorizedSha256": "45d7585c2dfb449c0a844d7984b617cb0b5d9da22ee9c82b170fdbd9f7df4081"
      },
      {
        "path": "docs/security/data-privacy.md",
        "priorAuthorizedSha256": "ba5ffcad3a2db2507d115e189454ba526a41cc074ee358a0eb59484efaecfad0",
        "authorizedSha256": "a700963ddf601553d883848795770eb49e25cf88b7e4f4ee779292af9c8d5098"
      }
    ]
  },
  {
    "id": "2026-09-01-personalized-level-two-course-planning-scope",
    "approvedAt": "2026-09-01",
    "approvedBy": "product-owner",
    "reason": "Correct the direct-ID course planner so every atomic target in the selected subject's complete Personal Curriculum remains selectable independently of the learner's current focus, while concrete block metrics continue to count only the selected block scope and its capture-time open subset.",
    "scope": "In the current first-party WebGUI and backend only, replace the focus-bound planning snapshot with a no-store read-only snapshot of all projected atomic targets in the requested subject landscape from the completed Level-2 Personal Curriculum; remove scopeGoalId and focus identifiers from the endpoint and new local baseline; build the planning selector before route/focus supplementation; intersect each selected block's atomic descendants with the landscape baseline and its immutable capture-time open subset; calculate displayed denominators from the union of actually selected block scopes so a 259-atom Sek-I block with 206 mastered remains 53 open of 259 even when personalized Sek-II targets are also selectable; migrate the legacy focus baseline exactly once through a real plan revision that invalidates prior attestations while keeping the new baseline across undo; retain atomic-only counting, the 0.9 mastery threshold, rounded displays, export omission, direct-ID bearer boundary, no teacher-student server relation, and every submitted OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, coach, session, identity, review-case, portal, fixture and review-artifact contract.",
    "target": "current-production-first-party-direct-id-course-planning",
    "frozenPluginVersion": "1.0.0",
    "portalReviewAction": "none-required-independent-first-party-level-two-course-planning-correction-no-submitted-openai-contract-or-review-flow-effect",
    "protectedFile": {
      "path": "app/src/utils/privacyViewCopy.ts",
      "submittedSha256": "471f7cbdaf8c5a4db6ebddfad3ffebf54a8e2a44a253994f2ff258d02ba77f8b",
      "priorAuthorizedSha256": "f8f847135a35a483d84a3d191e2b8e24e63a7f3cf47f8e42ba4a361a3a9bf435",
      "authorizedSha256": "1424f94d5087a368e45d064dcfde718a4f0958464a32e376f66dddee6fdeb7f4"
    },
    "evidenceFile": {
      "path": "app/scripts/testExistingLearnerTrainerUi.ts",
      "priorSha256": "5ffeac2acbe876435cce35c6999a99e4144f238b0d9edf1f9750871ec6d8daac",
      "sha256": "f98613ce922ead852f5a3ae0d0bd9eb2c50712f559e127ed7bf6fdbfad531a85"
    },
    "additionalFiles": [
      {
        "path": "app/scripts/fixtures/trainerCoursePlanUi.tsx",
        "authorizedSha256": "cbf5ed579c4fe506654239e641dbb9c8f03bd71cfc9c19caa8b246d92e8d52fb"
      },
      {
        "path": "app/scripts/testTrainerCoursePlanUi.ts",
        "authorizedSha256": "5a4bdb263c6297a2bdd4add9d958b817484de2b06f35882167db65d9efd0a5cd"
      },
      {
        "path": "app/src/components/CoursePlanPilotView.tsx",
        "priorAuthorizedSha256": "ba8adf79394c956305c6565e683107f50104ff238c7c24e477b43e8599bac95a",
        "authorizedSha256": "42e09e55e1dce8bff7f5a7093763cb6e9fe84950f171b15557212c4d24ba5ba1"
      },
      {
        "path": "app/src/coursePlanTypes.ts",
        "priorAuthorizedSha256": "00cc04518152d792a14b6e2b25773dd02927d04e03099c50c51d85a518c52215",
        "authorizedSha256": "c8ed29fd16db14f76400cb7701a89bb396f79177f92ab283f178daea7aee07a4"
      },
      {
        "path": "app/src/utils/coursePlanCopy.ts",
        "priorAuthorizedSha256": "76f736720c646e9154eabe6e00e7ed1fbfd19840e96fdbafea688d0188ef8fe9",
        "authorizedSha256": "6d8e3cb7a248dbe1a49841ebfdf675c23c5f2d21796716c0f81e9bf696b95cb4"
      },
      {
        "path": "app/src/utils/learnerPlanningScope.ts",
        "priorAuthorizedSha256": "61f567e16d8c8de39153cbf859811fd1311ac5a10689f4160cbe83a3e4f473c7",
        "authorizedSha256": "f6b00d08b625b94ab4dd2b04f5b42b396a1758e747a1d7eb3f879d175c05b923"
      },
      {
        "path": "app/src/utils/learnerPlanningScope.test.ts",
        "authorizedSha256": "e607e8bcad91bee8d41157cfcb81c6e86f41cf4fb7768b8bb088fd2e189db2b5"
      },
      {
        "path": "app/src/utils/localTeacherCoursePlan.test.ts",
        "priorAuthorizedSha256": "fca925ef48a210e1801a4af2b1201d158a6d7114ec979392a5bebf242fde0bec",
        "authorizedSha256": "3436f6ea0174e7e2a2ce29467761050e706b1bc5641be92acadb74c988debafc"
      },
      {
        "path": "app/src/utils/localTeacherCoursePlan.ts",
        "priorAuthorizedSha256": "1730a6c89f07166fbf3c3fa09d581104495d4d03979edb8b8e14703f67023e58",
        "authorizedSha256": "90427e7b2961d395e0ca40fb5b4f24fdc3ed13d60b25c66b3a8b7ff00a97adaf"
      },
      {
        "path": "app/src/utils/privacyViewCopy.test.ts",
        "priorAuthorizedSha256": "07119f62c03bd32bb8f19cf8a61b1d6b097ac8a56e60969b4f22bb1baf304877",
        "authorizedSha256": "a34ce448d4d43d0aa91e6380e6905e375f6ed986e5db27942577f90e82a42a27"
      },
      {
        "path": "app/src/views/TrainerView.tsx",
        "priorAuthorizedSha256": "2508e4353a4f4d0e354e8bba6184f15101b402e24d20d85bb226ebcaecc6259b",
        "authorizedSha256": "d308f123474aa23064ec6389c16279066a95016797f4f210cb5880190c118e2b"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/api/LearnerPlanningScopeResponse.java",
        "priorAuthorizedSha256": "8ee39010db23db76c5953c31df2c354fd72d817942e63f721489e6c927a1d1d0",
        "authorizedSha256": "ae3d01c4307c2b8d4292ce88fa8d53c52a99be15f695fb055330c80c29f596e2"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/service/CompositionViewService.java",
        "priorAuthorizedSha256": "f360904f43a04b73cf6106da4e7c2484d5ffd1f9d781f15e1b5188ab8a25a65a",
        "authorizedSha256": "6f75a7bb2d53f2abc1c35ad79f27e2fee5526647e1890fbe9bbffb70844f7ab9"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/service/LearnerService.java",
        "priorAuthorizedSha256": "016c19b1ef0ae8398295852214e57d3727fbbf65fb9f3aa2e4a12133ad31c46f",
        "authorizedSha256": "b94b78fbec5e75a715c91cfbc3f1feeec7475119165761777b6c64646e05f6ac"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/ui/LearnerUiController.java",
        "priorAuthorizedSha256": "2d1b7200fc380333e5e00a88922019ed99ca8ee93682bb9a5db166b224d8824b",
        "authorizedSha256": "4764754fe5b368cb3384ba37c69d58748026e3802c3bf67975de3ddef00a2065"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/service/LearnerPlanningScopeServiceTest.java",
        "priorAuthorizedSha256": "e0149aa71c44d4c57d1d70efff8b4f8603a2783a78465896d7232f7b452dfd23",
        "authorizedSha256": "333f0d3dcdea429a8039b0f5597c52c06eb31f6f7c751250ccf2cfdee77769e7"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/ui/LearnerUiControllerPlanningScopeHttpTest.java",
        "priorAuthorizedSha256": "58519046dcaef168dec616de53f5a94fcf03874ea43568eb42fdda0f14dc2558",
        "authorizedSha256": "bd79954980143d9e17e1d6a3f5dee0694cd6b5d0c81fd6ced9d1b36919ec3140"
      },
      {
        "path": "docs/concept/didactic/curriculum-time-axis-and-pacing.md",
        "priorAuthorizedSha256": "23ee1b49bc86af6f955de06199e82c56f487a2cf39eefae6eccd1717bbecc688",
        "authorizedSha256": "05a09bb1f92abb762076621cc85af6e02f985d756593ee1bf24da5db8e997bb3"
      },
      {
        "path": "docs/concept/runtime-workflows/existing-learner-teacher-view.md",
        "priorAuthorizedSha256": "45d7585c2dfb449c0a844d7984b617cb0b5d9da22ee9c82b170fdbd9f7df4081",
        "authorizedSha256": "8638a688c60d833e6a35d59a69072e9fbcb654f271d3aeca54d40ebf4730c8d6"
      },
      {
        "path": "docs/concept/runtime-workflows/learning-workflow.md",
        "authorizedSha256": "7bcc18c9c42949dc6b9bc2f3bcfc037f680cfe20ad8d2ae094422b9a91a38dd6"
      },
      {
        "path": "docs/security/data-privacy.md",
        "priorAuthorizedSha256": "a700963ddf601553d883848795770eb49e25cf88b7e4f4ee779292af9c8d5098",
        "authorizedSha256": "58e57689fc6a2329a53e1664df1de18971bf5a6498605723f0edca0d28683803"
      }
    ]
  },
  {
    "id": "2026-09-01-course-plan-composition-target-projection-correction",
    "approvedAt": "2026-09-01",
    "approvedBy": "product-owner",
    "reason": "Correct the first-party course-plan Level-2 projection so presentation-only phase normalization cannot remove valid backend-authoritative combined GK+LK composition targets, while preserving the normal cockpit projection and fail-closed baseline validation.",
    "scope": "In the current first-party WebGUI course planner only, build the selectable Level-2 planning tree directly from the backend-authoritative Personal Curriculum composition projection before learner-facing presentation phase normalization; retain that normalization for the normal cockpit tree, retain strict rejection of any baseline target absent from the planning index, and add browser and backend regressions for a merged G9 GK+LK scope containing a Q4 target beneath an E-labelled canonical branch; preserve focus independence, atomic-only counting, the no-store read-only planning snapshot, direct-ID bearer boundary, no teacher-student server relation, and every submitted OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, coach, session, identity, review-case, portal, fixture and review-artifact contract.",
    "target": "current-production-first-party-direct-id-course-planning",
    "frozenPluginVersion": "1.0.0",
    "portalReviewAction": "none-required-independent-first-party-course-plan-composition-target-projection-correction-no-submitted-openai-contract-or-review-flow-effect",
    "supplementalOnly": true,
    "additionalFiles": [
      {
        "path": "app/scripts/testTrainerCoursePlanUi.ts",
        "priorAuthorizedSha256": "5a4bdb263c6297a2bdd4add9d958b817484de2b06f35882167db65d9efd0a5cd",
        "authorizedSha256": "5f0e079f5debb1a17b6e621d0a333b0462a6c562af7fa51ec99dc0a3e89b9320"
      },
      {
        "path": "app/src/views/TrainerView.tsx",
        "priorAuthorizedSha256": "d308f123474aa23064ec6389c16279066a95016797f4f210cb5880190c118e2b",
        "authorizedSha256": "17cda4583d728d546513c875edb8cf95a0cffdff69893c436eb8e5ec9fa9682c"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/service/LearnerPlanningScopeServiceTest.java",
        "priorAuthorizedSha256": "333f0d3dcdea429a8039b0f5597c52c06eb31f6f7c751250ccf2cfdee77769e7",
        "authorizedSha256": "f018453aaff183a29f47f1233c42e860771a1043cc9bc33bab158ec378920db6"
      }
    ]
  },
  {
    "id": "2026-09-01-course-plan-edit-form-visibility",
    "approvedAt": "2026-09-01",
    "approvedBy": "product-owner",
    "reason": "Restore the apparently dead course-plan edit action by bringing the already-opened plan-section form into the visible scroll workspace and moving keyboard focus to its heading.",
    "scope": "In the current first-party WebGUI course planner only, keep the existing edit handler, draft values, local persistence, immutable learner-derived planning baseline, coverage, undo, export and calculation semantics unchanged; when the new or existing plan-section form opens, scroll that form into the visible course-plan workspace and move programmatic keyboard focus to its heading; add a focused browser regression that starts from a scrolled learning-section card, clicks Edit, verifies the visible focused prefilled form and then cancels without mutation; preserve every submitted OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, coach, session, identity, review-case, portal, fixture and review-artifact contract.",
    "target": "current-production-first-party-direct-id-course-planning",
    "frozenPluginVersion": "1.0.0",
    "portalReviewAction": "none-required-independent-first-party-course-plan-edit-visibility-correction-no-submitted-openai-contract-or-review-flow-effect",
    "supplementalOnly": true,
    "additionalFiles": [
      {
        "path": "app/scripts/testTrainerCoursePlanUi.ts",
        "priorAuthorizedSha256": "5f0e079f5debb1a17b6e621d0a333b0462a6c562af7fa51ec99dc0a3e89b9320",
        "authorizedSha256": "e04c477cfb6121f8daa540a8ac862258a08c2861b30d2122672d22eeb4fca025"
      },
      {
        "path": "app/src/components/CoursePlanPilotView.tsx",
        "priorAuthorizedSha256": "42e09e55e1dce8bff7f5a7093763cb6e9fe84950f171b15557212c4d24ba5ba1",
        "authorizedSha256": "c2ab3b62b60836ebbd39caa63779a0c7aaebc25934074e0e1d6e23961356f424"
      }
    ]
  },
  {
    "id": "2026-09-01-course-plan-canonical-atomicity-parity",
    "approvedAt": "2026-09-01",
    "approvedBy": "product-owner",
    "reason": "Correct the first-party course-plan atomicity boundary so presentation-only opaque composition entries cannot enter an atomic planning baseline or invalidate valid atomic siblings in a broader plan section.",
    "scope": "In the current first-party WebGUI course planner and its read-only learner planning-scope endpoint only, classify personalized planning targets from their unchanged structural goal definitions rather than presentation-only projected copies; exclude canonical clusters that a direct composition goalEntry renders as opaque leaves from the atomic baseline; when resolving a broader plan section, treat exactly such opaque non-atomic goalEntry clusters as zero-count presentation siblings while retaining fail-closed handling for ordinary empty clusters, missing goals, cycles and every baseline mismatch; add fachneutral utility coverage plus real H2 Mathematics-and-Physics and combined Hessen GK+LK Physics regressions; preserve focus independence, the immutable no-store Level-2 snapshot, direct-ID bearer boundary, no teacher-student server relation, and every submitted OpenAI package, MCP/OAuth/tool/schema/MCP-Apps-UI, coach, session, identity, review-case, portal, fixture and review-artifact contract.",
    "target": "current-production-first-party-direct-id-course-planning",
    "frozenPluginVersion": "1.0.0",
    "portalReviewAction": "none-required-independent-first-party-course-plan-canonical-atomicity-correction-no-submitted-openai-contract-or-review-flow-effect",
    "supplementalOnly": true,
    "additionalFiles": [
      {
        "path": "app/src/utils/localTeacherCoursePlan.test.ts",
        "priorAuthorizedSha256": "3436f6ea0174e7e2a2ce29467761050e706b1bc5641be92acadb74c988debafc",
        "authorizedSha256": "ff52502a72612c8f696a064b6caa64ea1b85ef9416fa07a0a21b6d55bdaef0e7"
      },
      {
        "path": "app/src/utils/localTeacherCoursePlan.ts",
        "priorAuthorizedSha256": "90427e7b2961d395e0ca40fb5b4f24fdc3ed13d60b25c66b3a8b7ff00a97adaf",
        "authorizedSha256": "fac1c4031f182ea7cbf35c7bbefe1e8d615a855a7f643e5eec25afbefc03f800"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/service/LearnerService.java",
        "priorAuthorizedSha256": "b94b78fbec5e75a715c91cfbc3f1feeec7475119165761777b6c64646e05f6ac",
        "authorizedSha256": "f0efaa113759834f84bb5ce04e758f2574d42608ed288290dde25f51c0f99afc"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/service/LearnerPlanningScopeServiceTest.java",
        "priorAuthorizedSha256": "f018453aaff183a29f47f1233c42e860771a1043cc9bc33bab158ec378920db6",
        "authorizedSha256": "0d9ba6dca1a5d7a50f2ac1d87d8e799a327af98dfe08d01c49194c5a968965b7"
      }
    ]
  },
  {
    "id": "2026-09-01-learner-owned-subject-plans-and-opt-in-handoff",
    "approvedAt": "2026-09-01",
    "approvedBy": "product-owner",
    "reason": "Add learner-owned per-subject schedules and a transparent Cockpit counterpart to local teacher planning, including a revocable default-off plan mode whose completion handoff is deterministic and fail-closed.",
    "scope": "In the current production first-party WebGUI and shared learner backend only, allow at most one revisioned personal schedule per personalized subject landscape under the permanent SkillPilot ID; accept a confirmed copy from the browser-local teacher plan through a first-party UI endpoint with optimistic revision, subject/projection/fingerprint validation and fail-closed learner-and-subject context binding; admit newly introduced goal IDs only while open while allowing already stored IDs to remain on confirmed replacement for plan continuity; preserve no teacher/class relationship or automatic synchronization; include the schedule in ordinary learner export/import, retention and deletion; and expose no-store Cockpit summaries plus an explicit first-goal start. Add a default-false followLearningPlans preference controlled only through the first-party UI. While enabled, suppress the generic sequential Autopilot even when no usable plan exists. After a confirmed completion, permit an automatic focus and active-goal handoff only when the completed goal belongs to at least one currently valid stored plan and candidate selection is deterministic: exactly one due prerequisite-satisfied candidate from a plan containing the completed goal takes precedence; only when no such anchored candidate exists may exactly one candidate across all valid plans follow. Multiple anchored or unanchored candidates, stale/invalid-only plans, no stored plan, and absent or blocked due candidates fail closed without selecting a new focus or active goal; the completed active goal may still clear normally, partial mastery retains the current active goal, and date passage alone never writes learner state. This first-party opt-in can suppress generic Autopilot selection and can make the unchanged V1 state and completion responses expose a different existing canonical focus or activeGoal after first-party opt-in; preference changes and successful handoffs use the existing coach-state revision invalidation. The V1 coach cannot create, import, replace, display, or enable personal schedules and gains no new field, tool, schema, annotation, instruction, resource, MCP Apps UI, capability, identity, locale, or session-lifecycle contract. Preserve the submitted default-false review fixture and every OpenAI package, OAuth, prepared-message, first-party ChatGPT launch, review-case, portal-value, reviewer-credential, fixture, demo and review-artifact byte.",
    "target": "current-production-first-party-learner-owned-subject-plans-and-shared-canonical-state-handoff",
    "frozenPluginVersion": "1.0.0",
    "portalReviewAction": "none-required-product-owner-approved-default-off-first-party-plan-mode-with-gated-existing-state-selection-and-unchanged-v1-tools-schemas-session-lifecycle-review-fixtures-and-portal-data",
    "protectedFile": {
      "path": "app/src/views/LearnerView.tsx",
      "submittedSha256": "ec694882cdc5c9eb7e635723715a719f9588b0f2f06f8c57c579f060f7540ed7",
      "priorAuthorizedSha256": "f590240f9be5366032e081f39e9ad5617e7b3f9183ecb1291c3ab5af84416258",
      "authorizedSha256": "dfc7fd5f131af9a556f25b87ad57b7a3d20809ede2275b8007ebb299152ca82b"
    },
    "evidenceFile": {
      "path": "app/scripts/testLearnerPlanCockpitUi.ts",
      "sha256": "95223838f0b322020432149eced7328a5bcc9fdf68df90cd5893bab2d4d87251"
    },
    "additionalFiles": [
      {
        "path": ".github/workflows/ci.yml",
        "priorAuthorizedSha256": "0c9c45ae1701e1f5ca3a9d98bad15c06040c721da1a689232acd76dbc416b351",
        "authorizedSha256": "50965b7b10fab102463817766d866d2beed01e2d52737752e3d79cf73c421ae5"
      },
      {
        "path": "app/package.json",
        "priorAuthorizedSha256": "c2bb74d825ea1d1a16bafd0954ef52e8272551ba7b479cf7f816fec31cc54175",
        "authorizedSha256": "e5618b82523e2266507da67487e851c478b3e458169e9c91bb49f29e9678f25e"
      },
      {
        "path": "app/scripts/fixtures/learnerPlanCockpitUi.html",
        "authorizedSha256": "285c987de15bbc72b83785926d5c444851b581971d8667ca0f796c71ce517a7d"
      },
      {
        "path": "app/scripts/fixtures/learnerPlanCockpitUi.tsx",
        "authorizedSha256": "a1bf23093faec781704f55c2a3d925e4f71fa80d42e8f223b2e994197be273af"
      },
      {
        "path": "app/scripts/testLearnerPlanTodayCardUi.tsx",
        "authorizedSha256": "f2b3fd6c2bc6d836d3fb372ff5e1b318e4ef8ac64548911e09f5cb33bf599562"
      },
      {
        "path": "app/scripts/testTrainerCoursePlanUi.ts",
        "priorAuthorizedSha256": "e04c477cfb6121f8daa540a8ac862258a08c2861b30d2122672d22eeb4fca025",
        "authorizedSha256": "f55e08a6096e5056bd1d96ee093f661c8ee4034e114d8d8fd94a901002869dae"
      },
      {
        "path": "app/scripts/validateLearnerGoalSelection.ts",
        "authorizedSha256": "c8fc3612e4a364aae087d62b1ca8bce2d2645ba0e2d2ac77c297c1c3e0a309b0"
      },
      {
        "path": "app/src/App.tsx",
        "priorAuthorizedSha256": "c11ec44b676026e9cf77345e087a7c0e7ad4119c04634a949684e5ae61b552e7",
        "authorizedSha256": "06834054b5bd4c1b940ee78f174c0f5e8baa9fb90f0e17f9c648d5192dc2c618"
      },
      {
        "path": "app/src/components/CoursePlanPilotView.tsx",
        "priorAuthorizedSha256": "c2ab3b62b60836ebbd39caa63779a0c7aaebc25934074e0e1d6e23961356f424",
        "authorizedSha256": "884f89bd679f53d35310ea1151c385ecb91b36f40d56cb5d427938711bc8a4ec"
      },
      {
        "path": "app/src/components/LearnerPlanTodayCard.tsx",
        "authorizedSha256": "dfd82855f913d140a1269c82ee4a0a9ed8f8d6a13c869b4aa1c28e8768199529"
      },
      {
        "path": "app/src/components/PacingGauge.tsx",
        "authorizedSha256": "ba526ca49ddb1c1acfc506c97fe3f3b252e38fa7532abe41018eea939c821ed3"
      },
      {
        "path": "app/src/components/PersonalCurriculumSetup.tsx",
        "authorizedSha256": "56d0eac142f1411ec7e4cabddadf0275cc04252948cd22f696ad310244793133"
      },
      {
        "path": "app/src/learnerLearningPlanTypes.ts",
        "authorizedSha256": "876446dac081b8c367f68d06655676216e3836cd1fb9be3950d38b5e1c3653e4"
      },
      {
        "path": "app/src/learnerTypes.ts",
        "authorizedSha256": "5fbad30a3bd07015ac0468a51525941e85dd5dc74ff270f01e4edf5ac34d351b"
      },
      {
        "path": "app/src/utils/coursePlanCopy.ts",
        "priorAuthorizedSha256": "6d8e3cb7a248dbe1a49841ebfdf675c23c5f2d21796716c0f81e9bf696b95cb4",
        "authorizedSha256": "4bc9559cf3b51259afeaa066a2afa4c00731a3cb13a8300343272dae34fec6ce"
      },
      {
        "path": "app/src/utils/curriculumSetupCopy.ts",
        "authorizedSha256": "fb0f3ffa444b10eb55ad884148e6a66118c6b7d1f0b3530f5c259cbb243184aa"
      },
      {
        "path": "app/src/utils/learnerCoursePlanPublication.test.ts",
        "authorizedSha256": "2f18030461818a4853198b75025db558de1b611e9bcf65148ed859eae13602bc"
      },
      {
        "path": "app/src/utils/learnerCoursePlanPublication.ts",
        "authorizedSha256": "27364171a2a4ddda1b63dfceab1a3ac96bef0cb410aa6e3098a0cb4be40681d9"
      },
      {
        "path": "app/src/utils/learnerGoalSelection.ts",
        "authorizedSha256": "3a109a2078c2a4cf85c28301f728c917fbc97f24497eeb3a9d12024628b7d779"
      },
      {
        "path": "app/src/utils/learnerLearningPlanApi.test.ts",
        "authorizedSha256": "5db6e68bef139635ce8817189621da439ad1f4e24b918db8024dfd257e9c6c84"
      },
      {
        "path": "app/src/utils/learnerLearningPlanApi.ts",
        "authorizedSha256": "db5006459c8df1faddf2f05d7623a6add306aba384b71c48df51f26e1ef7c58d"
      },
      {
        "path": "app/src/utils/learnerLearningPlanCopy.ts",
        "authorizedSha256": "bfa1d9ab24e9a2e1fb22d7ce7f182df7a9cdf4fd6d933a8fdf5bae4d335819d7"
      },
      {
        "path": "app/src/utils/learnerLearningPlanNavigation.ts",
        "authorizedSha256": "2160af74268505848e06f74a0b2aed1298d1dbcece63cc2d9e52227501ae3228"
      },
      {
        "path": "app/src/utils/learnerLearningPlanReadModel.ts",
        "authorizedSha256": "f0b9292e2796fab0eb0c4168b02074d5181c7a34db7f24b68022095975f317bc"
      },
      {
        "path": "app/src/views/TrainerView.tsx",
        "priorAuthorizedSha256": "17cda4583d728d546513c875edb8cf95a0cffdff69893c436eb8e5ec9fa9682c",
        "authorizedSha256": "fbe5b254fd23e919901c35088d449fc777b2d5126566bb1348b6d201ce4918d1"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/api/LearnerDataDTO.java",
        "authorizedSha256": "fdb2f5db5ea3cf4d61a9c863d3677181976ddb1d9e1ff3da6029cc64b08eb67a"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/api/LearnerLearningPlanApi.java",
        "authorizedSha256": "25485ade73d2c14deffb9efe3c302c572de63d0db7a2926265d10dd7b5ef37b7"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/api/PreferencesRequest.java",
        "authorizedSha256": "0b40c8bb2fdac8ceeba587dabf49274239d10d1df2c32cf2ba0c95659bc2c6e5"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/config/RequestLoggingFilter.java",
        "priorAuthorizedSha256": "456f025a2473262acc1fc4a12c6d3add51bbfe29113e9dfa1e3b4f6597fe45ed",
        "authorizedSha256": "203549a06733a7e330581acf49e3742d57a7018c2009a7959ba624fdffdb7e87"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/domain/Learner.java",
        "authorizedSha256": "e6147a53956ea45882e6d9f5adc748230503846f08a239ba9cafe6d49ff79b0d"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/domain/LearnerLearningPlan.java",
        "authorizedSha256": "f5fa6dd88a4d741a9d7882f542b083cfa52828d25a0d6d310717cf56428625e1"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/repository/LearnerLearningPlanRepository.java",
        "authorizedSha256": "ed1b71b43542df1b5240d7505f2006f97db4c371401ca690b348b37312ed3fbe"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java",
        "authorizedSha256": "13a5d46a5fdbe67909ddbad407ad03b516ac41c703f359de03c25599f38e2772"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/service/LearnerLifecycleService.java",
        "authorizedSha256": "b9d51fbe4dc0a18056c471c959da57c200086621c83dcbbfeff9c5804c5779ad"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/service/LearnerService.java",
        "priorAuthorizedSha256": "f0efaa113759834f84bb5ce04e758f2574d42608ed288290dde25f51c0f99afc",
        "authorizedSha256": "44f9d795a52191cdf1013bfde9ced19369eaea9eea809b6c5d4f6b4e7df9abed"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/ui/LearnerLearningPlanController.java",
        "authorizedSha256": "4d126028a02e53a79a140d3434ee0adb963f4f7448a8ba6e22ee4fef84794afc"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/ui/LearnerUiController.java",
        "priorAuthorizedSha256": "4764754fe5b368cb3384ba37c69d58748026e3802c3bf67975de3ddef00a2065",
        "authorizedSha256": "d563c4118fe33947094e1396679c7bd647ba5ab6348c1c47f6039bd239ced465"
      },
      {
        "path": "backend/src/main/resources/db/changelog/changes/029-add-learner-learning-plans.yaml",
        "authorizedSha256": "5983b7ca1333d844ad0f72997723636e97c52ce76e7f704f77e51629ada26359"
      },
      {
        "path": "backend/src/main/resources/db/changelog/db.changelog-master.yaml",
        "priorAuthorizedSha256": "7a9b411483f4d60833bf211a1334bfca11e78920a57c9581644d635d272c16fc",
        "authorizedSha256": "4675de15d433317a50cd344102c83a9fb1322e21bbf0468c849ad2f7754eb479"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/config/RequestLoggingFilterTest.java",
        "priorAuthorizedSha256": "813ceda2488ff5e4e510780fbf6e4af6092913fad0508bd057ac0933a5880400",
        "authorizedSha256": "6586f8afff7a15256502511ba834c230e7a8c052f0ba4bc8b64d2f30c98ccb0e"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/migration/LearnerLearningPlanMigrationTest.java",
        "authorizedSha256": "a829976f6d990c4e887b678505d8af2bca86da6c58bd3326ab6c5c1860530d0e"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/service/LearnerLearningPlanServiceIntegrationTest.java",
        "authorizedSha256": "2dd02a269ee7c077f499b0e69ee3b5ef43f716f9201b862e2ace8f38bfb8687b"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/service/LearnerLearningPlanServiceTest.java",
        "authorizedSha256": "d9af5378360e755236fb5bbb62cedf17a2bc24aee952caaa4784f64afd2efb72"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/service/LearnerLifecycleServiceTest.java",
        "authorizedSha256": "24a27c50415d104bd52961f71ca21b9213324c87527255f01cc5a3a419688884"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/service/LearnerServiceTest.java",
        "authorizedSha256": "709d6e320153ac1fdeabae425a292c3fd409d68a3542b7353d7b77016d27a792"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/ui/LearnerLearningPlanControllerHttpTest.java",
        "authorizedSha256": "7030df892748efa6c9e8cd06ea6bbf25d367f60532ccd74840f8ad29ab5e292d"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/ui/LearnerUiControllerPersonalizationTest.java",
        "authorizedSha256": "f0c4a8ddd7ee875a4d4e71cb6c932ca2800365b61d5093b9872133ea53041cd2"
      },
      {
        "path": "docs/concept/didactic/curriculum-time-axis-and-pacing.md",
        "priorAuthorizedSha256": "05a09bb1f92abb762076621cc85af6e02f985d756593ee1bf24da5db8e997bb3",
        "authorizedSha256": "75183008e51e4af60e46ca3ee7a99ac30d42a8b08e45652fbf239b0291f34356"
      },
      {
        "path": "docs/concept/runtime-workflows/existing-learner-teacher-view.md",
        "priorAuthorizedSha256": "8638a688c60d833e6a35d59a69072e9fbcb654f271d3aeca54d40ebf4730c8d6",
        "authorizedSha256": "11066e395edf6582e115c4101414f28369602b4a64d612c5d604d8658e7a5f0d"
      },
      {
        "path": "docs/concept/runtime-workflows/learning-workflow.md",
        "priorAuthorizedSha256": "7bcc18c9c42949dc6b9bc2f3bcfc037f680cfe20ad8d2ae094422b9a91a38dd6",
        "authorizedSha256": "47914cfe3f2d3fac00b88c1e7563e20a2086bd4efe91b435d6336cad6be8bd7e"
      }
    ]
  },
  {
    "id": "2026-09-01-learner-owned-subject-plan-privacy-disclosure",
    "approvedAt": "2026-09-01",
    "approvedBy": "product-owner",
    "reason": "Accurately disclose the stored learner-owned subject schedules, the explicit direct-ID teacher copy, replacement continuity, and the learner-authorized plan-mode state effects.",
    "scope": "In the current first-party German and English privacy view and matching security documentation only, disclose that personal subject schedules and the default-off followLearningPlans preference are stored under the permanent SkillPilot ID; state the confirmed direct-ID teacher-copy boundary, the absence of a server-side teacher/class relationship or automatic synchronization, the open-only rule for newly introduced goal IDs and continuity rule for already stored IDs, learner export/import/retention/deletion ownership, deliberate first-goal start, the valid-plan completion-anchor gate, deterministic anchored-then-single-candidate handoff, fail-closed ambiguity/staleness/no-plan behavior, and suppression of generic Autopilot while plan mode remains enabled. Keep the existing permanent-ID full-access warning and the unchanged privacy URL; do not alter any runtime, OpenAI package, MCP/OAuth/tool/schema/resource/session/review-fixture, portal metadata, or review artifact.",
    "target": "current-production-first-party-learner-owned-subject-plan-privacy-policy",
    "frozenPluginVersion": "1.0.0",
    "portalReviewAction": "none-required-accurate-first-party-privacy-disclosure-for-product-owner-approved-plan-mode-with-no-v1-interface-review-fixture-or-portal-metadata-change",
    "protectedFile": {
      "path": "app/src/utils/privacyViewCopy.ts",
      "submittedSha256": "471f7cbdaf8c5a4db6ebddfad3ffebf54a8e2a44a253994f2ff258d02ba77f8b",
      "priorAuthorizedSha256": "1424f94d5087a368e45d064dcfde718a4f0958464a32e376f66dddee6fdeb7f4",
      "authorizedSha256": "84f888394310125ff1bdde6b0c7c35b881091eb3c22f50e6abb0cfe5534f6efc"
    },
    "evidenceFile": {
      "path": "app/src/utils/privacyViewCopy.test.ts",
      "priorSha256": "a34ce448d4d43d0aa91e6380e6905e375f6ed986e5db27942577f90e82a42a27",
      "sha256": "2940f594232022f90c3d562290c2fcbddf6bb85eda454d140e5d5c7d34f5388e"
    },
    "additionalFiles": [
      {
        "path": "docs/security/data-privacy.md",
        "priorAuthorizedSha256": "58e57689fc6a2329a53e1664df1de18971bf5a6498605723f0edca0d28683803",
        "authorizedSha256": "179f3acac510a36bffc7eb1c206df715f7cf714550f8f5d920f61c17b249aa08"
      }
    ]
  },
  {
    "id": "2026-09-01-trainer-course-owned-curriculum-selection",
    "approvedAt": "2026-09-01",
    "approvedBy": "product-owner",
    "reason": "Move Trainer curriculum and quality scope from the retired browser-global preselection into each local course, with fail-closed multi-root handling and recoverable curriculum loading.",
    "scope": "In the current production first-party Trainer WebGUI only, remove the retired browser-global Trainer curriculum context and quality filter, including on direct /trainer entry; let completed SessionSetup enter local course organization without a global curriculum; and require each locally stored ClassSession to choose and retain its own root curriculum, subject and applicable filter configuration. Load closures and display labels per course root; reject missing, mismatched, ambiguous or mixed-root existing-learner profiles before local save; abort in-flight profile, root-closure and generated-ID work when setup is cancelled or superseded; keep the local course list reachable when the runtime catalog or landscape overview fails; and give an active-course closure failure a recoverable route back to the unchanged local list without modifying saved course data. Preserve learner and explorer curriculum selection, browser-local class ownership, the absence of a server-side teacher/class relationship, the submitted ChatGPT launch handler, prepared-message and session semantics, and every OpenAI package, MCP/OAuth contract, tool, schema, annotation, instruction, resource, MCP Apps UI, review case, fixture, portal value, reviewer credential, demo and review-artifact byte.",
    "target": "current-production-first-party-trainer-local-course-curriculum-selection",
    "frozenPluginVersion": "1.0.0",
    "portalReviewAction": "none-required-product-owner-approved-trainer-only-per-course-curriculum-selection-with-unchanged-openai-v1-contract-review-flow-and-portal-data",
    "protectedFile": {
      "path": "app/src/components/SessionSetup.tsx",
      "submittedSha256": "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      "priorAuthorizedSha256": "df4ce08ff28f0a88e70752c1d05373ec37eab1e8af3e59334ab1a73a41169140",
      "authorizedSha256": "5f54736d03ec2ba4860894ecc4f13867d0b82728bad1953ef6958bfd63bccf1d"
    },
    "evidenceFile": {
      "path": "app/scripts/testSessionSetupCompletionUi.ts",
      "priorSha256": "afb66331e9bf1707195b1389d28bfe09839a9c3a130800bc207d6ed9602426fe",
      "sha256": "ba721f824f9e7ef45cca37e8261b09513e9cba486cfdb61cbe12d87fa4812713"
    },
    "additionalFiles": [
      {
        "path": "app/scripts/fixtures/existingLearnerClassSetupUi.tsx",
        "priorAuthorizedSha256": "48161cd1c8b1a3a992095403915c5e0bb2c0cb7432707eabaa0ad6c020c76f82",
        "authorizedSha256": "b2683a4ebfe52fec93b917ec6ad43ea75c960d18bc65f7841e9bcbac69647cff"
      },
      {
        "path": "app/scripts/fixtures/sessionSetupCompletionUi.tsx",
        "authorizedSha256": "bf443605173a8b700a5f794d49ee50a27751b8b0e90e1caa10f8399d9ffad3aa"
      },
      {
        "path": "app/scripts/testExistingLearnerClassSetupUi.ts",
        "priorAuthorizedSha256": "1dfd2c662a97f61f9a30c2d71f3e0d86f41188ff9d1e3653b250e1c991de1e62",
        "authorizedSha256": "7c7671224b93033047cace0c16ce80495ddc90cbc77b4db901a74353785b0ef1"
      },
      {
        "path": "app/scripts/testExistingLearnerTrainerUi.ts",
        "priorAuthorizedSha256": "f98613ce922ead852f5a3ae0d0bd9eb2c50712f559e127ed7bf6fdbfad531a85",
        "authorizedSha256": "7ab67cfdfe8583ed5e234dc0255b6b5350613d217afb714b362bc493b238bf92"
      },
      {
        "path": "app/scripts/testRootRoutePolicy.ts",
        "priorAuthorizedSha256": "d0699da8dacafaac489017ed49ab04fb1d5e8b66f38f30b4f03c25c5d49110ad",
        "authorizedSha256": "6a96e4a628f181cb4e7cd324a1c2a29baac3da5f54fafc9fff3c3ee4475752c4"
      },
      {
        "path": "app/scripts/testRuntimeCurriculumCatalog.ts",
        "authorizedSha256": "f4ee876a16d269e361ac13cad37505cf203cd974a72b4136220bb47d6c96d843"
      },
      {
        "path": "app/scripts/testTrainerGymnasiumScopeUi.ts",
        "authorizedSha256": "ea7fafb68df3aac09a12d56423913f51609df9b469426fac8b8f677f9b37bac2"
      },
      {
        "path": "app/src/App.tsx",
        "priorAuthorizedSha256": "06834054b5bd4c1b940ee78f174c0f5e8baa9fb90f0e17f9c648d5192dc2c618",
        "authorizedSha256": "8781db5376bbeaa2376a12b689135e881f53ae89e4d61141d64130dbec83db87"
      },
      {
        "path": "app/src/components/ClassSetup.tsx",
        "priorAuthorizedSha256": "ba1fd82e8c0da143a7fd973e702067467f2b8cf66f1e3e88a65ea17910616eea",
        "authorizedSha256": "04473d33aacd6d17f77c324df4bea3928bc1dd4bba500d55d06a5f01ca67776c"
      },
      {
        "path": "app/src/hooks/useAppCore.ts",
        "authorizedSha256": "b83fc7ac9144f35bf1d42e14c8eeea97a3c5ff9bd95bd4434ad2a6fc4d53c848"
      },
      {
        "path": "app/src/locales/de.ts",
        "priorAuthorizedSha256": "e1f30f7e1673c0993871edb238691e71d144455812a7ac975402b77d039eeef0",
        "authorizedSha256": "d47db38378fc83734e90b504ccf404feaec728e2600e195864e5b28f8deb8c2e"
      },
      {
        "path": "app/src/locales/en.ts",
        "priorAuthorizedSha256": "241e349c71816a76d4d3754a56791ea6a18b6391fe9f972c27de32fafa353da6",
        "authorizedSha256": "bca91fc65073d612a7953313ca9236593481daeba8361279b3172b9b67a22aff"
      },
      {
        "path": "app/src/utils/curriculumSetupCopy.ts",
        "priorAuthorizedSha256": "fb0f3ffa444b10eb55ad884148e6a66118c6b7d1f0b3530f5c259cbb243184aa",
        "authorizedSha256": "b470ac7af8f972786557c3056f7a801d80f45c8238b2e09f07672dd70215c491"
      },
      {
        "path": "app/src/utils/existingLearnerClass.test.ts",
        "priorAuthorizedSha256": "60803e7ccdda12a675701ad7620a43116837feae155dcd089873ec4b84cf30a2",
        "authorizedSha256": "761ce99f052199a04445b9ad2dbdf2ad18ab37d3e71917934474e8c2acdc92a9"
      },
      {
        "path": "app/src/utils/existingLearnerClass.ts",
        "priorAuthorizedSha256": "0d3526be7d170a66443310217302c68d6d9543c01857be7490ad6cd68b862439",
        "authorizedSha256": "30ac7f814b866a7ae0aadd1516934b092dfab119139ba6178e3d8a4bdf0b6da7"
      },
      {
        "path": "app/src/utils/landscapeClosure.ts",
        "authorizedSha256": "5f1b14a6cb3ed840fbace71ea57c91a1fc01a5ebcd05336ebd30f6d0013512de"
      },
      {
        "path": "app/src/utils/learnerProfile.ts",
        "authorizedSha256": "7acf0884156c51ad1e40c8f7601ddd106e6feaa245b1fd2f74959dfc9d4f0ab3"
      },
      {
        "path": "app/src/utils/runtimeCurriculumCatalog.ts",
        "authorizedSha256": "055fe3dc214ac0c22a63c2a7523e5b3cb61eac1c6c575821980655f91b85d12c"
      },
      {
        "path": "app/src/views/TrainerView.tsx",
        "priorAuthorizedSha256": "fbe5b254fd23e919901c35088d449fc777b2d5126566bb1348b6d201ce4918d1",
        "authorizedSha256": "9a780af40ef83610d3c5b5bddab58c8db04e0c89569b3016f8c7a2c7d579e517"
      },
      {
        "path": "docs/concept/didactic/curriculum-time-axis-and-pacing.md",
        "priorAuthorizedSha256": "75183008e51e4af60e46ca3ee7a99ac30d42a8b08e45652fbf239b0291f34356",
        "authorizedSha256": "620ef84058489f0856f45e7adcd7b1325feb19cb373bfa54ff0e1bc9a7f9f8eb"
      }
    ]
  },
  {
    "id": "2026-09-01-teacher-learner-course-planning-usability-hardening",
    "approvedAt": "2026-09-01",
    "approvedBy": "product-owner",
    "reason": "Make the already approved first-party teacher and learner course-planning flows robust, understandable, keyboard-operable, context-safe, and consistent about daily versus cumulative plan progress.",
    "scope": "In the current production first-party Trainer and learner Cockpit only, bind every local teacher plan to its class and complete current course context and remove all context variants when the class is deleted; make class cards keyboard-operable with separate labelled actions; distinguish saved from unsaved drafts; permit confirmed publication only from a still-calculable baseline-open atomic plan and invalidate stale confirmation; allow explicit non-future coverage dates while retaining an explicit through-today attestation; use Europe/Berlin dates with midnight and visibility refresh; expose learner daily due, daily already-mastered and daily-open values separately from the cumulative backlog, a canonical next-eligible-goal preview, urgency ordering, one central plan-mode control and an honest paused-Autopilot state; lock continuation on failed refresh or stale data; and use one cumulative rounding, deterministic block ordering and prerequisite-respecting fail-closed topological assignment contract across teacher publication and learner read models. Add only focused first-party tests and matching concept documentation. Preserve the permanent SkillPilot-ID bearer boundary, browser-local teacher plan ownership, explicit one-way confirmed copy with no automatic synchronization or server-side teacher/class relation, deliberate learner actions, default-off plan mode, no calendar-driven learner writes, and every submitted OpenAI package, MCP/OAuth contract, tool, schema, annotation, instruction, resource, MCP Apps UI, prepared message, ChatGPT launch, session, identity, locale, review case, fixture, portal value, reviewer credential, demo and review-artifact byte.",
    "target": "current-production-first-party-teacher-and-learner-course-planning-usability",
    "frozenPluginVersion": "1.0.0",
    "portalReviewAction": "none-required-product-owner-approved-first-party-course-planning-usability-hardening-with-unchanged-openai-v1-contract-review-flow-and-portal-data",
    "protectedFile": {
      "path": "app/src/views/LearnerView.tsx",
      "submittedSha256": "ec694882cdc5c9eb7e635723715a719f9588b0f2f06f8c57c579f060f7540ed7",
      "priorAuthorizedSha256": "dfc7fd5f131af9a556f25b87ad57b7a3d20809ede2275b8007ebb299152ca82b",
      "authorizedSha256": "85c5f1bc093d6111fbfb7b51f8903dd6fb3a93a063e5c8d3a44b22538c8944d4"
    },
    "evidenceFile": {
      "path": "app/scripts/testLearnerPlanCockpitUi.ts",
      "priorSha256": "95223838f0b322020432149eced7328a5bcc9fdf68df90cd5893bab2d4d87251",
      "sha256": "bf69dd9e1225051f531995f7c81a98c8b98e6cab2464c01bed536dd2066aeaf9"
    },
    "additionalFiles": [
      {
        "path": "app/package.json",
        "priorAuthorizedSha256": "e5618b82523e2266507da67487e851c478b3e458169e9c91bb49f29e9678f25e",
        "authorizedSha256": "eb9c13d41dc76c094b08b62c722cae344cfa2411f31951a038026e7d5c527f46"
      },
      {
        "path": "app/scripts/fixtures/learnerPlanCockpitUi.tsx",
        "priorAuthorizedSha256": "a1bf23093faec781704f55c2a3d925e4f71fa80d42e8f223b2e994197be273af",
        "authorizedSha256": "b2caf30b094c25a45438c6eb9232fb3a5cf28017c786df1e7b8a85aefb88a552"
      },
      {
        "path": "app/scripts/testExistingLearnerTrainerUi.ts",
        "priorAuthorizedSha256": "7ab67cfdfe8583ed5e234dc0255b6b5350613d217afb714b362bc493b238bf92",
        "authorizedSha256": "616fc99ac1c6565afa1ca9e7dae2922cd96f49533ed9f802e471b4e862cf22bd"
      },
      {
        "path": "app/scripts/testLearnerPlanTodayCardUi.tsx",
        "priorAuthorizedSha256": "f2b3fd6c2bc6d836d3fb372ff5e1b318e4ef8ac64548911e09f5cb33bf599562",
        "authorizedSha256": "6b9b20b3c780fc91b885f5ae39f38def82d0a8e42d5c0be608ab18dd17ac001d"
      },
      {
        "path": "app/scripts/testTrainerCoursePlanUi.ts",
        "priorAuthorizedSha256": "f55e08a6096e5056bd1d96ee093f661c8ee4034e114d8d8fd94a901002869dae",
        "authorizedSha256": "c4c63a5fbe70aea4562b582de6644b0baee79c83e74708bdb9795b364a48136b"
      },
      {
        "path": "app/src/components/CoursePlanPilotView.tsx",
        "priorAuthorizedSha256": "884f89bd679f53d35310ea1151c385ecb91b36f40d56cb5d427938711bc8a4ec",
        "authorizedSha256": "1fdc72ce0def7ca09cdf993b15d755aec35ed26c8dda90f75d74bd18b3e28d35"
      },
      {
        "path": "app/src/components/LearnerPlanTodayCard.tsx",
        "priorAuthorizedSha256": "dfd82855f913d140a1269c82ee4a0a9ed8f8d6a13c869b4aa1c28e8768199529",
        "authorizedSha256": "2ef8486a0cdf1157d09a8ebaead10017179a88dcaaf2b91939aa9defa82a1a11"
      },
      {
        "path": "app/src/components/PersonalCurriculumSetup.tsx",
        "priorAuthorizedSha256": "56d0eac142f1411ec7e4cabddadf0275cc04252948cd22f696ad310244793133",
        "authorizedSha256": "1ec556846267eeb544f1be90bea25a7069d5df621cc22dd896e7f9093ec6094d"
      },
      {
        "path": "app/src/learnerLearningPlanTypes.ts",
        "priorAuthorizedSha256": "876446dac081b8c367f68d06655676216e3836cd1fb9be3950d38b5e1c3653e4",
        "authorizedSha256": "a44b27d9d1761a1f6b12907f1205724f5d4544bd07cbcb881a3214f1187a66c4"
      },
      {
        "path": "app/src/utils/coursePlanCopy.ts",
        "priorAuthorizedSha256": "4bc9559cf3b51259afeaa066a2afa4c00731a3cb13a8300343272dae34fec6ce",
        "authorizedSha256": "9a6e2fb8e7190bf4ad46738beca518c953d97ec9dff30d7bc9003b9544654439"
      },
      {
        "path": "app/src/utils/curriculumSetupCopy.ts",
        "priorAuthorizedSha256": "b470ac7af8f972786557c3056f7a801d80f45c8238b2e09f07672dd70215c491",
        "authorizedSha256": "939a1e4603d82d325f278291e7c14b81bea5b8fa5ad5181f05d5d00617854a02"
      },
      {
        "path": "app/src/utils/learnerCoursePlanPublication.test.ts",
        "priorAuthorizedSha256": "2f18030461818a4853198b75025db558de1b611e9bcf65148ed859eae13602bc",
        "authorizedSha256": "4f60e3316d65f6dbc92fcb442b15a7bf4e2b7aed97ec5618584a5f2f947f089f"
      },
      {
        "path": "app/src/utils/learnerCoursePlanPublication.ts",
        "priorAuthorizedSha256": "27364171a2a4ddda1b63dfceab1a3ac96bef0cb410aa6e3098a0cb4be40681d9",
        "authorizedSha256": "1e78901e87d6894045aceac0c3961b5cb2508a877b9cfac23e2c208d68095a8a"
      },
      {
        "path": "app/src/utils/learnerLearningPlanApi.test.ts",
        "priorAuthorizedSha256": "5db6e68bef139635ce8817189621da439ad1f4e24b918db8024dfd257e9c6c84",
        "authorizedSha256": "5a68c747e85301185274f070cb680710c881e9a27974a1d2b0414893a2500787"
      },
      {
        "path": "app/src/utils/learnerLearningPlanApi.ts",
        "priorAuthorizedSha256": "db5006459c8df1faddf2f05d7623a6add306aba384b71c48df51f26e1ef7c58d",
        "authorizedSha256": "3b28b3d41ad202a460a00149811053e68866afe91b134f7eadb025e67384e2ed"
      },
      {
        "path": "app/src/utils/learnerLearningPlanCopy.ts",
        "priorAuthorizedSha256": "bfa1d9ab24e9a2e1fb22d7ce7f182df7a9cdf4fd6d933a8fdf5bae4d335819d7",
        "authorizedSha256": "1b12315671b1a8f9878aaef58f05af028f140ad2aadd38bbdc86bc7dd8ee1506"
      },
      {
        "path": "app/src/utils/learnerLearningPlanReadModel.ts",
        "priorAuthorizedSha256": "f0b9292e2796fab0eb0c4168b02074d5181c7a34db7f24b68022095975f317bc",
        "authorizedSha256": "5260ac9c222f82101983f04e6235eb2c1eed825813a02dfd2bb02eb69a884c23"
      },
      {
        "path": "app/src/utils/localTeacherCoursePlan.test.ts",
        "priorAuthorizedSha256": "ff52502a72612c8f696a064b6caa64ea1b85ef9416fa07a0a21b6d55bdaef0e7",
        "authorizedSha256": "165947dabb5affecd4d013c20e3dea27e1dcf5a9cbd6e46579f81aa787a50a62"
      },
      {
        "path": "app/src/utils/localTeacherCoursePlan.ts",
        "priorAuthorizedSha256": "fac1c4031f182ea7cbf35c7bbefe1e8d615a855a7f643e5eec25afbefc03f800",
        "authorizedSha256": "24115a036ea49ed0be9f0bcb1d96ece5381f026be42ba15f9864f16994fcdc90"
      },
      {
        "path": "app/src/utils/teacherCoursePlanContext.test.ts",
        "authorizedSha256": "4b7f70c6b880be922111181a8a631db50adf436d15c9fc0e5464f3a76e64a449"
      },
      {
        "path": "app/src/utils/teacherCoursePlanContext.ts",
        "authorizedSha256": "f17991db7d524169b48f4a3b8586352f65b3f7caf981907981b4eb01d4cd673a"
      },
      {
        "path": "app/src/views/TrainerView.tsx",
        "priorAuthorizedSha256": "9a780af40ef83610d3c5b5bddab58c8db04e0c89569b3016f8c7a2c7d579e517",
        "authorizedSha256": "67820493aae77176a5959cd35c9e73f2c5b93d565f991c77e03036f10236d9b5"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/api/LearnerLearningPlanApi.java",
        "priorAuthorizedSha256": "25485ade73d2c14deffb9efe3c302c572de63d0db7a2926265d10dd7b5ef37b7",
        "authorizedSha256": "19e62dc1ab9a816d700b9f2afd319814deedd7e03b311e8edc854e4fe43af4d4"
      },
      {
        "path": "backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java",
        "priorAuthorizedSha256": "13a5d46a5fdbe67909ddbad407ad03b516ac41c703f359de03c25599f38e2772",
        "authorizedSha256": "64b38f0c1f25b6fccdfa1409cd293839ddfacef8a616ae40bd060ec94fe04ac8"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/service/LearnerLearningPlanServiceIntegrationTest.java",
        "priorAuthorizedSha256": "2dd02a269ee7c077f499b0e69ee3b5ef43f716f9201b862e2ace8f38bfb8687b",
        "authorizedSha256": "af5a0588187c9a5973d68fd442efb6e8ecb7ececec4014ffa5f0c83fa10baad7"
      },
      {
        "path": "backend/src/test/java/com/skillpilot/backend/ui/LearnerLearningPlanControllerHttpTest.java",
        "priorAuthorizedSha256": "7030df892748efa6c9e8cd06ea6bbf25d367f60532ccd74840f8ad29ab5e292d",
        "authorizedSha256": "e7629f43fe64c1e779784a85d3e4d19f359cb3b06dc259d5ffabad9e90fa580c"
      },
      {
        "path": "docs/concept/didactic/curriculum-time-axis-and-pacing.md",
        "priorAuthorizedSha256": "620ef84058489f0856f45e7adcd7b1325feb19cb373bfa54ff0e1bc9a7f9f8eb",
        "authorizedSha256": "0fd1e0d420f28ac29fc163bab8ccfe818137e11dfdca82cea578542eacde652f"
      }
    ]
  },
  {
    "id": "2026-09-01-evolvable-public-landing-effect-boundary",
    "approvedAt": "2026-09-01",
    "approvedBy": "product-owner",
    "reason": "Allow the public root-page information architecture and presentation to evolve without weakening the frozen first-party start contract.",
    "scope": "In the current production first-party root page only, extract the public landing panels, footer and their presentation copy behind one stable SessionSetup composition seam; declare exactly those three files as a capability-poor evolvable presentation island; pass only language, the protected access-status copy and the three fixed role-entry callbacks; enforce no network, persistence, cookies, browser-window or global capabilities, provider URLs, direct learner/trainer/explorer/plugin routes, or Coach, Terms, ID, learner-data, profile or session imports; and bind one stable browser contract plus its CI invocation. Preserve the hash-bound SessionSetup controller and composition seam, truthful provider-access status, Terms/ID gate, ChatGPT and Claude handlers, prepared messages, session lifecycle, package, MCP/OAuth, tools, schemas, annotations, instructions, resources, MCP Apps UI, review cases, fixtures, portal values, reviewer credentials, demo and review artifacts.",
    "target": "current-production-first-party-public-root-presentation",
    "frozenPluginVersion": "1.0.0",
    "portalReviewAction": "none-required-presentation-only-effect-boundary-no-submitted-openai-contract-or-review-flow-effect",
    "protectedFile": {
      "path": "app/src/components/SessionSetup.tsx",
      "submittedSha256": "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      "priorAuthorizedSha256": "5f54736d03ec2ba4860894ecc4f13867d0b82728bad1953ef6958bfd63bccf1d",
      "authorizedSha256": "d78a8e0aebae245fee604c8b8102f26cd37ffb96542267ce668f8b38a31eebc6"
    },
    "evidenceFile": {
      "path": "app/scripts/testPublicLandingContractUi.tsx",
      "sha256": "904ee9e68c32c92e78782999c15f142393c09c97a0506c371911b1ce6ef99c5e"
    },
    "additionalFiles": [
      {
        "path": "AGENTS.md",
        "authorizedSha256": "8a4b34bc7532d3989026ea18525a3a46565cd44b30d51b9ef6c236fdbf25ac27"
      },
      {
        "path": ".github/workflows/ci.yml",
        "priorAuthorizedSha256": "50965b7b10fab102463817766d866d2beed01e2d52737752e3d79cf73c421ae5",
        "authorizedSha256": "6324e43b893dd036c5c4449a77b3ec7a10dc81727e7d26071f2df6271c2494d5"
      },
      {
        "path": "app/package.json",
        "priorAuthorizedSha256": "eb9c13d41dc76c094b08b62c722cae344cfa2411f31951a038026e7d5c527f46",
        "authorizedSha256": "5fcc8ac9a8b9a6577401e5dfb2521080f2297214eec1958fd0c93fe96aa2fdbd"
      },
      {
        "path": "app/scripts/fixtures/sessionSetupCompletionUi.tsx",
        "priorAuthorizedSha256": "bf443605173a8b700a5f794d49ee50a27751b8b0e90e1caa10f8399d9ffad3aa",
        "authorizedSha256": "4c63fc282067198ab65feaa682cb668a30a688b40020bc606261c5f373335aea"
      },
      {
        "path": "app/scripts/testClaudeV1StartUi.tsx",
        "priorAuthorizedSha256": "5e833c8525919254db82e3e6d127c00911ec4a8d10408f8216a51d109f66fc8f",
        "authorizedSha256": "a4c9b885e378ac5f91b823d0791951ef17ac45a6d0d0cf64f3def6cd9311eb6c"
      },
      {
        "path": "app/scripts/testPublicOverviewUi.tsx",
        "priorAuthorizedSha256": "fe66f2148c198663aa671ce1a1eea4ccdf57b23bfdb4f20287c0c42a832ef757",
        "authorizedSha256": "4ab7eb14cf8154a617baee7d49db3d7b4090f035cde7c13a2818f0f2c9270b4b"
      },
      {
        "path": "app/scripts/testSessionSetupCompletionUi.ts",
        "priorAuthorizedSha256": "ba721f824f9e7ef45cca37e8261b09513e9cba486cfdb61cbe12d87fa4812713",
        "authorizedSha256": "a8fc5ce9b8a25a55c6723b5a87310272918a32038345c4f7971d2cf298a05b4f"
      },
      {
        "path": "docs/deploy/openai-plugin-v1-review-freeze.md",
        "authorizedSha256": "9197d07577a3c5bc08d3f8c925c44e4650505218293f642e59c3d90b67889f5f"
      }
    ]
  },
  {
    "id": "2026-09-01-public-landing-interaction-alignment",
    "approvedAt": "2026-09-01",
    "approvedBy": "product-owner",
    "reason": "Align the public landing panels and actions with the established overview interaction language, add distinct semantic panel accents and remove the redundant visible quickstart hero line.",
    "scope": "In the current production first-party public root only, align the landing action pills with the existing overview pill geometry and icon-plus-text presentation; keep Learn now visibly primary with contrast-safe states; make each of the four equal panels a level-two section with one decorative heading icon; align their hover and focus-within border, shadow and heading reactions while distinguishing learning in sky, overview in emerald, course planning in violet and curricula in amber; keep footer states contrast-safe; and remove only the redundant visible five-minute hero line from SessionSetup while retaining the localized copy for the document title and the explicit Quickstart action and route. Preserve the evolvable presentation island capability boundary and exact props, the protected access-status statement, the three callback entries and shared Terms/ID gate, ChatGPT and Claude handlers, prepared messages, session and learner-state semantics, package, MCP/OAuth, tools, schemas, annotations, instructions, resources, MCP Apps UI, review cases, fixtures, portal values, reviewer credentials, demo and review artifacts.",
    "target": "current-production-first-party-public-root-presentation",
    "frozenPluginVersion": "1.0.0",
    "portalReviewAction": "none-required-public-landing-presentation-alignment-no-submitted-openai-contract-or-review-flow-effect",
    "protectedFile": {
      "path": "app/src/components/SessionSetup.tsx",
      "submittedSha256": "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      "priorAuthorizedSha256": "d78a8e0aebae245fee604c8b8102f26cd37ffb96542267ce668f8b38a31eebc6",
      "authorizedSha256": "b1ce7a490494df6a72dff7369ad8573dbf1b3b56e7b7643109d621bcf94fe8fa"
    },
    "evidenceFile": {
      "path": "app/scripts/testPublicLandingContractUi.tsx",
      "priorSha256": "904ee9e68c32c92e78782999c15f142393c09c97a0506c371911b1ce6ef99c5e",
      "sha256": "0b1fe8ddcd5b39bd43ae54f9579899524730e01ce79058a452e41afeb0f8348a"
    },
    "additionalFiles": [
      {
        "path": "app/src/components/SkillPilotOverviewCard.tsx",
        "priorAuthorizedSha256": "16329baefd5fbbf5d733253508a57661c67e0ba5d49583f6cec119fe5695a77a",
        "authorizedSha256": "905dd38a60374992ce368260d13dc44d446c263b5ee9585eae0eee9d947ec055"
      },
      {
        "path": "docs/deploy/openai-plugin-v1-review-freeze.md",
        "priorAuthorizedSha256": "9197d07577a3c5bc08d3f8c925c44e4650505218293f642e59c3d90b67889f5f",
        "authorizedSha256": "74fea13fe25d82b70292f1943b79c7955ce366c1f33cd4dc2b07c9616d3f6c76"
      }
    ]
  }
];

const expectedAuthorizedCopyClarifications = [
  {
    id: "2026-08-25-coach-access-availability-banner",
    approvedAt: "2026-08-25",
    approvedBy: "product-owner",
    reason:
      "State the currently usable coach access truthfully in the public start and comparison guidance: only the Claude beta is available, a paid Claude plan is required, Claude Pro is currently supported and tested, and ChatGPT still awaits approval and is not usable.",
    scope:
      "Change only the German and English provider-availability copy on the public start page and access comparison plus their regression evidence; " +
      "preserve both provider handlers, prepared messages, session semantics, packages, MCP/OAuth/tools/schemas/UI, " +
      "review cases, portal values, fixtures and review artifacts.",
    target: "current-production-web-frontend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-truthful-current-availability-copy-no-submitted-openai-contract-or-review-flow-effect",
    files: [
      {
        path: "app/src/locales/de.ts",
        sha256:
          "e1f30f7e1673c0993871edb238691e71d144455812a7ac975402b77d039eeef0",
      },
      {
        path: "app/src/locales/en.ts",
        sha256:
          "241e349c71816a76d4d3754a56791ea6a18b6391fe9f972c27de32fafa353da6",
      },
      {
        path: "app/scripts/testRootRoutePolicy.ts",
        priorSha256:
          "b9d399e5bf42a8b8ba4a48cffd7d89edeb16bde52b7d89a5e9747ee8e2d666e4",
        sha256:
          "d0699da8dacafaac489017ed49ab04fb1d5e8b66f38f30b4f03c25c5d49110ad",
      },
      {
        path: "app/src/utils/coachProviderMatrixCopy.ts",
        sha256:
          "2c24a78b60d0556e194799e5c531f319d4419f68f7ca7b0945b311f551f6da2c",
      },
      {
        path: "app/src/utils/coachProviderMatrixCopy.test.ts",
        sha256:
          "3dfc8be12202ddb545eec44b0e5860e5d2d8008f1fce27060e7f9ed6a19fb1e1",
      },
    ],
  },
  {
    id: "2026-08-25-claude-plugin-complete-setup-guidance",
    approvedAt: "2026-08-25",
    approvedBy: "product-owner",
    reason:
      "Remove practical setup blockers by documenting the complete supported Claude Web update path: download the current file, remove only old SkillPilot plugin entries, upload and enable the current package, connect the bundled SkillPilot connector through Claude's authorization flow, and return to SkillPilot.",
    scope:
      "Change only the German and English complete-setup copy and its presentation on the first-party /plugins guide plus the focused publication regression; " +
      "preserve the plugin archive/index/download URL, bundled connector declaration and endpoint, Claude/OpenAI handlers, prepared messages, session semantics, packages, " +
      "MCP/OAuth/tools/schemas/MCP-Apps-UI, review cases, portal values, fixtures and review artifacts.",
    target: "current-production-web-frontend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-claude-only-complete-installation-guidance-no-submitted-openai-contract-or-review-flow-effect",
    files: [
      {
        path: "app/src/views/PluginCatalogView.tsx",
        sha256:
          "548aa480c96d76d1a2f9403c4631a74d6d891565c62a0b5197fd59e4092a8e5a",
      },
      {
        path: "app/src/utils/claudePluginPublication.test.ts",
        sha256:
          "f6efd1d17ff352bbd4943d967577eab475a636515949d159505b066a7936a6c2",
      },
    ],
  },
];

const expectedEvolvablePresentationIslands = [
  {
    id: "public-landing-presentation-v1",
    owner: "first-party-webgui",
    effectBoundary:
      "presentation-only-no-network-storage-browser-window-provider-or-start-contract-access",
    compositionFile: "app/src/components/SessionSetup.tsx",
    compositionRequirements: [
      "import { PublicLandingPanels } from './PublicLandingPanels'",
      "import { PublicLandingFooter } from './PublicLandingFooter'",
      "onStartLearning={openLearnerStart}",
      "onOpenCoursePlanning={() => openRoleStart('trainer')}",
      "onExploreSkillGraph={() => openRoleStart('explorer')}",
    ],
    files: [
      {
        path: "app/src/components/PublicLandingPanels.tsx",
        propsInterface: "PublicLandingPanelsProps",
        allowedProps: [
          "accessBanner",
          "language",
          "onExploreSkillGraph",
          "onOpenCoursePlanning",
          "onStartLearning",
        ],
        capabilityProps: [
          "onExploreSkillGraph",
          "onOpenCoursePlanning",
          "onStartLearning",
        ],
        allowedImports: [
          "../utils/filterLabels",
          "../utils/publicLandingCopy",
          "./SkillPilotOverviewCard",
          "lucide-react",
          "react",
          "react-router-dom",
        ],
      },
      {
        path: "app/src/components/PublicLandingFooter.tsx",
        propsInterface: "PublicLandingFooterProps",
        allowedProps: ["language"],
        capabilityProps: [],
        allowedImports: [
          "../utils/filterLabels",
          "../utils/publicLandingCopy",
          "react",
          "react-router-dom",
        ],
      },
      {
        path: "app/src/utils/publicLandingCopy.ts",
        allowedImports: ["./filterLabels"],
      },
    ],
    forbiddenSourcePatterns: [
      {
        label: "network request",
        pattern: "\\bfetch\\s*\\(|\\b(?:XMLHttpRequest|WebSocket|EventSource)\\s*\\(",
      },
      {
        label: "browser persistence or cookies",
        pattern: "\\b(?:localStorage|sessionStorage|indexedDB)\\b|document\\s*\\.\\s*cookie",
      },
      {
        label: "browser window or global capability",
        pattern: "\\b(?:window|globalThis|navigator|document|location)\\s*(?:\\.|\\[)",
      },
      {
        label: "provider URL or API endpoint",
        pattern: "(?:chatgpt\\.com|claude\\.ai|\\/api\\/)",
      },
      {
        label: "learner identity, prepared message or session token",
        pattern: "\\b(?:skillpilotId|learningSessionId|preparedMessage|sessionToken)\\b",
      },
      {
        label: "direct protected application route",
        pattern: "(?:to|href)\\s*=\\s*[^\\s>]{0,2}\\/(?:learner|trainer|explorer|plugins)(?:[\\/?#]|\\b)",
      },
      {
        label: "router state or imperative navigation",
        pattern: "\\b(?:useLocation|useSearchParams|useNavigate|useHref|useResolvedPath|useParams|useMatch|useNavigation|useRouteLoaderData|useLoaderData|useFetcher|useSubmit)\\s*\\(|<\\s*Navigate\\b|\\bredirect\\s*\\(",
      },
      {
        label: "dynamic code or dependency loading",
        pattern: "\\b(?:eval|Function|require)\\s*\\(|\\bimport\\s*\\(",
      },
      {
        label: "raw HTML injection",
        pattern: "\\bdangerouslySetInnerHTML\\b",
      },
    ],
    forbiddenImportFragments: [
      "api",
      "chatstart",
      "claude",
      "coach",
      "legalterms",
      "learnerdata",
      "learnerprofile",
      "session",
      "skillpilotid",
    ],
    evidenceFile: "app/scripts/testPublicLandingContractUi.tsx",
  },
];

const extractStaticImportSources = (source) => {
  const imports = [];
  const pattern = /\bimport\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/gu;
  for (const match of source.matchAll(pattern)) imports.push(match[1]);
  return imports;
};

const extractInterfacePropertyNames = (source, interfaceName) => {
  const marker = `interface ${interfaceName}`;
  const markerIndex = source.indexOf(marker);
  assert.notEqual(markerIndex, -1, `Missing presentation props interface ${interfaceName}.`);
  const openBraceIndex = source.indexOf("{", markerIndex + marker.length);
  assert.notEqual(openBraceIndex, -1, `Missing opening brace for ${interfaceName}.`);
  let depth = 0;
  let closeBraceIndex = -1;
  for (let index = openBraceIndex; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        closeBraceIndex = index;
        break;
      }
    }
  }
  assert.notEqual(closeBraceIndex, -1, `Missing closing brace for ${interfaceName}.`);
  const body = source.slice(openBraceIndex + 1, closeBraceIndex);
  return [...body.matchAll(/^\s*([A-Za-z_$][\w$]*)\??\s*:/gmu)]
    .map((match) => match[1]);
};

export function assertEvolvablePresentationIslands({
  repositoryRoot = defaultRepositoryRoot,
  islands,
} = {}) {
  assert.equal(Array.isArray(islands), true, "Evolvable presentation islands must be an array.");
  const islandIds = new Set();
  const presentationPaths = new Set();

  for (const island of islands) {
    assert.equal(islandIds.has(island.id), false, `Duplicate presentation island id: ${island.id}`);
    islandIds.add(island.id);
    assert.equal(Array.isArray(island.files), true, `Presentation island lacks files: ${island.id}`);
    assert.equal(
      Array.isArray(island.forbiddenSourcePatterns),
      true,
      `Presentation island lacks forbidden effects: ${island.id}`,
    );

    const compositionPath = safeRepositoryPath(repositoryRoot, island.compositionFile);
    const compositionSource = readFileSync(compositionPath, "utf8");
    for (const snippet of island.compositionRequirements ?? []) {
      assert.equal(
        compositionSource.includes(snippet),
        true,
        `Protected landing composition changed or lost capability binding: ${snippet}`,
      );
    }

    for (const file of island.files) {
      assert.equal(
        presentationPaths.has(file.path),
        false,
        `Presentation file belongs to multiple islands: ${file.path}`,
      );
      presentationPaths.add(file.path);
      const absolutePath = safeRepositoryPath(repositoryRoot, file.path);
      const fileStat = lstatSync(absolutePath);
      assert.equal(fileStat.isSymbolicLink(), false, `Presentation island file is a symlink: ${file.path}`);
      assert.equal(fileStat.isFile(), true, `Presentation island entry is not a file: ${file.path}`);
      const source = readFileSync(absolutePath, "utf8");
      const imports = extractStaticImportSources(source);
      const allowedImports = new Set(file.allowedImports ?? []);
      for (const importSource of imports) {
        assert.equal(
          allowedImports.has(importSource),
          true,
          `Presentation island imports a non-presentational capability: ${file.path} -> ${importSource}`,
        );
        const normalizedImport = importSource.toLowerCase().replace(/[^a-z0-9]/gu, "");
        for (const fragment of island.forbiddenImportFragments ?? []) {
          assert.equal(
            normalizedImport.includes(fragment),
            false,
            `Presentation island imports protected ${fragment} code: ${file.path} -> ${importSource}`,
          );
        }
      }
      for (const forbidden of island.forbiddenSourcePatterns) {
        assert.equal(
          new RegExp(forbidden.pattern, "u").test(source),
          false,
          `Presentation island contains forbidden ${forbidden.label}: ${file.path}`,
        );
      }
      if (file.propsInterface) {
        const actualProps = extractInterfacePropertyNames(source, file.propsInterface).sort();
        assert.deepEqual(
          actualProps,
          [...file.allowedProps].sort(),
          `Presentation island capability surface changed: ${file.path} ${file.propsInterface}`,
        );
        const capabilityProps = new Set(file.capabilityProps ?? []);
        for (const prop of actualProps) {
          const functionPropPattern = new RegExp(`^\\s*${prop}\\??\\s*:\\s*\\([^)]*\\)\\s*=>`, "mu");
          assert.equal(
            functionPropPattern.test(source),
            capabilityProps.has(prop),
            `Presentation island function capability changed: ${file.path} ${prop}`,
          );
        }
      }
    }
  }
}

export function resolveAuthorizedRuntimeExceptionChains(
  protectedFiles,
  authorizedRuntimeExceptions,
) {
  assert.equal(Array.isArray(protectedFiles), true, "Protected files must be an array.");
  assert.equal(
    Array.isArray(authorizedRuntimeExceptions),
    true,
    "Authorized runtime exceptions must be an array.",
  );
  const protectedByPath = new Map(
    protectedFiles.map((entry) => [entry.path, entry]),
  );
  const latestByPath = new Map();
  const exceptionIds = new Set();

  for (const exception of authorizedRuntimeExceptions) {
    assert.equal(
      exceptionIds.has(exception.id),
      false,
      `Duplicate authorized runtime exception id: ${exception.id}`,
    );
    exceptionIds.add(exception.id);

    const protectedFile = exception.protectedFile;
    if (!protectedFile) {
      assert.equal(
        exception.supplementalOnly,
        true,
        `Authorized runtime exception lacks a protected file without an explicit supplemental-only boundary: ${exception.id}`,
      );
      assert.equal(
        Boolean(exception.additionalFile) || (exception.additionalFiles?.length ?? 0) > 0,
        true,
        `Supplemental-only runtime exception lacks pinned files: ${exception.id}`,
      );
      continue;
    }
    assert.notEqual(
      exception.supplementalOnly,
      true,
      `Authorized runtime exception with a protected file cannot be supplemental-only: ${exception.id}`,
    );
    const submittedFile = protectedByPath.get(protectedFile?.path);
    assert.ok(
      submittedFile,
      `Authorized runtime exception targets an unprotected file: ${protectedFile?.path}`,
    );
    assert.equal(
      protectedFile.submittedSha256,
      submittedFile.sha256,
      `Authorized runtime exception changed the submitted baseline: ${protectedFile.path}`,
    );
    assert.match(
      protectedFile.authorizedSha256,
      /^[0-9a-f]{64}$/u,
      `Authorized runtime exception has an invalid digest: ${exception.id}`,
    );

    const priorException = latestByPath.get(protectedFile.path);
    if (priorException) {
      assert.equal(
        protectedFile.priorAuthorizedSha256,
        priorException.protectedFile.authorizedSha256,
        `Authorized runtime exception chain is discontinuous: ${exception.id}`,
      );
    } else {
      assert.equal(
        Object.hasOwn(protectedFile, "priorAuthorizedSha256"),
        false,
        `First authorized runtime exception must start at the submitted baseline: ${exception.id}`,
      );
    }
    latestByPath.set(protectedFile.path, exception);
  }

  return latestByPath;
}

export function resolveAuthorizedSupplementalFileChains(
  authorizedRuntimeExceptions,
  authorizedCopyClarifications = [],
) {
  assert.equal(
    Array.isArray(authorizedRuntimeExceptions),
    true,
    "Authorized runtime exceptions must be an array.",
  );
  assert.equal(
    Array.isArray(authorizedCopyClarifications),
    true,
    "Authorized copy clarifications must be an array.",
  );
  const latestByPath = new Map();

  for (const clarification of authorizedCopyClarifications) {
    assert.equal(
      Array.isArray(clarification.files),
      true,
      `Authorized copy clarification lacks pinned files: ${clarification.id}`,
    );
    for (const file of clarification.files) {
      assert.equal(
        typeof file.path,
        "string",
        `Authorized copy clarification file lacks a path: ${clarification.id}`,
      );
      assert.match(
        file.sha256,
        /^[0-9a-f]{64}$/u,
        `Authorized copy clarification file has an invalid digest: ${file.path}`,
      );
      const prior = latestByPath.get(file.path);
      if (prior && prior.authorizedSha256 !== file.sha256) {
        assert.equal(
          file.priorSha256,
          prior.authorizedSha256,
          `Authorized copy clarification file chain is discontinuous: ${file.path}`,
        );
      }
      latestByPath.set(file.path, {
        path: file.path,
        authorizedSha256: file.sha256,
      });
    }
  }

  for (const exception of authorizedRuntimeExceptions) {
    const files = [
      ...(exception.evidenceFile
        ? [{
            ...exception.evidenceFile,
            authorizedSha256: exception.evidenceFile.sha256,
          }]
        : []),
      ...(exception.additionalFile ? [exception.additionalFile] : []),
      ...(exception.additionalFiles ?? []),
    ];
    for (const file of files) {
      assert.equal(
        typeof file.path,
        "string",
        `Authorized supplemental file lacks a path: ${exception.id}`,
      );
      const isDeleted = file.deleted === true;
      assert.equal(
        isDeleted || typeof file.authorizedSha256 === "string",
        true,
        `Authorized supplemental file lacks a digest or deletion marker: ${file.path}`,
      );
      assert.equal(
        isDeleted && Object.hasOwn(file, "authorizedSha256"),
        false,
        `Deleted supplemental file must not claim an authorized digest: ${file.path}`,
      );
      if (!isDeleted) {
        assert.match(
          file.authorizedSha256,
          /^[0-9a-f]{64}$/u,
          `Authorized supplemental file has an invalid digest: ${file.path}`,
        );
      }
      const prior = latestByPath.get(file.path);
      const claimedPriorSha256 =
        file.priorAuthorizedSha256 ?? (prior ? file.priorSha256 : undefined);
      assert.equal(
        prior?.deleted === true,
        false,
        `A deleted supplemental file cannot be reintroduced in the frozen V1 line: ${file.path}`,
      );
      if (prior && (isDeleted || prior.authorizedSha256 !== file.authorizedSha256)) {
        assert.equal(
          claimedPriorSha256,
          prior.authorizedSha256,
          `Authorized supplemental file chain is discontinuous: ${file.path}`,
        );
      } else if (
        prior &&
        Object.hasOwn(file, "priorAuthorizedSha256")
      ) {
        assert.equal(
          claimedPriorSha256,
          prior.authorizedSha256,
          `Authorized supplemental file repeats the wrong prior digest: ${file.path}`,
        );
      } else if (!prior) {
        assert.equal(
          Object.hasOwn(file, "priorAuthorizedSha256"),
          false,
          `First authorized supplemental file entry must not claim a prior digest: ${file.path}`,
        );
      }
      latestByPath.set(file.path, file);
    }
  }

  return latestByPath;
}

export function loadOpenAiPluginReviewFreeze(
  repositoryRoot = defaultRepositoryRoot,
) {
  const freezePath = resolve(repositoryRoot, reviewFreezeRelativePath);
  assert.equal(
    existsSync(freezePath),
    true,
    `Missing OpenAI V1 review freeze record ${reviewFreezeRelativePath}.`,
  );
  return JSON.parse(readFileSync(freezePath, "utf8"));
}

export function assertOpenAiPluginReleaseMutationAllowed({
  repositoryRoot = defaultRepositoryRoot,
  pluginIdentity,
  pluginVersion,
  command,
}) {
  const freeze = loadOpenAiPluginReviewFreeze(repositoryRoot);
  throw new Error(
    `OpenAI review freeze is active for ${pluginIdentity} ${pluginVersion}. ` +
      `The release mutation ${command} is forbidden while the recorded ` +
      `submission ${freeze.pluginIdentity ?? "UNKNOWN"} ` +
      `${freeze.pluginVersion ?? "UNKNOWN"} has freeze state ` +
      `${freeze.portalReviewState ?? "UNKNOWN"}. Read ` +
      "docs/deploy/openai-plugin-v1-review-freeze.md and obtain an explicit, " +
      "scoped product-owner unfreeze before changing the review contract.",
  );
}

export function verifyOpenAiPluginReviewFreeze({
  repositoryRoot = defaultRepositoryRoot,
} = {}) {
  const freeze = loadOpenAiPluginReviewFreeze(repositoryRoot);
  assert.equal(freeze.schemaVersion, 1, "Unsupported review-freeze schemaVersion.");
  assert.equal(freeze.pluginIdentity, "skillpilot-coach-v1");
  assert.equal(freeze.pluginVersion, "1.0.0");
  assert.equal(
    freeze.portalReviewState,
    "IN_REVIEW",
    "The V1 review freeze may change state only through the documented product-owner procedure.",
  );
  assert.match(freeze.enteredAt, /^\d{4}-\d{2}-\d{2}$/u);
  assert.match(freeze.submittedSourceCommit, /^[0-9a-f]{40}$/u);
  assert.match(freeze.frozenSnapshotManifestSha256, /^[0-9a-f]{64}$/u);
  assert.match(freeze.pluginArchiveSha256, /^[0-9a-f]{64}$/u);
  assert.match(freeze.exportedContractSha256, /^[0-9a-f]{64}$/u);
  assert.match(freeze.reviewVideoSha256, /^[0-9a-f]{64}$/u);
  assert.equal(
    freeze.publicMcpEndpoint,
    "https://mcp-coach-v1.skillpilot.com/mcp",
  );
  assert.equal(
    freeze.reviewVideoUrl,
    "https://skillpilot.com/api/public/openai/review/skillpilot-coach-v1/" +
      "1.0.0/sha256-20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb.mp4",
  );
  assert.equal(
    freeze.unfreezeRequires,
    "explicit-product-owner-approval-with-reason-scope-and-target-version",
  );
  assert.deepEqual(
    freeze.authorizedRuntimeExceptions,
    expectedAuthorizedRuntimeExceptions,
    "Review-time runtime exceptions must match the explicitly approved, hash-pinned scope.",
  );
  assert.deepEqual(
    freeze.authorizedCopyClarifications,
    expectedAuthorizedCopyClarifications,
    "Review-time copy clarifications must match the explicitly approved, hash-pinned scope.",
  );
  assert.deepEqual(
    freeze.evolvablePresentationIslands,
    expectedEvolvablePresentationIslands,
    "Evolvable presentation islands must match the explicitly approved effect boundary.",
  );
  assertEvolvablePresentationIslands({
    repositoryRoot,
    islands: expectedEvolvablePresentationIslands,
  });
  for (const clarification of expectedAuthorizedCopyClarifications) {
    assert.equal(
      clarification.files.length > 0,
      true,
      `Authorized copy clarification lacks pinned files: ${clarification.id}`,
    );
  }
  assert.equal(Array.isArray(freeze.protectedTrees), true);
  assert.equal(Array.isArray(freeze.protectedFiles), true);

  const latestAuthorizedExceptionByPath = resolveAuthorizedRuntimeExceptionChains(
    freeze.protectedFiles,
    expectedAuthorizedRuntimeExceptions,
  );
  const latestAuthorizedSupplementalFileByPath = resolveAuthorizedSupplementalFileChains(
    expectedAuthorizedRuntimeExceptions,
    expectedAuthorizedCopyClarifications,
  );
  const submittedProtectedPaths = new Set(
    freeze.protectedFiles.map(({ path }) => path),
  );
  for (const island of expectedEvolvablePresentationIslands) {
    assert.equal(
      submittedProtectedPaths.has(island.compositionFile),
      true,
      `Presentation island composition seam is not protected: ${island.compositionFile}`,
    );
    assert.equal(
      latestAuthorizedExceptionByPath.has(island.compositionFile),
      true,
      `Presentation island composition seam lacks an authorized current hash: ${island.compositionFile}`,
    );
    for (const file of island.files) {
      assert.equal(
        submittedProtectedPaths.has(file.path),
        false,
        `Evolvable presentation file is incorrectly byte-frozen: ${file.path}`,
      );
      assert.equal(
        latestAuthorizedSupplementalFileByPath.has(file.path),
        false,
        `Evolvable presentation file is incorrectly hash-pinned: ${file.path}`,
      );
    }
    const evidence = latestAuthorizedSupplementalFileByPath.get(island.evidenceFile);
    assert.ok(evidence, `Presentation island lacks pinned browser evidence: ${island.evidenceFile}`);
    assert.equal(
      evidence.deleted === true,
      false,
      `Presentation island browser evidence was retired: ${island.evidenceFile}`,
    );
  }

  for (const exception of expectedAuthorizedRuntimeExceptions) {
    let supplementalFileCount = 0;
    const evidenceFile = exception.evidenceFile;
    if (evidenceFile) {
      supplementalFileCount += 1;
    }
    const additionalFiles = [
      ...(exception.additionalFile ? [exception.additionalFile] : []),
      ...(exception.additionalFiles ?? []),
    ];
    supplementalFileCount += additionalFiles.length;
    assert.equal(
      supplementalFileCount > 0,
      true,
      `Authorized review exception lacks pinned supplemental evidence: ${exception.id}`,
    );
  }
  for (const [path, file] of latestAuthorizedSupplementalFileByPath) {
    if (file.deleted === true) {
      assert.equal(
        existsSync(safeRepositoryPath(repositoryRoot, path)),
        false,
        `Retired authorized review file was restored: ${path}`,
      );
      continue;
    }
    assertFileSha256(
      safeRepositoryPath(repositoryRoot, path),
      file.authorizedSha256,
      `Authorized review exception changed: ${path}`,
    );
  }

  const expectedDraftPath =
    "contracts/drafts/openai/skillpilot-coach-v1/1.0.0-SNAPSHOT";
  assert.equal(freeze.frozenDraftPath, expectedDraftPath);
  const draftRoot = safeRepositoryPath(repositoryRoot, freeze.frozenDraftPath);
  const snapshotPath = resolve(draftRoot, "snapshot-manifest.json");
  assertFileSha256(snapshotPath, freeze.frozenSnapshotManifestSha256);

  const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.pluginIdentity, freeze.pluginIdentity);
  assert.equal(snapshot.pluginVersion, freeze.pluginVersion);
  assert.equal(snapshot.archiveRole, "plugin-install-bundle");
  assertSnapshotInventory(draftRoot, snapshot);

  const archiveEntries = snapshot.files.filter((entry) =>
    entry.path.endsWith(".tar"),
  );
  assert.equal(
    archiveEntries.length,
    1,
    "Frozen draft must contain one plugin archive.",
  );
  assert.equal(archiveEntries[0].sha256, freeze.pluginArchiveSha256);

  const contract = JSON.parse(
    readFileSync(resolve(draftRoot, "contract/contract.json"), "utf8"),
  );
  assert.equal(contract.contractSha256, freeze.exportedContractSha256);
  assert.equal(contract.pluginIdentity, freeze.pluginIdentity);

  const line = JSON.parse(readFileSync(resolve(draftRoot, "line.json"), "utf8"));
  assert.equal(line.publicMcpEndpoint, freeze.publicMcpEndpoint);
  assert.equal(line.oauthResource, freeze.publicMcpEndpoint);

  const lifecycle = JSON.parse(
    readFileSync(resolve(draftRoot, "lifecycle.json"), "utf8"),
  );
  assert.equal(
    lifecycle.contractLine?.publicationStatus,
    "DRAFT",
    "Portal review is not publication; the submitted snapshot must remain DRAFT.",
  );

  const releaseIndex = JSON.parse(
    readFileSync(
      safeRepositoryPath(
        repositoryRoot,
        "contracts/openai/skillpilot-coach-v1/release-index.json",
      ),
      "utf8",
    ),
  );
  assert.equal(releaseIndex.latestPublishedVersion, null);
  assert.deepEqual(releaseIndex.publishedVersions, []);
  assert.equal(releaseIndex.baselinePath, null);

  const reviewVideoPath = safeRepositoryPath(
    repositoryRoot,
    freeze.reviewVideoPath,
  );
  assertFileSha256(reviewVideoPath, freeze.reviewVideoSha256);

  for (const protectedTree of freeze.protectedTrees) {
    assert.match(protectedTree.sha256, /^[0-9a-f]{64}$/u);
    const treeRoot = safeRepositoryPath(repositoryRoot, protectedTree.path);
    assert.equal(
      sha256Tree(treeRoot),
      protectedTree.sha256,
      `Protected V1 tree changed: ${protectedTree.path}`,
    );
  }
  for (const protectedFile of freeze.protectedFiles) {
    assert.match(protectedFile.sha256, /^[0-9a-f]{64}$/u);
    const authorizedException = latestAuthorizedExceptionByPath.get(protectedFile.path);
    if (authorizedException) {
      assert.equal(
        protectedFile.sha256,
        authorizedException.protectedFile.submittedSha256,
        `Submitted V1 baseline changed: ${protectedFile.path}`,
      );
      assertFileSha256(
        safeRepositoryPath(repositoryRoot, protectedFile.path),
        authorizedException.protectedFile.authorizedSha256,
        `Authorized review exception changed: ${protectedFile.path}`,
      );
      continue;
    }
    assertFileSha256(
      safeRepositoryPath(repositoryRoot, protectedFile.path),
      protectedFile.sha256,
      `Protected V1 file changed: ${protectedFile.path}`,
    );
  }

  return {
    pluginIdentity: freeze.pluginIdentity,
    pluginVersion: freeze.pluginVersion,
    portalReviewState: freeze.portalReviewState,
    protectedFileCount: freeze.protectedFiles.length,
    protectedTreeCount: freeze.protectedTrees.length,
  };
}

export function sha256Tree(root) {
  const rootStat = lstatSync(root);
  assert.equal(
    rootStat.isSymbolicLink(),
    false,
    `Protected path is a symlink: ${root}`,
  );
  assert.equal(
    rootStat.isDirectory(),
    true,
    `Protected tree is not a directory: ${root}`,
  );
  const records = [];
  visitTree(root, root, records);
  return sha256(Buffer.from(records.join(""), "utf8"));
}

function visitTree(root, current, records) {
  const entries = readdirSync(current, { withFileTypes: true }).sort(
    (left, right) => left.name.localeCompare(right.name),
  );
  for (const entry of entries) {
    const absolute = resolve(current, entry.name);
    const path = relative(root, absolute).replaceAll(sep, "/");
    assert.equal(
      entry.isSymbolicLink(),
      false,
      `Protected tree contains symlink: ${path}`,
    );
    if (entry.isDirectory()) {
      visitTree(root, absolute, records);
    } else {
      assert.equal(
        entry.isFile(),
        true,
        `Protected tree contains non-file: ${path}`,
      );
      const bytes = statSync(absolute).size;
      records.push(`${path}\0${bytes}\0${sha256(readFileSync(absolute))}\n`);
    }
  }
}

function assertSnapshotInventory(draftRoot, snapshot) {
  assert.equal(Array.isArray(snapshot.files), true);
  const expectedPaths = snapshot.files.map((entry) => entry.path).sort();
  assert.deepEqual(
    expectedPaths,
    [...new Set(expectedPaths)],
    "Snapshot inventory paths must be unique.",
  );
  const actualPaths = listRegularFiles(draftRoot)
    .filter((path) => path !== "snapshot-manifest.json")
    .sort();
  assert.deepEqual(actualPaths, expectedPaths, "Frozen draft file inventory changed.");
  for (const entry of snapshot.files) {
    assert.match(entry.path, /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$)).+$/u);
    assert.match(entry.sha256, /^[0-9a-f]{64}$/u);
    const file = resolve(draftRoot, entry.path);
    assert.equal(
      statSync(file).size,
      entry.bytes,
      `Frozen draft size changed: ${entry.path}`,
    );
    assertFileSha256(file, entry.sha256, `Frozen draft bytes changed: ${entry.path}`);
  }
}

function listRegularFiles(root) {
  const files = [];
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = resolve(current, entry.name);
      assert.equal(
        entry.isSymbolicLink(),
        false,
        `Frozen draft contains symlink: ${absolute}`,
      );
      if (entry.isDirectory()) {
        visit(absolute);
      } else {
        assert.equal(
          entry.isFile(),
          true,
          `Frozen draft contains non-file: ${absolute}`,
        );
        files.push(relative(root, absolute).replaceAll(sep, "/"));
      }
    }
  };
  visit(root);
  return files;
}

function safeRepositoryPath(repositoryRoot, path) {
  assert.equal(typeof path, "string");
  assert.equal(
    isAbsolute(path),
    false,
    `Review-freeze path must be relative: ${path}`,
  );
  assert.equal(path.includes("\0"), false, "Review-freeze path contains NUL.");
  const resolved = resolve(repositoryRoot, path);
  assert.equal(
    resolved.startsWith(`${resolve(repositoryRoot)}${sep}`),
    true,
    `Review-freeze path escapes repository: ${path}`,
  );
  return resolved;
}

function assertFileSha256(path, expected, message = `SHA-256 mismatch: ${path}`) {
  const fileStat = lstatSync(path);
  assert.equal(fileStat.isSymbolicLink(), false, `Protected file is a symlink: ${path}`);
  assert.equal(fileStat.isFile(), true, `Protected path is not a file: ${path}`);
  assert.equal(sha256(readFileSync(path)), expected, message);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (invokedPath === import.meta.url) {
  const result = verifyOpenAiPluginReviewFreeze();
  console.log(
    `CHECK openai_plugin_review_freeze PASS ${result.pluginIdentity} ` +
      `${result.pluginVersion} state=${result.portalReviewState} ` +
      `trees=${result.protectedTreeCount} files=${result.protectedFileCount}`,
  );
}
