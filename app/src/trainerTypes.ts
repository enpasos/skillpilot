export interface StudentMapping {
  id: string // SkillPilot-ID (vom Backend)
  name: string // Klarname, nur lokal gespeichert
}

export interface ClassSession {
  id: string
  name: string
  landscapeId: string
  activeFilter: string
  students: StudentMapping[]
  currentGoalId?: string
}
