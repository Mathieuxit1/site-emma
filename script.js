window.addEventListener('load', () => {
  const p = document.querySelector('.reveal');
  let i = 0;
  const text = p.textContent;
  p.textContent = '';

  function typeWriter() {
    if(i < text.length) {
      p.textContent += text.charAt(i);
      i++;
      setTimeout(typeWriter, 40);
    }
  }
  typeWriter();
});
