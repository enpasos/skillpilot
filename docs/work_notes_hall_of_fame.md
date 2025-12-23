# Hall of Fame - Planning Notes

## Goals
- Add a public "Hall of Fame" page reachable from the landing page.
- Show per curriculum the top 3 learners by number of **atomic goals achieved**.
- Per learner row show:
  - first 5 characters of `skillpilotId`
  - number of atomic goals achieved
  - total number of atomic goals available in the curriculum
- Provide a curriculum filter; default to the curriculum with the highest **overall** achieved atomic goals.
- Non-functional: page data must be **precalculated and kept in memory**; precalculation must not reduce platform performance.

## Definitions
- Atomic goal = `LearningGoal` with `contains == null || contains.isEmpty()`.
- Achieved = mastery value `>= 0.9` (aligns with existing frontier/mastery logic).
- Curriculum for a learner = `Learner.selectedCurriculum` (ignore learners without a selected curriculum).

## Data Sources
- Learners: `LearnerRepository` (skillpilotId, selectedCurriculum).
- Mastery: `MasteryRepository` (goalKey, value, updatedAt).
- Curricula + goals: `LandscapeService` (`LearningLandscape` + `LearningGoal`).

## Precomputation & Cache (Performance Architecture)
- Maintain an immutable in-memory snapshot:
  - per curriculum: `totalAtomicGoals`, `totalMasteredAtomicGoals`, top-3 learners.
  - global: `defaultCurriculumId` (max overall mastered atomic goals).
- Store snapshot in `AtomicReference<HallOfFameSnapshot>` for lock-free reads.
- Refresh snapshot **asynchronously** in a low-priority background task:
  - triggered on startup
  - scheduled refresh (e.g., every 5–10 minutes)
  - optionally triggered after mastery updates, but on a separate thread to avoid blocking writes.
- **Do not** compute on request paths.
- Skip refresh if data unchanged:
  - compare `MAX(mastery.updatedAt)` with cached `lastComputedAt` (add repository query).
- Compute using streamed queries to minimize memory usage:
  - build `curriculumId -> Set<atomicGoalId>`
  - read mastered goals once, aggregate by learner/curriculum
  - handle mastery keys that might be shortKeys by mapping `shortKey -> goalId` (build map from landscapes).

## Backend API (UI)
- Add a UI endpoint returning the cached snapshot:
  - `GET /api/ui/hall-of-fame`
  - response: `curricula[]`, `defaultCurriculumId`, `lastUpdatedAt`
  - each curriculum entry: `curriculumId`, `title`, `totalAtomicGoals`, `totalMasteredAtomicGoals`, `topLearners[]`
  - each learner: `skillpilotIdPrefix`, `masteredAtomicGoals`, `totalAtomicGoals`

## Frontend Page
- New view: `HallOfFameView` (public route).
- Fetch from `/api/ui/hall-of-fame` and render:
  - curriculum filter (dropdown or segmented buttons)
  - table/list with top 3 learners
  - show total atomic goals in header or per-row as requested.
- Default selection uses `defaultCurriculumId`.
- Add landing page link/card to `/hall-of-fame`.
- Keep styling consistent with existing `bg-chat-bg` / `border-border-color` design.

## Edge Cases
- No learners or no mastery data: show empty leaderboard and totals = 0.
- Curriculum without atomic goals: totals = 0.
- Tie-breaking: sort by `masteredAtomicGoals` desc, then `skillpilotId` asc.
- If all curricula have 0 total mastered, default to first available curriculum.

## Implementation Steps (High Level)
1. Backend: add `HallOfFameService` with snapshot + async refresh.
2. Backend: add repository query for `MAX(updatedAt)` and (optional) mastery fetch for all learners.
3. Backend: add UI controller endpoint returning cached snapshot.
4. Frontend: add `HallOfFameView` + route + landing page link.
5. Frontend: add translations (EN/DE) for labels.

## Open Questions
- Confirm refresh interval for cache: **Every 10 minutes** seems appropriate for a high-score list.
- Should curricula list include only those with learners? **Yes**, effectively filter out empty leaderboards to avoid clutter.
- **Handling ShortKeys**: Data from `MasteryRepository` usually has full UUIDs since we migrated, but legacy data might use ShortKeys. The service must normalize these using `LandscapeService.getGoalDefinition(key).getId()` or similar map.

## Detailed Architecture

### Backend: `HallOfFameService`
- **Responsibility**: Compute and hold the `HallOfFameSnapshot`.
- **Scheduled Task**:
  ```java
  @Scheduled(fixedRate = 600000) // 10 minutes
  public void refreshSnapshot() { ... }
  ```
- **Query Strategy**:
  - Fetch all relevant mastery records: `masteryRepository.findAllByValueGreaterThanEqual(0.9)` (New method needed).
  - Iterate `LandscapeService.getAll()` to build a map of `LandscapeId -> Set<AtomicGoalId>`.
  - Iterate mastery records:
    - Resolve `goalKey` to `goalId`.
    - Find which landscape(s) this goal belongs to (using `LandscapeService` map).
    - For each landscape, increment the learner's score if the goal is atomic in that landscape.
  - Sort and trim: For each landscape, keep top 3 learners.
  - Calculate totals: Count atomic goals per landscape.

### Frontend: `HallOfFameView`
- **Route**: `/hall-of-fame` (Public, no login required).
- **Layout**:
  - Header: "SkillPilot Hall of Fame"
  - Filter: Dropdown for Curriculum (default to one with most mastery).
  - Content:
    - Card showing "X Atomic Goals Mastered" (Top Score).
    - List of Top 3 Learners:
      - Rank 1: Gold styling
      - Rank 2: Silver
      - Rank 3: Bronze
      - Display: `skillpilotId.substring(0, 5) + "..."` and score.
  - Footer/Back Link: "Start your journey" -> `/` (or `/explorer`).
