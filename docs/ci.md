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
3.  **Lint (`npm run lint`)**:
    -   Runs ESLint to enforce code quality, coding standards, and catch potential errors (e.g., unused variables, React hook dependency issues).
4.  **Build (`npm run build`)**:
    -   Runs the Vite build process (`tsc` + `vite build`).
    -   Ensures the application compiles without TypeScript errors.
    -   Verifies that the production bundle can be generated successfully.

### 2. Backend CI (`backend-ci`)
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
