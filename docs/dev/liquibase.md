# Working with Liquibase in SkillPilot

This document describes how to manage the database schema using Liquibase.

## Overview
We have switched from Hibernate's `ddl-auto: update` to **Liquibase** to ensure:
- Versioned schema changes.
- Traceable history of database modifications.
- Safe deployments to production.

## Configuration
- **Application Config**: `spring.jpa.hibernate.ddl-auto` is set to `validate`. This ensures Hibernate verifies the schema matches the entities but does not modify it.
- **Liquibase Config**: Liquibase runs on startup and executes the changelog at `db/changelog/db.changelog-master.yaml`.

## Starting from an Existing Database
If you have a productive database with existing tables (`learner`, `mastery`, etc.), Liquibase would normally fail when trying to create them again.

**Solution**: The initial changelog (`001-initial-schema.yaml`) includes **Preconditions**.
- It checks if the tables already exist.
- If they do, it marks the changeset as **RAN** without executing the SQL.
- This effectively synchronizes the Liquibase history with your existing state automatically.

**Action**: Simply restart the application. Liquibase will populate the `DATABASECHANGELOG` table and proceed.

## Workflow for Schema Changes

When you need to modify the database schema (e.g., adding a column):

1. **Modify Java Entity**: Update your JPA entity class (e.g., `Learner.java`) with the new field.
   ```java
   @Column(name = "new_feature_enabled")
   private Boolean newFeatureEnabled;
   ```

2. **Create Changelog**: Create a new file in `backend/src/main/resources/db/changelog/changes/` (e.g., `002-add-feature-flag.yaml`).
   ```yaml
   databaseChangeLog:
     - changeSet:
         id: 002-add-feature-flag
         author: yourname
         changes:
           - addColumn:
               tableName: learner
               columns:
                 - column:
                     name: new_feature_enabled
                     type: BOOLEAN
   ```

3. **Register in Master**: Add the new file to `db/changelog/db.changelog-master.yaml`.
   ```yaml
   databaseChangeLog:
     - include:
         file: db/changelog/changes/001-initial-schema.yaml
     - include:
         file: db/changelog/changes/002-add-feature-flag.yaml
   ```

4. **Run Application**: Restart the backend. Liquibase will apply the new change.

## Troubleshooting
- **Validation Failed**: If Hibernate complains `Schema-validation: missing column`, it means your Entity has a field that creates an expectation, but your Liquibase script didn't create the column in the DB. Check your changelog.
- **Checksum Error**: If you edit a changelog file *after* it has been run, Liquibase will fail. Never edit executed changesets; create a new one to fix issues.
