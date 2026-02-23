'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Ring } from '@react-three/drei';
import * as THREE from 'three';

export function SphereMesh() {
  const sphereRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.rotation.y = t * 0.15;
      sphereRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.2;
      ringRef.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.05) * 0.05;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.15;
      ring2Ref.current.rotation.x = Math.PI / 5 + Math.sin(t * 0.07) * 0.05;
    }
  });

  return (
    <>
      {/* Ambient + point lights */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#60a5fa" />
      <pointLight position={[-10, -10, -5]} intensity={1.5} color="#a78bfa" />
      <pointLight position={[0, 5, -10]} intensity={1} color="#34d399" />

      {/* Main distorted sphere */}
      <Sphere ref={sphereRef} args={[1.8, 128, 128]}>
        <MeshDistortMaterial
          color="#1e3a8a"
          attach="material"
          distort={0.35}
          speed={1.5}
          roughness={0.1}
          metalness={0.9}
          emissive="#1d4ed8"
          emissiveIntensity={0.4}
        />
      </Sphere>

      {/* Glowing wireframe overlay */}
      <Sphere args={[1.85, 32, 32]}>
        <meshBasicMaterial
          color="#60a5fa"
          wireframe
          transparent
          opacity={0.08}
        />
      </Sphere>

      {/* Outer glow sphere */}
      <Sphere args={[2.1, 32, 32]}>
        <meshBasicMaterial
          color="#7c3aed"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Orbiting ring 1 */}
      <Ring ref={ringRef} args={[2.4, 2.6, 64]} rotation={[Math.PI / 3, 0, 0]}>
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} side={THREE.DoubleSide} />
      </Ring>

      {/* Orbiting ring 2 */}
      <Ring ref={ring2Ref} args={[2.8, 2.95, 64]} rotation={[Math.PI / 5, 0.5, 0]}>
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.2} side={THREE.DoubleSide} />
      </Ring>
    </>
  );
}
