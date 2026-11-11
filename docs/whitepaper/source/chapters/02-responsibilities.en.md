## The Division of Responsibilities: AI Explains, SkillPilot Manages Learning State {#sec:responsibilities}

**The AI learning coach supports the dialogue; SkillPilot manages the learning path.** They have different responsibilities and work with the same learning goals.

Language-based AI can explain concepts, formulate tasks, discuss solutions, and respond to questions in natural language. In a learning dialogue, it offers different approaches to a topic and adapts explanations to the learner’s responses.

Reliable learning guidance also needs an authoritative foundation: which goals belong to the curriculum, which prerequisites are met, and which progress has been recorded? SkillPilot manages these facts and rules in the backend.

The learning coach accesses these **authoritative backend rules** through defined tools. SkillPilot calculates reachable learning goals and plan status, checks permitted state changes, and stores confirmed progress. Subject-specific assessment in the dialogue remains an AI judgment and can contain errors; technical validation of a state change is not independent proof that a solution is correct.

**Shared preparation, individual learning support:** The skill landscape is built before use, reviewed under defined quality procedures, and maintained continuously (section 5.1). Particularly capable AI systems can help with the demanding work of interpreting curricula. This reusable work benefits all learners. The AI used for the subsequent learning dialogue need not be the same; it must meet the subject-matter, pedagogical, and technical requirements for learning guidance.

The **plugin and adapter architecture decouples the subject-matter core from any particular AI provider**. Provider adapters expose tools through the **Model Context Protocol (MCP)**. A new AI integration must, among other things, load coach instructions, call tools reliably, handle authentication and learning sessions securely, and display the required images and learning cards. MCP standardizes tool access but does not guarantee these capabilities. Authoritative decisions about learning state, permissions, and navigation remain in the shared SkillPilot core; each specific integration is tested separately.

**The goal is freedom to choose among suitable AI environments.** In the future, this could include AI running locally on a learner’s own device, provided it has the required capabilities and a validated integration. Today’s Claude access is a concrete starting point, not a permanent architectural commitment to that provider. This does not imply that a local learning-coach integration is already available.

---
