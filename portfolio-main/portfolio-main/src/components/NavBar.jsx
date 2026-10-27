import { useEffect, useRef, useState } from "react";
import { navLinks, socialImgs } from "../constants";
import useMediaQuery from "../hooks/useMediaQuery";
import ThemeToggle from "./ThemeToggle";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const headerRef = useRef(null);
  const menuButton = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (desktop) setOpen(false);
  }, [desktop]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const onPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header ref={headerRef} className={`portfolio-nav ${scrolled || open ? "is-scrolled" : ""}`}>
      <div className="portfolio-nav-inner">
        <a className="portfolio-brand" href="#hero" onClick={() => setOpen(false)} aria-label="David Mendoza, home">
          <span className="brand-mark">dm<span>.</span></span><span className="brand-name">David Mendoza</span>
        </a>
        {desktop && (
          <nav aria-label="Main navigation" className="portfolio-desktop-nav">
            {navLinks.map(({ name, link }) => <a key={link} href={link}>{name}</a>)}
          </nav>
        )}
        <div className="nav-actions">
          <ThemeToggle />
          <a className="nav-contact" href={socialImgs.find((social) => social.name === "WhatsApp")?.link}
            target="_blank" rel="noopener noreferrer">Let’s talk <span aria-hidden="true">↗</span></a>
          {!desktop && (
            <button ref={menuButton} type="button" className={`menu-toggle ${open ? "is-open" : ""}`}
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-controls="mobile-navigation" aria-expanded={open}
              onClick={() => setOpen((value) => !value)}>
              <span /><span />
            </button>
          )}
        </div>
      </div>
      {!desktop && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="portfolio-mobile-nav" hidden={!open}>
          {[...navLinks, { name: "Contact", link: "#contact" }].map(({ name, link }, index) => (
            <a key={link} href={link} onClick={() => setOpen(false)}>
              <span className="nav-number">0{index + 1}</span>{name}<span aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};

export default NavBar;
