const p = document.querySelector('.reveal');
const btn = document.getElementById('playButton');
const music = document.getElementById('bgMusic');
const canvas = document.getElementById('heartsCanvas');
const ctx = canvas.getContext('2d');
let text = p.textContent;
p.textContent = '';
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
  ctx.clearRect(0,0,canvas.width,canvas.height);
  hearts.forEach((h,i)=>{
    ctx.fillStyle = `rgba(255,0,128,${h.opacity})`;
    ctx.beginPath();
    ctx.moveTo(h.x,h.y);
    ctx.arc(h.x,h.y,h.size,0,Math.PI*2);
    ctx.fill();
    h.y -= h.speed;
    if(h.y + h.size < 0) hearts.splice(i,1);
  });
  requestAnimationFrame(drawHearts);
}
drawHearts();

function typeWriter() {
  let i = 0;
  function next() {
    if(i < text.length) {
      p.textContent += text.charAt(i);
      i++;
      if(Math.random() < 0.05) createHeart();
      setTimeout(next, 30);
    }
  }
  next();
}

btn.addEventListener('click', () => {
  music.play().catch(()=>alert('Veuillez interagir avec la page pour activer le son.'));
  typeWriter();
  btn.style.display = 'none';
});
