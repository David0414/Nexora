import { useInView } from "react-intersection-observer";
import usePageVisible from "../hooks/usePageVisible";

const ContactCompanion = ({ name, status, typing, className = "" }) => {
  const { ref, inView } = useInView({ threshold: 0 });
  const pageVisible = usePageVisible();
  const firstName = name.trim().split(/\s+/)[0].slice(0, 24);
  const busy = (typing || status === "sending") && inView && pageVisible;
  const title = status === "success" ? "Message sent!"
    : status === "error" ? "Let's try again."
    : firstName ? `Hi, ${firstName}!` : "Let's talk.";
  const detail = status === "success" ? "Thanks for reaching out."
    : status === "error" ? "Your draft is safe. Try sending again."
    : status === "sending" ? "Sending your message…"
    : typing ? "Putting your idea into words…" : "A little note can start something good.";

  return (
    <div ref={ref} className={`contact-companion ${busy ? "is-writing" : ""} is-${status} ${className}`}>
      <svg className="contact-avatar" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="78" height="78" rx="20" className="avatar-backdrop" />
        <path d="M21 65V56c0-12 38-12 38 0v9" fill="currentColor" />
        <rect x="35" y="36" width="10" height="13" rx="4" fill="#d7ae87" />
        <circle cx="40" cy="29" r="13" fill="#e7c3a1" />
        <path d="M27 29c-5-16 5-20 13-20 10 0 18 9 12 22l-3-10c-7 4-14 1-17-1l-5 9Z" fill="#233b34" />
        <path d="M34 30h1m10 0h1" stroke="#233b34" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M37 36c2 2 4 2 6 0" stroke="#805c44" strokeWidth="1.5" strokeLinecap="round" />
        <path className="avatar-hand-left" d="m27 55 8 8" stroke="#e7c3a1" strokeWidth="7" strokeLinecap="round" />
        <path className="avatar-hand-right" d="m53 55-8 8" stroke="#e7c3a1" strokeWidth="7" strokeLinecap="round" />
        <rect x="20" y="63" width="40" height="8" rx="3" fill="#233b34" />
        <path d="M26 67h28" stroke="#9be9d3" strokeWidth="1.5" strokeDasharray="2 3" />
      </svg>
      <div className="companion-copy">
        <p className="companion-eyebrow"><span className="companion-led" /> DAVID'S DESK</p>
        <p className="companion-title" title={title}>{title}</p>
        <p className="companion-detail">{detail}</p>
      </div>
      {status === "success" && <span className="companion-check" aria-hidden="true">✓</span>}
    </div>
  );
};

export default ContactCompanion;
