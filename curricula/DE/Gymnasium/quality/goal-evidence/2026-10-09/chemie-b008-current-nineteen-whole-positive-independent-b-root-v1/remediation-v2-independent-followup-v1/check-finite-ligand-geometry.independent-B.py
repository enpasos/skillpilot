"""Independent arithmetic/geometry check of the actual finite teaching kit."""

import csv
import hashlib
import itertools
import json
import math
from collections import Counter
from pathlib import Path

BASE = Path(__file__).resolve().parent
REPO = next(parent for parent in BASE.parents if (parent / "AGENTS.md").is_file())
AUTHOR = REPO / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-nineteen-whole-positive-author-v1/remediation-v2"


def read(name):
    return json.loads((AUTHOR / name).read_text())


def sub(a, b):
    return tuple(x - y for x, y in zip(a, b))


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def norm(a):
    return math.sqrt(dot(a, a))


def dist(a, b):
    return norm(sub(a, b))


def cross(a, b):
    return (a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0])


def angle(a, origin, b):
    u, v = sub(a, origin), sub(b, origin)
    return math.degrees(math.acos(max(-1, min(1, dot(u, v) / (norm(u) * norm(v))))))


model = read("finite-L-L2-receptor-geometries.author-candidate.json")
extra = read("finite-L2-extra-OH-transfer-layout.author-candidate.json")
poses = model["ligandPoses"]
bonds = model["bonds"]
contacts = {k: r["xyz_A"] for k, r in model["receptorFixedContacts"].items()}
adjacent = {k: [] for k in poses["L"]}
for b in bonds:
    adjacent[b["a"]].append(b["b"])
    adjacent[b["b"]].append(b["a"])

observations = {}
for name, atoms in poses.items():
    counts = Counter(atom["element"] for atom in atoms.values())
    assert counts == {"C": 10, "H": 15, "N": 2, "O": 1}, counts
    assert sum(atom["formalCharge"] for atom in atoms.values()) == 1
    assert atoms["Nplus"]["formalCharge"] == 1
    assert len(atoms) == 28 and len(bonds) == 28
    for atom_id, atom in atoms.items():
        expected = {"C": 4, "H": 1, "O": 2}.get(atom["element"])
        if atom_id == "Nplus":
            assert len(adjacent[atom_id]) == 4
        elif atom_id == "N4":
            assert len(adjacent[atom_id]) == 3
        elif expected:
            order = sum(1.5 if b["order"] == "aromatic" else 1 if b["order"] == "amide-restricted" else b["order"] for b in bonds if atom_id in [b["a"], b["b"]])
            assert order == expected, (name, atom_id, order)
    xyz = {k: atom["xyz_A"] for k, atom in atoms.items()}
    tetra = {}
    for centre in ["Nplus", "C1", "C2", "C5"]:
        values = [angle(xyz[a], xyz[centre], xyz[b]) for a, b in itertools.combinations(adjacent[centre], 2)]
        assert all(abs(value - math.degrees(math.acos(-1/3))) < 1e-8 for value in values), (name, centre, values)
        tetra[centre] = {"minAngle": min(values), "maxAngle": max(values)}
    assert all(abs(xyz[k][2]) < 1e-12 for k in ["C2", "C3", "O", "N4", "HN4", "C5"])
    ring = [xyz[f"P{i}"] for i in range(1, 7)]
    normal = cross(sub(ring[1], ring[0]), sub(ring[2], ring[0]))
    plane_errors = [abs(dot(sub(point, ring[0]), normal)) / norm(normal) for point in ring]
    assert max(plane_errors) < 1e-12
    centre = [sum(point[i] for point in ring) / 6 for i in range(3)]
    ionic, hydrogen, hydrophobic = dist(xyz["Nplus"], contacts["Rnegative"]), dist(xyz["O"], contacts["Hdonor"]), dist(centre, contacts["Rhydrophobic"])
    donor_angle = angle(contacts["D"], contacts["Hdonor"], xyz["O"])
    assert abs(hydrogen - 2) < 1e-10 and abs(hydrophobic - 3.5) < 1e-10 and abs(donor_angle - 180) < 1e-10
    observations[name] = {"formulaElementCounts": dict(counts), "formalCharge": 1, "tetrahedralAngles": tetra, "amidePlaneMaxZ": 0, "phenylPlaneMaxError": max(plane_errors), "ionicDistance": ionic, "hydrogenDistance": hydrogen, "hydrophobicDistance": hydrophobic, "D_H_O_angle": donor_angle}

assert abs(observations["L"]["ionicDistance"] - 3.4) < 1e-12
assert abs(observations["L2"]["ionicDistance"] - 6.190714763082907) < 1e-12
for atom in model["registrationAtoms"]:
    assert poses["L"][atom] == poses["L2"][atom]
for b in bonds:
    lengths = [dist(p[b["a"]]["xyz_A"], p[b["b"]]["xyz_A"]) for p in poses.values()]
    assert abs(lengths[0] - lengths[1]) < 1e-10

cards = list(csv.DictReader((AUTHOR / "printable-L-L2-atom-and-contact-coordinate-cards.tsv").open(), delimiter="\t"))
assert len(cards) == 60
for row in cards:
    actual = contacts[row["card_id"]] if row["pose"] == "R" else poses[row["pose"]][row["card_id"]]["xyz_A"]
    for axis, value in zip(["x", "y", "z"], actual):
        assert abs(float(row[axis]) - value) <= 5.1e-7
    for axis, value in zip(["X", "Y", "Z"], actual):
        assert abs(float(row[f"mount_{axis}_mm"]) - (80 + 10*value)) <= .00051
rods = list(csv.DictReader((AUTHOR / "printable-ligand-connectivity-and-rod-lengths.tsv").open(), delimiter="\t"))
assert len(rods) == 28
for row, b in zip(rods, bonds):
    assert [row["atom_a"], row["atom_b"]] == [b["a"], b["b"]]
    assert abs(float(row["rod_length_mm"]) - 10*dist(poses["L"][b["a"]]["xyz_A"], poses["L"][b["b"]]["xyz_A"])) <= .00051

xyz = {k: r["xyz_A"] for k, r in poses["L2"].items()}
assert extra["deleteAtomIds"] == ["HC5_1"]
ox, hx = extra["addedAtoms"]["OX"]["xyz_A"], extra["addedAtoms"]["HX"]["xyz_A"]
assert abs(dist(xyz["C5"], ox)-1.43) < 1e-12 and abs(dist(ox, hx)-.97) < 1e-12
assert abs(angle(xyz["C5"], ox, hx)-108) < 1e-10
assert abs(dist(ox, contacts["Hdonor"])-3.735321190769954) < 1e-12

out = BASE / "actual-finite-geometry-and-printable-materials.independent-B.json"
assert not out.exists()
out.write_text(json.dumps({"schemaVersion": 1, "role": "Independent calculations from actual authored coordinates/cards, not copied author arithmetic; not an actual assembled learner model", "poses": observations, "exactSameConnectivityAndCharge": True, "bondLengthsPreservedByTorsion": True, "printableCardsChecked": 60, "printableRodsChecked": 28, "freshOH": {"C5_OX": dist(xyz["C5"], ox), "OX_HX": dist(ox, hx), "C5_OX_HX_angle": angle(xyz["C5"], ox, hx), "OX_Hdonor": dist(ox, contacts["Hdonor"]), "originalIonicDistanceRemains": observations["L2"]["ionicDistance"]}, "hypotheticalModelOnly": True, "humanApproval": False, "actualLearnerConstruction": False, "strictGain": 0}, ensure_ascii=False, indent=2)+"\n")
print(json.dumps({"path": str(out.relative_to(REPO)), "sha256": hashlib.sha256(out.read_bytes()).hexdigest(), "bytes": out.stat().st_size, "geometry": observations, "cards": 60, "rods": 28}))
