import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import useMediaQuery from "../hooks/useMediaQuery";
import usePageVisible from "../hooks/usePageVisible";

const ProjectVideo = ({ src, poster, title }) => {
  const video = useRef(null);
  const { ref: nearRef, inView: near } = useInView({ rootMargin: "200px", triggerOnce: true });
  const { ref: visibleRef, inView: visible } = useInView({ threshold: 0.25 });
  const pageVisible = usePageVisible();
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const saveData = navigator.connection?.saveData ?? false;
  const [requested, setRequested] = useState(false);
  const [paused, setPaused] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const load = near && (!saveData || requested);
  const play = load && visible && pageVisible && !paused && ((!reduceMotion && !saveData) || requested);
  const ref = useCallback((element) => {
    video.current = element;
    nearRef(element);
    visibleRef(element);
  }, [nearRef, visibleRef]);

  useEffect(() => {
    const element = video.current;
    let cancelled = false;
    if (play) {
      element.play().catch(() => { if (!cancelled) setBlocked(true); });
    } else {
      element.pause();
    }
    return () => { cancelled = true; element.pause(); };
  }, [play, load]);

  return (
    <>
      <video ref={ref} src={load ? src : undefined} poster={poster}
        preload={load ? "metadata" : "none"} muted loop playsInline
        aria-label={`${title} demonstration`} className="w-full h-full object-contain" />
      <button type="button" className="video-play-button"
        aria-label={`${play && !blocked ? "Pause" : "Play"} ${title} demo`}
        onClick={() => {
          if (play && !blocked) setPaused(true);
          else {
            setRequested(true);
            setPaused(false);
            setBlocked(false);
            // Retry inside the gesture if the browser blocked autoplay.
            video.current?.play().catch(() => {});
          }
        }}>
        <span aria-hidden="true">{play && !blocked ? "Ⅱ" : "▶"}</span>
        <span>{play && !blocked ? "Pause" : "Play demo"}</span>
      </button>
    </>
  );
};

export default ProjectVideo;
