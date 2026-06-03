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
      dismiss: 'Dismiss',
    }
    : {
      title: 'Neue Version verfügbar',
      description: 'Lade SkillPilot neu, um die aktuelle Version zu verwenden.',
      reload: 'Neu laden',
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
            onClick={versionStatus.reloadNow}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <RefreshCw size={14} />
            {copy.reload}
          </button>
        </div>
        <button
          type="button"
          onClick={versionStatus.dismiss}
          title={copy.dismiss}
          aria-label={copy.dismiss}
          className="rounded-full p-1 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
