import { Link, useParams } from "react-router-dom";
import { useVessel } from "../lib/useVessels";

export default function VesselDetail() {
  const { id } = useParams();
  const { vessel, loading } = useVessel(id);

  if (loading)
    return (
      <div className="mx-auto max-w-3xl p-10 text-center text-slate-600">
        Loading vessel…
      </div>
    );

  if (!vessel)
    return (
      <div className="mx-auto max-w-3xl p-10 text-center">
        <h1 className="text-2xl font-bold text-[#092E6D]">Vessel not found</h1>
        <Link to="/vessels" className="mt-4 inline-block text-[#3A64C2]">
          Back to vessel search
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-[1180px] px-3 py-6 sm:px-5">
      <Link to="/vessels" className="text-sm text-[#3A64C2] hover:underline">
        ← Back to Vessel Search
      </Link>
      <h1 className="mb-5 mt-3 text-2xl font-bold leading-snug text-[#092E6D] sm:text-4xl">
        {vessel.title}
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <img
          src={vessel.image}
          alt={vessel.title}
          className="w-full rounded object-cover"
        />
        <div className="rounded bg-[#E5E5E5] p-5">
          <h2 className="mb-3 text-xl font-bold text-[#092E6D]">
            Key particulars
          </h2>
          <dl className="divide-y divide-white/70">
            {[
              { label: "WBS ID", value: vessel.wbsId },
              { label: "Sector", value: vessel.sector },
              { label: "Type", value: vessel.category },
              { label: "Dimensions", value: vessel.description },
              { label: "Location", value: vessel.location },
              { label: "Price", value: vessel.price },
              ...vessel.specs,
            ].map((s) => (
              <div key={s.label} className="grid grid-cols-2 gap-3 py-2 text-[15px]">
                <dt className="font-bold uppercase text-[#333]">{s.label}:</dt>
                <dd className="text-[#666]">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-8 max-w-3xl">
        <h2 className="mb-2 text-2xl font-bold text-[#092E6D]">Description</h2>
        <p className="leading-relaxed text-slate-700">{vessel.summary}</p>
        <p className="mt-4 text-sm text-slate-500">
          Details given in good faith but without guarantee. Offered subject to
          prior sale, charter or withdrawal without notice.
        </p>
        <Link
          to="/contact"
          className="mt-6 inline-block rounded bg-[#FFCC00] px-6 py-3 font-bold text-[#092E6D] hover:brightness-95"
        >
          Enquire about {vessel.wbsId}
        </Link>
      </div>
    </div>
  );
}
