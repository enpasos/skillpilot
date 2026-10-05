import React from 'react'
import {createRoot} from 'react-dom/client'
import {GoalCard} from '../src/components/GoalCard'
import {LanguageProvider} from '../src/contexts/LanguageContext'
import '../src/index.css'
import binding from './goals.json'
const index=Number(new URLSearchParams(location.search).get('goal')??0)
const goal={...binding.goals[index],landscapeId:'08a43a1b-d97e-522c-9dfa-c950a493364e'}
createRoot(document.getElementById('root')!).render(<LanguageProvider><div id="native-review-card"><GoalCard goal={goal as any} masteryValue={0} showLearnerTools={true} readOnly={true} showDetails={false} useRawGoalTitles={true}/></div></LanguageProvider>)
