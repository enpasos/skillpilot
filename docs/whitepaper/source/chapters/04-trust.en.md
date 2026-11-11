## Trust: Protecting Learning Data and Understanding Evidence {#sec:trust}

Anyone who entrusts their learning journey to a digital system should know which data goes where — and what the recorded evidence actually shows.

### Which Data Goes Where {#sec:data-flows}

The data used in the learning process serve different purposes and require different protections. SkillPilot separates **permanent pseudonymous identity**, the **short-lived learning session**, **authorization of the AI integration**, and **authoritative learning state**. The chat service receives the learning context it needs, not the permanent SkillPilot ID.

#### Pseudonym Instead of Identity

Learning progress is managed under a permanent **pseudonymous SkillPilot ID**. This does not require registering a name or email address with SkillPilot. The ID also serves as a secret access key to the learning profile: it should be backed up as a protected ID file and must not be shared in chats or public feedback. The coach integration does not send it to the AI provider. The chat service requires its own account, and its access conditions also apply.

#### A Separate Session for the Learning Chat

Starting the **SkillPilot Learning Coach** from the SkillPilot web app creates a new random `learningSessionId` with an absolute lifetime of 24 hours. It connects the prepared chat to the confirmed learning context without exposing the permanent SkillPilot ID. The learner does not need to copy or manage any technical value. Its lifetime is extended neither by use nor by an OAuth refresh. The session uses the German or English communication language set in the confirmed context. OAuth authorizes the integration; the learning session determines the learning context.

Learner-specific access **through the coach integration** requires both an admitted, authenticated integration and a valid learning session. App authorization alone does not grant access to learning progress; a learning session alone does not authorize the app to access it. The SkillPilot web app has separate access paths for configuration, navigation, and data management.

#### Dialogue Content Is Decoupled

The learning-coach dialogue stays with the respective AI provider. Answers, solution steps, and free-text assessment explanations are not sent to the SkillPilot backend through the coach tools. To track learning progress, SkillPilot processes structured completion decisions and, where applicable, authorized numerical exam scores.

Conversely, the provider receives the learning context it needs, such as the current goal, relevant progress, and tool results. **Separating the ID does not mean that no learning data reaches the AI provider.** Its terms govern chat and context processing. Explicitly submitted learning-goal feedback is a separate process, not an automatic import of chat content.

**Recommendation for educational institutions:** Set clear guidelines on which data should not be shared in learning-coach chats (sensitive personal information) and how to support learners safely.

#### Mapping Inside the Institution (Local)

The mapping “who is which pseudonym?” stays with the institution or teacher and is stored **locally**, for example in protected storage — not centrally.

#### Separate Access for Each AI Provider

Claude and ChatGPT have separate adapters with their own authentication and session boundaries. Each provider is responsible for operating the chat and processing the dialogue. The shared SkillPilot core remains responsible for the curriculum, learning state, and learning rules.

A technical integration alone does not establish suitability in terms of data protection or institutional requirements. Each integration is tested separately against the requirements for tool access, privacy, session separation, and reliable learning guidance.

### Backing Up Learning Progress: Integrity and Provenance Information {#sec:integrity-and-provenance}

Learners can export their profile, including learning progress and learning plans. The server protects the export against modification using **HMAC-SHA256** and verifies this protection on import. This is server-verifiable integrity protection, not a signature that can be independently verified using a public key.

On import, existing source profiles and import timestamps can be retained as **provenance information**. This is not a complete history of every assessment or state change, and it does not include the underlying learning dialogues.

**An unchanged export does not prove that every recorded assessment is correct in its subject.** It supports backup, transfer, and traceability; institutional recognition requires its own rules and, where appropriate, additional evidence.

---
