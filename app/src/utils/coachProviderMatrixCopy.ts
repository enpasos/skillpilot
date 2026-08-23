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
  bundleTitle: string
  bundleText: string
  rolloutTitle: string
  rolloutText: string
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

const germanVariants: CoachMatrixVariant[] = [
  {
    id: 'chatgpt-free-go',
    provider: 'ChatGPT',
    plan: 'Free / Go',
    summary: 'Nach Veröffentlichung prüfen, ob Installation und SkillPilot-App für Konto, Region und Oberfläche freigeschaltet sind.',
  },
  {
    id: 'chatgpt-plus-pro',
    provider: 'ChatGPT',
    plan: 'Plus / Pro',
    badge: 'Empfehlung für Einzelpersonen',
    summary: 'Der von SkillPilot bevorzugte Einzelzugang, sobald OpenAI die Veröffentlichung freigegeben hat.',
  },
  {
    id: 'chatgpt-business',
    provider: 'ChatGPT',
    plan: 'Business',
    summary: 'Geeignet für verwaltete Teams; Workspace-Einstellungen und App-Rechte gelten zusätzlich.',
  },
  {
    id: 'chatgpt-enterprise-edu',
    provider: 'ChatGPT',
    plan: 'Enterprise / Edu',
    summary: 'Geeignet für Organisationen nach Freigabe durch Workspace-Administration und gegebenenfalls Datenschutz- oder Sicherheitsprüfung.',
  },
  {
    id: 'claude-free',
    provider: 'Claude',
    plan: 'Free',
    summary: 'Anthropic stellt Plugins derzeit nicht im kostenlosen Tarif bereit.',
  },
  {
    id: 'claude-pro-max',
    provider: 'Claude',
    plan: 'Pro / Max',
    summary: 'Anthropic unterstützt Plugins im Tarif; die sichere SkillPilot-Veröffentlichung ist jedoch noch nicht freigegeben.',
  },
  {
    id: 'claude-team-enterprise',
    provider: 'Claude',
    plan: 'Team / Enterprise',
    summary: 'Anthropic unterstützt Plugins und organisatorische Verteilung; SkillPilot bleibt bis zum neuen 24-Stunden-Startfluss pausiert.',
  },
]

const germanGroups: CoachMatrixGroup[] = [
  {
    id: 'access',
    title: 'Veröffentlichung und Zugang',
    rows: [
      {
        id: 'rollout-status',
        feature: 'Aktueller SkillPilot-Rollout',
        cells: {
          'chatgpt-free-go': cell('planned', 'Im OpenAI-Review', 'Öffentliche Nutzung erst nach Genehmigung und tarifabhängiger Freischaltung.'),
          'chatgpt-plus-pro': cell('planned', 'Im OpenAI-Review', 'Produktionsdienst und Tests stehen; der Directory-Eintrag ist noch nicht veröffentlicht.'),
          'chatgpt-business': cell('planned', 'Im OpenAI-Review', 'Nach Veröffentlichung gelten zusätzlich die Workspace-Regeln.'),
          'chatgpt-enterprise-edu': cell('planned', 'Im OpenAI-Review', 'Nach Veröffentlichung ist eine Admin-Freigabe erforderlich.'),
          'claude-free': cell('unavailable', 'Kein Plugin-Zugang'),
          'claude-pro-max': cell('planned', 'SkillPilot-Rollout pausiert', 'Erst nach Umstellung auf den sicheren 24-Stunden-Startfluss.'),
          'claude-team-enterprise': cell('planned', 'SkillPilot-Rollout pausiert', 'Erst nach Umstellung auf den sicheren 24-Stunden-Startfluss.'),
        },
      },
      {
        id: 'provider-plan',
        feature: 'Provider-Tarif für Plugins',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Nicht pauschal garantiert', 'Das Directory ist sichtbar; Installation und Nutzung hängen unter anderem von Tarif, Region und enthaltenen App-Funktionen ab.'),
          'chatgpt-plus-pro': cell('available', 'Bezahlter Einzelzugang'),
          'chatgpt-business': cell('available', 'Workspace-Zugang', 'Apps sind laut OpenAI standardmäßig aktiviert, können aber administrativ eingeschränkt werden.'),
          'chatgpt-enterprise-edu': cell('admin', 'Workspace-Zugang', 'Apps sind laut OpenAI standardmäßig deaktiviert und müssen freigegeben werden.'),
          'claude-free': cell('unavailable', 'Plugins nicht verfügbar'),
          'claude-pro-max': cell('available', 'Plugins offiziell verfügbar'),
          'claude-team-enterprise': cell('available', 'Plugins offiziell verfügbar'),
        },
      },
      {
        id: 'minimum-age',
        feature: 'Mindestalter laut Provider',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Mindestens 13 Jahre oder nationales Mindestalter', 'Unter 18 Jahren ist die Zustimmung eines Elternteils oder gesetzlichen Vertreters erforderlich.'),
          'chatgpt-plus-pro': cell('conditional', 'Mindestens 13 Jahre oder nationales Mindestalter', 'Unter 18 Jahren ist die Zustimmung eines Elternteils oder gesetzlichen Vertreters erforderlich.'),
          'chatgpt-business': cell('admin', 'Organisationsregeln zusätzlich prüfen', 'Für minderjährige Lernende müssen Institution und Sorgeberechtigte die zulässige Kontonutzung klären.'),
          'chatgpt-enterprise-edu': cell('admin', 'Organisationsregeln zusätzlich prüfen', 'Für minderjährige Lernende müssen Institution und Sorgeberechtigte die zulässige Kontonutzung klären.'),
          'claude-free': cell('unavailable', 'Claude-Konto erst ab 18 Jahren'),
          'claude-pro-max': cell('unavailable', 'Claude-Konto erst ab 18 Jahren'),
          'claude-team-enterprise': cell('unavailable', 'Claude-Konto erst ab 18 Jahren'),
        },
      },
      {
        id: 'single-bundle',
        feature: 'Eine Installation statt Einzelbausteinen',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Ein Plugin: Skill + App', 'Sobald SkillPilot veröffentlicht und für den Tarif nutzbar ist.'),
          'chatgpt-plus-pro': cell('planned', 'Ein Plugin: Skill + App', 'Nach OpenAI-Genehmigung über den Plugin-Eintrag.'),
          'chatgpt-business': cell('planned', 'Ein Plugin: Skill + App', 'Nach OpenAI-Genehmigung und Workspace-Freigabe.'),
          'chatgpt-enterprise-edu': cell('admin', 'Ein Plugin: Skill + App', 'Installation und App-Zugriff werden im Workspace verwaltet.'),
          'claude-free': cell('unavailable', 'Kein Plugin-Zugang'),
          'claude-pro-max': cell('planned', 'Ein Plugin: Skill + Connector', 'Das neue SkillPilot-Paket wird erst nach dem sicheren Startfluss freigegeben.'),
          'claude-team-enterprise': cell('planned', 'Ein Plugin: Skill + Connector', 'Das neue SkillPilot-Paket wird erst nach dem sicheren Startfluss freigegeben.'),
        },
      },
      {
        id: 'admin-requirement',
        feature: 'Organisations- oder Admin-Freigabe',
        cells: {
          'chatgpt-free-go': cell('available', 'Nicht bei einem persönlichen Konto', 'Provider- und Regionsfreigaben gelten trotzdem.'),
          'chatgpt-plus-pro': cell('available', 'Nicht bei einem persönlichen Konto'),
          'chatgpt-business': cell('conditional', 'Workspace kann einschränken'),
          'chatgpt-enterprise-edu': cell('admin', 'Admin-Freigabe erforderlich'),
          'claude-free': cell('unavailable', 'Nicht anwendbar'),
          'claude-pro-max': cell('available', 'Nicht bei einem persönlichen Konto'),
          'claude-team-enterprise': cell('admin', 'Owner oder Admin kann verteilen und verwalten'),
        },
      },
      {
        id: 'recommendation',
        feature: 'SkillPilot-Empfehlung',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Nach Veröffentlichung ausprobieren', 'Erst verwenden, wenn der SkillPilot-Eintrag tatsächlich installierbar ist.'),
          'chatgpt-plus-pro': cell('tested', 'Bevorzugter Einzelzugang'),
          'chatgpt-business': cell('conditional', 'Für verwaltete Teams geeignet'),
          'chatgpt-enterprise-edu': cell('admin', 'Für institutionellen Pilot geeignet'),
          'claude-free': cell('unavailable', 'Keine SkillPilot-Plugin-Option'),
          'claude-pro-max': cell('planned', 'Noch nicht an Lernende ausrollen'),
          'claude-team-enterprise': cell('planned', 'Noch nicht an Lernende ausrollen'),
        },
      },
    ],
  },
  {
    id: 'privacy-start',
    title: 'Sicherer Start und Datenschutzgrenze',
    rows: [
      {
        id: 'first-party-start',
        feature: 'Start über SkillPilot „Lernen starten“',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Vorgesehen', 'Nutzbar, sobald das Plugin im Konto freigeschaltet ist.'),
          'chatgpt-plus-pro': cell('tested', 'Getesteter Produktionsfluss'),
          'chatgpt-business': cell('conditional', 'Gleicher Vertrag nach Workspace-Freigabe', 'Der Business-Tarif wurde von SkillPilot noch nicht separat getestet.'),
          'chatgpt-enterprise-edu': cell('admin', 'Nach Workspace-Freigabe', 'Enterprise/Edu wurde von SkillPilot noch nicht separat getestet.'),
          'claude-free': cell('unavailable', 'Kein Plugin-Zugang'),
          'claude-pro-max': cell('planned', 'Wird neu aufgebaut'),
          'claude-team-enterprise': cell('planned', 'Wird neu aufgebaut'),
        },
      },
      {
        id: 'permanent-id-boundary',
        feature: 'Permanente SkillPilot-ID bleibt bei SkillPilot',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Vorgesehen'),
          'chatgpt-plus-pro': cell('tested', 'Ja'),
          'chatgpt-business': cell('conditional', 'Vertraglich vorgesehen', 'Nicht separat im Business-Tarif getestet.'),
          'chatgpt-enterprise-edu': cell('admin', 'Vertraglich vorgesehen', 'Workspace-Freigabe und institutionelle Prüfung erforderlich.'),
          'claude-free': cell('unavailable', 'Nicht anwendbar'),
          'claude-pro-max': cell('planned', 'Verpflichtendes Freigabekriterium'),
          'claude-team-enterprise': cell('planned', 'Verpflichtendes Freigabekriterium'),
        },
      },
      {
        id: 'absolute-session',
        feature: 'Neue, absolut 24 Stunden gültige Lernsession',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Vorgesehen'),
          'chatgpt-plus-pro': cell('tested', 'Ja, nicht gleitend verlängerbar'),
          'chatgpt-business': cell('conditional', 'Vertraglich vorgesehen, nicht gleitend verlängerbar', 'Nicht separat im Business-Tarif getestet.'),
          'chatgpt-enterprise-edu': cell('admin', 'Vertraglich vorgesehen, nicht gleitend verlängerbar', 'Workspace-Freigabe und institutionelle Prüfung erforderlich.'),
          'claude-free': cell('unavailable', 'Nicht anwendbar'),
          'claude-pro-max': cell('planned', 'Vor Veröffentlichung erforderlich'),
          'claude-team-enterprise': cell('planned', 'Vor Veröffentlichung erforderlich'),
        },
      },
    ],
  },
  {
    id: 'learning',
    title: 'SkillPilot-Lernfunktionen',
    rows: [
      {
        id: 'learning-context',
        feature: 'Lernkontext und aktives Ziel laden',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Nach Freischaltung'),
          'chatgpt-plus-pro': cell('tested', 'Getestet'),
          'chatgpt-business': cell('conditional', 'Nach Workspace-Freigabe', 'Nicht separat im Business-Tarif getestet.'),
          'chatgpt-enterprise-edu': cell('admin', 'Nach Workspace-Freigabe', 'Nicht separat in Enterprise/Edu getestet.'),
          'claude-free': cell('unavailable', 'Kein Plugin-Zugang'),
          'claude-pro-max': cell('planned', 'Fachlich getestet, sicherer Startfluss fehlt'),
          'claude-team-enterprise': cell('planned', 'Fachlich getestet, sicherer Startfluss fehlt'),
        },
      },
      {
        id: 'learning-state',
        feature: 'Lernstand lesen und kontrolliert aktualisieren',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Nach Freischaltung'),
          'chatgpt-plus-pro': cell('tested', 'Getestet'),
          'chatgpt-business': cell('conditional', 'Nach Workspace-Freigabe', 'Nicht separat im Business-Tarif getestet.'),
          'chatgpt-enterprise-edu': cell('admin', 'Nach Workspace-Freigabe', 'Nicht separat in Enterprise/Edu getestet.'),
          'claude-free': cell('unavailable', 'Kein Plugin-Zugang'),
          'claude-pro-max': cell('planned', 'Fachlich getestet, sicherer Startfluss fehlt'),
          'claude-team-enterprise': cell('planned', 'Fachlich getestet, sicherer Startfluss fehlt'),
        },
      },
      {
        id: 'goal-visualization',
        feature: 'Freigegebene Lernzielbilder anzeigen',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Nach Freischaltung und auf unterstützter Oberfläche'),
          'chatgpt-plus-pro': cell('tested', 'Im Browser getestet'),
          'chatgpt-business': cell('conditional', 'Nach Workspace-Freigabe', 'UI nicht separat im Business-Tarif getestet.'),
          'chatgpt-enterprise-edu': cell('admin', 'Nach Workspace-Freigabe', 'UI nicht separat in Enterprise/Edu getestet.'),
          'claude-free': cell('unavailable', 'Kein Plugin-Zugang'),
          'claude-pro-max': cell('planned', 'Im manuellen Vorläufertest auch mobil funktioniert'),
          'claude-team-enterprise': cell('planned', 'Im manuellen Vorläufertest auch mobil funktioniert'),
        },
      },
      {
        id: 'memory-practice-ui',
        feature: 'Interaktive Karteikarten-UI',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Nach Freischaltung und auf unterstützter Oberfläche'),
          'chatgpt-plus-pro': cell('tested', 'Im Browser getestet'),
          'chatgpt-business': cell('conditional', 'Nach Workspace-Freigabe', 'UI nicht separat im Business-Tarif getestet.'),
          'chatgpt-enterprise-edu': cell('admin', 'Nach Workspace-Freigabe', 'UI nicht separat in Enterprise/Edu getestet.'),
          'claude-free': cell('unavailable', 'Kein Plugin-Zugang'),
          'claude-pro-max': cell('planned', 'Im manuellen Vorläufertest auch mobil funktioniert'),
          'claude-team-enterprise': cell('planned', 'Im manuellen Vorläufertest auch mobil funktioniert'),
        },
      },
      {
        id: 'verified-recall',
        feature: 'Verifizierte Abfrage ohne Hilfen',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Nach Freischaltung'),
          'chatgpt-plus-pro': cell('tested', 'Getestet'),
          'chatgpt-business': cell('conditional', 'Nach Workspace-Freigabe', 'Nicht separat im Business-Tarif getestet.'),
          'chatgpt-enterprise-edu': cell('admin', 'Nach Workspace-Freigabe', 'Nicht separat in Enterprise/Edu getestet.'),
          'claude-free': cell('unavailable', 'Kein Plugin-Zugang'),
          'claude-pro-max': cell('planned', 'Fachlich vorbereitet, noch nicht freigegeben'),
          'claude-team-enterprise': cell('planned', 'Fachlich vorbereitet, noch nicht freigegeben'),
        },
      },
      {
        id: 'assessment-mastery',
        feature: 'Prüfungen und belastbare Lernstandsfortschreibung',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Nach Freischaltung'),
          'chatgpt-plus-pro': cell('tested', 'Getestet'),
          'chatgpt-business': cell('conditional', 'Nach Workspace-Freigabe', 'Nicht separat im Business-Tarif getestet.'),
          'chatgpt-enterprise-edu': cell('admin', 'Nach Workspace-Freigabe', 'Nicht separat in Enterprise/Edu getestet.'),
          'claude-free': cell('unavailable', 'Kein Plugin-Zugang'),
          'claude-pro-max': cell('planned', 'Fachlich vorbereitet, noch nicht freigegeben'),
          'claude-team-enterprise': cell('planned', 'Fachlich vorbereitet, noch nicht freigegeben'),
        },
      },
      {
        id: 'photo-upload',
        feature: 'Fotos oder handschriftliche Lösungen hochladen',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Wenn der Tarif und Chat Uploads anbieten'),
          'chatgpt-plus-pro': cell('tested', 'Im normalen Textchat getestet'),
          'chatgpt-business': cell('conditional', 'Abhängig von Workspace und Oberfläche'),
          'chatgpt-enterprise-edu': cell('admin', 'Abhängig von Workspace-Freigabe und Oberfläche'),
          'claude-free': cell('unavailable', 'Kein SkillPilot-Plugin-Zugang'),
          'claude-pro-max': cell('planned', 'Host-Funktion; SkillPilot-Plugin noch nicht freigegeben'),
          'claude-team-enterprise': cell('planned', 'Host-Funktion; SkillPilot-Plugin noch nicht freigegeben'),
        },
      },
    ],
  },
  {
    id: 'surfaces',
    title: 'Geräte und Gesprächsmodus',
    rows: [
      {
        id: 'desktop-browser',
        feature: 'Desktop-Browser',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Nach Freischaltung'),
          'chatgpt-plus-pro': cell('tested', 'Empfohlene Umgebung'),
          'chatgpt-business': cell('conditional', 'Nach Workspace-Freigabe', 'Nicht separat im Business-Tarif getestet.'),
          'chatgpt-enterprise-edu': cell('admin', 'Nach Workspace-Freigabe'),
          'claude-free': cell('unavailable', 'Plugins nicht verfügbar'),
          'claude-pro-max': cell('planned', 'Anthropic unterstützt Plugin-Chat im Web; SkillPilot noch pausiert'),
          'claude-team-enterprise': cell('planned', 'Anthropic unterstützt Plugin-Chat im Web; SkillPilot noch pausiert'),
        },
      },
      {
        id: 'mobile-browser',
        feature: 'Mobiler Browser',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Nach Freischaltung und auf unterstützter Oberfläche'),
          'chatgpt-plus-pro': cell('tested', 'Von SkillPilot getestet'),
          'chatgpt-business': cell('conditional', 'Von SkillPilot im persönlichen Browserfluss getestet; Workspace kann abweichen'),
          'chatgpt-enterprise-edu': cell('admin', 'Workspace und Oberfläche müssen freigegeben sein'),
          'claude-free': cell('unavailable', 'Plugins nicht verfügbar'),
          'claude-pro-max': cell('planned', 'Manueller Skill-plus-Connector-Vorläufer von SkillPilot getestet; keine allgemeine Anthropic-Mobile-Zusage'),
          'claude-team-enterprise': cell('planned', 'Manueller Skill-plus-Connector-Vorläufer von SkillPilot getestet; keine allgemeine Anthropic-Mobile-Zusage'),
        },
      },
      {
        id: 'native-mobile-app',
        feature: 'Native Mobile-App',
        cells: {
          'chatgpt-free-go': cell('unavailable', 'Für SkillPilot derzeit nicht empfohlen'),
          'chatgpt-plus-pro': cell('unavailable', 'Für SkillPilot derzeit nicht empfohlen'),
          'chatgpt-business': cell('unavailable', 'Für SkillPilot derzeit nicht empfohlen'),
          'chatgpt-enterprise-edu': cell('unavailable', 'Für SkillPilot derzeit nicht empfohlen'),
          'claude-free': cell('unavailable', 'Kein Plugin-Zugang'),
          'claude-pro-max': cell('unavailable', 'Für das SkillPilot-Plugin nicht bestätigt'),
          'claude-team-enterprise': cell('unavailable', 'Für das SkillPilot-Plugin nicht bestätigt'),
        },
      },
      {
        id: 'voice-mode',
        feature: 'Fortlaufender Voice Mode',
        cells: {
          'chatgpt-free-go': cell('unavailable', 'Apps und Plugins werden im Voice Mode nicht unterstützt'),
          'chatgpt-plus-pro': cell('unavailable', 'Apps und Plugins werden im Voice Mode nicht unterstützt'),
          'chatgpt-business': cell('unavailable', 'Apps und Plugins werden im Voice Mode nicht unterstützt'),
          'chatgpt-enterprise-edu': cell('unavailable', 'Apps und Plugins werden im Voice Mode nicht unterstützt'),
          'claude-free': cell('unavailable', 'Kein Plugin-Zugang'),
          'claude-pro-max': cell('unavailable', 'Für SkillPilot nicht freigegeben oder bestätigt'),
          'claude-team-enterprise': cell('unavailable', 'Für SkillPilot nicht freigegeben oder bestätigt'),
        },
      },
    ],
  },
]

const englishVariants: CoachMatrixVariant[] = [
  {
    id: 'chatgpt-free-go',
    provider: 'ChatGPT',
    plan: 'Free / Go',
    summary: 'After publication, check whether installation and the SkillPilot app are enabled for the account, region, and surface.',
  },
  {
    id: 'chatgpt-plus-pro',
    provider: 'ChatGPT',
    plan: 'Plus / Pro',
    badge: 'Recommended for individuals',
    summary: 'SkillPilot’s preferred individual setup once OpenAI has approved publication.',
  },
  {
    id: 'chatgpt-business',
    provider: 'ChatGPT',
    plan: 'Business',
    summary: 'Suitable for managed teams; workspace settings and app permissions also apply.',
  },
  {
    id: 'chatgpt-enterprise-edu',
    provider: 'ChatGPT',
    plan: 'Enterprise / Edu',
    summary: 'Suitable for organizations after workspace administration and any required privacy or security review.',
  },
  {
    id: 'claude-free',
    provider: 'Claude',
    plan: 'Free',
    summary: 'Anthropic does not currently provide plugins on the free plan.',
  },
  {
    id: 'claude-pro-max',
    provider: 'Claude',
    plan: 'Pro / Max',
    summary: 'Anthropic supports plugins on these plans, but the secure SkillPilot release has not been approved yet.',
  },
  {
    id: 'claude-team-enterprise',
    provider: 'Claude',
    plan: 'Team / Enterprise',
    summary: 'Anthropic supports plugins and organization distribution; SkillPilot remains paused until the new 24-hour start flow is ready.',
  },
]

const englishGroups: CoachMatrixGroup[] = [
  {
    id: 'access',
    title: 'Publication and access',
    rows: [
      {
        id: 'rollout-status',
        feature: 'Current SkillPilot rollout',
        cells: {
          'chatgpt-free-go': cell('planned', 'In OpenAI review', 'Public use starts only after approval and plan-specific enablement.'),
          'chatgpt-plus-pro': cell('planned', 'In OpenAI review', 'The production service and tests are ready; the directory listing is not public yet.'),
          'chatgpt-business': cell('planned', 'In OpenAI review', 'Workspace rules also apply after publication.'),
          'chatgpt-enterprise-edu': cell('planned', 'In OpenAI review', 'Admin approval is required after publication.'),
          'claude-free': cell('unavailable', 'No plugin access'),
          'claude-pro-max': cell('planned', 'SkillPilot rollout paused', 'Release waits for the secure 24-hour start flow.'),
          'claude-team-enterprise': cell('planned', 'SkillPilot rollout paused', 'Release waits for the secure 24-hour start flow.'),
        },
      },
      {
        id: 'provider-plan',
        feature: 'Provider plan for plugins',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Not universally guaranteed', 'The directory is visible; installation and use depend on factors such as plan, region, and included app capabilities.'),
          'chatgpt-plus-pro': cell('available', 'Paid individual access'),
          'chatgpt-business': cell('available', 'Workspace access', 'OpenAI states that apps are enabled by default, but administrators can restrict them.'),
          'chatgpt-enterprise-edu': cell('admin', 'Workspace access', 'OpenAI states that apps are disabled by default and must be enabled.'),
          'claude-free': cell('unavailable', 'Plugins unavailable'),
          'claude-pro-max': cell('available', 'Plugins officially available'),
          'claude-team-enterprise': cell('available', 'Plugins officially available'),
        },
      },
      {
        id: 'minimum-age',
        feature: 'Provider minimum age',
        cells: {
          'chatgpt-free-go': cell('conditional', 'At least 13 or the minimum age in the user’s country', 'Users under 18 need permission from a parent or legal guardian.'),
          'chatgpt-plus-pro': cell('conditional', 'At least 13 or the minimum age in the user’s country', 'Users under 18 need permission from a parent or legal guardian.'),
          'chatgpt-business': cell('admin', 'Also check organization rules', 'For learners who are minors, the institution and guardians must clarify permitted account use.'),
          'chatgpt-enterprise-edu': cell('admin', 'Also check organization rules', 'For learners who are minors, the institution and guardians must clarify permitted account use.'),
          'claude-free': cell('unavailable', 'Claude accounts require age 18 or older'),
          'claude-pro-max': cell('unavailable', 'Claude accounts require age 18 or older'),
          'claude-team-enterprise': cell('unavailable', 'Claude accounts require age 18 or older'),
        },
      },
      {
        id: 'single-bundle',
        feature: 'One installation instead of separate parts',
        cells: {
          'chatgpt-free-go': cell('conditional', 'One plugin: skill + app', 'Once SkillPilot is published and usable on the plan.'),
          'chatgpt-plus-pro': cell('planned', 'One plugin: skill + app', 'Through the plugin listing after OpenAI approval.'),
          'chatgpt-business': cell('planned', 'One plugin: skill + app', 'After OpenAI approval and workspace enablement.'),
          'chatgpt-enterprise-edu': cell('admin', 'One plugin: skill + app', 'Installation and app access are managed by the workspace.'),
          'claude-free': cell('unavailable', 'No plugin access'),
          'claude-pro-max': cell('planned', 'One plugin: skill + connector', 'The new SkillPilot package will be released only after the secure start flow.'),
          'claude-team-enterprise': cell('planned', 'One plugin: skill + connector', 'The new SkillPilot package will be released only after the secure start flow.'),
        },
      },
      {
        id: 'admin-requirement',
        feature: 'Organization or admin approval',
        cells: {
          'chatgpt-free-go': cell('available', 'Not for a personal account', 'Provider and regional availability still apply.'),
          'chatgpt-plus-pro': cell('available', 'Not for a personal account'),
          'chatgpt-business': cell('conditional', 'Workspace may restrict access'),
          'chatgpt-enterprise-edu': cell('admin', 'Admin approval required'),
          'claude-free': cell('unavailable', 'Not applicable'),
          'claude-pro-max': cell('available', 'Not for a personal account'),
          'claude-team-enterprise': cell('admin', 'Owner or admin can distribute and manage'),
        },
      },
      {
        id: 'recommendation',
        feature: 'SkillPilot recommendation',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Try after publication', 'Use only once the SkillPilot listing can actually be installed.'),
          'chatgpt-plus-pro': cell('tested', 'Preferred individual setup'),
          'chatgpt-business': cell('conditional', 'Suitable for managed teams'),
          'chatgpt-enterprise-edu': cell('admin', 'Suitable for an institutional pilot'),
          'claude-free': cell('unavailable', 'No SkillPilot plugin option'),
          'claude-pro-max': cell('planned', 'Do not roll out to learners yet'),
          'claude-team-enterprise': cell('planned', 'Do not roll out to learners yet'),
        },
      },
    ],
  },
  {
    id: 'privacy-start',
    title: 'Secure start and privacy boundary',
    rows: [
      {
        id: 'first-party-start',
        feature: 'Start from SkillPilot “Start Learning”',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Planned', 'Usable once the plugin is enabled for the account.'),
          'chatgpt-plus-pro': cell('tested', 'Tested production flow'),
          'chatgpt-business': cell('conditional', 'Same contract after workspace enablement', 'The Business plan has not been tested separately by SkillPilot.'),
          'chatgpt-enterprise-edu': cell('admin', 'After workspace enablement', 'Enterprise/Edu has not been tested separately by SkillPilot.'),
          'claude-free': cell('unavailable', 'No plugin access'),
          'claude-pro-max': cell('planned', 'Being rebuilt'),
          'claude-team-enterprise': cell('planned', 'Being rebuilt'),
        },
      },
      {
        id: 'permanent-id-boundary',
        feature: 'Permanent SkillPilot ID stays with SkillPilot',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Planned'),
          'chatgpt-plus-pro': cell('tested', 'Yes'),
          'chatgpt-business': cell('conditional', 'Defined by the contract', 'Not separately tested on the Business plan.'),
          'chatgpt-enterprise-edu': cell('admin', 'Defined by the contract', 'Workspace enablement and institutional review are required.'),
          'claude-free': cell('unavailable', 'Not applicable'),
          'claude-pro-max': cell('planned', 'Mandatory release criterion'),
          'claude-team-enterprise': cell('planned', 'Mandatory release criterion'),
        },
      },
      {
        id: 'absolute-session',
        feature: 'New learning session with an absolute 24-hour lifetime',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Planned'),
          'chatgpt-plus-pro': cell('tested', 'Yes, no sliding extension'),
          'chatgpt-business': cell('conditional', 'Defined by the contract, no sliding extension', 'Not separately tested on the Business plan.'),
          'chatgpt-enterprise-edu': cell('admin', 'Defined by the contract, no sliding extension', 'Workspace enablement and institutional review are required.'),
          'claude-free': cell('unavailable', 'Not applicable'),
          'claude-pro-max': cell('planned', 'Required before publication'),
          'claude-team-enterprise': cell('planned', 'Required before publication'),
        },
      },
    ],
  },
  {
    id: 'learning',
    title: 'SkillPilot learning features',
    rows: [
      {
        id: 'learning-context',
        feature: 'Load learning context and active goal',
        cells: {
          'chatgpt-free-go': cell('conditional', 'After enablement'),
          'chatgpt-plus-pro': cell('tested', 'Tested'),
          'chatgpt-business': cell('conditional', 'After workspace enablement', 'Not separately tested on the Business plan.'),
          'chatgpt-enterprise-edu': cell('admin', 'After workspace enablement', 'Not separately tested on Enterprise/Edu.'),
          'claude-free': cell('unavailable', 'No plugin access'),
          'claude-pro-max': cell('planned', 'Learning flow tested; secure start is missing'),
          'claude-team-enterprise': cell('planned', 'Learning flow tested; secure start is missing'),
        },
      },
      {
        id: 'learning-state',
        feature: 'Read and controlled update of learning state',
        cells: {
          'chatgpt-free-go': cell('conditional', 'After enablement'),
          'chatgpt-plus-pro': cell('tested', 'Tested'),
          'chatgpt-business': cell('conditional', 'After workspace enablement', 'Not separately tested on the Business plan.'),
          'chatgpt-enterprise-edu': cell('admin', 'After workspace enablement', 'Not separately tested on Enterprise/Edu.'),
          'claude-free': cell('unavailable', 'No plugin access'),
          'claude-pro-max': cell('planned', 'Learning flow tested; secure start is missing'),
          'claude-team-enterprise': cell('planned', 'Learning flow tested; secure start is missing'),
        },
      },
      {
        id: 'goal-visualization',
        feature: 'Show approved learning-goal images',
        cells: {
          'chatgpt-free-go': cell('conditional', 'After enablement on a supported surface'),
          'chatgpt-plus-pro': cell('tested', 'Tested in the browser'),
          'chatgpt-business': cell('conditional', 'After workspace enablement', 'The UI has not been tested separately on the Business plan.'),
          'chatgpt-enterprise-edu': cell('admin', 'After workspace enablement', 'The UI has not been tested separately on Enterprise/Edu.'),
          'claude-free': cell('unavailable', 'No plugin access'),
          'claude-pro-max': cell('planned', 'Also worked on mobile in the manual predecessor test'),
          'claude-team-enterprise': cell('planned', 'Also worked on mobile in the manual predecessor test'),
        },
      },
      {
        id: 'memory-practice-ui',
        feature: 'Interactive flashcard UI',
        cells: {
          'chatgpt-free-go': cell('conditional', 'After enablement on a supported surface'),
          'chatgpt-plus-pro': cell('tested', 'Tested in the browser'),
          'chatgpt-business': cell('conditional', 'After workspace enablement', 'The UI has not been tested separately on the Business plan.'),
          'chatgpt-enterprise-edu': cell('admin', 'After workspace enablement', 'The UI has not been tested separately on Enterprise/Edu.'),
          'claude-free': cell('unavailable', 'No plugin access'),
          'claude-pro-max': cell('planned', 'Also worked on mobile in the manual predecessor test'),
          'claude-team-enterprise': cell('planned', 'Also worked on mobile in the manual predecessor test'),
        },
      },
      {
        id: 'verified-recall',
        feature: 'Verified no-help recall',
        cells: {
          'chatgpt-free-go': cell('conditional', 'After enablement'),
          'chatgpt-plus-pro': cell('tested', 'Tested'),
          'chatgpt-business': cell('conditional', 'After workspace enablement', 'Not separately tested on the Business plan.'),
          'chatgpt-enterprise-edu': cell('admin', 'After workspace enablement', 'Not separately tested on Enterprise/Edu.'),
          'claude-free': cell('unavailable', 'No plugin access'),
          'claude-pro-max': cell('planned', 'Learning flow prepared, not released'),
          'claude-team-enterprise': cell('planned', 'Learning flow prepared, not released'),
        },
      },
      {
        id: 'assessment-mastery',
        feature: 'Assessments and evidence-based learning-state updates',
        cells: {
          'chatgpt-free-go': cell('conditional', 'After enablement'),
          'chatgpt-plus-pro': cell('tested', 'Tested'),
          'chatgpt-business': cell('conditional', 'After workspace enablement', 'Not separately tested on the Business plan.'),
          'chatgpt-enterprise-edu': cell('admin', 'After workspace enablement', 'Not separately tested on Enterprise/Edu.'),
          'claude-free': cell('unavailable', 'No plugin access'),
          'claude-pro-max': cell('planned', 'Learning flow prepared, not released'),
          'claude-team-enterprise': cell('planned', 'Learning flow prepared, not released'),
        },
      },
      {
        id: 'photo-upload',
        feature: 'Upload photos or handwritten work',
        cells: {
          'chatgpt-free-go': cell('conditional', 'When the plan and chat offer uploads'),
          'chatgpt-plus-pro': cell('tested', 'Tested in normal text chat'),
          'chatgpt-business': cell('conditional', 'Depends on workspace and surface'),
          'chatgpt-enterprise-edu': cell('admin', 'Depends on workspace approval and surface'),
          'claude-free': cell('unavailable', 'No SkillPilot plugin access'),
          'claude-pro-max': cell('planned', 'Host feature; SkillPilot plugin not released'),
          'claude-team-enterprise': cell('planned', 'Host feature; SkillPilot plugin not released'),
        },
      },
    ],
  },
  {
    id: 'surfaces',
    title: 'Devices and conversation mode',
    rows: [
      {
        id: 'desktop-browser',
        feature: 'Desktop browser',
        cells: {
          'chatgpt-free-go': cell('conditional', 'After enablement'),
          'chatgpt-plus-pro': cell('tested', 'Recommended environment'),
          'chatgpt-business': cell('conditional', 'After workspace enablement', 'Not separately tested on the Business plan.'),
          'chatgpt-enterprise-edu': cell('admin', 'After workspace enablement'),
          'claude-free': cell('unavailable', 'Plugins unavailable'),
          'claude-pro-max': cell('planned', 'Anthropic supports plugin chat on the web; SkillPilot remains paused'),
          'claude-team-enterprise': cell('planned', 'Anthropic supports plugin chat on the web; SkillPilot remains paused'),
        },
      },
      {
        id: 'mobile-browser',
        feature: 'Mobile browser',
        cells: {
          'chatgpt-free-go': cell('conditional', 'After enablement on a supported surface'),
          'chatgpt-plus-pro': cell('tested', 'Tested by SkillPilot'),
          'chatgpt-business': cell('conditional', 'Tested by SkillPilot in the personal browser flow; workspaces may differ'),
          'chatgpt-enterprise-edu': cell('admin', 'Workspace and surface must be enabled'),
          'claude-free': cell('unavailable', 'Plugins unavailable'),
          'claude-pro-max': cell('planned', 'Manual skill-plus-connector predecessor tested by SkillPilot; not a general Anthropic mobile guarantee'),
          'claude-team-enterprise': cell('planned', 'Manual skill-plus-connector predecessor tested by SkillPilot; not a general Anthropic mobile guarantee'),
        },
      },
      {
        id: 'native-mobile-app',
        feature: 'Native mobile app',
        cells: {
          'chatgpt-free-go': cell('unavailable', 'Not currently recommended for SkillPilot'),
          'chatgpt-plus-pro': cell('unavailable', 'Not currently recommended for SkillPilot'),
          'chatgpt-business': cell('unavailable', 'Not currently recommended for SkillPilot'),
          'chatgpt-enterprise-edu': cell('unavailable', 'Not currently recommended for SkillPilot'),
          'claude-free': cell('unavailable', 'No plugin access'),
          'claude-pro-max': cell('unavailable', 'Not confirmed for the SkillPilot plugin'),
          'claude-team-enterprise': cell('unavailable', 'Not confirmed for the SkillPilot plugin'),
        },
      },
      {
        id: 'voice-mode',
        feature: 'Continuous voice mode',
        cells: {
          'chatgpt-free-go': cell('unavailable', 'Apps and plugins are not supported in voice mode'),
          'chatgpt-plus-pro': cell('unavailable', 'Apps and plugins are not supported in voice mode'),
          'chatgpt-business': cell('unavailable', 'Apps and plugins are not supported in voice mode'),
          'chatgpt-enterprise-edu': cell('unavailable', 'Apps and plugins are not supported in voice mode'),
          'claude-free': cell('unavailable', 'No plugin access'),
          'claude-pro-max': cell('unavailable', 'Not released or confirmed for SkillPilot'),
          'claude-team-enterprise': cell('unavailable', 'Not released or confirmed for SkillPilot'),
        },
      },
    ],
  },
]

const germanCopy: CoachProviderMatrixCopy = {
  title: 'Welche SkillPilot-Coach-Variante passt zu mir?',
  intro: 'Vergleiche Provider-Tarife, Installation, Datenschutzgrenze, Lernfunktionen und unterstützte Geräte. „Getestet“ beschreibt SkillPilot-Evidence; „verfügbar“ beschreibt eine Provider-Funktion und ist nicht automatisch eine SkillPilot-Veröffentlichung.',
  asOf: 'Stand: 23. August 2026',
  featureHeading: 'Funktion oder Voraussetzung',
  mobileFeatureHeading: 'Funktionen und Voraussetzungen',
  providerFilterLabel: 'Anbieter auswählen',
  providerFilterHint: 'Zeige die Tarife eines Anbieters. Du kannst jederzeit wechseln.',
  statusLabels: {
    available: 'Verfügbar',
    tested: 'Von SkillPilot getestet',
    conditional: 'Abhängig',
    planned: 'In Vorbereitung',
    unavailable: 'Nicht verfügbar',
    admin: 'Admin-Freigabe',
  },
  legendLabel: 'Status',
  bundleTitle: 'Ein Plugin bringt die Bausteine zusammen',
  bundleText: 'Nach der jeweiligen Veröffentlichung installierst du nicht Skill, UI und Verbindung getrennt. Das ChatGPT-Plugin bündelt Skill und SkillPilot-App; das geplante Claude-Plugin bündelt Skill und Connector. Die interaktiven Oberflächen werden von der jeweiligen Verbindung bereitgestellt.',
  rolloutTitle: 'Aktueller Veröffentlichungsstand',
  rolloutText: 'ChatGPT SkillPilot Coach v1 befindet sich im OpenAI-Review und ist noch nicht öffentlich gelistet. Der Claude-Rollout ist bewusst pausiert, bis auch dort ausschließlich „Lernen starten“ eine neue, absolut 24 Stunden gültige Lernsession erzeugt und die permanente SkillPilot-ID vollständig bei SkillPilot bleibt.',
  caveat: 'Provider-Angebote ändern sich. Maßgeblich sind im konkreten Konto der Plugin-Eintrag, seine Verbindungsanforderungen und die Workspace-Regeln. Der erfolgreiche mobile Claude-Vorläufertest mit manuell installiertem Skill und Connector ist SkillPilot-Evidence, aber keine allgemeine Zusage von Anthropic für native Mobile-Plugins.',
  variants: germanVariants,
  groups: germanGroups,
  sourcesTitle: 'Aktuelle Provider-Informationen',
  sourcesNote: 'Die Matrix verbindet diese offiziellen Angaben mit dem von SkillPilot getesteten und freigegebenen Produktstand.',
  sources: [
    { id: 'openai-plugins', label: 'OpenAI: Plugins in ChatGPT und Codex', href: 'https://help.openai.com/en/articles/20001256' },
    { id: 'openai-apps', label: 'OpenAI: Apps in ChatGPT', href: 'https://help.openai.com/en/articles/11487775-connectors-in-chatgpt' },
    { id: 'openai-voice', label: 'OpenAI: ChatGPT Voice', href: 'https://help.openai.com/en/articles/20001274' },
    { id: 'openai-age', label: 'OpenAI: Mindestalter und Zustimmung', href: 'https://openai.com/policies/terms-of-use/' },
    { id: 'anthropic-plugins', label: 'Anthropic: Plugins in Claude verwenden', href: 'https://support.claude.com/en/articles/13837440-use-plugins-in-claude' },
    { id: 'anthropic-age', label: 'Anthropic: Mindestalter für Claude', href: 'https://support.claude.com/en/articles/13117299-minimum-age-requirement-access-restriction' },
  ],
}

const englishCopy: CoachProviderMatrixCopy = {
  title: 'Which SkillPilot Coach setup fits me?',
  intro: 'Compare provider plans, installation, the privacy boundary, learning features, and supported devices. “Tested” describes SkillPilot evidence; “available” describes a provider capability and does not automatically mean that SkillPilot has been published.',
  asOf: 'Status: August 23, 2026',
  featureHeading: 'Feature or requirement',
  mobileFeatureHeading: 'Features and requirements',
  providerFilterLabel: 'Choose provider',
  providerFilterHint: 'Show one provider’s plans at a time. You can switch at any time.',
  statusLabels: {
    available: 'Available',
    tested: 'Tested by SkillPilot',
    conditional: 'Conditional',
    planned: 'In preparation',
    unavailable: 'Unavailable',
    admin: 'Admin approval',
  },
  legendLabel: 'Status',
  bundleTitle: 'One plugin brings the parts together',
  bundleText: 'After the respective publication, you do not install the skill, UI, and connection separately. The ChatGPT plugin bundles the skill and SkillPilot app; the planned Claude plugin bundles the skill and connector. Interactive UI is provided by the corresponding connection.',
  rolloutTitle: 'Current publication status',
  rolloutText: 'ChatGPT SkillPilot Coach v1 is in OpenAI review and is not publicly listed yet. The Claude rollout is intentionally paused until “Start Learning” is also the only way to create a new learning session with an absolute 24-hour lifetime there, while the permanent SkillPilot ID stays entirely with SkillPilot.',
  caveat: 'Provider offerings change. The plugin listing, its connection requirements, and the workspace rules shown in the specific account are authoritative. The successful mobile Claude predecessor test with a manually installed skill and connector is SkillPilot evidence, not a general Anthropic promise for native mobile plugins.',
  variants: englishVariants,
  groups: englishGroups,
  sourcesTitle: 'Current provider information',
  sourcesNote: 'The matrix combines these official statements with the product state tested and approved by SkillPilot.',
  sources: [
    { id: 'openai-plugins', label: 'OpenAI: Plugins in ChatGPT and Codex', href: 'https://help.openai.com/en/articles/20001256' },
    { id: 'openai-apps', label: 'OpenAI: Apps in ChatGPT', href: 'https://help.openai.com/en/articles/11487775-connectors-in-chatgpt' },
    { id: 'openai-voice', label: 'OpenAI: ChatGPT Voice', href: 'https://help.openai.com/en/articles/20001274' },
    { id: 'openai-age', label: 'OpenAI: Minimum age and consent', href: 'https://openai.com/policies/terms-of-use/' },
    { id: 'anthropic-plugins', label: 'Anthropic: Use plugins in Claude', href: 'https://support.claude.com/en/articles/13837440-use-plugins-in-claude' },
    { id: 'anthropic-age', label: 'Anthropic: Minimum age for Claude', href: 'https://support.claude.com/en/articles/13117299-minimum-age-requirement-access-restriction' },
  ],
}

export const getCoachProviderMatrixCopy = (language: LabelLanguage): CoachProviderMatrixCopy => (
  language === 'en' ? englishCopy : germanCopy
)
