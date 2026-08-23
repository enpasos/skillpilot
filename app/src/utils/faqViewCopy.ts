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
  link?: {
    href: string
    label: string
  }
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
  title: 'Häufige Fragen zu SkillPilot',
  subtitle: 'So startest du eine Lernsession, lernst auf verschiedenen Geräten und löst typische Probleme.',
  reviewedLabel: 'Stand: 23. August 2026',
  recommendation: {
    eyebrow: 'Empfohlener Weg',
    title: 'ChatGPT im Browser verwenden – auf allen Geräten',
    paragraphs: [
      'Öffne den SkillPilot Coach in ChatGPT im Browser. Das ist der von SkillPilot getestete und empfohlene Weg auf PC, Mac, Tablet und Smartphone.',
      'Starte den Coach über „Lernen starten“ in SkillPilot. Dabei wird ein neuer Chat mit einer Lernsession vorbereitet, die 24 Stunden gültig ist.',
      'Auf Smartphones und Tablets kannst du ChatGPT zusätzlich auf dem Startbildschirm speichern, sofern dein Browser diese Funktion anbietet. Du erhältst dann ein eigenes Symbol und verwendest weiterhin die empfohlene Browser-Version.',
    ],
    actionLabel: 'Jetzt in SkillPilot lernen',
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
    title: 'ChatGPT-Gerätekompatibilität auf einen Blick',
    intro: 'Die Angaben beschreiben die von SkillPilot derzeit getesteten und empfohlenen ChatGPT-Kombinationen.',
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
  faqIntro: 'Antworten zum Start, zum Lernen auf verschiedenen Geräten und zu typischen Problemen.',
  questions: [
    {
      id: 'provider-options',
      question: 'Welches ChatGPT- oder Claude-Konto brauche ich?',
      paragraphs: [
        'Für dein tägliches Lernen musst du keine Tariftabelle lesen. Diese Frage ist nur wichtig, wenn du SkillPilot zum ersten Mal einrichtest oder dein ChatGPT- oder Claude-Konto wechselst.',
        'Die Detailübersicht zeigt dir in verständlicher Sprache, welche Konten grundsätzlich infrage kommen, welche Altersgrenzen gelten und welche Wege SkillPilot bereits freigegeben hat.',
      ],
      link: {
        href: '/faq/coach-setup',
        label: 'Zugang und Varianten vergleichen',
      },
    },
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
        'Ja. Öffne auf dem Smartphone denselben bestehenden Chat in ChatGPT im Browser oder in der vom Browser gespeicherten Web-App. Das funktioniert innerhalb der 24 Stunden, für die deine Lernsession gültig ist.',
        'Das ist beispielsweise praktisch, wenn du am Computer lernst und anschließend mit der Handykamera ein Foto deiner Lösung hochladen möchtest. Öffne den Chat dafür nicht in der nativen ChatGPT-App.',
      ],
    },
    {
      id: 'session-duration',
      question: 'Wie lange kann ich einen SkillPilot-Chat verwenden?',
      paragraphs: [
        'Eine über „Lernen starten“ erzeugte Lernsession ist 24 Stunden gültig. Danach kannst du den bisherigen Chat weiterhin lesen, aber SkillPilot kann dort nicht mehr zuverlässig auf deinen aktuellen Lernstand zugreifen.',
        'Wähle dann in SkillPilot erneut „Lernen starten“ und beginne einen neuen Chat. Teile die vorbereitete Startnachricht und deinen Lernchat nicht mit anderen Personen.',
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
        'Schneide Namen, Adressen und andere persönliche Angaben vorher aus dem Bild heraus oder verdecke sie. Lade keine Zeugnisse, Passwörter oder vertraulichen Unterlagen hoch.',
        'Wenn der Chat auf deinem Computer läuft, öffne genau diesen Chat innerhalb der gültigen Lernsession auf dem Smartphone im Browser oder in der Browser-Web-App und lade das Foto dort hoch. Ein größerer Bildschirm kann anschließend für längere Texte, Formeln und Visualisierungen angenehmer sein.',
      ],
    },
    {
      id: 'ask-to-improve',
      question: 'Was mache ich, wenn ich etwas nicht lesen oder nicht verstehen kann?',
      paragraphs: [
        'Sag es dem Coach direkt im Chat. Er schreibt die Stelle dann neu – anders formuliert, einfacher, ausführlicher oder mit einem Beispiel. Nachfragen gehört zum Lernen und zählt nicht als falsche Antwort.',
        'Das gilt für alles, was dich aufhält: eine Formel, die seltsam dargestellt wird, ein Fachwort, das du noch nicht kennst, ein Satz, der zu kompliziert ist, oder ein Rechenschritt, der zu schnell ging.',
      ],
      bullets: [
        '„Die Formel wird bei mir nicht richtig angezeigt. Schreib sie bitte noch einmal.“',
        '„Das Wort … kenne ich nicht. Erklär es mir bitte einfacher.“',
        '„Diesen Schritt habe ich nicht verstanden. Erklär ihn bitte noch einmal langsamer.“',
        '„Zeig mir das bitte an einem einfachen Beispiel mit Zahlen.“',
        '„Bitte stell die Aufgabe noch einmal ohne Fachbegriffe.“',
      ],
    },
    {
      id: 'formula-looks-broken',
      question: 'Eine Formel erscheint als merkwürdiger Text mit Zeichen wie \\[ oder \\cdot. Was bedeutet das?',
      paragraphs: [
        'Meist ist das ein Darstellungsfehler im Chat. Formeln werden in einer Schreibweise übermittelt, die ChatGPT normalerweise in eine gesetzte Formel umwandelt – an dieser Stelle hat die Umwandlung nicht richtig funktioniert.',
        'Du musst das nicht entziffern und du hast nichts falsch gemacht. Bitte den Coach, die Formel noch einmal im Fließtext oder schrittweise zu schreiben. Vergleiche danach kurz, ob Zahlen, Vorzeichen und Rechenschritte unverändert geblieben sind.',
        'Wenn es im selben Chat mehrfach vorkommt, hilft ein Satz für den Rest der Sitzung: „Bitte schreib Formeln in diesem Chat immer im Fließtext.“',
      ],
    },
    {
      id: 'disagree-with-coach',
      question: 'Was mache ich, wenn der Coach etwas Falsches sagt oder schlecht erklärt?',
      paragraphs: [
        'Widersprich. Sag konkret, was du für falsch hältst und warum – der Coach prüft den Schritt dann noch einmal. Übernimm nichts nur deshalb, weil es überzeugend formuliert ist: eine flüssige Erklärung ist kein Beweis dafür, dass sie stimmt.',
        'Das gilt besonders für die Bewertung deiner eigenen Lösung. Wenn dein Ergebnis als falsch eingestuft wird, obwohl du es für richtig hältst, zeig deinen Rechenweg und sag das. Ein anderer, gleichwertiger Lösungsweg ist erlaubt – bewertet wird, was du inhaltlich zeigst, nicht die Formulierung.',
        'Auch wenn nicht der Inhalt, sondern die Art des Unterrichts nicht passt, sag es: zu schnell, zu viel auf einmal, oder eine Lösung, die verraten wurde, bevor du selbst nachdenken konntest.',
        'Ein begründeter Widerspruch schadet deinem Lernstand nicht. Er zeigt im Gegenteil, dass du den Schritt durchdacht hast.',
        'Bleibt der Fehler bestehen, oder ist schon die Aufgabe selbst fehlerhaft, dann liegt es nicht am Chat: Schreib in dem Fall an support@skillpilot.com und nenne kurz Fach, Lernziel und was nicht stimmte.',
      ],
      bullets: [
        '„Das halte ich für falsch, weil …“',
        '„Rechne den Schritt bitte noch einmal nach.“',
        '„Ich habe anders gerechnet und bekomme … . Prüf bitte, ob mein Weg auch gilt.“',
        '„Das geht mir zu schnell. Mach bitte kleinere Schritte.“',
        '„Verrat mir die Lösung bitte noch nicht, gib mir nur einen Tipp.“',
      ],
    },
    {
      id: 'native-app',
      question: 'Warum empfehlen wir derzeit nicht die native ChatGPT-App?',
      paragraphs: [
        'In der nativen ChatGPT-App werden SkillPilot-Bilder, Kartenübungen und andere Lernansichten derzeit nicht immer zuverlässig angezeigt.',
        'Nutze deshalb ChatGPT im Browser auf PC, Mac, Tablet oder Smartphone. Dort stehen dir die von SkillPilot erprobten Lernfunktionen zur Verfügung.',
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
    text: 'Fragen zu Datenverarbeitung oder den Nutzungsbedingungen beantworten die folgenden Seiten. Technische Probleme kannst du dem SkillPilot-Team melden.',
    privacy: 'Datenschutz',
    legal: 'Nutzungsbedingungen',
    contact: 'support@skillpilot.com',
  },
}

const englishCopy: FaqViewCopy = {
  backToApp: 'Back to SkillPilot',
  title: 'Frequently asked questions about SkillPilot',
  subtitle: 'Learn how to start a learning session, use different devices, and solve common problems.',
  reviewedLabel: 'Status: August 23, 2026',
  recommendation: {
    eyebrow: 'Recommended setup',
    title: 'Use ChatGPT in a browser – on every device',
    paragraphs: [
      'Open SkillPilot Coach in ChatGPT in your browser. This is the setup currently tested and recommended by SkillPilot on PCs, Macs, tablets, and smartphones.',
      'Start the coach by selecting “Start Learning” in SkillPilot. This prepares a new chat with a learning session that is valid for 24 hours.',
      'On a smartphone or tablet, you can also save ChatGPT to your home screen if your browser offers that option. You then get a dedicated icon while continuing to use the recommended browser version.',
    ],
    actionLabel: 'Start learning in SkillPilot',
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
    title: 'ChatGPT device compatibility at a glance',
    intro: 'This table describes the ChatGPT combinations currently tested and recommended by SkillPilot.',
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
  faqIntro: 'Answers about getting started, learning on different devices, and solving common problems.',
  questions: [
    {
      id: 'provider-options',
      question: 'Which ChatGPT or Claude account do I need?',
      paragraphs: [
        'You do not need to read a plan comparison for everyday learning. This only matters when you set up SkillPilot for the first time or change your ChatGPT or Claude account.',
        'The detailed overview explains which accounts are eligible in principle, which age limits apply, and which routes SkillPilot has already enabled.',
      ],
      link: {
        href: '/faq/coach-setup',
        label: 'Compare access options',
      },
    },
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
        'Yes. On your smartphone, open the same existing chat in ChatGPT in a browser or in the web app saved by your browser. This works during the 24 hours for which your learning session is valid.',
        'This is useful, for example, when you are learning on a computer and then want to upload a photo of your work with the phone camera. Do not open the chat in the native ChatGPT app for this.',
      ],
    },
    {
      id: 'session-duration',
      question: 'How long can I use a SkillPilot chat?',
      paragraphs: [
        'A learning session created through “Start Learning” is valid for 24 hours. After that, you can still read the old chat, but SkillPilot can no longer reliably access your current learning record there.',
        'Select “Start Learning” in SkillPilot again and begin a new chat. Do not share the prepared start message or your learning chat with other people.',
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
        'Crop out or cover names, addresses, and other personal information first. Do not upload report cards, passwords, or confidential documents.',
        'If the chat is running on your computer, open that exact chat during the valid learning session on your smartphone in a browser or browser web app and upload the photo there. A larger screen may then be more comfortable again for longer text, formulas, and visualizations.',
      ],
    },
    {
      id: 'ask-to-improve',
      question: 'What should I do if I cannot read or understand something?',
      paragraphs: [
        'Tell the coach directly in the chat. It will rewrite the passage – differently worded, simpler, more detailed, or with an example. Asking is part of learning and does not count as a wrong answer.',
        'This applies to anything that slows you down: a formula that displays oddly, a technical term you do not know yet, a sentence that is too complicated, or a step that went too fast.',
      ],
      bullets: [
        '“That formula is not displaying properly for me. Please write it again.”',
        '“I do not know the word … . Please explain it more simply.”',
        '“I did not follow that step. Please explain it again, more slowly.”',
        '“Please show me a simple example with numbers.”',
        '“Please restate the task without technical terms.”',
      ],
    },
    {
      id: 'formula-looks-broken',
      question: 'A formula shows up as odd text with characters like \\[ or \\cdot. What does that mean?',
      paragraphs: [
        'This is usually a display problem in the chat. Formulas are sent in a notation that ChatGPT normally turns into typeset mathematics, and here that conversion did not work correctly.',
        'You do not need to decipher it, and you did nothing wrong. Ask the coach to write the formula again as running text or step by step. Then briefly compare whether the numbers, signs, and calculation steps stayed the same.',
        'If it happens repeatedly in the same chat, one sentence covers the rest of the session: “Please always write formulas as running text in this chat.”',
      ],
    },
    {
      id: 'disagree-with-coach',
      question: 'What if the coach says something wrong or explains it badly?',
      paragraphs: [
        'Push back. Say specifically what you think is wrong and why – the coach will then check that step again. Do not accept something just because it is confidently worded: a fluent explanation is no proof that it is correct.',
        'This matters most when your own solution is being judged. If your result is marked wrong and you believe it is right, show your working and say so. A different but equivalent approach is allowed – what counts is the substance of what you show, not the wording.',
        'Say it too when the problem is not the content but the teaching: too fast, too much at once, or a solution given away before you had a chance to think.',
        'Disagreeing with good reasons does not hurt your learning record. It shows the opposite – that you thought the step through.',
        'If the error persists, or the task itself is faulty, it is not a chat problem: write to support@skillpilot.com with the subject, the learning goal, and what was wrong.',
      ],
      bullets: [
        '“I think that is wrong, because …”',
        '“Please redo that calculation.”',
        '“I worked it out differently and get … . Please check whether my approach also holds.”',
        '“That is going too fast for me. Please use smaller steps.”',
        '“Please do not give away the solution yet, just a hint.”',
      ],
    },
    {
      id: 'native-app',
      question: 'Why do we currently not recommend the native ChatGPT app?',
      paragraphs: [
        'In the native ChatGPT app, SkillPilot images, card practice, and other learning views are not always displayed reliably yet.',
        'Use ChatGPT in a browser on a PC, Mac, tablet, or smartphone instead. That is where the learning features tested by SkillPilot are available.',
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
    text: 'The following pages answer questions about data processing and the Terms of Use. You can report technical problems to the SkillPilot team.',
    privacy: 'Privacy',
    legal: 'Terms of Use',
    contact: 'support@skillpilot.com',
  },
}

export const getFaqViewCopy = (language: LabelLanguage): FaqViewCopy => (
  language === 'en' ? englishCopy : germanCopy
)
