"""Freeze only selected source inputs; never load review ledgers or P profiles."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import re

import fitz
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
PREFIXES = ("542822de", "1df17884", "1f354a60")


def read(path):
    return json.loads((ROOT / path).read_text())


def norm(value):
    return re.sub(r"[\W_]", "", value.replace("\u00ad", "").replace("\ufffd", "").lower())


def by_url(topic):
    year = re.search(r"C(\d+)", topic)[1]
    suffix = "/ch-ntg" if "NTG" in topic else "/ch" if "HG_" in topic else "/grundlegend" if "GA" in topic else "/erhoeht" if "EA" in topic else ""
    return f"https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/{year}/chemie{suffix}"


def save(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


author = json.loads((OUT / "inputs/author-source-requirements-and-scope-deltas.candidates.json").read_text())
by = read("curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json")
by_goals = {g["id"]: g for g in by["sourceGoals"]}
selected = []
for row in author["BYDirectClauseRouting"]:
    if not row["oldCanonicalGoalId"].startswith(PREFIXES):
        continue
    for occurrence in row["sourceOccurrences"]:
        g = by_goals.get(occurrence["sourceGoalId"], by_goals[row["sourceGoalId"]])
        topic = occurrence["topicCode"]
        selected.append({"originGoalId": row["oldCanonicalGoalId"], "sourceGoalId": row["sourceGoalId"], "occurrenceSourceGoalId": occurrence["sourceGoalId"], "sourceSpan": occurrence["sourceSpan"], "sourceText": g["sourceText"], "url": by_url(topic), "actualStage": "SekI" if int(re.search(r"C(\d+)", topic)[1]) <= 10 else "SekII", "courseLevel": occurrence.get("courseLevel"), "verificationKind": "live_html"})

# All current NI discourse edges are inspected as concrete affected bindings.
ni_path = "curricula/DE/Gymnasium/input/NI/upper-secondary/source-extraction/DE_NI_CHEMIE_SEKII_KC2022.source-extraction.json"
ni = read(ni_path)
ni_goals = {g["id"]: g for g in ni["sourceGoals"]}
ni_passages = {p["id"]: p for p in ni["passages"]}
mapping_path = "curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_chemistry_upper_secondary_to_canonical_chemistry.json"
for row in read(mapping_path)["mappings"]:
    if row["canonicalGoalId"].startswith("1f354a60"):
        g = ni_goals[row["legacyGoalId"]]
        selected.append({"originGoalId": row["canonicalGoalId"], "sourceGoalId": g["id"], "sourceSpan": g["sourceSpan"], "sourceText": g["sourceText"], "url": ni["sourceDocument"]["url"], "actualStage": "SekII", "pagePrinted": ni_passages[g["passageId"]]["page"], "courseLevel": g.get("courseLevel"), "verificationKind": "live_pdf_target_page", "mappingPath": mapping_path})

for row in author["targetedOtherStateClauseRouting"]:
    if not row["oldCanonicalGoalId"].startswith(PREFIXES) or row["oldCanonicalGoalId"].startswith("1f354a60"):
        continue
    state = "NI" if row["sourceGoalId"].startswith("ni-") else "BW"
    path = f"curricula/DE/Gymnasium/input/{state}/lower-secondary/source-extraction/" + ("DE_NI_CHEMIE_SEKI_KC2015.source-extraction.json" if state == "NI" else "DE_BW_CHEMIE_SEKI_BP2016_V2.source-extraction.json")
    document = read(path)
    g = next(g for g in document["sourceGoals"] if g["id"] == row["sourceGoalId"])
    p = next(p for p in document["passages"] if p["id"] == g["passageId"])
    url = document["sourceDocument"]["url"] if state == "NI" else "https://www.bildungsplaene-bw.de/,Lde/BP2016BW_ALLG_GYM_CH.V2_IK_8-9-10_01_01"
    selected.append({"originGoalId": row["oldCanonicalGoalId"], "sourceGoalId": g["id"], "sourceSpan": g["sourceSpan"], "sourceText": g["sourceText"], "url": url, "actualStage": "SekI", "pagePrinted": p.get("page"), "courseLevel": g.get("courseLevel"), "verificationKind": "live_pdf_target_page" if state == "NI" else "live_html"})

urls = sorted({r["url"] for r in selected})


def fetch(url):
    response = requests.get(url, timeout=45)
    response.raise_for_status()
    blob = response.content
    pdf = blob.startswith(b"%PDF")
    document = fitz.open(stream=blob, filetype="pdf") if pdf else None
    # No complete PDF/HTML working copy or complete extracted PDF is written.
    return url, {"url": url, "retrievedAt": datetime.now(timezone.utc).isoformat(), "contentSha256": "sha256:" + sha256(blob).hexdigest(), "bytes": len(blob), "httpStatus": response.status_code, "contentType": response.headers.get("Content-Type"), "redirectedUrl": response.url}, document, "" if pdf else BeautifulSoup(response.text, "html.parser").get_text(" ", strip=True)


fetched = list(ThreadPoolExecutor(max_workers=4).map(fetch, urls))
lookup = {url: (meta, doc, text) for url, meta, doc, text in fetched}
for row in selected:
    meta, doc, text = lookup[row["url"]]
    if doc:
        page = doc[row["pagePrinted"] - 1]
        text = " ".join(block[4] for block in page.get_text("blocks"))
        row["pdfPageIndex"] = row["pagePrinted"] - 1
    row["primaryContentSha256"] = meta["contentSha256"]
    row["normSourceTextSha256"] = "sha256:" + sha256(norm(row["sourceText"]).encode()).hexdigest()
    row["normalizedExactOccurrence"] = norm(row["sourceText"]) in norm(text)
    row["verificationMeaning"] = "Literal occurrence only; no automatic mapping, scope, source-coverage or semantic approval."

save("inputs/selected-source-goals.snapshot.json", selected)
save("inputs/official-primary-fetch.receipt.json", {"schemaVersion": 1, "createdAt": datetime.now(timezone.utc).isoformat(), "documents": [meta for _, meta, _, _ in fetched], "selectedClauseOccurrences": len(selected), "normalizedMatches": sum(r["normalizedExactOccurrence"] for r in selected), "limits": "Only targeted affected source clauses and NI discourse bindings. No national reapproval, no old review reads, no complete extracted official-PDF text persisted."})
for row in selected:
    print(row["originGoalId"][:8], row["sourceSpan"], row["normalizedExactOccurrence"], row.get("pagePrinted"))
