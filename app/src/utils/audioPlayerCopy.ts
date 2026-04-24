import type { LabelLanguage } from './filterLabels'

export interface AudioPlayerCopy {
  notebookLabel: string
  subtitle: string
  playLabel: string
  pauseLabel: string
}

export const getAudioPlayerCopy = (language: LabelLanguage): AudioPlayerCopy => (
  language === 'en'
    ? {
        notebookLabel: 'Listen to the SkillPilot Deep Dive',
        subtitle: 'Deep Dive, generated with NotebookLM',
        playLabel: 'Play',
        pauseLabel: 'Pause',
      }
    : {
        notebookLabel: 'SkillPilot Deep Dive anhören',
        subtitle: 'Deep Dive, generiert mit NotebookLM',
        playLabel: 'Abspielen',
        pauseLabel: 'Pause',
      }
)
