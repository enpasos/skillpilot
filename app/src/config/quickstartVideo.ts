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
    url: '/media/quickstart/learning/2026-11-24/de/sha256-0909986cc26217987fc4f491f6a257f922fe2646a62a51e2d74d89d79e6a53bd.mp4',
    poster: '/media/quickstart/learning/2026-11-24/de/sha256-00f20bb877c44355e057e1e24f272d0b5a21fda62c28d98dca17b6955c15bcdc.webp',
    tracks: [
      {
        src: '/media/quickstart/learning/2026-11-24/de/sha256-40db4a97c55d4a89430333f16920938af56a284b2f58070ba89e94b79e93b5fc.vtt',
        srcLang: 'de',
        label: 'Deutsch',
        kind: 'captions',
        default: false,
      },
    ],
  },
  en: {
    url: '/media/quickstart/learning/2026-11-24/en/sha256-2ae412fb2582a158e98ccec54f33ec4ee87b453341ff56e6e91dd60cd50044eb.mp4',
    poster: '/media/quickstart/learning/2026-11-24/en/sha256-df511911d1c1f1c63c02ca37a017e71e326e34e1da69ae25cb602a95e7cb001f.webp',
    tracks: [
      {
        src: '/media/quickstart/learning/2026-11-24/en/sha256-e049dfd186796b983ccff92786a7821a0b9594dbdba92ff815d36d789f3188ba.vtt',
        srcLang: 'en',
        label: 'English',
        kind: 'captions',
        default: false,
      },
    ],
  },
}

export const getQuickstartVideo = (language: LabelLanguage) => QUICKSTART_VIDEOS[language]
