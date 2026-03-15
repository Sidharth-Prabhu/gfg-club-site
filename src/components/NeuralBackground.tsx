import React, { useEffect, useRef } from 'react';

interface NeuralBackgroundProps {
  variant?: 'dots' | 'lines';
  opacity?: number;
}

const NeuralBackground: React.FC<NeuralBackgroundProps> = ({ variant = 'dots', opacity: customOpacity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    
    // For dots variant
    const dots: { x: number; y: number }[] = [];
    const spacing = 45;

    // For lines variant
    let particles: any[] = [];
    const particleCount = 50;
    const connectionDistance = 150;

    class Particle {
      x: number; y: number; vx: number; vy: number; size: number;
      constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
      }
      update(width: number, height: number) {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = 'rgba(47, 141, 70, 0.3)';
        context.fill();
      }
    }

    const init = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const width = parent.offsetWidth;
      const height = parent.offsetHeight;
      
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      if (variant === 'dots') {
        dots.length = 0;
        for (let x = spacing / 2; x < width; x += spacing) {
          for (let y = spacing / 2; y < height; y += spacing) {
            dots.push({ x, y });
          }
        }
      } else {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle(width, height));
        }
      }
    };

    const animate = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const width = parent.offsetWidth;
      const height = parent.offsetHeight;
      
      ctx.clearRect(0, 0, width, height);
      time += 0.015;

      if (variant === 'dots') {
        dots.forEach((dot) => {
          // Create a traveling wave effect
          const waveX = Math.sin(time + dot.x * 0.01) * 10;
          const waveY = Math.cos(time + dot.y * 0.01) * 10;
          
          const dist = Math.sqrt(Math.pow(dot.x - width / 2, 2) + Math.pow(dot.y - height / 2, 2));
          const pulse = Math.sin(time * 2 - dist * 0.005);
          
          const size = 2.5 + pulse * 1.2;
          // Increased opacity as requested
          const opacity = 0.3 + (pulse + 1) * 0.25;

          ctx.beginPath();
          ctx.arc(dot.x + waveX, dot.y + waveY, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(47, 141, 70, ${opacity})`;
          ctx.fill();
        });
      } else {
        particles.forEach((p, i) => {
          p.update(width, height);
          p.draw(ctx);
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectionDistance) {
              ctx.beginPath();
              // Increased line opacity
              const lineOpacity = 0.4 * (1 - dist / connectionDistance);
              ctx.strokeStyle = `rgba(47, 141, 70, ${lineOpacity})`;
              ctx.lineWidth = 1.5;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      init();
    };

    window.addEventListener('resize', handleResize);
    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [variant]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden" style={{ zIndex: 0, opacity: customOpacity }}>
      <canvas
        ref={canvasRef}
        className="block"
      />
    </div>
  );
};

export default NeuralBackground;
