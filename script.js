const intro = document.getElementById('introScreen');
const letter = document.getElementById('letterScreen');
const btn = document.getElementById('playButton');
const music = document.getElementById('bgMusic');
const canvas = document.getElementById('heartsCanvas');
const ctx = canvas.getContext('2d');
const p = document.querySelector('.reveal');

// Prépare le texte (par mots pour un rendu plus doux et contrôlé)
const fullText = p.textContent.trim();
const words = fullText.split(/\s+/); // découpe propre (espaces, sauts de ligne)
p.textContent = '';

// Canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Coeurs
let hearts = [];
function createHeart() {
  hearts.push({
    x: Math.random() * canvas.width,
    y: canvas.height + 10,
    size: 10 + Math.random() * 10,
    speed: 1 + Math.random() * 2,
    opacity: 0.7 + Math.random() * 0.3
  });
}
function drawHearts() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hearts.forEach((h, i) => {
    ctx.fillStyle = `rgba(255,0,128,${h.opacity})`;
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.size, 0, Math.PI * 2);
    ctx.fill();
    h.y -= h.speed;
    if (h.y + h.size < 0) hearts.splice(i, 1);
  });
  requestAnimationFrame(drawHearts);
}
drawHearts();

// Easing pour adoucir l'entrée (ralentit un peu le début)
function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// Synchro temps réel: nombre de mots affichés suit le temps audio
let rafId = null;
function startSyncTyping() {
  cancelAnimationFrame(rafId);
  const totalWords = words.length;
  const duration = music.duration || 0;

  if (!duration || !isFinite(duration)) {
    music.addEventListener('loadedmetadata', startSyncTyping, { once: true });
    return;
  }

  function step() {
    const t = music.currentTime;
    let ratio = Math.min(t / duration, 1);

    // Applique un léger easing pour ralentir un peu le début
    ratio = easeInOutCubic(ratio);

    // Calcule le nombre de mots à afficher
    const wordsToShow = Math.max(0, Math.floor(ratio * totalWords));

    // Met à jour le texte uniquement si nécessaire
    if (p.dataset.count !== String(wordsToShow)) {
      p.textContent = words.slice(0, wordsToShow).join(' ');
      p.dataset.count = String(wordsToShow);

      // Coeur occasionnel
      if (Math.random() < 0.05) createHeart();
    }

    if (ratio < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      // Assure l'affichage complet à la fin
      p.textContent = fullText;
    }
  }
  step();
}

// Animation finale quand la musique se termine
music.addEventListener('ended', () => {
  cancelAnimationFrame(rafId);
  p.textContent = fullText;

  // Fondu du texte
  p.style.transition = 'opacity 3s ease';
  p.style.opacity = 0;

  // Explosion de cœurs
  for (let i = 0; i < 50; i++) {
    hearts.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 5 + Math.random() * 15,
      speed: 1 + Math.random() * 3,
      opacity: 0.5 + Math.random() * 0.5
    });
  }

  // 🎵 Fondu audio
  let fadeOut = setInterval(() => {
    if (music.volume > 0.05) {
      music.volume -= 0.05; // baisse le volume par pas
    } else {
      music.volume = 0;
      music.pause();        // stop la musique
      clearInterval(fadeOut);
    }
  }, 200); // toutes les 200 ms
});

// Lancement
btn.addEventListener('click', async () => {
  intro.style.display = 'none';
  letter.classList.remove('hidden');

  // Garantir la durée connue
  if (!isFinite(music.duration) || !music.duration) {
    await new Promise(res => {
      if (music.readyState >= 1) return res();
      music.addEventListener('loadedmetadata', res, { once: true });
    });
  }

  try {
    music.volume = 1; // remet le volume à fond au lancement
    await music.play();
  } catch (e) {
    alert('Veuillez interagir avec la page pour activer le son.');
  }

  // Démarre la synchro (et suit les pauses/reprises automatiquement)
  startSyncTyping();
});