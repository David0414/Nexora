import { useMemo, useState, useEffect } from "react";

const HeroLights = ({ theme = "dark" }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    const hardwareConcurrency = navigator.hardwareConcurrency ?? 8;
    const deviceMemory = navigator.deviceMemory ?? 8;
    setIsMobile(mobile);

    // Detectar dispositivos de muy bajo rendimiento
    const isLowEnd =
      mobile &&
      (hardwareConcurrency < 4 ||
        deviceMemory < 4 ||
        /Android.*[4-6]\.|iPhone.*OS [4-9]_/.test(navigator.userAgent));
    setIsLowPerformance(isLowEnd);
  }, []);

  // Configuración de luces adaptativa
  const lightConfig = useMemo(() => {
    if (isLowPerformance) {
      return {
        hemi: {
          skyColor: "#eef6ff",
          groundColor: "#211431",
          intensity: 0.55,
        },
        primary: {
          position: [2.5, 4.8, 5],
          intensity: 38,
          color: "#ffffff",
          angle: 0.34,
          penumbra: 0.6,
          distance: 24,
        },
        fill: {
          position: [-2.5, 2.5, 2],
          intensity: 6,
          color: "#93c5fd",
          distance: 12,
        },
      };
    }

    if (isMobile) {
      return {
        primary: {
          position: [2.2, 5, 6],
          intensity: 52,
          color: "#ffffff",
          angle: 0.25,
          penumbra: 0.5,
          distance: 27,
        },
        secondary: {
          position: [3.7, 4.6, 3.5],
          intensity: 14,
          color: "#60a5fa",
          angle: 0.4,
          penumbra: 0.6,
          distance: 20,
        },
        ambient: {
          position: [0, 1, 0],
          intensity: 3.6,
          color: "#7c3aed",
          distance: 14,
        },
      };
    }

    return {
      primary: {
        position: [2, 5, 6],
        intensity: 100,
        color: "white",
        angle: 0.15,
        penumbra: 0.2,
      },
      secondary: {
        position: [4, 5, 4],
        intensity: 40,
        color: "#4cc9f0",
        angle: 0.3,
        penumbra: 0.5,
      },
      fill: {
        position: [-3, 5, 5],
        intensity: 60,
        color: "#9d4edd",
        angle: 0.4,
        penumbra: 1,
      },
      area: {
        position: [1, 3, 4],
        rotation: [-Math.PI / 4, Math.PI / 4, 0],
        intensity: 15,
        color: "#a259ff",
        width: 3,
        height: 2,
      },
      ambient1: {
        position: [0, 1, 0],
        intensity: 10,
        color: "#7209b7",
      },
      ambient2: {
        position: [1, 2, -2],
        intensity: 10,
        color: "#0d00a4",
      },
    };
  }, [isMobile, isLowPerformance]);

  if (theme === "light") {
    return (
      <>
        <hemisphereLight args={["#f4f9ff", "#b7bea4", 1.35]} />
        <directionalLight position={[-3, 6, 5]} intensity={2.3} color="#fff1d6" castShadow={false} />
        {!isLowPerformance && <directionalLight position={[4, 3, 2]} intensity={0.75} color="#dbeee7" castShadow={false} />}
      </>
    );
  }

  if (isLowPerformance) {
    return (
      <>
        <hemisphereLight
          skyColor={lightConfig.hemi.skyColor}
          groundColor={lightConfig.hemi.groundColor}
          intensity={lightConfig.hemi.intensity}
        />
        <spotLight
          position={lightConfig.primary.position}
          angle={lightConfig.primary.angle}
          penumbra={lightConfig.primary.penumbra}
          intensity={lightConfig.primary.intensity}
          color={lightConfig.primary.color}
          castShadow={false}
          decay={2}
          distance={lightConfig.primary.distance}
        />
        <pointLight
          position={lightConfig.fill.position}
          intensity={lightConfig.fill.intensity}
          color={lightConfig.fill.color}
          decay={2}
          distance={lightConfig.fill.distance}
        />
      </>
    );
  }

  if (isMobile) {
    return (
      <>
        <spotLight
          position={lightConfig.primary.position}
          angle={lightConfig.primary.angle}
          penumbra={lightConfig.primary.penumbra}
          intensity={lightConfig.primary.intensity}
          color={lightConfig.primary.color}
          castShadow={false}
          decay={2}
          distance={lightConfig.primary.distance}
        />

        <spotLight
          position={lightConfig.secondary.position}
          angle={lightConfig.secondary.angle}
          penumbra={lightConfig.secondary.penumbra}
          intensity={lightConfig.secondary.intensity}
          color={lightConfig.secondary.color}
          castShadow={false}
          decay={2}
          distance={lightConfig.secondary.distance}
        />

        <pointLight
          position={lightConfig.ambient.position}
          intensity={lightConfig.ambient.intensity}
          color={lightConfig.ambient.color}
          decay={2}
          distance={lightConfig.ambient.distance}
        />
      </>
    );
  }

  // Configuración completa para desktop
  return (
    <>
      <spotLight
        position={lightConfig.primary.position}
        angle={lightConfig.primary.angle}
        penumbra={lightConfig.primary.penumbra}
        intensity={lightConfig.primary.intensity}
        color={lightConfig.primary.color}
        castShadow={false}
        decay={2}
        distance={30}
      />

      <spotLight
        position={lightConfig.secondary.position}
        angle={lightConfig.secondary.angle}
        penumbra={lightConfig.secondary.penumbra}
        intensity={lightConfig.secondary.intensity}
        color={lightConfig.secondary.color}
        castShadow={false}
        decay={2}
        distance={30}
      />

      <spotLight
        position={lightConfig.fill.position}
        angle={lightConfig.fill.angle}
        penumbra={lightConfig.fill.penumbra}
        intensity={lightConfig.fill.intensity}
        color={lightConfig.fill.color}
        castShadow={false}
        decay={2}
        distance={30}
      />

      <rectAreaLight
        color={lightConfig.area.color}
        intensity={lightConfig.area.intensity}
        width={lightConfig.area.width}
        height={lightConfig.area.height}
        position={lightConfig.area.position}
        rotation={lightConfig.area.rotation}
      />

      <pointLight
        position={lightConfig.ambient1.position}
        intensity={lightConfig.ambient1.intensity}
        color={lightConfig.ambient1.color}
        decay={2}
        distance={20}
      />
      <pointLight
        position={lightConfig.ambient2.position}
        intensity={lightConfig.ambient2.intensity}
        color={lightConfig.ambient2.color}
        decay={2}
        distance={20}
      />
    </>
  );
};

export default HeroLights;
