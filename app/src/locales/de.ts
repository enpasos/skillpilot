export const de = {
    startPage: {
        subtitle: "so lerne ich ...",
        cards: {
            whitepaper: {
                title: "Whitepaper lesen",
                description: "Erfahre mehr über das Konzept und die Vision."
            },
            gpt: {
                title: "SkillPilot GPT",
                description: "Lerne interaktiv mit deinem KI-Tutor."
            },
            explorer: {
                title: "Cockpit",
                description: "Verfolge deinen Fortschritt im Cockpit."
            },
            curricula: {
                title: "Curriculum Champions",
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
            idLabel: "SkillPilot-ID",
            requestNewId: "Neue ID anfordern",
            idWarning: "Wichtig: Diese ID ist dein einziger Zugang.",
            checkButton: "Weiter",
            checking: "Prüfe...",
            startButton: "Starten",
            dashboardButton: "Dashboard öffnen",
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
            text: "**SkillPilot ist kostenlos.**\nDu benötigst lediglich einen ChatGPT-Account.\n\n**Hinweis zur App:** Die ChatGPT-App unterstützt komplexe GPT-Funktionen leider oft nicht korrekt. Wir können die Funktionalität dort nicht garantieren und empfehlen den **Webbrowser**."
        },
        links: {
            statistics: "Statistiken",
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
        navigationHelp: "Navigation: Breadcrumb-Dropdowns wechseln zwischen Geschwistern, links siehst du direkte und vererbte Voraussetzungen, rechts Unterziele und Nächste Schritte. So bleibt der komplette Kontext des aktuellen Lernziels sichtbar.",
        emptyRequires: "Keine direkten Voraussetzungen",
        emptyInherited: "Keine vererbten Voraussetzungen",
        emptyContains: "Keine Unterziele",
        emptyNextSteps: "Keine direkten Folgeziele"
    },
    tooltips: {
        progress: "Fortschritt",
        removeFromList: "Von Lernliste entfernen",
        addToList: "Als Lernziel setzen",
        exportData: "Daten exportieren",
        importData: "Daten importieren",
        refresh: "Aktualisieren",
        adjustCurriculum: "Lehrplan anpassen"
    },
    learner: {
        myGoals: "Meine Lernziele",
        marked: "markiert",
        completed: "abgeschlossen",
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
        dashboard: "Trainer Dashboard",
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
        emptyState: {
            title: "Wähle einen Kontext",
            text: "Wähle links 'All' aus, um Ziele für die ganze Klasse zu planen.\nOder wähle einen einzelnen Schüler aus, um dessen Lernstand einzusehen oder zu bewerten."
        }
    },
    curriculaPage: {
        subtitle: "Champions bringen Curricula in die Praxis und treiben sie voran.",
        noData: {
            title: "Noch keine Curricula verfügbar.",
            button: "Zurück zur Startseite"
        },
        intro: {
            title: "Was ist ein Curriculum Champion?",
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
                    text: "Verbinde Lehrende, Lernende und Curriculum-Owner."
                }
            ]
        },
        registration: {
            title: "Champion Registrierung & Verwaltung",
            description: "Wähle ein Curriculum um dich als Champion anzumelden, oder verwalte deine bestehenden Championships.",
            curriculumLabel: "Curriculum",
            skillpilotLabel: "SkillPilot-ID",
            skillpilotPlaceholder: "Deine SkillPilot-ID",
            githubLabel: "GitHub-ID",
            githubPlaceholder: "Dein GitHub-Handle",
            publicNote: "GitHub-ID ist erforderlich und öffentlich sichtbar. SkillPilot-ID wird maskiert angezeigt.",
            connectPrompt: "Um dich als Champion zu registrieren, verbinde bitte dein GitHub-Konto.",
            toggleShow: "Champion Registrierung / Verwaltung",
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
        }
    }
}
