import { useState } from "react";
import { portfolioProjects } from "../constants";
import ProjectCarousel from "../components/ProjectCarousel";
import ProjectVideo from "../components/ProjectVideo";
import "../hover-effecyts.css";

const ProjectLinks = ({ links }) => (
  <div className="project-links absolute bottom-4 right-4 flex flex-wrap justify-end gap-2">
    {links.map(({ href, label }) => (
      <a key={href} href={href} target="_blank" rel="noopener noreferrer"
        className={`px-4 py-2 rounded-full font-semibold shadow transition ${label === "Live" ? "bg-black text-white hover:bg-white hover:text-black" : "bg-white text-black hover:bg-black hover:text-white"}`}>
        {label}
      </a>
    ))}
  </div>
);

const AppShowcase = () => {
  const [expanded, setExpanded] = useState(false);
  const projects = expanded ? portfolioProjects : portfolioProjects.slice(0, 3);

  return (
    <section id="work" className="app-showcase portfolio-work">
      <div className="work-heading">
        <div>
          <p className="section-eyebrow">SELECTED WORK / 02</p>
          <h2>Ideas built for<br /><span>the real world.</span></h2>
        </div>
        <p>From the first impression to the systems behind it. A selection of websites, platforms and automations I’ve built.</p>
      </div>
      <div id="project-grid" className="project-grid">
        {projects.map((project, index) => (
          <article key={project.id} className="project">
            {project.images ? (
              <ProjectCarousel images={project.images}>
                <ProjectLinks links={project.links} />
              </ProjectCarousel>
            ) : (
              <div className="image-wrapper project-media relative rounded-xl overflow-hidden">
                {project.video ? (
                  <ProjectVideo src={project.video} poster={project.poster} title={project.title} />
                ) : (
                  <img src={project.image.src} alt={project.image.alt} loading="lazy" width="1440" height="810" />
                )}
                <ProjectLinks links={project.links} />
              </div>
            )}
            <div className="project-copy">
              <p className="project-category"><span>{String(index + 1).padStart(2, "0")}</span>{project.category}</p>
              <h3>{project.title}</h3>
              <p className="project-description">{project.description}</p>
            </div>
          </article>
        ))}
      </div>
      <button type="button" className="view-projects secondary-action"
        aria-expanded={expanded} aria-controls="project-grid"
        onClick={(event) => {
          if (expanded) {
            // Move focus to a stable, visible position before hiding the later cards.
            document.getElementById("work").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
            event.currentTarget.focus({ preventScroll: true });
          }
          setExpanded((value) => !value);
        }}>
        {expanded ? "Show selected projects" : `Explore all ${portfolioProjects.length} projects`}
        <span aria-hidden="true">{expanded ? "↑" : "↗"}</span>
      </button>
    </section>
  );
};

export default AppShowcase;
