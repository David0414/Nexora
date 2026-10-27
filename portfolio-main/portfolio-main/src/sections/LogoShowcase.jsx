import { logoIconsList } from "../constants";

const LogoIcon = ({ icon }) => {
  return (
    <div className="flex-none flex-center marquee-item">
      <img
        src={icon.imgPath}
        alt={icon.name}
        className="logo-icon w-16 h-16 md:w-20 md:h-20 object-contain"
        loading="lazy"
      />
    </div>
  );
};

const LogoShowcase = () => (
  <div className="my-10 md:my-20 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
      <div className="gradient-edge left-0" />
      <div className="gradient-edge right-0" />
    </div>

    <div className="marquee h-36 md:h-52">
      <div className="marquee-box flex items-center gap-4 md:gap-12 animate-marquee">
        {[...logoIconsList, ...logoIconsList].map((icon, index) => (
          <LogoIcon key={index} icon={icon} />
        ))}
      </div>
    </div>
  </div>
);

export default LogoShowcase;
