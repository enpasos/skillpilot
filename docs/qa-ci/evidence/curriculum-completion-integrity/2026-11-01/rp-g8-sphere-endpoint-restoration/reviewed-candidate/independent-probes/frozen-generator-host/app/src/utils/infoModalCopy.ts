import type { LabelLanguage } from './filterLabels'

export interface InfoModalCopy {
  confirmButton: string
}

export const getInfoModalCopy = (language: LabelLanguage): InfoModalCopy => (
  language === 'en'
    ? {
        confirmButton: 'OK',
      }
    : {
        confirmButton: 'OK',
      }
)
