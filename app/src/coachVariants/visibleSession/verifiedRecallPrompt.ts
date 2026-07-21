import { normalizeVisibleSessionLanguage } from './config'

export const buildVisibleSessionVerifiedRecallInstruction = (
  language: string | undefined,
  batchSize: number,
): string => normalizeVisibleSessionLanguage(language) === 'en'
  ? `Use the SkillPilot Visible Session actions: call startVisibleVerifiedRecall with batchSize=${batchSize}, ask all returned prompts as one numbered batch including every visible card ID, let me answer without help, fetch expected answers only after I have submitted my answers, then save passed/failed for every card.`
  : `Nutze die Visible-Session-Actions von SkillPilot: Rufe startVisibleVerifiedRecall mit batchSize=${batchSize} auf, stelle alle zurückgegebenen Fragen als nummerierten Batch mit jeder sichtbaren Karten-ID, lass mich ohne Hilfe antworten, rufe die erwarteten Antworten erst nach meinen Antworten ab und speichere danach passed/failed für jede Karte.`
