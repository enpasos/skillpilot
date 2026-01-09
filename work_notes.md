# Work Notes: LehrplanPLUS Curriculum Import

## Context
We are systematically importing curricula from [LehrplanPLUS Bayern](https://www.lehrplanplus.bayern.de/) into the Skillpilot platform. The goal is to provide a comprehensive set of standardized competencies for the Bavarian school system (including Gymnasium, Realschule, Grundschule, etc.).

## Task Description
The objective is to crawl the LehrplanPLUS website to extract the full curriculum hierarchy and convert it into the Skillpilot JSON format.

**Data Hierarchy:**
`School Type` -> `Subject` -> `Grade` -> `Learning Area (Lernbereich)` -> `Competence (Kompetenzerwartung)`

**Target Artifacts:**
JSON files stored in `curricula/DE/BY/[SchoolType]/[Subject].json`.

## Current Status
- **Implementation:** A Python scraper has been built at `scripts/scrape_lehrplanplus.py`.
- **Dependencies:** `requests`, `beautifulsoup4`, `uuid`.
- **State:** **COMPLETED** (Full run successful).
- **Output:** JSON curricula generated in `curricula/DE/BY/` for all processed school types.

## Execution History
- **Run 1:** Limit testing (Grundschule/Deutsch). Success.
- **Run 2:** Full Run. Issue with missing English content ("Ausprägung"). Fixed.
- **Run 3:** Full Run. Crash on "Geschichte/Politik/Geographie". Fixed (Filename Sanitization).
- **Run 4:** Full Run (ID `13494fde`). **Success.**


## Handover / Execution Instructions
To complete the task (e.g., for GPT-5.2-Codex):

1.  **Modify the Script:**
    Open `scripts/scrape_lehrplanplus.py` and disable the limits:
    ```python
    LIMIT_SCHOOL_TYPES = None  # Process all school types
    LIMIT_SUBJECTS_PER_TYPE = None # Process all subjects
    ```

2.  **Run the Scraper:**
    Execute the script from the project root:
    ```bash
    python3 scripts/scrape_lehrplanplus.py
    ```
    *Note: This will perform a large number of HTTP requests. Monitor for timeouts or rate limiting.*

3.  **Verify Output:**
    Check the `curricula/DE/BY/` directory. It should populate with folders for each School Type (e.g., `Gymnasium`, `Realschule`) containing JSON files for each Subject.
