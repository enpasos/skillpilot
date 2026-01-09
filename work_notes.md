# Work Notes: TUM Curriculum Automation

## Project Goal
We are expanding the Skillpilot platform to include all major curricula from the **Technical University of Munich (TUM)**.
Following the successful manual/semi-automated import of **Mathematics** and **Physics** (B.Sc.), the goal is to **automate** this process for future subjects and programs.

## Context & References
We have established a pattern for TUM curricula in `curricula/DE/BY/TUM/`.
- **Reference 1 (Mathematics):** `curricula/DE/BY/TUM/Mathematics/BSc_Mathematics/`
- **Reference 2 (Physics):** `curricula/DE/BY/TUM/Physics/BSc_Physics/`

### File Structure Pattern
For a given Program (e.g., `BSc_Physics`):
1.  **Input List (`xyz.txt`):** Contains a list of Module Codes and Titles, plus a URL template.
    -   Example: `curricula/DE/BY/TUM/Physics/BSc_Physics/input/DE_BAY_U_TUM_xyz.txt`
    -   Format: `[ModuleCode] [Title]`
    -   Url Template: `https://academics.nat.tum.de/org/mh/details/mod/$m`
2.  **Module JSONs:** Generated JSON files for each module.
    -   Location: `json/` subdirectory.
    -   Naming: `DE_BAY_U_TUM_[ModuleCode].de.json`
3.  **Landscape JSON:** The main file defining the curriculum structure (semesters, groups, etc.).
    -   Example: `DE_BAY_U_TUM_BSC_MATHEMATIK.de.json`

## Task Description for Next Agent
Your task is to build a robust automation pipeline/script (`scripts/scrape_tum_curriculum.py`) that can:

1.  **Read Input:** Parse an `xyz.txt` (or standardized input file) to get a list of modules and the target URL pattern.
2.  **Scrape Data:** For each module:
    -   Fetch the module details page (e.g., `https://academics.nat.tum.de/org/mh/details/mod/MA0001`).
    -   Extract metadata: Title (DE/EN), Description, ECTS, Responsible Person.
    -   Extract Content: "Learning Outcomes" (Kompetenzen), "Content" (Inhalt).
3.  **Generate JSON:**
    -   Create a standard Skillpilot JSON for the module.
    -   Map "Learning Outcomes" to granular `goals` within the JSON.
    -   Use `uuid` for stable ID generation (ideally deterministic based on Module Code to avoid duplicates on re-runs).
4.  **Integration:**
    -   (Optional/Advanced) Assist in generating the root Landscape JSON to structure these modules.

## Current Status
- **Mathematics & Physics:** Completed (manually/semi-auto). Files exist as references.
- **Automation:** **Core Logic Implemented**.
    - `scripts/scrape_tum_curriculum.py`: created and tested (uses API).
    - `scripts/create_new_curriculum.py`: created for setting up new subjects.
- **Next Steps:**
    1.  **Discovery:** Discover and list modules for **Quantum Science and Technology (Master)** (High Priority).
    2.  **Expansion:** Use `create_new_curriculum.py` to set up QST.
    3.  **Execution:** Run `scrape_tum_curriculum.py` for QST.
    4.  **Backlog:** Compile a full list of TUM curricula for future prioritization.

---
*Historical Note: The `scrape_lehrplanplus.py` script for Bavarian schools (Gymnasium/Realschule) is completed and located in `scripts/`. It is separate from this TUM project.*
