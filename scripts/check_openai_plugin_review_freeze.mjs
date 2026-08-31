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

export function resolveAuthorizedSupplementalFileChains(authorizedRuntimeExceptions) {
  assert.equal(
    Array.isArray(authorizedRuntimeExceptions),
    true,
    "Authorized runtime exceptions must be an array.",
  );
  const latestByPath = new Map();

  for (const exception of authorizedRuntimeExceptions) {
    const files = [
      ...(exception.additionalFile ? [exception.additionalFile] : []),
      ...(exception.additionalFiles ?? []),
    ];
    for (const file of files) {
      assert.equal(
        typeof file.path,
        "string",
        `Authorized supplemental file lacks a path: ${exception.id}`,
      );
      assert.match(
        file.authorizedSha256,
        /^[0-9a-f]{64}$/u,
        `Authorized supplemental file has an invalid digest: ${file.path}`,
      );
      const prior = latestByPath.get(file.path);
      if (prior && prior.authorizedSha256 !== file.authorizedSha256) {
        assert.equal(
          file.priorAuthorizedSha256,
          prior.authorizedSha256,
          `Authorized supplemental file chain is discontinuous: ${file.path}`,
        );
      } else if (prior && Object.hasOwn(file, "priorAuthorizedSha256")) {
        assert.equal(
          file.priorAuthorizedSha256,
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
  for (const clarification of expectedAuthorizedCopyClarifications) {
    assert.equal(
      clarification.files.length > 0,
      true,
      `Authorized copy clarification lacks pinned files: ${clarification.id}`,
    );
    for (const file of clarification.files) {
      assertFileSha256(
        safeRepositoryPath(repositoryRoot, file.path),
        file.sha256,
        `Authorized review copy changed: ${file.path}`,
      );
    }
  }
  assert.equal(Array.isArray(freeze.protectedTrees), true);
  assert.equal(Array.isArray(freeze.protectedFiles), true);

  const latestAuthorizedExceptionByPath = resolveAuthorizedRuntimeExceptionChains(
    freeze.protectedFiles,
    expectedAuthorizedRuntimeExceptions,
  );
  const latestAuthorizedSupplementalFileByPath = resolveAuthorizedSupplementalFileChains(
    expectedAuthorizedRuntimeExceptions,
  );

  for (const exception of expectedAuthorizedRuntimeExceptions) {
    let supplementalFileCount = 0;
    const evidenceFile = exception.evidenceFile;
    if (evidenceFile) {
      supplementalFileCount += 1;
      assertFileSha256(
        safeRepositoryPath(repositoryRoot, evidenceFile.path),
        evidenceFile.sha256,
        `Authorized review evidence changed: ${evidenceFile.path}`,
      );
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
