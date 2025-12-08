# Data Privacy and Storage Concept

## 1. Core Philosophy: "Privacy by Design" & "User Responsibility"
SkillPilot separates **identity** from **educational progress**. 
* The **Server** knows *what* was learned (linked to a random ID), but not *who* learned it.
* The **Local Client** (Teacher's Browser) knows *who* the students are, but stores this mapping only locally.
* The **AI Layer** acts as a processor. It knows the *skills* associated with an ID to provide tutoring, but it relies on the user to keep the conversation anonymous.

## 2. Data Partitioning

### A. Local Client (Browser / Local Storage)
**Status:** Trusted, Private, Persistent (via Backup)
This layer holds the Personal Identifiable Information (PII).

* **Teacher's Browser:**
    * **Class Rosters:** List of classes (e.g., "Physics 12 LK").
    * **Identity Mapping:** The link between a real name ("Anna Schmidt") and the SkillPilot ID (`0824a2e2-5981-447d-b6de-9a14d0929c21`).
    * **Session Configuration:** Active filters, selected landscapes.
* **Learner's Browser:**
    * **Session ID:** The `skillpilotId` stored in LocalStorage to resume sessions.
    * **Display Name:** A purely local display name (e.g., "Me") for UI friendliness, not synced to the backend.

### B. SkillPilot Server (Backend / Database)
**Status:** Pseudonymous, Centralized
This layer holds the educational data. It contains **zero PII**.

* **Entity: `Learner`**
    * `skillpilotId` (Primary Key, e.g., `0824a2e2-5981-447d-b6de-9a14d0929c21`).
    * No names, no emails, no passwords.
* **Entity: `Mastery`**
    * Mapping: `skillpilotId` + `goalId` -> `value` (0.0 to 1.0).
* **Entity: `PlannedGoal`**
    * List of `goalId`s marked as "focus" by a specific `skillpilotId`.
* **Static Data:**
    * Learning Landscapes (Curricula, Competence Definitions).

### C. LLM / AI Layer (e.g., ChatGPT)
**Status:** Stateless processor, "User Responsible"
The AI provider processes the conversation and tool outputs.

* **System-Provided Data (What the App sends):**
    * **SkillPilot-ID:** The pseudonymous token (e.g. `0824a2e2-5981-447d-b6de-9a14d0929c21`) allows the LLM to fetch/save progress.
    * **Competence Profile:** The specific skills and mastery levels of this ID (essential for the AI to adapt its teaching).
    * **Curriculum Content:** Definitions of learning goals ("Explain Quantum Mechanics").
* **User-Provided Data (Responsibility):**
    * **Conversation History:** The user chats freely with the AI.
    * **Responsibility Principle:** It is the **user's responsibility** not to share PII (real names, addresses, emails) in the chat. The system does not filter this input.
* **What the System NEVER sends:**
    * The "Real Name" stored in the Teacher's local browser.
    * Any metadata not strictly related to the curriculum or the `skillpilotId`.

---

## 3. Data Flow Scenarios

### Scenario: Onboarding a Class
1.  **Teacher** enters names ("Peter", "Paul") in the browser.
2.  **Browser** requests new IDs from **Server** (`POST /api/learners`).
3.  **Server** generates UUIDs (`0824a2e2-5981-447d-b6de-9a14d0929c21`, `97bfe5ee-abc6-4088-9f0a-ef63c7ba1068`) and saves them.
4.  **Browser** links "Peter" -> `0824a2e2-5981-447d-b6de-9a14d0929c21` locally.
5.  **Result:** Server has empty profiles. Browser has the key to unlock them.

### Scenario: Grading / Assessment
1.  **Teacher** selects "Peter" in the UI.
2.  **Browser** looks up ID `0824a2e2-5981-447d-b6de-9a14d0929c21`.
3.  **Browser** requests progress from **Server** (`GET /api/learners/0824a2e2-5981-447d-b6de-9a14d0929c21/mastery`).
4.  **Teacher** updates slider.
5.  **Browser** sends update to **Server** (`PUT /api/learners/0824a2e2-5981-447d-b6de-9a14d0929c21/mastery`).

### Scenario: AI Tutoring Session
1.  **Learner** provides `0824a2e2-5981-447d-b6de-9a14d0929c21` to the AI (or clicks a link containing it).
2.  **AI** calls `get_frontier(learnerId="0824a2e2-5981-447d-b6de-9a14d0929c21")`.
3.  **Server** returns: "Goal A: Mastered, Goal B: Ready".
4.  **AI** sees: "This user (0824a2e2-5981-447d-b6de-9a14d0929c21) knows A but needs B."
5.  **AI** generates a tutorial for Goal B.
6.  *Privacy Note:* The AI knows the *capabilities* of 0824a2e2-5981-447d-b6de-9a14d0929c21, but does not know that 0824a2e2-5981-447d-b6de-9a14d0929c21 is "Peter", unless Peter explicitly writes "My name is Peter" in the chat.

---

## 4. Backup & Recovery Strategy
Since the server does not know who the students are, the **Teacher is the single source of truth** for the identity mapping.

* **Export:** The Teacher must utilize the "Backup Data" feature in the dashboard regularly. This generates a JSON file containing the Class definitions and Student mappings.
* **Storage:** This file must be stored securely by the teacher (School Server, USB Drive).
* **Restore:** If browser data is cleared, the JSON file can be imported to restore the classroom view.