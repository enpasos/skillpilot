# The SkillPilot Learning Process

This document describes the end-to-end flow of how learning is organized and executed in SkillPilot, from static data to individual mastery.

## 1. Data Foundation: Curricula & Modules
The world of SkillPilot is built from **Curricula** (e.g., "Gymnasiale Oberstufe Hessen") and **Modules** (e.g., "Math Q1", "Physics Mechanics").
- **Storage:** These are stored as JSON files in the `curricula/` folder.
- **Structure:** They form a directed acyclic graph (DAG) of learning goals connected by `requires` edges.

## 2. The Learning Lifecycle

The learning process follows a strict sequence of personalization steps:

### Step 1: Base Curriculum Selection (Level 1)
Before learning starts, a **Base Curriculum** must be chosen.
- *Definition:* The complete set of all possible modules and goals defined by an authority.
- *Action:* The user selects "Gymnasiale Oberstufe" or "B.Sc. Physics".

### Step 2: Personal Curriculum (Level 2)
The learner selects the specific **Modules** relevant to their path.
- *Definition:* A subset of the Base Curriculum (e.g., specific electives or majors).
- *Action:* The learner chooses "Math (Advanced)", "Physics (Basic)", and omits "Latin".
- *Result:* This defines the personal "search space" for the frontier calculation.

### Step 3: Concrete Learning Goal (Level 3)
The learner sets a specific focus.
- *Definition:* A target goal or topic to work towards.
- *Default:* "All goals in the Personal Curriculum".
- *Action:* The learner says "I want to learn Analysis" or "I want to finish my Bachelor's".

### Step 4: The Frontier Loop (AI Assisted)
Learning happens along the **Frontier**.
- **The Frontier:** The set of goals where:
    1.  The goal itself is **not yet mastered**.
    2.  All direct `requires` (prerequisites) **are mastered**.
- **Process:**
    1.  **Calculate Frontier:** The system analyzes the graph and current mastery to find the "next best steps".
    2.  **AI Guidance:** An AI Tutor (ChatGPT) uses this frontier to suggest topics, explain concepts, and provide exercises.
    3.  **Reverse Traversal:** If a user wants a goal *not* on the frontier, the system traces back the `requires` chain to find the missing foundations.

### Step 5: Mastery & Feedback (Level 4)
Success is recorded as **Mastery**.
- **Action:** When a learner solves tasks correctly, the AI updates the mastery level (0.0 to 1.0) for that specific goal UUID.
- **Effect:**
    -   Mastering a goal satisfies the prerequisites for *other* goals.
    -   The **Frontier moves forward**, opening up new learning opportunities.
    -   The cycle repeats.
