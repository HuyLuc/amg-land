import { Building2, FileText, Home, LayoutDashboard, LogOut, Menu, MessageSquare, Users } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { clearAuth, getAuthUser } from "@/services/authStorage";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contacts", label: "Leads", icon: MessageSquare },
  { to: "/projects", label: "Du an", icon: Building2 },
  { to: "/apartments", label: "Can ho", icon: Home },
  { to: "/posts", label: "Bai viet", icon: FileText },
  { to: "/users", label: "Nhan su", icon: Users },
];

export function AdminLayout(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const user = getAuthUser();

  function handleLogout(): void {
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <div className="admin-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand-block">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">AMG Land</div>
            <div className="brand-subtitle">Admin CMS</div>
          </div>
        </div>

        <nav className="nav-list" aria-label="Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={() => setSidebarOpen(false)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button className="icon-button mobile-only" type="button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div>
            <div className="topbar-title">AMG Admin</div>
            <div className="topbar-subtitle">Quan ly kinh doanh va noi dung</div>
          </div>
          <div className="topbar-actions">
            <div className="user-chip">
              <span>{user?.full_name ?? "Admin"}</span>
              <strong>{user?.role ?? "admin"}</strong>
            </div>
            <button className="secondary-button" type="button" onClick={handleLogout}>
              <LogOut size={16} />
              Dang xuat
            </button>
          </div>
        </header>

        <main className="page-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
