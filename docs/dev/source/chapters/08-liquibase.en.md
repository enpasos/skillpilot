## Database Migrations with Liquibase {#sec:dev-liquibase}

The Spring Boot backend enforces `spring.jpa.hibernate.ddl-auto=validate`: Hibernate validates JPA entities against the live schema on startup, while **Liquibase** exclusively owns every schema creation and migration.

### Changelog Layout and Four-Step Migration Workflow {#sec:dev-lq-workflow}

- **Master changelog:** [`backend/src/main/resources/db/changelog/db.changelog-master.yaml`](repo:backend/src/main/resources/db/changelog/db.changelog-master.yaml) includes ordered versioned files under [`backend/src/main/resources/db/changelog/changes/`](repo:backend/src/main/resources/db/changelog/changes) (starting from `001-initial-schema.yaml`, which uses `preConditions` with `onFail: MARK_RAN` so existing pre-Liquibase databases adopt tracking cleanly via `DATABASECHANGELOG`).
- **Four-step workflow for schema changes:**
  1. Update the JPA `@Entity` class in `backend/src/main/java/com/skillpilot/backend/domain/`.
  2. Add a new numbered YAML file `NNN-short-description.yaml` under `db/changelog/changes/` with a unique `(id, author)` changeset and explicit types/constraints.
  3. Append an `include` entry to `db.changelog-master.yaml`.
  4. Start the backend (`./gradlew bootRun` or `./gradlew test`) so Liquibase applies the migration and Hibernate `validate` confirms exact JPA-to-SQL parity.
- **Immutability rule:** **Never** edit an already committed and executed changeset (Liquibase checksum validation will fail startup); always append a new corrective changeset instead.
