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
# Bitte bestätige kurz die Nutzungshinweise:

* **Modellcharakter**: Lerninhalte und Lernziele sind Modelle und nicht garantiert vollständig.
* **KI-Grenzen**: KI-Bewertungen können falsch sein und sind nicht prüfungs- oder rechtsverbindlich.
* **Datenintegrität**: Lernstände können durch falsche Eingaben unzutreffend sein.
* **Verfügbarkeit**: Der Dienst kann ausfallen; Daten können verloren gehen.
* **Haftung**: Die Nutzung erfolgt auf eigenes Risiko im gesetzlich zulässigen Umfang.
`,
        detailsPrefix: 'Die ausführlichen ',
        detailsLinkLabel: 'Rechtlichen Hinweise und den Haftungsausschluss',
        detailsSuffix: ' findest du hier.',
        acceptanceLabel: 'Ich habe die Hinweise gelesen und akzeptiere den Haftungsausschluss.',
        confirmButton: 'Bestätigen & Fortfahren',
      }
)
