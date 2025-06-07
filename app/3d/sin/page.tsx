"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, PerspectiveCamera } from "@react-three/drei";
import { Mesh } from "three";

function MeshComponent() {
  const fileUrl = "/scene/scene.gltf";
  const mesh = useRef<Mesh>(null!);
  const gltf = useGLTF(fileUrl);

  useFrame(() => {
    mesh.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={mesh}>
      <primitive object={gltf.scene} />
    </mesh>
  );
}

export default function Shiba() {
  return (
    <div className='w-full h-screen flex justify-center items-center p-4'>
      <div className='w-full max-w-6xl h-full max-h-[800px] min-h-[400px] border border-gray-200 rounded-lg overflow-hidden'>
        <Canvas>
          {/* Camera with custom position */}
          <PerspectiveCamera
            makeDefault
            position={[5, 5, 5]} // [x, y, z] - adjust these values to change initial view
            fov={50} // Field of view - lower = more zoomed in
          />
          
          {/* OrbitControls for interactive camera movement */}
          <OrbitControls
            enablePan={true} // Allow panning
            enableZoom={true} // Allow zooming
            enableRotate={true} // Allow rotation
            minDistance={2} // Minimum zoom distance
            maxDistance={20} // Maximum zoom distance
            minPolarAngle={0} // Minimum vertical rotation
            maxPolarAngle={Math.PI} // Maximum vertical rotation
            autoRotate={false} // Set to true for auto rotation
            autoRotateSpeed={2} // Speed of auto rotation if enabled
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <MeshComponent />
        </Canvas>
      </div>
    </div>
  );
}