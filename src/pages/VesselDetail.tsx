import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Tag,
  Ship,
  Ruler,
  Zap,
  Shield,
  Hash,
  MessageCircle,
  Phone,
  Layers,
} from "lucide-react";
import { useVessel } from "../lib/useVessels";
import { useSeo } from "../lib/seo";

const specIcons: Record<string, React.ElementType> = {
  "Built": Zap,
  "LOA": Ruler,
  "Beam": Ruler,
  "Draft": Ruler,
  "Power / capacity": Zap,
  "Class": Shield,
};

export default function VesselDetail() {
  const { id } = useParams();
  const { vessel, loading } = useVessel(id);

  useSeo({
    title: vessel
      ? `${vessel.title} (${vessel.agmId}) — For Sale & Charter | AGMS Ltd.`
      : "Vessel Listing — For Sale & Charter | AGMS Ltd.",
    description: vessel
      ? `${vessel.title} — ${vessel.category} for sale in ${vessel.location}. ${vessel.summary ?? ""}`.trim().slice(0, 300)
      : "View vessel particulars, dimensions and pricing from AGMS Ltd., marine brokerage in Port Harcourt, Nigeria.",
    path: `/vessels/${id ?? ""}`,
    image: vessel?.image,
    type: "article",
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--dark-bg)" }}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#FFCC00]/20 border-t-[#FFCC00]" />
          <p className="text-sm text-white/40">Loading vessel…</p>
        </div>
      </div>
    );
  }

  if (!vessel) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--dark-bg)" }}>
        <div className="text-center">
          <Ship size={48} className="mx-auto mb-4 text-white/20" />
          <h1 className="mb-2 text-2xl font-bold text-white">Vessel Not Found</h1>
          <p className="mb-6 text-white/40">This listing may have been removed or sold.</p>
          <Link
            to="/vessels"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FFCC00] px-6 py-3 font-bold text-[#092E6D] hover:bg-[#E6B800] transition"
          >
            <ArrowLeft size={16} />
            Back to Vessel Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--dark-bg)" }} className="min-h-screen">
      {/* Back nav */}
      <div className="border-b border-white/8 px-4 py-4 sm:px-6 lg:px-8" style={{ background: "rgba(9,46,109,0.2)" }}>
        <div className="mx-auto max-w-6xl">
          <Link
            to="/vessels"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-[#FFCC00] transition"
          >
            <ArrowLeft size={15} />
            Back to Vessel Search
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          {/* AGM ID badge */}
          <div className="mb-3 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#FFCC00] px-4 py-1.5 text-sm font-black text-[#092E6D]">
              <Hash size={13} />
              {vessel.agmId}
            </span>
            <span className="rounded-xl border border-[#3A64C2]/40 bg-[#3A64C2]/15 px-4 py-1.5 text-xs font-bold text-[#6B96F0]">
              {vessel.sector}
            </span>
            <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold text-white/60">
              {vessel.category}
            </span>
          </div>

          <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
            {vessel.title}
          </h1>

          <div className="mt-3 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-white/50">
              <MapPin size={14} className="text-[#FFCC00]" />
              {vessel.location}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-[#FFCC00]">
              <Tag size={14} />
              {vessel.price}
            </div>
          </div>
        </motion.div>

        {/* Content grid */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <img
              src={vessel.image}
              alt={vessel.title}
              className="h-72 w-full object-cover sm:h-96"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050F24]/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="rounded-xl bg-[#FFCC00] px-4 py-2 text-sm font-black text-[#092E6D]">
                {vessel.agmId}
              </span>
            </div>
          </motion.div>

          {/* Key particulars */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl border border-white/10 p-6"
            style={{ background: "rgba(11,30,61,0.8)" }}
          >
            <h2 className="mb-4 text-lg font-black text-white">Key Particulars</h2>
            <div className="gradient-divider mb-4" />
            <dl className="space-y-3">
              {[
                { label: "AGM ID", value: vessel.agmId, icon: Hash },
                { label: "Sector", value: vessel.sector, icon: Layers },
                { label: "Type", value: vessel.category, icon: Ship },
                { label: "Dimensions", value: vessel.description, icon: Ruler },
                { label: "Location", value: vessel.location, icon: MapPin },
                { label: "Price", value: vessel.price, icon: Tag },
                ...vessel.specs,
                ...(vessel.particulars ?? []),
              ].map((s) => {
                const Icon = specIcons[s.label] ?? Hash;
                return (
                  <div key={s.label} className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-white/5 transition">
                    <Icon size={14} className="mt-0.5 shrink-0 text-[#FFCC00]/60" />
                    <div className="flex flex-1 items-start justify-between gap-2">
                      <dt className="text-xs font-bold uppercase tracking-wider text-white/40">{s.label}</dt>
                      <dd className="text-right text-sm font-semibold text-white/85 max-w-[55%]">{s.value}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          </motion.div>
        </div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6 rounded-2xl border border-white/10 p-6"
          style={{ background: "rgba(11,30,61,0.6)" }}
        >
          <h2 className="mb-4 text-lg font-black text-white">Description</h2>
          <div className="gradient-divider mb-4" />
          <p className="leading-relaxed text-white/70">{vessel.details ?? vessel.summary}</p>
          {vessel.remarks && vessel.remarks.length > 0 && (
            <>
              <h3 className="mt-6 mb-3 text-xs font-black uppercase tracking-wider text-white/40">
                Remarks
              </h3>
              <ul className="space-y-2">
                {vessel.remarks.map((remark) => (
                  <li key={remark} className="flex gap-2.5 text-sm leading-relaxed text-white/70">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#FFCC00]" />
                    {remark}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-4 text-xs text-white/30 italic">
            Details given in good faith but without guarantee. Offered subject to prior sale, charter or withdrawal without notice.
          </p>
        </motion.div>

        {/* Enquiry CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 rounded-2xl border border-[#FFCC00]/20 p-6"
          style={{ background: "linear-gradient(135deg, rgba(9,46,109,0.6) 0%, rgba(26,74,158,0.4) 100%)" }}
        >
          <h3 className="mb-1 text-base font-black text-white">Interested in {vessel.agmId}?</h3>
          <p className="mb-5 text-sm text-white/50">
            {vessel.contact
              ? `For full particulars, inspection or offers, contact ${vessel.contact} or our brokerage desk.`
              : "Contact our brokers to get full particulars, schedule an inspection, or make an offer."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="flex items-center gap-2 rounded-xl bg-[#FFCC00] px-6 py-3 text-sm font-black text-[#092E6D] hover:bg-[#E6B800] transition shadow-[0_0_30px_rgba(255,204,0,0.2)]"
            >
              <MessageCircle size={15} />
              Enquire About This Vessel
            </Link>
            <a
              href="https://wa.me/2348073492253"
              className="flex items-center gap-2 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 px-6 py-3 text-sm font-bold text-[#25D366] hover:bg-[#25D366]/20 transition"
            >
              <Phone size={15} />
              WhatsApp Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
