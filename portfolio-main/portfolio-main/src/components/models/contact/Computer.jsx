import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import MonitorScreen from "./MonitorScreen";

const Computer = ({ name, status, typing, active, reduceMotion, ...props }) => {
  const { scene } = useGLTF("/models/computer-optimized.glb");
  const model = useMemo(() => scene.clone(true), [scene]);
  return (
    <group {...props}>
      <primitive object={model} dispose={null} />
      <MonitorScreen name={name} status={status} typing={typing} active={active} reduceMotion={reduceMotion} />
    </group>
  );
};

export default Computer;
