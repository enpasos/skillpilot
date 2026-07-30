import type { LabelLanguage } from './filterLabels'

export interface AudioPlayerCopy {
  notebookLabel: string
  subtitle: string
  aiVoiceNotice: string
  playLabel: string
  pauseLabel: string
}

export const getAudioPlayerCopy = (language: LabelLanguage): AudioPlayerCopy => (
  language === 'en'
    ? {
        notebookLabel: 'Listen to the SkillPilot Podcast',
        subtitle: 'The idea behind SkillPilot, explained briefly.',
        aiVoiceNotice: 'This audio introduction contains AI-generated voices.',
        playLabel: 'Play',
        pauseLabel: 'Pause',
      }
    : {
        notebookLabel: 'SkillPilot Podcast anhören',
        subtitle: 'Die Idee hinter SkillPilot kompakt erklärt.',
        aiVoiceNotice: 'Diese Audioeinführung enthält KI-erzeugte Stimmen.',
        playLabel: 'Abspielen',
        pauseLabel: 'Pause',
      }
)
