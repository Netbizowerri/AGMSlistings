import { useState, useEffect } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home as HomeIcon,
  Info,
  Ship,
  Mail,
  Scale,
  MessageCircle,
  Menu,
  X,
  ChevronDown,
  Phone,
  Anchor,
  Globe,
} from "lucide-react";
import ChatBot from "./ChatBot";

const nav = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/about", label: "About Us", icon: Info },
  { to: "/vessels", label: "Vessel Search", icon: Ship },
  { to: "/contact", label: "Contact Us", icon: Mail },
];

function Logo() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex flex-col items-center select-none">
      {!failed && (
        <img
          src="https://i.ibb.co/gLNrDXMV/AGMS.png"
          alt="AGMS Ltd."
          onError={() => setFailed(true)}
          className="h-12 w-auto object-contain sm:h-20 drop-shadow-[0_0_20px_rgba(255,204,0,0.4)]"
        />
      )}
      {failed && (
        <div className="flex items-center gap-2">
          <Anchor size={28} className="text-[#FFCC00]" />
          <span className="text-2xl font-black text-white tracking-wider">AGMS</span>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const close = () => setOpen(false);
  const openChat = () => {
    close();
    window.dispatchEvent(new CustomEvent("agms:open-chat"));
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden pb-20 font-sans lg:pb-0" style={{ background: "var(--dark-bg)" }}>
      {/* Top announcement bar */}
      <div className="bg-[#FFCC00] px-4 py-1.5 text-center text-xs font-bold text-[#092E6D]">
        🌊 Marine Brokerage Specialists &nbsp;|&nbsp;
        <a href="mailto:info@agms.com.ng" className="hover:underline">info@agms.com.ng</a>
        &nbsp;|&nbsp;
        <a href="https://wa.me/2348073492253" className="hover:underline">WhatsApp: +234 807 349 2253</a>
      </div>

      {/* Sticky Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass shadow-[0_4px_30px_rgba(9,46,109,0.5)]"
            : "bg-[#092E6D]/95 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <Logo />
            <div className="hidden sm:block">
              <div className="text-[10px] font-semibold text-[#FFCC00] uppercase tracking-widest">Global Marine Brokerage</div>
              <div className="text-[11px] text-white/60 leading-tight">Buy · Sell · Charter</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `nav-pill relative px-4 py-2 text-[14px] font-semibold rounded-lg transition-all duration-200 ${
                    isActive
                      ? "active text-[#FFCC00] bg-white/10"
                      : "text-white/85 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}

            <div className="group relative ml-1">
              <button className="nav-pill flex items-center gap-1.5 px-4 py-2 text-[14px] font-semibold text-white/85 rounded-lg hover:text-white hover:bg-white/10 transition-all duration-200">
                <Scale size={14} />
                Legal
                <ChevronDown size={12} className="transition-transform group-hover:rotate-180" />
              </button>
              <div className="invisible absolute right-0 top-full z-20 mt-2 w-52 rounded-xl glass shadow-2xl opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <Link to="/privacy" className="block px-5 py-3 text-sm text-white/85 hover:text-[#FFCC00] hover:bg-white/5 rounded-t-xl transition">
                  Privacy Policy
                </Link>
                <Link to="/legal" className="block px-5 py-3 text-sm text-white/85 hover:text-[#FFCC00] hover:bg-white/5 rounded-b-xl transition">
                  Terms &amp; Disclaimer
                </Link>
              </div>
            </div>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/contact"
              className="flex items-center gap-2 rounded-lg bg-[#FFCC00] px-5 py-2 text-[13px] font-bold text-[#092E6D] hover:bg-[#E6B800] transition shadow-[0_0_20px_rgba(255,204,0,0.3)]"
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-white transition hover:bg-white/20 active:scale-95 lg:hidden"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 flex h-full w-[82%] max-w-sm flex-col lg:hidden"
              style={{ background: "linear-gradient(180deg, #092E6D 0%, #050F24 100%)" }}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Anchor size={20} className="text-[#FFCC00]" />
                  <p className="font-bold text-white text-lg">AGMS Ltd.</p>
                </div>
                <button
                  onClick={close}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                {nav.map((n, i) => {
                  const Icon = n.icon;
                  return (
                    <motion.div
                      key={n.to}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <NavLink
                        to={n.to}
                        end={n.to === "/"}
                        onClick={close}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-4 py-3.5 font-semibold text-white transition-all hover:bg-[#3A64C2]/50 ${
                            isActive ? "bg-[#3A64C2]/60" : "bg-white/5"
                          }`
                        }
                      >
                        <Icon size={20} className="text-[#FFCC00]" />
                        {n.label}
                      </NavLink>
                    </motion.div>
                  );
                })}

                <div className="border-t border-white/10 my-2" />

                <button
                  onClick={() => setLegalOpen((l) => !l)}
                  className="flex w-full items-center gap-3 rounded-xl bg-white/5 px-4 py-3.5 font-semibold text-white hover:bg-[#3A64C2]/50 transition"
                >
                  <Scale size={20} className="text-[#FFCC00]" />
                  Legal Statement
                  <ChevronDown size={16} className={`ml-auto transition-transform ${legalOpen ? "rotate-180" : ""}`} />
                </button>
                {legalOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="ml-4 space-y-1 overflow-hidden"
                  >
                    <Link to="/privacy" onClick={close} className="block rounded-lg px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition">
                      Privacy Policy
                    </Link>
                    <Link to="/legal" onClick={close} className="block rounded-lg px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition">
                      Terms &amp; Disclaimer
                    </Link>
                  </motion.div>
                )}

                <button
                  onClick={openChat}
                  className="flex w-full items-center gap-3 rounded-xl bg-[#FFCC00] px-4 py-3.5 font-bold text-[#092E6D] hover:brightness-95 transition mt-2"
                >
                  <MessageCircle size={20} />
                  Chat with AGMS Assistant
                </button>
              </nav>

              <a
                href="https://wa.me/2348073492253"
                className="flex items-center justify-center gap-2 border-t border-white/10 bg-[#25D366]/15 px-4 py-4 text-sm font-semibold text-[#25D366]"
              >
                <Phone size={16} />
                WhatsApp: +234 807 349 2253
              </a>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Page content */}
      <main key={pathname} className="w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-white/10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_30px_rgba(9,46,109,0.5)] backdrop-blur-xl lg:hidden"
        style={{ background: "rgba(5,15,36,0.95)" }}
      >
        {[
          { label: "Home", icon: HomeIcon, action: () => navigate("/"), active: pathname === "/" },
          { label: "Vessels", icon: Ship, action: () => navigate("/vessels"), active: pathname.startsWith("/vessels") },
          { label: "Contact", icon: Mail, action: () => navigate("/contact"), active: pathname === "/contact" },
          { label: "Chat", icon: MessageCircle, action: () => window.dispatchEvent(new CustomEvent("agms:open-chat")), active: false },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.action}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition active:scale-95 ${
                item.active ? "text-[#FFCC00]" : "text-white/50"
              }`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                item.active ? "bg-[#FFCC00]/20 text-[#FFCC00]" : "text-white/50"
              }`}>
                <Icon size={17} />
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <ChatBot />

      {/* Footer */}
      <footer className="border-t border-white/5 px-5 py-16" style={{ background: "#030D1E" }}>
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Anchor size={22} className="text-[#FFCC00]" />
              <span className="text-xl font-black text-white">AGMS Ltd.</span>
            </div>
            <p className="text-sm text-white/55 leading-relaxed">
              Buy, sell &amp; charter commercial workboats worldwide. Tugs, barges, crew boats, dredgers, OSVs and passenger vessels.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
              <Globe size={12} />
              Worldwide Marine Brokerage
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: "/vessels", label: "Ships For Sale" },
                { to: "/vessels?sector=For+charter", label: "Ships For Charter" },
                { to: "/contact", label: "Request For Ships" },
                { to: "/about", label: "About AGMS" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-white/55 hover:text-[#FFCC00] transition flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#FFCC00]/50" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brokerage */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white uppercase tracking-widest">Brokerage</h4>
            <p className="text-sm font-semibold text-white">Abideen Olayinka</p>
            <p className="text-xs text-white/55 mt-1">S &amp; P Specialist | Chartering</p>
            <p className="text-xs text-white/55">Oil &amp; Gas Broker</p>
            <p className="mt-3 text-xs text-white/50">#60 Emekuku Street D/Line,</p>
            <p className="text-xs text-white/50">Port-Harcourt, Rivers State, Nigeria.</p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white uppercase tracking-widest">Contact</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="https://wa.me/2348073492253" className="flex items-center gap-2 text-sm text-white/55 hover:text-[#25D366] transition">
                  <Phone size={13} className="text-[#25D366]" />
                  +234 807 349 2253
                </a>
              </li>
              <li>
                <a href="tel:+2348163897314" className="flex items-center gap-2 text-sm text-white/55 hover:text-white transition">
                  <Phone size={13} className="text-[#FFCC00]" />
                  +234 816 389 7314
                </a>
              </li>
              <li>
                <a href="mailto:info@agms.com.ng" className="flex items-center gap-2 text-sm text-white/55 hover:text-[#FFCC00] transition">
                  <Mail size={13} className="text-[#3A64C2]" />
                  info@agms.com.ng
                </a>
              </li>
            </ul>
            <div className="mt-4 flex gap-3">
              <Link to="/privacy" className="text-xs text-white/40 hover:text-[#FFCC00] transition">Privacy</Link>
              <span className="text-white/20">·</span>
              <Link to="/legal" className="text-xs text-white/40 hover:text-[#FFCC00] transition">Legal</Link>
            </div>
          </div>
        </div>

        <div className="gradient-divider mx-auto mt-10 max-w-6xl" />
        <p className="mx-auto mt-6 max-w-6xl text-center text-xs text-white/30">
          © {new Date().getFullYear()} AGMS Ltd. — All rights reserved. We are business facilitators / consultants / brokers and make no warranties or representations as to Owners, Charterers or Transaction.
        </p>
      </footer>
    </div>
  );
}
