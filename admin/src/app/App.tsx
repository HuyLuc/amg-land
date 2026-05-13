import { Navigate, Route, Routes } from "react-router-dom";

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
import { isAuthenticated } from "@/services/authStorage";

function ProtectedRoute(): JSX.Element {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
}

export function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/apartments" element={<ApartmentsPage />} />
        <Route path="/apartments/:id" element={<ApartmentDetailPage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Route>
    </Routes>
  );
}
