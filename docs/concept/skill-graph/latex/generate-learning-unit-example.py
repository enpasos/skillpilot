#!/usr/bin/env python3
"""Render the illustrative constant-acceleration model as a PNG.

SPDX-License-Identifier: Apache-2.0
The generated didactic figure is SkillPilot content under CC-BY-4.0.
This is a mathematical plot, not a released assessment or curriculum asset.
"""

import io
import os
from pathlib import Path
import tempfile

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np


def main():
    destination = (Path(__file__).resolve().parents[1] / "assets" /
                   "graph-definition" / "17-constant-acceleration-unit.png")
    t = np.linspace(0, 4, 401)
    position = 20 * t - 5 * t ** 2
    velocity = 20 - 10 * t
    acceleration = np.full_like(t, -10)
    # The common sample t=2 shows the distinction the example is teaching.
    assert position[200] == 20 and velocity[200] == 0 and acceleration[200] == -10
    plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 12})
    fig, axes = plt.subplots(3, 1, figsize=(8.5, 7.4), sharex=True)
    panels = [
        (position, "Ort x (m)", [0, 10, 20], (-2, 25), r"$x(t)=20t-5t^2$"),
        (velocity, "Geschwindigkeit\nv (m/s)", [-20, 0, 20], (-25, 25), r"$v(t)=20-10t$"),
        (acceleration, "Beschleunigung\na (m/s²)", [-10, 0], (-13, 3), r"$a(t)=-10$"),
    ]
    for ax, (values, label, ticks, limits, formula) in zip(axes, panels):
        ax.plot(t, values, color="#007fa9", linewidth=2.6)
        ax.axvline(2, color="#6a7280", linestyle="--", linewidth=1.1)
        ax.axhline(0, color="#acb5bf", linewidth=0.8)
        ax.scatter([2], [values[200]], color="#007fa9", s=35, zorder=5)
        ax.set(ylabel=label, yticks=ticks, ylim=limits, xlim=(0, 4))
        ax.text(0.98, 0.91, formula, transform=ax.transAxes, ha="right", va="top",
                bbox={"facecolor": "white", "edgecolor": "none", "alpha": 0.9})
        ax.spines[["top", "right"]].set_visible(False)
        ax.grid(axis="y", color="#e6eaf0", linewidth=0.6)
    axes[0].annotate("Umkehrpunkt", xy=(2, 20), xytext=(2.3, 22), fontsize=11)
    axes[-1].set(xlabel="Zeit t (s)", xticks=[0, 1, 2, 3, 4])
    fig.suptitle("Ein Bewegungsmodell – drei zusammengehörige Darstellungen", fontsize=15)
    fig.text(0.5, 0.925, "Senkrechter Wurf · aufwärts positiv · ohne Luftwiderstand",
             ha="center", fontsize=11)
    fig.text(0.5, 0.015, "Beispielwerte: x₀ = 0 m, v₀ = 20 m/s, a = −10 m/s² (vereinfacht).",
             ha="center", fontsize=10)
    fig.subplots_adjust(left=0.19, right=0.96, top=0.86, bottom=0.10, hspace=0.24)
    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", dpi=200, facecolor="white")
    plt.close(fig)
    if destination.is_symlink() or (destination.exists() and not destination.is_file()):
        raise ValueError(f"Refusing non-regular output: {destination}")
    fd, name = tempfile.mkstemp(prefix=".unit-example-", suffix=".png", dir=destination.parent)
    try:
        with os.fdopen(fd, "wb") as output:
            output.write(buffer.getvalue())
        os.chmod(name, 0o644)
        os.replace(name, destination)
    finally:
        Path(name).unlink(missing_ok=True)
    print(destination)


if __name__ == "__main__":
    main()
