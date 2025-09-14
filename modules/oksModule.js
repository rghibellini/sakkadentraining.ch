// oksModule.js
let oksAnimationFrame = null;

export const oksModule = {
  startOKSAnimation(canvas, modeSettings) {
    if (!canvas || !modeSettings.oks) return;

    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr); // Apply DPR scaling
    
    const speedFactor = 80; // ← change this to whatever you want
    const speed = (modeSettings.oksSpeed || 0.5) * speedFactor / 60;

    const numDots = modeSettings.oksNumDots || 100;
    const dotSize = (modeSettings.oksDotSize || 2) * dpr;
    const direction = modeSettings.oksDirection || 'left';
    const radius = dotSize * 5;

    let dots = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (numDots === 1) {
        dots.push({ x: centerX, y: centerY });
    } else if (numDots === 2) {
        dots.push({ x: centerX, y: canvas.height * 0.25 });
        dots.push({ x: centerX, y: canvas.height * 0.75 });
    } else if (numDots === 3) {
        dots.push({ x: centerX, y: canvas.height * 0.2 });
        dots.push({ x: centerX, y: centerY });
        dots.push({ x: centerX, y: canvas.height * 0.8 });
    } else if (numDots === 4) {
        dots.push({ x: canvas.width * 0.25, y: canvas.height * 0.25 });
        dots.push({ x: canvas.width * 0.75, y: canvas.height * 0.25 });
        dots.push({ x: canvas.width * 0.25, y: canvas.height * 0.75 });
        dots.push({ x: canvas.width * 0.75, y: canvas.height * 0.75 });
    } else {
        // fallback: random dots if no special layout
        for (let i = 0; i < numDots; i++) {
            dots.push({ 
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            });
        }
    }         

    function animate() {
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        dots.forEach(dot => {
            dot.x += (direction === 'right' ? speed : -speed) / dpr;
            if (dot.x > canvas.width / dpr + radius) dot.x = -radius;
            if (dot.x < -radius) dot.x = canvas.width / dpr + radius;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgb(255, 191, 0)';
            ctx.fill();
        });
        oksAnimationFrame = requestAnimationFrame(animate);
    }

    animate();
  },

  stopOKSAnimation() {
    const canvas = document.getElementById('oksCanvas');
    if (oksAnimationFrame) {
      cancelAnimationFrame(oksAnimationFrame);
      oksAnimationFrame = null;
    }
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }  
};
