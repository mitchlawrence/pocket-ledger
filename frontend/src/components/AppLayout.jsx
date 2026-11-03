import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/transactions", label: "Transactions" },
  { to: "/categories", label: "Categories" },
  { to: "/account", label: "Account" },
];

function linkClass({ isActive }) {
  return `rounded-md px-3 py-1.5 text-sm transition-colors ${
    isActive ? "bg-ink-700 text-mist-100" : "text-mist-300 hover:text-mist-100"
  }`;
}

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-700 bg-ink-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold uppercase tracking-wide text-leaf-400">
              Pocket Ledger
            </span>
            <nav className="flex items-center gap-1" aria-label="Main">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={linkClass}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-mist-300 sm:inline">
              {user.name}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-ink-600 px-3 py-1.5 text-sm text-mist-100 transition-colors hover:border-leaf-500 hover:text-leaf-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
