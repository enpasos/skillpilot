export interface StudentMapping {
  id: string // SkillPilot-ID (vom Backend)
  name: string // Klarname, nur lokal gespeichert
}

export interface TrainerClassCurriculumConfigEntry {
  selected: boolean
  filterId?: string
  durationModel?: string
  stage?: string
}

export type TrainerClassCurriculumConfig = Record<string, TrainerClassCurriculumConfigEntry>

export interface ClassSession {
  id: string
  name: string
  landscapeId: string
  activeFilter: string
  personalConfig?: TrainerClassCurriculumConfig
  rootLandscapeId?: string
  students: StudentMapping[]
  currentGoalId?: string
}
