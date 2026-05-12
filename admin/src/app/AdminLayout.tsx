import { Building2, FileText, Home, LayoutDashboard, LogOut, Menu, MessageSquare, Users } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { clearAuth, getAuthUser } from "@/services/authStorage";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contacts", label: "Khách tư vấn", icon: MessageSquare },
  { to: "/projects", label: "Dự án", icon: Building2 },
  { to: "/apartments", label: "Căn hộ", icon: Home },
  { to: "/posts", label: "Bài viết", icon: FileText },
  { to: "/users", label: "Nhân sự", icon: Users },
];

const roleLabels: Record<string, string> = {
  admin: "Quản lý",
  editor: "Nhân viên",
  viewer: "Chỉ xem",
};

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
            <div className="brand-subtitle">Cổng nội bộ</div>
          </div>
        </div>

        <nav className="nav-list" aria-label="Điều hướng nội bộ">
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
            <div className="topbar-title">AMG Land CMS</div>
            <div className="topbar-subtitle">Quản lý kinh doanh và nội dung</div>
          </div>
          <div className="topbar-actions">
            <div className="user-chip">
              <span>{user?.full_name ?? "Người dùng"}</span>
              <strong>{user?.role ? roleLabels[user.role] : "Nội bộ"}</strong>
            </div>
            <button className="secondary-button" type="button" onClick={handleLogout}>
              <LogOut size={16} />
              Đăng xuất
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
