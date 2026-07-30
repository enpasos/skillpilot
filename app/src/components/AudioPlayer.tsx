import React, { useId, useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getAudioPlayerCopy } from '../utils/audioPlayerCopy'

// Define the available audio sources
const AUDIO_SOURCES = {
  de: '/audio/intro-de.m4a',
  en: '/audio/intro-en.m4a',
}

interface AudioPlayerProps {
  compact?: boolean
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ compact = false }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const aiVoiceNoticeId = useId()
  const { language } = useLanguage()
  const copy = getAudioPlayerCopy(language === 'en' ? 'en' : 'de')

  // State
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // Detect if audio ended
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Seek handler
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.min(Math.max(x / rect.width, 0), 1)
    audioRef.current.currentTime = percent * audioRef.current.duration
    setProgress(percent * 100)
  }

  if (compact) {
    return (
      <div className="w-full h-full">
        <audio ref={audioRef} src={AUDIO_SOURCES[language]} preload="metadata" />

        <div className="group relative h-full overflow-hidden rounded-xl border border-border-color bg-white/50 p-5 transition-all duration-300 hover:border-violet-300/70 hover:shadow-md dark:bg-slate-800/50 dark:hover:border-violet-500/40">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="min-w-0 text-lg font-semibold text-text-primary transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
                {copy.notebookLabel}
              </h3>
              <button
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

            <div
              className="mt-3 h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={compact ? 'w-full h-full' : 'w-full max-w-lg mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700'}>
      <audio ref={audioRef} src={AUDIO_SOURCES[language]} preload="metadata" />

      {/* Glassmorphism Container */}
      <div className={
        compact
          ? 'relative h-full overflow-hidden rounded-xl border border-border-color bg-white/50 dark:bg-slate-800/50 p-5 flex items-center gap-4 hover:shadow-md hover:border-indigo-300/70 dark:hover:border-indigo-500/40 transition-all'
          : 'relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-md shadow-lg p-4 flex items-center gap-4'
      }>

        {/* Play/Pause Button */}
        <button
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
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {copy.notebookLabel}
            </h4>
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
          <div
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer overflow-hidden relative group"
            onClick={handleSeek}
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-indigo-500 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* NotebookLM Icon/Brand (Subtle) */}
        <div className={compact ? 'hidden' : 'flex-shrink-0 text-slate-300 dark:text-slate-600'}>
          <Volume2 size={24} />
        </div>
      </div>
    </div>
  )
}
