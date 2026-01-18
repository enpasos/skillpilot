# Levels of Personalization

This document describes how SkillPilot narrows from a full curriculum to individual mastery in four levels.

## Level 1: Base Curriculum
The complete set of all possible modules, subjects, and learning objectives defined by the curriculum authority. This represents the full search space of what can be learned.
- Example: All available subjects in the Hessian upper secondary school (Math, Physics, History, Latin, etc.) or all modules in a Physics Bachelor's catalog.

### Curriculum Manifest (Root Curricula)
Only explicitly declared root curricula are selectable in the UI and valid for Champion registration. These are listed in `curricula/curriculum_manifest.json` with readable titles.

Example:
```json
{
  "curricula": [
    { "id": "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da", "title": "Gymnasiale Oberstufe (DE, HE, G9, Sekundarstufe II)" }
  ]
}
```

Rules:
- Each ID must exist as a landscape in `curricula/`.
- IDs must not be module landscapes or contained sub-landscapes.
- The manifest must match the computed set of root curricula; CI fails if it does not.

## Level 2: Personal Curriculum
A subset of the Base Curriculum selected for a specific learner. This accounts for choices allowed by the curriculum, such as electives or specializations.
- Example: A student chooses Physics and Math as advanced courses and History as a basic course, while omitting Latin.
- Purpose: Defines the specific requirements the learner must fulfill to achieve their qualification.

## Level 3: Concrete Learning Goal
The specific target the learner is currently working towards within their Personal Curriculum. This provides focus and direction.
- Example: Understand Newton's Laws of Motion or complete module PH0001.

## Level 4: Mastery
The record of the learner's progress. It tracks which learning goals have been achieved and to what degree.
- Purpose: Visualizes competence, identifies gaps, and adapts the learning path based on prior knowledge.
