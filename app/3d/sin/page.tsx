"use client";

import { useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh } from "three";

function MeshComponent() {
  const fileUrl = "/scene/scene.gltf";
  const mesh = useRef<Mesh>(null!);
  const gltf = useLoader(GLTFLoader, fileUrl);

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
    <div className='flex justify-center items-center h-screen'>
      <Canvas className='h-2xl w-2xl'>
        <OrbitControls />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
         <pointLight position={[-10, -10, -10]} color="#48cc90" intensity={5000} />
            <pointLight position={[10, 10, 10]} color="#36e2e2" intensity={5000} />
        <MeshComponent />
      </Canvas>
    </div>
  );
}