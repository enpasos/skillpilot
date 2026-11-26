import { useEffect, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { MarkdownDocumentVideoCard, type MarkdownDocumentVideoCardHandle } from '../components/MarkdownDocumentVideoCard'
import { getLearningMapVideo } from '../config/learningMapVideo'
import { useLanguage } from '../contexts/LanguageContext'

export function LearningMapVideoView() {
  const { language, setLanguage } = useLanguage()
  const { lang } = useParams()
  const location = useLocation()
  const activeLanguage = lang === 'de' || lang === 'en' ? lang : language
  const otherLanguage = activeLanguage === 'de' ? 'en' : 'de'
  const video = getLearningMapVideo(activeLanguage)
  const player = useRef<MarkdownDocumentVideoCardHandle>(null)

  useEffect(() => {
    setLanguage(activeLanguage)
  }, [activeLanguage, setLanguage])

  useEffect(() => {
    window.scrollTo(0, 0)
    if (location.state?.playVideo) {
      // Browsers that require another gesture show the player's native play control.
      void player.current?.play().catch(() => {})
    }
  }, [location.key, location.state])

  if (lang !== activeLanguage) return <Navigate to={`/learning-map/${activeLanguage}`} replace />

  return (
    <main className="min-h-screen bg-chat-bg px-4 py-6 text-text-primary sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <nav className="mb-5 flex items-center justify-between gap-4 text-sm font-medium">
          <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary">
            <ArrowLeft size={18} aria-hidden="true" />
            {video.back}
          </Link>
          <Link
            to={`/learning-map/${otherLanguage}`}
            lang={otherLanguage}
            hrefLang={otherLanguage}
            className="rounded-full border border-border-color bg-input-bg px-4 py-2 hover:text-sky-600 dark:hover:text-sky-300"
          >
            {otherLanguage === 'de' ? 'Deutsch' : 'English'}
          </Link>
        </nav>
        <MarkdownDocumentVideoCard
          ref={player}
          headingLevel="h1"
          url={video.url}
          poster={video.poster}
          tracks={video.tracks}
          eyebrow={video.eyebrow}
          title={video.title}
          description={video.description}
          openLabel={video.open}
        />
      </div>
    </main>
  )
}
