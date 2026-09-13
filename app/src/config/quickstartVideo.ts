import type { MarkdownDocumentVideoTrack } from '../components/MarkdownDocumentVideoCard'
import type { LabelLanguage } from '../utils/filterLabels'

interface QuickstartVideo {
  url: string
  poster: string
  tracks: readonly MarkdownDocumentVideoTrack[]
}

// Each page uses its own narrated tutorial, independent of historical review evidence.
// A missing export never falls back to a video in the other language.
export const QUICKSTART_VIDEOS: Record<LabelLanguage, QuickstartVideo | null> = {
  de: {
    url: '/media/quickstart/claude/2026-09-13/de/sha256-a8cbf7dd81d9c63d2b1d0e1492263453feb3e9ae9823a43a8a4d6418da235584.mp4',
    poster: '/media/quickstart/claude/2026-09-13/de/sha256-ddd959ff1429832232a75d95922b360c2311af020d30b3e5e3039410a592e592.webp',
    tracks: [
      {
        src: '/media/quickstart/claude/2026-09-13/de/sha256-813c961b8324ba8ef89e51288c74eb2ca1d9d95cddbf4b70dfa860184f113be3.vtt',
        srcLang: 'de',
        label: 'Deutsch',
        kind: 'captions',
        default: true,
      },
    ],
  },
  en: {
    url: '/media/quickstart/claude/2026-09-13/en/sha256-0de8546e5efb666fef45ef7daaf821a8bc8f37d4e6818cc63c05be5fb00812ff.mp4',
    poster: '/media/quickstart/claude/2026-09-13/en/sha256-c082f1d2f84295974b9f2ea89b6f08b2735dab91b661f88c647b277b9123be48.webp',
    tracks: [
      {
        src: '/media/quickstart/claude/2026-09-13/en/sha256-9db199a18168911046a61c31196adde59ac460134c3c3f33253c775a91b6ae30.vtt',
        srcLang: 'en',
        label: 'English',
        kind: 'captions',
        default: true,
      },
    ],
  },
}

export const getQuickstartVideo = (language: LabelLanguage) => QUICKSTART_VIDEOS[language]
