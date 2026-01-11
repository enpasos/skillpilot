export const en = {
    startPage: {
        subtitle: "how I learn",
        cards: {
            whitepaper: {
                title: "Read Whitepaper",
                description: "Learn more about the concept and vision."
            },
            gpt: {
                title: "Start SkillPilot GPT",
                description: "Learn interactively with your AI tutor."
            },
            explorer: {
                title: "My Achievements",
                description: "Track your progress in the cockpit."
            },
            hallOfFame: {
                title: "Hall of Fame",
                description: "Top learners of the community."
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
        footer: {
            privacy: "Privacy",
            imprint: "Imprint",
            legal: "Legal"
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
    hallOfFamePage: {
        subtitle: "Celebrating the most dedicated learners on SkillPilot.",
        noData: {
            title: "No champions have risen yet. Be the first!",
            button: "Start Learning"
        },
        stats: {
            mastered: "Total Mastered Goals across all learners:",
            goals: "Total Goals"
        },
        table: {
            learnerId: "Learner ID",
            goals: "GOALS"
        },
        back: "Back to SkillPilot",
        loading: "Loading Hall of Fame..."
    }
}
