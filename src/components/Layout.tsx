import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { Credit } from "./Credit";

const NAV_ITEMS = [
  { to: "/", label: "Inicio", end: true, icon: "home" as const },
  { to: "/buscar", label: "Buscar", end: false, icon: "search" as const },
  { to: "/songbooks", label: "Cancioneros", end: false, icon: "library" as const },
  { to: "/admin", label: "Administrar", end: false, icon: "tune" as const },
];

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <aside className="sidebar" style={{ display: mobileOpen ? "flex" : undefined }}>
        <div className="sidebar-logo">
          <Link to="/" className="logo-link" aria-label="Ir al inicio" onClick={() => setMobileOpen(false)}>
            <Logo size={44} />
          </Link>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon name={item.icon} size={20} className="nav-icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <p className="sidebar-tagline">Cancionero digital para la alabanza</p>
          <Credit />
        </div>
      </aside>

      <div className="app-main">
        <div className="topbar">
          <span className="topbar-left">
            <button className="icon-btn" aria-label="Abrir menu" onClick={() => setMobileOpen((v) => !v)}>
              <Icon name="menu" size={20} />
            </button>
          </span>
          <Link to="/" className="logo-link" aria-label="Ir al inicio">
            <Logo size={30} />
          </Link>
          <span className="topbar-right" style={{ width: 36 }} />
        </div>
        <main className="main">
          <Outlet />
          {/* En movil la barra lateral no existe, asi que el credito vive aca. */}
          <Credit className="credit-mobile" />
        </main>
      </div>
    </div>
  );
}
