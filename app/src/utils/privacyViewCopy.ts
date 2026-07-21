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
        effectiveDate: 'Date: July 21, 2026',
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
            title: '3. Use by AI Assistants (GPTs)',
            paragraphs: [
              'When you use SkillPilot via an AI assistant (e.g., ChatGPT), the assistant uses only a temporary session token at our interface (API) to retrieve learning goals or save progress. Your permanent SkillPilot ID is not transmitted to the assistant. In the Visible Session coach variant, the temporary token is shown in the prepared start message and in the chat and expires after no more than 24 hours. We do not receive any chat logs or personal messages from your conversation with the AI assistant.',
            ],
          },
          {
            title: '4. Transfer to Third Parties',
            paragraphs: [
              'We do not sell your data and do not share it with unauthorized third parties. Our services are hosted on secure servers.',
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
        effectiveDate: 'Stand: 21. Juli 2026',
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
            title: '3. Nutzung durch KI-Assistenten (GPTs)',
            paragraphs: [
              'Wenn Sie SkillPilot über einen KI-Assistenten (z.B. ChatGPT) nutzen, verwendet der Assistent an unserer Schnittstelle (API) ausschließlich ein temporäres Sitzungstoken, um Lernziele abzurufen oder Fortschritte zu speichern. Ihre dauerhafte SkillPilot-ID wird nicht an den Assistenten übermittelt. In der Coach-Variante „Visible Session“ wird das temporäre Token in der vorbereiteten Startnachricht und im Chat angezeigt und ist höchstens 24 Stunden gültig. Wir erhalten dabei keine Chat-Protokolle oder persönlichen Nachrichten aus Ihrer Konversation mit dem KI-Assistenten.',
            ],
          },
          {
            title: '4. Weitergabe an Dritte',
            paragraphs: [
              'Wir verkaufen Ihre Daten nicht und geben sie nicht unbefugt an Dritte weiter. Das Hosting unserer Dienste erfolgt auf sicheren Servern.',
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
