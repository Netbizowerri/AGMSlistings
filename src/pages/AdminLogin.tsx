import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import {
  Download,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Ship,
  Trash2,
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
  nextWbsId,
  seedVessels,
  setVesselPublished,
  updateVessel,
  type AdminVessel,
} from "../lib/vessels";
import { CATEGORY_LIST } from "../data/vessels";

type Status = { kind: "ok" | "err"; text: string } | null;
type View = "dashboard" | "vessels";

const SPEC_LABELS = ["Built", "LOA", "Beam", "Draft", "Power / capacity", "Class"];

/* WordPress admin palette */
const WP = {
  sidebar: "#1d2327",
  sidebarHover: "#2c3338",
  sidebarText: "#c3c4c7",
  canvas: "#f0f0f1",
  border: "#c3c4c7",
  muted: "#646970",
} as const;

function emptyDraft(id: string, wbsId: string): AdminVessel {
  return {
    id,
    wbsId,
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
  };
}

/* ------------------------------------------------------------------ gate */

export default function AdminLogin() {
  const { user, checking, isAdmin, detail } = useAdminSession();

  if (!firebaseConfigured) {
    return (
      <div className="min-h-screen px-4 py-10" style={{ background: WP.canvas }}>
        <div className="mx-auto max-w-lg rounded border bg-white p-6" style={{ borderColor: WP.border }}>
          <h1 className="text-xl font-semibold text-[#092E6D]">Admin setup required</h1>
          <p className="mt-3 text-sm" style={{ color: WP.muted }}>
            Firebase environment variables are missing. Copy{" "}
            <code className="rounded bg-neutral-200 px-1">.env.example</code> to{" "}
            <code className="rounded bg-neutral-200 px-1">.env.local</code>, fill in the Web app
            config, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: WP.canvas }}>
        <p className="text-sm" style={{ color: WP.muted }}>
          Checking session…
        </p>
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
          v.wbsId.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q) ||
          v.id.includes(q)),
    );
  }, [all, category, search]);

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
    setEditing(emptyDraft(await nextVesselId(), await nextWbsId()));
  };

  const menu: { key: View; label: string; icon: typeof Ship; count?: number }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "vessels", label: "Vessels", icon: Ship, count: stats.total },
  ];

  const sidebar = (
    <div
      className="flex h-full w-60 shrink-0 flex-col"
      style={{ background: WP.sidebar, color: WP.sidebarText }}
    >
      <div className="flex items-center gap-2 px-4 py-4">
        <Ship size={22} className="text-[#FFCC00]" />
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">AGMS Admin</p>
          <p className="text-[11px] text-neutral-400">Vessel Listings</p>
        </div>
      </div>

      <nav className="flex-1 px-2">
        <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
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
              className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm font-medium"
              style={{
                background: active ? WP.sidebarHover : "transparent",
                color: active ? "#72aee6" : WP.sidebarText,
                boxShadow: active ? "inset 3px 0 0 #72aee6" : "none",
              }}
            >
              <Icon size={16} />
              <span className="flex-1">{m.label}</span>
              {m.count !== undefined && (
                <span className="rounded bg-neutral-700 px-1.5 text-[11px] text-neutral-200">
                  {m.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-neutral-700 p-3">
        <p className="truncate text-[11px] text-neutral-400" title={user.email ?? ""}>
          Signed in as
          <span className="block truncate font-medium text-neutral-200">{user.email}</span>
        </p>
        <button
          onClick={async () => {
            if (!window.confirm("Sign out of the admin dashboard?")) return;
            await onSignOut();
          }}
          className="mt-2 flex w-full items-center gap-2 rounded px-2 py-2 text-sm font-medium hover:bg-[#2c3338]"
          style={{ color: WP.sidebarText }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: WP.canvas }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:block">
        <div className="fixed inset-y-0">{sidebar}</div>
      </aside>

      {/* Mobile drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setNavOpen(false)} />
          <div className="absolute inset-y-0 left-0">{sidebar}</div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header
          className="sticky top-0 z-30 flex items-center gap-3 border-b bg-white px-4 py-2.5"
          style={{ borderColor: WP.border }}
        >
          <button
            onClick={() => setNavOpen(true)}
            className="rounded border px-2 py-1 text-sm md:hidden"
            style={{ borderColor: WP.border }}
            aria-label="Open menu"
          >
            ☰
          </button>
          <h1 className="text-sm font-semibold text-[#1d2327]">
            {view === "dashboard" ? "Dashboard" : "Vessels"}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => void refresh()}
              className="flex items-center gap-1 rounded border px-2.5 py-1.5 text-sm"
              style={{ borderColor: WP.border, color: WP.muted }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              onClick={openNew}
              className="flex items-center gap-1 rounded bg-[#092E6D] px-3 py-1.5 text-sm font-medium text-white"
            >
              <Plus size={14} />
              Add New
            </button>
          </div>
        </header>

        <main className="p-4">
          {status && (
            <div
              className="mb-4 rounded border-l-4 px-3 py-2 text-sm"
              style={{
                background: status.kind === "err" ? "#fcf0f1" : "#edfaef",
                borderLeftColor: status.kind === "err" ? "#d63638" : "#00a32a",
                color: status.kind === "err" ? "#8a2424" : "#1a4d1f",
              }}
            >
              {status.text}
            </div>
          )}

          {loading ? (
            <p className="text-sm" style={{ color: WP.muted }}>
              Loading…
            </p>
          ) : view === "dashboard" ? (
            <DashboardHome stats={stats} vessels={all} onOpenVessels={() => setView("vessels")} />
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
  categories: [string, number][];
};

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
    <div className="rounded border bg-white p-4" style={{ borderColor: WP.border }}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded"
          style={{ background: "#f0f6fc", color: "#2271b1" }}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-semibold leading-none text-[#1d2327]">{value}</p>
          <p className="mt-1 text-xs" style={{ color: WP.muted }}>
            {label}
          </p>
        </div>
      </div>
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card label="Total Vessels" value={stats.total} icon={<Ship size={18} />} />
        <Card label="Categories" value={stats.categoryCount} icon={<LayoutDashboard size={18} />} />
        <Card label="Live Listings" value={stats.live} icon={<Eye size={18} />} />
        <Card label="Drafts" value={stats.drafts} icon={<EyeOff size={18} />} />
        <Card label="Locations" value={stats.locations} icon={<Search size={18} />} />
        <Card label="Sectors" value={stats.sectors} icon={<Download size={18} />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Categories" action={<button onClick={onOpenVessels} className="text-xs text-[#2271b1] hover:underline">
          Manage vessels
        </button>}>
          {stats.categories.length === 0 ? (
            <Empty>No listings yet.</Empty>
          ) : (
            <ul className="space-y-2">
              {stats.categories.map(([name, n]) => (
                <li key={name}>
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{name}</span>
                    <span style={{ color: WP.muted }}>{n}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded bg-neutral-200">
                    <div
                      className="h-1.5 rounded bg-[#2271b1]"
                      style={{ width: `${(n / max) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Latest Listings">
          {recent.length === 0 ? (
            <Empty>No listings yet.</Empty>
          ) : (
            <ul className="divide-y" style={{ borderColor: WP.border }}>
              {recent.map((v) => (
                <li key={v.id} className="flex items-center gap-3 py-2">
                  <img src={v.image} alt="" className="h-10 w-14 rounded object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{v.title}</p>
                    <p className="truncate text-xs" style={{ color: WP.muted }}>
                      {v.id} · {v.wbsId} · {v.category}
                    </p>
                  </div>
                  <span
                    className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                    style={
                      v.published
                        ? { background: "#edfaef", color: "#1a4d1f" }
                        : { background: "#fcf9e8", color: "#7d5c00" }
                    }
                  >
                    {v.published ? "Live" : "Draft"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded border bg-white" style={{ borderColor: WP.border }}>
      <header
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: WP.border }}
      >
        <h2 className="text-sm font-semibold text-[#1d2327]">{title}</h2>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="py-4 text-center text-sm" style={{ color: WP.muted }}>
      {children}
    </p>
  );
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
  onSeed: () => void;
  onAdd: () => void;
  onEdit: (v: AdminVessel) => void;
  onRefresh: () => Promise<void>;
  onError: (t: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded border bg-white p-3" style={{ borderColor: WP.border }}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, WBS, location…"
              className="w-64 rounded border py-1.5 pl-8 pr-3 text-sm"
              style={{ borderColor: WP.border }}
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded border px-2 py-1.5 text-sm"
            style={{ borderColor: WP.border }}
          >
            <option value="">All categories ({total})</option>
            {categories.map(([c, n]) => (
              <option key={c} value={c}>
                {c} ({n})
              </option>
            ))}
          </select>
          <button
            onClick={onSeed}
            disabled={seeding}
            className="flex items-center gap-1 rounded border px-2.5 py-1.5 text-sm disabled:opacity-60"
            style={{ borderColor: WP.border, color: WP.muted }}
          >
            <Download size={14} />
            {seeding ? "Importing…" : "Import missing"}
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-1 rounded bg-[#092E6D] px-3 py-1.5 text-sm font-medium text-white"
          >
            <Plus size={14} />
            Add New
          </button>
        </div>
        <p className="mt-2 text-xs" style={{ color: WP.muted }}>
          {visible.length} of {total} listings
        </p>
      </div>

      <div className="overflow-x-auto rounded border bg-white" style={{ borderColor: WP.border }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#f6f7f7" }}>
              {["Image", "Title", "ID / WBS", "Category", "Location", "Price", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="border-b px-3 py-2 text-left font-semibold"
                    style={{ borderColor: WP.border, color: "#1d2327" }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {visible.map((v) => (
              <tr key={v.id} className="hover:bg-[#f6f7f7]">
                <td className="border-b px-3 py-2" style={{ borderColor: WP.border }}>
                  <img src={v.image} alt="" className="h-10 w-14 rounded object-cover" loading="lazy" />
                </td>
                <td className="max-w-xs border-b px-3 py-2" style={{ borderColor: WP.border }}>
                  <span className="line-clamp-2 font-medium">{v.title}</span>
                </td>
                <td className="whitespace-nowrap border-b px-3 py-2 text-xs" style={{ borderColor: WP.border, color: WP.muted }}>
                  {v.id}
                  <br />
                  {v.wbsId}
                </td>
                <td className="border-b px-3 py-2 text-xs" style={{ borderColor: WP.border }}>
                  {v.category}
                </td>
                <td className="border-b px-3 py-2 text-xs" style={{ borderColor: WP.border }}>
                  {v.location}
                </td>
                <td className="whitespace-nowrap border-b px-3 py-2 text-xs" style={{ borderColor: WP.border }}>
                  {v.price}
                </td>
                <td className="border-b px-3 py-2" style={{ borderColor: WP.border }}>
                  <span
                    className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                    style={
                      v.published
                        ? { background: "#edfaef", color: "#1a4d1f" }
                        : { background: "#fcf9e8", color: "#7d5c00" }
                    }
                  >
                    {v.published ? "Live" : "Draft"}
                  </span>
                </td>
                <td className="border-b px-3 py-2" style={{ borderColor: WP.border }}>
                  <RowActions v={v} onEdit={onEdit} onRefresh={onRefresh} onError={onError} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visible.length === 0 && (
          <div className="p-8 text-center">
            <p className="font-medium text-[#092E6D]">No listings found</p>
            <p className="mt-1 text-sm" style={{ color: WP.muted }}>
              {total === 0
                ? "Import the existing catalogue, or add a listing manually."
                : "Try a different search or category."}
            </p>
            {total === 0 && (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={onSeed}
                  disabled={seeding}
                  className="rounded bg-[#092E6D] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {seeding ? "Importing…" : "Import existing catalogue"}
                </button>
                <button onClick={onAdd} className="rounded border px-4 py-2 text-sm" style={{ borderColor: WP.border }}>
                  Add vessel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
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
  const iconBtn =
    "rounded border p-1.5 text-[#646970] hover:bg-[#f0f0f1] hover:text-[#1d2327]";
  return (
    <div className="flex gap-1">
      <button className={iconBtn} style={{ borderColor: WP.border }} onClick={() => onEdit(v)} title="Edit">
        <Pencil size={14} />
      </button>
      <button
        className={iconBtn}
        style={{ borderColor: WP.border }}
        title={v.published ? "Unpublish" : "Publish"}
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
        className="rounded border p-1.5 text-[#d63638] hover:bg-[#fcf0f1]"
        style={{ borderColor: WP.border }}
        title="Delete"
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

/* ------------------------------------------------------------------ form */

function VesselForm({
  vessel,
  categories,
  onClose,
  onSaved,
  onError,
  save,
}: {
  vessel: AdminVessel;
  categories: string[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (t: string) => void;
  save: (v: AdminVessel) => Promise<void>;
}) {
  const [draft, setDraft] = useState<AdminVessel>(vessel);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof AdminVessel>(key: K, value: AdminVessel[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setSpec = (i: number, value: string) =>
    setDraft((d) => ({ ...d, specs: d.specs.map((s, idx) => (idx === i ? { ...s, value } : s)) }));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4" style={{ background: "rgba(0,0,0,.5)" }}>
      <div className="mx-auto my-6 max-w-3xl rounded border bg-white shadow-lg" style={{ borderColor: WP.border }}>
        <header
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: WP.border }}
        >
          <h2 className="text-sm font-semibold">
            {draft.title ? `Edit Vessel — ${draft.wbsId}` : `Add Vessel — ${draft.wbsId}`}
          </h2>
          <button onClick={onClose} className="text-xs" style={{ color: WP.muted }}>
            Close
          </button>
        </header>

        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Title" wide value={draft.title} onChange={(v) => set("title", v)} />
          <Field label="Category">
            <select
              value={draft.category}
              onChange={(e) => set("category", e.target.value)}
              className="mt-1 w-full rounded border px-2 py-1.5"
              style={{ borderColor: WP.border }}
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
              className="mt-1 w-full rounded border px-2 py-1.5"
              style={{ borderColor: WP.border }}
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
          <Field label="Description" wide value={draft.description} onChange={(v) => set("description", v)} />
          {draft.specs.map((s, i) => (
            <Field key={s.label} label={s.label} value={s.value} onChange={(v) => setSpec(i, v)} />
          ))}
          <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            Published (visible on the public site)
          </label>
        </div>

        <footer className="flex gap-2 border-t px-4 py-3" style={{ borderColor: WP.border }}>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await save(draft);
                await onSaved();
              } catch (err) {
                onError(readableFirestoreError(err));
              } finally {
                setBusy(false);
              }
            }}
            className="rounded bg-[#092E6D] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save Vessel"}
          </button>
          <button onClick={onClose} className="rounded border px-4 py-2 text-sm" style={{ borderColor: WP.border }}>
            Cancel
          </button>
        </footer>
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
      {label}
      {children ?? (
        <input
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="mt-1 w-full rounded border px-2 py-1.5"
          style={{ borderColor: WP.border }}
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

  const input = "mt-1 w-full rounded border px-3 py-2";

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: WP.sidebar }}>
      <div className="w-full max-w-sm rounded border bg-white p-6" style={{ borderColor: WP.border }}>
        <div className="mb-5 flex items-center gap-2">
          <Ship size={24} className="text-[#092E6D]" />
          <div>
            <h1 className="text-base font-semibold text-[#092E6D]">AGMS Admin</h1>
            <p className="text-xs" style={{ color: WP.muted }}>
              Sign in to manage vessel listings
            </p>
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
          className="space-y-3"
        >
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
              style={{ borderColor: WP.border }}
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
              style={{ borderColor: WP.border }}
            />
          </label>
          {status && (
            <p className={`text-sm ${status.kind === "err" ? "text-red-700" : "text-green-700"}`}>
              {status.text}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded bg-[#092E6D] px-4 py-2 font-medium text-white disabled:opacity-60"
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
            className="w-full text-xs underline"
            style={{ color: WP.muted }}
          >
            Forgot password?
          </button>
        </form>
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
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: WP.canvas }}>
      <div className="w-full max-w-sm rounded border bg-white p-6" style={{ borderColor: WP.border }}>
        <h1 className="text-base font-semibold text-[#092E6D]">Access denied</h1>
        <p className="mt-2 text-sm" style={{ color: WP.muted }}>
          <strong>{email}</strong> is signed in but is not an administrator.
        </p>
        {detail && (
          <p className="mt-2 rounded bg-[#fcf0f1] px-2 py-1 text-xs text-[#8a2424]">{detail}</p>
        )}
        <button onClick={onSignOut} className="mt-4 rounded border px-4 py-2 text-sm" style={{ borderColor: WP.border }}>
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