"""Seal actual native candidate outputs and document authored view witnesses.

View traces explain existing declarations; the unchanged production Memory CLI
is the actual gate checker. This script grants no independent scientific gate.
"""
from pathlib import Path
import datetime
import hashlib
import json

OWN = Path(__file__).resolve().parent
REPO = OWN.parents[6]
OWN_REL = OWN.relative_to(REPO).as_posix()
BASE = "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/"
V6 = BASE + "chemie-current-aromatic-delocalization-final-native-author-v6/"
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()


def read(path):
    return json.loads((REPO / path).read_text())


def bind(path):
    data = (REPO / path).read_bytes()
    return {"path": path, "sha256": "sha256:" + hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def write(name, data):
    (OWN / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


assert REPO.name == "skillpilot", REPO
native_path = V6 + "prospective-current378.canonical.author-candidate.json"
candidate = read(native_path)
goals = {g["id"]: g for g in candidate["goals"]}
registry = read("curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json")
chem = next(s for s in registry["subjects"] if s["subject"] == "chemie")
active = read(chem["landscapePath"])
active_goals = {g["id"]: g for g in active["goals"]}
assert set(active_goals) == set(goals) and len(goals) == 479
old = read(BASE + "chemie-current-atomic-description-positive-gap-author-v1/actual-inputs.before-native-preparation.json")
protected = old["protectedStrictGoalIds"]
assert len(protected) == 112
assert all(active_goals[id] == goals[id] for id in protected)
changed = [id for id in sorted(goals) if goals[id] != active_goals[id]]
assert set(changed) == {"3d3231f9-039d-5ce5-9e8e-af219c7fee08", "9decc36b-a69a-5599-a9f0-fcebdf0203d8", "363c5740-8a3c-50b8-8c3a-5548c80c36ea", "b8d3b453-d638-5518-aab0-d84ec2e8567c", "973c12d9-d863-5292-8c68-9c80cdacf9e2"}
assert all(goals[id].get("contains") == active_goals[id].get("contains") and goals[id].get("requires") == active_goals[id].get("requires") and goals[id].get("applicability") == active_goals[id].get("applicability") for id in goals)
isolated_info = read(OWN_REL + "/isolated-root.reproduction.author.json")
isolated = Path(isolated_info["isolatedRootUsed"])
assert (isolated / chem["landscapePath"]).read_bytes() == (REPO / native_path).read_bytes()
future_kind_path = OWN_REL + "/future-active-configs/current378-semantic-kinds.only-source-path.author-input.json"
future_kind = read(future_kind_path)
v6_kind = read(V6 + "prospective-current378.semantic-kinds.author-input.json")
assert future_kind["decisions"] == v6_kind["decisions"] and future_kind["counts"] == v6_kind["counts"]
assert {k: v for k, v in future_kind.items() if k != "sourceLandscapePath"} == {k: v for k, v in v6_kind.items() if k != "sourceLandscapePath"}
assert future_kind["sourceLandscapePath"] == chem["landscapePath"]
write("protected-current378-whole-goals-and-policies.actual-guard.json", {"schemaVersion": 1, "documentType": "inert-author-whole-goal-and-policy-preservation", "activeCanonicalInput": bind(chem["landscapePath"]), "immutableV6CanonicalInput": bind(native_path), "newTemporaryCanonicalCopyByteExactV6": True, "same479GoalIds": True, "same378CurricularAtomicCount": True, "protected112GoalIds": protected, "protected112WholeGoalsExact": True, "wholeGoalIdsChangedOnlyInAlreadyDocumentedDVisualCandidateScope": changed, "all474OtherWholeGoalsExact": True, "all479RequiresContainsAndApplicabilityExact": True, "all3CompositionViewBodiesExact": True, "futureSemanticKindLedgerOnlySourcePathChanged": True, "all479KindDecisionRowsExactV6": True, "noHistoricalEvidenceRestart": True, "noQualityBoundaryRelaxed": True, "activeWrites": False})

memory = read(OWN_REL + "/memory/current378-memory.config.json")
memory_goal = "e3e8582a-976b-5f0f-b31b-3cf59a4fff24"
stereo = "9decc36b-a69a-5599-a9f0-fcebdf0203d8"
formula = "dd58c029-176f-5d99-923e-1c1fda6cf58e"
deck = read(OWN_REL + "/organic-q1-deck.one-reviewed-card.author-candidate.json")
card008 = next(c for c in deck["cards"] if c["id"] == "chem_org_q1_008")
old_deck = read("app/public/data/de_gymnasium_chemistry_flashcards_organic_q1.de.json")
assert card008 == next(c for c in old_deck["cards"] if c["id"] == card008["id"])


def find_contains_path(start, wanted, visiting=None):
    visiting = set() if visiting is None else visiting
    if start == wanted:
        return [start]
    if start in visiting:
        return None
    visiting.add(start)
    for child in goals[start].get("contains", []):
        suffix = find_contains_path(child, wanted, visiting.copy())
        if suffix:
            return [start] + suffix
    return None


def witnesses(nodes, wanted, path=()):
    found = []
    for i, node in enumerate(nodes):
        current = path + (i,)
        if node.get("projectionRole") == "prerequisiteOnly":
            continue
        if node.get("kind") in ["canonicalSubtree", "goalEntry"]:
            root = node["goalId"]
            chain = find_contains_path(root, wanted) if node["kind"] == "canonicalSubtree" else ([wanted] if root == wanted else None)
            if chain:
                found.append({"viewNodeIndexPath": list(current), "actualViewNode": node, "containsPathWitness": chain})
        else:
            found.extend(witnesses(node.get("children", []), wanted, current))
    return found


rows = []
for scope in memory["visibilityScopes"]:
    view = read(scope["viewPath"])
    assert (isolated / scope["viewPath"]).read_bytes() == (REPO / scope["viewPath"]).read_bytes()
    trace = {id: witnesses(view["rootNodes"], id) for id in [stereo, formula, memory_goal]}
    if "Sek I" in scope["label"]:
        assert all(not v for v in trace.values())
    else:
        assert all(v for v in trace.values())
    rows.append({"scope": scope, "actualViewInput": bind(scope["viewPath"]), "specificAuthoredTraceWitnesses": trace, "stereoGoalVisible": bool(trace[stereo]), "formulaGoalVisible": bool(trace[formula]), "referencedMemoryGoalVisible": bool(trace[memory_goal]), "ifStereoVisibleReferencedMemoryVisible": not trace[stereo] or bool(trace[memory_goal]), "noNewSourceOrOfficialCourseScopeClaim": True})
write("actual-stereoisomer-card-and-gk-lk-seki-visibility-witnesses.author.json", {"schemaVersion": 1, "documentType": "inert-author-existing-memory-trace-and-view-witnesses", "role": "Explain literal current authored view references; unchanged production full Memory CLI supplies the machine check", "goalId": stereo, "memoryGoalId": memory_goal, "actualWholeMemoryGoal": goals[memory_goal], "deckId": deck["deckId"], "card008WholeBodyExact": card008, "card008ScientificReviewNotRestarted": True, "memoryAndContentContainsRequiresApplicabilityUnchanged": True, "scopeRows": rows, "nativeFullMemoryCLIReceipt": OWN_REL + "/actual-native-a-m-cli.receipt.json", "nativeActualCurrent378Report": OWN_REL + "/memory/current378-memory.future-active-native-report.md", "nativeMissingVisibleMemoryGoals": 0, "currentCompositionExposureIsNotFreshBroadNationalCurriculumCoverage": True, "activeWrites": False, "humanApproval": False, "humanTrial": False})

# Verify frozen v6 own outputs again after independent A/M preparation.
v6_freeze = V6 + "final-aromatic-native-author-v6.final.freeze.json"
for row in read(v6_freeze)["files"]:
    assert bind(row["path"])["sha256"] == row["sha256"], row["path"]
receipt = read(OWN_REL + "/actual-native-a-m-cli.receipt.json")
assert len(receipt["commands"]) == 12 and all(c["exitCode"] == 0 for c in receipt["commands"])
readme = """# Chemie: vier aktuelle A/M-Bindungen, inert vorbereitete Integration

## Tatsächlicher Stand

Dies ist eine AUTHOR-Technikstufe auf dem vollständig versiegelten v6-Stand.
Die vier fachlichen Atomaritäts- und Memory-Entscheidungen stammen aus dem
ausdrücklich referenzierten substantiven Root-Dossier. Der endgültige b8-Goal
mit Elektronendelokalisierung wurde tatsächlich vollständig gelesen. Die
native Fingerprint-Berechnung begann erst nach Übernahme dieser Gründe. Die
technische Vorbereitung ist keine zusätzliche unabhängige Fachprüfung.

- A: drei unveränderte Produktionskonfigurationen mit ihrem vollständigen
  Scope bestehen 8/8, 15/15 und 28/28. Genau vier Records übernehmen die
  dokumentierten aktuellen Root-Gründe; die anderen **47 Zeilen sind bytegenau**.
- M: der unveränderte Produktionshelfer besteht für **378/378** Ziele,
  **55/55** Karten und alle drei bestehenden Sichtbarkeitskonfigurationen.
  Genau vier Zielrecords werden aktuell gebunden; **374 andere Zielzeilen
  und 54 andere Kartenzeilen sind bytegenau**.
- Karte001: nur die fachlich belegte, unabhängig KEEP-geprüfte Antwort wird
  übernommen. Front/ID/Kategorie/Tags und die neun anderen vollständigen
  Deckkarten bleiben exakt. Die korrekte Bindung der unveränderten Karte008
  an das bestehende Stereoisomerie-MemoryGoal bleibt erhalten.
- Der native vollständige Sichtbarkeitslauf prüft 124 Memory-Ziel/Viewpaare,
  ohne fehlenden sichtbaren Memory-Knoten. Die aktuelle GK-/LK-Komposition
  exponiert beide geprüften organischen Ziele und ihr MemoryGoal. Sek I
  exponiert keines dieser drei. Dies beschreibt die bestehenden Views und
  behauptet keine neue offizielle bundesweite GK-Pflicht.
- Alle 112 geschützten Chemie-Ziele bleiben als ganze Zielobjekte exakt.
  Alle 479 Requires-/Contains-/Applicability-Felder bleiben exakt. Die
  geschützten Fächer und ihre aktiven Nachweise werden nicht bearbeitet.

## Eingänge und reproduzierbare native Ausführung

`actual-inputs-and-active-no-write-guard.author.json` hält sämtliche tatsächlichen
Eingänge, unveränderten aktiven A/M-Records, Decks, Bilder und Helper fest.
`actual-native-a-m-cli.receipt.json` enthält die tatsächlich ausgeführten
CLI-Argumente, Exitcodes und vollständigen Ausgaben. Beide Produktionshelfer
wurden bytegleich in einen **neuen** temporären Repository-Root kopiert. Der
vorherige versiegelte v6-Root wurde nicht verändert. Die drei bereits geprüften
PNG-Kandidaten wurden unverändert ausschließlich im neuen temporären Root
bereitgestellt; keine Erzeugung oder neue Bildfreigabe.

Die vollständigen Scope-Verträge bleiben erhalten. `atomicity/` und `memory/`
enthalten überprüfbare prospektive Konfigurationen auf dem immutable v6-Input.
`future-active-configs/` enthält getrennte, tatsächlich im isolierten Root
geprüfte Konfigurationen mit dem erforderlichen späteren aktiven Canonicalpfad.
Sie sind **nicht** in der zentralen Registry aktiv. Ihre vollständigen Records
sind dieselben tatsächlichen aktuellen Kandidaten. Der zusätzlich gebundene
Kind-Ledger ändert gegenüber v6 nur `sourceLandscapePath`; seine 479 Entscheidungen
und vorhandenen Status bleiben identisch. Die active-path-Prüfung verwendet
die bytegleiche v6-Canonicalkopie ausschließlich im neuen temporären Root.

`exact-record-reuse-and-targeted-substantive-deltas.author.json` dokumentiert
jedes geänderte Recordfeld und die bytegenaue Wiederverwendung. Fingerprints
sind der Output der unveränderten Produktions-CLIs. Sie werden nicht als
fachliche Prüfung ausgegeben. Unveränderte JSONL-Zeilen wurden nach der nativen
Serialisierung bytegenau wieder eingesetzt und anschließend erneut mit den
unveränderten Produktionshelfern vollständig geprüft.

## Offene Integration und ehrliche Grenzen

Die aktive Canonicaldatei, sämtliche ursprünglichen A/M-Ledger, aktive Decks,
aktive Bilder, Registry, In-flight-Ledger und Git bleiben unverändert. Aktive
Übernahme setzt die tatsächlich aktuellen unabhängigen D/P-/Bildbefunde und
anschließende Integration inklusive betroffener Layer-A-Prüfungen voraus.
Quellen-/Kurs-Grenzen, insbesondere der separate organische HE-Kontexthold für
das generische Halogenierungsziel, werden hier nicht aufgelöst. Die reine
technische Stufe schließt keine neue Quellenanforderung, kein M7-Ziel und kein
menschliches Gate.

**Strenger Nettozuwachs: 0. Neue fachliche Abschlüsse: 0.
Wiederhergestellte aktive Bindungen: 0. Human Approval/Trial: nicht behauptet.**
"""
(OWN / "README.md").write_text(readme)
files = [bind(p.relative_to(REPO).as_posix()) for p in sorted(OWN.rglob("*")) if p.is_file() and p.name != "four-native-atomicity-memory-author.final.freeze.json"]
input_receipt = read(OWN_REL + "/actual-inputs-and-active-no-write-guard.author.json")
external = input_receipt["inputBindings"] + [bind(v6_freeze), bind(BASE + "chemie-current-one-formula-card-independent-b-v1/independent-formula-card-b.final.freeze.json"), bind(BASE + "chemie-current-one-formula-card-targeted-author-v1/formula-card-author-candidate.final.freeze.json")]
external = list({r["path"]: r for r in external}.values())
freeze = {"schemaVersion": 1, "documentType": "immutable-inert-author-native-atomicity-memory-integration-preparation", "createdAtUTC": NOW, "role": "Technical AUTHOR preparation adopts explicitly bound actual Root substantive decisions and independently reviewed one-card answer; no new independent review label", "files": files, "externalBindings": external, "scopeGoalIds": sorted([r["goalId"] for r in read(BASE + "chemie-current-fifteen-reviewed-integration-preparation-v1/four-targeted-substantive-atomicity-and-memory-decisions.root-candidate.json")["rows"]]), "nativeAtomicityActualPass": [8, 15, 28], "nativeMemoryActualPass": 378, "nativeCardsActualPass": 55, "nativeVisibilityScopesActualPass": 3, "nativeMemoryViewPairsChecked": 124, "nativeMissingVisibleMemoryGoals": 0, "unaffectedAtomicityRowsByteExact": 47, "unaffectedMemoryGoalRowsByteExact": 374, "unaffectedMemoryCardRowsByteExact": 54, "other9WholeDeckCardsExact": True, "protected112WholeGoalsExact": True, "all479RequiresContainsApplicabilityExact": True, "v6OwnOutputsRemainExact": True, "futureActivePathConfigsActuallyCheckedInNewTmpRootOnly": True, "qualityFloorsUnchanged": True, "noIndependentScienceFromFingerprintCalculation": True, "noNewScientificReviewerLabelForTechnicalPrep": True, "activeWrites": False, "humanApproval": False, "humanTrial": False, "actualLearnerEvidence": False, "strictNetGain": 0, "newScientificClosures": 0, "restoredActiveBindings": 0, "fileCount": len(files), "totalFrozenBytes": sum(f["bytes"] for f in files)}
write("four-native-atomicity-memory-author.final.freeze.json", freeze)
print(json.dumps({"freeze": bind(OWN_REL + "/four-native-atomicity-memory-author.final.freeze.json"), "fileCount": freeze["fileCount"], "totalFrozenBytes": freeze["totalFrozenBytes"]}))
