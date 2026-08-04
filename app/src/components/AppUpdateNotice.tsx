import React from 'react'
import { RefreshCw, X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useAppVersionCheck } from '../hooks/useAppVersionCheck'

export const AppUpdateNotice: React.FC = () => {
  const { language } = useLanguage()
  const versionStatus = useAppVersionCheck()

  if (!versionStatus.updateAvailable) {
    return null
  }

  const copy = language === 'en'
    ? {
      title: 'New version available',
      description: 'Reload SkillPilot to use the latest version.',
      reload: 'Reload',
      reloading: 'Activating…',
      reloadError: 'The new version could not be activated yet. Please try again.',
      dismiss: 'Dismiss',
    }
    : {
      title: 'Neue Version verfügbar',
      description: 'Lade SkillPilot neu, um die aktuelle Version zu verwenden.',
      reload: 'Neu laden',
      reloading: 'Wird aktiviert…',
      reloadError: 'Die neue Version konnte noch nicht aktiviert werden. Bitte versuche es erneut.',
      dismiss: 'Ausblenden',
    }

  return (
    <div className="fixed bottom-4 right-4 z-[80] max-w-sm rounded-lg border border-border-color bg-sidebar-bg px-4 py-3 text-sm text-text-primary shadow-xl">
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <div className="font-semibold">{copy.title}</div>
          <div className="mt-0.5 text-xs text-text-secondary">{copy.description}</div>
          <button
            type="button"
            onClick={() => { void versionStatus.reloadNow() }}
            disabled={versionStatus.reloadPending}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-wait disabled:opacity-70"
          >
            <RefreshCw size={14} className={versionStatus.reloadPending ? 'animate-spin' : undefined} />
            {versionStatus.reloadPending ? copy.reloading : copy.reload}
          </button>
          {versionStatus.reloadError && (
            <div role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
              {copy.reloadError}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={versionStatus.dismiss}
          disabled={versionStatus.reloadPending}
          title={copy.dismiss}
          aria-label={copy.dismiss}
          className="rounded-full p-1 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-wait disabled:opacity-50"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
