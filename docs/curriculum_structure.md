# Curriculum Structure and Personalization Model

This document outlines the hierarchical structure of curricula within SkillPilot and the levels of personalization applied to them.

## Educational Path Example

We currently model an educational path consisting of three consecutive curricula:

1.  **Gymnasiale Oberstufe (Sekundarstufe II)**
    *   **Context:** Hessen, Germany
    *   **Authority:** Hessisches Kultusministerium
    *   **Qualification:** Abitur (General Higher Education Entrance Qualification)
    *   **Description:** Covers the upper secondary level education preparing students for university.

2.  **Bachelor of Science in Physics**
    *   **Context:** Bavaria, Germany
    *   **Institution:** Technische Universität München (TUM)
    *   **Qualification:** Bachelor of Science (B.Sc.)
    *   **Description:** Undergraduate degree program in Physics.

3.  **Master in Theoretical and Mathematical Physics (TMP)**
    *   **Context:** Bavaria, Germany
    *   **Institution:** Technische Universität München (TUM)
    *   **Qualification:** Master of Science (M.Sc.)
    *   **Description:** Specialized graduate degree program focusing on theoretical and mathematical physics.

**Path:** `Abitur -> B.Sc. Physics -> M.Sc. TMP`

## Levels of Personalization

SkillPilot structures the learning experience through four distinct levels, moving from a general framework to individual progress.

### Level 1: Base Curriculum  
The complete set of all possible modules, subjects, and learning objectives defined by the curriculum authority (e.g., ministry or university). This represents the "search space" of what *can* be learned.
*   *Example:* All available subjects in the Hessian upper secondary school (Math, Physics, History, Latin, etc.) or all modules in the Physics Bachelor's catalog.

### Level 2: Personal Curriculum  
A subset of the Base Curriculum selected for a specific learner. This accounts for choices allowed by the curriculum, such as electives, specializations, or major/minor combinations.
*   *Example:* A student chooses "Physics" and "Math" as advanced courses (Leistungskurse) and "History" as a basic course, while omitting "Latin".
*   *Purpose:* Defines the specific requirements the learner must fulfill to achieve their qualification.

### Level 3: Concrete Learning Goal  
The specific target the learner is currently working towards within their Personal Curriculum. This provides focus and direction.
*   *Example:* "Understand Newton's Laws of Motion" or "Complete Module PH0001".

### Level 4: Mastery  
The record of the learner's progress. It tracks which learning goals have been achieved and to what degree.
*   *Purpose:* Visualizes competence, identifies gaps, and adapts the learning path based on prior knowledge.

## Requires inheritance along `contains`

To keep prerequisite lists small and consistent, `requires` can be declared high in the `contains` hierarchy and inherited by all descendants:

- **Effective requires:** `effective_requires(goal) = direct_requires(goal) ∪ ⋃ direct_requires(ancestor)` for all ancestors reachable via `contains` (no sibling bleed-over). Frontier and reachability checks use effective requires.
- **When to set:** Place `requires` on the lowest cluster that applies uniformly to all children. Atomic goals typically have none unless they add a truly specific prerequisite.
- **Constraints:** The DAG property still holds; inherited edges must not create cycles. Deduplicate inherited prerequisites. If a child must *not* inherit a cluster prerequisite, either move that `requires` down to a more specific cluster or add an explicit exception cluster.
- **UX:** UIs should be able to surface “inherited prerequisites” separately from direct ones so teachers understand why an item is locked.
