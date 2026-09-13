import type { MarkdownDocumentVideoTrack } from '../components/MarkdownDocumentVideoCard'
import type { LabelLanguage } from '../utils/filterLabels'

interface QuickstartVideo {
  url: string
  poster: string
  tracks: readonly MarkdownDocumentVideoTrack[]
}

// Each page uses its own narrated tutorial, independent of historical review evidence.
// A missing export never falls back to a video in the other language.
// Captions stay available in the player without being enabled by default.
export const QUICKSTART_VIDEOS: Record<LabelLanguage, QuickstartVideo | null> = {
  de: {
    url: '/media/quickstart/claude/2026-09-13/de/sha256-807d717e651bc789a6c5dadb0d2a6015510862c5e4ecfe517623a596cacf945a.mp4',
    poster: '/media/quickstart/claude/2026-09-13/de/sha256-ff24179da7398ff23613472f138b21faae0c39e2425481764c8ab110fdc91823.webp',
    tracks: [
      {
        src: '/media/quickstart/claude/2026-09-13/de/sha256-bc0d920cfc8ab811473d006f137dd103aa35bf2ddaaa3f7c14c8c915ac3200fc.vtt',
        srcLang: 'de',
        label: 'Deutsch',
        kind: 'captions',
        default: false,
      },
    ],
  },
  en: {
    url: '/media/quickstart/claude/2026-09-13/en/sha256-29c3a5606e9ca4f22815a13ba6f8e56990a32e9a151a11fdaee37605de0b54b2.mp4',
    poster: '/media/quickstart/claude/2026-09-13/en/sha256-c082f1d2f84295974b9f2ea89b6f08b2735dab91b661f88c647b277b9123be48.webp',
    tracks: [
      {
        src: '/media/quickstart/claude/2026-09-13/en/sha256-76792a440ba97001cb56c25b93dc9bb7e56cf5d8783ed080497bc751a5a8cf64.vtt',
        srcLang: 'en',
        label: 'English',
        kind: 'captions',
        default: false,
      },
    ],
  },
}

export const getQuickstartVideo = (language: LabelLanguage) => QUICKSTART_VIDEOS[language]
