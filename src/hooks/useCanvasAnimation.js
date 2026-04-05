import { useEffect } from "react";

export default function useCanvasAnimation(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    let frame = 0;
    const pos = { x: canvas.width / 2, y: canvas.height / 2 };
    let lines = [];

    const E = { friction: 0.5, trails: 80, size: 50, dampening: 0.025, tension: 0.99 };

    function Phase(cfg = {}) {
      this.phase = cfg.phase || 0;
      this.offset = cfg.offset || 0;
      this.frequency = cfg.frequency || 0.001;
      this.amplitude = cfg.amplitude || 1;
    }
    Phase.prototype.update = function () {
      this.phase += this.frequency;
      return this.offset + Math.sin(this.phase) * this.amplitude;
    };

    const phaseFn = new Phase({
      phase: Math.random() * 2 * Math.PI,
      amplitude: 85, frequency: 0.0015, offset: 285,
    });

    function MNode() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; }

    function Line(spring) {
      this.spring = spring + 0.1 * Math.random() - 0.05;
      this.friction = E.friction + 0.01 * Math.random() - 0.005;
      this.nodes = Array.from({ length: E.size }, () => {
        const n = new MNode(); n.x = pos.x; n.y = pos.y; return n;
      });
    }
    Line.prototype.update = function () {
      let e = this.spring, t = this.nodes[0];
      t.vx += (pos.x - t.x) * e; t.vy += (pos.y - t.y) * e;
      for (let i = 0; i < this.nodes.length; i++) {
        t = this.nodes[i];
        if (i > 0) {
          const n = this.nodes[i - 1];
          t.vx += (n.x - t.x) * e; t.vy += (n.y - t.y) * e;
          t.vx += n.vx * E.dampening; t.vy += n.vy * E.dampening;
        }
        t.vx *= this.friction; t.vy *= this.friction;
        t.x += t.vx; t.y += t.vy;
        e *= E.tension;
      }
    };
    Line.prototype.draw = function () {
      let px = this.nodes[0].x, py = this.nodes[0].y;
      ctx.beginPath(); ctx.moveTo(px, py);
      for (let i = 1; i < this.nodes.length - 2; i++) {
        const a = this.nodes[i], b = this.nodes[i + 1];
        ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
      }
      const l = this.nodes.length;
      ctx.quadraticCurveTo(this.nodes[l - 2].x, this.nodes[l - 2].y, this.nodes[l - 1].x, this.nodes[l - 1].y);
      ctx.stroke(); ctx.closePath();
    };

    function initLines() {
      lines = Array.from({ length: E.trails }, (_, i) =>
        new Line(0.45 + (i / E.trails) * 0.025));
    }

    function render() {
      if (!running) return;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `hsla(${Math.round(phaseFn.update())},100%,50%,0.025)`;
      ctx.lineWidth = 10;
      lines.forEach(l => { l.update(); l.draw(); });
      frame++;
      requestAnimationFrame(render);
    }

    function resize() {
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let started = false;
    function onMove(e) {
      const x = e.touches ? e.touches[0].pageX : e.clientX;
      const y = e.touches ? e.touches[0].pageY : e.clientY;
      pos.x = x; pos.y = y;
      if (!started) { started = true; initLines(); render(); }
      e.preventDefault();
    }
    document.addEventListener('mousemove', onMove, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });

    return () => {
      running = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);
}