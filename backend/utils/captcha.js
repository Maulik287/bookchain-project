const captchaStore = new Map();

// Clean up expired captchas every 5 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [id, item] of captchaStore.entries()) {
    if (now - item.timestamp > 5 * 60 * 1000) {
      captchaStore.delete(id);
    }
  }
}, 5 * 60 * 1000);

// unref() ensures this background cleanup timer will NOT prevent Node.js from exiting when scripts finish
if (cleanupTimer && typeof cleanupTimer.unref === 'function') {
  cleanupTimer.unref();
}

const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

const generateCaptcha = () => {
  let text = '';
  for (let i = 0; i < 5; i++) {
    text += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }

  const captchaId = 'cap_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  captchaStore.set(captchaId, {
    text,
    timestamp: Date.now()
  });

  // Generate SVG with noisy lines and rotated characters
  const width = 140;
  const height = 45;

  let svgTextElements = '';
  const colors = ['#818cf8', '#38bdf8', '#34d399', '#f472b6', '#fbbf24'];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const x = 18 + i * 23 + (Math.random() * 4 - 2);
    const y = 30 + (Math.random() * 4 - 2);
    const rot = (Math.random() * 30 - 15);
    const color = colors[i % colors.length];
    svgTextElements += `<text x="${x}" y="${y}" font-family="monospace" font-size="24" font-weight="bold" fill="${color}" transform="rotate(${rot}, ${x}, ${y})">${char}</text>`;
  }

  // Generate 3 noise lines
  let noiseLines = '';
  for (let j = 0; j < 3; j++) {
    const x1 = Math.floor(Math.random() * 20);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(width - Math.random() * 20);
    const y2 = Math.floor(Math.random() * height);
    const color = colors[j % colors.length];
    noiseLines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.2" stroke-opacity="0.4" />`;
  }

  // Generate noise dots
  let noiseDots = '';
  for (let k = 0; k < 12; k++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    noiseDots += `<circle cx="${cx}" cy="${cy}" r="1" fill="#64748b" opacity="0.5" />`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background: rgba(15, 23, 42, 0.95); border-radius: 6px; border: 1px solid rgba(99, 102, 241, 0.3);">
    ${noiseLines}
    ${noiseDots}
    ${svgTextElements}
  </svg>`;

  return {
    captchaId,
    captchaSvg: svg,
    // in dev mode for quick debug
    previewText: text
  };
};

const verifyCaptcha = (captchaId, userInput) => {
  if (!captchaId || !userInput) return false;
  const stored = captchaStore.get(captchaId);
  if (!stored) return false;

  // Delete captcha so it cannot be reused
  captchaStore.delete(captchaId);

  // Check expiration (5 min)
  if (Date.now() - stored.timestamp > 5 * 60 * 1000) {
    return false;
  }

  return stored.text.toUpperCase() === userInput.trim().toUpperCase();
};

module.exports = {
  generateCaptcha,
  verifyCaptcha
};

// If run directly from terminal: node backend/utils/captcha.js
if (require.main === module) {
  const cap = generateCaptcha();
  console.log('--------------------------------------------------');
  console.log('✓ CAPTCHA Test Generator');
  console.log('Generated Captcha ID:', cap.captchaId);
  console.log('CAPTCHA Text Code:   ', cap.previewText);
  console.log('Self-Verify Match:   ', verifyCaptcha(cap.captchaId, cap.previewText));
  console.log('--------------------------------------------------');
}
