import json
from pathlib import Path

BASE = Path("/home/enpasos/projects/skillpilot")
msc_path = BASE / "curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_MSC_QST.de.json"
mod_3034_path = BASE / "curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_NAT3034.de.json"
mod_3035_path = BASE / "curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_NAT3035.de.json"

def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))

msc = load(msc_path)
mod_3034 = load(mod_3034_path)
mod_3035 = load(mod_3035_path)

new_3034_goals = mod_3034.get("goals", [])
new_3035_goals = mod_3035.get("goals", [])

if not new_3034_goals or not new_3035_goals:
    raise SystemExit("Module goals missing for NAT3034 or NAT3035")

old_goals = msc.get("goals", [])

def is_target(goal):
    short_key = goal.get("shortKey", "")
    return short_key.startswith("tum_nat3034_") or short_key.startswith("tum_nat3035_")

indices = [i for i, g in enumerate(old_goals) if is_target(g)]
filtered = [g for g in old_goals if not is_target(g)]

if indices:
    insert_at = min(indices)
    removed_before = sum(1 for i in indices if i < insert_at)
    insert_at = insert_at - removed_before
else:
    insert_at = len(filtered)

new_goals = (
    filtered[:insert_at]
    + new_3034_goals
    + new_3035_goals
    + filtered[insert_at:]
)

msc["goals"] = new_goals

# Ensure NAT3034/3035 module roots are contained in the core modules container.
core_container = None
for goal in msc["goals"]:
    if goal.get("shortKey") == "tum_msc_qst_c1":
        core_container = goal
        break

if core_container is None:
    raise SystemExit("Core modules container (tum_msc_qst_c1) not found.")

core_contains = list(core_container.get("contains", []))
for module_id in [
    new_3034_goals[0]["id"],
    new_3035_goals[0]["id"],
]:
    if module_id not in core_contains:
        core_contains.append(module_id)
core_container["contains"] = core_contains

msc_path.write_text(
    json.dumps(msc, ensure_ascii=False, indent=4) + "\n",
    encoding="utf-8",
)

print("Updated MSc QST graph with NAT3034 and NAT3035 goals.")
