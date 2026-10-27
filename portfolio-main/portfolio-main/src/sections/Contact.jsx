import { lazy, Suspense, useDeferredValue, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import emailjs from "@emailjs/browser";

import TitleHeader from "../components/TitleHeader";
import SceneBoundary from "../components/SceneBoundary";
import ContactCompanion from "../components/ContactCompanion";

const ContactExperience = lazy(() => import("../components/models/contact/ContactExperience"));

const Contact = () => {
  const { ref: visualRef, inView: loadVisual } = useInView({ triggerOnce: true, rootMargin: "150px" });
  const formRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [typing, setTyping] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const sendingRef = useRef(false);
  const typingTimer = useRef(null);
  const loading = status === "sending";
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const displayName = useDeferredValue(status === "success" ? submittedName : form.name);

  useEffect(() => () => window.clearTimeout(typingTimer.current), []);

  const handleChange = (e) => {
    if (sendingRef.current) return;
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
    setStatus("idle");
    if (name === "message") {
      window.clearTimeout(typingTimer.current);
      setTyping(value.length > 0);
      typingTimer.current = window.setTimeout(() => setTyping(false), 1100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sendingRef.current) return;
    sendingRef.current = true;
    window.clearTimeout(typingTimer.current);
    setTyping(false);
    setSubmittedName(form.name);
    setStatus("sending");

    try {
      await emailjs.sendForm(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
      );

      setForm({ name: "", email: "", message: "" });
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      sendingRef.current = false;
    }
  };

  return (
    <section id="contact" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="Let’s build something good."
          sub="GET IN TOUCH / 05"
        />
        <div className="grid-12-cols mt-16">
          <div className="xl:col-span-5">
            <div className="contact-form-card card-border rounded-xl p-10">
              <ContactCompanion name={displayName} status={status} typing={typing} className="contact-form-companion" />
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="w-full flex flex-col gap-7"
                aria-describedby="contact-feedback"
              >
                <div>
                  <label htmlFor="name">Your name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    readOnly={loading}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="email">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    readOnly={loading}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="message">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell me about your project"
                    rows="5"
                    required
                    readOnly={loading}
                  />
                </div>

                <button type="submit" className="send-message-button" disabled={loading} aria-busy={loading}>
                  <span>{loading ? "Sending..." : "Send Message"}</span>
                  <span className="send-message-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17 17 7M7 7h10v10" />
                    </svg>
                  </span>
                </button>
                <p id="contact-feedback" className={`contact-feedback is-${status}`} role="status" aria-live="polite" aria-atomic="true">
                  {status === "sending" ? "Sending your message…"
                    : status === "success" ? "Your message was sent. Thanks for reaching out!"
                    : status === "error" ? "Your message couldn't be sent. Your draft is safe; please try again." : ""}
                </p>

              </form>
            </div>
          </div>
          <div className="xl:col-span-7 min-h-96">
            <div ref={visualRef} className={`contact-visual contact-scene w-full h-full hover:cursor-grab rounded-3xl overflow-hidden is-${status}`}>
              <ContactCompanion name={displayName} status={status} typing={typing} className="contact-scene-companion" />
              <SceneBoundary>
                <Suspense fallback={null}>
                  {loadVisual && <ContactExperience name={displayName} status={status} typing={typing} />}
                </Suspense>
              </SceneBoundary>
              <span className="contact-model-hint" aria-hidden="true">Drag to explore ↗</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
