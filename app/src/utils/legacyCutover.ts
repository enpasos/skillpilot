import {
  COMPATIBILITY_ONLY_BAVARIA_GYMNASIUM_IDS,
  getBavariaLegacySubjectEnglishLabel,
  getBavariaLegacySubjectLabelByCurriculumId,
  LEGACY_HESSEN_GYMNASIUM_LOWER_IDS,
  LEGACY_HESSEN_GYMNASIUM_LOWER_MATH_ID,
  LEGACY_HESSEN_GYMNASIUM_LOWER_PHYSICS_ID,
  LEGACY_HESSEN_GYMNASIUM_LOWER_ROOT_ID,
  LEGACY_HESSEN_GYMNASIUM_LOWER_SUBJECTS,
  LEGACY_HESSEN_GYMNASIUM_UPPER_IDS,
  LEGACY_HESSEN_GYMNASIUM_UPPER_MATH_ID,
  LEGACY_HESSEN_GYMNASIUM_UPPER_PHYSICS_ID,
  LEGACY_HESSEN_GYMNASIUM_UPPER_ROOT_ID,
  LEGACY_HESSEN_GYMNASIUM_UPPER_SUBJECTS,
} from './curriculumDisplay'

export interface LegacyCutoverPreviewItem {
  label: string
  value: string
}

export type LegacyCutoverKind = 'none' | 'hessen-upper' | 'hessen-lower' | 'bavaria'

export interface LegacyRetirementGateCopy {
  title: string
  description: string
  cutoverLabel: string
  cutoverPendingLabel: string
  archiveLabel: string
  archivePendingLabel: string
}

export interface LegacyReadOnlyCopy {
  title: string
  activeGoalMessage: string
  planMessage: string
}

export interface LegacyErrorCopy {
  cutoverTitle: string
  cutoverCreateMessage: string
  cutoverSystemMessage: string
  archiveTitle: string
  archiveCreateMessage: string
  archiveSystemMessage: string
}

export interface LegacyUiCopy {
  setupButtonLabel: string
  cutoverSuccessTitle: string
  cutoverFallbackMessage: string
  archiveSuccessTitle: string
  archiveFallbackMessage: string
}

export type PersonalCurriculumSelectionConfig = Record<string, { selected: boolean; filterId?: string }>

export type HessenLowerSelection = {
  selectedIds: Set<string>
  retirementEligible: boolean
}

export interface LegacyCutoverUiState {
  kind: LegacyCutoverKind
  canCutover: boolean
  supportsCompatibilityArchive: boolean
  isCompatibilityAuditOnly: boolean
  shouldShowCompatibilityRetirementGate: boolean
  bannerLabel: string | null
  bannerDescription: string | null
  actionLabel: string | null
  actionPendingLabel: string | null
  cutoverSuccessMessage: string | null
  compatibilityArchiveActionLabel: string | null
  compatibilityArchivePendingLabel: string | null
  compatibilityArchiveSuccessMessage: string | null
  retirementGateCopy: LegacyRetirementGateCopy | null
  readOnlyCopy: LegacyReadOnlyCopy
  errorCopy: LegacyErrorCopy
  uiCopy: LegacyUiCopy
  migrationTitle: string | null
  migrationDescription: string | null
  migrationActionLabel: string | null
  previewItems: LegacyCutoverPreviewItem[]
}

interface HessenLowerSelectionInput {
  selectedCurriculum: string | null | undefined
  personalConfig: PersonalCurriculumSelectionConfig
  plannedGoalIds: string[]
  activeGoalId: string | null
  resolveGoalLandscapeId: (goalId: string) => string | undefined
}

interface HessenUpperPreviewInput {
  selectedCurriculum: string | null | undefined
  personalConfig: PersonalCurriculumSelectionConfig
  filterDisplay: string
}

interface LegacyCutoverCopyInput {
  kind: LegacyCutoverKind
  language: 'de' | 'en'
  bavariaSubject?: string | null
  bavariaSubjectEn?: string | null
  bavariaFilterDisplay: string
}

interface LegacyCutoverUiStateInput {
  selectedCurriculum: string | null | undefined
  language: 'de' | 'en'
  compatibilityRouteRetired: boolean
  personalConfig: PersonalCurriculumSelectionConfig
  lowerSelection: HessenLowerSelection
  bavariaFilterDisplay: string
  hessenFilterDisplay: string
}

const getCourseFilterLabel = (filterId?: string) => {
  if (filterId === 'LK') {
    return 'Leistungskurs'
  }
  if (filterId === 'ALL') {
    return 'Grund- und Leistungskurs'
  }
  return 'Grundkurs'
}

export const inferLegacyHessenLowerSelection = ({
  selectedCurriculum,
  personalConfig,
  plannedGoalIds,
  activeGoalId,
  resolveGoalLandscapeId,
}: HessenLowerSelectionInput): HessenLowerSelection => {
  if (!selectedCurriculum || !LEGACY_HESSEN_GYMNASIUM_LOWER_IDS.has(selectedCurriculum)) {
    return {
      selectedIds: new Set(),
      retirementEligible: false,
    }
  }

  const goalBelongsToLandscape = (goalId: string | null | undefined, landscapeId: string) =>
    !!goalId && resolveGoalLandscapeId(goalId) === landscapeId

  const selectedIds = new Set<string>()
  if (selectedCurriculum === LEGACY_HESSEN_GYMNASIUM_LOWER_ROOT_ID) {
    LEGACY_HESSEN_GYMNASIUM_LOWER_SUBJECTS.forEach(({ id }) => {
      const isSelected = personalConfig[id]?.selected === true
        || plannedGoalIds.some((goalId) => goalBelongsToLandscape(goalId, id))
        || goalBelongsToLandscape(activeGoalId, id)
      if (isSelected) {
        selectedIds.add(id)
      }
    })
    if (selectedIds.size === 0) {
      LEGACY_HESSEN_GYMNASIUM_LOWER_SUBJECTS.forEach(({ id }) => selectedIds.add(id))
    }
  } else {
    selectedIds.add(selectedCurriculum)
  }

  if (selectedIds.has(LEGACY_HESSEN_GYMNASIUM_LOWER_PHYSICS_ID)) {
    selectedIds.add(LEGACY_HESSEN_GYMNASIUM_LOWER_MATH_ID)
  }

  return {
    selectedIds,
    retirementEligible: selectedIds.size > 0,
  }
}

export const buildBavariaLegacyPreviewItems = (
  subject: string,
  filterDisplay: string,
): LegacyCutoverPreviewItem[] => [
  { label: 'Quelle', value: `Bayern Gymnasium ${subject}` },
  { label: 'Ziel', value: 'Gymnasium (DE)' },
  { label: 'Filter', value: filterDisplay },
  { label: 'Fach', value: subject },
]

export const buildLegacyHessenLowerPreviewItems = (
  selection: HessenLowerSelection,
): LegacyCutoverPreviewItem[] => {
  const selectedSubjects = LEGACY_HESSEN_GYMNASIUM_LOWER_SUBJECTS
    .filter(({ id }) => selection.selectedIds.has(id))
    .map(({ label }) => label)
    .join(', ')

  return [
    { label: 'Quelle', value: 'Hessen Sek I' },
    { label: 'Ziel', value: 'Gymnasium (DE)' },
    { label: 'Faecher', value: selectedSubjects || 'Mathematik, Physik, Chemie, Biologie, Französisch' },
  ]
}

export const buildLegacyHessenUpperPreviewItems = ({
  selectedCurriculum,
  personalConfig,
  filterDisplay,
}: HessenUpperPreviewInput): LegacyCutoverPreviewItem[] => {
  if (!selectedCurriculum || !LEGACY_HESSEN_GYMNASIUM_UPPER_IDS.has(selectedCurriculum)) {
    return []
  }

  const directlySelectedUpperIds = new Set<string>()
  if (selectedCurriculum === LEGACY_HESSEN_GYMNASIUM_UPPER_ROOT_ID) {
    LEGACY_HESSEN_GYMNASIUM_UPPER_SUBJECTS.forEach(({ id }) => {
      if (personalConfig[id]?.selected === true) {
        directlySelectedUpperIds.add(id)
      }
    })
    if (directlySelectedUpperIds.size === 0) {
      LEGACY_HESSEN_GYMNASIUM_UPPER_SUBJECTS.forEach(({ id }) => directlySelectedUpperIds.add(id))
    }
  } else {
    directlySelectedUpperIds.add(selectedCurriculum)
  }

  const physicsSelected = directlySelectedUpperIds.has(LEGACY_HESSEN_GYMNASIUM_UPPER_PHYSICS_ID)
  const mathWasImplicitlyAdded = physicsSelected && !directlySelectedUpperIds.has(LEGACY_HESSEN_GYMNASIUM_UPPER_MATH_ID)
  const effectiveSelectedUpperIds = new Set(directlySelectedUpperIds)
  if (physicsSelected) {
    effectiveSelectedUpperIds.add(LEGACY_HESSEN_GYMNASIUM_UPPER_MATH_ID)
  }

  const items: LegacyCutoverPreviewItem[] = [
    { label: 'Bundesland', value: `${filterDisplay} -> Gymnasium (DE)` },
  ]

  LEGACY_HESSEN_GYMNASIUM_UPPER_SUBJECTS.forEach(({ id, label }) => {
    if (!effectiveSelectedUpperIds.has(id)) {
      return
    }
    items.push({
      label,
      value: id === LEGACY_HESSEN_GYMNASIUM_UPPER_MATH_ID && mathWasImplicitlyAdded
        ? `${getCourseFilterLabel(personalConfig[id]?.filterId)} (als Voraussetzung)`
        : getCourseFilterLabel(personalConfig[id]?.filterId),
    })
  })

  return items
}

export const getLegacyCutoverBannerLabel = ({
  kind,
  language,
}: LegacyCutoverCopyInput): string | null => {
  if (kind === 'none') {
    return null
  }
  if (kind === 'bavaria') {
    return language === 'de' ? 'Bayern-Lernstand erkannt' : 'Bavaria learner state detected'
  }
  return language === 'de' ? 'Hessen-Lernstand erkannt' : 'Hesse learner state detected'
}

export const getLegacyCutoverBannerDescription = ({
  kind,
  language,
  bavariaSubject,
  bavariaSubjectEn,
  bavariaFilterDisplay,
}: LegacyCutoverCopyInput): string | null => {
  if (kind === 'none') {
    return null
  }
  if (kind === 'hessen-upper') {
    return language === 'de'
      ? 'Diese Hessen-Lernspur bleibt als eingefrorenes Kompatibilitaetsarchiv exportierbar. Fuer die gemeinsame DE-Struktur kannst du jetzt direkt auf Gymnasium (DE) umstellen, ohne deinen bisherigen Mastery-Verlauf zu verlieren.'
      : 'This Hesse learner trail remains exportable as a frozen compatibility archive. You can now move directly to Gymnasium (DE) without losing your existing mastery history.'
  }
  if (kind === 'bavaria') {
    return language === 'de'
      ? `Diese Bayern-${bavariaSubject ?? 'Mathematik'}-Lernspur laeuft jetzt als schreibgeschuetzte Legacy-Ansicht. Fuer die gemeinsame DE-Struktur kannst du direkt auf Gymnasium (DE) mit Filter ${bavariaFilterDisplay} umstellen, ohne deinen bisherigen Mastery-Verlauf zu verlieren.`
      : `This Bavaria ${bavariaSubjectEn ?? 'chemistry'} learner trail now runs as a read-only legacy view. You can move directly to Gymnasium (DE) with the ${bavariaFilterDisplay} filter without losing your existing mastery history.`
  }
  return language === 'de'
    ? 'Diese Hessen-Sek-I-Lernspur laeuft jetzt als schreibgeschuetzte Legacy-Ansicht. Fuer die gemeinsame DE-Struktur kannst du direkt auf Gymnasium (DE) umstellen, ohne deinen bisherigen Mastery-Verlauf zu verlieren.'
    : 'This Hesse lower-secondary learner trail now runs as a read-only legacy view. You can move directly to Gymnasium (DE) without losing your existing mastery history.'
}

export const getLegacyCutoverActionLabel = ({
  kind,
  language,
  bavariaFilterDisplay,
}: LegacyCutoverCopyInput): string | null => {
  if (kind === 'none') {
    return null
  }
  if (kind === 'bavaria') {
    return language === 'de'
      ? `Auf Gymnasium (DE) mit ${bavariaFilterDisplay} umstellen`
      : `Migrate to Gymnasium (DE) with ${bavariaFilterDisplay}`
  }
  return language === 'de' ? 'Auf Gymnasium (DE) umstellen' : 'Migrate to Gymnasium (DE)'
}

export const getLegacyCutoverActionPendingLabel = ({
  kind,
  language,
}: LegacyCutoverCopyInput): string | null => {
  if (kind === 'none') {
    return null
  }
  return language === 'de' ? 'Stelle um...' : 'Migrating...'
}

export const getLegacyCompatibilityArchiveActionLabel = ({
  kind,
  language,
}: LegacyCutoverCopyInput): string | null => {
  if (kind === 'none') {
    return null
  }
  return language === 'de' ? 'Archiv herunterladen' : 'Download archive'
}

export const getLegacyCompatibilityArchivePendingLabel = ({
  kind,
  language,
}: LegacyCutoverCopyInput): string | null => {
  if (kind === 'none') {
    return null
  }
  return language === 'de' ? 'Erstelle Archiv...' : 'Creating archive...'
}

export const getLegacyCutoverSuccessMessage = ({
  kind,
  language,
  bavariaSubject,
  bavariaSubjectEn,
}: LegacyCutoverCopyInput): string | null => {
  if (kind === 'none') {
    return null
  }
  if (kind === 'hessen-upper') {
    return language === 'de'
      ? 'Dein Lernstand wurde auf Gymnasium (DE) umgestellt. Hessen bleibt als Kompatibilitaetsansicht erhalten, dein Mastery-Verlauf wird aber jetzt auf der gemeinsamen DE-Struktur weiter genutzt.'
      : 'Your learner state has been migrated to Gymnasium (DE). Hesse remains available as a compatibility view while your mastery history continues on the shared DE structure.'
  }
  if (kind === 'bavaria') {
    return language === 'de'
      ? `Dein Lernstand wurde auf Gymnasium (DE) umgestellt. Bayern-${bavariaSubject ?? 'Mathematik'} bleibt als Legacy-Ansicht erhalten, dein Mastery-Verlauf wird aber jetzt auf der gemeinsamen DE-Struktur weiter genutzt.`
      : `Your learner state has been migrated to Gymnasium (DE). Bavaria ${bavariaSubjectEn ?? 'mathematics'} remains available as a legacy view while your mastery history continues on the shared DE structure.`
  }
  return language === 'de'
    ? 'Dein Lernstand wurde auf Gymnasium (DE) umgestellt. Hessen Sek I bleibt als Legacy-Ansicht erhalten, dein Mastery-Verlauf wird aber jetzt auf der gemeinsamen DE-Struktur weiter genutzt.'
    : 'Your learner state has been migrated to Gymnasium (DE). Hesse lower secondary remains available as a legacy view while your mastery history continues on the shared DE structure.'
}

export const getLegacyCompatibilityArchiveSuccessMessage = ({
  kind,
  language,
  bavariaSubject,
  bavariaSubjectEn,
}: LegacyCutoverCopyInput): string | null => {
  if (kind === 'none') {
    return null
  }
  if (kind === 'hessen-upper') {
    return language === 'de'
      ? 'Die eingefrorene Hessen-Kompatibilitaetsansicht wurde als Archiv exportiert.'
      : 'The frozen Hesse compatibility view was exported as an archive.'
  }
  if (kind === 'bavaria') {
    return language === 'de'
      ? `Die eingefrorene Bayern-${bavariaSubject ?? 'Mathematik'}-Legacy-Ansicht wurde als Archiv exportiert.`
      : `The frozen Bavaria ${bavariaSubjectEn ?? 'mathematics'} legacy view was exported as an archive.`
  }
  return language === 'de'
    ? 'Die eingefrorene Hessen-Sek-I-Legacy-Ansicht wurde als Archiv exportiert.'
    : 'The frozen Hesse lower-secondary legacy view was exported as an archive.'
}

export const getLegacyRetirementGateCopy = ({
  kind,
  language,
}: LegacyCutoverCopyInput): LegacyRetirementGateCopy | null => {
  if (kind !== 'hessen-upper') {
    return null
  }
  return language === 'de'
    ? {
      title: 'Normale Hessen-Route beendet',
      description: 'Diese Learner-Session wird nicht mehr als normale Arbeitsansicht ausgeliefert. Bitte stelle jetzt auf Gymnasium (DE) um oder lade das eingefrorene Hessen-Archiv fuer Audit- und Nachweiszwecke herunter.',
      cutoverLabel: 'Jetzt auf Gymnasium (DE) umstellen',
      cutoverPendingLabel: 'Stelle um...',
      archiveLabel: 'Archiv herunterladen',
      archivePendingLabel: 'Erstelle Archiv...',
    }
    : {
      title: 'Normal Hesse route retired',
      description: 'This learner session is no longer served as a normal working route. Please migrate to Gymnasium (DE) now or download the frozen Hesse archive for audit and record-keeping.',
      cutoverLabel: 'Migrate to Gymnasium (DE) now',
      cutoverPendingLabel: 'Migrating...',
      archiveLabel: 'Download archive',
      archivePendingLabel: 'Creating archive...',
    }
}

export const getLegacyReadOnlyCopy = ({
  language,
}: LegacyCutoverCopyInput): LegacyReadOnlyCopy => {
  return language === 'de'
    ? {
      title: 'Nur Lesemodus',
      activeGoalMessage: 'In dieser Legacy-Ansicht koennen keine neuen aktiven Lernziele gesetzt werden. Bitte auf Gymnasium (DE) umstellen.',
      planMessage: 'Der Lernfokus kann in dieser Legacy-Ansicht nicht mehr veraendert werden. Bitte auf Gymnasium (DE) umstellen.',
    }
    : {
      title: 'Read-only mode',
      activeGoalMessage: 'You cannot set new active goals in this legacy view. Please migrate to Gymnasium (DE).',
      planMessage: 'Planned-goal changes are disabled in this legacy view. Please migrate to Gymnasium (DE).',
    }
}

export const getLegacyErrorCopy = ({
  language,
}: LegacyCutoverCopyInput): LegacyErrorCopy => {
  return language === 'de'
    ? {
      cutoverTitle: 'Umstellung fehlgeschlagen',
      cutoverCreateMessage: 'Die Umstellung auf Gymnasium (DE) konnte nicht durchgeführt werden.',
      cutoverSystemMessage: 'Während der Umstellung ist ein Netzwerk- oder Systemfehler aufgetreten.',
      archiveTitle: 'Archivexport fehlgeschlagen',
      archiveCreateMessage: 'Das Kompatibilitaetsarchiv konnte nicht erstellt werden.',
      archiveSystemMessage: 'Waehrend des Archivexports ist ein Netzwerk- oder Systemfehler aufgetreten.',
    }
    : {
      cutoverTitle: 'Migration failed',
      cutoverCreateMessage: 'Could not migrate to Gymnasium (DE).',
      cutoverSystemMessage: 'A network or system error occurred during migration.',
      archiveTitle: 'Archive export failed',
      archiveCreateMessage: 'Could not create the compatibility archive.',
      archiveSystemMessage: 'A network or system error occurred during archive export.',
    }
}

export const getLegacyUiCopy = ({
  language,
}: LegacyCutoverCopyInput): LegacyUiCopy => {
  return language === 'de'
    ? {
      setupButtonLabel: 'Migration',
      cutoverSuccessTitle: 'Umstellung abgeschlossen',
      cutoverFallbackMessage: 'Dein Lernstand wurde auf Gymnasium (DE) umgestellt.',
      archiveSuccessTitle: 'Archiv erstellt',
      archiveFallbackMessage: 'Das Legacy-Archiv wurde exportiert.',
    }
    : {
      setupButtonLabel: 'Migration',
      cutoverSuccessTitle: 'Migration complete',
      cutoverFallbackMessage: 'Your learner state has been migrated to Gymnasium (DE).',
      archiveSuccessTitle: 'Archive created',
      archiveFallbackMessage: 'The legacy archive was exported.',
    }
}

export const getLegacyCutoverMigrationTitle = ({
  kind,
  language,
}: LegacyCutoverCopyInput): string | null => {
  if (kind === 'none') {
    return null
  }
  return language === 'de' ? 'Auf Gymnasium (DE) umstellen' : 'Migrate to Gymnasium (DE)'
}

export const getLegacyCutoverMigrationActionLabel = ({
  kind,
  language,
}: LegacyCutoverCopyInput): string | null => {
  if (kind === 'none') {
    return null
  }
  return language === 'de' ? 'Jetzt umstellen' : 'Migrate now'
}

export const getLegacyCutoverMigrationDescription = ({
  kind,
  language,
  bavariaSubject,
  bavariaSubjectEn,
  bavariaFilterDisplay,
}: LegacyCutoverCopyInput): string | null => {
  if (kind === 'none') {
    return null
  }
  if (kind === 'hessen-upper') {
    return language === 'de'
      ? 'Dein bisheriger Hessen-Lernstand bleibt erhalten und wird auf die gemeinsame DE-Struktur übernommen. Mathe, Physik, Chemie, Biologie, Informatik, Geschichte, Deutsch, Politik und Wirtschaft, Englisch, Französisch, Latein, Spanisch, Italienisch, Russisch, Polnisch, Tschechisch, Griechisch, Chinesisch, Musik und Wirtschaftswissenschaften laufen danach unter einem gemeinsamen Gymnasium-Root weiter.'
      : 'Your existing Hesse learner state will be preserved and transferred to the shared DE structure. Mathematics, physics, chemistry, biology, computer science, history, German, politics and economics, English, French, Latin, Spanish, Italian, Russian, Polish, Czech, Greek, Chinese, music, and business studies will then continue there under one shared Gymnasium root.'
  }
  if (kind === 'bavaria') {
    return language === 'de'
      ? `Dein bisheriger Bayern-${bavariaSubject ?? 'Mathematik'}-Lernstand bleibt erhalten und wird auf die gemeinsame DE-Struktur übernommen. ${bavariaSubject ?? 'Mathematik'} laufen danach unter dem gemeinsamen Gymnasium-Root mit Filter ${bavariaFilterDisplay} weiter.`
      : `Your existing Bavaria ${bavariaSubjectEn ?? 'mathematics'} learner state will be preserved and transferred to the shared DE structure. The subject will then continue under the shared Gymnasium root with the ${bavariaFilterDisplay} filter.`
  }
  return language === 'de'
    ? 'Dein bisheriger Hessen-Sek-I-Lernstand bleibt erhalten und wird auf die gemeinsame DE-Struktur übernommen. Mathe, Physik, Chemie, Biologie und Französisch laufen danach unter einem gemeinsamen Gymnasium-Root weiter.'
    : 'Your existing Hesse lower-secondary learner state will be preserved and transferred to the shared DE structure. Mathematics, physics, chemistry, biology, and French will then continue there under one shared Gymnasium root.'
}

export const buildLegacyCutoverUiState = ({
  selectedCurriculum,
  language,
  compatibilityRouteRetired,
  personalConfig,
  lowerSelection,
  bavariaFilterDisplay,
  hessenFilterDisplay,
}: LegacyCutoverUiStateInput): LegacyCutoverUiState => {
  const isUpperLegacyHessenSession = !!selectedCurriculum && LEGACY_HESSEN_GYMNASIUM_UPPER_IDS.has(selectedCurriculum)
  const bavariaSubject = getBavariaLegacySubjectLabelByCurriculumId(selectedCurriculum)
  const bavariaSubjectEn = getBavariaLegacySubjectEnglishLabel(bavariaSubject)
  const isBavariaLegacyRetirementOnly = !!selectedCurriculum
    && COMPATIBILITY_ONLY_BAVARIA_GYMNASIUM_IDS.has(selectedCurriculum)
    && bavariaSubject !== null
  const isLowerLegacyRetirementOnly = lowerSelection.retirementEligible
  const kind: LegacyCutoverKind = isUpperLegacyHessenSession
    ? 'hessen-upper'
    : isBavariaLegacyRetirementOnly
      ? 'bavaria'
      : isLowerLegacyRetirementOnly
        ? 'hessen-lower'
        : 'none'
  const canCutover = kind !== 'none'

  let previewItems: LegacyCutoverPreviewItem[] = []
  if (kind === 'bavaria' && bavariaSubject !== null) {
    previewItems = buildBavariaLegacyPreviewItems(bavariaSubject, bavariaFilterDisplay)
  } else if (kind === 'hessen-lower') {
    previewItems = buildLegacyHessenLowerPreviewItems(lowerSelection)
  } else if (kind === 'hessen-upper') {
    previewItems = buildLegacyHessenUpperPreviewItems({
      selectedCurriculum,
      personalConfig,
      filterDisplay: hessenFilterDisplay,
    })
  }

  return {
    kind,
    canCutover,
    supportsCompatibilityArchive: kind === 'hessen-upper',
    isCompatibilityAuditOnly: canCutover,
    shouldShowCompatibilityRetirementGate: compatibilityRouteRetired && kind === 'hessen-upper',
    bannerLabel: getLegacyCutoverBannerLabel({
      kind,
      language,
      bavariaFilterDisplay,
    }),
    bannerDescription: getLegacyCutoverBannerDescription({
      kind,
      language,
      bavariaSubject,
      bavariaSubjectEn,
      bavariaFilterDisplay,
    }),
    actionLabel: getLegacyCutoverActionLabel({
      kind,
      language,
      bavariaFilterDisplay,
    }),
    actionPendingLabel: getLegacyCutoverActionPendingLabel({
      kind,
      language,
      bavariaFilterDisplay,
    }),
    cutoverSuccessMessage: getLegacyCutoverSuccessMessage({
      kind,
      language,
      bavariaSubject,
      bavariaSubjectEn,
      bavariaFilterDisplay,
    }),
    compatibilityArchiveActionLabel: getLegacyCompatibilityArchiveActionLabel({
      kind,
      language,
      bavariaFilterDisplay,
    }),
    compatibilityArchivePendingLabel: getLegacyCompatibilityArchivePendingLabel({
      kind,
      language,
      bavariaFilterDisplay,
    }),
    compatibilityArchiveSuccessMessage: getLegacyCompatibilityArchiveSuccessMessage({
      kind,
      language,
      bavariaSubject,
      bavariaSubjectEn,
      bavariaFilterDisplay,
    }),
    retirementGateCopy: getLegacyRetirementGateCopy({
      kind,
      language,
      bavariaFilterDisplay,
    }),
    readOnlyCopy: getLegacyReadOnlyCopy({
      kind,
      language,
      bavariaFilterDisplay,
    }),
    errorCopy: getLegacyErrorCopy({
      kind,
      language,
      bavariaFilterDisplay,
    }),
    uiCopy: getLegacyUiCopy({
      kind,
      language,
      bavariaFilterDisplay,
    }),
    migrationTitle: getLegacyCutoverMigrationTitle({
      kind,
      language,
      bavariaFilterDisplay,
    }),
    migrationDescription: getLegacyCutoverMigrationDescription({
      kind,
      language,
      bavariaSubject,
      bavariaSubjectEn,
      bavariaFilterDisplay,
    }),
    migrationActionLabel: getLegacyCutoverMigrationActionLabel({
      kind,
      language,
      bavariaFilterDisplay,
    }),
    previewItems,
  }
}
