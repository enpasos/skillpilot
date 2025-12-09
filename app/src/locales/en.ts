export const en = {
    startPage: {
        subtitle: "Your Personal Learning Navigator",
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
                title: "Data Explorer",
                description: "Manage your progress and curricula."
            }
        },
        login: {
            back: "Back to Selection",
            roles: {
                learner: "Learning",
                trainer: "Teaching",
                explorer: "Explore Curriculum"
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
    }
}
