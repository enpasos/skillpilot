// The durable install identity is independent of package SemVer and the runtime
// contract generation. Historical v1 packages and release records remain intact.
export const OPENAI_PLUGIN = Object.freeze({
  identity: "skillpilot-coach",
  displayName: "SkillPilot Coach",
  sourcePath: "ai/openai plugin/skillpilot-coach",
  skillPath: "skills/skillpilot-coach",
  candidatePath: "ai/openai candidates/skillpilot-coach",
  publicEndpoint: "https://mcp-openai.skillpilot.com/mcp",
});
