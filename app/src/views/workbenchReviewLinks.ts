import { GOAL_BOOK_PDF_URL } from '../utils/goalBookRuntime'

interface WorkbenchReviewLinkDefinition {
  title: string
  path: string
  description: string
  scope: string
  download: boolean
}

export const WORKBENCH_REVIEW_LINK_DEFINITIONS: Record<
  'de' | 'en',
  WorkbenchReviewLinkDefinition[]
> = {
  de: [
    {
      title: 'Lernzielbuch – Review-Pilot',
      path: '/lernzielbuch',
      description: 'Öffnet die schreibgeschützte Webansicht mit Kapitelnavigation, Suche, Lernziel-IDs und requires-Deep-Links.',
      scope: 'fachliche und didaktische Prüfung des bundesweiten Mathematik-Atlas für Sekundarstufe I und II',
      download: false,
    },
    {
      title: 'Lernzielbuch – PDF',
      path: GOAL_BOOK_PDF_URL,
      description: 'Lädt die gebundene PDF-Ausgabe mit genau einem Lernziel pro Seite herunter.',
      scope: 'Offline-Review, KI-Review und Weitergabe der aktuellen Buchausgabe',
      download: true,
    },
  ],
  en: [
    {
      title: 'Learning Goal Book – Review Pilot',
      path: '/lernzielbuch',
      description: 'Opens the read-only web view with chapter navigation, search, full goal IDs, and requires deep links.',
      scope: 'subject and didactic review of the nationwide lower- and upper-secondary mathematics atlas',
      download: false,
    },
    {
      title: 'Learning Goal Book – PDF',
      path: GOAL_BOOK_PDF_URL,
      description: 'Downloads the bound PDF edition with exactly one learning goal per page.',
      scope: 'offline review, AI review, and sharing of the current book edition',
      download: true,
    },
  ],
}
