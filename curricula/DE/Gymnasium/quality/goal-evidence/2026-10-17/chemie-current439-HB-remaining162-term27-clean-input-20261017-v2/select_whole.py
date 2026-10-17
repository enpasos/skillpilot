# SPDX-License-Identifier: Apache-2.0
"""Read-only selector: print complete scientific bodies, deduplicated per call."""
import argparse
import hashlib
import json
from pathlib import Path


def digest_object(value):
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True,
                     separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def main():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument("--ordinal", type=int, action="append", default=[])
    args.add_argument("--term-set", type=int, action="append", default=[])
    args.add_argument("--seen", action="append", default=[], metavar="GOAL_UUID",
                      help="Already read full scientific body; repeat per UUID.")
    args.add_argument("--summary", action="store_true")
    options = args.parse_args()
    here = Path(__file__).resolve().parent
    root = next(p for p in here.parents if (p / "contracts").is_dir()
                and (p / "curricula").is_dir() and (p / "app").is_dir())
    packet = json.loads((here / "INPUT.remaining162-term27.neutral.json").read_text())
    if options.summary:
        print(json.dumps(packet["reuseInventory"], ensure_ascii=False, indent=2))
        return
    if not (options.ordinal or options.term_set):
        args.error("Select --ordinal 71..232 and/or --term-set 1..27.")
    wanted = []
    printed_passages = set()
    for n in options.ordinal:
        if not 71 <= n <= 232:
            args.error("Source ordinal must be between 71 and 232.")
        row = packet["sourceClauses"][n - 71]
        print(json.dumps({"selectedSourceClause": row}, ensure_ascii=False, indent=2))
        passage_id = row["originalSourceGoal"]["passageId"]
        if passage_id not in printed_passages:
            passage = next(x for x in packet["originalSourcePassages"]
                           if x["id"] == passage_id)
            print(json.dumps({"wholeOriginalSourcePassage": passage},
                             ensure_ascii=False, indent=2))
            printed_passages.add(passage_id)
        wanted.extend(row["proposedUnionCarrierIds"])
    for n in options.term_set:
        if not 1 <= n <= 27:
            args.error("Term-set ordinal must be between 1 and 27.")
        row = packet["mandatoryTermSets"][n - 1]
        print(json.dumps({"selectedMandatoryTermSet": row}, ensure_ascii=False, indent=2))
        for term in row["unreviewedTermBindingProposals"]:
            wanted.extend(term["proposedCarrierIds"])
    wanted = list(dict.fromkeys(wanted))
    seen = set(options.seen)
    needed = [g for g in wanted if g not in seen]
    index = {r["goalId"]: r for r in packet["wholeBodyIndex"]}
    for g in seen:
        if g not in index:
            args.error("--seen UUID is not a carrier in this packet: " + g)
    for key in ["C54", "P439"]:
        pin = packet["centralInputs"][key]
        raw = (root / pin["path"]).read_bytes()
        assert len(raw) == pin["bytes"]
        assert hashlib.sha256(raw).hexdigest() == pin["sha256"]
    canonical = json.loads((root / packet["centralInputs"]["C54"]["path"]).read_text())
    p_lines = (root / packet["centralInputs"]["P439"]["path"]).read_bytes().splitlines(keepends=True)
    for gid in needed:
        entry = index[gid]
        goal = canonical["goals"][entry["canonicalGoalIndex1Based"] - 1]
        raw = p_lines[entry["PRecordLine1Based"] - 1]
        record = json.loads(raw)
        assert goal["id"] == record["goalId"] == gid
        assert hashlib.sha256(raw).hexdigest() == entry["PRecordLineSHA256"]
        assert digest_object(goal) == entry["wholeGoalBodySHA256"]
        assert digest_object(record["profile"]) == entry["wholeProfileBodySHA256"]
        print(json.dumps({"goalId": gid, "wholeCanonicalGoal": goal,
                          "wholeScientificProfile": record["profile"],
                          "identity": entry}, ensure_ascii=False, indent=2))
    print(json.dumps({"wholeBodiesPrinted": needed,
                      "alreadyReadNotReprinted": [g for g in wanted if g in seen],
                      "reviewJudgment": None}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
