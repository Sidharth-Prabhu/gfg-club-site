import React, { useEffect, useRef } from 'react';

const NeuralBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    const dots: { x: number; y: number }[] = [];
    const spacing = 45;

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

      dots.length = 0;
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          dots.push({ x, y });
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

      dots.forEach((dot) => {
        const dist = Math.sqrt(Math.pow(dot.x - width / 2, 2) + Math.pow(dot.y - height / 2, 2));
        const pulse = Math.sin(time - dist * 0.003);
        const size = 2.2 + pulse * 0.8;
        const opacity = 0.15 + (pulse + 1) * 0.15;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, size, 0, Math.PI * 10);
        // Using a slightly more vibrant GfG green
        ctx.fillStyle = `rgba(47, 141, 70, ${opacity})`;
        ctx.fill();
      });

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
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <canvas
        ref={canvasRef}
        className="block"
      />
    </div>
  );
};

export default NeuralBackground;
