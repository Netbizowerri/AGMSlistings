import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Anchor,
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  Handshake,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Ship,
  Trash2,
  X,
} from "lucide-react";
import { firebaseConfigured } from "../lib/firebaseConfig";
import {
  BOOTSTRAP_EMAILS,
  ensureAdminClaim,
  sendAdminPasswordReset,
  signInAdmin,
  signOutAdmin,
  watchAuth,
} from "../lib/adminAuth";
import {
  createVessel,
  deleteVessel,
  listAllVessels,
  nextVesselId,
  nextAgmId,
  seedVessels,
  setVesselPublished,
  updateVessel,
  type AdminVessel,
} from "../lib/vessels";
import { deleteBroker, listBrokers, resolveBrokerId, type Broker } from "../lib/brokers";
import { CATEGORY_LIST } from "../data/vessels";

type Status = { kind: "ok" | "err"; text: string } | null;
type View = "dashboard" | "vessels" | "brokers";

const SPEC_LABELS = ["Built", "LOA", "Beam", "Draft", "Power / capacity", "Class"];

/* Shared class strings — the admin is fully dark, matching the public site's
   marine palette. Every text element carries an explicit colour: the body's
   light default (#f0f4ff) must never land on a light surface. */
const inputCls =
  "w-full rounded-lg border border-[#1B3465] bg-[#050F24] px-3 py-2 text-sm text-[#F0F4FF] placeholder:text-[#6B7FA6] transition-colors focus:border-[#FFCC00] focus:outline-none focus:ring-2 focus:ring-[#FFCC00]/25";
const selectCls = `${inputCls} admin-select`;
const ghostBtn =
  "flex items-center gap-2 rounded-lg border border-[#1B3465] px-3 py-2 text-sm font-medium text-[#93A5C4] transition-colors hover:border-[#3A64C2] hover:bg-[#12294D] hover:text-[#F0F4FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50 disabled:opacity-60";
const goldBtn =
  "flex items-center gap-2 rounded-lg bg-[#FFCC00] px-3 py-2 text-sm font-semibold text-[#092E6D] transition-all hover:bg-[#E6B800] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050F24] active:scale-[0.98] disabled:opacity-60";
const panelCls = "overflow-hidden rounded-xl border border-[#1B3465] bg-[#0B1E3D]";

function emptyDraft(id: string, agmId: string): AdminVessel {
  return {
    id,
    agmId,
    published: false,
    title: "",
    sector: "For sale",
    category: "Uncategorized",
    description: "",
    location: "",
    price: "POA",
    image: "",
    summary: "",
    specs: SPEC_LABELS.map((label) => ({ label, value: "—" })),
    details: "",
    remarks: [],
    particulars: [],
    contact: "",
  };
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={
        published
          ? "shrink-0 rounded-md border border-[#4ADE80]/30 bg-[#4ADE80]/10 px-2 py-0.5 text-[11px] font-semibold text-[#4ADE80]"
          : "shrink-0 rounded-md border border-[#FBBF24]/30 bg-[#FBBF24]/10 px-2 py-0.5 text-[11px] font-semibold text-[#FBBF24]"
      }
    >
      {published ? "Live" : "Draft"}
    </span>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#12294D] ${className ?? ""}`} />;
}

/* ------------------------------------------------------------------ gate */

export default function AdminLogin() {
  const { user, checking, isAdmin, detail } = useAdminSession();

  if (!firebaseConfigured) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050F24] px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-[#1B3465] bg-[#0B1E3D] p-6 sm:p-8">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFCC00]">
            <Ship size={20} className="text-[#092E6D]" />
          </div>
          <h1 className="text-xl font-semibold text-[#F0F4FF]">Admin setup required</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#93A5C4]">
            Firebase environment variables are missing. Copy{" "}
            <code className="rounded bg-[#050F24] px-1.5 py-0.5 text-[#FFCC00]">.env.example</code> to{" "}
            <code className="rounded bg-[#050F24] px-1.5 py-0.5 text-[#FFCC00]">.env.local</code>, fill in
            the Web app config, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#050F24]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#1B3465] border-t-[#FFCC00]" />
        <p className="text-sm text-[#93A5C4]">Checking session…</p>
      </div>
    );
  }

  if (user && isAdmin) return <AdminApp user={user} onSignOut={signOutAdmin} />;
  if (user) return <NotAnAdmin email={user.email} detail={detail} onSignOut={signOutAdmin} />;
  return <SignIn />;
}

function useAdminSession(): {
  user: User | null;
  checking: boolean;
  isAdmin: boolean;
  detail: string | null;
} {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);

  const onChange = useCallback((u: User | null) => {
    setUser(u);
    if (!u) {
      setIsAdmin(false);
      setDetail(null);
      setChecking(false);
      return;
    }
    setChecking(true);
    setDetail(null);
    ensureAdminClaim(u)
      .then((ok) => {
        setIsAdmin(ok);
        if (!ok) {
          setDetail(
            (u.email ?? "") in Object.fromEntries(BOOTSTRAP_EMAILS.map((e) => [e, 1]))
              ? "Firestore refused the admin record. Redeploy with `firebase deploy --only firestore`."
              : "This account is not one of the two owner accounts.",
          );
        }
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => watchAuth(onChange), [onChange]);

  return { user, checking, isAdmin, detail };
}

/* ----------------------------------------------------------------- shell */

function AdminApp({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [view, setView] = useState<View>("dashboard");
  const [navOpen, setNavOpen] = useState(false);
  const [all, setAll] = useState<AdminVessel[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>(null);
  const [editing, setEditing] = useState<AdminVessel | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const autoSeeded = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listAllVessels();
      setAll(rows);
      setBrokers(await listBrokers());
      setStatus(null);

      // First run against an empty database: import the existing catalogue so
      // the dashboard is immediately useful. Idempotent, so it cannot duplicate.
      if (rows.length === 0 && !autoSeeded.current) {
        autoSeeded.current = true;
        setStatus({ kind: "ok", text: "No listings found — importing the existing catalogue…" });
        const res = await seedVessels(false);
        setStatus({ kind: "ok", text: `Imported ${res.written} listings.` });
        setAll(await listAllVessels());
      }
    } catch (err) {
      setStatus({ kind: "err", text: readableFirestoreError(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Mobile drawer: lock background scroll and allow Esc to close.
  useEffect(() => {
    if (!navOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [navOpen]);

  const stats = useMemo(() => {
    const byCategory = new Map<string, number>();
    let live = 0;
    all.forEach((v) => {
      byCategory.set(v.category, (byCategory.get(v.category) ?? 0) + 1);
      if (v.published) live += 1;
    });
    return {
      total: all.length,
      live,
      drafts: all.length - live,
      categoryCount: byCategory.size,
      locations: new Set(all.map((v) => v.location)).size,
      sectors: new Set(all.map((v) => v.sector)).size,
      // Brokers with at least one listing currently in the catalogue.
      brokers: new Set(all.map((v) => v.brokerId ?? "").filter(Boolean)).size,
      categories: [...byCategory.entries()].sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
      ),
    };
  }, [all]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter(
      (v) =>
        (category === "" || v.category === category) &&
        (q === "" ||
          v.title.toLowerCase().includes(q) ||
          v.agmId.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q) ||
          v.id.includes(q)),
    );
  }, [all, category, search]);

  const brokerById = useMemo(() => new Map(brokers.map((b) => [b.id, b])), [brokers]);

  const brokerName = useCallback(
    (id?: string) => (id ? brokerById.get(id)?.name : undefined),
    [brokerById],
  );

  const runSeed = async () => {
    if (!window.confirm("Import any listings missing from the database?")) return;
    setSeeding(true);
    try {
      const res = await seedVessels(false);
      setStatus({
        kind: "ok",
        text: `Imported ${res.written}, skipped ${res.skipped} already present.`,
      });
      await refresh();
    } catch (err) {
      setStatus({ kind: "err", text: readableFirestoreError(err) });
    } finally {
      setSeeding(false);
    }
  };

  const openNew = async () => {
    setEditing(emptyDraft(await nextVesselId(), await nextAgmId()));
  };

  const menu: { key: View; label: string; icon: typeof Ship; count?: number }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "vessels", label: "Vessels", icon: Ship, count: stats.total },
    { key: "brokers", label: "Brokers", icon: Handshake, count: stats.brokers },
  ];

  const sidebarContent = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-[#1B3465] px-4 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFCC00] shadow-[0_0_18px_rgba(255,204,0,0.25)]">
          <Ship size={18} className="text-[#092E6D]" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-semibold text-[#F0F4FF]">AGMS Admin</p>
          <p className="truncate text-[11px] text-[#93A5C4]">Vessel listings console</p>
        </div>
        <button
          onClick={() => setNavOpen(false)}
          aria-label="Close menu"
          className="ml-auto rounded-lg p-1.5 text-[#93A5C4] transition-colors hover:bg-[#12294D] hover:text-[#F0F4FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50 md:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-2 py-2">
        <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B7FA6]">
          Menu
        </p>
        {menu.map((m) => {
          const Icon = m.icon;
          const active = view === m.key;
          return (
            <button
              key={m.key}
              onClick={() => {
                setView(m.key);
                setNavOpen(false);
              }}
              aria-current={active ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50 ${
                active
                  ? "bg-[#12294D] text-[#FFCC00] shadow-[inset_3px_0_0_#FFCC00]"
                  : "text-[#93A5C4] hover:bg-[#12294D]/60 hover:text-[#F0F4FF]"
              }`}
            >
              <Icon size={17} />
              <span className="flex-1">{m.label}</span>
              {m.count !== undefined && (
                <span className="rounded-md bg-[#050F24] px-1.5 py-0.5 text-[11px] tabular-nums text-[#93A5C4]">
                  {m.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#1B3465] p-3">
        <p className="truncate px-1 text-[11px] text-[#93A5C4]">Signed in as</p>
        <p className="truncate px-1 pb-1 text-sm font-medium text-[#F0F4FF]" title={user.email ?? ""}>
          {user.email}
        </p>
        <button
          onClick={async () => {
            if (!window.confirm("Sign out of the admin dashboard?")) return;
            await onSignOut();
          }}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#93A5C4] transition-colors hover:bg-[#F87171]/10 hover:text-[#F87171] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#050F24] text-[#F0F4FF]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#1B3465] bg-[#0B1E3D] md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            key="drawer"
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
              onClick={() => setNavOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-label="Navigation"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col border-r border-[#1B3465] bg-[#0B1E3D] shadow-[24px_0_60px_rgba(0,0,0,0.5)]"
            >
              {sidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex min-h-dvh flex-col md:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#1B3465] bg-[#050F24]/90 px-4 py-3 backdrop-blur md:px-6">
          <button
            onClick={() => setNavOpen(true)}
            className="rounded-lg border border-[#1B3465] p-2 text-[#93A5C4] transition-colors hover:bg-[#12294D] hover:text-[#F0F4FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-[#F0F4FF] md:text-base">
              {view === "dashboard"
                ? "Dashboard"
                : view === "brokers"
                ? "Brokers"
                : "Vessel listings"}
            </h1>
            <p className="hidden text-[11px] text-[#93A5C4] sm:block">
              {view === "dashboard"
                ? "AGMS brokerage console"
                : view === "brokers"
                ? `${stats.brokers} broker${stats.brokers === 1 ? "" : "s"} with listings in the catalogue`
                : `${stats.total} listings in the catalogue`}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => void refresh()}
              aria-label="Refresh listings"
              className={ghostBtn}
            >
              <RefreshCw size={15} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={openNew} aria-label="Add new vessel" className={goldBtn}>
              <Plus size={15} />
              <span className="hidden sm:inline">Add New</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {status && (
            <div
              role={status.kind === "err" ? "alert" : "status"}
              className={`mb-4 rounded-lg border-l-4 px-4 py-3 text-sm ${
                status.kind === "err"
                  ? "border-[#F87171] bg-[#F87171]/10 text-[#FCA5A5]"
                  : "border-[#4ADE80] bg-[#4ADE80]/10 text-[#86EFAC]"
              }`}
            >
              {status.text}
            </div>
          )}

          {loading ? (
            <DashboardSkeleton />
          ) : view === "dashboard" ? (
            <DashboardHome stats={stats} vessels={all} onOpenVessels={() => setView("vessels")} />
          ) : view === "brokers" ? (
            <BrokersView
              brokers={brokers}
              vessels={all}
              onDelete={async (id) => {
                // Un-pin the broker's vessels (they become admin-owned) so the
                // listing stays in the catalogue, then remove the record.
                for (const v of all.filter((x) => x.brokerId === id)) {
                  await updateVessel({ ...v, brokerId: "" }, v.published);
                }
                await deleteBroker(id);
                await refresh();
              }}
              onError={(t) => setStatus({ kind: "err", text: t })}
            />
          ) : (
            <VesselsView
              visible={visible}
              total={all.length}
              categories={stats.categories}
              category={category}
              setCategory={setCategory}
              search={search}
              setSearch={setSearch}
              seeding={seeding}
              brokerName={brokerName}
              onSeed={runSeed}
              onAdd={openNew}
              onEdit={setEditing}
              onRefresh={refresh}
              onError={(t) => setStatus({ kind: "err", text: t })}
            />
          )}
        </main>
      </div>

      {editing && (
        <VesselForm
          vessel={editing}
          categories={CATEGORY_LIST}
          brokers={brokers}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refresh();
          }}
          onError={(t) => setStatus({ kind: "err", text: t })}
          save={async (v) => {
            if (all.some((x) => x.id === v.id)) await updateVessel(v, v.published);
            else await createVessel(v, v.published);
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------- dashboard */

type Stats = {
  total: number;
  live: number;
  drafts: number;
  categoryCount: number;
  locations: number;
  sectors: number;
  brokers: number;
  categories: [string, number][];
};

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`${panelCls} p-4`}>
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="mt-4 h-6 w-16" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className={`${panelCls} p-4`}>
            <Skeleton className="h-4 w-32" />
            <div className="mt-4 space-y-3">
              {[0, 1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-8 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
}) {
  return (
    <div className={`${panelCls} p-4 transition-colors hover:border-[#3A64C2]/60`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3A64C2]/15 text-[#72AEE6]">
        {icon}
      </div>
      <p className="mt-4 text-2xl font-semibold tabular-nums leading-none text-[#F0F4FF]">{value}</p>
      <p className="mt-1.5 text-xs text-[#93A5C4]">{label}</p>
    </div>
  );
}

function DashboardHome({
  stats,
  vessels,
  onOpenVessels,
}: {
  stats: Stats;
  vessels: AdminVessel[];
  onOpenVessels: () => void;
}) {
  const max = Math.max(1, ...stats.categories.map(([, n]) => n));
  const recent = [...vessels]
    .sort((a, b) => Number(b.id.replace(/\D/g, "")) - Number(a.id.replace(/\D/g, "")))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Card label="Total vessels" value={stats.total} icon={<Ship size={18} />} />
        <Card label="Categories" value={stats.categoryCount} icon={<LayoutDashboard size={18} />} />
        <Card label="Live listings" value={stats.live} icon={<Eye size={18} />} />
        <Card label="Drafts" value={stats.drafts} icon={<EyeOff size={18} />} />
        <Card label="Locations" value={stats.locations} icon={<MapPin size={18} />} />
        <Card label="Sectors" value={stats.sectors} icon={<Anchor size={18} />} />
        <Card label="Brokers" value={stats.brokers} icon={<Handshake size={18} />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={panelCls}>
          <header className="flex items-center justify-between border-b border-[#1B3465] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#F0F4FF]">Categories</h2>
            <button
              onClick={onOpenVessels}
              className="text-xs font-medium text-[#72AEE6] transition-colors hover:text-[#FFCC00] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50"
            >
              Manage vessels
            </button>
          </header>
          <div className="p-4">
            {stats.categories.length === 0 ? (
              <Empty>No listings yet.</Empty>
            ) : (
              <ul className="space-y-3">
                {stats.categories.map(([name, n]) => (
                  <li key={name}>
                    <div className="flex justify-between text-sm">
                      <span className="truncate text-[#F0F4FF]">{name}</span>
                      <span className="ml-3 shrink-0 tabular-nums text-[#93A5C4]">{n}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#050F24]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#3A64C2] to-[#FFCC00] transition-all duration-500"
                        style={{ width: `${(n / max) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className={panelCls}>
          <header className="border-b border-[#1B3465] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#F0F4FF]">Latest listings</h2>
          </header>
          <div className="p-4">
            {recent.length === 0 ? (
              <Empty>No listings yet.</Empty>
            ) : (
              <ul className="space-y-1">
                {recent.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[#12294D]/60"
                  >
                    <img
                      src={v.image}
                      alt=""
                      className="h-10 w-14 shrink-0 rounded-md object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#F0F4FF]">{v.title}</p>
                      <p className="truncate text-xs tabular-nums text-[#93A5C4]">
                        {v.id} · {v.agmId} · {v.category}
                      </p>
                    </div>
                    <StatusBadge published={v.published} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-[#93A5C4]">{children}</p>;
}

/* --------------------------------------------------------------- vessels */

function VesselsView({
  visible,
  total,
  categories,
  category,
  setCategory,
  search,
  setSearch,
  seeding,
  brokerName,
  onSeed,
  onAdd,
  onEdit,
  onRefresh,
  onError,
}: {
  visible: AdminVessel[];
  total: number;
  categories: [string, number][];
  category: string;
  setCategory: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  seeding: boolean;
  brokerName: (id?: string) => string | undefined;
  onSeed: () => void;
  onAdd: () => void;
  onEdit: (v: AdminVessel) => void;
  onRefresh: () => Promise<void>;
  onError: (t: string) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allVisibleSelected = visible.length > 0 && visible.every((v) => selected.has(v.id));
  const someVisibleSelected = visible.some((v) => selected.has(v.id));

  const toggleAll = () =>
    setSelected(allVisibleSelected ? new Set() : new Set(visible.map((v) => v.id)));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected && !allVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  const bulkDelete = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    const label = ids.length === 1 ? "1 listing" : `${ids.length} listings`;
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await Promise.all(ids.map((id) => deleteVessel(id)));
      setSelected(new Set());
      await onRefresh();
    } catch (err) {
      onError(readableFirestoreError(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`${panelCls} p-3 sm:p-4`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7FA6]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, ID, location…"
              aria-label="Search listings"
              className={`${inputCls} pl-9`}
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className={`${selectCls} sm:w-auto`}
          >
            <option value="">All categories ({total})</option>
            {categories.map(([c, n]) => (
              <option key={c} value={c}>
                {c} ({n})
              </option>
            ))}
          </select>
          <div className="flex gap-2 sm:ml-auto">
            <button onClick={onSeed} disabled={seeding} className={`${ghostBtn} flex-1 justify-center sm:flex-none`}>
              <Download size={15} />
              {seeding ? "Importing…" : "Import missing"}
            </button>
            <button onClick={onAdd} className={`${goldBtn} flex-1 justify-center sm:flex-none`}>
              <Plus size={15} />
              Add New
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#93A5C4]">
          <span className="tabular-nums">{visible.length}</span> of{" "}
          <span className="tabular-nums">{total}</span> listings
        </p>
      </div>

      {visible.length === 0 ? (
        <div className={`${panelCls} px-6 py-12 text-center`}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#3A64C2]/15 text-[#72AEE6]">
            <Search size={22} />
          </div>
          <p className="mt-4 font-medium text-[#F0F4FF]">No listings found</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[#93A5C4]">
            {total === 0
              ? "Import the existing catalogue, or add a listing manually."
              : "Try a different search term or category."}
          </p>
          {total === 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button onClick={onSeed} disabled={seeding} className={goldBtn}>
                {seeding ? "Importing…" : "Import existing catalogue"}
              </button>
              <button onClick={onAdd} className={ghostBtn}>
                Add vessel
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Bulk selection toolbar */}
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#FFCC00]/30 bg-[#12294D] px-4 py-3">
              <span className="text-sm font-semibold text-[#F0F4FF]">
                <span className="tabular-nums">{selected.size}</span> selected
              </span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelected(new Set(visible.map((v) => v.id)))}
                  className="rounded-md px-2 py-1 text-xs font-medium text-[#93A5C4] transition-colors hover:bg-[#0B1E3D] hover:text-[#F0F4FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50"
                >
                  Select all visible
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="rounded-md px-2 py-1 text-xs font-medium text-[#93A5C4] transition-colors hover:bg-[#0B1E3D] hover:text-[#F0F4FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50"
                >
                  Clear
                </button>
              </div>
              <button
                onClick={bulkDelete}
                disabled={deleting}
                className="ml-auto flex items-center gap-2 rounded-lg border border-[#F87171]/50 bg-[#F87171]/10 px-3 py-2 text-sm font-semibold text-[#F87171] transition-colors hover:bg-[#F87171]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F87171]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050F24] disabled:opacity-60"
              >
                <Trash2 size={14} />
                {deleting ? "Deleting…" : `Delete (${selected.size})`}
              </button>
            </div>
          )}

          {/* Desktop table */}
          <div className={`hidden md:block ${panelCls}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1B3465] bg-[#050F24]/60">
                  <th scope="col" className="w-12 px-4 py-3">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                      aria-label="Select all visible listings"
                      className="h-4 w-4 shrink-0 accent-[#FFCC00]"
                    />
                  </th>
                  {[
                    "Image",
                    "Title",
                    "ID / WBS",
                    "Category",
                    "Location",
                    "Price",
                    "Broker",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#93A5C4]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
{visible.map((v) => (
                <tr
                  key={v.id}
                  className={`border-b border-[#1B3465]/60 transition-colors last:border-0 hover:bg-[#12294D]/60 ${
                    selected.has(v.id) ? "bg-[#12294D]/60" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(v.id)}
                      onChange={() => toggle(v.id)}
                      aria-label={`Select ${v.title}`}
                      className="h-4 w-4 shrink-0 accent-[#FFCC00]"
                    />
                  </td>
                  <td className="px-4 py-3">
                      <img
                        src={v.image}
                        alt=""
                        className="h-10 w-14 rounded-md object-cover"
                        loading="lazy"
                      />
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <span className="line-clamp-2 font-medium text-[#F0F4FF]">{v.title}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-[#93A5C4]">
                      {v.id}
                      <br />
                      {v.agmId}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#93A5C4]">{v.category}</td>
                    <td className="px-4 py-3 text-xs text-[#93A5C4]">{v.location}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-[#FFCC00]">
                      {v.price}
                    </td>
                    <td className="px-4 py-3">
                      {brokerName(v.brokerId) ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-[#3A64C2]/40 bg-[#3A64C2]/15 px-2 py-0.5 text-[11px] font-semibold text-[#72AEE6]">
                          <Handshake size={11} />
                          {brokerName(v.brokerId)}
                        </span>
                      ) : (
                        <span className="text-xs text-[#6B7FA6]">Admin</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge published={v.published} />
                    </td>
                    <td className="px-4 py-3">
                      <RowActions v={v} onEdit={onEdit} onRefresh={onRefresh} onError={onError} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className={`divide-y divide-[#1B3465] md:hidden ${panelCls}`}>
            {visible.map((v) => (
              <li
                key={v.id}
                className={`flex gap-3 p-3 sm:p-4 ${selected.has(v.id) ? "bg-[#12294D]/60" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(v.id)}
                  onChange={() => toggle(v.id)}
                  aria-label={`Select ${v.title}`}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#FFCC00]"
                />
                <img
                  src={v.image}
                  alt=""
                  className="h-16 w-20 shrink-0 rounded-lg object-cover sm:h-20 sm:w-28"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-medium text-[#F0F4FF]">{v.title}</p>
                    <StatusBadge published={v.published} />
                  </div>
                  <p className="mt-1 truncate text-xs tabular-nums text-[#93A5C4]">
                    {v.id} · {v.agmId}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#93A5C4]">
                    {v.category} · {v.location}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#93A5C4]">
                    Broker:{" "}
                    <span className={brokerName(v.brokerId) ? "text-[#72AEE6]" : ""}>
                      {brokerName(v.brokerId) ?? "Admin"}
                    </span>
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#FFCC00]">{v.price}</span>
                    <RowActions v={v} onEdit={onEdit} onRefresh={onRefresh} onError={onError} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function RowActions({
  v,
  onEdit,
  onRefresh,
  onError,
}: {
  v: AdminVessel;
  onEdit: (v: AdminVessel) => void;
  onRefresh: () => Promise<void>;
  onError: (t: string) => void;
}) {
  const base =
    "rounded-lg border border-[#1B3465] p-2 text-[#93A5C4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50";
  return (
    <div className="flex shrink-0 gap-1.5">
      <button
        className={`${base} hover:border-[#3A64C2] hover:bg-[#12294D] hover:text-[#72AEE6]`}
        onClick={() => onEdit(v)}
        title="Edit"
        aria-label={`Edit ${v.title}`}
      >
        <Pencil size={14} />
      </button>
      <button
        className={`${base} ${
          v.published
            ? "hover:border-[#FBBF24]/50 hover:bg-[#FBBF24]/10 hover:text-[#FBBF24]"
            : "hover:border-[#4ADE80]/50 hover:bg-[#4ADE80]/10 hover:text-[#4ADE80]"
        }`}
        title={v.published ? "Unpublish" : "Publish"}
        aria-label={`${v.published ? "Unpublish" : "Publish"} ${v.title}`}
        onClick={async () => {
          try {
            await setVesselPublished(v.id, !v.published);
            await onRefresh();
          } catch (err) {
            onError(readableFirestoreError(err));
          }
        }}
      >
        {v.published ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
      <button
        className={`${base} hover:border-[#F87171]/50 hover:bg-[#F87171]/10 hover:text-[#F87171]`}
        title="Delete"
        aria-label={`Delete ${v.title}`}
        onClick={async () => {
          if (!window.confirm(`Delete "${v.title}"? This cannot be undone.`)) return;
          try {
            await deleteVessel(v.id);
            await onRefresh();
          } catch (err) {
            onError(readableFirestoreError(err));
          }
        }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ brokers */

function BrokersView({
  brokers,
  vessels,
  onDelete,
  onError,
}: {
  brokers: Broker[];
  vessels: AdminVessel[];
  onDelete: (id: string) => Promise<void>;
  onError: (t: string) => void;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const rows = brokers
    .map((b) => ({ broker: b, linked: vessels.filter((v) => v.brokerId === b.id) }))
    .sort((a, b) => b.linked.length - a.linked.length || a.broker.name.localeCompare(b.broker.name));

  const activeCount = rows.filter((r) => r.linked.length > 0).length;

  return (
    <div className="space-y-4">
      <div className={`${panelCls} p-4`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3A64C2]/15 text-[#72AEE6]">
            <Handshake size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#F0F4FF]">
              {activeCount} broker{activeCount === 1 ? "" : "s"} with listings
            </p>
            <p className="text-xs text-[#93A5C4]">
              Broker names, ownership and contacts are visible to admins only — never on the public site.
            </p>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className={`${panelCls} px-6 py-12 text-center`}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#3A64C2]/15 text-[#72AEE6]">
            <Handshake size={22} />
          </div>
          <p className="mt-4 font-medium text-[#F0F4FF]">No brokers yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[#93A5C4]">
            When you list a third-party vessel, fill in the broker name and contact on the Add
            New form — the broker and their listings will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className={`hidden md:block ${panelCls}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1B3465] bg-[#050F24]/60">
                  {["Broker", "Contact details", "Vessels listed", "Actions"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#93A5C4]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ broker, linked }) => (
                  <tr
                    key={broker.id}
                    className="border-b border-[#1B3465]/60 transition-colors last:border-0 hover:bg-[#12294D]/60"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-[#3A64C2]/40 bg-[#3A64C2]/15 px-2 py-1 text-xs font-semibold text-[#72AEE6]">
                          <Handshake size={11} className="mr-1 inline" />
                          {broker.name}
                        </span>
                        {linked.length === 0 && (
                          <span className="text-[11px] text-[#6B7FA6]">no listings</span>
                        )}
                      </div>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-xs leading-relaxed text-[#93A5C4]">
                      {broker.phone || broker.email || broker.address ? (
                        <div className="space-y-0.5">
                          {broker.phone && <p className="truncate">Phone: {broker.phone}</p>}
                          {broker.email && <p className="truncate">Email: {broker.email}</p>}
                          {broker.address && <p className="line-clamp-2">Address: {broker.address}</p>}
                        </div>
                      ) : (
                        <span className="text-[#6B7FA6]">Not provided</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {linked.length === 0 ? (
                        <span className="text-xs text-[#6B7FA6]">—</span>
                      ) : (
                        <ul className="space-y-1">
                          {linked.map((v) => (
                            <li key={v.id} className="flex items-center gap-2 text-xs text-[#F0F4FF]">
                              <span className="tabular-nums text-[#93A5C4]">{v.agmId}</span>
                              <span className="truncate">{v.title}</span>
                              <StatusBadge published={v.published} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        disabled={deleting === broker.id}
                        onClick={async () => {
                          const label =
                            linked.length > 0
                              ? `Delete ${broker.name}? Their ${linked.length} listing${linked.length === 1 ? " becomes" : "s become"} admin-owned.`
                              : `Delete ${broker.name}?`;
                          if (!window.confirm(label)) return;
                          setDeleting(broker.id);
                          try {
                            await onDelete(broker.id);
                          } catch (err) {
                            onError(readableFirestoreError(err));
                          } finally {
                            setDeleting(null);
                          }
                        }}
                        className="rounded-lg border border-[#1B3465] p-2 text-[#93A5C4] transition-colors hover:border-[#F87171]/50 hover:bg-[#F87171]/10 hover:text-[#F87171] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50 disabled:opacity-60"
                        title="Delete broker"
                        aria-label={`Delete broker ${broker.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className={`divide-y divide-[#1B3465] md:hidden ${panelCls}`}>
            {rows.map(({ broker, linked }) => (
              <li key={broker.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-[#3A64C2]/40 bg-[#3A64C2]/15 px-2 py-1 text-xs font-semibold text-[#72AEE6]">
                      <Handshake size={11} className="mr-1 inline" />
                      {broker.name}
                    </span>
                  </div>
                  <button
                    disabled={deleting === broker.id}
                    onClick={async () => {
                      const label =
                        linked.length > 0
                          ? `Delete ${broker.name}? Their ${linked.length} listing${linked.length === 1 ? " becomes" : "s become"} admin-owned.`
                          : `Delete ${broker.name}?`;
                      if (!window.confirm(label)) return;
                      setDeleting(broker.id);
                      try {
                        await onDelete(broker.id);
                      } catch (err) {
                        onError(readableFirestoreError(err));
                      } finally {
                        setDeleting(null);
                      }
                    }}
                    className="rounded-lg border border-[#1B3465] p-2 text-[#93A5C4] transition-colors hover:border-[#F87171]/50 hover:text-[#F87171] disabled:opacity-60"
                    aria-label={`Delete broker ${broker.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="mt-2 space-y-0.5 text-sm text-[#93A5C4]">
                  {broker.phone || broker.email || broker.address ? (
                    <>
                      {broker.phone && <p className="truncate">Phone: {broker.phone}</p>}
                      {broker.email && <p className="truncate">Email: {broker.email}</p>}
                      {broker.address && <p className="line-clamp-2">Address: {broker.address}</p>}
                    </>
                  ) : (
                    <p className="text-[#6B7FA6]">Contact details not provided</p>
                  )}
                </div>
                {linked.length === 0 ? (
                  <p className="mt-2 text-xs text-[#6B7FA6]">No listings currently.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {linked.map((v) => (
                      <li key={v.id} className="flex items-center gap-2 text-sm">
                        <span className="tabular-nums text-[#93A5C4]">{v.agmId}</span>
                        <span className="min-w-0 flex-1 truncate text-[#F0F4FF]">{v.title}</span>
                        <StatusBadge published={v.published} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ form */

function VesselForm({
  vessel,
  categories,
  brokers,
  onClose,
  onSaved,
  onError,
  save,
}: {
  vessel: AdminVessel;
  categories: string[];
  brokers: Broker[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (t: string) => void;
  save: (v: AdminVessel) => Promise<void>;
}) {
  const [draft, setDraft] = useState<AdminVessel>(vessel);
  const [busy, setBusy] = useState(false);
  // Remarks are edited as free text (one per line) so Enter behaves normally,
  // then split into an array on save.
  const [remarksText, setRemarksText] = useState((vessel.remarks ?? []).join("\n"));
  // Broker identity lives in the admin-only `brokers` collection; the vessel
  // only ever carries an opaque id. Prefill the fields from that record.
  const existingBroker = vessel.brokerId
    ? brokers.find((b) => b.id === vessel.brokerId)
    : undefined;
  const [brokerName, setBrokerName] = useState(existingBroker?.name ?? "");
  const [brokerPhone, setBrokerPhone] = useState(existingBroker?.phone ?? "");
  const [brokerEmail, setBrokerEmail] = useState(existingBroker?.email ?? "");
  const [brokerAddress, setBrokerAddress] = useState(existingBroker?.address ?? "");

  const set = <K extends keyof AdminVessel>(key: K, value: AdminVessel[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setSpec = (i: number, value: string) =>
    setDraft((d) => ({ ...d, specs: d.specs.map((s, idx) => (idx === i ? { ...s, value } : s)) }));

  const setParticular = (i: number, key: "label" | "value", value: string) =>
    setDraft((d) => ({
      ...d,
      particulars: (d.particulars ?? []).map((p, idx) =>
        idx === i ? { ...p, [key]: value } : p,
      ),
    }));

  const addParticular = () =>
    setDraft((d) => ({ ...d, particulars: [...(d.particulars ?? []), { label: "", value: "" }] }));

  const removeParticular = (i: number) =>
    setDraft((d) => ({ ...d, particulars: (d.particulars ?? []).filter((_, idx) => idx !== i) }));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm">
      <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          role="dialog"
          aria-modal="true"
          aria-label={draft.title ? `Edit vessel ${draft.agmId}` : `Add vessel ${draft.agmId}`}
          className="flex w-full max-w-3xl flex-col border border-[#1B3465] bg-[#0B1E3D] shadow-[0_32px_80px_rgba(0,0,0,0.6)] sm:rounded-2xl"
        >
          <header className="flex items-center justify-between border-b border-[#1B3465] px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7FA6]">
                {draft.title ? "Edit vessel" : "New vessel"}
              </p>
              <h2 className="truncate text-sm font-semibold text-[#F0F4FF]">{draft.agmId}</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close form"
              className="rounded-lg p-2 text-[#93A5C4] transition-colors hover:bg-[#12294D] hover:text-[#F0F4FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50"
            >
              <X size={18} />
            </button>
          </header>

          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
            <Field label="Title" wide value={draft.title} onChange={(v) => set("title", v)} />
            <Field label="Category">
              <select
                value={draft.category}
                onChange={(e) => set("category", e.target.value)}
                className={selectCls}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Sector">
              <select
                value={draft.sector}
                onChange={(e) => set("sector", e.target.value)}
                className={selectCls}
              >
                {["For sale", "For charter", "For sale or charter"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Location" value={draft.location} onChange={(v) => set("location", v)} />
            <Field label="Price" value={draft.price} onChange={(v) => set("price", v)} />
            <Field label="Image URL" wide value={draft.image} onChange={(v) => set("image", v)} />
            <Field label="Summary" wide value={draft.summary} onChange={(v) => set("summary", v)} />
            <Field
              label="Description"
              wide
              value={draft.description}
              onChange={(v) => set("description", v)}
            />
            {draft.specs.map((s, i) => (
              <Field key={s.label} label={s.label} value={s.value} onChange={(v) => setSpec(i, v)} />
            ))}

            <div className="rounded-lg border border-[#1B3465] bg-[#050F24] p-3 sm:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-[#93A5C4]">Additional particulars</span>
                <button
                  type="button"
                  onClick={addParticular}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[#FFCC00] transition-colors hover:bg-[#12294D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50"
                >
                  <Plus size={13} />
                  Add row
                </button>
              </div>
              {(draft.particulars ?? []).length === 0 ? (
                <p className="text-xs text-[#6B7FA6]">
                  None yet. Add a row for tonnage, builder, flag, cargo tanks, hull, main engine, etc.
                </p>
              ) : (
                <div className="space-y-2">
                  {(draft.particulars ?? []).map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={p.label}
                        onChange={(e) => setParticular(i, "label", e.target.value)}
                        placeholder="Label (e.g. Gross Tonnage)"
                        className={inputCls}
                      />
                      <input
                        value={p.value}
                        onChange={(e) => setParticular(i, "value", e.target.value)}
                        placeholder="Value (e.g. 8,560)"
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={() => removeParticular(i)}
                        aria-label={`Remove ${p.label || "particular"}`}
                        className="shrink-0 rounded-lg border border-[#1B3465] p-2 text-[#93A5C4] transition-colors hover:border-[#F87171] hover:text-[#F87171] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Field label="Full description" wide>
              <textarea
                rows={4}
                value={draft.details ?? ""}
                onChange={(e) => set("details", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Remarks (one per line)" wide>
              <textarea
                rows={3}
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Contact (optional)" value={draft.contact ?? ""} onChange={(v) => set("contact", v)} />

            <div className="rounded-lg border border-[#1B3465] bg-[#050F24] p-3 sm:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-medium text-[#93A5C4]">
                  <Handshake size={14} className="text-[#72AEE6]" />
                  Broker (admin-only)
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Broker business name" value={brokerName} onChange={setBrokerName} />
                <Field label="Broker phone number" value={brokerPhone} onChange={setBrokerPhone} />
                <Field label="Broker email" value={brokerEmail} onChange={setBrokerEmail} />
                <Field label="Broker address" value={brokerAddress} onChange={setBrokerAddress} />
              </div>
              <p className="mt-2 text-xs text-[#6B7FA6]">
                Leave the business name blank for AGMS-owned listings. If filled, the listing is
                attributed to the broker. All contact details are stored in the admin-only registry
                and never shown on the public site.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#1B3465] bg-[#050F24] px-4 py-3 text-sm font-medium text-[#F0F4FF] sm:col-span-2">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => set("published", e.target.checked)}
                className="h-4 w-4 shrink-0 accent-[#FFCC00]"
              />
              Published (visible on the public site)
            </label>
          </div>

          <footer className="sticky bottom-0 flex gap-2 border-t border-[#1B3465] bg-[#0B1E3D] px-4 py-3 sm:px-6">
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const brokerLabel = brokerName.trim();
                  const brokerId = brokerLabel
                    ? await resolveBrokerId(brokerLabel, brokerPhone.trim(), brokerEmail.trim(), brokerAddress.trim())
                    : "";
                  await save({
                    ...draft,
                    brokerId,
                    remarks: remarksText
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean),
                    particulars: (draft.particulars ?? [])
                      .map((p) => ({ label: p.label.trim(), value: p.value.trim() }))
                      .filter((p) => p.label || p.value),
                  });
                  await onSaved();
                } catch (err) {
                  onError(readableFirestoreError(err));
                } finally {
                  setBusy(false);
                }
              }}
              className={`${goldBtn} flex-1 justify-center sm:flex-none`}
            >
              {busy ? "Saving…" : "Save Vessel"}
            </button>
            <button onClick={onClose} className={`${ghostBtn} flex-1 justify-center sm:flex-none`}>
              Cancel
            </button>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  wide,
  children,
}: {
  label: string;
  value?: string;
  onChange?: (v: string) => void;
  wide?: boolean;
  children?: ReactNode;
}) {
  return (
    <label className={`block text-sm font-medium ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-[#93A5C4]">{label}</span>
      {children ?? (
        <input
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          className={inputCls}
        />
      )}
    </label>
  );
}

/* ---------------------------------------------------------------- sign in */

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  return (
    <div className="hero-mesh flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFCC00] shadow-[0_0_24px_rgba(255,204,0,0.3)]">
            <Ship size={22} className="text-[#092E6D]" />
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-semibold text-[#F0F4FF]">AGMS Admin</h1>
            <p className="text-xs text-[#93A5C4]">Sign in to manage vessel listings</p>
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setStatus(null);
            try {
              await signInAdmin(email.trim(), password);
            } catch (err) {
              setStatus({ kind: "err", text: readableAuthError(err) });
            } finally {
              setBusy(false);
            }
          }}
          className="space-y-4 rounded-2xl border border-white/10 bg-[#0B1E3D]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur"
        >
          <label className="block text-sm font-medium">
            <span className="mb-1.5 block text-[#93A5C4]">Email</span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="block text-sm font-medium">
            <span className="mb-1.5 block text-[#93A5C4]">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </label>
          {status && (
            <p
              role={status.kind === "err" ? "alert" : "status"}
              className={`rounded-lg border-l-4 px-3 py-2 text-sm ${
                status.kind === "err"
                  ? "border-[#F87171] bg-[#F87171]/10 text-[#FCA5A5]"
                  : "border-[#4ADE80] bg-[#4ADE80]/10 text-[#86EFAC]"
              }`}
            >
              {status.text}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-[#FFCC00] px-4 py-2.5 text-sm font-semibold text-[#092E6D] transition-all hover:bg-[#E6B800] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1E3D] active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!email.trim()) return setStatus({ kind: "err", text: "Enter your email first." });
              try {
                await sendAdminPasswordReset(email.trim());
                setStatus({ kind: "ok", text: "Password reset email sent." });
              } catch {
                setStatus({ kind: "err", text: "Could not send reset email." });
              }
            }}
            className="w-full text-center text-xs text-[#93A5C4] underline-offset-4 transition-colors hover:text-[#FFCC00] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50"
          >
            Forgot password?
          </button>
        </form>

        <Link
          to="/"
          className="mt-6 flex w-full items-center justify-center gap-1.5 text-xs text-[#93A5C4] transition-colors hover:text-[#FFCC00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]/50"
        >
          <ArrowLeft size={14} />
          Back to website
        </Link>
      </div>
    </div>
  );
}

function NotAnAdmin({
  email,
  detail,
  onSignOut,
}: {
  email: string | null;
  detail: string | null;
  onSignOut: () => void;
}) {
  return (
    <div className="hero-mesh flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0B1E3D]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur sm:p-8">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F87171]/15 text-[#F87171]">
          <X size={22} />
        </div>
        <h1 className="text-lg font-semibold text-[#F0F4FF]">Access denied</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#93A5C4]">
          <strong className="font-semibold text-[#F0F4FF]">{email}</strong> is signed in but is not
          an administrator.
        </p>
        {detail && (
          <p className="mt-3 rounded-lg border-l-4 border-[#F87171] bg-[#F87171]/10 px-3 py-2 text-xs text-[#FCA5A5]">
            {detail}
          </p>
        )}
        <button
          onClick={onSignOut}
          className={`${ghostBtn} mt-5 w-full justify-center`}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function readableAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (code.includes("invalid-credential") || code.includes("wrong-password"))
    return "Incorrect email or password.";
  if (code.includes("too-many-requests")) return "Too many attempts. Try again shortly.";
  if (code.includes("network-request-failed")) return "Network error. Check your connection.";
  return code ? `Sign-in failed (${code}).` : "Sign-in failed.";
}

function readableFirestoreError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("permission-denied") || msg.includes("missing-or-insufficient-permissions"))
    return "Permission denied by Firestore security rules.";
  if (msg.includes("failed-precondition") && msg.includes("index"))
    return "A Firestore index is required for this query.";
  return msg || "Firestore request failed.";
}
