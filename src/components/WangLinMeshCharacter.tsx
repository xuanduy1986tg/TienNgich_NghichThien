import React, { useEffect, useRef } from 'react';

export interface WangLinMeshConfig {
  gridRes?: number;
  maskY?: number;
  maskRadius?: number;
  waveAmp?: number;
  waveSpeed?: number;
  waveFreq?: number;
  floatHeight?: number;
  breathScale?: number;
  tilt?: number;
  particleCount?: number;
  particleColor?: string;
  imageSrc?: string;
}

interface WangLinMeshCharacterProps {
  className?: string;
  width?: number;
  height?: number;
  config?: WangLinMeshConfig;
  interactive?: boolean;
}

interface Vertex {
  u: number;
  v: number;
  x: number;
  y: number;
  weight: number;
  currentX: number;
  currentY: number;
}

interface Particle {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export const WangLinMeshCharacter: React.FC<WangLinMeshCharacterProps> = ({
  className = '',
  width = 460,
  height = 560,
  config = {},
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mergedConfig = {
      gridRes: 14,
      maskY: 0.35,
      maskRadius: 0.28,
      waveAmp: 14,
      waveSpeed: 1.2,
      waveFreq: 1.0,
      floatHeight: 16,
      breathScale: 0.015,
      tilt: 8,
      particleCount: 75,
      particleColor: '#7dd3fc',
      imageSrc: '/assets/aistudio/images__6__73922a53.jpg',
      ...config,
    };

    let animationFrameId: number;
    let isDestroyed = false;

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - (rect.left + rect.width / 2);
      mouse.targetY = e.clientY - (rect.top + rect.height / 2);
    };

    const handlePointerLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = mergedConfig.imageSrc;

    let vertices: Vertex[] = [];
    let triangles: number[][] = [];
    let particles: Particle[] = [];

    const buildMesh = () => {
      vertices = [];
      triangles = [];
      const rows = mergedConfig.gridRes;
      const cols = mergedConfig.gridRes;
      const w = width;
      const h = height;

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const u = c / cols;
          const v = r / rows;
          const x = u * w;
          const y = v * h;
          const faceX = w * 0.5;
          const faceY = h * mergedConfig.maskY;
          const maskR = Math.min(w, h) * mergedConfig.maskRadius;
          const dist = Math.hypot(x - faceX, y - faceY);

          // Mask face so Vương Lâm's face remains noble and undisturbed
          let weight = dist > maskR ? Math.min(1, (dist - maskR) / (maskR * 1.2)) : 0;
          // Clothes and hair lower down have stronger waving sway
          weight *= Math.pow(v, 1.2);

          vertices.push({ u, v, x, y, weight, currentX: x, currentY: y });
        }
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i0 = r * (cols + 1) + c;
          const i1 = i0 + 1;
          const i2 = (r + 1) * (cols + 1) + c;
          const i3 = i2 + 1;
          triangles.push([i0, i1, i2], [i1, i3, i2]);
        }
      }
    };

    const initParticles = () => {
      particles = Array.from({ length: mergedConfig.particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speedY: -(Math.random() * 1.2 + 0.4),
        speedX: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.8 + 0.2,
        life: 0,
        maxLife: Math.random() * 150 + 80,
      }));
    };

    const drawTexturedTriangle = (v0: Vertex, v1: Vertex, v2: Vertex) => {
      const w = img.width;
      const h = img.height;

      const x0 = v0.currentX;
      const y0 = v0.currentY;
      const x1 = v1.currentX;
      const y1 = v1.currentY;
      const x2 = v2.currentX;
      const y2 = v2.currentY;

      const u0 = v0.u * w;
      const uv0 = v0.v * h;
      const u1 = v1.u * w;
      const uv1 = v1.v * h;
      const u2 = v2.u * w;
      const uv2 = v2.v * h;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.clip();

      const delta = u0 * (uv1 - uv2) - uv0 * (u1 - u2) + (u1 * uv2 - u2 * uv1);
      if (Math.abs(delta) < 0.0001) {
        ctx.restore();
        return;
      }

      const a = (x0 * (uv1 - uv2) + x1 * (uv2 - uv0) + x2 * (uv0 - uv1)) / delta;
      const b = (y0 * (uv1 - uv2) + y1 * (uv2 - uv0) + y2 * (uv0 - uv1)) / delta;
      const c = (u0 * (x1 - x2) + u1 * (x2 - x0) + u2 * (x0 - x1)) / delta;
      const d = (u0 * (y1 - y2) + u1 * (y2 - y0) + u2 * (y0 - y1)) / delta;
      const e =
        (x0 * (u1 * uv2 - u2 * uv1) - u0 * (x1 * uv2 - x2 * uv1) + uv0 * (x1 * u2 - x2 * u1)) / delta;
      const f =
        (y0 * (u1 * uv2 - u2 * uv1) - u0 * (y1 * uv2 - y2 * uv1) + uv0 * (y1 * u2 - y2 * u1)) / delta;

      ctx.transform(a, b, c, d, e, f);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    };

    const animate = (time: number) => {
      if (isDestroyed) return;

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Ethereal hovering & breathing motion
      const floatY = Math.sin(time * 0.002 * mergedConfig.waveSpeed) * mergedConfig.floatHeight;
      const breathScale =
        1 + Math.cos(time * 0.0015 * mergedConfig.waveSpeed) * mergedConfig.breathScale;
      const tiltAngle = (mouse.x / (width / 2)) * ((mergedConfig.tilt * Math.PI) / 180);

      // Ambient Celestial Backlight Glow
      const glowGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45 + floatY,
        20,
        width * 0.5,
        height * 0.45 + floatY,
        width * 0.45
      );
      glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      glowGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.12)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Update 2D Mesh Vertices with harmonic wave deformation
      for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        const origX = v.u * width;
        const origY = v.v * height;

        // Wave equations for cloth, hair, and sleeves
        const waveX =
          Math.sin(time * 0.003 * mergedConfig.waveSpeed + v.v * 10 * mergedConfig.waveFreq) *
          mergedConfig.waveAmp *
          v.weight;
        const waveY =
          Math.cos(time * 0.0025 * mergedConfig.waveSpeed + v.u * 8 * mergedConfig.waveFreq) *
          (mergedConfig.waveAmp * 0.4) *
          v.weight;

        const centerX = width * 0.5;
        const centerY = height * mergedConfig.maskY;

        let px = (origX - centerX) * breathScale + centerX + waveX;
        let py = (origY - centerY) * breathScale + centerY + floatY + waveY;

        // Parallax tilt around character center
        const dx = px - centerX;
        const dy = py - centerY;
        px = centerX + dx * Math.cos(tiltAngle) - dy * Math.sin(tiltAngle);
        py = centerY + dx * Math.sin(tiltAngle) + dy * Math.cos(tiltAngle);

        v.currentX = px;
        v.currentY = py;
      }

      // Draw Mesh Triangles with Affine Mapping
      for (let i = 0; i < triangles.length; i++) {
        const tri = triangles[i];
        drawTexturedTriangle(vertices[tri[0]], vertices[tri[1]], vertices[tri[2]]);
      }

      // Draw Ascending Spiritual Qi Particles
      ctx.fillStyle = mergedConfig.particleColor;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX + Math.sin(p.life * 0.04) * 0.3;
        p.y += p.speedY;
        p.life++;

        if (p.life > p.maxLife - 30) p.alpha *= 0.94;
        if (p.y < -10 || p.alpha < 0.02 || p.life >= p.maxLife) {
          p.x = Math.random() * width;
          p.y = height + 20;
          p.alpha = Math.random() * 0.8 + 0.2;
          p.life = 0;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = mergedConfig.particleColor;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    img.onload = () => {
      if (isDestroyed) return;
      buildMesh();
      initParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [width, height, interactive, config]);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block max-w-full h-auto drop-shadow-[0_10px_35px_rgba(56,189,248,0.25)] pointer-events-none"
      />
    </div>
  );
};
