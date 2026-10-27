import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import useMediaQuery from "../../../hooks/useMediaQuery";
import useTheme from "../../../hooks/useTheme";
import SceneAppearance from "../SceneAppearance";
import { Room } from "./Room";
import HeroLights from "./HeroLights";
import Particles from "./Particles";

const Workspace = ({ mobile, animate, onReady, theme }) => {
  const workspace = useRef();
  const elapsed = useRef(0);
  const announced = useRef(false);

  useEffect(() => {
    if (!animate && workspace.current) workspace.current.rotation.y = -Math.PI / 4;
  }, [animate]);

  useFrame((_, delta) => {
    if (!announced.current) {
      announced.current = true;
      requestAnimationFrame(onReady);
    }
    if (!animate) return;
    elapsed.current += Math.min(delta, 0.05);
    workspace.current.rotation.y = -Math.PI / 4 + Math.sin(elapsed.current * 0.3) * 0.08;
  });

  return (
    <group ref={workspace} scale={mobile ? 0.88 : 1}
      position={[0, mobile ? -2.6 : -3.1, 0]} rotation={[0, -Math.PI / 4, 0]}>
      <Room theme={theme} />
    </group>
  );
};

const HeroExperience = ({ active = true, onReady }) => {
  const theme = useTheme();
  const daylight = theme === "light";
  const mobile = useMediaQuery("(max-width: 767px)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [quality, setQuality] = useState(() =>
    (navigator.deviceMemory ?? 8) < 4 || (navigator.hardwareConcurrency ?? 8) < 4 ? "low" : "normal"
  );
  const animate = !reduceMotion && quality !== "low";
  const dpr = quality === "low" ? 0.85 : mobile ? 1.15 : 1.5;

  return (
    <Canvas
      camera={{ position: [0, 0.4, mobile ? 12 : 13.5], fov: 45, near: 0.1, far: 55 }}
      dpr={dpr}
      gl={{ alpha: true, antialias: true, powerPreference: "default", stencil: false }}
      frameloop={!active ? "never" : animate ? "always" : "demand"}
      fallback={<span className="sr-only">A preview of the workspace is shown.</span>}
      onCreated={({ gl }) => {
        gl.setClearColor("#000000", 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
      }}
      style={{ pointerEvents: "auto", touchAction: "none" }}
    >
      <SceneAppearance exposure={daylight ? 1 : 1.12} />
      <ambientLight intensity={daylight ? 0.65 : 0.3} color={daylight ? "#fff7e8" : "#b3c9ef"} />
      <OrbitControls enablePan={false} enableZoom={false} enableRotate={active}
        rotateSpeed={mobile ? 0.65 : 0.5}
        enableDamping={!reduceMotion} dampingFactor={0.08}
        minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-0.65} maxAzimuthAngle={0.65} target={[0, -1, 0]} />
      <Suspense fallback={null}>
        <HeroLights theme={theme} />
        {!daylight && active && animate && !mobile && <Particles count={25} />}
        <Workspace mobile={mobile} animate={animate && active} onReady={onReady} theme={theme} />
        {active && animate && (
          <PerformanceMonitor iterations={5} bounds={() => [28, 55]}
            onDecline={() => setQuality("low")} />
        )}
      </Suspense>
    </Canvas>
  );
};

export default HeroExperience;
