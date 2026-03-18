const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const HESSEN_LOWER_SECONDARY_MATH_LANDSCAPE_ID = 'b167b4cd-4b78-4c84-a721-6b2adbbcab3c';

function normalizeTitle(value) {
  return value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, ' ')
    .trim();
}

function getJurisdictions(goal) {
  const jurisdictions = goal?.applicability?.jurisdiction;
  if (!Array.isArray(jurisdictions)) {
    return [];
  }
  return jurisdictions.filter((entry) => typeof entry === 'string').slice().sort();
}

const titleToGoals = new Map();
for (const item of data.goals) {
  if (!item.title) {
    continue;
  }
  const key = normalizeTitle(item.title);
  const existing = titleToGoals.get(key) || [];
  existing.push(item);
  titleToGoals.set(key, existing);
}

function resolveGoalByTitle(targetNode, title) {
  const candidates = titleToGoals.get(normalizeTitle(title)) || [];
  if (candidates.length === 0) {
    return { goal: null, reason: `Could not find required node with title: ${title}` };
  }

  if (candidates.length === 1) {
    const [candidate] = candidates;
    const targetJurisdictions = getJurisdictions(targetNode);
    const candidateJurisdictions = getJurisdictions(candidate);
    const coversTarget = targetJurisdictions.length === 0
      || targetJurisdictions.every((entry) => candidateJurisdictions.includes(entry));
    if (coversTarget) {
      return { goal: candidate };
    }
    return {
      goal: null,
      reason: `Skipped ${title} for ${targetNode.title}: candidate ${candidate.id} only covers [${candidateJurisdictions.join(', ')}], target covers [${targetJurisdictions.join(', ')}]. Review applicability first.`,
    };
  }

  const targetJurisdictions = getJurisdictions(targetNode);
  const compatible = candidates.filter((candidate) => {
    const candidateJurisdictions = getJurisdictions(candidate);
    return targetJurisdictions.length === 0
      || targetJurisdictions.every((entry) => candidateJurisdictions.includes(entry));
  });

  if (compatible.length === 1) {
    return { goal: compatible[0] };
  }

  if (compatible.length > 1) {
    return {
      goal: null,
      reason: `Ambiguous compatible required node for title: ${title} (needed for ${targetNode.title}): ${compatible.map((candidate) => candidate.id).join(', ')}`,
    };
  }

  return {
    goal: null,
    reason: `Skipped ${title} for ${targetNode.title}: all matching candidates are jurisdiction-limited. Review applicability before adding this requires edge.`,
  };
}

function resolveGoalReference(targetNode, reference) {
  if (typeof reference === 'string') {
    return resolveGoalByTitle(targetNode, reference);
  }

  if (reference && typeof reference === 'object') {
    if (typeof reference.id === 'string') {
      const candidate = data.goals.find((goal) => goal.id === reference.id);
      if (!candidate) {
        return {
          goal: null,
          reason: `Could not find required node with id: ${reference.id}${reference.title ? ` (${reference.title})` : ''}`,
        };
      }

      if (reference.type && candidate.type !== reference.type) {
        return {
          goal: null,
          reason: `Required node ${candidate.id} (${candidate.title}) has type ${candidate.type}, expected ${reference.type}`,
        };
      }

      return { goal: candidate };
    }

    if (typeof reference.title === 'string') {
      const resolution = resolveGoalByTitle(targetNode, reference.title);
      if (!resolution.goal || !reference.type) {
        return resolution;
      }

      if (resolution.goal.type === reference.type) {
        return resolution;
      }

      const candidates = (titleToGoals.get(normalizeTitle(reference.title)) || []).filter(
        (candidate) => candidate.type === reference.type
      );
      if (candidates.length === 1) {
        return { goal: candidates[0] };
      }

      if (candidates.length > 1) {
        return {
          goal: null,
          reason: `Ambiguous ${reference.type} required node for title: ${reference.title} (needed for ${targetNode.title}): ${candidates.map((candidate) => candidate.id).join(', ')}`,
        };
      }

      return {
        goal: null,
        reason: `Could not find ${reference.type} required node with title: ${reference.title}`,
      };
    }
  }

  return {
    goal: null,
    reason: `Unsupported requires reference for ${targetNode.title}: ${JSON.stringify(reference)}`,
  };
}

const updates = {
  "Natürliche und ganze Zahlen multiplizieren und dividieren": ["Natürliche und ganze Zahlen addieren und subtrahieren"],
  "Rationale Zahlen darstellen und berechnen": ["Natürliche und ganze Zahlen addieren und subtrahieren", "Natürliche und ganze Zahlen multiplizieren und dividieren"],
  "Flächeninhalt und Volumen berechnen": ["Geometrische Figuren und Lagebeziehungen beschreiben", "Größen und Einheiten vergleichen und umrechnen"],
  "Prozentrechnung anwenden und Daten auswerten": ["Größen und Einheiten vergleichen und umrechnen", "Rationale Zahlen darstellen und berechnen"],
  "Terme mit Variablen aufstellen und umformen": ["Rationale Zahlen darstellen und berechnen"],
  "Lineare Gleichungen lösen und Prozentrechnung vertiefen": ["Terme mit Variablen aufstellen und umformen", "Rationale Zahlen darstellen und berechnen", "Prozentrechnung anwenden und Daten auswerten"],
  "Zuordnungen analysieren": ["Rationale Zahlen darstellen und berechnen"],
  "Proportionale Zuordnungen nutzen": ["Zuordnungen analysieren"],
  "Lineare Funktionen beschreiben": ["Proportionale Zuordnungen nutzen"],
  "Lineare Funktionen rechnerisch untersuchen": ["Lineare Funktionen beschreiben", "Terme mit Variablen aufstellen und umformen"],
  "Lineare Gleichungssysteme lösen und deuten": ["Lineare Gleichungen lösen und Prozentrechnung vertiefen", "Lineare Funktionen rechnerisch untersuchen"],
  "Symmetrie und Winkel begründen": ["Geometrische Figuren und Lagebeziehungen beschreiben"],
  "Kongruenz begründen und Dreieckskonstruktionen ausführen": ["Symmetrie und Winkel begründen"],
  "Kreise und Zylinder untersuchen": ["Flächeninhalt und Volumen berechnen", "Kongruenz begründen und Dreieckskonstruktionen ausführen"],
  "Ähnlichkeit und Strahlensatz anwenden": ["Kongruenz begründen und Dreieckskonstruktionen ausführen"],
  "Satz des Pythagoras anwenden": ["Kongruenz begründen und Dreieckskonstruktionen ausführen"],
  "Trigonometrie am rechtwinkligen Dreieck anwenden": ["Satz des Pythagoras anwenden", "Ähnlichkeit und Strahlensatz anwenden"],
  "Sinus- und Kosinussatz nutzen": ["Trigonometrie am rechtwinkligen Dreieck anwenden"],
  "Kenngrößen von Daten bestimmen und interpretieren": ["Prozentrechnung anwenden und Daten auswerten"],
  "Laplace-Experimente auswerten": ["Kenngrößen von Daten bestimmen und interpretieren"],
  "Verknüpfte Ereignisse mit Mengen- und Vierfelderdarstellungen strukturieren": ["Laplace-Experimente auswerten"],
  "Wahrscheinlichkeiten verknüpfter Ereignisse berechnen": ["Verknüpfte Ereignisse mit Mengen- und Vierfelderdarstellungen strukturieren"],
  "Baumdiagramme und Pfadregeln für zusammengesetzte Experimente nutzen": ["Wahrscheinlichkeiten verknüpfter Ereignisse berechnen"],
  "Stochastische Simulationen und Monte-Carlo-Verfahren deuten": ["Baumdiagramme und Pfadregeln für zusammengesetzte Experimente nutzen"],
  "Bruchterme strukturieren, erweitern und kürzen": ["Rationale Zahlen darstellen und berechnen", "Terme mit Variablen aufstellen und umformen"],
  "Bruchterme auf gemeinsamen Nenner bringen und verknüpfen": ["Bruchterme strukturieren, erweitern und kürzen"],
  "Potenzgesetze mit ganzzahligen Exponenten anwenden": ["Terme mit Variablen aufstellen und umformen"],
  "Bruchgleichungen lösen und als Schnittprobleme deuten": ["Bruchterme auf gemeinsamen Nenner bringen und verknüpfen", "Lineare Gleichungen lösen und Prozentrechnung vertiefen"],
  "Formeln mit Brüchen nach Variablen auflösen": ["Bruchterme auf gemeinsamen Nenner bringen und verknüpfen", "Lineare Gleichungen lösen und Prozentrechnung vertiefen"],
  "Gebrochen-rationale Funktionen in Grundform untersuchen": ["Lineare Funktionen beschreiben"],
  "Graphen und Asymptoten einfacher Hyperbeln deuten": ["Gebrochen-rationale Funktionen in Grundform untersuchen"],
  "Indirekte Proportionalität mit Hyperbeln beschreiben": ["Graphen und Asymptoten einfacher Hyperbeln deuten", "Zuordnungen analysieren"],
  "Quadratwurzeln darstellen und nutzen": ["Potenzgesetze mit ganzzahligen Exponenten anwenden"],
  "Quadratische Gleichungen loesen": ["Quadratwurzeln darstellen und nutzen", "Terme mit Variablen aufstellen und umformen"],
  "Quadratische Funktionen beschreiben": [
    {
      id: "c23705d2-57fc-4260-80d8-2d340203a173",
      title: "Scheitelpunkte quadratischer Funktionen bestimmen",
      type: "cluster"
    },
    "Lineare Funktionen beschreiben"
  ],
  "Potenzfunktionen und Potenzgesetze nutzen": ["Potenzgesetze mit ganzzahligen Exponenten anwenden"],
  "Exponentielles Wachstum modellieren und Logarithmen nutzen": ["Potenzfunktionen und Potenzgesetze nutzen"],
  "Sinus- und Kosinusfunktionen beschreiben": ["Trigonometrie am rechtwinkligen Dreieck anwenden"],
  "Ganzrationale Funktionen beschreiben": ["Quadratische Funktionen beschreiben"],
  "Raumgeometrische Probleme mit Körpern lösen": ["Kreise und Zylinder untersuchen"]
};

const targetedUpdates = [
  {
    targetRef: {
      id: "c23705d2-57fc-4260-80d8-2d340203a173",
      title: "Scheitelpunkte quadratischer Funktionen bestimmen",
      type: "cluster"
    },
    reqRefs: ["Quadratische Gleichungen loesen"]
  }
];

const bridgeApplicabilityExpansions = [
  "Lineare Gleichungen lösen und Prozentrechnung vertiefen",
  "Prozentrechnung anwenden und Daten auswerten",
  "Ganzrationale Funktionen beschreiben",
  "Exponentielles Wachstum modellieren und Logarithmen nutzen",
  "Sinus- und Kosinusfunktionen beschreiben",
  "Lineare Gleichungssysteme lösen und deuten",
  "Geradengleichungen, Nullstellen und Schnittpunkte bestimmen",
  "Trigonometrie am rechtwinkligen Dreieck anwenden",
  "Sinus- und Kosinussatz nutzen",
  "Raumgeometrische Probleme mit Körpern lösen",
  "Laplace-Experimente auswerten",
  "Baumdiagramme und Pfadregeln für zusammengesetzte Experimente nutzen",
  "Verknüpfte Ereignisse mit Mengen- und Vierfelderdarstellungen strukturieren",
  "Wahrscheinlichkeiten verknüpfter Ereignisse berechnen",
  "Kenngrößen von Daten bestimmen und interpretieren",
  "Stochastische Simulationen und Monte-Carlo-Verfahren deuten"
];

const bridgeUpdates = [
  {
    targetTitle: "Q1 Analysis – Integralrechnung und Differenzialgleichungen",
    reqRefs: [
      "Ganzrationale Funktionen beschreiben",
      "Quadratische Funktionen beschreiben",
      {
        id: "c23705d2-57fc-4260-80d8-2d340203a173",
        title: "Scheitelpunkte quadratischer Funktionen bestimmen",
        type: "cluster"
      },
      "Quadratische Gleichungen loesen",
      "Exponentielles Wachstum modellieren und Logarithmen nutzen",
      "Sinus- und Kosinusfunktionen beschreiben",
      "Potenz- und Wurzelfunktionen graphisch untersuchen"
    ]
  },
  {
    targetTitle: "Q4 Vertiefung und Ergänzung",
    reqRefs: [
      "Ganzrationale Funktionen beschreiben",
      "Exponentielles Wachstum modellieren und Logarithmen nutzen",
      "Sinus- und Kosinusfunktionen beschreiben"
    ]
  },
  {
    targetTitle: "Q2 Analytische Geometrie, Lineare Algebra und Vertiefung der Analysis",
    reqRefs: [
      "Lineare Gleichungssysteme lösen und deuten",
      "Geradengleichungen, Nullstellen und Schnittpunkte bestimmen",
      "Satz des Pythagoras anwenden",
      "Trigonometrie am rechtwinkligen Dreieck anwenden",
      "Sinus- und Kosinussatz nutzen",
      "Ähnlichkeit und Strahlensatz anwenden",
      "Raumgeometrische Probleme mit Körpern lösen"
    ]
  },
  {
    targetTitle: "Q3 Stochastik",
    reqRefs: [
      "Laplace-Experimente auswerten",
      "Baumdiagramme und Pfadregeln für zusammengesetzte Experimente nutzen",
      "Verknüpfte Ereignisse mit Mengen- und Vierfelderdarstellungen strukturieren",
      "Wahrscheinlichkeiten verknüpfter Ereignisse berechnen",
      "Kenngrößen von Daten bestimmen und interpretieren",
      "Stochastische Simulationen und Monte-Carlo-Verfahren deuten"
    ]
  }
];

let missingCount = 0;
let updatedCount = 0;
let applicabilityExpandedCount = 0;

for (const title of bridgeApplicabilityExpansions) {
  const candidates = titleToGoals.get(normalizeTitle(title)) || [];
  if (candidates.length !== 1) {
    console.log(`Could not find unique applicability-expansion node with title: ${title}`);
    missingCount++;
    continue;
  }

  const [goal] = candidates;
  goal.extendedData = goal.extendedData || {};
  goal.extendedData.provenance = goal.extendedData.provenance || {};

  const provenance = goal.extendedData.provenance;
  const additionalSourceLandscapeIds = new Set(
    Array.isArray(provenance.additionalSourceLandscapeIds)
      ? provenance.additionalSourceLandscapeIds.filter((entry) => typeof entry === 'string')
      : []
  );

  if (
    provenance.sourceLandscapeId !== HESSEN_LOWER_SECONDARY_MATH_LANDSCAPE_ID
    && !additionalSourceLandscapeIds.has(HESSEN_LOWER_SECONDARY_MATH_LANDSCAPE_ID)
  ) {
    additionalSourceLandscapeIds.add(HESSEN_LOWER_SECONDARY_MATH_LANDSCAPE_ID);
    provenance.additionalSourceLandscapeIds = Array.from(additionalSourceLandscapeIds).sort();
    applicabilityExpandedCount++;
  }
}

for (const [targetTitle, reqTitles] of Object.entries(updates)) {
  const targetCandidates = titleToGoals.get(normalizeTitle(targetTitle)) || [];
  if (targetCandidates.length !== 1) {
    console.log(`Could not find target node with title: ${targetTitle}`);
    missingCount++;
    continue;
  }

  const [targetNode] = targetCandidates;
  if (!targetNode.requires) {
    targetNode.requires = [];
  }

  for (const reqTitle of reqTitles) {
    const resolution = resolveGoalReference(targetNode, reqTitle);
    if (!resolution.goal) {
      console.log(resolution.reason);
      missingCount++;
    } else {
      if (!targetNode.requires.includes(resolution.goal.id)) {
        targetNode.requires.push(resolution.goal.id);
        updatedCount++;
      }
    }
  }
}

for (const { targetRef, reqRefs } of targetedUpdates) {
  const resolution = resolveGoalReference({ title: targetRef.title }, targetRef);
  if (!resolution.goal) {
    console.log(resolution.reason);
    missingCount++;
    continue;
  }

  const targetNode = resolution.goal;
  if (!targetNode.requires) {
    targetNode.requires = [];
  }

  for (const reqRef of reqRefs) {
    const reqResolution = resolveGoalReference(targetNode, reqRef);
    if (!reqResolution.goal) {
      console.log(reqResolution.reason);
      missingCount++;
      continue;
    }

    if (!targetNode.requires.includes(reqResolution.goal.id)) {
      targetNode.requires.push(reqResolution.goal.id);
      updatedCount++;
    }
  }
}

for (const { targetTitle, reqRefs } of bridgeUpdates) {
  const targetCandidates = titleToGoals.get(normalizeTitle(targetTitle)) || [];
  if (targetCandidates.length !== 1) {
    console.log(`Could not find target node with title: ${targetTitle}`);
    missingCount++;
    continue;
  }

  const [targetNode] = targetCandidates;
  if (!targetNode.requires) {
    targetNode.requires = [];
  }

  for (const reqRef of reqRefs) {
    const resolution = resolveGoalReference(targetNode, reqRef);
    if (!resolution.goal) {
      console.log(resolution.reason);
      missingCount++;
      continue;
    }

    if (!targetNode.requires.includes(resolution.goal.id)) {
      targetNode.requires.push(resolution.goal.id);
      updatedCount++;
    }
  }
}

console.log(`Missing references: ${missingCount}`);
console.log(`New requires added: ${updatedCount}`);
console.log(`Applicability expansions: ${applicabilityExpandedCount}`);

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
