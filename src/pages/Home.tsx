import { Link } from "react-router-dom";
import { usePublishedVessels } from "../lib/useVessels";
import VesselCard from "../components/VesselCard";

export default function Home() {
  const { vessels } = usePublishedVessels();
  const latest = vessels.slice(0, 8);

  return (
    <div className="mx-auto max-w-[1180px] px-3 py-5 sm:px-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#092E6D]">Latest listings</h2>
        <Link
          to="/vessels"
          className="text-sm font-semibold text-[#3A64C2] hover:underline"
        >
          View all vessels →
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {latest.map((v) => (
          <VesselCard key={v.id} vessel={v} />
        ))}
      </div>

      <div className="mt-8 rounded bg-[#092E6D] p-6 text-center text-white sm:p-10">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Looking for a specific vessel?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/85">
          Tell us your requirements — tugs, barges, crew transfer vessels,
          dredgers, OSVs or passenger craft — and our brokers will search the
          worldwide market on your behalf.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/vessels"
            className="rounded bg-[#FFCC00] px-6 py-3 font-bold text-[#092E6D] transition hover:brightness-95"
          >
            Vessel Search
          </Link>
          <Link
            to="/contact"
            className="rounded border-2 border-white px-6 py-3 font-bold text-white transition hover:bg-white hover:text-[#092E6D]"
          >
            Contact a Broker
          </Link>
        </div>
      </div>
    </div>
  );
}
