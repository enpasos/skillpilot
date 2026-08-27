import type { LabelLanguage } from './filterLabels'

export interface AudioPlayerCopy {
  notebookLabel: string
  subtitle: string
  aiVoiceNotice: string
  playLabel: string
  pauseLabel: string
  seekLabel: string
}

export const getAudioPlayerCopy = (language: LabelLanguage): AudioPlayerCopy => (
  language === 'en'
    ? {
        notebookLabel: 'Audio introduction',
        subtitle: 'The idea behind SkillPilot, explained in a compact audio format.',
        aiVoiceNotice: 'This audio introduction contains AI-generated voices.',
        playLabel: 'Play audio introduction',
        pauseLabel: 'Pause audio introduction',
        seekLabel: 'Audio playback position',
      }
    : {
        notebookLabel: 'Audio-Einführung',
        subtitle: 'Die Idee hinter SkillPilot kompakt als Audio erklärt.',
        aiVoiceNotice: 'Diese Audioeinführung enthält KI-erzeugte Stimmen.',
        playLabel: 'Audio-Einführung abspielen',
        pauseLabel: 'Audio-Einführung pausieren',
        seekLabel: 'Wiedergabeposition der Audio-Einführung',
      }
)
