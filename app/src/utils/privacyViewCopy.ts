import type { LabelLanguage } from './filterLabels'

export interface PrivacyViewSectionCopy {
  title: string
  paragraphs: string[]
  bullets?: string[]
  paragraphsAfterBullets?: string[]
}

export interface PrivacyViewCopy {
  backToApp: string
  title: string
  effectiveDate: string
  intro: string
  sections: PrivacyViewSectionCopy[]
  contactTitle: string
  contactIntro: string
  imprintLabel: string
}

export const getPrivacyViewCopy = (language: LabelLanguage): PrivacyViewCopy => (
  language === 'en'
    ? {
        backToApp: 'Back to App',
        title: 'Privacy Policy',
        effectiveDate: 'Date: July 22, 2026',
        intro:
          'We appreciate your interest in SkillPilot. Protecting your privacy is very important to us. Below we provide detailed information about how we handle your data.',
        sections: [
          {
            title: '1. Pseudonymous Use',
            paragraphs: [
              'SkillPilot is designed to be used completely pseudonymously. We do not require registration with a real name or email address. Your learning progress is stored exclusively under a randomly generated SkillPilot ID (UUID).',
              'This ID is the only key to your data. If you lose this ID, we cannot restore your learning status, as we have no link to your person.',
            ],
          },
          {
            title: '2. Data Collection and Storage',
            paragraphs: [
              'When you use SkillPilot, we store the following information under your SkillPilot ID:',
            ],
            bullets: [
              'Your chosen learning path (curriculum/landscape).',
              'Your current learning status (mastery) for individual skills.',
              'Your planned learning goals (frontier).',
            ],
            paragraphsAfterBullets: [
              'This data is used exclusively to provide you with suitable learning suggestions and to visualize your progress.',
            ],
          },
          {
            title: '3. Use with AI Assistants',
            paragraphs: [
              'SkillPilot currently supports two separate ChatGPT connection variants. In the Visible Session variant, a temporary session token is shown in the prepared start message and in the chat; it expires after no more than 24 hours. In the German OpenAI OAuth/MCP App variant, ChatGPT connects to SkillPilot through an OAuth authorization. The permanent SkillPilot ID remains inside SkillPilot and is not included in the chat, OAuth principal, or MCP tool contract.',
              'The AI provider receives the learning context and tool results required for coaching, as well as everything you enter or upload in its chat. SkillPilot receives the explicit tool requests and arguments needed to read or update your learning state, but not the complete chat transcript. OAuth credentials, temporary connection data, and provider-side conversation data are processed and retained according to the respective technical purpose and the provider’s own terms.',
            ],
          },
          {
            title: '4. Transfer to Third Parties',
            paragraphs: [
              'We do not sell your data and do not share it with unauthorized third parties. When you choose an AI integration, the selected provider processes the conversation and the learning context returned to it under its own privacy and retention terms. Our services are hosted on secure servers.',
            ],
          },
          {
            title: '5. Your Rights',
            paragraphs: [
              'Since we only store your data pseudonymously, we can only process information or deletion requests if you provide us with your SkillPilot ID. You can have your data deleted at any time by transmitting your ID to us or (if implemented) using the delete function in the app.',
            ],
          },
        ],
        contactTitle: '6. Contact',
        contactIntro: 'If you have any questions about data protection, please contact us at:',
        imprintLabel: 'Imprint',
      }
    : {
        backToApp: 'Zurück zur App',
        title: 'Datenschutzerklärung',
        effectiveDate: 'Stand: 22. Juli 2026',
        intro:
          'Wir freuen uns über Ihr Interesse an SkillPilot. Der Schutz Ihrer Privatsphäre ist für uns sehr wichtig. Nachstehend informieren wir Sie ausführlich über den Umgang mit Ihren Daten.',
        sections: [
          {
            title: '1. Pseudonyme Nutzung',
            paragraphs: [
              'SkillPilot ist so konzipiert, dass es vollständig pseudonym genutzt werden kann. Wir verlangen keine Registrierung mit Klarnamen oder E-Mail-Adresse. Ihr Lernfortschritt wird ausschließlich unter einer zufällig generierten SkillPilot-ID (UUID) gespeichert.',
              'Diese ID ist der einzige Schlüssel zu Ihren Daten. Wenn Sie diese ID verlieren, können wir Ihren Lernstand nicht wiederherstellen, da wir keine Verknüpfung zu Ihrer Person haben.',
            ],
          },
          {
            title: '2. Erhebung und Speicherung von Daten',
            paragraphs: [
              'Wenn Sie SkillPilot nutzen, speichern wir unter Ihrer SkillPilot-ID folgende Informationen:',
            ],
            bullets: [
              'Ihren gewählten Lernpfad (Curriculum/Landschaft).',
              'Ihren aktuellen Lernstand (Mastery) für einzelne Kompetenzen.',
              'Ihre geplanten Lernziele (Frontier).',
            ],
            paragraphsAfterBullets: [
              'Diese Daten dienen ausschließlich dazu, Ihnen passende Lernvorschläge zu machen und Ihren Fortschritt zu visualisieren.',
            ],
          },
          {
            title: '3. Nutzung mit KI-Assistenten',
            paragraphs: [
              'SkillPilot unterstützt derzeit zwei getrennte ChatGPT-Verbindungsvarianten. In der Variante „Visible Session“ wird ein temporäres Sitzungstoken in der vorbereiteten Startnachricht und im Chat angezeigt; es ist höchstens 24 Stunden gültig. In der deutschen OpenAI-OAuth/MCP-App-Variante verbindet sich ChatGPT über eine OAuth-Autorisierung mit SkillPilot. Die dauerhafte SkillPilot-ID bleibt innerhalb von SkillPilot und wird weder in den Chat noch in den OAuth-Principal oder den MCP-Toolvertrag aufgenommen.',
              'Der KI-Anbieter erhält den für das Coaching benötigten Lernkontext und die Toolergebnisse sowie alles, was Sie in dessen Chat eingeben oder hochladen. SkillPilot erhält die ausdrücklichen Toolanfragen und Argumente, die zum Lesen oder Aktualisieren Ihres Lernstands erforderlich sind, jedoch nicht das vollständige Chatprotokoll. OAuth-Zugangsdaten, temporäre Verbindungsdaten und anbieterseitige Konversationsdaten werden entsprechend ihrem jeweiligen technischen Zweck und den Bedingungen des Anbieters verarbeitet und gespeichert.',
            ],
          },
          {
            title: '4. Weitergabe an Dritte',
            paragraphs: [
              'Wir verkaufen Ihre Daten nicht und geben sie nicht unbefugt an Dritte weiter. Wenn Sie eine KI-Integration wählen, verarbeitet der ausgewählte Anbieter die Konversation und den an ihn zurückgegebenen Lernkontext nach seinen eigenen Datenschutz- und Aufbewahrungsbedingungen. Das Hosting unserer Dienste erfolgt auf sicheren Servern.',
            ],
          },
          {
            title: '5. Ihre Rechte',
            paragraphs: [
              'Da wir Ihre Daten nur pseudonym speichern, können wir Auskunfts- oder Löschanfragen nur bearbeiten, wenn Sie uns Ihre SkillPilot-ID mitteilen. Sie können Ihre Daten jederzeit löschen lassen, indem Sie uns Ihre ID übermitteln oder (sofern implementiert) die Löschfunktion in der App nutzen.',
            ],
          },
        ],
        contactTitle: '6. Kontakt',
        contactIntro: 'Bei Fragen zum Datenschutz erreichen Sie uns unter:',
        imprintLabel: 'Impressum',
      }
)
