import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

const TechIconCardExperience = ({ model }) => {
  const { scene } = useGLTF(model.modelPath); // Carga el modelo GLTF

  return (
    <Canvas>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} />

      {/* Simplemente renderiza el modelo sin animaciones */}
      <primitive object={scene} />
    </Canvas>
  );
};

export default TechIconCardExperience;
