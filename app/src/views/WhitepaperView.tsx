import React, { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

type LoadState = 'loading' | 'ready' | 'error'

const SUPPORTED_LANGS = new Set(['de', 'en'])

const resolveLanguage = (routeLang: string | undefined, fallback: 'de' | 'en') => {
  const normalized = (routeLang || '').toLowerCase()
  if (SUPPORTED_LANGS.has(normalized)) {
    return normalized as 'de' | 'en'
  }
  return fallback
}

export const WhitepaperView: React.FC = () => {
  const { language } = useLanguage()
  const { lang } = useParams()
  const activeLanguage = useMemo(() => resolveLanguage(lang, language), [lang, language])
  const [content, setContent] = useState('')
  const [loadState, setLoadState] = useState<LoadState>('loading')

  useEffect(() => {
    const fileLanguage = activeLanguage === 'en' ? 'en' : 'de'
    const url = `/whitepaper/whitepaper.${fileLanguage}.md`
    let isActive = true

    setLoadState('loading')
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${url}`)
        }
        return response.text()
      })
      .then((text) => {
        if (!isActive) return
        setContent(text)
        setLoadState('ready')
      })
      .catch(() => {
        if (!isActive) return
        setLoadState('error')
      })

    return () => {
      isActive = false
    }
  }, [activeLanguage])

  const labels = activeLanguage === 'en'
    ? {
      back: 'Back to App',
      switchLabel: 'Deutsch',
      loading: 'Loading whitepaper...',
      error: 'Whitepaper could not be loaded.',
    }
    : {
      back: 'Zurück zur App',
      switchLabel: 'English',
      loading: 'Whitepaper wird geladen...',
      error: 'Whitepaper konnte nicht geladen werden.',
    }

  const switchLanguage = activeLanguage === 'en' ? 'de' : 'en'

  return (
    <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex justify-center transition-colors">
      <div className="max-w-4xl w-full glass-panel p-8 shadow-2xl border border-border-color">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <Link to="/" className="flex items-center text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            {labels.back}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link
              to={`/whitepaper/${switchLanguage}`}
              className="text-sky-500 hover:text-sky-400 transition-colors"
            >
              {labels.switchLabel}
            </Link>
          </div>
        </div>

        {loadState === 'loading' && (
          <p className="text-text-secondary">{labels.loading}</p>
        )}
        {loadState === 'error' && (
          <p className="text-rose-400">{labels.error}</p>
        )}
        {loadState === 'ready' && (
          <div className="prose dark:prose-invert max-w-none text-text-primary">
            <ReactMarkdown
              components={{
                img: (props) => (
                  <img {...props} className="max-w-full h-auto rounded-lg border border-border-color" />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
