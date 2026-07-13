/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLAUDE_BETA_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
