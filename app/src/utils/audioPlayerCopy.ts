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
        notebookLabel: 'Deep Dive: SkillPilot Explained',
        subtitle: 'Generated with NotebookLM',
        playLabel: 'Play',
        pauseLabel: 'Pause',
      }
    : {
        notebookLabel: 'Deep Dive: SkillPilot erklärt',
        subtitle: 'Generiert mit NotebookLM',
        playLabel: 'Abspielen',
        pauseLabel: 'Pause',
      }
)
