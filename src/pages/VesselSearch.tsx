import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Ship,
  SlidersHorizontal,
  MapPin,
  ChevronDown,
  Loader2,
  Tag,
  AlertCircle,
  Mail,
} from "lucide-react";
import { CATEGORY_LIST } from "../data/vessels";
import { usePublishedVessels } from "../lib/useVessels";
import { useSeo } from "../lib/seo";
import VesselCard from "../components/VesselCard";

const ALL = "All";
const PAGE = 12;

export default function VesselSearch() {
  useSeo({
    title: "Vessels for Sale & Charter in Nigeria | Tugs, Barges, Tankers — AGMS Ltd.",
    description:
      "Browse vessels for sale and charter in Nigeria and worldwide. Tugs, barges, oil tankers, AHTS, PSVs, crew transfer vessels and dredgers — updated daily by AGMS Ltd., Port Harcourt.",
    path: "/vessels",
  });
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [cat, setCat] = useState(searchParams.get("category") ?? "");
  const [sec, setSec] = useState(searchParams.get("sector") ?? ALL);
  const [loc, setLoc] = useState(searchParams.get("location") ?? ALL);
  const [listingId, setListingId] = useState(searchParams.get("listingId") ?? searchParams.get("agmId") ?? "");
  const [limit, setLimit] = useState(PAGE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { vessels, loading } = usePublishedVessels();

  const sectors = useMemo(
    () => [ALL, ...Array.from(new Set(vessels.map((v) => v.sector))).sort()],
    [vessels]
  );
  const locations = useMemo(
    () => [ALL, ...Array.from(new Set(vessels.map((v) => v.location))).sort()],
    [vessels]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const listing = listingId.trim().toLowerCase();
    return vessels.filter((v) => {
      const matchQ =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.agmId.toLowerCase().replace(/\s+/g, " ").includes(q) ||
        v.agmId.toLowerCase().replace(/\s+/g, "").includes(q.replace(/\s+/g, "")) ||
        v.category.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.sector.toLowerCase().includes(q);
      const matchListing =
        !listing ||
        v.agmId.toLowerCase().replace(/\s+/g, " ").includes(listing) ||
        v.agmId.toLowerCase().replace(/\s+/g, "").includes(listing.replace(/\s+/g, "")) ||
        v.id.toLowerCase().replace(/\s+/g, "").includes(listing.replace(/\s+/g, ""));
      const matchCat = cat === "" || v.category === cat;
      const matchSec = sec === ALL || v.sector === sec;
      const matchLoc = loc === ALL || v.location === loc;
      return matchQ && matchCat && matchSec && matchLoc && matchListing;
    });
  }, [vessels, query, cat, sec, loc, listingId]);

  const hasActiveFilter = query || cat || sec !== ALL || loc !== ALL || listingId;

  /**
   * What to offer when the filters match nothing.
   *
   * `results` is empty by definition here, so this is simply the unfiltered
   * catalogue — today that is the "For Sale" inventory. Showing it keeps the
   * page useful when a visitor picks a category the admin has not populated
   * yet, instead of dead-ending on "no vessels found".
   */
  const fallback = useMemo(() => vessels, [vessels]);

  const clearAll = () => {
    setQuery("");
    setCat("");
    setSec(ALL);
    setLoc(ALL);
    setListingId("");
    setLimit(PAGE);
  };

  // Reset pagination on filter change
  useEffect(() => { setLimit(PAGE); }, [query, cat, sec, loc, listingId]);

  const FilterSelect = ({
    label,
    value,
    set,
    opts,
    placeholder,
  }: {
    label: string;
    value: string;
    set: (v: string) => void;
    opts: string[];
    placeholder?: string;
  }) => (
    <div className="relative">
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/40">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => { set(e.target.value); setLimit(PAGE); }}
          className="w-full appearance-none rounded-xl border border-white/12 bg-white/6 px-4 py-3 pr-10 text-sm text-white/85 outline-none transition focus:border-[#FFCC00]/60 focus:ring-2 focus:ring-[#FFCC00]/10"
          style={{ background: "rgba(11,30,61,0.6)" }}
        >
          {placeholder ? <option value="">{placeholder}</option> : <option value={ALL}>{ALL}</option>}
          {opts.filter((o) => o !== ALL).map((o) => (
            <option key={o} value={o} style={{ background: "#0B1E3D" }}>{o}</option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
      </div>
    </div>
  );

  return (
    <div style={{ background: "var(--dark-bg)" }} className="min-h-screen">
      {/* Page hero */}
      <div
        className="relative overflow-hidden px-4 py-14 sm:px-6 lg:px-8"
        style={{
          background: "linear-gradient(180deg, #071838 0%, #050F24 100%)",
          borderBottom: "1px solid rgba(255,204,0,0.1)",
        }}
      >
        {/* decorative */}
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full opacity-5 blur-3xl" style={{ background: "#FFCC00" }} />
        <div className="absolute -bottom-16 left-10 h-48 w-48 rounded-full opacity-5 blur-3xl" style={{ background: "#3A64C2" }} />

        <div className="mx-auto max-w-6xl relative z-10">
          <div className="mb-2 text-[11px] font-black uppercase tracking-widest text-[#FFCC00]">BROWSE INVENTORY</div>
          <h1 className="mb-4 text-4xl font-black text-white sm:text-5xl">Vessel Search</h1>
          <p className="text-base text-white/55 max-w-xl">
            Search our worldwide fleet by AGM ID, vessel type, location or sector. Updated daily.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search bar */}
        <div className="mb-5 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search by name, AGM ID (e.g. "AGM 1005"), category, location…'
            className="search-input w-full rounded-xl border border-white/12 py-4 pl-11 pr-12 text-sm text-white placeholder-white/30 outline-none transition"
            style={{ background: "rgba(11,30,61,0.7)" }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter toggle (mobile) + filter bar */}
        <div className="mb-6">
          <button
            onClick={() => setFiltersOpen((f) => !f)}
            className="mb-4 flex items-center gap-2 rounded-xl border border-white/12 px-5 py-2.5 text-sm font-semibold text-white/70 hover:text-white hover:border-white/25 transition sm:hidden"
            style={{ background: "rgba(11,30,61,0.5)" }}
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasActiveFilter && <span className="ml-1 h-2 w-2 rounded-full bg-[#FFCC00]" />}
            <ChevronDown size={13} className={`ml-auto transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence initial={false}>
            {(filtersOpen || true) && (
              <motion.div
                initial={false}
                className="rounded-2xl border border-white/10 p-5"
                style={{ background: "rgba(11,30,61,0.6)" }}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <FilterSelect label="Category" value={cat} set={setCat} opts={CATEGORY_LIST} placeholder="All Categories" />
                  <FilterSelect label="Sector" value={sec} set={setSec} opts={sectors} />
                  <FilterSelect label="Location" value={loc} set={setLoc} opts={locations} />
                  <div className="relative">
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/40">Listing ID</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={listingId}
                        onChange={(e) => { setListingId(e.target.value); setLimit(PAGE); }}
                        placeholder="AGM 1005"
                        className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white/85 outline-none transition focus:border-[#FFCC00]/60 focus:ring-2 focus:ring-[#FFCC00]/10"
                        style={{ background: "rgba(11,30,61,0.6)" }}
                      />
                    </div>
                  </div>
                </div>

                {hasActiveFilter && (
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={clearAll}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#FFCC00]/70 hover:text-[#FFCC00] transition"
                    >
                      <X size={12} /> Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-white/40">
                <Loader2 size={14} className="animate-spin" />
                Loading listings…
              </div>
            ) : (
              <div className="text-sm text-white/50">
                <span className="font-bold text-white">{results.length}</span>{" "}
                vessel{results.length !== 1 ? "s" : ""} found
                {cat ? ` in ${cat}` : ""}
              </div>
            )}
          </div>

          {hasActiveFilter && (
            <div className="flex flex-wrap gap-2">
              {query && (
                <span className="flex items-center gap-1 rounded-full bg-[#FFCC00]/15 px-3 py-1 text-[11px] font-bold text-[#FFCC00]">
                  <Search size={10} />
                  "{query}"
                  <button onClick={() => setQuery("")} className="ml-1"><X size={9} /></button>
                </span>
              )}
              {cat && (
                <span className="flex items-center gap-1 rounded-full bg-[#3A64C2]/20 px-3 py-1 text-[11px] font-bold text-[#6B96F0]">
                  <Tag size={10} />
                  {cat}
                  <button onClick={() => setCat("")} className="ml-1"><X size={9} /></button>
                </span>
              )}
              {sec !== ALL && (
                <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/70">
                  {sec}
                  <button onClick={() => setSec(ALL)} className="ml-1"><X size={9} /></button>
                </span>
              )}
              {loc !== ALL && (
                <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/70">
                  <MapPin size={10} />
                  {loc}
                  <button onClick={() => setLoc(ALL)} className="ml-1"><X size={9} /></button>
                </span>
              )}
              {listingId && (
                <span className="flex items-center gap-1 rounded-full bg-[#FFCC00]/15 px-3 py-1 text-[11px] font-bold text-[#FFCC00]">
                  ID: {listingId}
                  <button onClick={() => setListingId("")} className="ml-1"><X size={9} /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Vessel grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {results.slice(0, limit).map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 5) * 0.05, duration: 0.35 }}
            >
              <VesselCard vessel={v} />
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {results.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mt-8 rounded-2xl border border-white/10 p-8 text-center sm:p-12">
              <AlertCircle size={40} className="mx-auto mb-4 text-white/25" />
              <h3 className="mb-2 text-lg font-bold text-white">
                {cat ? `No ${cat} currently listed` : "No vessels found"}
              </h3>
              <p className="mx-auto max-w-lg text-sm text-white/40">
                {cat
                  ? `We are not currently offering anything under ${cat}. Our broker keeps this category on file — send us your requirement and we will source it for you. Meanwhile, here is what is available today.`
                  : "No vessels currently match your search. Please contact us with your requirements."}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={clearAll}
                  className="rounded-xl bg-[#FFCC00] px-6 py-3 text-sm font-bold text-[#092E6D] hover:bg-[#E6B800] transition"
                >
                  Clear Filters
                </button>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-[#FFCC00]/40 px-6 py-3 text-sm font-bold text-[#FFCC00] hover:bg-[#FFCC00]/10 transition"
                >
                  <Mail size={15} />
                  Request a {cat || "vessel"}
                </Link>
              </div>
            </div>

            {/* Never dead-end: when a chosen category is empty we still surface
                the listings we DO have, so the page converts instead of
                stranding the visitor. Only shown when the catalogue itself is
                non-empty, otherwise there would be nothing to offer. */}
            {fallback.length > 0 && (
              <div className="mt-10">
                <div className="mb-4 flex items-center gap-3">
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#FFCC00]">
                    Available now
                  </h4>
                  <span className="text-xs text-white/40">
                    {fallback.length} vessel{fallback.length !== 1 ? "s" : ""} currently offered
                  </span>
                </div>
                <div className="gradient-divider mb-6" />
                <div className="grid gap-4 md:grid-cols-2">
                  {fallback.map((v, i) => (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i, 5) * 0.05, duration: 0.35 }}
                    >
                      <VesselCard vessel={v} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Load more */}
        {results.length > limit && (
          <div className="mt-10 text-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLimit((l) => l + PAGE)}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#FFCC00]/40 px-8 py-3.5 text-sm font-bold text-[#FFCC00] hover:bg-[#FFCC00]/10 transition"
            >
              <Ship size={16} />
              Show more listings ({results.length - limit} remaining)
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
