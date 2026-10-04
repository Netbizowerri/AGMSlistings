import { Link } from "react-router-dom";
import type { Vessel } from "../data/vessels";

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-1.5 py-[2px] text-xs leading-snug sm:grid sm:grid-cols-[115px_1fr] sm:gap-2 sm:text-[14px]">
    <span className="shrink-0 font-bold uppercase text-[#333] sm:w-auto">{label}:</span>
    <span className="min-w-0 break-words text-[#555]">{value}</span>
  </div>
);

export default function VesselCard({ vessel }: { vessel: Vessel }) {
  return (
    <Link
      to={`/vessels/${vessel.id}`}
      className="group flex w-full min-w-0 gap-3 overflow-hidden rounded bg-[#E5E5E5] p-2.5 transition hover:bg-[#dcdcdc] hover:shadow-md sm:gap-4 sm:p-4"
    >
      <img
        src={vessel.image}
        alt={vessel.title}
        loading="lazy"
        className="h-24 w-24 shrink-0 rounded object-cover sm:h-36 sm:w-40 md:h-40 md:w-44"
      />
      <div className="min-w-0 flex-1 overflow-hidden">
        <h3 className="mb-1.5 text-[13.5px] font-bold leading-snug text-[#092E6D] group-hover:underline break-words sm:mb-2 sm:text-lg md:text-xl">
          {vessel.title}
        </h3>
        <Row label="WBS ID" value={vessel.wbsId} />
        <Row label="Sector" value={vessel.sector} />
        <Row label="Description" value={vessel.description} />
        <Row label="Location" value={vessel.location} />
        <Row label="Price" value={vessel.price} />
      </div>
    </Link>
  );
}
