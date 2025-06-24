"use client";
import React, { useEffect, useRef, useState } from 'react';

// Bright Blinking Particle Background Component
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    // Particle class
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      blinkSpeed: number;
      blinkOffset: number;
      time: number;
      
      constructor() {
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = Math.random() * (canvas?.height || window.innerHeight);
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 3 ; // Slightly larger particles
        this.opacity = 1;
        this.blinkSpeed = Math.random() * 0.15 + 0.05; // Random blink speed
        this.blinkOffset = Math.random() * Math.PI * 2; // Random start phase
        this.time = 0;
      }

      update() {
        if (!canvas) return;
        this.x += this.vx;
        this.y += this.vy;
        this.time += this.blinkSpeed;

        // Create intense blinking effect with bright blue
        const blinkIntensity = (Math.sin(this.time + this.blinkOffset) + 1) / 2;
        this.opacity = 0.3 + blinkIntensity * 0.7; // Range from 0.3 to 1.0

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        
        // Create glowing effect with multiple layers
  const colors = [
  `rgba(0, 120, 180, ${this.opacity})`,      // Dimmer electric blue
  `rgba(0, 180, 180, ${this.opacity * 0.7})`, // Softer cyan
  `rgba(100, 160, 200, ${this.opacity * 0.5})` // Milder sky blue
];

        
        // Draw multiple circles for glow effect
        colors.forEach((color, index) => {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size + index * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          
          // Add extra bright core
          if (index === 0 && this.opacity > 0.8) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.8})`; // White hot core
            ctx.fill();
          }
        });
      }
    }

    // Create particles
    const particles: Particle[] = [];
    const particleCount = 60; // Slightly fewer but brighter particles

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections between nearby particles with blinking effect
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const distance = Math.sqrt(
            Math.pow(particle.x - otherParticle.x, 2) +
            Math.pow(particle.y - otherParticle.y, 2)
          );

          if (distance < 120) {
            const connectionOpacity = (particle.opacity + otherParticle.opacity) / 2;
            const lineIntensity = 0.3 * (1 - distance / 120) * connectionOpacity;
            
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            
            // Bright electric blue connections
            ctx.strokeStyle = `rgba(0, 191, 255, ${lineIntensity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // Add cyan glow to connections
            ctx.strokeStyle = `rgba(0, 255, 255, ${lineIntensity * 0.5})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

// Client-side wrapper to avoid SSR issues
const ClientParticles = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ParticleBackground />;
};

export default ClientParticles;