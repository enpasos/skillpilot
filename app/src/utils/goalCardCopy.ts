import type { LabelLanguage } from './filterLabels'

export interface GoalCardCopy {
  examTaskLabel: string
  solutionLabel: string
  projectedStructureBadge: string
  projectedStructureTitle: string
  projectedStructureDescription: string
  projectedStructureHint: string
  activeActionReveal: string
  activeActionSelect: string
  coursePageFallback: string
  curriculumSourceLabel: string
  learningMaterialLabel: string
  resourceFallback: string
  licenseLabel: string
  appliesToLabel: string
  helpfulResourcesLabel: string
  tagsLabel: string
  leitideenLabel: string
  kompetenzenLabel: string
  examplesLabel: string
  legacyReadOnlyNotice: string
  nextStepsLabel: string
  selectAsActiveGoalLabel: string
  progressInSectionLabel: string
  progressInStructureSectionLabel: string
  progressForGoalLabel: string
  sourceRationaleTooltip: string
  sourceRationaleTitle: string
  sourceRationalePathLabel: string
  sourceRationaleSourceHeading: string
  sourceRationaleDerivationHeading: string
  sourceRationaleMemHeading: string
  sourceRationaleOpenSource: string
  sourceRationaleNavigateTo: string
  sourceRationaleCompareEvidence: string
  sourceRationaleTechnicalExtraction: string
  sourceRationaleSourceCore: string
  sourceRationaleParentContext: string
  sourceRationaleSkillpilotGoal: string
  sourceRationaleMatch: string
  sourceRationaleMemOpenEndpoint: string
  sourceRationaleMemRunQuery: string
  sourceRationaleMemExpected: string
  sourceRationaleMemEvaluation: string
  sourceRationaleClose: string
  projectedProgramUnitKinds: Record<string, string>
}

export const getGoalCardCopy = (language: LabelLanguage): GoalCardCopy => (
  language === 'en'
    ? {
        examTaskLabel: 'Exam Task',
        solutionLabel: 'Sample Solution',
        projectedStructureBadge: 'Structure',
        projectedStructureTitle: 'Projected structure node',
        projectedStructureDescription: 'This node is generated at runtime from program units and goal placements. It groups content for navigation and progress, but it is not a standalone learning goal.',
        projectedStructureHint: 'You can use this node to navigate into the corresponding section, but not treat it like a directly plannable learning goal.',
        activeActionReveal: 'Jump to active goal',
        activeActionSelect: 'Select as active goal',
        coursePageFallback: 'Course page',
        curriculumSourceLabel: 'Curriculum source: ',
        learningMaterialLabel: 'Learning material: ',
        resourceFallback: 'Resource',
        licenseLabel: 'License: ',
        appliesToLabel: 'Applies to:',
        helpfulResourcesLabel: 'Helpful resources:',
        tagsLabel: 'Tags:',
        leitideenLabel: 'Guiding ideas:',
        kompetenzenLabel: 'Competencies:',
        examplesLabel: 'Examples:',
        legacyReadOnlyNotice: 'This legacy view is read-only. For active learning and status updates, please switch to Gymnasium (DE).',
        nextStepsLabel: 'Next Steps',
        selectAsActiveGoalLabel: 'Select as active goal',
        progressInSectionLabel: 'Progress in this section',
        progressInStructureSectionLabel: 'Progress in this structure section',
        progressForGoalLabel: 'Mastery for this learning goal',
        sourceRationaleTooltip: 'Show source rationale',
        sourceRationaleTitle: 'Source rationale',
        sourceRationalePathLabel: 'SkillPilot path',
        sourceRationaleSourceHeading: 'How to read the original source',
        sourceRationaleDerivationHeading: 'Why this becomes the learning goal',
        sourceRationaleMemHeading: 'MEM/FWU-SPARQL as alternate route',
        sourceRationaleOpenSource: 'Open the official source',
        sourceRationaleNavigateTo: 'Navigate to',
        sourceRationaleCompareEvidence: 'Compare the curriculum text with this reviewed source-near formulation',
        sourceRationaleTechnicalExtraction: 'Technical source extraction',
        sourceRationaleSourceCore: 'Reviewed source-near formulation of the relevant content',
        sourceRationaleParentContext: 'The excerpt appears in this wider official expectation',
        sourceRationaleSkillpilotGoal: 'SkillPilot turns this into the following assessable learning goal',
        sourceRationaleMatch: 'Review result',
        sourceRationaleMemOpenEndpoint: 'Open the SPARQL endpoint',
        sourceRationaleMemRunQuery: 'Run this query',
        sourceRationaleMemExpected: 'Expected result',
        sourceRationaleMemEvaluation: 'Evaluation',
        sourceRationaleClose: 'Close',
        projectedProgramUnitKinds: {
          stage: 'Stage',
          year: 'Year',
          phase: 'Phase',
          program: 'Program',
        },
      }
    : {
        examTaskLabel: 'Prüfungsaufgabe',
        solutionLabel: 'Musterlösung',
        projectedStructureBadge: 'Struktur',
        projectedStructureTitle: 'Projizierter Strukturknoten',
        projectedStructureDescription: 'Dieser Knoten wird zur Laufzeit aus programUnits und goalPlacements projiziert. Er gruppiert Inhalte für Navigation und Fortschritt, ist aber kein eigenständiges fachliches Lernziel.',
        projectedStructureHint: 'Du kannst diesen Knoten zum Navigieren in den entsprechenden Abschnitt nutzen, ihn aber nicht wie ein direkt planbares Lernziel behandeln.',
        activeActionReveal: 'Zum aktiven Lernziel springen',
        activeActionSelect: 'Als aktuelles Lernziel auswählen',
        coursePageFallback: 'Kursseite',
        curriculumSourceLabel: 'Curriculum-Quelle: ',
        learningMaterialLabel: 'Lernmaterial: ',
        resourceFallback: 'Quelle',
        licenseLabel: 'Lizenz: ',
        appliesToLabel: 'Gilt für:',
        helpfulResourcesLabel: 'Hilfreiche Quellen:',
        tagsLabel: 'Tags:',
        leitideenLabel: 'Leitideen:',
        kompetenzenLabel: 'Kompetenzen:',
        examplesLabel: 'Beispiele:',
        legacyReadOnlyNotice: 'Diese Legacy-Ansicht ist schreibgeschützt. Für aktives Lernen und Statusänderungen bitte auf Gymnasium (DE) umstellen.',
        nextStepsLabel: 'Nächste Schritte',
        selectAsActiveGoalLabel: 'Als aktuelles Ziel auswählen',
        progressInSectionLabel: 'Fortschritt in diesem Abschnitt',
        progressInStructureSectionLabel: 'Fortschritt in diesem Strukturabschnitt',
        progressForGoalLabel: 'Kompetenzstand für dieses Lernziel',
        sourceRationaleTooltip: 'Quellenbegründung anzeigen',
        sourceRationaleTitle: 'Quellenbegründung',
        sourceRationalePathLabel: 'SkillPilot-Pfad',
        sourceRationaleSourceHeading: 'So liest man die Originalquelle',
        sourceRationaleDerivationHeading: 'Warum daraus dieses Lernziel entsteht',
        sourceRationaleMemHeading: 'MEM/FWU-SPARQL als Alternativweg',
        sourceRationaleOpenSource: 'Offizielle Quelle öffnen',
        sourceRationaleNavigateTo: 'Zur Stelle navigieren',
        sourceRationaleCompareEvidence: 'Quellentext mit dieser geprüften quellennahen Formulierung vergleichen',
        sourceRationaleTechnicalExtraction: 'Technische Source-Extraction',
        sourceRationaleSourceCore: 'Geprüfte quellennahe Formulierung des fachlichen Kerns',
        sourceRationaleParentContext: 'Dieser Ausschnitt steht in diesem breiteren offiziellen Erwartungssatz',
        sourceRationaleSkillpilotGoal: 'SkillPilot formuliert daraus dieses prüfbare Lernziel',
        sourceRationaleMatch: 'Zuordnungsprüfung',
        sourceRationaleMemOpenEndpoint: 'SPARQL-Endpunkt öffnen',
        sourceRationaleMemRunQuery: 'Diese Abfrage ausführen',
        sourceRationaleMemExpected: 'Erwartetes Ergebnis',
        sourceRationaleMemEvaluation: 'Auswertung',
        sourceRationaleClose: 'Schließen',
        projectedProgramUnitKinds: {
          stage: 'Stufe',
          year: 'Jahrgang',
          phase: 'Phase',
          program: 'Programm',
        },
      }
)
