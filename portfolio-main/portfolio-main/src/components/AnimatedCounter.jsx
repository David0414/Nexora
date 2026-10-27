import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { counterItems } from "../constants";

gsap.registerPlugin(ScrollTrigger);

const AnimatedCounter = () => {
  const counterRef = useRef(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const numbers = counterRef.current.querySelectorAll(".counter-number");
    counterItems.forEach((item, index) => {
      const value = Number(item.value);
      if (!Number.isFinite(value)) return;
      const progress = { value: 0 };
      gsap.to(progress, {
        value, duration: 1.2, ease: "power2.out",
        scrollTrigger: { trigger: numbers[index], start: "top 95%", once: true },
        onUpdate: () => { numbers[index].textContent = `${Math.round(progress.value)}${item.suffix}`; },
      });
    });
  }, { scope: counterRef });

  return (
    <div id="counter" ref={counterRef} className="portfolio-stats">
      <div className="portfolio-stats-grid">
        {counterItems.map((item) => (
          <div key={item.label} className="portfolio-stat">
            <div className="counter-number">{item.value}{item.suffix}</div>
            <p>{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedCounter;
