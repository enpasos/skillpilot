import { OPENAI_PLUGIN } from "./openai_plugin_config.mjs";

// Shared by the portal archive and the experimental Git marketplace.
// Review worksheets, credentials and release bookkeeping are never install input.
export const OPENAI_PLUGIN_INSTALL_FILES = Object.freeze([
  ".codex-plugin/plugin.json",
  ".mcp.json",
  `${OPENAI_PLUGIN.skillPath}/SKILL.md`,
  `${OPENAI_PLUGIN.skillPath}/agents/openai.yaml`,
  `${OPENAI_PLUGIN.skillPath}/references/coaching-policy.md`,
  "assets/favicon-96x96.png",
  "assets/web-app-manifest-512x512.png",
]);

export function openAiPluginInstallFiles(manifest) {
  // Preserve the archive helper's historical app-backed-package behavior.
  return [
    ...OPENAI_PLUGIN_INSTALL_FILES.slice(0, 2),
    ...(manifest.apps === undefined ? [] : [".app.json"]),
    ...OPENAI_PLUGIN_INSTALL_FILES.slice(2),
  ];
}
