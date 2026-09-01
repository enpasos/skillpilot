/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_CLAUDE_BETA_ENABLED?: string
  readonly VITE_EXISTING_LEARNER_LINKING_ENABLED?: string
  readonly VITE_SKILLPILOT_COACH_VARIANT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
