import type { LabelLanguage } from './filterLabels'

export interface ChatLayoutCopy {
  newChat: string
  userLabel: string
  aiLabel: string
  sampleQuestion: string
  sampleAnswer: string
  messagePlaceholder: string
  footer: string
}

export const getChatLayoutCopy = (language: LabelLanguage): ChatLayoutCopy => (
  language === 'en'
    ? {
        newChat: 'New chat',
        userLabel: 'You',
        aiLabel: 'AI',
        sampleQuestion: 'How do I build an app like this?',
        sampleAnswer: 'By using Tailwind and semantic colors!',
        messagePlaceholder: 'Send a message...',
        footer: 'Free Research Preview. ChatGPT style clone.',
      }
    : {
        newChat: 'Neuer Chat',
        userLabel: 'Du',
        aiLabel: 'KI',
        sampleQuestion: 'Wie baue ich eine App wie diese?',
        sampleAnswer: 'Indem du Tailwind und semantische Farben nutzt!',
        messagePlaceholder: 'Nachricht senden...',
  footer: 'Kostenlose Forschungsvorschau. ChatGPT-ähnlicher Prototyp.',
      }
)
