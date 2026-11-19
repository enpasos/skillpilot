## Rollout-Politik für das kanonische Gymnasium {#sec:sga-gymnasium-rollout}

Dieses Kapitel legt die dauerhafte Zielarchitektur und Rollout-Politik fest, nach der die deutschen Gymnasiallehrpläne aller 16 Bundesländer ohne bundeslandspezifische Zielduplizierung in je einen kanonischen Skill-Graphen pro Fach zusammengeführt werden (Umsetzungspläne und Migrationsstände liegen unter [Implementierungsplan Kanonisches Gymnasium](repo:docs/dev/canonical-gymnasium-implementation-plan.md) und [Migrationsstatus](repo:docs/dev/canonical-gymnasium-migration-status.md)).

### Neun Kernentscheidungen und Scope-Vokabular {#sec:sga-gr-decisions}

1. **Kanonische Fachebene zuerst:** Eine durchgängige `SkillLandscape` je Fach unter `curricula/DE/Gymnasium/canonical/` von Sekundarstufe I bis zur Abiturreife.
2. **Kontinuität in der Übergangsphase:** Abgelöste Landesbäume bleiben als bundeslandgebundene Quellen- und Auditeingaben unter `curricula/DE/Gymnasium/input/<STATE>/` erhalten (abgesichert durch die Stilllegungsvalidatoren in [Graph- und View-Validierung](repo:docs/qa-ci/graph-validation-rules.md)), während Mappings bestehenden Lernfortschritt überführen.
3. **Schlanke Mapping-Schicht:** Explizite `legacyGoalId -> canonicalGoalId`-Mappings (`matchType: "exact" | "partial"`) statt eines zweiten Inhaltsuniversums.
4. **ISO-3166-2-Ländercodes:** Metadaten und Filter nutzen durchgängig `DE-HE`, `DE-BY`, …, `DE-TH` (`ALL` ist ein reiner Query-Sentinel und wird nie serialisiert).
5. **Stabile Coach-/MCP-Schnittstellen:** Backend und Laufzeit kapseln die Übersetzung zwischen Alt- und Kanon-Schicht, sodass KI-Coaches stets genau einen Lernstand, eine Frontier und ein Mastery-Modell sehen.
6. **Kontrollierte fachübergreifende `requires`:** Kanonische Fachlandschaften dürfen fachübergreifende Kanten direkt auf stabile kanonische IDs setzen (z. B. Physikziele mit Mathematik-Voraussetzungen), ohne fremde Teilbäume zu kopieren; die Graphvalidatoren lösen diese Verweise über die geladenen Landschaften auf, und `CQR-001` bezieht benötigte fachfremde Ziele samt vererbender Vorfahren in die Prüfung auf atomare Normalform und transitive Minimalität ein.
7. **Gemeinsame Wurzel `Gymnasium (DE)`, Landesplan-Autorität & Scope-Vokabular:** Ein bundesweiter Einstiegsknoten bündelt Fachlandschaften entlang `jurisdiction` (`DE-*`), `schoolForm` (`Gymnasium`), `stage` (`SekI`, `SekII`), `durationModel` (`G8`, `G9`) und `courseProfile` (`GK`, `LK`, `GK+LK` ohne doppelte IDs). Je Land und Dauermodell bildet ein gemeinsamer Landesplan (`SekI` und `SekII` mit `SekII after SekI`, darunter Jahrgänge bzw. `E` und `Q1`–`Q4`) die Platzierungsautorität, aus der Einzelstufensichten und `.view.json`-Kompatibilitätssichten abgeleitet werden (@ref{sec:sga-view-projection}).
8. **G9-Referenzraster & länderübergreifende Blatt-Einheiten:** Kanonische Sek-I-Landschaften orientieren sich am gemeinsamen Raster `Jahrgang 5` bis `Jahrgang 10`, während `G8`/`G9`-Quellwahrheit sowie die Trennung zwischen *geführt in* und *steht in* explizit erhalten bleiben; kanonische fachliche Blatteinheiten werden so geschnitten, dass sie in allen 16 Bundesländern ungeteilt in einer einzigen Planeinheit liegen.
9. **Bundeslandgebundene Quell-Assets:** Nicht-kanonische Quellenextrakte, Abitur-Blueprints (`curricula/DE/Gymnasium/input/HE/abi/`) und Auditbelege bleiben strikt ländergetrennt unter `input/<STATE>/`.

### Teilbaum-Zustandsmodell und Einführungsreihenfolge {#sec:sga-gr-states}

Migrationseinheit ist stets ein **didaktisch abgeschlossener Teilbaum** (kein Big-Bang-Umbau) entlang vier geordneter Zustände:

| Zustand | Bedeutung & Lernstandsvertrag |
| --- | --- |
| `1. legacy_frozen` | Bestehende Landes-JSONs dienen schreibgeschützt als Quelle; Laufzeit-/Mappingkorrekturen ohne Umbau des Altbaums erlaubt. |
| `2. subtree_adopted` | Abgeschlossener `contains`-Teilbaum unter `canonical/` mit expliziten `exact`/`partial`-Mappings und gebundenen Voraussetzungen angelegt. |
| `3. cutover_ready` | Lernstandskontinuität, Frontier-Stimmigkeit und Mappingabdeckung belegt, sodass der kanonische Pfad Standard werden kann. |
| `4. legacy_view_retained` | Kanonischer Teilbaum ist primärer Lernpfad; Kompatibilitätssichten bleiben vorübergehend bis zur regulären Stilllegung verfügbar. |
{cols="26%,74%"}

Die Einführung sichert zuerst die Lernkontinuität in Hessen, baut den mathematischen Voraussetzungspfad von Sek I bis Sek II auf und übernimmt weitere Länder über Mappings und gemeinsame Stufenpläne. Kanonische Facheinheiten können zunächst gröber geschnitten und anhand fachlicher Übergänge verfeinert werden. Jede Blatteinheit bleibt je Land an einem Lernort. Der direkte Versuch einer verfügbaren Prüfung bleibt nach B9 möglich. Für die Anerkennung eigener Ziele gelten R1–R5. Der Vorschlag vom 19. November würde darüber hinaus ein repräsentatives Gesamturteil über eine Einheitenfassung einführen; dafür wären Aufgabenentwurf, Fachreview und Erprobung gesondert erforderlich. Seine Planungsfreigaben sind keine bereits geltende Rollout-Regel.
