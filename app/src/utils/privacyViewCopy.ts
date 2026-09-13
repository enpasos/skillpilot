import type { LabelLanguage } from './filterLabels'

export interface PrivacyViewSectionCopy {
  title: string
  paragraphs: string[]
  bullets?: string[]
  paragraphsAfterBullets?: string[]
  links?: { label: string; href: string }[]
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
        effectiveDate: 'Date: September 13, 2026',
        intro:
          'SkillPilot stores your learning progress, not your conversation with the coach. This notice explains the data processed by SkillPilot, the separate role of your AI provider, and your choices. The ongoing learning beta uses Claude; a regular ChatGPT connection is not currently available.',
        sections: [
          {
            title: '1. Controller and Pseudonymous Use',
            paragraphs: [
              'The controller for the SkillPilot service is enpasos - Enterprise Patterns & Solutions GmbH, Heuhohlweg 42, 61462 Königstein, Germany. Contact: support@skillpilot.com. Further company details are in the Imprint.',
              'You can use the learning functions without registering a real name or email address. Learning progress is assigned to a randomly generated SkillPilot ID (UUID). This is pseudonymisation, not anonymisation: the ID, learning data, technical connection data and any information you voluntarily provide may still be personal data.',
              'The permanent SkillPilot ID is the full-access key to your learning state. Anyone who knows it can use that access. Keep it secret, including in screenshots and support messages. Without the ID or your own saved copy, we generally cannot recover your learning state because there is no name-based account recovery.',
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
              'Your selected subjects, learning focus, active goal and permitted next goals (frontier).',
              'Structured learning and review results, completion times, recall scheduling and, where used, numerical exam results and your own memory-card content.',
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
              'Except for the explicitly confirmed “Make planning effective” and “Update this subject only” actions, the teacher interface is functionally read-only with respect to learner data: its controls do not change the learner’s personalization, focus, active goal, or other learning status. The separate local teacher course plans remain editable teacher working data. The shared foreground action validates the complete set of current subject plans before writing and then either stores every independent copy or none. Each copy consists of the plan label, dated blocks, and validated individual learning goals in the personal subject schedule under the known SkillPilot ID. The subordinate single-subject update replaces only that independent subject copy; by itself it neither enables plan-guided learning nor selects a goal. Newly added goal IDs are accepted only while they are still open; goal IDs already contained in a personal schedule may remain in a confirmed replacement to preserve plan continuity. Neither copy action transfers a class reference, teaching coverage, attestations, individual learning-status values, planning data derived from the learner’s status, or earlier versions of the teacher plans, and later local changes are not synchronized automatically. The confirmed shared action enables plan-guided learning and immediately selects the first due goal whose prerequisites are satisfied. The learner can pause that mode at any time. An explicit subject switch parks the unfinished previous goal without changing its mastery and selects a due eligible goal in the chosen subject. After confirmed completion, SkillPilot first considers due eligible goals from a valid plan containing the completed goal and otherwise orders valid subject plans deterministically. Stale or invalid plans are not used; if no due eligible goal exists, no replacement goal is invented. While the mode remains enabled, the generic Autopilot is suppressed. Calendar progress alone causes no such write. Teacher-entered plan labels and block titles are copied unchanged and may themselves contain personal data.',
              'This is a user-interface boundary, not a restricted server credential or a server-side teacher relationship. Under the current identity model, the permanent SkillPilot ID is the sole key with full access to the learning state, including the personal subject schedule. Anyone who knows it can access SkillPilot with the same powers as the learner; after the local class is removed, the ID and the independently copied schedule remain valid until they are changed or deleted through that ID. The ID must therefore be shared and stored only with appropriate authorization.',
              'Local class data must be removed separately from the teacher’s browser. Password-encrypted class exports may contain class names, learner names or aliases, permanent SkillPilot IDs, and the locally stored personalization. The encryption protects the downloaded file only while its passphrase remains secret; after decryption, every contained SkillPilot ID retains its full-access character. SkillPilot does not store or recover the export passphrase.',
            ],
          },
          {
            title: '4. AI Assistants: Claude Beta',
            paragraphs: [
              'When you choose Claude, Anthropic processes your conversation under your Claude account. This includes what you type, photos you upload or take with the app camera, files and voice inputs when using Voice Mode. SkillPilot supplies the learning context needed for coaching, such as the current goal, relevant progress, tasks, recall cards and confirmed tool results. This also makes those learning data available to Anthropic.',
              'The OAuth/MCP connection and the temporary learning session have separate purposes. OAuth authorises access to the interface; the learning session selects the learner you started in SkillPilot. The prepared start message contains a temporary session reference, normally valid for 24 hours. Treat it as a credential. SkillPilot does not put the permanent SkillPilot ID in the prepared chat message or the coach tool contract.',
              'SkillPilot receives structured tool requests and arguments, for example goal and session references, completion decisions, right/wrong results and permitted numerical scores. The coach assesses your work and composes its own explanations and success messages in the Claude chat. Answers, solution steps, chat extracts, summaries, workFeedback, outcomeFeedback and other free-text assessment explanations are not permitted coach inputs to the SkillPilot Core and must not be stored in learning state, replay data or diagnostics. The integration does not transmit your photos, audio or chat transcript to SkillPilot.',
              'This restriction does not prevent you from deliberately typing personal information into a separate feedback form or support email. Please do not include complete chats, credentials, sensitive information or unnecessary information about other people there.',
              'Anthropic is responsible for processing in its own service under its privacy terms, including retention, safety review and any model improvement depending on your account and settings. SkillPilot cannot change those settings or delete your Claude conversations. Check the provider’s data controls before use. Personal Claude accounts require at least age 18; parental permission does not override that restriction.',
            ],
            links: [
              { label: 'Anthropic Privacy Policy and data controls', href: 'https://www.anthropic.com/legal/privacy' },
              { label: 'Anthropic Consumer Terms', href: 'https://www.anthropic.com/legal/consumer-terms' },
            ],
          },
          {
            title: '5. ChatGPT: Not Currently Available',
            paragraphs: [
              'The public learning beta runs with Claude. ChatGPT is planned only after stabilisation, a focused check of the actual ChatGPT integration and the official submission process. This notice is not an offer of a second ChatGPT beta or a claim that an older plugin link provides the current service. Before any public activation, the applicable connection and privacy information must reflect the integration actually released. The same rule against coach-transmitted chat free text applies to the ChatGPT adapter.',
            ],
          },
          {
            title: '6. Hosting, Recipients and International Processing',
            paragraphs: [
              'SkillPilot Core is hosted in Germany. Operating the website involves processing technical connection data such as IP address, request time, requested resource and response status. Authorised operators and infrastructure providers may process data as needed to deliver, secure and maintain the service. Correspondence is also processed through the email service used for support. We do not sell your learning data.',
              'German hosting of the Core does not mean that all data remain in Germany: if you use Claude, your inputs and the learning context returned to it are processed by Anthropic, including in the United States and other countries according to its privacy terms. Anthropic describes applicable adequacy decisions and contractual safeguards there. Its account, retention and transfer rules are separate from SkillPilot’s.',
              'Opening an external link, downloading a plugin from an external source or contacting a third-party service creates a connection to that provider. Merely viewing SkillPilot’s homepage does not start a Claude learning session. Access by authorities or other recipients is limited to an applicable legal requirement or another lawful basis.',
            ],
            links: [{ label: 'Anthropic: international transfers and recipients', href: 'https://www.anthropic.com/legal/privacy' }],
          },
          {
            title: '7. Purposes and Legal Bases',
            paragraphs: [
              'We process the learning profile and the connection data necessary for the functions you request to provide the learning service under Article 6(1)(b) GDPR. Without these data, the corresponding functions cannot be provided. Viewing public information does not require a learning profile.',
              'Technical delivery, proportionate security and fault diagnosis are based on Article 6(1)(f) GDPR. Our legitimate interests are a reliable service, prevention of misuse and correction of faults. Contract-related support is covered by Article 6(1)(b); other correspondence by Article 6(1)(f), in the interest of answering your enquiry. Where a statutory obligation requires processing, Article 6(1)(c) applies.',
              'Optional learning-goal feedback is processed on the basis of your express consent under Article 6(1)(a) GDPR. Accepting the Terms of Use is not blanket consent to optional processing. You can use the learning service without submitting feedback.',
            ],
          },
          {
            title: '8. Voluntary Feedback and Support',
            paragraphs: [
              'You can open feedback for the automatically selected current learning goal from the cockpit, including feedback about coach behaviour. The learning-goal book also links to this feedback workflow. Only after you submit the form do we receive your own feedback text, selected perspective, goal and publication context, a random feedback ID, submission time and the recorded consent/notice version. This is separate from the coach interface, not an automatic chat export or a mastery assessment.',
              'Feedback is used exclusively to review and, where appropriate, improve the displayed learning goal based on your observations. Reports about coach behaviour are considered in relation to that goal; this consent does not authorise unrelated analysis or general model training. Authorised reviewers may use technical services and automated assistance for this review; curricular changes require human approval. The form does not request your permanent SkillPilot ID, attachments or a chat transcript. Save the feedback ID for enquiries or withdrawal of consent.',
              'Unprocessed feedback is deleted during normal operation no later than 31 days after receipt. Once review has begun, it is retained only as long as necessary for that review and an expressly commissioned improvement. The notice and consent shown at the form apply in addition to this policy. Feedback is stored separately from learning profiles; deleting your learning profile does not automatically delete a separate feedback submission.',
              'If you email support, we receive your sender address, message and anything you attach. We use these to handle your enquiry and retain them for that purpose and, where necessary, applicable statutory obligations or legal claims. Do not send permanent IDs, temporary session credentials or full learning chats. We will agree a suitable secure way to verify access if needed.',
            ],
          },
          {
            title: '9. Browser Storage and Technical Diagnostics',
            paragraphs: [
              'SkillPilot uses browser storage for your active access, optionally saved profiles, local teacher data, language and display preferences, the accepted Terms version and locally cached application resources. This includes local storage and the application cache; a download is a separate file. Technically necessary device storage or access for a service expressly requested by you is governed by Section 25(2) TDDDG. Any non-essential access requiring consent is not authorised by merely accepting the Terms.',
              'You can clear website data in your browser. This removes local settings and may remove your only saved access key; export information you wish to keep first. Clearing the browser does not delete your server-side learning state or downloaded files. A password-protected export does not protect an unlocked browser.',
              'Operational diagnostics can include timestamps, tool names, response status, error codes, durations and pseudonymous correlation references. These are not anonymous data. Current coach-result, OAuth and feedback routes exclude request bodies from general request logging. Learner answers and coach-generated feedback must not enter these diagnostics. Separately enabled debug or legacy-route tracing can process redacted technical request and response fields; field-based redaction is not automatic detection of every personal detail. Technical logs and backups are separate from the active learning state.',
            ],
          },
          {
            title: '10. Storage Period, Activity, and Deletion',
            paragraphs: [
              'After 365 consecutive days without successful activity, the active learning state stored under your SkillPilot ID in the SkillPilot database, including the associated SkillPilot learning sessions and SkillPilot connections, becomes due for automatic deletion and is removed during the next automatic deletion run.',
              'Only the following count as activity: successful creation of a SkillPilot ID; foreground loading or resuming of the learning state in the SkillPilot web interface; a server-completed import or export of signed learner data; a learner-state change successfully stored on the server; a successfully completed SkillPilot session or AI-provider connection action; and a valid Coach/MCP call that SkillPilot completes with a successful domain result. Background GET requests, SSE traffic, OAuth token refreshes, merely selecting or opening a local file, and server operations that do not complete or are domain-rejected do not count and do not restart the 365-day period.',
              'You can delete the same active server-side data at any time using the designated function in the SkillPilot web interface. The SkillPilot ID can then no longer be used for that learning state.',
              'Manual or automatic deletion does not delete downloaded or other local files, or chats or other data held by an AI provider. Existing backup copies are not part of the active learning state. Neither the delete function nor the 365-day expiry immediately deletes each backup copy individually. Mandatory legal retention obligations and other lawful exceptions remain unaffected.',
              'Expiry of a learning session or an OAuth token is an access limit, not a promise to delete every related record at that exact time. Revoking a provider connection does not itself delete learning progress. The separate feedback retention rule is explained above.',
              'The specific retention periods for server logs and backups have not yet been specified in this notice. Please contact the controller for clarification; the 365-day learning-profile period must not be understood as their retention period. Statutory storage-limitation and erasure duties apply independently of this outstanding clarification.',
            ],
          },
          {
            title: '11. Your Rights and Learning Recommendations',
            paragraphs: [
              'Subject to the conditions of the GDPR, you have rights of access, rectification, erasure, restriction of processing and data portability. You can withdraw consent at any time for the future without affecting the lawfulness of processing before withdrawal.',
              'You may object, on grounds relating to your particular situation, to processing based on Article 6(1)(f) GDPR. We will then stop that processing unless we demonstrate compelling overriding legitimate grounds or processing is needed for legal claims.',
              'Contact us without sending your secret access keys. For learning-profile requests, we need an appropriate proof of access; a name alone usually cannot identify a pseudonymous profile. For separate feedback, use the feedback ID if available. We request only the additional information needed to allocate and verify the request securely. The built-in deletion function does not replace your statutory rights. We normally respond within one month; any lawful extension must be explained within that period.',
              'You may lodge a complaint with a supervisory authority, in particular where you live, work or believe an infringement occurred. The Hessian Commissioner for Data Protection and Freedom of Information is the authority at the controller’s location.',
              'SkillPilot uses stored progress and prerequisites to suggest next goals. Mastery estimates and automated suggestions are learning aids, not official grades or decisions with legal or similarly significant effects. You can review your progress in the cockpit, pause plan-guided learning and report incorrect assessments.',
            ],
            links: [{ label: 'Submit a complaint to the Hessian data-protection authority', href: 'https://datenschutz.hessen.de/service/beschwerde-uebermitteln' }],
          },
        ],
        contactTitle: '12. Contact',
        contactIntro: 'If you have any questions about data protection, please contact us at:',
        imprintLabel: 'Imprint',
      }
    : {
        backToApp: 'Zurück zur App',
        title: 'Datenschutzerklärung',
        effectiveDate: 'Stand: 13. September 2026',
        intro:
          'SkillPilot speichert Ihren Lernfortschritt, nicht Ihr Gespräch mit dem Coach. Diese Erklärung erläutert die Datenverarbeitung bei SkillPilot, die getrennte Rolle des KI-Anbieters und Ihre Wahlmöglichkeiten. Die laufende Lern-Beta nutzt Claude; eine reguläre ChatGPT-Verbindung ist derzeit nicht verfügbar.',
        sections: [
          {
            title: '1. Verantwortlicher und pseudonyme Nutzung',
            paragraphs: [
              'Verantwortlich für den SkillPilot-Dienst ist die enpasos - Enterprise Patterns & Solutions GmbH, Heuhohlweg 42, 61462 Königstein, Deutschland. Kontakt: support@skillpilot.com. Weitere Unternehmensangaben stehen im Impressum.',
              'Die Lernfunktionen können Sie ohne Registrierung mit Klarnamen oder E-Mail-Adresse verwenden. Der Lernfortschritt wird einer zufällig erzeugten SkillPilot-ID (UUID) zugeordnet. Das ist Pseudonymisierung, keine Anonymisierung: ID, Lerndaten, technische Verbindungsdaten und freiwillige Angaben können weiterhin personenbezogene Daten sein.',
              'Die dauerhafte SkillPilot-ID ist der Schlüssel mit Vollzugriff auf Ihren Lernstand. Wer sie kennt, kann diesen Zugang nutzen. Halten Sie sie geheim, auch in Screenshots und Supportnachrichten. Ohne ID oder eigene gesicherte Kopie können wir Ihren Lernstand grundsätzlich nicht wiederherstellen, weil keine namensbezogene Kontowiederherstellung besteht.',
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
              'Ihre ausgewählten Fächer, Ihren Lernfokus, das aktive Ziel und zulässige nächste Lernziele (Frontier).',
              'Strukturierte Lern- und Wiederholungsergebnisse, Abschlusszeitpunkte, Wiederholungsplanung und, soweit genutzt, numerische Prüfungsergebnisse sowie eigene Lernkarteninhalte.',
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
              'Mit Ausnahme der ausdrücklich bestätigten Aktionen „Planung wirksam machen“ und „Nur dieses Fach aktualisieren“ ist die Lehreroberfläche gegenüber den Daten der lernenden Person funktional nur lesend: Ihre Bedienelemente ändern weder deren Personalisierung, Fokus, aktives Ziel noch sonstigen Lernstand. Die getrennten lokalen Fachpläne bleiben bearbeitbarer Lehrerarbeitsstand. Die gemeinsame Vordergrundaktion prüft den vollständigen Satz aktueller Fachpläne vor dem Schreiben und speichert anschließend entweder jede unabhängige Kopie oder keine. Jede Kopie besteht aus Planbezeichnung, datierten Blöcken und geprüften einzelnen Lernzielen im unter der bekannten SkillPilot-ID gespeicherten persönlichen Fachzeitplan. Die nachrangige Einzelfach-Aktualisierung ersetzt nur diese unabhängige Fachkopie; für sich allein schaltet sie weder planbegleitetes Lernen ein noch wählt sie ein Ziel. Neu hinzukommende Ziel-IDs werden nur übernommen, solange sie noch offen sind; bereits in einem persönlichen Fachzeitplan enthaltene Ziel-IDs dürfen bei einem bestätigten Ersetzen für die Plankontinuität erhalten bleiben. Keine der Kopieraktionen überträgt Klassenbezug, Unterrichtsstand, Bestätigungen, einzelne Lernstandswerte, aus dem Lernstand abgeleitete Planungsdaten oder frühere Fassungen der Lehrerpläne; spätere lokale Änderungen werden nicht automatisch synchronisiert. Die bestätigte gemeinsame Aktion schaltet planbegleitetes Lernen ein und wählt unmittelbar das erste fällige Ziel mit erfüllten Voraussetzungen. Die lernende Person kann diesen Modus jederzeit pausieren. Ein ausdrücklicher Fachwechsel parkt das unvollständige bisherige Ziel ohne Änderung seiner Mastery und wählt ein fälliges zulässiges Ziel im gewählten Fach. Nach einem bestätigten Abschluss berücksichtigt SkillPilot zuerst fällige zulässige Ziele aus einem gültigen Plan, der das abgeschlossene Ziel enthält, und ordnet andernfalls die gültigen Fachpläne deterministisch. Veraltete oder ungültige Pläne werden nicht verwendet; gibt es kein fälliges zulässiges Ziel, wird kein Ersatzziel erfunden. Solange der Modus eingeschaltet ist, bleibt der allgemeine Autopilot unterdrückt. Kalenderfortschritt allein löst keinen solchen Schreibvorgang aus. Planbezeichnungen und Blocktitel der Lehrkraft werden unverändert kopiert und können selbst personenbezogene Angaben enthalten.',
              'Diese Grenze liegt in der Benutzeroberfläche, nicht in einem eingeschränkten Server-Zugang oder einer serverseitigen Lehrerbeziehung. Im derzeitigen Identitätsmodell ist die dauerhafte SkillPilot-ID der einzige Zugangsschlüssel mit Vollzugriff auf den Lernstand einschließlich des persönlichen Fachzeitplans. Wer sie kennt, kann SkillPilot mit denselben Befugnissen wie die lernende Person verwenden; nach dem Entfernen der lokalen Klasse bleiben die ID und der unabhängig kopierte Fachzeitplan gültig, bis sie mit dieser ID geändert oder gelöscht werden. Die ID darf deshalb nur mit entsprechender Berechtigung weitergegeben und gespeichert werden.',
              'Lokale Klassendaten müssen separat aus dem Browser der Lehrkraft entfernt werden. Passwortverschlüsselte Klassenexporte können Klassennamen, Namen oder Aliase von Lernenden, dauerhafte SkillPilot-IDs und die lokal gespeicherte Personalisierung enthalten. Die Verschlüsselung schützt die heruntergeladene Datei nur, solange ihr Passwort geheim bleibt; nach dem Entschlüsseln behält jede enthaltene SkillPilot-ID ihren Vollzugriffscharakter. SkillPilot speichert das Exportpasswort nicht und kann es nicht wiederherstellen.',
            ],
          },
          {
            title: '4. KI-Assistenten: Claude-Beta',
            paragraphs: [
              'Wenn Sie Claude wählen, verarbeitet Anthropic das Gespräch unter Ihrem Claude-Konto. Dazu gehören Ihre Texteingaben, hochgeladene oder mit der App-Kamera aufgenommene Fotos, Dateien und bei Voice Mode die Spracheingaben. SkillPilot stellt den für das Coaching erforderlichen Lernkontext bereit, beispielsweise das aktuelle Ziel, relevante Lernstände, Aufgaben, Lernkarten und bestätigte Toolergebnisse. Auch diese Lerndaten werden dadurch für Anthropic verfügbar.',
              'Die OAuth/MCP-Verbindung und die temporäre Lernsession haben unterschiedliche Aufgaben. OAuth autorisiert den Schnittstellenzugriff; die Lernsession wählt den von Ihnen in SkillPilot gestarteten Lernstand aus. Die vorbereitete Startnachricht enthält einen temporären Session-Verweis, regulär für 24 Stunden gültig. Behandeln Sie ihn als Zugangsdaten. SkillPilot setzt die dauerhafte SkillPilot-ID weder in die vorbereitete Chatnachricht noch in den Coach-Toolvertrag ein.',
              'SkillPilot erhält strukturierte Toolanfragen und Argumente, etwa Ziel- und Session-Verweise, Abschlussentscheidungen, Richtig/Falsch-Ergebnisse und zulässige numerische Punktwerte. Der Coach beurteilt Ihre Arbeit und formuliert Erklärungen und Erfolgsantworten selbst im Claude-Chat. Antworten, Lösungswege, Chat-Auszüge, Zusammenfassungen, workFeedback, outcomeFeedback und andere ausformulierte Bewertungsbegründungen sind keine zulässigen Coach-Eingaben an den SkillPilot Core und dürfen weder im Lernstand noch in Wiederholungsantworten oder Diagnosen gespeichert werden. Die Integration überträgt Ihre Fotos, Audiodaten und Chatprotokolle nicht an SkillPilot.',
              'Diese Grenze verhindert nicht, dass Sie selbst personenbezogene Angaben in ein separates Feedbackformular oder eine Support-E-Mail schreiben. Bitte übermitteln Sie dort keine vollständigen Chats, Zugangsdaten, sensiblen Angaben oder unnötigen Informationen über andere Personen.',
              'Anthropic verantwortet die Verarbeitung im eigenen Dienst nach seinen Datenschutzbedingungen, einschließlich Aufbewahrung, Sicherheitsprüfung und möglicher Modellverbesserung je nach Konto und Einstellungen. SkillPilot kann diese Einstellungen nicht ändern und Ihre Claude-Gespräche nicht löschen. Prüfen Sie vor der Nutzung die Datenkontrollen des Anbieters. Persönliche Claude-Konten setzen mindestens 18 Jahre voraus; elterliche Zustimmung hebt diese Grenze nicht auf.',
            ],
            links: [
              { label: 'Datenschutz und Datenkontrollen bei Anthropic', href: 'https://www.anthropic.com/legal/privacy' },
              { label: 'Nutzungsbedingungen von Anthropic', href: 'https://www.anthropic.com/legal/consumer-terms' },
            ],
          },
          {
            title: '5. ChatGPT: derzeit nicht verfügbar',
            paragraphs: [
              'Die öffentliche Lern-Beta findet mit Claude statt. ChatGPT ist erst nach Stabilisierung, gezielter Prüfung der echten ChatGPT-Integration und dem offiziellen Einreichungsweg vorgesehen. Diese Erklärung bietet weder eine zweite ChatGPT-Beta an noch bestätigt sie, dass ein älterer Plugin-Link den aktuellen Dienst bereitstellt. Vor einer öffentlichen Aktivierung müssen die Verbindungs- und Datenschutzhinweise dem tatsächlich freigegebenen Stand entsprechen. Das Verbot von Chat-Freitexten aus Coach-Aufrufen gilt ebenso für den ChatGPT-Adapter.',
            ],
          },
          {
            title: '6. Hosting, Empfänger und internationale Verarbeitung',
            paragraphs: [
              'SkillPilot Core wird in Deutschland gehostet. Beim Betrieb der Website werden technische Verbindungsdaten wie IP-Adresse, Anfragezeitpunkt, angeforderte Ressource und Antwortstatus verarbeitet. Befugte Betreiberpersonen und Infrastrukturdienstleister können Daten verarbeiten, soweit dies für Bereitstellung, Absicherung und Wartung erforderlich ist. Korrespondenz wird auch über den für Support eingesetzten E-Mail-Dienst verarbeitet. Wir verkaufen Ihre Lerndaten nicht.',
              'Das deutsche Hosting des Core bedeutet nicht, dass sämtliche Daten in Deutschland bleiben: Bei Claude verarbeitet Anthropic Ihre Eingaben und den zurückgegebenen Lernkontext nach seinen Datenschutzbedingungen auch in den USA und weiteren Ländern. Anthropic erläutert dort einschlägige Angemessenheitsbeschlüsse und vertragliche Schutzmechanismen. Seine Konto-, Aufbewahrungs- und Übermittlungsregeln sind von SkillPilot getrennt.',
              'Wenn Sie externe Links öffnen, ein Plugin aus einer externen Quelle beziehen oder einen Drittanbieterdienst kontaktieren, entsteht eine Verbindung zu diesem Anbieter. Der bloße Besuch der SkillPilot-Startseite startet keine Claude-Lernsession. Eine Offenlegung an Behörden oder andere Empfänger setzt eine anwendbare gesetzliche Verpflichtung oder eine andere zulässige Rechtsgrundlage voraus.',
            ],
            links: [{ label: 'Anthropic: internationale Übermittlungen und Empfänger', href: 'https://www.anthropic.com/legal/privacy' }],
          },
          {
            title: '7. Zwecke und Rechtsgrundlagen',
            paragraphs: [
              'Das Lernprofil und die für Ihre gewünschten Funktionen notwendigen Verbindungsdaten verarbeiten wir zur Erfüllung des Lernservices nach Art. 6 Abs. 1 Buchst. b DSGVO. Ohne diese Daten können die entsprechenden Funktionen nicht bereitgestellt werden. Öffentlich zugängliche Informationen können Sie ohne Lernprofil ansehen.',
              'Technische Bereitstellung, verhältnismäßige Absicherung und Fehlerdiagnose beruhen auf Art. 6 Abs. 1 Buchst. f DSGVO. Unsere berechtigten Interessen sind ein zuverlässiger Dienst, die Verhinderung von Missbrauch und die Behebung von Fehlern. Vertragsbezogener Support fällt unter Art. 6 Abs. 1 Buchst. b; sonstige Korrespondenz unter Art. 6 Abs. 1 Buchst. f, mit dem Interesse, Ihr Anliegen zu beantworten. Soweit eine gesetzliche Pflicht eine Verarbeitung verlangt, gilt Art. 6 Abs. 1 Buchst. c.',
              'Freiwilliges Lernziel-Feedback verarbeiten wir auf Grundlage Ihrer ausdrücklichen Einwilligung nach Art. 6 Abs. 1 Buchst. a DSGVO. Die Zustimmung zu Nutzungsbedingungen ist keine pauschale Einwilligung in optionale Datenverarbeitung. Sie können den Lernservice ohne Feedbackabgabe nutzen.',
            ],
          },
          {
            title: '8. Freiwilliges Feedback und Support',
            paragraphs: [
              'Im Cockpit können Sie Feedback zum dort automatisch ausgewählten aktuellen Lernziel öffnen, auch zum Verhalten des Coaches. Auch das Lernzielbuch verlinkt auf diesen Feedbackablauf. Erst mit dem Absenden des Formulars erhalten wir Ihren selbst eingegebenen Feedbacktext, die ausgewählte Perspektive, den Ziel- und Publikationskontext, eine zufällige Feedback-ID, den Eingangszeitpunkt und die dokumentierte Einwilligungs- beziehungsweise Hinweisversion. Das ist ein eigener Vorgang außerhalb der Coach-Schnittstelle, kein automatischer Chatexport und keine Mastery-Bewertung.',
              'Das Feedback dient ausschließlich dazu, das angezeigte Lernziel anhand Ihrer Beobachtungen zu prüfen und gegebenenfalls zu verbessern. Hinweise zum Coach-Verhalten werden in Bezug auf dieses Ziel betrachtet; die Einwilligung erlaubt keine zweckfremden Auswertungen oder allgemeines Modelltraining. Befugte Prüfende können dafür technische Dienste und automatisierte Unterstützung nutzen; Änderungen am Curriculum erfordern eine menschliche Freigabe. Das Formular fordert weder Ihre dauerhafte SkillPilot-ID noch Anhänge oder ein Chatprotokoll an. Bewahren Sie die Feedback-ID für Rückfragen oder einen Widerruf auf.',
              'Unbearbeitetes Feedback wird im laufenden Betrieb spätestens 31 Tage nach Eingang gelöscht. Sobald eine Prüfung begonnen hat, wird es nur so lange aufbewahrt, wie es für diese Prüfung und eine ausdrücklich beauftragte Verbesserung erforderlich ist. Der Hinweis und die Einwilligung am Formular gelten ergänzend. Feedback wird getrennt vom Lernprofil gespeichert; das Löschen des Lernprofils löscht eine separate Feedbackabgabe nicht automatisch.',
              'Bei E-Mails an den Support erhalten wir Ihre Absenderadresse, Ihre Nachricht und etwaige Anhänge. Wir verwenden sie zur Bearbeitung Ihres Anliegens und bewahren sie für diesen Zweck sowie erforderlichenfalls aufgrund gesetzlicher Pflichten oder zur Rechtsverfolgung auf. Senden Sie keine dauerhaften IDs, temporären Session-Zugangsdaten oder vollständigen Lernchats. Bei Bedarf vereinbaren wir einen geeigneten sicheren Weg zum Nachweis Ihres Zugriffs.',
            ],
          },
          {
            title: '9. Browserspeicher und technische Diagnosen',
            paragraphs: [
              'SkillPilot verwendet Browserspeicher für Ihren aktiven Zugang, optional gespeicherte Profile, lokale Lehrkraftdaten, Sprach- und Anzeigeeinstellungen, die akzeptierte Version der Nutzungsbedingungen und lokal zwischengespeicherte Anwendungsressourcen. Dazu gehören Local Storage und der Anwendungscache; ein Download ist eine separate Datei. Technisch notwendiges Speichern oder Auslesen auf Ihrem Gerät für einen ausdrücklich gewünschten Dienst richtet sich nach § 25 Abs. 2 TDDDG. Einwilligungspflichtige, nicht notwendige Zugriffe sind durch die bloße Annahme der Nutzungsbedingungen nicht erlaubt.',
              'Sie können Websitedaten in Ihrem Browser löschen. Dadurch entfernen Sie lokale Einstellungen und möglicherweise Ihren einzigen gespeicherten Zugangsschlüssel; sichern Sie zuvor gewünschte Informationen. Das Löschen im Browser entfernt weder den serverseitigen Lernstand noch heruntergeladene Dateien. Ein passwortgeschützter Export schützt keinen entsperrten Browser.',
              'Betriebsdiagnosen können Zeitpunkte, Toolnamen, Antwortstatus, Fehlercodes, Laufzeiten und pseudonyme Zuordnungsreferenzen enthalten. Das sind keine anonymen Daten. Aktuelle Coach-Ergebnis-, OAuth- und Feedbackrouten nehmen Anfrageinhalte von der allgemeinen Anfrageprotokollierung aus. Antworten von Lernenden und vom Coach formuliertes Feedback dürfen nicht in diese Diagnosen gelangen. Gesondert aktivierte Debug- oder Altrouten-Traces können redigierte technische Anfrage- und Antwortfelder verarbeiten; eine feldbezogene Redaktion erkennt nicht automatisch jede persönliche Angabe. Technische Protokolle und Sicherungskopien sind vom aktiven Lernstand getrennt.',
            ],
          },
          {
            title: '10. Speicherdauer, Tätigkeit und Löschung',
            paragraphs: [
              'Nach 365 aufeinanderfolgenden Tagen ohne erfolgreiche Tätigkeit ist der aktive, unter Ihrer SkillPilot-ID in der SkillPilot-Datenbank gespeicherte Lernstand einschließlich der zugehörigen SkillPilot-Lernsessions und SkillPilot-Verbindungen zur automatischen Löschung fällig und wird beim nächsten automatischen Löschlauf entfernt.',
              'Als Tätigkeit zählen ausschließlich die erfolgreiche Erstellung einer SkillPilot-ID, das aktive Laden oder Fortsetzen des Lernstands in der SkillPilot-Weboberfläche, ein vom Server abgeschlossener Import oder Export signierter Lerndaten, eine serverseitig erfolgreich gespeicherte Änderung des Lernstands, eine erfolgreich abgeschlossene SkillPilot-Sitzungs- oder KI-Anbieter-Verbindungsaktion sowie ein gültiger Coach-/MCP-Aufruf, den SkillPilot mit einem fachlich erfolgreichen Ergebnis abschließt. Hintergrund-GET-Anfragen, SSE-Verkehr, OAuth-Token-Aktualisierungen, das bloße Auswählen oder Öffnen einer lokalen Datei sowie vom Server nicht abgeschlossene oder fachlich abgewiesene Aktionen zählen nicht und starten die 365-Tage-Frist nicht neu.',
              'Dieselben aktiven serverseitigen Daten können Sie jederzeit über die dafür vorgesehene Funktion in der SkillPilot-Weboberfläche löschen. Danach kann die SkillPilot-ID nicht mehr für diesen Lernstand verwendet werden.',
              'Die manuelle oder automatische Löschung entfernt keine heruntergeladenen oder sonstigen lokalen Dateien und keine Chats oder sonstigen Daten bei einem KI-Anbieter. Bestehende Sicherungskopien gehören nicht zum aktiven Lernstand. Die Löschfunktion und der 365-Tage-Ablauf löschen sie nicht unmittelbar einzeln. Zwingende gesetzliche Aufbewahrungspflichten und andere zulässige Ausnahmefälle bleiben unberührt.',
              'Der Ablauf einer Lernsession oder eines OAuth-Tokens begrenzt den Zugriff, ist aber keine Zusage, jeden zugehörigen Datensatz genau zu diesem Zeitpunkt zu löschen. Der Widerruf einer Anbieter-Verbindung löscht für sich allein keinen Lernfortschritt. Für Feedback gilt die oben beschriebene eigene Aufbewahrungsregel.',
              'Die konkreten Aufbewahrungsfristen für Serverprotokolle und Sicherungskopien sind in dieser Erklärung noch nicht ausgewiesen. Bitte wenden Sie sich zur Klärung an den Verantwortlichen; die 365-Tage-Frist des Lernprofils ist nicht als deren Aufbewahrungsfrist zu verstehen. Gesetzliche Pflichten zur Speicherbegrenzung und Löschung gelten unabhängig von dieser noch offenen Konkretisierung.',
            ],
          },
          {
            title: '11. Ihre Rechte und Lernempfehlungen',
            paragraphs: [
              'Unter den Voraussetzungen der DSGVO haben Sie Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit. Eine Einwilligung können Sie jederzeit für die Zukunft widerrufen; die Rechtmäßigkeit der Verarbeitung vor dem Widerruf bleibt unberührt.',
              'Gegen eine Verarbeitung nach Art. 6 Abs. 1 Buchst. f DSGVO können Sie aus Gründen Ihrer besonderen Situation Widerspruch einlegen. Wir beenden diese Verarbeitung dann, sofern wir keine zwingenden überwiegenden schutzwürdigen Gründe nachweisen oder die Verarbeitung für Rechtsansprüche benötigen.',
              'Kontaktieren Sie uns ohne Übersendung geheimer Zugangsschlüssel. Bei Anfragen zum Lernprofil benötigen wir einen geeigneten Zugriffsnachweis; ein Name allein identifiziert ein pseudonymes Profil in der Regel nicht. Bei separatem Feedback verwenden Sie möglichst die Feedback-ID. Wir fordern nur die zusätzlichen Angaben an, die für eine sichere Zuordnung und Prüfung erforderlich sind. Die eingebaute Löschfunktion ersetzt Ihre gesetzlichen Rechte nicht. Wir antworten grundsätzlich innerhalb eines Monats; eine zulässige Verlängerung muss innerhalb dieser Frist begründet werden.',
              'Sie können sich bei einer Datenschutzaufsichtsbehörde beschweren, insbesondere an Ihrem Aufenthaltsort, Arbeitsplatz oder dem Ort eines vermuteten Verstoßes. Am Sitz des Verantwortlichen ist der Hessische Beauftragte für Datenschutz und Informationsfreiheit zuständig.',
              'SkillPilot nutzt gespeicherten Lernfortschritt und Voraussetzungen, um nächste Ziele vorzuschlagen. Mastery-Schätzungen und automatische Vorschläge sind Lernhilfen, keine amtlichen Noten oder Entscheidungen mit rechtlicher oder vergleichbar erheblicher Wirkung. Sie können Ihren Lernstand im Cockpit prüfen, planbegleitetes Lernen pausieren und fehlerhafte Bewertungen melden.',
            ],
            links: [{ label: 'Beschwerde beim Hessischen Beauftragten für Datenschutz und Informationsfreiheit', href: 'https://datenschutz.hessen.de/service/beschwerde-uebermitteln' }],
          },
        ],
        contactTitle: '12. Kontakt',
        contactIntro: 'Bei Fragen zum Datenschutz erreichen Sie uns unter:',
        imprintLabel: 'Impressum',
      }
)
