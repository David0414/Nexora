import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

// Update the renderer in place so theme changes preserve the camera and model.
const SceneAppearance = ({ exposure }) => {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    gl.toneMappingExposure = exposure;
    invalidate();
  }, [gl, exposure, invalidate]);

  return null;
};

export default SceneAppearance;
