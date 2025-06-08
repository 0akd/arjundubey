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
    <mesh ref={mesh} position={[0, -19, 0]}> {/* [x, y, z] - adjust these values to position the model */}
      <primitive object={gltf.scene} />
    </mesh>
  );
}

export default function Shiba() {
  return (
    <div className='w-full h-48 sm:h-56 md:h-64  rounded-lg overflow-hidden shadow-sm'>
      <Canvas>
        {/* Camera with custom position */}
        <PerspectiveCamera
          makeDefault
          position={[5, 20, 50]} // [x, y, z] - keeping your original values
          fov={55} // Field of view - keeping your original value
        />
        
        {/* OrbitControls for interactive camera movement */}
        <OrbitControls
          enablePan={true} // Allow panning
          enableZoom={true} // Allow zooming
          enableRotate={true} // Allow rotation
          minDistance={2} // Minimum zoom distance
          maxDistance={200} // Maximum zoom distance
          minPolarAngle={0} // Minimum vertical rotation
          maxPolarAngle={Math.PI} // Maximum vertical rotation
          autoRotate={false} // Set to true for auto rotation
          autoRotateSpeed={2} // Speed of auto rotation if enabled
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1000} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <MeshComponent />
      </Canvas>
    </div>
  );
}