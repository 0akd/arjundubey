"use client";

import { useRef, useState, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Group } from "three";

// Orbit Controls Hook with Touch Support
function useOrbitControls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  
  useEffect(() => {
    let isDragging = false;
    let previousPosition = { x: 0, y: 0 };
    let spherical = { radius: 50, phi: Math.PI / 2, theta: 0 };
    let initialPinchDistance = 0;
    let isPinching = false;
    
    // Get position from mouse or touch event
    const getEventPosition = (event) => {
      if (event.touches && event.touches.length > 0) {
        return { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }
      return { x: event.clientX, y: event.clientY };
    };
    
    // Get distance between two touch points
    const getPinchDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };
    
    // Update camera position
    const updateCameraPosition = () => {
      const x = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      const y = spherical.radius * Math.cos(spherical.phi);
      const z = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      
      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);
    };
    
    // Mouse Events
    const handleMouseDown = (event) => {
      isDragging = true;
      previousPosition = getEventPosition(event);
      event.preventDefault();
    };
    
    const handleMouseMove = (event) => {
      if (!isDragging) return;
      
      const currentPosition = getEventPosition(event);
      const deltaX = currentPosition.x - previousPosition.x;
      const deltaY = currentPosition.y - previousPosition.y;
      
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      
      updateCameraPosition();
      previousPosition = currentPosition;
      event.preventDefault();
    };
    
    const handleMouseUp = (event) => {
      isDragging = false;
      event.preventDefault();
    };
    
    // Touch Events
    const handleTouchStart = (event) => {
      event.preventDefault();
      
      if (event.touches.length === 1) {
        // Single touch - rotation
        isDragging = true;
        isPinching = false;
        previousPosition = getEventPosition(event);
      } else if (event.touches.length === 2) {
        // Two touches - pinch to zoom
        isDragging = false;
        isPinching = true;
        initialPinchDistance = getPinchDistance(event.touches);
      }
    };
    
    const handleTouchMove = (event) => {
      event.preventDefault();
      
      if (event.touches.length === 1 && isDragging && !isPinching) {
        // Single touch rotation
        const currentPosition = getEventPosition(event);
        const deltaX = currentPosition.x - previousPosition.x;
        const deltaY = currentPosition.y - previousPosition.y;
        
        spherical.theta -= deltaX * 0.01;
        spherical.phi += deltaY * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        
        updateCameraPosition();
        previousPosition = currentPosition;
      } else if (event.touches.length === 2 && isPinching) {
        // Pinch to zoom
        const currentPinchDistance = getPinchDistance(event.touches);
        const deltaDistance = initialPinchDistance - currentPinchDistance;
        
        spherical.radius += deltaDistance * 0.01;
        spherical.radius = Math.max(10, Math.min(100, spherical.radius));
        
        updateCameraPosition();
        initialPinchDistance = currentPinchDistance;
      }
    };
    
    const handleTouchEnd = (event) => {
      event.preventDefault();
      isDragging = false;
      isPinching = false;
    };
    
    // Wheel Event for desktop zoom
    const handleWheel = (event) => {
      event.preventDefault();
      spherical.radius += event.deltaY * 0.01;
      spherical.radius = Math.max(10, Math.min(100, spherical.radius));
      updateCameraPosition();
    };
    
    // Add event listeners
    const element = gl.domElement;
    
    // Mouse events
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('wheel', handleWheel);
    
    // Touch events
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Prevent context menu on right click
    element.addEventListener('contextmenu', (e) => e.preventDefault());
    
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('contextmenu', (e) => e.preventDefault());
    };
  }, [camera, gl]);
  
  return controlsRef;
}

// Model data with paths, info, positioning, and lighting
const modelData = [
  {
    path: "/scene/scene.gltf",
    title: "Sculpture Alpha",
    artist: "Artist One",
    year: "2024",
    position: [0, -10, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    camera: { position: [40, 0, 30], fov: 100},
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
  const gltf = useGLTF(modelData.path);

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

function InteractiveModel({ modelData }) {
  const mesh = useRef<Group>(null!);
  const gltf = useGLTF(modelData.path);
  useOrbitControls();

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

function ModelWindow({ modelData, onClick }) {
  return (
    <div 
      className="relative bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl cursor-pointer hover:scale-105"
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
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
        <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg font-semibold text-gray-800">
          Click to Explore
        </div>
      </div>
    </div>
  );
}

function PopupViewer({ modelData, onClose }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{modelData.title}</h2>
            <p className="text-gray-300">by {modelData.artist} • {modelData.year}</p>
          </div>
          <button 
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>✕</span> Close
          </button>
        </div>

        {/* Interactive 3D Viewer */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-100 to-gray-300">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-800 mx-auto mb-4"></div>
                <p className="text-gray-600 font-semibold">Loading 3D Model...</p>
              </div>
            </div>
          )}
          
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
              <InteractiveModel modelData={modelData} />
            </Suspense>
          </Canvas>

          {/* Controls Info */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded-lg backdrop-blur-sm">
            <h4 className="font-semibold mb-2">Controls:</h4>
            <ul className="text-sm space-y-1">
              <li className="hidden sm:block">• Drag to rotate</li>
              <li className="hidden sm:block">• Scroll to zoom</li>
              <li className="sm:hidden">• Touch & drag to rotate</li>
              <li className="sm:hidden">• Pinch to zoom</li>
            </ul>
          </div>

          {/* Model Info */}
          <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-3 rounded-lg backdrop-blur-sm max-w-xs">
            <h4 className="font-semibold mb-2">Model Details:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Position: [{modelData.position.join(', ')}]</p>
              <p>Scale: [{modelData.scale.join(', ')}]</p>
              <p>Camera FOV: {modelData.camera.fov}°</p>
              <p>Lighting: {Object.keys(modelData.lighting).length} sources</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GalleryWindows() {
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');

  const handleModelClick = (index: number) => {
    setSelectedModel(index);
  };

  const handleClosePopup = () => {
    setSelectedModel(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Interactive 3D Gallery</h1>
              <p className="text-gray-300">Click any artwork to explore in full detail</p>
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
                onClick={() => handleModelClick(index)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Popup Viewer */}
      {selectedModel !== null && (
        <PopupViewer
          modelData={modelData[selectedModel]}
          onClose={handleClosePopup}
        />
      )}

      {/* Instructions */}
      <div className="fixed top-20 right-4 bg-black/70 backdrop-blur-sm text-white p-4 rounded-lg max-w-xs hidden lg:block">
        <h3 className="font-semibold mb-2">Gallery Guide</h3>
        <ul className="text-sm space-y-1 text-gray-300">
          <li>• Click any artwork to open interactive viewer</li>
          <li>• Drag to rotate, scroll to zoom</li>
          <li>• Switch between grid layouts</li>
          <li>• Hover for preview effects</li>
        </ul>
      </div>
    </div>
  );
}