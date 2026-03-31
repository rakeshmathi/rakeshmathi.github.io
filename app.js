'use strict';

// ===== QUESTIONS =====
const QUESTIONS = [
  {
    id: 'scalp_visibility',
    category: 'Scalp Visibility',
    text: 'When looking in a bright-lit mirror, how visible is your scalp through your hair?',
    hint: 'Part your hair down the middle and observe under natural or bright light.',
    options: [
      { icon: '🔴', label: 'Clearly visible', desc: 'Scalp is easily seen throughout', score: 1 },
      { icon: '🟠', label: 'Mostly visible', desc: 'Scalp shows through most areas', score: 2 },
      { icon: '🟡', label: 'Slightly visible', desc: 'Scalp visible only at the part', score: 3 },
      { icon: '🟢', label: 'Barely visible', desc: 'Hard to see scalp', score: 4 },
      { icon: '🔵', label: 'Not visible', desc: 'Scalp completely hidden', score: 5 },
    ],
  },
  {
    id: 'ponytail_thickness',
    category: 'Hair Volume',
    text: 'If you pull all your hair into a ponytail, how thick does it feel?',
    hint: 'Use your fingers to gauge the circumference of your ponytail.',
    options: [
      { icon: '🔴', label: 'Very thin (pencil-width)', desc: 'Under 2 cm circumference', score: 1 },
      { icon: '🟠', label: 'Thin', desc: 'About 2–3 cm circumference', score: 2 },
      { icon: '🟡', label: 'Medium', desc: 'About 3–4 cm circumference', score: 3 },
      { icon: '🟢', label: 'Thick', desc: 'About 4–6 cm circumference', score: 4 },
      { icon: '🔵', label: 'Very thick', desc: 'Over 6 cm circumference', score: 5 },
    ],
  },
  {
    id: 'strand_thickness',
    category: 'Strand Characteristics',
    text: 'How would you describe the thickness of an individual hair strand?',
    hint: 'Hold a single strand between your fingers or compare it to a thread.',
    options: [
      { icon: '🔴', label: 'Very fine', desc: 'Almost invisible, breaks easily', score: 1 },
      { icon: '🟠', label: 'Fine', desc: 'Thin but visible', score: 2 },
      { icon: '🟡', label: 'Medium', desc: 'Average thickness', score: 3 },
      { icon: '🟢', label: 'Thick / Coarse', desc: 'Noticeably thick strand', score: 4 },
      { icon: '🔵', label: 'Very coarse', desc: 'Like a wire or thread', score: 5 },
    ],
  },
  {
    id: 'hair_shedding',
    category: 'Shedding & Loss',
    text: 'How much hair do you notice shedding daily (on your pillow, shower, brush)?',
    hint: 'Normal shedding is approximately 50–100 hairs per day.',
    options: [
      { icon: '🔴', label: 'Excessive', desc: 'Handfuls — clearly abnormal', score: 1 },
      { icon: '🟠', label: 'High', desc: 'More than 100 hairs daily', score: 2 },
      { icon: '🟡', label: 'Moderate', desc: 'Around 50–100 hairs', score: 3 },
      { icon: '🟢', label: 'Low', desc: 'Less than 50 hairs', score: 4 },
      { icon: '🔵', label: 'Minimal', desc: 'Rarely notice shedding', score: 5 },
    ],
  },
  {
    id: 'hair_coverage',
    category: 'Scalp Coverage',
    text: 'How evenly does your hair cover your scalp overall?',
    hint: 'Consider the top, sides, and back of your head.',
    options: [
      { icon: '🔴', label: 'Significant patches', desc: 'Visible bald or thin areas', score: 1 },
      { icon: '🟠', label: 'Some thinning areas', desc: 'Noticeable thinning in spots', score: 2 },
      { icon: '🟡', label: 'Mostly even', desc: 'Minor variations', score: 3 },
      { icon: '🟢', label: 'Evenly distributed', desc: 'Consistent across scalp', score: 4 },
      { icon: '🔵', label: 'Very full coverage', desc: 'Dense and even everywhere', score: 5 },
    ],
  },
  {
    id: 'hair_breakage',
    category: 'Hair Health',
    text: 'How much hair breakage do you experience (short broken pieces, split ends)?',
    hint: 'Look for short pieces around your hairline or on clothing.',
    options: [
      { icon: '🔴', label: 'Severe', desc: 'Constant breakage throughout', score: 1 },
      { icon: '🟠', label: 'Frequent', desc: 'Noticeable breakage regularly', score: 2 },
      { icon: '🟡', label: 'Moderate', desc: 'Some breakage, mostly ends', score: 3 },
      { icon: '🟢', label: 'Occasional', desc: 'Rare breakage', score: 4 },
      { icon: '🔵', label: 'None', desc: 'No breakage observed', score: 5 },
    ],
  },
  {
    id: 'regrowth',
    category: 'Hair Growth',
    text: 'How is your hair re-growth after a haircut or period of shedding?',
    hint: 'Consider whether new hair appears to fill in areas over time.',
    options: [
      { icon: '🔴', label: 'No visible regrowth', desc: 'No new hairs appear', score: 1 },
      { icon: '🟠', label: 'Very sparse', desc: 'Minimal new growth', score: 2 },
      { icon: '🟡', label: 'Normal', desc: 'Average regrowth rate', score: 3 },
      { icon: '🟢', label: 'Good', desc: 'Visible new hairs filling in', score: 4 },
      { icon: '🔵', label: 'Excellent', desc: 'Rapid, dense new growth', score: 5 },
    ],
  },
  {
    id: 'scalp_health',
    category: 'Scalp Health',
    text: 'How would you describe your scalp health?',
    hint: 'Consider dryness, oiliness, dandruff, itching, or irritation.',
    options: [
      { icon: '🔴', label: 'Very poor', desc: 'Severe dryness, dandruff, or irritation', score: 1 },
      { icon: '🟠', label: 'Poor', desc: 'Frequent issues affecting comfort', score: 2 },
      { icon: '🟡', label: 'Average', desc: 'Occasional mild issues', score: 3 },
      { icon: '🟢', label: 'Good', desc: 'Mostly healthy, minor issues', score: 4 },
      { icon: '🔵', label: 'Excellent', desc: 'No issues, comfortable scalp', score: 5 },
    ],
  },
  {
    id: 'hair_texture',
    category: 'Strand Characteristics',
    text: 'How would you describe the overall texture and strength of your hair?',
    hint: 'Stretch a strand and see how it responds.',
    options: [
      { icon: '🔴', label: 'Very weak / brittle', desc: 'Snaps immediately with no stretch', score: 1 },
      { icon: '🟠', label: 'Weak', desc: 'Breaks with minimal tension', score: 2 },
      { icon: '🟡', label: 'Normal elasticity', desc: 'Stretches slightly before breaking', score: 3 },
      { icon: '🟢', label: 'Strong', desc: 'Good elasticity, rarely breaks', score: 4 },
      { icon: '🔵', label: 'Very strong', desc: 'Highly elastic, resilient', score: 5 },
    ],
  },
  {
    id: 'hairline',
    category: 'Scalp Visibility',
    text: 'How is your hairline compared to when you were younger?',
    hint: 'Look at temples, forehead, and crown.',
    options: [
      { icon: '🔴', label: 'Severely receded', desc: 'Major recession from original line', score: 1 },
      { icon: '🟠', label: 'Noticeably receded', desc: 'Clear recession at temples/crown', score: 2 },
      { icon: '🟡', label: 'Slightly receded', desc: 'Minor changes', score: 3 },
      { icon: '🟢', label: 'Mostly unchanged', desc: 'Very similar to before', score: 4 },
      { icon: '🔵', label: 'Unchanged / Improved', desc: 'No recession observed', score: 5 },
    ],
  },
  {
    id: 'styling_hold',
    category: 'Hair Volume',
    text: 'When you style your hair with volume (blow-dry, updo), how well does it hold?',
    hint: 'Think about how quickly your hair falls flat.',
    options: [
      { icon: '🔴', label: 'No hold', desc: 'Immediately falls flat', score: 1 },
      { icon: '🟠', label: 'Poor hold', desc: 'Loses shape within minutes', score: 2 },
      { icon: '🟡', label: 'Moderate hold', desc: 'Holds for a few hours', score: 3 },
      { icon: '🟢', label: 'Good hold', desc: 'Maintains style most of the day', score: 4 },
      { icon: '🔵', label: 'Excellent hold', desc: 'Keeps volume all day', score: 5 },
    ],
  },
  {
    id: 'family_history',
    category: 'Risk Factors',
    text: 'Do you have a family history of hair thinning or hair loss?',
    hint: 'Consider parents, grandparents, and siblings.',
    options: [
      { icon: '🔴', label: 'Strong history', desc: 'Multiple relatives with significant hair loss', score: 1 },
      { icon: '🟠', label: 'Some history', desc: 'A few relatives affected', score: 2 },
      { icon: '🟡', label: 'Uncertain', desc: "Not sure about family history", score: 3 },
      { icon: '🟢', label: 'Minimal history', desc: 'Few relatives with minor thinning', score: 4 },
      { icon: '🔵', label: 'No history', desc: 'No known family history', score: 5 },
    ],
  },
];

// ===== CATEGORIES =====
const CATEGORIES = {
  'Scalp Visibility':       { weight: 1.3, icon: '👁️' },
  'Hair Volume':            { weight: 1.2, icon: '💇' },
  'Strand Characteristics': { weight: 1.0, icon: '🧵' },
  'Shedding & Loss':        { weight: 1.3, icon: '🍂' },
  'Scalp Coverage':         { weight: 1.2, icon: '🗺️' },
  'Hair Health':            { weight: 1.0, icon: '❤️' },
  'Hair Growth':            { weight: 1.1, icon: '🌱' },
  'Scalp Health':           { weight: 0.9, icon: '🧴' },
  'Risk Factors':           { weight: 0.8, icon: '⚠️' },
};

// ===== RESULT BANDS =====
const RESULT_BANDS = [
  {
    min: 0, max: 30,
    level: 'very-low',
    label: 'Very Low Density',
    title: 'Severely Thinned Hair',
    summary: 'Your responses suggest very low hair density with significant thinning. This may benefit from professional evaluation and a targeted care plan.',
    recommendations: [
      'Consult a dermatologist or trichologist for a professional diagnosis',
      'Consider FDA-approved treatments such as minoxidil (topical)',
      'Get blood tests for nutritional deficiencies (iron, vitamin D, B12)',
      'Use gentle, volumizing shampoos and avoid heat styling',
      'Explore low-level laser therapy (LLLT) options',
      'Prioritize a protein-rich diet to support follicle health',
    ],
    nextSteps: [
      { icon: '🏥', title: 'See a Trichologist', desc: 'Specialist scalp and hair evaluation' },
      { icon: '🩸', title: 'Blood Panel', desc: 'Check for deficiencies' },
      { icon: '💊', title: 'Medical Options', desc: 'Discuss treatment with a doctor' },
    ],
  },
  {
    min: 30, max: 45,
    level: 'low',
    label: 'Low Density',
    title: 'Noticeably Thin Hair',
    summary: 'Your hair density appears lower than average. With the right care routine and possibly professional input, improvement is achievable.',
    recommendations: [
      'Speak with a dermatologist to rule out underlying causes',
      'Use clinically-supported topical treatments (e.g., minoxidil)',
      'Switch to a gentle, sulfate-free shampoo with scalp-stimulating ingredients',
      'Incorporate scalp massage for 5–10 minutes daily to boost circulation',
      'Increase protein and biotin intake through diet or supplements',
      'Reduce heat styling and tight hairstyles that cause traction',
    ],
    nextSteps: [
      { icon: '🩺', title: 'Doctor Consult', desc: 'Rule out medical causes' },
      { icon: '🛁', title: 'Scalp Routine', desc: 'Build a consistent care routine' },
      { icon: '🥗', title: 'Nutrition Review', desc: 'Assess diet for deficiencies' },
    ],
  },
  {
    min: 45, max: 62,
    level: 'medium',
    label: 'Medium Density',
    title: 'Average Hair Density',
    summary: 'Your hair density falls within the average range. Maintaining a consistent care routine will help preserve and even improve your current density.',
    recommendations: [
      'Maintain a balanced, protein-rich diet for ongoing hair health',
      'Use a scalp-friendly shampoo suited to your hair type',
      'Practice regular (2–3x per week) scalp massages',
      'Protect hair from UV, heat, and chemical damage',
      'Stay hydrated — dehydration impacts hair health',
      'Manage stress, as chronic stress can contribute to hair thinning',
    ],
    nextSteps: [
      { icon: '🧴', title: 'Hair Care Routine', desc: 'Establish consistent practices' },
      { icon: '🧘', title: 'Stress Management', desc: 'Yoga, meditation, or exercise' },
      { icon: '📅', title: 'Annual Check-in', desc: 'Monitor density year-over-year' },
    ],
  },
  {
    min: 62, max: 78,
    level: 'high',
    label: 'High Density',
    title: 'Above Average Hair Density',
    summary: 'You have above-average hair density. Focus on maintaining this with good lifestyle habits and appropriate hair care.',
    recommendations: [
      'Continue your current care routine — it appears to be working',
      'Use lightweight products to avoid weighing down your hair',
      'Maintain scalp hygiene to prevent build-up on dense hair',
      'Regular trims help remove split ends and keep hair healthy',
      'Consider a silk pillowcase to reduce friction and breakage',
      'Stay consistent with a nutritious diet and hydration',
    ],
    nextSteps: [
      { icon: '✂️', title: 'Regular Trims', desc: 'Every 8–12 weeks' },
      { icon: '🌿', title: 'Natural Products', desc: 'Opt for gentle formulations' },
      { icon: '💧', title: 'Hydration', desc: 'Drink 8+ glasses of water daily' },
    ],
  },
  {
    min: 78, max: 101,
    level: 'very-high',
    label: 'Very High Density',
    title: 'Exceptionally Dense Hair',
    summary: 'Your hair density is exceptionally high. Your main focus should be on managing thickness, maintaining moisture, and preventing breakage from weight.',
    recommendations: [
      'Use moisturizing, nourishing products to manage thickness',
      'Deep condition weekly to maintain hydration through dense strands',
      'Use detangling products and wide-tooth combs to prevent breakage',
      'Consider layered cuts to manage weight and prevent scalp tension',
      'Ensure proper drying — dense hair is prone to moisture-related issues',
      'Avoid over-washing, which can strip natural oils needed for thick hair',
    ],
    nextSteps: [
      { icon: '💆', title: 'Deep Conditioning', desc: 'Weekly moisture treatment' },
      { icon: '🪮', title: 'Proper Detangling', desc: 'Use wide-tooth comb when wet' },
      { icon: '✂️', title: 'Strategic Cuts', desc: 'Layering to manage weight' },
    ],
  },
];

// ===== IMAGE ANALYSIS =====

/**
 * Analyse hair density from an ImageData object using:
 *  1. Hair-coverage ratio  — fraction of pixels identified as hair strands
 *  2. Texture index        — normalised luminance standard-deviation
 *  3. Edge density         — average gradient magnitude (strand sharpness)
 *
 * Returns a score in [0, 100].
 */
function analyseImageData(imageData) {
  const { data, width, height } = imageData;
  const n = width * height;

  // --- Build luminance array ---
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // --- Mean & standard-deviation ---
  let sum = 0;
  for (let i = 0; i < n; i++) sum += lum[i];
  const mean = sum / n;

  let sumSq = 0;
  for (let i = 0; i < n; i++) sumSq += (lum[i] - mean) ** 2;
  const stdDev = Math.sqrt(sumSq / n);

  // --- Adaptive coverage threshold ---
  // Pixels darker than (mean − 0.4·σ) are classified as hair.
  const hairThreshold = mean - stdDev * 0.4;
  let hairCount = 0;
  for (let i = 0; i < n; i++) {
    if (lum[i] < hairThreshold) hairCount++;
  }
  const coverageRatio = hairCount / n; // 0→1

  // --- Edge density via 2×2 gradient (Sobel-lite) ---
  let edgeSum = 0;
  let edgePixels = 0;
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const idx = y * width + x;
      const gx = lum[idx + 1] - lum[idx];
      const gy = lum[idx + width] - lum[idx];
      edgeSum += Math.sqrt(gx * gx + gy * gy);
      edgePixels++;
    }
  }
  const edgeDensity = edgeSum / edgePixels; // avg gradient magnitude

  // --- Build overlay mask (returned for visualisation) ---
  const mask = new Uint8Array(n); // 1 = hair, 0 = scalp
  for (let i = 0; i < n; i++) {
    mask[i] = lum[i] < hairThreshold ? 1 : 0;
  }

  // --- Normalise sub-scores to [0, 100] ---
  // coverage: 0.10 → ~10  /  0.75 → ~95
  const covScore = clamp((coverageRatio - 0.08) / 0.62 * 100, 5, 95);

  // texture: stdDev 8 → 10  /  60 → 95
  const texScore = clamp((stdDev - 8) / 52 * 100, 5, 95);

  // edge density: 2 → 10  /  18 → 90
  const edgeScore = clamp((edgeDensity - 2) / 16 * 100, 5, 95);

  // Weighted blend
  const photoScore = Math.round(covScore * 0.50 + texScore * 0.30 + edgeScore * 0.20);

  return {
    score: clamp(photoScore, 5, 95),
    coveragePct: Math.round(coverageRatio * 100),
    stdDev: Math.round(stdDev),
    edgeDensity: Math.round(edgeDensity * 10) / 10,
    mask,
    hairThreshold,
  };
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ===== APP STATE =====
const App = (() => {
  let currentIndex = 0;
  let answers = {};
  let photoScore = null;   // null = no photo uploaded
  let photoMetrics = null;

  // ===== HELPERS =====
  function $(id) { return document.getElementById(id); }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===== PHOTO LOGIC =====
  function initPhotoScreen() {
    const zone = $('upload-zone');
    const input = $('file-input');

    // Drag & drop
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) processFile(file);
    });

    // Click-to-browse
    zone.addEventListener('click', e => {
      if (e.target.tagName !== 'BUTTON') input.click();
    });

    input.addEventListener('change', () => {
      if (input.files[0]) processFile(input.files[0]);
    });
  }

  function processFile(file) {
    if (file.size > 20 * 1024 * 1024) {
      alert('File is too large. Please upload an image under 20 MB.');
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      runAnalysis(img);
    };
    img.src = url;
  }

  function runAnalysis(img) {
    // Scale to max 400 px on longest side for performance
    const MAX = 400;
    const scale = Math.min(1, MAX / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    // --- Main canvas (shows original image) ---
    const canvas = $('photo-canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);

    // --- Get pixel data ---
    const imageData = ctx.getImageData(0, 0, w, h);
    const result = analyseImageData(imageData);
    photoScore = result.score;
    photoMetrics = result;

    // --- Overlay canvas (semi-transparent hair/scalp colouring) ---
    const oc = $('overlay-canvas');
    oc.width = w;
    oc.height = h;
    const octx = oc.getContext('2d');
    const overlay = octx.createImageData(w, h);
    const { mask } = result;

    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 1) {
        // hair → green teal
        overlay.data[i * 4 + 0] = 0;
        overlay.data[i * 4 + 1] = 210;
        overlay.data[i * 4 + 2] = 140;
        overlay.data[i * 4 + 3] = 140;
      } else {
        // scalp → warm orange
        overlay.data[i * 4 + 0] = 250;
        overlay.data[i * 4 + 1] = 120;
        overlay.data[i * 4 + 2] = 50;
        overlay.data[i * 4 + 3] = 60;
      }
    }
    octx.putImageData(overlay, 0, 0);

    // --- Show analysis panel ---
    $('photo-analysis-wrap').style.display = 'flex';
    $('upload-zone').style.display = 'none';

    $('photo-score-num').textContent = result.score;

    // Metrics boxes
    $('photo-metrics').innerHTML = `
      <div class="metric-box">
        <span class="m-value">${result.coveragePct}%</span>
        <span class="m-label">Hair Coverage</span>
      </div>
      <div class="metric-box">
        <span class="m-value">${result.stdDev}</span>
        <span class="m-label">Texture Index</span>
      </div>
      <div class="metric-box">
        <span class="m-value">${result.edgeDensity}</span>
        <span class="m-label">Edge Density</span>
      </div>
    `;
  }

  function clearPhoto() {
    photoScore = null;
    photoMetrics = null;
    $('photo-analysis-wrap').style.display = 'none';
    $('upload-zone').style.display = 'block';
    $('file-input').value = '';
    $('photo-score-num').textContent = '—';
    $('photo-metrics').innerHTML = '';

    // Clear canvases
    const c1 = $('photo-canvas');
    const c2 = $('overlay-canvas');
    c1.getContext('2d').clearRect(0, 0, c1.width, c1.height);
    c2.getContext('2d').clearRect(0, 0, c2.width, c2.height);
  }

  // ===== SCORING =====
  function computeQuestionnaireScore() {
    let weightedSum = 0;
    let totalWeight = 0;

    QUESTIONS.forEach(q => {
      const answerIndex = answers[q.id];
      if (answerIndex === undefined) return;
      const rawScore = q.options[answerIndex].score;
      const catWeight = CATEGORIES[q.category]?.weight ?? 1.0;
      weightedSum += rawScore * catWeight;
      totalWeight += 5 * catWeight;
    });

    if (totalWeight === 0) return 0;
    return Math.round((weightedSum / totalWeight) * 100);
  }

  function computeFinalScore() {
    const qScore = computeQuestionnaireScore();
    if (photoScore === null) return qScore;
    // Blend: 35% photo + 65% questionnaire
    return Math.round(photoScore * 0.35 + qScore * 0.65);
  }

  function getCategoryScores() {
    const catData = {};
    QUESTIONS.forEach(q => {
      const answerIndex = answers[q.id];
      if (answerIndex === undefined) return;
      const rawScore = q.options[answerIndex].score;
      if (!catData[q.category]) catData[q.category] = { sum: 0, max: 0 };
      catData[q.category].sum += rawScore;
      catData[q.category].max += 5;
    });

    const result = {};
    Object.entries(catData).forEach(([cat, data]) => {
      result[cat] = Math.round((data.sum / data.max) * 100);
    });
    return result;
  }

  function getResultBand(score) {
    return RESULT_BANDS.find(b => score >= b.min && score < b.max) || RESULT_BANDS[RESULT_BANDS.length - 1];
  }

  // ===== RENDER QUESTION =====
  function renderQuestion() {
    const q = QUESTIONS[currentIndex];
    const total = QUESTIONS.length;
    const pct = Math.round((currentIndex / total) * 100);

    $('progress-label').textContent = `Question ${currentIndex + 1} of ${total}`;
    $('progress-pct').textContent = `${pct}%`;
    $('progress-fill').style.width = `${pct}%`;

    $('question-category').textContent = q.category;
    $('question-text').textContent = q.text;
    $('question-hint').textContent = q.hint || '';

    const grid = $('options-grid');
    grid.innerHTML = '';

    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn' + (answers[q.id] === i ? ' selected' : '');
      btn.innerHTML = `
        <div class="option-icon">${opt.icon}</div>
        <div class="option-label">
          <strong>${opt.label}</strong>
          <small>${opt.desc}</small>
        </div>
        <div class="option-radio"></div>
      `;
      btn.addEventListener('click', () => selectOption(i));
      grid.appendChild(btn);
    });

    updateNavButtons();
  }

  function selectOption(index) {
    const q = QUESTIONS[currentIndex];
    answers[q.id] = index;

    document.querySelectorAll('.option-btn').forEach((btn, i) => {
      btn.classList.toggle('selected', i === index);
    });

    updateNavButtons();

    // Auto-advance after short delay
    if (currentIndex < QUESTIONS.length - 1) {
      setTimeout(() => next(), 380);
    }
  }

  function updateNavButtons() {
    const q = QUESTIONS[currentIndex];
    const hasAnswer = answers[q.id] !== undefined;
    $('btn-prev').disabled = currentIndex === 0;
    $('btn-next').disabled = !hasAnswer;
    $('btn-next').textContent = currentIndex === QUESTIONS.length - 1 ? 'See Results' : 'Next →';
  }

  // ===== RESULTS =====
  function renderResults() {
    const score = computeFinalScore();
    const qScore = computeQuestionnaireScore();
    const band = getResultBand(score);
    const catScores = getCategoryScores();

    // Badge & title
    const badge = $('result-badge');
    badge.textContent = band.label;
    badge.className = `result-badge badge-${band.level}`;
    $('result-title').textContent = band.title;
    $('result-summary').textContent = band.summary;

    // Score & meter
    $('score-number').textContent = score;
    const thumbPct = clamp(score, 2, 98);
    setTimeout(() => {
      $('density-thumb').style.left = `${thumbPct}%`;
    }, 100);

    // Photo contribution note
    const scoreBox = document.querySelector('.results-header-card');
    const existingNote = scoreBox.querySelector('.photo-contribution');
    if (existingNote) existingNote.remove();

    if (photoScore !== null) {
      const note = document.createElement('div');
      note.className = 'photo-contribution';
      note.innerHTML = `
        <span>📸</span>
        <span>Photo analysis score: <strong>${photoScore}</strong> &nbsp;|&nbsp; Questionnaire score: <strong>${qScore}</strong> &nbsp;|&nbsp; Blended (35 / 65%): <strong>${score}</strong></span>
      `;
      scoreBox.appendChild(note);
    }

    // Category breakdown
    const breakdownList = $('breakdown-list');
    breakdownList.innerHTML = '';
    Object.entries(catScores).forEach(([cat, pct]) => {
      const catInfo = CATEGORIES[cat] || {};
      const div = document.createElement('div');
      div.className = 'breakdown-item';
      div.innerHTML = `
        <div class="breakdown-header">
          <span>${catInfo.icon || ''} ${cat}</span>
          <span>${pct}%</span>
        </div>
        <div class="breakdown-bar-track">
          <div class="breakdown-bar" style="width: 0%"></div>
        </div>
      `;
      breakdownList.appendChild(div);
      setTimeout(() => {
        div.querySelector('.breakdown-bar').style.width = `${pct}%`;
      }, 200);
    });

    // Recommendations
    const recsList = $('recommendations-list');
    recsList.innerHTML = '';
    band.recommendations.forEach(rec => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="rec-dot"></span><span>${rec}</span>`;
      recsList.appendChild(li);
    });

    // Next steps
    const nextSteps = $('next-steps');
    nextSteps.innerHTML = '<div class="next-steps-grid"></div>';
    const grid = nextSteps.querySelector('.next-steps-grid');
    band.nextSteps.forEach(step => {
      const div = document.createElement('div');
      div.className = 'next-step-item';
      div.innerHTML = `
        <div class="ns-icon">${step.icon}</div>
        <div class="ns-title">${step.title}</div>
        <div class="ns-desc">${step.desc}</div>
      `;
      grid.appendChild(div);
    });

    showScreen('screen-results');
  }

  // ===== PUBLIC API =====
  function start() {
    showScreen('screen-photo');
  }

  function continueToQuiz() {
    currentIndex = 0;
    answers = {};
    showScreen('screen-quiz');
    renderQuestion();
  }

  function skipPhoto() {
    photoScore = null;
    photoMetrics = null;
    continueToQuiz();
  }

  function prev() {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion();
    }
  }

  function next() {
    const q = QUESTIONS[currentIndex];
    if (answers[q.id] === undefined) return;

    if (currentIndex === QUESTIONS.length - 1) {
      renderResults();
    } else {
      currentIndex++;
      renderQuestion();
    }
  }

  function restart() {
    photoScore = null;
    photoMetrics = null;
    clearPhoto();
    currentIndex = 0;
    answers = {};
    showScreen('screen-intro');
  }

  function print() {
    window.print();
  }

  // Init photo listeners on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', initPhotoScreen);

  return { start, continueToQuiz, skipPhoto, clearPhoto, prev, next, restart, print };
})();
