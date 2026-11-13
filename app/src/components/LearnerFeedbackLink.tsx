import { MessageSquareText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { LEARNER_COCKPIT_GOAL_FEEDBACK_NAVIGATION_STATE } from '../utils/goalFeedbackReturnNavigation'

export const LearnerFeedbackLink = () => {
  const { language } = useLanguage()
  if (import.meta.env?.MODE === 'package-consumer') return null
  return <Link to="/lernziel-feedback" state={LEARNER_COCKPIT_GOAL_FEEDBACK_NAVIGATION_STATE}
    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-color px-4 py-2 text-sm font-semibold text-text-secondary hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:hover:text-violet-300">
    <MessageSquareText size={16} aria-hidden="true" />
    {language === 'en' ? 'Give feedback' : 'Feedback geben'}
  </Link>
}
