import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Phone, Mail, MapPin, MessageCircle, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useSeo } from "../lib/seo";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xppqlnor";

export default function Contact() {
  useSeo({
    title: "Contact AGMS Ltd. — Marine Brokers in Port Harcourt, Nigeria",
    description:
      "Contact AGMS Ltd., marine brokerage in Port Harcourt, Nigeria. Enquire about vessels for sale or charter in Nigeria and West Africa. Call +234 816 389 7314 or WhatsApp +234 807 349 2253.",
    path: "/contact",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [ref, setRef] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          // Formspree returns JSON (instead of redirecting to its success page)
          // only when the Accept header asks for it.
          Accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; id?: string } | null;
      if (!res.ok || json?.ok === false) throw new Error();
      setRef(json?.id ?? "");
      setStatus("ok");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    }
  }

  const field =
    "w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#FFCC00]/60 focus:ring-2 focus:ring-[#FFCC00]/10";

  const contactItems = [
    { icon: Phone, label: "WhatsApp", value: "+234 807 349 2253", href: "https://wa.me/2348073492253", color: "#25D366" },
    { icon: Phone, label: "Mobile", value: "+234 816 389 7314", href: "tel:+2348163897314", color: "#FFCC00" },
    { icon: Mail, label: "Email", value: "info@agms.com.ng", href: "mailto:info@agms.com.ng", color: "#6B96F0" },
    { icon: MapPin, label: "Address", value: "#60 Emekuku Street D/Line, Port-Harcourt, Rivers State, Nigeria.", href: undefined, color: "#FF6B6B" },
  ];

  return (
    <div style={{ background: "var(--dark-bg)" }} className="min-h-screen">
      {/* Hero */}
      <div
        className="relative overflow-hidden px-4 py-14 sm:px-6 lg:px-8"
        style={{ background: "linear-gradient(180deg, #071838 0%, #050F24 100%)", borderBottom: "1px solid rgba(255,204,0,0.1)" }}
      >
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full opacity-5 blur-3xl" style={{ background: "#FFCC00" }} />
        <div className="mx-auto max-w-6xl relative z-10">
          <div className="mb-2 text-[11px] font-black uppercase tracking-widest text-[#FFCC00]">GET IN TOUCH</div>
          <h1 className="text-4xl font-black text-white sm:text-5xl">Contact Us</h1>
          <p className="mt-3 text-white/50 max-w-xl">Reach out to our brokerage desk for vessel enquiries, charter requirements, or to list your vessel.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 p-6 space-y-4" style={{ background: "rgba(11,30,61,0.7)" }}>
              <h2 className="text-xl font-black text-white mb-2">Send an Enquiry</h2>
              <div className="gradient-divider mb-4" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/40">Your Name *</label>
                  <input name="name" placeholder="John Smith" maxLength={100} autoComplete="name" className={field} required />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/40">Company</label>
                  <input name="company" placeholder="Company name" maxLength={100} autoComplete="organization" className={field} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/40">Email *</label>
                  <input name="email" type="email" placeholder="you@company.com" maxLength={254} autoComplete="email" inputMode="email" className={field} required />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/40">Phone</label>
                  <input name="phone" type="tel" placeholder="+234 ..." maxLength={40} autoComplete="tel" inputMode="tel" className={field} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/40">Vessel / AGM ID of Interest</label>
                <input name="vessel" placeholder="e.g. AGM 1005 or Tug requirements" maxLength={100} className={field} />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/40">Your Enquiry *</label>
                <textarea
                  name="message"
                  placeholder="Describe your vessel requirements, charter needs, or questions..."
                  rows={5}
                  maxLength={5000}
                  className={field}
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={status === "sending"}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFCC00] py-3.5 text-sm font-black text-[#092E6D] hover:bg-[#E6B800] transition disabled:opacity-60 shadow-[0_0_30px_rgba(255,204,0,0.2)]"
              >
                {status === "sending" ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending…</>
                ) : (
                  <><Send size={16} /> Send Enquiry</>
                )}
              </motion.button>

              {status === "ok" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 p-4"
                >
                  <CheckCircle size={18} className="text-[#25D366] shrink-0" />
                  <p className="text-sm font-semibold text-[#25D366]">
                    Thank you — your enquiry has been received. Reference: {ref}
                  </p>
                </motion.div>
              )}
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-xl bg-red-500/15 border border-red-500/30 p-4"
                >
                  <AlertCircle size={18} className="text-red-400 shrink-0" />
                  <p className="text-sm font-semibold text-red-400">
                    Something went wrong. Please email info@agms.com.ng directly.
                  </p>
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-5"
          >
            <div className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(11,30,61,0.7)" }}>
              <h2 className="mb-1 text-xl font-black text-white">Brokerage Desk</h2>
              <p className="mb-4 text-sm text-white/50">AGMS Ltd. — Global Marine Brokerage</p>
              <div className="gradient-divider mb-4" />
              <p className="mb-1 text-base font-bold text-white">Abideen Olayinka</p>
              <p className="mb-4 text-sm text-white/50">S &amp; P Specialist | Chartering | Oil &amp; Gas Broker</p>

              <div className="space-y-3">
                {contactItems.map((c) => {
                  const Icon = c.icon;
                  const content = (
                    <div className="flex items-start gap-3 rounded-xl p-3 hover:bg-white/5 transition group">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: c.color + "15" }}>
                        <Icon size={15} style={{ color: c.color }} />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-widest text-white/35">{c.label}</div>
                        <div className="text-sm font-semibold text-white/80 group-hover:text-white transition">{c.value}</div>
                      </div>
                    </div>
                  );
                  return c.href ? (
                    <a key={c.label} href={c.href}>{content}</a>
                  ) : (
                    <div key={c.label}>{content}</div>
                  );
                })}
              </div>
            </div>

            {/* WhatsApp quick-link */}
            <a
              href="https://wa.me/2348073492253"
              className="flex items-center gap-3 rounded-2xl border border-[#25D366]/30 p-5 hover:bg-[#25D366]/10 transition group"
              style={{ background: "rgba(11,30,61,0.5)" }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366]/15">
                <MessageCircle size={22} className="text-[#25D366]" />
              </div>
              <div>
                <div className="text-sm font-black text-white group-hover:text-[#25D366] transition">Chat on WhatsApp</div>
                <div className="text-xs text-white/40">Fastest response — usually within 1 hour</div>
              </div>
            </a>

            {/* Disclaimer */}
            <div className="rounded-2xl border border-white/8 p-5 text-xs leading-relaxed text-white/35" style={{ background: "rgba(11,30,61,0.3)" }}>
              <strong className="text-white/50">Disclaimer:</strong> We are business facilitators / consultants / brokers and make no warranties or representations as to the Owners, Charterers or Transaction. All due diligence is the responsibility of the Owners &amp; Charterers.
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
