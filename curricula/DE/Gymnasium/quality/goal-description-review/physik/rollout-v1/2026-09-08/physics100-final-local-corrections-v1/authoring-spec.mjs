// Individually adjudicated B048 findings. This file is input, not a QA approval.
export const corrections = [
  {
    goalId: '6e7c35e0-7a38-5996-a42e-005038eff0db',
    beforeDescription: 'Die lernende Person kann Potenzialtopfmodelle zur Bindungsenergie qualitativ beschreiben.',
    description: 'Die lernende Person kann im vereinfachten Potenzialtopfmodell eines Kerns die Bindungsenergie eines Teilchens als Energieabstand seines gebundenen Zustands zur freien Schwelle qualitativ erklären und von der Topftiefe unterscheiden.',
    descriptionEn: 'The learner can qualitatively explain a particle’s binding energy in a simplified nuclear potential-well model as the energy gap between its bound state and the free-particle threshold and distinguish it from the well depth.',
    atomicityReason: 'Ein qualitatives Modellurteil über genau eine Relation: Ablöseenergie ist der Abstand eines gebundenen Einteilchenzustands zur freien Schwelle. Die Abgrenzung zur Topftiefe prüft dieselbe Relation, keine zweite Kernstrukturroutine. Keine quantitative Vielteilchentheorie und keine Aussage, jedes Nukleon habe dieselbe Bindungsenergie.',
    memoryReason: 'Die Unterscheidung zwischen Energieniveau, Schwelle und Topftiefe wird an einem vorgelegten Energiediagramm begründet. Dafür ist keine zusätzliche isolierte Memorykarte erforderlich; no_memory_needed bleibt nach inhaltlicher Einzelprüfung gerechtfertigt.',
    source: 'B048 round-a and round-b both revise; selected precise round-b relationship, with unchanged qualitative scope.',
  },
  {
    goalId: '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2',
    beforeDescription: 'Die lernende Person kann den waagerechten Wurf experimentell untersuchen, als Überlagerung von horizontaler und vertikaler Bewegung deuten und die Flugbahn im x-y-Diagramm darstellen.',
    description: 'Die lernende Person kann den waagerechten Wurf experimentell untersuchen, bei vernachlässigbarem Luftwiderstand und konstanter Fallbeschleunigung als Überlagerung gleichförmiger horizontaler und gleichmäßig beschleunigter vertikaler Bewegung deuten und die Flugbahn im x-y-Diagramm darstellen.',
    descriptionEn: 'The learner can experimentally investigate horizontal projectile motion, interpret it under negligible air resistance and constant gravitational acceleration as the superposition of uniform horizontal and uniformly accelerated vertical motion, and represent its trajectory in an x-y diagram.',
    atomicityReason: 'Messpunkte, Komponentenzerlegung und x-y-Bahn sind drei Darstellungen ein und derselben horizontalen Wurfbewegung. Das gemeinsame Modell mit derselben Zeit und ausdrücklich begrenzten Annahmen verbindet Beobachtung und Erklärung. Der schiefe Wurf bleibt ein eigenständiges Ziel.',
    memoryReason: 'DE/EN-Karte physics_e_cov_036 persönlich gelesen: x=v0t und y=gt²/2 mit Startnullpunkt und positiver Fallrichtung sind ein enger erinnerungswürdiger Zusammenhang. Die Karte erhält die gleichen Modellbedingungen wie das Ziel; Interpretation und experimentelle Prüfung werden nicht durch Formelerinnerung ersetzt.',
    source: 'B048 round-a revise accepted: explicit model conditions and component laws; round-b keep remains historical, fresh current rounds required.',
  },
  {
    goalId: '12260012-cf04-5409-b57d-f5b3a46d9126',
    beforeDescription: 'Die lernende Person kann den freien Fall mit Luftreibung qualitativ und mithilfe einfacher Modelle beschreiben und den Begriff der Grenzgeschwindigkeit erläutern.',
    title: 'Fallbewegung mit Luftwiderstand und Grenzgeschwindigkeit',
    titleEn: 'Falling Motion with Air Resistance and Terminal Velocity',
    description: 'Die lernende Person kann eine Fallbewegung mit Luftwiderstand mithilfe einfacher Modelle qualitativ beschreiben und bei vernachlässigbarem Auftrieb die Grenzgeschwindigkeit aus dem Gleichgewicht von Gewichtskraft und Luftwiderstand erklären.',
    descriptionEn: 'The learner can qualitatively describe falling motion with air resistance using simple models and, with negligible buoyancy, explain terminal velocity through the balance of weight and drag.',
    atomicityReason: 'Die Entwicklung einer Fallbewegung zum Kräftegleichgewicht ist eine zusammenhängende Modellkompetenz. Grenzgeschwindigkeit ist deren dynamischer Grenzzustand und kein zusätzlicher Bewegungsfall. Fachsprachlich wird das Modell mit Luftwiderstand nicht mehr als freier Fall bezeichnet; vernachlässigter Auftrieb begrenzt die Zweikräftebilanz.',
    memoryReason: 'DE/EN-Karte physics_e_cov_044 persönlich gelesen: der enge Merksatz Gewichtskraft=Luftwiderstand, a=0, v konstant bleibt notwendig. Die fehlerhafte Bezeichnung freier Fall und der Schreibfehler Graviationskraft werden ausdrücklich korrigiert; die Auftriebsannahme wird genannt. Kein neuer Deck und keine neue Karte.',
    source: 'B048 both rounds revise; title and existing single related card corrected together. https://openstax.org/books/university-physics-volume-1/pages/6-4-drag-force-and-terminal-speed',
  },
  {
    goalId: '853dbe54-85b0-59ab-8f3a-000c2b7746ec',
    beforeDescription: 'Die lernende Person kann das Phänomen der Supraleitung qualitativ beschreiben und einfache Anwendungen sowie experimentelle Beobachtungen (z. B. Schwebeeffekte) erläutern.',
    description: 'Die lernende Person kann das Verschwinden des elektrischen Gleichstromwiderstands unterhalb einer kritischen Temperatur und die Verdrängung eines Magnetfelds im Meißner-Zustand qualitativ beschreiben und damit einfache Anwendungen und Beobachtungen der Supraleitung erläutern.',
    descriptionEn: 'The learner can qualitatively describe the disappearance of electrical DC resistance below a critical temperature and the expulsion of a magnetic field in the Meissner state, and use these properties to explain simple applications and observations of superconductivity.',
    atomicityReason: 'Ein qualitativer Zustandsbegriff: elektrische und magnetische Merkmale kennzeichnen gemeinsam die Supraleitung und begründen deren beobachtbare Anwendungen. Der Text fordert weder eine unabhängige Materialmessroutine noch eine BCS-Herleitung. Feldverdrängung wird ausdrücklich auf den Meißner-Zustand begrenzt und nicht auf beliebige Felder oder jeden supraleitenden Zustand verallgemeinert.',
    memoryReason: 'Materialzustand, Temperaturgrenze und Beobachtungsdeutung werden an Daten und Versuchen verknüpft. Isoliertes Auswendiglernen einer zusätzlichen Karte ist dafür nicht nötig; die bisherige no_memory_needed-Entscheidung wurde für den präzisierten DE/EN-Auftrag einzeln neu geprüft.',
    source: 'B048 round-b revise accepted with its explicit Meissner-state qualification; no microscopic theory added. https://openstax.org/books/university-physics-volume-3/pages/9-8-superconductivity',
  },
]

export const cardCorrections = {
  de: {
    physics_e_cov_036: {
      back: '$x(t)=v_0t$,\n\n$y(t)=\\frac12gt^2$\n\n(bei Start in $y=0$, Fallrichtung positiv, vernachlässigbarem Luftwiderstand und konstantem $g$)',
    },
    physics_e_cov_044: {
      front: 'Grenzgeschwindigkeit beim Fallen mit Luftwiderstand: Bedingung?',
      back: 'Bei vernachlässigbarem Auftrieb gilt bei der Grenzgeschwindigkeit $v_\\text{G}$:\n\nGewichtskraft = Luftwiderstandskraft\n\n$F_G=F_\\text{Luft}$\n\ndamit $a=0$ und $v=\\text{konstant}$, nicht Stillstand.',
    },
  },
  en: {
    physics_e_cov_036: {
      back: '$x(t)=v_0t$,\n\n$y(t)=\\frac12gt^2$\n\n(for launch at $y=0$, positive downward direction, negligible air resistance and constant $g$)',
    },
    physics_e_cov_044: {
      front: 'Terminal speed when falling with air resistance: condition?',
      back: 'With negligible buoyancy, at terminal speed $v_\\text{T}$:\n\nweight = air-resistance force\n\n$F_G=F_\\text{air}$\n\nthus $a=0$ and $v=\\text{constant}$, not rest.',
    },
  },
}
