import { useEffect, useRef } from "react";

export default function DnaStrip() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    function resize() {
      canvas.width  = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const PAIRS = 24;
    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const W = canvas.width, H = canvas.height;
      const cx = H / 2;

      for (let i = 0; i < PAIRS; i++) {
        const x = (i / (PAIRS - 1)) * W;
        const angle = (i / PAIRS) * Math.PI * 4 - t;
        const yA = cx + Math.sin(angle) * (cx * 0.6);
        const yB = cx + Math.sin(angle + Math.PI) * (cx * 0.6);
        const depthA = (Math.sin(angle) + 1) / 2;
        const depthB = (Math.sin(angle + Math.PI) + 1) / 2;

        ctx.beginPath();
        ctx.moveTo(x, yA); ctx.lineTo(x, yB);
        ctx.strokeStyle = `rgba(220,38,38,${0.06 + depthA * 0.08})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        const drawNode = (y, depth) => {
          const r = 3 + depth * 2;
          const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
          grad.addColorStop(0, '#fff');
          grad.addColorStop(0.5, `rgba(248,113,113,${0.7 + depth * 0.3})`);
          grad.addColorStop(1, `rgba(185,28,28,${0.5 + depth * 0.5})`);
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = grad; ctx.fill();
          if (depth > 0.7) {
            ctx.beginPath(); ctx.arc(x, y, r + 3, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(220,38,38,${(depth - 0.7) * 0.5})`;
            ctx.lineWidth = 1; ctx.stroke();
          }
        };

        if (depthA >= depthB) { drawNode(yB, depthB); drawNode(yA, depthA); }
        else { drawNode(yA, depthA); drawNode(yB, depthB); }
      }
      t += 0.018;
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="dna-canvas" />;
}