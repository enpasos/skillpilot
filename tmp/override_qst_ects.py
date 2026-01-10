import json
from pathlib import Path

MODULE_ECTS = {
    "NAT3013": 5,
    "NAT5018m": 5,
    "NAT5020m": 5,
    "NAT7011": 10,
    "NAT7030": 10,
}

BASE_DIR = Path("/home/enpasos/projects/skillpilot")
QST_DIR = BASE_DIR / "curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json"
PROGRAM_PATH = QST_DIR / "DE_BAY_U_TUM_MSC_QST.de.json"


def update_goal(goal, ects):
    changed = False
    if goal.get("weight") != float(ects):
        goal["weight"] = float(ects)
        changed = True

    tags = goal.get("tags")
    if isinstance(tags, list):
        ects_tag = f"ects:{ects}"
        updated_tags = []
        found = False
        for tag in tags:
            if isinstance(tag, str) and tag.startswith("ects:"):
                if tag != ects_tag:
                    changed = True
                updated_tags.append(ects_tag)
                found = True
            else:
                updated_tags.append(tag)
        if not found:
            updated_tags.append(ects_tag)
            changed = True
        if updated_tags != tags:
            goal["tags"] = updated_tags
            changed = True
    return changed


def find_module_goal(goals, code):
    key = f"tum_{code.lower()}_module"
    for goal in goals:
        if goal.get("shortKey") == key:
            return goal
    return None


def update_module_file(code, ects):
    path = QST_DIR / f"DE_BAY_U_TUM_{code}.de.json"
    if not path.exists():
        raise FileNotFoundError(path)
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    goals = data.get("goals", [])
    goal = find_module_goal(goals, code)
    if goal is None and goals:
        goal = goals[0]

    if goal is None:
        raise ValueError(f"No goals found in {path}")

    changed = update_goal(goal, ects)

    if changed:
        with path.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
            f.write("\n")
    return changed


def update_program_file():
    with PROGRAM_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)

    goals = data.get("goals", [])
    changed = False

    for code, ects in MODULE_ECTS.items():
        goal = find_module_goal(goals, code)
        if goal is None:
            continue
        if update_goal(goal, ects):
            changed = True

    if changed:
        with PROGRAM_PATH.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
            f.write("\n")
    return changed


if __name__ == "__main__":
    any_changed = False
    for code, ects in MODULE_ECTS.items():
        if update_module_file(code, ects):
            any_changed = True
    if update_program_file():
        any_changed = True

    if not any_changed:
        print("No changes needed.")
