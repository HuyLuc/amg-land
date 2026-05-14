import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AdminLayout } from "@/app/AdminLayout";
import { ApartmentDetailPage } from "@/features/apartments/ApartmentDetailPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { ApartmentsPage } from "@/features/apartments/ApartmentsPage";
import { ContactsPage } from "@/features/contacts/ContactsPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { PostsPage } from "@/features/posts/PostsPage";
import { ProjectDetailPage } from "@/features/projects/ProjectDetailPage";
import { ProjectsPage } from "@/features/projects/ProjectsPage";
import { UsersPage } from "@/features/users/UsersPage";
import { clearAuth, getAuthUser, isAuthenticated, isInternalUser } from "@/services/authStorage";
import { canAccessPath, getDefaultPath } from "@/services/permissions";

function ProtectedRoute(): JSX.Element {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!isInternalUser(getAuthUser())) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
}

function RoleRoute({ children }: { children: JSX.Element }): JSX.Element {
  const location = useLocation();
  const user = getAuthUser();
  if (!canAccessPath(user?.role, location.pathname)) {
    return <Navigate to={getDefaultPath(user?.role)} replace />;
  }
  return children;
}

function RootRedirect(): JSX.Element {
  return <Navigate to={getDefaultPath(getAuthUser()?.role)} replace />;
}

export function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/dashboard" element={<RoleRoute><DashboardPage /></RoleRoute>} />
        <Route path="/contacts" element={<RoleRoute><ContactsPage /></RoleRoute>} />
        <Route path="/projects" element={<RoleRoute><ProjectsPage /></RoleRoute>} />
        <Route path="/projects/:slug" element={<RoleRoute><ProjectDetailPage /></RoleRoute>} />
        <Route path="/apartments" element={<RoleRoute><ApartmentsPage /></RoleRoute>} />
        <Route path="/apartments/:id" element={<RoleRoute><ApartmentDetailPage /></RoleRoute>} />
        <Route path="/posts" element={<RoleRoute><PostsPage /></RoleRoute>} />
        <Route path="/users" element={<RoleRoute><UsersPage /></RoleRoute>} />
      </Route>
    </Routes>
  );
}
