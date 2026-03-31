'use strict';

// ===== FIREBASE =====
const firebaseConfig = {
  apiKey:            'AIzaSyAWD4VlIAjjcan4Xf7RPI_-ss5v10EzSlU',
  authDomain:        'hair-density-18ad5.firebaseapp.com',
  projectId:         'hair-density-18ad5',
  storageBucket:     'hair-density-18ad5.firebasestorage.app',
  messagingSenderId: '869241336508',
  appId:             '1:869241336508:web:7dd5a57bee096926f756b9',
};
firebase.initializeApp(firebaseConfig);
const fbAuth = firebase.auth();
const fbDb   = firebase.firestore();

// ===== AUTH MODULE =====
const Auth = (() => {
  let _tab = 'login';

  function showTab(tab) {
    _tab = tab;
    $('tab-login') .classList.toggle('active', tab === 'login');
    $('tab-signup').classList.toggle('active', tab === 'signup');
    $('auth-submit').textContent = tab === 'login' ? 'Log In' : 'Create Account';
    $('auth-switch').innerHTML = tab === 'login'
      ? 'Don\'t have an account? <a href="#" onclick="Auth.showTab(\'signup\');return false;">Sign up</a>'
      : 'Already have an account? <a href="#" onclick="Auth.showTab(\'login\');return false;">Log in</a>';
    $('auth-error').style.display = 'none';
  }

  async function submit(e) {
    e.preventDefault();
    const email    = $('auth-email').value.trim();
    const password = $('auth-password').value;
    const btn      = $('auth-submit');
    btn.disabled   = true;
    btn.textContent = '…';
    $('auth-error').style.display = 'none';

    try {
      if (_tab === 'login') {
        await fbAuth.signInWithEmailAndPassword(email, password);
      } else {
        await fbAuth.createUserWithEmailAndPassword(email, password);
      }
    } catch (err) {
      const msgs = {
        'auth/user-not-found':     'No account found with this email.',
        'auth/wrong-password':     'Incorrect password.',
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/weak-password':      'Password must be at least 6 characters.',
        'auth/invalid-email':      'Please enter a valid email address.',
        'auth/too-many-requests':  'Too many attempts. Please try again later.',
      };
      const el = $('auth-error');
      el.textContent    = msgs[err.code] || 'Something went wrong. Please try again.';
      el.style.display  = 'block';
      btn.disabled      = false;
      btn.textContent   = _tab === 'login' ? 'Log In' : 'Create Account';
    }
  }

  async function logout() {
    await fbAuth.signOut();
  }

  return { showTab, submit, logout };
})();

// ===== FIRESTORE HELPERS =====
async function saveScan(result, band) {
  const user = fbAuth.currentUser;
  if (!user) return;
  const status = $('save-status');
  try {
    await fbDb.collection('scans').add({
      userId:     user.uid,
      date:       firebase.firestore.FieldValue.serverTimestamp(),
      score:      result.score,
      band:       band.level,
      bandLabel:  band.label,
      coveragePct: result.coveragePct,
      texturePct:  result.texturePct,
      edgeDensity: result.edgeDensity,
      stdDev:      result.stdDev,
    });
    if (status) { status.textContent = '✓ Saved to your history'; }
  } catch (err) {
    console.error('Save scan failed:', err);
    if (status) { status.textContent = 'Could not save — check your connection.'; }
  }
}

function formatDate(ts) {
  const d = ts && ts.toDate ? ts.toDate() : new Date();
  return d.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

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

// Convert RGB (0-255) to HSL (H: 0-360, S: 0-100, L: 0-100)
function rgbToHsl(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
    case gn: h = (bn - rn) / d + 2; break;
    default: h = (rn - gn) / d + 4;
  }
  return [h / 6 * 360, s * 100, l * 100];
}

// Classify each pixel:  0 = background/clothing  1 = scalp/skin  2 = hair
// Clothing/background is excluded by filtering out saturated non-warm hues
function classifyPixel(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b);

  // Scalp/skin: warm-to-neutral hue, moderate lightness.
  // Broadened to h<=70 to handle warm/teal environment lighting casts.
  const warmHue = (h <= 70) || (h >= 320);
  if (warmHue && s >= 5 && s <= 88 && l >= 16 && l <= 90) return 1;

  // Hair: dark, and NOT a saturated cool colour (teal/blue/green/purple clothing)
  const isCoolColoured = (h > 65 && h < 300) && s > 16;
  if (l < 44 && !isCoolColoured) return 2;

  return 0; // background / clothing — ignored
}

// Separable box-filter dilation: expands skin (cls=1) region by `radius` pixels.
// Any hair pixel (cls=2) that falls outside the dilated skin zone is reclassified
// as background (0), removing dark-background blobs isolated from the scalp.
function removeSkinDistantHair(cls, width, height, radius) {
  const n = width * height;

  // Build binary skin mask
  const skin = new Uint8Array(n);
  for (let i = 0; i < n; i++) skin[i] = cls[i] === 1 ? 1 : 0;

  // Horizontal pass
  const hBlur = new Uint8Array(n);
  for (let y = 0; y < height; y++) {
    let sum = 0;
    for (let x = 0; x < Math.min(radius, width); x++) sum += skin[y * width + x];
    for (let x = 0; x < width; x++) {
      if (x + radius < width)     sum += skin[y * width + x + radius];
      if (x - radius - 1 >= 0)    sum -= skin[y * width + x - radius - 1];
      hBlur[y * width + x] = sum > 0 ? 1 : 0;
    }
  }

  // Vertical pass
  const nearSkin = new Uint8Array(n);
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let y = 0; y < Math.min(radius, height); y++) sum += hBlur[y * width + x];
    for (let y = 0; y < height; y++) {
      if (y + radius < height)    sum += hBlur[(y + radius) * width + x];
      if (y - radius - 1 >= 0)    sum -= hBlur[(y - radius - 1) * width + x];
      nearSkin[y * width + x] = sum > 0 ? 1 : 0;
    }
  }

  // Strip hair pixels that are not near any skin pixel
  for (let i = 0; i < n; i++) {
    if (cls[i] === 2 && !nearSkin[i]) cls[i] = 0;
  }
}

function analyseImageData(imageData) {
  const { data, width, height } = imageData;
  const n = width * height;

  // 1. Classify every pixel into scalp (1), hair (2), or other (0)
  const cls = new Uint8Array(n); // 0=other, 1=skin, 2=hair
  let skinCount = 0, hairCount = 0;

  for (let i = 0; i < n; i++) {
    const c = classifyPixel(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
    cls[i] = c;
    if (c === 1) skinCount++;
    else if (c === 2) hairCount++;
  }

  // 2. Remove hair pixels that are too far from any skin pixel (background blobs).
  //    Radius 12px: real hair strands adjacent to scalp survive; wall texture and
  //    background blobs further than 12px from any skin pixel are reclassified as 0.
  if (skinCount > n * 0.02) {
    removeSkinDistantHair(cls, width, height, 12);
    // Recount after filtering
    skinCount = 0; hairCount = 0;
    for (let i = 0; i < n; i++) {
      if (cls[i] === 1) skinCount++;
      else if (cls[i] === 2) hairCount++;
    }
  }

  const scalpTotal = skinCount + hairCount;

  // Fallback: if colour classification detects very little scalp (e.g. unusual
  // photo), revert to luminance-based approach so we always return a result
  if (scalpTotal < n * 0.04) {
    let lumSum = 0;
    const lum = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      lum[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
      lumSum += lum[i];
    }
    const mean = lumSum / n;
    let sq = 0;
    for (let i = 0; i < n; i++) sq += (lum[i] - mean) ** 2;
    const std = Math.sqrt(sq / n);
    const thr = mean - std * 0.35;
    let hc = 0;
    const mask = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      if (lum[i] < thr) { hc++; mask[i] = 2; } else { mask[i] = 1; }
    }
    const cr = hc / n;
    const sc = clamp((cr - 0.08) / 0.67 * 100, 5, 95);
    return {
      score: clamp(Math.round(sc), 5, 95),
      coveragePct: Math.round(cr * 100),
      texturePct: 50, edgeDensity: 0, stdDev: Math.round(std),
      regionScores: Array(9).fill(Math.round(cr * 100)),
      mask, fallback: true,
    };
  }

  // 2. Hair coverage ratio — only within the scalp region
  const coverageRatio = hairCount / scalpTotal;

  // 3. Luminance for texture/edge metrics — computed only on scalp pixels
  const lum = new Float32Array(n);
  let lumSum = 0, lumCount = 0;
  for (let i = 0; i < n; i++) {
    lum[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    if (cls[i] > 0) { lumSum += lum[i]; lumCount++; }
  }
  const scalpMean = lumSum / lumCount;
  let sqSum = 0;
  for (let i = 0; i < n; i++) if (cls[i] > 0) sqSum += (lum[i] - scalpMean) ** 2;
  const stdDev = Math.sqrt(sqSum / lumCount);

  // 4. Sobel edge density — only between scalp pixels
  let edgeSum = 0, edgeCount = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (cls[i] === 0) continue; // skip background
      const gx = (-lum[i - width - 1] - 2 * lum[i - 1] - lum[i + width - 1])
               + ( lum[i - width + 1] + 2 * lum[i + 1] + lum[i + width + 1]);
      const gy = (-lum[i - width - 1] - 2 * lum[i - width] - lum[i - width + 1])
               + ( lum[i + width - 1] + 2 * lum[i + width] + lum[i + width + 1]);
      edgeSum += Math.sqrt(gx * gx + gy * gy);
      edgeCount++;
    }
  }
  const edgeDensity = edgeCount > 0 ? edgeSum / edgeCount : 0;

  // 5. Block variance (8×8) — only blocks with ≥40% scalp pixels count
  const BLOCK = 8;
  let texturedBlocks = 0, totalBlocks = 0;
  for (let by = 0; by + BLOCK <= height; by += BLOCK) {
    for (let bx = 0; bx + BLOCK <= width; bx += BLOCK) {
      let bSum = 0, bSumSq = 0, bScalp = 0;
      for (let dy = 0; dy < BLOCK; dy++) {
        for (let dx = 0; dx < BLOCK; dx++) {
          const idx = (by + dy) * width + (bx + dx);
          bSum += lum[idx]; bSumSq += lum[idx] * lum[idx];
          if (cls[idx] > 0) bScalp++;
        }
      }
      const bN = BLOCK * BLOCK;
      if (bScalp / bN < 0.4) continue; // skip mostly-background blocks
      const bMean = bSum / bN;
      const bVar  = bSumSq / bN - bMean * bMean;
      if (bVar > 60) texturedBlocks++;
      totalBlocks++;
    }
  }
  const textureRatio = totalBlocks > 0 ? texturedBlocks / totalBlocks : 0;

  // 6. 3×3 regional density map — hair/(hair+skin) per zone
  const regionScores = [];
  const rW = Math.floor(width / 3);
  const rH = Math.floor(height / 3);
  for (let ry = 0; ry < 3; ry++) {
    for (let rx = 0; rx < 3; rx++) {
      let rHair = 0, rSkin = 0;
      for (let dy = 0; dy < rH; dy++) {
        for (let dx = 0; dx < rW; dx++) {
          const c = cls[(ry * rH + dy) * width + (rx * rW + dx)];
          if (c === 2) rHair++;
          else if (c === 1) rSkin++;
        }
      }
      const rTotal = rHair + rSkin;
      regionScores.push(rTotal > 0 ? Math.round((rHair / rTotal) * 100) : 0);
    }
  }

  // 7. Mask for overlay: 0=excluded(bg), 1=scalp, 2=hair
  const mask = cls;

  // 8. Weighted score — coverage is primary, texture/edges are secondary
  // Coverage is the most reliable metric — it directly measures hair/scalp ratio
  // and is unaffected by the hair-ring pattern that inflates texture/edge scores.
  // Texture and edge are kept as minor signals but heavily down-weighted.
  const covScore  = clamp((coverageRatio - 0.05) / 0.70 * 100, 5, 95);
  const sdScore   = clamp((stdDev        - 6)    / 52   * 100, 5, 95);
  const texScore  = clamp((textureRatio  - 0.05) / 0.55 * 100, 5, 95);
  const edgeScore = clamp((edgeDensity   - 3)    / 47   * 100, 5, 95); // wider range — hair ring creates high edges

  const finalScore = Math.round(
    covScore  * 0.72 +
    sdScore   * 0.15 +
    texScore  * 0.08 +
    edgeScore * 0.05
  );

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

// ===== CROP ENGINE =====
const Crop = (() => {
  let _img     = null;
  let _canvas  = null;
  let _ctx     = null;
  let _dW      = 0;   // display width  (CSS px = canvas px here)
  let _dH      = 0;   // display height
  let _scale   = 1;   // canvas px / image native px
  let _crop    = { x: 0, y: 0, w: 0, h: 0 };
  let _drag    = null;   // 'move'|'tl'|'tr'|'bl'|'br'
  let _origin  = null;  // pointer start {x,y}
  let _cropSnap = null; // crop snapshot at drag start

  const MIN_CROP  = 50;
  const HANDLE_R  = 18; // hit-test radius (CSS px)
  const HANDLE_VR = 7;  // visual radius

  function getCanvasPos(e) {
    const rect = _canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (_canvas.width  / rect.width),
      y: (src.clientY - rect.top)  * (_canvas.height / rect.height),
    };
  }

  function handles() {
    const { x, y, w, h } = _crop;
    return {
      tl: { x,     y     },
      tr: { x:x+w, y     },
      bl: { x,     y:y+h },
      br: { x:x+w, y:y+h },
    };
  }

  function hitTest(pos) {
    for (const [id, h] of Object.entries(handles())) {
      const dx = pos.x - h.x, dy = pos.y - h.y;
      if (dx*dx + dy*dy < HANDLE_R * HANDLE_R) return id;
    }
    const { x, y, w, h } = _crop;
    if (pos.x > x && pos.x < x+w && pos.y > y && pos.y < y+h) return 'move';
    return null;
  }

  function updateCrop(dx, dy) {
    const c   = { ..._cropSnap };
    const mxX = _dW, mxY = _dH;

    if (_drag === 'move') {
      c.x = clamp(c.x + dx, 0, mxX - c.w);
      c.y = clamp(c.y + dy, 0, mxY - c.h);

    } else if (_drag === 'tl') {
      const nx = clamp(c.x + dx, 0, c.x + c.w - MIN_CROP);
      const ny = clamp(c.y + dy, 0, c.y + c.h - MIN_CROP);
      c.w += c.x - nx; c.h += c.y - ny;
      c.x = nx; c.y = ny;

    } else if (_drag === 'tr') {
      c.w = clamp(c.w + dx, MIN_CROP, mxX - c.x);
      const ny = clamp(c.y + dy, 0, c.y + c.h - MIN_CROP);
      c.h += c.y - ny; c.y = ny;

    } else if (_drag === 'bl') {
      const nx = clamp(c.x + dx, 0, c.x + c.w - MIN_CROP);
      c.w += c.x - nx; c.x = nx;
      c.h = clamp(c.h + dy, MIN_CROP, mxY - c.y);

    } else if (_drag === 'br') {
      c.w = clamp(c.w + dx, MIN_CROP, mxX - c.x);
      c.h = clamp(c.h + dy, MIN_CROP, mxY - c.y);
    }
    _crop = c;
  }

  function draw() {
    const ctx = _ctx;
    const { x, y, w, h } = _crop;

    ctx.clearRect(0, 0, _dW, _dH);

    // Dimmed image outside crop
    ctx.globalAlpha = 0.35;
    ctx.drawImage(_img, 0, 0, _dW, _dH);
    ctx.globalAlpha = 1;

    // Dark vignette outside crop
    ctx.fillStyle = 'rgba(0,0,0,0.50)';
    ctx.fillRect(0, 0, _dW, _dH);

    // Full-brightness image clipped to crop rect
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(_img, 0, 0, _dW, _dH);
    ctx.restore();

    // Crop border
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth   = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

    // Rule-of-thirds guide lines
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth   = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(x + w * i/3, y); ctx.lineTo(x + w * i/3, y+h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + h * i/3); ctx.lineTo(x+w, y + h * i/3); ctx.stroke();
    }

    // Corner handles
    for (const h of Object.values(handles())) {
      ctx.beginPath();
      ctx.arc(h.x, h.y, HANDLE_VR, 0, Math.PI * 2);
      ctx.fillStyle   = 'white';
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth   = 2;
      ctx.fill();
      ctx.stroke();
    }
  }

  function onPointerDown(e) {
    e.preventDefault();
    const pos = getCanvasPos(e);
    _drag = hitTest(pos);
    if (!_drag) return;
    _canvas.setPointerCapture(e.pointerId);
    _origin   = pos;
    _cropSnap = { ..._crop };
  }

  function onPointerMove(e) {
    e.preventDefault();
    if (!_drag) {
      const hit = hitTest(getCanvasPos(e));
      const cursors = { tl:'nwse-resize', tr:'nesw-resize', bl:'nesw-resize', br:'nwse-resize', move:'move' };
      _canvas.style.cursor = cursors[hit] || 'crosshair';
      return;
    }
    const pos = getCanvasPos(e);
    updateCrop(pos.x - _origin.x, pos.y - _origin.y);
    draw();
  }

  function onPointerUp(e) {
    _drag = _origin = _cropSnap = null;
  }

  function init(img) {
    _img    = img;
    _canvas = $('crop-canvas');
    _ctx    = _canvas.getContext('2d');

    // Use window width to avoid reading clientWidth before layout settles
    const cardPadding = 64; // card padding + page margins
    const maxW = Math.min(window.innerWidth - cardPadding, 640);
    const maxH = Math.min(window.innerHeight * 0.5, 420);
    const ratio  = img.naturalHeight / img.naturalWidth;

    let cw = maxW;
    let ch = Math.round(cw * ratio);
    if (ch > maxH) { ch = maxH; cw = Math.round(ch / ratio); }

    _canvas.width         = cw;
    _canvas.height        = ch;
    _canvas.style.width   = cw + 'px';
    _canvas.style.height  = ch + 'px';
    _dW    = cw;
    _dH    = ch;
    _scale = cw / img.naturalWidth;

    // Default selection: centre 75%
    const pad = 0.125;
    _crop = {
      x: Math.round(cw * pad),
      y: Math.round(ch * pad),
      w: Math.round(cw * (1 - pad * 2)),
      h: Math.round(ch * (1 - pad * 2)),
    };

    _canvas.addEventListener('pointerdown',  onPointerDown, { passive: false });
    _canvas.addEventListener('pointermove',  onPointerMove, { passive: false });
    _canvas.addEventListener('pointerup',    onPointerUp);
    _canvas.addEventListener('pointercancel',onPointerUp);
    // Touch fallback
    _canvas.addEventListener('touchstart',  e => e.preventDefault(), { passive: false });

    draw();
  }

  function destroy() {
    if (!_canvas) return;
    _canvas.removeEventListener('pointerdown',  onPointerDown);
    _canvas.removeEventListener('pointermove',  onPointerMove);
    _canvas.removeEventListener('pointerup',    onPointerUp);
    _canvas.removeEventListener('pointercancel',onPointerUp);
  }

  // Return the cropped image as an offscreen canvas
  function extractCroppedCanvas() {
    const ix = Math.round(_crop.x / _scale);
    const iy = Math.round(_crop.y / _scale);
    const iw = Math.round(_crop.w / _scale);
    const ih = Math.round(_crop.h / _scale);

    const MAX   = 480;
    const scale = Math.min(1, MAX / Math.max(iw, ih));
    const ow    = Math.round(iw * scale);
    const oh    = Math.round(ih * scale);

    const off = document.createElement('canvas');
    off.width  = ow;
    off.height = oh;
    off.getContext('2d').drawImage(_img, ix, iy, iw, ih, 0, 0, ow, oh);
    return { canvas: off, w: ow, h: oh };
  }

  return { init, destroy, extractCroppedCanvas };
})();

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

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      // Show crop screen
      Crop.destroy();
      showScreen('screen-crop');
      // Small delay ensures the screen is visible and layout is settled
      setTimeout(() => Crop.init(img), 60);
    };

    img.onerror = () => {
      alert('Could not read the image. Please try a different file.');
    };

    img.src = url;
  }

  function runAnalysisOnCanvas(cropped) {
    const { canvas, w, h } = cropped;
    const result   = analyseImageData(canvas.getContext('2d').getImageData(0, 0, w, h));
    result._canvas = canvas;
    result._w      = w;
    result._h      = h;
    return result;
  }

  function confirmCrop() {
    const cropped = Crop.extractCroppedCanvas();
    Crop.destroy();

    // Switch to upload screen in analysing state
    showScreen('screen-upload');
    $('upload-zone').style.display     = 'none';
    $('analysing-state').style.display = 'flex';
    activateStep('step-load');

    setTimeout(() => activateStep('step-coverage'), 300);
    setTimeout(() => activateStep('step-texture'),  700);
    setTimeout(() => activateStep('step-edges'),    1100);
    setTimeout(() => activateStep('step-regions'),  1500);
    setTimeout(() => {
      activateStep('step-score');
      const result = runAnalysisOnCanvas(cropped);
      setTimeout(() => renderResults(result), 600);
    }, 1900);
  }

  function reupload() {
    Crop.destroy();
    resetUpload();
    showScreen('screen-upload');
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
      if (mask[i] === 2) {
        // Hair: teal-green
        ovD.data[i*4]=0;   ovD.data[i*4+1]=210; ovD.data[i*4+2]=120; ovD.data[i*4+3]=140;
      } else if (mask[i] === 1) {
        // Scalp: orange
        ovD.data[i*4]=255; ovD.data[i*4+1]=120; ovD.data[i*4+2]=40;  ovD.data[i*4+3]=100;
      } else {
        // Background/excluded: dim dark veil so user can see it's ignored
        ovD.data[i*4]=0;   ovD.data[i*4+1]=0;   ovD.data[i*4+2]=0;   ovD.data[i*4+3]=140;
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

    // Auto-save to Firestore
    const saveEl = $('save-status');
    if (saveEl) saveEl.textContent = 'Saving…';
    saveScan(result, band);
  }

  async function showHistory() {
    showScreen('screen-history');
    const list = $('history-list');
    list.innerHTML = '<div class="history-loading">Loading&hellip;</div>';
    const user = fbAuth.currentUser;
    if (!user) { list.innerHTML = '<div class="history-error">Not logged in.</div>'; return; }

    try {
      const snap = await fbDb.collection('scans')
        .where('userId', '==', user.uid)
        .get();

      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const at = a.date ? a.date.toMillis() : 0;
          const bt = b.date ? b.date.toMillis() : 0;
          return bt - at;
        });

      if (docs.length === 0) {
        list.innerHTML = '<div class="history-empty">No scans yet. <a href="#" onclick="App.start();return false;">Analyse your first photo</a></div>';
        return;
      }

      list.innerHTML = '';
      docs.forEach(d => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
          <div class="history-item-left">
            <span class="history-badge badge-${d.band}">${d.bandLabel}</span>
            <span class="history-date">${formatDate(d.date)}</span>
          </div>
          <div class="history-item-right">
            <span class="history-score">${d.score}</span>
            <span class="history-score-label">/ 100</span>
          </div>
          <div class="history-item-metrics">
            <span>Coverage: ${d.coveragePct}%</span>
            <span>Texture: ${d.texturePct}%</span>
            <span>Edge: ${d.edgeDensity}</span>
            <span>Variance: ${d.stdDev}</span>
          </div>`;
        list.appendChild(item);
      });
    } catch (err) {
      list.innerHTML = '<div class="history-error">Failed to load history. Please try again.</div>';
      console.error(err);
    }
  }

  function resetUpload() {
    $('upload-zone').style.display     = 'block';
    $('analysing-state').style.display = 'none';
    $('file-input').value              = '';
    document.querySelectorAll('.a-step').forEach(s => s.classList.remove('active', 'done'));
  }

  function start()   { showScreen('screen-upload'); }
  function restart() { Crop.destroy(); resetUpload(); showScreen('screen-intro'); }
  function print()   { window.print(); }

  document.addEventListener('DOMContentLoaded', () => {
    initUploadListeners();

    // Auth state: gate all screens behind login
    fbAuth.onAuthStateChanged(user => {
      const headerUser = $('header-user');
      const headerBadge = $('header-badge');
      if (user) {
        headerUser.style.display  = 'flex';
        headerBadge.style.display = 'none';
        $('user-email').textContent = user.email.split('@')[0];
        showScreen('screen-intro');
      } else {
        headerUser.style.display  = 'none';
        headerBadge.style.display = 'block';
        showScreen('screen-auth');
      }
    });
  });

  return { start, restart, print, confirmCrop, reupload, showHistory };
})();
