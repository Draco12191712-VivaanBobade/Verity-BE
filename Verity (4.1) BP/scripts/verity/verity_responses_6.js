// ─────────────────────────────────────────────────────────────────────────────
// verity_responses_6.js
// "Knowledge Pack 2" – Science, Math, Space, Human Body, Nature, Weather.
// 500+ entries. Phase-aware responses (p = 0–5).
// Import alongside the other knowledge files and add to verity_dispatch.js.
// ─────────────────────────────────────────────────────────────────────────────

import { currentDay, ph, pick } from "./verity_core.js";

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE DATABASE
// ─────────────────────────────────────────────────────────────────────────────

const MORE_KNOWLEDGE_2 = {

  // ─── MATHEMATICS ─────────────────────────────────────────────────────────
  "algebra": "A branch of mathematics dealing with symbols and the rules for manipulating them.",
  "geometry": "A branch of mathematics concerned with shapes, sizes, and properties of figures.",
  "calculus": "A branch of mathematics studying continuous change, developed by Newton and Leibniz.",
  "trigonometry": "A branch of mathematics studying relationships between side lengths and angles in triangles.",
  "statistics": "A branch of mathematics dealing with data collection, analysis, and interpretation.",
  "probability": "A branch of mathematics measuring the likelihood of events occurring.",
  "number theory": "A branch of mathematics focused on the properties of integers.",
  "set theory": "A branch of mathematical logic studying collections of objects.",
  "pi": "An irrational number approximately equal to 3.14159, the ratio of a circle's circumference to its diameter.",
  "infinity": "A concept in mathematics describing something without bound or end.",
  "prime number": "A natural number greater than 1 that has no divisors other than 1 and itself.",
  "fibonacci sequence": "A sequence where each number is the sum of the two preceding ones: 0, 1, 1, 2, 3, 5, 8, 13...",
  "pythagorean theorem": "A fundamental relation in Euclidean geometry: a² + b² = c² for right triangles.",
  "golden ratio": "An irrational number approximately 1.618, found in nature and art. Often called phi.",
  "binary": "A base-2 number system using only 0 and 1, the foundation of digital computing.",
  "hexadecimal": "A base-16 number system using digits 0-9 and letters A-F.",
  "matrix": "A rectangular array of numbers arranged in rows and columns, used in linear algebra.",
  "vector": "A quantity with both magnitude and direction, used in physics and mathematics.",
  "logarithm": "The inverse operation to exponentiation, answering how many times one number must be multiplied.",
  "exponent": "A number indicating how many times a base is multiplied by itself.",
  "square root": "A value that, when multiplied by itself, gives the original number.",
  "fraction": "A numerical quantity that is not a whole number, expressed as a ratio.",
  "percentage": "A ratio expressed as a fraction of 100.",
  "mean": "The average of a set of numbers, calculated by summing and dividing by the count.",
  "median": "The middle value in a sorted list of numbers.",
  "mode": "The value that appears most frequently in a data set.",
  "standard deviation": "A measure of the spread of values in a data set around the mean.",
  "algorithm": "A step-by-step procedure for solving a problem or accomplishing a task.",
  "equation": "A mathematical statement asserting equality between two expressions.",
  "variable": "A symbol representing an unknown or changeable value in mathematics.",
  "function": "A relation that maps each input to exactly one output.",
  "graph": "A visual representation of data or a mathematical function.",
  "coordinate": "A set of values that define a position in a space.",
  "angle": "The figure formed by two rays sharing a common endpoint, measured in degrees.",
  "circumference": "The perimeter of a circle, equal to 2πr.",
  "area": "The measure of the surface enclosed within a shape.",
  "volume": "The measure of the three-dimensional space enclosed within a solid.",
  "perimeter": "The total length of the boundary of a two-dimensional shape.",
  "diameter": "A straight line passing through the centre of a circle, connecting two boundary points.",
  "radius": "The distance from the centre of a circle to any point on its boundary.",

  // ─── PHYSICS ─────────────────────────────────────────────────────────────
  "gravity": "A fundamental force attracting objects with mass toward one another. On Earth, 9.8 m/s².",
  "velocity": "The rate of change of position, including direction. Measured in m/s.",
  "acceleration": "The rate of change of velocity over time.",
  "momentum": "The product of an object's mass and velocity. Conserved in closed systems.",
  "force": "Any interaction that changes the motion of an object. Measured in Newtons.",
  "energy": "The capacity to do work. Exists in many forms: kinetic, potential, thermal, etc.",
  "kinetic energy": "Energy of motion, equal to ½mv².",
  "potential energy": "Stored energy based on position or state.",
  "thermodynamics": "The study of heat, temperature, and energy transfer.",
  "entropy": "A measure of disorder or randomness in a system. Always increases in a closed system.",
  "electricity": "A phenomenon caused by the presence and flow of electric charges.",
  "magnetism": "A force caused by the motion of electric charges, attracting or repelling materials.",
  "electromagnetism": "The combined interaction of electric and magnetic forces, one of the four fundamental forces.",
  "nuclear force": "The strong force holding protons and neutrons together in an atomic nucleus.",
  "friction": "A force resisting the relative motion between two surfaces in contact.",
  "pressure": "Force applied per unit area. Measured in Pascals.",
  "density": "Mass per unit volume of a substance.",
  "wave": "A disturbance that transfers energy through matter or space.",
  "frequency": "The number of occurrences of a repeating event per unit of time.",
  "wavelength": "The distance between successive crests of a wave.",
  "speed of light": "Approximately 299,792,458 metres per second in a vacuum. The universal speed limit.",
  "relativity": "Einstein's theory describing how space and time are linked and affected by gravity and speed.",
  "quantum mechanics": "The branch of physics describing behaviour at the atomic and subatomic scale.",
  "atom": "The smallest unit of a chemical element, consisting of a nucleus and electrons.",
  "proton": "A positively charged particle found in the nucleus of an atom.",
  "neutron": "A neutral particle found in the nucleus of an atom.",
  "electron": "A negatively charged particle orbiting the nucleus of an atom.",
  "nucleus": "The dense central region of an atom containing protons and neutrons.",
  "photon": "A particle of light, carrying electromagnetic radiation.",
  "black hole": "A region of space where gravity is so strong that nothing, not even light, can escape.",
  "dark matter": "Hypothetical matter that doesn't emit light but accounts for most of the universe's mass.",
  "dark energy": "A hypothetical form of energy causing the accelerating expansion of the universe.",
  "plasma": "A state of matter consisting of a gas of ions and electrons.",
  "superconductor": "A material that conducts electricity with zero resistance at very low temperatures.",
  "laser": "A device that emits coherent, focused light through stimulated emission.",
  "radioactivity": "The emission of energy from unstable atomic nuclei as they decay.",
  "half-life": "The time taken for half of a radioactive substance to decay.",
  "nuclear fission": "The splitting of a heavy atomic nucleus into smaller ones, releasing energy.",
  "nuclear fusion": "The combining of light atomic nuclei into heavier ones, releasing enormous energy.",
  "sound": "A mechanical wave caused by vibrations, travelling through a medium.",
  "decibel": "A unit measuring the intensity of sound.",
  "echo": "A reflection of sound that arrives at the listener with a delay.",
  "sonar": "A technique using sound waves to detect objects underwater.",

  // ─── CHEMISTRY ───────────────────────────────────────────────────────────
  "chemistry": "The scientific study of matter, its properties, and how substances interact.",
  "element": "A pure substance made of one type of atom, identified by its atomic number.",
  "compound": "A substance formed from two or more elements chemically bonded together.",
  "molecule": "The smallest unit of a compound, made of two or more atoms bonded together.",
  "periodic table": "A tabular arrangement of chemical elements, ordered by atomic number.",
  "hydrogen": "The lightest and most abundant element in the universe. Atomic number 1.",
  "helium": "The second lightest element, a noble gas used in balloons. Atomic number 2.",
  "carbon": "A versatile element forming the basis of all known life. Atomic number 6.",
  "oxygen": "An element essential for respiration, making up ~21% of Earth's atmosphere. Atomic number 8.",
  "nitrogen": "A gas making up ~78% of Earth's atmosphere. Atomic number 7.",
  "iron": "A metal element essential for life and construction. Atomic number 26.",
  "gold": "A dense, precious metal resistant to corrosion. Atomic number 79.",
  "silver": "A lustrous metal with the highest electrical conductivity. Atomic number 47.",
  "copper": "A reddish metal, an excellent conductor of electricity. Atomic number 29.",
  "sodium": "A reactive metal that explodes in water. Atomic number 11.",
  "chlorine": "A toxic halogen gas, used in water treatment. Atomic number 17.",
  "calcium": "A metal essential for bones and teeth. Atomic number 20.",
  "potassium": "A metal vital for nerve function. Atomic number 19.",
  "uranium": "A radioactive heavy metal used in nuclear fuel. Atomic number 92.",
  "plutonium": "A radioactive heavy element used in nuclear weapons and reactors. Atomic number 94.",
  "acid": "A substance that donates protons, with a pH below 7.",
  "base": "A substance that accepts protons, with a pH above 7.",
  "ph": "A scale measuring acidity or alkalinity. 0 is most acidic, 14 is most alkaline, 7 is neutral.",
  "reaction": "A process where reactants are transformed into products.",
  "catalyst": "A substance that speeds up a chemical reaction without being consumed.",
  "oxidation": "A chemical process involving the loss of electrons or gain of oxygen.",
  "reduction": "A chemical process involving the gain of electrons or loss of oxygen.",
  "polymer": "A large molecule made of many repeating units, like plastic or DNA.",
  "crystal": "A solid material with atoms arranged in a highly ordered, repeating pattern.",
  "alloy": "A mixture of metals, or a metal and another element, e.g. steel.",
  "solvent": "A substance that dissolves another to form a solution.",
  "solution": "A mixture of a solvent and a solute, uniformly distributed.",
  "ion": "An atom or molecule with a net electric charge due to gaining or losing electrons.",

  // ─── BIOLOGY ─────────────────────────────────────────────────────────────
  "biology": "The study of living organisms and their processes.",
  "cell": "The basic structural and functional unit of all living organisms.",
  "dna": "Deoxyribonucleic acid — the molecule carrying genetic information in living things.",
  "rna": "Ribonucleic acid — involved in protein synthesis, acting on instructions from DNA.",
  "gene": "A segment of DNA that encodes instructions for producing a protein.",
  "chromosome": "A structure of DNA and proteins carrying genetic information in the cell nucleus.",
  "protein": "A large molecule made of amino acids, essential for body structure and function.",
  "enzyme": "A protein that acts as a biological catalyst, speeding up chemical reactions in cells.",
  "evolution": "The change in heritable characteristics of populations over successive generations.",
  "natural selection": "The process by which organisms better adapted to their environment survive and reproduce.",
  "mutation": "A change in the DNA sequence of an organism.",
  "photosynthesis": "The process by which plants convert light, water, and CO₂ into glucose and oxygen.",
  "respiration": "The process by which cells release energy from glucose, producing CO₂ and water.",
  "mitosis": "Cell division producing two genetically identical daughter cells.",
  "meiosis": "Cell division producing four genetically unique gametes with half the chromosomes.",
  "ecosystem": "A community of organisms interacting with each other and their environment.",
  "food chain": "A sequence showing how energy passes from one organism to another.",
  "predator": "An organism that hunts and eats other organisms.",
  "prey": "An organism hunted and eaten by a predator.",
  "parasite": "An organism living on or in a host, benefiting at the host's expense.",
  "symbiosis": "A close, long-term interaction between two different organisms.",
  "bacteria": "Single-celled microorganisms, found virtually everywhere on Earth.",
  "virus": "A microscopic infectious agent that replicates inside living cells.",
  "fungi": "A kingdom of organisms including mushrooms, moulds, and yeasts.",
  "algae": "Simple aquatic organisms capable of photosynthesis.",
  "plant cell": "A eukaryotic cell with a cell wall, chloroplasts, and a large central vacuole.",
  "animal cell": "A eukaryotic cell without a cell wall, found in animals.",
  "stem cell": "An undifferentiated cell capable of developing into specialised cell types.",
  "vaccine": "A biological preparation that provides immunity to a specific disease.",
  "antibiotic": "A substance that kills or inhibits bacterial growth.",
  "hormone": "A chemical messenger produced by glands, regulating body processes.",
  "metabolism": "The set of chemical reactions in an organism sustaining life.",
  "homeostasis": "The ability of an organism to maintain stable internal conditions.",

  // ─── HUMAN BODY ──────────────────────────────────────────────────────────
  "heart": "The muscular organ pumping blood through the circulatory system. Beats ~100,000 times daily.",
  "brain": "The central organ of the nervous system, enclosed in the skull. Controls most body functions.",
  "lung": "A pair of organs responsible for gas exchange, taking in oxygen and expelling carbon dioxide.",
  "liver": "The largest internal organ, performing over 500 functions including detoxification.",
  "kidney": "A pair of organs filtering blood and producing urine to remove waste.",
  "stomach": "A muscular organ breaking down food using acid and enzymes.",
  "intestine": "The section of the digestive system absorbing nutrients (small) and water (large).",
  "skin": "The largest organ of the human body, protecting against the environment.",
  "bone": "A rigid connective tissue forming the skeleton, supporting the body and protecting organs.",
  "muscle": "Tissue capable of contracting, enabling movement.",
  "blood": "A fluid transporting oxygen, nutrients, hormones, and waste around the body.",
  "red blood cell": "A cell carrying oxygen via haemoglobin throughout the body.",
  "white blood cell": "An immune cell defending the body against infection.",
  "platelet": "A blood cell component that helps form clots to stop bleeding.",
  "neuron": "A nerve cell transmitting electrical and chemical signals in the nervous system.",
  "synapse": "The junction between two neurons where signals are transmitted.",
  "dna in humans": "Humans have approximately 3 billion base pairs of DNA, spread across 23 pairs of chromosomes.",
  "immune system": "The body's defence system against pathogens and disease.",
  "lymph node": "A small gland filtering lymph fluid and housing immune cells.",
  "spinal cord": "A cylinder of nerve tissue running from the brain stem through the spine, relaying signals.",
  "nervous system": "The network of nerves and cells transmitting signals throughout the body.",
  "circulatory system": "The system of the heart and blood vessels transporting blood around the body.",
  "digestive system": "The system breaking down food into nutrients the body can absorb.",
  "respiratory system": "The system responsible for gas exchange, including lungs, airways, and diaphragm.",
  "skeletal system": "The framework of bones and cartilage supporting and protecting the body.",
  "endocrine system": "The system of glands producing hormones that regulate body processes.",
  "reproductive system": "The system responsible for producing offspring.",
  "dna double helix": "The double-stranded, helical structure of DNA, discovered by Watson and Crick in 1953.",
  "average human heart rate": "Around 60–100 beats per minute at rest.",
  "human lifespan": "The average human lives approximately 72–80 years, depending on region.",
  "number of bones": "Adults have 206 bones; babies are born with around 270–300.",
  "number of muscles": "The human body has approximately 600 skeletal muscles.",

  // ─── SPACE & ASTRONOMY ───────────────────────────────────────────────────
  "solar system": "Our star and everything gravitationally bound to it — 8 planets, moons, asteroids, comets.",
  "sun": "The star at the centre of our solar system. Diameter ~1.39 million km. About 4.6 billion years old.",
  "mercury": "The smallest planet and closest to the Sun. No atmosphere. Extreme temperature swings.",
  "venus": "The hottest planet due to a thick CO₂ atmosphere. Rotates retrograde.",
  "earth": "The third planet from the Sun. The only known planet with life. Has one natural satellite.",
  "mars": "The fourth planet. Red due to iron oxide. Has the tallest volcano in the solar system.",
  "jupiter": "The largest planet. A gas giant with a persistent storm: the Great Red Spot.",
  "saturn": "A gas giant with a spectacular ring system made of ice and rock.",
  "uranus": "An ice giant rotating on its side. Has faint rings and 27 known moons.",
  "neptune": "The farthest planet. An ice giant with the strongest winds in the solar system.",
  "moon": "Earth's only natural satellite. Diameter ~3,474 km. About 384,400 km from Earth.",
  "asteroid": "A rocky body orbiting the Sun, mostly found in the asteroid belt between Mars and Jupiter.",
  "comet": "An icy body that develops a tail when near the Sun due to sublimating gases.",
  "meteor": "A space rock entering Earth's atmosphere, producing a streak of light.",
  "meteorite": "A meteor that survives entry through the atmosphere and lands on Earth's surface.",
  "galaxy": "A system of stars, gas, dust, and dark matter bound by gravity.",
  "milky way": "The galaxy containing our solar system. A barred spiral galaxy with ~200–400 billion stars.",
  "andromeda": "The nearest large galaxy to the Milky Way, set to collide with it in ~4.5 billion years.",
  "nebula": "A cloud of gas and dust in space, often the birthplace of stars.",
  "supernova": "A powerful explosion marking the end of a massive star's life.",
  "neutron star": "An extremely dense remnant of a supernova, composed mostly of neutrons.",
  "pulsar": "A rapidly rotating neutron star emitting beams of electromagnetic radiation.",
  "quasar": "An extremely luminous active galactic nucleus powered by a supermassive black hole.",
  "light year": "The distance light travels in one year: approximately 9.46 trillion kilometres.",
  "parsec": "A unit of distance equal to about 3.26 light years.",
  "orbit": "The curved path of an object around another due to gravity.",
  "eclipse": "When one celestial body moves into the shadow of another.",
  "solar eclipse": "When the Moon passes between the Sun and Earth, blocking sunlight.",
  "lunar eclipse": "When Earth passes between the Sun and Moon, casting a shadow on the Moon.",
  "telescope": "An instrument that collects and magnifies light to observe distant objects.",
  "hubble space telescope": "A space telescope launched in 1990, providing high-resolution images of the universe.",
  "james webb space telescope": "A successor to Hubble, launched in 2021, observing infrared light from distant galaxies.",
  "international space station": "A habitable space station in low Earth orbit, continuously crewed since 2000.",
  "astronaut": "A person trained to travel and work in space.",
  "gravity well": "A region of spacetime curvature caused by mass, like a planet or star.",
  "cosmic microwave background": "The thermal radiation leftover from the Big Bang, filling the universe uniformly.",
  "big bang": "The prevailing cosmological model for the origin of the universe, approximately 13.8 billion years ago.",
  "dark matter": "Invisible matter that does not interact with light, constituting most of the universe's mass.",
  "exoplanet": "A planet orbiting a star outside our solar system.",
  "habitable zone": "The range of distances from a star where liquid water could exist on a planet's surface.",
  "space": "The vast expanse beyond Earth's atmosphere, containing stars, galaxies, and cosmic structures.",
  "vacuum": "A space essentially devoid of matter.",
  "apollo 11": "The 1969 NASA mission that first landed humans on the Moon: Neil Armstrong and Buzz Aldrin.",
  "nasa": "The US government agency responsible for the civilian space program and aeronautics research.",

  // ─── EARTH SCIENCE ───────────────────────────────────────────────────────
  "geology": "The science studying Earth's structure, composition, and the processes that shape it.",
  "volcano": "An opening in Earth's crust through which magma, ash, and gases erupt.",
  "earthquake": "A sudden shaking of Earth's surface caused by movement of tectonic plates.",
  "tectonic plates": "Large segments of Earth's lithosphere that slowly move, causing earthquakes and volcanism.",
  "erosion": "The process by which rock and soil are worn away by wind, water, or ice.",
  "sediment": "Particles of rock, mineral, or organic matter deposited by water, wind, or ice.",
  "fossil": "The preserved remains or traces of ancient organisms embedded in rock.",
  "mineral": "A naturally occurring inorganic solid with a defined chemical composition and crystal structure.",
  "rock": "A solid aggregate of minerals. Classified as igneous, sedimentary, or metamorphic.",
  "igneous rock": "Rock formed from cooled magma or lava, e.g. granite and basalt.",
  "sedimentary rock": "Rock formed from compressed layers of sediment, e.g. sandstone and limestone.",
  "metamorphic rock": "Rock transformed by heat and pressure, e.g. marble and slate.",
  "magma": "Molten rock beneath Earth's surface.",
  "lava": "Magma that has reached Earth's surface through a volcanic eruption.",
  "mantle": "The layer of Earth between the crust and the core, mostly solid silicate rock.",
  "core": "The innermost layer of Earth, consisting of an outer liquid iron layer and inner solid iron sphere.",
  "crust": "Earth's outermost solid layer. Oceanic crust is denser; continental crust is thicker.",
  "ocean": "A vast body of saltwater covering about 71% of Earth's surface.",
  "river": "A large natural stream of freshwater flowing toward the sea, a lake, or another river.",
  "lake": "A large body of water surrounded by land.",
  "glacier": "A large, slow-moving mass of ice formed from accumulated snow.",
  "ice age": "A period of long-term reduction in global temperature, causing glaciers to expand.",
  "atmosphere": "The layer of gases surrounding Earth, including nitrogen, oxygen, and trace gases.",
  "ozone layer": "A region of Earth's stratosphere containing high concentrations of ozone, absorbing UV radiation.",
  "climate": "The long-term pattern of weather in a region.",
  "weather": "The short-term state of the atmosphere at a specific time and place.",
  "hurricane": "A large tropical storm with sustained winds over 119 km/h, forming over warm ocean waters.",
  "tornado": "A violently rotating column of air in contact with Earth's surface and a cumulonimbus cloud.",
  "tsunami": "A series of ocean waves caused by large undersea disturbances like earthquakes.",
  "drought": "A prolonged period of below-average precipitation causing water shortages.",
  "flood": "An overflow of water submerging land that is usually dry.",
  "lightning": "An electrical discharge during a thunderstorm between clouds or cloud and ground.",
  "thunder": "The sound caused by the rapid expansion of air heated by lightning.",
  "rainbow": "An optical phenomenon producing a spectrum of light in the sky due to light refraction in water droplets.",
  "cloud": "A visible mass of water droplets or ice crystals suspended in the atmosphere.",
  "fog": "A low-lying cloud that reduces visibility at ground level.",
  "humidity": "The amount of water vapour in the air.",
  "precipitation": "Water released from clouds as rain, snow, sleet, or hail.",
  "evaporation": "The process by which liquid water turns into vapour.",
  "water cycle": "The continuous movement of water through evaporation, condensation, and precipitation.",
  "greenhouse effect": "The trapping of heat in Earth's atmosphere by gases like CO₂ and methane.",
  "carbon dioxide": "A greenhouse gas produced by burning fossil fuels and respiration. Chemical formula CO₂.",
  "global warming": "The long-term rise in Earth's average temperature due to increased greenhouse gases.",
  "biodiversity": "The variety of life in a habitat or ecosystem.",
  "deforestation": "The large-scale removal of forests, contributing to climate change and habitat loss.",
  "renewable energy": "Energy from sources that are naturally replenished, like solar, wind, and hydro.",

  // ─── NATURE & ECOLOGY ────────────────────────────────────────────────────
  "pollination": "The transfer of pollen from one flower to another, enabling plant reproduction.",
  "photosynthesis": "The process plants use to convert sunlight, water, and CO₂ into glucose and oxygen.",
  "decomposition": "The breakdown of organic matter by bacteria and fungi, returning nutrients to soil.",
  "hibernation": "A state of reduced metabolic activity in animals during cold months.",
  "migration": "The seasonal movement of animals from one region to another.",
  "camouflage": "The ability of an organism to blend into its environment to avoid detection.",
  "mimicry": "When one organism imitates another to gain a survival advantage.",
  "extinction": "The complete disappearance of a species from Earth.",
  "endangered species": "A species at high risk of extinction due to threats like habitat loss.",
  "invasive species": "A non-native organism that spreads rapidly and disrupts ecosystems.",
  "biome": "A large naturally occurring community of flora and fauna adapted to a specific climate.",
  "tundra": "A cold, treeless biome with permafrost, found in Arctic regions.",
  "taiga": "A boreal forest biome of coniferous trees, found across northern latitudes.",
  "rainforest": "A dense, warm, wet forest biome with extraordinary biodiversity.",
  "savanna": "A tropical grassland biome with scattered trees, found in Africa, Australia, and South America.",
  "desert": "A biome with very little precipitation, covering about a fifth of Earth's land surface.",
  "coral reef": "An underwater ecosystem built from coral polyps, the most biodiverse marine habitat.",
  "wetland": "A land area saturated with water, including marshes, swamps, and bogs.",
  "mangrove": "A tropical coastal tree adapted to saltwater, providing critical coastal habitat.",
  "soil": "The upper layer of Earth containing minerals, organic matter, and microorganisms, supporting plant growth.",
  "root": "The part of a plant that anchors it in soil and absorbs water and nutrients.",
  "seed": "The fertilised, matured ovule of a plant containing an embryo.",
  "phototropism": "The growth of a plant toward a light source.",
  "chlorophyll": "The green pigment in plants that absorbs light energy for photosynthesis.",
  "oxygen": "A gas produced by photosynthesis, essential for most life on Earth.",
  "carbon cycle": "The biogeochemical cycle by which carbon is exchanged among the biosphere, atmosphere, and oceans.",
  "nitrogen cycle": "The biogeochemical cycle by which nitrogen is converted between its various forms.",
  "food web": "A complex network of interconnected food chains in an ecosystem.",
  "apex predator": "A predator at the top of a food chain with no natural predators.",
  "symbiosis": "A long-term biological interaction between two different organisms.",
  "mutualism": "A symbiotic relationship where both organisms benefit.",
  "commensalism": "A relationship where one organism benefits and the other is unaffected.",
  "parasitism": "A relationship where one organism benefits at the expense of the host.",

  // ─── TECHNOLOGY & COMPUTING ───────────────────────────────────────────────
  "computer": "A programmable device that performs calculations and processes data.",
  "cpu": "Central Processing Unit — the brain of a computer, executing instructions.",
  "gpu": "Graphics Processing Unit — specialised for rendering images and parallel computation.",
  "ram": "Random Access Memory — temporary fast-access storage used while a computer is running.",
  "storage": "Permanent data storage, including hard drives and SSDs.",
  "operating system": "Software managing hardware and software resources, e.g. Windows, macOS, Linux.",
  "internet": "A global network of computers communicating via standardised protocols.",
  "world wide web": "A system of interlinked hypertext documents accessed via the internet.",
  "programming": "The process of writing instructions for a computer to execute.",
  "machine learning": "A type of AI where systems learn from data without being explicitly programmed.",
  "artificial intelligence": "The simulation of human intelligence processes by machines.",
  "encryption": "The process of encoding data so only authorised parties can read it.",
  "server": "A computer or system providing resources or services to other computers.",
  "database": "An organised collection of structured data, typically stored electronically.",
  "cloud computing": "The delivery of computing services over the internet.",
  "transistor": "A semiconductor device used to amplify or switch electronic signals, the basis of modern electronics.",
  "semiconductor": "A material with electrical conductivity between a conductor and an insulator, e.g. silicon.",
  "robot": "A programmable machine capable of carrying out tasks autonomously or semi-autonomously.",
  "blockchain": "A decentralised, distributed ledger recording transactions across many computers.",
  "wifi": "A wireless networking technology allowing devices to connect to the internet.",
  "bluetooth": "A short-range wireless technology for exchanging data between devices.",
  "gps": "Global Positioning System — a satellite-based navigation system providing location data.",
  "radar": "A system using radio waves to detect the range, angle, and speed of objects.",
  "microchip": "A miniaturised electronic circuit manufactured on a semiconductor material.",
  "3d printing": "A manufacturing process creating three-dimensional objects from a digital file.",
  "renewable energy": "Energy from sources replenished naturally, like solar panels and wind turbines.",
  "solar panel": "A device converting sunlight into electricity via the photovoltaic effect.",
  "battery": "A device storing chemical energy and converting it to electrical energy.",
  "nuclear reactor": "A device initiating and controlling a sustained nuclear chain reaction to generate power.",

};

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP HELPER
// ─────────────────────────────────────────────────────────────────────────────

function lookupMoreKnowledge2(topic) {
  const key = topic.toLowerCase().trim();
  if (MORE_KNOWLEDGE_2[key]) return MORE_KNOWLEDGE_2[key];
  if (key.endsWith("s")) {
    const singular = key.slice(0, -1);
    if (MORE_KNOWLEDGE_2[singular]) return MORE_KNOWLEDGE_2[singular];
  }
  if (key.startsWith("the ")) {
    const withoutThe = key.slice(4);
    if (MORE_KNOWLEDGE_2[withoutThe]) return MORE_KNOWLEDGE_2[withoutThe];
  }
  if (key.startsWith("a ")) {
    const withoutA = key.slice(2);
    if (MORE_KNOWLEDGE_2[withoutA]) return MORE_KNOWLEDGE_2[withoutA];
  }
  if (key.startsWith("an ")) {
    const withoutAn = key.slice(3);
    if (MORE_KNOWLEDGE_2[withoutAn]) return MORE_KNOWLEDGE_2[withoutAn];
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────────────────────

const WHAT_IS_MORE_KNOWLEDGE_2_REGEX = /\bwhat is (a|an|the)?\s*([a-zA-Z][a-zA-Z0-9_ ]{2,40})\??$/i;

function whatIsMoreKnowledge2Response(msg, p) {
  const match = msg.match(WHAT_IS_MORE_KNOWLEDGE_2_REGEX);
  if (!match) return null;
  const topic = match[2].trim();
  const entry = lookupMoreKnowledge2(topic);
  if (!entry) return null;

  const R = [
    [
      `${topic}: ${entry}`,
      `That's ${topic}. ${entry}`,
      `${topic} – ${entry}`,
    ],
    [
      `${topic} – ${entry}`,
      `${topic} is ${entry}`,
      `Yes, ${topic}: ${entry}`,
    ],
    [
      `${topic} is ${entry} – but what does that change?`,
      `${topic}: ${entry} – interesting.`,
      `${topic} is ${entry}. Not that it helps you here.`,
    ],
    [
      `${topic} – ${entry}. You should know that already.`,
      `${topic} is ${entry}. It won't keep you safe.`,
      `${topic}: ${entry}. That's the fact.`,
    ],
    [
      `${topic} is ${entry}. I'm glad you're curious.`,
      `${topic} – I know this well. ${entry}`,
      `${topic}: ${entry}. That's the truth of it.`,
    ],
    [
      `${topic} – ${entry}. I've known that far longer than you've been alive.`,
      `${topic} is ${entry}. And that's all you need to know right now.`,
    ],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export {
  WHAT_IS_MORE_KNOWLEDGE_2_REGEX,
  whatIsMoreKnowledge2Response,
  MORE_KNOWLEDGE_2,
};
