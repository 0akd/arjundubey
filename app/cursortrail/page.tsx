"use client"
import { CSSProperties, useEffect, useRef } from "react";

import { cursorTrail } from "./trail";

export interface CursorTrailCanvasProps {
  color?: string;
  className?: string;
  style?: CSSProperties;
}

function CursorTrailCanvas(props: CursorTrailCanvasProps) {
  const refCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!refCanvas.current) return;
    
    const { cleanUp, renderTrailCursor } = cursorTrail({
      ref: refCanvas as React.RefObject<HTMLCanvasElement>,
      color: '#0080FF' ,
    });
    renderTrailCursor();

    return () => {
      cleanUp();
    };
  }, [props.color]);

  return (
    <canvas
      ref={refCanvas}
      className={props.className}
      style={props.style}
    ></canvas>
  );
}

// Default export for Next.js page
export default function CursorTraillCanvas({ className }: CursorTrailCanvasProps) {
  return (
    <div className="">
      <CursorTrailCanvas 
        className="w-full h-full"
        style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}
      />
    </div>
  );
}