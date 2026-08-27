import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, BookOpenText, Headphones, PlayCircle } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { AudioPlayer, type AudioPlayerHandle } from '../components/AudioPlayer'
import {
  MarkdownDocumentVideoCard,
  type MarkdownDocumentVideoCardHandle,
} from '../components/MarkdownDocumentVideoCard'
import { getMarkdownDocumentViewCopy } from '../utils/markdownDocumentViewCopy'
import { getSkillPilotOverviewCopy } from '../utils/skillPilotOverviewCopy'

type LoadState = 'loading' | 'ready' | 'error'
interface DocumentLoadState {
  language: 'de' | 'en'
  state: LoadState
  content: string
}

const SUPPORTED_LANGS = new Set(['de', 'en'])
const OVERVIEW_SECTION_IDS = new Set(['audio', 'video', 'whitepaper'])
type PlaybackIntent = 'audio' | 'video'

const resolveLanguage = (routeLang: string | undefined, fallback: 'de' | 'en') => {
  const normalized = (routeLang || '').toLowerCase()
  if (SUPPORTED_LANGS.has(normalized)) {
    return normalized as 'de' | 'en'
  }
  return fallback
}

const resolveOverviewSectionId = (hash: string) => {
  try {
    const sectionId = decodeURIComponent(hash.replace(/^#/, ''))
    return OVERVIEW_SECTION_IDS.has(sectionId) ? sectionId : null
  } catch {
    return null
  }
}

const resolvePlaybackIntent = (search: string): PlaybackIntent | null => {
  const value = new URLSearchParams(search).get('play')
  return value === 'audio' || value === 'video' ? value : null
}

const convertHtmlImagesToMarkdown = (markdown: string) => (
  markdown.replace(/<img\s+[^>]*>/gi, (match) => {
    const srcMatch = match.match(/\bsrc\s*=\s*["']([^"']+)["']/i)
    if (!srcMatch) return match
    const altMatch = match.match(/\balt\s*=\s*["']([^"']*)["']/i)
    const widthMatch = match.match(/\bwidth\s*=\s*["']?(\d+)["']?/i)
    const altText = altMatch ? altMatch[1] : ''
    const title = widthMatch ? ` "width=${widthMatch[1]}"` : ''
    return `![${altText}](${srcMatch[1]}${title})`
  })
)

export const WhitepaperView: React.FC = () => {
  const { language } = useLanguage()
  const { lang } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const audioPlayerRef = useRef<AudioPlayerHandle>(null)
  const videoPlayerRef = useRef<MarkdownDocumentVideoCardHandle>(null)
  const consumedPlaybackIntentRef = useRef<string | null>(null)
  const activeLanguage = useMemo(() => resolveLanguage(lang, language), [lang, language])
  const [documentLoad, setDocumentLoad] = useState<DocumentLoadState>(() => ({
    language: activeLanguage,
    state: 'loading',
    content: '',
  }))
  const loadState = documentLoad.language === activeLanguage ? documentLoad.state : 'loading'
  const content = documentLoad.language === activeLanguage ? documentLoad.content : ''

  useEffect(() => {
    const previousLanguage = document.documentElement.lang
    document.documentElement.lang = activeLanguage

    return () => {
      document.documentElement.lang = previousLanguage
    }
  }, [activeLanguage])

  useEffect(() => {
    const fileLanguage = activeLanguage === 'en' ? 'en' : 'de'
    const url = `/whitepaper/whitepaper.${fileLanguage}.md`
    let isActive = true

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${url}`)
        }
        return response.text()
      })
      .then((text) => {
        if (!isActive) return
        setDocumentLoad({
          language: activeLanguage,
          state: 'ready',
          content: convertHtmlImagesToMarkdown(text),
        })
      })
      .catch(() => {
        if (!isActive) return
        setDocumentLoad({ language: activeLanguage, state: 'error', content: '' })
      })

    return () => {
      isActive = false
    }
  }, [activeLanguage])

  useEffect(() => {
    const sectionId = resolveOverviewSectionId(location.hash)
    if (!sectionId) return

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(sectionId)
      if (!target) return

      target.setAttribute('tabindex', '-1')
      target.scrollIntoView({ block: 'start' })
      target.focus({ preventScroll: true })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeLanguage, location.hash, location.key])

  useEffect(() => {
    const playbackIntent = resolvePlaybackIntent(location.search)
    if (!playbackIntent) return

    const intentKey = `${location.key}:${location.search}`
    if (consumedPlaybackIntentRef.current === intentKey) return
    consumedPlaybackIntentRef.current = intentKey

    const player = playbackIntent === 'audio' ? audioPlayerRef.current : videoPlayerRef.current
    void player?.play().catch(() => undefined)

    const nextSearchParams = new URLSearchParams(location.search)
    nextSearchParams.delete('play')
    const nextSearch = nextSearchParams.toString()
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : '',
        hash: `#${playbackIntent}`,
      },
      { replace: true },
    )
  }, [location.key, location.pathname, location.search, navigate])

  const labels = getMarkdownDocumentViewCopy(activeLanguage, 'whitepaper')
  const overview = getSkillPilotOverviewCopy(activeLanguage)

  const switchLanguage = activeLanguage === 'en' ? 'de' : 'en'
  const videoUrl = `/whitepaper/SkillPilot_Whitepaper_${activeLanguage}.mp4`
  const formatLinks = [
    { target: 'audio', icon: Headphones, copy: overview.formats.audio },
    { target: 'video', icon: PlayCircle, copy: overview.formats.video },
    { target: 'whitepaper', icon: BookOpenText, copy: overview.formats.whitepaper },
  ] as const

  const startPlayback = (target: PlaybackIntent) => {
    const player = target === 'audio' ? audioPlayerRef.current : videoPlayerRef.current
    void player?.play().catch(() => undefined)
  }

  return (
    <div className="min-h-screen bg-chat-bg text-text-primary px-4 py-6 sm:px-6 lg:px-10 flex justify-center transition-colors">
      <div className="max-w-4xl w-full">
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

        <header className="mb-8 max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-700 dark:text-slate-200 sm:text-5xl">
            {overview.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary sm:text-xl">
            {overview.description}
          </p>
        </header>

        <nav
          aria-label={overview.formatNavigationLabel}
          className="mb-10 grid gap-3 md:grid-cols-3"
        >
          {formatLinks.map(({ target, icon: Icon, copy }) => (
            <Link
              key={target}
              to={`/whitepaper/${activeLanguage}#${target}`}
              data-testid={`skillpilot-overview-nav-${target}`}
              onClick={target === 'whitepaper' ? undefined : () => startPlayback(target)}
              className="group flex min-h-44 flex-col rounded-2xl border border-border-color bg-white/60 p-5 transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:bg-slate-900/55 dark:hover:border-violet-600 dark:focus-visible:ring-offset-slate-950"
            >
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
                <Icon size={16} aria-hidden="true" />
                {copy.eyebrow}
              </span>
              <span className="mt-3 text-lg font-semibold text-text-primary">
                {copy.title}
              </span>
              <span className="mt-1 flex-1 text-sm leading-relaxed text-text-secondary">
                {copy.description}
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 dark:text-violet-300">
                {copy.action}
                <ArrowDown size={15} aria-hidden="true" className="transition-transform group-hover:translate-y-0.5" />
              </span>
            </Link>
          ))}
        </nav>

        <div className="mb-10">
          <AudioPlayer
            key={activeLanguage}
            ref={audioPlayerRef}
            compact
            language={activeLanguage}
            sectionId="audio"
            headingLevel="h2"
            className="scroll-mt-6"
          />
        </div>

        <MarkdownDocumentVideoCard
          ref={videoPlayerRef}
          sectionId="video"
          url={videoUrl}
          eyebrow={overview.formats.video.eyebrow}
          title={overview.formats.video.title}
          description={overview.formats.video.description}
          openLabel={labels.videoOpen}
        />

        <section id="whitepaper" aria-labelledby="whitepaper-title" className="scroll-mt-6">
          <header className="mb-6 border-b border-border-color pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
              {overview.formats.whitepaper.eyebrow}
            </p>
            <h2 id="whitepaper-title" className="mt-2 text-3xl font-semibold tracking-tight text-slate-700 dark:text-slate-200">
              {overview.formats.whitepaper.title}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-text-secondary">
              {overview.formats.whitepaper.description}
            </p>
          </header>

          {loadState === 'loading' && (
            <p className="text-text-secondary">{labels.loading}</p>
          )}
          {loadState === 'error' && (
            <p role="alert" className="text-rose-500">{labels.error}</p>
          )}
          {loadState === 'ready' && (
            <div className="prose dark:prose-invert max-w-none text-text-primary">
              <ReactMarkdown
                components={{
                  h1: () => null,
                  h2: ({ children }) => <h3>{children}</h3>,
                  h3: ({ children }) => <h4>{children}</h4>,
                  h4: ({ children }) => <h5>{children}</h5>,
                  img: ({ title, ...props }) => {
                    const widthMatch = typeof title === 'string'
                      ? title.match(/\b(?:width|max-width|w)=(\d+)\b/i)
                      : null
                    const explicitMaxWidth = widthMatch ? `${widthMatch[1]}px` : undefined
                    const src = typeof props.src === 'string' ? props.src.toLowerCase() : ''
                    const fallbackMaxWidth = src.includes('velocity')
                      ? '420px'
                      : src.includes('memorize')
                        ? '400px'
                        : undefined
                    const maxWidth = explicitMaxWidth ?? fallbackMaxWidth
                    const className = [
                      'max-w-full h-auto rounded-lg border border-border-color',
                      maxWidth ? 'block mx-auto' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')
                    const style = maxWidth ? { maxWidth, width: '100%' } : undefined

                    return (
                      <img
                        {...props}
                        title={explicitMaxWidth ? undefined : title}
                        className={className}
                        style={style}
                      />
                    )
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
