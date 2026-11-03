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
  | 'gemini-controlled-web'

export type CoachMatrixProvider = 'ChatGPT' | 'Claude' | 'Gemini'

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

export const getVisibleCoachVariants = (
  variants: CoachMatrixVariant[],
  selectedProvider: CoachMatrixProvider,
) => variants.filter((variant) => (
  variant.provider === selectedProvider
  && (selectedProvider !== 'Claude' || variant.id === 'claude-pro-max')
))

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
    summary: 'Der Desktop-Betatest setzt voraus, dass dein Konto unter „Plugins“ einen Git-Marketplace hinzufügen kann. Der Tarif allein garantiert diesen Zugang nicht.',
  },
  {
    id: 'chatgpt-plus-pro',
    provider: 'ChatGPT',
    plan: 'Plus / Pro',
    badge: 'Desktop-Betatest',
    summary: 'Probiere SkillPilot im Bereich „Work“ von ChatGPT Desktop aus, wenn dein Konto die Plugin-Einrichtung über einen Git-Marketplace unterstützt.',
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
    summary: 'Plugins sind laut Anthropic nur in bezahlten Claude-Tarifen verfügbar; SkillPilot unterstützt Claude Free daher nicht.',
  },
  {
    id: 'claude-pro-max',
    provider: 'Claude',
    plan: 'Pro',
    badge: 'Laufender Betatest',
    summary: 'Unser aktueller Betaweg: SkillPilot nach der Anleitung unter „Plugins“ in Claude Web installieren und in Claude Web oder der App lernen.',
  },
  {
    id: 'claude-team-enterprise',
    provider: 'Claude',
    plan: 'Team / Enterprise',
    summary: 'Technisch pluginfähig, aber nicht der aktuelle SkillPilot-Betaweg für Einzelpersonen; zusätzlich können Organisationsfreigaben gelten.',
  },
  {
    id: 'gemini-controlled-web',
    provider: 'Gemini',
    plan: 'Gemini Web',
    badge: 'Kontrollierter Betatest',
    summary: 'Bisher mit einem persönlichen Google-Konto in der englischen Weboberfläche über einen US-Testzugang erprobt. Du brauchst einen eigens freigegebenen SkillPilot-Zugang, Custom Apps und Skills; eine öffentliche Einrichtung für weitere Konten ist noch nicht bestätigt.',
  },
]

const englishVariants: CoachMatrixVariant[] = [
  {
    id: 'chatgpt-free-go',
    provider: 'ChatGPT',
    plan: 'Free / Go',
    summary: 'The desktop beta requires an account that can add a Git marketplace under “Plugins”. Your plan alone does not guarantee this access.',
  },
  {
    id: 'chatgpt-plus-pro',
    provider: 'ChatGPT',
    plan: 'Plus / Pro',
    badge: 'Desktop beta',
    summary: 'Try SkillPilot in the “Work” section of ChatGPT Desktop if your account supports plugin setup through a Git marketplace.',
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
    summary: 'Anthropic makes plugins available only on paid Claude plans, so SkillPilot does not support Claude Free.',
  },
  {
    id: 'claude-pro-max',
    provider: 'Claude',
    plan: 'Pro',
    badge: 'Current beta',
    summary: 'Our current beta route: follow the guide under “Plugins” to install SkillPilot in Claude Web, then learn in Claude Web or the app.',
  },
  {
    id: 'claude-team-enterprise',
    provider: 'Claude',
    plan: 'Team / Enterprise',
    summary: 'Technically plugin-capable, but not the current SkillPilot beta route for individuals; organisation approval may also apply.',
  },
  {
    id: 'gemini-controlled-web',
    provider: 'Gemini',
    plan: 'Gemini Web',
    badge: 'Controlled beta',
    summary: 'Tested with one personal Google account in the English web interface through a US test connection. You need separately approved SkillPilot access, custom apps and Skills; public setup for additional accounts is not yet confirmed.',
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
          'chatgpt-free-go': cell('conditional', 'ChatGPT-Desktop-Betatest', 'Wenn dein Konto die Einrichtung über einen Git-Marketplace unter „Plugins“ unterstützt.'),
          'chatgpt-plus-pro': cell('conditional', 'ChatGPT-Desktop-Betatest', 'Wenn dein Konto die Einrichtung über einen Git-Marketplace unter „Plugins“ unterstützt.'),
          'chatgpt-business': cell('admin', 'ChatGPT-Desktop-Betatest nach Freigabe', 'Deine Organisation muss die Plugin-Einrichtung über den Git-Marketplace erlauben.'),
          'chatgpt-enterprise-edu': cell('admin', 'ChatGPT-Desktop-Betatest nach Freigabe', 'Deine Organisation muss die Plugin-Einrichtung über den Git-Marketplace erlauben.'),
          'claude-free': cell('unavailable', 'Vollständiges Plugin nicht verfügbar', 'Für den unterstützten SkillPilot-Betaweg ist Claude Pro erforderlich.'),
          'claude-pro-max': cell('available', 'Ja, im laufenden Betatest', 'Installiere und verbinde das aktuelle Plugin nach der Anleitung unter „Plugins“.'),
          'claude-team-enterprise': cell('planned', 'Plugin noch nicht für neue Lernende freigegeben'),
          'gemini-controlled-web': cell('conditional', 'Kontrollierter Gemini-Web-Betatest', 'Bisher ein Google-Konto mit eigens freigegebenem SkillPilot-Zugang. Weitere Konten und öffentliche Einrichtung sind noch nicht bestätigt.'),
        },
      },
      {
        id: 'provider-plan',
        feature: 'Welches Konto kommt grundsätzlich infrage?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Abhängig von deinem Konto', 'Prüfe in ChatGPT Desktop, ob „Plugins“ und „Marketplace hinzufügen“ vorhanden sind.'),
          'chatgpt-plus-pro': cell('conditional', 'Abhängig von deiner Plugin-Einrichtung', 'Prüfe in ChatGPT Desktop, ob „Plugins“ und „Marketplace hinzufügen“ vorhanden sind.'),
          'chatgpt-business': cell('admin', 'Frag die Person, die euer Konto verwaltet'),
          'chatgpt-enterprise-edu': cell('admin', 'Freigabe durch Schule oder Organisation nötig'),
          'claude-free': cell('unavailable', 'Kein vollständiger Plugin-Zugang', 'Für den unterstützten SkillPilot-Betaweg ist Claude Pro erforderlich.'),
          'claude-pro-max': cell('available', 'Claude Pro', 'Der aktuelle SkillPilot-Betaweg für Einzelpersonen.'),
          'claude-team-enterprise': cell('admin', 'Vollständiges Plugin nach Freigabe durch deine Organisation möglich'),
          'gemini-controlled-web': cell('conditional', 'Persönliches Google-Konto mit Custom Apps und Skills', 'Google nennt derzeit US-Zugang, Englisch und aktivierte „Keep Activity“. Beide Funktionen müssen in deinem Konto freigeschaltet sein; ein Tarif allein garantiert das nicht.'),
        },
      },
      {
        id: 'minimum-age',
        feature: 'Wie alt muss ich für mein Anbieter-Konto sein?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Mindestens 13 Jahre oder nationales Mindestalter', 'Unter 18 brauchst du die Zustimmung eines Elternteils oder einer sorgeberechtigten Person.'),
          'chatgpt-plus-pro': cell('conditional', 'Mindestens 13 Jahre oder nationales Mindestalter', 'Unter 18 brauchst du die Zustimmung eines Elternteils oder einer sorgeberechtigten Person.'),
          'chatgpt-business': cell('admin', 'Mindestens 13 Jahre oder nationales Mindestalter', 'Zusätzlich können Regeln deiner Schule oder Organisation gelten.'),
          'chatgpt-enterprise-edu': cell('admin', 'Mindestens 13 Jahre oder nationales Mindestalter', 'Zusätzlich können Regeln deiner Schule oder Organisation gelten.'),
          'claude-free': cell('unavailable', 'Mindestens 18 Jahre'),
          'claude-pro-max': cell('conditional', 'Mindestens 18 Jahre'),
          'claude-team-enterprise': cell('unavailable', 'Mindestens 18 Jahre'),
          'gemini-controlled-web': cell('conditional', 'Mindestens 18 Jahre für Custom Apps und Skills', 'Es gelten die aktuellen Google-Regeln für diese Funktionen.'),
        },
      },
      {
        id: 'cost',
        feature: 'Entstehen zusätzliche Kosten?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'SkillPilot selbst ohne zusätzliche Gebühr', 'Prüfe, ob dein Konto die Plugin-Einrichtung in ChatGPT Desktop anbietet.'),
          'chatgpt-plus-pro': cell('conditional', 'Bezahlter Anbieter-Tarif', 'SkillPilot selbst berechnet keine zusätzliche Gebühr.'),
          'chatgpt-business': cell('admin', 'Wird von deiner Organisation festgelegt'),
          'chatgpt-enterprise-edu': cell('admin', 'Wird von Schule oder Organisation festgelegt'),
          'claude-free': cell('unavailable', 'Kein vollständiger Plugin-Zugang', 'Für den unterstützten SkillPilot-Betaweg ist Claude Pro erforderlich.'),
          'claude-pro-max': cell('conditional', 'Bezahlter Anbieter-Tarif', 'SkillPilot selbst berechnet keine zusätzliche Gebühr.'),
          'claude-team-enterprise': cell('admin', 'Wird von deiner Organisation festgelegt'),
          'gemini-controlled-web': cell('conditional', 'SkillPilot selbst ohne zusätzliche Gebühr', 'Prüfe Kosten und Funktionszugang deines Google-Kontos. Der getestete Zugang belegt keine allgemeine Tarifverfügbarkeit.'),
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
          'chatgpt-free-go': cell('conditional', 'In SkillPilot ChatGPT Desktop wählen und „Lernen mit ChatGPT vorbereiten“', 'Installiere das Plugin nach der Anleitung unter „Plugins“ und sende die neue Startnachricht in ChatGPT Desktop.'),
          'chatgpt-plus-pro': cell('conditional', 'In SkillPilot ChatGPT Desktop wählen und „Lernen mit ChatGPT vorbereiten“', 'Installiere das Plugin nach der Anleitung unter „Plugins“ und sende die neue Startnachricht in ChatGPT Desktop.'),
          'chatgpt-business': cell('admin', 'Nach Freigabe ChatGPT Desktop wählen und „Lernen mit ChatGPT vorbereiten“', 'Verwende die neue ChatGPT-Startnachricht in ChatGPT Desktop.'),
          'chatgpt-enterprise-edu': cell('admin', 'Nach Freigabe ChatGPT Desktop wählen und „Lernen mit ChatGPT vorbereiten“', 'Verwende die neue ChatGPT-Startnachricht in ChatGPT Desktop.'),
          'claude-free': cell('unavailable', 'Kein vollständiger Plugin-Start', 'Für den unterstützten SkillPilot-Betaweg ist Claude Pro erforderlich.'),
          'claude-pro-max': cell('available', 'In SkillPilot „Lernen starten“ wählen', 'Installiere und verbinde das Plugin vorher einmalig nach der Anleitung unter „Plugins“.'),
          'claude-team-enterprise': cell('admin', 'Nach Freigabe ebenfalls über „Lernen starten“'),
          'gemini-controlled-web': cell('conditional', 'In SkillPilot „Lernen starten“ → „Gemini (Beta)“ → „Lernen mit Gemini vorbereiten“', 'Coach-Skill importieren und Custom App verbinden. Im neuen Gemini-Chat mit „/“ den Skill und mit „@“ SkillPilot auswählen; dann die neue Startnachricht senden.'),
        },
      },
      {
        id: 'session-duration',
        feature: 'Wie lange bleibt die Lernsession gültig?',
        cells: {
          'chatgpt-free-go': cell('conditional', '24 Stunden ab dem Start'),
          'chatgpt-plus-pro': cell('conditional', '24 Stunden ab dem Start', 'Danach in SkillPilot eine neue Lernsession starten.'),
          'chatgpt-business': cell('admin', 'Nach Freigabe: 24 Stunden ab dem Start'),
          'chatgpt-enterprise-edu': cell('admin', 'Nach Freigabe: 24 Stunden ab dem Start'),
          'claude-free': cell('unavailable', 'Nicht über das vollständige Plugin verfügbar'),
          'claude-pro-max': cell('available', '24 Stunden ab dem Start', 'Danach in SkillPilot eine neue Lernsession starten.'),
          'claude-team-enterprise': cell('admin', 'Nach Freigabe: 24 Stunden ab dem Start'),
          'gemini-controlled-web': cell('conditional', '24 Stunden ab dem Start; spätestens nach 23 Stunden neu vorbereiten', 'Die Verbindung im kontrollierten Betatest benötigt nach spätestens einer Stunde oder einem Neustart eine erneute Verbindung. Das verlängert die Lernsession nicht.'),
        },
      },
      {
        id: 'privacy-boundary',
        feature: 'Was muss ich beim Teilen beachten?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Dauerhafter Lernstand bleibt bei SkillPilot', 'Teile die vorbereitete Startnachricht und den Lernchat nicht mit anderen.'),
          'chatgpt-plus-pro': cell('conditional', 'Dauerhafter Lernstand bleibt bei SkillPilot', 'Teile die vorbereitete Startnachricht und den Lernchat nicht mit anderen.'),
          'chatgpt-business': cell('admin', 'Dauerhafter Lernstand bleibt bei SkillPilot', 'Teile die vorbereitete Startnachricht und den Lernchat nicht mit anderen.'),
          'chatgpt-enterprise-edu': cell('admin', 'Dauerhafter Lernstand bleibt bei SkillPilot', 'Teile die vorbereitete Startnachricht und den Lernchat nicht mit anderen.'),
          'claude-free': cell('unavailable', 'Kein vollständiger Plugin-Zugang'),
          'claude-pro-max': cell('available', 'Dauerhafter Lernstand bleibt bei SkillPilot', 'Teile die vorbereitete Startnachricht und den Lernchat nicht mit anderen.'),
          'claude-team-enterprise': cell('admin', 'Dieselbe Schutzregel gilt vor einer Freigabe als Voraussetzung'),
          'gemini-controlled-web': cell('conditional', 'Dauerhafter Lernstand bleibt bei SkillPilot', 'Teile die vorbereitete Startnachricht, den Lernchat und private Verbindungsdaten nicht. Die dauerhafte Lern-ID bleibt bei SkillPilot.'),
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
          'chatgpt-free-go': cell('conditional', 'Aktuelles Lernziel, Fortschritt, Lernzielbilder, Kartenübungen und Abfragen', 'Die einzelnen Lernfunktionen erproben wir im Desktop-Betatest.'),
          'chatgpt-plus-pro': cell('conditional', 'Aktuelles Lernziel, Fortschritt, Lernzielbilder, Kartenübungen und Abfragen', 'Die einzelnen Lernfunktionen erproben wir im Desktop-Betatest.'),
          'chatgpt-business': cell('admin', 'Dieselben Lernfunktionen nach der Freigabe'),
          'chatgpt-enterprise-edu': cell('admin', 'Dieselben Lernfunktionen nach der Freigabe'),
          'claude-free': cell('unavailable', 'Kein vollständiges Plugin mit Coaching-Skill'),
          'claude-pro-max': cell('available', 'Aktuelles Lernziel, Tagesplan, Fortschritt, Lernzielbilder, Kartenübungen und Abfragen', 'Im Betatest verbessern wir die Lernabläufe anhand eurer Rückmeldungen.'),
          'claude-team-enterprise': cell('admin', 'Dieselben Lernfunktionen nach der Freigabe'),
          'gemini-controlled-web': cell('tested', 'Lernkontext, gespeicherter Fortschritt und Fortsetzung im neuen Chat', 'Im kontrollierten Ein-Konto-Test bestätigt. Lernzielbilder öffnen über einen Direktlink; eingebettete Bilder, vollständige Kartenübung, Verified Recall und Prüfungen sind im Gemini-Host noch zu prüfen.'),
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
          'claude-free': cell('unavailable', 'Nicht über das vollständige Plugin verfügbar'),
          'claude-pro-max': cell('tested', 'Ja – lade Fotos hoch oder nutze die Kamera direkt in der Claude-App.', 'Am praktischsten mit dem Handy. Persönliche Angaben vorher verdecken.'),
          'claude-team-enterprise': cell('planned', 'Nach Freigabe, wenn dein normaler Textchat Uploads anbietet'),
          'gemini-controlled-web': cell('conditional', 'Wenn dein normaler Gemini-Textchat Uploads anbietet', 'Für SkillPilot in Gemini noch nicht geprüft. Persönliche Angaben vorher verdecken.'),
        },
      },
      {
        id: 'browser-devices',
        feature: 'Welche Geräte kann ich verwenden?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'ChatGPT Desktop', 'Browser und mobile ChatGPT-App sind für diesen Betatest nicht freigegeben.'),
          'chatgpt-plus-pro': cell('conditional', 'ChatGPT Desktop', 'Installation und Lernstart unter Windows sind im Betatest bestätigt.'),
          'chatgpt-business': cell('admin', 'ChatGPT Desktop nach Freigabe', 'Browser und mobile ChatGPT-App sind für diesen Betatest nicht freigegeben.'),
          'chatgpt-enterprise-edu': cell('admin', 'ChatGPT Desktop nach Freigabe', 'Browser und mobile ChatGPT-App sind für diesen Betatest nicht freigegeben.'),
          'claude-free': cell('unavailable', 'Kein vollständiger Plugin-Zugang'),
          'claude-pro-max': cell('available', 'Claude Web und die Claude-App', 'Verwende das Konto, in dem du das SkillPilot-Plugin installiert hast.'),
          'claude-team-enterprise': cell('admin', 'Claude Web im Browser nach Freigabe'),
          'gemini-controlled-web': cell('tested', 'Gemini Web in der englischen Oberfläche', 'Ein persönliches Google-Konto über einen US-Testzugang. Die SkillPilot-Lernsession kann auf Deutsch oder Englisch geführt werden.'),
        },
      },
      {
        id: 'native-mobile-app',
        feature: 'Soll ich die native App verwenden?',
        cells: {
          'chatgpt-free-go': cell('unavailable', 'Mobile ChatGPT-App nicht freigegeben', 'Nutze für den Betatest ChatGPT Desktop.'),
          'chatgpt-plus-pro': cell('unavailable', 'Mobile ChatGPT-App nicht freigegeben', 'Nutze für den Betatest ChatGPT Desktop.'),
          'chatgpt-business': cell('unavailable', 'Mobile ChatGPT-App nicht freigegeben', 'Nutze für den Betatest ChatGPT Desktop.'),
          'chatgpt-enterprise-edu': cell('unavailable', 'Mobile ChatGPT-App nicht freigegeben', 'Nutze für den Betatest ChatGPT Desktop.'),
          'claude-free': cell('unavailable', 'Kein vollständiger Plugin-Zugang'),
          'claude-pro-max': cell('available', 'Ja, die Claude-App funktioniert im Betatest', 'Installiere das Plugin zuerst in Claude Web und nutze dann dasselbe Konto in der App.'),
          'claude-team-enterprise': cell('admin', 'Nicht Teil des aktuellen SkillPilot-Betawegs'),
          'gemini-controlled-web': cell('planned', 'Mobile Gemini-App mit SkillPilot noch nicht geprüft', 'Für den kontrollierten Test Gemini Web verwenden.'),
        },
      },
      {
        id: 'dictation',
        feature: 'Kann ich meine Antwort diktieren?',
        cells: {
          'chatgpt-free-go': cell('available', 'Ja, als Texteingabe im normalen Chat', 'Prüfe den erkannten Text vor dem Senden.'),
          'chatgpt-plus-pro': cell('available', 'Ja, als Texteingabe im normalen Chat', 'Prüfe den erkannten Text vor dem Senden.'),
          'chatgpt-business': cell('available', 'Ja, als Texteingabe im normalen Chat', 'Prüfe den erkannten Text vor dem Senden.'),
          'chatgpt-enterprise-edu': cell('available', 'Ja, als Texteingabe im normalen Chat', 'Prüfe den erkannten Text vor dem Senden.'),
          'claude-free': cell('unavailable', 'Nicht über das vollständige Plugin verfügbar'),
          'claude-pro-max': cell('available', 'Ja, als Texteingabe im normalen Chat', 'Prüfe den erkannten Text vor dem Senden.'),
          'claude-team-enterprise': cell('planned', 'Nach Freigabe als Texteingabe im normalen Chat'),
          'gemini-controlled-web': cell('conditional', 'Wenn dein Gerät Diktat als normale Texteingabe anbietet', 'Für SkillPilot in Gemini noch nicht geprüft; kontrolliere den erkannten Text vor dem Senden.'),
        },
      },
      {
        id: 'voice-mode',
        feature: 'Kann ich den fortlaufenden Voice Mode nutzen?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Im Desktop-Betatest ausprobiert', 'Lernen mit Voice Mode wurde unter Windows in „Work“ ausprobiert. Die vollständige Bildfolge wird noch geprüft; Zugang hängt von deinem Konto ab.'),
          'chatgpt-plus-pro': cell('conditional', 'Im Desktop-Betatest ausprobiert', 'Lernen mit Voice Mode wurde unter Windows in „Work“ ausprobiert. Die vollständige Bildfolge wird noch geprüft; Zugang hängt von deinem Konto ab.'),
          'chatgpt-business': cell('admin', 'Nach Freigabe im Desktop-Betatest', 'Erste Voice-Erfahrungen unter Windows in „Work“; die vollständige Bildfolge wird noch geprüft. Deine Organisation muss den Zugang erlauben.'),
          'chatgpt-enterprise-edu': cell('admin', 'Nach Freigabe im Desktop-Betatest', 'Erste Voice-Erfahrungen unter Windows in „Work“; die vollständige Bildfolge wird noch geprüft. Deine Organisation muss den Zugang erlauben.'),
          'claude-free': cell('unavailable', 'Kein vollständiger Plugin-Zugang'),
          'claude-pro-max': cell('available', 'Ja, Voice Mode funktioniert im Betatest', 'Die Sprachausgabe stockt gelegentlich. Warte dann kurz – in den bisherigen Tests spricht Claude anschließend weiter.'),
          'claude-team-enterprise': cell('admin', 'Nicht Teil des aktuellen SkillPilot-Betawegs'),
          'gemini-controlled-web': cell('planned', 'Voice mit SkillPilot in Gemini noch nicht geprüft', 'Die Erfahrungen mit Claude und ChatGPT bestätigen keine Gemini-Voice-Funktionen.'),
        },
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
          'chatgpt-free-go': cell('conditional', 'ChatGPT desktop beta', 'If your account supports setup through a Git marketplace under “Plugins”.'),
          'chatgpt-plus-pro': cell('conditional', 'ChatGPT desktop beta', 'If your account supports setup through a Git marketplace under “Plugins”.'),
          'chatgpt-business': cell('admin', 'ChatGPT desktop beta after approval', 'Your organisation must allow plugin setup through the Git marketplace.'),
          'chatgpt-enterprise-edu': cell('admin', 'ChatGPT desktop beta after approval', 'Your organisation must allow plugin setup through the Git marketplace.'),
          'claude-free': cell('unavailable', 'Complete plugin not available', 'Claude Pro is required for the supported SkillPilot beta route.'),
          'claude-pro-max': cell('available', 'Yes, in the ongoing beta', 'Install and connect the current plugin using the guide under “Plugins”.'),
          'claude-team-enterprise': cell('planned', 'Plugin not yet released for new learners'),
          'gemini-controlled-web': cell('conditional', 'Controlled Gemini web beta', 'One Google account with separately approved SkillPilot access so far. Additional accounts and public setup are not yet confirmed.'),
        },
      },
      {
        id: 'provider-plan',
        feature: 'Which account is eligible in principle?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Depends on your account', 'Check whether ChatGPT Desktop offers “Plugins” and “Add marketplace”.'),
          'chatgpt-plus-pro': cell('conditional', 'Depends on your plugin setup', 'Check whether ChatGPT Desktop offers “Plugins” and “Add marketplace”.'),
          'chatgpt-business': cell('admin', 'Ask the person who manages your account'),
          'chatgpt-enterprise-edu': cell('admin', 'Approval from your school or organisation is required'),
          'claude-free': cell('unavailable', 'No complete plugin access', 'Claude Pro is required for the supported SkillPilot beta route.'),
          'claude-pro-max': cell('available', 'Claude Pro', 'The current SkillPilot beta route for individuals.'),
          'claude-team-enterprise': cell('admin', 'Complete plugin possible after approval from your organisation'),
          'gemini-controlled-web': cell('conditional', 'Personal Google account with custom apps and Skills', 'Google currently requires US access, English and Keep Activity enabled. Both features must be enabled for your account; a plan alone does not guarantee this.'),
        },
      },
      {
        id: 'minimum-age',
        feature: 'How old must I be for my provider account?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'At least 13 or the minimum age in your country', 'If you are under 18, you need permission from a parent or legal guardian.'),
          'chatgpt-plus-pro': cell('conditional', 'At least 13 or the minimum age in your country', 'If you are under 18, you need permission from a parent or legal guardian.'),
          'chatgpt-business': cell('admin', 'At least 13 or the minimum age in your country', 'Additional rules from your school or organisation may apply.'),
          'chatgpt-enterprise-edu': cell('admin', 'At least 13 or the minimum age in your country', 'Additional rules from your school or organisation may apply.'),
          'claude-free': cell('unavailable', 'At least 18'),
          'claude-pro-max': cell('conditional', 'At least 18'),
          'claude-team-enterprise': cell('unavailable', 'At least 18'),
          'gemini-controlled-web': cell('conditional', 'At least 18 for custom apps and Skills', 'The current Google rules for these features apply.'),
        },
      },
      {
        id: 'cost',
        feature: 'Are there additional costs?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'No additional charge from SkillPilot', 'Check whether your account offers plugin setup in ChatGPT Desktop.'),
          'chatgpt-plus-pro': cell('conditional', 'Paid provider plan', 'SkillPilot does not charge an additional fee.'),
          'chatgpt-business': cell('admin', 'Set by your organisation'),
          'chatgpt-enterprise-edu': cell('admin', 'Set by your school or organisation'),
          'claude-free': cell('unavailable', 'No complete plugin access', 'Claude Pro is required for the supported SkillPilot beta route.'),
          'claude-pro-max': cell('conditional', 'Paid provider plan', 'SkillPilot does not charge an additional fee.'),
          'claude-team-enterprise': cell('admin', 'Set by your organisation'),
          'gemini-controlled-web': cell('conditional', 'No additional charge from SkillPilot', 'Check your Google account’s costs and feature access. The tested access does not establish general plan availability.'),
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
          'chatgpt-free-go': cell('conditional', 'Select ChatGPT Desktop and “Prepare learning with ChatGPT” in SkillPilot', 'Install the plugin using the guide under “Plugins”, then send the new start message in ChatGPT Desktop.'),
          'chatgpt-plus-pro': cell('conditional', 'Select ChatGPT Desktop and “Prepare learning with ChatGPT” in SkillPilot', 'Install the plugin using the guide under “Plugins”, then send the new start message in ChatGPT Desktop.'),
          'chatgpt-business': cell('admin', 'After approval, select ChatGPT Desktop and “Prepare learning with ChatGPT”', 'Use the new ChatGPT start message in ChatGPT Desktop.'),
          'chatgpt-enterprise-edu': cell('admin', 'After approval, select ChatGPT Desktop and “Prepare learning with ChatGPT”', 'Use the new ChatGPT start message in ChatGPT Desktop.'),
          'claude-free': cell('unavailable', 'No complete plugin start', 'Claude Pro is required for the supported SkillPilot beta route.'),
          'claude-pro-max': cell('available', 'Select “Start Learning” in SkillPilot', 'First install and connect the plugin once using the guide under “Plugins”.'),
          'claude-team-enterprise': cell('admin', 'After approval, also use “Start Learning”'),
          'gemini-controlled-web': cell('conditional', 'In SkillPilot select “Start Learning” → “Gemini (Beta)” → “Prepare learning with Gemini”', 'Import the coaching Skill and connect the custom app. In a new Gemini chat, use “/” to select the Skill and “@” to select SkillPilot; then send the new start message.'),
        },
      },
      {
        id: 'session-duration',
        feature: 'How long is the learning session valid?',
        cells: {
          'chatgpt-free-go': cell('conditional', '24 hours from the start'),
          'chatgpt-plus-pro': cell('conditional', '24 hours from the start', 'After that, start a new learning session in SkillPilot.'),
          'chatgpt-business': cell('admin', 'After approval: 24 hours from the start'),
          'chatgpt-enterprise-edu': cell('admin', 'After approval: 24 hours from the start'),
          'claude-free': cell('unavailable', 'Not available through the complete plugin'),
          'claude-pro-max': cell('available', '24 hours from the start', 'After that, start a new learning session in SkillPilot.'),
          'claude-team-enterprise': cell('admin', 'After approval: 24 hours from the start'),
          'gemini-controlled-web': cell('conditional', '24 hours from the start; prepare again after at most 23 hours', 'The controlled beta connection requires reconnecting after at most one hour or a restart. This does not extend the learning session.'),
        },
      },
      {
        id: 'privacy-boundary',
        feature: 'What should I know before sharing?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Your long-term learning record stays with SkillPilot', 'Do not share the prepared start message or your learning chat with other people.'),
          'chatgpt-plus-pro': cell('conditional', 'Your long-term learning record stays with SkillPilot', 'Do not share the prepared start message or your learning chat with other people.'),
          'chatgpt-business': cell('admin', 'Your long-term learning record stays with SkillPilot', 'Do not share the prepared start message or your learning chat with other people.'),
          'chatgpt-enterprise-edu': cell('admin', 'Your long-term learning record stays with SkillPilot', 'Do not share the prepared start message or your learning chat with other people.'),
          'claude-free': cell('unavailable', 'No complete plugin access'),
          'claude-pro-max': cell('available', 'Your long-term learning record stays with SkillPilot', 'Do not share the prepared start message or your learning chat with other people.'),
          'claude-team-enterprise': cell('admin', 'The same protection is required before release'),
          'gemini-controlled-web': cell('conditional', 'Your long-term learning record stays with SkillPilot', 'Do not share the prepared start message, learning chat or private connection details. Your permanent learner ID stays with SkillPilot.'),
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
          'chatgpt-free-go': cell('conditional', 'Current learning goal, progress, goal images, card practice, and assessments', 'We are trying the individual learning features in the desktop beta.'),
          'chatgpt-plus-pro': cell('conditional', 'Current learning goal, progress, goal images, card practice, and assessments', 'We are trying the individual learning features in the desktop beta.'),
          'chatgpt-business': cell('admin', 'The same learning features after approval'),
          'chatgpt-enterprise-edu': cell('admin', 'The same learning features after approval'),
          'claude-free': cell('unavailable', 'No complete plugin with the coaching Skill'),
          'claude-pro-max': cell('available', 'Current learning goal, daily plan, progress, goal images, card practice, and assessments', 'During the beta, we improve learning flows based on your feedback.'),
          'claude-team-enterprise': cell('admin', 'The same learning features after approval'),
          'gemini-controlled-web': cell('tested', 'Learning context, saved progress and continuation in a new chat', 'Confirmed in the controlled single-account test. Goal images open through a direct link; embedded images, full card practice, Verified Recall and exams still need checking in Gemini.'),
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
          'claude-free': cell('unavailable', 'Not available through the complete plugin'),
          'claude-pro-max': cell('tested', 'Yes – upload photos or use the camera directly in the Claude app.', 'Most convenient on your phone. Hide personal information first.'),
          'claude-team-enterprise': cell('planned', 'After release, when your normal text chat offers uploads'),
          'gemini-controlled-web': cell('conditional', 'When your normal Gemini text chat offers uploads', 'Not yet checked for SkillPilot in Gemini. Hide personal information first.'),
        },
      },
      {
        id: 'browser-devices',
        feature: 'Which devices can I use?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'ChatGPT Desktop', 'The browser and mobile ChatGPT app are not enabled for this beta.'),
          'chatgpt-plus-pro': cell('conditional', 'ChatGPT Desktop', 'Installation and learning start on Windows are confirmed in the beta.'),
          'chatgpt-business': cell('admin', 'ChatGPT Desktop after approval', 'The browser and mobile ChatGPT app are not enabled for this beta.'),
          'chatgpt-enterprise-edu': cell('admin', 'ChatGPT Desktop after approval', 'The browser and mobile ChatGPT app are not enabled for this beta.'),
          'claude-free': cell('unavailable', 'No complete plugin access'),
          'claude-pro-max': cell('available', 'Claude Web and the Claude app', 'Use the account where you installed the SkillPilot plugin.'),
          'claude-team-enterprise': cell('admin', 'Claude Web in a browser after approval'),
          'gemini-controlled-web': cell('tested', 'Gemini Web in the English interface', 'One personal Google account through a US test connection. Your SkillPilot learning session can use German or English.'),
        },
      },
      {
        id: 'native-mobile-app',
        feature: 'Should I use the native app?',
        cells: {
          'chatgpt-free-go': cell('unavailable', 'Mobile ChatGPT app not enabled', 'Use ChatGPT Desktop for the beta.'),
          'chatgpt-plus-pro': cell('unavailable', 'Mobile ChatGPT app not enabled', 'Use ChatGPT Desktop for the beta.'),
          'chatgpt-business': cell('unavailable', 'Mobile ChatGPT app not enabled', 'Use ChatGPT Desktop for the beta.'),
          'chatgpt-enterprise-edu': cell('unavailable', 'Mobile ChatGPT app not enabled', 'Use ChatGPT Desktop for the beta.'),
          'claude-free': cell('unavailable', 'No complete plugin access'),
          'claude-pro-max': cell('available', 'Yes, the Claude app works in the beta', 'Install the plugin in Claude Web first, then use the same account in the app.'),
          'claude-team-enterprise': cell('admin', 'Not part of the current SkillPilot beta route'),
          'gemini-controlled-web': cell('planned', 'Mobile Gemini app with SkillPilot not yet checked', 'Use Gemini Web for the controlled test.'),
        },
      },
      {
        id: 'dictation',
        feature: 'Can I dictate my answer?',
        cells: {
          'chatgpt-free-go': cell('available', 'Yes, as text input in normal chat', 'Check the recognised text before sending.'),
          'chatgpt-plus-pro': cell('available', 'Yes, as text input in normal chat', 'Check the recognised text before sending.'),
          'chatgpt-business': cell('available', 'Yes, as text input in normal chat', 'Check the recognised text before sending.'),
          'chatgpt-enterprise-edu': cell('available', 'Yes, as text input in normal chat', 'Check the recognised text before sending.'),
          'claude-free': cell('unavailable', 'Not available through the complete plugin'),
          'claude-pro-max': cell('available', 'Yes, as text input in normal chat', 'Check the recognised text before sending.'),
          'claude-team-enterprise': cell('planned', 'After release, as text input in normal chat'),
          'gemini-controlled-web': cell('conditional', 'When your device offers dictation as ordinary text input', 'Not yet checked for SkillPilot in Gemini; check the recognised text before sending.'),
        },
      },
      {
        id: 'voice-mode',
        feature: 'Can I use continuous voice mode?',
        cells: {
          'chatgpt-free-go': cell('conditional', 'Tried in the desktop beta', 'Learning with voice mode has been tried in “Work” on Windows. The complete image sequence is still being checked; access depends on your account.'),
          'chatgpt-plus-pro': cell('conditional', 'Tried in the desktop beta', 'Learning with voice mode has been tried in “Work” on Windows. The complete image sequence is still being checked; access depends on your account.'),
          'chatgpt-business': cell('admin', 'Desktop beta after approval', 'Initial voice experience in “Work” on Windows; the complete image sequence is still being checked. Your organisation must allow access.'),
          'chatgpt-enterprise-edu': cell('admin', 'Desktop beta after approval', 'Initial voice experience in “Work” on Windows; the complete image sequence is still being checked. Your organisation must allow access.'),
          'claude-free': cell('unavailable', 'No complete plugin access'),
          'claude-pro-max': cell('available', 'Yes, voice mode works in the beta', 'Speech occasionally stalls. Wait briefly – in our tests, Claude then continues speaking.'),
          'claude-team-enterprise': cell('admin', 'Not part of the current SkillPilot beta route'),
          'gemini-controlled-web': cell('planned', 'Voice with SkillPilot in Gemini not yet checked', 'Experience with Claude and ChatGPT does not confirm Gemini voice features.'),
        },
      },
    ],
  },
]

const germanCopy: CoachProviderMatrixCopy = {
  title: 'Welcher Zugang passt zu mir?',
  intro: 'Die Claude-Beta läuft weiter. Zusätzlich kannst du den ChatGPT-Desktop-Betatest über den Git-Marketplace ausprobieren, wenn dein Konto die Plugin-Einrichtung unterstützt. Gemini ist als kontrollierter Web-Betatest mit eigens freigegebenem Zugang ergänzt; eine öffentliche Einrichtung für weitere Konten ist noch nicht bestätigt.',
  asOf: 'Stand: 6. Oktober 2026',
  featureHeading: 'Was du wissen möchtest',
  mobileFeatureHeading: 'Antworten für diesen Zugang',
  providerFilterLabel: 'Welchen Anbieter möchtest du prüfen?',
  providerFilterHint: 'Zeige Claude, ChatGPT oder Gemini. Du kannst jederzeit wechseln.',
  statusLabels: {
    available: 'Grundsätzlich möglich',
    tested: 'Von SkillPilot erprobt',
    conditional: 'Bedingt / noch zu prüfen',
    planned: 'Noch nicht verfügbar',
    unavailable: 'Nicht geeignet',
    admin: 'Freigabe nötig',
  },
  legendLabel: 'Bedeutung',
  startTitle: 'So startest du deine Lernsession',
  startText: 'Installiere und verbinde das SkillPilot-Plugin nach der aktuellen Anleitung unter „Plugins“. Wähle in SkillPilot den passenden Coach und seine Startoption. Sende die neue Startnachricht bei Claude in einem neuen Chat, bei ChatGPT Desktop in einer neuen Unterhaltung im Bereich „Work“. Für Gemini brauchst du den importierten Coach-Skill und die verbundene Custom App; aktiviere beide im neuen Chat mit „/“ und „@“. Deine Lernsession ist 24 Stunden gültig; bereite für Gemini spätestens nach 23 Stunden eine neue vor.',
  privacyTitle: 'Halte den Zugang zu deiner Lernsession privat',
  privacyText: 'Teile die vorbereitete Startnachricht und den Lernchat nicht mit anderen. Dein dauerhafter Lernstand bleibt bei SkillPilot.',
  caveat: 'Installation und Lernstart in ChatGPT Desktop unter Windows sind im Betatest bestätigt. Nutze den Bereich „Work“; im Bereich „Chat“ ist das Plugin derzeit nicht nutzbar. Weitere Lernfunktionen werden im Betatest erprobt. SkillPilot ist noch nicht im öffentlichen ChatGPT-App-Verzeichnis veröffentlicht. Browser, mobile App und automatische Updates für alle Konten sind nicht bestätigt. Der Gemini-Webtest bestätigt Lernkontext, Speichern und Fortsetzung für ein Google-Konto in einer separaten Testumgebung. Weitere Konten, mobile App, Voice und vollständige Karten-/Prüfungsabläufe sind noch nicht bestätigt. Anbieter können Tarife und Funktionen ändern.',
  variants: germanVariants,
  groups: germanGroups,
  sourcesTitle: 'Offizielle Angaben der Anbieter',
  sourcesNote: 'Dort findest du die jeweils aktuellen Regeln zu Zugang und Mindestalter.',
  sources: [
    { id: 'openai-access', label: 'ChatGPT: Zugang nach Konto und Tarif', href: 'https://help.openai.com/en/articles/20001256' },
    { id: 'openai-age', label: 'ChatGPT: Mindestalter und Zustimmung', href: 'https://openai.com/policies/terms-of-use/' },
    { id: 'anthropic-access', label: 'Claude: unterstützte Tarife', href: 'https://support.claude.com/en/articles/13837440-use-plugins-in-claude' },
    { id: 'anthropic-voice', label: 'Claude: Voice Mode', href: 'https://support.claude.com/en/articles/11101966-use-voice-mode' },
    { id: 'anthropic-age', label: 'Claude: Mindestalter', href: 'https://support.claude.com/en/articles/13117299-minimum-age-requirement-access-restriction' },
    { id: 'google-custom-apps', label: 'Gemini: Custom Apps und Voraussetzungen', href: 'https://support.google.com/gemini/answer/17209137?hl=en-12' },
    { id: 'google-skills', label: 'Gemini: Skills importieren und Voraussetzungen', href: 'https://support.google.com/gemini/answer/17094296?hl=en' },
  ],
}

const englishCopy: CoachProviderMatrixCopy = {
  title: 'Which access option fits me?',
  intro: 'The Claude beta continues. You can also try the ChatGPT desktop beta through the Git marketplace if your account supports plugin setup. Gemini has been added as a controlled web beta with separately approved access; public setup for additional accounts is not yet confirmed.',
  asOf: 'Status: October 6, 2026',
  featureHeading: 'What you want to know',
  mobileFeatureHeading: 'Answers for this access option',
  providerFilterLabel: 'Which provider do you want to check?',
  providerFilterHint: 'Show Claude, ChatGPT or Gemini. You can switch at any time.',
  statusLabels: {
    available: 'Possible in principle',
    tested: 'Tested by SkillPilot',
    conditional: 'Conditional / pending verification',
    planned: 'Not available yet',
    unavailable: 'Not suitable',
    admin: 'Approval required',
  },
  legendLabel: 'Meaning',
  startTitle: 'Start your learning session',
  startText: 'Install and connect the SkillPilot plugin using the current guide under “Plugins”. Select the matching coach and its start option in SkillPilot. Send the new start message in a new Claude chat or a new conversation in the “Work” section of ChatGPT Desktop. Gemini requires the imported coaching Skill and connected custom app; select both in a new chat with “/” and “@”. Your learning session is valid for 24 hours; for Gemini, prepare a new one after at most 23 hours.',
  privacyTitle: 'Keep access to your learning session private',
  privacyText: 'Do not share the prepared start message or your learning chat with other people. Your long-term learning record stays with SkillPilot.',
  caveat: 'Installation and learning start in ChatGPT Desktop on Windows are confirmed in the beta. Use the “Work” section; the plugin is currently unavailable in “Chat”. We are trying further learning features in the beta. SkillPilot has not been published in the public ChatGPT app directory. Browser and mobile access, and automatic updates for every account, are not confirmed. The Gemini web test confirms learning context, saving and continuation for one Google account in a separate test environment. Additional accounts, mobile app, voice and full card/exam flows are not yet confirmed. Providers may change plans and features.',
  variants: englishVariants,
  groups: englishGroups,
  sourcesTitle: 'Official provider information',
  sourcesNote: 'These pages contain the latest provider rules for access and minimum age.',
  sources: [
    { id: 'openai-access', label: 'ChatGPT: access by account and plan', href: 'https://help.openai.com/en/articles/20001256' },
    { id: 'openai-age', label: 'ChatGPT: minimum age and consent', href: 'https://openai.com/policies/terms-of-use/' },
    { id: 'anthropic-access', label: 'Claude: supported plans', href: 'https://support.claude.com/en/articles/13837440-use-plugins-in-claude' },
    { id: 'anthropic-voice', label: 'Claude: voice mode', href: 'https://support.claude.com/en/articles/11101966-use-voice-mode' },
    { id: 'anthropic-age', label: 'Claude: minimum age', href: 'https://support.claude.com/en/articles/13117299-minimum-age-requirement-access-restriction' },
    { id: 'google-custom-apps', label: 'Gemini: custom apps and requirements', href: 'https://support.google.com/gemini/answer/17209137?hl=en-12' },
    { id: 'google-skills', label: 'Gemini: importing Skills and requirements', href: 'https://support.google.com/gemini/answer/17094296?hl=en' },
  ],
}

export const getCoachProviderMatrixCopy = (language: LabelLanguage): CoachProviderMatrixCopy => (
  language === 'en' ? englishCopy : germanCopy
)
