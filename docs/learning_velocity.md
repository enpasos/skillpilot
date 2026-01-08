# Learning Velocity

## Overview
Learning Velocity is a metric designed to track a learner's consistency and speed over time. By visualizing how many atomic learning goals are mastered each week, SkillPilot encourages a consistent learning habit ("Don't break the chain").

## Metric Definition
**Learning Velocity** is defined as the density of atomic learning achievements over time.

*   **Atomic Goals Only:** Only "leaf" nodes in the competence tree count directly. This prevents distortion from mastering large container goals that consist of many smaller parts.
*   **Threshold:** A goal is considered "mastered" for this metric when its mastery value reaches **0.9** (90%) or higher.
*   **Time Basis:** The visualization groups achievements by calendar week (ISO Week).

## Visualization
The Learning Velocity is visualized via a **Progress Popover** accessible from the Learner View header.

### Access
Click on the **"Mastered Goals"** statistic (the green number with a checkmark icon) in the top header bar of the Learning View.

### Components
1.  **Velocity Chart (Bar Chart):**
    *   Displays the number of goals mastered per week for the **last 8 weeks**.
    *   Helping learners visualize their recent intensity and spot gaps in their learning schedule.
2.  **Recent Achievements:**
    *   Lists the **5 most recently mastered goals** with their completion dates.
    *   Provides immediate confirmation of recent progress.

## Technical Implementation
*   **Data Source:** The backend tracks the `updatedAt` timestamp for every mastery entry.
*   **API:** The frontend fetches history data via `GET /api/ui/learners/{id}/history`.
*   **Privacy:** Timestamps are stored pseudonymously on the server alongside the mastery values.
