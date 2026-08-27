import React, { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getAudioPlayerCopy } from '../utils/audioPlayerCopy'
import type { LabelLanguage } from '../utils/filterLabels'

// Define the available audio sources
const AUDIO_SOURCES = {
  de: '/audio/intro-de.m4a',
  en: '/audio/intro-en.m4a',
}

interface AudioPlayerProps {
  compact?: boolean
  language?: LabelLanguage
  sectionId?: string
  headingLevel?: 'h2' | 'h3' | 'h4'
  className?: string
}

export interface AudioPlayerHandle {
  play: () => Promise<void>
}

export const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(({
  compact = false,
  language: requestedLanguage,
  sectionId,
  headingLevel,
  className = '',
}, forwardedRef) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const aiVoiceNoticeId = useId()
  const titleId = useId()
  const { language: contextLanguage } = useLanguage()
  const activeLanguage = requestedLanguage ?? (contextLanguage === 'en' ? 'en' : 'de')
  const copy = getAudioPlayerCopy(activeLanguage)
  const HeadingTag = headingLevel ?? (compact ? 'h3' : 'h2')

  // State
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      await audio.play()
    } catch (error) {
      setIsPlaying(false)
      throw error
    }
  }, [])

  useImperativeHandle(forwardedRef, () => ({ play }), [play])

  // Detect if audio ended
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const updateDuration = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      audio.currentTime = 0
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    updateDuration()

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('durationchange', updateDuration)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Handle Play/Pause
  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) {
      audio.pause()
    } else {
      void play().catch(() => undefined)
    }
  }

  // Seek handler
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const nextProgress = Math.min(Math.max(Number(event.target.value), 0), 100)
    audio.currentTime = (nextProgress / 100) * duration
    setProgress(nextProgress)
  }

  if (compact) {
    return (
      <section
        id={sectionId}
        aria-labelledby={titleId}
        className={`w-full h-full ${className}`.trim()}
      >
        <audio ref={audioRef} src={AUDIO_SOURCES[activeLanguage]} preload="metadata" />

        <div className="group relative h-full overflow-hidden rounded-xl border border-border-color bg-white/50 p-5 transition-all duration-300 hover:border-violet-300/70 hover:shadow-md dark:bg-slate-800/50 dark:hover:border-violet-500/40">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <HeadingTag
                id={titleId}
                className="min-w-0 text-lg font-semibold text-text-primary transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400"
              >
                {copy.notebookLabel}
              </HeadingTag>
              <button
                type="button"
                onClick={togglePlay}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-300 text-violet-600 transition-colors hover:border-violet-500 hover:bg-violet-50 dark:border-violet-500/40 dark:text-violet-300 dark:hover:bg-violet-950/40"
                aria-label={isPlaying ? copy.pauseLabel : copy.playLabel}
                aria-describedby={aiVoiceNoticeId}
              >
                {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
              </button>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              {copy.subtitle}
            </p>
            <p
              id={aiVoiceNoticeId}
              role="note"
              className="mt-2 text-xs leading-relaxed text-text-secondary"
            >
              {copy.aiVoiceNotice}
            </p>

            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleSeek}
              disabled={!duration}
              aria-label={copy.seekLabel}
              aria-valuetext={`${Math.round(progress)}%`}
              className="mt-3 h-2 w-full cursor-pointer accent-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id={sectionId}
      aria-labelledby={titleId}
      className={`w-full max-w-lg mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700 ${className}`.trim()}
    >
      <audio ref={audioRef} src={AUDIO_SOURCES[activeLanguage]} preload="metadata" />

      {/* Glassmorphism Container */}
      <div className={
        compact
          ? 'relative h-full overflow-hidden rounded-xl border border-border-color bg-white/50 dark:bg-slate-800/50 p-5 flex items-center gap-4 hover:shadow-md hover:border-indigo-300/70 dark:hover:border-indigo-500/40 transition-all'
          : 'relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-md shadow-lg p-4 flex items-center gap-4'
      }>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md hover:scale-105 transition-transform active:scale-95`}
          aria-label={isPlaying ? copy.pauseLabel : copy.playLabel}
          aria-describedby={aiVoiceNoticeId}
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>

          {/* Info & Progress */}
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-center mb-1">
              <HeadingTag id={titleId} className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {copy.notebookLabel}
              </HeadingTag>
            </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 block">
            {copy.subtitle}
          </p>
          <p
            id={aiVoiceNoticeId}
            role="note"
            className="mb-3 text-xs leading-relaxed text-text-secondary"
          >
            {copy.aiVoiceNotice}
          </p>

          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSeek}
            disabled={!duration}
            aria-label={copy.seekLabel}
            aria-valuetext={`${Math.round(progress)}%`}
            className="h-2 w-full cursor-pointer accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* NotebookLM Icon/Brand (Subtle) */}
        <div className={compact ? 'hidden' : 'flex-shrink-0 text-slate-300 dark:text-slate-600'}>
          <Volume2 size={24} />
        </div>
      </div>
    </section>
  )
})

AudioPlayer.displayName = 'AudioPlayer'
