export const de = {
    startPage: {
        subtitle: "so lerne ich",
        cards: {
            whitepaper: {
                title: "Whitepaper lesen",
                description: "Erfahre mehr über das Konzept und die Vision."
            },
            gpt: {
                title: "SkillPilot GPT starten",
                description: "Lerne interaktiv mit deinem KI-Tutor."
            },
            explorer: {
                title: "Meine Erfolge",
                description: "Verfolge deinen Fortschritt im Cockpit."
            },
            hallOfFame: {
                title: "Hall of Fame",
                description: "Die erfolgreichsten Lerner der Community."
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
        footer: {
            privacy: "Datenschutz",
            imprint: "Impressum",
            legal: "Rechtliches"
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
    hallOfFamePage: {
        subtitle: "Wir feiern die engagiertesten Lerner auf SkillPilot.",
        noData: {
            title: "Noch keine Champions. Sei der Erste!",
            button: "Jetzt lernen"
        },
        stats: {
            mastered: "Insgesamt gemeisterte Ziele aller Lerner:",
            goals: "Ziele gesamt"
        },
        table: {
            learnerId: "Lerner-ID",
            goals: "ZIELE"
        },
        back: "Zurück zu SkillPilot",
        loading: "Lade Hall of Fame..."
    }
}
