from pathlib import Path

BASE = Path('/home/enpasos/projects/skillpilot')
RAWGRAPH_DIR = BASE / 'curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/input/rawgraph'
RAWGRAPH_DIR.mkdir(parents=True, exist_ok=True)

rawgraphs = {
    'IN2381': """# IN2381 Introduction to Quantum Computing - rawgraph breakdown

Node: Introduction to Quantum Computing (IN2381)
Description: The learner can explain the mathematical foundations of quantum computing and design simple quantum algorithms and circuits.

  Node: Quantum mechanics formalism for computing
  Description: The learner can use the state and operator formalism for qubits and measurements.

    Node: Qubit states and Dirac notation
    Description: The learner can represent single- and multi-qubit states and compute amplitudes.

    Node: Quantum measurements and probabilities
    Description: The learner can model measurements and compute outcome statistics.

  Node: Quantum circuits and gates
  Description: The learner can build circuits from elementary quantum gates.

    Node: Single- and two-qubit gates
    Description: The learner can use common gates and understand their matrix representations.

    Node: Circuit construction and execution
    Description: The learner can design circuits for simple tasks and predict outputs.

  Node: Entanglement and communication protocols
  Description: The learner can explain entanglement and its role in basic protocols.

    Node: Bell inequalities and nonlocality
    Description: The learner can explain Bell tests and their implications.

    Node: Quantum teleportation
    Description: The learner can outline the teleportation protocol and required resources.

  Node: Fundamental quantum algorithms
  Description: The learner can analyze core quantum algorithms and their speedups.

    Node: Grover search and basic algorithmic ideas
    Description: The learner can describe Grover's algorithm and analyze its complexity.

  Node: Software tools and applications
  Description: The learner can use basic software tools for quantum circuits and assess application areas.

    Node: Circuit simulation with Qiskit or Cirq
    Description: The learner can implement and run simple circuits in common toolkits.

    Node: Use cases and limitations of quantum computing
    Description: The learner can identify application domains and discuss limitations.
""",
    'IN2388': """# IN2388 Tensor Networks - rawgraph breakdown

Node: Tensor Networks (IN2388)
Description: The learner can use tensor network representations to approximate high-dimensional data and simulate quantum systems.

  Node: Tensor network fundamentals
  Description: The learner can represent tensors and networks graphically.

    Node: Tensor notation and contractions
    Description: The learner can interpret tensor diagrams and compute contractions.

    Node: Common network structures (MPS, MPO, PEPS)
    Description: The learner can describe standard network architectures and their properties.

  Node: Approximation theory and optimization
  Description: The learner can apply low-rank approximations and optimize tensor networks.

    Node: Low-rank approximations and truncation
    Description: The learner can perform truncation and estimate approximation errors.

    Node: Backpropagation through tensor network operations
    Description: The learner can compute gradients and train tensor network models.

  Node: Simulation of quantum systems and circuits
  Description: The learner can use tensor networks to simulate strongly correlated systems and quantum circuits.

    Node: Simulation of many-body quantum systems
    Description: The learner can model strongly correlated systems with tensor networks.

    Node: Simulation of digital quantum circuits
    Description: The learner can simulate circuit dynamics using tensor network methods.

  Node: Probabilistic modeling and sampling
  Description: The learner can use tensor networks for sampling and probability distributions.

    Node: Sampling from tensor network models
    Description: The learner can generate samples and interpret probabilistic outputs.
""",
    'IN2400': """# IN2400 Advanced Concepts of Quantum Computing - rawgraph breakdown

Node: Advanced Concepts of Quantum Computing (IN2400)
Description: The learner can apply advanced quantum computing concepts such as the quantum Fourier transform, Shor's algorithm, quantum operations, and error correction.

  Node: Quantum Fourier transform and period finding
  Description: The learner can explain and use the quantum Fourier transform in algorithmic settings.

    Node: Quantum Fourier transform fundamentals
    Description: The learner can derive and implement the QFT circuit and interpret its outputs.

    Node: Period finding and Shor's algorithm
    Description: The learner can connect QFT-based period finding to integer factorization.

  Node: Advanced quantum operations
  Description: The learner can model quantum operations beyond unitary gates.

    Node: Quantum operations and channels
    Description: The learner can describe CPTP maps and compose quantum operations.

    Node: Circuit synthesis for advanced algorithms
    Description: The learner can design circuit structures for advanced algorithms.

  Node: Quantum error correction
  Description: The learner can explain error models and apply error correction formalisms.

    Node: Error models and syndrome extraction
    Description: The learner can model errors and describe syndrome measurement.

    Node: Stabilizer formalism and codes
    Description: The learner can use the stabilizer formalism to describe quantum codes.
""",
    'EI76471': """# EI76471 Quantum Information Theory - rawgraph breakdown

Node: Quantum Information Theory (EI76471)
Description: The learner can model quantum communication systems using information-theoretic concepts and apply coding theorems.

  Node: Foundations of quantum information modeling
  Description: The learner can relate quantum information theory to classical Shannon concepts and operational descriptions.

    Node: Operational description of finite-dimensional quantum systems
    Description: The learner can model finite-dimensional quantum systems with an operational approach.

    Node: Connections to classical information theory
    Description: The learner can relate quantum models to classical information-theoretic quantities.

  Node: Quantum hypothesis testing
  Description: The learner can analyze hypothesis tests in the quantum setting.

    Node: Quantum hypothesis tests and Stein's lemma
    Description: The learner can apply quantum Stein's lemma to discriminate states.

  Node: Source coding for quantum sources
  Description: The learner can compress memoryless quantum sources.

    Node: Compression of memoryless quantum sources
    Description: The learner can explain Schumacher compression and related results.

  Node: Channel coding for quantum channels
  Description: The learner can analyze coding theorems for classical communication over quantum channels.

    Node: Classical messages over semiclassical and quantum channels
    Description: The learner can describe transmission of classical messages over memoryless channels.

    Node: Coding theorems for memoryless quantum channels
    Description: The learner can outline coding theorems and proof strategies for quantum channels.

  Node: Advanced topics and communication resources
  Description: The learner can describe advanced topics such as security and entanglement-based resources.

    Node: Information-theoretic security for quantum channels
    Description: The learner can explain security concepts for quantum channels and sources.

    Node: Entanglement theory and resource generation protocols
    Description: The learner can describe entanglement-based resources and protocols for generating communication resources.
""",
    'NAT3011': """# NAT3011 Advanced Topics in Quantum Information Theory - rawgraph breakdown

Node: Advanced Topics in Quantum Information Theory (NAT3011)
Description: The learner can apply advanced concepts of quantum information theory, including entanglement, protocols, simulation, and verification.

  Node: Foundations of quantum information theory
  Description: The learner can apply core concepts of quantum information theory in advanced settings.

    Node: Core concepts and formalism
    Description: The learner can explain core QIT concepts and formal tools.

  Node: Quantum communication protocols
  Description: The learner can explain advanced quantum communication protocols and resources.

    Node: Key protocols and resources
    Description: The learner can explain key communication protocols and the resources they require.

  Node: Entanglement theory
  Description: The learner can analyze bipartite and multipartite entanglement.

    Node: Bipartite entanglement
    Description: The learner can characterize and quantify bipartite entanglement.

    Node: Multipartite entanglement
    Description: The learner can describe multipartite entanglement structures and measures.

  Node: Quantum computing and advantage
  Description: The learner can relate quantum computing concepts to computational advantage.

    Node: Quantum computing concepts and algorithms
    Description: The learner can explain quantum computing concepts and algorithmic ideas.

    Node: Classical simulation and quantum advantage
    Description: The learner can compare classical simulation methods with quantum advantage claims.

  Node: Verification of quantum processors
  Description: The learner can explain challenges and methods for verifying quantum processors.

    Node: Verification challenges and methods
    Description: The learner can describe verification problems and possible approaches.
""",
    'NAT3013': """# NAT3013 Theoretical Quantum Optics - rawgraph breakdown

Node: Theoretical Quantum Optics (NAT3013)
Description: The learner can model quantum light-matter interactions and open quantum systems and apply these tools to key quantum optical effects.

  Node: Light-matter interaction fundamentals
  Description: The learner can describe semi-classical interactions and quantum states of light.

    Node: Semi-classical light-matter interaction
    Description: The learner can explain semi-classical models of light-matter interaction.

    Node: Quantum states of light
    Description: The learner can describe coherent, squeezed, and other nonclassical states of light.

  Node: Cavity QED and atom-photon models
  Description: The learner can apply cavity QED models to atom-photon interactions.

    Node: Jaynes-Cummings model
    Description: The learner can derive and interpret the Jaynes-Cummings model.

    Node: Cavity QED effects
    Description: The learner can explain strong coupling effects in cavity QED.

  Node: Open quantum systems
  Description: The learner can model dissipation and noise in quantum optical systems.

    Node: Master equation techniques
    Description: The learner can apply master equations to open-system dynamics.

    Node: Quantum Langevin equations
    Description: The learner can use Langevin equations to describe noise and damping.

  Node: Quantum optical effects and measurements
  Description: The learner can analyze photodetection, correlations, and nonlinear processes.

    Node: Photodetection and correlations
    Description: The learner can compute correlation functions and interpret photodetection schemes.

    Node: Nonlinear processes and EIT
    Description: The learner can explain nonlinear optical processes, EIT, and slow light.

  Node: Optomechanics and laser cooling
  Description: The learner can apply quantum optics tools to optomechanical systems and cooling.

    Node: Optomechanical systems
    Description: The learner can describe optomechanical coupling and dynamics.

    Node: Laser cooling and trapping
    Description: The learner can explain laser cooling and trapping mechanisms.

  Node: Phase-space methods and laser theory
  Description: The learner can use phase-space methods and understand laser theory.

    Node: Phase-space methods
    Description: The learner can apply phase-space representations to quantum optics.

    Node: Laser theory
    Description: The learner can explain basic laser theory and threshold behavior.

  Node: Numerical simulation of quantum optics
  Description: The learner can implement numerical simulations of quantum optical systems.

    Node: Numerical modeling with Python or Matlab
    Description: The learner can simulate quantum optical dynamics using standard numerical tools.
""",
    'NAT5018m': """# NAT5018m Entanglement in Many-Body System - rawgraph breakdown

Node: Entanglement in Many-Body System (NAT5018m)
Description: The learner can analyze entanglement in many-body systems and communicate research results in a seminar setting.

  Node: Entanglement measures and diagnostics
  Description: The learner can use quantitative measures to characterize entanglement.

    Node: Measures of entanglement
    Description: The learner can define and compare standard entanglement measures.

    Node: Computable measures and entanglement negativity
    Description: The learner can apply computable measures such as entanglement negativity.

  Node: Entanglement structure in one-dimensional systems
  Description: The learner can relate entanglement structure to 1D systems and tensor network models.

    Node: Area laws and matrix product states
    Description: The learner can explain area laws and MPS representations in 1D systems.

    Node: Entanglement spectra in one dimension
    Description: The learner can interpret entanglement spectra for 1D phases.

  Node: Topological entanglement and order
  Description: The learner can use entanglement-based diagnostics for topological phases.

    Node: Topological entanglement entropy
    Description: The learner can explain topological entanglement entropy and its meaning.

    Node: Detecting topological order via entanglement
    Description: The learner can describe how entanglement reveals topological order at finite temperature.

  Node: Research and presentation skills
  Description: The learner can prepare and communicate seminar content effectively.

    Node: Literature review and topic synthesis
    Description: The learner can synthesize research literature into a coherent seminar topic.

    Node: Scientific presentation and discussion
    Description: The learner can present results clearly and discuss them scientifically.
""",
    'NAT5020m': """# NAT5020m Advanced Topics in the Theory of Quantum Matter - rawgraph breakdown

Node: Advanced Topics in the Theory of Quantum Matter (NAT5020m)
Description: The learner can analyze advanced topics in non-equilibrium quantum many-body physics and communicate research-based insights.

  Node: Semiclassical dynamics and Boltzmann transport
  Description: The learner can apply kinetic theory to transport in classical and quantum systems.

    Node: Boltzmann equation and transport
    Description: The learner can use the Boltzmann equation for particle, charge, and energy transport.

    Node: Linear response and topological effects
    Description: The learner can relate kinetic theory to linear response, sum rules, and topological effects.

  Node: Integrable models out of equilibrium
  Description: The learner can apply integrability concepts to non-equilibrium transport.

    Node: Integrability and transport in 1D systems
    Description: The learner can explain integrability-based transport in many-body systems.

    Node: Generalized hydrodynamics
    Description: The learner can outline generalized hydrodynamics for integrable models.

  Node: Hydrodynamic transport in constrained systems
  Description: The learner can analyze transport in systems with conservation constraints.

    Node: Diffusive and unconventional hydrodynamics
    Description: The learner can distinguish diffusive and constrained hydrodynamic behavior.

    Node: Methods for constrained transport
    Description: The learner can summarize methods for hydrodynamic transport in constrained systems.

  Node: Quantum many-body dynamics and thermalization
  Description: The learner can analyze thermalization and its breakdown in quantum many-body systems.

    Node: Thermalization signatures and ETH
    Description: The learner can explain thermalization signatures and the eigenstate thermalization hypothesis.

    Node: Avoiding thermalization (MBL, scars)
    Description: The learner can describe mechanisms such as many-body localization and quantum scars.

  Node: Research and presentation skills
  Description: The learner can conduct literature research and present advanced topics.

    Node: Literature research and topic framing
    Description: The learner can prepare a focused topic using research literature.

    Node: Seminar presentation and discussion
    Description: The learner can present advanced material and engage in discussion.
""",
    'NAT7011': """# NAT7011 Condensed Matter Many-Body Physics and Field Theory 2 - rawgraph breakdown

Node: Condensed Matter Many-Body Physics and Field Theory 2 (NAT7011)
Description: The learner can apply field-theoretical tools to advanced problems in condensed matter many-body physics.

  Node: Field-theory tools and renormalization
  Description: The learner can use path integrals, diagrams, and renormalization group methods.

    Node: Path integrals and diagrammatic techniques
    Description: The learner can use path-integral formulations and Feynman diagrams for many-body systems.

    Node: Renormalization group flows and fixed points
    Description: The learner can explain RG transformations and perform perturbative RG calculations.

  Node: Fermi liquids and linear response
  Description: The learner can analyze charged Fermi liquids and transport response.

    Node: Charged Fermi liquids and screening
    Description: The learner can apply RPA screening and analyze plasma modes.

    Node: Linear response theory and Kubo formalism
    Description: The learner can use response functions and Kubo formulas for transport.

  Node: Superconductivity and charged superfluids
  Description: The learner can analyze BCS theory and Ginzburg-Landau descriptions.

    Node: BCS theory and mean-field approaches
    Description: The learner can formulate BCS theory and related mean-field treatments.

    Node: Ginzburg-Landau theory and Anderson-Higgs mechanism
    Description: The learner can explain the Meissner effect and Anderson-Higgs mechanism.

  Node: Quantum magnetism and Hubbard models
  Description: The learner can model magnetism in Hubbard and Heisenberg systems.

    Node: Hubbard and Heisenberg models
    Description: The learner can analyze phases of the Hubbard and Heisenberg models.

    Node: Field-theory approaches and RVB states
    Description: The learner can apply sigma-models and RVB concepts to frustrated magnets.

  Node: Topological phases and quantum Hall physics
  Description: The learner can analyze topological order and quantum Hall effects.

    Node: Topological invariants and edge states
    Description: The learner can compute Berry/Zak phases and relate them to edge states.

    Node: Integer and fractional quantum Hall effects
    Description: The learner can explain QHE phenomena and Chern-Simons descriptions.

  Node: Strong correlations and lattice gauge theories
  Description: The learner can analyze Kondo physics and exotic correlated systems.

    Node: Kondo physics and heavy fermions
    Description: The learner can explain Kondo screening and heavy fermion behavior.

    Node: Lattice gauge theories and doped Hubbard model
    Description: The learner can describe lattice gauge approaches and doped Hubbard physics.
""",
    'NAT7030': """# NAT7030 Experimental Quantum Computing and Quantum Error Correction - rawgraph breakdown

Node: Experimental Quantum Computing and Quantum Error Correction (NAT7030)
Description: The learner can explain experimental quantum computing platforms and apply quantum error correction concepts.

  Node: Quantum circuits and gate operations
  Description: The learner can describe qubits, gates, and circuit models used in experiments.

    Node: Qubits, gates, and circuit descriptions
    Description: The learner can describe elementary quantum gates and circuits.

    Node: Universal gate sets and logical operations
    Description: The learner can explain universal gate sets and logical operations.

  Node: Quantum computing hardware platforms
  Description: The learner can compare leading experimental platforms.

    Node: Superconducting qubits
    Description: The learner can outline superconducting qubit architectures and control.

    Node: Trapped ions and neutral atoms
    Description: The learner can describe trapped-ion and neutral-atom platforms.

  Node: Quantum error models
  Description: The learner can describe noise sources and error channels in experiments.

    Node: Error channels and noise characterization
    Description: The learner can model quantum errors and characterize noise.

    Node: Syndrome extraction and diagnostics
    Description: The learner can explain syndrome measurement and diagnostics.

  Node: Quantum error correction codes
  Description: The learner can compare experimental QEC codes and fault tolerance.

    Node: Repetition, surface, and color codes
    Description: The learner can describe common codes used in experiments.

    Node: qLDPC codes and fault-tolerant thresholds
    Description: The learner can explain qLDPC codes and fault-tolerance concepts.

  Node: Experimental progress and evaluation
  Description: The learner can analyze recent experimental advances in QEC.

    Node: Evaluating experimental QEC demonstrations
    Description: The learner can assess experimental results and limitations.
""",
}

for code, text in rawgraphs.items():
    path = RAWGRAPH_DIR / f"DE_BAY_U_TUM_{code}.txt"
    path.write_text(text.strip() + "\n", encoding="utf-8")
    print(f"Wrote {path}")
