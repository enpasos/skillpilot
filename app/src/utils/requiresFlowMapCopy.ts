import type { LabelLanguage } from './filterLabels'

export interface RequiresFlowMapCopy {
  title: string
  subtitle: string
  direct: string
  inherited: string
  current: string
  unmet: string
  met: string
  unlocks: string
  unlocksInherited: string
  noIncoming: string
  noOutgoing: string
  plusMore: string
  nodeFilterLabel: string
  filterAll: string
  filterAtomic: string
  transitive: string
  requiresColumnTitle: string
  nextStepsColumnTitle: string
  fullFlowTitle: string
  fullFlowSubtitle: string
  fullFlowSummary: string
  fullFlowSummaryOpen: string
  fullFlowSummaryDone: string
  fullFlowNoPrereqs: string
  fullFlowLevel: string
}

export const getRequiresFlowMapCopy = (language: LabelLanguage): RequiresFlowMapCopy => (
  language === 'en'
    ? {
        title: 'Requires Flow',
        subtitle: 'Direct prerequisites and unlocked next goals around the current node.',
        direct: 'direct',
        inherited: 'inherited',
        current: 'current goal',
        unmet: 'open',
        met: 'met',
        unlocks: 'unlocks',
        unlocksInherited: 'unlocks (inherited)',
        noIncoming: 'No prerequisites in view',
        noOutgoing: 'No follow-up goals in view',
        plusMore: '+{{count}} more',
        nodeFilterLabel: 'node filter',
        filterAll: 'all',
        filterAtomic: 'atomic',
        transitive: 'transitive',
        requiresColumnTitle: 'Requires',
        nextStepsColumnTitle: 'Next Steps',
        fullFlowTitle: 'Full Prerequisite Flow',
        fullFlowSubtitle: 'All direct, inherited, and transitive prerequisites of the current goal as one flow.',
        fullFlowSummary: '{{nodes}} prerequisites · {{edges}} links',
        fullFlowSummaryOpen: '{{count}} prerequisites still open',
        fullFlowSummaryDone: 'all prerequisites are met',
        fullFlowNoPrereqs: 'No prerequisites in this flow',
        fullFlowLevel: 'Level {{level}}',
      }
    : {
        title: 'Requires-Flow',
        subtitle: 'Direkte/vererbte Voraussetzungen und nächste freischaltbare Ziele.',
        direct: 'direkt',
        inherited: 'vererbt',
        current: 'aktuelles Ziel',
        unmet: 'offen',
        met: 'erfüllt',
        unlocks: 'schaltet frei',
        unlocksInherited: 'schaltet frei (vererbt)',
        noIncoming: 'Keine Voraussetzungen im Fokus',
        noOutgoing: 'Keine Folgeziele im Fokus',
        plusMore: '+{{count}} weitere',
        nodeFilterLabel: 'Zielfilter',
        filterAll: 'alle',
        filterAtomic: 'nur atomare',
        transitive: 'transitiv',
        requiresColumnTitle: 'Voraussetzungen',
        nextStepsColumnTitle: 'Nächste Schritte',
        fullFlowTitle: 'Gesamtflow der Vorbedingungen',
        fullFlowSubtitle: 'Alle direkten, vererbten und transitiven Vorbedingungen des aktuellen Ziels als ein Flow.',
        fullFlowSummary: '{{nodes}} Vorbedingungen · {{edges}} Verknuepfungen',
        fullFlowSummaryOpen: '{{count}} Vorbedingungen noch offen',
        fullFlowSummaryDone: 'alle Vorbedingungen erfüllt',
        fullFlowNoPrereqs: 'Keine Vorbedingungen in diesem Flow',
        fullFlowLevel: 'Stufe {{level}}',
      }
)
