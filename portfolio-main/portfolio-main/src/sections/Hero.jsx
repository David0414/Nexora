import AnimatedCounter from "../components/AnimatedCounter";
import HeroStage from "../components/HeroStage";

const Hero = () => (
  <section id="hero" className="portfolio-hero">
    <div className="hero-composition">
      <header className="hero-copy">
        <p className="hero-eyebrow"><span className="accent-dot" /> FULL-STACK DEVELOPER · MEXICO</p>
        <h1>Thoughtful design.<br /><span>Powerful code.</span></h1>
        <p className="hero-introduction">
          I’m David. I build intuitive websites, reliable platforms and
          automations that turn everyday challenges into better experiences.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href="#work">Explore my work <span aria-hidden="true">↗</span></a>
          <a className="secondary-action" href="#contact">Let’s talk <span aria-hidden="true">→</span></a>
        </div>
        <div className="hero-disciplines" aria-label="My specialties">
          <span>Web & SEO</span><span>Backend & APIs</span><span>Automation</span>
        </div>
      </header>
      <HeroStage />
    </div>
    <AnimatedCounter />
  </section>
);

export default Hero;
