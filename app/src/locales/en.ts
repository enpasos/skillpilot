export const en = {
    startPage: {
        subtitle: "how I learn ...",
        cards: {
            whitepaper: {
                title: "Read Whitepaper",
                description: "Learn more about the concept and vision."
            },
            gpt: {
                title: "SkillPilot GPT",
                description: "Learn interactively with your AI tutor."
            },
            explorer: {
                title: "Cockpit",
                description: "Track your progress in the cockpit."
            },
            curricula: {
                title: "Curriculum Champions",
                description: "Drive curricula forward with the community."
            }
        },
        login: {
            back: "Back to Selection",
            roles: {
                learner: "My Progress",
                trainer: "Course Management (Teachers)",
                explorer: "Explore Content (Experts)"
            },
            idLabel: "SkillPilot ID",
            requestNewId: "Request New ID",
            idWarning: "Important: This ID is your only access key.",
            checkButton: "Continue",
            checking: "Checking...",
            startButton: "Start",
            dashboardButton: "Open Dashboard",
            curriculumLabel: {
                select: "Select Curriculum",
                yours: "Your Curriculum"
            },
            trainerInfo: {
                title: "Local Data Storage",
                text: "Your data is stored locally only."
            }
        },
        banner: {
            text: "**SkillPilot is free.**\nYou only need a ChatGPT account.\n\n**Tip:** For the best connection to your learning progress, we recommend **ChatGPT in the browser**. The ChatGPT app works for text and photos, but not reliably with voice input."
        },
        links: {
            statistics: "Statistics",
            workbench: "Workbench",
            whitepaper: "Whitepaper"
        },
        footer: {
            privacy: "Privacy",
            imprint: "Imprint",
            legal: "Legal"
        }
    },
    statsHub: {
        title: "Statistics",
        subtitle: "Explore the growth of our learning community.",
        back: "Back to Home",
        cards: {
            users: {
                title: "SkillPilot-IDs",
                description: "Overview of generated SkillPilot IDs and community growth."
            },
            successes: {
                title: "Successes",
                description: "Total number of mastered learning goals across the platform."
            }
        }
    },
    explorer: {
        requires: "Prerequisites (requires)",
        inheritedRequires: "Inherited Prerequisites (from parent clusters)",
        externalRequires: "External Prerequisites",
        contains: "Sub-goals (contains)",
        nextSteps: "Next Steps (goals requiring this)",
        nextStepsDirect: "Next Steps (direct)",
        nextStepsInherited: "Next Steps (inherited)",
        requiresFlowToggleLabel: "Requires Flow",
        requiresFlowStateOn: "on",
        requiresFlowStateOff: "off",
        containsChildPickerLabel: "Select sub-goal",
        containsChildPickerPlaceholder: "Choose sub-goal",
        containsChildPickerTitle: "Select a sub-goal from contains children",
        shareContext: "Copy context link",
        navigationHelp: "Navigation: Breadcrumb dropdowns switch between siblings, on the left you see direct and inherited prerequisites, on the right sub-goals and next steps. This keeps the complete context of the current learning goal visible.",
        emptyRequires: "No direct prerequisites",
        emptyInherited: "No inherited prerequisites",
        emptyContains: "No sub-goals",
        emptyNextSteps: "No direct follow-up goals",
        emptyNextStepsInherited: "No inherited follow-up goals"
    },
    tooltips: {
        progress: "Progress",
        removeFromList: "Remove from learning list",
        addToList: "Add to learning list",
        legacyReadOnly: "Read-only in the legacy view",
        projectedStructureBadge: "Structure",
        projectedStructureReadOnly: "Projected structure node; not directly plannable as a learning goal",
        exportData: "Export data",
        importData: "Import data",
        refresh: "Refresh",
        adjustCurriculum: "Adjust curriculum"
    },
    notifications: {
        shareContextCopied: "Context link copied.",
        shareContextFailed: "Copying the context link failed.",
        compatibilityArchiveExported: "Compatibility archive exported.",
        compatibilityArchiveExportFailed: "Compatibility archive could not be exported.",
        learnerImported: "Learner state imported.",
        learnerImportFailed: "Learner state could not be imported.",
        learnerImportValidationFailed: "Import failed: the export file is modified or its signature is invalid.",
        learnerImportSystemFailed: "Import failed: network or system error.",
        learnerExported: "Learner state exported.",
        learnerExportFailed: "Learner state could not be exported.",
        learnerInitialLoadFailed: "Parts of your learner state could not be loaded. Please try refreshing the page later.",
        activeGoalSetFailed: "Active learning goal could not be set.",
        activeGoalSetSystemFailed: "Active learning goal could not be set due to a network or system error.",
        plannedGoalSaveFailed: "Learning focus could not be saved.",
        personalCurriculumSaveFailed: "Personal curriculum could not be saved.",
        preferencesSaveFailed: "Learning preferences could not be saved.",
        trainerClassSaveFailed: "Class data could not be saved locally.",
        trainerPlannedGoalSaveFailed: "This student's learning plan could not be saved.",
        trainerBulkPlannedGoalSaveFailed: "The class learning goal assignment could not be saved.",
        trainerInitialLoadFailed: "Trainer data could not be fully loaded. Please try refreshing the page later.",
        trainerClassDataLoadFailed: "The class learner states or learning plans could not be fully loaded.",
        classExported: "Class exported.",
        classImported: "Class imported.",
        classImportFailed: "Class could not be imported."
    },
    learner: {
        myGoals: "My Learning Goals",
        structureMode: "Structure",
        structureAll: "All",
        structureContent: "Content",
        structureCompetencies: "Competencies",
        loadingGoals: "Preparing learning goals...",
        shareContext: "Copy context link",
        marked: "marked",
        completed: "completed",
        totalInContext: "Goals in context",
        of: "of",
        includesDataFrom: "Includes data from",
        nextSteps: "Your next learning goals are:",
        chooseNext: "Which one would you like to tackle next?",
        velocity: {
            title: "Learning Velocity",
            chartLabel: "Goals Mastered / Week (Last 8 Weeks)",
            recent: "Recent Achievements",
            loading: "Loading history...",
            none: "No mastered goals yet. Keep going!"
        }
    },
    trainer: {
        dashboard: "Trainer Dashboard",
        structureMode: "Structure",
        structureAll: "All",
        structureContent: "Content",
        structureCompetencies: "Competencies",
        shareContext: "Copy context link",
        import: "Import",
        newClass: "New Class",
        students: "Students",
        allClasses: "All Classes",
        studentList: "Student List",
        currentContext: "Current Learning Context",
        assigning: "Assigning...",
        removing: "Removing...",
        removeFromPlan: "Remove from plan of {{count}} students",
        assignToAll: "Set as goal for all {{count}} students",
        selectedGoal: "Selected Goal",
        goalOnPlan: "This goal is on the learning plan of {{name}}.",
        allStudents: "All",
        emptyClasses: "No classes created yet. Start now!",
        classExportTooltip: "Save class locally (JSON)",
        classDeleteTooltip: "Delete class",
        bulkAddDialogTitle: "Add learning goal",
        bulkAddDialogMessage: "Do you want to put \"{{goal}}\" on the learning plan of all {{count}} students?",
        bulkAddDialogConfirm: "Add",
        bulkRemoveDialogTitle: "Remove learning goal",
        bulkRemoveDialogMessage: "Do you want to remove \"{{goal}}\" from the learning plan of all students who currently have it planned ({{count}} students)?",
        bulkRemoveDialogConfirm: "Remove",
        deleteClassDialogTitle: "Delete class",
        deleteClassDialogMessage: "Do you really want to permanently delete the class \"{{name}}\"?",
        deleteClassDialogConfirm: "Delete",
        importClassDialogTitle: "Import class",
        importClassDialogMessage: "Class \"{{name}}\" already exists. Do you want to overwrite it?",
        importClassDialogConfirm: "Overwrite",
        invalidImportFormat: "Invalid file format",
        emptyState: {
            title: "Select a context",
            text: "Select 'All' on the left to plan goals for the whole class.\nOr select an individual student to view or assess their progress."
        }
    },
    curriculaPage: {
        subtitle: "Champions bring curricula to life and keep them practical.",
        noData: {
            title: "No curricula available yet.",
            button: "Back to Home"
        },
        intro: {
            title: "What is a Curriculum Champion?",
            description: "Champions take responsibility for a curriculum and help it work in real practice.",
            comicAlt: "Curriculum Champion comic",
            panels: [
                {
                    title: "Commit",
                    text: "Make the curriculum useful in the context you care about."
                },
                {
                    title: "Learn",
                    text: "Work through the curriculum yourself and collect points."
                },
                {
                    title: "Improve",
                    text: "Open issues and pull requests to refine content and tooling."
                },
                {
                    title: "Connect",
                    text: "Bring teachers, learners, and curriculum owners together."
                }
            ]
        },
        registration: {
            title: "Champion Registration & Management",
            description: "Choose a curriculum to register as a champion, or manage your existing championships.",
            curriculumLabel: "Curriculum",
            skillpilotLabel: "SkillPilot ID",
            skillpilotPlaceholder: "Your SkillPilot ID",
            githubLabel: "GitHub ID",
            githubPlaceholder: "Your GitHub Handle",
            publicNote: "GitHub ID is required and publicly visible. SkillPilot ID will be masked.",
            scopeLabel: "Scope / Subject",
            entireCurriculum: "Entire Curriculum",
            connectPrompt: "To register as a champion, you need a GitHub ID and a SkillPilot ID.",
            createGithub: "No GitHub account? Create one here.",
            noSkillpilotId: "No SkillPilot ID? Create one on the Start Page.",
            generateId: "Generate ID",
            generated: "ID generated",
            toggleShow: "Champion Registration / Management",
            toggleHide: "Hide Section",
            submit: "Register",
            submitting: "Registering...",
            success: "Thanks for championing this curriculum!",
            validation: {
                skillpilotChecking: "Checking SkillPilot ID...",
                skillpilotValid: "SkillPilot ID verified.",
                githubValid: "GitHub ID verified."
            },
            errors: {
                required: "Please fill in all fields.",
                failed: "Registration failed.",
                invalidGithub: "Invalid GitHub ID.",
                unknownSkillpilot: "SkillPilot ID not found.",
                validationRequired: "Please validate SkillPilot and GitHub IDs before registering."
            }
        },
        directory: {
            title: "Curriculum Directory",
            description: "Browse the available curricula and their progress snapshots.",
            noDescription: "No description available.",
            championsLabel: "Champions",
            noChampions: "No champions registered yet.",
            filters: {
                championsLabel: "Champions",
                categoryLabel: "Category",
                champions: {
                    with: "With champions",
                    without: "Without champions",
                    all: "All"
                },
                categories: {
                    all: "All",
                    school: "School",
                    uni: "University",
                    other: "Continuing Ed"
                },
                scopeLabel: "Topics",
                empty: "No curricula match these filters."
            }
        },
        stats: {
            mastered: "Total mastered achievements in this curriculum:",
            masteredShort: "Mastered",
            goals: "Total goals"
        },
        leaderboard: {
            title: "Champion Leaderboard",
            description: "Champions who drive this curriculum forward.",
            empty: "No champions registered for this curriculum yet."
        },
        table: {
            skillpilotId: "SkillPilot ID",
            achievements: "Achievements",
            issues: "Issues",
            prs: "PRs"
        },
        back: "Back to SkillPilot",
        loading: "Loading curricula..."
    },
    usersPage: {
        title: "SkillPilot IDs",
        subtitle: "Overview of generated SkillPilot IDs.",
        loading: "Loading ID stats...",
        empty: "No ID data yet.",
        error: "Unable to load ID statistics.",
        back: "Back to SkillPilot",
        stats: {
            total: "Total IDs",
            totalHint: "All registered IDs",
            achievements: "IDs with achievements",
            achievementsHint: "At least one mastered goal (>= 0.9)",
            rate: "Achievement rate"
        },
        filters: {
            all: "All",
            withAchievements: "With Successes",
            activeLastWeek: "Active Last Week"
        },
        chart: {
            title: "IDs over time",
            subtitle: "Cumulative total",
            totalLabel: "All IDs",
            achievementsLabel: "With successes",
            empty: "No time series data yet.",
            lastUpdated: "Updated"
        },
        operator: {
            title: "Gymnasium DE Cutover",
            description: "Migrate explicit SkillPilot IDs from frozen Hesse upper-secondary views into Gymnasium (DE). Only the supplied IDs are processed.",
            inputLabel: "SkillPilot IDs",
            inputPlaceholder: "One ID per line or separated by commas",
            idCountLabel: "Detected IDs",
            validationRequired: "Please enter at least one SkillPilot ID.",
            previewAction: "Run dry preview",
            previewPending: "Previewing...",
            executeAction: "Execute migration",
            executePending: "Migrating...",
            confirmation: "Do you really want to migrate the supplied learners to Gymnasium (DE)?",
            runFailed: "Bulk cutover failed.",
            requested: "Requested",
            eligible: "Eligible",
            migrated: "Migrated",
            alreadyCanonical: "Already DE",
            unsupported: "Unsupported",
            noCurriculum: "No curriculum",
            notFound: "Not found",
            errors: "Errors",
            resultsPreview: "Dry-run results",
            resultsExecution: "Migration results",
            useEligibleIds: "Use eligible IDs only",
            exportCsv: "Download CSV",
            tableSkillpilotId: "SkillPilot ID",
            tableStatus: "Status",
            tablePlannedGoals: "Planned trees",
            tableMessage: "Message",
            statusLabels: {
                eligible: "Eligible",
                migrated: "Migrated",
                already_canonical: "Already DE",
                unsupported_curriculum: "Unsupported",
                no_curriculum: "No curriculum",
                not_found: "Not found",
                error: "Error"
            }
        }
    },
    common: {
        more: "more"
    }
}
