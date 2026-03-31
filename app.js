'use strict';

// ===== RESULT BANDS =====
const RESULT_BANDS = [
  {
    min: 0, max: 30,
    level: 'very-low',
    label: 'Very Low Density',
    title: 'Severely Thinned Hair',
    summary: 'Analysis indicates very low hair density with significant scalp exposure. A professional evaluation is strongly recommended.',
    recommendations: [
      'Consult a dermatologist or trichologist for a clinical diagnosis',
      'Consider FDA-approved treatments such as topical minoxidil',
      'Get blood tests for nutritional deficiencies (iron, vitamin D, B12)',
      'Use gentle, volumizing shampoos and avoid heat styling',
      'Explore low-level laser therapy (LLLT) options',
      'Prioritise a protein-rich diet to support follicle health',
    ],
    nextSteps: [
      { icon: '🏥', title: 'See a Trichologist', desc: 'Specialist scalp evaluation' },
      { icon: '🩸', title: 'Blood Panel', desc: 'Check for deficiencies' },
      { icon: '💊', title: 'Medical Options', desc: 'Discuss treatment with a doctor' },
    ],
  },
  {
    min: 30, max: 45,
    level: 'low',
    label: 'Low Density',
    title: 'Noticeably Thin Hair',
    summary: 'Hair density appears lower than average with visible scalp areas. With the right care routine and professional input, improvement is achievable.',
    recommendations: [
      'Speak with a dermatologist to rule out underlying causes',
      'Use clinically-supported topical treatments (e.g., minoxidil)',
      'Switch to a gentle, sulfate-free shampoo with scalp-stimulating ingredients',
      'Incorporate scalp massage for 5-10 minutes daily to boost circulation',
      'Increase protein and biotin intake through diet or supplements',
      'Reduce heat styling and tight hairstyles that cause traction alopecia',
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
    summary: 'Hair density is within the normal range. A consistent care routine will help preserve and potentially improve density over time.',
    recommendations: [
      'Maintain a balanced, protein-rich diet for ongoing hair health',
      'Use a scalp-friendly shampoo suited to your hair type',
      'Practice regular scalp massages to stimulate circulation',
      'Protect hair from UV, heat, and chemical damage',
      'Stay hydrated — dehydration negatively impacts hair health',
      'Manage stress; chronic stress can accelerate hair thinning',
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
    summary: 'Analysis shows above-average hair density with good scalp coverage. Focus on maintenance with good lifestyle habits.',
    recommendations: [
      'Continue your current care routine — it appears to be working well',
      'Use lightweight products to avoid weighing down your hair',
      'Maintain scalp hygiene to prevent build-up on dense hair',
      'Regular trims remove split ends and keep hair healthy',
      'Consider a silk pillowcase to reduce overnight friction',
      'Stay consistent with a nutritious diet and hydration',
    ],
    nextSteps: [
      { icon: '✂️', title: 'Regular Trims', desc: 'Every 8-12 weeks' },
      { icon: '🌿', title: 'Natural Products', desc: 'Opt for gentle formulations' },
      { icon: '💧', title: 'Hydration', desc: 'Drink 8+ glasses of water daily' },
    ],
  },
  {
    min: 78, max: 101,
    level: 'very-high',
    label: 'Very High Density',
    title: 'Exceptionally Dense Hair',
    summary: 'Analysis reveals exceptionally high hair density. Focus on managing thickness, moisture balance, and preventing breakage from weight.',
    recommendations: [
      'Use moisturising, nourishing products to manage thickness',
      'Deep condition weekly to maintain hydration through dense strands',
      'Use detangling products and a wide-tooth comb to prevent breakage',
      'Consider layered cuts to manage weight and reduce scalp tension',
      'Ensure thorough drying — dense hair is prone to moisture-related issues',
      'Avoid over-washing, which strips natural oils essential for thick hair',
    ],
    nextSteps: [
      { icon: '💆', title: 'Deep Conditioning', desc: 'Weekly moisture treatment' },
      { icon: '🪮', title: 'Proper Detangling', desc: 'Wide-tooth comb when wet' },
      { icon: '✂️', title: 'Strategic Cuts', desc: 'Layering to manage weight' },
    ],
  },
];

// ===== UTILITIES =====
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function $(id) { return document.getElementById(id); }

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const STEP_ORDER = ['step-load', 'step-coverage', 'step-texture', 'step-edges', 'step-regions', 'step-score'];

function activateStep(stepId) {
  const idx = STEP_ORDER.indexOf(stepId);
  STEP_ORDER.forEach((id, i) => {
    const el = $(id);
    if (!el) return;
    el.classList.remove('active', 'done');
    if (i < idx)       el.classList.add('done');
    else if (i === idx) el.classList.add('active');
  });
}

// ===== IMAGE ANALYSIS ENGINE =====
function analyseImageData(imageData) {
  const { data, width, height } = imageData;
  const n = width * height;

  // 1. Luminance
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    lum[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  // 2. Global mean & stdDev
  let sum = 0;
  for (let i = 0; i < n; i++) sum += lum[i];
  const mean = sum / n;
  let sumSq = 0;
  for (let i = 0; i < n; i++) sumSq += (lum[i] - mean) ** 2;
  const stdDev = Math.sqrt(sumSq / n);

  // 3. Adaptive hair coverage
  const hairThreshold = mean - stdDev * 0.35;
  let hairCount = 0;
  for (let i = 0; i < n; i++) if (lum[i] < hairThreshold) hairCount++;
  const coverageRatio = hairCount / n;

  // 4. Sobel edge density
  let edgeSum = 0, edgeCount = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const gx = (-lum[i - width - 1] - 2 * lum[i - 1] - lum[i + width - 1])
               + ( lum[i - width + 1] + 2 * lum[i + 1] + lum[i + width + 1]);
      const gy = (-lum[i - width - 1] - 2 * lum[i - width] - lum[i - width + 1])
               + ( lum[i + width - 1] + 2 * lum[i + width] + lum[i + width + 1]);
      edgeSum += Math.sqrt(gx * gx + gy * gy);
      edgeCount++;
    }
  }
  const edgeDensity = edgeSum / edgeCount;

  // 5. Block variance (8x8) — counts hair-textured blocks
  const BLOCK = 8;
  let texturedBlocks = 0, totalBlocks = 0;
  for (let by = 0; by + BLOCK <= height; by += BLOCK) {
    for (let bx = 0; bx + BLOCK <= width; bx += BLOCK) {
      let bSum = 0, bSumSq = 0;
      for (let dy = 0; dy < BLOCK; dy++) {
        for (let dx = 0; dx < BLOCK; dx++) {
          const v = lum[(by + dy) * width + (bx + dx)];
          bSum += v; bSumSq += v * v;
        }
      }
      const bN    = BLOCK * BLOCK;
      const bMean = bSum / bN;
      const bVar  = bSumSq / bN - bMean * bMean;
      if (bVar > 80) texturedBlocks++;
      totalBlocks++;
    }
  }
  const textureRatio = texturedBlocks / totalBlocks;

  // 6. 3x3 regional density map
  const regionScores = [];
  const rW = Math.floor(width / 3);
  const rH = Math.floor(height / 3);
  for (let ry = 0; ry < 3; ry++) {
    for (let rx = 0; rx < 3; rx++) {
      let rHair = 0, rTotal = 0;
      for (let dy = 0; dy < rH; dy++) {
        for (let dx = 0; dx < rW; dx++) {
          const idx = (ry * rH + dy) * width + (rx * rW + dx);
          if (lum[idx] < hairThreshold) rHair++;
          rTotal++;
        }
      }
      regionScores.push(Math.round((rHair / rTotal) * 100));
    }
  }

  // 7. Overlay mask
  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) mask[i] = lum[i] < hairThreshold ? 1 : 0;

  // 8. Weighted score
  const covScore  = clamp((coverageRatio - 0.08) / 0.67 * 100, 5, 95);
  const texScore  = clamp((textureRatio  - 0.05) / 0.55 * 100, 5, 95);
  const edgeScore = clamp((edgeDensity   - 4)    / 18   * 100, 5, 95);
  const sdScore   = clamp((stdDev        - 8)    / 57   * 100, 5, 95);

  const finalScore = Math.round(covScore * 0.35 + texScore * 0.30 + edgeScore * 0.20 + sdScore * 0.15);

  return {
    score: clamp(finalScore, 5, 95),
    coveragePct: Math.round(coverageRatio * 100),
    texturePct:  Math.round(textureRatio  * 100),
    edgeDensity: Math.round(edgeDensity * 10) / 10,
    stdDev:      Math.round(stdDev),
    regionScores,
    mask,
  };
}

// ===== APP =====
const App = (() => {

  function initUploadListeners() {
    const zone  = $('upload-zone');
    const input = $('file-input');

    zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) handleFile(file);
    });
    zone.addEventListener('click', e => {
      if (e.target.tagName !== 'BUTTON') input.click();
    });
    input.addEventListener('change', () => {
      if (input.files[0]) handleFile(input.files[0]);
    });
  }

  function handleFile(file) {
    if (file.size > 20 * 1024 * 1024) {
      alert('File too large. Please upload an image under 20 MB.');
      return;
    }

    $('upload-zone').style.display     = 'none';
    $('analysing-state').style.display = 'flex';
    activateStep('step-load');

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      setTimeout(() => activateStep('step-coverage'), 300);
      setTimeout(() => activateStep('step-texture'),  700);
      setTimeout(() => activateStep('step-edges'),    1100);
      setTimeout(() => activateStep('step-regions'),  1500);
      setTimeout(() => {
        activateStep('step-score');
        const result = runAnalysis(img);
        setTimeout(() => renderResults(result), 600);
      }, 1900);
    };

    img.onerror = () => {
      alert('Could not read the image. Please try a different file.');
      resetUpload();
    };

    img.src = url;
  }

  function runAnalysis(img) {
    const MAX   = 480;
    const scale = Math.min(1, MAX / Math.max(img.width, img.height));
    const w     = Math.round(img.width  * scale);
    const h     = Math.round(img.height * scale);

    const offscreen = document.createElement('canvas');
    offscreen.width = w; offscreen.height = h;
    const ctx = offscreen.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);

    const result    = analyseImageData(ctx.getImageData(0, 0, w, h));
    result._canvas  = offscreen;
    result._w       = w;
    result._h       = h;
    return result;
  }

  function renderResults(result) {
    const { score, coveragePct, texturePct, edgeDensity, stdDev, regionScores, mask, _canvas, _w, _h } = result;
    const band = RESULT_BANDS.find(b => score >= b.min && score < b.max) || RESULT_BANDS[RESULT_BANDS.length - 1];

    // Header
    const badge = $('result-badge');
    badge.textContent = band.label;
    badge.className   = `result-badge badge-${band.level}`;
    $('result-title').textContent   = band.title;
    $('result-summary').textContent = band.summary;
    $('score-number').textContent   = score;

    setTimeout(() => { $('density-thumb').style.left = `${clamp(score, 2, 98)}%`; }, 150);

    // Photo canvas
    const pc = $('photo-canvas');
    pc.width = _w; pc.height = _h;
    pc.getContext('2d').drawImage(_canvas, 0, 0);

    // Overlay canvas
    const oc   = $('overlay-canvas');
    oc.width   = _w; oc.height = _h;
    const octx = oc.getContext('2d');
    const ovD  = octx.createImageData(_w, _h);
    for (let i = 0; i < mask.length; i++) {
      if (mask[i]) {
        ovD.data[i*4]=0; ovD.data[i*4+1]=210; ovD.data[i*4+2]=140; ovD.data[i*4+3]=130;
      } else {
        ovD.data[i*4]=250; ovD.data[i*4+1]=120; ovD.data[i*4+2]=50; ovD.data[i*4+3]=55;
      }
    }
    octx.putImageData(ovD, 0, 0);

    // Metrics
    $('photo-metrics').innerHTML = `
      <div class="metric-box"><span class="m-value">${coveragePct}%</span><span class="m-label">Hair Coverage</span></div>
      <div class="metric-box"><span class="m-value">${texturePct}%</span><span class="m-label">Texture Score</span></div>
      <div class="metric-box"><span class="m-value">${edgeDensity}</span><span class="m-label">Edge Density</span></div>
      <div class="metric-box"><span class="m-value">${stdDev}</span><span class="m-label">Luminance Variance</span></div>
    `;

    // Regional heatmap
    const rg   = $('region-grid');
    rg.innerHTML = '';
    const maxR = Math.max(...regionScores);
    regionScores.forEach(rs => {
      const cell = document.createElement('div');
      cell.className = 'region-cell';
      const intensity = maxR > 0 ? rs / maxR : 0;
      cell.style.background = `rgba(79, 70, 229, ${(0.08 + intensity * 0.72).toFixed(2)})`;
      cell.innerHTML = `<span class="region-pct">${rs}%</span>`;
      rg.appendChild(cell);
    });

    // Recommendations
    $('recommendations-list').innerHTML = '';
    band.recommendations.forEach(rec => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="rec-dot"></span><span>${rec}</span>`;
      $('recommendations-list').appendChild(li);
    });

    // Next steps
    $('next-steps').innerHTML = '<div class="next-steps-grid"></div>';
    band.nextSteps.forEach(step => {
      const div = document.createElement('div');
      div.className = 'next-step-item';
      div.innerHTML = `<div class="ns-icon">${step.icon}</div><div class="ns-title">${step.title}</div><div class="ns-desc">${step.desc}</div>`;
      $('next-steps').querySelector('.next-steps-grid').appendChild(div);
    });

    showScreen('screen-results');
  }

  function resetUpload() {
    $('upload-zone').style.display     = 'block';
    $('analysing-state').style.display = 'none';
    $('file-input').value              = '';
    document.querySelectorAll('.a-step').forEach(s => s.classList.remove('active', 'done'));
  }

  function start()   { showScreen('screen-upload'); }
  function restart() { resetUpload(); showScreen('screen-intro'); }
  function print()   { window.print(); }

  document.addEventListener('DOMContentLoaded', initUploadListeners);

  return { start, restart, print };
})();
