"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Group } from "three";

// Model data with paths, info, positioning, and lighting - replace with your actual values
const modelData = [
  {
    path: "/scene/scene.gltf",
    title: "Sculpture Alpha",
    artist: "Artist One",
    year: "2024",
    position: [0, -2, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    camera: { position: [0, 0, 5], fov: 50 },
    lighting: {
      ambient: { intensity: 0.6 },
      directional: { position: [5, 5, 5], intensity: 1 },
      pointLight1: { position: [-5, -5, -5], color: "#4a90e2", intensity: 500 },
      pointLight2: { position: [5, 5, 5], color: "#e24a90", intensity: 300 }
    }
  },
  
];

function RotatingModel({ modelData }) {
  const mesh = useRef<Group>(null!);
  const gltf = useLoader(GLTFLoader, modelData.path);

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.01;
    }
  });

  return (
    <group 
      ref={mesh} 
      position={modelData.position}
      rotation={modelData.rotation}
      scale={modelData.scale}
    >
      <primitive object={gltf.scene.clone()} />
    </group>
  );
}

function ModelWindow({ modelData, isSelected, onClick }) {
  return (
    <div 
      className={`relative bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl cursor-pointer ${
        isSelected ? 'ring-4 ring-blue-400 scale-105' : 'hover:scale-102'
      }`}
      onClick={onClick}
    >
      {/* 3D Model Canvas Window */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        <Canvas
          camera={{ 
            position: modelData.camera.position, 
            fov: modelData.camera.fov 
          }}
          className="w-full h-full"
        >
          <ambientLight intensity={modelData.lighting.ambient.intensity} />
          <directionalLight 
            position={modelData.lighting.directional.position} 
            intensity={modelData.lighting.directional.intensity} 
          />
          <pointLight 
            position={modelData.lighting.pointLight1.position} 
            color={modelData.lighting.pointLight1.color} 
            intensity={modelData.lighting.pointLight1.intensity} 
          />
          <pointLight 
            position={modelData.lighting.pointLight2.position} 
            color={modelData.lighting.pointLight2.color} 
            intensity={modelData.lighting.pointLight2.intensity} 
          />
          
          <Suspense fallback={null}>
            <RotatingModel modelData={modelData} />
          </Suspense>
        </Canvas>
        
        {/* Loading overlay */}
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
          </div>
        }>
          <div />
        </Suspense>
      </div>
      
      {/* Info Panel */}
      <div className="p-4 bg-white">
        <h3 className="font-bold text-lg text-gray-900 mb-1">{modelData.title}</h3>
        <p className="text-gray-600 text-sm mb-1">by {modelData.artist}</p>
        <p className="text-gray-500 text-xs">{modelData.year}</p>
      </div>
      
      {/* Frame effect */}
      <div className="absolute inset-0 border-8 border-gray-800 rounded-lg pointer-events-none shadow-inner"></div>
    </div>
  );
}

export default function GalleryWindows() {
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');

  const handleModelClick = (index: number) => {
    setSelectedModel(selectedModel === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Digital Art Gallery</h1>
              <p className="text-gray-300">Explore 3D masterpieces through interactive windows</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('masonry')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'masonry' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Masonry View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className={`gap-6 ${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 space-y-6'
        }`}>
          {modelData.map((data, index) => (
            <div 
              key={index} 
              className={viewMode === 'masonry' ? 'break-inside-avoid mb-6' : ''}
            >
              <ModelWindow
                modelData={data}
                isSelected={selectedModel === index}
                onClick={() => handleModelClick(index)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Selected Model Details */}
      {selectedModel !== null && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-gray-700 p-6 transform transition-transform duration-300">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-2">{modelData[selectedModel].title}</h2>
              <p className="text-gray-300 mb-1">Artist: {modelData[selectedModel].artist}</p>
              <p className="text-gray-400 text-sm">Year: {modelData[selectedModel].year}</p>
              <div className="mt-2 text-xs text-gray-500">
                <p>Position: [{modelData[selectedModel].position.join(', ')}]</p>
                <p>Scale: [{modelData[selectedModel].scale.join(', ')}]</p>
                <p>Camera FOV: {modelData[selectedModel].camera.fov}°</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                View Details
              </button>
              <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                Share
              </button>
              <button 
                onClick={() => setSelectedModel(null)}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="fixed top-20 right-4 bg-black/70 backdrop-blur-sm text-white p-4 rounded-lg max-w-xs">
        <h3 className="font-semibold mb-2">How to Navigate</h3>
        <ul className="text-sm space-y-1 text-gray-300">
          <li>• Click frames to select artworks</li>
          <li>• Models rotate automatically</li>
          <li>• Switch between grid layouts</li>
          <li>• View details in bottom panel</li>
        </ul>
      </div>
    </div>
  );
}