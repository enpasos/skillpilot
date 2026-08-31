export interface StudentMapping {
  id: string // SkillPilot-ID (Altklasse) oder opake serverseitige Membership-ID
  name: string // Klarname, nur lokal gespeichert
  accessMode?: 'learner-id' | 'teacher-membership'
}

export interface TrainerClassCurriculumConfigEntry {
  selected: boolean
  filterId?: string
  durationModel?: string
  stage?: string
}

export type TrainerClassCurriculumConfig = Record<string, TrainerClassCurriculumConfigEntry>

export interface LinkedSubjectContext {
  landscapeId: string
  title: string
  activeFilter: string
  personalConfig: TrainerClassCurriculumConfig
  rootLandscapeId?: string
}

export interface LinkedSupervision {
  workspaceId: string
  courseId: string
  memberId: string
  personalizationFingerprint?: string
  subjects: LinkedSubjectContext[]
}

export interface ClassSession {
  id: string
  name: string
  landscapeId: string
  activeFilter: string
  personalConfig?: TrainerClassCurriculumConfig
  rootLandscapeId?: string
  students: StudentMapping[]
  currentGoalId?: string
  source?: 'local-generated' | 'linked-supervision'
  linkedSupervision?: LinkedSupervision
}
