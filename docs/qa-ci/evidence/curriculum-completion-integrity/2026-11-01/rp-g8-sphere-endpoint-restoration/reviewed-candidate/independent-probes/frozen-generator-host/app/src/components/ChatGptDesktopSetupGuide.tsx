import { useRef, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { CHATGPT_DESKTOP_MINIMUM_PLUGIN_VERSION, CHATGPT_DESKTOP_MARKETPLACE_URL } from '../utils/chatGptDesktopBeta'

/** Shared guide for start-page onboarding and the plugin catalog. */
export function ChatGptDesktopSetupGuide({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const copy = useTranslation().startPage.login.chatGptDesktop
  const [copied, setCopied] = useState(false)
  const repositoryField = useRef<HTMLInputElement>(null)

  async function copyRepository() {
    setCopied(false)
    try {
      await navigator.clipboard.writeText(CHATGPT_DESKTOP_MARKETPLACE_URL)
      setCopied(true)
    } catch {
      repositoryField.current?.focus()
      repositoryField.current?.select()
    }
  }

  return (
    <details data-testid="chatgpt-desktop-setup" open={defaultOpen}
      className="rounded-lg border border-sky-200 bg-white/80 p-3 dark:border-sky-800 dark:bg-slate-950/35">
      <summary className="cursor-pointer text-xs font-semibold text-text-primary">{copy.setupTitle}</summary>
      <p data-testid="chatgpt-desktop-version" className="mt-3 text-xs font-semibold text-text-primary">
        {copy.versionLabel}: {CHATGPT_DESKTOP_MINIMUM_PLUGIN_VERSION}
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-4 text-xs leading-relaxed text-text-secondary">
        <li>{copy.installMarketplace}</li>
        <li>
          <label className="block">
            {copy.repositoryLabel}
            <input ref={repositoryField} readOnly value={CHATGPT_DESKTOP_MARKETPLACE_URL}
              className="mt-1 w-full rounded border border-border-color bg-transparent p-2 text-text-primary" />
          </label>
          <button type="button" onClick={() => void copyRepository()}
            className="mt-2 min-h-10 rounded-full border border-sky-500 px-3 py-2 font-semibold text-text-primary">
            {copied ? copy.repositoryCopied : copy.copyRepository}
          </button>
        </li>
        <li>{copy.installPlugin}</li>
        <li>{copy.versionHint.replace('{version}', CHATGPT_DESKTOP_MINIMUM_PLUGIN_VERSION)}</li>
        <li>{copy.connectPlugin}</li>
      </ol>
      <p className="mt-3 text-xs leading-relaxed text-text-secondary">{copy.updateHint}</p>
      <p className="mt-2 text-xs leading-relaxed text-text-secondary">{copy.archiveUpdateHint}</p>
    </details>
  )
}
