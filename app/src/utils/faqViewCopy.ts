import type { LabelLanguage } from './filterLabels'

export type FaqCompatibilityStatus = 'recommended' | 'supported' | 'limited' | 'unsupported'

export interface FaqCompatibilityRow {
  id: string
  feature: string
  status: FaqCompatibilityStatus
  recommendation: string
}

export interface FaqQuestionCopy {
  id: string
  question: string
  paragraphs: string[]
  bullets?: string[]
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
  }
  warning: {
    eyebrow: string
    title: string
    paragraphs: string[]
    evidenceWarning: string
    alternative: string
    recoveryTitle: string
    recoverySteps: string[]
    recoveryClosing: string
  }
  compatibility: {
    title: string
    intro: string
    featureHeading: string
    statusHeading: string
    recommendationHeading: string
    statusLabels: Record<FaqCompatibilityStatus, string>
    rows: FaqCompatibilityRow[]
  }
  faqTitle: string
  faqIntro: string
  questions: FaqQuestionCopy[]
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
  title: 'SkillPilot Coach mit ChatGPT verwenden',
  subtitle: 'So nutzt du den Lerncoach zuverlässig auf Computer, Tablet und Smartphone.',
  reviewedLabel: 'Kompatibilitätsstand: 7. August 2026',
  recommendation: {
    eyebrow: 'Empfohlener Weg',
    title: 'ChatGPT im Browser verwenden – auf allen Geräten',
    paragraphs: [
      'Öffne den SkillPilot Coach in ChatGPT im Browser. Das ist der von SkillPilot getestete und empfohlene Weg auf PC, Mac, Tablet und Smartphone.',
      'Starte den Coach über „Lernen starten“ in SkillPilot. Dabei wird ein neuer Chat vorbereitet und die zugehörige SkillPilot-Lernsession-ID an den Chat übergeben.',
      'Auf Smartphones und Tablets kannst du ChatGPT zusätzlich auf dem Startbildschirm speichern, sofern dein Browser diese Funktion anbietet. Du erhältst dann ein eigenes Symbol und verwendest weiterhin die empfohlene Browser-Version.',
    ],
  },
  warning: {
    eyebrow: 'Wichtige Einschränkung',
    title: 'ChatGPT Voice Mode nicht mit SkillPilot verwenden',
    paragraphs: [
      'Im Voice Mode kann ChatGPT weiterhin flüssig und überzeugend antworten, obwohl der aktuelle SkillPilot-Lernstand und die SkillPilot-Funktionen nicht zuverlässig zur Verfügung stehen. Für Lernende ist dieser Unterschied möglicherweise nicht unmittelbar erkennbar.',
    ],
    evidenceWarning: 'Eine überzeugende Antwort der KI ist kein Beleg dafür, dass SkillPilot im Hintergrund noch korrekt arbeitet.',
    alternative: 'Wenn du sprechen möchtest, verwende stattdessen die Diktier- oder Spracheingabe im normalen Textchat und sende den erkannten Text als Nachricht ab.',
    recoveryTitle: 'Voice Mode versehentlich gestartet?',
    recoverySteps: [
      'Voice Mode beenden.',
      'In SkillPilot erneut „Lernen starten“ wählen und damit einen neuen Chat mit dem SkillPilot Coach öffnen.',
      'Die vorbereitete Startnachricht mit der neuen Lernsession im neuen Chat absenden.',
    ],
    recoveryClosing: 'Arbeite nicht einfach im bisherigen Chat weiter.',
  },
  compatibility: {
    title: 'Kompatibilität auf einen Blick',
    intro: 'Die Angaben beschreiben die von SkillPilot derzeit getesteten und empfohlenen Kombinationen.',
    featureHeading: 'Funktion',
    statusHeading: 'Status',
    recommendationHeading: 'Empfehlung',
    statusLabels: {
      recommended: 'Empfohlen',
      supported: 'Funktioniert',
      limited: 'Eingeschränkt',
      unsupported: 'Nicht verwenden',
    },
    rows: [
      {
        id: 'browser-desktop',
        feature: 'ChatGPT im Browser auf PC oder Mac',
        status: 'recommended',
        recommendation: 'Empfohlene Umgebung',
      },
      {
        id: 'browser-mobile',
        feature: 'ChatGPT im Browser auf Smartphone oder Tablet',
        status: 'recommended',
        recommendation: 'Empfohlene mobile Umgebung',
      },
      {
        id: 'browser-home-screen',
        feature: 'ChatGPT als Web-App vom Startbildschirm',
        status: 'recommended',
        recommendation: 'Empfohlen, wenn der Browser dies anbietet',
      },
      {
        id: 'text-chat',
        feature: 'Normaler Textchat mit SkillPilot',
        status: 'supported',
        recommendation: 'Für SkillPilot-Lernsitzungen verwenden',
      },
      {
        id: 'dictation',
        feature: 'Diktier- oder Spracheingabe im Textchat',
        status: 'supported',
        recommendation: 'Text vor dem Absenden kurz prüfen',
      },
      {
        id: 'uploads',
        feature: 'Fotos und Aufgaben im Textchat hochladen',
        status: 'supported',
        recommendation: 'Verwenden, wenn ChatGPT den Upload anbietet',
      },
      {
        id: 'visualizations',
        feature: 'SkillPilot-Bilder und Visualisierungen im Browser',
        status: 'supported',
        recommendation: 'Im normalen Browser-Textchat verwenden',
      },
      {
        id: 'cross-device-chat',
        feature: 'Einen bestehenden Chat auf einem anderen Gerät fortsetzen',
        status: 'supported',
        recommendation: 'Denselben Chat dort im Browser oder in der Browser-Web-App öffnen',
      },
      {
        id: 'native-app',
        feature: 'Native ChatGPT-App',
        status: 'limited',
        recommendation: 'Derzeit nicht für alle SkillPilot-Funktionen zuverlässig',
      },
      {
        id: 'voice-mode',
        feature: 'ChatGPT Voice Mode',
        status: 'unsupported',
        recommendation: 'Nicht mit SkillPilot verwenden',
      },
    ],
  },
  faqTitle: 'Häufige Fragen',
  faqIntro: 'Antworten zur Nutzung von SkillPilot mit ChatGPT auf unterschiedlichen Geräten.',
  questions: [
    {
      id: 'smartphone',
      question: 'Kann ich SkillPilot Coach auf meinem Smartphone verwenden?',
      paragraphs: [
        'Ja. Öffne ChatGPT auf dem Smartphone im Browser. Der SkillPilot Coach funktioniert dort ebenso wie auf einem Computer oder Tablet.',
        'Für einen schnelleren Zugriff kannst du ChatGPT als Web-App auf dem Startbildschirm speichern, sofern dein Browser dies anbietet. Unsere Empfehlung gilt auf allen Geräten: Browser oder Browser-Web-App statt der nativen ChatGPT-App.',
      ],
    },
    {
      id: 'continue-on-phone',
      question: 'Kann ich einen auf dem Computer begonnenen Chat am Handy fortsetzen?',
      paragraphs: [
        'Ja. Öffne auf dem Smartphone denselben bestehenden Chat in ChatGPT im Browser oder in der vom Browser gespeicherten Web-App. Der Chat enthält bereits die SkillPilot-Lernsession-ID, die beim Start über „Lernen starten“ übergeben wurde.',
        'Das ist beispielsweise praktisch, wenn du am Computer lernst und anschließend mit der Handykamera ein Foto deiner Lösung hochladen möchtest. Öffne den Chat dafür nicht in der nativen ChatGPT-App.',
      ],
    },
    {
      id: 'speaking',
      question: 'Kann ich mit SkillPilot sprechen?',
      paragraphs: [
        'Ja. Nutze dafür die Diktier- oder Spracheingabe im normalen Textchat. Deine Sprache wird in eine gewöhnliche Textnachricht umgewandelt, die du prüfen und anschließend absenden kannst.',
        'Diese Spracheingabe ist nicht dasselbe wie der fortlaufende ChatGPT Voice Mode. Den Voice Mode solltest du während einer SkillPilot-Lernsitzung nicht starten.',
      ],
    },
    {
      id: 'photo-upload',
      question: 'Kann ich eine handschriftliche Aufgabe fotografieren?',
      paragraphs: [
        'Ja. Wenn ChatGPT in deinem normalen Textchat einen Upload anbietet, kannst du eine Rechnung, ein Diagramm oder einen handschriftlichen Lösungsweg fotografieren und das Bild hochladen. Der Coach kann es dann in die weitere Unterhaltung einbeziehen.',
        'Wenn der Chat auf deinem Computer läuft, öffne genau diesen Chat auf dem Smartphone im Browser oder in der Browser-Web-App und lade das Foto dort hoch. So verwendest du dieselbe bereits übergebene SkillPilot-Lernsession-ID weiter. Ein größerer Bildschirm kann anschließend für längere Texte, Formeln und Visualisierungen angenehmer sein.',
      ],
    },
    {
      id: 'native-app',
      question: 'Warum empfehlen wir derzeit nicht die native ChatGPT-App?',
      paragraphs: [
        'SkillPilot nutzt ChatGPT-Funktionen, die nicht in jeder Kombination aus Gerät, Client und Modus gleich zuverlässig zur Verfügung stehen. Insbesondere eingebettete SkillPilot-Komponenten funktionieren in der nativen App derzeit nicht durchgehend zuverlässig.',
        'Diese Probleme wurden an OpenAI gemeldet. Bis sie behoben sind, empfehlen wir den von SkillPilot getesteten Weg: ChatGPT im Browser auf PC, Mac, Tablet oder Smartphone.',
      ],
    },
    {
      id: 'voice-recovery',
      question: 'Was soll ich tun, wenn ich versehentlich Voice Mode gestartet habe?',
      paragraphs: [
        'Beende Voice Mode, wähle in SkillPilot erneut „Lernen starten“ und öffne damit einen neuen Chat mit dem SkillPilot Coach. Sende dort die vorbereitete Startnachricht mit der neuen Lernsession ab.',
        'Führe die bisherige Unterhaltung nach dem Verlassen von Voice Mode nicht einfach fort. Nur der neue SkillPilot-Chat bringt dich wieder in den von uns unterstützten Zustand.',
      ],
    },
  ],
  moreInformation: {
    title: 'Weitere Informationen',
    text: 'Fragen zu Datenverarbeitung oder rechtlichen Hinweisen beantworten die folgenden Seiten. Technische Probleme kannst du dem SkillPilot-Team melden.',
    privacy: 'Datenschutz',
    legal: 'Rechtliches',
    contact: 'support@skillpilot.com',
  },
}

const englishCopy: FaqViewCopy = {
  backToApp: 'Back to SkillPilot',
  title: 'Using SkillPilot Coach with ChatGPT',
  subtitle: 'How to use the learning coach reliably on a computer, tablet, or smartphone.',
  reviewedLabel: 'Compatibility status: August 7, 2026',
  recommendation: {
    eyebrow: 'Recommended setup',
    title: 'Use ChatGPT in a browser – on every device',
    paragraphs: [
      'Open SkillPilot Coach in ChatGPT in your browser. This is the setup currently tested and recommended by SkillPilot on PCs, Macs, tablets, and smartphones.',
      'Start the coach by selecting “Start Learning” in SkillPilot. This prepares a new chat and passes the corresponding SkillPilot learning session ID to it.',
      'On a smartphone or tablet, you can also save ChatGPT to your home screen if your browser offers that option. You then get a dedicated icon while continuing to use the recommended browser version.',
    ],
  },
  warning: {
    eyebrow: 'Important limitation',
    title: 'Do not use ChatGPT voice mode with SkillPilot',
    paragraphs: [
      'In voice mode, ChatGPT may continue to respond fluently and convincingly even though the current SkillPilot learning state and SkillPilot functions are not reliably available. Learners may not notice this difference immediately.',
    ],
    evidenceWarning: 'A convincing AI answer is not evidence that SkillPilot is still working correctly in the background.',
    alternative: 'If you want to speak, use dictation or voice input in normal text chat instead, then send the recognized text as a message.',
    recoveryTitle: 'Accidentally started voice mode?',
    recoverySteps: [
      'End voice mode.',
      'Select “Start Learning” in SkillPilot again to open a new chat with SkillPilot Coach.',
      'Send the prepared start message with the new learning session in the new chat.',
    ],
    recoveryClosing: 'Do not simply continue working in the previous chat.',
  },
  compatibility: {
    title: 'Compatibility at a glance',
    intro: 'This table describes the combinations currently tested and recommended by SkillPilot.',
    featureHeading: 'Feature',
    statusHeading: 'Status',
    recommendationHeading: 'Recommendation',
    statusLabels: {
      recommended: 'Recommended',
      supported: 'Works',
      limited: 'Limited',
      unsupported: 'Do not use',
    },
    rows: [
      {
        id: 'browser-desktop',
        feature: 'ChatGPT in a browser on PC or Mac',
        status: 'recommended',
        recommendation: 'Recommended environment',
      },
      {
        id: 'browser-mobile',
        feature: 'ChatGPT in a browser on a smartphone or tablet',
        status: 'recommended',
        recommendation: 'Recommended mobile environment',
      },
      {
        id: 'browser-home-screen',
        feature: 'ChatGPT as a home-screen web app',
        status: 'recommended',
        recommendation: 'Recommended when the browser offers this option',
      },
      {
        id: 'text-chat',
        feature: 'Normal text chat with SkillPilot',
        status: 'supported',
        recommendation: 'Use for SkillPilot learning sessions',
      },
      {
        id: 'dictation',
        feature: 'Dictation or voice input in text chat',
        status: 'supported',
        recommendation: 'Review the text briefly before sending',
      },
      {
        id: 'uploads',
        feature: 'Upload photos and tasks in text chat',
        status: 'supported',
        recommendation: 'Use when ChatGPT offers uploads',
      },
      {
        id: 'visualizations',
        feature: 'SkillPilot images and visualizations in the browser',
        status: 'supported',
        recommendation: 'Use in normal browser text chat',
      },
      {
        id: 'cross-device-chat',
        feature: 'Continue an existing chat on another device',
        status: 'supported',
        recommendation: 'Open the same chat there in a browser or browser web app',
      },
      {
        id: 'native-app',
        feature: 'Native ChatGPT app',
        status: 'limited',
        recommendation: 'Currently not reliable for every SkillPilot feature',
      },
      {
        id: 'voice-mode',
        feature: 'ChatGPT voice mode',
        status: 'unsupported',
        recommendation: 'Do not use with SkillPilot',
      },
    ],
  },
  faqTitle: 'Frequently asked questions',
  faqIntro: 'Answers about using SkillPilot with ChatGPT on different devices.',
  questions: [
    {
      id: 'smartphone',
      question: 'Can I use SkillPilot Coach on my smartphone?',
      paragraphs: [
        'Yes. Open ChatGPT in your smartphone browser. SkillPilot Coach works there just as it does on a computer or tablet.',
        'For faster access, you can save ChatGPT as a home-screen web app if your browser offers that option. Our recommendation is the same on every device: use the browser or browser web app instead of the native ChatGPT app.',
      ],
    },
    {
      id: 'continue-on-phone',
      question: 'Can I continue a chat from my computer on my phone?',
      paragraphs: [
        'Yes. On your smartphone, open the same existing chat in ChatGPT in a browser or in the web app saved by your browser. The chat already contains the SkillPilot learning session ID passed to it when you selected “Start Learning”.',
        'This is useful, for example, when you are learning on a computer and then want to upload a photo of your work with the phone camera. Do not open the chat in the native ChatGPT app for this.',
      ],
    },
    {
      id: 'speaking',
      question: 'Can I speak to SkillPilot?',
      paragraphs: [
        'Yes. Use dictation or voice input in normal text chat. Your speech is converted into an ordinary text message that you can review and then send.',
        'This voice input is not the same as continuous ChatGPT voice mode. Do not start voice mode during a SkillPilot learning session.',
      ],
    },
    {
      id: 'photo-upload',
      question: 'Can I photograph a handwritten task?',
      paragraphs: [
        'Yes. If ChatGPT offers uploads in your normal text chat, you can photograph a calculation, diagram, or handwritten solution and upload the image. The coach can then include it in the conversation.',
        'If the chat is running on your computer, open that exact chat on your smartphone in a browser or browser web app and upload the photo there. This keeps using the same SkillPilot learning session ID that was already passed to the chat. A larger screen may then be more comfortable again for longer text, formulas, and visualizations.',
      ],
    },
    {
      id: 'native-app',
      question: 'Why do we currently not recommend the native ChatGPT app?',
      paragraphs: [
        'SkillPilot uses ChatGPT features that are not equally reliable in every combination of device, client, and mode. In particular, embedded SkillPilot components do not currently work reliably throughout the native app.',
        'These issues have been reported to OpenAI. Until they are resolved, we recommend the setup tested by SkillPilot: use ChatGPT in a browser on a PC, Mac, tablet, or smartphone.',
      ],
    },
    {
      id: 'voice-recovery',
      question: 'What should I do if I accidentally started voice mode?',
      paragraphs: [
        'End voice mode, select “Start Learning” in SkillPilot again, and use it to open a new chat with SkillPilot Coach. Send the prepared start message with the new learning session there.',
        'Do not simply continue the previous conversation after leaving voice mode. Only the new SkillPilot chat returns you to the setup we currently support.',
      ],
    },
  ],
  moreInformation: {
    title: 'More information',
    text: 'The following pages answer questions about data processing and legal notices. You can report technical problems to the SkillPilot team.',
    privacy: 'Privacy',
    legal: 'Legal',
    contact: 'support@skillpilot.com',
  },
}

export const getFaqViewCopy = (language: LabelLanguage): FaqViewCopy => (
  language === 'en' ? englishCopy : germanCopy
)
