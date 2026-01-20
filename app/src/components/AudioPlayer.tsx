import React, { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'

// Define the available audio sources
const AUDIO_SOURCES = {
  de: '/audio/intro-de.m4a',
  en: '/audio/intro-en.m4a', // Placeholder or future file
}

const NOTEBOOKLM_LABEL = {
  de: 'Deep Dive: SkillPilot erklärt',
  en: 'Deep Dive: SkillPilot Explained',
}

const SUBTITLE = {
  de: 'Generiert mit NotebookLM',
  en: 'Generated with NotebookLM',
}

export const AudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null)

  // State
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [language, setLanguage] = useState<'de' | 'en'>('de')

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
  }, [language])

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

  // Handle Language Switch
  const switchLanguage = (lang: 'de' | 'en') => {
    if (lang === language) return
    setLanguage(lang)
    setIsPlaying(false)
    setProgress(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      // We rely on the `src` prop updating in the audio tag
    }
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

  return (
    <div className="w-full max-w-lg mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <audio ref={audioRef} src={AUDIO_SOURCES[language]} preload="metadata" />

      {/* Glassmorphism Container */}
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-md shadow-lg p-4 flex items-center gap-4">

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md hover:scale-105 transition-transform active:scale-95"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>

        {/* Info & Progress */}
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {NOTEBOOKLM_LABEL[language]}
            </h4>
            <div className="flex items-center gap-1">
              {/* Language Toggles */}
              <button
                onClick={() => switchLanguage('de')}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${language === 'de' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                DE
              </button>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600 mx-0.5"></div>
              <button
                onClick={() => switchLanguage('en')}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${language === 'en' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                EN
              </button>
            </div>

          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 block">
            {SUBTITLE[language]}
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
        <div className="flex-shrink-0 text-slate-300 dark:text-slate-600">
          <Volume2 size={24} />
        </div>
      </div>
    </div>
  )
}
