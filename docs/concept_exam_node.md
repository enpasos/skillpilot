# Concept: ExamProblem Node Type

## 1. Overview
The `ExamProblem` is a new curriculum node type designed to represent complex, authentic assessment tasks (e.g., Abitur questions). Unlike standard learning goals which focus on skill acquisition, `ExamProblem` nodes focus on **application, evaluation, and diagnosis**.

## 2. Data Structure Proposal

Existing curriculum nodes are primarily "Goals". The new `ExamProblem` will augment the schema with specific fields for task presentation and automated evaluation.

### New JSON Fields

```json
{
  "id": "uuid",
  "type": "ExamProblem",  // Discriminator
  "title": "A1 (Analysis, Niveau 1)",
  "titleEn": "A1 (Calculus, Level 1)",
  
  // Task Content (Problem Statement)
  "taskContent": {
    "de": "Markdown string containing the problem description, LaTeX formulas ($...$), and image references (![Alt](path)).",
    "en": "Translated markdown..."
  },
  
  // Model Solution & Grading
  "solutionContent": {
     "de": "Markdown string with the model solution, expected steps, and grading breakdown.",
     "en": "..."
  },
  
  // Scoring configuration
  "scoring": {
    "maxPoints": 5,
    "passingPoints": 3,  // Threshold for "Mastered" status
    "steps": [
       { "id": "step1", "points": 2, "description": "Nullstellenansatz" },
       { "id": "step2", "points": 3, "description": "Extrema klassifiziert" }
    ]
  },

  // Skill Dependencies (for remediation)
  "requires": [
    "skill-id-1", // e.g., Solving Quadratic Equations
    "skill-id-2"  // e.g., Product Rule
  ],

  // Metadata
  "meta": {
    "domain": "Analysis",
    "level": "GK",
    "durationMinutes": 15
  }
}
```

## 3. Interaction Workflow (AI Chat)

The interaction follows a "Challenge-Evaluate-Feedback" loop.

### Phase 1: Presentation
1.  User selects the Exam Node.
2.  System acts as "Proctor".
3.  System displays **only** `taskContent` (rendered Markdown + Images).
4.  System prompts: *"Here is your task. Please solve it and submit your solution. You can type it, upload a photo, or explain your steps."*

### Phase 2: Submission & AI Evaluation
1.  User submits solution (Text/Image).
2.  **AI Instructions:**
    *   Compare User Submission vs. `solutionContent`.
    *   Identify which `scoring.steps` were achieved.
    *   Assign points for each step.
    *   **CRITICAL:** Be strict but fair. Logic errors cost points; calculation slips might be penalized less depending on context.
3.  AI generates an **Evaluation Report** (internal or presented?):
    *   Score: X / Max
    *   Feedback per step.

### Phase 3: Result & Remediation
1.  **Case A: Perfect/Passing Score**
    *   AI response: *"Excellent work. You achieved X/Y points. [Highlighted positive feedback]."*
    *   Node Status -> **Mastered**.
2.  **Case B: Low Score**
    *   AI response: *"You achieved X/Y points. Here is the correction: [Show Walkthrough based on solutionContent]."*
    *   **Diagnosis:** AI analyzes *why* points were lost.
    *   **Remediation:** AI checks the `requires` list.
        *   *"It seems you struggled with the Product Rule. I recommend reviewing [Link to Prereq Node]."*
    *   Node Status -> **In Progress / Failed**.

## 4. Implementation Steps

1.  **Schema Update:** Allow `taskContent`, `solutionContent`, `scoring` in JSON loader.
2.  **UI Update:** Ensure Markdown renderer handles the images referenced in these fields correctly.
3.  **Prompt Engineering:** Update System Prompt to handle `ExamProblem` nodes specifically (Trigger "Proctor Mode").
4.  **Content Migration:** Convert the provided `Klausurbeispiel2026_1` files into this JSON format.

## 5. Image Handling
Images (`image1.de.png`, etc.) should be stored in a dedicated distinct assets directory (e.g., `.../assets/abi/2026_1/`) and referenced relative to the content root or via absolute mapped paths.
