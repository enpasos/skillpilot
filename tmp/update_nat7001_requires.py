import json
from pathlib import Path

path = Path('curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_NAT7001.de.json')

data = json.loads(path.read_text(encoding='utf-8'))

# Map shortKey -> goal
by_short = {g['shortKey']: g for g in data['goals']}

requires_map = {
    # Optical foundations
    'tum_nat7001_gaussian_beams': ['tum_nat7001_ray_wave_transition'],

    # Quantized field
    'tum_nat7001_quantized_field': ['tum_nat7001_optical_foundations'],
    'tum_nat7001_fock_states': ['tum_nat7001_field_quantization'],
    'tum_nat7001_coherent_states': ['tum_nat7001_field_quantization'],
    'tum_nat7001_squeezed_states': ['tum_nat7001_field_quantization'],
    'tum_nat7001_thermal_states': ['tum_nat7001_field_quantization'],

    # Light-matter interaction
    'tum_nat7001_light_matter': ['tum_nat7001_quantized_field'],
    'tum_nat7001_jaynes_cummings': ['tum_nat7001_two_level_dynamics'],

    # Quantum vacuum effects
    'tum_nat7001_vacuum_effects': ['tum_nat7001_quantized_field'],
    'tum_nat7001_spontaneous_emission': ['tum_nat7001_light_matter'],
    'tum_nat7001_purcell_effect': ['tum_nat7001_spontaneous_emission'],
    'tum_nat7001_lamb_shift': ['tum_nat7001_light_matter'],

    # Coherence and correlations
    'tum_nat7001_coherence_correlations': ['tum_nat7001_quantized_field'],
    'tum_nat7001_photon_statistics': ['tum_nat7001_coherence_functions'],

    # Experimental quantum optics
    'tum_nat7001_experimental_qo': ['tum_nat7001_light_matter'],
    'tum_nat7001_qnd_photons': ['tum_nat7001_experimental_settings'],

    # Entanglement and quantum information
    'tum_nat7001_entanglement_qi': ['tum_nat7001_coherence_correlations'],
    'tum_nat7001_entangled_pairs': ['tum_nat7001_experimental_qo'],
    'tum_nat7001_quantum_teleportation': ['tum_nat7001_entangled_pairs'],
}

# Apply
for short_key, goal in by_short.items():
    req_short = requires_map.get(short_key, [])
    req_ids = []
    for r in req_short:
        if r not in by_short:
            raise SystemExit(f"Missing required shortKey: {r}")
        req_ids.append(by_short[r]['id'])
    goal['requires'] = req_ids

path.write_text(json.dumps(data, ensure_ascii=False, indent=4) + '\n', encoding='utf-8')
