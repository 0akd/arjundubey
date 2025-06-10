"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, PerspectiveCamera } from "@react-three/drei";
import { Mesh } from "three";

function MeshComponent({ onModelLoaded }: { onModelLoaded?: () => void }) {
  const fileUrl = "/scene/scene.gltf";
  const mesh = useRef<Mesh>(null!);
  const [hasNotified, setHasNotified] = useState(false);
  
  const gltf = useGLTF(fileUrl);

  // Notify parent when model is loaded (only once)
  useEffect(() => {
    if (gltf?.scene && !hasNotified && onModelLoaded && typeof onModelLoaded === 'function') {
      setHasNotified(true);
      onModelLoaded();
    }
  }, [gltf?.scene, hasNotified, onModelLoaded]);

  // Optimized rotation animation
  useFrame(() => {
    if (mesh.current && gltf?.scene) {
      mesh.current.rotation.y += 0.008;
    }
  });

  // Don't render until model is available
  if (!gltf?.scene) return null;

  return (
    <mesh ref={mesh} position={[0, -16, 0]}>
      <primitive object={gltf.scene} />
    </mesh>
  );
}

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center  z-10">
      <div className="flex flex-col items-center ">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 border-4  rounded-full animate-spin"></div>
          {/* Inner ring */}
          <div className="absolute top-0 left-0 w-16 h-16 border-4  rounded-full animate-spin border-t-transparent"></div>
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3  rounded-full animate-pulse"></div>
        </div>
        <div className=" text-base font-semibold">Loading 3D Model</div>
        <div className=" text-sm">Please wait while we prepare your experience</div>
      </div>
    </div>
  );
}

function CanvasFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg mb-2">Loading Scene...</div>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}

export default function Shiba() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  const handleModelLoaded = () => {
    setModelLoaded(true);
    // Small delay to ensure smooth transition
    setTimeout(() => setSceneReady(true), 100);
  };

  return (
    <div className='w-full h-40 sm:h-50 md:h-60 rounded-lg overflow-hidden  relative '>
      {/* Loading indicator */}
      {!sceneReady && <LoadingSpinner />}
      
      <Suspense fallback={<CanvasFallback />}>
        <Canvas
          shadows
          camera={{ position: [5, 20, 50], fov: 70 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance" 
          }}
        >
          {/* Camera with custom position */}
          <PerspectiveCamera
            makeDefault
            position={[5, 20, 50]}
            fov={55}
          />
          
          {/* OrbitControls with optimized settings */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={10} // Increased minimum distance for better performance
            maxDistance={150} // Reduced maximum distance
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
            autoRotate={false}
            autoRotateSpeed={2}
            enableDamping={true} // Smooth camera movement
            dampingFactor={0.05}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
            panSpeed={0.8}
          />
          
          {/* Enhanced Lighting Setup */}
          <ambientLight intensity={0.4} color="#ffffff" />
          
          {/* Key light */}
          <directionalLight 
            position={[10, 10, 10]} 
            intensity={1.2} 
            color="#ffffff"
            castShadow={true}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          
          {/* Fill light */}
          <pointLight 
            position={[-10, 5, 10]} 
            intensity={0.6} 
            color="#f8f9fa"
            distance={100}
            decay={2}
          />
          
          {/* Rim light */}
          <pointLight 
            position={[0, 15, -10]} 
            intensity={0.4} 
            color="#e3f2fd"
            distance={80}
            decay={2}
          />
          
          {/* Background light */}
          <pointLight 
            position={[0, -10, 0]} 
            intensity={0.3} 
            color="#ffffff"
            distance={50}
            decay={2}
          />
          
          <MeshComponent onModelLoaded={handleModelLoaded} />
        </Canvas>
      </Suspense>
      
      {/* Optional: Loading progress indicator */}
      {!sceneReady && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="  px-3  rounded-full text-xs">
            Initializing 3D Scene...
          </div>
        </div>
      )}
    </div>
  );
}