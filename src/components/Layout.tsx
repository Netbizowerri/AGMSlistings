import { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
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
} from "lucide-react";
import ChatBot from "./ChatBot";

const nav = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/about", label: "About us", icon: Info },
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
          className="h-14 w-auto object-contain sm:h-24"
        />
      )}
      <svg viewBox="0 0 600 26" className="mt-1 h-3 w-full max-w-[640px]">
        <path
          d="M0 20 C 60 20, 90 4, 140 4 S 220 20, 270 20 S 350 4, 400 4 S 480 20, 600 18 L600 26 L0 26 Z"
          fill="#FFCC00"
        />
      </svg>
      <p className="mt-2 text-[11px] font-bold italic text-white sm:text-xl lg:text-2xl">
        Buy, sell &amp; charter commercial workboats worldwide
      </p>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const close = () => setOpen(false);
  const openChat = () => {
    close();
    window.dispatchEvent(new CustomEvent("agms:open-chat"));
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white pb-20 font-sans text-slate-800 lg:pb-0">
      <div className="bg-[#3A64C2] px-4 py-2 text-sm text-white sm:px-8">
        <a href="mailto:info@agms.com.ng" className="hover:underline">
          info@agms.com.ng
        </a>
      </div>

      <header className="bg-[#092E6D] px-4 pb-3 pt-4 sm:px-8 sm:pb-5">
        <Link to="/">
          <Logo />
        </Link>
        <p className="mx-auto mt-4 max-w-4xl text-center text-[13px] font-bold leading-snug text-white sm:text-base">
          For vessel owners, builders, &amp; brokers in the commercial marine
          markets looking to buy, sell, or charter workboats worldwide
        </p>

        {/* desktop nav */}
        <nav className="mt-4 hidden items-center justify-center gap-7 text-[17px] font-bold text-white lg:flex">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `rounded px-2 py-1 transition hover:text-[#FFCC00] ${
                  isActive ? "text-[#FFCC00]" : ""
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
          <div className="group relative">
            <button className="flex items-center gap-1 rounded px-2 py-1 hover:text-[#FFCC00]">
              Legal Statement
              <ChevronDown size={14} />
            </button>
            <div className="invisible absolute left-0 z-20 w-56 bg-[#092E6D] pt-3 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
              <Link
                to="/privacy"
                className="block px-5 py-3 text-sm hover:text-[#FFCC00]"
              >
                Privacy Policy
              </Link>
              <Link
                to="/legal"
                className="block px-5 py-3 text-sm hover:text-[#FFCC00]"
              >
                Terms &amp; Disclaimer
              </Link>
            </div>
          </div>
        </nav>

        {/* mobile menu trigger */}
        <div className="mt-3 flex justify-center lg:hidden">
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-white transition active:scale-95"
          >
            <Menu size={20} />
            <span className="text-sm font-semibold">Menu</span>
          </button>
        </div>
      </header>

      {/* mobile drawer */}
      <div
        onClick={close}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[80%] max-w-xs flex-col bg-[#092E6D] shadow-2xl transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/15 px-5 py-4">
          <p className="font-bold text-white">AGMS Ltd.</p>
          <button
            onClick={close}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((n) => {
            const Icon = n.icon;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={close}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3.5 font-semibold text-white transition-all duration-200 hover:translate-x-1 hover:bg-[#3A64C2] active:scale-[0.98] ${
                    isActive ? "bg-[#3A64C2]" : "bg-white/5"
                  }`
                }
              >
                <Icon size={20} className="text-[#FFCC00]" />
                {n.label}
              </NavLink>
            );
          })}

          <button
            onClick={() => setLegalOpen((l) => !l)}
            className="flex w-full items-center gap-3 rounded-xl bg-white/5 px-4 py-3.5 font-semibold text-white transition-all duration-200 hover:translate-x-1 hover:bg-[#3A64C2]"
          >
            <Scale size={20} className="text-[#FFCC00]" />
            Legal Statement
            <ChevronDown
              size={16}
              className={`ml-auto transition-transform ${
                legalOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {legalOpen && (
            <div className="ml-4 space-y-1 overflow-hidden">
              <Link
                to="/privacy"
                onClick={close}
                className="block rounded-lg px-4 py-3 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                to="/legal"
                onClick={close}
                className="block rounded-lg px-4 py-3 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                Terms &amp; Disclaimer
              </Link>
            </div>
          )}

          <button
            onClick={openChat}
            className="flex w-full items-center gap-3 rounded-xl bg-[#FFCC00] px-4 py-3.5 font-semibold text-[#092E6D] transition-all duration-200 hover:translate-x-1 hover:brightness-95"
          >
            <MessageCircle size={20} />
            Chat with AGMS Assistant
          </button>
        </nav>

        <a
          href="https://wa.me/2348073492253"
          className="flex items-center justify-center gap-2 border-t border-white/15 bg-[#072253] px-4 py-4 text-sm font-semibold text-white"
        >
          <Phone size={16} className="text-[#FFCC00]" />
          WhatsApp +234 807 349 2253
        </a>
      </aside>

      <main key={pathname} className="w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* mobile sticky action bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_rgba(9,46,109,0.12)] backdrop-blur lg:hidden">
        {[
          {
            label: "Home",
            icon: HomeIcon,
            action: () => navigate("/"),
            active: pathname === "/",
          },
          {
            label: "Vessel Search",
            icon: Ship,
            action: () => navigate("/vessels"),
            active: pathname.startsWith("/vessels"),
          },
          {
            label: "Contact",
            icon: Mail,
            action: () => navigate("/contact"),
            active: pathname === "/contact",
          },
          {
            label: "Chat",
            icon: MessageCircle,
            action: () =>
              window.dispatchEvent(new CustomEvent("agms:open-chat")),
            active: false,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.action}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition active:scale-95 ${
                item.active ? "text-[#092E6D]" : "text-slate-500"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                  item.active
                    ? "bg-[#FFCC00] text-[#092E6D]"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Icon size={17} />
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <ChatBot />

      <footer className="mt-10 bg-[#092E6D] px-5 py-10 text-sm text-white/80">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
          <div>
            <h4 className="mb-3 font-bold text-white">AGMS Ltd.</h4>
            <p>
              Buy, sell &amp; charter commercial workboats worldwide. Tugs,
              barges, crew boats, dredgers, OSVs and passenger vessels.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-bold text-white">Brokerage</h4>
            <p className="font-semibold text-white">Abideen Olayinka</p>
            <p>S &amp; P Specialist | Chartering | Oil &amp; Gas Broker</p>
            <p className="mt-2">#60 Emekuku Street D/Line, Port-Harcourt,</p>
            <p>Rivers State, Nigeria.</p>
          </div>
          <div>
            <h4 className="mb-3 font-bold text-white">Contact</h4>
            <p>
              WhatsApp:{" "}
              <a
                className="hover:text-[#FFCC00]"
                href="https://wa.me/2348073492253"
              >
                +234 807 349 2253
              </a>
            </p>
            <p>
              Mob:{" "}
              <a className="hover:text-[#FFCC00]" href="tel:+2348163897314">
                +234 816 389 7314
              </a>
            </p>
            <p>
              Email:{" "}
              <a
                className="hover:text-[#FFCC00]"
                href="mailto:info@agms.com.ng"
              >
                info@agms.com.ng
              </a>
            </p>
            <div className="mt-3 flex gap-4">
              <Link to="/privacy" className="hover:text-[#FFCC00]">
                Privacy Policy
              </Link>
              <Link to="/legal" className="hover:text-[#FFCC00]">
                Legal Statement
              </Link>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-6xl border-t border-white/20 pt-5 text-xs text-white/60">
          © {new Date().getFullYear()} AGMS Ltd. — All rights reserved. We are
          business facilitators / consultants / brokers and make no warranties
          or representations as to Owners, Charterers or Transaction.
        </p>
      </footer>
    </div>
  );
}
