"""Read-only reproduction of bounded review fixtures; prints JSON, writes no files."""
import json
import sqlite3
from pathlib import Path

base = Path(__file__).parent
results = []

def check(name, condition):
    assert condition, name
    results.append({"id": name, "passed": True})

db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys=ON")
db.executescript("""
CREATE TABLE Kurs(id INTEGER PRIMARY KEY,titel TEXT NOT NULL);
CREATE TABLE Termin(kurs_id INTEGER NOT NULL REFERENCES Kurs(id),nr INTEGER NOT NULL,
                    datum TEXT,PRIMARY KEY(kurs_id,nr));
CREATE TABLE Person(id INTEGER PRIMARY KEY);
CREATE TABLE Telefon(person_id INTEGER NOT NULL REFERENCES Person(id),nummer TEXT NOT NULL,
                     PRIMARY KEY(person_id,nummer));
CREATE TABLE Lehrkraft(person_id INTEGER PRIMARY KEY REFERENCES Person(id),fach TEXT NOT NULL);
""")

def rejects(name, sql, args):
    try:
        db.execute(sql, args)
    except sqlite3.IntegrityError:
        check(name, True)
    else:
        raise AssertionError(name)

db.executemany("INSERT INTO Kurs VALUES(?,?)", [(10,"Alt"),(20,"Andere")])
db.executemany("INSERT INTO Termin VALUES(?,?,?)", [(10,1,"2026-11-08"),(20,1,"2026-11-09")])
check("weak-local-number-may-repeat-across-owners", db.execute("SELECT count(*) FROM Termin WHERE nr=1").fetchone()[0] == 2)
rejects("weak-duplicate-owner-number-rejected", "INSERT INTO Termin VALUES(?,?,?)", (10,1,"2026-11-10"))
rejects("weak-orphan-rejected", "INSERT INTO Termin VALUES(?,?,?)", (30,1,"2026-11-10"))
db.executemany("INSERT INTO Person VALUES(?)", [(1,),(2,),(3,)])
db.executemany("INSERT INTO Telefon VALUES(?,?)", [(1,"111"),(1,"222"),(2,"111")])
check("multi-repeated-number-and-several-per-person", db.execute("SELECT count(*) FROM Telefon").fetchone()[0] == 3)
check("multi-empty-set-allowed", db.execute("SELECT count(*) FROM Telefon WHERE person_id=3").fetchone()[0] == 0)
rejects("multi-duplicate-pair-rejected", "INSERT INTO Telefon VALUES(?,?)", (1,"111"))
db.execute("INSERT INTO Lehrkraft VALUES(?,?)", (1,"Informatik"))
check("isa-identity-preserved", db.execute("SELECT p.id,l.person_id FROM Person p JOIN Lehrkraft l ON p.id=l.person_id").fetchall() == [(1,1)])
check("isa-not-every-person-a-teacher", db.execute("SELECT count(*) FROM Person WHERE id NOT IN (SELECT person_id FROM Lehrkraft)").fetchone()[0] == 2)
rejects("isa-nonperson-rejected", "INSERT INTO Lehrkraft VALUES(?,?)", (4,"Mathematik"))
cur = db.execute("UPDATE Kurs SET titel=? WHERE id=?", ("Grundlagenkurs",10))
check("no-result-description-is-none", cur.description is None)
check("no-result-one-row-updated", cur.rowcount == 1)
db.commit()
check("no-result-actual-change-other-row-unchanged", db.execute("SELECT id,titel FROM Kurs ORDER BY id").fetchall() == [(10,"Grundlagenkurs"),(20,"Andere")])
check("read-only-query-does-not-establish-update", db.execute("SELECT titel FROM Kurs WHERE id=?", (20,)).fetchone()[0] == "Andere")

contracts = json.loads((base / "proposed-contracts.json").read_text())
goals = json.loads((base / "goal-by-goal.json").read_text())["records"]
sources = json.loads((base / "source-registry.json").read_text())["sources"]
known = {r["goalId"] for r in goals} | {r["id"] for r in contracts["newOrdinaryGoals"]}
source_ids = {r["id"] for r in sources}
check("all-goal-source-ids-resolve", all(s in source_ids for r in goals for s in r["sourceIds"]))
check("both-contracts-known-unique-coverage", all(len(e["examData"]["coveredGoalIds"]) == len(set(e["examData"]["coveredGoalIds"])) and set(e["examData"]["coveredGoalIds"]) <= known for e in contracts["newExams"]))
check("old41-not-repurposed", all(e["id"] != "0df1bedd-5fda-5b3b-a959-c9610237bb3e" and not e["oldResultTransfer"] for e in contracts["newExams"]))
check("new-exams-no-automatic-lk-role", all("LK" not in e["tags"] for e in contracts["newExams"]))
print(json.dumps({"engine":"sqlite3 " + sqlite3.sqlite_version,"checks":results,"passed":len(results),"failed":0}, ensure_ascii=False, indent=2))
