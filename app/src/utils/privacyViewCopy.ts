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
        effectiveDate: 'Date: August 31, 2026',
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
              'The time of your last successful activity for the deletion period.',
              'SkillPilot-side learning-session and connection data associated with the SkillPilot ID.',
            ],
            paragraphsAfterBullets: [
              'This data is used to provide suitable learning suggestions, visualize your progress, operate and secure the service, and apply the deletion period described below.',
            ],
          },
          {
            title: '3. Optional Read-only Teacher Supervision',
            paragraphs: [
              'If you explicitly approve a supervision invitation, SkillPilot allows the requesting teacher browser to read your selected subject contexts and the learning status belonging to those subjects. The approval does not allow the teacher to change your subject selection, learning goals, plans, or mastery. SkillPilot does not return your permanent SkillPilot ID or the raw personalization document to the teacher interface.',
              'For this purpose, SkillPilot stores the teacher-provided course and display labels, cryptographic digests of workspace and invitation capabilities, the association with your SkillPilot ID, the approved read capabilities, lifecycle status, and related timestamps. A name or alias entered for the teacher’s local class card remains only in that browser. Invitation links expire after seven days and can be used only once.',
              'An active approval remains valid until you revoke it on the supervision page, the teacher closes the linked course, or the learner state is deleted. Access ends immediately at that point. Expired, revoked, and closed supervision records are removed from the active systems after an additional 30-day retention period in the next daily deletion run; deleting the learner state also removes its server-side supervision memberships. Local browser data must be removed separately on the respective device.',
            ],
          },
          {
            title: '4. Use with AI Assistants',
            paragraphs: [
              'SkillPilot currently supports two separate ChatGPT connection variants. In the Visible Session variant, a temporary session token is shown in the prepared start message and in the chat; it expires after no more than 24 hours. In the multilingual OpenAI OAuth/MCP App variant, ChatGPT connects to SkillPilot through an OAuth authorization. The permanent SkillPilot ID remains inside SkillPilot and is not included in the chat, OAuth principal, or MCP tool contract.',
              'The AI provider receives the learning context and tool results required for coaching, as well as everything you enter or upload in its chat. SkillPilot receives the explicit tool requests and arguments needed to read or update your learning state, but not the complete chat transcript. OAuth credentials, temporary connection data, and provider-side conversation data are processed and retained according to the respective technical purpose and the provider’s own terms.',
            ],
          },
          {
            title: '5. Transfer to Third Parties',
            paragraphs: [
              'We do not sell your data and do not share it with unauthorized third parties. When you choose an AI integration, the selected provider processes the conversation and the learning context returned to it under its own privacy and retention terms. Our services are hosted on secure servers.',
            ],
          },
          {
            title: '6. Storage Period, Activity, and Deletion',
            paragraphs: [
              'After 365 consecutive days without successful activity, the active learning state stored under your SkillPilot ID in the SkillPilot database, including the associated SkillPilot learning sessions and SkillPilot connections, becomes due for automatic deletion and is removed during the next automatic deletion run.',
              'Only the following count as activity: successful creation of a SkillPilot ID; foreground loading or resuming of the learning state in the SkillPilot web interface; a server-completed import or export of signed learner data; a learner-state change successfully stored on the server; a successfully completed SkillPilot session or AI-provider connection action; and a valid Coach/MCP call that SkillPilot completes with a successful domain result. Background GET requests, SSE traffic, OAuth token refreshes, merely selecting or opening a local file, and server operations that do not complete or are domain-rejected do not count and do not restart the 365-day period.',
              'You can delete the same active server-side data at any time using the designated function in the SkillPilot web interface. The SkillPilot ID can then no longer be used for that learning state.',
              'Manual or automatic deletion does not delete downloaded or other local files, or chats or other data held by an AI provider. Existing backup copies are not part of the active learning state. Neither the delete function nor the 365-day expiry immediately deletes each backup copy individually. Mandatory legal retention obligations and other lawful exceptions remain unaffected.',
            ],
          },
          {
            title: '7. Your Rights',
            paragraphs: [
              'Because we store your data pseudonymously, we can process information or deletion requests only if you provide the relevant SkillPilot ID or otherwise demonstrate access to it. You can contact us using the details below. Your statutory data-protection rights remain unaffected by the deletion function and automatic deletion.',
            ],
          },
        ],
        contactTitle: '8. Contact',
        contactIntro: 'If you have any questions about data protection, please contact us at:',
        imprintLabel: 'Imprint',
      }
    : {
        backToApp: 'Zurück zur App',
        title: 'Datenschutzerklärung',
        effectiveDate: 'Stand: 31. August 2026',
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
              'Den Zeitpunkt Ihrer letzten erfolgreichen Tätigkeit für die Löschfrist.',
              'SkillPilot-seitige Lernsession- und Verbindungsdaten, die der SkillPilot-ID zugeordnet sind.',
            ],
            paragraphsAfterBullets: [
              'Diese Daten dienen dazu, Ihnen passende Lernvorschläge zu machen, Ihren Fortschritt zu visualisieren, den Dienst zu betreiben und abzusichern sowie die nachstehende Löschfrist anzuwenden.',
            ],
          },
          {
            title: '3. Optionale lesende Betreuung durch eine Lehrkraft',
            paragraphs: [
              'Wenn Sie eine Betreuungseinladung ausdrücklich bestätigen, darf der anfragende Lehrkraft-Browser Ihre ausgewählten Fachkontexte und den dazugehörigen Lernstand lesen. Die Freigabe erlaubt der Lehrkraft nicht, Ihre Fächerauswahl, Lernziele, Planungen oder Mastery-Werte zu verändern. Die dauerhafte SkillPilot-ID und das rohe Personalisierungsdokument werden nicht an die Lehrkraftansicht ausgegeben.',
              'Dafür speichert SkillPilot die von der Lehrkraft angegebenen Kurs- und Anzeigebezeichnungen, kryptografische Hashwerte der Workspace- und Einladungsberechtigungen, die Zuordnung zu Ihrer SkillPilot-ID, die freigegebenen Leserechte, den Lebenszyklusstatus und die zugehörigen Zeitpunkte. Ein Name oder Alias für die lokale Klassenkarte der Lehrkraft bleibt ausschließlich in deren Browser. Einladungslinks laufen nach sieben Tagen ab und sind nur einmal verwendbar.',
              'Eine aktive Freigabe bleibt bestehen, bis Sie sie auf der Betreuungsseite widerrufen, die Lehrkraft den verknüpften Kurs beendet oder der Lernstand gelöscht wird. Der Zugriff endet dabei sofort. Abgelaufene, widerrufene und geschlossene Betreuungsdatensätze werden nach einer zusätzlichen Aufbewahrungsfrist von 30 Tagen beim nächsten täglichen Löschlauf aus den aktiven Systemen entfernt; die Löschung des Lernstands entfernt außerdem die zugehörigen serverseitigen Betreuungsmitgliedschaften. Lokale Browserdaten müssen auf dem jeweiligen Gerät separat entfernt werden.',
            ],
          },
          {
            title: '4. Nutzung mit KI-Assistenten',
            paragraphs: [
              'SkillPilot unterstützt derzeit zwei getrennte ChatGPT-Verbindungsvarianten. In der Variante „Visible Session“ wird ein temporäres Sitzungstoken in der vorbereiteten Startnachricht und im Chat angezeigt; es ist höchstens 24 Stunden gültig. In der mehrsprachigen OpenAI-OAuth/MCP-App-Variante verbindet sich ChatGPT über eine OAuth-Autorisierung mit SkillPilot. Die dauerhafte SkillPilot-ID bleibt innerhalb von SkillPilot und wird weder in den Chat noch in den OAuth-Principal oder den MCP-Toolvertrag aufgenommen.',
              'Der KI-Anbieter erhält den für das Coaching benötigten Lernkontext und die Toolergebnisse sowie alles, was Sie in dessen Chat eingeben oder hochladen. SkillPilot erhält die ausdrücklichen Toolanfragen und Argumente, die zum Lesen oder Aktualisieren Ihres Lernstands erforderlich sind, jedoch nicht das vollständige Chatprotokoll. OAuth-Zugangsdaten, temporäre Verbindungsdaten und anbieterseitige Konversationsdaten werden entsprechend ihrem jeweiligen technischen Zweck und den Bedingungen des Anbieters verarbeitet und gespeichert.',
            ],
          },
          {
            title: '5. Weitergabe an Dritte',
            paragraphs: [
              'Wir verkaufen Ihre Daten nicht und geben sie nicht unbefugt an Dritte weiter. Wenn Sie eine KI-Integration wählen, verarbeitet der ausgewählte Anbieter die Konversation und den an ihn zurückgegebenen Lernkontext nach seinen eigenen Datenschutz- und Aufbewahrungsbedingungen. Das Hosting unserer Dienste erfolgt auf sicheren Servern.',
            ],
          },
          {
            title: '6. Speicherdauer, Tätigkeit und Löschung',
            paragraphs: [
              'Nach 365 aufeinanderfolgenden Tagen ohne erfolgreiche Tätigkeit ist der aktive, unter Ihrer SkillPilot-ID in der SkillPilot-Datenbank gespeicherte Lernstand einschließlich der zugehörigen SkillPilot-Lernsessions und SkillPilot-Verbindungen zur automatischen Löschung fällig und wird beim nächsten automatischen Löschlauf entfernt.',
              'Als Tätigkeit zählen ausschließlich die erfolgreiche Erstellung einer SkillPilot-ID, das aktive Laden oder Fortsetzen des Lernstands in der SkillPilot-Weboberfläche, ein vom Server abgeschlossener Import oder Export signierter Lerndaten, eine serverseitig erfolgreich gespeicherte Änderung des Lernstands, eine erfolgreich abgeschlossene SkillPilot-Sitzungs- oder KI-Anbieter-Verbindungsaktion sowie ein gültiger Coach-/MCP-Aufruf, den SkillPilot mit einem fachlich erfolgreichen Ergebnis abschließt. Hintergrund-GET-Anfragen, SSE-Verkehr, OAuth-Token-Aktualisierungen, das bloße Auswählen oder Öffnen einer lokalen Datei sowie vom Server nicht abgeschlossene oder fachlich abgewiesene Aktionen zählen nicht und starten die 365-Tage-Frist nicht neu.',
              'Dieselben aktiven serverseitigen Daten können Sie jederzeit über die dafür vorgesehene Funktion in der SkillPilot-Weboberfläche löschen. Danach kann die SkillPilot-ID nicht mehr für diesen Lernstand verwendet werden.',
              'Die manuelle oder automatische Löschung entfernt keine heruntergeladenen oder sonstigen lokalen Dateien und keine Chats oder sonstigen Daten bei einem KI-Anbieter. Bestehende Sicherungskopien gehören nicht zum aktiven Lernstand. Die Löschfunktion und der 365-Tage-Ablauf löschen sie nicht unmittelbar einzeln. Zwingende gesetzliche Aufbewahrungspflichten und andere zulässige Ausnahmefälle bleiben unberührt.',
            ],
          },
          {
            title: '7. Ihre Rechte',
            paragraphs: [
              'Da wir Ihre Daten pseudonym speichern, können wir Auskunfts- oder Löschanfragen nur bearbeiten, wenn Sie uns die betreffende SkillPilot-ID mitteilen oder den Zugriff darauf anderweitig nachweisen. Sie können dafür die unten genannten Kontaktdaten verwenden. Ihre gesetzlichen Datenschutzrechte bleiben von der Löschfunktion und der automatischen Löschung unberührt.',
            ],
          },
        ],
        contactTitle: '8. Kontakt',
        contactIntro: 'Bei Fragen zum Datenschutz erreichen Sie uns unter:',
        imprintLabel: 'Impressum',
      }
)
