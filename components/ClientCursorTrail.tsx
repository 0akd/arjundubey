"use client";

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

// Dynamically import the CursorTrailCanvas with no SSR
const CursorTrailCanvas = dynamic(
  () => import('@/cursortrail/page'),
  {
    ssr: false,
    loading: () => null, // No loading component needed for cursor trail
  }
);

interface ClientCursorTrailProps extends ComponentProps<'div'> {
  className?: string;
}

export default function ClientCursorTrail({ className, ...props }: ClientCursorTrailProps) {
  return <CursorTrailCanvas className={className} {...props} />;
}