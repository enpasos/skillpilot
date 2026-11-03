import type { LabelLanguage } from './filterLabels'

export interface ThemeToggleCopy {
  switchToLightMode: string
  switchToDarkMode: string
}

export const getThemeToggleCopy = (language: LabelLanguage): ThemeToggleCopy => (
  language === 'en'
    ? {
        switchToLightMode: 'Switch to Light Mode',
        switchToDarkMode: 'Switch to Dark Mode',
      }
    : {
        switchToLightMode: 'Zum hellen Modus wechseln',
        switchToDarkMode: 'Zum dunklen Modus wechseln',
      }
)
