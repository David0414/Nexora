import { useRef, useState } from "react";

const ProjectCarousel = ({ images, children }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef(null);

  const changeSlide = (direction) => {
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  };

  return (
    <div
      className="image-wrapper project-media relative rounded-xl overflow-hidden"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Capturas de Servinex"
      tabIndex={0}
      style={{ touchAction: "pan-y" }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          changeSlide(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const distance = touchStart.current - event.changedTouches[0].clientX;
        if (Math.abs(distance) > 40) changeSlide(distance > 0 ? 1 : -1);
        touchStart.current = null;
      }}
      onTouchCancel={() => { touchStart.current = null; }}
    >
      <div
        className="flex h-full transition-transform duration-300 motion-reduce:transition-none"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <a
            key={image.src}
            href={image.src}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full w-full shrink-0"
            aria-label={`Abrir captura: ${image.label}`}
            aria-hidden={index !== activeIndex}
            tabIndex={index === activeIndex ? 0 : -1}
          >
            <img src={image.src} alt={image.alt} loading="lazy" draggable={false} />
          </a>
        ))}
      </div>
      <button
        type="button"
        onClick={() => changeSlide(-1)}
        aria-label="Captura anterior"
        className="carousel-arrow absolute left-2 top-1/2 -translate-y-1/2"
      >
        <span aria-hidden="true">‹</span>
      </button>
      <button
        type="button"
        onClick={() => changeSlide(1)}
        aria-label="Captura siguiente"
        className="carousel-arrow absolute right-2 top-1/2 -translate-y-1/2"
      >
        <span aria-hidden="true">›</span>
      </button>
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex rounded-full bg-black/60 px-1">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Mostrar captura: ${image.label}`}
            aria-current={index === activeIndex ? "true" : undefined}
            className="flex size-7 items-center justify-center cursor-pointer"
          >
            <span className={`size-2 rounded-full ${index === activeIndex ? "bg-white" : "bg-white/40"}`} />
          </button>
        ))}
      </div>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {images[activeIndex].label}, {activeIndex + 1} de {images.length}
      </span>
      {children}
    </div>
  );
};

export default ProjectCarousel;
