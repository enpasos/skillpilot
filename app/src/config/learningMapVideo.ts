import type { LabelLanguage } from '../utils/filterLabels'

export const learningMapVideoPaths = ['/learning-map', '/learning-map/de', '/learning-map/en']

const copy = {
  de: {
    title: 'Die Physik-Lernkarte',
    description: 'Folge dem Weg durch den hessischen G9-Leistungskurs von der Oberstufe bis zum freien Fall schwerer Kugeln.',
    eyebrow: 'Videorundgang · 1 Min.',
    back: 'Zur Startseite',
    open: 'Video in neuem Tab öffnen',
  },
  en: {
    title: 'The physics learning map',
    description: 'Follow an advanced physics course in Hesse from upper secondary school to the free fall of heavy balls. The tour uses the German map with English narration.',
    eyebrow: 'Video tour · 1 min',
    back: 'Back to the home page',
    open: 'Open video in a new tab',
  },
}

export function getLearningMapVideo(language: LabelLanguage) {
  const asset = `/media/learning-map/physics-he-g9-lk/${language}`
  return {
    ...copy[language],
    url: `${asset}.mp4`,
    poster: `${asset}.webp`,
    tracks: [{ src: `${asset}.vtt`, srcLang: language, label: language === 'de' ? 'Deutsch' : 'English', kind: 'subtitles' as const }],
  }
}
