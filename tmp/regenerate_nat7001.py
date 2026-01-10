import json
import uuid
from pathlib import Path

OUT_PATH = Path("/home/enpasos/projects/skillpilot/curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_NAT7001.de.json")

NS = uuid.uuid5(uuid.NAMESPACE_DNS, "skillpilot.io")

MODULE_CODE = "NAT7001"
MODULE_TITLE_DE = "Quantenoptik"
MODULE_TITLE_EN = "Quantum Optics"
ECTS = 9
SOURCE_REF = f"https://academics.nat.tum.de/org/mh/details/mod/{MODULE_CODE}"

TOP_DESCRIPTION_EN = (
    "This module gives an introduction to the wide field of quantum optics. "
    "Subjects will include: from ray to wave optics, Gaussian beams, field quantization, "
    "Fock states, coherent states, squeezed states, thermal states, two-level systems, "
    "Jaynes-Cummings and dressed atoms as well as measurable consequences of the electromagnetic vacuum. "
    "If time permits, it will also touch aspects of correlations and photon statistics as well as topics on "
    "quantum information such as teleportation and quantum cryptography."
)

TOP_DESCRIPTION_DE = (
    "Dieses Modul gibt eine Einfuehrung in das breite Gebiet der Quantenoptik. "
    "Behandelt werden unter anderem der Uebergang von Strahlen- zu Wellenoptik, Gauss'sche Strahlen, "
    "Feldquantisierung, Fock-Zustaende, kohaerente, gequetschte und thermische Zustaende, "
    "Zwei-Niveau-Systeme, das Jaynes-Cummings-Modell und gekleidete Atome sowie messbare Konsequenzen "
    "des elektromagnetischen Vakuums. Wenn es die Zeit erlaubt, werden auch Aspekte von Korrelationen "
    "und Photonenstatistik sowie Themen der Quanteninformation wie Teleportation und Quantenkryptographie behandelt."
)

ROOT_DESC_EN = "The learner can explain core concepts of quantum optics and apply them to representative problems within the module scope."
ROOT_DESC_DE = "Die lernende Person kann zentrale Konzepte der Quantenoptik erklaeren und auf repraesentative Aufgaben aus dem Modulumfang anwenden."


def goal_id(short_key: str) -> str:
    return str(uuid.uuid5(NS, f"tum-nat7001/{short_key}"))


def build():
    categories = [
        {
            "shortKey": "tum_nat7001_optical_foundations",
            "title": "Optische Grundlagen",
            "titleEn": "Optical foundations",
            "description": "Die lernende Person kann grundlegende Konzepte der klassischen Optik mit der Quantenoptik verknuepfen.",
            "descriptionEn": "The learner can connect classical optics to quantum optics through key wave concepts.",
            "children": [
                {
                    "shortKey": "tum_nat7001_ray_wave_transition",
                    "title": "Uebergang von Strahlen- zu Wellenoptik",
                    "titleEn": "Ray to wave optics transition",
                    "description": "Die lernende Person kann erklaeren, wann Strahlenoptik nicht ausreicht, und Konsequenzen der Wellenoptik fuer einfache Aufbauten herleiten.",
                    "descriptionEn": "The learner can explain when ray optics is insufficient and derive wave-optics consequences for simple setups."
                },
                {
                    "shortKey": "tum_nat7001_gaussian_beams",
                    "title": "Gauss'sche Strahlen",
                    "titleEn": "Gaussian beams",
                    "description": "Die lernende Person kann Taillenradius, Rayleigh-Laenge, Divergenz und Intensitaetsprofile von Gauss-Strahlen berechnen.",
                    "descriptionEn": "The learner can calculate beam waist, Rayleigh range, divergence, and intensity profiles for Gaussian beams."
                }
            ],
        },
        {
            "shortKey": "tum_nat7001_quantized_field",
            "title": "Quantisiertes elektromagnetisches Feld",
            "titleEn": "Quantized electromagnetic field",
            "description": "Die lernende Person kann Licht als quantisierte Feldmoden modellieren und grundlegende Zustandsgroessen berechnen.",
            "descriptionEn": "The learner can model light as quantized field modes and compute basic state properties.",
            "children": [
                {
                    "shortKey": "tum_nat7001_field_quantization",
                    "title": "Feldquantisierung und Modenoperatoren",
                    "titleEn": "Field quantization and mode operators",
                    "description": "Die lernende Person kann Erzeugungs- und Vernichtungsoperatoren fuer einen Modus ansetzen und Erwartungswerte der Photonenzahl berechnen.",
                    "descriptionEn": "The learner can set up creation and annihilation operators for a single mode and compute photon number expectations."
                },
                {
                    "shortKey": "tum_nat7001_fock_states",
                    "title": "Fock-Zustaende",
                    "titleEn": "Fock states",
                    "description": "Die lernende Person kann Photonenstatistiken und Messergebnisse fuer Zahlzustaende berechnen.",
                    "descriptionEn": "The learner can compute photon number statistics and measurement outcomes for number states."
                },
                {
                    "shortKey": "tum_nat7001_coherent_states",
                    "title": "Kohaerente Zustaende",
                    "titleEn": "Coherent states",
                    "description": "Die lernende Person kann Poisson-Photonenstatistik und Quadratur-Erwartungswerte fuer kohaerente Zustaende herleiten.",
                    "descriptionEn": "The learner can derive Poisson photon statistics and quadrature expectations for coherent states."
                },
                {
                    "shortKey": "tum_nat7001_squeezed_states",
                    "title": "Gequetschte Zustaende",
                    "titleEn": "Squeezed states",
                    "description": "Die lernende Person kann Quadratur-Quetschung erklaeren und Varianzreduktionen mit einem Quetschparameter berechnen.",
                    "descriptionEn": "The learner can explain quadrature squeezing and compute variance reductions with a squeezing parameter."
                },
                {
                    "shortKey": "tum_nat7001_thermal_states",
                    "title": "Thermische Zustaende",
                    "titleEn": "Thermal states",
                    "description": "Die lernende Person kann thermische Photonenstatistik beschreiben und mittlere Photonenzahlen fuer einen Modus berechnen.",
                    "descriptionEn": "The learner can describe thermal photon statistics and compute mean photon numbers for a mode."
                }
            ],
        },
        {
            "shortKey": "tum_nat7001_light_matter",
            "title": "Licht-Materie-Wechselwirkung in Zwei-Niveau-Systemen",
            "titleEn": "Light-matter interaction in two-level systems",
            "description": "Die lernende Person kann die quantisierte Licht-Atom-Wechselwirkung in einfachen Zwei-Niveau-Modellen analysieren.",
            "descriptionEn": "The learner can analyze quantized light-atom interaction in basic two-level models.",
            "children": [
                {
                    "shortKey": "tum_nat7001_two_level_dynamics",
                    "title": "Dynamik von Zwei-Niveau-Systemen",
                    "titleEn": "Two-level system dynamics",
                    "description": "Die lernende Person kann Rabi-Oszillationen loesen und Populationsdynamiken eines getriebenen Zwei-Niveau-Systems interpretieren.",
                    "descriptionEn": "The learner can solve for Rabi oscillations and interpret population dynamics of a driven two-level system."
                },
                {
                    "shortKey": "tum_nat7001_jaynes_cummings",
                    "title": "Jaynes-Cummings-Modell",
                    "titleEn": "Jaynes-Cummings model",
                    "description": "Die lernende Person kann gekleidete Zustaende, Rabi-Aufspaltung und Vakuum-Rabi-Oszillationen herleiten.",
                    "descriptionEn": "The learner can derive dressed states, Rabi splitting, and predict vacuum Rabi oscillations."
                }
            ],
        },
        {
            "shortKey": "tum_nat7001_vacuum_effects",
            "title": "Quanten-Vakuum-Effekte",
            "titleEn": "Quantum vacuum effects",
            "description": "Die lernende Person kann beobachtbare Effekte erklaeren, die auf Vakuumfluktuationen zurueckgefuehrt werden.",
            "descriptionEn": "The learner can explain observable effects attributed to vacuum fluctuations.",
            "children": [
                {
                    "shortKey": "tum_nat7001_spontaneous_emission",
                    "title": "Spontane Emission",
                    "titleEn": "Spontaneous emission",
                    "description": "Die lernende Person kann spontane Emission als vakuuminduzierten Prozess erklaeren und Zerfallsraten abschaetzen.",
                    "descriptionEn": "The learner can explain spontaneous emission as a vacuum-induced process and estimate decay rates."
                },
                {
                    "shortKey": "tum_nat7001_purcell_effect",
                    "title": "Purcell-Effekt",
                    "titleEn": "Purcell effect",
                    "description": "Die lernende Person kann verstaerkte Emission in Resonatoren quantifizieren und den Purcell-Faktor mit Modenvolumen und Q in Beziehung setzen.",
                    "descriptionEn": "The learner can quantify cavity-enhanced emission and relate the Purcell factor to mode volume and Q."
                },
                {
                    "shortKey": "tum_nat7001_casimir_force",
                    "title": "Casimir-Kraft",
                    "titleEn": "Casimir force",
                    "description": "Die lernende Person kann den Ursprung der Casimir-Kraft erklaeren und ihre Abhaengigkeit von der Geometrie beschreiben.",
                    "descriptionEn": "The learner can explain the origin of the Casimir force and describe its dependence on geometry."
                },
                {
                    "shortKey": "tum_nat7001_lamb_shift",
                    "title": "Lamb-Verschiebung",
                    "titleEn": "Lamb shift",
                    "description": "Die lernende Person kann die Lamb-Verschiebung als vakuumbezogene Niveauverschiebung erklaeren und ihren physikalischen Ursprung skizzieren.",
                    "descriptionEn": "The learner can explain the Lamb shift as a vacuum-related level shift and outline its physical origin."
                }
            ],
        },
        {
            "shortKey": "tum_nat7001_coherence_correlations",
            "title": "Kohaerenz und Korrelationen",
            "titleEn": "Coherence and correlations",
            "description": "Die lernende Person kann Kohaerenzeigenschaften von Licht analysieren und Korrelationsfunktionen interpretieren.",
            "descriptionEn": "The learner can analyze coherence properties of light and interpret correlation functions.",
            "children": [
                {
                    "shortKey": "tum_nat7001_coherence_functions",
                    "title": "Kohaerenzfunktionen",
                    "titleEn": "Coherence functions",
                    "description": "Die lernende Person kann Kohaerenzfunktionen erster und zweiter Ordnung g1 und g2 berechnen und interpretieren.",
                    "descriptionEn": "The learner can compute and interpret first- and second-order coherence functions g1 and g2."
                },
                {
                    "shortKey": "tum_nat7001_photon_statistics",
                    "title": "Photonenstatistik und Korrelationen",
                    "titleEn": "Photon statistics and correlations",
                    "description": "Die lernende Person kann Poisson'sches, gebunchtes und antibunchtes Licht anhand von Korrelationsdaten unterscheiden.",
                    "descriptionEn": "The learner can distinguish Poissonian, bunched, and antibunched light via correlation data."
                }
            ],
        },
        {
            "shortKey": "tum_nat7001_experimental_qo",
            "title": "Experimentelle Quantenoptik",
            "titleEn": "Experimental quantum optics",
            "description": "Die lernende Person kann theoretische Modelle mit experimentellen Realisierungen und Messungen verknuepfen.",
            "descriptionEn": "The learner can relate theoretical models to experimental realizations and measurements.",
            "children": [
                {
                    "shortKey": "tum_nat7001_experimental_settings",
                    "title": "Experimentelle Aufbauten fuer quantisierte Licht-Atom-Wechselwirkung",
                    "titleEn": "Experimental settings for quantized light-atom interaction",
                    "description": "Die lernende Person kann Aufbauten zur Untersuchung von Vakuum-Rabi-Oszillationen und starker Kopplung beschreiben.",
                    "descriptionEn": "The learner can describe setups used for vacuum Rabi oscillations and strong coupling tests."
                },
                {
                    "shortKey": "tum_nat7001_qnd_photons",
                    "title": "Zerstoerungsfreie Photonmessungen",
                    "titleEn": "Non-destructive photon measurements",
                    "description": "Die lernende Person kann Prinzipien von quanten-nicht-destruktiven (QND) Photonmessungen erklaeren.",
                    "descriptionEn": "The learner can explain principles of quantum non-demolition measurements of photons."
                }
            ],
        },
        {
            "shortKey": "tum_nat7001_entanglement_qi",
            "title": "Verschraenkung und Quanteninformation",
            "titleEn": "Entanglement and quantum information",
            "description": "Die lernende Person kann quantenoptische Ressourcen mit Informationsaufgaben verknuepfen.",
            "descriptionEn": "The learner can connect quantum-optical resources to information tasks.",
            "children": [
                {
                    "shortKey": "tum_nat7001_entangled_pairs",
                    "title": "Erzeugung verschraenkter Photonenpaare",
                    "titleEn": "Entangled photon pair generation",
                    "description": "Die lernende Person kann typische Erzeugungsmethoden (z. B. SPDC) erklaeren und erwartete Korrelationen beschreiben.",
                    "descriptionEn": "The learner can explain typical generation methods (e.g., SPDC) and expected correlations."
                },
                {
                    "shortKey": "tum_nat7001_quantum_teleportation",
                    "title": "Quanten-Teleportation",
                    "titleEn": "Quantum teleportation",
                    "description": "Die lernende Person kann das Teleportationsprotokoll skizzieren und die benoetigten Verschraenkungsressourcen benennen.",
                    "descriptionEn": "The learner can outline the teleportation protocol and identify required entanglement resources."
                },
                {
                    "shortKey": "tum_nat7001_quantum_cryptography",
                    "title": "Quantenkryptographie",
                    "titleEn": "Quantum cryptography",
                    "description": "Die lernende Person kann die Grundidee der QKD (z. B. BB84) erklaeren und die Rolle einzelner Photonen beschreiben.",
                    "descriptionEn": "The learner can explain the basic idea of QKD (e.g., BB84) and the role of single photons."
                }
            ],
        },
    ]

    goals = []

    # Root goal uses existing deterministic id for tum-module/NAT7001
    root_id = str(uuid.uuid5(NS, f"tum-module/{MODULE_CODE}"))
    root_contains = [goal_id(cat["shortKey"]) for cat in categories]

    goals.append({
        "id": root_id,
        "shortKey": "tum_nat7001_module",
        "title": f"{MODULE_TITLE_DE} (Modul {MODULE_CODE})",
        "titleEn": f"{MODULE_TITLE_EN} (Module {MODULE_CODE})",
        "description": ROOT_DESC_DE,
        "descriptionEn": ROOT_DESC_EN,
        "core": True,
        "weight": float(ECTS),
        "phase": "Modul",
        "area": "Gesamtkompetenz",
        "tags": [f"module:{MODULE_CODE}", f"ects:{ECTS}"],
        "contains": root_contains,
        "requires": [],
        "sourceRef": SOURCE_REF
    })

    for cat in categories:
        cat_id = goal_id(cat["shortKey"])
        child_ids = [goal_id(child["shortKey"]) for child in cat["children"]]
        goals.append({
            "id": cat_id,
            "shortKey": cat["shortKey"],
            "title": cat["title"],
            "titleEn": cat["titleEn"],
            "description": cat["description"],
            "descriptionEn": cat["descriptionEn"],
            "core": True,
            "weight": 2.0,
            "phase": "Modul",
            "area": "Kompetenz",
            "tags": [f"module:{MODULE_CODE}"],
            "contains": child_ids,
            "requires": []
        })
        for child in cat["children"]:
            goals.append({
                "id": goal_id(child["shortKey"]),
                "shortKey": child["shortKey"],
                "title": child["title"],
                "titleEn": child["titleEn"],
                "description": child["description"],
                "descriptionEn": child["descriptionEn"],
                "core": True,
                "weight": 1.0,
                "phase": "Modul",
                "area": "Kompetenz",
                "tags": [f"module:{MODULE_CODE}"],
                "contains": [],
                "requires": []
            })

    json_output = {
        "title": f"{MODULE_TITLE_DE} (TUM, Modul {MODULE_CODE})",
        "titleEn": f"{MODULE_TITLE_EN} (TUM, Module {MODULE_CODE})",
        "description": TOP_DESCRIPTION_DE,
        "descriptionEn": TOP_DESCRIPTION_EN,
        "locale": "de-DE",
        "subject": "TUM-Module",
        "frameworkId": "tum-nat7001",
        "goals": goals
    }

    OUT_PATH.write_text(json.dumps(json_output, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    build()
