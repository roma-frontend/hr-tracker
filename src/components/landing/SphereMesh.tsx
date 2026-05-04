'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';

// Lazy load three.js to reduce initial bundle size
let THREEModule: typeof import('three') | null = null;

async function loadThree() {
  if (!THREEModule) {
    THREEModule = await import('three');
  }
  return THREEModule;
}

export function SphereMesh() {
  const particlesRef = useRef<THREE.Points>(null);
  const starsRef = useRef<THREE.Points>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Particles geometry
  const particles = useMemo(() => {
    if (!isLoaded || !THREEModule) return null;

    const count = 80;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const goldColor = new THREEModule.Color('#2563eb');
    const champagneColor = new THREEModule.Color('#93c5fd');
    const bronzeColor = new THREEModule.Color('#60a5fa');

    for (let i = 0; i < count; i++) {
      const radius = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      sizes[i] = Math.random() * 0.06 + 0.02;

      const colorChoice = Math.random();
      const color =
        colorChoice < 0.5 ? goldColor : colorChoice < 0.8 ? champagneColor : bronzeColor;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREEModule.BufferGeometry();
    geometry.setAttribute('position', new THREEModule.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREEModule.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREEModule.BufferAttribute(colors, 3));

    return geometry;
  }, [isLoaded]);

  // Stars geometry
  const stars = useMemo(() => {
    if (!isLoaded || !THREEModule) return null;

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

    const geometry = new THREEModule.BufferGeometry();
    geometry.setAttribute('position', new THREEModule.BufferAttribute(positions, 3));

    return geometry;
  }, [isLoaded]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.03;
      particlesRef.current.rotation.x = Math.sin(t * 0.02) * 0.1;
    }

    if (starsRef.current) {
      starsRef.current.rotation.y = t * 0.01;
    }
  });

  // Load three.js dynamically
  useEffect(() => {
    loadThree().then(() => setIsLoaded(true));
  }, []);

  if (!isLoaded) {
    return null; // Or a loading placeholder
  }

  return (
    <>
      <ambientLight intensity={0.2} />

      <pointLight position={[3, 3, 3]} intensity={0.5} color="#2563eb" />
      <pointLight position={[-3, -3, -3]} intensity={0.3} color="#93c5fd" />

      {particles && (
        <points ref={particlesRef} geometry={particles}>
          <pointsMaterial
            size={0.05}
            vertexColors
            transparent
            opacity={0.8}
            sizeAttenuation
            blending={THREEModule!.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {stars && (
        <points ref={starsRef} geometry={stars}>
          <pointsMaterial size={0.015} color="#93c5fd" transparent opacity={0.3} sizeAttenuation />
        </points>
      )}
    </>
  );
}
