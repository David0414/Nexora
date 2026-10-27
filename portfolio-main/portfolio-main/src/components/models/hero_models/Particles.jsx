import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Particles = ({ count = 50 }) => {
  const mesh = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    
    // Detectar dispositivos de muy bajo rendimiento
    const isLowEnd = mobile && (
      navigator.hardwareConcurrency < 4 || 
      navigator.deviceMemory < 4 ||
      /Android.*[4-6]\.|iPhone.*OS [4-9]_/.test(navigator.userAgent)
    );
    setIsLowPerformance(isLowEnd);
  }, []);

  // Ajustar count basado en rendimiento
  const optimizedCount = useMemo(() => {
    if (isLowPerformance) return 0; // Sin partículas
    if (isMobile) return Math.min(count, 20);
    return Math.min(count, 100);
  }, [count, isMobile, isLowPerformance]);

  // Generar partículas optimizadas
  const particles = useMemo(() => {
    if (optimizedCount === 0) return [];
    
    const temp = [];
    for (let i = 0; i < optimizedCount; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * (isMobile ? 8 : 10),
          Math.random() * 8 + 4, // Altura ajustada
          (Math.random() - 0.5) * (isMobile ? 8 : 10),
        ],
        speed: isMobile ? 0.002 + Math.random() * 0.001 : 0.005 + Math.random() * 0.001,
        resetY: Math.random() * 8 + 4,
      });
    }
    return temp;
  }, [optimizedCount, isMobile]);

  // Posiciones iniciales
  const positions = useMemo(() => {
    if (optimizedCount === 0) return new Float32Array(0);
    
    const pos = new Float32Array(optimizedCount * 3);
    particles.forEach((p, i) => {
      pos[i * 3] = p.position[0];
      pos[i * 3 + 1] = p.position[1];
      pos[i * 3 + 2] = p.position[2];
    });
    return pos;
  }, [particles, optimizedCount]);

  // Configuración de material adaptativa
  const materialConfig = useMemo(() => ({
    color: "#ffffff",
    size: isMobile ? 0.03 : 0.05,
    transparent: true,
    opacity: isMobile ? 0.7 : 0.9,
    depthWrite: false,
    alphaTest: 0.1, // Mejora performance
    fog: false,
    vertexColors: false,
    sizeAttenuation: !isMobile // Desactivar en móviles para mejor rendimiento
  }), [isMobile]);

  // Animación optimizada
  useFrame(() => {
    if (optimizedCount === 0 || !mesh.current) return;
    
    const positions = mesh.current.geometry.attributes.position.array;
    
    for (let i = 0; i < optimizedCount; i++) {
      const yIndex = i * 3 + 1;
      let y = positions[yIndex];
      y -= particles[i].speed;
      
      if (y < -2) {
        y = particles[i].resetY;
      }
      
      positions[yIndex] = y;
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  // No renderizar si no hay partículas
  if (optimizedCount === 0) {
    return null;
  }

  return (
    <points ref={mesh} frustumCulled={true}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={optimizedCount}
          array={positions}
          itemSize={3}
          usage={THREE.DynamicDrawUsage}
        />
      </bufferGeometry>
      <pointsMaterial {...materialConfig} />
    </points>
  );
};

export default Particles;
