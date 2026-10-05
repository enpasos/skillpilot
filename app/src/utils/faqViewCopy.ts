import type { LabelLanguage } from './filterLabels'

export interface FaqQuestionCopy {
  id: string
  question: string
  paragraphs: string[]
  bullets?: string[]
  link?: { href: string; label: string }
}

export interface FaqSectionCopy {
  id: 'claude' | 'chatgpt' | 'learning'
  title: string
  intro: string
  questions: FaqQuestionCopy[]
}

export interface FaqViewCopy {
  backToApp: string
  title: string
  subtitle: string
  reviewedLabel: string
  recommendation: {
    eyebrow: string
    title: string
    paragraphs: string[]
    actionLabel: string
  }
  sections: FaqSectionCopy[]
  moreInformation: {
    title: string
    text: string
    privacy: string
    legal: string
    contact: string
  }
}

const germanCopy: FaqViewCopy = {
  backToApp: 'Zurück zu SkillPilot',
  title: 'Häufige Fragen zu SkillPilot',
  subtitle: 'Mit Claude lernen oder den ChatGPT-Desktop-Betatest ausprobieren.',
  reviewedLabel: 'Stand: 5. Oktober 2026',
  recommendation: {
    eyebrow: 'Jetzt mitlernen',
    title: 'Claude-Beta und ChatGPT-Desktop-Betatest',
    paragraphs: [
      'Starte mit Claude und hilf uns, den Lernbetrieb weiter zu verbessern. Im Beta-Test funktionieren auch die Claude-App und Voice Mode.',
      'Zusätzlich kannst du ChatGPT Desktop über den Git-Marketplace nutzen, wenn dein Konto diese Plugin-Einrichtung unterstützt. Installation und Lernstart unter Windows sind im Betatest bestätigt.',
    ],
    actionLabel: 'Jetzt in SkillPilot lernen',
  },
  sections: [
    {
      id: 'claude',
      title: 'Lernen mit Claude',
      intro: 'Der aktuelle Weg für unseren laufenden Beta-Test.',
      questions: [
        {
          id: 'claude-start',
          question: 'Wie starte ich mit Claude?',
          paragraphs: [
            'Wähle auf der SkillPilot-Startseite „Jetzt lernen“ und folge der Claude-Einrichtung. Danach startest du deine Lernsession in SkillPilot und sendest die vorbereitete Startnachricht im neuen Claude-Chat ab.',
            'Wir verbessern den Lernbetrieb anhand der Erfahrungen aus der Beta. Wenn etwas nicht klappt, nenne uns das Lernziel und den fehlerhaften Schritt – ohne deine Startnachricht oder den vollständigen Lernchat weiterzugeben.',
          ],
          link: { href: '/plugins', label: 'Aktuelle Claude-Installationsanleitung' },
        },
        {
          id: 'claude-app',
          question: 'Kann ich die Claude-App verwenden?',
          paragraphs: [
            'Ja. Im laufenden Beta-Test funktioniert SkillPilot auch in der Claude-App. Du musst also nicht grundsätzlich auf einen Browser ausweichen.',
            'Das beschreibt unsere bisherigen Beta-Erfahrungen, nicht eine vollständige Prüfung jeder Geräte- und App-Version. Falls auf deinem Gerät etwas nicht funktioniert, melde uns bitte das Gerät, die App-Version und den betroffenen Lernschritt.',
          ],
        },
        {
          id: 'claude-voice',
          question: 'Kann ich mit Claude im Voice Mode lernen?',
          paragraphs: [
            'Ja. Voice Mode funktioniert im laufenden Claude-Beta-Test. Gelegentlich stockt die Sprachausgabe; warte dann kurz. Nach unseren bisherigen Erfahrungen spricht Claude anschließend weiter.',
            'Wenn im Voice Mode ein Bild oder eine Lernkarte nicht erscheint, hilft derzeit dieser Workaround: Schalte Voice Mode kurz aus und lade denselben Chat neu. Sobald das Bild oder die Lernkarte sichtbar ist, kannst du Voice Mode wieder einschalten.',
            'Falls es nicht weitergeht, kannst du im Textchat fortfahren. Ob ein Lernziel gespeichert wurde, prüfst du im SkillPilot-Cockpit – eine gesprochene Erfolgsantwort allein bestätigt das nicht.',
          ],
        },
        {
          id: 'continue-on-phone',
          question: 'Kann ich einen Claude-Chat am Handy fortsetzen?',
          paragraphs: [
            'Öffne mit demselben Claude-Konto denselben bestehenden Chat auf dem anderen Gerät, etwa in der Claude-App. Deine SkillPilot-Lernsession bleibt dabei innerhalb ihrer Gültigkeit von 24 Stunden nutzbar.',
            'So kannst du beispielsweise am Computer beginnen und später mit der Handykamera ein Foto deiner Lösung in denselben Chat hochladen.',
          ],
        },
      ],
    },
    {
      id: 'chatgpt',
      title: 'Lernen mit ChatGPT',
      intro: 'Desktop-Betatest über den Git-Marketplace, wenn dein Konto diese Plugin-Einrichtung unterstützt.',
      questions: [
        {
          id: 'chatgpt-availability',
          question: 'Wie starte ich den ChatGPT-Desktop-Betatest?',
          paragraphs: [
            'Öffne in ChatGPT Desktop „Plugins“ und prüfe, ob unter „Hinzufügen“ die Option „Marketplace hinzufügen“ vorhanden ist. Folge dann der ChatGPT-Anleitung unter „Plugins“ in SkillPilot, um den Git-Marketplace hinzuzufügen und das SkillPilot-Plugin zu installieren und zu verbinden.',
            'Wähle anschließend in SkillPilot ausdrücklich „ChatGPT Desktop“ als Coach und „Lernen mit ChatGPT vorbereiten“. Sende die neue vorbereitete Startnachricht in einem neuen Chat in ChatGPT Desktop. Eine für Claude vorbereitete Startnachricht funktioniert nicht mit ChatGPT.',
            'Installation und Lernstart in ChatGPT Desktop unter Windows funktionieren im Betatest. Für Korrekturen folge der aktuellen Update-Anleitung und prüfe die tatsächlich installierte Plugin-Version. Bereite danach eine neue Lernsession in SkillPilot vor.',
            'SkillPilot ist noch nicht im öffentlichen ChatGPT-App-Verzeichnis veröffentlicht. Einen Veröffentlichungstermin können wir noch nicht nennen.',
          ],
          link: { href: '/plugins#chatgpt-desktop', label: 'ChatGPT-Desktop-Installationsanleitung' },
        },
        {
          id: 'chatgpt-app-voice',
          question: 'Gelten die Aussagen zu Claude-App und Voice Mode auch für ChatGPT?',
          paragraphs: [
            'Die ChatGPT-Beta nutzt die Desktop-App. Installation und Lernstart unter Windows funktionieren. ChatGPT im Browser, die mobile ChatGPT-App und Voice Mode sind für diesen Betatest nicht freigegeben.',
            'Weitere Lernfunktionen und das Fortsetzen einer Lernsession prüfen wir für ChatGPT vor der Veröffentlichung gesondert. Die Erfahrungen mit der Claude-App und deren Voice Mode gelten weiterhin für Claude.',
          ],
        },
      ],
    },
    {
      id: 'learning',
      title: 'Lernsession, Lernstand und Datenschutz',
      intro: 'Das Wichtigste für deinen Lernalltag – unabhängig vom Coach.',
      questions: [
        {
          id: 'provider-options',
          question: 'Welches Konto brauche ich für den Einstieg?',
          paragraphs: [
            'Die Claude-Beta läuft weiter. Für den ChatGPT-Desktop-Betatest muss dein Konto die Plugin-Einrichtung über einen Git-Marketplace unterstützen; der Tarif allein garantiert das nicht. Die Einrichtungsübersicht erklärt die Voraussetzungen und Altersgrenzen für beide Anbieter.',
          ],
          link: { href: '/faq/coach-setup', label: 'Zugang und Voraussetzungen ansehen' },
        },
        {
          id: 'session-duration',
          question: 'Wie lange kann ich einen SkillPilot-Chat verwenden?',
          paragraphs: [
            'Eine über „Lernen starten“ erzeugte Lernsession ist 24 Stunden gültig. Danach bleibt der Chat lesbar, aber für weitere Zugriffe auf deinen Lernstand brauchst du eine neue Lernsession.',
            'Wähle dann in SkillPilot erneut „Lernen starten“ und beginne einen neuen Chat. Teile die vorbereitete Startnachricht und deinen Lernchat nicht mit anderen Personen.',
          ],
        },
        {
          id: 'saved-progress',
          question: 'Woran sehe ich, ob mein Lernziel gespeichert wurde?',
          paragraphs: [
            'Prüfe deinen Lernstand im SkillPilot-Cockpit. Eine lobende oder überzeugende Antwort des Coaches allein ist kein Beleg dafür, dass das Speichern funktioniert hat.',
            'Meldet der Coach einen Fehler beim Speichern, lass ihn den aktuellen Stand prüfen und den Abschluss bei Bedarf erneut speichern. Ist die Lernsession abgelaufen, starte in SkillPilot eine neue. Bleibt der Fehler bestehen, melde uns das Lernziel und die Fehlermeldung – ohne Zugangsdaten oder die vorbereitete Startnachricht.',
          ],
        },
        {
          id: 'photo-upload',
          question: 'Kann ich eine handschriftliche Aufgabe fotografieren?',
          paragraphs: [
            'Ja. In Claude kannst du Fotos deiner Rechnung, eines Diagramms oder eines handschriftlichen Lösungswegs hochladen oder direkt die Kamera in der Claude-App nutzen. Am praktischsten geht das mit dem Handy.',
            'Schneide Namen, Adressen und andere persönliche Angaben vorher aus dem Bild heraus oder verdecke sie. Lade keine Zeugnisse, Passwörter oder vertraulichen Unterlagen hoch.',
            'Die Unterhaltung und das Bild bleiben beim jeweiligen Chat-Anbieter; SkillPilot erhält über den Coach keine Chattexte oder Fotos, sondern nur die vorgesehenen strukturierten Lernstandsdaten.',
          ],
        },
        {
          id: 'ask-to-improve',
          question: 'Was mache ich, wenn ich etwas nicht lesen oder verstehen kann?',
          paragraphs: [
            'Sag es dem Coach direkt. Bitte um eine einfachere Erklärung, kleinere Schritte oder ein Beispiel. Nachfragen gehört zum Lernen und zählt nicht als falsche Antwort.',
            'Wird eine Formel als merkwürdiger Text mit Zeichen wie \\[ oder \\cdot angezeigt, bitte den Coach, sie als normalen Text oder schrittweise neu zu schreiben. Prüfe danach kurz, ob Zahlen und Vorzeichen stimmen.',
          ],
          bullets: [
            '„Erklär mir diesen Schritt bitte langsamer.“',
            '„Zeig mir ein einfaches Beispiel mit Zahlen.“',
            '„Die Formel wird nicht richtig angezeigt. Schreib sie bitte noch einmal als normalen Text.“',
          ],
        },
        {
          id: 'disagree-with-coach',
          question: 'Was mache ich, wenn der Coach etwas Falsches sagt oder schlecht erklärt?',
          paragraphs: [
            'Widersprich und begründe, was du für falsch hältst. Eine flüssige Erklärung ist kein Beweis dafür, dass sie stimmt. Wenn deine Lösung zu Unrecht als falsch bewertet wird, zeige deinen Rechenweg und bitte um erneute Prüfung.',
            'Sag auch, wenn der Coach zu schnell ist oder dir die Lösung zu früh verrät. Ein begründeter Widerspruch schadet deinem Lernstand nicht.',
            'Im Cockpit wird dein aktuelles Lernziel automatisch angezeigt. Wähle dort „Feedback zu diesem Lernziel“. Hier kannst du auch beschreiben, wenn sich der Coach deiner Meinung nach nicht richtig verhält – etwa schlecht erklärt, falsch bewertet oder zu schnell vorgeht.',
            'Beschreibe das Problem in eigenen Worten. Übernimm keine Chattexte, Startnachrichten oder persönlichen Angaben in dein Feedback.',
          ],
          bullets: [
            '„Rechne den Schritt bitte noch einmal nach.“',
            '„Ich habe anders gerechnet. Prüf bitte, ob mein Weg auch gilt.“',
            '„Verrat mir die Lösung bitte noch nicht, gib mir nur einen Tipp.“',
          ],
        },
      ],
    },
  ],
  moreInformation: {
    title: 'Weitere Informationen',
    text: 'Hier findest du Details zum Datenschutz und zu den Nutzungsbedingungen. Technische Probleme kannst du dem SkillPilot-Team melden.',
    privacy: 'Datenschutz',
    legal: 'Nutzungsbedingungen',
    contact: 'support@skillpilot.com',
  },
}

const englishCopy: FaqViewCopy = {
  backToApp: 'Back to SkillPilot',
  title: 'Frequently asked questions about SkillPilot',
  subtitle: 'Learn with Claude or try the ChatGPT desktop beta.',
  reviewedLabel: 'Status: October 5, 2026',
  recommendation: {
    eyebrow: 'Join the learning',
    title: 'Claude beta and ChatGPT desktop beta',
    paragraphs: [
      'Start with Claude and help us improve the learning experience. The Claude app and voice mode also work in the ongoing beta.',
      'You can also use ChatGPT Desktop through the Git marketplace if your account supports this plugin setup. Installation and learning start on Windows are confirmed in the beta.',
    ],
    actionLabel: 'Start learning in SkillPilot',
  },
  sections: [
    {
      id: 'claude',
      title: 'Learning with Claude',
      intro: 'The current route for our ongoing beta test.',
      questions: [
        {
          id: 'claude-start',
          question: 'How do I get started with Claude?',
          paragraphs: [
            'Select “Learn now” on the SkillPilot home page and follow the Claude setup. Then start your learning session in SkillPilot and send the prepared start message in the new Claude chat.',
            'We improve learning flows based on beta feedback. If something goes wrong, tell us the learning goal and the step that failed – without sharing your start message or full learning conversation.',
          ],
          link: { href: '/plugins', label: 'Current Claude installation guide' },
        },
        {
          id: 'claude-app',
          question: 'Can I use the Claude app?',
          paragraphs: [
            'Yes. SkillPilot also works in the Claude app in the ongoing beta. You do not have to switch to a browser as a general rule.',
            'This describes our beta experience so far, not complete testing of every device and app version. If something fails on your device, please tell us the device, app version, and affected learning step.',
          ],
        },
        {
          id: 'claude-voice',
          question: 'Can I learn with Claude in voice mode?',
          paragraphs: [
            'Yes. Voice mode works in the ongoing Claude beta. The spoken response occasionally pauses; wait briefly when this happens. In our experience so far, Claude then resumes speaking.',
            'If an image or flashcard does not appear in voice mode, this workaround currently helps: briefly turn voice mode off and reload the same chat. Once the image or flashcard is visible, you can turn voice mode back on.',
            'If it does not resume, you can continue in text chat. Check the SkillPilot cockpit to see whether a learning goal was saved – a spoken success message alone does not confirm that.',
          ],
        },
        {
          id: 'continue-on-phone',
          question: 'Can I continue a Claude chat on my phone?',
          paragraphs: [
            'Using the same Claude account, open the same existing chat on the other device, for example in the Claude app. Your SkillPilot learning session remains usable within its 24 hours of validity.',
            'For example, you can start on your computer and later upload a photo of your work to the same chat using your phone camera.',
          ],
        },
      ],
    },
    {
      id: 'chatgpt',
      title: 'Learning with ChatGPT',
      intro: 'Desktop beta through the Git marketplace, if your account supports this plugin setup.',
      questions: [
        {
          id: 'chatgpt-availability',
          question: 'How do I start the ChatGPT desktop beta?',
          paragraphs: [
            'Open “Plugins” in ChatGPT Desktop and check whether “Add” offers “Add marketplace”. Then follow the ChatGPT guide under “Plugins” in SkillPilot to add the Git marketplace and install and connect the SkillPilot plugin.',
            'Then explicitly select “ChatGPT Desktop” as your coach and “Prepare learning with ChatGPT” in SkillPilot. Send the new prepared start message in a new chat in ChatGPT Desktop. A start message prepared for Claude does not work with ChatGPT.',
            'Installation and learning start in ChatGPT Desktop on Windows work in the beta. For corrections, follow the current update guide and check the plugin version that is actually installed. Then prepare a new learning session in SkillPilot.',
            'SkillPilot has not been published in the public ChatGPT app directory. We cannot give a release date yet.',
          ],
          link: { href: '/plugins#chatgpt-desktop', label: 'ChatGPT desktop installation guide' },
        },
        {
          id: 'chatgpt-app-voice',
          question: 'Does the guidance about the Claude app and voice mode also apply to ChatGPT?',
          paragraphs: [
            'The ChatGPT beta uses the desktop app. Installation and learning start on Windows work. ChatGPT in the browser, the mobile ChatGPT app, and voice mode are not enabled for this beta.',
            'We will separately check further learning features and session continuation for ChatGPT before publication. The experience with the Claude app and its voice mode still applies to Claude.',
          ],
        },
      ],
    },
    {
      id: 'learning',
      title: 'Learning sessions, progress, and privacy',
      intro: 'The essentials for everyday learning, whichever coach you use.',
      questions: [
        {
          id: 'provider-options',
          question: 'Which account do I need to get started?',
          paragraphs: [
            'The Claude beta continues. For the ChatGPT desktop beta, your account must support plugin setup through a Git marketplace; your plan alone does not guarantee that. The setup overview explains the requirements and age limits for both providers.',
          ],
          link: { href: '/faq/coach-setup', label: 'View access and requirements' },
        },
        {
          id: 'session-duration',
          question: 'How long can I use a SkillPilot chat?',
          paragraphs: [
            'A learning session created through “Start Learning” is valid for 24 hours. After that, the chat remains readable, but further access to your learning record requires a new learning session.',
            'Select “Start Learning” in SkillPilot again and begin a new chat. Do not share the prepared start message or your learning chat with other people.',
          ],
        },
        {
          id: 'saved-progress',
          question: 'How can I tell whether my learning goal was saved?',
          paragraphs: [
            'Check your learning record in the SkillPilot cockpit. Praise or a convincing answer from the coach alone is not evidence that saving worked.',
            'If the coach reports a saving error, ask it to check the current state and save the completion again if needed. If the learning session has expired, start a new one in SkillPilot. If the error persists, report the learning goal and error message – without access credentials or the prepared start message.',
          ],
        },
        {
          id: 'photo-upload',
          question: 'Can I photograph a handwritten task?',
          paragraphs: [
            'Yes. In Claude, you can upload photos of your calculation, diagram, or handwritten solution, or use the camera directly in the Claude app. This is most convenient on your phone.',
            'Crop out or cover names, addresses, and other personal information first. Do not upload report cards, passwords, or confidential documents.',
            'The conversation and image stay with the chat service; SkillPilot does not receive chat text or photos through the coach, only the intended structured learning-state data.',
          ],
        },
        {
          id: 'ask-to-improve',
          question: 'What should I do if I cannot read or understand something?',
          paragraphs: [
            'Tell the coach directly. Ask for a simpler explanation, smaller steps, or an example. Asking is part of learning and does not count as a wrong answer.',
            'If a formula appears as odd text with characters such as \\[ or \\cdot, ask the coach to rewrite it as plain text or step by step. Then briefly check that the numbers and signs are correct.',
          ],
          bullets: [
            '“Please explain that step more slowly.”',
            '“Show me a simple example with numbers.”',
            '“The formula is not displaying properly. Please write it again as plain text.”',
          ],
        },
        {
          id: 'disagree-with-coach',
          question: 'What if the coach says something wrong or explains it badly?',
          paragraphs: [
            'Push back and explain what you think is wrong. A fluent explanation is not proof that it is correct. If your solution is incorrectly marked wrong, show your working and ask for another check.',
            'Also say when the coach is too fast or gives away the answer too soon. Disagreeing with good reasons does not hurt your learning record.',
            'The cockpit automatically shows your current learning goal. Select “Give feedback on this learning goal” there. You can also describe when, in your opinion, the coach is not behaving appropriately – for example, explaining poorly, assessing incorrectly, or moving too fast.',
            'Describe the problem in your own words. Do not copy chat text, start messages, or personal information into your feedback.',
          ],
          bullets: [
            '“Please redo that calculation.”',
            '“I worked it out differently. Please check whether my approach also holds.”',
            '“Please do not give away the solution yet, just a hint.”',
          ],
        },
      ],
    },
  ],
  moreInformation: {
    title: 'More information',
    text: 'Find details about privacy and the Terms of Use here. You can report technical problems to the SkillPilot team.',
    privacy: 'Privacy',
    legal: 'Terms of Use',
    contact: 'support@skillpilot.com',
  },
}

export const getFaqViewCopy = (language: LabelLanguage): FaqViewCopy => (
  language === 'en' ? englishCopy : germanCopy
)
