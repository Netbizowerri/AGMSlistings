import { useMemo, useState } from "react";
import { CATEGORY_LIST } from "../data/vessels";
import { usePublishedVessels } from "../lib/useVessels";
import VesselCard from "../components/VesselCard";

const ALL = "All";
const PAGE = 12;

export default function VesselSearch() {
  const [cat, setCat] = useState("");
  const [sec, setSec] = useState(ALL);
  const [loc, setLoc] = useState(ALL);
  const [limit, setLimit] = useState(PAGE);

  const { vessels, loading } = usePublishedVessels();

  // Derived from the loaded listings rather than module scope, so the dropdowns
  // reflect whatever is actually published in Firestore.
  const sectors = useMemo(
    () => [ALL, ...Array.from(new Set(vessels.map((v) => v.sector))).sort()],
    [vessels]
  );
  const locations = useMemo(
    () => [ALL, ...Array.from(new Set(vessels.map((v) => v.location))).sort()],
    [vessels]
  );

  const results = useMemo(
    () =>
      vessels.filter(
        (v) =>
          (cat === "" || v.category === cat) &&
          (sec === ALL || v.sector === sec) &&
          (loc === ALL || v.location === loc)
      ),
    [vessels, cat, sec, loc]
  );

  const Select = ({
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
    <label className="block text-sm">
      <span className="mb-1 block font-bold uppercase text-[#092E6D]">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => {
          set(e.target.value);
          setLimit(PAGE);
        }}
        className="w-full rounded border border-[#3A64C2] bg-white px-3 py-2.5 text-[15px] outline-none focus:border-[#092E6D] focus:ring-2 focus:ring-[#3A64C2]/30"
      >
        {placeholder ? (
          <option value="">{placeholder}</option>
        ) : (
          <option value="">{ALL}</option>
        )}
        {opts.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="mx-auto max-w-[1180px] px-3 py-6 sm:px-5">
      <h1 className="mb-5 text-3xl font-bold text-[#092E6D]">Vessel Search</h1>

      <div className="mb-6 grid gap-4 rounded bg-[#E5E5E5] p-4 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          label="Category"
          value={cat}
          set={setCat}
          opts={CATEGORY_LIST}
          placeholder="Select Category..."
        />
        <Select label="Sector" value={sec} set={setSec} opts={sectors} />
        <Select label="Location" value={loc} set={setLoc} opts={locations} />
      </div>

      <p className="mb-4 text-sm text-slate-600">
        {loading
          ? "Loading listings…"
          : `${results.length} vessel${results.length === 1 ? "" : "s"} found${
              cat ? ` in ${cat}` : ""
            }`}
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {results.slice(0, limit).map((v) => (
          <VesselCard key={v.id} vessel={v} />
        ))}
      </div>

      {results.length === 0 && !loading && (
        <p className="rounded bg-[#E5E5E5] p-8 text-center text-slate-600">
          No vessels currently listed in this category. Please contact us with
          your requirements and we will search the market for you.
        </p>
      )}

      {results.length > limit && (
        <div className="mt-7 text-center">
          <button
            onClick={() => setLimit((l) => l + PAGE)}
            className="rounded border-2 border-[#092E6D] px-7 py-3 font-bold text-[#092E6D] transition hover:bg-[#092E6D] hover:text-white"
          >
            Show more listings ({results.length - limit} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
