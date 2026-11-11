## Datenbankmigrationen mit Liquibase {#sec:dev-liquibase}

Das Spring-Boot-Backend erzwingt `spring.jpa.hibernate.ddl-auto=validate`: Hibernate prüft beim Start lediglich die Übereinstimmung der JPA-Entities mit der Datenbank, während **Liquibase** allein für jede Schemaanlage und -migration zuständig ist.

### Changelog-Struktur und vierstufiger Migrationsablauf {#sec:dev-lq-workflow}

- **Master-Changelog:** [`backend/src/main/resources/db/changelog/db.changelog-master.yaml`](repo:backend/src/main/resources/db/changelog/db.changelog-master.yaml) bindet geordnete Migrationsdateien unter [`backend/src/main/resources/db/changelog/changes/`](repo:backend/src/main/resources/db/changelog/changes) ein (beginnend mit `001-initial-schema.yaml` samt `preConditions` und `onFail: MARK_RAN`, damit bestehende Datenbanken sauber in `DATABASECHANGELOG` übernommen werden).
- **Vier Schritte bei Schemaänderungen:**
  1. JPA-`@Entity`-Klasse unter `backend/src/main/java/com/skillpilot/backend/domain/` anpassen.
  2. Neue nummerierte Datei `NNN-kurzbeschreibung.yaml` unter `db/changelog/changes/` mit eindeutigem `(id, author)`-Changeset und expliziten Spaltentypen/Constraints anlegen.
  3. Datei per `include` am Ende von `db.changelog-master.yaml` registrieren.
  4. Backend bzw. Tests starten (`./gradlew bootRun` oder `./gradlew test`), sodass Liquibase die Migration ausführt und Hibernate `validate` die exakte Entity-Schema-Deckung bestätigt.
- **Unveränderlichkeitsregel:** Bereits eingecheckte und ausgeführte Changesets dürfen **niemals** nachträglich geändert werden (Prüfsummenfehler beim Start); Korrekturen erfolgen stets über ein neues Folge-Changeset.
