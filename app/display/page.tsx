"use client"
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

export default function GameCharacter() {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [facingLeft, setFacingLeft] = useState(false);
  const step = 10;
  const characterSize = 64;
  const containerRef = useRef<HTMLDivElement>(null);

  const getBounds = () => {
    const container = containerRef.current;
    return container ? container.getBoundingClientRect() : { width: 0, height: 0 };
  };

  const moveCharacter = (dx: number, dy: number) => {
    const { width, height } = getBounds();
    setPosition((prev) => {
      const newX = Math.max(0, Math.min(prev.x + dx, width - characterSize));
      const newY = Math.max(0, Math.min(prev.y + dy, height - characterSize));
      return { x: newX, y: newY };
    });

    // Update facing direction
    if (dx < 0) setFacingLeft(true);
    if (dx > 0) setFacingLeft(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          moveCharacter(0, -step);
          break;
        case 'ArrowDown':
          moveCharacter(0, step);
          break;
        case 'ArrowLeft':
          moveCharacter(-step, 0);
          break;
        case 'ArrowRight':
          moveCharacter(step, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] border rounded-md bg-gray-100 overflow-hidden"
    >
      {/* Character */}
      <img
        src="/images/arjun.png"
        alt="Character"
        className={`absolute w-16 h-16 transition-all duration-150 ${
          facingLeft ? '-scale-x-100' : 'scale-x-100'
        }`}
        style={{ left: position.x, top: position.y }}
      />

      {/* Controls (optional) */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
        <button onClick={() => moveCharacter(0, -step)} className="p-2 bg-white rounded shadow">
          <ArrowUp />
        </button>
        <div className="flex gap-2">
          <button onClick={() => moveCharacter(-step, 0)} className="p-2 bg-white rounded shadow">
            <ArrowLeft />
          </button>
          <button onClick={() => moveCharacter(0, step)} className="p-2 bg-white rounded shadow">
            <ArrowDown />
          </button>
          <button onClick={() => moveCharacter(step, 0)} className="p-2 bg-white rounded shadow">
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
