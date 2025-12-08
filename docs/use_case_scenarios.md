# SkillPilot Usecase Scenarios

## Scenario 1: Context-Specific Onboarding via Deep Linking

**Actors:**
* **Hans Huber** (Trainer / Physics Teacher)
* **Peter, Franz, Simone** (Learners / Students in Grade 12 Advanced Physics Course)

**Goal:**
Enable students to start learning immediately within a specific context (Subject, Course Level, Topic) without navigating through the entire curriculum hierarchy or experiencing "cognitive overload" upon first login.

**Preconditions:**
* Hans has a SkillPilot Trainer account.
* The "Hessen Physics Upper Secondary" landscape is available in the system.

**Flow:**

1.  **Context Setup (Trainer):**
    * Hans logs into SkillPilot as a **Trainer**.
    * He selects the "Physics" landscape.
    * He sets the course level filter to **"LK" (Advanced Course)** to hide irrelevant basic course content.
    * He navigates through the competence tree to the current semester topic: **"Q3 Quantum Physics"**.
    * Satisfied with the view, Hans clicks the **"Share Context"** button in the breadcrumb bar.
    * System generates a URL containing the landscape ID, current goal ID, and active filter (e.g., `.../?l=hessen-physics&g=PHY_Q3&f=LK`).
    * Hans copies this link and shares it with his class via their messaging group.

2.  **Direct Entry (Learner):**
    * Peter clicks the link on his tablet.
    * **System Action:** SkillPilot launches. Instead of the generic "Select Subject" start screen, it immediately loads the Physics landscape.
    * **System Action:** The filter is automatically set to "LK". The Competence Tree automatically expands and scrolls to "Q3 Quantum Physics".
    * Peter sees exactly the topic Hans is talking about.
    * Since Peter has no session yet, he is prompted to enter his name ("Peter") or paste his existing SkillPilot ID.

3.  **Outcome:**
    * Upon starting, Peter is right in front of the "Quantum Physics" card.
    * He clicks the **"Star" (Plan Goal)** button to mark this topic as his current focus.
    * Peter is successfully onboarded and oriented within seconds, skipping all irrelevant navigation steps.