import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  assertOpenAiPluginReleaseMutationAllowed,
  loadOpenAiPluginReviewFreeze,
  resolveAuthorizedRuntimeExceptionChains,
  sha256Tree,
  verifyOpenAiPluginReviewFreeze,
} from "./check_openai_plugin_review_freeze.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

test("review record keeps the submitted V1 baseline constants", () => {
  const freeze = loadOpenAiPluginReviewFreeze(repositoryRoot);
  assert.deepEqual(
    {
      pluginIdentity: freeze.pluginIdentity,
      pluginVersion: freeze.pluginVersion,
      portalReviewState: freeze.portalReviewState,
      enteredAt: freeze.enteredAt,
      submittedSourceCommit: freeze.submittedSourceCommit,
      frozenSnapshotManifestSha256: freeze.frozenSnapshotManifestSha256,
      pluginArchiveSha256: freeze.pluginArchiveSha256,
      exportedContractSha256: freeze.exportedContractSha256,
      reviewVideoSha256: freeze.reviewVideoSha256,
      reviewVideoUrl: freeze.reviewVideoUrl,
    },
    {
      pluginIdentity: "skillpilot-coach-v1",
      pluginVersion: "1.0.0",
      portalReviewState: "IN_REVIEW",
      enteredAt: "2026-08-15",
      submittedSourceCommit: "ff3a16b0d6e3c8a564176ab4743e777cddf3e79c",
      frozenSnapshotManifestSha256:
        "e6408e7054d53ab4a52f32f541b07201f1a8f6e183ff5772bc2d8164162b0f32",
      pluginArchiveSha256:
        "f6f69b7b42b6904ad6ff1796190cf687af72c2e4af62edcac0bd04d6603ae697",
      exportedContractSha256:
        "d2f08a66efa3488e5f87758de41688a18ce47ba2951bb2d3147e522d1fd30b38",
      reviewVideoSha256:
        "20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb",
      reviewVideoUrl:
        "https://skillpilot.com/api/public/openai/review/skillpilot-coach-v1/" +
        "1.0.0/sha256-20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb.mp4",
    },
  );
});

test("submitted OpenAI V1 review baseline remains exact", () => {
  const result = verifyOpenAiPluginReviewFreeze({ repositoryRoot });
  assert.deepEqual(result, {
    pluginIdentity: "skillpilot-coach-v1",
    pluginVersion: "1.0.0",
    portalReviewState: "IN_REVIEW",
    protectedFileCount: 22,
    protectedTreeCount: 6,
  });
});

test("review exceptions keep the submitted hash and pin authorized runtimes", () => {
  const freeze = loadOpenAiPluginReviewFreeze(repositoryRoot);
  assert.deepEqual(freeze.authorizedRuntimeExceptions, [
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
  ]);
});

test("review exception chains preserve every prior authorized SessionSetup hash", () => {
  const freeze = loadOpenAiPluginReviewFreeze(repositoryRoot);
  const latestByPath = resolveAuthorizedRuntimeExceptionChains(
    freeze.protectedFiles,
    freeze.authorizedRuntimeExceptions,
  );
  assert.equal(
    latestByPath.get("app/src/components/SessionSetup.tsx")?.protectedFile.authorizedSha256,
    "b56c60fbdf44021c92c9477602207409911ef1049d5a313cc99702f9424e9031",
  );

  const broken = structuredClone(freeze.authorizedRuntimeExceptions);
  broken[1].protectedFile.priorAuthorizedSha256 = "0".repeat(64);
  assert.throws(
    () => resolveAuthorizedRuntimeExceptionChains(freeze.protectedFiles, broken),
    /exception chain is discontinuous/u,
  );
});

test("review copy clarification pins the truthful current coach availability banner", () => {
  const freeze = loadOpenAiPluginReviewFreeze(repositoryRoot);
  assert.equal(freeze.authorizedCopyClarifications.length, 2);
  assert.deepEqual(freeze.authorizedCopyClarifications[0],
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
          sha256:
            "b9d399e5bf42a8b8ba4a48cffd7d89edeb16bde52b7d89a5e9747ee8e2d666e4",
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
  );
});

test("review copy clarification pins the complete guided Claude plugin setup", () => {
  const freeze = loadOpenAiPluginReviewFreeze(repositoryRoot);
  assert.deepEqual(freeze.authorizedCopyClarifications[1], {
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
  });
});

test("protected tree digest changes for changed, added, or removed files", () => {
  const root = mkdtempSync(resolve(tmpdir(), "skillpilot-v1-review-freeze-"));
  try {
    mkdirSync(resolve(root, "nested"));
    writeFileSync(resolve(root, "a.txt"), "alpha\n");
    writeFileSync(resolve(root, "nested/b.txt"), "beta\n");
    const baseline = sha256Tree(root);

    writeFileSync(resolve(root, "a.txt"), "changed\n");
    assert.notEqual(sha256Tree(root), baseline);
    writeFileSync(resolve(root, "a.txt"), "alpha\n");
    assert.equal(sha256Tree(root), baseline);

    writeFileSync(resolve(root, "extra.txt"), "extra\n");
    assert.notEqual(sha256Tree(root), baseline);
    rmSync(resolve(root, "extra.txt"));
    rmSync(resolve(root, "nested/b.txt"));
    assert.notEqual(sha256Tree(root), baseline);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("release mutation remains fail closed for unexpected freeze metadata", () => {
  const root = mkdtempSync(resolve(tmpdir(), "skillpilot-v1-freeze-state-"));
  try {
    const recordDirectory = resolve(
      root,
      "contracts/openai/skillpilot-coach-v1",
    );
    mkdirSync(recordDirectory, { recursive: true });
    writeFileSync(
      resolve(recordDirectory, "review-freeze.json"),
      JSON.stringify({
        pluginIdentity: "unexpected-plugin",
        pluginVersion: "9.9.9",
        portalReviewState: "UNEXPECTED_STATE",
      }),
    );
    assert.throws(
      () =>
        assertOpenAiPluginReleaseMutationAllowed({
          repositoryRoot: root,
          pluginIdentity: "skillpilot-coach-v1",
          pluginVersion: "1.0.0",
          command: "prepare",
        }),
      /submission unexpected-plugin 9\.9\.9 has freeze state UNEXPECTED_STATE/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
