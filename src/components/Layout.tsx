import { useEffect, useState } from "react";
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
  const closeMenu = () => setMobileOpen(false);

  // Bloquea el scroll de la pagina mientras el cajon esta abierto.
  // `overflow: hidden` en el body no alcanza en iOS Safari: el fondo sigue
  // "rebotando" un poco al tocar (rubber-banding), y eso es lo que hace
  // que la PWA muestre de nuevo la barra del navegador. La forma que
  // funciona de verdad es fijar el body en su posicion actual y restaurar
  // el scroll al cerrar.
  useEffect(() => {
    if (!mobileOpen) return;

    const scrollY = window.scrollY;
    const { body } = document;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.classList.add("no-scroll");

    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.classList.remove("no-scroll");
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  // Cerrar con Escape, como cualquier panel superpuesto.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <div className="app-shell">
      <aside className={`sidebar${mobileOpen ? " sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <Link to="/" className="logo-link" aria-label="Ir al inicio" onClick={closeMenu}>
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
              onClick={closeMenu}
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

      <div
        className={`sidebar-backdrop${mobileOpen ? " sidebar-backdrop-open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <div className="app-main">
        <div className="topbar">
          <span className="topbar-left">
            <button
              className="icon-btn"
              aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <Icon name="menu" size={20} />
            </button>
          </span>
          <Link to="/" className="logo-link" aria-label="Ir al inicio">
            <Logo size={40} />
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
