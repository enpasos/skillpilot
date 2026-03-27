import type { LabelLanguage } from './filterLabels'

export interface LegalWaiverCopy {
  shortDisclaimer: string
  detailsPrefix: string
  detailsLinkLabel: string
  detailsSuffix: string
  acceptanceLabel: string
  confirmButton: string
}

export const getLegalWaiverCopy = (language: LabelLanguage): LegalWaiverCopy => (
  language === 'en'
    ? {
        shortDisclaimer: `
# Please confirm the following points to use SkillPilot:

* **Model nature**: I understand that the learning content and goals in SkillPilot are models and do not claim to be complete.
* **AI limits**: I understand that AI-based assessments can be incorrect and are not exam- or legally binding.
* **Data integrity**: I understand that user-provided information (e.g. about skills and learning progress) may be manipulated or inaccurate.
* **Availability**: I accept that the availability of the service is not guaranteed and that data may be lost.
* **Liability**: I use SkillPilot at my own risk; operator liability is excluded to the extent permitted by law.
`,
        detailsPrefix: 'You can find the full ',
        detailsLinkLabel: 'legal notice and disclaimer',
        detailsSuffix: ' here.',
        acceptanceLabel: 'I have read the notes and accept the disclaimer.',
        confirmButton: 'Confirm & Continue',
      }
    : {
        shortDisclaimer: `
# Bitte bestätigen Sie die folgenden Punkte, um SkillPilot zu nutzen:

* **Modellcharakter**: Mir ist bewusst, dass die Lerninhalte und Lernziele in SkillPilot Modelle sind und keinen Anspruch auf Vollständigkeit erheben.
* **KI-Grenzen**: Ich weiß, dass KI-Bewertungen fehlerhaft sein können und nicht prüfungs- oder rechtsverbindlich sind.
* **Datenintegrität**: Mir ist klar, dass Angaben von Nutzenden (z. B. zu Fähigkeiten und Lernfortschritten) manipuliert oder unzutreffend sein können.
* **Verfügbarkeit**: Ich akzeptiere, dass die Verfügbarkeit des Dienstes nicht garantiert ist und Daten verloren gehen können.
* **Haftung**: Ich nutze SkillPilot auf eigenes Risiko; eine Haftung des Betreibers ist im gesetzlich zulässigen Umfang ausgeschlossen.
`,
        detailsPrefix: 'Die ausführlichen ',
        detailsLinkLabel: 'Rechtlichen Hinweise und den Haftungsausschluss',
        detailsSuffix: ' finden Sie hier.',
        acceptanceLabel: 'Ich habe die Hinweise gelesen und akzeptiere den Haftungsausschluss.',
        confirmButton: 'Bestätigen & Fortfahren',
      }
)
