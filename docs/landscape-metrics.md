# Landscape Metrics

This document outlines the core metrics used to evaluate and track progress within a learning landscape.

## Landscape Coverage & Hours (Ø)

Assumption for weekly hours: LK (Leistungskurs / advanced course) = 5; GK (Grundkurs / basic course) = 3 (exception: Mathematics GK = 4). GK goals include all common goals (`both`), LK goals include common + LK goals. Normalized = goals per weekly hour.

| Landscape | GK Goals | LK Goals (incl. GK) | GK h/week | LK h/week | GK norm | LK norm |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| hessen-biology-upper-secondary.de.json | 98 | 186 | 3 | 5 | 32.7 | 37.2 |
| hessen-chemistry-upper-secondary.de.json | 102 | 158 | 3 | 5 | 34.0 | 31.6 |
| hessen-chinese-upper-secondary.de.json | 144 | 171 | 3 | 5 | 48.0 | 34.2 |
| hessen-economics-upper-secondary.de.json | 122 | 198 | 3 | 5 | 40.7 | 39.6 |
| hessen-english-upper-secondary.de.json | 84 | 108 | 3 | 5 | 28.0 | 21.6 |
| hessen-french-upper-secondary.de.json | 150 | 153 | 3 | 5 | 50.0 | 30.6 |
| hessen-german-upper-secondary.de.json | 106 | 142 | 3 | 5 | 35.3 | 28.4 |
| hessen-greek-upper-secondary.de.json | 144 | 171 | 3 | 5 | 48.0 | 34.2 |
| hessen-history-upper-secondary.de.json | 115 | 188 | 3 | 5 | 38.3 | 37.6 |
| hessen-informatics-upper-secondary.de.json | 101 | 183 | 3 | 5 | 33.7 | 36.6 |
| hessen-latin-upper-secondary.de.json | 84 | 120 | 3 | 5 | 28.0 | 24.0 |
| hessen-math-upper-secondary.de.json | 178 | 211 | 4 | 5 | 44.5 | 42.2 |
| hessen-music-upper-secondary.de.json | 47 | 55 | 3 | 5 | 15.7 | 11.0 |
| hessen-physics-upper-secondary.de.json | 119 | 166 | 3 | 5 | 39.7 | 33.2 |
| hessen-politics-economics-upper-secondary.de.json | 97 | 181 | 3 | 5 | 32.3 | 36.2 |
| hessen-spanish-upper-secondary.de.json | 53 | 61 | 3 | 5 | 17.7 | 12.2 |

## Mastery Calculation

Mastery of a learning goal is a core metric for tracking learner progress. The calculation differs based on the type of node in the competence graph. All mastery calculations are performed on the client-side to provide a responsive user experience and to reduce server load.

### Leaf Nodes

A leaf node is a learning goal that has no children (i.e., it does not contain any other learning goals). The mastery of a leaf node is set manually by a trainer or learner and is represented by a floating-point number between 0.0 and 1.0, where:
- **0.0** indicates the goal has not been started.
- **1.0** indicates the goal has been fully mastered.

This value is stored persistently for each learner.

### Parent Nodes (Non-Leaf Nodes)

A parent node is a learning goal that contains one or more child goals. Its mastery is not set manually but is calculated dynamically by aggregating the mastery of its direct children. This provides a real-time, accurate overview of progress on higher-level competences.

The calculation is a **weighted average** of the child nodes' mastery values. Each learning goal (`UiGoal`) has a `weight` property (defaulting to 1 if not specified), which is used in this calculation.

The formula is as follows:

```
Mastery_Parent = SUM(Mastery_Child_i * weight_i) / SUM(weight_i)
```

Where:
- `Mastery_Child_i` is the mastery of the i-th child node.
- `weight_i` is the weight of the i-th child node.

If the sum of the weights of all children is zero, the parent's mastery is considered to be zero.

This calculation is performed recursively up the tree. The mastery of a parent node is therefore always a reflection of the progress made on the foundational, leaf-level goals it is composed of. As a result, the mastery of parent nodes is a read-only value in the user interface.
