#!/usr/bin/env python3
"""Generate exact illustrative completion diagrams as PNG, never as SVG.

SPDX-License-Identifier: Apache-2.0
Generated didactic figures: CC-BY-4.0, SkillPilot / enpasos, 2026.
Requires Matplotlib. Use --check to compare a fresh render without changing files.
The small graphs are illustrative contracts, not accepted curriculum fragments.
"""

import argparse
import hashlib
from io import BytesIO
import os
from pathlib import Path
import tempfile

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Rectangle


INK = "#193349"
GREEN = "#238B57"
GREEN_FILL = "#E1F1E7"
BLUE = "#277DA8"
BLUE_FILL = "#E1EFF8"
GREY = "#DDE3E8"
MUTED = "#607182"
ORANGE = "#B85D13"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10,
                     "text.color": INK, "axes.unicode_minus": False})


def demand(vertices, targets, protected, edges, mastered, exams=None):
    """Transitive concept model; mastery never stops path traversal."""
    assert targets <= vertices and protected <= vertices and mastered <= vertices
    assert all(a in vertices and b in vertices for a, b in edges)
    def walk(roots):
        needed, pending = set(), list(roots)
        while pending:
            goal = pending.pop()
            if goal in needed:
                continue
            needed.add(goal)
            pending.extend(b for a, b in edges if a == goal)
        return needed
    if exams is None:
        exams = protected
    assert exams <= protected
    assert targets - protected <= walk(targets & exams), "Target lacks local exam route"
    needed = walk((targets & protected) - mastered)
    implicit = targets - mastered - needed - protected
    return needed, implicit


def closure(vertices, edges):
    """Non-reflexive path closure; no mastery-dependent early stopping."""
    assert all(a in vertices and b in vertices for a, b in edges)
    result = set()
    for source in vertices:
        pending = [b for a, b in edges if a == source]
        seen = set()
        while pending:
            target = pending.pop()
            if target in seen:
                continue
            seen.add(target)
            pending.extend(b for a, b in edges if a == target)
        result.update((source, target) for target in seen)
    return result


def effective_requires(vertices, contains, requires):
    """Recompute inherited direct requirements from the authored relations."""
    descendants = closure(vertices, contains)
    return requires | {(child, prerequisite)
                       for ancestor, child in descendants
                       for goal, prerequisite in requires if goal == ancestor}


def atomic_requires(vertices, contains, requires):
    descendants = closure(vertices, contains)
    atoms = vertices - {parent for parent, _ in contains}
    effective = effective_requires(vertices, contains, requires)
    return {(goal, atom) for goal, prerequisite in effective if goal in atoms
            for atom in atoms
            if atom == prerequisite or (prerequisite, atom) in descendants}


def canvas(height):
    fig, ax = plt.subplots(figsize=(7.2, height))
    fig.subplots_adjust(left=.025, right=.975, bottom=.035, top=.97)
    ax.set(xlim=(0, 12), ylim=(0, height * 1.65))
    ax.axis("off")
    return fig, ax


def box(ax, x, y, title, detail, state="open", width=2.35, height=1.12,
        dashed=False):
    fills = {"explicit": GREEN_FILL, "implicit": BLUE_FILL, "open": GREY}
    borders = {"explicit": GREEN, "implicit": BLUE, "open": MUTED}
    patch = FancyBboxPatch((x-width/2, y-height/2), width, height,
                          boxstyle="round,pad=0.06,rounding_size=.12",
                          facecolor=fills[state], edgecolor=borders[state],
                          linewidth=1.3, linestyle="--" if dashed else "-", zorder=3)
    ax.add_patch(patch)
    ax.text(x, y+.17, title, ha="center", va="center", weight="bold", zorder=4)
    ax.text(x, y-.23, detail, ha="center", va="center", fontsize=9, zorder=4)
    return patch


def arrow(ax, start, end, *, active=False, bend=0, dashed=False, color=None):
    ax.add_patch(FancyArrowPatch(start, end, arrowstyle="-|>", mutation_scale=13,
                                connectionstyle=f"arc3,rad={bend}",
                                color=color or (ORANGE if active else MUTED),
                                linewidth=2 if active else 1.2,
                                linestyle="--" if dashed else "-", zorder=2))


def boundary(ax, x, y, width, height, label, *, color=INK, fill="none"):
    ax.add_patch(FancyBboxPatch((x, y), width, height,
                               boxstyle="round,pad=.02,rounding_size=.12",
                               facecolor=fill, edgecolor=color, linewidth=1.2,
                               zorder=0))
    ax.text(x+.18, y+height-.29, label, va="center", weight="bold", color=color)


def t(lang, de_text, en_text):
    return de_text if lang == "de" else en_text


def transitive_demand(lang="de"):
    vertices = {"A", "B", "Q"}
    edges = {("Q", "B"), ("B", "A")}
    assert demand(vertices, vertices, {"Q"}, edges, {"B"}) == (vertices, set())
    assert demand(vertices, vertices, {"Q"}, edges, {"Q"}) == (set(), {"A", "B"})
    assert demand(vertices, vertices, {"Q"}, edges | {("Q", "A")}, {"B"}) == (vertices, set())
    fig, ax = canvas(4.25)
    cases = [
        (5.65, t(lang, "Fall A · M = {B}: Prüfung Q noch offen",
                 "Case A · M = {B}: assessment Q still open"), False),
        (2.55, t(lang, "Fall B · M = {Q}: Anwendung durch Q belegt",
                 "Case B · M = {Q}: application demonstrated via Q"), True),
    ]
    for y, title, passed in cases:
        ax.text(.3, y+1, title, weight="bold", fontsize=10.7)
        box(ax, 1.7, y, t(lang, "Q · Prüfung", "Q · assessment"),
            t(lang, "bestanden (m = 1)", "passed (m = 1)") if passed else t(lang, "offen", "open"),
            "explicit" if passed else "open")
        box(ax, 6, y, t(lang, "B · gewöhnlich", "B · content"),
            t(lang, "implizit beherrscht", "implicitly mastered") if passed else "Mastery = 1",
            "implicit" if passed else "explicit")
        box(ax, 10.3, y, t(lang, "A · Grundlage", "A · foundation"),
            t(lang, "implizit beherrscht", "implicitly mastered") if passed else t(lang, "weiter offen", "still open"),
            "implicit" if passed else "open")
        arrow(ax, (2.95, y), (4.75, y), active=not passed)
        arrow(ax, (7.25, y), (9.05, y), active=not passed)
        ax.text(6, y-1.0, r"$N_U = \varnothing$;  $I_U = \{A,B\}$" if passed else
                r"$N_U = \{Q,B,A\}$;  $I_U = \varnothing$", ha="center")
    ax.text(6, .16, t(lang, "Unabhängige Ausgangslagen, keine zeitliche Folge. Q → A wäre redundant.",
                      "Independent starting states, not a temporal sequence. Q → A would be redundant."),
            ha="center", fontsize=8.7)
    return fig


def local_recognition(lang="de"):
    vertices = {"a", "b", "q1", "q2"}
    edges = {("q1", "b"), ("b", "a"), ("q2", "a")}
    assert demand(vertices, {"a", "b", "q1"}, {"q1", "q2"}, edges, {"q1"}) == (set(), {"a", "b"})
    fig, ax = canvas(4.6)
    boundary(ax, .3, 1.25, 7.2, 6.0, t(lang, "Lokaler Vertrag von U1", "Local contract of U1"))
    boundary(ax, 8, 1.25, 3.7, 6.0, t(lang, "Spätere Einheit U2", "Later unit U2"), color=BLUE, fill="#F5FAFD")
    box(ax, 2.25, 5.65, t(lang, "q₁ · Prüfung", "q₁ · assessment"),
        t(lang, "ausdrücklich bestanden", "explicitly passed"), "explicit", width=2.9)
    box(ax, 5.5, 4.05, t(lang, "b · gewöhnlich", "b · content"),
        t(lang, "implizit beherrscht", "implicitly mastered"), "implicit")
    box(ax, 2.25, 2.75, t(lang, "a · Grundlage", "a · foundation"),
        t(lang, "implizit beherrscht", "implicitly mastered"), "implicit", width=2.9)
    box(ax, 9.85, 3.6, t(lang, "q₂ · Prüfung", "q₂ · assessment"),
        t(lang, "offen", "open"), width=2.9)
    arrow(ax, (3.8, 5.25), (4.8, 4.65))
    arrow(ax, (4.25, 3.7), (3.65, 3.15))
    arrow(ax, (8.3, 3.4), (3.8, 2.75))
    ax.text(6, 2.0, t(lang, "a ist für q₂ bereits erfüllt", "a is already satisfied for q₂"),
            ha="center", fontsize=8.8, color=BLUE)
    ax.text(6, .78, r"$M = \{q_1\}$;  $I_{U1} = \{a,b\}$;  $M_{eff} = \{q_1,a,b\}$", ha="center")
    ax.text(6, .26, t(lang, "U2, Fokuswechsel oder Planwahl öffnen die belegte Anwendung nicht erneut.",
                      "U2, focus changes, or plan switches do not reopen demonstrated application."),
            ha="center", fontsize=9)
    return fig


def protected_support(lang="de"):
    vertices = {"q", "a", "k", "h"}
    assert demand(vertices, {"q", "a", "k"}, {"q", "k", "h"},
                  {("q", "a"), ("q", "h")}, {"q"}, exams={"q"}) == ({"k"}, {"a"})
    fig, ax = canvas(4.5)
    boundary(ax, .3, 2.0, 7.45, 5.1, t(lang, "Eigene Erwerbsziele Own(U) = {q, a, k}",
                                       "Own acquisition goals Own(U) = {q, a, k}"))
    box(ax, 2.05, 5.6, t(lang, "q · Prüfung", "q · assessment"), "Mastery = 1", "explicit")
    box(ax, 2.05, 3.35, t(lang, "a · gewöhnlich", "a · content"),
        t(lang, "implizit beherrscht", "implicitly mastered"), "implicit")
    box(ax, 5.95, 3.35, t(lang, "k · Memorierziel", "k · memory goal"),
        t(lang, "ausdrücklich offen", "explicitly open"), width=2.75)
    box(ax, 9.8, 5.6, t(lang, "h · Memorierziel", "h · memory goal"), "Mastery = 0", width=2.9, dashed=True)
    arrow(ax, (2.05, 4.95), (2.05, 4.0))
    arrow(ax, (3.3, 5.6), (8.25, 5.6))
    ax.text(9.8, 4.25, t(lang, "Externe Unterstützung\nkein eigenes Ziel\nkeine Anerkennung",
                         "External support\nnot an own goal\nno recognition"),
            ha="center", va="center", fontsize=9, linespacing=1.55)
    ax.text(5.95, 4.65, t(lang, "k bleibt eine eigene\nAbschlusspflicht",
                          "k remains an own\ncompletion obligation"), ha="center", fontsize=9)
    ax.text(6, 1.35, r"$P_U = \{q,k\}$;  $N_U = \{k\}$;  $I_U = \{a\}$", ha="center")
    ax.text(6, .75, t(lang, "Effektiv beherrscht: 2 von 3 eigenen Zielen. Ausdrückliche Mastery: 1 von 3.",
                      "Effectively mastered: 2 of 3 own goals. Explicit mastery: 1 of 3."), ha="center", fontsize=10)
    ax.text(6, .22, t(lang, "h zählt nicht zum Nenner. k braucht seinen eigenen verifizierten Abruf.",
                      "h is outside the denominator. k requires its own verified recall."), ha="center", fontsize=9)
    return fig


def plan_period(lang="de"):
    plan, mastered, implicit = set(range(10)), set(range(4)), set(range(4, 7))
    current_period = {2, 3}
    assert len(plan & (mastered | implicit)) == 7
    assert len(plan & mastered) == 4
    assert current_period <= mastered and min(3, len(current_period)) == 2
    assert max(0, 3-len(current_period)) == 1
    fig, ax = canvas(3.85)
    ax.text(.25, 5.8, t(lang, "Gesamtplan: 10 eindeutige Ziel-IDs",
                        "Total plan: 10 unique goal IDs"), weight="bold", fontsize=11)
    for i in range(10):
        color = GREEN if i < 4 else BLUE if i < 7 else GREY
        ax.add_patch(Rectangle((.3+1.14*i, 4.3), 1.04, .75, facecolor=color, edgecolor="white"))
        ax.text(.82+1.14*i, 4.675, str(i+1), ha="center", va="center",
                color="white" if i < 7 else INK, fontsize=10, weight="bold")
    ax.text(.3, 3.8, t(lang, "4 explizit (davon 2 in dieser Periode)  +  3 implizit  +  3 offen",
                       "4 explicit (2 in this period)  +  3 implicit  +  3 open"), fontsize=9.6)
    ax.text(.3, 3.25, t(lang, "Planstand: 7 von 10. Mit „nur explizit“: 4 von 10.",
                        "Plan status: 7 of 10. With 'explicit only': 4 of 10."), fontsize=10)
    ax.text(.25, 2.35, t(lang, "Laufende Periode: Pensum P = 3, tatsächliche Abschlüsse Hₚₑᵣ = 2",
                         "Current period: quota P = 3, actual completions Hₚₑᵣ = 2"), weight="bold", fontsize=10)
    for i in range(3):
        ax.add_patch(Rectangle((.3+1.14*i, 1.2), 1.04, .75,
                               facecolor=GREEN if i < 2 else GREY, edgecolor="white"))
        ax.text(.82+1.14*i, 1.575, t(lang, "erfüllt", "done") if i < 2 else t(lang, "offen", "open"),
                ha="center", va="center", color="white" if i < 2 else INK, fontsize=8.7)
    ax.text(4.1, 1.58, t(lang, "min(3, 2) = 2 erfüllt;  max(0, 3 − 2) = 1 offen",
                         "min(3, 2) = 2 done;  max(0, 3 − 2) = 1 open"), fontsize=10)
    ax.text(.3, .45, t(lang, "Implizite Beiträge und frühere Vorarbeit erzeugen keine Periodenereignisse.",
                       "Implicit contributions and prior completions generate no period events."), fontsize=9.5)
    return fig


def title_graph(lang="de"):
    """The original title's three goals and two relation kinds, with exact direction."""
    contains = {("cluster", "a"), ("cluster", "b")}
    requires = {("b", "a")}
    assert contains.isdisjoint(requires) and ("a", "b") not in requires
    fig, ax = canvas(3.15)
    def goal(x, y, width, text):
        ax.add_patch(FancyBboxPatch((x-width/2, y-.47), width, .94,
                                   boxstyle="round,pad=.05,rounding_size=.10",
                                   facecolor="#EDF7F7", edgecolor="#087F8C",
                                   linewidth=1.3, zorder=3))
        ax.text(x, y, text, ha="center", va="center", fontsize=12, zorder=4)
    goal(6, 4.15, 4.2, t(lang, "Fachlicher Cluster", "Subject Cluster"))
    goal(2.5, 2.15, 3.4, t(lang, "Grundlage a", "Foundation a"))
    goal(9.5, 2.15, 3.4, t(lang, "Anwendung b", "Application b"))
    arrow(ax, (4.8, 3.63), (3.05, 2.67))
    arrow(ax, (7.2, 3.63), (8.95, 2.67))
    ax.text(3.1, 3.42, "contains", ha="center", fontsize=10, color=MUTED)
    ax.text(8.9, 3.42, "contains", ha="center", fontsize=10, color=MUTED)
    ax.add_patch(FancyArrowPatch((7.72, 2.15), (4.28, 2.15), arrowstyle="-|>",
                                mutation_scale=16, color="#087F8C", linewidth=1.8))
    ax.text(6, 2.51, "requires", ha="center", fontsize=10, color="#087F8C")
    ax.text(6, .75, t(lang, "Gruppierung, Lernvoraussetzung und Abschlussnachweis",
                      "Grouping, prerequisite, and completion evidence"),
            ha="center", va="center", fontsize=10, color=MUTED)
    ax.text(6, .27, t(lang, "sind unterschiedliche Aussagen.", "are distinct claims."),
            ha="center", fontsize=10, color=MUTED)
    return fig


def calendar_planning(lang="de"):
    fig, ax = canvas(2.5)
    positions = [1.5, 4.5, 7.5, 10.5]
    titles = (["Eintrittsbasis", "Zeitraum 1", "Zeitraum 2", "Zeitraum 3"] if lang == "de"
              else ["Entry Baseline", "Period 1", "Period 2", "Period 3"])
    details = (["angenommen", "z. B. Schuljahr", "z. B. Schuljahr", "z. B. Schuljahr"] if lang == "de"
               else ["assumed", "e.g. school year", "e.g. school year", "e.g. school year"])
    for x, title, detail in zip(positions, titles, details):
        box(ax, x, 2.8, title, detail, width=2.25)
    for x in positions[:-1]:
        arrow(ax, (x+1.22, 2.8), (x+1.78, 2.8))
    ax.text(6, 1.25, t(lang, "Optionale Zeiteinteilung: Erwerbsweg und begründetes Zeitbudget",
                       "Optional schedule: acquisition order and justified time budget"),
            ha="center", fontsize=9.4)
    ax.text(6, .55, t(lang, "Keine Einheitshierarchie; Pfeile sind keine requires-Kanten oder Zugangssperren.",
                      "Not a learning-unit hierarchy; arrows are neither requires edges nor access locks."),
            ha="center", fontsize=9.4)
    return fig


def compact_goal(ax, x, y, label, *, cluster=False):
    """Structural diagram node; fill has no learner-state meaning."""
    ax.add_patch(FancyBboxPatch((x-.55, y-.34), 1.1, .68,
                               boxstyle="round,pad=.04,rounding_size=.09",
                               facecolor="#EDF7F7" if cluster else "#FAFCFD",
                               edgecolor=INK, linewidth=1.2, zorder=3))
    ax.text(x, y, label, ha="center", va="center", weight="bold", fontsize=11, zorder=4)


def atomic_expansion(lang="de"):
    vertices = {"g", "K", "a", "b", "c"}
    contains = {("K", "a"), ("K", "b")}
    requires = {("g", "K"), ("a", "c")}
    normalized = atomic_requires(vertices, contains, requires)
    assert normalized == {("g", "a"), ("g", "b"), ("a", "c")}
    assert {b for a, b in closure(vertices, normalized) if a == "g"} == {"a", "b", "c"}
    assert ("g", "c") not in closure(vertices, requires)
    fig, ax = canvas(5.25)
    boundary(ax, .2, 2.1, 5.6, 6.1, t(lang, "1 · Verfasster Graph", "1 · Authored Graph"))
    boundary(ax, 6.2, 2.1, 5.6, 6.1, t(lang, "2 · Atomare Relation Rₐₜ", "2 · Atomic Relation Rₐₜ"))
    for x, y, name in [(1.25, 5.85, "g"), (3.5, 6.65, "K"),
                       (2.65, 4.65, "a"), (4.85, 4.65, "b"), (2.65, 2.95, "c")]:
        compact_goal(ax, x, y, name, cluster=name == "K")
    arrow(ax, (1.82, 6.05), (2.9, 6.45), color=BLUE)
    arrow(ax, (3.28, 6.25), (2.8, 5.05))
    arrow(ax, (3.78, 6.25), (4.55, 5.05))
    arrow(ax, (2.65, 4.25), (2.65, 3.35), color=BLUE)
    ax.text(2.25, 6.55, "requires", ha="center", fontsize=9, color=BLUE)
    ax.text(4.95, 5.65, "contains", ha="center", fontsize=9, color=MUTED)
    ax.text(3.45, 3.75, "requires", va="center", fontsize=9, color=BLUE)
    for x, y, name in [(9, 6.65, "g"), (7.7, 4.65, "a"),
                       (10.3, 4.65, "b"), (7.7, 2.95, "c")]:
        compact_goal(ax, x, y, name)
    arrow(ax, (8.7, 6.25), (7.95, 5.05), color=BLUE)
    arrow(ax, (9.3, 6.25), (10.05, 5.05), color=BLUE)
    arrow(ax, (7.7, 4.25), (7.7, 3.35), color=BLUE)
    ax.text(10, 3.1, t(lang, "Zuerst K durch\nAtoms(K) = {a, b}\nersetzen.",
                       "First expand K to\nAtoms(K) = {a, b}."),
            ha="center", va="center", fontsize=10, linespacing=1.55)
    ax.text(6, 1.52, r"$R_{at}=\{(g,a),(g,b),(a,c)\}$", ha="center", fontsize=11)
    ax.text(6, .96, (r"Dann Hülle bilden: $\operatorname{Reach}^{+}_{R_{at}}(g)=\{a,b,c\}$" if lang == "de"
                     else r"Then form closure: $\operatorname{Reach}^{+}_{R_{at}}(g)=\{a,b,c\}$"),
            ha="center", fontsize=11)
    ax.text(6, .35, t(lang, "Grau: contains · Blau: requires, rechts atomar normalisiert. Hüllenpaare sind keine neuen Autorenkanten.",
                      "Grey: contains · Blue: requires, atomically normalized on the right. Closure pairs are not new authored edges."),
            ha="center", fontsize=8.2)
    return fig


def inherited_redundancy(lang="de"):
    vertices = {"k", "b", "a", "g"}
    contains = {("k", "b")}
    requires = {("k", "a"), ("g", "b"), ("g", "a")}
    removed = requires - {("g", "a")}
    recomputed = effective_requires(vertices, contains, removed)
    assert recomputed == {("k", "a"), ("g", "b"), ("b", "a")}
    assert ("g", "a") not in closure(vertices, removed)
    assert ("g", "a") in closure(vertices, recomputed)
    fig, ax = canvas(4.65)
    boundary(ax, .2, 1.75, 5.6, 5.55, t(lang, "1 · Übergangsgraph mit Kante e",
                                        "1 · Transition Graph with Edge e"))
    boundary(ax, 6.2, 1.75, 5.6, 5.55, t(lang, "2 · Testgraph ohne e: neu vererben",
                                         "2 · Test Graph without e: Re-inherit"))
    for offset in (0, 6):
        for x, y, name in [(1.4, 5.65, "k"), (1.4, 3, "b"),
                           (4.55, 3, "a"), (4.55, 5.65, "g")]:
            compact_goal(ax, x+offset, y, name, cluster=name == "k")
        arrow(ax, (1.4+offset, 5.25), (1.4+offset, 3.4))
        arrow(ax, (1.92+offset, 5.35), (4.02+offset, 3.35), color=BLUE)
        arrow(ax, (4.02+offset, 5.35), (1.92+offset, 3.35), color=BLUE)
        arrow(ax, (2+offset, 3), (3.95+offset, 3), color=BLUE, dashed=True)
        ax.text(2.95+offset, 2.55, t(lang, "b → a geerbt", "b → a inherited"),
                ha="center", fontsize=9, color=BLUE)
    arrow(ax, (4.55, 5.25), (4.55, 3.4), color=ORANGE)
    ax.text(4.94, 4.35, "e", fontsize=11, color=ORANGE, weight="bold")
    ax.text(9.9, 4.35, t(lang, "ohne e geprüft", "tested without e"), ha="left", fontsize=9, color=ORANGE)
    ax.text(6, 1.17, t(lang, "e = g → a: Im hypothetischen Test ohne e bleibt der effektive Pfad g → b → a.",
                       "e = g → a: in the counterfactual test without e, effective path g → b → a remains."),
            ha="center", fontsize=10)
    ax.text(6, .62, t(lang, "Redundanzdiagnose im Übergangsbestand; keine Löschfreigabe für die Atomkante.",
                      "Redundancy diagnostic on transition data; never a license to delete the atomic edge."),
            ha="center", fontsize=9.5)
    ax.text(6, .12, t(lang, "Grau: contains · Blau: requires · Gestrichelt: geerbt · Orange: untersuchte verfasste Kante e",
                      "Grey: contains · Blue: requires · Dashed: inherited · Orange: tested authored edge e"),
            ha="center", fontsize=8.6)
    return fig


def shared_local_assessments(lang="de"):
    vertices = {"Q1", "Q2", "A"}
    protected = {"Q1", "Q2"}
    edges = {("Q1", "A"), ("Q2", "A")}
    before = demand(vertices, vertices, protected, edges, {"Q1"})
    after = demand(vertices, vertices, protected, edges, {"Q1", "Q2"})
    assert before == ({"Q2", "A"}, set())
    assert after == (set(), {"A"})
    assert {"Q1"} | before[1] <= {"Q1", "Q2"} | after[1]
    fig, ax = canvas(4.6)
    panels = [(0, t(lang, "1 · Nur Q₁ bestanden", "1 · Only Q₁ passed"), False),
              (6, t(lang, "2 · Auch Q₂ bestanden", "2 · Q₂ passed as well"), True)]
    for offset, label, both in panels:
        boundary(ax, .2+offset, 1.6, 5.6, 5.65, label)
        box(ax, 1.65+offset, 5.55, t(lang, "Q₁ · Prüfung", "Q₁ · assessment"),
            t(lang, "bestanden (m = 1)", "passed (m = 1)"), "explicit", width=2.15)
        box(ax, 4.35+offset, 5.55, t(lang, "Q₂ · Prüfung", "Q₂ · assessment"),
            t(lang, "bestanden (m = 1)", "passed (m = 1)") if both else t(lang, "noch offen", "still open"),
            "explicit" if both else "open", width=2.15)
        box(ax, 3+offset, 3.65, t(lang, "A · Grundlage", "A · foundation"),
            t(lang, "implizit beherrscht", "implicitly mastered") if both else t(lang, "weiter offen", "still open"),
            "implicit" if both else "open", width=2.8)
        arrow(ax, (1.95+offset, 4.9), (2.6+offset, 4.3), color=BLUE)
        arrow(ax, (4.05+offset, 4.9), (3.4+offset, 4.3), color=BLUE)
        ax.text(3+offset, 2.58, r"$M=\{Q_1,Q_2\}$" if both else r"$M=\{Q_1\}$",
                ha="center", fontsize=10.5)
        ax.text(3+offset, 1.98, r"$N_U=\varnothing;\ I_U=\{A\}$" if both else
                r"$N_U=\{Q_2,A\};\ I_U=\varnothing$", ha="center", fontsize=10.5)
    ax.text(6, 1.04, (r"Derselbe lokale Vertrag: $\operatorname{Own}(U)=\{Q_1,Q_2,A\}$, $P_U=\{Q_1,Q_2\}$." if lang == "de"
                      else r"Same local contract: $\operatorname{Own}(U)=\{Q_1,Q_2,A\}$, $P_U=\{Q_1,Q_2\}$."),
            ha="center", fontsize=10)
    ax.text(6, .49, t(lang, "Beide Prüfungen benötigen A. Q₁ bleibt bestanden; erst die offene Nachfrage von Q₂ entfällt.",
                      "Both assessments require A. Q₁ stays passed; only the open demand from Q₂ disappears."),
            ha="center", fontsize=9.1)
    ax.text(6, .03, t(lang, "Blau durchgezogen: requires · Grün: ausdrücklich bestanden · Hellblau: implizit global beherrscht",
                      "Solid blue: requires · Green: explicitly passed · Light blue: implicitly mastered globally"),
            ha="center", fontsize=8.6)
    return fig


def recursive_learning_unit(lang="de"):
    """Separate derived unit completion from explicit goal outcomes in two cases."""
    vertices = {"a", "b", "d", "qK", "kK", "qD", "qS"}
    edges = {("qK", "b"), ("b", "a"), ("qD", "d"),
             ("d", "b"), ("qS", "d")}
    protected = {"qK", "kK", "qD", "qS"}
    exams = {"qK", "qD", "qS"}
    own = [{"a", "b", "qK", "kK"}, {"d", "qD"}, {"qS"}]
    def states(mastered):
        recognized = [demand(vertices, targets, protected, edges, mastered, exams)[1]
                      for targets in own]
        effective = mastered | set().union(*recognized)
        children = [targets <= effective for targets in own[:2]]
        return recognized, children, own[2] <= effective and all(children)
    assert states({"qK", "kK", "qD"}) == ([{"a", "b"}, {"d"}, set()], [True, True], False)
    assert states({"qS"}) == ([set(), set(), set()], [False, False], False)
    assert states({"qK"}) == ([{"a", "b"}, set(), set()], [False, False], False)
    assert states({"qK", "kK", "qD", "qS"})[2]
    fig, ax = canvas(6.1)
    panels = [(0, t(lang, "A · Kinder fertig, Synthese offen", "A · Children done, synthesis open"), True),
              (6, t(lang, "B · Nur Synthese bestanden", "B · Only synthesis passed"), False)]
    for offset, title, child_done in panels:
        boundary(ax, .2+offset, 2.3, 5.6, 7.35, title)
        box(ax, 3+offset, 8.1, t(lang, "Mechanik", "Mechanics"),
            t(lang, "Abschluss abgeleitet: nein", "Derived completion: no"), width=4.7, height=1.15)
        ax.text(3+offset, 7.14,
                t(lang, "Eigene Pflicht qₛ: ", "Own obligation qₛ: ")
                + (t(lang, "offen", "open") if child_done else t(lang, "bestanden", "passed")),
                ha="center", fontsize=9.2, color=MUTED if child_done else GREEN)
        child_specs = [
            (1.65, t(lang, "Kinematik", "Kinematics"),
             t(lang, "qₖ, kₖ bestanden", "qₖ, kₖ passed") if child_done else t(lang, "qₖ, kₖ offen", "qₖ, kₖ open"),
             t(lang, "a, b anerkannt", "a, b recognized")),
            (4.35, t(lang, "Dynamik", "Dynamics"),
             t(lang, "qᴅ bestanden", "qᴅ passed") if child_done else t(lang, "qᴅ offen", "qᴅ open"),
             t(lang, "d anerkannt", "d recognized")),
        ]
        for x, name, detail, earned in child_specs:
            ax.add_patch(FancyBboxPatch((x-1.2+offset, 3.95), 2.4, 2.25,
                                       boxstyle="round,pad=.04,rounding_size=.10",
                                       facecolor="#FAFCFD", edgecolor=INK, linewidth=1.1, zorder=3))
            ax.text(x+offset, 5.82, name, ha="center", weight="bold", fontsize=9.6, zorder=4)
            ax.text(x+offset, 5.25, detail, ha="center", fontsize=8.55,
                    color=GREEN if child_done else MUTED, zorder=4)
            ax.text(x+offset, 4.75, earned if child_done else t(lang, "kein Kind-I erzeugt", "no child I produced"),
                    ha="center", fontsize=8.4, color=BLUE if child_done else MUTED, zorder=4)
            ax.text(x+offset, 4.25, t(lang, "Abschluss: ", "Complete: ") + (t(lang, "ja", "yes") if child_done else t(lang, "nein", "no")),
                    ha="center", fontsize=8.7, zorder=4)
            arrow(ax, (3+offset, 6.8), (x+offset, 6.3))
        ax.text(3+offset, 3.35, r"$M=\{q_K,k_K,q_D\}$" if child_done else r"$M=\{q_S\}$",
                ha="center", fontsize=10)
        ax.text(3+offset, 2.77, r"$I_K\cup I_D=\{a,b,d\};\ I_S=\varnothing$" if child_done else
                r"$I_K=I_D=I_S=\varnothing$", ha="center", fontsize=9.8)
    ax.text(6, 1.68, t(lang, "Eigene Erwerbsziele: Kinematik {a,b,qₖ,kₖ} · Dynamik {d,qᴅ} · Mechanik {qₛ}",
                       "Own acquisition goals: Kinematics {a,b,qₖ,kₖ} · Dynamics {d,qᴅ} · Mechanics {qₛ}"),
            ha="center", fontsize=8.8)
    ax.text(6, 1.14, t(lang, "Fachliches requires: qₛ → d → b → a; qᴅ → d; qₖ → b. kₖ ist unabhängig.",
                       "Subject requires: qₛ → d → b → a; qᴅ → d; qₖ → b. kₖ is independent."),
            ha="center", fontsize=8.8, color=BLUE)
    ax.text(6, .6, t(lang, "Graue Pfeile: Pflichtkinder · Abschluss wird abgeleitet; gespeichert bleiben nur atomare Ergebnisse.",
                     "Grey arrows: required children · Completion is derived; only atomic results remain stored."),
            ha="center", fontsize=8.4)
    ax.text(6, .12, t(lang, "Kein Eltern-I über Kindziele. Die Einheitshierarchie ist keine zusätzliche Mastery-Ebene.",
                      "No parent I over child goals. The unit hierarchy is not a second mastery layer."),
            ha="center", fontsize=8.5)
    return fig


FIGURES = {
    "00-title-skill-graph": title_graph,
    "08-transitive-demand": transitive_demand,
    "09-local-recognition": local_recognition,
    "10-protected-support": protected_support,
    "11-plan-period": plan_period,
    "12-calendar-planning": calendar_planning,
    "13-atomic-expansion": atomic_expansion,
    "14-inherited-redundancy": inherited_redundancy,
    "15-shared-local-assessments": shared_local_assessments,
    "16-recursive-learning-unit": recursive_learning_unit,
}


def write_or_check_png(output_dir, filename, data, check_only):
    target = output_dir / filename
    if check_only:
        assert target.read_bytes() == data, f"Generated PNG differs: {filename}"
        return
    descriptor, temporary = tempfile.mkstemp(prefix=f".{filename}.", dir=output_dir)
    try:
        with os.fdopen(descriptor, "wb") as stream:
            stream.write(data)
        os.replace(temporary, target)
        target.chmod(0o644)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--lang", choices=["de", "en", "all"], default="all")
    args = parser.parse_args()
    langs = ["de", "en"] if args.lang == "all" else [args.lang]
    output = Path(__file__).resolve().parents[1] / "assets/graph-definition"
    output.mkdir(parents=True, exist_ok=True)
    for lang in langs:
        for stem, make in FIGURES.items():
            name = f"{stem}.{lang}.png"
            fig = make(lang=lang)
            buffer = BytesIO()
            fig.savefig(buffer, format="png", dpi=300, facecolor="white", metadata={
                "Title": name, "Author": "SkillPilot / enpasos",
                "Description": "Exact illustrative model; generated from checked sets and direct edges.",
                "Copyright": "CC-BY-4.0, SkillPilot / enpasos, 2026",
            })
            plt.close(fig)
            data = buffer.getvalue()
            write_or_check_png(output, name, data, args.check)
            if lang == "de":
                write_or_check_png(output, f"{stem}.png", data, args.check)
            print(name, hashlib.sha256(data).hexdigest())
    print(f"PASS: exact PNG illustrations ({', '.join(langs)}); normalization, minimality, own-only recognition, recursive completion and counting verified.")


if __name__ == "__main__":
    main()
