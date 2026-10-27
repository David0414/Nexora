import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import usePageVisible from "../hooks/usePageVisible";
import useTheme from "../hooks/useTheme";
import SceneBoundary from "./SceneBoundary";

const HeroExperience = lazy(() => import("./models/hero_models/HeroExperience"));

const HeroStage = () => {
  const daylight = useTheme() === "light";
  const { ref, inView } = useInView({ threshold: 0.05 });
  const pageVisible = usePageVisible();
  const [canLoad, setCanLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (!inView || canLoad) return;
    // Let the headline and poster paint before starting WebGL.
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setCanLoad(true), { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setCanLoad(true), 250);
    return () => window.clearTimeout(id);
  }, [inView, canLoad]);

  return (
    <div ref={ref} className="hero-stage" aria-label="David's interactive digital workspace">
      <div className="hero-stage-heading" aria-hidden="true">
        <span>THE DIGITAL WORKSPACE</span><span>01 / EXPLORE</span>
      </div>
      <img className="hero-poster" src={daylight ? "/images/hero-room-day.webp" : "/images/hero-room.webp"}
        alt="A miniature creative workspace with a desk, computer and shelves"
        width="1000" height="909" fetchPriority="high" />
      <SceneBoundary>
        <Suspense fallback={null}>
          {canLoad && (
            <div className={`hero-canvas ${ready ? "is-ready" : ""}`}>
              <HeroExperience active={inView && pageVisible} onReady={onReady} />
            </div>
          )}
        </Suspense>
      </SceneBoundary>
      <div className="hero-stage-footer" aria-hidden="true">
        <span><span className="accent-dot" /> Ideas brought to life</span>
        <span className="model-hint">Drag to explore ↗</span>
      </div>
    </div>
  );
};

export default HeroStage;
