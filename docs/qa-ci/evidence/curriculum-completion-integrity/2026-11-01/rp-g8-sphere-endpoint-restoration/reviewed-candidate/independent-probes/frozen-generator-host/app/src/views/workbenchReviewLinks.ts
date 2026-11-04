import {
  GOAL_BOOK_PDF_URL,
  PHYSICS_GOAL_BOOK_PDF_URL,
} from '../utils/goalBookRuntime'
import { goalBookRoute } from '../utils/goalBookPublicationRegistry'

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
      title: 'Lernzielbuch Mathematik – Review-Pilot',
      path: goalBookRoute('de-gym-mathematik-bundesweit'),
      description: 'Öffnet die schreibgeschützte Webansicht mit Kapitelnavigation, Suche, Lernziel-IDs und requires-Deep-Links.',
      scope: 'fachliche und didaktische Prüfung des bundesweiten Mathematik-Atlas für Sekundarstufe I und II',
      download: false,
    },
    {
      title: 'Lernzielbuch Mathematik – PDF',
      path: GOAL_BOOK_PDF_URL,
      description: 'Lädt die gebundene PDF-Ausgabe mit genau einem Lernziel pro Seite herunter.',
      scope: 'Offline-Review, KI-Review und Weitergabe der aktuellen Buchausgabe',
      download: true,
    },
    {
      title: 'Lernzielbuch Physik – Review-Pilot',
      path: goalBookRoute('de-gym-physik-bundesweit'),
      description: 'Öffnet den schreibgeschützten bundesweiten Physik-Atlas mit Kapitelnavigation, Suche, Lernziel-IDs und requires-Deep-Links.',
      scope: 'fachliche und didaktische Prüfung des bundesweiten Physik-Atlas für Sekundarstufe I und II',
      download: false,
    },
    {
      title: 'Lernzielbuch Physik – PDF',
      path: PHYSICS_GOAL_BOOK_PDF_URL,
      description: 'Lädt die gebundene Physik-PDF-Ausgabe mit genau einem Lernziel pro Seite herunter.',
      scope: 'Offline-Review, KI-Review und Weitergabe der aktuellen Physik-Buchausgabe',
      download: true,
    },
  ],
  en: [
    {
      title: 'Mathematics Learning Goal Book – Review Pilot',
      path: goalBookRoute('de-gym-mathematik-bundesweit'),
      description: 'Opens the read-only web view with chapter navigation, search, full goal IDs, and requires deep links.',
      scope: 'subject and didactic review of the nationwide lower- and upper-secondary mathematics atlas',
      download: false,
    },
    {
      title: 'Mathematics Learning Goal Book – PDF',
      path: GOAL_BOOK_PDF_URL,
      description: 'Downloads the bound PDF edition with exactly one learning goal per page.',
      scope: 'offline review, AI review, and sharing of the current book edition',
      download: true,
    },
    {
      title: 'Physics Learning Goal Book – Review Pilot',
      path: goalBookRoute('de-gym-physik-bundesweit'),
      description: 'Opens the read-only nationwide physics atlas with chapter navigation, search, full goal IDs, and requires deep links.',
      scope: 'subject and didactic review of the nationwide lower- and upper-secondary physics atlas',
      download: false,
    },
    {
      title: 'Physics Learning Goal Book – PDF',
      path: PHYSICS_GOAL_BOOK_PDF_URL,
      description: 'Downloads the bound physics PDF edition with exactly one learning goal per page.',
      scope: 'offline review, AI review, and sharing of the current physics book edition',
      download: true,
    },
  ],
}
