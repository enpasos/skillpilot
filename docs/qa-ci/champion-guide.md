# SkillPilot Curriculum Champions

## Overview
A **SkillPilot Curriculum Champion** (DE: Curriculum-Champion:in) takes responsibility for a specific curriculum to ensure its practical viability and quality.
There is no limit to the number of champions for a single curriculum. Multiple champions can share the role and contribute with different focus areas (content, didactics, community, tooling).

## Responsibilities of a Champion
-   Do whatever is necessary to make the curriculum practically useful in the champion's relevant context.
-   Step into the learner role and work through the curriculum, including its required learning and assessment stations.
-   Act as a project owner who improves (or gets improvements made to) the curriculum and SkillPilot so the curriculum works in practice.
    This includes using GitHub issues and pull requests at https://github.com/enpasos/skillpilot
-   Strive to apply the curriculum for the practical benefit of learners and teachers, and recruit them to use it.
-   Build contact with the content owners of the source curriculum, such as ministries of education or universities.

## Registration Process
Aspiring champions register on the **"Curricula"** page (which will replace the current "Hall of Fame").
**Registration Requirements:**
-   SkillPilot ID
-   **GitHub Account Verification:** Users must authenticate via GitHub OAuth to prove ownership of the account.
-   GitHub ID is shown publicly; SkillPilot ID is displayed masked.

## Practical human trial

On the Curricula page, **Your human QA** is the entry point for existing
Champions. Use **Connect with GitHub** with the account linked to your role;
this entry is visible even when the registration form is closed. Once signed
in, the page shows your roles and their trial controls. An expired login requires
signing in again, not registering the role again. Failed role loading is shown
with a retry action rather than silently hiding the controls.

Registration alone does not start or certify a trial. Existing learning progress
in an active Champion role's scope now counts as **Human QA in progress**, once
core QA has reached at least **M5**. At least one completed goal in that scope is
enough for this start signal, regardless of when the role was registered or the
progress was made. Existing Champions need neither to re-register nor to press
a retrospective start button. With no progress yet, **Begin trial** remains
available.

The current personal curriculum and topic selection define the inferred scope.
An explicit trial action binds that scope; subsequent selection changes do not
silently change this binding. A pause or ended role is never reactivated merely
because progress still exists.

The page distinguishes learning progress from content-bound practical evidence
and shows the scope and known blocking findings. Existing mastery is a start
signal only: imported or manually raised mastery is not practical evidence for
**Human-tested**. Valid learning completions recorded before the start can count
when their provenance and current content binding are available. Older records
without those bindings are retained but cannot certify the current content.

**Human QA in progress** requires an active role with progress in scope or an
explicit start. A champion may pause and resume it. **Human-tested** still
requires one champion's complete evidence
for the advertised scope, no known unresolved blocking findings, and the explicit
final confirmation. Several people's partial runs are never combined. Merely
completing a learning goal does not resolve a reported defect. The final
confirmation also covers blocking findings known to the champion that have not
yet entered a machine-readable review ledger.

A limited scope stays visibly limited; it does not certify an entire subject.
Relevant content changes require fresh evidence for affected stations and a new
confirmation. Unchanged evidence and the previous completion record remain.
M7 is a separate maturity level based on the five deep-QA gates, not a prerequisite
for starting human trials and not proof that a human trial happened. See the
[quality and human-trial concept](../concept/curriculum-quality-and-human-trial.md).

## Stop Championship Process (Resignation)
Champions can resign from their role at any time.
**Process:**
1.  **Initiate:** User clicks "Stop Championship".
2.  **Verify Identity:** User must authenticate via **GitHub OAuth** to prove ownership of the GitHub ID associated with the championships.
3.  **Select Curricula:** The system displays all active championships for the authenticated GitHub user. The user selects one or more to end.
4.  **Confirm:** User confirms the deregistration. The assignment ends and an unfinished trial stops being active. Completed evidence and its history remain; resignation alone does not revoke a valid completed trial.

## The "Curricula" Page
This page serves as the central hub for curriculum maintenance.

### 1. Visual Introduction
A four-panel cartoon (**Nano Banana Pro**) describes the Curriculum Champion concept.

### 2. Registration Action
A button **"Connect with GitHub"** initiates the OAuth flow to verify the GitHub identity and register as a champion.

### 3. Curriculum Directory
A comprehensive list of all available curricula, including aggregated stats per curriculum:
-   Total atomic goals
-   Total mastered achievements (count of mastered goals across all learners in the curriculum)

### 4. Champion Leaderboard
For each curriculum, a list of registered champions is displayed with the following metrics:
-   **GitHub ID**
-   **SkillPilot ID:** Masked (First 5 characters + "...")
-   **GitHub Contributions:**
    -   Number of Issues
    -   Number of Pull Requests (PRs)
