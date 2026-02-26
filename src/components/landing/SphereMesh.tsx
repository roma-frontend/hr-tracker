'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function SphereMesh() {
  const particlesRef = useRef<THREE.Points>(null);
  const starsRef = useRef<THREE.Points>(null);

  // Create floating indigo particles
  const particles = useMemo(() => {
    const count = 80;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    
    const goldColor = new THREE.Color('#2563eb');
    const champagneColor = new THREE.Color('#93c5fd');
    const bronzeColor = new THREE.Color('#60a5fa');
    
    for (let i = 0; i < count; i++) {
      // Random positions in a volume
      const radius = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Random sizes
      sizes[i] = Math.random() * 0.06 + 0.02;
      
      // Mix of gold tones
      const colorChoice = Math.random();
      const color = colorChoice < 0.5 ? goldColor : colorChoice < 0.8 ? champagneColor : bronzeColor;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  // Create distant stars
  const stars = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const radius = 8 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    return geometry;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Slow rotation for particles
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.03;
      particlesRef.current.rotation.x = Math.sin(t * 0.02) * 0.1;
    }
    
    // Very slow rotation for stars
    if (starsRef.current) {
      starsRef.current.rotation.y = t * 0.01;
    }
  });

  return (
    <>
      {/* Soft ambient lighting */}
      <ambientLight intensity={0.2} />
      
      {/* Subtle indigo accent lights */}
      <pointLight position={[3, 3, 3]} intensity={0.5} color="#2563eb" />
      <pointLight position={[-3, -3, -3]} intensity={0.3} color="#93c5fd" />

      {/* Floating indigo particles */}
      <points ref={particlesRef} geometry={particles}>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Distant stars - very subtle */}
      <points ref={starsRef} geometry={stars}>
        <pointsMaterial
          size={0.015}
          color="#93c5fd"
          transparent
          opacity={0.3}
          sizeAttenuation
        />
      </points>
    </>
  );
}
