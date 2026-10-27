import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

function paintScreen(canvas, name, status, typing, frame) {
  const ctx = canvas.getContext("2d");
  const firstName = name.trim().split(/\s+/)[0].slice(0, 16);
  const accent = status === "error" ? "#ffc28b" : "#a7e8c5";
  ctx.fillStyle = "#142923";
  ctx.fillRect(0, 0, 512, 384);
  ctx.fillStyle = accent;
  ctx.font = "600 20px sans-serif";
  ctx.fillText("DAVID'S DESK", 28, 38);
  ctx.font = "600 38px sans-serif";
  const title = status === "success" ? "Message sent!" : status === "error" ? "Try again" : firstName ? `Hi, ${firstName}!` : "Let's talk.";
  ctx.fillText(title, 28, 92, 454);

  // A tiny illustrated developer; no additional model, video or animation file.
  ctx.fillStyle = "#35765b";
  ctx.beginPath(); ctx.roundRect(73, 228, 144, 91, 34); ctx.fill();
  ctx.fillStyle = "#e7c3a1";
  ctx.beginPath(); ctx.arc(145, 191, 43, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#263b32";
  ctx.beginPath(); ctx.ellipse(145, 162, 45, 23, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillRect(101, 160, 15, 29);
  ctx.fillRect(174, 160, 15, 29);
  ctx.fillStyle = "#263b32";
  ctx.fillRect(127, 189, 5, 5); ctx.fillRect(157, 189, 5, 5);
  ctx.strokeStyle = "#805c44"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(145, 202, 10, 0, Math.PI); ctx.stroke();
  const offset = typing || status === "sending" ? (frame % 2 ? 5 : -5) : 0;
  ctx.strokeStyle = "#e7c3a1"; ctx.lineWidth = 15; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(98, 267); ctx.lineTo(124, 301 + offset); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(192, 267); ctx.lineTo(167, 301 - offset); ctx.stroke();
  ctx.fillStyle = "#081a14";
  ctx.beginPath(); ctx.roundRect(83, 312, 129, 16, 5); ctx.fill();
  ctx.strokeStyle = accent; ctx.lineWidth = 3;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath(); ctx.moveTo(94 + i * 11, 320); ctx.lineTo(98 + i * 11, 320); ctx.stroke();
  }
  ctx.fillStyle = accent;
  ctx.font = "600 22px monospace";
  const label = status === "success" ? "SENT ✓" : status === "error" ? "RETRY" : status === "sending" ? "SENDING" : typing ? "TYPING" : "READY";
  ctx.fillText(label, 269, 186);
  ctx.fillStyle = "#548575";
  for (let i = 0; i < 4; i++) ctx.fillRect(269, 211 + i * 23, 110 + ((i + frame) % 3) * 19, 6);
  ctx.fillStyle = accent;
  ctx.font = "18px monospace";
  ctx.fillText(status === "success" ? "Thank you for your note." : "From your idea to a conversation.", 28, 365);
}

const MonitorScreen = ({ name = "", status = "idle", typing = false, active, reduceMotion }) => {
  const invalidate = useThree((state) => state.invalidate);
  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 384;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return { canvas, texture };
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  useEffect(() => {
    let frame = 0;
    const paint = () => {
      paintScreen(canvas, name, status, typing, frame++);
      texture.needsUpdate = true;
      invalidate();
    };
    paint();
    if (!active || reduceMotion || (!typing && status !== "sending")) return;
    // Four updates per second, only while writing/sending and in view.
    const timer = window.setInterval(paint, 250);
    return () => window.clearInterval(timer);
  }, [canvas, texture, name, status, typing, active, reduceMotion, invalidate]);

  return (
    <mesh name="interactive-monitor-screen" position={[-3.9, 97.5, 40.5]} rotation={[-0.1386, 0, 0]}>
      <planeGeometry args={[28.3, 22.9]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
};

export default MonitorScreen;
