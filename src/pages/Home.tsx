import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Ship,
  Anchor,
  FileSearch,
  Layout,
  Search,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Globe,
  Shield,
  Star,
  Zap,
  BarChart3,
  X,
} from "lucide-react";
import { usePublishedVessels } from "../lib/useVessels";
import { useTaxonomy } from "../lib/useTaxonomy";
import { useSeo } from "../lib/seo";
import VesselCard from "../components/VesselCard";

/* ─────────────── Hero slide data ─────────────── */
const heroSlides = [
  {
    id: "sale",
    label: "Ships For Sale",
    icon: Ship,
    headline: "World-Class Vessels",
    sub: "Available For Purchase",
    desc: "Browse our extensive fleet of commercial workboats, tugs, barges, OSVs and tankers available for immediate sale worldwide.",
    cta: "Browse For Sale",
    ctaLink: "/vessels",
    color: "#FFCC00",
    bg: "https://images.pexels.com/photos/13178759/pexels-photo-13178759.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
  },
  {
    id: "charter",
    label: "Ships For Charter",
    icon: Anchor,
    headline: "Charter Ready Fleet",
    sub: "Immediate Availability",
    desc: "Time charter, trip charter or bareboat — find the right vessel for your offshore, coastal or inland operation.",
    cta: "View Charter Vessels",
    ctaLink: "/vessels",
    color: "#6B96F0",
    bg: "https://images.pexels.com/photos/31751960/pexels-photo-31751960.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
  },
  {
    id: "request",
    label: "Request For Ships",
    icon: FileSearch,
    headline: "Can't Find What You Need?",
    sub: "We'll Source It For You",
    desc: "Tell us your vessel requirements and our expert brokers will search the global marine market on your behalf.",
    cta: "Submit A Request",
    ctaLink: "/contact",
    color: "#25D366",
    bg: "https://images.pexels.com/photos/29014457/pexels-photo-29014457.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
  },
  {
    id: "designs",
    label: "Browse Designs",
    icon: Layout,
    headline: "Naval Architecture",
    sub: "Custom Vessel Designs",
    desc: "Explore design specifications and build-to-order concepts from leading shipyards and naval architects worldwide.",
    cta: "Browse Designs",
    ctaLink: "/vessels",
    color: "#FF6B6B",
    bg: "https://images.pexels.com/photos/20600690/pexels-photo-20600690.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
  },
];

/* ─────────────── Quick nav cards ─────────────── */
const quickNav = [
  {
    id: "sale",
    icon: Ship,
    label: "Ships For Sale",
    desc: "Buy commercial workboats from our worldwide inventory",
    to: "/vessels",
    gradient: "from-[#092E6D] to-[#1a4a9e]",
    accent: "#FFCC00",
    badge: "Most Popular",
  },
  {
    id: "charter",
    icon: Anchor,
    label: "Ships For Charter",
    desc: "Time, trip or bareboat charter — worldwide availability",
    to: "/vessels",
    gradient: "from-[#0e2d6d] to-[#1e3d7a]",
    accent: "#6B96F0",
    badge: "New Listings",
  },
  {
    id: "request",
    icon: FileSearch,
    label: "Request For Ships",
    desc: "Can't find what you need? Let us source it for you",
    to: "/contact",
    gradient: "from-[#0d3422] to-[#1a5035]",
    accent: "#25D366",
    badge: "Free Service",
  },
  {
    id: "designs",
    icon: Layout,
    label: "Browse Designs",
    desc: "Explore naval architecture and build-to-order concepts",
    to: "/vessels",
    gradient: "from-[#3d1010] to-[#6b2020]",
    accent: "#FF6B6B",
    badge: "Exclusive",
  },
];

/* ─────────────── Stats ─────────────── */
const stats = [
  { icon: Ship, label: "Vessels Listed", value: "84+", color: "#FFCC00" },
  { icon: Globe, label: "Countries Covered", value: "40+", color: "#6B96F0" },
  { icon: Star, label: "Years Experience", value: "15+", color: "#25D366" },
  { icon: Shield, label: "Trusted Brokers", value: "100%", color: "#FF6B6B" },
];

/* ─────────────── Animated counter ─────────────── */
function AnimatedStat({ stat, delay }: { stat: typeof stats[0]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const Icon = stat.icon;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="stat-card"
    >
      <Icon size={28} style={{ color: stat.color }} className="mx-auto mb-3" />
      <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
      <div className="text-xs font-semibold text-white/50 uppercase tracking-widest">{stat.label}</div>
    </motion.div>
  );
}

/* ─────────────── Hero Slider ─────────────── */
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (idx: number, dir = 1) => {
    setDirection(dir);
    setCurrent(idx);
  };

  const next = () => go((current + 1) % heroSlides.length, 1);
  const prev = () => go((current - 1 + heroSlides.length) % heroSlides.length, -1);

  useEffect(() => {
    timerRef.current = setInterval(next, 5500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current]);

  const slide = heroSlides[current];
  const SlideIcon = slide.icon;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "8%" : "-8%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-8%" : "8%", opacity: 0 }),
  };

  return (
    <div className="relative h-[85vh] min-h-[520px] max-h-[800px] overflow-hidden">
      {/* Background image */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={current + "bg"}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <img
            src={slide.bg}
            alt={slide.label}
            className="h-full w-full object-cover"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050F24]/90 via-[#050F24]/65 to-[#050F24]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050F24] via-transparent to-[#050F24]/40" />
        </motion.div>
      </AnimatePresence>

      {/* Ocean wave SVG */}
      <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden leading-none">
        <svg viewBox="0 0 1440 60" className="w-full" style={{ animation: "waveX 8s ease-in-out infinite" }}>
          <path d="M0,30 C240,0 480,60 720,30 C960,0 1200,60 1440,30 L1440,60 L0,60 Z" fill="rgba(5,15,36,0.8)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center px-6 sm:px-10 lg:px-20">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Label badge */}
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{ borderColor: slide.color + "50", color: slide.color, background: slide.color + "15" }}
              >
                <SlideIcon size={12} />
                {slide.label}
              </div>

              {/* Headline */}
              <h1 className="mb-2 text-5xl font-black leading-none text-white sm:text-6xl lg:text-7xl">
                {slide.headline}
              </h1>
              <h2 className="mb-5 text-2xl font-bold sm:text-3xl" style={{ color: slide.color }}>
                {slide.sub}
              </h2>

              {/* Description */}
              <p className="mb-8 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
                {slide.desc}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link to={slide.ctaLink} className="btn-hero-primary" style={{ background: slide.color, borderColor: slide.color, color: "#092E6D" }}>
                  {slide.cta}
                  <ArrowRight size={16} />
                </Link>
                <Link to="/contact" className="btn-hero-secondary">
                  Contact a Broker
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-10 left-6 z-20 flex items-center gap-2 sm:left-10 lg:left-20">
        {heroSlides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => go(i, i > current ? 1 : -1)}
            className={`rounded-full transition-all duration-400 ${
              i === current ? "w-8 h-2 bg-[#FFCC00]" : "w-2 h-2 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Slide labels (desktop) */}
      <div className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        {heroSlides.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => go(i, i > current ? 1 : -1)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                i === current
                  ? "glass text-white shadow-lg scale-105"
                  : "bg-black/20 text-white/50 hover:bg-black/40 hover:text-white/80"
              }`}
            >
              <Icon size={15} style={{ color: i === current ? s.color : undefined }} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Prev / Next */}
      <button onClick={prev} className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition lg:left-8">
        <ChevronLeft size={20} />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition lg:right-[220px]">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

/* ─────────────── Advanced Search ─────────────── */
function AdvancedSearch() {
  const navigate = useNavigate();
  const { vessels } = usePublishedVessels();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [sector, setSector] = useState("");
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const locations = useMemo(() => Array.from(new Set(vessels.map((v) => v.location))).sort(), [vessels]);
  // Categories and sectors are admin-managed; the dropdowns follow that list
  // (falling back to the shipped taxonomy before Firestore is seeded).
  const { terms: categories } = useTaxonomy("categories");
  const { terms: sectors } = useTaxonomy("sectors");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && !category && !location && !sector) return [];
    return vessels.filter((v) => {
      const matchQ = !q || (
        v.title.toLowerCase().includes(q) ||
        v.agmId.toLowerCase().replace(/\s+/g, " ").includes(q) ||
        // also match "agm110" → "agm 110"
        v.agmId.toLowerCase().replace(/\s+/g, "").includes(q.replace(/\s+/g, "")) ||
        v.category.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.sector.toLowerCase().includes(q)
      );
      const matchCat = !category || v.category === category;
      const matchLoc = !location || v.location === location;
      const matchSec = !sector || v.sector === sector;
      return matchQ && matchCat && matchLoc && matchSec;
    }).slice(0, 8);
  }, [query, category, location, sector, vessels]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (location) params.set("location", location);
    if (sector) params.set("sector", sector);
    if (query) params.set("q", query);
    navigate(`/vessels?${params.toString()}`);
  };

  const clearAll = () => {
    setQuery("");
    setCategory("");
    setLocation("");
    setSector("");
    setShowResults(false);
  };

  return (
    <div className="relative z-30">
      <div className="glass rounded-2xl p-6 shadow-[0_30px_80px_rgba(9,46,109,0.5)]">
        {/* Title */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFCC00]/20">
            <Search size={20} className="text-[#FFCC00]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Advanced Vessel Search</h3>
            <p className="text-xs text-white/50">Search by AGM ID, name, category, location…</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            placeholder='Search "AGM 1005", "Tug", "West Africa"…'
            className="search-input w-full rounded-xl border border-white/15 bg-white/8 py-3.5 pl-11 pr-12 text-sm text-white placeholder-white/35 outline-none transition focus:border-[#FFCC00]/60"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          {query && (
            <button onClick={clearAll} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Category", value: category, set: setCategory, opts: categories, placeholder: "All Categories" },
            { label: "Location", value: location, set: setLocation, opts: locations, placeholder: "All Locations" },
            { label: "Sector", value: sector, set: setSector, opts: sectors, placeholder: "All Sectors" },
          ].map((f) => (
            <div key={f.label}>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-white/50">{f.label}</label>
              <select
                value={f.value}
                onChange={(e) => { f.set(e.target.value); setShowResults(true); }}
                className="w-full rounded-xl border border-white/15 py-2.5 px-3 text-sm text-white/85 outline-none transition focus:border-[#FFCC00]/60"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <option value="">{f.placeholder}</option>
                {f.opts.map((o) => (
                  <option key={o} value={o} style={{ background: "#0B1E3D" }}>{o}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="mt-4 w-full rounded-xl bg-[#FFCC00] py-3.5 text-sm font-black text-[#092E6D] hover:bg-[#E6B800] transition shadow-[0_0_30px_rgba(255,204,0,0.25)] flex items-center justify-center gap-2"
        >
          <Search size={16} />
          Search Vessels
        </button>

        {/* Inline results dropdown */}
        <AnimatePresence>
          {showResults && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-white/10 divide-y divide-white/5"
              style={{ background: "#0B1E3D" }}
            >
              {results.map((v) => (
                <Link
                  key={v.id}
                  to={`/vessels/${v.id}`}
                  onClick={() => setShowResults(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition group"
                >
                  <img src={v.image} alt={v.title} className="h-10 w-14 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate group-hover:text-[#FFCC00] transition">{v.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs font-bold text-[#FFCC00]">{v.agmId}</span>
                      <span className="text-[11px] text-white/40">{v.location}</span>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-white/60 shrink-0">{v.price}</div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────────── Feature highlight ─────────────── */
const features = [
  { icon: Globe, title: "Worldwide Reach", desc: "Listings from North Sea to West Africa, Mediterranean to South East Asia.", color: "#6B96F0" },
  { icon: Shield, title: "Trusted Brokerage", desc: "15+ years of specialist knowledge in commercial workboat sales & charter.", color: "#FFCC00" },
  { icon: Zap, title: "Fast Turnaround", desc: "Respond to enquiries within 24 hours. Your time matters at sea and on shore.", color: "#25D366" },
  { icon: BarChart3, title: "Market Intelligence", desc: "Up-to-date pricing and market insight from our expert S&P brokers.", color: "#FF6B6B" },
];

/* ─────────────── FAQ (SEO / GEO) ─────────────── */
const faqs = [
  {
    q: "Where can I find vessels for sale in Nigeria?",
    a: "AGMS Ltd. lists tugs, barges, oil tankers, AHTS, PSVs and crew boats for sale in Nigeria and worldwide from our brokerage desk in Port Harcourt. Browse the live inventory on our vessels page or contact us for vessels held off-market.",
  },
  {
    q: "Do you help buy or charter a vessel in Port Harcourt?",
    a: "Yes. We provide sale and purchase (S&P) brokerage, plus time, bareboat and spot chartering across Port Harcourt, Lagos, Warri, Onne and the wider West African region. Our brokers handle valuation, inspection and negotiation.",
  },
  {
    q: "What types of commercial vessels do you broker?",
    a: "We broker tugs, barges, oil and chemical tankers, AHTS, platform supply vessels (PSVs), crew transfer vessels, dredgers, and multi-purpose workboats for the offshore, coastal and inland sectors.",
  },
  {
    q: "Do you offer vessel charter in West Africa?",
    a: "Yes — time, bareboat and spot chartering across Nigeria, Ghana, Gabon, Cameroon and West Africa. Tell us your route, cargo, crew and duration and we will match a suitable vessel.",
  },
  {
    q: "How do I enquire about a vessel?",
    a: "Submit an enquiry from our contact page, email info@agms.com.ng, or WhatsApp +234 807 349 2253 quoting the AGM ID. Our brokerage desk responds within 24 hours.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/* ─────────────── Home page ─────────────── */
export default function Home() {
  useSeo({
    title: "Marine Listing Website in Nigeria | Vessels for Sale & Charter — AGMS Ltd.",
    description:
      "AGMS Ltd. — marine listing website in Nigeria. Browse vessels for sale and charter in Port Harcourt: tugs, barges, tankers, AHTS, PSVs and workboats. Enquire today.",
    path: "/",
    jsonLd: faqJsonLd,
  });
  const { vessels } = usePublishedVessels();
  const latest = vessels.slice(0, 6);
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ background: "var(--dark-bg)" }}>
      {/* ── HERO SLIDER ── */}
      <HeroSlider />

      {/* ── QUICK NAV + SEARCH ── */}
      <section className="relative z-20 -mt-8 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mx-auto max-w-6xl">
          {/* Quick nav grid */}
          <div className="grid grid-cols-2 gap-3 mb-8 lg:grid-cols-4">
            {quickNav.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <Link
                    to={card.to}
                    className={`quick-nav-card bg-gradient-to-br ${card.gradient} border border-white/10`}
                  >
                    {/* Badge */}
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: card.accent + "20", color: card.accent }}
                    >
                      {card.badge}
                    </span>

                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: card.accent + "20" }}
                    >
                      <Icon size={22} style={{ color: card.accent }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white leading-tight sm:text-base">{card.label}</h3>
                      <p className="mt-1 text-[11px] text-white/50 leading-snug hidden sm:block">{card.desc}</p>
                    </div>
                    <ArrowRight size={16} style={{ color: card.accent }} className="mt-auto" />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Advanced Search */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <AdvancedSearch />
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="px-4 py-14 sm:px-6 lg:px-8" style={{ background: "rgba(9,46,109,0.08)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s, i) => (
              <AnimatedStat key={s.label} stat={s} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST LISTINGS ── */}
      <section ref={sectionRef} className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <div className="mb-1 text-[11px] font-black uppercase tracking-widest text-[#FFCC00]">LIVE INVENTORY</div>
              <h2 className="text-3xl font-black text-white sm:text-4xl">Latest Listings</h2>
            </div>
            <Link
              to="/vessels"
              className="flex items-center gap-2 rounded-xl border border-[#FFCC00]/30 px-5 py-2.5 text-sm font-bold text-[#FFCC00] hover:bg-[#FFCC00]/10 transition"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="gradient-divider mb-8" />

          <div className="grid gap-4 md:grid-cols-2">
            {latest.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <VesselCard vessel={v} />
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/vessels"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FFCC00] px-8 py-4 text-base font-black text-[#092E6D] hover:bg-[#E6B800] transition shadow-[0_0_40px_rgba(255,204,0,0.25)]"
            >
              <Ship size={18} />
              Browse All {vessels.length} Vessels
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY AGMS ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8" style={{ background: "rgba(9,46,109,0.1)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <div className="mb-2 text-[11px] font-black uppercase tracking-widest text-[#FFCC00]">WHY CHOOSE US</div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">The AGMS Advantage</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="rounded-2xl border border-white/8 p-6 transition hover:border-white/20"
                  style={{ background: "rgba(11,30,61,0.8)" }}
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: f.color + "15" }}
                  >
                    <Icon size={22} style={{ color: f.color }} />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-white">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <div className="mb-2 text-[11px] font-black uppercase tracking-widest text-[#FFCC00]">FAQ</div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Buying &amp; Chartering in Nigeria</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-white/10 p-5 transition hover:border-white/20"
                style={{ background: "rgba(11,30,61,0.7)" }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-white">
                  {f.q}
                  <ChevronRight size={18} className="shrink-0 text-[#FFCC00] transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl p-10 text-center"
            style={{
              background: "linear-gradient(135deg, #092E6D 0%, #1a4a9e 50%, #092E6D 100%)",
              border: "1px solid rgba(255,204,0,0.2)",
            }}
          >
            {/* Decorative circle */}
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-10" style={{ background: "#FFCC00" }} />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-10" style={{ background: "#FFCC00" }} />

            <div className="relative z-10">
              <div className="mb-3 text-[11px] font-black uppercase tracking-widest text-[#FFCC00]">GET IN TOUCH</div>
              <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
                Looking for a Specific Vessel?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-base text-white/70 leading-relaxed">
                Tell us your requirements — tugs, barges, crew transfer vessels, dredgers, OSVs or passenger craft — and our brokers will search the worldwide market on your behalf.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/vessels" className="btn-hero-primary">
                  <Ship size={16} />
                  Vessel Search
                </Link>
                <Link to="/contact" className="btn-hero-secondary">
                  Contact a Broker
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
