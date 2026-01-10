from pathlib import Path

BASE = Path('/home/enpasos/projects/skillpilot')
RAWGRAPH_DIR = BASE / 'curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/input/rawgraph'
RAWGRAPH_DIR.mkdir(parents=True, exist_ok=True)

rawgraphs = {
    'MA3001': """# MA3001 Functional Analysis - rawgraph breakdown

Node: Functional Analysis (MA3001)
Description: The learner can use core tools of functional analysis to study linear functionals and operators on Banach and Hilbert spaces.

  Node: Normed, Banach, and Hilbert spaces
  Description: The learner can define normed spaces and distinguish Banach and Hilbert structures.

    Node: Banach spaces and completeness
    Description: The learner can explain completeness and verify Banach space properties in examples.

    Node: Hilbert spaces, inner products, and orthogonality
    Description: The learner can work with inner products, orthogonality, and projections in Hilbert spaces.

  Node: Bounded linear operators and fundamental theorems
  Description: The learner can analyze bounded linear operators and apply key existence theorems.

    Node: Bounded operators and operator norms
    Description: The learner can compute operator norms and determine boundedness.

    Node: Open mapping and bounded inverse theorems
    Description: The learner can apply the open mapping theorem and related consequences.

  Node: Duality and Hahn-Banach
  Description: The learner can use dual spaces and extension principles for linear functionals.

    Node: Dual spaces and linear functionals
    Description: The learner can identify dual spaces and interpret linear functionals.

    Node: Hahn-Banach extension theorems
    Description: The learner can apply Hahn-Banach to extend functionals and separate sets.

  Node: Weak and weak* convergence
  Description: The learner can analyze weak and weak* topologies and convergence.

    Node: Weak convergence in Banach spaces
    Description: The learner can test weak convergence using bounded linear functionals.

    Node: Weak* convergence and duality
    Description: The learner can distinguish weak and weak* convergence and use compactness results.

  Node: Spectral theory of compact selfadjoint operators
  Description: The learner can analyze spectra of compact selfadjoint operators in Hilbert spaces.

    Node: Compact operators and spectral properties
    Description: The learner can characterize compact operators and their spectra.

    Node: Selfadjoint operators and spectral decompositions
    Description: The learner can apply spectral decomposition for compact selfadjoint operators.

  Node: Introduction to unbounded operators
  Description: The learner can explain basic notions of unbounded operators and their domains.
""",
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
    'NAT5040m': """# NAT5040m Seminar: Advanced Topics of Quantum Computing - rawgraph breakdown

Node: Seminar: Advanced Topics of Quantum Computing (NAT5040m)
Description: The learner can investigate an advanced quantum computing topic, analyze its theory, and communicate results.

  Node: Seminar orientation and goals
  Description: The learner can explain overarching goals and challenges in quantum computing.

    Node: Quantum computing landscape and challenges
    Description: The learner can summarize key challenges such as scalability, noise, and algorithmic limits.

  Node: Advanced topic exploration
  Description: The learner can study and contextualize a selected advanced topic.

    Node: Quantum hardware and physical realizations
    Description: The learner can describe major hardware platforms and their trade-offs.

    Node: Quantum circuits and models of computation
    Description: The learner can explain circuit models used in advanced algorithms.

    Node: Quantum simulation
    Description: The learner can explain simulation of quantum systems using quantum computers.

    Node: Tensor network methods
    Description: The learner can explain tensor network approaches for simulation and compression.

    Node: Qubitization and quantum eigenvalue transformation
    Description: The learner can outline qubitization and QET as algorithmic primitives.

    Node: Variational algorithms and quantum machine learning
    Description: The learner can describe variational methods and learning applications.

    Node: Quantum optimization
    Description: The learner can explain optimization formulations and quantum approaches.

    Node: Quantum error correction
    Description: The learner can explain error models and basic correction ideas.

    Node: Quantum cellular automata
    Description: The learner can describe cellular automata models in quantum settings.

    Node: Quantum cryptography
    Description: The learner can explain cryptographic primitives and security ideas.

  Node: Research and communication
  Description: The learner can conduct a focused literature review and present findings.

    Node: Literature study and critical evaluation
    Description: The learner can summarize and critique research papers.

    Node: Seminar presentation and discussion
    Description: The learner can present results clearly and respond to questions.

  Node: Implementation or analysis
  Description: The learner can implement or analyze a selected quantum algorithm or method.

    Node: Algorithm implementation or simulation
    Description: The learner can implement a chosen algorithm or run a simulation.

    Node: Theoretical analysis of the selected method
    Description: The learner can explain assumptions, complexity, and limitations.
""",
}

for code, text in rawgraphs.items():
    path = RAWGRAPH_DIR / f"DE_BAY_U_TUM_{code}.txt"
    path.write_text(text.strip() + "\n", encoding="utf-8")
    print(f"Wrote {path}")
