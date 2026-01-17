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
            text: "**SkillPilot is free.**\nYou only need a ChatGPT account.\n\n**Note on the App:** The ChatGPT mobile app often does not correctly support complex GPT features. We cannot guarantee functionality there and recommend using a **web browser**."
        },
        links: {
            statistics: "Statistics",
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
        navigationHelp: "Navigation: Breadcrumb dropdowns switch between siblings, on the left you see direct and inherited prerequisites, on the right sub-goals and next steps. This keeps the complete context of the current learning goal visible.",
        emptyRequires: "No direct prerequisites",
        emptyInherited: "No inherited prerequisites",
        emptyContains: "No sub-goals",
        emptyNextSteps: "No direct follow-up goals"
    },
    tooltips: {
        progress: "Progress",
        removeFromList: "Remove from learning list",
        addToList: "Add to learning list",
        exportData: "Export data",
        importData: "Import data",
        refresh: "Refresh",
        adjustCurriculum: "Adjust curriculum"
    },
    learner: {
        myGoals: "My Learning Goals",
        marked: "marked",
        completed: "completed",
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
            title: "Register as a Champion",
            description: "Choose a curriculum and sign up as its champion.",
            curriculumLabel: "Curriculum",
            skillpilotLabel: "SkillPilot ID",
            skillpilotPlaceholder: "Your SkillPilot ID",
            githubLabel: "GitHub ID",
            githubPlaceholder: "Your GitHub handle",
            publicNote: "GitHub ID is required and shown publicly. SkillPilot ID is displayed masked.",
            toggleShow: "Register as a champion",
            toggleHide: "Hide registration",
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
        }
    }
}
