// constants/index.js

const servinexProject = {
  name: "Servinex – Plataforma de administración de servicios",
  description:
    "Plataforma en TypeScript y JavaScript que conecta solicitudes, proveedores y equipo en una sola operación. Gestiona cada servicio de principio a fin, con seguimiento, pagos y control de costos y márgenes.",
  repositories: [
    { label: "GitHub Front", href: "https://github.com/David0414/servinexFront.git" },
    { label: "GitHub Back", href: "https://github.com/David0414/servinexBack.git" },
  ],
  images: [
    { src: "/images/servinex-dashboard.png", alt: "Servinex: resumen operativo y panorama financiero", label: "Resumen operativo" },
    { src: "/images/servinex-login.png", alt: "Servinex: acceso de administrador y equipo", label: "Acceso del equipo" },
    { src: "/images/servinex-payments.png", alt: "Servinex: estados y registro de pagos a proveedores", label: "Pagos a proveedores" },
    { src: "/images/servinex-service.png", alt: "Servinex: detalle de un servicio, proveedor y control comercial", label: "Detalle del servicio" },
  ],
};

const servinexLandingProject = {
  name: "Servinex – Landing Page, SEO y optimización web",
  description:
    "Landing page comercial con enfoque en SEO, optimización web y diseño responsivo. Presenta los servicios de Servinex y facilita las cotizaciones con llamadas a la acción, contacto directo y WhatsApp.",
  image: {
    src: "/images/servinex-landing.webp",
    alt: "Landing page de Servinex con sus servicios para hogares y negocios y opciones de cotización",
  },
  github: "https://github.com/David0414/servinex.git",
  live: "https://servinex-oficial.netlify.app/",
};

const portfolioProjects = [
  { id: "servinex-ops", category: "Operations platform", title: servinexProject.name,
    description: servinexProject.description, images: servinexProject.images,
    links: servinexProject.repositories },
  { id: "servinex-web", category: "Web design & SEO", title: servinexLandingProject.name,
    description: servinexLandingProject.description, image: servinexLandingProject.image,
    links: [{ label: "GitHub", href: servinexLandingProject.github }, { label: "Live", href: servinexLandingProject.live }] },
  { id: "agua24", category: "Maintenance & operations", title: "AGUA/24 Maintenance App",
    description: "A role-based portal for water machine maintenance. Connects condominium owners, technicians and administrators through service records, maintenance history and machine earnings.",
    video: "/images/agua24-preview.mp4", poster: "/images/agua24-poster.webp",
    links: [{ label: "GitHub", href: "https://github.com/David0414/portalAgua24.git" }] },
  { id: "aquaqr", category: "IoT & payments", title: "AquaQR (One Water) – Water Vending Platform",
    description: "A QR-based water dispensing ecosystem connecting telemetry dashboards, user wallets, payments and secure machine verification.",
    video: "/images/aquaqr-preview.mp4", poster: "/images/aquaqr-poster.webp",
    links: [{ label: "Live", href: "https://aquaqr-front.vercel.app/" }, { label: "Demo", href: "/images/aquaqr-preview.mp4" }] },
  { id: "hotel", category: "Booking & hospitality", title: "Hotel San Felipe – Booking System",
    description: "A hotel reservation website with an administration dashboard for bookings, rooms and customer data.",
    image: { src: "/images/project1.webp", alt: "Hotel San Felipe reservation website" },
    links: [{ label: "GitHub", href: "https://github.com/David0414/HotelSanFe" }, { label: "Live", href: "https://front-hotel-six.vercel.app/" }] },
  { id: "expenses", category: "Personal finance", title: "Expense Tracker – MERN",
    description: "A responsive expense tracker built with MongoDB, Express, React and Node.js to organize personal finances.",
    image: { src: "/images/project2.webp", alt: "Expense Tracker financial dashboard" },
    links: [{ label: "GitHub", href: "https://github.com/David0414/expenseTrackerBack" }, { label: "Live", href: "https://expesne-traacker-front.vercel.app/login" }] },
  { id: "employees", category: "Backend & authentication", title: "Employee Management System",
    description: "An employee management API with Express, JWT authentication and protected administrator operations.",
    image: { src: "/images/project3.webp", alt: "Employee management application" },
    links: [{ label: "GitHub", href: "https://github.com/David0414/ProyectoFinalBackend.git" }, { label: "Live", href: "https://proyectofinalbackend-production-e38f.up.railway.app/" }] },
  { id: "finlink", category: "Mobile & fintech", title: "FinLink – FinTech App Clone",
    description: "A React Native fintech clone with Clerk OTP login, cryptocurrency data and native interactions using Zustand and Reanimated.",
    video: "/images/finlink-preview.mp4", poster: "/images/finlink-poster.webp",
    links: [{ label: "GitHub", href: "https://github.com/David0414/FinLink" }] },
  { id: "sri", category: "Routing & algorithms", title: "Sistema de rutas inteligentes",
    description: "Route optimization for emergencies and natural disasters, using Dijkstra’s algorithm and AI to identify suitable routes.",
    image: { src: "/images/project4.webp", alt: "Intelligent routing application" },
    links: [{ label: "GitHub", href: "https://github.com/David0414/SRIFrontend.git" }, { label: "Live", href: "https://sri-frontend.vercel.app/" }] },
];

const navLinks = [
  { name: "Work", link: "#work" },
  { name: "Experience", link: "#experience" },
  { name: "Skills", link: "#skills" },
];

const words = [
  { text: "Ideas", imgPath: "/images/ideas.svg" },
  { text: "Concepts", imgPath: "/images/concepts.svg" },
  { text: "Designs", imgPath: "/images/designs.svg" },
  { text: "Code", imgPath: "/images/code.svg" },
  { text: "Ideas", imgPath: "/images/ideas.svg" },
  { text: "Concepts", imgPath: "/images/concepts.svg" },
  { text: "Designs", imgPath: "/images/designs.svg" },
  { text: "Code", imgPath: "/images/code.svg" },
];

const counterItems = [
  {
    value: "2",
    suffix: "+",
    label: "Years in Backend & Automation",
    description: "Building REST APIs, data workflows, and WhatsApp automation solutions",
  },
  {
    value: "3",
    suffix: "+",
    label: "WhatsApp Automations Delivered",
    description: "Lead capture + Meta Ads integrations and sales follow-up flows",
  },
  {
    value: "5",
    suffix: "+",
    label: "Databases & Data Tools Used",
    description: "PostgreSQL, MySQL, MongoDB, Redis, ORACLE + API documentation tooling",
  },
  {
    value: "C1",
    suffix: "",
    label: "English Level",
    description: "Comfortable communicating and working in English (plus Spanish native)",
  },
];

const logoIconsList = [
  { imgPath: "/images/logos/company-logo-1.webp" },
  { imgPath: "/images/logos/company-logo-2.webp" },
  { imgPath: "/images/logos/company-logo-3.webp" },
  { imgPath: "/images/logos/company-logo-4.webp" },
  { imgPath: "/images/logos/company-logo-5.webp" },
  { imgPath: "/images/logos/company-logo-6.webp" },
  { imgPath: "/images/logos/company-logo-7.webp" },
  { imgPath: "/images/logos/company-logo-8.webp" },
  { imgPath: "/images/logos/company-logo-9.webp" },
  { imgPath: "/images/logos/company-logo-10.webp" },
  { imgPath: "/images/logos/company-logo-11.webp" },
];

const abilities = [
  {
    imgPath: "/images/seo.png",
    title: "Quality Focus",
    desc: "I deliver reliable, maintainable work with attention to details and clarity.",
  },
  {
    imgPath: "/images/chat.png",
    title: "Reliable Communication",
    desc: "I keep updates consistent so stakeholders always know what’s happening.",
  },
  {
    imgPath: "/images/time.png",
    title: "On-Time Delivery",
    desc: "I plan tasks and deliver on schedule without sacrificing quality.",
  },
];

// Mantengo los mismos assets que ya tenías para evitar rutas rotas.
// (Cambié solo los títulos para alinearlos mejor a tu CV.)
const techStackImgs = [
  { name: "Backend (Node.js)", imgPath: "/images/logos/node.png" },
  { name: "SQL & Databases", imgPath: "/images/logos/database.svg" },
  { name: "Python", imgPath: "/images/logos/python.svg" },
  { name: "Project Manager", imgPath: "/images/logos/git.svg" }, // placeholder visual (si luego agregas logo de C#, cámbialo aquí)
  { name: "React / React Native", imgPath: "/images/logos/react.png" },
  { name: "Three.js (UI / Interactive)", imgPath: "/images/logos/three.png" },
];

const techStackIcons = [
  {
    name: "Backend (Node.js)",
    imgPath: "/images/logos/node.png",
    scale: 5,
    rotation: [0, -Math.PI / 2, 0],
  },
  {
    name: "SQL & Databases",

    imgPath: "/images/logos/database.svg",
    scale: 1,
    rotation: [0, 0, 0],
  },
  {
    name: "Python",
    imgPath: "/images/logos/python.svg",
    scale: 0.8,
    rotation: [0, 0, 0],
  },
  {
    name: "Project Manager",
    imgPath: "/images/logos/git.svg", // placeholder visual
    scale: 0.05,
    rotation: [0, -Math.PI / 4, 0],
  },
  {
    name: "React / React Native",
    imgPath: "/images/logos/react.png",
    scale: 1,
    rotation: [0, 0, 0],
  },
  {
    name: "Three.js (UI / Interactive)",
    imgPath: "/images/logos/three.png",
    scale: 0.05,
    rotation: [0, 0, 0],
  },
];

// Experience alineado al CV y "review" como opinión personal (primera persona).
const expCards = [
  {
    review:
      "Opinión personal: Este proyecto me está ayudando a consolidar OOP en C# y a diseñar lógica de negocio más limpia y escalable.",
    imgPath: "/images/exp1.png",
    logoPath: "/images/logo1.webp",
    title: "Software Developer (C# / OOP) — EVA (QR Dispenser)",
    date: "2026 – Present",
    responsibilities: [
      "Building backend modules in C# applying Object-Oriented Programming (OOP) for business rules and domain logic",
      "Implementing QR-based dispensing flows, validation logic, and consistent data handling",
      "Designing maintainable code structure (classes, responsibilities, reusable components) for long-term scalability",
    ],
  },
  {
    review:
      "Opinión personal: Me gustó trabajar en una app operativa real; me exigió pensar en flujos, trazabilidad y comunicación consistente entre capas.",
    imgPath: "/images/exp2.png",
    logoPath: "/images/logo2.webp",
    title: "Software Developer — Agua/24 (Maintenance App)",
    date: "Jan 2026 – Feb 2026",
    responsibilities: [
      "Contributed to a maintenance-focused application for operational support and service management",
      "Designed data structures and backend logic for maintenance workflows and operational tracking",
      "Integrated backend services with the application layer to ensure reliable system communication",
    ],
  },
  {
    review:
      "Opinión personal: Aquí reforcé mi enfoque backend end-to-end: APIs, base de datos y lógica de negocio conectadas a un flujo físico/operativo.",
    imgPath: "/images/exp3.png",
    logoPath: "/images/logo3.webp",
    title: "Software Developer (Backend/Fullstack) — One Water",
    date: "Jul 2025 – Dec 2025",
    responsibilities: [
      "Developed backend services for a QR-based platform, implementing business logic and data workflows end-to-end",
      "Designed and integrated REST API endpoints to validate QR codes and support operational flows",
      "Implemented database-driven features to manage transactions, device state records, and user interactions",
      "Worked on system integration to ensure reliable communication between the platform and the dispensing workflow",
    ],
  },
  {
    review:
      "Opinión personal: La automatización en WhatsApp me enseñó muchísimo sobre estabilidad, manejo de estados y UX conversacional enfocada a ventas.",
    imgPath: "/images/exp4.png", // si no existe, puedes cambiarlo por exp1/exp2/exp3
    logoPath: "/images/logo4.webp", // si no existe, usa logo1/logo2/logo3
    title: "Backend Developer & Automation Specialist — Cursalia",
    date: "2024 – 2026",
    responsibilities: [
      "Designed and deployed WhatsApp automation solutions with Node.js for lead capture and customer workflows",
      "Integrated Meta Ads with automated messaging to streamline follow-up and reduce manual operations",
      "Built backend services to manage conversations, inquiries, and infoproduct sales workflows",
    ],
  },
];

const expLogos = [
  { name: "logo1", imgPath: "/images/logo1.png" },
  { name: "logo2", imgPath: "/images/logo2.png" },
  { name: "logo3", imgPath: "/images/logo3.png" },
];

// Social corregido: GitHub apunta a GitHub, no a Instagram.
// Incluí también Portfolio porque aparece en tu CV.
const socialImgs = [
  {
    name: "GitHub",
    imgPath: "/images/github-logo.png",
    link: "https://github.com/David0414",
  },
  {
    name: "LinkedIn",
    imgPath: "/images/linkedin.png",
    link: "https://www.linkedin.com/in/david-mendoza-p%C3%A9rez-933627194/",
  },
  {
    name: "Instagram",
    imgPath: "/images/insta.png",
    link: "https://www.instagram.com/david.merez/",
  },
  {
    name: "WhatsApp",
    imgPath: "/images/whatsapp.png",
    link: "https://wa.me/524421213600",
  },
  
];

export {
  portfolioProjects,
  servinexProject,
  servinexLandingProject,
  words,
  abilities,
  logoIconsList,
  counterItems,
  expCards,
  expLogos,
  socialImgs,
  techStackIcons,
  techStackImgs,
  navLinks,
};
