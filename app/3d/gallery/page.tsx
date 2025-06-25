"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, PerspectiveCamera } from "@react-three/drei";
import { Mesh } from "three";

// Array of model file paths
const modelPaths = [
  "/scene/arjun.gltf",
  "/scene/lastdance.gltf",
   "/scene/3d.gltf",
  // Add more model paths as needed
];

// Revolution animation configuration
const REVOLUTION_SPEED = 0.4; // Speed of revolution (radians per second)
const BASE_RADIUS = 40; // Increased base radius for all models to orbit at same distance

function MeshComponent({ 
  modelPath, 
  modelIndex, 
  totalModels,
  onModelLoaded
}: { 
  modelPath: string; 
  modelIndex: number; 
  totalModels: number;
  onModelLoaded: () => void;
}) {
  const mesh = useRef<Mesh>(null!);
  const modelRef = useRef<Mesh>(null!);
  const [modelLoaded, setModelLoaded] = useState(false);
  const gltf = useGLTF(modelPath);
  
  // All models use the same orbit radius (BASE_RADIUS)
  const orbitRadius = BASE_RADIUS;
  const initialAngle = (modelIndex / totalModels) * Math.PI * 2; // Evenly distribute around circle
  
  // Notify parent when model is loaded
  useEffect(() => {
    if (gltf.scene && !modelLoaded) {
      setModelLoaded(true);
      onModelLoaded();
    }
  }, [gltf.scene, modelLoaded, onModelLoaded]);
  
  // Revolution animation using useFrame
  useFrame((state) => {
    if (mesh.current && modelLoaded) {
      const time = state.clock.getElapsedTime();
      
      // Calculate revolution position with unique starting angle for each model
      const angle = (time * REVOLUTION_SPEED) + initialAngle;
      const x = Math.cos(angle) * orbitRadius;
      const z = Math.sin(angle) * orbitRadius;
      
      // Update mesh position for revolution
      mesh.current.position.set(x, 0, z);
    }
  });

  // Only render if model is loaded
  if (!modelLoaded) return null;

  return (
    <mesh ref={mesh}>
      <mesh 
        ref={modelRef}
        rotation={[Math.PI / 2, (90 * Math.PI) / 180, 0]} // [90° on X-axis, 80° on Y-axis, 0° on Z-axis]
      >
        <primitive object={gltf.scene} />
      </mesh>
    </mesh>
  );
}

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center  z-10">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4rounded-full animate-spin border-t-transparent"></div>
        </div>
        <div className=" text-sm font-medium">Loading 3D Models...</div>
        <div className=" text-xs">This may take a moment</div>
      </div>
    </div>
  );
}

export default function Shiba() {
  const [loadedModelsCount, setLoadedModelsCount] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const handleModelLoaded = () => {
    setLoadedModelsCount(prev => {
      const newCount = prev + 1;
      // Show content as soon as first model loads
      if (newCount === 1) {
        setShowContent(true);
      }
      return newCount;
    });
  };

  return (
    <div className='w-full h-48 sm:h-56 md:h-64 rounded-lg  shadow-sm relative'>
      {/* Loading indicator - shows until at least one model is loaded */}
      {!showContent && <LoadingSpinner />}
      
      <Canvas>
        {/* Camera with custom position - adjusted for single orbit radius */}
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 70]} // Adjusted for the increased base radius
          fov={50} // Field of view to capture all models
        />
        
        {/* OrbitControls for interactive camera movement */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={30}
          maxDistance={300}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          autoRotate={false}
          autoRotateSpeed={2}
        />
        
        {/* Enhanced Lighting Setup for Clear Visibility */}
        <ambientLight intensity={1000} color="#ffffff" />
        
        <directionalLight 
          position={[0, 10, 30]} 
          intensity={10} 
          color="#ffffff"
          castShadow={false}
        />
        
   
        
        <pointLight 
          position={[30, 10, 20]} 
          intensity={0.8} 
          color="#f0f0f0"
          distance={150}
          decay={1}
        />
        
        <pointLight 
          position={[10, 40, 25]} 
          intensity={0.6} 
          color="#ffffff"
          distance={200}
          decay={1}
        />
        
       
        
        {/* Render all models orbiting at the same radius */}
        {modelPaths.map((modelPath, index) => (
          <MeshComponent 
            key={modelPath}
            modelPath={modelPath} 
            modelIndex={index}
            totalModels={modelPaths.length}
            onModelLoaded={handleModelLoaded}
          />
        ))}
      </Canvas>
    </div>
  );
}