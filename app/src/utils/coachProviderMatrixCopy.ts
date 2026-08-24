import type { LabelLanguage } from './filterLabels'

export type CoachMatrixStatus =
  | 'available'
  | 'tested'
  | 'conditional'
  | 'planned'
  | 'unavailable'
  | 'admin'

export type CoachMatrixVariantId =
  | 'chatgpt-free-go'
  | 'chatgpt-plus-pro'
  | 'chatgpt-business'
  | 'chatgpt-enterprise-edu'
  | 'claude-free'
  | 'claude-pro-max'
  | 'claude-team-enterprise'

export type CoachMatrixProvider = 'ChatGPT' | 'Claude'

export interface CoachMatrixCell {
  status: CoachMatrixStatus
  value: string
  note?: string
}

export interface CoachMatrixVariant {
  id: CoachMatrixVariantId
  provider: CoachMatrixProvider
  plan: string
  badge?: string
  summary: string
}

export interface CoachMatrixRow {
  id: string
  feature: string
  cells: Record<CoachMatrixVariantId, CoachMatrixCell>
}

export interface CoachMatrixGroup {
  id: string
  title: string
  rows: CoachMatrixRow[]
}

export interface CoachMatrixSource {
  id: string
  label: string
  href: string
}

export interface CoachProviderMatrixCopy {
  title: string
  intro: string
  asOf: string
  featureHeading: string
  mobileFeatureHeading: string
  providerFilterLabel: string
  providerFilterHint: string
  statusLabels: Record<CoachMatrixStatus, string>
  legendLabel: string
  startTitle: string
  startText: string
  privacyTitle: string
  privacyText: string
  caveat: string
  variants: CoachMatrixVariant[]
  groups: CoachMatrixGroup[]
  sourcesTitle: string
  sourcesNote: string
  sources: CoachMatrixSource[]
}

const cell = (status: CoachMatrixStatus, value: string, note?: string): CoachMatrixCell => ({
  status,
  value,
  ...(note ? { note } : {}),
})

const providerCells = (
  chatgpt: CoachMatrixCell,
  claude: CoachMatrixCell,
): Record<CoachMatrixVariantId, CoachMatrixCell> => ({
  'chatgpt-free-go': chatgpt,
  'chatgpt-plus-pro': chatgpt,
  'chatgpt-business': chatgpt,
  'chatgpt-enterprise-edu': chatgpt,
  'claude-free': claude,
  'claude-pro-max': claude,
  'claude-team-enterprise': claude,
})

const germanVariants: CoachMatrixVariant[] = [
  {
    id: 'chatgpt-free-go',
    provider: 'ChatGPT',
    plan: 'Free / Go',
    summary: 'Ob SkillPilot angeboten wird, kann je nach Konto und Region unterschiedlich sein.',
  },
  {
    id: 'chatgpt-plus-pro',
    provider: 'ChatGPT',
    plan: 'Plus / Pro',
    badge: 'Empfehlung für Einzelpersonen',
    summary: 'Der bevorzugte persönliche Zugang, sobald SkillPilot öffentlich freigegeben ist.',
  },
  {
    id: 'chatgpt-business',
    provider: 'ChatGPT',
    plan: 'Business',
    summary: 'Für ein Konto deiner Schule oder einer anderen Organisation kann eine Freigabe erforderlich sein.',
  },
  {
    id: 'chatgpt-enterprise-edu',
    provider: 'ChatGPT',
    plan: 'Enterprise / Edu',
    summary: 'Geeignet für ein Konto deiner Schule oder Organisation, wenn SkillPilot dort freigegeben wurde.',
  },
  {
    id: 'claude-free',
    provider: 'Claude',
    plan: 'Free',
    summary: 'Das vollständige SkillPilot-Plugin ist in Claude Free nicht verfügbar. Möglich ist höchstens ein separat eingerichteter Custom Connector ohne Coaching-Skill.',
  },
  {
    id: 'claude-pro-max',
    provider: 'Claude',
    plan: 'Pro / Max',
    summary: 'Das vollständige Plugin ist für geeignete bezahlte Claude-Konten im Web vorgesehen; SkillPilot ist für neue Lernende aber noch nicht freigegeben.',
  },
  {
    id: 'claude-team-enterprise',
    provider: 'Claude',
    plan: 'Team / Enterprise',
    summary: 'Das vollständige Plugin ist im Web vorgesehen; für ein Organisationskonto kann zusätzlich eine Freigabe nötig sein.',
  },
]

const englishVariants: CoachMatrixVariant[] = [
  {
    id: 'chatgpt-free-go',
    provider: 'ChatGPT',
    plan: 'Free / Go',
    summary: 'Whether SkillPilot is offered can vary by account and region.',
  },
  {
    id: 'chatgpt-plus-pro',
    provider: 'ChatGPT',
    plan: 'Plus / Pro',
    badge: 'Recommended for individuals',
    summary: 'The preferred personal access route once SkillPilot has been released publicly.',
  },
  {
    id: 'chatgpt-business',
    provider: 'ChatGPT',
    plan: 'Business',
    summary: 'An account provided by your school or another organisation may require approval.',
  },
  {
    id: 'chatgpt-enterprise-edu',
    provider: 'ChatGPT',
    plan: 'Enterprise / Edu',
    summary: 'Suitable for an account provided by your school or organisation when SkillPilot has been enabled there.',
  },
  {
    id: 'claude-free',
    provider: 'Claude',
    plan: 'Free',
    summary: 'The complete SkillPilot plugin is not available on Claude Free. At most one separately configured Custom Connector without the coaching Skill is possible.',
  },
  {
    id: 'claude-pro-max',
    provider: 'Claude',
    plan: 'Pro / Max',
    summary: 'The complete plugin is intended for eligible paid Claude accounts on the web, but SkillPilot has not yet been released for new learners.',
  },
  {
    id: 'claude-team-enterprise',
    provider: 'Claude',
    plan: 'Team / Enterprise',
    summary: 'The complete plugin is intended for the web; an organisation account may also require approval.',
  },
]

const germanGroups: CoachMatrixGroup[] = [
  {
    id: 'access',
    title: 'Zugang und Voraussetzungen',
    rows: [
      {
        id: 'current-access',
        feature: 'Kann ich SkillPilot damit derzeit neu einrichten?',
        cells: {
          'chatgpt-free-go': cell('planned', 'Noch nicht öffentlich verfügbar', 'Bereits freigeschaltete Testpersonen nutzen den Zugang, den sie erhalten haben.'),
          'chatgpt-plus-pro': cell('planned', 'Noch nicht öffentlich verfügbar', 'Bereits freigeschaltete Testpersonen nutzen den Zugang, den sie erhalten haben.'),
          'chatgpt-business': cell('planned', 'Noch nicht öffentlich verfügbar', 'Bereits freigeschaltete Testpersonen nutzen den Zugang, den sie erhalten haben.'),
          'chatgpt-enterprise-edu': cell('planned', 'Noch nicht öffentlich verfügbar', 'Bereits freigeschaltete Testpersonen nutzen den Zugang, den sie erhalten haben.'),
          'claude-free': cell('unavailable', 'Vollständiges Plugin nicht verfügbar', 'Claude Free bietet nur einen separat eingerichteten Custom Connector ohne Coaching-Skill.'),
          'claude-pro-max': cell('planned', 'Plugin noch nicht für neue Lernende freigegeben'),
          'claude-team-enterprise': cell('planned', 'Plugin noch nicht für neue Lernende freigegeben'),
        },
      },
      {
        id: 'provider-plan',
        feature: 'Welches Konto kommt grundsätzlich infrage?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Abhängig von deinem Konto', 'Nach der Veröffentlichung im eigenen Konto prüfen.'),
          'chatgpt-plus-pro': cell('available', 'Persönlicher Zugang möglich'),
          'chatgpt-business': cell('admin', 'Frag die Person, die euer Konto verwaltet'),
          'chatgpt-enterprise-edu': cell('admin', 'Freigabe durch Schule oder Organisation nötig'),
          'claude-free': cell('unavailable', 'Kein vollständiger Plugin-Zugang', 'Nur ein separater Custom Connector ohne Coaching-Skill ist möglich.'),
          'claude-pro-max': cell('available', 'Vollständiges Plugin mit geeignetem bezahlten Konto möglich', 'SkillPilot selbst ist dort noch nicht freigegeben.'),
          'claude-team-enterprise': cell('admin', 'Vollständiges Plugin nach Freigabe durch deine Organisation möglich'),
        },
      },
      {
        id: 'minimum-age',
        feature: 'Wie alt muss ich für das ChatGPT- oder Claude-Konto sein?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Mindestens 13 Jahre oder nationales Mindestalter', 'Unter 18 brauchst du die Zustimmung eines Elternteils oder einer sorgeberechtigten Person.'),
          'chatgpt-plus-pro': cell('conditional', 'Mindestens 13 Jahre oder nationales Mindestalter', 'Unter 18 brauchst du die Zustimmung eines Elternteils oder einer sorgeberechtigten Person.'),
          'chatgpt-business': cell('admin', 'Mindestens 13 Jahre oder nationales Mindestalter', 'Zusätzlich können Regeln deiner Schule oder Organisation gelten.'),
          'chatgpt-enterprise-edu': cell('admin', 'Mindestens 13 Jahre oder nationales Mindestalter', 'Zusätzlich können Regeln deiner Schule oder Organisation gelten.'),
          'claude-free': cell('unavailable', 'Mindestens 18 Jahre'),
          'claude-pro-max': cell('unavailable', 'Mindestens 18 Jahre'),
          'claude-team-enterprise': cell('unavailable', 'Mindestens 18 Jahre'),
        },
      },
      {
        id: 'cost',
        feature: 'Entstehen zusätzliche Kosten?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'SkillPilot selbst ohne zusätzliche Gebühr', 'Ob dein ChatGPT-Konto genügt, zeigt sich erst nach der Veröffentlichung.'),
          'chatgpt-plus-pro': cell('conditional', 'Bezahlter Anbieter-Tarif', 'SkillPilot selbst berechnet keine zusätzliche Gebühr.'),
          'chatgpt-business': cell('admin', 'Wird von deiner Organisation festgelegt'),
          'chatgpt-enterprise-edu': cell('admin', 'Wird von Schule oder Organisation festgelegt'),
          'claude-free': cell('unavailable', 'Kein vollständiger Plugin-Zugang', 'Der separate Custom Connector enthält keinen Coaching-Skill.'),
          'claude-pro-max': cell('conditional', 'Bezahlter Anbieter-Tarif', 'SkillPilot selbst berechnet keine zusätzliche Gebühr.'),
          'claude-team-enterprise': cell('admin', 'Wird von deiner Organisation festgelegt'),
        },
      },
    ],
  },
  {
    id: 'safe-start',
    title: 'Sicher starten',
    rows: [
      {
        id: 'start-path',
        feature: 'Wie beginne ich eine Lernsession?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Nach der Veröffentlichung in SkillPilot „Lernen starten“ wählen', 'Nur wenn SkillPilot in deinem Konto angeboten wird.'),
          'chatgpt-plus-pro': cell('tested', 'Immer in SkillPilot „Lernen starten“ wählen'),
          'chatgpt-business': cell('admin', 'Nach der Freigabe in SkillPilot „Lernen starten“ wählen'),
          'chatgpt-enterprise-edu': cell('admin', 'Nach der Freigabe in SkillPilot „Lernen starten“ wählen'),
          'claude-free': cell('unavailable', 'Kein vollständiger Plugin-Start', 'Der separate Custom Connector ersetzt das Plugin mit Coaching-Skill nicht.'),
          'claude-pro-max': cell('planned', 'Nach Freigabe ebenfalls über „Lernen starten“'),
          'claude-team-enterprise': cell('admin', 'Nach Freigabe ebenfalls über „Lernen starten“'),
        },
      },
      {
        id: 'session-duration',
        feature: 'Wie lange bleibt die Lernsession gültig?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Nach Veröffentlichung: 24 Stunden ab dem Start'),
          'chatgpt-plus-pro': cell('tested', '24 Stunden ab dem Start', 'Danach in SkillPilot eine neue Lernsession starten.'),
          'chatgpt-business': cell('admin', 'Nach Freigabe: 24 Stunden ab dem Start'),
          'chatgpt-enterprise-edu': cell('admin', 'Nach Freigabe: 24 Stunden ab dem Start'),
          'claude-free': cell('unavailable', 'Nicht über das vollständige Plugin verfügbar', 'Claude Free bietet nur den separaten Custom Connector.'),
          'claude-pro-max': cell('planned', 'Nach Freigabe: 24 Stunden ab dem Start'),
          'claude-team-enterprise': cell('admin', 'Nach Freigabe: 24 Stunden ab dem Start'),
        },
      },
      {
        id: 'privacy-boundary',
        feature: 'Was muss ich beim Teilen beachten?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Dauerhafter Lernstand bleibt bei SkillPilot', 'Teile die vorbereitete Startnachricht und den Lernchat nicht mit anderen.'),
          'chatgpt-plus-pro': cell('tested', 'Dauerhafter Lernstand bleibt bei SkillPilot', 'Teile die vorbereitete Startnachricht und den Lernchat nicht mit anderen.'),
          'chatgpt-business': cell('admin', 'Dauerhafter Lernstand bleibt bei SkillPilot', 'Teile die vorbereitete Startnachricht und den Lernchat nicht mit anderen.'),
          'chatgpt-enterprise-edu': cell('admin', 'Dauerhafter Lernstand bleibt bei SkillPilot', 'Teile die vorbereitete Startnachricht und den Lernchat nicht mit anderen.'),
          'claude-free': cell('unavailable', 'Kein vollständiger Plugin-Zugang', 'Auch Zugangsdaten eines separaten Custom Connectors dürfen nicht geteilt werden.'),
          'claude-pro-max': cell('planned', 'Dieselbe Schutzregel gilt vor einer Freigabe als Voraussetzung'),
          'claude-team-enterprise': cell('admin', 'Dieselbe Schutzregel gilt vor einer Freigabe als Voraussetzung'),
        },
      },
    ],
  },
  {
    id: 'learning',
    title: 'Lernen und Geräte',
    rows: [
      {
        id: 'learning-features',
        feature: 'Welche SkillPilot-Lernfunktionen sind vorgesehen?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Aktuelles Lernziel, Fortschritt, Lernzielbilder, Kartenübungen und Abfragen', 'Nur wenn SkillPilot in deinem Konto angeboten wird.'),
          'chatgpt-plus-pro': cell('tested', 'Aktuelles Lernziel, Fortschritt, Lernzielbilder, Kartenübungen und Abfragen'),
          'chatgpt-business': cell('admin', 'Dieselben Lernfunktionen nach der Freigabe'),
          'chatgpt-enterprise-edu': cell('admin', 'Dieselben Lernfunktionen nach der Freigabe'),
          'claude-free': cell('unavailable', 'Kein vollständiges Plugin mit Coaching-Skill', 'Der separate Custom Connector ist nur die technische Verbindung.'),
          'claude-pro-max': cell('planned', 'Dieselben Lernfunktionen nach der Freigabe'),
          'claude-team-enterprise': cell('admin', 'Dieselben Lernfunktionen nach der Freigabe'),
        },
      },
      {
        id: 'photo-upload',
        feature: 'Kann ich Fotos meiner Arbeit hochladen?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Ja, wenn dein normaler Textchat Uploads anbietet', 'Persönliche Angaben vorher verdecken.'),
          'chatgpt-plus-pro': cell('conditional', 'Ja, wenn dein normaler Textchat Uploads anbietet', 'Persönliche Angaben vorher verdecken.'),
          'chatgpt-business': cell('conditional', 'Ja, wenn dein normaler Textchat Uploads anbietet', 'Persönliche Angaben vorher verdecken.'),
          'chatgpt-enterprise-edu': cell('conditional', 'Ja, wenn dein normaler Textchat Uploads anbietet', 'Persönliche Angaben vorher verdecken.'),
          'claude-free': cell('unavailable', 'Nicht über das vollständige Plugin verfügbar', 'Claude Free bietet nur den separaten Custom Connector.'),
          'claude-pro-max': cell('planned', 'Nach Freigabe, wenn dein normaler Textchat Uploads anbietet'),
          'claude-team-enterprise': cell('planned', 'Nach Freigabe, wenn dein normaler Textchat Uploads anbietet'),
        },
      },
      {
        id: 'browser-devices',
        feature: 'Welche Geräte kann ich verwenden?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Browser auf Computer, Tablet oder Smartphone', 'Nur wenn SkillPilot in deinem Konto angeboten wird.'),
          'chatgpt-plus-pro': cell('tested', 'Browser auf Computer, Tablet oder Smartphone'),
          'chatgpt-business': cell('admin', 'Browser auf Computer, Tablet oder Smartphone nach Freigabe'),
          'chatgpt-enterprise-edu': cell('admin', 'Browser auf Computer, Tablet oder Smartphone nach Freigabe'),
          'claude-free': cell('unavailable', 'Kein vollständiger Plugin-Zugang', 'Der separate Custom Connector enthält keinen Coaching-Skill.'),
          'claude-pro-max': cell('planned', 'Claude Web im Browser nach Freigabe'),
          'claude-team-enterprise': cell('admin', 'Claude Web im Browser nach Freigabe'),
        },
      },
      {
        id: 'native-mobile-app',
        feature: 'Soll ich die native App verwenden?',
        cells: providerCells(
          cell('unavailable', 'Nein, nutze den Browser'),
          cell('unavailable', 'Noch kein freigegebener SkillPilot-Weg'),
        ),
      },
      {
        id: 'dictation',
        feature: 'Kann ich meine Antwort diktieren?',
        cells: {
          'chatgpt-free-go': cell('available', 'Ja, als Texteingabe im normalen Chat', 'Prüfe den erkannten Text vor dem Senden.'),
          'chatgpt-plus-pro': cell('available', 'Ja, als Texteingabe im normalen Chat', 'Prüfe den erkannten Text vor dem Senden.'),
          'chatgpt-business': cell('available', 'Ja, als Texteingabe im normalen Chat', 'Prüfe den erkannten Text vor dem Senden.'),
          'chatgpt-enterprise-edu': cell('available', 'Ja, als Texteingabe im normalen Chat', 'Prüfe den erkannten Text vor dem Senden.'),
          'claude-free': cell('unavailable', 'Nicht über das vollständige Plugin verfügbar', 'Claude Free bietet nur den separaten Custom Connector.'),
          'claude-pro-max': cell('planned', 'Nach Freigabe als Texteingabe im normalen Chat'),
          'claude-team-enterprise': cell('planned', 'Nach Freigabe als Texteingabe im normalen Chat'),
        },
      },
      {
        id: 'voice-mode',
        feature: 'Kann ich den fortlaufenden Voice Mode nutzen?',
        cells: providerCells(
          cell('unavailable', 'Nein, mit SkillPilot nicht verwenden'),
          cell('unavailable', 'Nein, mit SkillPilot nicht verwenden'),
        ),
      },
    ],
  },
]

const englishGroups: CoachMatrixGroup[] = [
  {
    id: 'access',
    title: 'Access and requirements',
    rows: [
      {
        id: 'current-access',
        feature: 'Can I set up SkillPilot with this account now?',
        cells: {
          'chatgpt-free-go': cell('planned', 'Not publicly available yet', 'People who already have test access should use the access route they received.'),
          'chatgpt-plus-pro': cell('planned', 'Not publicly available yet', 'People who already have test access should use the access route they received.'),
          'chatgpt-business': cell('planned', 'Not publicly available yet', 'People who already have test access should use the access route they received.'),
          'chatgpt-enterprise-edu': cell('planned', 'Not publicly available yet', 'People who already have test access should use the access route they received.'),
          'claude-free': cell('unavailable', 'Complete plugin not available', 'Claude Free offers only a separately configured Custom Connector without the coaching Skill.'),
          'claude-pro-max': cell('planned', 'Plugin not yet released for new learners'),
          'claude-team-enterprise': cell('planned', 'Plugin not yet released for new learners'),
        },
      },
      {
        id: 'provider-plan',
        feature: 'Which account is eligible in principle?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Depends on your account', 'Check your own account after publication.'),
          'chatgpt-plus-pro': cell('available', 'Personal access is possible'),
          'chatgpt-business': cell('admin', 'Ask the person who manages your account'),
          'chatgpt-enterprise-edu': cell('admin', 'Approval from your school or organisation is required'),
          'claude-free': cell('unavailable', 'No complete plugin access', 'Only a separate Custom Connector without the coaching Skill is possible.'),
          'claude-pro-max': cell('available', 'Complete plugin possible with an eligible paid account', 'SkillPilot itself has not yet been released there.'),
          'claude-team-enterprise': cell('admin', 'Complete plugin possible after approval from your organisation'),
        },
      },
      {
        id: 'minimum-age',
        feature: 'How old must I be for the ChatGPT or Claude account?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'At least 13 or the minimum age in your country', 'If you are under 18, you need permission from a parent or legal guardian.'),
          'chatgpt-plus-pro': cell('conditional', 'At least 13 or the minimum age in your country', 'If you are under 18, you need permission from a parent or legal guardian.'),
          'chatgpt-business': cell('admin', 'At least 13 or the minimum age in your country', 'Additional rules from your school or organisation may apply.'),
          'chatgpt-enterprise-edu': cell('admin', 'At least 13 or the minimum age in your country', 'Additional rules from your school or organisation may apply.'),
          'claude-free': cell('unavailable', 'At least 18'),
          'claude-pro-max': cell('unavailable', 'At least 18'),
          'claude-team-enterprise': cell('unavailable', 'At least 18'),
        },
      },
      {
        id: 'cost',
        feature: 'Are there additional costs?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'No additional charge from SkillPilot', 'Whether your ChatGPT account is sufficient will become clear after publication.'),
          'chatgpt-plus-pro': cell('conditional', 'Paid provider plan', 'SkillPilot does not charge an additional fee.'),
          'chatgpt-business': cell('admin', 'Set by your organisation'),
          'chatgpt-enterprise-edu': cell('admin', 'Set by your school or organisation'),
          'claude-free': cell('unavailable', 'No complete plugin access', 'The separate Custom Connector does not include the coaching Skill.'),
          'claude-pro-max': cell('conditional', 'Paid provider plan', 'SkillPilot does not charge an additional fee.'),
          'claude-team-enterprise': cell('admin', 'Set by your organisation'),
        },
      },
    ],
  },
  {
    id: 'safe-start',
    title: 'Start safely',
    rows: [
      {
        id: 'start-path',
        feature: 'How do I begin a learning session?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'After publication, select “Start Learning” in SkillPilot', 'Only if SkillPilot is offered in your account.'),
          'chatgpt-plus-pro': cell('tested', 'Always select “Start Learning” in SkillPilot'),
          'chatgpt-business': cell('admin', 'After approval, select “Start Learning” in SkillPilot'),
          'chatgpt-enterprise-edu': cell('admin', 'After approval, select “Start Learning” in SkillPilot'),
          'claude-free': cell('unavailable', 'No complete plugin start', 'The separate Custom Connector does not replace the plugin with its coaching Skill.'),
          'claude-pro-max': cell('planned', 'After release, also use “Start Learning”'),
          'claude-team-enterprise': cell('admin', 'After approval, also use “Start Learning”'),
        },
      },
      {
        id: 'session-duration',
        feature: 'How long is the learning session valid?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'After publication: 24 hours from the start'),
          'chatgpt-plus-pro': cell('tested', '24 hours from the start', 'After that, start a new learning session in SkillPilot.'),
          'chatgpt-business': cell('admin', 'After approval: 24 hours from the start'),
          'chatgpt-enterprise-edu': cell('admin', 'After approval: 24 hours from the start'),
          'claude-free': cell('unavailable', 'Not available through the complete plugin', 'Claude Free offers only the separate Custom Connector.'),
          'claude-pro-max': cell('planned', 'After release: 24 hours from the start'),
          'claude-team-enterprise': cell('admin', 'After approval: 24 hours from the start'),
        },
      },
      {
        id: 'privacy-boundary',
        feature: 'What should I know before sharing?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Your long-term learning record stays with SkillPilot', 'Do not share the prepared start message or your learning chat with other people.'),
          'chatgpt-plus-pro': cell('tested', 'Your long-term learning record stays with SkillPilot', 'Do not share the prepared start message or your learning chat with other people.'),
          'chatgpt-business': cell('admin', 'Your long-term learning record stays with SkillPilot', 'Do not share the prepared start message or your learning chat with other people.'),
          'chatgpt-enterprise-edu': cell('admin', 'Your long-term learning record stays with SkillPilot', 'Do not share the prepared start message or your learning chat with other people.'),
          'claude-free': cell('unavailable', 'No complete plugin access', 'Do not share access details for a separate Custom Connector either.'),
          'claude-pro-max': cell('planned', 'The same protection is required before release'),
          'claude-team-enterprise': cell('admin', 'The same protection is required before release'),
        },
      },
    ],
  },
  {
    id: 'learning',
    title: 'Learning and devices',
    rows: [
      {
        id: 'learning-features',
        feature: 'Which SkillPilot learning features are planned?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Current learning goal, progress, goal images, card practice, and assessments', 'Only if SkillPilot is offered in your account.'),
          'chatgpt-plus-pro': cell('tested', 'Current learning goal, progress, goal images, card practice, and assessments'),
          'chatgpt-business': cell('admin', 'The same learning features after approval'),
          'chatgpt-enterprise-edu': cell('admin', 'The same learning features after approval'),
          'claude-free': cell('unavailable', 'No complete plugin with the coaching Skill', 'The separate Custom Connector is only the technical connection.'),
          'claude-pro-max': cell('planned', 'The same learning features after release'),
          'claude-team-enterprise': cell('admin', 'The same learning features after approval'),
        },
      },
      {
        id: 'photo-upload',
        feature: 'Can I upload photos of my work?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Yes, when your normal text chat offers uploads', 'Hide personal information first.'),
          'chatgpt-plus-pro': cell('conditional', 'Yes, when your normal text chat offers uploads', 'Hide personal information first.'),
          'chatgpt-business': cell('conditional', 'Yes, when your normal text chat offers uploads', 'Hide personal information first.'),
          'chatgpt-enterprise-edu': cell('conditional', 'Yes, when your normal text chat offers uploads', 'Hide personal information first.'),
          'claude-free': cell('unavailable', 'Not available through the complete plugin', 'Claude Free offers only the separate Custom Connector.'),
          'claude-pro-max': cell('planned', 'After release, when your normal text chat offers uploads'),
          'claude-team-enterprise': cell('planned', 'After release, when your normal text chat offers uploads'),
        },
      },
      {
        id: 'browser-devices',
        feature: 'Which devices can I use?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'A browser on a computer, tablet, or smartphone', 'Only if SkillPilot is offered in your account.'),
          'chatgpt-plus-pro': cell('tested', 'A browser on a computer, tablet, or smartphone'),
          'chatgpt-business': cell('admin', 'A browser on a computer, tablet, or smartphone after approval'),
          'chatgpt-enterprise-edu': cell('admin', 'A browser on a computer, tablet, or smartphone after approval'),
          'claude-free': cell('unavailable', 'No complete plugin access', 'The separate Custom Connector does not include the coaching Skill.'),
          'claude-pro-max': cell('planned', 'Claude Web in a browser after release'),
          'claude-team-enterprise': cell('admin', 'Claude Web in a browser after approval'),
        },
      },
      {
        id: 'native-mobile-app',
        feature: 'Should I use the native app?',
        cells: providerCells(
          cell('unavailable', 'No, use the browser'),
          cell('unavailable', 'No approved SkillPilot route yet'),
        ),
      },
      {
        id: 'dictation',
        feature: 'Can I dictate my answer?',
        cells: {
          'chatgpt-free-go': cell('available', 'Yes, as text input in normal chat', 'Check the recognised text before sending.'),
          'chatgpt-plus-pro': cell('available', 'Yes, as text input in normal chat', 'Check the recognised text before sending.'),
          'chatgpt-business': cell('available', 'Yes, as text input in normal chat', 'Check the recognised text before sending.'),
          'chatgpt-enterprise-edu': cell('available', 'Yes, as text input in normal chat', 'Check the recognised text before sending.'),
          'claude-free': cell('unavailable', 'Not available through the complete plugin', 'Claude Free offers only the separate Custom Connector.'),
          'claude-pro-max': cell('planned', 'After release, as text input in normal chat'),
          'claude-team-enterprise': cell('planned', 'After release, as text input in normal chat'),
        },
      },
      {
        id: 'voice-mode',
        feature: 'Can I use continuous voice mode?',
        cells: providerCells(
          cell('unavailable', 'No, do not use it with SkillPilot'),
          cell('unavailable', 'No, do not use it with SkillPilot'),
        ),
      },
    ],
  },
]

const germanCopy: CoachProviderMatrixCopy = {
  title: 'Welcher Zugang passt zu mir?',
  intro: 'Diese Übersicht brauchst du nur bei der ersten Einrichtung oder wenn du dein ChatGPT- oder Claude-Konto wechselst. Sie zeigt, welche Konten grundsätzlich infrage kommen, welche Altersgrenzen gelten und welchen Weg SkillPilot bereits freigegeben hat.',
  asOf: 'Stand: 24. August 2026',
  featureHeading: 'Was du wissen möchtest',
  mobileFeatureHeading: 'Antworten für diesen Zugang',
  providerFilterLabel: 'Welchen Anbieter möchtest du prüfen?',
  providerFilterHint: 'Zeige nur ChatGPT oder nur Claude. Du kannst jederzeit wechseln.',
  statusLabels: {
    available: 'Grundsätzlich möglich',
    tested: 'Von SkillPilot erprobt',
    conditional: 'Abhängig von deinem Konto',
    planned: 'Noch nicht verfügbar',
    unavailable: 'Nicht geeignet',
    admin: 'Freigabe nötig',
  },
  legendLabel: 'Bedeutung',
  startTitle: 'Im Alltag ist der Start immer gleich',
  startText: 'Wähle in SkillPilot „Lernen starten“. Dadurch entsteht eine neue Lernsession, die 24 Stunden gültig ist. Danach startest du in SkillPilot eine neue.',
  privacyTitle: 'Halte den Zugang zu deiner Lernsession privat',
  privacyText: 'Teile die vorbereitete Startnachricht und den Lernchat nicht mit anderen. Dein dauerhafter Lernstand bleibt bei SkillPilot.',
  caveat: 'Anbieter können Tarife und verfügbare Funktionen ändern. Entscheidend ist deshalb immer, was dein eigenes Konto anzeigt. Wenn SkillPilot dort noch nicht angeboten wird, warte bitte auf die Freigabe und verwende keine inoffizielle Umgehung.',
  variants: germanVariants,
  groups: germanGroups,
  sourcesTitle: 'Offizielle Angaben der Anbieter',
  sourcesNote: 'Dort findest du die jeweils aktuellen Regeln zu Zugang und Mindestalter.',
  sources: [
    { id: 'openai-access', label: 'ChatGPT: Zugang nach Konto und Tarif', href: 'https://help.openai.com/en/articles/20001256' },
    { id: 'openai-age', label: 'ChatGPT: Mindestalter und Zustimmung', href: 'https://openai.com/policies/terms-of-use/' },
    { id: 'anthropic-access', label: 'Claude: unterstützte Tarife', href: 'https://support.claude.com/en/articles/13837440-use-plugins-in-claude' },
    { id: 'anthropic-custom-connector', label: 'Claude: separater Custom Connector', href: 'https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp' },
    { id: 'anthropic-age', label: 'Claude: Mindestalter', href: 'https://support.claude.com/en/articles/13117299-minimum-age-requirement-access-restriction' },
  ],
}

const englishCopy: CoachProviderMatrixCopy = {
  title: 'Which access option fits me?',
  intro: 'You only need this overview during your first setup or when you change your ChatGPT or Claude account. It shows which accounts are eligible in principle, which age limits apply, and which route SkillPilot has already enabled.',
  asOf: 'Status: August 24, 2026',
  featureHeading: 'What you want to know',
  mobileFeatureHeading: 'Answers for this access option',
  providerFilterLabel: 'Which provider do you want to check?',
  providerFilterHint: 'Show only ChatGPT or only Claude. You can switch at any time.',
  statusLabels: {
    available: 'Possible in principle',
    tested: 'Tested by SkillPilot',
    conditional: 'Depends on your account',
    planned: 'Not available yet',
    unavailable: 'Not suitable',
    admin: 'Approval required',
  },
  legendLabel: 'Meaning',
  startTitle: 'Your everyday start is always the same',
  startText: 'Select “Start Learning” in SkillPilot. This creates a new learning session that is valid for 24 hours. After that, start a new one in SkillPilot.',
  privacyTitle: 'Keep access to your learning session private',
  privacyText: 'Do not share the prepared start message or your learning chat with other people. Your long-term learning record stays with SkillPilot.',
  caveat: 'Providers may change plans and available features. What your own account displays is therefore authoritative. If SkillPilot is not offered there yet, please wait for release and do not use an unofficial workaround.',
  variants: englishVariants,
  groups: englishGroups,
  sourcesTitle: 'Official provider information',
  sourcesNote: 'These pages contain the latest provider rules for access and minimum age.',
  sources: [
    { id: 'openai-access', label: 'ChatGPT: access by account and plan', href: 'https://help.openai.com/en/articles/20001256' },
    { id: 'openai-age', label: 'ChatGPT: minimum age and consent', href: 'https://openai.com/policies/terms-of-use/' },
    { id: 'anthropic-access', label: 'Claude: supported plans', href: 'https://support.claude.com/en/articles/13837440-use-plugins-in-claude' },
    { id: 'anthropic-custom-connector', label: 'Claude: separate Custom Connector', href: 'https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp' },
    { id: 'anthropic-age', label: 'Claude: minimum age', href: 'https://support.claude.com/en/articles/13117299-minimum-age-requirement-access-restriction' },
  ],
}

export const getCoachProviderMatrixCopy = (language: LabelLanguage): CoachProviderMatrixCopy => (
  language === 'en' ? englishCopy : germanCopy
)
