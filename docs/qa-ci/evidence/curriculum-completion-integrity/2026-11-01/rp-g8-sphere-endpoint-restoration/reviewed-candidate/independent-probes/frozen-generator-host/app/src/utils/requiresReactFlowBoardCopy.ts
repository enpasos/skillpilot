import type { LabelLanguage } from './filterLabels'

export interface RequiresReactFlowBoardCopy {
    computingLayout: string
    layoutLabel: string
    topToBottom: string
    leftToRight: string
    pdfExport: string
}

export const getRequiresReactFlowBoardCopy = (language: LabelLanguage): RequiresReactFlowBoardCopy => (
    language === 'en'
        ? {
            computingLayout: 'Computing layout...',
            layoutLabel: 'Layout',
            topToBottom: 'Top to bottom',
            leftToRight: 'Left to right',
            pdfExport: 'Export PDF',
        }
        : {
            computingLayout: 'Layout wird berechnet...',
            layoutLabel: 'Layout',
            topToBottom: 'Von oben nach unten',
            leftToRight: 'Von links nach rechts',
            pdfExport: 'PDF Export',
        }
)
