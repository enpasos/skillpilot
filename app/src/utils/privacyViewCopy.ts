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
        effectiveDate: 'Date: September 1, 2026',
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
              'Your optional personal subject schedules and whether you have enabled plan-guided learning.',
              'The time of your last successful activity for the deletion period.',
              'SkillPilot-side learning-session and connection data associated with the SkillPilot ID.',
            ],
            paragraphsAfterBullets: [
              'This data is used to provide suitable learning suggestions, visualize your progress, operate and secure the service, and apply the deletion period described below.',
            ],
          },
          {
            title: '3. Local Teacher View with an Existing SkillPilot ID',
            paragraphs: [
              'If a teacher adds an existing SkillPilot ID to a local class, the teacher’s browser stores the class name, the locally assigned learner name or alias, the permanent SkillPilot ID, and a local copy of the personalization used for the subject views. Using that ID, the teacher view reads the same learner profile and learning status that the learner can access in SkillPilot. When a learning section is first scheduled in the local teacher course plan, an additional read-only request determines all individual learning goals in the learner’s complete personalized scope for the selected subject and which of them are not yet mastered. The current learning focus does not restrict this planning scope. The local plan stores those goal IDs, aggregate counts, and the capture time as its fixed planning basis; it stores neither the SkillPilot ID nor individual numeric learning-status values in that basis. This workflow creates no separate server-side teacher account, class, permission, or membership relationship.',
              'Except for the explicit “Make available in cockpit” action, the teacher interface is functionally read-only with respect to learner data: its controls do not change the learner’s personalization, focus, active goal, or other learning status. The separate local teacher course plan remains editable teacher working data. Only after a confirmation does the named action write an independent copy of the plan label, dated blocks, and validated individual learning goals into the personal subject schedule stored under the known SkillPilot ID. Newly added goal IDs are accepted only while they are still open; goal IDs already contained in the personal schedule may remain in a confirmed replacement to preserve plan continuity. It transfers no class reference, teaching coverage, attestations, individual learning-status values, planning data derived from the learner’s status, or earlier versions of the teacher plan, and later local changes are not synchronized automatically. The learner can keep the schedule visible while plan-guided learning is off. Enabling the default-off mode is the learner’s authorization: the first goal is started deliberately. After a confirmed completion, automatic handoff is considered only if the completed goal belongs to at least one currently valid stored plan. SkillPilot then first considers due goals with satisfied prerequisites from a plan that contains the completed goal. It hands off only if exactly one such plan candidate exists; if none does, it hands off only if exactly one eligible candidate exists across the remaining valid plans. Multiple matching or otherwise eligible plans, stale or invalid plans without a remaining unique valid candidate, no stored plan, and no eligible due goal cause no automatic handoff. While the mode remains enabled, the generic Autopilot is suppressed even in those cases. Disabling the mode stops this behavior. Teacher-entered plan labels and block titles are copied unchanged and may themselves contain personal data.',
              'This is a user-interface boundary, not a restricted server credential or a server-side teacher relationship. Under the current identity model, the permanent SkillPilot ID is the sole key with full access to the learning state, including the personal subject schedule. Anyone who knows it can access SkillPilot with the same powers as the learner; after the local class is removed, the ID and the independently copied schedule remain valid until they are changed or deleted through that ID. The ID must therefore be shared and stored only with appropriate authorization.',
              'Local class data must be removed separately from the teacher’s browser. Password-encrypted class exports may contain class names, learner names or aliases, permanent SkillPilot IDs, and the locally stored personalization. The encryption protects the downloaded file only while its passphrase remains secret; after decryption, every contained SkillPilot ID retains its full-access character. SkillPilot does not store or recover the export passphrase.',
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
        effectiveDate: 'Stand: 1. September 2026',
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
              'Ihre optionalen persönlichen Fachzeitpläne und ob Sie planbegleitetes Lernen aktiviert haben.',
              'Den Zeitpunkt Ihrer letzten erfolgreichen Tätigkeit für die Löschfrist.',
              'SkillPilot-seitige Lernsession- und Verbindungsdaten, die der SkillPilot-ID zugeordnet sind.',
            ],
            paragraphsAfterBullets: [
              'Diese Daten dienen dazu, Ihnen passende Lernvorschläge zu machen, Ihren Fortschritt zu visualisieren, den Dienst zu betreiben und abzusichern sowie die nachstehende Löschfrist anzuwenden.',
            ],
          },
          {
            title: '3. Lokale Lehreransicht mit bestehender SkillPilot-ID',
            paragraphs: [
              'Wenn eine Lehrkraft eine bestehende SkillPilot-ID zu einer lokalen Klasse hinzufügt, speichert der Browser der Lehrkraft den Klassennamen, den lokal zugeordneten Namen oder Alias, die dauerhafte SkillPilot-ID und eine lokale Kopie der für die Fachansichten verwendeten Personalisierung. Mit dieser ID liest die Lehreransicht dasselbe Lernprofil und denselben Lernstand, auf den auch die lernende Person in SkillPilot zugreifen kann. Wenn erstmals ein Lernabschnitt im lokalen Lehrkraft-Kursplan angelegt wird, ermittelt ein zusätzlicher Nur-Lese-Zugriff alle einzelnen Lernziele im vollständigen personalisierten Umfang des ausgewählten Fachs und welche davon noch nicht gemeistert sind. Der aktuelle Lernfokus schränkt diesen Planungsumfang nicht ein. Der lokale Plan speichert diese Ziel-IDs, Summen und den Erfassungszeitpunkt als feste Planungsgrundlage; in dieser Grundlage werden weder die SkillPilot-ID noch einzelne numerische Lernstandswerte gespeichert. Dieser Ablauf erzeugt keine separate serverseitige Lehrkraft-, Klassen-, Berechtigungs- oder Mitgliedschaftsbeziehung.',
              'Mit Ausnahme der ausdrücklichen Aktion „Im Cockpit bereitstellen“ ist die Lehreroberfläche gegenüber den Daten der lernenden Person funktional nur lesend: Ihre Bedienelemente ändern weder deren Personalisierung, Fokus, aktives Ziel noch sonstigen Lernstand. Der separate lokale Kursplan bleibt bearbeitbarer Lehrerarbeitsstand. Erst nach einer Bestätigung schreibt die genannte Aktion eine unabhängige Kopie aus Planbezeichnung, datierten Blöcken und geprüften einzelnen Lernzielen in den unter der bekannten SkillPilot-ID gespeicherten persönlichen Fachzeitplan. Neu hinzukommende Ziel-IDs werden nur übernommen, solange sie noch offen sind; bereits im persönlichen Fachzeitplan enthaltene Ziel-IDs dürfen bei einem bestätigten Ersetzen für die Plankontinuität erhalten bleiben. Klassenbezug, Unterrichtsstand, Bestätigungen, einzelne Lernstandswerte, aus dem Lernstand abgeleitete Planungsdaten und frühere Fassungen des Lehrerplans werden nicht übertragen; spätere lokale Änderungen werden nicht automatisch synchronisiert. Die lernende Person kann den Zeitplan bei ausgeschaltetem planbegleitetem Lernen weiterhin sehen. Das Aktivieren des standardmäßig ausgeschalteten Modus ist ihre Autorisierung: Das erste Ziel startet sie bewusst. Nach einem bestätigten Abschluss wird eine automatische Übergabe nur erwogen, wenn das abgeschlossene Ziel zu mindestens einem aktuell gültigen gespeicherten Plan gehört. SkillPilot betrachtet dann zuerst fällige Ziele mit erfüllten Voraussetzungen aus einem Plan, der das abgeschlossene Ziel enthält. Eine automatische Übergabe erfolgt nur, wenn daraus genau ein Plankandidat entsteht; gibt es keinen solchen Kandidaten, nur wenn über die übrigen gültigen Pläne hinweg genau ein geeigneter Kandidat übrig bleibt. Bei mehreren passenden oder sonst gleichberechtigten Plänen, veralteten oder ungültigen Plänen ohne verbleibenden eindeutigen gültigen Kandidaten, keinem gespeicherten Plan oder keinem geeigneten fälligen Ziel erfolgt keine automatische Übergabe. Solange der Modus eingeschaltet ist, bleibt auch in diesen Fällen der allgemeine Autopilot unterdrückt. Das Ausschalten beendet dieses Verhalten. Planbezeichnungen und Blocktitel der Lehrkraft werden unverändert kopiert und können selbst personenbezogene Angaben enthalten.',
              'Diese Grenze liegt in der Benutzeroberfläche, nicht in einem eingeschränkten Server-Zugang oder einer serverseitigen Lehrerbeziehung. Im derzeitigen Identitätsmodell ist die dauerhafte SkillPilot-ID der einzige Zugangsschlüssel mit Vollzugriff auf den Lernstand einschließlich des persönlichen Fachzeitplans. Wer sie kennt, kann SkillPilot mit denselben Befugnissen wie die lernende Person verwenden; nach dem Entfernen der lokalen Klasse bleiben die ID und der unabhängig kopierte Fachzeitplan gültig, bis sie mit dieser ID geändert oder gelöscht werden. Die ID darf deshalb nur mit entsprechender Berechtigung weitergegeben und gespeichert werden.',
              'Lokale Klassendaten müssen separat aus dem Browser der Lehrkraft entfernt werden. Passwortverschlüsselte Klassenexporte können Klassennamen, Namen oder Aliase von Lernenden, dauerhafte SkillPilot-IDs und die lokal gespeicherte Personalisierung enthalten. Die Verschlüsselung schützt die heruntergeladene Datei nur, solange ihr Passwort geheim bleibt; nach dem Entschlüsseln behält jede enthaltene SkillPilot-ID ihren Vollzugriffscharakter. SkillPilot speichert das Exportpasswort nicht und kann es nicht wiederherstellen.',
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
