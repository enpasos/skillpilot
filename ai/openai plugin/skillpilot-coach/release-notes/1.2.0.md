# SkillPilot Coach 1.2.0

Private ChatGPT beta of the permanent `skillpilot-coach` plugin. It connects to
`https://mcp-openai.skillpilot.com/mcp` and uses the existing SkillPilot web start.

The coach follows the Claude learning workflow for understanding goals. It can
explain a new idea directly, use the published practice task, and save mastery
when independent evidence covers the goal. It follows the current unit, card
and assessment choices returned by the backend. Practice uses the private card
component. Verified Recall records each assessed card separately.

The matching adapter adds explicit assessment-route selection and technical
contract confirmation. A connection to an earlier backend only offers the
actions that backend actually supplies. The beta uses an installable private
package with the skill and its OAuth-protected MCP connection. Host acceptance
is recorded separately for each client and release.
