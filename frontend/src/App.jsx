import { Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout.jsx";
import {
  ApprovedTrainerRoute,
  ProtectedRoute,
  RoleRoute,
} from "./components/Routes.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { LoginPage, RegisterPage } from "./pages/AuthPages.jsx";
import { AdminDashboardPage } from "./pages/AdminDashboardPage.jsx";
import { AdminCertificationsPage } from "./pages/AdminCertificationsPage.jsx";
import { AdminCommissionsPage } from "./pages/AdminCommissionsPage.jsx";
import { AdminModerationPage } from "./pages/AdminModerationPage.jsx";
import { AdminPaymentsPage } from "./pages/AdminPaymentsPage.jsx";
import { AdminReportsPage } from "./pages/AdminReportsPage.jsx";
import { AdminUsersPage } from "./pages/AdminUsersPage.jsx";
import { ChatPage } from "./pages/ChatPage.jsx";
import { ClientDashboardPage } from "./pages/ClientDashboardPage.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { MarketplacePage } from "./pages/MarketplacePage.jsx";
import { MyTurnsPage } from "./pages/MyTurnsPage.jsx";
import { TrainerPortalPage } from "./pages/TrainerPortalPage.jsx";
import { TrainerCertificationsPage } from "./pages/TrainerCertificationsPage.jsx";
import { TrainerAvailabilityPage } from "./pages/TrainerAvailabilityPage.jsx";
import { TrainerDashboardPage } from "./pages/TrainerDashboardPage.jsx";
import { TrainerPaymentsPage } from "./pages/TrainerPaymentsPage.jsx";
import { TrainerProfessionalProfilePage } from "./pages/TrainerProfessionalProfilePage.jsx";
import { TrainerProfilePage } from "./pages/TrainerProfilePage.jsx";
import { TrainerReportsPage } from "./pages/TrainerReportsPage.jsx";
import { TrainerRequestsPage } from "./pages/TrainerRequestsPage.jsx";
import { TrainerTurnsPage } from "./pages/TrainerTurnsPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function DashboardHome() {
  const { user } = useAuth();
  return user?.roles.includes("Administrador")
    ? <AdminDashboardPage />
    : <ClientDashboardPage />;
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/registro" />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            element={
              <RoleRoute roles={["Cliente"]}>
                <MarketplacePage />
              </RoleRoute>
            }
            path="/entrenadores"
          />
          <Route
            element={
              <RoleRoute roles={["Cliente"]}>
                <TrainerProfilePage />
              </RoleRoute>
            }
            path="/entrenadores/:id"
          />
          <Route element={<DashboardHome />} path="/panel" />
          <Route
            element={
              <RoleRoute roles={["Administrador"]}>
                <AdminUsersPage />
              </RoleRoute>
            }
            path="/admin/usuarios"
          />
          <Route
            element={
              <RoleRoute roles={["Administrador"]}>
                <AdminCertificationsPage />
              </RoleRoute>
            }
            path="/admin/certificaciones"
          />
          <Route
            element={
              <RoleRoute roles={["Administrador"]}>
                <AdminModerationPage />
              </RoleRoute>
            }
            path="/admin/moderacion"
          />
          <Route
            element={
              <RoleRoute roles={["Administrador"]}>
                <AdminCommissionsPage />
              </RoleRoute>
            }
            path="/admin/comisiones"
          />
          <Route
            element={
              <RoleRoute roles={["Administrador"]}>
                <AdminPaymentsPage />
              </RoleRoute>
            }
            path="/admin/pagos"
          />
          <Route
            element={
              <RoleRoute roles={["Administrador"]}>
                <AdminReportsPage />
              </RoleRoute>
            }
            path="/admin/reportes"
          />
          <Route
            element={
              <RoleRoute roles={["Cliente"]}>
                <MyTurnsPage />
              </RoleRoute>
            }
            path="/turnos"
          />
          <Route
            element={
              <RoleRoute roles={["Cliente"]}>
                <TrainerPortalPage />
              </RoleRoute>
            }
            path="/portal-entrenador"
          />
          <Route
            element={
              <RoleRoute roles={["Cliente"]}>
                <TrainerProfessionalProfilePage />
              </RoleRoute>
            }
            path="/portal-entrenador/perfil"
          />
          <Route
            element={
              <RoleRoute roles={["Cliente"]}>
                <TrainerCertificationsPage />
              </RoleRoute>
            }
            path="/portal-entrenador/certificaciones"
          />
          <Route
            element={
              <ApprovedTrainerRoute>
                <TrainerRequestsPage />
              </ApprovedTrainerRoute>
            }
            path="/portal-entrenador/solicitudes"
          />
          <Route
            element={
              <ApprovedTrainerRoute>
                <TrainerTurnsPage />
              </ApprovedTrainerRoute>
            }
            path="/portal-entrenador/turnos"
          />
          <Route
            element={
              <ApprovedTrainerRoute>
                <TrainerAvailabilityPage />
              </ApprovedTrainerRoute>
            }
            path="/portal-entrenador/disponibilidad"
          />
          <Route
            element={
              <ApprovedTrainerRoute>
                <TrainerDashboardPage />
              </ApprovedTrainerRoute>
            }
            path="/portal-entrenador/dashboard"
          />
          <Route
            element={
              <ApprovedTrainerRoute>
                <TrainerPaymentsPage />
              </ApprovedTrainerRoute>
            }
            path="/portal-entrenador/pagos"
          />
          <Route
            element={
              <ApprovedTrainerRoute>
                <TrainerReportsPage />
              </ApprovedTrainerRoute>
            }
            path="/portal-entrenador/reportes"
          />
          <Route element={<ChatPage />} path="/mensajes" />
          <Route element={<Navigate replace to="/panel" />} path="/cuenta" />
        </Route>
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </AuthProvider>
  );
}
