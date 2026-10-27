import TitleHeader from "../components/TitleHeader";
import { techStackIcons } from "../constants";

const TechStack = () => {

  return (
    <div id="skills" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="The tools behind the ideas."
          sub="SKILLS / 04"
        />
        <div className="tech-grid">
          {techStackIcons.map((techStackIcon) => (
            <div
              key={techStackIcon.name}
              className="card-border tech-card overflow-hidden group xl:rounded-full rounded-lg transition-transform duration-300 ease-in-out hover:scale-105"
            >
              <div className="tech-card-content">
                <div className="tech-icon-wrapper">
                  <img
                    src={techStackIcon.imgPath}
                    alt={techStackIcon.name}
                    className="tech-icon w-14 h-14 md:w-20 md:h-20 object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="padding-x w-full">
                  <p>{techStackIcon.name}</p>
                  {techStackIcon.detail && (
                    <p className="tech-card-detail">{techStackIcon.detail}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechStack;
