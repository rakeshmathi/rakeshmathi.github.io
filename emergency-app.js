'use strict';

// ===== UTILITIES =====
function $(id) { return document.getElementById(id); }

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== PROFILE STEPS =====
const PROFILE_STEPS = [
  {
    key: 'living',
    question: 'Where do you live?',
    hint: 'Select one.',
    multi: false,
    choices: [
      { id: 'apartment', icon: '🏢', label: 'Apartment / Condo', desc: 'Multi-story building, shared exits' },
      { id: 'suburban',  icon: '🏡', label: 'Suburban House',    desc: 'Residential neighbourhood' },
      { id: 'rural',     icon: '🌾', label: 'Rural / Farmland',  desc: 'Remote, longer response times' },
      { id: 'mobile',    icon: '🚐', label: 'Mobile / RV',       desc: 'Mobile home or vehicle dwelling' },
    ],
  },
  {
    key: 'region',
    question: 'What hazards are common in your area?',
    hint: 'Select all that apply.',
    multi: true,
    choices: [
      { id: 'flood',     icon: '🌊', label: 'Flooding / Coastal', desc: 'Storm surge, flash floods' },
      { id: 'quake',     icon: '🫨', label: 'Earthquake Zone',    desc: 'Seismic activity area' },
      { id: 'tornado',   icon: '🌪️', label: 'Tornado / Hurricane', desc: 'Severe wind events' },
      { id: 'wildfire',  icon: '🔥', label: 'Wildfire Risk',      desc: 'Wildland-urban interface' },
      { id: 'winter',    icon: '❄️', label: 'Severe Winter',      desc: 'Blizzards, ice storms' },
      { id: 'none',      icon: '🏙️', label: 'None of the above',  desc: 'General urban hazards only' },
    ],
  },
  {
    key: 'household',
    question: 'Who lives in your household?',
    hint: 'Select all that apply.',
    multi: true,
    choices: [
      { id: 'solo',     icon: '🧍', label: 'Just me',           desc: 'Living alone' },
      { id: 'couple',   icon: '👫', label: 'Partner / Spouse',  desc: '2 adults' },
      { id: 'kids',     icon: '👶', label: 'Children',          desc: 'Under 18 in household' },
      { id: 'elderly',  icon: '🧓', label: 'Elderly members',   desc: 'Mobility or medical needs' },
      { id: 'pets',     icon: '🐕', label: 'Pets',              desc: 'Dogs, cats, or other animals' },
      { id: 'medical',  icon: '💊', label: 'Medical dependency', desc: 'Equipment or regular medication' },
    ],
  },
  {
    key: 'devices',
    question: 'What equipment or hazards are in your home?',
    hint: 'Select all that apply.',
    multi: true,
    choices: [
      { id: 'gas',       icon: '🔵', label: 'Gas appliances',   desc: 'Stove, oven, or gas heat' },
      { id: 'propane',   icon: '🛢️', label: 'Propane / tanks',  desc: 'BBQ, heater, external tanks' },
      { id: 'ev',        icon: '⚡', label: 'Electric vehicle',  desc: 'EV or e-bike with home charger' },
      { id: 'generator', icon: '🔋', label: 'Generator',        desc: 'Backup power generator' },
      { id: 'workshop',  icon: '🔧', label: 'Workshop / garage', desc: 'Chemicals, power tools, solvents' },
      { id: 'none_dev',  icon: '🏠', label: 'None of the above', desc: 'Standard household items only' },
    ],
  },
  {
    key: 'work',
    question: 'Where do you spend most of your working hours?',
    hint: 'Select one.',
    multi: false,
    choices: [
      { id: 'home_work',    icon: '💻', label: 'Work from home',     desc: 'Mostly indoors at home' },
      { id: 'office',       icon: '🏢', label: 'Office building',    desc: 'Multi-floor, elevator, shared exits' },
      { id: 'outdoor',      icon: '🦺', label: 'Outdoors / site',    desc: 'Construction, field, or outdoor work' },
      { id: 'healthcare',   icon: '🏥', label: 'Healthcare / school', desc: 'Hospital, clinic, or school' },
      { id: 'retail',       icon: '🏪', label: 'Retail / public',    desc: 'Shop, restaurant, public space' },
    ],
  },
];

// ===== PROFILE STATE =====
let profile   = {};  // built up across steps
let stepIndex = 0;
let selections = {};  // stepKey → Set of selected ids

function loadSavedProfile() {
  try { return JSON.parse(localStorage.getItem('ep_profile') || 'null'); } catch { return null; }
}

function saveProfile(p) {
  localStorage.setItem('ep_profile', JSON.stringify(p));
}

// ===== PLAN GENERATION =====
function buildPlan(p) {
  const scenarios = [];

  // Always included
  scenarios.push(makeScenario('fire', p));
  scenarios.push(makeScenario('power', p));
  scenarios.push(makeScenario('medical', p));

  // Location-based
  if (hasAny(p.region, ['flood'])) scenarios.push(makeScenario('flood', p));
  if (hasAny(p.region, ['quake'])) scenarios.push(makeScenario('quake', p));
  if (hasAny(p.region, ['tornado'])) scenarios.push(makeScenario('tornado', p));
  if (hasAny(p.region, ['wildfire'])) scenarios.push(makeScenario('wildfire', p));
  if (hasAny(p.region, ['winter'])) scenarios.push(makeScenario('winter', p));

  // Device-based
  if (hasAny(p.devices, ['gas', 'propane'])) scenarios.push(makeScenario('gasleak', p));

  return scenarios;
}

function hasAny(arr, ids) {
  if (!Array.isArray(arr)) return false;
  return ids.some(id => arr.includes(id));
}

function makeScenario(type, p) {
  const hasPets    = hasAny(p.household, ['pets']);
  const hasKids    = hasAny(p.household, ['kids']);
  const hasElderly = hasAny(p.household, ['elderly']);
  const hasMedical = hasAny(p.household, ['medical']);
  const isApt      = p.living === 'apartment';
  const isRural    = p.living === 'rural';

  const s = SCENARIO_TEMPLATES[type](p);

  // Inject household-specific notes
  if (hasPets) s.petNote = 'Include pets in your evacuation plan. Keep a pet carrier, food, and medical records in your go-bag.';
  if (hasKids) s.kidsNote = 'Assign each child an emergency buddy. Practise your meeting point with children regularly.';
  if (hasElderly) s.elderlyNote = 'Allow extra evacuation time. Keep a written list of medications and doctor contacts ready to grab.';
  if (hasMedical) s.medicalNote = 'Keep medical devices charged. Know your nearest hospital with backup power. Have 72-hour medication supply ready.';
  if (isApt) s.aptNote = 'Know your building\'s emergency exits. Never use lifts during evacuation. Identify your stairwell.';
  if (isRural) s.ruralNote = 'Emergency response times may be longer in your area. Keep extra supplies for 7 days.';

  return s;
}

// ===== SCENARIO TEMPLATES =====
const SCENARIO_TEMPLATES = {
  fire: (p) => ({
    id: 'fire',
    title: 'House Fire',
    icon: '🔥',
    risk: 'critical',
    riskLabel: 'Critical Risk',
    desc: 'A fire breaks out in your home.',
    phases: [
      {
        title: 'Alert Signs',
        type: 'alert',
        actions: ['Smoke alarm sounds', 'Smell of burning or visible smoke', 'Unusual crackling sounds'],
      },
      {
        title: 'Immediate (0 – 60 seconds)',
        type: 'immediate',
        actions: [
          'Yell "FIRE!" to alert everyone in the building',
          'Feel doors with the back of your hand before opening — if hot, do NOT open',
          'Stay low to the ground to avoid smoke inhalation',
          'Take your phone only if within reach — do NOT delay to collect belongings',
        ],
      },
      {
        title: 'Evacuate',
        type: 'evacuate',
        actions: [
          p.living === 'apartment'
            ? 'Use the stairwell — never use the lift. Close fire doors behind you.'
            : 'Exit via your pre-planned route. Close doors behind you to slow fire spread.',
          'Meet at your agreed outdoor meeting point (set one now if you haven\'t)',
          'Call 911 once outside — never re-enter',
          ...(hasAny(p.household, ['pets']) ? ['Evacuate pets only if safe to do so — do NOT risk re-entry for pets'] : []),
        ],
      },
      {
        title: 'Once Safe',
        type: 'after',
        actions: [
          'Account for everyone at the meeting point',
          'Stay out of the building until fire service clears it',
          'Contact your insurance company and document damage with photos',
          'Find temporary shelter — Red Cross, local shelters, or family',
        ],
      },
    ],
    drill: {
      stages: [
        {
          situation: 'It\'s 2am. Your smoke alarm goes off. You wake up disoriented.',
          prompt: 'What is your FIRST action?',
          options: [
            { text: 'Get up and look for the source of smoke to confirm it\'s real', correct: false, feedback: 'Don\'t investigate — treat every alarm as real. Precious seconds lost.' },
            { text: 'Yell to wake others, grab your phone, and start moving toward the exit', correct: true, feedback: 'Correct — alert others immediately and get moving. Every second counts.' },
            { text: 'Call 911 first, then wake others', correct: false, feedback: 'Wake others first — then call 911 once everyone is moving or outside.' },
            { text: 'Open the bedroom door to check the hallway', correct: false, feedback: 'Always feel the door first with the back of your hand. A hot door means fire is on the other side.' },
          ],
        },
        {
          situation: 'You felt the door — it\'s warm. The hallway may be on fire.',
          prompt: 'The door is warm. What do you do?',
          options: [
            { text: 'Open it slowly and peek through', correct: false, feedback: 'Do NOT open a warm door — it may cause a flashover. Find an alternate exit.' },
            { text: 'Seal the door gap with clothing, signal from your window, call 911', correct: true, feedback: 'Correct — seal gaps to slow smoke, signal your location, and wait for rescue.' },
            { text: 'Jump from the window immediately', correct: false, feedback: 'Signal first and wait for rescue. Only jump as a last resort if you\'re on a low floor.' },
            { text: 'Go back to sleep — the alarm is probably faulty', correct: false, feedback: 'Never ignore a warm door or alarm. Treat it as a life-threatening emergency.' },
          ],
        },
        {
          situation: 'You made it outside. You account for housemates but can\'t see your pet.',
          prompt: 'Your pet is still inside. What do you do?',
          options: [
            { text: 'Re-enter the building immediately to find the pet', correct: false, feedback: 'Never re-enter a burning building. Your life is not worth exchanging for a pet.' },
            { text: 'Tell fire fighters about the pet when they arrive', correct: true, feedback: 'Correct — inform fire fighters. They have breathing equipment and training for this.' },
            { text: 'Wait near the entrance and call the pet\'s name', correct: false, feedback: 'Stay clear of the building. Smoke and flames can spread rapidly to exits.' },
          ],
        },
      ],
    },
  }),

  power: (p) => ({
    id: 'power',
    title: 'Extended Power Outage',
    icon: '⚡',
    risk: 'high',
    riskLabel: 'High Risk',
    desc: 'Power is out and may be down for days.',
    phases: [
      {
        title: 'Alert Signs',
        type: 'alert',
        actions: ['Lights go out suddenly', 'No response from circuit breaker reset', 'Outage covers wider neighbourhood'],
      },
      {
        title: 'Immediate (first 30 minutes)',
        type: 'immediate',
        actions: [
          'Check circuit breakers — if tripped, reset them',
          'Call utility provider outage line to report and get ETA',
          'Unplug sensitive electronics to protect from power surge on restoration',
          ...(hasAny(p.household, ['medical']) ? ['Check backup power for medical devices — activate generator or battery backup'] : []),
          ...(hasAny(p.devices, ['generator']) ? ['If using a generator, ONLY operate it outdoors — NEVER inside or in garage (CO poisoning risk)'] : []),
        ],
      },
      {
        title: 'Sustain & Shelter',
        type: 'evacuate',
        actions: [
          'Use torches/candles cautiously — candles are a fire risk, use holders',
          'Keep refrigerator/freezer closed — food safe for 4hrs (fridge) / 48hrs (full freezer)',
          'Use mobile data sparingly; charge devices in car if needed',
          isRural(p) ? 'If on a well pump, water will not run — use stored water' : 'Tap water typically remains available during power outages',
        ],
      },
      {
        title: 'Extended Outage (>24hrs)',
        type: 'after',
        actions: [
          'Move to a heated/cooled location if weather is extreme',
          'Discard refrigerated food after 4 hours without power',
          'Check on elderly neighbours and vulnerable people nearby',
          'Monitor utility updates via battery-powered or car radio',
        ],
      },
    ],
    drill: {
      stages: [
        {
          situation: 'It\'s a hot summer evening. The power goes out. Your fridge and AC stop.',
          prompt: 'What is your FIRST priority?',
          options: [
            { text: 'Open the fridge to check if food has spoiled', correct: false, feedback: 'Keep the fridge closed — opening it speeds up warming. Food is safe for ~4 hours.' },
            { text: 'Check breakers, call utility, and keep fridge closed', correct: true, feedback: 'Correct — diagnose the outage and preserve food by keeping the fridge closed.' },
            { text: 'Go to a neighbour\'s house immediately', correct: false, feedback: 'No need to leave yet. Check your own situation first before deciding to relocate.' },
          ],
        },
        {
          situation: 'You have a petrol generator in your garage. The outage is now 6 hours old.',
          prompt: 'Where should you run the generator?',
          options: [
            { text: 'Inside the garage with the door open for ventilation', correct: false, feedback: 'Dangerous — CO can still accumulate with the door open. Garage is never safe.' },
            { text: 'Outside, at least 20 feet from all windows and doors', correct: true, feedback: 'Correct — generators must be run outdoors, well clear of any openings to the home.' },
            { text: 'In the kitchen with the window open', correct: false, feedback: 'Carbon monoxide is odourless and kills quickly. Never run generators indoors.' },
          ],
        },
      ],
    },
  }),

  medical: (p) => ({
    id: 'medical',
    title: 'Medical Emergency',
    icon: '🚑',
    risk: 'critical',
    riskLabel: 'Critical Risk',
    desc: 'A household member has a serious medical event.',
    phases: [
      {
        title: 'Alert Signs',
        type: 'alert',
        actions: [
          'Unresponsiveness or difficulty waking someone',
          'Chest pain, pressure, or shortness of breath',
          'Slurred speech, facial drooping, arm weakness (stroke signs)',
          'Severe allergic reaction (throat swelling, hives, difficulty breathing)',
          'Uncontrolled bleeding or broken bones',
        ],
      },
      {
        title: 'Immediate (0 – 60 seconds)',
        type: 'immediate',
        actions: [
          'Call 911 immediately — state your address clearly',
          'Do NOT leave the person alone',
          'If unconscious and not breathing: begin CPR (30 chest compressions, 2 breaths)',
          'If severe bleeding: apply firm pressure with cloth — do NOT remove cloth',
          'If suspected stroke: note the time symptoms started — vital for treatment',
        ],
      },
      {
        title: 'Assist Emergency Services',
        type: 'evacuate',
        actions: [
          'Unlock your front door so paramedics can enter',
          'Send someone outside to flag down the ambulance',
          'Gather medications list and known allergies for paramedics',
          ...(hasAny(p.household, ['medical']) ? ['Bring medical device documentation for paramedics (CPAP, insulin pump, etc.)'] : []),
        ],
      },
      {
        title: 'After the Event',
        type: 'after',
        actions: [
          'Get a written copy of paramedic and hospital records',
          'Notify family members and employer as needed',
          'Review your emergency contact list — ensure it is up to date',
          'Consider First Aid / CPR training for all household members',
        ],
      },
    ],
    drill: {
      stages: [
        {
          situation: 'A family member collapses in the kitchen. They are unresponsive and not breathing normally.',
          prompt: 'What do you do FIRST?',
          options: [
            { text: 'Call 911, then begin CPR immediately', correct: true, feedback: 'Correct — call 911 (or have someone else call while you start CPR). Every minute without CPR reduces survival by 10%.' },
            { text: 'Drive them to the hospital yourself', correct: false, feedback: 'Don\'t drive — EMS can begin treatment en route. Driving yourself delays care and is dangerous.' },
            { text: 'Wait a few minutes to see if they recover', correct: false, feedback: 'Time is critical. Brain damage begins within 4 minutes without oxygen.' },
          ],
        },
        {
          situation: 'On the phone with 911. The dispatcher asks for your address.',
          prompt: 'What information should you give?',
          options: [
            { text: 'Full street address, apartment number if applicable, and your phone number', correct: true, feedback: 'Correct — give your complete address including unit number so responders find you instantly.' },
            { text: 'Just the street name', correct: false, feedback: 'Not enough — dispatchers need the full address to navigate quickly.' },
            { text: 'Your neighbourhood name', correct: false, feedback: 'Too vague — always give the exact street number and street name.' },
          ],
        },
      ],
    },
  }),

  gasleak: (p) => ({
    id: 'gasleak',
    title: 'Gas Leak',
    icon: '💨',
    risk: 'critical',
    riskLabel: 'Critical Risk',
    desc: 'You smell gas or suspect a leak.',
    phases: [
      {
        title: 'Alert Signs',
        type: 'alert',
        actions: ['Rotten egg / sulphur smell indoors', 'Hissing sound near gas line or appliance', 'Dead vegetation patch over buried gas line', 'Dizziness, headaches, or nausea indoors'],
      },
      {
        title: 'Immediate (0 – 30 seconds)',
        type: 'immediate',
        actions: [
          'Do NOT turn any switches on or off — electrical sparks ignite gas',
          'Do NOT use your phone inside the building',
          'Leave all doors and windows open as you exit — do NOT stop to close them',
          'Get everyone out immediately',
        ],
      },
      {
        title: 'Once Outside',
        type: 'evacuate',
        actions: [
          'Move at least 300 feet upwind from the building',
          'Call your gas utility emergency line or 911 from a safe distance',
          'Do NOT re-enter for any reason',
          'Warn neighbours to evacuate',
        ],
      },
      {
        title: 'After the All-Clear',
        type: 'after',
        actions: [
          'Only return when utility technician gives all-clear',
          'Have all gas appliances inspected before reuse',
          'Install a gas detector if you don\'t have one',
          'Know where your gas shutoff valve is and how to operate it',
        ],
      },
    ],
    drill: {
      stages: [
        {
          situation: 'You walk into the kitchen and smell a strong rotten-egg odour. The gas stove is off.',
          prompt: 'What is your FIRST action?',
          options: [
            { text: 'Open a window to ventilate, then call the gas company', correct: false, feedback: 'Do NOT use phone switches or open windows by operating electrical switches. Leave immediately.' },
            { text: 'Turn on the kitchen fan to clear the air', correct: false, feedback: 'Do NOT operate any switches. Any spark can ignite the gas.' },
            { text: 'Don\'t touch any switches — get everyone out immediately, call once outside', correct: true, feedback: 'Correct — no switches, no phone calls inside. Get out and call from a safe distance.' },
          ],
        },
        {
          situation: 'You\'re outside. You need to call for help.',
          prompt: 'Who do you call first?',
          options: [
            { text: 'Gas utility emergency line, or 911 if you don\'t know the number', correct: true, feedback: 'Correct — gas utility can dispatch a technician and advise on the shutoff.' },
            { text: 'A neighbour to help investigate', correct: false, feedback: 'Don\'t send anyone back inside. Call professionals.' },
            { text: 'Your landlord', correct: false, feedback: 'A landlord can\'t respond to a live gas emergency. Call emergency services immediately.' },
          ],
        },
      ],
    },
  }),

  flood: (p) => ({
    id: 'flood',
    title: 'Flood / Storm Surge',
    icon: '🌊',
    risk: 'high',
    riskLabel: 'High Risk',
    desc: 'Heavy rainfall, storm surge, or flash flood threatens your area.',
    phases: [
      { title: 'Alert Signs', type: 'alert', actions: ['Flood watch or warning issued for your area', 'Rapidly rising water in street or yard', 'Storm drains backing up', 'Continuous heavy rain for several hours'] },
      {
        title: 'Immediate Actions',
        type: 'immediate',
        actions: [
          'Move to higher floors if water is entering your home',
          'Turn off electricity at the breaker if flooding is imminent',
          'Disconnect appliances and move valuables to upper floors',
          ...(hasAny(p.devices, ['ev']) ? ['Move your EV — do NOT drive or charge an EV through floodwater'] : []),
          'Fill bathtubs and containers with clean water in case supply is cut',
        ],
      },
      {
        title: 'Evacuate if Ordered',
        type: 'evacuate',
        actions: [
          'Follow official evacuation routes — do NOT take shortcuts through flooded roads',
          '6 inches of moving water can knock a person down; 12 inches can carry a car',
          'Take your go-bag, medications, documents, and phone charger',
          ...(hasAny(p.household, ['pets']) ? ['Crate pets and bring them — most shelters accept registered service animals; call ahead for pets'] : []),
          'Do NOT return home until officials declare it safe',
        ],
      },
      { title: 'After the Flood', type: 'after', actions: ['Document all damage before cleaning', 'Floodwater is contaminated — wear rubber boots and gloves when re-entering', 'Check for structural damage before going inside', 'Contact your insurance company immediately'] },
    ],
    drill: {
      stages: [
        {
          situation: 'A flood warning is issued. Water is starting to rise in your street.',
          prompt: 'What should you do with electricity?',
          options: [
            { text: 'Leave electricity on — you might need the lights', correct: false, feedback: 'Water and electricity are deadly together. Turn off at the breaker before water enters.' },
            { text: 'Turn off electricity at the main breaker before water enters your home', correct: true, feedback: 'Correct — cutting power prevents electrocution if floodwater enters.' },
            { text: 'Turn off only the ground floor lights', correct: false, feedback: 'Partial measures aren\'t enough — cut power at the main breaker.' },
          ],
        },
      ],
    },
  }),

  quake: (p) => ({
    id: 'quake',
    title: 'Earthquake',
    icon: '🫨',
    risk: 'high',
    riskLabel: 'High Risk',
    desc: 'A significant earthquake strikes.',
    phases: [
      { title: 'During the Shaking', type: 'alert', actions: ['DROP to hands and knees immediately', 'COVER your head and neck with your arms; get under a sturdy desk if nearby', 'HOLD ON and stay in place until shaking stops — most injuries occur from moving'] },
      {
        title: 'Immediately After',
        type: 'immediate',
        actions: [
          'Expect aftershocks — be ready to drop and cover again',
          'Check yourself and others for injuries',
          'Put on shoes before moving — broken glass everywhere',
          ...(hasAny(p.devices, ['gas']) ? ['Smell for gas — if detected, follow gas leak procedure immediately'] : []),
          'Check for structural damage before moving through doorways',
        ],
      },
      {
        title: 'Evacuate if Unsafe',
        type: 'evacuate',
        actions: [
          'If building is structurally damaged, evacuate carefully',
          'Use stairs only — lifts may be damaged',
          'Move away from damaged structures and downed power lines',
          'Go to your designated outdoor meeting point',
        ],
      },
      { title: 'Recovery', type: 'after', actions: ['Listen to emergency broadcasts for official guidance', 'Do not use the phone unless life-threatening — keep lines clear', 'Document damage for insurance', 'Inspect utilities (gas, water, electrical) before restoring'] },
    ],
    drill: {
      stages: [
        {
          situation: 'You\'re at your desk and the room starts shaking violently.',
          prompt: 'What is the correct response — DROP, COVER, HOLD ON?',
          options: [
            { text: 'Run outside immediately', correct: false, feedback: 'Running during shaking is dangerous — debris falls and you may be knocked down. Stay inside and cover.' },
            { text: 'Drop to the floor, cover your head, hold on until shaking stops', correct: true, feedback: 'Correct — DROP, COVER, HOLD ON is the internationally recommended response.' },
            { text: 'Stand in a doorway', correct: false, feedback: 'Doorway myth — modern buildings are not stronger at doorways. Get under a desk instead.' },
          ],
        },
      ],
    },
  }),

  tornado: (p) => ({
    id: 'tornado',
    title: 'Tornado / Severe Storm',
    icon: '🌪️',
    risk: 'high',
    riskLabel: 'High Risk',
    desc: 'A tornado warning or severe storm threatens your area.',
    phases: [
      { title: 'Alert Signs', type: 'alert', actions: ['Tornado warning issued (not just watch)', 'Rotating, funnel-shaped cloud visible', 'Loud roaring sound like a freight train', 'Hail preceding a storm'] },
      {
        title: 'Shelter Immediately',
        type: 'immediate',
        actions: [
          p.living === 'apartment' ? 'Go to the lowest floor, interior room — hallway or bathroom; away from windows' : 'Go to your basement or lowest floor, interior room away from windows',
          'Mobile homes offer NO protection — evacuate to a sturdy building',
          'Protect your head and neck with your arms',
          'Do NOT try to outrun a tornado in a car unless it is far away and you can drive perpendicular to its path',
        ],
      },
      { title: 'During the Storm', type: 'evacuate', actions: ['Stay in shelter until the warning is lifted — tornadoes can shift direction', 'Keep a battery radio for updates', 'Do not open windows (myth — it wastes critical time)'] },
      { title: 'After the Storm', type: 'after', actions: ['Watch for downed power lines', 'Report gas leaks and structural damage', 'Do not enter damaged buildings', 'Help neighbours who may be trapped'] },
    ],
    drill: {
      stages: [
        {
          situation: 'A tornado warning is issued. You\'re in a single-story house with no basement.',
          prompt: 'Where is the safest place to shelter?',
          options: [
            { text: 'Near a window to watch the storm', correct: false, feedback: 'Windows are extremely dangerous — flying glass is deadly in a tornado.' },
            { text: 'Interior bathroom or hallway on the lowest floor, away from windows', correct: true, feedback: 'Correct — interior rooms with no windows give the most protection from debris.' },
            { text: 'Under a highway overpass', correct: false, feedback: 'Overpasses funnel wind and are more dangerous than open ground. Never shelter there.' },
          ],
        },
      ],
    },
  }),

  wildfire: (p) => ({
    id: 'wildfire',
    title: 'Wildfire Evacuation',
    icon: '🌲🔥',
    risk: 'high',
    riskLabel: 'High Risk',
    desc: 'A wildfire threatens your area and evacuation may be ordered.',
    phases: [
      { title: 'Alert Signs', type: 'alert', actions: ['Evacuation watch or warning issued for your zone', 'Visible smoke or red glow on horizon', 'Heavy smoke smell with falling ash', 'Animals fleeing the area'] },
      {
        title: 'When Watch is Issued (Pre-Evacuate)',
        type: 'immediate',
        actions: [
          'Pack your go-bag now — do not wait for an order',
          'Move patio furniture and flammable items indoors',
          'Close all vents, windows, and doors (use wet towels on gaps if smoke is present)',
          'Fill sinks and tubs with water for firefighters if they need your home',
          ...(hasAny(p.devices, ['propane']) ? ['Move propane tanks away from the home if safe to do so'] : []),
        ],
      },
      {
        title: 'Evacuate Immediately When Ordered',
        type: 'evacuate',
        actions: [
          'Leave immediately when evacuation order is given — do NOT wait',
          'Take your go-bag, medications, documents, and phone charger',
          'Use the designated evacuation route — do NOT improvise',
          ...(isRural(p) ? ['Know at least two alternate routes — fires can block roads quickly'] : []),
          ...(hasAny(p.household, ['pets']) ? ['Evacuate pets — keep carriers and leashes near the door'] : []),
          'Close all doors as you leave — slows fire spread through the home',
        ],
      },
      { title: 'After the Fire', type: 'after', actions: ['Do not return until officially cleared — air quality and structural hazards', 'Wear N95 masks when re-entering — ash contains toxic particles', 'Document all damage before cleanup', 'Report spot fires to fire services immediately'] },
    ],
    drill: {
      stages: [
        {
          situation: 'An evacuation WARNING (not yet an order) is issued for your area. Smoke is visible on the horizon.',
          prompt: 'Should you wait for the official order, or leave now?',
          options: [
            { text: 'Wait for the official evacuation ORDER before leaving', correct: false, feedback: 'Waiting for the order risks being cut off by fire. Leave during a warning while roads are clear.' },
            { text: 'Leave now while roads are clear and you have time to pack properly', correct: true, feedback: 'Correct — early voluntary evacuation is almost always safer. Roads clog quickly when orders are issued.' },
            { text: 'Shelter in place and defend your home', correct: false, feedback: 'Only trained fire professionals should defend structures. Civilians should evacuate.' },
          ],
        },
      ],
    },
  }),

  winter: (p) => ({
    id: 'winter',
    title: 'Severe Winter Storm',
    icon: '❄️',
    risk: 'medium',
    riskLabel: 'Medium Risk',
    desc: 'A major blizzard or ice storm traps you at home.',
    phases: [
      { title: 'Alert Signs', type: 'alert', actions: ['Blizzard warning issued', 'Heavy snowfall reducing visibility to near zero', 'Ice storm or freezing rain forecast', 'Temperatures dropping to dangerous extremes'] },
      {
        title: 'Before the Storm',
        type: 'immediate',
        actions: [
          'Stock 3-7 days of food and water (pipes may freeze)',
          'Charge all devices and portable batteries',
          'Fill your car with petrol — pumps may lose power',
          ...(hasAny(p.devices, ['generator']) ? ['Test your generator and stock fuel — remember outdoor-only use'] : []),
          'Identify your home\'s pipe shutoff in case pipes burst',
        ],
      },
      { title: 'During the Storm', type: 'evacuate', actions: ['Stay indoors — do not travel unless emergency', 'Keep interior temperature above 55°F / 13°C to prevent pipe freeze', 'Run cold water to a trickle in vulnerable pipes during severe cold', 'Watch for signs of hypothermia (shivering, confusion, slurred speech) in housemates'] },
      {
        title: 'After the Storm',
        type: 'after',
        actions: [
          'Dress in layers before going outside — exertion + cold = cardiac risk',
          'Clear snow from roof edges to prevent ice dams and collapse',
          'Check on elderly neighbours',
          ...(isRural(p) ? ['Keep emergency supplies in your car when travelling — you may get stranded'] : []),
        ],
      },
    ],
    drill: {
      stages: [
        {
          situation: 'A blizzard has knocked out power. It\'s -10°C outside and the house is cooling down.',
          prompt: 'What is your heating priority?',
          options: [
            { text: 'Use your gas oven as a heat source', correct: false, feedback: 'Never use an oven for heating — carbon monoxide poisoning risk.' },
            { text: 'Consolidate everyone into one small interior room, use blankets, and monitor temperature', correct: true, feedback: 'Correct — a smaller space retains body heat. Layer blankets and stay hydrated.' },
            { text: 'Go outside to collect firewood', correct: false, feedback: 'In blizzard conditions, going outside is dangerous. Use your indoor supplies first.' },
          ],
        },
      ],
    },
  }),
};

function isRural(p) { return p.living === 'rural'; }

// ===== SUPPLIES =====
function buildSupplyList(p) {
  const base = [
    '3 gallons of water per person (3-day supply)',
    '3-day supply of non-perishable food',
    'Battery-powered or hand-crank radio',
    'Torches / flashlights + spare batteries',
    'First aid kit',
    'Whistle (to signal for help)',
    'Dust masks or N95 respirators',
    'Multi-purpose tool / Swiss army knife',
    'Phone charger + portable battery pack',
    'Copies of important documents (ID, insurance, prescriptions)',
    'Cash in small bills',
    'Emergency contact list (printed)',
    'Map of local area (printed)',
    'Warm clothing and sturdy shoes',
    'Blankets or sleeping bags',
  ];

  if (hasAny(p.household, ['pets']))    base.push('Pet food and water (3-day supply)', 'Pet carrier and leash', 'Pet medical records and vaccination proof');
  if (hasAny(p.household, ['kids']))    base.push('Children\'s medications and formula/food', 'Comfort items for children (small toy, book)');
  if (hasAny(p.household, ['elderly'])) base.push('Mobility aids (spare walker / cane)', 'Elderly medications list (14-day supply)');
  if (hasAny(p.household, ['medical'])) base.push('Medical device batteries / backup power', '7-day medication supply', 'Doctor and specialist contact list');
  if (hasAny(p.region, ['flood', 'wildfire'])) base.push('Waterproof document bag', 'Extra change of clothes');
  if (hasAny(p.region, ['winter']))     base.push('Hand warmers (chemical)', 'Thermal underwear / base layers', 'Ice scraper and rock salt');
  if (hasAny(p.devices, ['gas', 'propane'])) base.push('Gas leak detector (battery backup)', 'Gas shutoff wrench');
  if (hasAny(p.devices, ['generator'])) base.push('Generator fuel (sealed container, outdoors)', 'CO detector with battery backup');

  return [...new Set(base)];
}

// ===== APP CONTROLLER =====
const EP = (() => {

  let _plan       = null;
  let _currentScenario = null;
  let _drillState = null;
  let _timerInterval = null;

  // ── Init ─────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const saved = loadSavedProfile();
    if (saved) {
      $('resume-hint').style.display = 'block';
    }
  });

  function goHome() {
    stopTimer();
    showScreen('screen-intro');
    $('header-actions').style.display = 'none';
  }

  // ── Profile Wizard ───────────────────────────────────────────────
  function startProfile() {
    stepIndex  = 0;
    selections = {};
    const saved = loadSavedProfile();
    if (saved) {
      // Pre-populate selections from saved profile
      PROFILE_STEPS.forEach(step => {
        if (saved[step.key] !== undefined) {
          const val = saved[step.key];
          selections[step.key] = new Set(Array.isArray(val) ? val : [val]);
        }
      });
    }
    renderStep();
    showScreen('screen-profile');
    $('header-actions').style.display = 'none';
  }

  function renderStep() {
    const step = PROFILE_STEPS[stepIndex];
    const pct  = ((stepIndex) / PROFILE_STEPS.length * 100).toFixed(0);

    $('progress-fill').style.width = pct + '%';
    $('progress-label').textContent = `Step ${stepIndex + 1} of ${PROFILE_STEPS.length}`;
    $('profile-question').textContent = step.question;
    $('profile-hint').textContent = step.hint;
    $('btn-back').style.visibility = stepIndex === 0 ? 'hidden' : 'visible';
    $('btn-next').textContent = stepIndex === PROFILE_STEPS.length - 1 ? 'Build My Plan ✓' : 'Next →';

    const grid = $('cards-grid');
    grid.innerHTML = '';

    const sel = selections[step.key] || new Set();

    step.choices.forEach(choice => {
      const card = document.createElement('div');
      card.className = 'choice-card' + (sel.has(choice.id) ? ' selected' : '');
      card.dataset.choiceId = choice.id;
      card.innerHTML = `<span class="card-icon">${choice.icon}</span><span class="card-label">${choice.label}</span><span class="card-desc">${choice.desc}</span>`;
      card.addEventListener('click', () => toggleChoice(step, choice.id, card));
      grid.appendChild(card);
    });
  }

  function toggleChoice(step, id, card) {
    if (!selections[step.key]) selections[step.key] = new Set();
    const sel = selections[step.key];

    if (!step.multi) {
      sel.clear();
      document.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
    } else {
      // "none" options are exclusive — selecting none clears others and vice versa
      const isNoneId = id === 'none' || id === 'none_dev';
      const noneIds  = step.choices.filter(c => c.id === 'none' || c.id === 'none_dev').map(c => c.id);
      if (isNoneId) {
        // Selecting "none" clears all other selections
        sel.clear();
        document.querySelectorAll('#cards-grid .choice-card').forEach(c => c.classList.remove('selected'));
      } else {
        // Selecting a real option removes any "none" selection
        noneIds.forEach(nid => {
          if (sel.has(nid)) {
            sel.delete(nid);
            const noneCard = $('cards-grid').querySelector(`[data-choice-id="${nid}"]`);
            if (noneCard) noneCard.classList.remove('selected');
          }
        });
      }
    }

    if (sel.has(id)) {
      sel.delete(id);
      card.classList.remove('selected');
    } else {
      sel.add(id);
      card.classList.add('selected');
    }
  }

  function profileBack() {
    if (stepIndex === 0) { goHome(); return; }
    stepIndex--;
    renderStep();
  }

  function profileNext() {
    const step = PROFILE_STEPS[stepIndex];
    const sel  = selections[step.key];
    if (!sel || sel.size === 0) {
      $('profile-hint').textContent = '⚠️ Please select at least one option.';
      $('profile-hint').style.color = '#dc2626';
      return;
    }
    $('profile-hint').style.color = '';

    if (stepIndex < PROFILE_STEPS.length - 1) {
      stepIndex++;
      renderStep();
    } else {
      finishProfile();
    }
  }

  function finishProfile() {
    const p = {};
    PROFILE_STEPS.forEach(step => {
      const sel = selections[step.key] || new Set();
      p[step.key] = step.multi ? [...sel] : [...sel][0];
    });
    saveProfile(p);
    _plan = buildPlan(p);
    renderPlan(p);
  }

  // ── Plan Rendering ───────────────────────────────────────────────
  function renderPlan(p) {
    const living = PROFILE_STEPS[0].choices.find(c => c.id === p.living);
    const regionLabels = (p.region || []).filter(r => r !== 'none').map(r => {
      const c = PROFILE_STEPS[1].choices.find(x => x.id === r);
      return c ? c.label : r;
    });
    const subtitle = `${living ? living.label : ''} · ${regionLabels.length ? regionLabels.join(', ') : 'General hazards'} · ${_plan.length} scenarios`;
    $('plan-subtitle').textContent = subtitle;

    const list = $('scenarios-list');
    list.innerHTML = '';
    _plan.forEach(s => {
      const item = document.createElement('div');
      item.className = 'scenario-item';
      item.innerHTML = `
        <span class="scenario-icon">${s.icon}</span>
        <div class="scenario-info">
          <div class="scenario-title">${s.title}</div>
          <div class="scenario-desc">${s.desc}</div>
        </div>
        <div class="scenario-risk"><span class="risk-badge risk-${s.risk}">${s.riskLabel}</span></div>`;
      item.addEventListener('click', () => openScenario(s.id));
      list.appendChild(item);
    });

    // Supplies
    const supplies = buildSupplyList(p);
    const savedChecked = JSON.parse(localStorage.getItem('ep_supplies') || '{}');
    const supGrid = document.createElement('div');
    supGrid.className = 'supplies-list-grid';
    supplies.forEach((item) => {
      // Stable key derived from item text so checked state survives profile edits
      const key = 'sup_' + item.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 48);
      const done = savedChecked[key] || false;
      const div  = document.createElement('div');
      div.className = 'supply-item' + (done ? ' checked' : '');
      div.innerHTML = `<span class="supply-check">${done ? '✓' : ''}</span><span>${item}</span>`;
      div.addEventListener('click', () => {
        const isChecked = div.classList.toggle('checked');
        div.querySelector('.supply-check').textContent = isChecked ? '✓' : '';
        savedChecked[key] = isChecked;
        localStorage.setItem('ep_supplies', JSON.stringify(savedChecked));
      });
      supGrid.appendChild(div);
    });
    $('supplies-list').innerHTML = '';
    $('supplies-list').appendChild(supGrid);

    showScreen('screen-plan');
    $('header-actions').style.display = 'flex';
  }

  function showPlans() {
    stopTimer();
    const p = loadSavedProfile();
    if (!p) { startProfile(); return; }
    if (!_plan || $('scenarios-list').children.length === 0) {
      _plan = buildPlan(p);
      renderPlan(p);
      return;
    }
    showScreen('screen-plan');
    $('header-actions').style.display = 'flex';
  }

  // ── Scenario Detail ──────────────────────────────────────────────
  function openScenario(id) {
    stopTimer();
    const s = _plan.find(x => x.id === id);
    if (!s) return;
    _currentScenario = s;

    $('scenario-header').innerHTML = `
      <div class="scenario-header-icon">${s.icon}</div>
      <div>
        <div class="scenario-header-title">${s.title}</div>
        <div class="scenario-header-desc">${s.desc}</div>
        <span class="risk-badge risk-${s.risk}" style="margin-top:6px;display:inline-block">${s.riskLabel}</span>
      </div>`;

    const phaseTypeMap = { alert: '', immediate: 'phase-immediate', evacuate: 'phase-evacuate', after: 'phase-after' };
    const actionTypeMap = { alert: '', immediate: 'phase-action-warn', evacuate: 'phase-action-purple', after: 'phase-action-green' };
    const numTypeMap = { alert: '', immediate: 'warn', evacuate: 'purple', after: 'green' };

    const container = $('scenario-phases');
    container.innerHTML = '';

    s.phases.forEach(phase => {
      const block = document.createElement('div');
      block.className = 'phase-block';
      block.innerHTML = `<span class="phase-title ${phaseTypeMap[phase.type] || ''}">${phase.title}</span>`;
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'phase-actions';
      phase.actions.forEach((action, i) => {
        const a = document.createElement('div');
        a.className = `phase-action ${actionTypeMap[phase.type] || ''}`;
        a.innerHTML = `<span class="action-num ${numTypeMap[phase.type] || ''}">${i + 1}.</span><span>${action}</span>`;
        actionsDiv.appendChild(a);
      });
      block.appendChild(actionsDiv);
      container.appendChild(block);
    });

    // Household-specific notes rendered once after all phases
    ['petNote','kidsNote','elderlyNote','medicalNote','aptNote','ruralNote'].forEach(key => {
      if (s[key]) {
        const note = document.createElement('div');
        note.style.cssText = 'margin-top:8px;padding:10px 14px;background:#fff7ed;border:1px solid #fdba74;border-radius:8px;font-size:0.85rem;color:#92400e;';
        note.textContent = '💡 ' + s[key];
        container.appendChild(note);
      }
    });

    showScreen('screen-scenario');
  }

  // ── Drill Picker ─────────────────────────────────────────────────
  function startDrillPicker() {
    stopTimer();
    if (!_plan) { const p = loadSavedProfile(); if (p) { _plan = buildPlan(p); renderPlan(p); } else { startProfile(); return; } }
    const list = $('drill-picker-list');
    list.innerHTML = '';
    _plan.forEach(s => {
      const stageCount = s.drill ? s.drill.stages.length : 0;
      const item = document.createElement('div');
      item.className = 'drill-pick-item';
      item.innerHTML = `
        <span class="drill-pick-icon">${s.icon}</span>
        <div class="drill-pick-info">
          <div class="drill-pick-name">${s.title}</div>
          <div class="drill-pick-steps">${stageCount} decision stage${stageCount !== 1 ? 's' : ''}</div>
        </div>
        <span class="risk-badge risk-${s.risk}">${s.riskLabel}</span>`;
      item.addEventListener('click', () => startDrill(s.id));
      list.appendChild(item);
    });
    showScreen('screen-drill-picker');
  }

  function drillThis() {
    if (_currentScenario) startDrill(_currentScenario.id);
  }

  // ── Drill Engine ─────────────────────────────────────────────────
  function startDrill(scenarioId) {
    const s = _plan.find(x => x.id === scenarioId);
    if (!s || !s.drill) return;

    _drillState = {
      scenario: s,
      stageIndex: 0,
      startTime: Date.now(),
      stageStartTime: Date.now(),
      results: [],
    };

    $('drill-name').textContent = s.title;
    stopTimer();
    startTimer();
    renderDrillStage();
    showScreen('screen-drill');
  }

  function renderDrillStage() {
    const { scenario, stageIndex } = _drillState;
    const stages = scenario.drill.stages;
    const stage  = stages[stageIndex];

    $('drill-step-counter').textContent = `Stage ${stageIndex + 1} of ${stages.length}`;

    $('drill-situation').innerHTML = `<div class="drill-situation-label">⚠ Situation</div>${stage.situation}`;
    $('drill-prompt').textContent = stage.prompt;

    const optionsEl = $('drill-options');
    optionsEl.innerHTML = '';
    stage.options.forEach((opt, idx) => {
      const btn = document.createElement('div');
      btn.className = 'drill-option';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => answerDrill(idx, btn));
      optionsEl.appendChild(btn);
    });

    $('drill-feedback').style.display = 'none';
    $('drill-continue').style.display = 'none';
    _drillState.stageStartTime = Date.now();
  }

  function answerDrill(optionIdx, clickedEl) {
    const { scenario, stageIndex, results, stageStartTime } = _drillState;
    const stage  = scenario.drill.stages[stageIndex];
    const option = stage.options[optionIdx];
    const timeTaken = ((Date.now() - stageStartTime) / 1000).toFixed(1);

    // Disable all options
    document.querySelectorAll('.drill-option').forEach(el => el.classList.add('answered'));

    // Highlight correct / incorrect
    document.querySelectorAll('.drill-option').forEach((el, i) => {
      if (stage.options[i].correct) el.classList.add('correct');
    });
    if (!option.correct) clickedEl.classList.add('incorrect');

    // Show feedback
    const fb = $('drill-feedback');
    fb.className = 'drill-feedback ' + (option.correct ? 'correct-fb' : 'incorrect-fb');
    fb.innerHTML = `<strong>${option.correct ? '✓ Correct!' : '✗ Incorrect'}</strong> — ${option.feedback}`;
    fb.style.display = 'block';

    results.push({ correct: option.correct, time: parseFloat(timeTaken), stage: stageIndex });

    // Pulse timer if slow
    if (parseFloat(timeTaken) > 15) $('drill-timer').classList.add('urgent');

    const isLast = stageIndex === scenario.drill.stages.length - 1;
    const continueBtn = $('drill-continue');
    continueBtn.textContent = isLast ? 'See Results →' : 'Continue →';
    continueBtn.style.display = 'inline-flex';
  }

  function drillContinue() {
    const { scenario, stageIndex } = _drillState;
    $('drill-timer').classList.remove('urgent');

    if (stageIndex < scenario.drill.stages.length - 1) {
      _drillState.stageIndex++;
      renderDrillStage();
    } else {
      finishDrill();
    }
  }

  function finishDrill() {
    stopTimer();
    const { scenario, results, startTime } = _drillState;
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(0);
    const correct   = results.filter(r => r.correct).length;
    const total     = results.length;
    const accuracy  = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Score: 60% accuracy + 40% speed (under 30s per stage is ideal)
    const avgTime   = results.reduce((s, r) => s + r.time, 0) / (results.length || 1);
    const speedScore = Math.max(0, Math.min(100, Math.round((1 - (avgTime - 5) / 25) * 100)));
    const finalScore = Math.round(accuracy * 0.65 + speedScore * 0.35);

    $('drill-score-number').textContent = finalScore;
    $('drill-results-header').innerHTML = `<h2>${scenario.icon} ${scenario.title} Drill Complete</h2><p>Total time: ${totalTime} seconds</p>`;

    let summary;
    if (finalScore >= 85) summary = 'Excellent! You responded quickly and made the right calls. Run this drill again in 3 months to stay sharp.';
    else if (finalScore >= 65) summary = 'Good effort. Review the incorrect decisions and consider re-running this drill until you score consistently above 85.';
    else summary = 'This scenario needs more practice. Read through the scenario plan carefully, then try the drill again.';
    $('drill-score-summary').textContent = summary;

    const breakdown = $('drill-breakdown');
    breakdown.innerHTML = '';
    results.forEach((r, i) => {
      const div = document.createElement('div');
      div.className = 'breakdown-item';
      div.innerHTML = `<span class="bi-label">Stage ${i + 1}: ${scenario.drill.stages[i].situation.slice(0, 50)}…</span>
        <span class="bi-result ${r.correct ? 'bi-correct' : 'bi-incorrect'}">${r.correct ? '✓ Correct' : '✗ Wrong'} · ${r.time}s</span>`;
      breakdown.appendChild(div);
    });
    // Time summary row
    const timeRow = document.createElement('div');
    timeRow.className = 'breakdown-item';
    timeRow.innerHTML = `<span class="bi-label">Average response time</span><span class="bi-result bi-time">${avgTime.toFixed(1)}s per stage</span>`;
    breakdown.appendChild(timeRow);

    showScreen('screen-drill-results');
  }

  function drillAgain() {
    if (_drillState) startDrill(_drillState.scenario.id);
  }

  // ── Timer ─────────────────────────────────────────────────────────
  function startTimer() {
    const start = Date.now();
    _timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = String(elapsed % 60).padStart(2, '0');
      const el = $('drill-timer');
      if (el) el.textContent = `${m}:${s}`;
    }, 500);
  }

  function stopTimer() {
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
  }

  function printPlan() { window.print(); }

  return { goHome, startProfile, profileNext, profileBack, showPlans, startDrillPicker, drillThis, drillContinue, drillAgain, printPlan };
})();
