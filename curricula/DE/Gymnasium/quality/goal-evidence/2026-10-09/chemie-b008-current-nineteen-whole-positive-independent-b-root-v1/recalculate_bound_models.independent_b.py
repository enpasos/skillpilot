"""Independent finite calculations; these do not approve profiles or native pages."""

# SPDX-License-Identifier: Apache-2.0
import csv
import hashlib
import json
from math import isclose, log, sqrt
from pathlib import Path

ROOT = Path(__file__).parent
AUTHOR = ROOT.parent / "chemie-b008-current-nineteen-whole-positive-author-v1"


def binding(path):
    raw = path.read_bytes()
    return {"path": str(path), "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def rows(name):
    with (AUTHOR / name).open(newline="") as stream:
        return list(csv.DictReader(stream))


errors = []
comparisons = 0


def same(actual, claimed, label):
    global comparisons
    comparisons += 1
    if not isclose(actual, float(claimed), rel_tol=1e-11, abs_tol=1e-11):
        errors.append({"label": label, "independentValue": actual, "claimedValue": claimed})


kinetics = {}
for version in ("original", "fresh"):
    data = [row for row in rows("author-reference-kinetics-original-and-fresh.csv") if row["version"] == version]
    times = [float(row["time_min"]) for row in data]
    concentrations = [float(row["model_concentration_mol_per_L"]) for row in data]
    values = [log(c / concentrations[0]) for c in concentrations]
    mt, my = sum(times) / len(times), sum(values) / len(values)
    slope = sum((t - mt) * (y - my) for t, y in zip(times, values)) / sum((t - mt) ** 2 for t in times)
    intercept = my - slope * mt
    residuals = []
    for row, t, y in zip(data, times, values):
        fitted = intercept + slope * t
        residuals.append(y - fitted)
        same(y, row["ln_c_over_c0"], f"{version}: logarithm at {t}")
        same(fitted, row["fitted_ln"], f"{version}: fitted logarithm at {t}")
        same(y - fitted, row["residual"], f"{version}: residual at {t}")
    kinetics[version] = {"slopePerMinute": slope, "intercept": intercept, "residuals": residuals}

for row in rows("author-reference-equilibrium-K1-K2.csv"):
    x = float(row["extent_x"])
    a, b, c, d = 2 - x, 1 - x, 1 + x, 1 + x
    assert a >= 0 and b > 0
    for name, value in (("A", a), ("B", b), ("C", c), ("D", d)):
        same(value, row[name + "_mol_per_L"], f"equilibrium {row['model_K']}, x={x}: {name}")
    same(c * d / (a * b), row["Q"], f"equilibrium {row['model_K']}, x={x}: Q")
valid_root = 4 - sqrt(13)
same((1 + valid_root) ** 2 / ((2 - valid_root) * (1 - valid_root)), 2, "independent admissible K=2 root")
assert 4 + sqrt(13) > 1  # The other algebraic root gives negative B.

for row in rows("author-reference-occupancy-Kd2.csv"):
    ligand, kd = float(row["model_L_micromol_per_L"]), float(row["model_Kd_micromol_per_L"])
    same(ligand / (kd + ligand), row["model_fraction_occupied"], f"occupancy L={ligand}")

for row in rows("author-reference-calibration-domain.csv"):
    absorbance = float(row["model_absorbance"])
    formal = (absorbance - 0.010) / 0.080
    valid = 0.010 <= absorbance <= 0.490
    same(formal, row["formal_model_concentration_mg_per_L"], f"calibration A={absorbance}")
    assert row["valid_within_domain"] == str(valid)
    if valid:
        same(formal, row["reported_model_concentration_mg_per_L"], f"reportable interpolation A={absorbance}")
    else:
        assert row["reported_model_concentration_mg_per_L"] == ""

standard_bounds = [1990 - 20, 1990 + 20]
receipt = {
    "schemaVersion": 1,
    "role": "Independent B finite calculation receipt, not automatic scientific or native approval",
    "csvInputs": [binding(AUTHOR / name) for name in (
        "author-reference-kinetics-original-and-fresh.csv",
        "author-reference-equilibrium-K1-K2.csv",
        "author-reference-occupancy-Kd2.csv",
        "author-reference-calibration-domain.csv",
    )],
    "numericComparisons": comparisons,
    "errors": errors,
    "kinetics": kinetics,
    "fresh20VersusOriginalIdealLine": log(0.050 / 0.100) + 0.05 * 20,
    "idealFirstOrderHalfLifeMinutes": log(2) / 0.05,
    "equilibriumK2AdmissibleExtent": valid_root,
    "volumeFactorBoundsOnly": [19.98 / 10.02, 20.02 / 9.98],
    "acidStandardRelativeHighBias": 0.010 / 0.009 - 1,
    "freshProcessAccepted20": {"freshSolventKgPerKg": 40 / 20, "circulatedKgPerKg": 60 / 20,
        "energyKWhPerKg": 63 / 20, "freshReduction": 1 - (40 / 20) / (100 / 20),
        "energyIncrease": (63 / 20) / (50 / 20) - 1},
    "conductivityStandardNominalBoundsMicrosiemensPerCm": standard_bounds,
    "lowerRangeUpperBoundMicrosiemensPerCm": 2000,
    "completeStandardIntervalCoveredByLowerRange": standard_bounds[1] <= 2000,
    "learnerPerformanceRecorded": False, "humanApproval": False, "humanTrial": False,
    "nativeApproved": False, "strictGain": 0,
}
target = ROOT / "independent-bound-finite-calculations.actual.json"
assert not target.exists(), "Preserve the first calculation receipt; write a new version for changed inputs."
target.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(receipt, ensure_ascii=False))
raise SystemExit(bool(errors))
