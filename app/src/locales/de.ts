export const de = {
    startPage: {
        subtitle: "so lerne ich ...",
        cards: {
            whitepaper: {
                title: "Whitepaper lesen",
                description: "Erfahre mehr über das Konzept und die Vision."
            },
            gpt: {
                title: "SkillPilot Login",
                badge: "Hauptstart",
                description: "Log dich zum Lernen ein. Du musst dich dafür nicht registrieren. Du brauchst nur eine SkillPilot-ID, die du dir jederzeit erstellen lassen kannst. Zu ihr werden deine persönlichen Lernerfolge gespeichert.",
                cta: "Einloggen oder ID erstellen"
            },
            explorer: {
                title: "Cockpit",
                description: "Fortschritt und Lernstand ansehen.",
                cta: "Cockpit öffnen"
            },
            curricula: {
                title: "Curriculum-Champions",
                description: "Curricula praktisch machen und voranbringen."
            }
        },
        login: {
            back: "Zurück zur Auswahl",
            roles: {
                learner: "Lernerfolge",
                trainer: "Kursorganisation (Lehrer)",
                explorer: "Inhalte erkunden (Experten)"
            },
            loginTitle: "Login",
            loginText: "Wähle deine SkillPilot-ID. Sie ist dein dauerhafter Schlüssel; die eigentliche Arbeit startet danach über eine temporäre Session.",
            newLoginTitle: "Ich habe noch keinen Login",
            storedLoginTitle: "Gespeicherten Login laden",
            storedProfileLabel: "Gespeicherter Login",
            directIdTitle: "SkillPilot-ID direkt eingeben",
            loginNameLabel: "Name auf diesem Gerät",
            passwordLabel: "Passwort",
            loadStoredLogin: "Login laden",
            loadingStoredLogin: "Login wird geladen...",
            deleteStoredLogin: "Gespeicherten Login löschen",
            saveLocalLoginTitle: "Diesen Login auf diesem Gerät speichern",
            saveLocalLoginHint: "Die SkillPilot-ID wird nur lokal im Browser gespeichert und mit deinem Passwort verschlüsselt. Das Passwort wird nicht gespeichert.",
            saveLocalLogin: "Verschlüsselt speichern",
            savingLocalLogin: "Speichere...",
            localLoginSaved: "Login wurde lokal verschlüsselt gespeichert.",
            localLoginLoaded: "Login wurde geladen.",
            localLoginFailed: "Login konnte nicht verarbeitet werden.",
            idLabel: "SkillPilot-ID",
            requestNewId: "Neue SkillPilot-ID erstellen",
            idWarning: "Wichtig: Diese ID ist dein dauerhafter Zugang. Teile sie nicht öffentlich.",
            checkButton: "Weiter",
            checking: "Prüfe...",
            startButton: "Starten",
            cockpitButton: "Cockpit öffnen",
            startPromptLabel: "Startcode für SkillPilot Lerncoach",
            startPromptHint: "Deine SkillPilot-ID bleibt im Browser. ChatGPT bekommt nur einen eindeutigen, einmalig nutzbaren Startcode.",
            copyStartPrompt: "Startcode kopieren",
            openChatGpt: "SkillPilot Lerncoach starten",
            startPromptCopied: "Startcode wurde kopiert.",
            startPromptCopyFailed: "Startcode konnte nicht erzeugt oder an ChatGPT übergeben werden. Bitte versuche es erneut.",
            dashboardButton: "Dashboard öffnen",
            curriculumStepTitle: "Curriculum",
            curriculumStepText: "Wähle, womit diese SkillPilot-ID arbeiten soll. Diese Auswahl wird zu deinem Lernstand gespeichert.",
            trainerCurriculumStepTitle: "Kursorganisation einrichten",
            trainerCurriculumStepText: "Wähle das Curriculum für deine Kursansicht. Die Auswahl wird nur lokal auf diesem Gerät gespeichert.",
            trainerDashboardButton: "Kursorganisation öffnen",
            explorerCurriculumStepTitle: "Inhalte erkunden",
            explorerCurriculumStepText: "Wähle ein Curriculum, um Lernziele, Themen und Zusammenhänge ohne Lernenden-Login zu erkunden.",
            explorerDashboardButton: "Explorer öffnen",
            startStepTitle: "Start",
            startStepText: "Intern wird eine temporäre Session vorbereitet. Das Cockpit startet direkt; der SkillPilot Lerncoach startet mit einem kurzlebigen Startcode.",
            curriculumLabel: {
                select: "Curriculum wählen",
                yours: "Dein Curriculum"
            },
            trainerInfo: {
                title: "Lokale Datenhaltung",
                text: "Ihre Daten werden nur lokal gespeichert."
            }
        },
        banner: {
            text: "**Kostenlos.** Du brauchst nur einen ChatGPT-Account.\nNutze SkillPilot im Browser oder im ChatGPT-Textchat. In der App kannst du deine Antwort diktieren, als Text senden und Fotos von handschriftlichen Lösungen hochladen. Voice Chat funktioniert dafür leider noch nicht."
        },
        links: {
            statistics: "Statistiken",
            workbench: "Workbench",
            whitepaper: "Whitepaper"
        },
        footer: {
            privacy: "Datenschutz",
            imprint: "Impressum",
            legal: "Rechtliches"
        }
    },
    statsHub: {
        title: "Statistiken",
        subtitle: "Entdecke das Wachstum unserer Lern-Community.",
        back: "Zurück zur Startseite",
        cards: {
            users: {
                title: "SkillPilot-IDs",
                description: "Überblick über generierte SkillPilot-IDs und Community-Wachstum."
            },
            successes: {
                title: "Erfolge",
                description: "Gesamtanzahl gemeisterter Lernziele auf der Plattform."
            }
        }
    },
    explorer: {
        requires: "Voraussetzungen (requires)",
        inheritedRequires: "Vererbte Voraussetzungen (aus übergeordneten Clustern)",
        externalRequires: "Externe Voraussetzungen",
        contains: "Unterziele (contains)",
        nextSteps: "Nächste Schritte (Ziele, die dieses benötigen)",
        nextStepsDirect: "Nächste Schritte (direkt)",
        nextStepsInherited: "Nächste Schritte (vererbt)",
        requiresFlowToggleLabel: "Requires-Flow",
        requiresFlowStateOn: "an",
        requiresFlowStateOff: "aus",
        containsChildPickerLabel: "Unterziel wählen",
        containsChildPickerPlaceholder: "Unterziel auswählen",
        containsChildPickerTitle: "Unterziel aus contains-Kindern wählen",
        shareContext: "Kontext-Link kopieren",
        navigationHelp: "Navigation: Breadcrumb-Dropdowns wechseln zwischen Geschwistern, links siehst du direkte und vererbte Voraussetzungen, rechts Unterziele und Nächste Schritte. So bleibt der komplette Kontext des aktuellen Lernziels sichtbar.",
        emptyRequires: "Keine direkten Voraussetzungen",
        emptyInherited: "Keine vererbten Voraussetzungen",
        emptyContains: "Keine Unterziele",
        emptyNextSteps: "Keine direkten Folgeziele",
        emptyNextStepsInherited: "Keine vererbten Folgeziele"
    },
    tooltips: {
        progress: "Fortschritt",
        removeFromList: "Von Lernliste entfernen",
        addToList: "Als Lernziel setzen",
        legacyReadOnly: "In der Legacy-Ansicht schreibgeschützt",
        projectedStructureBadge: "Struktur",
        projectedStructureReadOnly: "Projizierter Strukturknoten; nicht direkt als Lernziel planbar",
        exportData: "Daten exportieren",
        importData: "Daten importieren",
        refresh: "Aktualisieren",
        adjustCurriculum: "Lehrplan anpassen"
    },
    notifications: {
        shareContextCopied: "Kontext-Link kopiert.",
        shareContextFailed: "Kontext-Link konnte nicht kopiert werden.",
        compatibilityArchiveExported: "Kompatibilitätsarchiv exportiert.",
        compatibilityArchiveExportFailed: "Kompatibilitätsarchiv konnte nicht exportiert werden.",
        learnerImported: "Lernstand importiert.",
        learnerImportFailed: "Lernstand konnte nicht importiert werden.",
        learnerImportValidationFailed: "Import fehlgeschlagen: Die Exportdatei ist nicht unverändert oder die Signatur ist ungültig.",
        learnerImportSystemFailed: "Import fehlgeschlagen: Netzwerk- oder Systemfehler.",
        learnerExported: "Lernstand exportiert.",
        learnerExportFailed: "Lernstand konnte nicht exportiert werden.",
        learnerInitialLoadFailed: "Ein Teil deines Lernstands konnte nicht geladen werden. Bitte aktualisiere die Seite später erneut.",
        activeGoalSetFailed: "Aktives Lernziel konnte nicht gesetzt werden.",
        activeGoalSetSystemFailed: "Aktives Lernziel konnte wegen eines Netzwerk- oder Systemfehlers nicht gesetzt werden.",
        plannedGoalSaveFailed: "Lernfokus konnte nicht gespeichert werden.",
        personalCurriculumSaveFailed: "Persönliches Curriculum konnte nicht gespeichert werden.",
        preferencesSaveFailed: "Lernpräferenzen konnten nicht gespeichert werden.",
        trainerClassSaveFailed: "Klassendaten konnten lokal nicht gespeichert werden.",
        trainerPlannedGoalSaveFailed: "Der Lernplan dieses Schülers konnte nicht gespeichert werden.",
        trainerBulkPlannedGoalSaveFailed: "Die Lernzielzuweisung für die Klasse konnte nicht gespeichert werden.",
        trainerInitialLoadFailed: "Trainerdaten konnten nicht vollständig geladen werden. Bitte aktualisiere die Seite später erneut.",
        trainerClassDataLoadFailed: "Die Lernstände oder Lernpläne der Klasse konnten nicht vollständig geladen werden.",
        classExported: "Klasse exportiert.",
        classImported: "Klasse importiert.",
        classImportFailed: "Klasse konnte nicht importiert werden."
    },
    learner: {
        myGoals: "Meine Lernziele",
        structureMode: "Struktur",
        structureAll: "Alle",
        structureContent: "Inhalte",
        structureCompetencies: "Kompetenzen",
        loadingGoals: "Lernziele werden vorbereitet...",
        shareContext: "Kontext-Link kopieren",
        marked: "markiert",
        completed: "abgeschlossen",
        totalInContext: "Ziele im Kontext",
        of: "von",
        includesDataFrom: "Enthält Daten von",
        nextSteps: "Als nächste Lernziele stehen dir offen:",
        chooseNext: "Welches möchtest du als Nächstes angehen?",
        velocity: {
            title: "Lerngeschwindigkeit",
            chartLabel: "Gemeisterte Ziele / Woche (letzte 8 Wochen)",
            recent: "Letzte Erfolge",
            loading: "Lade Historie...",
            none: "Noch keine Ziele gemeistert. Bleib dran!"
        }
    },
    trainer: {
        dashboard: "Kursorganisation",
        structureMode: "Struktur",
        structureAll: "Alle",
        structureContent: "Inhalte",
        structureCompetencies: "Kompetenzen",
        shareContext: "Kontext-Link kopieren",
        import: "Importieren",
        newClass: "Neue Klasse",
        students: "Schüler",
        allClasses: "Alle Klassen",
        studentList: "Schülerliste",
        currentContext: "Aktueller Lernkontext",
        assigning: "Wird zugewiesen...",
        removing: "Wird entfernt...",
        removeFromPlan: "Vom Plan von {{count}} Schülern entfernen",
        assignToAll: "Allen {{count}} Schülern als Lernziel setzen",
        selectedGoal: "Gewähltes Lernziel",
        goalOnPlan: "Dieses Ziel ist auf dem Lernplan von {{name}}.",
        allStudents: "Alle",
        emptyClasses: "Noch keine Klassen angelegt. Starte jetzt!",
        classExportTooltip: "Klasse lokal speichern (JSON)",
        classDeleteTooltip: "Klasse löschen",
        bulkAddDialogTitle: "Lernziel hinzufügen",
        bulkAddDialogMessage: "Möchten Sie das Ziel \"{{goal}}\" auf den Lernplan aller {{count}} Schüler setzen?",
        bulkAddDialogConfirm: "Hinzufügen",
        bulkRemoveDialogTitle: "Lernziel entfernen",
        bulkRemoveDialogMessage: "Möchten Sie das Ziel \"{{goal}}\" vom Lernplan aller Schüler entfernen, bei denen es aktuell geplant ist ({{count}} Schüler)?",
        bulkRemoveDialogConfirm: "Entfernen",
        deleteClassDialogTitle: "Klasse löschen",
        deleteClassDialogMessage: "Möchten Sie die Klasse \"{{name}}\" wirklich unwiderruflich löschen?",
        deleteClassDialogConfirm: "Löschen",
        importClassDialogTitle: "Klasse importieren",
        importClassDialogMessage: "Klasse \"{{name}}\" existiert bereits. Möchten Sie sie überschreiben?",
        importClassDialogConfirm: "Überschreiben",
        invalidImportFormat: "Ungültiges Dateiformat",
        emptyState: {
            title: "Wähle einen Kontext",
            text: "Wähle links 'Alle' aus, um Ziele für die ganze Klasse zu planen.\nOder wähle einen einzelnen Schüler aus, um dessen Lernstand einzusehen oder zu bewerten."
        }
    },
    curriculaPage: {
        subtitle: "Champions bringen Curricula in die Praxis und treiben sie voran.",
        noData: {
            title: "Noch keine Curricula verfügbar.",
            button: "Zurück zur Startseite"
        },
        intro: {
            title: "Was ist ein Curriculum-Champion?",
            description: "Champions übernehmen Verantwortung für ein Curriculum und sorgen dafür, dass es in der Praxis funktioniert.",
            comicAlt: "Curriculum-Champion-Comic",
            panels: [
                {
                    title: "Engagement",
                    text: "Mach das Curriculum in deinem Kontext praktisch nutzbar."
                },
                {
                    title: "Durchlernen",
                    text: "Lerne das Curriculum selbst durch und sammle Punkte."
                },
                {
                    title: "Verbessern",
                    text: "Eröffne Issues und Pull Requests für Inhalte und Tools."
                },
                {
                    title: "Vernetzen",
                    text: "Verbinde Lehrende, Lernende und Curriculum-Verantwortliche."
                }
            ]
        },
        registration: {
            title: "Champion-Registrierung & Verwaltung",
            description: "Wähle ein Curriculum, um dich als Champion anzumelden, oder verwalte deine bestehenden Champion-Rollen.",
            curriculumLabel: "Curriculum",
            skillpilotLabel: "SkillPilot-ID",
            skillpilotPlaceholder: "Deine SkillPilot-ID",
            githubLabel: "GitHub-ID",
            githubPlaceholder: "Dein GitHub-Handle",
            publicNote: "GitHub-ID ist erforderlich und öffentlich sichtbar. SkillPilot-ID wird maskiert angezeigt.",
            scopeLabel: "Bereich / Thema",
            entireCurriculum: "Gesamtes Curriculum",
            connectPrompt: "Um dich als Champion zu registrieren, benötigst du eine GitHub-ID und eine SkillPilot-ID.",
            createGithub: "Noch kein GitHub-Konto? Hier erstellen.",
            noSkillpilotId: "Keine SkillPilot-ID? Erstelle eine auf der Startseite.",
            generateId: "ID Generieren",
            generated: "ID generiert",
            toggleShow: "Champion-Registrierung / Verwaltung",
            toggleHide: "Bereich ausblenden",
            submit: "Registrieren",
            submitting: "Registriere...",
            success: "Danke für dein Engagement als Champion!",
            validation: {
                skillpilotChecking: "SkillPilot-ID wird geprüft...",
                skillpilotValid: "SkillPilot-ID bestätigt.",
                githubValid: "GitHub-ID bestätigt."
            },
            errors: {
                required: "Bitte alle Felder ausfüllen.",
                failed: "Registrierung fehlgeschlagen.",
                invalidGithub: "Ungültige GitHub-ID.",
                unknownSkillpilot: "SkillPilot-ID nicht gefunden.",
                validationRequired: "Bitte SkillPilot- und GitHub-ID vor der Registrierung prüfen."
            }
        },
        directory: {
            title: "Curriculum-Verzeichnis",
            description: "Alle Curricula mit aktuellen Fortschritts-Snapshots.",
            noDescription: "Keine Beschreibung verfügbar.",
            championsLabel: "Champions",
            noChampions: "Noch keine Champions registriert.",
            filters: {
                championsLabel: "Champions",
                categoryLabel: "Kategorie",
                champions: {
                    with: "Mit Champions",
                    without: "Ohne Champions",
                    all: "Alle"
                },
                categories: {
                    all: "Alle",
                    school: "Schule",
                    uni: "Uni",
                    other: "Weiterbildung"
                },
                scopeLabel: "Themen",
                empty: "Keine Curricula passen zu diesen Filtern."
            }
        },
        stats: {
            mastered: "Insgesamt gemeisterte Erfolge in diesem Curriculum:",
            masteredShort: "Gemeistert",
            goals: "Ziele gesamt"
        },
        leaderboard: {
            title: "Champion-Übersicht",
            description: "Champions, die dieses Curriculum voranbringen.",
            empty: "Noch keine Champions für dieses Curriculum registriert."
        },
        table: {
            skillpilotId: "SkillPilot-ID",
            achievements: "Erfolge",
            issues: "Issues",
            prs: "PRs"
        },
        back: "Zurück zu SkillPilot",
        loading: "Lade Curricula..."
    },
    usersPage: {
        title: "SkillPilot-IDs",
        subtitle: "Überblick über generierte SkillPilot-IDs.",
        loading: "Lade ID-Statistiken...",
        empty: "Noch keine ID-Daten vorhanden.",
        error: "ID-Statistiken konnten nicht geladen werden.",
        back: "Zurück zu SkillPilot",
        stats: {
            total: "IDs gesamt",
            totalHint: "Alle registrierten IDs",
            achievements: "IDs mit Erfolgen",
            achievementsHint: "Mindestens ein Ziel gemeistert (>= 0.9)",
            rate: "Erfolgsquote"
        },
        filters: {
            all: "Alle",
            withAchievements: "Mit Erfolgen",
            activeLastWeek: "Aktiv letzte Woche"
        },
        chart: {
            title: "Anzahl über Zeit",
            subtitle: "Kumulierte Anzahl",
            totalLabel: "Alle IDs",
            achievementsLabel: "Mit Erfolgen",
            empty: "Noch keine Zeitreihendaten.",
            lastUpdated: "Aktualisiert"
        },
        operator: {
            title: "Gymnasium-DE Cutover",
            description: "Explizite SkillPilot-IDs aus eingefrorenen Hessen-Oberstufenansichten gesammelt auf Gymnasium (DE) umstellen. Es werden nur die eingegebenen IDs verarbeitet.",
            inputLabel: "SkillPilot-IDs",
            inputPlaceholder: "Eine ID pro Zeile oder durch Komma getrennt",
            idCountLabel: "Erkannte IDs",
            validationRequired: "Bitte gib mindestens eine SkillPilot-ID ein.",
            previewAction: "Dry run prüfen",
            previewPending: "Prüfe...",
            executeAction: "Migration ausführen",
            executePending: "Migriere...",
            confirmation: "Willst du die angegebenen Lernenden wirklich auf Gymnasium (DE) umstellen?",
            runFailed: "Bulk-Cutover fehlgeschlagen.",
            requested: "Angefragt",
            eligible: "Migrierbar",
            migrated: "Migriert",
            alreadyCanonical: "Schon DE",
            unsupported: "Nicht unterstützt",
            noCurriculum: "Ohne Curriculum",
            notFound: "Nicht gefunden",
            errors: "Fehler",
            resultsPreview: "Testlauf-Ergebnisse",
            resultsExecution: "Migrationsergebnisse",
            useEligibleIds: "Nur migrierbare IDs übernehmen",
            exportCsv: "CSV herunterladen",
            tableSkillpilotId: "SkillPilot-ID",
            tableStatus: "Status",
            tablePlannedGoals: "Zielbäume",
            tableMessage: "Hinweis",
            statusLabels: {
                eligible: "Migrierbar",
                migrated: "Migriert",
                already_canonical: "Bereits DE",
                unsupported_curriculum: "Nicht unterstützt",
                no_curriculum: "Kein Curriculum",
                not_found: "Nicht gefunden",
                error: "Fehler"
            }
        }
    },
    common: {
        more: "weitere"
    }
}
