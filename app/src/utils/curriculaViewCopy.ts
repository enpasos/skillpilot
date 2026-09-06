import type { LabelLanguage } from './filterLabels'
import type {
  CurriculumQualityFilter,
  CurriculumQualityStatus,
} from './curriculumQualityTrafficLight'

export interface CurriculaViewCopy {
  pageTitle: string
  pageSubtitle: string
  feedbackTitle: string
  feedbackDescription: string
  feedbackSteps: string
  feedbackAccessNote: string
  feedbackSubjects: readonly { label: string; bookId: string; scopeNote?: string }[]
  openGoals: string
  feedbackNotAvailable: string
  githubFallback: string
  githubTitle: string
  githubDescription: string
  githubAction: string
  otherCurriculaFeedback: string
  championIntroTitle: string
  championIntroDescription: string
  championPanels: readonly { title: string; text: string }[]
  registrationDescription: string
  learningProgressLabel: string
  topicsLabel: string
  noTopicsAvailable: string
  loggedInAsGithubUser: string
  deregisterEntriesBadge: (count: number) => string
  deregisterGoalsBadge: (count: number) => string
  qualityFilterLabel: string
  qualityFilterOptions: Record<CurriculumQualityFilter, string>
  qualityStatusLabels: Record<CurriculumQualityStatus, string>
  qualityStatusTitle: (status: CurriculumQualityStatus) => string
}

export const getCurriculaViewCopy = (language: LabelLanguage): CurriculaViewCopy => (
  language === 'en'
    ? {
        pageTitle: 'Improve curricula together',
        pageSubtitle: 'Your experience with a learning goal helps improve its content, wording and clarity.',
        feedbackTitle: 'Feedback directly on a learning goal',
        feedbackDescription: 'Found an error, a gap or something unclear? Send your feedback from the goal it concerns.',
        feedbackSteps: 'Open an available goal book, choose a learning goal, then select “Feedback on this learning goal”. The feedback includes the goal and its current version.',
        feedbackAccessNote: 'Public goal feedback does not require a GitHub account or Champion registration.',
        feedbackSubjects: [
          { label: 'Mathematics', bookId: 'de-gym-mathematik-bundesweit' },
          { label: 'Physics', bookId: 'de-gym-physik-bundesweit' },
          { label: 'Chemistry', bookId: 'de-gym-chemie-bundesweit', scopeNote: 'Nationwide overview with applicability and original sources per goal' },
          { label: 'Biology', bookId: 'de-gym-biologie-bundesweit', scopeNote: 'Lower secondary: 16 states; upper secondary: currently Hesse and Bavaria' },
        ],
        openGoals: 'Open learning goals',
        feedbackNotAvailable: 'A direct goal-feedback entry is not available here yet.',
        githubFallback: 'Give feedback on GitHub',
        githubTitle: 'Larger ideas and technical topics',
        githubDescription: 'Use GitHub for broader changes, topics spanning several goals and technical issues. Issues and pull requests remain available there.',
        githubAction: 'Discuss a larger topic on GitHub',
        otherCurriculaFeedback: 'For other curricula without a direct goal-feedback entry, please also use GitHub and name the curriculum and topic.',
        championIntroTitle: 'What is a Curriculum Champion?',
        championIntroDescription: 'Champions provide long-term practical experience for a curriculum or a clearly scoped topic. You can give goal feedback without taking on this role.',
        championPanels: [
          { title: 'Commit', text: 'Make the curriculum useful in the context you care about.' },
          { title: 'Learn', text: 'Work through learning goals yourself and notice what works and what is unclear.' },
          { title: 'Improve', text: 'Give feedback directly on a learning goal. Bring larger or technical topics to GitHub.' },
          { title: 'Connect', text: 'Bring teachers, learners and curriculum owners together.' },
        ],
        registrationDescription: 'Champion registration is optional and independent of public goal feedback. Register here if you want to take on a longer-term role, or manage an existing role.',
        learningProgressLabel: 'Learning progress',
        topicsLabel: 'Topics',
        noTopicsAvailable: 'No topics available.',
        loggedInAsGithubUser: 'Logged in as GitHub user',
        deregisterEntriesBadge: (count: number) => `${count} entries`,
        deregisterGoalsBadge: (count: number) => `${count} goals`,
        qualityFilterLabel: 'Quality status',
        qualityFilterOptions: {
          green: 'Human QA',
          orange: 'Automated QA',
          red: 'Experimental',
          all: 'All',
        },
        qualityStatusLabels: {
          green: 'Human QA',
          orange: 'Automated QA',
          red: 'Experimental',
        },
        qualityStatusTitle: (status: CurriculumQualityStatus) => (
          `Quality status: ${
            status === 'green'
              ? 'Human QA'
              : status === 'orange'
                ? 'Automated QA'
                : 'Experimental'
          }`
        ),
      }
    : {
        pageTitle: 'Curricula gemeinsam verbessern',
        pageSubtitle: 'Deine Erfahrung mit einem Lernziel hilft, Inhalte, Formulierungen und Verständlichkeit zu verbessern.',
        feedbackTitle: 'Feedback direkt am Lernziel',
        feedbackDescription: 'Ein Fehler, eine Lücke oder etwas unklar? Sende deine Rückmeldung direkt bei dem Lernziel, um das es geht.',
        feedbackSteps: 'Öffne ein verfügbares Lernzielbuch, wähle ein Lernziel und dort „Feedback zu diesem Lernziel“. Die Rückmeldung enthält das Ziel und seine aktuelle Fassung.',
        feedbackAccessNote: 'Öffentliches Lernziel-Feedback braucht weder ein GitHub-Konto noch eine Champion-Registrierung.',
        feedbackSubjects: [
          { label: 'Mathematik', bookId: 'de-gym-mathematik-bundesweit' },
          { label: 'Physik', bookId: 'de-gym-physik-bundesweit' },
          { label: 'Chemie', bookId: 'de-gym-chemie-bundesweit', scopeNote: 'Bundesweite Übersicht mit Geltung und Originalquellen je Lernziel' },
          { label: 'Biologie', bookId: 'de-gym-biologie-bundesweit', scopeNote: 'Sek I: 16 Länder; Sek II: derzeit Hessen und Bayern' },
        ],
        openGoals: 'Lernziele öffnen',
        feedbackNotAvailable: 'Hier gibt es noch keinen direkten Einstieg zum Lernziel-Feedback.',
        githubFallback: 'Feedback auf GitHub geben',
        githubTitle: 'Größere Ideen und technische Themen',
        githubDescription: 'Für größere Änderungen, Themen über mehrere Lernziele hinweg und technische Probleme ist GitHub der passende Ort. Issues und Pull Requests bleiben dort möglich.',
        githubAction: 'Größeres Thema auf GitHub besprechen',
        otherCurriculaFeedback: 'Für weitere Curricula ohne direkten Feedbackeinstieg nutze ebenfalls GitHub und nenne das Curriculum und das Thema.',
        championIntroTitle: 'Was ist ein Curriculum-Champion?',
        championIntroDescription: 'Champions bringen langfristig Praxiserfahrung für ein Curriculum oder einen klaren Themen-Scope ein. Lernziel-Feedback kannst du auch ohne diese Rolle geben.',
        championPanels: [
          { title: 'Engagement', text: 'Mach das Curriculum in deinem Kontext praktisch nutzbar.' },
          { title: 'Durchlernen', text: 'Lerne Ziele selbst durch und entdecke, was funktioniert und wo es noch hakt.' },
          { title: 'Verbessern', text: 'Gib Feedback direkt am Lernziel. Größere oder technische Themen gehören auf GitHub.' },
          { title: 'Vernetzen', text: 'Verbinde Lehrende, Lernende und Curriculum-Verantwortliche.' },
        ],
        registrationDescription: 'Die Champion-Registrierung ist freiwillig und unabhängig vom öffentlichen Lernziel-Feedback. Melde dich hier für ein längerfristiges Engagement an oder verwalte eine bestehende Rolle.',
        learningProgressLabel: 'Lernfortschritt',
        topicsLabel: 'Themen',
        noTopicsAvailable: 'Keine Themen verfügbar.',
        loggedInAsGithubUser: 'Als GitHub-Nutzer eingeloggt',
        deregisterEntriesBadge: (count: number) => `${count} Einträge`,
        deregisterGoalsBadge: (count: number) => `${count} Ziele`,
        qualityFilterLabel: 'Qualitätsampel',
        qualityFilterOptions: {
          green: 'Menschliche QS',
          orange: 'Maschinelle QS',
          red: 'Experimentell',
          all: 'Alle',
        },
        qualityStatusLabels: {
          green: 'Menschliche QS',
          orange: 'Maschinelle QS',
          red: 'Experimentell',
        },
        qualityStatusTitle: (status: CurriculumQualityStatus) => (
          `Qualitätsstatus: ${
            status === 'green'
              ? 'Menschliche QS'
              : status === 'orange'
                ? 'Maschinelle QS'
                : 'Experimentell'
          }`
        ),
      }
)
