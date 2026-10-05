import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Tag, Layers, ArrowRight, Ruler } from "lucide-react";
import type { Vessel } from "../data/vessels";

function SectorBadge({ sector }: { sector: string }) {
  const isCharter = sector.toLowerCase().includes("charter");
  const isSale = sector.toLowerCase().includes("sale");
  const bg = isCharter
    ? "bg-[#3A64C2]/20 text-[#6B96F0] border-[#3A64C2]/30"
    : isSale
    ? "bg-[#FFCC00]/15 text-[#FFCC00] border-[#FFCC00]/30"
    : "bg-white/10 text-white/70 border-white/15";
  return (
    <span className={`badge-pill border ${bg}`}>
      {sector}
    </span>
  );
}

export default function VesselCard({ vessel }: { vessel: Vessel }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }}>
      <Link
        to={`/vessels/${vessel.id}`}
        className="vessel-card-premium group flex w-full min-w-0 gap-0 overflow-hidden"
      >
        {/* Image */}
        <div className="relative shrink-0 w-36 sm:w-44 md:w-48 overflow-hidden">
          <img
            src={vessel.image}
            alt={vessel.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0B1E3D]/80" />
          {/* AGM badge */}
          <div className="absolute bottom-2 left-2 rounded-md bg-[#FFCC00] px-2 py-0.5 text-[10px] font-black text-[#092E6D] shadow">
            {vessel.agmId}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-w-0 flex-col justify-between p-4">
          <div>
            <div className="mb-2">
              <SectorBadge sector={vessel.sector} />
            </div>
            <h3 className="mb-2 text-[13px] font-bold leading-snug text-white group-hover:text-[#FFCC00] transition-colors duration-200 sm:text-[15px] line-clamp-2">
              {vessel.title}
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-white/55">
                <Layers size={11} className="text-[#3A64C2] shrink-0" />
                <span className="truncate">{vessel.category}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/55">
                <Ruler size={11} className="text-[#3A64C2] shrink-0" />
                <span className="truncate">{vessel.description}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/55">
                <MapPin size={11} className="text-[#FFCC00]/70 shrink-0" />
                <span className="truncate">{vessel.location}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Tag size={12} className="text-[#FFCC00]" />
              <span className="text-sm font-bold text-[#FFCC00]">{vessel.price}</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#3A64C2] opacity-0 transition-opacity group-hover:opacity-100">
              View details <ArrowRight size={10} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
