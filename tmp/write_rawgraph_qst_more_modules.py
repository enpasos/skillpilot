from pathlib import Path

BASE = Path('/home/enpasos/projects/skillpilot')
RAWGRAPH_DIR = BASE / 'curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/input/rawgraph'
RAWGRAPH_DIR.mkdir(parents=True, exist_ok=True)

rawgraphs = {
    'CH3337': """# CH3337 Symmetry and Group Theory - rawgraph breakdown

Node: Symmetry and Group Theory (CH3337)
Description: The learner can use group theory and symmetry arguments to analyze molecular and solid-state systems.

  Node: Group theory foundations
  Description: The learner can define groups and apply basic symmetry operations and representations.

    Node: Group axioms, subgroups, and symmetry operations
    Description: The learner can classify symmetry operations and identify subgroups and generators.

    Node: Representations and character tables
    Description: The learner can build representations and read character tables for point groups.

  Node: Molecular symmetry and spectroscopy
  Description: The learner can classify molecules by point groups and predict spectroscopic activity.

    Node: Point group classification of molecules
    Description: The learner can determine point groups and symmetry elements of molecules.

    Node: Vibrational modes and selection rules
    Description: The learner can derive normal modes and relate symmetry to IR/Raman activity.

  Node: Symmetry in quantum chemistry and solids
  Description: The learner can apply symmetry to quantum-mechanical models and solid-state structures.

    Node: Symmetry in quantum mechanics and MO theory
    Description: The learner can use symmetry to simplify MO analysis and quantum states.

    Node: Crystal and lattice symmetry
    Description: The learner can describe space-group symmetry and its effect on solid-state properties.
""",
    'CIT4330012': """# CIT4330012 Software for Quantum Computing - rawgraph breakdown

Node: Software for Quantum Computing (CIT4330012)
Description: The learner can evaluate quantum computing applications and use software tools to design, simulate, compile, and verify quantum circuits.

  Node: Quantum computing paradigm and suitability
  Description: The learner can contrast quantum vs classical computing and assess application suitability.

    Node: Quantum vs classical computation
    Description: The learner can explain how quantum computation differs from classical models.

    Node: Application suitability assessment
    Description: The learner can judge whether a problem benefits from quantum approaches.

  Node: Design flow and data structures
  Description: The learner can apply design flows and data structures for quantum software.

    Node: Quantum application design flow
    Description: The learner can outline the steps from algorithm to implementation on hardware.

    Node: Data structures for quantum design
    Description: The learner can use data structures for circuits, states, and decision diagrams.

  Node: Core software tools
  Description: The learner can use software tools for simulation, compilation, and verification.

    Node: Circuit simulation and verification
    Description: The learner can simulate circuits and verify functional correctness.

    Node: Compilation and mapping to hardware
    Description: The learner can compile circuits and map them to target devices.

  Node: Hands-on implementation
  Description: The learner can implement and execute quantum circuits in software toolchains.

    Node: Implementing circuits in toolkits
    Description: The learner can realize circuits with tools such as Qiskit-like environments.

    Node: Executing and evaluating results
    Description: The learner can run circuits on simulators or hardware and analyze outputs.
""",
    'CIT4330013': """# CIT4330013 Design Automation and Simulation for Microfluidic Devices - rawgraph breakdown

Node: Design Automation and Simulation for Microfluidic Devices (CIT4330013)
Description: The learner can design, simulate, and evaluate microfluidic lab-on-chip devices from application requirements to prototyping.

  Node: Microfluidics applications and platforms
  Description: The learner can analyze applications and select suitable microfluidic platforms.

    Node: Application potential and use cases
    Description: The learner can identify domains where microfluidics offers advantages.

    Node: Platform types and components
    Description: The learner can compare continuous-flow and digital microfluidic platforms and components.

  Node: Design automation workflow
  Description: The learner can apply design steps and automation methods for microfluidic layouts.

    Node: Layout synthesis and channel design
    Description: The learner can dimension channels and plan fluidic connections.

    Node: Control of flow, mixing, and incubation
    Description: The learner can specify control parameters for mixing, heating, and timing.

  Node: Simulation methods
  Description: The learner can model transport and evaluate devices using simulations.

    Node: Flow and transport modeling
    Description: The learner can model pressure-driven flow and diffusion effects.

    Node: Simulation tools and validation
    Description: The learner can use simulation tools to assess performance and constraints.

  Node: Fabrication and prototyping
  Description: The learner can outline fabrication steps and integration into prototypes.

    Node: Fabrication processes and materials
    Description: The learner can describe common fabrication approaches for microfluidic chips.

    Node: Testing and iteration
    Description: The learner can plan testing procedures and refine designs based on results.
""",
    'CIT4430005': """# CIT4430005 Photonic Quantum Technologies - rawgraph breakdown

Node: Photonic Quantum Technologies (CIT4430005)
Description: The learner can explain quantum photonics principles and analyze photonic platforms for communication and computing.

  Node: Quantum photonics fundamentals
  Description: The learner can describe single photons, entanglement, and basic optical quantum states.

    Node: Single-photon and entangled states
    Description: The learner can characterize single-photon sources and entangled photonic states.

    Node: Coherent light-matter interaction
    Description: The learner can explain resonator QED and coherent coupling mechanisms.

  Node: Semiconductor photonic platforms
  Description: The learner can evaluate semiconductor-based photon sources and qubits.

    Node: Optically active semiconductor qubits
    Description: The learner can compare semiconductor spin and defect-based qubits.

    Node: Photon generation and detection
    Description: The learner can explain how quantum light is generated and detected.

  Node: Photonic quantum communication
  Description: The learner can apply photonic protocols for communication and networking.

    Node: Quantum communication protocols
    Description: The learner can describe QKD and entanglement distribution protocols.

    Node: Performance analysis of photonic devices
    Description: The learner can analyze efficiency, losses, and noise in photonic systems.

  Node: Photonic quantum computing
  Description: The learner can describe photonic gates and architectures.

    Node: Photonic gates and circuits
    Description: The learner can explain how photonic gates are implemented.

    Node: Scalability and integration challenges
    Description: The learner can discuss integration and scaling issues for photonic processors.
""",
    'EI70760': """# EI70760 Simulation of Quantum Devices - rawgraph breakdown

Node: Simulation of Quantum Devices (EI70760)
Description: The learner can model quantum nanoelectronic devices and implement numerical simulations of their behavior.

  Node: Quantum device modeling
  Description: The learner can formulate physical models for nanoscale quantum devices.

    Node: Schrodinger equation for nanodevices
    Description: The learner can set up Schrodinger equations for confined structures.

    Node: Device physics and boundary conditions
    Description: The learner can specify device parameters and boundary conditions.

  Node: Numerical solution methods
  Description: The learner can apply numerical techniques to solve model equations.

    Node: Discretization and eigenvalue problems
    Description: The learner can discretize equations and solve for states.

    Node: Quantum transport simulations
    Description: The learner can model transport using appropriate numerical methods.

  Node: Implementation and validation
  Description: The learner can implement basic simulation codes and validate results.

    Node: Coding basic simulators
    Description: The learner can implement simple numerical solvers.

    Node: Result interpretation and verification
    Description: The learner can interpret outputs and check model consistency.
""",
    'EI77006': """# EI77006 Current Topics in Photonic Quantum Technologies - rawgraph breakdown

Node: Current Topics in Photonic Quantum Technologies (EI77006)
Description: The learner can independently explore new research topics in photonic quantum technologies and present critical analyses.

  Node: Literature research and topic selection
  Description: The learner can identify relevant research questions and sources.

    Node: Finding and summarizing papers
    Description: The learner can locate and summarize current publications.

    Node: Positioning research in the field
    Description: The learner can place findings within the state of the art.

  Node: Critical evaluation
  Description: The learner can assess methods, results, and limitations of studies.

    Node: Assessing experimental and theoretical methods
    Description: The learner can critique methodologies and assumptions.

    Node: Comparing approaches and results
    Description: The learner can compare competing approaches and results.

  Node: Scientific presentation
  Description: The learner can prepare and deliver a clear scientific talk.

    Node: Structuring and visualizing a talk
    Description: The learner can structure presentations and create clear visuals.

    Node: Responding to questions and discussion
    Description: The learner can answer questions and defend interpretations.
""",
    'NAT3036': """# NAT3036 Quantum Computing with Superconducting Qubits: Basic Concepts - rawgraph breakdown

Node: Quantum Computing with Superconducting Qubits: Basic Concepts (NAT3036)
Description: The learner can explain superconducting qubit hardware, map algorithms to hardware, and relate fault-tolerance requirements to experiments.

  Node: Quantum algorithms and hardware mapping
  Description: The learner can relate core quantum algorithms to hardware constraints.

    Node: Core protocols and algorithmic building blocks
    Description: The learner can describe teleportation, Grover, and QFT as motivating examples.

    Node: Hardware-aware algorithm mapping
    Description: The learner can map algorithms onto native gate sets and connectivity.

  Node: Superconducting qubit hardware
  Description: The learner can describe superconducting circuits and their operation.

    Node: Qubit types and couplers
    Description: The learner can compare transmon, fluxonium, and coupling elements.

    Node: Control and readout techniques
    Description: The learner can explain microwave control and measurement schemes.

  Node: Characterization and benchmarking
  Description: The learner can evaluate qubits and gates using characterization methods.

    Node: Coherence and noise metrics
    Description: The learner can interpret T1/T2 and error metrics.

    Node: Gate and processor benchmarking
    Description: The learner can apply benchmarking and calibration concepts.

  Node: Error correction and scaling
  Description: The learner can explain QEC codes and fault-tolerance thresholds.

    Node: Codes and decoding basics
    Description: The learner can outline surface codes and decoding steps.

    Node: Scaling challenges and platform comparison
    Description: The learner can compare superconducting platforms to ions and atoms for scaling.
""",
    'NAT5008m': """# NAT5008m Current Topics in Quantum Networks - rawgraph breakdown

Node: Current Topics in Quantum Networks (NAT5008m)
Description: The learner can analyze current research in quantum networks and communicate findings in presentations.

  Node: Research literacy and presentation
  Description: The learner can read, summarize, and present recent papers.

    Node: Weekly paper analysis
    Description: The learner can extract key results from assigned papers.

    Node: Scientific presentation preparation
    Description: The learner can prepare clear presentations of research findings.

  Node: Quantum network hardware and scaling
  Description: The learner can compare hardware platforms and scaling challenges.

    Node: Hardware platforms for networking
    Description: The learner can compare atoms, ions, superconducting circuits, and solid-state platforms.

    Node: Nanofabrication and scaling challenges
    Description: The learner can describe fabrication approaches and scalability limits.

  Node: Distributed quantum information
  Description: The learner can explain protocols for distributed quantum processing.

    Node: Entanglement distribution and memories
    Description: The learner can explain entanglement distribution and quantum memory roles.

    Node: Communication and computation protocols
    Description: The learner can describe protocols for quantum communication and distributed computing.

  Node: State-of-the-art assessment
  Description: The learner can evaluate trends and open challenges.

    Node: Evaluating recent developments
    Description: The learner can assess the significance of recent results.

    Node: Identifying open challenges
    Description: The learner can articulate key open problems.
""",
    'NAT5030m': """# NAT5030m Cavity-, Circuit- and Waveguide QED - rawgraph breakdown

Node: Cavity-, Circuit- and Waveguide QED (NAT5030m)
Description: The learner can understand quantum light-matter interaction literature and communicate current research trends.

  Node: Fundamentals of light-matter interaction
  Description: The learner can explain core QED models for cavities, circuits, and waveguides.

    Node: Jaynes-Cummings and related models
    Description: The learner can describe basic QED Hamiltonians and coupling regimes.

    Node: Coupling regimes and decay processes
    Description: The learner can differentiate weak/strong coupling and loss mechanisms.

  Node: Current research in QED platforms
  Description: The learner can identify state-of-the-art topics in cavity, circuit, and waveguide QED.

    Node: Quantum information and simulation schemes
    Description: The learner can describe recent schemes for processing and simulation.

    Node: Experimental implementations
    Description: The learner can summarize experimental advances and setups.

  Node: Scientific communication
  Description: The learner can critically read literature and present results.

    Node: Critical reading of papers
    Description: The learner can interpret and critique current publications.

    Node: Presenting results to non-experts
    Description: The learner can explain findings to a broad audience.
""",
    'NAT7003': """# NAT7003 Ultra-Cold Quantum Gases - rawgraph breakdown

Node: Ultra-Cold Quantum Gases (NAT7003)
Description: The learner can describe ultracold gas preparation and analyze interacting Bose gases and lattice systems.

  Node: Cooling, trapping, and statistics
  Description: The learner can explain laser cooling, trapping, and quantum statistics.

    Node: Laser cooling and trapping methods
    Description: The learner can describe key techniques for preparing ultracold atoms.

    Node: Quantum statistics and Bose-Einstein condensation
    Description: The learner can explain Bose condensation and thermodynamics.

  Node: Interacting Bose gases
  Description: The learner can model interactions and resulting phenomena.

    Node: Low-energy scattering and mean-field theory
    Description: The learner can derive scattering concepts and Gross-Pitaevskii theory.

    Node: Superfluidity and nonlinear excitations
    Description: The learner can explain superfluidity, solitons, and vortices.

  Node: Lattice systems and strong correlations
  Description: The learner can analyze optical lattices and correlated phases.

    Node: Optical lattices and Mott transition
    Description: The learner can explain lattice potentials and Mott transitions.

    Node: Coherence and applications
    Description: The learner can describe coherence properties and quantum simulation uses.
""",
    'NAT7026': """# NAT7026 Introduction to Graphene and 2D Materials - rawgraph breakdown

Node: Introduction to Graphene and 2D Materials (NAT7026)
Description: The learner can explain electronic structure and experimental techniques for graphene and moire materials.

  Node: Experimental techniques and transport
  Description: The learner can apply key nano-fabrication and characterization methods.

    Node: Nanofabrication and characterization
    Description: The learner can describe fabrication, microscopy, and cryogenic techniques.

    Node: Electronic transport models
    Description: The learner can apply Drude, Hall, and Boltzmann transport concepts.

  Node: Electronic structure and Dirac physics
  Description: The learner can model band structures and Dirac fermions in graphene.

    Node: Tight-binding band structure
    Description: The learner can compute band structures for graphene and related materials.

    Node: Dirac equation and pseudospin
    Description: The learner can explain massless Dirac fermions and pseudospin texture.

  Node: Topology and moire superlattices
  Description: The learner can explain topological effects and moire band engineering.

    Node: Quantum Hall and topological concepts
    Description: The learner can explain Berry phase, Chern numbers, and topological insulators.

    Node: Moire patterns and flat bands
    Description: The learner can explain moire superlattices, Hofstadter physics, and flat bands.

  Node: Correlation effects and phase transitions
  Description: The learner can analyze correlated phases in twisted bilayer graphene.

    Node: Symmetry breaking and phase transitions
    Description: The learner can describe symmetry breaking and many-body ground states.

    Node: Strong correlations and superconductivity
    Description: The learner can explain Hubbard physics, superconductivity, and strange metallicity.
""",
    'PH2127': """# PH2127 Surface Physics - rawgraph breakdown

Node: Surface Physics (PH2127)
Description: The learner can describe surface structure, electronic properties, and experimental probes of surfaces.

  Node: Surface structure and reconstruction
  Description: The learner can analyze surface crystallography and reconstructions.

    Node: Surface symmetry and reconstruction patterns
    Description: The learner can identify surface unit cells and reconstruction motifs.

    Node: Defects and adsorption sites
    Description: The learner can describe defects and adsorption on surfaces.

  Node: Surface electronic properties
  Description: The learner can explain surface states and work-function changes.

    Node: Surface states and band bending
    Description: The learner can analyze electronic surface states and band bending.

    Node: Adsorption and charge transfer
    Description: The learner can describe charge transfer and adsorption effects.

  Node: Surface characterization methods
  Description: The learner can use concepts of key surface probes.

    Node: Scanning probe methods (STM/AFM)
    Description: The learner can explain imaging principles of STM and AFM.

    Node: Diffraction and spectroscopy
    Description: The learner can describe LEED and spectroscopic techniques.

  Node: Thin films and interfaces
  Description: The learner can explain thin-film growth and interface phenomena.

    Node: Growth modes and epitaxy
    Description: The learner can describe layer-by-layer and island growth.

    Node: Interface effects and applications
    Description: The learner can relate interface properties to device behavior.
""",
    'PH2141': """# PH2141 Nanotechnology - rawgraph breakdown

Node: Nanotechnology (PH2141)
Description: The learner can explain nanofabrication, nanomaterials properties, and characterization methods.

  Node: Nanofabrication methods
  Description: The learner can compare top-down and bottom-up fabrication approaches.

    Node: Lithography, etching, deposition
    Description: The learner can outline common lithography and deposition methods.

    Node: Self-assembly and bottom-up synthesis
    Description: The learner can describe bottom-up assembly techniques.

  Node: Nanomaterials and properties
  Description: The learner can analyze size-dependent properties of nanomaterials.

    Node: Quantum dots, nanowires, and 2D materials
    Description: The learner can describe key nanomaterial classes.

    Node: Quantum confinement and size effects
    Description: The learner can explain confinement and surface effects.

  Node: Characterization techniques
  Description: The learner can select appropriate characterization methods.

    Node: Electron and scanning probe microscopy
    Description: The learner can explain SEM/TEM/AFM principles.

    Node: Optical and electrical measurements
    Description: The learner can describe spectroscopic and transport measurements.

  Node: Applications and integration
  Description: The learner can relate nanotechnology to device applications.

    Node: Nanoelectronics and sensors
    Description: The learner can describe nanotech applications in electronics and sensing.

    Node: Nanophotonics and bioapplications
    Description: The learner can discuss photonic and biomedical uses.
""",
}

for code, text in rawgraphs.items():
    path = RAWGRAPH_DIR / f'DE_BAY_U_TUM_{code}.txt'
    path.write_text(text.strip() + '\n', encoding='utf-8')
    print(f'Wrote {path}')
