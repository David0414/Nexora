import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Html, OrbitControls } from "@react-three/drei";
import { useInView } from "react-intersection-observer";
import { memo, Suspense, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import Computer from "./Computer";
import useTheme from "../../../hooks/useTheme";
import SceneAppearance from "../SceneAppearance";
import usePageVisible from "../../../hooks/usePageVisible";
import useMediaQuery from "../../../hooks/useMediaQuery";

const ContactExperience = ({ name, status, typing }) => {
  const daylight = useTheme() === "light";
  const pageVisible = usePageVisible();
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0.05,
    rootMargin: "50px",
  });
  const active = inView && pageVisible;

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      const hardwareConcurrency = navigator.hardwareConcurrency ?? 8;
      const deviceMemory = navigator.deviceMemory ?? 8;
      setIsMobile(mobile);

      const isLowEnd =
        mobile &&
        (hardwareConcurrency < 4 ||
          deviceMemory < 4 ||
          /Android.*4\.|iPhone.*OS [4-9]_/.test(navigator.userAgent));
      setIsLowPerformance(isLowEnd);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const canvasConfig = useMemo(() => {
    if (isLowPerformance) {
      return {
        dpr: [0.55, 0.85],
        shadows: false,
        antialias: false,
        alpha: false,
        powerPreference: "low-power",
        failIfMajorPerformanceCaveat: false,
        stencil: false,
        depth: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        logarithmicDepthBuffer: false,
      };
    }

    if (isMobile) {
      return {
        dpr: [0.7, 1.05],
        shadows: false,
        antialias: false,
        alpha: false,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
        stencil: false,
        depth: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
      };
    }

    return {
      dpr: [1, 1.5],
      shadows: false,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: false,
      stencil: false,
      depth: true,
    };
  }, [isMobile, isLowPerformance]);

  const cameraConfig = useMemo(
    () => ({
      position: isMobile ? [0, 2.2, 5.2] : [0, 3, 7],
      fov: isMobile ? 50 : 45,
      near: 0.1,
      far: 100,
    }),
    [isMobile]
  );

  const lightConfig = useMemo(() => {
    if (daylight) {
      return {
        ambient: { intensity: 0.85, color: "#fff9ef" },
        directional: [
          { position: [-4, 6, 5], intensity: 2.1, color: "#fff0d6" },
          ...(!isLowPerformance ? [{ position: [4, 3, 2], intensity: 0.7, color: "#dceee5" }] : []),
        ],
      };
    }
    if (isLowPerformance) {
      return {
        ambient: { intensity: 0.55, color: "#fff4e6" },
        directional: [{ position: [5, 5, 3], intensity: 1.0, color: "#ffd9b3" }],
      };
    }

    if (isMobile) {
      return {
        ambient: { intensity: 0.48, color: "#fff4e6" },
        directional: [{ position: [5, 5, 3], intensity: 1.15, color: "#ffd9b3" }],
      };
    }

    return {
      ambient: { intensity: 0.4, color: "#fff4e6" },
      directional: [
        { position: [5, 5, 3], intensity: 1.5, color: "#ffd9b3" },
        { position: [5, 9, 1], intensity: 1.5, color: "#ffd9b3" },
      ],
    };
  }, [daylight, isMobile, isLowPerformance]);

  const orbitControlsConfig = useMemo(
    () => ({
      enableZoom: false,
      enablePan: false,
      enableRotate: active,
      enableDamping: !isLowPerformance && !reduceMotion,
      dampingFactor: isMobile ? 0.09 : 0.06,
      minPolarAngle: Math.PI / 5,
      maxPolarAngle: Math.PI / 2,
      autoRotate: false,
      rotateSpeed: isMobile ? 0.65 : 0.45,
      maxDistance: 15,
      minDistance: 3,
    }),
    [isMobile, isLowPerformance, active, reduceMotion]
  );

  const modelScale = useMemo(() => {
    if (isLowPerformance) return 0.025;
    if (isMobile) return 0.028;
    return 0.03;
  }, [isMobile, isLowPerformance]);

  const LoadingFallback = () => (
    <Html center>
      <div
        style={{
          color: "var(--portfolio-copy)",
          fontSize: isMobile ? "14px" : "16px",
          fontWeight: "300",
          textAlign: "center",
          userSelect: "none",
        }}
      >
        Loading 3D Model...
      </div>
    </Html>
  );

  return (
    <div ref={ref} className="contact-canvas-layout w-full h-full relative">
      <Canvas
        dpr={canvasConfig.dpr}
        shadows={canvasConfig.shadows}
        camera={cameraConfig}
        gl={canvasConfig}
        frameloop={active ? "demand" : "never"}
        style={{ pointerEvents: "auto", touchAction: "none" }}
        performance={{ min: 0.15, max: 1, debounce: 200 }}
        onCreated={(state) => {
          state.gl.setClearColor("#000000", 0);
          state.gl.setPixelRatio(
            Math.min(window.devicePixelRatio, canvasConfig.dpr[1])
          );
          state.gl.outputColorSpace = THREE.SRGBColorSpace;
          state.gl.toneMapping = THREE.ACESFilmicToneMapping;
          state.gl.toneMappingExposure = isMobile ? 1.03 : 1.1;

          if (isMobile) {
            state.gl.precision = "mediump";
          }
        }}
      >
        <AdaptiveDpr pixelated />
        <color attach="background" args={[daylight ? "#e1e7dc" : "#161b24"]} />
        <SceneAppearance exposure={daylight ? 0.95 : isMobile ? 1.03 : 1.1} />
        {daylight && <hemisphereLight args={["#edf6ff", "#a7b698", 0.65]} />}

        <ambientLight
          intensity={lightConfig.ambient.intensity}
          color={lightConfig.ambient.color}
        />
        {lightConfig.directional.map((light, index) => (
          <directionalLight
            key={index}
            position={light.position}
            intensity={light.intensity}
            color={light.color}
            castShadow={false}
          />
        ))}

        <OrbitControls {...orbitControlsConfig} />

        <group scale={[1, 1, 1]}>
          <mesh
            receiveShadow={false}
            position={[0, -1.5, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            frustumCulled={true}
          >
            <planeGeometry args={isMobile ? [20, 20] : [30, 30]} />
            {daylight
              ? <meshStandardMaterial color="#b8c6af" roughness={1} metalness={0} fog={false} />
              : <meshBasicMaterial color="#a46b2d" transparent={false} fog={false} />}
          </mesh>
        </group>

        <Suspense fallback={<LoadingFallback />}>
          <group
            scale={modelScale}
            position={[0, -1.49, -2]}
            castShadow={false}
            frustumCulled={true}
          >
            <Computer name={name} status={status} typing={typing} active={active} reduceMotion={reduceMotion} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default memo(ContactExperience);
