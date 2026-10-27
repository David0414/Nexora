import { expCards } from "../constants";
import TitleHeader from "../components/TitleHeader";

const Experience = () => (
  <section id="experience" className="portfolio-experience section-padding">
    <div className="experience-inner">
      <TitleHeader title="Experience behind the work." sub="EXPERIENCE / 03" />
      <div className="experience-list">
        {expCards.map((card) => (
          <article key={card.title} className="experience-entry">
            <p className="experience-date">{card.date}</p>
            <div className="experience-body">
              <div className="experience-title">
                <img src={card.logoPath} alt="" loading="lazy" width="40" height="40" />
                <h3>{card.title}</h3>
              </div>
              <ul>
                {card.responsibilities.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}
              </ul>
              <details className="experience-reflection">
                <summary>What I learned <span aria-hidden="true">+</span></summary>
                <p>{card.review}</p>
              </details>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Experience;
