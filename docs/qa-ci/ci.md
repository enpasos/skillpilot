# Continuous Integration (CI)

This document describes the Continuous Integration (CI) pipeline for the SkillPilot project. The pipeline is defined in `.github/workflows/ci.yml` and is designed to ensure code quality, build stability, and data integrity for both the frontend and backend components.

## Triggers
The CI pipeline is triggered on:
- **Push** to the `main` branch.
- **Pull Request** targeting the `main` branch.

**Ignored Paths**: Changes to documentation (`README.md`, `AGENTS.md`, `docs/**`), sandbox, or temporary directories do not trigger the CI to save resources.

## Jobs

The CI pipeline consists of two parallel jobs: `frontend-ci` and `backend-ci`.

### 1. Frontend CI (`frontend-ci`)
This job validates the React/TypeScript frontend application located in the `app` directory.

**Environment**: Node.js 20 on Ubuntu Latest.

**Steps**:
1.  **Install Dependencies**: Runs `npm ci` for a clean, deterministic install of dependencies based on `package-lock.json`.
2.  **Validate Graph (`npm run validate:graph`)**:
    -   Executes the custom graph validation script (`scripts/validateGraph.ts`).
    -   **Checks**:
        -   **Referential Integrity**: Ensures all `requires` and `contains` links point to valid, existing Goal IDs.
        -   **Missing IDs**: Detects any broken links (Goal A requires Goal B, but Goal B does not exist).
        -   **Duplicates**: Ensures no Goal ID is defined more than once within the same landscape (allows duplicates across multi-language files if they share the `landscapeId`).
        -   **Implicit Global Lookup**: Verifies that cross-landscape references (without `LANDSCAPE:` prefix) can be uniquely resolved to a single global goal.
        -   **Schema**: Validates that goals use allowed phases (e.g., `S1`, `Q1`, `Pflichtbereich`, `Modul`).
        -   **Curriculum Manifest Sync**: Ensures `curricula/curriculum_manifest.json` exists, lists only valid root curricula, and matches the computed root set.
3.  **Lint (`npm run lint`)**:
    -   Runs ESLint to enforce code quality, coding standards, and catch potential errors (e.g., unused variables, React hook dependency issues).
4.  **Build (`npm run build`)**:
    -   Runs the Vite build process (`tsc` + `vite build`).
    -   Ensures the application compiles without TypeScript errors.
    -   Verifies that the production bundle can be generated successfully.

### 2. Graph Validation CI (`graph-validation`)
This job focuses on the integrity of the data (curriculum JSON files) rather than the code.

**Environment**: Node.js 20 on Ubuntu Latest.

**Steps**:
1.  **Install Dependencies**: Runs `npm ci` in `app` directory to get access to the validation script and its dependencies (`tsx`, etc.).
2.  **Validate Graph (`npm run validate:graph`)**:
    -   Executes the custom graph validation script (`scripts/validateGraph.ts`).
    -   **Checks**:
        -   **Referential Integrity**: Ensures all `requires` and `contains` links point to valid, existing Goal IDs.
        -   **Missing IDs**: Detects any broken links.
        -   **Duplicates**: Ensures no Goal ID is defined more than once within the same landscape.
        -   **Schema**: Validates that goals use allowed phases.
        -   **Curriculum Manifest Sync**: Ensures `curricula/curriculum_manifest.json` is present and aligned with root curricula.

### 3. Backend CI (`backend-ci`)
This job validates the Java/Spring Boot backend located in the `backend` directory.

**Environment**: Java 25 (Temurin distribution) on Ubuntu Latest.

**Steps**:
1.  **Gradle Check (`./gradlew check`)**:
    -   Executes the standard Gradle `check` lifecycle task.
    -   **Unit Tests**: Runs all unit tests defined in the project (typically JUnit/TestNG).
    -   **Integration Tests**: Runs integration tests if configured as part of the check task.
    -   **Verification**: Executed any configured static analysis or code quality plugins (e.g., Checkstyle, SpotBugs, PMD) if they are attached to the `check` task in `build.gradle`.

## Status Checks
Both `frontend-ci` and `backend-ci` must pass for the workflow to be considered successful. This is typically required before merging Pull Requests into `main`.
## Running Locally

To reproduce the CI steps locally before pushing, you can use the helper script `run_ci.sh` located in the root directory.

Run this command from the root of the project:
```bash
bash run_ci.sh
```

**This script will**:
1.  Navigate to `app` and run:
    -   `npm install` (Local-friendly alternative to `npm ci`)
    -   `npm run validate:graph`
    -   `npm run lint`
    -   `npm run build`
2.  Navigate to `backend` and run:
    -   `GRADLE_USER_HOME=backend/.gradle-ci ./gradlew clean check --no-daemon`
3.  Report success if all steps pass.

**Requirements**:
-   Node.js (matching version in CI, typically 20)
-   Java JDK (matching version in CI, typically 25)
-   Bash (or a compatible shell environment like WSL or Git Bash)
