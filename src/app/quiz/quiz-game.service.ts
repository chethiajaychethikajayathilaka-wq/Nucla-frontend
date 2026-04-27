import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StartAttemptResponse {
  attemptId: string;
  message: string;
}

export interface SubmitQuizRequest {
  answers: number[];       // Selected option index (0–3) for each of the 50 questions, in order
  levelTimes: number[];    // Time in seconds taken to complete each of the 10 levels
}

export interface SubmitQuizResponse {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  grade: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class QuizGameService {
  // ────────────────────────────────────────────────────────────────
  // API Base URL - Update this with your actual backend URL
  // ────────────────────────────────────────────────────────────────
  private readonly API_BASE = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Called when the player hits START.
   * Tells the backend to increment the attempt counter in the DB.
   */
  incrementAttempt(): Observable<StartAttemptResponse> {
    return this.http.post<StartAttemptResponse>(
      `${this.API_BASE}/quiz/start`,
      {}
    );
  }

  /**
   * Called when the player hits SUBMIT after answering all 50 questions.
   * Sends the answers array and per-level time array to the backend.
   * The backend calculates and returns the score.
   *
   * @param payload  { answers: number[50], levelTimes: number[10] }
   */
  submitQuiz(payload: SubmitQuizRequest): Observable<SubmitQuizResponse> {
    return this.http.post<SubmitQuizResponse>(
      `${this.API_BASE}/quiz/submit`,
      payload
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION BANK  (50 MCQ across 10 levels)
// NucLA (Nuclear Learning App) - Master Quiz List
// ─────────────────────────────────────────────────────────────────────────────
export interface QuizQuestion {
  level: number;         // 1 – 10
  host: 'uranium235' | 'neutron';
  question: string;
  options: [string, string, string, string];
  correctIndex: number;  // 0 – 3
}

export interface LevelDialogue {
  uranium235: string;
  neutron: string;
  levelTitle: string;
}

export const LEVEL_DIALOGUES: LevelDialogue[] = [
  // Level 1: The Basics
  {
    uranium235: 'Hi, I am Uranium-235! Did you know that enriched uranium doesn\'t burn or explode like diesel or gas? It is very safe compared to other fuels.',
    neutron: 'Yes, and I\'m the one who triggers the reaction! So... who am I?',
    levelTitle: 'The Basics'
  },
  // Level 2: Safety & Physical Form
  {
    uranium235: 'One of my tiny pellets (the size of a fingertip) contains as much energy as 1 ton of coal!',
    neutron: 'And despite that energy, we are very safe. There is no risk of fire or explosion.',
    levelTitle: 'Safety & Physical Form'
  },
  // Level 3: The Fission Process
  {
    uranium235: 'When you hit me, Neutron, I become \'Uranium-236\' for a tiny second before I split!',
    neutron: 'And when you split, you release heat and more neutrons to keep the reaction going.',
    levelTitle: 'The Fission Process'
  },
  // Level 4: Moderators & Speed
  {
    uranium235: 'That\'s why we use a \'Moderator\' like water to slow you down.',
    neutron: 'I\'m born fast—too fast! I need to be slowed down to \'thermal\' speeds to hit you again.',
    levelTitle: 'Moderators & Speed'
  },
  // Level 5: Coolants & Heat Exchange
  {
    uranium235: 'Water isn\'t just a moderator; it also carries my heat to the turbines!',
    neutron: 'In some plants, the water is under so much pressure it doesn\'t even boil!',
    levelTitle: 'Coolants & Heat Exchange'
  },
  // Level 6: Enrichment & Isotopes
  {
    uranium235: 'I\'m rare! Only 0.7% of natural uranium is me. Most of it is my brother, U-238.',
    neutron: 'Humans use centrifuges to increase your concentration so we can work together.',
    levelTitle: 'Enrichment & Isotopes'
  },
  // Level 7: Control & Poisons
  {
    uranium235: 'Like Xenon-135. It builds up after a shutdown and makes it hard to restart.',
    neutron: 'Some atoms are \'poisons\'—they eat me up and stop the reaction!',
    levelTitle: 'Control & Poisons'
  },
  // Level 8: Radiation & Shielding
  {
    uranium235: 'I release Alpha, Beta, and Gamma rays. Gamma is the strongest!',
    neutron: 'And don\'t forget the blue glow in the water—that\'s Cherenkov Radiation!',
    levelTitle: 'Radiation & Shielding'
  },
  // Level 9: Advanced Safety
  {
    uranium235: 'Even after we stop, I still produce \'Decay Heat\' that needs cooling.',
    neutron: 'Delayed neutrons are my friends! They give humans time to control the core.',
    levelTitle: 'Advanced Safety'
  },
  // Level 10: Future Technology
  {
    uranium235: 'The future is small! SMRs can be built in factories.',
    neutron: 'And Fusion—joining atoms together—is the ultimate goal, just like the Sun!',
    levelTitle: 'Future Technology'
  }
];

export const QUESTIONS: QuizQuestion[] = [
  // ── LEVEL 1: The Basics ───────────────────────────────────────────────────
  { level: 1, host: 'neutron',    question: 'Who am I?',                                                                   options: ['Neutron', 'Proton', 'Electron', 'Atom'],                                                     correctIndex: 0 },
  { level: 1, host: 'uranium235', question: 'What is the least environmentally friendly electricity generation method?',    options: ['Nuclear power plant', 'Natural gas power plant', 'Coal-fired power plant', 'Hydro power plant'], correctIndex: 2 },
  { level: 1, host: 'neutron',    question: 'What do we call the place where the nuclear reaction takes place?',            options: ['Turbine Hall', 'Cooling tower', 'Control rods', 'Reactor Core'],                              correctIndex: 3 },
  { level: 1, host: 'uranium235', question: 'What material are the control rods in the reactor made of?',                   options: ['Aluminum', 'Boron', 'Plastic', 'Copper'],                                                    correctIndex: 1 },
  { level: 1, host: 'neutron',    question: 'What is the main equation underlying nuclear reactions?',                      options: ['F = ma', 'V = IR', 'E = mc²', 'PV = nRT'],                                                   correctIndex: 2 },

  // ── LEVEL 2: Safety & Physical Form ───────────────────────────────────────
  { level: 2, host: 'uranium235', question: 'What is the form of Uranium-235 fuel used for nuclear power?',                 options: ['Liquid uranium', 'Uranium gas', 'Uranium powder', 'Solid ceramic pellets'],                   correctIndex: 3 },
  { level: 2, host: 'neutron',    question: 'What is the main barrier preventing radiation leaks?',                         options: ['Turbine blades', 'Fuel rods', 'Containment structure', 'Generator coils'],                    correctIndex: 2 },
  { level: 2, host: 'uranium235', question: 'A uranium pellet weighing 5-10g is equivalent to how many gallons of fossil fuel?', options: ['10 gallons', '50 gallons', '120 gallons', '500 gallons'],                                correctIndex: 2 },
  { level: 2, host: 'neutron',    question: 'The containment structure is made of which materials?',                         options: ['Wood and brick', 'Steel-reinforced high-density concrete', 'Pure aluminum', 'Plastic and glass'], correctIndex: 1 },
  { level: 2, host: 'uranium235', question: 'If power fails, what causes control rods to fall into the core?',              options: ['Magnets', 'Wind', 'Gravity', 'Pumps'],                                                       correctIndex: 2 },

  // ── LEVEL 3: The Fission Process ──────────────────────────────────────────
  { level: 3, host: 'neutron',    question: 'What is the scientific name for a nucleus splitting?',                          options: ['Fusion', 'Fission', 'Ionization', 'Combustion'],                                             correctIndex: 1 },
  { level: 3, host: 'uranium235', question: 'Which element is a common product of U-235 fission along with Barium-141?',    options: ['Gold', 'Krypton-92', 'Silver', 'Oxygen'],                                                    correctIndex: 1 },
  { level: 3, host: 'neutron',    question: 'What is a self-sustaining series of fission events called?',                    options: ['Power Loop', 'Chain Reaction', 'Energy Circle', 'Atomic Wave'],                               correctIndex: 1 },
  { level: 3, host: 'uranium235', question: 'What do we call the \'missing\' mass converted into energy?',                  options: ['Mass Defect', 'Atomic Loss', 'Weight Gap', 'Proton Remnant'],                                 correctIndex: 0 },
  { level: 3, host: 'neutron',    question: 'In what form is fission energy initially released?',                            options: ['Sound', 'Kinetic Energy (Heat)', 'Electricity', 'Magnetism'],                                 correctIndex: 1 },

  // ── LEVEL 4: Moderators & Speed ───────────────────────────────────────────
  { level: 4, host: 'uranium235', question: 'What component slows down fast neutrons?',                                     options: ['Accelerator', 'Moderator', 'Insulator', 'Reflector'],                                         correctIndex: 1 },
  { level: 4, host: 'neutron',    question: 'Which of these is NOT used as a moderator?',                                   options: ['Graphite', 'Heavy Water', 'Light Water', 'Liquid Lead'],                                      correctIndex: 3 },
  { level: 4, host: 'uranium235', question: 'What is a neutron called once it is slowed down?',                             options: ['Fast Neutron', 'Thermal Neutron', 'Cold Neutron', 'Static Neutron'],                           correctIndex: 1 },
  { level: 4, host: 'neutron',    question: 'Why is Heavy Water (D₂O) an excellent moderator?',                             options: ['It is cheaper', 'It slows neutrons without absorbing them', 'It makes uranium hotter', 'It is easier to pump'], correctIndex: 1 },
  { level: 4, host: 'uranium235', question: 'Removing the moderator causes reactivity to do what?',                         options: ['Increase', 'Stay the same', 'Decrease', 'Double'],                                           correctIndex: 2 },

  // ── LEVEL 5: Coolants & Heat Exchange ─────────────────────────────────────
  { level: 5, host: 'neutron',    question: 'What is the primary job of a coolant?',                                        options: ['Feed neutrons', 'Transfer heat to the turbine', 'Clean the core', 'Store fuel'],               correctIndex: 1 },
  { level: 5, host: 'uranium235', question: 'How many water loops are in a Pressurized Water Reactor (PWR)?',               options: ['One', 'Two', 'Three', 'Four'],                                                               correctIndex: 1 },
  { level: 5, host: 'neutron',    question: 'In which reactor does steam come directly from the core?',                      options: ['PWR', 'BWR (Boiling Water Reactor)', 'HTGR', 'CANDU'],                                        correctIndex: 1 },
  { level: 5, host: 'uranium235', question: 'What is a danger of using Liquid Sodium as a coolant?',                        options: ['It is too cold', 'It reacts violently with air or water', 'It is a gas', 'It blocks neutrons'], correctIndex: 1 },
  { level: 5, host: 'neutron',    question: 'What is the function of a cooling tower?',                                     options: ['Vent radiation', 'Cool the condenser water', 'Create rain', 'Store waste'],                    correctIndex: 1 },

  // ── LEVEL 6: Enrichment & Isotopes ────────────────────────────────────────
  { level: 6, host: 'uranium235', question: 'What is the % of U-235 in natural uranium?',                                   options: ['0.7%', '5%', '20%', '99%'],                                                                  correctIndex: 0 },
  { level: 6, host: 'neutron',    question: 'Commercial fuel usually has what enrichment level?',                            options: ['0.7%', '3% - 5%', '20%', '90%'],                                                             correctIndex: 1 },
  { level: 6, host: 'uranium235', question: 'What device enriches uranium by spinning it?',                                 options: ['Turbine', 'Gas Centrifuge', 'Generator', 'Piston'],                                           correctIndex: 1 },
  { level: 6, host: 'neutron',    question: 'What is a \'fertile\' material like U-238?',                                   options: ['Explosive material', 'Material that can become fissile fuel', 'Material that stops radiation', 'Liquid fuel'], correctIndex: 1 },
  { level: 6, host: 'uranium235', question: 'What gas is used during enrichment?',                                          options: ['Uranium Oxide', 'Uranium Hexafluoride (UF₆)', 'Uranium Nitrate', 'Uranium Carbide'],           correctIndex: 1 },

  // ── LEVEL 7: Control & Poisons ────────────────────────────────────────────
  { level: 7, host: 'neutron',    question: 'Which fission product is a \'nuclear poison\'?',                               options: ['Xenon-135', 'Oxygen-16', 'Iron-56', 'Lead-208'],                                              correctIndex: 0 },
  { level: 7, host: 'uranium235', question: 'Why is Xenon-135 a poison?',                                                   options: ['It is toxic to humans', 'It absorbs neutrons very easily', 'It freezes the water', 'It melts the fuel'], correctIndex: 1 },
  { level: 7, host: 'neutron',    question: 'What is added to PWR water for chemical control?',                             options: ['Salt', 'Boric Acid', 'Sugar', 'Vinegar'],                                                     correctIndex: 1 },
  { level: 7, host: 'uranium235', question: 'What do \'burnable poisons\' help maintain?',                                  options: ['Fuel color', 'Uniform power distribution', 'Water temperature', 'Turbine speed'],              correctIndex: 1 },
  { level: 7, host: 'neutron',    question: 'A \'Negative Void Coefficient\' means if bubbles form, reactivity does what?', options: ['Increases', 'Decreases', 'Stops', 'Explodes'],                                                correctIndex: 1 },

  // ── LEVEL 8: Radiation & Shielding ────────────────────────────────────────
  { level: 8, host: 'uranium235', question: 'Which radiation is the most penetrating?',                                     options: ['Alpha', 'Beta', 'Gamma', 'X-ray'],                                                           correctIndex: 2 },
  { level: 8, host: 'neutron',    question: 'Why is Alpha radiation dangerous if swallowed?',                                options: ['It is heavy', 'It has high ionizing power', 'It is magnetic', 'It is hot'],                    correctIndex: 1 },
  { level: 8, host: 'uranium235', question: 'What causes the blue glow in reactor pools?',                                  options: ['LED lights', 'Cherenkov Radiation', 'Bioluminescence', 'Reflected sky'],                       correctIndex: 1 },
  { level: 8, host: 'neutron',    question: 'What thickness of material reduces radiation by half?',                         options: ['Quarter-Value Layer', 'Half-Value Layer (HVL)', 'Full-Block Layer', 'Lead Shield'],             correctIndex: 1 },
  { level: 8, host: 'uranium235', question: 'What SI unit measures biological radiation effect?',                            options: ['Becquerel', 'Gray', 'Sievert (Sv)', 'Curie'],                                                 correctIndex: 2 },

  // ── LEVEL 9: Advanced Safety ──────────────────────────────────────────────
  { level: 9, host: 'neutron',    question: 'What % of neutrons are \'delayed\'?',                                          options: ['Less than 1%', '10%', '25%', '50%'],                                                          correctIndex: 0 },
  { level: 9, host: 'uranium235', question: 'What is a \'SCRAM\'?',                                                         options: ['A fuel leak', 'A cooling failure', 'Emergency reactor shutdown', 'Power increase'],             correctIndex: 2 },
  { level: 9, host: 'neutron',    question: 'What causes heat after a shutdown?',                                            options: ['Friction', 'Decay of fission products', 'Sunlight', 'Chemical fires'],                        correctIndex: 1 },
  { level: 9, host: 'uranium235', question: 'Passive safety systems use what to work?',                                     options: ['Batteries', 'Natural laws (gravity/convection)', 'Computers', 'Manual levers'],                correctIndex: 1 },
  { level: 9, host: 'neutron',    question: 'What gas must be managed in a severe accident?',                                options: ['Helium', 'Neon', 'Hydrogen', 'Nitrogen'],                                                     correctIndex: 2 },

  // ── LEVEL 10: Future Technology ───────────────────────────────────────────
  { level: 10, host: 'uranium235', question: 'A Small Modular Reactor (SMR) has an output of less than...?',                 options: ['50 MWe', '300 MWe', '1000 MWe', '2000 MWe'],                                                  correctIndex: 1 },
  { level: 10, host: 'neutron',    question: 'What does a \'Breeder Reactor\' create?',                                      options: ['More heat', 'More fuel than it consumes', 'More waste', 'More water'],                         correctIndex: 1 },
  { level: 10, host: 'uranium235', question: 'Thorium-232 converts into which fissile isotope?',                             options: ['Uranium-233', 'Uranium-235', 'Plutonium-239', 'Carbon-14'],                                   correctIndex: 0 },
  { level: 10, host: 'neutron',    question: 'What is the main challenge for Fusion?',                                       options: ['Lack of fuel', 'Sustaining extreme heat and pressure', 'Too much radiation', 'It is too slow'], correctIndex: 1 },
  { level: 10, host: 'uranium235', question: 'The \'Energy Trilemma\' balances Security, Sustainability, and...?',           options: ['Color', 'Equity (Affordability)', 'Speed', 'Volume'],                                         correctIndex: 1 },
];
