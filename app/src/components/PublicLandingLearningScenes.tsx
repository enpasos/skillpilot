import { useRef, useState, type PointerEvent } from 'react'
import { CircleAlert, LoaderCircle } from 'lucide-react'
import type { PublicLandingCopy } from '../utils/publicLandingCopy'

type Scene = 'writing' | 'voice'

interface PublicLandingLearningScenesProps {
  copy: PublicLandingCopy['learning']['scenes']
  imageCaption: string
}

/** This control chooses an illustration, never a coach, session or input mode. */
export const PublicLandingLearningScenes = ({ copy, imageCaption }: PublicLandingLearningScenesProps) => {
  const [requestedScene, setRequestedScene] = useState<Scene>('writing')
  const [voiceReady, setVoiceReady] = useState(false)
  const [voiceFailed, setVoiceFailed] = useState(false)
  const [voiceAttempt, setVoiceAttempt] = useState(0)
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null)
  const activeScene = requestedScene === 'voice' && voiceReady ? 'voice' : 'writing'
  const loading = requestedScene === 'voice' && !voiceReady && !voiceFailed

  const selectScene = (scene: Scene) => {
    if (scene === 'voice' && voiceFailed) {
      setVoiceFailed(false)
      setVoiceAttempt((attempt) => attempt + 1)
    }
    setRequestedScene(scene)
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = gesture.current
    gesture.current = null
    if (!start || start.id !== event.pointerId) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      selectScene(dx < 0 ? 'voice' : 'writing')
    }
  }

  return (
    <>
      <div
        className="public-landing-hero-visual"
        data-scene={activeScene}
        onPointerDown={(event) => {
          if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
          if (!event.isPrimary) {
            gesture.current = null
            return
          }
          gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
        }}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { gesture.current = null }}
      >
        <img
          data-testid="public-landing-hero-image"
          className="public-landing-hero-image public-landing-scene-image"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          data-active={activeScene === 'writing'}
          src="/images/skillpilot-learning-moment.png"
          alt=""
          width={1448}
          height={1086}
          fetchPriority="high"
          decoding="async"
          draggable={false}
        />
        {(requestedScene === 'voice' || voiceReady) && (
          <img
            key={voiceAttempt}
            data-testid="public-landing-voice-image"
            className="public-landing-hero-image public-landing-scene-image public-landing-voice-image"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            data-active={activeScene === 'voice'}
            src="/images/skillpilot-voice-moment.png"
            alt=""
            width={1672}
            height={941}
            decoding="async"
            draggable={false}
            onLoad={() => { setVoiceReady(true) }}
            onError={() => { setVoiceFailed(true) }}
          />
        )}
        <span className="public-landing-image-caption">{imageCaption}</span>
      </div>
      <div
        role="group"
        aria-label={copy.label}
        data-testid="public-landing-scene-controls"
        className="public-landing-scene-controls"
        onKeyDown={(event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
          event.preventDefault()
          const index = event.key === 'ArrowLeft' ? 0 : 1
          selectScene(index === 0 ? 'writing' : 'voice')
          event.currentTarget.querySelectorAll('button')[index]?.focus()
        }}
      >
        <button
          type="button"
          data-testid="public-landing-scene-writing"
          aria-pressed={activeScene === 'writing'}
          onClick={() => selectScene('writing')}
        >
          {copy.writing}
        </button>
        <button
          type="button"
          data-testid="public-landing-scene-voice"
          aria-pressed={activeScene === 'voice'}
          aria-busy={loading}
          title={voiceFailed ? copy.unavailable : undefined}
          onClick={() => selectScene('voice')}
        >
          {loading && <LoaderCircle size={14} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          {voiceFailed && <CircleAlert size={14} aria-hidden="true" />}
          {copy.voice}
        </button>
      </div>
      <span className="sr-only" role="status">
        {loading ? copy.loading : requestedScene === 'voice' && voiceFailed ? copy.unavailable : activeScene === 'voice' ? copy.voice : copy.writing}
      </span>
    </>
  )
}
